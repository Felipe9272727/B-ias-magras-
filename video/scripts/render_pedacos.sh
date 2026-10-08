#!/usr/bin/env bash
# Renderiza uma composição em pedaços (retomável): cada pedaço pronto fica salvo em out/pedacos/<comp>/
# e é pulado na próxima execução. No fim, junta tudo sem recodificar.
# Uso: render_pedacos.sh AmongUsIA out/v2_sem_mix.mp4 [quadros_por_pedaço]
set -euo pipefail
cd "$(dirname "$0")/../remotion"
COMP=$1; SAIDA=$2; PASSO=${3:-3600}
BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
DIR=out/pedacos/$COMP; mkdir -p "$DIR"
TOTAL=$(node -e "const t=require('./public/timeline2.json');console.log(t.durationInFrames)")
i=0
for ((ini=0; ini<TOTAL; ini+=PASSO)); do
  fim=$((ini+PASSO-1)); ((fim>=TOTAL)) && fim=$((TOTAL-1))
  arq=$(printf "%s/p%03d.mp4" "$DIR" $i)
  if [[ -s $arq ]]; then echo "pedaço $i já pronto"; else
    echo "pedaço $i: quadros $ini-$fim de $TOTAL"
    npx remotion render src/index.ts "$COMP" "$arq.tmp.mp4" --frames=$ini-$fim --concurrency=4 --crf=20 --browser-executable=$BROWSER --log=error
    mv "$arq.tmp.mp4" "$arq"
  fi
  i=$((i+1))
done
ls "$DIR"/p*.mp4 | sed "s|^|file '$PWD/|;s|$|'|" > "$DIR/lista.txt"
ffmpeg -y -loglevel error -f concat -safe 0 -i "$DIR/lista.txt" -c copy "$SAIDA"
echo "PRONTO $SAIDA"
