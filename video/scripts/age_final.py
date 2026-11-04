#!/usr/bin/env python3
"""AGE DAS IAs: render 540p -> vídeo final. Upscale 1080p (Lanczos), trilha por capítulo (cenas com "cap" no roteiro),
com volume calibrado do music.json, abaixando sob a voz (sidechain do padrão do canal) e loudnorm -14 LUFS.
Uso (de video/remotion): python3 ../scripts/age_final.py <render.mkv> <saida.mp4>"""
import json
import subprocess
import sys
from pathlib import Path

ent, sai = sys.argv[1:3]
PUB = Path('public')
tl = json.loads((PUB / 'timeline_age.json').read_text())
info = {m['id']: m for m in json.loads((PUB / 'music' / 'music.json').read_text())}
# capítulos na ordem do roteiro -> música (Kevin MacLeod, CC BY 4.0; créditos na descrição)
TRILHAS = ['hitman', 'sneaky-snitch', 'investigations', 'run-amok', '8bit-dungeon-boss', 'mega-hyper-ultrastorm', 'heroic-age', 'winner-winner']
FPS = 30
blocos = []  # (inicio_s, fim_s)
t = 0
for c in tl['cenas']:
    if c.get('cap') or not blocos:
        blocos.append([t / FPS, None])
    t += c['dur']
for i, b in enumerate(blocos):
    b[1] = blocos[i + 1][0] if i + 1 < len(blocos) else t / FPS
ins, fil = [], []
for i, (a, b) in enumerate(blocos):
    mid = TRILHAS[min(i, len(TRILHAS) - 1)] if i < len(blocos) - 1 else 'winner-winner'
    vol = info.get(mid, {}).get('suggested_bg_volume', 0.2) * 0.85
    d = b - a
    ins += ['-stream_loop', '-1', '-i', str(PUB / 'music' / f'{mid}.mp3')]
    fil.append(f'[{i + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{d:.3f},asetpts=PTS-STARTPTS,volume={vol:.3f},afade=t=in:d=0.8,afade=t=out:st={max(0, d - 1.2):.3f}:d=1.2[m{i}]')
    print(f'{a:7.1f}-{b:7.1f}s  {mid}')
fil.append(''.join(f'[m{i}]' for i in range(len(blocos))) + f'concat=n={len(blocos)}:v=0:a=1[mus]')
fil.append('[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[voz][chave]')
fil.append('[mus][chave]sidechaincompress=threshold=0.015:ratio=9:attack=25:release=450:makeup=1[md]')
fil.append('[voz][md]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.79:level=false[a]')
fil.append('[0:v]scale=1920:1080:flags=lanczos[v]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', ent, *ins, '-filter_complex', ';'.join(fil), '-map', '[v]', '-map', '[a]',
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', sai], check=True)
print('ok', sai)
