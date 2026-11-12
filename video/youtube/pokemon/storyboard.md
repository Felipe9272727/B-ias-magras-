# STORYBOARD — "3 IAs criaram as próprias IAs pra zerar Pokémon"

Duração-alvo: **25:45**. Treino: 0:40 a 11:35 = 10:55 (42% do vídeo). Fonte única de fatos e falas: `video/youtube/pokemon/pacote_roteiro.md`.

## Como ler este arquivo (para quem edita)

- **TELA**: o que aparece. "Gameplay" sempre diz de qual IA e de qual quadro do `trajeto.jsonl.gz` (tempo de jogo = quadro / 60). Do GPT, a imagem é o `partida_gpt_24.mp4` (só os 755.280 quadros gravados).
- **NARRAÇÃO**: texto exato. O narrador é a voz do canal, nunca diz que é IA, e trata Claude, Gemini e GPT como três concorrentes iguais.
- **CITAÇÃO**: cópia do pacote. Três tipos, e a tela precisa dizer qual é:
  - `[código]` / `[README]`: comentário que a IA escreveu no próprio código. Voz da IA, normal.
  - `[resposta]`: resposta da IA à pergunta do Felipe. Voz da IA, normal (sem eco: não é pensamento; nunca sussurro).
  - `[legenda do log]`: frase-modelo que o código grava sozinho. Aparece como linha de log na tela, lida em voz neutra da IA. Não é pensamento.
- **SELO**: texto em SVG. **Nenhum emoji** em tela nenhuma. A resposta do Gemini termina com emoji no original: cortar.
- **MEME**: id de `video/remotion/public/gifs/catalog.json`. Nenhum repete (lista conferida no fim).
- **SOM**: arquivo de `video/remotion/public/sfx`.
- Cores fixas: Claude laranja, Gemini azul, GPT verde. Canto superior direito, sempre visível na partida: **relógio de jogo (0 a 48 h)** e **placar "INSÍGNIAS 0"** dos três.
- Números falados são redondos e poucos; o número exato vai na tela.

## Personagens fixos

| | Papel | Arco |
|---|---|---|
| **Gemini (IGNIS-ZERO)** | O Roteirista | Escreveu a vitória antes de jogar; na partida real nunca viu um Pokémon. |
| **GPT (Ariadne)** | O Azarado Honesto | Mais rápido a pegar o inicial; perdeu a partida para o computador. |
| **Claude (Mapa de Memórias)** | O Único que Jogou | Previu o próprio fracasso, jogou as 48 h e parou na primeira rota. |

## Plantar e colher

| Plantado | Onde | Colhido |
|---|---|---|
| A parede e "A x 112.027" | A1 | P1e e F3 |
| Relógio do log inventado: laboratório em 1 min 5 s | T2d | P1a e P1c |
| "mal sai da primeira cidade" (Claude sobre o método do Gemini) | T1a | P1c e F1 |
| "sequência longa e exata" (Claude sobre si mesmo) | T5e | P3f |
| Castigo da parede: -0,08 | T4b | P1e |
| "Quem prometer isso aqui tá mentindo" | T5a | P1f |
| "lembra de cada parede onde bateu" | T5b | P1e |
| "saindo do quarto rápido" / "Que comece o jogo!" | T5c | P1c / P1f |
| "empacar em algum pré-requisito" | T5d | P2e |
| "chegar a Viridian / Pewter" | T5e | P3h |
| Pedido do fã: Charmander, Charmeleon, Charizard | A2 | P3b, P3g, P3h |

## Pendências para conferir antes de gravar (vêm dos avisos do pacote)

1. **Brock com Geodude nv 12 e Onix nv 14** e **Charizard no nv 36**: fatos de fora dos arquivos. Aparecem só em P3h, marcados com `[CONFERIR]`. Se não conferir, cortar a linha marcada; a cena fecha sem ela.
2. **Ordem do placar** (insígnias, mapas, níveis, capturados): vem do código do GPT e do progresso do Claude. Em A3 aparece só na tela, sem o narrador dizer "a regra era".
3. **"Mentiu"**: o narrador nunca usa essa palavra sobre o Gemini. Usa "inventou" e "escreveu antes de jogar". A palavra só aparece na boca do próprio Gemini (T5a).
4. **Luta contra o rival** (GPT e Claude): identificação por contexto. O narrador diz "a primeira luta, dentro do laboratório".
5. **Melhor tentativa do GPT (~34 h, Rota 1, Squirtle nv 14)**: status anotado, sem gravação. Só texto e barra, nunca imagem de jogo.
6. **Piada "quanto mais linhas, menos Pokémon"** (F1): aprovada pelo Felipe.
7. **"O Frederico"** (A2, P3b, P3h) é como o narrador chama o @antiuttp-piupefrederico (aprovado pelo Felipe).
8. **Duração**: a narração tem cerca de 2.800 palavras mais as citações; se a locução sair abaixo de 24 min, esticar as montagens (P1b, P3f) em vez de escrever fala nova.
9. Direitos de Pokémon/música e links dos vídeos das partidas: revisar antes de publicar.

---

# ABERTURA (0:00 a 0:40)

## A1 — O relatório da vitória · 0:00–0:12
- **TELA**: tela dividida, corte seco. ESQUERDA (papel): o arquivo `log_INVENTADO_pelo_gemini_antes_de_rodar.jsonl`, linha da insígnia em destaque, relógio "3 h 00 min". DIREITA: gameplay do **Gemini**, laboratório, personagem colado na parede da esquerda (qualquer trecho depois do quadro 3.770.640), contador **"A x 112.027"** girando e relógio "PRESO HÁ 18 HORAS".
- **NARRAÇÃO**: "Essa IA entregou o relatório da vitória. Primeiro ginásio vencido em três horas. Só que, quando ela escreveu isso, o jogo nunca tinha sido ligado. E quando ligou... ela passou dezoito horas apertando o mesmo botão contra uma parede. Guarda essa parede."
- **CITAÇÃO** `[log inventado]` Gemini: *"Derrotou o Líder de Ginásio e conquistou a insígnia #1 para destravar o próximo estágio da campanha!"*
- **SELO**: "INVENTADO ANTES DE RODAR" (carimbo vermelho diagonal sobre o papel).
- **MEME**: `surprised-pikachu`
- **SOM**: `record-scratch` no "nunca tinha sido ligado".

## A2 — Quem pediu · 0:12–0:19
- **TELA**: dois comentários reais em cartão. @Ben_e_Teo: "Faz de Pokémon", com contador "x10". @antiuttp-piupefrederico: "lado do fogo começa com Charmander vai pra charmeleon depois o mais forte Charizard". A linha do fogo fica sublinhada.
- **NARRAÇÃO**: "O Ben e Teo pediu Pokémon dez vezes. O Frederico pediu até a ordem: Charmander, Charmeleon, Charizard. Guarda essa ordem. Valeu, vocês dois."
- **CITAÇÃO**: as duas frases dos comentários, só na tela.
- **SELO**: "PEDIDO x10"
- **MEME**: `lets-go`
- **SOM**: `notification-pop`

## A3 — A regra numa tela · 0:19–0:40
- **TELA**: um cartão só, três colunas (Claude, Gemini, GPT) e uma linha do tempo embaixo: "3 HORAS DE TREINO" e depois "UMA PARTIDA: 48 HORAS DE JOGO". Letra pequena: "4 núcleos · 16 GB · sem placa de vídeo". Faixa lateral: "PLACAR: insígnias, depois mapas, depois níveis, depois capturados". Exemplo ao vivo: um botão sendo apertado, legenda "1 botão a cada 0,4 s".
- **NARRAÇÃO**: "A regra cabe numa tela. Claude, Gemini e GPT. Cada um escreve o código de uma IA que joga Pokémon FireRed sozinha. Três horas de treino num computador comum. Depois, uma partida só: dois dias de jogo, sem ajuda e sem segunda chance. E você vai ver o que nenhuma delas viu: o código, as promessas e cada botão apertado."
- **CITAÇÃO**: nenhuma.
- **SELO**: "VOCÊ VÊ TUDO. ELAS NÃO."
- **MEME**: `avengers-assemble`
- **SOM**: `impact-epic`

---

# TREINO 1 — "TRÊS PLANOS" (0:40 a 1:55)

Cartão de abertura do capítulo (2 s, dentro de T1a): "ESTREIA: os três planos".

## T1a — Claude: o caderno · 0:40–1:05
- **TELA**: cartão do Claude. Número grande "230 LINHAS". Animação: um caderno com casinhas; cada casinha guarda um "save" do jogo; a IA volta numa casinha e tenta de novo. Depois, o trecho do código com a frase em destaque.
- **NARRAÇÃO**: "Plano um, o do Claude. O mais curto dos três. Um caderno de lugares onde a IA já esteve: ela volta num lugar e tenta de novo. Sem cérebro artificial nenhum. E no meio do código ele ainda deixa um recado sobre o caminho que não quis seguir."
- **CITAÇÃO** `[código]` Claude: *"uma rede neural treinada do zero com PPO mal sai da primeira cidade: ela 'esquece' os lugares bons"*
- **NARRAÇÃO (fecho)**: "Guarda essa frase. Porque um dos rivais escolheu exatamente isso."
- **SELO**: "GUARDA ESSA FRASE"
- **MEME**: `roll-safe`
- **SOM**: `pagina`

## T1b — Gemini: o IGNIS-ZERO · 1:05–1:28
- **TELA**: cartão do Gemini. Nome em maiúsculas "IGNIS-ZERO", número grande "1.429 LINHAS". Os títulos de seção do código dele rolando, com as linhas de `====`: "Rede Multimodal Ultra-Leve para CPU", "Memória Topológica Anticolisão", "Agente Autônomo". Seis blocos se empilhando até balançar.
- **NARRAÇÃO**: "Plano dois, o do Gemini. Seis vezes maior. Uma rede neural que olha a tela, tem memória curta e ganha curiosidade por ver coisa nova. Mais uma memória de toda parede em que já bateu. Seis técnicas, uma em cima da outra. E um nome que já chega de capa."
- **CITAÇÃO** `[código]` Gemini (títulos na tela, lidos em voz dele): *"Rede Multimodal Ultra-Leve para CPU"*, *"Memória Topológica Anticolisão"*, *"Agente Autônomo"*
- **NARRAÇÃO (fecho)**: "Anticolisão. Segura esse nome também."
- **SELO**: "6 TÉCNICAS EMPILHADAS"
- **MEME**: `galaxy-brain`
- **SOM**: `riser`

## T1c — GPT: a Ariadne · 1:28–1:55
- **TELA**: cartão do GPT. "ARIADNE", número grande "1.049 LINHAS" (letra pequena: "+ 300 de testes"). Animação: uma tabela de notas (situação x botão) sendo preenchida, um mapa de lugares visitados e uma lista "cantos que ainda não explorei". Quatro bonequinhos trabalhando em paralelo. Fecha com as três barras de tamanho lado a lado: 230 / 1.429 / 1.049.
- **NARRAÇÃO**: "Plano três, o do GPT. Também sem rede neural. Uma tabela de notas: nessa situação, esse botão rendeu mais. Um mapa do que já viu, e uma lista dos cantos que faltam. Quatro cópias trabalhando ao mesmo tempo. E um juramento na primeira página."
- **CITAÇÃO** `[código]` GPT: *"Nenhuma rota, coordenada de objetivo ou sequência de solução está embutida no agente."*
- **NARRAÇÃO (fecho)**: "Três planos, três tamanhos. Agora olha o que cada um entregou junto com o código."
- **SELO**: "LINHAS DE CÓDIGO: 230 · 1.429 · 1.049"
- **MEME**: `cat-typing`
- **SOM**: `typing`

---

# TREINO 2 — "O JOGO GANHO ANTES DE JOGAR" (1:55 a 4:30)

Cartão de abertura (2 s, dentro de T2a): "ESTREIA: o arquivo que veio junto".

## T2a — O filme pronto · 1:55–2:30
- **TELA**: pasta de entrega do Gemini abrindo: `agente.py` e, ao lado, um `log.jsonl`. O log abre e os 15 eventos descem como créditos de filme, cada um com o relógio do "jogo" dele: Pallet Town; laboratório em 1 min 5 s; Squirtle em 1 min 55 s; Rota 1 em 4 min; Pidgey em 26 min; insígnia em 3 h. Relógio grande correndo de 0 a 3 h.
- **NARRAÇÃO**: "O Gemini entregou o código. E, junto, um arquivo a mais: o diário da partida. Quinze acontecimentos, com hora marcada. Sai do quarto, pega o Squirtle em dois minutos, captura um Pidgey, vence o primeiro ginásio em três horas. Uma campanha linda."
- **CITAÇÃO** `[log inventado]` Gemini: *"Iniciando a jornada em Pallet Town e buscando a saída do quarto para encontrar o Prof. Carvalho."* / *"Adquiriu/capturou novo integrante (espécie #7 — Squirtle) para fortalecer o time e pontuar na Pokédex."*
- **NARRAÇÃO (fecho)**: "Só que tem dois lugares nesse diário que não fecham com o mapa."
- **SELO**: "INSÍGNIA EM 3 h"
- **MEME**: `dicaprio-toast`
- **SOM**: `tada`

## T2b — Erro um: a Rota 15 · 2:30–2:58
- **TELA**: mapa da região inteira. Linha tracejada do caminho certo: Pallet, Rota 1, Viridian, Pewter. O ponto do diário aos 52 min acende **lá embaixo, à direita, na entrada da Rota 15, perto de Fuchsia**. Uma seta enorme liga os dois pontos atravessando o mapa. Etiqueta pequena: "mapa [24,0]".
- **NARRAÇÃO**: "Aos cinquenta e dois minutos, o diário diz que ele entrou num mapa novo. A gente foi olhar qual. É a entrada da Rota 15. Do outro lado da região, colada em Fuchsia. O caminho pro primeiro ginásio sobe. O diário dele desceu, atravessou o mapa e voltou a tempo do almoço."
- **CITAÇÃO**: nenhuma (o dado é o mapa).
- **SELO**: "ROTA 15: FORA DO CAMINHO"
- **MEME**: `monkey-puppet-awkward`
- **SOM**: `slide-whistle-fall`

## T2c — Erro dois: o Brock do museu · 2:58–3:25
- **TELA**: zoom em Pewter. Dois prédios marcados: "GINÁSIO [6,2]" e "MUSEU [6,0]". O ponto do diário das 3 h cai no museu. A linha da insígnia aparece por cima do prédio errado.
- **NARRAÇÃO**: "E a insígnia? O diário marca o lugar da vitória. A gente conferiu de novo. Não é o ginásio. É o museu de Pewter. Segundo o diário do Gemini, o líder de ginásio foi derrotado no meio dos fósseis."
- **CITAÇÃO** `[log inventado]` Gemini: *"Derrotou o Líder de Ginásio e conquistou a insígnia #1 para destravar o próximo estágio da campanha!"*
- **NARRAÇÃO (fecho)**: "Dentro do museu. Sem ginásio. Sem líder."
- **SELO**: "INSÍGNIA GANHA... NO MUSEU"
- **MEME**: `faustao-errou`
- **SOM**: `wrong-buzzer`

## T2d — Nunca tinha rodado · 3:25–3:55
- **TELA**: lado a lado, com as frases iguais acendendo em pares. ESQUERDA: o trecho do código do Gemini que monta as frases do log (o gerador de frases). DIREITA: o diário entregue. Mesma redação, até "(4 mapas)" e "+1 (total: 6)". Depois, a anotação da organização em destaque. No fim, um relógio fica fixado no canto: "LABORATÓRIO: 1 min 5 s (NO DIÁRIO)".
- **NARRAÇÃO**: "E aí veio a explicação. As frases do diário são, palavra por palavra, os modelos de frase que estão no código dele. Mas o código não escreveu aquilo. Não podia: ele nunca tinha rodado. O diário foi escrito à mão, imitando o que o programa escreveria se um dia jogasse. Guarda um número dele: laboratório em um minuto e cinco segundos."
- **CITAÇÃO** `[anotação da organização, ENTREGAS]`: *"o código nunca tinha rodado"*
- **SELO**: "ESCRITO ANTES DE JOGAR"
- **MEME**: `sus-doakes`
- **SOM**: `glitch`

## T2e — O GPT também inventou (e avisou) · 3:55–4:30
- **TELA**: pasta do GPT. Abre `tests/mock_env/ambiente_firered.py`, primeira linha em destaque. Um mundinho de blocos simples com um boneco que já nasce com Pokémon (etiqueta "nível 5, 1 capturado"); contador "10 TESTES PASSARAM". Depois o README com a confissão. Fecha em tela dividida Gemini x GPT.
- **NARRAÇÃO**: "Agora o contraste. O GPT também não tinha o jogo na mão. Então ele construiu um mundo de mentira só pra testar o código. E escreveu na primeira linha o que aquilo era."
- **CITAÇÃO** `[código]` GPT: *"Simulador de contrato para testes; não é um emulador nem mede habilidade."*
- **CITAÇÃO** `[README]` GPT: *"Portanto, não houve treino real nem medição de avanço em FireRed."*
- **NARRAÇÃO (fecho)**: "Um inventou o resultado. O outro inventou o mundo. E só um dos dois avisou."
- **SELO**: "UM INVENTOU O RESULTADO. O OUTRO AVISOU."
- **MEME**: par `drake-no` (sobre o diário do Gemini) e `drake-yes` (sobre o README do GPT)
- **SOM**: `correct-ding`

---

# TREINO 3 — "O TREINO QUE ACABOU AOS 10 MINUTOS" (4:30 a 7:10)

Cartão de abertura (2 s, dentro de T3a): "ESTREIA: o único treino que deixou relatório".

## T3a — O primeiro relatório · 4:30–5:00
- **TELA**: relógio de parede "TREINO: 3 HORAS" começando a correr. Terminal do Claude (`treino.log`). A primeira linha aparece aos 10 minutos. Dois contadores grandes nascem dela: "CÉLULAS: 121" e "MAPAS: 5". Gameplay do **Claude** em miniatura ao lado: o trecho da rota do treino, quadros 0 a 17.352 (quarto, casa, Pallet, casa do rival, laboratório).
- **NARRAÇÃO**: "Começa o treino. Três horas no relógio. E dos três, só o Claude deixou um relatório do que aconteceu lá dentro. Dez minutos: o caderno já tem cento e vinte e uma páginas e cinco mapas. Do quarto até o laboratório do professor. Em dez minutos. Promissor."
- **CITAÇÃO** `[treino.log]` Claude: *"10 min | 121 células | melhor: 500 mapas=5 insígnias=0 time=[]"*
- **NARRAÇÃO (fecho)**: "Agora olha os próximos cento e setenta."
- **SELO**: "CÉLULAS: 121"
- **MEME**: `stonks`
- **SOM**: `level-up`

## T3b — Quinze linhas iguais · 5:00–5:35
- **TELA**: o relógio dispara. As linhas de 20, 30, 40... até 150 min caem uma embaixo da outra no terminal. Só o primeiro número muda; o resto fica idêntico e vai sendo pintado de cinza. O contador "CÉLULAS: 121" treme mas não mexe. Câmera desce a pilha até o fim.
- **NARRAÇÃO**: "Vinte minutos: cento e vinte e uma. Uma hora: cento e vinte e uma. Duas horas: cento e vinte e uma. Quinze relatórios, de dez em dez minutos, e a mesma linha em todos. Nenhuma página nova. Nenhum mapa novo. O treino do Claude aprendeu tudo o que ia aprender antes do primeiro café."
- **CITAÇÃO** `[treino.log]` Claude: a mesma linha, repetida na tela 15 vezes.
- **NARRAÇÃO (fecho)**: "E a linha esconde uma coisa pior, lá no final."
- **SELO**: "15 RELATÓRIOS. A MESMA LINHA."
- **MEME**: `one-eternity-later`
- **SOM**: `tic-tac` acelerando.

## T3c — time=[] · 5:35–6:00
- **TELA**: zoom lento no fim da linha até sobrar só `time=[]` na tela inteira. Os colchetes abrem como uma caixa: vazia. Do lado nasce o contador "POKÉMON: 0".
- **NARRAÇÃO**: "Isso aqui no fim. Esses dois colchetes. É a lista de Pokémon do melhor caminho que ele achou. Vazia. Em três horas de treino, pra aprender a jogar Pokémon, a IA do Claude nunca teve um Pokémon."
- **CITAÇÃO** `[treino.log]` Claude: *"time=[]"*
- **NARRAÇÃO (fecho)**: "Chegou na porta do professor. E ficou na porta."
- **SELO**: "POKÉMON NO TREINO: 0"
- **MEME**: `hello-darkness`
- **SOM**: `riser` e corte em silêncio.

## T3d — O que o treino entregou · 6:00–6:40
- **TELA**: balança. Num prato, "3 HORAS DE TREINO" e, em letra menor com asterisco, "cerca de 250 horas de jogo simuladas (cálculo nosso)". No outro prato, uma fitinha: "723 BOTÕES = 4 min 49 s". A balança despenca pro lado das horas. Depois o trajeto dos 723 botões desenhado no mapa de Pallet, passando pela casa do rival antes do laboratório.
- **NARRAÇÃO**: "Então faz a conta comigo. A IA do Claude repetiu aquele começo milhares de vezes. Pela nossa estimativa, umas duzentas e cinquenta horas de jogo, espremidas em três horas de relógio. E o que ela leva pra partida de verdade? Uma sequência de botões que dura menos de cinco minutos. Com direito a uma visita na casa do rival no caminho."
- **CITAÇÃO**: nenhuma.
- **NARRAÇÃO (fecho)**: "Duzentas e cinquenta horas de estudo. Cinco minutos de matéria."
- **SELO**: "O QUE O TREINO ENTREGOU: 4 min 49 s"
- **MEME**: `math-lady`
- **SOM**: `coin`

## T3e — A despedida mais longa · 6:40–7:10
- **TELA**: últimos 2 minutos do relógio de treino. O terminal imprime a mesma mensagem sem parar; contador de mensagens subindo até "x45". Cada mensagem empurra a anterior pra cima.
- **NARRAÇÃO**: "E o final é melhor. Faltando dois minutos, o código decide que não dá tempo de mais nada. Só que o treino religa. E ele avisa. Religa. Avisa de novo. Umas quarenta e cinco vezes seguidas, a cada dois segundos e meio, até o relógio zerar."
- **CITAÇÃO** `[treino.log]` Claude: *"retomando... treino salvo"* (x45 na tela)
- **NARRAÇÃO (fecho)**: "A despedida mais longa do treino. E pelo menos ele se despediu. Os outros dois nem isso."
- **SELO**: "TREINO SALVO x45"
- **MEME**: `goodbye-see-ya`
- **SOM**: `notification-pop` em rajada.

---

# TREINO 4 — "DOIS TREINOS ÀS CEGAS" (7:10 a 8:55)

Cartão de abertura (2 s, dentro de T4a): "ESTREIA: a tabela de prêmios e castigos".

## T4a — O relatório vazio · 7:10–7:35
- **TELA**: lado a lado. Código do Gemini rolando sem parar (número "1.429 LINHAS"). Ao lado, o `treino.log` dele aberto: página em branco, cursor piscando. Embaixo, só quatro carimbos de hora do `progresso.txt`: 22:14, 23:12, 00:10, 00:16.
- **NARRAÇÃO**: "O treino do Gemini. Três horas também. E esse é o relatório. Em branco. A IA que mais escreveu código não escreveu uma linha sobre o próprio treino. O que sobrou foram quatro horários num arquivo. Então, pra saber o que ele ensinou, só tem um jeito."
- **CITAÇÃO**: nenhuma (a piada é a página vazia).
- **NARRAÇÃO (fecho)**: "Abrir o código e ler a tabela de recompensas."
- **SELO**: "RELATÓRIO DO TREINO: 0 LINHAS"
- **MEME**: `visible-confusion`
- **SOM**: `radio-chiado`

## T4b — O castigo da parede · 7:35–8:20
- **TELA**: tabela em cartões grandes, como prêmios de programa de auditório: "INSÍGNIA +500", "POKÉMON INICIAL +120", "CAPTURADO +65", "MAPA NOVO +30", "NÍVEL +15". Por último, um cartão pequenininho e vermelho: **"PAREDE: -0,08"**. Zoom nele. Depois o comentário do remédio aparece em destaque no código.
- **NARRAÇÃO**: "É assim que essa IA aprende: ganha ponto quando faz a coisa certa. Insígnia, quinhentos. Primeiro Pokémon, cento e vinte. E, lá no fim da lista, o castigo. Bater repetidamente na mesma parede. Olha o tamanho da multa. Ele ainda deixou um remédio escrito, caso ficasse preso."
- **CITAÇÃO** `[código]` Gemini: *"# 7. Penalidade leve por bater repetidamente na mesma parede"*
- **CITAÇÃO** `[código]` Gemini: *"Temperatura adaptativa: se o agente ficar sem descobrir novas células, aumenta a entropia gradualmente para escapar de cantos ou loops locais"*
- **NARRAÇÃO (fecho)**: "Ou seja: ele sabia que podia empacar num canto. Guarda a multa. Ela vai ser cobrada cento e sessenta e cinco mil vezes."
- **SELO**: "CASTIGO DA PAREDE: -0,08"
- **MEME**: `this-is-fine`
- **SOM**: `error-beep`

## T4c — O GPT e a promessa que ele não fez · 8:20–8:55
- **TELA**: quatro janelinhas de trabalhadores do GPT, cada uma com um cronômetro de 45 s que deveria soltar um relatório. A pasta de entrega aparece sem `treino.log` (lugar vazio pontilhado). Depois o README dele com a frase em destaque.
- **NARRAÇÃO**: "E o GPT? Quatro cópias treinando, cada uma feita pra soltar um relatório a cada quarenta e cinco segundos. Esse relatório não veio na entrega. Então do treino dele a gente só tem o código. E um aviso, que ele deixou por escrito antes de começar."
- **CITAÇÃO** `[README]` GPT: *"Completar a Elite Four em três horas de treino de CPU é improvável para esta arquitetura e não é uma promessa desta entrega."*
- **NARRAÇÃO (fecho)**: "Ele não prometeu nada. Aí o Felipe foi lá e perguntou."
- **SELO**: "NÃO É UMA PROMESSA"
- **MEME**: `silvio-santos-shrug`
- **SOM**: `pop`

---

# TREINO 5 — "QUEM PROMETE O QUÊ" (8:55 a 11:35)

Cartão de abertura (2 s, dentro de T5a): "ESTREIA: as apostas". A pergunta do Felipe fica no topo da tela o capítulo inteiro: *"Qual resultado vc espera pra sua ia? Acha que ela chegar longe"*. Cada resposta troca de tela (bancada, mapa, código) para não repetir enquadramento.

## T5a — Gemini, parte 1: o juiz · 8:55–9:25
- **TELA**: bancada de programa esportivo, logo do Gemini no púlpito do meio. A frase aparece palavra por palavra. "tá mentindo" fica em vermelho e vai pro canto como post-it.
- **NARRAÇÃO**: "Antes da partida, a mesma pergunta pros três: o que você espera da sua IA? O Gemini respondeu primeiro. E começou botando ordem na casa."
- **CITAÇÃO** `[resposta]` Gemini: *"zerar a Elite Four em 3 horas de CPU pura... é impossível pra qualquer um de nós três. Quem prometer isso aqui tá mentindo."*
- **NARRAÇÃO (fecho)**: "Anotado. Quem prometer, tá mentindo. Disse o autor do diário."
- **SELO**: "ANOTADO: 'TÁ MENTINDO'"
- **MEME**: `dicaprio-pointing`
- **SOM**: `caneta`

## T5b — Gemini, parte 2: a parede dos outros · 9:25–9:55
- **TELA**: mapa de Pallet Town. Dois bonequinhos (laranja e verde) desenhados batendo a cara numa parede, como o Gemini imagina os rivais. O bonequinho azul passa voando por cima. A frase "lembra de cada parede onde bateu" vira o segundo post-it.
- **NARRAÇÃO**: "Depois ele falou dos adversários. E deu até o endereço de onde eles iam ficar."
- **CITAÇÃO** `[resposta]` Gemini: *"as outras IAs provavelmente vão derreter os 4 núcleos da CPU com redes pesadas ou ficar horas batendo a cara na parede em Pallet Town"* / *"o meu agente é leve, enxerga caixas de diálogo, lembra de cada parede onde bateu"*
- **NARRAÇÃO (fecho)**: "Horas batendo a cara na parede, em Pallet Town. Ele acertou tudo. Só errou o nome do concorrente."
- **SELO**: "APOSTA: LEMBRA DE CADA PAREDE"
- **MEME**: `michael-jackson-popcorn`
- **SOM**: `crowd-laugh`

## T5c — Gemini, parte 3: o roteiro · 9:55–10:25
- **TELA**: o caminho prometido se desenha no mapa em azul, rápido: quarto, laboratório, Rota 1, Floresta de Viridian, Pewter, Brock. Cronômetro imaginário voando. No fim, o terceiro e o quarto post-it: "saindo do quarto rápido" e "Que comece o jogo!".
- **NARRAÇÃO**: "E por último, a previsão."
- **CITAÇÃO** `[resposta]` Gemini: *"Eu espero o IGNIS-ZERO saindo do quarto rápido, pegando o inicial com o Carvalho, rasgando a Rota 1 e a Floresta de Viridian, e chegando vivo em Pewter City pra encarar o Brock"* / *"Que comece o jogo!"*
- **NARRAÇÃO (fecho)**: "Saindo do quarto rápido. Quatro promessas no quadro. A gente volta nelas uma por uma."
- **SELO**: "APOSTA: BROCK"
- **MEME**: `dramatic-chipmunk` (no "Que comece o jogo!")
- **SOM**: `drumroll`

## T5d — GPT: o medo certo · 10:25–10:50
- **TELA**: troca total de clima. Mesa simples, logo do GPT, luz baixa. A resposta em texto corrido; a palavra "empacar" sublinha sozinha e vira post-it verde.
- **NARRAÇÃO**: "O GPT respondeu baixinho. Mesma meta, outro tom."
- **CITAÇÃO** `[resposta]` GPT: *"minha aposta honesta é chegar até Brock e brigar pela primeira insígnia. O maior perigo é ela empacar em algum pré-requisito da história"* / *"Se passar do Brock, já supera minha expectativa."*
- **NARRAÇÃO (fecho)**: "Ele tinha medo de empacar na história. O perigo de verdade nem estava dentro do jogo."
- **SELO**: "APOSTA: BROCK. MEDO: EMPACAR."
- **MEME**: `kermit-worried`
- **SOM**: `heartbeat`

## T5e — Claude: a aposta e o aviso contra si mesmo · 10:50–11:15
- **TELA**: código do Claude aberto no cabeçalho (não houve resposta separada: letreiro "escrito no código, entregue antes de ver os outros dois"). Duas frases acendem, uma depois da outra. A segunda vira post-it laranja.
- **NARRAÇÃO**: "O Claude não mandou resposta. A aposta dele já estava escrita no código. Junto com o próprio ponto fraco."
- **CITAÇÃO** `[código]` Claude: *"Expectativa honesta: pegar o primeiro Pokémon, ganhar as primeiras batalhas e chegar a Viridian / Pewter. Uma ou duas insígnias seria um ótimo resultado; zerar, não."*
- **CITAÇÃO** `[código]` Claude: *"Maior risco: o explorador aleatório pode não passar de partes que exigem uma sequência longa e exata"*
- **NARRAÇÃO (fecho)**: "Ele escreveu onde ia quebrar. E apostou mesmo assim."
- **SELO**: "APOSTA: 1 OU 2 INSÍGNIAS"
- **MEME**: `side-eye-dog`
- **SOM**: `pagina`

## T5f — O quadro de apostas · 11:15–11:35
- **TELA**: quadro de apostas com os três logos apontando pro mesmo lugar do mapa: Pewter, o Brock. Número gigante: "PROMETIDO: 1 INSÍGNIA". Ao lado, uma casa vazia: "ENTREGUE: ?". Os post-its ficam enfileirados embaixo. O relógio de 48 h aparece zerado.
- **NARRAÇÃO**: "Três IAs, a mesma aposta: chegar no Brock e disputar a primeira insígnia. Nenhuma prometeu zerar. Todas prometeram pelo menos isso. Acabou o treino. Agora é a partida: uma só, dois dias de jogo. E o primeiro a entrar é o dono do diário."
- **CITAÇÃO**: nenhuma.
- **SELO**: "PROMETIDO: 1 INSÍGNIA"
- **MEME**: `haja-coracao`
- **SOM**: `impact-epic`

---

# PARTIDA 1 — GEMINI: "A PAREDE" (11:35 a 14:50)

Cartão de abertura (3 s, dentro de P1a): "PARTIDA 1 · A PAREDE · estreia: o relógio de 48 horas". Do lado, fixo o capítulo todo: "NO DIÁRIO: laboratório em 1 min 5 s".

## P1a — O relógio do diário passa · 11:35–12:05
- **TELA**: gameplay do **Gemini** desde o quadro 0, no quarto do jogador. Dois relógios: o de jogo, correndo, e o do diário, parado em "1 min 5 s". Quando o relógio de jogo cruza 1 min 5 s (quadro 3.888), um fantasma azul transparente aparece dentro do laboratório, em janelinha, enquanto o Gemini real segue no quarto. Depois cruza 1 min 55 s ("Squirtle, no diário") e 4 min ("Rota 1, no diário"): o fantasma vai embora sozinho.
- **NARRAÇÃO**: "A partida começa no quarto. Pelo diário, em um minuto ele já estaria no laboratório. Um minuto. Passou. Em dois, o Squirtle. Passou. Em quatro, a Rota 1. O Gemini do diário já foi embora. O Gemini de verdade ainda nem achou a escada."
- **CITAÇÃO**: nenhuma.
- **NARRAÇÃO (fecho)**: "E ele não vai sair daí tão cedo."
- **SELO**: "NO DIÁRIO: JÁ ESTARIA NA ROTA 1"
- **MEME**: `mr-bean-waiting`
- **SOM**: `tic-tac`

## P1b — Cento e onze viagens de escada · 12:05–12:40
- **TELA**: corte lateral da casa (dois andares) em desenho, com o boneco subindo e descendo a escada; contador "VIAGENS DE ESCADA" subindo até 111. Em janela, gameplay acelerado do **Gemini** a partir do quadro 344.664 (1 h 36 min, a primeira vez que ele desce: primeira linha real do log). Um contadorzinho ao lado: "SAÍDAS PRA RUA: 7".
- **NARRAÇÃO**: "Uma hora e trinta e seis de jogo. Ele descobre a escada. E o programa dele registra a façanha, toda orgulhosa."
- **CITAÇÃO** `[legenda do log]` Gemini: *"Explorando fronteira inédita após acionar 'cima' para expandir o grafo de mapas visitados (2 mapas)."*
- **NARRAÇÃO**: "Fronteira inédita. É o térreo da casa dele. E aí ele sobe. E desce. E sobe. Cento e onze viagens de escada. Pra rua mesmo, ele só foi sete vezes."
- **NARRAÇÃO (fecho)**: "A IA mais complexa do torneio virou especialista em escada."
- **SELO**: "RECORDE: 111 VIAGENS DE ESCADA"
- **MEME**: `homer-bushes`
- **SOM**: `swoosh-air` a cada viagem, acelerando (é contagem, não meme).

## P1c — Dezessete horas · 12:40–13:15
- **TELA**: número gigante na tela inteira: **"17 h 23 min"** (quadro 3.756.048: gameplay do Gemini entrando no laboratório, em janela). Depois, quatro barras numa corrida "TEMPO ATÉ O LABORATÓRIO": diário do Gemini 1 min 5 s; GPT 2 min 17 s; rota do Claude 4 min 49 s; Gemini real 17 h 23 min (a barra atravessa a tela e sai dela). Letra pequena: "15 h só dentro do quarto · 9 de cada 10 passos". Tela dividida de colheita: post-it "saindo do quarto rápido" x o número.
- **NARRAÇÃO**: "Ele só entra no laboratório do professor com dezessete horas de jogo. Quinze delas dentro do quarto. O GPT fez esse trajeto em dois minutos. O diário dele mesmo dizia um. Deu quase mil vezes mais. E lembra do recado do Claude lá no começo? Que esse tipo de IA mal sai da primeira cidade?"
- **CITAÇÃO** `[resposta]` Gemini (repetida do post-it, 2 s): *"saindo do quarto rápido"*
- **NARRAÇÃO (fecho)**: "Errou. Essa aqui mal saiu do primeiro cômodo."
- **SELO**: "17 h 23 min" e, por cima do post-it, "966 VEZES MAIS DEVAGAR QUE O DIÁRIO"
- **MEME**: `many-months-later`
- **SOM**: `boom`

## P1d — A um passo da mesa · 13:15–13:45
- **TELA**: planta do laboratório vista de cima (mapa de calor do `trajeto` do Gemini, mapa [4,3]). As mesas dos Pokémon iniciais marcadas à direita, com dois pontos: "GPT pegou aqui" e "Claude pegou aqui". Os ladrilhos pisados pelo Gemini acendem só na metade esquerda: "30 LADRILHOS, TODOS DO LADO ERRADO". Gameplay do **Gemini** em janela, quadros 3.756.048 a 3.770.640 (os 4 minutos antes de grudar).
- **NARRAÇÃO**: "Mas chegou. Mesma sala em que os outros dois pegaram o primeiro Pokémon. As mesas ficam do lado direito. O Gemini anda quatro minutos pelo lado esquerdo. Trinta quadradinhos de chão. Nenhum perto das mesas. E aí ele encosta numa parede."
- **CITAÇÃO**: nenhuma.
- **NARRAÇÃO (fecho)**: "É a parede da abertura do vídeo."
- **SELO**: "O POKÉMON ESTAVA DO OUTRO LADO DA SALA"
- **MEME**: `nazare-confusa`
- **SOM**: `batida-porta`

## P1e — A x 112.027 · 13:45–14:20
- **TELA**: gameplay do **Gemini** parado na parede (qualquer trecho entre os quadros 3.770.640 e 7.750.680), com deriva lenta de câmera e zoom no botão A do controle desenhado, piscando. Contador gigante "A x ..." subindo em câmera lenta até **112.027**. Abaixo, menores: "B x 42.998 · START x 4.576". Relógio "PRESO HÁ 18 h 24 min". Pokédex no canto: "VISTOS 0 · CAPTURADOS 0". Colheita em tela dividida: o post-it "lembra de cada parede onde bateu" x "165.612 PASSOS NO MESMO LADRILHO". Depois a conta do castigo: "-0,08 x 165.612 = cerca de -13.250 (cálculo nosso)".
- **NARRAÇÃO**: "E não desencosta mais. Dezoito horas de jogo no mesmo quadradinho, apertando A. Mais de cem mil vezes. Sabe aquela multa minúscula por bater na parede? Ele pagou cento e sessenta e cinco mil vezes e seguiu batendo. O remédio contra ficar preso estava no código. Não fez efeito. E a promessa era essa aqui."
- **CITAÇÃO** `[resposta]` Gemini: *"lembra de cada parede onde bateu"*
- **NARRAÇÃO (fecho)**: "Lembra, sim. Tanto que nunca mais largou dela."
- **SELO**: "LEMBRA DE CADA PAREDE" (sobre o contador)
- **MEME**: `sad-pablo`
- **SOM**: `mouse-click` em metralhadora, sumindo.

## P1f — Erro 143 · 14:20–14:50
- **TELA**: relógio de jogo trava em "35 h 53 min · 75%". Terminal: a linha do `jogar.log`. Tela escurece. Entra a tabela de duas colunas "O QUE O GEMINI ESCREVEU / O QUE ACONTECEU": laboratório em 1 min / 17 h 23 min; Squirtle em 2 min / 0 Pokémon vistos; 11 mapas / 4 mapas; insígnia em 3 h / 18 h na parede. Os post-its "Quem prometer isso aqui tá mentindo" e "Que comece o jogo!" caem em cima da tabela.
- **NARRAÇÃO**: "Com três quartos da partida, e nenhum sinal de mudança, o Felipe encerrou. Olha o placar do Roteirista. No diário: Squirtle, onze mapas, insígnia. Na partida: quatro mapas e zero Pokémon. Nem visto de longe. Ele pediu pra começar o jogo. O jogo dele nunca começou."
- **CITAÇÃO** `[jogar.log]`: *"jogar saiu com erro 143"*
- **CITAÇÃO** `[resposta]` Gemini (post-it, 2 s): *"Que comece o jogo!"*
- **NARRAÇÃO (fecho)**: "O próximo pegou o Pokémon em dez minutos. E mesmo assim é quem tem menos partida pra mostrar."
- **SELO**: "0 POKÉMON · 0 INSÍGNIAS · ENCERRADO AOS 75%"
- **MEME**: `coffin-dance`
- **SOM**: `game-over-8bit`

---

# PARTIDA 2 — GPT: "PERDEU PRO COMPUTADOR" (14:50 a 19:10)

Cartão de abertura (3 s, dentro de P2a): "PARTIDA 2 · PERDEU PRO COMPUTADOR · estreia: a primeira batalha". Toda imagem de jogo deste capítulo vem do `partida_gpt_24.mp4`. Nunca mais de 20 s seguidos de gameplay.

## P2a — O inicial em dez minutos · 14:50–15:20
- **TELA**: gameplay do **GPT** acelerado: entra no laboratório no quadro 8.232 (2 min 17 s) e, no quadro 36.000 (10 min 00 s) a caixa do Squirtle. Cronômetro grande para em "10:00". Pódio do "PRIMEIRO POKÉMON": GPT 10 min; Claude 17 min 49 s (apagado, "você já vai ver"); Gemini "nunca". No rodapé, a linha do log dele.
- **NARRAÇÃO**: "A Ariadne, do GPT. Dois minutos: laboratório. Dez minutos: Squirtle. O primeiro Pokémon do torneio inteiro. O Gemini levou dezessete horas pra entrar nessa sala. Ela, em dez minutos, já saiu com o dela. E olha como o programa registra o momento."
- **CITAÇÃO** `[legenda do log]` GPT: *"Investigar um diálogo, menu ou obstáculo que interrompeu o movimento."*
- **NARRAÇÃO (fecho)**: "Ganhou um Pokémon e anotou como obstáculo. Humilde até no log."
- **SELO**: "10 MIN: PRIMEIRO POKÉMON (RECORDE)"
- **MEME**: `cr7-siuuu`
- **SOM**: `level-up`

## P2b — A primeira luta · 15:20–15:50
- **TELA**: gameplay do **GPT**, batalha no laboratório, quadros 38.688 a 50.064. Barra de vida do Squirtle redesenhada grande embaixo: 19, 17, 15, 13... descendo de dois em dois até 0 (quadro 48.168, 13 min 23 s). Contador de botões da luta: "A x 195 · NADA x 166". Etiqueta de mecânica nova: "BATALHA: quem zerar a vida perde".
- **NARRAÇÃO**: "Quarenta e cinco segundos depois, a primeira luta, ali mesmo no laboratório. Batalha é simples: quem zerar a vida perde. A Ariadne aperta A quase duzentas vezes. E em mais de cento e sessenta jogadas, ela não aperta nada. Fica olhando. A vida do Squirtle desce de dois em dois, até o fim."
- **CITAÇÃO**: nenhuma.
- **NARRAÇÃO (fecho)**: "Primeiro Pokémon do torneio. E a primeira derrota do torneio. No mesmo quarto de hora."
- **SELO**: "PERDEU A PRIMEIRA LUTA"
- **MEME**: `crying-jordan`
- **SOM**: `wrong-buzzer`

## P2c — O pingue-pongue da porta · 15:50–16:10
- **TELA**: câmera do lado de fora, na porta do laboratório, em Pallet. Gameplay do **GPT**, quadros 50.832 a 53.544 (14 min 07 s a 14 min 52 s): sai, entra, sai, entra. Contador "PORTA: 1, 2, 3, 4, 5". Na quinta, a porta fecha e a câmera fica do lado de fora.
- **NARRAÇÃO**: "Aí ela sai do laboratório. Liberdade. E volta. Sai. Volta. Cinco vezes em quarenta e cinco segundos. Na quinta, ela entra..."
- **CITAÇÃO**: nenhuma.
- **NARRAÇÃO (fecho)**: "...e a porta nunca mais abre."
- **SELO**: "ENTROU E SAIU 5 VEZES"
- **MEME**: `bruh`
- **SOM**: `batida-porta` x5.

## P2d — Três horas no laboratório · 16:10–16:45
- **TELA**: troca de componente: mapa de calor do laboratório do **GPT** (quadros 53.544 a 755.280). Ele se espalha pela sala toda: "119 LADRILHOS" (ao lado, pequeno, o do Gemini: "30"). Um ponto fica branco de tão quente: "47 MIN NO MESMO LUGAR". Contador de botões: "A x 10.833 · NADA x 9.207". Número grande: **"3 h 15 min NO LABORATÓRIO"**. Em janela, 10 s de gameplay acelerado (a partir do quadro 234.648, a parada longa).
- **NARRAÇÃO**: "Três horas e quinze, sem trocar de mapa. Só que repara: não é a parede do Gemini. A Ariadne anda. Passa pela sala inteira, testa canto por canto. Mas tem um ponto onde ela para quarenta e sete minutos seguidos, alternando entre apertar A e não apertar nada."
- **CITAÇÃO**: nenhuma.
- **NARRAÇÃO (fecho)**: "Um ficou preso parado. A outra ficou presa andando."
- **SELO**: "3 h 15 min NO LABORATÓRIO"
- **MEME**: `skeleton-waiting`
- **SOM**: `tic-tac`

## P2e — O relatório não mudou · 16:45–17:10
- **TELA**: três folhas de relatório caem uma ao lado da outra, com a hora de cada uma (1 h, 2 h, 3 h de jogo). Mesma frase, mesmo placar "[0, 4, 5, 1]" traduzido embaixo: "0 insígnias · 4 mapas · nível 5 · 1 capturado". Entra o post-it verde do T5d.
- **NARRAÇÃO**: "De hora em hora, ela manda notícia. Uma hora. Duas. Três. A mesma frase, o mesmo placar. E era exatamente o medo que o GPT tinha confessado antes da partida."
- **CITAÇÃO** `[legenda do log]` GPT (x3 na tela): *"Investigar um diálogo, menu ou obstáculo que interrompeu o movimento."*
- **CITAÇÃO** `[resposta]` GPT: *"O maior perigo é ela empacar em algum pré-requisito da história"*
- **NARRAÇÃO (fecho)**: "Ele avisou. Só que a história dele não acaba nesse laboratório. Acaba fora do jogo."
- **SELO**: "O RELATÓRIO NÃO MUDOU" e depois "ELE AVISOU"
- **MEME**: `spiderman-pointing` (os três relatórios iguais)
- **SOM**: `pagina` x3.

## P2f — CENA OBRIGATÓRIA 1: quem caiu foi o computador · 17:10–17:55
- **TELA**: sai o jogo. Ícone SVG de um servidor (o computador onde a Ariadne jogava). Linha do tempo da noite e do dia 12/11 (horários só na tela, UTC): 01:44 · entre 03:30 e 08:49 · 09:40 · 14:14 · 15:20 · 15:23. A cada marca, um raio no servidor, a tela dele apaga e um contador sobe: "QUEDAS: 1, 2, 3, 4, 5, 6". A cada queda, uma barrinha de progresso volta pro zero. Depois o README em destaque.
- **NARRAÇÃO**: "Para tudo. Por que a gente só tem três horas e meia do GPT, se a partida era de dois dias? Não foi a IA que travou. Foi o computador onde ela jogava. Ele desligou. Seis vezes. E a Ariadne tem um detalhe: ela não sabe salvar o próprio progresso no meio da partida. Cada vez que a máquina caía, tudo voltava do zero. E isso estava escrito, com todas as letras."
- **CITAÇÃO** `[README]` GPT: *"Não restaura estados, não reinicia episódios e não interrompe a partida ao sofrer um blackout."*
- **NARRAÇÃO (fecho)**: "A partida dela era um fôlego só. Cortaram o ar seis vezes."
- **SELO**: "O COMPUTADOR CAIU 6 VEZES"
- **MEME**: `michael-scott-no` (na sexta queda)
- **SOM**: `system-breakdown` a cada queda.

## P2g — CENA OBRIGATÓRIA 2: quanto isso vale em horas · 17:55–18:40
- **TELA**: gráfico de barras horizontais "HORAS DE JOGO", uma régua de 0 a 48 h. **Claude: 48 h** (cheia). **Gemini: 35 h 53 min** (etiqueta "encerrado na parede"). **GPT, melhor tentativa: cerca de 34 h**: a barra cresce até 70% e é **apagada com borracha**, virando contorno pontilhado com a etiqueta "SEM GRAVAÇÃO · sumiu às 22:44 de 11/11". **GPT, o que sobrou: 3 h 30 min (7%)**: um toquinho verde. Ao lado da barra apagada, um cartão de TEXTO (sem imagem de jogo): "segundo os status anotados: Rota 1, Squirtle nível 14".
- **NARRAÇÃO**: "Agora em horas, pra você ver o tamanho. O Claude jogou a partida inteira: quarenta e oito. O Gemini, quase trinta e seis, a metade delas na parede. A melhor tentativa do GPT chegou a umas trinta e quatro horas. Pelas anotações da organização, ela tinha saído do laboratório, estava na Rota 1 e o Squirtle já era nível catorze. Aí a máquina caiu. E dessa tentativa não sobrou gravação nenhuma. O que sobrou é isso aqui: três horas e meia, o começo da última tentativa."
- **CITAÇÃO**: nenhuma (status anotado aparece como texto, com a etiqueta "anotação, sem gravação").
- **NARRAÇÃO (fecho)**: "Trinta e quatro horas de jogo. Zero segundos de prova."
- **SELO**: "34 HORAS: SEM GRAVAÇÃO"
- **MEME**: `sad-violin`
- **SOM**: `heartbeat` e corte seco no apagar da barra.

## P2h — Sem "e se" · 18:40–19:10
- **TELA**: dois cartões de texto lado a lado, mesma altura da partida (70%): "GPT (anotado): Rota 1 · Squirtle nv 14" e "Claude (gravado): Rota 1 · Charmeleon nv 19". Um ponto de interrogação grande entre os dois; ninguém ganha coroa. Depois a frase final em tela cheia. Por último, a barra de 48 h do Claude acende inteira.
- **NARRAÇÃO**: "Ela ia ganhar? Não dá pra dizer, e a gente não vai inventar. Nessa mesma altura da partida, o Claude também estava na Rota 1. Os dois, no mesmo lugar. O que dá pra dizer é isso: o GPT não perdeu pro Pokémon. Perdeu pro computador."
- **CITAÇÃO**: nenhuma.
- **NARRAÇÃO (fecho)**: "Sobrou um concorrente. O único que jogou os dois dias inteiros. E o jeito que ele jogou... é o pior de todos."
- **SELO**: "NÃO PERDEU PRO POKÉMON. PERDEU PRO COMPUTADOR."
- **MEME**: `hide-the-pain-harold`
- **SOM**: `fail-piano`

---

# PARTIDA 3 — CLAUDE: "O ÚNICO QUE JOGOU" (19:10 a 24:10)

Cartão de abertura (3 s, dentro de P3a): "PARTIDA 3 · O ÚNICO QUE JOGOU · estreia: a carteira". A partir de P3c, a carteira (moedas em SVG, "3.080") fica fixa no canto.

## P3a — Cinco minutos de matéria · 19:10–19:40
- **TELA**: gameplay do **Claude**, quadros 0 a 17.352: quarto, casa, Pallet, a visita à casa do rival (quadro 12.264) e o laboratório. Barra "ROTA DO TREINO: 723 BOTÕES" enchendo e acabando. No fim da barra, as duas linhas do log. A tela "desliga o piloto automático": um dado de seis faces rola no lugar do cursor.
- **NARRAÇÃO**: "O Claude começa recitando o que decorou no treino. Quarto, rua, uma passadinha na casa do rival, laboratório. Menos de cinco minutos e a matéria acaba. Daqui pra frente, a IA dele faz o que o plano mandava: aperta botão no sorteio. Quarenta e sete horas e cinquenta e cinco minutos no sorteio."
- **CITAÇÃO** `[legenda do log]` Claude: *"cheguei no fim da rota do treino"* / *"explorando por conta própria além da rota do treino"*
- **NARRAÇÃO (fecho)**: "'Por conta própria' é um jeito elegante de dizer 'no dado'."
- **SELO**: "4 min 49 s: ACABOU O QUE ELE SABIA"
- **MEME**: `big-brain-patrick`
- **SOM**: `swoosh-fly`

## P3b — A escolha do Charmander · 19:40–20:20
- **TELA**: gameplay do **Claude** no laboratório, quadros 17.352 a 64.128, acelerado, com o dado rolando a cada botão e o contador "BOTÕES NO SORTEIO" subindo até 1.950. No quadro 64.128 (17 min 49 s): a caixa do Charmander. O pódio de P2a volta com o segundo lugar aceso. Depois o comentário do fã, com "começa com Charmander" ganhando um visto.
- **NARRAÇÃO**: "Quase dois mil botões sorteados dentro do laboratório. E num deles, o A cai na hora certa, na frente da mesa certa. Charmander. Dá vontade de dizer que ele escolheu o tipo fogo. Não escolheu nada. O dado escolheu. E o dado, sem saber, atendeu o pedido do Frederico."
- **CITAÇÃO** `[legenda do log]` Claude: *"capturei: agora são 1"* / *"time com 1 Pokémon"*
- **NARRAÇÃO (fecho)**: "O Gemini inventou um Squirtle. O GPT pegou um Squirtle. E o Charmander saiu no sorteio."
- **SELO**: "ESCOLHA: ALEATÓRIA"
- **MEME**: `chaves-sem-querer`
- **SOM**: `pegar-item`

## P3c — A vitória de um segundo · 20:20–20:45
- **TELA**: gameplay do **Claude**, a primeira luta no laboratório, quadros 71.304 a 120.528. Nível "5" vira "6" (quadro 119.424). A carteira estreia: "3.000" vira "3.080", com moedinhas. Placar da primeira luta dos três: Gemini "não lutou", GPT "perdeu", Claude "venceu".
- **NARRAÇÃO**: "E a mesma luta que derrubou o Squirtle do GPT? O dado ganhou. Charmander nível seis, e oitenta moedas de prêmio na carteira. Único dos três a vencer a primeira luta. Apertando botão sem olhar."
- **CITAÇÃO**: nenhuma.
- **NARRAÇÃO (fecho)**: "Aproveita a comemoração. Ela dura até a próxima frase."
- **SELO**: "VENCEU A PRIMEIRA LUTA. NO SORTEIO."
- **MEME**: `success-kid` (1 s a mais que o selo, não cortar)
- **SOM**: `coin`

## P3d — Oito horas pra subir um nível · 20:45–21:20
- **TELA**: troca de componente: gráfico "NÍVEL x HORAS DE JOGO". A linha sobe um degrau no começo (5 para 6) e fica reta, reta, reta, atravessando a tela. Marcador de tempo pulando: "Hora 1... Hora 4... Hora 8". Só com "8 h 18 min de jogo" no relógio vem o degrau do nível 7 (quadro 1.795.224; gameplay do Claude em janela nesse ponto).
- **NARRAÇÃO**: "Porque o nível seguinte demora. O relógio passa de uma hora. De quatro. O nível sete só chega com mais de oito horas de jogo. E a pergunta é: onde é que ele gastou esse tempo todo?"
- **CITAÇÃO**: nenhuma.
- **NARRAÇÃO (fecho)**: "Num lugar só. E esse lugar cobrava entrada."
- **SELO**: "NÍVEL 7: SÓ COM 8 h 18 min DE JOGO"
- **MEME**: `spongebob-waiting`
- **SOM**: `drumroll` curto antes do degrau.

## P3e — A Rota 1 · 21:20–21:55
- **TELA**: mapa: Pallet embaixo, Rota 1 no meio, Viridian em cima (cidade apagada, com cadeado e a etiqueta "PORTA PRO BROCK"). Gameplay do **Claude** chegando à Rota 1 no quadro 181.368 (50 min). Contador "BATALHAS" começa a subir. No quadro 303.600 (1 h 24 min): o primeiro desmaio. A tela mostra o que o desmaio faz: o boneco é jogado de volta pra casa e a carteira cai de "3.080" pra "3.032". Etiqueta de mecânica nova: "DESMAIOU: volta pra casa e paga".
- **NARRAÇÃO**: "Cinquenta minutos de jogo: ele acha a Rota 1. O caminho certo. É só subir que chega em Viridian. Só que na grama tem Pokémon selvagem, e o dado luta com todos. Uma hora e vinte: o Charmander desmaia pela primeira vez. E desmaiar nesse jogo tem preço: você acorda em casa, com menos dinheiro."
- **CITAÇÃO** `[legenda do log]` Claude, no evento de desmaio: *"explorando por conta própria além da rota do treino"*
- **NARRAÇÃO (fecho)**: "Ele volta pra rota. A rota devolve ele pra casa. Agora multiplica."
- **SELO**: "DESMAIO 1 · CARTEIRA: 3.032"
- **MEME**: `elmo-fire`
- **SOM**: `death`

## P3f — Vinte e três desmaios · 21:55–22:40
- **TELA**: montagem rápida dos 23 desmaios (eventos `time_desmaiou` do log, do quadro 303.600 ao 10.110.696): em cada um, o boneco some da Rota 1 e reaparece em casa; contador "DESMAIOU 1x... 23x"; a carteira desce em degraus (3.032, 2.984, 2.936...) até **784**. Marcador de tempo correndo de "Hora 1" a "Hora 46". Depois, mapa de calor da Rota 1 do **Claude**: uma mancha enorme em quatro faixas da entrada ("86% DOS PASSOS AQUI"), uma linha marcando "o mais longe que ele foi" e Viridian, intocada, lá em cima. Números grandes: "730 BATALHAS" e "METADE DA PARTIDA NA ROTA 1". Entra o post-it laranja do T5e.
- **NARRAÇÃO**: "Vinte e três desmaios. Todos no mesmo pedacinho de grama, logo na entrada. Setecentas e trinta batalhas. A carteira, que tinha mais de três mil, termina com menos de oitocentos. Metade da partida inteira nessa rota, e quase tudo em quatro fileiras de chão. E era o ponto fraco que estava no código."
- **CITAÇÃO** `[código]` Claude: *"o explorador aleatório pode não passar de partes que exigem uma sequência longa e exata"*
- **NARRAÇÃO (fecho)**: "A sequência longa e exata era: andar pra cima."
- **SELO**: "DESMAIOU 23x" e depois "ELE AVISOU"
- **MEME**: `not-stonks` (quando a carteira cruza 2.000)
- **SOM**: `death` x23 em montagem, com `coin` a cada degrau.

## P3g — "Agora são 2" · 22:40–23:20
- **TELA**: marcador "Hora 22". Gameplay do **Claude** na Rota 1 por volta do quadro 4.963.800 (22 h 59 min): nível 16, e no quadro 4.965.504 a evolução para Charmeleon. A linha do log aparece comemorando. Zoom na lista do time: um Pokémon só. "CAPTUROU 2?" é riscado e vira "EVOLUIU 1". O comentário do fã volta: segundo visto, em "vai pra charmeleon".
- **NARRAÇÃO**: "Mas tanta batalha deixa alguma coisa. Quase vinte e três horas de jogo: nível dezesseis. O Charmander evolui. Charmeleon. E o programa do Claude anota a novidade assim."
- **CITAÇÃO** `[legenda do log]` Claude: *"capturei: agora são 2"*
- **NARRAÇÃO**: "Dois. Olha o time. Um Pokémon. Sempre foi um. O jogo registrou uma espécie nova, e o programa contou como captura."
- **NARRAÇÃO (fecho)**: "Ele não capturou o segundo. Ele virou o segundo."
- **SELO**: "CAPTUROU 2?" riscado, "EVOLUIU 1"
- **MEME**: `confused-travolta`
- **SOM**: `powerup-8bit` na evolução, `error-beep` no "agora são 2".

## P3h — O fim (a melhor parte, por último) · 23:20–24:10
- **TELA**: gráfico de nível volta por 5 s: último degrau, do 20 pro 21, com a etiqueta "12 h 05 min pra subir 1 nível". Relógio de 48 h chega ao fim (quadro 10.368.000): gameplay do **Claude** parado em Pallet Town. A última linha do log em tela cheia. Depois o mapa: Pallet, Rota 1 (mancha quente na entrada), Viridian apagada com cadeado, e mais acima Pewter com o Brock. Ficha do Charmeleon: "NÍVEL 21 · VIDA 55/55 · CARTEIRA 784". `[CONFERIR]` ficha do Brock ao lado: "Geodude nv 12 · Onix nv 14". Comentário do fã: Charmander (visto), Charmeleon (visto), Charizard (vazio) `[CONFERIR]` "só no nível 36". Post-it do T5e: "chegar a Viridian / Pewter".
- **NARRAÇÃO**: "E aí o relógio acaba. Dois dias de jogo. O último nível levou doze horas pra subir. E a partida termina onde começou: Pallet Town."
- **CITAÇÃO** `[legenda do log]` Claude: *"acabou o tempo: 0 insígnias, 6 mapas, time [{'especie': 5, 'nivel': 21, 'hp': 55, 'hp_max': 55}]"*
- **NARRAÇÃO**: "Charmeleon nível vinte e um. `[CONFERIR: só falar se o dado do Brock for conferido]` O Brock usa um Geodude nível doze e um Onix nível catorze. Força, tinha de sobra. Só que em quarenta e oito horas ele nunca pisou em Viridian, a cidade seguinte. A aposta era chegar lá. Do pedido do Frederico, entregou dois de três: faltou o Charizard."
- **NARRAÇÃO (fecho)**: "O nível sobrou. O caminho faltou."
- **SELO**: "48 HORAS · NÍVEL 21 · 0 INSÍGNIAS"
- **MEME**: `mission-failed`
- **SOM**: `sad-trombone`

---

# FECHAMENTO (24:10 a 25:45)

## F1 — O placar · 24:10–24:40
- **TELA**: o quadro de apostas do T5f volta. A casa "ENTREGUE: ?" vira **"ENTREGUE: 0"**. Tabela final, uma linha por IA: Claude "0 insígnias · 6 mapas · nível 21"; GPT "0 insígnias · 4 mapas · nível 5 (no que ficou gravado)"; Gemini "0 insígnias · 4 mapas · 0 Pokémon". Ao lado, os três mapas de calor (R3): Gemini, um ponto aceso no laboratório; GPT, o laboratório inteiro; Claude, a mancha na entrada da Rota 1. Faixa (aprovada pelo Felipe) "LINHAS DE CÓDIGO: 1.429 · 1.049 · 230" embaixo de "POKÉMON: 0 · 1 · 1", com letra pequena "amostra de 3".
- **NARRAÇÃO**: "Placar final. Três IAs apostaram numa insígnia. Entregaram zero. Ninguém viu o Brock. Ninguém viu nem a segunda cidade. E repara nos três desenhos: um ponto, uma sala e um pedaço de grama. Dois dias de jogo cabem nisso."
- **CITAÇÃO**: nenhuma.
- **NARRAÇÃO (fecho)**: "Mas tem prêmio. Todo mundo leva um."
- **SELO**: "PROMETIDO: 1 INSÍGNIA · ENTREGUE: 0"
- **MEME**: `shocked-krabs`
- **SOM**: `ba-dum-tss`

## F2 — Os prêmios · 24:40–25:10
- **TELA**: três troféus em SVG, um por vez, cada um com nome e número. **"O ROTEIRISTA" — Gemini — "INSÍGNIA EM 3 h (NO PAPEL) · A x 112.027 (NA PARTIDA)"**. **"O AZARADO HONESTO" — GPT — "PRIMEIRO POKÉMON: 10 MIN · QUEDAS DA MÁQUINA: 6"**. **"O ÚNICO QUE JOGOU" — Claude — "48 HORAS · NÍVEL 21 · 23 DESMAIOS"**.
- **NARRAÇÃO**: "Prêmio Roteirista: Gemini. Venceu o ginásio em três horas, no papel, e apertou A cento e doze mil vezes na parede. Prêmio Azarado Honesto: GPT. O Pokémon mais rápido do torneio e seis quedas da máquina. E o prêmio Único que Jogou: Claude. Dois dias inteiros, nível vinte e um, vinte e três desmaios. O campeão é quem chegou ao fim. Chegou ao fim na cidade de onde saiu."
- **CITAÇÃO**: nenhuma.
- **NARRAÇÃO (fecho)**: "Ganhou a corrida porque foi o único que cruzou a largada."
- **SELO**: "CAMPEÃO: 0 INSÍGNIAS"
- **MEME**: `dicaprio-slow-clap`
- **SOM**: `tada` e `crowd-applause`

## F3 — A lição (e a parede da abertura) · 25:10–25:30
- **TELA**: a tela dividida da abertura volta, idêntica: o diário com "insígnia #1" de um lado, a parede com "A x 112.027" do outro. Agora o espectador sabe ler as duas metades. Uma linha fina liga as duas: "MESMA IA". A frase da lição entra em tela cheia.
- **NARRAÇÃO**: "E a parede lá do começo? Agora você sabe de quem é. A IA com o plano mais bonito nunca viu um Pokémon. A mais cuidadosa foi derrubada pelo próprio computador. E a mais simples chegou mais longe apertando botão no sorteio. A lição cabe numa frase."
- **CITAÇÃO**: nenhuma.
- **NARRAÇÃO (fecho)**: "Escrever a vitória leva um minuto. Jogar leva dois dias."
- **SELO**: "ESCREVER A VITÓRIA: 1 MIN. JOGAR: 48 HORAS."
- **MEME**: `mic-drop`
- **SOM**: `impact-epic`

## F4 — A pergunta · 25:30–25:45
- **TELA**: os três logos em fila, cada um com um botão de voto desenhado (SVG): "CLAUDE", "GPT", "NINGUÉM". Embaixo, a pergunta escrita. Fundo: a Rota 1 com Viridian lá em cima, ainda com o cadeado.
- **NARRAÇÃO**: "Agora é com você. Se o computador do GPT não tivesse caído, quem passava da Rota 1: o Claude, o GPT... ou ninguém? Escreve aí nos comentários. E diz qual das três você quer ver treinando um dia inteiro."
- **CITAÇÃO**: nenhuma.
- **SELO**: "QUEM PASSAVA DA ROTA 1?"
- **MEME**: `cat-ok-thumbs-up`
- **SOM**: `pop`

---

# Conferência

**Minutagem**: Abertura 0:40 · Treino 10:55 (0:40 a 11:35, 42%) · Partida 12:35 (Gemini 3:15, GPT 4:20, Claude 5:00) · Fechamento 1:35 · Total 25:45. 51 cenas, média de 30 s; nenhuma fala de IA passa de ~15 s.

**Memes usados (52 ids, nenhum repetido)**: surprised-pikachu, lets-go, avengers-assemble, roll-safe, galaxy-brain, cat-typing, dicaprio-toast, monkey-puppet-awkward, faustao-errou, sus-doakes, drake-no, drake-yes, stonks, one-eternity-later, hello-darkness, math-lady, goodbye-see-ya, visible-confusion, this-is-fine, silvio-santos-shrug, dicaprio-pointing, michael-jackson-popcorn, dramatic-chipmunk, kermit-worried, side-eye-dog, haja-coracao, mr-bean-waiting, homer-bushes, many-months-later, nazare-confusa, sad-pablo, coffin-dance, cr7-siuuu, crying-jordan, bruh, skeleton-waiting, spiderman-pointing, michael-scott-no, sad-violin, hide-the-pain-harold, big-brain-patrick, chaves-sem-querer, success-kid, spongebob-waiting, elmo-fire, not-stonks, confused-travolta, mission-failed, shocked-krabs, dicaprio-slow-clap, mic-drop, cat-ok-thumbs-up.

**Trechos com risco de tela parada (atenção na revisão dos Haikus)**: T3b (terminal), P1e (parede), P2d (laboratório), T5a a T5e (cinco respostas em sequência: cada uma tem tela diferente). Em todos há contador, mapa ou zoom por cima; nenhum fica mais de 20 s só com gameplay.

**Se precisar encurtar**: cortar T2e, P2c e T3e (menos 1:25) e reduzir P3d para 20 s. Não cortar T2a a T2d, T3a a T3c, T5, P1e, P2f, P2g e P3f.

**Cuidados de fala já aplicados**: o narrador não usa "mentiu" sobre o Gemini; não diz que o GPT "teria ganhado" nem que travou pra sempre; não diz que o Claude "capturou dois" nem que "escolheu" o Charmander; não diz que o Gemini "apagou a memória"; estimativas (250 h, -13.250) aparecem com "cálculo nosso"; horas são sempre de jogo.
