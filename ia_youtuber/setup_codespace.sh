#!/usr/bin/env bash
set -euo pipefail

# Setup para rodar That's Not My Neighbor + motor_tnmn.py no GitHub Codespace / Linux X11
# Regra CORDIAL_SETUP.md: NUNCA gravar em /tmp (disco temporario do Codespace); usar pasta persistente!

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IA_DIR="$REPO_ROOT/ia_youtuber"
GRAVACOES_DIR="$IA_DIR/gravacoes"
DISPLAY_NUM="${DISPLAY_NUM:-:99}"
GAME_BIN="${1:-}"

echo "[1/5] Instalando dependencias de sistema (Xvfb, xdotool, scrot, ffmpeg, Pillow, rsvg-convert)..."
sudo apt-get update -qq
sudo apt-get install -y -qq xvfb xdotool scrot imagemagick ffmpeg python3-pil librsvg2-bin curl openbox

echo "[2/5] Criando diretorio persistente de gravacoes fora de /tmp: $GRAVACOES_DIR"
mkdir -p "$GRAVACOES_DIR" "$IA_DIR/voice_cache"

if git -C "$REPO_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  EXCLUDE_FILE="$REPO_ROOT/.git/info/exclude"
  mkdir -p "$(dirname "$EXCLUDE_FILE")"
  for pattern in "ia_youtuber/gravacoes/" "ia_youtuber/voice_cache/"; do
    if ! grep -qxF "$pattern" "$EXCLUDE_FILE" 2>/dev/null; then
      echo "$pattern" >> "$EXCLUDE_FILE"
    fi
  done
  echo "Exclusoes locais registradas em .git/info/exclude."
fi

echo "[3/5] Subindo display virtual Xvfb ($DISPLAY_NUM @ 1280x720x24)..."
if ! pgrep -f "Xvfb $DISPLAY_NUM" >/dev/null 2>&1; then
  Xvfb "$DISPLAY_NUM" -screen 0 1280x720x24 -ac +extension GLX +render -noreset >/dev/null 2>&1 &
  sleep 2
  DISPLAY="$DISPLAY_NUM" openbox >/dev/null 2>&1 &
  sleep 1
fi

echo "[4/5] Testando motor em modo --dry-run..."
python3 "$IA_DIR/motor_tnmn.py" --dry-run

echo "[5/5] Tudo pronto!"
cat <<EOF

Proximos passos:
  1) Exporte sua chave OpenRouter (ou coloque em apis.txt):
       export OPENROUTER_API_KEY="sk-or-..."
  2) Suba o executavel Linux de That's Not My Neighbor no Xvfb:
       DISPLAY=$DISPLAY_NUM ${GAME_BIN:-./tnmn.x86_64} &
  3) (Opcional) Tire um print com a grade 0..1000 para calibrar coords_tnmn.json:
       DISPLAY=$DISPLAY_NUM python3 "$IA_DIR/motor_tnmn.py" --backend x11 --calibrar
  4) Rode o agente jogando DE VERDADE + gravando gameplay_real.mp4:
       DISPLAY=$DISPLAY_NUM python3 "$IA_DIR/motor_tnmn.py" --backend x11 --orcamento-usd 0.80
  5) Suba o MP4 para o Gofile imediatamente apos gravar (nunca confie no tempo de ociosidade do Codespace!):
       SERVER=\$(curl -s https://api.gofile.io/servers | python3 -c "import sys,json;print(json.load(sys.stdin)['data']['servers'][0]['name'])")
       curl -F "file=@$GRAVACOES_DIR/<sessao>/gameplay_real.mp4" "https://\${SERVER}.gofile.io/contents/uploadfile"
  6) Gere o episodio final com webcam transparente + ElevenLabs v4 + mix -14 LUFS:
       python3 "$IA_DIR/montar_episodio.py" --sessao-dir "$GRAVACOES_DIR/<sessao>" --upscale-1080p
EOF
