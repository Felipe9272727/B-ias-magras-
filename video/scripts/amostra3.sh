#!/usr/bin/env bash
# Amostra do vídeo 3 no modo rápido (cenas p223–p227, a traição): espera bonecos do Opus e do Haiku 2 e os cenários,
# monta as tiras, renderiza no Remotion e mixa.
set -euo pipefail
cd "$(dirname "$0")/.."
until grep -q "^FIM" ../ilha/logs/bonecos_0.log 2>/dev/null; do sleep 20; done
python3 ../ilha/blender/tiras.py
until grep -qE "PRONTO|FALTAM" ../ilha/logs/render3d_amostra.log 2>/dev/null; do sleep 20; done
cd remotion
BROWSER=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)
npx remotion render src/index.ts Video3Amostra out/v3_amostra_sem_mix.mp4 --concurrency=3 --crf=18 --browser-executable="$BROWSER" --log=error
cd ../scripts
python3 - <<'PY'
import importlib.util, json
from pathlib import Path
# trilha da amostra: tensão e depois a vitória
r = Path('../roteiro/roteiro3.py').read_text()
PY
python3 mix_audio.py ../remotion/out/v3_amostra_sem_mix.mp4 ../remotion/out/v3_amostra.mp4 --timeline ../remotion/public/timeline3_amostra.json --roteiro roteiro3
echo AMOSTRA_PRONTA
