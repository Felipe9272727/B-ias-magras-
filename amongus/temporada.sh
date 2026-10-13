#!/usr/bin/env bash
# Temporada do Among Us 2: sorteio de verdade (python secrets) e as 3 partidas em sequência, com memória entre elas.
set -euo pipefail
cd "$(dirname "$0")"
[ -f logs2/temporada.json ] || python3 sorteio.py --saida logs2/temporada.json > logs2/sorteio.txt
for n in 1 2 3; do
  [ -f logs2/partida$n.json ] && grep -q '"resultado": {' logs2/partida$n.json && grep -q '"memoria"' logs2/partida$n.json && continue
  node jogo2.mjs --temporada logs2/temporada.json --partida $n --max-tiques 70 > logs2/partida$n.txt 2>&1
done
echo TEMPORADA_PRONTA
