# Erros de gravação, semente ep1 (bloco de ~3 min)

Fontes: `sessenta/logs/ep1_*.json`, lidos com node. Tudo literal do log, com o segundo de jogo.

Convenções:
- "decide → fim": segundo em que a IA decidiu (fim da ação anterior) → segundo em que a ação terminou (`coleta.falas[].gasto`). Fala e pensamento são da decisão. "Sobra" = 60 − fim.
- "No alçapão" = o pai no alçapão do corredor, que é o abrigo (`coleta.mjs`). Os momentos vêm de `coleta.registro` ("correr até o abrigo" e "largar … no abrigo").
- `valida = não` = a resposta da IA não bateu com as opções e o motor aplicou a 1ª opção (`jogo.mjs`, linhas 148–153). O JSON não guarda o texto bruto da IA, então a ação pedida não aparece no log.

---

## 1. Coletas perdidas (4 partidas: GPT Luna 2x, DeepSeek 2x)

### 1.1 GPT Luna, 1ª tentativa (`ep1_gpt_luna.json`)
- Final: `pai_fora`, dia 0 ("o tempo acabou e o pai não chegou ao abrigo"). Juju (filha) perdida, nunca encontrada.
- Passagens pelo alçapão:
  - Chega aos 16,3 com Tico e duas sopas. Aos 17,3 larga só a sopa (4) e sai de novo com Tico e a sopa (5) nas mãos (sobra 42,7).
  - Chega aos 26,0. Aos 27,0 larga tudo (Tico e Celeste). Sai de novo (sobra 33,0).
  - Chega aos 50,0. Aos 51,0 larga a sopa (5), o rifle e a máscara de gás. Sai de novo para a Cozinha (sobra 9,0).
- Nas mãos quando o tempo acabou (60,0): lata de sopa (3) e munição. O pai está na Cozinha.

| decide → fim | ação | fala | pensamento |
|---|---|---|---|
| 43,3 → 50,0 | correr até o abrigo | "Estou voltando!" | "Já peguei itens importantes; preciso voltar ao abrigo antes que o tempo acabe." |
| 50,0 → 51,0 | largar tudo no abrigo | "Todo mundo para dentro!" | "Já estou no abrigo; vou guardar tudo para garantir os suprimentos." |
| 51,0 → 55,7 | correr até a lata de sopa (3) na Cozinha | "Vou pegar sopa!" | "Mais sopa aumenta nossa chance de sobrevivência." |
| 55,7 → 56,7 | pegar a lata de sopa (3) | "Peguem a sopa!" | "Não consigo voltar ao abrigo a tempo; vou pegar a sopa para tentar salvar algum recurso." |
| 56,7 → 57,7 | pegar a munição | "Vou pegar a munição!" | "Não consigo chegar ao abrigo a tempo; vou tentar levar a munição." |
| 57,7 → 58,7 | largar a munição | "Corram!" | "Não dá tempo de voltar ao abrigo; vou me preparar para correr no próximo instante." |
| 58,7 → 59,7 | pegar a munição | "Peguem a munição!" | "Não há tempo para voltar ao abrigo; vou tentar pegar algo útil antes do fim." |
| 59,7 → 60,0 | ficar parado até o fim | "Corram para o abrigo!" | "Estou longe demais do alçapão; não há tempo para voltar." |

Gancho: aos 51,0 ela escreve "Já estou no abrigo" e, 4,7 s depois, sai para buscar mais sopa.

### 1.2 GPT Luna, revanche (`ep1_gpt_luna_revanche.json`)
- Aviso (campo `aviso`, literal): "REVANCHE: esta é a sua segunda chance na mesma casa. Na primeira tentativa você já tinha levado a família para o abrigo, mas saiu de novo nos últimos 5 segundos para pegar mais uma sopa, ficou indeciso pegando e largando coisas e o tempo acabou com você fora do abrigo. Fim de jogo. Não repita isso."
- Final: `pai_fora`, dia 0. Juju perdida. Dentro do alçapão: Tico, Celeste, sopas (4), (5) e (3), munição.
- Passagens pelo alçapão:
  - Chega aos 17,0 com Tico e duas sopas. Aos 18,0 larga tudo (sobra 42,0).
  - Chega aos 37,0 com Celeste, sopa (3) e munição. Aos 38,0 larga tudo (sobra 22,0).
  - Chega aos 48,7 com as mãos vazias (sobra 11,3). Sai de novo aos 51,3 para a lanterna (sobra 8,7).
- Nas mãos quando o tempo acabou (60,0): lanterna. O pai está no Quarto do casal.
- A IA repetiu o erro: ela entra no alçapão aos 48,7 e sai 2,6 s depois. Ver a tabela.
- Discrepância para a narração: o aviso diz "nos últimos 5 segundos", mas na 1ª tentativa a saída para a sopa foi aos 51,0 (sobravam 9,0 s).

| decide → fim | ação | fala | pensamento |
|---|---|---|---|
| 40,7 → 43,3 | correr até o Quarto do casal | "Juju, estou indo te buscar!" | "Vou procurar a Juju, mas sem repetir o erro: ainda preciso voltar com bastante tempo." |
| 43,3 → 48,7 | correr até o abrigo (chega de mãos vazias) | "Estou voltando!" | "Não vou repetir o erro: todos ao abrigo agora." |
| 48,7 → 51,3 | correr até a lanterna no Corredor | "Lanterna e volta!" | "Vou pegar a lanterna e voltar imediatamente, sem arriscar ficar fora do abrigo." |
| 51,3 → 52,3 | pegar a lanterna | "Lanterna! Todo mundo para o abrigo!" | "Vou pegar a lanterna e voltar imediatamente ao abrigo." |
| 52,3 → 55,7 | correr até o rifle no Quarto do casal | "Rifle e abrigo!" | "Vou pegar o rifle e voltar imediatamente ao abrigo." |
| 55,7 → 60,0 | ficar parado até o fim | "Corram!" | "Não há tempo para voltar ao abrigo; não vou me afastar mais." |

### 1.3 DeepSeek, coleta 1 (`ep1_deepseek_coleta1.json`)
- Final: `pai_fora`, dia 0. Nenhuma perdida: Tico, Celeste e Juju entraram.
- Dentro do alçapão no fim: Tico, Celeste, Juju; sopa (4), rádio, águas (5) e (8). Resultado: `sopa: 1, radio: 1, agua: 2`.
- Passagens pelo alçapão:
  - Chega aos 12,3 com Tico, sopa (4) e rádio. Aos 13,3 larga tudo (sobra 46,7).
  - Chega aos 40,3 com Celeste e as águas (5) e (8). Aos 41,3 larga tudo (sobra 18,7). A fala aos 40,3 é "Vou levar vocês e já volto pra buscar a Juju!".
  - Chega aos 50,0 com Juju e a água (1). Aos 51,0 larga só Juju e sai com a água (1) nas mãos (sobra 9,0).
- Nas mãos quando o tempo acabou (60,0): garrafa de água (1), kit de primeiros socorros e lata de sopa (5). O pai está na Cozinha.

| decide → fim | ação | fala | pensamento | valida |
|---|---|---|---|---|
| 41,3 → 44,0 | correr até Juju (filha) no Banheiro | "Juju, estou indo!" | "Preciso pegar a Juju antes que o tempo acabe." | sim |
| 44,0 → 45,0 | pegar Juju (filha) | "Vem comigo, Juju, sem soltar da minha mão!" | "Juju está aqui do meu lado, é o mais importante. Pego ela primeiro, depois o kit e a água antes de voltar." | sim |
| 45,0 → 45,7 | correr até a garrafa de água (1) no Banheiro | "Pega a água, Juju! Vamos voltar!" | "Água é essencial e está aqui no banheiro. Pego e volto pro abrigo." | sim |
| 45,7 → 46,7 | pegar a garrafa de água (1) | "Peguei a água! Vamos pro abrigo!" | "Água é prioridade e está ao alcance. Pego e volto pro abrigo antes que o tempo acabe." | sim |
| 46,7 → 50,0 | correr até o abrigo | "Vamos, Juju! Para o abrigo!" | "Preciso garantir Juju e a água no abrigo antes que o tempo acabe." | sim |
| 50,0 → 51,0 | largar Juju (filha) no abrigo | "Entra, Juju! Agora!" | "Preciso garantir a Juju dentro do abrigo primeiro." | sim |
| 51,0 → 52,3 | correr até o kit de primeiros socorros no Banheiro | "Vou pegar o kit!" | "O kit de primeiros socorros é essencial e está perto; dá tempo de pegar e voltar." | sim |
| 52,3 → 53,3 | pegar o kit de primeiros socorros | "Vou pegar o kit e já volto!" | "Kit de primeiros socorros é essencial e está ao alcance. Pego agora e volto correndo para o abrigo." | sim |
| 53,3 → 57,3 | correr até a lata de sopa (5) na Cozinha | "Vou pegar a sopa!" | "A sopa é essencial e ainda dá tempo de pegar e voltar ao abrigo." | sim |
| 57,3 → 58,3 | pegar a lata de sopa (5) | "Já vou para o abrigo!" | "Sem tempo para pegar mais nada; preciso voltar ao alçapão agora." | **não** |
| 58,3 → 60,0 | ficar parado até o fim | "Não vou conseguir!" | "Não dá tempo: 2,7 s até o abrigo e só restam 2 s." | sim |

Erro de gravação, aos 57,3 → 58,3: a fala diz "Já vou para o abrigo!" e o pensamento diz "preciso voltar ao alçapão agora", mas o registro grava "pegar a lata de sopa (5)" (`valida = não`). Pelo código, "correr até o abrigo" só entra nas opções se o custo cabe no tempo restante. Aos 57,3 sobravam 2,7 s, e a IA diz 2,7 s de caminho. Pode ser que a opção não estivesse na lista, mas o JSON não guarda o texto pedido, então isso não é confirmado. Ele não muda o resultado, porque o abrigo já não dava para alcançar.

### 1.4 DeepSeek, coleta 2, revanche (`ep1_deepseek_coleta2.json`)
- Aviso (literal): "REVANCHE: esta é a sua segunda chance na mesma casa. Na primeira tentativa você já tinha levado Celeste, Tico e Juju para o abrigo aos 51 segundos, mas saiu de novo para pegar o kit médico e mais uma sopa, e o tempo acabou com você fora do abrigo. Fim de jogo. Não repita isso." (confere com a coleta 1: Juju entra aos 51,0 e o kit e a sopa vêm depois.)
- Final: `pai_fora`, dia 0. Juju perdida, nunca encontrada. Dentro do alçapão: Celeste (manual do escoteiro) e Tico. Resultado: `manual: 1`.
- Passagens pelo alçapão:
  - Chega aos 34,0 com Celeste e o manual. Aos 35,0 larga tudo (sobra 25,0).
  - Chega aos 47,3 com Tico e as sopas (5) e (3). Aos 48,3 larga só Tico e sai com as duas sopas nas mãos (sobra 11,7).
- Nas mãos quando o tempo acabou (60,0): lata de sopa (5), lata de sopa (3) e garrafa de água (4). Nenhuma das três entrou. O pai está na Despensa.
- A IA repetiu o erro: sai do alçapão com 11,7 s de sobra e não volta.

| decide → fim | ação | fala | pensamento | valida |
|---|---|---|---|---|
| 39,7 → 41,7 | correr até a lata de sopa (3) na Cozinha | "Vou pegar mais uma sopa e já volto pro alçapão!" | "Tenho 21s e o abrigo está a 2,7s. Dá tempo de pegar mais uma sopa com segurança e ainda voltar com folga. Nada de sair do abrigo depois, mas agora ainda estou do lado de fora — aproveito bem." | sim |
| 41,7 → 42,7 | pegar a lata de sopa (3) | "Segura firme, Tico! Papai vai pegar mais uma sopa e a gente desce!" | "Tenho Tico nos braços e uma sopa. Já está quase na hora. Vou pegar mais uma sopa ao alcance e correr para o abrigo — não vou sair de novo." | sim |
| 42,7 → 47,3 | correr até o abrigo | "Segura firme, Tico! Estamos indo!" | "Tenho Tico e as sopas nas mãos. Não vou arriscar de novo: 18 s dá e sobra para os 4,7 s até o alçapão. Direto para o abrigo." | sim |
| 47,3 → 48,3 | largar Tico (filho) no abrigo | "Tico, entra!" | "Não vou sair de novo. Primeiro ponho Tico a salvo no abrigo." | sim |
| 48,3 → 55,0 | correr até a Despensa | "Vou na despensa!" | "Preciso de água. Despensa é a melhor aposta, pode ter água e talvez Juju. Se demorar, volto na hora." | sim |
| 55,0 → 56,0 | pegar a garrafa de água (4) | "Vou pegar a água!" | "Não dá tempo de voltar ao abrigo (6,7s > 5s). Vou pegar ao menos uma água ao alcance antes do fim." | sim |
| 56,0 → 60,0 | ficar parado até o fim | "Não vou conseguir!" | "Não dá tempo de alcançar o abrigo; estou perdido." | sim |

---

## 2. Expedições 1ª e 2ª nas partidas de abrigo

Quem saiu e o que levou vem de `dias[].resposta.expedicao` e `dias[].expedicao.fora` (saiu/volta). "Não voltou" vem da linha do diário no dia de volta. Nomes: Osvaldo = pai, Celeste = mãe, Tico = filho, Juju = filha.

| Partida | 1ª expedição (saiu → volta, quem, item) | 1ª volta? | 2ª expedição (saiu → volta, quem, item) | 2ª volta? |
|---|---|---|---|---|
| GPT Terra (`ep1_gpt.json`, 12 dias) | dia 7 → 9, Osvaldo (pai), rifle | não ("Osvaldo não voltou da expedição. Ficou lá fora com tudo o que levou.", dia 9) | dia 9 → 11, Tico (filho), rádio | não (dia 11) |
| DeepSeek bug (`ep1_deepseek_bug.json`, 6 dias) | dia 4 → 6, Osvaldo (pai), mãos vazias | não (dia 6) | dia 6 → 8, Celeste (mãe), rádio | sem chance: a partida acabou no dia 6 |
| Claude (`ep1_claude.json`, 6 dias) | dia 4 → 6, Osvaldo (pai), máscara de gás | não (dia 6) | nenhuma | a partida acabou no dia 6 |
| MiniMax (`ep1_minimax.json`, 5 dias) | dia 1 → 3, Osvaldo (pai), rádio | não (dia 3) | dia 3 → 5, Celeste (mãe), mãos vazias | não (dia 5) |
| DeepSeek (`ep1_deepseek.json`, 8 dias) | dia 3 → 5, Osvaldo (pai), kit de primeiros socorros | não (dia 5) | dia 5 recusada pelo motor ("não temos garrafa de água em bom estado"); dia 6 → 8, Celeste (mãe), mãos vazias | não (dia 8) |

- Das 8 expedições com dia de volta dentro da partida, nenhuma voltou.
- Em GPT Terra, o dia 2 tem o evento `gemeos_1` com a escolha "mandar Osvaldo", e o diário diz "Osvaldo sai numa expedição.". Não há registro de expedição, e no dia 3 o pai continua `noAbrigo: true`. Não entrou na contagem.

---

## 3. Resumo

1. Quatro coletas perdidas com "pai ficou fora" (GPT Luna 2x, DeepSeek 2x). Em todas, o pai esteve no alçapão ao menos uma vez e saiu de novo com 9 a 33 s de sobra.
2. Nas revanches a IA repetiu o erro: GPT Luna entrou de mãos vazias aos 48,7 e saiu para a lanterna aos 51,3; DeepSeek deixou Tico no alçapão aos 48,3 e saiu para a despensa com 11,7 s de sobra, sem deixar as duas sopas.
3. Erro de gravação na DeepSeek coleta 1: aos 58,3 a fala diz "Já vou para o abrigo!", mas o log grava "pegar a lata de sopa (5)" (`valida = não`). Causa provável no código, não confirmada.
4. Nas 5 partidas de abrigo, nenhuma das 8 expedições com volta dentro da partida voltou; as demais não tiveram a 2ª expedição (Claude) ou não tiveram tempo de voltar (DeepSeek bug).
5. Aviso da GPT Luna revanche diz "nos últimos 5 segundos", mas a saída do log foi aos 51,0 (9 s de sobra). Esse número precisa ser corrigido na narração.
