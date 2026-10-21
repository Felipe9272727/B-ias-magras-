#!/usr/bin/env bash
# Temporada do Among Us 4, partidas 2 a 4: espera a partida 1 acabar e roda as outras no modo rápido
# (IA_DIRETO: as 15 IAs do OpenRouter de uma vez, mesmo raciocínio "low"; IA_TIMEOUT_S: no máximo 60 s por resposta).
set -euo pipefail
cd "$(dirname "$0")"
until [ -f logs4/partida1.json ] && grep -q '"memoria"' logs4/partida1.json && ! pgrep -f "jogo4.mjs --temporada logs4/temporada.json --partida 1" >/dev/null; do sleep 20; done
echo "PARTIDA_1_PRONTA: $(grep -E '^🏁' logs4/partida1.txt)"
for n in 2 3 4; do
  [ -f logs4/partida$n.json ] && grep -q '"resultado": {' logs4/partida$n.json && grep -q '"memoria"' logs4/partida$n.json && continue
  IA_DIRETO=1 IA_TIMEOUT_S=60 node jogo4.mjs --temporada logs4/temporada.json --partida $n --max-tiques 90 > logs4/partida$n.txt 2>&1
  echo "PARTIDA_${n}_PRONTA: $(grep -E '^🏁' logs4/partida$n.txt)"
done
echo TEMPORADA_PRONTA
