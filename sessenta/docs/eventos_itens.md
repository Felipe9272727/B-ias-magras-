# Eventos de itens — 60 Segundos das IAs

## Contagem

- Lista original (List Of Events, "Items" Events): **53 eventos**. São 51 títulos (50 de nível 3 e 1 de nível 4, "Monster on a leash") mais 2 eventos sem título próprio (a carta de ajuda de desconhecidos e o retorno dos médicos).
- Escritos neste arquivo: **53**.
- Igual: sim.

## Convenções

- Nomes de itens (nossos): Lanterna, Rádio, Máscara de gás, Machado, Rifle, Munição, Água, Sopa, Gaita, Cadeado, Mapa, Baralho, Damas, Kit médico, Repelente, Guia de escoteiro, Mala.
- Personagens por papel, conforme `sessenta/familia.mjs`: pai, mãe, filha, filho. Animais: cão, gato. Outros: vizinha mutante, gêmeos, tio/tia (parentes), caçadora, médicos, refugiados, comerciante.
- `requer: X` = precisa ter X no abrigo para a escolha existir. `-X` = X é gasto ou perdido. `+X` = ganha X.
- Padrão de itens em eventos de perda (enchente, incêndio, cerco): o item escolhido sobrevive e os outros dois saem perdidos ou danificados, marcados com `-` na fonte.
- "Às vezes" = a fonte marca "(Sometimes)" sem percentual. A fonte quase não traz percentuais; onde não há, está escrito.
- Arquivos de itens consultados: Rifle, Axe, Flashlight, Map, Gas_Mask, Medkit, Bug_Spray, Padlock, Suitcase, Checkers, Deck_of_Cards, Harmonica, Boy_Scout_Handbook, Radio, Water, Soup, Ammunition. "Atomic Battery" não aparece em nenhum evento desta lista.
- Referência: "fonte: linhas X–Y" aponta para o arquivo `List_Of_Events_Items_Events_.txt`.

---

### terremoto — Terremoto no abrigo
- grupo: abrigo
- aparece quando: a qualquer momento, sem dia definido. A fonte tem dois textos (primeiro tremor e tremor forte). O texto muda se Lanterna, Rádio ou Máscara não estiverem no abrigo, sem efeito mecânico.
- frequência: não informada na fonte.
- situação: um tremor derruba o que está solto no abrigo. A família pode segurar um item antes que quebre.
- escolhas:
  - salvar_lanterna (requer: Lanterna): a lanterna é salva. Rádio e Máscara ficam expostos (ver observações).
  - salvar_radio (requer: Rádio): o rádio é salvo.
  - salvar_mascara (requer: Máscara de gás): a máscara é salva.
  - nada: ninguém segura nada. Sem perda descrita no texto, mas o rádio pode quebrar em terremoto.
- observações: a fonte não diz quais itens quebram em cada saída nem chances. O arquivo do Rádio lista terremoto entre as causas de quebra. Lanterna e Máscara podem ser consertadas com o Guia de escoteiro. Fonte: linhas 13–38.

### machado_gemeos — Machado para a obra
- grupo: cadeia:gemeos
- aparece quando: os gêmeos (irmão e irmã) batem na porta pedindo ajuda para cortar madeira e erguer casas. É o passo 1 da cadeia dos gêmeos. Não há condição de dia na fonte.
- frequência: não informada na fonte.
- situação: os gêmeos juntaram um grupo de sobreviventes e precisam de braços para montar um acampamento.
- escolhas:
  - machado (requer: Machado): a família ajuda na obra. O machado não é marcado como perdido. A cadeia dos gêmeos avança.
  - nada: a família recusa. Com machado no abrigo, recusa por achar perigoso; sem machado, diz que não tem como ajudar. A cadeia não avança.
- observações: a fonte não diz se o machado se desgasta nessa ajuda. Fonte: linhas 40–54.

### exercito_galoes — Galões para o exército
- grupo: cadeia:militar
- aparece quando: mensagem de rádio do exército, em três variantes (passos 1, 2 e 3). A fonte não diz quais condições disparam o evento além do rádio.
- frequência: passos sucessivos conforme a mensagem se repete.
- situação: o exército pede que os sobreviventes levem galões de gás ao ponto de ônibus. O trajeto exige proteção.
- escolhas:
  - mascara (requer: Máscara de gás): a família leva os galões em segurança. A máscara não é gasta. A cadeia militar avança para o final de resgate.
  - nada: a família acha arriscado sair sem máscara. O resgate atrasa. A cadeia não avança.
- observações: a fonte não define quantas vezes o evento pode se repetir antes de sumir. Fonte: linhas 56–67.

### vendedor_porta — Vendedor porta a porta
- grupo: porta
- aparece quando: sem condição. Um vendedor antigo, de antes do fim do mundo, bate na porta. Texto único.
- frequência: não informada na fonte.
- situação: o vendedor quer suprimentos e promete contar "segredos de estado" (uma suposta estação espacial).
- escolhas:
  - agua_ou_sopa (requer: Água ou Sopa, -1): a família dá 1 unidade. Efeito: a sanidade de todos sobe. A revelação é falsa e não gera outro efeito.
  - nada: o vendedor vai embora irritado. Sem efeito mecânico.
- observações: o trecho sobre "alienígena" é só texto. Fonte: linhas 68–78.

### mau_cheiro — Mau cheiro
- grupo: abrigo
- aparece quando: sem condição de dia. Três variantes de texto (sujeira, banho, cheiro). A família fica doente se nada for feito.
- frequência: não informada na fonte.
- situação: o abrigo cheira muito mal e a família pode adoecer. Um item pode resolver.
- escolhas:
  - municao (requer: Munição, -1 Munição): todos são curados de doença. A munição é gasta.
  - mascara (requer: Máscara de gás): todos são curados de doença. A máscara não é gasta.
  - repelente (requer: Repelente, -1 Repelente): todos são curados de doença. O repelente é gasto.
  - nada: todos adoecem.
- observações: sem chance de cura na fonte. Fonte: linhas 80–99.

### bandidos_porta — Bandidos na porta
- grupo: porta (com saídas de fim de jogo)
- aparece quando: bandidos batem na porta. Seis variantes de texto. Não há dia na fonte. Algumas saídas dependem de quem está no abrigo.
- frequência: repete. A fonte mostra as saídas "primeira vez" e "segunda vez" para a gaita, e a cadeia de defesa segue com os outros itens. Chances não informadas.
- situação: bandidos ameaçam entrar. A família precisa resistir, negociar ou se render.
- escolhas:
  - gaita (requer: Gaita): na 1ª vez, os bandidos baixam as armas e poupam a família, sem perda de item. Na 2ª vez, a música horrível espanta os bandidos. A gaita é gasta (-1 Gaita).
  - cadeado (requer: Cadeado, -1 Cadeado): os bandidos desistem e vão embora. O cadeado fica inutilizável e é gasto. A família fica na defesa.
  - machado (requer: Machado, -1 Machado): o machado quebra na luta. Os bandidos fogem. Defesa bem-sucedida.
  - rifle_com_municao (requer: Rifle e Munição, -1 Munição): a munição é gasta, o rifle continua. Defesa bem-sucedida.
  - rifle_sem_municao (requer: Rifle, sem munição): o rifle fica inútil (perdido, -1 Rifle). A defesa funciona mesmo assim.
  - nada (sem arma ou ferramenta): sai uma das saídas abaixo, conforme quem está no abrigo.
    - filha no abrigo: 1ª vez, ela vence os bandidos sozinha. 2ª vez, ela persegue os bandidos para longe e some (sai do jogo).
    - cão no abrigo: ele afugenta os bandidos e sai do abrigo.
    - Água ou Sopa usada no evento "Vizinhos de muitos braços (proteção)": os mutantes amigos entram e afastam os bandidos. Defesa bem-sucedida.
    - filho, mãe ou pai no abrigo: um deles é capturado pelos bandidos e sai da família. Pai, mãe e filho têm saídas próprias; a filha também tem saída de captura.
    - sem nenhum dos casos acima: a casa é invadida e a família perde. Três variantes de texto, todas de fim de jogo.
- observações: a fonte não diz quando ocorre a 2ª vez da gaita. A filha tem duas saídas (luta e captura) sem regra de desempate. Captura não é fim de jogo. Fonte: linhas 100–146.

### monstros_roedores — Roedores e comida
- grupo: abrigo
- aparece quando: sem condição. Quatro variantes de texto (roedores ou um "algo" que observa). A família sente que tem um bicho no abrigo.
- frequência: não informada na fonte.
- situação: um bicho ataca os mantimentos. A família decide enfrentá-lo ou perder comida.
- escolhas:
  - machado (requer: Machado): o bicho morre e a comida fica salva. O machado não é marcado como perdido.
  - rifle (requer: Rifle): o bicho morre. Às vezes (sem percentual), o rifle explode ao disparar e é perdido (-1 Rifle).
  - nada: o bicho vence, rouba e come comida: -1 Sopa.
- observações: a fonte não dá chance de o bicho morrer ou de o rifle explodir. Fonte: linhas 148–168.

### cartas_ponto — Cartas no ponto de ônibus
- grupo: cadeia:militar
- aparece quando: o exército pede que se deixe, no ponto de ônibus, uma carta marcando a quantidade de pessoas no abrigo. Três variantes de texto. Passo da cadeia militar.
- frequência: não informada na fonte.
- situação: o exército precisa localizar sobreviventes.
- escolhas:
  - baralho (requer: Baralho): as cartas são deixadas no ponto. O baralho não é gasto. A cadeia militar avança.
  - nada: a família perde a chance de avisar o exército. A fonte termina de forma truncada e indica que o resgate fica menos provável.
- observações: a fonte não diz quanto o resgate fica menos provável. Fonte: linhas 169–180.

### ventilacao_travada — Ar que falta
- grupo: abrigo
- aparece quando: sem condição de dia. Três variantes. A família sente falta de ar há horas.
- frequência: não informada na fonte.
- situação: a ventilação está travada e o ar piora. A família precisa investigar.
- escolhas:
  - lanterna (requer: Lanterna): ao iluminar a fonte do problema, uma colmeia de insetos morde. Alguém é ferido. A lanterna não é perdida.
  - guia (requer: Guia de escoteiro): o guia não resolve. Insetos saem e picam. Alguém adoece.
  - repelente (requer: Repelente, -1 Repelente): o spray limpa a ventilação e o ar volta ao normal. O repelente é gasto.
  - nada: todos tossem por uma noite. Quem esteve doente recentemente volta a adoecer.
- observações: a fonte não dá chance das consequências. Fonte: linhas 181–200.

### tedio_abrigo — Tédio
- grupo: abrigo
- aparece quando: a filha e o filho estão no abrigo. Cinco variantes de texto.
- frequência: não informada na fonte.
- situação: a família está entediada e pode enlouquecer. Precisa fazer algo.
- escolhas:
  - rifle (requer: Rifle): duas saídas.
    - sai para caçar; um homem foge e deixa 2 Sopas (+2 Sopa).
    - se o pai ou a mãe estão no abrigo, o rifle é testado e um deles se fere (ferimento).
  - radio (requer: Rádio): duas saídas. Uma só descreve a estática, sem efeito. A outra dá +sanidade de todos.
  - baralho (requer: Baralho): duas saídas. Uma dá +sanidade de todos. A outra é uma partida de pôquer com latas: a Lanterna é quebrada (-1 Lanterna).
  - damas (requer: Damas): +sanidade de todos. Às vezes, se a filha está no abrigo, ela perde sanidade com o jogo (marcado "to be checked" na fonte).
  - nada: a família fica olhando a parede. Às vezes, a filha fica cansada. Às vezes, o filho fica cansado.
- observações: a fonte não diz qual das duas saídas acontece nos casos com dois textos (rádio, baralho, rifle), nem chances. Fonte: linhas 201–229.

### mae_abatida — Mãe abatida
- grupo: abrigo
- aparece quando: a mãe está cansada (estado "cansaço"). Três variantes de texto.
- frequência: não informada na fonte.
- situação: a mãe está apática e não come a sopa. A família tenta animá-la.
- escolhas:
  - repelente (requer: Repelente): duas saídas. Uma aumenta a sanidade da mãe (ela se sente bem com o cabelo). A outra é uma borrifada no rosto: a sanidade cai e a mãe adoece.
  - guia (requer: Guia de escoteiro): a mãe gosta da leitura: +sanidade da mãe e ela descansa (sai do cansaço; inferido do texto da fonte). Outra saída: ela está cansada demais para ler, sem efeito.
  - nada: três saídas sem critério definido.
    - a mãe enlouquece.
    - a sanidade da mãe cai.
    - se o gato está no abrigo: ele deita no colo dela e a sanidade sobe.
- observações: a fonte não dá chances nem critério entre as saídas do "nada". Fonte: linhas 230–249.

### ferida_mae — Ferida da mãe
- grupo: abrigo
- aparece quando: às vezes, depois de a mãe ir em expedição sem Kit médico. Duas variantes (inchaço no pé ou arranhão na perna).
- frequência: às vezes (sem percentual).
- situação: a mãe voltou com um ferimento que infeccionou.
- escolhas:
  - machado (requer: Machado, -1 Machado): o machado aquecido limpa a ferida e cura a doença da mãe. O machado é gasto. Às vezes (sem percentual), o machado escorrega e a mãe é ferida.
  - kit (requer: Kit médico, -1 Kit médico): cura a doença da mãe. O kit é gasto.
  - nada: a mãe pode adoecer.
- observações: a fonte não diz chance de o machado escorregar. Fonte: linhas 250–266.

### detetive_pato — Detetive
- grupo: abrigo
- aparece quando: a filha e o filho estão no abrigo. Os itens desta escolha são sorteados. Texto único.
- frequência: não informada na fonte.
- situação: as crianças pedem alguns objetos para brincar de detetive.
- escolhas:
  - sorteio (requer: nada; itens sorteados): a filha esconde itens sorteados e o filho procura. Todos ganham +sanidade. Alguns itens podem se perder de vez.
  - nada: duas saídas.
    - brincam sem efeito.
    - as crianças empilham latas e garrafas para um muro; todos caem, e alguns membros se ferem.
- observações: a fonte não diz quais itens entram no sorteio nem a chance de perda. Fonte: linhas 267–281.

### balas_comerciante — Cada bala conta
- grupo: porta
- aparece quando: sem condição. Um comerciante bate na porta querendo munição. Duas variantes.
- frequência: não informada na fonte.
- situação: o comerciante oferece algo em troca de munição.
- escolhas:
  - damas (requer: Damas, -1 Damas): o comerciante não entende a oferta e leva o tabuleiro embora.
  - municao (requer: Munição, -1 Munição): duas saídas. Uma dá 1 Sopa. A outra dá um Rádio funcionando. Critério não informado.
  - nada: duas saídas. Uma: o homem usa uma bomba de fumaça, pega a munição e vai embora (-1 Munição). Outra: o homem sai decepcionado, sem efeito.
- observações: a fonte não dá chance entre as duas saídas de munição. Fonte: linhas 282–299.

### passeio_cao — Passeio com o cão
- grupo: cadeia:cao (passo final)
- aparece quando: o Cadeado está no abrigo e a Sopa foi usada duas vezes seguidas no evento marcado como "???" na fonte. A fonte não identifica esse evento.
- frequência: única.
- situação: o cão se comporta bem e a família pensa em sair junto numa busca, trancando o abrigo com o cadeado.
- escolhas:
  - cadeado (requer: Cadeado, -1 Cadeado): a mãe sai em expedição. Às vezes (sem percentual), ela volta doente. O cadeado é gasto nas duas variantes.
  - nada: a família recusa a expedição. Sem efeito.
- observações: a condição depende de um evento não identificado na fonte ("???"). Fonte: linhas 300–314.

### fotos_familia — Fotos da família
- grupo: abrigo
- aparece quando: sem condição. A família pensa em parentes (tio, tio e tia). Três variantes de texto.
- frequência: não informada na fonte.
- situação: a família procura uma foto de um parente.
- escolhas:
  - guia (requer: Guia de escoteiro): a foto estava guardada entre as páginas do guia. +sanidade de todos e um item novo, "foto da família", entra no abrigo.
  - nada: sem foto. -sanidade de todos.
- observações: a fonte não dá efeito para o item "foto da família". Fonte: linhas 315–327.

### enchente — Enchente
- grupo: abrigo
- aparece quando: tubos estouram e a água invade o abrigo. Três variantes de texto.
- frequência: não informada na fonte.
- situação: a água sobe e a família só consegue salvar um item.
- escolhas:
  - mapa (requer: Mapa): o mapa é salvo. Rádio e Baralho ficam perdidos (-Rádio, -Baralho).
  - baralho (requer: Baralho): o baralho é salvo. Rádio e Mapa ficam perdidos (-Rádio, -Mapa).
  - radio (requer: Rádio): o rádio é salvo. Baralho e Mapa ficam perdidos (-Baralho, -Mapa).
  - nada: duas saídas.
    - se Mapa, Baralho e Rádio estavam no abrigo, perde 1 Mapa, 1 Baralho e o Rádio. A fonte marca esse resultado como "só se houve perda".
    - se nenhum dos três estava no abrigo, não há perda; só limpeza.
- observações: o padrão de perda (o escolhido sobrevive, os outros dois são perdidos) é inferido das marcas da fonte. A fonte não diz chance. O arquivo do Rádio confirma que enchente pode quebrá-lo. Fonte: linhas 328–351.

### seguir_cao — Seguir o cão
- grupo: cadeia:cao
- aparece quando: a Sopa foi usada no evento "Comida para o cão". Passo 2 da cadeia. Três variantes de texto.
- frequência: única.
- situação: o cão volta agitado e quer que a família o siga para algum lugar. A família precisa escolher o equipamento.
- escolhas:
  - mapa (requer: Mapa): o cão acompanha um pouco e vai embora. O mapa não é gasto. Se o Guia de escoteiro está no abrigo, a família faz um desvio e ganha +3 Sopa.
  - rifle (requer: Rifle): os tiros assustam o cão, que não volta. Às vezes (sem percentual), alguém é ferido. O cão deixa de ser obtenível.
  - machado (requer: Machado): o cão ajuda a afastar dois bandidos. A família ganha +4 Água. O machado não é perdido.
  - nada: a família fica em casa. O cão vai embora e não volta. O cão deixa de ser obtenível.
- observações: a fonte não diz chance de encontrar o desvio. Fonte: linhas 352–374.

### comida_cao — Comida para o cão
- grupo: cadeia:cao
- aparece quando: a Lanterna foi usada no evento "Duas patas são melhores". Passo 1 da cadeia do cão. Três variantes de texto.
- frequência: única.
- situação: o cão, cansado e faminto, volta e bate na porta.
- escolhas:
  - sopa (requer: Sopa, -1 Sopa): o cão come, recebe um nome e entra no abrigo. Fica um tempo e some. Pode voltar.
  - nada: o cão vai embora e deixa de ser obtenível.
- observações: a fonte não diz quando o cão volta. Fonte: linhas 375–386.

### vizinhos_protecao — Vizinhos de muitos braços (proteção)
- grupo: porta
- aparece quando: um homem com uma mutação e vários braços bate na porta, com seu grupo de mutantes. Duas variantes de texto.
- frequência: não informada na fonte.
- situação: o grupo pede suprimentos em troca de proteção contra bandidos.
- escolhas:
  - agua_ou_sopa (requer: Água ou Sopa, -1): a família aceita. Efeito: o abrigo fica protegido do próximo ataque de bandidos (o evento "Bandidos na porta" usa esse efeito).
- observações: a fonte não tem saída "nada" nesta versão. Quem não aceita não recebe efeito. Fonte: linhas 387–395.

### vizinhos_escolta — Vizinhos de muitos braços (escolta)
- grupo: expedicao
- aparece quando: o mesmo grupo mutante volta com outra proposta: escoltar a família na próxima expedição. Duas variantes de texto.
- frequência: não informada na fonte.
- situação: o grupo diz que tem dificuldade para achar suprimentos e oferece escolta.
- escolhas:
  - agua_ou_sopa (requer: Água ou Sopa, -1): a família aceita. Efeito: a próxima expedição garante volta ao abrigo.
  - nada: o homem fica decepcionado. Sem efeito.
- observações: a fonte não diz se o efeito é gasto na primeira expedição ou vale para todas. Fonte: linhas 396–408.

### aniv_filha — Aniversário da filha
- grupo: abrigo
- aparece quando: é o aniversário da filha. Duas variantes de texto. Não há dia na fonte.
- frequência: única por partida (inferido).
- situação: a família precisa escolher um presente.
- escolhas:
  - baralho (requer: Baralho): +sanidade da filha. O baralho não é gasto.
  - repelente (requer: Repelente): +sanidade da filha. O repelente não é gasto.
  - kit (requer: Kit médico): +sanidade da filha e cura a doença dela. O kit não é gasto.
  - nada: -sanidade da filha.
- observações: a fonte não marca perda de item em nenhuma saída. Fonte: linhas 409–428.

### aniv_filho — Aniversário do filho
- grupo: abrigo
- aparece quando: é o aniversário do filho. Três variantes de texto.
- frequência: única por partida (inferido).
- situação: a família precisa escolher um presente para o filho.
- escolhas:
  - damas (requer: Damas): +sanidade do filho. O tabuleiro está incompleto, sem efeito mecânico.
  - guia (requer: Guia de escoteiro): +sanidade do filho.
  - kit (requer: Kit médico): +sanidade do filho. A fonte diz que pode curar a doença dele.
  - nada: -sanidade do filho.
- observações: a fonte não marca perda de item. Fonte: linhas 429–448.

### remedio_caseiro — Remédio caseiro
- grupo: abrigo
- aparece quando: o kit de primeiros socorros está vazio no abrigo e o Repelente também está. Três variantes de texto.
- frequência: não informada na fonte.
- situação: o kit médico está vazio e a família pensa em fazer remédio com o repelente.
- escolhas:
  - repelente (requer: Repelente, -1 Repelente): o kit volta a ficar cheio. Às vezes (sem percentual), se o pai ou a mãe estão no abrigo, eles adoecem por testarem o remédio.
  - nada: a ideia é descartada. Sem efeito.
- observações: o arquivo do Repelente diz que há chance aleatória de conserto do kit com o repelente, sem percentual. Fonte: linhas 449–461.

### pesca_mala — Pesca com a mala
- grupo: abrigo
- aparece quando: a Mala está no abrigo. Duas variantes de texto.
- frequência: não informada na fonte.
- situação: a família pensa em pescar algo numa poça suja usando a mala.
- escolhas:
  - mala (requer: Mala, -1 Mala): sorteio. A família ganha um item aleatório. A mala se estraga e é gasta.
  - nada: sem efeito.
- observações: a fonte não diz quais itens entram no sorteio nem chances. Fonte: linhas 462–474.

### visita_ferida_mae — Visita: mãe ferida
- grupo: abrigo
- aparece quando: a mãe está ferida ou em agonia. Duas variantes de texto.
- frequência: não informada na fonte.
- situação: a mãe piora. A família pode atender.
- escolhas:
  - kit (requer: Kit médico): cura os ferimentos da mãe. O kit não é gasto (sem `-` na fonte).
  - nada: a mãe fica doente.
- observações: a fonte não diz se o efeito também cura agonia. Fonte: linhas 475–486.

### medicos_visita — Médicos de jaleco
- grupo: cadeia:medicos (passo 1)
- aparece quando: um grupo de pessoas de jaleco bate na porta pedindo água para reabastecer kits. Duas variantes de texto. Não há condição de dia.
- frequência: não informada na fonte.
- situação: os visitantes dizem ser uma equipe médica de campo.
- escolhas:
  - agua (requer: Água, -1 Água): a família dá a água. A cadeia avança: os médicos voltam depois de vários dias (passo 2, abaixo).
  - nada: a família manda o grupo embora. A cadeia não avança.
- observações: a fonte não diz se a família pode pedir credenciais ou negociar. Fonte: linhas 487–500.

### infestacao — Infestação
- grupo: abrigo
- aparece quando: sem condição de dia. O lixo está cheio e aparecem insetos gigantes que brilham. Três variantes de texto.
- frequência: não informada na fonte.
- situação: baratas enormes e brilhantes aparecem perto do lixo e do balde.
- escolhas:
  - repelente (requer: Repelente, -1 Repelente): duas saídas com texto de "escapamos por pouco". Sem efeito listado. O repelente é gasto.
  - guia (requer: Guia de escoteiro): mesmas duas saídas. Sem efeito listado. O guia não é gasto.
  - nada: duas saídas.
    - alguém da família pode adoecer.
    - se o gato está no abrigo, ele caça as baratas durante a noite. Sem efeito listado.
- observações: a fonte não diz se esse evento cria o estado "baratas mutantes". Os eventos "Enxame" e "Comunicação das baratas" dependem desse estado. Chances não informadas. Fonte: linhas 506–524.

### mala_misteriosa — Mala misteriosa
- grupo: porta
- aparece quando: sem condição de dia. Um comerciante de aparência suspeita oferece uma mala por uma sopa. Texto único.
- frequência: não informada na fonte.
- situação: a mala balança e faz barulhos. O comerciante não deixa ninguém olhar dentro.
- escolhas:
  - sopa (requer: Sopa, -1 Sopa): a mala contém o gato, que entra no abrigo. A sanidade de todos sobe ao máximo. Se o cão está no abrigo, ele sai.
  - nada: a família recusa. Sem efeito.
- observações: a fonte tem um "???" no texto da saída do cão. Fonte: linhas 525–537.

### suprimentos_agentes — Suprimentos para os agentes (cadeia VIP)
- grupo: cadeia:vip
- aparece quando: agentes do governo voltam pedindo suprimentos. Três visitas, com texto diferente em cada uma: 1ª, 2ª e 3ª vez.
- frequência: três visitas na mesma cadeia.
- situação: os agentes pedem 4 Sopas ou 4 Águas para um colega em campo, em troca de um abrigo governamental seguro.
- escolhas:
  - sopa (requer: 4 Sopa, -4 Sopa): a família dá as 4 Sopas. A cadeia VIP continua.
  - agua (requer: 4 Água, -4 Água): a família dá as 4 Águas. A cadeia VIP continua.
  - nada: 1ª vez, sem efeito; os agentes voltam. 2ª vez, sem efeito; podem voltar em outro dia. 3ª vez, recusa definitiva: a cadeia VIP é encerrada.
- observações: a fonte não diz se é possível combinar Sopas e Águas. Assumido que precisa ser o mesmo tipo. Fonte: linhas 538–558.

### vizinha_mutante — Vizinha mutante
- grupo: abrigo
- aparece quando: o pai foi em expedição. Cinco saídas, em três textos diferentes.
- frequência: não informada na fonte.
- situação: o pai tinha prometido dividir suprimentos com a vizinha mutante. A mãe não aprova.
- escolhas:
  - sopa (requer: Sopa, -1 Sopa): duas saídas.
    - a mãe vai junto para entregar: -1 Sopa e a sanidade de todos sobe.
    - o pai sai escondido: -1 Sopa e o pai fica ferido.
  - nada: duas saídas.
    - a mãe fica mais calma (+sanidade da mãe), e o pai perde sanidade (-sanidade do pai).
    - a vizinha vem sozinha, e a família acaba dividindo 1 Sopa (-1 Sopa).
- observações: a fonte não diz chance nem critério entre as duas saídas do "nada". Fonte: linhas 559–572.

### carta_ajuda — Carta de ajuda (sem título na fonte)
- grupo: cadeia:gemeos (início)
- aparece quando: a fonte não dá título nem condição. Aparece depois do evento da vizinha mutante. Texto de carta com pedido de suprimentos para um local marcado. Duas variantes.
- frequência: não informada na fonte.
- situação: alguém deixa uma carta pedindo ajuda. Os autores são os gêmeos.
- escolhas:
  - sopa (requer: Sopa, -1 Sopa): a família dá 1 Sopa e conhece os gêmeos, que prometem voltar a falar com a família. A fonte não marca avanço de cadeia; a conexão com a cadeia dos gêmeos é inferida.
  - nada: três respostas sem efeito. A família não envia nada.
- observações: título e condição ausentes na fonte; o nome do evento é nosso. Fonte: linhas 573–588.

### aranhas — Aranhas
- grupo: abrigo
- aparece quando: sem condição de dia. Três variantes de texto. Aranhas gigantes andam pelo abrigo.
- frequência: não informada na fonte.
- situação: as aranhas estão em todo lugar. A família precisa agir.
- escolhas:
  - repelente (requer: Repelente, -1 Repelente): duas saídas.
    - +1 Água.
    - +1 Sopa; às vezes, uma aranha morde a filha e ela vira mutante.
  - guia (requer: Guia de escoteiro): duas saídas: +1 Sopa ou +1 Água. Às vezes, a filha é mordida e vira mutante.
  - kit (requer: Kit médico): as pílulas fazem as aranhas sumirem. Sem efeito de item.
  - nada: a família luta sem ferramentas e fica cansada (alguns membros). Às vezes, a filha é mordida e vira mutante. Se o gato está no abrigo, ele mata as aranhas durante a noite. Sem efeito listado.
- observações: as aranhas que viram a filha mutante aparecem em mais de uma saída, sempre com "às vezes". Fonte: linhas 589–613.

### enxame — Enxame de baratas mutantes
- grupo: abrigo
- aparece quando: há baratas mutantes no abrigo. Seis variantes de texto.
- frequência: repete (cada vez que as baratas voltam, o evento se repete).
- situação: as baratas estão se organizando e tomando espaço. A família precisa expulsá-las.
- escolhas:
  - rifle (requer: Rifle): as baratas saem do abrigo. O rifle não é gasto.
  - repelente (requer: Repelente, -1 Repelente): as baratas saem. O repelente é gasto.
  - guia (requer: Guia de escoteiro): as baratas saem. O guia não é gasto.
  - nada: quatro saídas com alguns membros doentes e sanidade de todos caindo. Uma saída: se o gato está no abrigo, ele mata as baratas e elas saem.
- observações: a fonte não diz se as baratas podem voltar. Fonte: linhas 614–647.

### derrubar_ninho — Derrubar o ninho
- grupo: cadeia:gemeos
- aparece quando: os gêmeos, que já estão montando o acampamento, descobrem um ninho de baratas mutantes perto dele. Quatro variantes de texto.
- frequência: única.
- situação: o acampamento está pronto, mas tem um ninho. Os gêmeos pedem ajuda para destruí-lo.
- escolhas:
  - repelente, rifle ou machado (requer: Repelente, Rifle ou Machado): as baratas saem e o ninho é destruído. Nenhum item é gasto. A cadeia dos gêmeos continua.
  - nada: se a família tem algum dos itens pedidos, recusa e os gêmeos vão embora. Se não tem nenhum, também vão embora, com outro texto. A cadeia não avança.
- observações: a fonte não diz chance de a família conseguir remover o ninho. Fonte: linhas 648–667.

### diversao_criancas — Diversão para as crianças
- grupo: cadeia:gemeos
- aparece quando: o evento "Machado para a obra" ou "Plano do acampamento" já aconteceu antes. A fonte também cita um evento fora desta lista (a visita ao médico) como condição. Duas variantes de texto.
- frequência: única.
- situação: o acampamento está quase pronto. Faltam brinquedos para as crianças.
- escolhas:
  - gaita (requer: Gaita, -1 Gaita): a cadeia dos gêmeos continua. A gaita é gasta.
  - baralho (requer: Baralho, -1 Baralho): a cadeia continua. O baralho é gasto.
  - damas (requer: Damas, -1 Damas): a cadeia continua. As damas são gastas.
  - nada: duas respostas sem efeito. A família guarda os jogos.
- observações: a condição depende de um evento fora desta lista. Fonte: linhas 668–688.

### plano_mapa — Plano do acampamento
- grupo: cadeia:gemeos
- aparece quando: os gêmeos procuram um lugar para o acampamento e pedem um mapa da cidade. Três variantes de texto.
- frequência: única.
- situação: os gêmeos precisam de um mapa para escolher onde montar o acampamento.
- escolhas:
  - mapa (requer: Mapa): o mapa é entregue sem ser gasto. A cadeia dos gêmeos continua.
  - nada: duas recusas. A cadeia não avança.
- observações: a fonte não diz se o mapa volta. Fonte: linhas 689–702.

### cacadora — A caçadora
- grupo: porta (cadeia:cacadora, passo 1)
- aparece quando: uma mulher com rifle e roupa de camuflagem bate na porta, sem munição, caçando uma aranha gigante. Duas variantes de texto.
- frequência: única.
- situação: a caçadora pede munição e promete retribuir.
- escolhas:
  - municao (requer: Munição, -1 Munição): a caçadora fica agradecida. Não há prêmio imediato. O evento "Monstro na coleira" acontece alguns dias depois.
  - nada: a caçadora vai embora. Sem efeito.
- observações: a fonte não diz chance nem o que a caçadora faria com a aranha. Fonte: linhas 703–718.

### cavaleiros — Cavaleiros medievais
- grupo: porta
- aparece quando: sem condição de dia. Dois homens fantasiados de cavaleiros, com som de cavalo feito com pedras, pedem para ver o mapa. Duas variantes de texto.
- frequência: não informada na fonte.
- situação: os visitantes procuram um cálice antigo e estão perdidos.
- escolhas:
  - mapa (requer: Mapa): o mapa não é gasto. Sorteio entre três saídas: (1) suprimentos aleatórios; (2) +Damas; (3) +Machado.
  - nada: os visitantes ficam ofendidos e vão embora. Sem efeito.
- observações: a fonte não dá chance de cada saída. Fonte: linhas 724–738.

### vizinhos_porao — Vizinhos do porão
- grupo: abrigo
- aparece quando: barulhos vêm de baixo do piso e há um alçapão trancado no canto. Três variantes de texto.
- frequência: única.
- situação: a família ouve barulhos embaixo do abrigo e pode abrir o alçapão.
- escolhas:
  - machado (requer: Machado): seis saídas.
    - +Máscara de gás.
    - +2 Água (adega).
    - +Kit médico.
    - +Mapa.
    - nada.
    - alguém se fere.
    O machado não é gasto.
  - lanterna (requer: Lanterna): as mesmas seis saídas, exceto a primeira, que é só uma cena de réptil sem item. A lanterna não é gasta.
  - nada: a sanidade de todos cai.
- observações: a fonte não dá chance entre as saídas. Fonte: linhas 739–763.

### sinal_escoteiro — Sinal de escoteiros
- grupo: abrigo
- aparece quando: pelo menos uma expedição foi feita e o filho está no abrigo. Texto único.
- frequência: única.
- situação: as luzes no horizonte, vistas na volta de uma expedição, parecem um sinal de escoteiros. O filho quer decifrá-lo.
- escolhas:
  - guia (requer: Guia de escoteiro): o filho decifra o sinal. Ele quer preparar uma mensagem codificada para transmitir. A fonte não diz o efeito seguinte.
  - nada: a família desconfia de armadilha. -sanidade do filho.
- observações: a fonte não mostra evento seguinte para a mensagem codificada. Procurar nos eventos de rádio. Fonte: linhas 765–776.

### incendio — Incêndio
- grupo: abrigo
- aparece quando: sem condição de dia. Há fogo no abrigo. Três variantes de texto.
- frequência: não informada na fonte.
- situação: um fogo começa e espalha. A família só consegue salvar um item.
- escolhas:
  - kit (requer: Kit médico): o kit é salvo. Guia de escoteiro e Rádio são danificados (-Guia, -Rádio).
  - radio (requer: Rádio): o rádio é salvo. Guia de escoteiro e Kit são perdidos (-Guia, -Kit).
  - guia (requer: Guia de escoteiro): o guia é salvo. Rádio e Kit são perdidos (-Rádio, -Kit).
  - nada: quatro saídas.
    - Guia, Rádio e Kit são perdidos.
    - nada perdido; o fogo é apagado.
    - nada perdido; a família se atira no fogo e o apaga.
    - uma garrafa de água apaga o fogo. A fonte marca essa saída como "precisa checar", sem definir se a água é gasta.
- observações: o arquivo do Guia de escoteiro diz que ele conserta quase todos os itens do abrigo, o que pode alterar essas perdas em uma regra futura. O arquivo do Rádio diz que incêndio pode quebrá-lo. Fonte: linhas 777–802.

### ferida_filho — Ferida do filho
- grupo: abrigo
- aparece quando: às vezes, depois de o filho ir em expedição sem Kit médico. Duas variantes de texto.
- frequência: às vezes (sem percentual).
- situação: o filho se cortou num metal enferrujado e a ferida infeccionou.
- escolhas:
  - machado (requer: Machado, -1 Machado): cura a doença do filho. O machado é gasto. Às vezes (sem percentual), o machado escorrega e o filho é ferido.
  - kit (requer: Kit médico, -1 Kit médico): cura a doença do filho. O kit é gasto.
  - nada: o filho pode adoecer.
- observações: mesma estrutura de "Ferida da mãe". Fonte: linhas 803–817.

### duas_patas — Duas patas são melhores
- grupo: porta
- aparece quando: sem condição de dia. Quando a família vai olhar lá fora, um bicho de olhos brilhantes aparece no escuro. Três variantes de texto.
- frequência: não informada na fonte.
- situação: um animal rosna no escuro e a família tem poucos segundos para decidir.
- escolhas:
  - repelente (requer: Repelente, -1 Repelente): o bicho some. O cão deixa de ser obtenível.
  - rifle (requer: Rifle): o bicho é afugentado ou morto. O cão deixa de ser obtenível.
  - lanterna (requer: Lanterna): é um cachorro cansado. Ele fica uma noite e vai embora de manhã. Volta depois. Habilita "Comida para o cão".
  - nada: a família se assusta. -sanidade de todos. O cão deixa de ser obtenível.
- observações: só a Lanterna mantém a cadeia do cão. Fonte: linhas 818–837.

### comunicacao_baratas — Comunicação das baratas
- grupo: abrigo
- aparece quando: há baratas mutantes no abrigo. Duas variantes de texto.
- frequência: não informada na fonte.
- situação: as baratas parecem tentar se comunicar com a família, uma delas segurando um cartaz.
- escolhas:
  - guia (requer: Guia de escoteiro): a família responde com violência. Sem efeito listado.
  - repelente (requer: Repelente, -1 Repelente): duas saídas.
    - a família responde com violência. Sem efeito listado.
    - a reação com o spray desbloqueia uma conquista. Sem efeito de jogo.
  - nada: duas saídas.
    - -sanidade de todos.
    - às vezes, a filha vira mutante.
- observações: as duas saídas do repelente são alternativas sem critério na fonte. Fonte: linhas 839–856.

### academia_escola — Escola no acampamento
- grupo: cadeia:gemeos
- aparece quando: o acampamento dos gêmeos está quase pronto. A condição vem de eventos anteriores da mesma cadeia (machado, ou "Plano do acampamento"). A fonte cita também um evento fora desta lista. Quatro variantes de texto.
- frequência: única.
- situação: os gêmeos querem montar uma escola para as crianças do acampamento e pedem livros.
- escolhas:
  - guia (requer: Guia de escoteiro, -1 Guia): a família doa o guia. A cadeia dos gêmeos continua. O guia é perdido.
  - nada: cinco respostas de recusa. A cadeia não avança.
- observações: o guia é a única forma de avançar. Fonte: linhas 857–873.

### barulhos — Barulhos
- grupo: abrigo
- aparece quando: sem condição de dia. Há barulhos sem origem clara. Três variantes de texto.
- frequência: não informada na fonte.
- situação: a família ouve barulhos e não sabe de onde vêm. Isso tira a sanidade.
- escolhas:
  - baralho_ou_damas (requer: Baralho ou Damas): +sanidade de todos.
  - nada: quatro consequências com "às vezes" (sem percentual).
    - o pai enlouquece.
    - a mãe enlouquece.
    - a filha fica mais louca do que já estava.
    - o filho enlouquece e passa a usar uma lata como capacete.
- observações: a fonte não dá chance de cada consequência. Fonte: linhas 874–886.

### defender_abrigo — Defender o abrigo
- grupo: porta
- aparece quando: um grupo tenta entrar no abrigo. Cinco variantes de texto: gangue, bandidos da vizinhança, bombeiros falsos, senhoras com guarda-chuvas e bengalas, ou alguém raspando a porta.
- frequência: não informada na fonte.
- situação: um grupo tenta invadir. A família escolhe como reagir.
- escolhas:
  - cadeado (requer: Cadeado, -1 Cadeado): os invasores desistem e vão embora. O cadeado é gasto.
  - repelente (requer: Repelente, -1 Repelente): duas saídas.
    - os invasores recuam, sem perda.
    - eles roubam 2 Sopas (-2 Sopa), mesmo com o spray.
  - machado (requer: Machado, -1 Machado): duas saídas. O machado é perdido nas duas.
    - afastam o grupo e ganham um rifle (+Rifle).
    - afastam o grupo, sem ganho.
  - rifle (requer: Rifle): duas saídas. Em ambas, a fonte também traz a alternativa de o rifle quebrar.
    - afastam o grupo e ganham um machado (+Machado), ou o rifle quebra (-Rifle).
    - o rifle quebra (-Rifle).
  - nada: quinze saídas possíveis, sem critério definido na fonte.
    - os invasores vão embora, sem perda.
    - roubam 2 Sopas.
    - roubam 2 Águas.
    - saqueiam tudo o que há no abrigo.
    - o pai fica ferido.
    - a mãe fica ferida.
    - a filha fica ferida.
    - o filho fica ferido.
    - o pai é capturado (duas variantes de texto).
    - a mãe é capturada (duas variantes de texto).
    - a filha é capturada (duas variantes de texto).
    - o filho é capturado.
- observações: a fonte não diz chance de cada saída do "nada". Captura remove o personagem da família. Fonte: linhas 887–927.

### ajuda_refugiados — Ajuda aos refugiados
- grupo: porta
- aparece quando: sobreviventes feridos batem na porta pedindo água, comida ou curativos. Três variantes de texto.
- frequência: não informada na fonte.
- situação: um grupo de refugiados pede ajuda.
- escolhas:
  - kit_agua_ou_sopa (requer: Kit médico, Água ou Sopa, -1 desse item): três saídas.
    - +Mapa e sanidade de todos ao máximo.
    - +Rádio e sanidade de todos ao máximo.
    - sanidade de todos ao máximo.
  - nada: duas saídas.
    - os refugiados vão embora. Sem efeito.
    - eles atacam e roubam tudo o que há no abrigo.
- observações: a fonte não diz chance entre as três saídas do item. Fonte: linhas 928–942.

### vencedor_sopa — Quem ganha leva tudo (sopa)
- grupo: porta
- aparece quando: há pelo menos 2 Sopas no abrigo. Duas variantes de texto: um homem propõe um jogo de cartas com aposta de 2 Sopas.
- frequência: não informada na fonte.
- situação: um homem propõe uma partida de cartas, valendo 2 Sopas.
- escolhas:
  - baralho (requer: Baralho): compara o recurso menor com o maior (Sopa contra Água).
    - se Sopa é o menor: +2 Sopa.
    - se Sopa é o maior: -2 Sopa.
  - nada: o homem vai embora. Sem efeito.
- observações: a fonte não diz como medir "o menor" e "o maior" nem o que acontece em empate. Fonte: linhas 943–955.

### vencedor_agua — Quem ganha leva tudo (água)
- grupo: porta
- aparece quando: há pelo menos 2 Águas no abrigo. Duas variantes de texto: um homem propõe um jogo de cartas com aposta de 2 Águas.
- frequência: não informada na fonte.
- situação: um homem propõe uma partida de cartas, valendo 2 Águas.
- escolhas:
  - baralho (requer: Baralho): compara o recurso menor com o maior (Água contra Sopa).
    - se Água é o menor: +2 Água.
    - se Água é o maior: -2 Água.
  - nada: o homem vai embora. Sem efeito.
- observações: mesma dúvida do evento anterior sobre o critério de menor e maior. Fonte: linhas 956–968.

---

## Eventos seguintes (automáticos)

### monstro_coleira — Monstro na coleira
- grupo: cadeia:cacadora (passo 2)
- aparece quando: a caçadora foi ajudada com munição. Ocorre alguns dias depois. Não há escolha.
- frequência: única.
- situação: a caçadora volta com a aranha gigante domesticada e divide uma refeição com a família. A aranha ronrona.
- escolhas: nenhuma. Evento automático.
- efeito: remove a fome da família.
- observações: a fonte não diz quantos dias demora o retorno. Fonte: linha 719–722.

### medicos_retorno — Retorno dos médicos
- grupo: cadeia:medicos (passo 2)
- aparece quando: a família deu água ao grupo de médicos (passo 1). Ocorre alguns dias depois. Não há escolha.
- frequência: única.
- situação: os médicos voltam e aplicam injeções na família.
- escolhas: nenhuma. Evento automático.
- efeito: todos os membros feridos e doentes são curados.
- observações: a fonte não diz quantos dias demora o retorno. Fonte: linhas 501–504.
