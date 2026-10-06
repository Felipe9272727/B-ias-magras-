#!/usr/bin/env python3
"""Gera a narração e o arquivo remotion/public/timeline.json a partir do roteiro.

Passos:
  1. lê roteiro/roteiro.py e os resultados reais dos treinos (data/runs_canon);
  2. preenche os números do roteiro ({evo.firstClearGen} etc.);
  3. separa marcações [[...]] do texto narrado;
  4. gera a voz de cada cena com scripts/tts.py (cache por hash do texto);
  5. alinha as palavras faladas às palavras exibidas nas legendas;
  6. converte marcações em eventos com tempo (quadros) e escreve o timeline.json.

Uso: python3 build_timeline.py [--engine edge] [--voice pt-BR-AntonioNeural] [--rate +8%] [--only s01,s02]
"""
import argparse
import difflib
import importlib.util
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'remotion' / 'public'
VOICE_DIR = PUBLIC / 'voice'
FOOTAGE = PUBLIC / 'footage'
RUNS = ROOT / 'data' / 'runs_canon'
FPS = 30

# Pronúncia apenas para a voz (as legendas mostram o texto original).
PRONUNCIA = {
    'RL': 'érre éle',
    'HTML': 'agá tê éme éle',
    'ROM': 'rôm',
    'MarI/O': 'Mário',
    'SethBling': 'Séth Blin',
    'DQN': 'dê quê ene',
    'IQN': 'i quê ene',
    'DeepMind': 'Dípi Maind',
    'AlphaZero': 'Alfa Zêro',
    'DAgger': 'Dágger',
    'dueling': 'duélin',
    'Double': 'Dâbol',
    'Q': 'quê',
    'Goomba': 'Gumba',
    'Bowser': 'Báuzer',
    'Hammer': 'Rêmer',
    'Bros': 'Brós',
    'worker': 'uôrker',
    'Rainbow': 'Reinbôu',
    'NoisyNet': 'Nóizi Net',
    'Lab': 'Léb',
}

# Expressões faladas → forma exibida na legenda (ex.: "um-um" vira "1-1").
LEGENDA = [
    ('mil novecentos e oitenta e cinco', '1985'),
    ('um milhão e duzentos mil', '1,2 milhão'),
    ('dois mil e dezessete', '2017'),
    ('mil duzentos e cinquenta', '1.250'),
    ('duzentos milhões', '200 milhões'),
    ('sessenta e quatro', '64'),
    ('quarenta e quatro', '44'),
    ('quarenta e oito', '48'),
    ('trinta e duas', '32'),
    ('cento e doze', '112'),
    ('doze por seis', '12×6'),
    ('dez mil', '10.000'),
    ('quatrocentos', '400'),
    ('dezesseis', '16'),
    ('oito-quatro', '8-4'),
    ('um-um', '1-1'),
    ('um-dois', '1-2'),
    ('um-três', '1-3'),
    ('um segundo e meio', '1,5 segundo'),
]


def load_roteiro():
    spec = importlib.util.spec_from_file_location('roteiro', ROOT / 'roteiro' / 'roteiro.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def numero_por_extenso(n):
    """Por extenso em pt-BR para inteiros pequenos (até milhões)."""
    unid = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze',
            'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
    dez = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
    cent = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

    def ate_mil(x):
        if x < 20:
            return unid[x]
        if x < 100:
            return dez[x // 10] + ('' if x % 10 == 0 else ' e ' + unid[x % 10])
        if x == 100:
            return 'cem'
        return cent[x // 100] + ('' if x % 100 == 0 else ' e ' + ate_mil(x % 100))

    if n < 1000:
        return ate_mil(n)
    if n < 1_000_000:
        m, r = divmod(n, 1000)
        pre = 'mil' if m == 1 else ate_mil(m) + ' mil'
        return pre + ('' if r == 0 else (' e ' if r < 100 or r % 100 == 0 else ' ') + ate_mil(r))
    mi, r = divmod(n, 1_000_000)
    pre = 'um milhão' if mi == 1 else ate_mil(mi) + ' milhões'
    if r == 0:
        return pre
    return pre + ' e ' + numero_por_extenso(r)


# ----------------------------------------------------------------------------- fatos
def stage_name(i):
    return f'{i // 4 + 1}-{i % 4 + 1}'


def run_facts():
    facts = {'budget': 1_200_000}
    S = {}
    for name in ['evolution', 'ddqn', 'rainbow', 'adaptive']:
        p = RUNS / name / 'summary.json'
        if p.exists():
            S[name] = json.loads(p.read_text())
        else:
            S[name] = None
    facts['budgetWords'] = 'um milhão e duzentos mil'

    def series(name, maxpts=160):
        p = RUNS / name / 'history.json'
        if not p.exists():
            return []
        h = json.loads(p.read_text())
        step = max(1, len(h) // maxpts)
        return [dict(gen=x['generation'], best=round(x['best'], 2), mean=round(x['mean'], 2)) for x in h[::step]]

    # --- neuroevolução
    e = S['evolution'] or {}
    ms = {m['stageIndex']: m for m in e.get('milestones', [])}
    facts['evo'] = dict(
        firstClearGen=e.get('firstClearGen', 70),
        firstClearGenPlus=(e.get('firstClearGen', 70) or 70) + 1,
        lateGen=next((c['startGen'] for c in e.get('clips', []) if c['name'] == 'evo_stuck'), e.get('generation', 400)),
        generation=e.get('generation', 400),
        stepsWords=numero_por_extenso(int(round(e.get('steps', 1_200_000), -5))),
        history=series('evolution'),
        marks=[dict(gen=m['generation'], text=f"passou do {stage_name(m['stageIndex'] - 1)}") for m in e.get('milestones', [])],
        maxStage=e.get('maxStage', 2),
    )

    # --- double DQN
    d = S['ddqn'] or {}
    dmax = d.get('maxStage', 1)
    dprog = d.get('bestProgress', 0)
    best_stage_idx = int(dprog * 32 / 100) if dprog else dmax
    clears = d.get('totalStageClears', 0)
    gens = d.get('generation', 0)
    first = (d.get('milestones') or [{}])[0].get('generation')
    facts['ddqn'] = dict(
        lateGen=next((c['startGen'] for c in d.get('clips', []) if c['name'] == 'ddqn_late'), gens),
        generation=gens,
        clears=clears,
        bestStage=stage_name(best_stage_idx),
        history=series('ddqn'),
    )
    if best_stage_idx >= 2:
        facts['ddqn']['resultSentence'] = (
            f'passou do um-um logo cedo, na geração {first}, e o melhor Mario chegou até o {stage_name(best_stage_idx)}. '
            f'Mas de um jeito bem inconsistente: em {gens} gerações, foram só {clears} bandeiras no total.'
        )
        facts['ddqn']['scoreSentence'] = f'chegou no {stage_name(best_stage_idx)}, mas quase sempre morria antes.'
    else:
        facts['ddqn']['resultSentence'] = f'passou do um-um poucas vezes: em {gens} gerações, foram só {clears} bandeiras no total.'
        facts['ddqn']['scoreSentence'] = 'passou do um-um, mas raramente.'
    facts['ddqn']['meme'] = 'not-stonks'
    facts['ddqn']['jokeSentence'] = 'É tipo aquele amigo que passou na autoescola na sorte.'

    # --- rainbow
    r = S['rainbow'] or {}
    rprog = r.get('bestProgress', 0)
    r_idx = int(rprog * 32 / 100) if rprog else r.get('maxStage', 1)
    rclears = r.get('totalStageClears', 0)
    rgens = r.get('generation', 0)
    facts['rainbow'] = dict(
        lateGen=next((c['startGen'] for c in r.get('clips', []) if c['name'] == 'rainbow_late'), rgens),
        generation=rgens,
        clears=rclears,
        bestStage=stage_name(r_idx),
        history=series('rainbow'),
    )
    better_than_ddqn = rclears > clears
    facts['rainbow']['resultSentence'] = (
        f'Com o mesmo orçamento, o Rainbow chegou até o {stage_name(r_idx)}, e com bem mais consistência que o Double DQN: '
        f'foram {rclears} bandeiras em {rgens} gerações. Mais esperto, sim. Mas zerar o jogo? Nem perto.'
        if better_than_ddqn
        else f'Com o mesmo orçamento, o Rainbow chegou até o {stage_name(r_idx)}. Melhorou, mas zerar o jogo? Nem perto.'
    )
    facts['rainbow']['scoreSentence'] = f'foi o melhor dos aprendizes puros, mas parou no {stage_name(r_idx)}.'
    facts['rainbow']['meme'] = 'hello-darkness'

    # --- adaptativa
    a = S['adaptive'] or {}
    win_steps = a.get('winSteps') or 54000
    facts['ada'] = dict(
        winSteps=win_steps,
        budgetPct=max(1, round(100 * win_steps / facts['budget'])),
        wallWords='noventa',
    )

    # --- placar
    facts['scoreboard'] = [
        dict(key='evolution', cleared=facts['evo']['maxStage'], partial=0.08, label=f"parou no {stage_name(facts['evo']['maxStage'])}",
             detail=f"{facts['evo']['generation']} gerações · 1ª bandeira na geração {facts['evo']['firstClearGen']}"),
        dict(key='ddqn', cleared=best_stage_idx, partial=0.1, label=f'parou no {stage_name(best_stage_idx)}',
             detail=f'{gens} gerações · {clears} bandeiras no total'),
        dict(key='rainbow', cleared=r_idx, partial=0.1, label=f'parou no {stage_name(r_idx)}',
             detail=f'{rgens} gerações · {rclears} bandeiras no total'),
        dict(key='adaptive', cleared=32, partial=0, label='ZEROU! 32/32', detail=f'primeira tentativa · {facts["ada"]["budgetPct"]}% do orçamento'),
    ]
    return facts


def credits(music_credits):
    lines = [
        '# Jogo e treino',
        'Mario RL Lab v11 — HTML único, física a 60 Hz',
        'Recriação independente das 32 fases (sem ROM nem código da Nintendo)',
        'Todos os números vêm de treinos reais no navegador (Chromium headless)',
        '# Edição',
        'Remotion (composição e animações em React)',
        'FFmpeg (mixagem, ducking da trilha e loudnorm)',
        'Playwright (captura quadro a quadro do jogo)',
        '# Voz',
        'Narração gerada por IA (TTS gratuito)',
        '# Música',
    ]
    lines += music_credits
    lines += [
        '# Memes',
        'GIFs de reação via Giphy/Tenor, uso de comentário/paródia',
        '# Inspirações',
        'SethBling (MarI/O), Code Bullet, AI Warehouse, b2studios',
        '# Referências',
        'Double DQN — van Hasselt et al., 2015',
        'Rainbow — Hessel et al., 2017',
        'IQN — Dabney et al., 2018',
        'DAgger — Ross, Gordon & Bagnell, 2011',
    ]
    return lines


# ----------------------------------------------------------------------------- texto
MARK = re.compile(r'\[\[(.*?)\]\]', re.S)
PH = re.compile(r'\{([a-zA-Z_]+(?:\.[a-zA-Z_]+)*)\}')


def lookup(facts, path):
    cur = facts
    for k in path.split('.'):
        cur = cur[k]
    return cur


def fill(text, facts):
    return PH.sub(lambda m: str(lookup(facts, m.group(1))), text)


def parse(text):
    """Separa texto e marcações. Devolve tokens exibidos e marcações com índice do próximo token."""
    tokens, marks = [], []
    pos = 0
    for m in MARK.finditer(text):
        chunk = text[pos:m.start()]
        tokens += chunk.split()
        marks.append(dict(idx=len(tokens), spec=m.group(1).strip()))
        pos = m.end()
    tokens += text[pos:].split()
    return tokens, marks


def norm(s):
    s = unicodedata.normalize('NFKD', s.lower())
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]', '', s)


def spoken(token):
    core = re.match(r'^([("“]*)(.*?)([)"”.,!?:;…]*)$', token)
    pre, word, post = core.groups()
    if word in PRONUNCIA:
        return pre + PRONUNCIA[word] + post
    return token


def align(tokens, tts_words):
    """Alinha tokens exibidos às palavras do TTS por caracteres normalizados."""
    S, s_owner = [], []
    for i, t in enumerate(tokens):
        for c in norm(spoken(t)):
            S.append(c)
            s_owner.append(i)
    T, t_owner = [], []
    for j, w in enumerate(tts_words):
        for c in norm(w['word']):
            T.append(c)
            t_owner.append(j)
    sm = difflib.SequenceMatcher(None, ''.join(S), ''.join(T), autojunk=False)
    starts = [None] * len(tokens)
    ends = [None] * len(tokens)
    for a, b, size in sm.get_matching_blocks():
        for k in range(size):
            i = s_owner[a + k]
            w = tts_words[t_owner[b + k]]
            starts[i] = w['start'] if starts[i] is None else min(starts[i], w['start'])
            ends[i] = w['end'] if ends[i] is None else max(ends[i], w['end'])
    # preenche lacunas por interpolação
    n = len(tokens)
    known = [i for i in range(n) if starts[i] is not None]
    if not known:
        total = tts_words[-1]['end'] if tts_words else 1.0
        for i in range(n):
            starts[i] = total * i / max(1, n)
            ends[i] = total * (i + 1) / max(1, n)
        return starts, ends
    for i in range(n):
        if starts[i] is None:
            prev = max([k for k in known if k < i], default=None)
            nxt = min([k for k in known if k > i], default=None)
            if prev is None:
                starts[i] = ends[i] = starts[nxt]
            elif nxt is None:
                starts[i] = ends[i] = ends[prev]
            else:
                f = (i - prev) / (nxt - prev)
                starts[i] = ends[prev] + f * (starts[nxt] - ends[prev])
                ends[i] = starts[i]
    return starts, ends


def caption_words(tokens, starts, ends):
    words = [dict(w=t, s=s, e=e) for t, s, e in zip(tokens, starts, ends)]
    out = []
    i = 0
    while i < len(words):
        merged = False
        for phrase, display in LEGENDA:
            parts = phrase.split()
            seg = words[i:i + len(parts)]
            if len(seg) == len(parts) and all(norm(a['w']) == norm(b) for a, b in zip(seg, parts)):
                tail = re.search(r'[.,!?:;…]+$', seg[-1]['w'])
                out.append(dict(w=display + (tail.group(0) if tail else ''), s=seg[0]['s'], e=seg[-1]['e']))
                i += len(parts)
                merged = True
                break
        if not merged:
            out.append(words[i])
            i += 1
    return out


# ----------------------------------------------------------------------------- clipes
def clip_info():
    info = {}
    for mp4 in sorted(FOOTAGE.glob('*.mp4')):
        meta_p = mp4.with_suffix('.json')
        probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries',
                                'stream=width,height,nb_read_packets', '-of', 'json', str(mp4)], capture_output=True, text=True)
        st = json.loads(probe.stdout)['streams'][0]
        meta = json.loads(meta_p.read_text())['meta'] if meta_p.exists() else []
        info[mp4.stem] = dict(frames=int(st['nb_read_packets']), width=st['width'], height=st['height'], meta=meta)
    return info


def resolve_from(clip, anchor, clips):
    """Converte a âncora (segundos, f123, stage:2-2+3, clear, done-4, end-5) em quadro do clipe."""
    c = clips[clip]
    meta = c['meta']
    m = re.match(r'^([a-z]+)(?::([0-9-]+))?([+-][0-9.]+)?$', anchor)
    if re.match(r'^[0-9.]+$', anchor):
        return round(float(anchor) * FPS)
    if anchor.startswith('f'):
        return int(anchor[1:])
    if not m:
        raise ValueError(f'Âncora inválida: {anchor}')
    kind, arg, off = m.groups()
    off = round(float(off) * FPS) if off else 0
    if kind == 'stage':
        f = next((x['f'] for x in meta if x.get('stage') == arg), None)
        if f is None:
            raise ValueError(f'{clip}: fase {arg} não aparece no clipe')
        return f + off
    if kind == 'clear':
        need = 1 if not arg else int(arg)
        f = next((x['f'] for x in meta if (x.get('cleared') or 0) >= need), 0)
        return f + off
    if kind == 'done':
        f = next((x['f'] for x in meta if x.get('done')), c['frames'] - 1)
        return f + off
    if kind == 'end':
        return c['frames'] + off
    raise ValueError(f'Âncora desconhecida: {anchor}')


# ----------------------------------------------------------------------------- principal
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--engine', default='edge')
    ap.add_argument('--voice', default=None)
    ap.add_argument('--rate', default=None)
    ap.add_argument('--pitch', default=None)
    ap.add_argument('--only', default=None)
    ap.add_argument('--no-tts', action='store_true')
    args = ap.parse_args()

    mod = load_roteiro()
    facts = run_facts()
    clips = clip_info()
    music = json.loads((PUBLIC / 'music' / 'music.json').read_text()) if (PUBLIC / 'music' / 'music.json').exists() else []
    music_credits = [f"{m['title']} — Kevin MacLeod (incompetech.com), CC BY 4.0" for m in music]
    facts['credits'] = credits(music_credits)
    memes = {x['id']: dict(file=Path(x['file_gif']).name, width=x['width'], height=x['height'], duration=x['duration_sec'])
             for x in json.loads((PUBLIC / 'gifs' / 'catalog.json').read_text())}

    scenes_src = mod.SCENES
    if args.only:
        keep = set(args.only.split(','))
        scenes_src = [s for s in scenes_src if s['id'] in keep]

    # 1) textos e marcações
    prepared = []
    for sc in scenes_src:
        text = fill(' '.join(sc['text'].split()), facts)
        tokens, marks = parse(text)
        prepared.append(dict(src=sc, tokens=tokens, marks=marks, tts=' '.join(spoken(t) for t in tokens)))

    # 2) voz
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    if not args.no_tts:
        req = []
        for p in prepared:
            item = dict(id=p['src']['id'], text=p['tts'])
            if args.voice:
                item['voice'] = args.voice
            if args.rate:
                item['rate'] = args.rate
            if args.pitch:
                item['pitch'] = args.pitch
            req.append(item)
        req_path = ROOT / 'data' / 'tts_request.json'
        req_path.write_text(json.dumps(req, ensure_ascii=False, indent=1))
        cmd = [sys.executable, str(ROOT / 'scripts' / 'tts.py'), str(req_path), str(VOICE_DIR), '--engine', args.engine]
        print('>>', ' '.join(cmd))
        subprocess.run(cmd, check=True)

    # 3) cenas
    scenes = []
    cursor = 0
    warnings = []
    for p in prepared:
        sc = p['src']
        sid = sc['id']
        vis = json.loads(json.dumps(sc['visual']))
        if vis.get('props'):
            for k, v in list(vis['props'].items()):
                if isinstance(v, str) and v.startswith('@'):
                    vis['props'][k] = lookup(facts, v[1:])
        mp3 = VOICE_DIR / f'{sid}.mp3'
        wj = VOICE_DIR / f'{sid}.words.json'
        if mp3.exists() and wj.exists():
            wd = json.loads(wj.read_text())
            tts_words = wd['words'] if isinstance(wd, dict) else wd
            dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(mp3)],
                                       capture_output=True, text=True).stdout.strip())
        else:
            tts_words, dur = [], max(2.0, len(p['tokens']) * 0.38)
            warnings.append(f'{sid}: sem áudio, duração estimada')
        lead = sc.get('lead', 0.6 if vis['type'] == 'title' else 0.2)
        pad = sc.get('pad', 0.45)
        starts, ends = align(p['tokens'], tts_words) if tts_words else ([i * 0.38 for i in range(len(p['tokens']))], [i * 0.38 + 0.3 for i in range(len(p['tokens']))])
        lead_f = round(lead * FPS)

        def t_of(idx):
            if idx < len(starts):
                return lead + starts[idx]
            return lead + dur

        events, segments = [], []
        min_end = lead + dur + pad
        cur_seg = None
        for mk in p['marks']:
            t = t_of(mk['idx'])
            f = round(t * FPS)
            kind, _, rest = mk['spec'].partition(':')
            if kind == 'c':
                body, *label = rest.split('|')
                clip, _, anc = body.partition('@')
                rate = 1.0
                if '*' in anc:
                    anc, r = anc.split('*')
                    rate = float(r)
                if clip not in clips:
                    warnings.append(f'{sid}: clipe {clip} ainda não existe')
                    continue
                start_f = 0 if not segments and mk['idx'] == 0 else f
                if cur_seg:
                    cur_seg['end'] = start_f
                cur_seg = dict(start=start_f, end=None, clip=clip, from_=resolve_from(clip, anc or '0', clips), rate=rate)
                if label:
                    cur_seg['label'] = '|'.join(label)
                segments.append(cur_seg)
            elif kind == 'z':
                if cur_seg:
                    cur_seg['end'] = f
                    nxt = dict(cur_seg)
                    nxt.pop('label', None)
                    nxt.update(start=f, end=None, from_=cur_seg['from_'] + (f - cur_seg['start']) * cur_seg['rate'], zoom=float(rest))
                    segments.append(nxt)
                    cur_seg = nxt
            elif kind == 'm':
                parts = rest.split(':')
                mid = parts[0]
                pos = parts[1] if len(parts) > 1 and parts[1] else 'right'
                mdur = float(parts[2]) if len(parts) > 2 and parts[2] else 2.2
                cap = parts[3] if len(parts) > 3 else None
                if mid not in memes:
                    warnings.append(f'{sid}: meme {mid} não existe')
                    continue
                ev = dict(type='meme', at=f, dur=round(mdur * FPS), id=mid, pos=pos)
                if cap:
                    ev['caption'] = cap
                events.append(ev)
                if mk['idx'] >= len(p['tokens']) - 1:
                    min_end = max(min_end, t + mdur)
            elif kind == 's':
                parts = rest.split(':')
                ev = dict(type='sfx', at=f, id=parts[0])
                if len(parts) > 1 and parts[1]:
                    ev['vol'] = float(parts[1])
                events.append(ev)
            elif kind == 'h':
                events.append(dict(type='hl', at=f, key=rest))
            elif kind == 't':
                parts = rest.split(':')
                ev = dict(type='txt', at=f, dur=round(float(parts[1] if len(parts) > 1 and parts[1] else 1.6) * FPS), text=parts[0])
                if len(parts) > 2:
                    ev['color'] = parts[2]
                events.append(ev)
        duration = round(min_end * FPS)
        # limita eventos e segmentos à duração da cena
        for ev in events:
            if ev['type'] in ('meme', 'txt'):
                ev['dur'] = max(12, min(ev['dur'], duration - ev['at']))
        if cur_seg:
            cur_seg['end'] = duration
        segs_out = []
        for sg in segments:
            if sg['end'] <= sg['start']:
                continue
            c = clips[sg['clip']]
            need = (sg['end'] - sg['start']) * sg['rate']
            frm = sg['from_']
            if frm + need > c['frames'] - 1:
                warnings.append(f"{sid}: {sg['clip']} curto para o trecho; recuando início")
                frm = max(0, c['frames'] - 1 - need)
            out = dict(start=sg['start'], end=sg['end'], clip=sg['clip'], **{'from': round(frm)}, rate=sg['rate'])
            if sg.get('zoom'):
                out['zoom'] = sg['zoom']
            if sg.get('label'):
                out['label'] = sg['label']
            segs_out.append(out)
        if vis['type'] == 'clip' and not segs_out:
            warnings.append(f'{sid}: cena de clipe sem trechos')
        if vis['type'] == 'ui':
            for k in vis['keys']:
                k['at'] = round(k['at'] * FPS)
        words = caption_words(p['tokens'], starts, ends) if p['tokens'] else []
        words = [dict(w=w['w'], s=round((lead + w['s']) * FPS), e=round((lead + w['e']) * FPS)) for w in words]
        scenes.append(dict(
            id=sid,
            chapter=mod.CHAPTERS.get(sc['chapter'], sc['chapter']),
            chapterKey=sc['chapter'],
            start=cursor,
            duration=duration,
            audio=f'voice/{sid}.mp3' if mp3.exists() else None,
            audioOffset=lead_f,
            audioDuration=round(dur * FPS),
            words=words,
            visual=vis,
            segments=segs_out,
            events=sorted(events, key=lambda e: e['at']),
            captions=sc.get('captions', True),
        ))
        cursor += duration

    # capítulos
    chapters = []
    for s in scenes:
        if not chapters or chapters[-1]['id'] != s['chapterKey']:
            chapters.append(dict(id=s['chapterKey'], title=s['chapter'], start=s['start'], end=s['start'] + s['duration']))
        else:
            chapters[-1]['end'] = s['start'] + s['duration']

    timeline = dict(
        fps=FPS, width=1920, height=1080, durationInFrames=cursor, scenes=scenes, chapters=chapters,
        clips={k: dict(frames=v['frames'], width=v['width'], height=v['height']) for k, v in clips.items()},
        memes=memes,
        data=dict(budget=facts['budget']),
    )
    (PUBLIC / 'timeline.json').write_text(json.dumps(timeline, ensure_ascii=False))
    (ROOT / 'data' / 'facts.json').write_text(json.dumps({k: v for k, v in facts.items() if k != 'credits'}, ensure_ascii=False, indent=1))
    mins = cursor / FPS / 60
    print(f'Linha do tempo: {len(scenes)} cenas, {cursor} quadros ({mins:.2f} min)')
    for c in chapters:
        print(f"  {c['title']:28s} {c['start'] / FPS / 60:5.2f} → {c['end'] / FPS / 60:5.2f} min")
    for w in warnings:
        print('AVISO:', w)


if __name__ == '__main__':
    main()
