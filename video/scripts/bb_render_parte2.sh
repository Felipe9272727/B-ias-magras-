#!/bin/bash
# Renderiza uma parte (de N) do BOMBANANA! (composição Bombanana, timeline_bb.json) numa máquina extra, em 540p com
# áudio PCM (mkv), e entrega no branch bb2-parte-NN. Uso: bash video/scripts/bb_render_parte2.sh <parte> [partes=24]
set -e
I=$1; N=${2:-24}
cd "$(dirname "$0")/../remotion"
[ -d node_modules/@remotion ] || npm ci --no-audit --no-fund
TOT=$(python3 -c "import json;print(json.load(open('public/timeline_bb.json'))['durationInFrames'])")
CH=$(( (TOT + N - 1) / N )); A=$(( I * CH )); B=$(( A + CH - 1 )); [ $B -ge $TOT ] && B=$(( TOT - 1 ))
NN=$(printf %02d $I)
OUT=/tmp/bb2_parte_$NN.mkv
echo "parte $I: quadros $A-$B de $TOT"
GL=${GL:-swangle}
npx remotion render Bombanana $OUT --codec=h264-mkv --frames=$A-$B --scale=0.5 --gl=$GL --concurrency=4 --timeout=240000 --crf=18 --log=error
R=$(git remote get-url origin)
D=$(mktemp -d); cd $D; git init -q; git checkout -q -b bb2-parte-$NN
cp $OUT parte_$NN.mkv; git add parte_$NN.mkv; git -c user.name=bb -c user.email=bb@local commit -qm "parte $NN"
for t in 1 2 3 4 5; do git push -q -f "$R" bb2-parte-$NN && break; sleep $((t*4)); done
echo "PARTE $NN ENTREGUE"
