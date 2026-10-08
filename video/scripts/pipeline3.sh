#!/usr/bin/env bash
# Vídeo 3 de ponta a ponta: espera os clipes do Blender, gera a timeline (vozes em cache),
# renderiza em pedaços (retomável) e mixa a trilha. Imprime PRONTO no fim.
# Uso: setsid nohup bash scripts/pipeline3.sh > ../ilha/logs/pipeline3.log 2>&1 < /dev/null &
set -euo pipefail
cd "$(dirname "$0")/.."
PUB=remotion/public
ROTEIRO=roteiro/roteiro3.py

# clipes usados pelo roteiro (só espera os que aparecem no roteiro)
CLIPES=$(grep -o "ilha/clips/[a-z0-9_]*\.mp4" "$ROTEIRO" | sort -u)
for c in $CLIPES; do
  until [[ -s "$PUB/$c" ]]; do
    echo "$(date '+%H:%M:%S') aguardando $c"
    sleep 60
  done
  echo "$(date '+%H:%M:%S') ok $c"
done

python3 scripts/build_timeline3.py
mkdir -p remotion/out
TL=timeline3.json scripts/render_pedacos.sh Video3 out/v3_sem_mix.mp4
(cd remotion && python3 ../scripts/mix_audio.py out/v3_sem_mix.mp4 out/v3_final.mp4 \
  --timeline public/timeline3.json --roteiro roteiro3)
echo "PRONTO remotion/out/v3_final.mp4"
