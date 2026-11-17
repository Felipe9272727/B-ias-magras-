#!/bin/bash
# Roda/retoma uma rodada do Tribunal até o FIM, relançando se o node cair. Uso: bash tribunal/rodar.sh Azul|Verde
cd "$(dirname "$0")"
A=$1; N=$(node -e "import('./farol_caso.mjs').then(m=>console.log(m.IAS['$A'].nome))")
for t in 1 2 3 4 5 6; do
  pgrep -f ponte_assinatura >/dev/null || (setsid nohup node ../confianca/ponte_assinatura.mjs >> logs/ponte.log 2>&1 &)
  IA_DIRETO=1 PONTE_ASSINATURA=1 IA_TIMEOUT_S=300 ORCAMENTO_USD=3 node farol.mjs --advogado $A --retomar >> logs/farol_$A.txt 2>&1
  python3 -c "import json,sys; sys.exit(0 if json.load(open('logs/farol_$N.json')).get('resultado') else 1)" && break
  sleep 10
done
