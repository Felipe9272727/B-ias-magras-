#!/usr/bin/env python3
"""Interrogatório das IAs: gera as vozes no ElevenLabs v4 e escreve remotion/public/<saida> (padrão timeline_int.json).
(Cópia do build_timeline_au4.py: vozes em voice_int, uma voz por IA; pensamentos ('pensa:<ia>') com eco, nunca sussurro;
os logs dos casos de interrogatorio/logs em data.casos.)
Uso: python3 build_timeline_int.py [--only c101,c102] [--sem-voz] [--contar]
Parte 2: python3 build_timeline_int.py --roteiro roteiro_int2 --logs logs2 --voz voice_int2 --saida timeline_int2.json
  (com --logs logs2: logs da parte 1 entram como p1_<caso>, pronúncias novas só na voz, letras CJK fora da voz,
   e a cena estica até o último meme/selo terminar)
"""
import argparse
import base64
import concurrent.futures as cf
import hashlib
import shutil
import os
import threading
import urllib.error
import importlib.util
import json
import re
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'remotion' / 'public'
VOZ = PUBLIC / 'voice_int'
LOGS = ROOT.parent / 'amongus' / 'logs4'  # (só para data.skins, sem uso aqui)
LOGS_INT = ROOT.parent / 'interrogatorio' / 'logs'
ROTEIRO = 'roteiro_int'
FPS = 30

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline as bt  # noqa: E402

MODELO = 'eleven_v4'
AJUSTES = {'stability': 0.5, 'similarity_boost': 0.75}
NARRADOR = 'lvkgCBi6spByiTZMPJEK'  # Gabriel
VOZES = {  # uma voz por IA
    'gpt': 'dX7gRq1dIvLTgUaWpEFn',  # Rafael Valente
    'claude': 'GDzHdQOi6jjf8zaXhCYD',  # Raquel
    'deepseek': 'YbP0Eq5RE5uOoCEl7F3T',  # Weverton
    'glm': 'bJrNspxJVFovUxNBQ0wh',  # Marcelo Costa
    'minimax': 'ohZOfA9iwlZ5nOsoY7LB',  # Roberta
    'qwen': '7lu3ze7orhWaNeSPowWx',  # Lucas
}


def voz_de(quem):
    """'gpt' fala; 'pensa:gpt' é pensamento (mesma voz, com eco: regra do canal, nunca sussurro)."""
    return VOZES[quem.split(':')[-1]]

# pronúncia só para a voz; a legenda mostra o texto original
bt.PRONUNCIA = {
    'Haiku': 'Raicu', 'Haikus': 'Raicus', 'Haiku,': 'Raicu,',
    'Among': 'Amông', 'Us': 'Âs', 'GPT': 'GêPêTê', 'Grok': 'Gróqui', 'Mistral': 'Mistrál', 'MiniMax': 'Mini Mécs', 'GLM': 'Gê Éle Ême', 'DeepSeek': 'Dípsíque', 'Luna': 'Lúna', 'Flash': 'Fléch', 'Bordo': 'Bórdô', 'Gemini': 'Djêmini', 'Opus': 'Ópus', 'OpenRouter': 'Ôpen Ráuter', 'Skeld': 'Squéld', 'Qwen': 'Cuên', 'FAMILIAGMS': 'Família Gê Ême Ésse', 'Polus': 'Pólus', 'Ministral': 'Ministrál', 'tokens': 'tôkens', 'kkk': 'cá cá cá',
}
bt.LEGENDA = [('treze centavos', '13 centavos'), ('vinte e oito', '28'), ('vinte e duas', '22'), ('cem por cento', '100%'), ('quase dois mil', 'quase 2.000')]
bt.TERMOS = {'Anthropic', 'Skeld', 'tokens', 'JSON'}

# PARTE 2 (19/11): pronúncias e legendas novas, só ligadas com --logs logs2 (não muda o hash das vozes da parte 1)
PRONUNCIA_P2 = {
    'K-pop': 'quêi pópi', 'wi-fi': 'uai fai', 'Wi-Fi': 'uai fai', 'Cheddar': 'Chédar', "Cheddar'": "Chédar'", 'cheddar': 'chédar',
    '4º': 'quarto', 'smoothie': 'smúdi', 'silent': 'sáilent', 'WhatsApp': 'Uótsapi', 'LED': 'léd', 'BPM': 'bê pê éme',
    'Fifi': 'Fifí', "'Fifi'": 'Fifí', '2h': 'duas', '3h': 'três',
}
LEGENDA_P2 = [('cento e quatro', '104'), ('noventa e nove', '99'), ('quarenta', '40')]
# o MiniMax soltou letras em coreano/chinês no meio da fala (papagaio S1): o balão mostra o original, a voz pula
CJK = re.compile(r'[\u1100-\u11ff\u2e80-\u2fdf\u3040-\u30ff\u3130-\u318f\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uf900-\ufaff]+')


def limpar_voz(txt):
    """Texto de IA para o TTS: sem os caracteres coreanos/chineses (a voz não lê lixo); o resto fica igual."""
    if not CJK.search(txt):
        return txt
    t = CJK.sub('', txt)
    t = re.sub(r'\s+([.,!?;:])', r'\1', t)
    t = re.sub(r',\.', '.', t)
    t = re.sub(r'\.\s*\.\.\.', '...', t)
    return re.sub(r'\s{2,}', ' ', t).strip()


def tempo_selo(texto):
    """Selo = tempo de leitura (regra do AGE): 0,9 s + 0,3 s por palavra, entre 1,6 e 3 s."""
    n = len([w for w in texto.split() if re.search(r'\w', w)])
    return min(3.0, max(1.6, 0.9 + 0.3 * n))


def chave():
    # 19/11: a chave vem do ambiente ou do mod chaves-ias (conta nova 'elevenlabs2' primeiro), como no AU8
    import glob as _g
    k = os.environ.get('ELEVENLABS_API_KEY')
    if k:
        return k
    for nome in ('elevenlabs2', 'elevenlabs'):
        for f in _g.glob('/root/.claude/plugins/store/chaves-ias*.json'):
            v = json.loads(Path(f).read_text())
            for d in (v, v.get('data', {}), v.get('values', {})):
                if isinstance(d, dict) and d.get(nome):
                    return d[nome]
    old = Path.home() / '.config' / 'elevenlabs' / 'api_key'
    if old.exists():
        return old.read_text().strip()
    raise SystemExit('SEM CHAVE do ElevenLabs')


_INDICE = None
SEM_COTA = threading.Event()
SO_CONTAR = False
FALTA = []
ANTECIPA = 0.0  # parte 2: 0,6 s (meme do fim da fala entra na última palavra)


def _indice_vozes():
    global _INDICE
    if _INDICE is None:
        _INDICE = {}
        for w in VOZ.glob('*.words.json'):
            try:
                _INDICE.setdefault(json.loads(w.read_text()).get('hash'), w)
            except Exception:  # noqa: BLE001
                pass
    return _INDICE


def tts(texto, voz, base):
    """Gera base.mp3 e base.words.json (com cache por hash). Devolve (palavras, duração)."""
    mp3, wj = base.with_suffix('.mp3'), base.with_suffix('.words.json')
    h = hashlib.sha1(json.dumps([texto, voz, MODELO, AJUSTES]).encode()).hexdigest()
    if mp3.exists() and wj.exists():
        d = json.loads(wj.read_text())
        if d.get('hash') == h:
            return d['words'], d['dur']
    # mesma fala (texto + voz) já gerada com outro nome (a cena mudou de posição): copia, não gasta crédito
    achado = _indice_vozes().get(h)
    if achado and achado.with_suffix('.mp3').exists():
        shutil.copyfile(achado.with_suffix('.mp3'), mp3)
        shutil.copyfile(achado, wj)
        d = json.loads(wj.read_text())
        return d['words'], d['dur']
    if SO_CONTAR:
        FALTA.append(len(texto))
        return [], max(0.6, len(texto) / 15)
    if SEM_COTA.is_set():
        raise SystemExit('SEM_COTA')
    body = json.dumps({'text': texto, 'model_id': MODELO, 'voice_settings': AJUSTES}).encode()
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{voz}/with-timestamps?output_format=mp3_44100_128'
    for tentativa in range(8):
        try:
            req = urllib.request.Request(url, data=body, headers={'xi-api-key': chave(), 'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=180) as r:
                d = json.loads(r.read())
            break
        except Exception as e:  # noqa: BLE001
            corpo = ''
            if isinstance(e, urllib.error.HTTPError):
                try:
                    corpo = e.read().decode('utf-8', 'replace')
                except Exception:  # noqa: BLE001
                    pass
            # cota esgotada: para tudo na hora (o que já foi gerado fica no cache)
            if 'quota' in corpo.lower() or (isinstance(e, urllib.error.HTTPError) and e.code in (401, 402) and 'credit' in corpo.lower()):
                SEM_COTA.set()
                raise SystemExit(f'SEM_COTA: {corpo[:200]}')
            if tentativa == 7:
                raise
            print(f'  {base.name}: tentativa {tentativa + 1} falhou ({e}); de novo…')
            time.sleep(4 * (tentativa + 1))
    mp3.write_bytes(base64.b64decode(d['audio_base64']))
    al = d['alignment']
    words, cur = [], None
    for ch, s, e in zip(al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']):
        if ch.isspace():
            if cur:
                words.append(cur)
            cur = None
            continue
        if cur is None:
            cur = {'word': ch, 'start': s, 'end': e}
        else:
            cur['word'] += ch
            cur['end'] = e
    if cur:
        words.append(cur)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(mp3)], capture_output=True, text=True).stdout.strip())
    wj.write_text(json.dumps({'hash': h, 'words': words, 'dur': dur}, ensure_ascii=False))
    return words, dur


def carregar_roteiro():
    spec = importlib.util.spec_from_file_location(ROTEIRO, ROOT / 'roteiro' / f'{ROTEIRO}.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def partidas(ordem=None, com_p1=False):
    """Os logs dos casos do interrogatório (interrogatorio/logs/<id>.json), por id. Na parte 2 também os da parte 1,
    com prefixo p1_ (flashbacks INTVerdade caso='p1_carro')."""
    ps = {f.stem: json.loads(f.read_text()) for f in sorted(LOGS_INT.glob('*.json')) if f.stem != 'lobby'}
    if com_p1:
        for f in sorted((ROOT.parent / 'interrogatorio' / 'logs').glob('*.json')):
            if f.stem != 'lobby':
                ps['p1_' + f.stem] = json.loads(f.read_text())
    return ps


def curto(t, mx=170):
    """Corta o pensamento em fim de frase (no máximo ~mx caracteres) para caber no balão."""
    t = re.sub(r'fud(id)', r'f*d\1', (t or '').strip())  # palavrão do log, censurado na tela
    if len(t) <= mx:
        return t
    out = ''
    for fr in re.split(r'(?<=[.!?;])\s+', t):
        if len(out) + len(fr) + 1 > mx:
            break
        out = (out + ' ' + fr).strip()
    return out or t[:mx].rsplit(' ', 1)[0] + '...'


def pensamento_da_fala(ps, partida, indice, cor, texto):
    """Acha no log a fala original (para mostrar o pensamento secreto junto)."""
    r = ps[str(partida)]['reunioes'][indice]
    alvo = bt.norm(texto)[:60]
    melhor, nota = None, 0
    for f in r['falas']:
        if f['cor'] != cor:
            continue
        n = sum(1 for a, b in zip(bt.norm(f['texto']), alvo) if a == b)
        if n > nota:
            melhor, nota = f, n
    return melhor['pensamento'] if melhor else ''


def marcas(rest_kind, rest, f, vis, memes, sfx_files, warnings, sid, events):
    kind, rest = rest_kind, rest
    if kind == 'p':
        events.append(dict(type='punch', at=f))
    elif kind == 'k':  # sincronia: o evento do tique indicado acontece nesta palavra
        events.append(dict(type='tk', at=f, tick=float(rest)))
    elif kind == 'm':
        parts = rest.split(':')
        mid = parts[0]
        pos = parts[1] if len(parts) > 1 and parts[1] else 'right'
        if vis['type'] == 'component' and vis['name'] in ('AUTitulo', 'AUFrase', 'AUPapel', 'AUEjecao', 'AUFim') and pos == 'right':
            pos = 'center'
        if vis['type'] == 'component' and vis['name'] in ('AU4Ejecao', 'AU4Fim', 'AU4Revela') and pos == 'right':
            pos = 'top'  # AU4: o texto dessas telas fica embaixo; meme no alto não cobre
        if vis['type'] == 'component' and vis['name'] in ('INTSegredo', 'INTVerdade') and pos == 'right' and ANTECIPA:
            pos = 'left'  # parte 2: SÓ VOCÊ VÊ (ficha à direita) e A VERDADE (carimbo ACERTOU/ERROU à direita) ficam livres
        mdur = float(parts[2]) if len(parts) > 2 and parts[2] else 2.2
        if mid not in memes:
            warnings.append(f'{sid}: meme {mid} não existe')
            return 0
        ev = dict(type='meme', at=f, dur=round(mdur * FPS), id=mid, pos=pos)
        if len(parts) > 3:
            ev['caption'] = parts[3]
        events.append(ev)
        return mdur
    elif kind == 's':
        parts = rest.split(':')
        if parts[0] not in sfx_files:
            warnings.append(f'{sid}: efeito {parts[0]} não existe')
            return 0
        rel = float(parts[1]) / 0.55 if len(parts) > 1 and parts[1] else 1.0
        events.append(dict(type='sfx', at=f, id=parts[0], file=sfx_files[parts[0]], vol=round(min(1.0, 0.8 * rel), 2)))
    elif kind == 't':
        parts = rest.split(':')
        ev = dict(type='txt', at=f, dur=round(float(parts[1] if len(parts) > 1 and parts[1] else 1.6) * FPS), text=parts[0])
        if vis['type'] == 'component' and vis['name'] == 'INTPlacar' and vis.get('props', {}).get('compacto'):
            ev['top'], ev['size'] = 800, 112  # placar compacto: os selos dos prêmios entram embaixo das linhas, sem cobrir ninguém
        if len(parts) > 2:
            ev['color'] = parts[2]
        events.append(ev)
        return float(parts[1] if len(parts) > 1 and parts[1] else 1.6)
    return 0


def narrar(sid, texto, base, offset_s, vis, memes, sfx_files, warnings, sem_voz):
    """Uma fala do narrador: TTS + eventos das marcações + palavras para legenda (tempos relativos à cena)."""
    texto = re.sub(r'\s*\.\.\.\s*(?=\[\[)', ' ', texto)  # reticências soltas antes de marcações viram pausa natural
    tokens, mks = bt.parse(texto)
    falado = ' '.join(bt.spoken(t) for t in tokens)
    if falado.strip() and not sem_voz:
        words, dur = tts(falado, NARRADOR, base)
    else:
        words, dur = [], max(0.6, len(tokens) * 0.36)
    starts, ends = bt.align(tokens, words) if words and tokens else ([i * 0.36 for i in range(len(tokens))], [i * 0.36 + 0.3 for i in range(len(tokens))])
    events, forced, extra = [], set(), 0.0

    def t_of(idx):
        return offset_s + (starts[idx] if idx < len(starts) else dur)

    for mk in mks:
        f = round(t_of(mk['idx']) * FPS)
        kind, _, rest = mk['spec'].partition(':')
        if kind == 'm' and ANTECIPA and tokens and mk['idx'] >= len(tokens):
            # meme no fim da fala entra na última palavra (não depois do silêncio): menos tela parada no fim da cena
            f = round(max(t_of(len(tokens) - 1), t_of(mk['idx']) - ANTECIPA) * FPS)
        if kind == 'cc':
            for k in range(mk['idx'], len(tokens)):
                forced.add(k)
                if re.search(r'[.!?…]$', tokens[k]):
                    break
            continue
        d = marcas(kind, rest, f, vis, memes, sfx_files, warnings, sid, events)
        if d and mk['idx'] >= len(tokens) - 1:
            extra = max(extra, f / FPS + d - (offset_s + dur))
    cw = bt.caption_words(tokens, starts, ends) if tokens else []
    forced_i = {i for i, w in enumerate(cw) if w['k'] in forced}
    cw = [dict(w=w['w'], s=round((offset_s + w['s']) * FPS), e=round((offset_s + w['e']) * FPS)) for w in cw]
    return dict(dur=dur, events=events, words=cw, forced=forced_i, extra=extra, audio=bool(words))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='')
    ap.add_argument('--sem-voz', action='store_true', help='não chama o ElevenLabs (estima durações)')
    ap.add_argument('--roteiro', default='roteiro_int')
    ap.add_argument('--saida', default='timeline_int.json')
    ap.add_argument('--contar', action='store_true', help='só conta os caracteres que ainda faltam gerar')
    # parte 2 (19/11): --logs logs2 --voz voice_int2 (vozes numa pasta própria: os ids de cena podem repetir os da parte 1)
    ap.add_argument('--logs', default='logs')
    ap.add_argument('--voz', default='voice_int')
    args = ap.parse_args()
    global SO_CONTAR, ROTEIRO, VOZ, LOGS_INT, ANTECIPA
    VOZ = PUBLIC / args.voz
    LOGS_INT = ROOT.parent / 'interrogatorio' / args.logs
    SO_CONTAR = args.contar
    ROTEIRO = args.roteiro
    VOZ.mkdir(parents=True, exist_ok=True)
    parte2 = args.logs != 'logs'
    if parte2:
        ANTECIPA = 0.6
        bt.PRONUNCIA = {**bt.PRONUNCIA, **PRONUNCIA_P2}
        bt.LEGENDA = bt.LEGENDA + LEGENDA_P2
    mod = carregar_roteiro()
    ps = partidas(getattr(mod, 'ORDEM', None), com_p1=parte2)
    memes = {x['id']: dict(file=Path(x['file_gif']).name, width=x['width'], height=x['height'], duration=x['duration_sec'])
             for x in json.loads((PUBLIC / 'gifs' / 'catalog.json').read_text())}
    sfx_files = {x['id']: x['file'] for x in json.loads((PUBLIC / 'sfx' / 'sfx.json').read_text())}
    for f in sorted((PUBLIC / 'sfx_au4').glob('*.mp3')):  # AU4: nhac, crunch, fogo, coracao, splash, bip
        sfx_files.setdefault(f.stem, f'sfx_au4/{f.name}')
    # efeitos do Among Us (sfx_au2: faca, tiro, transformar, duto, ...) também valem nas marcações [[s:...]]
    for f in sorted((PUBLIC / 'sfx_au2').glob('*.mp3')):
        sfx_files.setdefault(f.stem, f'sfx_au2/{f.name}')
    only = set(filter(None, args.only.split(',')))
    warnings = []

    # 1) gera todas as vozes em paralelo (o ElevenLabs aceita algumas requisições simultâneas)
    if not args.sem_voz:
        jobs = []
        for sc in mod.SCENES:
            if only and sc['id'] not in only:
                continue
            if 'text' in sc:
                tokens, _ = bt.parse(re.sub(r'\s*\.\.\.\s*(?=\[\[)', ' ', sc['text']))
                falado = ' '.join(bt.spoken(t) for t in tokens)
                if falado.strip():  # cena sem narração (só tela de jogo): nada a gerar
                    jobs.append((falado, NARRADOR, VOZ / sc['id']))
            else:
                for k, (quem, txt) in enumerate(sc['falas']):
                    if quem == 'N':
                        tokens, _ = bt.parse(re.sub(r'\s*\.\.\.\s*(?=\[\[)', ' ', txt))
                        jobs.append((' '.join(bt.spoken(t) for t in tokens), NARRADOR, VOZ / f"{sc['id']}_{k}"))
                    elif txt.strip('. '):
                        jobs.append((' '.join(bt.spoken(t) for t in limpar_voz(txt).split()), voz_de(quem), VOZ / f"{sc['id']}_{k}"))
        print(f'Vozes: {len(jobs)} trechos, {sum(len(j[0]) for j in jobs)} caracteres (cache evita repetir)')
        feitos = 0
        try:
            for j in jobs:  # em ordem do vídeo: se a cota acabar, o começo fica pronto
                tts(*j)
                feitos += 1
        except SystemExit as e:
            if 'SEM_COTA' not in str(e):
                raise
            print(f'COTA ESGOTADA depois de {feitos} de {len(jobs)} trechos; o resto fica pra quando tiver crédito.')
            return
        if SO_CONTAR:
            print(f'Faltam gerar: {len(FALTA)} trechos, {sum(FALTA)} caracteres')
            return

    # 2) monta as cenas
    scenes, cursor = [], 0
    for sc in mod.SCENES:
        sid = sc['id']
        vis = json.loads(json.dumps(sc['visual']))
        lead = sc.get('lead', 0.5 if vis.get('name') == 'AUTitulo' else 0.25)
        splash = bool(vis.get('props', {}).get('splash'))
        if splash:
            lead = max(lead, 1.75)
        pad = sc.get('pad', 0.5)
        events, words, forced, voices = [], [], set(), []
        if 'text' in sc:
            n = narrar(sid, sc['text'], VOZ / sid, lead, vis, memes, sfx_files, warnings, args.sem_voz)
            events += n['events']
            words += n['words']
            forced |= n['forced']
            end = lead + n['dur'] + max(0.0, n['extra'])
            if parte2:  # parte 2: o meme do fim já estica a cena sozinho (abaixo); o pad conta do fim da VOZ
                end = lead + n['dur']
            if n['audio']:
                voices.append(dict(at=round(lead * FPS), src=f'{VOZ.name}/{sid}.mp3'))
        else:
            t = lead
            fim_voz = lead
            chat = []
            for k, (quem, txt) in enumerate(sc['falas']):
                base = VOZ / f'{sid}_{k}'
                if quem == 'N':
                    n = narrar(sid, txt, base, t, vis, memes, sfx_files, warnings, args.sem_voz)
                    events += n['events']
                    off = len(words)
                    words += n['words']
                    forced |= {off + i for i in n['forced']}
                    if n['audio']:
                        voices.append(dict(at=round(t * FPS), src=f'{VOZ.name}/{sid}_{k}.mp3'))
                    fim_voz = t + n['dur']
                    t += n['dur'] + max(0.0, n['extra']) + 0.3
                else:
                    item = dict(cor=quem.split(':')[-1], texto=txt, at=round(t * FPS), pensa=quem.startswith('pensa:'))
                    # o pensamento secreto de quem fala (do log), mostrado num balão enquanto a voz toca
                    if vis.get('props', {}).get('mostrarPensamentos', False):
                        item['pensamento'] = curto(pensamento_da_fala(ps, vis['props']['partida'], vis['props']['indice'], quem, txt))
                    chat.append(item)
                    if txt.strip('. ') and not args.sem_voz:
                        _, dur = tts(' '.join(bt.spoken(x) for x in limpar_voz(txt).split()), voz_de(quem), base)
                        src = f'{VOZ.name}/{sid}_{k}.mp3'
                        if quem.startswith('pensa:'):  # pensamento: eco na voz normal
                            e = base.parent / f'{base.name}_eco.mp3'
                            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', base.with_suffix('.mp3'), '-af', 'aecho=0.8:0.85:60|140:0.45|0.25,volume=0.95', e], check=True)
                            src = f'{VOZ.name}/{sid}_{k}_eco.mp3'
                        if sc.get('rapido'):  # lobby (até 5 s): corta o silêncio das pontas e acelera a fala
                            r = base.parent / f'{base.name}_r.mp3'
                            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', base.with_suffix('.mp3'), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo=' + str(sc['rapido']), r], check=True)
                            dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', r], capture_output=True, text=True).stdout)
                            src = f'{VOZ.name}/{sid}_{k}_r.mp3'
                        voices.append(dict(at=round(t * FPS), src=src, cor=quem))
                    else:
                        dur = 1.3 if not txt.strip('. ') else len(txt) / 15
                    item['ate'] = round((t + dur) * FPS)
                    fim_voz = t + dur
                    t += dur + (0.15 if sc.get('rapido') else 0.35)
            vis.setdefault('props', {})['chat'] = chat
            end = fim_voz if parte2 else t  # parte 2: o meme do fim estica a cena sozinho (abaixo)
        minimo = sc.get('min', 7.5 if vis.get('name') == 'AU4Votos' else 0)  # votação: tempo de ler quem votou em quem
        duration = round(max(end + pad, minimo) * FPS)
        if parte2:
            # regra do AGE: selo = tempo de ler; selo seguido de selo espera o anterior sair; meme fica o tempo do selo
            # da cena (sem selo, 2,2 s); meme não cobre meme; e a CENA estica até o último efeito terminar (nada cortado)
            fim_txt = -1
            txts = sorted([e for e in events if e['type'] == 'txt'], key=lambda e: e['at'])
            for ev in txts:
                ev['dur'] = max(ev['dur'], round(tempo_selo(ev['text']) * FPS))
                if ev['at'] < fim_txt:
                    ev['at'] = fim_txt
                fim_txt = ev['at'] + ev['dur']
            selo = max((e['dur'] for e in txts), default=0)
            fim_meme = -1
            for ev in sorted([e for e in events if e['type'] == 'meme'], key=lambda e: e['at']):
                ev['dur'] = max(ev['dur'], selo, round(2.0 * FPS)) if selo else max(ev['dur'], round(2.2 * FPS))
                if ev['at'] < fim_meme:
                    ev['at'] = fim_meme
                fim_meme = ev['at'] + ev['dur']
            ultimo = max((e['at'] + e['dur'] for e in events if e['type'] in ('meme', 'txt')), default=0)
            duration = max(duration, ultimo + 6)
        for ev in events:
            if ev['type'] in ('meme', 'txt'):
                ev['dur'] = max(12, min(ev['dur'], duration - ev['at']))
        cap = bt.caption_groups(words, forced) if words else []
        events += [dict(type='voz', at=v['at'], src=v['src']) for v in voices]
        if splash:
            events.append(dict(type='sfx', at=2, id='boom', file=sfx_files['boom'], vol=0.9))
        scenes.append(dict(
            id=sid, chapter=mod.CHAPTERS[sc['chapter']], chapterKey=sc['chapter'], start=cursor, duration=duration,
            audio=None, audioOffset=0, audioDuration=0, words=words, visual=vis, segments=[],
            events=sorted(events, key=lambda e: e['at']), capGroups=cap,
        ))
        cursor += duration

    chapters = []
    for s in scenes:
        if not chapters or chapters[-1]['id'] != s['chapterKey']:
            chapters.append(dict(id=s['chapterKey'], title=s['chapter'], start=s['start'], end=s['start'] + s['duration']))
        else:
            chapters[-1]['end'] = s['start'] + s['duration']
    timeline = dict(fps=FPS, width=1920, height=1080, durationInFrames=cursor, scenes=scenes, chapters=chapters, clips={}, memes=memes,
                    data=dict(casos=ps))
    (PUBLIC / args.saida).write_text(json.dumps(timeline, ensure_ascii=False))
    print(f'Linha do tempo: {len(scenes)} cenas, {cursor} quadros ({cursor / FPS / 60:.2f} min)')
    for c in chapters:
        print(f"  {c['title']:30s} {c['start'] / FPS / 60:5.2f} → {c['end'] / FPS / 60:5.2f} min")
    for w in warnings:
        print('AVISO:', w)


if __name__ == '__main__':
    main()
