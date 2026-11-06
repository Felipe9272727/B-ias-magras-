# Roblox via Cordial — o que funcionou (06/11/2026)

Testado no ambiente do Claude (sem GPU, sem UDP):
1. Cordial v0.34.0 AppImage (sha256 1c775f7f9ebe5816f34674fcc4452d9ac0e2b1eaecb0e3799ce8747150bf9b0d), rodar com
   `--appimage-extract-and-run`.
2. Roblox mais novo (2.746) NÃO carrega no Cordial 0.34 (falta AImageReader_delete). Funciona o build 2.741.0.1061
   (copiado do Sober: "Copy Sober's build").
3. A janela de verificação do login só abre em Wayland com WebKitGTK 6.0:
   `apt install sway libwebkitgtk-6.0-4 wl-clipboard bubblewrap` +
   `ln -sfn /usr/lib/x86_64-linux-gnu/webkitgtk-6.0 /usr/libexec/webkitgtk-6.0`
   sway aninhado no Xvfb: `XDG_RUNTIME_DIR=/tmp/xdg2 WLR_BACKENDS=x11 WLR_RENDERER=pixman sway -c sway.conf`
   Cordial: `env -u DISPLAY WAYLAND_DISPLAY=wayland-1 XDG_RUNTIME_DIR=/tmp/xdg2 ./Cordial.AppImage --appimage-extract-and-run`
   Digitar com `xdotool type --delay 150` no display do Xvfb (o sway repassa); wtype não funciona no campo do Roblox.
4. Login rápido (código) falha: o Roblox exige o mesmo local/rede do aparelho que aprova.
5. Login com senha chega em "Hold the button to confirm you're human": ESTE PASSO TEM QUE SER FEITO PELO HUMANO
   (o Claude não aperta verificação anti-robô). Plano: rodar no Codespace com noVNC (porta 6080) e o Felipe segura
   o botão pelo navegador do celular. Depois do login, o agente (Jev decide, Haiku conversa) assume.
6. Aqui a rede bloqueia UDP (o Roblox precisa para entrar na partida): jogar mesmo só no Codespace.
Ponte para comandar o Codespace: roblox/ponte.sh (branch roblox-cmd -> roblox-status; buscar com `git fetch origin +roblox-status:...`).
