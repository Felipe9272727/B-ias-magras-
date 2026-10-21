#!/usr/bin/env python3
"""Película de correções leves por cima do vídeo final (sem re-renderizar): lê sessenta/pelicula_s60.json e aplica com ffmpeg.

Cada correção: {"cena": "m07", "de": 3.2, "ate": 5.0, "tipo": "apagar"|"borrar"|"caixa", "x": 100, "y": 200, "w": 80, "h": 60,
                 "cor": "#2b2b2b" (só caixa), "motivo": "texto curto"}
  de/ate são segundos DENTRO da cena (a timeline diz onde a cena começa); x,y,w,h em pixels do quadro 1920x1080.
  apagar = delogo (preenche a região com o entorno; bom para riscos, pontos, restos de recorte)
  borrar = desfoca a região; caixa = cobre com uma cor sólida.
Uso: python3 pelicula_s60.py entrada.mp4 saida.mp4
"""
import json
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
tl = json.loads((RAIZ / 'video' / 'remotion' / 'public' / 'timeline_s60.json').read_text())
ini = {s['id']: s['start'] / tl['fps'] for s in tl['scenes']}
arq = RAIZ / 'sessenta' / 'pelicula_s60.json'
fixes = json.loads(arq.read_text()) if arq.exists() else []
entrada, saida = sys.argv[1], sys.argv[2]
if not fixes:
    subprocess.run(['cp', entrada, saida], check=True)
    raise SystemExit('sem correções; copiado')
cadeia, rot = [], '[0:v]'
for i, f in enumerate(fixes):
    t0, t1 = ini[f['cena']] + f['de'], ini[f['cena']] + f['ate']
    x, y, w, h = (max(1, int(f[k])) for k in ('x', 'y', 'w', 'h'))
    x, y = min(x, 1918 - w), min(y, 1078 - h)
    quando = f"enable='between(t,{t0:.3f},{t1:.3f})'"
    novo = f'[v{i}]'
    if f['tipo'] == 'apagar':
        cadeia.append(f"{rot}delogo=x={x}:y={y}:w={w}:h={h}:{quando}{novo}")
    elif f['tipo'] == 'caixa':
        cadeia.append(f"{rot}drawbox=x={x}:y={y}:w={w}:h={h}:color={f.get('cor', '#222222')}@1:t=fill:{quando}{novo}")
    else:
        cadeia.append(f"{rot}split[a{i}][b{i}];[b{i}]crop={w}:{h}:{x}:{y},boxblur=8[c{i}];[a{i}][c{i}]overlay={x}:{y}:{quando}{novo}")
    rot = novo
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', entrada, '-filter_complex', ';'.join(cadeia), '-map', rot, '-map', '0:a?',
                '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', saida], check=True)
print('película aplicada:', len(fixes), 'correções ->', saida)
