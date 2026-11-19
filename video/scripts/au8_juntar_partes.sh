#!/bin/bash
# Junta as 16 partes renderizadas (locais ou dos branches au8-v2-parte-00..15),
# mixa vozes + SFX (au8_audio.py) e gera o MP4 final em 1080p Lanczos (-14 LUFS).
set -euo pipefail
N=${1:-16}
cd "$(dirname "$0")/../remotion"
mkdir -p out

BR_PREFIX=$(python3 -c "import json;print(json.load(open('public/au8_pedido.json')).get('prefixo','au8-v2-parte'))")
R="${PUSH_URL:-$(git remote get-url origin)}"

for I in $(seq 0 $((N - 1))); do
  NN=$(printf %02d "$I")
  F="out/au8_p${NN}.mkv"
  if [ ! -s "$F" ]; then
    BR="${BR_PREFIX}-${NN}"
    echo "Baixando parte $NN do branch $BR..."
    D=$(mktemp -d)
    git clone --depth 1 --branch "$BR" "$R" "$D"
    cp "$D/parte_${NN}.mkv" "$F"
    rm -rf "$D"
  fi
done

: > out/au8_lista.txt
for I in $(seq 0 $((N - 1))); do
  NN=$(printf %02d "$I")
  echo "file 'au8_p${NN}.mkv'" >> out/au8_lista.txt
done

echo "Concatenando $N partes sem recodificar..."
ffmpeg -v error -y -f concat -safe 0 -i out/au8_lista.txt -c copy out/au8_mudo.mkv

echo "Mixando vozes + efeitos..."
python3 ../scripts/au8_audio.py out/au8_voz.flac

echo "Unindo vídeo + áudio..."
ffmpeg -v error -y -i out/au8_mudo.mkv -i out/au8_voz.flac -map 0:v -map 1:a -c:v copy -c:a flac out/au8_completo.mkv

echo "Baixando trilhas Kevin MacLeod faltantes..."
python3 ../scripts/au8_baixar_assets.py --music

echo "Upscale 1080p Lanczos + trilha Kevin MacLeod + loudnorm -14 LUFS..."
python3 ../scripts/au8_final.py out/au8_completo.mkv out/among_ia_8_v4_1080p.mp4
ls -lh out/among_ia_8_v4_1080p.mp4
