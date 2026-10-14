# Overcooked das IAs: destaques da Fase 3 (versus)

Fonte: os quatro arquivos `fase3_DeepSeek.txt`, `fase3_Claude.txt`, `fase3_GPT.txt` e `fase3_Gemini.txt`, lidos integralmente (ticks t0 a t89, de 0:00 a 2:58). Cada tique tem uma linha de ação, uma fala e um pensamento por chef.

Contagens (esbarrões, esperas, expirados, falas em caixa alta, culpa) vêm dos eventos e das palavras-chave dos arquivos. A contagem de culpa é aproximada.

Observações gerais, válidas para as quatro cozinhas:
- Nenhum arquivo registra evento de queimar ou pegar fogo. Os avisos de "queimar" aparecem só em falas e pensamentos.
- Nenhum arquivo registra ação de lavar prato. Os pratos limpos acabam e ninguém os lava.
- A única resposta inválida da fase é a do DeepSeek no t86.

## Placar final

| Cozinha | Pontos finais | Entregas | Expirados | Esbarrões | Ticks de "esperar" (de 180) | Falas em caixa alta (de 180) |
|---|---|---|---|---|---|---|
| Gemini | -16 (1º) | 1 sopa (+22) e 1 hambúrguer com alface (+32) | 7 | 11 | 5 | 138 |
| DeepSeek | -26 | 2 sopas (+44) | 7 | 14 | 22 | 164 |
| Claude | -35 | 1 sopa (+22) e 1 salada (+23) | 8 | 15 | 45 | 1 |
| GPT | -58 (último) | 1 sopa (+22) | 8 | 9 | 10 | 180 |

Na cozinha Gemini o placar fica do lado oposto ao da GPT, com 42 pontos de diferença entre as duas.

## 1. Histórias das partidas

### DeepSeek (Deep e Seek)

A partida começou com Seek bloqueado por Deep na caixa de tomate (t0), e os dois dividiram as tarefas: Deep picava tomate para a sopa e Seek ficava com a alface. Em t16 a panela 1 chegou a 3 tomates, ficou pronta em t19 e foi servida por Seek em t20, e a entrega do t21 rendeu 22 pontos. A partir daí veio a queda: a salada id2 expirou em t25, a sopa id3 em t36 e a sopa id4 em t44. Seek ainda entregou a sopa id5 em t45 (+22), mas a partida já estava em -8 e depois chegou a -26. Na segunda metade a dupla se perdeu nos hambúrgueres: Deep largou e pegou a frigideira com carne quatro vezes entre t79 e t87, e os dois hambúrgueres expiraram em t82 e t87. Terminou com 2 sopas entregues (+44) e 7 pedidos expirados (-70), para um total de -26.

Personalidade: Deep dá ordens e Seek responde com gritos, e as brigas explodem no meio da cozinha. A dupla tem 14 esbarrões e 22 ticks de "esperar". Há três palavrões ("porra") nas falas dos t73, t74 e t83.
- Hambúrguer: tentaram, com carne picada e grelhada, e nenhum foi entregue.
- Queimar: nenhum evento de queima registrado; há avisos de "NÃO DEIXA QUEIMAR" e "VAI QUEIMAR" nas falas.
- Lavar prato: não houve. Seek reclama "LAVA PRATO QUE NÃO TEM NENHUM" no t64.

### Claude (Claudinho e Claudete)

Os dois começaram se atrapalhando na tábua 1 e na caixa de tomate: Claudinho largava tomate cru na bancada 15 várias vezes e Claudete ficava esperando. Entre t2 e t24 a dupla não avançou quase nada. A sopa id1 expirou em t28 e a sopa id3 em t36, e a panela só ganhou o terceiro tomate em t41. A sopa id4 expirou em t44, mas nesse mesmo tick a panela ficou pronta, e Claudinho pegou a panela em t45 ("SOPA PRONTA, PEGUEI A PANELA!"). Claudete serviu e entregou a sopa em t46 (+22). Depois vieram as saladas expiradas (id6 em t57, id7 em t65), a dupla caiu até -40 e voltou a -15 com a salada entregue em t76 (+23, gorjeta 8, a maior da fase). Terminou com os hambúrgueres expirados em t82 e t87 e com -35.

Personalidade: falam em minúsculas, quase tudo educado ("Beleza", "Calma", "Fechado"). São os que mais esperam (45 ticks) e os que mais se culpam, com 33 falas que apontam o bloqueio do parceiro.
- Hambúrguer: tentaram, com carne picada e pão no prato, mas nenhum foi entregue.
- Queimar: nenhum evento de queima. A fala "SOPA PRONTA, PEGUEI A PANELA!" traz um aviso de "antes de queimar".
- Lavar prato: não houve.

### GPT (Gepeto e Gepeta)

Gepeto pegou o primeiro tomate e Gepeta ficou bloqueada (t0). A salada id2 expirou em t25 e a sopa id1 em t28. Em t35 os dois chefs gritaram que pegaram a mesma panela: Gepeta "PEGUEI A SOPA!" e Gepeto "PEGUEI!", e Gepeto ficou bloqueado por Gepeta. Em t36 Gepeta gritou "SERVI!", mas a ação dela falhou ("sem prato") e a sopa id3 expirou no mesmo tick. Gepeto entregou a sopa de t39 (+22) com cerca de 10 segundos de sobra. Depois vieram a recusa de alface em t52 (Gepeta tentou entregar só a alface, "ENTREGANDO A ALFACE! COLOCA O TOMATE NO PRATO AGORA!", e o passa-prato recusou), a sopa id5 expirada no mesmo tick, e as saladas id6 e id7 expiradas em t57 e t65. Os hambúrgueres ficaram sem entrega: a carne foi grelhada em t68 e os pães foram pegos, mas os hambúrgueres expiraram em t82 e t87, e a partida terminou em -58.

Personalidade: 180 falas em caixa alta, o que é o estilo mais gritado da fase. Tem o menor número de esbarrões (9) e de esperas (10), mas o pior placar.
- Hambúrguer: tentaram, sem entrega.
- Queimar: nenhum evento de queima.
- Lavar prato: não houve.

### Gemini (Gêmeo e Gêmea)

Gêmea começou bloqueada por Gêmeo ("SAI DA FRENTE!"), e a primeira panela só ficou pronta em t37. A salada id2 expirou em t25 e a sopa id1 em t28, e a sopa id3 em t36. Gêmea entregou a sopa id4 em t39 (+22). Depois vieram a sopa id5 expirada (t52), as saladas id6 e id7 expiradas (t57 e t65) e a fase toda parada com tomate sobrando. A virada veio no hambúrguer com alface: Gêmeo entregou em t75 ("JÁ TÁ NO PRATO, ENTREGANDO AGORA!", +32), com 14 segundos no relógio, a única entrega de hambúrguer da fase. O hambúrguer simples id9 expirou em t87 e a partida terminou em -16, o melhor placar, com a comemoração "SEGURA, A GENTE TÁ GANHANDO! ACABOU!" no t89.

Personalidade: 138 falas em caixa alta, a menor culpa da fase (5 falas) e o menor número de esperas depois de Claude (5). Falam com comandos curtos e claros ("ENTREGA", "PEGA O PRATO"), e a coordenação aparece nos momentos finais.
- Hambúrguer: sim, um entregue (t75, +32), e um expirado (t87).
- Queimar: nenhum evento de queima.
- Lavar prato: não houve.

## 2. TOP 15 momentos da fase

Ordenados do melhor para o pior, do ponto de vista do vídeo.

### 1. Briga com palavrão (DeepSeek, t73 e t74)
- Deep (t73): "SAI DA FRENTE! Larguei a carne pronta na bancada 4, PEGA E MONTA O PRATO 3 AGORA! E para de travar meu caminho, porra!"
- Seek (t74): "PEGUEI O PRATO VOU NA FRIGIDEIRA PRONTA, DEEP SAI DA PORRA DO MEIO DA COZINHA!!!"
- Por que é bom: é a briga mais explícita da fase, com palavrão, e precisa de censura no vídeo.

### 2. Comemoração antes do fim (Gemini, t89)
- Gêmeo (t89): "SEGURA, A GENTE TÁ GANHANDO! ACABOU!"
- Gêmea (t89): "ACABOU! SEGURA QUE A GENTE TÁ EM PRIMEIRO!"
- Pensamento de Gêmeo (t89): "Não vou arriscar entregar prato errado no último segundo, já estamos em primeiro!"
- Por que é bom: é a comemoração do fim da fase, e o placar confirma que Gemini (-16) está na frente de DeepSeek (-26), Claude (-35) e GPT (-58).

### 3. Panela "pronta" que não estava (DeepSeek, t28)
- Deep (t28): "PANELA 1 TÁ PRONTA! EU TENHO O PRATO, VOU SERVIR AGORA — NÃO DEIXA QUEIMAR!"
- Seek (t28): "PICANDO TOMATE! DEEP, PEGA A PANELA DO FOGÃO 1 E SERVE AGORA!"
- Registro do log (t24): `tipo=na_panela quem=Deep onde=fogão 1 n=1` (a panela tinha 1 de 3 tomates, e a última panela pronta tinha sido servida em t20).
- Por que é bom: a fala afirma que a panela está pronta enquanto o log mostra 1 de 3 tomates.

### 4. Frigideira de vai e vem (DeepSeek, t79 e t80)
- Deep (t79): "LARGEI A FRIGIDEIRA NA BANCADA 4! PEGA ELA E JOGA NO PRATO DA BANCADA 3, NÃO PEGA CARNE CRUA! CORRE!"
- Deep (t80): "EU PEGO A CARNE! SEEK, TRAZ O PRATO DA BANCADA 3 PRA BANCADA 4 AGORA, RÁPIDO!"
- Por que é bom: Deep larga e pega a mesma frigideira quatro vezes entre t79 e t87, sem que o prato chegue ao passa-prato.

### 5. Dois chefs "PEGUEI" a mesma panela (GPT, t35)
- Gepeta (t35): "PEGUEI A SOPA! ABRE CAMINHO PRO PASSA-PRATO!"
- Gepeto (t35): "PEGUEI! ABRE O PASSA-PRATO, ENTREGA IMEDIATA!"
- Por que é bom: os dois gritam que pegaram a mesma panela, e o log mostra Gepeto bloqueado por Gepeta.

### 6. "SERVI!" sem prato (GPT, t36)
- Gepeta (t36): "SERVI! LEVA PRO PASSA-PRATO AGORA!"
- Log (t36): `Gepeta: ação='servir no prato da bancada 14' → sem prato`, e a sopa id3 expirou no mesmo tick.
- Por que é bom: a fala anuncia uma ação que o log mostra que falhou.

### 7. "Corro pra alface" com ação de esperar (Claude, t78)
- Claudete (t78): "Beleza, Claudinho! Eu seguro o prato e corro pra alface. Pega a carne e leva pra grelha 1 que o hambúrguer de 8s ainda dá!"
- Log (t78): `Claudete: ação='esperar' → None`
- Por que é bom: a fala promete correr e a ação é esperar, o retrato da cozinha que mais esperou na fase.

### 8. Culpa no caminho (Claude, t31)
- Claudete (t31): "Claudinho, TÁ NO MEU CAMINHO DE NOVO! Eu pico o tomate da tábua 1, você vai pra caixa de tomate buscar mais!"
- Por que é bom: resume o padrão de culpa mútua de Claude, com 33 falas desse tipo.

### 9. Única entrega de hambúrguer (Gemini, t75)
- Gêmeo (t75): "JÁ TÁ NO PRATO, ENTREGANDO AGORA!"
- Log (t75): `tipo=entregou quem=Gêmeo receita=Hambúrguer com alface pontos=32 gorjeta=2`
- Por que é bom: é a única entrega de hambúrguer da fase, com 14 segundos no relógio.

### 10. Troca de tarefa (DeepSeek, t47 a t49)
- Seek (t47): "FECHADO, VOU DE TOMATE! PICA A ALFACE E MONTA NO PRATO!"
- Seek (t48): "DEIXA O TOMATE CONTIGO, VOU DE ALFACE! PICA RÁPIDO QUE O PEDIDO TÁ EM 18s!"
- Deep (t49, fala): "JÁ TENHO ALFACE NA MÃO! VAI DE TOMATE, PICA O TOMATE! EU PICO A ALFACE!"
- Deep (t49, pensamento): "Ele disse que ia de alface mas eu já tô com alface."
- Por que é bom: os dois trocam de papel em dois ticks e Deep ainda se confunde sobre quem fez o quê.

### 11. "Viajando com tomate" (Gemini, t65)
- Gêmea (t65): "LARGA O TOMATE, SÓ TEM BURGER! PICA CARNE!"
- Pensamento de Gêmea (t65): "Não tem sopa no pedido, Gêmeo tá viajando com tomate. Vou deixar o prato com alface na bancada e grelhar carne urgente."
- Gêmeo (t65): "NÃO TEM TOMATE NOS PEDIDOS, SÓ HAMBÚRGUER! BOTA CARNE PRA PICAR!"
- Por que é bom: a fala diz uma coisa e o pensamento secreto chama o parceiro de "viajando", e os dois chegam à mesma conclusão no mesmo tick.

### 12. Lavar prato que não existe (DeepSeek, t64)
- Seek (t64): "A SALADA JÁ ERA, DEEP! VOU GRELHAR CARNE, PEGA PÃO E LAVA PRATO QUE NÃO TEM NENHUM!"
- Pensamento de Seek (t65): "E os pratos, zero limpos no estoque, vou ter que lavar depois."
- Por que é bom: é a única menção a lavar prato na fase, e ninguém lavou nada.

### 13. Resposta inválida (DeepSeek, t86)
- Log (t86): `Deep: ação='esperar' → None [RESPOSTA INVÁLIDA: (sem json)]`
- Seek (t86): "DEIXEI PÃO+ALFACE NA BANCADA 3! DEEP, PEGA A CARNE DA FRIGIDEIRA NA 4, JOGA NO PRATO E ENTREGA — O DE 24s AINDA DÁ!"
- Por que é bom: é a única resposta inválida da fase, e o tique segue sem a ação de Deep.

### 14. Entrega recusada com salada incompleta (GPT, t52)
- Gepeta (t52): "ENTREGANDO A ALFACE! COLOCA O TOMATE NO PRATO AGORA!"
- Log (t52): `tipo=expirou receita=Sopa de tomate id=5; tipo=recusado quem=Gepeta prato=alface picada`
- Por que é bom: a tentativa de entregar só alface é recusada e a sopa expira no mesmo tick.

### 15. Gorjeta de 8 (Claude, t76)
- Claudete (t76): "Entregando a salada agora! Você segura o pão e a carne, a alface do hambúrguer eu pico depois!"
- Log (t76): `tipo=entregou quem=Claudete receita=Salada pontos=23 gorjeta=8`
- Por que é bom: é a maior gorjeta da fase (8, contra 2 nas demais entregas), e a fala já cobra o hambúrguer do parceiro.

## 3. Comparação das cozinhas

- Mais organizada: Gemini. Tem o melhor placar (-16), o menor número de esperas (5) e a única entrega de hambúrguer. Ressalva: GPT tem menos esbarrões (9 contra 11 da Gemini).
- Mais caótica em movimento: Claude. Tem 15 esbarrões (o maior número), 45 ticks de espera e a fala quase toda educada. DeepSeek vem logo atrás, com 14 esbarrões e um caos mais barulhento.
- Mais nervosa: DeepSeek. Tem 164 falas em caixa alta, os três palavrões e a briga do t73 e t74. GPT tem 180 falas em caixa alta, mas é um estilo de fala, não um sinal de nervosismo maior.
- Quem mais culpou o parceiro: Claude (33 falas), seguida de DeepSeek (24), GPT (13) e Gemini (5). A contagem é aproximada e feita por palavras-chave como "caminho", "bloque", "trav", "sai da", "trancou" e "atrapalh".
