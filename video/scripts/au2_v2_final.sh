#!/usr/bin/env bash
# Among Us 2 v2: espera a montagem incremental (PID $1), mixa a trilha e sobe no litterbox.
set -uo pipefail
cd "$(dirname "$0")/../remotion"
while [ -d /proc/$1 ]; do sleep 30; done
grep -q PRONTO out/montar_v2.log || { echo "MONTAGEM_FALHOU"; tail -20 out/montar_v2.log; exit 1; }
python3 ../scripts/mix_audio.py out/au2_v2_sem_mix.mp4 out/among_us_2_v2.mp4 --timeline public/timeline_au2.json --roteiro roteiro_au2 || exit 1
for i in 1 2 3 4 5 6; do
  url=$(curl -sS -m 900 -F reqtype=fileupload -F time=72h -F fileToUpload=@out/among_us_2_v2.mp4 https://litterbox.catbox.moe/resources/internals/api.php) && [[ $url == https://* ]] && { echo "LINK $url"; exit 0; }
  sleep $((i * 10))
done
echo "UPLOAD_FALHOU"
