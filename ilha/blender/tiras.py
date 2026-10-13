#!/usr/bin/env python3
"""Junta os quadros dos bonecos (ilha/render/bonecos/<id>/<anim>_<dir>/NN.png) em tiras horizontais
video/remotion/public/ilha/bonecos/<id>/<anim>_<dir>.png (só as completas; retomável)."""
import json, sys
from pathlib import Path
from PIL import Image

REPO = Path(__file__).resolve().parents[2]
Q = REPO / 'ilha' / 'render' / 'bonecos'
OUT = REPO / 'video' / 'remotion' / 'public' / 'ilha' / 'bonecos'
meta = json.loads((OUT / 'bonecos.json').read_text())
QW, QH = meta['quadro']
feitas = 0
for d in sorted(Q.glob('*/*_*')):
    nome = d.name.rsplit('_', 1)[0]
    n = meta['anims'].get(nome, {}).get('n')
    tira = OUT / d.parent.name / f'{d.name}.png'
    fs = sorted(d.glob('*.png'))
    if not n or len(fs) < n or (tira.exists() and '--refazer' not in sys.argv):
        continue
    tira.parent.mkdir(parents=True, exist_ok=True)
    im = Image.new('RGBA', (QW * n, QH), (0, 0, 0, 0))
    for i, f in enumerate(fs[:n]):
        im.paste(Image.open(f), (i * QW, 0))
    im.save(tira, optimize=True)
    feitas += 1
tiras = {}
for f in OUT.glob('*/*.png'):
    tiras.setdefault(f.parent.name, set()).add(f.stem.rsplit('_', 1)[0])
meta['tiras'] = {k: sorted(v) for k, v in tiras.items()}
(OUT / 'bonecos.json').write_text(json.dumps(meta))
print('tiras novas:', feitas)
