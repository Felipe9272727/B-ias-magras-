#!/bin/bash
# Renderiza UMA metade (de 48) do BOMBANANA! se ainda não foi entregue. Uso: GL=swangle bash bb_uma.sh <metade>
cd "$(dirname "$0")/../.."
NN=$(printf %02d $1)
if git ls-remote --exit-code origin "refs/heads/bb48-parte-$NN" >/dev/null 2>&1; then echo "JA ENTREGUE $1"; exit 0; fi
bash video/scripts/bb_render_parte2.sh $1 48 2>&1 | tail -3
git ls-remote --exit-code origin "refs/heads/bb48-parte-$NN" >/dev/null 2>&1 && echo "ENTREGUE $1" || echo "FALHOU $1"
