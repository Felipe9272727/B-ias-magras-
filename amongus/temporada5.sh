#!/usr/bin/env bash
# Temporada do Among Us 5 (Polus): as 4 partidas no modo rápido (IA_DIRETO: as IAs do OpenRouter de uma vez;
# IA_TIMEOUT_S: no máximo 60 s por resposta). A memória de uma passa pra próxima. Retoma de onde parou.
set -euo pipefail
cd "$(dirname "$0")"
for n in 1 2 3 4; do
  [ -f logs5/partida$n.json ] && grep -q '"resultado": {' logs5/partida$n.json && grep -q '"memoria"' logs5/partida$n.json && continue
  IA_DIRETO=1 IA_TIMEOUT_S=60 node jogo5.mjs --temporada logs5/temporada.json --partida $n --max-tiques 90 > logs5/partida$n.txt 2>&1
  echo "PARTIDA_${n}_PRONTA: $(grep -E '^🏁' logs5/partida$n.txt)"
done
echo TEMPORADA_PRONTA
