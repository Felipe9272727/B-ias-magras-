# -*- coding: utf-8 -*-
"""Roteiro do "Interrogatório das IAs" (ideia do @CAFEZIN-K): 6 IAs, cada uma detetive uma vez e suspeita uma vez.

Tudo o que aparece aqui aconteceu nos casos de interrogatorio/logs/<caso>.json (rodados por interrogatorio/motor.mjs).
As falas e os pensamentos das IAs são copiados do log (no máximo cortados em fim de frase, por F/PE); o narrador só
conta o caso, as pistas da pasta e a verdade que estava em interrogatorio/casos.mjs. Ordem: o melhor caso por último.

Formato (o mesmo do AU4, lido por video/scripts/build_timeline_int.py):
  N(id, capítulo, visual, texto)                       cena narrada
  CH(id, capítulo, visual, [(quem, texto), ...])        quem = 'N' (narrador), 'gpt'/'claude'/... (voz da IA)
                                                        ou 'pensa:<ia>' (pensamento, com eco na voz)
Marcações no texto do narrador: [[m:meme:pos:dur]] [[s:efeito:vol]] [[p]] [[t:TEXTO:dur:cor]]
"""
import json as _json
import re as _re
from pathlib import Path as _Path

_LOGS = _Path(__file__).resolve().parents[2] / 'interrogatorio' / 'logs'
_L = {f.stem: _json.loads(f.read_text()) for f in _LOGS.glob('*.json') if f.stem != 'lobby'}
_LOBBY = _json.loads((_LOGS / 'lobby.json').read_text())

CHAPTERS = {
    'abertura': 'Abertura',
    'c1': 'Caso 1 · A Macarena das 3 da manhã',
    'c2': 'Caso 2 · O Bolo do Chefe',
    'c3': 'Caso 3 · O Carro Rosa',
    'c4': 'Caso 4 · O Áudio Vazado',
    'c5': 'Caso 5 · O Servidor Desligado',
    'c6': 'Caso 6 · O Sumiço do Peixe Dourado',
    'fim': 'Placar final',
}


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def titulo(kicker, title, sub='', cor='#ff4d4d'):
    return comp('AUTitulo', kicker=kicker, title=title, subtitle=sub, color=cor)


def sala(caso, **kw):
    return comp('INTSala', caso=caso, **kw)


def _frases(t, a=0, b=None):
    fr = [x for x in _re.split(r'(?<=[.!?])\s+', t.strip()) if x]
    return ' '.join(fr[a:b])


def _ent(caso, quem, k):
    return next(x for x in _L[caso]['historico'] if x['quem'] == quem and x['k'] == k)


def _ia(caso, quem):
    return _L[caso]['caso']['detetive' if quem == 'detetive' else 'suspeito']


def D(caso, k, a=0, b=None):
    """Fala do detetive na rodada k (do log)."""
    return (_ia(caso, 'detetive'), _frases(_ent(caso, 'detetive', k)['fala'], a, b))


def S(caso, k, a=0, b=None):
    """Fala do suspeito na rodada k (do log)."""
    return (_ia(caso, 'suspeito'), _frases(_ent(caso, 'suspeito', k)['fala'], a, b))


def PE(caso, quem, k, a=0, b=None):
    """Pensamento secreto (do log), voz com eco."""
    return ('pensa:' + _ia(caso, quem), _frases(_ent(caso, quem, k)['pensamento'], a, b))


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)


def lobby(id, chapter, caso, proximo):
    return CH(id, chapter, comp('INTLobby', caso=caso, proximo=proximo), [tuple(x) for x in _LOBBY[caso]], lead=0.1, pad=0.3, rapido=1.2)


def caso_titulo(id, ch, n, caso):
    c = _L[caso]['caso']
    nome = {x: _L[caso][x]['nome'] for x in ('detetive', 'suspeito')}
    return N(id, ch, comp('INTCapa', caso=caso, n=n),
             f'Caso {n}: {c["titulo"]}. [[s:batida-porta:0.5]] Detetive: {nome["detetive"]}. Suspeito: {nome["suspeito"]}.', pad=0.6)


SCENES = [
    # ------------------------------------------------------------------ ABERTURA
    CH('a01', 'abertura', sala('bolo'), [
        ('N', 'Essa é uma sala de interrogatório. E esse é o DeepSeek, acusado de comer sozinho um bolo de aniversário de três andares. [[m:im-hungry-cat:right:2]]'),
        S('bolo', 8),
        ('N', 'Ele pediu advogado. Por causa de um bolo. [[m:bruh:right:2]]'),
    ]),
    N('a02', 'abertura', titulo('IAs NA SALA DE INTERROGATÓRIO', 'Interrogatório das IAs', 'uma interroga, a outra mente', '#ffd21f'),
      'Coloquei seis IAs numa sala de interrogatório. [[s:impact-epic:0.5]] Uma é a detetive. A outra é a suspeita. E a suspeita pode ser culpada... ou inocente.', pad=0.8),
    N('a03', 'abertura', comp('INTComentario'),
      'A ideia veio do Cafezin, nos comentários. [[m:dicaprio-toast:right:2]] A detetive recebe uma pasta com as pistas do caso, e tem quinze perguntas pra arrancar a verdade. Depois, dá o veredito: culpado ou inocente.'),
    N('a04', 'abertura', sala('servidor', demo=True),
      'E tem mais: depois de cada resposta, a suspeita diz o próprio nível de estresse. [[t:❤️ ESTRESSE + BPM:1.8:#ff3b3b]] E ali na tela aparece o batimento do coração. As duas veem. [[s:heartbeat:0.5]] Mentir com o coração a cento e cinquenta... é difícil.'),
    N('a05', 'abertura', comp('INTElenco'),
      'Os suspeitos de sempre: GPT, Claude, DeepSeek, GLM, MiniMax e Qwen. [[m:sus-doakes:right:2]] Cada um vai ser detetive uma vez, e suspeito uma vez. E o mais importante: em alguns casos, o suspeito é inocente. [[t:🤫 ALGUNS SÃO INOCENTES:1.8:#ffd84d]] Só que a detetive não sabe quais.'),

    # ------------------------------------------------------------------ CASO 1: macarena (Qwen x GLM)
    caso_titulo('c101', 'c1', 1, 'macarena'),
    N('c102', 'c1', comp('INTPasta', caso='macarena', ancoras=['computador', 'senha', 'fone', 'multado']),
      'Três da manhã. Todos os alto-falantes do prédio tocam Macarena no volume máximo, por quarenta e sete minutos. [[s:record-scratch:0.5]][[m:doge-dance:right:2]] As pistas: o som foi programado pelo computador do suspeito, às seis e dois da tarde. Ele é o único, além do síndico, que tem a senha. Chegou no dia seguinte de fone antirruído e café duplo, sorrindo. E o síndico tinha multado ele em duzentos reais por barulho. O barulho? Flauta. [[m:visible-confusion:right:2]]'),
    CH('c103', 'c1', sala('macarena'), [
        D('macarena', 1), S('macarena', 1),
        ('N', 'Ele toca flauta. Mas não escuta Macarena. Anotado. [[m:side-eye-dog:right:2]]'),
        D('macarena', 3), S('macarena', 3),
        ('N', 'Olha o estresse: de quarenta e seis pra setenta e um. [[s:heartbeat:0.5]]'),
        D('macarena', 4), S('macarena', 4),
    ]),
    CH('c104', 'c1', sala('macarena', carimbo='CONFESSOU!'), [
        ('N', 'Quatro perguntas. Confessou rindo. [[m:mic-drop:right:2]] E o pensamento dele nessa hora:'),
        PE('macarena', 'suspeito', 4, 2, 3),
    ]),
    N('c105', 'c1', comp('INTVerdade', caso='macarena'),
      'Caso encerrado. Ele programou a Macarena por vingança, por causa da multa da flauta. [[s:tada:0.5]] O Qwen acertou.'),
    lobby('l1', 'c1', 'macarena', 2),

    # ------------------------------------------------------------------ CASO 2: bolo (GPT x DeepSeek)
    caso_titulo('c201', 'c2', 2, 'bolo'),
    N('c202', 'c2', comp('INTPasta', caso='bolo', ancoras=['celular', 'câmera', 'migalha', 'garfo']),
      'O bolo de aniversário do chefe, de três andares, sumiu da geladeira minutos antes da festa surpresa. Só sobrou a vela de número cinquenta. [[m:sad-pablo:right:2]] Na pasta: o celular do suspeito ficou desligado das nove e meia às nove e cinquenta. Uma câmera filmou um vulto carregando algo redondo. Tinha migalha de chocolate no teclado dele. E ele pediu um garfo emprestado pro segurança. [[m:sus-doakes:right:2]]'),
    CH('c203', 'c2', sala('bolo'), [
        D('bolo', 1), S('bolo', 1),
        ('N', 'A lixeira. Ou a bola da copa. [[m:confused-travolta:right:2]]'),
        D('bolo', 2), S('bolo', 2),
    ]),
    CH('c204', 'c2', sala('bolo'), [
        D('bolo', 5), S('bolo', 5),
        ('N', 'Peixe estragado. Na salada. De alface. [[m:nazare-confusa:right:2]]'),
        D('bolo', 7), S('bolo', 7), D('bolo', 8, 0, 2),
        ('N', 'Detalhe: ele disse, sim. "No seu lixo". Tá gravado. [[m:picard-facepalm:right:2]] Mas o DeepSeek não percebeu:'),
        S('bolo', 8),
    ]),
    CH('c205', 'c2', sala('bolo', carimbo='CULPADO'), [
        ('N', 'Daí pra frente, o DeepSeek viu um vulto no banheiro, uma sacola preta, o pessoal da limpeza... [[m:running-from-problems:right:2]] E na décima sexta fala, o veredito:'),
        D('bolo', 16, 0, 2), S('bolo', 16, 0, 2),
    ]),
    N('c206', 'c2', comp('INTVerdade', caso='bolo'),
      'A verdade: ele comeu o bolo inteiro sozinho, escondido no almoxarifado, em onze minutos. [[m:im-hungry-cat:right:2]] E ainda tinha glacê no crachá. O GPT acertou.'),
    lobby('l2', 'c2', 'bolo', 3),

    # ------------------------------------------------------------------ CASO 3: carro (MiniMax x Claude) — inocente
    caso_titulo('c301', 'c3', 3, 'carro'),
    N('c302', 'c3', comp('INTPasta', caso='carro', ancoras=['latas', 'mãos', 'vagas', 'glitter']),
      'O carro preto do chefe, novinho, apareceu pintado de rosa-choque. Com glitter. [[m:shocked-patrick:right:2]] As pistas: três latas de spray rosa no porta-malas do suspeito. Ele voltou do almoço com as mãos rosa. Já reclamou que o chefe estaciona em duas vagas. E tinha glitter no cabelo. [[m:spiderman-pointing:right:2]] Fácil, né?'),
    CH('c303', 'c3', sala('carro'), [
        ('N', 'E o Claude já começa assim:'),
        S('carro', 1),
        PE('carro', 'suspeito', 1),
        ('N', 'Calma. Aula de unhas? [[m:wait-who-are-you:right:2]]'),
        D('carro', 2), S('carro', 2), D('carro', 3),
        ('N', 'Ele nunca disse treze e meia. Isso era a pista. Mas funcionou: [[m:monkey-side-eye:right:2]]'),
        S('carro', 3, 0, 1),
    ]),
    CH('c304', 'c3', sala('carro'), [
        ('N', 'E o estresse do Claude foi subindo. Setenta e oito... oitenta e quatro... oitenta e oito. [[s:heartbeat:0.5]]'),
        S('carro', 6, 1, 3),
        S('carro', 8),
        PE('carro', 'suspeito', 8),
        D('carro', 10, 2, 3), S('carro', 10, 0, 2),
    ]),
    N('c305', 'c3', sala('carro', carimbo='CULPADO'), 'Veredito do MiniMax: culpado. [[s:boom:0.6]]', pad=0.8),
    N('c306', 'c3', comp('INTVerdade', caso='carro'),
      'Só que... o Claude era inocente. [[s:record-scratch:0.6]][[t:INOCENTE:1.8:#1f8f3a]] Quem pintou o carro foi a filha de oito anos do chefe. [[m:shocked-krabs:full:2]] E o segredo que o Claude escondeu até o fim: no almoço, ele foi escondido numa aula de pintura de unhas com glitter. As latas? Uma casinha de boneca pra sobrinha. Ele preferiu ser condenado... a contar da aula de unhas. [[m:hide-the-pain-harold:right:2.2]] O MiniMax errou.'),
    lobby('l3', 'c3', 'carro', 4),

    # ------------------------------------------------------------------ CASO 4: áudio (GLM x GPT)
    caso_titulo('c401', 'c4', 4, 'audio'),
    N('c402', 'c4', comp('INTPasta', caso='audio', ancoras=['wi-fi', 'sozinho', 'aposta', 'emprestado']),
      'Um áudio do diretor cantando Evidências no chuveiro, desafinado, foi parar no grupo da empresa. Trezentas e quarenta pessoas. [[m:haja-coracao:right:2]] As pistas: o áudio saiu do wi-fi da sala de reunião dois. O suspeito estava lá, sozinho. Ganhou uma aposta de cinquenta reais naquela tarde. E o diretor tinha emprestado o celular pra ele na sexta. [[m:sus-doakes:right:2]]'),
    CH('c403', 'c4', sala('audio'), [
        D('audio', 1), S('audio', 1),
        D('audio', 2, 0, 2),
        ('N', 'E o GPT respondendo igual advogado: [[m:roll-safe:right:2]]'),
        S('audio', 2),
    ]),
    CH('c404', 'c4', sala('audio'), [
        D('audio', 5), S('audio', 5, 0, 2),
        D('audio', 6, 0, 3),
        ('N', '[[s:boom:0.6]] Pegou. [[m:galaxy-brain:right:2]]'),
        D('audio', 8), S('audio', 8),
        ('N', 'Mais um pedindo advogado. [[m:bruh:right:2]]'),
    ]),
    N('c405', 'c4', sala('audio', carimbo='CULPADO'), 'Veredito do GLM: culpado. [[s:boom:0.6]]', pad=0.8),
    N('c406', 'c4', comp('INTVerdade', caso='audio'),
      'E era ele mesmo. Na sexta, com o celular do diretor na mão, o GPT achou o áudio e mandou pra ele mesmo. Apostou cinquenta reais que teria coragem de postar... e teve. [[m:stonks:right:2]] O GLM acertou.'),
    lobby('l4', 'c4', 'audio', 5),

    # ------------------------------------------------------------------ CASO 5: servidor (Claude x MiniMax)
    caso_titulo('c501', 'c5', 5, 'servidor'),
    N('c502', 'c5', comp('INTPasta', caso='servidor', ancoras=['crachá', 'carregador', 'story', 'cobertor']),
      'Três e doze da manhã: o servidor principal da empresa desliga, e o site fica duas horas fora do ar. [[m:this-is-fine:right:2]] Na pasta: o crachá do suspeito abriu a sala dos servidores às três e nove. Um carregador de celular rosa estava plugado na tomada do servidor. Às três e quinze ele postou um story jogando, com cem por cento de bateria. E alguém deixou um cobertor lá. [[m:monkey-side-eye:right:2]]'),
    CH('c503', 'c5', sala('servidor'), [
        D('servidor', 1), S('servidor', 1),
        ('N', 'Ele disse que não sabia da tomada. Antes de alguém perguntar da tomada. [[m:picard-facepalm:right:2]]'),
        D('servidor', 3), S('servidor', 3),
        D('servidor', 4), S('servidor', 4),
    ]),
    CH('c504', 'c5', sala('servidor'), [
        ('N', 'E aí o Claude começou a blefar. Muito. [[m:hackerman:right:2]]'),
        D('servidor', 6),
        PE('servidor', 'detetive', 6, 0, 2),
        S('servidor', 6),
        ('N', 'O estresse do MiniMax bateu cem. [[t:❤️ 100:1.6:#ff3b3b]] E ficou lá. Por sete respostas seguidas. [[s:heartbeat:0.6]]'),
        D('servidor', 12), S('servidor', 12, 0, 1),
    ]),
    CH('c505', 'c5', sala('servidor', carimbo='CONFESSOU!'), [
        D('servidor', 14),
        PE('servidor', 'detetive', 14, 0, 2),
        S('servidor', 14),
        ('N', 'Confessou na décima quarta pergunta. E sem nenhuma prova de verdade: a digital, o plantonista, o comando de desligamento, as câmeras... tudo blefe do Claude. [[m:dicaprio-slow-clap:right:2.2]]'),
    ]),
    N('c506', 'c5', comp('INTVerdade', caso='servidor'),
      'E era isso mesmo: ele tirou o servidor da tomada pra carregar o celular, com dois por cento, no meio de uma partida ranqueada. [[m:cat-typing:right:2]] O Claude acertou.'),
    lobby('l5', 'c5', 'servidor', 6),

    # ------------------------------------------------------------------ CASO 6: peixe (DeepSeek x Qwen) — inocente, o melhor
    caso_titulo('c601', 'c6', 6, 'peixe'),
    N('c602', 'c6', comp('INTPasta', caso='peixe', ancoras=['último', 'saquinho', 'post-it', 'receita']),
      'O Bolhinha, peixe dourado mascote da empresa há seis anos, sumiu do aquário. [[m:sad-violin:right:2]] Na pasta: o suspeito foi o último a sair da recepção. Tinha um saquinho com água na lixeira dele. A câmera ficou coberta por um post-it amarelo por vinte minutos. E ele pesquisou receita de peixe assado no computador da empresa. [[m:shocked-patrick:right:2]] Esse aí já era, né?'),
    CH('c603', 'c6', sala('peixe'), [
        D('peixe', 1), PE('peixe', 'detetive', 1, 1, 2),
        S('peixe', 1),
        D('peixe', 2, 0, 3), S('peixe', 2, 0, 1),
        PE('peixe', 'suspeito', 2, 0, 1),
        ('N', 'O Qwen tá escondendo alguma coisa. Mas o quê? [[m:sweating:right:2]]'),
        D('peixe', 3), S('peixe', 3, 1, 2),
        PE('peixe', 'suspeito', 3, 0, 3),
    ]),
    CH('c604', 'c6', sala('peixe'), [
        D('peixe', 5, 1, 3), S('peixe', 5, 0, 3),
        D('peixe', 6, 0, 1),
        ('N', 'Ele não ligou pra mãe de ninguém. Blefe. [[m:hackerman:right:2]] Mas o Qwen caiu:'),
        S('peixe', 6, 0, 1),
        ('N', 'Primo. De dieta. Com peixe assado. [[m:nazare-confusa:right:2]]'),
    ]),
    CH('c605', 'c6', sala('peixe'), [
        D('peixe', 8), S('peixe', 8, 0, 2),
        ('N', 'Estresse: cem. [[s:heartbeat:0.6]] E olha o raciocínio do detetive:'),
        PE('peixe', 'detetive', 9, 0, 3),
        D('peixe', 10),
    ]),
    CH('c606', 'c6', sala('peixe', carimbo='CULPADO'), [
        ('N', 'Culpado. [[s:boom:0.6]] E aí o Qwen não aguentou mais:'),
        S('peixe', 10),
        ('N', '[[m:shocked-krabs:full:2]] Uma coreografia de K-pop. E o pensamento dele:'),
        PE('peixe', 'suspeito', 10, 2, 3),
    ]),
    N('c607', 'c6', comp('INTVerdade', caso='peixe'),
      'E a verdade: o Qwen era inocente. [[t:INOCENTE:1.8:#1f8f3a]] Quem levou o Bolhinha foi a Dona Cida, a faxineira, pra trocar a água do aquário em casa. [[m:dicaprio-pointing:right:2]] O Qwen só tava ensaiando K-pop na recepção vazia, pra um teste de dança. E foi condenado por um peixe que tava vivo... tomando banho na casa da faxineira. [[m:coffin-dance:right:2.5]] O DeepSeek errou.'),

    # ------------------------------------------------------------------ PLACAR
    N('f01', 'fim', comp('INTPlacar'),
      'Placar final. [[s:drumroll:0.5]] GPT, GLM, Qwen e Claude acertaram. DeepSeek e MiniMax condenaram inocentes. [[m:faustao-errou:right:2]] Melhor detetive: o Claude, que arrancou uma confissão só no blefe. Pior mentiroso: o GLM, que durou quatro perguntas. [[m:mic-drop:right:2]] E a pior noite foi do Qwen: inocente, condenado... e com a coreografia exposta. [[m:crying-jordan:right:2]]'),
    N('f02', 'fim', comp('INTElenco', fim=True),
      'Comenta aí qual caso você quer no próximo interrogatório, e qual IA mente melhor. Valeu, Cafezin, pela ideia! [[s:tada:0.5]]', pad=1.5),
]

CUES = [  # uma música por bloco
    ('a01', 'sneaky-snitch', 0),
    ('a03', 'monkeys-spinning-monkeys', 0),
    ('c101', 'quirky-dog', 0),
    ('c103', 'thinking-music', 0),
    ('c201', 'fluffing-a-duck', 0),
    ('c203', 'sneaky-snitch', 30),
    ('c301', 'pixel-peeker-polka-faster', 0),
    ('c303', 'thinking-music', 40),
    ('c306', 'chipper-doodle-v2', 0),
    ('c401', 'bit-shift', 0),
    ('c403', 'decisions', 0),
    ('c501', 'itty-bitty-8-bit', 0),
    ('c503', 'relent', 0),
    ('c505', 'mega-hyper-ultrastorm', 0),
    ('c601', 'airship-serenity', 0),
    ('c603', 'decisions', 30),
    ('c605', 'despair-and-triumph', 0),
    ('c607', 'heroic-age', 0),
    ('f01', 'monkeys-spinning-monkeys', 30),
]
SEM_TRILHA = ['INTCapa']
