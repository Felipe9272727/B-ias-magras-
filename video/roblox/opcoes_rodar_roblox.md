# Opções para rodar o cliente do Roblox num servidor Linux sem GPU

Pesquisa feita em 06/11/2026. Objetivo: rodar uma experiência pública (ex.: "Flicker") com o cliente oficial ou wrapper legítimo, controlado por script (Xvfb + simulação de mouse/teclado), num container tipo GitHub Codespaces (Docker privileged, 4 núcleos, 16 GB, sem KVM provável).

Fora do escopo: executores, exploits, burlar anticheat.

Legenda de confiança: **[confirmado]** = visto em fonte primária (GitHub, DevForum, site oficial); **[secundário]** = blog, agregador ou comentário de usuário; **[não verificado]** = não encontrei fonte.

---

## 1. Sober (org.vinegarhq.Sober)

### Situação atual [confirmado]
- **Issue #2567 "Error code 280"**, aberta em **04/11/2026**, ainda **aberta** em 05/11/2026. Link: https://github.com/vinegarhq/sober/issues/2567
  - Nenhuma resposta de mantenedor com previsão, workaround, build de teste ou comando flatpak.
  - Único ato de mantenedor: em 05/11/2026 a conta `vinegarhq` apagou um comentário de outro usuário (conteúdo não visível).
  - Um usuário escreveu "[will] prob be fixed in like an hr" (opinião, não confirmada).
  - A issue está marcada como `bug`, sem assignee nem PR ligado.
- **Issue #2496 "Disconnect 277"** (aberta 18/09/2026, aberta): erro diferente, de carregamento de texturas em experiências pesadas. Link: https://github.com/vinegarhq/sober/issues/2496 . Sem resposta do mantenedor.
- Outras issues abertas de 2026 (lista da busca em 06/11): #2532 (launcher fecha sozinho, 13/10), #2522 (Roblox fecha, 05/10), #2552 (frame pacing OpenGL, 25/10). Sem relação direta com erro 280.

### Histórico de quanto demora a correção [confirmado]
| Evento | Abertura | Correção | Tempo aproximado |
|---|---|---|---|
| #1165 "error 280/gameplay unavailable" | 07/08/2025 | nova versão no Flathub em 08/08/2025, fechada 09/08/2025 | ~1–2 dias |
| #1971 "Sober Roblox version is out of date" | 07/05/2026 | fix pronto no dia 08/05; release travado por problema do Flathub; build de teste disponível | ~1–2 dias |
| #2101 "crashing frequently" (Sober 1.6.9, Roblox 2.721.1108) | 25/05/2026 | fix publicado no mesmo dia, fechada | horas |

Causa dita pelos mantenedores/contribuidores: o Roblox recusa builds antigas do cliente. Um contribuidor (k1yrix, #1165) disse que uma build do Roblox costuma ficar aceita por cerca de 1 mês; quando o Roblox derruba todas as builds (em 2025, antes de uma release Android), o Sober precisa de update.

### Previsão para novembro de 2026
- **Não há previsão oficial.** Nenhum mantenedor respondeu à #2567 até 05/11/2026.
- Pelo histórico, quando o mantenedor responde, a correção sai em 1–2 dias. Mas o silêncio atual é maior que nos casos de 2025 e 2026, então não dá para prever.

### Canal beta, flag ou versão alternativa [confirmado / parcial]
- **Build de teste** (maio de 2026, #1971): `flatpak install --user https://dl.flathub.org/build-repo/282191/org.vinegarhq.Sober.flatpakref` (precisa desinstalar antes com `flatpak uninstall org.vinegarhq.Sober`). Ideal: usar o build mais novo quando o mantenedor disser que há um.
- **CDN bundle** (citado em #2101, build 2026-05-25_e5953d3): fallback quando o Flathub atrasa. Versão antiga, pode não servir hoje.
- **FFlags**: a doc do Sober diz que flags são limitadas por segurança do Roblox e só funcionam se estiverem na lista permitida (https://vinegarhq.org/Sober/Troubleshooting.html). Não é um caminho para "pular" a checagem de versão; não usar.
- Não encontrei nenhuma flag ou canal que faça o erro 280 sumir hoje.

### O que fazer hoje
1. `flatpak update org.vinegarhq.Sober` de tempo em tempo (ou automatizar `flatpak update -y` no início da sessão).
2. Acompanhar a #2567 (pode assinar a issue no GitHub).
3. Enquanto isso, não há atalho legítimo.

**Custo:** grátis. **Cartão:** não. **Automação por script:** sim (Xvfb + xdotool + ffmpeg para print), já que é um cliente nativo. **Risco de ban:** baixo para o cliente em si, mas simular mouse/teclado numa experiência viola regras de automação do Roblox (ver seção 6).

---

## 2. Android em container

### Roblox bloqueia emulador [confirmado, ponto crítico]
- Em **07/08/2025**, o Roblox anunciou que está "restringindo o acesso de jogadores a emuladores" (https://devforum.roblox.com/t/an-update-on-using-third-party-emulators/3867040).
  - Jogadores sem permissão de criador que forem detectados em emulador **são kickados**.
  - O anúncio **não cita Android, Bluestacks ou Waydroid** pelo nome; cita "emulators" de forma geral. O Studio Emulator é exceção.
  - Comentários no fórum dizem que o alvo seria Bluestacks e o emulador do Android Studio. Isso é especulação de usuário.
  - Não encontrei a regra de ban (só kick).
- Consequência: **Redroid, Waydroid, Genymotion e cloud phones (Redfinger, VMOS) estão no mesmo risco de kick**, e alguns vendors anunciam Roblox sem falar dessa política.

### Redroid (docker `redroid/redroid`) [confirmado]
- Imagens Android em Docker, precisam de binder e (em versões antigas) ashmem no host.
- **Problema conhecido:** imagens 10 a 15 não sobem em kernels modernos que expõem binder via `binderfs`. Issue #859, aberta em 26/06/2025, última resposta em 17/09/2025 (ainda aberta): https://github.com/remote-android/redroid-doc/issues/859
  - Sugestão do mantenedor da thread: usar a imagem mais nova (a thread não confirma se resolveu).
  - O módulo de kernel precisa ser compilado com `CONFIG_ANDROID_BINDERFS=y`. Um Codespace comum **não tem esse módulo**: você não controla o kernel da VM.
- Roblox especificamente em Redroid: **não encontrei relato**.
- **Viabilidade no Codespaces: baixa** (kernel fixo + bloqueio de emulador).

### Waydroid [secundário]
- Roda Android num container LXC no host, requer host Linux com kernel com binder e sessão Wayland.
- Guia de 2026 (fonte secundária) recomenda imagem Google Apps para instalar Roblox pela Play Store; diz que funciona melhor em Ubuntu 22.04/24.04 com Wayland e GPU Intel/AMD. Nvidia relata problema de aceleração.
- Relatos de Roblox fechando sozinho ou crashando ao iniciar: https://gitlab.com/TestingPlant/roblox-on-waydroid-guide/-/issues/1 (sem data visível). Thread r/waydroid de março/2025 com problemas parecidos.
- Um fórum de Arch (março/2026) recomenda **Sober** em vez de Waydroid para Roblox no Linux, e diz que a performance com Roblox em container é "hit or miss".
- **Viabilidade no Codespaces: baixa** (precisa de binder e Wayland no host; sem GPU; e cai na política de emulador).

### Android Emulator (AVD) sem KVM [secundário]
- Sem `/dev/kvm`, o emulador cai para emulação por software: cerca de 10× mais lento, boot de vários minutos (wiki de projeto, fonte secundária).
- Modo headless com SwiftShader existe, mas o build "sem KVM" foi descontinuado num canal do CI (2019). Não confirmei o estado em 2026.
- Roblox também é detectado como emulador pela mesma política de agosto de 2025 (o AVD é o caso típico).
- **Viabilidade: muito baixa.**

### Genymotion SaaS / Genymotion Cloud [não verificado]
- Preços encontrados (fontes de mirror de Q&A, não confiáveis): pay-as-you-go ~US$0,05/min/dispositivo; plano ilimitado US$149–186/mês por dispositivo. Preço oficial não confirmado.
- Não encontrei nada sobre Roblox nele. Também cai na política de emulador.
- **Viabilidade: não avaliada; mesmo risco da política.**

### Anbox Cloud (Canonical) [não verificado]
- Plataforma de Android em nuvem, pensada para B2B. Não achei nada sobre Roblox nem preço público. Provavelmente requer contrato.

---

## 3. Windows (Wine/Proton e VM Windows)

### Wine / Proton / Vinegar com cliente Windows [confirmado]
- Em **27/02/2024**, o Vinegar abriu o aviso "Roblox on Linux Deprecation" (https://github.com/vinegarhq/vinegar/issues/397). Fechado em 11/02/2025.
- A causa dita pelos usuários é o **Hyperion (Byfron)** bloqueando Wine. Isso é comentário de usuário, não declaração oficial do Roblox.
- Em 2023, a Roblox disse por um funcionário que o suporte nativo a Linux "não se justifica" pelo custo (https://www.gamingonlinux.com/2023/05/goodbye-to-roblox-on-linux-with-their-new-anti-cheat-and-wine-blocking/).
- O status do Proton no GamingOnLinux é "Broken" (última atualização da página: 02/01/2025): https://www.gamingonlinux.com/anticheat/vendor/hyperion/
- Um guia de 2026 (secundário, LinuxNest) diz que o cliente Windows é bloqueado no Linux e Wine/Grapejuice/Vinegar vão cair; só o Studio funciona via Vinegar.
- Thread "When will Roblox finally get native Linux support?" com data de 11/09/2026 existe no DevForum, mas é só título; sem resposta oficial encontrada.
- **Viabilidade no Linux: nula hoje.**

### VM Windows na nuvem
- **Azure for Students** [secundário, mas Microsoft confirma em parte]: sem cartão, exige e-mail escolar, US$100 de crédito e serviços gratuitos por 12 meses; VMs Windows 10/11 estão disponíveis (FAQ da Microsoft: https://learn.microsoft.com/en-us/azure/education-hub/faq). Não achei o limite de horas de VM em 2026. Verificar na página oficial: https://azure.microsoft.com/en-us/free/students
  - Sem GPU na VM padrão. Roblox pede DirectX 11 com GPU; em software (WARP) pode rodar muito lento. **Não testado.**
- **Cartão de crédito**: conta gratuita comum da Azure exige cartão.
- **Risco de ban**: rodar o cliente Windows oficial sem automação é baixo risco. Automatizar (mouse/teclado por script) viola regras (ver seção 6).

### GitHub Actions `windows-latest` [não recomendado]
- Política de uso do GitHub proíbe "mineração de cripto e uso não autorizado de recursos" (https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies). Jogo não está listado, mas um cliente de jogo interativo rodando em runner é uso fora do propósito de CI.
- Runners têm limite de 6 h por job e sem GPU; sessão interativa de jogo é frágil.
- **Não encontrei regra escrita para gaming.** Preferir não usar; é fácil perder o acesso.

---

## 4. Cloud gaming com Roblox no navegador

### GeForce NOW [não confirmado]
- Página oficial (fetch em 06/11/2026) fala em "4000+ jogos" e não mostra lista com Roblox: https://www.nvidia.com/en-us/geforce-now/games/
- Em 2026, GeForce NOW ganhou app nativo para Linux (anúncio na CES 2026): https://www.tweaktown.com/news/109643/geforce-now-comes-to-linux-amazon-fire-tv-adds-flight-stick-support-and-more-at-ces-2026/index.html
- Não encontrei nenhuma menção a Roblox no GeForce NOW em 2026.
- **Plano grátis**: não verificado nesta pesquisa.
- **Transporte**: usa WebRTC/UDP (padrão do serviço; não confirmei em fonte).
- **Viabilidade: não confirmada.** Verificar na lista oficial de jogos.

### Boosteroid [secundário]
- Um diretório (cloudbase.gg) diz que o Roblox está disponível no Boosteroid, na seção "Install and Play" (não na biblioteca gerenciada). Outra fonte diz que o Roblox é jogável em Boosteroid e Shadow. Um review de Mac relata boa experiência.
- Preço: pago (plano mensal/anual). Não verifiquei o valor de 2026.
- Cartão: necessário para assinar.
- Transporte: streaming próprio do Boosteroid; provavelmente UDP. Não confirmei.
- **Viabilidade: a mais promissora das opções de nuvem para Roblox, mas a listagem de Roblox precisa ser confirmada no site oficial.**

### Xbox Cloud Gaming [contraditório]
- Um guia de julho de 2026 (fonte fraca) diz que o Xbox Cloud Gaming inclui Roblox. Um diretório de cloud gaming diz que não. Não confirmei em fonte oficial.
- Em novembro de 2026 o Game Pass muda o acesso à nuvem para limite mensal de horas (secundário: respawn.outlookindia.com).
- Cartão/conta Microsoft: sim.
- **Viabilidade: não confirmada.**

### now.gg [contraditório]
- Uma fonte (smartupworld, secundário) diz que o Roblox oficial saiu do now.gg em 2025. Outra (Playgama) diz que não saiu e que há só instabilidade.
- Sem fonte oficial de 2026. **Verificar no site.**
- Grátis (com anúncios), não exige cartão, mas o acesso é via navegador e não tem API.

---

## 5. Outras ideias

### Cloud phones com Roblox (Redfinger, VMOS Cloud) [secundário, alto risco]
- Redfinger diz em página de marketing que roda Roblox "como emulador Android nativo" para AFK. Não há API pública documentada para tocar/clicar no Roblox.
- VMOS Cloud: nota 2,8 no Trustpilot (fonte secundária).
- Pelo mesmo motivo do item 2 (política de emulador de agosto de 2025), o Roblox pode kickar.
- **Viabilidade: baixa, risco alto.** Não recomendo.

### Roblox no macOS em hardware Apple (Mac na nuvem) [não verificado]
- O Roblox tem cliente oficial para macOS 10.13+ (requisitos do DevForum/site).
- Mac mini na nuvem (ex.: MacStadium, Scaleway) é uma alternativa legítima, mas tem custo alto (algo na faixa de dezenas a centenas de dólares por mês; **não verificado**) e exige licença/uso compatível com a Apple.
- Automação: `screencapture` e `cliclick`/AppleScript funcionam.
- **Viabilidade: possível, cara; não testada.**

### Chromebook / ARM [não verificado]
- Chromebook com Android (Play Store) roda o app Android oficial, mas é o mesmo caso do emulador (política de agosto de 2025 pode se aplicar a dispositivo "não oficial" — Chromebook é oficial, então a política de emulador não deveria). Não encontrei confirmação.
- Sem nuvem; não serve para servidor.

### Steam Deck / Gamescope [não verificado]
- Roblox não está na Steam; o cliente do Roblox não tem build Linux. Sem caminho novo além de Sober/Wine.

---

## 6. Risco de ban e termos (o que confirmei e o que não)

- **Emulador**: política do Roblox de 07/08/2025 (kick para quem não é criador) [confirmado]: https://devforum.roblox.com/t/an-update-on-using-third-party-emulators/3867040
- **Modificação de cliente**: o Roblox tem post sobre ação automática contra clientes modificados; diz que a regra mira ferramentas que alteram o código do cliente, não as que usam mecanismos oficiais (fonte: busca, não li o texto inteiro).
- **Automação (bots, macros, scripts)**: fontes secundárias dizem que é proibida; não consegui a seção exata dos Termos de Uso ou das Normas da Comunidade. **Não verificado.** Antes de rodar qualquer coisa automatizada numa conta, ler as Normas da Comunidade do Roblox.
- **Conclusão prática**: automatizar mouse/teclado numa experiência pode gerar kick ou ban de conta. Se a ideia é um vídeo de conteúdo, o caminho mais seguro é gravar sessões feitas por humano, ou usar uma experiência feita pelo próprio criador (ele pode dar acesso de teste), em vez de script jogando sozinho.

---

## 7. Ranking das 3 mais viáveis para hoje (06/11/2026)

1. **Sober, esperando a correção da #2567** — grátis, cliente oficial de fato, já instalado, conserta em 1–2 dias quando o mantenedor responde. Risco: a issue ainda não tem resposta de mantenedor; não há previsão oficial.
2. **Boosteroid (ou outro cloud com Roblox confirmado)** — funciona no navegador/cliente deles, sem Linux nativo; precisa de assinatura paga. Risco: confirmar que Roblox está na lista atual; automação por print/teclado é mais difícil no stream.
3. **VM Windows (Azure for Students ou similar) + cliente Windows oficial** — funciona se o servidor tiver render por software suficiente; exige testar. Risco: sem GPU pode ser lento demais; automação viola regras.

Descartados para hoje: Redroid, Waydroid, emuladores Android e cloud phones (política de emulador + kernel do Codespace), GitHub Actions (política de uso e limite de tempo), Wine/Proton (bloqueado pelo Hyperion).

---

## 8. Lacunas (não resolvi)

- Não achei nenhuma issue do Sober em novembro de 2026 além da #2567.
- Não confirmei se o Codespaces permite `privileged` nem expõe `/dev/kvm`/binder (pesquisa genérica só).
- Não confirmei a lista atual de Roblox em GeForce NOW, Boosteroid, Xbox Cloud e now.gg.
- Não confirmei os termos exatos sobre automação do Roblox.
- Não achei relato de Roblox funcionando em Redroid/Waydroid em 2026 sem kick.

## Fontes principais

- https://github.com/vinegarhq/sober/issues/2567 (04/11/2026)
- https://github.com/vinegarhq/sober/issues/2496 (18/09/2026)
- https://github.com/vinegarhq/sober/issues/1971 (07–08/05/2026)
- https://github.com/vinegarhq/sober/issues/2101 (25/05/2026)
- https://github.com/vinegarhq/sober/issues/1165 (07–09/08/2025)
- https://vinegarhq.org/Sober/Troubleshooting.html
- https://devforum.roblox.com/t/an-update-on-using-third-party-emulators/3867040 (07/08/2025)
- https://github.com/remote-android/redroid-doc/issues/859 (26/06/2025, última 17/09/2025)
- https://gitlab.com/TestingPlant/roblox-on-waydroid-guide/-/issues/1
- https://github.com/vinegarhq/vinegar/issues/397 (27/02/2024, fechada 11/02/2025)
- https://www.gamingonlinux.com/anticheat/vendor/hyperion/ (última atualização 02/01/2025)
- https://www.gamingonlinux.com/2023/05/goodbye-to-roblox-on-linux-with-their-new-anti-cheat-and-wine-blocking/
- https://learn.microsoft.com/en-us/azure/education-hub/faq
- https://azure.microsoft.com/en-us/free/students
- https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies
- https://www.nvidia.com/en-us/geforce-now/games/
- https://www.tweaktown.com/news/109643/geforce-now-comes-to-linux-amazon-fire-tv-adds-flight-stick-support-and-more-at-ces-2026/index.html
