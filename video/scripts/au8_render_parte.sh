#!/bin/bash
# AMONG IA 8 (v2): renderiza 1 parte (de N=16) em 540p, sem áudio, no GitHub Actions,
# com CHECKPOINT por branch (se o branch au8-v2-parte-NN já existe e FORCE_RENDER!=1, pula!).
# Uso: bash video/scripts/au8_render_parte.sh <parte 0..15> <N=16>
set -euo pipefail

I=$1
N=${2:-16}
cd "$(dirname "$0")/../remotion"

mkdir -p out
BR_PREFIX=$(python3 -c "import json;print(json.load(open('public/au8_pedido.json')).get('prefixo','au8-v2-parte'))")
NN=$(printf %02d "$I")
BR="${BR_PREFIX}-${NN}"
OUT="out/au8_p${NN}.mkv"
R="${PUSH_URL:-$(git remote get-url origin)}"

# Checkpoint: reaproveita branch já concluído se FORCE_RENDER != 1
if [ "${FORCE_RENDER:-0}" != "1" ] && git ls-remote --heads "$R" "$BR" | grep -q "refs/heads/$BR"; then
  echo "CHECKPOINT: branch $BR já existe — baixando parte_${NN}.mkv sem re-renderizar"
  D=$(mktemp -d)
  git clone --depth 1 --branch "$BR" "$R" "$D"
  cp "$D/parte_${NN}.mkv" "$OUT"
  rm -rf "$D"
  ls -lh "$OUT"
  exit 0
fi

# Baixa GIFs de meme faltantes a partir do catalog.json
python3 ../scripts/au8_baixar_assets.py --gifs

# Pasta leve só com assets do AU8 (evita o bundler copiar GBs de outros vídeos)
LEVE="out/au8_public"
if [ ! -d "$LEVE" ]; then
  mkdir -p "$LEVE"
  for d in au8 gifs fonts sfx sfx_au2 sfx_au4 timeline_au8.json; do
    [ -e "public/$d" ] && cp -al "public/$d" "$LEVE/"
  done
fi

TOT=$(python3 -c "import json;print(sum(c['dur'] for c in json.load(open('public/timeline_au8.json'))['cenas']))")
CH=$(( (TOT + N - 1) / N ))
A=$(( I * CH ))
B=$(( A + CH - 1 ))
[ "$B" -ge "$TOT" ] && B=$(( TOT - 1 ))

echo "Parte $NN/$N: quadros $A-$B de $TOT (540p crf=18)"
npx remotion render AU8Video "${OUT}.tmp.mkv" \
  --codec=h264-mkv \
  --frames="${A}-${B}" \
  --scale=0.5 \
  --muted \
  --concurrency="${CONC:-4}" \
  --timeout=240000 \
  --crf=18 \
  --log=error \
  --public-dir="$LEVE"
mv "${OUT}.tmp.mkv" "$OUT"

# Salva checkpoint no branch dedicado (sobrevive a falhas de outras partes)
D=$(mktemp -d)
(
  cd "$D"
  git init -q
  git checkout -q -b "$BR"
  cp "$(cd - >/dev/null && pwd)/$OUT" "parte_${NN}.mkv"
  git add "parte_${NN}.mkv"
  git -c user.name="au8-render" -c user.email="au8@local" commit -qm "AU8 v2 parte $NN ($A-$B)"
  for t in 1 2 3 4 5; do
    git push -q -f "$R" "$BR" && break
    sleep $((t * 4))
  done
)
rm -rf "$D"
echo "PARTE $NN ENTREGUE ($BR)"
