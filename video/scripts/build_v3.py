#!/usr/bin/env python3
"""Vídeo 3 (versão nova, 24 fps): vozes no ElevenLabs, linha do tempo (remotion/public/timeline3.json) e a lista de
tomadas 3D que o Blender precisa renderizar (ilha/dados/tomadas3.json), a partir de roteiro/roteiro3.py.

- Narrador: Gabriel. Falas dos tributos: cada um com a sua voz (VOZES).
- [[c]] no texto marca o corte para a próxima tomada 3D, na palavra seguinte.
- Tomadas: id <cena>_<n>; quadros = duração do trecho + folga. As falas dos tributos viram intervalos (s) na tomada,
  para o personagem gesticular enquanto fala.

Uso: python3 build_v3.py [--sem-voz] [--only a01,a02]   (a chave fica em ~/.config/elevenlabs/api_key)
"""
import argparse
import concurrent.futures as cf
import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline2 as b2  # noqa: E402  (tts, marcas, alinhamento e legendas)

bt = b2.bt
ROOT, PUBLIC = b2.ROOT, b2.PUBLIC
REPO = ROOT.parent
FPS = 24
b2.FPS = FPS
VOZ = b2.VOZ = PUBLIC / 'voice3'
LOGS = REPO / 'ilha' / 'logs'
TOMADAS = REPO / 'ilha' / 'dados' / 'tomadas3.json'
FOLGA = 6  # quadros a mais em cada tomada 3D (cortes nunca caem no vazio)

VOZES = {
    'opus': 'YU8EsJtXFMyKMxYtheDk', 'sonnet': 'dX7gRq1dIvLTgUaWpEFn', 'haiku1': '2CECaLAGTS5NRGxgbcxr',
    'haiku2': 'GDzHdQOi6jjf8zaXhCYD', 'ds1': 'YbP0Eq5RE5uOoCEl7F3T', 'ds2': '4za2kOXGgUd57HRSQ1fn',
    'ds3': 'bJrNspxJVFovUxNBQ0wh', 'ds4': '7lu3ze7orhWaNeSPowWx', 'qwen1': 'ZYCQDYoXnl78dNdU6JeG',
    'qwen2': 'ohZOfA9iwlZ5nOsoY7LB', 'qwen3': 'pVJr1h0A4fisVFn0dCVn', 'qwen4': '33B4UnXyTNbgLmdEDh5P',
}
bt.PRONUNCIA.update({
    'Haiku': 'Raicu', 'Haikus': 'Raicus', 'Haiku,': 'Raicu,', 'Qwen': 'Kuén', 'Qwens': 'Kuéns', 'Qwen,': 'Kuén,',
    'DeepSeek': 'Dípsik', 'DeepSeeks': 'Dípsiks', 'DeepSeek,': 'Dípsik,', 'Opus': 'Ópus', 'Opus,': 'Ópus,',
    'Sonnet': 'Sônet', 'Sonnet,': 'Sônet,', 'Anthropic': 'Antrópic', 'Alibaba': 'Alibába', '27B': 'vinte e sete bê',
    '27B-1': 'vinte e sete bê um', '27B-2': 'vinte e sete bê dois', '27B-3': 'vinte e sete bê três',
})
bt.LEGENDA = []
bt.TERMOS = {'Anthropic', 'Alibaba', 'Cornucópia'}  # só termos difíceis; o resto é [[cc]] nos momentos-chave


def carregar_roteiro():
    spec = importlib.util.spec_from_file_location('roteiro3', ROOT / 'roteiro' / 'roteiro3.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def limpo(texto):
    return re.sub(r'\s*\.\.\.\s*(?=\[\[)', ' ', texto)


def narrar(sid, texto, base, offset_s, vis, memes, sfx, avisos, sem_voz):
    """Como build_timeline2.narrar, mas também devolve os cortes [[c]] (quadros relativos à cena)."""
    tokens, mks = bt.parse(limpo(texto))
    falado = ' '.join(bt.spoken(t) for t in tokens)
    if falado.strip() and not sem_voz:
        words, dur = b2.tts(falado, b2.NARRADOR, base)
    else:
        words, dur = [], max(0.6, len(tokens) * 0.36)
    if words and tokens:
        starts, ends = bt.align(tokens, words)
    else:
        starts, ends = [i * 0.36 for i in range(len(tokens))], [i * 0.36 + 0.3 for i in range(len(tokens))]
    events, forced, cortes, extra = [], set(), [], 0.0

    def t_of(idx):
        return offset_s + (starts[idx] if idx < len(starts) else dur)

    for mk in mks:
        f = round(t_of(mk['idx']) * FPS)
        kind, _, rest = mk['spec'].partition(':')
        if kind == 'c':
            cortes.append(f)
            continue
        if kind == 'x':  # eliminado: [[x:id:causa]]
            partes = rest.split(':')
            events.append(dict(type='elim', at=f, id=partes[0], causa=partes[1] if len(partes) > 1 else ''))
            continue
        if kind == 'cc':
            for k in range(mk['idx'], len(tokens)):
                forced.add(k)
                if re.search(r'[.!?…]$', tokens[k]):
                    break
            continue
        d = b2.marcas(kind, rest, f, vis, memes, sfx, avisos, sid, events)
        if d and mk['idx'] >= len(tokens) - 1:
            extra = max(extra, t_of(mk['idx']) + d - (offset_s + dur))
    cw = bt.caption_words(tokens, starts, ends) if tokens else []
    forced_i = {i for i, w in enumerate(cw) if w['k'] in forced}
    cw = [dict(w=w['w'], s=round((offset_s + w['s']) * FPS), e=round((offset_s + w['e']) * FPS)) for w in cw]
    return dict(dur=dur, events=events, words=cw, forced=forced_i, extra=extra, audio=bool(words), cortes=cortes)


def tomadas_da_cena(sid, vis, duracao, cortes, chat, inicios=()):
    """Divide a cena entre as tomadas 3D: nos cortes marcados ([[c]] ou desde=k) e, se faltar, em partes iguais."""
    toms = vis['props']['tomadas']
    n = len(toms)
    extra = [inicios[s['desde']] for s in toms[1:] if isinstance(s.get('desde'), int) and s['desde'] < len(inicios)]
    marcas = sorted(set(c for c in list(cortes) + extra if 0 < c < duracao))[:n - 1]
    if len(marcas) < n - 1:
        ini = marcas[-1] if marcas else 0
        resto = n - 1 - len(marcas)
        passo = (duracao - ini) / (resto + 1)
        marcas += [round(ini + passo * (i + 1)) for i in range(resto)]
    limites = [0] + marcas + [duracao]
    saida, specs = [], []
    for i, spec in enumerate(toms):
        de, ate = limites[i], limites[i + 1]
        tid = f'{sid}_{i}'
        falas = {}
        for c in chat:
            ini_s = (c['at'] - de) / FPS
            fim_s = ini_s + c['dur'] / FPS
            if fim_s > 0 and ini_s < (ate - de) / FPS:
                falas.setdefault(c['id'], []).append([round(max(0.0, ini_s), 2), round(fim_s, 2)])
        s = dict({k: v for k, v in spec.items() if k != 'desde'}, id=tid, quadros=ate - de + FOLGA)
        if falas:
            s['falas'] = falas
        specs.append(s)
        saida.append(dict(id=tid, de=de, ate=ate, turno=spec['turno'], partida=spec.get('partida', 'oficial'),
                          periodo=spec.get('periodo')))
    vis['props']['tomadas'] = saida
    return specs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='')
    ap.add_argument('--sem-voz', action='store_true')
    ap.add_argument('--cenas', default='', help='só estas cenas (pode pegar do RESTO), numa linha do tempo à parte')
    ap.add_argument('--nome', default='', help='sufixo: timeline3_<nome>.json e tomadas3_<nome>.json')
    args = ap.parse_args()
    VOZ.mkdir(parents=True, exist_ok=True)
    mod = carregar_roteiro()
    if args.cenas:
        quero = args.cenas.split(',')
        todas = {sc['id']: sc for sc in mod.SCENES + getattr(mod, 'RESTO', [])}
        mod.SCENES = [todas[i] for i in quero]
    memes = {x['id']: dict(file=Path(x['file_gif']).name, width=x['width'], height=x['height'], duration=x['duration_sec'])
             for x in json.loads((PUBLIC / 'gifs' / 'catalog.json').read_text())}
    sfx = {x['id']: x['file'] for x in json.loads((PUBLIC / 'sfx' / 'sfx.json').read_text())}
    only = set(filter(None, args.only.split(',')))
    avisos = []

    # 1) vozes em paralelo (cache por hash: texto igual não gasta crédito de novo)
    if not args.sem_voz:
        jobs = []
        for sc in mod.SCENES:
            if only and sc['id'] not in only:
                continue
            if 'text' in sc:
                tokens, _ = bt.parse(limpo(sc['text']))
                jobs.append((' '.join(bt.spoken(t) for t in tokens), b2.NARRADOR, VOZ / sc['id']))
            else:
                for k, (quem, txt) in enumerate(sc['falas']):
                    if quem == 'N':
                        tokens, _ = bt.parse(limpo(txt))
                        if tokens:
                            jobs.append((' '.join(bt.spoken(t) for t in tokens), b2.NARRADOR, VOZ / f"{sc['id']}_{k}"))
                    elif txt.strip('. '):
                        jobs.append((' '.join(bt.spoken(t) for t in txt.split()), VOZES[quem.rstrip('~')], VOZ / f"{sc['id']}_{k}"))
        print(f'Vozes: {len(jobs)} trechos, {sum(len(j[0]) for j in jobs)} caracteres (o cache evita repetir)')
        with cf.ThreadPoolExecutor(2) as ex:
            list(ex.map(lambda j: b2.tts(*j), jobs))

    # 2) cenas
    scenes, specs, cursor, manims = [], [], 0, []
    clipe_fim = {}  # src -> segundo onde a última cena com esse clipe parou (para 'continua')
    for sc in mod.SCENES:
        sid = sc['id']
        vis = json.loads(json.dumps(sc['visual']))
        lead = sc.get('lead', 0.25)
        pad = sc.get('pad', 0.5)
        events, words, forced, voices, cortes, chat, inicios = [], [], set(), [], [], [], []
        if 'text' in sc:
            n = narrar(sid, sc['text'], VOZ / sid, lead, vis, memes, sfx, avisos, args.sem_voz)
            events += n['events']
            words += n['words']
            forced |= n['forced']
            cortes += n['cortes']
            end = lead + n['dur'] + max(0.0, n['extra'])
            if n['audio']:
                voices.append(dict(at=round(lead * FPS), src=f'voice3/{sid}.mp3'))
        else:
            t = lead
            for k, (quem, txt) in enumerate(sc['falas']):
                base = VOZ / f'{sid}_{k}'
                inicios.append(round(t * FPS))
                if quem == 'N':
                    n = narrar(sid, txt, base, t, vis, memes, sfx, avisos, args.sem_voz)
                    events += n['events']
                    off = len(words)
                    words += n['words']
                    forced |= {off + i for i in n['forced']}
                    cortes += n['cortes']
                    if n['audio']:
                        voices.append(dict(at=round(t * FPS), src=f'voice3/{sid}_{k}.mp3'))
                    t += n['dur'] + max(0.0, n['extra']) + 0.3
                else:
                    pensa = quem.endswith('~')
                    quem_id = quem.rstrip('~')
                    if txt.strip('. ') and not args.sem_voz:
                        _, dur = b2.tts(' '.join(bt.spoken(x) for x in txt.split()), VOZES[quem_id], base)
                        src = f'voice3/{sid}_{k}.mp3'
                        if pensa:  # voz interior: eco curto, um pouco abafada
                            interior = base.with_name(base.name + '_pensa.mp3')
                            if not interior.exists() or interior.stat().st_mtime < base.with_suffix('.mp3').stat().st_mtime:
                                subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(base.with_suffix('.mp3')), '-af',
                                                'highpass=f=160,lowpass=f=7000,aecho=0.8:0.6:45|90:0.28|0.16,volume=1.1',
                                                str(interior)], check=True)
                            src = f'voice3/{interior.name}'
                            events.append(dict(type='sfx', at=round(t * FPS), id='swoosh-air', file=sfx['swoosh-air'], vol=0.45))
                        voices.append(dict(at=round(t * FPS), src=src))
                    else:
                        dur = max(1.3, len(txt) / 15)
                    chat.append(dict(id=quem_id, texto=txt, at=round(t * FPS), dur=round(dur * FPS), pensa=pensa))
                    t += dur + 0.35
            vis.setdefault('props', {})['chat'] = chat
            end = t
        duration = round((end + pad) * FPS)
        if vis.get('name') == 'ILManim':  # vira um clipe; o render do Manim usa a duração da cena
            cena = vis['props']['cena']
            manims.append(dict(id=sid, cena=cena, dur=round(duration / FPS, 3)))
            vis = dict(type='component', name='ILClipe', props=dict(src=f'ilha/manim/{sid}.mp4', inicio=0))
        if vis.get('name') == 'ILClipe':
            src = vis['props']['src']
            if vis['props'].get('inicio') == 'continua':
                vis['props']['inicio'] = round(clipe_fim.get(src, 0.0), 3)
            clipe_fim[src] = float(vis['props'].get('inicio') or 0) + duration / FPS
        if vis.get('name') == 'IL3D':
            specs += tomadas_da_cena(sid, vis, duration, cortes, [c for c in chat if not c.get('pensa')], inicios)
            vis['props']['eliminados'] = [e for e in events if e['type'] == 'elim']
            events = [e for e in events if e['type'] != 'elim']
            for e in vis['props']['eliminados']:
                events.append(dict(type='sfx', at=e['at'], id='boom', file=sfx['boom'], vol=0.8))
        for ev in events:
            if ev['type'] in ('meme', 'txt'):
                ev['dur'] = max(12, min(ev['dur'], duration - ev['at']))
        cap = bt.caption_groups(words, forced) if words else []
        events += [dict(type='voz', at=v['at'], src=v['src']) for v in voices]
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
    partidas = {'oficial': json.loads((LOGS / 'partida.json').read_text()),
                'teste': json.loads((LOGS / 'partida_v2_abortada.json').read_text())}
    timeline = dict(fps=FPS, width=1920, height=1080, durationInFrames=cursor, scenes=scenes, chapters=chapters,
                    clips={}, memes=memes, data=dict(partidas=partidas))
    import hud3  # HUD sem voltar no tempo e mortes só depois do ELIMINADO
    hud3.ajustar(timeline)
    suf = f'_{args.nome}' if args.nome else ''
    (PUBLIC / f'timeline3{suf}.json').write_text(json.dumps(timeline, ensure_ascii=False))
    TOMADAS.with_name(f'tomadas3{suf}.json').write_text(json.dumps(specs, ensure_ascii=False, indent=1))
    TOMADAS.with_name(f'manim3{suf}.json').write_text(json.dumps(manims, ensure_ascii=False, indent=1))
    print(f'Linha do tempo: {len(scenes)} cenas, {cursor} quadros ({cursor / FPS / 60:.2f} min); '
          f'{len(specs)} tomadas 3D, {sum(s["quadros"] for s in specs)} quadros de Blender')
    for c in chapters:
        print(f"  {c['title']:28s} {c['start'] / FPS / 60:5.2f} → {c['end'] / FPS / 60:5.2f} min")
    for w in avisos:
        print('AVISO:', w)


if __name__ == '__main__':
    main()
