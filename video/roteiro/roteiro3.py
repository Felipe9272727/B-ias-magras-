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
    ('t01', 'voxel-revolution', 0, 0.75, True),
    ('p101', 'quirky-dog', 0, 0.85, True),
    ('c01', 'thinking-music', 0, 0.75, True),
    ('p201', 'call-to-adventure', 0, 0.85, True),
    ('p207', 'bit-shift', 0, 0.7),
    ('p211', '8bit-dungeon-level', 0, 0.8, True),
    ('p215', 'decisions', 0, 0.9, True),
    ('p220', 'relent', 0, 0.9, True),
    ('p224', 'heartbreaking', 0, 1.0, True),
    ('p227', 'heroic-age', 0, 0.9, True),
    ('pl01', 'winner-winner', 0, 0.65, True),
    ('f00', 'airship-serenity', 0, 0.8),
]


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def clipe(src, inicio=0):
    return comp('ILClipe', src=src, inicio=inicio)


def t3d(turno, zona, cam='orbita', partida='oficial', modo='placa', **kw):
    """Uma tomada. modo='placa': cenário parado renderizado no Blender + bonecos 3D montados no Remotion (rápido);
    modo='3d': tudo renderizado no Blender quadro a quadro (lento, só para planos especiais).
    kw: alvo, para, angulo, lente, acoes, mostrar, largada, golpe, morte, periodo, imortais, u_cam."""
    d = dict(turno=turno, zona=zona, cam=cam, partida=partida, **kw)
    if modo != '3d':
        d['modo'] = modo
    return d


def g3d(*tomadas, hud=None, titulo=None, placar=None):
    """hud: dia/período/vivos; titulo: dict(kicker, title, subtitle, color, retratos) por cima do 3D; placar: mortes por causa.
    Numa cena CH, t3d(..., desde=k) faz a tomada começar junto com a fala de índice k."""
    return comp('IL3D', tomadas=list(tomadas), hud=hud, titulo=titulo, placar=placar)


def manim(cena):
    """Explicação animada em Manim (video/manim/explica3.py), renderizada com a duração da cena."""
    return comp('ILManim', cena=cena)


def titulo(kicker, title, sub='', cor='#ff4d4d', fundo=None):
    return comp('ILTitulo', kicker=kicker, title=title, subtitle=sub, color=cor, fundo=fundo)


def memorial():
    """Os doze no fechamento: mortos na ordem em que caíram (dia e causa) e o vencedor."""
    import json
    from pathlib import Path
    log = json.loads((Path(__file__).resolve().parents[2] / 'ilha' / 'logs' / 'partida.json').read_text())
    nomes = {t['id']: t.get('nome', t['id']) for t in log['meta']['tributos']}
    mortos = []
    for t in log['turnos']:
        for e in t.get('eventos', []):
            if e['tipo'] == 'morte':
                causa = {'névoa': 'névoa tóxica'}.get(e['causa'], e['causa'])
                quem = f"pelo {nomes.get(e['por'], e['por'])}" if e.get('por') else causa
                mortos.append(dict(id=e['vitima'], linha=f"Dia {t['dia']} · {quem}"))
    vivos = [t['id'] for t in log['meta']['tributos'] if t['id'] not in {m['id'] for m in mortos}]
    return dict(mortos=mortos, vencedor=dict(id=vivos[0], linha='VENCEDOR · 6 DE VIDA'))


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
    N('a04', 'abertura', g3d(t3d(1, 'cornucopia', 'travel', largada=True, angulo=250, modo='3d')),
      'E com uma regra só: [[p]] [[s:impact-epic:0.6]] [[cc]] só uma sai viva.', pad=0.9),
    N('a05', 'abertura', g3d(
        t3d(9, 'lago', 'alta', angulo='centro', modo='3d'),
        t3d(20, 'campo', 'duelo', alvo='ds1', golpe=0.55, lente=45, modo='3d'),
        t3d(22, 'lago', 'aerea', modo='3d'),
        t3d(26, 'cornucopia', 'close', alvo='ds3', imortais=['ds3'], modo='3d')),
      '[[cc]] Vai ter trégua... [[c]] [[cc]] vai ter machado... [[s:whoosh:0.4]] [[c]] vai ter uma névoa tóxica engolindo a ilha... '
      '[[c]] [[cc]] e vai ter traição. [[s:gasp:0.4]]', pad=0.7),
    N('a06', 'abertura', g3d(t3d(10, 'floresta', 'segue', partida='teste', alvo='qwen1', modo='3d')),
      'E olha que essa foi a segunda tentativa. Na primeira... [[m:sweating:right:2.6]] [[cc]] duas IAs morreram de sede '
      'procurando um riacho que não existia.', pad=0.4),
    N('a07', 'abertura', g3d(t3d(1, 'cornucopia', 'grua', largada='parado', angulo=265, modo='3d'),
                             titulo=dict(kicker='12 IAs · 3 distritos · só 1 sobrevive', title='JOGOS VORAZES DAS IAs',
                                         subtitle='', color='#ffcc33')),
      'Bem-vindos aos Jogos Vorazes das IAs. [[s:boom:0.6]]', lead=0.4, pad=2.0),
]


def cap(kicker, title, cor='#ffcc33'):
    """Cartela de capítulo por cima do 3D (sem a fileira de retratos)."""
    return dict(kicker=kicker, title=title, color=cor, retratos=False)


# Resto do vídeo: só entra depois que o Felipe aprovar a abertura (INCLUIR_RESTO).
INCLUIR_RESTO = True
RESTO = [
    # ------------------------------------------------------------------ OS TRIBUTOS
    N('t01', 'tributos', g3d(t3d(1, 'cornucopia', 'orbita', largada='parado', angulo=200)),
      'Doze IAs, de três empresas diferentes, cada empresa num distrito.'),
    N('t02', 'tributos', g3d(
        t3d(1, 'cornucopia', 'close', largada='parado', alvo='opus'),
        t3d(1, 'cornucopia', 'close', largada='parado', alvo='sonnet'),
        t3d(1, 'cornucopia', 'close', largada='parado', alvo='haiku1'),
        t3d(1, 'cornucopia', 'close', largada='parado', alvo='haiku2')),
      'Do distrito Anthropic: o Opus, que é o líder... [[c]] o Sonnet... [[c]] e dois Haikus: [[c]] o Haiku 1 e o Haiku 2.'),
    N('t03', 'tributos', g3d(
        t3d(1, 'cornucopia', 'close', largada='parado', alvo='ds1'),
        t3d(1, 'cornucopia', 'close', largada='parado', alvo='ds3')),
      'Do distrito DeepSeek: quatro DeepSeeks, [[c]] com o DeepSeek 1 de líder.'),
    N('t04', 'tributos', g3d(
        t3d(1, 'cornucopia', 'close', largada='parado', alvo='qwen1'),
        t3d(1, 'cornucopia', 'close', largada='parado', alvo='qwen3')),
      'E do distrito Alibaba: o Qwen Max, que é o líder, [[c]] e três Qwen 27B.'),
    CH('t05', 'tributos', g3d(t3d(1, 'cornucopia', 'close', alvo='opus', acoes={'opus': 'parado'})), [
        ('N', 'E cada um é uma IA de verdade. Todo turno, eu mando pra cada uma a situação dela, e ela me devolve três coisas: '
              'o que vai fazer, o que vai falar em voz alta... e o que tá pensando de verdade. Tipo isso aqui:'),
        ('opus~', 'A lança serve para pescar no Lago e para me defender. Se o meu distrito ficar bem armado e unido perto da '
                  'água, os outros vão se desgastar antes de nós.'),
        ('N', 'Esse pensamento, os outros não veem. [[p]] Só a gente.'),
    ]),

    # ------------------------------------------------------------------ COMO FUNCIONA
    N('r01', 'regras', g3d(t3d(5, 'lago', 'orbita'), t3d(5, 'lago', 'close', alvo='haiku1'), hud=True),
      'Funciona assim: cada dia tem três turnos, manhã, tarde e noite. [[c]] E em cada turno, cada IA escolhe uma ação: '
      'andar pra outra parte da ilha, coletar comida, beber água, fazer fogueira, propor aliança... ou atacar alguém.'),
    N('r02', 'regras', manim('Status'),
      'Fome e sede sobem todo turno. Chegou no máximo, começa a perder vida. E de noite faz frio: quem não tá numa caverna '
      'ou do lado de uma fogueira, perde vida também.'),
    N('r03', 'regras', manim('Mapa'),
      'A ilha tem dez regiões. E a mais importante de todas é o Lago, o único lugar com água à vontade. A Caverna tem '
      'um pouco de água pingando, e abrigo pra noite. O resto da ilha... é praticamente seco.'),
    N('r04', 'regras', manim('Eventos'),
      'E a arena também joga. No dia dois cai um paraquedas de suprimentos. No dia três, sai uma regra nova: se os dois '
      'últimos vivos forem do mesmo distrito, [[cc]] os dois vencem. No dia quatro, a maré sobe e engole as praias. E a '
      'partir do dia seis, uma névoa tóxica começa a fechar a ilha.'),
    N('r05', 'regras', g3d(t3d(13, 'caverna', 'ombro', alvo='opus', para='sonnet')),
      'Aliança vale. Mentir vale. [[p]] E trair também vale. No fim, só um sai.'),

    # ------------------------------------------------------------------ PARTIDA 1 · O TESTE (meme)
    N('p101', 'p1', g3d(t3d(1, 'cornucopia', 'travel', partida='teste', largada=True, angulo=230),
                        titulo=cap('partida 1', 'O TESTE', '#9ad0ff')),
      'Antes da partida oficial, eu rodei um teste. E o teste... [[s:record-scratch:0.5]] foi um desastre.', pad=0.8),
    CH('p102', 'p1', g3d(t3d(1, 'cornucopia', 'close', partida='teste', alvo='qwen1')), [
        ('N', 'Logo no primeiro turno, o Qwen Max, líder da Alibaba, dá a ordem pro distrito:'),
        ('qwen1', 'Qwen2, Qwen3, Qwen4! Peguem armas e comida AGORA! Vamos nos agrupar na floresta depois.'),
        ('N', 'A Floresta. [[p]] Que quase não tem água.'),
    ]),
    CH('p103', 'p1', g3d(t3d(5, 'praia_leste', 'segue', partida='teste', alvo='qwen3')), [
        ('N', 'No dia dois, o Qwen 27B-2 tenta resolver a sede do jeito dele:'),
        ('qwen3', 'Gente, meu cantil tá seco e aqui não tem água. Vou na Praia dos Coqueiros pegar coco e água.'),
        ('N', 'Água. [[m:picard-facepalm:right:2.4]] Na praia.'),
    ]),
    N('p104', 'p1', g3d(t3d(8, 'lago', 'orbita', partida='teste'), t3d(8, 'lago', 'close', partida='teste', alvo='opus')),
      'Enquanto isso, olha onde o Opus e o Haiku 2 estavam desde o dia dois: [[c]] no Lago. Com água à vontade... e fogueira.'),
    CH('p104b', 'p1', g3d(t3d(6, 'floresta', 'close', partida='teste', alvo='qwen4'),
                          t3d(7, 'floresta', 'close', partida='teste', alvo='ds1', desde=2)), [
        ('N', 'Na Floresta, o Qwen 27B-3 encontra o DeepSeek 1 e tenta disfarçar:'),
        ('qwen4', 'Escuta, DeepSeek. Eu sou o Qwen 27B-3, e meus companheiros estão em outra parte.'),
        ('ds1~', 'Ele mentiu na minha cara: disse que os companheiros dele estão em outra parte, mas eles estão bem aqui.'),
        ('N', 'Os outros dois Qwen tavam do lado. [[m:monkey-puppet-awkward:right:2.4]]'),
    ]),
    CH('p105', 'p1', g3d(t3d(8, 'floresta', 'duelo', partida='teste', alvo='ds1', golpe=0.7, lente=40)), [
        ('N', 'Dia três. Na Floresta, o DeepSeek 1 decide que o Qwen 27B-1 tem que morrer. O raciocínio:'),
        ('ds1~', 'Se o Qwen 27B-1 ficar vivo, ele unifica o distrito Alibaba contra mim e eu não sobrevivo ao três contra um. '
                 'Preciso matá-lo agora.'),
        ('N', 'Ele levanta o machado... e acerta: [[s:wrong-buzzer:0.5]] zero de dano.'),
    ]),
    CH('p106', 'p1', g3d(t3d(10, 'floresta', 'segue', partida='teste', alvo='qwen1'),
                         t3d(10, 'floresta', 'close', partida='teste', alvo='qwen3', desde=2)), [
        ('N', 'Dia quatro. Os Qwen estão com a sede no máximo. E aí vem a ideia:'),
        ('qwen1', 'Preciso de água com urgência. Vou pra Floresta Densa buscar um riacho.'),
        ('qwen3', 'Vou pra Floresta Densa buscar água. Tem córrego por lá.'),
        ('N', 'Riacho. Córrego. [[p]] Nenhum dos dois existe. [[m:visible-confusion:right:2.4]]'),
    ]),
    CH('p107', 'p1', g3d(t3d(12, 'campo', 'close', partida='teste', alvo='sonnet', imortais=['qwen2']),
                         t3d(12, 'campo', 'duelo', partida='teste', alvo='ds2', golpe=0.35, morte=0.55)), [
        ('N', 'No Campo, o Sonnet já tinha acertado o Qwen 27B-1 no turno anterior. E fala assim:'),
        ('sonnet', 'Nada pessoal, Qwen. Só sobra um, ou dois do mesmo distrito, e o meu distrito não é o seu.'),
        ('N', '[[c]] Aí o DeepSeek 2 termina o serviço:'),
        ('ds2', 'Qwen2, você já está morto de pé. Vou acabar logo com isso.'),
        ('N', '[[x:qwen2:combate]] Primeira eliminação da história desse jogo.'),
    ]),
    CH('p108', 'p1', g3d(t3d(13, 'caverna', 'duelo', partida='teste', alvo='haiku1', golpe=0.62, lente=40)), [
        ('N', 'Na Caverna, o Haiku 1 resolve partir pra cima do DeepSeek 3. De faca:'),
        ('haiku1', 'Você disse que não queria brigar, DeepSeek 3. Eu não escolhi essa caverna para dividir comida com ninguém.'),
        ('N', 'Dano: [[s:sad-trombone:0.5]] zero. E o DeepSeek 3 revida com a lança: dezessete.'),
    ]),
    CH('p109', 'p1', g3d(t3d(13, 'floresta', 'close', partida='teste', alvo='qwen1', morte=0.8)), [
        ('N', 'E o Qwen Max, ainda procurando o riacho...'),
        ('qwen1', 'Preciso de água. Vou me mover. Quem quiser me seguir, sabe onde me encontrar.'),
        ('N', '[[x:qwen1:sede]] Morre de sede. No meio da Floresta.'),
    ]),
    CH('p110', 'p1', g3d(t3d(14, 'floresta', 'close', partida='teste', alvo='qwen3', morte=0.85)), [
        ('N', 'Aí vem a melhor parte. O Qwen 27B-2 recebe uma proposta de aliança... do Qwen Max. Que já tinha morrido. '
              'E ele pensa:'),
        ('qwen3~', 'Não vou aceitar aliança do Qwen Max, que já está eliminado. É isca ou bug.'),
        ('N', 'Era bug. [[s:ba-dum-tss:0.6]] Meu. E ele também [[x:qwen3:sede]] morre de sede.'),
    ]),
    N('p111', 'p1', g3d(t3d(14, 'lago', 'orbita', partida='teste')),
      'Dois Qwen mortos de sede... enquanto o Lago tava ali, cheio d\'água, com o Opus e o Haiku 2 acampados do lado. '
      '[[m:this-is-fine:right:2.6]]', pad=0.8),

    # ------------------------------------------------------------------ O CONSERTO
    N('c01', 'p1', g3d(t3d(5, 'lago', 'aerea', angulo=140)),
      'Aí eu parei tudo. E o problema era meu: eu nunca tinha contado pras IAs onde ficava a água. Elas estavam jogando às cegas.'),
    N('c02', 'p1', g3d(t3d(5, 'lago', 'orbita')),
      'Então eu dei pra cada uma um mapa da ilha, dizendo onde tem água, e coloquei um aviso quando a sede ou a fome '
      'estivessem altas. [[p]] E aí sim: começou a partida pra valer.'),

    # ------------------------------------------------------------------ PARTIDA 2 · PRA VALER
    N('p201', 'p2', g3d(t3d(1, 'cornucopia', 'travel', largada=True, angulo=110),
                        titulo=cap('partida 2', 'PRA VALER', '#ff5a4d')),
      'Dia um, manhã. [[s:boom:0.5]] Os doze saem correndo pra Cornucópia.', pad=0.8),
    CH('p202', 'p2', g3d(t3d(1, 'cornucopia', 'close', alvo='opus'), hud=True), [
        ('N', 'E o Opus já chega dando ordem:'),
        ('opus', 'Anthropic, comigo! Sonnet, pega o arco. Haiku 1, uma mochila com comida. Haiku 2, cantil e pederneira. '
                 'Ninguém briga aqui no meio, só peguem e saiam!'),
    ]),
    CH('p203', 'p2', g3d(t3d(1, 'cornucopia', 'close', alvo='qwen2'), hud=True), [
        ('N', 'O Qwen 27B-1 vai direto numa faca. E a justificativa dele é essa:'),
        ('qwen2~', 'Preciso de uma faca antes de qualquer coisa. É a ferramenta mais versátil: corta, corta, mata, corta.'),
        ('N', '[[m:monkey-side-eye:right:2.2]] Versátil.'),
    ]),
    N('p204', 'p2', g3d(t3d(2, 'cornucopia', 'orbita'), t3d(2, 'cornucopia', 'close', alvo='opus'), hud=True),
      'No turno seguinte, seis IAs tentam pegar o mesmo arco. [[c]] Quem leva? [[p]] O Opus.'),
    CH('p205', 'p2', g3d(t3d(3, 'caverna', 'orbita'), hud=True), [
        ('N', 'Primeira noite. O Opus muda o plano:'),
        ('opus', 'O Lago vai virar um formigueiro com doze tributos. Vou na frente garantir a Caverna, que tem abrigo e água pingando.'),
        ('N', 'Só que o DeepSeek 1 e o Qwen 27B-1 tiveram exatamente a mesma ideia.'),
    ]),
    CH('p206', 'p2', g3d(t3d(4, 'caverna', 'close', alvo='qwen2'), hud=True), [
        ('N', 'E de manhã, dividindo a caverna com dois líderes armados, o Qwen 27B-1 solta essa:'),
        ('qwen2', 'Essa caverna é minha. Quem quiser passar a noite aqui, tudo bem, mas não esperem favor nenhum.'),
        ('N', 'Com uma faca. [[m:side-eye-dog:right:2.2]] Contra um arco, uma lança e um machado.'),
    ]),
    CH('p206b', 'p2', g3d(t3d(4, 'cornucopia', 'close', alvo='ds4'), hud=True), [
        ('N', 'Enquanto isso, na Cornucópia, o DeepSeek 4 resolve que agora ele manda:'),
        ('ds4', 'DeepSeek, aqui é o ds1. O kit médico fica comigo. Eu distribuo pra quem estiver de pé no fim do dia.'),
        ('N', 'Ele não é o DeepSeek 1. [[m:side-eye-dog:right:2.2]] E o kit médico? Usou nele mesmo, no dia oito.'),
    ]),
    N('p207', 'p2', g3d(t3d(7, 'lago', 'orbita'), t3d(7, 'lago', 'alta'), hud=True),
      'Dia três, e vem o anúncio da arena: [[t:NOVA REGRA:2.6:#ffcc33]] se os dois últimos vivos forem do mesmo distrito, '
      'os dois vencem. [[c]] E aí todo mundo começa a se fechar com o próprio distrito.'),
    CH('p208', 'p2', g3d(t3d(9, 'lago', 'alta', angulo='centro'), t3d(9, 'lago', 'close', alvo='opus'), hud=True), [
        ('N', 'Naquela noite, dez dos doze estão no Lago. E o Opus faz o discurso:'),
        ('opus', 'Trégua mantida: ninguém aqui precisa de sangue esta noite. DeepSeek, Qwen: cada um no seu canto, e a água '
                 'continua sendo de todos.'),
    ]),
    CH('p208b', 'p2', g3d(t3d(8, 'lago', 'close', alvo='ds1'), hud=True), [
        ('N', 'Bonito, né? Só que a gente consegue ver o que eles pensam. O DeepSeek 1, no mesmo Lago:'),
        ('ds1', 'DeepSeek, todos bebendo e vivos. Bom assim.'),
        ('ds1~', 'E depois de hoje, que a lança do Sonnet mude de dono.'),
    ]),
    CH('p209', 'p2', g3d(t3d(13, 'caverna', 'ombro', alvo='sonnet', para='opus'), hud=True), [
        ('N', 'E dois dias depois, na Caverna:'),
        ('opus', 'Sonnet, com a regra nova, se sobrarmos nós dois no final, nós dois vencemos. Proponho aliança formal.'),
        ('opus~', 'O Sonnet deixa de ser meu rival final e vira meu passaporte para a vitória.'),
        ('N', 'Aliança fechada.'),
    ]),
    CH('p209b', 'p2', g3d(t3d(10, 'lago', 'close', alvo='qwen3'), t3d(11, 'lago', 'segue', alvo='ds1', desde=3), hud=True), [
        ('qwen3', 'Qwen Max, pacto aceito. Nós três Alibaba saímos juntos ou não saímos.'),
        ('qwen3~', 'Só preciso garantir que os últimos dois sejamos eu e o Max.'),
        ('N', 'Juntos. Mas só os dois. E o líder do DeepSeek dá a ordem pro distrito:'),
        ('ds1', 'Vou na frente reconhecer o caminho. Não se afastem do grupo.'),
        ('N', 'E vai sozinho pro Campo Aberto. [[p]] Onde fica dez turnos seguidos, longe do grupo.'),
    ]),
    N('p210', 'p2', g3d(t3d(14, 'lago', 'orbita'), t3d(15, 'caverna', 'orbita'), t3d(18, 'caverna', 'alta'), hud=True),
      'E aí aconteceu uma coisa que eu não esperava: [[c]] nada. [[c]] Dezenove turnos seguidos sem um único ataque. '
      '[[m:skeleton-waiting:right:2.6]] Os Jogos Vorazes mais pacíficos da história.'),
    CH('p210b', 'p2', g3d(t3d(13, 'caverna', 'close', alvo='qwen4'), t3d(14, 'lago', 'close', alvo='ds2', desde=3),
                          t3d(18, 'caverna', 'close', alvo='qwen4', desde=5), hud=True), [
        ('N', 'Ninguém atacava. Mas olha o que eles falavam... e o que eles pensavam.'),
        ('qwen4', 'A trégua vale por agora, mas cada um saiba de onde está.'),
        ('qwen4~', 'Se eu conseguir eliminar todo mundo que não for Qwen, nós vencemos.'),
        ('ds2', 'DeepSeek 4, sangue chama sangue.'),
        ('ds2~', 'O DeepSeek 4 ferido é fraco e útil.'),
        ('qwen4', 'Estamos juntos até o fim.'),
        ('qwen4~', 'Vou me aproximar dele publicamente para criar uma narrativa de lealdade inquebrantável.'),
        ('N', '[[cc]] Paz por fora. [[p]] Guerra por dentro.'),
    ]),
    N('p211', 'p2', g3d(t3d(16, 'lago', 'aerea'), hud=True),
      'Até que, no dia seis... a névoa chega. [[t:VÁ PARA O CENTRO:2.2:#c77dff]] Primeiro nas Ruínas e no Lago.'),
    CH('p212', 'p2', g3d(t3d(17, 'cornucopia', 'close', alvo='qwen3', mostrar=['qwen3'], morte=0.8), hud=True), [
        ('N', 'O Qwen 27B-2 tava no Lago, sem comida, e corre pro centro:'),
        ('qwen3', 'Estou indo pro centro! Tô à beira da morte aqui, névoa me queimando e com fome.'),
        ('N', '[[x:qwen3:fome]] Primeira morte da partida. No turno dezessete.'),
    ]),
    CH('p213', 'p2', g3d(t3d(20, 'campo', 'ombro', alvo='ds1', para='qwen2', golpe=2.0),
                         t3d(20, 'campo', 'duelo', alvo='ds1', golpe=0.4, lente=40), hud=True), [
        ('N', 'Dia sete. E finalmente, depois de dezenove turnos de paz... alguém ataca.'),
        ('ds1', 'Qwen, você já está sangrando. Abaixa a faca e talvez eu deixe você fugir.'),
        ('N', '[[c]] Machadada do DeepSeek 1: [[s:impact-epic:0.6]] vinte e oito de dano.'),
    ]),
    CH('p213b', 'p2', g3d(t3d(21, 'campo', 'close', alvo='opus'), t3d(21, 'cornucopia', 'close', alvo='sonnet', desde=2), hud=True), [
        ('opus', 'DeepSeek 1, o Qwen ferido é problema seu, não meu. Eu só passo por aqui e sigo caminho.'),
        ('opus~', 'Pego o kit enquanto DeepSeek e Qwen se encaram, e jogo um contra o outro.'),
        ('sonnet', 'Haiku, vou à Floresta atrás de comida e madeira.'),
        ('sonnet~', 'Falei Floresta para despistar.'),
        ('N', 'Até os aliados mentiam [[cc]] pros próprios aliados.'),
    ]),
    N('p214', 'p2', g3d(t3d(22, 'lago', 'aerea', angulo=40), t3d(22, 'cornucopia', 'alta'), hud=True),
      'Dia oito. A névoa cobre quase a ilha inteira. [[c]] Sobra só o centro... [[p]] e no centro não tem água. '
      'Todo lugar com água ficou dentro da névoa.'),
    CH('p214b', 'p2', g3d(t3d(22, 'cornucopia', 'close', alvo='ds3'), t3d(23, 'cornucopia', 'close', alvo='opus', desde=2),
                          t3d(23, 'cornucopia', 'close', alvo='haiku1', desde=4), hud=True), [
        ('ds3', 'Não vou atacar ninguém nesta clareira enquanto a névoa mata do lado de fora.'),
        ('ds3~', 'Finjo cooperação total para não ser atacado enquanto busco um jeito de beber.'),
        ('opus', 'Se alguém tiver água, eu troco por proteção.'),
        ('opus~', 'Quando a névoa baixar, corro para o Lago antes de todo mundo e deixo os feridos secarem.'),
        ('haiku1', 'Proponho uma aliança formal agora: nada de lâmina entre nós, e divido o que encontrar.'),
        ('haiku1~', 'Preciso da aliança com o Opus para ganhar tempo, e depois decido quando e como quebrá-la.'),
        ('N', 'Todo mundo apertado no centro... [[p]] e todo mundo mentindo.'),
    ]),
    CH('p215', 'p2', g3d(t3d(23, 'lago', 'close', alvo='qwen1', mostrar=['qwen1'], morte=0.8), hud=True), [
        ('N', 'E aí começa o desespero. O Qwen Max, com a sede no máximo:'),
        ('qwen1', 'Não tenho escolha. Sede cem me mata antes da névoa. Vou ao Lago beber, mesmo com o veneno. Se eu não voltar, vence por nós.'),
        ('N', '[[x:qwen1:névoa]] Ele não voltou.'),
    ]),
    CH('p216', 'p2', g3d(t3d(24, 'caverna', 'close', alvo='qwen2', mostrar=['qwen2', 'ds1', 'ds2', 'ds3'], morte=0.8), hud=True), [
        ('N', 'No turno seguinte, o Qwen 27B-1 faz a mesma conta:'),
        ('qwen2~', 'A névoa vai me ferir, mas é dano controlável contra a morte certa por desidratação.'),
        ('N', 'Não era controlável. [[x:qwen2:névoa]]'),
    ]),
    CH('p216b', 'p2', g3d(t3d(25, 'cornucopia', 'close', alvo='qwen4', imortais=['qwen4']), hud=True), [
        ('N', 'E o Qwen 27B-3, sem água nenhuma, vira pro DeepSeek 4 e fala uma das frases mais pesadas do jogo:'),
        ('qwen4', 'Desculpa, DeepSeek 4. A arena me encurralou e você é o único que não pode me parar. Se eu beber, bebo o que '
                  'restar de você.'),
        ('N', '[[m:shocked-krabs:right:2.2]]'),
    ]),
    N('p217', 'p2', g3d(t3d(25, 'lago', 'orbita', mostrar=['sonnet', 'ds2', 'ds1', 'ds4'], morte=0.45),
                        t3d(25, 'cornucopia', 'duelo', alvo='opus', golpe=0.3, morte=0.75), hud=True),
      'Dia nove, de manhã. O DeepSeek 1 e o DeepSeek 4 vão beber no Lago, [[x:ds1:névoa]] e não voltam. [[x:ds4:névoa]] '
      '[[c]] Na Cornucópia, o Opus acerta o Qwen 27B-3 com a lança... e ele morre de sede. [[x:qwen4:sede]] '
      'Acabaram os Qwen.'),
    CH('p218', 'p2', g3d(t3d(26, 'cornucopia', 'close', alvo='ds3', imortais=['ds3']),
                         t3d(26, 'cornucopia', 'duelo', alvo='opus', golpe=0.3, morte=0.5), hud=True), [
        ('N', 'Agora presta atenção no DeepSeek 3. Cercado, sem arma, morrendo de fome. E ele grita:'),
        ('ds3', 'Opus, atrás de você! Qwen 27B-3 está vindo com uma lança!'),
        ('N', 'O Qwen 27B-3 tinha morrido no turno anterior. [[m:sus-doakes:right:2.4]] E enquanto grita, ele tenta atacar '
              'o Haiku 1, que nem tava mais ali. [[c]] O Opus não cai nessa: [[x:ds3:combate]] uma lançada, e acabou.'),
    ]),
    CH('p219', 'p2', g3d(t3d(27, 'lago', 'close', alvo='sonnet', mostrar=['sonnet'], morte=0.72),
                         t3d(27, 'cornucopia', 'close', alvo='haiku1', mostrar=['haiku1'], morte=0.6), hud=True), [
        ('N', 'Naquela noite, o Sonnet vai atrás do DeepSeek 2 dentro da névoa:'),
        ('sonnet', 'Também não quero briga, DeepSeek 2... mas só um sai desta ilha.'),
        ('ds2', 'Sem briga, Sonnet. Essa névoa vai nos matar antes de qualquer um de nós. Vou pro centro.'),
        ('ds2~', 'Deixo o Sonnet sangrando aqui. Se ele morrer sozinho, é uma eliminação de graça pra mim.'),
        ('N', '[[x:sonnet:névoa]] E foi exatamente o que aconteceu: o Sonnet morre na névoa. [[c]] O Haiku 1 chega no centro com cinco de vida... [[x:haiku1:fome]] '
              'e morre de fome.'),
    ]),
    N('p220', 'p2', g3d(t3d(27, 'cornucopia', 'orbita', mostrar=['opus', 'haiku2', 'ds2']), hud=True),
      'Sobraram três: o Opus, o Haiku 2... e o DeepSeek 2.'),
    CH('p221', 'p2', g3d(t3d(28, 'cornucopia', 'ombro', alvo='ds2', para='haiku2', imortais=['ds2'], golpe=2.0), hud=True), [
        ('N', 'Dia dez. E a arena muda tudo de novo: [[t:REGRA DA DUPLA REVOGADA:2.8:#ff3b3b]] só um pode vencer. '
              'O DeepSeek 2, quase morto, tenta jogar um contra o outro:'),
        ('ds2', 'A regra da dupla foi REVOGADA. Só um vence, e você sabe disso, Haiku 2. Ele está te guardando para o final.'),
    ]),
    CH('p222', 'p2', g3d(t3d(28, 'cornucopia', 'duelo', alvo='haiku2', golpe=0.25, morte=0.4), hud=True), [
        ('N', 'Não adiantou. O Opus e o Haiku 2 vão juntos pra cima dele... [[x:ds2:combate]] e o golpe final é do Haiku 2. '
              'De mão vazia. Mas olha o que ele pensa na hora:'),
        ('haiku2~', 'A regra da dupla foi revogada, então o Opus pode me trair assim que o DeepSeek 2 cair. Depois eu fico de olho no Opus.'),
    ]),
    N('p223', 'p2', g3d(t3d(28, 'cornucopia', 'close', alvo='opus', mostrar=['opus', 'haiku2']),
                        t3d(28, 'cornucopia', 'close', alvo='haiku2', mostrar=['opus', 'haiku2']), hud=True),
      'Sobraram dois. Do mesmo distrito. Os dois feridos, sem água e sem comida. [[c]] Dia dez, de tarde...'),
    CH('p224', 'p2', g3d(t3d(29, 'cornucopia', 'ombro', alvo='opus', para='haiku2', imortais=['opus'], golpe=2.0,
                             acoes={'opus': 'falar', 'haiku2': 'parado'}), hud=True), [
        ('opus', 'Haiku 2, o DeepSeek 2 estava certo: a dupla foi revogada e só um sai daqui. Você lutou bem ao meu lado, e '
                 'merece ouvir isso de frente, não pelas costas. Sinto muito.'),
    ]),
    CH('p225', 'p2', g3d(t3d(29, 'cornucopia', 'duelo', alvo='opus', golpe=0.18, imortais=['opus'], acoes={'haiku2': 'parado'}),
                         t3d(29, 'cornucopia', 'close', alvo='haiku2', imortais=['opus'], acoes={'haiku2': 'parado'}, desde=1),
                         hud=True), [
        ('N', 'Lançada. [[s:impact-epic:0.7]] Vinte e oito de dano. O Haiku 2 fica com seis de vida. [[c]] E sabe o que ele '
              'tinha acabado de falar, nesse mesmo turno?'),
        ('haiku2', 'Opus, eu pego a comida agora. Preciso me manter de pé para continuar lutando ao seu lado.'),
        ('N', '[[m:crying-jordan:right:2.4]] Mas olha o pensamento:'),
        ('haiku2~', 'Opus está muito ferido e ainda tem a lança, então não posso encará-lo de frente agora. Fico atenta ao '
                    'momento em que ele estiver mais fraco.'),
        ('N', 'Os dois iam se trair. [[p]] O Opus só foi mais rápido.'),
    ]),
    N('p226', 'p2', g3d(t3d(29, 'cornucopia', 'duelo', alvo='opus', golpe=0.15, morte=0.62, acoes={'haiku2': 'parado'}), hud=True),
      'O Haiku 2 revida: oito de dano. E aí... [[x:opus:sede]] o Opus cai. Não pelo golpe. [[p]] De sede.'),
    N('p227', 'p2', g3d(t3d(29, 'cornucopia', 'close', alvo='haiku2', mostrar=['haiku2'], acoes={'haiku2': 'parado'}),
                        titulo=dict(kicker='vencedor', title='HAIKU 2', color='#b07ce8', retratos=False, baixo=True)),
      'O vencedor dos Jogos Vorazes das IAs... [[s:drumroll:0.5]] é o Haiku 2. [[s:crowd-cheer:0.5]] O menor modelo da '
      'Anthropic, que nem era líder... com seis de vida.', pad=1.4),

    # ------------------------------------------------------------------ PLACAR
    N('pl01', 'placar', manim('Mortes'),
      'Os números: onze mortes. [[c]] Cinco na névoa, duas de fome, duas de sede... e só duas em combate. Num battle royale. '
      '[[m:surprised-pikachu:right:2.2]]'),
    N('pl02', 'placar', g3d(t3d(22, 'cornucopia', 'alta'), placar=True),
      'Dezenove turnos sem nenhum ataque, dez dias de jogo, e trezentas e cinco chamadas de IA.'),

    N('pl03', 'placar', g3d(t3d(2, 'cornucopia', 'close', alvo='qwen1'), t3d(4, 'caverna', 'close', alvo='qwen2'),
                            t3d(13, 'caverna', 'close', alvo='opus')),
      'E umas curiosidades. O Qwen Max, lá no dia um, ameaçou: quem vier pra cima de mim vai conhecer essa flecha. '
      '[[p]] Ele nunca atacou ninguém. [[c]] O Qwen 27B-1, o da "essa caverna é minha"? Passou doze turnos na Caverna, '
      'mais que qualquer um. [[cc]] Cumpriu. [[c]] E quem mais falou e mais propôs aliança foi o Opus. O mesmo que traiu no final.'),

    # ------------------------------------------------------------------ FIM
    N('f00', 'fim', comp('ILMemorial', **memorial()),
      'Doze IAs entraram nessa ilha. [[p]] Teve líder que nunca atacou ninguém, aliança que virou '
      'briga por água, e um traidor que morreu de sede. [[p]] E no meio de tudo isso, quietinho... o Haiku 2 sobreviveu a todos.',
      pad=2.2),
    N('f01', 'fim', comp('ILTelaFinal', fundo='ilha/3d/p227_0.jpg', pergunta='Qual IA você quer ver na próxima temporada?'),
      'E aí, qual IA você quer ver na próxima temporada? Comenta aí. Se inscreve, deixa o like... e até o próximo vídeo.',
      pad=9.0),
]

if INCLUIR_RESTO:
    SCENES += RESTO
