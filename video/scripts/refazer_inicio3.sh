#!/usr/bin/env bash
# Espera a rodada atual do vídeo 3 acabar, apaga os pedaços feitos antes das correções e roda de novo
# (completo3.sh é retomável: só refaz esses pedaços, junta e mixa).
cd "$(dirname "$0")/../.."
until grep -q VIDEO_PRONTO ilha/logs/completo3.log; do sleep 30; done
rm -f video/remotion/out/pedacos/Video3Completo/p00{0,1,2,3}.mp4
bash video/scripts/completo3.sh > ilha/logs/completo3b.log 2>&1
