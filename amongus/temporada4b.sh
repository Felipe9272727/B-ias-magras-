#!/usr/bin/env bash
# Temporada do Among Us 4: as 4 partidas no modo rápido (IA_DIRETO: as 15 IAs do OpenRouter de uma vez, mesmo
# raciocínio "low"; IA_TIMEOUT_S: no máximo 60 s por resposta). A memória de uma passa pra próxima. Retoma de onde parou.
# (A partida 1 com espera longa parou no tique 30 com o Qwen falhando: ver logs4/descartadas.)
set -euo pipefail
cd "$(dirname "$0")"
for n in 1 2 3 4; do
  [ -f logs4/partida$n.json ] && grep -q '"resultado": {' logs4/partida$n.json && grep -q '"memoria"' logs4/partida$n.json && continue
  IA_DIRETO=1 IA_TIMEOUT_S=60 node jogo4.mjs --temporada logs4/temporada.json --partida $n --max-tiques 90 > logs4/partida$n.txt 2>&1
  echo "PARTIDA_${n}_PRONTA: $(grep -E '^🏁' logs4/partida$n.txt)"
done
echo TEMPORADA_PRONTA
