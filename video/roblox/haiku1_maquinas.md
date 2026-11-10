# Máquinas Linux x86_64 na nuvem para rodar o Roblox (Sober) controlada por HTTPS

Pesquisa feita em 10/11/2026 (Haiku 5.5). Complementa `video/roblox/opcoes_rodar_roblox.md`, que cobre o lado do cliente (Sober, Android, Windows). Aqui o foco é a máquina.

Requisitos do dono: Linux x86_64, UDP de saída, controle só por HTTPS (API ou um processo que puxa comandos de um git), horas seguidas, gratuito ou quase.

Legenda: **[oficial]** = página oficial lida nesta pesquisa; **[secundário]** = blog, agregador ou fórum; **[não verificado]** = não consegui ler a fonte primária.

---

## Resumo rápido

| Opção | Grátis? | Cartão? | x86_64? | UDP de saída | Controle só por HTTPS | Limite de horas | GPU | Termos proíbem jogo/automação? |
|---|---|---|---|---|---|---|---|---|
| **GitHub Codespaces** (conta Free) | Sim, 120 core-horas/mês | Não para o plano Free [não verificado] | Sim | Saída liberada [oficial]; UDP específico não confirmado | Sim (API REST + `gh`) | ~60 h/mês em máquina de 2 cores; ~30 h em 4 cores | Não | Nada específico sobre jogo; AUP geral proíbe "uso excessivo automatizado" e mineração |
| **Azure for Students** | Sim, US$100 de crédito | Não (exige e-mail escolar) [secundário + FAQ Microsoft] | Sim (VM B-series) | Não confirmado | Sim (`az` CLI, `az vm run-command`) | Limitado pelo crédito (~2 a 3 meses numa VM pequena) | Não | Não li os termos de jogo; AUP proíbe mineração |
| **Kaggle Notebooks** | Sim | Não confirmado; verificação por telefone para internet [não verificado] | Sim | Internet é uma chave ligável [não verificado] | Sim (`kaggle kernels push` pela API) | Sessão de até ~12 h; cota semanal de GPU [não verificado] | Sim (~30 h/semana, não verificado) | **Não consegui ler os termos** |
| **Hugging Face Spaces** (Docker) | Em teoria, CPU básica gratuita | Não para CPU básica [secundário] | Sim | Não confirmado | Sim (API do Hub) | Dorme após 48 h sem visitas [oficial] | Não | Termos gerais; sem cláusula específica encontrada |
| **Oracle Always Free** | Sim | Exigido na criação [secundário] | **Não**: o Micro é x86 mas tem 1 GB de RAM; o A1 (4 cores/24 GB) é ARM | Não confirmado | Sim (API OCI) | Sem limite de horas, mas pode ser recuperada por ociosidade | Não | Página de recursos não proíbe uso; regra de ociosidade é o risco |
| **Google Colab** (grátis) | Sim | Não | Sim | Não confirmado | **Não** (não pode SSH nem desktop remoto no plano grátis) | Até 12 h; ociosidade derruba | Sim, limitada | **Proíbe** controle remoto, SSH, desktop remoto e "contornar a UI do notebook" no plano grátis [oficial] |
| **Google Cloud Shell** | Sim | Não | Sim | Não confirmado | Parcial (não é máquina de longa duração) | 50 h/semana; sessão de 12 h; sem sessão não interativa acima de 40 min [oficial/secundário] | Não | Não li os termos |
| **Lightning AI Studios** | Sim, com créditos | Não confirmado | Sim | Não confirmado | Parcial (SSH disponível) | Créditos; estúdio grátis reinicia a cada 4 h [secundário] | Sim (limitada) | Não li os termos |
| **Gitpod / Ona** | **Não** (plano grátis removido) [secundário, set/2026] | Sim, no plano pago | Sim | Não confirmado | Sim (API) | Pago: Core a partir de US$20/mês | Não | Não li os termos |
| **SageMaker Studio Lab** | Sim | Não | Sim | Não confirmado | Não (sessão de 4 h) | CPU 8 h/24 h; GPU 4 h/24 h [oficial, versão traduzida] | Sim | Não li os termos |
| **Replit** | Plano Starter grátis | Não para Starter | Sim | Não confirmado | Sim (API), mas always-on é pago | Always-on é pago (deployment separado) | Não | Não consegui o texto da AUP de jogos/bots |
| **Hugging Face / Azure / GCP e2-micro** | — | — | GCP e2-micro é x86 mas tem 1 GB de RAM | — | — | — | — | — |
| **Cloud phones (Redfinger, VMOS)** | Pago | Sim | Não (Android) | — | Não | — | — | Ver `opcoes_rodar_roblox.md`: política de emulador do Roblox |

---

## Detalhes por opção

### 1. GitHub Codespaces (conta Free) — melhor candidato técnico
- **Grátis?** Sim. Conta pessoal Free tem 120 hrs de computação e 15 GB-mês de armazenamento por mês; Pro tem 180 hrs e 20 GB-mês. Organizações não têm cota grátis. [oficial: https://docs.github.com/en/billing/managing-billing-for-github-codespaces/about-billing-for-github-codespaces]
- **Atenção à conta:** a cota é medida em núcleos-hora. Numa máquina de 2 núcleos, 120 núcleos-hora dão ~60 h; numa de 4 núcleos, ~30 h. Fontes de terceiros dizem "60 h" sem explicar isso. [secundário: https://agentdeals.dev/vendor/github-codespaces]
- **Cartão?** Não confirmei para o plano Free. Na prática, a conta Free costuma pedir cartão para verificação; **não verificado**.
- **UDP de saída?** A doc diz: "Codespaces are allowed to make outbound connections to the internet." [oficial: https://docs.github.com/en/codespaces/reference/security-in-github-codespaces]. Não achei a lista de portas/protocolos. **Teste necessário** (um `nc -u` ou um cliente STUN dentro do codespace).
- **Controle só por HTTPS?** Sim, em parte. A API REST (`/user/codespaces`, `/start`, `/stop`) cria, liga e desliga [conhecimento da API, não consegui abrir a página]. Para comandos dentro da máquina, não encontrei endpoint oficial de execução; o caminho prático é um script no repositório (`devcontainer.json` com `postStartCommand`) que faz `git pull` em loop e executa o que estiver em um arquivo de comandos. Isso atende "um processo que puxa comandos de um git".
- **Limite de horas?** Ver acima. Sessão ociosa para por padrão (timeout de inatividade configurável); não consegui a página com o valor exato.
- **GPU?** Não.
- **Termos:** a página de termos de Codespaces (github.com/customer-terms) retornou 404 nesta pesquisa. A AUP do GitHub não cita jogos nem Codespaces; proíbe "uso automatizado excessivo" e "mineração de criptomoeda". Um cliente de jogo rodando 24 h com automação de tela não está explicitamente proibido, mas é "uso excessivo automatizado" dependendo da leitura. [oficial: https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies]
- **Risco principal:** consumir a cota em poucos dias se a máquina ficar ligada. Solução: desligar pela API quando não estiver em uso.

### 2. Azure for Students — melhor alternativa de VM "de verdade"
- **Grátis?** Sim, US$100 de crédito e serviços gratuitos por 12 meses, sem cartão, com e-mail escolar. [oficial: https://learn.microsoft.com/en-us/azure/education-hub/faq; limites: https://azure.microsoft.com/en-us/free/students]
- **x86_64?** Sim. VM Linux B-series (ex.: 2 a 4 vCPU, 8 a 16 GB) é x86.
- **UDP de saída?** Não confirmei. Azure não bloqueia UDP de saída em VM por padrão [não verificado].
- **Controle só por HTTPS?** Sim. `az vm start/stop` e `az vm run-command invoke` executam comando na VM pela API do Azure; tudo HTTPS.
- **Horas:** o crédito acaba; uma VM de 4 vCPU consome o crédito em semanas. Desligar a VM (dealocar) para de cobrar computação.
- **GPU:** não (plano padrão).
- **Termos:** não li o texto de jogos. A AUP da Microsoft proíbe mineração; jogo não é citado. [não verificado]

### 3. Kaggle Notebooks — melhor "gratuito com GPU"
- **Grátis?** Sim. [não verificado: a página de termos e de docs do Kaggle voltou só com o título nesta pesquisa]
- **Internet e telefone:** o acesso à internet no notebook é uma chave ligável; na prática exige número de telefone verificado [conhecimento geral, não verificado nesta pesquisa].
- **Controle só por HTTPS:** sim, `kaggle kernels push` envia um script/notebook e o roda em segundo plano (com `enable_gpu` e `enable_internet` no `kernel-metadata.json`). Dentro do script, um loop que faz `git pull` e executa comandos. Ao fim da sessão (~12 h), empurra de novo.
- **Limite:** sessão de cerca de 12 h [conhecimento geral; não confirmei na doc oficial]. Cota de GPU de cerca de 30 h/semana [não verificado].
- **UDP:** não confirmado. Notebooks são containers; saída de internet é liberada quando a chave está ligada.
- **Termos:** **não consegui ler** (`kaggle.com/terms` voltou sem corpo). Gap importante: sem isso, não dá para afirmar se gaming/automação é proibido.
- **Risco:** a rotina de push "de 12 em 12 horas" é mais frágil que uma VM própria; Kaggle pode encerrar o kernel sem aviso.

### 4. Hugging Face Spaces (Docker) — plausível, mas instável em 2026
- **Grátis?** Docs dizem que o hardware cpu-basic (2 vCPU, 16 GB) é gratuito. [oficial: https://huggingface.co/docs/hub/en/spaces-overview]. Relatos de junho a julho de 2026 falam em erro "CPU-basic quota limit" mesmo em conta nova. [secundário]
- **Dorme:** após 48 h sem visitas. Visita reinicia. Dá para manter ativo com um ping, mas é gambiarra. [oficial]
- **Controle por HTTPS:** sim, a API do Hub (`restart`, `pause`) e o próprio processo do container puxando comandos de um git. A conta do Felipe já está autenticada no conector do Hugging Face, então esse caminho é o mais direto para testar.
- **UDP:** não confirmado.
- **Termos:** não encontrei cláusula sobre jogo; a página de termos não tem regra de mineração/bots que eu tenha conseguido ler. [não verificado]

### 5. Oracle Cloud Always Free — descartado para este caso
- **Grátis?** Sim, para sempre, com cartão exigido na criação [secundário].
- **x86_64?** O VM.Standard.E2.1.Micro é AMD (x86), mas tem 1 GB de RAM e 1/8 de OCPU: pequeno demais para Sober + Android. O VM.Standard.A1.Flex (equivalente a 2 OCPU e 12 GB) é **ARM64**, não serve para o requisito x86_64. [oficial: https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm]
- **Recuperação por ociosidade:** a doc diz que a instância é considerada ociosa se, em 7 dias, a CPU (p95), a rede e (no A1) a memória ficarem todas abaixo de 20%. Um Roblox rodando tende a passar, mas é regra que pode mudar. [oficial]
- **Termos:** a página de recursos não lista usos proibidos; a Cloud Service Terms não consegui abrir. Há relatos de conta desativada por "coinmining" (um caso, secundário).
- **Veredito:** só serviria se o requisito x86 fosse flexível.

### 6. Google Colab (grátis) — não serve
- **Grátis?** Sim. Até 12 h por sessão; ociosidade derruba. [oficial: https://research.google.com/colaboratory/faq.html]
- **Termos (oficial, lido nesta pesquisa):** em todos os runtimes são proibidos "mining cryptocurrency", "connecting to remote proxies", "bypassing the notebook UI to interact primarily via a web UI" (só no grátis), e no grátis também **"remote control such as SSH shells, remote desktops"**. Runtimes nessas categorias "can be shut down at any time without notice".
- **Conclusão:** Colab proíbe exatamente o uso que o dono quer (controle remoto + desktop). Descartado.

### 7. Google Cloud Shell — não serve para o caso
- Cota de **50 h por semana**, sessão de **12 h**, e não é máquina de longa duração. [oficial/secundário: https://docs.cloud.google.com/shell/docs/limitations]. Modo efêmero perde os arquivos ao encerrar. Não tem API para ligar e comandar a máquina de forma persistente.

### 8. Lightning AI Studios — talvez, com pouca certeza
- Estúdio gratuito com SSH e CLI; um estúdio grátis reinicia a cada 4 h (fonte secundária). Os créditos mudaram em setembro de 2026: de 15 créditos mensais para uma concessão única de até 30 créditos que expira em 12 meses (secundário, dois sites divergem). Não li os termos. [secundário]
- Vale testar só se o Codespaces e o Azure não servirem.

### 9. Gitpod / Ona — deixou de ser grátis
- Fontes de setembro de 2026 dizem que o plano grátis foi removido; o Core começa em US$20/mês. [secundário: https://www.costbench.com/software/ai-code-execution/gitpod/hidden-costs/]. Não é a opção certa para "gratuito ou quase".

### 10. SageMaker Studio Lab — não serve
- Sessões de 4 h; CPU até 8 h por 24 h e GPU até 4 h por 24 h. [oficial traduzido: https://docs.aws.amazon.com/sagemaker/latest/dg/studio-lab-overview.html]. Não é sempre ligada.

### 11. Replit — não confirmado
- Plano Starter grátis; Core cerca de US$25/mês (fontes divergem). Always-on é deployment pago. A AUP com "cryptocurrency mining" existe, mas não consegui o texto. [secundário]

### 12. Descartados sem pesquisa profunda
- **GCP e2-micro (Always Free):** x86 mas 1 GB de RAM; mesmo problema da Oracle Micro.
- **Cloud phones (Redfinger, VMOS):** Android, política de emulador do Roblox (ver `opcoes_rodar_roblox.md`).
- **GitHub Actions:** limite de 6 h por job; não é máquina de longa duração. (Já listado como não recomendado.)

---

## Top 3

1. **GitHub Codespaces (conta Free, máquina de 2 núcleos)**
   - Por quê: x86_64, outbound liberado, API REST para ligar/desligar, comandos via git. Cerca de 60 h/mês grátis.
   - Falta testar: UDP de saída de verdade (teste com um servidor UDP externo), se o plano Free pede cartão, e se o Sober roda numa máquina de 2 núcleos.
   - Mitigação: desligar pela API fora do horário.

2. **Azure for Students (VM Linux x86 pequena, sem cartão)**
   - Por quê: VM de verdade, x86, UDP de saída provavelmente livre, `az vm run-command` executa comandos pela API HTTPS. Crédito de US$100 dá algumas semanas a alguns meses.
   - Falta testar: UDP, se a conta de estudante do Felipe é elegível, e a regra de jogo na AUP.

3. **Kaggle Notebooks (push pela API, GPU opcional)**
   - Por quê: grátis, GPU, sessões de cerca de 12 h repetidas por `kaggle kernels push`.
   - Falta: ler os termos (não consegui). Sem isso, o risco de encerramento por uso não permitido é alto. Também pede verificação por telefone para internet.

Descartados para esse caso: Colab (proíbe SSH e desktop remoto), Oracle Always Free (ARM ou pequena demais), Cloud Shell (50 h/semana e sem persistência), SageMaker Studio Lab (4 h), Ona (sem plano grátis).

---

## Aviso importante: o risco maior está no Roblox, não na máquina

Nenhuma máquina resolve o problema de termos do Roblox. O `opcoes_rodar_roblox.md` já registra que:
- Automação de mouse/teclado numa experiência de outra pessoa é tratada como "bot" pelos Termos de Uso (não consegui o trecho exato).
- A política de emulador do Roblox (07/08/2025) é um kick para quem não é criador; cloud phones e Android em container entram nisso.
- IP de datacenter (Codespaces, Azure, Kaggle) pode ser marcado pelo anticheat; isso não foi testado.

A alternativa já registrada no projeto (experiência própria no Roblox Studio, em `PLANO_INTEGRACAO.md`) não depende de nenhuma das máquinas acima e não tem esse risco.

---

## Lacunas (não resolvi nesta pesquisa)

- Termos de Kaggle, GitHub Codespaces (customer-terms deu 404), Oracle Cloud Service Terms, Hugging Face (não há cláusula de jogo encontrada), Replit AUP e Lightning: não li o texto de jogo/automação.
- UDP de saída: nenhuma das plataformas documentou. Precisa de teste real em cada uma antes de escolher.
- Cartão do Codespaces Free e cota exata de horas por tipo de máquina: não confirmados na doc.
- Limite de sessão do Kaggle (12 h) e cota de GPU (30 h/semana): só de conhecimento geral.
- Preços de Lightning e Replit divergem entre fontes.

## Fontes principais (lidas nesta pesquisa)

- https://docs.github.com/en/billing/managing-billing-for-github-codespaces/about-billing-for-github-codespaces
- https://docs.github.com/en/codespaces/reference/security-in-github-codespaces
- https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies
- https://research.google.com/colaboratory/faq.html
- https://docs.oracle.com/en-us/iaas/Content/FreeTier/resourceref.htm
- https://learn.microsoft.com/en-us/azure/education-hub/faq
- https://azure.microsoft.com/en-us/free/students
- https://huggingface.co/docs/hub/en/spaces-overview
- https://docs.cloud.google.com/shell/docs/limitations
- https://docs.aws.amazon.com/sagemaker/latest/dg/studio-lab-overview.html (versão traduzida)
- https://www.costbench.com/software/ai-code-execution/gitpod/hidden-costs/ (secundário)
- https://agentdeals.dev/vendor/github-codespaces (secundário)
- https://www.kaggle.com/terms e https://www.kaggle.com/docs/notebooks (sem corpo; não usadas como fonte de fato)
