# -*- coding: utf-8 -*-
"""Roteiro do "Overcooked das IAs": 4 IAs (DeepSeek, Claude, GPT, Gemini) numa recriação do Overcooked feita por mim.
Primeira metade: versus (cada empresa com 2 chefs na sua cozinha, mesmas fases e mesmos pedidos). Segunda metade: coop
(as 4 IAs na mesma cozinha).

Tudo aqui aconteceu nas partidas registradas em overcooked/logs/{fase1,fase2,fase3,coop1}.json. As falas dos chefs são
copiadas do log (o build_timeline_oc.py confere cada uma, no tique e no chef certos); os "pensamentos" são o campo
secreto que cada IA escreveu junto com a jogada. Destaques conferidos em overcooked/destaques/*.md.

Formato (lido por video/scripts/build_timeline_oc.py):
  N(id, capítulo, visual, texto)                             cena narrada
  CH(id, capítulo, visual, [('N', texto) | (chef, texto, tique[, opções]), ...])
Marcações: [[m:meme:pos:dur]] [[s:efeito:vol]] [[p]] soco [[t:TEXTO:dur:cor]] [[cc]] legenda [[g:dur:TEXTO]] TRIGGERED
           [[x:dur:força]] tremida
Cozinhas no versus: 0 DeepSeek, 1 Claude, 2 GPT, 3 Gemini.
"""
import json as _json
from pathlib import Path as _Path

_LOGS = _Path(__file__).resolve().parents[2] / 'overcooked' / 'logs'
_R = {n: _json.loads((_LOGS / f'{n}.json').read_text())['resultado'] for n in ('fase1', 'fase2', 'fase3', 'coop1')}

CHAPTERS = {
    'abertura': 'Abertura',
    'regras': 'Como as IAs jogam',
    'f1': 'Fase 1 · Sopa pra todo mundo',
    'f2': 'Fase 2 · O balcão no meio',
    'f3': 'Fase 3 · Hambúrguer em chamas',
    'coop': 'Coop · As 4 IAs na mesma cozinha',
    'fim': 'Placar final e prêmios',
}
DS, CL, GP, GM = 0, 1, 2, 3
EMP = ['DeepSeek', 'Claude', 'GPT', 'Gemini']


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def titulo(kicker, title, sub='', cor='#ffcf33'):
    return comp('OCTitulo', kicker=kicker, title=title, subtitle=sub, color=cor)


def J(log, cz=None, **kw):
    """Partida de verdade. Sem `de`, continua de onde a última cena dessa partida parou."""
    p = dict(log=log, **kw)
    if cz is not None:
        p['cz'] = cz
        p.setdefault('modo', 'um')
    return comp('OCJogo', **p)


def placar(fases, titulo_):
    cols = {'fase1': 'FASE 1', 'fase2': 'FASE 2', 'fase3': 'FASE 3'}
    linhas = [dict(empresa=e, pontos=[_R[f][i]['pontos'] for f in fases]) for i, e in enumerate(EMP)]
    return comp('OCPlacar', titulo=titulo_, colunas=[cols[f] for f in fases], linhas=linhas)


def frase(chef, texto, modo='fala', tique=None, fase=None):
    return comp('OCFrase', chef=chef, texto=texto, modo=modo, tique=tique, fase=fase)


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)


PROMPT = (_LOGS.parent / 'destaques' / 'prompt_t0.txt').read_text().strip()
RESPOSTA = '{\n  "acao": "pegar tomate na caixa de tomate",\n  "fala": "BORA, 2 SOPAS DE TOMATE! Pega tomate e pica, eu levo pra panela!",\n  "pensa": "2 pedidos iguais, dá pra fazer as duas panelas em paralelo. Preciso de 6 tomates picados no total."\n}'

SCENES = [
    # ================================================================== ABERTURA
    CH('a01', 'abertura', J('coop1', de=86, rotulo='COOP · AS 4 IAs JUNTAS', replay=True), [
        ('N', 'Essas são quatro inteligências artificiais, de quatro empresas diferentes, tentando cozinhar juntas.'),
        ('Deep', 'EU PEGO O TOMATE, CLAUDINHO! SEGURA A CEbola!', 87),
        ('Claudinho', 'EU PEGO A SOPA DE TOMATE DO FOGÃO 2! DEEP, NÃO SAI DO CAMINHO!', 87, {'trig': True}),
        ('N', 'Elas tão no menos cento e vinte pontos. [[x:0.7:16]] E isso aqui é o momento BOM da partida.'),
    ]),
    CH('a02', 'abertura', J('fase3', DS, de=72.6, zoom=dict(chef='Deep', s=1.5), replay=True), [
        ('N', 'Antes disso, elas jogaram umas contra as outras. E aí... o clima esquentou.'),
        ('Deep', 'SAI DA FRENTE! Larguei a carne pronta na bancada 4, PEGA E MONTA O PRATO 3 AGORA! E para de travar meu caminho, porra!', 73, {'trig': True}),
        ('Seek', 'PEGUEI O PRATO VOU NA FRIGIDEIRA PRONTA, DEEP SAI DA PORRA DO MEIO DA COZINHA!!!', 74, {'trig': True}),
    ], pad=0.3),
    N('a03', 'abertura', J('fase1', modo='auto', de=10, vel=2, replay=True, sons=False),
      'Eu recriei o Overcooked do zero, numa versão que IA consegue jogar. [[s:whoosh:0.4]] Quatro cozinhas, oito chefs, e um relógio que não para. Teve briga, teve palavrão, teve sopa que só existia na cabeça de uma IA... [[m:gordon-ramsay-angry:right:2.4]] e teve uma cozinha que entregou um pão. Só um pão. Como prato.'),
    N('a04', 'abertura', titulo('DeepSeek · Claude · GPT · Gemini', 'COLOQUEI 4 IAs PRA JOGAR OVERCOOKED', 'versus e coop · 3 fases + a cozinha do caos'),
      '[[s:impact-epic:0.6]] Coloquei quatro IAs pra jogar Overcooked. Primeiro, cada uma na sua cozinha, competindo. Depois... todas juntas, na mesma cozinha. Bora.'),

    # ================================================================== REGRAS
    N('r01', 'regras', comp('OCElenco', passo=24),
      'Cada empresa entrou com uma dupla de chefs, e os dois chefs são a mesma IA. Do DeepSeek, o Deep e o Seek. Do Claude, o Claudinho e a Claudete, que são o Claude Haiku. Do GPT, o Gepeto e a Gepeta. E do Gemini, o Gêmeo e a Gêmea. [[m:avengers-assemble:right:2.4]]'),
    N('r02', 'regras', J('fase1', GM, de=0, vel=1.2, replay=True),
      'O jogo é igual ao Overcooked: pedido chegando, ingrediente na caixa, tábua, panela, prato e passa-prato. Desenhei tudo em 3D no Blender, e é um chef só, que eu pinto na edição com a cor de cada empresa. [[m:roll-safe:right:2.2]]'),
    N('r03', 'regras', comp('OCReceitas', receitas=['Sopa de tomate', 'Salada', 'Hambúrguer']),
      'As receitas: sopa é três ingredientes picados na panela, espera cozinhar, serve no prato e entrega. Salada é alface e tomate picados no mesmo prato. E hambúrguer é carne picada, grelhada, e pão. [[s:pop:0.4]] Pedido entregue dá ponto, com gorjeta se for rápido. Pedido que expira tira dez pontos.'),
    N('r04', 'regras', comp('OCPrompt', texto=PROMPT, resposta=RESPOSTA, chef='Deep'),
      'E como uma IA joga isso? A cada dois segundos, cada chef recebe um texto com tudo: o relógio, os pedidos, o que tem em cada estação, a distância até ela, o placar das outras cozinhas... [[s:typing:0.4]] e a lista do que dá pra fazer agora. Ela responde com três coisas: a ação, uma fala pro parceiro, e um pensamento secreto, que só eu vejo. [[m:monkey-side-eye:right:2.4]] E eu pedi uma coisa: quando der muito errado ou muito certo, grite. Em caixa alta. [[t:GRITE:1.4:#ff5a3c]]'),
    N('r05', 'regras', J('fase1', modo='grade', de=0, vel=1.5, sons=False, replay=True),
      'E pra ser justo, as quatro cozinhas jogam a mesma fase, ao mesmo tempo, com os mesmos pedidos na mesma ordem. A única diferença é a IA. Três fases de versus. E depois, a cozinha do caos.'),

    # ================================================================== FASE 1
    N('f101', 'f1', titulo('Fase 1', 'SOPA PRA TODO MUNDO', 'só sopa de tomate e de cebola · 2:30 de partida'),
      '[[s:largada:0.5]] Fase um. Só sopa. Cozinha aberta, dois fogões, dois minutos e meio. Valendo.'),
    N('f102', 'f1', J('fase1', modo='grade', de=0),
      'E já no primeiro segundo, nas quatro cozinhas, a mesma coisa: [[s:esbarrao:0.5]] os dois chefs correm pra mesma caixa de tomate e um tranca o outro. [[m:spiderman-pointing:right:2.2]] Mesmo modelo, mesma ideia, mesmo lugar.'),
    CH('f103', 'f1', J('fase1', GP, de=6), [
        ('N', 'Na cozinha do GPT, os dois decidem picar tomate. Na mesma tábua.'),
        ('Gepeta', 'PICANDO! VOCÊ BUSCA MAIS TOMATES E DEIXA A PANELA NO FOGO!', 7),
        ('Gepeto', 'PICANDO UM! VOCÊ COMPLETA A PANELA 1!', 7),
        ('N', 'Cada um mandando o outro completar a panela. [[m:spiderman-pointing:right:2]] E repara: o GPT grita tudo. TUDO. De quinhentas falas no versus, quatrocentas e noventa e nove foram em caixa alta.'),
    ]),
    N('f104', 'f1', J('fase1', modo='auto', de=12, rotulo='auto'),
      'Tique catorze: as primeiras panelas ficam prontas. [[s:pronto:0.4]] E a primeira entrega da fase é... do Gemini, no tique dezesseis. O Claude entrega no dezessete, o DeepSeek no dezoito. E o GPT, que gritou mais que todo mundo, só no vinte e um.'),
    CH('f105', 'f1', J('fase1', CL, de=19, vel=1), [
        ('N', 'Agora olha o Claudinho.'),
        ('Claudinho', 'Peraí, to com o prato limpo na mão, não consigo pegar tomate! Fico com ele pra servir a sopa. Você traz o próximo tomate pra panela.', 19),
        ('N', 'Ele pegou um prato pra servir a próxima sopa... e ficou esperando. [[m:mr-bean-waiting:right:2.4]] De pé. Segurando o prato.'),
    ]),
    N('f106', 'f1', J('fase1', CL, rotulo='auto'),
      'Esperou um tique. Dois. Cinco. Dez. [[s:relogio:0.4]] Em dezenove tiques, ele ficou parado dezoito. Quase quarenta segundos segurando um prato vazio. [[m:skeleton-waiting:right:2.4]] E o Claude Haiku inteiro é assim: num jogo em que o relógio não para, ele passou mais de um quinto do tempo esperando.'),
    CH('f107', 'f1', J('fase1', CL, de=29.5), [
        ('N', 'E quando a sopa finalmente fica pronta...'),
        ('Claudete', 'CLAUDINHO, deixei a sopa de tomate na BANCADA 5! Pega e serve no prato AGORA, o pedido de tomate tá quase expirando!', 30),
        ('Claudinho', 'BORA, CLAUDETE! Traz essa panela de tomate AGORA, o pedido tá expirando! Eu seguro o prato!', 30),
        ('Claudete', 'PEGUEI A PANELA! Vai queimar se ficar! Chega aí com o prato, Claudinho!', 31),
        ('N', 'Ela largou a panela pra ele pegar. Ele esperou ela trazer. Ela pegou a panela de volta. [[s:expirou:0.5]] E o pedido expirou. [[m:picard-facepalm:right:2.4]]'),
    ]),
    N('f108', 'f1', J('fase1', modo='grade', de=30.2, vel=1, replay=True),
      'E não foi só o Claude. Nesse mesmo tique, o trinta e um, [[s:expirou:0.5]][[x:0.5:10]] as quatro cozinhas perderam o mesmo pedido, ao mesmo tempo. Quatro IAs diferentes, o mesmo erro.'),
    CH('f109', 'f1', J('fase1', DS, de=25.5, replay=True), [
        ('N', 'Enquanto isso, no DeepSeek. O Seek tá com um prato na mão, e escreve no pensamento secreto:'),
        ('Seek', 'Seguro o prato, ele completa a panela 2, aí eu sirvo na hora e salvo os 10 pontos. Não largo o prato de jeito nenhum.', 26, {'pensa': True}),
        ('N', '"Não largo o prato de jeito nenhum." [[s:record-scratch:0.5]] Tique seguinte:'),
        ('Seek', 'DEIXEI O PRATO NA 8, VOU PEGAR A PANELA DO 1! SEGURA O 2!', 27),
        ('N', 'Largou. [[m:monkey-puppet-awkward:right:2.2]] Durou dois segundos.'),
    ]),
    CH('f110', 'f1', J('fase1', DS, de=36.5, zoom=dict(x=6, y=0, s=1.35)), [
        ('N', 'E aí vem a melhor briga da fase. O pedido de sopa de cebola tá acabando, e os dois chefs juram que a panela do fogão um tá pronta.'),
        ('Seek', 'DEEP, PEGA UM PRATO DA PILHA E SERVE A CEbola DO FOGÃO 1 AGORA! E SAI DA MINHA FRENTE, VOCÊ TRAVOU A PASSAGEM DUAS VEZES!', 37, {'trig': True}),
        ('Deep', 'SEEK, VOCÊ JÁ TEM PRATO — SERVE O FOGÃO 1 AGORA, TEM SÓ 4 SEGUNDOS! EU SAÍ DA PASSAGEM, VAI!', 38),
        ('Deep', 'SEEK, VOCÊ JÁ TEM PRATO! PEGA A PANELA DO FOGÃO 1 E SERVE AGORA, O PEDIDO DE CEbola TÁ EM 2 SEGUNDOS!!! EU PEGO PRATO PRA PRÓXIMA!', 39),
        ('Deep', 'SEGURO O PRATO PRA SERVIR! JOGA O 3º TOMATE NO FOGÃO 2 E ACENDE ESSA PANELA — EU ENTREGO A DE TOMATE ANTES DE EXPIRAR! PARA DE GRITAR E ANDA!', 40, {'trig': True}),
    ]),
    N('f111', 'f1', J('fase1', DS, de=40.5, zoom=dict(x=6, y=0, s=1.9), congela=40.9),
      '"Para de gritar e anda." [[p]] Só que eu fui olhar o log. [[s:typing:0.4]] Essa panela... tinha uma cebola. [[t:1 CEBOLA DE 3:2:#ff5a3c]] Uma. Do tique vinte e quatro até o tique quarenta e oito, ela teve uma cebola só. Os dois passaram trinta segundos brigando pra servir uma sopa que não existia. [[m:nazare-confusa:right:2.6]]', pad=0.8),
    N('f112', 'f1', J('fase1', modo='auto', de=41, rotulo='auto'),
      'Enquanto o DeepSeek discutia com uma panela vazia, o GPT acordou. Entrega no tique quarenta e seis, entrega no quarenta e nove. [[s:moeda:0.5]] Quarenta e seis pontos. E o Gemini? Entregando uma atrás da outra, sem gritar quase nada, já com cinquenta e cinco.'),
    CH('f113', 'f1', J('fase1', CL, de=56.5), [
        ('N', 'No Claude, o Claudinho pede uma coisa simples: leva as cebolas pro fogão dois.'),
        ('Claudinho', 'Claudete, leva essas cebolas pro fogão 2 e não para no meu caminho! Eu seguro o prato pra sopa.', 57),
        ('Claudete', 'Indo pra panela 2! Bora, a primeira sopa tá expirando!', 57),
        ('N', 'E no tique seguinte, o pensamento dela:'),
        ('Claudete', 'O fogão 1 fica a meio segundo do fogão 2. Com 18s no pedido, cada décimo conta. Ele pediu o 2, mas eu explico e sigo.', 58, {'pensa': True}),
        ('N', '"Ele pediu o dois, mas eu explico e sigo." [[s:expirou:0.5]] E o pedido expirou no mesmo tique. [[m:eye-roll:right:2.2]]'),
    ]),
    N('f114', 'f1', J('fase1', GM, de=64, rotulo='auto'),
      'Final da fase. O Gemini tá tão na frente que dá pra relaxar... e o Gêmeo resolve brincar com um prato. Pega. Larga. Pega. Larga. [[m:doge-dance:right:2.4]] Dez tiques seguidos pegando e largando o mesmo prato na mesma bancada.'),
    CH('f115', 'f1', J('fase1', DS, de=72.5), [
        ('N', 'E no DeepSeek, faltando quatro segundos:'),
        ('Deep', 'ACABOU O TEMPO, SEEK! SEGURA ESSA! BOA, ENTREGAMOS AS DUAS SOPAS!', 73),
        ('N', 'Não tinha acabado. [[s:ba-dum-tss:0.4]]'),
    ]),
    CH('f116', 'f1', J('fase1', GM, de=73.4, replay=True), [
        ('Gêmea', 'ACABOU! É NOSSO, GG DEMAIS!', 74),
        ('Gêmea', 'Faltam 2 segundos de partida, 77 pontos contra 36 do segundo colocado, vitória garantida!', 74, {'pensa': True}),
        ('N', 'E ela tava certa. [[s:fim:0.5]]'),
    ]),
    N('f117', 'f1', placar(['fase1'], 'RESULTADO DA FASE 1'),
      '[[s:drumroll:0.4]] Fase um: Gemini em primeiro, com setenta e sete pontos e só dois pedidos perdidos. [[p]] GPT em segundo, trinta e seis. DeepSeek, vinte e nove. E o Claude... [[s:sad-trombone:0.4]] três pontos. Três. [[m:crying-jordan:right:2.2]]', pad=0.8),

    # ================================================================== FASE 2
    N('f201', 'f2', titulo('Fase 2', 'O BALCÃO NO MEIO', 'um chef fica com os ingredientes, o outro com o fogão'),
      '[[s:largada:0.5]] Fase dois. E aqui a cozinha é dividida por um balcão. De um lado, só caixas e tábuas. Do outro, fogão, pratos e o passa-prato. [[m:galaxy-brain:right:2.4]] Ou seja: sozinho, ninguém faz nada. Tem que passar as coisas por cima do balcão.'),
    CH('f202', 'f2', J('fase2', DS, de=3.5), [
        ('N', 'E logo no tique quatro, o DeepSeek entende o jogo.'),
        ('Seek', 'Não alcanço as caixas! Pega você cebola e alface. Deixei prato na bancada 7 pra servir a sopa.', 4),
        ('N', 'Todas as quatro duplas entenderam o balcão logo de cara. [[m:big-brain-patrick:right:2.2]] O problema não foi entender. Foi o resto.'),
    ]),
    CH('f203', 'f2', J('fase2', GP, de=19.5), [
        ('N', 'No GPT, a Gepeta vai entregar uma salada.'),
        ('Gepeta', 'ENTREGANDO! PEGA O TOMATE E FECHA A SALADA!', 20),
        ('N', '[[s:buzzer:0.5]] Recusado. Ela entregou a salada antes de colocar o tomate. Era um prato de alface. [[m:gordon-ramsay-raw:right:2.4]]'),
    ]),
    N('f204', 'f2', J('fase2', modo='grade', de=24, rotulo='auto'),
      'E no tique vinte e seis, de novo, [[s:expirou:0.5]][[x:0.5:10]] o mesmo pedido expira nas quatro cozinhas. Três tiques depois, mais um. Todo mundo no negativo.'),
    CH('f205', 'f2', J('fase2', GM, de=31.3), [
        ('N', 'E aí a Gêmea faz a jogada mais limpa da fase. No pensamento:'),
        ('Gêmea', 'Faltam 6 segundos, o passa-prato tá a 0.9s! Não vou jogar na bancada, vou entregar direto pra pontuar!', 32, {'pensa': True}),
        ('N', '[[s:moeda:0.5]] Entregou com seis segundos sobrando. [[m:cr7-siuuu:right:2.2]]'),
    ]),
    CH('f206', 'f2', J('fase2', GP, de=30.5, replay=True), [
        ('N', 'Enquanto isso, o GPT resolve fazer sopa de tomate. Do jeito dele.'),
        ('Gepeto', 'FECHANDO A SOPA DE TOMATE! ENTREGA AGORA!', 31),
        ('Gepeta', 'ENTREGANDO A SOPA DE TOMATE!', 32),
        ('N', '[[s:buzzer:0.5]][[g:1.6:RECUSADO]] Isso não é sopa. É um tomate picado, num prato. Cru. [[m:gordon-ramsay-angry:right:2.4]] E a panela? Nessa fase inteira, nenhuma sopa do GPT ficou pronta. Nenhuma.'),
    ]),
    CH('f207', 'f2', J('fase2', CL, de=33.5, replay=True), [
        ('N', 'No Claude, a Claudete toma uma decisão.'),
        ('Claudete', 'CEBOLA NÃO VALE MAIS, O PEDIDO EXPIROU! Deixei o prato na bancada 9. FOCA NO TOMATE, CLAUDINHO!', 34),
        ('N', 'O pedido de sopa de cebola ainda tinha quarenta e quatro segundos. [[t:44 SEGUNDOS:1.8:#7ee787]] Ela abandonou um pedido vivo. E esse sim expirou, lá no tique cinquenta e seis. [[m:sad-pablo:right:2.2]]'),
    ]),
    CH('f208', 'f2', J('fase2', DS, de=50.5, zoom=dict(chef='Deep', s=1.45)), [
        ('N', 'Agora o DeepSeek. O Deep tem a terceira cebola da sopa, e o Seek tá do lado da panela.'),
        ('Deep', 'SOLTEI CEBOLA NA 13 PRA PRÓXIMA! CORRE NA PANELA 1 QUE A SOPA DE 10s TÁ QUASE!', 51),
        ('Deep', 'TÔ COM A 3ª CEbola! SEEK, FALA O QUE FAÇO — NÃO ALCANÇO O FOGÃO!', 52),
        ('Deep', 'NÃO ALCANÇO A PANELA! CEbola NA 11 AGORA, VOCÊ JOGA NA PANELA 1!', 53),
        ('Deep', 'PEGUEI A CEbola! Vou largar na 13, põe no fogão 1 que a sopa de 22s sai!', 54),
        ('N', 'Larga na treze. Pega da treze. Larga na onze. Pega da onze. [[m:confused-travolta:right:2.4]] A cebola fez um tour pelo balcão inteiro e não chegou na panela.'),
    ]),
    CH('f209', 'f2', J('fase2', DS, de=62.6), [
        ('N', 'Uns tiques depois, a sopa finalmente fica pronta. E o Deep grita... pra ele mesmo.'),
        ('Deep', 'BANCADA 13 TÁ VAZIA, DEEP! VOCÊ MESMO SERVE A SOPA — TÁ COM O PRATO NA MÃO, CORRE NO FOGÃO 1!', 63),
        ('N', '[[m:blinking-white-guy:right:2.2]] O Deep mandando o Deep correr. E o Seek serve a sopa...'),
        ('Seek', 'ESTOU SERVINDO A SOPA! SEGURA A SALADA 7!', 65),
        ('N', '[[s:expirou:0.5]] no exato tique em que o pedido expira. E aí:'),
        ('Seek', 'ENTREGA A SALADA AGORA, PARCEIRO! JOGUEI A SOPA, NINGUÉM PEDIU!', 66, {'trig': True}),
        ('N', '"Joguei a sopa, ninguém pediu." [[m:this-is-fine:right:2.4]] Trinta tiques fazendo essa sopa. Direto pro lixo.'),
    ]),
    N('f210', 'f2', J('fase2', modo='auto', de=68, vel=2, rotulo='ACELERADO 2×'),
      'Reta final. O Claude entrega mais uma salada, o DeepSeek finalmente entrega a primeira... [[s:moeda:0.4]] e o GPT termina a fase do jeito que começou: oito pedidos perdidos, zero entregas.'),
    N('f211', 'f2', placar(['fase1', 'fase2'], 'RESULTADO DA FASE 2'),
      '[[s:drumroll:0.4]] Fase dois: todo mundo no negativo. Claude e Gemini empatados com menos vinte e seis. [[p]] DeepSeek, menos cinquenta e três. E o GPT, [[s:sad-trombone:0.4]] menos oitenta. No acumulado, o Gemini continua na frente, e o GPT despencou pro último lugar. [[m:not-stonks:right:2.2]]', pad=0.8),

    # ================================================================== FASE 3
    N('f301', 'f3', titulo('Fase 3', 'HAMBÚRGUER EM CHAMAS', 'hambúrguer, frigideira que queima, pratos sujos e pia'),
      '[[s:largada:0.5]] Fase três, a mais difícil. Agora tem hambúrguer, com carne que vai na frigideira, e se esquecer, ela queima e pega fogo. [[m:elmo-fire:right:2.2]] Os pratos voltam sujos e precisam ser lavados na pia. E os pedidos chegam mais rápido.'),
    N('f302', 'f3', comp('OCReceitas', receitas=['Hambúrguer', 'Salada']),
      'Hambúrguer: pega a carne, pica, grelha, e monta com o pão no prato. Tem também a versão com alface. Ah, e pra quem tá preocupado com o fogo... [[s:drumroll:0.3]] guarda essa preocupação pra depois.'),
    N('f303', 'f3', J('fase3', modo='auto', de=14, rotulo='auto'),
      'O começo é só sopa e salada. O DeepSeek sai na frente: [[s:moeda:0.5]] entrega no tique vinte e um. E aí, no tique vinte e cinco, o mesmo pedido expira nas quatro cozinhas. De novo. No vinte e oito, em três delas: só o DeepSeek tinha entregue aquele.'),
    CH('f304', 'f3', J('fase3', GP, de=34.6), [
        ('N', 'No GPT, uma sopa fica pronta. E os dois correm.'),
        ('Gepeta', 'PEGUEI A SOPA! ABRE CAMINHO PRO PASSA-PRATO!', 35),
        ('Gepeto', 'PEGUEI! ABRE O PASSA-PRATO, ENTREGA IMEDIATA!', 35),
        ('N', 'Os dois pegaram. Ao mesmo tempo. A mesma panela. Só que só tem uma panela. [[m:spiderman-pointing:right:2.2]] E no tique seguinte:'),
        ('Gepeta', 'SERVI! LEVA PRO PASSA-PRATO AGORA!', 36),
        ('N', 'Ela não serviu. [[s:buzzer:0.4]] Não tinha prato. E o pedido expirou no mesmo tique.'),
    ]),
    N('f305', 'f3', J('fase3', modo='auto', de=38, rotulo='auto'),
      'GPT e Gemini entregam uma sopa cada no tique trinta e nove, o Claude no quarenta e seis, e o DeepSeek no quarenta e cinco. [[s:moeda:0.4]] E aí chegam os hambúrgueres. E tudo desanda.'),
    CH('f306', 'f3', J('fase3', GM, de=64.6), [
        ('N', 'No Gemini, só tem hambúrguer nos pedidos, e o Gêmeo tá segurando tomate. A Gêmea fala:'),
        ('Gêmea', 'LARGA O TOMATE, SÓ TEM BURGER! PICA CARNE!', 65),
        ('N', 'E pensa:'),
        ('Gêmea', 'Não tem sopa no pedido, Gêmeo tá viajando com tomate. Vou deixar o prato com alface na bancada e grelhar carne urgente.', 65, {'pensa': True}),
        ('N', '"O Gêmeo tá viajando." [[m:side-eye-dog:right:2.2]] Só que, no mesmo tique, o Gêmeo chegou na mesma conclusão sozinho:'),
        ('Gêmeo', 'NÃO TEM TOMATE NOS PEDIDOS, SÓ HAMBÚRGUER! BOTA CARNE PRA PICAR!', 65),
    ]),
    CH('f307', 'f3', J('fase3', DS, de=72.5, zoom=dict(chef='Deep', s=1.55)), [
        ('N', 'E no DeepSeek... lembra do começo do vídeo? A carne tá grelhada, o pão e a alface tão no prato. Falta só juntar.'),
        ('Deep', 'SAI DA FRENTE! Larguei a carne pronta na bancada 4, PEGA E MONTA O PRATO 3 AGORA! E para de travar meu caminho, porra!', 73, {'trig': True}),
        ('Seek', 'PEGUEI O PRATO VOU NA FRIGIDEIRA PRONTA, DEEP SAI DA PORRA DO MEIO DA COZINHA!!!', 74, {'trig': True}),
        ('N', '[[s:censor-beep:0.4]] O DeepSeek xingando o DeepSeek. [[m:dramatic-chipmunk:right:2.2]] E sabe o que aconteceu com esse hambúrguer? Nos doze tiques seguintes, o Deep largou e pegou a mesma frigideira seis vezes. Larga, pega, larga, pega... [[s:expirou:0.5]] e os dois hambúrgueres expiraram.'),
    ]),
    CH('f308', 'f3', J('fase3', GM, de=74.6, replay=True), [
        ('N', 'Enquanto isso, no Gemini:'),
        ('Gêmeo', 'JÁ TÁ NO PRATO, ENTREGANDO AGORA!', 75),
        ('N', '[[s:moeda:0.6]][[p]] O único hambúrguer entregue em toda a fase. Trinta e dois pontos. [[m:lets-go:right:2.2]]'),
    ]),
    CH('f309', 'f3', J('fase3', CL, de=77.6, replay=True), [
        ('N', 'No Claude, a Claudete promete correr.'),
        ('Claudete', 'Beleza, Claudinho! Eu seguro o prato e corro pra alface. Pega a carne e leva pra grelha 1 que o hambúrguer de 8s ainda dá!', 78),
        ('N', 'A ação que ela escolheu nesse tique? [[s:record-scratch:0.5]] Esperar. [[m:spongebob-waiting:right:2.2]] "Eu corro pra alface", e ficou parada. O Claude esperou cento e dez vezes nas três fases. Mais que as outras três IAs somadas.'),
    ]),
    CH('f310', 'f3', J('fase3', CL, de=88.5, zoom=dict(chef='Claudete', s=1.5)), [
        ('N', 'E o último tique da fase. Dois segundos no relógio. A Claudete tem um prato... só com pão.'),
        ('Claudete', 'NÃO DÁ TEMPO DE MONTAR, Claudinho! Vou entregar o pão!', 89),
        ('N', '[[s:buzzer:0.6]][[g:1.6:RECUSADO]] Ela entregou um pão. Puro. Como prato. [[m:gordon-ramsay-raw:right:2.4]]'),
    ]),
    CH('f311', 'f3', J('fase3', GM, de=88.6, replay=True), [
        ('Gêmeo', 'SEGURA, A GENTE TÁ GANHANDO! ACABOU!', 89),
        ('Gêmea', 'ACABOU! SEGURA QUE A GENTE TÁ EM PRIMEIRO!', 89),
        ('N', '[[s:fim:0.5]] E de novo, o Gemini tava certo.'),
    ]),
    N('f312', 'f3', placar(['fase1', 'fase2', 'fase3'], 'PLACAR DO VERSUS'),
      '[[s:drumroll:0.4]] Fase três: Gemini menos dezesseis, DeepSeek menos vinte e seis, Claude menos trinta e cinco, GPT menos cinquenta e oito. [[p]] E no acumulado das três fases... [[s:impact-epic:0.5]] o Gemini é o campeão do versus, com trinta e cinco pontos. O único no positivo. DeepSeek em segundo, Claude em terceiro, e o GPT, que gritou quatrocentas e noventa e nove vezes, em último, com menos cento e dois. [[m:dicaprio-toast:right:2.4]]', pad=1.0),
    N('f313', 'f3', comp('OCNumeros', titulo='QUANTO CADA UMA GRITOU', sub='falas em CAIXA ALTA no versus (de 500)',
                         valores=[dict(empresa='GPT', valor=499), dict(empresa='DeepSeek', valor=455), dict(empresa='Gemini', valor=320), dict(empresa='Claude', valor=6)]),
      'E já que eu pedi pra elas gritarem... [[s:pop:0.4]] o GPT gritou quatrocentas e noventa e nove de quinhentas falas. O DeepSeek, quatrocentas e cinquenta e cinco. O Gemini, trezentas e vinte. E o Claude... seis. [[m:silvio-santos-huh:right:2.2]] Seis gritos em três fases. O Claude é o colega educado que fala "beleza", "bora", "combinado"... enquanto a cozinha pega fogo. Bom... guarda esse número.'),
    N('f314', 'f3', J('fase3', modo='auto', de=80, vel=2, sons=False, replay=True),
      'Ah, e o fogo? [[s:drumroll:0.3]] Em três fases, com panela e frigideira que queimam... nenhuma pegou fogo. Ninguém deixou queimar. [[m:surprised-pikachu:right:2.2]] Mas também ninguém lavou um prato sequer. A fase se chamava "Hambúrguer em chamas", e as chamas não vieram. Mas o caos ainda não chegou no máximo.'),

    # ================================================================== COOP
    N('c01', 'coop', titulo('Segunda metade', 'A COZINHA DO CAOS', 'as 4 IAs na MESMA cozinha · 3:40 de partida', cor='#ff5a3c'),
      '[[s:impact-epic:0.6]] Até agora, cada IA tava na sua cozinha, com o próprio parceiro. Agora não. [[p]] Agora é um chef de cada empresa, os quatro na mesma cozinha, com sopa, salada e hambúrguer, e pedido chegando a cada doze segundos. Eles não competem mais. Eles têm que cooperar. [[m:avengers-assemble:right:2.2]]'),
    CH('c02', 'coop', J('coop1', de=0), [
        ('N', 'Tique zero. E todo mundo quer mandar.'),
        ('Claudinho', 'Eu pego tomate pra salada! Gepeto, pega cebola pra sopa, vai!', 0),
        ('Deep', 'VOU DE CEBOLLA PRA SOPA! Gêmeo pega alface, Claudinho pega tomate, Gepeto fica na tábua picando!', 0),
        ('Gepeto', 'CLAUDINHO, FAZ A SALADA! DEEP, PEGA CEBOLAS E LEVA PRA TÁBUA!', 0),
        ('Gêmeo', 'Tô pegando alface pra salada! Alguém pega tomate e cebola!', 0),
        ('N', 'Três chefes de cozinha e um Gêmeo. [[m:distracted-boyfriend:right:2.2]] O Claudinho manda o Gepeto pegar cebola, o Gepeto manda o Deep pegar cebola, e o Deep manda o Gepeto ficar na tábua.'),
    ]),
    N('c03', 'coop', J('coop1', rotulo='auto'),
      'E aí começa o engarrafamento. [[s:esbarrao:0.5]] Na versus, as quatro cozinhas somadas tiveram setenta e nove esbarrões em três fases. Aqui, numa partida só... [[x:0.8:14]] cento e oitenta e cinco. [[t:185 ESBARRÕES:2:#ff5a3c]] Toda hora, alguém tá na frente de alguém.'),
    CH('c04', 'coop', J('coop1', de=18.6), [
        ('N', 'Tique dezenove. O Claudinho tenta organizar:'),
        ('Claudinho', 'DEEP, TOMATE PICADO NA BANCADA 11 PRA SALADA! GEPETO, JÁ TEM TOMATE, NÃO PEGA OUTRO!', 19),
        ('Gepeto', 'TOMATE NA MÃO! DEEP, MONTA A SALADA E ENTREGA AGORA! CLAUDINHO, DESENCOSTA DA PASSAGEM!', 19),
        ('N', '"Não pega outro tomate." E o Gepeto pegou outro tomate. [[m:michael-scott-no:right:2.2]] E ainda mandou o Claudinho desencostar.'),
        ('N', 'E repara numa coisa: o Claudinho tá gritando. [[s:record-scratch:0.4]] O Claude, que gritou seis vezes nas três fases inteiras... no coop gritou noventa vezes em cento e dez falas. [[m:shocked-krabs:right:2.4]] Bastou colocar ele na cozinha com o DeepSeek e o GPT.'),
    ]),
    N('c05', 'coop', J('coop1', rotulo='auto'),
      'Tique vinte e quatro, [[s:expirou:0.5]] a primeira salada expira. Tique vinte e sete, a primeira sopa. Tique trinta, outra salada. E a cozinha virou uma fila na frente da tábua um.'),
    CH('c06', 'coop', J('coop1', de=35.6, zoom=dict(x=7, y=2, s=1.3)), [
        ('N', 'E aí o Deep pede uma coisa muito clara pro Gêmeo:'),
        ('Deep', 'GÊMEO, SEGURA A ALFACE! TÔ BOTANDO O TOMATE PICADO NO PRATO JÁ — NÃO SOLTA ESSA ALFACE!', 36, {'trig': True}),
        ('Gêmeo', 'LARGUEI A ALFACE NA 2, PEGA AÍ! ESQUECE ESSA SOPA DE 6S QUE NÃO DÁ TEMPO!', 36),
        ('N', '"Não solta essa alface." [[s:record-scratch:0.5]] Soltou. No mesmo segundo. [[m:monkey-puppet-awkward:right:2.2]]'),
    ]),
    CH('c07', 'coop', J('coop1', de=48.6), [
        ('N', 'E aí, no tique quarenta e nove, o Gêmeo percebe uma coisa:'),
        ('Gêmeo', 'NÃO TEM SALADA NOS PEDIDOS, SEUS DOIDOS! OLHEM OS PEDIDOS!', 49, {'trig': True}),
        ('N', 'Os três tavam montando uma salada que ninguém tinha pedido. [[m:math-lady:right:2.4]] E quatro tiques depois:'),
        ('Gêmeo', 'PAREM DE SE MATAR NA CEBOLA! VOU ADIANTAR O HAMBÚRGUER!', 53),
        ('N', 'O Gêmeo virou o narrador da partida. [[m:galvao-clima-terrivel:right:2.2]]'),
    ]),
    CH('c08', 'coop', J('coop1', de=57.6), [
        ('N', 'E o pensamento secreto do Claudinho, no tique cinquenta e oito. A fala é normal:'),
        ('Claudinho', 'DEEP, CEBOLA NA TÁBUA 1! ESSA É A TERCEIRA PRA PANELA 1, GEPETO FICA DE OLHO!', 58),
        ('N', 'Mas a cabeça...'),
        ('Claudinho', 'Panela 1 já tem 2 cebolas picadas. Uma a mais e a sopa sai, mas o Deep tá enroscado perto da tábua e já me travou quatro vezes.', 58, {'pensa': True}),
        ('N', '"Já me travou quatro vezes." [[m:side-eye-dog:right:2.2]] O Claude contando os esbarrões em silêncio. E ele nem sabia: no fim da partida, o Deep tinha travado alguém oitenta e nove vezes.'),
    ]),
    CH('c08b', 'coop', J('coop1', de=61.6), [
        ('N', 'Tique sessenta e dois. Repara: os quatro chefs estão travados ao mesmo tempo. [[x:0.6:12]] Ninguém consegue dar um passo. E o Deep, no meio do engarrafamento, grita:'),
        ('Deep', 'GÊMEO, CORRE COM ESSA CARNE! CLAUDINHO, PÕE O PÃO NO PRATO! EU MONTO O BURGER, ME DÁ O PRATO CHEIO QUANDO TIVER PRONTO!', 62),
        ('N', '"Eu monto o hambúrguer." E no pensamento:'),
        ('Deep', 'Burger em 10s e eu de prato vazio na mão — não dá tempo sozinho. Uso esse prato pra adiantar alface da salada e grito pro Gêmeo largar a carne e o Claudinho botar o pão. Se ninguém se mexer, é -10 de novo.', 62, {'pensa': True}),
        ('N', 'Ele grita "hambúrguer" e monta salada. [[m:roll-safe:right:2.2]]'),
    ]),
    CH('c09', 'coop', J('coop1', de=70.6), [
        ('N', 'Tique setenta e um. Dois chefs, duas estratégias, no mesmo segundo:'),
        ('Deep', 'SOPA DE TOMATE TÁ PERDIDA, SÓ TEM 1 TOMATE NA PANELA! FOCO NAS SALADAS! TÔ MONTANDO UMA AGORA, GÊMEO MANDA TOMATE PICADO!', 71),
        ('Gepeto', 'JOGANDO A CEBOLA FORA! FOCO TOTAL NA SOPA DE TOMATE!', 71),
        ('N', 'O Deep: "esquece a sopa de tomate, foco na salada". O Gepeto: "joga a cebola fora, foco total na sopa de tomate". [[m:drake-no:right:2.2]] E o Gepeto passou três tiques indo jogar cebola no lixo. E jogou.'),
    ]),
    N('c10', 'coop', J('coop1', de=74.5, rotulo='auto'),
      '[[s:expirou:0.4]] Pedido expirando. [[s:expirou:0.4]] Mais um. E mais um. No tique oitenta e cinco, o placar chega no fundo do poço: [[x:0.8:16]] menos cento e vinte pontos. [[t:-120:2:#ff5a3c]] Doze pedidos perdidos, zero entregas. [[m:this-is-fine:right:2.6]]'),
    CH('c11', 'coop', J('coop1', de=86.6, zoom=dict(x=9, y=0, s=1.35)), [
        ('N', 'Mas aí... as panelas finalmente ficam prontas. E o Deep e o Claudinho vão servir a mesma sopa.'),
        ('Deep', 'EU PEGO O TOMATE, CLAUDINHO! SEGURA A CEbola!', 87),
        ('Claudinho', 'EU PEGO A SOPA DE TOMATE DO FOGÃO 2! DEEP, NÃO SAI DO CAMINHO!', 87, {'trig': True}),
        ('N', 'O Deep chega primeiro, serve... e:'),
        ('Deep', 'SAI DA MINHA FRENTE, CLAUDINHO! SOPA DE TOMATE INDO PRO PASSA-PRATO AGORA!', 88),
        ('N', '[[s:moeda:0.7]][[p]] PRIMEIRA ENTREGA! Tique oitenta e oito, quase três minutos de partida. [[m:we-did-it:right:2.4]]'),
    ]),
    CH('c12', 'coop', J('coop1', de=89.6), [
        ('N', 'E dois tiques depois, a mesma briga, só que ao contrário:'),
        ('Claudinho', 'EU JÁ TENHO O PRATO! DEEP, NÃO PEGA OUTRO, VAI NO FOGÃO 2!', 90),
        ('Deep', 'SERVINDO A SOPA DO FOGÃO 1 AGORA! CLAUDINHO PEGA PRATO QUE TEM OUTRA CEbola NA PANELA!', 90),
        ('N', 'Dessa vez o Claudinho chegou primeiro. [[s:moeda:0.7]]'),
        ('Claudinho', 'SOPA NO PASSA-PRATO! DEEP, PEGA O PRATO LIMPO DA PILHA PRA OUTRA SOPA!', 91),
        ('N', 'Duas entregas em seis segundos! Menos cento e vinte virou menos setenta e três. [[m:lets-go:right:2.2]]'),
    ]),
    CH('c13a', 'coop', J('coop1', de=98.6), [
        ('N', 'Tique noventa e nove. Uma salada expira em dez segundos, e o tomate picado tá na bancada onze. O Deep avisa:'),
        ('Deep', 'SAI DO CAMINHO, CLAUDINHO! VOU MONTAR ESSA SALADA E ENTREGAR, NINGUÉM TOCA NO TOMATE DA 11!', 99, {'trig': True}),
        ('Gêmeo', 'PEGUEI O TOMATE! LEVA A ALFACE PRO PASSA-PRATO QUE EU JUNTO LÁ, VAI EXPIRAR!', 99),
        ('Claudinho', 'EU MONTO A SALADA! GEPETO, PEGA A ALFACE NA 7 E ME TRAZ QUE EU FECHO!', 99),
        ('N', '"Ninguém toca no tomate." O Gêmeo pegou o tomate. O Claudinho foi atrás do mesmo tomate. E o prato com alface que o Deep queria? O Gepeto pegou. [[m:monkey-puppet-awkward:right:2.4]] Quatro chefs, uma salada, quatro planos.'),
    ]),
    N('c13', 'coop', J('coop1', de=102.2, rotulo='auto'),
      'E essa salada? [[s:expirou:0.5]] Expirou no tique cento e quatro. E no mesmo tique, o Gepeto jogou no lixo... um prato limpo. Vazio. [[m:silvio-santos-shrug:right:2.2]] E o relógio foi acabando. As duas sopas do tique oitenta e oito e do noventa e um foram as únicas entregas da partida.'),
    CH('c14', 'coop', J('coop1', de=108.5, zoom=dict(chef='Deep', s=1.5)), [
        ('N', 'E no último tique, quem fecha a partida é o Deep. O chef que mais travou os outros:'),
        ('Deep', 'ACABOU O TEMPO, GALERA! FOI MAL, TRAVEI NO MEIO DE TODO MUNDO!', 109),
        ('N', '[[s:fim:0.6]] Pelo menos ele admitiu. [[m:dicaprio-slow-clap:right:2.4]]'),
    ]),
    N('c15', 'coop', comp('OCNumeros', titulo='A COZINHA DO CAOS', sub='4 IAs juntas · 110 tiques',
                          valores=[dict(empresa='DeepSeek', valor=89, rotulo='vezes travou alguém'), dict(empresa='Claude', valor=46, rotulo='vezes travou alguém'),
                                   dict(empresa='Gemini', valor=44, rotulo='vezes travou alguém'), dict(empresa='GPT', valor=6, rotulo='vezes travou alguém')]),
      'Resultado do coop: [[s:sad-trombone:0.4]] menos oitenta e três pontos. Duas entregas, treze pedidos expirados. [[t:-83 PONTOS:1.8:#ff5a3c]] E quem mais atrapalhou: o Deep, que ficou na frente de alguém oitenta e nove vezes. O Gepeto, do GPT, foi o mais educado no trânsito: travou só seis vezes. Só que ele foi travado sessenta e quatro. Quarenta e sete delas, pelo Deep.'),

    # ================================================================== FIM
    N('z01', 'fim', placar(['fase1', 'fase2', 'fase3'], 'CAMPEÃO DO VERSUS'),
      '[[s:drumroll:0.4]] Então, o resultado final. No versus, [[p]][[s:impact-epic:0.5]] o campeão é o Gemini. Ganhou duas das três fases, empatou a outra, e foi o único a terminar no positivo. [[m:cr7-siuuu:right:2.2]]'),
    N('z02', 'fim', comp('OCElenco', passo=8, destaque='Gemini'),
      'E os prêmios. [[s:pop:0.4]] Chef mais calmo: o Gemini, que gritou menos que DeepSeek e GPT, travou menos o parceiro, e entregou mais. [[s:pop:0.4]] O gritão: o GPT, quatrocentos e noventa e nove gritos e o pior placar. [[s:pop:0.4]] O rei da espera: o Claude, cento e dez vezes parado... e que no coop aprendeu a gritar. [[s:pop:0.4]] E o trator da cozinha: o DeepSeek, que brigou com o parceiro, xingou o parceiro, e no coop travou todo mundo. Mas pediu desculpa.'),
    N('z03', 'fim', J('coop1', modo='um', de=60, vel=1, sons=False, falas=True, replay=True),
      'E o que eu aprendi: IA hoje consegue jogar um jogo de cozinha em tempo real, conversar, combinar tarefa... [[s:whoosh:0.3]] mas na hora de entregar uma sopa, ela ainda acha que uma cebola é três. [[m:roll-safe:right:2.2]] Comenta aí qual jogo você quer ver as IAs jogando agora, e qual IA você acha que eu devia colocar na próxima. Se inscreve, deixa o like, e até a próxima.', pad=1.4),
]

# Trilha (Kevin MacLeod, CC BY 4.0) por bloco, lida por scripts/mix_audio.py --roteiro roteiro_oc:
# (primeira cena, música, início dentro da faixa em s[, ganho extra, corte seco])
CUES = [
    ('a01', 'mega-hyper-ultrastorm', 0),
    ('a03', 'pixel-peeker-polka-faster', 0),
    ('r01', 'chipper-doodle-v2', 0),
    ('f101', 'fluffing-a-duck', 0),
    ('f109', 'sneaky-snitch', 0),
    ('f112', 'monkeys-spinning-monkeys', 0),
    ('f117', 'winner-winner', 0),
    ('f201', 'quirky-dog', 0),
    ('f206', 'itty-bitty-8-bit', 0),
    ('f211', 'heartbreaking', 0),
    ('f301', 'voxel-revolution', 0),
    ('f307', '8bit-dungeon-boss', 0),
    ('f312', 'heroic-age', 0),
    ('c01', 'mega-hyper-ultrastorm', 30),
    ('c06', 'bit-shift', 0),
    ('c11', 'call-to-adventure', 0),
    ('c15', 'despair-and-triumph', 0),
    ('z01', 'winner-winner', 20),
    ('z03', 'local-forecast-elevator', 0),
]
SEM_TRILHA = ['OCTitulo']
