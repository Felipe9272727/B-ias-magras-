# 60 Segundos das IAs: cadeias, visitantes e finais (catálogo de eventos)

Fonte: wiki do jogo baixada localmente (Events_60_Seconds_, Endings, Multiple_playthrough_endings, Radio, Military, Bandits, Sharikov, The_Twins, Mary_Jane, Timmy, Dolores, Ted e páginas de visitantes). Itens de 60 Parsecs foram ignorados. Todos os textos são paráfrase nossa, no formato de `FORMATO_EVENTO.md`.

## Contagens

- **Cadeias: 15** (resgate militar; saqueadores/bandidos; rádio e espaço; gêmeos; lado sombrio; gatos/Sharikov; cientista; dona dos gatos; cão Pancake; mutação da filha; ferimentos e agonia; saídas por loucura; carro do pai; sinal do filho; veículo multi-partida).
- **Visitantes: 18** (10 recorrentes na seção 2.1; 8 pontuais na seção 2.2), mais personagens fora de cena (2.3) e grupos pontuais (2.4).
- **Finais: 12** (7 vitórias ou ambíguos, sendo 1 só de desafio; 5 derrotas), mais 1 fim de modo de coleta que NÃO é final.
- **Eventos: 72 entradas** (63 de cadeias + 9 avulsos). Os eventos de item, sim/não, escolher pessoa e mandar alguém ficam com as outras listas; a seção 5 só nomeia os títulos.

## Aviso sobre nomes

A arquitetura pede nomes próprios (nada de nome de personagem do jogo original). Aqui os nomes originais aparecem só como rótulo de referência para cruzar com a fonte. Mapeamento de papéis: pai = Ted; mãe = Dolores; filha = Mary Jane; filho = Timmy; gato = Sharikov; cão = Pancake; cientista = "Doc"; bandido = Bob; comerciante = Willy. Antes de implementar, trocar pelos nomes de `sessenta/familia.mjs` e nomes próprios. A lógica não depende dos nomes.

## Como ler

- Cadeia: passo com id (`mil_1`, `gem_2` etc.). "Não usar o item pedido" = o passo não avança e se repete.
- "Requer" indica item, pessoa ou nada. Efeitos entre parênteses ou após "→" são da fonte.
- "Observações" marca conflitos entre fontes e lacunas (chance e dia não informados quando a fonte não diz).

---

## 1. CADEIAS

### 1.1 Cadeia: resgate militar (cadeia:militar)

Regra geral: a cadeia só existe se houver um rádio funcionando no abrigo. Cada passo tem várias versões (sorteadas). Se a família não usar o item pedido, o passo NÃO avança e volta (a fonte diz que o evento se repete "em vez de progredir"). O prazo típico entre passos é de cerca de 10 a 12 dias quando a família falha. O passo final (resgate) é uma VITÓRIA.

#### mil_1 — Primeiro contato militar (2 variantes)

### mil_1a — Contato pelo rádio
- grupo: cadeia:militar (passo 1, variante A)
- aparece quando: rádio funcionando no abrigo; sorteado entre os eventos de rádio.
- frequência: não informada.
- situação: uma transmissão diz que há militares vindo buscar sobreviventes; a família precisa captar o sinal.
- escolhas:
  - rádio (requer: rádio): contato feito → avança para mil_2 (cadeia militar começa).
  - nada (requer: nada): nada acontece; o passo não avança.
- observações: a fonte não diz se o evento reaparece sozinho; tratamos como "não avança".

### mil_1b — Ponto de resgate com tanque abandonado
- grupo: cadeia:militar (passo 1, variante B; também usa "Tanque" de expedição)
- aparece quando: sorteado; a família precisa de uma expedição.
- frequência: não informada.
- situação: um tanque danificado está parado perto de casa; alguém pode ser enviado para investigar.
- escolhas:
  - mandar alguém (requer: nada; quem sai é escolhido pelo jogador): ao chegar, um dos desfechos sorteados (fonte não dá chance) → ver observações.
    - desfecho 1: acha um rádio funcional no tanque e faz contato militar → avança para mil_2 (cadeia começa). Pode também dar rádio extra (às vezes).
    - desfecho 2: 1 sopa + 1 água.
    - desfecho 3: máscara de gás.
    - desfecho 4: rifle militar.
    - desfecho 5: 1 munição (ou munições soltas).
    - desfecho 6: o tanque tinha uma armadilha/explosivos: a família enviada MORRE (a fonte lista "Ted/Dolores/Mary Jane/Timmy" como mortes possíveis; o morto é quem foi enviado).
  - não mandar (requer: nada): nada acontece; o passo não avança.
- observações: a fonte deixa a probabilidade de cada desfecho aberta. Qual membro morre no desfecho 6 é inferido (quem saiu). A fonte não diz se o tanque pode aparecer depois de mil_1a.

#### mil_2 — Segundo passo (3 variantes)

### mil_2a — Sinal com lanterna (avião de reconhecimento)
- grupo: cadeia:militar (passo 2, variante A)
- aparece quando: cadeia militar iniciada (mil_1 completo).
- frequência: única por tentativa; repete se falhar.
- situação: os militares pedem que a família fique ao ar livre com uma lanterna para ser vista de avião à noite.
- escolhas:
  - lanterna (requer: lanterna): o sinal é feito → avança para mil_3. Um defeito na lanterna no meio do processo não impede (a família consegue consertar a tempo).
  - nada (requer: nada): o sinal não é feito; o passo se repete.
- observações: ver "Lanterna" nas listas de item.

### mil_2b — Recado em garrafa (mapa com coordenadas)
- grupo: cadeia:militar (passo 2, variante B)
- aparece quando: cadeia militar iniciada.
- frequência: única por tentativa.
- situação: os militares dão coordenadas e pedem que um sinal de "ainda vivos" seja deixado no local.
- escolhas:
  - mapa (requer: mapa): avança para mil_3.
  - nada (requer: nada): não encontram o lugar; o passo se repete.
- observações: nenhuma.

### mil_2c — Cartas no ponto de ônibus (sinal de presença)
- grupo: cadeia:militar (passo 2, variante C)
- aparece quando: cadeia militar iniciada.
- frequência: única por tentativa.
- situação: os militares pedem que a família deixe cartas de baralho no ponto de ônibus mais próximo para marcar quantos estão no abrigo.
- escolhas:
  - baralho (requer: baralho de cartas): avança para mil_3.
  - nada (requer: nada): o passo se repete.
- observações: nenhuma.

#### mil_3 — Terceiro passo (4 variantes)

### mil_3a — Reabastecer com gás (máscara de gás)
- grupo: cadeia:militar (passo 3, variante A)
- aparece quando: mil_2 concluído.
- situação: os militares pedem latas de gás levadas ao ponto de ônibus. Sem máscara, a família adoece no trajeto.
- escolhas:
  - máscara de gás (requer: máscara de gás): avança para mil_4.
  - nada (requer: nada): o passo se repete (o resgate atrasa).
- observações: nenhuma.

### mil_3b — Sinal com harmônica (hino em colina)
- grupo: cadeia:militar (passo 3, variante B)
- aparece quando: mil_2 concluído.
- situação: os militares pedem que a família suba uma colina e faça barulho forte para ser localizada.
- escolhas:
  - harmônica (requer: harmônica): avança para mil_4.
  - nada (requer: nada): o passo se repete.
- observações: nenhuma.

### mil_3c — Corte de árvores no parque (machado)
- grupo: cadeia:militar (passo 3, variante C)
- aparece quando: mil_2 concluído.
- situação: os militares pedem que a população corte árvores no parque para facilitar a extração.
- escolhas:
  - machado (requer: machado): avança para mil_4. O machado quebra no processo.
  - nada (requer: nada): o passo se repete.
- observações: nenhuma.

### mil_3d — Entrega de armas (rifle)
- grupo: cadeia:militar (passo 3, variante D)
- aparece quando: mil_2 concluído.
- situação: os militares mandam entregar as armas de fogo antes do resgate. A família decide entre obedecer e manter a arma.
- escolhas:
  - entregar o rifle (requer: rifle, o rifle é perdido): avança para mil_4.
  - não entregar (requer: nada) e ter rifle: nada avança (o passo se repete); a fonte deixa claro que a família "não obedece".
  - não entregar, SEM rifle (ou rifle quebrado): avança para mil_4 (não há o que entregar).
- observações: a fonte lista a condição "sem rifle" como caminho de avanço.

#### mil_4 — Encontro às cegas (1 variante)

### mil_4 — Encontro com os militares (pessoa enviada)
- grupo: cadeia:militar (passo 4)
- aparece quando: qualquer desfecho do passo 3 (mil_3a/b/c/d) concluído.
- situação: um militar pede que uma pessoa da família vá a um local para responder perguntas sobre o grupo.
- escolhas:
  - mandar alguém (requer: nada; o jogador escolhe a pessoa): a pessoa vai e responde → avança para mil_5. A pessoa enviada sai do abrigo (é um passo de expedição).
  - não mandar (requer: nada): nada avança; o passo se repete.
- observações: a fonte diz que a dúvida é se é uma armadilha (bandidos). Mandar alguém aqui não tem consequência de morte escrita.

#### mil_5 — Batida na porta (final da cadeia)

### mil_5 — Batida na porta (resgate ou emboscada)
- grupo: cadeia:militar (passo 5; decisivo)
- aparece quando: mil_4 concluído.
- situação: alguém bate forte na porta do abrigo; a família decide abrir.
- escolhas:
  - abrir (requer: nada): desfecho sorteado entre três (todas as três falas aparecem como resultado):
    - a) RESGATE: os militares entram e levam a família → FINAL VITÓRIA "militar" (ver seção 3).
    - b) EMBOSCADA: são bandidos que batem; a família é amarrada e os suprimentos são saqueados → final de saque (sem fim de jogo, conforme a fonte: "all supplies").
    - c) NINGUÉM: a porta abre e não há nada (brincadeira) → nada acontece.
  - não abrir (requer: nada): nada acontece; "esperar os militares" (a fonte diz que é quem bate).
- observações: CONFLITO na fonte. A página militar avisa que, se o evento aparecer ATÉ 10 dias após o encontro às cegas (mil_4), abrir a porta é emboscada de bandidos (saque, ou derrota imediata). A lista de eventos diz que abrir tem 3 desfechos incluindo o resgate. Propomos: se ocorrer dentro de 10 dias após mil_4, abrir = emboscada; depois de 10 dias, abrir = 3 desfechos sorteados. Confirmar.

### 1.2 Cadeia: saqueadores / bandidos (cadeia:bandidos)

Os bandidos (saqueadores) são a principal ameaça externa. Aparecem depois que a família faz expedições seguidas (ou é seguida no exterior). A família recebe um aviso de que foi seguida. Depois da primeira vez, a família tem cerca de 20 dias antes de os bandidos tomarem a área. Quando a área está tomada, a expedição é quase certa de captura ou morte (a tela de preparação mostra isso).

Regra geral: a casa é defendida até 10 vezes antes que os bandidos invadam (com rifle, pode durar mais). A harmônica também conta como defesa.

#### bnd_1 — Primeiro aviso de ataque (cerco)

### bnd_1 — Cerco à porta (defesa)
- grupo: cadeia:bandidos (ameaça recorrente)
- aparece quando: após a família ser seguida numa expedição; repete (pode ser o evento de defesa da casa).
- frequência: repete; a cada defesa conta para o limite de 10.
- situação: um grupo ameaça invadir o abrigo, exigindo que a família se renda ou lute.
- escolhas:
  - cadeado (requer: cadeado): a defesa funciona; o cadeado é gasto (uma vez). Dá a conquista "Pacifista" se nenhuma arma for usada (ver finais/conquistas).
  - machado (requer: machado): a defesa funciona; o machado quebra.
  - rifle com munição (requer: rifle + munição): a defesa funciona; a munição é gasta.
  - rifle sem munição (requer: rifle sem munição): a defesa funciona; o rifle vira sucata (fica quebrado).
  - harmônica, 1ª vez (requer: harmônica): os invasores baixam as armas e a família sobrevive ("por hoje").
  - harmônica, 2ª vez seguida (requer: harmônica): os invasores fogem com a arma abaixada e a harmônica é roubada; a fonte cita um relato de bug em que a harmônica NÃO some.
  - spray de inseto (requer: spray): os bandidos ficam lentos mas entram e roubam alguns cans de sopa (2 latas); o spray é gasto. Pode ferir alguém.
  - nada, com Mary Jane mutante (requer: Mary Jane mutante presente): ela ataca os bandidos; na 1ª vez eles fogem, na 2ª vez ela os persegue e MORRE (fora do abrigo).
  - nada, com Pancake presente (requer: cachorro Pancake): Pancake afasta os invasores e SAI do abrigo (não volta, a fonte diz "tem uma sensação de que está bem").
  - nada, com grupo de mutantes amigos: os mutantes afastam os invasores (ver visitantes: os seis-braços).
  - nada, sem defesa: os bandidos entram: sequência "invasão" (bnd_3).
- observações: a fonte não dá chance para cada defesa. Cada defesa conta para a conquista "Inquebrável" (3 defesas).

#### bnd_2 — Ajuda aos cativos (vingança)

### bnd_2 — Ataque ao acampamento dos bandidos (desforra)
- grupo: cadeia:bandidos
- aparece quando: sorteado depois que os bandidos estão no bairro (ou no acampamento na rua); evento de "desforra". A fonte indica que pode ser o evento principal de desforra.
- situação: o acampamento dos bandidos perto de casa faz barulho; alguém decide atacar.
- escolhas:
  - rifle ou machado (requer: rifle ou machado; a pessoa enviada sai armada): ataque → desfecho sorteado:
    - a) fracasso: a expedição sofre tiros; a pessoa pode ser ferida (sem morte escrita). O rifle ou machado é perdido.
    - b) saque: entram num acampamento sem vigia e pegam o que puderem (RANDOM: item aleatório) e voltam.
    - c) bravata: entram gritando, o acampamento está vazio; pegam itens do acampamento (RANDOM) e voltam.
    - d) resgate de Ted (se Ted está preso): Ted volta ao abrigo.
    - e) resgate de Dolores (se Dolores está presa): Dolores volta ao abrigo.
    - f) resgate de Mary Jane (se presa): Mary Jane volta.
    - g) resgate de Timmy (se preso): Timmy volta.
  - nada (requer: nada): nada acontece; a família decide não se arriscar.
- observações: a fonte escreve "Rifle/Machado" em todos os desfechos, mas a arma usada muda o texto. Os desfechos 'd' a 'g' só existem se o membro estiver preso (ver bnd_3). Conquista "Libertação" ao libertar alguém.

### bnd_3 — Sequestro por bandidos (cativos)
- grupo: cadeia:bandidos (consequência de cerco perdido)
- aparece quando: a casa foi invadida ou ataque na porta sem defesa; OU durante expedição com a área tomada.
- situação: os bandidos levam um membro da família para o acampamento.
- escolhas:
  - não há escolha: o membro é levado. Quem é levado vira "preso" (pode ser resgatado por bnd_2).
  - Quem pode ser levado (texto da fonte): Ted; Dolores; Mary Jane (que luta e pode ficar mutante); Timmy.
- observações: pelo texto, o sequestro é um desfecho do cerco (quando a família não se defende) e da invasão com muita tropa. Não há chance escrita.

### bnd_4 — Invasão do abrigo (derrota)
- grupo: cadeia:bandidos; final
- aparece quando: cerco perdido com a família desprotegida (sem defesa e sem Mary Jane mutante).
- situação: os bandidos entram e tomam o abrigo.
- escolhas:
  - não há escolha: fim do jogo (3 textos de derrota, equivalentes). Ver seção 3, final "invasão".
- observações: a fonte diz que, se a família tivesse aguentado mais um pouco, os militares teriam resgatado. Isso pode ser usado como dica para o final militar.

### bnd_5 — Mutantes amigos (aliados)
- grupo: cadeia:bandidos (aliados)
- aparece quando: a família deu suprimentos aos mutantes de seis braços (ver visitantes: "seis-braços").
- situação: os mutantes aparecem e afastam os bandidos.
- escolhas:
  - não há escolha; defesa automática sem custo.
- observações: a fonte deixa claro que é a mesma invasão de bnd_1 com o efeito "afastam".

### 1.3 Cadeia: rádio e espaço (cadeia:radio_espaco)

#### rad_esp_1 — Transmissão estranha (ruído)
- grupo: cadeia:radio_espaco (passo 1)
- aparece quando: rádio no abrigo; sorteado entre eventos de rádio.
- frequência: não informada.
- situação: sinais estranhos atrás da estática; a família decide sintonizar.
- escolhas:
  - sim, sintonizar (requer: rádio): avança para rad_esp_2; a fonte não diz o efeito imediato.
  - não (requer: nada): não avança; a fonte diz que a família pensa que pode ser "fim de rádio" (nada).
- observações: a fonte indica que, sem rádio, o evento não ocorre.

#### rad_esp_2 — Mulher no espaço (ataque) (passo 2; evento com Sim/Não)
- grupo: cadeia:radio_espaco (passo 2)
- aparece quando: após "Sintonizar" em rad_esp_1 (mesmo dia ou depois).
- situação: uma voz feminina diz que a tripulação enlouqueceu e comeu a sopa; depois, sons de ataque.
- escolhas:
  - sim (requer: nada): avança para rad_esp_3 (ver observações: "a casa dela") e ganha 2 latas de sopa.
  - não (requer: nada): nada acontece (o passo termina).
- observações: a fonte cita a casa no espaço e a conquista de entrar ou não. A referência é a personagem de OUTRO jogo (60 Parsecs); NÃO usar nomes ou elementos dela. Nosso texto: "voz de espaço", sem nome.

#### rad_esp_3 — Visita ao endereço (passo 3)
- grupo: cadeia:radio_espaco (passo 3)
- aparece quando: rad_esp_2 "sim".
- situação: a família decide ir ao endereço recitado.
- escolhas:
  - ir (requer: nada): ganha 2 latas de sopa (a fonte lista o efeito); a família ganha a conquista de entrar na casa.
  - não ir (requer: nada): nada; ganha a conquista de não entrar.
- observações: efeito de risco (monstro) é só citado; não há efeito explícito de morte.

#### rad_esp_4 — Eco de ajuda (harmônica) (passo 4)
- grupo: cadeia:radio_espaco (passo 4)
- aparece quando: "Não" no passo rad_esp_2 e harmônica no abrigo (a fonte tem a condição; o evento aparece no rádio depois).
- situação: a transmissão continua fraca, com bipes e algo parecido com uma harmônica.
- escolhas:
  - sim, tocar a harmônica lá fora (requer: harmônica): luzes piscam no céu e respondem; a família ganha +sanidade (efeito "aumenta a sanidade de todos") e a conquista "não estamos sozinhos".
  - não (requer: nada): nada acontece; a família tem medo de os alienígenas destruírem o bairro.
- observações: a fonte escreve a sequência de luzes em código morse. Não copiar o código de texto; manter só a ideia de "resposta por luz". (Nosso texto: "as luzes mandam uma sequência de pulsos".)

### 1.4 Cadeia: gêmeos (cadeia:gemeos)

Regra geral: a cadeia não exige item para entrar; só os itens pedidos em cada passo. Se a família falha num passo (não tem o item ou não manda ninguém), o passo se repete a cada ~10 dias. A cadeia é bloqueada para sempre se a família roubar em QUALQUER evento do "lado sombrio" (cadeia:lado_sombrio). O resgate chega cerca de 20 dias após o terceiro passo (fonte da wiki); o passo final é uma VITÓRIA.

#### gem_1 — Telefone do orelhão (passo 1)

### gem_1 — Telefone tocando
- grupo: cadeia:gemeos (passo 1)
- aparece quando: sorteado no início da cadeia (sem item; a fonte não dá dia).
- frequência: única por tentativa; repete se falhar.
- situação: um orelhão da rua, sobrevivente à explosão, toca.
- escolhas:
  - mandar alguém (requer: nada; quem sai é escolhido): a pessoa atende; alguém do outro lado diz ser de outra cidade e a ligação cai → avança para gem_2 ("cadeia gêmeos começa").
    - (variante da fonte no Eventos: a pessoa é baleada na rua por um bandido → ferimento; OU a gravação é só de uma propaganda de sopa → nada.) Estes desfechos NÃO avançam.
  - não mandar (requer: nada): nada avança; a família perde sanidade (todos -sanidade) porque o toque incomoda por muito tempo.
- observações: a fonte da cadeia (Gêmeos) diz que mandar alguém começa a cadeia; a lista de eventos traz a versão com ferimento e a versão de propaganda. Qual versão é a "certa" não está claro.

#### gem_2 — Pedido de ajuda (passo 2; 3 variantes)

### gem_2a — Reencontro do irmão (sequestrado por bandidos)
- grupo: cadeia:gemeos (passo 2, variante A)
- aparece quando: gem_1 concluído.
- situação: uma jovem de branco pede ajuda para resgatar o irmão gêmeo, preso num acampamento de bandidos.
- escolhas:
  - mandar alguém (requer: nada; a pessoa sai; a fonte cita um grupo de sobreviventes armados que ajuda): sucesso → avança para gem_3 (o irmão é achado, perdeu uma mão, os gêmeos agradecem).
  - não mandar (requer: nada): nada avança; o pedido volta.
- observações: a fonte diz que o pai dos gêmeos é o chefe dos bandidos (sem efeito de jogo).

### gem_2b — Carta de "amigos" (mandar 1 pessoa sem armas)
- grupo: cadeia:gemeos (passo 2, variante B)
- aparece quando: gem_1 concluído.
- situação: um bilhete no encontro pede que a família mande uma pessoa desarmada a um lugar à noite.
- escolhas:
  - mandar alguém (requer: nada; a pessoa vai DESARMADA; se a família tiver arma, a pessoa fica sem): avança para gem_3 (os gêmeos apresentam um grupo de sobreviventes).
  - não mandar (requer: nada): nada avança; a família decide esperar pelos militares (a fonte diz que é uma alternativa).
- observações: a fonte fala em "desarmado" mas não diz o que acontece se a pessoa levar arma. Tratamos como "sem arma exigida".

### gem_2c — Carta de apoio (suprimentos)
- grupo: cadeia:gemeos (passo 2, variante C)
- aparece quando: gem_1 concluído.
- situação: uma carta sem assinatura pede que a família leve suprimentos a um ponto marcado.
- escolhas:
  - 1 lata de sopa (requer: sopa, 1 unidade; a lata é gasta): avança para gem_3.
  - nada (requer: nada): nada avança.
- observações: nenhuma.

#### gem_3 — Pedido de ajuda (passo 3; 3 variantes)

### gem_3a — Construção de casa (machado)
- grupo: cadeia:gemeos (passo 3, variante A)
- aparece quando: gem_2 concluído.
- situação: os gêmeos pedem ajuda para cortar madeira para o acampamento.
- escolhas:
  - machado (requer: machado; o machado é danificado): avança para gem_4.
  - nada (requer: nada): nada avança.
- observações: a fonte diz que, sem machado, a família não consegue atender; isso só repete.

### gem_3b — Remédios para os feridos (kit médico)
- grupo: cadeia:gemeos (passo 3, variante B)
- aparece quando: gem_2 concluído.
- situação: pessoas do acampamento foram feridas numa emboscada; pedem remédios.
- escolhas:
  - kit médico (requer: kit médico; o kit é gasto): avança para gem_4.
  - nada (requer: nada): nada avança.
- observações: nenhuma.

### gem_3c — Mapa da cidade (planejar o acampamento)
- grupo: cadeia:gemeos (passo 3, variante C)
- aparece quando: gem_2 concluído.
- situação: os gêmeos procuram um lugar seguro e pedem o mapa.
- escolhas:
  - mapa (requer: mapa; o mapa é entregue e não volta): avança para gem_4 (eles recomendam evitar campos de bandidos).
  - nada (requer: nada): nada avança.
- observações: nenhuma.

#### gem_4 — Ninho de baratas (passo 4; 3 variantes)

### gem_4a — Ninho de baratas mutantes
- grupo: cadeia:gemeos (passo 4, variante A)
- aparece quando: gem_3 concluído.
- situação: há um ninho de baratas mutantes no acampamento; os gêmeos pedem ajuda para destruí-lo.
- escolhas:
  - spray de inseto OU rifle OU machado (requer: um deles; o item é gasto ou danificado conforme o caso): avança para gem_5 (o ninho acaba).
  - nada (requer: nada): nada avança.
- observações: a fonte diz que, sem nenhum item, a família não ajuda (o passo repete).

### gem_4b — Diversão para as crianças (jogos)
- grupo: cadeia:gemeos (passo 4, variante B)
- aparece quando: gem_3 concluído.
- situação: as crianças do acampamento estão entediadas; pedem brinquedos.
- escolhas:
  - harmônica (requer: harmônica): avança para gem_5.
  - baralho (requer: baralho): avança para gem_5.
  - damas (requer: damas): avança para gem_5.
  - nada (requer: nada): nada avança.
- observações: nenhuma.

### gem_4c — Escola (livros)
- grupo: cadeia:gemeos (passo 4, variante C)
- aparece quando: gem_3 concluído.
- situação: o acampamento quer uma escola; pede livros.
- escolhas:
  - livro de escoteiro (requer: livro de escoteiro; o livro é doado e não volta): avança para gem_5.
  - nada (requer: nada): nada avança. A família diz que o livro é o único que tem.
- observações: nenhuma.

#### gem_5 — Batida na porta (final da cadeia)

### gem_5 — Convite para viver no acampamento
- grupo: cadeia:gemeos (passo 5; decisivo)
- aparece quando: gem_4 concluído.
- situação: alguém bate forte na porta; os gêmeos convidam a família para morar no acampamento.
- escolhas:
  - abrir (requer: nada): VITÓRIA "gêmeos" → a família deixa o abrigo (ver seção 3).
  - não abrir (requer: nada): nada avança; a fonte diz "esperar os militares".
- observações: a fonte deixa o final dos gêmeos no mesmo evento "batida" dos militares; cada um precisa de sua cadeia para ser o evento certo.

### 1.5 Cadeia: lado sombrio / roubos (cadeia:lado_sombrio)

Eventos de roubo. Cada um cria uma "mancha de sangue" na parede (marca permanente) e impede o final dos gêmeos. NÃO impede o final militar (a fonte diz que os militares ainda resgatam). A conquista "O Lado Sombrio" vem com o "sim" em um dos eventos.

#### lado_1 — Professor da escola (roubo)
- grupo: cadeia:lado_sombrio
- aparece quando: sorteado; a família precisa de suprimentos (fonte não dá dia).
- situação: um professor abrigou crianças num prédio; a família pode roubar o estoque da escola.
- escolhas:
  - sim (requer: nada): desfecho sorteado: 4 latas de sopa OU 4 água OU item aleatório; +sanidade diminui (todos); mancha de sangue; gêmeos cancelam o resgate. Há um desfecho de ataque (com bloco de tijolos e setas) que fere alguém.
  - não (requer: nada): +sanidade para todos (a família se sente melhor).
- observações: a fonte tem 3 desfechos no "sim" (2 com recompensa e 1 sem texto de recompensa).

#### lado_2 — Idosos do asilo (roubo)
- grupo: cadeia:lado_sombrio
- aparece quando: sorteado.
- situação: um grupo de idosos tem suprimentos.
- escolhas:
  - sim (requer: nada): desfecho sorteado: 4 sopa + 4 água (sanidade diminui; mancha; gêmeos cancelados) OU item aleatório (idem) OU fracasso (os idosos batem e a família se machuca; a fonte também diz que os idosos eram veteranos).
  - não (requer: nada): sanidade sobe muito para todos.
- observações: nenhuma.

#### lado_3 — Vizinha com porta de alçapão (roubo)
- grupo: cadeia:lado_sombrio
- aparece quando: sorteado.
- situação: uma vizinha e seus filhos têm suprimentos num abrigo com porta quebrada.
- escolhas:
  - sim (requer: nada): desfecho sorteado: 4 sopa + 4 água OU item aleatório (sanidade diminui; mancha; gêmeos cancelados) OU fracasso (estilingues e armadilhas; sem recompensa; mancha; gêmeos cancelados).
  - não (requer: nada): sanidade sobe.
- observações: a fonte escreve "efeito desconhecido" para uma das saídas da versão de "sinal de perigo".

### 1.6 Cadeia: gatos e Sharikov (cadeia:gatos)

Sharikov é um gato. Ele é obtido de dois jeitos (ver visitantes: "vendedor com saco" e o evento "Sobrevivente improvável"). Enquanto Sharikov está no abrigo: Pancake não aparece (são mutuamente exclusivos), não há infestações de insetos, e a sanidade da família é restaurada quando ele chega.

#### gato_1 — Gato da ruína (obtenção)
- grupo: cadeia:gatos (entrada)
- aparece quando: após um gato sair da ruína de uma favela de bandidos; sorteado (sem dia).
- frequência: única.
- situação: um gato aparece atrás da porta, sujo de sangue.
- escolhas:
  - deixar entrar (requer: nada): Sharikov fica no abrigo (ganha o gato; ele tem coleira com nome).
  - não deixar (requer: nada): nenhum efeito escrito (a fonte deixa a lacuna "???").
- observações: a fonte não escreve o efeito do "não".

#### gato_2 — Eventos passivos com Sharikov (aleatórios, todos os dias)
Eventos de dia com Sharikov presente. A fonte lista:
- gato_2a "Presente do gato": um rato brilhante morto na porta → a família pode ficar doente (alguém adoece).
- gato_2b "Tesouro (munição)": munição escondida atrás de tijolo.
- gato_2c "Tesouro (mapa)": um mapa numa caixa de madeira.
- gato_2d "Tesouro (spray)": um spray de inseto numa caixa.
- gato_2e "Alergia de Ted" (se Ted está no abrigo): Ted adoece (remédio ajuda).

#### gato_3 — Fio de luz (passo ativo; 2 escolhas)
- grupo: cadeia:gatos (ramo "fio")
- aparece quando: Sharikov no abrigo; sorteado.
- situação: o gato puxa um fio do teto; ele leva a algo na vizinhança.
- escolhas:
  - examinar o fio (requer: nada): leva a um caminhão com homens de fones de ouvido (grampo no abrigo) → ramo "agentes" (ver gato_4).
  - deixar o gato ficar com o fio (requer: nada): nada acontece no momento; a fonte diz que, por este caminho, o gato acaba levando a família ao cientista (ver gato_5).
- observações: a fonte diz que, se o fio não for examinado, o contato é com o cientista.

#### gato_4 — Agentes (ramo "fio" examinado)
- grupo: cadeia:gatos (ramo "agentes"; final "agentes")
- aparece quando: gato_3 (examinar o fio) concluído.
- situação: os agentes explicam que o gato é suspeito de espionagem (por isso havia grampo) e oferecem um abrigo do governo.
- escolhas:
  - sim (requer: nada): os agentes pedem tarefas (eventos em sequência) → ao completá-las em ordem, por volta do dia 50-60, alguém bate na porta (evento de agentes) → abrir = FINAL "agentes" (abrigo presidencial, VITÓRIA ambígua).
  - não (requer: nada): a família recusa; ramo fecha (fonte não diz se o final fica bloqueado).
- observações: a fonte diz que, se a sequência falhar, o final é bloqueado. Exige Sharikov investigar (o gato precisa estar no abrigo) e a família deixar os agentes explicarem.

#### gato_5 — Cientista (ramo "corrida")
- grupo: cadeia:gatos → cadeia:cientista
- aparece quando: Sharikov saiu escondido do abrigo e a família o seguiu (gato_6) OU a família deixou o gato ir pelo fio sem examinar.
- situação: o gato sai de noite pelo buraco da parede; a família o segue até um ferro-velho com um ônibus-laboratório.
- escolhas:
  - seguir (requer: nada): leva ao cientista (cadeia:cientista, passo 1).
  - não seguir (requer: nada): nada; a família respeita a independência do gato.
- observações: nenhuma.

### 1.7 Cadeia: cientista maluco (cadeia:cientista)

O cientista (chamado "Doc") mora num ônibus transformado em laboratório, num ferro-velho. Ele pede ajuda com experimentos. Final: foguete para o espaço (ver seção 3).

#### cien_1 — Pedido de suprimentos
- grupo: cadeia:cientista (passo 1)
- aparece quando: visita ao cientista (gato_5 seguido).
- situação: o cientista pede 4 garrafas de água OU 4 latas de sopa para o experimento.
- escolhas:
  - dar 4 água OU 4 sopa (requer: 4 água ou 4 sopa): avança para cien_2.
  - não dar (requer: nada): o cientista pede de novo (até 3 vezes, depois para de pedir e a cadeia fecha no ramo).
- observações: a fonte diz que o pedido se repete 3 vezes antes de parar. Não diz quanto tempo.

#### cien_2 — Voluntário para teste
- grupo: cadeia:cientista (passo 2)
- aparece quando: cien_1 concluído.
- situação: o cientista pede uma pessoa da família como cobaia.
- escolhas:
  - mandar uma pessoa (requer: nada; a pessoa escolhida é quem fica exposta): o teste sempre volta com a pessoa ENLOUQUECIDA (loucura); pode voltar ferida, doente e com fome. Avança para cien_3.
  - não mandar (requer: nada): o cientista desiste; a cadeia não avança.
- observações: a fonte fala em "a pessoa sempre volta louca". Estado extra é aleatório.

#### cien_3 — Foguete (final)
- grupo: cadeia:cientista (passo 3; final)
- aparece quando: cien_2 concluído e alguns dias sobrevividos.
- situação: o cientista constrói um foguete para levar a família ao espaço.
- escolhas:
  - não há escolha: final "Alcançar as estrelas" (ver seção 3).
- observações: a fonte diz "sobreviver alguns dias após o teste". Número de dias não informado.

### 1.8 Cadeia: gato-senhora (cadeia:gatos_final)

Esta cadeia é a "dona dos gatos" (ver final "Senhora dos Gatos" na seção 3). Ela começa no dia 50 (no mínimo) com Sharikov no abrigo.

#### catl_0 — Geladeira-clonadora (início; dia 50+)
- grupo: cadeia:gatos_final (início)
- aparece quando: Sharikov no abrigo; dia 50 ou depois; a família NÃO pode ter feito nenhum final de Sharikov.
- situação: a família acha uma geladeira; Sharikov entra nela e ela vira uma máquina de clonar.
- escolhas:
  - nenhuma (sem item): a máquina passa a criar um gato por dia. Cada gato come 1 lata de sopa por noite (-1 sopa por dia).
- observações: a fonte diz "Dominação Felina" (final ruim) se a sopa acabar. Um requisito geral dos "Sharikov finais" é ter 9 latas de sopa no início.

#### catl_1 até catl_8 — Eventos de gatos (um por dia, na ordem)
Cada dia gasta 1 lata de sopa (ou 2, quando há 2 gatos). Os gatos novos têm nomes; o evento mostra quais aparecem.
- catl_1: -1 sopa; surge um gato novo ("Vera") que rasga a sopa.
- catl_2: -1 sopa; surge o gato "Beren".
- catl_3: -1 sopa; surge o gato "Deerme" (três gatos novos no total).
- catl_4: -1 sopa; surge o gato "Mat" (a família desconfia da geladeira).
- catl_5 ou catl_6 (intercambiáveis): -1 sopa; surge o gato "Mith"; a família fala com Sharikov.
- catl_5 ou catl_6 (intercambiáveis, o outro): -1 sopa; surge o gato "Rad"; a família vê a geladeira clonando.
- catl_7: -1 sopa; uma pessoa da família enlouquece; surge "Pawka" OU "Solid" (uma delas).
- catl_8: -1 sopa; surgem 2 gatos ("Solid" ou "Pawka" + "Azya").
- observações: a fonte deixa a ordem de catl_5 e catl_6 intercambiável. No total, cada gato custa 1 sopa.

#### catl_9 — Final "Senhora dos Gatos" (vitória estranha)
- grupo: cadeia:gatos_final (final)
- aparece quando: 9 gatos clonados (ou 10 gatos no total no abrigo) SEM ter acabado a sopa.
- situação: os gatos mantêm a família alimentada e a família se submete.
- escolhas:
  - não há escolha: final "Você sobreviveu... mais ou menos" (ver seção 3).
- observações: CONFLITO: a página do Sharikov diz que vale com qualquer membro da família; a página Endings diz que só com UM membro da família no abrigo. Ver seção 3.

#### catl_X — Dominação Felina (derrota)
- grupo: cadeia:gatos_final (final ruim)
- aparece quando: a sopa acaba antes de 9 gatos (com Sharikov no abrigo, dia 50+).
- situação: os gatos declaram o regime deles.
- escolhas:
  - não há escolha: final "Dominação Felina" (ver seção 3).
- observações: a fonte diz que a família segue "obediente" ao regime. O final de "gatos tomam o abrigo" (ver seção 3) é outra saída de quem perde sopa com a condição de Cat Lady.

### 1.9 Cadeia: cão Pancake (cadeia:cao)

Pancake é um cachorro que aparece na porta depois de uma expedição com lanterna. É mutuamente exclusivo com Sharikov (o gato): se Sharikov entrar antes, os eventos do cão somem. Se Pancake já estiver no abrigo e a família pegar Sharikov, o cão vai embora (conquista "Chovendo gatos e cães").

#### cao_1 — Cachorro na noite (início)
- grupo: cadeia:cao (passo 1)
- aparece quando: a família usa a lanterna no evento "Fera no escuro" (evento de ataque no escuro, ver abaixo).
- frequência: única.
- situação: uma criatura rosna no escuro, na saída do abrigo.
- escolhas:
  - veneno/spray (requer: spray de inseto): a criatura é afastada; nada mais acontece (o cão não aparece). Fim do ramo.
  - rifle (requer: rifle): a criatura foge. Fim do ramo.
  - lanterna (requer: lanterna): é um cachorro cansado; a família o deixa passar a noite. Próximo dia: o cão VOLTA e a cadeia começa (cao_2).
  - nada (requer: nada): a família grita e a criatura foge. Fim do ramo.
- observações: a fonte diz que, com lanterna, o cão sai na manhã seguinte e some (volta depois).

#### cao_2 — Volta do cão (passo 2)
- grupo: cadeia:cao (passo 2)
- aparece quando: cao_1 com lanterna concluído.
- situação: o cão volta, faminto, batendo na porta.
- escolhas:
  - dar sopa (requer: sopa, 1 lata): o cão se recupera e a família o batiza de "Pancake". Avança para cao_3.
  - nada (requer: nada): a família não alimenta; o ramo termina (o cão some).
- observações: a fonte fala da "sopa" como item que faz o cão voltar. Algumas variações pedem "uma lata de sopa" ou "lanterna + sopa".

#### cao_3 — Saída com o cão (passo 3; 3 escolhas)
- grupo: cadeia:cao (passo 3)
- aparece quando: cao_2 com sopa concluído; o cão pede para segui-lo na vizinhança.
- situação: Pancake quer que a família siga ele por uma rua.
- escolhas:
  - mapa (requer: mapa): a família volta com 2 latas de sopa (3 se o livro de escoteiro estiver no abrigo) e Pancake acompanha por um trecho antes de sair.
  - rifle (requer: rifle): a família é baleada por um bandido (uma pessoa ferida); o cão foge e NÃO volta. Ramo termina.
  - machado (requer: machado): a família enfrenta dois bandidos com o machado; o cão ajuda; a família ganha 4 latas de água (ou 2, em outro desfecho sorteado). Avança para cao_4.
  - nada (requer: nada): a família não sai. Ramo termina.
- observações: o desfecho do mapa e do machado tem variantes com números diferentes; a fonte diz "3 sopas" com o livro de escoteiro.

#### cao_4 — Ferido (passo 4; decisivo)
- grupo: cadeia:cao (passo 4)
- aparece quando: cao_3 (machado) concluído.
- situação: Pancake volta ferido a tiros; pede remédio.
- escolhas:
  - kit médico (requer: kit médico, gasta): Pancake se recupera e ENTRA PARA O ABRIGO (passa a trazer itens extras em expedições). Final de cão (sem fim de jogo).
  - nada (requer: nada): a família enterra Pancake perto da casa. Ramo termina.
- observações: a fonte diz "nem pensem em comê-lo" (sem efeito de jogo).

### 1.10 Cadeia: mutação da Mary Jane (cadeia:mutacao)

Mary Jane é a única que pode virar mutante. Mutante: não morre de sede, não é capturada em expedição e volta sempre, e afasta os bandidos sem defesa. Consome mais sopa e não bebe água. A mutação dispara por três caminhos (aranhas, baratas e o vazamento verde).

#### mut_1 — Aranhas no abrigo (início)
- grupo: cadeia:mutacao (entrada: aranhas)
- aparece quando: sorteado no início; "Insetos 1".
- situação: aranhas mutantes invadem o abrigo.
- escolhas:
  - veneno (requer: spray; spray é gasto): aranhas somem; +1 sopa.
  - livro de escoteiro (requer: livro; "melhor escolha"): aranhas afastadas; ganha +1 sopa OU +1 água; há chance de Mary Jane ser mordida (vira mutante, se ela estiver presente).
  - kit médico (requer: kit médico; é gasto): a família acha que era alucinação; nada.
  - nada (requer: nada): a família esmaga as aranhas com as mãos; cansaço/ferimento possível; Mary Jane não se fere, mas pode ser mordida e virar mutante (só se estiver presente).
- observações: a fonte diz que a chance de mutação diminuiu em atualizações posteriores.

#### mut_2 — Baratas mutantes (início alternativo)
- grupo: cadeia:mutacao (entrada: baratas)
- situação: baratas mutantes no abrigo.
- escolhas:
  - veneno (requer: spray; gasta): baratas mortas.
  - livro de escoteiro (requer: livro): baratas esmagadas.
  - nada (requer: nada): baratas espalhadas; família pode adoecer.
- observações: a fonte não liga esse evento à mutação; a mutação de baratas vem do evento "Baratas e trabalho barato" (sem item: dá sanidade negativa e a família pode virar mutante, se Mary Jane estiver presente).

#### mut_3 — Vazamento verde (entrada alternativa)
- grupo: cadeia:mutacao (entrada: vazamento)
- situação: um cano pinga uma substância verde que come mesa e cadeira.
- escolhas:
  - mala (requer: mala; a mala é inutilizada): o vazamento para; a mala fica destruída.
  - livro de escoteiro (requer: livro): o vazamento é tapado.
  - nada (requer: nada): a família ignora; "algo acontece" com Mary Jane: ela acorda mutante (o evento só ocorre se ela estiver presente; a fonte diz "de vez em quando").
- observações: a chance de mutação no evento de nada foi reduzida nas versões novas.

#### mut_4 — Mary Jane mutante (estado)
- grupo: cadeia:mutacao (estado)
- situação: Mary Jane mutante, pele roxa, sorri o tempo todo.
- efeitos: não bebe água (come mais sopa); imune a doença, cansaço, sanidade e ferimento (exceto ataque de crocodilo com machado+lanterna); volta sempre das expedições; traz água e às vezes item aleatório; a família deve alimentá-la após a expedição ou ela sai.
- eventos específicos (chance de sair):
  - "conversa com a mutante" sim: 1ª vez — ela sai ou grita e fere alguém; 2ª vez — ela morre fora do abrigo.
  - "conversa com a mutante" não: sanidade cai; na manhã seguinte ela sumiu (a fonte diz que a porta quebrada sumiu junto; uma vez a morte é citada).
- observações: a fonte diz que a conquista "Nova espécie" vem de transformar Mary Jane em mutante.

### 1.11 Cadeia: ferimentos e infecção (cadeia:ferida)

Ferimentos podem virar infecção (Agonia) se nada for feito. Agonia é fatal se não for tratada com kit médico em poucos dias. Ela vem de: barba mal aparada (Ted); expedição ferida; autodiagnóstico; ler o diário da Mary Jane; ataque de bandidos; experimento do cientista (ou bunker do agente).

#### fer_1 — Ferida na Mary Jane (expedição sem kit)
- grupo: cadeia:ferida (Mary Jane)
- aparece quando: Mary Jane saiu numa expedição sem kit médico (sorteado).
- situação: ela volta com um ferimento no antebraço, que parece de mordida.
- escolhas:
  - machado (requer: machado; quebra): a família aquece a lâmina e limpa a ferida. Mary Jane sobe o ferimento; pode ficar ferida. Ela melhora no dia seguinte.
  - kit médico (requer: kit; gasta): ferida curada.
  - nada (requer: nada): ela pode ficar doente (a fonte diz que a infecção piora); fica pálida.
- observações: sem kit e sem ação, a ferida vira Agonia (ver fer_3).

#### fer_2 — Ferida no Dolores (expedição sem kit)
- grupo: cadeia:ferida (Dolores)
- aparece quando: Dolores saiu numa expedição sem kit (sorteado).
- situação: um arranhão na perna (ou no pé) de Dolores.
- escolhas:
  - machado (requer: machado; quebra): a infecção melhora; a família aquece a lâmina.
  - kit médico (requer: kit; gasta): ferida tratada.
  - nada (requer: nada): a infecção se espalha; Dolores fica doente.
- observações: se a família conversar com Dolores ("Ela não fala") o evento pode virar sanidade.

#### fer_3 — Agonia (final de ferimento)
- grupo: cadeia:ferida (estado final)
- aparece quando: ferimento sem tratamento por "alguns dias" (fonte não diz o número).
- situação: a ferida infeccionou.
- escolhas:
  - kit médico (requer: kit; gasta; deve ser usado a tempo): cura.
  - nada (requer: nada): a pessoa morre (Ted e Dolores morrem), ou, se for Mary Jane ou Timmy, FOGE do abrigo com uma nota (ver seção 4 de saídas).
- observações: a fonte dá estes textos de desfecho: Ted morre; Dolores morre; Mary Jane sai para o Canadá; Timmy sai "para virar senhor da guerra".

### 1.12 Cadeia: saídas por loucura (cadeia:saida_loucura)

A loucura é um estado. Quem fica louco por muito tempo sai do abrigo em outra direção (morre fora, ou some). Quem sai assim não volta.

#### sai_1 — Ted e o fantoche (loucura)
- grupo: cadeia:saida_loucura (Ted)
- aparece quando: Ted louco por muitos dias (a fonte: se Ted está sozinho no abrigo, ele enlouquece no dia 2; o teste é o estado de loucura).
- situação: Ted segue o conselho do fantoche de meia e sai do abrigo.
- escolhas:
  - não há escolha: Ted sai e não volta (fim para a família).
- observações: se Ted enlouquece, ele quebra mapa, água, soup ou máscara antes de sair (estados de dano).

#### sai_2 — Dolores louca
- grupo: cadeia:saida_loucura (Dolores)
- aparece quando: Dolores louca por muitos dias.
- situação: ela deixa uma nota e sai para "procurar o que perdeu".
- escolhas:
  - não há escolha: Dolores sai e não volta (morre).
- observações: Dolores louca quebra o rádio (ver 4.x).

#### sai_3 — Timmy louco (herói)
- grupo: cadeia:saida_loucura (Timmy)
- aparece quando: Timmy louco por muito tempo.
- situação: Timmy aparece na porta com capa de papel; diz que vai ser herói do deserto.
- escolhas:
  - não há escolha: Timmy sai e não volta.
- observações: a fonte diz que o desenhista Timmy pode fazer aviõezinhos de papel, se estiver com o livro de escoteiro (efeito de estado).

#### sai_4 — Mary Jane louca (aula de tuba)
- grupo: cadeia:saida_loucura (Mary Jane)
- aparece quando: Mary Jane louca.
- situação: ela sai para "a aula de tuba semanal".
- escolhas:
  - não há escolha: Mary Jane sai e não volta.
- observações: nenhuma.

### 1.13 Cadeia: Ted e o carro (cadeia:carro)

#### carro_1 — Chaves do carro (início)
- grupo: cadeia:carro (passo 1)
- aparece quando: sorteado.
- situação: Ted acha as chaves do carro e quer ir ver o carro.
- escolhas:
  - sim (requer: nada): Ted SAI do abrigo (ausente por um tempo); avança para carro_2.
  - não (requer: nada): sanidade de Ted cai.
- observações: a fonte diz que ele pode voltar com boas notícias (se o carro ainda funcionar, a família sai dali). Não diz se o carro funciona.

#### carro_2 — Ted volta (passo 2)
- grupo: cadeia:carro (passo 2)
- aparece quando: carro_1 "sim" concluído e Ted fora há um tempo.
- situação: os barulhos de fora preocupam a família.
- escolhas:
  - sim, procurar (requer: nada): encontram Ted desmaiado numa vala, cheirando a sopa e álcool; ele tinha invadido um churrasco de bandidos. A família ganha 2 latas de sopa e Ted volta.
  - não procurar (requer: nada): nada explícito (a fonte diz "???"; provavelmente Ted morre; não confirmado).
- observações: a fonte marca a morte como "não confirmada".

### 1.14 Cadeia: sinal de Timmy (cadeia:sinal_timmy)

#### sinal_1 — O sinal (início)
- grupo: cadeia:sinal_timmy (passo 1)
- aparece quando: a família fez pelo menos 1 expedição bem-sucedida (fonte).
- situação: Timmy vê uma sequência de luzes no horizonte.
- escolhas:
  - livro de escoteiro (requer: livro): Timmy decide mandar um recado; avança para sinal_2.
  - nada (requer: nada): nada.
- observações: a fonte liga este evento à "chamada" da rádio (Timmy transmite do alto de um caminhão).

#### sinal_2 — Por favor, responda (passo 2)
- grupo: cadeia:sinal_timmy (passo 2)
- aparece quando: sinal_1 com livro concluído; a família tem rádio.
- situação: Timmy escreveu uma mensagem curta e propõe transmiti-la.
- escolhas:
  - rádio (requer: rádio): Timmy sobe no caminhão, transmite a mensagem e volta; a família espera. Efeito posterior NÃO informado.
  - harmônica ou lanterna (requer: um dos dois): a fonte lista como alternativas ao rádio (não confirmado).
  - nada (requer: nada): a família desiste.
- observações: a fonte não diz o que a transmissão provoca. Não ligado a final.

### 1.15 Cadeia: veículo (cadeia:veiculo) — final multi-partida (Reatomized)

O veículo é um final de várias partidas: cada partida faz UMA ação (uma etapa), e o estado do veículo persiste entre partidas. Quando o veículo tiver todas as peças, a família sai e vence.

Etapas (em ordem), cada uma com 1 escolha por item:
- veic_1 — Achar o veículo: uma expedição acha um carro-tanque ou um caminhão de sorvete (Ted/Dolores vs Mary Jane/Timmy definem o tipo). Ações: "enviar" (ganha o desenho) ou "não enviar" (nada).
- veic_2 — Reforçar: uma etapa a escolher entre lanterna (grades de metal), máscara de gás (chapa de metal), machado (estacas de madeira; +sanidade) ou nada.
- veic_3 — Armar: mapa (canhão; todos ficam cansados, alguém se fere), cadeado (metralhadora), nada.
- veic_4 — Decorar: rifle (bandeiras), mala (ossos; alguém pode adoecer), spray (grafite), nada.
- veic_5 — Rodas: harmônica (rodas; a harmônica é perdida), livro de escoteiro (esteira; todos cansados; livro é destruído), nada.
- veic_6 — Ligar o veículo (final): 5 latas de sopa → VITÓRIA "veículo" (ver seção 3). Nada: ainda não tem como.
- observações: a fonte diz que existem 72 combinações de veículo (36 caminhão, 36 tanque). Quais combinações levam ao final: todas as cinco etapas cumpridas.

## 2. VISITANTES

### 2.1 Recorrentes (V1 a V10)

Critério: "recorrente" = aparece mais de uma vez (ou tem efeito que volta depois). Quem aparece uma vez só e não volta está em "visitantes pontuais" (ao fim desta seção). Os comerciantes são pontuais: a fonte diz que cada negociação ocorre uma só vez.

### V1 — Seis-braços (mutantes amigos) — RECORRENTE
- tipo: grupo de mutantes, ex-visitantes
- primeira aparição: "estranho de três mãos" (grupo de sobreviventes que pedem apoio): dá-se uma lata de sopa para ter proteção na próxima expedição.
  - aparece quando: sorteado (sem dia).
  - escolhas: dar 1 sopa (requer: sopa; gasta) → aliados; nada → nada.
- segunda aparição (ajuda): quando a família deu suprimentos a eles, na invasão de bandidos eles afastam os invasores (cadeia:bandidos, bnd_5).
- observações: a fonte diz que, se não deram suprimentos, a invasão é normal.

### V2 — Jim, o catador de pedras — RECORRENTE
- aparece quando: sorteado; bate na porta perguntando se a família quer comprar uma pedra.
- escolhas:
  - sim (requer: nada): ele dá a primeira pedra de graça, vai embora e VOLTA com um galão de água quando alguém está morrendo de sede (ajuda de emergência).
  - não (requer: nada): nada acontece.
- observações: a fonte diz que a pedra "traz sorte", sem efeito de jogo.

### V3 — Agentes do governo — RECORRENTE (cadeia gatos)
- aparecem: no "fio" (cadeia:gatos, gato_4); depois batem na porta no dia 50-60 (final do abrigo presidencial).
- tarefas: eventos de "missão" dados em ordem (a fonte não lista as tarefas; o ramo fecha se a ordem falhar).
- observações: ver gato_4 e final "agentes" na seção 3.

### V4 — Cientista ("Doc") — RECORRENTE (cadeia cientista)
- aparece: no ferro-velho (depois do gato seguido); pede suprimentos e cobaias (cadeia:cientista).
- observações: ver cadeia:cientista e final "Alcançar as estrelas".

### V5 — Bandidos e Bob — RECORRENTE (cadeia bandidos)
- Bob é o rosto de um bandido loiro de óculos azuis; aparece sem fala em várias invasões (ver cadeia:bandidos).
- observações: bandidos são a principal ameaça externa; eles voltam em cercos e invasões até o final "invasão".

### V6 — Militares — RECORRENTE (cadeia militar)
- aparecem por rádio (mil_1 a mil_4) e na porta (mil_5).
- observações: ver cadeia:militar.

### V7 — Gêmeos — RECORRENTE (cadeia gêmeos)
- aparecem por telefone, carta e batidas (gem_1 a gem_5).
- observações: ver cadeia:gemeos.

### V8 — Cão Pancake — RECORRENTE (cadeia cao)
- aparece na porta depois de sair com a lanterna; volta; pode entrar para a família (cao_1 a cao_4).

### V9 — Gato Sharikov — RECORRENTE (cadeia gatos)
- aparece como animal de estimação e como ramo de finais (gato_1 a gato_5; catl_0 a catl_9).

### V10 — Clínica de campo (médicos) — RECORRENTE
- aparece quando: sorteado; pedem água oxigenada (a fonte diz "água limpa" como substituto).
- primeira visita:
  - água (requer: 1 água; gasta): a família dá água; a fonte diz que os médicos voltam cerca de 30 dias depois.
  - nada (requer: nada): os médicos vão embora; nada acontece.
- segunda visita (30 dias depois, se a família deu água): dão injeções → CURA de doença (sanidade sobe; cores parecem mais vivas).
- observações: a fonte chama o grupo de "farsantes" para quem não dá nada; quem deu água é recompensado.

### 2.2 Pontuais (V11 a V18)

### V11 — Vendedor sussurrante do saco (obtém Sharikov) — PONTUAL
- aparece quando: sorteado; oferece "um saco" (dentro está Sharikov) em troca de 1 lata de sopa. É uma oferta única: se recusar, ele volta e repete a oferta.
- escolhas: dar 1 sopa (requer: sopa) → Sharikov entra; recusar → ele volta.
- observações: é a segunda forma de obter Sharikov (além do gato da ruína).

### V12 — Refugiados (Viúva e a fortuna) — PONTUAL
- aparecem: pedem remédio, sopa ou água; a família dá um e recebe:
  - dar kit médico (requer: kit): recebem um rádio (ou mapa) e a sanidade de todos sobe ao máximo.
  - dar água ou sopa: ganham mapa, rádio ou nada; sanidade sobe ao máximo.
  - nada: os refugiados batem, roubam tudo (saque: "todos os suprimentos").
- observações: a fonte dá ao mesmo grupo três desfechos de sorteio.

### V13 — Dono do cavalo de coco (cavaleiros medievais) — PONTUAL
- aparecem: dois homens fingindo cavalgar, procurando um cálice; pedem para ver o mapa.
  - mapa (requer: mapa): recebem bem a família; ganham machado, damas ou munição ou cartas (sorteado).
  - nada (requer: nada): riem; eles vão embora ofendidos (sem efeito).
- observações: a fonte diz que a cena é uma referência de comédia (não copiar).

### V14 — Homem do "chip de água" — PONTUAL
- aparece: pede um "chip de água"; a família não sabe o que é.
  - dar 1 água (requer: água; gasta): ele aceita e dá uma máscara de gás; a fonte diz "quase sempre" (quando a família não tem máscara).
  - nada (requer: nada): ele agradece e vai embora.
- observações: a fonte diz que o visitante não dá nada se a família já tem a máscara.

### V15 — Adolescentes armados (Lobos) — PONTUAL
- aparecem na porta com armas; perguntam sobre "vermelhos". Dizem ser "Lobos".
  - abrir (requer: nada): recebem 2 água (se a família não tem arma), ou um rifle, ou um machado (sorteado).
  - não abrir (requer: nada): eles vão embora sem efeito.
- observações: a fonte deixa claro que é uma referência cômica.

### V16 — Estranha da caça (mulher com a aranha) — PONTUAL
- aparece: caçadora sem munição quer ajuda contra uma aranha gigante; promete retribuir "outro dia".
  - dar munição (requer: munição): ela agradece; a fonte deixa a retribuição em aberto.
  - nada (requer: nada): ela vai embora "sem tratar bem".
- observações: nenhuma.

### V17 — Vizinha Jenny (mutante) — PONTUAL
- aparece: bate na porta; o marido sumiu. Mesmo sem ser chamada, Dolores e Ted dão suprimentos.
- observações: fonte escreve "Jenny" como vizinha mutante; sem efeito de final.

### V18 — Will (defensor) — PONTUAL (DLC)
- aparece: dá a escolha entre 1 água ou 1 sopa; em troca, ele DEFENDE o abrigo na próxima invasão, quando a família não tem outra defesa.
- observações: é a única menção a defesa por visitante, ligada à cadeia de bandidos (bnd_1).

### 2.3 Personagens fora de cena (sem visita)
- Ned: vizinho de Ted; provavelmente morreu na explosão (a fonte diz que é "possivelmente o culpado pela bomba", em tom de piada).
- Mr. Freeman: professor de física de Timmy; provavelmente não sobreviveu.
- Tio Brian: aparece só em foto guardada no livro de escoteiro (evento de "álbum").
- Irmã da Dolores: citada no diário do primeiro dia; mora num outro país. Sem efeito.
- Ethan: colega de Timmy; briga; a família vai à casa dos pais dele. Sem efeito.
- Soviéticos ("vermelhos"): inimigos no rádio; ver final "soviético" (só no desafio).
- A mulher da voz do espaço: some do rádio; ver cadeia radio_espaco (ela NÃO deve ser usada com nomes de 60 Parsecs).
- Soldado (tutorial): aparece no treino inicial ("coleta atômica"), ensina o que levar e obriga um membro da família a sair numa expedição no treino. Também dá dicas no modo de coleta e ensina a batida militar (duas batidas).
- Pancake, Sharikov, Mary Jane, Timmy: ver famílias e cadeias.
- Dono do acampamento (chefe): pai dos gêmeos (evento dos gêmeos).

### 2.4 Outros grupos pontuais (um encontro cada; sem cadeia)
- Negociantes de rua (todos os de "comércio", ver seção 4).
- Merrymen (homens de pijama verde): "tirar dos ricos, dar aos pobres". Se a família tem 6 itens ou menos ela é "pobre" e recebe itens; se tem mais, é "rica" e perde 2 itens aleatórios (ver seção 4).
- Jogador de cartas (The Gambler): aposta de 2 garrafas de água ou 2 latas de sopa numa partida; 50/50 (a fonte diz "precisa confirmação").
- Velhas com guarda-chuva (bandidos disfarçados): ver cadeia:bandidos.
- Bombeiros falsos (bandidos disfarçados): ver cadeia:bandidos.

## 3. FINAIS

Cada final tem: tipo (VITÓRIA, AMBÍGUO, DERROTA), condição exata (da fonte) e o que acontece. Quando a fonte não diz, está escrito "não informado".

### 3.1 Vitórias ("Você sobreviveu")

#### F-MIL — Resgate militar (VITÓRIA)
- tipo: vitória (texto "Você sobreviveu" no fim da cadeia militar)
- condição exata: rádio funcionando no abrigo durante a cadeia (cadeia:militar); completar mil_1 (contato ou tanque), mil_2 (lanterna, mapa ou cartas), mil_3 (máscara, harmônica, machado ou rifle entregue), mil_4 (encontro com a pessoa enviada); no evento "batida na porta" (mil_5), ABRIR a porta e escolher o desfecho de resgate.
- conflito/observações: a página militar avisa que, se a batida aparecer até 10 dias após o encontro (mil_4), abrir é emboscada dos bandidos (saque ou derrota imediata). A lista de eventos diz que a porta tem 3 desfechos de resgate. Propomos a regra da página militar. Roubar no "lado sombrio" NÃO bloqueia o resgate militar.
- repete: os passos repetem a cada ~10 a 12 dias se a família falhar.

#### F-GEM — Resgate dos gêmeos (VITÓRIA)
- tipo: vitória
- condição exata: completar gem_1 (telefone), gem_2 (uma das 3 variantes), gem_3 (uma das 3), gem_4 (uma das 3), e no gem_5 (batida) ABRIR a porta → sair para o acampamento.
- bloqueio: NÃO pode ter nenhum roubo do "lado sombrio" (cadeia:lado_sombrio). Qualquer roubo cria a mancha de sangue e cancela o resgate.
- observações: a fonte diz que a versão do desfecho "gêmeos" tem a mesma batida do militar (o evento é um só).
- repete: a cada ~10 dias se a família falhar.

#### F-VEI — Veículo (VITÓRIA, multi-partida)
- tipo: vitória (só em Reatomized)
- condição exata: as 5 etapas do veículo concluídas em partidas diferentes (cadeia:veiculo; uma ação por partida), e no passo final ter 5 latas de sopa e usar 5 latas para ligar o veículo.
- texto: "saímos daqui" (a família deixa o abrigo; a fonte diz "quem achar o abrigo pode ficar").
- observações: 72 combinações de decoração e reforço (36 caminhão, 36 tanque); a fonte não informa se todas levam ao mesmo final.

#### F-AGE — Abrigo do governo (AMBÍGUO: "Você sobreviveu... talvez")
- tipo: ambíguo
- condição exata: ter Sharikov (gato) no abrigo; deixar Sharikov investigar o fio; deixar os agentes explicarem a missão (gato_3 examinar, gato_4 sim); completar as tarefas dos agentes (eventos em ordem, a fonte não lista quais); após o número de tarefas, o evento "batida na porta" aparece (dia 50-60 aproximadamente) → ABRIR → final.
- desfecho: os agentes levam a família para o abrigo presidencial, com recursos ilimitados (água, sopa, donuts, jornais, um balde extra).
- conflito: a página Endings diz que a sequência falhando trava o final; a página do Sharikov diz "dia 50-60".
- observações: o abrigo presidencial é descrito como 20 pés quadrados maior que o abrigo da família.

#### F-GAT — Dona dos gatos (AMBÍGUO: "Você sobreviveu... meio")
- tipo: ambíguo
- condição exata (Cat Lady, fonte Cat_Lady): nenhum final com Sharikov foi feito; ter ao menos 9 latas de sopa no início da cadeia; a geladeira-clonadora gera gatos por 9 dias (ou 10 gatos no total), sem a sopa acabar.
- conflito 1: a página Endings diz "apenas UM membro da família no abrigo, e sopa suficiente para os gatos" (o final pede 1 pessoa). A página Sharikov diz "não importa quem está lá; só sobreviver ~50 dias após a chegada do Sharikov com 10 latas". A página Cat Lady diz "9 gatos clonados ou 10 gatos no total".
- observações: o final é de "você sobreviveu"; o texto diz que os gatos mantêm a família alimentada, em troca de obediência.

#### F-CIE — Alcançar as estrelas (AMBÍGUO: "Seu destino é desconhecido")
- tipo: ambíguo
- condição exata: ter Sharikov; ignorar os agentes; esperar o pedido de suprimentos do cientista; completar as tarefas (4 garrafas de água OU 4 latas de sopa; uma pessoa como cobaia que volta louca); esperar alguns dias; o cientista constrói um foguete e leva a família ao espaço.
- observações: a página Sharikov chama de "Reach for the Stars" e dá a conquista "Lata de sopa no espaço". A página Endings chama de "Seu destino é desconhecido" (texto na tela). Mesmo final.

#### F-SOV — Resgate soviético (AMBÍGUO; só no desafio)
- tipo: ambíguo (desafio)
- condição exata: só no desafio "Contagem final" (Final Countdown). A família é salva por soviéticos e vira comunista.
- observações: fora do desafio, não existe.

#### F-SEG — Seguro por enquanto (fim de coleta, não é final)
- tipo: fim de modo de coleta
- condição exata: a família chega ao abrigo após escolher "Modo de coleta" (scavenge mode) e volta com vida. Texto: "Seguro por enquanto".
- observações: não é final da campanha.

### 3.2 Derrotas ("Você pereceu" e "Você foi expulso")

#### F-MOR — Ninguém adulto vivo ("Você pereceu")
- tipo: derrota
- condição exata: nenhum adulto (Ted e Dolores) vivo no abrigo. Causas listadas: fome, sede, loucura, doença, ferimento (agonia) ou expedição sem volta.
- variantes: se os dois adultos morrem e os dois filhos fogem: tela de "abrigo vazio com dois esqueletos" (ambos os filhos fugiram; ambos os adultos morreram).
- observações: a família perde se só crianças sobrarem (a fonte não dá o final dos filhos sozinhos).

#### F-INV — Invasão de bandidos ("Você pereceu")
- tipo: derrota
- condição exata: cerco de bandidos (cadeia:bandidos, bnd_1) SEM defesa possível (sem cadeado, machado, rifle com munição, harmônica usada na 2ª vez, spray, ou Mary Jane mutante presente). Os bandidos entram (bnd_4).
- variantes: 3 textos de fim de jogo (todos "Game over"); mais um caminho: bandidos batem na porta sem invasão (a família é atacada e pode perder tudo; ver cadeia:bandidos).
- observações: a fonte diz que se a família aguentasse mais um pouco, os militares a teriam resgatado.

#### F-EXP — Outro toma o abrigo ("Você foi expulso")
- tipo: derrota
- condição exata: NÃO há ninguém no abrigo (o último membro da família saiu numa expedição), OU a família deixa algo tomar o abrigo: outra família, padres (seita), militares (dois textos de "tomada militar") ou "Marlon" (outro sobrevivente).
- observações: a fonte deixa a porta sem resposta como uma das formas (texto "a porta está trancada"). A página Endings diz que o final vem de "ninguém dentro".

#### F-GATO — Dominação felina ("Você foi expulso" pelos gatos)
- tipo: derrota
- condição exata: as condições do final da dona dos gatos (F-GAT) foram cumpridas (sem final com Sharikov; cadeia da geladeira), mas a sopa acabou antes do fim da cadeia (menos de 9 latas de sopa).
- texto: "Os gatos instalaram seu regime supremo; obedecendo, teremos paz e sopa."
- observações: a página Sharikov chama de "Dominação Felina"; a página Endings chama de "os gatos tomam o abrigo". É o mesmo final.

#### F-DRI — Banda de "Marlon" / outros
- tipo: derrota
- condição exata: não informada (a página Endings lista "Marlon" como um dos que tomam o abrigo).

### 3.3 Conquistas que ajudam a entender os finais (não são finais)
- "Não estamos sozinhos" (Not Alone): ao dizer sim em "você não está sozinho" (cadeia do rádio do espaço).
- "Liberdade": libertar alguém dos bandidos.
- "Lado sombrio": roubo "sim" (bloqueia gêmeos).
- "Chovendo gatos e cães": Pancake sai quando Sharikov chega.
- "Soup Can Into Space" / "Reach for the Stars": final do cientista.

### 3.4 Desafios (modos com regras próprias)
- Sobrevivência do mais apto (Survival of the Fittest): começa com itens fixos (mala, máscara, machado, kit vazio, mapa rasgado, rádio quebrado, rifle danificado, lanterna danificada; 2 sopa e 2 água); objetivo: 7 expedições bem-sucedidas. Fim conforme o objetivo; não tem texto de final próprio na fonte.
- Contagem final (Final Countdown): único desafio com o final soviético (F-SOV).
- Paternidade responsável (Responsible Parenting): o diário cita o final militar como resultado desse desafio.
- Modo de coleta (Scavenge): o fim "Seguro por enquanto" (F-SEG).

### 3.4 Itens e situações que liberam finais (resumo)
- militar: rádio obrigatório; itens de passos: máscara, harmônica, mapa, lanterna, baralho, machado, rifle (entregar ou manter).
- gêmeos: sem roubo; itens: baralho/damas/harmônica, sopa, kit médico, mapa, machado, spray/rifle, livro de escoteiro.
- gatos (agentes/cientista/dona dos gatos): Sharikov no abrigo; sopa (9 latas no início para a dona dos gatos).
- veículo: 5 etapas em partidas separadas; 5 latas de sopa no fim.

## 4. EVENTOS AVULSOS (não são item, sim/não, escolher nem mandar alguém)

Estes são os eventos de Events_60_Seconds_ que NÃO estão nas listas de item, sim/não, escolher ou mandar. Pela fonte, são de dois tipos: comércio (trocas) e automáticos (acontecem sem escolha).

### 4.1 Comércio (troca de itens)

Regra geral (fonte): cada negociação oferece 1 a 4 trocas, sorteadas. A família recebe água ou sopa (ou um item) em troca de um item que tem. Cada troca ocorre UMA vez; a lista do comerciante é aleatória. Recusar não tem efeito escrito, exceto onde indicado.

#### com_1 — Vendedor com carrinho de mão (venda de tudo)
- grupo: avulso (comércio)
- aparece quando: sorteado (uma vez).
- situação: um homem com carrinho cheio de coisas quer trocar.
- escolhas (cada uma exige o item):
  - 1 água por baralho (requer: baralho)
  - 1 água por veneno (requer: spray)
  - 2 água por livro de escoteiro (requer: livro)
  - 1 água por lanterna (requer: lanterna)
  - nada: recusa; o comerciante fica chateado; nada acontece.
- observações: a fonte diz que ele fala de "bandidos" ao sair (sem efeito).

#### com_2 — Mulher com o "camelo" (camelo de cinco patas)
- grupo: avulso (comércio)
- aparece quando: sorteado (uma vez).
- escolhas:
  - 1 água por damas (requer: damas)
  - 4 água por rádio (requer: rádio)
  - 2 água por kit médico (requer: kit médico)
  - 1 água por munição (requer: munição)
  - nada: recusa; sem efeito.
- observações: a fonte diz que ela deixa a dica de ouvir o rádio para sair do abrigo.

#### com_3 — Vendedor Willy (negócio)
- grupo: avulso (comércio)
- aparece quando: sorteado (uma vez).
- escolhas:
  - 1 sopa por baralho (requer: baralho)
  - 1 água por damas (requer: damas)
  - 2 sopa por máscara de gás (requer: máscara)
  - 4 água por rifle (requer: rifle)
  - nada: recusa; sem efeito.
- observações: Willy é o único comerciante com nome na fonte. Os outros são anônimos.

#### com_4 — Negociante ruivo com guarda-costas (comércio de guerra)
- grupo: avulso (comércio)
- aparece quando: sorteado (uma vez).
- escolhas: o negociante oferece as trocas da lista (sorteado); recusar → ele oferece um "projeto de arma" (sem efeito). A fonte diz que a dica sobre sobrevivência é inútil.
- observações: nenhuma.

#### com_5 — Negociante de munição (bate na porta)
- grupo: avulso (comércio)
- aparece quando: sorteado (uma vez).
- escolhas:
  - 1 sopa por munição (requer: munição; gasta)
  - por munição: rádio (requer: munição; gasta; ganha rádio)
  - dar baralho ou damas no lugar de munição: ele leva o tabuleiro e não dá nada (sem efeito).
  - nada (requer: nada): ele desiste; se a família tem munição, ele joga fumaça e ROUBA toda a munição.
- observações: o roubo só ocorre se a família tiver munição.

#### com_6 — Meninas escoteiras (venda de biscoitos, DLC)
- grupo: avulso (comércio)
- aparece quando: a família perdeu pelo menos 2 itens (exceto sopa e água).
- escolhas:
  - aceitar (requer: nada): recebem 1 item aleatório e ganham 1 item extra aleatório (só itens que elas têm e a família não tem).
  - recusar (requer: nada): sem efeito.
- observações: só aparecem trocas de itens que a família não tem.

### 4.2 Automáticos (acontecem sem escolha)

#### auto_1 — Presente do gato (rato brilhante)
- grupo: avulso (automático; com Sharikov)
- efeito: alguém da família fica doente (a fonte não diz quem).

#### auto_2 — Tesouro do gato (munição, mapa ou spray)
- grupo: avulso (automático; com Sharikov)
- efeito: +1 munição OU +1 mapa OU +1 spray de inseto, conforme o tesouro.

#### auto_3 — Alergia do Ted (gato no abrigo)
- grupo: avulso (automático; Ted no abrigo)
- efeito: Ted adoece (desvantagem de doença).

## 5. ÍNDICE DOS EVENTOS DE ITEM, SIM/NÃO, ESCOLHER E MANDAR (NÃO DETALHADOS AQUI)

Estes são os títulos de seção de Events_60_Seconds_.txt que caem nas listas de item, sim/não, escolher pessoa ou mandar alguém. Ficam com as outras listas. Os títulos vêm do próprio arquivo (conferir ao cruzar).

Tipo de interação indicado pela fonte:
- ITEM: "Insects in the shelter 2", "Insects in the Shelter 3", "Insects in the Shelter 4", "Insects in the Shelter 5", "Radio Event 1", "Radio Event 4", "Boredom events", "Boy Scout Handbook events", "Sleep event", "Uncle Brian event", "Destruction events.", "Lost ammunition event", "Beard event", "Bad smell events" (parte de itens), "Bunny-Beast event", "Relax event", "Secret Door", "Mushroom event" (parte sim/não), "Plant events" (sim/não + água), "Poison into drugs event" (sim/não + spray), "Map investigation event" (sim/não + itens), "Attack events" (defesa com itens: cadeado, rifle, machado, spray, harmônica), "Raider camp" (dentro do ataque ao acampamento, cadeia bandidos).
- SIM/NÃO: "Insects in the shelter 1" (veneno ou livro), "Radio Event 2", "Radio Event 3", "Radio Event 6" (rádio: sim/não; a cadeia de rádio e militar), "Stranded in space event 2", "Phobia 1", "Phobia 2", "You are not alone", "Ted's Car - Part 1", "Ted's Car - Part 2", "Agents", "Feline Domination" (com a condição), "Strangers events" (sim/não na porta), "Suitcase event", "Mary Jane events" (sim/não + itens), "Timmy events" (sim/não + itens), "Dolores events" (sim/não + itens), "Harmonica".
- ESCOLHER PESSOA: "Harmonica" (quem toca), "Twins 1" (a parte "Send Someone" é mandar alguém, cadeia gêmeos), "Mary Jane events" (escolha de quem vence a discussão), "Timmy events" e "Dolores events" (escolha de pessoa).
- MANDAR ALGUÉM: "Stampede event", "Military contact events" (tanque e encontro), "Map investigation event" (cavar: quem vai), "Ted's Car - Part 1", "Twins 1" (telefone).

Observação: as seções acima são de Events_60_Seconds_. As variantes de personagem (Mary Jane, Timmy, Dolores, Ted) e as variantes de visitante (Strangers) aparecem nas páginas do próprio personagem e não estão listadas aqui.

## 6. EVENTOS DE 60 PARSECS (FORA DO ESCOPO)
- Mootopia, Mootopia_Ending, Robotofu, Death_Robot_Squad, Baby_Bronco, Tom_Thomson, Emmet_Ellis, Maegan_Mann, April_Angelle, Sock_Puppet, Soul_mates: 60 Parsecs. Ignorados.
- Soviets, Dolores_Sister e The_Stranger: partes de 60 Seconds (usadas aqui); qualquer menção a 60 Parsecs ficou fora.
- A "mulher na voz do espaço" do evento de rádio cita um endereço de 60 Parsecs: tratada aqui como voz sem nome.
- Souper_Scavenger: jogo futuro (não lançado); não é evento da campanha. Ignorado.
- Presidential_Bunker: é o local do final dos agentes (seção 3).
