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

## VERSÃO 2 (17/11): "O Caso do Farol Apagado" — no formato dos jogos de tribunal (pedido do Felipe)
Os 3 casos acima viraram PILOTO (o GLM confessou na primeira pergunta; o Haiku e o Sonnet mentiram bem).
- **4 dias, como no jogo:** investigação -> julgamento -> investigação -> julgamento final. A paciência do juiz
  (6) vale o caso inteiro; objeção errada -1, acusação errada -2; cadeado com prova errada -1; abrir todos os
  cadeados de alguém devolve +1.
- **Investigação (10 ações por dia):** examinar lugar (acha prova), conversar (pergunta livre), apresentar prova ou
  PERFIL a alguém. Registro do Tribunal com provas E perfis.
- **Cadeados de segredo:** a ré (2: carta do pai + casaco com cacos), o vigia (1: livro de ponto), o pescador
  (2: jornal de 15 anos atrás + página queimada). Abriu tudo, a pessoa conta a verdade e vira prova nova.
- **Julgamento:** "Alto lá!" (pressionar), "Objeção!" (prova contra declaração), "Toma essa!" (acusar); no dia 4
  também "reabrir o passado" (provar quem trancou o faroleiro há 15 anos).
- **Trama com passado:** há 15 anos o faroleiro Anselmo foi condenado por deixar o farol apagado na noite de um
  naufrágio; hoje a filha dele é acusada de quebrar a lente do farol no museu. O verdadeiro culpado das duas coisas é
  o patrocinador do museu (Rubi). O promotor (Âmbar) é discípulo do promotor que condenou Anselmo.
- **Experimento:** o mesmo caso com 3 advogadas diferentes (Safira/Sonnet, Ametista/DeepSeek, Jade/Qwen 27B):
  qual investiga melhor, quebra os segredos, desmascara o mentiroso e reabre o caso do passado?
- Elenco fixo: Rubi (Haiku) culpado, Âmbar (GLM) promotor, Turquesa (MiniMax) juiz, Quartzo (MiMo) ré,
  Topázio (Luna) vigia, Peridoto (Mistral) pescador; advogada/assistente/delegado giram entre Safira, Ametista, Jade.
- Rodar: `node farol.mjs --advogado Azul|Roxo|Verde` (mesmas variáveis do jogo.mjs). Caso: `farol_caso.mjs`.
