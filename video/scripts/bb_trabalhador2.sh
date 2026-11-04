#!/bin/bash
# Trabalhador do render do BOMBANANA!: pega metades (de 48) ainda não entregues, na ordem dada, renderiza e entrega no
# branch bb48-parte-NN. Pula as que já existem (outro trabalhador fez). Uso: bash bb_trabalhador.sh "<lista de metades>"
cd "$(dirname "$0")/../.."
for h in $1; do
  NN=$(printf %02d $h)
  P=$((h / 2)); PP=$(printf %02d $P)
  if git ls-remote --exit-code origin "refs/heads/bb48-parte-$NN" >/dev/null 2>&1 || git ls-remote --exit-code origin "refs/heads/bb2-parte-$PP" >/dev/null 2>&1; then echo "pula $h"; continue; fi
  # marca que está pegando (evita dois trabalhadores na mesma)
  if git ls-remote --exit-code origin "refs/heads/bb48r2-pega-$NN" >/dev/null 2>&1; then echo "outro pegou $h"; continue; fi
  git push -q origin HEAD:refs/heads/bb48r2-pega-$NN 2>/dev/null || true
  OUT=$(bash video/scripts/bb_render_parte2.sh $h 48 2>&1 | tail -3); echo "$OUT"
done
echo TRABALHADOR FIM
