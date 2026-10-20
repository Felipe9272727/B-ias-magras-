# Mecânica do abrigo (fase de dias): regras para a recriação

Base: wiki de fãs de 60 Seconds! (2015, "O") e 60 Seconds! Reatomized (2019, "R"), lida localmente. As regras são descritas com palavras próprias. Nada de texto de evento, nome de personagem ou arte do original entra no código: no código usamos pai, mãe, filha e filho.

## 0. Como ler este documento

Legenda de confiança:

- **[W]**: a página da wiki afirma isso.
- **[W-O] / [W-R]**: vale só na versão original / na Reatomized.
- **[I]**: inferido do texto de eventos ou da ordem das páginas. Não está escrito como regra.
- **[G]**: prática citada em guia de fã. Não é regra do jogo.
- **[D]**: fontes divergem. O número mostrado é o mais citado e a divergência fica anotada.
- **[NE]**: não encontrado nas páginas lidas.
- **[P]**: proposta nossa para o código, a calibrar.

Páginas lidas integralmente: Expeditions, Insanity, Ted, Dolores, Mary Jane, Timmy, Gas Mask, Medkit, Map, Rifle, Axe, Flashlight, Radio, Hunger/Thirst, Water, Soup, Sickness, Injuries, Agony, Death, Tiredness, Fatigue, Journal, Survival, The Longest Survival, Rad.

Descartadas por serem de 60 Parsecs: Morale, Soul mates, Crafting, Hazards, Cave, Swamp. Toronto só tem um parágrafo sem regra.

Fora da lista pedida e não lidas: páginas de Pancake, do gato, de Military, Bandits, Scavenge Mode, Challenges e a lista de eventos. Onde a regra depende delas, a lacuna está marcada [NE].

Mapeamento de papéis (só para ler este documento): pai = adulto que recebe os eventos sem escolha de pessoa [W, trivia]; mãe = adulta mais resistente à loucura [W, trivia]; filha = a única que pode mutar [W]; filho = criança que pode curar com o manual de escoteiro [W, trivia].

---

## 1. Ciclo de um dia

### 1.1 O que é um dia

- O **diário** é a tela do dia. Mostra eventos, racionamento, preparação de expedição e o estado de cada pessoa. Ele é também a única forma de terminar o dia [W].
- A página de racionamento aparece em todos os dias [W].
- Os avisos do diário ficam mais graves conforme a fome ou a sede se aproxima do limite [W].
- O diário fala sempre no plural ("nós"), mesmo com uma só pessoa viva [W].

### 1.2 Ordem das decisões

A ordem exata não está escrita nas páginas. A melhor leitura é esta:

1. **Virada do dia [I]**. Chegam as expedições que voltaram ou não voltaram (seção 4). Cada contador avança um dia (fome, sede, doença, ferimento, loucura, dias na casa). Checam-se mortes e fugas (seção 3). O aviso de condições lá fora é atualizado.
2. **Evento do dia [I]**. Pode haver ou não. Um truque citado em guia mostra que, ao fim de um dia sem evento, dá para mandar alguém sair sem o risco do evento seguinte [W, texto do item Expeditions]. Logo, o evento aparece ao fim do dia e nem todo dia tem um. O evento tem escolhas, e algumas exigem item ou pessoa presente [W].
3. **Racionamento [I]**. O jogador decide quantas rações de sopa e água dar e a quem. Cada ração é 1/4 de lata ou de garrafa por pessoa (seção 2).
4. **Preparação de expedição [W]**. Prepara-se num dia e a pessoa sai no dia seguinte. Escolhe-se quem e um item para levar. A mala permite levar 4 itens (3, porque ela ocupa um espaço) [W].
5. **Fim do dia**: o jogador lê o diário e termina o dia [W].

Consequência prática:

- Quem sai hoje volta depois (seção 4).
- Alimentar uma pessoa no dia anterior à saída faz com que ela volte com mais itens [G, guia de fã].
- Expedição e evento disputam o mesmo dia, por isso o evento de fim de dia pode condicionar a saída do dia seguinte [I].

### 1.3 Clima lá fora (aviso do diário)

Há três estados [W]:

| Estado | Quando | Efeito |
|---|---|---|
| Radioativo | Começo do jogo, até cerca do dia 20 | A máscara de gás é muito recomendada. Sem ela, quem sai adoece com alta probabilidade (seção 4.4). |
| Neutro | A maior parte do jogo | A expedição é a opção mais segura, mas ainda pode falhar. |
| Bandidos | Depois de expedições seguidas | Risco de falha altíssimo. Começam os ataques ao abrigo, a cada 3 dias [W]. |

Regras de transição:

- O estado radioativo pode acabar antes do dia 20 se o rádio informar que a radiação caiu. A janela é entre os dias 7 e 20 [W].
- Quando uma expedição volta com aviso de que foi seguida, começa uma contagem de cerca de 20 dias até o estado bandidos [W].
- No estado bandidos, cada expedição tem alto risco de captura [W].
- Ficar muito tempo sem expedição também atrai ataques, segundo um guia de fã: cita 100 dias como limite [G]. A página oficial não dá número [NE].

### 1.4 Eventos (mecânica, não textos)

- Eventos são sorteados por condições: quem está em casa, itens presentes, estado de cada pessoa, se alguém saiu [W].
- Alguns eventos perguntam quem deve fazer a ação, com a opção "ninguém". Se o evento não permite escolher pessoa, quem faz a ação é sempre o pai [W, trivia].
- Efeitos típicos [W]:
  - mudar sanidade de uma ou mais pessoas;
  - adoecer, ferir ou cansar;
  - achar, perder ou quebrar itens;
  - ganhar ou perder sopa e água;
  - fazer uma pessoa sair de casa por 2 ou 3 dias (evento de saída, seção 4.2).
- Alguns eventos aparecem só se certos itens estão na casa. Isso é a mesma lógica de requisito de `quando(estado)` já prevista em ARQUITETURA.md.

### 1.5 Dias-marco

- Um adulto sozinho na casa enlouquece no segundo dia [W]. Isso vale para pai e mãe.
- A sanidade cai rápido quando só resta uma pessoa na casa [W].
- Radiação do lado de fora termina por volta do dia 20 [W].
- Fadiga começa a ser aplicada após cerca de 20 dias dentro de casa [W].
- Desvairado (último estágio da loucura) aparece perto do fim do prazo de loucura [W].
- Guias de fã citam dia 300 como o fim da coleta de itens nas expedições, por esgotamento do sistema [G].

---

## 2. Ração: sopa e água

### 2.1 Porção

- Uma lata de sopa equivale a 4 rações. Cada pessoa consome 1/4 de lata por ração [W].
- Uma garrafa de água equivale a 4 rações. Cada pessoa consome 1/4 de garrafa por ração [W].
- Quando um evento exige uma garrafa inteira, ela é usada inteira [W].
- Garrafa quebrada e lata vazia aparecem como objetos depois de consumo [W].
- Com 6 ou mais garrafas, aparece um garrafão grande no lugar de 4 garrafas pequenas [W].

Exemplo: para 4 pessoas, uma ração completa custa 1 lata e 1 garrafa.

### 2.2 Cadência e limites

- Cadência recomendada pelos jogadores experientes: alimentar e dar água a cada 5 dias [W].
- A água é prioridade: a família aguenta cerca de metade do tempo sem água que sem sopa [W].
- Sede: 5 dias sem água é o limite. No 6º dia a pessoa morre [W].
- Fome: 10 dias sem sopa é o limite. No 11º dia a pessoa morre [W].
- Antes da morte, há avisos no diário, cada vez mais graves [W].
- Fome aparece no diário cerca de 6 dias depois da última refeição completa [W, texto de Soup]. Essa frase conflita com o limite de 10 dias da página de Hunger/Thirst [D]. Usamos 6 como aviso e 10 como morte.

### 2.3 Quem precisa de quanto

| Pessoa | Sopa e água | Diferença |
|---|---|---|
| Pai e mãe | 1/4 de lata e 1/4 de garrafa por ração. Morrem nos limites da seção 2.2. | Morrem de fome ou de sede [W]. |
| Filha e filho | Mesma ração e mesmos limites. | Não morrem: fogem de casa no lugar da morte [W]. |
| Filha mutante | Não precisa de água [W]. | Imune a sede, mas precisa de sopa. Uma página diz que ela come mais sopa [W]; outra diz que a comida dela pode ser espaçada com mais facilidade [D]. |
| Pessoa em expedição | Come quase o dobro do normal, e isso vale também no primeiro dia depois de voltar [W]. | Fome sobe mais depressa. |
| Pessoa doente | Morre de fome mais depressa [W]. | Doença e fome se somam. |
| Pessoa louca | Pode destruir uma lata ou garrafa inteira, mesmo com racionamento [W]. | Perda extra de estoque. |

### 2.4 Regras de reset

- **Água**: dar água a uma pessoa desidratada zera a sede de uma vez [W].
- **Comida**: uma pessoa faminta precisa de várias refeições seguidas para sair do estado [W]. Uma refeição só não basta.
- Se a pessoa já estava faminta e ainda assim não recebe refeição completa, a morte vem cerca de 3 dias depois da última refeição [W, texto de Soup].
- Uma expedição zera ou pausa a sede. A página de Water diz as duas coisas e não especifica qual [W]. Sair de casa também adia a necessidade de água em 1 dia [W].

### 2.5 Perdas por loucura

Cada pessoa louca tem uma chance de destruir um item na casa. Para a comida e a água, a perda é de uma unidade [W]:

- pai: sopa ou água, máscara de gás ou mapa;
- mãe: sopa ou água, rádio ou baralho;
- filha: sopa ou água, lanterna ou machado;
- filho: sopa ou água, kit médico ou manual de escoteiro.

Os itens da lista são destruídos ao chegar perto da metade do prazo de loucura (seção 3.6).

---

## 3. Estados das pessoas

### 3.1 Tabela geral

| Estado | Como surge | Efeito | Cura | Morte ou fuga |
|---|---|---|---|---|
| Fome (faminto) | Passar do limite de sopa (seção 2.2) | Mais rápido para doença. Expedição consome o dobro. | Refeições seguidas de sopa | Morte no 11º dia sem sopa [W] |
| Sede (desidratado) | Passar do limite de água | Idem | Água (uma só zera) [W] | Morte no 6º dia sem água [W] |
| Doente | Volta de expedição sem máscara em área radioativa; fome prolongada; certos eventos; ferimento que não foi tratado | Mais difícil de voltar de expedição. Morre mais rápido de fome. | Kit médico; evento de banho; comida diária por dias seguidos | Morte em 15 a 20 dias [W]. Uma infobox diz 20 a 40 [D]. |
| Ferido | Eventos de briga e de objetos cortantes; expedições sem kit; saqueadores | Mais difícil de voltar de expedição. Pode adoecer. | Kit médico; evento de atendimento | Morte em 8 a 10 dias [W]. Na R, agonia de 3 dias antes [W-R]. |
| Agonia | Ferimento não tratado (só na R) | Última fase. Mais difícil de voltar. | Kit médico | Morte em 3 dias [W-R] |
| Cansado | Volta de expedição; alguns eventos (barulho, partida de jogo) | Não pode sair em expedição [W] | Passar dias dentro de casa [W]. Kit médico também evita [W]. | Não mata. |
| Fatigado | Mais de cerca de 20 dias dentro de casa [W] | Reduz a quantidade de itens encontrados numa expedição [W] | Não cura [W] | Não mata. |
| Louco (insano) | Sanidade baixa; eventos; contágio em conversas | Mais difícil de voltar de expedição. Destrói itens. | Subir a sanidade o bastante | Sai de casa em 20 a 35 dias (típico 25 a 30) [W] |
| Desvairado | Perto do fim do prazo de loucura [W] | Aviso de última fase | — | Sai de casa logo em seguida |
| Mutante (só a filha) | Eventos com bichos ou vazamento verde [W] | Imune a sede, doença, cansaço, loucura e fadiga [W]. Sempre volta de expedição [W]. | — | Não morre de sede. Se não for alimentada depois de expedição, sai [W]. |

### 3.2 Fome e sede: escalas

- Fome: normal, com fome (aviso aos 6 dias sem refeição completa), faminto (10 dias ou mais, morte no 11º) [W; D nos 6 dias].
- Sede: normal, desidratada (5 dias), morte no 6º dia [W].
- As palavras exatas do diário não estão nas páginas [NE].

### 3.3 Doença

Causas [W]:

- volta de expedição sem máscara de gás quando a área é radioativa;
- fome prolongada (desnutrição);
- eventos de contaminação, mofo, lixo, cheiro, ataques de animais, e um evento com a porta de visitantes;
- ferimento não tratado.

Estágios [W]:

- **Doente**: sintomas leves e que progridem.
- **Estágio final** (em inglês "Diseased"): a pessoa está quase morta.

Morte [W]: 15 a 20 dias. Por causa da fome, quem está doente morre antes.

Cura [W]:

- kit médico cura na hora;
- um evento de banho cura (às vezes);
- comida diária em dias seguidos cura a doença básica.

Tabela de cura pela sopa (doença básica), conforme os dias sem refeição desde que ficou doente [W]:

| Dias sem refeição desde a doença | Sopas necessárias |
|---|---|
| 0 ou 1 | 3 |
| 2 | 5 |
| 3 | 8 |
| 4 | 9 |
| 5 | não encontrado [NE] |

- Se, depois de 3 a 5 dias alimentando, a pessoa continua doente, a cura pela sopa não funciona. A única saída é o kit médico ou o evento de banho [W].
- A doença grave tem quantidade de sopa aleatória. Na prática, é melhor usar o kit ou esperar um evento [W].
- Doença "passiva": depois de qualquer cura, a pessoa fica 5 dias com um estado passivo. Certos eventos viram doença grave nesse período [W, marcado como a confirmar].

### 3.4 Ferimento

Causas [W]:

- eventos de briga, de armas e de objetos cortantes;
- expedição, quando um saqueador atinge a pessoa;
- eventos em que um item é usado de forma errada (barbear com machado, pular, cair);
- expedição sem kit, em que a pessoa pode voltar com um ferimento que aparece dias depois [W].

Efeito [W]: pode adoecer.

Morte [W]: 8 a 10 dias sem tratamento. Na R, agonia de 3 dias antes da morte [W-R].

Cura [W]: kit médico; evento de atendimento; alguns eventos específicos.

Filha mutante: na R não se fere; no original pode se ferir [W].

### 3.5 Cansaço e fadiga

Cansaço [W]:

- causa: volta de expedição e alguns eventos;
- efeito: não pode ir em expedição;
- cura: passar alguns dias dentro de casa, sem prazo exato [NE];
- o kit médico impede o cansaço no evento de sono [W];
- a filha mutante é imune.

Fadiga [W]:

- causa: mais de cerca de 20 dias dentro de casa, sem expedição;
- efeito: reduz o número de itens que a pessoa encontra na expedição;
- não cura;
- a filha mutante é imune.

### 3.6 Loucura

Sanidade [W]:

- é um número oculto por pessoa que sobe e desce com eventos;
- a loucura começa quando a sanidade fica baixa o bastante (limite não encontrado [NE]).

O que baixa a sanidade [W]:

- morte ou desaparecimento de alguém da família;
- estar sozinho na casa, sobretudo se só resta um adulto [W];
- atacar vizinhos (queda grande);
- decisões ruins em certos eventos;
- conversa com quem está louco pode deixar a pessoa louca também (contágio) [W];

O que sobe a sanidade [W]:

- gato ou cão entrando na casa: recupera 100%;
- dar comida, água ou kit médico a sobreviventes que pedem ajuda: recupera 100%;
- não atacar vizinhos (subida grande);
- festa com rádio ou gaita (sobe para todos);
- baralho, repelente e kit usados como presentes em aniversário;
- conversa com quem está triste (quando a pessoa aceita).

Prazo [W]:

- a loucura dura 20 a 35 dias (típico 25 a 30) até a pessoa sair de casa;
- perto da metade do prazo, a pessoa destrói um item (lista da seção 2.5 e da tabela 5);
- perto do fim, aparece o estado desvairado;
- quem sai de casa por loucura conta como morta. Não volta mais.

Forma de saída por loucura [W]: cada pessoa sai com um motivo próprio. O pai sai seguindo um boneco de meia que o convence. A mãe sai para procurar o próprio pai. A filha sai para uma aula que já não existe. O filho sai como um herói da região devastada. Para o código, basta o efeito: sai de casa e conta como morto.

Adulto sozinho na casa enlouquece no 2º dia [W]. Criança sozinha tem só uma chance de enlouquecer nesse prazo [W].

### 3.7 Mutação (só a filha)

- Só a filha pode mutar [W].
- Causas [W]: um vazamento verde no cano sem tratamento; uma infestação de aranhas ou baratas sem tratamento adequado; baratas que tentam se comunicar e são ignoradas.
- Efeitos: não precisa de água; imune a doença, cansaço, loucura e fadiga; sempre volta de expedição; não pode levar item; traz água e às vezes outro item; precisa de comida depois de cada expedição, senão sai [W].
- Na R, ela não se fere. No original, pode [W].

### 3.8 Sanidade e expedição

- Pessoa com sanidade baixa, louca, doente ou ferida tem menos chance de voltar [W].
- A chance é reduzida, nunca zerada, salvo quando há um motivo explícito como os bandidos (seção 4.4).

---

## 4. Expedições

### 4.1 Quem pode ir

- Qualquer pessoa em casa que não esteja cansada pode ir [W].
- Cansado não pode ir [W].
- A criança tem as mesmas chances que um adulto de achar itens e de voltar. A ideia de que criança é melhor na busca é um equívoco [W].
- Mutante sempre volta [W].
- Só uma pessoa sai de cada vez [I].

### 4.2 Preparação e saída

- A tela de preparação mostra as condições lá fora e o estado de cada pessoa. Cada pessoa tem uma frase que diz o quanto ela está boa para sair: uma escala de cerca de 6 níveis, do melhor ao pior, e a frase de "cansado" [W].
- A saída é no dia seguinte à preparação [W].
- Leva-se um item por expedição. A mala dá 4 espaços. Desde a R, dá para levar sopa e água na expedição [W].
- Saídas por evento: a pessoa fica fora por 2 dias, e a filha por 3 dias na escola [W]. A expedição comum tem duração não encontrada [NE]. Usamos 2 dias como proposta [P].

### 4.3 Local e tipo de saída

- 32 locais de busca mais a opção "nada" [W].
- Um local por expedição. Não está escrito se a escolha é uniforme [NE]. Proposta: uniforme, com "nada" como um dos 33 resultados [P].
- Alguns locais dão "aleatório" (um item sorteado). A lista do sorteio não foi encontrada [NE].
- A gaita só aparece como "aleatório" no bônus de item [W].

### 4.4 Retorno: chances

Probabilidades aproximadas, dependendo da condição lá fora [W]:

| Condição | Volta bem | Volta doente | Não volta |
|---|---|---|---|
| Radioativo, com máscara | 70% | 20% | 10% |
| Radioativo, sem máscara | 10% | 70% | 20% |
| Já doente, radioativo | 0% | 76% | 24% (marcado como a confirmar) |
| Neutro | não encontrado [NE] | | |
| Bandidos | não encontrado [NE]; "risco extremamente alto" [W] | | |

Observações:

- A wiki diz que os números são aproximações e que o DLC muda as chances [W].
- A máscara impede o adoecimento causado pela radiação [W].
- Com rádio informando que a radiação caiu, as chances de voltar doente ou de não voltar caem muito [W].
- Pessoa em mau estado (ferida, louca, doente, fatigada) tem menos chance. Os números exatos não estão nas páginas [NE].

### 4.5 Efeito de cada item levado

Itens que só ajudam quem volta (sem bônus de loot) [W]:

| Item | Efeito na expedição |
|---|---|
| Máscara de gás | Protege da radiação; não volta doente por causa dela |
| Kit médico | Sem kit, a pessoa pode voltar com um ferimento que aparece num evento alguns dias depois [W]. Com kit, o kit é usado para isso. |
| Machado e rifle | Mais chance de voltar quando há bandidos fora [W] |
| Mapa, manual de escoteiro, lanterna, água e sopa | Mais chance de voltar quando a pessoa está em mau estado [W] |
| Mala | 4 itens em vez de 1 (3 se a própria mala ocupa um espaço) [W] |

Regras de bônus [W]:

- Um item só ajuda a encontrar um extra por expedição.
- O item volta para a casa só quando a pessoa volta.
- Chance de achar o extra cai com a dificuldade [W].
- Chance de o item voltar quebrado aumenta com a dificuldade [W].

### 4.6 Bônus por item carregado

Cada item leva a uma sequência de três saídas possíveis. Se o item estiver na mão, a expedição pode trazer o extra abaixo [W]:

| Item levado | Resultado 1 | Resultado 2 | Resultado 3 |
|---|---|---|---|
| Baralho | 2 água | Manual de escoteiro | Mapa |
| Damas | 3 sopa | Rádio | Munição |
| Gaita | aleatório | aleatório | (só dois resultados, ambos aleatórios) |
| Cadeado | 2 água | Manual de escoteiro | Rifle |
| Rádio | 3 água | Kit médico | Rifle |
| Repelente | 2 sopa | Mapa | Rádio |
| Munição | aleatório | Máscara de gás | Kit médico |

### 4.7 Locais e loot

Cada linha é um local. Os valores são a comida (sopa), a água e os itens que podem sair. "Nada" é sempre uma saída possível. O local faz um resultado; o item levado faz outro extra (seção 4.6).

| Local | Sopa | Água | Itens |
|---|---|---|---|
| Banco | 4 | 1 | baralho, cadeado, mala |
| Bar | 1 | 2 | baralho, damas |
| Boliche | 3 | 2 | cadeado, damas, rádio |
| Rodoviária | 1 | 2 | rádio |
| Igreja | 1 | 2 | lanterna |
| Cinema | 2 | 2 | cadeado, baralho, lanterna |
| Prefeitura | 0 | 2 | rádio, kit, mapa |
| Docas | 5 | 4 | munição, damas |
| Casa de um colega | 2 | 2 | damas, máscara, mala |
| Corpo de bombeiros | 0 | 3 | machado, cadeado, repelente |
| Posto de gasolina | 1 | 1 | repelente, mapa, baralho |
| Hospital | 1 | 2 | kit, máscara, machado |
| Hotel | 1 | 1 | damas, lanterna, machado |
| Biblioteca | 1 | 2 | rifle, manual |
| Casa da própria família (quintal) | 2 | 2 | machado, rifle, repelente, manual, aleatório |
| Estação de metrô | 2 | 2 | munição, repelente, mala |
| Macaco que acompanha | 2 | 1 | kit |
| Museu | 2 | 2 | máscara, cadeado, munição |
| Vizinhança | 1 | 1 | munição, manual, lanterna |
| Estacionamento | 2 | 2 | mala, machado, lanterna |
| Delegacia | 1 | 1 | rifle, munição, mapa |
| Escola | 1 | 2 | manual, mapa, máscara |
| Nave caída | 2 | 2 | aleatório (ou nada) |
| Loja | 4 | 4 | rádio, kit, máscara |
| Supermercado | 4 | 6 | rádio, mapa, rifle, repelente, lanterna |
| Lançamento de suprimentos | 2 | 2 | machado, rádio, kit, rifle, máscara |
| Teatro | 2 | 3 | cadeado, mala, machado |
| Lixeiras | 1 | 1 | rádio, rifle, máscara |
| Mochila de saqueador | 1 | 2 | kit, baralho |
| Feiticeiros (escambo) | 2 | 3 | rádio (troca de um item seu) |
| Iate | 1 | 2 | mapa, rádio |
| Zoológico | 0 | 2 | 3 aleatórios |

Notas:

- "Nave caída" tem três variantes. Uma dá 2 sopas e 2 águas. Outra dá 2 águas e um item aleatório. A terceira dá 2 sopas ou 2 águas ou um aleatório. Em cada uma, há a opção de nada [W].
- "Feiticeiros" é escambo: troca-se um item seu (meias, moedas, tampinha) por comida, água ou rádio [W]. Não é loot grátis.
- "Aleatório": a lista de itens sorteados não foi encontrada [NE].
- Os números são os do texto de cada local, não de uma tabela de probabilidades. As chances de cada local não estão nas páginas [NE].
- Quando já se tem um item funcional, a busca daquele item não acontece [W]. A regra foi escrita para o mapa e provavelmente vale para outros itens únicos [I].

### 4.8 Quebra de item na expedição

Todo item pode quebrar ou se perder na expedição [W]. O item volta quebrado ou nem volta. Itens citados nas páginas:

- mala (pode ser perdida), máscara (pode quebrar), baralho (pode ficar lá fora), damas (pode ficar lá fora), kit (usado ou perdido), machado (perdido), manual (pode ser perdido), gaita (quebra por poeira radioativa), mapa (fica quase inutilizável), cadeado (perdido), rádio (quebra), rifle (dano), repelente (perdido), munição (perdida), lanterna (fora de serviço).

Chances exatas não encontradas [NE].

### 4.9 Volta: estados

- Ferimento: se a pessoa saiu sem kit, pode voltar ferida e a ferida aparece dias depois [W].
- Doença: se saiu sem máscara em área radioativa, pode voltar doente [W].
- Cansaço: volta cansada em alguns casos [W].
- Fome: sobe mais depressa até o primeiro dia depois de voltar [W].
- Pessoa que volta bem não precisa de nada especial além de comida [I].

### 4.10 Falha, captura e morte

Resultados de falha [W]:

- **Não volta**: a pessoa morre. Se os outros adultos estiverem em casa, o jogo segue. Se não houver ninguém em casa e o cadeado foi usado, é derrota [W].
- **Capturada por bandidos**: a pessoa é levada. Pode ser resgatada numa expedição de ataque ao acampamento de bandidos [W].
- **Morte por armadilha**: um tanque abandonado pode explodir e matar quem o inspecionar [W].
- **Ataque de saqueadores ao abrigo**: se a casa ficar sem defesa, eles podem levar alguém da família [W].
- **Abrigo tomado**: se a última pessoa sai sem deixar o cadeado na casa, o abrigo pode ser tomado ao voltar. Isso é derrota (seção 6.2).

Captura de criança: por bandidos, a criança é levada e considerada perdida [W].

### 4.11 O que o mapa muda

- Mapa levado: sobe a chance de voltar para quem está em mau estado [W].
- Mapa em casa: cumpre etapas da rede militar (seção 6.3) [W]. Se não tiver o mapa, a etapa falha, mas a cadeia continua [W].
- Mapa na casa: pode ser destruído pelo pai louco e reparado depois [W].
- Mapa de tesouro: indicação escrita que leva a um item escondido (duas sopas, damas, lanterna, nada, ou perda do próprio mapa) [W].

---

## 5. Itens no abrigo: uso, quebra e reparo

Tabela de uso. "Consome" significa que o item some depois do uso.

| Item | Uso no abrigo | Consome ou quebra? | Reparo | Observações |
|---|---|---|---|---|
| Sopa | Ração. Cura doença básica pela sequência de dias (seção 3.3). | Sim, 1/4 por ração | — | Lata vazia aparece como objeto de cena [W] |
| Água | Ração | Sim, 1/4 por ração | — | Garrafa quebrada aparece depois |
| Kit médico | Cura doença e ferimento. Evita cansaço. Usado como presente em aniversário e como remédio em evento. | Sim, consumido ao usar [W]. Vira "kit vazio". | Pode ser refeito com repelente, num evento [W] | Destruído pelo filho louco |
| Máscara de gás | Protege da radiação em expedição. Evento de cheiro: cura a doença de todos [W]. | Quebra em evento e na expedição [W] | Manual de escoteiro [W] | Destruída pelo pai louco e por evento de suprimento |
| Mapa | Cumpre etapa militar. Ajuda a voltar de expedição. | Quebra em evento e na expedição [W] | Reparável depois de quebrar, segundo a página [W] | Destruído pelo pai louco |
| Machado | Defesa contra saqueadores (quebra no uso). Cura doença ou ferimento usando a lâmina quente (quebra). Corta árvores em etapa militar (quebra). | Sim | — | Destruído pela filha louca |
| Rifle | Defesa contra saqueadores. Entrega como etapa militar. | Pode quebrar no uso [W] | — | Munição: uma página diz que não precisa, outra diz que é junk sem munição [D] |
| Lanterna | Etapa militar (sinal). Usada em evento de porão. | Quebra em terremoto e pela filha louca [W] | Manual de escoteiro (no O, não na R) [W] | |
| Rádio | Informa clima. Etapa militar (contato). Festa com gaita. | Quebra em incêndio, enchente, terremoto, mãe louca e em certos eventos [W] | — | Essencial para o final militar |
| Manual de escoteiro | Repara máscara e lanterna (no O). Mata baratas e aranhas (kit). | Sim, quebra ao ser usado em certos casos [W] | — | Destruído pelo filho louco |
| Repelente | Mata baratas e aranhas. Usado para refazer kit. | Consumido [W] | — | |
| Baralho | Sanidade quando usado. Etapa militar (cartas). | Pode quebrar [W] | — | Destruído pela mãe louca |
| Damas | Sanidade quando usado. Festas. | Pode quebrar [W] | — | |
| Gaita | Festa (sobe sanidade). Etapa militar (hino no morro). | Não consome [I] | — | |
| Cadeado | Protege a casa quando a última pessoa sai. | Pode ser danificado por invasores [W] | — | |
| Mala | 4 itens na expedição. Serve de cama e de palco em evento. | Pode ser perdida na expedição [W] | — | |
| Munição | Usada no rifle. Jogada no fogo, afasta invasores. Troca em evento. | Consumida [W] | — | |

### 5.1 Quebra por evento de desastre

- Terremoto: derruba e quebra lanterna, rádio e máscara, uma delas por sorteio [W].
- Incêndio: queima kit, rádio e manual, por sorteio [W].
- Enchente: alaga e quebra rádio, baralho e mapa, por sorteio [W].

### 5.2 Quebra por loucura

Cada pessoa louca destrói um item da sua lista (seção 2.5), na metade do prazo de loucura [W].

---

## 6. Duração e condições de derrota

### 6.1 Duração típica

- Recorde citado no texto de guia: 346 dias no modo difícil. O mesmo guia diz que 300+ dias é possível com a estratégia certa [G].
- Uma partida normal, sem estratégia de recorde, não tem número citado nas páginas [NE].
- Não há limite de dias. A partida termina por morte, por fuga, por tomada do abrigo ou por final militar.

### 6.2 Derrotas

Derrotas [W]:

- **Morte dos dois adultos**: fim imediato. Se um dos adultos morrer, o outro continua. Crianças que fogem são tratadas como mortas [W].
- **Ninguém dentro e o cadeado usado**: a expedição que falha com a última pessoa dentro leva à derrota [W].
- **Abrigo tomado** por outro grupo, pelo governo, por uma seita, por saqueadores, por outra família ou por uma máquina. Acontece quando a última pessoa sai sem o cadeado e, ao voltar, encontra a casa ocupada. A derrota aparece com uma mensagem própria [W].
- **Crianças que fogem** não encerram o jogo sozinhas. Eventos que matariam um adulto fazem uma criança fugir, e o jogo só acaba quando não sobra adulto [W].

### 6.3 Vitória ou final bom

Fins citados nas páginas [W]:

- **Final militar**: cadeia de etapas com rádio, máscara, mapa, lanterna, cartas, gaita, rifle, machado e um encontro com militares. Em várias etapas, a opção de "nada" falha sem matar ninguém, e a cadeia segue [W]. O final que a cadeia leva não foi lido [NE].
- **Final dos gêmeos**: cadeia com mapa, machado e rifle, que ajuda o acampamento dos gêmeos. Roubar vizinhos faz os gêmeos não poderem mais ajudar [W].

---

## Modelo para o código

Esta seção propõe números e regras para `sessenta/abrigo.mjs`. Os valores marcados [W] são os da wiki. Os marcados [P] são nossos e precisam de calibração ao jogar.

### A. Estado por pessoa

```
pessoa = {
  papel: 'pai' | 'mae' | 'filha' | 'filho',
  situacao: 'casa' | 'fora' | 'capturada' | 'fugiu' | 'morta',
  fome: 0,                // dias sem refeição completa de sopa     [W]
  sede: 0,                // dias sem água                          [W]
  doenca: null | { dias: 0, duracao: 15..20, grave: false },        // [W]
  ferimento: null | { dias: 0, duracao: 8..10, agonia: false },     // [W]
  cansada: false,         // volta de expedição / eventos           [W]
  dias_em_casa: 0,        // para fadiga                             [W]
  fadigada: false,        // dias_em_casa >= 20                     [W]
  sanidade: 60,           // escala oculta 0 a 100                  [P]
  louca: false,           // sanidade < 25 ou evento                [P]
  dias_louca: 0,          // prazo de saída: 25 a 30 dias           [W]
  mutante: false,         // so a filha                             [W]
  dias_fora: 0,           // contagem da expedição                  [P]
  sopa_pos_volta: 0       // dias de fome dobrada após voltar       [W]
}
```

### B. Estado global

```
mundo = {
  dia: 1,
  clima: 'radioativo' | 'neutro' | 'bandidos',  // [W]
  dias_clima_radio: 0,           // janela 7..20 com rádio               [W]
  contagem_bandidos: null,       // 20 dias, depois ataques a cada 3     [W]
  radio_funcional: true,
  mascara_funcional: true,
  cadeado_na_casa: true,
  itens: { sopa: 0, agua: 0, kit: 0, mascara: 0, mapa: 0, machado: 0,
           rifle: 0, lanterna: 0, radio: 0, manual: 0, repelente: 0,
           baralho: 0, damas: 0, gaita: 0, cadeado: 0, mala: 0, municao: 0 },
  expedicao_preparada: null,     // { pessoa, item }, sai no dia seguinte
  expedicao_fora: null           // { pessoa, dias_restantes }
}
```

### C. Parâmetros

| Parâmetro | Valor | Fonte |
|---|---|---|
| Porção de sopa por pessoa por ração | 1/4 de lata (1 lata = 4) | [W] |
| Porção de água por pessoa por ração | 1/4 de garrafa (1 garrafa = 4) | [W] |
| Cadência recomendada | 5 dias | [W] |
| Aviso de fome | 6 dias sem refeição completa | [W, D] |
| Morte por fome | 11º dia sem sopa (limite 10) | [W] |
| Morte por sede | 6º dia sem água (limite 5) | [W] |
| Fome em expedição | Contador andando 2x por dia, também no primeiro dia depois de voltar | [W] |
| Doença: morte | sorteio entre 15 e 20 dias | [W]; infobox diz 20 a 40 [D] |
| Doença: sopa para curar, dias sem refeição desde a doença | 0-1:3, 2:5, 3:8, 4:9, 5:[NE] | [W] |
| Doença passiva após cura | 5 dias | [W, a confirmar] |
| Ferimento: morte | sorteio entre 8 e 10 dias | [W] |
| Agonia (só R) | 3 dias | [W-R] |
| Fadiga | 20 dias dentro de casa | [W] |
| Loucura: prazo de saída | sorteio entre 25 e 30 (faixa 20 a 35) | [W] |
| Loucura: destruição de item | na metade do prazo | [W] |
| Loucura: só uma pessoa em casa | 2 dias para enlouquecer (adulto) | [W] |
| Radioativo: fim | dia 20, ou antes entre 7 e 20 com rádio | [W] |
| Bandidos: ataque | a cada 3 dias, após contagem de 20 dias | [W] |
| Duração de evento de saída | 2 dias (escola: 3) | [W] |
| Duração de expedição comum | 2 dias | [P] |
| Retorno com máscara, radioativo | 70 bem / 20 doente / 10 não volta | [W] |
| Retorno sem máscara, radioativo | 10 bem / 70 doente / 20 não volta | [W] |
| Retorno já doente, radioativo | 0 bem / 76 doente / 24 não volta | [W, a confirmar] |
| Retorno neutro | a definir | [P] |
| Retorno bandidos | a definir | [P] |

### D. Ordem diária proposta

```
para cada dia:
  1. clima: aplicar transição (rádio, dia 20, contagem de bandidos)
  2. expedicao_fora: se dias_restantes == 0, sortear retorno
       - bem / doente / ferida conforme tabela da seção C
       - não volta: morre (criança: some, conta como morta)
       - se o cadeado estava fora e a casa ficou vazia: derrota
  3. expedicao_preparada: sai agora (vira expedicao_fora, dias_restantes = 2)
  4. contadores (todas as pessoas vivas e em casa):
       fome += 1 (2 se fora ou no primeiro dia depois de voltar)
       sede += 1 (criança e mutante: ver regras)
       doenca.dias += 1
       ferimento.dias += 1
       dias_louca += 1 (se louca)
       dias_em_casa += 1; fadigada = dias_em_casa >= 20
  5. checagens de morte e fuga (ver D2)
  6. sanidade: deltas de eventos e de estar sozinha/sozinho
  7. evento do dia (sorteio com condições; pode não haver)
  8. racionamento: decisão do jogador
       - para cada pessoa servida: aplicar regras de reset (E)
  9. preparação de expedição: escolher quem (não cansada) e item
  10. fim do dia: gravar log
```

#### D2. Checagens de morte e fuga

```
se fome > 10:           morre (criança foge)
se sede > 5:            morre (criança foge)
se doenca.dias >= duracao: morre (criança foge)
se ferimento.dias >= duracao: morre (criança foge); se agonia: 3 dias
se dias_louca >= prazo: sai de casa (conta como morto)
se os dois adultos morrerem/saírem: derrota
```

### E. Regras de reset

```
racao_agua(pessoa):
  sede = 0                                  [W, zera mesmo desidratada]

racao_sopa(pessoa):
  se fome < 10:  fome = 0                   [W]
  se fome >= 10: fome = 8                   [W, morte em 3 dias]
                 (precisa de 2 refeições seguidas para voltar a 0)

doenca_por_sopa(pessoa):
  dias = dias sem refeição desde a doença
  necessario = {0:3, 1:3, 2:5, 3:8, 4:9}[dias] ou "nao_sabe"   [W]
  se alimentada as necessarias seguidas: doenca = null

mutante:
  nao_precisa_de_agua = true               [W]
  racao_sopa: normal (com dúvida sobre mais ou menos sopa) [D]
```

### F. Expedição: retorno

```
retorno(pessoa, temMascara, radioativo, jaDoente):
  se pessoa.mutante: volta bem                                [W]
  se radioativo e temMascara:   70 bem / 20 doente / 10 nao volta
  se radioativo e !temMascara:  10 bem / 70 doente / 20 nao volta
  se jaDoente:                  0 bem / 76 doente / 24 nao volta   [W]
  ajuste por estado: cada um de doente, ferido, louca, fadigada reduz 5 pontos de "bem"  [P]
  ajuste por item: mapa, lanterna, manual, sopa, agua ajudam se a pessoa está em mau estado [W]
  ajuste por bandidos: alto risco de captura (sem tabela [NE])
```

### G. Sanidade (proposta)

```
ganho:
  gato ou cao na casa: sanidade = 100                 [W]
  dar comida/agua/kit a quem pede ajuda: sanidade = 100 [W]
  nao atacar vizinhos (evento): +20                    [P]
  festa com radio ou gaita: +10 para todos            [P]
  conversa aceita: +10                                [P]

perda:
  pessoa morre ou some: -15 para os vivos             [P]
  alguem sozinho em casa: -5 por dia                  [P]
  atacar vizinho: -30                                 [P]
  decisao ruim em evento: -5 a -15                    [P]
  conversa com louco: chance de contagio (louca)      [W]

limite:
  louca quando sanidade < 25; sai do estado quando >= 60   [P, histerese]
  mae: resistencia maior (valor de perda x 0.8)        [W, trivia]
  filha: resistencia menor (valor de perda x 1.2)       [W, trivia]
```

### H. Final e log

```
final = {
  tipo: 'derrota' | 'militar' | 'gemeos' | 'tomada' | 'morte_adultos',
  dia,
  motivo
}
```

Itens e estados devem entrar no log diário para a narração do vídeo: estado de cada pessoa, itens que mudaram, expedição (saiu, voltou, não voltou), evento e escolha.
