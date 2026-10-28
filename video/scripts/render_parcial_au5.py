#!/usr/bin/env python3
"""Re-render só do que mudou: compara a linha do tempo nova com a do render anterior (cena por cena: visual, duração,
eventos e legendas). Cena igual é recortada do vídeo antigo; trechos de cenas mudadas seguidas são renderizados de novo
(540p). Depois junta tudo, na ordem nova, num vídeo só.
Uso: render_parcial_au5.py <timeline_antiga.json> <video_antigo.mp4> <bundle> <pasta_tmp> <saida.mp4>"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
velho_tl, velho_mp4, bundle, tmp, saida = sys.argv[1:6]
tmp = Path(tmp)
tmp.mkdir(parents=True, exist_ok=True)
velho = {s['id']: s for s in json.load(open(velho_tl))['scenes']}
novo = json.loads((ROOT / 'remotion/public/timeline_au5.json').read_text())['scenes']
CHAVES = ('visual', 'duration', 'events', 'words', 'capGroups')


def igual(a, b):
    return b is not None and all(json.dumps(a.get(k), sort_keys=True) == json.dumps(b.get(k), sort_keys=True) for k in CHAVES)


# blocos: ('velho', inicio_antigo, dur) ou ('novo', inicio_novo, dur), juntando cenas vizinhas do mesmo tipo
blocos = []
for s in novo:
    v = velho.get(s['id'])
    if igual(s, v):
        b = ('velho', v['start'], s['duration'])
        if blocos and blocos[-1][0] == 'velho' and blocos[-1][1] + blocos[-1][2] == b[1]:
            blocos[-1] = ('velho', blocos[-1][1], blocos[-1][2] + b[2])
            continue
    else:
        b = ('novo', s['start'], s['duration'])
        if blocos and blocos[-1][0] == 'novo' and blocos[-1][1] + blocos[-1][2] == b[1]:
            blocos[-1] = ('novo', blocos[-1][1], blocos[-1][2] + b[2])
            continue
    blocos.append(b)
print('blocos:', len(blocos), 'quadros novos:', sum(b[2] for b in blocos if b[0] == 'novo'), 'de', sum(b[2] for b in blocos))
COD = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2']
lista = []
for k, (tipo, ini, dur) in enumerate(blocos):
    out = tmp / f'b{k:03d}.mp4'
    lista.append(out)
    if out.exists():
        continue
    if tipo == 'velho':
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{ini / 30:.4f}', '-i', velho_mp4, '-frames:v', str(dur), '-t', f'{dur / 30:.4f}', *COD, str(out)], check=True)
    else:
        bruto = tmp / f'r{k:03d}.mp4'
        subprocess.run(['npx', 'remotion', 'render', bundle, 'AU5Narrado', str(bruto), f'--frames={ini}-{ini + dur - 1}', '--scale=0.5', '--concurrency=4', '--log=error'], check=True, cwd=ROOT / 'remotion')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(bruto), *COD, str(out)], check=True)
    print(k, tipo, ini, dur, flush=True)
(tmp / 'lista.txt').write_text(''.join(f"file '{p}'\n" for p in lista))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(tmp / 'lista.txt'), '-c', 'copy', saida], check=True)
print('pronto:', saida)
