#!/usr/bin/env bash
# Espera cada render terminar e codifica o MP4 (24 fps) em video/remotion/public/ilha/clips/.
cd "$(dirname "$0")/../.."
declare -A META=([abertura]=384 [praia]=168 [plataformas]=240 [aerea]=192)
while :; do
  falta=0
  for t in abertura praia plataformas aerea; do
    out=video/remotion/public/ilha/clips/$t.mp4
    [ -f "$out" ] && continue
    n=$(ls ilha/render/$t 2>/dev/null | wc -l)
    if [ "$n" -ge "${META[$t]}" ]; then
      ffmpeg -y -loglevel error -framerate 24 -i ilha/render/$t/%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 -g 24 "$out" && echo "CLIPE $t"
    else falta=1; fi
  done
  [ $falta = 0 ] && break
  sleep 60
done
echo CLIPES_PRONTOS
