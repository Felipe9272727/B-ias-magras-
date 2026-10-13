#!/usr/bin/env bash
# Amostra do vídeo 3 no modo rápido (cenas da traição): linha do tempo → cenários → bonecos necessários → Remotion → mix.
set -euo pipefail
cd "$(dirname "$0")/.."
CENAS=${CENAS:-p223,p224,p225,p226,p227}
python3 scripts/build_v3.py --cenas "$CENAS" --nome amostra | tail -2
python3 ../ilha/blender/render3d.py 1 --lista ../ilha/dados/tomadas3_amostra.json
python3 ../ilha/blender/necessarios.py
xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P ../ilha/blender/cena/bonecos.py -- --lista ../ilha/dados/bonecos_necessarios.json > ../ilha/logs/bonecos_amostra.log 2>&1
python3 ../ilha/blender/tiras.py
cd remotion
BROWSER=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)
npx remotion render src/index.ts Video3Amostra out/v3_amostra_sem_mix.mp4 --concurrency=3 --crf=18 --browser-executable="$BROWSER" --log=error
cd ../scripts
python3 mix_audio.py ../remotion/out/v3_amostra_sem_mix.mp4 ../remotion/out/v3_amostra.mp4 --timeline ../remotion/public/timeline3_amostra.json --roteiro roteiro3
echo AMOSTRA_PRONTA
