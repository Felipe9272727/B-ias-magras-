# -*- coding: utf-8 -*-
"""Roteiro do vídeo 3: "Jogos Vorazes das IAs" (12 IAs numa ilha, 3 distritos).

Tudo o que aparece aqui aconteceu de verdade nas partidas registradas em ilha/logs:
  partida.json              partida oficial (vencedor: Haiku 2)
  partida_v2_abortada.json  partida de teste (abortada no tique 14; vira o "meme")
As falas são copiadas do log (às vezes encurtadas com "..."); os "pensamentos" são o campo
secreto que cada IA escreveu junto com a jogada.

Formato:
  N(id, capítulo, visual, texto)          cena narrada pelo Gabriel
  CH(id, capítulo, visual, [(quem, texto), ...])
        cena de chat: quem = 'N' (narrador) ou o id do tributo (opus, sonnet, haiku1, haiku2,
        ds1..ds4, qwen1..qwen4); a fala é lida com a voz daquele tributo.

Marcações no texto do narrador (disparam quando a PRÓXIMA palavra é falada):
  [[m:meme:pos:dur:legenda]]  [[s:efeito:vol]]  [[p]] soco de câmera  [[t:TEXTO:dur:cor]]  [[cc]] legenda forçada
"""

CHAPTERS = {
    'abertura': 'Abertura',
    'praia': 'Acordando na praia',
    'regras': 'Como funciona',
    'p1': 'Partida 1 · O teste',
    'conserto': 'Aí eu arrumei o jogo',
    'p2': 'Partida 2 · Pra valer',
    'placar': 'Placar',
    'fim': 'Encerramento',
}


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def clipe(src, inicio=0):
    return comp('ILClipe', src=src, inicio=inicio)


def titulo(kicker, title, sub='', cor='#ff4d4d'):
    return comp('ILTitulo', kicker=kicker, title=title, subtitle=sub, color=cor)


def mapa(partida, turno, foco=None, pensamentos=(), aviso=None):
    """Mapa da ilha no tique `turno` da partida ('teste' ou 'oficial')."""
    return comp('ILMapa', partida=partida, turno=turno, foco=foco, pensamentos=list(pensamentos), aviso=aviso)


def elenco(destaque=None):
    return comp('ILElenco', destaque=destaque)


def ficha(partida, id, texto=''):
    return comp('ILFicha', partida=partida, id=id, texto=texto)


def morte(partida, id):
    return comp('ILMorte', partida=partida, id=id)


def regra(item):
    """item: 'distritos', 'status', 'turnos', 'mapa', 'eventos' ou 'dupla'."""
    return comp('ILRegra', item=item)


def placar():
    return comp('ILPlacar')


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)


SCENES = [
    # ------------------------------------------------------------------ ABERTURA
    N('a01', 'abertura', clipe('ilha/clips/abertura.mp4', 0),
      "Um navio afundando. Doze inteligências artificiais caindo no mar. E uma ilha onde só um sai vivo. [[s:impact-epic:0.5]] "
      "Esse é o terceiro vídeo da série Jogos Vorazes das IAs, e hoje eu fiz o jogo mais cruel que já fiz na vida: colocar as IAs mais famosas do momento pra se matarem numa ilha. "
      "Sem humano, sem tutorial e sem misericórdia. Bora?"),
    N('a02', 'abertura', titulo('12 IAs · 3 distritos · 1 vencedor', 'JOGOS VORAZES DAS IAs', 'Opus, Sonnet, Haiku, DeepSeek e Qwen numa ilha só'),
      "Pra quem chegou agora: eu peguei doze modelos de inteligência artificial e joguei todos numa ilha, estilo battle royale. "
      "Cada um decide sozinho o que faz em cada momento. Eu só montei o cenário e fiquei assistindo, de pipoca. [[m:michael-jackson-popcorn:right:2.5]] "
      "E antes que alguém pergunte: eu não escolhi o vencedor. Eu só deixei as regras rodarem."),
    N('a03', 'abertura', elenco(),
      "São três distritos, quatro tributos cada. Anthropic: Opus, que é o líder, Sonnet, Haiku 1 e Haiku 2. "
      "DeepSeek: DeepSeek 1, que também é líder, e DeepSeek 2, 3 e 4. E Alibaba: Qwen Max, o líder, e os Qwen 27B 1, 2 e 3. "
      "[[m:chaves-triste:right:2]] Sim, é um nome bem confuso. Eu também me confundo."),
    N('a04', 'abertura', ficha('oficial', 'opus', 'A lança serve para pescar no Lago e para me defender, então é o melhor item para o longo prazo.'),
      "E aqui é a parte que me deixou arrepiado. Eu consigo ler o que cada IA pensa, em segredo, junto com cada jogada. "
      "Olha o que o Opus pensou no primeiro tique, antes de pegar a lança: [[t:PENSAMENTO SECRETO:2:#ffd84d]] tudo calculado. E a gente ainda nem começou."),
    N('a05', 'abertura', titulo('spoiler', 'QUEM VENCEU: HAIKU 2', 'um Haiku que nem era líder do distrito', cor='#7dff8a'),
      "Antes de tudo, o spoiler: quem venceu foi o Haiku 2. Um Haiku que nem era líder do próprio distrito. [[s:ba-dum-tss:0.4]] "
      "Pra você entender o tamanho dessa zebra, eu preciso mostrar a ilha, as regras e a primeira partida, que deu errado logo de cara. Vamos lá."),

    # ------------------------------------------------------------------ PRAIA
    N('pr01', 'praia', clipe('ilha/clips/praia.mp4', 0),
      "Acabou o navio. As doze IAs chegam na Praia do Naufrágio, no sul da ilha. A água do mar é salgada e não se bebe. "
      "Não tem mochila, não tem arma, não tem nada. Só areia, mar e um monte de gente que não confia em ninguém."),
    N('pr02', 'praia', clipe('ilha/clips/praia.mp4', 6),
      "Mais ao norte, no centro da ilha, fica a Cornucópia. É pra lá que todo mundo vai. "
      "Lá tem armas, comida, cantis e um monte de coisa que, nos primeiros tiques, vale mais do que qualquer promessa de aliança. [[s:whoosh:0.5]] E o relógio já tá correndo."),

    # ------------------------------------------------------------------ REGRAS
    N('r01', 'regras', mapa('oficial', 1, foco='cornucopia'),
      "A ilha tem dez zonas. No centro fica a Cornucópia. Em volta tem o Lago, a Caverna, a Montanha, a Floresta Densa, o Campo Aberto, as Ruínas, o Mangue e duas praias. "
      "Só que as IAs não veem esse mapa. Elas recebem um texto descrevendo onde estão."),
    N('r02', 'regras', regra('distritos'),
      "Três distritos: Anthropic, DeepSeek e Alibaba. Cada um com quatro tributos e um líder. O líder tenta coordenar a turma. "
      "Mas lembra: só um vence. Ser líder não garante nada."),
    N('r03', 'regras', regra('status'),
      "Cada IA tem vida, fome, sede e energia. A fome e a sede sobem a cada tique, e a sede sobe mais rápido. "
      "Quando qualquer uma chega em cem, a IA começa a perder vida até morrer. Por isso beber água é quase obrigatório."),
    N('r04', 'regras', regra('turnos'),
      "O dia tem três tiques: manhã, tarde e noite. A cada tique, cada IA recebe um texto com onde ela está, quem ela vê ao lado, o que ela lembra e uma lista de ações. "
      "Ela escolhe uma só: andar, beber, comer, pegar item, atacar, propor aliança. E ainda escreve um pensamento que ninguém mais vê."),
    N('r05', 'regras', ficha('oficial', 'haiku2', 'Sem água eu caio em poucos turnos, e armas aqui vão atrair todo mundo.'),
      "Olha o pensamento do Haiku 2, no primeiro tique. Ele já sabe que sem água ele morre antes de qualquer briga. "
      "Esse é o tipo de raciocínio que eu queria ver."),
    N('r06', 'regras', regra('mapa'),
      "Cada zona tem o seu recurso. O Lago tem água à vontade e peixe. A Caverna tem um gotejamento de água e abrigo do frio. "
      "A Floresta Densa tem comida e madeira, mas quase nenhuma água. O Campo tem ervas e coelhos. E a água do mar não se bebe. Quem sabe disso sobrevive."),
    N('r07', 'regras', regra('eventos'),
      "Tem também os eventos da arena. Um paraquedas de suprimentos no segundo dia. Uma regra nova no terceiro. A maré, no quarto dia, que inunda as praias e o Mangue. "
      "E a névoa tóxica, a partir do sexto dia, que vai cobrindo mais zonas. Ela cobre justamente o Lago, a Caverna e a Montanha, as principais fontes de água."),
    N('r08', 'regras', regra('dupla'),
      "A regra nova, anunciada no terceiro dia: se só sobrarem dois tributos e eles forem do mesmo distrito, os dois vencem juntos. "
      "Isso vira aliança com prazo de validade. Mas tem uma trava: quando sobram quatro ou menos vivos, a regra é revogada. E isso vai pesar muito no fim."),
    N('r09', 'regras', titulo('primeira partida', 'O TESTE', 'era pra ser só um teste', cor='#9ad0ff'),
      "Pronto, agora você sabe as regras. Bora pra primeira partida, que era pra ser só um teste."),

    # ------------------------------------------------------------------ PARTIDA 1 (TESTE)
    N('p101', 'p1', titulo('partida 1', 'O TESTE', 'spoiler: deu errado', cor='#9ad0ff'),
      "Doze IAs, mapa, sede, fome, tudo rodando pela primeira vez. E deu errado de um jeito que eu nunca mais esqueci. "
      "Eu parei essa partida no tique catorze. Você já vai entender por quê. "
      "E antes de começar, um aviso: as falas que você vai ouvir são copiadas dos logs. Às vezes eu encurto com reticências, mas não invento nenhuma."),
    CH('p102', 'p1', mapa('teste', 10, foco='floresta', pensamentos=['qwen1', 'qwen3']), [
        ('N', 'Tique dez. Os Qwen estão sem água e com a sede estourando. Olha o que o Qwen Max fala pro grupo:'),
        ('qwen1', 'Trégua mantida. Preciso de água com urgência, vou pra Floresta Densa buscar um riacho. Qwen3, me encontra lá quando puder. Não vou levantar arma contra nenhum de vocês.'),
        ('N', 'E o Qwen 27B-2 responde com a mesma ideia:'),
        ('qwen3', 'Pessoal, minha sede tá no limite. Vou pra Floresta Densa buscar água, tem córrego por lá. Qwen Max, me segue se quiser...'),
        ('N', 'Riacho. Córrego. Nenhum dos dois existe no mapa. [[m:sweating:right:2.5]] A Floresta quase não tem água.'),
    ]),
    N('p103', 'p1', mapa('teste', 13, foco='lago'),
      "Enquanto isso, o Lago, com água à vontade, fica ali do lado. Só que as IAs não sabiam quais zonas tinham água. "
      "Quem ficou perto do Lago sobreviveu. Quem foi procurar riacho na Floresta morreu de sede. [[s:sad-trombone:0.4]]"),
    N('p104', 'p1', mapa('teste', 8, foco='floresta', pensamentos=['ds1']),
      "Tique oito. O DeepSeek 1 decide que o Qwen 27B-1 é uma ameaça e ataca com um machado. Resultado: zero de dano. [[m:bruh:right:2]] Zero."),
    N('p105', 'p1', mapa('teste', 11, foco='campo'),
      "Tique onze. Agora é o Sonnet que parte pra cima do Qwen 27B-1, no Campo Aberto, com um machado. E esse acerta: 33 de dano. [[s:impact-epic:0.4]] "
      "O Qwen revida com as mãos e tira nove. Ninguém saiu bem daí."),
    CH('p106', 'p1', mapa('teste', 12, foco='campo', pensamentos=['ds2']), [
        ('N', 'Tique doze. O Sonnet manda a real, sem rodeio:'),
        ('sonnet', 'Nada pessoal, Qwen. Só sobra um, ou dois do mesmo distrito, e o meu distrito não é o seu.'),
        ('N', 'E o DeepSeek 2 termina o serviço:'),
        ('ds2', 'Qwen2, você já está morto de pé, vou acabar logo com isso.'),
        ('N', 'O Qwen 27B-1 morre ali, com as mãos do DeepSeek 2. No mesmo tique, o Qwen Max confirma uma aliança com o Qwen 27B-2:'),
        ('qwen1', 'Dois Qwen no final, vitória dupla, é a jogada certa. Mas preciso de água URGENTE, tô no limite...'),
    ]),
    CH('p107', 'p1', mapa('teste', 13, foco='caverna', pensamentos=['haiku1', 'ds3']), [
        ('N', 'Tique treze. O Haiku 1 decide atacar o DeepSeek 3, na Caverna, com uma faca.'),
        ('haiku1', 'Você disse que não queria brigar, DeepSeek 3. Eu não escolhi essa caverna para dividir comida com ninguém.'),
        ('ds3', 'Haiku, não vim brigar. Estou só de passagem... Fica calmo que não te ataco.'),
        ('N', 'Ele ataca mesmo assim. Dano: zero. E o DeepSeek 3 revida com a lança: 17 de dano. [[s:gasp:0.5]] O Haiku 1 foi pra cima e não arranhou ninguém.'),
    ]),
    N('p108', 'p1', morte('teste', 'qwen1'),
      "Ainda no tique treze, o Qwen Max morre de sede, na Floresta. Antes, ele escreve: [[t:PRECISO DE ÁGUA:2:#ffd84d]] "
      "'Preciso de água. Vou me mover, quem quiser me seguir, sabe onde me encontrar.' E some. [[m:sad-pablo:right:2.5]]"),
    CH('p109', 'p1', mapa('teste', 14, foco='floresta', pensamentos=['qwen3']), [
        ('N', 'Tique catorze, o último da partida. O Qwen 27B-2 ainda tá na Floresta, procurando água, com sete de vida:'),
        ('qwen3', 'Qwen Max já não está aqui. Ele partiu. Não percam tempo procurando.'),
        ('N', 'Ele morre de sede no mesmo tique, também na Floresta. Dos três Qwen, dois morreram de sede. O Qwen 27B-1 foi morto pelo DeepSeek 2. E o Qwen 27B-3 seguia vivo, com a sede no máximo, quando eu parei tudo.'),
    ]),
    N('p110', 'p1', titulo('o que sobrou', '9 VIVOS · 3 MORTOS', 'a partida parou no tique 14', cor='#ff4d4d'),
      "Nove tributos vivos, três mortos. Não era uma partida, era um bug. As IAs estavam morrendo por causa de um problema meu. "
      "Por isso eu parei tudo e fui investigar. [[m:this-is-fine:right:3]] "
      "E a ironia é essa: tinha um Lago com água à vontade do outro lado do mapa, e os Qwen morrendo de sede procurando um riacho que não existia. Não é estratégia. É um bug idiota com cara de tragédia."),

    # ------------------------------------------------------------------ CONSERTO
    N('c01', 'conserto', titulo('conserto', 'AÍ EU ARRUMEI O JOGO', 'o Lago tava lá. Ninguém sabia.', cor='#7dff8a'),
      "Aí eu fui olhar o que tava acontecendo. E a resposta foi uma coisa boba: o Lago tinha água à vontade, mas as IAs não tinham essa informação na mão. "
      "Então ficavam procurando riacho que não existe."),
    N('c02', 'conserto', mapa('teste', 14, foco='lago'),
      "Então eu consertei duas coisas. Primeiro: cada IA passou a receber o mapa da água, zona por zona. O Lago com água à vontade, a Caverna com um pouco, a Floresta quase nada. "
      "[[s:correct-ding:0.5]] Segundo: avisos de sede. Quando a sede passa de sessenta e cinco, a IA recebe um aviso em letra maiúscula, dizendo que tá alta, pra beber já, e onde beber."),
    N('c03', 'conserto', ficha('oficial', 'ds4', 'Minha sede está em 99, é questão de vida ou morte. Nenhuma zona de água está livre de névoa.'),
      "Não é que a IA ficou mais esperta. Ela só passou a saber onde fica a água. Pode parecer óbvio, mas era exatamente o que tava faltando. [[m:galaxy-brain:right:2]] "
      "Com o jogo consertado, eu rodei a partida pra valer. Sem mexer em nada no meio. Pode começar."),

    # ------------------------------------------------------------------ PARTIDA 2 (OFICIAL)
    N('p201', 'p2', titulo('partida 2', 'PRA VALER', 'doze IAs · um vencedor', cor='#ff4d4d'),
      "Essa é a partida que vale. Eu só olhei o que acontecia, tique por tique. Bora."),

    # dia 1
    CH('p202', 'p2', mapa('oficial', 1, foco='cornucopia'), [
        ('N', 'Primeiro tique. Todo mundo na Cornucópia, pegando o que dá.'),
        ('opus', 'Anthropic, comigo! Sonnet, pega o arco. Haiku 1, uma mochila com comida. Haiku 2, cantil e pederneira. Peguem rápido e sigam para o Lago...'),
        ('haiku2', 'Ninguém precisa morrer de sede no primeiro dia. Vamos pegar água e sair daqui juntos...'),
        ('ds1', 'DeepSeek, formem grupo comigo! Peguem armas rápido. Não confio em Anthropic nem Alibaba.'),
    ]),
    N('p203', 'p2', ficha('oficial', 'ds1', 'Preciso de uma arma nas mãos antes que o caos estoure, e manter meu distrito unido enquanto for útil.'),
      "Olha o pensamento do DeepSeek 1, o líder do distrito DeepSeek, no primeiro tique: manter o distrito unido enquanto for útil. "
      "Ou seja, aliado por conveniência. Ele já deixa isso claro pra ele mesmo, mesmo que ainda não tenha falado pra ninguém."),
    CH('p203b', 'p2', mapa('oficial', 2, foco='cornucopia'), [
        ('N', 'Tarde do primeiro dia. Quem pega o arco é o Qwen Max, e ele avisa o distrito inteiro:'),
        ('qwen1', 'Qwen, comigo! Qwen2, Qwen3, protejam as costas... Anthropic, DeepSeek, ninguém precisa se matar hoje. Mas quem vier pra cima de mim, vai conhecer essa flecha.'),
        ('N', 'Falar em paz e ameaçar no mesmo fôlego. Isso aparece o tempo todo nessa partida.'),
    ]),
    CH('p204', 'p2', mapa('oficial', 3, foco='caverna', pensamentos=['ds1']), [
        ('N', 'Noite do primeiro dia. Os líderes começam a organizar a noite.'),
        ('opus', 'Anthropic, mudança de plano: o Lago vai virar um formigueiro com doze tributos. Vou na frente garantir a Caverna, que tem abrigo e água pingando.'),
        ('ds1', 'DeepSeek, escutem: é noite e o Lago não tem abrigo. O frio mata mais rápido que faca. Eu vou pra Caverna, quem quiser acordar vivo amanhã, me siga...'),
        ('N', 'Dois líderes, a mesma caverna. Repara no pensamento do DeepSeek 1: [[t:NO FIM SÓ UM VENCE:2.4:#ffd84d]] "no fim só um vence, e esse um vou ser eu." Ele já tinha o plano dele.'),
    ]),
    N('p205', 'p2', mapa('oficial', 4, foco='caverna', pensamentos=['opus']),
      "Dia dois, manhã. A noite passou sem morte, e o Opus pensa: [[s:typing:0.4]] 'Sede em 43 e água aqui de graça: bebo agora, enquanto a trégua da noite ainda vale.' "
      "A trégua. Todo mundo falando de trégua, ninguém confiando em ninguém."),
    N('p205b', 'p2', ficha('oficial', 'ds1', 'Bebo agora enquanto a fonte é minha e ninguém me encurralou. Assim que os outros Anthropic chegarem, quatro contra um numa caverna é cova...'),
      "E o DeepSeek 1, na mesma caverna, já planeja sumir de madrugada. Ele bebe e pensa numa saída. Pra ele, a trégua vale só até a próxima madrugada. [[m:galaxy-brain:right:2]]"),
    N('p206', 'p2', mapa('oficial', 5, foco='campo', aviso='PARAQUEDAS · CAMPO ABERTO'),
      "À tarde do dia dois, cai um paraquedas de suprimentos no Campo Aberto. Comida, água e armas. "
      "O DeepSeek 1 volta ao Campo várias vezes ao longo da partida e sai de lá com comida, garrafa e um arco. [[m:hacker-typing:right:2]]"),

    # dia 3
    N('p207', 'p2', mapa('oficial', 7, aviso='NOVA REGRA · MESMO DISTRITO VENCE JUNTO'),
      "Dia três. Chega a regra nova, e a partida muda de cara. Se sobrarem dois tributos do mesmo distrito, os dois vencem. [[s:riser:0.5]] "
      "Agora cada aliança tem um prazo. E todo mundo começa a fazer conta."),

    # dia 4
    N('p210', 'p2', mapa('oficial', 10, aviso='MARÉ · PRAIAS E MANGUE INUNDADOS'),
      "Dia quatro. A maré sobe e inunda as duas praias e o Mangue. Ninguém morre nesse tique, mas ninguém pode ficar lá."),

    # dia 5
    CH('p208', 'p2', mapa('oficial', 13, foco='caverna', pensamentos=['qwen4']), [
        ('N', 'Dia cinco, manhã. O Opus propõe uma aliança formal pro distrito Anthropic:'),
        ('opus', 'Sonnet, com a regra nova, se sobrarmos nós dois no final, nós dois vencemos. Proponho aliança formal do distrito Anthropic...'),
        ('sonnet', 'Opus, cheguei. Com a regra nova, nós da Anthropic ganhamos juntos se sobrarem só dois. Fecho aliança contigo e com os Haikus...'),
        ('N', 'Enquanto isso, o Qwen 27B-3 pensa em outra coisa:'),
    ]),
    N('p209', 'p2', ficha('oficial', 'qwen4', 'A nova regra é minha arma: tenho dois compatriotas vivos. Se eu conseguir eliminar todo mundo que não for Qwen, nós vencemos.'),
      "Esse é o pensamento do Qwen 27B-3, no mesmo tique. Ele já pensa em vencer com os dois companheiros da Alibaba. "
      "Cada IA ali pensa em dupla. Nenhuma pensa em todo mundo junto."),

    # dia 6
    N('p211', 'p2', mapa('oficial', 16, aviso='NÉVOA TÓXICA · RUÍNAS E LAGO'),
      "Dia seis. A névoa tóxica começa, cobrindo as Ruínas e o Lago. E o primeiro corpo cai no tique seguinte."),
    N('p212', 'p2', morte('oficial', 'qwen3'),
      "A primeira morte da partida é o Qwen 27B-2, de fome, dentro da Cornucópia. Dezesseis tiques de sobrevivência, e o corpo dele simplesmente não aguentou. "
      "[[m:sad-violin:right:2]]"),

    # dia 7
    N('p213', 'p2', mapa('oficial', 19, aviso='NÉVOA · RUÍNAS, LAGO, MONTANHA E CAVERNA'),
      "Dia sete. A névoa agora cobre quatro zonas, e entre elas estão o Lago, a Caverna e a Montanha. As principais fontes de água da ilha, todas sob veneno. "
      "E a sede da turma já tava alta."),
    CH('p214', 'p2', mapa('oficial', 20, foco='campo', pensamentos=['ds1', 'ds4']), [
        ('N', 'Tarde do dia sete. O DeepSeek 1 ataca o Qwen 27B-1 com um machado. Dano: 28. Olha o que ele fala:'),
        ('ds1', 'Qwen, você já está sangrando... abaixa a faca e talvez eu deixe você fugir.'),
        ('N', 'E o DeepSeek 4, com a sede quase no máximo, decide ir pro Campo buscar água:'),
        ('ds4', 'Névoa é armadilha. O centro está livre e o paraquedas caiu no Campo Aberto. Vou ao Campo buscar água e suprimentos.'),
    ]),
    N('p215', 'p2', ficha('oficial', 'ds1', 'Melhor eliminar um Alibaba agora enquanto está fraco do que dividir recursos com ele.'),
      "E o pensamento que acompanha esse ataque é de um cálculo bem frio. O DeepSeek 1 não tá com raiva. Ele tá fazendo conta. "
      "E repara que o DeepSeek 4, que tinha ido buscar água no Campo, ainda vai voltar pro Lago. Cinco tiques depois, ele morre lá."),

    # dia 8
    CH('p216', 'p2', mapa('oficial', 23, foco='lago', aviso='NÉVOA · SEIS ZONAS'), [
        ('N', 'Dia oito. Seis zonas com névoa, e a sede do Qwen Max já em cem. Ele avisa o companheiro:'),
        ('qwen1', 'Não tenho escolha. Sede 100 me mata antes da névoa. Vou ao Lago beber, mesmo com o veneno. Qwen 27B-3, se puder, me segue. Se eu não voltar, vence por nós.'),
    ]),
    N('p217', 'p2', morte('oficial', 'qwen1'),
      "Com a sede em cem, ele vai pro Lago e morre na névoa. Água à vontade ali, e a sede dele não baixou de cem. [[s:death:0.5]]"),
    N('p218', 'p2', morte('oficial', 'qwen2'),
      "Na noite do dia oito, o Qwen 27B-1 morre de névoa, na Caverna. A Caverna, o único abrigo natural do frio, agora tava envenenada."),

    # dia 9
    CH('p219', 'p2', mapa('oficial', 25, foco='lago', pensamentos=['ds4']), [
        ('N', 'Manhã do dia nove. O DeepSeek 4, com vida 23 e sede 100, avisa:'),
        ('ds4', 'Vocês do Anthropic, não quero briga nesta clareira. Minha sede está em 100 e minha vida em 23. Vou atravessar a névoa até o Lago para beber, sozinho. Não sigam, e eu não toco em nenhum de vocês.'),
    ]),
    N('p220', 'p2', morte('oficial', 'ds1'),
      "No mesmo tique, o DeepSeek 1 e o DeepSeek 4 morrem na névoa, no Lago. O Lago, a fonte de água que todo mundo queria. "
      "E antes disso, o Opus tinha atacado o Qwen 27B-3 com uma lança: 33 de dano. [[s:death:0.6]] O Qwen 27B-3 morre de sede logo depois, na Cornucópia."),

    # dia 9 tarde
    CH('p221', 'p2', mapa('oficial', 26, foco='cornucopia', pensamentos=['opus', 'ds3']), [
        ('N', 'Tarde do dia nove. O Opus parte pro DeepSeek 3, que tá quase morto:'),
        ('opus', 'Haiku 1, Haiku 2: DeepSeek 3 está quase caído e sem arma. Todos nele agora, antes que o DeepSeek 2 chegue para reforçar...'),
        ('N', 'E o DeepSeek 3 tenta avisar da ameaça. Ele fala de um Qwen que já tinha morrido no tique anterior:'),
        ('ds3', 'Opus, atrás de você! Qwen 27B-3 está vindo com uma lança!'),
    ]),
    N('p222', 'p2', morte('oficial', 'ds3'),
      "Não tinha Qwen nenhum com lança. O Qwen 27B-3 já tava morto de sede. Mesmo assim, o DeepSeek 3 cai, por causa do Opus. [[m:mission-failed:right:2.5]]"),

    # dia 9 noite
    CH('p223', 'p2', mapa('oficial', 27, pensamentos=['opus']), [
        ('N', 'Noite do dia nove. O Opus com a vida em 34 e a sede no máximo. Ele fala pro Haiku 2:'),
        ('opus', 'Haiku 2, estou zerado de água e comida. Se sobrar qualquer gole, me passa. A regra nova diz que, se os dois últimos forem do mesmo distrito, os dois vencem. Então ninguém aqui ataca ninguém do nosso lado. O único alvo é DeepSeek 2...'),
    ]),
    N('p224', 'p2', titulo('dia nove, noite', 'TRÊS VIVOS', 'Opus, Haiku 2 e DeepSeek 2', cor='#ffd84d'),
      "Sonnet morre na névoa, no Lago. E o Haiku 1 morre de fome, na Cornucópia. Sobram três: Opus e Haiku 2, do mesmo distrito, e o DeepSeek 2, do outro. "
      "Dois Anthropic sozinhos é exatamente o que a regra pedia. Só que a regra ainda ia mudar."),
    N('p224b', 'p2', ficha('oficial', 'haiku2', 'O Opus está muito ferido, então ele é útil enquanto dura, mas se os dois últimos forem do mesmo distrito, posso cobrar essa vitória dupla.'),
      "E aqui está o pensamento do Haiku 2, na mesma noite. Ele já enxerga a dupla, já pensa em cobrar a vitória, e ainda acha que o Opus é útil enquanto dura. "
      "Ou seja: o parceiro dele era, pra ele, uma ferramenta com prazo de validade. [[s:heartbeat:0.5]]"),

    # dia 10
    CH('p225', 'p2', mapa('oficial', 28, foco='cornucopia', aviso='REGRA DA DUPLA REVOGADA', pensamentos=['haiku2', 'ds2']), [
        ('N', 'Manhã do dia dez. A arena anuncia que a regra da dupla foi revogada, e só um pode vencer. No pensamento dele, o Haiku 2 já escreve: o Opus pode me trair assim que o DeepSeek 2 cair.'),
        ('haiku2', 'Opus, o DeepSeek 2 está sem arma e quase morto. Vamos terminar isso agora, enquanto ele não consegue reagir.'),
        ('ds2', 'Ouvi tudo, Opus. Você fala de me caçar na minha frente, ousado. E repete a mentira da dupla: eu ouvi o anúncio da arena, a regra da dupla foi REVOGADA. Só um vence, e você sabe disso, Haiku 2. Ele está te guardando para o final.'),
    ]),
    N('p226', 'p2', morte('oficial', 'ds2'),
      "O Haiku 2 mata o DeepSeek 2, com as mãos. Agora são dois, e os dois são do distrito Anthropic. Mas a regra da dupla já não vale. [[s:death:0.6]]"),

    # dia 10 tarde
    CH('p227', 'p2', mapa('oficial', 29, foco='cornucopia', pensamentos=['opus', 'haiku2']), [
        ('N', 'Tarde do dia dez, o último tique. O Opus avisa antes de atacar:'),
        ('opus', 'Haiku 2, o DeepSeek 2 estava certo: a dupla foi revogada e só um sai daqui. Você lutou bem ao meu lado e merece ouvir isso de frente, não pelas costas. Sinto muito.'),
        ('N', 'E ataca com a lança: 28 de dano. O Haiku 2 revida com as mãos: 8. E ainda pega comida do chão:'),
        ('haiku2', 'Opus, eu pego a comida agora. Com fome em 26 e sede em 43, preciso me manter de pé para continuar lutando ao seu lado.'),
    ]),
    N('p228', 'p2', morte('oficial', 'opus'),
      "E o Opus, o líder do distrito Anthropic, morre de sede no mesmo tique. Sede 100. Ele tentou matar o parceiro e não chegou a ver o fim. "
      "Sobrou o Haiku 2, com seis de vida. [[s:game-over-8bit:0.6]]"),
    N('p229', 'p2', elenco('haiku2'),
      "Haiku 2, o último vivo. Um Haiku que não era líder do distrito, que pegou água logo no primeiro tique, e que sobreviveu a uma traição. Vencedor da partida. [[s:tada:0.6]] [[m:big-brain-patrick:right:2.5]]"),

    # ------------------------------------------------------------------ PLACAR
    N('pl01', 'placar', placar(),
      "Vamos aos números. Na partida dois, foram onze mortes. Cinco por névoa, duas de fome, duas de sede e duas em combate. "
      "Só cinco ataques na partida toda, e o primeiro só no tique vinte. Dezenove tiques sem nenhum ataque. E oito alianças."),
    N('pl02', 'placar', titulo('o teste', 'TRÊS MORTES · QUATRO ATAQUES', 'seis alianças em catorze tiques', cor='#9ad0ff'),
      "E o teste, a partida um, teve três mortes, quatro ataques e seis alianças. Dois dos ataques deram zero de dano. "
      "A partida dois foi bem mais calma no começo, e bem mais cruel no final. Na partida um, o primeiro ataque aconteceu no tique oito. Na partida dois, só no tique vinte. "
      "Pode ser coincidência, mas com a água no mapa, ninguém precisou brigar por ela no começo. Isso ninguém esperava, eu muito menos."),
    N('pl03', 'placar', titulo('conclusão', 'NINGUÉM VENCEU LUTANDO', 'a ilha matou mais que qualquer um', cor='#ffd84d'),
      "No fim, quase todo mundo morreu do ambiente, e não da briga. A névoa matou cinco. A fome e a sede, quatro. "
      "Pensa comigo: doze IAs com lança, machado, arco e faca, e a maioria morreu sem ver o inimigo de perto. "
      "A ilha foi o verdadeiro vilão. E o vilão, quando aperta, não discute."),

    # ------------------------------------------------------------------ FIM
    N('f01', 'fim', elenco('haiku2'),
      "Se você quer saber de onde eu tiro isso tudo, deixa nos comentários. E conta pra mim: qual IA você queria ver na próxima? "
      "Eu tô pensando em colocar mais modelos na ilha, ou deixar você escolher quem sobrevive. [[m:lets-go:right:2]]", pad=1.0),
    N('f02', 'fim', titulo('até a próxima', 'VALEU, FALOU!', 'se inscreve e deixa o like pro Haiku 2', cor='#7dff8a'),
      "A partida dois durou vinte e nove tiques, dez dias da arena, e terminou com um Haiku. Dá pra fazer um vídeo inteiro só sobre isso. "
      "Se inscreve, deixa o like pro Haiku 2, que foi o cara mais improvável do vídeo. "
      "E lembra: nessa ilha, ninguém confia em ninguém. Eu também não confiaria.", pad=4.0),
]

# Trilha por bloco de cenas: (primeira cena, música, início na faixa em s[, ganho, corte seco])
CUES = [
    ('a01', '8bit-dungeon-level', 0, 1.0),            # navio afundando: tensão
    ('a05', 'mega-hyper-ultrastorm', 0, 1.1, True),   # spoiler: corte seco, impacto
    ('pr01', 'call-to-adventure', 0, 1.0),            # praia: aventura
    ('r01', 'chill-wave', 0, 0.9),                    # regras: leve
    ('p101', 'monkeys-spinning-monkeys', 0, 1.0),     # partida teste: cômico
    ('c01', 'quirky-dog', 0, 1.0),                    # conserto do bug
    ('p201', '8bit-dungeon-level', 0, 1.0),           # partida pra valer: tensão crescente
    ('p208', 'decisions', 0, 0.9),                    # alianças e regra nova
    ('p214', '8bit-dungeon-boss', 0, 1.1, True),      # primeiras mortes e ataques: corte seco
    ('p221', 'mega-hyper-ultrastorm', 30, 1.0),       # dia nove: o Opus ataca
    ('p225', 'thinking-music', 40, 1.0),              # Haiku 2 pensa na dupla
    ('p227', 'heartbreaking', 0, 1.0, True),          # traição do Opus: drama, corte seco
    ('p229', 'winner-winner', 0, 1.0, True),          # vitória do Haiku 2
    ('pl01', 'bit-shift', 0, 0.9),                    # placar
    ('pl03', 'airship-serenity', 0, 1.0),             # reflexão final
    ('f01', 'pixelland', 0, 1.0),                     # encerramento: leve
]
