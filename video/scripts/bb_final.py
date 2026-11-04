#!/usr/bin/env python3
"""BOMBANANA! final: abertura de comentários (BBComentarios, 22 s) na frente do vídeo já pronto, sem renderizar o resto.
Áudio: vozes/efeitos da timeline (vozes.flac do bb_mix2.py) atrasados pela abertura + trilha por capítulo no padrão do
mix_audio.py do canal (volume calibrado do music.json, ducking forte sob a voz: threshold 0.015, ratio 9, -14 LUFS, limitador).
Uso (de video/remotion): python3 ../scripts/bb_final.py <abertura.mp4> <video_v2.mp4> <vozes.flac> <saida.mp4>"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ab, vid, vozes, saida = sys.argv[1:5]
pub = Path('public')
tl = json.loads((pub / 'timeline_bb.json').read_text())
FPS = 30
TRILHAS = {'intro': 'fluffing-a-duck', 'f1': 'sneaky-snitch', 'f2': 'investigations', 'f3': 'run-amok', 'f4': 'hitman',
           'f5': 'pixel-peeker-polka-faster', 'f6': 'quirky-dog', 'f7': 'bit-shift', 'f8': 'mega-hyper-ultrastorm',
           'f9': '8bit-dungeon-boss', 'fim': 'winner-winner'}
MUSIC_GAIN = 0.85
info = {m['id']: m for m in json.loads((pub / 'music' / 'music.json').read_text())}
tmp = Path(tempfile.mkdtemp(dir='/tmp/claude-0'))


def dur(f):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)


def roda(a):
    subprocess.run(['ffmpeg', '-v', 'error', '-y'] + a, check=True)


D0 = dur(ab)
total = D0 + tl['durationInFrames'] / FPS

# vídeo: abertura recodificada com os mesmos parâmetros do vídeo principal e emendada sem recodificar o resto
v_ab = tmp / 'ab.mp4'
roda(['-i', ab, '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.0',
      '-r', '30', '-video_track_timescale', '15360', str(v_ab)])
v_main = tmp / 'main.mp4'
roda(['-i', vid, '-an', '-c:v', 'copy', str(v_main)])
(tmp / 'v.txt').write_text(f"file '{v_ab}'\nfile '{v_main}'\n")
v_all = tmp / 'v_all.mp4'
roda(['-f', 'concat', '-safe', '0', '-i', str(tmp / 'v.txt'), '-c', 'copy', str(v_all)])
v_main.unlink()

# voz: narração da abertura + vozes/efeitos do episódio
voz = tmp / 'voz.flac'
ms = int(round(D0 * 1000))
roda(['-i', ab, '-i', vozes, '-filter_complex',
      f'[0:a]aresample=48000,aformat=channel_layouts=stereo[a];[1:a]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[b];'
      f'[a][b]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur={total:.3f}[o]', '-map', '[o]', '-t', f'{total:.3f}', str(voz)])

# trilha por capítulo (a abertura de comentários entra na trilha da Abertura)
pedacos = []
caps = tl['chapters']
for i, c in enumerate(caps):
    ini = 0 if i == 0 else D0 + c['start'] / FPS
    fim = total if i == len(caps) - 1 else D0 + c['end'] / FPS
    d = fim - ini
    m = info.get(TRILHAS[c['id']], {})
    vol = m.get('suggested_bg_volume', 0.2) * MUSIC_GAIN
    out = tmp / f"m_{c['id']}.flac"
    roda(['-stream_loop', '-1', '-i', str(pub / 'music' / f"{TRILHAS[c['id']]}.mp3"), '-af',
          f'aresample=48000,aformat=channel_layouts=stereo,atrim=0:{d:.3f},asetpts=PTS-STARTPTS,volume={vol:.3f},'
          f'afade=t=in:d=0.8,afade=t=out:st={max(0, d - 1.2):.3f}:d=1.2', '-t', f'{d:.3f}', str(out)])
    pedacos.append(out)
(tmp / 'm.txt').write_text(''.join(f"file '{p}'\n" for p in pedacos))
mus = tmp / 'mus.flac'
roda(['-f', 'concat', '-safe', '0', '-i', str(tmp / 'm.txt'), '-c', 'copy', str(mus)])

roda(['-i', str(v_all), '-i', str(voz), '-i', str(mus), '-filter_complex',
      '[1:a]asplit=2[voice][key];[key]aformat=channel_layouts=stereo[k];'
      '[2:a][k]sidechaincompress=threshold=0.015:ratio=9:attack=25:release=450:makeup=1[ducked];'
      '[voice][ducked]amix=inputs=2:normalize=0:dropout_transition=0,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.79:level=false[out]',
      '-map', '0:v', '-map', '[out]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart',
      '-t', f'{total:.3f}', saida])
print('ok', saida, round(total, 2), 's; abertura', D0)
