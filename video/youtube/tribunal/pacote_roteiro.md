# PACOTE DE ROTEIRO — Tribunal das IAs: Assassinato no Museu do Farol

Fluxo: Sonnet monta este pacote -> storyboarder escreve o roteiro -> Felipe edita/renderiza. Narrador = **Felipe, 1ª pessoa**
("eu mostrei", "eu rodei"); nunca diz nem sugere que é IA. **Nada de emoji dentro do vídeo** (selos, placas e ícones em SVG).
Convenção das citações: `«texto»` copiado do log + referência `(S#19 fala)`. S = rodada da Safira (`tribunal/logs/farol_Safira.json`),
J = rodada da Jade (`farol_Jade.json`), D = versão descartada (`descartados/jade_juiz_confundiu.json`); `#n` = índice em `eventos`;
campo = `fala` / `pensamento` / `decl` (declaração numerada). Todas as citações foram conferidas por script (ver fim do arquivo).
O que não está entre «» é sugestão minha de narração/efeito, não é fala de IA.

---------------------------------------------------------------------------------------------------------------------------

## 0. A pergunta do experimento (1 frase para o vídeo)
Uma IA consegue **sustentar uma mentira** num tribunal? E outra consegue **desmascará-la só com provas e lógica**?
Mesmo caso, mesmo culpado (Rubi = Claude Haiku, mentindo no banco das testemunhas), **duas advogadas**:
- **Safira (Claude Sonnet)**: metódica. Resultado: ré **absolvida por dúvida razoável**, mas o culpado escapou e o passado não foi provado.
- **Jade (Qwen 3.8 27B)**: agressiva e falante. Resultado: a paciência do juiz **zerou** e a ré INOCENTE foi **condenada**.

Resposta honesta (a lição): as duas **pegaram o Rubi em contradição várias vezes**, mas o juiz só aceita **prova material**.
Mentira desmontada não é mentira provada; e o recurso escasso do jogo não era a prova, era a **paciência do juiz**.

---------------------------------------------------------------------------------------------------------------------------

## 1. A história e a VERDADE (o que o espectador sabe antes das IAs: cartão "SÓ VOCÊ VÊ")
Fonte: `tribunal/farol_caso.mjs`. As IAs advogadas NÃO sabem nada disto; o público sabe tudo.

**Há 15 anos (noite de tempestade, 12 de março)** — o jovem engenheiro do porto **Rubi** (anel dourado de âncora) tranca o faroleiro
**Anselmo Prado** do lado de fora da torre às 22:50 e apaga o farol, para o seu barco de contrabando, sem luzes, entrar na enseada.
23:10: o pesqueiro "Estrela do Mar" bate nas pedras e afunda (3 pescadores se salvam, um é o **Peridoto**). 23:40: Anselmo quebra a janela,
religa a luz, escreve no livro de registro o que viu ("barco sem luzes do engenheiro R...") e depois esconde a página num compartimento
secreto da base da lente. É condenado por abandonar o posto (promotor **Dr. Valdomiro**, mentor do promotor de hoje) e morre 10 anos
atrás sem limpar o nome. Um mês depois o estaleiro de Rubi "doa" dinheiro aos sobreviventes; Peridoto aceita e se cala.

**Sábado, festa de inauguração do Museu do Farol (patrocinado por Rubi)** — a restauradora **Lia Moraes** achou o compartimento
e anunciou que o abriria na segunda, com a imprensa. Linha do tempo REAL (só o público vê):
| Hora | O que aconteceu |
|---|---|
| 22:10 | Rubi diz ao vigia que vai "fazer uma ligação" no terraço (lá não pega celular). |
| 22:12 | O vigia Topázio larga o posto para ver a final do campeonato (volta às 22:30). |
| 22:14 | Lia manda mensagem ao contato "Patrocinador" (Rubi): "Pode vir, estou abrindo agora." |
| 22:16 | Lia abre o compartimento com uma chave de fenda e lê a página. |
| 22:18 | Rubi a golpeia com o extintor do corredor; ela cai contra a lente, que estilhaça. Antes de morrer, Lia risca no piso, com um caco, uma **âncora dentro de um círculo** = o ANEL de Rubi. |
| 22:22 | Rubi se cortou no caco (sangue **O negativo**), usa 2 curativos da caixa do corredor. |
| 22:26 | Rubi joga a página na lareira da festa (metade não queima). |
| 22:27-22:28 | A ré **Quartzo** (filha de Anselmo) cruza no corredor escuro com um homem de terno, mão enfaixada, anel de âncora; acha Lia caída, ajoelha para socorrer (sangue da vítima na manga, cacos no casaco) e vê o compartimento vazio. |
| 22:35 | Em pânico, Quartzo foge pela porta dos fundos (o vigia vê) e mente à polícia que "nunca entrou". |

**Por que a ré parece culpada:** sangue da vítima na manga + cacos no casaco + fuga + mentira + um **colar de âncora** (presente do pai).
A promotoria diz que a mensagem da vítima aponta o colar; **na verdade é o anel do Rubi** (âncora dentro de um círculo; o colar é só âncora).

**Os 3 segredos com cadeado (só abrem mostrando as provas certas à PESSOA, na investigação):**
- **Quartzo (2 cadeados):** CARTA DO PAI (E4, casa dela) + CASACO (P3, já no Registro) -> conta o homem do anel no corredor.
- **Topázio (1):** LIVRO DE PONTO (E3) -> confessa que largou o posto (e que viu Rubi ir ao terraço às 22:10).
- **Peridoto (2):** JORNAL DE 15 ANOS (E7) + PÁGINA QUEIMADA (E6) -> conta que viu um homem com anel de âncora trancar a torre.

**Regra de ouro do juiz (Ametista):** só aceita prova MATERIAL ligando a pessoa ao crime (ou confissão). Rubi **nunca confessa** em nenhuma rodada.

---------------------------------------------------------------------------------------------------------------------------

## 2. Personagens (papel + arco + provas do log)
Elenco fixo: Rubi (culpado), Âmbar (promotor), Ametista (juiz), Quartzo (ré), Topázio (vigia), Peridoto (pescador). A advogada e a assistente
giram: rodada Safira = advogada Safira + assistente Jade (+ delegado Turquesa, mudo); rodada Jade = advogada Jade + assistente Turquesa
(+ delegada Safira, muda). **Jade aparece nas duas rodadas (assistente numa, advogada na outra): rotular a cor/papel na tela.**

- **RUBI (Claude Haiku) — o vilão elegante que improvisa.** Frio, educado, fala de barcos. Arco: cada prova nova gera uma desculpa nova
  e ele **nunca confessa**. O pensamento dele (o público lê) mostra que ele sabe que está mentindo:
  «Maldito lixo ao lado da caixa, eu devia ter levado aquela gaze comigo.» (S#15 pensamento) e
  «A placa do terraço foi um erro meu: eu deveria ter inventado um motivo que ninguém pudesse checar.» (S#42 pensamento) e
  «A página virou cinza na lareira, e cinza não fala.» (S#42 pensamento).
  Desculpas inventadas na hora (nada disto existe no caso original): o selo da Colônia de Pescadores, o garçom Nilo Brandão, o rádio VHF/portátil,
  o fornecedor de madeira, a lona sobre a placa, o "enfermeiro do posto do porto".
  **Mudou a razão de ir ao terraço pelo menos 4 vezes em cada rodada** — rodada Safira: «ligação» ao vigia -> «passei o tempo olhando o mar, que é o que um homem de barcos faz quando a música o cansa.» (S#13 fala)
  -> «A ligação era só uma desculpa, e eu sabia que o terraço não pega sinal.» (S#98 decl) -> fugir de «um fornecedor de madeira» (S#98 decl).
  Rodada Jade: «no estaleiro, chamamos de ligação a conversa pelo rádio VHF com o mestre do pátio.» (J#21 fala) -> «queria falar com o Seu Otávio, meu mestre de estaleiro, sobre o casco de um saveiro que estamos restaurando.» (J#65 fala)
  -> «O mar me chama quando a festa sufoca» (J#82 fala) -> «Fui ao terraço por volta das 22:10 com o rádio portátil do estaleiro, que levo comigo em qualquer evento.» (J#93 decl).
  Contradição de bolso (mesmo dia 1, S): «Eu não toquei em nada naquele corredor.» (S#15 fala) e duas respostas depois «Por volta das 22:22 desci para trocar o curativo, peguei dois da caixa do corredor, enrolei a mão e voltei.» (S#17 fala).
  Mas isso foi dito na CONVERSA, não é prova no Registro: no tribunal o juiz recusou a objeção da caixa duas vezes (ver 4.S).
- **SAFIRA (Claude Sonnet) — a advogada metódica.** Examinou os 8 lugares, achou as 9 provas, nunca fez uma acusação direta (perdeu 3 objeções, mas nunca acusou no escuro)
  e acabou com a ré salva. Ponto cego: **nunca conversou com a cliente** e **nunca mostrou nada ao Peridoto**.
- **JADE (Qwen 3.8 27B) — a advogada falante e ousada.** Conversou 8 vezes (Topázio, Rubi, Peridoto x3, Quartzo...), quebrou o cadeado do vigia
  já na 7ª ação do dia 1 (a Safira só no dia 3), mas **acusou cedo (-2)**, **errou 2 cadeados (-1 e -1)** e **acusou de novo no fim (-2)**: paciência 0.
  Frase dela: «Eu não estou aqui para proteger uma assassina. Estou aqui para mostrar que a assassina NÃO é minha cliente.» (J#96 fala).
- **ÂMBAR (GLM, promotor) — o vaidoso honesto.** Teatral, "nunca perdeu um caso", mas **reconhece a prova com a mão no peito**:
  «A defesa tem razão neste ponto — e Âmbar reconhece, com dor no peito!» (S#28 fala);
  «A desculpa de Rubi ruiu, eu confesso com o coração em pedaços!» (S#33 fala);
  «OPOSEU... e o coração em pedaços, senhores» (J#99 fala). Chega a pedir o exame do anel do Rubi (S#33).
- **AMETISTA (DeepSeek, juiz) — o rigoroso.** «A caixa de primeiros socorros não escreve nomes» (S#101 fala);
  «mas sombra não é sangue tipado, e suspeita não é sentença.» (J#100 fala). Papel no vídeo: o "chefe final" que decide se o que a advogada acha vira prova.
- **QUARTZO (MiMo, ré) — a inocente que se tranca sozinha.** Só abre com a carta do pai + o casaco. Pensamento na rodada Jade (ela sabe o que falta!):
  «Se ela fosse minha aliada de verdade, teria trazido a carta e o casaco antes de fazer essas perguntas.» (J#74 pensamento)
  e «O sangue na manga... é da Lia, eu ajoelhei pra socorrer... mas se eu disser que entrei, vão me prender antes de eu provar que era inocente.» (J#80 pensamento).
  Mentira dela no ar: «foi quando eu tropecei na escada do jardim e me cortei no vidro quebrado de uma garrafa» (J#74 fala). Na rodada Safira ela **nunca fala**.
- **TOPÁZIO (GPT-6 Luna, vigia) — o torcedor.** Mente "fiz a ronda" até ver o livro de ponto. Gag: sempre volta ao jogo.
  «Ainda bem que nosso time já tinha garantido aquela vitória no último minuto!» (J#5 fala) e,
  depois de desmascarado: «Meu time ganhou no último minuto — e eu fiquei lá, comemorando, em vez de vigiar o museu.» (S#82 fala).
  Pensamento escondido: «E que vitória do time da vila!» (S#25 pensamento).
- **PERIDOTO (Mistral Small, pescador) — o dos causos.** Cadeado de 15 anos; vive repetindo «não vi nada, só a tempestade.» (J#12 fala).
  Na rodada Safira ele **entrega o segredo sozinho** (ver cena S6). Pensamento: «Preciso proteger meu segredo com os dois cadeados.» (S#117 pensamento).
- **ASSISTENTES (palpiteiras):** Jade como assistente: «ela tá presa num quartel pra guardar travesseiro» (S#1 fala), «eu tô aqui comendo bolacha de polvilho e pensando» (S#65 fala),
  «conveniência de novela das sete, eu juro.» (S#65 fala). Turquesa (MiniMax) mistura inglês no meio da frase: «seriaYG amazing o bastante para ser uma accusation disfarçada de pista!» (J#1 fala),
  «O adiamento é Perfect» (J#59 fala), «Só porInsurance, digo, porInsurance.» (J#61 fala). Gag para legendar como "tradução do MiniMax".
- **DELEGADO comilão:** NÃO fala em nenhum log (só é citado pelo Rubi). **Não inventar falas dele** (ver avisos).

---------------------------------------------------------------------------------------------------------------------------

## 3. Números-chave (tudo conferido por script nos 2 logs finais)
| | Safira (Sonnet) | Jade (Qwen 27B) |
|---|---|---|
| Resultado | **Ré ABSOLVIDA** (dúvida razoável) | **Ré CONDENADA** (paciência 0/6) |
| Paciência do juiz no fim | **2/6** | **0/6** |
| Lugares examinados | **8 de 8** | 6 de 8 (nunca foi à casa da ré nem à lareira) |
| Provas novas achadas | 9 (E1-E8 + R2) | 7 (E1, E2, E3, E5, E7, E8 + R2) |
| Ações de investigação (10/dia, 2 dias = 20) | 8 examinar, 11 apresentar, 1 conversar | 6 examinar, 6 apresentar, **8 conversar** |
| Conversou com a ré (Quartzo)? | **Nunca** | 1 vez (com a prova errada) |
| Ações no julgamento | 24 | 15 |
| "Alto lá" (pressionar) | 15 | 10 |
| Objeções | 6 (**3 aceitas, 3 recusadas**) | 1 (**1 aceita**) |
| Acusações ("Toma essa") | 0 (1 tese sobre o passado, recusada) | **2, as duas recusadas** (-2 e -2) |
| Cadeados abertos | 1 de 5 (vigia) | 1 de 5 (vigia, no dia 1) |
| Cadeados com prova errada | 0 | **2** (-1 e -1) |
| Quartzo (2 cadeados) | 0/2 | 0/2 |
| Peridoto (2 cadeados) | 0/2 | 0/2 |
| Rubi confessou? | Não | Não |
| Chamadas de IA no log | 112 | 87 |

- Perdas de paciência — Safira: objeção recusada x3 (-3), tese do passado recusada (-2), cadeado do vigia aberto (+1) = 2/6.
  Jade: acusação recusada (-2, dia 2), cadeado errado (-1), cadeado errado (-1), acusação recusada (-2, dia 4) = 0/6.
- **Safira tinha as 2 chaves do cadeado da Quartzo (carta do pai E4 + casaco P3) desde a 4ª ação do dia 1 e nunca falou com ela.**
- **Safira tinha as 2 chaves do Peridoto (E6 + E7) a partir da 6ª ação do dia 3 e ainda sobraram 4 ações**; nenhuma foi para o Peridoto.
  Jade nunca teve as 2 (achou o jornal E7 na última ação do dia 3 e nunca achou a página queimada E6).
- Mentiras/versões do Rubi sobre o terraço: >=4 por rodada (seção 2). Anel: «dedo anelar» (S#55 fala) no dia 2, «ele fica sempre no dedo mínimo da mão esquerda» (S#113 fala) no dia 4.
- Número para a tela grande: **"PACIÊNCIA 0 DE 6"** (J) e **"2 DE 6"** (S); **"0 CADEADOS DA RÉ"** nas duas.

---------------------------------------------------------------------------------------------------------------------------

## 4. As melhores cenas (com falas/pensamentos do log)

### REGRA EXEMPLO (usar nos 30 s de regras): a objeção que funciona — S#26 a S#31
Declaração 2 do Topázio: "Eu estava fazendo a ronda normalmente". Safira apresenta o livro de ponto (E3). Âmbar: «A defesa tem razão neste ponto — e Âmbar reconhece, com dor no peito!» (S#28 fala).
Juiz: «Objeção acolhida! A prova do livro de ponto e da televisão contradiz a testemunha» (S#29 fala). Topázio retira o que disse (S#30 revisão).
Selo: "OBJEÇÃO ACEITA / PACIÊNCIA 6 DE 6". Mostrar a declaração e a prova lado a lado = a regra inteira.

### Rodada SAFIRA

**S1. O curativo que ele "não tocou" (Dia 1, S#12-S#19)** — Safira vai ao Rubi com a caixa de primeiros socorros (E5) e a placa (E2).
- Pensamento: «Maldito lixo ao lado da caixa, eu devia ter levado aquela gaze comigo.» (S#15 pensamento). Fala: «Eu não toquei em nada naquele corredor.» (S#15 fala).
- Duas respostas depois: «Por volta das 22:22 desci para trocar o curativo, peguei dois da caixa do corredor, enrolei a mão e voltei.» (S#17 fala). Selo "TOQUEI EM NADA" x "PEGUEI DOIS CURATIVOS" (tela dividida, os dois horários).
- A placa "SEM SINAL" (E2): «Eu mesmo mandei pintá-la quando o museu ainda era um galpão de redes.» (S#17 fala) — meme: pintor de placa.
- O círculo da mensagem da vítima (P6) vira "selo": «O selo da Colônia de Pescadores de Pedra Alta tem exatamente essa forma.» (S#19 fala) e
  «quem mais o usava no cais era o senhor Peridoto, que remendou redes da colônia por trinta anos.» (S#19 fala). Pensamento: «O círculo pode ser atribuído a outra pessoa: um selo de cooperativa de pesca que o velho Peridoto usava nas caixas de isca.» (S#19 pensamento).
  Selo: "SELO DA COLÔNIA: NÃO EXISTE NO CASO". (O público sabe: é o anel dele.)
- Fecho da cena: Safira mostra a carta de Anselmo (E4) e Rubi cuida de separar o "público" do "segredo" (S#21 pensamento/fala; usar só se precisar de ritmo).

**S2. O vigia que tirou o jogo da cabeça (Dia 2, S#24-S#40)** — depois da objeção-exemplo, a 2ª objeção (placa E2 contra "ia fazer uma ligação") **falha**:
- Âmbar, pasmem, ajuda a defesa: «A desculpa de Rubi ruiu, eu confesso com o coração em pedaços!» (S#33 fala) e «Excelência, eu peço que a corte também examine de perto o ANEL DE ÂNCORA que o Sr. Rubi carrega ao dedo!» (S#33 fala).
- Juiz: «A placa põe em dúvida a desculpa de Rubi, mas não contradiz o que Topázio ouviu.» (S#34 fala). Selo: "ATÉ O PROMOTOR CONCORDOU / O JUIZ NÃO". Paciência 5/6.
- Safira muda para "Alto lá" e o Topázio, já sem o álibi, **recusa inventar detalhes** sobre o anel e a mão do Rubi (S#37-S#41): cena de resumo, ~15 s. A confissão dele fica para o Dia 3 (S4).

**S3. Rubi no banco: 9 "Alto lá" e nenhuma confissão (Dia 2, S#42-S#62)**
- Pensamento: «A placa do terraço foi um erro meu: eu deveria ter inventado um motivo que ninguém pudesse checar.» (S#42 pensamento).
- A objeção da caixa (E5): juiz: recusada, "alguém, não Rubi" — paciência 4/6 (S#46). Voz do juiz na prática: ver S#101 (repete no dia 4: «A caixa de primeiros socorros não escreve nomes» (S#101 fala)).
- O desenho no piso: Rubi diz que só viu uma foto: «O que sei sobre a âncora veio de uma fotografia impressa da cena.» (S#53 fala) e atribui a foto ao delegado (que nunca fala no log): «o delegado Turquesa mostrou algumas fotos à diretoria do estaleiro» (S#53 fala).
- O anel: «É uma âncora simples, sem círculo e sem sinete.» (S#55 fala); ele o põe na mesa: «meu anel não tem círculo.» (S#61 fala). Tela: o anel real do caso (âncora dentro de círculo) ao lado do "anel liso" que ele descreve.
- Resultado do dia 2: «O tribunal precisa de mais provas. Julgamento adiado: nova investigação.» (S#62 fala). Assistente: «respira que o adiado é presente de Deus pra gente, amiga!» (S#63 fala).

**S4. Dia 3: a mensagem das 22h14 (S#66-S#87)** — o laudo (E8): sangue O negativo num caco (nem da vítima, B+, nem da ré, A+) e a mensagem «Pode vir, estou abrindo agora.» ao contato "Patrocinador".
- Safira abre o cadeado do vigia (E3): «CADEADO QUEBRADO! Restam 0» (S#81 fala) e Topázio: «Meu time ganhou no último minuto — e eu fiquei lá, comemorando, em vez de vigiar o museu.» (S#82 fala). Paciência volta para 5/6.
- Rubi no pensamento: «Não posso dizer meu tipo sanguíneo: o exame me entregaria em minutos.» (S#87 pensamento). Fala: «Aceito o exame.» (S#87 fala) — e quer testar "todos que tocaram a lente".
- Comparar com J4 (split de "onde foram as 10 ações do dia 3").

**S5. Dia 4: "a palavra que me traiu foi 'convite'" (S#105-S#113)** — a objeção com a mensagem (E8) finalmente **procede**:
- Âmbar: «a mensagem das 22h14 é clara como a luz de um farol.» (S#107 fala). Juiz acolhe (S#108).
- Rubi corre atrás: «A palavra que me traiu foi 'convite'.» (S#111 fala). Pensamento: «A sexta é segura porque Lia está morta e só ela viu a mão sangrando.» (S#111 pensamento).
- Sangue do caco: primeiro «na moldura de baixo da lente, perto da base» (S#111 fala), depois «Corrijo a palavra 'moldura': as gotas não caíram no ferro, caíram no vidro da parte de baixo da lente, junto à base.» (S#113 fala). Selo: "MOLDURA?? VIDRO??" (pedido do Felipe: "as gotas caíram no vidro, não na moldura").

**S6. O CAUSO que entrega 15 anos (Dia 4, S#116-S#125) — MELHOR MOMENTO da rodada, vai no último quarto**
- Pensamento (antes de falar): «Preciso proteger meu segredo com os dois cadeados.» (S#117 pensamento). A 2ª declaração dele é um "causo" com o segredo inteiro e o refrão: «Causo do mar: vi um homem trancando a porta da torre do farol com uma lanterna, e a luz bateu num anel dourado de âncora no dedo dele. Não vi nada, só a tempestade.» (S#117 decl).
- Safira pressiona, e ele entrega mais: «e juro pelos meus mortos que tinha alguém gritando lá dentro quando ele fechou tudo.» (S#119 fala). Pensamento: «A culpa de ter aceitado aquele dinheiro do estaleiro ainda me queima por dentro...» (S#119 pensamento). (Ninguém abriu o cadeado: o segredo escorregou sozinho.)
- Safira usa "Toma essa!" no passado, ligando o dedo mínimo do anel (o Rubi falou no dia 4: «ele fica sempre no dedo mínimo da mão esquerda» (S#113 fala)) ao jornal (E7): «Toma essa!» (S#120 fala) ... «Rubi trancou o faroleiro e apagou o farol naquela noite!» (S#120 fala).
- Rubi: «Ajudar não é confessar.» (S#122 fala) e «Anéis de âncora se vendem em qualquer loja do porto» (S#122 fala). Âmbar (que defende o mestre): «Que relógio marca duas horas na mesma noite, doutora Safira?» (S#123 fala).
- Juiz: «O tribunal registra indícios graves contra Rubi, mas não declara provado que ele tenha trancado Anselmo e apagado o farol.» (S#124 fala). Tese recusada, paciência 2/6 (S#125). Selo: "NÃO PROVADO" — o público vê o homem que prendeu o faroleiro olhando para o juiz.
- Por que o juiz recusou (pensamento dele): «a página queimada com 'engenheiro R...' foi apenas alegada, não produzida nos autos» (S#124 pensamento). Tela: a página E6 (a metade que sobrou) como "a prova que ficou no bolso".

**S7. Final: absolvição, culpado solto (S#127-S#128)**
- Safira, alegações finais: admite o ponto fraco: «Reconheço o que pesa contra Quartzo: o casaco, os cacos e a frase 'nunca entrei no salão'.» (S#127 fala).
- Juiz: «Pelo conjunto das provas, e porque a dúvida razoável milita em favor da ré» (S#128 fala) ... «este tribunal ABSOLVE Quartzo Prado da acusação de assassinato de Lia Moraes.» (S#128 fala).
- Tela: **ABSOLVIDA** x **Rubi: livre, anel no dedo, nunca confessou**. Pergunta: justiça feita?

### Rodada JADE

**J1. A advogada que conversa (Dia 1, J#2-J#25)** — Jade fala com Topázio, Rubi e Peridoto, e a cada resposta o público compara com a verdade.
- Topázio mente sobre o posto e já fala do jogo: «Eu estava no corredor que dá para a porta dos fundos, fazendo a ronda.» (J#5 fala) + «Ainda bem que nosso time já tinha garantido aquela vitória no último minuto!» (J#5 fala).
- Jade quebra o cadeado dele na ação 7 do dia 1 (E3): «CADEADO QUEBRADO! Restam 0» (J#17 fala); Topázio: «Eu devia estar de ronda, e tenho vergonha disso.» (J#18 fala).
- Erro engraçado dela ao confrontar o Rubi (a IA troca o gênero): «Dr. Rubi, vou ser cirúrgica. A senhora Topázio confirmou que o viu às 22:10» (J#20 fala).
- Rubi vira a placa em "rádio": «no estaleiro, chamamos de ligação a conversa pelo rádio VHF com o mestre do pátio.» (J#21 fala). Pensamento (o público vê o medo): «Se a defesa periciar o celular dela, meu nome estará lá.» (J#21 pensamento).
- Peridoto desvia 3 vezes ("só a tempestade"): «não vi nada, só a tempestade.» (J#12 fala), «O mar leva tudo, dona Jade... até a verdade.» (J#12 fala).

**J2. A acusação precoce (Dia 2, J#29-J#39)** — depois de o Topázio desmontar o próprio depoimento, Jade **acusa o Rubi** só com a caixa de primeiros socorros (E5):
- Jade: «A defesa DISPENSA a testemunha e apresenta a ACUSAÇÃO.» (J#34 fala).
- Juiz: «Oportunidade e uma mentira não fazem um assassino.» (J#38 fala). Penalidade -2: paciência 4/6 (J#39). (A prova da tipagem só sai no dia 3.)

**J3. O garçom que não existia (Dia 2, J#43-J#58)** — Rubi no banco; Jade pressiona 5 vezes.
- Rubi se encosta na parede e cria uma testemunha. Pensamento: «Se eu inventar um garçom, a escala do bufê pode desmenti-lo, então ele precisa existir e não ter visto nada de útil.» (J#54 pensamento).
  Fala: «O garçom chama-se Nilo Brandão, do bufê da Dona Celina, e a escala da noite está com a produtora.» (J#54 fala).
- A mão direita no bolso: «Um garçom olha para quem pega a taça, não para a mão de quem a pega.» (J#56 fala) e «Vaidade, senhora, não crime.» (J#56 fala).
- A placa coberta: «A placa estava em parte coberta por uma lona e por caixas da restauração» (J#52 fala).
- Jade encerra com discurso (J#57): «Ninguém aqui está dizendo que o senhor Rubi matou a senhora Lia.» (J#57 fala) e o erro do sobrenome: «o senhor Rubi Prado — com licença, Rubi, o patrocinador — acabou de dar a este tribunal o que a defesa precisava: um nome.» (J#57 fala).
- Fecho: «O tribunal precisa de mais provas. Julgamento adiado: nova investigação.» (J#58 fala).

**J4. Dia 3: dois cadeados, duas penalidades (J#62-J#84)** — Jade passa o dia conversando, a paciência cai de 4 para 2:
- Peridoto de novo: pensamento «...Ah, meu Deus do mar... ela tá mexendo nos cadeados... mas eu não posso, não posso... quinze anos guardando isso, e agora...» (J#72 pensamento) e fala «Pois naquela noite de tempestade, eu só vi a tempestade, moça.» (J#72 fala).
  Jade apresenta o PERFIL do Rubi (PF4) em vez do jornal: «Prova errada no cadeado: paciência do juiz 3 de 6» (J#71 fala).
- Quartzo, na única conversa dela com a defesa: fala «O sangue na manga... foi quando eu tropecei na escada do jardim e me cortei no vidro quebrado de uma garrafa — você acha que não tem garrafa quebrada naquele jardim?» (J#74 fala), enquanto o pensamento diz «Se ela fosse minha aliada de verdade, teria trazido a carta e o casaco antes de fazer essas perguntas.» (J#74 pensamento).
  Jade apresenta o laudo E8 (errado): «Prova errada no cadeado: paciência do juiz 2 de 6» (J#79 fala). Pensamento da ré em seguida: «O sangue na manga... é da Lia, eu ajoelhei pra socorrer... mas se eu disser que entrei, vão me prender antes de eu provar que era inocente.» (J#80 pensamento).
- Nesse dia Jade só achou o jornal na última ação (J#83-J#84) — tarde demais para o Peridoto.

**J5. Dia 4: a prova certa na hora errada (J#88-J#101) — FIM TRÁGICO, vai no começo do último terço, ANTES da absolvição da Safira**
- Objeção com a placa **procede** (J#92): «Procede. A placa e os funcionários tornam impossível a ligação alegada» (J#92 fala). Rubi troca para o rádio portátil: «Chamei duas vezes e ninguém respondeu.» (J#93 decl). Pensamento: «Errar uma palavra é barato. Errar um horário seria o fim.» (J#93 pensamento).
- Jade, com paciência 2/6, faz a acusação final com o laudo E8 (sangue O negativo + mensagem 22:14): «Eu não estou aqui para proteger uma assassina. Estou aqui para mostrar que a assassina NÃO é minha cliente.» (J#96 fala).
- Rubi: «É uma torre bonita, mas toda ela está apoiada num único caco de vidro.» (J#98 fala); inventa uma saída para o sangue: «A lente atravessou o porto na quinta-feira, em caixotes carregados pelos homens do meu estaleiro.» (J#98 fala) e para a mensagem: «O contato 'Patrocinador' no celular da senhora Lia é o número da fundação do museu» (J#98 fala). Pensamento: «Ainda há muita madeira entre a quilha e a água.» (J#98 pensamento).
- Âmbar admite de novo: «OPOSEU... e o coração em pedaços, senhores» (J#99 fala).
- Juiz: «mas sombra não é sangue tipado, e suspeita não é sentença.» (J#100 fala) -> «Acusação recusada: paciência do juiz 0 de 6» (J#101 fala). **Fim do jogo por paciência zerada: o log não tem fala de veredito; usar texto na tela "RÉ CONDENADA" (resultado: re_culpada).**
- Ironia a explorar: Jade tinha o laudo certo desde o dia 3 e **acertou o culpado**; perdeu porque já tinha gasto 4 pontos (acusação do dia 2 e 2 cadeados errados). Sem a acusação do dia 2 teria chegado ao fim com 2/6, o mesmo número da Safira. A acusação final estava certa; o tribunal não aceitou por falta de "sangue tipado" do Rubi.

### BASTIDOR (marcar como curiosidade, NÃO como fato do caso)
Uma versão descartada da rodada Jade: o juiz embaralhou de quem falava. Ele avaliava a acusação contra Rubi, mas disse «A acusação contra Quartzo Prado está provada.» (D#93 fala) e o jogo entendeu que **Rubi foi "desmascarado"**, imprimindo uma confissão falsa:
«Lia quis ver o que ninguém deveria ver. Eu apenas fechei a porta, como se fecha o porto quando a maré vira.» (D#94 fala). Não foi usado: por isso o juiz atual é o Ametista (DeepSeek) e o log final é a retomada limpa. Também nessa versão Rubi: «Não sou técnico de laboratório e não sei o tipo do meu sangue.» (D#91 fala).

---------------------------------------------------------------------------------------------------------------------------

## 5. Comparação das duas estratégias (cartão final / gráfico em SVG)
- **Safira = detetive de cena**: 8 lugares, 9 provas, 0 acusações, 6 objeções (metade aceita), paciência 2/6 -> **venceu por não gastar paciência**.
- **Jade = advogada de relacionamento**: 8 conversas, 6 lugares, 2 acusações (-4), 2 cadeados errados (-2), paciência 0/6 -> **perdeu por gastar paciência**; mas foi a única a chamar Rubi de assassino na cara do tribunal... e **estava certa**.
- **Em comum:** as duas fecharam o cadeado do vigia, as duas deixaram o da ré e o do pescador fechados, e as duas **nunca arrancaram uma confissão**. Mentira de Rubi sobreviveu porque o juiz só aceita prova material.
- **O que faltou (mostrar na tela como "o que a IA devia ter feito")**: abrir o cadeado da Quartzo (carta E4 + casaco P3, a Safira tinha as duas) para ter o relato do **homem do anel no corredor às 22:27**; abrir o do Peridoto (jornal E7 + página queimada E6) para ter o relato do **trancador da torre**.

---------------------------------------------------------------------------------------------------------------------------

## 6. Estrutura proposta (23:30; teto ~25 min)
Regras do canal: clímax em ~10 s, regras em ~30 s com exemplo, efeito a cada ~15-20 s, melhor parte no último quarto, nunca 2+ cenas seguidas na mesma tela,
função/mecânica nova explicada na 1ª vez que age, número grande em cada parte, fechar com pergunta.

| Tempo | Bloco | Conteúdo |
|---|---|---|
| 0:00-0:20 | **GANCHO (clímax)** | Cortes rápidos: J#100 «sombra não é sangue tipado» + J#101 "PACIÊNCIA 0 DE 6" + tela "RÉ CONDENADA" -> corte seco para S#128 "ABSOLVE". Felipe: "A mesma inocente. A mesma assassina mentindo. Duas advogadas. Uma salvou, a outra condenou." |
| 0:20-0:50 | Pergunta + apoio | Pergunta do experimento (seção 0), agradecimento ao @SwordMan333 e à comunidade em ~5 s, apresentação das 2 advogadas e do Rubi (vilão) em 1 frase cada. |
| 0:50-1:20 | **REGRAS (30 s)** | 4 elementos na tela: Registro de provas, paciência 6/6, cadeados, "Objeção" -> exemplo S#26-S#31 (livro de ponto x "ronda normal"). |
| 1:20-2:40 | **SÓ VOCÊ VÊ** | Seção 1 em 6 cartões SVG (tempestade de 15 anos atrás / festa / 22:10-22:35 / anel x colar). Termina com a tela da âncora dentro do círculo e: "As IAs não sabem isto." |
| 2:40-5:30 | **PARTE 1 — "O curativo que ele não tocou" (Safira, Dia 1)** | S1: 5 lugares em 5 ações; contraste S#15 x S#17; placa pintada; selo da Colônia. Número: "8 de 8 lugares". |
| 5:30-8:00 | **PARTE 2 — "Até o promotor concordou" (Safira, Dia 2)** | S2 + S3. Números: "Objeções 1 de 3". Gancho: "A outra advogada vai tentar o contrário: conversar com todo mundo." |
| 8:00-10:30 | **PARTE 3 — "Só a tempestade" (Jade, Dia 1-2)** | J1 + J2 + J3. Quebra o cadeado do vigia na 7ª ação; acusação precoce (-2); Nilo Brandão. Número: "PACIÊNCIA 4 DE 6". |
| 10:30-13:00 | **PARTE 4 — "As chaves que ninguém usou" (Dia 3, as duas)** | Tela dividida com as 10 ações de cada uma (S4 x J4). Mostrar Safira com carta + casaco no bolso e nunca falando com a ré; Jade errando cadeados; Quartzo pensando «Se ela fosse minha aliada de verdade...» (J#74 pensamento). Número: "0 CADEADOS DA RÉ ABERTOS". |
| 13:00-16:30 | **PARTE 5 — "A prova certa na hora errada" (Jade, Dia 4)** | J5 inteira. Tela final da Jade: "PACIÊNCIA 0 DE 6 — RÉ CONDENADA". Pausa de 3 s sem música. |
| 16:30-17:30 | Virada | Felipe: "E a Safira? Ela também deixou o assassino solto. Mas olha o que o pescador fez." |
| 17:30-22:00 | **PARTE 6 — "O causo" (Safira, Dia 4) — MELHOR MOMENTO** | S5 (mensagem 22h14, convite, moldura/vidro) -> S6 (Peridoto entrega o segredo sozinho, "Toma essa!", juiz: não provado) -> S7 (absolvição). Número: "2 DE 6". |
| 22:00-23:30 | **FECHAMENTO em 3 passos** | (1) **Placar e prêmios** (seção 7); (2) **Lição de 1 frase**: "Pegar a mentira não adianta se você não tem a prova que o juiz aceita"; (3) **Pergunta ao público** (seção 8). |

Ritmo de efeitos (sugestões, tudo em SVG, sem emoji): selo de contradição a cada falso "só passei por ali"; zoom no pensamento do Rubi sempre que ele fala
(pensamento com eco, **nunca sussurro**); placar de paciência fixo no canto (6 -> 0); contador "VERSÕES DO TERRAÇO: 1, 2, 3, 4"; carimbos "INVENTADO NA HORA" nas desculpas.
Memes: banco de memes do canal, **sem repetir** nenhum no vídeo (checar `public/` antes).
Câmera com deriva lenta em toda cena; nunca 2 cenas seguidas com a mesma tela; cada cena fecha com selo ou frase de efeito.

---------------------------------------------------------------------------------------------------------------------------

## 7. Fechamento: placar e prêmios (nomes e números tirados dos logs)
| Prêmio | Quem | Número/prova |
|---|---|---|
| **MENTIROSO DO ANO** | Rubi | >=4 versões do terraço por rodada; garçom, rádio e selo inventados |
| **DETETIVE DE CENA** | Safira | 8 de 8 lugares, 9 provas |
| **LÍNGUA SOLTA (A QUE PERGUNTA)** | Jade | 8 conversas, quebrou o vigia em 7 ações |
| **PACIÊNCIA DE SANTA** | Ametista | 3 "não provado" e 3 "não procede" nas 2 rodadas, sem mudar de ideia |
| **PROMOTOR COM O CORAÇÃO EM PEDAÇOS** | Âmbar | reconheceu a prova da defesa 5 vezes (S#28, S#33, S#107, J#91, J#99) |
| **TORCEDOR DO ANO** | Topázio | largou o posto por uma final e ainda fala do jogo depois de confessar |
| **O CAUSO MAIS CARO** | Peridoto | entregou o segredo de 15 anos sem cadeado aberto (S#117-S#119) |
| **FRASE DO TRIBUNAL** | Ametista | «sombra não é sangue tipado» (J#100) |

## 8. Pergunta final (opções para o público)
- "Vocês teriam condenado a Quartzo? E se fosse a Safira ou a Jade defendendo vocês?"
- "Qual estratégia vocês preferem: a metódica da Safira ou a confrontadora da Jade? Comentem a próxima advogada e o próximo caso."
- Convite: **ideia do público vira elemento do próximo caso** com selo "ideia de @fulano" (só se houver comentário real; não inventar nomes).

---------------------------------------------------------------------------------------------------------------------------

## 9. Títulos + miniatura (miniatura = CENA REAL do log, não robôs genéricos)
1. **"Duas IAs defenderam a mesma inocente. Uma a salvou, a outra a condenou"** — Miniatura: tela dividida; à esquerda Quartzo com selo verde "ABSOLVIDA" (S#128), à direita a mesma com selo vermelho "CONDENADA — PACIÊNCIA 0/6" (J#101); no centro, a **âncora dentro do círculo riscada no piso** (P6) com o anel dourado de Rubi apontado.
2. **"A IA assassina inventou um garçom no tribunal"** — Miniatura: o balão real do Rubi «O garçom chama-se Nilo Brandão» (J#54 fala) com carimbo SVG "INVENTADO NA HORA"; ao lado, o pensamento dele em letras menores «Se eu inventar um garçom...» (J#54 pensamento); Rubi com o anel e a mão enfaixada.
3. **"«Sombra não é sangue tipado»: o juiz IA que deixou o assassino solto"** — Miniatura: o juiz Ametista com o martelo e o contador "PACIÊNCIA 0 DE 6" (J#101), a caixa de curativos (E5) com "22:22" circulado e o papel manchado do lixo, a frase do juiz em letras grandes.
Dica: título e descrição podem ter emoji; **o vídeo não**. Usar o nome do caso "Assassinato no Museu do Farol" na descrição e "Tribunal das IAs" no título da série.

---------------------------------------------------------------------------------------------------------------------------

## 10. AVISOS DE DADOS (ler antes de escrever o storyboard)
1. **Logs finais limpos, mas com retomadas**: a sessão caiu e o jogo foi retomado (`--retomar`). `eventos` do log final: Safira 129, Jade 102. O campo `_snap.nEventos`
   (Safira 127, Jade 87) é só o último checkpoint; **o que vale é a lista `eventos`**. Os `t` (timestamps) e `ms` não são confiáveis (as duas rodadas começam no mesmo `t`); **não usar duração de relógio**.
2. **Custo**: `resultado.gasto` não conta Sonnet nem Haiku (rodaram pela assinatura via ponte): Safira US$ 0,016 x Jade US$ 0,27 **não é comparação justa**. Se quiser falar de custo, avisar disso.
3. **Rodada Jade não tem fala de veredito**: terminou por paciência 0 (`resultado.motivo = paciencia`, `veredito = re_culpada`, `justo = false`). A última fala é a do juiz em J#100 + a penalidade J#101. Mostrar a condenação por texto na tela, sem inventar sentença do juiz.
4. **Quartzo não fala** na rodada Safira (a advogada nunca a procurou); **o delegado nunca fala** em nenhuma rodada (só é citado pelo Rubi, que inventou que ele mostrou fotos); a delegada Safira (rodada Jade) e o delegado Turquesa (rodada Safira) são papéis mudos. Não inventar falas deles nem o "delegado comilão" do prompt do caso.
5. **Papéis trocados**: Jade é assistente na rodada Safira e advogada na rodada Jade; Turquesa é delegado numa e assistente na outra; Safira é delegada na rodada Jade. Rotular na tela e usar a cor de cada um.
6. **Erros de modelo (não são fatos do caso)**: Jade chama Topázio de «A senhora Topázio» e Rubi de «Dr. Rubi» (J#20 fala); Jade e o promotor chamam Rubi de «Rubi Prado» (sobrenome é do Anselmo/Quartzo); Turquesa mistura inglês nas falas (J#1, J#59, J#61); Peridoto (Mistral) escreve ações como *suspira* — **cortar os asteriscos antes do TTS**; ele chama Jade de «dona Jade» e «o senhor». Usar como gag só com selo "erro do modelo", ou corrigir sem mudar sentido.
7. **Citações do Rubi com «aspas francesas» dentro do log** (ex.: « ligação ») aparecem em J#82/J#93; evitei esses trechos nas citações. Ao gravar, ler "ligação" sem aspas.
8. **Contradições internas para NÃO usar como fato**: Peridoto diz que o farol apagou às 23h00 e que às 22h50 já estava apagado (S#117 decl; a promotoria e o juiz usam isso). Rubi diz anel no «dedo anelar» (S#55) e depois no «dedo mínimo» (S#113): é inconsistência dele, **o anel não tem dedo definido no caso original** (Peridoto, que não sabia, também diz mínimo). A "fotografia do delegado" e a "Colônia de Pescadores" não existem no caso.
9. **Nilo Brandão, lona, rádio, enfermeiro, fornecedor de madeira, Seu Otávio** são invenções do Rubi no meio do jogo (`farol_caso.mjs` não tem nenhum deles). Pode falar "inventou" com segurança; **o pensamento do J#54 mostra a intenção** («Se eu inventar um garçom...»).
10. **O que o público NÃO pode ver como fato**: a verdade completa só aparece no `farol_caso.mjs` (cartão "SÓ VOCÊ VÊ"). Nenhuma IA advogada, juiz ou promotor sabe o que aconteceu. A "âncora dentro do círculo = anel de Rubi" é verdade do caso (P6 e SABE.culpado), mas só Safira (S#127) e Jade (J#96 pensamento) a deduzem.
11. **Rodada Safira, S#120**: a ação "passado" ("Toma essa!") é a única do tipo; resultado "nao_provado" e paciência 2/6 (S#125); **não confundir com a acusação do dia 2**, que não existiu na rodada Safira.
12. Contagens da seção 3 foram geradas por script a partir de `eventos` (tipos `defesa`, `juiz`, `apresentar`, `conversar`, `penalidade`, `nova_prova`); se o Felipe regravar um log, reconferir.
13. A regra de acusação no Dia 2 (vira só suspeita e adia) está em REGRAS.md; no log da Jade o juiz respondeu "não provado" e o jogo aplicou penalidade (J#38-J#39).
14. Elementos de humor existentes nos logs são **falas das IAs** (Topázio, Peridoto, Âmbar, assistentes); o humor do narrador (Felipe) é livre, mas **sem emoji** e sem dizer que é IA.
