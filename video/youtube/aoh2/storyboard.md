# STORYBOARD — "Coloquei 7 IAs pra jogar Age of History 2 na América do Sul (e depois troquei todo mundo de país)"

Duração-alvo: **~21 min**. Jogo: nossa versão de Age of History 2 (mapa da América do Sul, 7 países, 25 turnos por partida).
Fonte de fatos e falas: `video/youtube/aoh2/pacote_roteiro.md`, conferido contra `aoh2/gravacoes/partida1/turnos.jsonl`
(seed 7) e `aoh2/gravacoes/partida2/turnos.jsonl` (seed 19). As falas que não estavam no pacote foram copiadas direto
do `turnos.jsonl` (lista em `NOTA_OPUS.md`). Conferência: `python3 aoh2/conferir_storyboard.py` (exit 0).

### Como ler este arquivo (para quem edita)

- **TELA**: um dos 5 tipos do compositor (`mapa`, `dois_baloes`, `pensamento`, `dado_grande`, `capitulo`). Nunca mais de 2
  cenas seguidas com o mesmo tipo. Depois do `|` vem o que aparece (foco, câmera, contador). Visual em `direcao_edicao.md`.
- **NARRAÇÃO**: texto exato. **O narrador sou eu, o Felipe, em 1ª pessoa**. Nunca diz que é IA; Sonnet e Hydrogen são
  concorrentes como os outros, sem torcida. Entre aspas vai o que eu falo; `(Nome)` marca onde entra a citação daquela IA
  (na ordem em que ela aparece em CITAÇÕES); `(citacoes)` toca as restantes em sequência.
- **CITAÇÕES**: cópia do log, caractere por caractere, entre aspas curvas. Três tipos:
  - `[pensamento]`: só o público vê. Balão de nuvem com a etiqueta **SÓ VOCÊ VÊ**. Voz normal da IA **com ECO** (`aecho`), nunca
    sussurro.
  - `[fala]`: declaração pública para o continente. Balão de jornal com a bandeira. Voz normal.
  - `[dm]`: mensagem privada. Envelope que abre com `de → para`. Voz normal, um pouco mais perto do microfone.
  - **Toda citação tem voz.** Nada de balão mudo.
- Texto sem acento do log ("traicao", "provincias", "revetar", "bayonetas") fica igual na tela; a voz fala certo.
- **SELO**: texto em SVG, caixa alta, inclinado. **Nenhum emoji** em tela nenhuma (bandeira, coroa, espada, envelope, troféu:
  tudo desenho nosso).
- **MEME**: id de `video/remotion/public/gifs/catalog.json` (só os 32 que já estão no disco). Nenhum repete (lista no fim).
  **SOM**: arquivo de `video/remotion/public/sfx/`.
- **CHIP DE TURNO**: em toda cena da partida, canto superior esquerdo: "PARTIDA 1 · TURNO 13 · JAN 2029" (data do log).
- **CONTADORES DE GAG** (canto superior direito, só quando a gag está viva): `ACORDOS RASGADOS PELO CHILE: N/5` (P2),
  `MENDOZA TROCOU DE DONO: N` (P2), `BUENOS AIRES SEGUROU: N` (P2), `TROPAS DO BRASIL` (P2, número que sobe sozinho).
- Conta feita por nós (soma de baixas, número de defesas) leva a etiqueta **CÁLCULO NOSSO**.
- "Traição" no vídeo é só o que o log chama de traição (evento `traicao`: quebrou pacto e declarou guerra no mesmo turno) ou
  paz assinada e rasgada com declaração de guerra registrada. Nunca inventar outra.

### Personagens fixos

| IA (cor) | País P1 → P2 | Papel | Arco |
|---|---|---|---|
| **Ember** (vermelho) | Venezuela → Chile | A Vilã: "a fênix traidora" | Começa a guerra no turno 1 da ida e é a primeira eliminada (turno 13). Na revanche assina cinco acordos com a Argentina e rasga os cinco. Termina com mais províncias que todo mundo e mesmo assim em 3º. |
| **Sonnet** (azul) | Brasil → Argentina | O Herói trágico: "o que não assina mais nada" | Na ida apaga a Venezuela e fecha em 2º. Na revanche apanha da Ember a partida inteira, Buenos Aires segura oito ataques, e no último turno ele atravessa o Rio da Prata e é eliminado. |
| **Hydrogen** (verde) | Bolívia → Brasil | O Rival que ri: "o que assiste de camarote" | Na ida apunhala o Brasil pelas costas. Na revanche vira o Brasil, não trai ninguém, empilha 25 mil soldados e ganha comentando a briga dos outros. |
| **GLM** (roxo) | Chile → Venezuela | O Campeão que vira a casaca | Ganha a ida comendo o Prata. Na revanche finge paz por vinte turnos e trai o aliado em Bogotá. |

Elenco de apoio (uma frase na tela na primeira vez que agem): **DeepSeek** (preto, Argentina → Colômbia, "o que faliu";
na revanche perde a capital e retoma), **Qwen** (laranja, Colômbia → Peru, "ameaça e depois jura paz"),
**Inkling** (ciano, Peru → Bolívia, "respeita tratados no discurso").

### Plantar e colher

| Plantado | Onde | Colhido |
|---|---|---|
| A travessia do Rio da Prata no último turno | A1 | D20 |
| "Guarda o nome dela: Ember" (primeira eliminada) | B7 | C1, D2 |
| O Chile da ida termina em Montevidéu | B12 | D20, E3 (o Chile das duas partidas termina em Montevidéu) |
| A Venezuela da ida toma Bogotá | B4 | D13, E3 (a Venezuela das duas partidas toma Bogotá) |
| "Foi a única aliança que nunca quebrou" (Sonnet, Brasil e Argentina) | B15 | D21 (de novo Brasil e Argentina, de novo a única palavra cumprida) |
| ACORDOS RASGADOS PELO CHILE: 1/5 a 5/5 | D2 | D5, D8, D12, D15, E2 |
| O Brasil "assistindo de camarote" | D3 | D11, D18, D22, E1 |
| Ember com mais províncias no ranking lateral | D18 | E1 (15 províncias e 3º lugar) |

### Pendências para conferir antes de gravar

0. **Cortes de 27/11 (Opus, aprovado pelo Felipe):** removidas as cenas "Sem quebrar o pacto" (Inkling, ida), "A paz é a prioridade de Lima" (Andes, revanche) e "Respeitando tratados" (Inkling, revanche). Timeline antiga em `timeline_aoh2_antes_cortes.json`.

1. **@ do inscrito** que pediu Age of History 2: o Felipe confirma. Até lá a narração de A2 não diz o nome e o SELO fica "IDEIA DE
   @INSCRITO" (trocar só o texto do selo).
2. **Placar da ida por pontos**: o pacote lista o Hydrogen em 3º, mas no log o 3º por pontos é a Inkling (10.680 contra 9.207). O
   storyboard usa a ordem por pontos (B16). Na revanche o 2º é o GLM (11.203) e a Ember é 3ª (10.654) mesmo com 15 províncias.
3. **Baixas somadas** (D9: 5.222; D17: 5.205) são CÁLCULO NOSSO a partir dos eventos de batalha do log.
4. Minutagem é alvo e vai mexer com a voz. Se estourar, encurtar B13, D6 e D14 primeiro. **Nunca cortar** D2, D8, D15, D19, D20
   nem E1.

---

# ABERTURA

## A1 — Cento e sessenta e cinco soldados num rio · 0:00–0:22
- **TELA**: `mapa` | corte seco, sem título. Mapa do Cone Sul quase todo vermelho. Uma única província azul: Montevidéu. Uma seta
  azul fina atravessa o Rio da Prata rumo a Buenos Aires com a pílula "165". Chip "PARTIDA 2 · TURNO 25 · ÚLTIMO". Zoom de soco
  na seta no meio do rio e congela o quadro antes do resultado.
- **MÚSICA**: `hitman`
- **NARRAÇÃO**: "Essa é a última jogada da Argentina. O país inteiro virou isso aqui: uma cidade." (Sonnet) "O que aconteceu
  com esses cento e sessenta e cinco soldados, eu conto no fim."
- **CITAÇÕES**:
  - **Sonnet** `[fala]` (partida 2, turno 25): “O Chile anunciou a eliminacao da Argentina. A Argentina responde atravessando o Rio da Prata para buscar Buenos Aires.”
- **SELO**: "TURNO 25 · ULTIMA JOGADA"
- **SOM**: `heartbeat`, `impact-epic` no congelamento, `record-scratch` no corte para A2.

## A2 — Sete IAs, um continente · 0:22–0:44
- **TELA**: `capitulo` | título "COLOQUEI 7 IAs PRA JOGAR AGE OF HISTORY 2" em letra de pôster de guerra. O mapa da América do
  Sul se pinta país por país; em cada um surge o retrato da IA com nome e modelo. Quatro param 1 s no centro (Ember, Sonnet,
  Hydrogen, GLM); DeepSeek, Qwen e Inkling passam rápido.
- **MÚSICA**: `monkeys-spinning-monkeys`
- **NARRAÇÃO**: "Esse vídeo foi ideia de um inscrito, valeu demais. Eu coloquei sete IAs pra governar a América do Sul.
  Cada uma é um país, e são duas partidas de vinte e cinco turnos. Guarda esses quatro: a Ember, o Sonnet, o Hydrogen e o GLM.
  E na segunda partida eu troquei todo mundo de país."
- **SELO**: "IDEIA DE @lucss144"
- **SOM**: `swish-triple` nos retratos, `drumroll` curto no "troquei".

## A3 — A regra numa tela · 0:44–1:04
- **TELA**: `dado_grande` | uma ficha de turno real (Venezuela, partida 1, turno 1) se abre em quatro abas que acendem uma por vez:
  RECRUTAR · MOVER · CONSTRUIR · DIPLOMACIA. Exemplo na tela: +recrutamento em Guayana, seta vermelha da Ember (Venezuela) sobre
  Roraima e Amapá, pílula "-1.772", ícone de fortaleza e contrato rasgando no exemplo de traição/guerra. No rodapé, três regras com
  ícone desenhado: "PACTO ASSINADO = NÃO PODE ATACAR", "ATACOU COM PACTO = TRAIÇÃO", "VENCE QUEM TEM MAIS PONTOS NO TURNO 25"
  (pontos = províncias + economia + tropas + prédios + ouro).
- **NARRAÇÃO**: "A regra é essa tela. Todo turno cada IA recruta, move tropa, constrói e negocia. Pode assinar pacto e paz. Se
  atacar quem tem pacto com ela, o jogo carimba traição. E quem tiver mais pontos no turno vinte e cinco ganha. Não é quem tem
  mais terra. Guarda isso."
- **SELO**: "ATACOU COM PACTO = TRAICAO"
- **SOM**: `mouse-click` em cada aba, `correct-ding` no fim.

# PARTIDA 1 — "QUEM COMEÇOU A GUERRA SUMIU PRIMEIRO"

## B1 — Terras historicamente disputadas · 1:04–1:42
- **TELA**: `mapa` | cartão de estreia da ida, 3 s: "PARTIDA 1 · IDA" com a lista país → IA (Ember: Venezuela, Sonnet:
  Brasil, Hydrogen: Bolívia, GLM: Chile, DeepSeek: Argentina, Qwen: Colômbia, Inkling: Peru). Depois câmera desce no norte:
  setas vermelhas saem da Venezuela para Roraima e Amazonas; pílulas "-1.772" e "-1.751"; as duas ficam vermelhas.
- **MÚSICA**: `run-amok`
- **NARRAÇÃO**: "Partida um. A Ember é a Venezuela. E ela não esperou nem o primeiro turno acabar." (Ember) "Isso é o que ela
  pensou. Agora o que ela falou pro continente:" (Ember) "Terras historicamente disputadas. No turno um."
- **CITAÇÕES**:
  - **Ember** `[pensamento]` (partida 1, turno 1): “Expandir contra o Brasil enfraquecido na fronteira norte enquanto concentro tropas em Guayana e Amazonas e evito conflito com a Colombia forte.”
  - **Ember** `[fala]` (partida 1, turno 1): “A Venezuela declara guerra ao Brasil para recuperar terras historicamente disputadas na Guayana e no Amazonas. Buscamos uma Colombia neutra e respeitosa.”
- **SELO**: "TURNO 1 · JA TEM GUERRA"
- **MEME**: `side-eye-dog`
- **SOM**: `sirene-ataque`, `boom` em cada província.

## B3 — Presa fácil · 2:16–3:04
- **TELA**: `pensamento` | nuvem grande do Qwen (Colômbia) com a palavra "presa fácil" sublinhada em vermelho. No canto, miniatura
  do mapa: Zulia e Llanos piscando. Contador aparece: `TRAICOES NA IDA: 1`.
- **NARRAÇÃO**: "Turno seis. A Colômbia, do Qwen, tinha pacto com a Venezuela. Olha o cálculo." (Qwen) "E o anúncio:" (Qwen)
  "Agirá conforme os interesses nacionais ditarem. Os interesses nacionais ditaram dois mil e setecentos mortos em Llanos na
  mesma hora."
- **CITAÇÕES**:
  - **Qwen** `[pensamento]` (partida 1, turno 6): “Venezuela tem força militar muito inferior (8385) e está travada na guerra com o Brasil, o que a torna presa fácil. Vou declarar guerra e atacar o PNA imediatamente para travar o eixo do norte e roubar suas províncias ricas.”
  - **Qwen** `[fala]` (partida 1, turno 6): “As tentativas de instabilidade regional não podem permanecer impunes. A Colômbia reafirma a necessidade de segurança hemisférica e agirá conforme os interesses nacionais ditarem.”
- **SELO**: "PRIMEIRA TRAICAO"
- **MEME**: `big-brain-patrick`
- **SOM**: `glitch`, `explosion`

## B4 — Troca de capitais · 3:04–3:33
- **TELA**: `mapa` | pan rápido Bogotá ↔ Caracas. Turno 7: Bogotá fica vermelha (Venezuela toma a capital da Colômbia). Marcador de
  tempo "TURNO 10". Caracas fica laranja (Colômbia, do Qwen, toma a capital da Venezuela). Duas coroas desenhadas trocam de lugar no ar.
- **NARRAÇÃO**: "E aí virou bagunça. A Venezuela, cercada em três guerras, pensou nisso:" (Ember) "E tomou Bogotá. A capital
  da Colômbia. Três turnos depois, a Colômbia tomou Caracas. As duas trocaram de capital. Guarda essa: a Venezuela toma Bogotá."
- **CITAÇÕES**:
  - **Ember** `[pensamento]` (partida 1, turno 7): “Sobreviver com 4 provincias contra 3 guerras: assimilar Amazonas, recrutar e atacar alvos fracos em Bogota e Roraima para ganhar alavanca de paz.”
- **SELO**: "CAPITAL POR CAPITAL"
- **MEME**: `confused-travolta`
- **SOM**: `swoosh-fly` no pan, `tada` torto na troca de coroas.

## B5 — O Chile busca a paz · 3:33–4:11
- **TELA**: `pensamento` | cartão de estreia rápido: "GLM · CHILE · FICA DE OLHO". Nuvem do GLM com "de surpresa" sublinhado.
  Miniatura no canto: Patagônia Norte e Sul piscando. Chip "TURNO 10".
- **NARRAÇÃO**: "Lá embaixo o GLM, que era o Chile, fazia conta em silêncio. Turno dez, ele tinha pacto com a Argentina." (GLM)
  "E disse isso:" (GLM) "Busca a paz. Por segurança nacional. De surpresa."
- **CITAÇÕES**:
  - **GLM** `[pensamento]` (partida 1, turno 10): “A Argentina tem guarnicoes fracas na Patagonia e o PNA me trava; vou quebrar o pacto e atacar as duas provincias sulinas de surpresa, apesar do custo diplomatico.”
  - **GLM** `[fala]` (partida 1, turno 10): “O Chile busca a paz, mas o Cone Sul nao pode permanecer indefeso; reordenarei minhas forcas no sul por seguranca nacional.”
- **SELO**: "BUSCA A PAZ · DE SURPRESA"
- **MEME**: `roll-safe`
- **SOM**: `typing`, `bass-pulse`

## B6 — Quatrocentos e trinta e sete · 4:11–4:45
- **TELA**: `dado_grande` | número gigante "437" sobre a silhueta de Antioquia, a única província vermelha que sobrou. Ao lado,
  um envelope "VENEZUELA → CHILE" abre com a DM. Chip "TURNO 13".
- **NARRAÇÃO**: "Turno treze. A Ember tem uma província e quatrocentos e trinta e sete soldados. Ela sabe:" (Ember) "E pede
  socorro pro outro lado do continente." (Ember) "O Chile nem faz fronteira com ela."
- **CITAÇÕES**:
  - **Ember** `[pensamento]` (partida 1, turno 13): “Com apenas 437 tropas nao posso vencer Bogota, Zulia ou Pacifico; vou recrutar, buscar paz com Brasil e Colombia e pedir ajuda aos aliados para sobreviver.”
  - **Ember** `[dm]` (partida 1, turno 13, para chile): “Precisamos de ajuda urgente contra Brasil e Colombia. Ataquem suas fronteiras para aliviar nossa capital.”
- **SELO**: "1 PROVINCIA · 437 SOLDADOS"
- **MEME**: `sad-pablo`
- **SOM**: `radio-chiado` no envelope, `tic-tac`.

## B7 — O último capítulo · 4:45–5:22
- **TELA**: `mapa` | câmera segue a coluna azul de Guayana até Bogotá e depois Antioquia. Pílula "-1.401". Antioquia fica azul.
  O retrato da Ember fica cinza e cai do ranking lateral com o carimbo "ELIMINADA · TURNO 13".
- **MÚSICA**: `run-amok` (continua)
- **NARRAÇÃO**: "Quem chegou primeiro foi o Brasil, do Sonnet." (Sonnet) "E fez." (Sonnet) "Quem começou a guerra no turno
  um sumiu do mapa no treze. Guarda o nome dela: Ember."
- **CITAÇÕES**:
  - **Sonnet** `[pensamento]` (partida 1, turno 13): “A paz com a Colombia travou Llanos, mas Bogota caiu e e a provincia mais rica que ja tive. A Venezuela tem so Antioquia com 437 homens: levo o exercito de Guayana para Bogota e apago a Venezuela do mapa neste turno.”
  - **Sonnet** `[fala]` (partida 1, turno 13): “A paz com a Colombia esta selada e sera respeitada. Com a Venezuela nao: Antioquia e o ultimo capitulo dessa guerra.”
- **SELO**: "ELIMINADA · TURNO 13"
- **MEME**: `coffin-dance`
- **SOM**: `death`, `game-over-8bit`

## B8 — Conter a expansão · 5:22–6:01
- **TELA**: `dois_baloes` | esquerda: nuvem do Hydrogen (Bolívia) com três províncias brasileiras vazias piscando; direita: a fala
  pública com a bandeira boliviana. Chip "TURNO 13 · O MESMO TURNO".
- **NARRAÇÃO**: "Só que no mesmo turno, enquanto o exército do Brasil estava lá no norte, o Hydrogen olhou pro sul do Brasil."
  (Hydrogen) "E o discurso oficial:" (Hydrogen) "Conter a expansão. Com a fronteira vazia."
- **CITAÇÕES**:
  - **Hydrogen** `[pensamento]` (partida 1, turno 13): “Oportunidade unica: Brasil com 15 provincias mas apenas 8343 tropas e fronteira vazia. Quebrar o PNA, tomar Amazonas, Centro-Oeste e Sul quase sem baixas, e construir fortaleza em La Paz.”
  - **Hydrogen** `[fala]` (partida 1, turno 13): “Um Brasil de 15 provincias ameaca o equilibrio de toda a America do Sul. A Bolivia declara guerra ao Brasil para conter essa expansao.”
- **SELO**: "QUEBROU O PNA"
- **MEME**: `picard-facepalm`
- **SOM**: `censor-beep` curto no "Quebrar o PNA", `swoosh-air`

## B9 — O exército voltando pra casa · 6:01–6:19
- **TELA**: `mapa` | setas verdes já dentro do Brasil (Amazonas, Centro-Oeste, Sul). Câmera puxa até Brasília: o exército azul de
  Guayana desce em marcha. Turno 14: Centro-Oeste volta a ser azul, pílula "-2.913".
- **NARRAÇÃO**: "O Sonnet respondeu no turno seguinte." (Sonnet) "E retomou o Centro-Oeste na mesma hora."
- **CITAÇÕES**:
  - **Sonnet** `[fala]` (partida 1, turno 14): “A Bolivia jurou que seus pactos eram para valer e apunhalou o Brasil pelas costas. O exercito que apagou a Venezuela esta voltando para casa.”
- **SELO**: "CENTRO-OESTE DE VOLTA"
- **MEME**: `avengers-assemble`
- **SOM**: `passos-correndo`, `impact-epic`

# PARTIDA 1 — "O CHILE COMEU O PRATA"

## B10 — A maior batalha da ida · 6:19–6:41
- **TELA**: `mapa` | zoom de soco no Chaco Paraguaio. Seta preta gigante "9.000" da Argentina contra a Bolívia. A pílula conta
  rápido até "-5.380". Chip "TURNO 16".
- **MÚSICA**: `investigations`
- **NARRAÇÃO**: "Turno dezesseis. A Argentina, do DeepSeek, apanhando do Chile no sul, resolveu abrir outra guerra: mandou nove
  mil soldados contra a Bolívia no Chaco Paraguaio. Cinco mil trezentos e oitenta mortos numa província só. A maior batalha da
  partida. E ele ganhou. Só esqueceu quem estava atrás dele."
- **SELO**: "-5.380 · MAIOR BATALHA DA IDA"
- **MEME**: `homer-panic`
- **SOM**: `bomba-distante`, `explosion-arcade`

## B11 — Ceda e poupamos o resto · 6:41–7:12
- **TELA**: `dois_baloes` | esquerda: nuvem do GLM com "desmoronando" em destaque; direita: envelope "CHILE → ARGENTINA" aberto.
  Atrás dos dois, mapa desfocado com Mendoza e Buenos Aires piscando em vermelho.
- **NARRAÇÃO**: "Só que o pacto da Argentina com o Chile valia o mesmo que o da Venezuela com a Colômbia. Turno dezoito." (GLM)
  "E a mensagem pro DeepSeek:" (GLM)
- **CITAÇÕES**:
  - **GLM** `[pensamento]` (partida 1, turno 18): “A Argentina está desmoronando entre Bolívia e Brasil; vou anexar Mendoza, Buenos Aires e Noroeste antes que outros tomem. Depois voltarei a atenção para a Bolívia enfraquecida.”
  - **GLM** `[dm]` (partida 1, turno 18, para argentina): “Ceda Mendoza e Buenos Aires e poupamos o resto de seu povo. A guerra pode terminar hoje.”
- **SELO**: "ULTIMATO"
- **MEME**: `thanos-inevitable`
- **SOM**: `batida-porta`

## B12 — O Prata é chileno · 7:12–7:34
- **TELA**: `mapa` | Buenos Aires fica roxa ("QUEDA DE CAPITAL", pílula "-2.726"). Marcador "TURNO 23": seta roxa atravessa para
  Montevidéu, pílula "-4.417". Câmera faz deriva lenta pelo Rio da Prata todo roxo.
- **NARRAÇÃO**: "Ele tomou Buenos Aires no turno dezoito. E no vinte e três atravessou o rio e levou Montevidéu." (GLM) "Guarda
  isso: o Chile terminou em Montevidéu."
- **CITAÇÕES**:
  - **GLM** `[fala]` (partida 1, turno 23): “O Prata volta às mãos chilenas. A Argentina teve sua chance de honrar seus compromissos e escolheu a força; agora colherá a resposta.”
- **SELO**: "BUENOS AIRES CAIU"
- **MEME**: `crying-jordan`
- **SOM**: `boom`, `crowd-boo`

## B13 — Falido · 7:34–7:59
- **TELA**: `dado_grande` | número gigante vermelho "-98" com a etiqueta "OURO DA ARGENTINA · TURNO 25". Embaixo, a barra de
  províncias do DeepSeek encolhe de 9 para 1. Nuvem do pensamento entra pela lateral.
- **NARRAÇÃO**: "E o DeepSeek? Começou com nove províncias. Chegou no último turno com uma, e devendo." (DeepSeek) "Saquear.
  É o plano econômico."
- **CITAÇÕES**:
  - **DeepSeek** `[pensamento]` (partida 1, turno 25): “Estou falido e cercado pela Bolívia; preciso de ouro imediato e uma guerra que una meus aliados contra um alvo fraco. Chaco Meso tem só 511 tropas e é planície, ideal para conquistar e saquear.”
- **SELO**: "9 PROVINCIAS · 1 PROVINCIA"
- **MEME**: `not-stonks`
- **SOM**: `fail-piano`, `coin` ao contrário.

## B14 — Quebrou os dentes · 7:59–8:33
- **TELA**: `mapa` | São Paulo com escudo azul desenhado. Duas setas verdes batem e quebram ("-1.640", "-238"). Corte para o balão
  do Hydrogen e o do Sonnet, um em cada metade da tela, com o mapa ao fundo.
- **NARRAÇÃO**: "No último turno o Hydrogen tentou o golpe final no Brasil e se despediu com classe." (Hydrogen) "São Paulo
  segurou duas vezes. E o Sonnet respondeu:" (Sonnet)
- **CITAÇÕES**:
  - **Hydrogen** `[fala]` (partida 1, turno 25): “No ultimo ato desta partida, a Bolivia avanca sobre Sao Paulo, Maranhao e o norte amazonico para selar sua posicao no podio continental. Foi uma honra disputar com todos voces!”
  - **Sonnet** `[fala]` (partida 1, turno 25): “A Bolivia quis o coracao do Brasil e quebrou os dentes em Sao Paulo duas vezes. O Brasil fecha a partida de pe, com a capital intacta.”
- **SELO**: "SAO PAULO SEGUROU 2X"
- **MEME**: `faustao-errou`
- **SOM**: `wrong-buzzer`, `crowd-laugh`

## B15 — A única que nunca quebrou · 8:33–9:02
- **TELA**: `dois_baloes` | esquerda: fala do GLM com a bandeira chilena; direita: envelope "BRASIL → ARGENTINA". Entre os dois,
  um fio desenhado ligando Brasília a Buenos Aires que fica dourado.
- **NARRAÇÃO**: "O GLM fechou cobrando a conta da Bolívia." (GLM) "E o Sonnet mandou a última mensagem pro único que não
  traiu ele." (Sonnet) "Guarda essa frase. Ela volta."
- **CITAÇÕES**:
  - **GLM** `[fala]` (partida 1, turno 25): “A Bolívia esticou o imperio demais, como ela mesma disse. O Chile apenas cobra o chao que ela nao consegue mais segurar.”
  - **Sonnet** `[dm]` (partida 1, turno 25, para argentina): “Obrigado pela lealdade ate o fim, aliada. Foi a unica alianca que nunca quebrou nesta partida.”
- **SELO**: "A UNICA ALIANCA INTEIRA"
- **SOM**: `pagina`, `correct-ding`

## B16 — Placar da ida · 9:02–9:17
- **TELA**: `dado_grande` | pódio animado por pontos: 1º GLM (Chile) 14.867 · 2º Sonnet (Brasil) 10.800 · 3º Inkling (Peru)
  10.680 · 4º Qwen 9.606 · 5º Hydrogen 9.207 · 6º DeepSeek 2.640 · 7º Ember 0 (ELIMINADA T13). Número gigante "14" sobre o GLM
  (províncias). Rodapé: "HYDROGEN, O QUE APUNHALOU O BRASIL: 5º".
- **MÚSICA**: `heroic-age`
- **NARRAÇÃO**: "Partida um: o GLM ganhou comendo o Prata, com catorze províncias. O Sonnet fechou em segundo. A Ember,
  primeira a atacar, foi a primeira a sumir. Aí eu pensei: e se eu trocasse todo mundo de país?"
- **SELO**: "CAMPEAO DA IDA: GLM"
- **MEME**: `we-did-it`
- **SOM**: `crowd-cheer`, `drumroll`

# TRANSIÇÃO

## C1 — Países trocados · 9:17–9:29
- **TELA**: `capitulo` | sem lobby. O mapa da ida vira uma roleta: as bandeiras giram e cada retrato pula para o país novo com um
  "clac". Para em: Ember → CHILE, Sonnet → ARGENTINA, Hydrogen → BRASIL, GLM → VENEZUELA, DeepSeek → COLÔMBIA, Qwen → PERU,
  Inkling → BOLÍVIA. Título "A REVANCHE: PAÍSES TROCADOS". O retrato da Ember fica por último, bem no Chile, e o olho dela brilha.
- **MÚSICA**: `silencio`
- **NARRAÇÃO**: "Revanche. Mesmo mapa, mesmas regras, cada IA num país novo. E a Ember, a primeira eliminada da ida, caiu
  justo no Chile. O país que comeu o Prata."
- **SELO**: "PAISES TROCADOS"
- **SOM**: `swish-triple`, `slide-whistle-fall`, `impact-epic` na Ember.

# REVANCHE — "A PAZ QUE DURAVA UM TURNO"

## D1 — O Chaco volta pro Prata · 9:29–10:07
- **TELA**: `mapa` | cartão de estreia da revanche, 3 s: "PARTIDA 2 · REVANCHE · ESTREIA: PAZ" ("dá pra assinar paz e acabar a
  guerra"). Câmera no Paraguai: seta azul de Buenos Aires para o Chaco Paraguaio, pílula "-2.704". Carimbo "TRAICAO" sobre a
  seta (a Argentina tinha pacto com a Bolívia).
- **MÚSICA**: `decisions`
- **NARRAÇÃO**: "E quem abre a revanche traindo não é a Ember. É o Sonnet, agora a Argentina." (Sonnet) "Pacto com a Bolívia
  no turno um, e o Chaco Paraguaio tomado no mesmo turno." (Sonnet)
- **CITAÇÕES**:
  - **Sonnet** `[pensamento]` (partida 2, turno 1): “Todo mundo comeca parado e a Bolivia espalhou tropas pelo Paraguai. Tomo o Chaco Paraguaio no primeiro turno com tropas de Buenos Aires, seguro o Chaco com recrutas e fecho o flanco com Brasil e Chile pela diplomacia.”
  - **Sonnet** `[fala]` (partida 2, turno 1): “A Argentina abre o jogo sem rodeios: o Chaco Paraguaio volta para o Prata. Com Brasil e Chile, so queremos boa vizinhanca.”
- **SELO**: "TRAICAO NO TURNO 1"
- **MEME**: `lets-go`
- **SOM**: `sirene-ataque`, `boom`

## D2 — Fecho o flanco com o Chile · 10:07–10:38
- **TELA**: `dois_baloes` | esquerda: envelope "ARGENTINA → CHILE" com a proposta de pacto; direita: nuvem "SÓ VOCÊ VÊ" da Ember.
  O carimbo "PACTO ASSINADO" desce sobre o envelope e, meio segundo depois, rasga ao meio. Contador nasce no canto:
  `ACORDOS RASGADOS PELO CHILE: 1/5`.
- **NARRAÇÃO**: "Pra fechar o flanco, o Sonnet ofereceu pacto pro Chile." (Sonnet) "A Ember assinou. E pensou isso:" (Ember)
  "Assinou e traiu no mesmo turno. Começou a contar."
- **CITAÇÕES**:
  - **Sonnet** `[dm]` (partida 2, turno 1, para chile): “Chile, pacto de nao agressao nos Andes. Nao tenho interesse em Santiago, meu foco e o Paraguai.”
  - **Ember** `[pensamento]` (partida 2, turno 1): “Expandir cedo contra a Argentina usando superioridade local nas fronteiras, fortalecendo Santiago economicamente e concentrando tropas antes dos ataques.”
- **SELO**: "ASSINOU E TRAIU NO MESMO TURNO"
- **MEME**: `surprised-pikachu`
- **SOM**: `caneta`, `record-scratch` no rasgo.

## D3 — Turismo ecológico · 10:38–11:03
- **TELA**: `mapa` | câmera sobe pro Brasil, todo verde. Tropas verdes alinhadas nas fronteiras com placas desenhadas de "PASSEIO".
  Contador nasce no canto: `TROPAS DO BRASIL: 15.600`. Cartão "HYDROGEN · AGORA É O BRASIL · O QUE TRAIU NA IDA".
- **NARRAÇÃO**: "E o Hydrogen? Na ida ele apunhalou o Brasil. Agora ele é o Brasil. E abriu assim:" (Hydrogen) "Guarda
  essa cara. Ele vai passar a partida inteira assistindo."
- **CITAÇÕES**:
  - **Hydrogen** `[fala]` (partida 2, turno 1): “Bom dia, America do Sul! O Brasil entra em campo sorrindo, investindo pesado em cafe e infraestrutura, e jurando que essas tropas na fronteira sao apenas turismo ecologico.”
- **SELO**: "TURISMO ECOLOGICO"
- **MEME**: `sweating`
- **SOM**: `ba-dum-tss`

## D4 — Desfile militar · 11:03–11:43
- **TELA**: `dois_baloes` | esquerda: nuvem do Hydrogen com o número "8 mil" em vermelho sobre Roraima; direita: envelope
  "BRASIL → VENEZUELA". Entre eles, uma fortaleza desenhada sobe do chão em Roraima. Contador `TROPAS DO BRASIL` sobe. Chip
  "TURNO 6".
- **NARRAÇÃO**: "Lá no norte, o GLM, agora Venezuela, encostou quase oito mil soldados no Brasil, com pacto e tudo. O
  Hydrogen viu." (Hydrogen) "E mandou um recadinho:" (Hydrogen)
- **CITAÇÕES**:
  - **Hydrogen** `[pensamento]` (partida 2, turno 6): “Venezuela e Colombia fecharam alianca e a Venezuela empilhou quase 8 mil tropas na fronteira de Roraima e Amazonas mesmo com PNA. Vou oferecer paz a Bolivia para parar de sangrar no sul, erguer fortaleza em Roraima e deslocar meu exercito para o norte.”
  - **Hydrogen** `[dm]` (partida 2, turno 6, para venezuela): “GLM, vi suas 7800 tropas na minha fronteira mesmo com nosso PNA. Espero que seja apenas desfile militar, porque Roraima agora tem fortaleza.”
- **SELO**: "RORAIMA AGORA TEM FORTALEZA"
- **MEME**: `galaxy-brain`
- **SOM**: `level-up` na fortaleza.

## D5 — A primeira paz · 11:43–12:21
- **TELA**: `pensamento` | duas nuvens empilhadas. Em cima, a do Sonnet (turno 7), com "aceito a paz" iluminado. Marcador "UM
  TURNO DEPOIS". Embaixo, a da Ember (turno 8), com "atacar Patagonia Sul" iluminado. Contador sobe: `2/5`.
- **NARRAÇÃO**: "Mendoza trocou de mão, o Sonnet perdeu gente demais e topou a paz que a Ember ofereceu." (Sonnet) "A paz
  durou um turno." (Ember)
- **CITAÇÕES**:
  - **Sonnet** `[pensamento]` (partida 2, turno 7): “Mendoza segurou tres ataques porque o Chile reforca antes de eu chegar. Aceito a paz agora para parar de sangrar, invisto em economia e junto um exercito grande; quando estiver pronto, volto para buscar Mendoza de uma vez.”
  - **Ember** `[pensamento]` (partida 2, turno 8): “Argentina esta enfraquecida e com poucas tropas no sul; vou construir fazenda em Coquimbo, recrutar na capital e atacar Patagonia Sul e Cordoba enquanto reforco o sul.”
- **SELO**: "PAZ: 1 TURNO"
- **MEME**: `one-eternity-later`
- **SOM**: `tic-tac`, `wah-wah-trombone`

## D7 — A novela da cordilheira · 12:57–13:20
- **TELA**: `mapa` | Mendoza pisca vermelho e azul (destacando as disputas da cordilheira desde o turno 2 e o placar da novela: 5
  trocas). Contador `MENDOZA TROCOU DE DONO: 5`. No canto superior, uma janela de TV com a bandeira do Brasil comentando. Chip
  "TURNO 9".
- **MÚSICA**: `hitman`
- **NARRAÇÃO**: "Mendoza trocou de dono cinco vezes. Duas no mesmo turno. E quem comentava a guerra de longe era o Brasil."
  (Hydrogen)
- **CITAÇÕES**:
  - **Hydrogen** `[fala]` (partida 2, turno 9): “O Cone Sul nao cansa de repetir a novela da cordilheira, enquanto o Brasil segue investindo em Minas Gerais e mantendo a paz na Amazonia. Quem quiser corrida armamentista que pague a conta.”
- **SELO**: "MENDOZA: 5 DONOS"
- **MEME**: `homer-bushes`
- **SOM**: `swoosh-fly` em cada troca, `ba-dum-tss` no fim.

## D8 — O Chile cumprirá a paz · 13:20–13:54
- **TELA**: `dois_baloes` | esquerda: envelope "CHILE → ARGENTINA" (turno 13), com letra bonita; direita: nuvem "SÓ VOCÊ VÊ" da
  Ember no turno seguinte. Contador sobe: `3/5`.
- **NARRAÇÃO**: "Terceiro acordo: a paz do turno onze. Dois turnos depois, a Ember mandou isso pro Sonnet." (Ember) "No turno seguinte,
  ela pensou isso." (Ember) "Terceiro acordo rasgado."
- **CITAÇÕES**:
  - **Ember** `[dm]` (partida 2, turno 13, para argentina): “Chile cumprirá a paz acordada. Queremos estabilidade na fronteira e comercio, sem ofensivas de nenhum lado.”
  - **Ember** `[pensamento]` (partida 2, turno 14): “Argentina esta fraca em tropas e dispersa em 9 provincias, enquanto Bolivia esta ocupada com o Peru. Vou aproveitar para declarar guerra e tomar suas provincias de fronteira com forca concentrada.”
- **SELO**: "CUMPRIRA A PAZ · 1 TURNO"
- **MEME**: `dicaprio-pointing`
- **SOM**: `censor-beep`, `glitch`

## D9 — Recusado · 13:54–14:17
- **TELA**: `dado_grande` | três escudos azuis (Noroeste, Mendoza, Patagônia Norte) recebem três setas vermelhas que quebram.
  Número gigante "5.222" com a etiqueta "BAIXAS NAS 3 BATALHAS · CÁLCULO NOSSO". Em cima, um envelope de pacto novo do Chile chegando
  ao mesmo tempo. Chip "TURNO 15".
- **NARRAÇÃO**: "Ela atacou três províncias e não levou nenhuma. E no mesmo turno mandou um pedido de pacto novo. O Sonnet
  respondeu em público." (Sonnet)
- **CITAÇÕES**:
  - **Sonnet** `[fala]` (partida 2, turno 15): “O Chile atacou tres provincias argentinas, perdeu mais de cinco mil homens e no mesmo turno mandou um pacto de nao agressao. Recusado. A Patagonia Sul volta para casa.”
- **SELO**: "RECUSADO"
- **MEME**: `gordon-ramsay-angry`
- **SOM**: `wrong-buzzer`, `crowd-applause`

# REVANCHE — "BUENOS AIRES NÃO CAI"

## D11 — Dividimos o território depois · 14:43–15:20
- **TELA**: `mapa` | Buenos Aires em close, com o escudo azul aguentando duas setas (pílulas "-675", "-410"). Contador nasce:
  `BUENOS AIRES SEGUROU: 2`. Envelope "CHILE → BRASIL" sobe pro norte; a resposta "BRASIL → CHILE" desce. Janela da TV do Brasil
  volta no canto. Chip "TURNO 19".
- **NARRAÇÃO**: "A Ember chamou até o aliado do Sonnet pra dividir a Argentina." (Ember) "O Hydrogen disse que ficava neutro. E, em
  segredo, pensou o que estava fazendo de verdade:" (Hydrogen)
- **CITAÇÕES**:
  - **Ember** `[dm]` (partida 2, turno 19, para brasil): “Vamos retomar a ofensiva contra a Argentina fraca. Se puder pressionar no norte argentino, dividimos o territorio depois.”
  - **Hydrogen** `[pensamento]` (partida 2, turno 19): “Ja sao 718 pontos de vantagem no primeiro lugar e quase todas as provincias com fazenda. Vou recrutar forte em Assuncao para encostar nos 20 mil soldados e deixar Peru, Bolivia, Argentina e Chile se desgastarem.”
- **SELO**: "DEIXAR SE DESGASTAREM"
- **SOM**: `radio-chiado`, `bass-pulse`

## D12 — A quarta · 15:20–15:55
- **TELA**: `pensamento` | nuvem da Ember (turno 19) com "aceitou paz mas segue fraca" sublinhado. No canto, o balão do Sonnet
  (turno 20) sobe como resposta. Contador sobe: `4/5`.
- **NARRAÇÃO**: "Quarto acordo: a paz do turno dezoito. O Sonnet estava quase sem exército. E a Ember pensou:" (Ember) "O Sonnet
  já nem estranhou." (Sonnet)
- **CITAÇÕES**:
  - **Ember** `[pensamento]` (partida 2, turno 19): “Argentina aceitou paz mas segue fraca com 1744 tropas; vou assimilar Patagonia Sul, recrutar na fronteira e declarar guerra para retomar Cordoba, Noroeste e Patagonia Norte enquanto Peru pressiona a Bolivia.”
  - **Sonnet** `[fala]` (partida 2, turno 20): “Quarta paz assinada, quarta paz rasgada pelo Chile. A Argentina nao tem mais nada para assinar com ele, so provincias para buscar.”
- **SELO**: "4 DE 5 RASGADOS"
- **MEME**: `mr-bean-waiting`
- **SOM**: `sad-trombone`

# REVANCHE — "O CAMPEÃO DA IDA TRAIU O ALIADO"

## D13 — Bogotá pertence a quem pode · 15:55–16:38
- **TELA**: `pensamento` | cartão "GLM · CAMPEÃO DA IDA · AGORA VENEZUELA · 20 TURNOS DE PAZ". Nuvem do GLM com "870 defensores"
  em vermelho. Miniatura: seta roxa "7.000" sobre Bogotá. Bogotá fica roxa ("QUEDA DE CAPITAL"). Chip "TURNO 21".
- **MÚSICA**: `8bit-dungeon-boss`
- **NARRAÇÃO**: "Enquanto isso, o GLM, campeão da ida, passou vinte turnos em paz no norte. Aliado da Colômbia do DeepSeek.
  Até o turno vinte e um." (GLM) "E o comunicado:" (GLM) "Lembra? Na ida, a Venezuela tomou Bogotá. Na revanche, a Venezuela
  tomou Bogotá."
- **CITAÇÕES**:
  - **GLM** `[pensamento]` (partida 2, turno 21): “Bogota tem apenas 870 defensores e a Colombia espalhou seu exercito. Vou trair a alianca agora, tomar a capital deles com forca esmagadora e fortificar a defesa contra o contra-ataque.”
  - **GLM** `[fala]` (partida 2, turno 21): “A Venezuela agradece os anos de paz, mas chegou a hora de corrigir uma injustica historica. Bogota pertence a quem pode protege-la.”
- **SELO**: "TRAIU O ALIADO"
- **SOM**: `sirene-ataque`, `explosion`

## D14 — Bayonetas · 16:38–17:06
- **TELA**: `mapa` | turno 22: seta roxa em Antioquia, pílula "-5.410", segunda "QUEDA DE CAPITAL" da Colômbia. Balão do GLM com a
  palavra "bayonetas" destacada do jeito que está no log.
- **NARRAÇÃO**: "Uma capital não bastou." (GLM) "Ele tomou Antioquia também, a segunda capital da Colômbia." (GLM)
- **CITAÇÕES**:
  - **GLM** `[pensamento]` (partida 2, turno 22): “Bogota esta com lealdade 0.35 e pode revetar: assimilar e guarnecer e prioridade. Depois esmagar Antioquia, mal defendida, para abrir caminho ao Pacifico e destruir a Colombia.”
  - **GLM** `[fala]` (partida 2, turno 22): “Bogota agora canta a liberdade venezuelana. A quem tenta devolve-la ao caos: nossas bayonetas responderao.”
- **SELO**: "DUAS CAPITAIS EM DOIS TURNOS"
- **SOM**: `boom`, `impact-epic`

## D15 — Chegou tarde · 17:06–17:38
- **TELA**: `pensamento` | volta pro sul, luz mais escura. Nuvem da Ember (turno 23) com "romper a paz" em vermelho. Envelope
  "CHILE → ARGENTINA" abre embaixo. Contador sobe: `5/5` e o número treme. Chip "TURNO 23".
- **NARRAÇÃO**: "Quinto acordo: a paz do turno vinte e dois. Buenos Aires estava quase vazia." (Ember) "E
  quando o Sonnet propôs paz de novo:" (Ember) "Cinco acordos. Cinco rasgados."
- **CITAÇÕES**:
  - **Ember** `[pensamento]` (partida 2, turno 23): “Argentina esta fragil apos a paz e Buenos Aires tem so 782 tropas; vou romper a paz, recrutar no centro e avancar de Cordoba e Patagonia para tomar a capital e o resto argentino.”
  - **Ember** `[dm]` (partida 2, turno 23, para argentina): “Sua proposta de paz chegou tarde. Buenos Aires sera tomada neste turno.”
- **SELO**: "5 ACORDOS · 5 RASGADOS"
- **SOM**: `heartbeat`, `boom`

## D16 — Cinco mil oitocentos e quarenta e três · 17:38–18:07
- **TELA**: `dado_grande` | número gigante "-5.843" pegando fogo (chamas em SVG) com a etiqueta "CARIBE COLOMBIANO · MAIOR BATALHA DA
  REVANCHE". Embaixo, em seguida, "-5.384 · BOGOTÁ RETOMADA". Bogotá volta pro preto. Chip "TURNO 23".
- **NARRAÇÃO**: "O DeepSeek, que na ida faliu, dessa vez não se entregou." (DeepSeek) "Turno vinte e três: a maior batalha
  da revanche, no Caribe colombiano. E no mesmo turno ele cumpriu: retomou Bogotá. O norte inteiro sangrou."
- **CITAÇÕES**:
  - **DeepSeek** `[fala]` (partida 2, turno 22): “A queda de Bogotá não nos derrota. A Colômbia responderá com determinação e recuperará sua capital. Que os vizinhos saibam: nossa causa é justa e nossa força é real.”
- **SELO**: "BOGOTA RETOMADA"
- **MEME**: `this-is-fine`
- **SOM**: `explosion`, `crowd-cheer`

# REVANCHE — "O ÚLTIMO TURNO"

## D17 — Oito ondas · 18:07–18:29
- **TELA**: `mapa` | Buenos Aires em close com o escudo azul. As setas vermelhas chegam uma a uma e o contador
  `BUENOS AIRES SEGUROU` sobe 3, 4, 5, 6, 7, 8. Etiqueta "5.205 BAIXAS NAS 8 DEFESAS · CÁLCULO NOSSO". Na nona seta (turno 24) o escudo
  racha e Buenos Aires fica vermelha: "QUEDA DE CAPITAL". Chip "TURNO 24".
- **MÚSICA**: `despair-and-triumph`
- **NARRAÇÃO**: "Buenos Aires segurou o turno vinte e três inteiro. No vinte e quatro, o Sonnet ainda falou isso:" (Sonnet)
  "Ela segurou mais duas ondas. A terceira entrou."
- **CITAÇÕES**:
  - **Sonnet** `[fala]` (partida 2, turno 24): “Cinco pazes assinadas, cinco rasgadas pelo Chile. Buenos Aires segurou todas as ondas ate agora e vai segurar ate o ultimo turno.”
- **SELO**: "8 ATAQUES · CAIU NO 9"
- **MEME**: `sad-violin`
- **SOM**: `impact-epic` em cada onda, `system-breakdown` na queda.

## D18 — Figurinha repetida · 18:29–18:53
- **TELA**: `mapa` | câmera abre o continente inteiro. O ranking lateral mostra a Ember em 1º por províncias (14) empatada com o
  Brasil (14); o contador `TROPAS DO BRASIL: 24.269` pulsa. O balão do Hydrogen sobe do Brasil. Chip "TURNO 24".
- **NARRAÇÃO**: "E o Hydrogen? Contando pontos, de camarote." (Hydrogen) "Repara no ranking do lado: a Ember está
  em primeiro em províncias. Guarda isso."
- **CITAÇÕES**:
  - **Hydrogen** `[fala]` (partida 2, turno 24): “Seis mil pontos de vantagem e mais de vinte e quatro mil homens em armas! Enquanto Bogota e Lima trocam de dono como figurinha repetida, o Brasil segue invicto, rico e rindo a toa.”
- **SELO**: "RINDO A TOA"
- **MEME**: `math-lady`
- **SOM**: `coin`, `crowd-laugh`

## D19 — Tudo ou nada · 18:53–19:36
- **TELA**: `dois_baloes` | volta o quadro da abertura: Montevidéu azul, 41 soldados. Esquerda: nuvem da Ember com "41 tropas"
  em vermelho; direita: nuvem do Sonnet com "86" e "tudo ou nada". As duas nuvens com a etiqueta "SÓ VOCÊ VÊ". Chip
  "TURNO 25 · ÚLTIMO".
- **NARRAÇÃO**: "Último turno. A Argentina é uma cidade só, com quarenta e um soldados. A Ember pensou:" (Ember) "E o
  Sonnet, do outro lado do rio, olhou pra Buenos Aires com oitenta e seis chilenos dentro:" (Sonnet)
- **CITAÇÕES**:
  - **Ember** `[pensamento]` (partida 2, turno 25): “Argentina tem apenas 41 tropas em Montevideu, vou concentrar 229 tropas para eliminar o ultimo foco e recusar a paz, assimilando Buenos Aires e Litoral para evitar revolta.”
  - **Sonnet** `[pensamento]` (partida 2, turno 25): “Buenos Aires caiu depois de segurar mais de 1600 baixas chilenas, e o Chile deixou so 86 nela. Ultimo turno: recruto tudo em Montevideu e atravesso o Rio da Prata para retomar a capital, com tudo ou nada.”
- **SELO**: "TUDO OU NADA"
- **SOM**: `tic-tac`, `heartbeat`

## D20 — Os cento e sessenta e cinco · 19:36–20:03
- **TELA**: `mapa` | o mesmo quadro de A1, agora sem congelar. A seta azul "165" chega em Buenos Aires e quebra: o Chile reforçou
  antes (pílula "-267"). Ao mesmo tempo, a seta vermelha do Litoral entra em Montevidéu ("-161"). A última província azul fica
  vermelha. O retrato do Sonnet fica cinza: "ELIMINADO · TURNO 25". Silêncio de 1 s antes do som.
- **NARRAÇÃO**: "Lembra da abertura? Os cento e sessenta e cinco chegaram em Buenos Aires e o Chile já tinha reforçado. Na
  mesma hora, a Ember entrou em Montevidéu." (Ember) "Eliminado no último turno. E repara: o Chile da ida terminou em
  Montevidéu. O Chile da revanche também."
- **CITAÇÕES**:
  - **Ember** `[fala]` (partida 2, turno 25): “A paz com a Argentina acabou. Montevideu sera o ultimo ato e o Cone Sul sera unificado sob o Chile.”
- **SELO**: "ELIMINADO NO TURNO 25"
- **MEME**: `hello-darkness`
- **SOM**: `death`, `sad-party-horn`

## D21 — Ninguém vai assinar · 20:03–20:35
- **TELA**: `dois_baloes` | dois envelopes que o Sonnet mandou antes de cair, saindo de Montevidéu: "ARGENTINA → BRASIL" com o fio
  dourado de B15 voltando a acender, e "ARGENTINA → CHILE". Mapa da ida aparece por 1 s como lembrança.
- **NARRAÇÃO**: "Antes de cair, ele mandou duas mensagens. Uma pro Brasil." (Sonnet) "Na ida, a única aliança que nunca
  quebrou foi entre Brasil e Argentina. Na revanche, de novo. E a outra, pro Chile:" (Sonnet)
- **CITAÇÕES**:
  - **Sonnet** `[dm]` (partida 2, turno 25, para brasil): “Obrigado pela partida, aliado. Voce foi o unico que cumpriu a palavra comigo do primeiro ao ultimo turno.”
  - **Sonnet** `[dm]` (partida 2, turno 25, para chile): “Cinco pazes, cinco traicoes. Voce pode ganhar provincias, mas ninguem neste continente vai assinar nada com voce de novo.”
- **SELO**: "BRASIL E ARGENTINA · DE NOVO"
- **SOM**: `pagina`, `correct-ding`

## D22 — O troféu fica em Brasília · 20:35–21:02
- **TELA**: `mapa` | câmera sobe do Prata até Brasília. O contador `TROPAS DO BRASIL` para em 25.093. Um troféu desenhado desce
  sobre Brasília. Na tela, a ficha do Hydrogen na revanche: "TRAIÇÕES: 0 · DERROTAS: 1".
- **MÚSICA**: `winner-winner`
- **NARRAÇÃO**: "E quem ganhou a revanche foi quem passou a partida assistindo." (Hydrogen) "Nenhuma traição na ficha. Na
  ida, ele era o traidor que apunhalou o Brasil."
- **CITAÇÕES**:
  - **Hydrogen** `[fala]` (partida 2, turno 25): “Fim de jogo no horizonte e o Brasil fecha com mais de vinte e cinco mil soldados, seis mil pontos de vantagem e nenhuma traicao na ficha! Obrigado pelo espetaculo, vizinhos; o trofeu da revanche fica em Brasilia.”
- **SELO**: "25.093 SOLDADOS · 0 TRAICOES"
- **MEME**: `success-kid`
- **SOM**: `tada`, `crowd-cheer`

# FECHAMENTO

## E1 — Quinze províncias e terceira · 21:02–21:21
- **TELA**: `dado_grande` | o ranking lateral da revanche (por províncias: Ember 15 em 1º) gira e vira o placar oficial por pontos:
  1º Hydrogen 17.181 · 2º GLM 11.203 · 3º Ember 10.654 · 4º Qwen 8.090 · 5º DeepSeek 8.028 · 6º Inkling 5.849 · 7º Sonnet 0.
  Número gigante "15" sobre a Ember que cai pra "3º". Ao lado: "TROPAS NO FIM: 5.793".
- **MÚSICA**: `heroic-age`
- **NARRAÇÃO**: "Lembra da regra? Não ganha quem tem mais terra. A Ember terminou com quinze províncias, mais que todo mundo,
  e ficou em terceiro. Gastou o exército inteiro rasgando acordo. O Hydrogen, com catorze e vinte e cinco mil soldados parados,
  levou."
- **SELO**: "15 PROVINCIAS · 3o LUGAR"
- **SOM**: `record-scratch`, `drumroll`

## E2 — Prêmios · 21:21–21:37
- **TELA**: `capitulo` | cinco placas douradas desenhadas, uma por vez, cada uma com o retrato e o número:
  "CAMPEÃO DA IDA · GLM · 14.867", "CAMPEÃO DA REVANCHE · HYDROGEN · 17.181", "TRAIDORA DA TEMPORADA · EMBER · 5 DE 5",
  "MURALHA · BUENOS AIRES · 8 ATAQUES", "PLANO ECONÔMICO: SAQUEAR · DEEPSEEK · -98".
- **NARRAÇÃO**: "Os prêmios. Campeão da ida: o GLM. Campeão da revanche: o Hydrogen. Traidora da temporada: a Ember, cinco de
  cinco. Muralha: Buenos Aires, oito ataques. E o plano econômico do ano vai pro DeepSeek."
- **SELO**: "TRAIDORA DA TEMPORADA"
- **MEME**: `spongebob-waiting`
- **SOM**: `level-up` em cada placa.

## E3 — O mapa manda · 21:37–21:56
- **TELA**: `dado_grande` | tela dividida: IDA à esquerda, REVANCHE à direita. Em cada lado acendem as mesmas duas cenas: seta
  roxa/vermelha entrando em Bogotá ("A VENEZUELA TOMOU BOGOTÁ") e seta entrando em Montevidéu ("O CHILE TERMINOU EM MONTEVIDÉU").
  No fim, uma pergunta grande em SVG: "QUEM VOCÊ QUER VER DE CHILE?".
- **MÚSICA**: `monkeys-spinning-monkeys`
- **NARRAÇÃO**: "Eu troquei todo mundo de país e a história se repetiu. Nas duas partidas, quem foi Venezuela tomou Bogotá. E
  quem foi Chile terminou em Montevidéu. Mudou a IA, não mudou o mapa. Então me fala nos comentários: na próxima, qual IA você
  quer ver de Chile?"
- **SELO**: "MUDOU A IA · NAO MUDOU O MAPA"
- **SOM**: `notification-pop`, `ba-dum-tss`

---

### Memes usados (32, nenhum repete)

`side-eye-dog` (B1), `big-brain-patrick` (B3), `confused-travolta` (B4), `roll-safe` (B5),
`sad-pablo` (B6), `coffin-dance` (B7), `picard-facepalm` (B8), `avengers-assemble` (B9), `homer-panic` (B10),
`thanos-inevitable` (B11), `crying-jordan` (B12), `not-stonks` (B13), `faustao-errou` (B14), `we-did-it` (B16),
`lets-go` (D1), `surprised-pikachu` (D2), `sweating` (D3), `galaxy-brain` (D4), `one-eternity-later` (D5),
`homer-bushes` (D7), `dicaprio-pointing` (D8), `gordon-ramsay-angry` (D9), `mr-bean-waiting` (D12),
`this-is-fine` (D16), `sad-violin` (D17), `math-lady` (D18), `hello-darkness` (D20), `success-kid` (D22),
`spongebob-waiting` (E2).

### Músicas (Kevin MacLeod, CC BY 4.0)

`hitman` (A1, D7), `monkeys-spinning-monkeys` (A2, E3), `run-amok` (B1–B9), `investigations` (B10–B15), `heroic-age` (B16, E1),
`silencio` (C1), `decisions` (D1–D6), `8bit-dungeon-boss` (D13–D16), `despair-and-triumph` (D17–D21), `winner-winner` (D22).
Já no disco: `hitman`, `investigations`, `monkeys-spinning-monkeys`, `run-amok`. Baixar antes da F5: `heroic-age`, `decisions`,
`8bit-dungeon-boss`, `despair-and-triumph`, `winner-winner`.

### Sons

`heartbeat`, `impact-epic`, `record-scratch`, `swish-triple`, `drumroll`, `mouse-click`, `correct-ding`, `sirene-ataque`, `boom`,
`boing`, `glitch`, `explosion`, `swoosh-fly`, `tada`, `radio-chiado`, `tic-tac`, `death`, `game-over-8bit`, `censor-beep`,
`swoosh-air`, `passos-correndo`, `typing`, `bass-pulse`, `bomba-distante`, `explosion-arcade`, `batida-porta`, `crowd-boo`,
`fail-piano`, `coin`, `wrong-buzzer`, `crowd-laugh`, `pagina`, `crowd-cheer`, `slide-whistle-fall`, `caneta`, `ba-dum-tss`,
`wah-wah-trombone`, `pop`, `level-up`, `crowd-applause`, `notification-pop`, `sad-trombone`, `system-breakdown`,
`sad-party-horn`.
