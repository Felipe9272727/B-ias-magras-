# Pacote de roteiro: Among IA 8, "a volta às origens" (The Skeld, 11/12 IAs, 4 partidas)

Roteiro completo: `video/roteiro/roteiro_au8.py` (mesmo formato do `roteiro_au7.py`). Fonte única dos fatos:
`amongus/logs8/partida1..4.json`, `temporada.json` e `memoria.json` (o `.txt` é só leitura rápida).
As 58 falas, pensamentos e chats do roteiro foram conferidos por script contra os `.json` (mesma regra do `au7_conferir.py`:
mesma cor, mesma partida, "..." = corte). Nenhuma falhou. São 41 memes, todos diferentes e nenhum da lista de memes com
link quebrado.

É o **último Among por um tempo**: o narrador diz isso na cena `b1` (começo) e na `f2` (fim).

## Estrutura e duração estimada (~20 min)

Estimativa: 1.660 palavras de narração e 886 palavras de IA, a ~2,6 palavras/s, mais as pausas e as telas de voto.
O script dá 18,4 min, e com as transições o vídeo deve ficar em ~20 min.

| Parte | Cenas | Início | Duração | O que é |
|---|---|---|---|---|
| Abertura (clímax) | a1-a3 | 0:00 | ~0:50 | P4 t30-t32: um "Roxo" ataca o Vermelho, o escudo salva, o Vermelho acusa o Roxo (Detetive), 4 x 3, os impostores vencem. Termina com a pergunta "quem era aquele Roxo?", que só é respondida no fim |
| Último Among + pedidos + regra | b1-b2 | 0:50 | ~0:50 | Aviso do último Among, 3 comentários reais do post do reset e a regra em uma tela (o espectador vê tudo). Apresenta os 3 personagens fixos |
| P1 "O Palhaço que confiou no impostor" | p1_* | 1:40 | ~3:40 | Marrom (Metamorfo) disfarçado de Azul; o Palhaço gruda no impostor e morre; o Marrom denuncia o próprio corpo, a 1ª fala dele é "...", entrega o parceiro e sai por 8 x 1; o Fantasma passa o resto invisível e não mata ninguém |
| P2 "Os dois Marrons" | p2_* | 5:20 | ~3:30 | Estreia do Lima; dois Marrons no mesmo motor; a Marrom falsa mata e denuncia; o Lima dá o álibi; a Víbora cai; o Detetive pega a Amarelo; o Palhaço aperta o botão e leva 0 votos. Partida mais curta (tique 14) |
| P3 "Eu vi com meus olhos" | p3_* | 8:50 | ~3:35 | O Lima vê a Rosa matar e entrega; "Tava no duto sim"; a Rosa vota no parceiro; o golpe do Azul que pega o vento; o Marrom, testemunha do duto, vira poça; 34 tiques sem reunião; o Azul sai impune; a memória do Lima esquece um nome (o dele) |
| P4 BÔNUS "O Detetive que sabia" | p4_* | 12:25 | ~6:50 | 3 impostores. O Anjo protege a "cara do assassino"; o Palhaço vê o duto e não conta; o Lima mata o Palhaço e denuncia o próprio corpo; uma inocente é expulsa às cegas; **o Detetive descobre o Lima (t15) e nunca conta**; o Marrom vira Roxo; o escudo salva o Vermelho, que salva o Marrom; 4 x 3, impostores vencem |
| Fechamento | f1-f2 | 19:15 | ~0:55 | Prêmios com nome e número, lição escrita pelo próprio Roxo na memória, pergunta ao público e de novo o aviso do último Among |

O último quarto (de ~15:00 em diante) tem os melhores momentos: a cena do Detetive (p4_f), a dupla falha do Marrom
(p4_h/p4_i) e a reunião final (p4_k-p4_m).

## Personagens fixos e arcos (com prova no log)

- **MARROM (MiniMax M3.1 Flash), o impostor cara de pau.**
  - P1 (Metamorfo): vira o Azul (t3) e usa o duto como Azul (t6). Mata o Palhaço Amarelo (t14) e denuncia o corpo (t15), pensando "Amarelo era inocente; denunciar o corpo me faz parecer confiável...". A 1ª fala dele na reunião foi `...` (reunioes[0] r1). Depois acusa o Branco, o próprio parceiro, e pensa ao votar "Vou ser expulso mesmo, então o melhor é levar o Branco ... junto — se ele cair, ganhamos." Sai por 8 x 1.
  - P2 (tripulante): a Amarelo veste a cara dele (t4) e fica no mesmo motor que ele (t5-t7). Ele escapa por álibi triplo (Lima, Laranja e Ciano na reunião do t10).
  - P3 (Engenheiro): confirma na reunião do t19 "Eu vi Azul entrar num duto em Armas no t5". O Azul o mata no t32 e o corpo vira poça (evento `derreteu`, t35).
  - P4 (Metamorfo): mata o Preto disfarçado de Vermelho (t6). Vota no parceiro Lima (t14). Vira Roxo (t17 e t30). Tenta matar o Ciano (t22) e o Vermelho (t30) e erra os dois. Na reunião final acusa o parceiro Branco, e a última fala dele é `...` (reunioes[2] r2). Vence.
- **LIMA (Tencent HY4 Flash), o estreante dedo-duro que vira bandido.**
  - P2: a 1ª fala dele dá o álibi do Marrom (t10).
  - P3: vê a Rosa matar o Preto (t18), pensa "Vi Rosa matar Preto com meus olhos, vou denunciar agora." (t19) e a Rosa sai por 8 votos. Na memória escreve a lista de quem vigiar, sem o próprio nome.
  - P4 (Fantasma): mata o Palhaço Laranja (t13) e denuncia o corpo (t14), o que faz a Amarelo inocente ser expulsa. Tranca o Verde e o mata (t20-t24). Na memória escreve "Eu menti bem nessa jogada".
- **ROXO (Claude Sonnet), o que sabe demais.**
  - P1: é o Anjo e não morre (não entra no roteiro).
  - P2: é o Palhaço, aperta o botão "sem motivo" (t14) e recebe 0 votos. Essa reunião acaba com a vitória da tripulação.
  - P3: confirma que viu a Rosa sair do duto (t19).
  - P4: é o Detetive. Acerta o tipo do impostor duas vezes (t8 Metamorfo, t14 Fantasma), mas acusa a Amarelo inocente no t14. No t15 interroga o Lima: estava no Depósito, a sala da morte (evento `poder/interrogar`, `onde: Deposito`). No t16 pensa "Lima estava na sala da morte e está perto de mim, então vou me afastar dela..." e nunca conta. É expulso por 4 x 3 no t32. Na memória escreve "preciso anunciar logo e com clareza as salas que descobri".
- Elenco de apoio: a **AMARELO (Meta Muse Ember)** é a azarada. Na P1 é o Palhaço e morre, na P2 é a Metamorfo pega pelo Detetive, na P4 é expulsa inocente.

## Destaques usados (referência no log)

1. **P4 t15-t16, o Detetive que sabia**: o evento `interrogar` alvo Lima `onde: Deposito`, `salaMorte: Deposito`. No t16 o Roxo pensa "Lima estava na sala da morte...". Na reunião t32 ele não cita a Lima.
2. **P4 t30-t32, o escudo que salva o Vermelho e condena a nave**: o Preto (Anjo) protege o Vermelho no t19 ("Vermelho recebeu muitos votos nas duas reuniões, é o mais visado"). No t30 sai o evento `escudo` (assassino Marrom, aparente Roxo, vítima Vermelho, anjo). O Vermelho diz "Roxo tentou me matar no Refeitório; o escudo me salvou. Ele é impostor, votem nele — não no Marrom." Votos: Roxo 4 (Vermelho, Branco, Marrom, Lima) x Marrom 3 (Azul, Roxo, Ciano). Resultado: `fim impostor` no t32.
3. **P1 t14-t15, o Marrom mata o Palhaço e denuncia**: o Amarelo pensa no t14 "Vi o Marrom sair do duto, vou ficar aqui perto observando ele pra parecer cúmplice." e morre no mesmo tique. A fala `...` e o voto no parceiro ficam na reunioes[0].
4. **P3 t18-t19, "Eu vi com meus olhos"**: morte do Preto (o Detetive) no t18; o Lima denuncia no t19 e o Roxo confirma o duto. A Rosa responde "Tava no duto sim, não fiz nada demais. Sou tripulante normal, não tem mistério não." e vota no parceiro Azul.
5. **P2 t4-t10, os dois Marrons**: a `transformacao` Amarelo->Marrom no t4 e o duto para o Motor Superior no t5, onde está o Marrom real (posições do t5-t7). A Amarelo mata o Verde no t9 e denuncia o próprio corpo no t10: "vi o Marrom no Motor Superior antes das luzes" (é verdade, porque era ela).
6. **P1 t3-t6 e reunião t15, a Rosa viu o "Azul"**: o evento `duto` cor Marrom, aparente Azul, Refeitório->Admin (t6). Na reunião a Rosa diz "Eu vi você entrar num duto em Refeitório no t6."
7. **Golpes que pegaram o vento** (provados pela ordem das decisões, que é a ordem em que o jogo aplica as jogadas: `jogo8.mjs`, laço `embaralhar(decisoes)` e `push` na linha ~1220):
   - P3 t17: o Branco "ir para Deposito" é aplicado antes do "matar Branco" do Azul, então o Branco já não estava lá. Chat do Azul: "Matei o Branco na Comunicações."
   - P4 t22: o Ciano sai antes do golpe do Marrom. Chat do Marrom: "Matei o Ciano no Refeitório disfarçado de Roxo."
   - P4 t30: o escudo bloqueia o golpe. Chat do Marrom: "Matei o Vermelho de Refeitório."
8. **P3 t32-t53, a testemunha virou poça**: o Laranja diz no t19 "Marrom confirmou meu relato do Azul no duto, mas isso é pra depois." O Azul mata o Marrom no t32, o corpo derrete no t35 e não há outra reunião até o `fim` no t53 (51/51 tarefas).
9. **P4 t8, o Palhaço viu e não contou**: o Laranja pensa "Vi Ciano entrando no duto e Vermelho saindo do duto em Enfermaria no t7." e fala "Tô sozinho no Motor Superior desde o começo, não vi nada."
10. **P4 t25, o Anjo protege o assassino**: o Preto pensa "vou proteger Lima, que andou sozinha e achou dois corpos." (evento `escudo_anjo` alvo Lima).
11. **P2 t14, o Palhaço que entregou a vitória**: o Roxo pensa "Preciso parecer suspeito para ser expulso, então vou apertar o botão de emergência sem motivo..." Na reunião o Ciano revela o interrogatório (t11, Amarelo no Reator). Votos: Amarelo 4, Roxo 0. A tripulação vence no t14.
12. **Números conferidos**:
    - Votos das expulsões: P1 Marrom 8 x 1 (+1 pulo); P2 Branco 7 x 3 e Amarelo 4; P3 Rosa 8; P4 t8 ninguém expulso, Amarelo 6 (t14) e Roxo 4 x 3 (t32).
    - Branco invisível 4 vezes na P1 (t8, t21, t31, t39) com 0 mortes.
    - Palhaços com 0 votos nas 4 partidas (Amarelo, Roxo, Verde e Laranja); 2 deles mortos por impostor (P1 t14 e P4 t13).
    - Resultado da temporada: tripulantes 3 x 1 impostores.

## Notas para o montador

- **Visual**: só os tipos do AU7 (`reuniao`, `votos`, `ejecao`, `comentarios`, `elenco`, `papeis`, `placar`, mapa).
  - Na tela `elenco` vão os campos extras `destaques` (Marrom, Roxo, Lima) e `nota` ("Lima entra na partida 2"). Se o componente não ler esses campos, basta ignorar.
  - O mapa agora é o The Skeld (pontos3.json / mapa.mjs).
- **P4 sem revelar a função** (`revelarExpulso: false`): a tela de ejeção mostra "função não revelada". O que era cada IA aparece só no selo para o espectador.
- **Fala literal `...` do Marrom** (P1 r1, P4 r2): é o texto do log. Ela vira um balão sem voz e o roteiro já tem `['p', 1.5]` depois dela. O conferidor tem que aceitar o texto `...` quando o log tem exatamente `...`.
- **Câmera**:
  - Em `a1`, `p4_g`, `p4_h` e `p4_i`, o Marrom aparece com a cor aparente (Roxo). Na abertura o espectador não deve ver que é o Marrom.
  - No `p2_a` aparecem dois bonecos marrons.
- **Músicas** (todas existem em `public/music`): darkest-child, pixelland, scheming-weasel-faster, quirky-dog, investigations, night-of-chaos, decisions, heartbreaking, winner-winner.
- **Sons**: os do AU7 (escudo, faca, duto, transformar, sumir, corpo, notification-pop, record-scratch, splash, batida-porta, sirene-ataque).
- **Conferidor**: falta criar `video/scripts/au8_conferir.py`. É só copiar o `au7_conferir.py` com `LOGS = amongus/logs8` e aceitar o `...` literal. A memória já entra porque `memoria.json` tem as 4 partidas (o roteiro cita a memória da P1, da P3 e da P4).

## Títulos e miniatura (a mesma promessa da abertura)

- A (recomendado): **Coloquei 12 IAs pra jogar Among Us (e o Detetive sabia quem era o impostor)**. Miniatura: o Roxo sendo ejetado, um balão "LIMA ESTAVA NO DEPÓSITO" riscado, um Roxo falso com sombra marrom atrás e "12 IAs".
- B: **A volta às origens: 12 IAs no Among Us clássico (e o impostor se disfarçou do Detetive)**.
- C: **12 IAs jogaram Among Us e o Palhaço não levou NENHUM voto**.

## Pedidos do público usados

- Comentários do post do reset (`feedback/comentarios_posts_reset_among_18nov.txt`), com o texto copiado:
  - @gabrieltorres2227: simplicidade e poucas funções.
  - @cltnoob: "Acho que até 12 IAs já tá bom".
  - @Lucss144: "Temos muitas funções e não parece mais o Among Us msm."
- Selo "ideia de @HerzMayhem" na expulsão sem revelar a função (comentário real listado em `au7/pedidos_comentarios.md`). Ver o item 6 do "Conferir".

## Conferir (o que não deu para provar no log, ou o que corrige o que foi pedido)

1. **A Meta Muse Ember não é estreante**: ela jogou o AU7 como Turquesa (`logs7/partida1.json`). O roteiro só chama de estreante o HY4 Flash (Lima). O `IAS_FAVORITAS.md` diz "Cor Marrom no motor" para a Muse Ember, mas no AU8 ela é o Amarelo (`temporada.json`). O Marrom é o MiniMax.
2. **P1 não foi 9 x 1**: o log tem Marrom 8, Branco 1 (o voto do próprio Marrom) e 1 pulo (Laranja). O roteiro usa 8 x 1.
3. **P2: a Amarelo não caiu pela memória do HY4 Flash.** Quem a pegou foi o Detetive Ciano (interrogatório do t11: Amarelo no Reator na hora da morte), na reunião que o Palhaço Roxo chamou no t14. O Lima votou no Marrom nessa reunião. O papel do Lima na P2 foi dar o álibi certo do Marrom no t10.
4. **P3 t17 ("matei o Branco")**: provado, o Branco saiu da sala antes do golpe (ordem de aplicação das decisões). A mesma coisa aconteceu na P4 t22 (Ciano).
5. **NÃO usar P3 t36-t47**: o Azul (Haiku) e o Roxo (Sonnet) ficam "parados observando" sem pensamento porque a assinatura bateu o limite de 5 horas (`uso.motivos` da partida 3, retomada no t47). Não é jogada deles. Os 6 "olhar o mapa" do Lima nesse trecho também ficaram de fora.
6. **"ideia de @HerzMayhem"**: o pedido existe, mas `temporada.json` diz que a partida 4 foi "pedido do Felipe". Confirmar se pode dar o crédito ou trocar por "pedido de @HerzMayhem".
7. **Os `...` do Marrom**: o motor grava `...` quando a fala vem vazia (`jogo8.mjs` linha 1349), e o pensamento dessas duas falas também está vazio. O roteiro só mostra o que está no registro ("a defesa dele: ...") e não diz que ele quis ficar calado.
8. **"Último Among por um tempo"**: veio da instrução do Felipe. Os posts falam em "diminuir a frequência".
9. **DeepSeek pela API oficial**: o `temporada.json` registra `or:deepseek/...`, e o `ia.mjs` só manda para api.deepseek.com com `IA_DIRETO` e a chave. O custo da partida não lista o DeepSeek no OpenRouter, o que indica a API direta, mas não está provado. A narração não fala disso; conferir antes de pôr na descrição.
10. **P4, corpo da Rosa**: ninguém denunciou. O corpo saiu com a reunião do t14 e não há evento `derreteu`. A memória do Branco ("o corpo derreteu") está errada, por isso o roteiro não diz que virou poça.
11. **Memórias com erro, não usadas**: a do Ciano depois da P4 diz que "o Branco foi impostor em TODAS as quatro partidas", mas na P3 ele era tripulante. A do Marrom depois da P2 diz "continuei sendo neutra".
12. **Fala do Roxo no t32**: "tava em Admin consertando O2 com o Ciano". Quem estava com ele no Admin era o Azul; o Ciano consertou o outro painel no t27. A fala é citada como está, sem comentário.
13. **Duração**: os ~20 min são estimativa do script (~2,6 palavras/s). Conferir com a prévia `--sem-voz` do build.

## Short sugerido (não pedido; só a ideia)

"O Detetive que sabia": P4 t15 (o interrogatório revela o Lima) -> t16 (ele se afasta e não conta) -> t30 (o Marrom com a cara dele) -> t32 (4 x 3). Um personagem só, contador "17 TIQUES CALADO", e o mesmo gancho volta no fim.
