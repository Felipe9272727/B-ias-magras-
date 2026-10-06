#!/usr/bin/env python3
"""Prepara os efeitos sonoros baixados (Mixkit / archive.org): corta, aplica fade e
normaliza todos para a mesma loudness (bem abaixo da voz).

Uso: python3 prep_sfx.py pasta_com_mp3_baixados ../remotion/public/sfx
"""
import json
import subprocess
import sys
from pathlib import Path

# id: (arquivo de origem, duração máxima em s, descrição, fonte)
SFX = {
    'whoosh': ('whoosh.mp3', 1.2, 'Cinematic whoosh fast transition', 'Mixkit #1492'),
    'boom': ('boom.mp3', 2.5, 'Cool impact movie trailer', 'Mixkit #2909'),
    'death': ('death.mp3', 1.6, 'Funny fail low tone', 'Mixkit #2876'),
    'tada': ('tada.mp3', 2.6, 'Video game win', 'Mixkit #2016'),
    'level-up': ('level-up.mp3', 2.4, 'Game level completed', 'Mixkit #2059'),
    'drumroll': ('drumroll.mp3', 2.4, 'Drum Roll', 'Mixkit #566'),
    'coin': ('coin.mp3', 0.6, 'Arcade game jump coin', 'Mixkit #216'),
    'pop': ('pop.mp3', 0.6, 'Hard pop click', 'Mixkit #2364'),
    'record-scratch': ('record-scratch.mp3', 1.4, 'Record scratch (plot twist)', 'archive.org RecordScratchSoundEffectPlotTwistSound'),
}
TARGET_LUFS = -24  # a voz fica perto de -16 LUFS; os efeitos ficam bem abaixo


def main():
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    dst.mkdir(parents=True, exist_ok=True)
    meta = []
    for sid, (name, maxd, desc, source) in SFX.items():
        out = dst / f'{sid}.mp3'
        fade = min(0.4, maxd / 3)
        af = (f'atrim=0:{maxd},afade=t=out:st={maxd - fade:.2f}:d={fade:.2f},'
              f'loudnorm=I={TARGET_LUFS}:TP=-3:LRA=7,aresample=48000')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(src / name), '-af', af, '-ac', '2', '-b:a', '192k', str(out)], check=True)
        old = dst / f'{sid}.wav'
        if old.exists():
            old.unlink()  # remove a versão sintetizada antiga
        meta.append(dict(id=sid, file=out.name, description=desc, source=source))
        print('ok', sid)
    (dst / 'sfx.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
