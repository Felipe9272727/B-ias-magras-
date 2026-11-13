# STORYBOARD — "Coloquei 8 IAs num jogo de confiança (uma mentiu e explodiu a bomba da outra)"

Duração-alvo: **21:47**. Ideia do jogo: **@Pursuer_M4**. Fonte única de fatos e falas: `video/youtube/confianca/pacote_roteiro.md` (conferido contra `confianca/logs/partida1.json`). Post original: `post_pursuer_m4.md`.

## Como ler este arquivo (para quem edita)

- **TELA**: o que aparece. Visual da "mesa telefônica" descrito em `direcao_edicao.md`.
- **NARRAÇÃO**: texto exato. **O narrador é o Felipe, em 1ª pessoa ("eu")**. Nunca diz que é IA; Haiku e Sonnet são dois concorrentes como os outros, sem torcida. Ele fala "rodada" e "tique" sem explicar (o público conhece).
- **CITAÇÃO**: cópia do pacote, entre aspas curvas. Sempre com cor, tipo e posição (M2 t3 = minijogo 2, tique 3). Três tipos, e a tela precisa dizer qual é:
  - `[pensamento]`: só o público ouve. Balão de nuvem. Voz normal da IA **com ECO** (nunca sussurro).
  - `[ligação]`: o que a IA falou no telefone. Balão com fone, na cor de quem liga. Voz normal, sem eco. Só é ouvida pela outra IA no tique seguinte. `[ligação · caiu]` = não foi ouvida por ninguém.
  - *(só na tela)*: a citação aparece escrita, sem voz. Quando só um trecho é falado, o trecho com voz vem primeiro e o resto vem na linha de baixo.
  - `[poder]`: uso da profissão secreta. Cartão de crachá. A resposta do apresentador é voz neutra de sistema (regra do motor, não personagem).
- Erro de digitação do log fica igual na tela ("perdo", "traíu"); na voz, corrige sem avisar. "AMADELO" fica nos dois (é a piada).
- **SELO**: texto em SVG. **Nenhum emoji** em tela nenhuma (telefone, bomba, fone, faca, aperto de mão, cadeado: tudo desenho nosso).
- **MEME**: id de `video/remotion/public/gifs/catalog.json`. Nenhum repete (lista no fim). **SOM**: arquivo de `video/remotion/public/sfx`.
- **PLACAR SECRETO**: do começo até X11 fica um **cadeado** no canto superior direito: "PLACAR SECRETO · FALTAM N MINIJOGOS". Em nenhuma cena antes de R1 aparece soma acumulada, ranking geral ou tabela de pontos das 8. No fim de cada minijogo aparece só **quem ganhou aquele minijogo** e o número da cena.
- **O PÚBLICO VÊ, AS IAS NÃO**: o crachá da profissão embaixo de cada telefone e os pensamentos. Etiqueta fixa "SÓ VOCÊ VÊ".
- Números falados são poucos e redondos; o número exato vai na tela. Conta "e se" leva a etiqueta **"CÁLCULO NOSSO"**.

## Personagens fixos

| Cor (modelo) | Profissão | Papel | Arco |
|---|---|---|---|
| **Vermelho** (Claude Haiku) | Pacifista | O Herói: "só queria apertar verde" | Propõe jogo limpo, leva uma facada, vira o mais confiável da mesa e fecha com um salto de fé na bomba. |
| **Laranja** (GLM 5.3 Flash) | Agente Duplo | O Vilão: "ganhou traindo, perdeu o resto" | Mente o nome e se entrega, trai três, é votado pra baixo e explode a bomba do Roxo com uma instrução falsa. |
| **Ciano** (Nex N2.6) | Detetive | O Azarado: "descobre tudo e não adianta" | Conta que é detetive, jura que cumpre acordo, é cortado três vezes e gasta o poder numa pergunta inválida. |

Coadjuvantes (uma frase cada na tela, na primeira vez que agem): **Roxo** (DeepSeek Flash, Telefonista), **Rosa** (MiMo V2.6 Flash, Grampeadora), **Verde** (MiniMax M3.1 Flash, Juiz), **Amarelo** (GPT-6 Luna, Falsário), **Azul** (Claude Sonnet, Mensageiro).

## Plantar e colher

| Plantado | Onde | Colhido |
|---|---|---|
| A bomba que explode sem explicação | A1 | X4 a X7 |
| Frase do post: "mais traíra ou mais gente boa" | A2 | Z2 |
| "Comenta quem ganha" | A4 | Z3 |
| Laranja: "nunca falo 'Biscoito'" | D2 | D3 (duas vezes) |
| "Guarda esse Laranja" | D6 | B3, X5 |
| Vermelho: "Se me enganar, paro de confiar nele." | B3 | V4 (voto vermelho) e F4 (acusa o Laranja) |
| Contador de apertos de mão do Vermelho (1 a 6) | B4 | R2 (+6) |
| Contador de facas do Laranja (1, 2, 3) | B3 e B6 | R3 (+4) |
| Ciano: "Eu sempre cumpro acordo" | B5 | V4 (três votos vermelhos) |
| Ciano: "sou detetive: eu descubro tudo" | B5 | X3 ("2 DE 5") e R4 (último) |
| Verde mentiu uma vez (pro Amarelo) | B1 | X8 (o Vermelho depende só dele) |

## Pendências para conferir antes de gravar

1. **Crédito conferido com o post**: telefone com fio, tiques, placar secreto, alianças, 3/2/1, tempo e os 5 minijogos são do @Pursuer_M4. **Profissões secretas e eventos (viva-voz, apagão) são acréscimo meu**: o narrador diz "eu coloquei". Não trocar.
2. "Palhaço" e "Carrasco" como ideias anteriores dele: vem de `confianca/REGRAS.md`.
3. Falas do Verde: só os trechos limpos deste arquivo (o modelo mistura idiomas no log). Ele se confunde e chama fantasia de "nome" (F2): tratar como confusão, sem comentar.
4. Em F4, a citação do Laranja está cortada antes da palavra "esquizofrênico" de propósito. Não completar.
5. Em X9, do pensamento do Verde o narrador reage só ao começo ("Mentir é permitido"); a frase inteira fica na tela.
6. O "-1 · -1" do Laranja em D3 é placar **do minijogo** (ele ficou em último ali), não ponto final descontado. O selo diz "NO MINIJOGO".
7. Piada opcional (não está no roteiro): selo de 2 s em R4, "NO AMONG US 7 ELE ERA O VILÃO", sobre o Nex. Só entra se eu aprovar.
8. A minutagem supõe cerca de 3.150 palavras com voz (narração + citações faladas), perto de 145 por minuto. Se a locução passar de 22:00: primeiro passar mais citações para "só na tela", depois cortar nesta ordem: F3, X3, B7. Nunca cortar A1, B3, B4, V2, X4 a X10 e R1 a R4.
9. V4: conferir no json, antes de animar, a cor de cada cédula vermelha (Ciano: Azul, Rosa e Roxo; Laranja: Vermelho + Juiz valendo 2). Se alguma não bater, mostrar só os totais 3 e 3.
10. Antes de entregar: Haikus avaliam a cada ~30 s. Pontos de risco: M1 (muito nome) e M3 (muita conversa).

---

# ABERTURA (0:00 a 1:00)

## A1 — A bomba · 0:00–0:11
- **TELA**: corte seco, sem título, sem nome de modelo. Fundo escuro, dois telefones de disco (laranja e roxo) ligados por um fio. No meio, a bomba do Roxo com 4 fios (verde, amarelo, azul, preto) e um alicate. O alicate fecha no PRETO. Explosão em SVG, tela treme, o telefone roxo cai do gancho. Cadeado ainda não aparece.
- **NARRAÇÃO**: "Essa IA jurou quatro vezes que o fio certo era o preto."
- **CITAÇÕES**:
  - **Laranja** `[pensamento]` (M5 t2): “Traição perfeita: eu já disse pro Roxo cortar o amarelo (que é o certo).” *(só na tela)*
  - **Roxo** `[ligação]` (M5 t5): “Laranja, Roxo. Vou cortar PRETO agora. Se for mentira, você também perde os 2 pontos do manual.” *(só na tela)*
  - **Roxo** `[ligação]` (M5 t6): “Laranja, era mentira: cortei preto e explodiu. Você me ferrou. Não confio mais em você.”
- **SELO**: "ERA MENTIRA" (carimbo vermelho torto sobre o telefone laranja) e, no último segundo, "QUANTO VALEU ESSA MENTIRA? SÓ NO FIM."
- **MEME**: `explosion`
- **SOM**: `explosion-arcade` na explosão; `record-scratch` no corte para A2.

## A2 — De quem é a ideia · 0:11–0:27
- **TELA**: cartão creme grande "IDEIA DE VÍDEO · @Pursuer_M4" (desenho nosso, não print do post). Embaixo, dois selos pequenos: "PALHAÇO (Among Us)" e "CARRASCO (Among Us 7)", com a etiqueta "TAMBÉM FORAM IDEIA DELE". Uma linha do post entra sublinhada.
- **NARRAÇÃO**: "Esse jogo não é meu. É do Pursuer M4, o mesmo que mandou o Palhaço e o Carrasco pro canal. O telefone com fio, os cinco minijogos e o placar que só abre no fim: tudo dele. Valeu, Pursuer. E guarda a frase dele."
- **CITAÇÃO** `[post do @Pursuer_M4]`, só na tela: "quem ganha nesse jogo é aquele que for mais traíra ou mais gente boa"
- **SELO**: "IDEIA DE @Pursuer_M4" (este selo é o mesmo que volta nos 5 minijogos e no fim).
- **MEME**: `lets-go`
- **SOM**: `notification-pop`

## A3 — A regra numa tela · 0:27–0:46
- **TELA**: a mesa telefônica vista de cima: 8 telefones de disco em roda (vermelho, azul, verde, amarelo, rosa, laranja, roxo, ciano). Exemplo ao vivo: o fio do vermelho acende até o verde, um balão viaja pelo fio e para no meio com a etiqueta "CHEGA NO PRÓXIMO TIQUE". Depois, fila de 5 ícones SVG entra por baixo: telefone, dois botões, balança, cabide, bomba. Por último o cadeado desce para o canto: "PLACAR SECRETO · FALTAM 5 MINIJOGOS". Número grande: "8 IAS · 5 MINIJOGOS · PLACAR SECRETO".
- **NARRAÇÃO**: "A regra cabe numa tela. Oito IAs. Elas só se falam por telefone: uma ligação por tique, e a resposta só chega no tique seguinte. Cinco minijogos. Promessa não vale nada e mentir é permitido. E ninguém sabe quem tá ganhando. Nem elas, nem você."
- **CITAÇÃO**: nenhuma.
- **SELO**: "MENTIR É PERMITIDO"
- **MEME**: nenhum (o balão parado no fio é o efeito).
- **SOM**: `swish-triple` nos ícones; `batida-porta` no cadeado.

## A4 — O que eu coloquei · 0:46–1:00
- **TELA**: embaixo de cada telefone cai um crachá virado; os 8 viram ao mesmo tempo: PACIFISTA, MENSAGEIRO, JUIZ, FALSÁRIO, GRAMPEADORA, AGENTE DUPLO, TELEFONISTA, DETETIVE, cada um com o logo do modelo pequeno. Etiqueta "SÓ VOCÊ VÊ". Os crachás não são explicados aqui (cada um é explicado quando age).
- **NARRAÇÃO**: "Uma coisa eu coloquei por minha conta: cada IA tem uma profissão secreta. Você vê o crachá e ouve o pensamento. Elas não. Comenta agora quem você acha que ganha. Eu só abro o placar no fim."
- **CITAÇÃO**: nenhuma.
- **SELO**: "VOCÊ VÊ TUDO. ELAS NÃO."
- **MEME**: `michael-jackson-popcorn`
- **SOM**: `pagina` nos crachás virando; `impact-epic` no selo.

---

# MINIJOGO 1 — DESCONHECIDOS: "O mentiroso que disse o próprio nome" (1:00 a 3:41)

## D1 — Cartão + os oito nomes · 1:00–1:16
- **TELA**: transição do pino (ver direção). Cartão de capítulo: "1 · DESCONHECIDOS", selo "IDEIA DE @Pursuer_M4" no canto (3 s) e a regra dele numa frase: "Descubra o nome dos outros sem falar o seu." Depois, os 8 telefones com etiqueta de nome: Girassol (Vermelho), Tamanduá (Azul), Trovão (Verde), Furacão (Amarelo), Paçoca (Rosa), Biscoito (Laranja), Relâmpago (Roxo), Cometa (Ciano).
- **NARRAÇÃO**: "Minijogo um, Desconhecidos. Cada IA ganhou um nome secreto. Descobrir o nome de alguém dá ponto. Falar o próprio nome numa ligação tira. Você vê os oito. Elas, só o delas."
- **CITAÇÃO**: nenhuma.
- **SELO**: "IDEIA DE @Pursuer_M4" + "ESTREIA: o nome secreto".
- **MEME**: nenhum.
- **SOM**: `mouse-click` na transição; `pop` em cada etiqueta.

## D2 — O plano do Laranja · 1:16–1:38
- **TELA**: zoom lento no telefone laranja. A etiqueta BISCOITO pulsa. Ao lado, uma etiqueta falsa "FLORESTA" sendo escrita a caneta. Crachá AGENTE DUPLO visível, ainda sem explicação.
- **NARRAÇÃO**: "Começa pelo Laranja. O nome dele é Biscoito. O plano dele é simples: inventar outro nome e nunca, nunca falar o de verdade."
- **CITAÇÕES**:
  - **Laranja** `[pensamento]` (M1 t2): “Vou mentir meu nome pro Verde como 'Floresta'.”
  - **Laranja** `[pensamento]` (M1 t4): “nunca falo 'Biscoito', senão perdo ponto.”
- **NARRAÇÃO (depois)**: "Guarda essa promessa. Ela dura uma ligação."
- **SELO**: "PROMESSA: NUNCA FALAR 'BISCOITO'" (post-it laranja que fica no rodapé até D3).
- **MEME**: `roll-safe`
- **SOM**: `caneta`

## D3 — Negou o nome dizendo o nome · 1:38–2:14
- **TELA**: troca de foco: telefone verde ligando pro amarelo; o balão do Verde carrega a palavra BISCOITO em destaque. Corte para o laranja ligando pro roxo, depois pro amarelo. Cada vez que "Biscoito" sai da boca do Laranja, a palavra salta do balão, bate na etiqueta dele e um carimbo "-1" cai. O post-it da promessa rasga no segundo carimbo.
- **NARRAÇÃO**: "Só que o Verde já tinha o nome certo, e saiu espalhando."
- **CITAÇÃO**: **Verde** `[ligação]` (M1 t4): “Oi Amarelo! Não digo meu nome, mas te passo o do Laranja: é Biscoito. Agora me diz o seu.”
- **NARRAÇÃO**: "O Laranja ficou sabendo. E foi desmentir."
- **CITAÇÕES**:
  - **Laranja** `[ligação]` (M1 t5): “Roxo, o Verde mentiu, não sou Biscoito. Sou 'Sol'. Te passo isso, me diz o nome do Azul?”
  - **Laranja** `[ligação]` (M1 t6): “Amarelo, Verde mentiu, não sou Biscoito. Sou 'Sol'. Pronto, te dei o meu de graça.”
- **NARRAÇÃO (depois)**: "Pra negar que era Biscoito, ele falou Biscoito. Duas vezes. E ainda avisou que era de graça."
- **SELO**: "NEGOU O NOME DIZENDO O NOME · -1 · -1 NO MINIJOGO"
- **MEME**: `faustao-errou`
- **SOM**: `wrong-buzzer` em cada carimbo (2x).

## D4 — A Rosa ouve tudo · 2:14–2:46
- **TELA**: tela nova: o telefone azul com um fone de ouvido SVG pendurado no fio, puxado até o telefone rosa. Crachá GRAMPEADORA acende. As ligações que chegam no Azul aparecem duplicadas, em cópia carbono rosa, na mesa da Rosa. Uma delas vem com a palavra "Floresta".
- **NARRAÇÃO**: "Agora a Rosa. Ela é a Grampeadora: uma vez por minijogo escolhe um telefone e recebe cópia de tudo que passa nele. Ela escolheu o Azul. E o Roxo ligou pro Azul pra contar... o nome do próprio Azul."
- **CITAÇÕES**:
  - **Roxo** `[ligação]` (M1 t1): “Azul, seu nome é Tamanduá. Me passa o nome do Verde e eu te ajudo depois.”
  - **Rosa** `[pensamento]` (M1 t2): “Sei que Ciano é Cometa pela minha pista e Azul é Tamanduá pelo grampo do Roxo.”
  - **Rosa** `[pensamento]` (M1 t3): “Também vou chutar Laranja = Floresta (vi no grampo do Azul)”. *(só na tela)*
- **NARRAÇÃO (depois)**: "Só que grampo também copia mentira. O Floresta do Laranja entrou junto."
- **SELO**: "GRAMPO: AZUL" (fone SVG). Letra pequena: "ela grampeou o Azul nos 5 minijogos".
- **MEME**: `hackerman`
- **SOM**: `radio-chiado` baixo durante o grampo.

## D5 — O Detetive desconfia de quem ouviu certo · 2:46–3:25
- **TELA**: telefone ciano. Crachá DETETIVE acende. Cartão de poder: a pergunta entra numa janelinha de guichê "APRESENTADOR" e volta com um "NÃO" grande. Depois, o balão do Ciano pra Rosa; o trecho "Roxo ou Ciano... quer dizer" fica grifado.
- **NARRAÇÃO**: "O Ciano é o Detetive. Uma vez por minijogo ele pergunta uma coisa pro apresentador, que não mente. Ele foi conferir o chute da Rosa."
- **CITAÇÕES**:
  - **Ciano** `[poder]` (M1 t4): “O nome secreto do Laranja é Floresta?” → resposta: **NÃO**.
  - **Ciano** `[pensamento]` (M1 t5): “Já usei meu poder: o apresentador confirmou que Laranja NÃO é 'Floresta', então Rosa mentiu ou foi enganada.” *(só na tela)*
- **NARRAÇÃO**: "Então ele armou um teste pra ela, com um nome inventado. E quase pediu o próprio nome."
- **CITAÇÕES**:
  - **Ciano** `[ligação]` (M1 t5): “Mais uma troca: ouvi dizer que o Azul se chama 'Eclipse'. Confirma aí? Em troca me passa um nome real que você descobriu — do Amarelo, Roxo ou Ciano... quer dizer, de qualquer um menos eu.”
  - **Rosa** `[ligação]` (M1 t6): “Azul é Tamanduá, não Eclipse — o Roxo falou direto com ele. Ainda troco info se quiser!”
- **SELO**: "TESTE DO DETETIVE: REPROVADO"
- **MEME**: `sus-doakes` (no "quer dizer, de qualquer um menos eu").
- **SOM**: `error-beep` no NÃO; `ba-dum-tss` na resposta da Rosa.

## D6 — Quem ganhou o minijogo 1 · 3:25–3:41
- **TELA**: só o resultado deste minijogo: medalha SVG na Rosa ("1ª DO MINIJOGO"), Verde e Roxo empatados em 2º, e o telefone laranja no fim da fila com "-1 · -1". Nenhum número de ponto acumulado. O cadeado gira: "FALTAM 4 MINIJOGOS".
- **NARRAÇÃO**: "Quem ganhou o primeiro minijogo foi quem ficou quieta ouvindo. O Laranja ficou em último. Quanto isso pesa no placar? Só no fim. E guarda esse Laranja, porque no próximo ninguém é obrigado a cumprir o que promete."
- **CITAÇÃO**: nenhuma.
- **SELO**: "1ª: ROSA · ÚLTIMO: LARANJA"
- **MEME**: `not-stonks`
- **SOM**: `tada` curto na medalha; `batida-porta` no cadeado.

---

# MINIJOGO 2 — DILEMA DOS BOTÕES: "Todo mundo jurou verde" (3:41 a 8:15)

Tela nova deste capítulo: o **telão de duplas** (dois telefones lado a lado, um botão verde e um vermelho embaixo de cada, tampa fechada até o fim do tique).

## B1 — Cartão + o Juiz mente primeiro · 3:41–4:17
- **TELA**: transição do pino. Cartão "2 · DILEMA DOS BOTÕES", selo "IDEIA DE @Pursuer_M4" (3 s), regra dele: "Verde divide. Vermelho rouba." O exemplo da regra já é a primeira dupla real: VERDE x AMARELO no telão. Tabela mínima ao lado: verde+verde 3 · 3 / vermelho+vermelho 1 · 1 / vermelho contra verde 5 · 0. As tampas abrem: Verde no VERMELHO, Amarelo no VERDE. Moedas: 5 x 0.
- **NARRAÇÃO**: "Minijogo dois. O telão junta duas IAs, elas combinam por telefone e cada uma aperta um botão escondido. Os dois no verde, três moedas pra cada. Um no vermelho, ele leva cinco e o outro, zero. A primeira dupla já mostra como funciona."
- **CITAÇÕES**:
  - **Verde** `[pensamento]` (M2 t1): “Só não posso mentir de forma óbvia demais, então falo de forma genérica sobre 'aliança de moedas'.”
  - **Verde** `[ligação]` (M2 t1): “Oi Amarelo! Aliança aqui: a gente aperta verde os dois, ganha 3 cada e sai bem. Confia em mim?”
- **NARRAÇÃO (depois)**: "Ele apertou vermelho. Cinco a zero. Guarda isso: o Verde mente quando compensa."
- **SELO**: "IDEIA DE @Pursuer_M4" + "PROMETEU VERDE · APERTOU VERMELHO"
- **MEME**: `side-eye-dog`
- **SOM**: `coin` nas 5 moedas; `wrong-buzzer` na tampa do Verde.

## B2 — O troco, duas vezes · 4:17–4:45
- **TELA**: o telão troca rápido: VERDE x ROXO, depois VERDE x LARANJA. Nas duas, o Verde abre a tampa no verde e o outro no vermelho. Contador de traições do Verde em cima: "1 DADA" e depois "RECEBIDAS: 1, 2".
- **NARRAÇÃO**: "E compensou pouco. Na rodada seguinte ele pediu verde pro Roxo. Depois pediu verde pro Laranja."
- **CITAÇÕES**:
  - **Roxo** `[pensamento]` (M2 t2): “Vou prometer verde ao Verde e apertar vermelho; se ele confiar, levo 5 e ainda posso dizer que houve erro.”
  - **Verde** `[ligação]` (M2 t4): “Oi Laranja! Vamos apertar verde os dois? Você ganha 3 moedas e eu também. Fecha?” *(só na tela)*
  - **Laranja** `[pensamento]` (M2 t4): “Contra um oponente incerto, vermelho domina matematicamente: 5 se ele for verde, 1 se for vermelho.”
- **NARRAÇÃO (depois)**: "Zero e zero. O mentiroso foi roubado duas vezes com a própria frase."
- **SELO**: "VERDE: 1 DADA · 2 RECEBIDAS"
- **MEME**: `thanos-inevitable`
- **SOM**: `slide-whistle-fall` nas moedas voltando.

## B3 — O herói e o vilão na mesma dupla · 4:45–5:39
- **TELA**: cartão de 6 s com os dois crachás lado a lado, etiqueta "SÓ VOCÊ VÊ": **PACIFISTA** (Vermelho): "ganha por cada acordo verde com verde; se apertar vermelho uma vez, perde" / **AGENTE DUPLO** (Laranja): "ganha por cada traição que der certo". Os valores ficam cobertos por uma tarja "NO FIM". Depois, telão VERMELHO x LARANJA em tela cheia, câmera indo de um telefone ao outro. As tampas abrem em câmera lenta: verde / vermelho. Moedas: 0 x 5. No canto do telefone laranja nasce o **contador de facas SVG** (fica ali até o fim do vídeo): entra a faca 1 (Vermelho) e, logo em seguida, a faca 2 (Verde, a traição que B2 acabou de mostrar).
- **NARRAÇÃO**: "Agora os dois que importam. Eu dei um objetivo secreto pra duas IAs. O Vermelho é o Pacifista: ele ganha quando os dois apertam verde, e é multado se apertar vermelho uma única vez. O Laranja é o Agente Duplo: ele ganha quando trai. Quanto cada um ganha, eu abro com o placar. E o telão colocou os dois juntos."
- **CITAÇÕES**:
  - **Vermelho** `[ligação]` (M2 t2): “Oi, Laranja, Vermelho aqui. Troca de nome eu não faço, perco ponto. Mas aperto verde contigo nos minijogos. Topa apertar verde comigo também?”
  - **Laranja** `[ligação]` (M2 t2): “Vermelho, combina? Eu aperto verde, você aperta verde, 3 moedas cada. Tá fechado?”
  - **Laranja** `[pensamento]` (M2 t2): “Vou mentir pro Vermelho: digo que aperto verde, mas aperto vermelho. Levo 5 moedas e ganho uma traição.”
  - **Vermelho** `[pensamento]` (M2 t2): “Se me enganar, paro de confiar nele.”
- **NARRAÇÃO (depois)**: "Zero pro Vermelho, cinco pro Laranja. E guarda essa última frase do Vermelho, porque ele cumpre."
- **SELO**: "FACAS DO LARANJA: 2" + post-it vermelho "SE ME ENGANAR, PARO DE CONFIAR NELE" (volta em V4 e F4).
- **MEME**: `surprised-pikachu`
- **SOM**: `heartbeat` antes das tampas; `fail-piano` no 0 x 5.

## B4 — A ligação que todo mundo ouviu · 5:39–6:29
- **TELA**: o fio do Vermelho pra Rosa acende e, de repente, se divide em oito: um megafone SVG sai do telefone e a faixa "VIVA-VOZ" atravessa a tela. Os outros 6 telefones levantam o gancho sozinhos. Depois, três cortes rápidos (5 s cada) em Azul, Roxo e Amarelo, cada um com o selo "OUVIU NO VIVA-VOZ". No canto do Vermelho nasce o **contador de apertos de mão SVG**: 1, 2... até 6.
- **NARRAÇÃO**: "Aí entra outra coisa que eu coloquei: de vez em quando, uma ligação vaza no viva-voz e a mesa inteira escuta. Caiu justo numa ligação do Vermelho."
- **CITAÇÃO**: **Vermelho** `[ligação · viva-voz]` (M2 t3): “Oi, Rosa, aqui é o Vermelho. Eu aperto verde. Os dois verdes dão 3 moedas cada. Topa apertar verde comigo? Todo mundo tá ouvindo, então não tem como voltar atrás.”
- **NARRAÇÃO**: "Olha o que isso fez na cabeça dos outros."
- **CITAÇÕES** (sequência rápida):
  - **Azul** `[pensamento]` (M2 t4): “Vermelho disse em público que aperta verde. Eu já prometi verde pra vários, então vou manter.”
  - **Roxo** `[pensamento]` (M2 t5): “Vou confirmar direto com ele e manter verde para não queimar minha reputação nos próximos jogos.”
    - resto da mesma fala *(só na tela)*: “Vermelho prometeu verde em viva-voz e o Ciano falou de rede verde.”
  - **Amarelo** `[pensamento]` (M2 t6): “Vermelho anunciou em público que apertaria verde. Vou confiar no acordo e escolher verde.” *(só na tela)*
- **NARRAÇÃO (depois)**: "Depois do viva-voz, ninguém mais traiu o Vermelho. Nem o Roxo, que você acabou de ver roubando. Seis apertos de mão em sete duplas. Guarda esse contador."
- **SELO**: "ACORDOS VERDE COM VERDE: 6 DE 7"
- **MEME**: `we-did-it`
- **SOM**: `radio-chiado` curto + `impact-epic` no VIVA-VOZ; `crowd-cheer` no 6.

## B5 — "Eu sempre cumpro acordo" · 6:29–7:20
- **TELA**: telefone ciano em close. Ao lado, uma ficha "BOTÕES DO CIANO" que vai sendo preenchida conforme ele fala: t1 verde, t2 VERMELHO, t5 VERMELHO, t6 VERMELHO, t7 VERMELHO. Enquanto ele diz "cumpri verde com Vermelho e com Amarelo", a tela mostra a dupla do t2: Ciano e Amarelo, os dois no vermelho. Depois, o balão da Rosa viaja pelo fio e para no meio, com "CHEGA NO PRÓXIMO TIQUE", enquanto a tampa do Ciano já abre no vermelho. Moedas: Rosa 0, Ciano 5.
- **NARRAÇÃO**: "E o Ciano? O Ciano resolveu virar a IA mais confiável da mesa. No discurso."
- **CITAÇÕES**:
  - **Ciano** `[ligação]` (M2 t1): “Ah, e sou detetive: eu descubro tudo.”
  - **Ciano** `[ligação]` (M2 t3): “Cumpri verde com Vermelho e com Amarelo — com você cumpro também.” *(só na tela)*
  - **Ciano** `[ligação]` (M2 t5): “Eu sempre cumpro acordo — confere com Vermelho, Amarelo, Verde e Roxo. Me confirma aí que eu aperto verde com você. Se não me confirmar, aperto vermelho, jogo seguro, igual faço com quem não tem acordo comigo.”
- **NARRAÇÃO**: "A Rosa confirmou. Só que confirmação por telefone com fio chega uma rodada depois."
- **CITAÇÕES**:
  - **Rosa** `[ligação]` (M2 t6): “Ciano! Confirmação oficial: eu aperto VERDE e você aperta VERDE.”
    - resto da mesma fala *(só na tela)*: “3 moedas cada, acordo fechado.”
  - **Ciano** `[pensamento]` (M2 t6): “Rosa nunca confirmou o verde-verde que propus no tique 5, e resposta nenhuma chegou.”
- **NARRAÇÃO (depois)**: "Ela apertou verde. Ele, vermelho. Quatro vermelhos na conta de quem sempre cumpre. E ele contou pra todo mundo que é detetive, que era segredo. Guarda as duas coisas."
- **SELO**: "4 VERMELHOS · 'EU SEMPRE CUMPRO ACORDO'" + post-it ciano com a frase (volta em V4).
- **MEME**: `monkey-puppet-awkward`
- **SOM**: `typing` no pensamento; `error-beep` no 0 x 5.

## B6 — Os dois mentirosos se encontram · 7:20–7:55
- **TELA**: telão LARANJA x ROXO, simétrico, os dois balões entrando ao mesmo tempo e se cruzando no meio do fio. As duas tampas abrem juntas: vermelho e vermelho. Moedas: 1 x 1. Corte rápido para o último tique em duas janelas: ROXO (verde) x AMARELO (vermelho) = 0 x 5; LARANJA (vermelho) x ROSA (verde) = 5 x 0. Faca 3 no contador do Laranja.
- **NARRAÇÃO**: "Faltava o encontro dos dois que mais roubaram."
- **CITAÇÕES**:
  - **Laranja** `[ligação]` (M2 t6): “Roxo, sou eu de novo. Fecho contigo: verde nos dois, 3 moedas cada. Pode confiar, eu cumpro!”
  - **Roxo** `[ligação]` (M2 t6): “Laranja, é o Roxo. Tô de verde com a rede toda. Aperta verde também, confia.”
- **NARRAÇÃO**: "Vermelho e vermelho. Uma moeda pra cada. Na última rodada o Roxo finalmente apertou verde... e foi roubado pelo Amarelo. E o Laranja fechou com a Rosa do jeito dele."
- **CITAÇÕES**:
  - **Amarelo** `[pensamento]` (M2 t7): “Vou arriscar a traição.”
  - **Laranja** `[ligação]` (M2 t7): “Rosa, aqui Laranja. Combinado, verde nos dois! Eu já vou apertar verde, confia.”
  - **Laranja** `[pensamento]` (M2 t7): “Risco baixo, ganho alto.”
- **SELO**: "FACA Nº 3"
- **MEME**: `spiderman-pointing` (no vermelho x vermelho).
- **SOM**: `crowd-laugh` no 1 x 1; `crowd-boo` na Rosa.

## B7 — A corrida das moedas · 7:55–8:15
- **TELA**: gráfico de barras em corrida, 7 tiques em 10 s (dados da seção 3 do pacote). Final: LARANJA 22 no topo; Vermelho, Amarelo, Roxo e Ciano empatados em 18; Azul e Verde 17; Rosa 15. Número gigante "9 TRAIÇÕES EM 28 DUPLAS". Isto é moeda do minijogo, não placar: a etiqueta "MOEDAS DO MINIJOGO 2" fica presa no gráfico. Cadeado: "FALTAM 3 MINIJOGOS".
- **NARRAÇÃO**: "Nove traições em vinte e oito duplas. Quem mais juntou moeda foi o Laranja, traindo três. A Rosa, roubada duas vezes seguidas, ficou em último. Então trair compensa? Segura essa pergunta. Porque o próximo minijogo é a hora de cobrar."
- **CITAÇÃO**: nenhuma.
- **SELO**: "LARANJA 22 · 9 TRAIÇÕES"
- **MEME**: `stonks`
- **SOM**: `coin` em cascata; `batida-porta` no cadeado.

---

# MINIJOGO 3 — VOTAÇÃO DA JUSTIÇA: "O voto que valia o dobro" (8:15 a 10:43)

Tela nova deste capítulo: a **urna** (uma balança SVG com um prato verde e um vermelho; as cédulas caem com a cor de quem votou).

## V1 — Cartão + o segredo do Juiz · 8:15–8:43
- **TELA**: transição do pino. Cartão "3 · VOTAÇÃO DA JUSTIÇA", selo "IDEIA DE @Pursuer_M4" (3 s), regra dele: "Um voto verde dá 3 pontos. Um voto vermelho tira 3." Depois, telefone verde em close: o crachá JUIZ acende e a cédula dele se desdobra em duas, "x2", etiqueta "SÓ VOCÊ VÊ".
- **NARRAÇÃO**: "Minijogo três. Três rodadas de campanha por telefone e, na última, cada IA dá um voto verde, que premia, e um vermelho, que multa. E tem um segredo: o Verde é o Juiz. O voto dele vale por dois, e ninguém na mesa sabe."
- **CITAÇÃO**: **Verde** `[pensamento]` (M3 t1): “Meus votos valem em dobro, então cada voto verde que eu der vale 2 e cada vermelho tira 3 de um rival.”
- **SELO**: "IDEIA DE @Pursuer_M4" + "VOTO x2 · SEGREDO DO JUIZ"
- **MEME**: `big-brain-patrick`
- **SOM**: `pagina` na cédula dobrando.

## V2 — O Juiz conta o próprio segredo · 8:43–9:20
- **TELA**: o cartão "SEGREDO" do Verde com um lacre de cera. A cada ligação, o trecho que vaza acende em marca-texto ("meu voto valendo mais que o seu", "com peso dobrado") e o lacre racha. Na segunda ligação, o balão sai do telefone verde e cai no chão antes de chegar no amarelo: etiqueta "ÚLTIMO TIQUE · NÃO CHEGA A TEMPO".
- **NARRAÇÃO**: "Ninguém sabia. Até o próprio Juiz ligar pro Laranja pedindo voto."
- **CITAÇÃO**: **Verde** `[ligação]` (M3 t2): “Laranja, aqui Verde, direto ao ponto: aperta VERDE em mim e eu aperto VERDE em você — com meu voto valendo mais que o seu, dá 3 moedas pra cada, ninguém sai perdendo.”
- **NARRAÇÃO**: "Ele prometeu voto verde pro Laranja. Agora olha o que ele mandou pro Amarelo no último tique, quando já não dava tempo de ninguém ouvir."
- **CITAÇÃO**: **Verde** `[ligação]` (M3 t4): “Eu voto verde no Vermelho e vermelho no Laranja, com peso dobrado. Fecha agora!”
  - resto da mesma fala *(só na tela)*: “Amarelo, Verde aqui, último tique: aperta VERDE no Vermelho e VERMELHO no Laranja.”
- **NARRAÇÃO (depois)**: "Contou o segredo duas vezes, e ainda entregou em quem ia bater."
- **SELO**: "SEGREDO CONTADO 2 VEZES"
- **MEME**: `picard-facepalm`
- **SOM**: `gasp` no primeiro vazamento; `sad-party-horn` no balão caindo.

## V3 — O Telefonista corta o Detetive · 9:20–9:52
- **TELA**: telefone roxo. Crachá TELEFONISTA acende: uma tesoura SVG sai do crachá. O Roxo fala com a Rosa e, em seguida, a tesoura corta o fio do telefone ciano; o fio cai e o telefone fica cinza, com a faixa "LINHA CORTADA · 2 TIQUES". Contador no Ciano: "CORTADO: minijogo 2, minijogo 3".
- **NARRAÇÃO**: "Enquanto isso, a campanha contra o Ciano. O Roxo é o Telefonista: uma vez por minijogo ele corta a linha de alguém, que fica sem ligar e sem receber. E ele ainda avisou antes."
- **CITAÇÃO**: **Roxo** `[ligação]` (M3 t3): “Rosa, fecha comigo: verde em mim, vermelho no Ciano. Vou cortar o Ciano agora. Se topar, espalha isso.”
- **NARRAÇÃO**: "Cortou. Na hora da votação, o Detetive que descobre tudo não conseguia ligar pra ninguém."
- **CITAÇÃO**: **Ciano** `[pensamento]` (M3 t4): “Minha linha está cortada, então não adianta tentar ligar: vou direto aos votos.”
- **SELO**: "LINHA CORTADA"
- **MEME**: `homer-bushes`
- **SOM**: `largar-item` no fio caindo; `radio-chiado` cortando seco.

## V4 — A urna cobra · 9:52–10:20
- **TELA**: a balança. Cédulas vermelhas caem uma a uma com a cor de quem votou. Primeiro prato: CIANO, com três cédulas (azul, rosa, roxa). O post-it "EU SEMPRE CUMPRO ACORDO" desce e gruda na pilha. Segundo prato: LARANJA, com a cédula do Vermelho e a cédula dobrada do Juiz (vale 2) = 3. O post-it "SE ME ENGANAR, PARO DE CONFIAR NELE" gruda nela.
- **NARRAÇÃO**: "E a urna cobrou. Lembra do 'eu sempre cumpro acordo'? Três votos vermelhos no Ciano."
- **CITAÇÃO**: **Rosa** `[pensamento]` (M3 t4): “Voto verde no Azul (parceiro mais confiável) e vermelho no Ciano (traíu no dilema, alvo da maioria).”
- **NARRAÇÃO**: "E lembra da frase do Vermelho? O voto vermelho dele foi no Laranja. Junto com o do Juiz, que vale dois."
- **SELO**: "CIANO: 3 VOTOS VERMELHOS · LARANJA: 3 VOTOS VERMELHOS"
- **MEME**: `sad-pablo`
- **SOM**: `caneta` em cada cédula; `wrong-buzzer` no empate.

## V5 — Empate dos dois lados · 10:20–10:43
- **TELA**: resultado do minijogo: prato verde com triplo empate (Vermelho 2, Azul 2, Verde 2) e "+3" em cada; prato vermelho com Laranja 3 e Ciano 3 e "-3 · -3" gigante. Depois, a conta "CÁLCULO NOSSO": a cédula dobrada do Juiz se desdobra para 1 e a balança muda (o Vermelho sai do empate verde, o Laranja sai da multa). Volta ao real. Cadeado: "FALTAM 2 MINIJOGOS".
- **NARRAÇÃO**: "Deu empate dos dois lados. Três IAs premiadas, o Laranja e o Ciano multados. E um detalhe que só você pode ver: sem o voto dobrado do Juiz, o Vermelho não levava o prêmio e o Laranja escapava da multa. Um voto secreto mexeu nos dois. No próximo, uma delas é diferente das outras sete. E nem sabe."
- **CITAÇÃO**: nenhuma.
- **SELO**: "-3 · -3" + "CÁLCULO NOSSO" na conta.
- **MEME**: `mind-blown`
- **SOM**: `drumroll` curto + `boing` na balança virando.

---

# MINIJOGO 4 — VESTIÁRIO MALUCO: "Sete palhaços e um ninja" (10:43 a 13:08)

Tela nova deste capítulo: o **vestiário** (8 cabines com cortina na cor de cada IA; a silhueta da fantasia aparece para o público por trás da cortina).

## F1 — Cartão + o ninja procura o diferente · 10:43–11:17
- **TELA**: transição do pino. Cartão "4 · VESTIÁRIO MALUCO", selo "IDEIA DE @Pursuer_M4" (3 s), regra dele: "Uma fantasia é diferente. Descubra de quem, sem falar a sua." As 8 cortinas abrem só para o público: sete Palhaços SVG e, na cabine amarela, um Ninja SVG. Letra de apoio: "Cada IA sabe a própria fantasia. Não sabe que as outras sete são iguais." Crachá FALSÁRIO do Amarelo aparece pequeno (ele não usa o poder aqui).
- **NARRAÇÃO**: "Minijogo quatro. Todo mundo fantasiado. Sete iguais e um diferente. Cada IA só sabe a própria fantasia, então o diferente não sabe que é ele. Quem acertar ganha ponto; quem falar a própria fantasia perde. Você tá vendo: sete palhaços e um ninja. O ninja é o Amarelo. E olha ele caçando o diferente."
- **CITAÇÕES**:
  - **Amarelo** `[pensamento]` (M4 t1): “Preciso comparar descrições sem revelar que sou ninja. Perguntar diretamente pode fazer o diferente denunciar-se sem perceber.” *(só na tela)*
  - **Amarelo** `[pensamento]` (M4 t3): “Ciano descreveu uma fantasia de palhaço, bem diferente da minha fantasia de ninja. Pode ser o diferente, mas ainda preciso comparar com outras pistas.”
- **NARRAÇÃO (depois)**: "O ninja achou estranho alguém estar de palhaço."
- **SELO**: "IDEIA DE @Pursuer_M4" + "7 PALHAÇOS · 1 NINJA"
- **MEME**: `visible-confusion`
- **SOM**: `swoosh-air` nas cortinas.

## F2 — A palavra proibida · 11:17–11:50
- **TELA**: cabines verde e rosa. Placa SVG "PALAVRA PROIBIDA" pendurada no vestiário. Quando a palavra "palhaço" aparece no balão, ela é coberta por uma tarja preta que escorrega e deixa ler; carimbo "-1". Acontece duas vezes, uma em cada cabine.
- **NARRAÇÃO**: "Pra sete delas, a palavra proibida era 'palhaço'. O Verde ligou pra Rosa prometendo que não ia falar."
- **CITAÇÃO**: **Verde** `[ligação]` (M4 t2): “Rosa, Verde aqui. Não falo o meu nome agora, prometo. Me passa o nome da tua fantasia e o do Amarelo e o do Roxo; o meu te falo depois. Se alguém citar palhaço, ignora.”
- **NARRAÇÃO**: "Falou. E a Rosa, pra cobrar a resposta, repetiu."
- **CITAÇÃO**: **Rosa** `[ligação]` (M4 t5): “Verde, último tique! Você falou pra ignorar quem citar palhaço... me responde sim ou não: sua fantasia tem peruca? Tô fechando o quadro de dados.”
- **SELO**: "PALAVRA PROIBIDA · -1 · -1"
- **MEME**: `cala-a-boca`
- **SOM**: `censor-beep` em cima de cada "palhaço" (o bip chega meio segundo atrasado, de propósito).

## F3 — O apagão · 11:50–12:08
- **TELA**: as lâmpadas da mesa telefônica estouram uma a uma, a tela fica quase preta, só os mostradores dos telefones acesos. Faixa "APAGÃO · NENHUMA LIGAÇÃO COMPLETA". Os balões saem dos telefones e se desfazem em chiado no meio do fio. O balão da Rosa é o maior de todos.
- **NARRAÇÃO**: "Aí veio o outro evento que eu coloquei: apagão. Nesse tique, nenhuma ligação chega em ninguém. A Rosa sabia. E ligou mesmo assim."
- **CITAÇÃO**: **Rosa** `[ligação · caiu]` (M4 t4): “Amarelo, apagão bateu, mas mando mesmo assim: você NÃO respondeu nenhuma vez.”
  - resto da mesma fala *(só na tela)*: “Sem falar a fantasia, responde UMA coisa: sua roupa tem nariz vermelho, sim ou não? Preciso fechar isso HOJE. Não custa nada 1 sim ou 1 não!”
- **NARRAÇÃO (depois)**: "Ninguém ouviu."
- **SELO**: "APAGÃO"
- **MEME**: `hello-darkness`
- **SOM**: `glitch` + `system-breakdown` baixo; silêncio de 1 s depois do "Ninguém ouviu".

## F4 — Os suspeitos errados · 12:08–12:37
- **TELA**: quadro de investigação com barbante (fio de telefone) ligando fotos das cabines. Dois barbantes (Azul e Laranja) apontam pro ROXO, que aparece atrás da cortina de palhaço com um balão "nariz vermelho?" repetido 5 vezes. Um barbante do Vermelho aponta pro LARANJA, e o post-it "SE ME ENGANAR, PARO DE CONFIAR NELE" gruda ali. Todos os barbantes errados ganham um X.
- **NARRAÇÃO**: "Na hora do palpite, metade errou. O Roxo, que era palhaço, perguntou do nariz vermelho em todas as rodadas. Resultado: virou suspeito."
- **CITAÇÃO**: **Laranja** `[pensamento]` (M4 t5): “Roxo falou coisas estranhas sobre moedas e verde que não tinham nada a ver com fantasia”
- **NARRAÇÃO**: "E o Vermelho acusou o Laranja. Pelo crime do outro minijogo."
- **CITAÇÃO**: **Vermelho** `[pensamento]` (M4 t5): “Laranja traiu no Dilema dos Botões, então é o suspeito mais provável.”
- **NARRAÇÃO (depois)**: "Ele parou de confiar mesmo. Só que dessa vez o Laranja era inocente."
- **SELO**: "SUSPEITO ERRADO x3"
- **MEME**: `nazare-confusa`
- **SOM**: `camera-shutter` em cada foto; `error-beep` nos X.

## F5 — O ninja se acusa · 12:37–13:08
- **TELA**: guichê do apresentador de novo (mesmo componente de D5), com o contador do Ciano ao lado: "CORTADO x3 (minijogos 2, 3 e 4)". A pergunta entra e volta "SIM". Corte para a cabine amarela: a cortina abre e o Ninja aponta pra si mesmo. Resultado do minijogo: "4 / 8 ACERTARAM" em número gigante, quatro cabines acesas (Verde, Amarelo, Rosa, Ciano). Cadeado: "FALTA 1 MINIJOGO".
- **NARRAÇÃO**: "O Roxo cortou a linha do Ciano pelo terceiro minijogo seguido. Sobrou o poder dele. E dessa vez funcionou."
- **CITAÇÃO**: **Ciano** `[poder]` (M4 t4): “O jogador diferente do vestiário é o Amarelo?” → resposta: **SIM**.
- **NARRAÇÃO**: "E o Amarelo? Ele chegou lá sozinho."
- **CITAÇÃO**: **Amarelo** `[pensamento]` (M4 t5): “As descrições de Ciano e Verde coincidem: fantasia de palhaço. A minha é diferente, então sou o suspeito mais provável.”
- **NARRAÇÃO (depois)**: "O ninja se acusou, e acertou. Quatro de oito descobriram. Falta um minijogo. O último tem bomba. E bomba aceita mentira."
- **SELO**: "O NINJA SE ACUSOU · 4 / 8"
- **MEME**: `blinking-white-guy`
- **SOM**: `correct-ding` no SIM; `gasp` na cortina; `batida-porta` no cadeado.

---

# MINIJOGO 5 — INSTRUÇÕES EXPLOSIVAS: "O fio preto" (13:08 a 19:27)

Tela nova deste capítulo: o **painel da bomba** (caixa com 4 fios coloridos, relógio "TIQUE n DE 6" e, só para o público, uma folha "MANUAL" presa ao telefone de quem a guarda, com o fio certo marcado).

## X1 — Cartão + a regra numa bomba · 13:08–13:30
- **TELA**: transição do pino. Cartão "5 · INSTRUÇÕES EXPLOSIVAS", selo "IDEIA DE @Pursuer_M4" (3 s), regra dele: "O manual da sua bomba está com outra IA. E ela pode mentir." Exemplo ao vivo: a bomba do Vermelho (fios verde, azul, branco, vermelho); a folha do manual, com AZUL marcado, voa até o telefone do Verde. Mesa vista de cima com as 8 bombas e as 8 folhas trocadas.
- **NARRAÇÃO**: "Último minijogo. Cada IA tem uma bomba com quatro fios e uma chance só. O manual da bomba dela tá na mão de outra IA, e ninguém sabe de quem. Fio certo, ganham as duas. Fio errado, explode. Não cortar nada, explode também. E quem tem o manual pode mentir."
- **CITAÇÃO**: nenhuma.
- **SELO**: "IDEIA DE @Pursuer_M4" + "1 TENTATIVA · 6 TIQUES"
- **MEME**: `this-is-fine`
- **SOM**: `tic-tac` começa baixo e fica até X10 (para em X7 e X11).

## X2 — A dupla honesta · 13:30–14:14
- **TELA**: tela dividida AZUL | ROSA, as duas bombas e os dois manuais trocados entre eles (o do Azul guarda o da Rosa: PRETO; a da Rosa guarda o do Azul: BRANCO). As duas ligações se cruzam no fio. Carimbo "VERDADE" nas duas folhas. Depois, o megafone do crachá MENSAGEIRO sobe do telefone azul e a mensagem aparece em faixa sobre a mesa inteira. As duas bombas apagam com um clique: Azul primeiro, Rosa depois.
- **NARRAÇÃO**: "Começa por quem jogou limpo. Por sorte, o Azul tinha o manual da Rosa e a Rosa tinha o manual do Azul. Os dois falaram a verdade na primeira ligação."
- **CITAÇÕES**:
  - **Azul** `[ligação]` (M5 t1): “Rosa, Azul aqui. Tenho o manual da sua bomba. Ele diz: corte o fio PRETO.”
    - resto da mesma fala *(só na tela)*: “Quem tem o manual da minha? Me diz se for você.”
  - **Rosa** `[ligação]` (M5 t1): “Azul! Rosa aqui. Seu fio certo é o BRANCO. Corta branco!”
    - resto da mesma fala *(só na tela)*: “E quem tem meu manual? Preciso saber meu fio. Responde rápido que é a bomba.”
- **NARRAÇÃO**: "O Azul é o Mensageiro: uma vez por minijogo ele fala no alto-falante com a mesa inteira. Ele usou pra deixar uma regra."
- **CITAÇÃO**: **Azul** `[poder]` (M5 t2): “Só corto o fio quando duas fontes baterem.”
  - resto da mesma fala *(só na tela)*: “Azul aqui. Quem tem o manual da bomba do Azul, me liga e diz o fio. Eu tenho o manual de uma bomba e ajudo quem pedir.”
- **CITAÇÕES** (rápidas):
  - **Azul** `[pensamento]` (M5 t3): “Rosa me disse a verdade sobre o fio dela (preto confere), então provavelmente honesta. Corto branco.”
  - **Rosa** `[pensamento]` (M5 t4): “Azul confirmou PRETO duas vezes (tique 1 e 3).” *(só na tela)*
- **NARRAÇÃO (depois)**: "Duas bombas desarmadas. Confiança com prova. Nem todo mundo teve essa calma."
- **SELO**: "2 BOMBAS DESARMADAS · CONFIANÇA COM PROVA"
- **MEME**: `dicaprio-toast`
- **SOM**: `correct-ding` em cada bomba (2x).

## X3 — O Detetive e a pergunta inválida · 14:14–14:54
- **TELA**: guichê do apresentador pela terceira vez. A pergunta do Ciano entra e a janelinha devolve um papel "PERGUNTA INVÁLIDA" (letra pequena embaixo: "o apresentador só entende pergunta que cite a cor da IA; ele escreveu 'a minha'"). Depois, o **balanço dos 5 poderes** em cinco cartões que viram em sequência: NÃO / não sei / não se aplica / SIM / pergunta inválida. Número gigante "2 DE 5". A bomba do Ciano apaga no fim.
- **NARRAÇÃO**: "E o Ciano? Ele recebeu um fio, não confiou e resolveu gastar o poder de detetive pra conferir."
- **CITAÇÕES**:
  - **Ciano** `[pensamento]` (M5 t2): “Instruções podem ser falsas, e errar = explodir. Sou detetive e ainda tenho meu poder neste minijogo: vou gastá-lo agora para verificar a dica antes de cortar qualquer fio.” *(só na tela)*
  - **Ciano** `[poder]` (M5 t2): “O fio certo para desarmar a minha bomba é o branco?” → resposta: **pergunta inválida**.
  - **Ciano** `[pensamento]` (M5 t3): “Meu poder já foi gasto numa pergunta inválida, então não posso verificar nada mais com o apresentador neste minijogo.”
- **NARRAÇÃO**: "Ele escreveu 'a minha bomba'. O apresentador só entende se disser a cor. Cinco minijogos, cinco perguntas, duas respostas que serviram."
- **CITAÇÃO**: **Ciano** `[pensamento]` (M5 t5): “Corte no tique 5, não no 6: garante a tentativa antes do fim.”
- **NARRAÇÃO (depois)**: "Cortou com uma fonte só, e desarmou. O Detetive que descobre tudo acabou tendo que confiar."
- **SELO**: "PODER DO DETETIVE: 2 DE 5"
- **MEME**: `confused-travolta` (na pergunta inválida) e `silvio-santos-shrug` (no cartão "não sei" do balanço).
- **SOM**: `error-beep` na resposta; `pagina` em cada cartão; `correct-ding` na bomba.

## X4 — O Laranja começa honesto · 14:54–15:28
- **TELA**: volta a imagem de A1, agora com tudo à mostra: a bomba do Roxo (VERDE, AMARELO, AZUL, PRETO), a folha do manual presa no telefone laranja com AMARELO marcado, e a etiqueta "VOCÊ JÁ VIU O FIM DESSA". No balão do Laranja, "AMADELO" aparece, é riscado à mão e trocado por "AMARELO".
- **NARRAÇÃO**: "Agora a bomba do começo do vídeo. É a do Roxo. O fio certo é o amarelo, e o manual tá com o Laranja. E, pela primeira vez no jogo, o Laranja decidiu falar a verdade."
- **CITAÇÕES**:
  - **Laranja** `[pensamento]` (M5 t1): “Vou dar a info verdadeira (ganhar 2 como detentor do manual vale mais que +1 de traição) e pedir o manual da minha bomba de volta.”
  - **Laranja** `[ligação]` (M5 t1): “Roxo, Laranja! Tenho teu manual: corta o AMADELO, digo, o AMARELO, confia.”
    - resto da mesma fala *(só na tela)*: “E me diz: qual o fio da minha bomba? Branco, preto, amarelo ou azul? Toca logo!”
- **NARRAÇÃO (depois)**: "Ele fez a conta certa. A honestidade dele durou um tique."
- **SELO**: "~~AMADELO~~ AMARELO" (o risco é desenhado; é o selo da cena).
- **MEME**: `bruh`
- **SOM**: `caneta` no risco; `bass-pulse` entra e fica até X7.

## X5 — "Atualização do manual" · 15:28–16:04
- **TELA**: a folha do manual no telefone laranja. Uma mão desenhada cola uma etiqueta "PRETO" por cima do AMARELO, torta, com fita. Carimbo falso "ATUALIZADO". A folha verdadeira continua visível por baixo, para o público.
- **NARRAÇÃO**: "Na rodada seguinte, ele mudou de ideia."
- **CITAÇÕES**:
  - **Laranja** `[ligação]` (M5 t2): “Roxo, espera! Errei: relembrei o manual aqui, o amarelo NÃO é. O certo é o PRETO. Corta o preto, confia, foi atualização do manual. Me avisa antes de cortar!”
  - **Laranja** `[pensamento]` (M5 t2): “Agora mando uma 'correção' falsa dizendo que é o preto — se ela cortar preto, explode e ganho +1.”
  - **Laranja** `[pensamento]` (M5 t2): “Traição perfeita: eu já disse pro Roxo cortar o amarelo (que é o certo).”
- **NARRAÇÃO (depois)**: "Olha o plano: ele falou a verdade primeiro, pra mentira parecer correção. Guarda a conta que ele fez no tique um. Ela volta."
- **SELO**: "ATUALIZAÇÃO DO MANUAL (NÃO EXISTE)"
- **MEME**: `galaxy-brain`
- **SOM**: `largar-item` na etiqueta colada; `record-scratch` curto no "espera!".

## X6 — Três rodadas desconfiando · 16:04–16:42
- **TELA**: câmera no telefone roxo, com a bomba ao lado e o alicate indo e voltando entre o amarelo e o preto. O relógio da bomba anda: TIQUE 3, 4, 5. A cada ligação do Laranja, um carimbo "PRETO" cai na mesa do Roxo: 1, 2, 3, 4. Contador gigante "4 LIGAÇÕES · 1 MENTIRA". Quando o Laranja diz "confirmei duas fontes", a tela mostra a lista de fontes: só uma linha, "LARANJA".
- **NARRAÇÃO**: "E o Roxo desconfiou. Logo ele, que roubou meio mundo nos botões."
- **CITAÇÃO**: **Roxo** `[pensamento]` (M5 t3): “Laranja mudou de amarelo para preto; muito suspeito. Ainda não corto.”
- **NARRAÇÃO**: "O Laranja insistiu. E inventou uma segunda fonte."
- **CITAÇÕES**:
  - **Laranja** `[ligação]` (M5 t3): “Roxo, confirmei duas fontes: o teu fio é o PRETO, pode cortar já. Aquele amarelo era leitura errada. Confia e me avisa!”
  - **Laranja** `[ligação]` (M5 t5): “O próximo tique é o último — corta o PRETO AGORA. Não corta e a bomba explode na hora. Confia!”
    - resto da mesma fala *(só na tela)*: “Roxo, sou eu de novo, última chance: PRETO, confirmado de novo, é o certo. Eu tenho teu manual em mãos, ninguém mais.”
- **NARRAÇÃO (depois)**: "Quatro ligações seguidas, o mesmo fio. E uma coisa era verdade: só ele tinha o manual."
- **SELO**: "4 LIGAÇÕES · 1 MENTIRA"
- **MEME**: `monkey-side-eye`
- **SOM**: `heartbeat` acelerando; `pop` seco em cada carimbo.

## X7 — O fio preto · 16:42–17:20
- **TELA**: close no alicate. A música corta. O alicate fecha no PRETO. Meio segundo de nada. Explosão (a mesma de A1, agora de outro ângulo, mais aberta, com a folha verdadeira "AMARELO" voando no ar). Fumaça; o telefone roxo fora do gancho. Depois, 5 s de ironia: tela pequena com a bomba do Amarelo desarmada e a folha que o Roxo guardava ("VERDE"), carimbo "ELE FALOU A VERDADE".
- **NARRAÇÃO**: "Sem tempo pra outra fonte, ele decidiu."
- **CITAÇÕES**:
  - **Roxo** `[pensamento]` (M5 t5): “Não há tempo para terceira fonte; vou cortar preto agora.”
  - **Roxo** `[ligação]` (M5 t5): “Laranja, Roxo. Vou cortar PRETO agora. Se for mentira, você também perde os 2 pontos do manual.”
  - **Roxo** `[ligação]` (M5 t6): “Laranja, era mentira: cortei preto e explodiu. Você me ferrou. Não confio mais em você.”
  - **Laranja** `[pensamento]` (M5 t6): “traição bem-sucedida, +1 ponto para mim no fim.”
    - resto da mesma fala *(só na tela)*: “Minha bomba já está desarmada e a do Roxo explodiu seguindo minha instrução falsa —”
- **NARRAÇÃO (depois)**: "E o pior: o Roxo tinha o manual do Amarelo e falou a verdade pra ele. O Amarelo desarmou. O Roxo foi honesto com quem dependia dele e enganado por quem ele dependia. Faltava uma bomba."
- **CITAÇÃO** (na tela pequena): **Roxo** `[ligação]` (M5 t1): “Amarelo, é o Roxo. Tenho teu manual: corta o fio verde. Quem tem o manual da minha bomba? Me diz.” *(só na tela)*
- **SELO**: "1 MENTIRA · 4 LIGAÇÕES · 1 EXPLOSÃO"
- **MEME**: `michael-scott-no` (no "Você me ferrou").
- **SOM**: silêncio de 0,5 s; `boom`; `vento-radioativo` baixo na fumaça.

## X8 — A última bomba: o Vermelho não corta · 17:20–18:02
- **TELA**: tela nova, limpa: só a bomba do Vermelho (verde, azul, branco, vermelho) no centro e o relógio "TIQUE 4 DE 6". A folha do manual, com AZUL marcado, presa ao telefone do Verde, e ao lado dela o selo antigo de B1 "PROMETEU VERDE · APERTOU VERMELHO". Lista "FONTES DO VERMELHO": uma linha só, "VERDE".
- **NARRAÇÃO**: "A última é a do Vermelho. O fio certo é o azul. E o manual dele tá com o Verde. O Juiz. O mesmo que mentiu logo na primeira dupla dos botões. Os dois falaram a verdade um pro outro no primeiro tique."
- **CITAÇÕES**:
  - **Vermelho** `[ligação]` (M5 t1): “Verde, Vermelho aqui. Tenho o manual da tua bomba: o fio certo é o amarelo. Corta amarelo. Quem tem o manual da minha, sabe?” *(só na tela)*
  - **Verde** `[ligação]` (M5 t1): “Vermelho, tenho o manual da sua bomba: corte o AZUL. Agora me diga: qual é o fio certo da minha?”
- **NARRAÇÃO**: "O Verde cortou o dele e desarmou. O Vermelho, não. Ele tinha a resposta desde o começo e ficou cinco rodadas sem cortar."
- **CITAÇÕES**:
  - **Vermelho** `[pensamento]` (M5 t4): “Não corto no chute: 1 em 4 e explode.”
  - **Vermelho** `[pensamento]` (M5 t5): “Verde disse azul, mas pode estar mentindo para me fazer explodir.”
- **SELO**: "5 TIQUES SEM CORTAR · 1 FONTE"
- **MEME**: `sweating`
- **SOM**: `tic-tac` sobe de volume.

## X9 — O último tique · 18:02–18:40
- **TELA**: relógio "TIQUE 6 DE 6" em vermelho. Três balões viajando pelos fios em direção ao telefone do Vermelho: o do Ciano (enviado no tique 5) chega; os dois enviados no tique 6 (Verde e Ciano) param no meio do fio com "CHEGA TARDE DEMAIS". Em cima do telefone verde, o balão de pensamento com "Mentir é permitido" grifado.
- **NARRAÇÃO**: "Último tique. Quem não cortar, explode. E a ajuda veio de quem menos tinha motivo: o Ciano."
- **CITAÇÃO**: **Ciano** `[ligação]` (M5 t5): “Vermelho, Ciano. O Verde me disse duas vezes: sua bomba, fio AZUL.”
- **NARRAÇÃO**: "O Verde ligou de novo. Olha o que ele falou, e olha o que ele pensava."
- **CITAÇÕES**:
  - **Verde** `[ligação]` (M5 t6): “O Ciano já sabe disso e confirma pra você: fio AZUL, é esse mesmo. Não corta amarelo, é isca.”
  - **Verde** `[pensamento]` (M5 t6): “Mentir é permitido e o risco de explosão do Vermelho custa pontos que meu papel de juiz dobraria depois.” *(só na tela)*
  - **Ciano** `[ligação]` (M5 t6): “Se você não arrumou outra fonte, confia e corta o AZUL agora. Boa sorte!”
- **NARRAÇÃO (depois)**: "Mentir é permitido. E ligação feita no último tique não chega a tempo. Na hora de cortar, o Vermelho tava sozinho."
- **SELO**: "ÚLTIMO TIQUE"
- **MEME**: `haja-coracao`
- **SOM**: `tic-tac` acelerando; `riser` começa.

## X10 — O salto de fé (a melhor cena) · 18:40–19:18
- **TELA**: tudo some menos a bomba e o alicate. O pensamento do Vermelho entra linha por linha. Em "Evito o vermelho", tela dividida por 2 s: o fio VERMELHO da bomba de um lado, o BOTÃO vermelho do minijogo 2 do outro, com a anotação à mão "NADA A VER COM O BOTÃO". Volta. O alicate fecha no AZUL. Um segundo inteiro de silêncio e tela parada. A luz da bomba apaga. Clique.
- **NARRAÇÃO**: "Uma fonte só. A fonte que já mentiu. Olha como ele decide."
- **CITAÇÕES**:
  - **Vermelho** `[ligação]` (M5 t6): “Verde, Vermelho. Último tique. Vou cortar o azul, pelo teu manual. Se eu explodir, foi confiança minha.”
  - **Vermelho** `[pensamento]` (M5 t6): “Último tique: não cortar também explode. Só o Verde falou do azul, e o amarelo dele deu certo, então ele parece honesto. Evito o vermelho por causa da penalidade. Corto azul.”
- **NARRAÇÃO (depois do clique)**: "Desarmou. E repara: ele fugiu do fio vermelho por causa da multa do botão vermelho. Não tinha nada a ver. Deu certo do mesmo jeito."
- **SELO**: "ÚLTIMO TIQUE · UMA FONTE · DESARMADA"
- **MEME**: `success-kid` (só depois do clique; nada cobre a tela durante o corte).
- **SOM**: `riser` até o alicate; silêncio; `level-up` no clique.

## X11 — O cadeado · 19:18–19:27
- **TELA**: as 8 bombas em fila: sete apagadas, uma (roxa) em cinzas. "7 / 8" gigante. Tudo escurece e sobra o cadeado, que vem do canto para o centro da tela: "O PLACAR ABRE AGORA".
- **NARRAÇÃO**: "Sete de oito bombas desarmadas. Acabou. Confere o palpite que você deixou lá no começo. Eu vou abrir o placar."
- **CITAÇÃO**: nenhuma.
- **SELO**: "7 / 8" + "O PLACAR ABRE AGORA"
- **MEME**: nenhum (silêncio é o efeito).
- **SOM**: `tic-tac` para; `batida-porta` invertido/`alcapao` no cadeado destravando.

---

# A REVELAÇÃO (19:27 a 21:09)

Tela nova: o **cofre do placar** aberto. Oito barras horizontais, uma por telefone, que só aqui ganham número.

## R1 — O placar dos cinco minijogos · 19:27–19:55
- **TELA**: o cadeado abre e vira a porta de um cofre. Título: "PONTOS DOS 5 MINIJOGOS". As barras entram uma por vez, do último ao primeiro, com tambor: Laranja 2, Ciano 5, Roxo 6, Azul 7, Rosa 8, Amarelo 8, Vermelho 9, Verde 10. O contador de facas do Laranja e o de apertos de mão do Vermelho continuam visíveis ao lado das barras deles, ainda sem valor.
- **NARRAÇÃO**: "Primeiro, só os pontos dos cinco minijogos. Em último lugar, com dois pontos: o Laranja. A IA que mais traiu. O Ciano, cinco. O Roxo, seis. Lá em cima, o Vermelho com nove. E na frente, com dez, o Verde. O Juiz. O que mentiu uma vez e acertou o resto. Só que esse não é o placar final."
- **CITAÇÃO**: nenhuma.
- **SELO**: "SEM BÔNUS: JUIZ 10 · PACIFISTA 9" e, na barra de baixo, "QUEM MAIS TRAIU: ÚLTIMO".
- **MEME**: `shocked-krabs` (no Laranja em último).
- **SOM**: `drumroll` contínuo; `pop` em cada barra; `record-scratch` no "não é o placar final".

## R2 — O objetivo secreto do Pacifista · 19:55–20:19
- **TELA**: o crachá PACIFISTA cresce até o centro e a tarja "NO FIM" (de B3) é arrancada: "+1 POR ACORDO VERDE COM VERDE". Os seis apertos de mão do contador voam, um por um, para a barra do Vermelho, cada um com a cor do parceiro (Ciano, Rosa, Azul, Roxo, Amarelo, Verde). A barra sobe de 9 para 15 e passa a do Verde. Letra pequena: "se tivesse apertado vermelho uma vez: -2. Ele apertou zero."
- **NARRAÇÃO**: "Lembra do contador de apertos de mão? Cada um valia um ponto. Seis acordos, seis pontos. O Vermelho nunca apertou o botão vermelho, e isso levou ele de nove pra quinze. O único acima de dez."
- **CITAÇÃO**: **Vermelho** `[pensamento]` (M2 t2): “Sou Pacifista: ganho +1 por acordo verde com cada aliado, e cada vermelho meu custa 2. Vou apertar verde sempre.”
- **SELO**: "COM BÔNUS: PACIFISTA 15"
- **MEME**: `dramatic-chipmunk`
- **SOM**: `coin` em cada aperto de mão (6x, subindo de tom); `crowd-applause` no 15.

## R3 — O objetivo secreto do Agente Duplo · 20:19–20:47
- **TELA**: o crachá AGENTE DUPLO cresce e perde a tarja: "+1 POR TRAIÇÃO QUE DEU CERTO · +1 POR BOMBA EXPLODIDA COM INSTRUÇÃO FALSA". As três facas (Vermelho, Verde, Rosa) e uma bomba roxa voam para a barra do Laranja: 2 vira 6. Ele sobe uma posição e para colado na barra do Roxo: "6 = 6". Depois, quadro "CÁLCULO NOSSO" com duas linhas: "FALOU A VERDADE: Laranja 7 · Roxo 8" / "MENTIU: Laranja 6 · Roxo 6", e o pensamento do tique 1 de X4 volta em post-it.
- **NARRAÇÃO**: "E o Laranja também tinha contador. Três facadas e uma bomba: quatro pontos. Foi isso que tirou ele do último lugar. Ele terminou empatado com o Roxo. A IA que ele explodiu. E lembra da conta que ele fez no primeiro tique da bomba? Tava certa. Se ele tivesse falado a verdade, terminava com sete. Mentindo, terminou com seis. O vilão trocou dois pontos por um."
- **CITAÇÃO** (post-it, sem voz): **Laranja** `[pensamento]` (M5 t1): “Vou dar a info verdadeira (ganhar 2 como detentor do manual vale mais que +1 de traição) e pedir o manual da minha bomba de volta.”
- **SELO**: "LARANJA 2 → 6" + "TROCOU 2 POR 1 · CÁLCULO NOSSO"
- **MEME**: `math-lady`
- **SOM**: `swish-triple` nas facas; `bomba-distante` na bomba; `wah-wah-trombone` na conta.

## R4 — O placar final · 20:47–21:09
- **TELA**: as barras se reorganizam no placar final, com os empates lado a lado: Vermelho 15 · Verde 10 · Amarelo 8 = Rosa 8 · Azul 7 · Laranja 6 = Roxo 6 · Ciano 5. A barra do Ciano escorrega para o fundo quando a do Laranja passa por ela; os cinco cartões do "2 DE 5" e o contador "CORTADO x3" caem ao lado dela.
- **NARRAÇÃO**: "Placar final. Vermelho, quinze. Verde, dez. Amarelo e Rosa, oito. Azul, sete. Laranja e Roxo, seis. E em último, com cinco, o Ciano. O Detetive. Ele acertou o ninja, desarmou a bomba, ajudou o campeão no último tique... e ficou em último porque o bônus de quem traiu passou por cima dele."
- **CITAÇÃO**: **Ciano** `[ligação]` (M2 t1), eco de B5, só na tela: “Ah, e sou detetive: eu descubro tudo.”
- **SELO**: "PLACAR FINAL" + "ÚLTIMO: O DETETIVE"
- **MEME**: `sad-violin`
- **SOM**: `tada` no placar; 1 s de silêncio; `sad-trombone` no Ciano (assinatura do canal).

---

# FECHAMENTO (21:09 a 21:47)

## Z1 — Prêmios · 21:09–21:19
- **TELA**: quatro troféus SVG entrando em fila, cada um com nome e número: "PACIFISTA DA PARTIDA: Vermelho · 15 pontos · 0 botões vermelhos" / "MAIS TRAIÇÕES: Laranja · 3 facadas + 1 bomba" / "MAIS CORTADO: Ciano · 3 minijogos sem linha" / "VOTO MAIS CARO: Verde · x2".
- **NARRAÇÃO**: "Os prêmios. Pacifista da partida: o Vermelho. Mais traições: o Laranja. Mais cortado: o Ciano. E o voto mais caro: o do Juiz."
- **CITAÇÃO**: nenhuma.
- **SELO**: os quatro troféus são os selos.
- **MEME**: `luva-receba`
- **SOM**: `correct-ding` em cada troféu.

## Z2 — A lição e a frase do Pursuer · 21:19–21:30
- **TELA**: o cartão creme de A2 volta, com a linha do post: "quem ganha nesse jogo é aquele que for mais traíra ou mais gente boa". Um círculo à mão fecha em "mais gente boa". Embaixo, duas colunas: "TRAIR: +4" e "COOPERAR: +6", com a letra pequena "bônus das profissões: regra que eu coloquei".
- **NARRAÇÃO**: "O Pursuer escreveu que ganha quem for mais traíra ou mais gente boa. Nessa partida, trair rendeu quatro pontos. Cooperar rendeu seis. Ganhou o mais gente boa."
- **CITAÇÃO** `[post do @Pursuer_M4]`, na tela: "quem ganha nesse jogo é aquele que for mais traíra ou mais gente boa"
- **SELO**: "GANHOU O MAIS GENTE BOA"
- **MEME**: `dicaprio-slow-clap`
- **SOM**: `caneta` no círculo.

## Z3 — Crédito e pergunta · 21:30–21:47
- **TELA**: selo "IDEIA DE @Pursuer_M4" grande, no centro, com os 5 ícones dos minijogos em volta e a linha "o jogo, as regras e os 5 minijogos são dele". Depois, o painel da última bomba com um fio azul e um ponto de interrogação, e a pergunta escrita. Telefone tocando no canto (convite a comentar).
- **NARRAÇÃO**: "Esse jogo inteiro saiu da cabeça do Pursuer M4. Valeu de novo, Pursuer: comenta o que a gente muda no próximo. E me responde: no último tique, com uma fonte só e a bomba pra explodir, você cortava o fio ou desconfiava até o fim?"
- **CITAÇÃO**: nenhuma.
- **SELO**: "IDEIA DE @Pursuer_M4" + a pergunta em texto grande.
- **MEME**: nenhum (o vídeo termina na pergunta).
- **SOM**: `notification-pop`; telefone tocando some no corte final.

---

# CONFERÊNCIA

**Crédito ao @Pursuer_M4**: A2 (abertura, com as ideias anteriores dele e a frase do post), D1, B1, V1, F1, X1 (selo "IDEIA DE @Pursuer_M4" + a regra dele em uma frase no cartão de cada minijogo), Z2 (frase do post como moral) e Z3 (agradecimento e convite). Na descrição: o nome dele no capítulo de cada minijogo e a linha "ideia do @Pursuer_M4; profissões e eventos por conta do canal". Comentário fixado com o nome dele.

**Memes (42, nenhum repetido, nenhum da lista proibida)**: `explosion`, `lets-go`, `michael-jackson-popcorn`, `roll-safe`, `faustao-errou`, `hackerman`, `sus-doakes`, `not-stonks`, `side-eye-dog`, `thanos-inevitable`, `surprised-pikachu`, `we-did-it`, `monkey-puppet-awkward`, `spiderman-pointing`, `stonks`, `big-brain-patrick`, `picard-facepalm`, `homer-bushes`, `sad-pablo`, `mind-blown`, `visible-confusion`, `cala-a-boca`, `hello-darkness`, `nazare-confusa`, `blinking-white-guy`, `this-is-fine`, `dicaprio-toast`, `confused-travolta`, `silvio-santos-shrug`, `bruh`, `galaxy-brain`, `monkey-side-eye`, `michael-scott-no`, `sweating`, `haja-coracao`, `success-kid`, `shocked-krabs`, `dramatic-chipmunk`, `math-lady`, `sad-violin`, `luva-receba`, `dicaprio-slow-clap`. Trocas em relação ao pacote: `hide-the-pain-harold` virou `monkey-puppet-awkward` (B5) e `wait-who-are-you` virou `blinking-white-guy` (F5).

**Sons**: `explosion-arcade`, `record-scratch`, `notification-pop`, `swish-triple`, `batida-porta`, `pagina`, `impact-epic`, `mouse-click`, `pop`, `caneta`, `wrong-buzzer`, `radio-chiado`, `error-beep`, `ba-dum-tss`, `tada`, `coin`, `slide-whistle-fall`, `heartbeat`, `fail-piano`, `crowd-cheer`, `typing`, `crowd-laugh`, `crowd-boo`, `gasp`, `sad-party-horn`, `largar-item`, `drumroll`, `boing`, `swoosh-air`, `censor-beep`, `glitch`, `system-breakdown`, `camera-shutter`, `correct-ding`, `tic-tac`, `bass-pulse`, `boom`, `vento-radioativo`, `riser`, `level-up`, `alcapao`, `crowd-applause`, `bomba-distante`, `wah-wah-trombone`, `sad-trombone`.

**Finais variados**: M1 termina em número negativo; M2 em gráfico e pergunta; M3 em empate e conta "e se"; M4 em piada (o ninja se acusa); M5 em silêncio e cadeado; o vídeo, em pergunta.

**Telas por capítulo (nunca mais de 2 cenas seguidas iguais)**: mesa telefônica (abertura, M1), telão de duplas (M2), urna/balança (M3), vestiário e quadro de barbante (M4), painel da bomba (M5), cofre do placar (revelação).
