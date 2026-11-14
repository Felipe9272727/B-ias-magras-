#!/usr/bin/env python3
"""POKÉMON: monta a faixa de vozes + efeitos direto da timeline (sem a mixagem do Remotion, que cria vários WAV
do tamanho do vídeo inteiro e lota o disco). Mesmo tempo do AgeVideo: cada áudio começa em início_da_cena + at e é
cortado no fim da cena. Renderizar o vídeo com --muted e juntar depois:
  python3 ../scripts/au7_audio.py out/au7_voz.flac   (de video/remotion)
  ffmpeg -i out/au7_mudo.mkv -i out/au7_voz.flac -map 0:v -map 1:a -c:v copy -c:a flac out/au7_completo.mkv"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR, FPS = 48000, 30
PUB = Path('public')
tl = json.loads((PUB / 'timeline_desenha.json').read_text())
total = sum(c['dur'] for c in tl['cenas'])
mix = np.zeros((total * SR // FPS + SR, 2), dtype=np.float32)
cache = {}


def ler(src):
    if src not in cache:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(PUB / src), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
        cache[src] = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)
    return cache[src]


ini = 0
for c in tl['cenas']:
    fim = (ini + c['dur']) * SR // FPS
    for a in c['audio']:
        s = ler(a['src']) * a.get('vol', 1)
        p = (ini + a['at']) * SR // FPS
        n = max(0, min(len(s), fim - p))
        mix[p:p + n] += s[:n]
    ini += c['dur']
mix = mix[:total * SR // FPS]
print('pico', float(np.abs(mix).max()))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'flac', sys.argv[1]], input=mix.tobytes(), check=True)
print('ok', sys.argv[1], total / FPS / 60, 'min')
