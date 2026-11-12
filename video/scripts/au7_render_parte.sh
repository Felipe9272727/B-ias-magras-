#!/bin/bash
# AMONG IA 7 (Mira HQ): renderiza uma parte (de N) do vídeo, sem áudio, em 540p, numa máquina do GitHub Actions, e entrega no
# branch <prefixo>-NN. O áudio é montado à parte (au7_audio.py). Uso: bash video/scripts/au7_render_parte.sh <parte> <N>
set -e
I=$1; N=$2
cd "$(dirname "$0")/../remotion"
TOT=$(python3 -c "import json;print(sum(c['dur'] for c in json.load(open('public/timeline_au7.json'))['cenas']))")
CH=$(( (TOT + N - 1) / N )); A=$(( I * CH )); B=$(( A + CH - 1 )); [ $B -ge $TOT ] && B=$(( TOT - 1 ))
NN=$(printf %02d $I)
OUT=/tmp/au7_parte_$NN.mkv
# cada pedido usa um prefixo novo de branch (não dá para apagar os antigos daqui)
BR=$(python3 -c "import json;print(json.load(open('public/au7_pedido.json')).get('prefixo','au7-parte'))")-$NN
echo "parte $I: quadros $A-$B de $TOT"
npx remotion render AU7Video $OUT --codec=h264-mkv --frames=$A-$B --scale=0.5 --muted --concurrency=${CONC:-4} --timeout=240000 --crf=18 --log=error
R=${PUSH_URL:-$(git remote get-url origin)}
D=$(mktemp -d); cd $D; git init -q; git checkout -q -b $BR
cp $OUT parte_$NN.mkv; git add parte_$NN.mkv; git -c user.name=age -c user.email=age@local commit -qm "parte $NN"
for t in 1 2 3 4 5; do git push -q -f "$R" $BR && break; sleep $((t*4)); done
echo "PARTE $NN ENTREGUE"
