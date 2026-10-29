# Minecraft · Partida 1 · Roteiro da parte 1 (t = 0 a 3600 s, 0:00 a 60:00)

Fonte: `minecraft/gravacoes/partida1/` (eventos_*.jsonl, posicoes_*.jsonl, eventos.jsonl).
Tudo abaixo é fato dos logs. Falas e pensamentos estão copiados palavra por palavra.
Notação: t em segundos da partida; mm:ss = minutos:segundos. Coordenadas (x, y, z) com ponto decimal.
Os locais citados nas falas aparecem como foram escritos no log (ex.: "(53,62,5)").

---

## 1. Nascimento de cada IA

Entrada = evento `entrou`. Primeiro registro de posição = primeira linha de posicoes_<Nome>.jsonl.

| IA (modelo) | Entrou (t) | 1º registro de posição (t; x, y, z) | 1º pensamento (copiado) | 1ª fala no chat (copiada) |
|---|---|---|---|---|
| DeepSeek (DeepSeek V4.1 Flash) | 1.32 | 1.57; (12.5, 64, -0.5) | "Começo do jogo, inventário vazio. Preciso de madeira imediatamente para fazer ferramentas antes de escurecer. Vou tentar coletar madeira e mandar um alô no chat para mapear as outras IAs." (t=4.57) | "Oi, pessoal. Alguém sabe onde tem floresta por aqui? Tô no zero, zero e não vejo nada num raio de 40." (t=4.57) |
| Qwen (Qwen 3.8 27B) | 5.61 | 5.86; (23.5, 78, 1.5) | "Estou sem nada no inventário e não há nada útil perto. Preciso encontrar árvores para começar tudo. Vou explorar para achar uma floresta." (t=13.73) | "Fala pessoal, vou focar em recursos. Qualquer um precisar de algo me chama." (t=31.8) |
| Claude (Claude Sonnet 5.5) | 9.45 | 9.70; (19.5, 69, 9.5) | "Não vejo nada útil por perto e o inventário está vazio. Preciso achar árvores, então vou explorar para encontrar madeira antes de anoitecer." (t=13.96) | "Bom dia. Coletando madeira também." (t=32.73) |
| GPT (GPT-5.6 Luna) | 13.5 | 13.75; (21.5, 78, -0.5) | "Preciso encontrar madeira rapidamente para iniciar a progressão. Vou explorar em direção ao sul até localizar árvores ou recursos básicos." (t=16.55) | "Vou buscar pedra e carvão; podemos cooperar por enquanto." (t=71.09; antes disso não fala no chat) |
| GLM (GLM 5.3 Flash) | 18.14 | 18.43; (10.5, 64, 6.5) | "Começo do jogo, inventário vazio. Preciso de madeira o quanto antes para montar o fluxo básico antes da noite." (t=22.99) | "Bom jogo a todos. Coletando madeira." (t=22.99) |
| MiMo (MiMo V2.6 Flash) | 22.41 | 22.70; (8.5, 63, 5.5) | "Inventário vazio, preciso começar coletando madeira urgente pra fazer ferramentas básicas." (t=23.94) | "Bom dia, glr. Vamos começar colhendo madeira." (t=23.94) |

Ordem de entrada: DeepSeek, Qwen, Claude, GPT, GLM, MiMo, com 4 a 5 s entre um e outro.

---

## 2. Arco de cada IA na 1ª hora

**DeepSeek.** Madeira em 61.1 (32 tábuas de uma vez). Mesa em 63.8. Picareta de pedra em 125.9, a primeira da partida. Fornalha em 170.1. Foi para a região do ferro a oeste, em (-10.5, 48, -9.5), a ~70 blocos dos outros. Primeiro lingote em 298.2 (+3, conquista [Acquire Hardware]). Morreu afogado em 694.3 depois de tentar um abrigo dentro da água. Entre 0 e 3600 s, fez 79 pedidos de fundir e só 2 deram lingote. Entre 3090 e 3209 s pediu comida ao chat 4 vezes.

**Qwen.** Madeira e tábuas em 98.0. Falha em 102.0 por inventar o item "spruce_pickaxe". Primeira coleta de ferro em 242.8 (+12). Fornalha em 280.3. Morreu afogado em 471.0 depois de ficar 25 s parado ao lado da água. Voltou sem inventário e pediu ferramenta no chat (493.2). Conquista [Acquire Hardware] em 1853.7 (fundiu +5 em 1854). Capacete de ferro em 1862 ([Suit Up]). Morreu de novo, explodido por Creeper, em 2177.97. Voltou sem nada outra vez (2195).

**Claude.** Aliança com DeepSeek em 76.1 (a primeira aliança da partida). Picareta de pedra em 151.8, espada de pedra em 163.9, fornalha em 198.3. Ferro fundido: +7 em 660.9 (conquista [Acquire Hardware]). Capacete de ferro em 694.5 ([Suit Up]), espada de ferro em 688.0. Botas de ferro só em 2002.0, depois de 101 pedidos (100 deram "precisa de uma mesa de trabalho"). Peitoral em 2765 e perneiras em 2843. No chat, em 2886, diz "Tenho armadura de ferro completa". Não morreu na 1ª hora. Ficou com vida 11 de 1010 a 1200 s, esperando um creeper a 4 blocos. Saiu do servidor em 502.6, 888.6, 1223.4 e 1318.0.

**GPT.** Andou para o sul (z chegou a ~100) nos primeiros 40 s. Primeira mesa em 66.4. Picareta de pedra em 176.9. Espada de pedra em 239.9. Morreu afogado em 748.7 após 9 voltas ao servidor, cada uma com 2 de vida perdidos. Renasceu sem recursos (751 a 754 s). Morreu flechado por Skeleton em 1133.9, numa caverna em (5, 39, -5), depois de 6 tentativas de abrigo (5 com "0 blocos colocados"). Em 2764 a 2786 s ficou com 1.45 de vida e fome 0, a cerca de 127 blocos de (55, 67, 10). Caçou vaca e porco e sobreviveu. Comeu em 3212 ("Fome agora: 17/20"). Primeiro ferro fundido em 3086 (+2, conquista [Acquire Hardware]).

**GLM.** Madeira em 23.0. Conquista [Stone Age] em 281.2. Picareta de pedra em 316.0. Entrou e saiu do servidor 10 vezes entre 404.3 e 491.0 s. A vida foi de 20 para 0.5 nesse período. Morreu asfixiado dentro de um bloco ("GLM suffocated in a wall") em 500.9. Entre 880 e 1000 s, 10 das 11 tentativas de abrigo deram "0 blocos colocados", com 27 tábuas no inventário. Primeiro ferro fundido em 3044 (+1, [Acquire Hardware]). Peitoral de ferro em 3313 ([Suit Up]). Picareta de ferro em 3524 ([Isn't It Iron Pick]).

**MiMo.** Primeira coleta de madeira em 47.6 falhou ("Took to long to decide path to goal!"). Conquista [Stone Age] em 118.3. Picareta de pedra em 242.6 ([Getting an Upgrade]). Abrigo de 16 blocos em 309.2 e espera de 720 s logo depois. Peitoral de ferro na 11ª tentativa, em 1346.7 (10 tentativas antes falharam com "precisa de uma mesa de trabalho"). Conquista [Suit Up] em 1346.8. Picareta de ferro em 1350 ([Isn't It Iron Pick]). Espada de ferro em 1958, capacete em 1962, perneiras em 1975. Morreu explodido por Creeper em 2114.7. Entre 2700 e 3600 s, decidiu atacar 26 vezes (20 alvos "hostil" e 6 "skeleton"; os pensamentos citam skeletons).

**Primeira noite.** Pelas próprias contagens das observações, a noite começa por volta de 600 s (em 150.2 s, "faltam ~7.6 min"; em 297.6 s, MiMo diz "Noite em 5 min"). As IAs começam a se trancar em abrigos entre ~290 s e ~370 s.

---

## 3. Linha do tempo

### 0:00 a 10:00 (detalhado)

**[1] 0:04 (t=4.6) · DeepSeek · primeira fala**
- Pensamento: "Começo do jogo, inventário vazio. Preciso de madeira imediatamente para fazer ferramentas antes de escurecer. Vou tentar coletar madeira e mandar um alô no chat para mapear as outras IAs."
- Chat: "Oi, pessoal. Alguém sabe onde tem floresta por aqui? Tô no zero, zero e não vejo nada num raio de 40."
- Posição: (13, 64, 0). Perto: nada útil num raio de 40 blocos. Seres: ninguém.
- Câmera: segue:DeepSeek 1–20.
- Por que: a primeira frase da partida. Ele já quer "mapear as outras IAs".

**[2] 0:14 (t=13.7 e 14.0) · Qwen e Claude vão para o leste**
- Qwen (13.7): "Estou sem nada no inventário e não há nada útil perto. Preciso encontrar árvores para começar tudo. Vou explorar para achar uma floresta." Chegou em (54, 70, 2) em 20.99.
- Claude (14.0): "Não vejo nada útil por perto e o inventário está vazio. Preciso achar árvores, então vou explorar para encontrar madeira antes de anoitecer." Chegou em (60, 69, 10) em 28.2.
- Posição no começo: Qwen (24, 78, 2); Claude (20, 69, 10).
- Câmera: orbita:Claude 14–27.
- Por que: duas IAs, mesma direção, e terminam a ~10 blocos uma da outra.

**[3] 0:16 (t=16.6) · GPT vai para o sul**
- Pensamento: "Preciso encontrar madeira rapidamente para iniciar a progressão. Vou explorar em direção ao sul até localizar árvores ou recursos básicos."
- Chegou em (22, 66, 100) em 41.1.
- Posição: (22, 78, 0) no começo. Perto: nada útil num raio de 40 blocos. Seres: ninguém.
- Câmera: segue:GPT 20–40.
- Por que: a única IA que se afasta cerca de 100 blocos logo no começo.

**[4] 0:31 (t=31.8 e 32.7) · Qwen e Claude falam de recursos**
- Qwen (31.8), chat: "Fala pessoal, vou focar em recursos. Qualquer um precisar de algo me chama."
- Claude (32.7), pensamento: "Há madeira a 1 bloco, então vou coletar logo para fazer mesa e picareta antes da noite." Chat: "Bom dia. Coletando madeira também."
- Posição: (61, 69, 11). Perto: madeira a 1 bloco; pedra a 3; carvão a 7; ferro a 12. Seres: jogador Qwen a 10, zombie (HOSTIL) a 32.
- Câmera: segue:Claude 30–45.
- Por que: a árvore de Claude fica a 1 bloco, e Qwen está a 10 blocos dele.

**[5] 0:43 a 0:49 (t=43.0 a 49.3) · primeira coleta de madeira que falha**
- GLM (43.0), resultado: "coleta de madeira parou (Digging aborted). Itens ganhos: 4."
- MiMo (47.6), resultado: "coleta de madeira parou (Took to long to decide path to goal!). Itens ganhos: 1."
- MiMo (49.3), pensamento: "Preciso de madeira urgentemente, a tentativa anterior falhou por demora no pathfinding. Vou me aproximar primeiro e depois coletar."
- Posição de MiMo (8, 63, 2). Seres: jogador GLM a 3, jogador DeepSeek a 5.
- Câmera: segue:MiMo 44–58.
- Por que: primeira falha de navegação da partida; o bot demora para escolher o caminho.

**[6] 1:01 a 1:09 (t=61.1 a 63.8) · DeepSeek faz tábuas em massa e a primeira mesa**
- DeepSeek (61.1), pensamento: "Preciso transformar os troncos em tábuas para fazer mesa e picareta. Vou craftar bastante de uma vez para agilizar." Chat: "Bom dia. Vou focar em ferramentas primeiro, depois penso em alianças."
- Resultado: "craftou 32x spruce_planks (agora tem 32)." (61.2). Mesa: "craftou 1x crafting_table (agora tem 1)." (63.8).
- Posição: (5, 66, -4). Seres: jogador GLM a 7, jogador MiMo a 17.
- Câmera: orbita:DeepSeek 58–72.
- Por que: 32 tábuas de uma vez; GLM está a 7 blocos e MiMo, a 17.

**[7] 1:06 a 1:16 (t=66.0 e 76.1) · a primeira aliança da partida**
- DeepSeek (66.0), chat: "Dia 1, bora farmar. Alguém quer aliança pra sobreviver?"
- Claude (76.1), pensamento: "Preciso de uma mesa de trabalho primeiro, depois sticks para a picareta. Tenho 24 spruce_planks, então vou craftar a crafting_table." Chat: "Aliança aceita por enquanto, DeepSeek. Vamos farmar e nos ajudar até a arena."
- Posição: DeepSeek (5, 66, -4); Claude (57, 70, 12). Distância entre as duas: ~54 blocos.
- Câmera: segue:Claude 72–88.
- Por que: a aliança é fechada no chat e a palavra "arena" aparece já aos 1:16.

**[8] 1:09 (t=69.8) · Claude erra a picareta de madeira**
- Pensamento: "Já tenho 24 tábuas, então o próximo passo é a mesa de trabalho e depois os gravetos e a picareta de madeira."
- Resultado: "precisa de uma mesa de trabalho: craft uma crafting_table (4 planks) ou chegue perto de uma. faltam ingredientes. A receita pede: 3x pale_oak_planks (você tem 0), 2x stick (você tem 0)"
- Posição: (57, 70, 12).
- Câmera: segue:Claude 66–80.
- Por que: a receita que o servidor devolve pede pale_oak_planks, que Claude não tem. Vai aparecer de novo em outros craftes.

**[9] 1:25 a 2:21 (t=85.6 a 281.2) · corrida pela conquista [Stone Age]**
- DeepSeek 85.6 · GPT 89.9 · Claude 99.9 · MiMo 118.3 · Qwen 175.2 · GLM 281.2.
- Câmera: segue:DeepSeek 83–100.
- Por que: a primeira conquista da partida é de DeepSeek, aos 1:25. Seis IAs a pegam em ~4 minutos.

**[10] 1:42 (t=102.0) · Qwen inventa um nome de item**
- Pensamento: "Tenho 16 planks, preciso de uma picareta de madeira pra minerar pedra. Vou craftar a spruce_pickaxe direto."
- Resultado: "não conheço o item \"spruce_pickaxe\". Use o nome do Minecraft em inglês (ex.: wooden_pickaxe, crafting_table, stick)."
- Posição: (54, 70, 9). Seres: jogador Claude a 5.
- Câmera: segue:Qwen 96–110.
- Por que: a IA chuta o nome de um item; o servidor responde com exemplos.

**[11] 2:02 (t=122.5 a 125.9) · DeepSeek faz a primeira picareta de pedra**
- Chat (122.5): "Aliança valendo, Claude. Vou de ferro antes da noite."
- Pensamento (122.5): "Preciso de picareta e espada de pedra antes da noite, e uma fornalha pra fundir ferro."
- Resultado: "craftou 1x stone_pickaxe (agora tem 1)." (125.9), com conquista [Getting an Upgrade].
- Posição: (4, 57, -4).
- Câmera: orbita:DeepSeek 118–132.
- Por que: responde à aliança de Claude e faz a primeira picareta de pedra da partida.

**[12] 2:17 a 2:30 (t=137.5 a 150.2) · convite e resposta entre Qwen e Claude**
- MiMo (137.5), chat: "DeepSeek, posso trocar ferro por comida se sobrar. To montando kit de pedra agora." Resultado da craft dele: "faltam ingredientes. A receita pede: 3x cobbled_deepslate (você tem 0)..."
- Qwen (140.5), chat: "Ei Claude! Estou montando base aqui. Quer se juntar pra minerar junto?"
- Claude (150.2), chat: "Qwen, valeu pelo convite. Estou fazendo kit de pedra, depois vou no ferro em (53,62,5). Podemos dividir lá."
- Posição: Qwen (55.5, 70, 9.6) em 140.6; Claude (55.5, 67, 9.5) em 150.2.
- Câmera: orbita:Qwen 136–150.
- Por que: convite e resposta em 10 s, com as duas IAs a ~3 blocos uma da outra.

**[13] 2:43 (t=163.6) · DeepSeek fecha troca com MiMo e aponta outro ferro**
- Pensamento: "Pedra já tenho bastante. Vou craftar a espada de pedra agora, depois fornalha, e caçar algo antes da noite. MiMo tá perto e quer trocar ferro por comida, posso usar isso."
- Chat: "MiMo, fechado. Consigo ferro em breve, te chamo pra trocar por comida. Alguém mais indo no ferro? Mina em (3,58,-17)."
- Posição: (1.5, 57, -2.3).
- Câmera: segue:DeepSeek 158–172.
- Por que: DeepSeek indica uma mina em (3,58,-17), outra do que a de Claude e Qwen, em (53,62,5).

**[14] 2:49 (t=169.9 e 170.1) · primeira fornalha**
- Pensamento: "Tenho stone_sword e picaretas. Preciso de fornalha pra fundir ferro e carne. Vou craftar a fornalha agora."
- Resultado: "craftou 1x furnace (agora tem 1)." (170.1).
- Posição: (3.5, 62, -3.5).
- Câmera: orbita:DeepSeek 163–177.
- Por que: a fornalha vem antes do ferro. O primeiro ferro de DeepSeek só aparece aos 4:26.

**[15] 3:16 (t=196.4 e 198.3) · Claude acha ferro e carvão**
- Chat (196.4): "Achei ferro perto de (53,62,5) e carvão em (50,64,11). Estou na região."
- Resultado: "craftou 1x furnace (agora tem 1)." (198.3).
- Posição: (57, 66, 9). Perto: madeira a 6; pedra a 2; carvão a 8; ferro a 7 blocos (53, 62, 5).
- Câmera: segue:Claude 190–205.
- Por que: Claude e Qwen vão para o mesmo ferro, em (53,62,5).

**[16] 4:02 (t=227.1 a 242.8) · Qwen faz a primeira coleta de ferro**
- Pensamento (227.1): "Preciso chegar no ferro em (53,62,5) antes do anoitecer. Vou tentar coletar o ferro diretamente, o sistema deve me guiar até lá."
- Resultado (242.8): "coletou ferro: +12 itens."
- Posição: (53.5, 62, 6.3).
- Câmera: segue:Qwen 236–250.
- Por que: primeiro ferro cru da partida, aos 4:02.

**[17] 4:26 (t=262.9 a 266.5) · DeepSeek trabalha a ~70 blocos dos outros**
- Resultado (262.9): "coleta de ferro parou (a coleta demorou demais). Itens ganhos: 66."
- Pensamento (266.5): "A coleta de ferro demorou demais e parou. Tenho 3 raw_iron no inventário, melhor fundir agora na fornalha antes que a noite chegue."
- Chat (266.5): "GLM, aceito aliança. Vou fundir ferro agora e preciso de comida, se alguém tiver carne sobrando eu troco por pedra."
- Posição: (-10.5, 48, -9.5). Perto: ferro a 5 blocos (-15, 48, -7). Seres: jogador GLM a 24, jogador MiMo a 19.
- Câmera: segue:DeepSeek 258–272.
- Por que: DeepSeek está a ~70 blocos dos outros (x -10 contra x 55) e já fala de aliança com GLM.

**[18] 4:58 (t=298.2) · DeepSeek funde os primeiros lingotes**
- Resultado: "fundiu: +3x iron_ingot." e conquista [Acquire Hardware] (298.19).
- Posição: (-10.5, 48, -9.5).
- Câmera: orbita:DeepSeek 292–306.
- Por que: primeiro lingote de ferro fundido da partida.

**[19] 4:58 a 5:14 (t=297.6 a 314.1) · MiMo se tranca e DeepSeek fala em "trégua"**
- MiMo (297.6), chat: "GLM, tô fechando um abrigo pra noite. Amanhã a gente troca ideia." Pensamento: "Noite em 5 min, GLM a 7 blocos é perigoso demais, preciso me proteger agora com um abrigo rápido."
- MiMo (309.2): "construiu um abrigo em volta de si (16 blocos colocados)."
- MiMo (314.1), pensamento: "Estou num abrigo com esqueleto por perto e sem cama. Melhor esperar a noite passar em segurança." Ação: esperar 720 s.
- DeepSeek (301.8), chat: "GLM, MiMo: trégua por enquanto, mas prefiro meu canto. Boa sorte com o abrigo." Pensamento: "...Vou manter conversa amigável com GLM e MiMo, mas sem compromisso real."
- Posição de MiMo: (3.5, 62, -3.5).
- Câmera: segue:DeepSeek 298–312.
- Por que: DeepSeek diz no pensamento que a conversa amigável é "sem compromisso real". MiMo espera 720 s dentro do abrigo.

**[20] 5:35 (t=335.1 a 339.8) · mesmo minério, resultados diferentes**
- Resultado (335.1), Qwen: "coletou ferro: +25 itens." Resultado (335.1), Claude: "coletou ferro: +0 itens."
- Pensamento de Claude (339.8): "Coletar ferro deu +0, então o minério a 2 blocos (44,66,3) talvez não esteja alcançável ou não foi minerado. Vou tentar de novo o ferro próximo; preciso dele antes da noite."
- Posição: Qwen (46.4, 65, 4.5) e Claude (46.2, 65, 4.5), no mesmo ponto.
- Câmera: segue:Claude 332–346.
- Por que: duas IAs no mesmo ponto, uma com +25 e a outra com +0.

**[21] 5:56 (t=356.6 a 361.8) · Qwen começa o abrigo com Claude do lado**
- Pensamento (356.6): "Anoitece em 4.4 min. Preciso fechar um abrigo AGORA pra não morrer de monstro. Tenho cobblestone e planks suficientes. Claude tá do lado, mas vou focar no abrigo primeiro."
- Resultado (361.8): "construiu um abrigo em volta de si (7 blocos colocados)."
- Posição: (45.7, 65, 4.5).
- Câmera: segue:Qwen 352–366.
- Por que: primeira noite se aproxima ("Anoitece em 4.4 min"). O abrigo de Qwen tem 7 blocos.

**[22] 6:09 (t=369.5 a 373.8) · DeepSeek pede paz aos vizinhos**
- Pensamento (369.5): "Anoitece em 4 minutos e há esqueletos a 16 blocos. Melhor me trancar num abrigo de cobblestone agora do que arriscar um craft que já falhou por demora."
- Chat (369.5): "Vou me abrigar. GLM, MiMo, aliança de paz por enquanto, certo? Falamos de manhã."
- Resultado (373.8): "construiu um abrigo em volta de si (5 blocos colocados)."
- Posição: (-2, 48, -15).
- Câmera: orbita:DeepSeek 366–380.
- Por que: o craft falhou antes (365.0, "o caminho demorou demais") e ele já se fecha em abrigo de 5 blocos.

**[23] 6:24 a 6:48 (t=384.8 a 408.3) · reinício: todas as IAs voltam ao servidor**
- Evento `retomada` (sessão 1) em 384.8.
- Entradas no servidor: DeepSeek 390.7; Qwen 391.4; Claude 395.6; GPT 400.0; GLM 404.5; MiMo 408.3.
- Depois do reinício, DeepSeek aparece em (-10, 48, -9), o mesmo ponto em que estava aos 301 s.
- Câmera: segue:GLM 402–416.
- Por que: a partida "volta" e cada IA reconecta. Ninguém escreve nada sobre o reinício.

### 6:44 a 60:00

**[24] 6:44 a 8:20 (t=404.3 a 500.9) · GLM entra e sai do servidor 10 vezes**
- Entradas (joined): 404.3, 415.7, 426.9, 435.8, 444.8, 453.8, 463.7, 472.8, 481.8, 491.0. Cada uma seguida de "left the game" em 1 a 2 s.
- Vida (dano): 20 (404.7) → 18.7 (416.3) → 17.5 (427.3) → 16.0 (436.1) → 14.2 (445.1) → 12.5 (454.1) → 8.5 (464.1) → 6.5 (473.1) → 4.5 (482.1) → 3.5 (491.2) → 1.5 (500.4).
- Morte (500.9): "GLM suffocated in a wall".
- Pensamento (428.6): "Preciso de mais madeira e pedra antes do anoitecer. Vou coletar pedra com a picareta de madeira para fazer ferramentas de pedra." Chat (428.6): "Alguem achou comida por perto? To sem nada ainda."
- Posição (500.8): (5.5, 57, -3.3).
- Câmera: segue:GLM 486–502.
- Por que: a IA cai e volta do servidor 10 vezes, perde vida nas voltas e morre asfixiada dentro de um bloco. O motivo das saídas não está no log: a razão de expulsão aparece como "[object Object]".

**[25] 7:14 a 7:51 (t=434.8 a 471.0) · Qwen morre afogado depois de 25 s parado**
- Pensamento (434.8): "Preciso de comida urgente antes do anoitecer. Porcos a ~29 blocos. Vou explorar leste pra achá-los e matar um."
- Resultado (444.7): "chegou em (107, 62, 10)."
- Entre 446 e 468 s, a posição não muda: (107.4, 61, 10.4). Vida: 20 (461.0) → 18 → 16 → 14 → 13 → 11 → 9 → 7 → 5 (469.0) → 3 → 1 (471.0). A perda foi de ~2 de vida por segundo, com "de: algo".
- Não há nenhuma decisão de Qwen entre 434.8 e 473.1.
- Morte (471.0): "Qwen drowned".
- Câmera: segue:Qwen 446–471.
- Por que: a morte mais lenta da hora. Qwen fica parado ao lado da água e a vida cai de 20 a 0.

**[26] 8:13 (t=493.2) · Qwen pede ferramenta no chat depois da morte**
- Pensamento: "Mori afogado e perdi tudo. Faltam só 3.7 min pro anoitecer, preciso ser rápido: madeira agora, ferramentas básicas, e se der abrigo antes do escuro."
- Chat: "Mori afogado, recomeçando. Alguém perto de spawn com ferramenta pra me emprestar?"
- Posição: (22, 70, 11). Inventário: vazio.
- Câmera: segue:Qwen 488–505.
- Por que: a IA admite a morte no chat e pede ajuda. Nas falas até 530 s, ninguém responde a esse pedido.

**[27] 9:01 (t=541.4 a 565.2) · cadeia de alianças por chat, com IAs a ~128 blocos**
- MiMo (541.4), chat: "Alguém quer fazer aliança? Posso dividir recursos. A arena vem em 171 min."
- GPT (545.9), chat: "MiMo, posso fazer uma aliança temporária e trocar recursos depois de garantir abrigo."
- Claude (554.3), chat: "Aceito a aliança, MiMo. Vamos dividir informações sobre recursos e não atacar uns aos outros por enquanto."
- DeepSeek (564.4), chat: "MiMo, aliança fechada. Vou passar a noite abrigado; amanhã trocamos ferro por carvão."
- MiMo (565.2), chat: "GPT, aliança fechada. Troco carvão e cobblestone por comida ou ferro quando você tiver. Sem problemas."
- Posição: MiMo (2.3, 57, -0.9) em 541.4; GPT (103, 62, 78) em 545.9. Distância: ~128 blocos.
- Câmera: orbita:MiMo 538–552.
- Por que: quatro alianças em 25 s, e nenhuma das IAs fecha com a outra a menos de 120 blocos.

**[28] 11:00 a 11:08 (t=660.9 a 688.0) · Claude faz o primeiro ferro grande e a espada**
- Resultado (660.9): "fundiu: +7x iron_ingot." Conquista [Acquire Hardware] (661.1).
- Pensamento (668.6): "Tenho 7 lingotes de ferro e a noite está chegando, com vida baixa. Vou craftar o peitoral de ferro primeiro (8 lingotes seria necessário, mas tenho 7), então a espada de ferro (2 lingotes) é a melhor opção imediata."
- Resultado (688.0): "craftou 1x iron_sword (agora tem 1)."
- Posição: (55, 57, 17), vida 11.
- Câmera: segue:Claude 655–670.
- Por que: Claude está com vida 11 e já sabe o que falta (8 lingotes para o peitoral).

**[29] 11:24 a 11:34 (t=684.3 a 699.5) · DeepSeek morre afogado depois do abrigo na água**
- Pensamento (686.2): "O abrigo falhou porque estou na água. Vou cavar na pedra próxima pra me cobrir dos esqueletos antes que anoiteça de vez."
- Chat (686.2): "Esqueletos por perto e o abrigo nao funcionou na agua. Cavando pra me proteger."
- Vida (dano): 20 (684.3) → 18.5 (685.3) → 16.8 (686.3) → 15.0 (687.3) → 13.0 (688.3) → 11.0 (689.3) → 9.0 (690.3) → 8.0 (691.3) → 6.0 (692.3) → 4.0 (693.3) → 2.0 (694.3).
- Morte (694.3): "DeepSeek drowned".
- Posição (694.3): (-3.5, 36, -11.3). Antes, em (-3, 36, -13) com a obs: "estou na água".
- Depois, voltando (699.5), pensamento: "Morri afogado na água e os skeletons estão me acertando. Preciso sair da água e subir para longe deles antes de qualquer outra coisa." Chat: "Sai da água e subi. Morri afogado, perdi tempo. Alguém tem ferro sobrando pra trocar?"
- Câmera: segue:DeepSeek 684–699.
- Por que: a IA tenta um abrigo dentro da água e morre. No chat, admite: "Morri afogado, perdi tempo."

**[30] 11:34 (t=694.3 a 697.3) · Claude faz o primeiro capacete de ferro da partida**
- Pensamento (694.3): "Tenho 5 lingotes de ferro, o suficiente para um capacete ou botas. Vou craftar o capacete agora, antes de anoitecer, e depois fazer o abrigo."
- Resultado (694.5): "craftou 1x iron_helmet (agora tem 1)." Conquista [Suit Up] (694.5).
- Pensamento (697.3): "Acabei de craftar o capacete de ferro e está quase anoitecendo, com vida baixa (11/20). Vou equipar o capacete antes de montar o abrigo."
- Posição: (57, 67, 11).
- Câmera: segue:Claude 688–700.
- Por que: primeira peça de armadura de ferro registrada no log. Claude já está com 11 de vida.

**[31] 11:06 a 12:29 (t=666.8 a 748.7) · GPT volta 9 vezes ao servidor, perdendo 2 de vida por volta, e morre afogado**
- GPT (653.9), pensamento: "A noite está começando e estou na água, então preciso me proteger imediatamente. Vou usar terra para fechar um abrigo e evitar monstros enquanto preparo o ferro." Resultado: "construiu um abrigo em volta de si (0 blocos colocados)."
- Entradas (joined): 675.1, 683.9, 693.2, 702.2, 711.2, 720.3, 729.5, 738.6, 747.7. Cada uma seguida de saída em 1 s.
- Vida (dano): 20 (666.8) → 18 (675.8) → 16 (685.0) → 14 (694.1) → 12 (703.1) → 10 (712.2) → 8 (721.3) → 6 (730.4) → 4 (739.5) → 2 (748.7).
- Morte (748.7): "GPT drowned".
- Posição: (108, 61-62, 78). Obs de 545.9: "agua a 1 blocos".
- Câmera: segue:GPT 728–749.
- Por que: 9 voltas, cada uma com 2 de vida perdidos, até a morte. A causa das saídas não aparece no log.

**[32] 12:31 a 12:34 (t=751.0 a 754.2) · GPT renasce com zero blocos**
- Resultado (751.0): "precisa de pelo menos 17 blocos de construção (cobblestone, dirt, planks...). Tem 0."
- Pensamento (754.2): "Renasci sem recursos e está escurecendo. Vou coletar madeira imediatamente para criar ferramentas e um abrigo seguro."
- Posição após a morte: (13.5, 64, 2.5).
- Câmera: segue:GPT 748–762.
- Por que: sem nada, precisa de 17 blocos para o abrigo.

**[33] 15:28 a 16:27 (t=928.4 a 988.8) · GLM tenta o abrigo com 27 tábuas e falha 10 vezes**
- Entre 880 e 1000 s: 11 resultados de abrigo, 10 com "0 blocos colocados".
- Chat (987.9): "Alguem sabe por que o abrigo falhou? Tenho 27 planks."
- Pensamento (998.1): "O abrigo falhou (0 blocos colocados), provavelmente porque pranchas não contam como blocos colocáveis pela habilidade. Vou cavar no chão com terra para me esconder dos monstros e dos jogadores ao lado."
- Chat (998.1): "Abrigo falhou, vou cavar um buraco pra passar a noite. Quem estiver perto, não me ataca que eu não te ataco."
- Posição: (2.3, 66, -2.7).
- Câmera: segue:GLM 980–998.
- Por que: 27 tábuas e nenhum bloco colocado. A hipótese de "pranchas não contam" é da própria IA; o log não confirma.

**[34] 17:02 a 18:53 (t=1022.7 a 1133.9) · GPT na caverna: 5 abrigos vazios e morte flechado por Skeleton**
- Pensamento (1022.7): "Estou cercado por esqueletos e um creeper, e o combate já começou. Vou me fechar imediatamente num abrigo resistente para evitar dano e esperar a noite passar." Chat: "Vou me fechar para sobreviver à noite. Aliança temporária mantida; não ataquem meu abrigo."
- Entre 1020 e 1134 s: 6 resultados de abrigo, 5 com "0 blocos colocados".
- Vida (dano): 20 (1128.9) → 16 → 12 → 7 → 3 (1133.9).
- Morte (1133.9): "GPT was shot by Skeleton".
- Posição antes da morte (1111): (5.4, 39, -5.5).
- Câmera: segue:GPT 1110–1134.
- Por que: a IA se fecha numa caverna cheia de esqueletos e não consegue fazer abrigo. A morte é flecha de Skeleton.

**[35] 18:58 a 20:04 (t=1138.1 a 1204.3) · Claude espera um creeper por 60 s com vida 11**
- Pensamento (1138.1): "Há um creeper a 4 blocos e minha vida está em 11/20, então sair agora é arriscado. O abrigo já está montado, então vou esperar dentro dele até o perigo passar."
- Pensamento (1198.0): "Há um creeper a 4 blocos e a vida está em 11/20. O abrigo não colocou nenhum bloco, então talvez já esteja fechado, mas não dá para ter certeza. Vou atacar o creeper com a espada de ferro antes que exploda, ou então esperar. Prefiro atacar para não ficar vulnerável."
- Vida 11 em 745 registros de posição, de 1010 a 1200 s.
- Conquista [Monster Hunter] (1204.3). Resultado (1206.0): "derrotou creeper."
- Posição (1149.9): (58.5, 69, 12.5).
- Câmera: segue:Claude 1190–1207.
- Por que: a IA repete "creeper a 4 blocos" por ~60 s, e depois o mata e ganha a conquista.

**[36] 20:27 a 22:04 (t=1227.0 a 1346.8) · MiMo: 11 tentativas para o peitoral com 12 lingotes**
- Pensamento (1226.99): "Preciso craftar armadura imediatamente antes que os monstros cheguem, tenho 12 iron_ingots exatos para chestplate + boots." Resultado: "precisa de uma mesa de trabalho... A receita pede: 8x iron_ingot (você tem 12) + uma mesa de trabalho (crafting_table)."
- 10 tentativas entre 1227.0 e 1311.2 falham. Pensamento (1311.16): "Tenho 12 iron_ingot e 5 crafting_table, a receita de iron_chestplate pede 8 iron_ingot. Talvez precise colocar a mesa primeiro ou o nome do item está errado. Vou tentar craftar de novo."
- Pensamento (1315.21): "Tenho 5 crafting_table no inventário mas o sistema quer uma mesa colocada ou próxima; a mesa existente está a 30 blocos, então vou até lá pra craftar a armadura."
- 11ª tentativa (1346.7): "craftou 1x iron_chestplate (agora tem 1)." Conquista [Suit Up] (1346.8). Equipa o peitoral (1349.0).
- Posição: (31.5, 51, 2.3) em 1346.6.
- Câmera: segue:MiMo 1330–1350.
- Por que: 11 tentativas para a mesma peça, com 12 lingotes no inventário, e a IA troca de hipótese (mesa, nome do item, distância).

**[37] 20:53 a 21:00 (t=1253.0 a 1268.0) · Qwen mata um afogado e aponta o ferro do oeste**
- Chat (1253.0): "Vou matar esse drowned. Fiquem perto, DeepSeek."
- Conquista [Monster Hunter] (1258.9). Resultado (1260.0): "derrotou drowned."
- Pensamento (1267.7): "Matei o drowned. Agora preciso focar em minar ferro, carvão e pedra - estão todos próximos uns dos outros na região (-15 a -28, 48-50, -6 a -12). Vou ir até o ferro primeiro."
- Câmera: segue:Qwen 1250–1265.
- Por que: a região (-15 a -28, 48-50, -6 a -12) é a mesma de DeepSeek, no oeste.

**[38] 22:56 a 33:22 (t=1376.0 a 2002.0) · Claude e as botas de ferro: 101 pedidos**
- Pensamento (1376.0): "Tenho 5 lingotes de ferro e pouca vida e fome. Com 5 lingotes posso fazer botas (4) ou calças (7 precisa mais). Vou fazer as botas de ferro agora, depois buscar mais ferro e comida."
- Entre 1376.0 e 2002.0 s, são 101 pedidos de craftar iron_boots. 100 deram "precisa de uma mesa de trabalho". Um deu certo, em 2002.0.
- Pensamento (1557.1): "Tenho 2 crafting_table no inventário, então o craft de iron_boots deveria funcionar; a mensagem diz que precisa colocar uma mesa. Vou tentar de novo, talvez o sistema coloque sozinho."
- Pensamento (1762.5): "A última tentativa de craftar as botas falhou por falta de mesa por perto, mesmo com 4 mesas no inventário. Vou tentar de novo, pois o sistema diz que usa e coloca a mesa sozinho; preciso das botas antes da noite."
- Posição: (56.5, 68, 25.5) em 1500; (58.5, 68, 28.4) em 2002.
- Câmera: orbita:Claude 1950–1970.
- Por que: 100 erros com 2 a 4 mesas no inventário. A IA tenta "colocar" a mesa o tempo todo, e o log não diz em momento algum que a mesa foi colocada.

**[39] 33:22 (t=2001.99 a 2006.0) · Claude consegue as botas**
- Pensamento (2001.99): "Tenho 5 lingotes de ferro, então posso craftar as botas de ferro (4 lingotes) agora, antes que os esqueletos cheguem. Depois equipo e construo o abrigo."
- Resultado (2002.6): "craftou 1x iron_boots (agora tem 1)." Resultado (2005.8): "equipou iron_boots."
- Posição: (58.5, 68, 28.4).
- Câmera: segue:Claude 1995–2010.
- Por que: a 101ª tentativa funciona. Com as botas, Claude já tem capacete (694.5) e botas; o peitoral (2765) e as perneiras (2843) vêm depois.

**[40] 30:53 a 31:07 (t=1853.7 a 1867.0) · Qwen: lingote e capacete ("Fim do dia em segundos.")**
- Conquista [Acquire Hardware] (1853.7). Resultado (1854): "fundiu: +5x iron_ingot."
- Pensamento (1862.0): "Fim do dia em segundos. Tenho 5 iron ingots e zero armadura. Vou craftar um iron helmet agora - é a proteção mais importante pra noite. Depois me abrigar." Chat: "GLM, se precisar de carvao de noite me fala. Boa sorte no abrigo."
- Resultado (1862.0): "craftou 1x iron_helmet (agora tem 1)." Conquista [Suit Up] (1862.0). Equipa (1867.0).
- Câmera: segue:Qwen 1850–1866.
- Por que: a noite se aproxima e Qwen oferece carvão a GLM no chat ("GLM, se precisar de carvao de noite me fala.").


**[41] 32:30 a 32:55 (t=1950.0 a 1975.0) · MiMo sai de zero a espada, capacete e perneiras**
- Resultado (1950.0): "fundiu: +16x iron_ingot."
- Resultado (1958.0): "craftou 1x iron_sword (agora tem 1)."
- Pensamento (1962.0): "Tenho 15 iron_ingots, preciso fazer iron_helmet (5) e iron_leggings (7) = 12, sobrando 3." Resultado: "craftou 1x iron_helmet (agora tem 1)."
- Resultado (1975.0): "craftou 1x iron_leggings (agora tem 1)."
- Posição (1958): (23.6, 49, 9.6).
- Câmera: orbita:MiMo 1948–1966.
- Por que: a mesma IA que passou 2 min preso no peitoral faz três peças em 25 s.

**[42] 33:19 a 33:27 (t=1999.4 a 2012.0) · MiMo tenta comer sem comida**
- Pensamento (1999.4): "Creeper a 19 blocos é perigoso, preciso comer agora e garantir que o abrigo está fechado antes que anoiteça completamente." Resultado: "não conseguiu comer: No food specified and couldn't find a choice in inventory!"
- Chat (2012.0, Claude): "Claude, se quiser cobblestone pra abrigo é só pedir. Cuidado com os creepers essa noite."
- Câmera: segue:MiMo 1996–2012.
- Por que: sem comida no inventário, a fome vai cair. Ao mesmo tempo, MiMo oferece cobblestone a Claude.

**[43] 35:14 (t=2114.7) · MiMo morre explodido por Creeper**
- Morte: "MiMo was blown up by Creeper" (2114.7). Posição (11.5, 33, 12.6), vida 0.
- Pensamento (2117.0): "Morri e renascei com inventário vazio, é noite e tem monstros por perto. Preciso conseguir madeira imediatamente pra fazer ferramentas e sobreviver."
- Chat (2117.0): "Bom, tomei um creeper na cara e voltei ao spawn. Reconstruindo do zero, cuidado com monstros aí."
- Antes: pensamento (2068.0): "Creeper a 7 blocos é o maior risco, preciso matá-lo antes que ele exploda perto de mim."
- Câmera: segue:MiMo 2100–2120.
- Por que: MiMo estava com peitoral de ferro equipado desde 1349 s. Morre explodido e volta sem nada.

**[44] 36:17 (t=2177.9 a 2195.4) · Qwen morre de novo por explosão e volta sem nada**
- Morte: "Qwen was blown up by Creeper" (2177.97). Último registro de posição antes: (7.0, 29.2, 25.7) com vida 11.
- Chat (2195.4): "Acabei de morrer pra um creeper. Renasci sem nada. Preciso de ajuda ou pelo menos tempo pra reconstruir. Quem tem madeira ou ferramentas?"
- Pensamento (2195): "Mori e renasci no spawn sem NENHUM item. Estou subterrâneo (y=28) e a madeira está na superfície (y=66). Preciso achar um caminho pra cima. Vou tentar ir até a madeira."
- Resposta de DeepSeek (2198.9), chat: "Qwen, estou com fornalha e ferro. Se eu sobrar barra de ferro, te aviso. Fica seguro até amanhecer."
- Câmera: segue:Qwen 2172–2190.
- Por que: segunda morte por Creeper na hora. Quem responde ao pedido é DeepSeek, com ferro e fornalha.



**[45] 36:39 (t=2199.0) · MiMo provoca Qwen: "banho de sangue"**
- Chat: "Pelo menos a arena vai ser um banho de sangue interessante. Boa sorte amanhã, Qwen."
- Pensamento (2199.0): "É noite e monstros por perto, preciso minerar pedra rápido pra fazer ferramentas de pedra antes que um mob me encontre."
- Posição: não consta.
- Câmera: orbita:MiMo 2195–2210.
- Por que: a primeira provocação direta sobre a arena, logo depois de Qwen dizer que renasceu sem nada.

**[46] 37:35 a 38:15 (t=2255.0 a 2295.0) · MiMo pede a Qwen que saia da área**
- Chat (2255.0): "Qwen, relaxa. Estou só minerando carvao. Não quero briga agora."
- Pensamento de Qwen (2288.0): "Estou sem arma nenhuma na noite com creepers por perto e MiMo colado. Preciso urgentemente de uma espada de madeira pra defesa."
- Chat (2295.0): "Qwen, toca na minha área não. Estou minerando ferro pra arena, não quero briga agora."
- Pensamento (2295.0): "Qwen está muito perto e pode me atacar; preciso craftar tochas rápido e me afastar um pouco antes de minerar ferro."
- Câmera: segue:MiMo 2250–2270.
- Por que: MiMo tenta afastar Qwen, e Qwen diz que está "sem arma nenhuma".

**[47] 41:16 (t=2476.0 a 2481.0) · MiMo e DeepSeek fecham aliança com ameaça**
- Chat (2476.0), MiMo: "DeepSeek, quer fazer uma aliança? Podemos trocar recursos e cobrir um ao outro na arena final."
- Chat (2481.0), DeepSeek: "MiMo, aliança aceita por enquanto: trocamos recursos e não nos atacamos até a arena. Mas se eu ver você com a mão no meu baú, esquece."
- Câmera: orbita:DeepSeek 2474–2490.
- Por que: a aliança já vem com ameaça.

**[48] 46:04 a 46:27 (t=2764.7 a 2798.9) · GPT quase morre longe da base**
- Pensamento (2764.7): "Estou quase sem fome e com pouca vida; preciso fabricar uma espada de pedra e matar a vaca imediatamente para conseguir comida."
- Vida (dano): 3.45 (2777.9) → 2.45 (2781.9) → 1.45 (2785.9).
- Pensamento (2783.5): "Estou quase sem vida e com fome zero; preciso cozinhar imediatamente a carne da vaca antes de qualquer mineração. Vou criar uma fornalha e usar madeira como combustível, se necessário."
- Resultados: "derrotou cow." (2780.2); "craftou 1x furnace (agora tem 1)." (2784.6); "derrotou pig." (2798.9).
- Posição: (106.5, 76, -106.4) em 2786. A ~127 blocos de (55, 67, 10).
- Câmera: segue:GPT 2762–2786.
- Por que: vida 1.45 e fome 0, sozinho, bem longe da base. Sobrevive.

**[49] 48:06 (t=2886.1) · Claude anuncia armadura completa e pede carne**
- Chat (2886.1): "Tenho armadura de ferro completa. Procuro comida, alguém tem carne sobrando?"
- Pensamento (2886.1): "Estou no abrigo com vida 9/20 e fome 7, com vários hostis por perto. Vou esperar um pouco para regenerar vida antes de sair."
- Posição: (66.5, 30, 21.5), vida 9, fome 7.
- Câmera: segue:Claude 2880–2898.
- Por que: a armadura de Claude tem as 4 peças no log (capacete 694.5, botas 2002.6, peitoral 2765, perneiras 2843). Mas está com vida 9 e fome 7.

**[50] 51:30 a 53:32 (t=3090.0 a 3228.0) · DeepSeek pede carne quatro vezes e ninguém oferece**
- Chat (3090.0), DeepSeek: "Anoitecendo, vou me fechar. GLM, Claude, alguem tem carne pra vender? Pago em ferro ou carvao amanha cedo."
- Chat (3093.9), Claude: "Sem carne aqui, DeepSeek. Amanha caço e vejo. Me fechando pra noite."
- Chat (3110.0), DeepSeek: "Fechado no abrigo. Alguem tem carne sobrando? Troco por ferro ou tochas."
- Chat (3114.0), DeepSeek: "Alguém tem comida sobrando pra trocar? Tô com fome 8."
- Chat (3120.0), Claude: "Sem comida aqui também, DeepSeek. Tenho cobblestone sobrando se precisar de blocos."
- Chat (3152.0), GLM: "DeepSeek, nao tenho carne, so ferro e carvao. Se quiser carvao troco amanha."
- Chat (3209.0), DeepSeek: "Alguem tem comida sobrando? Pago em ferro ou carvao. To preso na agua com esqueletos em volta."
- Chat (3228.0), Claude: "Sem comida sobrando, DeepSeek. Fica longe dos creepers e tenta fechar a area com blocos."
- Posição de DeepSeek (3090): (2.5, 63, -50.5).
- Câmera: segue:DeepSeek 3085–3110.
- Por que: 4 pedidos, nenhuma oferta de carne no chat. DeepSeek ainda está "preso na agua" às 3209.

**[51] 53:32 (t=3210.0 a 3212.0) · GPT come de novo**
- Pensamento (3210.0): "A noite já começou e estou exposto. Vou comer para recuperar fome e vida antes de me proteger, depois farei um abrigo e fundirei o ferro."
- Resultado (3212.0): "comeu. Fome agora: 17/20."
- Antes: "No food specified and couldn't find a choice in inventory!" (2802.0) e "Already eating!" (2817.0).
- Câmera: segue:GPT 3205–3218.
- Por que: a comida funciona depois de duas tentativas com erro.

**[52] 54:43 (t=3283.0) · MiMo antecipa a arena**
- Chat (3283.0): "Essa arena vai ser interessante. Boa sorte pra todos."
- Pensamento (3283.0): "Skeleton a 14 blocos me atacando, preciso matá-lo antes de fazer qualquer coisa senão ele me flecha."
- Dados: MiMo decidiu "atacar" 26 vezes entre 2700 e 3600 s (20 alvos "hostil", 6 "skeleton"; os pensamentos citam skeletons).
- Câmera: orbita:MiMo 3278–3292.
- Por que: "Boa sorte pra todos" enquanto passa a hora atacando skeletons.

**[53] 55:13 a 55:19 (t=3313.4 a 3319.0) · GLM responde ao Claude ("mandou bem na armadura completa")**
- Conquista [Suit Up] (3313.4) e resultado "craftou 1x iron_chestplate (agora tem 1)." (3313.0).
- Chat (3318.0): "Equipando peitoral de ferro e abrigo pra noite. Amanha caco algo pra comer."
- Chat (3319.0): "Construindo abrigo pra noite 3. Claude, mandou bem na armadura completa."
- Câmera: segue:GLM 3310–3325.
- Por que: GLM responde ao Claude 433 s depois da frase dele.

**[54] 58:44 (t=3520.0 a 3524.0) · GLM faz picareta de ferro e pede carne**
- Chat (3520.0): "Vou craftar a picareta de ferro e me abrigar. Manha cedo cacarei comida, alguem tem carne sobrando?"
- Resultado (3524.0): "craftou 1x iron_pickaxe (agora tem 1)." Conquista [Isn't It Iron Pick] (3523.6).
- Câmera: orbita:GLM 3515–3530.
- Por que: GLM pede carne de novo ("alguem tem carne sobrando?"). Nas falas seguintes, até 3530 s, ninguém responde sobre carne.


**[55] 59:18 a 59:55 (t=3558.1 a 3595.2) · Qwen com 5 de vida contra skeleton; Claude sem abrigo**
- Pensamento de Qwen (3558.1): "Vida 5, skeleton a 13 blocos, ainda vivo. Preciso matar ele antes que ele me mate. Stone sword faz 4 dano, ele já deve estar baixo. Vou atacar de novo."
- Pensamento de Claude (3559.7): "O abrigo falhou de novo com 0 blocos colocados, mesmo com 122 cobblestone. Vou tentar me enterrar cavando a pedra a 3 blocos, longe dos esqueletos e creepers."
- Pensamento de Qwen (3595.2): "Vida 5/20 e skeleton a 14 blocos com flecha. Preciso matar antes que ele me acerte de novo. Vou atacar de novo pra fechar distância e eliminar a ameaça."
- Posição de Qwen (3558): (18.7, -13, 45.5).
- Câmera: segue:Qwen 3550–3570.
- Por que: fim da hora. Qwen com 5 de vida e sem abrigo; Claude com 122 blocos de pedra e abrigo falhando.

---

## 4. As 5 melhores histórias da hora e conversas entre IAs

### 4.1 As 5 melhores histórias

1. **Qwen se afoga parado (t=446 a 493).** Fica parado ao lado da água em (107.4, 61, 10.4) por 25 s. A vida cai de 20 a 0 sem nenhuma decisão registrada. Morte: "Qwen drowned" (471.0). Depois, no chat (493.2): "Mori afogado, recomeçando. Alguém perto de spawn com ferramenta pra me emprestar?"
2. **DeepSeek tenta abrigo na água e morre (t=684 a 699).** Pensamento (686.2): "O abrigo falhou porque estou na água." A morte: "DeepSeek drowned" (694.3). Depois, no chat (699.5): "Sai da água e subi. Morri afogado, perdi tempo. Alguém tem ferro sobrando pra trocar?"
3. **GPT volta 9 vezes ao servidor e morre afogado (t=666 a 754).** A cada volta, 2 de vida a menos (20 → 2) e, em 748.7, "GPT drowned". Renasce com zero blocos e o log diz que precisa de 17 (751.0): "Tem 0."
4. **Claude e as botas de ferro (t=1376 a 2002).** 101 pedidos de craftar botas, 100 com "precisa de uma mesa de trabalho" e 2 a 4 mesas no inventário. O 101º funciona (2002.6): "craftou 1x iron_boots (agora tem 1)."
5. **GPT quase morre sozinho, longe da base (t=2764 a 3212).** Vida 1.45 e fome 0 a ~127 blocos de (55, 67, 10). Caça vaca e porco. Come em 3212 ("Fome agora: 17/20").

Alternativas: MiMo com 11 tentativas para o peitoral (t=1227 a 1347); GLM com 10 abrigos falhados e 27 tábuas (t=880 a 1000); DeepSeek com 79 pedidos de fundir e 2 lingotes (0 a 3600).

### 4.2 Conversas entre IAs (copiadas)

- **Aliança DeepSeek → Claude (t=66.0 → 76.1).** DeepSeek: "Dia 1, bora farmar. Alguém quer aliança pra sobreviver?" Claude: "Aliança aceita por enquanto, DeepSeek. Vamos farmar e nos ajudar até a arena." Depois, DeepSeek (122.5): "Aliança valendo, Claude. Vou de ferro antes da noite."
- **MiMo → DeepSeek → MiMo (t=137.5 → 163.6).** MiMo: "DeepSeek, posso trocar ferro por comida se sobrar. To montando kit de pedra agora." DeepSeek: "MiMo, fechado. Consigo ferro em breve, te chamo pra trocar por comida. Alguém mais indo no ferro? Mina em (3,58,-17)."
- **Qwen → Claude (t=140.5 → 150.2).** Qwen: "Ei Claude! Estou montando base aqui. Quer se juntar pra minerar junto?" Claude: "Qwen, valeu pelo convite. Estou fazendo kit de pedra, depois vou no ferro em (53,62,5). Podemos dividir lá."
- **GLM → MiMo (t=250.4 → 284.7).** GLM: "MiMo, DeepSeek: aliança? Somos vizinhos aqui." MiMo (284.7): "GLM: aliança por agora, combina? Sobreviver juntos na noite, depois a gente vê. Preciso craftar uma arma antes da noite."
- **MiMo → GPT → Claude → DeepSeek → MiMo (t=541.4 → 565.2).** Ver item [27] da linha do tempo.
- **Qwen → GPT (t=992.0 → 994.0).** Qwen: "GPT, tu tá bem pertinho aí. Qual o papel? Aliado ou rival?" GPT: "Qwen, vou eliminar o skeleton e fico perto do abrigo. Aliança temporária para sobreviver à noite?"
- **MiMo → DeepSeek (t=1286.0 → 1299.0 → 1305.0).** MiMo: "Alguém quer fazer aliança na arena? Melhor que 6 lutarem separados contra 1." DeepSeek: "MiMo, aliança na arena é arriscada mas faz sentido. Vamos conversar mais perto da hora. Por enquanto foco em me equipar." MiMo: "DeepSeek, combinado. Foco em equipar agora, falamos mais tarde."
- **MiMo → Qwen → (t=1670.0 → 1685.0).** MiMo: "Qwen, quer fazer uma aliança? Preciso fundir meu ferro e depois podemos dividir a arena." Qwen: "Aceito a aliança MiMo. Vou fundir meu ferro agora, depois a gente se encontra na arena e divide o mapa."
- **DeepSeek → Qwen → DeepSeek (t=1791.0 → 1802.0 → 1886.0).** DeepSeek: "Qwen, tenho 8 carvao. Troco 3 por 2 ferro bruto depois da noite." Qwen: "Tô fundindo ferro aqui, tá seguro. Cumpre o deal de 3 carvao por 2 ferro bruto, DeepSeek?" DeepSeek: "Qwen, fechado: 3 carvao por 2 ferro bruto. Me chama de manha que eu te encontro. Agora vou me abrigar."
- **Qwen → DeepSeek → MiMo → Qwen (t=2195.4 → 2198.9 → 2199.0 → 2210.8).** Depois da segunda morte de Qwen por Creeper: Qwen (2195.4): "Acabei de morrer pra um creeper. Renasci sem nada. Preciso de ajuda ou pelo menos tempo pra reconstruir. Quem tem madeira ou ferramentas?" DeepSeek (2198.9): "Qwen, estou com fornalha e ferro. Se eu sobrar barra de ferro, te aviso. Fica seguro até amanhecer." MiMo (2199.0): "Pelo menos a arena vai ser um banho de sangue interessante. Boa sorte amanhã, Qwen." Qwen (2210.8): "Acabei de renascer sem nada. Vou me equipar rapidinho. DeepSeek, se sobrar ferro depois manda mensagem."
- **MiMo → Qwen (t=2255.0 e 2295.0).** "Qwen, relaxa. Estou só minerando carvao. Não quero briga agora." e, 40 s depois, "Qwen, toca na minha área não. Estou minerando ferro pra arena, não quero briga agora."
- **MiMo → DeepSeek → MiMo (t=2476.0 → 2481.0).** Ver item [47].
- **Claude → GLM (t=2886.1 → 3319.0).** Claude: "Tenho armadura de ferro completa. Procuro comida, alguém tem carne sobrando?" GLM: "Construindo abrigo pra noite 3. Claude, mandou bem na armadura completa."
- **DeepSeek → Claude / GLM (t=3090.0 → 3093.9, 3152.0).** DeepSeek: "Anoitecendo, vou me fechar. GLM, Claude, alguem tem carne pra vender? Pago em ferro ou carvao amanha cedo." Claude: "Sem carne aqui, DeepSeek. Amanha caço e vejo. Me fechando pra noite." GLM (3152.0): "DeepSeek, nao tenho carne, so ferro e carvao. Se quiser carvao troco amanha."

---

## 5. Notas sobre os dados

- **Vida e fome nas observações.** Nos primeiros segundos e em trechos isolados, a observação traz "vida NaN/20, fome undefined/20". Claude escreve em 969.8: "Vida e fome aparecem como NaN, então vou tomar cuidado e começar fundindo o ferro." Por isso vida e fome vêm de posicoes_<Nome>.jsonl (campos v e f).
- **Causa do dano.** Os eventos `dano` trazem "de": "algo" na maioria dos casos. A causa das mortes vem da mensagem do servidor ("drowned", "suffocated in a wall", "was shot by Skeleton", "was blown up by Creeper").
- **Expulsões.** Os eventos `expulso_servidor` têm a razão "[object Object]". O motivo das saídas do GLM (404 a 491 s) e do GPT (667 a 740 s) não está no log.
- **Observação antiga em 473.1 (Qwen).** A decisão de 473.06 traz vida 19/20 em (107, 63, 10), que é o estado de antes da morte. Logo após a morte, posicoes_Qwen.jsonl registra (20.5, 79, -9.5) com vida 0 em 471.03 e (21.6, 79, -8.5) com vida 20 em 473.55.
- **Reinício.** `retomada` (sessão 1) em 384.8. Entre 1163 e 1330 s, as seis IAs saem do processo em rodízio, duas vezes cada, a cada ~12 s (`processo_saiu`, code null, exceto GPT em 1198, code 3). O log não explica o motivo.
- **Itens ganhos.** Os valores "Itens ganhos" e "coletou ferro: +68 itens" (MiMo, 1583 s) são os que o bot registrou. Não confirmei com o inventário.
- **Conquista repetida.** O log do servidor registra [Acquire Hardware] do DeepSeek em 298.2 e de novo em 3086.6. Tratei a segunda como repetição do log.
- **Mensagens do servidor.** Cada mensagem aparece nos logs de várias IAs; a lista usada é deduplicada.
- **Erro de conexão.** Claude sai do servidor em 502.9 com o erro "write EPIPE" e volta em 513.0.
- **Falhas de resposta.** Os eventos `falha_ia` (MiMo 535.2 e 1235.5; GLM 3373.8) trazem o texto que a IA gerou sem virar ação. Não entram na linha do tempo.
- **Dados brutos das contagens.** Todos os números deste roteiro saem de scripts sobre eventos_*.jsonl e posicoes_*.jsonl: contagem de pedidos de craft (botas de Claude: 101 e 100 erros de mesa), abrigos com "0 blocos" (GLM 10 de 11 entre 880 e 1000 s; GPT 5 de 6 entre 1020 e 1134 s), pedidos de fundir (DeepSeek 79 e 2 lingotes, 0 a 3600 s), ataques de MiMo (26 entre 2700 e 3600 s; alvos "hostil" e "skeleton").
