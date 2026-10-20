# Mecânica da coleta e itens (base para a recriação)

Documento de referência para recriar a fase de coleta (60 segundos) e o catálogo de itens, com textos e arte próprios.

## 0. Fontes e convenções

- Fonte: wiki da comunidade do 60 Seconds (cópia local em scratchpad). Tudo abaixo é paráfrase e número extraído; nenhum texto de evento foi copiado. Os nomes de eventos aparecem só como rótulo de função.
- O 60 Parsecs foi ignorado. Por isso ficam de fora: Armor, Shovel, Lighter, Duct Tape (Tape), Atomic Battery e a versão 60 Parsecs do Sock Puppet.
- "Não consta" = a wiki não diz. Quando a regra é nossa, aparece como **(decisão)**. Quando é inferida de outra fonte, aparece como **(inferido)**.
- Conflitos entre páginas estão listados na seção 5.
- Versão: a wiki mistura o original (2015) e o Reatomized. Quando a página diz que vale só para uma versão, isso está escrito.

---

## 1. Regras da coleta

### 1.1 Tempo

- A coleta dura **60 s fixos** em todas as dificuldades e modos. Não é possível encerrar antes. No nosso modelo: 30 tiques de 2 s (ARQUITETURA.md).
- **Prévia** (antes do relógio): tempo para localizar itens sem poder pegar nada. Duração por dificuldade: **Little Boy 20 s, Fat Man 10 s, Tsar Bomba 1 s**.
  - Em tiques de 2 s: 10, 5 e menos de 1 tique (1 s).
  - Não consta se a prévia conta nos 60 s. **(decisão)**: a prévia não conta no relógio.
  - Exceção: o Atomic Drill (tutorial) permite pegar itens antes do relógio. Não é o modo de referência.
- Não consta se há contagem regressiva visual ou sonora separada.

### 1.2 Mãos (capacidade)

- A capacidade total é **4 espaços**. A página do Ted diz que ele tem 4 espaços para carregar itens na coleta.
- Confirmação pelos desafios de coleta: "Mary Jane + mapa" (3+1), "Dolores + Timmy" (2+2), "Mala + cadeado" (3+1). Todos somam exatamente 4.
- Um item ocupa seu espaço inteiro. Não há item "pela metade".
- Não consta quantos espaços têm as mãos de Dolores quando ela é quem coleta. **(inferido)**: também 4.

### 1.3 Espaço de cada item e de cada pessoa

- Itens: ver seção 2 (tabela). Resumo: 1 espaço na maioria; 2 para kit, rifle e machado; 3 para mala. Sopa e água não têm tamanho na wiki. **(inferido)**: 1 espaço cada, pelos desafios que trazem "4 itens por viagem".
- Pessoas, quando carregadas na coleta (são itens de mão):
  - **Ted: 3** (infobox e texto da página do Ted, que também diz que ele ocupa 3 quando é carregado por Dolores)
  - **Dolores: 2**
  - **Mary Jane: 3**
  - **Timmy: 2**
- Pela página do Ted, pessoas, rifle, mala e machado são os itens que ocupam mais de um espaço.

### 1.4 Quem coleta, quem fica e chegada ao abrigo

- O jogador controla **Ted** (padrão) ou **Dolores** (DLC). O outro adulto não vai à coleta. Pode aparecer depois, em evento raro.
- Ao fim do tempo, o adulto controlado precisa **estar no abrigo**. Os itens e as pessoas nas mãos entram com ele. Pela página do abrigo, a entrega acontece ao chegar, no fim do tempo. Não há depósito no meio da coleta na wiki.
  - A pesquisa anterior (pesquisa_coleta.md) falava em depositar várias vezes perto do abrigo. Isso não aparece nas páginas da wiki. Ficou como **conflito** (seção 5).
- Se o adulto controlado não chega ao abrigo: **fim de jogo imediato** (página de Scavenge Mode e página da Dolores). A página do Ted diz que o jogo continua sem ele, o que conflita (seção 5).
- Pessoas (filhos ou o outro adulto) que não são carregadas **ficam na casa** e não entram no abrigo naquela partida. Não morrem na hora. Podem voltar depois, por eventos raros:
  - Timmy pode voltar sozinho se a porta do abrigo for aberta nos primeiros dias.
  - Ted, se não for levado por Dolores, pode sobreviver e voltar ferido e insano.
  - Dolores pode aparecer no abrigo se a porta for aberta cedo.
  - Mary Jane pode voltar em um evento raro ("escondida na geladeira").
- Itens deixados na casa não entram no abrigo. **(decisão)**: itens não coletados ficam perdidos.
- Não consta se é possível largar um item depois de pegá-lo. Não consta se há troca de item entre mãos. **(decisão)**: não há largar nem trocar na coleta.
- A casa muda a cada partida. Invariante da wiki: o banheiro pequeno e o abrigo ficam em **extremos opostos do corredor principal**.

### 1.5 Movimento e ações

- Não consta velocidade de caminhada, nem tempo de pegar, depositar ou carregar pessoa, em segundos.
- Dica da wiki (desafios): correr em linha reta por pelo menos 2 s deixa o personagem muito mais rápido. É o único dado de velocidade.
- Itens de expedição e de casa usam o mesmo catálogo. Os itens de expedição não estão na casa (ver tabela, coluna "uso em expedição").

### 1.6 Dificuldades

| Dificuldade | Prévia | Mala (conteúdo) | Família no abrigo (modo Survival) | Estoque inicial (Survival) |
|---|---|---|---|---|
| Little Boy (fácil) | 20 s | 2 itens (página da mala); a página Survival diz até 3 | todos os 4 | muitos itens |
| Fat Man (normal) | 10 s | 1 item | 2 a 4 | moderado |
| Tsar Bomba (difícil) | 1 s | vazia | Ted + 1 | poucos itens |

- O tempo de 60 s não muda com a dificuldade (wiki, todas as páginas concordam).
- Não consta quantos itens a casa tem por dificuldade. A única diferença explícita é a mala.

### 1.7 O que a wiki fixa na casa (invariantes para fidelidade)

- Cômodos citados nas páginas de itens: **cozinha, sala, corredor principal, banheiro pequeno (com vaso), banheiro grande (com banheira), quarto dos pais, quarto das crianças**. São 7, mais o abrigo, que fica na porta do alçapão.
- Não aparecem na wiki: **garagem e despensa**. O código tem os dois (ver seção 4).
- Itens da banheira: a água costuma estar no banheiro grande. A sopa, na cozinha e no armário do corredor.
- Os móveis (estantes, mesa lateral, armários, mesa, chão, paredes) são onde os itens aparecem. Não consta quais móveis bloqueiam passagem. Não consta se portas abrem ou fecham.

### 1.8 Desafios de coleta (o que confirmam)

- Há desafios com lista de itens e combinações de 4 espaços por viagem. Servem de teste para a regra de 4 mãos (seção 1.2).
- Modo "Scavenge" isolado: só coleta, sem fase de abrigo e sem condição de vitória. Serve para treinar a corrida.

---

## 2. Tabela completa de itens (60 Seconds, sem 60 Parsecs)

Colunas: id sugerido (igual ao itens.mjs quando já existe) | nome | espaço na coleta | onde aparece (cômodo da wiki) | uso no abrigo | uso em expedição | durabilidade / quebra | eventos (resumo por função)

| id | nome | espaço | onde aparece | uso no abrigo | uso em expedição | durabilidade / quebra | eventos (resumo) |
|---|---|---|---|---|---|---|---|
| sopa | lata de sopa | 1 (inferido) | cozinha; armário no meio do corredor | comida: 1/4 de lata por pessoa por ração; 1 lata = 4 porções | não é item de expedição; a expedição deixa a pessoa com mais fome | consumível; insanos destroem uma lata | trocas, presentes, invasões, animais, plantas, brincadeiras; muitos |
| agua | garrafa de água | 1 (inferido) | banheiro grande (na banheira), banheiro pequeno, cozinha, sala | bebida: 1/4 de garrafa por pessoa por ração; 1 garrafa = 4 porções | alguns itens trazem água (cadeado 2, rádio 3, baralho 2) | consumível; insanos destroem uma garrafa | trocas, apostas, visitantes, sinal; muitos |
| radio | rádio portátil | **1** (código tem 2) | banheiros, quarto das crianças, cozinha, sala | canal militar (necessário para o final de resgate militar); avisos sobre a radiação; música dá sanidade | traz 3 água, kit ou rifle | frágil: quebra com incêndio, enchente, terremoto, mexer nele, Dolores insana | resgate militar, avisos, suprimento aéreo, enchente |
| mapa | mapa | 1 | corredor, quarto das crianças, quarto dos pais | coordenadas do resgate militar (sem mapa, a mensagem não serve); tesouros | aumenta a chance de voltar (quando a pessoa não está bem) | Ted insano destrói; alguns eventos destroem | resgate militar, tesouro, visitantes, paranormal |
| mascara | máscara de gás | 1 | banheiros, corredor, quartos, sala (penduradas na parede) | banho (cura doença de todos); pedido militar de gás (permite o final militar) | protege da radiação: a pessoa não volta doente | quebra com terremoto, suprimento aéreo, Ted insano; conserta com o manual (original) | radiação, banho, mutação, presentes |
| kit | kit de primeiros socorros (medkit) | **2** (código tem 1) | banheiros, cozinha | cura doença ou ferimento (uso único); remédio para dormir (evita cansaço) | se a pessoa voltaria ferida, consome o kit e evita o ferimento (não evita morte) | consumido ao usar; Timmy insano destrói; pode ser refeito (inseticida + manual + kit usado) | ferimentos, doenças, insônia, aniversário, bandidos |
| rifle | rifle | 2 | banheiro, corredor, sala, quarto dos pais | defesa contra invasores; caça (dá comida em um evento) | reduz a chance de captura por bandidos | quebra no uso; munição evita a quebra (conflito, seção 5); conserta com o manual | invasões, animais, tanque, pedido militar para entregar a arma |
| machado | machado | 2 | banheiro, corredor, cozinha, sala, quarto dos pais | defesa (quebra após um uso); cura ferida (lâmina aquecida); corta a barba do Ted | sem efeito na expedição (ocupa espaço sem ajudar) | quebra quase sempre no uso; Mary Jane insana destrói | invasões, feridos, barba, vegetais, mapas |
| lanterna | lanterna | 1 | corredor, quarto das crianças, quarto dos pais | obrigatória para ganhar o cachorro; sinal para avião militar; explora o porão | aumenta a chance de voltar | resistente: quebra em terremoto, evento de baralho, Mary Jane insana; conserta com o manual (versão original) | cachorro, sinal militar, porão, tesouro |
| cadeado | cadeado | 1 | corredor, quarto das crianças, sala, quarto dos pais | defesa: trava a porta e espanta invasores (consumido) | traz 2 água, rifle ou manual; se resta um só familiar, deixá-lo no abrigo permite uma última expedição | consumido ao usar; não pode ser consertado | invasões, expedição com o cachorro |
| inseticida | inseticida (bug spray) | 1 | banheiros, cozinha, sala, quarto dos pais | mata baratas e aranhas (consumido na maioria); cega invasor; com manual e kit usado vira kit novo | traz 2 sopa, mapa ou rádio (conforme o caso) | consumível; não pode ser consertado | insetos, invasões, cura de doença, mutação |
| mala | mala | 3 | corredor, sala, quarto dos pais | ao ser coletada, dá itens extras (ver 1.6); serve de armadilha e cama | permite levar 3 itens a mais na expedição | frequentemente destruída em eventos; pode ser perdida na expedição | pesca, armadilha, armário, teatro, abrigo de criança |
| baralho | baralho | 1 | banheiro, quarto das crianças, sala, quarto dos pais | sanidade (entretenimento); aposta (2 sopa ou 2 água, pode perder); troca (1 água ou 1 sopa); sinal militar com cartas | traz 2 água, mapa ou manual | Dolores insana destrói; inundação destrói | aposta, troca, aniversário, sinal militar, enchente |
| damas | tabuleiro de damas (checkers) | 1 | corredor, quarto das crianças, sala | sanidade; ajuda a Timmy dormir; troca (1 água); peças no chão ferem invasores | traz 3 sopa, rádio ou munição | perde peças; pode ser levado em troca | troca, sinal, invasão, aniversário |
| gaita | gaita (harmonica) | 1 | banheiro, quarto dos pais | afasta invasores (às vezes falha); sanidade (festa); sinal militar | só aparece por sorte em expedição (evento aleatório) | o cachorro come a gaita se ficar 2 dias sem comida | invasão, festa, militar, baratas |
| manual | manual do escoteiro (Boy Scout Handbook) | 1 | banheiro, quarto das crianças, sala, quarto dos pais | conserta lanterna, máscara, mapa (50% destrói os dois), rifle e rádio; mata baratas e aranhas sem quebrar; sanidade | aumenta a chance de voltar | quebra com incêndio ou com Timmy insano; não conserta cadeado, damas, kit, machado, baralho | consertos, insetos, sanidade, sinal, presentes |
| municao | munição | 1 | corredor, cozinha, sala, quarto dos pais | limpeza (cura doença); troca (1 água); munição extra evita quebra do rifle | traz máscara, kit ou item aleatório | consumida ao usar | defesa com rifle, troca, cheiro, mutação |

### 2.1 Itens fora do catálogo

- **Sock Puppet** (fantoche de Ted): não é item coletável na casa. Aparece quando Ted fica insano.
- **Pancake** (cachorro): personagem, não item. Vem de uma sequência de eventos com lanterna, máscara, kit e rifle/machado.
- **Atlas** e **Xadrez**: não aparecem em nenhuma página da wiki lida. Não entram no catálogo. (A pesquisa anterior citava os dois sem confirmação.)
- **Chapéus**: cosméticos de desafio, não são item.
- **60 Parsecs**: Armor, Shovel, Lighter, Duct Tape, Atomic Battery. Fora de escopo.

---

## 3. Personagens da família (atributos)

Os valores de espaço são os que a wiki dá para quando a pessoa é carregada.

**Força**: não existe atributo de força no 60 Seconds. A wiki só tem força, inteligência e agilidade para a tripulação de 60 Parsecs. O único número físico relevante é o **espaço de carga**.

**Fome e sede** (iguais para todos):
- Ração: 1/4 de lata e 1/4 de garrafa por pessoa. Recomendação da wiki: racionar a cada 5 dias.
- Morte: 10 dias sem sopa, 5 dias sem água. Mary Jane e Timmy não morrem: fogem do abrigo, e a wiki considera que estão mortos.
- Expedição: a pessoa passa a precisar de comida quase duas vezes mais vezes, inclusive no dia da volta.
- Não há diferença de consumo entre personagens. O que muda é a resistência (ver abaixo).

| Personagem | Espaço quando carregado | Sanidade (resistência à loucura) | Fome e sede | O que faz bem | Fraquezas | Observações da wiki |
|---|---|---|---|---|---|---|
| Ted (pai) | 3 | média | tolera mais tempo sem sopa (o corpo é mais pesado) | expedição: se o cadeado fica no abrigo e ele sai sozinho, é quem tem mais chance de voltar | insano: destrói mapa, água, sopa ou máscara; se estiver sozinho no abrigo, fica insano no dia 2 | controlado por padrão; 4 espaços de mão; cresce barba (evento de barbear com o machado) |
| Dolores (mãe) | 2 | a mais resistente à loucura | igual | costuma levar o baralho, que dá sanidade; resiste mais à loucura (inferido: é a mais estável para sair com a sanidade baixa) | insana: destrói rádio, baralho, sopa ou água; pode sair de casa para "procurar o pai" | controlada na DLC; quando ela coleta, o Ted ocupa 3 espaços |
| Mary Jane (filha) | 3 | a mais vulnerável à loucura | igual; como mutante, não precisa de água, mas come mais sopa | mutante: nunca se machuca nem fica doente, sempre volta da expedição e traz água | pode ser capturada por bandidos (escolha do jogador); insana destrói machado, lanterna ou sopa; não carrega itens quando mutante | única que pode mutar; mutação vem de eventos com insetos, vazamento ou planta |
| Timmy (filho) | 2 | sensível (no desafio do abrigo sozinho, pode ficar insano no dia 2 se não houver o manual) | igual; sem água ou comida, foge do abrigo | 50 a 60% de chance de trazer comida, água ou item de expedição (infobox); cura ferimentos com o manual; é o melhor para as fases de abrigo (estratégia "pai e filho") | insano: destrói o kit; foge se estiver com fome ou sede | a wiki também diz que não convém mandá-lo para coleta: pode morrer |

Pancake (cachorro, não é família): traz comida, água e itens quando sai para passear. Some se não for alimentado, ou se Sharikov entrar no abrigo.

---

## 4. Correções para o código

Nada foi alterado no código. Abaixo, o que mudar em cada arquivo.

### 4.1 itens.mjs

1. `radio`: espaço **2 → 1** (wiki: rádio ocupa 1).
2. `kit`: espaço **1 → 2** (wiki: kit ocupa 2).
3. `mala`: espaço **2 → 3** (wiki: mala ocupa 3).
4. **Adicionar** `municao: {nome: 'munição', espaco: 1, tipo: 'ferramenta'}`. Está faltando (17 itens na wiki, 16 no código). Precisa de entrada em `ONDE` no casa.mjs.
5. Não adicionar `atlas` nem `xadrez`: não existem na wiki.
6. Espaço de `sopa` e `agua` (1 cada): mantém, mas marcar como **(inferido)** no comentário.
7. `tipo`: sem mudanças necessárias.

### 4.2 familia.mjs

1. `pai` (Ted): `espaco: 0 → 3`. O zero está errado: quando carregado, ocupa 3 (comentário "o pai é quem carrega" não justifica zero).
2. `mae` (Dolores): `espaco: 2`, correto.
3. `filha` (Mary Jane): `espaco: 2 → 3`.
4. `filho` (Timmy): `espaco: 1 → 2`.
5. `fome`: os valores 1.0, 1.0, 0.9 e 0.8 não existem na wiki. Todos consomem 1/4 de lata por ração. Ou se muda para 1.0 para todos, ou se documenta o multiplicador como decisão nossa (e então não citar a wiki para ele).
6. `desc` do filho: "come menos" contradiz a wiki (consumo igual). Ajustar o texto.
7. `forca`: não há na wiki. Se for manter, é decisão nossa; documentar isso.
8. Nomes e papéis: são nossos (não copiar os nomes do jogo original). Os papéis (pai, mãe, filha, filho) já estão corretos.

### 4.3 casa.mjs

1. **Mapeamento de itens (`ONDE`)**: trocar pelos cômodos da wiki (com `garagem` e `despensa` fora, pois não existem na wiki):
   - `sopa`: `['cozinha', 'corredor']`
   - `agua`: `['banheiro', 'cozinha', 'sala']`
   - `radio`: `['banheiro', 'criancas', 'cozinha', 'sala']`
   - `mapa`: `['corredor', 'criancas', 'quarto']`
   - `mascara`: `['banheiro', 'corredor', 'criancas', 'sala', 'quarto']`
   - `kit`: `['banheiro', 'cozinha']`
   - `rifle`: `['banheiro', 'corredor', 'sala', 'quarto']`
   - `machado`: `['banheiro', 'corredor', 'cozinha', 'sala', 'quarto']`
   - `lanterna`: `['corredor', 'criancas', 'quarto']`
   - `cadeado`: `['corredor', 'criancas', 'sala', 'quarto']`
   - `inseticida`: `['banheiro', 'cozinha', 'sala', 'quarto']`
   - `mala`: `['corredor', 'sala', 'quarto']`
   - `baralho`: `['banheiro', 'criancas', 'sala', 'quarto']`
   - `damas`: `['corredor', 'criancas', 'sala']`
   - `gaita`: `['banheiro', 'quarto']`
   - `manual`: `['banheiro', 'criancas', 'sala', 'quarto']`
   - `municao` (novo): `['corredor', 'cozinha', 'sala', 'quarto']`
2. **Cômodos**: a wiki tem 7 cômodos de itens (cozinha, sala, corredor, banheiro pequeno, banheiro grande, quarto dos pais, quarto das crianças). O código tem 8, com `garagem` e `despensa` que não aparecem na wiki, e só um `banheiro`. Escolha: ou ajustar para os 7 da wiki (trocar `garagem` e `despensa` pelo banheiro pequeno e o banheiro grande), ou manter o 8º cômodo como decisão nossa. Se manter, ele não pode ser fonte de item que a wiki atribui a outro cômodo.
3. **Posição do abrigo**: `ABRIGO = {x: 9, y: 8}` fica a uma casa da porta do banheiro (x 8, y 9). A wiki diz que o banheiro pequeno e o abrigo ficam em **extremos opostos** do corredor. Mover o alçapão para a outra ponta.
4. **Mecânica de largar no alçapão** (comentário em casa.mjs): não está na wiki. A wiki diz que os itens entram no abrigo ao chegar. Ou se marca como decisão nossa, ou se remove.
5. **Quantidade** (`QTD = {sopa: 8, agua: 8}`): a wiki não dá número. Conferência: 8 latas = 32 porções. Com 4 pessoas (1 por ração) e ração a cada 5 dias, dá 8 rações, ou seja cerca de **40 dias**. Serve de ponto de partida. Marcar como decisão.
6. `lugares` (onde a família começa): inclui `garagem`. Trocar se `garagem` sair.
7. Comentário do topo: "8 cômodos" e "casa térrea dos anos 50" são decisões nossas. A wiki tem 7 cômodos de itens.

---

## 5. Conflitos entre fontes e lacunas

Conflitos (escolha usada no documento aparece em negrito):

1. **Adulto controlado fora do abrigo**: game over imediato (página de Scavenge Mode, página da Dolores, trivia do Ted) **vs.** o jogo continua sem o Ted (página do Ted, primeira parte). **Escolha: game over**.
2. **Mala com Little Boy**: 2 itens (página da mala) **vs.** até 3 (página Survival). **Escolha: 2**, que vem da página da própria mala.
3. **Rifle e munição**: "não precisa de munição" (páginas do rifle e da munição) **vs.** "sem munição o rifle quebra" (página de estratégias). A página do rifle diz que a munição evita a quebra quando usada. **Escolha: o rifle não precisa de munição para funcionar; a munição evita a quebra.**
4. **Entrega no abrigo**: só no fim do tempo (Scavenge Mode e Shelter) **vs.** depósito no meio da coleta (pesquisa anterior, citando Level Winner, não está na wiki). **Escolha: só no fim.**
5. **Prévia conta nos 60 s?**: não consta. **Escolha: não conta.**
6. **Espaço de sopa e água**: não consta na wiki. **Escolha: 1 cada (inferido dos desafios).**
7. **Quantidade de sopa e água na casa**: não consta. **Escolha: 8 cada (decisão).**
8. **Reparo com o manual**: a página da lanterna diz que o conserto não existe no Reatomized. As demais páginas tratam como válido. Versão: original.
9. **Ted e espaço**: a infobox diz 3 e o texto diz 4 de mão. Não é conflito: 3 é o espaço que Ted ocupa quando é carregado, 4 é a capacidade das mãos.

Lacunas (o que a wiki não diz e que precisa de decisão ou teste):

- Velocidade de andar, tempo de pegar e de depositar, em segundos.
- Se é possível largar ou trocar um item na mão.
- Se itens aparecem através de paredes ou só ao entrar no cômodo.
- Quantidade de itens por cômodo e por dificuldade.
- Quantos itens sobram na casa depois de uma partida (inclui os que ficam no chão).
- Regras de portas e de móveis (quais bloqueiam passagem).
- Atributos de força e de sanidade das pessoas da família (a wiki só dá sanidade de forma qualitativa).
