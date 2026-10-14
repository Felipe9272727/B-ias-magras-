#!/usr/bin/env bash
# Among Us 2 v2 (cache por cena): importa os trechos já feitos, gera o bundle, renderiza só as cenas que faltam,
# mixa a trilha e sobe no litterbox.
set -uo pipefail
cd "$(dirname "$0")/../remotion"
B=/tmp/claude-0/-home-user-B-ias-magras-/1ec1e0ad-a38d-55a9-9e93-6eda9da8f7bf/scratchpad
python3 ../scripts/montar_cenas_au2.py --importar timeline_au2_v2a.json || exit 1
rm -rf $B/bundle $B/bundle2
npx remotion bundle src/index.ts --out-dir=$B/bundle3 --log=error || exit 1
python3 ../scripts/montar_cenas_au2.py $B/bundle3 out/au2_v2_sem_mix.mp4 || exit 1
python3 ../scripts/mix_audio.py out/au2_v2_sem_mix.mp4 out/among_us_2_v2.mp4 --timeline public/timeline_au2.json --roteiro roteiro_au2 || exit 1
for i in 1 2 3 4 5 6; do
  url=$(curl -sS -m 900 -F reqtype=fileupload -F time=72h -F fileToUpload=@out/among_us_2_v2.mp4 https://litterbox.catbox.moe/resources/internals/api.php) && [[ $url == https://* ]] && { echo "LINK $url"; exit 0; }
  sleep $((i * 10))
done
echo "UPLOAD_FALHOU"
