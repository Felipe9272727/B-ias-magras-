#!/usr/bin/env python3
"""60 Segundos das IAs: gera as vozes (narrador + uma voz por IA) e escreve remotion/public/timeline_s60.json.
Mesmo formato de roteiro e de timeline do Overcooked (build_timeline_oc.py), com o que muda no 60 Segundos:

- Coleta (S60Coleta / S60Grade): o clipe 3D pré-renderizado anda no tempo do JOGO, em segundos (`de` é o segundo
  inicial; sem `de`, continua de onde a cena anterior da mesma partida parou). Falas da IA na coleta:
  (ia, texto, segundo[, opções]) — o texto vem do log (coleta.falas: `fala` ou, com {'pensa': True}, `pensamento`)
  e o jogo chega naquele segundo enquanto a voz toca. Sem falas, `vel` é calculado para emendar na próxima cena da
  mesma partida (de 0,35 a 3) e o selo "⏩ n×" aparece quando passa de 1,6.
- Abrigo (S60Dia): um dia do log. Falas da IA no dia: (ia, texto, ('dia', n)) — texto do `diario` ou, com
  {'pensa': True}, do `pensamento` da resposta da IA naquele dia. A animação do dia (diário abrindo, escolha marcada,
  linhas) é acelerada até 2× para caber na narração, com o selo quando passa de 1,6.
- As marcações do narrador são as mesmas do canal ([[m]] [[s]] [[p]] [[t]] [[cc]] [[g]] [[x]]).

Uso: python3 build_timeline_s60.py [--sem-voz] [--contar] [--parcial]   (a chave fica em ~/.config/elevenlabs/api_key)
"""
import argparse
import importlib.util
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline as bt  # noqa: E402
import build_timeline_au2 as au  # noqa: E402
import build_timeline_oc as oc  # noqa: E402  (marcações [[g]]/[[x]] e as regras de grito)

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'remotion' / 'public'
VOZ = PUBLIC / 'voice_s60'
PARTIDAS = PUBLIC / 'sessenta' / 'partidas'
ABRIGO = PUBLIC / 'sessenta' / 'abrigo2d'
FPS = 30

au.VOZ = VOZ
NARRADOR = au.NARRADOR
# uma voz por IA (as mesmas empresas usam as mesmas vozes dos outros vídeos do canal)
VOZES = {
    'DeepSeek': 'YU8EsJtXFMyKMxYtheDk',  # Mário (o Deep do Overcooked)
    'Claude': '2CECaLAGTS5NRGxgbcxr',  # Davi (o Claudinho)
    'GPT': 'YbP0Eq5RE5uOoCEl7F3T',  # Weverton (o Gepeto)
    'MiniMax': '7lu3ze7orhWaNeSPowWx',  # Lucas
}
bt.PRONUNCIA = {
    **oc.bt.PRONUNCIA,
    'MiniMax': 'Mini Mécs', 'Sonnet': 'Sónet', 'Terra': 'Térra', 'Seconds': 'Sécands', 'Juju': 'Jujú', 'Tico': 'Tíco',
    'Kenney': 'Quêni', 'Blender': 'Blénder', 'CC0': 'cê cê zero', 'DeepSeek': 'Dípsíque', 'GPT': 'GêPêTê',
}
bt.LEGENDA = []
bt.TERMOS = {'DeepSeek', 'MiniMax', 'Sonnet', 'Kenney', 'CC0'}
SELO = 1.6


def carregar_roteiro():
    spec = importlib.util.spec_from_file_location('roteiro_s60', ROOT / 'roteiro' / 'roteiro_s60.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def ler_partidas(nomes):
    out = {}
    for n in sorted(nomes):
        f = PARTIDAS / f'{n}.json'
        if f.exists():
            out[n] = json.loads(f.read_text())
        else:
            print(f'AVISO: falta {f} (rode sessenta/ferramentas/partida_remotion.mjs {n})')
    return out


def ler_abrigo():
    figs = {}
    for p in ('pai', 'mae', 'filha', 'filho'):
        f = ABRIGO / 'personagens' / p / f'{p}.json'
        if f.exists():
            figs[p] = json.loads(f.read_text())
    itens = ABRIGO / 'itens' / 'itens.json'
    return dict(cena=json.loads((ABRIGO / 'cena.json').read_text()), itens=json.loads(itens.read_text()) if itens.exists() else {}, figs=figs)


def duracao_dia(d):
    """Mesma conta de duracaoDia em sessenta/Dia.tsx (em segundos)."""
    ev = d.get('evento')
    return 2.6 + (5.5 if ev and not ev.get('automatico') else 1.2) + len(d.get('diario') or []) * 2.4 + 2.2


def dia_do_log(pt, n):
    return next((d for d in pt['dias'] if d['dia'] == n and not d.get('virada')), None)


def voz_ia(txt, op):
    return ('[whispers] ' + txt) if op.get('pensa') else oc.fala_chef(txt)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sem-voz', action='store_true')
    ap.add_argument('--contar', action='store_true')
    ap.add_argument('--parcial', action='store_true', help='usa as vozes que já existem e estima o resto (não chama a API)')
    args = ap.parse_args()
    au.SO_CONTAR = args.contar
    VOZ.mkdir(parents=True, exist_ok=True)
    mod = carregar_roteiro()
    nomes = {sc['visual']['props'][k] for sc in mod.SCENES for k in ('partida',) if sc['visual'].get('props', {}).get(k)}
    nomes |= {c['partida'] for sc in mod.SCENES for c in sc['visual'].get('props', {}).get('clipes', [])}
    P = ler_partidas(nomes)
    memes = {x['id']: dict(file=Path(x['file_gif']).name, width=x['width'], height=x['height'], duration=x['duration_sec'])
             for x in json.loads((PUBLIC / 'gifs' / 'catalog.json').read_text())}
    sfx_files = {x['id']: x['file'] for x in json.loads((PUBLIC / 'sfx' / 'sfx.json').read_text())}
    warnings = []

    # 1) vozes, em ordem do vídeo
    if not args.sem_voz and not args.parcial:
        jobs = []
        for sc in mod.SCENES:
            if 'text' in sc:
                tokens, _ = bt.parse(re.sub(r'\s*\.\.\.\s*(?=\[\[)', ' ', sc['text']))
                falado = ' '.join(bt.spoken(t) for t in tokens)
                if falado.strip():
                    jobs.append((falado, NARRADOR, VOZ / sc['id']))
            else:
                for k, item in enumerate(sc['falas']):
                    quem, txt = item[0], item[1]
                    if quem == 'N':
                        tokens, _ = bt.parse(re.sub(r'\s*\.\.\.\s*(?=\[\[)', ' ', txt))
                        jobs.append((' '.join(bt.spoken(t) for t in tokens), NARRADOR, VOZ / f"{sc['id']}_{k}"))
                    else:
                        op = item[3] if len(item) > 3 else {}
                        jobs.append((voz_ia(txt, op), VOZES[quem], VOZ / f"{sc['id']}_{k}"))
        print(f'Vozes: {len(jobs)} trechos, {sum(len(j[0]) for j in jobs)} caracteres (cache evita repetir)')
        try:
            for j in jobs:
                au.tts(*j)
        except SystemExit as e:
            if 'SEM_COTA' not in str(e):
                raise
            print('COTA ESGOTADA; o que já foi gerado fica no cache. Rode de novo com --parcial para estimar o resto.')
            return
        if args.contar:
            print(f'Faltam gerar: {len(au.FALTA)} trechos, {sum(au.FALTA)} caracteres')
            return
    if args.parcial:
        au.SO_CONTAR = True

    def dur_voz(texto, voz, base, sem):
        if args.parcial and not sem:
            w, d = au.tts(texto, voz, base)
            return d, bool(w)
        if sem:
            mp3, wj = base.with_suffix('.mp3'), base.with_suffix('.words.json')
            if mp3.exists() and wj.exists():
                return json.loads(wj.read_text())['dur'], True
            return max(0.8, len(texto) / 15), False
        return au.tts(texto, voz, base)[1], True

    def confere(sid, quem, txt, onde, op, pr):
        """A fala (ou o pensamento) tem que estar no log, naquele segundo da coleta ou naquele dia.
        Na coleta, devolve o segundo da DECISÃO (o fim da ação anterior), que é quando a IA fala."""
        pt = P.get(pr.get('partida')) or (P.get(pr['clipes'][0]['partida']) if pr.get('clipes') else None)
        if not pt:
            return None
        campo = 'pensamento' if op.get('pensa') else ('diario' if isinstance(onde, tuple) else 'fala')
        alvo = bt.norm(txt.replace('...', '')).strip()
        if isinstance(onde, tuple):
            d = dia_do_log(pt, onde[1])
            orig = ((d or {}).get('resposta') or {}).get(campo, '')
            if alvo not in bt.norm(orig):
                warnings.append(f'{sid}: {campo} de {quem} no dia {onde[1]} não bate com o log: {txt[:50]!r} / log: {orig[:70]!r}')
            return None
        falas = pt['coleta'].get('falas', [])
        cand = [(abs(f['gasto'] / 1000 - onde), i) for i, f in enumerate(falas) if alvo and alvo in bt.norm(f.get(campo, ''))]
        if not cand:
            perto = ' | '.join(f.get(campo, '') for f in falas if abs(f['gasto'] / 1000 - onde) <= 2)
            warnings.append(f'{sid}: {campo} de {quem} perto de {onde}s não bate com o log: {txt[:50]!r} / log: {perto[:90]!r}')
            return None
        _, i = min(cand)
        return round(falas[i - 1]['gasto'] / 1000, 2) if i > 0 else 0.0

    # 2) cenas
    fim_partida = {}  # segundo de jogo onde cada coleta parou
    scenes, cursor = [], 0
    for sc in mod.SCENES:
        sid = sc['id']
        sem = args.sem_voz
        vis = json.loads(json.dumps(sc['visual']))
        pr = vis.setdefault('props', {})
        nome = vis.get('name')
        coleta = nome in ('S60Coleta', 'S60Grade')
        chave_coleta = pr.get('partida') if nome == 'S60Coleta' else ('grade:' + ','.join(c['partida'] for c in pr.get('clipes', [])) if nome == 'S60Grade' else None)
        if coleta and 'de' not in pr:
            pr['de'] = fim_partida.get(chave_coleta, 0)
        lead = sc.get('lead', 0.5 if nome == 'S60Titulo' else 0.25)
        pad = sc.get('pad', 0.5)
        events, words, forced, voices = [], [], set(), []
        pendente = False
        if 'text' in sc:
            n = au.narrar(sid, sc['text'], VOZ / sid, lead, vis, memes, sfx_files, warnings, sem)
            events += n['events']
            words += n['words']
            forced |= n['forced']
            end = lead + n['dur'] + max(0.0, n['extra'])
            if n['audio']:
                voices.append(dict(at=round(lead * FPS), src=f'voice_s60/{sid}.mp3'))
            elif re.sub(r'\[\[.*?\]\]', '', sc['text']).strip():
                pendente = True
        else:
            t = lead
            for k, item in enumerate(sc['falas']):
                quem, txt = item[0], item[1]
                base = VOZ / f'{sid}_{k}'
                if quem == 'N':
                    n = au.narrar(sid, txt, base, t, vis, memes, sfx_files, warnings, sem)
                    events += n['events']
                    off = len(words)
                    words += n['words']
                    forced |= {off + i for i in n['forced']}
                    if n['audio']:
                        voices.append(dict(at=round(t * FPS), src=f'voice_s60/{sid}_{k}.mp3'))
                    elif re.sub(r'\[\[.*?\]\]', '', txt).strip():
                        pendente = True
                    t += n['dur'] + max(0.0, n['extra']) + 0.3
                    continue
                onde = item[2] if len(item) > 2 else None
                op = item[3] if len(item) > 3 else {}
                d, tem = dur_voz(voz_ia(txt, op), VOZES[quem], base, sem)
                at = round(t * FPS)
                if tem:
                    voices.append(dict(at=at, src=f'voice_s60/{sid}_{k}.mp3'))
                else:
                    pendente = True
                decisao = confere(sid, quem, txt, onde, op, pr) if onde is not None else None
                if coleta and isinstance(onde, (int, float)):
                    # o jogo chega no segundo da decisão quando a voz começa e anda devagar enquanto ela toca
                    seg = decisao if decisao is not None else onde
                    events.append(dict(type='tk', at=max(1, at), tick=seg))
                    events.append(dict(type='tk', at=round((t + d) * FPS), tick=seg + 0.9))
                if op.get('trig'):
                    events.append(dict(type='trig', at=at, dur=round(min(d, 2.2) * FPS)))
                t += d + 0.35
            end = t
        duration = round(max(end + pad, sc.get('min', 0)) * FPS)
        for ev in events:
            if ev['type'] in ('meme', 'txt'):
                ev['dur'] = max(12, min(ev['dur'], duration - ev['at']))
        cap = bt.caption_groups(words, forced) if words else []
        events += [dict(type='voz', at=v['at'], src=v['src']) for v in voices]
        if coleta:
            tks = sorted([e for e in events if e['type'] == 'tk'], key=lambda e: e['at'])
            if tks and 'vel' not in pr:
                pr['vel'] = 0.4  # depois da última fala, a narração comenta o lance em câmera lenta
            vel = pr.get('vel', 1)
            fim = (tks[-1]['tick'] + (duration - tks[-1]['at']) / FPS * vel) if tks else pr['de'] + duration / FPS * vel
            if not pr.get('replay'):
                fim_partida[chave_coleta] = min(fim, 63.4)
            pr['fim'] = round(fim, 3)
        if nome == 'S60Dia' and 'vel' not in pr:
            d = dia_do_log(P.get(pr['partida'], {'dias': []}), pr['dia'])
            if d:
                v = duracao_dia(d) / (duration / FPS)
                pr['vel'] = round(max(1.0, min(2.0, v)), 3)
                if pr['vel'] >= SELO and 'rotulo' not in pr:
                    pr['rotulo'] = f"⏩ {round(pr['vel'])}×"
            else:
                warnings.append(f"{sid}: dia {pr['dia']} não existe em {pr['partida']}")
        scenes.append(dict(
            id=sid, chapter=mod.CHAPTERS[sc['chapter']], chapterKey=sc['chapter'], start=cursor, duration=duration,
            audio=None, audioOffset=0, audioDuration=0, words=words, visual=vis, segments=[],
            events=sorted(events, key=lambda e: e['at']), capGroups=cap, **({'pendente': True} if pendente else {}),
        ))
        cursor += duration

    # 3) vel automática da coleta narrada (sem falas): emenda na próxima cena da mesma partida que tem 'de'
    for i, s in enumerate(scenes):
        pr = s['visual'].get('props', {})
        if s['visual'].get('name') != 'S60Coleta' or pr.get('replay') or 'vel' in mod.SCENES[i]['visual'].get('props', {}) or pr.get('congela') is not None:
            continue
        if any(e['type'] == 'tk' for e in s['events']):
            continue
        prox = next((x for x in scenes[i + 1:] if x['visual'].get('name') == 'S60Coleta' and x['visual']['props']['partida'] == pr['partida'] and not x['visual']['props'].get('replay')), None)
        if not prox or 'de' not in next(sc for sc in mod.SCENES if sc['id'] == prox['id'])['visual'].get('props', {}):
            continue
        alvo = prox['visual']['props']['de']
        if alvo <= pr['de']:
            warnings.append(f"{s['id']}: a próxima cena de {pr['partida']} ({prox['id']}, de {alvo}) começa antes desta ({pr['de']:.1f})")
            continue
        v = (alvo - pr['de']) / (s['duration'] / FPS)
        pr['vel'] = round(max(0.35, min(3.0, v)), 3)
        pr['fim'] = round(pr['de'] + s['duration'] / FPS * pr['vel'], 3)
        if pr['vel'] >= SELO and pr.get('rotulo') in (None, 'auto'):
            pr['rotulo'] = f"⏩ {round(pr['vel'])}×"
        elif pr.get('rotulo') == 'auto':
            pr.pop('rotulo')

    chapters = []
    for s in scenes:
        if not chapters or chapters[-1]['id'] != s['chapterKey']:
            chapters.append(dict(id=s['chapterKey'], title=s['chapter'], start=s['start'], end=s['start'] + s['duration']))
        else:
            chapters[-1]['end'] = s['start'] + s['duration']
    timeline = dict(fps=FPS, width=1920, height=1080, durationInFrames=cursor, scenes=scenes, chapters=chapters, clips={}, memes=memes,
                    data=dict(partidas=P, abrigo=ler_abrigo()))
    (PUBLIC / 'timeline_s60.json').write_text(json.dumps(timeline, ensure_ascii=False))
    print(f'Linha do tempo: {len(scenes)} cenas, {cursor} quadros ({cursor / FPS / 60:.2f} min)')
    for c in chapters:
        print(f"  {c['title']:44s} {c['start'] / FPS / 60:5.2f} → {c['end'] / FPS / 60:5.2f} min")
    for s in scenes:
        p = s['visual'].get('props', {})
        if s['visual'].get('name') == 'S60Coleta' and p.get('fim', 0) > 63.5:
            print(f"AVISO: {s['id']} passa do fim do clipe de {p['partida']} (segundo {p['fim']})")
    for w in warnings:
        print('AVISO:', w)


if __name__ == '__main__':
    main()
