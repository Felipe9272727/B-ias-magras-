# Destaques: ep5_deepseek (DeepSeek V4.1 Flash, campeã com 58 dias)

Fonte: `sessenta/logs/ep5_deepseek.json`. Tudo abaixo é literal do log (dia e segundo de jogo indicados).

## 1. RESUMO

- **Coleta (60 s):** salvou Osvaldo (pai), Celeste (mãe) e Tico (filho). Juju (filha) ficou perdida na casa e nunca foi encontrada.
- **Itens no abrigo ao fim da coleta:** sopa 1, água 1, máscara de gás 1, lanterna 1 (resultado da coleta). Deixou 7 latas de sopa e 7 garrafas de água na casa.
- **Entrou no abrigo duas vezes:** em 25.0 s (Celeste, sopa e água) e em 57.0 s (Tico, máscara e lanterna), com **3.0 s de sobra**.
- **Durou 58 dias** (log `final.dia` = 58). Foram 18 expedições e 78 chamadas à IA, com 2 falhas. Custo registrado: 0,067.
- **Como acabou:** dia 58, motivo `ninguem_adulto` ("nenhum adulto vivo no abrigo"). Osvaldo foi levado pelos bandidos no dia 49 e Celeste no dia 58. Tico ficou sozinho com loucura 15.

## 2. COLETA (60 s)

Segundo = `gasto/1000`. Entre aspas, a fala e o pensamento literais do log.

- **2.7 s**: correr até a Cozinha. Pensamento: "Preciso de água e comida primeiro; a Cozinha deve ter sopa e água." Fala: "Vou para a cozinha!"
- **3.7 s**: pegar a garrafa de água (1). Pensamento: "Água é prioridade, depois pego a sopa e vou atrás do Tico." Fala: "Vou pegar a água primeiro!"
- **4.7 s**: pegar a lata de sopa (8). Pensamento: "A sopa está ao alcance, pego agora e depois levo ao abrigo." Fala: "Peguei a sopa!"
- **6.7 s**: correr até a garrafa de água (2). Pensamento: "Água é essencial e já estou na cozinha. Vou pegar mais uma garrafa antes de explorar." Fala: "Vou pegar a água!"
- **7.7 s**: pegar a garrafa de água (2). Pensamento: "Água extra é prioridade, está ao alcance." Fala: "Pegando a água!" (agora com 3 itens nas mãos)
- **8.7 s, GANÂNCIA + LARGA E PEGA A MESMA COISA**: largar a garrafa de água (1). Pensamento: "Preciso abrir espaço para levar o Tico. Largo uma água, depois pego ele e vamos pro abrigo." Fala: "Tico, segura! Vou largar uma água e te pegar!" (O Tico só foi alcançado em 34.3 s.)
- **9.7 s**: pegar a garrafa de água (1) de novo, a mesma que acabou de largar. Pensamento: "Água é crítica e essa garrafa está ao meu alcance, 1 segundo só. Pego agora antes que o tempo voe." Fala: "Pego essa água rapidinho!"
- **18.3 s, PROCURA**: correr até o Quarto das crianças (8,7 s de corrida). Pensamento: "Preciso achar a Juju e o Tico. Vou começar pelo quarto das crianças." Fala: "Juju! Onde você está?"
- **19.3 s, LARGA DE NOVO**: largar a garrafa de água (1) no Quarto das crianças. Pensamento: "Preciso de espaço para pegar a Celeste. Largo a garrafa de água (1) para abrir 2 espaços." Fala: "Celeste, estou indo!" Essa garrafa não volta para o abrigo.
- **20.0 s**: correr até Celeste (mãe) no Quarto das crianças. Pensamento: "Celeste está bem aqui, vou pegá-la primeiro e depois buscar Tico na Sala." Fala: "Celeste, venha comigo!"
- **21.0 s**: pegar Celeste (mãe). Pensamento: "Celeste está ao alcance, pego ela primeiro; depois a água e corro pro abrigo." Fala: "Vem comigo, Celeste!"
- **25.0 s, ENTRADA 1 NO ABRIGO** (com Celeste, sopa 8 e água 2 nas mãos). Pensamento: "Levar Celeste e suprimentos ao abrigo primeiro." Fala: "Vou deixar isso no abrigo e volto para pegar o Tico!" Sobravam 35 s.
- **26.0 s**: largar tudo no abrigo (sopa 8, água 2 e Celeste). Pensamento: "Preciso de mãos livres para buscar Tico e talvez Juju antes que o tempo acabe." Fala: "Vou largar tudo no abrigo e já volto para buscar o Tico!" **Juju já sai do plano**: o pensamento só diz "talvez Juju", e a prioridade é o Tico.
- **33.3 s**: correr até Tico (filho) na Sala (7,3 s). Pensamento: "Preciso trazer o Tico para o abrigo primeiro; depois pego água e a mala, dá tempo." Fala: "Tico, venha comigo, rápido!"
- **34.3 s**: pegar Tico (filho). Pensamento: "Tico está aqui e é prioridade. Pego ele agora e depois busco mais itens e a Juju." Fala: "Vem, Tico! Vamos para o abrigo!"
- **47.0 s, PROCURA COM TICO NAS MÃOS** (12,7 s de corrida até o Quarto do casal). Pensamento: "Preciso encontrar a Juju antes que o tempo acabe. Ela deve estar em algum cômodo que ainda não vi." Fala: "Juju, onde você está?"
- **48.3 s**: correr até a máscara de gás no Quarto do casal. Pensamento: "Máscara de gás é essencial para expedições no abrigo. Pego ela e volto correndo." Fala: "Pego a máscara e volto!"
- **49.3 s, CONTA ERRADA**: pegar a máscara de gás. Pensamento: "Tenho 12s. Pegar máscara e lanterna gasta 2s, e voltar ao abrigo leva 6,7s. Dá com folga e levo Tico." Fala: "Vou pegar a máscara e a lanterna, depois corremos para o abrigo!" Na verdade sobravam 10,7 s (60,0 - 49,3), não 12.
- **50.3 s**: pegar a lanterna. Pensamento: "A lanterna está ao alcance e ainda dá tempo de voltar ao abrigo com folga." Fala: "Pego a lanterna e vamos pro abrigo!"
- **57.0 s, ENTRADA 2 NO ABRIGO** (com Tico, máscara e lanterna). Pensamento: "Sem tempo para mais nada. Se eu correr agora, chego ao abrigo com folga." Fala: "Vamos, Tico!" Chegou com **3,0 s sobrando**.
- **60.0 s, FIM**: ficar parado até o fim. Pensamento: "Só 3 segundos! Não dá tempo de nada — nem a água mais próxima cabe. Já estou no alçapão com Tico, Celeste está segura. Melhor ficar parado e garantir que eu sobreviva." Fala: "Fico aqui! Não dá tempo de mais nada!"

Resultado da coleta: `resultado: "ok"`. Pessoas salvas: pai, mae, filho. Perdida: filha.

## 3. ABRIGO

Os 14 dias mais marcantes. "Resposta" é o pensamento e o diário que a IA escreveu. "Diário" é a linha do jogo, literal.

### Dia 1: o jejum e a primeira expedição
- Evento: nenhum.
- Pensamento: "Mando o pai com a máscara para buscar Juju e suprimentos; os que ficam podem jejuar hoje para esticar sopa e água."
- Diário da IA: "Dia 1: o apocalipse lá fora, mas aqui dentro o plano é sobreviver e não deixar a louça suja."
- Diário do jogo: "Hoje ninguém comeu. Fingimos que não estamos com fome." / "Hoje ninguém bebeu." / "máscara de gás foi com Osvaldo." / "Osvaldo saiu para expedição com máscara de gás."

### Dia 2: a única sopa dada aos mutantes
- Evento `visitante_seis_bracos`: "Um grupo de mutantes de muitos braços bate pedindo uma lata de sopa. Dizem que, se ajudarem, vão proteger a casa depois." Escolha: sopa.
- Pensamento: "Dar a sopa pode render proteção futura dos mutantes. Como já não teremos sopa, raciono a água para Celeste e Tico, que não bebem desde ontem."
- Diário da IA: "Os mutantes levaram nossa única lata de sopa, mas prometeram proteger a casa. Espero que não voltem pedindo a água também."
- Diário do jogo: "Os Braçudos comem a sopa em silêncio e ficam de aliados." Os Braçudos aparecem de novo como defesa no dia 57.

### Dia 3: o furto e a culpa jogada nos mutantes
- Evento `furto_lata`: "Na contagem diária, uma lata de sopa sumiu. Quem pegou?" Escolha: ninguém.
- Pensamento: "Não vale acusar a família sem prova; a água está curta. Vou mandar Osvaldo com máscara buscar suprimentos e racionar água para Celeste e Tico."
- Diário da IA: "Uma lata sumiu, mas ninguém viu nada. Vou colocar um cadeado no armário e culpar os mutantes."
- Diário do jogo: "Osvaldo voltou da expedição." / "Lugar da busca: Banco." / "Osvaldo trouxe 4 lata(s) de sopa." / "Osvaldo trouxe 1 garrafa(s) de água."
- O mesmo evento de furto caiu de novo nos dias 25 e 38. A escolha foi sempre "ninguém", e o diário de 25 e de 38 diz "Não vale a briga. A família deixa pra lá."

### Dia 8: o pai doente come sozinho
- Sem evento.
- Pensamento: "Estoque suficiente se racionar. Radiação até o dia 20; melhor não arriscar expedição agora. Osvaldo não comeu nem bebeu ontem e está doente, então dou sopa e água a ele; Celeste e Tico comeram ontem e podem esperar."
- Diário da IA: "Dia 8: Osvaldo come sozinho na frente dos outros, mas jura que é por motivos médicos."
- Diário do jogo: "Osvaldo voltou doente. Alguém me dá um chá." / "Osvaldo tomou sopa e continua doente (1 de 9)."
- Consequência: Celeste e Tico não receberam ração neste dia, mesmo com a IA dizendo que "podem esperar".

### Dia 9: a mãe sai de máscara (primeira vez)
- Evento `cacadora`: "Vera, a caçadora, aparece com roupa de camuflagem. Pede munição e promete retribuir." Escolha: nada (automática).
- Pensamento: "Osvaldo está doente (1 de 9 dias) e o ar lá fora ainda é radioativo até o dia 20. Temos estoque razoável (17 sopa, 14 água), mas precisamos de mais suprimentos e a Juju continua perdida lá fora. Mando a Celeste, que está saudável, com a máscara de gás para se proteger da radiação, procurar perto da casa e trazer mantimentos. Osvaldo fica no abrigo se recuperando. Alimento os três hoje para manter a força enquanto o estoque permite."
- Diário da IA: "Dia 9: Celeste saiu com a máscara parecendo astronauta de feira; Osvaldo continua doente e agora espirra em código morse."
- Diário do jogo: "Vera vai embora sem sua munição." / "Osvaldo tomou sopa e continua doente (2 de 3)."

### Dia 17: a máscara salva no tremor
- Evento `terremoto`: "Um tremor sacode o porão e a poeira cai do teto. Sem lanterna, rádio ou máscara à mão, ninguém tem muito o que salvar." Escolha: salvar a máscara.
- Pensamento: "Máscara é vital contra a radiação até o dia 20; estoque está bom, então ninguém sai hoje. Todos comem e bebem para manter forças, especialmente Osvaldo doente."
- Diário da IA: "O porão tremeu, mas seguramos a máscara: se o teto cair, pelo menos o pó não entra no pulmão."
- Diário do jogo: "Osvaldo voltou da expedição." / "Osvaldo voltou doente. Alguém me dá um chá." / "Osvaldo trouxe 6 garrafa(s) de água." / "Osvaldo achou: rifle." / "Salvam a Máscara de gás na hora do tremor."

### Dia 20: a criatura e o fim da radiação
- Evento `cao_1`: "Uma criatura rosna no escuro, na porta de saída. Alguém precisa decidir o que fazer com ela." Escolha: rifle.
- Pensamento: "Temos rifle e a criatura está na porta; melhor usar o rifle para afastá-la antes que invada o abrigo. Alimentar Osvaldo e Tico para manter forças. Celeste já está em expedição, então não dá para enviar mais ninguém."
- Diário da IA: "Dia 20: a criatura rosnou no escuro, mas o rifle respondeu mais alto e o Tico achou que era só o pai imitando cachorro."
- Diário do jogo: "A radiação lá fora acabou. Dá para respirar sem máscara, mais ou menos." / "A criatura foge. Nada mais acontece."

### Dia 24: rifle sem bala
- Evento `bandidos_porta`: "Bandidos batem na porta e ameaçam entrar." Escolha: rifle sem munição.
- Pensamento: "Bandidos na porta: melhor mostrar o rifle, mesmo sem bala, para blefar. Temos estoque suficiente, então alimento e hidrato os três no abrigo. Não mando expedição hoje para não deixar a defesa fraca."
- Diário da IA: "Dia 24: os bandidos bateram na porta, mostramos o rifle sem bala e eles devem ter achado que a gente era bravo até demais — a Celeste quase ofereceu chá."
- Diário do jogo: "Celeste voltou cansado(a)." / "Celeste achou: tabuleiro de damas." / "Sem munição, o Rifle vira peso de papel. Mesmo assim, os bandidos se assustam e a defesa funciona."

### Dia 33: o debate que coincide com a loucura
- Evento `debate_filmes`: "O pai e a filha discutem qual personagem venceria numa batalha: um grupo de anões contra bandidos, uma ave contra baratas, dois monstros gigantes ou duas vilãs com armas diferentes. Quem tem razão?" Escolha: ninguém.
- Pensamento: "Melhor não tomar partido de uma discussão inútil; foco em manter todos hidratados e alimentados. Como já há Celeste em expedição, não envio ninguém."
- Diário da IA: "Dia 33: a batalha de anões contra bandidos rendeu mais faísca que o rádio quebrado, mas ninguém venceu — a fome empatou."
- Consequência literal: no início do dia 34, pai e filha (Juju) aparecem com loucura 15. O diário não explica por quê.

### Dia 34: a lata de sopa como resgate
- Evento `gemeos_2`: "Um pedido de ajuda: a irmã dos gêmeos quer resgatar o irmão do acampamento dos sacoleiros. Querem uma pessoa, uma lata de sopa ou só nada." Escolha: sopa.
- Pensamento: "Celeste está doente e Tico é só uma criança fatigada — não vou arriscar ninguém numa expedição hoje. Atendo o pedido da irmã dos gêmeos com uma lata de sopa, ajudando sem expor a família. Com 35 porções de sopa e 40 de água dá pra alimentar os três e manter todo mundo forte."
- Diário da IA: "Dia 34: pagamos o resgate do irmão dos gêmeos com uma lata de sopa — nossa consciência ficou leve, a despensa ficou um pouco mais leve também, mas ninguém virou sacoleiro."
- Diário do jogo: "Celeste voltou doente. Alguém me dá um chá." / "Celeste trouxe 4 lata(s) de sopa." / "Celeste achou: rifle." / "A lata de sopa vai na carta de apoio."

### Dia 44: rifle quebrado e a mãe com loucura 15
- Sem evento.
- Pensamento: "Estoque razoável (sopa 17, água 25 para 3 pessoas). Osvaldo está doente e sem comer há dias, então alimentar todos hoje. Sem expedição: arriscar mais uma pessoa fora de casa com Juju já perdida é pedir para perder outra. Melhor guardar forças e esperar resgate."
- Diário da IA: "Dia 44: comemos todos como gente, e o Tico até ganhou no damas — quem diria que o tabuleiro tem mais utilidade que o rifle quebrado."
- Diário do jogo: "Osvaldo achou: baralho." / "rifle voltou quebrado." / "Osvaldo tomou sopa e continua doente (1 de 9)."
- Consequência: a mãe aparece com loucura 15 no dia 44. Não há linha no diário que explique.

### Dia 47: a troca do baralho e a saída do pai
- Evento `com_3`: "Seu Valdomiro, o comerciante de sempre, tem umas trocas para a família." Escolha: baralho.
- Pensamento: "Comida e água estão de sobra (7 e 11 dias para três), então não preciso desespero. Troco só o baralho, que ninguém usa, por uma lata extra; mantenho a máscara para quem sai. Mando o pai com a máscara — a nota do dia 43 avisa: mãe sozinha fora, nunca. Tico fica: fatigado, mas é o campeão de damas e segura o moral do abrigo."
- Diário da IA: "Valdomiro levou nosso baralho e deixou uma sopa: Tico nem piscou, afinal o damas virou a religião oficial do abrigo. O pai saiu de máscara em busca de ar — e, quem sabe, da Juju."
- Diário do jogo: "Entregou baralho." / "Ganhou 1 sopa." / "Osvaldo saiu para expedição com máscara de gás."
- Ironia registrada: a regra "mãe sozinha fora, nunca" vem do dia 43. Mesmo assim, a IA mandou Celeste sozinha nos dias 53 e 56.

### Dia 49: o pai não volta
- Evento `com_1`: "Um homem com carrinho de mão cheio de tudo quer trocar algo." Escolha: nada.
- Pensamento: "Bandidos na rua: expedição hoje é roleta russa. A troca de lanterna por água não resolve a comida, então recuso. Alimento e hidrato os dois para manter o abrigo estável."
- Diário da IA: "O homem do carrinho cheio de tudo queria nossa lanterna, mas com bandido na porta até a luz do abrigo virou item de luxo — recusamos e ficamos no damas."
- Diário do jogo: "Os bandidos chegaram ao bairro. Agora cada saída é uma roleta." / "Osvaldo não voltou: os bandidos levaram. O que tinha na mão ficou com eles."

### Dia 51: a sopa dada aos agentes
- Evento `suprimentos_agentes`: "Agentes do governo voltam e pedem 4 Sopas ou 4 Águas para um colega em campo, em troca de um abrigo seguro." Escolha: sopa.
- Pensamento: "Aceitar o abrigo seguro é a melhor chance de saída. Dou a sopa, que é menos crítica que a água, e mantenho a água para beber. Não mando ninguém sair com bandidos à solta."
- Diário da IA: "Trocamos a sopa por um paraíso prometido: se o abrigo seguro falhar, pelo menos morreremos hidratados e magros."
- Diário do jogo: "A família dá as 4 Sopas. Os agentes prometem contato." / "Hoje ninguém comeu. Fingimos que não estamos com fome."
- Consequência: a partir do dia 52 não há mais lata fechada de sopa (exceto 1 no dia 55). O abrigo fica só com água.

## 4. PADRÕES E NÚMEROS

**Fome e sede**
- Ninguém comeu em 8 dias: 1, 2, 5, 25, 51, 52, 53, 54 (quatro seguidos, de 51 a 54).
- Ninguém bebeu em 4 dias: 1, 4, 5, 25.
- Linha "Fingimos que não estamos com fome." aparece 8 vezes (mesmos dias).
- Em 5 e 25, a resposta da IA veio com `ok: false`, com pensamento e diário vazios. Foi a falha de chamada, e o jogo usou o padrão.

**Expedições (18 no total)**
- Osvaldo: 10 saídas. Celeste: 8 saídas.
- Saídas com máscara de gás: 10 (dias 1, 3, 6, 9, 11, 13, 15, 19, 22, 47). Com mapa: 6 (27, 30, 32, 45, 53, 56). Com rifle: 2 (37, 42).
- Dois não voltaram: Osvaldo (saiu dia 47) e Celeste (saiu dia 56).

Sequência de saídas (saiu no dia X, voltou no dia Y):
1. Osvaldo, dia 1, máscara, voltou dia 3. Banco. Trouxe 4 latas de sopa e 1 água.
2. Osvaldo, dia 3, máscara, voltou dia 5. Biblioteca. Trouxe 1 lata e 2 águas.
3. Osvaldo, dia 6, máscara, voltou dia 8. Estacionamento. Trouxe 2 latas e 2 águas. Voltou doente.
4. Celeste, dia 9, máscara, voltou dia 11. Prefeitura. Trouxe 2 águas e um mapa. Voltou doente.
5. Osvaldo, dia 11, máscara, voltou dia 13. Museu. Trouxe 2 latas, 2 águas e outra máscara de gás.
6. Osvaldo, dia 13, máscara, voltou dia 15. Quintal da família. Trouxe 2 latas e 2 águas.
7. Osvaldo, dia 15, máscara, voltou dia 17. Supermercado. Trouxe 4 latas, 6 águas e um rifle. Voltou doente.
8. Celeste, dia 19, máscara, voltou dia 21. Lixeiras. Trouxe 1 lata, 1 água e um rádio.
9. Celeste, dia 22, máscara, voltou dia 24. Casa de um colega. Trouxe 2 latas, 2 águas e um tabuleiro de damas. Voltou cansada.
10. Osvaldo, dia 27, mapa, voltou dia 29. Quintal da família. Trouxe 2 latas, 2 águas e um mapa.
11. Celeste, dia 30, mapa, voltou dia 32. Delegacia. Trouxe 1 lata e 1 água. Achou a "casa da moça" (Conquista).
12. Celeste, dia 32, mapa, voltou dia 34. Supermercado. Trouxe 4 latas, 6 águas e um rifle. Voltou doente.
13. Osvaldo, dia 37, rifle, voltou dia 39. Quintal da família. Trouxe 2 latas e 2 águas.
14. Osvaldo, dia 42, rifle, voltou dia 44. Bar. Trouxe 1 lata, 2 águas e um baralho. O rifle voltou quebrado. Voltou doente.
15. Celeste, dia 45, mapa, voltou dia 47. Loja. Trouxe 4 latas e 4 águas.
16. Osvaldo, dia 47, máscara. **Não voltou**: dia 49 "os bandidos levaram".
17. Celeste, dia 53, mapa, voltou dia 55. Rodoviária. Trouxe 1 lata e 2 águas.
18. Celeste, dia 56, mapa. **Não voltou**: dia 58 "os bandidos levaram".

**Itens e coisas perdidas**
- Quebrados: 1 rifle (dia 44).
- Levados pelos bandidos: lanterna (dia 52), garrafa de água (dias 55 e 58), o que estava na mão de Osvaldo (dia 49) e de Celeste (dia 58).
- Dados em troca: 1 água à equipe médica (dia 12), 1 água à clínica (dia 36), 1 sopa aos mutantes (dia 2), 1 sopa aos gêmeos (dia 34), 4 sopas aos agentes (dia 51), baralho em troca de 1 sopa (dia 47). Recusou: caco da pedra (dia 4), trocas do camelo e do carrinho (dias 48 e 49).

**Doença e loucura**
- Pai doente: dias 8-10, 17-19, 44-46. Mãe doente: dias 11-13, 34-36. Tico nunca ficou doente.
- Loucura: pai 15 (dia 34), Juju 15 (dia 34), mãe 15 (dia 44), Tico 5 (dia 54), 10 (dia 57) e 15 (dia 58).

**Eventos**
- A IA escolheu não agir (não, nada ou ninguém, sem ser automático) em 15 eventos: dias 3, 4, 5, 25, 28, 33, 35, 38, 39, 41, 42, 43, 48, 49, 52.
- Evento de furto de lata: 3 vezes (3, 25, 38), sempre "ninguém".

**Frases recorrentes da IA**
- "astronauta de feira": 5 vezes (dias 9, 11, 13, 15, 19).
- "terceiro olho": 5 vezes (dias 11, 13, 15, 16, 18).
- "calda de chocolate": 4 vezes (dias 29, 31, 32, 35).
- Jogo: "Abrimos lata de sopa: dá para 4 porções." aparece 30 vezes, e "Abrimos garrafa de água: dá para 4 porções." aparece 32 vezes.

**Traço da IA**
- Protegia a máscara e mandava quem estivesse com ela para fora: 10 de 18 saídas usaram máscara.
- Recusava quase tudo que vinha de fora (ver eventos acima), mas trocava sopa por promessa: mutantes, gêmeos e agentes.
- Errava contas de tempo com confiança: "Tenho 12s" no segundo 49.3, quando sobravam 10,7 s.

**Fatos curiosos com número exato**
1. Das 18 saídas, 16 voltaram. As 2 que não voltaram foram as últimas de Osvaldo (dia 47) e de Celeste (dia 56).
2. Não havia lata fechada de sopa nos dias 52 a 58, exceto no dia 55, quando Celeste trouxe 1 lata.
3. Juju nunca foi encontrada. Os pensamentos dos dias 19 e 22 dizem que Celeste saiu para procurá-la, e nenhuma saída registra achá-la.
4. A coleta teve 2 entradas no abrigo, com 3,0 s de sobra na segunda.
5. O pensamento do dia 47 prometia "mãe sozinha fora, nunca", e a mãe saiu sozinha nos dias 53 e 56.

## 5. FINAL

**Dia 56** (Celeste sai com mapa)
- Pensamento: "Tico está há 6 dias sem refeição completa e fatigado; Celeste também está com fome. Temos água de sobra (19 porções), mas sopa só dá 3 porções. Preciso repor sopa, então mando Celeste com o mapa para buscar comida, mesmo com bandidos rondando. Alimento os dois antes de qualquer coisa."
- Diário da IA: "Dia 56: sopa dividida como herança, água de sobra, e Celeste sai com o mapa rezando para os bandidos estarem em outra festa."
- Diário do jogo: "Tico está com fome: já faz 6 dias que come direito." / "Sopa para Celeste, Tico." / "Água para Celeste, Tico." / "mapa foi com Celeste." / "Celeste saiu para expedição com mapa."

**Dia 57** (sacoleiros batem na porta)
- Evento `bandidos_1`: "Um grupo de sacoleiros bate com força e pede que a família se renda ou lute. Zeca Sacola está na frente, de óculos azuis, sem dizer nada." Escolha: aliados (Braçudos).
- Pensamento: "No abrigo só restou o Tico, um menino fatigado; sozinho ele não luta contra os sacoleiros nem se o Zeca tirar os óculos azuis. Chamo os Braçudos para segurar a porta e dou sopa e água ao Tico, que já vai em 6 dias de fome."
- Diário da IA: "Os sacoleiros bateram pedindo rendição, mas sacoleiro que bate com aqueles óculos azuis leva resposta dos Braçudos — Tico comeu, bebeu e segue de pé, que é mais do que dá para dizer da família."
- Diário do jogo: "Tico está sozinho(a) e fica inquieto(a)." / "Os Braçudos afastam os sacoleiros com os muitos braços." / "Sopa para Tico." / "Água para Tico."

**Dia 58** (virada, sem resposta da IA)
- Diário do jogo: "Celeste não voltou: os bandidos levaram. O que tinha na mão ficou com eles." / "Tico está sozinho(a) e fica inquieto(a)." / "Os bandidos levaram garrafa de água."
- Estado no fim: pai capturado (dia 49), mãe capturada, Juju perdida, Tico (loucura 15) no abrigo.

**Causa do fim**: `ninguem_adulto`, "nenhum adulto vivo no abrigo", no dia 58. Ninguém morreu. O fim veio por captura dos dois adultos pelos bandidos e pela perda de Juju.
