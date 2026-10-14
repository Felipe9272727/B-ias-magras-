#!/usr/bin/env bash
# Overcooked das IAs: espera a montagem por cenas (PID $1), mixa a trilha e sobe no litterbox.
set -uo pipefail
cd "$(dirname "$0")/../remotion"
while [ -d /proc/$1 ]; do sleep 30; done
grep -q PRONTO out/montar_oc.log || { echo "MONTAGEM_FALHOU"; tail -20 out/montar_oc.log; exit 1; }
python3 ../scripts/mix_audio.py out/overcooked_sem_mix.mp4 out/overcooked_das_ias.mp4 --timeline public/timeline_oc.json --roteiro roteiro_oc || exit 1
for i in 1 2 3 4 5 6; do
  url=$(curl -sS -m 900 -F reqtype=fileupload -F time=72h -F fileToUpload=@out/overcooked_das_ias.mp4 https://litterbox.catbox.moe/resources/internals/api.php 2>/dev/null | head -c 300)
  [[ $url == https://* ]] && { echo "LINK $url"; exit 0; }
  sleep $((i * 10))
done
echo "UPLOAD_FALHOU"
