# Crítica da prévia do AU5 (2 min 21 s) e roteiro novo

Feedback do Felipe: "senti muito rushado ... tem que ser em uma ordem", e quer mais comentários no começo, principalmente do Davi (pedidos do Polus).

Como li: os 6 mosaicos (seq00 a seq05), j000 a j004 (.txt e j000.jpg), cenas.txt, o roteiro `roteiro_au5_previa.py`, o log `amongus/logs5/partida1.json` (eventos, reuniões, tiques, chat dos impostores, fotos) e os comentários. Não há áudio: julgo só pelo texto e pelos quadros. Os tempos vêm do overlay amarelo (margem de 1 a 2 s). Tudo o que cito do log foi conferido no JSON.

Comparação com o AU4 aprovado: as cenas narradas da Partida 2 do AU4 têm em média 36 palavras (mínimo 27, máximo 45), uma função por vez, e o Juiz é pago assim: planta a regra, lê o pensamento, `boom` e carimbo (roteiro_au4.py, p207). Na prévia do AU5 são 13 cenas com média de 19 palavras: a densidade de palavras não é o problema, o problema é a quantidade de coisas novas por cena.

---

## 1. Diagnóstico: por que ficou corrido e fora de ordem

**1. Coisas novas demais por segundo.** Em 2:21 a prévia nomeia 8 funções (Camuflador 0:06, Doutor 0:40, Chato 0:40, Influencer 1:02, Metamorfo 1:10, Anjo da Guarda 1:34, Juiz 1:55, Casal 2:09), mais Polus, 18 IAs, 4 impostores, GPT-6.1 Terra, MiMo, DeepSeek e 10 personagens com nome. Só o Doutor e o Chato ganham uma frase de regra. Metamorfo, Influencer e Camuflador nunca são explicados; o Juiz aparece sem a regra e o Casal só na última frase. A janela j001 (0:30 a 1:00) despeja 10 itens em 30 s (Polus, 18/4, GPT Terra, MiMo, Doutor, Chato, tique 5, DeepSeek, morte do Bordo, começo da reunião). O cartão de título (0:11 a 0:16) ainda lista 7 funções em 4 s, ilegível.

**2. Cenas curtas com efeito em cima de efeito.** b09 3,4 s, a02 4,2 s, b06 5,6 s, b02 6,6 s. Em 1:30 a 1:46 (j003) são 4 cenas e 5 efeitos em 16 s (sad-pablo 1:30, escudo 1:39, dicaprio 1:40, escudo 1:45, stonks 1:46): o olho não acaba de ler uma imagem e já vem outra.

**3. Saltos no tempo sem marcador.** Não existe contador de tique na tela. A prévia salta do tique 59 (frio) para o 5 (0:40), do 8 para o 30 (1:33, pulando a morte da Coral no 28 e o veneno no Verde no 33) e do 30 para o 39 (1:43, pulando o primeiro ataque ao Branco, tique 34). As falas dizem "t7", "t4", "t6" e o espectador não tem onde ancorar. Em 1:40 aparece o alerta "SISMÓGRAFO INSTÁVEL: O CHÃO VAI RACHAR" sem ninguém explicar, brigando com a narração.

**4. Explicado fora de ordem (o principal do "tem que ser em uma ordem").**
- O frio (0:00 a 0:11) mostra o tique 59, depois a prévia vai para o tique 5 e nunca volta. O Banana some, a "Rose que mata a Rose" nunca é paga, e o Camuflador nunca é explicado.
- "Vocês pediram o Polus" (0:16) vem 10 s antes do mapa (0:26): agradece antes de entregar. O Doutor "ENTROU" (0:20), mas a primeira coisa que o Doutor faz é ser desligado (0:42). O cartão "CONSERTADO" (impostor só diz "matei" se matou) não tem nenhuma prova na prévia.
- b01: o carimbo "FUNÇÃO DESATIVADA" aparece em 0:42, mas o `error-beep` toca em 0:47 e o meme em 0:49. A narração conta o fato 5 s depois da imagem, quando a tela já mostra a Rose só andando (0:44 a 0:46). Mesmo problema no frio: o corpo aparece em 0:06 e a `faca` toca em 0:08.
- b03: "a foto do Influencer mostrava dois Vermelhos" é dito em 1:02 a 1:04, mas a tela é a grade vazia (1:00 a 1:04, sem nenhum efeito) e depois um meme do Homem-Aranha no lugar da foto. A foto nunca aparece.
- Entre 1:06 e 1:24 a mesma fala aparece em três lugares ao mesmo tempo (balão embaixo, painel Chat à direita, pensamento no alto). É exatamente o erro 4 da crítica do AU4.
- Spoiler do próprio gancho: o pensamento do Azul "Amarelo é meu par, então se ele for expulso eu morro junto" fica na tela de 1:58 a 2:07; o narrador só revela "o motivo? O Amarelo era o par dele" em 2:09. Quando o carimbo chega, o público já leu. O Casal nunca foi plantado antes.

**5. Tela parada em trechos que deviam ser os mais fortes.** Reunião 2 com a grade vazia de 1:50 a 1:58 (8 s só com narração). Ejeção do Vermelho: 7,3 s com o mesmo texto fixo (1:26 a 1:33; o AU4 pedia 4 a 5 s). "VOTAÇÃO ANULADA": 8 s com o carimbo parado (2:08 a 2:16), um único meme aos 2:15. Mapa do Polus: o título "MAPA NOVO: POLUS" fica cortado pelo movimento da câmera em 0:26 a 0:32 ("MA...LUS").

**6. A melhor reviravolta da partida ficou de fora.** Pelo log: no tique 2 o Banana (Camuflador) se camufla de Vermelho até o tique 10; no tique 3 o Cinza (Metamorfo) vira Vermelho. Na reunião, o Marrom jura que viu "o Vermelho colado no corpo no t7": era o Banana, e o pensamento dele na reunião confirma ("Marrom viu 'Vermelho' (eu, disfarçado) perto do corpo"). Eram TRÊS Vermelhos e a nave expulsou o de verdade. A prévia só fala em "dois Vermelhos", e com isso perde justamente a ligação com o frio.

**7. Cartões que precisam de conserto (regra: texto exato).**
- O cartão do @LELOHJ foi emendado ("FUNÇÃO: DOCTOR. Consegue carregar ...", sem a linha CLASSE e em minúsculas): não é o texto exato.
- O cartão do @pensamentosdeumautista467 foi cortado em "Mapa Polus, por favor" sem reticências; o comentário inteiro pede "e garanta que o canibal finalmente coma alguém", e o Canibal não existe em nenhuma partida do Polus (logs5 partidas 1 a 3). Mostrar só a primeira metade sem "..." esconde uma promessa que não foi cumprida.
- Conferir se o ícone de balança do carimbo "VOTAÇÃO ANULADA" (2:08) é SVG próprio; a crítica do AU4 já tinha achado glifo de emoji ali.
- Conferir a etiqueta de sala no frio: ela diz ELÉTRICA durante todo o trecho (0:00 a 0:10), mas no log a morte da Rose é em Segurança (tique 59, Banana "matar Rose ... em Segurança"); o Banana virou Rose na Elétrica no tique 57.

**8. Sobre o público.** Procurei nos comentários do AU3 e do AU4 reclamações de abertura longa ou de ritmo (enrolação, demora, lento, ritmo, corrido...): zero. Mas a crítica do AU4 já avisou que isso não prova nada (não há gráfico de retenção). O que temos é o Felipe dizendo que sentiu corrido, e os quadros confirmam.

---

## 2. A ordem certa

Regra de ouro: cada coisa só aparece depois do que o espectador precisa para entendê-la, e cada função é explicada no tique em que age (regra 2 do AU4), com um contador de tique sempre na tela.

Ordem proposta (cronológica pelo log, com um único flash-forward):

1. Teaser curto do tique 59, com a etiqueta "TIQUE 59 · FIM DA PARTIDA 1".
2. Rebobinar ("VOLTANDO AO TIQUE 1") e título.
3. Quem pediu o quê: Davi, resposta do Felipe, o Polus, dois pedidos atendidos.
4. Tique 1: o Casal (planta a regra que paga no fim).
5. Tique 2: o Camuflador copia o Vermelho (paga o teaser).
6. Tique 3: o Metamorfo também vira Vermelho (o espectador passa a saber que há três Vermelhos).
7. Tique 5: Doutor e Chato.
8. Tique 7: a morte do Bordo.
9. Tique 8: reunião 1 (foto, Cinza, Marrom, o Banana por trás do "Vermelho no corpo"), ejeção.
10. Tique 30 a 39: o Anjo da Guarda e os dois escudos no Branco.
11. Tique 39: o Branco aperta o botão, votos, o Juiz anula (paga o Casal).
12. Fecho: "faltam 20 tiques" para a Rose da abertura.

**O frio deve continuar?** Sim, mas curto e etiquetado, e com pagamento dentro da própria prévia. Por quê: a crítica do AU4 e o Felipe aprovaram o frio como gancho, e ele é a melhor imagem do episódio. O que bagunçava era (a) não dizer que era o tique 59, (b) 11,6 s, (c) nunca ser pago. Como fazer sem bagunçar a ordem: 7,5 s, etiqueta "TIQUE 59", rebobinar visível ("VOLTANDO AO TIQUE 1", relógio girando ao contrário, whoosh) e pagamento em 2 lugares: aos 0:39, quando o narrador diz "Lembra da outra Rose? Era o Banana", e no fecho, "faltam vinte tiques pra aquela Rose da abertura".

Plano B, se o Felipe achar que mesmo assim é fora de ordem: tirar o frio do começo e usar a cena k01 como último beat da prévia (a Rose é morta, corte seco para "continua"), abrindo direto com o gag do Davi aos 0:00 e o título aos 0:06.

---

## 3. Comentários no começo

**Meio-termo.** A crítica do AU4 recomendou no máximo 3 cartões em 12 s. Para atender o Felipe sem arrastar, a unidade passa a ser o beat, não o cartão: 3 beats com ritmos diferentes, 21 s de bloco (15 s de cartões e 6 s de voo do mapa), e o jogo começa em 0:33 (na prévia atual começava em 0:40, porque o mapa encolhe de 13,5 s para 6 s e o título deixa de listar funções).
- Beat 1, o gag do Davi (7 s): 8 cartões em ritmo acelerado, cada um segurado menos tempo (1,2 s, 1,0, 0,8, 0,6, 0,5, 0,4...), contador de pedidos subindo até 30 no canto. Lê como uma piada só.
- Beat 2, a resposta (3 s) e o Polus.
- Beat 3, dois pedidos atendidos, 2,5 s cada, com carimbos.
- O resto vira crédito dentro da partida (2 s, etiqueta SVG com @ e curtidas, no tique em que a função age).

**Davi em destaque.** O autor é `@David_alves-p1f`. Contei no JSON: 22 mensagens pedindo Polus no vídeo do Palhaço (AU3, 17/10, só 1 delas com curtida) e 8 no AU4 (23/10, todas com 0 curtidas), 30 no total, mais 5 perguntando "que dia vai lançar o próximo among?" (o Felipe respondeu "Terça feira que vem, já pode esperar"). Não confundir com `@Davinichetti`, outro Davi, dono do comentário fixado do AU4 (21 curtidas: "Pode me fixar sou muito teu fã ... Edit: vlw dms pode adicionar sensor"); só entra como cameo opcional de 2 s.

Sequência do gag (textos exatos; sem emojis, que o vídeo não pode ter; os comentários do Davi com emoji foram deixados de fora de propósito):

| Ordem | Autor | Texto exato | Curtidas | Vídeo |
|---|---|---|---|---|
| 1 | @David_alves-p1f | Coloca o mapa POLUS! E bem legal! | 2 | AU3 |
| 2 | @David_alves-p1f | Eu assisto todos seus vídeos e deixo "gostei" por favor coloque o mapa POLUS! Vou inscrever no seu canal si você fizer o mapa POLUS | 0 | AU3 |
| 3 | @David_alves-p1f | Coloca polus escrevi no seu canal!!! Plsssssssssssssss | 0 | AU3 |
| 4 | @David_alves-p1f | Mapa POLUS! | 0 | AU3 |
| 5 | @David_alves-p1f | Mapa POLUS!!!!!!!!! | 0 | AU4 |
| 6 | @David_alves-p1f | Mapa POLUS!??!!! | 0 | AU4 |
| 7 | @David_alves-p1f | Me responde / Pode colocar o mapa POLUS no próximo vídeo? Pode me responder respondo até depois de amanhã | 0 | AU4 |
| 8 | @David_alves-p1f | Mapa POLUS na próxima? | 0 | AU4 |

Mostrar as curtidas só no cartão 1 ("2 curtidas"); nos outros, o contador de pedidos substitui.

Resposta (3 s, carimbo FEITO, `we-did-it`): `@felipexx0007` (resposta ao cartão 8, AU4): "Ja tá anotado pro próximo EP, pode ficar tranquilo (vai ser focado inteiramente nele inclusive)". É a melhor frase para virar o mapa, porque o próprio Felipe prometeu um episódio "focado inteiramente" no Polus.

Bônus (2 s, carimbo ACERTOU, sobre o voo do mapa): `@NetheritaCraftBr`, post da comunidade, 1 curtida: "eu acho que o 5 de among é o polus(chute, se eu acertar me coloca no video)".

Dois pedidos atendidos (beat 3):

| Autor | Texto exato (o que mostrar) | Curtidas | Carimbo |
|---|---|---|---|
| @LELOHJ | FUNÇÃO: DOCTOR / CLASSE: TRIPULANTE / HABILIDADE: CONSEGUE CARREGAR UM CORPO ATÉ A ENFERMARIA PARA REVIVER O CORPO... (3 linhas como no original, cortado com reticências) | 16 | ENTROU |
| @mr.trollermen | E ele é um neutro q se chama o famuflador / E ele se transformar em outro jogador, q nem o impostor, so q ele é neutro (2 linhas do original, sem o emoji do fim) | 6 | ENTROU |

Créditos dentro da partida (etiqueta de 2 s):
- `@francesbrasileiro`, 1 curtida, no Chato (tique 5): "... o chato è um impostor ... pode desaticar função de pessoas por uns 7tiques ..." (com reticências, é um trecho do meio). Bate com o log: o Chato desliga a Rose do tique 5 ao 12, 7 tiques.
- `@reverso_2244`, 8 curtidas, na morte do Bordo (tique 7): "por favor lembre aos impostores de verificar se matou antes de falar que matou" (o original termina com dois emojis; omitir).
- `@pensamentosdeumautista467` (3 curtidas): "Mapa Polus, por favor, e garanta que o canibal finalmente coma alguém". Só usar se o Canibal aparecer em alguma partida do vídeo (não aparece nas partidas 1 a 3 do Polus); nesse caso, mostrar o texto inteiro. Cortar em "por favor" sem reticências, como na prévia atual, não vale.
- Outros que pediram Polus e podem entrar no "coro" do gag em 1 s cada: `@Juninho-x8s` "Mapa polus por favorrrrrrrrrrrr" (0), `@CláudiaLúcia-d2c` "MAPA POLUS" (0).

Nota sobre o "CONSERTADO": no log da partida 1 o Marrom escreveu "matei" (ou "fui eu") em 7 mensagens (tiques 7, 8, 28, 45, 46, 58 e 59) e todas batem com mortes reais (Bordo, Coral, Caqui, Roxo). A única exceção é o Cinza no tique 39 ("Matei Branco no Escritório"), que foi um ataque bloqueado pelo escudo do Anjo; por isso o carimbo só vale na cena do Bordo ("MATOU MESMO"), não como promessa geral do episódio.

---

## 4. Roteiro novo da prévia (~2:31)

Convenções: HUD de tique sempre visível (canto superior, SVG); "chip" é a etiqueta SVG de time (TRIPULANTE, IMPOSTOR, NEUTRO); `[pensamento]` = voz do personagem com eco (aecho), voz normal, nunca sussurro; falas e pensamentos são copiados do log (cortados só em fim de frase). Uma única superfície de texto por vez nas reuniões (balão grande, sem o painel Chat e sem pensamento junto). O número entre parênteses é palavras por segundo.

**k01 · 0:00 · 7,5 s · frio, TIQUE 59** (2,5)
- Tela: etiqueta "TIQUE 59 · FIM DA PARTIDA 1"; a Rose e o Banana disfarçado de Rose lado a lado na Segurança; `spiderman-pointing` no instante em que as duas aparecem; zoom no golpe com `faca` no mesmo quadro em que o corpo cai.
- Narração: "Essa é a Rose. E essa... também é a Rose. Só que uma delas acabou de matar a outra."
- Log: tique 59, morte, assassino Banana, aparente Rose, vítima Rose, Segurança; camuflagem do Banana em Rose no tique 57.

**k02 · 0:07,5 · 4,5 s · rebobinar e título** (1,3)
- Tela: relógio SVG girando ao contrário, "VOLTANDO AO TIQUE 1", `whoosh`; título "COLOQUEI 18 IAs NO POLUS", kicker "EPISÓDIO 5", sem lista de funções.
- Narração: "Among Us das IAs, episódio cinco." (`impact-epic` no título)

**c01 · 0:12 · 7 s · o Davi pediu** (1,9)
- Tela: fundo estrelado; os 8 cartões do Davi em ritmo acelerado, cada um com `pop`, contador SVG "PEDIDOS DE POLUS" subindo de 1 até 30, chip "@David_alves-p1f" fixo.
- Narração: "Esse é o Davi. Ele pediu o Polus. Trinta vezes. Em dois vídeos."
- Fonte: contagem acima (22 no vídeo do Palhaço + 8 no AU4).

**c02 · 0:19 · 9 s · a resposta e o mapa** (1,9)
- Tela: cartão da resposta do Felipe (3 s) com carimbo FEITO e `we-did-it`; corte para o voo de câmera pelo Polus (6 s) com 4 salas legendadas (Nave de Pouso, Laboratório, Descontaminação, Elétrica), título "MAPA NOVO: POLUS" fixo no canto (não cortado pela câmera), chip "18 IAs · 4 IMPOSTORES"; cartão do @NetheritaCraftBr com ACERTOU por 2 s.
- Narração: "E a resposta foi: tá anotado. Davi... chegou o Polus. O planeta gelado. Dezoito IAs, quatro impostores."

**c03 · 0:28 · 5 s · mais dois pedidos** (2,4)
- Tela: cartões do @LELOHJ (16 curtidas) e do @mr.trollermen (6), 2,5 s cada, carimbos ENTROU com `pop`.
- Narração: "Mais dois pedidos: o Doutor, do LELOHJ, e o Camuflador, do mr.trollermen."

**g01 · 0:33 · 6 s · TIQUE 1, o Casal** (2,5)
- Tela: Amarelo e Azul ligados por uma linha com coração partido em SVG; chips IMPOSTOR (Amarelo) e TRIPULANTE (Azul); a linha do chat dos impostores: "Sou casal com Azul; evitem matar ou acusar Azul." (Amarelo, tique 1).
- Narração: "Partida um. Amarelo e Azul são um Casal: se um morre, o outro morre junto."
- Esta cena planta a regra que paga em m03.

**g02 · 0:39 · 13 s · TIQUE 2, o Camuflador** (2,6)
- Tela: o Banana (chip NEUTRO, "estreia: MiMo, da Xiaomi") no Depósito; efeito de camuflagem e o sprite vira Vermelho; etiqueta "CAMUFLADOR · ideia de @mr.trollermen"; logo depois, tela de pensamento.
- Narração: "Lembra da outra Rose? Era o Banana, o Camuflador: ele copia o rosto de outro jogador."
- [pensamento do Banana]: "Vou me camuflar agora enquanto ninguém vê, depois me mato alguém e as testemunhas acusam a cor errada." (log, tique 2; o "me mato" é do original)
- Log: tique 2, camuflagem Banana em Vermelho, Depósito, até o tique 10.

**g03 · 0:52 · 6,5 s · TIQUE 3, o Metamorfo** (2,6)
- Tela: o Cinza (chip IMPOSTOR) no Laboratório vira Vermelho (animação de transformação); contador SVG "VERMELHOS NA NAVE: 3 (1 DE VERDADE)" com os três sprites.
- Narração: "O Cinza é o Metamorfo: vira qualquer um. E virou o Vermelho. Três Vermelhos, um de verdade."
- Log: tique 3, transformação Cinza em Vermelho, Laboratório. O Banana ainda está camuflado até o 10 e o Cinza tem metamorfoDuracao 8.

**g04 · 0:58,5 · 11 s · TIQUE 5, o Doutor e o Chato** (2,4)
- Tela: a Rose (chip TRIPULANTE, etiqueta "DOUTOR · ideia de @LELOHJ"); depois o Marrom (chip IMPOSTOR, "CHATO · ideia de @francesbrasileiro: ...por uns 7tiques..."); no instante da frase "Desligou a dela" o carimbo "FUNÇÃO DESATIVADA · 7 TIQUES" com `error-beep` no mesmo quadro e o meme `cala-a-boca`.
- Narração: "A Rose é o Doutor: carrega um corpo e revive. O Marrom é o Chato: desliga a função de alguém. Desligou a dela, por sete tiques."
- Log: tique 5, Chato, alvo Rose (Doutor), até o tique 12.

**g05 · 1:09,5 · 7 s · TIQUE 7, a morte do Bordo** (2,6)
- Tela: Marrom e Bordo no Admin, zoom, `faca` no quadro da facada; em seguida a linha do chat dos impostores "Matei Bordo no Admin, corpo lá." com o carimbo SVG "MATOU MESMO" e o crédito "@reverso_2244 · 8 curtidas".
- Narração: "Tique sete: o Marrom mata o Bordo, no Admin. Avisa os parceiros: matei. E dessa vez é verdade."
- Log: tique 7, morte, Marrom, Bordo, Admin; chat do Marrom no tique 7.

**r01 · 1:16,5 · 9,5 s · REUNIÃO, TIQUE 8, a foto** (2,4)
- Tela: alarme SVG "REUNIÃO · TIQUE 8" (Marrom reportou o corpo do Bordo); polaroid desenhada em SVG da Sala de Espécimes com dois Vermelhos, etiqueta "FOTO DO ROXO · TIQUE 5" (o meme `spiderman-pointing` entra sobre a foto, não no lugar dela); chip INFLUENCER no Roxo; seta do Roxo apontando o Vermelho real.
- Narração: "Reunião. O Roxo é o Influencer: tira fotos. A do tique cinco mostra dois Vermelhos. E ele viu um Vermelho saindo do duto."
- Log: foto do Roxo no tique 5 (Vermelho e Vermelho, Especime); Roxo fala que viu o Vermelho sair de duto nos tiques 4 e 6 (eram o Cinza disfarçado, aparente Vermelho nos dois dutos).

**r02 · 1:26 · 8,5 s · o Cinza** (2,7)
- Tela: só o balão grande do Cinza (sem chat, sem pensamento), zoom lento no rosto, `visible-confusion` no fim da fala.
- Narração: "O Cinza, o Metamorfo, solta essa:"
- Fala do Cinza: "Eu sou o Vermelho de verdade. O outro Vermelho da foto é o impostor usando meu nome."
- Reserva (+4 s, só se couber): [pensamento do Cinza] "Preciso usar o segundo Vermelho como isca e descartar a história da Rose."

**r03 · 1:34,5 · 12 s · o Marrom e o terceiro Vermelho** (2,8)
- Tela: balão do Marrom; depois o HUD volta para "TIQUE 7" com um flashback de 2 s do Banana de Vermelho entrando no Admin, o contador "VERMELHOS: 3" reaparece e um carimbo SVG "O TERCEIRO VERMELHO"; tela de pensamento.
- Narração: "Aí o Marrom ajuda:" (fala) e depois "Esse Vermelho era o Banana."
- Fala do Marrom: "Eu tava em Admin fazendo tarefa e vi o Vermelho aparecer colado no corpo no t7."
- [pensamento do Banana]: "Marrom viu 'Vermelho' (eu, disfarçado) perto do corpo."
- Log: reunião do tique 8, Banana disfarçado de Vermelho; no tique 7 o Banana vai ao Admin.

**r04 · 1:46,5 · 5 s · ejeção** (2,0)
- Tela: ejeção com o texto inteiro desde o primeiro quadro: "Vermelho não era um Impostor. (Cientista)" e "4 Impostores restantes", `impact` na primeira batida e `sad-pablo` aos 2 s; sem digitação.
- Narração: "E a nave expulsou o único Vermelho que era Vermelho."
- Log: fim da reunião do tique 8, expulso Vermelho, eraImpostor falso, papel Cientista; impostores restantes: Amarelo, Marrom, Lima, Cinza.

**a01 · 1:51,5 · 7,5 s · o Anjo da Guarda** (2,5)
- Tela: o Vermelho vira fantasma com halo SVG; HUD salta "TIQUE 8 → 30" com o relógio avançando; dois escudos verdes aparecem sobre o Marrom e o Cinza com a etiqueta SVG "IMPOSTOR" em cada um e o meme `facepalm` (ou equivalente do pacote).
- Narração: "Ele voltou como Anjo da Guarda: dá escudo pros vivos. No começo, escolheu mal: o Marrom e o Cinza."
- Log: escudo_anjo do Vermelho no Marrom (tique 9) e no Cinza (tique 21); fantasma_funcao Anjo no tique 8.

**a02 · 1:59 · 8 s · duas vezes o Branco** (2,0)
- Tela: HUD "TIQUE 34": o Amarelo ataca o Branco no Laboratório, zoom, escudo com anel verde grande (nunca o círculo minúsculo do AU4), carimbo SVG "BLOQUEADO" e `escudo`; HUD "TIQUE 39": o Cinza ataca o Branco no Escritório, mesmo efeito, `stonks`. Linha do tempo SVG no pé da tela com 3 marcas de escudo (30, 34, 39).
- Narração: "Tique 34: o Amarelo ataca o Branco. Bloqueado. Tique 39: o Cinza tenta. Bloqueado de novo."
- Log: escudo do tique 34 (assassino Amarelo, vítima Branco, Laboratório, Vermelho anjo) e do 39 (assassino Cinza, vítima Branco, Escritório). O escudo do tique 30 (Amarelo na Rosa) fica só como marca na linha do tempo.

**m01 · 2:07 · 5,5 s · o botão** (2,5)
- Tela: o Branco aperta o botão no Escritório; carimbo "REUNIÃO DE EMERGÊNCIA · TIQUE 39"; balão do Branco.
- Narração: "O Branco aperta o botão de emergência."
- Fala do Branco: "O escudo me salvou nas duas vezes."

**m02 · 2:12,5 · 4,5 s · os votos** (2,2)
- Tela: barras de voto SVG subindo: Amarelo 9, Cinza 4, Azul pulou; as 9 fotos pequenas votando no Amarelo; chip IMPOSTOR no Amarelo.
- Narração: "Nove votos no Amarelo, que era impostor. Ele ia sair."
- Log: votos da reunião do tique 39 (Rosa, Laranja, Branco, Roxo, Lima, Cinza, Banana, Caqui e Rose no Amarelo; Amarelo, Preto, Marrom e Ciano no Cinza; Azul pular).

**m03 · 2:17 · 9 s · o Juiz anula** (2,7)
- Tela: Azul com o chip JUIZ; martelo SVG (não o glifo de balança); linha ligando Amarelo e Azul acende (o Casal do g01); estouro `boom` e carimbo grande inclinado "VOTAÇÃO ANULADA" que ocupa a tela, depois `haja-coracao`.
- Narração: "Mas o Azul é o Juiz." (antes do pensamento) e, depois do carimbo, "Pra salvar o parceiro."
- [pensamento do Azul]: "Amarelo é meu par, então se ele for expulso eu morro junto."
- Ordem exata do AU4 (p207): pensamento, `boom`, carimbo, reação. O pensamento só aparece aqui, nunca durante a reunião.
- Log: tique 39, evento juiz (Azul, teriaSido Amarelo) e fim_reuniao anulada Azul.

**z01 · 2:26 · 5 s · fecho** (2,4)
- Tela: congela e escurece o frame de k01 (a Rose e a Rose), com o HUD "TIQUE 39 → 59" e a contagem "FALTAM 20"; título "CONTINUA NO EPISÓDIO 5", `riser`.
- Narração: "O Amarelo escapou. E faltam vinte tiques pra aquela Rose da abertura."

**Resumo do orçamento:** pré-partida 33 s (k01, k02, c01, c02, c03), partida 1 min 58 s. Total 151 s (2:31).

Se o Felipe quiser ~2:20: cortar c03 (5 s; os dois créditos já aparecem dentro de g02 e g04) e aparar a01 e a02 para 11 s no total (-4,5 s). Para ~2:15, tirar também o pensamento do Banana em g02 (-6 s), deixando só a narração. Não cortar g01, g03, r01 nem m03: são as cenas que plantam e pagam.

Componentes novos ou ajustes (para o Remotion): HUD de tique, transição de rebobinar, carimbos SVG (MATOU MESMO, BLOQUEADO, O TERCEIRO VERMELHO, VOTAÇÃO ANULADA com martelo), polaroid da foto do Influencer, contador de Vermelhos, barras de votos, chips de time, e uma superfície de texto única nas reuniões.

---

## 5. Regras de ritmo para o episódio 5 inteiro

1. **Ordem do espectador, não ordem de montagem.** Plantar antes de pagar, sempre: Casal em uma frase no tique 1 e pagamento no Juiz; Camuflador e Metamorfo antes da reunião em que eles confundem a nave. Quem planta e quem paga ficam na mesma partida, no máximo a 60 s um do outro.
2. **Uma função por cena, em uma frase de até 12 palavras, no tique em que age.** Nunca nomear função que não age naquele trecho (o título com 7 nomes some). Máximo de 2 funções novas por janela de 30 s.
3. **Contador de tique visível o tempo todo e todo salto de tempo anunciado** ("TIQUE 8 → 30"). Nenhum "t7" falado sem a tela mostrar o tique.
4. **Cena nunca abaixo de 5 s nem acima de 12 s sem mudar a imagem, e no máximo 2 efeitos a cada 8 s.** Cena de reação ou carimbo de 3 s só se for colada na anterior (mesma ação). Tela com texto fixo (ejeção, resultado, grade vazia) não passa de 5 s.
5. **Efeito e som no mesmo quadro do fato.** O `error-beep`, a `faca` e o `escudo` ficam presos ao tique do evento (âncora), não à palavra do narrador. Se a narração está atrasada em relação à imagem, mexe-se a narração.
6. **Reunião: uma superfície de texto por vez, duas ou três falas-chave, o pensamento só depois do fato.** Foto do Influencer ou replay de 2 s do tique citado em toda acusação com número ("t7"). Pensamento com eco, voz normal, nunca sussurro, e sempre depois que o público viu o que ele explica.
7. **Comentários em beats, não em fileiras.** No máximo 3 beats (uns 15 s de cartões) antes da primeira partida; texto exato (com reticências se cortar, sem emoji) e curtidas reais; quem fez a função ganha uma etiqueta de crédito de 2 s dentro da cena em que ela age. Nunca prometer no cartão o que o vídeo não mostra (Canibal, "CONSERTADO").
8. **Cada vitória do Anjo, bomba, escudo ou revive é um mini-evento** (zoom, carimbo SVG, anel grande). E antes de entregar, os Haikus avaliam cada 30 s e as cenas com nota baixa são refeitas, com atenção especial aos trechos de reunião.
