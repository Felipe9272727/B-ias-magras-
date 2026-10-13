#!/usr/bin/env bash
# Espera a rodada atual do vídeo 3 acabar, apaga os pedaços feitos antes das últimas correções e roda de novo
# (completo3.sh é retomável: só refaz esses pedaços, junta e mixa). Uso: refazer_inicio3.sh 002 [003 ...]
cd "$(dirname "$0")/../.."
until grep -q VIDEO_PRONTO ilha/logs/completo3.log; do sleep 30; done
for n in "$@"; do rm -f "video/remotion/out/pedacos/Video3Completo/p$n.mp4"; done
bash video/scripts/completo3.sh > ilha/logs/completo3b.log 2>&1
