#!/usr/bin/env python3
"""Among Us 5 (Polus): cópia do build_timeline_au4.py com os logs de amongus/logs5, vozes em voice_au5 e as 3 cores novas.
Among Us 4: gera as vozes no ElevenLabs v4 e escreve remotion/public/<saida> (padrão timeline_au4.json).
(Cópia do build_timeline_au3.py: logs4, vozes em voice_au4, e as skins de logs4/skins.json em data.skins.)
--roteiro roteiro_au4_previa (sem .py) escolhe o roteiro; --saida o arquivo da linha do tempo.
(Derivado de build_timeline2.py; mesmo formato de roteiro e de timeline.)

- Narrador: Gabriel, escrito no estilo falado (sem tags de emoção).
- Falas das IAs nas reuniões: cada cor tem a sua voz.
- Reaproveita o alinhamento de palavras e as legendas seletivas do vídeo 1 (build_timeline.py).

Uso: python3 build_timeline_au4.py [--roteiro roteiro_au4] [--saida timeline_au4.json] [--only a01,p207] [--sem-voz]   (a chave fica em ~/.config/elevenlabs/api_key)
"""
import argparse
import base64
import concurrent.futures as cf
import hashlib
import shutil
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
VOZ = PUBLIC / 'voice_au5'
LOGS = ROOT.parent / 'amongus' / 'logs5'
SKINS = ROOT.parent / 'amongus' / 'logs5' / 'skins.json'  # as roupas do AU4 + as que a MiMo escolheu para as cores novas (skins4.mjs --so)
ROTEIRO = 'roteiro_au5'
FPS = 30

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline as bt  # noqa: E402

MODELO = 'eleven_v4'
AJUSTES = {'stability': 0.5, 'similarity_boost': 0.75}
NARRADOR = 'lvkgCBi6spByiTZMPJEK'  # Gabriel
VOZES = {
    'Vermelho': 'YU8EsJtXFMyKMxYtheDk',  # Mário
    'Azul': 'dX7gRq1dIvLTgUaWpEFn',  # Rafael Valente
    'Verde': '2CECaLAGTS5NRGxgbcxr',  # Davi
    'Rosa': 'GDzHdQOi6jjf8zaXhCYD',  # Raquel
    'Laranja': 'YbP0Eq5RE5uOoCEl7F3T',  # Weverton
    'Amarelo': '4za2kOXGgUd57HRSQ1fn',  # Lendário
    'Preto': 'bJrNspxJVFovUxNBQ0wh',  # Marcelo Costa
    'Branco': '7lu3ze7orhWaNeSPowWx',  # Lucas
    'Roxo': 'ZYCQDYoXnl78dNdU6JeG',  # Arnold
    'Marrom': 'pVJr1h0A4fisVFn0dCVn',  # M
    'Ciano': 'ohZOfA9iwlZ5nOsoY7LB',  # Roberta
    'Lima': '33B4UnXyTNbgLmdEDh5P',  # Keren
    'Cinza': '6GWfivGWZoUg1lb8HBrE',  # Luiz Henrique (biblioteca pública)
    'Coral': 'xcNJswC7UcxsIiCuih19',  # Larissa (biblioteca pública)
    'Bordo': 'NDUHL9ozN4FPvbUqxHVJ',  # Wallace (biblioteca pública)
    # AU5: as cores novas (vozes multilíngues que sobraram na conta)
    'Banana': 'm5fAy5I8fIHSzvsA8sRt',  # Jubileu
    'Caqui': 'NrirjBupLRUlqHita17L',  # Gg
    'Rose': 'cgSgspJ2msm6clMCkdW9',  # Jessica
}

# pronúncia só para a voz; a legenda mostra o texto original
bt.PRONUNCIA = {
    'Haiku': 'Raicu', 'Haikus': 'Raicus', 'Haiku,': 'Raicu,',
    'Among': 'Amông', 'Us': 'Âs', 'GPT': 'GêPêTê', 'Grok': 'Gróqui', 'Mistral': 'Mistrál', 'MiniMax': 'Mini Mécs', 'GLM': 'Gê Éle Ême', 'DeepSeek': 'Dípsíque', 'Luna': 'Lúna', 'Flash': 'Fléch', 'Bordo': 'Bórdô', 'Gemini': 'Djêmini', 'Opus': 'Ópus', 'OpenRouter': 'Ôpen Ráuter', 'Skeld': 'Squéld', 'Qwen': 'Cuên', 'FAMILIAGMS': 'Família Gê Ême Ésse', 'Polus': 'Pólus', 'Ministral': 'Ministrál', 'tokens': 'tôkens', 'kkk': 'cá cá cá',
}
bt.LEGENDA = [('treze centavos', '13 centavos'), ('vinte e oito', '28'), ('vinte e duas', '22'), ('cem por cento', '100%'), ('quase dois mil', 'quase 2.000')]
bt.TERMOS = {'Anthropic', 'Skeld', 'tokens', 'JSON'}


def chave():
    return (Path.home() / '.config' / 'elevenlabs' / 'api_key').read_text().strip()


_INDICE = None
SEM_COTA = threading.Event()
SO_CONTAR = False
FALTA = []


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


def partidas(ordem=None):
    """As partidas na ordem do vídeo: `ordem` (do roteiro, ORDEM) diz qual partida do log é a 1ª, 2ª... do vídeo."""
    out = {}
    for i in (1, 2, 3, 4, 5):
        f = LOGS / f'partida{(ordem or {}).get(i, i)}.json'
        if not f.exists():
            continue
        d = json.loads(f.read_text())
        if not d.get('resultado'):  # partida ainda rodando (ou parada no meio): fica de fora
            continue
        out[str(i)] = d
    return out


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
        if vis['type'] == 'component' and vis['name'] in ('AU4Ejecao', 'AU4Fim', 'AU4Revela', 'AU5Ejecao', 'AU5Fim') and pos == 'right':
            pos = 'top'  # AU4: o texto dessas telas fica embaixo; meme no alto não cobre
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
        if kind == 'cc':
            for k in range(mk['idx'], len(tokens)):
                forced.add(k)
                if re.search(r'[.!?…]$', tokens[k]):
                    break
            continue
        d = marcas(kind, rest, f, vis, memes, sfx_files, warnings, sid, events)
        if d and mk['idx'] >= len(tokens) - 1:
            extra = max(extra, t_of(mk['idx']) + d - (offset_s + dur))
    cw = bt.caption_words(tokens, starts, ends) if tokens else []
    forced_i = {i for i, w in enumerate(cw) if w['k'] in forced}
    cw = [dict(w=w['w'], s=round((offset_s + w['s']) * FPS), e=round((offset_s + w['e']) * FPS)) for w in cw]
    return dict(dur=dur, events=events, words=cw, forced=forced_i, extra=extra, audio=bool(words))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='')
    ap.add_argument('--sem-voz', action='store_true', help='não chama o ElevenLabs (estima durações)')
    ap.add_argument('--roteiro', default='roteiro_au5')
    ap.add_argument('--saida', default='timeline_au5.json')
    ap.add_argument('--contar', action='store_true', help='só conta os caracteres que ainda faltam gerar')
    args = ap.parse_args()
    global SO_CONTAR, ROTEIRO
    SO_CONTAR = args.contar
    ROTEIRO = args.roteiro
    VOZ.mkdir(parents=True, exist_ok=True)
    mod = carregar_roteiro()
    ps = partidas(getattr(mod, 'ORDEM', None))
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
                        jobs.append((' '.join(bt.spoken(t) for t in txt.split()), VOZES[quem.split(':')[-1]], VOZ / f"{sc['id']}_{k}"))
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
            if n['audio']:
                voices.append(dict(at=round(lead * FPS), src=f'voice_au5/{sid}.mp3'))
        else:
            t = lead
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
                        voices.append(dict(at=round(t * FPS), src=f'voice_au5/{sid}_{k}.mp3'))
                    t += n['dur'] + max(0.0, n['extra']) + 0.3
                else:
                    pensa = quem.startswith('pensa:')  # pensamento (do log): mesma voz da IA, com eco (regra do canal)
                    quem = quem.split(':')[-1]
                    item = dict(cor=quem, texto=txt, at=round(t * FPS), **({'pensa': True} if pensa else {}))
                    # o pensamento secreto de quem fala (do log), mostrado num balão enquanto a voz toca
                    if not pensa and 'indice' in vis.get('props', {}) and vis['props'].get('mostrarPensamentos', True):
                        item['pensamento'] = curto(pensamento_da_fala(ps, vis['props']['partida'], vis['props']['indice'], quem, txt))
                    chat.append(item)
                    if txt.strip('. ') and not args.sem_voz:
                        _, dur = tts(' '.join(bt.spoken(x) for x in txt.split()), VOZES[quem], base)
                        src = f'voice_au5/{sid}_{k}.mp3'
                        if pensa:  # eco na voz normal, nunca sussurro
                            e = base.parent / f'{base.name}_eco.mp3'
                            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', base.with_suffix('.mp3'), '-af', 'aecho=0.8:0.85:60|140:0.45|0.25,volume=0.95', e], check=True)
                            src = f'voice_au5/{sid}_{k}_eco.mp3'
                        if sc.get('rapido'):  # lobby (até 5 s): corta o silêncio das pontas e acelera a fala
                            r = base.parent / f'{base.name}_r.mp3'
                            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', base.with_suffix('.mp3'), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,atempo=' + str(sc['rapido']), r], check=True)
                            dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', r], capture_output=True, text=True).stdout)
                            src = f'voice_au5/{sid}_{k}_r.mp3'
                        voices.append(dict(at=round(t * FPS), src=src, cor=quem))
                    else:
                        dur = 1.3 if not txt.strip('. ') else len(txt) / 15
                    item['ate'] = round((t + dur) * FPS)
                    t += dur + (0.15 if sc.get('rapido') else 0.35)
            vis.setdefault('props', {})['chat'] = chat
            end = t
        minimo = sc.get('min', 7.5 if vis.get('name') == 'AU4Votos' else 0)  # votação: tempo de ler quem votou em quem
        duration = round(max(end + pad, minimo) * FPS)
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
                    data=dict(partidas=ps, skins=json.loads(SKINS.read_text())['skins']))
    (PUBLIC / args.saida).write_text(json.dumps(timeline, ensure_ascii=False))
    print(f'Linha do tempo: {len(scenes)} cenas, {cursor} quadros ({cursor / FPS / 60:.2f} min)')
    for c in chapters:
        print(f"  {c['title']:30s} {c['start'] / FPS / 60:5.2f} → {c['end'] / FPS / 60:5.2f} min")
    for w in warnings:
        print('AVISO:', w)


if __name__ == '__main__':
    main()
