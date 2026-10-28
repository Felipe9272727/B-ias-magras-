#!/usr/bin/env python3
"""Among Us 5: do render 540p ao vídeo final. Upscale para 1080p (Lanczos), trilha diferente em cada capítulo
(em loop, com fade entre elas), abaixando quando alguém fala (sidechain), e normalização em -14 LUFS.
Uso: au5_final.py <render_540p.mp4> <saida.mp4> [timeline]"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MUS = ROOT / 'remotion/public/music'
TRILHA = {  # capítulo -> música (Kevin MacLeod, CC BY 4.0; créditos na descrição)
    'abertura': 'sneaky-snitch.mp3',
    'p1': 'monkeys-spinning-monkeys.mp3',
    'p2': 'thinking-music.mp3',
    'p3': 'voxel-revolution.mp3',
    'p4': '8bit-dungeon-boss.mp3',
    'fim': 'winner-winner.mp3',
}
VOL = 0.2

ent, sai = sys.argv[1], sys.argv[2]
tl = json.loads(Path(sys.argv[3] if len(sys.argv) > 3 else ROOT / 'remotion/public/timeline_au5.json').read_text())
caps = tl['chapters']
ins, fil = [], []
for i, c in enumerate(caps):
    d = (c['end'] - c['start']) / 30
    ins += ['-stream_loop', '-1', '-i', str(MUS / TRILHA[c['id']])]
    fil.append(f'[{i + 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{d:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.8,afade=t=out:st={max(0, d - 1.2):.3f}:d=1.2[m{i}]')
fil.append(''.join(f'[m{i}]' for i in range(len(caps))) + f'concat=n={len(caps)}:v=0:a=1,volume={VOL}[mus]')
fil.append('[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[voz][chave]')
fil.append('[mus][chave]sidechaincompress=threshold=0.015:ratio=9:attack=25:release=450[mduck]')
fil.append('[voz][mduck]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[a]')
fil.append('[0:v]scale=1920:1080:flags=lanczos[v]')
cmd = ['ffmpeg', '-v', 'error', '-y', '-i', ent, *ins, '-filter_complex', ';'.join(fil), '-map', '[v]', '-map', '[a]',
       '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', sai]
subprocess.run(cmd, check=True)
print('pronto:', sai)
