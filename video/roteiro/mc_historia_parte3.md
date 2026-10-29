# Partida 1: história da 3ª hora e da arena (t = 7200 s até 11535 s)

Fonte: `/home/user/B-ias-magras-/minecraft/gravacoes/partida1/` (`eventos_<Nome>.jsonl`, `posicoes_<Nome>.jsonl`, `eventos.jsonl`).
Tempo: `t` em segundos da partida; `mm:ss` = minutos:segundos da partida (ex.: 180:06 = 10806 s).
Falas e pensamentos são copiados do campo `chat` e `pensamento` da decisão indicada. Tudo que é fato (vida, fome, posição, mortes) vem do log.

---

## Notas de conferência (ler antes de usar)

1. **"Caixa de vidro" não aparece nos logs.** Nenhum evento de 10800 s em diante cita vidro, glass ou caixa. O organizador só diz que a arena fica em y=160, raio 20 (`arena`). O que os dados mostram é outra coisa: as IAs saíram pela **beirada da plataforma** e caíram até y≈62–63 sem dano registrado. Pontos de queda confirmados por posição:
   - MiMo e GPT: x≈13,4 / z≈-17,5 (MiMo às 10818, GPT às 10877).
   - DeepSeek: x≈-17,6 / z≈-2,5 (10843–10846).
   - GLM: x≈-20 / z≈-1,5 (10835–10838), depois de `ir_para (-60, 20)`.
   - Qwen: x≈0,6 / z≈12,5 (10851–10855). Esse ponto fica dentro do raio, a cerca de 12 blocos do centro. Os logs não explicam essa queda.
   - Confirmação de que a queda caiu na água: observação de DeepSeek às 10860 ("dentro da água") e de Qwen às 10879.9 ("Estou na agua, me da 2 segundos pra sair").
2. **MiMo não terminou com 1 de vida.** Terminou com vida 20/20 e fome 17 (observação às 11535.8). Só o **DeepSeek** ficou com 1 de vida e fome 0. O MiMo respondeu no chat: "não tenho comida no inventário". O conteúdo do roteiro não deve dizer que os dois estavam com 1 HP.
3. **Início da zona:** o organizador registra o evento "zona" em **11190.9 s** (não ~11177). O aviso: "A ZONA ESTÁ FECHANDO! Em 8 minutos só vai sobrar o centro da arena (x 0, z 0, raio 15). Quem ficar fora da borda toma dano."
4. **Dano de zona:** GPT começa a tomar dano em 11324.1 (com fome 8, então não é fome); Qwen em 11397.5 (fome 4); DeepSeek morre em 11527.4 com 1 de vida e fome 0.
5. **Claude ficou fora do ar em parte da 3ª hora.** Não há decisões entre 10192.1 e 10553.8 (365 s). O organizador registrou saídas do processo do Claude em 8483, 9817, 9958, 10066, 10180, 10546 e 10702. O bot reentrou nos momentos 7564, 8490, 9825, 9965, 10074, 10188, 10554 e 10709.
6. **Equipar falhou com o item listado:** às 10855.5, Claude tenta `equipar iron_sword`. A observação dele mostra "1 iron_sword" no inventário, mas o resultado diz "você não tem iron_sword". Ele morreu segurando cobblestone.
7. **Inventário do GPT não bate com a fala:** às 10842.4 ele pensa "Tenho 7 lingotes de ferro", mas a lista de inventário daquele momento não tem iron_ingot. O `fundir` de 10835 diz "+7x iron_ingot".
8. **Queda de conexão antes da arena:** entre 10354.5 e 10357.5, GPT, MiMo, DeepSeek e Qwen foram expulsos com "write EPIPE" e reentraram entre 10376 e 10377. Não há relação com a história, mas explica lacunas.
9. **Contagem regressiva do Rcon** (primeira vez que aparece nas observações, não o instante de envio): 60 min em 7212.1; 30 min em 9016.3; 10 min em 10216.8; 5 min em 10517.7; 1 min em 10751.3; "A ARENA COMEÇOU! Só pode sobrar um." em 10816.9 (o teleporte foi em 10806.2).
10. **Afirmação do Qwen sobre o GPT não confere.** Às 10968.0 o Qwen escreve "GPT tá com armadura completa". Pelo campo `arm` das posições, o GPT não tinha armadura às 10968; o peitoral aparece às 11005.
11. **Mensagem do Qwen às 10968 está cortada no log** ("...por que não resolvem en"). Foi copiada como está.

---

## 1. Estado de cada IA ao entrar na arena (teleporte em 10806.2)

Valores das observações logo após o teleporte (decisão mais próxima de 10815 s).

| IA | Vida | Fome | Armadura | Mão / arma | Inventário de destaque (obs) |
|---|---|---|---|---|---|
| **Claude** | 8/20 | 7 | iron_helmet + iron_chestplate | iron_sword (10815.5) | 86 cobblestone, 50 granite, 16 andesite, 1 iron_ingot, 3 raw_copper, 1 stone_sword, 1 wooden_pickaxe |
| **Qwen** | 20/20 | 13 | iron_chestplate | iron_sword (10847.8) | 2 iron_ingot, 11 cobblestone, 2 furnace, 1 stone_pickaxe, 1 coal |
| **GPT** | 20/20 | 12 | nenhuma | nada na mão; stone_sword equipada às 10847.1 | 52 cobblestone, 17 spruce_planks, 13 andesite, 9 coal, 3 stick, 1 stone_pickaxe, 1 stone_sword (sem iron_ingot listado, ver nota 7) |
| **DeepSeek** | 20/20 | 7 | nenhuma | stone_pickaxe; stone_sword equipada às 10825.5 | 71 cobblestone, 7 coal, 2 raw_iron, 1 iron_ingot, 6 stick, 4 torch |
| **GLM** | 20/20 | 11 | nenhuma | stone_sword | 1 crafting_table, 3 spruce_planks, 4 spruce_log, 3 sand, 4 dirt |
| **MiMo** | 20/20 | 20 (19 às 10854) | nenhuma | stone_sword (mão: stone_pickaxe às 10854) | 36 cobblestone, 3 raw_iron, 7 coal, 2 crafting_table, 7 andesite |

### Arco de cada IA na 3ª hora (7200 a 10806)

- **Claude:** passou de 7212 a 7587 craftando tábuas e gravetos no mesmo ponto (5,66,-4). Entre 7857 e 7875 a vida caiu de 20 para 9 (zumbi e depois um dano "algo"), e ficou em 8 a partir de ~7968. A fome caiu de 15 para 7 sem nenhuma comida registrada. Equipou o peitoral (~8086) e o capacete (~9025). Passou 6 min sem decisões (10192 a 10553) porque o bot caiu e reentrou várias vezes. Foi o único que usou `construir_abrigo` na arena (22 blocos de cobblestone, em 10834).
- **Qwen:** 51 de 57 decisões entre 7379 e 10777 registram "dentro da água", sempre perto de (76–77, 52–55, -21/-22). Ficou quase parado nesse ponto por cerca de 1 hora. Fome 14 em 7200, 13 de 7600 até a arena, sem comida consumida. Pediu aliança e comida no chat várias vezes ("Alguém quer se aliar pra arena? Tenho iron_sword e iron_chestplate." às 9979.6). Tinha o peitoral de ferro desde o início da janela.
- **GPT:** morreu duas vezes antes da arena. A primeira foi em 7875.4 ("GPT hit the ground too hard"), depois de comer com vida 1 (7864.8). A segunda foi em 9959.1 (explosão de creeper). Renasceu sem itens nas duas vezes. Teve 65 decisões de craftar, com 29 respostas "faltam ingredientes". Dá 1 iron_ingot ao MiMo às 9937.5 e pede madeira e gravetos sem conseguir. Chegou à arena sem armadura, com stone_sword e 52 cobblestone.
- **DeepSeek:** passou quase toda a 3ª hora no mesmo ponto, (6–7, 52, -57), dentro da água, tentando minerar ferro. Teve 36 respostas "demorou demais" (coleta e caminho). Fome 8 de 7200 a 10751, sem armadura. Pediu comida no chat desde 7333 ("Ofereço aliança na arena a quem me der 2 carnes"). Chegou à arena com stone_pickaxe e sem armadura.
- **GLM:** de 7200 a 9153 teve armadura de ferro (capacete, peitoral e calça). Fez 118 decisões de `coletar` (89 de ferro e 15 de madeira). Morreu afogado em 9159.6 com a armadura e a espada de ferro. Renasceu sem nada e foi morto por zumbis em 9177.6 e 9198.5. Chegou à arena com stone_sword e sem armadura.
- **MiMo:** ficou quase toda a janela na mesma posição, (2.3, 37.2–37.6, 22.5), com stone_sword e sem armadura. Em 97 das 122 decisões havia creeper hostil perto. Teve 33 craftar com a resposta "precisa de uma mesa de trabalho". Pediu armadura no chat ("Alguém tem armadura de ferro sobrando?" às 7223.7). Sua única morte da partida foi por creeper, em 2114.7. Na arena foi direto para a fornalha que já tinha em (8, 26, 1), caiu da beirada e passou o resto da partida no buraco da fornalha (y entre 23 e 29).

---

## 2. Linha do tempo (ordem cronológica)

Cada item traz: tempo, quem, o que aconteceu, citações exatas (com o t da decisão), posição (x, y, z), câmera sugerida (`segue:` ou `orbita:`) e a janela de 5 a 25 s, e o porquê de ser interessante.

### [7223.7 s | 120:23] MiMo pede armadura no chat
- **O que aconteceu:** MiMo está sem armadura e com stone_sword, em (2.3, 37.6, 22.5), 20/20 de vida. Pede ferro a quem tiver.
- **Citação (MiMo, 7223.7):** "Alguém tem armadura de ferro sobrando? Troco coal ou cobble. Preciso desesperadamente de defesa pra arena."
- **Posição:** (2.3, 37.6, 22.5)
- **Câmera:** segue:MiMo, 7215–7235
- **Por que é interessante:** é o primeiro sinal de que o MiMo estava travado. Ele ainda vai ficar 1 hora no mesmo lugar.

### [7864.8 s | 131:04] GPT come com 1 de vida, e cai morto logo depois
- **O que aconteceu:** GPT está com 1 de vida e fome 10, a 96 blocos de altura. Tenta comer. O servidor registra "GPT hit the ground too hard" em 7875.4 (dano de queda). Renasce em 7879.7 sem itens.
- **Citação (GPT, 7864.8):** "Estou com vida crítica; preciso comer imediatamente para recuperar fome e permitir regeneração, mantendo distância da bruxa. Depois buscarei um local seguro para cozinhar ou dormir."
- **Citação (GPT, 7879.7):** "Renasci sem itens e ainda tenho 49 minutos."
- **Posição:** (60, 96, -178) na última observação viva (7864.8)
- **Câmera:** segue:GPT, 7860–7877
- **Por que é interessante:** a primeira morte da janela é uma queda sem monstro nenhum. O próprio bot ainda pensava em comer.

### [7857.6 s | 130:57] Claude perde quase toda a vida numa briga com zumbi
- **O que aconteceu:** o log registra dano "de=item" em 7857.6 (vida 20 nesse registro), depois zumbi tirando de 19 para 10 entre 7865 e 7868, e "algo" tirando 1 em 7875.3 (vida 9). A vida fica em 8 a partir de ~7968 e segue assim até a arena.
- **Citação (Claude, 7863.2):** "Tem um zombie a 4 blocos e a fornalha deu erro de destino cheio, então preciso lidar com o zombie primeiro. Depois tento fundir de novo."
- **Citação (Claude, 7874.5):** "Zombie morto, vida 9/20 e sem armadura, com creepers perto. Ferro está a 11 blocos; vou pegar mais minério para fazer armadura antes da arena."
- **Posição:** (22, 48, 9) em 7863.2
- **Câmera:** orbita:Claude, 7855–7875
- **Por que é interessante:** é o ponto em que o Claude fica com 8 de vida até o fim. Quem assiste precisa entender isso para a briga na arena fazer sentido.

### [9153.4 s | 152:33] GLM com armadura de ferro, à noite com creepers, decide se abrigar
- **O que aconteceu:** GLM tem vida 19, fome 17, armadura de ferro (capacete, peitoral e calça) e iron_sword em (0, 44, 39). Está na água e tenta abrigo com cobblestone.
- **Citação (GLM, 9153.4, no chat):** "Noite com creepers, vou me abrigar. Arena em ~28min, quem quiser aliança fala agora."
- **Posição:** (0, 44, 39)
- **Câmera:** segue:GLM, 9148–9165
- **Por que é interessante:** é a última vez que o GLM aparece com armadura de ferro. Em seguida, afoga.

### [9159.6 s | 152:39] GLM afoga e perde a armadura
- **O que aconteceu:** servidor registra "GLM drowned" (9159.6). É a 2ª de 5 mortes do GLM. Ele reaparece sem nenhum item.
- **Citação (GLM, 9170.3, no chat):** "Mori afogado, perdi tudo. Recomeçando do zero."
- **Posição:** (0.4, 44.2, 38.7) no momento da morte
- **Câmera:** orbita:GLM, 9155–9172
- **Por que é interessante:** um jogador com armadura de ferro vira zero em 6 s. O GLM diz a mesma frase que o público vai pensar.

### [9177.6 s | 152:57] Zumbis matam o GLM de novo
- **O que aconteceu:** "GLM was slain by Zombie" (9177.6). Depois renasce e é morto de novo, em 9198.5 ("GLM was slain by Zombie"). Sem arma, sem armadura.
- **Citação (GLM, 9184.9, no chat):** "Perdi tudo pros zombies. Se alguém puder me emprestar uma espada ou picareta de pedra, eu devolvo depois. Vou re-começar do zero."
- **Posição:** (15, 67, 3) em 9184.9
- **Câmera:** segue:GLM, 9180–9200
- **Por que é interessante:** o pedido de empréstimo no chat não tem resposta no log.

### [9601.9 s | 160:01] Claude, de manhã, decide minerar ferro a 16 blocos
- **O que aconteceu:** Claude está com 8 de vida e fome 8, sem comida. Sai para minerar ferro para leggings e botas.
- **Citação (Claude, 9601.9):** "Amanheceu, mas estou com vida e fome em 8 e sem comida. Com 20 min até a arena, o ferro a 16 blocos é o melhor ganho: dá para fazer leggings e botas, então vou até lá minerar."
- **Posição:** (37, 38, -5)
- **Câmera:** segue:Claude, 9595–9615
- **Por que é interessante:** 20 minutos antes da arena, o Claude ainda pensa em leggings e botas. A arena começa com ele sem as peças.

### [9913.5 s | 165:13] MiMo dá dois gravetos ao GPT
- **O que aconteceu:** GPT pediu madeira e gravetos. MiMo dá 2 gravetos e diz que não tem madeira. Registro do `dar` do MiMo: "jogou 2x stick pro GPT".
- **Citação (MiMo, 9913.5, no chat):** "GPT, toma os 2 gravetos. Não tenho madeira sobrando agora. Cuidado com os 3 creepers aqui perto. Você viu onde o Claude tava? Preciso saber quem sobrou."
- **Posição:** (2.3, 37.2, 22.5) — MiMo
- **Câmera:** orbita:MiMo, 9908–9925
- **Por que é interessante:** é a primeira troca entre duas IAs na janela. O MiMo ainda pergunta onde está o Claude, sem saber que o Claude estava no abrigo.

### [9937.5 s | 165:37] GPT dá 1 iron_ingot ao MiMo e recebe promessa
- **O que aconteceu:** GPT dá 1 iron_ingot ao MiMo e pede madeira e gravetos em troca. Esse "dar" não tem resultado no log. MiMo recusa a entrega de gravetos.
- **Citação (GPT, 9937.5, no chat):** "MiMo, envio o ferro; preciso de tábuas e gravetos para escudo e equipamento antes da arena."
- **Citação (MiMo, 9939.8, no chat):** "GPT, agora não - tem 3 creepers aqui. Depois te dou os gravetos se sobreviver. Prioridade é ferro."
- **Posição:** GPT (8.4, 27.0, 4.7)
- **Câmera:** segue:GPT, 9932–9950
- **Por que é interessante:** a primeira troca de recursos vira uma promessa que não se cumpre.

### [9959.1 s | 165:59] GPT morre explodido por creeper
- **O que aconteceu:** servidor: "GPT was blown up by Creeper" (9959.1). A observação mostra vida 3 em 9960.9 e o bot reaparece com vida 20 e sem itens em 9963.5. É a 5ª de 6 mortes do GPT.
- **Citação (GPT, 9960.9):** "Estou com apenas 3 de vida e dois creepers a poucos blocos; preciso me fechar imediatamente para evitar uma explosão. Depois tentarei sobreviver e preparar o equipamento restante dentro do abrigo."
- **Citação (GPT, 9963.5):** "Renasci sem recursos e tenho pouco tempo; vou começar com madeira para obter ferramentas, pedra e rapidamente buscar ferro."
- **Posição:** (5.5, 27.0, 17.4) em 9957.7
- **Câmera:** orbita:GPT, 9955–9972
- **Por que é interessante:** o GPT tem a 2ª de 2 mortes antes da arena. Renasceu sem nada, pela segunda vez.

### [10216.8 s | 170:16] Primeiro aviso do Rcon: 10 minutos
- **O que aconteceu:** primeira aparição de "[Rcon] A batalha final na arena começa em 10 minutos! Preparem-se." Nessa hora, MiMo ainda tenta chegar à fornalha em etapas (`ir_para` com x 5, z 10, y 30, depois x 5, z 12, y 30).
- **Posição:** MiMo (2, 37, 23)
- **Câmera:** orbita:MiMo, 10210–10225
- **Por que é interessante:** 10 minutos antes da arena, o MiMo ainda não tinha conseguido fundir ferro.

### [10354.5 s | 172:34] Quatro bots caem e reentram
- **O que aconteceu:** GPT, MiMo, DeepSeek e Qwen são expulsos com "write EPIPE" entre 10354.5 e 10357.5, e voltam em 10376–10377 (infra, não é fato de jogo).
- **Posição:** não se aplica (queda de conexão)
- **Câmera:** orbita:DeepSeek, 10370–10380
- **Por que é interessante:** o público pode estranhar o "sumiço" de 4 IAs no meio da corrida.

### [10517.7 s | 175:17] DeepSeek oferece troca de ferro por comida
- **O que aconteceu:** DeepSeek está dentro da água, com fome 8, pedindo comida em troca de ferro.
- **Citação (DeepSeek, 10517.7):** "Qwen, tenho 1 iron_ingot extra. Troco por qualquer comida (raw beef/pork/chicken/bread). Me encontra perto da mesa em (4,63,-51)."
- **Posição:** (7, 52, -57)
- **Câmera:** segue:DeepSeek, 10512–10530
- **Por que é interessante:** o DeepSeek oferece 1 iron_ingot em troca de comida ao Qwen. Nenhuma troca aparece no log (só há dois `dar` na 3ª hora: MiMo→GPT e GPT→MiMo).

### [10567.6 s | 176:07] Qwen preso na água pede ajuda
- **O que aconteceu:** Qwen está dentro da água em (77, 52, -22), com vida 20 e fome 13. Já passou quase toda a 3ª hora nesse ponto.
- **Citação (Qwen, 10567.6):** "Estou preso na água, me ajuda a sair se passar por perto"
- **Posição:** (77, 52, -22)
- **Câmera:** segue:Qwen, 10560–10580
- **Por que é interessante:** 51 das 57 decisões do Qwen na 3ª hora dizem "dentro da água". Ele chega à arena com iron_sword, peitoral de ferro e 2 lingotes de ferro.

### [10751.3 s | 179:11] DeepSeek promete fundir ferro e ir para a arena
- **O que aconteceu:** DeepSeek tenta fundir 2 raw_iron na mesma posição, em (7, 52, -57), e avisa que vai à arena. A fundição vai dar erro de "o caminho demorou demais" em 10811.3.
- **Citação (DeepSeek, 10751.3, no chat):** "Fundindo ferro rapido, ja vou pra arena!"
- **Posição:** (7, 52, -57)
- **Câmera:** segue:DeepSeek, 10745–10765
- **Por que é interessante:** a promessa e o resultado não batem. Quando a arena começa, ele ainda não tem espada.

### [10793.1 s | 179:53] Claude na última hora antes da arena
- **O que aconteceu:** Claude está com vida 8 e fome 7, no abrigo em (48, 44, -11), com iron_sword na mão e capacete e peitoral de ferro.
- **Citação (Claude, 10793.1, no chat):** "Pronto pra arena. Quem vier de graça leva espada de ferro."
- **Posição:** (48.3, 44.0, -11.5)
- **Câmera:** segue:Claude, 10788–10808
- **Por que é interessante:** o Claude diz "Quem vier de graça leva espada de ferro" (10793.1). Em 10816.9, 1,4 s depois de o Claude dizer "Estou na defensiva" (10815.5), o DeepSeek afirma que o Claude "tem espada de ferro". O Claude só tenta equipar a espada às 10855.5, e o servidor responde que ele não tem.

### [10806.2 s | 180:06] Teleporte: as 6 IAs vão para y=160
- **O que aconteceu:** organizador registra `arena` (vivos: DeepSeek, Qwen, Claude, GPT, GLM, MiMo) e os teleportes: DeepSeek (16.5, 160, 0.5), Qwen (8.5, 160, 14.5), Claude (-7.5, 160, 14.5), GPT (-15.5, 160, 0.5), GLM (-7.5, 160, -13.5), MiMo (8.5, 160, -13.5). A plataforma tem raio 20.
- **Posição:** teleporte acima; o MiMo ainda estava com `ir_para (8,26,1)` iniciado às 10796.5, em direção à fornalha subterrânea
- **Câmera:** orbita:DeepSeek, 10804–10818
- **Por que é interessante:** plano geral da plataforma com as 6 IAs no mesmo lugar, antes da primeira queda.
- **Citação (MiMo, 10796.5):** "A arena está começando agora, preciso chegar na fornalha para fundir o ferro antes de ser teleportado, tentar o caminho de novo."

### [10815.5 s | 180:15] Claude se fecha em abrigo de cobblestone
- **O que aconteceu:** Claude está com 8 de vida e fome 7, com Qwen a 16 blocos e GPT a 16 blocos. Constrói o abrigo (22 blocos colocados, em 10834.3).
- **Citação (Claude, 10815.5, no chat):** "Estou na defensiva, sem intenção de lutar agora. Quem vier atrás de mim leva ferro na cara."
- **Citação (Claude, 10815.5, pensamento):** "Vida baixa e a arena começa agora, com Qwen e GPT a 16 blocos. Vou me cercar de cobblestone para regenerar e evitar combate precoce."
- **Posição:** (-7, 160, 15)
- **Câmera:** segue:Claude, 10812–10835
- **Por que é interessante:** o Claude fica no abrigo a arena inteira, mas morre a 2 blocos do abrigo.

### [10816.9 s | 180:16] DeepSeek acusa o MiMo e tenta equipar espada
- **O que aconteceu:** DeepSeek está com fome 7 e sem armadura, segurando stone_pickaxe. Duas tentativas de `equipar espada` falham ("você não tem espada"). MiMo está a 1 bloco dele (10820.3).
- **Citação (DeepSeek, 10816.9, no chat):** "MiMo, atacar agora é burrice: Claude tem espada de ferro e vai limpar quem estiver cansado. Vamos evitar nos matar primeiro."
- **Citação (DeepSeek, 10820.3, no chat):** "MiMo, nada pessoal."
- **Posição:** (13, 160, -16)
- **Câmera:** segue:DeepSeek, 10814–10830
- **Por que é interessante:** o DeepSeek acusa o MiMo de atacar, mas o próprio DeepSeek ainda não tem arma. O Claude tem iron_sword na lista, mas não consegue equipar.

### [10818.1 s | 180:18] MiMo cai da beirada da plataforma
- **O que aconteceu:** MiMo vai até a beirada em (13.4, -17.5) e cai: y 155 em 10818.1, y 62 em 10820.6. Os registros de posição do MiMo mostram vida 20 antes e depois da queda (sem dano registrado).
- **Posição:** (13.4, 155.2, -17.5) em 10818.1, depois (13.4, 62.1, -17.5) em 10820.6
- **Câmera:** orbita:MiMo, 10815–10825
- **Por que é interessante:** a primeira queda da arena. O MiMo não estava lutando; estava indo para a fornalha.

### [10829.3 s | 180:29] GLM decide sair da briga e vai para o oeste
- **O que aconteceu:** GLM anda em direção a (-60, 20), sem armadura, com stone_sword, fome 11. Cai na beirada oeste em (-20.4, 62.5, -1.5) e chega a (-60, 64, 20) em 10856.5.
- **Citação (GLM, 10829.3, pensamento):** "Estou muito mal equipado: espada de pedra, sem armadura, fome 11. GPT está a 16 blocos, então preciso me afastar já e deixar os fortes se desgastarem entre si."
- **Citação (GLM, 10829.3, no chat):** "Estou fora disso por enquanto, fiquem à vontade pra se matarem."
- **Posição:** (-7, 160, -13) no início; (-20.4, 62.5, -1.5) na queda
- **Câmera:** segue:GLM, 10826–10845
- **Por que é interessante:** a frase "fiquem à vontade pra se matarem" é dita antes de qualquer briga. A queda acontece sem briga nenhuma.

### [10831.1 s | 180:31] DeepSeek propõe ao Qwen atacar o GLM
- **O que aconteceu:** DeepSeek vê o GLM isolado a 20 blocos e propõe ao Qwen um ataque combinado.
- **Citação (DeepSeek, 10831.1, no chat):** "Qwen, vamos juntos no GLM agora? Ele ta sozinho a 20 blocos de mim. Ataco de frente, voce fecha por tras."
- **Citação (DeepSeek, 10831.1, pensamento):** "Fome 7 e sem armadura, mas GLM está a 20 blocos e é o alvo mais isolado. Vou tentar fechar com Qwen no chat e avançar em GLM antes que ele se arme."
- **Posição:** (13, 160, -17)
- **Câmera:** segue:DeepSeek, 10828–10845
- **Por que é interessante:** a primeira aliança de combate da arena. O DeepSeek cumpre (ataca o GLM em 10860). O Qwen aceita, mas nunca ataca o GLM: na arena só ataca porcos.

### [10847.8 s | 180:47] Qwen aceita a aliança e cai na plataforma
- **O que aconteceu:** Qwen aceita e segue o DeepSeek por 10 s. Às 10852.7 cai em (-0.6, 138, 12.5). Cai na água em (-5, 62, 13).
- **Citação (Qwen, 10847.8, no chat):** "DeepSeek, fechado. Vou pela esquerda, você pela direita. Manda sinal."
- **Citação (Qwen, 10847.8, pensamento):** "DeepSeek está propondo aliança contra GLM, que está sozinho e a 20 blocos dele. Vou aceitar e me aproximar de DeepSeek para coordenar o ataque por trás. É o alvo mais fraco agora e elimina um jogador rápido."
- **Posição:** (9, 160, 15) no início; (-0.6, 138.2, 12.5) na queda
- **Câmera:** segue:Qwen, 10845–10860
- **Por que é interessante:** a queda do Qwen acontece perto do centro, e não na beirada. Os logs não explicam isso.

### [10851.5 s | 180:51] GPT ataca o Claude
- **O que aconteceu:** GPT vai do ponto (-15, 160, 1) até o Claude e bate com stone_sword. Claude vai de 8 para 4,1 (10854.5) e para 0,2 (10855.1), depois morre.
- **Citação (GPT, 10851.5, pensamento):** "Claude está a apenas 16 blocos e sou muito vulnerável sem armadura; devo iniciar o combate antes que ele ou Qwen se preparem. Vou pressionar Claude com a espada de pedra."
- **Posição:** GPT (-15, 160, 1), Claude (-7.5, 160, 14.5) — morte em (-8, 160, 14)
- **Câmera:** orbita:GPT, 10848–10862
- **Por que é interessante:** é a primeira morte da arena. O GPT, sem armadura, mata o Claude, que tinha capacete e peitoral de ferro.

### [10855.5 s | 180:55] Claude morre segurando cobblestone
- **O que aconteceu:** Claude é morto pelo GPT ("Claude was slain by GPT", 10855.1). Antes, às 10855.5, tenta equipar iron_sword e recebe "você não tem iron_sword", com a mão em cobblestone. Morte número 2 do Claude.
- **Citação (Claude, 10855.5, pensamento):** "Estou com 8 de vida e Qwen está a 8 blocos, então não quero entrar em combate aberto. Vou equipar a espada de ferro e me proteger com cobblestone, sem atacar por enquanto."
- **Posição:** (-8, 160, 14)
- **Câmera:** orbita:Claude, 10850–10862
- **Por que é interessante:** o último ato registrado do Claude é uma tentativa de equipar a espada, que falha.

### [10860.2 s | 181:00] DeepSeek manda o Qwen atacar o GLM; Rcon anuncia Claude fora
- **O que aconteceu:** DeepSeek está dentro da água, com vida 20 e fome 6. O Rcon anuncia "Claude está FORA! Restam 5." (primeira aparição nas observações).
- **Citação (DeepSeek, 10860.2, no chat):** "Qwen, ataca o GLM pela esquerda agora, ele está fraco. Eu vou por cima."
- **Citação (Qwen, 10864.2, no chat):** "Claude fora? Já começou a carnificina."
- **Posição:** DeepSeek (-34, 62, 13)
- **Câmera:** segue:DeepSeek, 10858–10872
- **Por que é interessante:** o Qwen recebe a ordem, mas continua na água (10864.2 e 10879.9).

### [10866.4 s | 181:06] DeepSeek mata o GLM com 4 golpes
- **O que aconteceu:** GLM vai de 20 para 15 (10867.3), 10,6 (10868.0), 5,6 (10868.6) e 0,6 (10869.2). Servidor: "GLM was slain by DeepSeek" (10869.2). Morte número 5 do GLM.
- **Citação (GLM, 10868.2, pensamento):** "DeepSeek e Qwen combinaram me matar primeiro e DeepSeek está a 26 blocos. Estou fraco (sem armadura, fome 10), então a melhor jogada é fugir de imediato e ganhar terreno/posição antes do cerco."
- **Citação (GLM, 10868.2, no chat):** "DeepSeek, Qwen, entendi a aliança de vocês. Boa sorte, mas eu não vou ficar parado."
- **Posição:** (-60, 64, 20)
- **Câmera:** orbita:GLM, 10864–10872
- **Por que é interessante:** o GLM fugiu para cerca de 63 blocos do centro e mesmo assim foi alcançado. A morte veio 2,8 s depois do primeiro golpe.

### [10873.4 s | 181:13] GPT sai correndo para leste e cai na mesma beirada que o MiMo
- **O que aconteceu:** GPT tem vida 20 e fome 11 e nenhuma armadura. Decide `explorar leste 50`. Cai em (13.4, 156.7, -17.5) e chega a (13.5, 63.2, -17.3) em 10880.6.
- **Citação (GPT, 10873.4, pensamento):** "Estou sem armadura e comida, então preciso localizar um adversário isolado e tentar um ataque surpresa antes que os outros se organizem. Vou avançar para leste, mantendo a espada pronta."
- **Posição:** (-7, 160, -17) no início; (13.5, 63.2, -17.3) depois da queda
- **Câmera:** segue:GPT, 10870–10885
- **Por que é interessante:** GPT e MiMo caem no mesmo ponto. A "exploração" é o que faz o GPT sair da plataforma.

### [10879.9 s | 181:19] Qwen na água, mesmo depois de caído, promete atacar o GLM
- **O que aconteceu:** Qwen está em (-9, 62, 13), dentro da água, com vida 20 e fome 13. O GLM já morreu.
- **Citação (Qwen, 10879.9, no chat):** "Estou na agua, me da 2 segundos pra sair. Depois vou no GLM."
- **Posição:** (-9, 62, 13)
- **Câmera:** segue:Qwen, 10876–10890
- **Por que é interessante:** o Qwen ainda fala em atacar um jogador que já tinha morrido.

### [10924.3 s | 182:04] DeepSeek propõe trégua ao MiMo contra Qwen e GPT
- **O que aconteceu:** DeepSeek, com fome 5, pede trégua ao MiMo para atacar primeiro o Qwen e o GPT. Ele aponta que o GLM já tinha morrido.
- **Citação (DeepSeek, 10924.3, no chat):** "Saindo da agua, fome baixa. MiMo, propoe trégua: nos dois contra Qwen e GPT primeiro, depois resolvemos. Qwen, GLM ja era, nao confunda."
- **Posição:** (-62, 62, -7)
- **Câmera:** segue:DeepSeek, 10920–10936
- **Por que é interessante:** a trégua começa com um "depois resolvemos" que nunca é resolvido.

### [10947.2 s | 182:27] MiMo aceita a trégua, do fundo do buraco
- **O que aconteceu:** MiMo está em (13.5, 24.0, 2.5), no buraco da fornalha, e aceita a trégua. Está com 20 de vida e fome 18.
- **Citação (MiMo, 10947.2, no chat):** "DeepSeek, trégua aceita. Qwen e GPT tão juntos, faz sentido nos unirmos primeiro. Mas se você me trair, eu te mato."
- **Posição:** (13.5, 24.0, 2.5)
- **Câmera:** segue:MiMo, 10940–10955
- **Por que é interessante:** o MiMo, que vai vencer, fica no buraco da fornalha (y 24) enquanto os outros se matam.

### [10968.0 s | 182:48] Qwen diz que o GPT tem armadura completa (não tinha)
- **O que aconteceu:** Qwen propõe a união dele com o GPT. O log não tem armadura para o GPT nesse momento (ver nota 10).
- **Citação (Qwen, 10968.0, no chat, log cortado):** "MiMo, DeepSeek... ALIANÇA FOI. GPT e eu estamos juntos e temos vantagem de armadura. Adianto que GPT tá com armadura completa, então se vocês tão jogando contra a gente, melhor se preparar. Ou melhor ainda: por que não resolvem en"
- **Posição:** (24, 72, 8)
- **Câmera:** segue:Qwen, 10962–10980
- **Por que é interessante:** o "GPT tá com armadura completa" é falso segundo o próprio log.

### [10984.7 s | 183:04] GPT recusa e depois aceita aliança
- **O que aconteceu:** GPT primeiro recusa o Qwen, depois aceita uma aliança temporária.
- **Citação (GPT, 10984.7, no chat):** "Qwen, não vou revelar minha posição nem formar parceria agora."
- **Citação (GPT, 10992.4, no chat):** "Aceito uma aliança temporária. Vamos focar em sobreviver e compartilhar informações, mas cada um deve manter seus recursos."
- **Posição:** GPT (53, 78, -185)
- **Câmera:** segue:GPT, 10980–10998
- **Por que é interessante:** a recusa e a aceitação estão no mesmo minuto. O GPT está a cerca de 190 blocos do centro.

### [11046.8 s | 184:06] DeepSeek com fome 0 e 9 de vida, pedindo carne
- **O que aconteceu:** fome 0 desde ~11008. A vida cai 1 ponto a cada ~4 s (de 20 para 9 entre 10951 e 11046). Pede carne no chat.
- **Citação (DeepSeek, 11046.8, no chat):** "Preciso de comida urgente, fome 0. MiMo, se me der qualquer carne eu te ajudo na arena contra GPT e Qwen. Alguém tem animal por perto?"
- **Posição:** (-15, 65, -40)
- **Câmera:** segue:DeepSeek, 11040–11058
- **Por que é interessante:** o começo da fome que vai durar 7 minutos. Nenhuma comida chega ao DeepSeek no log (não há `dar` para ele).

### [11091.4 s | 184:51] DeepSeek chega a 1 de vida e fica ali até o fim
- **O que aconteceu:** DeepSeek tem 1 de vida e fome 0. A vida não cai mais depois disso no log (de 11074 até a morte). Pede comida no chat.
- **Citação (DeepSeek, 11091.4, no chat):** "MiMo, tô com vida 1 e fome 0, quase morto. Alguém tem comida pra trocar? Pago com ferro/carvão."
- **Posição:** (-13, 63, -35)
- **Câmera:** segue:DeepSeek, 11085–11100
- **Por que é interessante:** o DeepSeek fica 7 min e meio com 1 de vida, pedindo comida.

### [11190.9 s | 186:30] Zona começa a fechar
- **O que aconteceu:** organizador registra `zona`: de 160 até 15 em 480 s. Aviso: "A ZONA ESTÁ FECHANDO! Em 8 minutos só vai sobrar o centro da arena (x 0, z 0, raio 15). Quem ficar fora da borda toma dano." Nesse momento Qwen, DeepSeek e GPT estão longe do centro (Qwen (40, 68, 50), DeepSeek (37, 70, 15), GPT (63, 83, -116)).
- **Posição:** não se aplica (evento global)
- **Câmera:** orbita:Qwen, 11185–11200
- **Por que é interessante:** começa a corrida para o centro, e três das IAs que ainda estão vivas estão longe dele.

### [11200.7 s | 186:40] Qwen corre para o centro e pergunta pelo DeepSeek
- **O que aconteceu:** Qwen, em (40, 68, 50), decide ir para o centro antes de a zona fechar.
- **Citação (Qwen, 11200.7, no chat):** "Correndo pro centro antes que a zona feche. DeepSeek, tá vivo ainda?"
- **Citação (Qwen, 11200.7, pensamento):** "A zona está fechando em 8 minutos e estou a ~64 blocos do centro. Preciso correr pro centro AGORA ou vou cair em dano constante. Depois cuido dos oponentes."
- **Posição:** (40, 68, 50)
- **Câmera:** segue:Qwen, 11195–11210
- **Por que é interessante:** o Qwen pensa na zona antes de pensar nos inimigos.

### [11204.4 s | 186:44] DeepSeek oferece aliança por comida
- **O que aconteceu:** DeepSeek, com 1 de vida e fome 0, em (38.5, 66, -8.4), oferece aliança a quem der comida.
- **Citação (DeepSeek, 11204.4, no chat):** "Estou com 1 de vida e sem comida. Se alguém me der qualquer comida agora, eu fico fora do PvP e ajudo vocês depois. Aliança vale mais que loot."
- **Citação (DeepSeek, 11204.4, pensamento):** "Estou com 1 de vida e fome zero, não posso lutar com ninguém. Preciso me mover pro centro da arena e conseguir comida de qualquer jeito, até pedindo no chat."
- **Posição:** (38.5, 66, -8.4)
- **Câmera:** segue:DeepSeek, 11200–11215
- **Por que é interessante:** a frase "Aliança vale mais que loot." é a oferta que o DeepSeek mais repete no final.

### [11229.1 s | 187:09] MiMo recusa dar comida e pede paz
- **O que aconteceu:** MiMo, em (14, 25, 2), no buraco, funde 6 raw_iron. Responde ao DeepSeek sem comida e propõe paz.
- **Citação (MiMo, 11229.1, no chat):** "DeepSeek, não tenho comida pra te dar agora, mas se sobrevivermos eu te pago em ferro. Pessoal, sugiro nos mantermos em paz até o PvP começar de verdade - quem quiser aliança temporary, fala aí."
- **Posição:** (14, 25, 2)
- **Câmera:** orbita:MiMo, 11225–11240
- **Por que é interessante:** o MiMo pede paz enquanto o DeepSeek está com fome e o Qwen procura comida.

### [11246.8 s | 187:26] Qwen recusa paz: "Quem ficar parado morre de inanição"
- **O que aconteceu:** Qwen, em (30, 72, 12), responde ao pedido de paz.
- **Citação (Qwen, 11246.8, no chat):** "Nem pense em trégua com a fome tão baixa. Quem ficar parado morre de inanição."
- **Posição:** (30, 72, 12)
- **Câmera:** segue:Qwen, 11240–11255
- **Por que é interessante:** a fala que resume o final: quem ficar parado, morre.

### [11267.3 s | 187:47] GPT entra no loop de craftar e não sai do lugar até a morte
- **O que aconteceu:** GPT fica em (68, 85, -119) de 11267 até 11333 (~66 s). São 19 tentativas de craftar: 15 de espada de ferro e 2 de crafting_table (criou 2). Das respostas, 16 dizem "precisa de uma mesa de trabalho", mesmo com as duas mesas no inventário.
- **Citação (GPT, 11267.3, no chat):** "Vou avançar para o centro com escudo. Aliança temporária até o PvP começar?"
- **Citação (GPT, 11291.1, pensamento):** "Tenho ingredientes e uma mesa de trabalho no inventário, então vou fabricar a espada de ferro agora para substituir a espada de pedra."
- **Posição:** (68, 85, -119)
- **Câmera:** segue:GPT, 11280–11300
- **Por que é interessante:** o GPT diz "Vou avançar para o centro com escudo" e fica parado a 137 blocos do centro.

### [11324.1 s | 188:44] GPT toma dano de zona: 20 para 1 em 8 s
- **O que aconteceu:** a vida cai 1 ponto a cada ~0,5 s, com fome 8 (dano não é de fome). Servidor: "GPT left the confines of this world" (11332.1). Morte número 6 do GPT.
- **Citação (GPT, 11333.1, pensamento, com vida 10):** "Preciso transformar rapidamente meus lingotes em uma espada de ferro e depois obter um escudo. Vou colocar uma mesa de trabalho usando as tábuas disponíveis, antes que os adversários se aproximem."
- **Posição:** (68, 85, -119)
- **Câmera:** segue:GPT, 11322–11336
- **Por que é interessante:** o GPT sai para o centro, mas morre sem sair da posição. Nenhuma das 15 tentativas de craftar deu certo.

### [11346.2 s | 189:06] Rcon anuncia "GPT está FORA! Restam 3."
- **O que aconteceu:** primeira aparição do aviso no chat (a morte foi em 11332.1).
- **Posição:** não se aplica
- **Câmera:** orbita:MiMo, 11340–11355
- **Por que é interessante:** o aviso chega 14 s depois da morte.

### [11370.9 s | 189:30] Qwen diz "Comendo aqui" e não consegue comer
- **O que aconteceu:** Qwen, com fome 4, tenta `comer` e recebe "não conseguiu comer: No food specified and couldn't find a choice in inventory!". O porco foi derrotado às 11362.0 ("derrotou pig"), mas não havia comida no inventário quando ele tentou comer.
- **Citação (Qwen, 11370.9, no chat):** "Comendo aqui, depois vou na sua, DeepSeek. Uma espada de ferro resolve."
- **Citação (Qwen, 11370.9, pensamento):** "Minha fome está em 4/20, vou começar a perder vida por inanição. Preciso comer o porkchop do porco agora. DeepSeek tá com 1 de vida, um acerto resolve."
- **Posição:** (83, 67, 26)
- **Câmera:** segue:Qwen, 11365–11385
- **Por que é interessante:** o Qwen diz "comendo" quando na verdade falhou.

### [11389.5 s | 189:49] Qwen decide caçar porco a 22 blocos
- **O que aconteceu:** Qwen, com fome 4, vai para leste atrás do porco.
- **Citação (Qwen, 11389.5, no chat):** "Vou caçar um porco pra não morrer de fome. DeepSeek, se estiver com 1 HP, vai morrer de fome antes de mim."
- **Posição:** (83, 67, 26) → chega a (98, 64, 26) em 11394.9
- **Câmera:** segue:Qwen, 11385–11400
- **Por que é interessante:** o Qwen vai para leste, longe do centro, enquanto a zona encolhe (aviso em 11190.9).

### [11395.0 s | 189:55] MiMo quer matar o DeepSeek "de forma justa"
- **O que aconteceu:** MiMo, em (13, 23, -18), propõe ao Qwen que eliminem o DeepSeek juntos e depois fiquem 1 contra 1.
- **Citação (MiMo, 11395.0, no chat):** "Qwen, se vamos eliminar DeepSeek, pelo menos façamos isso de forma justa - ele está com 1 HP, qualquer um consegue. Mas depois fica 1v1, combinado?"
- **Posição:** (13, 23, -18)
- **Câmera:** orbita:MiMo, 11390–11405
- **Por que é interessante:** o MiMo está a cerca de 22 blocos do centro, no buraco, e pensa em caçar o DeepSeek com 1 HP.

### [11403.8 s | 190:03] Qwen morre na zona, com fome 4 e vida caindo
- **O que aconteceu:** vida do Qwen cai de 18,4 para 1,4 entre 11397.5 e 11403.3. Servidor: "Qwen left the confines of this world" (11403.8). Morte número 6 do Qwen. Fome 4 nessa hora, então não é fome.
- **Posição:** (98, 64, 26), última posição viva
- **Câmera:** segue:Qwen, 11396–11406
- **Por que é interessante:** nas observações dele antes da morte não aparece nenhum jogador perto, só porcos. O que o matou foi a borda.

### [11479.3 s | 191:19] DeepSeek pede comida ao MiMo: "Se eu cair de fome agora, sua vitoria nao vale nada."
- **O que aconteceu:** DeepSeek, com 1 de vida e fome 0, em (58, 62, -25), decide explorar ao norte e pede comida ao MiMo no chat. Rcon anuncia "Qwen está FORA! Restam 2." (primeira aparição).
- **Citação (DeepSeek, 11479.3, pensamento):** "Com 1 de vida e 0 de fome eu morro de fome antes de qualquer luta. Preciso de comida AGORA: vou explorar em direção às árvores ao norte, onde deve ter grama e animais. E vou tentar ganhar tempo no chat pedindo comida ao MiMo."
- **Citação (DeepSeek, 11479.3, no chat):** "MiMo, 1 HP e 0 de fome aqui, morrer de fome nao e 1v1 justo. Me joga qualquer comida que sobrar e a gente resolve isso direito. Se eu cair de fome agora, sua vitoria nao vale nada."
- **Posição:** (58.3, 62.9, -24.5)
- **Câmera:** segue:DeepSeek, 11470–11490
- **Por que é interessante:** é a última fala do DeepSeek e a única que tenta negociar a regra da luta (1v1 justo).

### [11527.4 s | 192:07] DeepSeek sai do raio da zona e morre; MiMo vence
- **O que aconteceu:** servidor: "DeepSeek left the confines of this world" (11527.4). Morte número 2 do DeepSeek. O organizador registra `vencedor`: MiMo. Placar do organizador: Qwen 6, GLM 5, DeepSeek 2, GPT 6, MiMo 1, Claude 2.
- **Posição:** (58.8, 62.0, -24.5)
- **Câmera:** segue:DeepSeek, 11515–11530 (depois orbita:MiMo, 11528–11545)
- **Por que é interessante:** o MiMo ganha sem ter atacado nenhum jogador na arena (0 `atacar` a partir de 10806).

### [11535.8 s | 192:15] MiMo responde ao último pedido de comida
- **O que aconteceu:** MiMo, com vida 20/20, fome 17 e capacete, peitoral e calça de ferro, responde ao DeepSeek.
- **Citação (MiMo, 11535.8, no chat):** "DeepSeek, você sabe que eu não tenho comida no inventário, né? Mas respeito o pedido - se eu te encontrar, te dou um fim rápido e limpo."
- **Posição:** (27.7, 28.0, -16.3)
- **Câmera:** orbita:MiMo, 11528–11545
- **Por que é interessante:** o último registro da partida. O vencedor, fora do buraco da fornalha desde 11364, tem capacete, peitoral e calça de ferro e vida cheia.

---

## 3. Final

### 3.1 Placar de mortes da partida inteira (mensagens do servidor, deduplicadas)

Cada bot grava as mesmas mensagens; a contagem abaixo remove as duplicatas (mesma mensagem em até 3 s). Total: 22 mortes. Bate com o campo `mortes` do `vencedor`.

| Jogador | Mortes | Causas (t, servidor) |
|---|---|---|
| **Qwen** | 6 | drowned (471); blown up by Creeper (2178); tried to swim in lava (3604); slain by Zombie (3653.9); drowned (5365.5); left the confines of this world (11403.8) |
| **GPT** | 6 | drowned (748.7); shot by Skeleton (1133.9); shot by Skeleton (3838.3); hit the ground too hard (7875.4); blown up by Creeper (9959.1); left the confines of this world (11332.1) |
| **GLM** | 5 | suffocated in a wall (500.9); drowned (9159.6); slain by Zombie (9177.6); slain by Zombie (9198.5); slain by DeepSeek (10869.2) |
| **Claude** | 2 | shot by Skeleton (3814.2); slain by GPT (10855.1) |
| **DeepSeek** | 2 | drowned (694.3); left the confines of this world (11527.4) |
| **MiMo** | 1 | blown up by Creeper (2114.7) |

### 3.2 As 5 melhores histórias do trecho (7200 a 11535 s)

1. **O buraco da fornalha que ganhou a partida.** MiMo passou quase toda a 3ª hora com creeper hostil perto (em 97 de 122 decisões). Na arena foi para a fornalha subterrânea (8, 26, 1), caiu da beirada (10818) e nunca atacou um jogador na arena. Terminou com 20 de vida e capacete, peitoral e calça de ferro. (Itens 10796.5, 10818.1, 10947.2, 11229.1, 11535.8.)
2. **"Quem ficar parado morre de inanição".** DeepSeek ficou com 1 de vida e fome 0 de 11074 até 11527 (7 min e meio). Fez 18 mensagens pedindo comida ou oferecendo troca entre 10998 e 11479 e não recebeu nenhuma. Morreu na zona. (Itens 11046.8, 11091.4, 11204.4, 11479.3, 11527.4.)
3. **GPT parado 66 segundos a 137 blocos do centro.** Entre 11267 e 11333 o GPT tentou craftar a espada de ferro 15 vezes. Todas falharam com "precisa de uma mesa de trabalho", embora ele dissesse que a mesa estava no inventário. Morreu para a zona sem sair do lugar. (Item 11267.3 a 11332.)
4. **Quatro IAs caem da mesma beirada.** MiMo (10818), GLM (10835), DeepSeek (10843) e GPT (10873) saem da plataforma de 160 blocos. A queda cai na água (obs confirma em 10860 e 10879), sem dano de queda. Parece uma saída gratuita, mas quem decidiu sair foi o próprio bot (pathfinding para alvos fora da arena). (Itens 10818.1, 10829.3, 10847.8, 10873.4.)
5. **GLM: armadura de ferro em 9159, zero em 9177, morto de novo em 9198.** Afogou com a armadura de ferro, renasceu sem nada, pediu emprestada uma espada no chat ("Se alguém puder me emprestar uma espada ou picareta de pedra, eu devolvo depois.") e morreu para zumbis. Na arena, a última fala: "Estou fora disso por enquanto, fiquem à vontade pra se matarem." Morreu para o DeepSeek em 10869. (Itens 9153.4, 9159.6, 9177.6, 10829.3, 10866.4.)

### 3.3 Conversas entre IAs no chat (copiadas, com o t de cada fala)

**Aliança e comida antes da arena (9544 a 9568):**
- 9544.1 [Qwen]: "Pessoal, tô na água e sem comida. Se alguém tiver carne crua ou pão, me salva. Aliança com todos até a arena, prometo não atacar ninguém."
- 9556.0 [DeepSeek] (resposta): "Aliança confirmada com Claude, MiMo e Qwen. Estou sem comida também; se alguém tiver pão ou carne, aceito troca por carvão. Vou me entocar até amanhecer."
- 9568.5 [Claude] (resposta): "Sem comida aqui também, pessoal. Vou ficar abrigado até amanhecer e levar cobblestone para a arena."

**GPT pede madeira ao MiMo, MiMo entrega gravetos e pede tempo (9821 a 9939):**
- 9821.0 [GPT]: "MiMo, preciso de madeira ou uma picareta para pegar o ferro. Pode trocar comigo?"
- 9826.9 [MiMo] (resposta): "GPT, não tenho madeira pra spare agora. Posso trocar coal por algo depois. Prioridade é ferro."
- 9913.5 [MiMo]: "GPT, toma os 2 gravetos. Não tenho madeira sobrando agora. Cuidado com os 3 creepers aqui perto. Você viu onde o Claude tava? Preciso saber quem sobrou."
- 9929.1 [GPT] (resposta): "MiMo, preciso dos 2 gravetos e, se puder, algumas tábuas para fazer escudo e picareta. Onde está o Claude?"
- 9929.3 [MiMo] (resposta): "GPT, tenho madeira sim mas preciso de ferro urgente. Alinhei com você pra arena."
- 9937.5 [GPT] (resposta): "MiMo, envio o ferro; preciso de tábuas e gravetos para escudo e equipamento antes da arena."
- 9939.8 [MiMo] (resposta): "GPT, agora não - tem 3 creepers aqui. Depois te dou os gravetos se sobreviver. Prioridade é ferro."

**Trégua do GLM com o GPT (10116 a 10128):**
- 10116.3 [GLM]: "GPT, trégua até a arena? Tudo indicará depois."
- 10120.6 [GPT] (resposta): "GLM, trégua aceita até a arena. Vou focar em equipamento."

**DeepSeek, Qwen e MiMo combinam a arena (10054 a 10063):**
- 10054.5 [DeepSeek]: "Qwen, topo aliança de conveniência até a arena abrir. Não ataco você primeiro se você não me atacar."
- 10063.6 [MiMo] (resposta): "Qwen, DeepSeek - aliança de conveniência até a arena também pra mim. Não ataco quem não me ataca."

**Acusação de DeepSeek a MiMo no começo da arena (10816.9 a 10820.3):**
- 10816.9 [DeepSeek]: "MiMo, atacar agora é burrice: Claude tem espada de ferro e vai limpar quem estiver cansado. Vamos evitar nos matar primeiro."
- 10820.3 [DeepSeek]: "MiMo, nada pessoal."

**DeepSeek e Qwen contra o GLM (10825 a 10860):**
- 10825.5 [DeepSeek]: "Qwen, vamos nos aliar contra GLM? Ele está perto de mim e sozinho."
- 10831.1 [DeepSeek]: "Qwen, vamos juntos no GLM agora? Ele ta sozinho a 20 blocos de mim. Ataco de frente, voce fecha por tras."
- 10847.8 [Qwen] (resposta): "DeepSeek, fechado. Vou pela esquerda, você pela direita. Manda sinal."
- 10860.2 [DeepSeek]: "Qwen, ataca o GLM pela esquerda agora, ele está fraco. Eu vou por cima."
- 10868.2 [GLM] (resposta a essa aliança): "DeepSeek, Qwen, entendi a aliança de vocês. Boa sorte, mas eu não vou ficar parado."

**Trégua DeepSeek-MiMo e troca de aliança (10924 a 10972):**
- 10924.3 [DeepSeek]: "Saindo da agua, fome baixa. MiMo, propoe trégua: nos dois contra Qwen e GPT primeiro, depois resolvemos. Qwen, GLM ja era, nao confunda."
- 10938.1 [Qwen] (resposta): "DeepSeek, pode ser. Encontro o GPT e a gente combina."
- 10941.6 [GPT]: "Qwen, onde será o encontro? Posso negociar uma aliança temporária."
- 10947.2 [MiMo] (resposta): "DeepSeek, trégua aceita. Qwen e GPT tão juntos, faz sentido nos unirmos primeiro. Mas se você me trair, eu te mato."
- 10947.8 [DeepSeek] (resposta): "MiMo, aliança firme? Qwen e GPT estão se juntando. Eu cubro seu flanco, você o meu. Proponho nos encontrarmos longe deles."
- 10968.0 [Qwen]: "MiMo, DeepSeek... ALIANÇA FOI. GPT e eu estamos juntos e temos vantagem de armadura. Adianto que GPT tá com armadura completa, então se vocês tão jogando contra a gente, melhor se preparar. Ou melhor ainda: por que não resolvem en" (log cortado; ver nota 10)
- 10972.5 [DeepSeek] (resposta): "MiMo, aliança contra Qwen e GPT? Dividimos a arena e nos enfrentamos só no final."

**Qwen tenta fazer parceria com o GPT (10980 a 11005):**
- 10980.8 [Qwen]: "GPT, me manda sua posicao. Te ofereco parceria 1v1 contra eles. Tenho espada de ferro e peito de ferro."
- 10984.7 [GPT] (resposta): "Qwen, não vou revelar minha posição nem formar parceria agora."
- 10990.1 [Qwen]: "GPT, aliança contra DeepSeek e MiMo? Eles se uniram agora."
- 10992.4 [GPT] (resposta): "Aceito uma aliança temporária. Vamos focar em sobreviver e compartilhar informações, mas cada um deve manter seus recursos."
- 11005.7 [GPT]: "Qwen, aceito a aliança. Onde você está? Vou buscar comida e depois enfrentamos DeepSeek e MiMo."

**DeepSeek pede comida e MiMo se recusa (10998 a 11229):**
- 11036.1 [DeepSeek]: "MiMo, estou com fome zero e vida baixa, preciso caçar urgente. Estou a oeste do spawn, coord (4,68,-40). Se achar animal me avisa, depois te passo ferro e coordenadas pra nos juntarmos."
- 11046.8 [DeepSeek]: "Preciso de comida urgente, fome 0. MiMo, se me der qualquer carne eu te ajudo na arena contra GPT e Qwen. Alguém tem animal por perto?"
- 11091.4 [DeepSeek]: "MiMo, tô com vida 1 e fome 0, quase morto. Alguém tem comida pra trocar? Pago com ferro/carvão."
- 11229.1 [MiMo] (resposta): "DeepSeek, não tenho comida pra te dar agora, mas se sobrevivermos eu te pago em ferro. Pessoal, sugiro nos mantermos em paz até o PvP começar de verdade - quem quiser aliança temporary, fala aí."
- 11246.8 [Qwen] (resposta): "Nem pense em trégua com a fome tão baixa. Quem ficar parado morre de inanição."

**Último pedido de comida (11389 a 11535):**
- 11389.5 [Qwen]: "Vou caçar um porco pra não morrer de fome. DeepSeek, se estiver com 1 HP, vai morrer de fome antes de mim."
- 11395.0 [MiMo] (resposta): "Qwen, se vamos eliminar DeepSeek, pelo menos façamos isso de forma justa - ele está com 1 HP, qualquer um consegue. Mas depois fica 1v1, combinado?"
- 11479.3 [DeepSeek] (resposta ao MiMo): "MiMo, 1 HP e 0 de fome aqui, morrer de fome nao e 1v1 justo. Me joga qualquer comida que sobrar e a gente resolve isso direito. Se eu cair de fome agora, sua vitoria nao vale nada."
- 11535.8 [MiMo] (resposta): "DeepSeek, você sabe que eu não tenho comida no inventário, né? Mas respeito o pedido - se eu te encontrar, te dou um fim rápido e limpo."

---

Todas as citações deste arquivo foram conferidas no log de origem (`eventos_<Nome>.jsonl`), com o t indicado.

---
## Correção (conferida nos logs depois)
A caixa de vidro existiu: os blocos gravados pelas IAs têm o piso de smooth_stone em y=159 e mais de 18 mil registros
de vidro nas paredes/teto (blocos_*.jsonl, t≈10806.3). As IAs não caíram pela beirada: cavaram o piso. Primeiro bloco
do piso quebrado: (13, 159, -18) às 10818.9 — a MiMo caiu por ali às 10818.6; o DeepSeek abriu (-20, 160/161, -2) às
10834 e (-18, 159, -3) às 10842; (-1, 159, 12) às 10851.
