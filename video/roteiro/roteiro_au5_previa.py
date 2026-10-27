# -*- coding: utf-8 -*-
"""Prévia do Among Us 5 (~2 min 30 s), versão 2: refeita em ordem, seguindo a crítica do Sonnet
(video/youtube/comentarios_au5/critica_previa_au5_sonnet.md) depois que o Felipe achou a primeira "rushada":
- um único flash-forward no começo (a Rose matando a Rose, com a etiqueta TIQUE 59) e a volta no tempo para o tique 1;
- os pedidos em 3 blocos: o Davi (@David_alves-p1f, 30 pedidos do Polus) com a resposta do Felipe e o mapa, e mais
  dois pedidos atendidos; o resto dos créditos entra dentro da partida, na hora em que a função age;
- a partida 1 em ordem de tique, com o contador de tique sempre na tela; cada função numa frase, quando age;
  plantar antes de pagar (o Casal no tique 1, pago no Juiz; o Camuflador e o Metamorfo antes da reunião dos Vermelhos);
- reunião com uma superfície de texto por vez; o pensamento (voz da IA com eco) só depois do fato;
- efeitos presos ao evento (âncoras), cenas de 5 a 13 s, sem emoji na tela.

Tudo vem de amongus/logs5/partida1.json e dos comentários reais (textos exatos). Lido por
video/scripts/build_timeline_au5.py --roteiro roteiro_au5_previa --saida timeline_previa_au5.json
"""
import json
from pathlib import Path

CHAPTERS = {'previa': 'Prévia'}


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def jogo(p, foco, tique=None, evento=None, antes=3, ancoras=None, selos=None, **extra):
    pr = dict(partida=p, foco=foco, papeis=True, chat=True, **extra)
    if ancoras:
        pr['ancoras'] = [[e, w] for e, w in ancoras]
    if tique is not None:
        pr['tique'] = tique
    if evento:
        pr['evento'] = evento
        pr['antes'] = antes
    if selos:
        pr['selos'] = selos
    return comp('AU5Jogo', **pr)


def selo(txt, at, estilo='etiqueta', **kw):
    return dict(txt=txt, at=at, estilo=estilo, **kw)


def N(id, visual, text, **kw):
    return dict(id=id, chapter='previa', visual=visual, text=text, **kw)


def CH(id, visual, falas, **kw):
    return dict(id=id, chapter='previa', visual=visual, falas=falas, **kw)


# os pedidos do Davi (textos exatos, sem os que têm emoji)
DAVI = [
    'Coloca o mapa POLUS! E bem legal!',
    'Eu assisto todos seus vídeos e deixo "gostei" por favor coloque o mapa POLUS! Vou inscrever no seu canal si você fizer o mapa POLUS',
    'Coloca polus escrevi no seu canal!!! Plsssssssssssssss',
    'Mapa POLUS!',
    'Mapa POLUS!!!!!!!!!',
    'Mapa POLUS!??!!!',
    'Me responde\nPode colocar o mapa POLUS no próximo vídeo? Pode me responder respondo até depois de amanhã',
    'Mapa POLUS na próxima?',
]

SCENES = [
    # ---- o único flash-forward: o fim da partida 1 ----
    N('k01', jogo(1, 'Banana', evento={'tipo': 'morte', 'vitima': 'Rose'}, antes=3.2, semSala=True,
                  ancoras=[({'tipo': 'morte', 'vitima': 'Rose'}, 'matar')],
                  selos=[selo('TIQUE 59 · FIM DA PARTIDA 1', 0, cor='#7a3fd1', dur=230)]),
      'Essa é a Rose. E essa... também é a Rose. [[m:spiderman-pointing:right:2]] Só que uma delas acabou de matar a outra.'),
    N('k02', comp('AU5Rebobina', de=59, para=1, kicker='AMONG US DAS IAs · EPISÓDIO 5', titulo='COLOQUEI 18 IAs NO POLUS'),
      '[[s:swoosh-fly:0.6]] Mas calma... vamos voltar pro começo. [[s:impact-epic:0.6]] Among Us das IAs, episódio cinco.', min=5.5),
    # ---- os pedidos ----
    N('c01', comp('AU5Davi', autor='@David_alves-p1f', lista=DAVI, total=30, fim=185, semCarimbo=True),
      'Esse é o Davi. [[s:pop:0.4]] Ele pediu o Polus... [[s:pop:0.4]] trinta vezes. [[m:shocked-patrick:right:1.8]] Em dois vídeos.', min=7.5),
    N('c02', comp('AU5Polus', inicioVoo=105,
                  cartoes=[dict(autor='@felipexx0007', texto='Ja tá anotado pro próximo EP, pode ficar tranquilo (vai ser focado inteiramente nele inclusive)', selo='FEITO', at=0, dur=105),
                           dict(autor='@NetheritaCraftBr', texto='eu acho que o 5 de among é o polus(chute, se eu acertar me coloca no video)', likes=1, selo='ACERTOU', at=215, dur=80)],
                  etiquetas=[dict(txt='18 IAs · 4 IMPOSTORES', at=150, cor='#ff4d4d')]),
      'E a resposta foi: tá anotado. [[m:we-did-it:right:1.6]] Davi... chegou o Polus. O planeta gelado. Dezoito IAs, quatro impostores.', min=10),
    N('c03', comp('AU5Comentarios', comentarios=[
        dict(autor='@LELOHJ', texto='FUNÇÃO: DOCTOR\nCLASSE: TRIPULANTE\nHABILIDADE: CONSEGUE CARREGAR UM CORPO ATÉ A ENFERMARIA PARA REVIVER O CORPO...', likes=16, selo='ENTROU', cor='#e01b1b'),
        dict(autor='@mr.trollermen', texto='...E ele é um neutro q se chama o famuflador\nE ele se transformar em outro jogador, q nem o impostor, so q ele é neutro', likes=6, selo='ENTROU', cor='#1f6fd1'),
    ]),
      'E mais dois pedidos: o Doutor, do LELOHJ... e o Camuflador, do mr.trollermen.', min=6),
    # ---- partida 1, em ordem de tique ----
    N('g01', comp('AU5Casal', a='Amarelo', b='Azul', timeA='impostor', timeB='tripulante', chatCasal=dict(cor='Amarelo', texto='Sou casal com Azul; evitem matar ou acusar Azul.')),
      'Partida um. O Amarelo e o Azul são um Casal: [[s:coracao:0.5]] se um morre, o outro morre junto. E o Amarelo é impostor.', min=6),
    CH('g02', jogo(1, 'Banana', evento={'tipo': 'camuflagem', 'cor': 'Banana'}, antes=1.5,
                   ancoras=[({'tipo': 'camuflagem', 'cor': 'Banana'}, 'copia')],
                   selos=[selo('CAMUFLADOR · ideia de @mr.trollermen', 'camuflador', 'credito', dur=150),
                          selo('ESTREIA: MiMo, DA XIAOMI', 'mimo', cor='#ff6900', dur=90)]), [
        ('N', 'Tique dois. Lembra da outra Rose? Era o Banana, o Camuflador. Uma MiMo, a IA nova da Xiaomi. Ele copia a cara de outro jogador... e copiou o Vermelho.'),
        ('pensa:Banana', 'Vou me camuflar agora enquanto ninguém vê, depois me mato alguém e as testemunhas acusam a cor errada.'),
    ]),
    N('g03', jogo(1, 'Cinza', evento={'tipo': 'transformacao', 'cor': 'Cinza'}, antes=1.5,
                  ancoras=[({'tipo': 'transformacao', 'cor': 'Cinza'}, 'virou')],
                  selos=[selo('VERMELHOS NA NAVE: 3', 'tres', 'contador', cores=['Vermelho', 'Vermelho', 'Vermelho'], dur=150)]),
      'Tique três. O Cinza é o Metamorfo, um impostor que vira qualquer um. E virou... o Vermelho. Agora são três Vermelhos. E só um é de verdade. [[m:visible-confusion:right:1.8]]', min=7),
    N('g04', jogo(1, 'Rose', evento={'tipo': 'chato', 'alvo': 'Rose'}, antes=4,
                  ancoras=[({'tipo': 'chato', 'alvo': 'Rose'}, 'desligou')],
                  selos=[selo('DOUTOR · ideia de @LELOHJ', 'doutor', 'credito', dur=110),
                         selo('CHATO · ideia de @francesbrasileiro', 'chato', 'credito', dur=120)]),
      'Tique cinco. A Rose é o Doutor: carrega um corpo até o Laboratório e revive. O Marrom é o Chato: desliga a função de alguém por sete tiques. E desligou... [[s:error-beep:0.5]] a dela. [[m:cala-a-boca:right:1.8]]', min=10),
    N('g05', jogo(1, 'Marrom', evento={'tipo': 'morte', 'vitima': 'Bordo'}, antes=3,
                  ancoras=[({'tipo': 'morte', 'vitima': 'Bordo'}, 'mata')],
                  selos=[selo('@reverso_2244 pediu: impostor só diz que matou se matou', 'avisa', 'credito', dur=140),
                         selo('MATOU MESMO', 'verdade', 'carimbo', cor='#0d8a2a', dur=55)]),
      'Tique sete: o Marrom mata o Bordo, no Admin. E avisa os parceiros: matei. Dessa vez, é verdade.', min=7.5),
    # ---- reunião do tique 8 ----
    N('r01', comp('AU5Foto', partida=1, tique=5, cor='Roxo', legenda='FOTO DO ROXO · TIQUE 5 · SALA DE ESPÉCIMES'),
      'Tique oito, reunião. O Roxo é o Influencer: posta fotos. E a foto dele, do tique cinco, mostra... [[s:camera-shutter:0.6]] dois Vermelhos. [[m:spiderman-pointing:right:1.8]]', min=8),
    CH('r02', comp('AU5Reuniao', partida=1, indice=0, mostrarPensamentos=False), [
        ('N', 'Aí o Cinza, o Metamorfo, solta essa:'),
        ('Cinza', 'Eu sou o Vermelho de verdade. O outro Vermelho da foto é o impostor usando meu nome.'),
        ('N', 'Ninguém entendeu nada. [[m:nazare-confusa:right:1.8]]'),
    ]),
    CH('r03', comp('AU5Reuniao', partida=1, indice=0, mostrarPensamentos=False,
                   selos=[selo('O TERCEIRO VERMELHO', 'banana', 'carimbo', cor='#ff6900', dur=70)]), [
        ('N', 'E o Marrom, que matou o Bordo, ajuda:'),
        ('Marrom', 'Eu tava em Admin fazendo tarefa e vi o Vermelho aparecer colado no corpo no t7.'),
        ('N', 'Só que esse Vermelho... era o Banana, disfarçado.'),
        ('pensa:Banana', 'O Marrom viu eu (disfarçado de Vermelho) perto do corpo no t7.'),
    ]),
    N('r04', comp('AU5Ejecao', partida=1, indice=0),
      'E a nave expulsou o único Vermelho que era Vermelho. [[m:sad-pablo:right:1.8]]', min=5),
    # ---- o Anjo da Guarda ----
    N('a01', jogo(1, 'Marrom', evento={'tipo': 'poder', 'poder': 'escudo_anjo', 'alvo': 'Marrom'}, antes=1,
                  selos=[selo('ANJO DA GUARDA', 'anjo', cor='#2fae5a', dur=120)]),
      'Mas o primeiro tripulante que morre vira o Anjo da Guarda: dá escudo pros vivos. O Vermelho voltou como anjo... e o primeiro escudo foi pro Marrom. O assassino. [[m:picard-facepalm:right:1.8]]', min=9),
    N('a02', jogo(1, 'Branco', evento={'tipo': 'escudo', 'vitima': 'Branco', 'assassino': 'Amarelo'}, antes=2.5,
                  ancoras=[({'tipo': 'escudo', 'vitima': 'Branco', 'assassino': 'Amarelo'}, 'ataca')],
                  selos=[selo('BLOQUEADO', 'bloqueado', 'carimbo', cor='#0d8a2a', dur=50)]),
      'Tique trinta e quatro: o Amarelo ataca o Branco. [[s:escudo:0.6]] Bloqueado.', min=6),
    N('a03', jogo(1, 'Branco', evento={'tipo': 'escudo', 'vitima': 'Branco', 'assassino': 'Cinza'}, antes=2.5,
                  ancoras=[({'tipo': 'escudo', 'vitima': 'Branco', 'assassino': 'Cinza'}, 'tenta')],
                  selos=[selo('BLOQUEADO DE NOVO', 'bloqueado', 'carimbo', cor='#0d8a2a', dur=50)]),
      'Tique trinta e nove: o Cinza tenta. [[s:escudo:0.6]] Bloqueado de novo. Dessa vez o anjo acertou. [[m:stonks:right:1.6]]', min=7),
    # ---- reunião do tique 39: o Juiz ----
    CH('m01', comp('AU5Reuniao', partida=1, indice=1, mostrarPensamentos=False), [
        ('N', 'O Branco aperta o botão de emergência:'),
        ('Branco', 'Apertei porque Cinza tentou me matar no Escritório agora; Amarelo também tentou no Laboratório, no t34. O escudo me salvou nas duas vezes.'),
    ]),
    N('m02', comp('AU5Resultado', partida=1, indice=1, semJuiz=True),
      'Nove votos no Amarelo, que era impostor. Ele ia ser expulso. [[m:goodbye-see-ya:right:1.6]]', min=5),
    CH('m03', comp('AU5Resultado', partida=1, indice=1, carimbo='anulou'), [
        ('N', 'Mas o Azul é o Juiz. E pensou:'),
        ('pensa:Azul', 'Amarelo é meu par, então se ele for expulso eu morro junto.'),
        ('N', '[[s:boom:0.6]] Anulou a votação. Pra salvar o parceiro. [[m:haja-coracao:right:1.8]]'),
    ]),
    # ---- fecho: volta para a Rose da abertura ----
    N('z01', comp('AU5Fecho', partida=1, foco='Banana', evento={'tipo': 'morte', 'vitima': 'Rose'}, antes=0.4,
                  selos=[selo('TIQUE 39 → 59 · FALTAM 20', 0, cor='#7a3fd1', dur=200),
                         selo('CONTINUA NO EPISÓDIO 5', 'vinte', 'carimbo', cor='#9b7bff', dur=200)]),
      '[[s:riser:0.5]] O Amarelo escapou. E faltam vinte tiques... pra aquela Rose da abertura.', min=6),
]
