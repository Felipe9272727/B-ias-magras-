#!/usr/bin/env bash
# Pós-render: mixagem final no FFmpeg + conferências (duração, loudness, áudio/vídeo).
# Uso: ./finalize.sh   (depois do render do Remotion em remotion/out/video_sem_mix.mp4)
set -euo pipefail
cd "$(dirname "$0")"
OUT=../remotion/out
python3 mix_audio.py "$OUT/video_sem_mix.mp4" "$OUT/mario_rl_video_final.mp4"

echo "== duração / streams"
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate,sample_rate,channels -of default=nw=1 "$OUT/mario_rl_video_final.mp4"
echo "== loudness (EBU R128)"
ffmpeg -hide_banner -nostats -i "$OUT/mario_rl_video_final.mp4" -af ebur128 -f null - 2>&1 | grep -A6 "Summary" | sed -n '2,8p'
echo "== trechos de silêncio longos (> 2 s)"
ffmpeg -hide_banner -nostats -i "$OUT/mario_rl_video_final.mp4" -af silencedetect=noise=-45dB:d=2 -f null - 2>&1 | grep -E "silence_(start|end)" || echo "nenhum"
