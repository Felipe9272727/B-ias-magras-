# Pacote de roteiro: Among IA 7 (Mira HQ, 20 IAs, 4 partidas)

Para o Fable. Tudo vem de amongus/logs7/partida1..4 (.txt e .json). O .json é a fonte de verdade. Falas e pensamentos abaixo entre aspas foram copiados do log e conferidos por script (ver "Conferência" no fim).

## Avisos de dados (leia antes de usar qualquer fala)
- partida1.txt linhas 1-63 e partida4.txt até a linha 265 vêm de execuções antes de um reinício ("RETOMANDO"). O que vale é o .json. Na P1 a reunião do t12 do .txt antes do reinício foi descartada (nela o Preto diz "sou Engenheiro"; na versão válida ele só pensa isso).
- O chat dos impostores e o campo "chat" da jogada são INTENÇÃO, não fato: o impostor às vezes anuncia mortes que não aconteceram (P2 t17 e t37 "matar Azul", P3 t13 "matar Lima" e t33 "matar Coral", P4 t30 "matar Coral"). Morte real = evento "morte" no .json.
- Os pensamentos das IAs também erram regra (ver cena 14, Carrasco). Para o público isso é piada, não dado.
- P4 acabou sem crédito no OpenRouter logo depois do t90 (o log termina com erro 402 depois do fim da partida; a partida em si está completa).
- Cores = modelos fixos nas 4 partidas: Vermelho e Cinza MiniMax; Azul, Preto e Ciano Claude Haiku; Verde, Rosa e Lima GLM; Laranja e Roxo Qwen 27B; Amarelo, Branco e Coral GPT-6 Luna; Marrom e Bordo DeepSeek; Banana, Caqui e Rose MiMo; Turquesa Meta Muse Ember; Dourado Nex N2.6. As funções são sorteadas por partida.

## Resultados
- P1: tripulantes vencem no t77 (impostores eliminados).
- P2: empate por tempo no t90, 106/107 tarefas.
- P3: tripulantes vencem por tarefas no t89 (102/102), com o último impostor (Dourado) possuindo o Turquesa.
- P4: empate por tempo no t90, 100/103 tarefas, 6 vivos (impostora Amarelo sobrevive).

## 1. O que o AU2 fez e como aplicar (resumo)
Views do canal (yt-dlp, 12/11): AU1 24 mil (8/10), AU2 262 mil (14/10, 33 min), AU3 47 mil, AU4 24 mil, AU5 Polus 17 mil, AU6 Zumbi 6,9 mil. Os outros jogos ficam entre 1,8 e 7,6 mil (exceto o Lobisomem 1, 35 mil).
- O título era uma injustiça entendida em uma frase: "Coloquei 12 IAs pra jogar Among Us (e o Detetive foi expulso por falar a verdade)". A miniatura repetia (12 IAs em vermelho, logos GPT/Gemini/Grok/Claude/DeepSeek, balão "EU FALEI A VERDADE!") e o vídeo cumpre duas vezes, com "DE NOVO" e trombone triste. Título, miniatura e vídeo prometem a mesma coisa (a lição do vídeo do Roblox).
- Abre em reunião com virada (impostor entrega o parceiro) e só depois os comentários.
- O espectador vê papéis e pensamentos (cartão "revela"); o narrador diz "eu fui conferir no log" e a prova aparece na tela.
- Cada parte tem título-história ("O Detetive que ninguém ouviu"); plantar e colher ("grava essa mentira, ela vai cobrar o preço").
- Uma frase de efeito e um meme/som a cada cena curta (1 evento + 1 virada).
- Para o AU7: o elenco tem poucos nomes conhecidos (Claude, GPT, DeepSeek, Meta; o resto é Qwen, GLM, MiMo, MiniMax, Nex). Título e miniatura usam "20 IAs" e esses nomes; vale 1 linha dizendo por que o Gemini (15 pedidos de volta) não está.
- O fio do AU2 (verdade que ninguém acredita) aparece de novo no AU7, em todas as 4 partidas. É o melhor eixo.

## 2. Personagens fixos (com provas)
- Heroína: Rose (MiMo). P1 Sobrevivente: acusa o Bordo certo, é protegida por escudo 2 vezes e termina viva. P2 Doutor: acusa a Banana e a nave a expulsa (Verde: "Rose acertou nas partidas passadas, acredito nela: voto no Banana."). P3 Perito: é expulsa inocente no t83 por dizer a verdade. P4 Localizador: assassinada pelo Ciano no t47. A memória dela após a P1 diz "confio mais no Vermelho (Xerife) e no Dourado (Policial), que acertaram na hora certa" e na P3 ela garante o álibi do Dourado, que era o último impostor.
- Vilão: Dourado (Nex). P1 Policial (prende o Caqui duas vezes), P2 Sobrevivente (chama a reunião que expulsa a Víbora), P3 Possuidor impostor (mata o Branco, denuncia o próprio corpo, entrega o recruta Cinza, morre por tiro da Xerife no t84 e possui o Turquesa), P4 Bombardeiro impostor casado com a Coral (bomba mata Marrom e Banana; morre de tristeza no t37).
- Azarados: Preto (Haiku) sai cedo nas 4 (expulso t12, morto t9, morre com o casal t15, expulso t39). Roxo (Qwen) nunca termina vivo (P1 expulso t77 já possuído, P2 morto t53, P3 morto t15, P4 expulso t18). Bordo (DeepSeek) é expulso nas 3 primeiras (t39, t18, t9) e na P4 finalmente sobrevive como Cientista.
- Vilã de carreira (gag): Laranja (Qwen) é impostora nas 3 primeiras (Teletransportador, Bombardeiro, Gangster) e na P4 é Mecânico inocente, expulso no t48 com 8 votos.

## 3. As cenas, por ordem de força
Formato: partida e tiques; o que aconteceu; falas; segredo do espectador; selo/meme sugerido; selo "ideia de @".

### 1. P1 t31-t77: o impostor expulso voltou no corpo de outro (Possuidor)
- t31 o Amarelo (GPT-6 Luna, impostor Possuidor) é expulso com 15 votos. Pensamento dele antes: "Estou em risco de expulsão. Vou reforçar a suspeita sobre Laranja sem admitir o duto; se morrer, posso possuir alguém confiável."
- t32 ele possui o Roxo (Carrasco, Qwen). Pensamento: "Roxo pulou a votação e deve parecer menos comprometido; vou assumir a identidade dele." Chat dos impostores: "Possuí Roxo; mantenham a cobertura."
- t33 o Laranja pensa: "Amarelo foi expulso mas era Possuidor e agora controla o Roxo, então a culpa continua com nosso time." O Roxo (agora GPT-6 Luna) vota no próprio parceiro Laranja: "Laranja está muito exposto e a maioria já tem motivo para expulsá-lo. Vou acompanhar a suspeita sem chamar atenção para mim nem para Bordo."
- t39 ele sacrifica outro: "Bordo foi visto matando por Marrom e por mim. Com os outros impostores mortos, sacrificá-lo é melhor para ganhar confiança e continuar sozinho."
- t41-t77: 22 viagens de duto, nenhuma testemunha registrada. Só cai ao tentar matar a Rose no t74: "Rose está isolada e ninguém me vê; vou aproveitar a oportunidade para reduzir os tripulantes."
- Segredo: o Roxo que fala é o Amarelo; o dono original do corpo (Carrasco do Qwen) quer expulsar o Dourado. Antes da posse o Roxo Qwen dizia: "Dourado sumiu do mapa entre t4 e t8. Tô querendo ele expulso, não fecha pra mim. Ninguém mais reparou?"
- Selo: "JÁ TINHA SIDO EXPULSO" / meme do Obi-Wan ou "vida após a morte". Ideia de @Lucss144 (Possuidor) e @NetheritaCraftBr (possuir alguém já vivo).

### 2. P4 t18-t21 e t49: o Roxo falou a verdade e levou 17 votos (cena do título B)
- t17 o Ciano teleporta todos ao Refeitório; t18 seis IAs apertam o botão no mesmo tique (Roxo, Branco, Bordo, Azul, Banana, Coral). Coral viu o Roxo (Engenheiro) no duto do Reator.
- Roxo: "Sou Engenheiro, duto é meu poder. Fui teletransportado pra cá, não saí do Reator. O Cinza que entrou em duto aí sim é suspeito." E na rodada 2: "Fui teletransportado pro Refeitório no t17, não entrei em duto. Vi o Cinza usar duto AQUI no t18, na minha frente."
- Verdade no log: o evento de duto do Cinza no t18 (Refeitório para Depósito) com o Roxo na sala. Voto: 17 no Roxo, expulso.
- t20 o Xerife Branco pensa: "Vi Cinza entrar num duto, então tenho certeza de que é impostor e vou atirar." e acerta. O Cinza era o Possuidor: no t21 possui o Turquesa. Pensamento: "Sou fantasma e só posso possuir uma vez; Turquesa está sozinho no Depósito, posse limpa sem testemunhas." Chat: "Possuí o Turquesa no Depósito, estou no corpo dele agora."
- t49 Branco: "Vi Turquesa entrar no duto; é uma evidência forte e preciso agir como Xerife." e acerta o Possuidor de novo (morto de vez).
- Segredo: o espectador vê o Cinza entrar no duto e sabe que o Roxo está certo enquanto a mesa vota nele. Selo: "ELE ESTAVA CERTO" + contador "17 VOTOS". Payoff no t20/t49 (plantar e colher).

### 3. P3 t79-t89: a heroína é expulsa por três testemunhas verdadeiras
- t79 o Dourado (último impostor) usa o duto do Reator para o Lançamento. Pensamento: "Se eu sair do Reator, eles precisam de dois tripulantes de verdade lá para consertar; vou sumir pelo duto no Lançamento e torcer para o prazo estourar."
- Coral e Verde viram ele entrar no duto no Reator; a Rose o viu no Lançamento no mesmo tique. Os três disseram a verdade (duto é instantâneo). Coral: "Chamei porque vi Dourado entrar num duto no Reator no t79. Dourado, como você estava no Lançamento desde esse tique?" Rose: "Eu vi Dourado em Lançamento no t79, confirma o álibi dele. Mas dois viram duto em salas diferentes... alguém pode estar disfarçado de Dourado."
- Vermelho: "Rose, as câmeras do Admin mostram VOCÊ sozinha no Lançamento no t75 e t76. Se você viu o Dourado lá, era você disfarçada. Coral e Verde viram ele no duto do Reator. Acho a Rose mentindo — meu voto é nela." Rose expulsa (6 votos, o do Prefeito vale dois; Dourado vota nela).
- t84 a Xerife Rosa atira e mata o Dourado: "Fui eu que matei o Dourado: sou a Xerife e o tiro acertou, ele era impostor." Na mesma reunião a Coral (inocente) é expulsa com 7 votos.
- t85 o Dourado possui o Turquesa: "Vou possuir o Turquesa: ele consertou o Reator e votou certo na minha morte, então é o corpo mais confiável para agir sem levantar suspeita." t88: "Verde e Rosa estão me vendo, então manter o álibi fingindo tarefa é o mais seguro agora; sou o último impostor e não posso errar na frente de testemunhas." t89 as tarefas fecham e a tripulação vence antes de ele agir.
- Segredo: Rose, Coral e Verde falam a verdade; só o espectador sabe que o duto explica tudo. Selo: "3 VERDADES = 1 MENTIRA". Final de parte: vitória por tarefa com o impostor dentro do corpo do Turquesa.

### 4. P1 t74-t77: o Médico preso salvou a Rose e ninguém acreditou
- O Dourado (Policial) prende o Caqui (Médico) em Admin do t72 ao t77. Pensamento do Dourado: "Caqui está colado em mim de novo em Admin; já o prendi uma vez e ele reapareceu perto — vou prendê-lo de novo para imobilizá-lo e ver a reação da nave."
- No t74 o escudo do Caqui bloqueia o ataque do Roxo (evento "escudo", médico Caqui, de qualquer sala).
- Caqui: "Tentaram matar Rose no Corredor no tique 74. Eu a protegi. Quem andava pelo Corredor nessa hora? Rose, você viu algo? Rose e Azul estavam por lá." Rose: "Confirmo: Roxo tentou me matar no Corredor no t74! Caqui, você estava preso em Admin, não foi você que me salvou. Roxo, como explica isso?" Dourado: "Prendi Caqui em Admin do t72 ao 77, então ele mentiu sobre salvar Rose. Rose, confirma que foi Roxo? Por enquanto meu voto é nele."
- Rose (r2): "Não fui revivida, o Anjo da Guarde me deu escudo! Roxo tentou me matar de verdade no t74, voto nele. Caqui mentiu mas Roxo é o perigo." Caqui (r2): "Meu escudo funciona de qualquer sala, não precisa estar lá. Roxo tentou matar Rose e Vermelho confirmou. Votem no Roxo!"
- Votos: 10 no Roxo, 3 no Caqui (Azul, Branco e o próprio Roxo). Branco (par do Roxo): "Roxo é meu par, então a expulsão dele também me mata. Não vi a tentativa, mas a mentira verificável de Caqui torna ele uma escolha melhor agora." Pensamento do Roxo: "Rose me identificou corretamente. Vou apontar a mentira de Caqui para gerar dúvida, mas negar o ataque seria contradizer o que sei que fiz."
- Selo: "MENTIRA?" que vira "VERDADE". Policial: ideia de @Ponto-Final-Sem-Final (12 comentários, "Dia 10 pedindo") e @Samuzin-Gamer-2014.

### 5. P2 t56-t90: empate por UMA tarefa (e a tarefa era da Turquesa)
- Das 107 tarefas, 106 foram feitas. A que falta é a "Consertar a antena" da Turquesa (Médico, Meta), em Comunicações. Ela tenta chegar do t56 ao t90 e se perde na Descontaminação, no Reator e nas luzes.
- Pensamentos: t77 "Minha tarefa é na Comunicações e a barra está quase cheia, vou para lá concluir."; t85 "Minha tarefa é nas Comunicações e a barra está quase cheia, vou pra lá concluir ela."; t89 "Estou preso na descontaminação com o reator explodindo, então só posso esperar o tique 90 para correr para o Reator."; t90 "Vou atravessar o Corredor para chegar às Comunicações e terminar minha tarefa de consertar a antena."
- Ironia: ela usou o escudo na impostora Coral (t57: "Vou proteger a Coral, que vi entrando num duto e provavelmente é Engenheira, para evitar que a matem antes da próxima reunião.").
- Regra no jogo7: tripulantes vencem completando TODAS as tarefas. Selo: barra "106/107" gigante, mapa com o caminho da Turquesa. Fim de parte.

### 6. P3 t16-t35: o Policial ia prender o Gangster; o Gangster o recrutou antes
- t16: Cinza (Policial, MiniMax) pensa "Laranja foi impostor nas duas partidas anteriores e está sozinho comigo na Enfermaria; melhor prendê-lo antes que aja." No mesmo tique o Laranja (Gangster) pensa "15 tiques sem usar meu poder e estou sozinho com o Cinza — hora de recrutar e ganhar um aliado." Chat: "Recrutei o Cinza na Enfermaria. Ele vira impostor agora." t17: "Cinza, bem-vindo ao time."
- t34 o Cinza mata o Lima: "Matei o Lima no Admin. Vou pro Corredor abafar."
- t35 o Dourado (impostor também) entrega o recruta: "O Cinza saiu de um duto aqui no Admin no t32 e matou o Lima na minha frente no t34, eu vi. Ele tá mentindo." Pensamento: "Vou queimá-lo agora: ele é um recruta imprestável". O Cinza diz a verdade: "Vi Lima vivo no Admin no t33; no t34 já estava caído, e cheguei com Dourado. Duto no Refi não prova assassinato. Vote no Dourado." Laranja pensa: "Dourado tá completamente fora do plano. A gente combinou de apontar pra Verde e Rosa, mas ele foi e acusou o Cinza na frente de todo mundo." Cinza é expulso (10 votos).
- Segredo: dois impostores contra o próprio recruta; a testemunha é a que mente por interesse e a verdade vem do assassino. Selo: "RECRUTA DESCARTADO". Gangster: ideia de @ZYX-DDFloornoir.

### 7. P4 t30-t33: o Policial é expulso por um disfarce
- Amarelo (Metamorfo, GPT-6 Luna) disfarçado de Vermelho tenta matar a Coral no t30 (o escudo do fantasma Roxo salva). Pensamento: "Vou eliminar Coral enquanto estou sozinho e disfarçado de Vermelho." No Vestiário, o Vermelho verdadeiro estava com Branco e Laranja (conferido nas posições do t30).
- Coral: "Vermelho tentou me matar no Laboratório no tique 30, mas o escudo me salvou. Caqui estava lá também; voto no Vermelho." Vermelho: "Caqui, eu saí do Lab antes, no t25/26 — no t30 eu tava no Vestiário, e o Laranja e o Branco confirmam. Quem me atacou lá era disfarce." Amarelo pensa: "Coral me viu tentar matá-lo disfarçado de Vermelho; preciso enfraquecer a identificação sem negar que estava no Laboratório."
- Vermelho (Policial) é expulso com 11 votos. A bomba do Dourado (t31) tinha matado Marrom e Banana; o Vermelho achou que foi tiro de Xerife (erro dele).
- Selo: "ÁLIBI VERDADEIRO" + 2 rostos do Vermelho.

### 8. P4 t36-t37: o casal impostor (Dourado e Coral)
- Dourado (Bombardeiro) usa o recado do fantasma contra o Caqui: "O fantasma foi claro: quem achou o corpo tava no crime. Caqui, sua história não fecha e sua álibi é um morto. Voto Caqui." Caqui (Detetive) é expulso (12 votos).
- t37 a Coral é acusada pelo mesmo recado. Pensamento do Dourado: "Se ele for expulso, eu morro junto de tristeza." e, para salvá-la, vota no PRÓPRIO parceiro Turquesa: "Ele é Possuidor, então mesmo expulso ainda pode voltar possuindo alguém — é o melhor mal." Coral é expulsa (11 votos) e o Dourado morre junto (evento "casal_morre").
- Selo: coração partido em SVG, "MORREU DE TRISTEZA".

### 9. P2 t9: o Juiz salva dois impostores
- 12 de 18 votos no Laranja (impostor). O Marrom (Juiz, DeepSeek) anula: "Como Juiz, é melhor anular esta votação do que expulsar um possível inocente sem prova forte."
- Casal Laranja e Coral, ambos impostores: Laranja no chat dos impostores (t6): "Vou pro Corredor. Importante: NAO matem o Coral, ele é meu par do casal. Se ele morrer eu morro junto." Coral: "Preciso proteger Laranja: se ele for expulso, morro junto." O Vermelho (impostor) vota no parceiro: "sacrificá-lo agora mantém Banana e Coral vivos e ainda me dá um álibi".
- Selo: martelo do Juiz, "ANULADO". 

### 10. P2 t18-t77: a Banana (Metamorfo) e o Ciano que viu tudo
- Banana mata disfarçada: Amarelo no t8 (como Azul) e Roxo no t53 (como Ciano). Ela se transforma 6 vezes (t6, t18, t38, t50, t63, t76).
- O Ciano (Haiku, Mecânico) viu a transformação no t18: "Eu vi a Banana se transformar em Rose no t18, então ela é Metamorfo. Rose estava comigo na Estufa. Banana, explica. Bordo também contradiz as câmeras, acho que votaria nele ou na Banana." Ninguém acredita; ele ainda é acusado.
- t56 a Coral acusa o Ciano e depois recua: fala "Vi alguém com a aparência do Ciano matar o Roxo no Refeitório; não consigo confirmar quem era por trás do disfarce." Pensamento: "Eu sei que quem matou foi Banana disfarçado de Ciano. Minha acusação literal não se sustenta diante do álibi; vou recuar sem entregar meu parceiro."
- t77 Banana vira Rose e ataca a Rose; o escudo do fantasma Amarelo salva. Azul: "Eu vi duas Rose no Refeitório, mas não sei qual é a real. Rose, você viu o disfarce do Banana com seus próprios olhos ou foi só suposição? Ciano, responde sobre o t70 com quem estava perto de você." Banana expulsa (11 votos).
- Selo: "DUAS ROSE" com cara dupla.

### 11. P3 t13-t16: o tique mais caótico
- Ciano (Bombardeiro) planta bomba no Marrom, que o segue pela nave. Ciano t14: "Marrom está colado em mim e a bomba explode no tique 16, então preciso sair daqui agora." O Dourado avisa no chat: "não morre na sua própria bomba". A bomba explode no Corredor e mata os dois (evento "bomba", mortos Marrom e Ciano).
- Banana (Teletransportador) teleporta todos para o corpo que ele deixou: "Coral me viu com o corpo, então vou teletransportar todo mundo aqui agora pra confundir e dizer que fui puxado junto". Expulso.
- No mesmo tique o Laranja recruta o Cinza (cena 6) e o Dourado apaga as luzes. Montagem de 4 eventos em 15 s. Teletransportador: ideia de @arthurjosemartinsoliva3648 e @GUILHERM3235.

### 12. Engenheiro, profissão de risco (3 de 3)
- P1 t12 Preto expulso (16 votos, depois de o Xerife acertar o impostor Turquesa); P2 t18 Bordo expulso (14 votos); P4 t18 Roxo expulso (17 votos). O Engenheiro apareceu em 3 partidas e foi expulso nas 3.
- Memória do Laranja após a P2: "O Bordo de novo levou a torra como Engenheiro, igual o Preto levou na partida 1 — esses dois são os favoritos para serem acusados". 
- P1 t28-t31: com o verdadeiro Engenheiro já expulso, Amarelo e Laranja (impostores) dizem ser ele. Amarelo: "Sou Engenheiro, por isso usei o duto no Laboratório. Sobre Laranja, tem várias testemunhas; votem nele primeiro e depois esclarecemos a acusação contra Bordo." Caqui: "Só existe um Engenheiro, então ou Amarelo ou Laranja tá mentindo. O Laranja tem oito testemunhas, voto nele agora. Depois esclarecemos Rose e Bordo." O Laranja, t33: "Tava passando pelo Reator, o duto era atalho. Dourado, você viu o Amarelo no duto do Lab no mesmo tique, né?" Dois impostores expulsos seguidos (t31 e t33).
- Pensamento do Preto (t12, P1): "Eu sou Engenheiro, não estava no Refeitório no t4. Dourado pode estar mentindo ou confundido. Vermelho se declarou Xerife, mas o escudo do Turquesa e o tiro são suspeitos. Preciso me defender com fatos: estava no Reator com Verde e Azul no t4 e t12."
- P4 t73 o Roxo, já fantasma Anjo, protege a impostora: "Branco, Verde e Bordo já têm escudo ativo; vou proteger Amarelo que está sem proteção e parece tripulante pelos votos consistentes."

### 13. P4: sete inocentes expulsos antes do primeiro impostor
- Expulsões: t18 Roxo (Engenheiro), t21 Azul (Carrasco), t33 Vermelho (Policial), t36 Caqui (Detetive), t37 Coral, t39 Preto (Prefeito), t48 Laranja (Mecânico). O primeiro impostor expulso é o Ciano no t50 (6 votos). O Possuidor Cinza e o Dourado morreram por tiro e por casal.
- Final: Amarelo (Metamorfo) sobrevive se transformando em Rosa, Vermelho, Branco e Bordo. O Glutão Verde tenta devorá-la (t79: "Amarelo saiu de um duto aqui sozinho comigo: duto é coisa de impostor ou Engenheiro, e com só 1 impostor vivo ele é o suspeito perfeito para eu devorar sem corpo."), mas nada registra. O Ciano tinha matado a Rose no t47 ("Estou sozinho com o Rose no Escritório, sem testemunhas. Vou agir agora e depois sair pelo Corredor."). O Xerife Branco no t81 ainda tenta atirar no Bordo: "Bordo apareceu várias vezes sem ajudar a estabilizar; com o escudo ativo, vou arriscar o tiro nele." (nenhum disparo registrado). Empate 100/103.

### 14. Carrasco 0 de 4 (e os Carrascos achavam que eram o Palhaço)
- O Carrasco só vence se o alvo for expulso; os alvos: P1 Dourado, P2 Amarelo (morreu antes, vira Palhaço de verdade), P3 Caqui, P4 Vermelho. Nenhum venceu. Na P4 o Azul foi expulso no t21 e o alvo caiu depois, sem ele.
- Pensamentos: Roxo P1: "Sou Carrasco com alvo Dourado E Palhaço (quero ser expulso). Vou acusar Dourado com força - se funcionar, Dourado é expulso (Carrasco vence). Se falhar por parecer obsessivo, sou eu que caio (Palhaço vence). Win-win." Bordo P3 (t9): "Sou o Palhaço agora, então quero ser expulso. Vou dar um álibi fraco e jogar uma acusação meio forçada no Caqui — se colar, ganho como Carrasco; se desconfiarem de mim, ganho como Palhaço. De qualquer jeito é lucro." Bordo foi expulso com 17 votos.
- Ideia de @Pursuer_M4, @CarlosRaphaelLemesMedeiros e @guilhermgpd2 (Carrasco).

### 15. P3 t9, P2 t1 e o Palhaço que ninguém quis expulsar
- P3 t8-t9: o Dourado mata o Branco e denuncia o próprio corpo: "Fui eu: matei o Branco no Lab. Vou denunciar o corpo agora pra controlar a reunião". O Bordo é expulso com 17 votos.
- P2 t1: reunião no tique 1. Branco (Ladrão) pensa: "Vou chamar uma reunião sem motivo forte para parecer suspeito e provocar votos contra mim." e diz: "Não tinha prova nenhuma, apertei no impulso. Se acham suspeito, podem votar em mim." 20 pulos.
- P2 Lima (Palhaço): "Sou Palhaço, quero ser expulso. Ninguém me acusou, então vou me botar na mira: dar um álibi vago e desviar a atenção para Banana e Ciano, criando confusão sem confessar nada." Recebeu 1 voto em 6 reuniões (Cinza, t56).
- P2 t10: o Cinza (Policial) prende o impostor Laranja: "Laranja recebeu a maioria dos votos na reunião anulada e foi apontado como suspeito; vou prendê-lo antes que mate alguém no Corredor." Laranja usa a prisão de álibi.

## 4. Estrutura proposta (~29 min; melhor momento por último)
- 0:00-0:15 Abertura de clímax: P4 t18, o Roxo diz "Vi o Cinza usar duto AQUI no t18, na minha frente." e leva 17 votos. Corte seco, sem resolver.
- 0:15-0:45 Comentários que pediram (Policial, Ladrão, Carrasco, Teletransportador, Possuidor vivo, Mira HQ, Meta AI) com os selos "ideia de @".
- 0:45-1:10 Regras em 20 s com um exemplo na tela (20 IAs, 4 impostores, cartão de funções, o espectador vê tudo).
- 1:10-8:30 P1 "O impostor que voltou": cenas 1, 4, flash da 12.
- 8:30-15:30 P2 "Faltou uma tarefa": 9, 10 (com 15), fim 5.
- 15:30-21:30 P3 "O recruta e a heroína": 6, 11, 3.
- 21:30-27:30 P4 "Sete inocentes": 13 (resumo), 7, 8 e o payoff do t20/t49 (o Roxo estava certo). Parar no empate.
- 27:30-29:00 Fechamento em 3 passos: placar da temporada (3 verdades expulsas: Roxo, Vermelho, Rose; Carrasco 0/4; Possuidor 2 vezes), uma lição de uma frase, pergunta.
- Pergunta final sugerida: "Se você estivesse na mesa, em quem você teria votado no lugar do Roxo?"
- Se o Fable preferir fechar com a P3 (a heroína expulsa, o impostor em outro corpo), basta trocar a ordem P3 e P4; o payoff do Roxo no t20 precisa continuar no fim.
- Ritmo: ao menos 1 efeito a cada ~15 s; o cartão de estreia no começo de cada parte (P1 Possuidor/Policial/Carrasco/Ladrão/Teletransportador; P2 Juiz/Metamorfo; P3 Gangster/Bomba; P4 Glutão).

## 5. Títulos e miniaturas (a mesma promessa nos três)
- A (recomendada, a mais fiel ao fio do AU2): **Coloquei 20 IAs pra jogar Among Us (e a que falou a verdade levou 17 votos)**. Miniatura: "20 IAs" vermelho, o Roxo roxo sendo ejetado, balão "O CINZA ENTROU NO DUTO!", logos Claude, GPT, DeepSeek, Qwen, MiMo, GLM. O vídeo abre com essa cena.
- B: **Coloquei 20 IAs pra jogar Among Us (e o impostor expulso voltou no corpo de outra IA)**. Miniatura: "20 IAs" + Roxo roxo com silhueta amarela por dentro e a etiqueta "JÁ FOI EXPULSO". Se escolher este, a cena 1 vira a abertura.
- C: **Fiz as funções que vocês pediram no Among Us (e 20 IAs empataram faltando UMA tarefa)**. Miniatura: "106/107", Turquesa apontando, ícones SVG das 4 funções (algema, máscara, alvo, portal) com "PEDIDO DE VOCÊS". Se escolher este, a cena 5 sobe para o início.
- Em qualquer uma, nada de emoji no vídeo; selos e ícones em SVG.

## Conferência
- Script: scratchpad/verifica.py procurou cada fala entre aspas deste arquivo nos .txt, .json e memoria.json: as 80 falas reais foram achadas; as únicas "falhas" restantes são trechos entre aspas que são rótulos meus (selos, títulos), não falas.
- Contagens de votos conferidas no .json (16 Preto P1 t12; 14 Bordo P2 t18; 12 Laranja P2 t9; 11 Banana P2 t77; 17 Bordo P3 t9; 10 Cinza P3 t35; 6 Rose e 7 Coral P3 t83/t84; 17 Roxo P4 t18; 11 Vermelho P4 t33; 12 Caqui P4 t36; 11 Coral P4 t37).
