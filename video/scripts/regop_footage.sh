#!/usr/bin/env bash
# Recodifica as gravações com um quadro-chave por segundo (GOP 30).
# O x264 padrão usa GOP 250 (~8 s): cada corte para um ponto aleatório de um
# clipe longo obrigava o Remotion a decodificar centenas de quadros, o que
# deixava as montagens rápidas (ex.: cena das fases) muito lentas para renderizar.
set -euo pipefail
cd "$(dirname "$0")/../remotion/public/footage"
for f in *.mp4; do
  [[ $f == tmp_* ]] && continue
  if ffprobe -v error -select_streams v:0 -show_entries format_tags=comment -of csv=p=0 "$f" | grep -q gop30; then
    continue
  fi
  ffmpeg -y -loglevel error -i "$f" -c:v libx264 -preset veryfast -crf 17 -g 30 -keyint_min 30 -sc_threshold 0 \
    -pix_fmt yuv420p -movflags +faststart -metadata comment=gop30 "tmp_$f"
  mv "tmp_$f" "$f"
  echo "ok $f"
done
