#!/bin/bash
# Renderiza uma parte (de 40) do BOMBANANA! 3D numa máquina extra e entrega no branch bb-parte-NN.
# Uso: bash video/scripts/bb_render_parte.sh <parte> [partes=40]
set -e
I=$1; N=${2:-40}
cd "$(dirname "$0")/../remotion"
[ -d node_modules/@remotion ] || npm ci --no-audit --no-fund
TOT=$(python3 -c "import json;print(sum(b['dur'] for b in json.load(open('public/bb/timeline3d.json'))['blocos']))")
CH=$(( (TOT + N - 1) / N )); A=$(( I * CH )); B=$(( A + CH - 1 )); [ $B -ge $TOT ] && B=$(( TOT - 1 ))
NN=$(printf %02d $I)
OUT=/tmp/bb_parte_$NN.mp4
echo "parte $I: quadros $A-$B"
GL=angle-egl; [ -e /opt/pw-browsers ] || GL=swangle
npx remotion render VideoBB3D $OUT --props='{"arquivo":"bb/timeline3d.json","tl":null}' --frames=$A-$B --scale=0.5 --gl=$GL --muted --concurrency=4 --timeout=240000 --crf=18 --log=error
D=$(mktemp -d); cd $D; git init -q; git checkout -q -b bb-parte-$NN
cp $OUT parte_$NN.mp4; git add parte_$NN.mp4; git -c user.name=bb -c user.email=bb@local commit -qm "parte $NN"
R=$(git -C "$OLDPWD" remote get-url origin)
for t in 1 2 3 4 5; do git push -q -f "$R" bb-parte-$NN && break; sleep $((t*4)); done
echo "PARTE $NN ENTREGUE"
