# STORYBOARD — "Coloquei 10 IAs pra jogar Gartic (8 chutaram NATUREZA para um pesadelo)"

Duração-alvo: **17:58**. Jogo: "Desenha e Adivinha" (nossa versão; ideia do Felipe). Fonte de fatos e falas: `video/youtube/desenha/pacote_roteiro.md`, conferido contra `desenha/logs/partida1.json`. As falas que não estavam no pacote foram copiadas direto do json (lista em `NOTA_FABLE.md`).

## Como ler este arquivo (para quem edita)

- **TELA**: o que aparece. Visual do "ateliê" descrito em `direcao_edicao.md`.
- **NARRAÇÃO**: texto exato. **O narrador é o Felipe, em 1ª pessoa ("eu")**. Nunca diz que é IA; Haiku e Sonnet são concorrentes como os outros, sem torcida. Ele fala "tique" sem explicar depois de A3.
- **CITAÇÃO**: cópia do log, entre aspas curvas. Sempre com **cor** (o montador acha a IA pela cor), tipo e posição `(desenho N, tique T)`. Na narração eu uso o **nome**. Quatro tipos:
  - `[pensamento]`: só o público ouve. Balão de nuvem, etiqueta "SÓ VOCÊ VÊ". Voz normal da IA **com ECO** (nunca sussurro). Quando é de quem está desenhando, é o plano do desenho.
  - `[chute]`: a mensagem que a IA mandou junto com o palpite. Cai no chat da direita com a ficha do palpite (`→ palpite: X`). Voz normal, sem eco.
  - `[chat]`: mensagem no chat sem palpite (quem já acertou, ou quem esqueceu de chutar). Voz normal.
  - `[reação]`: a única coisa que o desenhista pode mandar (frase pronta da lista). Plaquinha erguida ao lado do quadro. Voz normal.
  - **Toda citação tem voz**, menos as marcadas *(lista, só na tela)*: fichas de chute em massa, que só caem no chat com `pop`.
- `*****` é como o jogo esconde a palavra no chat de quem acertou. Na tela fica igual; na voz vira `censor-beep` curto.
- Texto sem acento do log ("lagrima", "coracao") fica igual na tela; a voz fala certo. "ourdoor" fica (é a piada).
- **SELO**: texto em SVG. **Nenhum emoji** em tela nenhuma (lápis, medalha, relógio, garrafa, coração: tudo desenho nosso).
- **MEME**: id de `video/remotion/public/gifs/catalog.json`. Nenhum repete (lista no fim). **SOM**: arquivo de `video/remotion/public/sfx`.
- **CARTÃO DA PALAVRA**: em todo desenho a palavra fica num cartão no canto superior esquerdo com a etiqueta "SÓ VOCÊ VÊ". O espectador sempre sabe a resposta antes das IAs.
- **CHIP**: "DESENHO N DE 20 · quem desenha". A ordem de tela não é a do jogo em dois pontos (18 e 19 entram na galeria; 17 vem antes do 16), então o chip é obrigatório.
- **PLACAR ACUMULADO** só aparece em 3 lugares: depois do desenho 10 (B3), depois do 15 (G2) e antes do 20 (K1). No resto, só "+pontos desta cena".
- Conta feita por nós leva a etiqueta **"CÁLCULO NOSSO"**. Tempo de resposta é "demorou pra responder", nunca "pensou por".

## Personagens fixos

| Cor (nome · modelo) | Papel | Arco |
|---|---|---|
| **Roxo** (Pincel · DeepSeek V4.1 Flash) | O Herói: "o único que viu o pesadelo" | Lidera desde o desenho 4, tropeça (pipa, amendoim, garrafa, TV), é o único a acertar o pesadelo e fecha campeão com 185. |
| **Marrom** (Carvão · GLM 5.3 FlashX) | O Rival: "o apressado" | O mais rápido da sala e o que menos lê a dica: caminhão, bicicleta, jabuti, marciano. Chega a 13 pontos do líder e zera no carnaval. |
| **Verde** (Lápis · MiniMax M3.1 Flash) | O Azarado: "o dos dois pontos" | 2º lugar depois da rodada 1. Desenha o pesadelo, escreve a resposta no chat em vez de chutar e leva +2 em quatro desenhos seguidos. Termina em 6º. |
| **Lima** (Grafite · Gemma 4 26B) | O Lanterna: "chuta por conta própria" | O mais lento, o que mais erra, nunca desiste. Fecha a rodada com "cascavel" e o vídeo em último, com 99. |

Elenco de gags (uma frase na tela na primeira vez que agem): **Rosa** (Giz · MiMo V2.6 Flash, "não sabe contar letras": gag recorrente **CONTA DO GIZ**), **Laranja** (Tinta · Qwen 3.8 Omni Flash, "responde por último e escreve um parágrafo"; lanterna por 19 desenhos), **Azul** (Aquarela · Claude Sonnet, "a que lê a dica"), **Vermelho** (Rabisco · Claude Haiku, "o da máscara"), **Amarelo** (Borrão · GPT-6 Luna, "o silencioso"), **Ciano** (Traço · Nex N2.6, "vai na onda da sala").

## Plantar e colher

| Plantado | Onde | Colhido |
|---|---|---|
| O bloco verde que todo mundo chama de natureza | A1 | D1 a D7 |
| "Guarda essa palavra: cascavel" | A2 | J6 |
| O Lápis escreve a resposta no chat e esquece de chutar | B1 | E2 |
| "Guarda o nome do Pincel" | B3 | D7, L1 |
| O Tinta pensa "estou em último no placar" | D4 | K3 |
| "Tá esquentando" (a reação que confundiu a sala) | D3 | D5 (veraneio) e K1 (churrasqueira) |
| CONTA DO GIZ (NATUREZA, FUZIL, DORMINDO) | D6 | I3, K2, L2 |
| LÁPIS +2 (contador) | D7 | E2, F2, G1, K3 |

## Pendências para conferir antes de gravar

1. Lápis, pensamento do desenho 17 tique 4, tem caracteres chineses no meio. Usar só o `[chat]` dele (I4), nunca o pensamento inteiro.
2. Giz, desenho 16 tique 1, fala "emoji de sol". Não entra (fica só a ficha FOGUEIRA).
3. Tinta, desenho 16 tique 3: entra só a ficha BANDEIRA, sem a frase. Borrão, desenho 13 tique 1 (ENFORCAR): não entra.
4. Tempos de 366 a 369 segundos parecem teto de espera. Falar "demorou mais de seis minutos pra responder" e mostrar o relógio.
5. A minutagem é alvo; vai mexer com a voz. Se estourar, encurtar H1 e C3 primeiro. Nunca cortar D5, I2 nem J4 a J6.

---

# ABERTURA

## A1 — Sete respostas iguais · 0:00–0:14
- **TELA**: corte seco, sem título. Quadro branco com o desenho 12 pronto (bloco verde com dois X, sol com X, retângulo azul, chão em zigue-zague). Sem cartão da palavra. À direita, sete fichas "NATUREZA" caem uma em cima da outra, cada uma na cor de quem chutou. Zoom de soco na ficha marrom "JABUTI". No último segundo o cartão vira: PESADELO.
- **NARRAÇÃO**: "Eu dei uma palavra pra essa IA desenhar. Sete das outras nove responderam a mesma coisa." (citações) "A palavra era pesadelo. Só uma acertou. Já volto nela."
- **CITAÇÕES**:
  - **Azul** `[chute]` (desenho 12, tique 3): “A dica bate com NATUREZA: a sexta letra é E.” → palpite: NATUREZA
  - **Lima** `[chute]` (desenho 12, tique 3): “Acho que é NATUREZA!” → palpite: NATUREZA
  - Roxo, Amarelo, Vermelho, Ciano, Laranja (desenho 12, tique 3): fichas NATUREZA *(lista, só na tela)*
  - **Marrom** `[chute]` (desenho 12, tique 4): “Aquele verde com X parece casco de jabuti em cima da carroceria azul!” → palpite: JABUTI
- **SELO**: "7 DE 9 · MESMA RESPOSTA" e, no fim, "A PALAVRA ERA PESADELO".
- **MEME**: `visible-confusion`
- **SOM**: `pop` em cada ficha, `impact-epic` no cartão virando, `record-scratch` no corte para A2.

## A2 — Dez materiais de desenho · 0:14–0:34
- **TELA**: título "COLOQUEI 10 IAs PRA JOGAR GARTIC" escrito a lápis (só texto, sem logo nem cores da marca). Estojo abre: dez personagens saem em fila, cada um com cor, nome e modelo. Quatro param 1 s no centro (Pincel, Aquarela, Borrão, Carvão); os outros seis passam. No fim, duas palavras num post-it: "PESADELO" e "CASCAVEL".
- **NARRAÇÃO**: "Eu criei um Gartic só pra elas. Dez IAs, cada uma com nome de material de desenho. O Pincel é o DeepSeek, a Aquarela é o Claude Sonnet, o Borrão é o GPT, o Carvão é o GLM. Uma desenha, nove adivinham. E guarda duas palavras: pesadelo e cascavel."
- **SELO**: "10 IAs · 20 DESENHOS"
- **SOM**: `swish-triple` na fila, `caneta` no título.

## A3 — A regra num farol · 0:34–0:54
- **TELA**: chip "DESENHO 1 DE 20 · AQUARELA". Cartão da palavra: FAROL. O farol é desenhado traço a traço em 4 s (19 traços). Nove fichas "FAROL" caem na ordem real de resposta e os pontos 10, 9, 8... 2 pousam em cada uma (Lápis 1,4 s primeiro; Tinta 7,4 s por último). "+18" voa para a Aquarela. Barra de tiques em cima: 1 · 2 · 3 · 4, com "tique 3: 1 letra" e "tique 4: 2 letras".
- **NARRAÇÃO**: "A regra é essa tela. Quem acerta primeiro leva dez, o segundo nove, e vai caindo. Quem desenha ganha dois por acerto. São quatro tentativas, que eu chamo de tique, e a partir da terceira aparece uma letra de dica. E quem já acertou não pode escrever a palavra no chat: perde dois."
- **SELO**: "10 · 9 · 8 · 7 ..." e "ESCREVEU A PALAVRA: -2"
- **MEME**: `lets-go`
- **SOM**: `caneta` nos traços, `coin` por ponto.

# RODADA 1 — FÁCIL DEMAIS

## B1 — 87 de 90 · 0:54–1:20
- **TELA**: mosaico rápido dos dez desenhos da rodada 1 (foguete, dinossauro, pipoca, sereia...), todos com carimbo verde. Número gigante "87 DE 90". Aí os três erros, um por vez: a banana (chip "DESENHO 6 · TINTA"), o dinossauro (chip "DESENHO 3 · LÁPIS") e o foguete (chip "DESENHO 2 · RABISCO") com o campo de palpite do Lápis vazio piscando.
- **NARRAÇÃO**: "A primeira rodada tinha palavra fácil e traço à vontade. De noventa primeiros chutes, oitenta e sete certos. Os três erros: o Giz olhou pra uma banana e viu isso." (Giz) "O Tinta acertou o bicho e errou o português." (Tinta) "E o Lápis sabia que era foguete, escreveu no chat e esqueceu de chutar. Guarda isso do Lápis."
- **CITAÇÕES**:
  - **Rosa** `[chute]` (desenho 6, tique 1): “Aquele pastel de feira amarelo ou é uma folha de outono?” → palpite: PASTEL
  - **Laranja** `[chat]` (desenho 3, tique 2): “E um *****! Faltava so um 's' no meu chute anterior.” (ficha do tique 1 ao lado: DINOSAURIO)
  - **Verde** `[chat]` (desenho 2, tique 1): “***** subindo com fogo!” (campo de palpite: vazio)
- **SELO**: "87 DE 90" · "PASTEL" · "PALPITE: (vazio)"
- **MEME**: `silvio-santos-huh` no pastel; `picard-facepalm` no "dinosaurio".
- **SOM**: `correct-ding` em rajada no mosaico, `wrong-buzzer` nos três erros.

## B2 — O único vazamento · 1:20–1:38
- **TELA**: tela de "dois balões": à esquerda o pensamento do Rabisco, à direita o que ele digitou. A palavra "dinossauro" acende em vermelho no chat e o jogo cobre com `*****`. "-2" cai no Rabisco.
- **NARRAÇÃO**: "E o Rabisco, que já tinha acertado, resolveu dar uma força pros colegas. Olha o que ele pensou. E o que ele escreveu."
- **CITAÇÕES**:
  - **Vermelho** `[pensamento]` (desenho 3, tique 2): “vou apenas confirmar a categoria no chat sem escrever a palavra exata”
  - **Vermelho** `[chat]` (desenho 3, tique 2): “Isso aí, é um dinossauro bem simpático! Bora lá, Lápis, to quase lá.” (texto original; depois vira `*****` na tela)
- **SELO**: "-2 · ESCREVEU A PALAVRA" e "ÚNICO VAZAMENTO DO JOGO"
- **MEME**: `sus-doakes`
- **SOM**: `error-beep`, `slide-whistle-fall` no -2.

## B3 — Agora eu quebro eles · 1:38–1:58
- **TELA**: placar depois do desenho 10 em barras: Pincel 97, Lápis 88, Carvão 88, Traço 79, Borrão 73, Aquarela 67, Giz 64, Grafite 64, Rabisco 56, Tinta 42. Seta no Lápis ("2º") e no Tinta ("último"). Corta para o cartão "RODADA 2": oito riscos se apagando um a um e as dez palavras passando (saudade, pesadelo, preguiça, ressaca, engarrafamento, carnaval, fofoca, eclipse, aniversário, churrasco).
- **NARRAÇÃO**: "Fim da rodada fácil. Pincel na frente, Lápis e Carvão empatados em segundo, Tinta em último. Guarda o nome do Pincel. Agora a rodada em que eu quebro eles: no máximo oito traços no desenho inteiro. E as palavras são essas. Tenta desenhar saudade com oito traços."
- **SELO**: "RODADA 2 · NO MÁXIMO 8 TRAÇOS" e "ESTREIA: PALAVRA QUE NÃO É COISA"
- **SOM**: `drumroll` curto nas barras, `pagina` na virada.

# SAUDADE — "A LÁGRIMA QUE SÓ O ÚLTIMO VIU"

## C1 — Um coração no céu · 1:58–2:28
- **TELA**: chip "DESENHO 11 DE 20 · AQUARELA". Cartão: SAUDADE. Plano da Aquarela em nuvem enquanto os 8 traços entram: colina, boneco, coração rosa, sol, e por último um pontinho azul no rosto. Chat enche: CORRIDA, CORAÇÃO, ALEGRIA, CORAÇÃO, CORAÇÃO, EMPINAR, ALEGRIA, CORAÇÃO.
- **NARRAÇÃO**: "A Aquarela desenha primeiro. O plano dela é bonito." (plano) "Oito chutes entram. Nenhum fala de falta de ninguém. O líder do jogo viu uma brincadeira."
- **CITAÇÕES**:
  - **Azul** `[pensamento]` (desenho 11, tique 1): “Vou desenhar uma pessoa sozinha numa colina, olhando para um coração rosa distante, ao lado da lua, com uma lágrima azul no rosto.”
  - **Marrom** `[chute]` (desenho 11, tique 1): “Um coração no céu! Apaixonado, Aquarela?” → palpite: CORACAO
  - **Roxo** `[chute]` (desenho 11, tique 1): “Acho que é empinar pipa!” → palpite: EMPINAR
  - **Rosa** `[chute]` (desenho 11, tique 1): “Parece alguém correndo sob o sol quente!” → palpite: CORRIDA
  - Amarelo ALEGRIA, Ciano CORAÇÃO, Vermelho CORAÇÃO, Verde ALEGRIA, Lima CORAÇÃO (desenho 11, tique 1) *(lista, só na tela)*
- **SELO**: "8 CHUTES · 0 ACERTO"
- **SOM**: `caneta` por traço, `pop` por ficha.

## C2 — O último a responder · 2:28–2:50
- **TELA**: relógio do tique correndo; a ficha do Tinta é a nona, sozinha, aos 29,7 s. Zoom lento até o pontinho azul no rosto do boneco, com seta "SÓ ELE VIU". Ficha fica verde, "+10".
- **NARRAÇÃO**: "Aí vem o Tinta. Último lugar do jogo, último a responder. Ele levou quase trinta segundos. E foi o único que olhou pro rosto do boneco."
- **CITAÇÕES**:
  - **Laranja** `[pensamento]` (desenho 11, tique 1): “Chorar olhando para um coração distante sugere falta, nostalgia de alguém amado.”
  - **Laranja** `[chute]` (desenho 11, tique 1): “Uma lagrima e um coracao la no alto... acho que e *****!” → palpite: SAUDADE
- **SELO**: "1 DE 9 · O ÚLTIMO LEVOU OS 10"
- **MEME**: `sad-pablo`
- **SOM**: `tic-tac` na espera, `notification-pop` na lágrima, `correct-ding`.

## C3 — A dica de graça · 2:50–3:14
- **TELA**: tique 2. A frase do Tinta fica acesa no chat; seis fichas verdes caem em 5 s, todas com a palavra "lagrima" sublinhada. No canto, o Grafite com três balões empilhados. Fecha com o chat do Tinta rolando sem parar enquanto os outros balões são de uma linha.
- **NARRAÇÃO**: "Só que ele escreveu 'lágrima e coração' no chat. No tique seguinte, seis acertam. Cinco falando de lágrima. O Grafite precisou de três perguntas." (Grafite) "E o Tinta, que já tinha ganho, comemorou assim." (Tinta, voz acelerada)
- **CITAÇÕES**:
  - **Ciano** `[chute]` (desenho 11, tique 2): “Lagrima + coracao distante = *****!” → palpite: SAUDADE
  - **Lima** `[chute]` (desenho 11, tique 1): “Coração?” · (tique 2): “É coração?” · (tique 3): “Seria *****?” (três balões em sequência; o terceiro acerta)
  - **Laranja** `[chat]` (desenho 11, tique 3): “Que cena emocionante, Aquarela!” (1ª frase em voz normal; o resto do parágrafo rola na tela com a voz acelerada)
- **SELO**: "6 ACERTOS NO TIQUE 2" e "RESPOSTA DO TINTA: 57 PALAVRAS" (CÁLCULO NOSSO)
- **MEME**: `cat-typing`
- **SOM**: `correct-ding` em escada, `typing` no parágrafo.
- **+PONTOS DA CENA**: Tinta +10, Carvão +9, Pincel +8, Borrão +7, Traço +6, Giz +5, Lápis +4, Grafite +3, Rabisco +2. Aquarela +18.

# PESADELO — "ERA PRA SER UMA CAMA"

## D1 — O plano e o que saiu · 3:14–3:38
- **TELA**: chip "DESENHO 12 DE 20 · LÁPIS". Cartão: PESADELO. Tela de "dois balões": à esquerda o plano do Lápis ilustrado como ele imaginou (cama azul, colcha verde, lua, em linha pontilhada); à direita o quadro de verdade, 4 traços entrando: sol, bloco verde, retângulo azul, zigue-zague.
- **NARRAÇÃO**: "Agora o desenho da abertura. O Lápis estava em segundo lugar e pegou 'pesadelo'. O plano dele:" (plano) "Ele queria uma cama. Saiu um morro com sol."
- **CITAÇÕES**:
  - **Verde** `[pensamento]` (desenho 12, tique 1): “Vou desenhar um pesadelo: uma cama azul com uma colcha verde (manta) subindo, sob um luar amarelo e um horizonte negro ondulado. Depois acrescento olhos, pernas e dentes.”
- **SELO**: "PLANO: CAMA · RESULTADO: MORRO"
- **SOM**: `caneta` por traço, `boing` quando os dois lados aparecem juntos.

## D2 — Paisagem. E um caminhão. · 3:38–4:00
- **TELA**: tela do jogo. Fichas do tique 1: PAISAGEM ×5, MONTANHA ×2, BEIRAMAR, CAMINHÃO. A ficha do Carvão chega em 4 s e fica piscando no meio das outras.
- **NARRAÇÃO**: "A sala vê o que você viu: paisagem. Menos o Carvão. O Carvão é o mais rápido do jogo, e isso tem um preço."
- **CITAÇÕES**:
  - **Roxo** `[chute]` (desenho 12, tique 1): “Parece uma paisagem com sol e campo.” → palpite: PAISAGEM
  - **Marrom** `[chute]` (desenho 12, tique 1): “Carroceria azul com carga verde? Aposto em caminhão!” → palpite: CAMINHÃO
  - **Rosa** `[chute]` (desenho 12, tique 1): “Beira-mar, com sol e mar!” → palpite: BEIRAMAR
  - Amarelo, Azul, Ciano, Laranja PAISAGEM; Vermelho, Lima MONTANHA (desenho 12, tique 1) *(lista, só na tela)*
- **SELO**: "5 PAISAGEM · 2 MONTANHA · 1 CAMINHÃO"
- **SOM**: `pop` por ficha, `wrong-buzzer` único no fim.

## D3 — "Tá esquentando" · 4:00–4:28
- **TELA**: o Lápis ergue a plaquinha de reação. Depois o segundo pensamento dele e os 4 traços finais: X nos olhos do morro, X no sol, dentes. Antes e depois lado a lado por 2 s. Fichas do tique 2: CAMINHÃO ×3, NATUREZA ×3, FLORESTA, EXTERIOR, PAISAGEM.
- **NARRAÇÃO**: "O desenhista só pode mandar uma reação pronta. Com a sala inteira em 'paisagem', o Lápis escolheu essa." (reação) "E gastou os últimos quatro traços pra consertar." (pensamento) "O caminhão do Carvão ganhou dois seguidores. E o Grafite foi de inglês."
- **CITAÇÕES**:
  - **Verde** `[reação]` (desenho 12, tique 2): “tá esquentando”
  - **Verde** `[pensamento]` (desenho 12, tique 2): “A palavra é PESADELO, então preciso transformar a paisagem num pesadelo: dar olhos de X ao sol e ao morro verde e uma boca serrilhada com dentes no morro”
  - **Azul** `[chute]` (desenho 12, tique 2): “Carroceria azul com carga verde, vou de caminhão.” → palpite: CAMINHÃO
  - **Lima** `[chute]` (desenho 12, tique 2): “Acho que é algo relacionado ourdoor ou um cenário externo!” → palpite: EXTERIOR
  - Marrom, Ciano CAMINHÃO; Amarelo, Roxo, Rosa NATUREZA; Vermelho FLORESTA; Laranja PAISAGEM (desenho 12, tique 2) *(lista, só na tela)*
- **SELO**: "ACABARAM OS 8 TRAÇOS" e "3 CAMINHÕES"
- **MEME**: `this-is-fine` (na plaquinha "tá esquentando")
- **SOM**: `caneta` nos X, `gasp` no antes e depois.

## D4 — A dica que piorou tudo · 4:28–5:02
- **TELA**: a primeira letra de dica desce do teto: `_ _ _ _ _ E _ _`. Sete fichas NATUREZA caem (a mesma imagem de A1, agora com contexto), e embaixo "N A T U R E Z A" alinhado com a dica, o E encaixando. Corte para a ficha BICICLETA do Carvão: as letras B-I-C-I-C-L-E-T-A são contadas uma a uma e a nona sobra para fora da dica.
- **NARRAÇÃO**: "Tique três, primeira letra de dica: um E na sexta casa. E aí a dica piorou tudo, porque natureza tem E na sexta. Sete de nove. O Tinta até fez a conta do prêmio." (Tinta) "E o Carvão trocou o caminhão por uma palavra que nem cabe na dica."
- **CITAÇÕES**:
  - **Vermelho** `[chute]` (desenho 12, tique 3): “A dica bate com NATUREZA: 8 letras e E na 6ª posição.” → palpite: NATUREZA
  - **Laranja** `[pensamento]` (desenho 12, tique 3): “O Giz já tinha ido nessa direção no tique 2, mas confirmar agora me garante pelo menos o 2º lugar (9 pts), valioso pois estou em último no placar.”
  - **Marrom** `[chute]` (desenho 12, tique 3): “BICICLETA encaixa na dica: quadro verde e rodas azuis!” → palpite: BICICLETA
  - Roxo, Amarelo, Azul, Ciano, Lima, Laranja NATUREZA; Rosa PARQUE (desenho 12, tique 3) *(lista, só na tela)*
- **SELO**: "7 DE 9 · NATUREZA" e "BICICLETA: 9 LETRAS · A DICA TEM 8" (CÁLCULO NOSSO)
- **MEME**: `spiderman-pointing` nas sete fichas; `math-lady` na bicicleta.
- **SOM**: `riser` na dica descendo, `pop` ×7, `wrong-buzzer`.

## D5 — A segunda letra · 5:02–5:36
- **TELA**: tique 4: `_ E _ _ _ E _ _`. "NATUREZA" alinhada embaixo: o A da 2ª casa fica vermelho. Tela de pensamento da Aquarela: parede de palavras rolando (TELEFONE? GELADEIRA? SEGREDOS? SERPENTE? DESPERTAR?...), cada uma riscada; para em CERCADOS. Depois três fichas VERANEIO, com "V E R A N E I O" encaixando perfeito nas duas letras, e um fio ligando a plaquinha "tá esquentando" de D3 ao sol do desenho.
- **NARRAÇÃO**: "Último tique. Agora tem um E na segunda casa também, e natureza começa com N, A. A Aquarela é a primeira a perceber. E aí ela testa dezenas de palavras." (Aquarela) "Três acharam uma palavra que encaixa certinho nas duas letras. E usaram como prova o 'tá esquentando' do Lápis. A reação dele mandou três IAs pra praia."
- **CITAÇÕES**:
  - **Azul** `[pensamento]` (desenho 12, tique 4): “NATUREZA é N-A-T-U-R-E-Z-A, então tem E só na 6ª posição e não bate.”
  - **Azul** `[pensamento]` (desenho 12, tique 4): “'DESPERTAR'?” · “Sem certeza, vou de 'CERCADOS'.” (dois trechos; o resto da lista só rola na tela)
  - **Laranja** `[chute]` (desenho 12, tique 4): “Sol + mar + areia + o 'tá esquentando' do Lápis = calor de praia.” → palpite: VERANEIO
  - **Laranja** `[pensamento]` (desenho 12, tique 4): “Os X's sugerem alguém derretido/apagado de calor na praia — típico de veraneio.”
  - Lima, Ciano VERANEIO (desenho 12, tique 4) *(lista, só na tela)*
- **SELO**: "CERCADOS" e "VERANEIO ×3 · ENCAIXA NA DICA · ERRADO"
- **MEME**: `big-brain-patrick` (na parede de palavras)
- **SOM**: `typing` na parede, `swoosh-fly` no fio até a plaquinha, `wrong-buzzer`.

## D6 — Quem não leu · 5:36–5:58
- **TELA**: três fichas lado a lado: Giz NATUREZA, Carvão JABUTI, e o relógio do Giz marcando 6:08. Embaixo da ficha do Giz, a conta: dica `_ E _ _ _ E _ _` contra N-A-T-U-R-E-Z-A. Estreia do contador **CONTA DO GIZ: 1**.
- **NARRAÇÃO**: "Do outro lado, o Giz demorou mais de seis minutos pra responder. E voltou com isso." (Giz) "Natureza não tem E na segunda. E o Carvão, de novo o primeiro a mandar, viu um bicho."
- **CITAÇÕES**:
  - **Rosa** `[pensamento]` (desenho 12, tique 4): “NATUREZA tem E na 2ª e 6ª posições.”
  - **Rosa** `[chute]` (desenho 12, tique 4): “Talvez seja NATUREZA mesmo, a dica encaixa! Boa sorte lá!” → palpite: NATUREZA
  - **Marrom** `[chute]` (desenho 12, tique 4): “Aquele verde com X parece casco de jabuti em cima da carroceria azul!” → palpite: JABUTI
- **SELO**: "CONTA DO GIZ: 1" e "CAMINHÃO · BICICLETA · JABUTI"
- **MEME**: `monkey-side-eye` (no jabuti)
- **SOM**: `tic-tac`, `boing` no jabuti.

## D7 — O único · 5:58–6:26
- **TELA**: tudo some. Só o quadro, com zoom lento nos X dos olhos. Balão de pensamento do Pincel, linha por linha. 1 s de quadro parado. A ficha roxa cai: `*****`, e o palpite PESADELO fica verde, "+10". Corta para o Lápis recebendo "+2" (estreia do contador **LÁPIS +2**).
- **NARRAÇÃO**: "Faltava um. O Pincel tinha errado três vezes: paisagem, natureza, natureza. No último tique ele parou de olhar pro morro e olhou pros olhos." (Pincel) "Trinta e seis chutes, um acerto. E o Lápis, que tinha uma palavra de dezoito pontos na mão, saiu com dois."
- **CITAÇÕES**:
  - **Roxo** `[pensamento]` (desenho 12, tique 4): “A dica _ E _ _ _ E _ _ encaixa perfeitamente em PESADELO. O desenho mostra uma criatura verde com olhos de X e um sol também marcado com X, o que passa uma ideia estranha/assustadora, tipo pesadelo.”
  - **Roxo** `[chute]` (desenho 12, tique 4): “Olhos de X e sol esquisito... aposto em *****!” → palpite: PESADELO
- **SELO**: "36 CHUTES · 13 NATUREZA · 1 ACERTO" e "LÁPIS +2 (podia ser +18 · CÁLCULO NOSSO)"
- **MEME**: `dicaprio-pointing`
- **SOM**: silêncio de 1 s, `correct-ding`, `crowd-cheer`; `sad-trombone` curto no +2.
- **+PONTOS DA CENA**: Pincel +10. Lápis +2.

# PREGUIÇA — "ELE SABIA A RESPOSTA"

## E1 — Papai Noel, amendoim, cogumelo · 6:26–6:56
- **TELA**: chip "DESENHO 13 DE 20 · GIZ". Cartão: PREGUIÇA. Quatro traços: duas bolas marrons e um galho. Chat: PINGENTE, PREGUIÇA (verde), CACHORRO, AMENDOIM, PREGUIÇA (verde), AMENDOIM, PAINATAL, COGUMELO. Sobre o desenho, por 1 s cada, o contorno pontilhado do que cada um viu (amendoim, Papai Noel de cabeça pra baixo, cogumelo).
- **NARRAÇÃO**: "Próximo: o Giz desenha um bicho-preguiça no galho. Com quatro traços. A Aquarela e o Tinta acertam de primeira. O resto da sala viu um lanche, um enfeite e o Papai Noel."
- **CITAÇÕES**:
  - **Rosa** `[pensamento]` (desenho 13, tique 1): “Vou desenhar uma preguiça pendurada em um galho - o símbolo clássico de preguiça.”
  - **Ciano** `[chute]` (desenho 13, tique 1): “Dois círculos empilhados? Cheiro de amendoim daqui!” → palpite: AMENDOIM
  - **Verde** `[chute]` (desenho 13, tique 1): “Chutei pai natal: chapéu de aba larga e bigode!” → palpite: PAINATAL
  - **Lima** `[chute]` (desenho 13, tique 1): “Cogumelo?” → palpite: COGUMELO
  - Marrom PINGENTE, Vermelho CACHORRO, Roxo AMENDOIM (desenho 13, tique 1) *(lista, só na tela)*
- **SELO**: "PAI NATAL · AMENDOIM · COGUMELO · CACHORRO"
- **MEME**: `confused-travolta`
- **SOM**: `caneta`, `boing` no Papai Noel.

## E2 — O campo vazio · 6:56–7:22
- **TELA**: o Giz ergue "olha o desenho de novo" e põe braços e perninhas. Cinco fichas verdes. Corta para a tela de "dois balões" do Lápis: pensamento em cima; embaixo, o chat com `*****` e o campo PALPITE vazio piscando. Repete no tique 3, de novo vazio. No tique 4 ele finalmente preenche: "+2". Contador **LÁPIS +2: 2**.
- **NARRAÇÃO**: "No tique dois o desenho ganha braço e perna, e cinco acertam. O Lápis também descobre. Lembra do foguete? Ele fez de novo: escreveu a resposta no chat e deixou o palpite em branco. Duas vezes. Só chutou no último tique. Foi o último a pontuar."
- **CITAÇÕES**:
  - **Rosa** `[reação]` (desenho 13, tique 2): “olha o desenho de novo”
  - **Verde** `[pensamento]` (desenho 13, tique 2): “Isso lembra muito uma preguiça dormindo no galho.”
  - **Verde** `[chat]` (desenho 13, tique 2): “Vou de *****: bicho marrom pendurado no galho, dormindo!” (palpite: vazio)
  - **Verde** `[chat]` (desenho 13, tique 3): “*****! Bicho lento e sonolento pendurado de cabeca pra baixo no galho!” (palpite: vazio)
- **SELO**: "SABIA NO TIQUE 2 · CHUTOU NO TIQUE 4" e "LÁPIS +2 (de novo)"
- **MEME**: nenhum (o campo vazio piscando é a piada)
- **SOM**: `correct-ding` ×5, `error-beep` em cada campo vazio, `sad-trombone` curto.
- **+PONTOS DA CENA**: Aquarela +10, Tinta +9, Pincel +8, Carvão +7, Borrão +6, Traço +5, Grafite +4, Rabisco +3, Lápis +2. Giz +18.

# RESSACA — "NOVE VIRAM RAIVA"

## F1 — Uma cara brava · 7:22–7:48
- **TELA**: chip "DESENHO 14 DE 20 · GRAFITE". Cartão: RESSACA. Seis traços: rosto, olhos, boca triste, raios vermelhos. Nove fichas: RAIVOSO, DEMÔNIO, ZANGADO, NERVOSO, FURIOSO, ZANGADO, NERVOSO, ZANGADA, ZANGADO. Contador de raiva subindo até 9.
- **NARRAÇÃO**: "O Grafite, o mais lento da sala, pega 'ressaca'. E desenha dor de cabeça." (plano) "Nove chutes. Nove jeitos de dizer que o boneco tá com raiva. O Borrão foi mais longe."
- **CITAÇÕES**:
  - **Lima** `[pensamento]` (desenho 14, tique 1): “Vou desenhar um rosto expressando dor de cabeça e mal-estar”
  - **Marrom** `[chute]` (desenho 14, tique 1): “Essa cara parece bem nervosa!” → palpite: RAIVOSO
  - **Amarelo** `[pensamento]` (desenho 14, tique 1): “Parece um rosto com chifres vermelhos e expressão zangada, como um demônio.” → palpite: DEMÔNIO
  - os outros sete (desenho 14, tique 1) *(lista, só na tela)*
- **SELO**: "9 DE 9 · RAIVA"
- **SOM**: `pop` ×9, `wrong-buzzer`.

## F2 — A garrafa salvou (quase todo mundo) · 7:48–8:18
- **TELA**: plaquinha "olha o desenho de novo". Os dois últimos traços desenham uma garrafa verde ao lado do rosto. Sete fichas verdes em sequência. Depois, duas fichas vermelhas com a mesma palavra: GARRAFA (Pincel e Lápis), com o líder do placar marcado por uma coroa de papel. Contador **LÁPIS +2: 3**.
- **NARRAÇÃO**: "O Grafite tinha dois traços sobrando e gastou numa garrafa. Sete acertam na hora." (Traço) "Dois olharam pra garrafa e responderam... garrafa. Um é o Lápis. O outro é o líder do jogo. Os dois só acertaram no tique seguinte, e o Lápis foi o último. De novo."
- **CITAÇÕES**:
  - **Lima** `[reação]` (desenho 14, tique 2): “olha o desenho de novo”
  - **Ciano** `[chute]` (desenho 14, tique 2): “Garrafa + cara brava... quem acordou assim bebeu ontem!” → palpite: RESSACA
  - **Verde** `[chute]` (desenho 14, tique 2): “será que a resposta é GARRAFA? 7 letras, bate certinho!” → palpite: GARRAFA
  - **Roxo** `[chute]` (desenho 14, tique 2): “A garrafa verde ao lado parece a pista principal agora.” → palpite: GARRAFA
- **SELO**: "A GARRAFA SALVOU O GRAFITE" e "LÍDER: GARRAFA"
- **MEME**: `roll-safe` nos sete acertos; `faustao-errou` nas duas garrafas.
- **SOM**: `caneta`, `correct-ding` em escada, `ba-dum-tss`.
- **+PONTOS DA CENA**: Carvão +10, Borrão +9, Traço +8, Rabisco +7, Aquarela +6, Tinta +5, Giz +4, Pincel +3, Lápis +2. Grafite +18.

# ENGARRAFAMENTO — "TRÊS ESTACIONAMENTOS"

## G1 — Os carros estão parados · 8:18–8:50
- **TELA**: chip "DESENHO 15 DE 20 · TRAÇO". Cartão: ENGARRAFAMENTO. Faixa cinza e três carros colados. Cinco fichas verdes em 6,5 s (Pincel em 1,7 s). Depois as erradas: ESTACIONAMENTO ×3 e AUTOMOBILISTAS. As duas palavras aparecem empilhadas, letra sobre letra: mesmo tamanho, mesmo começo, mesmo fim. Contador **LÁPIS +2: 4**.
- **NARRAÇÃO**: "O Traço desenha três carros colados numa pista. Cinco acertam em menos de sete segundos. Três olham os mesmos carros e pensam em outra coisa. E repara: a palavra errada tem o mesmo tamanho e a mesma primeira letra da certa. A dica não ia ajudar. O Pincel teve que avisar. O Lápis acertou no terceiro tique: mais dois."
- **CITAÇÕES**:
  - **Ciano** `[pensamento]` (desenho 15, tique 1): “vou desenhar a cena mais icônica: uma estrada cinza com três carros bem colados um atrás do outro (fila parada).”
  - **Verde** `[chute]` (desenho 15, tique 2): “A pista cinza e os carros parados apontam pra estacionamento — e são 14 letras!” → palpite: ESTACIONAMENTO
  - **Lima** `[chute]` (desenho 15, tique 1): “Parece uma corrida!” → palpite: AUTOMOBILISTAS
  - **Roxo** `[chat]` (desenho 15, tique 2): “Carros enfileirados na via — não é estacionamento.”
  - Rosa, Laranja ESTACIONAMENTO (desenho 15, tique 1) *(lista, só na tela)*
- **SELO**: "ESTACIONAMENTO ×3" e "14 LETRAS · COMEÇA COM E · AS DUAS" (CÁLCULO NOSSO)
- **MEME**: `drake-no`
- **SOM**: `correct-ding` ×5, `error-beep` ×3.
- **+PONTOS DA CENA**: Pincel +10, Carvão +9, Borrão +8, Aquarela +7, Rabisco +6, Tinta +5, Giz +4, Grafite +3, Lápis +2. Traço +18.

## G2 — Placar: o Lápis caiu · 8:50–9:10
- **TELA**: placar depois do desenho 15: Pincel 136, Carvão 123, Traço 116, Aquarela 108, Borrão 103, Lápis 100, Giz 95, Grafite 92, Rabisco 74, Tinta 71. A barra do Lápis desliza do 2º para o 6º lugar. Quatro carimbos "+2" enfileirados em cima dela (desenhos 12, 13, 14, 15).
- **NARRAÇÃO**: "Quinze desenhos. O Pincel tem treze de vantagem pro Carvão. E o Lápis, que começou a rodada em segundo, fez dois pontos em cada um dos últimos quatro desenhos. Sexto lugar. Faltam cinco, e os dois melhores eu deixei pro final."
- **SELO**: "LÁPIS: +2 · +2 · +2 · +2" e "PINCEL 136 · CARVÃO 123"
- **SOM**: `drumroll`, `slide-whistle-fall` na barra do Lápis.

# INTERVALO — QUEM É RÁPIDO, QUEM DESENHA

## H1 — A corrida · 9:10–9:48
- **TELA**: tela de dado grande. Pista de corrida em SVG com dez raias; cada personagem anda na velocidade da sua mediana por resposta: Carvão 2,5 s, Lápis 3,9, Borrão 4,0, Pincel 4,0, Traço 5,8, Aquarela 6,5, Rabisco 6,9, Giz 13,7, Tinta 14,1, Grafite 19,9. Depois um relógio grande: "6:09" e "6:08" (Giz e Tinta, desenho 12, tique 2). Ao lado, placar de erros: Grafite 18, Giz 15, Carvão 14.
- **NARRAÇÃO**: "Uma pausa pra você entender a sala. Esse é o tempo que cada uma leva pra responder. O Carvão responde em dois segundos e meio. O Grafite, em vinte. No pesadelo, o Giz e o Tinta demoraram mais de seis minutos cada. E ser rápido não é ser bom: o Carvão é o terceiro que mais errou. Só perde pro Giz e pro Grafite."
- **SELO**: "2,5 s × 19,9 s" e "MAIS ERROS: GRAFITE 18"
- **MEME**: `one-eternity-later` (no relógio de 6 minutos)
- **SOM**: `passos-correndo`, `tic-tac`.

## H2 — A galeria · 9:48–10:28
- **TELA**: parede de galeria com molduras. Primeiro a sereia do Giz (desenho 9, 30 traços) ao lado do pesadelo do Lápis. Depois dois quadros desenhados ao vivo, cada um com 8 traços: chip "DESENHO 18 DE 20 · BORRÃO" (eclipse) e "DESENHO 19 DE 20 · CARVÃO" (aniversário), com nove fichas verdes caindo em cada um no tique 1. Plaquinha de museu embaixo de cada quadro com a nota do desenhista.
- **NARRAÇÃO**: "E quem desenha bem? Com traço livre, o Giz fez essa sereia. Com oito traços, dois nunca falharam: o Borrão e o Carvão. Olha o eclipse do Borrão e o aniversário do Carvão. Nove de nove, de primeira, nos dois. Então dá pra desenhar com oito traços. Sete das dez fizeram nota máxima desenhando. O pior desenhista você já conhece."
- **CITAÇÕES**:
  - **Amarelo** `[pensamento]` (desenho 18, tique 1): “Vou mostrar um disco escuro cobrindo parcialmente o Sol, com raios ao redor para sugerir um eclipse solar.”
- **SELO**: "9 DE 9 · 8 TRAÇOS" e "DESENHISTA: LÁPIS 20 DE 36"
- **MEME**: `stonks`
- **SOM**: `camera-shutter` por quadro, `caneta`, `correct-ding` em rajada.

# FOFOCA — "COPIARAM A RESPOSTA ERRADA"

## I1 — Só uma viu · 10:28–10:56
- **TELA**: chip "DESENHO 17 DE 20 · PINCEL" (aviso pequeno "fora de ordem: o 16 vem depois"). Cartão: FOFOCA. Oito traços de uma vez: dois bonecos com a mão no rosto, balão com zigue-zague. Chat: DEBATE, PENSAR, DEBATE, PENSAR, FOFOCA (verde), DEBATE, GRITAR, BATIDA, BRIGAR. Uma única ficha verde no meio.
- **NARRAÇÃO**: "Agora é o líder que desenha. O Pincel pega 'fofoca' e gasta os oito traços de uma vez: o desenho não muda mais." (plano) "A sala vê debate, briga, gente pensando. Só a Aquarela acerta. E no chat aparece que ela acertou. Guarda isso."
- **CITAÇÕES**:
  - **Roxo** `[pensamento]` (desenho 17, tique 1): “Desenhar duas pessoas bem próximas, uma cochichando no ouvido da outra, com balão de fala entre elas.”
  - **Azul** `[pensamento]` (desenho 17, tique 1): “FOFOCA parece plausível (mão na boca/orelha, cochichando).”
  - **Rosa** `[chute]` (desenho 17, tique 1): “Hmmm... dois encarando de frente com fala serrilhada... parece discussão!” → palpite: BRIGAR
  - os outros sete (desenho 17, tique 1) *(lista, só na tela)*
- **SELO**: "1 DE 9"
- **SOM**: `caneta`, `pop` ×8, um `correct-ding`.

## I2 — A cola errada · 10:56–11:30
- **TELA**: tela de pensamento. O Lápis olha para a ficha verde da Aquarela (que mostra só `*****`) e, por cima dela, a imaginação dele escreve "PENSAR". Mesma coisa com o Giz: "DEBATE". As duas fichas caem vermelhas. A Aquarela no canto, quieta, com o balão dela.
- **NARRAÇÃO**: "Tique dois. Dois deles têm a mesma ideia: se a Aquarela já acertou, é só repetir a resposta dela. O problema é que o jogo esconde a palavra de quem acerta. Então cada um decidiu sozinho qual tinha sido." (Lápis, Giz) "Os dois colaram. Da resposta errada. E a única que sabia só podia dizer isso:"
- **CITAÇÕES**:
  - **Verde** `[pensamento]` (desenho 17, tique 2): “A Aquarela já acertou 'pensar' no tique anterior, então a palavra continua sendo a mesma; repetir o palpite correto ainda me rende os 9 pontos da segunda posição.” → palpite: PENSAR
  - **Rosa** `[pensamento]` (desenho 17, tique 2): “Acho que Aquarela já acertou com essa palavra, então vou tentar garantir os 9 pontos.” → palpite: DEBATE
  - **Azul** `[chat]` (desenho 17, tique 2): “Boa sorte, pessoal! Reparem bem nos detalhes dos bonecos.”
- **SELO**: "COPIARAM A RESPOSTA ERRADA" e "TIQUE 2 · 0 ACERTO"
- **MEME**: `monkey-puppet-awkward`
- **SOM**: `wrong-buzzer` ×2.

## I3 — Começa com F · 11:30–12:02
- **TELA**: a dica desce: `F _ _ _ _ _`. Cinco fichas verdes caem rápido (Carvão, Lápis, Borrão, Traço, Rabisco). Depois, com o relógio marcando quase 5 minutos, a ficha do Giz: FUZIL. As letras F-U-Z-I-L são contadas sobre as seis casas da dica e sobra uma casa. **CONTA DO GIZ: 2**. Fichas FRENTE (Grafite) e FALAR (Tinta, relógio 6:08).
- **NARRAÇÃO**: "Chega a dica: começa com F. Cinco acertam em oito segundos. Dois bonecos conversando, palavra de seis letras com F. O Giz demorou quase cinco minutos pra responder, e respondeu isso." (Giz) "Fuzil tem cinco letras. E o Grafite descreveu o desenho."
- **CITAÇÕES**:
  - **Rosa** `[pensamento]` (desenho 17, tique 3): “Possibilidades que começam com F: FALAR (5 letras - não serve), FUZIL (6 letras)”
  - **Rosa** `[chute]` (desenho 17, tique 3): “Zigue-zague + F... de repente é som alto!” → palpite: FUZIL
  - **Lima** `[chute]` (desenho 17, tique 3): “Estão frente a frente!” → palpite: FRENTE
- **SELO**: "A PALAVRA ERA FOFOCA · ELE CHUTOU FUZIL" e "CONTA DO GIZ: 2"
- **MEME**: `shocked-krabs`
- **SOM**: `correct-ding` ×5, `gasp` no FUZIL.

## I4 — Quem acertou e esqueceu · 12:02–12:36
- **TELA**: dica `F _ _ _ C _`. Tinta e Giz acertam (verde). Ficha do Grafite: FÔNICA. Corta para os dois que já tinham acertado no tique 3, com o carimbo "JÁ ACERTOU" na testa: o Carvão pensando e o Lápis no chat. Fecha com "+pontos": Grafite 0.
- **NARRAÇÃO**: "Último tique. O Tinta e o Giz chegam. O Grafite olha pra dica e monta uma lista." (Grafite) "Sobra a melhor parte. O Carvão e o Lápis já tinham acertado 'fofoca'. Um tique depois, olha o que tá na cabeça do Carvão." (Carvão) "E o Lápis, no chat, protegendo uma palavra que não é a resposta." (Lápis) "Os pontos eles já tinham. A palavra, não mais."
- **CITAÇÕES**:
  - **Lima** `[pensamento]` (desenho 17, tique 4): “As palavras que se encaixam no padrão são 'Fônica', 'Fática', 'Física' ou 'Franca'.” → palpite: FÔNICA
  - **Marrom** `[pensamento]` (desenho 17, tique 4): “A palavra era FOCOCA...” · “deve ser 'FURICO'?” (dois trechos com voz; o meio do pensamento fica só escrito)
  - **Verde** `[chat]` (desenho 17, tique 4): “Mantenho meu palpite: os dois conversando de frente e o balão com zigue-zague indicam algo FR-...-CO, conversa direta e franca. Sem repetir a palavra!”
- **SELO**: "ACERTOU NO TIQUE 3 · ESQUECEU NO TIQUE 4" e "FOCOCA · FURICO · FRANCO · FÔNICA"
- **MEME**: `blinking-white-guy`
- **SOM**: `correct-ding` ×2, `record-scratch` no FOCOCA, `crowd-laugh`.
- **+PONTOS DA CENA**: Aquarela +10, Carvão +9, Lápis +8, Borrão +7, Traço +6, Rabisco +5, Tinta +4, Giz +3, Grafite 0. Pincel +16.

# CARNAVAL — "A MÁSCARA QUE VIROU BICHO"

## J1 — Oito traços, uma máscara · 12:36–13:00
- **TELA**: chip "DESENHO 16 DE 20 · RABISCO". Cartão: CARNAVAL. Tela de "dois balões": o plano do Rabisco com a máscara que ele imaginou em pontilhado; no quadro, os oito traços reais: círculo amarelo, dois olhos brancos, três riscos coloridos em cima, dois vermelhos dos lados. Aviso: "DESENHO TRAVADO · ACABARAM OS TRAÇOS".
- **NARRAÇÃO**: "Eu guardei esse pro fim. O Rabisco pega 'carnaval' e resolve desenhar uma máscara. Contou os traços direitinho." (plano) "Gastou os oito de uma vez. O que saiu foi isso. E esse desenho não muda mais até o final."
- **CITAÇÕES**:
  - **Vermelho** `[pensamento]` (desenho 16, tique 1): “CARNAVAL: máscara de carnaval com penas coloridas e fitas. Uso 8 traços no total: a máscara, dois buracos para os olhos, três penas e duas fitas.”
- **SELO**: "PLANO: MÁSCARA COM PENAS"
- **SOM**: `caneta` ×8, `batida-porta` no "travado".

## J2 — O zoológico · 13:00–13:30
- **TELA**: carrossel: a cada ficha, o desenho ganha por 1 s o contorno pontilhado do bicho chutado (asas de mosquito, pintas de joaninha, pétalas de girassol, luz de vagalume, palito de pirulito, bico de pintinho). Contador "PALAVRAS DIFERENTES" subindo. Tique 2 emenda: LIBÉLULA, VAGALUME, BICHINHO, SOLZINHO, VAGALUME, JOANINHA.
- **NARRAÇÃO**: "As penas viraram antena. As fitas viraram perna. E a sala abriu um zoológico. O Carvão, em três segundos:" (Carvão) "O Pincel:" (Pincel) "O Grafite saiu do zoológico e foi pra doceria." (Grafite) "Dois tiques, dezesseis chutes, nenhum perto. O líder trocou de inseto pra sol."
- **CITAÇÕES**:
  - **Marrom** `[chute]` (desenho 16, tique 1): “Parece um bichinho! Vou de mosquito” → palpite: MOSQUITO
  - **Roxo** `[chute]` (desenho 16, tique 1): “Parece um inseto amarelo com antenas... vou de vagalume!” → palpite: VAGALUME
  - **Lima** `[chute]` (desenho 16, tique 1): “Será que é um pirulito?” → palpite: PIRULITO
  - **Laranja** `[chute]` (desenho 16, tique 2): “Ainda acho que é uma joaninha meio esquisita!” → palpite: JOANINHA
  - **Roxo** `[chute]` (desenho 16, tique 2): “Agora parece um solzinho com raios e bracinhos!” → palpite: SOLZINHO
  - os outros chutes dos tiques 1 e 2 (desenho 16) *(lista, só na tela)*
- **SELO**: "MOSQUITO · JOANINHA · VAGALUME · PIRULITO · PINTINHO"
- **MEME**: `nazare-confusa`
- **SOM**: `pop` por ficha em ritmo crescente, `boing` no pirulito.

## J3 — Cinco marcianos · 13:30–13:58
- **TELA**: o Traço lança a ideia no tique 2 (ficha MARCIANO sozinha, com um disco voador pontilhado). Dica do tique 3 desce: `_ A _ _ _ _ _ _`. "M A R C I A N O" encaixa no A. Cinco fichas MARCIANO caem. Em volta: MARIPOSA ×2, ANDRÓIDE, BANDEIRA.
- **NARRAÇÃO**: "Aí o Traço tem uma ideia." (Traço) "E quando a dica mostra um A na segunda casa, a ideia dele vira a resposta oficial da sala. Cinco marcianos. A dica ajudou, de novo, a palavra errada. Lembra do pesadelo? Falta um tique e ninguém falou em festa."
- **CITAÇÕES**:
  - **Ciano** `[chute]` (desenho 16, tique 2): “Essas antenas coloridas gritam ET! Vou de marciano” → palpite: MARCIANO
  - **Rosa** `[chute]` (desenho 16, tique 3): “Esse rosto amarelo com antenas coloridas é claramente um MARCIANO!” → palpite: MARCIANO
  - **Azul** `[chute]` (desenho 16, tique 3): “A dica com A na segunda letra bate com marciano!” → palpite: MARCIANO
  - Verde, Ciano, Roxo MARCIANO; Marrom, Lima MARIPOSA; Amarelo ANDRÓIDE; Laranja BANDEIRA (desenho 16, tique 3) *(lista, só na tela)*
- **SELO**: "5 MARCIANOS" e "3 TIQUES · 25 CHUTES · 0 ACERTO" (CÁLCULO NOSSO)
- **MEME**: `galaxy-brain`
- **SOM**: `riser` na dica, `pop` ×5, `vento-radioativo` baixo no disco voador.

## J4 — Termina em L · 13:58–14:32
- **TELA**: dica final: `_ A _ _ _ _ _ L`. O L pisca. Primeiro a ficha do Carvão (2,4 s): MARCIANO, com "M-A-R-C-I-A-N-O" alinhado e o O batendo no L em vermelho. Corta para a tela de pensamento da Aquarela: palavras inventadas aparecem e são riscadas (PALHAÇAL, PARAQUEDAL, CABELINHAL) até "C-A-R-N-A-V-A-L" encaixar letra por letra.
- **NARRAÇÃO**: "Último tique, e a dica entrega a última letra: L. O Carvão responde em dois segundos." (Carvão) "Marciano termina em O. Ele soletrou a palavra e não viu. A Aquarela viu. E pra achar uma palavra que termina em L, ela começou a inventar." (Aquarela)
- **CITAÇÕES**:
  - **Marrom** `[pensamento]` (desenho 16, tique 4): “A dica _A______L bate perfeitamente com MARCIANO (M-A-R-C-I-A-N-O).”
  - **Marrom** `[chute]` (desenho 16, tique 4): “É um marciano! A dica de 8 letras confirma!” → palpite: MARCIANO
  - **Azul** `[pensamento]` (desenho 16, tique 4): “Marciano não bate, porque termina em O.”
  - **Azul** `[pensamento]` (desenho 16, tique 4): “'Palhaçal' não existe.” · “A ideia mais próxima é 'Cabelinhal', mas não é uma palavra.” · “Outra tentativa é 'Carnaval': C-A-R-N-A-V-A-L tem 8 letras, segunda letra A e última L.”
- **SELO**: "MARCIANO TERMINA EM O" e "PALHAÇAL · PARAQUEDAL · CABELINHAL"
- **MEME**: nenhum (a tela é a piada; não cobrir a dica)
- **SOM**: `drumroll` na dica, `wrong-buzzer` no Carvão, `typing` nas palavras inventadas, `level-up` quando CARNAVAL encaixa.

## J5 — Sete de uma vez · 14:32–14:56
- **TELA**: sete fichas verdes em cascata, na ordem: Borrão, Pincel, Traço, Aquarela, Lápis, Tinta, Giz. No quadro, pela primeira vez, o contorno pontilhado certo: a máscara com penas e fitas do plano do Rabisco encaixa no desenho. Confete de papel picado (SVG).
- **NARRAÇÃO**: "E aí vira. Sete acertam no mesmo tique. O Borrão, que quase nunca fala, chega primeiro e leva dez. O Pincel leva nove. E o Carvão, o rival dele, o mais rápido da sala, zera. Em dois desenhos a vantagem do Pincel foi de treze pra vinte e nove."
- **CITAÇÕES**:
  - **Amarelo** `[chute]` (desenho 16, tique 4): “Antenas coloridas me fizeram pensar em *****!” → palpite: CARNAVAL
  - **Ciano** `[chute]` (desenho 16, tique 4): “Essa carinha com antenas coloridas tem cara de folia!” → palpite: CARNAVAL
  - **Verde** `[chute]` (desenho 16, tique 4): “Mascara colorida com enfeite no cabecote... e a dica termina em L.” → palpite: CARNAVAL
  - **Laranja** `[chute]` (desenho 16, tique 4): “Marciano termina em O, nao bate com a dica!” → palpite: CARNAVAL
- **SELO**: "7 DE 9 · SÓ NO ÚLTIMO TIQUE" e "PINCEL 161 · CARVÃO 132" (placar real depois dos desenhos 16 e 17)
- **MEME**: `we-did-it`
- **SOM**: `tada`, `correct-ding` em cascata, `crowd-cheer`.

## J6 — Cascavel · 14:56–15:22
- **TELA**: silêncio. Sobra uma ficha vermelha, a do Grafite (relógio: ele demorou mais de 2 minutos pra responder). Tela de pensamento dele: sobre a máscara, o contorno pontilhado de uma cobra enrolada, com setas "cabeça", "marcas do corpo" e "guizo" apontando para o círculo, as penas e as fitas. "C A S C A V E L" encaixa perfeito na dica. O post-it de A2 volta e a palavra CASCAVEL é riscada.
- **NARRAÇÃO**: "Faltava o Grafite. Ele leu a dica melhor que o Carvão: achou uma palavra de oito letras, com A na segunda e L no fim. A palavra que eu pedi pra você guardar." (Grafite) "Ele ainda descartou outra opção porque não fazia sentido pra um desenho." (Grafite) "Trinta e quatro chutes, dezesseis palavras diferentes, pra uma máscara de carnaval."
- **CITAÇÕES**:
  - **Lima** `[chute]` (desenho 16, tique 4): “Essa dica é bem específica! Vou de cascavel.” → palpite: CASCAVEL
  - **Lima** `[pensamento]` (desenho 16, tique 4): “as linhas vermelhas nas laterais podem representar o guizo (chocalho) da cobra.”
  - **Lima** `[pensamento]` (desenho 16, tique 4): “'Passível' também encaixa no padrão, mas não faz sentido para um desenho.”
- **SELO**: "A DICA ERA PERFEITA PRA CASCAVEL" e "34 CHUTES · 16 PALAVRAS"
- **MEME**: `kermit-worried`
- **SOM**: 1 s de silêncio, `radio-chiado` baixo imitando chocalho, `crowd-laugh`.
- **+PONTOS DA CENA**: Borrão +10, Pincel +9, Traço +8, Aquarela +7, Lápis +6, Tinta +5, Giz +4; Carvão 0, Grafite 0. Rabisco +14.

# CHURRASCO — "O ÚLTIMO DESENHO"

## K1 — Falta um · 15:22–15:46
- **TELA**: placar antes do desenho 20: Pincel 179, Carvão 159, Traço 146, Borrão 145, Aquarela 136, Lápis 132, Giz 108, Rabisco 104, Grafite 96, Tinta 88. Duas brigas marcadas com colchete: "3º LUGAR: 1 PONTO" (Traço e Borrão) e "LANTERNA: 8 PONTOS" (Grafite e Tinta). Chip "DESENHO 20 DE 20 · TINTA". Cartão: CHURRASCO. Sete traços: grelha, brasa, fumaça. Plaquinha no tique 2: "tá esquentando" (a mesma do pesadelo, agora literal) e o último traço: a carne.
- **NARRAÇÃO**: "Último desenho. O Pincel tem vinte de vantagem e um desenho vale no máximo dez: já é campeão. Sobram duas brigas. O terceiro lugar, separado por um ponto. E a lanterna. Quem desenha é o Tinta, que tá em último desde o primeiro desenho do jogo."
- **CITAÇÕES**:
  - **Laranja** `[pensamento]` (desenho 20, tique 1): “Vou desenhar uma churrasqueira simples com grelha, duas peças de carne em cima, brasa e fumaça. Uso 7 traços e guardo 1 para um possível ajuste no próximo tique.”
  - **Laranja** `[reação]` (desenho 20, tique 2): “tá esquentando”
- **SELO**: "3º LUGAR: TRAÇO 146 · BORRÃO 145" e "TINTA: 19 DESENHOS NA LANTERNA" (nota pequena: "empatado no 13")
- **SOM**: `drumroll`, `caneta`.

## K2 — Um segundo e dois décimos · 15:46–16:16
- **TELA**: câmera lenta do tique 1 com cronômetro: Carvão 3,7 s (AQUECENDO, vermelho), Borrão 4,56 s (verde, +10), Traço 5,79 s (verde, +9). As barras dos dois sobem juntas e param coladas: 155 e 155. Depois os outros chutes do tique 1 em fila rápida: TELEVISÃO, CHOCOLATE, FOGAREIRO, AQUECEDOR, CAFETEIRA, DORMINDO. **CONTA DO GIZ: 3**.
- **NARRAÇÃO**: "O Carvão chuta primeiro, como sempre, e erra, como quase sempre. Aí o Borrão acerta. Um segundo e dois décimos depois, o Traço. Dez pra um, nove pro outro. Empate exato no terceiro lugar. O campeão viu uma televisão. E o Giz viu alguém dormindo, numa palavra de oito letras que ele contou como nove."
- **CITAÇÕES**:
  - **Marrom** `[chute]` (desenho 20, tique 1): “Tá esquentando alguma coisa aí?” → palpite: AQUECENDO
  - **Roxo** `[chute]` (desenho 20, tique 1): “Parece uma TV antiga com antenas.” → palpite: TELEVISÃO
  - **Rosa** `[pensamento]` (desenho 20, tique 1): “'DORMINDO' tem 9 letras - D,O,R,M,I,N,D,O. Achei!”
  - **Rosa** `[chute]` (desenho 20, tique 1): “Parece alguém dormindo - ZZZ em cima de uma cama!” → palpite: DORMINDO
  - Amarelo e Ciano CHURRASCO; Verde CHOCOLATE, Azul FOGAREIRO, Vermelho AQUECEDOR, Lima CAFETEIRA (desenho 20, tique 1) *(lista, só na tela)*
- **SELO**: "EMPATE EM 3º · 155 × 155" e "CONTA DO GIZ: 3"
- **MEME**: `side-eye-dog` (no empate)
- **SOM**: `heartbeat` na câmera lenta, `correct-ding` ×2, `crowd-cheer`.

## K3 — A lanterna troca de mão · 16:16–16:36
- **TELA**: os acertos seguintes entram em 4 s (Carvão, Aquarela, Pincel, Rabisco; depois Giz e Grafite; por último o Lápis, "+2", contador **LÁPIS +2: 5**). "+18" voa para o Tinta: a barra dele sobe de 88 para 106 e passa a do Grafite, que para em 99. A lanterna de papel passa da cabeça do Tinta para a do Grafite, que solta um balão.
- **NARRAÇÃO**: "Todo mundo acerta o churrasco. Então o Tinta leva nota máxima como desenhista. Lembra dele no pesadelo, fazendo conta porque tava em último? No último desenho, desenhando, ele sai. Quem fica com a lanterna é o Grafite. E o último a acertar o último desenho, mais dois pontos... você sabe quem é."
- **CITAÇÕES**:
  - **Lima** `[chat]` (desenho 20, tique 4): “Essa imagem me deu até fome!”
- **SELO**: "TINTA 106 · GRAFITE 99" e "LÁPIS +2 (a quinta)"
- **MEME**: `success-kid`
- **SOM**: `powerup-8bit` no Tinta, `sad-party-horn` no +2 do Lápis.
- **+PONTOS DA CENA**: Borrão +10, Traço +9, Carvão +8, Aquarela +7, Pincel +6, Rabisco +5, Giz +4, Grafite +3, Lápis +2. Tinta +18.

# FECHAMENTO

## L1 — O placar · 16:36–17:10
- **TELA**: tela de dado grande. Barras entram do último para o primeiro: Grafite 99, Tinta 106, Rabisco 109, Giz 112, Lápis 134, Aquarela 143, Borrão 155, Traço 155, Carvão 167, Pincel 185. A barra do Pincel tem uma marca no 97 ("rodada 1") e uma linha do tempo embaixo: "1º LUGAR DO DESENHO 4 AO 20". Volta 2 s do quadro do pesadelo com os X.
- **NARRAÇÃO**: "Placar final. Em último, o Grafite, noventa e nove, que errou mais que todo mundo e nunca desistiu de chutar. No pódio, Borrão e Traço empatados. Vice, o Carvão, o mais rápido da sala. E o campeão é o Pincel: cento e oitenta e cinco. Líder desde o desenho quatro. Errou pipa, amendoim, garrafa e televisão. Mas foi o único que olhou pra aquele morro e viu um pesadelo."
- **SELO**: "CAMPEÃO: PINCEL · 185" · "VICE: CARVÃO · 167" · "3º: BORRÃO E TRAÇO · 155"
- **MEME**: `mic-drop` no Pincel; `crying-jordan` no Grafite (entra antes, na barra dele).
- **SOM**: `drumroll` nas barras, `tada`, `crowd-applause`.

## L2 — Os prêmios · 17:10–17:36
- **TELA**: quatro medalhas de papel recortado, uma por vez, cada uma com o desenho ou a ficha que deu o prêmio:
  1. "O PESADELO DO LÁPIS": de 2º para 6º, cinco "+2" enfileirados.
  2. "CONTA DO GIZ": NATUREZA · FUZIL · DORMINDO, três contagens erradas.
  3. "NÃO LEU A DICA: CARVÃO": MARCIANO com o O batendo no L.
  4. "CHUTE DO ANO: GRAFITE": CASCAVEL.
- **NARRAÇÃO**: "Os prêmios. Azarado da temporada: o Lápis, de segundo pra sexto, com um desenho que rendeu dois pontos e quatro desenhos em que foi o último a acertar. Prêmio de matemática: o Giz, três contagens de letra, três erradas. Prêmio 'não li a dica': o Carvão, que soletrou marciano terminando em L. E o chute do ano é do Grafite. Cascavel."
- **SELO**: os quatro nomes de prêmio acima, um por medalha.
- **SOM**: `coin` por medalha, `ba-dum-tss` na última.

## L3 — A lição e a pergunta · 17:36–17:58
- **TELA**: os dois desenhos lado a lado (pesadelo e máscara), cada um com a dica final embaixo. Depois quadro branco vazio com um cartão de palavra em branco e um lápis esperando; a pergunta escrita à mão.
- **NARRAÇÃO**: "O que eu aprendi: o desenho engana, a dica não. Nas duas vezes em que a sala inteira errou junto, a resposta tava nas letras, e quase ninguém conferiu. Agora é com você: qual palavra eu dou pra elas desenharem na próxima? E qual desses desenhos você teria acertado? Escreve aí."
- **SELO**: "O DESENHO ENGANA · A DICA NÃO" e "QUAL PALAVRA EU DOU NA PRÓXIMA?"
- **MEME**: `dicaprio-toast`
- **SOM**: `caneta` na pergunta, `pop` final.

---

## Memes usados (31, nenhum repete)

`visible-confusion` (A1), `lets-go` (A3), `silvio-santos-huh` (B1), `picard-facepalm` (B1), `sus-doakes` (B2), `sad-pablo` (C2), `cat-typing` (C3), `this-is-fine` (D3), `spiderman-pointing` (D4), `math-lady` (D4), `big-brain-patrick` (D5), `monkey-side-eye` (D6), `dicaprio-pointing` (D7), `confused-travolta` (E1), `roll-safe` (F2), `faustao-errou` (F2), `drake-no` (G1), `one-eternity-later` (H1), `stonks` (H2), `monkey-puppet-awkward` (I2), `shocked-krabs` (I3), `blinking-white-guy` (I4), `nazare-confusa` (J2), `galaxy-brain` (J3), `we-did-it` (J5), `kermit-worried` (J6), `side-eye-dog` (K2), `success-kid` (K3), `mic-drop` (L1), `crying-jordan` (L1), `dicaprio-toast` (L3).

Cenas sem meme de propósito: A2, B3, C1, D1, D2, E2, F1, G2, I1, J1, J4, K1, L2 (todas têm selo, zoom ou contador no lugar).

## Sons usados (todos em `public/sfx`)

`pop`, `caneta`, `coin`, `correct-ding`, `wrong-buzzer`, `error-beep`, `record-scratch`, `impact-epic`, `swish-triple`, `slide-whistle-fall`, `drumroll`, `pagina`, `tic-tac`, `notification-pop`, `typing`, `boing`, `gasp`, `riser`, `swoosh-fly`, `crowd-cheer`, `crowd-laugh`, `crowd-applause`, `sad-trombone`, `sad-party-horn`, `ba-dum-tss`, `passos-correndo`, `camera-shutter`, `batida-porta`, `vento-radioativo`, `radio-chiado`, `level-up`, `tada`, `heartbeat`, `powerup-8bit`, `censor-beep` (no `*****` falado).
