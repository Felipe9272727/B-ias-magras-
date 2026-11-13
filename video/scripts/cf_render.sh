#!/bin/bash
# JOGO DE CONFIANÇA: render local em 4 partes, 540p, mudo (áudio à parte: cf_audio.py; final: cf_final.py).
# Uso (de video/remotion): bash ../scripts/cf_render.sh [partes...]
set -e
TOT=$(python3 -c "import json;print(sum(c['dur'] for c in json.load(open('public/timeline_confianca.json'))['cenas']))")
N=4; CH=$(( (TOT + N - 1) / N ))
for I in ${@:-0 1 2 3}; do
  A=$(( I * CH )); B=$(( A + CH - 1 )); [ $B -ge $TOT ] && B=$(( TOT - 1 ))
  [ -s out/cf_p$I.mkv ] && { echo "parte $I já existe"; continue; }
  echo "$(date -u +%T) parte $I: quadros $A-$B de $TOT"
  npx remotion render ConfiancaVideo out/cf_p$I.tmp.mkv --codec=h264-mkv --frames=$A-$B --scale=0.5 --muted --concurrency=4 --timeout=240000 --crf=18 --log=error --public-dir=out/cf_public
  mv out/cf_p$I.tmp.mkv out/cf_p$I.mkv
done
printf "file 'cf_p0.mkv'\nfile 'cf_p1.mkv'\nfile 'cf_p2.mkv'\nfile 'cf_p3.mkv'\n" > out/cf_lista.txt
echo RENDER_FEITO
