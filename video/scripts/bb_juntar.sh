#!/bin/bash
# Junta o vídeo do BOMBANANA!: para cada uma das 24 partes usa bb2-parte-NN se existir, senão as duas metades
# bb48-parte-(2N) e (2N+1). Sobe para 1080p (Lanczos), normaliza o volume e gera out/BOMBANANA.mp4
set -e
cd "$(dirname "$0")/../remotion"
D=/tmp/claude-0/bb2; mkdir -p $D; : > $D/lista.txt
pega() { [ -s $D/$2 ] || (git fetch -q origin $1 && git show FETCH_HEAD:$2 > $D/$2); echo "file '$D/$2'" >> $D/lista.txt; }
for p in $(seq 0 23); do
  PP=$(printf %02d $p)
  if git ls-remote --exit-code origin refs/heads/bb2-parte-$PP >/dev/null 2>&1; then pega bb2-parte-$PP parte_$PP.mkv
  else for h in $((2*p)) $((2*p+1)); do HH=$(printf %02d $h); pega bb48-parte-$HH parte_$HH.mkv; done; fi
done
ffmpeg -v error -y -f concat -safe 0 -i $D/lista.txt -c copy $D/junto.mkv
ffmpeg -v error -y -i $D/junto.mkv -vf "scale=1920:1080:flags=lanczos" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -af loudnorm=I=-15:TP=-1.5:LRA=11 -c:a aac -b:a 192k -movflags +faststart out/BOMBANANA.mp4
ls -la out/BOMBANANA.mp4
