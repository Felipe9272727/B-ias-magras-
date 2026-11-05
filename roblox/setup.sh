#!/usr/bin/env bash
# Teste de viabilidade no GitHub Codespaces: instala o Sober (Roblox de Android no Linux), abre numa tela virtual,
# passa pelas telas iniciais e manda prints + diagnóstico para o branch "roblox-status" a cada 30 s.
set -x
cd "$(dirname "$0")/.."
REPO=$(pwd)
ST=/tmp/roblox_status; mkdir -p $ST
diag() {
  { echo "data: $(date -u)"; echo "cpus: $(nproc)"; free -g | head -2
    echo "dmi: $(ls /sys/class/dmi/id 2>&1 | head -3 | tr '\n' ' ')"
    python3 - <<'PY'
import socket,os
s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM); s.settimeout(5)
try:
    s.sendto(b'\x00\x01\x00\x00\x21\x12\xa4\x42'+os.urandom(12),('stun.l.google.com',19302)); s.recvfrom(1024); print('udp: ok')
except Exception as e: print('udp: falhou', e)
PY
  } > $ST/diagnostico.txt 2>&1
}
envia() {  # manda prints e logs para o branch roblox-status (repositório de status, sem mexer no branch de trabalho)
  D=/tmp/roblox_push; rm -rf $D; mkdir -p $D; cp -r $ST/. $D/; cp /tmp/roblox_setup.log /tmp/sober.log $D/ 2>/dev/null
  cd $D && git init -q && git checkout -q -b roblox-status && git add -A && git -c user.name=roblox -c user.email=roblox@local commit -qm "status $(date -u +%H:%M:%S)" \
    && git push -q -f "$(git -C $REPO remote get-url origin)" roblox-status; cd $REPO
}
diag; envia
sudo apt-get update -qq
sudo apt-get install -y -qq flatpak xvfb xdotool imagemagick ffmpeg dbus-x11 python3 > /dev/null
flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --user -y --noninteractive flathub org.vinegarhq.Sober > $ST/flatpak.log 2>&1
echo "sober instalado: $?" >> $ST/diagnostico.txt; envia
Xvfb :99 -screen 0 1280x720x24 > /tmp/xvfb.log 2>&1 &
sleep 2
export DISPLAY=:99
eval "$(dbus-launch --sh-syntax)"
flatpak run --user org.vinegarhq.Sober > /tmp/sober.log 2>&1 &
shot() { import -window root $ST/tela_$1.png; }
sleep 20; shot 01_inicio; envia
xdotool mousemove 234 500 click 1; sleep 10; shot 02_config; envia
xdotool mousemove 234 598 click 1
for i in $(seq -w 3 40); do sleep 30; shot ${i}; tail -40 /tmp/sober.log > $ST/sober_tail.txt; envia; done
