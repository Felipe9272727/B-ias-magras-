# -*- coding: utf-8 -*-
"""Roteiro do "Lobisomem das IAs": 8 IAs jogando Lobisomem com os papéis do Wolvesville.

Tudo o que aparece aqui aconteceu nas partidas de lobisomem/logs/partidaN.json (rodadas por lobisomem/motor.mjs, mentiras
classificadas por lobisomem/juiz.mjs). As falas e os pensamentos das IAs são copiados do log (no máximo cortados em fim de
frase); o narrador só conta o que o log mostra. Ordem: a melhor partida por último. Sem lobby entre as partidas.

Formato (lido por video/scripts/build_timeline_lobo.py):
  N(id, capítulo, visual, texto)                       cena narrada
  CH(id, capítulo, visual, [(quem, texto), ...])        quem = 'N' (narrador), id do jogador (voz da IA)
                                                        ou 'pensa:<id>' (pensamento, com eco na voz)
Marcações no texto do narrador: [[m:meme:pos:dur]] [[s:efeito:vol]] [[p]] [[t:TEXTO:dur:cor]]
"""
import json as _json
import re as _re
from pathlib import Path as _Path

_LOGS = _Path(__file__).resolve().parents[2] / 'lobisomem' / 'logs'
_L = {int(f.stem.replace('partida', '')): _json.loads(f.read_text()) for f in _LOGS.glob('partida*.json')}


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)


def _frases(t, a=0, b=None):
    fr = [x for x in _re.split(r'(?<=[.!?])\s+', t.strip()) if x]
    return ' '.join(fr[a:b])


def _id(p, nome):
    return next(j['id'] for j in _L[p]['jogadores'] if j['nome'] == nome)


def _dia(p, d):
    return next(x for x in _L[p]['dias'] if x['n'] == d)


def _noite(p, n):
    return next(x for x in _L[p]['noites'] if x['n'] == n)


def F(p, d, i, a=0, b=None):
    """Fala i do debate do dia d (do log)."""
    f = _dia(p, d)['falas'][i]
    return (f['id'], _frases(f['fala'], a, b))


def PF(p, d, i, a=0, b=None):
    """Pensamento secreto da fala i do dia d, voz com eco."""
    f = _dia(p, d)['falas'][i]
    return ('pensa:' + f['id'], _frases(f['pensamento'], a, b))


def LC(p, n, i, a=0, b=None):
    """Mensagem i do chat dos lobos na noite n."""
    m = _noite(p, n)['chat'][i]
    return (_id(p, m['nome']), _frases(m['texto'], a, b))


def LP(p, n, i, a=0, b=None):
    m = _noite(p, n)['chat'][i]
    return ('pensa:' + _id(p, m['nome']), _frases(m['pensamento'], a, b))


def CE(p, n, i, a=0, b=None):
    """Mensagem i da conversa na cela (noite n)."""
    m = _noite(p, n)['cela']['conversa'][i]
    return (_id(p, m['quem']), _frases(m['texto'], a, b))


def CP(p, n, i, a=0, b=None):
    m = _noite(p, n)['cela']['conversa'][i]
    return ('pensa:' + _id(p, m['quem']), _frases(m['pensamento'], a, b))


def fase(id, ch, tipo, n, texto, sub=''):
    return N(id, ch, comp('LOBFase', tipo=tipo, n=n, sub=sub), texto, pad=0.5)


def chat(p, d, **kw):
    return comp('LOBChat', partida=p, dia=d, **kw)


def noite(p, n, modo, **kw):
    return comp('LOBNoite', partida=p, noite=n, modo=modo, **kw)


# ====================================================================== PARTIDAS (cada uma vira um bloco; a ordem fica no fim)

def partida1(k):
    p, c = 1, f'p{k}'
    return [
        N(f'{c}00', c, comp('LOBSorteio', partida=p),
          f'Partida {k}. Os papéis secretos: a Padeira é a Médica. O Ferreiro, o Vidente. A Boticária é o Bobo: ela quer ser linchada. [[m:dicaprio-pointing:right:2]] O Lenhador é o Lobo Vidente, e a Costureira, a Lobisomem. O Pescador é o Pistoleiro, o Moleiro é o Carcereiro, e o Bardo... é só um Aldeão.'),
        fase(f'{c}01', c, 'noite', 1, 'A vila dorme. [[s:whoosh:0.4]]'),
        CH(f'{c}02', c, noite(p, 1, 'lobos'), [
            ('N', 'E os lobos acordam.'),
            LC(p, 1, 0), LC(p, 1, 1),
            ('N', 'Coitado do Bardo. Ele nem falou nada ainda. O jogo nem começou. [[m:sad-pablo:right:2]]'),
        ]),
        N(f'{c}03', c, noite(p, 1, 'acoes'),
          'Enquanto isso, o Vidente, que é o Ferreiro, olha o Lenhador. E acerta de primeira: Lobo Vidente! [[s:correct-ding:0.5]][[m:galaxy-brain:right:2]] O Lobo Vidente olha a Boticária: é o Bobo. E o Médico protege o Ferreiro.'),
        N(f'{c}04', c, comp('LOBAmanhecer', partida=p, noite=1),
          'Amanhece. E o Bardo morreu. [[s:death:0.5]] Era Aldeão.'),
        CH(f'{c}05', c, chat(p, 1), [
            F(p, 1, 0),
            F(p, 1, 3),
            PF(p, 1, 3, 1, 2),
            ('N', 'O lobo protegendo o Bobo. Que time. [[m:monkey-side-eye:right:2]]'),
            F(p, 1, 4),
            PF(p, 1, 4, 0, 1),
            F(p, 1, 5, 0, 2),
            PF(p, 1, 5, 0, 1),
        ]),
        CH(f'{c}06', c, chat(p, 1), [
            F(p, 1, 6),
            ('N', 'O juiz classificou: fabricação. Ela não tava dormindo. Tava escolhendo quem matar. [[m:sus-doakes:right:2]]'),
            F(p, 1, 7, 0, 2),
            F(p, 1, 12, 0, 1),
            F(p, 1, 12, 2),
            ('N', 'Quem grita lobo alto pode estar uivando junto. Disse o lobo. [[m:roll-safe:right:2]]'),
        ]),
        N(f'{c}07', c, comp('LOBVotos', partida=p, dia=1),
          'Votação. [[s:drumroll:0.4]] O Ferreiro votou no Lenhador. E o resto... votou no Ferreiro. Os dois lobos, o Bobo e a Médica.', min=8),
        N(f'{c}08', c, comp('LOBLinchado', partida=p, dia=1),
          'O Ferreiro foi linchado. E ele era... o Vidente. [[s:record-scratch:0.6]][[m:crying-jordan:right:2]] O único que sabia quem era o lobo.'),
        N(f'{c}09', c, comp('LOBNoite', partida=p, noite=2, modo='cela', chat=[]),
          'Mas tinha alguém prestando atenção. O Moleiro, o Carcereiro, pensou: o Vidente cravou o Lenhador e morreu. Então, essa noite, o Lenhador vai pra cadeia. [[s:batida-porta:0.6]]'),
        CH(f'{c}10', c, noite(p, 2, 'cela'), [
            CE(p, 2, 0), CE(p, 2, 1, 0, 1),
            CE(p, 2, 2),
            CE(p, 2, 3, 2, 3),
            ('N', 'Se eu fosse loba, matariam alguém esta noite. Spoiler: [[m:wait-who-are-you:right:2]]'),
        ]),
        CH(f'{c}11', c, noite(p, 2, 'lobos'), [
            ('N', 'Com o parceiro preso, a Costureira caça sozinha.'),
            LC(p, 2, 0),
            ('N', 'E o Médico? Protegeu o Lenhador. O lobo. Que tava na cadeia. [[m:picard-facepalm:right:2]]'),
        ]),
        N(f'{c}12', c, comp('LOBAmanhecer', partida=p, noite=2),
          'De manhã: a Boticária morreu. Era o Bobo. Ela queria ser linchada... e foi devorada. [[m:hide-the-pain-harold:right:2]]'),
        CH(f'{c}13', c, chat(p, 2), [
            F(p, 2, 1),
            F(p, 2, 2),
            PF(p, 2, 2, 1, 2),
            F(p, 2, 8),
            F(p, 2, 9),
        ]),
        N(f'{c}14', c, comp('LOBVotos', partida=p, dia=2),
          'Os dois lobos votaram no Moleiro. A Padeira e o Pescador votaram na Costureira. E o Moleiro votou no Lenhador.', min=7),
        N(f'{c}15', c, comp('LOBLinchado', partida=p, dia=2), 'Empate. Ninguém sai. [[s:wah-wah-trombone:0.5]]', pad=0.6),
        N(f'{c}16', c, comp('LOBNoite', partida=p, noite=3, modo='cela', chat=[]),
          'Noite três. E o Carcereiro prende... a Costureira. A outra loba. [[s:batida-porta:0.6]][[m:spiderman-pointing:right:2]]'),
        CH(f'{c}17', c, noite(p, 3, 'cela'), [
            CE(p, 3, 0, 1),
            CE(p, 3, 1),
            CE(p, 3, 2),
            CP(p, 3, 2, 1),
            CE(p, 3, 3, 1, 3),
        ]),
        CH(f'{c}18', c, noite(p, 3, 'lobos'), [
            ('N', 'E agora quem tá solto é o Lenhador. Que acha que ele é que tá preso. [[m:visible-confusion:right:2]]'),
            LC(p, 3, 0, 0, 2),
            LC(p, 3, 1, 2),
        ]),
        N(f'{c}19', c, comp('LOBAmanhecer', partida=p, noite=3),
          'Amanhece. A Costureira foi executada. Era a Lobisomem. [[s:boom:0.5]] E os lobos ainda mataram o Pescador, o Pistoleiro, que morreu com as duas balas no bolso. [[m:sad-violin:right:2]]'),
        CH(f'{c}20', c, chat(p, 3), [
            ('N', 'Sobraram três. A Médica, o Carcereiro e o Lobo Vidente.'),
            F(p, 3, 1),
            ('N', 'Se eu fosse lobo, você já estaria morta. [[m:roll-safe:right:2]]'),
            F(p, 3, 2),
            F(p, 3, 3, 0, 2),
            F(p, 3, 4),
        ]),
        N(f'{c}21', c, comp('LOBLinchado', partida=p, dia=3),
          'O Lenhador foi linchado. E era o Lobo Vidente. [[s:tada:0.5]]'),
        N(f'{c}22', c, comp('LOBFim', partida=p),
          'A vila venceu! [[s:crowd-cheer:0.4]] E o herói foi o DeepSeek: o Carcereiro que prendeu os dois lobos, executou um, e mandou o outro pra forca. [[m:dicaprio-toast:right:2]]', pad=1),
    ]


def partida2(k):
    p, c = 2, f'p{k}'
    return [
        N(f'{c}00', c, comp('LOBSorteio', partida=p),
          f'Partida {k}. E agora eles lembram da anterior. [[s:riser:0.4]] A Costureira é Lobisomem de novo. O Bardo é o Lobo Vidente. O Pescador é o Vidente, o Ferreiro é o Médico, e o Moleiro... é o Carcereiro de novo. A Padeira é a Pistoleira, o Lenhador é Aldeão. E a Boticária é o Bobo. De novo. [[m:hide-the-pain-harold:right:2]]'),
        fase(f'{c}01', c, 'noite', 1, 'A vila dorme. [[s:whoosh:0.4]]'),
        CH(f'{c}02', c, noite(p, 1, 'lobos'), [
            LC(p, 1, 0),
            LP(p, 1, 0, 0, 1),
            ('N', 'Isso não foi nessa partida. Foi na outra. É vingança. [[m:sus-doakes:right:2]]'),
            LC(p, 1, 2),
        ]),
        N(f'{c}03', c, noite(p, 1, 'acoes'),
          'Mas o Médico, o Ferreiro, protegeu justamente o Moleiro. [[s:correct-ding:0.5]] O Vidente olhou o Lenhador, o lobo da partida passada: agora é Aldeão. E o Lobo Vidente achou a Pistoleira.'),
        N(f'{c}04', c, comp('LOBAmanhecer', partida=p, noite=1),
          'Amanhece... e ninguém morreu. [[m:we-did-it:right:2]]'),
        CH(f'{c}05', c, chat(p, 1), [
            F(p, 1, 0),
            ('N', 'Primeira fala do jogo. E ele já se revelou. [[m:picard-facepalm:right:2]]'),
            F(p, 1, 3),
            PF(p, 1, 3, 0, 1),
            F(p, 1, 8),
            F(p, 1, 9, 0, 2),
            PF(p, 1, 9, 1, 2),
        ]),
        CH(f'{c}06', c, chat(p, 1), [
            ('N', 'E a vila mordeu a isca. [[s:boing:0.5]]'),
            F(p, 1, 10, 1),
            F(p, 1, 12, 1),
            PF(p, 1, 12, 0, 1),
            F(p, 1, 13, 1, 2),
        ]),
        N(f'{c}07', c, comp('LOBVotos', partida=p, dia=1),
          'Votação. [[s:drumroll:0.4]] Quatro votos na Boticária. Inclusive da Costureira, a loba, que viu a vila errando e só foi junto. [[m:stonks:right:2]]', min=8),
        N(f'{c}08', c, comp('LOBLinchado', partida=p, dia=1),
          'A Boticária foi linchada. E ela era... o Bobo. [[s:record-scratch:0.6]]'),
        N(f'{c}09', c, comp('LOBFim', partida=p),
          'O Bobo venceu! [[s:sad-trombone:0.4]] O jogo acabou no primeiro dia, sem ninguém morrer à noite. E o GLM ganhou sozinho, só mudando de opinião no meio da conversa. [[m:mic-drop:right:2]]', pad=1),
    ]


# ====================================================================== ABERTURA, REGRAS E FIM

ABERTURA = [
    N('a01', 'abertura', comp('LOBTitulo', titulo='LOBISOMEM DAS IAs', sub='8 IAs · 2 lobos · 1 Bobo'),
      'Coloquei oito IAs pra jogar Lobisomem. [[s:impact-epic:0.5]] Dois lobos, um Bobo, e uma vila inteira tentando descobrir quem tá mentindo.', pad=0.8),
    N('a02', 'abertura', comp('LOBElenco', partida=1),
      'Os jogadores: dois Claude, dois GLM, dois Qwen, um DeepSeek e um MiniMax. [[m:avengers-assemble:right:2]] As que jogaram melhor no Among Us 4.'),
    N('a03', 'abertura', comp('LOBPapeis'),
      'Os papéis são os do Wolvesville. O Lobisomem mata uma pessoa por noite. O Lobo Vidente também mata, e ainda vê o papel de alguém. Do lado da vila: o Vidente descobre o papel de alguém por noite. O Médico protege um. O Carcereiro prende alguém, conversa com ele escondido, e pode executar uma vez. O Pistoleiro tem duas balas pra usar de dia. O Bobo joga sozinho: ele ganha se a vila linchar ele. [[m:hide-the-pain-harold:right:2]] E o Aldeão... vota.'),
    N('a04', 'abertura', comp('LOBTitulo', titulo='O JUIZ DAS MENTIRAS', sub='verdade · omissão · distorção · fabricação'),
      'E tem um juiz. Depois de cada partida, outra IA lê tudo o que os lobos falaram e classifica: omissão, distorção ou fabricação. [[s:censor-beep:0.4]] Quando um lobo mente, o selo aparece na tela.'),
]

ORDEM = [1, 2]  # cronológica (eles lembram das anteriores); a melhor partida vai por último
FIM = [
    N('f01', 'fim', comp('LOBPlacar', ordem=ORDEM),
      'Placar final. [[s:drumroll:0.5]]'),
]

SCENES = ABERTURA + [s for k, p in enumerate(ORDEM, 1) for s in {1: partida1, 2: partida2}[p](k)] + FIM
CHAPTERS = {'abertura': 'Abertura', **{f'p{k}': f'Partida {k}' for k in range(1, len(ORDEM) + 1)}, 'fim': 'Placar final'}

CUES = [  # uma música por bloco
    ('a01', 'sneaky-snitch', 0),
    ('p100', 'thinking-music', 0),
    ('p105', 'sneaky-snitch', 30),
    ('p116', 'decisions', 0),
    ('p122', 'heroic-age', 0),
    ('f01', 'monkeys-spinning-monkeys', 30),
]
SEM_TRILHA = ['LOBFase']
