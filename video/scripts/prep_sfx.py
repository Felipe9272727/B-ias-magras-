#!/usr/bin/env python3
"""Prepara os efeitos sonoros baixados (Mixkit / archive.org): corta, aplica fade e
normaliza todos para a mesma loudness (bem abaixo da voz).

Incremental: fontes ausentes são puladas e o sfx.json existente é preservado/mesclado.
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
    # --- lote 2 (todos Mixkit License: uso comercial livre, sem atribuição obrigatória) ---
    'sad-trombone': ('sad-trombone.mp3', 3.6, 'Sad trombone fail (wah wah wah wahhh)', 'Mixkit #471'),
    'wah-wah-trombone': ('wah-wah-trombone.mp3', 2.6, 'Trombone disappoint (wah wah curto)', 'Mixkit #744'),
    'fail-piano': ('fail-piano.mp3', 2.3, 'Cartoon failure piano (queda cômica)', 'Mixkit #473'),
    'sad-party-horn': ('sad-party-horn.mp3', 1.6, 'Cartoon sad party horn (corneta triste)', 'Mixkit #527'),
    'wrong-buzzer': ('wrong-buzzer.mp3', 1.8, 'Wrong answer bass buzzer (errou)', 'Mixkit #948'),
    'error-beep': ('error-beep.mp3', 1.2, 'System beep buzzer fail (erro genérico)', 'Mixkit #2964'),
    'correct-ding': ('correct-ding.mp3', 1.1, 'Correct answer fast notification (acertou)', 'Mixkit #953'),
    'crowd-boo': ('crowd-boo.mp3', 3.5, 'Crowd disappointment long boo (ooooh)', 'Mixkit #463'),
    'crowd-laugh': ('crowd-laugh.mp3', 3.8, 'Crowd laugh (plateia rindo)', 'Mixkit #424'),
    'crowd-applause': ('crowd-applause.mp3', 4.5, 'Medium size crowd applause', 'Mixkit #485'),
    'crowd-cheer': ('crowd-cheer.mp3', 3.8, 'Huge crowd cheering victory', 'Mixkit #462'),
    'gasp': ('gasp.mp3', 1.1, 'Female astonished gasp (uau / susto)', 'Mixkit #964'),
    'glitch': ('glitch.mp3', 1.1, 'Digital glitch break', 'Mixkit #2951'),
    'typing': ('typing.mp3', 3.5, 'Fast keyboard typing', 'Mixkit #1387'),
    'mouse-click': ('mouse-click.mp3', 1.1, 'Clear mouse clicks', 'Mixkit #2997'),
    'swoosh-air': ('swoosh-air.mp3', 0.85, 'Fast air sweep transition (swoosh curto)', 'Mixkit #168'),
    'swoosh-fly': ('swoosh-fly.mp3', 1.6, 'Flying fast swoosh', 'Mixkit #1469'),
    'swish-triple': ('swish-triple.mp3', 1.6, 'Triple bouncing swish', 'Mixkit #1499'),
    'riser': ('riser.mp3', 2.6, 'Cinematic trailer riser (suspense subindo)', 'Mixkit #790'),
    'impact-epic': ('impact-epic.mp3', 3.0, 'Epic movie impact (bass drop / vine-boom style hit)', 'Mixkit #2901'),
    'bass-pulse': ('bass-pulse.mp3', 3.0, 'Pulsating bass transition', 'Mixkit #2295'),
    'slide-whistle-fall': ('slide-whistle-fall.mp3', 2.7, 'Cartoon falling whistle (apito de queda)', 'Mixkit #395'),
    'boing': ('boing.mp3', 1.2, 'Boing hit sound (cartoon)', 'Mixkit #2894'),
    'explosion-arcade': ('explosion-arcade.mp3', 1.6, 'Arcade game explosion', 'Mixkit #2759'),
    'explosion': ('explosion.mp3', 3.0, 'Explosion hit', 'Mixkit #1704'),
    'heartbeat': ('heartbeat.mp3', 4.5, 'Cinematic heartbeat ambience (suspense)', 'Mixkit #497'),
    'jump-8bit': ('jump-8bit.mp3', 1.2, 'Video game spin jump (8-bit)', 'Mixkit #2648'),
    'powerup-8bit': ('powerup-8bit.mp3', 2.0, 'Arcade rising (power-up 8-bit)', 'Mixkit #231'),
    'game-over-8bit': ('game-over-8bit.mp3', 1.7, 'Arcade retro game over', 'Mixkit #213'),
    'camera-shutter': ('camera-shutter.mp3', 1.5, 'Camera long shutter', 'Mixkit #1432'),
    'notification-pop': ('notification-pop.mp3', 1.1, 'Message pop alert (notificação)', 'Mixkit #2354'),
    'censor-beep': ('censor-beep.mp3', 1.5, 'Censorship beep (piiiii)', 'Mixkit #1083'),
    'ba-dum-tss': ('ba-dum-tss.mp3', 2.4, 'Drum joke accent (ba dum tss)', 'Mixkit #579'),
    'system-breakdown': ('system-breakdown.mp3', 1.6, 'Funny system break down', 'Mixkit #2955'),
}
TARGET_LUFS = -24  # a voz fica perto de -16 LUFS; os efeitos ficam bem abaixo


def main():
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    dst.mkdir(parents=True, exist_ok=True)
    sfx_json = dst / 'sfx.json'
    meta = json.loads(sfx_json.read_text()) if sfx_json.exists() else []
    done = {m['id'] for m in meta}
    for sid, (name, maxd, desc, source) in SFX.items():
        out = dst / f'{sid}.mp3'
        if not (src / name).exists():
            print('pulando (sem arquivo de origem; mantém o existente)', sid)
            continue
        fade = min(0.4, maxd / 3)
        af = (f'atrim=0:{maxd},afade=t=out:st={maxd - fade:.2f}:d={fade:.2f},'
              f'loudnorm=I={TARGET_LUFS}:TP=-3:LRA=7,aresample=48000')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(src / name), '-af', af, '-ac', '2', '-b:a', '192k', str(out)], check=True)
        old = dst / f'{sid}.wav'
        if old.exists():
            old.unlink()  # remove a versão sintetizada antiga
        meta = [m for m in meta if m['id'] != sid]
        meta.append(dict(id=sid, file=out.name, description=desc, source=source))
        print('ok', sid)
    sfx_json.write_text(json.dumps(meta, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
