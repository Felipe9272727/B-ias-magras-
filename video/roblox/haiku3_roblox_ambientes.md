# Rodar Roblox (Sober / Cordial) fora do Linux local: Colab, Kaggle, Codespaces, Docker e servidores headless

Pesquisa feita em 2026-11-10. Datas de publicação só aparecem quando a página mostra; quando não aparecem, está indicado.

## Resumo rápido

- **Não encontrei nenhum relato confiável de cliente Roblox rodando em Colab, Kaggle ou Codespaces.** Os resultados da busca são de desenvolvimento (Rojo em Codespaces) ou de serviços pagos de streaming.
- **Colab (plano gratuito) proíbe explicitamente "controle remoto como shells SSH e desktops remotos"** nas restrições adicionais. Um setup Xvfb + VNC/noVNC nesse ambiente é arriscado.
- **Colab também proíbe "conectar a proxies remotos" e "mineração de criptomoedas"**. Nada sobre UDP aparece nos termos consultados.
- **Kaggle:** a página de termos veio vazia na consulta (só o título). Um fórum diz que a internet de notebooks pode ser desligada e exige verificação por telefone. Não achei nada sobre UDP.
- **GitHub Codespaces:** a política geral de uso proíbe mineração de criptomoedas. Não achei cláusula específica do Codespaces.
- **Cordial não roda o cliente desktop do Roblox.** Segundo o próprio README, ele roda o **build Android oficial** (`libroblox.so`) com um linker AOSP portado, sem Wine. Também baixa o APK de um site de terceiros (APKPure) na configuração inicial. Isso é um risco a considerar.
- **Versão do Cordial:** o README consultado menciona a versão **0.19.0** (e AUR atualizado até 0.17.0). Você citou 0.34.0. Vale conferir na página de releases antes de tomar decisões com base nela.
- **Erro 279 (ID 17):** as fontes gerais dizem que é "porta inacessível" no UDP das faixas altas de portas. Nada específico sobre Linux ou Sober foi encontrado.
- **Gravação:** `ffmpeg -f x11grab` no display do Xvfb é o caminho mais simples. wf-recorder depende de um compositor wlroots com screencopy; funcionar dentro do sway aninhado é plausível, mas não confirmei.
- **Requisitos de CPU/RAM e FPS do Roblox com lavapipe:** não encontrei fonte confiável. Os dados de llvmpipe/lavapipe que achei sugerem FPS muito baixo em cena pesada. Precisa medir.

## 1. Relatos de Sober e Cordial (e Roblox em geral) em ambientes de nuvem ou headless

### Sober (vinegarhq)
- **Distribuição oficial é Flatpak (Flathub).** A página oficial (sober.vinegarhq.org) cita `flatpak install flathub org.vinegarhq.Sober` e não menciona AppImage. Ela também diz que o Sober é experimental, de código fechado, não afiliado à Roblox e pode ser descontinuado. Fonte: https://sober.vinegarhq.org
- **bubblewrap-suid impede o lançamento.** O Arch Wiki diz que ter `bubblewrap-suid` instalado faz o Sober não abrir; a solução é trocar pelo `bubblewrap` comum. Fonte: https://wiki.archlinux.org/title/Sober
- **Travamento na inicialização com NVIDIA.** Relato no GitHub (issues vinegarhq/sober, p. ex. #1794, #2206, #2265, #1519, #1489, #542): o app trava ao inicializar a janela no Linux Mint com GPU NVIDIA, mesmo desativando componentes do sandbox do Flatpak e testando renderizadores diferentes.
- **Precisa de "legacy rendering".** Alguns usuários só conseguiram abrir com renderização legada ativada.
- **GPU híbrida:** a página de troubleshooting oficial cita o erro `vkGetPhysicalDeviceSurfacePresentModesKHR failed` em hardware híbrido, com um workaround de desktop entry. Fonte: https://vinegarhq.org/Sober/Troubleshooting.html
- **Conflito com libcurl do host** em distribuições Arch: erro "no version information available (required by sober)". Relato do fórum CachyOS: https://discuss.cachyos.org/t/trouble-with-sober/16687
- **Logs:** a documentação recomenda rodar `flatpak run org.vinegarhq.Sober` no terminal para coletar logs.
- **Requisitos mínimos:** a página não lista GPU nem versões de Vulkan/OpenGL/GLES. Não achei nada sobre áudio nem sandbox além do que está acima.

### Cordial (luohoa97)
- **Não é o cliente desktop.** O README diz que roda o "build Android oficial de Roblox nativamente em Linux", sem Wine nem emulador. Sober é citado como fonte opcional do build (o Cordial pode copiar o build do Sober na instalação, mas não acompanha as atualizações dele). Fonte: https://github.com/luohoa97/cordial
- **Requisitos:** x86-64 ou aarch64. Wayland é o backend principal e X11 é suportado. Recomenda o Flatpak (que empacota as bibliotecas testadas). Build a partir do código exige Clang, GTK4 (4.12+) e libadwaita (1.5+). PipeWire é opcional (relevante para áudio).
- **AppImage:** a página diz que é "mais nova e menos testada que o Flatpak". Foi testada só em Fedora, e a correção de web-view foi testada em um substituto, não em máquina real.
- **Download do APK:** o primeiro uso tem um botão "Download Roblox" que baixa do APKPure e verifica assinatura da Roblox. Isso deve ser avaliado do ponto de vista de segurança e de termos.
- **Sandbox/FUSE:** a página não menciona nenhum dos dois.

### Roblox em VM, VPS e nuvem
- Um post do DevForum afirma que o Roblox não roda dentro de máquinas virtuais. Não consegui confirmar em fonte oficial. Fonte (secundária, não verificada): https://devforum.roblox.com/t/running-roblox-in-a-vps/3029593
- Os guias de VPS encontrados falam de Windows Server e de serviços de streaming de terceiros. Não há relatos de Roblox rodando em Colab, Kaggle ou Codespaces.

### Erro 279 (ID 17, "porta inacessível")
- As fontes gerais dizem que o erro vem de filtragem de UDP nas portas altas (aprox. 49152–65535) por firewall, roteador ou ISP. Um post no DevForum rastreou o tráfego no Wireshark e viu relays que não aceitavam UDP na porta atribuída. Fonte: https://devforum.roblox.com/t/frequent-error-code-279-id17-port-unreachable/3785415
- Não há fonte específica para Linux, Sober ou Cordial. A checagem sensata é: firewall do host (ufw/nftables) permitir UDP de saída nessa faixa; e o sandbox do Flatpak ter a permissão de rede (`--share=network`) (inferência minha, não confirmada).

## 2. Colab e Kaggle: UDP e termos

### Google Colab
- **FAQ (sem data na página)**, "prohibited uses" para todos os runtimes. Colab proíbe:
  - hospedagem de arquivos, mídia ou outros serviços web sem relação com computação interativa;
  - torrents ou P2P;
  - **"connecting to remote proxies"**;
  - **"mining cryptocurrency"**;
  - ataques de negação de serviço;
  - quebra de senhas.
- **Restrições adicionais (plano gratuito ou sem saldo de compute units)**, com encerramento "a qualquer momento, sem aviso":
  - **"remote control such as SSH shells, remote desktops"**;
  - "chess training";
  - "running distributed computing workers".
- **GPU:** "Colab resources are not guaranteed and not unlimited"; no gratuito, acesso a GPUs caras é "heavily restricted".
- **Sessão:** gratuito até 12 h, dependendo da disponibilidade; Pro+ até 24 h com saldo suficiente. Idle derruba o runtime.
- Fonte: https://research.google.com/colaboratory/faq.html
- **Termos (Additional Terms of Service, "Last Modified: May 14, 2024")**: não há seção de "prohibited uses" com esse conteúdo. Há apenas proibições de compartilhar conta e de dar acesso a terceiros. Fonte: https://research.google.com/colaboratory/tos_v5.html
- **UDP:** nenhuma das páginas consultadas fala de UDP ou de restrição de tráfego. **Não posso afirmar se UDP de saída é permitido no Colab.** A resposta depende de teste direto (ex.: enviar UDP para um servidor externo de eco e checar).
- **Conclusão para o seu caso:** Colab gratuito é risco alto para Xvfb + VNC/desktop remoto. Colab Pro pode ser testado, mas a regra de "desktop remoto" está escrita sem distinção de plano na lista principal de restrições adicionais.

### Kaggle
- A página de termos (https://www.kaggle.com/terms) veio sem conteúdo na consulta. Não consegui citar cláusulas.
- Fórum (fast.ai, data não exibida): usuários relatam que a internet dos notebooks estava desligada e que é preciso verificação por telefone para ativar internet; erros "Temporary failure in name resolution" em pip. Fonte: https://forums.fast.ai/t/help-using-colab/96280/2 (é relato, não política oficial).
- **UDP e política de jogos:** não encontrei informação. Verificar nos termos e na documentação de Notebooks.

### GitHub Codespaces
- **Cripto:** a política geral (GitHub Acceptable Use Policies) proíbe uso dos servidores do GitHub para mineração de criptomoedas, na seção de atividade automatizada em massa. Não achei cláusula específica do Codespaces. Fonte: https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies
- **Idle e retenção (docs do GitHub):** timeout padrão de 30 min de inatividade; codespaces paradas são mantidas por 30 dias por padrão.
- **Quota:** plano pessoal tem quota mensal; organizações não têm. Os números exatos não apareceram na busca.
- **Limite de máquina:** uma documentação antiga fala em 2 a 32 cores. A afirmação de 64 GB RAM e de GPU não foi confirmada. Um comparativo de 2026 citava até 96 vCPUs, mas se referia ao Google Cloud, não ao Codespaces.
- **Conclusão:** não encontrei nenhuma regra de Codespaces que proíba rodar um cliente de jogo. O problema prático são a falta de GPU (não confirmada), o idle de 30 min e a dúvida sobre UDP. Precisa de teste.

## 3. Gravação de tela de Xvfb / Wayland headless

### ffmpeg x11grab (no Xvfb)
Opções confirmadas na documentação oficial (https://ffmpeg.org/ffmpeg-devices.html):
- `video_size`: tamanho do quadro (padrão: tela inteira).
- `framerate`: padrão NTSC 30000/1001. Para fixar 30 fps, usar `-framerate 30`.
- `draw_mouse`: 0 para não desenhar o cursor.
- `show_region`, `follow_mouse`: opcionais.
- Sintaxe de entrada: `[host]:display.screen[+x,y]`, por exemplo `:99.0`.

Exemplo de comando (sintaxe padrão do ffmpeg; não copiado da página):

```
ffmpeg -f x11grab -video_size 1280x720 -framerate 30 -draw_mouse 0 -i :99.0 \
  -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p saida.mp4
```

- A documentação não diz se `use_shm` ajuda desempenho, nem confirma o uso com Xvfb (o uso com Xvfb é o padrão do x11grab, mas não foi confirmado nessa página).
- Para pouca CPU: usar `-preset veryfast` ou `ultrafast`, CRF 20–23, e taxa 30 fps. Com Xvfb não há encoder de GPU, então o encode é em CPU.
- Lembrar que o sway aninhado roda sobre o Xvfb: o x11grab captura o sway inteiro, o que é o que você quer.

### wf-recorder (Wayland)
- Requisitos (https://github.com/ammen99/wf-recorder): compositor wlroots com `wlr-screencopy-v1` e `xdg-output`. Dependências: ffmpeg, wayland-client, wayland-protocols.
- Opções confirmadas na página: `-f` (arquivo de saída), `-o` (saída), `-g` (região, com slurp), `-a` / `--audio` (áudio), `-C` (codec de áudio), `-c` (codec de vídeo, padrão libx264), `-p` (parâmetros do codec), `-d` + `-c h264_vaapi` (encode por VAAPI, com `-x yuv420p` se preciso).
- **Não aparece na página** a opção de framerate `-r`. Conferir com `wf-recorder --help` antes de usar.
- **Sway aninhado:** a página não menciona sway. Como o sway é wlroots e implementa screencopy, deve funcionar, mas **não confirmei**. Testar.
- **Quando faz sentido:** se você quiser encode VAAPI com GPU real (`/dev/dri`) e captar só o compositor. Dentro do Xvfb sem GPU, x11grab é mais simples.

### Áudio
- Não encontrei fonte específica para áudio do Roblox em Xvfb/headless. O Cordial menciona PipeWire como opcional. Para gravar áudio do sistema, o caminho típico é `pulseaudio` ou `pipewire-pulse` com um monitor de dispositivo, e captar com `-f pulse` no ffmpeg (padrão, não confirmado nas páginas consultadas).

## 4. Requisitos de CPU/RAM e FPS com lavapipe/llvmpipe

- **Requisitos oficiais do Roblox:** não consegui ler a página oficial (en.help.roblox.com/hc/articles/203312800 retornou HTTP 403). O único dado confirmado em snippet é Windows 10/11 64 bits e 4–8 Mb/s de internet. Não há fonte confiável para CPU, RAM ou API gráfica exigida.
- **Lavapipe e llvmpipe:** são drivers Vulkan/OpenGL em CPU.
  - Mesa (lista mesa-dev, jan/2025): cena de ~300k triângulos em um i7-11800H (8 núcleos) rodou a aprox. **5 fps**. Lavapipe e llvmpipe foram otimizados para compositor de desktop, não para cenas 3D pesadas. Fonte: https://lists.freedesktop.org/archives/mesa-dev/2025-January/226452.html
  - Ganho com núcleos: o modo GL normal do llvmpipe escala com núcleos; partes do pipeline ficam em uma thread. Um post de fórum diz que o escalonamento para ao atingir certo número de núcleos (não verificado).
  - HotHardware (2024): lavapipe existe como fallback; muitos aplicativos, incluindo jogos, se recusam a rodar no fallback de CPU por desempenho. Fonte: https://hothardware.com/news/mesa-lavapipe-cpu-raytracing
- **Estimativa para você:** não há dado publicado de FPS do Roblox com lavapipe. Com base nos números acima, espere **FPS muito baixo** (provavelmente abaixo de 10 em cena normal). Medir com `vkcube` (forçando o ICD do lavapipe) ou com o contador de FPS do próprio Roblox (não testado).
- **Recomendação de medição:** rodar `vkcube --c 300` (ou equivalente) com `VK_ICD_FILENAMES` apontando para lavapipe, e registrar FPS em 720p e 540p. Usar mais de 4 núcleos e pelo menos 8 GB de RAM livres, já que o modelo de cena do Roblox e do Sober ocupa memória. Esses números são chute até medir.

## Recomendações

1. **Colab gratuito:** não usar para este setup (desktop remoto e possível proxy/UDP proibidos). Testar Colab Pro só depois de checar a regra atual de desktop remoto.
2. **Kaggle:** não recomendo sem confirmar os termos e o acesso à rede. Não há relato positivo.
3. **Codespaces:** pode servir para testar UDP e ffmpeg, mas o idle de 30 min e o FPS de software vão atrapalhar. Não recomendo para jogo de longa duração.
4. **Melhor caminho com UDP e GPU:** uma VM com GPU real (NVIDIA ou AMD) e UDP de saída liberado, com driver Vulkan do fabricante, em vez de lavapipe. Antes de contratar, testar UDP com um servidor de eco externo e checar `vulkaninfo`.
5. **Sober vs Cordial:** Sober é o caminho desktop oficial (Flatpak). Cordial é outra arquitetura (Android nativo) e baixa APK de terceiros. Em ambiente com GPU real, testar o Sober primeiro.
6. **Conferir a versão do Cordial** (README cita 0.19.0; você tem 0.34.0).

## Lacunas (o que não consegui confirmar)

- UDP de saída no Colab e no Kaggle: não encontrado.
- Cláusula específica de jogos ou UDP no Kaggle: página de termos não carregou.
- Limites de RAM, CPU e GPU do Codespaces: só dados antigos ou não confirmados.
- Requisitos oficiais do Roblox: página bloqueada (403).
- wf-recorder em sway aninhado e opção `-r`: não confirmado na página.
- FPS real do Roblox com lavapipe: sem fonte.

## Fontes

- Sober (site oficial): https://sober.vinegarhq.org
- Sober (troubleshooting): https://vinegarhq.org/Sober/Troubleshooting.html
- Sober (Arch Wiki): https://wiki.archlinux.org/title/Sober
- Sober (repositório): https://github.com/vinegarhq/sober
- Sober issues: https://github.com/vinegarhq/sober/issues/1794 , /2265 , /1519 , /1489 , /542
- CachyOS (fórum): https://discuss.cachyos.org/t/trouble-with-sober/16687
- Cordial: https://github.com/luohoa97/cordial
- Erro 279 (DevForum): https://devforum.roblox.com/t/frequent-error-code-279-id17-port-unreachable/3785415
- Roblox em VPS (DevForum, não verificado): https://devforum.roblox.com/t/running-roblox-in-a-vps/3029593
- Colab FAQ (sem data): https://research.google.com/colaboratory/faq.html
- Colab Additional Terms (última modificação 2024-05-14): https://research.google.com/colaboratory/tos_v5.html
- Kaggle Terms (página sem conteúdo na consulta): https://www.kaggle.com/terms
- Kaggle/Colab relato (fast.ai): https://forums.fast.ai/t/help-using-colab/96280/2
- GitHub Acceptable Use Policies: https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies
- ffmpeg devices (x11grab): https://ffmpeg.org/ffmpeg-devices.html
- wf-recorder: https://github.com/ammen99/wf-recorder
- Mesa lavapipe (lista mesa-dev, jan/2025): https://lists.freedesktop.org/archives/mesa-dev/2025-January/226452.html
- HotHardware (lavapipe): https://hothardware.com/news/mesa-lavapipe-cpu-raytracing
- Roblox help (bloqueada, 403): https://en.help.roblox.com/hc/articles/203312800
