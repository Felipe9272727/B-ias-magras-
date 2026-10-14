#!/usr/bin/env bash
# Among Us 2: espera o render em pedaços terminar, refaz o pedaço 0 (abertura com a imagem nova), mixa a trilha e sobe no litterbox.
# Uso: au2_final.sh <pid_do_render>
set -uo pipefail
cd "$(dirname "$0")/../remotion"
PID=${1:-}
[[ -n $PID ]] && while [[ -e /proc/$PID ]]; do sleep 20; done
rm -f out/pedacos/AmongUs2/p000.mp4
TL=timeline_au2.json bash ../scripts/render_pedacos.sh AmongUs2 out/au2_sem_mix.mp4 3600 || exit 1
python3 ../scripts/mix_audio.py out/au2_sem_mix.mp4 out/among_us_2.mp4 --timeline public/timeline_au2.json --roteiro roteiro_au2 || exit 1
for i in 1 2 3 4 5; do
  url=$(curl -sS -F reqtype=fileupload -F time=72h -F fileToUpload=@out/among_us_2.mp4 https://litterbox.catbox.moe/resources/internals/api.php) && [[ $url == https://* ]] && { echo "LINK $url"; exit 0; }
  sleep $((i * 10))
done
echo "UPLOAD_FALHOU"
