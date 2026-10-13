#!/usr/bin/env bash
# Vídeo 3 completo, ponta a ponta (retomável em todas as etapas):
# cenários 3D → bonecos que as cenas usam (2 processos) → Manim → Remotion em pedaços → mix → remotion/out/v3_final.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
R=..
python3 $R/ilha/blender/render3d.py 2 --lista $R/ilha/dados/tomadas3_completo.json
python3 $R/ilha/blender/necessarios.py
XV='xvfb-run -a -s "-screen 0 1920x1080x24"'
xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P $R/ilha/blender/cena/bonecos.py -- opus,sonnet,haiku1,haiku2,ds1,ds2 --lista $R/ilha/dados/bonecos_necessarios.json > $R/ilha/logs/bonecos_c0.log 2>&1 &
xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P $R/ilha/blender/cena/bonecos.py -- ds3,ds4,qwen1,qwen2,qwen3,qwen4 --lista $R/ilha/dados/bonecos_necessarios.json > $R/ilha/logs/bonecos_c1.log 2>&1 &
python3 scripts/manim3.py manim3_completo.json
wait
python3 $R/ilha/blender/tiras.py
TL=timeline3_completo.json bash scripts/render_pedacos.sh Video3Completo out/v3_sem_mix.mp4 3000
cd scripts
python3 mix_audio.py ../remotion/out/v3_sem_mix.mp4 ../remotion/out/v3_final.mp4 --timeline ../remotion/public/timeline3_completo.json --roteiro roteiro3
echo VIDEO_PRONTO
