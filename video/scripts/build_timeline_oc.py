#!/usr/bin/env python3
"""Overcooked das IAs: gera as vozes (narrador + os 8 chefs) e escreve remotion/public/timeline_oc.json.
Mesmo formato de roteiro e de timeline do Among Us 2 (build_timeline_au2.py), com o que muda no Overcooked:

- Cenas de jogo (OCJogo) andam no tempo da partida: `de` é o tique inicial; sem `de`, a cena continua de onde a
  cena anterior da mesma partida parou (o jogo não pula). `vel` acelera (2 = dobro).
- Falas dos chefs (cena CH): (chef, texto, tique[, opções]). O texto vem do log (nunca reescrito) e a partida anda
  até aquele tique enquanto a voz toca. Opções: {'trig': True} põe o efeito TRIGGERED durante a fala.
- Marcações novas no texto do narrador: [[g:dur:TEXTO]] TRIGGERED, [[x:dur:força]] tremida, [[k:tique]] sincronia.

Uso: python3 build_timeline_oc.py [--sem-voz] [--contar]   (a chave fica em ~/.config/elevenlabs/api_key)
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

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'remotion' / 'public'
VOZ = PUBLIC / 'voice_oc'
LOGS = ROOT.parent / 'overcooked' / 'logs'
FPS = 30
TICK_F = 60  # quadros por tique em velocidade normal (1 tique = 2 s)

au.VOZ = VOZ
NARRADOR = au.NARRADOR
VOZES = {
    'Deep': 'YU8EsJtXFMyKMxYtheDk',  # Mário
    'Seek': 'dX7gRq1dIvLTgUaWpEFn',  # Rafael Valente
    'Claudinho': '2CECaLAGTS5NRGxgbcxr',  # Davi
    'Claudete': 'GDzHdQOi6jjf8zaXhCYD',  # Raquel
    'Gepeto': 'YbP0Eq5RE5uOoCEl7F3T',  # Weverton
    'Gepeta': 'ohZOfA9iwlZ5nOsoY7LB',  # Roberta
    'Gêmeo': '7lu3ze7orhWaNeSPowWx',  # Lucas
    'Gêmea': '33B4UnXyTNbgLmdEDh5P',  # Keren
}
bt.PRONUNCIA = {
    'Haiku': 'Raicu', 'GPT': 'GêPêTê', 'Gemini': 'Djêmini', 'Overcooked': 'Ôvercúqued', 'DeepSeek': 'Dípsíque', 'Deep': 'Dípi', 'Seek': 'Síqui',
    'Gepeto': 'Gepéto', 'Gepeta': 'Gepéta', 'JSON': 'Jêisson', 'tokens': 'tôkens', 'Luna': 'Lúna', 'Flash': 'Fléch',
}
bt.LEGENDA = []
bt.TERMOS = {'JSON', 'tokens', 'DeepSeek', 'Overcooked'}


def gritando(s):
    letras = re.sub(r'[^A-Za-zÀ-ú]', '', s)
    return len(letras) > 6 and len(re.sub(r'[^A-ZÀ-Ý]', '', letras)) / len(letras) > 0.6


def fala_chef(txt):
    """Texto que vai pro TTS: grito ganha a tag de áudio e sai da caixa alta (o modelo lê CAIXA ALTA soletrando)."""
    t = re.sub(r'\bporra\b', 'pô', txt, flags=re.I)  # palavrão do log: na voz vira "pô"; na tela aparece censurado
    if gritando(t):
        t = t.lower()
        t = re.sub(r'(^|[.!?]\s+)(\w)', lambda m: m.group(1) + m.group(2).upper(), t)
        return '[shouting] ' + t
    return t


def censura(txt):
    return re.sub(r'\b(p)orra\b', r'\1*rra', txt, flags=re.I)


def carregar_roteiro():
    spec = importlib.util.spec_from_file_location('roteiro_oc', ROOT / 'roteiro' / 'roteiro_oc.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def logs():
    out = {}
    for n in ('fase1', 'fase2', 'fase3', 'coop1'):
        f = LOGS / f'{n}.json'
        if f.exists():
            d = json.loads(f.read_text())
            d.pop('uso', None)
            out[n] = d
    return out


def marcas_oc(kind, rest, f, events):
    if kind == 'g':
        parts = rest.split(':', 1)
        events.append(dict(type='trig', at=f, dur=round(float(parts[0] or 1.4) * FPS), **({'text': parts[1]} if len(parts) > 1 and parts[1] else {})))
        events.append(dict(type='sfx', at=f, id='bass-pulse', file='bass-pulse.mp3', vol=0.55))
        return True
    if kind == 'x':
        parts = rest.split(':')
        events.append(dict(type='shake', at=f, dur=round(float(parts[0] or 0.6) * FPS), force=float(parts[1]) if len(parts) > 1 and parts[1] else 14))
        return True
    return False


_marcas_au = au.marcas


def _marcas(kind, rest, f, vis, memes, sfx_files, warnings, sid, events):
    """As marcações do Among Us 2 mais [[g]] (TRIGGERED) e [[x]] (tremida)."""
    if marcas_oc(kind, rest, f, events):
        return 0
    return _marcas_au(kind, rest, f, vis, memes, sfx_files, warnings, sid, events)


au.marcas = _marcas
narrar = au.narrar


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sem-voz', action='store_true')
    ap.add_argument('--contar', action='store_true')
    ap.add_argument('--parcial', action='store_true', help='usa as vozes que já existem e estima o resto (não chama a API)')
    ap.add_argument('--so', default='', help='gera voz só destas cenas (as outras ficam com a duração estimada)')
    args = ap.parse_args()
    au.SO_CONTAR = args.contar
    VOZ.mkdir(parents=True, exist_ok=True)
    mod = carregar_roteiro()
    L = logs()
    memes = {x['id']: dict(file=Path(x['file_gif']).name, width=x['width'], height=x['height'], duration=x['duration_sec'])
             for x in json.loads((PUBLIC / 'gifs' / 'catalog.json').read_text())}
    sfx_files = {x['id']: x['file'] for x in json.loads((PUBLIC / 'sfx' / 'sfx.json').read_text())}
    # os sons do jogo (overcooked/sfx) também valem nas marcações [[s:...]]
    sfx_files.update({f.stem: f'overcooked/sfx/{f.name}' for f in (PUBLIC / 'overcooked' / 'sfx').glob('*.mp3') if f.stem != 'amostra_sfx_oc'})
    warnings = []

    so = set(filter(None, args.so.split(',')))
    # 1) vozes, em ordem do vídeo
    if not args.sem_voz and not args.parcial:
        jobs = []
        for sc in mod.SCENES:
            if so and sc['id'] not in so:
                continue
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
                        jobs.append((('[whispers] ' + txt) if op.get('pensa') else fala_chef(txt), VOZES[quem], VOZ / f"{sc['id']}_{k}"))
        print(f'Vozes: {len(jobs)} trechos, {sum(len(j[0]) for j in jobs)} caracteres (cache evita repetir)')
        try:
            for j in jobs:
                au.tts(*j)
        except SystemExit as e:
            if 'SEM_COTA' not in str(e):
                raise
            print('COTA ESGOTADA; o que já foi gerado fica no cache. Rode de novo com --sem-voz para estimar o resto.')
            return
        if args.contar:
            print(f'Faltam gerar: {len(au.FALTA)} trechos, {sum(au.FALTA)} caracteres')
            return

    if args.parcial:
        au.SO_CONTAR = True  # tts(): devolve o cache; sem cache, só estima (nunca chama a API)

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

    # 2) cenas
    fim_partida = {}  # tique onde cada partida parou (para as cenas de jogo seguidas)
    scenes, cursor = [], 0
    for sc in mod.SCENES:
        sid = sc['id']
        sem = args.sem_voz or bool(so and sid not in so)
        vis = json.loads(json.dumps(sc['visual']))
        pr = vis.setdefault('props', {})
        jogo = vis.get('name') == 'OCJogo'
        if jogo and 'de' not in pr:
            pr['de'] = fim_partida.get(pr['log'], 0)
        lead = sc.get('lead', 0.5 if vis.get('name') == 'OCTitulo' else 0.25)
        pad = sc.get('pad', 0.5)
        events, words, forced, voices = [], [], set(), []
        pendente = False  # alguma voz da cena ainda não foi gerada
        if 'text' in sc:
            n = narrar(sid, sc['text'], VOZ / sid, lead, vis, memes, sfx_files, warnings, sem)
            events += n['events']
            words += n['words']
            forced |= n['forced']
            end = lead + n['dur'] + max(0.0, n['extra'])
            if n['audio']:
                voices.append(dict(at=round(lead * FPS), src=f'voice_oc/{sid}.mp3'))
            elif re.sub(r'\[\[.*?\]\]', '', sc['text']).strip():
                pendente = True
        else:
            t = lead
            for k, item in enumerate(sc['falas']):
                quem, txt = item[0], item[1]
                base = VOZ / f'{sid}_{k}'
                if quem == 'N':
                    n = narrar(sid, txt, base, t, vis, memes, sfx_files, warnings, sem)
                    events += n['events']
                    off = len(words)
                    words += n['words']
                    forced |= {off + i for i in n['forced']}
                    if n['audio']:
                        voices.append(dict(at=round(t * FPS), src=f'voice_oc/{sid}_{k}.mp3'))
                    elif re.sub(r'\[\[.*?\]\]', '', txt).strip():
                        pendente = True
                    t += n['dur'] + max(0.0, n['extra']) + 0.3
                    continue
                tique = item[2] if len(item) > 2 else None
                op = item[3] if len(item) > 3 else {}
                d, tem = dur_voz(('[whispers] ' + txt) if op.get('pensa') else fala_chef(txt), VOZES[quem], base, sem)
                at = round(t * FPS)
                if tem:
                    voices.append(dict(at=at, src=f'voice_oc/{sid}_{k}.mp3'))
                else:
                    pendente = True
                if jogo and tique is not None:
                    # a partida chega ao começo do tique quando a voz começa e fica nele enquanto a voz toca
                    events.append(dict(type='tk', at=max(1, at), tick=tique + 0.05))
                    events.append(dict(type='tk', at=round((t + d) * FPS), tick=tique + 0.95))
                # conferência: a fala (ou o pensamento) tem que estar no log, naquele tique, daquele chef
                if tique is not None and pr.get('log') in L:
                    cz = pr.get('cz', next((i for i, c in enumerate(L[pr['log']]['cozinhas']) if any(x['nome'] == quem for x in c['chefs'])), 0))
                    q = L[pr['log']]['tiques'][tique]['cozinhas'][cz]['chefs'].get(quem, {})
                    orig = q.get('pensa' if op.get('pensa') else 'fala', '')
                    if bt.norm(txt.replace('...', '')).strip() not in bt.norm(orig) and not all(bt.norm(p).strip() in bt.norm(orig) for p in txt.split('...') if p.strip()):
                        warnings.append(f'{sid}: fala de {quem} no t{tique} não bate com o log: {txt[:50]!r} / log: {orig[:60]!r}')
                if op.get('trig') or (op.get('trig') is None and gritando(txt) and op.get('auto', True) and sc.get('trigAuto')):
                    events.append(dict(type='trig', at=at, dur=round(min(d, 2.2) * FPS)))
                if op.get('pensa') and jogo:
                    pr.setdefault('pensaJanelas', []).append(dict(chef=quem, de=at, ate=round((t + d + 0.4) * FPS)))
                if op.get('x'):
                    events.append(dict(type='shake', at=at, dur=round(min(d, 1.0) * FPS), force=op['x']))
                t += d + 0.3
            end = t
        duration = round(max(end + pad, sc.get('min', 0)) * FPS)
        for ev in events:
            if ev['type'] in ('meme', 'txt'):
                ev['dur'] = max(12, min(ev['dur'], duration - ev['at']))
        # legendas: as falas dos chefs viram um grupo cada; a narração usa as legendas seletivas de sempre
        # (as falas dos chefs não ganham legenda: já aparecem no balão da cozinha)
        cap = bt.caption_groups(words, forced) if words else []
        events += [dict(type='voz', at=v['at'], src=v['src']) for v in voices]
        if jogo:
            tks = sorted([e for e in events if e['type'] == 'tk'], key=lambda e: e['at'])
            if tks and 'vel' not in pr:
                pr['vel'] = 0.3  # depois da última fala, a narração comenta o lance em câmera lenta
            vel = pr.get('vel', 1)
            if tks:
                fim = tks[-1]['tick'] + (duration - tks[-1]['at']) / TICK_F * vel
            else:
                fim = pr['de'] + duration / TICK_F * vel
            if not pr.get('replay'):
                fim_partida[pr['log']] = min(fim, len(L[pr['log']]['tiques']))
            if pr.get('congela') is not None:
                fim = pr['congela']
            pr['fim'] = round(fim, 3)
        scenes.append(dict(
            id=sid, chapter=mod.CHAPTERS[sc['chapter']], chapterKey=sc['chapter'], start=cursor, duration=duration,
            audio=None, audioOffset=0, audioDuration=0, words=words, visual=vis, segments=[],
            events=sorted(events, key=lambda e: e['at']), capGroups=cap, **({'pendente': True} if pendente else {}),
        ))
        cursor += duration

    # 3) vel automática: a cena de jogo narrada (sem 'vel' e sem falas) anda no ritmo certo pra emendar na próxima
    #    cena da mesma partida que tem 'de' marcado (assim o relógio do jogo nunca volta e nunca pula muito)
    for i, s in enumerate(scenes):
        pr = s['visual'].get('props', {})
        if s['visual'].get('name') != 'OCJogo' or pr.get('replay') or 'vel' in mod.SCENES[i]['visual'].get('props', {}) or pr.get('congela') is not None:
            continue
        if any(e['type'] == 'tk' for e in s['events']):
            continue
        prox = next((x for x in scenes[i + 1:] if x['visual'].get('name') == 'OCJogo' and x['visual']['props']['log'] == pr['log'] and not x['visual']['props'].get('replay')), None)
        if not prox or 'de' not in next(sc for sc in mod.SCENES if sc['id'] == prox['id'])['visual'].get('props', {}):
            continue
        alvo = prox['visual']['props']['de']
        if alvo <= pr['de']:
            warnings.append(f"{s['id']}: a próxima cena de {pr['log']} ({prox['id']}, de {alvo}) começa antes desta ({pr['de']:.1f})")
            continue
        v = (alvo - pr['de']) / (s['duration'] / TICK_F)
        pr['vel'] = round(max(0.35, min(4.0, v)), 3)
        pr['fim'] = round(pr['de'] + s['duration'] / TICK_F * pr['vel'], 3)
        if pr['vel'] >= 1.6 and (pr.get('rotulo') in (None, 'auto')):
            pr['rotulo'] = f"ACELERADO {round(pr['vel'])}×"
        elif pr.get('rotulo') == 'auto':
            pr.pop('rotulo')
    # cenas com fala que começam antes do fim da anterior da mesma partida
    fim = {}
    for s in scenes:
        pr = s['visual'].get('props', {})
        if s['visual'].get('name') != 'OCJogo':
            continue
        if not pr.get('replay') and pr['de'] < fim.get(pr['log'], 0) - 0.6:
            warnings.append(f"{s['id']}: volta no tempo de {pr['log']} (de {pr['de']} < {fim[pr['log']]:.1f})")
        if not pr.get('replay'):
            fim[pr['log']] = max(fim.get(pr['log'], 0), pr.get('fim', pr['de']))

    chapters = []
    for s in scenes:
        if not chapters or chapters[-1]['id'] != s['chapterKey']:
            chapters.append(dict(id=s['chapterKey'], title=s['chapter'], start=s['start'], end=s['start'] + s['duration']))
        else:
            chapters[-1]['end'] = s['start'] + s['duration']
    timeline = dict(fps=FPS, width=1920, height=1080, durationInFrames=cursor, scenes=scenes, chapters=chapters, clips={}, memes=memes,
                    data=dict(logs=L))
    (PUBLIC / 'timeline_oc.json').write_text(json.dumps(timeline, ensure_ascii=False))
    print(f'Linha do tempo: {len(scenes)} cenas, {cursor} quadros ({cursor / FPS / 60:.2f} min)')
    for c in chapters:
        print(f"  {c['title']:38s} {c['start'] / FPS / 60:5.2f} → {c['end'] / FPS / 60:5.2f} min")
    for s in scenes:
        p = s['visual'].get('props', {})
        if s['visual'].get('name') == 'OCJogo' and p.get('fim', 0) > len(L[p['log']]['tiques']) + 0.5:
            print(f"AVISO: {s['id']} passa do fim da partida {p['log']} (tique {p['fim']})")
    for w in warnings:
        print('AVISO:', w)


if __name__ == '__main__':
    main()
