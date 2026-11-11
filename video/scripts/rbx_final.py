#!/usr/bin/env python3
"""IA JOGANDO ROBLOX: render 540p mudo + faixa de vozes -> vídeo final. Upscale 1080p (Lanczos), uma trilha por parte
(cenas com cartão de parte), volume calibrado do music.json, música abaixando sob a voz (sidechain do padrão do canal),
loudnorm -14 LUFS e a edição de cor do canal.
Uso (de video/remotion): python3 ../scripts/rbx_final.py <render_mudo.mkv> <voz.flac> <saida.mp4>
Todas as faixas: Kevin MacLeod (incompetech.com), CC BY 4.0 — créditos em youtube/descricao_roblox.md."""
import json
import subprocess
import sys
from pathlib import Path

ent, voz, sai = sys.argv[1:4]
PUB = Path('public')
tl = json.loads((PUB / 'timeline_roblox.json').read_text())
info = {m['id']: m for m in json.loads((PUB / 'music' / 'music.json').read_text())}
TRILHAS = ['pixel-peeker-polka-faster', 'thinking-music', 'fluffing-a-duck', 'monkeys-spinning-monkeys', 'sneaky-snitch', 'scheming-weasel-faster',
           'quirky-dog', 'run-amok', 'comedic-juggernaut', 'investigations', 'itty-bitty-8-bit', 'hitman', 'heroic-age', 'pixelland', 'winner-winner']
FPS = 30
blocos, t = [], 0
for c in tl['cenas']:
    if any(o['tipo'] == 'marco' and o['at'] == 0 for o in c['over']) or not blocos:
        blocos.append([t / FPS, None])
    t += c['dur']
for i, b in enumerate(blocos):
    b[1] = blocos[i + 1][0] if i + 1 < len(blocos) else t / FPS
assert len(blocos) <= len(TRILHAS), (len(blocos), len(TRILHAS))
ins, fil = [], []
for i, (a, b) in enumerate(blocos):
    mid = TRILHAS[i] if i < len(blocos) - 1 else 'winner-winner'
    vol = info.get(mid, {}).get('suggested_bg_volume', 0.2) * 0.85
    d = b - a
    ins += ['-stream_loop', '-1', '-i', str(PUB / 'music' / f'{mid}.mp3')]
    fil.append(f'[{i + 2}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{d:.3f},asetpts=PTS-STARTPTS,volume={vol:.3f},afade=t=in:d=0.8,afade=t=out:st={max(0, d - 1.2):.3f}:d=1.2[m{i}]')
    print(f'{a:7.1f}-{b:7.1f}s  {mid}')
fil.append(''.join(f'[m{i}]' for i in range(len(blocos))) + f'concat=n={len(blocos)}:v=0:a=1[mus]')
fil.append('[1:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[voz][chave]')
fil.append('[mus][chave]sidechaincompress=threshold=0.015:ratio=9:attack=25:release=450:makeup=1[md]')
fil.append('[voz][md]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.79:level=false[a]')
fil.append('[0:v]scale=1920:1080:flags=lanczos,eq=contrast=1.06:saturation=1.18:gamma=0.98,unsharp=5:5:0.5,vignette=angle=0.42[v]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', ent, '-i', voz, *ins, '-filter_complex', ';'.join(fil), '-map', '[v]', '-map', '[a]',
                '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', sai], check=True)
print('ok', sai)
