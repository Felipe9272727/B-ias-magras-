#!/bin/bash
# INTERROGATÓRIO DAS IAs — PARTE 2: render local MUDO em pedaços de ~4000 quadros, 540p (--scale=0.5), --concurrency=3
# (molde do au8_render.sh). O public/ inteiro tem GB e o bundle copia tudo: usa uma pasta de hardlinks só com o que a
# composição Interrogatorio2 usa (fontes, efeitos, vozes da parte 2 e SÓ os memes da timeline).
# Depois: áudio montado da timeline (int2_audio.py), junção sem recodificar e final com trilha + upscale Lanczos (int2_final.py).
# Uso (de video/remotion): bash ../scripts/int2_render.sh [pedaços...]   (sem argumento: todos; pedaço pronto é pulado)
set -e
TL=public/timeline_int2.json
LEVE=out/int2_public
if [ ! -d $LEVE ]; then
  mkdir -p $LEVE/gifs
  for d in fonts sfx sfx_au2 sfx_au4 voice_int2; do cp -al public/$d $LEVE/; done
  cp -al $TL $LEVE/
  python3 - "$TL" "$LEVE" <<'EOF'
import json, os, sys
tl = json.load(open(sys.argv[1]))
for m in sorted({e['id'] for s in tl['scenes'] for e in s['events'] if e['type'] == 'meme'}):
    f = tl['memes'][m]['file']
    os.link(f'public/gifs/{f}', f'{sys.argv[2]}/gifs/{f}')
EOF
fi
TOT=$(python3 -c "import json;print(json.load(open('$TL'))['durationInFrames'])")
CH=4000; N=$(( (TOT + CH - 1) / CH ))
for I in ${@:-$(seq 0 $((N - 1)))}; do
  A=$(( I * CH )); B=$(( A + CH - 1 )); [ $B -ge $TOT ] && B=$(( TOT - 1 ))
  P=$(printf %02d $I)
  [ -s out/int2_p$P.mkv ] && { echo "pedaço $P já existe"; continue; }
  echo "$(date -u +%T) pedaço $P: quadros $A-$B de $TOT"
  npx remotion render Interrogatorio2 out/int2_p$P.tmp.mkv --codec=h264-mkv --frames=$A-$B --scale=0.5 --muted --concurrency=3 --timeout=240000 --crf=18 --log=error --public-dir=$LEVE
  mv out/int2_p$P.tmp.mkv out/int2_p$P.mkv
done
ls out/int2_p??.mkv | sed "s#out/#file '#; s#\$#'#" > out/int2_lista.txt
echo "RENDER_FEITO ($N pedaços de $TOT quadros)"
