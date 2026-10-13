# -*- coding: utf-8 -*-
"""Roteiro do vídeo 3: "Jogos Vorazes das IAs" (12 IAs numa ilha; só uma sai viva). Versão 2, feita do zero.

Tudo o que aparece aqui aconteceu nas partidas registradas em ilha/logs/partida.json (oficial) e
ilha/logs/partida_v2_abortada.json (o teste). Falas e pensamentos são copiados do log (às vezes encurtados com "...").

Formato:
  N(id, capítulo, visual, texto)                cena narrada pelo Gabriel
  CH(id, capítulo, visual, [(quem, texto), ...]) quem = 'N' (narrador) ou id do tributo (fala com a voz dele)

Visuais:
  clipe(src, inicio)       tomada pronta do Blender (navio, praia...); inicio='continua' segue de onde a cena anterior parou
  g3d(t3d(...), ...)       gameplay 3D: uma ou mais tomadas renderizadas pelo diretor (ilha/blender/cena/gameplay.py)
  titulo(...)              cartela

Marcações no texto do narrador (disparam quando a PRÓXIMA palavra é falada):
  [[c]] corta para a próxima tomada 3D   [[m:meme:pos:dur:legenda]]   [[s:efeito:vol]]   [[p]] soco de câmera
  [[t:TEXTO:dur:cor]] texto na tela      [[cc]] legenda forçada
"""

CHAPTERS = {
    'abertura': 'Abertura',
    'tributos': 'Os tributos',
    'regras': 'Como funciona',
    'p1': 'Partida 1 · O teste',
    'p2': 'Partida 2 · Pra valer',
    'placar': 'Placar',
    'fim': 'Encerramento',
}

# trilha: (cena onde começa, música, início na faixa em s, ganho, corte seco?)
CUES = [
    ('a01', 'decisions', 0, 1.0),
    ('a04', 'call-to-adventure', 0, 0.9, True),
    ('a06', 'monkeys-spinning-monkeys', 0, 0.9, True),
    ('a07', 'call-to-adventure', 34, 0.9, True),
]


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def clipe(src, inicio=0):
    return comp('ILClipe', src=src, inicio=inicio)


def t3d(turno, zona, cam='orbita', partida='oficial', **kw):
    """Uma tomada 3D. kw: alvo, para, angulo, lente, acoes, mostrar, largada, golpe, morte, periodo."""
    return dict(turno=turno, zona=zona, cam=cam, partida=partida, **kw)


def g3d(*tomadas, hud=None, titulo=None):
    """hud: mostra dia/período/vivos; titulo: dict(kicker, title, subtitle, color) por cima do 3D."""
    return comp('IL3D', tomadas=list(tomadas), hud=hud, titulo=titulo)


def titulo(kicker, title, sub='', cor='#ff4d4d', fundo=None):
    return comp('ILTitulo', kicker=kicker, title=title, subtitle=sub, color=cor, fundo=fundo)


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)


SCENES = [
    # ------------------------------------------------------------------ ABERTURA (sem spoiler!)
    N('a01', 'abertura', clipe('ilha/clips/abertura.mp4', 0),
      'Doze inteligências artificiais. Um navio no meio do oceano. [[s:boom:0.45]] E uma tempestade que ninguém previu.',
      lead=0.6),
    N('a02', 'abertura', clipe('ilha/clips/abertura.mp4', 'continua'),
      'O navio não aguentou. [[s:explosion:0.35]] ... E quando o sol nasceu...', pad=0.2),
    N('a03', 'abertura', clipe('ilha/clips/praia.mp4', 0),
      'as doze acordaram aqui. Numa ilha. Sem comida, sem água, e sem a menor ideia de onde estão.'),
    N('a04', 'abertura', g3d(t3d(1, 'cornucopia', 'travel', largada=True, angulo=250)),
      'E com uma regra só: [[p]] [[s:impact-epic:0.6]] só uma sai viva.', pad=0.9),
    N('a05', 'abertura', g3d(
        t3d(9, 'lago', 'alta', angulo='centro'),
        t3d(20, 'campo', 'duelo', alvo='ds1', golpe=0.55, lente=45),
        t3d(22, 'lago', 'aerea'),
        t3d(26, 'cornucopia', 'close', alvo='ds3', imortais=['ds3'])),
      'Vai ter trégua... [[c]] vai ter machado... [[s:whoosh:0.4]] [[c]] vai ter uma névoa tóxica engolindo a ilha... '
      '[[c]] e vai ter traição. [[s:gasp:0.4]]', pad=0.7),
    N('a06', 'abertura', g3d(t3d(10, 'floresta', 'segue', partida='teste', alvo='qwen1')),
      'E olha que essa foi a segunda tentativa. Na primeira... [[m:sweating:right:2.6]] duas IAs morreram de sede '
      'procurando um riacho que não existia.', pad=0.4),
    N('a07', 'abertura', g3d(t3d(1, 'cornucopia', 'grua', largada='parado', angulo=265),
                             titulo=dict(kicker='12 IAs · 3 distritos · só 1 sobrevive', title='JOGOS VORAZES DAS IAs',
                                         subtitle='', color='#ffcc33')),
      'Bem-vindos aos Jogos Vorazes das IAs. [[s:boom:0.6]]', lead=0.4, pad=2.0),
]
