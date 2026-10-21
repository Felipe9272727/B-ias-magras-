#!/usr/bin/env bash
# Temporada do Among Us 4: 4 partidas em sequência (a memória de uma passa pra próxima). Retoma de onde parou.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p logs4
[ -f logs4/temporada.json ] || python3 sorteio4.py --partidas 4 --saida logs4/temporada.json > logs4/sorteio.txt
for n in 1 2 3 4; do
  [ -f logs4/partida$n.json ] && grep -q '"resultado": {' logs4/partida$n.json && grep -q '"memoria"' logs4/partida$n.json && continue
  node jogo4.mjs --temporada logs4/temporada.json --partida $n --max-tiques 90 > logs4/partida$n.txt 2>&1
  echo "PARTIDA_${n}_PRONTA: $(grep -E '^🏁' logs4/partida$n.txt)"
done
echo TEMPORADA_PRONTA
