# AMONG IA 7: o que os comentários pedem (funções, modos, mapas)

Fonte: `todos.jsonl` do scratchpad, 2.205 comentários e respostas de 38 vídeos do canal (12/10 a 11/11/2026), 214 deles do dono. Sobram 1.991 comentários de 769 inscritos. Os do Among Us (AU2, AU3, AU4, AU5 Polus, Zumbi e os Shorts) e os do Lobisomem foram lidos na íntegra; os de Minecraft, Overcooked, Mario, Roblox etc. foram filtrados por palavra-chave.

Como ler os números
- "Pedidos" = **pessoas diferentes** (um mesmo autor em vários vídeos conta 1). Contagem por palavra-chave, conferida na mão nos grupos principais. Margem de erro de uns 1 a 2 nomes.
- "Já existiu?" confere com `sorteio5.py` / `jogo5.mjs` (pool do AU5), `sorteio_zumbi.py` / `au6_zumbi_spec.md` (modo zumbi) e `video/youtube/au4/funcoes_ep4.md` + `descricao_au3/4/5.md`.
- Nas funções que **já existem**, "pedidos" conta só quem pediu **antes da estreia** (o resto é conversa sobre a função já em campo). O total aparece entre parênteses.
- **Datas**: o scraper só tem "há X dias/semanas" do YouTube. Tudo com mais de ~10 dias vem arredondado para a semana (`15/10`, `22/10`, `29/10`). Leia como "na semana de". Os comentários de 03/11 em diante têm dia exato.
- Likes: soma dos comentários que citam a função. Comentário que lista várias funções empresta os likes a todas. Os likes do canal são baixos (o maior comentário de função tem 168).
- O dono chama o próximo episódio normal de "parte 6" (resposta de 07/11 no vídeo do zumbi). Aqui é o AU7.

---

## 0. Resumo de 10 linhas

1. O que ainda **não existiu** e mais gente pede: **Sósia/Ladrão de função (17)**, **Sniper/Arqueiro/Ninja (16)**, **Teletransportador (15)**, **Manipulador/Marionete (12)**, **Neutro com alvo (Carrasco/Executor/Caçador/Cianofóbico, 11)**, **Vampiro (11)**, **Vidente/Telepata/Fofoqueiro (11)**, **Vírus (10)**.
2. O pedido **mais repetido de uma só pessoa** é o **Policial** do @Ponto-Final-Sem-Final ("Dia 10 pedindo..."). 12 comentários em 10 vídeos. Pedido atendido vira gag pronta.
3. As melhores para o canal (IA mentindo e deduzindo, espectador sabendo o segredo): **Carrasco/Cianofóbico, Ladrão de função, Vidente do pensamento, Infiltrado, Policial (prisão)**. Detalhe na seção 2.
4. Funções que mais pediram e o dono **já fez**: Palhaço, Juiz, Influencer, Víbora, Glutão, Canibal, Sobrevivente, Casal, Doutor, Camuflador, Paciente, Traidor, Chato, Armadilheiro (de vingança), Anjo da Guarda e zumbi (modo especial).
5. Modos: **20+ IAs** (18 pessoas), **Esconde-esconde** (11), **mais impostores** (11), **jogar contra/junto das IAs ou baixar o jogo** (17), **não revelar a função de quem é expulso** (10). Mapas: Mira HQ (15, já feito no zumbi), Airship (10), Fungle (8).
6. O @guilhermgpd2 sozinho mandou 139 comentários com cerca de 40 funções e o dono respondeu "vou me esforçar ao máximo pra adicionar todas as sua funções" (08/11). Cobrança aberta.
7. Críticas que se repetem: IA **matar/transformar na frente de todos** (10 pessoas), **impostores nunca usam a habilidade** (76 likes), **Xerife não atira**, fala de IA "sem nexo".
8. Cobranças de "Dia N pedindo": Polícial (Dia 10), Gemini de volta (Dia 2), Cianofóbico (Dia 3), Clone, Banana (já atendida), Polus (já atendido).
9. Piada da comunidade: **"cianofobia"**, o ciano é sempre o impostor (resposta do dono: "ciano é sempre o impostor"). Cabe um selo.
10. O dono já disse que o AU7 "vai ter sim" as sugestões que não entraram no zumbi (ver seção 4).

---

## 1. RANKING das profissões/papéis pedidos

### 1A. Ainda NÃO existiram no canal (ordem por pessoas, desempate por likes)

"Rende" = nota 1-10 de quanto rende cena com IA mentindo/deduzindo, com o espectador sabendo o segredo. Calculada pelo critério do CLAUDE.md, não vem dos comentários.

| # | Papel (nome mais usado) | Pedidos | Likes | Quem pediu (principais) | Mais antigo | Existiu? | O que faz (como os comentários descrevem) | Rende |
|---|---|---|---|---|---|---|---|---|
| 1 | **Sósia / Ladrão de função / Copista / Mímico / Clonador** | 17 | 25 | @the_Harix777 (8), @Lolzinpvp (6), @spectra-wotblitz (pediu o Clone em 17 vídeos), @PintoNelsoOFC, @MateusWT10 | 22/10 (@eduardo34250, clonador) | Não (só o Metamorfo, que parece, mas não rouba) | "Um neutro q troca de função com um cadáver" (8 lk); "ladrão (rouba a identidade de quem mata)"; Sósia neutro que "se transforma na pessoa que matou e o corpo vira o corpo antigo dele"; Copista copia a função de quem quiser (5 usos); Mímico copia habilidade; Clone "se duplica e pode estar em 2 lugares" | **9** |
| 2 | **Sniper / Arqueiro / Ninja** (mata de longe) | 16 | 5 | @Xchamuel.e.casaca, @eduardo34250, @plufty107, @ArturViníciusXavier, @kethurim1 | 22/10 | Não (Apostador chuta função na reunião, parecido só com a versão do @kethurim1) | Impostor que mata a distância e demora mais; versões: Ninja marca 3 alvos e teleporta, Sniper que na reunião chuta a profissão | 5 |
| 3 | **Teletransportador / Fugitivo / Extrator** | 15 | 13 | @arthurjosemartinsoliva3648 (5), @GUILHERM3235 (3), @vinicius4323, @mr.trollermen, @IsaacMendesdosSantos-u3y | 22/10 | Não (Engenheiro usa duto, não é igual) | Tripulante: "teletransporta-se para uma sala escolhida", 3 usos, recarga 40 s. Impostor: teleporta **todo mundo para onde ele está**, para ninguém chegar a tempo no corpo | 6 (impostor) / 4 (tripulante) |
| 4 | **Manipulador / Marionete / Controlador / Alien** | 12 | 8 | @ThallysSouza-u6z (3 vídeos), @Minegamestv (3), @guilhermgpd2, @panigui, @RealyoSyz_BR | 22/10 | Parecido com Possuidor e Metamorfo, mas não igual | Impostor que controla outro jogador (o mais perto, a qualquer distância) e **mata sendo ele**; versão do @ThallysSouza-u6z: "Manipula IAs pra parecerem que elas são imps" | 6 |
| 5 | **Neutro com alvo secreto** (Carrasco / Executor / Caçador / Assassino de aluguel / **Cianofóbico**) | 11 | 8 | @Pursuer_M4 (Carrasco), @guilhermgpd2 (Carrasco), @CarlosRaphaelLemesMedeiros (Executor), @maskin-j3y (Assassino de aluguel), @Davinichetti (Cianofóbico, "Dia 3 pedindo") | 29/10 | Não (Palhaço quer ser expulso; Paciente/Glutão matam; ninguém tem alvo específico) | Recebe um alvo no início; vence se o alvo for **expulso na votação** (Carrasco/Executor) ou **morto e ele sobreviver à reunião** (Assassino de aluguel). Cianofóbico: o alvo é o Ciano | **9** |
| 6 | **Vampiro** | 11 | 9 | @gusttavinho6852 (3), @SsmileYtofc (2), @Xchamuel.e.casaca, @Davi123-c9o, @Theozinho_gamer1 | 22/10 | Parecido com o Envenenador (morte atrasada) | Impostor que morde e a vítima "morre 5s depois" (5 tiques); versão neutra que suga todo mundo | 4 (duplica o Envenenador) |
| 7 | **Vidente / Profeta / Telepata / Fofoqueiro / Psíquico** | 11 | 3 | @guilhermgpd2 (Vidente, Psíquico, Profeta), @EnzoBatistaCosta-x5h, @RedstoneRebelde (Clarividente, "Dia 2 pedido"), @lucasKS-MF, @JoãoMiguelMoura-q2i | 22/10 | Não (Detetive vê 3 suspeitos, Cientista vê vivo/morto) | "telepata, duas vezes na partida, ele pode olhar o pensamento de alguém"; "fofoqueiro (tripulante) q pode ver o pensamento secreto de alguém"; Psíquico recebe 4 suspeitos (3 inocentes, 1 matador); Vidente vê o time ou a função exata | **8** |
| 8 | **Vírus / Parasita** | 10 | 6 | @jorginhorainbowfriends (2), @Lolzinpvp, @tiagkinger, @41v5_J, @Bachari_071 | 22/10 | Não | Neutro: "quando ele matar alguém ver reportar ele fica do lado dele" (quem reporta o corpo vira do time dele) | 7 |
| 9 | **Policial / Delegado / Carcereiro** (prende, desativa) | 9 | 26 | @Samuzin-Gamer-2014 (23: "delegado (desabilita qualquer ação de uma pessoa)"), @Ponto-Final-Sem-Final (12 comentários), @abejoga, @CristianoSilva-r3i, @moisesknvetz (Polícia Corrupto) | 22/10 | Não (Xerife só atira; Chato desativa, mas é impostor) | "pode atirar 1 VEZ (ou 2 se acertar o impostor) se ele errar ele morre"; "pode prender até 4 pessoa/IAS em uma sala e confiscar elas (20s na sala)"; versão do @abejoga: prender numa jaula | **8** |
| 10 | **Fênix / Morto-vivo / Segunda vida / Sortudo / Imortal** | 9 | 3 | @Ben_e_Teo (Fênix, 3 vídeos), @epeoovo, @gabrieltorres2227, @guilhermgpd2 (Sortudo, Imortal), @Drago.3004 | 22/10 | Não (Doutor revive os outros; Possuidor volta uma vez) | "uma tripulante que tem duas vidas"; "morto-vivo onde quando morre pode reviver uma vez"; Sortudo "25% de esquivar de um ataque" | 7 |
| 11 | **Advogado** | 6 | 2 | @Água_morta-ofc, @Ale0608-AMong, @41v5_J, @Creppergameghm, @JoãoMiguelMoura-q2i | 22/10 | Não | Neutro que "tem que ajudar os impostores sem eles saberem quem ele é"; ou impostor que "defende com provas falsas"; ou fantasma que dá escudo de expulsão | 8 |
| 12 | **Armadilheiro-impostor / Minador** (minas, armadilhas) | 9 | 17 | @arthurjosemartinsoliva3648, @AleatórioDasAleatoriedades, @EduardoPrado-qm3os, @maskin-j3y, @itzgreenish (15/10, o mais antigo) | 15/10 | Não (o Armadilheiro que existe é tripulante de vingança) | Impostor que não esfaqueia: "coloca mina no chão", quem pisa morre/fica parado 7 tiques | 6 |
| 13 | **Conjurador / Amaldiçoador** | 7 | 4 | @adrianasampaio144 (3 vezes), @Maxwell2-67, @SsmileYtofc, @LilianVasconcelos-z9r8h | 22/10 | Parecido com Envenenador e Bombardeiro | "bota uma maldição na pessoa e depois de 10 segundos ela morre" | 4 |
| 14 | **Coveiro / Cola-corpo** | 7 | 2 | @Xchamuel.e.casaca, @Davizimamongusyt (cola-corpos em 3 vídeos), @NetheritaCraftBr, @M3lado_plog | 22/10 | Não (Faxineiro some com corpo) | Mexe nos corpos: leva para outra sala, "coloca o corpo em 1 tripulante" | 6 |
| 15 | **Hacker / Eletricista / Piloto / Bombeiro** (tripulante) | 7 | 8 | @AleatórioDasAleatoriedades, @JoãoMiguelMoura-q2i, @Xchamuel.e.casaca | 22/10 | Não | Conserva sabotagem de longe ou paralisa um impostor ao concluir tarefa | 4 |
| 16 | **Assobiador (Whistle)** | 6 | 13 | @ADumbyDummyYT (13), @ItaloIan-p8m, @CarolinaAraujorodrigues-uw7xi | 22/10 | Não | Impostor que, quando mata, "assobia pros impostores" e eles veem o local do corpo; versão que manda **fotos falsas** aos tripulantes | 7 (foto falsa) |
| 17 | **Mineiro** (cria dutos) | 6 | 9 | @arthurjosemartinsoliva3648, @fatal_t, @guilhermgpd2, @MichaelJacksonbilliejean123 | 22/10 | Não | Cria dutos onde não existem; impostor ou tripulante | 5 |
| 18 | **Trabalhador / Contra o tempo** | 6 | 11 | @Benjatricolor (7), @Pursuer_M4, @LorenzoAlves-b6b | 22/10 | Não | Tem tarefas demais; se terminar todas "os Tripulantes ganham instantaneamente" | 5 |
| 19 | **Sombra / Camaleão** | 6 | 6 | @AleatórioDasAleatoriedades, @wither_storm-resenha | 22/10 | Não | "Toda vez que ele mata, todos na sala ficam cegos"; camaleão deixa todos cinza | 5 |
| 20 | **Trocador de votos / Ladrão de votos / Oportunista** | 6 | 3 | @Opabom27 (2 vídeos), @luquinhasnerd, @kalelmashup367 | 22/10 | Não (Juiz anula, Prefeito vale 2) | "trocar todos os votos de uma i.a para outra i.a"; Ladrão: "quem ele mata ele ganha um voto extra"; Oportunista vence com quem ganhar | 7 |
| 21 | **Paranoico / Sirene** | 6 | 6 | @AleatórioDasAleatoriedades, @guilhermgpd2 | 22/10 | Parecido com o Prefeito/botão | Convoca reunião de qualquer lugar (3 vezes) | 4 |
| 22 | **Juggernaut / Assassino em série / Vigarista** | 5 | 2 | @guilhermgpd2, @Matheusbom-t5v, @Brick_Bah | 22/10 | Parecido com Paciente/Piromante | Neutro que "a cada kill ele fica mais forte, menos tempo de morte" | 5 |
| 23 | **Presidente / Ditador / Senador** | 4 | 3 | @teapot_games, @guilhermgpd2, @gkprimeAnoni | 30/10 | Parecido com o Prefeito | Escolhe alguém para uma eleição de dois; forçar segunda votação | 6 |
| 24 | **Infiltrado** (tripulante que os impostores veem como parceiro) | 3 | 9 | @Benjatricolor (7), @maskin-j3y, @ryanphpjs | 22/10 | Não (o Traidor é neutro e mata impostor) | "os impostores vem ele como impostor e ele pode ver o chat dos impostores" (sem ver quem mandou) | **8** |
| 25 | **Cupido / Romântico** (une um par) | 2 no Among (+2 no Lobisomem) | 0 | @JarcielTrajano (4 vídeos), @Miranha-6; no Lobisomem @Susgetoesparaofelipexx | 22/10 | Não (o Casal é sorteado, ninguém escolhe) | Neutro/qualquer time que escolhe o par; resposta do dono no Lobisomem: "ia ser muito engraçado se o cupido atirasse no bobo" | 7 |
| 26 | **Cartógrafo / Biólogo / Percebedor** | 2 | 6 | @guilhermgpd2 | 22/10 | Parecido com Perito | Marca uma área e vê quem passou; investiga corpo | 5 |
| 27 | **Mestre do Tempo** | 2 | 1 | @guilhermgpd2, @Miranha-6 | 30/10 | Não | Rebobina o tempo (1 tique) | 5 |
| 28 | **Peidão** (gag) | 2 | 13 | @Conselhos_doChatGPT (10), @HinoManiaOficial | 30/10 | Não | Impostor que "a cada 10 tiques solta um peido"; cada 2 peidos, cooldown extra | 3 (gag) |

Excluí do ranking os pedidos que são de **outro jogo** (Lobisomem: Padre, Bardo etc.) e os que são só pedidos de "coloque a função X" sem descrever nada.

### 1B. Já existiram (para decidir o que volta ao pool do AU7)

Pedidos = quem pediu antes da estreia (entre parênteses, todos que citam a função até 11/11).

| Papel | Pedidos | Likes | Quem pediu | Mais antigo | Estreou | O que faz hoje |
|---|---|---|---|---|---|---|
| **Glutão** | 27 (32) | 16 | @RuiSoares-rv1ni (7), @LilianVasconcelos-z9r8h, @ViniFutbolOficial, @PumpkinAabobora | 22/10 | AU4, no pool do AU5 | Neutro assassino que devora, sem corpo |
| **Víbora** | 21 (25) | 14 | @AXIN425 ("vibora coloca vibora 2 vez tentado"), @MateusWT10, @Arbusto_da_Selva, @ebacaciones | 15/10 | AU5 | Corpo derrete e some |
| **Anjo da Guarda** (fantasma) | 14 (19) | 7 | @ZYX-DDFloornoir, @Arbusto_da_Selva, @PumpkinAabobora, @EDEV.Documentando | 15/10 | AU4 | Fantasma que dá escudo |
| **Palhaço** | 11 (43) | 48 | @aktuk1 (45 lk), @ZYX-DDFloornoir, @LELOHJ, @eusouoking | 15/10 | AU3 | Neutro: expulso, vence sozinho |
| **Influencer / Fotógrafo** | 11 (33) | 176 | @starry_raffa (168 lk), @AlanMateus-i9b, @Player15178 | 15/10 | AU3 (fantasma no AU4) | Foto da sala / recado do além |
| **Zumbi** | 10 (14) | 4 | @mr.trollermen, @eduardo34250, @JarcielTrajano, @ADFrealofc | 22/10 | AU6 (modo especial; **pedido era para o modo clássico**) | Modo próprio com 20 IAs |
| **Casal** | 9 (14) | 81 | @LionelMessi1930-pal (47 lk), @Samuzin-Gamer-2014 (23), @guilhermgpd2, @Koi_kamu | 22/10 | AU4 | 2 jogadores, se um morre o outro morre |
| **Doutor** | 7 (9) | 20 | @LELOHJ (16 lk: "FUNÇÃO: DOCTOR"), @Davizimamongusyt, @Anaj_ns2 | 15/10 | AU5 | Carrega corpo até o Laboratório e revive |
| **Juiz** | 6 (21) | 177 | @starry_raffa (168 lk), @redstone-yt32, @abejoga | 15/10 | AU3 | Anula uma votação |
| **Bombardeiro** | 6 (9) | 2 | @manodoRoblox-d8p (passar a bomba como batata quente), @Matheusbom-t5v | 22/10 | AU4 | Planta bomba |
| **Traidor** | 6 (11) | 13 | @Benjatricolor, @PablixgJw (agente duplo, 6 lk), @Salatieloriginal | 22/10 | AU5 | Neutro infiltrado |
| **Sobrevivente** | 5 (14) | 49 | @LionelMessi1930-pal (47 lk), @LorenzoPires-q6z | 22/10 | AU4 | Vence se vivo (junto com o time vencedor) |
| **Canibal** | 5 (12) | 31 | @Samuzin-Gamer-2014 (23), @MateusWT10 (6) | 22/10 | AU4 (fora do pool do AU5) | Come corpos |
| **Piromante** | 4 (8) | 3 | @Pandiinnn, @marcofceditsさ, @MIGUELITO-jjs | 22/10 | AU4 | Gasolina e incêndio |
| **Segurança** | 2 (13) | 11 | @manodoRoblox-d8p (câmera com bateria), @BernardoSangalli (espalhar 3 câmeras) | 15/10 | AU3 | Vê câmeras |

Sem pedido novo mas citados por quem quer de volta: Chato, Armadilheiro, Camuflador e Paciente (todos criados por @francesbrasileiro e @mr.trollermen e já usados no AU5); Chantagista (o "Silenciador" do @CAFEZIN-K, no AU4). Entre as funções do zumbi só o Doutor tem pedido de fã; Vigia, Engenheiro e Enlouquecido não foram pedidos nos comentários.

---

## 2. Top 5 MELHORES ideias de papel (não só as mais pedidas)

Critério: cria **mentira conferível na tela** (o espectador sabe o segredo e vê a IA errar ou enganar), não duplica função que já existe, dá uma cena de 15 s com virada e funciona com a regra "cada IA só conhece a própria função, mas sabe a lista de funções da partida".

### 1. Carrasco (neutro com alvo secreto) + o gag Cianofóbico
- **Pedidos:** 11 pessoas, em 3 versões que dão a mesma partida. @Pursuer_M4: "Carrasco, ele receberá uma mensagem secreta no início da partida dizendo quem é o seu alvo, o Carrasco precisa espulsar o alvo antes que ele seja morto pelos Impostores." @CarlosRaphaelLemesMedeiros: "Colocar a função de EXECUTOR. o executor recebe um alvo (ele pode ser tripulantes,impostor ou neutro) ele precisa que seu alvo seja votado por fora.para vence FUNÇÃO NEUTRA". @Davinichetti: "Dia 3 pedindo a Função CIANOFOBICO ... Objetivo-expulsar o ciano".
- **Por que rende:** o Palhaço (que a comunidade amou: "O palhaço doidão", Palhaço do Roxo ganhando como Juiz) mostra que IA fingindo para ser expulsa vira o melhor momento do episódio. O Carrasco é o inverso: **acusa um inocente com argumento convincente**, e o espectador vê o alvo na tela ("ALVO: Rosa") enquanto a IA diz "eu sempre desconfiei do Rosa". Dá selo de contraste fala x realidade e cena de "ela mente bem demais".
- **Cianofóbico = o alvo é sempre o Ciano.** Casa com a piada da comunidade: "Até as IAs tem cianofobia?" e a resposta do dono "ciano é sempre o impostor". Se o Ciano for inocente e o Cianofóbico acabar com ele, é o final de parte mais engraçado de todos.
- **Regra segura:** se o alvo morrer antes, o Carrasco vira Sobrevivente (o @guilhermgpd2 sugere "receber outro alvo ou mudar de função"). Nunca o Palhaço como alvo (regra do @Pursuer_M4).

### 2. Ladrão de função (neutro; troca de função com um cadáver) / Sósia
- **Pedidos:** 17 pessoas, o grupo mais numeroso entre os que não existem. O comentário mais curtido: @the_Harix777 (8 lk) "Um neutro q troca de função com um cadáver e muito boa". @Lolzinpvp (6 lk): "ladrão (rouba a identidade de quem mata)". @MateusWT10: Sósia que "se transforma na pessoa que matou e o corpo vira o corpo antigo dele".
- **Por que rende:** quando o Xerife morre e o Ladrão vira Xerife, as duas IAs dizem "sou o Xerife". Só o espectador sabe quem é de verdade. É o Metamorfo (que já rendeu o vídeo "uma IA copiou a cara das outras") só que com **função** em vez de **cara**, e a lista de funções da partida (que as IAs conhecem) torna a mentira checável: "o Xerife morreu na rodada 2".
- **Regra:** só troca com corpo **não denunciado** (a dica do próprio dono ao Possuidor: "corpo fresco") e o Ladrão ganha com o time da função roubada (resolve o "como ele ganha?" que o dono perguntou ao Camuflador).

### 3. Vidente do pensamento (Telepata / Fofoqueiro)
- **Pedidos:** 11 pessoas. @lucasKS-MF: "ideia de função: telepata,duas vezes na partida,ele pode olhar o pensamento de alguém,depois não pode mais". @JoãoMiguelMoura-q2i: "o fofoqueiro (tripulante) q pode ver o pensamento secreto de alguém". @professorviniciussilveira: "o leitor de mentes ve o pensamento dos tripulantes".
- **Por que rende:** o canal já mostra o pensamento secreto com ECO. Aqui a **IA lê o pensamento do impostor** e tem que decidir se conta ("ele pensou que ia matar o Rosa") ou se isso a entrega ao assassino. O público vê o pensamento duas vezes (no clipe do alvo e na boca do Vidente) e decide se a mentira bate. Os outros não acreditam (padrão "o Detetive foi expulso por falar a verdade").
- **Regra:** 2 usos, mostra o **último** pensamento (não o plano) e some se o alvo for impostor Faxineiro/Espectro (a "Psíquico" do @guilhermgpd2, 4 nomes com 1 matador, é a versão suave).

### 4. Infiltrado (tripulante que os impostores veem como parceiro)
- **Pedidos:** 3 pessoas, mas é o mais forte em cena. @maskin-j3y: "inocente infiltrado os impostores vem ele como impostor e ele pode ver o chat dos impostores só que só duas primeiras mensagens da rodada". @ryanphpjs: "o Infiltrado (Tripulante), os impostores o enxergam como um deles".
- **Por que rende:** o chat dos impostores é o trecho mais engraçado dos vídeos (eles "falam que mataram sem ter matado", cinco pessoas pediram para consertar isso). O Infiltrado **ouve tudo e ninguém acredita nele**: o Detetive expulso por falar a verdade foi o título do AU2. O espectador sabe que o Infiltrado está certo e ainda assim a votação o expulsa.
- **Diferença do Traidor:** o Traidor (neutro) mata impostor; o Infiltrado é tripulante, só fala (@mazola-l1b já reclamou que o Traidor "é só ele dizer quem são os impostores": aqui isso é o conteúdo).

### 5. Policial (prisão) + gag "Dia N pedindo"
- **Pedidos:** 9 pessoas; o texto completo do @Ponto-Final-Sem-Final é copiado em 10 vídeos: "Dia 10 pedindo pra ele fazer uma função neutra:  Polícial Oq ele faz:ele pode atirar 1 VEZ (ou 2 se acertar o impostor) se ele errar ele morre outra função:ele pode prender até 4 pessoa/IAS em uma sala e confiscar elas (20s na sala)". @Samuzin-Gamer-2014 (23 lk): "delegado (desabilita qualquer ação de uma pessoa)".
- **Por que rende:** (a) cenário **visual** (jaula em SVG, IA presa que não pode falar na reunião); (b) **resolve o Xerife que nunca atira** (@Incognythuz e @viniciuspereira6364 notaram, "o xerife não dá um tiro sequer"): prender é uma ação que a IA aceita fazer; (c) o fã tem 12 comentários e a entrega é a gag "Dia 12: pedido atendido" mais fácil do vídeo.
- **Regra:** só a versão **prende** (sem atirar), 20 s ou até a próxima reunião, e o preso fica calado (reaproveita o efeito do Chantagista).

**Menções honrosas (ordem de rende):** Advogado (8), Vírus/Parasita (7: "quem reporta o corpo vira do time dele" faz as IAs hesitarem em denunciar), Trocador de votos (7), Fênix (7: "alibi impossível"), Cupido (7, o dono já disse que adoraria "atirar no bobo"), Assobiador com foto falsa (7).

**Evitar (duplicam o que já existe):** Vampiro (Envenenador), Conjurador (Bombardeiro/Envenenador), Juggernaut (Paciente), Presidente (Prefeito), Mineiro (mapa não suporta), Sniper (a falha mais reclamada é impostor matar na frente de todos; um Sniper piora).

---

## 3. Pedidos de modo de jogo, mapa e regras (com contagem)

### Mapas
| Pedido | Pessoas | Observações |
|---|---|---|
| **Polus** | 14 antes do AU5 (45 comentários) | **Feito no AU5.** @David_alves-p1f pediu em 3 vídeos (39 comentários) |
| **Mira HQ** | 15 | **Feito no modo zumbi.** @guilhermgpd2: "Obrigado por colocar 20 players e mira hq"; @MonteiroRodriguesmonteiro: "obrigado por colocar o mira hq". Continua pedido para o **Among clássico** |
| **Airship** | 10 | @Davizinhoeasdolls "Adiciona o mapa Airship?" (4 lk, 08/11), @JoãoPedrozxe, @MonteiroRodrigues..., @Bencsps, @ebacaciones ("meu mapa favorito") |
| **The Fungle** | 8 | @Yokwu_mdt "FAZ O MAPA THE FUNGLE!!!", @Stuemcena, @guilhermgpd2 |
| **Submerged** | 2 | @guilhermgpd2, @MiGg-e7w |
| Rodízio de mapas / mapa novo próprio | 12 | @guilhermgpd2 "fazer um rodízio de mapas"; @CAFEZIN-K "um mapa seu mesmo"; @Mr_Silarity "Cria um mapa chamado acampamento"; @Bernardorubl "sala nova, a Cantina" |
| Redesenhar o mapa para ficar igual ao jogo | 4 | |

### Número de jogadores e impostores
| Pedido | Pessoas | Observações |
|---|---|---|
| **20 ou mais IAs** (20, 21, 25) | 18 (70 likes) | **Feito no zumbi (20)**. @RealyoSyz_BR (35 lk): "Coloca 20 IA com 5 impostores KKKKKKKK" (dono: "aí sim seria um caos"). @Samuzin-Gamer-2014 (23 lk) "o máximo de 20 pessoas". @Davizimamongusyt: "OK TENTEI GALERA 20 IAS NAO FOI" |
| **Mais impostores** (4 ou 5, "mais 4 para dar mais chance") | 11 (39 likes) | O AU5 já tinha 4 impostores com 18 IAs |
| 100 IAs / 25 IAs | 3 | Piada de escala |

### Modos de partida
| Pedido | Pessoas | Detalhe |
|---|---|---|
| **Esconde-esconde (hide and seek)** | 11 | @deboralouvatto5279: "19 tripulantes 1 impostor os tripulantes se transformam nos objetos da nave... 10 tiques para os inocentes se esconderem e 50 pro impostor". @QuetiMoreiraPereira: "ninguém pode chamar reunião nem reportar e só tem 1 impostor e todo mundo sabe quem é". Sem resposta do dono |
| **Jogar contra/junto das IAs, baixar o jogo, GitHub** | 17 | Dono: "pretendo disponibilizar o jogo e a possibilidade de jogar no futuro" e "Pretendo fazer sim" (jogar Among com as IAs, 08/11) |
| **Não revelar a função (ou o time) de quem é expulso / do impostor no fim** | 10 (13 lk) | @HerzMayhem: "remove a possibilidade das IAs saberem qual era a função do personagem expulso. Isso deixa tudo mais louco kk"; @PierrePixelReenventando: "em algumas partidas não revela os impostores" (dono: "deixar o mistério até o final vai ficar bem daora") |
| **Modo cavalo** (update de Halloween do jogo) | 5 | @guilhermgpd2 pediu 3 vezes |
| Modo Zumbi **no clássico** | 10 (14) | @mr.trollermen (10 lk): "Quando eu pedi a função do zumbi, seria mais para o modo clássico mesmo, mais isso ficou 100x MELHOR  Isso poderia até virar um modo oficial do canal, ai seria um video de among normal e outro de modo zumbi" |
| **Modos novos do @guilhermgpd2**: todos contra todos, batata quente, caça-bandeira, **chuva de meteoros** ("o mais legal"), onda de ácido | 2 | Só ele pede, mas com o texto mais completo; sugere "1 partida de cada modo" como bônus |
| Trimpostor | 2 | Um tripulante comum que mata quem estiver perto ao fazer tarefa |
| Times de 4 / 4 times (humanos, zumbis, vampiros, impostores) | 2 | @Samuzin-Gamer-2014, @CarlosAssaf ("um baita apocalipse") |
| Humano jogando no meio das IAs | 3 | @Erauker, @user-lw2eu4hx3p |

### Regras e ajustes
| Pedido | Pessoas | Situação |
|---|---|---|
| **IA mata/transforma/fica invisível na frente de todos** | 10 | Reclamação mais repetida. Ainda pendente |
| **Impostores raramente usam a habilidade** (76 lk, @manodoRoblox-d8p) | 1 + 4 que concordam | Dono: "vou deixar mais bem explicadinho" (feito no AU3) |
| Xerife poder matar neutro | 13 | Feito no AU4 |
| Sem trancar porta na sabotagem | 13 | Feito no AU4 |
| Mais tarefas (impostores perdem sempre) | 5 | Dono: "Vou fazer no próximo KAKAKAKA... Não aguento mais ver esses tripulantes ganhando toda hora" |
| Novas sabotagens (comunicação, autodestruição, oxigênio) | 8 | Reator e O2 já existem; comunicação está em discussão |
| Impostor não mentir no chat dos impostores ("falar que matou sem ter matado") | 5 (11 lk, @reverso_2244) | Pendente |
| Cartão/tela com resumo das funções para o público e as IAs | 11 | "não entendi as novas funções" (@the_Harix777); dono prometeu explicar menos rápido |
| Mostrar a função/cor ao lado do nome na reunião | 5 (18 lk) | |
| Chat dos fantasmas | 4 | Dono recusou no AU4; Influencer Fantasma faz esse papel |
| Debate das IAs sobre a partida no fim | 3 (13 lk) | @atelmou "Conversas... tipo Felipe Neto" |
| Modificadores além de função (Sortudo, Preguiçoso) | 1 (@guilhermgpd2, 7 comentários) | Casal já virou "modificador" |
| Nerf do Influencer Fantasma ("muito direto, roubado") | 6 | Pendente |
| Detetive "apelão" / Xerife "medroso" | 5 | Parcialmente feito |

### IAs novas (fora do pedido, mas aparecem muito)
Gemini de volta 15 pessoas (34 likes: @CAFEZIN-K 16, @Lolzinpvp 13; o próprio @luizsvicent4040 "Dia 02 pedindo o Gemini de volta."), Dola/Luzia/Meta AI 16, Copilot 6, Grok 3. O elenco do AU7 é o do zumbi, então vale uma linha no vídeo explicando por que o Gemini não está.

---

## 4. Promessas do dono nos comentários

Datas do scraper (arredondadas para a semana nas mais velhas). `→` marca o que já foi cumprido, conferido em `descricao_au*.md` e `funcoes_ep4.md`.

### Ainda não cumpridas (cobrar no AU7)
| Data | Vídeo | Resposta do dono (copiada) | A quem |
|---|---|---|---|
| 07/11 | Zumbi | "É porque esse aqui era um episódio especial, aí a maiorias das sujestões não entraram, entretanto, na parte 6(a normal) vai ter sim mn" | @JoãoMiguelMoura-q2i ("Tu não botou né? :(", funções Bombeiro, Hacker, Eletricista, YouTuber, Gamer, Anjo do mal, Parasita) |
| 08/11 | Zumbi | "Caramba mano, MUITO OBRIGADO, de verdade mesmo, vou me esforçar ao máximo pra adicionar todas as sua funções" | @guilhermgpd2 (cerca de 40 funções; entre elas Sortudo, Preguiçoso, Admin, Assombração, Cartógrafo, Biólogo, Psíquico, Vidente, Seguidor, Mestre do Tempo, Imortal, Profeta, Copiador, Carrasco, Silenciador, Astral, Paranoico, Assistente, Ditador, Quimera, Mineiro, Vigarista) |
| 08/11 | Zumbi | "Pretendo fazer sim, seria muito divertido" | @Stuemcena (vídeo onde o dono joga Among com as IAs) |
| 29/10 | AU4 (para o AU5) | "Terça feira que vem, já pode esperar" / "Ja tá anotado pro próximo EP, pode ficar tranquilo (vai ser focado inteiramente nele inclusive)" | @David_alves-p1f (Polus). **Cumprido no AU5** |
| 31/10 | AU5 | "Esqueci, no próximo EP terá novamente" | @crhomnsfw (MVPs). Pendente se o AU7 não tiver |
| 29/10 | AU5 | "É que tem MUITA função pra fazer akakakakk, mas no próximo EP pode esperar" | @EliasSantos-m6c ("Por que você não fez minhas funções que eu criei?" Anonimador, Ceifador, Coveiro, Pintor, Trocador, Justiceiro, Anjo) |
| 29/10 | AU5 | "dá próxima vez eu vou fazer mais nem explicadinho" (sic; quis dizer "mais explicadinho") | @the_Harix777 ("não entendi as novas funções") |
| 22/10 | AU3 | "Os projetos ainda estão no início, então pretendo disponibilizar o jogo e a possibilidade de jogar no futuro!" (repetido em 5 respostas) | @d3d3-hb6do e outros |
| 08/11 | Zumbi | "eu pretendo futuramente fazer um vídeo de tutorial (talvez em forma de shorts)" | @HanesBLS (também 22/10 e 09/11 para outros) |
| 04/11 | Lobisomem | "CARAMBA, quanta função top! Vou salvar esse comentário aqui pra usar de inspiração nas próximas partes" / "vou anotar todas as suas sugestões de funções para incluir na próxima parte" / "quando tiver a parte 3 vou com certeza por isso" (Cupido) | @kalelmashup367, @EnzoBatistaCosta-x5h, @Susgetoesparaofelipexx (Lobisomem, não o Among) |
| 22/10 | 2h5X | "Vou começar a usar mais a aba comunidade pra gente trocar ideias de novas funções sim" / "vou tentar ver como eu libero pra vcs postarem" | @Lucss144 |

### Já cumpridas (selo "pedido atendido")
| Data do pedido | Promessa | Entregue em |
|---|---|---|
| 15/10 | "no próximo vídeo com certeza adicionarei o influencer" | AU3 |
| 15/10 | "Já tá anotado pro próximo vídeo" (Juiz, @cookie_bonitinha) | AU3 |
| 15/10 | "Vou adicionar" (Palhaço, @LELOHJ) | AU3 |
| 15/10 e 22/10 | "Seria bem daora colocar a víbora mesmo"; "vou tentar colocar o silenciador" | Víbora no AU5, Chantagista no AU4 |
| 22/10 | "no próximo ep vou colocar a função fantasma, e AI sim, eles vão continuar ativos" | AU4 |
| 15/10 | "No próximo vídeo não vai ter mais dessa de cada uma só sabe sobre o próprio papel" | AU3 em diante |
| 15/10 | "Detetive nerfado na próxima" | AU3 |
| 22/10 | "Vou adicionar sim, já tá vindo no próximo vídeo" (chapéus) | AU4 |
| 29/10 | "Tipo um traidor né??? ... posso colocar no próximo vídeo" (@PablixgJw) | Traidor no AU5 |
| 29/10 | "Camuflador é legal, só falta... como ele ganha? ... entra na lista... junto com o Paciente" | Camuflador e Paciente no AU5 |
| 22/10 | "no próximo vídeo vc vai aparecer com certeza" (@FAMILIAGMS) | AU4 ("Eu finalmente poderei descansar em paz...") |
| 29/10 | "Fechou mn, ... no próximo EP isso já vai ser corrijidi" (Possuidor) | AU5 |
| 05/11 | Bombanana (@AlgoFracassadoYT, "Dia 3 pedindo") | Vídeo de 05/11 |

**Perguntas do dono ainda sem resposta:** condição de vitória de papéis novos (ele perguntou ao @mr.trollermen "como ele ganha?"). Boa regra para o AU7: só entra papel com condição de vitória escrita pelo fã.

---

## 5. Fãs recorrentes (para virar gag ou selo "ideia de @fulano")

249 dos 769 autores comentaram em 2 ou mais vídeos. Os que mais voltam (comentários / vídeos diferentes):

| Fã | Comentários / vídeos | Likes | Assinatura | Sugestão de gag |
|---|---|---|---|---|
| **@guilhermgpd2** | 139 / 4 | 30 | Lista de ~40 funções, modos, Mira HQ, 20 jogadores, "Nenhuma função que pedi... 😢", "Por favor coloque todas as funções que pedi" | Selo "ideia de @guilhermgpd2" em 2 ou 3 funções; Mira HQ e 20 já entregues; gag do contador de pedidos |
| **@Ponto-Final-Sem-Final** | 12 / 10 | 4 | "Dia N pedindo ... Polícial" (Dia 2, 3, 4, 6, 10) | **Entregar o Policial e abrir o vídeo com "Dia 12: pedido atendido"** |
| **@David_alves-p1f** | 39 / 3 | 2 | "Coloca o mapa POLUS!" ("Pq não colocou o mapa POLUS 😭") | Atendido no AU5; cabe um "retorno do David" |
| **@spectra-wotblitz** | 26 / 17 | 12 | "Mano faz o clone que se duplica e pode estar em 2 lugares" (4 vezes) | Dar o Clone/Ladrão e creditar |
| **@alinematos7396** | 17 / 15 | 1 | "Dia 1 pedindo ... jogo do artista copião", "Comentando pra cumprir a promessa" | Gag do contador |
| **@FAMILIAGMS** | 32 / 14 | 51 | "eu sou um stalker man, primeiro fixa"; já apareceu no AU4 | Recorrente do vídeo; "stalker oficial" |
| **@Lucss144** | 25 / 14 | 17 | Autor do post da comunidade do Possuidor; quer ser citado no AoE4; ideia do Sósia | "ideia de @Lucss144" (Possuidor já entrou); cobrar Sósia |
| **@mr.trollermen** | 18 / 11 | 42 | Criou Camuflador e Paciente, pediu zumbi clássico; "eu junto 5 celulares" | Selo duplo; dono já respondeu "ideia anotada" |
| **@LELOHJ** | 14 / 10 | 26 | Criou o Doutor ("FUNÇÃO: DOCTOR", 16 lk), pediu Palhaço e a parte 3 | Selo "ideia de @LELOHJ" no Doutor |
| **@Lolzinpvp** | 18 / 13 | 42 | Ladrão de identidade (6 lk), Vírus, "Dia ... Gemini caro" | |
| **@CAFEZIN-K** | 11 / 13 | 28 | Feedback longo, Gemini (16 lk), Silenciador | |
| **@NathanResende-r8i** | 9 / 14 | 46 | Mágico, Canibal neutro, "Xerife mata neutro" (24 lk), "MINHA FUNÇÃO PREFERIDA VAI CHEGAR" | Criador de regra aceita (Xerife mata neutro) |
| **@EnzoBatistaCosta-x5h** | 15 / 6 | 5 | Padre, Profeta, Vidente espiritual, Sobrevivente; "Ele leu meu comentario😮" | |
| **@Davizimamongusyt** | 8 / 5 | 10 | CAIXA ALTA: "COLOCA 20 IAS", "3 SERÁ VEZ QUE EU TE PEÇO", "OK TENTEI GALERA 20 IAS NAO FOI" | Gag de legenda em caixa alta |
| **@fireyjr-r1x** | 18 / 5 | 4 | "ADICIONA BANANA" (13 vezes, "pedi 28 vezes") | **Atendido**: Banana, Caqui e Rose (AU5) |
| **@luizsvicent4040** | 5 / 5 | 2 | "Dia 02 pedindo o Gemini de volta." | Gag do contador |
| **@JoãoMiguelMoura-q2i** | 15 / 5 | 5 | "Tu não botou né? :(" e "põe o Hacker" | Dono prometeu "parte 6 vai ter sim" |
| **@manodoRoblox-d8p** | 33 / 5 | 141 | Feedback de balanceamento (76 lk) e Segurança com bateria | Voz de crítica; Segurança já entrou |
| **@Xchamuel.e.casaca** | 13 / 3 | 15 | Spam de comentários curtos pedindo resposta; Vampiro, Sniper, Coveiro | |
| **@starry_raffa** | 1 / 1 | 168 | Juiz + Influencer (maior comentário de função) | Selo "ideia de @starry_raffa" |
| **@LionelMessi1930-pal** | 1 / 1 | 47 | Casal, Sobrevivente, Perito (os três entraram no AU4) | Selo triplo |
| **@Samuzin-Gamer-2014** | 2 / 2 | 24 | Canibal, Casal, delegado, 20 pessoas | Selo "Canibal" + cobrança do delegado |
| **@Pursuer_M4** | 8 / 7 | 28 | Jester (entrou), Carrasco, Vampiro neutro, Trabalhador | Selo no Palhaço |
| **@itzgreenish** | 6 / 4 | 4 | "ele colocou minha função do envenenador aeeee" | Selo no Envenenador |
| **@francesbrasileiro** | 6 / 5 | 6 | Chato e Armadilheiro (entraram) | Selo duplo |

Frases de fãs que viram placa ou meme:
- **"cianofobia":** @OtavioSouzadosSantos-ms2we (21 lk, Short): "Ate o bot tem cianofobi-"; @Eu_Erikulas (8 lk): "0:06 ALERTA DE CIANOFOBIAAAAAAAAAAAAAAAAAAAAAA". Dono: "não tem jeito, ciano é sempre o impostor akakak".
- **"Zé Botão":** @EnzoPax: "Já se for humanos e alguém apertar o botão vão falar 'Zé Butão'"; @Zaack0707: "que bom que não tem zé botão".
- **"Dourado foi o GOAT":** @nicolas_ent_170; @veteryuu_: "O dourado: vou regar as plantas 😃😃😃" (Liquid no zumbi).
- **Azul GOAT da temporada:** @PablixgJw (83 lk, AU2).
- **Bardo acusando o bardo:** @mr.trollermen no Lobisomem (GPT: "faz as maiores jogadas mais tbm as maiores cagadas").
- **Carta formal do @Clavin3t** (Clash Royale) e a resposta formal do dono: já é gag do canal.

---

## Pontos para decidir (pelo dono)

1. Quantas funções novas no AU7: o AU5 colocou 7 novas, pool de 32. Os fãs cobram "todas as minhas".
2. Se o AU7 usa o mesmo pool do AU5: Canibal e Faxineiro ficaram de fora; Víbora, Doutor, Camuflador, Paciente, Traidor, Chato e Armadilheiro estão dentro.
3. Qual mapa: no clássico, Polus já saiu; Mira HQ já saiu no zumbi; Airship é o próximo mais pedido (10), depois Fungle (8).
4. Primeira cena do vídeo (CLAUDE.md pede clímax em ~10 s): o Carrasco acusando o Ciano inocente, ou o Policial prendendo o impostor na frente de todos, rendem a abertura.
