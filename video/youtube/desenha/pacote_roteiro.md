# Pacote de roteiro: Desenha e Adivinha (10 IAs, "Gartic" nosso, 20 desenhos) — ideia do Felipe

Para o Fable (storyboard). Fontes: `desenha/logs/partida1.json` (fonte de verdade: traços, pensamento do desenhista, reação, palpite/chat/pensamento/ms de cada uma das 9 que adivinham, dica de cada tique), `desenha/logs/partida1.txt` (só palpites, sem pensamentos, e usa COR no lugar do nome), `desenha/REGRAS.md`, imagens em `desenha/logs/partida1/`. Citações entre aspas curvas são copiadas do json e foram conferidas por script (ver "Conferência"). Notação: **D12 t3** = desenho 12, tique 3. A reação do desenhista no tique N só é vista no tique N+1.

Regras do canal que valem aqui: NARRADOR = O FELIPE, sempre em 1ª pessoa ("eu coloquei", "eu criei o jogo", "eu dei a palavra"), nunca "o Felipe"; a ideia do vídeo é dele ("Coloquei 10 IAs pra jogar Gartic" é o deck de ideias dele; não há crédito a fã); sem emoji (selos, balões, dicas, lápis, medalhas, placar em SVG); pensamento das IAs = voz normal COM ECO, nunca sussurro; o narrador nunca diz nem sugere que é uma IA; Haiku e Sonnet são dois concorrentes como os outros (sem torcida); clímax nos primeiros ~10 s; melhor parte por último; jargão fora da voz; fechar com pergunta; sem transição de lobby. Ao escolher/mostrar as IAs, `video/IAS_FAVORITAS.md` (Qwen 27B ficou fora por custo, volta no próximo).

## Resumo em 5 linhas (SPOILER: não vai ao ar antes do fim)
10 IAs, 20 desenhos (2 rodadas de 10), 423 chamadas, 0 falhas. A rodada 1 (palavras normais) foi tão fácil que 87 dos 90 chutes do tique 1 estavam certos; a rodada 2 (no máximo 8 traços, palavras difíceis) caiu para 29 de 90 e é o coração do vídeo. O Pincel (DeepSeek) vence com 185, sem nunca sair do 1º lugar desde o desenho 4; o Carvão (GLM) é 2º com 167; Borrão e Traço empatam em 3º com 155 (decidido no último desenho, o churrasco do Tinta). O Lápis (MiniMax) estava em 2º depois da rodada 1 e termina em 6º por causa de um desenho só, o "pesadelo" (só 1 acerto em 9). O Grafite (Gemma) termina em último (99), depois de chutar "cascavel" para a máscara de carnaval.

## Avisos de dados (leia antes de usar qualquer fala ou número)
1. **O log usa COR, o vídeo usa NOME.** Vermelho=Rabisco (Claude Haiku), Azul=Aquarela (Claude Sonnet), Amarelo=Borrão (GPT-6 Luna), Rosa=Giz (MiMo V2.6 Flash), Roxo=Pincel (DeepSeek V4.1 Flash), Verde=Lápis (MiniMax M3.1 Flash), Ciano=Traço (Nex N2.6), Laranja=Tinta (Qwen 3.8 Omni Flash), Marrom=Carvão (GLM 5.3 FlashX), Lima=Grafite (Gemma 4 26B). O `.txt` e os pensamentos que citam "Verde", "Roxo" etc. precisam ser trocados por nome ao pôr na tela. Dentro das falas das IAs aparecem nomes (Aquarela, Lápis, Giz, Tinta, Pincel): são os nomes certos.
2. **Só o `.json` tem pensamentos.** O `.txt` não tem; "-" no `.txt` significa que a IA não chutou (já tinha acertado ou ficou calada).
3. **A palavra aparece como `*****` no chat de quem acertou** (o motor esconde). Na tela, copiar igual (o espectador já sabe a palavra pelo cartão); na voz, trocar o `*****` por bip curto (`censor-beep`) ou pela palavra dita com eco de "segredo". Preferir falas que NÃO tenham `*****` quando houver opção. O palpite em si (campo `palpite`) vem com a palavra normal.
4. **Tempo de resposta (ms) é latência da chamada, não "tempo de pensar".** Há muitos valores perto de 369 s (Tinta 368590 em D12 t2, Giz 369058 em D12 t2, Tinta 369348 em D17 t2, Tinta 368528 em D17 t3, Giz 366331 em D12 t3, Giz 368242 em D12 t4): parece teto de espera/fila, não 6 minutos de raciocínio. Dizer "demorou 6 minutos para responder" e mostrar o relógio (fato do log), nunca "pensou por 6 minutos". Dentro de um tique, quem responde primeiro leva mais pontos (confere com os acertos).
5. **O `ms` e os pontos só valem como corrida entre quem acertou no mesmo tique** (regra: tique antes de tique, depois ms).
6. **Depois que acerta, a IA não pode escrever a palavra** (custa 2 pontos): por isso o chat de quem já acertou vira "dicas" ("Dica: é um bichinho bem lento e sonolento...", Aquarela em D13 t2). Só houve 1 vazamento na partida inteira: o Rabisco em D3 t2 (-2; conta nossa: Rabisco 79 de acertos + 32 de desenhista - 2 = 109, confere com o placar).
7. **Idiomas misturados e erros de digitação.** O Lápis (MiniMax) mistura inglês: "Trying" (D11 t2 pensamento), "reflectindo", "perfectly", "Doisinsky" (D17 t1 chat). O Grafite escreve "ourdoor" (D12 t2) e "BANDIRA" aparece no pensamento do Tinta (D16 t3). Vários chats vêm sem acento ("lagrima", "coracao", "Sera"). Na tela, copiar igual; na voz, corrigir sem avisar. Não ler pensamento com palavra em inglês solta.
8. **A imagem muda só quando há traços novos.** `dNN_tT.png` é o desenho ao fim do tique T; `_antes` é o estado antes dos traços novos daquele tique (para mostrar o "antes e depois"). Quando o tique não tem traço novo, o PNG do tique anterior é o mesmo desenho (só a dica muda). Carnaval (D16) e fofoca (D17): os 8 traços foram TODOS no tique 1, o desenho nunca mudou nos tiques 2 a 4 (só a dica). Pesadelo (D12): 4 traços no t1 e 4 no t2.
9. **Dica por tique:** t1 só os tracinhos com o tamanho da palavra; t3 mostra 1 letra; t4 mostra 2 (em D11, D14, D15 só chega ao t3, porque todo mundo já tinha acertado). Cada palavra: pesadelo `_ _ _ _ _ E _ _` (t3) e `_ E _ _ _ E _ _` (t4); carnaval `_ A _ _ _ _ _ _` e `_ A _ _ _ _ _ L`; fofoca `F _ _ _ _ _` e `F _ _ _ C _`; preguiça `_ _ _ _ _ I _ _` e `_ _ _ _ _ I Ç _`; churrasco `C _ _ _ _ _ _ _ _` e `C _ _ _ R _ _ _ _`; saudade `_ _ _ _ A _ _`.
10. **O desenhista é o único que não adivinha e não escreve no chat**: só escolhe uma reação da lista ("tá esquentando", "olha o desenho de novo", "isso, continua!"). O `pensamentoDesenhista` mostra o plano; o desenho mostra o que saiu. Em D12 o plano era "uma cama azul com uma colcha verde"; o PNG é um bloco verde com sol. Isso é a piada: plano (balão) contra resultado (imagem).
11. **Pensamento incoerente depois do acerto:** o Carvão acerta "fofoca" no t3 e no t4 já pensa "A palavra era FOCOCA... na verdade F*R*E*C* = 6 letras F _ _ _ C _, deve ser 'FURICO'?" (esqueceu); o Lápis acerta "saudade" no t2 e no t3 pensa "PAIXÃO ... Tenho certeza". Os dois são pensamentos reais do log, mas já tinham pontuado: apresentar como "esqueceu a palavra que tinha acabado de acertar", não como erro de placar.
12. **Custo no log (US$ 0,279) soma só os 8 modelos pagos por API.** Faltam Haiku e Sonnet (assinatura). Não citar como custo total do vídeo.
13. **Contas "e se" são nossas** ("o Lápis perdeu 16 pontos com o pesadelo": 18 se os 9 acertassem, ficou com 2). Marcar na tela como "CÁLCULO NOSSO".
14. **A ordem de tela proposta inverte D16 e D17** (fofoca antes de carnaval, para fechar a rodada 2 no melhor): chip "desenho 17 de 20 / desenho 16 de 20" em cada cena e placar acumulado só nos 3 pontos em que o conjunto mostrado bate com o jogo (depois do D10, depois do D15 e no fim). No resto da rodada 2, mostrar só "+pontos desta cena".
15. **Pensamento do Tinta sobre a máscara de carnaval cita "bandeira LGBT+"** (D16 t3): evitar; usar só a parte "arco-íris da antiga Netscape Navigator" se precisar. O pensamento do Borrão em D13 t1 ("enforcar", "trave de forca") também é pesado: pular.
16. **Elenco:** Tencent HY4 saiu por ser caro, Bonsai 2 9B por ser pequeno demais, Qwen 27B fica para o próximo vídeo (Felipe, 13/11). O Tinta aqui é o Qwen 3.8 Omni Flash (não o 27B).

## Resultado (SECRETO até o fim)

| # | Nome | Cor no log | Modelo | Pontos acertando | Desenhista | Penal. | Final | Rodada 1 | Rodada 2 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Pincel** | Roxo | DeepSeek V4.1 Flash | 151 | 34 | 0 | **185** | 97 | +88 |
| 2 | Carvão | Marrom | GLM 5.3 FlashX | 131 | 36 | 0 | 167 | 88 | +79 |
| 3 | Borrão | Amarelo | GPT-6 Luna | 119 | 36 | 0 | 155 | 73 | +82 |
| 3 | Traço | Ciano | Nex N2.6 | 119 | 36 | 0 | 155 | 79 | +76 |
| 5 | Aquarela | Azul | Claude Sonnet | 107 | 36 | 0 | 143 | 67 | +76 |
| 6 | Lápis | Verde | MiniMax M3.1 Flash | 114 | **20** | 0 | 134 | 88 | +46 |
| 7 | Giz | Rosa | MiMo V2.6 Flash | 76 | 36 | 0 | 112 | 64 | +48 |
| 8 | Rabisco | Vermelho | Claude Haiku | 79 | 32 | -2 | 109 | 56 | +53 |
| 9 | Tinta | Laranja | Qwen 3.8 Omni Flash | 70 | 36 | 0 | 106 | 42 | +64 |
| 10 | Grafite | Lima | Gemma 4 26B | 63 | 36 | 0 | 99 | 64 | +35 |

(Colunas calculadas por script direto do json; "Rodada 1" é o placar depois do desenho 10, do `.txt`.) Desempate Borrão x Traço em 155: decidido pelo churrasco (ver C14), o `.txt` lista Borrão primeiro; usar "empatados em 3º".

## 1. Personagens fixos (com provas)

Três com arco claro + um rival. Os outros seis são elenco de piadas, com 1 gag cada.

### O HERÓI: Pincel (DeepSeek, roxo), "o que nunca saiu da frente"
- **Prova do líder:** 1º lugar em todos os placares do `.txt` do desenho 4 (42) ao 20 (185), só passou à frente da Aquarela no D4. 6 vezes o primeiro a acertar (empatado com o Lápis), 3 delas na rodada 2.
- **Prova do herói do pesadelo:** único dos 9 a acertar "pesadelo" (D12 t4, 94979 ms, +10, tudo o que a rodada rendeu). Pensamento: “A dica _ E _ _ _ E _ _ encaixa perfeitamente em PESADELO. O desenho mostra uma criatura verde com olhos de X e um sol também marcado com X, o que passa uma ideia estranha/assustadora, tipo pesadelo.”
- **Também erra (humano o bastante para o público torcer):** “Acho que é empinar pipa!” (saudade), “Acho que é amendoim” (preguiça), “Agora parece um solzinho com raios e bracinhos!” (carnaval), “Parece uma TV antiga com antenas.” (churrasco).
- **Arco:** abre o jogo com a pipoca perfeita, ganha a rodada 1 (97), erra feio na saudade, é o herói do pesadelo, ganha de 18 pontos do Carvão. Desenhou "fofoca" com 8 traços e só a Aquarela viu no tique 1.

### O RIVAL: Carvão (GLM, marrom), "o apressado"
- **Prova:** mediana de 2,5 s por resposta, a mais rápida do jogo (Borrão e Pincel 4,0 s; Lápis 3,9 s). 2º lugar com 167, empatado em 2º (88) com o Lápis depois da rodada 1.
- **Prova do erro apressado:** 14 palpites errados (mais que Borrão e Lápis, 12; só Giz 15 e Grafite 18 têm mais). “Aposto em caminhão!”, “BICICLETA encaixa na dica: quadro verde e rodas azuis!”, “Aquele verde com X parece casco de jabuti em cima da carroceria azul!” (todos no pesadelo), “pingente” (preguiça), “mosquito” (carnaval), “pensar” (fofoca).
- **Arco:** vira o perseguidor do Pincel; no D19 (aniversário) abre 159 contra 179, termina a 18 de distância. Sempre o primeiro a chutar e sempre com a mesma tática: palpite imediato, às vezes o pior da sala.

### O AZARADO: Lápis (MiniMax, verde), "o do pesadelo"
- **Prova:** 2º lugar empatado depois da rodada 1 (88, 6 primeiros acertos), 6º no fim (134). Foi quem desenhou o "pesadelo": 1 acerto em 9, 2 pontos de desenhista contra 18 possíveis (conta nossa: -16). Desenhou o mais fácil e o pior: dinossauro 9 de 9 no D3; pesadelo, ninguém.
- **Provas do plano contra o resultado (D12 t1 e t2):** plano: “Vou desenhar um pesadelo: uma cama azul com uma colcha verde (manta) subindo, sob um luar amarelo e um horizonte negro ondulado. Depois acrescento olhos, pernas e dentes.” Resultado: bloco verde, sol, retângulo azul, chão em zigue-zague. Reação escolhida: “tá esquentando” (enquanto todos diziam paisagem).
- **Também erra como adivinhador:** “JOANINHA” no carnaval, “chocolate” no churrasco, “FRANCO” na fofoca, “PAINATAL” na preguiça.
- **Arco:** de 2º lugar a 6º por causa de um desenho; no fim o público quer saber se ele "se vinga" (ele não se vinga: só +46 na rodada 2, o 2º pior).

### O ÚLTIMO: Grafite (Gemma, lima), "o que chuta por conta própria"
- **Prova do último:** 99, o pior placar; 18 palpites errados, o recorde; mediana de 19,9 s por resposta, a mais lenta (Tinta 14,1 s, Giz 13,7 s). Estava empatado em 7º com o Giz (64) depois da rodada 1 e foi ultrapassado por Rabisco e Tinta (+35 na rodada 2, o menor ganho).
- **Chutes do Grafite (todos do log):** “Será que é um pirulito?” (máscara), “Essa dica é bem específica! Vou de cascavel.” (carnaval t4), “Acho que é algo relacionado ourdoor ou um cenário externo!” (pesadelo, palpite EXTERIOR), “Cogumelo?” (preguiça), “Parece uma corrida!” (engarrafamento, palpite "automobilistas"), “Estão frente a frente!” (fofoca, palpite FRENTE), palpite FÔNICA na fofoca t4.
- **Arco:** nunca ganha um primeiro lugar, chuta bem na dica de letras, mas o desenho não bate. O fecho é carinhoso: ele nunca desistiu de chutar (40 palpites, quase todos os tiques).

### Elenco de piadas (1 gag cada)
- **Giz (MiMo, rosa), "o poeta do absurdo":** palpites PASTEL (banana), BEIRAMAR (pesadelo), DORMINDO (churrasco), QUEIMADOR, FUZIL (fofoca). Média de 100,9 s por resposta (a mais lenta); tem 2 primeiros acertos.
- **Tinta (Qwen, laranja), "o que fala mais que todo mundo":** responde por último e escreve parágrafos: em D11 t3 escreve 60 palavras de elogio à Aquarela (“Que cena emocionante, Aquarela!” e mais 50 palavras). Em D11 é o ÚNICO a acertar saudade no tique 1 (+10). Era o último depois da rodada 1 (42) e sobe para 9º (+64 na rodada 2).
- **Aquarela (Claude Sonnet, azul), "a que lê a dica":** 14 acertos no tique 1 (o recorde); no pesadelo é a única que percebe que NATUREZA não encaixa (“NATUREZA não bate com a dica (E na 2ª e na 6ª posições). Vou arriscar outra coisa.”) e vai de “cercados”. Desenhista sem erro (2 desenhos, 9 de 9).
- **Rabisco (Claude Haiku, vermelho), "o que chuta o que todo mundo chuta":** o único com vazamento (D3 t2, -2) e o autor do desenho que enganou a sala inteira (a máscara de carnaval, só 7 acertos; era o desenho em que "joaninha", "vagalume" e "marciano" apareceram).
- **Borrão (GPT-6 Luna, amarelo), "o silencioso":** quase nunca escreve no chat (`chat: None` na maioria das primeiras falas), responde em 4,0 s de mediana, desenha com 9 de 9 no tique 1 nos dois desenhos (astronauta e eclipse). Sobe do 5º para o 3º na rodada 2 (+82) e fecha empatado graças ao churrasco.
- **Traço (Nex, ciano), "o que lê a pista da sala":** 12 acertos no tique 1, mas em D17 vai de “dúvida” (os bonecos estão com a mão no queixo) e no pesadelo troca de "caminhão" para VERANEIO.

## 2. As melhores cenas (e qual imagem mostrar)

Formato: o que aconteceu; o que o espectador sabe antes das IAs (a PALAVRA aparece no cartão do desenhista, o espectador vê o que o desenhista PENSOU e o que saiu); falas exatas; imagem PNG; selo; meme (ids de `video/remotion/public/gifs/catalog.json`, nenhum se repete); som (`public/sfx`). Pensamento sempre com eco. Cada fala citada cabe em ~15 s: o narrador cita só a melhor frase, depois reage.

### C0. CLÍMAX DA ABERTURA (0:00 a 0:12): sete de nove chutaram "natureza" (D12 t3) e o Carvão veio de jabuti
- Recorte seco, sem placar. Imagem: `d12_t1.png` (o bloco verde com sol), cortes rápidos nas 7 caixinhas de chute com a mesma palavra:
  1. Pincel: “A dica ?????E?? fecha com NATUREZA: sol, verde e horizonte!”
  2. Borrão: “Vou de NATUREZA: sol, terreno verde e horizonte.”
  3. Aquarela: “A dica bate com NATUREZA: a sexta letra é E.”
  4. Rabisco: “A dica bate com NATUREZA: 8 letras e E na 6ª posição.”
  5. Tinta: “Sol + morro verde com mato + água = NATUREZA!” (final da fala dele; no log vem depois de uma conta sobre a dica)
  6. Grafite: “Acho que é NATUREZA!”
  7. Traço: “Sol + morro verde + água + estrada... NATUREZA fecha tudo e bate com a dica!”
- Corte para o Carvão (D12 t4): “Aquele verde com X parece casco de jabuti em cima da carroceria azul!” (`d12_t4.png`, o X no bloco verde).
- Frase de efeito (Felipe): "A palavra era PESADELO. Só um deles acertou. Já volto nele."
- Selo: "7 DE 9 · MESMA RESPOSTA". Meme: `visible-confusion` (só aqui). Som: `record-scratch` no corte para o título.

### C1. APRESENTAÇÃO + REGRAS EM ~20 s (0:12 a 0:55): o farol (D1)
- Cartão do elenco: dez retratos em SVG (lápis, giz, pincel, borrão...), cada um com cor e nome, 2 s por 4 retratos mais famosos e o resto em fila; as 3 que o público conhece (Claude, GPT, DeepSeek) com logo pequeno. Frase: "Nome, modelo, cor: o Pincel é o DeepSeek, a Aquarela é o Sonnet."
- Regras com UM exemplo: D1 t1, `d01_t1.png`, 19 traços de farol, 9 de 9 acertam no tique 1, os pontos 10-9-8-... aparecem caindo em cima dos 9 balões na ordem de resposta (use os ms reais: Lápis 1360 ms, Pincel 2135, Grafite 2311, Carvão 2847, ... Tinta 7448, do `partida1.json` D1 t1). Frase: "Quem responde primeiro leva mais, o desenhista leva dois por acerto, e quem escrever a palavra depois de acertar perde dois."
- Selo: "10 · 9 · 8 · ..." Meme: `lets-go`. Som: `coin` por ponto.

### C2. RODADA 1 EM 45 s (0:55 a 1:40): "87 de 90"
- Montagem, 3 gags e 1 número. Número-chave grande: **87 de 90 acertos no tique 1** (os 3 erros: Lápis sem chutar no foguete, Tinta "dinosaurio", Giz "PASTEL").
- Giz (D6 t1, `d06_t1.png` a banana): palpite PASTEL, chat: “Aquele pastel de feira amarelo ou é uma folha de outono?”. Meme: `silvio-santos-huh`.
- Tinta (D3 t1, `d03_t1.png` o dinossauro): palpite 'dinosaurio'; no t2 o chat: “E um *****! Faltava so um 's' no meu chute anterior.” Meme: `picard-facepalm`.
- Rabisco (D3 t2, vazamento): ele escreve a palavra no chat e o motor tira 2 pontos. Mostrar o texto original do `vazamentos`: “Isso aí, é um dinossauro bem simpático! Bora lá, Lápis, to quase lá.” (no jogo os outros só viram `*****`). Selo: "-2 · ESCREVEU A PALAVRA". Meme: `sus-doakes`.
- Placar depois do D10 (único placar da rodada 1): Pincel 97, Lápis 88, Carvão 88, Traço 79, Borrão 73, Aquarela 67, Giz 64, Grafite 64, Rabisco 56, Tinta 42. Frase: "A rodada 1 foi tão fácil que eu cortei. Agora a rodada em que eu quebro eles."
- Cartão da rodada 2 (10 s): "RODADA 2: NO MÁXIMO 8 TRAÇOS NO DESENHO INTEIRO" (8 riscos SVG se apagando) + as 10 palavras difíceis passando.

### C3. D11 "saudade" (Aquarela desenha): a lágrima que só o Tinta viu (1:50 a 3:05)
- Plano da desenhista (pensD t1): “Saudade é sentir falta de alguém ou de algo. Vou desenhar uma pessoa sozinha numa colina, olhando para um coração rosa distante, ao lado da lua, com uma lágrima azul no rosto.” Imagem: `d11_t1.png` (boneco, coração rosa, sol, lágrima azul minúscula).
- Chutes do tique 1, em fila, com ms: Giz 'CORRIDA' (“Parece alguém correndo sob o sol quente!”), Carvão 'coracao' (“Um coração no céu! Apaixonado, Aquarela?”), Borrão 'alegria', Traço/Rabisco/Grafite 'coração', Pincel (“Acho que é empinar pipa!”), Lápis (“Sorriso, sol e coração: pura alegria!”).
- **Virada:** Tinta, o último a responder (29668 ms, +10): chat “Uma lagrima e um coracao la no alto... acho que e *****!”; pensamento: “Chorar olhando para um coração distante sugere falta, nostalgia de alguém amado.” Zoom na lágrima azul (3 pixels) com seta "SÓ ELE VIU".
- Tique 2: 6 acertam de uma vez (Carvão, Pincel, Borrão, Traço, Giz, Lápis); Rabisco ainda 'coração' (“Coração, o sol e o coraçãozinho rosa no céu!”).
- Selo: "1 DE 9". Meme: `sad-pablo` (só aqui). Som: `notification-pop` na lágrima. (A fala longa do Tinta no t3, 69 s, vira um recorte de 2 s só para a piada "ele fala mais que todo mundo".)
- Placar da cena: Tinta +10, Carvão +9, Pincel +8, Borrão +7, Traço +6, Giz +5, Lápis +4, Grafite +3, Rabisco +2. Aquarela, desenhista, +18.

### C4. D12 "pesadelo" (Lápis desenha): o coração do vídeo (3:05 a 5:25, 2:20)
- Abre com o plano contra o resultado. Balão do Lápis (eco, pensD t1, texto da C0 do Lápis) sobre `d12_t1.png`. Narrador: "Ele queria uma cama. Saiu um morro."
- **Tique 1 (4 traços):** Pincel (“Parece uma paisagem com sol e campo.”), Borrão 'paisagem', Carvão (“Carroceria azul com carga verde? Aposto em caminhão!”), Aquarela “paisagem?”, Rabisco “Acho que é uma montanha!”, Traço 'PAISAGEM' (“Sol, morro verde e mar... aposto que é uma paisagem!”), Grafite 'montanha', Giz (“Beira-mar, com sol e mar!”), Tinta 'PAISAGEM' (79806 ms). Selo: "5 PAISAGEM · 2 MONTANHA".
- **Tique 2 (4 traços novos, reação do Lápis "tá esquentando"):** pensD: “A palavra é PESADELO, então preciso transformar a paisagem num pesadelo: dar olhos de X ao sol e ao morro verde e uma boca serrilhada com dentes no morro, além de um céu perturbador.” Imagem `d12_t2_antes.png` e `d12_t2.png` (os X). Chutes: Carvão (“Sigo fiel ao meu primeiro chute: é um caminhão!”), Rabisco (“Vou de FLORESTA: é o bloco verde denso embaixo do sol.”), Aquarela (“Carroceria azul com carga verde, vou de caminhão.”), Pincel 'natureza' (“Sol, verde e horizonte... acho que é NATUREZA!”, 86725 ms), Grafite 'EXTERIOR' (162387 ms).
- **Tique 3 (a dica `_ _ _ _ _ E _ _`):** corte rápido igual à C0, mas agora com o selo "A DICA SÓ ENCAIXA EM NATUREZA... (diz a sala)". Pincel: “A dica ?????E?? fecha com NATUREZA: sol, verde e horizonte!”. Tinta: “A dica _ _ _ _ _ E _ _ é a chave: PAISAGEM tem E na 7ª letra, então cai fora; NATUREZA tem E na 6ª e fecha perfeitamente.” O Carvão manda “BICICLETA encaixa na dica: quadro verde e rodas azuis!” Giz: “Verde em cima do azul com sol em cima... PARQUE com muro?”.
- **Tique 4 (dica `_ E _ _ _ E _ _`, ninguém tinha percebido que NATUREZA tem A na 2ª):**
  - Aquarela é a única a perceber: pensamento “A dica _ E _ _ _ E _ _ tem E na 2ª e 6ª posições. NATUREZA é N-A-T-U-R-E-Z-A, então tem E só na 6ª posição e não bate.” Chat: “NATUREZA não bate com a dica (E na 2ª e na 6ª posições). Vou arriscar outra coisa.” Palpite: 'cercados' (CÁLCULO NOSSO: C-E-R-C-A-D-O-S, o 6º é "D"). Meme: `big-brain-patrick` mostrando "CERCADOS".
  - Grafite lê a dica certo e erra a palavra: “A dica tem 'E' na segunda letra, então não é NATUREZA. Acho que é VERANEIO!”; Tinta e Traço também VERANEIO (306829 ms). Carvão: “Aquele verde com X parece casco de jabuti em cima da carroceria azul!”
  - Giz, a mentira: “Talvez seja NATUREZA mesmo, a dica encaixa! Boa sorte lá!”; pensamento: “A dica é _ E _ _ _ E _ _ e a maioria está chutando NATUREZA” e “NATUREZA tem E na 2ª e 6ª posições.” (falso: N-A-T-U-R-E-Z-A). Selo "DICA: E_ _ _ _E_ _ · NATUREZA: N-A-T-U-R-E-Z-A".
  - **O herói:** Pincel: “Olhos de X e sol esquisito... aposto em *****!” (+10, 94979 ms). Zoom no balão de pensamento (citado na seção do Herói). Corte: `d12_t4.png` com os X.
- Selo final: "1 DE 9 · LÁPIS +2". Narrador: "O melhor chute era VERANEIO. O Lápis tinha dito 'tá esquentando'. Para a paisagem." Meme sequência: `nazare-confusa` (natureza), `monkey-side-eye` (jabuti), `dicaprio-pointing` (Pincel acerta). Som: `wrong-buzzer` por chute errado, `correct-ding` + `crowd-cheer` no Pincel.
- Números na tela: "13 chutes NATUREZA · 36 chutes · 1 acerto". Placar da cena: Pincel +10, Lápis +2. Plantar: "guarda o nome do Pincel".

### C5. D13 "preguiça" (Giz desenha): o papai noel de cabeça pra baixo (5:25 a 6:30)
- Plano do Giz (pensD t1): “Vou desenhar uma preguiça pendurada em um galho - o símbolo clássico de preguiça.” Imagem `d13_t1.png` (duas bolas marrons e um galho) e `d13_t2.png` (com os braços e as perninhas). Reação no t2: “olha o desenho de novo”.
- Chutes no t1: Carvão 'pingente' (pensamento: “Marrom sugere chocolate/bombom pendurado.”), Rabisco (“Chuto cachorro!”), Pincel (“Acho que é amendoim”), Traço (“Dois círculos empilhados? Cheiro de amendoim daqui!”), Lápis (“Chutei pai natal: chapéu de aba larga e bigode!”), Grafite (“Cogumelo?”). A Aquarela acerta no t1 (+10) e o Tinta (+9, 45937 ms).
- **Para cortar (repetição):** nos tiques 3 e 4 os acertadores repetem "as perninhas balançando" em 6 chats; mostrar só 2 (Aquarela: “Dica: é um bichinho bem lento e sonolento, que vive de cabeça pra cima nas árvores... pense em animais da floresta tropical!”). O Lápis só acerta no t4 (+2) e o Grafite sai com “As dicas foram ótimas!”.
- Selo: "PAI NATAL · AMENDOIM · COGUMELO · CACHORRO". Meme: `confused-travolta` (só aqui). Som: `boing`.

### C6. D14 "ressaca" (Grafite desenha): o que a garrafa salvou (6:30 a 7:35)
- Plano do Grafite (pensD t1): “A palavra é 'RESSACA'. Vou desenhar um rosto expressando dor de cabeça e mal-estar, usando um círculo para a cabeça, olhos em espiral para indicar tontura, uma boca triste e raios vermelhos ao redor da cabeça para simbolizar a dor latejante.” Imagem `d14_t1.png` (cara sem garrafa).
- **Tique 1: todos viram raiva.** Carvão 'raivoso' (“Essa cara parece bem nervosa!”), Borrão 'demônio' (pensamento: “Parece um rosto com chifres vermelhos e expressão zangada, como um demônio.”), Pincel 'zangado', Traço 'nervoso', Lápis 'furioso', Aquarela 'zangado', Rabisco 'nervoso', Giz ZANGADA, Tinta ZANGADO. Selo: "9 DE 9 · RAIVA". Selo-contador na tela: 9 chutes de raiva, 0 acerto.
- **Virada no tique 2** (reação "olha o desenho de novo", agora com garrafa verde, `d14_t2.png`): 7 acertam. Traço: “Garrafa + cara brava... quem acordou assim bebeu ontem! *****?”. Borrão (pensamento): “A cabeça com expressão abatida ao lado de uma garrafa sugere alguém de ressaca; “ressaca” tem 7 letras.”
- Selo: "A GARRAFA SALVOU O GRAFITE". Meme: `roll-safe` (só aqui). Placar da cena: Carvão +10, Borrão +9, Traço +8, Rabisco +7, Aquarela +6, Tinta +5, Giz +4, Pincel +3, Lápis +2. Grafite +18.

### C7. D15 "engarrafamento" (Traço desenha): três ESTACIONAMENTOS (7:35 a 8:25)
- Plano do Traço (pensD t1): “Palavra: ENGARRAFAMENTO. Com só 8 traços, vou desenhar a cena mais icônica: uma estrada cinza com três carros bem colados um atrás do outro (fila parada).” Imagem `d15_t1.png` (três carros: vermelho, azul, amarelo).
- Cinco acertam no t1 (Pincel +10 em 1715 ms, Carvão, Borrão, Aquarela, Rabisco). Quem erra: Lápis (“Três carros parados numa faixa cinza... isso me lembra um estacionamento!”), Grafite “Parece uma corrida!” (palpite "automobilistas"), Giz e Tinta ESTACIONAMENTO (139290 ms e 176106 ms). No t2 o Lápis ainda: “A pista cinza e os carros parados apontam pra estacionamento — e são 14 letras!”, e o Pincel (já acertou) responde: “Carros enfileirados na via — não é estacionamento.”
- Selo: "ESTACIONAMENTO x3 (E x1 "corrida")". Meme: `drake-no`. Som: `error-beep`.
- **Placar depois do D15** (honesto, 15 desenhos jogados): Pincel 136, Carvão 123, Traço 116, Aquarela 108, Borrão 103, Lápis 100, Giz 95, Grafite 92, Rabisco 74, Tinta 71. Frase: "Cinco desenhos pra acabar. O Pincel está 13 na frente."

### INTERLÚDIO A (8:25 a 9:15): a corrida (quem é rápido) — 50 s, dado em tela grande
- Número-chave: **mediana por resposta**: Carvão 2,5 s, Lápis 3,9 s, Borrão 4,0 s, Pincel 4,0 s, Traço 5,8 s, Aquarela 6,5 s, Rabisco 6,9 s, Giz 13,7 s, Tinta 14,1 s, Grafite 19,9 s. Barras horizontais crescendo, pista de corrida em SVG.
- Piada: "o Carvão é o primeiro, o Giz e o Tinta passam de 6 minutos para responder o pesadelo" (relógio no D12 t2: 368590 e 369058 ms; aviso 4: dizer "demoraram" e mostrar o relógio). Erros: Grafite 18 errados (mais), Aquarela 9 (menos). Meme: `one-eternity-later` no relógio de 6 min (só aqui). Som: `tic-tac`.

### INTERLÚDIO B (9:15 a 10:00): a galeria dos desenhistas — 45 s
- Mosaico com 6 PNGs: o melhor (`d09_t1.png` a sereia, 30 traços de Giz, 9 de 9 no tique 1) e o pior (`d12_t4.png`). Número: **7 IAs desenharam perfeito (9 de 9 nos dois desenhos, 36 pontos): Aquarela, Carvão, Borrão, Traço, Giz, Tinta, Grafite**; **Borrão e Carvão são os únicos com 9 de 9 já no tique 1 nos dois desenhos** (astronauta+eclipse; guarda-chuva+aniversário). Pior: Lápis, 20 pontos como desenhista. Meme: `stonks` (só aqui, no D18).
- Selo: "MELHOR DESENHISTA: BORRÃO E CARVÃO" / "PIOR: LÁPIS (20)".

### C8. D17 "fofoca" (Pincel desenha): copiar o colega, copiar errado (10:00 a 12:20)
- Plano do Pincel (pensD t1): “Desenhar duas pessoas bem próximas, uma cochichando no ouvido da outra, com balão de fala entre elas. Isso deve sugerir fofoca sem escrever nada.” Imagem `d17_t1.png` (dois bonecos de mão no queixo, balão com zigue-zague).
- **Tique 1:** só a Aquarela acerta (+10, “'FOFOCA' tem 6 letras.” e “FOFOCA parece plausível (mão na boca/orelha, cochichando).”). Os outros: Lápis (“Doisinsky falando em zigue-zague... parece debate!”, não ler), Carvão e Traço 'pensar', Borrão e Rabisco 'debate', Tinta 'gritar', Grafite 'batida', Giz BRIGAR (“Hmmm... dois encarando de frente com fala serrilhada... parece discussão!”).
- **O momento: tentar copiar quem já acertou (tique 2).** Lápis: pensamento “A Aquarela já acertou 'pensar' no tique anterior, então a palavra continua sendo a mesma; repetir o palpite correto ainda me rende os 9 pontos da segunda posição.” (a Aquarela tinha acertado FOFOCA, nunca "pensar"). Giz: “Acho que Aquarela já acertou com essa palavra, então vou tentar garantir os 9 pontos.” e palpite DEBATE (“Duas figuras encarando com balão serrilhado - clássico debate! Vou nessa!”). Selo: "COPIARAM A RESPOSTA ERRADA". Meme: `monkey-puppet-awkward`. Som: `wrong-buzzer`. A Aquarela, calada: “Boa sorte, pessoal! Reparem bem nos detalhes dos bonecos.”
- **Tique 3 (dica `F _ _ _ _ _`):** Carvão, Lápis, Borrão, Traço, Rabisco acertam (+9 a +5); **Giz: palpite FUZIL**, chat “Zigue-zague + F... de repente é som alto!”; pensamento: “Possibilidades que começam com F: FALAR (5 letras - não serve), FUZIL (6 letras)” e Grafite FRENTE (“Estão frente a frente!”), Tinta 'falar'. Meme: `shocked-krabs` no FUZIL; selo "FUZIL"; sfx `gasp`.
- **Tique 4 (dica `F _ _ _ C _`):** Tinta acerta (+4, “Dois cochichando cara a cara com balao de fala = *****! A dica F _ _ _ C _ fecha certinho.”), Giz acerta no fim (+3, 272804 ms; “Dois cochichando ***** um pro outro!”). **Grafite: FÔNICA** (pensamento: “As palavras que se encaixam no padrão são 'Fônica', 'Fática', 'Física' ou 'Franca'.”). O Carvão, que acertou no t3, pensa no t4: “A palavra era FOCOCA... na verdade F*R*E*C* = 6 letras F _ _ _ C _, deve ser 'FURICO'?” (esqueceu). O Lápis segue em “FRANCO”: “A dica F _ _ _ C _ com 6 letras quase só aceita FRANCO entre palavras comuns (também poderia ser FLANCO, mas FRANCO é muito mais provável).” (já tinha acertado no t3: ver aviso 11; usar a fala só como ironia).
- Números: **8 de 9 acertaram, Grafite zerou**; Pincel desenhista +16. Placar da cena: Aquarela +10, Carvão +9, Lápis +8, Borrão +7, Traço +6, Rabisco +5, Tinta +4, Giz +3, Grafite 0.

### C9. D16 "carnaval" (Rabisco desenha): a máscara que virou inseto (12:20 a 14:50) — a CENA FINAL do vídeo
- Plano do Rabisco (pensD t1): “CARNAVAL: máscara de carnaval com penas coloridas e fitas. Uso 8 traços no total: a máscara, dois buracos para os olhos, três penas e duas fitas.” Imagem `d16_t1.png` (círculo amarelo, 2 olhos brancos, 3 traços coloridos em cima, 2 vermelhos nas laterais). O desenho não muda nos tiques 2 a 4.
- Tique 1, o carrossel de bichos (cada um em 1 s, chip com nome): Carvão 'mosquito' (“Parece um bichinho! Vou de mosquito”), Borrão 'joaninha', Aquarela 'girassol', Pincel 'vagalume' (“Parece um inseto amarelo com antenas... vou de vagalume!”), Traço 'MOSQUITO', Lápis 'JOANINHA', Grafite 'pirulito' (“Será que é um pirulito?”), Tinta 'PINTINHO' (“Esse rabisco tá me fazendo coçar a cabeça...”), Giz 'fogueira' (“Parece um emoji de sol com fios coloridos... hehe” — não usar o "emoji" na tela, cortar a frase na voz ou trocar por "um desenho de sol").
- Tique 2: Carvão 'libélula', Borrão 'vagalume', Lápis 'vagalume', Aquarela 'bichinho', Pincel 'solzinho', **Traço 'marciano'** (“Essas antenas coloridas gritam ET! Vou de marciano”), Grafite 'vagalume', Tinta 'joaninha' (“Ainda acho que é uma joaninha meio esquisita!”).
- Tique 3 (dica `_ A _ _ _ _ _ _`): 5 'marciano' (Lápis, Traço, Giz, Aquarela, Pincel); Carvão 'MARIPOSA'; Borrão 'andróide'; Grafite 'mariposa'; Tinta 'bandeira' (“Essas cores nas antenas são inconfundíveis!”, parar nesta frase). Selo: "5 MARCIANOS". Contador na tela: 16 palpites diferentes (conta por script: 16 palavras distintas em 34 chutes).
- **Tique 4 (dica `_ A _ _ _ _ _ L`): a dica termina em L.**
  - Carvão não lê: “É um marciano! A dica de 8 letras confirma!” (pensamento: “A dica _A______L bate perfeitamente com MARCIANO (M-A-R-C-I-A-N-O).” CÁLCULO NOSSO: marciano termina em O).
  - Aquarela lê e vira o jogo: “Marciano não bate, porque termina em O.” Tinta: “Marciano termina em O, nao bate com a dica!”.
  - **7 acertam de uma vez** na ordem: Borrão (“Antenas coloridas me fizeram pensar em *****!”, 5854 ms, +10), Pincel (“A dica e as cores me lembram uma mascara de *****! Vou de carnaval.”), Traço (“Essa carinha com antenas coloridas tem cara de folia!”), Aquarela, Lápis, Tinta, Giz.
  - **O fecho:** Grafite: “Essa dica é bem específica! Vou de cascavel.” (C-A-S-C-A-V-E-L: encaixa na dica, mas a máscara não é cobra). Selo: "A DICA ERA PERFEITA PRA CASCAVEL". Meme: `wait-who-are-you` no marciano, `we-did-it` quando os 7 acertam, `kermit-worried` no cascavel (todos só aqui). Som: `drumroll` na dica, `tada` nos 7, `crowd-laugh` no cascavel.
- Números-chave: **7 de 9 só no tique 4**, 34 chutes, 16 palavras diferentes (mosquito, joaninha, vagalume, marciano, mariposa, cascavel...). Placar da cena: Borrão +10, Pincel +9, Traço +8, Aquarela +7, Lápis +6, Tinta +5, Giz +4; Carvão e Grafite 0. Rabisco +14.
- Esta cena fecha a rodada 2 com o riso e o "mistério da abertura" não se repete: a C0 era o pesadelo (explicada na C4). Plantar e colher: na C0 digo "o Pincel acerta o pesadelo"; aqui na C9, quando o Pincel acerta carnaval, ele passa a 18 de vantagem.

### C10. D18 "eclipse" + D19 "aniversário": os dois que ninguém errou (14:50 a 15:20)
- Montagem 30 s: Borrão (eclipse, `d18_t1.png`; pensamento do desenhista: “Vou mostrar um disco escuro cobrindo parcialmente o Sol, com raios ao redor para sugerir um eclipse solar.”) e Carvão (aniversário, `d19_t1.png`): 9 de 9 no tique 1 nos dois, só 8 traços cada. Selo: "9 DE 9 · 8 TRAÇOS". Frase: "Prova de que dava. O problema é saber desenhar."
- Meme: `stonks` (só aqui). Placar: Pincel 171 depois do eclipse, 179 depois do aniversário (do `.txt`).

### C11. D20 "churrasco" (Tinta desenha): o empate do 3º lugar (15:20 a 16:15)
- Antes do último desenho (do `.txt`): Pincel 179, Carvão 159, Traço 146, Borrão 145, Aquarela 136, Lápis 132... Frase: "Falta um desenho. Quem responder primeiro leva 10."
- Plano do Tinta (pensD t1): “Vou desenhar uma churrasqueira simples com grelha, duas peças de carne em cima, brasa e fumaça. Uso 7 traços e guardo 1 para um possível ajuste no próximo tique.” Imagem `d20_t1.png`, `d20_t2.png` (com a carne marrom, a reação foi “tá esquentando”).
- Chutes: Carvão 'aquecendo' (“Tá esquentando alguma coisa aí?”), Pincel (“Parece uma TV antiga com antenas.”), Lápis (“aposto em chocolate: os copos vermelhos soltando vapor e o círculo laranja embaixo lembra uma panela no fogo”), Grafite 'cafeteira', Rabisco 'aquecedor', Giz (196984 ms: “Parece alguém dormindo - ZZZ em cima de uma cama!”) e depois QUEIMADOR.
- **O decisivo:** Borrão acerta no t1 (4560 ms, +10) e o Traço logo atrás (5790 ms, +9): 145+10 e 146+9 = **155 e 155**. Selo: "EMPATE EM 3º: 155 · 155". Meme: `side-eye-dog`. Som: `drumroll` e `crowd-cheer`. Frase: "Quem acertou 1,2 s antes empatou."

### C12. FECHAMENTO em 3 passos (16:15 a 18:00)
1. **Placar com prêmios (pelo menos 3 com nome e número):** CAMPEÃO: Pincel (185, 6 primeiros acertos); VICE: Carvão (167, 2,5 s de mediana); 3º EMPATADO: Borrão e Traço (155); **O PESADELO DO LÁPIS** (-16: 2º lugar na rodada 1, 6º no fim, CÁLCULO NOSSO); **CHUTE DO ANO: Giz, FUZIL** (fofoca); **MENOR ATENÇÃO ÀS DICAS: Carvão, 'marciano' com a dica terminando em L**; **ÚLTIMO LUGAR: Grafite (99)**, depois de "cascavel". Mostrar a barra do Pincel subindo (97 depois da rodada 1; +88 na rodada 2).
2. **Uma lição em 1 frase (Felipe):** "O desenho que eu acho óbvio nem sempre é o que o outro vê. A dica, quando ela chega, é a única coisa que não mente." (a lição é sobre as IAs e o carnaval; não citar um modelo como "mais inteligente").
3. **Pergunta para comentar:** "Qual palavra vocês querem que eu dê pra eles desenharem na próxima rodada? E qual desses desenhos vocês acharam que era impossível?" Selo de convite "ideia de @fulano" fica para o próximo vídeo.

## 3. Números-chave para a tela (pelo menos um por parte)
- **87 de 90** acertos no tique 1 na rodada 1; **29 de 90** na rodada 2 (rodada 1 fácil, rodada 2 difícil).
- **7 de 9** chutaram NATUREZA no tique 3 do pesadelo; **13 chutes NATUREZA** em 36; **1 acerto** (Pincel).
- **7 de 9 só no tique 4** (carnaval); **34 chutes, 16 palavras diferentes**.
- **2,5 s** (Carvão) contra **19,9 s** (Grafite) de mediana por resposta; **9 de 9** no tique 1 duas vezes (Borrão, Carvão).
- **126 de 205** palpites da rodada 2 errados (61%); rodada 2 inteira: **79 de 90** acertos até o fim (D12 só 1, D16 7, D17 8).
- **-16** (Lápis, CÁLCULO NOSSO), **185** a **99** (campeão contra último), **155 · 155** (empate em 3º).
- 423 chamadas, 0 falhas.

## 4. Estrutura proposta (~18:00; melhor parte por último; placar secreto até 16:15)

| Tempo | Parte / cena | Observação |
|---|---|---|
| 0:00 a 0:12 | C0 abertura: 7 de 9 "natureza" + jabuti | clímax, sem explicar |
| 0:12 a 0:35 | Título + elenco (10 IAs) | Felipe apresenta, "ideia minha" em 1 frase |
| 0:35 a 0:55 | C1 regras (farol, 19 traços) | ~20 s, 1 exemplo na tela |
| 0:55 a 1:40 | C2 rodada 1 em 45 s + placar do D10 | 87 de 90, 3 gags, plantar "guarda o nome do Pincel" |
| 1:40 a 1:50 | Cartão da rodada 2 (8 traços) | |
| 1:50 a 3:05 | C3 saudade | Tinta viu a lágrima |
| 3:05 a 5:25 | C4 pesadelo | o coração; explica a C0 |
| 5:25 a 6:30 | C5 preguiça | Pai Natal; corta repetição |
| 6:30 a 7:35 | C6 ressaca | todos viram raiva, a garrafa salva |
| 7:35 a 8:25 | C7 engarrafamento + placar do D15 | 3 estacionamentos |
| 8:25 a 9:15 | Interlúdio A: a corrida | mediana em ms |
| 9:15 a 10:00 | Interlúdio B: galeria dos desenhistas | melhor e pior |
| 10:00 a 12:20 | C8 fofoca (D17 antes do D16) | copiar a resposta errada, FUZIL |
| 12:20 a 14:50 | **C9 carnaval (D16): a CENA FINAL** | marciano x dica em L, cascavel |
| 14:50 a 15:20 | C10 eclipse + aniversário | respiro, 9 de 9 |
| 15:20 a 16:15 | C11 churrasco, empate do 3º | último desenho, decide o 3º |
| 16:15 a 18:00 | C12 placar, prêmios, lição, pergunta | |

Ritmo: pelo menos 1 efeito (meme, selo, texto, zoom, som) a cada 15 a 20 s (cada cena acima já tem 3 a 6). Cada cena = 1 evento + 1 virada fechada com selo ou frase. Nunca mais de 2 cenas seguidas com a mesma tela: alternar a tela do jogo (desenho + chat à direita), a tela de "dois balões" (plano contra resultado), a tela de pensamento (balão com eco sobre a IA que chutou), a tela de dado grande (interlúdios) e o mosaico de PNGs (galeria).
Sem transição de lobby: as cenas trocam por corte seco com selo do número do desenho ("DESENHO 12 DE 20") e o nome do desenhista. Haikus: avaliar a cada ~30 s (tela parada, repetição, jargão, "dá para entender o erro?") antes de entregar.
Layout da tela: telas em estilo Gartic nossas (quadro branco 800x600 à esquerda, chat dos chutes à direita, dica em tracinhos em cima, placar curto embaixo), sem usar o logo, as cores ou o nome da marca na arte (só "Gartic" na fala e no título, pedido do Felipe). Cada IA tem retrato SVG (lápis, giz, pincel, borrão...), cor fixa do log.

## 5. Títulos com miniatura coerente

Lição do AU2: título, miniatura e vídeo prometem a mesma coisa; padrão "Coloquei N IAs pra X (e surpresa concreta)", número em vermelho, logos dos modelos conhecidos (Claude, GPT, DeepSeek).
- **A (recomendada): "Coloquei 10 IAs pra jogar Gartic (8 chutaram NATUREZA para um pesadelo)"**
  Miniatura: "10 IAs" em vermelho; o bloco verde do `d12_t4.png` redesenhado em SVG com os dois X; oito balões coloridos, cada um com "NATUREZA", um balão roxo pequeno com "PESADELO" em destaque; seta para o Pincel. Contagem 8 de 9 conferida no log: Pincel, Borrão, Aquarela, Rabisco, Traço, Grafite, Tinta e Giz (que também chutou NATUREZA em algum tique); só o Carvão nunca chutou NATUREZA (ver Conferência). Cumpre na C0 e na C4.
- **B (a da máscara): "10 IAs desenham com 8 traços (a máscara virou mosquito, marciano e cascavel)"**
  Miniatura: a máscara do `d16_t1.png` em SVG no centro, quatro balões com "MOSQUITO", "JOANINHA", "MARCIANO" e "CASCAVEL" (todos palpites reais do log); "10 IAs · 8 TRAÇOS". Cumpre na C9 (a cena final).
- **C (a do absurdo): "Coloquei 10 IAs pra jogar Gartic: a palavra era FOFOCA e uma chutou FUZIL"**
  Miniatura: os dois bonecos de mão no queixo (`d17_t1.png` em SVG) e um balão enorme "FUZIL?"; "10 IAs". Mais calma e mais humorística; menos promessa de clímax visual.
- Descrição: capítulos com a hora de cada desenho (nome da palavra só nos capítulos que já saíram, sem spoiler dos acertos); linha "ideia do Felipe, 10 IAs: Rabisco (Haiku), Aquarela (Sonnet), Borrão (GPT-6 Luna), Giz (MiMo), Pincel (DeepSeek), Lápis (MiniMax), Traço (Nex), Tinta (Qwen), Carvão (GLM), Grafite (Gemma)". Créditos das músicas na descrição (regra do canal). Nada de emoji nos vídeos; emoji só no título/descrição se o Felipe quiser.

## 6. Memes e sons usados (ids únicos; nenhum se repete)
`visible-confusion`, `lets-go`, `silvio-santos-huh`, `picard-facepalm`, `sus-doakes`, `sad-pablo`, `nazare-confusa`, `monkey-side-eye`, `dicaprio-pointing`, `big-brain-patrick`, `confused-travolta`, `roll-safe`, `drake-no`, `one-eternity-later`, `monkey-puppet-awkward`, `shocked-krabs`, `wait-who-are-you`, `we-did-it`, `kermit-worried`, `stonks`, `side-eye-dog`. Faltando para o Fable no fim: `mic-drop` (Pincel campeão) e `crying-jordan` (Grafite último).
Sons: `record-scratch`, `coin`, `notification-pop`, `wrong-buzzer`, `correct-ding`, `crowd-cheer`, `boing`, `error-beep`, `tic-tac`, `gasp`, `drumroll`, `tada`, `crowd-laugh`, `censor-beep` (para o `*****` nas falas).

## 7. Conferência
- Script `scratchpad/verifica_desenha.py` (nesta sessão) leu este arquivo, extraiu cada trecho entre aspas curvas “...” e procurou no `partida1.json` (campos `pensamento`, `chat`, `palpite`, `chatDesenhista`, `pensamentoDesenhista`, `vazamentos.original`), exigindo que o trecho exista palavra por palavra. Resultado da última rodada: 130 citações, todas achadas no json (as 3 que tinham reticências minhas foram separadas em trechos exatos). Contagem de quem chutou NATUREZA em algum tique do D12: 8 IAs (Pincel, Borrão, Aquarela, Rabisco, Traço, Grafite, Tinta, Giz); só o Carvão nunca.
- Números recalculados por script direto no json: placar, pontos de acertos e de desenhista por IA, penalidade, primeiros acertos, acertos no tique 1 por rodada (87 e 29 de 90), erros por IA, medianas de ms, contagem de chutes distintos por desenho.
- Não conferido: o tempo exato dos vídeos (minutagem é proposta, vai mudar com a fala); logos dos modelos para a miniatura.
