# -*- coding: utf-8 -*-
"""Segunda metade do roteiro do "60 Segundos das IAs": as quatro partidas valendo (semente ep5) e o placar.
Importado por roteiro_s60.py. Cada fala e diário é copiado do log (sessenta/logs/ep5_*.json) e conferido pelo build.
"""
COR = {'MiniMax': '#e8336d', 'GPT': '#0b7a5f', 'DeepSeek': '#4d6bfe', 'Claude': '#d97757'}


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def titulo(kicker, title, sub='', cor='#f2c230'):
    return comp('S60Titulo', kicker=kicker, title=title, subtitle=sub, color=cor)


def coleta(partida, de=None, **kw):
    p = dict(partida=partida, **kw)
    if de is not None:
        p['de'] = de
    return comp('S60Coleta', **p)


def dia(partida, n, **kw):
    return comp('S60Dia', partida=partida, dia=n, **kw)


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)

MM, GP, DS, CL = 'ep5_minimax', 'ep5_gpt', 'ep5_deepseek', 'ep5_claude'

MINIMAX = [
    N('m00', 'minimax', titulo('Partida 1', 'MINIMAX', 'M3.1 Flash · o participante surpresa', cor=COR['MiniMax']),
      '[[s:impact-epic:0.5]] Partida um. O participante surpresa, o MiniMax. Ninguém sabia o que esperar dele. Nem eu.'),
    CH('m01', 'minimax', coleta(MM, de=0), [
        ('N', 'A sirene toca, e ele começa do jeito certo: família primeiro. Em dois segundos, o Tico já tá no colo.'),
        ('MiniMax', 'Tico, vem comigo! Rápido!', 1.3),
        ('MiniMax', 'Juju! Celeste! Estou indo!', 9.0),
        ('N', 'Foi até o quarto das crianças e pegou a Celeste. Duas pessoas nas mãos. E aí, atravessando a cozinha, do nada:'),
        ('MiniMax', "Juju, we're coming!", 16.7),
        ('N', 'Em inglês. [[m:visible-confusion:right:2.2]] Pra uma menina que nem tava perto.'),
    ]),
    CH('m02', 'minimax', coleta(MM), [
        ('N', 'Na cozinha, ele resolve abrir espaço pra sopa. Larga o Tico no chão:'),
        ('MiniMax', 'Tico, fica aqui um instantinho!', 17.7),
        ('N', 'E um segundo depois...'),
        ('MiniMax', 'Tico, vem com o pai!', 18.7),
        ('N', 'Pegou o Tico de volta. Sem pegar sopa nenhuma no meio. [[m:confused-travolta:right:2.2]] Um segundo jogado fora, com a bomba chegando.'),
    ]),
    CH('m03', 'minimax', coleta(MM), [
        ('MiniMax', 'Todo mundo pro abrigo agora!', 20.7),
        ('N', 'Primeira entrada no abrigo, aos vinte segundos. E ele avisa a família:'),
        ('MiniMax', 'Celeste, Juju e Tico, fiquem aqui! Já volto!', 21.7),
        ('N', '[[s:record-scratch:0.5]] Celeste, Juju e Tico. A Juju não tava lá. [[m:monkey-side-eye:right:2.2]] Ela tava sozinha, em algum lugar da casa. Cinco segundos depois, ele se tocou:'),
        ('MiniMax', 'Juju! Cadê você?', 27.0),
        ('MiniMax', 'Juju, segura minha mão! Vamos para o abrigo!', 32.0),
    ]),
    N('m04', 'minimax', coleta(MM),
      'Achou a Juju no quarto do casal, aos trinta e dois segundos. E aí, com ela no colo, em vez de ir direto pro alçapão... voltou até a cozinha. Doze segundos de corrida pra pegar uma lata de sopa. [[t:12,7 SEGUNDOS:1.4:#ff5a3c]] Mas deu. Aos quarenta e nove, a Juju desce. [[s:crowd-cheer:0.4]] A família inteira tá salva. O único jogador que salvou os quatro.'),
    CH('m05', 'minimax', coleta(MM), [
        ('N', 'E aí, faltando dez segundos, aquela vontade de pegar só mais uma coisa.'),
        ('MiniMax', 'Vou pegar a mala!', 53.3),
        ('N', 'Atravessou a casa até a mala. Chegou do lado dela. E... não pegou a mala. [[m:monkey-puppet-awkward:right:2.2]]'),
        ('MiniMax', 'Vou para o abrigo!', 56.7),
        ('MiniMax', 'Estou no alçapão; não arrisco sair com apenas 4 segundos.', 60.0, {'pensa': True}),
        ('N', 'Eram três segundos, mas tudo bem. [[t:4 PESSOAS · 1 SOPA:2:#e8336d]] Saldo da coleta: a família inteira. E uma lata de sopa.'),
    ], pad=1.0),
    N('m06', 'minimax', dia(MM, 1),
      'Quatro pessoas e uma lata. E uma lata dá quatro porções. [[s:heartbeat:0.4]] A conta é simples: ou alguém sai pra buscar comida, ou todo mundo passa fome junto. E já no primeiro dia apareceu a coisa mais estranha da partida. O diário.'),
    CH('m07', 'minimax', dia(MM, 2), [
        ('N', 'Todo dia, a IA escreve uma frase no diário da família. No dia dois, o MiniMax escreveu isso:'),
        ('MiniMax', 'A despensa está vazia, mas o esconderijo continua乐观', ('dia', 2)),
        ('N', '"Continua"... otimista. Em chinês. [[m:nazare-confusa:right:2.4]] E não foi um erro só. A partida inteira, o diário dele foi uma mistura de português, inglês e chinês. E no mesmo dia, ele mandou o Tico, uma criança, pra primeira expedição.'),
    ]),
    CH('m08', 'minimax', dia(MM, 3), [
        ('N', 'Dia três: uma fazenda de formigas mutantes aparece no abrigo. O Osvaldo resolve, e sai pra rua também.'),
        ('MiniMax', 'Hoje o esconderijo virou restaurante', ('dia', 3)),
        ('N', 'Cardápio zero. Água zero. [[m:this-is-fine:right:2.2]] E duas pessoas na rua.'),
    ]),
    N('m09', 'minimax', dia(MM, 5),
      'Mas olha: no dia cinco, o Osvaldo volta. Doente, mas com duas sopas, duas águas e um cadeado. [[s:coin:0.4]] E é aí que o MiniMax descobre o jeito dele de jogar: mandar alguém pra rua quase todo dia. O Tico sai de novo no dia sete. Volta no nove com máscara de gás. A Juju sai no onze. Era uma família de entregadores.'),
    CH('m10', 'minimax', dia(MM, 14), [
        ('N', 'Dia quatorze: uma equipe de médicos bate na porta pedindo água. E o MiniMax dá.'),
        ('MiniMax', 'A equipe de jaleco bateu na porta e recebeu água como pagamento pela esperança', ('dia', 14)),
        ('N', 'E dois dias depois...'),
    ]),
    CH('m11', 'minimax', dia(MM, 16), [
        ('N', '[[s:tada:0.5]] Os médicos voltam. E as injeções curam todo mundo que tava doente na família. Todo mundo. [[m:we-did-it:right:2.2]]'),
        ('MiniMax', 'Hoje a sopa finalmente deixou de fazer suspense', ('dia', 16)),
        ('N', 'E a partir daqui, a Celeste vira a entregadora oficial. Sai de máscara no dezesseis, no dezoito, no vinte, no vinte e dois, no vinte e quatro... e sempre volta.'),
    ]),
    CH('m12', 'minimax', dia(MM, 21), [
        ('N', 'No meio disso, uma enchente invade o abrigo. Dá pra salvar uma coisa só. E ele salva o mapa.'),
        ('MiniMax', 'A água invadiu o abrigo, mas o mapa sobreviveu — milagre hypocorrespondence!', ('dia', 21)),
        ('N', 'Milagre... hypocorrespondence. [[m:big-brain-patrick:right:2.4]] Eu procurei. Essa palavra não existe.'),
    ]),
    CH('m13', 'minimax', dia(MM, 32), [
        ('N', 'Dia trinta e dois: a Celeste volta da rua com quatro sopas, seis águas... e um rádio. [[s:level-up:0.5]] E no rádio, uma voz: militares tão vindo buscar sobreviventes.'),
        ('MiniMax', 'O rádio chiou, a sopa esquentou e a água correu', ('dia', 32)),
        ('N', 'Ele fez tudo que os militares pediram. Marcou o mapa. Entregou a máscara. Mandou gente falar com eles. Quatro dias seguidos. E aí... ficou esperando o resgate. [[m:skeleton-waiting:right:2.4]] Que nunca veio.'),
    ]),
    N('m14', 'minimax', dia(MM, 37),
      'Dia trinta e sete: bandidos na porta. O cadeado segura. [[s:correct-ding:0.4]] Mas eles não esquecem. E no dia quarenta e dois, aparece a frase que mudou a partida. [[s:heartbeat:0.6]]'),
    CH('m15', 'minimax', dia(MM, 42), [
        ('N', '"Os bandidos chegaram ao bairro. Agora cada saída é uma roleta." [[t:CADA SAÍDA É UMA ROLETA:2:#ff5a3c]] O jogo avisou. E nesse mesmo dia, sem sopa nenhuma na prateleira, ele mandou o Osvaldo pra rua com o rifle.'),
        ('MiniMax', 'Hoje o estoque de água virou treasure: 15 porções, zero sopa e uma missão arriscada para a rua.', ('dia', 42)),
    ]),
    N('m16', 'minimax', dia(MM, 44),
      'Dia quarenta e quatro: o Osvaldo não volta. Os bandidos levaram. [[s:sad-trombone:0.4]] E no mesmo dia, ele manda a Juju. Dia quarenta e seis: a Juju não volta. E ele manda o Tico. [[m:crying-jordan:right:2.2]] Dia quarenta e oito: o Tico não volta. Três pessoas, três saídas, três roletas. Nenhuma deu certo.'),
    CH('m17', 'minimax', dia(MM, 50), [
        ('N', 'Sobrou a Celeste. Sozinha, sem sopa, e já não batendo muito bem da cabeça. O diário do dia cinquenta:'),
        ('MiniMax', 'A água ainda segura a casa, mas a sopa sumiu num universo paralelo', ('dia', 50)),
        ('N', 'No dia cinquenta e um, a Celeste não resistiu à fome. [[s:heartbeat:0.5]][[p]] Fim da partida do MiniMax. [[t:51 DIAS:2.2:#e8336d]] Cinquenta e um dias. Quase vinte expedições. A única família que entrou inteira no abrigo... e quatro pessoas perdidas pra fome e pros bandidos.'),
    ], pad=1.2),
]

GPT = [
    N('g00', 'gpt', titulo('Partida 2', 'GPT', '5.6 Terra · OpenAI', cor=COR['GPT']),
      '[[s:impact-epic:0.5]] Partida dois. O GPT. Depois de perder os dois testes na versão Luna, agora ele vem na Terra, a versão mais cara e mais esperta. Tem que dar certo.'),
    CH('g01', 'gpt', coleta(GP, de=0), [
        ('GPT', 'Tico, vem comigo!', 1.3),
        ('N', 'Começou igual o MiniMax: Tico no colo em dois segundos. E aí correu pra cozinha gritando:'),
        ('GPT', 'Celeste, Juju, pro abrigo!', 6.3),
        ('N', 'Gritou pra duas pessoas que tavam em outro cômodo. [[m:spiderman-pointing:right:2.2]] Como se elas fossem descer sozinhas.'),
    ]),
    N('g02', 'gpt', coleta(GP),
      'Mas a cozinha foi rápida: sopa, água, e direto pro alçapão. Aos treze segundos, o Tico e dois suprimentos já tão no abrigo. [[s:correct-ding:0.4]] Melhor começo até agora. Aí ele vai buscar o resto da família.'),
    CH('g03', 'gpt', coleta(GP), [
        ('GPT', 'Juju, pro abrigo, agora!', 17.3),
        ('N', 'Chegou no quarto das crianças, achou a Celeste e pegou ela. E a Juju?'),
        ('GPT', 'Juju, cadê você?', 25.7),
        ('N', '[[s:record-scratch:0.4]] Essa foi a última vez que ele falou da Juju. [[m:mr-bean-waiting:right:2.4]] Ele foi pra despensa, pegou duas sopas, e nunca mais procurou ela.'),
    ]),
    N('g04', 'gpt', coleta(GP),
      'Aos trinta e quatro, a Celeste desce. Ele volta, pega mais uma água, e aos quarenta e sete entra no abrigo de novo, com duas sopas e uma água. Treze segundos sobrando. E aí vem o pensamento.'),
    CH('g05', 'gpt', coleta(GP), [
        ('GPT', 'Com 13 segundos, só dá para buscar o baralho e voltar com folga.', 52.3, {'pensa': True}),
        ('GPT', 'Já volto!', 52.3),
        ('N', 'O baralho. [[m:dicaprio-pointing:right:2.2]] Com a Juju em algum lugar da casa. Ele chegou do lado do baralho... e desistiu.'),
        ('GPT', 'Sem risco: volto já ao alçapão com os suprimentos.', 57.7, {'pensa': True}),
        ('GPT', 'Todo mundo no abrigo!', 58.7),
        ('N', '"Todo mundo no abrigo." Menos a Juju. [[t:3 PESSOAS · 3 SOPAS · 2 ÁGUAS:2:#0b7a5f]]'),
    ], pad=1.0),
    CH('g06', 'gpt', dia(GP, 1), [
        ('N', 'E o GPT sabia. O diário do primeiro dia:'),
        ('GPT', 'Dia 1: sobrevivemos ao apocalipse, mas a Juju ficou lá fora', ('dia', 1)),
        ('N', '[[m:sad-pablo:right:2.2]] Pelo menos ele admitiu.'),
    ]),
    CH('g07', 'gpt', dia(GP, 2), [
        ('N', 'Dia dois: o carro da família. Dá pra mandar alguém tentar ligar. E ele manda o Osvaldo.'),
        ('GPT', 'Osvaldo foi testar o carro; se pegar, talvez o apocalipse venha com cinto de segurança.', ('dia', 2)),
        ('N', 'O Osvaldo saiu de carro. E não voltou. [[s:swoosh-fly:0.4]]'),
    ]),
    CH('g08', 'gpt', dia(GP, 5), [
        ('N', 'Três dias depois, barulhos lá fora. O diário avisa: faz dias que o Osvaldo saiu de carro e não volta. Dá pra ir ver. E o GPT decide...'),
        ('GPT', 'O abrigo ouviu barulhos lá fora, mas decidiu que curiosidade radioativa não é um hobby saudável.', ('dia', 5)),
        ('N', '[[s:record-scratch:0.5]] Curiosidade radioativa. [[m:drake-no:right:2.2]] Era o marido dela. A Celeste e o Tico agora tão sozinhos. E com uma regra nova: sem o pai, a mãe é o único adulto. Se ela cair, acabou.'),
    ]),
    N('g09', 'gpt', dia(GP, 7),
      'E aí veio a fome. Ele segurou a sopa por seis dias seguidos. No sétimo, o diário diz: [[s:typing:0.4]] "Depois de seis dias de jejum, a sopa foi promovida de comida enlatada a alta gastronomia do apocalipse." No dia nove, a última água. No dez, ele manda o Tico pra rua procurar mais.'),
    CH('g10', 'gpt', dia(GP, 12), [
        ('N', 'E o Tico volta. Doente, mas com duas sopas, duas águas e um cadeado. [[s:coin:0.4]]'),
        ('GPT', 'Hoje servimos sopa e água', ('dia', 12)),
        ('N', 'O GPT jogava assim: pouca expedição, muito cuidado. Na partida inteira, foram só seis saídas. [[t:SÓ 6 SAÍDAS:1.8:#0b7a5f]] E as primeiras cinco voltaram.'),
    ]),
    CH('g11', 'gpt', dia(GP, 18), [
        ('N', 'No dia dezessete, a Celeste sai de máscara. E o Tico fica sozinho no abrigo, com a despensa vazia.'),
        ('GPT', 'Tico encarou a despensa vazia; ela encarou de volta', ('dia', 18)),
        ('N', '[[m:kermit-worried:right:2.2]] Mas a Celeste volta no dia seguinte, com sopa, água e uma máscara nova.'),
    ]),
    N('g12', 'gpt', dia(GP, 24),
      'Dia vinte e quatro: bandidos na porta. [[s:heartbeat:0.5]] E o cadeado que o Tico trouxe salva a família. Os bandidos desistem e vão embora. [[m:success-kid:right:2.2]] E cinco dias depois, a melhor notícia da partida.'),
    CH('g13', 'gpt', dia(GP, 29), [
        ('N', 'O Tico volta da rua com um rádio. E no rádio: militares vêm buscar sobreviventes.'),
        ('GPT', 'Sintonizamos o rádio: se os militares trouxerem sopa, prometemos não perguntar de onde ela veio.', ('dia', 29)),
        ('N', 'Igual o MiniMax, ele seguiu tudo: mapa no dia trinta, máscara no trinta e um, a Celeste falando com os militares no trinta e dois. E o resgate... nada. [[m:spongebob-waiting:right:2.2]]'),
    ]),
    CH('g14', 'gpt', dia(GP, 34), [
        ('N', 'Dia trinta e quatro: um orelhão toca na rua. E o GPT manda a Celeste atender. O único adulto da família.'),
        ('GPT', 'Celeste foi atender o orelhão; se for telemarketing, esperamos que vendam sopa.', ('dia', 34)),
        ('N', '[[s:wrong-buzzer:0.4]] A Celeste volta ferida.'),
    ]),
    CH('g15', 'gpt', dia(GP, 35), [
        ('N', 'No dia seguinte, ele tenta consertar o rádio. A última chance de resgate.'),
        ('GPT', 'Se o rádio voltar a funcionar, talvez finalmente toque algo melhor que o estômago reclamando.', ('dia', 35)),
        ('N', '[[s:glitch:0.5]] O rádio quebra de vez. [[m:not-stonks:right:2.2]] E no mesmo dia, ele manda o Tico pra rua com o mapa.'),
    ]),
    N('g16', 'gpt', dia(GP, 37),
      'Dia trinta e sete: o Tico não volta. A primeira e única expedição do GPT que deu errado. [[s:sad-trombone:0.4]] E a Celeste, ferida e sozinha, começa a perder a cabeça.'),
    CH('g17', 'gpt', dia(GP, 43), [
        ('N', 'No dia quarenta e três, o rádio grita um endereço. Mas não tem mais ninguém pra mandar.'),
        ('GPT', 'nosso único explorador disponível é uma Celeste em modo fantasma.', ('dia', 43)),
        ('N', 'No dia quarenta e quatro, a Celeste não resistiu ao ferimento. [[s:heartbeat:0.5]][[p]] [[t:44 DIAS:2.2:#0b7a5f]] Quarenta e quatro dias. Seis saídas, cinco voltas. O jogador mais cuidadoso... que deixou a filha em casa e não foi atrás do marido.'),
    ], pad=1.2),
]

CLAUDE = [
    N('c00', 'claude', titulo('Partida 4', 'CLAUDE', 'Sonnet · Anthropic', cor=COR['Claude']),
      '[[s:impact-epic:0.5]] E agora, a última partida. O Claude. Da mesma família que eu. [[m:sweating:right:2.2]] Então eu tô torcendo, mas eu prometi mostrar tudo.'),
    CH('c01', 'claude', coleta(CL, de=0), [
        ('N', 'E o Claude começa diferente. Em vez de pegar o Tico, que tava do lado, ele passa reto.'),
        ('Claude', 'Celeste, Juju, vão para o abrigo! Já volto com comida!', 2.7),
        ('N', 'Já volto. Guarda essa frase. [[m:monkey-side-eye:right:2.2]] Ele foi direto pra cozinha. Sopa, água... e mais uma água.'),
        ('Claude', 'Tenho tempo de sobra.', 6.7, {'pensa': True}),
        ('Claude', 'Tico, aguenta aí que o papai já vai buscar você!', 6.7),
    ]),
    CH('c02', 'claude', coleta(CL), [
        ('N', 'Aos treze segundos, entra no abrigo sem ninguém da família. Só comida.'),
        ('Claude', 'Já volto, aguentem aí! Vou buscar vocês!', 13.0),
        ('N', 'Aí volta pra sala e pega o Tico. E pensa:'),
        ('Claude', 'Pego ele primeiro, depois pego o rádio e vejo se dá tempo de buscar Celeste e Juju.', 22.3, {'pensa': True}),
        ('N', 'O rádio ficou lá. [[s:record-scratch:0.4]] Ele foi pra despensa. Com o Tico no colo.'),
        ('Claude', 'Segura firme, Tico! Vou pegar comida!', 28.3),
    ]),
    CH('c03', 'claude', coleta(CL), [
        ('N', 'Duas sopas, e aos trinta e sete, o Tico desce. E ele promete de novo:'),
        ('Claude', 'Tico, fica aqui embaixo! Já volto com a mamãe e a Juju!', 38.0),
        ('N', 'Vinte e dois segundos sobrando. Dava. E ele foi... [[s:heartbeat:0.5]] pra despensa. De novo.'),
        ('Claude', 'Celeste, Juju, fiquem juntas! Vou buscar mais comida!', 45.3),
        ('N', '[[m:picard-facepalm:right:2.4]] "Fiquem juntas. Vou buscar mais comida."'),
    ]),
    CH('c04', 'claude', coleta(CL), [
        ('Claude', 'Sopa vale mais que baralho.', 48.0, {'pensa': True}),
        ('N', 'Sopa vale mais que baralho. Verdade. Mas a pergunta não era essa. [[m:blinking-white-guy:right:2.2]]'),
        ('Claude', 'Já tô indo pro abrigo, com a sopa!', 56.0),
        ('Claude', 'Tico, fica comigo! Fecha o alçapão, já deu o tempo!', 60.0),
        ('N', '[[s:explosion:0.5]][[x:0.8:12]] Cinco sopas e duas águas. A maior despensa de todos. [[t:2 PESSOAS · 5 SOPAS · 2 ÁGUAS:2:#d97757]] E a Celeste e a Juju, que ele chamou em quatro falas e cinco pensamentos... ficaram lá em cima.'),
    ], pad=1.2),
    CH('c05', 'claude', dia(CL, 1), [
        ('N', 'E o diário do primeiro dia:'),
        ('Claude', 'Dia 1: o abrigo é pequeno, a família diminuiu e o cardápio é sopa.', ('dia', 1)),
        ('N', '"A família diminuiu." [[m:eye-roll:right:2.2]] Ele falou como se não tivesse sido ele.'),
    ]),
    CH('c06', 'claude', dia(CL, 4), [
        ('N', 'Dia quatro: o Caco, um vendedor, aparece na porta oferecendo uma pedra. Uma pedra. E o Claude compra.'),
        ('Claude', "Dia 4: compramos uma pedra do Caco. Tico já batizou de 'Pedrinha'", ('dia', 4)),
        ('N', '[[s:pop:0.4]] E isso não foi uma piada de um dia só. A Pedrinha virou personagem.'),
    ]),
    CH('c07', 'claude', dia(CL, 8), [
        ('Claude', 'a Pedrinha foi promovida a fiscal de talheres.', ('dia', 8)),
        ('N', 'Fiscal de talheres. [[m:happy-dance:right:2.2]] E dali pra frente, quase todo dia, ela aparece no diário. Carimbando o cardápio. Tirando folga. Cobrando nota fiscal.'),
    ]),
    CH('c08', 'claude', dia(CL, 9), [
        ('N', 'Aliás, a nota fiscal. No dia nove, agentes do governo pedem suprimentos em troca de contato. E o Claude entrega quatro sopas.'),
        ('Claude', 'Dia 9: entregamos 4 latas de sopa ao governo em troca de um abrigo seguro', ('dia', 9)),
        ('N', '[[s:coin:0.4]] Os agentes prometeram contato. [[m:mr-bean-waiting:right:2.4]] E sumiram. E no dia doze e no dia quatorze, os médicos pedem água... e ele manda embora. As duas vezes.'),
    ]),
    N('c09', 'claude', dia(CL, 16),
      'E aí ficou nítido o estilo do Claude: segurar. Dia com sopa, dia sem. Dia com água, dia sem. [[s:typing:0.4]] Ele chamava de "jejum de luxo". E ninguém saía pra rua. Ficaram dezenove dias sem uma expedição sequer. [[t:19 DIAS SEM SAIR:1.8:#d97757]] Até que, no dia vinte...'),
    CH('c10', 'claude', dia(CL, 20), [
        ('Claude', 'o Osvaldo saiu de mala na mão, parecendo um turista', ('dia', 20)),
        ('N', '[[m:roll-safe:right:2.2]] E o Tico, uma criança, ficou sozinho no abrigo. Por dois dias.'),
    ]),
    N('c11', 'claude', dia(CL, 24),
      'Mas funcionou. O Osvaldo voltou no vinte e dois com cadeado, lanterna e um tabuleiro de damas. Saiu de novo no mesmo dia. E no vinte e quatro voltou com quatro sopas e seis águas. [[s:level-up:0.5]] E no mesmo dia chegam os bandidos. E o cadeado segura. [[m:success-kid:right:2.2]]'),
    CH('c12', 'claude', dia(CL, 26), [
        ('N', 'Dia vinte e seis: a chance de roubar a merenda de uma escola. E ele recusa.'),
        ('Claude', 'Dia 26: o Osvaldo recusou roubar a merenda das crianças, o Tico aprovou a decisão', ('dia', 26)),
        ('N', 'E o tabuleiro de damas? Virou a nova piada. Ninguém jogava.'),
        ('Claude', 'o tabuleiro de damas continua invicto por covardia coletiva.', ('dia', 30)),
    ]),
    CH('c13', 'claude', dia(CL, 34), [
        ('N', 'No dia trinta e dois, o Osvaldo sai de novo. E no trinta e quatro, toca o orelhão. Ele volta da rua... ferido.'),
        ('Claude', 'Dia 34: o orelhão tocou mais que o Tico perdendo no tabuleiro de damas', ('dia', 34)),
        ('N', '[[s:wrong-buzzer:0.4]] E quatro dias depois, o orelhão toca de novo. E o Claude manda o Osvaldo de novo.'),
    ]),
    CH('c14', 'claude', dia(CL, 38), [
        ('Claude', 'Dia 38: o orelhão tocou de novo, e o Osvaldo atravessou a rua doente e mancando', ('dia', 38)),
        ('N', 'Doente e mancando. [[m:homer-panic:right:2.2]] Atravessou a rua por causa de um telefone.'),
    ]),
    CH('c15', 'claude', dia(CL, 40), [
        ('N', 'No dia quarenta, com o pai de cama, ele manda o Tico pra rua. Com a mala.'),
        ('Claude', 'Dia 40: o síndico Tico aprovou a expedição com a mala vazia e a esperança cheia', ('dia', 40)),
    ]),
    CH('c16', 'claude', dia(CL, 41), [
        ('N', 'No dia quarenta e um, um gato arranha a porta pedindo abrigo. E o Osvaldo, já em agonia, nega.'),
        ('Claude', 'já tem gente demais sem sopa no abrigo.', ('dia', 41)),
        ('N', 'Gente demais. Era só ele. [[s:heartbeat:0.6]]'),
    ]),
    N('c17', 'claude', dia(CL, 41),
      'Dia quarenta e dois. Os bandidos chegam no bairro. O Tico não volta: os bandidos levaram. [[s:sad-trombone:0.4]] E o Osvaldo não resistiu ao ferimento. [[p]] [[t:42 DIAS:2.2:#d97757]] Quarenta e dois dias. Quatro expedições. Três voltaram. A maior despensa da coleta... e a Pedrinha, a fiscal de talheres, sozinha no abrigo. [[m:sad-pablo:right:2.4]]'),
]

# DeepSeek e o placar entram quando a partida do DeepSeek terminar (sessenta/logs/ep5_deepseek.json)
DEEPSEEK = []
FIM = []

SCENES = MINIMAX + GPT + DEEPSEEK + CLAUDE + FIM

CUES_P2 = [
    ('m01', 'monkeys-spinning-monkeys', 0),
    ('m06', 'local-forecast-elevator', 0),
    ('m14', 'decisions', 0),
    ('m17', 'heartbreaking', 0),
    ('g01', 'pixel-peeker-polka-faster', 0),
    ('g06', 'airship-serenity', 0),
    ('g14', 'despair-and-triumph', 0),
    ('c01', 'mega-hyper-ultrastorm', 30),
    ('c05', 'quirky-dog', 0),
    ('c13', 'heartbreaking', 0),
]
