# 0 A.D. para o vídeo de IAs estilo Age: análise e recomendação

**Resumo:** recomendo o 0 A.D. como motor, com o visual redesenhado a partir dos logs e clipes reais do jogo nos momentos grandes.

Verificado no código-fonte via espelho do GitHub: lista de comandos, `actions.py`, `api.py` e `simple-example.py`. O gitea.wildfiregames.com bloqueou meu acesso (Anubis), então não li `game.py` nem o C++ do RL. O que depende deles está marcado **(verificar)**. Um `git clone` do espelho resolve.

## Base técnica
- O cliente `RLAPI` tem `reset(config, player_id, save_replay)`, `step([(jogador, ação)...])`, `get_templates(nomes)` e `evaluate(código_JS)` ([api.py](https://raw.githubusercontent.com/0ad/0ad/master/source/tools/rlclient/python/zero_ad/api.py)).
- O `step` aceita comandos de qualquer jogador. Um único processo pode controlar todas as IAs.
- `evaluate` roda JS dentro da simulação e serve para ler estados que o `state` não traz. **(verificar** se existe na 0.0.26; um commit sugere que foi adicionado depois.)
- Os helpers de [actions.py](https://raw.githubusercontent.com/0ad/0ad/master/source/tools/rlclient/python/zero_ad/actions.py) são só: `construct`, `gather`, `train`, `chat`, `reveal_map`, `walk` e `attack`.
- O resto vem do `Commands.js` ([fonte](https://raw.githubusercontent.com/0ad/0ad/master/binaries/data/mods/public/simulation/helpers/Commands.js)). Ele tem 66 comandos, enviáveis como dicionário cru se o `step` repassar o JSON ao `PostCommand` **(verificar)**. Entre eles estão `research`, `diplomacy`, `tribute`, `barter`, `garrison`, `construct-wall`, `set-rallypoint`, `delete-entities`, `upgrade`, `setup-trade-route`, `formation`, `stance`, `repair`, `heal`, `resign` e `aichat`.
- O jogo fica pausado até o `step`, como pede o formato do vídeo ([README](https://raw.githubusercontent.com/0ad/0ad/master/source/tools/rlclient/python/README.md), [simple-example.py](https://raw.githubusercontent.com/0ad/0ad/master/source/tools/rlclient/python/samples/simple-example.py)).
- O `state` expõe entidades (tipo, dono, posição, vida, ordens). Recursos, população e fase do jogador não aparecem nos exemplos **(verificar)**. Se faltarem, `evaluate` ou `GuiInterface` resolvem.

## Mecânicas (custo / valor para o vídeo)

| Mecânica | O que permite o 0 A.D. | Custo | Valor |
|---|---|---|---|
| Coleta e aldeões | `train` e `gather` existem; estado observável (ordens, recursos) | Baixo | Médio. Piada recorrente: "mandou 40 aldeões pra madeira e esqueceu a comida". |
| Construção | `construct`, `construct-wall`, `repair`. A LLM precisa de uma posição, então a camada de ações escolhe o local ("casa perto do centro") | Médio | Médio. Erro conferível (casa fora do alcance, população travada). |
| Fase/era (Vila, Cidade) | `research` da fase no centro cívico | Baixo | Alto. É a corrida de "quem evolui primeiro", fácil de mostrar em selo e placar. |
| Exército e combate | `train`, `attack`, `walk`, `formation`, `stance`, `promote` | Médio | Muito alto. É o evento principal. Ação de alto nível: "atacar X com tudo". |
| Cerco, muralhas, torres | `construct-wall`, torres via `construct`, aríetes via `train` | Médio-alto | Médio. Muralha em volta de tudo e ataque sem cerco rendem erros conferíveis. |
| Diplomacia, chat e tributo | `aichat`, `diplomacy` (aliado/neutro/inimigo), `tribute` | Baixo | Muito alto. Alianças, promessas, traição e tributo sem retorno são o coração do vídeo. |
| Névoa de guerra | O jogo aplica a visibilidade por jogador. O RL pode devolver o estado completo, então a camada de estado filtra por jogador | Médio | Muito alto. O público vê tudo; a IA vê só o que o scout viu. É o segredo. |
| Mercado/comércio | `barter`; `setup-trade-route` é complexo | Baixo (barter) / alto (rotas) | Médio. Só barter na v1 ("vendeu toda a comida por pedra"). |
| Maravilha/vitória | Condições configuradas no `reset`. Conquista por padrão; `wonder` e outras por config **(verificar)** | Baixo | Alto. Cronômetro de 10 min da maravilha dá aposta visível. |
| Relíquias e regicídio | Existem como modos de vitória e mapas; a coleta é por `collect-treasure`/garrison | Médio | Baixo-médio. Fica para a v2. |
| Mapas | Aleatórios por semente, tamanho e número de jogadores (`-autostart-random`, `-autostart-size`) | Baixo | Médio. Mapa pequeno e "Mainland" dão conflito rápido. |
| 4 vs 6 jogadores | Suporta até 8 | Baixo | 6 gera mais diplomacia, mas custa mais tokens e tempo. Times (2x2x2) dão traição pura. |

Recomendação sobre jogadores: **6 todos-contra-todos com alianças livres e mutáveis**. Times fixos matam a traição.

## (1) Estado e ações para a LLM
- **Estado compacto (~800-1500 tokens):**
  - Cabeçalho: tempo, minha fase, recursos, população/limite, quantos aldeões em cada recurso.
  - Prédios e treinos em fila.
  - Exército por tipo e onde está.
  - Inimigos vistos, com data da última vista.
  - Eventos desde a última rodada ("perdi 4 hoplitas em B2").
  - Diplomacia e a caixa de mensagens do chat.
  - Lista numerada de ações válidas agora.
- **Ações de alto nível (JSON):**
  - `treinar(tipo, n)`
  - `redistribuir_aldeoes(comida/madeira/pedra/metal)`
  - `construir(tipo, onde="perto_centro"|"fronteira"|"mina")`
  - `evoluir_fase`
  - `atacar(jogador, "tudo"|"metade")`
  - `defender`
  - `explorar`
  - `diplomacia(jogador, aliado|neutro|inimigo)`
  - `tributo(jogador, recurso, qtd)`
  - `chat(todos|jogador, texto)`
  - `barter`
- **Tradução:** uma camada Python escolhe as unidades (ociosas, as mais próximas) e a posição, e emite `train`, `gather`, `construct`, `attack` e comandos crus. Ela recusa ação inválida e devolve o erro à IA, o que também vira cena.
- **Cada rodada tem três saídas:** fala pública, mensagem privada e pensamento secreto (campo `pensamento`). O pensamento é o segredo que o público vê. Pelas regras do canal, o pensamento usa eco, nunca sussurro, e tudo é copiado dos logs.

## (2) Gravação sem GPU
- **Opção A, 0 A.D. real:** `-replay-visual` sobre `commands.txt` no Xvfb com Mesa llvmpipe, capturando com ffmpeg `x11grab`. A man page confirma `-replay` não visual e `-nosound`/`-xres`/`-yres` ([man](https://manpages.ubuntu.com/manpages/noble/man6/pyrogenesis.6.html)). Não achei documentação de `-replay-visual` nem de llvmpipe com 0 A.D., então isso é hipótese.
  - Riscos: baixíssimo fps em 4 CPUs, replay em tempo real e captura inconsistente. Mitigação: resolução 540p, sombras e efeitos desligados, e só trechos curtos (batalhas), com game speed baixa.
- **Opção B, visual próprio no Remotion** a partir de um log de estado por rodada (posições, vida, fase, diplomacia): minimapa 2D top-down com ícones SVG (sem emoji), animação de marchas e batalhas, placar, selos e balões de chat. É determinístico, bate com as regras de render do canal e permite todos os efeitos de retenção.
- **Recomendação:** A+B. A base é o B; um clipe real de 5-10 s do 0 A.D. entra como "zoom" nas batalhas, se o spike da A funcionar. Isso dá o "visual parecido com o original" que a regra do canal pede.

## (3) Tempo e duração
- **Duração da partida:**
  - Simulação não visual: provavelmente 5-20x mais rápida que o tempo real **(medir)**.
  - Partida de 25-30 min de jogo, decisões a cada 20 s de jogo: ~80 rodadas x 6 IAs = ~500 chamadas.
  - Com chamadas em paralelo (~5-10 s cada), ficam 15-30 min de relógio por partida. Uns 1-2M de tokens, barato com as IAs favoritas.
- **Trabalho (estimativa):**
  - Spike de viabilidade (instalar via apt, `reset`/`step`, estado de recursos, llvmpipe): 0,5-1 dia.
  - Camada de estado e ações + loop de IAs + log: 2-3 dias.
  - Diplomacia e chat: 0,5 dia.
  - Visual Remotion + roteiro de eventos: 3-5 dias.
  - Várias partidas de teste: 1-2 dias.
  - Total: ~8-12 dias de trabalho.
- **Alternativa B (motor próprio):** um RTS simplificado em Python leva ~5-8 dias para o motor, mas cada mecânica (pathfinding, combate, fog) você escreve e depura, e perde a credibilidade de "jogo real". O 0 A.D. entrega essas mecânicas prontas.

## (4) Recomendação e v1 mínima
**0 A.D. como motor, com visual redesenhado.**
- **Fallback:** se o spike do dia 1 mostrar que `step` não aceita comandos crus ou que o estado não traz recursos, usar `evaluate`. Se nem isso der, cair para a alternativa B.

**Conjunto mínimo da v1, em ordem de valor para o vídeo:**
1. Treino, coleta e construção básicas, com um build order guiado por prompt.
2. Evoluir de fase.
3. Exército, ataque e defesa.
4. Chat público e privado, diplomacia, alianças e traição.
5. Tributo.
6. Névoa de guerra por jogador.
7. Maravilha como condição de vitória alternativa, para dar cronômetro e aposta visível.
8. Barter, como extra barato.

**Fora da v1:** rotas de comércio, relíquias, regicídio, cerco avançado.

**Estrutura de vídeo sugerida:**
- Abrir com a traição ou o ataque mais absurdo (clímax em ~10 s).
- Cada cena é um evento com uma virada: promessa de aliança no chat contra o pensamento secreto, seguida do ataque.
- Selos de contraste ("PROMETEU PAZ · ATACOU 2 TURNOS DEPOIS").
- Placar de fases e população sempre visível.
- Marcadores de tempo ("Min 14") para pular o que é monótono.
- Fechar com uma pergunta ao público.

**Fontes:**
- [Commands.js](https://raw.githubusercontent.com/0ad/0ad/master/binaries/data/mods/public/simulation/helpers/Commands.js)
- [actions.py](https://raw.githubusercontent.com/0ad/0ad/master/source/tools/rlclient/python/zero_ad/actions.py)
- [api.py](https://raw.githubusercontent.com/0ad/0ad/master/source/tools/rlclient/python/zero_ad/api.py)
- [README do cliente](https://raw.githubusercontent.com/0ad/0ad/master/source/tools/rlclient/python/README.md)
- [simple-example.py](https://raw.githubusercontent.com/0ad/0ad/master/source/tools/rlclient/python/samples/simple-example.py)
- [man page do pyrogenesis](https://manpages.ubuntu.com/manpages/noble/man6/pyrogenesis.6.html)
- [Trac: Getting Started RL](https://trac.wildfiregames.com/wiki/GettingStartedReinforcementLearning) (bloqueado pelo Anubis, só o título veio na busca)