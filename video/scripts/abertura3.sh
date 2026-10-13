#!/usr/bin/env bash
# Abertura do vídeo 3: espera as tomadas 3D (render3d.py), renderiza no Remotion e mixa a música.
set -euo pipefail
cd "$(dirname "$0")/.."
until grep -q PRONTO ../ilha/logs/render3d.log 2>/dev/null; do sleep 30; done
cd remotion
BROWSER=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)
npx remotion render src/index.ts Video3 out/v3_abertura_sem_mix.mp4 --concurrency=3 --crf=18 --browser-executable="$BROWSER" --log=error
cd ../scripts
python3 mix_audio.py ../remotion/out/v3_abertura_sem_mix.mp4 ../remotion/out/v3_abertura.mp4 --timeline ../remotion/public/timeline3.json --roteiro roteiro3
echo ABERTURA_PRONTA
