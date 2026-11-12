#!/bin/bash
# Temporada do AMONG IA 7 (Mira HQ clássico): partidas 1 a 3; a 4ª só se sobrar crédito no OpenRouter (>= US$ 1).
# Teto de gasto por partida: ORCAMENTO_USD (lido do OpenRouter a cada 10 tiques). Log em logs7/partidaN.txt.
cd "$(dirname "$0")"
K=$(python3 -c "
import json,glob
for f in glob.glob('/root/.claude/plugins/store/chaves-ias*.json'):
    v=json.load(open(f))
    for d in (v,v.get('data',{}),v.get('values',{})):
        if isinstance(d,dict) and d.get('openrouter'): print(d['openrouter']); break
" | head -1)
saldo() { curl -s --max-time 20 https://openrouter.ai/api/v1/credits -H "Authorization: Bearer $K" | python3 -c "import sys,json;d=json.load(sys.stdin)['data'];print(round(d['total_credits']-d['total_usage'],3))"; }
for n in 1 2 3 4; do
  if [ $n = 4 ] && [ ! -f logs7/partida4.json.ckpt.json ]; then S=$(saldo); echo "saldo antes da 4: $S" >> logs7/progresso.txt; python3 -c "import sys; sys.exit(0 if float('$S')>=1.0 else 1)" || { echo "SEM SALDO PARA A 4" >> logs7/progresso.txt; break; }; fi
  [ -f logs7/partida$n.json ] && grep -q '"resultado": {' logs7/partida$n.json && python3 -c "import json,sys; sys.exit(0 if json.load(open('logs7/partida$n.json')).get('resultado') else 1)" && { echo "partida $n já feita" >> logs7/progresso.txt; continue; }
  echo "$(date -u +%T) partida $n começou (saldo $(saldo))" >> logs7/progresso.txt
  ORCAMENTO_USD=1.0 IA_DIRETO=1 IA_TIMEOUT_S=180 node jogo7.mjs --temporada logs7/temporada.json --partida $n --max-tiques 90 >> logs7/partida$n.txt 2>&1
  echo "$(date -u +%T) partida $n acabou: $(grep '🏁' logs7/partida$n.txt | tail -1)" >> logs7/progresso.txt
done
echo TEMPORADA_FEITA >> logs7/progresso.txt
