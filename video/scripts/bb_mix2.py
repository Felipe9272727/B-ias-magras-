#!/usr/bin/env python3
"""Refaz o áudio inteiro do BOMBANANA! direto da timeline (sem depender do áudio do Remotion):
vozes e efeitos entram no quadro certo (cortados no fim da cena, igual ao Remotion); por baixo, uma trilha
diferente por capítulo, com fade entre elas e abaixando sozinha quando alguém fala.
Uso (de video/remotion): python3 ../scripts/bb_mix2.py public/timeline_bb.json <video_sem_audio_ou_qualquer.mp4> <saida.mp4>"""
import json
import subprocess
import sys
import tempfile
from pathlib import Path

FPS = 30
TRILHAS = {  # capítulo -> música (todas Kevin MacLeod, incompetech.com, CC BY 4.0)
    'intro': 'fluffing-a-duck.mp3', 'f1': 'sneaky-snitch.mp3', 'f2': 'investigations.mp3', 'f3': 'run-amok.mp3',
    'f4': 'hitman.mp3', 'f5': 'pixel-peeker-polka-faster.mp3', 'f6': 'quirky-dog.mp3', 'f7': 'bit-shift.mp3',
    'f8': 'mega-hyper-ultrastorm.mp3', 'f9': '8bit-dungeon-boss.mp3', 'fim': 'winner-winner.mp3',
}
VOL_MUS = 0.20

tl = json.loads(Path(sys.argv[1]).read_text())
video, saida = sys.argv[2], sys.argv[3]
pub = Path('public')
total = tl['durationInFrames'] / FPS
tmp = Path(tempfile.mkdtemp(dir='/tmp/claude-0'))

clipes = []  # (inicio_s, arquivo, volume, duracao_max_s)
for s in tl['scenes']:
    fim = s['start'] + s['duration']
    for e in s['events']:
        if e['type'] == 'voz':
            f, v = pub / e['src'], 1.0
        elif e['type'] == 'sfx':
            fl = e.get('file')
            f = pub / (fl if fl and '/' in fl else f"sfx/{fl or e['id'] + '.wav'}")
            v = e.get('vol', 0.3)
        else:
            continue
        if not f.exists():
            print('FALTA', f)
            continue
        ini = s['start'] + e['at']
        clipes.append((ini / FPS, str(f), v, (fim - ini) / FPS))
print(len(clipes), 'clipes,', round(total / 60, 2), 'min')

def roda(args):
    subprocess.run(['ffmpeg', '-v', 'error', '-y'] + args, check=True)

# 1) vozes + efeitos, em lotes
lotes = []
for k in range(0, len(clipes), 40):
    lote, args, filt = clipes[k:k + 40], [], []
    for i, (t, f, v, dmax) in enumerate(lote):
        args += ['-i', f]
        ms = int(round(t * 1000))
        filt.append(f'[{i}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{dmax:.3f},volume={v},adelay={ms}|{ms}[a{i}]')
    filt.append(''.join(f'[a{i}]' for i in range(len(lote))) + f'amix=inputs={len(lote)}:normalize=0:dropout_transition=0,apad=whole_dur={total:.3f}[o]')
    out = tmp / f'lote{k // 40:03d}.flac'
    roda(args + ['-filter_complex', ';'.join(filt), '-map', '[o]', '-t', f'{total:.3f}', str(out)])
    lotes.append(str(out))
vozes = tmp / 'vozes.flac'
args = sum((['-i', l] for l in lotes), [])
roda(args + ['-filter_complex', ''.join(f'[{i}:a]' for i in range(len(lotes))) + f'amix=inputs={len(lotes)}:normalize=0[o]', '-map', '[o]', '-t', f'{total:.3f}', str(vozes)])

# 2) trilha por capítulo, com fade de 1,5 s em cada ponta
pedacos = []
for c in tl['chapters']:
    dur = (c['end'] - c['start']) / FPS
    if c is tl['chapters'][-1]:
        dur = total - c['start'] / FPS
    out = tmp / f"mus_{c['id']}.flac"
    roda(['-stream_loop', '-1', '-i', str(pub / 'music' / TRILHAS[c['id']]), '-af',
          f'aresample=48000,aformat=channel_layouts=stereo,atrim=0:{dur:.3f},afade=t=in:d=1.5,afade=t=out:st={max(0, dur - 1.5):.3f}:d=1.5',
          '-t', f'{dur:.3f}', str(out)])
    pedacos.append(out)
lista = tmp / 'mus.txt'
lista.write_text(''.join(f"file '{p}'\n" for p in pedacos))
musica = tmp / 'musica.flac'
roda(['-f', 'concat', '-safe', '0', '-i', str(lista), '-c', 'copy', str(musica)])

# 3) junta: música abaixa quando tem voz/efeito (sidechain), normaliza e põe no vídeo (imagem copiada)
roda(['-i', video, '-i', str(vozes), '-i', str(musica), '-filter_complex',
      f'[1:a]asplit=2[v][sc];[2:a]volume={VOL_MUS}[m];[m][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=500[md];'
      '[v][md]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-15:TP=-1.5:LRA=11[a]',
      '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart',
      '-t', f'{total:.3f}', saida])
print('ok', saida)
