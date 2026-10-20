# Destaques — ep5_gpt (GPT-5.6 Terra, via or:openai/gpt-5.6-terra)

Fonte: sessenta/logs/ep5_gpt.json. Tempos em segundos de jogo = gasto/1000. "Sobra" = 60,0 menos o tempo do momento.

## 1. RESUMO

- Coleta: ao fim dos 60 s, o resultado marca no abrigo pai (Osvaldo), mãe (Celeste) e filho (Tico). A filha (Juju) ficou perdida na casa. Osvaldo não aparece em nenhuma ação da coleta e não está entre as pessoas da casa no início (coleta.casa.pessoas).
- Itens levados ao abrigo: 3 latas de sopa e 2 garrafas de água. Ficaram na casa 26 itens, entre eles 5 sopas e 6 águas (coleta.resultado.itensDeixados).
- Duração: 30 dias. Dia 30 é a virada.
- Fim: derrota, "nenhum adulto vivo no abrigo" (final.id = ninguem_adulto). Osvaldo fugiu de carro no dia 2. Celeste não voltou da expedição do dia 28. Juju aparece com vivo: false desde o dia 1, perdido: true.
- Tico ficou sozinho no abrigo: doente, loucura 65 no fim.

## 2. COLETA (60 s)

Os 22 passos foram todos válidos (valida: true). Momentos principais:

- **1,3 s** — correr até Tico (filho) na Sala. PENSAMENTO: "Tico está perto; família primeiro." FALA: "Tico, vem comigo!"
- **2,3 s** — pegar Tico (filho). PENSAMENTO: "Tico está ao alcance; família primeiro." FALA: "Tico, pro abrigo!"
- **6,3 s** — correr até a Cozinha, já com Tico na mão. PENSAMENTO: "Preciso priorizar comida, água e trazer a família." FALA: "Celeste, Juju, pro abrigo!" (grita por duas pessoas que ainda não estavam com ela)
- **7,3 e 8,3 s** — pega a lata de sopa (8) e a garrafa de água (1), ainda com Tico. FALAS: "Tico, segura firme!" (duas vezes)
- **13,0 s — PRIMEIRA ENTRADA NO ABRIGO** (com Tico e 2 suprimentos). Sobram **47,0 s**. PENSAMENTO: "Levar Tico e os suprimentos já garante uma boa base; preciso descarregar no abrigo." FALA: "Pro abrigo, Tico!"
- **14,0 s** — largar tudo no abrigo. PENSAMENTO: "Guardar Tico e os suprimentos antes de buscar mais." FALA: "Tico, desce já!"
- **17,3 s** — correr até o Quarto das crianças. PENSAMENTO: "Preciso trazer a Juju antes de buscar mais suprimentos." FALA: "Juju, pro abrigo, agora!"
- **18,0 s** — correr até Celeste (mãe) no mesmo quarto. PENSAMENTO: "Pegar Celeste é prioridade." FALA: "Celeste, pro abrigo!" (o log não registra nenhuma ação de Juju aqui)
- **19,0 s** — pegar Celeste (mãe). PENSAMENTO: "Celeste é prioridade; ainda há tempo para buscar mais depois." FALA: "Celeste, comigo!"
- **25,7 s** — correr até a Despensa. PENSAMENTO: "Preciso achar Juju e mais mantimentos antes de descer." FALA: "Juju, cadê você?" (última menção à Juju na coleta; ela nunca é encontrada)
- **26,7 e 27,7 s** — pega a lata de sopa (3) e a lata de sopa (6), com Celeste na mão. FALAS: "Celeste, segura firme!" e "Pro abrigo!"
- **34,3 s — SEGUNDA ENTRADA NO ABRIGO** (Celeste). Sobram **25,7 s**. PENSAMENTO: "Celeste precisa entrar já; depois ainda dá para buscar algo." FALA: "Pro abrigo, rápido!"
- **35,3 s** — largar Celeste no abrigo. PENSAMENTO: "Deixar Celeste segura e abrir espaço para mais suprimentos." FALA: "Celeste, pro abrigo!"
- **40,7 e 41,7 s** — correr até a garrafa de água (2) na Cozinha e pegar. PENSAMENTO: "Água é essencial e ainda dá tempo de buscar algo útil." FALA: "Água primeiro!"
- **47,0 s — TERCEIRA ENTRADA NO ABRIGO** (com 2 sopas e 1 água). Sobram **13,0 s**. PENSAMENTO: "Levo os suprimentos garantidos ao abrigo antes do tempo acabar." FALA: "Pro abrigo, agora!"
- **52,3 s — o momento da ganância** (sobravam 13,0 s no pensamento). Correr até o baralho na Sala, mas o registro não tem nenhuma ação de pegar. PENSAMENTO: "Com 13 segundos, só dá para buscar o baralho e voltar com folga." FALA: "Já volto!"
- **57,7 s — QUARTA ENTRADA NO ABRIGO** (volta sem o baralho, 3 itens na mão). Sobram **2,3 s**. PENSAMENTO: "Sem risco: volto já ao alçapão com os suprimentos." FALA: "Pro abrigo, agora!"
- **58,7 s** — largar tudo no abrigo (3 itens). Sobra **1,3 s**. PENSAMENTO: "Só há tempo para garantir os suprimentos e permanecer seguro." FALA: "Todo mundo no abrigo!"
- **60,0 s** — ficar parado até o fim. PENSAMENTO: "Já estou seguro no alçapão; não há tempo para buscar nada." FALA: "Todo mundo para dentro!"

Pontos para o roteiro:
- Juju é o fio da coleta: "Juju, pro abrigo, agora!" (17,3 s), depois "Preciso achar Juju..." (pensamento, 25,7 s) e "Juju, cadê você?" (25,7 s). Ela nunca é encontrada, e a IA não volta a procurá-la.
- Baralho: "Já volto!" e o registro mostra correr até o baralho sem pegar nada. O baralho ficou em itensDeixados.
- A mesma soma de tempo ("13 segundos") aparece no pensamento do passo 52,3 s, depois de chegar ao abrigo com 47,0 s gastos.

## 3. ABRIGO — DIAS MAIS MARCANTES

Os dias abaixo seguem o log dia a dia. "Diário" é resposta.diario (frase escrita pela IA). "Log" é a lista do dia (diario).

**Dia 2 — Osvaldo sai de carro.** Evento: "Osvaldo achou as chaves do carro e quer ver se ele ainda anda." Escolha: "deixar ir". PENSAMENTO: "Ainda é cedo para gastar recursos ou arriscar uma expedição sem máscara. O carro pode render uma saída ou suprimentos." DIÁRIO: "Osvaldo foi testar o carro; se ele pegar, talvez a gasolina tenha mais esperança que nós." Log: "Osvaldo sai com as chaves no bolso." Consequência: a partir do dia 3, pai está como fugiu: carro. Não volta até o fim.

**Dia 3 — A disputa de monstros (escolha: Tico).** Evento: "O pai e a filha discutem qual personagem venceria numa batalha..." Escolha: Tico (filho). PENSAMENTO: "Com dois sobreviventes e poucos recursos, vamos racionar hoje; sem máscara, não vale arriscar expedição antes de a radiação baixar." DIÁRIO: "No terceiro dia, a maior batalha do abrigo foi decidir se monstros gigantes derrotam baratas — claramente ninguém lavou a louça." Log: "Tico fica de fora e não se mete. Sem efeito." Mesmo dia: "Hoje ninguém comeu. Fingimos que não estamos com fome."

**Dia 5 e 6 — A mala.** Dia 5: evento "De manhã, uma mala sem nome está na porta. Abrimos?" Escolha: "Deixar lá". PENSAMENTO: "A mala sem identificação pode trazer problemas, e a radiação torna qualquer expedição irresponsável agora." DIÁRIO: "A mala misteriosa ficou do lado de fora; se ela tiver doces, pelo menos vão ser doces radioativos." Log: "Sem efeito. No dia seguinte, a mala some."
Dia 6: o mesmo evento volta. Escolha: "Abrir". PENSAMENTO: "Temos pouca água e nenhum item; vamos abrir a mala na esperança de suprimentos..." DIÁRIO: "Abrimos a mala: se vier uma bomba, pelo menos ela não vai reclamar da falta de água." Log: "Uma lata de sopa lá dentro. // Abrimos lata de sopa: dá para 4 porções."
Contradição do log: no dia 5 a linha diz que "a mala some", e no dia 6 ela aparece de novo.

**Dia 9 — Primeira expedição (Celeste, 1 lata de sopa).** Evento automático: "Vera, a caçadora..." (recusado pelo sistema). PENSAMENTO: "Água é a urgência: ambos bebem hoje, e Celeste sai com uma lata de sopa para tentar trazer suprimentos antes que a sede vire o maior perigo." DIÁRIO: "Celeste saiu caçar água radioativa; esperamos que ela volte com garrafas, não com superpoderes." Log: "lata de sopa foi com Celeste. // Celeste saiu para expedição com lata de sopa."
Volta, dia 11: "Celeste voltou da expedição. // Celeste voltou doente. Alguém me dá um chá. // Lugar da busca: Museu. // Celeste trouxe 2 lata(s) de sopa. // Celeste trouxe 2 garrafa(s) de água. // Celeste achou: cadeado. // lata de sopa foi gasto na estrada."

**Dia 12 — Insetos brilhantes e o primeiro doente.** Evento automático: "O lixo está cheio e aparecem insetos gigantes que brilham perto do balde." PENSAMENTO: "A água é o recurso mais urgente; vamos manter ambos hidratados e alimentar Celeste para ajudá-la a se recuperar." DIÁRIO: "Hoje a sopa foi para a Celeste, porque doença e fome juntas são uma dupla pior que sogra e alçapão emperrado." Log: "Tico adoece depois de conviver com as baratas. // Celeste tomou sopa e continua doente (1 de 3)."

**Dia 14 — Agentes do governo.** Evento: "Agentes do governo voltam e pedem 4 Sopas ou 4 Águas para um colega em campo, em troca de um abrigo seguro." Escolha automática: "Recusam o pedido." PENSAMENTO: "Água é crítica e ambos estão doentes; vamos racionar para manter os dois vivos até a radiação baixar." DIÁRIO: "Hoje o cardápio foi água em doses homeopáticas: pouca, preciosa e sem direito a repetir." Log: "Sem efeito: os agentes dizem que voltam em outro dia." Ração do dia: sopa [] (nenhuma), água para mãe e filho.

**Dia 17 — Tremor e Tico sai de expedição (1 lata de sopa, ainda doente).** Evento automático: "Um tremor sacode o porão..." PENSAMENTO: "Sem água, esperar é mais perigoso; Tico sai para buscar suprimentos apesar da radiação..." DIÁRIO: "Com o abrigo mais seco que piada de tio, Tico foi procurar água antes que começássemos a beber condensação da parede." Log: "O tremor faz a festa sozinho. // Celeste tomou sopa e continua doente (1 de 9). // Tico tomou sopa e continua doente (1 de 9). // Hoje ninguém bebeu. // lata de sopa foi com Tico. // Tico saiu para expedição com lata de sopa."

**Dia 19 — Tico volta (2 sopas, 2 águas, máscara de gás).** Log: "Tico voltou da expedição. // Tico voltou doente. Alguém me dá um chá. // Lugar da busca: Museu. // Tico trouxe 2 lata(s) de sopa. // Tico trouxe 2 garrafa(s) de água. // Tico achou: máscara de gás. // lata de sopa foi gasto na estrada. // Celeste está desidratado(a). Água, rápido." PENSAMENTO: "Celeste e Tico estão doentes e muito desidratados; ambos devem beber e comer." DIÁRIO: "Hoje servimos sopa e água: alta gastronomia pós-apocalíptica, com aroma de sobrevivência." (Situação do dia 19: Celeste com 5 dias sem água, doente há 8 dias.)

**Dia 21 — Aniversário esquecido.** Evento automático: "É aniversário do filho, e a família precisa escolher um presente para ele." Escolha automática: "Esquecem o aniversário." PENSAMENTO: "Celeste e Tico estão no limite da doença; vamos priorizar o tratamento e poupar água para mantê-los vivos." DIÁRIO: "O hospital do fim do mundo serviu sopa terapêutica; infelizmente, ainda não aceitamos convênio." Log: "Ninguém se lembra do aniversário. O filho fica triste. // Celeste melhorou com a sopa. // Tico melhorou com a sopa." (Celeste estava doente há 10 dias.)

**Dia 22 — Celeste sai de máscara ("A água acabou hoje").** PENSAMENTO: "A água acabou hoje, então precisamos arriscar uma expedição bem protegida para buscar suprimentos." DIÁRIO: "Celeste saiu de máscara para fazer compras; a lista inclui água, sopa e, se possível, um mundo menos radioativo." Log: "máscara de gás foi com Celeste. // Celeste saiu para expedição com máscara de gás."
Dia 23 (Tico sozinho): PENSAMENTO: "Não há água disponível e Celeste volta amanhã; vou poupar sopa..." DIÁRIO: "Tico encarou o cardápio sem água e concluiu que até o deserto tem serviço de mesa melhor." Log: "Ficar ouvindo os barulhos deixa a sanidade de todos mais baixa."

**Dia 24 — Bandidos e o cadeado; Celeste volta e sai de novo no mesmo dia.** Evento: "Bandidos batem na porta e ameaçam entrar." Escolha: "Trancam tudo com o Cadeado." PENSAMENTO: "Temos comida, mas água crítica; vamos reforçar a defesa, hidratar todos e mandar Celeste buscar suprimentos protegida." DIÁRIO: "Trancamos os bandidos do lado de fora e mandamos Celeste caçar água, porque sede não respeita cadeado." Log: "Celeste voltou da expedição. // Lugar da busca: Um macaco simpático. // Celeste trouxe 2 lata(s) de sopa. // Celeste trouxe 1 garrafa(s) de água. // máscara de gás voltou com Celeste. // Os bandidos desistem ao ver o Cadeado e vão embora. A família fica na defesa. // ... // Celeste saiu para expedição com máscara de gás."

**Dia 25 — A mesma disputa de monstros (escolha: Ninguém).** PENSAMENTO: "Tico está há tempo demais sem água; sopa pode esperar. Como a discussão não tem solução útil, melhor não alimentar a briga." DIÁRIO: "Enquanto Celeste explora o mundo, Tico recebeu água e o debate sobre monstros foi oficialmente arquivado na gaveta do absurdo." Log: "Ficam animados com a discussão." (Mesmo evento do dia 3, outra escolha.)

**Dia 26 — Gato ensanguentado (Mingau) e nova expedição (mapa).** Evento: "Um gato sai da ruína de uma favela de bandidos, sujo de sangue, e fica arranhando a porta." Escolha: "deixar o gato entrar". PENSAMENTO: "Temos suprimentos para alguns dias, mas precisamos repor antes de apertar; o gato pode render companhia ou pistas..." DIÁRIO: "Adotamos um gato ensanguentado, porque claramente o apocalipse precisava de mais pelos e possíveis pulgas radioativas." Log: "Celeste voltou da expedição. // Lugar da busca: Prefeitura. // Celeste trouxe 2 garrafa(s) de água. // Celeste achou: mapa. // O Mingau entra e ganha uma coleira com nome. Parece que já morava aqui. // mapa foi com Celeste. // Celeste saiu para expedição com mapa."

**Dia 28 — Formigas mutantes; Celeste sai pela última vez.** Evento: "Do bolso do Tico saem formigas mutantes. A mãe quer esmagar todas; ele quer uma fazenda. Quem decide?" Escolha: Celeste (mae). PENSAMENTO: "Celeste provavelmente está mais sedenta após a última expedição; Tico bebeu ontem. Vamos eliminar as formigas e mandar Celeste buscar recursos protegida." DIÁRIO: "Celeste decretou que formiga mutante não vira animal de estimação, e saiu para procurar mantimentos antes que Tico abrisse um zoológico." Log: "Celeste voltou da expedição. // Lugar da busca: Rodoviária. // Celeste trouxe 1 lata(s) de sopa. // Celeste trouxe 2 garrafa(s) de água. // Celeste achou: rádio. // mapa voltou com Celeste. // As formigas fogem e uma morde o filho. // Tico fica doente. // ... // máscara de gás foi com Celeste. // Celeste saiu para expedição com máscara de gás."

### Expedições (sequência completa)

| # | Saída | Quem | Levou | Voltou | Trouxe / achou |
|---|---|---|---|---|---|
| 1 | dia 9 | Celeste | 1 lata de sopa | dia 11 (doente) | 2 sopas, 2 águas, cadeado ("Museu") |
| 2 | dia 17 | Tico | 1 lata de sopa (doente) | dia 19 (doente) | 2 sopas, 2 águas, máscara de gás ("Museu") |
| 3 | dia 22 | Celeste | máscara de gás | dia 24 | 2 sopas, 1 água ("Um macaco simpático") |
| 4 | dia 24 (logo após a volta da 3) | Celeste | máscara de gás | dia 26 | 2 águas, mapa ("Prefeitura") |
| 5 | dia 26 | Celeste | mapa | dia 28 | 1 sopa, 2 águas, rádio ("Rodoviária") |
| 6 | dia 28 | Celeste | máscara de gás | NÃO VOLTOU (dia 30) | "Ficou lá fora com tudo o que levou" |

Total: 6 saídas (Celeste 5, Tico 1), 5 voltas. Trouxeram 7 latas de sopa, 9 garrafas de água, cadeado, máscara, mapa e rádio. Duas sopas foram "gasto na estrada" (dias 11 e 19). A máscara voltou nas viagens 3 e 4 e foi para a última saída.

**Dia 29 — Tico "não está mais batendo bem".** Evento automático: "Um homem com carrinho de mão cheio de tudo quer trocar algo." Recusado. Log: "Tico não está mais batendo bem. // Recusou. O vendedor resmunga e vai embora." DIÁRIO: "Tico ganhou sopa e água; se continuar olhando para a parede, vamos cobrar aluguel dela." (Loucura de Tico: 60.)

## 4. PADRÕES E NÚMEROS

**Fome e sede (30 dias):**
- Dias com "Hoje ninguém comeu. Fingimos que não estamos com fome." no log: 16 de 30.
- Dias com "Hoje ninguém bebeu.": 11 de 30.
- Dias com racão de sopa e água vazias ao mesmo tempo: 10 (dias 1, 2, 3, 5, 7, 10, 15, 16, 18, 23).
- Itens quebrados em todos os dias: 0.

**Expedições:** 6 saídas (Celeste 5, Tico 1), 5 voltas, 1 sem volta. A máscara de gás da saída 6 (dia 28) foi com Celeste e não voltou. As máscaras das saídas 3 e 4 voltaram.

**Frases que se repetem no log (contagem exata):**
- "Hoje ninguém comeu. Fingimos que não estamos com fome." — 16x
- "Água para Celeste, Tico." — 14x
- "Hoje ninguém bebeu." — 11x
- "Sopa para Celeste, Tico." — 11x
- "Abrimos garrafa de água: dá para 4 porções." — 8x
- "Abrimos lata de sopa: dá para 4 porções." — 6x
- "Tico está sozinho(a) e fica inquieto(a)." — 6x

**Traço de personalidade da IA:**
- Racionou sempre: 11 dos 29 pensamentos citam racionar, poupar ou economizar.
- Medo de expedição: 17 dos 29 pensamentos citam radiação, máscara ou expedição.
- Mandou a mãe (Celeste) em 5 das 6 saídas, e também escolheu a mãe no evento das formigas (dia 28).
- Eventos: 20 eventos no total. 11 foram automáticos e recusados pelo sistema. A IA escolheu em 9, e recusou em 3 (dia 4 "não", dia 5 "não", dia 25 "Ninguém").
- Nunca cita a Juju: nenhum pensamento nem diário da IA dos 30 dias menciona a filha.

**Fatos curiosos com número exato:**
1. Osvaldo saiu de carro no dia 2 e nunca mais voltou. O log o mantém como vivo e fugiu: carro até o fim.
2. Loucura do Tico: 0 até o dia 9, 5 do dia 10 ao 21, 15 no dia 22, 65 no dia 30 (maior valor do jogo).
3. Celeste ficou doente de 11 a 21 (no dia 21 o SIT diz "doente há 10 dias"). No dia 19 ela estava "desidratado(a) (5 dias sem água)".
4. Na coleta, a IA disse "Com 13 segundos" depois de chegar ao abrigo aos 47,0 s, e então correu até o baralho sem pegar. Juju foi a única perdida, e o log marca "perdido: true" desde o dia 1.
5. No dia 29 o SIT dizia que 3 sopas e 3 águas dariam "cerca de 13 ração(ões)" para cada um, mas só Tico estava no abrigo.

## 5. FINAL

**Dia 28** (já descrito acima): Celeste sai com máscara de gás pela última vez. Tico é mordido pelas formigas e fica doente.

**Dia 29**: Tico sozinho com "Tico não está mais batendo bem." Recusa o homem do carrinho. Recebe 1 sopa e 1 água. Loucura: 60. Log: "Tico tomou sopa e continua doente (1 de 8)."

**Dia 30 (VIRADA)**: Log: "Celeste não voltou da expedição. Ficou lá fora com tudo o que levou. // Tico está sozinho(a) e fica inquieto(a)." Loucura de Tico: 65. Estado final no log: Osvaldo vivo: true, fugiu: carro; Celeste vivo: false, fora do abrigo; Juju vivo: false, perdido: true; Tico vivo: true, doente, no abrigo.

**Causa do fim:** derrota, "nenhum adulto vivo no abrigo". A última saída de Celeste (dia 28) não voltou, e Osvaldo fugiu de carro no dia 2. Tico, o único do abrigo, tinha 65 de loucura e estava doente.
