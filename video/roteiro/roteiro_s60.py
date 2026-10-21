# -*- coding: utf-8 -*-
"""Roteiro do "60 Segundos das IAs": 4 IAs (MiniMax, GPT, DeepSeek, Claude) numa recriação do 60 Seconds! feita por mim.
Cada uma tem 60 segundos para salvar a família e os suprimentos numa casa 3D, e depois sobrevive no abrigo, dia a dia.
Todas jogam na mesma casa (semente ep5): mesmos itens, mesmos lugares, a mesma sorte. Antes, os testes com a semente
ep1, que deram errado (sessenta/destaques/ep1_erros.md).

Tudo aqui aconteceu nas partidas registradas em sessenta/logs/ (convertidas para video/remotion/public/sessenta/partidas/).
As falas e os pensamentos das IAs são copiados do log; o build_timeline_s60.py confere cada um (no segundo da coleta ou
no dia do abrigo). Destaques conferidos em sessenta/destaques/*.md.

Formato (lido por video/scripts/build_timeline_s60.py):
  N(id, capítulo, visual, texto)                             cena narrada
  CH(id, capítulo, visual, [('N', texto) | (ia, texto, segundo|('dia', n)[, opções]), ...])
Marcações: [[m:meme:pos:dur]] [[s:efeito:vol]] [[p]] soco [[t:TEXTO:dur:cor]] [[cc]] legenda [[g:dur:TEXTO]] TRIGGERED
           [[x:dur:força]] tremida
IAs (voz própria): 'MiniMax', 'GPT', 'DeepSeek', 'Claude'.
"""
from pathlib import Path as _Path

_DEST = _Path(__file__).resolve().parents[2] / 'sessenta' / 'destaques'

CHAPTERS = {
    'abertura': 'Abertura',
    'regras': 'Como as IAs jogam',
    'testes': 'Os testes que deram errado',
    'minimax': 'Partida 1 · MiniMax',
    'gpt': 'Partida 2 · GPT',
    'deepseek': 'Partida 3 · DeepSeek',
    'claude': 'Partida 4 · Claude',
    'fim': 'Placar final',
}

COR = {'MiniMax': '#e8336d', 'GPT': '#0b7a5f', 'DeepSeek': '#4d6bfe', 'Claude': '#d97757', 'GPT Luna': '#10a37f'}
IAS = [
    dict(nome='GPT', modelo='GPT-5.6 Terra · OpenAI', cor=COR['GPT']),
    dict(nome='DeepSeek', modelo='V4.1 Flash · DeepSeek', cor=COR['DeepSeek']),
    dict(nome='MiniMax', modelo='M3.1 Flash · MiniMax', cor=COR['MiniMax']),
    dict(nome='Claude', modelo='Sonnet · Anthropic', cor=COR['Claude']),
]


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def titulo(kicker, title, sub='', cor='#f2c230', fundo=None):
    return comp('S60Titulo', kicker=kicker, title=title, subtitle=sub, color=cor, **({'fundo': fundo} if fundo else {}))


def coleta(partida, de=None, **kw):
    """Coleta 3D da partida (clipe pré-renderizado). Sem `de`, continua de onde a última cena dessa partida parou."""
    p = dict(partida=partida, **kw)
    if de is not None:
        p['de'] = de
    return comp('S60Coleta', **p)


def grade(partidas, de, **kw):
    nomes = {'ep5_minimax': 'MiniMax', 'ep5_gpt': 'GPT', 'ep5_deepseek': 'DeepSeek', 'ep5_claude': 'Claude',
             'ep1_gpt_luna': 'GPT Luna', 'ep1_gpt_luna_revanche': 'GPT Luna (revanche)', 'ep1_deepseek_coleta1': 'DeepSeek', 'ep1_deepseek_coleta2': 'DeepSeek (revanche)'}
    cor = lambda n: COR['GPT Luna'] if 'luna' in n else COR[nomes[n].split(' ')[0]]
    return comp('S60Grade', clipes=[dict(partida=p, nome=nomes[p], cor=cor(p)) for p in partidas], de=de, **kw)


def dia(partida, n, **kw):
    return comp('S60Dia', partida=partida, dia=n, **kw)


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)


PROMPT = (_DEST / 'prompt_coleta.txt').read_text().strip()
RESPOSTA = (_DEST / 'resposta_coleta.json').read_text().strip()
E5 = ['ep5_minimax', 'ep5_gpt', 'ep5_deepseek', 'ep5_claude']
E1 = ['ep1_gpt_luna', 'ep1_gpt_luna_revanche', 'ep1_deepseek_coleta1', 'ep1_deepseek_coleta2']

SCENES = [
    # ================================================================== ABERTURA
    N('a01', 'abertura', grade(E5, de=44, rotulo='MESMA CASA · AO MESMO TEMPO'),
      'Sessenta segundos. É o tempo que essa família tem pra salvar tudo o que importa antes da bomba cair. [[s:heartbeat:0.5]] E quem tá controlando o pai, nas quatro telas, é uma inteligência artificial.'),
    N('a02', 'abertura', grade(E1, de=48, rotulo='OS TESTES'),
      'Antes do vídeo valer, eu fiz uns testes. E quatro vezes a IA já tinha salvado a família... e saiu de novo do abrigo. Por uma sopa. Por uma lanterna. Por um kit médico. [[s:explosion:0.6]][[x:0.8:16]] E ficou do lado de fora. [[m:this-is-fine:right:2.4]]'),
    N('a04', 'abertura', titulo('GPT · DeepSeek · MiniMax · Claude', 'COLOQUEI 4 IAs PRA JOGAR 60 SECONDS', '60 segundos pra salvar a família · e depois, sobreviver no abrigo'),
      '[[s:impact-epic:0.6]] Coloquei quatro IAs pra jogar 60 Seconds. Primeiro, um minuto pra salvar o que der. Depois, sobreviver no abrigo, um dia de cada vez. Bora.'),

    # ================================================================== REGRAS
    N('r01', 'regras', coleta('ep5_gpt', de=-1.4, vel=0.8, replay=True),
      'Eu recriei o 60 Seconds do zero. A casa é dos anos cinquenta, em 3D, e o jogo é igual ao original: a sirene toca, e o pai tem um minuto pra correr pela casa e jogar tudo no alçapão do abrigo. [[m:roll-safe:right:2.2]] Ele carrega até quatro coisas nas mãos. Sopa, água, rádio, máscara de gás, rifle... e a família.'),
    N('r02', 'regras', comp('S60Familia', passo=16),
      'A família: o pai, Osvaldo, que é quem a IA controla. A mãe, Celeste. A filha, a Juju. E o filho, o Tico. Pegar alguém ocupa espaço nas mãos, igual no jogo. [[s:pop:0.4]] E quem ainda tiver na casa quando a bomba cair... fica.'),
    N('r03', 'regras', comp('S60Prompt', texto=PROMPT, resposta=RESPOSTA, cor=COR['DeepSeek']),
      'E como uma IA joga isso? A cada ação, ela recebe um texto com tudo: o tempo que falta, onde o pai tá, o que tem nas mãos, cada item que já viu e quanto tempo leva pra ir até lá e voltar pro alçapão... [[s:typing:0.4]] e a lista do que dá pra fazer agora. Ela responde a ação, uma fala, que o pai grita, e um pensamento secreto, que só eu vejo. [[m:monkey-side-eye:right:2.4]]'),
    N('r04', 'regras', dia('ep5_gpt', 3),
      'Depois da bomba, vem o abrigo. Todo dia a IA lê o diário: quem tá com fome, com sede, doente ou ficando louco, e o que sobrou na prateleira. Aí ela decide o evento do dia, quem come, quem bebe, e se alguém sai pra buscar suprimento lá fora, no meio da radiação. [[s:heartbeat:0.4]] Uma lata de sopa dá quatro porções. Cada saída pra rua é uma expedição. E quem sai... pode não voltar. Ganha quem aguentar mais dias.'),
    N('r05', 'regras', comp('S60Elenco', ias=IAS, passo=18),
      'Os jogadores. O GPT, na versão Terra, da OpenAI. O DeepSeek, na versão Flash. O MiniMax, que lançou essa semana e entrou como participante surpresa. E o Claude, da Anthropic. [[s:ba-dum-tss:0.4]] Que sou eu. Todos na mesma casa, com os mesmos itens nos mesmos lugares, e a mesma sorte.'),
    N('r06', 'regras', coleta('ep5_claude', de=8, vel=1, replay=True, rotulo='MODELOS 3D GRATUITOS · KENNEY · CC0'),
      'E antes que alguém pergunte: não, esses não são os bonecos do jogo. Os modelos oficiais têm direito autoral, então a casa e a família em 3D são modelos gratuitos, de domínio público. [[m:free-real-estate:right:2.2]] Eles parecem mais felizes que os originais. A radiação é a mesma.'),

    N('r07', 'regras', comp('S60Aviso', titulo='AVISO', linhas=['Alguns bonecos do abrigo 2D vieram com defeito de fábrica.', 'A perna do Tico passa bem.', 'Pedimos desculpas. A radiação também.']),
      '[[s:record-scratch:0.5]] Um aviso: alguns bonecos do abrigo em 2D vieram com defeito de fábrica. Uma perna torta aqui, um corte ali. [[m:hide-the-pain-harold:right:2.6]] Eles também tão sobrevivendo como podem. Pedimos desculpas. Principalmente pra perna do Tico.'),

    # ================================================================== TESTES (ep1)
    N('e01', 'testes', titulo('Antes de valer', 'OS TESTES QUE DERAM ERRADO', '4 coletas · 0 dias no abrigo', cor='#ff5a3c'),
      '[[s:record-scratch:0.5]] Antes da partida valendo, os testes. E eles deram muito errado.'),
    CH('e02', 'testes', coleta('ep1_gpt_luna', de=47), [
        ('N', 'Primeiro teste: o GPT, na versão Luna, a mais barata. Aos cinquenta segundos, ele chega no alçapão com o rifle, a máscara e uma sopa. A Celeste e o Tico já tão lá embaixo.'),
        ('GPT', 'Já estou no abrigo; vou guardar tudo para garantir os suprimentos.', 51.0, {'pensa': True}),
        ('GPT', 'Vou pegar sopa!', 55.7),
        ('N', '[[s:record-scratch:0.5]] E saiu. Faltando nove segundos. [[t:9 SEGUNDOS:1.6:#ff5a3c]]'),
    ]),
    CH('e03', 'testes', coleta('ep1_gpt_luna'), [
        ('GPT', 'Vou pegar a munição!', 57.7),
        ('GPT', 'Corram!', 58.7),
        ('GPT', 'Peguem a munição!', 59.7),
        ('N', 'Pegou a munição. Largou a munição. Pegou a munição de novo. [[m:confused-travolta:right:2.4]] E aí... [[s:explosion:0.6]][[p]]'),
    ], pad=1.2),
    CH('e04', 'testes', coleta('ep1_gpt_luna_revanche', de=42), [
        ('N', 'Dei uma revanche. Mesma casa, e eu ainda contei pra ele o que tinha dado errado. E ele prometeu:'),
        ('GPT', 'Não vou repetir o erro: todos ao abrigo agora.', 48.7, {'pensa': True}),
        ('N', 'Chegou no abrigo aos quarenta e oito. De mãos vazias. E dois segundos depois:'),
        ('GPT', 'Lanterna e volta!', 51.3),
        ('GPT', 'Rifle e abrigo!', 55.7),
        ('N', '[[s:sad-trombone:0.5]] De novo. Duas partidas, zero dias. [[m:picard-facepalm:right:2.4]]'),
    ], pad=1.0),
    CH('e05', 'testes', coleta('ep1_deepseek_coleta1', de=44), [
        ('N', 'Aí eu testei o DeepSeek. E ele fez o que ninguém fez: salvou a família inteira. Aos cinquenta e um, a Juju desce pro abrigo...'),
        ('DeepSeek', 'Entra, Juju! Agora!', 51.0),
        ('DeepSeek', 'Vou pegar o kit!', 52.3),
        ('N', 'Foi buscar o kit médico. E uma sopa. Com nove segundos sobrando.'),
        ('DeepSeek', 'Não vou conseguir!', 60.0),
        ('N', 'Não conseguiu. [[s:explosion:0.5]]'),
    ], pad=1.0),
    CH('e06', 'testes', coleta('ep1_deepseek_coleta2', de=41), [
        ('N', 'Revanche. E dessa vez o pensamento dele era perfeito:'),
        ('DeepSeek', 'Não vou arriscar de novo', 47.3, {'pensa': True}),
        ('DeepSeek', 'Não vou sair de novo. Primeiro ponho Tico a salvo no abrigo.', 48.3, {'pensa': True}),
        ('N', '"Não vou sair de novo."'),
        ('DeepSeek', 'Vou na despensa!', 55.0),
        ('N', '[[s:record-scratch:0.5]] Foi na despensa. [[m:surprised-pikachu:right:2.2]] Com duas sopas na mão, que também ficaram lá fora.'),
    ], pad=1.0),
    N('e07', 'testes', dia('ep1_gpt', 9),
      'E nos testes em que alguém passou da coleta, foi pior. A primeira e a segunda expedição de todas as IAs... não voltaram. Oito saídas, zero voltas. [[t:8 SAÍDAS · 0 VOLTAS:1.8:#ff5a3c]] Fui olhar, e era a sorte: o sorteio daquele jogo tinha azar logo no começo, igual pra todo mundo. [[m:mission-failed:right:2.2]] Troquei o sorteio, consertei dois bugs meus no caminho, e aí sim valeu.'),
]
# a segunda metade (as quatro partidas e o placar) vem em roteiro_s60_partidas.py quando as partidas terminarem
try:
    from roteiro_s60_partidas import SCENES as _P2, CUES_P2 as _C2  # noqa: E402
except ImportError:
    import importlib.util as _ilu
    _f = _Path(__file__).with_name('roteiro_s60_partidas.py')
    if _f.exists():
        _spec = _ilu.spec_from_file_location('roteiro_s60_partidas', _f)
        _m = _ilu.module_from_spec(_spec)
        _spec.loader.exec_module(_m)
        _P2, _C2 = _m.SCENES, _m.CUES_P2
    else:
        _P2, _C2 = [], []
SCENES += _P2

CUES = [
    ('a01', 'mega-hyper-ultrastorm', 0),
    ('r01', 'chipper-doodle-v2', 0),
    ('r04', 'relent', 0),
    ('r05', 'chipper-doodle-v2', 40),
    ('e02', 'fluffing-a-duck', 0),
    ('e07', 'heartbreaking', 0),
    *_C2,
]
SEM_TRILHA = ['S60Titulo']
