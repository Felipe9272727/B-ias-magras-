#!/usr/bin/env python3
"""Vídeo 3 (Jogos Vorazes das IAs): gera as vozes no ElevenLabs v4 e escreve remotion/public/timeline3.json.

- Narrador: Gabriel, escrito no estilo falado (sem tags de emoção).
- Falas dos tributos: cada um tem a sua voz (VOZES, por id: 12 tributos).
- Lê as duas partidas de ilha/logs: partida.json (oficial) e partida_v2_abortada.json (teste).
- Reaproveita o alinhamento de palavras e as legendas seletivas do vídeo 1 (build_timeline.py).

Uso: python3 build_timeline3.py [--only a01,p207] [--sem-voz]   (a chave fica em ~/.config/elevenlabs/api_key)
"""
import argparse
import base64
import collections
import concurrent.futures as cf
import difflib
import hashlib
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
VOZ = PUBLIC / 'voice3'
REPO = ROOT.parent
LOGS = REPO / 'ilha' / 'logs'
FPS = 30

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline as bt  # noqa: E402

MODELO = 'eleven_v4'
AJUSTES = {'stability': 0.5, 'similarity_boost': 0.75}
NARRADOR = 'lvkgCBi6spByiTZMPJEK'  # Gabriel
# 12 tributos: 8 vozes do vídeo 2 + 4 novas (Roberta, Keren, Arnold e a voz "M", todas pt-BR)
VOZES = {
    'opus': 'YU8EsJtXFMyKMxYtheDk',     # Mário
    'sonnet': 'dX7gRq1dIvLTgUaWpEFn',   # Rafael Valente
    'haiku1': '2CECaLAGTS5NRGxgbcxr',   # Davi
    'haiku2': 'GDzHdQOi6jjf8zaXhCYD',   # Raquel
    'ds1': 'YbP0Eq5RE5uOoCEl7F3T',      # Weverton
    'ds2': '4za2kOXGgUd57HRSQ1fn',      # Lendário
    'ds3': 'bJrNspxJVFovUxNBQ0wh',      # Marcelo Costa
    'ds4': '7lu3ze7orhWaNeSPowWx',      # Lucas
    'qwen1': 'ZYCQDYoXnl78dNdU6JeG',    # Arnold (PT/BR)
    'qwen2': 'ohZOfA9iwlZ5nOsoY7LB',    # Roberta
    'qwen3': 'pVJr1h0A4fisVFn0dCVn',    # M
    'qwen4': '33B4UnXyTNbgLmdEDh5P',    # Keren
}
TRIBUTOS_IDS = set(VOZES)
ZONAS_VALIDAS = {'cornucopia', 'praia_sul', 'floresta', 'montanha', 'caverna', 'lago', 'pantano', 'ruinas', 'praia_leste', 'campo'}
REGRAS_VALIDAS = {'distritos', 'status', 'turnos', 'mapa', 'eventos', 'dupla'}
PARTIDAS_VALIDAS = {'oficial', 'teste'}
COMPONENTES = {'ILClipe', 'ILTitulo', 'ILMapa', 'ILElenco', 'ILFicha', 'ILMorte', 'ILRegra', 'ILPlacar'}
CENTRO = {'ILTitulo', 'ILFicha', 'ILMorte', 'ILRegra', 'ILPlacar', 'ILElenco'}

# pronúncia só para a voz; a legenda mostra o texto original
bt.PRONUNCIA.update({
    'Haiku': 'Raicu', 'Haikus': 'Raicus',
    'Qwen': 'Kuén', 'DeepSeek': 'Dípsik', 'Opus': 'Ópus', 'Sonnet': 'Sônet',
    '27B-1': 'vinte e sete B um', '27B-2': 'vinte e sete B dois', '27B-3': 'vinte e sete B três',
    'ds1': 'dê ésse um', 'ds2': 'dê ésse dois', 'ds3': 'dê ésse três', 'ds4': 'dê ésse quatro',
    'qwen1': 'kuén um', 'qwen2': 'kuén dois', 'qwen3': 'kuén três', 'qwen4': 'kuén quatro',
    'Anthropic': 'Antrópic', 'Alibaba': 'Alibábba',
})
bt.LEGENDA = [('dezesseis tiques', '16 tiques'), ('dezenove tiques', '19 tiques'), ('vinte e nove tiques', '29 tiques'),
              ('sessenta e cinco', '65'), ('trinta e quatro', '34')]
bt.TERMOS = {'Anthropic', 'DeepSeek', 'Qwen', 'Alibaba'}


def chave():
    return (Path.home() / '.config' / 'elevenlabs' / 'api_key').read_text().strip()


def tts(texto, voz, base):
    """Gera base.mp3 e base.words.json (com cache por hash). Devolve (palavras, duração)."""
    mp3, wj = base.with_suffix('.mp3'), base.with_suffix('.words.json')
    h = hashlib.sha1(json.dumps([texto, voz, MODELO, AJUSTES]).encode()).hexdigest()
    if mp3.exists() and wj.exists():
        d = json.loads(wj.read_text())
        if d.get('hash') == h:
            return d['words'], d['dur']
    body = json.dumps({'text': texto, 'model_id': MODELO, 'voice_settings': AJUSTES}).encode()
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{voz}/with-timestamps?output_format=mp3_44100_128'
    for tentativa in range(8):
        try:
            req = urllib.request.Request(url, data=body, headers={'xi-api-key': chave(), 'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=180) as r:
                d = json.loads(r.read())
            break
        except Exception as e:  # noqa: BLE001
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
    spec = importlib.util.spec_from_file_location('roteiro3', ROOT / 'roteiro' / 'roteiro3.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def partidas():
    """{'oficial': log, 'teste': log}"""
    return {
        'oficial': json.loads((LOGS / 'partida.json').read_text()),
        'teste': json.loads((LOGS / 'partida_v2_abortada.json').read_text()),
    }


def estatisticas(ps):
    """Números simples por partida: mortes por causa, ataques, revides, alianças e propostas."""
    out = {}
    for nome, d in ps.items():
        eventos = [e for t in d['turnos'] for e in t['eventos']]
        mortes = collections.Counter(e['causa'] for e in eventos if e['tipo'] == 'morte')
        out[nome] = dict(
            tiques=len(d['turnos']),
            dias=max(t['dia'] for t in d['turnos']),
            mortes=sum(mortes.values()),
            mortesPorCausa=dict(mortes),
            ataques=sum(1 for e in eventos if e['tipo'] == 'ataque'),
            revides=sum(1 for e in eventos if e['tipo'] == 'revide'),
            aliancas=sum(1 for e in eventos if e['tipo'] == 'alianca'),
            propostas=sum(1 for e in eventos if e['tipo'] == 'proposta'),
            vencedores=(d.get('fim') or {}).get('vencedores', []),
        )
    return out


def pensamento_da_fala(ps, partida, turno, quem, texto):
    """Acha no log a decisão do tributo no tique indicado (pela fala) e devolve o pensamento secreto."""
    turnos = {t['k']: t for t in ps[partida]['turnos']}
    t = turnos.get(turno)
    if not t:
        return ''
    alvo = bt.norm(texto)[:80]
    melhor, nota = None, 0.0
    for dec in t['decisoes']:
        if dec['id'] != quem or not dec.get('fala'):
            continue
        nota_dec = difflib.SequenceMatcher(None, bt.norm(dec['fala'])[:80], alvo).ratio()
        if nota_dec > nota:
            melhor, nota = dec, nota_dec
    return melhor['pensamento'] if melhor and nota >= 0.35 else ''


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
        if vis['type'] == 'component' and vis['name'] in CENTRO and pos == 'right':
            pos = 'center'
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


def checar(mod, ps, warnings):
    """Confere ids, zonas, turnos e arquivos antes de gerar a linha do tempo."""
    ids_cenas = set()
    for sc in mod.SCENES:
        sid = sc['id']
        if sid in ids_cenas:
            warnings.append(f'{sid}: id de cena repetido')
        ids_cenas.add(sid)
        if sc['chapter'] not in mod.CHAPTERS:
            warnings.append(f'{sid}: capítulo {sc["chapter"]} não existe')
        vis = sc['visual']
        if vis['type'] == 'component':
            if vis['name'] not in COMPONENTES:
                warnings.append(f'{sid}: componente {vis["name"]} desconhecido')
            p = vis.get('props', {})
            if 'partida' in p and p['partida'] not in PARTIDAS_VALIDAS:
                warnings.append(f'{sid}: partida {p["partida"]} não existe')
            if vis['name'] == 'ILMapa':
                if p.get('foco') and p['foco'] not in ZONAS_VALIDAS:
                    warnings.append(f'{sid}: zona {p["foco"]} não existe')
                turnos = {t['k'] for t in ps[p['partida']]['turnos']}
                if p['turno'] not in turnos:
                    warnings.append(f'{sid}: turno {p["turno"]} não existe em {p["partida"]}')
                for q in p.get('pensamentos', []):
                    if q not in TRIBUTOS_IDS:
                        warnings.append(f'{sid}: tributo {q} desconhecido')
            if vis['name'] in ('ILFicha', 'ILMorte') and p.get('id') not in TRIBUTOS_IDS:
                warnings.append(f'{sid}: tributo {p.get("id")} desconhecido')
            if vis['name'] == 'ILElenco' and p.get('destaque') and p['destaque'] not in TRIBUTOS_IDS:
                warnings.append(f'{sid}: destaque {p["destaque"]} desconhecido')
            if vis['name'] == 'ILRegra' and p.get('item') not in REGRAS_VALIDAS:
                warnings.append(f'{sid}: regra {p.get("item")} desconhecida')
            if vis['name'] == 'ILClipe' and not (REPO / p['src']).exists():
                warnings.append(f'{sid}: clipe {p["src"]} ainda não existe (ilha/clips)')
        for quem, _ in (sc.get('falas') or []):
            if quem != 'N' and quem not in TRIBUTOS_IDS:
                warnings.append(f'{sid}: fala de {quem} sem voz')
        if 'text' in sc:
            pass
    # cada fala de tributo em mapa deve ter pensamento no log (quando o roteiro mostra pensamentos)
    for sc in mod.SCENES:
        vis = sc['visual']
        if vis.get('type') == 'component' and vis['name'] == 'ILMapa' and sc.get('falas'):
            p = vis['props']
            for quem, txt in sc['falas']:
                if quem != 'N' and txt.strip('. ') and not pensamento_da_fala(ps, p['partida'], p['turno'], quem, txt):
                    warnings.append(f'{sc["id"]}: fala de {quem} não achada no log (sem pensamento)')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='')
    ap.add_argument('--sem-voz', action='store_true', help='não chama o ElevenLabs (estima durações)')
    args = ap.parse_args()
    VOZ.mkdir(parents=True, exist_ok=True)
    mod = carregar_roteiro()
    ps = partidas()
    memes = {x['id']: dict(file=Path(x['file_gif']).name, width=x['width'], height=x['height'], duration=x['duration_sec'])
             for x in json.loads((PUBLIC / 'gifs' / 'catalog.json').read_text())}
    sfx_files = {x['id']: x['file'] for x in json.loads((PUBLIC / 'sfx' / 'sfx.json').read_text())}
    ilha = json.loads((REPO / 'ilha' / 'dados' / 'ilha.json').read_text())
    only = set(filter(None, args.only.split(',')))
    warnings = []
    checar(mod, ps, warnings)

    # 1) gera todas as vozes em paralelo (o ElevenLabs aceita algumas requisições simultâneas)
    if not args.sem_voz:
        jobs = []
        for sc in mod.SCENES:
            if only and sc['id'] not in only:
                continue
            if 'text' in sc:
                tokens, _ = bt.parse(re.sub(r'\s*\.\.\.\s*(?=\[\[)', ' ', sc['text']))
                jobs.append((' '.join(bt.spoken(t) for t in tokens), NARRADOR, VOZ / sc['id']))
            else:
                for k, (quem, txt) in enumerate(sc['falas']):
                    if quem == 'N':
                        tokens, _ = bt.parse(re.sub(r'\s*\.\.\.\s*(?=\[\[)', ' ', txt))
                        jobs.append((' '.join(bt.spoken(t) for t in tokens), NARRADOR, VOZ / f"{sc['id']}_{k}"))
                    elif txt.strip('. '):
                        jobs.append((' '.join(bt.spoken(t) for t in txt.split()), VOZES[quem], VOZ / f"{sc['id']}_{k}"))
        print(f'Vozes: {len(jobs)} trechos, {sum(len(j[0]) for j in jobs)} caracteres (cache evita repetir)')
        with cf.ThreadPoolExecutor(2) as ex:
            list(ex.map(lambda j: tts(*j), jobs))

    # 2) monta as cenas
    scenes, cursor = [], 0
    for sc in mod.SCENES:
        sid = sc['id']
        vis = json.loads(json.dumps(sc['visual']))
        lead = sc.get('lead', 0.5 if vis.get('name') == 'ILTitulo' else 0.25)
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
                voices.append(dict(at=round(lead * FPS), src=f'voice3/{sid}.mp3'))
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
                        voices.append(dict(at=round(t * FPS), src=f'voice3/{sid}_{k}.mp3'))
                    t += n['dur'] + max(0.0, n['extra']) + 0.3
                else:
                    item = dict(id=quem, texto=txt, at=round(t * FPS))
                    if vis.get('name') == 'ILMapa' and vis.get('props', {}).get('turno') is not None:
                        p = vis['props']
                        item['pensamento'] = pensamento_da_fala(ps, p['partida'], p['turno'], quem, txt)
                    chat.append(item)
                    if txt.strip('. ') and not args.sem_voz:
                        _, dur = tts(' '.join(bt.spoken(x) for x in txt.split()), VOZES[quem], base)
                        voices.append(dict(at=round(t * FPS), src=f'voice3/{sid}_{k}.mp3', id=quem))
                    else:
                        dur = 1.3 if not txt.strip('. ') else len(txt) / 15
                    t += dur + 0.35
            vis.setdefault('props', {})['chat'] = chat
            end = t
        duration = round((end + pad) * FPS)
        for ev in events:
            if ev['type'] in ('meme', 'txt'):
                ev['dur'] = max(12, min(ev['dur'], duration - ev['at']))
        cap = bt.caption_groups(words, forced) if words else []
        events += [dict(type='voz', at=v['at'], src=v['src'], **({'id': v['id']} if 'id' in v else {})) for v in voices]
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
    stats = estatisticas(ps)
    timeline = dict(
        fps=FPS, width=1920, height=1080, durationInFrames=cursor, scenes=scenes, chapters=chapters, clips={}, memes=memes,
        data=dict(partidas=ps, stats=stats, tributos=ps['oficial']['meta']['tributos'], zonas=ilha['zonas'], raio=ilha.get('raio')),
    )
    (PUBLIC / 'timeline3.json').write_text(json.dumps(timeline, ensure_ascii=False))
    palavras = sum(len(re.sub(r'\[\[.*?\]\]', '', t).split()) for s in mod.SCENES for t in ([s['text']] if 'text' in s else [x[1] for x in s['falas']]))
    print(f'Linha do tempo: {len(scenes)} cenas, {cursor} quadros ({cursor / FPS / 60:.2f} min), {palavras} palavras (narrador + falas)')
    for c in chapters:
        print(f"  {c['title']:30s} {c['start'] / FPS / 60:5.2f} → {c['end'] / FPS / 60:5.2f} min")
    for w in warnings:
        print('AVISO:', w)
    if not warnings:
        print('Sem avisos.')


if __name__ == '__main__':
    main()
