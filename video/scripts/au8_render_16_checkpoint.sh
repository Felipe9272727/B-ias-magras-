#!/bin/bash
# Render local do AU8 v2 em 16 partes com CHECKPOINT atômico por parte em /app/applet/.render-cache/au8_v2
set -euo pipefail

N=16
REPO="/tmp/b-ias-magras"
REM="$REPO/video/remotion"
CACHE="/app/applet/.render-cache/au8_v2"
mkdir -p "$CACHE"
LOG="$CACHE/render.log"

cd "$REM"

# Garante symlink out -> CACHE para que checkpoints fiquem no workspace
if [ ! -L "$REM/out" ]; then
  rm -rf "$REM/out"
  ln -s "$CACHE" "$REM/out"
fi

python3 ../scripts/au8_baixar_assets.py --gifs --music

# Pasta leve só com assets do AU8 (hardlinks no mesmo FS do repo, fora do cache)
LEVE="/tmp/au8_public_leve"
rm -rf "$LEVE"
mkdir -p "$LEVE"
for d in au8 gifs fonts sfx sfx_au2 sfx_au4 timeline_au8.json; do
  [ -e "public/$d" ] && cp -al "public/$d" "$LEVE/"
done

TOT=$(python3 -c "import json;print(sum(c['dur'] for c in json.load(open('public/timeline_au8.json'))['cenas']))")
CH=$(( (TOT + N - 1) / N ))

write_progress() {
  local stage="$1"
  local cur="${2:-null}"
  python3 - "$CACHE" "$stage" "$cur" "$TOT" "$N" << 'PY'
import json, sys, time
from pathlib import Path
cache, stage, cur, tot, n = Path(sys.argv[1]), sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
data = {
    "stage": stage,
    "currentPart": None if cur == "null" else int(cur),
    "totalFrames": tot,
    "totalChunks": n,
    "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
}
tmp = cache / "progress.json.tmp"
tmp.write_text(json.dumps(data, indent=2))
tmp.replace(cache / "progress.json")
PY
}

# Detecta browser pré-instalado (Playwright headless-shell)
BROWSER_ARGS=()
if [ -x "/ms-playwright/chrome-headless-shell-linux64/chrome-headless-shell" ]; then
  BROWSER_ARGS+=(--browser-executable=/ms-playwright/chrome-headless-shell-linux64/chrome-headless-shell)
fi

echo "$$" > "$CACHE/runner.pid"
trap 'rm -f "$CACHE/runner.pid"' EXIT

echo "=== [$(date -u +%T)] Iniciando AU8 v2 (16 partes com checkpoint, $TOT quadros) ==="

for I in $(seq 0 $((N - 1))); do
  P=$(printf %02d "$I")
  A=$(( I * CH ))
  B=$(( A + CH - 1 ))
  [ "$B" -ge "$TOT" ] && B=$(( TOT - 1 ))
  FINAL_PART="$CACHE/au8_p${P}.mkv"
  TMP_PART="$CACHE/au8_p${P}.tmp.mkv"

  if [ -s "$FINAL_PART" ] && [ "$(stat -c%s "$FINAL_PART")" -gt 50000 ]; then
    echo "[$(date -u +%T)] CHECKPOINT OK: parte $P ($A-$B) já pronta — pulando"
    continue
  fi

  rm -f "$TMP_PART"
  write_progress "render_540p" "$I"
  echo "[$(date -u +%T)] Renderizando parte $P/15: quadros $A-$B de $TOT"

  npx remotion render AU8Video "$TMP_PART" \
    --codec=h264-mkv \
    --frames="${A}-${B}" \
    --scale=0.5 \
    --port=3110 \
    --muted \
    --concurrency=3 \
    --timeout=240000 \
    --crf=18 \
    --log=error \
    --public-dir="$LEVE" \
    "${BROWSER_ARGS[@]}"

  mv "$TMP_PART" "$FINAL_PART"
  echo "[$(date -u +%T)] CHECKPOINT SALVO: parte $P ($(du -h "$FINAL_PART" | cut -f1))"
done

write_progress "mux_audio" "null"
echo "[$(date -u +%T)] Concatenando 16 partes..."
: > "$CACHE/au8_lista.txt"
for I in $(seq 0 $((N - 1))); do
  P=$(printf %02d "$I")
  echo "file '$CACHE/au8_p${P}.mkv'" >> "$CACHE/au8_lista.txt"
done

ffmpeg -v error -y -f concat -safe 0 -i "$CACHE/au8_lista.txt" -c copy "$CACHE/au8_mudo.mkv"

echo "[$(date -u +%T)] Mixando vozes + SFX..."
python3 ../scripts/au8_audio.py "$CACHE/au8_voz.flac"

echo "[$(date -u +%T)] Unindo vídeo + áudio..."
ffmpeg -v error -y -i "$CACHE/au8_mudo.mkv" -i "$CACHE/au8_voz.flac" -map 0:v -map 1:a -c:v copy -c:a flac "$CACHE/au8_completo.mkv"

write_progress "upscale_1080p" "null"
echo "[$(date -u +%T)] Fazendo upscale 1080p (Lanczos) + trilha + -14 LUFS..."
python3 ../scripts/au8_final.py "$CACHE/au8_completo.mkv" "$CACHE/among_ia_8_v2_1080p.tmp.mp4"
mv "$CACHE/among_ia_8_v2_1080p.tmp.mp4" "$CACHE/among_ia_8_v2_1080p.mp4"

write_progress "done" "null"
echo "[$(date -u +%T)] CONCLUÍDO! $(ls -lh "$CACHE/among_ia_8_v2_1080p.mp4")"
