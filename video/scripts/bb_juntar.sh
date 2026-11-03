#!/bin/bash
# Junta as 24 partes (branches bb2-parte-NN), sobe para 1080p (Lanczos), normaliza o volume e gera out/BOMBANANA.mp4
set -e
N=${1:-24}
cd "$(dirname "$0")/../remotion"
D=/tmp/claude-0/bb2; mkdir -p $D; : > $D/lista.txt
for i in $(seq 0 $((N-1))); do
  NN=$(printf %02d $i)
  [ -f $D/parte_$NN.mkv ] || (git fetch -q origin bb2-parte-$NN && git show FETCH_HEAD:parte_$NN.mkv > $D/parte_$NN.mkv)
  echo "file '$D/parte_$NN.mkv'" >> $D/lista.txt
done
ffmpeg -v error -y -f concat -safe 0 -i $D/lista.txt -c copy $D/junto.mkv
ffmpeg -v error -y -i $D/junto.mkv -vf "scale=1920:1080:flags=lanczos" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -af loudnorm=I=-15:TP=-1.5:LRA=11 -c:a aac -b:a 192k -movflags +faststart out/BOMBANANA.mp4
ls -la out/BOMBANANA.mp4
