#!/usr/bin/env bash
# Among Us 2: refaz SÓ o áudio (efeitos/vozes) sem renderizar a imagem de novo, junta com a imagem já pronta,
# mixa a trilha e sobe no litterbox.
set -uo pipefail
cd "$(dirname "$0")/../remotion"
BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx remotion render src/index.ts AmongUs2 out/au2_audio.wav --codec=wav --concurrency=4 --browser-executable=$BROWSER --log=error || exit 1
ffmpeg -v error -y -i out/au2_sem_mix.mp4 -i out/au2_audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest out/au2_sem_mix_v2.mp4 || exit 1
python3 ../scripts/mix_audio.py out/au2_sem_mix_v2.mp4 out/among_us_2.mp4 --timeline public/timeline_au2.json --roteiro roteiro_au2 || exit 1
for i in 1 2 3 4 5 6; do
  url=$(curl -sS -m 900 -F reqtype=fileupload -F time=72h -F fileToUpload=@out/among_us_2.mp4 https://litterbox.catbox.moe/resources/internals/api.php) && [[ $url == https://* ]] && { echo "LINK $url"; exit 0; }
  sleep $((i * 10))
done
echo "UPLOAD_FALHOU"
