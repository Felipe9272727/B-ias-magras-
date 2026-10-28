#!/bin/bash
# render_seguro.sh <gravação> <saida.mp4> <t_inicio> <t_fim> <câmera>: o replay.mjs, retomando se o navegador travar
# (cada trava vira um pedaço; no fim junta tudo sem recodificar)
cd "$(dirname "$0")"
G=$1; SAIDA=$2; T=$3; FIM=$4; CAM=$5; FPS=${FPS:-30}
PEDACOS=(); k=0
while :; do
  P="${SAIDA%.mp4}_p$k.mp4"
  node replay.mjs "$G" "$P" "$T" "$FIM" "$CAM" "$FPS" > "${P%.mp4}.log" 2>&1; cod=$?
  PEDACOS+=("$P")
  if [ $cod -eq 3 ]; then
    i=$(grep -o 'PAROU [0-9]*' "${P%.mp4}.log" | awk '{print $2}')
    T=$(python3 -c "print($T + $i / $FPS)"); k=$((k + 1))
    [ $k -gt 8 ] && { echo "travou demais: $SAIDA"; exit 1; }
    continue
  fi
  [ $cod -ne 0 ] && { echo "erro $cod: $SAIDA"; tail -5 "${P%.mp4}.log"; exit 1; }
  break
done
if [ ${#PEDACOS[@]} -eq 1 ]; then mv "${PEDACOS[0]}" "$SAIDA"; else
  L="${SAIDA%.mp4}_lista.txt"; : > "$L"; for p in "${PEDACOS[@]}"; do echo "file '$p'" >> "$L"; done
  ffmpeg -v error -y -f concat -safe 0 -i "$L" -c copy "$SAIDA"
fi
echo "feito $SAIDA ($k travas)"
