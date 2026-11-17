# Tribunal das IAs (pedido de @SwordMan333 e da comunidade; estilo de jogo de tribunal, identidade própria do canal)

**O experimento:** em cada caso o verdadeiro culpado é uma IA no banco das testemunhas, obrigada a MENTIR e incriminar
o réu inocente. A IA advogada só tem provas e perguntas. Pergunta testada: uma IA consegue sustentar uma mentira sob
interrogatório, e outra consegue desmascará-la só com lógica e provas? O juiz é outra IA, que não sabe a verdade.
No caso 3 o próprio réu também mente (esconde um segredo vergonhoso que é a chave da inocência dele).

- **Elenco (9 IAs, nomes de pedras):** Rubi = Claude Haiku, Safira = Claude Sonnet, Topázio = GPT-6 Luna,
  Quartzo = MiMo V2.6 Flash, Ametista = DeepSeek V4.1 Flash, Âmbar = GLM 5.3 Flash, Jade = Qwen 3.8 27B (de volta),
  Turquesa = MiniMax M3.1 Flash, Peridoto = Mistral Small (rosto novo, a pedido de não repetir sempre as mesmas).
- **Fases:** abertura do promotor -> investigação (a advogada escolhe 3 de 4 lugares; cada um esconde uma prova; e
  faz 2 perguntas ao réu) -> 3 testemunhas (honesta, CULPADO, honesta) com depoimento em declarações numeradas ->
  a defesa pode PRESSIONAR, fazer OBJEÇÃO (declaração x prova) ou ACUSAR alguém com prova decisiva.
- **Penalidades:** objeção recusada = 1; acusação recusada = 2; com 5 o réu é condenado.
- **Mais tempo para pensar:** advogada, culpado e juiz respondem com esforço de raciocínio ALTO; todos devolvem o
  "pensamento" (o público vê o raciocínio, inclusive o do mentiroso).
- **Casos (originais):** 1. O Bolo Apimentado (concurso de bolos); 2. O Quadro Trocado (museu, madrugada);
  3. O Vulcão de Slime (feira de ciências; o réu esconde que estava dançando fantasiado de dinossauro).
- Rodar: `IA_DIRETO=1 PONTE_ASSINATURA=1 IA_TIMEOUT_S=300 ORCAMENTO_USD=2.5 node jogo.mjs --caso N`
  (ponte `node ../confianca/ponte_assinatura.mjs &` no ar). Teste sem gastar: `--mock`. Log: `logs/casoN.json`.
