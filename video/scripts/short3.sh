#!/usr/bin/env bash
# Short 3 ponta a ponta: cenários 3D novos → bonecos que faltarem → render vertical → mix com música.
set -euo pipefail
cd "$(dirname "$0")/.."
R=..
python3 $R/ilha/blender/render3d.py 2 --lista $R/ilha/dados/tomadas3_short.json
python3 scripts/virar_falantes.py
python3 $R/ilha/blender/necessarios.py
xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P $R/ilha/blender/cena/bonecos.py -- --lista $R/ilha/dados/bonecos_necessarios.json > $R/ilha/logs/bonecos_short.log 2>&1
python3 $R/ilha/blender/tiras.py
cd remotion
npx remotion render src/index.ts ShortDS4 out/short3_sem_mix.mp4 --concurrency=4 --crf=18 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --log=error
bash ../scripts/mix_short.sh out/short3_sem_mix.mp4 public/music/sneaky-snitch.mp3 0.35 out/short3_final.mp4
echo SHORT_PRONTO
