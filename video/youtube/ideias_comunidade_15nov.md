# Ideias novas da comunidade (levantamento de 15/11/2026)

Só o que é novo desde 12/11 e não está em `ideias_proximos_videos.md`. Nada foi postado nem comentado no YouTube ou no jogo.

Fontes e limites (honestos):
- Comentários coletados hoje com o `yt-dlp` (o `comentarios_yt.sh` tomou 403 do YouTube; deu certo com `player_client=web_safari`) em: AU7 (5-6t_WFR_2c, 60), Zumbi (sxOt9U58dcQ, 79), Impérios (68_TOmZXzaA, 51), Roblox (jEnL6RgOe54, 28), Pokémon (O0wSOH60R0Y, 23), Gartic (o-ha5jxtaqo, 29), Confiança (XORTcSL6sCM, 5). Bomba, Lobisomem 2 e Minecraft não vieram (403) e os 2 Shorts de Pokémon/Gartic também não; só os 7 vídeos acima foram lidos. Em alguns vídeos o 403 cortou as respostas no meio.
- Posts da aba Comunidade pelo `ytInitialData` (16 posts: 10 do dono, 6 de fãs).
- "Novo" = comentário que não está no acervo salvo e é de 12/11 em diante (a data do `yt-dlp` é aproximada). Contagem por autores diferentes; margem de 1 a 2 nomes.

## 1. Ideia de Pokémon em destaque

Não achei no que consegui ler um texto longo e "interessante" de Pokémon na Comunidade: nenhum dos 6 posts de fãs fala de Pokémon (são Tabs, jogo de casos, Among, AoE4, Stop). Os dois textos de Pokémon que existem são comentários, não posts. Se o Felipe se referia a outro post, ele precisa mandar o link ou o nome do autor.

**Candidata principal (nova, 15/11, vídeo do Pokémon):**
> "Faz um torneio Pokémon de IA com elas montando seu próprio time e estratégia"
- Autor: @casGTL-g3x. Likes: 0. Resposta do dono: nenhuma.

**É a mesma ideia que já tinha aparecido antes (acervo, vídeos Overcooked e AU3), em versão mais longa:**
- @antiuttp-piupefrederico (1 like), no Overcooked: "Faz um vídeo de grok gpt deep seek gpt Gemini Claude jogando Pokémon onde eles precisam evoluir até conseguir os melhores níveis lutam no torneio mundial das ias para ver quem que ganha e antes de sua preparação deles tendo quatro lados lado do fogo começa com Charmander vai pra charmeleon depois o mais forte Charizard lado da água squiltle daí vai para war tortle daí por fim vai para o blastoise" (o texto segue falando de ataque personalizado por tipo; copiado do comentário original, que também diz "amistoso para conseguir evoluir para o torneio" no AU3).
- Apoio: 2 autores (@casGTL-g3x e @antiuttp-piupefrederico) pedem batalha/torneio de Pokémon entre IAs. Outros pedidos de Pokémon sobre este vídeo: parte 2 (@tetexsala_ofc, "Faz parte 2"; @Tinanossauro-q7s e @Lolzinpvp elogiam). @Ben_e_Teo (6 comentários em Bomba) pedia Pokémon e já foi atendido. Também há "Nenhuma iria ganhar, mapa muito aberto" (@helenaalencar5908), que é a leitura do público sobre o vídeo 1.
- O dono avisou no post de 2 dias: "já vão se preparando porque vem Pokémon com IAs por aí!" (frase sobre o vídeo 1, não sobre a sequência).

**Como faríamos (versão torneio de batalha, que é o que os dois pedem):**
- Não dá para usar o FireRed + mGBA (`pokemon/ambiente_firered.py`, `video/scripts/pk_replay.py`) para um torneio entre IAs: é um jogo de um jogador e o emulador não tem batalha entre dois jogadores. O que reaproveitamos de lá é a arte, o visual e o gancho de personagens fixos (as 3 IAs que fizeram agentes).
- Caminho mais barato: simulador de batalha determinístico (Pokémon Showdown, código aberto, rodado local com semente fixa) com cada IA montando o time de 6 e escolhendo golpe por turno. Custo estimado US$ 3 a 6 por rodada completa (8 IAs, mata-mata, chamadas curtas), tempo 4 a 6 dias (montar a ponte de texto, o placar e uma tela de batalha em SVG no estilo do jogo), risco médio: o visual não é o do FireRed (o CLAUDE.md pede visual parecido com o original) e a regra "jogo real, funções reais" fica coberta pelo Showdown. Estimativa minha, sem medição.
- Versão "parte 2 do vídeo 1" (revanche das 3 IAs, ideia nº 5 do levantamento de 12/11): custo alto (treino de horas, sessões que caem), risco alto, e o próprio vídeo 1 mostrou a IA do GPT perdendo a partida por queda de máquina. Só vale se o vídeo 1 passar de ~10 mil views.
- Gancho de título (a confirmar pelos logs): "Coloquei 8 IAs num torneio Pokémon montando o próprio time (e uma ... [a confirmar])".

## 2. Outras ideias novas, por número de autores diferentes

| # | Ideia | Pedidos | Como faríamos (1 linha) |
|---|---|---|---|
| 1 | Novas funções do Among (AU8): Copiador/Copista/Sósia, Cianofóbico, Assassino de aluguel, Infiltrado, Mentalista, Ceifador, Serial Killer, Fingidor, Morto-vivo, Romântico, Clarividente, Dominante | cerca de 25 autores na rodada de hoje, os já listados em 12/11 mais novos (@Havok_aaa, @Roberta1205-z3b, @King_Hyperior, @Água_morta-ofc, @Coneroxinn, @robertasantos6400, @BrawlFan-e7k, @RedstoneRebelde, @isaiasjunior2994, @henriquemorcerf) | AU8 simples, "de volta às origens" (o dono respondeu ao @spectra-wotblitz que quer um Among mais simples) com 4 a 6 funções bem explicadas e selo de cada autor |
| 2 | FNaF com IAs | 4 autores: @TheTriangle0001 (11 comentários iguais em 2 vídeos), @antiuttp-piupefrederico (com as regras dos animatrônicos), @ChrysCosta-x3s (FIFA, separado) | texto: a IA decide câmera e porta por turno, motor de regras em SVG; custo baixo, mas é jogo de reflexo, o canal rende pior em habilidade pura |
| 3 | Tribunal das IAs | @SwordMan333 (8 likes no Gartic, 2 dias seguidos "dia 1" e "dia 2"), mais os 4 da lista de 12/11 | reaproveita `interrogatorio/`; já era a ideia nº 9, agora é o comentário mais curtido do vídeo do Gartic |
| 4 | Age of Empires IV com 16 a 20 IAs | @MarcusGabriel-w1o (2 comentários: "desde o dia 8", "pode me mencionar"), @Lucs (post da Comunidade com times e civilizações) | 0 A.D. como jogo base (AoE4 não tem API); crédito aos dois |
| 5 | Jogo de palavras: Stop e continuação do Gartic (palavras difíceis, "corpo estranho" em que cada IA desenha uma parte, esconder a palavra para o público) | @lina_teixeira (post: "BOTA 5 IAS PARA JOGA STOP"), @eusouoking (corpo estranho), @danilorodrigues4437 (esconder a palavra), @dayronoficial948 ("PARALELEPÍPEDO") | Gartic 2 com o modo corpo estranho e a palavra oculta na tela; o dono já disse no post "deixem palavras difíceis" e respondeu que "a ideia é boa"; custo baixo |
| 6 | Tabs (Totally Accurate Battle Simulator) | @MateusWT10 (post da Comunidade, 3 likes) | sem API; só como Short ou com simulação própria; risco alto, 1 pedido |
| 7 | Uno com IAs e One Block do Minecraft | dono citou nos comentários ("estava pensando em fazer um vídeo das ias jogando uno"), motivado por @PixelEconomics (também pediu Stop, poker, Roblox e Minecraft) | Uno é regra simples, aposta clara (cartas na tela), custo baixo; entra no rodízio como vídeo curto entre dois Among |
| 8 | Minecraft: zerar o jogo todas as IAs juntas | @mr.trollermen (de novo, agora no Gartic: "ai ta de pé a ideia de zerar o mine com geral junto?") | o dono respondeu que precisaria de servidor de Discord para organizar; custo alto, já era a ideia nº 10 |
| 9 | Roblox: mais episódios, superSUS, "Sobreviva as suas ideias", jogar com o público | @Lucss144, @taydiniz25, @WayneRonney-l5t, @CAFEZIN-K (jogo "Sobreviva as suas ideias", com as regras), @CrownSkulyOFC, @fatal_t, @Kakaseime, @jogando-brpaz ("FAZ PARTE 2") | Roblox 2 com 1 IA e um jogo de ideias escritas pelo público; já era a ideia nº 7 e agora tem mais 3 pedidos |
| 10 | Ladrões à solta / peste (dedução social nova) | @jorginhorainbowfriends (regras escritas, "dia 2"), @luizceccarelli6007 (médico da peste) | 6 IAs, 1 detetive e ladrões com chefe; reaproveita o motor do Lobisomem; custo baixo a médio |
| 11 | Xadrez em chaveamento, Doomspire, WorldBox, "velha geração vs nova geração" | @Kakaseime (de novo no Roblox, Pokémon e AU7) | segue a ideia nº 8 de 12/11; velha vs nova geração vira o gancho de um AU8 ("Among Us: IAs antigas contra IAs novas") |
| 12 | Outros com 1 pedido: Hearts of Iron IV (@DidiCortesOriginal), Undertale (@tetexsala_ofc), Backrooms (@DuasLuzes10), 7.000.000 dólares estilo MrBeast (@TheTriangle0001), Todas assistirem vídeos de profissional antes de jogar (@adrianinho_zika_gameplay), "humano joga com as IAs" (@cltnoob), mapa de hotel e abelha rainha (@J.JJogos) | 1 cada | ver tabela de 12/11; nenhum justifica vídeo próprio |

Sobre o cenário do canal (posts do dono, 15/11): Among IA vai ter frequência menor e o dono pediu críticas ao canal; "preciso da opinião" sobre postar já ou melhorar. Isso casa com o item 1 (AU8 simples) e com variar os jogos.

Observação sobre o canal: o vídeo de Confiança saiu hoje (118 views, 5 comentários, nenhum pedido novo ainda). O Gartic tem 2.508 views (29 comentários), o Pokémon 2.133 (23).

## 3. Fãs recorrentes que merecem crédito

| Fã | Por quê | Crédito sugerido |
|---|---|---|
| @Pursuer_M4 | ideia do jogo de confiança, agradecido pelo dono no post de hoje | selo "ideia de @Pursuer_M4" no vídeo de Confiança e na descrição (já agradecido) |
| @Lolzinpvp | "VAMO, MINHA IDEIA ACONTECEU" no AU7 (Ladrão); também elogiou o Pokémon ("tava esperando muito ele") | manter selo no AU8; pediu Fingidor |
| @Kakaseime | pede há 3 vídeos xadrez, Doomspire, WorldBox e "velha geração vs nova geração" (dia 2) | gag "Dia 2 pedindo" e selo no AU8 |
| @TheTriangle0001 | 14 comentários "Faz as IAs jogar FNaF" em 2 vídeos, mais "como ele escreve tão rápido?" | gag de insistência; decidir se atende com um Short |
| @EliasSantos-m6c | "eu não apareci!!!!! EU PEDI MINHAS FUNÇÕES" (também sugeriu Técnico) | gag "o Elias não apareceu" até aparecer |
| @MarcusGabriel-w1o | pede AoE com 16 a 20 IAs desde o dia 8, pede menção | crédito se fizer o Impérios 2 |
| @CAFEZIN-K | Overcooked, Roblox, "Sobreviva as suas ideias" e elogio detalhado ("agora ficou mais interessante") | selo em qualquer Roblox 2 |
| @Ponto-Final-Sem-Final | "Finalmente leu minha ideia" (Policial entregue no AU7) | fechar o ciclo com selo "Dia N: atendido" |
| @mr.trollermen | zerar o Minecraft com todas as IAs, 3 vídeos seguidos | gag "se a cebola não desistiu" |
| @spectra-wotblitz | "CADE O CLONE, DIA JA PERDI AS CONTA" e "A man eu desisto"; o dono respondeu que pretende fazer | AU8 simples com o Clone bem explicado, ou perde o fã |
| @SwordMan333 | Tribunal em 2 dias seguidos, 8 likes, o comentário mais curtido do Gartic | selo "ideia de @SwordMan333" se o Tribunal sair |
| @pepinoVIC / @PintoNelsoOFC / @Davinichetti | Monopoly (Dia 14), Copista (Dia 3), Cianofóbico (Dia 4) | contadores "Dia N" nos cartões do AU8 |

Respostas do dono nesta rodada (para não repetir promessa): vai fazer tutorial "em breve" (@ovo_decodorna), vai fazer Among "de volta às origens", considera Uno e One Block, achou "boa ideia" o corpo estranho do Gartic e o xadrez (@Kakaseime), respondeu no Roblox que o Pokémon "já está sendo feito" (esse é o vídeo 1, já publicado).

## DECISÃO (15/11): próximo vídeo grande = TRIBUNAL DAS IAs, no estilo de jogo de tribunal (tipo Phoenix Wright)
- Escolha do Felipe, com crédito ao @SwordMan333 (comentário mais curtido do Gartic) e aos outros que pediram.
- Fica para quando a cota voltar; tem que sair em alta qualidade (de preferência com o Fable no storyboard/visual).
- Estilo do gênero, com identidade NOSSA: julgamento com investigação + interrogatório de testemunhas, provas
  apresentadas na hora certa, contradições em destaque, gritos de "OBJEÇÃO!" e "PEGUEI VOCÊ!" em SVG, réu, promotor,
  advogado, juiz e júri feitos por IAs com nome de personagem (8 a 12). Sem copiar personagens, nomes, arte ou
  músicas da série original: personagens, cenários e casos todos próprios do canal.
- O público sabe quem é o culpado desde o começo (cartão "SÓ VOCÊ VÊ"); motor reaproveitando `interrogatorio/`.
