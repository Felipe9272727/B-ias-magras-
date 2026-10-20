# Pesquisa: fase de sobrevivência no abrigo (60 Seconds! e 60 Seconds! Reatomized)

Objetivo: base para a recriação do zero em `sessenta/abrigo.mjs` e afins (ver `ARQUITETURA.md`). Tudo aqui é descrição com palavras próprias, não cópia de textos do jogo.

## Aviso sobre as fontes (leia antes)

- A wiki oficial de fãs (60seconds.fandom.com) respondeu com HTTP 402 (pagamento exigido) para todas as páginas tentadas (Survival, Expeditions, Sickness, Challenges, Hunger/Thirst). Não foi possível ler a wiki diretamente.
- Guias do Steam (Anom's, Events Explained, Beginner's guide), PSNProfiles e speedrun.com retornaram 429 (limite de requisições) ou 403 (proibido).
- Namu Wiki e Vintage Is The New Old retornaram 403.
- O que está abaixo veio, portanto, de trechos de busca (resumos dos resultados), de páginas que conseguimos abrir (Wikipedia; discussão do Steam, quase vazia) e dos trechos de guias que apareceram nas buscas. São fontes de fãs, antigas (algumas com mais de 1.000 dias) e, em vários pontos, contraditórias.
- Marcação de confiança usada abaixo:
  - **[confirmado]**: fonte aberta e legível diz isso.
  - **[trecho]**: só aparece no resumo de busca, não foi aberto.
  - **[divergente]**: as fontes discordam.
  - **[não encontrado]**: nada encontrado.
- Os números exatos da versão original (2015) não foram verificados. Quase tudo o que temos é de guias da versão Reatomized (2019), que mudou regras de comida e do cachorro.
- Recomendação: antes de fixar qualquer número no código, conferir com a wiki (versão paga ou cache) ou, melhor ainda, medir no próprio jogo (jogar uma partida com o diário de cada dia anotado).

## 0. Contexto do jogo (base)

- Desenvolvedora: Robot Gentleman (Polônia). Lançado para Windows em 25/05/2015 (**[confirmado]** Wikipedia). Reatomized é a versão revista de 25/07/2019 (**[confirmado]** Wikipedia).
- Estrutura: uma fase curta de coleta de 60 segundos antes da bomba, e depois a fase de dias no abrigo. A coleta define o que chega ao abrigo (**[confirmado]** Wikipedia: "items gathered here affect the rest of the game").
- A família de quatro pessoas tem nomes próprios no jogo original. **Não reutilizar esses nomes**, conforme a regra de ARQUITETURA.md.
- Reatomized tem também um modo "Survival Challenges" (**[trecho]** Apptopia).

## 1. Ciclo de um dia (diário)

Estrutura descrita pela Wikipedia (**[confirmado]** em termos gerais):

1. Cada dia começa com uma situação: o jogador vê os recursos e as pessoas.
2. O jogador toma decisões do dia (pela descrição geral: "decide how to act based on available supplies, limited information, and the family members' abilities"). Algumas escolhas são arriscadas e podem causar problemas de saúde ou morte.
3. A ração (comida e água) é distribuída entre a família, levando em conta a quantidade de comida, a saúde de cada um e as necessidades de cada um.
4. Pode sair uma expedição (um membro sai para "buscar" recursos, com risco de radiação ou morte).
5. Os eventos normalmente acontecem uma vez por dia. O mais conhecido é a **batida na escotilha** (alguém bate no alçapão; o jogador decide abrir ou não). Os desfechos incluem trocas com outras famílias e assaltos que roubam suprimentos (**[confirmado]** Wikipedia).
6. Pelo menos um evento por dia está nas fontes; a ordem exata entre ração, evento e expedição **[não encontrado]**.

Pontos em aberto:
- Em qual momento exato do dia a ração é dada em relação ao evento (**[não encontrado]**).
- Se a expedição é decidida no mesmo dia em que sai ou se a saída vira o dia seguinte. Um trecho de guia diz que se prepara a expedição num dia e a pessoa sai no dia seguinte (**[trecho]** Wiki de fãs, via busca). Não foi confirmado.

Decisões do jogador ou da IA, em cada dia:
- Dar ou não comida e água, e a quem.
- Aceitar ou recusar o evento do dia (abrir a escotilha, por exemplo).
- Mandar ou não alguém na expedição, e com que item.

## 2. Ração: sopa e água

Números de fãs (todos **[trecho]** ou **[divergente]**, salvo indicação):

- **Água**: precisa ser dada a cada 5 dias a cada pessoa, ou ela morre (desidratação). Se não houver ninguém em expedição, a água pode ser dada só a cada 5 dias (**[trecho]** Speedrun.com/Steam via busca). Em outra fonte, a criança foge em vez de morrer (**[trecho]** Wiki de fãs).
- **Comida (sopa)**: pode-se passar até cerca de 9 a 10 dias sem comida no começo. Depois disso, precisa de alimento a cada aproximadamente 5 dias (**[divergente]**: uma fonte diz 9 dias, outra 10 dias, o PSN diz 10 dias).
- **Fome e sede aceleram com doença**: quem está doente morre de fome mais rápido (**[trecho]** Wiki de fãs).
- **Depois de sair em expedição**: quem volta precisa receber comida e água em até 3 dias, ou morre (**[trecho]** PSN Trophy Guide via busca).
- **Quem está bem alimentado** volta mais vezes das expedições. Alimentar antes de mandar para fora é recomendado (**[trecho]** PSN/Speedrun).
- **Prioridade**: água antes da comida, porque a sede mata antes. Um guia recomenda beber água pelo menos uma vez nos dias 4 ou 5 quando o estoque é baixo (**[trecho]** NamuWiki via busca).
- **Quantidade por pessoa por dose**: **[não encontrado]**. Nenhuma fonte deu porção exata de sopa ou de litro de água.

Estados de fome e sede: os nomes exatos ("com fome", "faminto", "sedento", "desidratado") não foram confirmados. Um trecho diz que um personagem que está faminto ou desidratado sobrevive só cerca de mais 2 dias (**[trecho]**, Steam guide via busca). A escala intermediária (com fome antes de faminto) **[não encontrado]**.

Diferença entre personagens:
- Crianças fogem em vez de morrer quando a água falta (**[trecho]**).
- O cachorro Pancake precisa de comida no Reatomized e morre sem ela. No original, não precisava (**[trecho]** Wiki de fãs). Essa é a principal diferença de ração entre personagens, pelo que encontramos.
- Os adultos não têm diferença de ração descrita nas fontes abertas.

Regra de ouro das fontes: se houver comida e água suficientes, a família vive bem; o gargalo é a água.

## 3. Estados das pessoas

| Estado | Como surge | Como cura / resolve | Consequência | Confiança |
|---|---|---|---|---|
| Fome / fome grave (faminto) | Passar do limite de comida (ver seção 2) | Dar comida | Morte por inanição; doença mais rápida | trecho/divergente |
| Sede / desidratação | Passar 5 dias sem água | Dar água | Morte ou criança foge | trecho |
| Doença (radiação) | Voltar de expedição sem máscara de gás, quando o lado de fora está muito radioativo; ficar muito tempo sem comer; alguns eventos | Kit médico (first aid/medkit) ou um evento de banho ("shower event") | Morre ou sai do abrigo em cerca de 15 a 20 dias | trecho |
| Cansaço / fadiga | Falta de comida, isolamento, eventos | Comer, descanso [não confirmado] | Mais chance de doença e de morrer na expedição | trecho (comentário de fórum) |
| Ferimento | [não encontrado] | [não encontrado] | [não encontrado] | — |
| Loucura / insanidade | Isolamento prolongado (o jogo cita o efeito, sem número) | Rádio cura loucura (**[trecho]** Wiki de fãs) | Comportamento estranho; afeta o jogo | trecho |

Pontos importantes:
- A doença tem caminho de volta: o kit médico cura (trechos da wiki e do PSN). Não está claro se o banho do evento cura sem item.
- **Sem máscara de gás, a chance de doença sobe muito.** Um trecho diz que, numa expedição sem máscara com radiação alta, cerca de 76% voltam doentes e cerca de 24% não voltam. Esse número foi marcado pela própria fonte como precisando de confirmação.
- Um rádio com notícia de radiação caindo reduz muito a chance de voltar doente ou de não voltar (**[trecho]** Wiki de fãs).
- Estados que aparecem no jogo mas não foram achados nas fontes abertas: cansaço detalhado, ferimentos, e a fuga da família ou de um membro por loucura.

## 4. Expedições

- **Quem sai**: um membro da família por vez. Um trecho do Speedrun.com diz que o ideal é manter dois no abrigo (dois adultos ou criança + adulto) e mandar um terceiro (**[trecho]**).
- **Quando**: uma expedição por dia, no máximo (**[trecho]**, a preparação é um dia e a saída no outro). Confirmação necessária.
- **Itens que pode levar**: o jogo deixa escolher um item para levar (**[trecho]** Wiki de fãs). Itens citados como importantes para a expedição: **máscara de gás** (a mais citada), **mapa**, **machado**, **gaita** (para uma rota de coleta) e **kit médico** (**[trecho]**). Munição, se a arma estiver no abrigo.
- **Máscara de gás é obrigatória?** Não é obrigatória no sentido de bloquear a saída, mas as fontes dizem que é "altamente recomendada" porque sem ela a chance de doença sobe muito (**[trecho]**).
- **Duração**: **[não encontrado]**. A expedição parece ser de um dia de jogo (saída, volta no dia seguinte), mas sem número confirmado.
- **Riscos**: radiação (doença), morte (não voltar), ataques de outros grupos (**[trecho]**).
- **O que traz de volta**: itens e comida, com quantidade variável. Não encontramos a tabela exata (**[não encontrado]**).
- **Chance de não voltar**: ver o número de 24% na seção 3 (versão com radiação alta, sem máscara, **[trecho]** a confirmar).
- **Como o mapa muda isso**: o mapa é citado como item essencial, mas o efeito exato (reduz risco? abre locais?) **[não encontrado]**.
- **Estado depois de voltar**: precisa de comida e água em até 3 dias (**[trecho]**); pode voltar doente (ver seção 3).
- **Troca**: a máscara de gás tem valor de troca de 2 comidas (**[trecho]** guia de eventos do Steam).

## 5. Uso dos itens no abrigo

Só o que apareceu nos trechos (quase tudo **[trecho]**):

| Item | Uso citado | Gasta ou quebra? |
|---|---|---|
| Mapa | Crucial, usado nas expedições | [não encontrado] |
| Gaita | Necessária para uma rota de coleta | [não encontrado] |
| Kit médico (medkit / first aid) | Cura doença | Provavelmente consumido (não confirmado) |
| Machado | Crucial (não detalhado) | [não encontrado] |
| Máscara de gás | Protege na expedição; valor de troca | Não confirmado |
| Rádio | Cura loucura; informa radiação | [não encontrado] |
| Munição / arma | Só se a arma estiver no abrigo | [não encontrado] |
| Inseticida | Citado como útil para consertar algo (**[trecho]** PSN) | [não encontrado] |
| Sopa / comida | Ração | Consumida |
| Água | Ração | Consumida |

Não encontrado nas fontes abertas: lanterna, cadeado, baralho, xadrez, livro de escoteiro, mala, atlas. Estão citados no pedido, mas não aparecem nos trechos; ou são de outra fase, ou não têm efeito relevante.

## 6. Itens que aparecem depois (eventos e expedições)

- Os itens da coleta (60 segundos) entram no abrigo e definem o que a família tem (**[confirmado]** Wikipedia).
- Itens de expedição: trazidos de volta pela pessoa que saiu (**[trecho]**).
- Eventos: a escotilha pode trazer troca com outros grupos ou roubo de suprimentos (**[confirmado]** Wikipedia).
- Itens específicos de evento (kits, cortes de rádio, etc.): não confirmados.

## 7. Condições de derrota e duração típica

- **Derrota**: a família pode morrer, em parte ou por completo, por decisões arriscadas (**[confirmado]** Wikipedia). Não há uma condição de "dias"; a derrota vem de morte ou fuga.
- **Vitória**: certas decisões trazem o Exército dos EUA ou outro grupo maior para resgatar a família, e o jogo acaba (**[confirmado]** Wikipedia). O número de dias para isso **[não encontrado]**.
- **Duração típica de uma partida**: **[não encontrado]**. Uma fonte fala em "300+ dias" possíveis no original (**[trecho]** Vintage Is The New Old), mas a mesma fonte é de baixa confiabilidade. Não usar como meta.
- Modo "Survival Challenges" existe no Reatomized (**[trecho]**). Não foi lido.

## 8. Adaptação para IA por texto

### 8.1 O que a IA deve receber a cada dia

Texto curto e completo, para o prompt do dia (em português):

- **Dia N** e cômodo/recursos: comida (unidades), água (unidades), itens com nome e quantidade.
- **Pessoas**: nome, vivo/morto, fora (em expedição), e para cada um: fome, sede, doença, ferimento, loucura, cansaço (em texto simples, ex.: "com fome", "doente").
- **Dias desde a última comida e a última água** de cada pessoa (o jogo é baseado em contagem de dias; a IA precisa desse número para não errar).
- **Evento do dia**: texto da situação e as escolhas numeradas (ex.: "1) abrir a escotilha 2) não abrir").
- **Expedição em curso**: quem está fora e quantos dias faltam.
- **Regras resumidas** (apenas as que o jogo já mostra ao jogador): ração necessária, limites de dias sem água e comida, efeito da máscara de gás, o que o kit cura.

### 8.2 Decisões que a IA toma

- Como dividir a ração (quem come, quem bebe, quanto). A IA deve respeitar que água vem antes de comida.
- Se responde ao evento do dia (e qual escolha).
- Se manda alguém em expedição, quem, e com qual item (máscara de gás tem prioridade pela pesquisa).
- Se usa item de cura (kit médico) ou de loucura (rádio) em alguém.
- Se tenta resgate ou procura a vitória (decisões que levam ao Exército ou a outro grupo).

### 8.3 Pontos a definir antes de implementar (não encontrados)

- Porção exata de sopa e de água por pessoa e por dia.
- Números exatos de dias para fome, sede, doença, morte e fuga.
- Duração e tabela de loot de expedição; efeito do mapa.
- Lista completa de estados e suas transições.
- Ordem exata do dia (ração, evento, expedição).
- Condições exatas de vitória e número de dias.

Sugestão para não bloquear o código: começar com números próprios ("água a cada 5 dias, comida a cada 5 dias após 9 dias de folga, morte 2 dias após estado crítico, máscara de gás reduz risco de doença"), e marcar cada número como "a calibrar" no `abrigo.mjs`. Depois, medir numa partida real e ajustar.

## Fontes

Abertas e lidas:
- Wikipedia (inglês), "60 Seconds!": https://en.wikipedia.org/wiki/60_Seconds!

Resumos de busca (não lidas por completo):
- 60 Seconds! Wiki, Survival (bloqueada com 402 ao tentar abrir): https://60seconds.fandom.com/wiki/Survival
- 60 Seconds! Wiki, Expeditions (402): https://60seconds.fandom.com/wiki/Expeditions
- 60 Seconds! Wiki, Sickness (402): https://60seconds.fandom.com/wiki/Sickness_(60_Seconds!)
- 60 Seconds! Wiki, Challenges (402): https://60seconds.fandom.com/wiki/Challenges
- 60 Seconds! Wiki, Hunger/Thirst (402): https://60seconds.fandom.com/wiki/Hunger/Thirst
- 60 Seconds! Wiki, Items (citado na busca, não aberto): https://60seconds.fandom.com/wiki/Items
- Steam Community, Anom's Tips and Tricks (429): https://steamcommunity.com/sharedfiles/filedetails/?id=1828739576
- Steam Community, How to Survive: Events Explained (429): https://steamcommunity.com/sharedfiles/filedetails/?id=1818603953
- Steam Community, Beginner's guide (429): https://steamcommunity.com/sharedfiles/filedetails/?id=3096147227
- Steam, discussão em espanhol (aberta; quase sem dados): https://steamcommunity.com/app/1012880/discussions/0/3119273879020813679/?l=spanish
- Speedrun.com, The Longest Survival Guide (403): https://www.speedrun.com/60_seconds_reatomized/guides/y0yko
- PSNProfiles, Trophy Guide (403): https://psnprofiles.com/guide/15352-60-seconds-reatomized-trophy-guide
- NamuWiki, 60 Seconds! Reatomized (403): https://en.namu.wiki/w/60%20Seconds!%20Reatomized
- Vintage Is The New Old, FAQ sobre comida (403): https://www.vintageisthenewold.com/faq/how-many-days-can-you-go-without-food-in-60-seconds
- Apptopia, ficha do Reatomized (citada na busca): https://apptopia.com/ios/app/1474716211/about
- Staging EIP, review PC do Reatomized (citada na busca): https://staging2.eip.gg/reviews/60-seconds-reatomized-pc-review
