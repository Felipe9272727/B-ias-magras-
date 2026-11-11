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

## 10/11/2026 — LOGIN FUNCIONOU (via cookie .ROBLOSECURITY)
- O Felipe logou no navegador dele e passou o cookie .ROBLOSECURITY. Conferido em
  `https://users.roblox.com/v1/users/authenticated` (conta Carlosalberto1234736).
- O Cordial guarda cookies em `~/.local/share/cordial/profiles/default/cookies` (linhas `dominio<TAB>nome=valor; ...`).
  Basta pôr `.ROBLOSECURITY=<valor>` nas linhas .roblox.com/roblox.com/auth.roblox.com/apis.roblox.com com o
  Cordial fechado e abrir de novo: entra direto na Home, sem senha e sem verificação.
- O Flicker aparece em PT como "Tremer" (JJ Studios, place 1324061305). Aqui no ambiente do Claude dá erro 279
  (sem UDP). No Codespace (internet normal) deve conectar.
- Cookie NUNCA no repositório (é público): no Codespace usar um segredo do Codespaces chamado ROBLOSECURITY
  (github.com/settings/codespaces -> Codespaces secrets -> repositório B-ias-magras-).

## 10/11/2026 (tarde) — JOGANDO NO CODESPACE ✅
- Codespace TEM UDP (teste STUN ok). Este é o lugar.
- Cordial **0.34.1** (release v0.34.1, `Cordial-0.34.1-0-g378c83b-x86_64.AppImage`) roda o Roblox **2.746.0.1266**
  (o 0.34.0 só rodava 2.741, que o servidor recusa com erro 280 "cliente desatualizado").
- Sober NÃO serve no Codespace: exige placa de vídeo ("couldn't find a supported graphics device").
- Fluxo que funcionou: sway em Xvfb :110 -> Cordial 0.34.1 (Wayland) -> "Download Roblox" -> cookie no perfil ->
  Home logada -> busca "Natural Disaster Survival" -> Jogar -> dentro do jogo, com chat de jogadores reais.
- Busca da Home: barra em (673,28); botão Jogar do 1º resultado em (380,573) (tela 1280x720).
- Comandos pela ponte: roblox/ponte.sh no Codespace; aqui `cmd.sh` manda e lê o branch roblox-status.

## 11/11/2026 — PERDEMOS AS GRAVAÇÕES DO MURDER E DO BROOKHAVEN (lição)
- No Codespace o `/tmp` é um disco TEMPORÁRIO (`/dev/sda1`): quando o Codespace desliga por inatividade, o GitHub
  troca esse disco por um vazio. Foram embora brookhaven_1/2/3, murderer_1 e color_block (e o Cordial instalado).
  Sobraram só os logs (branch `backup-roblox-status-1111`) e as gravações do Natural Disaster que já estavam no gofile.
- REGRA: gravar SEMPRE em `/workspaces/B-ias-magras-/gravacoes_roblox/` (disco persistente, fora do git via
  `.git/info/exclude`) e subir no gofile assim que cada gravação terminar. Instalar o Cordial em
  `/workspaces/cordial/` e não em `/tmp`. Logs do agente: copiar para a mesma pasta ao fim de cada sessão.
- Antes de deixar o Codespace sozinho: aumentar o tempo de inatividade (github.com/settings/codespaces -> Default idle
  timeout, até 240 min) ou subir tudo antes.
