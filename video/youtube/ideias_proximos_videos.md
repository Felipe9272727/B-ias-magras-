# Ideias para os próximos vídeos (levantamento de 12/11/2026)

Fontes: (1) 314 comentários novos coletados hoje com `video/scripts/comentarios_yt.sh` nos 6 vídeos mais recentes (AU7, Roblox, Zumbi, Impérios, Bomba, Lobisomem 2), somados ao acervo já salvo em `video/youtube/comentarios_*` (2.118 comentários únicos no total); (2) posts da aba Comunidade (10 posts do dono lidos no HTML da página; o `yt-dlp` na aba /community devolve só a lista de vídeos, então a leitura foi pelo `ytInitialData`); (3) `au7/pedidos_comentarios.md` e `analise_video_roblox.md` (não repetidos aqui); (4) views de hoje pelo `yt-dlp`.

Como ler as contagens: "pedidos" = autores diferentes (um fã em vários vídeos conta 1), contados por palavra-chave e conferidos na mão nos grupos principais; margem de 1 a 2 nomes. Os likes do canal são baixos, então a força de um pedido está mais em quantos nomes repetem do que em curtidas. Custos em dólar são estimativas minhas a partir do gasto registrado (zumbi: cerca de US$ 4 num dia com 20 IAs, em `MEMORIA_TECNICA.md`), não medições.

## O que os números do canal dizem

| Vídeo | Views (12/11) | Duração |
|---|---|---|
| Among Us 2 (Detetive expulso por falar a verdade) | 263.337 | 33:22 |
| Among Us 3 (Palhaço queria ser expulso) | 47.234 | 24:54 |
| Lobisomem 1 (2 assassinas, uma queria ser expulsa) | 36.866 | 22:43 |
| Among Us 1 (8 IAs) | 24.000 | 24:04 |
| Among Us 4 (impostor mentiu pro parceiro) | 24.456 | 33:45 |
| Among Us 5 Polus (IA copiou a cara) | 17.493 | 31:19 |
| Lobisomem 2 | 7.837 | 33:58 |
| Zumbi (AU6) | 7.039 | 25:48 |
| Interrogatório / Jogos Vorazes | 5.974 / 5.900 | 19:31 / 17:38 |
| Overcooked / Bomba / Minecraft / Impérios | 4.884 / 4.711 / 4.300 / 4.112 | 22 a 31 min |
| 60 Segundos / Mario | 3.037 / 1.800 | 29:18 / 14:30 |
| Roblox (11/11) | 1.433 | 10:59 |
| AU7 (publicado hoje, menos de 2 h) | 676 | 22:05 |
| Pokémon | ainda não listado no canal (post "finalmente pronto" saiu há menos de 1 h) | 23:42 (v1) |

Shorts: "impostor mais FRIO" 96 mil, "QUERIA ser expulsa" 49 mil, "impostor MEDROSO" 32 mil, "copiou a cara da outra" 13 mil, "Bobo mais teimoso" 4 mil.

Padrões que se confirmam:
- Os 2 maiores vídeos e os 2 maiores Shorts têm a mesma estrutura: uma IA com objetivo invertido (falar a verdade e ser expulsa, QUERER ser expulsa, ser fria demais). Lobisomem 1 foi o único não-Among acima de 7 mil e vendeu exatamente isso ("uma queria ser expulsa", o Bobo).
- Jogo de dedução social com mentira conferível na tela vende; habilidade pura (Mario 1,8 mil, Overcooked 4,9 mil, Minecraft 4,3 mil) não.
- Continuação cai: Lobisomem 2 teve 21% das views do 1; a série Among desce de 263 mil (AU2) para 7 a 17 mil nos últimos (cuidado: os vídeos têm idades diferentes e o `yt-dlp` não devolveu a data de envio, então parte da queda é só tempo de acúmulo). Continuação precisa de gancho novo, não de "parte N".
- Jogo novo com uma IA só (Roblox) rendeu 1,4 mil; a análise já concluiu que foi clique (miniatura e título fora do molde), e os comentários (24, quase todos elogio) pedem mais.
- O Pokémon é, pelas palavras do dono no post, "um dos vídeos que mais trabalhei"; o formato (3 IAs com papel claro, uma que entrega a vitória antes de jogar) segue o molde de personagens fixos. A decisão sobre a sequência depende dos números das primeiras 48 h.

Padrão de título: "Coloquei N IAs pra X (e surpresa)". A surpresa entre parênteses abaixo é um modelo; pela regra do canal ela tem que sair de um fato real do log, então marquei [a confirmar] onde é hipótese.

---

## TOP 10, em ordem de potencial

### 1. Among IA 8: clássico, Airship, terceira leva de funções
- **Origem:** Airship 10 pedidos (@Davizinhoeasdolls, @JoãoPedrozxe, @MonteiroRodriguesmonteiro, @Bencsps, @ebacaciones), Fungle 8 (@Yokwu_mdt, @Stuemcena, @guilhermgpd2). Funções pendentes depois do AU7 (que já entregou Policial, Carrasco, Ladrão, Possuidor, Gangster, Teletransportador): Telepata/Mentalista/Vidente (11, @NetheritaCraftBr "Mentalista" hoje, @lucasKS-MF, @JoãoMiguelMoura-q2i), Infiltrado (@maskin-j3y, que repete o pedido em cada vídeo, e @ryanphpjs), Cianofóbico (@Davinichetti, "Dia 4 pedindo"), Fênix/Morto-vivo (9, @epeoovo hoje), Advogado (6), Vírus (10), Serial Killer (@Nitsu_edits) e Ceifador (@TheTriangle0001), ambos novos hoje. Cobrança do Copista (@PintoNelsoOFC, Dia 3) e do Romântico/Cupido (@JarcielTrajano, 4 vídeos).
- **Por que pode dar certo:** Among é o carro-chefe (5 dos 6 maiores vídeos, os maiores Shorts) e é o único formato em que o público volta toda semana. O espectador sabe o segredo e vê a IA errar. Os comentários de hoje no AU7 já provam o ciclo ("VAMO, MINHA IDEIA ACONTECEU", @Lolzinpvp).
- **Formato:** 15 a 18 IAs, 4 partidas com memória, motor `amongus/jogo7.mjs` com mapa novo. Vencedor medido por partidas ganhas por time e pelo "placar de mentira" (quantas acusações erradas). Abrir com o clímax do Infiltrado ouvindo o chat dos impostores e sendo expulso mesmo assim (cena que o `pedidos_comentarios.md` já recomendou). Corrigir as reclamações abertas: impostor matar na frente de todos (10 pessoas) e mentir no chat dos impostores (5).
- **Custo e dificuldade:** médio (US$ 3 a 5 por rodada completa, usando o teto por partida do `zumbi.mjs`). Mapa Airship é o item caro: sala nova, mapa de caminhos e arte; Fungle é parecido. Sem emulador, sem API nova.
- **Título:** "Coloquei 18 IAs pra jogar Among Us no Airship (e o Infiltrado ouviu tudo e foi expulso mesmo assim) [a confirmar]".

### 2. Joguei Among Us contra as IAs (o Felipe como jogador)
- **Origem:** 17 pessoas pedem jogar com ou contra as IAs e/ou baixar o jogo (@Stuemcena, @Xchamuel.e.casaca, @REDGREENTRAIN, @MateusSilva-lq2rr, @Quirrezin, @Osenhorlaranjaburro67, @JuanLeiteAlmeida, @d3d3-hb6do, @GuilhermePerario, @qinshihuang7628, @MiguelLima-z9r, @Davi..dias_ofc, outros) e mais 3 pedem "humano no meio das IAs" (@Erauker e outros). O dono já respondeu duas vezes "Pretendo fazer sim, seria muito divertido" e "pretendo disponibilizar o jogo" (repetido em 5 respostas).
- **Por que pode dar certo:** é a promessa pública mais antiga e mais repetida que ainda não saiu. Muda o formato (o público vê um humano mentindo para IAs) em vez de ser "mais um episódio". Mantém a regra de ouro: o espectador sabe o segredo (você é impostor e a tela mostra), e a reação das IAs a uma fala humana é o conteúdo. Dá Short fácil ("a IA que me acusou só porque eu falei rápido demais").
- **Formato:** Felipe é 1 dos 12 a 15 jogadores, sorteado em segredo (a primeira partida ele é impostor para ter o clímax). Cliente web simples (a tela do Felipe aparece no vídeo como mais um personagem). Mede: "quantas reuniões até alguém suspeitar do humano" e vitória do time. Variante barata para vender depois: lançar o build jogável para os fãs (o 3º maior pedido de toda a base).
- **Custo e dificuldade:** médio de API (igual a um Among), alto de desenvolvimento: precisa de interface jogável, tradução de cliques em ações do motor e da câmera subjetiva. Sem emulador. Risco: gravar a tela do Felipe com qualidade.
- **Título:** "Entrei como impostor numa partida com 14 IAs (e elas descobriram em [N] reuniões) [a confirmar]".

### 3. Lobisomem 3: Cupido, Padre, Médium e as funções que vocês mandaram
- **Origem:** cerca de 20 pessoas deram função para o Lobisomem nos dois vídeos: Cupido (@Susgetoesparaofelipexx, @kalelmashup367, @JarcielTrajano, @Miranha-6), Padre (@IsraelLael, 13 likes, o 2º comentário mais curtido do Lobisomem 1), Médium/Amaldiçoado/Fofoqueiro (@onoob8703), Vampiro e Assombrador (@Pursuer_M4), Lobo Hipnólogo (@Leopold-cft), Vingador (@blueLock-h6s), Lobo Apostador (@deboralouvatto5279), Lobo Culpado (@GabrielSantos-qv1bd), Bêbado e Menino Travesso (@mayllonytmcpe), Corrupto (@aragonmatos5444) e a lista de @EnzoBatistaCosta-x5h ("coloca todos meus comentários"). Promessas do dono: "vou anotar todas" e "na parte 3 vou com certeza pôr" o Cupido, com a piada "ia ser muito engraçado se o cupido atirasse no bobo".
- **Por que pode dar certo:** Lobisomem 1 é o 3º vídeo mais visto do canal (36,9 mil). O Bobo (quer ser expulso) é a mesma mecânica do Palhaço que fez o AU3. Falta só destravar o problema da parte 2 (21% das views): ela não teve gancho novo e ficou longa (33:58). O Cupido que ata um par e o Bobo no meio é gancho novo e já pedido.
- **Formato:** 16 IAs, 4 lobos, motor `lobisomem/motor.mjs`. Corrigir antes o que @LosersDubs (ex-jogador de Wolvesville) apontou: o Lobo Vidente deve ver na hora, não só no fim da noite, e as IAs "não se defendem". Vencedor: partidas por time e quem "vendeu a função".
- **Custo e dificuldade:** baixo a médio (motor existe; cada função nova é lógica de texto e ícone SVG). Sem API nova.
- **Título:** "Coloquei 16 IAs pra jogar Lobisomem 3 (e o Cupido apaixonou [o Bobo / um Lobo]) [a confirmar]".

### 4. Jogo de confiança: telefone com fio e placar secreto (ideia do @Pursuer_M4)
- **Origem:** post longo do @Pursuer_M4 na Comunidade ("IDEIA DE VÍDEO", cinco minijogos): Desconhecidos, Dilema dos Botões (verde divide, vermelho rouba), Votação da Justiça, Vestiário Maluco, Instruções Explosivas. Ele é o fã com mais ideias aceitas (Palhaço/Jester entrou; Carrasco entrou no AU7; 8 comentários em 7 vídeos). Também conversa com o pedido de "jogo de confiança/traição" que aparece no Dilema do Prisioneiro do AI Diplomacy citado em `ideias/LISTA_FINAL.md`.
- **Por que pode dar certo:** regra 3 do post vira a aposta que o canal pede: ninguém, nem o público, sabe quem lidera; o placar só abre no fim (promessa "a próxima é pior" e revelação no último quarto). Reutiliza o que já funciona: Instruções Explosivas é o jogo da Bomba (4,7 mil, com pistas que "podem ser falsas"), Vestiário Maluco é Among em miniatura, Dilema dos Botões é traição pura. Cada minijogo cabe em 3 a 4 min de vídeo, evitando cena longa.
- **Formato:** 8 IAs (número par, regra do autor), cinco rodadas, 3/2/1 pontos. Mede por pontos. O personagem de arco é "a mais boazinha vs a mais traíra". IAs favoritas do `IAS_FAVORITAS.md` (Haiku, Qwen 27B, GPT Luna, MiMo, GLM, DeepSeek, Sonnet) mantêm o custo baixo.
- **Custo e dificuldade:** médio. Motor novo mas simples (texto + pontuação); o telefone com fio vira ícone SVG e uma tela de chamada. Sem emulador, sem API nova. É o trabalho mais original da lista.
- **Título:** "Coloquei 8 IAs num jogo de confiança (e a mais boazinha perdeu para [a que roubou N vezes]) [a confirmar]".

### 5. Pokémon, parte 2: a revanche das 3 IAs
- **Origem:** @Tinanossauro-q7s comentou no Roblox que o Pokémon seria no mesmo estilo (jogo original) e o dono respondeu "vai sim, inclusive ele já está sendo feito"; outros fãs falam do assunto: @Ben_e_Teo ("se você consegue o Mario, você consegue Pokémon"), @antiuttp-piupefrederico (torneio Pokémon: evoluir e lutar no torneio das IAs), @Th3Resh e @Tinanossauro-q7s. O post de enquete sobre Pokémon (tipo de IA) teve 23 likes na Comunidade, perto dos maiores posts do dono (30).
- **Por que pode dar certo:** o fim do vídeo deixa três IAs com falhas claras (uma passou 18 horas apertando A contra uma parede, outra perdeu para o próprio computador, outra terminou onde começou), o que pede revanche; as IAs já têm arco e personagem fixos; a marca "Claude plays Pokémon" já existe no público. É o oposto do Roblox: franquia que todo mundo reconhece.
- **Formato:** mesmas 3 IAs com 1 correção cada (bug visto no vídeo 1) e uma partida final. Mede por insígnias conquistadas e tempo de jogo. Outra versão: torneio de batalha entre as IAs (pedido do @antiuttp-piupefrederico).
- **Custo e dificuldade:** alto. Emulador (mGBA já instalado em `pokemon/instalar_mgba.sh`), treino de horas, e o próprio histórico mostra que as sessões filhas caem por inatividade (ver `MEMORIA_TECNICA.md`). Decidir só depois das primeiras 48 h do vídeo 1: se a retenção for boa, vai; se não, adiar.
- **Título:** "Dei uma segunda chance pras 3 IAs que não zeraram Pokémon (e uma [a confirmar])".

### 6. Banco Imobiliário (Monopoly) com negociação
- **Origem:** @pepinoVIC ("Dia 11, 12, 13 e 14 pedindo Monopoly", 4 comentários em 4 vídeos), @guilhermgpd2 (comentário no Polus e post na Comunidade, "2 por vídeo já seria ótimo"), @pepinoEdits. Também aparece em `ideias/LISTA_FINAL.md` (item 6) com o canal gringo b2studios e o Turing Games como prova de formato.
- **Por que pode dar certo:** negociação, aliança e traição, com placar visível (dinheiro, ruas) o tempo todo: aposta sempre na tela. A IA que vende a própria rua barato é gag óbvia, e tem tempo morto fácil de cortar (só os eventos grandes e um relógio "Rodada 14").
- **Formato:** 4 a 6 IAs, 2 partidas curtas (limite de 25 rodadas). Vencedor: maior patrimônio ao fim. Personagens: o negociador, o que nunca compra, o falido.
- **Custo e dificuldade:** médio. Motor novo de regras (cartas, aluguel, hipoteca), mas sem emulador. Partidas longas: usar teto de gasto por partida. Sem API nova.
- **Título:** "Coloquei 6 IAs pra jogar Banco Imobiliário (e uma [vendeu / hipotecou] tudo pra [a confirmar])".

### 7. Roblox, segunda tentativa: 3 IAs no Murder Mystery 2 ou Super SUS com jogadores reais
- **Origem:** no Roblox, 7 pessoas pedem "mais vídeos assim" (@CAFEZIN-K, @Lucss144, @taydiniz25, @WayneRonney-l5t, @fatal_t, @Kakaseime, @CrownSkulyOFC) e o dono respondeu "vou focar em trazer mais episódios nesse estilo"; no post da Comunidade ele pergunta se querem "uma segunda tentativa, quem sabe com outra IA". Outros jogos citados por 17 autores no total: Murder Mystery 2 (@laranjadooiooo, @TheTriangle0001), Roube um Brainrot (@cookie_bonitinha, @fatal_t), Brookhaven (@fatal_t), 99 Noites na Floresta (@professorviniciussilveira), Doomspire TD (@Kakaseime), Final Week (@CristianoSilva-r3i), REPO (@mystick00738) e Super SUS (@CrownSkulyOFC; mais 6 autores já nomearam o Super SUS como fonte das funções que pedem no Among: @alguemne1843, @DavilucasVieiraRodrigues, @LorenzoCentrista_anti-Pedro, @GleideAlves-t9n, @LorenzoPires-q6z, @otornadonimbus).
- **Por que pode dar certo (e o risco):** MM2 e Super SUS são dedução social, o gênero que vende, mas com humanos reais, que é o diferencial do Roblox. O risco é o mesmo do primeiro: clique. A análise do Roblox já diz o que fazer: miniatura no molde do canal (número + logos + conflito), jogo que o público conheça, elenco de IAs (3, não 1) e o melhor momento no último quarto.
- **Formato:** 3 IAs (ex.: Claude, GPT, DeepSeek) cada uma em um servidor do mesmo mapa, contra jogadores reais. Mede por sobrevivência e por "quantos jogadores reais perceberam que era IA".
- **Custo e dificuldade:** alto. Usa a ponte do Roblox já montada (`roblox/agente`), mas o custo do vídeo anterior foi grande (ver "Custo do Fable no vídeo do Roblox" em `MEMORIA_TECNICA.md`), cada IA precisa de câmera/visão e o jogo precisa aceitar bots (termos do Roblox, aviso do `ideias_roblox_ia.md`). Gravar 2 cópias para não perder gravação.
- **Título:** "Coloquei 3 IAs pra jogar Murder Mystery 2 com jogadores reais (e um deles a descobriu por [a confirmar])".

### 8. Torneio de xadrez: a Copa das IAs que vocês pediram
- **Origem:** @Kakaseime (xadrez em chaveamento de 8, "a IA que passar é a mais inteligente"), @j4core120 (xadrez). Combina com dois pedidos recorrentes de elenco: Gemini de volta (15 pessoas, 32 likes: @CAFEZIN-K, @RtcTubersCabulosoEchitara, @neimarzxwh, @gabrielcarvalho3493, @luizsvicent4040 e outros) e novas IAs (Luzia, Dola, Meta AI, Copilot: 17 pessoas, mais @DavidSilvaporto-k2y "coloca a Luiza que fala que é a melhor IA, bora ver"). O dono evita o Gemini, o Grok e o Copilot por preço ou burrice (`IAS_FAVORITAS.md`), mas num torneio de partidas curtas o custo se paga.
- **Por que pode dar certo:** responde à pergunta mais simples do público ("qual IA é a mais inteligente?") e vira regra da casa: as IAs pedidas entram, as favoritas defendem a vaga. O vencedor é medido sem discussão: resultado do jogo, mais o número de lances ilegais (gag natural: IA que tenta mover a torre na diagonal). Cada jogo tem 1 evento, 1 virada.
- **Formato:** 8 IAs em chaveamento (quartas, semis, final), 1 jogo por confronto, melhor de 1 (ou revanche em caso de empate). Avaliação com um motor de xadrez (a "precisão" de cada lance aparece na tela). A final é a melhor.
- **Custo e dificuldade:** baixo. `python-chess` + engine grátis, tabuleiro em SVG; as chamadas são curtas. Sem emulador. Pouca demanda direta (2 pedidos), mas é a mais barata e a de maior potencial de Short.
- **Título:** "Coloquei 8 IAs num torneio de xadrez (e a [Copilot / Luzia] [a confirmar])".

### 9. Tribunal das IAs (advogado, réu e juiz)
- **Origem:** @Nitsu_edits (tribunal: advogados, réu e juiz, escolher o tema do crime), @exagest (advogados de IAs diferentes em cada caso), @FornistasBoaPizza (3 IAs, 2 suspeitas e uma investigadora), @CAFEZIN-K (investigação estilo Patrick Jane, já atendido com o Interrogatório).
- **Por que pode dar certo:** o Interrogatório (5,9 mil) teve elogio forte nos comentários ("ABSOLUTE CINEMA", @CAFEZIN-K, cujos detalhes entraram no vídeo), embora as views sejam modestas. É dedução social com mentira conferível na tela (o espectador vê a pasta de provas). O juiz IA pode ser a "mais cara", como pediu @PATINHOD ("as IAs mais caras poderiam ser participantes especiais").
- **Formato:** 3 casos em 6 IAs: promotor, defensor, réu (inocente ou culpado, sorteado em segredo), juiz decide. Vencedor: veredito correto e placar de "acertos do juiz". Reaproveita `interrogatorio/`.
- **Custo e dificuldade:** baixo. Motor existe; só precisa de casos com pistas.
- **Título:** "Coloquei 6 IAs num tribunal (e o juiz condenou o inocente por [a confirmar])".

### 10. Minecraft: manhunt (caçadores vs speedrunners) ou todos juntos contra o Dragão
- **Origem:** @Kakaseime (caçadores vs speedrunners, 4 likes), @mr.trollermen (pedido repetido: "juntar todas" para zerar o Minecraft e matar o Dragão, "se a cebola não desistiu, por que eu desistiria?"), @jogando-brpaz (parkour), @gustavostelmach2678 (plugin de Jogos Vorazes). Total: 4 autores nos pedidos de Minecraft lidos na mão. Também aparecem os pedidos de Jogos Vorazes 2 (@dormirébomdemaisné com ideias de comida e água, @jundson, @linateixeira1758).
- **Por que pode dar certo:** manhunt é um formato conhecido do YouTube de Minecraft e tem aposta clara (1 caçador contra 3 fugitivos, tempo na tela). Mas Minecraft (4,3 mil) e Jogos Vorazes (5,9 mil) renderam abaixo da média do canal, então este fica por último.
- **Formato:** manhunt com 4 IAs (1 caçador, 3 speedrunners); vence quem derrotar o Dragão ou matar todos os speedrunners. Alternativa cooperativa: 4 IAs juntas, limite de 1 hora, "chegaram ao Nether?" como placar.
- **Custo e dificuldade:** alto. Bots Mineflayer já existem (`minecraft/bot.mjs`), mas chegar ao Nether e ao End com IA é muito difícil, exige muita tentativa e provavelmente acaba cortado; o risco de gravação inútil é grande.
- **Título:** "Coloquei 4 IAs num manhunt de Minecraft (e a caçadora [a confirmar])".

---

## Pedidos recorrentes que viram elemento "ideia de @fulano"

| Fã | O que pede (quantas vezes / onde) | Como usar |
|---|---|---|
| @Pursuer_M4 | Jogo de confiança (post na Comunidade), Carrasco (entrou no AU7), Vampiro, Assombrador (Lobisomem); 8 comentários em 7 vídeos | Ideia nº 4 inteira com o selo dele; abrir o vídeo agradecendo o Carrasco |
| @Kakaseime | Xadrez, caçadores vs speedrunners, Doomspire TD, worldbox, "velha geração vs nova geração" de IAs (hoje no AU7), "Queria tanto que tivesse um vídeo que a ideia fosse minha" | Ideia nº 8 com o nome dele; é o fã que cobra crédito |
| @Lucss144 | Age of Empires IV ("lembra de me mencionar"), Sósia, Possuidor (entrou), post na Comunidade | Selo de crédito no Impérios 2; AoE4 não tem API, o 0 A.D. já cobre |
| @mr.trollermen | Todas as IAs juntas para zerar o Minecraft, Camuflador e Paciente (entraram), zumbi clássico | Ideia nº 10; gag "se a cebola não desistiu" |
| @CAFEZIN-K | Overcooked com chef mandão (também @jundson, @fergusoff64w), I Am Not Human, mais Roblox, Gemini | Overcooked 2 e Roblox 2 com o nome dele |
| @pepinoVIC | "Dia 11, 12, 13 e 14 pedindo Monopoly" (4 vídeos) | Contador "Dia 14: pedido atendido" na ideia nº 6 |
| @Ponto-Final-Sem-Final | "Dia N pedindo Polícial" (12 ou mais comentários); entregue no AU7 | Já atendido; fechar o ciclo com selo "Dia 13: atendido" (conferir o número do dia) |
| @Davinichetti | "Dia 4 pedindo o Cianofóbico" (alvo: o Ciano, piada "cianofobia") | AU8, gag mais pronto do canal |
| @PintoNelsoOFC | "Dia 3: Copista" (neutro) | AU8 |
| @maskin-j3y | Infiltrado e Assassino de aluguel, "vou tentar até uma aparecer" (aparece em AU7 e Zumbi) | AU8: entregar um deles |
| @EliasSantos-m6c | "EU NÃO APARECI!!!!! EU PEDI MINHAS FUNÇÕES" (Anonimador, Ceifador, Coveiro, Pintor...) | Gag recorrente: "mais uma vez o Elias não apareceu" até aparecer |
| @guilhermgpd2 | Monopoly, ~40 funções, modos (todos contra todos, chuva de meteoros) e contador de pedidos | Selo em uma função do AU8 e na ideia nº 6 |
| @IsraelLael / @EnzoBatistaCosta-x5h | Lobisomem: Padre, Aprendiz de Vidente, Xerife; "coloca todos meus comentários" | Ideia nº 3 com os dois |
| @JarcielTrajano | Romântico/Cupido (4 vídeos), Plants vs Zombies com 2 IAs | Cupido no Lobisomem 3 e no AU8 |
| @Clavin3t | Clash Royale (carta formal; o dono respondeu em tom formal, já é gag do canal) | Não precisa vídeo: um cartão "Clavin3t, sua carta foi lida" por episódio. Emulador de Android seria o custo |
| @Stuemcena | Jogar com as IAs, Vila de IAs com psicopata | Ideia nº 2 |
| @epeoovo / @Ben_e_Teo | Morto-vivo / Fênix, Pokémon | AU8 e ideia nº 5 |
| @Lolzinpvp | Ladrão (entrou no AU7: "VAMO, MINHA IDEIA ACONTECEU"), Fingidor | Já creditado na descrição do AU7 (Ladrão); manter o selo no AU8 se o Fingidor entrar |
| @NetheritaCraftBr / @Nitsu_edits / @TheTriangle0001 | Mentalista; Serial Killer e tribunal; Ceifador e MM2 | AU8 (funções) e ideias nº 7 e 9 |

Frases de fãs que viram placa ou meme (as que apareceram de novo hoje): "cianofobia", "Dia N pedindo", "o dourado foi o GOAT" (ver `pedidos_comentarios.md`); "como ele escreve tão rápido?" (@TheTriangle0001 no Roblox, gag para a velocidade das IAs); "o primo do Eri, o Ovo" (@FAMILIAGMS sobre a skin do Felipe no Roblox, resposta do dono "isso aí é segredo").

## Pedidos que ficaram fora do Top 10 (e por quê)
- **Tutorial "como eu faço"** (cerca de 26 pessoas perguntam como ele faz ou pedem tutorial; o dono já prometeu em Shorts, 08/11): é Short barato, não vídeo; fazer no meio da semana entre dois vídeos longos.
- **Esconde-esconde no Among** (14 pessoas, @deboralouvatto5279 e @QuetiMoreiraPereira com regras escritas, sem resposta do dono): modo de partida, não vídeo próprio; cabe como 4ª partida do AU8 se a ideia nº 1 for adiante. O modo Zumbi (especial) rendeu 7 mil contra 17 mil do Polus, então um modo inteiro é aposta menor.
- **Overcooked 2 com chef mandão, 60 Segundos 2 com memória, Jogos Vorazes 2, Impérios 2 (Risk, @user-lw2eu4hx3p; 16 IAs, @MarcusGabriel-w1o):** todos têm 2 a 4 pedidos e os originais ficaram entre 3 e 6 mil. Melhor entrarem como Shorts ou como "ideia de @fulano" dentro de outro vídeo.
- **Clash Royale, Plants vs Zombies (duas IAs na mesma tela), Mortal Kombat, Fortnite em duplas, visual novel, Danganronpa, Mario Kart em turnos:** 1 pedido cada e custo técnico alto (emulador ou jogo novo).

## Observações para decidir
1. **Ordem sugerida:** Pokémon (hoje) e AU7 (publicado) já estão fora. Próximo longo: ideia 1 (AU8) ou ideia 3 (Lobisomem 3), porque o motor existe; no meio da semana, um Short do tutorial. A ideia 2 (humano) merece 1 semana de desenvolvimento antes de gravar.
2. **Lição que pesa em todas:** continuação precisa de gancho novo no título (Lobisomem 2 caiu para 21%). Em todas as ideias o "(surpresa)" deve vir da cena de abertura, como pede o CLAUDE.md.
3. **Usar a Comunidade como enquete:** o post de enquete do Pokémon teve 23 likes (os outros 2 a 30). Uma enquete "qual dos 3 você quer: confiança, Banco Imobiliário ou xadrez" custa zero e gera crédito "ideia de @fulano".
4. **Dados que ficaram de fora:** não consegui as datas de envio (o `yt-dlp` devolveu NA) nem os números do Pokémon; a retenção do AU7 e do Pokémon sai nos próximos 2 dias e muda a ordem do 1 ao 5.
