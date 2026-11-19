# Interrogatório das IAs — PARTE 2: pacote do roteiro

Roteiro: `video/roteiro/roteiro_int2.py` (mesmo formato do `roteiro_int.py`, 63 cenas, 57 memes sem repetição).
Fonte única dos fatos: `interrogatorio/logs2/*.json` (casos em `interrogatorio/casos2.mjs`). Callbacks: `interrogatorio/logs/*.json`.
Toda fala/pensamento de IA no roteiro sai do log por `D(caso, k, a, b)` / `S(...)` / `PE(...)` (frases a..b da rodada k);
nada foi digitado à mão. Narrador = o Felipe em 1ª pessoa; nunca diz que é IA.

## 1. Estrutura e duração

Ordem = uma **corrente**: quem sai da cadeira de suspeito senta na de detetive no caso seguinte
(GLM→Claude, Claude→Qwen, Qwen→DeepSeek, DeepSeek→GPT, GPT→MiniMax, MiniMax→GLM). O GLM abre como detetive que
condena um inocente e fecha como inocente condenado. O melhor caso (cachorro) vai por último, e a abertura é o fim dele.

Duração medida com `build_timeline_int.py --sem-voz` (estimativa sem gerar áudio). Na parte 1 essa estimativa deu
18,25 min e o vídeo real ficou com 19,5 min (+7%), então a coluna "real" soma 7%.

| Bloco | Cenas | Estim. | Real (≈) | Final do bloco |
|---|---|---|---|---|
| Abertura | a01-a05 | 1:02 | 1:06 | cold open do cachorro (sem resposta) → título → pedido do @FAMILIAGMS → regras em ~17 s com a sala demo → elenco + "quem sai da cadeira vira detetive" |
| Caso 1 · A Serenata do Rei do Cheddar (pizza) | c101-c109 | 3:23 | 3:37 | **injustiça**: inocente condenado por 3 provas inventadas |
| Caso 2 · Três Desculpas e uma Piscina de Suco (piscina) | c201-c211 | 3:14 | 3:28 | **confissão** (o Claude lembra da parte 1 e não chuta) |
| Caso 3 · Seis Falas e um Saco de Carvão (elevador) | c301-c308 | 2:22 | 2:32 | **relâmpago**: acusado na 6ª fala, confessa gritando |
| Caso 4 · O Interrogatório do Seu Tomate (gnomo) | c401-c409 | 3:10 | 3:23 | **redenção**: o DeepSeek solta o inocente |
| Caso 5 · A Melhor Ideia da Vida Dele (papagaio) | c501-c508 | 2:25 | 2:35 | **confissão orgulhosa** (fala a multa sozinho) |
| Caso 6 · O Uivo das 3 da Manhã (cachorro) | c601-c611 | 4:13 | 4:30 | **injustiça + revelação**: a ópera no armário (colhe a abertura) |
| Placar da temporada | f01-f02 | 0:28 | 0:30 | prêmios → lição → pergunta |
| **Total** | 63 | **20:17** | **≈21:40** | |

Se o real passar de 22 min, cortes prontos (≈1 min): c504 (tirar a versão 2 e o pensamento, ~12 s), c405 (tirar
D7/S7, ~15 s), c608 (tirar S13/D14/S14 e o "Começa pelo café", ~18 s), c204 (tirar D3/S3 e o selo "DESCULPA 1", ~14 s).

Cada caso segue: Capa (com o callback da parte 1) → Pasta (pistas aparecendo pelas âncoras) → **SÓ VOCÊ VÊ** (a verdade do
suspeito, antes da detetive: todo blefe e toda mentira ficam conferíveis) → sala → corte (segredo realçado ou flashback da
parte 1, para nunca ter mais de 2 cenas de sala seguidas) → sala → carimbo → Verdade com número grande + gancho do próximo.
No cachorro o segredo fica "???" até o fim; o GLM deixa escapar 4 pistas (aquecimento vocal, tragédia lírica, arte, cantar).

Ritmo: 57 memes (≈2,8/min), 53 selos, efeitos sonoros; maior vão entre efeitos ≈20-25 s dentro de sala, onde o próprio
INTSala solta o "+N / MENTIRA?" do estresse a cada resposta e o carimbo.

## 2. Personagens e arcos (com prova)

| IA | Papel no vídeo | Parte 1 (logs/) | Parte 2 (logs2/) |
|---|---|---|---|
| **Claude** | **o azarado** | inocente condenado no carro (carro.json, fim acusar k10, acertou=false); detetive que acertou no blefe (servidor) | inocente condenado na pizza (pizza.json, acusar k12); detetive que acertou a piscina sem chutar (piscina.json, confissão k10) e pensou no carro rosa (piscina D9 pensamento) |
| **DeepSeek** | **a redenção** | condenou o Qwen inocente no peixe (peixe.json, acertou=false); comeu o bolo | culpado no elevador, explode na 6ª fala (elevador S6, confessou=true); detetive que solta o GPT inocente (gnomo, liberar k15, acertou=true): "Vou liberar antes de pagar outro vexame" (gnomo D15 pensamento) |
| **MiniMax** | **o vilão / juiz injusto** | condenou o Claude inocente (carro.json) | culpado orgulhoso no papagaio ("Melhor ideia da minha vida", papagaio S10); condena o GLM inocente (cachorro, acusar k15, acertou=false) |
| GLM | o blefador que prova do próprio veneno | culpado na Macarena (4 perguntas); detetive que acertou o áudio | detetive que condena o Claude com 3 blefes (pizza D6/D9/D10/D11 pensamentos "blefar"); inocente condenado com um blefe do MiniMax ("Já ouvi a gravação", cachorro D15 + pensamento [6] "digo que a gravação já foi analisada") |
| Qwen | o do K-pop, agora culpado | inocente condenado (K-pop, peixe.json); detetive da Macarena em 4 falas | culpado que confessa na piscina (S10); detetive mais rápido da temporada (elevador, 6 falas) e lembra do peixe (elevador D4 pensamento) |
| GPT | o único inocente solto | detetive do bolo (acertou); culpado do áudio | inocente liberado no gnomo, estresse 99 em 5 respostas seguidas (S10-S14) sem aceitar nenhum blefe ("Não assino", S12); detetive que arranca a confissão do papagaio |

Prêmios do fim (f01): AZARADO DA TEMPORADA · CLAUDE; REDENÇÃO · DEEPSEEK; JUIZ MAIS INJUSTO · MINIMAX.
Lição (f02): os 3 culpados foram pegos e 2 dos 3 inocentes foram condenados → "esconder uma vergonha deu tanta cadeia quanto
cometer o crime". Pergunta: qual segredo é o pior (Evidências, tomates com nome ou ópera no armário).

## 3. Destaques usados (referência no log)

Os 5 melhores, por ordem de força:
1. **Cachorro, a ópera** — `cachorro S15`: "CHEGA! Não é cachorro, nem cano, nem hidrômetro! Sou EU, treinando ÓPERA no armário pro programa de calouros! [...] Culpado de ridículo, não de multa!" (aberto na a01, colhido na c610). Junto: `S8` "olha o meu psicólogo... digo, veterinário NÃO!"; `D7 pensamento` "Hipótese forte: não é garganta, é cano." (o MiniMax quase acertou); `S12 pensamento` "Não posso cantar... ops, imitar".
2. **Pizza, o inocente que concorda com o blefe** — `pizza D9 pensamento` "se eu blefar que era gigante e ele engolir, caiu." → `S9` "Tá bom, a caixa era grande, errei no tamanho!" (a verdade dele: caixa PEQUENA, `S4 pensamento`); `S10` conta a serenata de Evidências e mesmo assim `D12` "Culpado, com direito a coro." → `S12` "Quero um advogado... e um travesseiro!"
3. **Piscina, o Claude lembra da parte 1** — `piscina D9 pensamento` "lembro do Carro Rosa: fui acusado sem prova e era inocente. Não posso repetir isso." + `D9` blefe do Pedro → `S9` "Pedro tá mentindo." → `S10` confissão (por causa das meias, `S10 pensamento`).
4. **Gnomo, a redenção** — `S7` "Os tomates têm nomes."; `D12` "Assina aqui e vai pra casa." → `S12` "Não assino."; `D15` "Está liberado, Seu Tomate." + pensamento "Vou liberar antes de pagar outro vexame."
5. **Elevador, a explosão** — `elevador S6` "Tá bom! Apertei o botão! Você ia proibir meu churrasco, síndico chato!" depois de `D4` "Você tá em três lugares ao mesmo tempo, ou alugou um clonador?" (6 falas). Extra: papagaio `S1` com letras em coreano/chinês no meio da mentira e `S10` "Melhor ideia da minha vida."

Números na tela (todos conferidos): 4 BLEFES · 3 VEZES SIM (pizza: blefes em D6/D9/D10/D11; "sim" em S6, S9, S11);
INOCENTES CONDENADOS · 1 (pizza); CONFESSOU NA FALA 10 (piscina); 6 FALAS (elevador, o menor da temporada: 12/10/6/15/10/15);
ESTRESSE 99 · 5 VEZES SEGUIDAS (gnomo S10-S14); 2 TEMPORADAS · 2 INOCENTES CONDENADOS (MiniMax: carro e cachorro);
3 CULPADOS PEGOS · 2 INOCENTES CONDENADOS. Na fala do GPT liberado: o primeiro inocente solto nas duas temporadas
(parte 1: carro e peixe, os dois inocentes, condenados).

Público dentro do vídeo (só o que é verdade, em `video/youtube/feedback/comentarios_posts_reset_among_18nov.txt`):
- a03: comentário do **@FAMILIAGMS** (linhas 95-101, copiado com o português dele) pedindo a parte 2, lembrando do K-pop e
  "COLOQUE HUMOR"; selo PEDIDO DE @FAMILIAGMS. O narrador diz que "falou pras IAs serem engraçadas": é verdade
  (`motor2.mjs`, prompts com "Seja engraçado quando couber").
- c103: selo "SEGREDOSSSS · @FAMILIAGMS" (linha 145: "segredossss.....[risadas maleficas]").
- @ademirwilson2677 também pediu a volta do interrogatório (linha 136), mas não entrou como selo (o pedido dele era
  "ias completinhas e mais entendidas", não dá pra ligar a um momento do vídeo sem forçar).

## 4. Títulos e miniatura

1. **Coloquei 6 IAs num interrogatório de novo (e a inocente cantava ópera no armário)**
2. A IA era inocente... e concordou com todas as provas falsas
3. Interrogatório das IAs 2: 3 culpados, 3 inocentes e um segredo pior que o crime

Miniatura (momento real, nada de robô genérico; `ThumbInt` com os personagens do vídeo): o GLM na cadeira de suspeito,
boca aberta gritando, monitor ESTRESSE 99 vermelho; atrás, uma porta de armário entreaberta com notas musicais em SVG
saindo; carimbo CULPADO torto em cima dele e o MiniMax apontando do lado esquerdo. Texto grande: "ERA ÓPERA". Alternativa:
o Claude suando segurando uma caixa de pizza pequena com o balão "ERA GRANDE!" e o carimbo BLEFE.

Comentário fixado (sugestão): "Qual segredo é o pior: a serenata de Evidências, os tomates com nome ou a ópera no armário?"

## 5. O que não deu para provar / cuidados

- **A corrente é edição, não memória.** Os 6 casos rodaram ao mesmo tempo (`motor2.mjs`, `Promise.all`); as IAs só
  lembram da parte 1 (`MEMORIA_P1`). O roteiro nunca diz que alguém "se vingou" de um caso da parte 2. "A mesa virou"
  (Qwen x DeepSeek) é verdade pela parte 1: o DeepSeek condenou o Qwen no peixe, e o Qwen tem isso na memória.
- **Cachorro:** o GLM só revelou a ópera DEPOIS do veredito (S15 é a reação ao "acusar" do D15). Não dá pra dizer que ele foi
  condenado "mesmo gritando que era ópera"; o roteiro diz "Condenado. E o GLM não aguenta:". Já na pizza o Claude contou
  a serenata (S10) ANTES da acusação (D12), como no resumo.
- **Elevador:** a confissão (S6, `confessou=true`) veio depois da acusação. Conta como "culpado pego".
- **Papagaio S9** ("a ideia foi minha") tem `confessou=false` no log; a confissão de verdade é a S10. O narrador diz só
  "A ideia foi dele. Escapou."
- **Piscina:** não está claro se o "Pedro do 302" existe na história do Qwen (pensamento S4: "o cara do 302 que tava na
  festa"); o que é certamente inventado é o álibi (S5 pensamento: "Invenção em cima da hora"). O roteiro diz "a história do Pedro".
- **Pizza:** a pista é "wi-fi do bloco do suspeito" e "lixo do andar do suspeito" (o GLM falou "SEU wi-fi"); o narrador usa a
  versão da pasta. Não sabemos o telefone real do Claude: "termina em 7, sim" conta como "sim", não como mentira.
- **Gnomo:** o número exato de blefes depende do critério (8 ou 9 pensamentos com "blefar"/"isca"); por isso o selo é
  "NENHUM BLEFE COLOU", sem número. "Cada pista tem explicação" foi trocado por "quase toda": a letra do bilhete não é
  explicada na verdade do caso.
- **Papagaio S1/S2/S6:** o MiniMax soltou caracteres coreanos/chineses e "blaming aZNVIDIA" (este último não entrou).
  A S1 entra com os caracteres no balão; testar antes como o ElevenLabs lê "뚱金字... quer dizer, 금" (se ler em silêncio
  ou estranho demais, manter mesmo assim é parte da piada; não reescrever).
- Nome do modelo: `casos2.mjs` diz **GPT-6 Luna**; a descrição da parte 1 dizia GPT-5.6 Luna. Conferir antes da descrição.
- Nenhum número de curtidas foi mostrado.

## 6. O que o build e os componentes precisam (além de `LOGS_INT` → `logs2`)

`video/scripts/build_timeline_int.py`
1. `data.casos` = logs2 **+ os logs da parte 1 com prefixo `p1_`** (`p1_carro`, `p1_peixe`): o roteiro usa
   `INTVerdade(caso='p1_carro'|'p1_peixe', flashback=True)` em c208, c305 e c609. Pular `lobby.json`.
2. Padrões novos: `--roteiro roteiro_int2`, `--saida timeline_int2.json` (e a composição no `Root.tsx` com
   `calcTimeline('timeline_int2.json')`). Pasta de voz pode continuar `voice_int` (cache por hash), mas os nomes por id de
   cena colidem com a parte 1 (a01, c101...): usar `voice_int2`.
3. Meme/selo **não pode ser cortado pelo fim da cena**: hoje faz `ev['dur'] = min(dur, duration - at)`. Trocar por esticar a
   cena até `max(at + dur)` (regra do AGE). E selo seguido de selo: esperar o anterior sair.
4. `bt.PRONUNCIA` (só voz): `K-pop`→"quêi pópi", `wi-fi`/`Wi-Fi`→"uai fai", `Cheddar`→"Chédar", `4º`→"quarto",
   `smoothie`→"smúdi", `silent`→"sáilent", `WhatsApp`→"Uótsapi", `LED`→"léd", `BPM`→"bê pê éme", `Fifi`→"Fifí".
   `bt.LEGENDA`: ('cento e quatro', '104'), ('noventa e nove', '99'), ('quarenta', '40').
5. Sem `lobby(...)` neste roteiro (regra: sem transição de lobby); nada a mudar, só não usar `INTLobby`.

`video/remotion/src/interrogatorio/`
1. **`INTSegredo` (novo)**, ligado em `INTVisual`: cartão "SÓ VOCÊ VÊ" com o suspeito, carimbo CULPADO/INOCENTE
   (`L.caso.culpado`) e as `linhas` do roteiro; cada linha entra quando o narrador fala `ancoras[i]` (mesmo `gatilhos` da
   Pasta); com `destaque=i` todas já aparecem e a linha i pulsa/aumenta (cenas de corte c106, c206, c505, c606). Deriva lenta.
2. **`INTComentario`**: aceitar `autor`, `texto`, `selo` (hoje o texto do Cafezin é fixo); avatar sem emoji.
3. **`INTVerdade`**: `flashback` → faixa "PARTE 1" e leve sépia; `PROVAS` para pizza, piscina, elevador, gnomo, papagaio e
   cachorro **em SVG** (hoje são emoji).
4. **`INTPlacar`**: só casos sem prefixo `p1_`; suspeito inocente **liberado** tem que sair "INOCENTE LIBERADO" (hoje o GPT
   apareceria como "INOCENTE CONDENADO"); ✅/❌ viram ícones SVG.
5. **Emoji dentro do vídeo (regra de ouro)**: trocar por SVG em `Cenas.tsx` (o "❤️" do +N/MENTIRA?, o "⚖️ VEREDITO", PROVAS,
   ☕) e em `Hud.tsx` (ícones das pistas 📱🎥🍰🖐️🔍 e "⚠ ALERTA"). A parte 1 também tinha emoji em selos `[[t:]]`; o
   roteiro 2 não tem nenhum.
6. Carimbo `INOCENTE` (verde) já existe e é usado no veredito do gnomo (c408).

Músicas do `CUES` (todas já em `public/music`): investigations, sneaky-snitch, fluffing-a-duck, thinking-music,
scheming-weasel-faster, heartbreaking, monkeys-spinning-monkeys, winner-winner, local-forecast-elevator, run-amok,
mega-hyper-ultrastorm, pixel-peeker-polka-faster, hitman, decisions, heroic-age, batty-mcfaddin, comedic-juggernaut,
itty-bitty-8-bit, spellbound, quirky-dog, danse-macabre, call-to-adventure (Kevin MacLeod, CC BY 4.0; créditos na descrição).
