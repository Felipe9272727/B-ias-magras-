#!/usr/bin/env bash
# Roblox no GitHub Codespaces pelo Cordial, com tela remota (noVNC) para o Felipe mexer pelo navegador do celular.
# Uso (no Terminal do Codespace):  bash roblox/cordial_codespace.sh
# Depois abra a aba PORTAS (Ports) do Codespace, toque no globo da porta 6080 e em "vnc.html" -> Connect.
# Lá você faz o login e segura o botão "sou humano" você mesmo. Depois a IA assume.
set -e
cd /tmp
echo ">> 1/6 instalando pacotes (uns 3 min)..."
sudo apt-get update -qq
sudo apt-get install -y -qq xvfb xdotool imagemagick sway libwebkitgtk-6.0-4 wl-clipboard bubblewrap \
  x11vnc novnc websockify pulseaudio dbus-x11 libfuse2t64 > /tmp/apt_cordial.log 2>&1 || sudo apt-get install -y -qq xvfb xdotool imagemagick sway libwebkitgtk-6.0-4 wl-clipboard bubblewrap x11vnc novnc websockify pulseaudio dbus-x11 > /tmp/apt_cordial.log 2>&1
sudo mkdir -p /usr/libexec && sudo ln -sfn /usr/lib/x86_64-linux-gnu/webkitgtk-6.0 /usr/libexec/webkitgtk-6.0

echo ">> 2/6 baixando o Cordial 0.34.0..."
[ -f Cordial.AppImage ] || curl -fsSL https://github.com/luohoa97/cordial/releases/download/v0.34.0/Cordial-0.34.0-0-gfe20025-x86_64.AppImage -o Cordial.AppImage
echo "1c775f7f9ebe5816f34674fcc4452d9ac0e2b1eaecb0e3799ce8747150bf9b0d  Cordial.AppImage" | sha256sum -c -
chmod +x Cordial.AppImage

echo ">> 3/6 tela virtual + tela remota (noVNC na porta 6080)..."
pkill -f "Xvfb :110" 2>/dev/null || true
Xvfb :110 -screen 0 1280x720x24 -nolisten tcp > /tmp/xvfb.log 2>&1 &
sleep 2
x11vnc -display :110 -nopw -forever -shared -localhost -quiet > /tmp/x11vnc.log 2>&1 &
websockify --web /usr/share/novnc 6080 localhost:5900 > /tmp/novnc.log 2>&1 &

echo ">> 4/6 som virtual e sessão..."
pulseaudio --start --exit-idle-time=-1 2>/dev/null || true
pactl load-module module-null-sink sink_name=virtual 2>/dev/null || true
export DBUS_SESSION_BUS_ADDRESS=unix:path=/tmp/dbus-sess
[ -S /tmp/dbus-sess ] || dbus-daemon --session --fork --address=$DBUS_SESSION_BUS_ADDRESS

echo ">> 5/6 sway (Wayland, para a janela de verificação abrir)..."
mkdir -p /tmp/xdg2 && chmod 700 /tmp/xdg2
printf 'output * resolution 1280x720\ndefault_border none\n' > /tmp/sway.conf
DISPLAY=:110 XDG_RUNTIME_DIR=/tmp/xdg2 WLR_BACKENDS=x11 WLR_RENDERER=pixman WLR_NO_HARDWARE_CURSORS=1 sway -c /tmp/sway.conf > /tmp/sway.log 2>&1 &
sleep 5

echo ">> 6/6 abrindo o Cordial..."
env -u DISPLAY WAYLAND_DISPLAY=wayland-1 XDG_RUNTIME_DIR=/tmp/xdg2 ./Cordial.AppImage --appimage-extract-and-run > /tmp/cordial.log 2>&1 &
sleep 10
cat <<'TXT'

=====================================================================
 PRONTO. AGORA É COM VOCÊ (pelo celular):
 1. Aba "PORTAS"/"Ports" do Codespace -> porta 6080 -> ícone do globo.
 2. Abra "vnc.html" e toque em "Connect".
 3. No Cordial: botão "Roblox". Se pedir a versão, toque em
    "Copy Sober's build" (NÃO use "Download Roblox": a versão nova não abre).
 4. "Sign In" -> usuário e senha -> "Sign In".
 5. Na tela "Hold the button to confirm you're human": SEGURE o botão.
 6. Entrou? Me avise no chat: a IA assume daqui.
=====================================================================
TXT
