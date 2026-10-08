#!/usr/bin/env bash
# Espera a passada atual do pipeline3 acabar e roda de novo até não faltar nenhum pedaço (refaz os apagados).
cd "$(dirname "$0")/.."
while pgrep -f "bash scripts/pipeline[3].sh" >/dev/null; do sleep 30; done
for i in 1 2 3; do
  bash scripts/pipeline3.sh >> ../ilha/logs/pipeline3.log 2>&1
  n=$(ls remotion/out/pedacos/Video3/p*.mp4 2>/dev/null | grep -vc tmp)
  [ "$n" -ge 11 ] && grep -q PRONTO ../ilha/logs/pipeline3.log && break
done
echo FINAL_OK >> ../ilha/logs/pipeline3.log
