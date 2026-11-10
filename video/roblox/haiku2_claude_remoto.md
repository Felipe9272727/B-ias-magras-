# Claude Code: como uma sessão na nuvem controla outra máquina

Pesquisa feita em 2026-11-10 com base na documentação oficial (code.claude.com) e em buscas na web. Todas as afirmações sobre planos e requisitos vêm das páginas citadas. Onde há inferência, está marcada como tal.

## Resumo rápido

- **Remote Control** (`claude remote-control`, `claude --remote-control`, `/remote-control`) é o mecanismo oficial para um computador "servir" uma sessão local que aparece em claude.ai/code. Funciona em Linux, mas exige um terminal interativo (TTY) e login claude.ai. Não precisa do app desktop: o CLI basta.
- **Ambientes self-hosted** (runners próprios) fazem a sessão na nuvem rodar inteira dentro da sua máquina. Só existem para planos **Team e Enterprise** (beta público, desligado por padrão). Pro e Max não têm acesso.
- **Login headless** do CLI é possível pelo fluxo de URL + código colado no terminal. Porém, `claude setup-token` (token de um ano) **não** serve para Remote Control.
- Não encontrei, na documentação oficial, outra forma de a sessão na nuvem executar comandos numa máquina arbitrária do usuário (ex.: SSH direto).

---

## 1. Remote Control

### O que é
Remote Control conecta claude.ai/code ou o app Claude (iOS/Android) a uma sessão do Claude Code rodando na sua máquina. Segundo a documentação: "Remote Control sessions run directly on your machine and interact with your local filesystem. The web and mobile interfaces are a window into that local session, so your computer has to stay on and the `claude` process has to keep running."
- Fonte: https://code.claude.com/docs/en/remote-control

Diferente das sessões na nuvem (que rodam na infraestrutura da Anthropic), aqui o código, o sistema de arquivos e as ferramentas ficam na sua máquina, e o modelo continua sendo chamado pela API a partir dela.

### Como o computador "serve uma pasta"
- `claude remote-control` (modo servidor): o processo fica no terminal esperando conexões remotas e mostra uma URL (e um QR code, com a barra de espaço). Cada sessão criada usa uma pasta de trabalho.
  - Opções úteis: `--name "Meu Projeto"`, `--spawn same-dir|worktree|session`, `--capacity N` (padrão 32), `--continue`, `--session-id <id>`.
  - Ao rodar pela primeira vez, pede `Enable Remote Control? (y/n)`.
  - Se a pasta ainda não é confiável, pede `Trust <diretório>? [y/N]`.
- `claude --remote-control` ou `/remote-control` (dentro de uma sessão interativa): a mesma sessão fica acessível pelo navegador ou celular, e você ainda digita localmente.
- App Claude Desktop: `/remote-control` na aba Code. O VS Code também tem o comando.
- Fonte: https://code.claude.com/docs/en/remote-control

### Requisitos (da página oficial)
- **Plano**: Pro, Max, Ultra, Team ou Enterprise. **API keys não são suportadas.** Em Team e Enterprise, um Owner precisa ligar o toggle Remote Control em https://claude.ai/admin-settings/claude-code.
- **Autenticação**: `claude` e depois `/login` com conta claude.ai. Sem login elegível, `claude remote-control` sai com erro.
- **Workspace trust**: "When its standard input or output isn't a terminal, the command can't ask and exits with a `Workspace not trusted` error."
- Não é preciso usar o app desktop.

### Linux sem tela (headless), tipo Codespace
A documentação oficial **não cita** explicitamente servidores headless. O que ela deixa claro:
- O comando é um processo de terminal que precisa de TTY para fazer as perguntas iniciais (confirmação e trust). Sem TTY, falha.
- Por isso, na prática, roda-se dentro de `tmux` ou `screen` (um TTY virtual que sobrevive ao SSH). Há relatos de usuários fazendo isso em VM Linux via SSH + tmux (issue pública no repositório; não é documentação oficial). Também há issue pedindo um `--headless`/daemon; não confirmei se já existe. Confira com `claude remote-control --help`.
- A máquina precisa ficar ligada e o processo precisa continuar rodando. Um Codespace que hiberna para o processo.
- Fontes: https://code.claude.com/docs/en/remote-control (seção de workspace trust e confirmação); relatos em https://claudeissues.com/issue/29479-docs-remote-control-confirmed-working-on-headless-linux-vm-via-ssh-tmux e https://claudeissues.com/issue/30447-feature-request-claude-remote-control-headless-daemonizable-remote-control-witho (pedido de daemon)

### Como a pasta aparece para a sessão na nuvem
A documentação de Remote Control diz que a sessão aparece na lista em claude.ai/code. As ferramentas `list_computer_folders` e `request_computer_folder` desta sessão não estão descritas nas páginas públicas que consultei; a documentação interna da sessão diz que elas usam pastas servidas pelo Remote Control do computador do usuário, escolhidas no app desktop (Settings > Claude Code > Remote Control). Isso é coerente com o item acima, mas a parte específica de "anexar a sessão na nuvem a uma pasta" não aparece nas páginas públicas.

---

## 2. Instalar e logar o CLI num Linux sem navegador

### Instalação (oficial)
```bash
curl -fsSL https://claude.ai/install.sh | bash
claude --version
claude doctor
```
- Requisitos: Ubuntu 20.04+, Debian 10+, Alpine 3.19+; 4 GB RAM; internet.
- Alternativas: `npm install -g @anthropic-ai/claude-code` (Node.js 22+, não usar sudo); pacotes apt/dnf/apk oficiais (`sudo apt install claude-code` após adicionar o repositório).
- Fonte: https://code.claude.com/docs/en/setup

### Login sem navegador
A página de autenticação diz: ao rodar `claude` pela primeira vez, ele abre o navegador. "If the browser doesn't open automatically, press `c` to copy the login URL to your clipboard, then paste it into your browser." E: "If your browser shows a login code instead of redirecting back after you sign in, paste it into the terminal at the `Paste code here if prompted` prompt." Quando termina: "Login successful".

Ou seja, o fluxo é:
1. Rode `claude` (ou `claude auth login`) na máquina remota.
2. Copie a URL que aparece no terminal e abra em qualquer navegador (no seu PC, por exemplo).
3. Faça login no claude.ai.
4. Se o navegador mostrar um código, cole no terminal da máquina remota.

Isso é um fluxo de URL + código colado, então não exige navegador na máquina. **Inferência minha**: funciona bem em Codespace/SSH, porque nada depende do navegador local da máquina remota. A documentação não diz "headless" com essas palavras.
- Fonte: https://code.claude.com/docs/en/authentication (seção "Log in to Claude Code") e https://code.claude.com/docs/en/cli-reference (comando `claude auth login`)

### Atenção: `setup-token` não serve para Remote Control
- `claude setup-token` gera um token de um ano (`CLAUDE_CODE_OAUTH_TOKEN`) para CI e scripts. A documentação diz: "It can only make model requests, so it can't establish Remote Control sessions or fetch claude.ai connectors."
- Então, para Remote Control, use o login completo (`claude auth login` / `/login`), não o token.
- Também: Remote Control não funciona com `ANTHROPIC_API_KEY`.
- Fonte: https://code.claude.com/docs/en/authentication (seção "Generate a long-lived token")

### Renovação
A sessão de login expira. Remote Control "that outlives the login stops making progress once the credential expires". Use `/login` para renovar (aviso aparece três dias antes).

---

## 3. Ambientes self-hosted do Claude Code na nuvem (ccpool_ / runners)

### O que é
Ambiente self-hosted executa sessões de nuvem "em infraestrutura que sua organização opera". Componentes:
- **Environment**: grupo de runners, criado no painel admin (claude.ai/admin-settings/cloud-environments). Na API aparece como `pool`, com id `pool_id`; o prefixo `ccpool_` aparece no ID.
- **Runner**: processo que você roda na sua máquina. Ele faz polling por HTTPS de saída (sem entrada), pega a sessão, clona o repositório e roda o processo `claude` filho.
- **Session**: uma tarefa.

Fluxo: o usuário escolhe o ambiente no seletor ao iniciar a sessão; o runner pega a sessão e roda o Claude Code na sua máquina, com a internet dela. "Anthropic never connects into your network."
- Fontes: https://code.claude.com/docs/en/self-hosted-environments e https://code.claude.com/docs/en/self-hosted-environments-quickstart

### Disponibilidade (importante para você)
- "Self-hosted environments are in public beta on **Team and Enterprise** plans and are off by default."
- Um Owner liga **Allow self-hosted environments** no painel Cloud environments; exige que sessões de nuvem já estejam ligadas na organização.
- Pro, Max e Ultra **não** aparecem como elegíveis. A própria página diz: "To run Claude Code on your own always-on machine and drive it from other devices, use Remote Control, which is also available on Pro, Max, and Ultra plans."
- Não encontrei uma opção de ambiente self-hosted para uso individual. Se você tem plano individual, o caminho oficial é Remote Control.

### Requisitos e passos (resumo da quickstart)
1. Um Owner da organização liga o recurso no painel.
2. Criar o ambiente no painel e copiar a **environment key** (mostrada uma vez).
3. Instalar o Claude Code no host e subir um runner com essa chave. A quickstart tem os comandos exatos; leia a página em https://code.claude.com/docs/en/self-hosted-environments-quickstart antes de rodar, porque os nomes de flags mudam.
4. Configurar acesso ao git (o runner clona com credenciais que você fornece; GitHub ou GitHub Enterprise Server).
5. Egress liberado para `api.anthropic.com` e os hosts listados em "Network requirements" (https://code.claude.com/docs/en/self-hosted-environments-deploy).
6. Escolher o ambiente ao iniciar a sessão em claude.ai/code ou com `claude --cloud --environment ...` (ver https://code.claude.com/docs/en/self-hosted-environments-testing).

Limites relevantes: a sessão roda com o Claude Code no seu host, mas **a inferência continua indo para api.anthropic.com por padrão**. Ferramentas e arquivos ficam na sua máquina. Não há network secrets nem configuração de ambiente da nuvem nesse modo.

### Nota sobre versão
Um artigo de terceiros cita um comando `claude self-hosted-runner` e uma versão específica do CLI. Não consegui confirmar isso na documentação oficial; confira com `claude --help` antes de usar.

---

## 4. Outras formas oficiais de uma sessão na nuvem agir numa máquina sua

| Forma | Sentido | Planos | Serve para o seu caso? |
| --- | --- | --- | --- |
| **Remote Control** (`claude remote-control`) | Máquina sua serve sessão; a sessão na nuvem ou o celular conecta nela | Pro, Max, Ultra, Team, Enterprise | Sim, é o caminho individual. Precisa de TTY (tmux) e de login claude.ai |
| **Self-hosted environments** | Sessão na nuvem roda inteira na sua máquina (runner) | Team e Enterprise (beta, Owner liga) | Sim, se a organização tiver Team/Enterprise. A sessão usa a internet da máquina |
| **`claude --cloud` / `--teleport`** | Terminal -> nuvem e nuvem -> terminal | Pro, Max, Ultra, Team, Enterprise | Não. É o sentido contrário e não executa na sua máquina |
| **Chrome / navegador local** | Claude controla seu navegador | varia | Só para navegador, não para shell |

Fontes: https://code.claude.com/docs/en/claude-code-on-the-web (seções "Move tasks between terminal and cloud" e "Limitations"), https://code.claude.com/docs/en/remote-control

**Não encontrei** na documentação oficial uma forma de a sessão na nuvem abrir SSH direto numa VM ou Codespace de terceiros. Com ambientes cloud padrão, a sessão roda na infraestrutura da Anthropic, com setup script e lista de domínios permitidos, mas não é a sua máquina. Se a sua máquina precisa de internet "normal", o caminho é Remote Control ou self-hosted.

---

## Recomendação prática para o seu caso (Codespace ou VM barata)

1. Se a conta for **Pro/Max/Ultra**: instale o CLI na máquina (passo 2), faça `claude auth login` pelo fluxo de URL, entre em `tmux new -s rc`, rode `claude remote-control --name "maquina"` na pasta do projeto, responda os dois prompts (aceitar Remote Control e confiar na pasta), e deixe o processo rodando. Depois conecte pela sessão em claude.ai/code.
2. Se a conta for **Team/Enterprise** e a organização aceitar: peça a um Owner para ligar ambientes self-hosted e suba um runner nessa máquina. Assim a sessão inteira roda lá.
3. Não use `setup-token` nem `ANTHROPIC_API_KEY` para o modo Remote Control.
4. Mantenha a máquina ligada e o processo ativo. Se o Codespace hibernar, a sessão cai.

---

## Fontes

- Remote Control: https://code.claude.com/docs/en/remote-control
- Setup / instalação: https://code.claude.com/docs/en/setup
- Autenticação: https://code.claude.com/docs/en/authentication
- Self-hosted environments: https://code.claude.com/docs/en/self-hosted-environments
- Quickstart self-hosted: https://code.claude.com/docs/en/self-hosted-environments-quickstart
- Deploy self-hosted (rede e git): https://code.claude.com/docs/en/self-hosted-environments-deploy
- Cloud sessions (claude.ai/code, --cloud, teleport): https://code.claude.com/docs/en/claude-code-on-the-web
- Relatos de headless com tmux (comunidade, não oficial): https://claudeissues.com/issue/29479-docs-remote-control-confirmed-working-on-headless-linux-vm-via-ssh-tmux
- Pedido de daemon/headless (comunidade): https://claudeissues.com/issue/30447-feature-request-claude-remote-control-headless-daemonizable-remote-control-witho
- Artigo de terceiros sobre self-hosted (não verificado): https://dev.classmethod.jp/en/articles/claude-code-self-hosted-runner/

Não fiz commit deste arquivo.
