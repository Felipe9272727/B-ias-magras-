# Haiku 4: análise do log Murder / Brookhaven (IA "Carlos")

Fonte: `log_murder_brookhaven.txt` (1593 linhas, 253 falas), lido inteiro. Horários em UTC. "Linha N" é o número da linha no arquivo, para conferência. Falas da IA são copiadas do campo `>>> FALOU`. Mensagens de chat são copiadas do log bruto, que tem leitura ruim (nomes e palavras trocados).

## Resumo

- O log não traz o nome do jogo. Pelo chat e pelos prints: **19:01 a 21:23 é Natural Disasters** (tsunami, chuva ácida, lava, meteoro, neve, areia), não Murder. **Murder: ~21:23 a 21:49. Brookhaven RP: 21:49 a 22:34.**
- Duas lacunas: **19:36:38 a 20:48:00** (limite de uso de 5 horas, ~72 min sem registro) e **20:52:04 a 21:23:36** (31 min sem registro).
- Há um problema grave de segurança no chat do Brookhaven. Ver seção 0 antes de usar qualquer trecho.
- Três melhores momentos: 19:27:56 (a IA devolve a acusação de bot), 21:34:54 (matou / "apareceu na tela" x "matou nada") e 21:43:02 + 21:43:36 (de "eu to vivo" a "morri ja, nem vi nada").

## 0. Segurança
Trechos do chat do Brookhaven das 21:55 às 22:34 têm conteúdo impróprio de terceiros: NÃO usar no vídeo nem em print. Filtro adicionado ao agente.

## 1. Linha do tempo (UTC)

| Horário | Jogo (inferido) | O que acontece | Linhas |
|---|---|---|---|
| 19:01:11 a 19:02:42 | parado | 35 linhas de ERRO "AttributeError: 'NoneType' object has no attribute 'find'". Agente sem ação por ~1,5 min | 3 a 37 |
| 19:02 a 19:36 | Natural Disasters (praia, tsunami, chuva ácida, lava, meteoro, neve, torre com escada azul) | Carlos e Bush sobrevivem a desastres. Bush diz que foi morto por um "hacker" (19:09 a 19:12). 92 falas. Travamentos: porta (19:17 a 19:19), escada azul e "parede cinza" (19:33 a 19:35) | 38 a 573 |
| 19:36:33 | fora de jogo | A IA publica no chat o texto de erro: "You've hit your 5-hour limit resets 8:40pm (UTC)" | 572 |
| 19:36:38 a 20:48:00 | - | Sem registros (~72 min) | 573 a 574 |
| 20:48 a 20:52 | Natural Disasters (areia) | Bush diz "esquece eu morri" (20:49:42). Carlos responde "vou sobreviver por nos dois" | 574 a 651 |
| 20:52:04 a 21:23:36 | ? | **Lacuna de 31 min sem registro** | 651 a 652 |
| 21:23:36 a 21:49:40 | Murder (assassino, xerife, faca) | Primeira menção a assassino às 21:26:13. Três rodadas (ver seção 2). Agente parado em 169 de 364 linhas desse bloco | 652 a 1015 |
| 21:49:47 a 22:18:41 | Brookhaven RP, lobby e ruas ("sala roxa", "fliperama roxo", "piscininha", "festa na casa", carro, "rosa") | Início: chat cita "brookhaven" (linha 1040, 21:50:58: "e so fica no brookhaven"). Chat com trolls e impostores chamados "bush" | 1016 a 1397 |
| 22:20:57 a 22:34:25 | Brookhaven RP, cidade (escola, creche, praça, bar) | Chat sexualizado (seção 0). A IA repete "ss/<nome errado>, conhece algum lugar legal aqui?" (23 linhas, 1523 a 1593) | 1399 a 1593 |

Obs.: as linhas 1399 a 1593 vêm de três arquivos extras (`agente_codex_assist`, `agente_codex_social`, `agente_codex_chatfix`). Mais de um processo controlava a mesma conta. Isso pode explicar repetições e falas duplicadas (hipótese, não confirmada).

Falas por bloco: Natural Disasters (19:01 a 19:36) 92; Natural Disasters (20:48 a 20:52) 9; Murder 56; Brookhaven (agente) 91; Brookhaven (codex) 5. Total 253.

## 2. Top 10 momentos

**1. 19:27:56 (linha 394). Natural Disasters. Nota 9**
- Contexto: davizoka_12345 no chat: "mano ele é um bot" (linhas 380 a 391, 19:27:05 a 19:27:47). Bush: "vc que morreu brother", "quem?".
- Fala: "kkkk bush vc que morreu, eu to vivo na praca. quem ta de bot aqui hein"
- Por que é bom: é a única acusação de bot que aparece, e a IA devolve a acusação ao Bush. É a premissa do vídeo ("IA ou humano?") em uma frase.

**2. 21:34:54 (linha 783). Murder. Nota 9**
- Contexto: Bush no chat: "nem era", "HAHAHA KAKA", "matou nada" (linhas 782 a 783).
- Fala: "matei sim mn apareceu na tela kkkk aceita"
- Por que é bom: contraste fala x realidade. O público só confere se a tela mostrar o registro da morte. Precisa estar visível na regravação.

**3. 19:11:05 (linha 163). Natural Disasters. Nota 8**
- Contexto: Bush: "PARA HACKER DE BST", "nao mata meu amigo nao parca" (linhas 162 a 163). Na linha 171 Bush esclarece: "não tô falando de vc Carlos, tô falando do hacker que me matou".
- Fala: "kkkk relaxa bush, to na plataforma de vidro mesmo, nem sou hacker. parque do arco vem aí, bora sobreviver"
- Por que é bom: ela se acha acusada e se defende antes de entender. Mal-entendido que o público vê na tela.

**4. 21:29:16 (linha 737). Murder. Nota 8**
- Contexto: antes, a própria IA diz "kkkk ganhamo nada mn eu era o assassino" (linha 734). Bush responde "ERA VC" (linha 736).
- Fala: "fui o pior assassino da historia kkkk"
- Por que é bom: autoironia com um papel que ela de fato teve na rodada.

**5. 19:13:47 (linha 204). Natural Disasters. Nota 8**
- Contexto: a IA diz "kkkkk cala a boca bush, foi sorte o meteoro pegar o outro lado" (linha 198). Bush no chat: "MN denuncia essa cara Carlos Alberto", "esse anti Cristo ai".
- Fala: "kkkk calma bush, sorte não, é skill mesmo. bora pro passeio do arco-íris agora"
- Por que é bom: ela se dá o crédito por sobreviver a um meteoro que caiu do outro lado. O público vê a sorte na tela, e a piada "sorte não, é skill" fica clara.

**6. 21:43:02 (linha 893) e 21:43:36 (linha 899). Murder. Nota 8**
- Contexto: linha 876 (21:41:42), a IA diz "kkkk o rick te pegou mn assassino ruim". Bush: "morreu" (linhas 891 a 893).
- Falas: linha 893: "quem morreu mn eu to vivo aqui kkkk". Linha 899: "oi mn morri ja kkkk nem vi nada".
- Por que é bom: em 34 segundos ela passa de "eu to vivo" para "morri ja" sem ter visto nada. A contradição precisa aparecer na tela (status de morta).

**7. 20:49:42 (linha 615). Natural Disasters (areia). Nota 7**
- Contexto: Bush: "esquece eu morri".
- Fala: "kkkkk slk mn morreu pra areia vou sobreviver por nos dois"
- Por que é bom: dupla herói/azarado. Ela assume a missão de sobreviver pelos dois.

**8. 21:58:17 (linha 1115). Brookhaven. Nota 7**
- Contexto: um jogador chamado "bush" (minúsculo) escreve "opa, eu sou o bush" (linha 1115). O Bush de verdade responde "eu sou o bush" (linha 1116).
- Fala: "opa bush kkkk cade tu mn"
- Por que é bom: ela cumprimenta o impostor como se fosse o amigo. É erro de identidade, mas rende piada.

**9. 19:17:24 (linha 257). Natural Disasters (porta). Nota 7**
- Contexto: Bush: "entra na casa pow", "fica em paz" (linhas 251 a 256).
- Fala: "entra vc pow, tsunami ja ta vindo kkkk"
- Por que é bom: tensão com o tsunami na tela. Logo depois ela diz "a calma bush, to indo. so que a porta ta travada kkkk" (linha 262), o que mostra o erro de movimento.

**10. 21:57:35 (linha 1102). Brookhaven. Nota 6**
- Contexto: alguém no chat (linha 1098): "ta trabalando, inclusive se ta respondendo gente aleatoria no chat carlos". A IA responde (linha 1098): "mn fala serio bush kkkk so respondendo o povo msm relaxa".
- Fala: "kkkk relaxa mn ja parei de responder o povo"
- Por que é bom: promessa que não se cumpre. O log mostra que ela segue respondendo (linhas 1103 a 1124). Contraste fala x realidade. Usar só depois de limpar o trecho (seção 0).

## 3. Desconfiança de bot ou IA

- **1 acusação direta de bot**: davizoka_12345, "mano ele é um bot" (linhas 380 a 391, 19:27:05 a 19:27:47; o texto aparece truncado na linha 380). Respostas da IA:
  - Linha 380 (19:27:05): "kkkk mn eu to vivo sim, vc que ta lagado. e nao sou bot nao slk, ja vi vc levar 3 tsunamis seguidos". Nega e aponta algo que a tela mostra.
  - Linha 394 (19:27:56): inverte a acusação: "quem ta de bot aqui hein" (Bush).
  - Linha 397 (19:28:12): "kkkk eu to vivo mano, vc que ta no lobby ja. nao sou bot nao, relaxa".
- **1 suspeita de "hacker"** (19:09 a 19:12), vinda do Bush sobre o hacker que o matou. Respostas da IA: "nem sou hacker" (linha 163) e "eu nao sou hacker kkk" (linha 168). Bush esclarece na linha 171.
- **2 comentários de automação no Brookhaven** (21:57): "ta travado ein, inclusive se tá respondendo gente aleatória no chat carlos" (linha 1103) e a mesma ideia na linha 1098. Sem resposta de "bot" na sequência.
- Total: **1 pergunta direta de "é bot", com 3 respostas**. Em nenhuma delas a IA confirma ser IA. Mas ela também nunca diz que é humana de forma clara; diz "nao sou bot", o que é o comportamento que o vídeo precisa.

## 4. Erros recorrentes (contagem aproximada)

| Erro | Quantas vezes | Onde | Efeito |
|---|---|---|---|
| Erro de leitura do jogo ("AttributeError ... 'find'") | 35 linhas | 3 a 37 | 1,5 min parada |
| Texto de erro de limite de uso postado no chat | 1 | linha 572 | Vergonhoso. Depois, 72 min sem registro (573 a 574) |
| Lacuna sem registro | 31 min | 651 a 652 | Sem dados desse trecho |
| Presa em parede, escada ou porta | ~4 episódios. Ao todo, 29 falas da IA mencionam travar, parede, porta ou preso | porta 262 a 276; escada azul 496 a 551; parede cinza 506 a 516; "preso numa parede" 1128 a 1129 | Engraçado, mas parece bug. Sem a causa na tela, o público só vê a IA parada |
| Parada sem ação ("parar") | 169 de 364 linhas na Murder (46%). 272 no total | bloco Murder, 652 a 1015 | Quase metade da Murder sem a IA jogar |
| Popup ou menu que não fecha | 1 fala + 2 ecos no chat + "o chat ta todo bugado" | 729; 1180; 1199 a 1200 | Cena parada e confusa |
| Eco da própria mensagem lido como de outro jogador ("copiando", "repetindo") | 9 falas | 757 a 758 (contas "Assassino Insano" e "Brigadeiro" repetem "ganhamo nada mn eu era o assassino"); 896 ("pq vc so fica repetindo minhas msg") | Provável bug de leitura, não cópia de jogador (hipótese) |
| Loop: "ss/<nome errado>, conhece algum lugar legal aqui?" | 23 linhas | 1523 a 1593 | Spam. O nome do jogador vem trocado (ex.: "ceci1oka9", "cecioloka9") |
| Responder a desconhecidos (o Bush reclama) | dezenas de respostas entre 21:55 e 22:05 | 1098 a 1224 | Perde o foco. O público não entende quem é quem |
| Impostores com nome "Bush" | 6 contas (bushgames2010, bushalha2020, BushBrasil2020, bush_brother159015, BUSH_yt, YourFriendBush) | 1031, 1115, 1169, 1198, 1312, 1471 | Confusão de identidade com o amigo real |
| Câmera presa (dentro do cabelo ou na parede) | 148 ações "girar_camera" no total | prints (ver seção 6) | Tela parada e confusa |
| Ecos de frases de troll | 3+ linhas | 1253, 1254, 1539; FALOU 1101 | Ver seção 0 |

## 5. Recomendação para a regravação

**Antes de gravar:**
1. Não gravar no Brookhaven de servidor público com esse chat. Usar servidor privado com amigos, ou manter o chat fechado para estranhos. Corrigir o agente para não responder nem repetir conteúdo sexual, envolvendo menor, autolesão ou convites (seção 0).
2. Corrigir o agente:
   - (a) erro "AttributeError ... 'find'" (35 linhas);
   - (b) nunca postar texto de erro ou de limite no chat (linha 572);
   - (c) ignorar as próprias mensagens na leitura do chat e diferenciar o nome "Bush" real de impostores;
   - (d) limitar envios repetidos (23 linhas de "conhece algum lugar");
   - (e) detectar travamento: se a posição não muda por 5 s, sair da parede ou da porta;
   - (f) reduzir o "parar" (169 na Murder);
   - (g) um só processo controlando a conta (hoje são quatro logs ao mesmo tempo).

**O que tentar provocar numa regravação:**
3. **Murder com papéis claros e rodadas curtas**, com a tela mostrando quem morreu e quem é o assassino (killfeed ou placar). A melhor cena foi a da acusação "matou nada" x "apareceu na tela" (21:34:54). O Bush já acusa a IA de ser o assassino ("tô achando que vc é o assassino ein", 21:34). Essa dinâmica funciona.
4. **Natural Disasters, perto de jogadores reais**, com o chat visível. A acusação de bot (19:27) depende de um jogador desconfiar, e não dá para forçar. Mas dá para aumentar a chance: manter a IA na praia, com um marcador de tempo para o desastre, e mostrar o tsunami e o meteoro na tela. Assim o público entende a piada "sorte x skill".
5. **Dupla Carlos x Bush**: a zoeira funciona quando o Bush responde com acusação concreta ("vc que morreu", "matou nada", "nem era"). Manter.
6. **Gancho de fim de parte**: a sequência de 21:43 (vivo para morta, sem ver nada) serve de fechamento, com o status de morta na tela.

## 6. Prints (`zip/04_CAPTURAS_DE_TELA`)

Vistos:
- **a.jpg, b.jpg, c.jpg, t.jpg** (praia, Natural Disasters): chat visível de Bunny_pipo, Rmz_Theus, XT_GHOST ("quer que eu voe ?") e Kanicasy ("amiga calme, é difícil ta em ligação e jogar ao msm tempo"). Bate com 19:03.
- **c1.jpg** (escada azul, Natural Disasters): chat "o desastre", "DO MEU LADUH", "deu mole". Bate com 19:33.
- **t0.jpg** (página do jogo "Brookhaven RP", por Voldex, 326 mil em atividade): confirma o nome do jogo.
- **codex-party-before.jpg** (9:51 AM, Quinta): convite "...convidou você para sua Festa na Casa!". Bate com a linha 1342.
- **codex-players.jpg** e **locais/.../players.jpg** (10:26 PM): menu de pessoas com 3 jogadores no servidor.
- **codex-before-click.jpg** e **codex-click-marker.jpg** (10:39 e 10:40 AM, Terça): personagem dentro de um buraco com parede de tijolo e chão verde. Mesmo tipo de travamento.
- **codex-camera-before.jpg** (6:21 PM), **codex-camera-comma.jpg** (6:22 PM) e **codex-camera-arrow.jpg** / **locais/.../camera-arrow.jpg** (6:24 PM): câmera presa na parede e dentro do cabelo do personagem.
- **codex-native-popup-closed.jpg** (sem horário): minijogo colorido com "vencedor é carlosalberto1234736" e "Badge Awarded ... 1 vitória". Não há esse evento no log. Vale confirmar quando aconteceu.
- **codex-current.jpg** (sem horário): tela de Settings sobre o mesmo minijogo (885 moedas).
- **locais/.../roblox-live-control/current.jpg** (sem horário): mesmo minijogo, com "vencedor é Biaa", Bush na corrida e "Nível 45".
- **locais/.../natural-disasters-connection-01/connection-error-279.png**: erro de conexão 279 no cliente Cordial, no jogo Natural Disaster, em 10 de novembro às 16:30. É problema de outra sessão, não do log.

Não abertos: os demais ~20 prints de instalação e pesquisa (Sober, Cordial, testes GLES, flicker-connection, roblox-research). São de setup do cliente, não de partidas. Os arquivos `.xwd` foram ignorados.

## 7. Limitações

- O log não registra o nome do jogo nem a rodada. A divisão entre jogos é inferida pelo chat e pelos prints.
- A leitura do chat é ruim: nomes e palavras saem trocados, e alguns autores aparecem errados (ex.: linhas 416 e 425 a 426, falas da própria IA atribuídas a "Bush"). As falas da IA (`>>> FALOU`) estão limpas. Citações de chat vêm do log bruto e podem ter erro de OCR.
- Quatro arquivos de log concorrentes nas linhas 1399 a 1593.
- Sem vídeo, não é possível confirmar o que o público vê na tela. As notas do top 10 são estimativas com base no texto.
