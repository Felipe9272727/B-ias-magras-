#!/usr/bin/env bash
# Mix final de um Short: voz+efeitos (áudio do render) + música em loop que abaixa quando há voz (sidechain),
# normalizado para -14 LUFS com pico abaixo de -1 dBFS.
# Uso: mix_short.sh entrada_render.mp4 musica.mp3 volume_musica saida.mp4
set -euo pipefail
IN=$1; MUS=$2; VOL=${3:-0.4}; OUT=$4
ffmpeg -v error -y -i "$IN" -stream_loop -1 -i "$MUS" -filter_complex \
  "[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[voz][chave];\
   [1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=$VOL,afade=t=in:d=0.4[m];\
   [m][chave]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=400:makeup=1[mduck];\
   [voz][mduck]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.79:level=false[a]" \
  -map 0:v -c:v copy -map "[a]" -c:a aac -b:a 192k -movflags +faststart -shortest "$OUT"
