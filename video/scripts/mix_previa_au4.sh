#!/usr/bin/env bash
# Prévia do AU4: junta a trilha (sneaky-snitch, em loop) por baixo da narração, abaixando quando o narrador fala,
# e normaliza o volume. Uso: mix_previa_au4.sh <entrada sem mix> <saída>
set -euo pipefail
MUS="$(dirname "$0")/../remotion/public/music/sneaky-snitch.mp3"
ffmpeg -v error -y -i "$1" -stream_loop -1 -i "$MUS" -filter_complex \
  "[0:a]asplit=2[voz][chave];[1:a]volume=0.22[m0];[m0][chave]sidechaincompress=threshold=0.015:ratio=9:attack=25:release=450[m1];[voz][m1]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest "$2"
