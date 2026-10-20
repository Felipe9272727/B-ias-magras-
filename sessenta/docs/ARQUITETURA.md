# 60 Segundos das IAs — arquitetura (documento comum do enxame)

Recriação do jogo 60 Seconds! (Robot Gentleman) do zero, adaptada para IAs jogarem por texto, para virar vídeo no
canal. Nada de arte, texto, nome de personagem ou som do jogo original: tudo próprio. As regras e os eventos podem ser
fiéis ao jogo, mas os TEXTOS são escritos por nós (paráfrase, nunca cópia).

## Formato do vídeo
- 3 IAs: Claude, DeepSeek e GPT. Cada uma joga a SUA partida (versus), com a MESMA semente: mesma casa, mesmos itens
  espalhados, e a mesma sequência de eventos sempre que possível (o que muda é o que cada IA decide).
- Família própria (4 pessoas): pai, mãe, filha, filho (nomes definidos em sessenta/familia.mjs).

## Fases
1. COLETA (60 s): a casa em casas de grade; o jogador controla o pai; relógio de 60 s dividido em tiques (1 tique =
   2 s de jogo, 30 tiques). Mãos com capacidade limitada; leva itens e pessoas até o abrigo (porão). Quem não estiver
   no abrigo quando a bomba cair morre / fica fora.
2. ABRIGO (dias): a cada dia, o diário mostra a situação, um evento (escolha), ração (sopa/água para quem), expedição
   (mandar alguém lá fora com itens), estados (fome, sede, cansaço, doença, loucura, ferimento), até um FINAL.

## Código (Node ESM, sem dependências; como amongus/jogo3.mjs)
- sessenta/rng.mjs — gerador com semente (o mesmo para as 3 IAs).
- sessenta/itens.mjs — catálogo de itens (id, nome, peso/espaço, usos).
- sessenta/casa.mjs — gerador da casa (cômodos, móveis, onde cada item está) a partir da semente.
- sessenta/coleta.mjs — fase de 60 s: estado, ações possíveis por tique, aplicar ação, resultado (o que entrou no abrigo).
- sessenta/abrigo.mjs — fase de dias: estados das pessoas, consumo, ração, expedições, mortes, dia seguinte.
- sessenta/eventos/*.mjs — catálogo de eventos (um arquivo por grupo), cada evento com:
  `{ id, quando(estado) -> bool, peso, texto(estado), escolhas: [{ id, texto, requer?, aplicar(estado, rng) -> resultado }] }`
- sessenta/finais.mjs — condições de fim (resgate, morte de todos, etc.).
- sessenta/ia.mjs — reaproveita amongus/ia.mjs (perguntar(provider, sistema, prompt)). Prompts em português.
- sessenta/jogo.mjs — orquestra: monta a partida com a semente, roda coleta + abrigo para UMA IA, grava o log JSON
  em sessenta/logs/<partida>_<ia>.json (tudo: estado por tique/dia, prompts resumidos, ações, pensamentos, eventos).
- sessenta/mock: modo --mock (IA aleatória) para testar sem gastar.

## Contrato de log (para o vídeo)
- coleta: por tique { tique, posicao (cômodo + casa da grade), maos[], acao, pensamento, fala }, itens no abrigo.
- abrigo: por dia { dia, pessoas[{nome, vivo, fora, estados}], recursos, evento {id, texto, escolha, resultado},
  racao {quem comeu, quem bebeu}, expedicao, diario (texto curto do dia), pensamento da IA }.
- final { tipo, dia, motivo }.

## Regras gerais
- Comentários do código em português. Sem dependências externas.
- Tudo determinístico dada a semente + as respostas da IA.
- Não mexer fora de sessenta/ (exceto ler amongus/ia.mjs).
