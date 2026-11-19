#!/usr/bin/env python3
"""INTERROGATÓRIO 2: render 540p mudo + faixa de vozes/efeitos -> vídeo final.
Trilha pelos CUES do roteiro_int2 (uma música por bloco, começando no ponto indicado; Kevin MacLeod, incompetech.com,
CC BY 4.0: créditos na descrição), muda nas capas (SEM_TRILHA), abaixando sob a voz (sidechain do padrão do canal),
loudnorm -14 LUFS e limitador de pico. Vídeo: upscale 1080p com Lanczos + a edição de cor do AGE v4.
Uso (de video/remotion): python3 ../scripts/int2_final.py out/int2_mudo.mkv out/int2_voz.flac out/INTERROGATORIO2.mp4 [--seg 60]
  (--seg N: só os N primeiros segundos, para testar)"""
import importlib.util
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'remotion' / 'public'
args = sys.argv[1:]
seg = None
if '--seg' in args:
    i = args.index('--seg')
    seg = float(args[i + 1])
    del args[i:i + 2]
mudo, voz, sai = args
spec = importlib.util.spec_from_file_location('r', ROOT / 'roteiro' / 'roteiro_int2.py')
rot = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rot)
tl = json.loads((PUB / 'timeline_int2.json').read_text())
FPS = tl['fps']
total = tl['durationInFrames'] / FPS if seg is None else seg
inicio = {s['id']: s['start'] / FPS for s in tl['scenes']}
info = {m['id']: m for m in json.loads((PUB / 'music' / 'music.json').read_text())}


def arquivo(mid):
    f = info[mid]['file']
    for p in (PUB / f, PUB / 'music' / Path(f).name):
        if p.exists():
            return p
    raise SystemExit(f'música {mid} não encontrada')


ins, fil, lab = [], [], []
cues = [c for c in rot.CUES if c[0] in inicio]
for i, (sid, mid, off) in enumerate(cues):
    a = inicio[sid]
    b = inicio[cues[i + 1][0]] if i + 1 < len(cues) else tl['durationInFrames'] / FPS
    a, b = min(a, total), min(b, total)
    if b - a < 0.3:
        continue
    d = b - a
    vol = info[mid].get('suggested_bg_volume', 0.25) * 0.85
    n = len(lab) + 2
    ins += ['-stream_loop', '-1', '-ss', f'{off:.3f}', '-i', str(arquivo(mid))]
    ms = int(round(a * 1000))
    fil.append(f'[{n}:a]atrim=0:{d:.3f},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,volume={vol:.3f},'
               f'afade=t=in:st=0:d=0.8,afade=t=out:st={max(0, d - 0.7):.3f}:d=0.7,adelay={ms}|{ms}[m{n}]')
    lab.append(f'[m{n}]')
    print(f'{a:7.1f}-{b:7.1f}s  {mid} (+{off}s)')
fil.append(f"{''.join(lab)}amix=inputs={len(lab)}:normalize=0:dropout_transition=0[mus0]")
# trilha muda nas capas (a batida da porta e as grades são o som delas)
mudos = [(s['start'] / FPS, (s['start'] + s['duration']) / FPS) for s in tl['scenes'] if s['visual'].get('name') in getattr(rot, 'SEM_TRILHA', [])]
expr = '+'.join(f'between(t,{a:.2f},{b:.2f})' for a, b in mudos if a < total)
fil.append(f"[mus0]volume='if({expr},0,1)':eval=frame[mus]" if expr else '[mus0]anull[mus]')
fil.append('[1:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[voz][chave]')
fil.append('[mus][chave]sidechaincompress=threshold=0.015:ratio=9:attack=25:release=450:makeup=1[md]')
fil.append('[voz][md]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.79:level=false[a]')
fil.append('[0:v]scale=1920:1080:flags=lanczos,eq=contrast=1.06:saturation=1.18:gamma=0.98,unsharp=5:5:0.5,vignette=angle=0.42[v]')
lim = ['-t', f'{seg:.3f}'] if seg else []
subprocess.run(['ffmpeg', '-v', 'error', '-y', *lim, '-i', mudo, *lim, '-i', voz, *ins, '-filter_complex', ';'.join(fil),
                '-map', '[v]', '-map', '[a]', *lim, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', sai], check=True)
print('ok', sai)
