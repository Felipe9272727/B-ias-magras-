#!/usr/bin/env bash
# Temporada do Among Us 3: 4 partidas em sequência (a memória de uma passa pra próxima). Retoma de onde parou.
set -euo pipefail
cd "$(dirname "$0")"
[ -f logs3/temporada.json ] || python3 sorteio3.py --partidas 4 --saida logs3/temporada.json > logs3/sorteio.txt
for n in 1 2 3 4; do
  [ -f logs3/partida$n.json ] && grep -q '"resultado": {' logs3/partida$n.json && grep -q '"memoria"' logs3/partida$n.json && continue
  # da partida 2 em diante as tarefas são em etapas (mais demoradas): limite maior
  node jogo3.mjs --temporada logs3/temporada.json --partida $n --max-tiques $([ $n -ge 2 ] && echo 90 || echo 70) > logs3/partida$n.txt 2>&1
done
echo TEMPORADA_PRONTA
