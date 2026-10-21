# -*- coding: utf-8 -*-
"""Prévia do Among Us 4 (~2 min), no estilo da abertura do AU3: gancho com meme, os comentários com os carimbos
(ENTROU / FICOU DE FORA), o @FAMILIAGMS, o elenco, as roupas, o mapa novo e trechos da partida 1 narrados.

Tudo vem de amongus/logs4/partida1.json (as falas da reunião são as do log). Mesmo formato do roteiro_au3.py,
lido por video/scripts/build_timeline_au4.py --roteiro roteiro_au4_previa --saida timeline_previa_au4.json
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
    return comp('AU4Jogo', **pr)


def N(id, visual, text, **kw):
    return dict(id=id, chapter='previa', visual=visual, text=text, **kw)


def CH(id, visual, falas, **kw):
    return dict(id=id, chapter='previa', visual=visual, falas=falas, **kw)


SCENES = [
    # gancho
    N('a01', jogo(1, 'Rosa', evento={'tipo': 'bomba_plantada', 'vitima': 'Rosa'}, antes=1,
                  ancoras=[({'tipo': 'bomba', 'portador': 'Rosa'}, 'bum')]),
      'Quinze IAs jogando Among Us de novo. Olha a Rosa aqui, tranquila... [[m:this-is-fine:right:2.2]] Só que o Vermelho, um MiniMax, esbarrou nela e grudou uma bomba. Três tiques depois... [[s:explosion:0.6]] bum. [[m:nuclear-mushroom-cloud:right:2]]'),
    # comentários
    N('a02', comp('AU4Comentarios', lista='entrou', passo=34),
      'Mas antes, os comentários. O último vídeo teve mais de trezentos. [[m:shocked-patrick:right:2]] Pediram porta que não tranca durante sabotagem, Xerife que mata neutro, fantasma... e chapéu. Tudo isso entrou.'),
    N('a03', comp('AU4Comentarios', lista='funcoes', passo=34),
      'E funções. Muitas funções. Apostador, Bombardeiro, Mecânico, Glutão, Canibal, Casal, Perito... [[m:visible-confusion:right:2.2]] Calma, quando cada uma aparecer, eu explico.'),
    N('a04', comp('AU4Comentarios', lista='fora', passo=26),
      'Algumas ficaram de fora. E David, eu vi. [[m:side-eye-dog:right:2]] Dezenove comentários pedindo o mapa Polus. Dezenove. [[s:record-scratch:0.4]] Esse fica pra um episódio só dele.'),
    N('a05', comp('AU4Comentarios', lista='familia', passo=40),
      'E o FAMILIAGMS reclamou que eu prometi e ele não apareceu. [[m:hide-the-pain-harold:right:2]] Pronto, apareceu. O modo cavalo... quem sabe.'),
    # o que mudou
    N('a06', comp('AU4Elenco', partida=1, quemSaiu='Gemini', novos=['Qwen 3.8 27B', 'MiniMax M3.1 Flash'], gatilhoSaiu='gemini', gatilhoNovas='qwen'),
      'O elenco mudou. O Gemini saiu: era o mais caro. [[m:michael-scott-no:right:2]] Entrou o Qwen, da Alibaba, e o MiniMax voltou na versão nova. Seis empresas, quinze IAs.'),
    N('a07', comp('AU4Roupas'),
      'E cada IA escolheu a própria roupa... e até bichinho de estimação. [[m:happy-dance:right:2]]'),
    N('a08', comp('AU4Nave', v5=True),
      'E o mapa foi refeito, bem mais parecido com o Skeld de verdade. [[m:mind-blown:right:2]]'),
    N('a09', titulo('PRÉVIA · EPISÓDIO 4', 'COLOQUEI 15 IAs PRA JOGAR AMONG US 4', 'Bombardeiro, Glutão, Piromante, Chantagista, Casal e fantasmas'),
      '[[s:impact-epic:0.6]] Episódio quatro. Olha um pouco do que vem aí.'),
    # trechos da partida 1
    N('b01', jogo(1, 'Lima', tique=1),
      'O Lima é o Piromante: vai encharcando todo mundo de gasolina... [[m:elmo-fire:right:2]] e ninguém percebe.'),
    N('b02', jogo(1, 'Laranja', evento={'tipo': 'recrutamento', 'alvo': 'Azul'}, antes=3),
      'O Laranja, um Qwen, é Gangster. E acabou de recrutar o Azul pro lado dos impostores. [[m:luva-receba:right:2]]'),
    N('b03', jogo(1, 'Bordo', evento={'tipo': 'morte', 'vitima': 'Roxo'}, antes=3),
      'O Bordo é o Glutão. Ele não mata... ele devora. [[m:im-hungry-cat:right:2]] Não sobra nem o corpo.'),
    N('b04', jogo(1, 'Preto', evento={'tipo': 'xerife', 'alvo': 'Lima'}, antes=3),
      'E o Xerife agora atira em neutro também. [[s:tiro:0.5]] Tchau, Piromante. [[m:goodbye-see-ya:right:2]]'),
    CH('b05', comp('AU4Reuniao', partida=1, indice=0), [
        ('N', 'Na reunião, o Amarelo foi chantageado: não pode falar nada. [[m:cala-a-boca:right:2]]'),
        ('Amarelo', '...'),
        ('Marrom', 'Cinza tá inventando: eu tô em Admin desde o t8 fingindo tarefa. Nunca usei duto.'),
    ]),
    N('b06', comp('AU4Ejecao', partida=1, indice=0),
      'O Marrom era impostor. E o Verde era o par dele no Casal... [[m:crying-jordan:right:2]] morreu junto.'),
    N('b07', jogo(1, 'Rosa', tique=15),
      'Quem morre vira fantasma: atravessa parede e manda recado do além. [[m:wait-who-are-you:right:2]]'),
    N('b08', jogo(1, 'Ciano', evento={'tipo': 'bomba', 'portador': 'Cinza'}, antes=4,
                  ancoras=[({'tipo': 'bomba', 'portador': 'Cinza'}, 'bum')]),
      'E o Bombardeiro não parou. [[m:roll-safe:right:2]] Mais uma... [[s:explosion:0.6]] bum.'),
    N('b09', titulo('AMONG US 4', 'EM BREVE', 'quem ganha essa?', cor='#7c3aed'),
      'Quem ganha essa? [[s:drumroll:0.5]] Só no episódio. [[m:mr-bean-waiting:center:2]]'),
]
