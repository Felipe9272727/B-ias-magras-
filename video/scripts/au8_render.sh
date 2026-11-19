#!/bin/bash
# AMONG IA 8 (The Skeld): render local MUDO em pedaços de ~4000 quadros, 540p (--scale=0.5), --concurrency=3, no molde do
# Tribunal (tb_render.sh). O public/ inteiro tem GB e o bundle copia tudo: usa uma pasta de hardlinks só com o que o AU8 usa.
# Áudio à parte (au8_audio.py), junção sem recodificar e final com upscale Lanczos (au8_final.py).
# Uso (de video/remotion): bash ../scripts/au8_render.sh [pedaços...]   (sem argumento: todos; pedaço pronto é pulado)
set -e
LEVE=out/au8_public
if [ ! -d $LEVE ]; then
  mkdir -p $LEVE
  for d in au8 gifs fonts sfx sfx_au2 sfx_au4 timeline_au8.json; do cp -al public/$d $LEVE/; done
fi
TOT=$(python3 -c "import json;print(sum(c['dur'] for c in json.load(open('public/timeline_au8.json'))['cenas']))")
CH=4000; N=$(( (TOT + CH - 1) / CH ))
for I in ${@:-$(seq 0 $((N - 1)))}; do
  A=$(( I * CH )); B=$(( A + CH - 1 )); [ $B -ge $TOT ] && B=$(( TOT - 1 ))
  P=$(printf %02d $I)
  [ -s out/au8_p$P.mkv ] && { echo "pedaço $P já existe"; continue; }
  echo "$(date -u +%T) pedaço $P: quadros $A-$B de $TOT"
  npx remotion render AU8Video out/au8_p$P.tmp.mkv --codec=h264-mkv --frames=$A-$B --scale=0.5 --muted --concurrency=3 --timeout=240000 --crf=18 --log=error --public-dir=$LEVE
  mv out/au8_p$P.tmp.mkv out/au8_p$P.mkv
done
ls out/au8_p??.mkv | sed "s#out/#file '#; s#\$#'#" > out/au8_lista.txt
echo "RENDER_FEITO ($N pedaços de $TOT quadros)"
