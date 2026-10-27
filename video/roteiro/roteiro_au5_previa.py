# -*- coding: utf-8 -*-
"""Prévia do Among Us 5 (~2 min) para o Felipe avaliar: a abertura nova (seguindo a crítica do AU4 feita pelo Sonnet,
video/youtube/comentarios_au5/critica_au4_sonnet.md) e trechos da partida 1 no Polus.

Regras da crítica aplicadas aqui:
- frio de ~12 s com a melhor cena (o Camuflador disfarçado de Rose matando a Rose), título aos ~15 s;
- só 3 comentários, em ~12 s, cada um com um carimbo grande (o resto vira crédito dentro da partida);
- o mapa novo aparece de verdade (voo de câmera pelo Polus) junto com as IAs novas, em ~12 s;
- a partida começa antes de 1:00; cada função é explicada numa frase, na hora em que ela age;
- reunião curta (2 falas do log + narração), ejeção de 5 s com o texto inteiro;
- sem emoji na tela; pensamentos das IAs nos balões (as falas e os pensamentos são os do log, nunca inventados).

Tudo vem de amongus/logs5/partida1.json. Lido por video/scripts/build_timeline_au5.py --roteiro roteiro_au5_previa
--saida timeline_previa_au5.json
"""

CHAPTERS = {'previa': 'Prévia'}


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def titulo(kicker, title, sub='', cor='#ff4d4d'):
    return comp('AUTitulo', kicker=kicker, title=title, subtitle=sub, color=cor)


def jogo(p, foco, tique=None, evento=None, antes=3, ancoras=None, chat=True):
    pr = dict(partida=p, foco=foco, papeis=True, chat=chat)
    if ancoras:
        pr['ancoras'] = [[e, w] for e, w in ancoras]
    if tique is not None:
        pr['tique'] = tique
    if evento:
        pr['evento'] = evento
        pr['antes'] = antes
    return comp('AU5Jogo', **pr)


def N(id, visual, text, **kw):
    return dict(id=id, chapter='previa', visual=visual, text=text, **kw)


def CH(id, visual, falas, **kw):
    return dict(id=id, chapter='previa', visual=visual, falas=falas, **kw)


COMENTARIOS = [
    dict(autor='@pensamentosdeumautista467', texto='Mapa Polus, por favor', likes=3, selo='FEITO', cor='#6a5590'),
    dict(autor='@LELOHJ', texto='FUNÇÃO: DOCTOR. Consegue carregar um corpo até a enfermaria para reviver o corpo...', likes=16, selo='ENTROU', cor='#e01b1b'),
    dict(autor='@reverso_2244', texto='por favor lembre aos impostores de verificar se matou antes de falar que matou', likes=8, selo='CONSERTADO', cor='#1f6fd1'),
]

SCENES = [
    # frio: a melhor cena da partida 1, sem explicação ainda
    N('a01', jogo(1, 'Banana', evento={'tipo': 'morte', 'vitima': 'Rose'}, antes=3.5),
      'Essa é a Rose. E essa... também é a Rose. [[m:spiderman-pointing:right:2.2]] Só que uma delas é uma função nova, o Camuflador, disfarçado. [[s:faca:0.6]] A Rose acabou de matar a Rose.'),
    N('a02', titulo('EPISÓDIO 5 · MAPA POLUS', 'COLOQUEI 18 IAs NO POLUS', 'Camuflador, Doutor, Víbora, Traidor, Chato, Paciente e Armadilheiro', '#9b7bff'),
      '[[s:impact-epic:0.6]] Among Us das IAs, episódio cinco.'),
    # só 3 comentários, com carimbo
    N('a03', comp('AU5Comentarios', comentarios=COMENTARIOS),
      'Vocês pediram o Polus. [[s:pop:0.5]] Pediram o Doutor, que carrega o corpo e revive. [[s:pop:0.5]] E pediram que impostor parasse de dizer que matou quem não matou. [[m:we-did-it:right:1.8]] Entrou tudo.'),
    # o mapa novo e as IAs novas
    N('a04', comp('AU5Polus', etiquetas=[
        dict(txt='18 IAs · 4 IMPOSTORES', at=45, cor='#ff4d4d'),
        dict(txt='GPT-6.1 TERRA', at=150, cor='#10a37f', cores=['Amarelo', 'Branco', 'Coral']),
        dict(txt='ESTREIA: MiMo, DA XIAOMI', at=255, cor='#ff6900', cores=['Banana', 'Caqui', 'Rose']),
    ]),
      'O mapa agora é o Polus, o planeta gelado. Dezoito IAs, quatro impostores. O GPT voltou na versão Terra... e estreia a MiMo, da Xiaomi. [[m:mind-blown:right:1.8]]'),
    # partida 1
    N('b01', jogo(1, 'Rose', evento={'tipo': 'chato', 'alvo': 'Rose'}, antes=2.5),
      'Partida um. A Rose é o Doutor: carrega um corpo até o Laboratório e revive. Só que o Marrom é o Chato... [[s:error-beep:0.5]] e desligou a função dela no tique cinco. [[m:cala-a-boca:right:2]]'),
    N('b02', jogo(1, 'Marrom', evento={'tipo': 'morte', 'vitima': 'Bordo'}, antes=3),
      'E o próprio Marrom, um DeepSeek, mata o Bordo no Admin. [[m:sus-doakes:right:2]]'),
    CH('b03', comp('AU5Reuniao', partida=1, indice=0), [
        ('N', 'Na reunião, a foto do Influencer mostrava... dois Vermelhos. [[m:spiderman-pointing:right:2]] Aí o Cinza solta essa:'),
        ('Cinza', 'Eu sou o Vermelho de verdade. O outro Vermelho da foto é o impostor usando meu nome.'),
        ('N', 'O Cinza é o Metamorfo. Ele também tinha virado Vermelho. [[m:visible-confusion:right:2]] E o Marrom ainda ajuda:'),
        ('Marrom', 'Eu tava em Admin fazendo tarefa e vi o Vermelho aparecer colado no corpo no t7. Ele tava por perto, não fui eu.'),
    ]),
    N('b04', comp('AU5Ejecao', partida=1, indice=0),
      'E a nave expulsou... o único Vermelho que era Vermelho mesmo. [[m:sad-pablo:right:2]]'),
    N('b05', jogo(1, 'Rosa', evento={'tipo': 'escudo', 'vitima': 'Rosa'}, antes=2.5),
      'Mas o primeiro tripulante que morre vira o Anjo da Guarda. O Vermelho voltou como anjo... [[s:escudo:0.6]] e salvou a Rosa do Amarelo. [[m:dicaprio-toast:right:2]]'),
    N('b06', jogo(1, 'Branco', evento={'tipo': 'escudo', 'vitima': 'Branco', 'assassino': 'Cinza'}, antes=2),
      'Depois salvou o Branco. [[s:escudo:0.6]] Duas vezes. [[m:stonks:right:1.8]]'),
    CH('b07', comp('AU5Reuniao', partida=1, indice=1), [
        ('N', 'O Branco apertou o botão e entregou o Amarelo. A nave ia expulsar o Amarelo... que era impostor. Só que o Azul é o Juiz.'),
        ('Azul', 'Não vou votar às cegas. Cinza tem dois testemunhos de duto; Amarelo tem acusações de ataque. Quero ouvir os dois antes de decidir.'),
    ]),
    N('b08', comp('AU5Resultado', partida=1, indice=1),
      'E anulou a votação. [[s:boom:0.6]] O motivo? O Amarelo era o par dele no Casal. Se o Amarelo saísse, ele morria junto. [[m:haja-coracao:right:2]]'),
    N('b09', titulo('CONTINUA NO EPISÓDIO 5', 'QUATRO PARTIDAS NO POLUS', 'e ainda tem Víbora, Traidor e Paciente pra estrear', '#9b7bff'),
      '[[s:riser:0.5]] E isso foi só a primeira partida.'),
]
