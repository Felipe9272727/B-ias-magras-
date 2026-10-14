#!/usr/bin/env bash
# Partida 4 ("revanche"): só roda se as 3 primeiras terminarem todas com vitória dos tripulantes.
# Configurações da sala mais perto do padrão do jogo (mais tarefas, facada um pouco mais rápida, fantasma mais lento);
# papéis sorteados na hora pelo sorteio.py (python secrets), com a memória das partidas anteriores.
set -euo pipefail
cd "$(dirname "$0")"
until grep -q TEMPORADA_PRONTA logs2/temporada.log; do sleep 30; done
if grep -q "IMPOSTOR venceu" logs2/partida3.txt logs2/partida2.txt logs2/partida1.txt; then echo "impostores já venceram uma: sem revanche"; exit 0; fi
grep -q '"cfg"' <(python3 -c "import json;print(json.load(open('logs2/temporada.json'))['partidas'][3:])") || \
  python3 sorteio.py --saida logs2/temporada.json --adicionar 1 --cfg '{"tarefasPorTripulante": 6, "recargaMorte": 4, "fantasmaTarefaCada": 2}' >> logs2/sorteio.txt
node jogo2.mjs --temporada logs2/temporada.json --partida 4 --max-tiques 70 > logs2/partida4.txt 2>&1
echo REVANCHE_PRONTA
