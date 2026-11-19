#!/usr/bin/env python3
"""INTERROGATÓRIO 2: monta a faixa de vozes + efeitos direto da timeline_int2.json (o render é --muted: a mixagem do
Remotion cria WAVs do tamanho do vídeo e lota o disco). Mesmo tempo do Main.tsx: cada áudio começa em
início_da_cena + at; a voz é cortada no fim da cena (como no Remotion) e o efeito pode soar até 1,5 s depois.
Inclui os "ding/buzzer" que o INTPlacar toca sozinho (um por IA, a partir da palavra "acertaram").
Uso (de video/remotion): python3 ../scripts/int2_audio.py out/int2_voz.flac
Junta: ffmpeg -f concat -safe 0 -i out/int2_lista.txt -i out/int2_voz.flac -map 0:v -map 1:a -c:v copy -c:a flac out/int2_mudo_voz.mkv"""
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

import numpy as np

SR, FPS = 48000, 30
PUB = Path('public')
tl = json.loads((PUB / 'timeline_int2.json').read_text())
total = tl['durationInFrames']
mix = np.zeros((total * SR // FPS + 3 * SR, 2), dtype=np.float32)
cache = {}
ORDEM_IAS = ['gpt', 'claude', 'deepseek', 'glm', 'minimax', 'qwen']  # a mesma do INTPlacar


def ler(src):
    if src not in cache:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(PUB / src), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                             capture_output=True, check=True).stdout
        cache[src] = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)
    return cache[src]


def por(src, quadro, vol, ate):
    s = ler(src) * vol
    p = quadro * SR // FPS
    n = max(0, min(len(s), ate * SR // FPS - p, len(mix) - p))
    mix[p:p + n] += s[:n]


def sem_acento(w):
    return re.sub(r'[^a-z0-9-]', '', unicodedata.normalize('NFD', w.lower()).encode('ascii', 'ignore').decode())


faltou = []
for c in tl['scenes']:
    ini, fim = c['start'], c['start'] + c['duration']
    for e in c['events']:
        if e['type'] == 'voz':
            if not (PUB / e['src']).exists():
                faltou.append(e['src'])
                continue
            por(e['src'], ini + e['at'], 1.0, fim)
        elif e['type'] == 'sfx':
            f = e.get('file') or f"{e['id']}.wav"
            src = f if '/' in f else f'sfx/{f}'
            por(src, ini + e['at'], e.get('vol', 0.3), fim + 45)
    if c['visual'].get('name') == 'INTPlacar':
        casos = {k: v for k, v in tl['data']['casos'].items() if not k.startswith('p1_')}
        t_ac = next((w['s'] for w in c['words'] if sem_acento(w['w']).startswith('acertaram')), None)
        if t_ac is not None:
            for i, ia in enumerate(ORDEM_IAS):
                det = next((L for L in casos.values() if L['caso']['detetive'] == ia), None)
                q = ini + t_ac + i * 12
                por('sfx/correct-ding.mp3' if det and det['acertou'] else 'sfx/wrong-buzzer.mp3', q, 0.35, min(fim, q + 40))
mix = mix[:total * SR // FPS]
if faltou:
    raise SystemExit(f'FALTAM {len(faltou)} vozes: {faltou[:5]}')
print('pico', float(np.abs(mix).max()))
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'flac', sys.argv[1]],
               input=mix.tobytes(), check=True)
print('ok', sys.argv[1], f'{total / FPS / 60:.2f} min')
