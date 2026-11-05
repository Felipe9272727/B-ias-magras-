# Roblox: "IA ou humano?" — integração Jev + IA rápida

## Jev (testado em 05/11/2026 com a chave do mod chaves-ias)
- Endpoint: `POST https://api.typesafe.ai/v1/systemone`, header `Authorization: Bearer <chave>`, `content-type: application/json`.
- Modelos (`GET /v1/models`): `jev-latest` (hoje = jev-1.14.0) e `jev-preview`.
- É um modelo de DECISÃO (não escreve texto): recebe `state` (texto) e `questions` tipadas e devolve escolha + probabilidade.
  - `choice`: `{"type":"choice","instructions":"...","criteria":{"opcao":"descrição", ...}}` -> `choice`, `confidence`, `probabilities`
  - `noul`: `{"type":"noul","instructions":"..."}` -> probabilidade de sim (0 a 1)
  - `score`: nota numa escala
- Latência medida: 0,15–0,22 s. Preço: só entrada (~US$ 0,04 por 1M tokens), saída grátis.
- Exemplo real: chat "oi Ana, você é uma IA? fala muito certinho" -> choice "brincar" (0,91), "acusa de ser IA?" 0,85.

## Arquitetura do jogador-IA
1. Jev decide a AÇÃO a cada ~1 s (barato e rápido): andar até X, seguir alguém, pular, falar ou ficar quieto,
   votar em quem, mentir ou negar quando acusado.
2. Só quando o Jev decide "falar", uma IA rápida escreve a frase (Claude Haiku / DeepSeek Flash / GPT Luna,
   pelo OpenRouter), com estilo de jogador: minúscula, gíria, erro de digitação, frase curta. Tempo de digitação
   simulado (o humano não responde em 0,3 s).
3. Tudo fica num log (falas, ações, decisões do Jev com probabilidades) para o vídeo, igual aos outros Among IA.

## Onde rodar (o ponto mais importante)
- RECOMENDADO: jogo próprio no Roblox Studio (a conta nova publica a experiência). As IAs são personagens com
  avatar de jogador de verdade (HumanoidDescription), nome, balão de chat e entrada no placar falso; um Script no
  servidor chama Jev + LLM via HttpService (chaves em Secrets). Gente de verdade entra (inscritos do canal) e tenta
  descobrir quem é IA. Está dentro das regras do Roblox, temos controle total e log completo para a edição.
  Texto vindo da IA tem que passar pelo filtro do Roblox (TextService:FilterStringAsync) antes de aparecer.
- NÃO RECOMENDADO: IA controlando uma conta dentro de jogo de outra pessoa. Os projetos que fazem isso
  (ex.: snipcola/Roblox-AI) rodam por executor (exploit injetado no cliente: getgenv/loadstring), que é proibido
  e detectado pelo anticheat; a alternativa (simular teclado/mouse lendo a tela) continua sendo "bot" para os
  Termos de Uso, que proíbem uso de bots. Mesmo "agindo como player", a conta corre risco de banimento.
