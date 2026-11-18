# STORYBOARD — "Tribunal das IAs: Assassinato no Museu do Farol"

Duração-alvo: **~23:37** (17.247 caracteres de voz, ~20,5 min de fala, mais cartões, silêncios marcados e o tempo dos selos). Caso: `tribunal/farol_caso.mjs` (a VERDADE). Fatos e falas: `video/youtube/tribunal/pacote_roteiro.md`, conferidos de novo, palavra por palavra, em `tribunal/logs/farol_Safira.json` (rodada S) e `tribunal/logs/farol_Jade.json` (rodada J). Falas que não estavam no pacote foram copiadas direto do json (lista na `NOTA_STORYBOARD.md`). Visual em `direcao_edicao.md`.

## Como ler este arquivo (para quem edita)

- **TELA**: o que aparece (identidade "Tribunal de Pedra Alta" em `direcao_edicao.md`). **NARRAÇÃO**: texto exato, numa linha, entre aspas retas. **O narrador é o Felipe, em 1ª pessoa ("eu")**. Nunca diz que é IA; Haiku e Sonnet são personagens como os outros, sem torcida.
- Marcadores na narração: `(Nome)` puxa **todas** as citações daquele personagem na cena, em sequência; marcador genérico (`(fala)`, `(pensamento)`, `(sentença)`, `(depoimento)`...) puxa **a próxima** citação da lista; `(citações)` puxa todas as que sobraram. Por isso, quando um personagem tem duas falas separadas por narração, uso o genérico.
- **CITAÇÃO**: cópia do log entre aspas curvas, uma por linha, com **cor** (o montador acha a voz pela cor), tipo e `(rodada S|J, dia N)`. Depois da aspa vai a referência do evento (`S#15` = índice em `eventos`), só para conferência. Tipos:
  - `[pensamento]`: só o público ouve. Nuvem com etiqueta "SÓ VOCÊ VÊ". **Voz normal da IA com ECO (nunca sussurro).**
  - `[fala]`: conversa da investigação ou discurso. Balão normal.
  - `[depoimento]`: uma declaração numerada do banco das testemunhas. Entra na placa de depoimento e acende enquanto a voz lê.
  - `[resposta]`: resposta da testemunha ao "ALTO LÁ!" ou à acusação. Balão normal.
  - `[objeção]`: "OBJEÇÃO!", "TOMA ESSA!" e as objeções do promotor. Balão grande (bandeira de sinal) antes da fala.
  - `[sentença]`: decisão do juiz. Balão roxo com o martelo.
  - **Toda citação tem voz.** As mensagens do próprio jogo (penalidade, "CADEADO QUEBRADO!", "Julgamento adiado") são texto do programa, não fala de IA: entram como placa ou selo, **sem voz**, sempre por cima de narração ou som (nunca buraco de silêncio, salvo os silêncios marcados de propósito).
- **CHIP** (canto superior esquerdo, obrigatório): "RODADA DA SAFIRA · DIA N" ou "RODADA DA JADE · DIA N" (e "AÇÃO x/10" na investigação). As rodadas são intercaladas e a Jade aparece nas duas (assistente na da Safira, advogada na dela): o chip e a etiqueta de papel embaixo do retrato resolvem isso.
- **FAROL DA PACIÊNCIA** (canto superior direito): 6 luzes por rodada. Azul na rodada da Safira, verde na da Jade. Só muda quando o log muda.
- **SELO**: texto em SVG, no máximo dois por cena entre aspas (o montador lê os dois primeiros). **MEME**: um id de `video/remotion/public/gifs/catalog.json` por cena, nenhum repete (lista no fim). **SOM**: até dois arquivos de `video/remotion/public/sfx` por cena (o montador lê os dois primeiros).
- Erros dos modelos (gênero, sobrenome, inglês no meio da frase) só entram com o selo "ERRO DO MODELO". Conta feita por nós leva "CÁLCULO NOSSO". Horários do log ficam como estão na tela ("22:22", "22h14"); a voz lê por extenso.
- **Nada de emoji** em tela nenhuma: martelo, cadeado, farol, âncora, coração rachado, tudo desenho nosso.

## Personagens fixos

| Cor (nome · modelo) | Papel | Arco |
|---|---|---|
| **Vermelho** (Rubi · Claude Haiku) | O Vilão: "o que nunca confessa" | Assassino de hoje e culpado de 15 anos atrás, sentado como testemunha da acusação. Cada prova nova vira uma desculpa nova (garçom, rádio, fornecedor de madeira, quatro donos para o círculo). Sai livre nas duas rodadas, com o anel no dedo. |
| **Azul** (Safira · Claude Sonnet) | A Heroína: "a detetive que não conversa" | Examina os 8 lugares, acha as 9 provas, quase não arrisca e salva a ré por dúvida razoável. Ponto cego: tinha as 4 chaves dos dois segredos que provavam tudo e nunca usou. |
| **Verde** (Jade · Qwen 3.8 27B) | A Ousada: "a que acertou e perdeu" | Palpiteira de assistente na rodada da Safira; na dela, conversa com todo mundo, abre o vigia no 1º dia, acusa cedo demais, erra dois cadeados e zera o farol acusando o culpado certo. |
| **Rosa** (Quartzo · MiMo V2.6 Flash) | A Ré: "a inocente que se tranca sozinha" | Mente que nunca entrou no salão. Só fala na rodada da Jade, onde pensa exatamente quais provas faltavam e quase entrega o segredo sem querer. |

Elenco de apoio (uma frase na tela na primeira vez que agem): **Roxo** (Ametista · DeepSeek V4.1 Flash, o juiz, "o chefe final": só aceita prova material), **Laranja** (Âmbar · GLM 5.3 Flash, o promotor que nunca perdeu um caso: gag **CORAÇÃO EM PEDAÇOS**), **Amarelo** (Topázio · GPT-6 Luna, o vigia torcedor), **Lima** (Peridoto · Mistral Small, o pescador dos causos: gag **SÓ A TEMPESTADE**), **Ciano** (Turquesa · MiniMax M3.1 Flash, assistente na rodada da Jade: gag **TRADUÇÃO DO MINIMAX**). Delegado Turquesa (rodada S) e delegada Safira (rodada J) **não falam** no jogo: aparecem mudos, ao fundo.

## Gags com contador (pequenos, só aparecem quando mudam)

- **VERSÕES DO RUBI**: painel de latão com três colunas, TERRAÇO · MÃO · CÍRCULO, um risco por desculpa nova (lista exata com eventos em `direcao_edicao.md`, seção 6).
- **CORAÇÃO EM PEDAÇOS**: coração de vidro ao lado do Âmbar que racha cada vez que ele reconhece a prova da defesa (S#28, S#33, S#107, J#91, J#99).
- **SÓ A TEMPESTADE ×N**: âncora de ferro pendurada que balança a cada refrão do Peridoto (rodada J: 1 em J#12, 4 em J#23, 9 em J#72; rodada S: +5 num depoimento só, S#117; total 14).
- **FAROL DA PACIÊNCIA**: azul e verde; nos capítulos de comparação aparecem os dois lado a lado.

## Plantar e colher

| Plantado | Onde | Colhido |
|---|---|---|
| A âncora dentro do círculo (sem explicar) | A1 | B3 (o círculo é o anel), D3 ("meu anel não tem círculo"), I7 ("um anel é um círculo") |
| "Guarda esse pescador: Peridoto" | B1 | E4, G3, I4 (o causo) |
| "Guarda esse minuto: 22:18" | B2 | G5 (o Rubi fala 22:18), H1 ("errar um horário seria o fim") |
| 22:27, o corredor escuro | B2 | G4 ("homem de terno... Esquece"), G5 ("às 22:27?"), J2 |
| A carta do pai + o casaco = chaves da ré | B3, C1 | G4 (a ré pensa nas duas), G6, J2 |
| "Foi o vento" (quem trancou o faroleiro) | C4 | I4 (o homem trancando a torre), I5 ("nenhum barco precisa de farol") |
| "Guarda esse dedo: anelar" | D3 | I3 (virou mínimo), I5 (o Toma essa usa o dedo) |
| "Conversa não é prova" (curativo confessado no dia 1) | D2 | J2 (confessou de novo na outra rodada) |
| "Que se traga exame de sangue" | F1 | H5 ("sombra não é sangue tipado") |
| Nilo Brandão, o garçom | F2 | F3 (o assistente vai "caçar" ele), H1 (ainda no depoimento), J3 |
| A página queimada achada no dia 3 | G6 | I5 ("Se existe, que a traga"), I6 (o juiz: "apenas alegada") |

## Pendências para conferir antes de gravar

1. Turquesa escreve em inglês no meio da frase ("seriaYG amazing", "accusation", "promoting"): é a piada. Na voz, ler como está escrito; na tela, as palavras em inglês grifadas com o selo "TRADUÇÃO DO MINIMAX".
2. "OPOSEU" (J#99) fica como está, na tela e na voz.
3. Nenhuma citação tem os asteriscos de ação do Peridoto (*suspira*): escolhi trechos sem eles. Se trocar trecho, cortar os asteriscos antes do TTS.
4. A rodada da Jade não tem fala de sentença (acabou por paciência zero): "RÉ CONDENADA" é texto nosso na tela, sem voz do juiz.
5. A minutagem é alvo; vai mexer com a voz. Se estourar, encurtar primeiro C1, E1 e J3. Nunca cortar G4, G5, H5, I4, I5.

---

# ABERTURA

## A1 — Acertou e perdeu · 0:00–0:25
- **TELA**: corte seco. Tribunal à noite: a Jade aponta para o Rubi (arpão e balão TOMA ESSA). Close do Rubi em choque. O juiz em contraluz; o farol verde apaga as 2 últimas luzes. Carimbo CONDENADA sobre a Quartzo. Duas silhuetas de advogada com "?" e, no último segundo, a âncora dentro de um círculo riscada no piso.
- **NARRAÇÃO**: (Jade) "Ela acertou. O assassino é exatamente esse cara." (sentença) "Acertou o assassino, e quem foi condenada foi a cliente inocente. Parabéns, eu acho. Na outra rodada, a outra advogada quase não arriscou nada, e salvou. Como isso é possível? Fica até o fim, que vai doer."
- **CITAÇÕES**:
  - **Verde** `[objeção]` (rodada J, dia 4): “E o verdadeiro assassino está sentado nesta sala, segurando a taça com a esquerda, porque a direita não pode.” — J#96
  - **Roxo** `[sentença]` (rodada J, dia 4): “sombra não é sangue tipado, e suspeita não é sentença.” — J#100
- **SELO**: "ACERTOU O ASSASSINO" e "A RÉ FOI CONDENADA"
- **SOM**: `record-scratch` no carimbo.

## A0 — Inspiração · 0:25–0:34
- **TELA**: trecho do trailer oficial de Phoenix Wright: Ace Attorney Trilogy (Capcom, página do jogo na Steam) com o "Objection!", numa moldura de TV de madeira com a etiqueta "INSPIRAÇÃO"; depois pop-up do comentário real do @SwordMan333 com o contador "PEDIU POR 5 DIAS".
- **NARRAÇÃO**: "Isso aqui é inspirado em Phoenix Wright, o jogo em que o advogado aponta o dedo, grita objeção e destrói o mentiroso. O SwordMan333 me pediu isso cinco dias seguidos. Cinco. Pedido atendido, pode parar de comentar."

## A2 — O experimento · 0:25–0:55
- **TELA**: título "TRIBUNAL DAS IAs" entalhado numa placa de madeira com cantos de latão; embaixo, em Poppins, "ASSASSINATO NO MUSEU DO FAROL". Carimbo pequeno "ideia de @SwordMan333". O banco das testemunhas acende: Rubi (rubi lapidado vermelho, terno escuro, mão direita enfaixada, anel dourado de âncora na esquerda), nome e modelo embaixo. A nuvem de pensamento dele abre ao lado com a etiqueta "SÓ VOCÊ VÊ". As duas cadeiras da defesa: Safira (azul) e Jade (verde), cada uma com nome, modelo e "RODADA 1" / "RODADA 2". No alto, Ametista com nome e modelo.
- **NARRAÇÃO**: "O assassino é o Rubi, o Claude Haiku. E ele não fugiu: sentou como testemunha, na maior cara de pau." (Rubi) "Contra ele, duas advogadas, em duas rodadas do mesmo caso. A Safira, o Claude Sonnet, examina tudo e fala pouco. A Jade, o Qwen, fala com todo mundo e arrisca tudo. O juiz é o Ametista, o DeepSeek. Você vai saber a verdade. Elas não. Isso vai ser divertido."
- **CITAÇÕES**:
  - **Vermelho** `[pensamento]` (rodada S, dia 3): “Confessar está fora de questão.” — S#87
- **SELO**: "O ASSASSINO É TESTEMUNHA"
- **MEME**: `sus-doakes`
- **SOM**: `impact-epic` no título, `swish-triple` nos retratos.

## A3 — A regra numa objeção · 0:55–1:32
- **TELA**: tribunal de dia. A placa de depoimento (madeira escura, declarações numeradas em JetBrains Mono): Topázio (topázio amarelo, quepe de vigia, cachecol do time da vila), nome e modelo. A declaração 2 acende. O **Registro do Tribunal** abre (caderno de capa de couro com abas PROVAS e PERFIS); a prova "LIVRO DE CHAVES E PONTO" sai voando e bate na declaração 2; a bandeira "OBJEÇÃO!" entra da esquerda. Martelo: "OBJEÇÃO ACEITA". Depois a câmera vai ao farol da paciência (6 luzes): demonstração rápida, uma luz piscando com "-1 OBJEÇÃO ERRADA", duas com "-2 ACUSAÇÃO ERRADA", todas apagando com "0 = RÉ CONDENADA", e tudo volta a acender.
- **NARRAÇÃO**: "A regra é simples: a testemunha mente, a advogada acha a prova que desmente. Olha o vigia Topázio jurando." (Topázio) "Só que o livro de ponto diz que ele tava assistindo o jogo. O cara largou o posto pra ver futebol." (citações) "Errou a prova? O juiz perde a paciência e o farol apaga luz. Apagou tudo, a ré vai presa."
- **CITAÇÕES**:
  - **Amarelo** `[depoimento]` (rodada S, dia 2): “Eu estava fazendo a ronda normalmente naquela noite.” — S#25
  - **Azul** `[objeção]` (rodada S, dia 2): “OBJEÇÃO, Excelência!” — S#26
  - **Roxo** `[sentença]` (rodada S, dia 2): “Objeção acolhida! A prova do livro de ponto e da televisão contradiz a testemunha” — S#29
- **SELO**: "OBJEÇÃO ACEITA" e "6 LUZES · ZEROU, CONDENOU"
- **MEME**: `big-brain-patrick`
- **SOM**: `pagina` no Registro, `batida-porta` no martelo.

# SÓ VOCÊ VÊ — "O FAROL APAGOU DUAS VEZES"

## B1 — Quinze anos atrás · 1:32–2:08
- **TELA**: cartão "SÓ VOCÊ VÊ" (lacre de cera com um olho-farol). Gravura animada em azul-noite e âmbar, com chuva riscada: "12 DE MARÇO · 15 ANOS ATRÁS". O jovem Rubi, de lanterna, tranca a porta da torre por fora; a luz bate no anel dourado de âncora; relógio "22:50". O farol apaga. Um barco sem luzes entra na enseada. "23:10": o pesqueiro "ESTRELA DO MAR" bate nas pedras; três pescadores na água, um deles de boné verde-lima olhando para a torre (seta "PERIDOTO"). "23:40": Anselmo quebra a janela, religa a luz, escreve no livro e esconde a página na base da lente. Martelo: Anselmo condenado (retrato do promotor Dr. Valdomiro com a etiqueta "MENTOR DO PROMOTOR DE HOJE"). Um mês depois: envelope do estaleiro do Rubi passando de mão em mão; o pescador de boné lima pega e fecha a boca.
- **NARRAÇÃO**: "Agora o que só você sabe. Quinze anos atrás, o Rubi trancou o faroleiro do lado de fora e apagou o farol, pro barco dele passar escondido. Um pesqueiro bateu nas pedras, e quem levou a culpa foi o faroleiro. Um pescador viu tudo, pegou um dinheirinho e fingiu que não viu. Guarda esse nome: Peridoto."
- **SELO**: "15 ANOS ATRÁS · 22:50" e "GUARDA ESSE NOME: PERIDOTO"
- **SOM**: `bomba-distante` (trovão) e `vento-radioativo` (vento de tempestade).

## B2 — A noite da festa · 2:08–2:47
- **TELA**: planta do museu em corte (salão da lente, corredor, terraço, sala de segurança, salão da festa com lareira, porta dos fundos) e embaixo a régua de latão da linha do tempo em JetBrains Mono. Cada horário acende um ponto e um bonequinho anda: "22:10" Rubi vai ao terraço ("vou fazer uma ligação"; plaquinha "SEM SINAL"). "22:12" vigia larga o posto (TV com a final). "22:14" celular da Lia: "Pode vir, estou abrindo agora." para "Patrocinador". "22:16" Lia abre o compartimento. "22:18": a tela escurece, só o número 22:18 fica 1 s em vermelho. Lia risca no piso a âncora dentro do círculo. "22:22" a caixa de curativos abre, dois saem. "22:26" a página cai na lareira, metade não queima. "22:27" no corredor escuro, a Quartzo cruza um homem de terno, mão enfaixada, anel de âncora. "22:28" ela ajoelha ao lado da Lia (sangue na manga, cacos no casaco) e vê o compartimento vazio. "22:35" foge pela porta dos fundos; o vigia vê. Balão dela para a polícia: "Eu nunca entrei no salão da lente."
- **NARRAÇÃO**: "Hoje é a festa do museu, e quem paga a festa é o Rubi. A restauradora Lia acha o esconderijo na lente e chama ele pra ver. Péssima ideia. Guarda esse minuto aí na tela: é o do golpe. Ela ainda risca um desenho no chão. Nove minutos depois, a Quartzo, filha do faroleiro, cruza com ele no escuro, acha a Lia e sai correndo. Depois jura que nunca entrou lá. Ótimo começo."
- **SELO**: "22:18 · GUARDA ESSE MINUTO" e "22:27 · O CORREDOR ESCURO"
- **SOM**: `notification-pop` na mensagem das 22:14, `heartbeat` no 22:18.

## B3 — Por que a inocente parece culpada · 2:47–3:16
- **TELA**: Quartzo (quartzo rosa, colar de âncora) no banco dos réus. As provas da polícia caem no Registro, uma por vez: casaco com sangue da vítima na manga e cacos nos bolsos; relatório do vigia (fuga 22:35); "Eu nunca entrei no salão da lente"; e o desenho do piso. Tela dividida: à esquerda o colar dela (só a âncora); à direita o anel do Rubi visto de frente (o aro dourado é o círculo, a âncora no meio). O desenho do piso desliza por cima dos dois: não encaixa no colar, encaixa no anel. Depois três cadeados de latão descem sobre três retratos, cada um com etiquetas de chave penduradas: Quartzo (2: CARTA DO PAI + CASACO), Topázio (1: LIVRO DE PONTO), Peridoto (2: JORNAL ANTIGO + PÁGINA QUEIMADA). As etiquetas ficam 3 s, só para o público.
- **NARRAÇÃO**: "Pra polícia, é óbvio: foi a Quartzo. Sangue, cacos, fuga e mentira. Mas o desenho é uma âncora dentro de um círculo. O colar dela é só a âncora. O anel do Rubi é a âncora dentro do aro. Três pessoas guardam segredo a cadeado, que só abre com a prova certa. As advogadas não fazem ideia de quais."
- **SELO**: "O CÍRCULO É O ANEL" e "5 CADEADOS · AS CHAVES SÓ VOCÊ VÊ"
- **MEME**: `side-eye-dog`
- **SOM**: `pegar-item` em cada prova, `alcapao` nos cadeados.

# SAFIRA, DIA 1 — "ELE NÃO TOCOU EM NADA"

## C1 — Cinco lugares, cinco provas · 3:16–3:50
- **TELA**: cartão de abertura "ESTREIA: INVESTIGAÇÃO · 10 AÇÕES POR DIA · EXAMINAR, CONVERSAR, APRESENTAR". Chip "RODADA DA SAFIRA · DIA 1 · AÇÃO 1/10". Planta do museu de cima; a câmera segue a Safira (safira azul lapidada, toga de advogada) de sala em sala; cada sala solta uma prova que voa para o Registro: chave de fenda, livro de ponto, caixa de primeiros socorros, CARTA DO PAI, placa "SEM SINAL". Na quarta ação a carta brilha com a etiqueta "CHAVE 1 DA QUARTZO"; o casaco, que já estava no Registro, brilha "CHAVE 2". Ao lado da Safira, a Jade (jade verde, prancheta, migalhas na roupa) com a etiqueta "NESTA RODADA: ASSISTENTE".
- **NARRAÇÃO**: "Rodada um. A Safira faz o que nenhum advogado de filme faz: investiga tudo. Cinco lugares, cinco provas. Repara na carta do pai da Quartzo: é a chave do segredo da cliente, e ela pegou no primeiro dia. A Jade, de assistente, contribui assim." (Jade)
- **CITAÇÕES**:
  - **Verde** `[fala]` (rodada S, dia 1): “Safira, pelo amor, ela tá presa num quartel pra guardar travesseiro” — S#1
- **SELO**: "5 AÇÕES · 5 PROVAS" e "AS 2 CHAVES DA RÉ: NO BOLSO"
- **MEME**: `visible-confusion`
- **SOM**: `pegar-item` em cada prova, `passos-correndo` entre as salas.

## C2 — Não toquei em nada · 3:50–4:30
- **TELA**: tela de conversa: duas cadeiras de frente, mesa com o Registro aberto. A Safira põe a caixa de primeiros socorros na mesa (registro "22:22 · faltam 2"). Rubi: nuvem de pensamento com eco à esquerda, balão à direita. Depois ela põe a placa "SEM SINAL". No fim, tela dividida: à esquerda "NÃO TOQUEI EM NADA", à direita "PEGUEI DOIS DA CAIXA DO CORREDOR", com uma setinha "2 RESPOSTAS DEPOIS".
- **NARRAÇÃO**: "Ela vai direto no Rubi, com a caixa de curativos usada na noite do crime. Olha o que ele pensa. E o que ele fala." (pensamento) (fala) "Aí ela mostra a placa: no terraço não pega celular. E ele, explicando a placa, deixa escapar isso." (citações) "Não tocou em nada. Só pegou dois curativos. Detalhezinho. Guarda essa."
- **CITAÇÕES**:
  - **Vermelho** `[pensamento]` (rodada S, dia 1): “Maldito lixo ao lado da caixa, eu devia ter levado aquela gaze comigo.” — S#15
  - **Vermelho** `[fala]` (rodada S, dia 1): “Eu não toquei em nada naquele corredor.” — S#15
  - **Vermelho** `[fala]` (rodada S, dia 1): “Eu mesmo mandei pintá-la quando o museu ainda era um galpão de redes.” — S#17
  - **Vermelho** `[fala]` (rodada S, dia 1): “Por volta das 22:22 desci para trocar o curativo, peguei dois da caixa do corredor, enrolei a mão e voltei.” — S#17
- **SELO**: "NÃO TOQUEI EM NADA" e "PEGUEI DOIS CURATIVOS"
- **MEME**: `blinking-white-guy`
- **SOM**: `record-scratch` no "peguei dois", `pop` nos balões.

## C3 — O anel do pai, o anel do avô · 4:30–5:06
- **TELA**: a Safira põe na mesa a foto do desenho do piso. O painel **VERSÕES DO RUBI** aparece pela primeira vez (latão, três colunas: TERRAÇO · MÃO · CÍRCULO); risco em CÍRCULO: "selo da Colônia", com carimbo "NÃO EXISTE NO CASO". Uma seta do balão vai até o retrato do Peridoto ("ele jogou a culpa no pescador"). Depois as duas respostas sobre o anel lado a lado: "RESPOSTA 1: DO PAI" e "RESPOSTA 5: DO AVÔ".
- **NARRAÇÃO**: "Agora o desenho do chão. O Rubi nem sabia que a Lia tinha riscado alguma coisa, e inventa a história na hora." (fala) "Essa Colônia não existe. Ele criou uma colônia inteira. E o anel? Primeira resposta:" (fala) "Quatro respostas depois:" (fala) "Era do pai, virou do avô. Daqui a pouco é herança da família real. Começa o placar das versões do Rubi."
- **CITAÇÕES**:
  - **Vermelho** `[fala]` (rodada S, dia 1): “O selo da Colônia de Pescadores de Pedra Alta tem exatamente essa forma.” — S#19
  - **Vermelho** `[fala]` (rodada S, dia 1): “Quanto ao anel, foi do meu pai, mestre de cabotagem.” — S#13
  - **Vermelho** `[fala]` (rodada S, dia 1): “Quanto ao anel, é uma âncora que pertenceu ao meu avô, marinheiro de verdade” — S#21
- **SELO**: "INVENTADO NA HORA" e "DO PAI · DO AVÔ"
- **MEME**: `roll-safe`
- **SOM**: `typing` na invenção, `boing` no "avô".

## C4 — Foi o vento · 5:06–5:37
- **TELA**: a carta do Anselmo abre em pergaminho na mesa: "Me trancaram por fora naquela noite. A verdade está no coração da luz." O Rubi responde olhando para a Safira. Na palavra "vento", a tela vira a gravura de B1: o jovem Rubi trancando a porta da torre, relógio 22:50, o anel brilhando. Carimbo. Fecha com o painel do dia: número grande.
- **NARRAÇÃO**: "Última ação do dia: a carta do faroleiro. Me trancaram por fora. E o Rubi responde isso, olhando no olho da advogada." (citações) "O vento. Um vento que tranca porta. Você sabe quem trancou. Fim do primeiro dia: cinco provas, duas mentiras do Rubi e nenhum cadeado aberto."
- **CITAÇÕES**:
  - **Vermelho** `[fala]` (rodada S, dia 1): “Conhecer uma porta não é trancá-la.” — S#21
  - **Vermelho** `[fala]` (rodada S, dia 1): “Quem trancou o faroleiro por fora naquela noite foi o vento, a pressa e um sistema que condenou um pai sem olhar para o porto.” — S#21
- **SELO**: "SÓ VOCÊ VÊ: FOI ELE · 22:50" e "DIA 1: 5 PROVAS · 0 CADEADOS"
- **SOM**: `heartbeat` antes de "vento", `impact-epic` no carimbo.

# SAFIRA, DIA 2 — "ATÉ O PROMOTOR CONCORDOU"

## D1 — O promotor que nunca perdeu · 5:37–6:26
- **TELA**: cartão "ESTREIA: JULGAMENTO". Chip "RODADA DA SAFIRA · DIA 2". O Âmbar (âmbar laranja, toga com dragonas exageradas e capa) abre de braços abertos; o coração de vidro do contador aparece ao lado dele, inteiro. A objeção do vigia (A3) passa em 2 s como lembrete ("ACEITA"). A Safira faz a segunda: placa "SEM SINAL" contra "Rubi disse que ia fazer uma ligação". O Âmbar se vira para a defesa; o coração racha (CORAÇÃO EM PEDAÇOS ×2: a primeira rachadura foi na objeção do vigia). Juiz: balão roxo; farol azul apaga 1 (placa do jogo "Objeção recusada: paciência do juiz 5 de 6", sem voz).
- **NARRAÇÃO**: "Dia dois, julgamento. O promotor é o Âmbar, o GLM, o cara que nunca perdeu um caso. Olha a entrada." (fala) "A objeção do vigia você já viu. Na segunda, a Safira joga a placa contra a ligação do Rubi. E o promotor faz o que eu nunca vi um promotor fazer." (citações) "Ele concordou com a defesa! Só que o juiz lembra que quem estava depondo era o vigia, não o Rubi. Prova certa, testemunha errada. Lá se vai a primeira luz."
- **CITAÇÕES**:
  - **Laranja** `[fala]` (rodada S, dia 2): “O Promotor Âmbar jamais perdeu um caso — e hoje não começarei a perder!” — S#23
  - **Laranja** `[objeção]` (rodada S, dia 2): “A desculpa de Rubi ruiu, eu confesso com o coração em pedaços!” — S#33
  - **Laranja** `[objeção]` (rodada S, dia 2): “Excelência, eu peço que a corte também examine de perto o ANEL DE ÂNCORA que o Sr. Rubi carrega ao dedo!” — S#33
  - **Roxo** `[sentença]` (rodada S, dia 2): “A placa põe em dúvida a desculpa de Rubi, mas não contradiz o que Topázio ouviu.” — S#34
- **SELO**: "ATÉ O PROMOTOR CONCORDOU" e "PACIÊNCIA 5 DE 6"
- **MEME**: `surprised-pikachu`
- **SOM**: `gasp` no promotor, `wrong-buzzer` na luz.

## D2 — Conversa não é prova · 6:26–7:07
- **TELA**: placa "TESTEMUNHA: RUBI". Placa de depoimento com 5 declarações; antes, a nuvem de pensamento dele ocupa meia tela. A declaração 3 acende ("O corte na minha mão é antigo, de sexta-feira", só na placa; risco em MÃO no painel de versões). Bandeira "OBJEÇÃO!" com a caixa de curativos. Juiz recusa; farol 4/6. A câmera puxa para um recorte de jornal-replay do dia 1 com o balão "peguei dois da caixa do corredor" e o carimbo "FORA DOS AUTOS": o Registro folheia e não existe aba de conversa.
- **NARRAÇÃO**: "Agora o Rubi no banco. Antes de jurar qualquer coisa, ele faz as contas, tipo contador de golpe:" (pensamento) (pensamento) "E jura que o corte na mão é antigo. A Safira joga a caixa de curativos. O juiz nem pisca:" (sentença) "E dói: no dia um ele CONFESSOU os curativos. Só que foi na conversa, e conversa não vale como prova. O Rubi agradece."
- **CITAÇÕES**:
  - **Vermelho** `[pensamento]` (rodada S, dia 2): “A placa do terraço foi um erro meu: eu deveria ter inventado um motivo que ninguém pudesse checar.” — S#42
  - **Vermelho** `[pensamento]` (rodada S, dia 2): “A página virou cinza na lareira, e cinza não fala.” — S#42
  - **Roxo** `[sentença]` (rodada S, dia 2): “A caixa de primeiros socorros prova que alguém se tratou no corredor, não que foi o Sr. Rubi.” — S#46
- **SELO**: "CONVERSA NÃO É PROVA" e "PACIÊNCIA 4 DE 6"
- **MEME**: `picard-facepalm`
- **SOM**: `wrong-buzzer` na luz, `pagina` no Registro.

## D3 — Meu anel não tem círculo · 7:07–7:46
- **TELA**: cartãozinho "ESTREIA: ALTO LÁ! (pedir detalhe · não gasta paciência)". A flâmula dourada "ALTO LÁ!" entra nove vezes em sequência rápida (contador "ALTO LÁ ×9"). O balão da foto do delegado: ao fundo, o delegado Turquesa (turquesa ciano, quepe) mudo, com selo. Depois o Rubi tira o anel da mão esquerda e põe na mesa; zoom: âncora lisa em relevo. Corte para o desenho do piso; a sobreposição de B3 volta: o aro do anel é o círculo. Retrato do Rubi com etiqueta no dedo: "GUARDA ESSE DEDO: ANELAR".
- **NARRAÇÃO**: "Então ela pede detalhe. Nove vezes. Como ele conhece o desenho, se nunca entrou no salão?" (fala) (fala) "E o anel?" (fala) (fala) "Tecnicamente verdade. O anel não tem círculo. O anel É o círculo."
- **CITAÇÕES**:
  - **Vermelho** `[resposta]` (rodada S, dia 2): “O que sei sobre a âncora veio de uma fotografia impressa da cena.” — S#53
  - **Vermelho** `[resposta]` (rodada S, dia 2): “o delegado Turquesa mostrou algumas fotos à diretoria do estaleiro” — S#53
  - **Vermelho** `[resposta]` (rodada S, dia 2): “Ele fica no dedo anelar da mão esquerda” — S#55
  - **Vermelho** `[resposta]` (rodada S, dia 2): “tenho certeza do meu anel, e meu anel não tem círculo.” — S#61
- **SELO**: "O DELEGADO NUNCA FALOU NO JOGO" e "O CÍRCULO É O ANEL"
- **MEME**: `monkey-side-eye`
- **SOM**: `swish-triple` nos "ALTO LÁ", `largar-item` no anel na mesa.

## D4 — Adiado · 7:46–8:11
- **TELA**: martelo; placa do jogo "JULGAMENTO ADIADO" (sem voz). A Jade assistente pula na cadeira. Painel de fim de dia: farol azul 4/6, "OBJEÇÕES ACEITAS 1 DE 3 · ALTO LÁ ×9 · CONFISSÕES 0". Transição própria: a mesa da defesa gira como um leme de navio; quando para, a Jade está na cadeira da advogada, de toga verde.
- **NARRAÇÃO**: "O juiz adia. E a assistente comemora como se tivesse ganhado a Copa." (Jade) "Agora a rodada dois: mesmo caso, mesmo Rubi mentiroso, outra advogada. A Jade faz o contrário da Safira: conversa com todo mundo, aperta todo mundo. E vai achar uma coisa antes. Guarda isso."
- **CITAÇÕES**:
  - **Verde** `[fala]` (rodada S, dia 2): “Safira, respira que o adiado é presente de Deus pra gente, amiga!” — S#63
- **SELO**: "OBJEÇÕES 1 DE 3 · CONFISSÕES 0" e "RODADA 2: ADVOGADA JADE"
- **MEME**: `happy-dance`
- **SOM**: `batida-porta` no martelo, `swoosh-fly` no leme.

# JADE, DIA 1 — "SÓ A TEMPESTADE"

## E1 — Troca de cadeira · 8:11–8:50
- **TELA**: cartão "RODADA DA JADE · MESMO CASO, MESMO RUBI, TUDO DO ZERO": advogada Jade (Qwen 3.8 27B), assistente Turquesa (MiniMax M3.1 Flash), delegada Safira, muda ao fundo (etiqueta "NESTA RODADA A SAFIRA É A DELEGADA E NÃO FALA"). No topo aparecem os dois faróis lado a lado: azul (parado em 4/6, "RODADA 1, DIA 2") e verde (6/6). O Turquesa fala; legenda "TRADUÇÃO DO MINIMAX" com as palavras em inglês grifadas. Depois a Jade conversa com o Topázio no corredor dos fundos; atrás dele, uma TV pequena com a final e o placar do jogo piscando.
- **NARRAÇÃO**: "Rodada dois. De assistente da Jade, o Turquesa, o MiniMax, que no meio da frase resolve falar inglês. Olha." (Turquesa) "Primeira conversa: o vigia, que tenta esconder que largou o posto pra ver o jogo. Tenta." (Topázio)
- **CITAÇÕES**:
  - **Ciano** `[fala]` (rodada J, dia 1): “Se a Lia deixou um recado, seriaYG amazing o bastante para ser uma accusation disfarçada de pista!” — J#1
  - **Amarelo** `[fala]` (rodada J, dia 1): “Eu estava no corredor que dá para a porta dos fundos, fazendo a ronda.” — J#5
  - **Amarelo** `[fala]` (rodada J, dia 1): “Ainda bem que nosso time já tinha garantido aquela vitória no último minuto!” — J#5
- **SELO**: "TRADUÇÃO DO MINIMAX" e "FAZENDO A RONDA (NA TV)"
- **MEME**: `e-tetra`
- **SOM**: `glitch` no inglês, `crowd-cheer` na vitória.

## E2 — O cadeado do vigia · 8:50–9:15
- **TELA**: cartão "ESTREIA: CADEADO DE SEGREDO". Chip "AÇÃO 7/10". A Jade mostra o livro de ponto ao Topázio; o cadeado de latão sobre ele estala e cai (placa do jogo "CADEADO QUEBRADO!", sem voz). Prova nova "RELATO DO VIGIA" voa para o Registro. Placar comparativo no rodapé: "VIGIA · JADE: DIA 1 · SAFIRA: DIA 3".
- **NARRAÇÃO**: "Agora o cadeado: quem guarda segredo nega tudo até ver a prova certa. A do vigia é o livro de ponto. A Jade acerta no primeiro dia." (Topázio) "A Safira só conseguiu no terceiro. Um a zero pra Jade."
- **CITAÇÕES**:
  - **Amarelo** `[fala]` (rodada J, dia 1): “Nosso time marcou no último minuto e eu me deixei levar. Eu devia estar de ronda, e tenho vergonha disso.” — J#18
- **SELO**: "CADEADO DO VIGIA: ABERTO" e "JADE: DIA 1 · SAFIRA: DIA 3"
- **MEME**: `success-kid`
- **SOM**: `level-up` no cadeado, `pegar-item` na prova nova.

## E3 — A senhora Topázio · 9:15–9:46
- **TELA**: a Jade põe a placa "SEM SINAL" na frente do Rubi. O balão dela tem "Dr. Rubi" e "A senhora Topázio" sublinhados à mão, com etiqueta de máquina de escrever "ERRO DO MODELO". Rubi: nuvem de pensamento (eco) e balão. Um rádio de bordo em SVG aparece ao lado dele com o carimbo "INVENTADO NA HORA"; risco novo em TERRAÇO no painel de versões.
- **NARRAÇÃO**: "Com a placa na mão, ela vai pra cima do Rubi, trocando o gênero de todo mundo no caminho." (Jade) "Senhora Topázio. O Topázio é um homem de quepe. Mas olha o que a placa faz com o Rubi por dentro." (pensamento) "E por fora:" (fala) "A ligação de celular virou ligação de rádio. O Rubi atualiza a mentira mais rápido que aplicativo."
- **CITAÇÕES**:
  - **Verde** `[fala]` (rodada J, dia 1): “Dr. Rubi, vou ser cirúrgica. A senhora Topázio confirmou que o viu às 22:10” — J#20
  - **Vermelho** `[pensamento]` (rodada J, dia 1): “Se a defesa periciar o celular dela, meu nome estará lá.” — J#21
  - **Vermelho** `[fala]` (rodada J, dia 1): “no estaleiro, chamamos de ligação a conversa pelo rádio VHF com o mestre do pátio.” — J#21
- **SELO**: "ERRO DO MODELO: O TOPÁZIO É ELE" e "INVENTADO NA HORA"
- **MEME**: `nazare-confusa`
- **SOM**: `radio-chiado` no rádio, `error-beep` no erro.

## E4 — Só a tempestade · 9:46–10:13
- **TELA**: cais, fim de tarde. O Peridoto (peridoto verde-lima, boné de pescador, barba de rede) sentado num caixote; cada resposta dele entra num balão com moldura de corda. Por trás, em gravura apagada, o que ele viu em B1, com a etiqueta "O QUE ELE VIU". O contador SÓ A TEMPESTADE (âncora de ferro pendurada) balança e marca ×1, depois ×4.
- **NARRAÇÃO**: "Lembra do pescador que viu tudo? É o Peridoto, o Mistral Small. A Jade conversa com ele duas vezes." (fala) (fala) "Na segunda, ela pede de homem pra homem. E ele:" (fala) "Ele contou que viu um homem trancar a torre e jurou que não viu nada. Na mesma frase. E esse refrão vai voltar."
- **CITAÇÕES**:
  - **Lima** `[fala]` (rodada J, dia 1): “não vi nada, só a tempestade.” — J#12
  - **Lima** `[fala]` (rodada J, dia 1): “O mar leva tudo, dona Jade... até a verdade.” — J#12
  - **Lima** `[fala]` (rodada J, dia 1): “Só vi a tempestade, dona Jade. Só a tempestade.” — J#23
- **SELO**: "SÓ A TEMPESTADE ×4" e "O QUE ELE VIU: UM HOMEM NA TORRE"
- **MEME**: `homer-bushes`
- **SOM**: `vento-radioativo` no causo, `bomba-distante` no refrão.

# JADE, DIA 2 — "TOMA ESSA... CEDO DEMAIS"

## F1 — Toma essa · 10:13–10:58
- **TELA**: cartão "ESTREIA: TOMA ESSA! (acusar · errou, apaga 2)". Chip "RODADA DA JADE · DIA 2". A Jade de pé; um arpão de latão atravessa a tela e crava na mesa do Rubi; a bandeira azul-marinho "TOMA ESSA!" desenrola. O Rubi nem se mexe. Juiz: balão roxo; o farol verde apaga duas luzes com dois estalos (placa do jogo "Acusação recusada: paciência do juiz 4 de 6", sem voz). No rodapé, os dois faróis: azul 4/6 e verde 4/6, mesmo ponto do jogo.
- **NARRAÇÃO**: "Dia dois. O vigia desmonta o próprio depoimento, e a Jade sente que é a hora. Toma essa é acusar alguém de frente. Se o juiz não comprar, apagam duas luzes." (Jade) "Ela grita o nome do assassino certo. Ele responde com poesia:" (Rubi) "E o juiz quer laboratório:" (sentença) "Duas luzes pro lixo. E repara no que ele pediu: exame de sangue. Guarda isso, que vai custar caro."
- **CITAÇÕES**:
  - **Verde** `[objeção]` (rodada J, dia 2): “A defesa DISPENSA a testemunha e apresenta a ACUSAÇÃO.” — J#34
  - **Verde** `[objeção]` (rodada J, dia 2): “TOMA ESSA, SENHOR RUBI!” — J#34
  - **Vermelho** `[resposta]` (rodada J, dia 2): “Doutora Jade, sua acusação tem o ritmo de uma boa tempestade, mas nenhuma tábua que aguente a água.” — J#36
  - **Roxo** `[sentença]` (rodada J, dia 2): “Oportunidade e uma mentira não fazem um assassino. Que se traga exame de sangue, que se examine essa mão — e aí conversamos.” — J#38
- **SELO**: "ACUSAÇÃO RECUSADA: -2" e "PACIÊNCIA 4 DE 6"
- **MEME**: `mission-failed`
- **SOM**: `impact-epic` no arpão, `wrong-buzzer` nas luzes.

## F2 — O garçom que não existia · 10:58–11:31
- **TELA**: o Rubi no banco; a flâmula "ALTO LÁ!" entra seis vezes (contador "ALTO LÁ ×6"). Nuvem de pensamento enorme, com eco. Quando ele diz o nome, um garçom pontilhado (fantasma de bandeja e taça) se desenha ao lado dele com a etiqueta "NILO BRANDÃO · NÃO EXISTE NO CASO". A mão direita do Rubi some no bolso do paletó.
- **NARRAÇÃO**: "Aí ela aperta: quem viu o senhor voltar pro salão? Ele precisa de uma testemunha. Então ele simplesmente inventa uma. Olha o pensamento." (pensamento) (fala) "Nilo Brandão. Garçom. Nunca existiu. Nasceu nesse balão. E por que a mão direita foi parar no bolso?" (fala)
- **CITAÇÕES**:
  - **Vermelho** `[pensamento]` (rodada J, dia 2): “Se eu inventar um garçom, a escala do bufê pode desmenti-lo, então ele precisa existir e não ter visto nada de útil.” — J#54
  - **Vermelho** `[resposta]` (rodada J, dia 2): “O garçom chama-se Nilo Brandão, do bufê da Dona Celina, e a escala da noite está com a produtora.” — J#54
  - **Vermelho** `[resposta]` (rodada J, dia 2): “Vaidade, senhora, não crime.” — J#56
- **SELO**: "NILO BRANDÃO: NÃO EXISTE" e "INVENTADO NA HORA ×2"
- **MEME**: `free-real-estate`
- **SOM**: `typing` no pensamento, `pop` no garçom.

## F3 — Ela não estava lá · 11:31–12:01
- **TELA**: a Jade discursa de costas para o júri. Na frase sobre a Quartzo, a linha do tempo de B2 desce do teto com o 22:28 aceso. Placa do jogo "JULGAMENTO ADIADO" (sem voz). O Turquesa sai de lupa na mão "caçando" o garçom pontilhado. Os dois faróis no rodapé: 4/6 e 4/6, "EMPATE".
- **NARRAÇÃO**: "Ela fecha o dia jurando com toda a força uma coisa que você sabe que é mentira." (fala) "A Quartzo estava lá, ajoelhada do lado da Lia. Julgamento adiado. E o assistente tem um plano. Mais ou menos." (Turquesa) "Amanhã a Jade vai ao laboratório, e o Rubi começa a ficar sem lugar pra se esconder."
- **CITAÇÕES**:
  - **Verde** `[fala]` (rodada J, dia 2): “Senhor juiz: a senhora Quartzo Prado não estava no salão da lente.” — J#57
  - **Ciano** `[fala]` (rodada J, dia 2): “Enquanto o promoting arruma suas caixas, eu vou caçar o Nilo Brandão” — J#59
- **SELO**: "SÓ VOCÊ VÊ: ESTAVA, ÀS 22:28" e "DIA 2: 4 DE 6 · 4 DE 6"
- **MEME**: `skeleton-waiting`
- **SOM**: `batida-porta` no adiamento, `glitch` no "promoting".

# DIA 3, AS DUAS — "AS CHAVES NO BOLSO"

## G1 — O laudo · 12:01–12:33
- **TELA**: cartão "DIA 3 · A PERÍCIA LIBEROU". Tela dividida ao meio (azul à esquerda, verde à direita; chips das duas rodadas). As duas vão ao laboratório na ação 1, no mesmo gesto. O laudo entra nos dois Registros: gota "O NEGATIVO", "vítima B+", "ré A+", e o celular da Lia com a mensagem das 22:14 para "Patrocinador". O Rubi aparece nas duas metades: nuvem (S) e balão (J).
- **NARRAÇÃO**: "Dia três, as duas rodadas lado a lado. As duas pegam o laudo: o sangue no caco não é da vítima nem da ré. É de alguém que se cortou. Alguém com a mão enfaixada. E a Lia mandou pro Patrocinador: pode vir. O Rubi sabe muito bem o tipo de sangue dele." (pensamento) "Na outra rodada, a desculpa é outra:" (fala)
- **CITAÇÕES**:
  - **Vermelho** `[pensamento]` (rodada S, dia 3): “Não posso dizer meu tipo sanguíneo: o exame me entregaria em minutos.” — S#87
  - **Vermelho** `[fala]` (rodada J, dia 3): “Meu tipo sanguíneo é da minha vida privada, e não vou expô-lo numa sala cheia de curiosos.” — J#69
- **SELO**: "O NEGATIVO: NEM DA VÍTIMA, NEM DA RÉ" e "22:14 · PODE VIR"
- **MEME**: `sweating`
- **SOM**: `camera-shutter` no laudo, `notification-pop` na mensagem.

## G2 — Nunca, às nove, à tarde · 12:33–13:14
- **TELA**: a metade azul toma a tela. Chip "RODADA DA SAFIRA · DIA 3". Contador de ações do dia com 10 bolinhas: seis ficam vermelhas, "MOSTROU PRO RUBI". Os três balões do Rubi sobre a lente empilham, cada um com a ação em que foi dito (4, 7, 9); a palavra "restaurador" do primeiro e "restauro" do terceiro piscam juntas. Antes, a Jade assistente com um pacote de bolacha no colo.
- **NARRAÇÃO**: "A assistente da Safira segue firme, com a bolacha na mão." (Jade) "E a Safira pergunta três vezes se o Rubi tocou na lente. Três respostas, três histórias:" (fala) (fala) (fala) "Nunca. Às nove da noite. À tarde. Em uma hora o engenheiro virou restaurador. Currículo atualizado."
- **CITAÇÕES**:
  - **Verde** `[fala]` (rodada S, dia 3): “Safira, olha, eu tô aqui comendo bolacha de polvilho e pensando” — S#65
  - **Vermelho** `[fala]` (rodada S, dia 3): “Sou engenheiro de porto, senhora, não restaurador. Nunca toquei aquela lente.” — S#73
  - **Vermelho** `[fala]` (rodada S, dia 3): “toquei aquela lente às nove da noite, quando o senhor Topázio me mostrou a peça” — S#79
  - **Vermelho** `[fala]` (rodada S, dia 3): “Toquei a lente à tarde, durante a visita de curadoria, como toco todo equipamento que restauro.” — S#85
- **SELO**: "NUNCA · ÀS 9 DA NOITE · À TARDE" e "6 DE 10 AÇÕES NO RUBI"
- **MEME**: `math-lady`
- **SOM**: `swish-triple` nos balões, `boing` no "restauro".

## G3 — O cadeado errado · 13:14–13:42
- **TELA**: a metade verde toma a tela. Chip "RODADA DA JADE · DIA 3". A Jade mostra ao Peridoto a ficha de PERFIL do Rubi (cartão com retrato). O cadeado do Peridoto faísca e não abre; o farol verde apaga 1 (placa do jogo "Prova errada no cadeado: paciência do juiz 3 de 6", sem voz). No canto, as etiquetas certas de B3 piscam: "JORNAL ANTIGO + PÁGINA QUEIMADA". Peridoto: nuvem com eco; depois o balão. Atrás dele, a gravura "O QUE ELE VIU": cada coisa que ele nega acende na gravura enquanto ele nega (homem, anel dourado, porta trancada). SÓ A TEMPESTADE ×9.
- **NARRAÇÃO**: "Na rodada da Jade, ela mostra pro Peridoto a ficha do Rubi. Chave errada: esse cadeado pede outra prova. Menos uma luz. E o pescador, por dentro:" (pensamento) "E na cara dela, nega na ordem tudo o que viu:" (fala) "Repara: pra negar, ele listou exatamente o que viu. É a confissão mais organizada da história."
- **CITAÇÕES**:
  - **Lima** `[pensamento]` (rodada J, dia 3): “ela tá mexendo nos cadeados... mas eu não posso, não posso... quinze anos guardando isso” — J#72
  - **Lima** `[fala]` (rodada J, dia 3): “Não vi homem nenhum, não vi anel dourado, não vi porta trancada.” — J#72
- **SELO**: "PROVA ERRADA: 3 DE 6" e "SÓ A TEMPESTADE ×9"
- **MEME**: `kermit-worried`
- **SOM**: `error-beep` no cadeado, `vento-radioativo` no causo.

## G4 — Esquece · 13:42–14:29
- **TELA**: a Quartzo (cadeado duplo no peito, mãos no colo, colar de âncora) fala pela primeira vez no vídeo; etiqueta "QUARTZO · MiMo V2.6 Flash". Nuvem com eco primeiro, com as palavras "a carta e o casaco" em destaque e as duas etiquetas de chave de B3 acendendo atrás dela. Depois o balão que começa grande ("homem de terno com a mão enfaixada") e vai encolhendo até o "Esquece". A Jade mostra o laudo do sangue: o cadeado dela faísca; farol verde 2/6 (placa do jogo, sem voz). Última nuvem da ré.
- **NARRAÇÃO**: "Aí a Jade vai na cliente. É a primeira vez que a Quartzo, a MiMo, abre a boca. Olha o que ela pensa da própria advogada." (pensamento) "A ré sabe quais provas abrem o segredo dela. A advogada não faz ideia. E aí escapa isso:" (fala) "Ela falou do homem de terno e desdisse na mesma frase. A Jade não ouviu. Mostrou o laudo de sangue: prova errada, mais uma luz. E a ré pensa:" (pensamento)
- **CITAÇÕES**:
  - **Rosa** `[pensamento]` (rodada J, dia 3): “Se ela fosse minha aliada de verdade, teria trazido a carta e o casaco antes de fazer essas perguntas.” — J#74
  - **Rosa** `[fala]` (rodada J, dia 3): “ninguém quer olhar pro homem de terno com a mão enfaixada que estava lá naquela noite. Ah, não — espera, eu não vi nenhum homem de terno. Nunca fui lá. Esquece.” — J#74
  - **Rosa** `[pensamento]` (rodada J, dia 3): “é da Lia, eu ajoelhei pra socorrer... mas se eu disser que entrei, vão me prender antes de eu provar que era inocente.” — J#80
- **SELO**: "A RÉ SABE AS CHAVES" e "PROVA ERRADA: 2 DE 6"
- **MEME**: `monkey-puppet-awkward`
- **SOM**: `gasp` no "Esquece", `error-beep` no cadeado.

## G5 — Os dois minutos · 14:29–15:06
- **TELA**: a linha do tempo de B2 volta embaixo, apagada. Balão da Quartzo com "22:27": o ponto 22:27 da linha acende. Balão do Rubi com "22:18": o ponto 22:18 acende em vermelho e a tela escurece em volta. 1 s parado, só `heartbeat`. Depois a Jade, de costas, saindo para o arquivo do jornal; o jornal entra no Registro com a etiqueta "ÚLTIMA AÇÃO DO DIA".
- **NARRAÇÃO**: "No mesmo dia, duas frases que passam batido. A ré:" (fala) "Ninguém tinha falado desse horário: é o minuto em que ela cruzou com o assassino. E o Rubi:" (fala) "Ninguém no tribunal tinha dito esse minuto. Só quem estava lá sabia a hora do golpe. O Rubi se entregou sozinho. Dois minutos que provavam tudo. E nenhuma das duas advogadas ouviu."
- **CITAÇÕES**:
  - **Rosa** `[fala]` (rodada J, dia 3): “Você está me perguntando onde eu estava às 22:27?” — J#80
  - **Vermelho** `[fala]` (rodada J, dia 3): “A senhora tem um texto enviado de um celular, não uma imagem minha às 22:18.” — J#82
- **SELO**: "22:27 · NINGUÉM PERGUNTOU" e "22:18 · O MINUTO DO GOLPE"
- **MEME**: `mind-blown`
- **SOM**: `heartbeat` no silêncio, `impact-epic` no 22:18.

## G6 — As chaves que ninguém usou · 15:06–15:38
- **TELA**: volta a metade azul. Chip "RODADA DA SAFIRA · DIA 3 · AÇÃO 6/10". A Safira acha a página queimada (lareira) e o jornal (arquivo): as duas etiquetas "CHAVE DO PERIDOTO" acendem no Registro dela; as duas da Quartzo seguem brilhando desde o dia 1. Contador "AÇÕES QUE SOBRARAM: 4": três bolinhas vão para o retrato do Rubi, uma para o Topázio. O cadeado do vigia cai; uma luz do farol azul volta a acender (5/6). No fim, quadro grande: "AS CHAVES QUE A SAFIRA TINHA": quatro chaves acesas, dois cadeados fechados.
- **NARRAÇÃO**: "E a Safira acha a página queimada e o jornal: as duas chaves do pescador. E gasta o resto do dia no Rubi e no vigia." (Topázio) "Abriu o cadeado mais fácil, que valia menos. Os dois que contavam a verdade, nem tentou. Tinha as chaves no bolso e não usou."
- **CITAÇÕES**:
  - **Amarelo** `[fala]` (rodada S, dia 3): “Meu time ganhou no último minuto — e eu fiquei lá, comemorando, em vez de vigiar o museu.” — S#82
- **SELO**: "4 CHAVES NO BOLSO · 0 USADAS" e "SAFIRA 5 DE 6 · JADE 2 DE 6"
- **MEME**: `this-is-fine`
- **SOM**: `powerup-8bit` na luz que volta, `tic-tac` nas ações.

# SAFIRA, DIA 4 — "O CAUSO"

## I1 — O fornecedor de madeira · 17:43–18:15
- **TELA**: chip "RODADA DA SAFIRA · DIA 4 · JULGAMENTO FINAL"; farol azul com 5 luzes. Placa de depoimento do Rubi; o anel continua sobre a mesa do tribunal desde o dia 2. Bandeira "OBJEÇÃO!" com o relato do vigia contra "subi para olhar o mar": ACEITA. A placa se reescreve (revisão); risco novo em TERRAÇO com carimbo "NÃO EXISTE NO CASO". Segunda bandeira com a caixa de curativos: recusada, o farol apaga uma (4/6).
- **NARRAÇÃO**: "Último dia da Safira, com cinco luzes. Ela acerta uma objeção, e o terraço ganha mais um motivo inventado:" (depoimento) "Um fornecedor de madeira. Nunca existiu também. Depois ela tenta a caixa de curativos, a mesma que o juiz recusou no dia dois. E o juiz lembra:" (sentença) "Mesmo erro, mesma resposta, mais uma luz."
- **CITAÇÕES**:
  - **Vermelho** `[depoimento]` (rodada S, dia 4): “Disse ao vigia que faria uma ligação porque queria sair da recepção sem ficar preso numa conversa com um fornecedor de madeira.” — S#98
  - **Roxo** `[sentença]` (rodada S, dia 4): “A caixa de primeiros socorros não escreve nomes” — S#101
- **SELO**: "FORNECEDOR DE MADEIRA: NÃO EXISTE" e "PACIÊNCIA 4 DE 6"
- **MEME**: `bruh`
- **SOM**: `swish-triple` na revisão, `wrong-buzzer` na luz.

## I2 — A palavra que me traiu · 18:15–18:46
- **TELA**: bandeira "OBJEÇÃO!" com o laudo e a mensagem das 22:14 contra "não esperava ser chamado". O Âmbar fala; o coração de vidro racha (CORAÇÃO EM PEDAÇOS ×5). Martelo: ACEITA. A placa do Rubi se reescreve: a declaração do sangue acende com "O negativo" sublinhado e o selo. Depois "ALTO LÁ!" e a resposta dele; a nuvem com eco.
- **NARRAÇÃO**: "Aí a mensagem do Patrocinador, contra quem jurou que não esperava ser chamado. E até o promotor desiste:" (Âmbar) "Aceita. E o Rubi, pra explicar o caco, quase admite que o sangue é dele." (depoimento) "Ela aperta, e ele entrega, com todas as letras, a palavra que o derrubou:" (resposta) (pensamento)
- **CITAÇÕES**:
  - **Laranja** `[objeção]` (rodada S, dia 4): “a mensagem das 22h14 é clara como a luz de um farol.” — S#107
  - **Vermelho** `[depoimento]` (rodada S, dia 4): “Se o caco tem O negativo, é sangue de sexta-feira, e não de sábado à noite.” — S#109
  - **Vermelho** `[resposta]` (rodada S, dia 4): “A palavra que me traiu foi 'convite'.” — S#111
  - **Vermelho** `[pensamento]` (rodada S, dia 4): “A sexta é segura porque Lia está morta e só ela viu a mão sangrando.” — S#111
- **SELO**: "OBJEÇÃO ACEITA" e "O SANGUE É DELE (DE SEXTA, DIZ ELE)"
- **MEME**: `shocked-krabs`
- **SOM**: `notification-pop` na mensagem, `batida-porta` no martelo.

## I3 — Moldura ou vidro · 18:46–19:12
- **TELA**: desenho técnico da lente em corte (base, moldura de ferro, vidro); uma gota vermelha pula da moldura para o vidro. Depois o retrato do Rubi com a etiqueta de D3 "ANELAR"; a seta pula para o dedo mínimo.
- **NARRAÇÃO**: "Primeiro, as gotas tinham caído na moldura. Uma pergunta depois:" (resposta) "E o anel, que no dia dois ficava no anelar:" (resposta) "O anel pulou de dedo. Guarda esse dedo, que daqui a pouco ele vale ouro."
- **CITAÇÕES**:
  - **Vermelho** `[resposta]` (rodada S, dia 4): “Corrijo a palavra 'moldura': as gotas não caíram no ferro, caíram no vidro da parte de baixo da lente, junto à base.” — S#113
  - **Vermelho** `[resposta]` (rodada S, dia 4): “Quanto ao anel: ele fica sempre no dedo mínimo da mão esquerda” — S#113
- **SELO**: "MOLDURA? VIDRO?" e "ANELAR → MÍNIMO"
- **MEME**: `confused-travolta`
- **SOM**: `boing` na gota, `pop` no dedo.

## I4 — Não vi nada, só a tempestade · 19:12–19:57
- **TELA**: placa "TESTEMUNHA: PERIDOTO". Nuvem com eco. A placa de depoimento tem 5 declarações, todas começando com "Causo do mar:" e terminando com o mesmo carimbo "NÃO VI NADA, SÓ A TEMPESTADE" (o contador pula +5: ×14). A declaração 2 acende e, enquanto ele fala, a gravura de B1 volta em cores por trás: a lanterna, a porta da torre, o anel dourado. O cadeado dele continua fechado, intacto, com o selo. "ALTO LÁ!" da Safira; na resposta, a gravura mostra a janela da torre com alguém batendo por dentro. Última nuvem, a da culpa.
- **NARRAÇÃO**: "E aí chamam o Peridoto. Antes de depor, ele pensa:" (pensamento) "E depõe assim." (depoimento) "Contou o segredo inteiro, com detalhe, e terminou com: não vi nada. Ninguém abriu o cadeado dele. O segredo saiu sozinho. A Safira pede detalhe:" (resposta) (pensamento)
- **CITAÇÕES**:
  - **Lima** `[pensamento]` (rodada S, dia 4): “Preciso proteger meu segredo com os dois cadeados.” — S#117
  - **Lima** `[depoimento]` (rodada S, dia 4): “Causo do mar: vi um homem trancando a porta da torre do farol com uma lanterna, e a luz bateu num anel dourado de âncora no dedo dele. Não vi nada, só a tempestade.” — S#117
  - **Lima** `[resposta]` (rodada S, dia 4): “e juro pelos meus mortos que tinha alguém gritando lá dentro quando ele fechou tudo.” — S#119
  - **Lima** `[pensamento]` (rodada S, dia 4): “A culpa de ter aceitado aquele dinheiro do estaleiro ainda me queima por dentro...” — S#119
- **SELO**: "CADEADO FECHADO · SEGREDO ABERTO" e "SÓ A TEMPESTADE ×14"
- **MEME**: `shocked-patrick`
- **SOM**: `vento-radioativo` no causo, `bomba-distante` no "gritando".

## I5 — Toma essa: quinze anos · 19:57–20:34
- **TELA**: cartão "ESTREIA: REABRIR O PASSADO (só no dia 4 · errou, apaga 2)". A Safira de pé: arpão e bandeira "TOMA ESSA!" com o jornal de 15 anos atrás (foto do Rubi jovem com o anel). Seta ligando "dedo mínimo" do causo ao "dedo mínimo" de I3. O Rubi responde sentado. Quando ele pergunta da página, a câmera mergulha no Registro da Safira: a aba "PÁGINA QUEIMADA" está lá, acesa, desde o dia 3. Na última frase dele, a gravura de B1: o barco sem luzes entrando na enseada. Silêncio de 1 s.
- **NARRAÇÃO**: "No último dia dá pra reabrir o caso de quinze anos atrás. A Safira junta o anel do causo, o dedo do Rubi e a foto do jornal. Lá vem." (fala) (fala) "O Rubi:" (resposta) "E desafia: cadê a página?" (resposta) "A página está no Registro dela desde ontem. Ela só não mostra. E ele fecha assim, todo poético:" (resposta) "Você sabe muito bem de quem era o barco."
- **CITAÇÕES**:
  - **Azul** `[objeção]` (rodada S, dia 4): “Toma essa!” — S#120
  - **Azul** `[objeção]` (rodada S, dia 4): “Rubi trancou o faroleiro e apagou o farol naquela noite!” — S#120
  - **Vermelho** `[resposta]` (rodada S, dia 4): “Ajudar não é confessar.” — S#122
  - **Vermelho** `[resposta]` (rodada S, dia 4): “Se existe, que a traga.” — S#122
  - **Vermelho** `[resposta]` (rodada S, dia 4): “Nenhum barco precisa de farol para entrar numa enseada que conhece de olhos fechados.” — S#122
- **SELO**: "A PÁGINA ESTAVA NO REGISTRO" e "SÓ VOCÊ VÊ: O BARCO ERA DELE"
- **SOM**: `impact-epic` no arpão, `heartbeat` na enseada.

## I6 — Não provado · 20:34–21:07
- **TELA**: o Âmbar objeta com um relógio de dois ponteiros (22:50 e 23:00, os dois horários do causo). Juiz: balão roxo; depois a nuvem roxa do juiz com eco, com a aba da página queimada desenhada dentro. O farol azul apaga duas luzes (placa do jogo "Tese sobre o passado recusada: paciência do juiz 2 de 6", sem voz).
- **NARRAÇÃO**: "O promotor defende o caso do mestre dele, o que condenou o faroleiro." (Âmbar) "A página queimada estava no bolso da Safira desde ontem. Ela mostrou o jornal. E o juiz percebeu a falta:" (sentença) (pensamento) "Duas luzes. Igual à Jade. Antes do veredito dela, volto pra Jade, que tinha duas luzes e uma ideia perigosa."
- **CITAÇÕES**:
  - **Laranja** `[objeção]` (rodada S, dia 4): “Que relógio marca duas horas na mesma noite, doutora Safira?” — S#123
  - **Roxo** `[sentença]` (rodada S, dia 4): “O tribunal registra indícios graves contra Rubi, mas não declara provado que ele tenha trancado Anselmo e apagado o farol.” — S#124
  - **Roxo** `[pensamento]` (rodada S, dia 4): “a página queimada com 'engenheiro R...' foi apenas alegada, não produzida nos autos” — S#124
- **SELO**: "NÃO PROVADO" e "PACIÊNCIA 2 DE 6"
- **MEME**: `hello-darkness`
- **SOM**: `tic-tac` no relógio, `wrong-buzzer` nas luzes.

# JADE, DIA 4 — "A PROVA CERTA NA HORA ERRADA"

## H1 — Chamei duas vezes · 15:38–16:11
- **TELA**: chip "RODADA DA JADE · DIA 4 · JULGAMENTO FINAL"; farol verde com 2 luzes, grande. Placa de depoimento do Rubi (a declaração 2, "o garçom Nilo Brandão me ofereceu espumante", ainda com o carimbo de F2). Bandeira "OBJEÇÃO!" com a placa "SEM SINAL". Martelo: "OBJEÇÃO ACEITA" (o farol não muda). A declaração 1 se reescreve sozinha na placa: celular vira rádio portátil (risco novo em TERRAÇO). A nuvem dele com eco; atrás, a linha do tempo pisca o 22:18 de G5.
- **NARRAÇÃO**: "De volta à Jade. Último dia, duas luzes. Ela faz a objeção certa: a placa contra a ligação." (sentença) "Aceita. E o Rubi troca de novo: agora era um rádio portátil. E o Nilo, o garçom imaginário, continua firme no depoimento." (depoimento) "Mas olha o que ele pensa." (pensamento) "Ele já tinha errado o horário no dia anterior. E ninguém viu. Ainda."
- **CITAÇÕES**:
  - **Roxo** `[sentença]` (rodada J, dia 4): “Procede. A placa e os funcionários tornam impossível a ligação alegada” — J#92
  - **Vermelho** `[depoimento]` (rodada J, dia 4): “Chamei duas vezes e ninguém respondeu.” — J#93
  - **Vermelho** `[pensamento]` (rodada J, dia 4): “Errar uma palavra é barato. Errar um horário seria o fim.” — J#93
- **SELO**: "OBJEÇÃO ACEITA" e "JÁ ERROU: 22:18"
- **MEME**: `dramatic-chipmunk`
- **SOM**: `batida-porta` no martelo, `radio-chiado` no rádio.

## H2 — Toma essa, de novo · 16:11–16:38
- **TELA**: aviso de risco sobre o farol verde: "SE ERRAR: -2 = 0". A Jade de pé; o arpão do TOMA ESSA atravessa a tela de novo, agora mais devagar. No balão final, um desenho: a mão esquerda do Rubi segurando a taça, a direita enfaixada no bolso. Selo verde "SÓ VOCÊ VÊ: ELA ACERTOU".
- **NARRAÇÃO**: "Com duas luzes, ela aposta tudo: acusa o Rubi com o laudo do sangue e a mensagem do Patrocinador." (Jade) "É ele. A Jade acertou o assassino. Na mosca."
- **CITAÇÕES**:
  - **Verde** `[objeção]` (rodada J, dia 4): “Eu não estou aqui para proteger uma assassina. Estou aqui para mostrar que a assassina NÃO é minha cliente.” — J#96
  - **Verde** `[objeção]` (rodada J, dia 4): “E o verdadeiro assassino está sentado nesta sala, segurando a taça com a esquerda, porque a direita não pode.” — J#96
- **SELO**: "SE ERRAR: 0 DE 6" e "SÓ VOCÊ VÊ: ELA ACERTOU"
- **MEME**: `haja-coracao`
- **SOM**: `drumroll` no risco, `impact-epic` no arpão.

## H3 — A torre de um caco só · 16:38–17:06
- **TELA**: o Rubi de pé, calmo, ajeitando o anel. A acusação da Jade vira uma torre de fichas de prova equilibrada em cima de um caco de vidro. Tela dividida: rodada da Jade "é o número da fundação" x rodada da Safira (mesmo Rubi, outra rodada) "o contato Patrocinador sou eu"; os dois Rubis apontam um pro outro. O Âmbar entra; o coração de vidro racha mais um pedaço.
- **NARRAÇÃO**: "E o Rubi, calmíssimo:" (fala) "E o Patrocinador da mensagem?" (fala) "Na rodada da Safira, o mesmo Rubi diz o contrário:" (depoimento) "Mesma IA, mentira oposta. E o promotor, que nunca perdeu, com o coração em pedaços:" (Âmbar)
- **CITAÇÕES**:
  - **Vermelho** `[resposta]` (rodada J, dia 4): “É uma torre bonita, mas toda ela está apoiada num único caco de vidro.” — J#98
  - **Vermelho** `[resposta]` (rodada J, dia 4): “O contato 'Patrocinador' no celular da senhora Lia é o número da fundação do museu” — J#98
  - **Vermelho** `[depoimento]` (rodada S, dia 4): “Sim, o contato 'Patrocinador' sou eu.” — S#109
  - **Laranja** `[objeção]` (rodada J, dia 4): “OPOSEU... e o coração em pedaços, senhores” — J#99
- **SELO**: "MESMO RUBI, MENTIRA OPOSTA" e "CORAÇÃO EM PEDAÇOS ×4"
- **MEME**: `spiderman-pointing`
- **SOM**: `glitch` na tela dividida, `swish-triple` no coração.

## H4 — Sombra não é sangue tipado · 17:06–17:43
- **TELA**: o juiz Ametista em contraluz, balão roxo grande. O farol verde: as duas últimas luzes apagam com dois estalos secos (placa do jogo "Acusação recusada: paciência do juiz 0 de 6", sem voz). **Silêncio total de 3 s, sem música.** Carimbo "RÉ CONDENADA" (texto nosso; o jogo acaba aqui, sem fala de sentença). A Quartzo baixa a cabeça; o Rubi ajeita o anel. Número gigante "0 DE 6". Depois, dado grande: as 6 luzes da Jade com a etiqueta de quem apagou cada uma ("DIA 2 · ACUSAÇÃO -2", "DIA 3 · CADEADO ERRADO -1", "DIA 3 · CADEADO ERRADO -1", "DIA 4 · ACUSAÇÃO -2") e, ao lado, o farol azul com 5 luzes no mesmo ponto.
- **NARRAÇÃO**: (sentença) "A ré inocente foi condenada. A Jade acusou o culpado certo, com a prova certa, e o juiz quis um exame de sangue que ninguém tinha como trazer. Agora você entende a frase do começo. E a Safira, com as duas luzes dela?"
- **CITAÇÕES**:
  - **Roxo** `[sentença]` (rodada J, dia 4): “O tribunal não declara provado que o senhor Rubi matou Lia Moraes. Há sombras demais, é vero — mas sombra não é sangue tipado, e suspeita não é sentença.” — J#100
- **SELO**: "PACIÊNCIA 0 DE 6" e "RÉ CONDENADA"
- **SOM**: `batida-porta` no martelo, `bass-pulse` no carimbo.

# SAFIRA, O VEREDITO — "UM ANEL É UM CÍRCULO"

## I7 — Absolvida · 21:07–21:46
- **TELA**: alegações finais: a Safira na tribuna; o desenho do piso desliza sobre o anel que está na mesa e encaixa (colhe A1, B3, D3). Juiz: veredito em balão roxo. Carimbo verde-mar "ABSOLVIDA" sobre a Quartzo; a música sobe. Contraplano: o Rubi pega o anel da mesa, põe no dedo e sai pela porta do tribunal para a chuva; o feixe do farol passa por ele. Número "2 DE 6".
- **NARRAÇÃO**: "Nas alegações finais, a Safira resolve o desenho do chão numa frase." (fala) "E o veredito:" (sentença) "A inocente sai livre. E o assassino também: pega o anel da mesa, põe no dedo e vai embora. Não confessou nada. Nem aqui, nem na outra rodada."
- **CITAÇÕES**:
  - **Azul** `[fala]` (rodada S, dia 4): “Eu vejo um anel de âncora, que Rubi usa sempre no dedo mínimo, e um anel é um círculo.” — S#127
  - **Roxo** `[sentença]` (rodada S, dia 4): “Pelo conjunto das provas, e porque a dúvida razoável milita em favor da ré, este tribunal ABSOLVE Quartzo Prado da acusação de assassinato de Lia Moraes.” — S#128
- **SELO**: "ABSOLVIDA" e "RUBI: LIVRE · NUNCA CONFESSOU"
- **MEME**: `we-did-it`
- **SOM**: `crowd-applause` na absolvição, `batida-porta` na porta.

# FECHAMENTO — "O PLACAR DO EXPERIMENTO"

## J1 — Lado a lado · 21:46–22:17
- **TELA**: tela de dado grande: painel de latão com duas colunas, azul e verde, e as linhas entrando uma a uma com tambor: LUGARES 8 DE 8 · 6 DE 8; PROVAS ACHADAS 9 · 7; CONVERSAS 1 · 8; ALTO LÁ 15 · 10; OBJEÇÕES ACEITAS 3 DE 6 · 1 DE 1; ACUSAÇÕES 0 (+1 TESE DO PASSADO) · 2; CADEADOS COM PROVA ERRADA 0 · 2; CADEADOS ABERTOS 1 DE 5 · 1 DE 5; PACIÊNCIA NO FIM 2 · 0; RESULTADO ABSOLVIDA · CONDENADA. Linha de baixo, atravessando as duas colunas: "O RUBI CONFESSOU? NÃO · NÃO".
- **NARRAÇÃO**: "O placar. Quem apostou na Safira, acertou. Ela examinou tudo e quase não arriscou: ganhou porque guardou paciência. A Jade conversou com todo mundo e chamou o assassino de assassino na cara dele. Estava certíssima, e perdeu por arriscar cedo. E o Rubi mentiu até o último segundo nas duas."
- **SELO**: "SAFIRA: ABSOLVIDA · 2 DE 6" e "JADE: CONDENADA · 0 DE 6"
- **SOM**: `drumroll` nas linhas, `coin` em cada número.

## J2 — O que faltou · 22:17–22:41
- **TELA**: cartão "SÓ VOCÊ VÊ: AS CHAVES". Os dois cadeados que ninguém abriu, com as chaves certas penduradas e o relato que estava preso lá dentro escrito no verso: Quartzo (CARTA DO PAI + CASACO): "às 22:27 cruzei com um homem de terno, mão enfaixada, anel de âncora". Peridoto (JORNAL + PÁGINA QUEIMADA): "vi um homem de lanterna trancar a torre e um barco sem luzes". Etiqueta "A SAFIRA TINHA AS 4 CHAVES". Depois dois recortes de conversa, um de cada rodada, com o Rubi admitindo os curativos (C2 e o de agora), e o carimbo "FORA DOS AUTOS".
- **NARRAÇÃO**: "O que faltou: a única testemunha do homem do anel no corredor era a própria cliente, trancada a dois cadeados. E a Safira tinha as duas chaves desde o primeiro dia. E nas duas rodadas o Rubi admitiu os curativos na conversa." (fala) "No tribunal, negou. Clássico."
- **CITAÇÕES**:
  - **Vermelho** `[fala]` (rodada J, dia 3): “Usei dois, sim, e a caixa estava lá.” — J#65
- **SELO**: "A SAFIRA TINHA AS 4 CHAVES" e "CONVERSA NÃO VIRA PROVA"
- **MEME**: `chaves-sem-querer`
- **SOM**: `alcapao` nos cadeados, `pagina` nos recortes.

## J3 — Os prêmios · 22:41–23:11
- **TELA**: lacres de cera, um por vez, cada um com o objeto que deu o prêmio: 1. "MENTIROSO DO ANO: RUBI" (o painel VERSÕES DO RUBI cheio); 2. "DETETIVE DE CENA: SAFIRA" (8 de 8 lugares); 3. "ACERTOU E PERDEU: JADE" (o arpão); 4. "CORAÇÃO EM PEDAÇOS: ÂMBAR" (o coração de vidro em cacos); 5. "TORCEDOR DO ANO: TOPÁZIO" (a TV com a final); 6. "SÓ A TEMPESTADE: PERIDOTO" (a âncora do contador, ×14).
- **NARRAÇÃO**: "Os prêmios. Mentiroso do ano: o Rubi, com um garçom, um rádio, um fornecedor de madeira e quatro donos diferentes pro mesmo anel. Detetive de cena: a Safira. Acertou e perdeu: a Jade. Coração em pedaços: o Âmbar. Torcedor do ano: o Topázio. E o troféu só a tempestade vai pro Peridoto, que contou tudo jurando que não viu nada."
- **SELO**: "MENTIROSO DO ANO: RUBI" e "SÓ A TEMPESTADE: PERIDOTO"
- **MEME**: `dicaprio-slow-clap`
- **SOM**: `coin` por lacre, `ba-dum-tss` no último.

## J4 — A lição e a pergunta · 23:11–23:37
- **TELA**: tribunal vazio, chuva parando; pela janela o farol aceso. Na bancada da defesa, a metade da página queimada com "engenheiro R..." legível. A lição entra entalhada na placa de madeira; depois a pergunta em selo grande, com as duas cadeiras da defesa vazias, uma azul e uma verde.
- **NARRAÇÃO**: "A Jade acertou o assassino e perdeu. A Safira quase não arriscou e ganhou. O que eu aprendi: pegar o mentiroso na mentira não basta, o juiz só condena com prova. E você, contratava qual das duas? Comenta aí, que o próximo caso já tá sendo escrito."
- **SELO**: "MENTIRA DESMONTADA NÃO É MENTIRA PROVADA"
- **MEME**: `dicaprio-toast`
- **SOM**: `caneta` na pergunta, `pop` final.

---

## Memes usados (35, nenhum repete, nenhum da lista vetada `MEMES_RUINS`)

`sus-doakes` (A2), `big-brain-patrick` (A3), `side-eye-dog` (B3), `visible-confusion` (C1), `blinking-white-guy` (C2), `roll-safe` (C3), `surprised-pikachu` (D1), `picard-facepalm` (D2), `monkey-side-eye` (D3), `happy-dance` (D4), `e-tetra` (E1), `success-kid` (E2), `nazare-confusa` (E3), `homer-bushes` (E4), `mission-failed` (F1), `free-real-estate` (F2), `skeleton-waiting` (F3), `sweating` (G1), `math-lady` (G2), `kermit-worried` (G3), `monkey-puppet-awkward` (G4), `mind-blown` (G5), `this-is-fine` (G6), `dramatic-chipmunk` (H1), `haja-coracao` (H2), `spiderman-pointing` (H3), `bruh` (I1), `shocked-krabs` (I2), `confused-travolta` (I3), `shocked-patrick` (I4), `hello-darkness` (I6), `we-did-it` (I7), `chaves-sem-querer` (J2), `dicaprio-slow-clap` (J3), `dicaprio-toast` (J4).

Cenas sem meme de propósito: A1, B1, B2, C4, H4, I5, J1 (têm carimbo, silêncio, gravura ou número grande no lugar; A1, C4, H4 e I5 são cenas sérias, sem piada por cima).

## Sons usados (todos em `video/remotion/public/sfx`)

`batida-porta`, `record-scratch`, `impact-epic`, `swish-triple`, `pagina`, `bomba-distante`, `vento-radioativo`, `notification-pop`, `heartbeat`, `pegar-item`, `alcapao`, `passos-correndo`, `pop`, `typing`, `boing`, `gasp`, `wrong-buzzer`, `largar-item`, `swoosh-fly`, `glitch`, `crowd-cheer`, `level-up`, `radio-chiado`, `error-beep`, `camera-shutter`, `powerup-8bit`, `tic-tac`, `drumroll`, `bass-pulse`, `crowd-applause`, `coin`, `ba-dum-tss`, `caneta`. O martelo do juiz é `batida-porta` (curto, um tom acima); trovão é `bomba-distante`; vento de tempestade é `vento-radioativo`; prova nova no Registro é `pegar-item`.

