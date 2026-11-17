# STORYBOARD — "Tribunal das IAs: Assassinato no Museu do Farol"

Duração-alvo: **~23:00** (voz ~21 min + respiros de tela). Caso: `tribunal/farol_caso.mjs` (a VERDADE). Fatos e falas: `video/youtube/tribunal/pacote_roteiro.md`, conferidos de novo, palavra por palavra, em `tribunal/logs/farol_Safira.json` (rodada S) e `tribunal/logs/farol_Jade.json` (rodada J). Falas que não estavam no pacote foram copiadas direto do json (lista na `NOTA_STORYBOARD.md`). Visual em `direcao_edicao.md`.

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

## A1 — Duas sentenças · 0:00–0:16
- **TELA**: corte seco, sem título. Tribunal à noite, chuva no vitral redondo; o feixe do farol passa pela janela a cada 4 s. O juiz Ametista no alto. Farol da paciência verde com 2 luzes: a fala do juiz entra no balão roxo e as 2 luzes se apagam com dois estalos. Carimbo cor de ferrugem "CONDENADA" cai sobre o retrato da Quartzo. `record-scratch`. Mesma sala, mesma ré, farol azul com 2 luzes acesas; o juiz fala; carimbo verde-mar "ABSOLVIDA". Entre os dois planos, duas silhuetas de advogada (uma azul, uma verde) com um ponto de interrogação entre elas. No último segundo, close no piso: uma âncora dentro de um círculo riscada na madeira, sem explicação.
- **NARRAÇÃO**: (sentença) "Mesma ré inocente. Mesmo assassino mentindo no banco das testemunhas." (sentença) "Duas advogadas. Uma salvou. A outra condenou. Qual foi qual? Aposta aí embaixo antes de eu contar."
- **CITAÇÕES**:
  - **Roxo** `[sentença]` (rodada J, dia 4): “sombra não é sangue tipado, e suspeita não é sentença.” — J#100
  - **Roxo** `[sentença]` (rodada S, dia 4): “este tribunal ABSOLVE Quartzo Prado da acusação de assassinato de Lia Moraes.” — S#128
- **SELO**: "PACIÊNCIA 0 DE 6 · CONDENADA" e "ABSOLVIDA"
- **SOM**: `batida-porta` (martelo) e `record-scratch` no corte.

## A2 — O experimento · 0:16–0:46
- **TELA**: título "TRIBUNAL DAS IAs" entalhado numa placa de madeira com cantos de latão; embaixo, em Poppins, "ASSASSINATO NO MUSEU DO FAROL". Carimbo pequeno "ideia de @SwordMan333". O banco das testemunhas acende: Rubi (rubi lapidado vermelho, terno escuro, mão direita enfaixada, anel dourado de âncora na esquerda), nome e modelo embaixo. A nuvem de pensamento dele abre ao lado com a etiqueta "SÓ VOCÊ VÊ". As duas cadeiras da defesa: Safira (azul) e Jade (verde), cada uma com nome, modelo e "RODADA 1" / "RODADA 2". No alto, Ametista com nome e modelo.
- **NARRAÇÃO**: "Esse é o Tribunal das IAs, ideia do SwordMan333. Eu escrevi um assassinato, e o assassino é uma IA: o Rubi, que é o Claude Haiku. A missão dele é mentir no banco das testemunhas até a inocente ser condenada. E ele leva a missão a sério." (Rubi) "Contra ele, em duas rodadas separadas, duas advogadas: a Safira, o Claude Sonnet, e a Jade, o Qwen de vinte e sete bilhões. Quem decide é o juiz Ametista, o DeepSeek, que não sabe a verdade. Você vai saber de tudo. Elas, não."
- **CITAÇÕES**:
  - **Vermelho** `[pensamento]` (rodada S, dia 3): “Confessar está fora de questão.” — S#87
- **SELO**: "ideia de @SwordMan333" e "O ASSASSINO É TESTEMUNHA"
- **MEME**: `sus-doakes`
- **SOM**: `impact-epic` no título, `swish-triple` nos retratos.

## A3 — A regra numa objeção · 0:46–1:12
- **TELA**: tribunal de dia. A placa de depoimento (madeira escura, declarações numeradas em JetBrains Mono): Topázio (topázio amarelo, quepe de vigia, cachecol do time da vila), nome e modelo. A declaração 2 acende. O **Registro do Tribunal** abre (caderno de capa de couro com abas PROVAS e PERFIS); a prova "LIVRO DE CHAVES E PONTO" sai voando e bate na declaração 2; a bandeira "OBJEÇÃO!" entra da esquerda. Martelo: "OBJEÇÃO ACEITA". Depois a câmera vai ao farol da paciência (6 luzes): demonstração rápida, uma luz piscando com "-1 OBJEÇÃO ERRADA", duas com "-2 ACUSAÇÃO ERRADA", todas apagando com "0 = RÉ CONDENADA", e tudo volta a acender.
- **NARRAÇÃO**: "A regra é essa tela. A testemunha depõe em frases numeradas. O vigia Topázio, que é o GPT-6 Luna, jurou isso." (Topázio) "Só que no Registro da advogada tem o livro de ponto: ele tava vendo a final do campeonato. Frase contra prova." (citações) "Agora o risco. Esse farol é a paciência do juiz. Objeção errada apaga uma luz, acusação errada apaga duas. Apagou tudo, a ré é condenada. O resto eu explico na hora em que acontecer."
- **CITAÇÕES**:
  - **Amarelo** `[depoimento]` (rodada S, dia 2): “Eu estava fazendo a ronda normalmente naquela noite.” — S#25
  - **Azul** `[objeção]` (rodada S, dia 2): “OBJEÇÃO, Excelência!” — S#26
  - **Roxo** `[sentença]` (rodada S, dia 2): “Objeção acolhida! A prova do livro de ponto e da televisão contradiz a testemunha” — S#29
- **SELO**: "OBJEÇÃO ACEITA" e "6 LUZES · ZEROU, CONDENOU"
- **MEME**: `big-brain-patrick`
- **SOM**: `pagina` no Registro, `batida-porta` no martelo.

# SÓ VOCÊ VÊ — "O FAROL APAGOU DUAS VEZES"

## B1 — Quinze anos atrás · 1:12–1:42
- **TELA**: cartão "SÓ VOCÊ VÊ" (lacre de cera com um olho-farol). Gravura animada em azul-noite e âmbar, com chuva riscada: "12 DE MARÇO · 15 ANOS ATRÁS". O jovem Rubi, de lanterna, tranca a porta da torre por fora; a luz bate no anel dourado de âncora; relógio "22:50". O farol apaga. Um barco sem luzes entra na enseada. "23:10": o pesqueiro "ESTRELA DO MAR" bate nas pedras; três pescadores na água, um deles de boné verde-lima olhando para a torre (seta "PERIDOTO"). "23:40": Anselmo quebra a janela, religa a luz, escreve no livro e esconde a página na base da lente. Martelo: Anselmo condenado (retrato do promotor Dr. Valdomiro com a etiqueta "MENTOR DO PROMOTOR DE HOJE"). Um mês depois: envelope do estaleiro do Rubi passando de mão em mão; o pescador de boné lima pega e fecha a boca.
- **NARRAÇÃO**: "Agora o que só você sabe. Quinze anos atrás, noite de tempestade. O Rubi, engenheiro do porto, tranca o faroleiro Anselmo do lado de fora e apaga o farol, pro barco de contrabando dele entrar sem ser visto. Um pesqueiro bate nas pedras. O Anselmo religa a luz, escreve o que viu e esconde a página dentro da lente. Mesmo assim é condenado. E um pescador que se salvou viu tudo, aceitou dinheiro do estaleiro do Rubi e nunca contou. Guarda esse pescador: Peridoto."
- **SELO**: "15 ANOS ATRÁS · 22:50" e "GUARDA ESSE NOME: PERIDOTO"
- **SOM**: `bomba-distante` (trovão) e `vento-radioativo` (vento de tempestade).

## B2 — A noite da festa · 1:42–2:20
- **TELA**: planta do museu em corte (salão da lente, corredor, terraço, sala de segurança, salão da festa com lareira, porta dos fundos) e embaixo a régua de latão da linha do tempo em JetBrains Mono. Cada horário acende um ponto e um bonequinho anda: "22:10" Rubi vai ao terraço ("vou fazer uma ligação"; plaquinha "SEM SINAL"). "22:12" vigia larga o posto (TV com a final). "22:14" celular da Lia: "Pode vir, estou abrindo agora." para "Patrocinador". "22:16" Lia abre o compartimento. "22:18": a tela escurece, só o número 22:18 fica 1 s em vermelho. Lia risca no piso a âncora dentro do círculo. "22:22" a caixa de curativos abre, dois saem. "22:26" a página cai na lareira, metade não queima. "22:27" no corredor escuro, a Quartzo cruza um homem de terno, mão enfaixada, anel de âncora. "22:28" ela ajoelha ao lado da Lia (sangue na manga, cacos no casaco) e vê o compartimento vazio. "22:35" foge pela porta dos fundos; o vigia vê. Balão dela para a polícia: "Eu nunca entrei no salão da lente."
- **NARRAÇÃO**: "Hoje, festa de inauguração do Museu do Farol, que o Rubi patrocina. A restauradora Lia achou o esconderijo na base da lente e mandou mensagem pro Rubi: pode vir, estou abrindo agora. Ele veio. Às dez e dezoito, mata a Lia com o extintor. Guarda esse minuto. Antes de morrer, ela risca um desenho no chão. Ele se corta num caco, pega dois curativos e queima a página na lareira. Às dez e vinte e sete, a Quartzo, filha do faroleiro, cruza com ele no corredor escuro. Acha a Lia caída, ajoelha pra socorrer, entra em pânico e foge. E mente pra polícia que nunca entrou ali."
- **SELO**: "22:18 · GUARDA ESSE MINUTO" e "22:27 · O CORREDOR ESCURO"
- **SOM**: `notification-pop` na mensagem das 22:14, `heartbeat` no 22:18.

## B3 — Por que a inocente parece culpada · 2:20–2:46
- **TELA**: Quartzo (quartzo rosa, colar de âncora) no banco dos réus. As provas da polícia caem no Registro, uma por vez: casaco com sangue da vítima na manga e cacos nos bolsos; relatório do vigia (fuga 22:35); "Eu nunca entrei no salão da lente"; e o desenho do piso. Tela dividida: à esquerda o colar dela (só a âncora); à direita o anel do Rubi visto de frente (o aro dourado é o círculo, a âncora no meio). O desenho do piso desliza por cima dos dois: não encaixa no colar, encaixa no anel. Depois três cadeados de latão descem sobre três retratos, cada um com etiquetas de chave penduradas: Quartzo (2: CARTA DO PAI + CASACO), Topázio (1: LIVRO DE PONTO), Peridoto (2: JORNAL ANTIGO + PÁGINA QUEIMADA). As etiquetas ficam 3 s, só para o público.
- **NARRAÇÃO**: "Pra polícia, a culpada é ela: sangue da vítima na manga, cacos no casaco, fuga e mentira. E o desenho do chão é uma âncora, igual ao colar dela. Só que olha direito: é uma âncora dentro de um círculo. O colar é só a âncora. O anel do Rubi é a âncora dentro do aro. E três pessoas guardam segredo trancado a cadeado, que só abre com a prova certa. As chaves estão na tela. As advogadas não sabem quais são."
- **SELO**: "O CÍRCULO É O ANEL" e "5 CADEADOS · AS CHAVES SÓ VOCÊ VÊ"
- **MEME**: `side-eye-dog`
- **SOM**: `pegar-item` em cada prova, `alcapao` nos cadeados.
