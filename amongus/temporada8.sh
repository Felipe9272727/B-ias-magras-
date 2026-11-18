#!/bin/bash
# Temporada do AMONG IA 8 (The Skeld, 10 IAs, funções oficiais + Palhaço): partidas 1 a 3, retomando do checkpoint se cair.
cd "$(dirname "$0")"
for n in 1 2 3; do
  for t in 1 2 3 4 5 6; do
    python3 -c "import json,sys; sys.exit(0 if json.load(open('logs8/partida$n.json')).get('resultado') else 1)" 2>/dev/null && break
    pgrep -f ponte_assinatura >/dev/null || (setsid nohup node ../confianca/ponte_assinatura.mjs >> logs8/ponte.log 2>&1 &)
    echo "$(date -u +%T) partida $n tentativa $t" >> logs8/progresso.txt
    ORCAMENTO_USD=0.8 IA_DIRETO=1 PONTE_ASSINATURA=1 IA_TIMEOUT_S=180 node jogo8.mjs --temporada logs8/temporada.json --partida $n --max-tiques 90 >> logs8/partida$n.txt 2>&1
    sleep 5
  done
  echo "$(date -u +%T) partida $n acabou: $(grep '🏁' logs8/partida$n.txt | tail -1)" >> logs8/progresso.txt
done
echo TEMPORADA_FEITA >> logs8/progresso.txt
