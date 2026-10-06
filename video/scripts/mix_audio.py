#!/usr/bin/env python3
"""Mixagem final no FFmpeg: trilha por capítulo + ducking sob a narração + loudnorm.

O Remotion renderiza o vídeo com narração e efeitos sonoros. Este script:
  1. monta a trilha (Kevin MacLeod, CC BY 4.0) com uma música por bloco de cenas,
     com fade de entrada/saída e volume calibrado pela loudness de cada faixa;
  2. abaixa a música automaticamente quando há voz (sidechaincompress);
  3. normaliza o resultado para -14 LUFS (padrão do YouTube) e muxa com o vídeo
     sem recodificar a imagem.

Uso: python3 mix_audio.py entrada.mp4 saida.mp4 [--timeline ../remotion/public/timeline.json]
"""
import argparse
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'remotion' / 'public'

# Música por intervalo de cenas: (primeira cena, música, início dentro da faixa em s)
CUES = [
    ('s01', 'monkeys-spinning-monkeys', 0),
    ('s04', 'pixel-peeker-polka-faster', 0),
    ('s07', 'chipper-doodle-v2', 0),
    ('s12', 'itty-bitty-8-bit', 0),
    ('s18', 'sneaky-snitch', 0),
    ('s21', 'fluffing-a-duck', 0),
    ('s22', 'pixel-peeker-polka-faster', 65),
    ('s26', '8bit-dungeon-boss', 0),
    ('s30', 'sneaky-snitch', 58),
    ('s32', 'heroic-age', 0),
    ('s35', 'monkeys-spinning-monkeys', 38),
]
MUSIC_GAIN = 0.85  # sobre o volume sugerido de cada faixa (music.json)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('out')
    ap.add_argument('--timeline', default=str(PUBLIC / 'timeline.json'))
    ap.add_argument('--start', type=float, default=0.0, help='início do trecho (s), para testes parciais')
    args = ap.parse_args()

    tl = json.loads(Path(args.timeline).read_text())
    fps = tl['fps']
    music = {m['id']: m for m in json.loads((PUBLIC / 'music' / 'music.json').read_text())}
    scene_start = {s['id']: s['start'] / fps for s in tl['scenes']}
    total = tl['durationInFrames'] / fps
    probe = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', args.video], capture_output=True, text=True)
    vid_dur = float(probe.stdout.strip())
    t0 = args.start
    t1 = min(total, t0 + vid_dur)

    cues = []
    for i, (sid, mid, offset) in enumerate(CUES):
        if sid not in scene_start:
            continue
        start = scene_start[sid]
        end = scene_start[CUES[i + 1][0]] if i + 1 < len(CUES) and CUES[i + 1][0] in scene_start else total
        # sobreposição de 1 s para o crossfade
        cues.append(dict(id=mid, offset=offset, start=max(0, start - 0.5), end=min(total, end + 0.5)))

    inputs = ['-i', args.video]
    filters = []
    labels = []
    n = 0
    for c in cues:
        # recorta para a janela do vídeo de entrada (útil em testes parciais)
        s, e = max(c['start'], t0), min(c['end'], t1)
        if e - s < 0.3:
            continue
        m = music[c['id']]
        n += 1
        skip = c['offset'] + (s - c['start'])
        inputs += ['-stream_loop', '-1', '-ss', f'{skip:.3f}', '-i', str(PUBLIC / m['file'])]
        dur = e - s
        vol = m.get('suggested_bg_volume', 0.25) * MUSIC_GAIN
        fade_in = 0.8 if s > t0 + 0.01 else 0.3
        delay = int(round((s - t0) * 1000))
        filters.append(
            f'[{n}:a]atrim=0:{dur:.3f},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,'
            f'volume={vol:.3f},afade=t=in:st=0:d={fade_in},afade=t=out:st={max(0, dur - 1.2):.3f}:d=1.2,'
            f'adelay={delay}|{delay}[m{n}]'
        )
        labels.append(f'[m{n}]')
    if not labels:
        raise SystemExit('Nenhuma música no intervalo.')
    filters.append(f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0:dropout_transition=0[music]")
    filters.append('[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[voice][key]')
    # música abaixa ~10 dB enquanto há voz/efeitos
    filters.append('[music][key]sidechaincompress=threshold=0.015:ratio=9:attack=25:release=450:makeup=1[ducked]')
    filters.append('[voice][ducked]amix=inputs=2:normalize=0:dropout_transition=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]')
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex', ';'.join(filters),
           '-map', '0:v', '-c:v', 'copy', '-map', '[out]', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
           '-movflags', '+faststart', '-shortest', args.out]
    print(f'Mixando {len(labels)} trechos de música…')
    subprocess.run(cmd, check=True)
    print('ok', args.out)


if __name__ == '__main__':
    main()
