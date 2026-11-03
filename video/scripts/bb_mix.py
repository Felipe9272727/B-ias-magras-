#!/usr/bin/env python3
"""Mixa o áudio do BOMBANANA! direto da linha do tempo (vozes, efeitos e música), sem passar pelo Remotion:
cada clipe entra no quadro certo (adelay); a música fica em loop baixinho por baixo.
Uso: python3 bb_mix.py <timeline.json> <saida.wav>   (rodar de video/remotion, os caminhos são relativos a public/)"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

FPS = 30
tl = json.loads(Path(sys.argv[1]).read_text())
saida = sys.argv[2]
pub = Path('public')
total = sum(b['dur'] for b in tl['blocos']) / FPS

clipes = []  # (inicio_s, arquivo, volume)
ini = 0
for b in tl['blocos']:
    for a in b.get('audio', []):
        if tl.get('semVoz') and a['src'].startswith('bb/voz/'):
            continue
        f = pub / a['src']
        if f.exists():
            clipes.append(((ini + a['ini']) / FPS, str(f), a.get('vol', 1)))
    ini += b['dur']
print(len(clipes), 'clipes,', round(total / 60, 1), 'min')

tmp = Path(tempfile.mkdtemp())
lotes = []
for k in range(0, len(clipes), 40):  # em lotes, para não estourar o ffmpeg
    lote = clipes[k:k + 40]
    args = ['ffmpeg', '-v', 'error', '-y']
    filtros = []
    for i, (t, f, v) in enumerate(lote):
        args += ['-i', f]
        ms = int(t * 1000)
        filtros.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[a{i}]')
    filtros.append(''.join(f'[a{i}]' for i in range(len(lote))) + f'amix=inputs={len(lote)}:normalize=0:dropout_transition=0,apad=whole_dur={total:.2f}[o]')
    out = tmp / f'lote{k // 40:03d}.wav'
    subprocess.run(args + ['-filter_complex', ';'.join(filtros), '-map', '[o]', '-t', f'{total:.2f}', str(out)], check=True)
    lotes.append(str(out))

args = ['ffmpeg', '-v', 'error', '-y']
for l in lotes:
    args += ['-i', l]
musica = pub / tl['musica'] if tl.get('musica') else None
n = len(lotes)
filtros = [''.join(f'[{i}:a]' for i in range(n)) + f'amix=inputs={n}:normalize=0[voz]']
if musica and musica.exists():
    args += ['-stream_loop', '-1', '-i', str(musica)]
    filtros.append(f'[{n}:a]aresample=48000,aformat=channel_layouts=stereo,volume={0.16 if tl.get("semVoz") else 0.07}[mus]')
    filtros.append('[voz][mus]amix=inputs=2:normalize=0[o]')
else:
    filtros.append('[voz]anull[o]')
subprocess.run(args + ['-filter_complex', ';'.join(filtros), '-map', '[o]', '-t', f'{total:.2f}', '-ar', '48000', saida], check=True)
print('ok', saida)
