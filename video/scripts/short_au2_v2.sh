#!/usr/bin/env bash
# Shorts do Among Us 2 com os pensamentos na tela: espera a montagem do vídeo longo (PID $1), renderiza os trechos
# (pelo bundle já pronto, $2), a narração do gancho e a composição ShortAU2; normaliza o volume e sobe no litterbox.
set -uo pipefail
cd "$(dirname "$0")/../remotion"
while [ -d /proc/$1 ]; do sleep 30; done
BUNDLE=$2 python3 ../scripts/short_au2.py || exit 1
npx remotion render src/index.ts ShortAU2 out/short_au2_v2.mp4 --concurrency=4 --crf=18 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --log=error || exit 1
rm -rf /tmp/remotion-* /tmp/react-motion-render*
ffmpeg -v error -y -i out/short_au2_v2.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -ar 48000 out/short_au2_v2_final.mp4 || exit 1
for i in 1 2 3 4 5 6; do
  url=$(curl -sS -m 600 -F reqtype=fileupload -F time=72h -F fileToUpload=@out/short_au2_v2_final.mp4 https://litterbox.catbox.moe/resources/internals/api.php) && [[ $url == https://* ]] && { echo "LINK $url"; exit 0; }
  sleep $((i * 10))
done
echo "UPLOAD_FALHOU"
