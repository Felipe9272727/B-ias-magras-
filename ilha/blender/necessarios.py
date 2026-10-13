#!/usr/bin/env python3
"""Lista só os bonecos (tributo, animação, direção renderizada) que as cenas realmente usam, lendo as trilhas
video/remotion/public/ilha/3d/*.json (modo placa). Direções 225/270/315 viram 135/90/45 (espelho no Remotion).
Ataque com arma que não existe na lista vira atacar_maos no Remotion, então entra como está. Saída: ilha/dados/bonecos_necessarios.json"""
import json
from pathlib import Path
REPO = Path(__file__).resolve().parents[2]
pub = REPO / 'video' / 'remotion' / 'public' / 'ilha' / '3d'
precisa = set()
for f in pub.glob('*.json'):
    d = json.loads(f.read_text())
    if 'atores' not in d:
        continue
    for tid, tr in d['atores'].items():
        for v in tr:
            if v:
                dr = v[3] if v[3] <= 180 else 360 - v[3]
                precisa.add((tid, d['anims'][v[4]], dr))
out = REPO / 'ilha' / 'dados' / 'bonecos_necessarios.json'
out.write_text(json.dumps(sorted(precisa)))
print(len(precisa), 'tiras necessárias')
