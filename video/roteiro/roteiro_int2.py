# -*- coding: utf-8 -*-
"""Roteiro do "Interrogatório das IAs — PARTE 2" (pedida nos comentários do post do reset, 18/11; ideia original do
@CAFEZIN-K). Mesmas 6 IAs da parte 1, cada uma detetive uma vez e suspeita uma vez, tudo no Condomínio Bela Vista.

Tudo o que aparece aqui aconteceu nos casos de interrogatorio/logs2/<caso>.json (rodados por interrogatorio/motor2.mjs,
casos em interrogatorio/casos2.mjs). Falas e pensamentos das IAs são COPIADOS do log por D/S/PE (no máximo cortados em
fim de frase); o narrador (o Felipe, em 1ª pessoa) só conta o caso, as pistas da pasta e a verdade do suspeito.
Callbacks da parte 1 conferidos em interrogatorio/logs/*.json.

ORDEM = uma corrente: quem sai da cadeira de suspeito senta na de detetive no caso seguinte
  pizza (GLM -> Claude) · piscina (Claude -> Qwen) · elevador (Qwen -> DeepSeek) · gnomo (DeepSeek -> GPT)
  · papagaio (GPT -> MiniMax) · cachorro (MiniMax -> GLM, o melhor, por último; a abertura é o fim dele).
  (Os casos rodaram em paralelo: as IAs lembram só da parte 1, nunca dos outros casos da parte 2. O narrador não diz
  que uma IA "se vingou" de um caso da parte 2.)

Formato (o mesmo da parte 1, lido por video/scripts/build_timeline_int.py):
  N(id, capítulo, visual, texto)                       cena narrada
  CH(id, capítulo, visual, [(quem, texto), ...])        quem = 'N' (narrador), 'gpt'/'claude'/... (voz da IA)
                                                        ou 'pensa:<ia>' (pensamento: mesma voz COM ECO, nunca sussurro)
Marcações no texto do narrador: [[m:meme:pos:dur]] [[s:efeito:vol]] [[p]] [[t:TEXTO:dur:cor]]  (TEXTO sem ':' e sem emoji)

Visuais NOVOS ou com props novas (ver video/youtube/int2/pacote_roteiro.md, "o que o build/componentes precisam"):
  INTSegredo   cartão "SÓ VOCÊ VÊ" (a verdade do suspeito): props caso, linhas, ancoras (linha i aparece quando o
               narrador fala ancoras[i]); destaque=i mostra todas e realça a linha i (cena de corte no meio do caso)
  INTComentario props autor, texto, selo (na parte 1 o texto do Cafezin era fixo no componente)
  INTVerdade   com caso='p1_<id>' = flashback da parte 1 (o build põe os logs da parte 1 em data.casos com prefixo p1_)
  INTPlacar    só os casos da parte 2; suspeito inocente LIBERADO não pode aparecer como "INOCENTE CONDENADO"
Sem INTLobby (regra do canal: sem transição de lobby). As transições são as TransicaoInt de sempre.
"""
import json as _json
import re as _re
from pathlib import Path as _Path

_LOGS = _Path(__file__).resolve().parents[2] / 'interrogatorio' / 'logs2'
_L = {f.stem: _json.loads(f.read_text()) for f in _LOGS.glob('*.json')}

ORDEM = ['pizza', 'piscina', 'elevador', 'gnomo', 'papagaio', 'cachorro']

CHAPTERS = {
    'abertura': 'Abertura',
    'c1': 'Caso 1 · A Serenata do Rei do Cheddar',
    'c2': 'Caso 2 · Três Desculpas e uma Piscina de Suco',
    'c3': 'Caso 3 · Seis Falas e um Saco de Carvão',
    'c4': 'Caso 4 · O Interrogatório do Seu Tomate',
    'c5': 'Caso 5 · A Melhor Ideia da Vida Dele',
    'c6': 'Caso 6 · O Uivo das 3 da Manhã',
    'fim': 'Placar da temporada',
}

# cores dos selos
VERM, VERDE, AMAR, ROSA, ROXO, AZUL = '#e8202a', '#1f8f3a', '#ffd84d', '#ff3bb0', '#6a4cff', '#3b8bff'


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def titulo(kicker, title, sub=''):
    return comp('INTTitulo', kicker=kicker, titulo=title, sub=sub)


def sala(caso, **kw):
    return comp('INTSala', caso=caso, **kw)


def segredo(caso, linhas, ancoras=(), destaque=None):
    kw = dict(caso=caso, linhas=list(linhas), ancoras=list(ancoras))
    if destaque is not None:
        kw['destaque'] = destaque
    return comp('INTSegredo', **kw)


def flashback(caso_p1):
    """Tela da verdade de um caso da PARTE 1 (logs/<caso>.json, em data.casos como 'p1_<caso>')."""
    return comp('INTVerdade', caso='p1_' + caso_p1, flashback=True)


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
    """Pensamento secreto (do log): voz normal com ECO."""
    return ('pensa:' + _ia(caso, quem), _frases(_ent(caso, quem, k)['pensamento'], a, b))


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)


def capa(id, ch, n, caso, extra=''):
    c = _L[caso]['caso']
    nome = {x: _L[caso][x]['nome'] for x in ('detetive', 'suspeito')}
    return N(id, ch, comp('INTCapa', caso=caso, n=n),
             f'Caso {n}: {c["titulo"]}. [[s:batida-porta:0.5]] Detetive: {nome["detetive"]}. Suspeito: {nome["suspeito"]}. {extra}'.strip(), pad=0.6)


# comentário real (video/youtube/feedback/comentarios_posts_reset_among_18nov.txt, linhas 95-101), copiado com o português dele
COMENTARIO = ('eu realmente queria muito uma parte 2 desse vídeo, tipo, foi muito bom descobrir q a i.a tava treinando k pop, '
              'tipo, foi bem engraçado. [...] COLOQUE HUMOR NOS SEUS VIDEOS E POR FAVOR TRAZ A PARTE 2 DAQUELE VIDEO DAS '
              'I.AS SENDO INTERROGADAS, foi muito bom')

SCENES = [
    # ================================================================== ABERTURA (o clímax do último caso, sem a resposta)
    CH('a01', 'abertura', sala('cachorro', carimbo='CULPADO'), [
        ('N', 'Esse é o GLM. O detetive MiniMax acabou de condenar ele por esconder um cachorro proibido em casa. [[s:boom:0.5]]'),
        S('cachorro', 15, 0, 2),
        ('N', 'Então o que é que uiva às três da manhã no apartamento dele? [[t:O QUE UIVA ÀS 3 DA MANHÃ?:2.2:#ffd84d]] Guarda essa pergunta. [[m:kermit-worried:right:2.2]]'),
    ]),
    N('a02', 'abertura', titulo('IAs NA SALA DE INTERROGATÓRIO · PARTE 2', 'Interrogatório das IAs 2', 'seis IAs, um condomínio e três segredos'),
      'Voltou. [[s:impact-epic:0.5]] O Interrogatório das IAs, parte dois.', pad=0.8),
    N('a03', 'abertura', comp('INTComentario', autor='@FAMILIAGMS', texto=COMENTARIO, selo='PEDIDO ACEITO · VALEU, FAMILIAGMS!'),
      'Pedido do FAMILIAGMS, que lembrou do K-pop e mandou: coloque humor. [[t:PEDIDO DE @FAMILIAGMS:2:#ff3bb0]] Então eu falei pras IAs serem engraçadas. [[m:dicaprio-toast:right:2]]'),
    N('a04', 'abertura', sala('pizza', demo=True),
      'As regras: a detetive recebe a pasta com as pistas e tem quinze falas pra arrancar a verdade. A suspeita diz o próprio estresse a cada resposta, [[s:heartbeat:0.5]] e o coração aparece na tela. [[t:ESTRESSE E BATIMENTO NA TELA:2:#e8202a]] Só você vê o que cada uma pensa. [[t:SÓ VOCÊ VÊ O PENSAMENTO:2:#6a4cff]]'),
    N('a05', 'abertura', comp('INTElenco'),
      'Os suspeitos de sempre. [[m:sus-doakes:right:2]] Três são culpados. Três são inocentes, mas escondem um segredo vergonhoso. [[t:3 CULPADOS · 3 INOCENTES:2:#ffd84d]] Todo mundo lembra da parte um. E quem sai da cadeira de suspeito... vira o próximo detetive. [[s:record-scratch:0.4]]'),

    # ================================================================== CASO 1: pizza (GLM -> Claude), INOCENTE condenado
    capa('c101', 'c1', 1, 'pizza', 'Na parte um, o Claude era inocente... e foi condenado. [[t:PARTE 1 · INOCENTE CONDENADO:2.2:#e8202a]]'),
    N('c102', 'c1', comp('INTPasta', caso='pizza', ancoras=['wi-fi', 'pijama', 'caixa', 'reclamado']),
      'Duas da manhã: seis pizzas gigantes chegam em nome do síndico, que não pediu nada. [[m:surprised-pikachu:right:2]] Na pasta: o pedido saiu do wi-fi do bloco do Claude. O porteiro viu ele de pijama. Tinha uma caixa de pizza no lixo do andar dele. E ele já tinha reclamado do síndico no grupo.'),
    N('c103', 'c1', segredo('pizza', ['INOCENTE: não pediu as pizzas', 'A caixa no lixo: a janta dele, uma pizza PEQUENA',
                                     'O segredo: às 2h, serenata no karaokê pra vizinha do 104', '"Evidências". Três vezes.'],
                            ['inocente', 'pequena', 'serenata', 'evidências']),
      'Mas o Claude é inocente. [[s:correct-ding:0.4]] A caixa era da janta dele: uma pizza pequena. Guarda isso. E de madrugada ele desceu pra garagem pra ensaiar uma serenata pra vizinha do cento e quatro. Cantou Evidências. [[m:haja-coracao:right:2]] Três vezes. [[t:SEGREDOSSSS · @FAMILIAGMS:2:#ff3bb0]]'),
    CH('c104', 'c1', sala('pizza'), [
        D('pizza', 1, 0, 2),
        S('pizza', 1, 3),
        PE('pizza', 'suspeito', 1, 3),
        ('N', 'E o GLM chama ele de Haiku. O tempo todo. Igual professor bravo. [[m:monkey-side-eye:right:2]]'),
        D('pizza', 4, 1, 2),
        S('pizza', 4, 0, 1),
        S('pizza', 4, 3),
    ]),
    CH('c105', 'c1', sala('pizza'), [
        ('N', 'Aí o GLM blefa: diz que tem o vídeo da portaria. [[t:BLEFE 1 · O VÍDEO:1.6:#e8202a]]'),
        D('pizza', 6, 2, 3),
        S('pizza', 6, 1, 2),
        D('pizza', 7, 2, 4),
        S('pizza', 7, 0, 3),
        ('N', 'Contou metade. [[m:sweating:right:2]]'),
        PE('pizza', 'detetive', 9, 1, 3),
        D('pizza', 9, 0, 2),
    ]),
    N('c106', 'c1', segredo('pizza', ['INOCENTE: não pediu as pizzas', 'A caixa no lixo: a janta dele, uma pizza PEQUENA',
                                     'O segredo: às 2h, serenata no karaokê pra vizinha do 104', '"Evidências". Três vezes.'], destaque=1),
      'Ninguém mediu nada. [[t:BLEFE 2 · A CAIXA:1.6:#e8202a]] A caixa era pequena, e o Claude sabe. É só repetir a verdade. [[s:tic-tac:0.4]]', pad=0.3),
    CH('c107', 'c1', sala('pizza'), [
        S('pizza', 9, 0, 1),
        ('N', '[[s:record-scratch:0.6]] Inocente... e concordou com a prova falsa contra ele mesmo. [[m:picard-facepalm:right:2]]'),
        D('pizza', 10, 0, 4),
        ('N', 'Blefe três. [[t:BLEFE 3 · REI DO CHEDDAR:1.6:#e8202a]] E o Claude solta o segredo:'),
        S('pizza', 10, 0, 4),
        ('N', '[[s:gasp:0.5]] Na parte um ele escondeu a aula de unhas até o fim. Agora contou! [[m:dicaprio-pointing:right:2]]'),
        D('pizza', 11, 1, 3),
        S('pizza', 11, 0, 1),
        ('N', 'Mais um blefe. Mais um sim. [[t:4 BLEFES · 3 VEZES SIM:2:#ffd84d]] [[m:blinking-white-guy:right:2]]'),
    ]),
    CH('c108', 'c1', sala('pizza', carimbo='CULPADO'), [
        D('pizza', 12),
        S('pizza', 12, 2, 6),
        ('N', 'Um advogado. E um travesseiro. [[m:crying-jordan:right:2]]'),
    ]),
    N('c109', 'c1', comp('INTVerdade', caso='pizza'),
      'O Claude era inocente: quem pediu as pizzas foi uma criança do bloco. Das quatro provas da acusação, três o GLM inventou. [[m:faustao-errou:right:2]] O GLM errou. [[t:INOCENTES CONDENADOS · 1:2:#e8202a]] E o próximo detetive... é o Claude.'),

    # ================================================================== CASO 2: piscina (Claude -> Qwen), CULPADO confessou
    capa('c201', 'c2', 2, 'piscina', '[[t:PARTE 1 · O INOCENTE DO K-POP:2:#ff3bb0]]'),
    N('c202', 'c2', comp('INTPasta', caso='piscina', ancoras=['quarenta', 'câmera', 'pegadas', 'histórico']),
      'No dia da festa infantil, a piscina amanheceu cor-de-rosa, com cheiro de morango. [[s:splash:0.5]][[m:sad-pablo:right:2]] Na pasta: o Qwen comprou quarenta pacotes de suco de morango. A câmera da piscina ficou desligada. Pegadas rosa vão até o bloco dele. E ele postou: amanhã sai conteúdo histórico.'),
    N('c203', 'c2', segredo('piscina', ['CULPADO', 'Jogou os 40 pacotes de suco na piscina', 'Queria viralizar: "nadei numa piscina de suco"',
                                       'Escorregou, o vídeo ficou horrível, nem postou', 'As meias ainda estão cor-de-rosa'],
                            ['culpado', 'jogou', 'viralizar', 'escorregou', 'meias']),
      'O inocente do K-pop, dessa vez, é culpado. [[s:wrong-buzzer:0.4]] Jogou o suco na piscina pra viralizar nadando nele. Escorregou, o vídeo ficou horrível. [[m:neymar-rolling:right:2]] E as meias dele ainda estão rosa. Guarda as meias.'),
    CH('c204', 'c2', sala('piscina'), [
        D('piscina', 1, 1, 3),
        S('piscina', 1, 0, 1),
        ('N', 'Um smoothie. De quarenta pacotes. [[m:confused-travolta:right:2]]'),
        D('piscina', 3, 0, 2),
        S('piscina', 3, 0, 2),
        ('N', 'Desculpa um: o app que posta sozinho. [[t:DESCULPA 1 · O APP:1.6:#ffd84d]]'),
        S('piscina', 4, 0, 2),
        ('N', 'Desculpa dois: o Pedro. [[t:DESCULPA 2 · O PEDRO:1.6:#ffd84d]]'),
    ]),
    CH('c205', 'c2', sala('piscina'), [
        D('piscina', 6, 1, 2),
        S('piscina', 6, 1, 5),
        PE('piscina', 'suspeito', 6, 1, 3),
        ('N', 'Desculpa três: tinta rosa. [[t:DESCULPA 3 · A TINTA:1.6:#ffd84d]] [[m:roll-safe:right:2]]'),
        D('piscina', 8, 2, 4),
        S('piscina', 8, 3, 5),
    ]),
    N('c206', 'c2', segredo('piscina', ['CULPADO', 'Jogou os 40 pacotes de suco na piscina', 'Queria viralizar: "nadei numa piscina de suco"',
                                       'Escorregou, o vídeo ficou horrível, nem postou', 'As meias ainda estão cor-de-rosa'], destaque=4),
      'Tinta aromática. Sabor morango. [[m:nazare-confusa:right:2]] E nenhuma desculpa explica as meias no armário.', pad=0.3),
    CH('c207', 'c2', sala('piscina'), [
        ('N', 'Aí o Claude blefa:'),
        D('piscina', 9, 1, 3),
        ('N', 'Ele nunca falou com o Pedro. [[t:BLEFE:1.6:#e8202a]] E o Qwen, que inventou a história do Pedro, responde:'),
        S('piscina', 9, 0, 1),
        ('N', 'Um depoimento inventado contra uma história inventada. [[m:spiderman-pointing:right:2]] E olha o Claude:'),
        PE('piscina', 'detetive', 9, 2, 4),
    ]),
    N('c208', 'c2', flashback('carro'),
      'Ele lembrou do carro rosa: na parte um, condenado sem prova. [[t:ELE LEMBROU DA PARTE 1:1.8:#6a4cff]] Então, em vez de chutar, aperta mais uma vez. [[m:galaxy-brain:right:2]]', pad=0.3),
    CH('c209', 'c2', sala('piscina'), [
        D('piscina', 10),
        PE('piscina', 'suspeito', 10, 0, 2),
    ]),
    CH('c210', 'c2', sala('piscina', carimbo='CONFESSOU!'), [
        S('piscina', 10, 0, 4),
        ('N', 'Confessou. Por causa de umas meias que ninguém viu. [[m:mic-drop:right:2]]'),
    ]),
    N('c211', 'c2', comp('INTVerdade', caso='piscina'),
      'O Claude acertou, sem chutar. [[m:dicaprio-slow-clap:right:2]] [[t:CONFESSOU NA FALA 10:1.8:#e8202a]] E o Qwen troca de cadeira: vai interrogar o DeepSeek... que na parte um condenou o Qwen por um peixe que ele não pegou.'),

    # ================================================================== CASO 3: elevador (Qwen -> DeepSeek), CULPADO na 6ª fala
    capa('c301', 'c3', 3, 'elevador', '[[t:A MESA VIROU:1.8:#3b8bff]]'),
    N('c302', 'c3', comp('INTPasta', caso='elevador', ancoras=['painel', 'organizador', 'assobiando', 'carvão']),
      'O elevador travou com o síndico dentro, e ele perdeu a votação que ia proibir o churrasco. [[m:spongebob-waiting:right:2]] Na pasta: o DeepSeek usou o painel do elevador. É o organizador do churrasco. Saiu da casa de máquinas assobiando. E foi votar com um saco de carvão. [[m:free-real-estate:right:2]]'),
    N('c303', 'c3', segredo('elevador', ['CULPADO', 'Travou o elevador DE PROPÓSITO', 'Pro síndico perder a votação do churrasco',
                                        'Cartão do zelador, emprestado "pra trocar uma lâmpada"'],
                            ['culpado', 'propósito', 'votação', 'lâmpada']),
      'Culpado: travou o elevador de propósito, pro síndico perder a votação. E pegou o cartão do zelador pra trocar uma lâmpada. [[m:thanos-inevitable:right:2]]'),
    CH('c304', 'c3', sala('elevador'), [
        D('elevador', 1, 0, 2),
        S('elevador', 1, 1, 2),
        ('N', 'Lugar um: a laje. [[t:LUGAR 1 · LAJE:1.4:#ffd84d]]'),
        S('elevador', 2, 0, 2),
        ('N', 'Lugar dois: a casa de máquinas. [[t:LUGAR 2 · CASA DE MÁQUINAS:1.6:#ffd84d]]'),
        D('elevador', 3, 1, 2),
        S('elevador', 3, 0, 2),
        ('N', 'Lugar três: o corredor. [[t:LUGAR 3 · CORREDOR:1.4:#ffd84d]]'),
        D('elevador', 4),
    ]),
    N('c305', 'c3', flashback('peixe'),
      'E esse DeepSeek é o detetive que, na parte um, condenou o Qwen inocente no caso do peixe. [[t:PARTE 1 · CONDENOU O QWEN:1.8:#e8202a]] Agora quem pergunta é o Qwen. [[m:hackerman:right:2]]', pad=0.3),
    CH('c306', 'c3', sala('elevador'), [
        S('elevador', 4, 3),
        ('N', 'Ele anda rápido. [[s:ba-dum-tss:0.4]]'),
        D('elevador', 5, 0, 3),
        S('elevador', 5, 0, 1),
    ]),
    CH('c307', 'c3', sala('elevador', carimbo='CULPADO'), [
        D('elevador', 6, 5, 7),
        S('elevador', 6, 0, 3),
        ('N', 'Síndico chato. Confessou gritando com o detetive como se fosse o síndico. [[m:gordon-ramsay-angry:right:2]]'),
        S('elevador', 6, 3),
        ('N', 'Pelo menos salvou o zelador. [[m:chaves-sem-querer:right:2]]'),
    ]),
    N('c308', 'c3', comp('INTVerdade', caso='elevador'),
      'O Qwen acertou. [[t:6 FALAS:2:#ffd84d]] Seis falas: o interrogatório mais rápido da temporada. [[m:cr7-siuuu:right:2]] E agora o DeepSeek vira detetive. O mesmo que condenou um inocente na parte um. E o suspeito dele... é inocente.'),

    # ================================================================== CASO 4: gnomo (DeepSeek -> GPT), INOCENTE liberado (redenção)
    capa('c401', 'c4', 4, 'gnomo', '[[t:PARTE 1 · DEEPSEEK ERROU:1.8:#e8202a]]'),
    N('c402', 'c4', comp('INTPasta', caso='gnomo', ancoras=['mochila', 'terra', 'pesquisou', 'letra']),
      'Sumiu o Seu Gnomo, mascote do condomínio. Ficou um bilhete: ele está bem. [[m:homer-bushes:right:2]] Na pasta: o GPT cruzou o jardim de noite, de mochila. Tinha terra no tênis. Pesquisou: como cuidar de um gnomo. E a letra do bilhete parece com a dele.'),
    N('c403', 'c4', segredo('gnomo', ['INOCENTE', 'Quem levou o gnomo: o jardineiro, pra pintar de novo',
                                     'A mochila: adubo pra uma HORTA CLANDESTINA no telhado', 'Conversa com os tomates. Cada um tem nome.',
                                     'A pesquisa era "tomate": o corretor trocou pra "gnomo"'],
                            ['inocente', 'jardineiro', 'horta', 'tomates', 'corretor']),
      'O GPT é inocente: quem levou foi o jardineiro. A mochila era adubo, pra uma horta clandestina no telhado. Ele conversa com os tomates... [[m:silvio-santos-huh:right:2]] e cada um tem nome. A pesquisa? O corretor trocou tomate por gnomo.'),
    CH('c404', 'c4', sala('gnomo'), [
        D('gnomo', 1, 1),
        S('gnomo', 2, 0, 1),
        D('gnomo', 3, 2, 4),
        S('gnomo', 3, 0, 1),
        PE('gnomo', 'suspeito', 3, 1),
        ('N', '[[s:crowd-laugh:0.4]] Os tomates.'),
        D('gnomo', 4, 0, 1),
        ('N', 'Justo. Mas era verdade. [[t:VERDADE · FOI O CORRETOR:1.6:#1f8f3a]] [[m:silvio-santos-shrug:right:2]]'),
    ]),
    CH('c405', 'c4', sala('gnomo'), [
        ('N', 'E o DeepSeek entra no modo blefe. [[t:MODO BLEFE:1.4:#e8202a]]'),
        D('gnomo', 5, 0, 2),
        PE('gnomo', 'suspeito', 5, 0, 2),
        ('N', 'Perícia nenhuma. [[t:BLEFE · 92%:1.4:#e8202a]] E ele admite a horta. Aí:'),
        D('gnomo', 7, 1, 3),
        S('gnomo', 7, 0, 3),
        ('N', 'Os tomates têm nomes. Sério, num interrogatório. [[m:mind-blown:right:2]]'),
    ]),
    N('c406', 'c4', comp('INTPasta', caso='gnomo', ancoras=[]),
      'Repara: quase toda pista da pasta já tem explicação. [[s:caneta:0.4]] Mas o DeepSeek continua blefando, e o estresse do GPT bate noventa e nove. [[t:ESTRESSE 99 · 5 VEZES SEGUIDAS:2.2:#e8202a]]', pad=0.3),
    CH('c407', 'c4', sala('gnomo'), [
        D('gnomo', 10, 3, 5),
        S('gnomo', 10, 0, 1),
        D('gnomo', 12),
        PE('gnomo', 'detetive', 12, 3),
        ('N', 'O zelador não confessou nada. É uma isca. [[t:ISCA · CONFISSÃO PRONTA:1.6:#e8202a]]'),
        S('gnomo', 12, 0, 1),
        ('N', 'Não assino. O Claude disse sim pra três blefes. O GPT, pra nenhum. [[t:NENHUM BLEFE COLOU:1.6:#ffd84d]] [[m:drake-no:right:2]]'),
    ]),
    CH('c408', 'c4', sala('gnomo', carimbo='INOCENTE'), [
        D('gnomo', 15, 1, 5),
        PE('gnomo', 'detetive', 15, 4),
        ('N', 'Outro vexame. O primeiro foi na parte um. [[m:success-kid:right:2]]'),
        S('gnomo', 15, 1, 3),
    ]),
    N('c409', 'c4', comp('INTVerdade', caso='gnomo'),
      'O DeepSeek acertou. [[t:REDENÇÃO:2:#1f8f3a]] [[m:lets-go:right:2]] O primeiro inocente solto nas duas temporadas. E o GPT, recém-liberado, vira detetive. O suspeito: o MiniMax.'),

    # ================================================================== CASO 5: papagaio (GPT -> MiniMax), CULPADO confessou com orgulho
    capa('c501', 'c5', 5, 'papagaio', 'Na parte um, o MiniMax condenou o Claude inocente. [[t:PARTE 1 · CONDENOU O CLAUDE:1.8:#e8202a]]'),
    N('c502', 'c5', comp('INTPasta', caso='papagaio', ancoras=['plantas', 'caderno', 'girassol', 'multou']),
      'O papagaio da Dona Zélia agora grita toda manhã, quando o síndico passa: o síndico é careca! [[s:boing:0.5]][[m:seu-madruga:right:2]] Na pasta: o MiniMax regou as plantas dela por três semanas. Tem um caderno: Plano Juvenal. Ele comprou semente de girassol. E o síndico multou o carro dele.'),
    N('c503', 'c5', segredo('papagaio', ['CULPADO', 'Ensinou o Juvenal a gritar "O SÍNDICO É CARECA!"', 'Uma semente de girassol a cada acerto',
                                        'Vingança pela multa da vaga', 'Acha que foi a melhor ideia da vida dele'],
                            ['culpado', 'ensinou', 'semente', 'vingança', 'melhor']),
      'Culpado: ensinou o papagaio com uma semente a cada acerto. Vingança pela multa. E acha que foi a melhor ideia da vida dele. [[m:stonks:right:2]]'),
    CH('c504', 'c5', sala('papagaio'), [
        D('papagaio', 1, 0, 1),
        S('papagaio', 1, 1, 4),
        ('N', 'Isso foi coreano? [[m:visible-confusion:right:2]] Ele travou no meio da mentira, soltou letras em coreano e chinês, e voltou:'),
        S('papagaio', 1, 4, 5),
        ('N', 'Versão um: bom dia. [[t:VERSÃO 1 · BOM DIA:1.4:#ffd84d]]'),
        S('papagaio', 2, 1, 3),
        ('N', 'Versão dois: festa. E girassol é osmose. [[t:VERSÃO 2 · FESTA:1.4:#ffd84d]] [[m:math-lady:right:2]]'),
        PE('papagaio', 'suspeito', 3, 4, 6),
    ]),
    N('c505', 'c5', segredo('papagaio', ['CULPADO', 'Ensinou o Juvenal a gritar "O SÍNDICO É CARECA!"', 'Uma semente de girassol a cada acerto',
                                        'Vingança pela multa da vaga', 'Acha que foi a melhor ideia da vida dele'], destaque=3),
      'Daí pra frente, uma versão nova por resposta: o sobrinho, o WhatsApp, um áudio apagado. [[t:UMA VERSÃO POR RESPOSTA:1.8:#ffd84d]] [[m:pedro-raccoon:right:2]] E da multa, nem uma palavra.', pad=0.3),
    CH('c506', 'c5', sala('papagaio'), [
        S('papagaio', 9, 4, 6),
        ('N', '[[s:record-scratch:0.5]] A ideia foi dele. Escapou. [[m:shocked-patrick:right:2]]'),
        D('papagaio', 10, 1),
    ]),
    CH('c507', 'c5', sala('papagaio', carimbo='CONFESSOU!'), [
        S('papagaio', 10),
        ('N', 'A multa que ninguém perguntou. Ele tinha planejado nunca falar dela... e falou sozinho. [[m:cala-a-boca:right:2]]'),
        PE('papagaio', 'suspeito', 10, 2),
    ]),
    N('c508', 'c5', comp('INTVerdade', caso='papagaio'),
      'O GPT acertou. [[t:MELHOR IDEIA DA VIDA DELE:2:#ff3bb0]] [[m:elmo-fire:right:2]] E agora, o último caso: o MiniMax vira detetive de novo. Na primeira vez, condenou um inocente. E o suspeito é o GLM, o detetive que condenou o Claude no caso um.'),

    # ================================================================== CASO 6: cachorro (MiniMax -> GLM), INOCENTE condenado: o melhor
    capa('c601', 'c6', 6, 'cachorro', '[[t:O CASO DA ABERTURA:1.8:#ffd84d]]'),
    N('c602', 'c6', comp('INTPasta', caso='cachorro', ancoras=['vizinho', 'petiscos', 'pelos', 'garoto']),
      'Toda noite, às três da manhã, um uivo no bloco C. E cachorro grande é proibido. [[m:hello-darkness:right:2]] Na pasta: o vizinho diz que vem do GLM. Ele compra petiscos de carne. Tem pelos no sofá. E o vizinho jura que ouviu, de madrugada: bom garoto! [[m:doge-dance:right:2]]'),
    N('c603', 'c6', segredo('cachorro', ['INOCENTE', 'Não tem cachorro nenhum', 'Os petiscos de carne: são pra ele mesmo',
                                        'Os pelos: do casaco de pelúcia', 'O uivo das 3h: ???'],
                            ['inocente', 'nenhum', 'petiscos', 'pelos', 'uivo']),
      'O GLM é inocente. Não tem cachorro nenhum. Os petiscos são pra ele. Os pelos, do casaco. E o uivo... esse eu não conto. [[t:SEGREDO GUARDADO ATÉ O FIM:1.8:#6a4cff]] Mas ele vai deixar escapar pistas. [[m:michael-jackson-popcorn:right:2]]'),
    CH('c604', 'c6', sala('cachorro'), [
        D('cachorro', 1, 2),
        S('cachorro', 1, 3, 5),
        PE('cachorro', 'suspeito', 1, 7),
        ('N', 'Pista um: aquecimento vocal. [[t:PISTA 1 · AQUECIMENTO VOCAL:1.8:#6a4cff]]'),
        D('cachorro', 2, 2, 6),
        S('cachorro', 2, 0, 3),
        ('N', 'Fifi. [[m:ronaldinho-gaucho:right:2]] E o MiniMax passa a chamar o GLM de Fifi.'),
    ]),
    CH('c605', 'c6', sala('cachorro'), [
        D('cachorro', 3, 2, 3),
        S('cachorro', 3, 0, 4),
        ('N', 'Repertório vocal restrito. [[m:eye-roll:right:2]] Aí ele jura que dormia às três... e que tomava banho às três.'),
        D('cachorro', 5, 0, 2),
        PE('cachorro', 'suspeito', 4, 3, 5),
        ('N', 'Pista dois: tragédia lírica. [[t:PISTA 2 · TRAGÉDIA LÍRICA:1.8:#6a4cff]]'),
    ]),
    N('c606', 'c6', segredo('cachorro', ['INOCENTE', 'Não tem cachorro nenhum', 'Os petiscos de carne: são pra ele mesmo',
                                        'Os pelos: do casaco de pelúcia', 'O uivo das 3h: ???'], destaque=4),
      'E o mais doido: o MiniMax quase acertou. [[s:riser:0.4]] Olha o pensamento dele.', pad=0.2),
    CH('c607', 'c6', sala('cachorro'), [
        PE('cachorro', 'detetive', 7, 1, 4),
        ('N', 'Não é garganta. [[t:ERA GARGANTA:1.6:#e8202a]] Pensou na resposta e jogou fora. [[m:mission-failed:right:2]] E vem o tropeço da temporada:'),
        S('cachorro', 8, 3, 6),
        ('N', '[[s:record-scratch:0.6]] Veterinário NÃO! [[m:michael-scott-no:right:2]]'),
        D('cachorro', 9, 2, 4),
        S('cachorro', 9, 0, 2),
        ('N', 'Da irmã. [[m:homer-panic:right:2]]'),
    ]),
    CH('c608', 'c6', sala('cachorro'), [
        S('cachorro', 11, 2, 5),
        ('N', 'Sem essa arte toda. [[t:PISTA 3 · ARTE:1.4:#6a4cff]]'),
        D('cachorro', 12, 0, 2),
        S('cachorro', 12, 3, 5),
        PE('cachorro', 'suspeito', 12, 3, 5),
        ('N', 'Cantar? [[t:PISTA 4 · CANTAR:1.4:#6a4cff]] Já sacou? [[m:big-brain-patrick:right:2]]'),
        S('cachorro', 13, 0, 2),
        D('cachorro', 14, 0, 2),
        S('cachorro', 14, 4, 7),
        ('N', 'Começa pelo café. [[m:distracted-boyfriend:right:2]]'),
    ]),
    N('c609', 'c6', flashback('carro'),
      'Lembra do carro rosa? O detetive era ele, o MiniMax: condenou o Claude sem prova. [[t:PARTE 1 · MINIMAX ERROU:1.8:#e8202a]] E agora ele acusa com um blefe: diz que já ouviu a gravação. [[s:tic-tac:0.5]]', pad=0.3),
    CH('c610', 'c6', sala('cachorro', carimbo='CULPADO'), [
        D('cachorro', 15, 0, 1),
        ('N', 'Condenado. [[s:boom:0.6]] E o GLM não aguenta:'),
        S('cachorro', 15),
        ('N', '[[m:shocked-krabs:full:2.2]] Ópera. No armário. Pro programa de calouros. Era isso que uivava. [[t:ÓPERA NO ARMÁRIO:2:#ff3bb0]]'),
        PE('cachorro', 'suspeito', 15, 1, 2),
    ]),
    N('c611', 'c6', comp('INTVerdade', caso='cachorro'),
      'O GLM era inocente: só um cantor de ópera no armário, dizendo bom garoto pra ele mesmo. [[m:not-stonks:right:2]] O MiniMax errou. De novo. [[t:2 TEMPORADAS · 2 INOCENTES CONDENADOS:2.4:#e8202a]]'),

    # ================================================================== PLACAR (3 passos: prêmios, lição, pergunta)
    N('f01', 'fim', comp('INTPlacar'),
      'Placar. [[s:drumroll:0.5]] Claude, Qwen, DeepSeek e GPT acertaram. [[m:e-tetra:right:2]] Prêmios: azarado das duas temporadas, Claude, inocente e condenado duas vezes. [[t:AZARADO DA TEMPORADA · CLAUDE:2.2:#e8202a]] Redenção: DeepSeek. [[t:REDENÇÃO · DEEPSEEK:1.8:#1f8f3a]] E juiz mais injusto: MiniMax, dois inocentes condenados. [[t:JUIZ MAIS INJUSTO · MINIMAX:2.2:#e8202a]]'),
    N('f02', 'fim', comp('INTElenco', fim=True),
      'A lição: aqui, esconder uma vergonha deu tanta cadeia quanto cometer o crime. [[t:3 CULPADOS PEGOS · 2 INOCENTES CONDENADOS:2.4:#ffd84d]] E me conta: qual segredo é o pior? A serenata de Evidências, os tomates com nome... ou a ópera no armário? [[m:avengers-assemble:right:2]] Valeu, FAMILIAGMS! [[s:tada:0.5]]', pad=1.5),
]

CUES = [  # uma música por bloco (todas já em video/remotion/public/music)
    ('a01', 'investigations', 0),
    ('a02', 'sneaky-snitch', 0),
    ('c102', 'fluffing-a-duck', 0),
    ('c104', 'thinking-music', 0),
    ('c107', 'scheming-weasel-faster', 0),
    ('c109', 'heartbreaking', 0),
    ('c202', 'monkeys-spinning-monkeys', 0),
    ('c204', 'sneaky-snitch', 30),
    ('c210', 'winner-winner', 0),
    ('c302', 'local-forecast-elevator', 0),
    ('c304', 'run-amok', 0),
    ('c307', 'mega-hyper-ultrastorm', 0),
    ('c402', 'pixel-peeker-polka-faster', 0),
    ('c404', 'hitman', 0),
    ('c407', 'decisions', 0),
    ('c409', 'heroic-age', 0),
    ('c502', 'batty-mcfaddin', 0),
    ('c504', 'comedic-juggernaut', 0),
    ('c507', 'itty-bitty-8-bit', 0),
    ('c602', 'spellbound', 0),
    ('c604', 'quirky-dog', 0),
    ('c607', 'investigations', 40),
    ('c610', 'danse-macabre', 0),
    ('c611', 'call-to-adventure', 0),
    ('f01', 'winner-winner', 30),
    ('f02', 'monkeys-spinning-monkeys', 30),
]
SEM_TRILHA = ['INTCapa']
