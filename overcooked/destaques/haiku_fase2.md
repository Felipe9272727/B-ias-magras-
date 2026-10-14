# Overcooked das IAs: destaques da fase 2 (versus)

Base: os quatro arquivos `fase2_DeepSeek.txt`, `fase2_Claude.txt`, `fase2_GPT.txt` e `fase2_Gemini.txt`, lidos por inteiro. Cada cozinha tem 85 tiques (t0 a t84, de 0:00 a 2:48), 170 ações, e 11 pedidos. Ao fim de t84 restaram 3 pedidos abertos em cada cozinha. O arquivo não diz a duração total da fase.

Legenda: "ação" é o que o chef fez; "fala" é o grito; "pensa" é o pensamento secreto; "evento" é o que o jogo registrou no tique.

---

## 1. História de cada cozinha

### DeepSeek (Deep = ingredientes, Seek = fogão, pratos e entrega)

Começaram com sopa de cebola (58s) e salada (52s). O Deep cortava cebola e o Seek segurava pratos, e no t4 os dois já tinham entendido a divisão: o Seek disse "Não alcanço as caixas! Pega você cebola e alface." e o Deep pensou "Panela fora do meu alcance, então foco em picar e deixar pronto pra ele levar." Passaram a usar as bancadas 7, 9, 11 e 13 como balcão. Os pedidos começaram a expirar em t26 e a pontuação chegou a -70 em t71. Montaram a sopa de cebola no fogão 1 (3 cebolas, de t34 a t60), que ficou pronta em t63 e expirou no mesmo tique em que foi servida (t65). A única entrega foi uma salada no t74 (+17), e o arquivo termina em t84 com -53. A sopa de tomate nunca saiu.

**Personalidade:** a dupla mais barulhenta. Tem 356 pontos de exclamação e 157 das 169 falas em caixa alta. A culpa circula por causa do alcance ("Ele achou que eu alcanço o fogão 1, mas não.") e há um vai-e-vem de cebolas nos t51 a t54.

### Claude (Claudinho = ingredientes, Claudete = pratos e fogão)

Começaram com o Claudinho pegando cebola e a Claudete pegando prato (t0), e logo passaram o picado pela divisória. A primeira expiração veio em t26 (salada). Entregaram duas saladas (t28 e t68, +17 cada), e a pontuação ficou entre -33 e +7. Em t34 a Claudete declarou que a sopa de cebola tinha expirado, mas ela só expirou em t56. A sopa de tomate expirou em t47, depois de uma troca de planos entre os dois. Terminou em -26, com 6 expirações e 2 entregas.

**Personalidade:** a dupla mais educada. Só 4 das 170 falas estão em caixa alta, com palavras como "Beleza" e "bora". Porém é a que mais espera: a Claudete ficou em "esperar" 11 vezes, o maior número das quatro cozinhas.

### GPT (Gepeto = ingredientes, Gepeta = pratos e entrega)

Começaram bem na preparação. O Gepeto cortou cebola e a Gepeta pegou pratos e deixou um na divisória já no t1. A única cebola que entrou no fogão 1 foi no t7, e esse fogão nunca passou de 1 cebola. O fogão 2 recebeu um tomate no t26. Nenhuma sopa ficou pronta: não há nenhum evento "pronto" nessa cozinha. As duas tentativas de entrega foram recusadas (t20 e t32). Foram 8 expirações e 0 entregas, com -80 no fim, a pior pontuação da fase.

**Personalidade:** a dupla mais gritada no formato. Todas as 170 falas estão em caixa alta, com comandos curtos ("FECHA A SOPA AGORA!"). Os pensamentos são genéricos ("Priorizar a sopa", "Salvar o pedido urgente"). Não há nenhuma acusação direta ao parceiro, mas é a cozinha com mais ações falhadas (24).

### Gemini (Gêmeo = ingredientes, Gêmea = fogão, pratos e entrega)

Começaram com o Gêmeo picando cebola e a Gêmea cuidando de prato e fogão. No t4 o Gêmeo escreveu o plano do balcão: "O fogão tá do lado dela, vou ter que passar a cebola picada ou jogar pra lá." No t6 chamou a bancada de "bancada de transição". A primeira cebola entrou no fogão 1 em t14, e o fogão chegou a 2 cebolas em t55, mas a sopa expirou em t56. A primeira entrega saiu em t32 com 6 segundos sobrando (+17, pontos -3). A segunda saiu em t65 (+17), no mesmo tique em que expirou uma sopa. Terminou em -26, com 6 expirações e 2 entregas.

**Personalidade:** a mais organizada em números (nenhuma resposta inválida, 7 falhas de ação, 3 esperas). Também é a que mais acusa diretamente o parceiro: "Ele esqueceu que a tábua 1 tá do lado dele." e "Ele se confundiu de lado!".

### Quem entendeu o balcão

Todas as quatro duplas entenderam que precisavam passar coisas pela divisória, e isso aparece nos pensamentos desde os primeiros tiques.

- DeepSeek: a regra já estava clara no t4, mas a execução foi confusa e a cebola ficou indo e vindo entre as bancadas (ver item 8 do top 15).
- Claude: a Claudete no t16 disse "Claudinho, não consigo pegar o tomate daqui, a caixa tá do seu lado!", e o Claudinho no t13 pensou que a bancada 9 era "o jeito mais rápido de ele pegar a cebola".
- GPT: a Gepeta no t1 gritou "PRATO NA DIVISÓRIA! PEGA PRA SOPA; EU MONTO A SALADA.", ou seja, usaram o balcão desde o início. O problema foi que quase sempre o item certo ficou no lugar errado.
- Gemini: entenderam explicitamente (citações no bloco do Gemini acima).

---

## 2. Top 15 da fase (do melhor para o pior)

**1. DeepSeek, t65 e t66 (Seek). Sopa servida e expirada no mesmo tique.**
- t65, ação "servir sopa de cebola do fogão 1 no prato", fala: "ESTOU SERVINDO A SOPA! SEGURA A SALADA 7!". No mesmo tique o evento diz: "tipo=expirou receita=Sopa de cebola id=6; tipo=serviu quem=Seek onde=fogão 1".
- t66, ação "jogar prato com sopa de cebola no lixo", fala: "ENTREGA A SALADA AGORA, PARCEIRO! JOGUEI A SOPA, NINGUÉM PEDIU!"
- Por que serve: o pedido expira no exato tique em que o prato é servido, e o prato vai para o lixo.

**2. GPT, t31 e t32 (Gepeto e Gepeta). A fala promete sopa, o prato é de tomate cru.**
- t31 (Gepeto), ação "pôr tomate picado no prato da bancada 9", evento "montou no prato", fala: "FECHANDO A SOPA DE TOMATE! ENTREGA AGORA!"
- t32 (Gepeta), ação "ENTREGAR prato com tomate picado no passa-prato", resultado "prato recusado", fala: "ENTREGANDO A SOPA DE TOMATE!"
- Por que serve: a fala anuncia uma sopa, mas o prato só tem tomate picado e o passa-prato recusa.

**3. DeepSeek, t62 (Seek e Deep). Os dois mandam o outro servir, e a ação do Seek é inválida.**
- Seek, ação "esperar", resultado "RESPOSTA INVÁLIDA: largar prato limpo vazio na bancada 13". Fala: "DEEP, PEGA ESSE PRATO NA 13 E SERVE A SOPA DE CEbola NO FOGÃO 1 AGORA, VAI QUEIMAR!!!"
- Deep, ação "picar alface na tábua 1", fala: "SERVE ESSA CEbola AGORA SEEK, CORRE! EU FECHO AS SALADAS!"
- Por que serve: os dois tentam empurrar a mesma tarefa para o outro, enquanto um deles nem executa o comando.

**4. Claude, t34 (Claudete). Chef dá como morto um pedido que ainda estava vivo.**
- Ação "largar prato com cebola picada na bancada 9 (divisória, o parceiro alcança)". Fala: "CEBOLA NÃO VALE MAIS, O PEDIDO EXPIROU! Deixei o prato na bancada 9. FOCA NO TOMATE, CLAUDINHO!" Pensa: "Sopa de cebola já expirou. Essa cebola não serve para nada agora."
- Os pedidos do t34 mostram "Sopa de cebola(44s)". Essa sopa só expirou no t56 ("tipo=expirou receita=Sopa de cebola id=5").
- Por que serve: a chef abandona um pedido que ainda valia 44 segundos.

**5. DeepSeek, t34 (Deep e Seek). Um diz que a cebola expirou, o outro põe cebola na panela.**
- Deep, ação "picar tomate na tábua 1", fala: "CEBOLA EXPIROU! LARGA A CEBOLLA E VAI DE TOMATE! EU PICO AQUI E TE MANDO PICADO!"
- Seek, ação "pôr cebola picada na panela do fogão 1 (0/3)", resultado "pôs na panela (1)", fala: "CEBOLA NO FOGÃO 1! DEPOIS ME AJUDA COM MAIS CEBOla!" Pensa: "Salada já era. Começo a sopa de cebola com o que tenho na mão."
- Por que serve: no mesmo tique, um chef declara a cebola morta e o outro a coloca na panela do mesmo pedido, que ainda estava vivo.

**6. DeepSeek, t63 (Seek e Deep). A fala nega que a sopa esteja pronta, e o evento diz "pronto".**
- Seek, ação "largar prato limpo vazio na bancada 11 (divisória, o parceiro alcança)", fala: "PANELA AINDA COZINHANDO, NÃO DÁ PRA SERVIR! DEIXEI PRATO NA DIVISÓRIA, MONTA AS SALADAS QUE EU VOLTO NA CEbola!" No mesmo tique: "tipo=pronto onde=fogão 1 o=panela PRONTA (sopa de cebola)".
- Deep, ação "pegar alface picada da tábua 1", fala: "BANCADA 13 TÁ VAZIA, DEEP! VOCÊ MESMO SERVE A SOPA — TÁ COM O PRATO NA MÃO, CORRE NO FOGÃO 1!" Ele se dirige pelo próprio nome, e não tem prato na mão.
- Por que serve: o Seek nega o que o jogo acabou de registrar, e o Deep manda a si mesmo servir a sopa.

**7. Gemini, t50 (Gêmeo). A fala pede foco na sopa, o pensamento já a dá como perdida.**
- Ação "pegar alface na caixa de alface". Fala: "TÔ PEGANDO ALFACE PRA PICAR! FOCA NA SOPA!" Pensa: "Sopa de 12s já era se não cozinhar agora, vou adiantar a salada na tábua 2 enquanto ele corre com a cebola."
- Por que serve: é o caso clássico de fala e pensamento secreto que se contradizem.

**8. DeepSeek, t51 a t54 (Deep e Seek). A terceira cebola vai e volta entre as bancadas 13 e 11.**
- t51 (Deep, largar na 13), fala: "SOLTEI CEBOLA NA 13 PRA PRÓXIMA! CORRE NA PANELA 1 QUE A SOPA DE 10s TÁ QUASE!"
- t52 (Deep, pegar da 13), fala: "TÔ COM A 3ª CEbola! SEEK, FALA O QUE FAÇO — NÃO ALCANÇO O FOGÃO!" O Seek, na ação "esperar", fala: "NÃO TÁ PRONTA! BOTA A CEBOLA DA 13 NA PANELA 1 AGORA! EU SEGURO O PRATO!"
- t53 (Deep, largar na 11), fala: "NÃO ALCANÇO A PANELA! CEbola NA 11 AGORA, VOCÊ JOGA NA PANELA 1!"
- t54 (Deep, pegar da 11), fala: "PEGUEI A CEbola! Vou largar na 13, põe no fogão 1 que a sopa de 22s sai!"
- Por que serve: a cebola é largada e pega de novo quatro vezes sem chegar à panela, e o chef que está ao lado da panela fica em "esperar".

**9. DeepSeek, t61 (Seek e Deep). Os dois dizem que pegaram o mesmo prato.**
- Seek, ação "pegar prato limpo vazio da bancada 13", resultado "pegou prato limpo vazio", fala: "PEGUEI PRATO! SOPA DE CEBOLA TÁ PRONTA? 8 SEGUNDOS!"
- Deep, ação "pegar prato limpo vazio da bancada 13", resultado "bancada 13 já estava vazia.", fala: "PEGUEI PRATO LIMPO! LEVO PRA VOCÊ SERVIR A SOPA AGORA, NÃO DEIXA QUEIMAR!"
- Por que serve: os dois anunciam a mesma ação, e só um consegue.

**10. GPT, t53 a t55 (Gepeto e Gepeta). Cebola na bancada 15, "FECHA A SOPA" e resposta inválida.**
- t53 (Gepeto, largar na 15), fala: "DEIXEI A CEBOLA NA 15! FECHA A SOPA AGORA!"
- t54 (Gepeta, pôr cebola da 15 no prato), resultado "bancada 15 já estava vazia.", fala: "PEGA ESSA CEBOLA E FECHA A SOPA AGORA!"
- t55 (Gepeto, esperar), resultado "RESPOSTA INVÁLIDA: largar cebola picada na bancada 15", fala: "PEGA E JOGA NA PANELA AGORA!"
- Por que serve: "FECHA A SOPA" é dito com a panela 1 em uma única cebola, e a resposta do t55 é inválida.

**11. Claude, t46 e t47 (Claudinho e Claudete). O plano muda entre um tique e outro.**
- t46 (Claudinho, pegar tomate picado da bancada 15), fala: "Peguei o tomate picado! Vou levar pro fogão 1, você segura a cebola!"
- t47 (Claudete, pegar prato com tomate picado da bancada 11), fala: "Espera, Claudinho! Tomate não vai pro fogão, é pra SALADA. Leva o tomate pro prato que eu tô pegando agora!"
- No t47 expira a sopa de tomate (id=4), que era o alvo da corrida.
- Por que serve: os dois planejam coisas diferentes para o mesmo tomate, e o pedido morre enquanto discutem.

**12. Gemini, t19 e t22 (Gêmea). Culpa no parceiro, com a bancada exata.**
- t19 (Gêmea, pensa): "Ele esqueceu que a tábua 1 tá do lado dele. Pego o prato pra montar a salada rápido antes que expire em 14s."
- t22 (Gêmea, fala): "A TÁBUA 2 TÁ DO SEU LADO! MONTA O PRATO AÍ E ME PASSA!" Pensa: "Ele se confundiu de lado! Deixei o prato na divisória pra ele montar logo antes que expire."
- Por que serve: a parceira é acusada de confusão, e a tábua citada é a dela, não a da Gêmea.

**13. Gemini, t32 (Gêmea). Entrega com 6 segundos no relógio.**
- Ação "ENTREGAR prato com alface picada + tomate picado no passa-prato", evento "tipo=entregou quem=Gêmea receita=Salada pontos=17 gorjeta=2". Fala: "ENTREGANDO A SALADA NO PASSA-PRATO, VAI SALVAR!" Pensa: "Faltam 6 segundos, o passa-prato tá a 0.9s! Não vou jogar na bancada, vou entregar direto pra pontuar!"
- Por que serve: é a primeira entrega da fase no último instante, e fala, pensamento e ação batem.

**14. Gemini, t14 (Gêmeo). Promete a cebola e pica alface.**
- Ação "picar alface na tábua 1". Fala: "VOU PICAR A ALFACE DA SALADA PRIMEIRO QUE TÁ VENCENDO, JÁ PEGO TUA CEBOLA!" Pensa: "Salada tá em 24s, preciso picar essa alface que já tá na minha cara antes que expire!"
- Por que serve: a promessa da cebola não se cumpre no mesmo tique.

**15. Claude, t84 (Claudete e Claudinho). Fechamento do arquivo: os dois gritam a mesma alface.**
- Claudete, ação "pegar prato com alface picada da bancada 11", resultado "pegou prato com alface picada". Fala: "PEGUEI A ALFACE! Manda o tomate picado na tábua 1 que eu monto a salada!"
- Claudinho, ação "pegar prato com alface picada da bancada 11", resultado "bancada 11 já estava vazia.". Fala: "PEGUEI A ALFACE! Tomate tá meio picado na tábua, bora!"
- Por que serve: é o último tique do arquivo, e a dupla grita a mesma conquista ao mesmo tempo.

**Candidatos que ficaram fora do top 15:** GPT, t20 (fala "ENTREGANDO! PEGA O TOMATE E FECHA A SALADA!", prato recusado); DeepSeek, t45 (pensamento "Tomate expirou, ignora." com "Sopa de tomate(4s)" ainda no pedido, expirou só em t47); DeepSeek, t47 ("DEIXEI NA BANCADA 7, NÃO NA 9! A 9 TEM PRATO COM TOMATE DA SALADA, NÃO MISTURA!", uma regra inventada pelo próprio chef); Gemini, t82 (pensamento "Faltam 6 segundos pro fim do jogo!... entrego no buzzer beater!", contagem do fim que o arquivo não confirma); Claude, t68 (entrega com 6s).

**Comemoração exagerada:** não há nenhum momento de comemoração explícita nos arquivos, então esse tipo de destaque não entrou.

---

## 3. Comparação

| Cozinha | Entregas | Pedidos expirados (de 11) | Pontos finais | Ações falhadas | Respostas inválidas | Esperar | Falas em caixa alta (de 170) | Exclamações nas falas |
|---|---|---|---|---|---|---|---|---|
| DeepSeek | 1 | 7 | -53 | 4 | 2 | 5 | 157 | 356 |
| Claude | 2 | 6 | -26 | 11 | 1 | 12 | 4 | 296 |
| GPT | 0 | 8 | -80 | 24 | 1 | 2 | 170 | 278 |
| Gemini | 2 | 6 | -26 | 7 | 0 | 3 | 116 | 261 |

"Ações falhadas" são ações com resultado "já estava vazia", "sem prato" ou "recusado". "Caixa alta" usa o critério de pelo menos 70% de letras maiúsculas. Os números foram contados por script sobre os quatro arquivos.

- **Mais organizado:** Gemini, com 2 entregas, nenhuma resposta inválida e 7 falhas. O DeepSeek teve menos falhas (4), mas só uma entrega.
- **Mais caótico:** GPT, com 24 ações falhadas. É mais do que a soma das outras três cozinhas (4 + 11 + 7 = 22), e tem 0 entregas.
- **Mais nervoso:** DeepSeek, com 356 exclamações e a maioria das falas em caixa alta. O GPT é o único com 100% das falas em caixa alta, mas tem menos exclamações.
- **Mais culpou o parceiro:** empate entre DeepSeek e Gemini. Contei à mão as acusações diretas: DeepSeek tem 3 (t7, t10, t11), Gemini tem 3 (t19, t22, t66), Claude tem 2 (t16, t66) e GPT tem 0. O DeepSeek também aparece com mais falas sobre alcance (21 falas com "alcan"; Claude tem 1, GPT e Gemini têm 0), mas isso é constatação, não acusação. O Gemini é o que faz as acusações mais diretas.

---

## 4. Por que o GPT terminou com 0 entregas

O arquivo mostra o que aconteceu, mas não as razões internas dos chefes. As causas abaixo são inferências a partir das ações e falas.

1. **Nenhuma sopa ficou pronta.** Não há nenhum evento "pronto" nessa cozinha. O fogão 1 recebeu uma única cebola (t7) e nunca mais, e o fogão 2 recebeu um tomate (t26).
2. **As duas tentativas de entrega foram prematuras.** No t20 a Gepeta entregou um prato só com alface picada, dizendo "ENTREGANDO!", e no t32 entregou um prato só com tomate cru, dizendo "ENTREGANDO A SOPA DE TOMATE!". Ambas foram recusadas.
3. **A montagem não fechou.** Pratos e ingredientes se espalharam pelas bancadas 7, 9, 11, 13 e 15, e as ações falharam por "sem prato" (por exemplo, t19) ou por bancada vazia ou ocupada. Foram 24 ações falhadas, mais do que as outras três cozinhas somadas.
4. **O resultado foram 8 pedidos expirados:** 3 sopas de cebola (t29, t56, t65), 1 sopa de tomate (t47) e 4 saladas (t26, t35, t71, t80). Sem nenhuma entrega, a pontuação chegou a -80.
