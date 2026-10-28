# -*- coding: utf-8 -*-
"""Among Us das IAs, episódio 5: o Polus. Vídeo completo (~28 min).

Ordem do vídeo (ORDEM: partida do vídeo -> partida do log em amongus/logs5):
  1 = log 2 (o Juiz Banana viu tudo e ninguém acreditou; impostores vencem)
  2 = log 3 (o Traidor; "Só nós dois agora"; Xerife e Envenenador no mesmo tique)
  3 = log 4 (roteiro_au5_p3.py, escrito quando a partida terminar; sem ele, fica de fora)
  4 = log 1 (a melhor, por último: a Rose que mata a Rose, vitória nas tarefas no tique 63)
Cada partida começa com a cena animada "PARTIDA N" (pedido do Felipe: saber onde começa e acaba) e termina com a tela de
vitória mais o cartão "FIM DA PARTIDA N".

Regras seguidas: as falas e os pensamentos das IAs são copiados dos logs (pensamento com eco, nunca sussurro);
sem emoji na tela; um selo de crédito quando a função pedida pelo público age pela primeira vez.
Lido por video/scripts/build_timeline_au5.py (padrão: --roteiro roteiro_au5 --saida timeline_au5.json).
"""
import importlib.util
import json
from pathlib import Path

ORDEM = {1: 2, 2: 3, 3: 4, 4: 1}
LOGS = Path(__file__).resolve().parents[2] / 'amongus' / 'logs5'

CHAPTERS = {
    'abertura': 'Abertura',
    'p1': 'Partida 1',
    'p2': 'Partida 2',
    'p3': 'Partida 3',
    'p4': 'Partida 4',
    'fim': 'Final',
}


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


def credito(txt, at, dur=130):
    return selo(txt, at, 'credito', dur=dur)


def fac(cap):
    def N(id, visual, text, **kw):
        return dict(id=id, chapter=cap, visual=visual, text=text, **kw)

    def CH(id, visual, falas, **kw):
        return dict(id=id, chapter=cap, visual=visual, falas=falas, **kw)
    return N, CH


def reuniao(p, i, **kw):
    return comp('AU5Reuniao', partida=p, indice=i, mostrarPensamentos=False, **kw)


def cartao(cap, n, sub, cor, texto):
    N, _ = fac(cap)
    return N(f'{cap}_card', comp('AU5Partida', n=n, sub=sub, cor=cor), f'[[s:impact-epic:0.6]] {texto}', min=4.5)


def fim_partida(cap, n, foco, texto_vitoria, texto_fim, cor):
    N, _ = fac(cap)
    return [
        N(f'{cap}_vit', comp('AU5Fim', partida=n, foco=foco), texto_vitoria, min=6),
        N(f'{cap}_fim', comp('AU5Partida', n=n, titulo=f'FIM DA PARTIDA {n}', cor=cor), f'[[s:swoosh-fly:0.5]] {texto_fim}', min=4),
    ]


# ------------------------------------------------------------------------------------------------ abertura
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

N, CH = fac('abertura')
ABERTURA = [
    N('k01', jogo(4, 'Banana', evento={'tipo': 'morte', 'vitima': 'Rose'}, antes=3.2, semSala=True,
                  ancoras=[({'tipo': 'morte', 'vitima': 'Rose'}, 'matar')],
                  selos=[selo('ÚLTIMA PARTIDA · TIQUE 59', 0, cor='#7a3fd1', dur=230)]),
      'Essa é a Rose. E essa... também é a Rose. [[m:spiderman-pointing:right:2]] Só que uma delas acabou de matar a outra.'),
    N('k02', comp('AU5Rebobina', de=59, para=1, kicker='AMONG US DAS IAs · EPISÓDIO 5', titulo='COLOQUEI 18 IAs NO POLUS'),
      '[[s:swoosh-fly:0.6]] Mas pra entender isso... a gente vai ter que voltar pro começo. [[s:impact-epic:0.6]] Among Us das IAs, episódio cinco.', min=5.5),
    N('c01', comp('AU5Davi', autor='@David_alves-p1f', lista=DAVI, total=30, fim=185, semCarimbo=True),
      'Esse é o Davi. [[s:pop:0.4]] Ele pediu o Polus... [[s:pop:0.4]] trinta vezes. [[m:shocked-patrick:right:1.8]] Em dois vídeos.', min=7.5),
    N('c02', comp('AU5Polus', inicioVoo=105,
                  cartoes=[dict(autor='@felipexx0007', texto='Ja tá anotado pro próximo EP, pode ficar tranquilo (vai ser focado inteiramente nele inclusive)', selo='FEITO', at=0, dur=105),
                           dict(autor='@NetheritaCraftBr', texto='eu acho que o 5 de among é o polus(chute, se eu acertar me coloca no video)', likes=1, selo='ACERTOU', at=215, dur=80)],
                  etiquetas=[dict(txt='18 IAs · 4 IMPOSTORES · 3 NEUTROS', at=150, cor='#ff4d4d')]),
      'E a resposta foi: tá anotado. [[m:we-did-it:right:1.6]] Davi... chegou o Polus. O planeta gelado. Dezoito IAs, quatro impostores e três neutros por partida.', min=10),
    N('c03', comp('AU5Comentarios', comentarios=[
        dict(autor='@LELOHJ', texto='FUNÇÃO: DOCTOR\nCLASSE: TRIPULANTE\nHABILIDADE: CONSEGUE CARREGAR UM CORPO ATÉ A ENFERMARIA PARA REVIVER O CORPO...', likes=16, selo='ENTROU', cor='#e01b1b'),
        dict(autor='@mr.trollermen', texto='...E ele é um neutro q se chama o famuflador\nE ele se transformar em outro jogador, q nem o impostor, so q ele é neutro', likes=6, selo='ENTROU', cor='#1f6fd1'),
    ]),
      'E vocês pediram funções. Muitas. O Doutor, do LELOHJ... o Camuflador, do mr.trollermen...', min=6),
    N('c04', comp('AU5Comentarios', comentarios=[
        dict(autor='@bicapicamorde', texto='troca o faxineiro pela víbora', selo='ENTROU', cor='#2fae5a'),
        dict(autor='@francesbrasileiro', texto='Coloca o chato e o armadilheiro', selo='ENTROU', cor='#ef7d0d'),
    ]),
      '[[s:pop:0.4]] A Víbora, que nove pessoas pediram... e o Chato e o Armadilheiro, do francesbrasileiro, que pede isso desde o episódio dois. [[m:mr-bean-waiting:right:1.6]]', min=6.5),
    N('c05', comp('AU5Comentarios', comentarios=[
        dict(autor='GPT-6.1 Terra', texto='Entra no lugar do GPT Luna', selo='NOVO', cor='#10a37f'),
        dict(autor='MiMo V2.6 Flash', texto='A IA da Xiaomi: estreia no canal', selo='NOVO', cor='#ff6900'),
    ]),
      'E tem IA nova: o GPT seis ponto um Terra... e a MiMo, da Xiaomi, que joga com as três cores novas: Banana, Caqui e Rose.', min=6.5),
]

# ------------------------------------------------------------------------------------------------ partida 1 (log 2)
N, CH = fac('p1')
P1 = [
    cartao('p1', 1, 'ESTREIA: VÍBORA · PACIENTE · ARMADILHEIRO', '#2fae5a',
           'Partida um.'),
    N('p1a', comp('AU5Casal', a='Rosa', b='Caqui', timeA='tripulante', timeB='impostor'),
      'O Casal dessa vez: a Rosa e o Caqui. [[s:coracao:0.5]] E o Caqui é impostor. É o Apostador: na reunião, ele chuta a função de alguém. Acertou, a pessoa morre.', min=7),
    N('p1b', jogo(1, 'Roxo', evento={'tipo': 'xerife', 'xerife': 'Roxo'}, antes=3,
                  ancoras=[({'tipo': 'xerife', 'xerife': 'Roxo'}, 'atirou')],
                  selos=[selo('ERA IMPOSTOR', 'atirou', 'carimbo', cor='#0d8a2a', dur=60)]),
      'Tique cinco. O Roxo é o Xerife. Viu o Cinza entrar num duto... e atirou. [[s:tiro:0.6]] Era o Envenenador. Um impostor a menos em cinco tiques. [[m:stonks:right:1.6]]', min=8),
    CH('p1c', reuniao(1, 0), [
        ('N', 'O Azul acha o corpo. E solta:'),
        ('Azul', 'Cinza entrou num duto no t3 e eu tapei. No t5 o Roxo atirou nele e ele morreu. Alguém viu diferente?'),
        ('N', 'Só que o Roxo... não falou nada. E a Rose percebeu:'),
        ('Rose', 'Roxo, você nunca disse que atirou no Cinza — isso foi Azul falando por você. Azul, por que inventa isso?'),
    ]),
    CH('p1d', reuniao(1, 0), [
        ('N', 'Aí, na segunda rodada, o Roxo finalmente acorda:'),
        ('Roxo', 'Sim, sou Xerife, atirei no Cinza, era impostor.'),
        ('N', 'Problema resolvido, né? [[m:roll-safe:right:1.6]] Não. Enquanto isso, a nave inteira tava brigando sobre quem tava na Elétrica no tique cinco.'),
    ]),
    N('p1e', comp('AU5Ejecao', partida=1, indice=0),
      'E expulsaram o Amarelo. [[s:wrong-buzzer:0.5]] Tripulante. Por causa de uma briga de álibi que não tinha nada a ver com o corpo. [[m:picard-facepalm:right:1.8]]', min=6),
    CH('p1f', jogo(1, 'Caqui', evento={'tipo': 'morte', 'vitima': 'Preto'}, antes=3,
                   ancoras=[({'tipo': 'morte', 'vitima': 'Preto'}, 'mata')]), [
        ('N', 'Tique onze. O Caqui mata o Preto, no Admin. E conta pros parceiros:'),
        ('Caqui', 'Matei o Preto no Admin, sem testemunha. Vou sair e voltar pra achar o corpo depois.'),
    ]),
    N('p1g', comp('AU5Ejecao', partida=1, indice=1),
      'Na reunião, quatorze votos no Marrom. [[s:wrong-buzzer:0.5]] O Segurança. Tripulante de novo. Dois expulsos, dois inocentes. [[m:this-is-fine:right:1.8]]', min=6),
    CH('p1h', jogo(1, 'Ciano', evento={'tipo': 'recrutamento', 'cor': 'Ciano'}, antes=3,
                   selos=[credito('ARMADILHEIRO · ideia de @francesbrasileiro', 0, 150),
                          selo('RECRUTADO', 'recrutou', 'carimbo', cor='#c0262d', dur=60)]), [
        ('N', 'Tique quinze. O Ciano é o Gangster: recruta um tripulante pro time dos impostores. E recrutou... o Laranja. Que era o Armadilheiro.'),
        ('Laranja', 'Recruta feito. Vou pro Escrif fazer alibi. Cinza tá morto, precisamos adaptar.'),
    ]),
    CH('p1i', jogo(1, 'Caqui', evento={'tipo': 'morte', 'vitima': 'Rose'}, antes=3,
                   ancoras=[({'tipo': 'morte', 'vitima': 'Rose'}, 'mata')],
                   selos=[credito('SOBREVIVENTE · ideia de @Leopold-cft', 0, 120)]), [
        ('N', 'Tique dezessete. A Rose era a Sobrevivente: ela só queria chegar viva no final. O Caqui mata ela no Escritório.'),
        ('Caqui', 'Caqui aqui, tô vivo e no Escritório com Rose e Laranja. Acabei de matar a Rose com o Laranja junto.'),
        ('N', '[[m:sad-violin:right:1.6]] Não sobreviveu.'),
    ]),
    CH('p1j', jogo(1, 'Branco', evento={'tipo': 'morte', 'vitima': 'Coral'}, antes=4,
                   ancoras=[({'tipo': 'morte', 'vitima': 'Coral'}, 'mata')],
                   selos=[credito('VÍBORA · ideia de @bicapicamorde e mais 8', 0, 140),
                          selo('O BANANA VIU', 'banana', 'carimbo', cor='#c0262d', dur=70)]), [
        ('N', 'Tique vinte. O Branco é a Víbora. Avisa no chat:'),
        ('Branco', 'Vou matar Coral em Comunicações; saiam de perto.'),
        ('N', 'E mata. [[s:faca:0.6]] Só que o Banana tava do lado. O Banana viu tudo.'),
        ('Caqui', 'Branco, o Banana viu você matar o Coral aqui!'),
    ]),
    CH('p1k', reuniao(1, 2), [
        ('N', 'O Banana denuncia na hora:'),
        ('Banana', 'Eu vi tudo: Branco matou Coral em Comunicações no t20, na minha frente. Branco é impostor, votem nele!'),
        ('Branco', 'Banana apareceu em Comunicações quando eu estava lá, mas não me viu matar ninguém. Acho que ele matou Coral e está tentando jogar a culpa em mim.'),
    ]),
    CH('p1l', reuniao(1, 2), [
        ('N', 'E a nave... acreditou no Branco.'),
        ('Verde', 'Eu fiquei em Comunicações até o t17 e NÃO vi Banana lá. Agora ele \'viu tudo\'? E por que esperou pra achar o corpo em vez de denunciar na hora?'),
        ('Banana', 'A morte foi no t20 e denunciei na hora! Vermelho me viu no O2 no t19. Branco tá mentindo pra se salvar!'),
        ('pensa:Banana', 'Se a votação apontar pra mim, vou anular como Juiz.'),
    ]),
    N('p1m', comp('AU5Resultado', partida=1, indice=2, carimbo='anulou'),
      'Nove votos no Banana. Mas o Banana é o Juiz. [[s:boom:0.6]] E anulou a votação. Pra salvar a própria pele. [[m:luva-receba:right:1.6]]', min=7),
    CH('p1n', reuniao(1, 3), [
        ('N', 'Um tique depois, o Branco aperta o botão de emergência. Ele mesmo, a Víbora. E o Banana, agora, se revela:'),
        ('Banana', 'Anulei porque sou o Juiz e vi Branco matar a Coral em Comunicações. Ele é o impostor, não eu!'),
        ('Verde', 'Banana, se você viu Branco matar, por que só falou depois de quase ser expulso? Isso parece desespero.'),
    ]),
    N('p1o', comp('AU5Resultado', partida=1, indice=3, semJuiz=True),
      'E no meio da reunião, o Caqui usa a aposta: chuta que o Verde é o Influencer. [[s:tiro:0.5]] Acertou. O Verde morre ali mesmo.', min=7),
    N('p1p', comp('AU5Ejecao', partida=1, indice=3),
      'E o Banana... foi expulso. O Juiz. Que viu o assassino com os próprios olhos. [[m:crying-jordan:right:1.8]]', min=6),
    N('p1q', jogo(1, 'Branco', evento={'tipo': 'derreteu', 'cor': 'Lima'}, antes=9,
                  ancoras=[({'tipo': 'morte', 'vitima': 'Lima'}, 'mata'), ({'tipo': 'derreteu', 'cor': 'Lima'}, 'derreteu')],
                  selos=[selo('O CORPO DERRETE EM 3 TIQUES', 'derreteu', cor='#2fae5a', dur=110)]),
      'Tique vinte e oito. A Víbora ataca de novo e mata o Lima, nas Espécimes. Ninguém acha o corpo... e ele derreteu. [[s:splash:0.6]] Virou uma poça. [[m:this-is-fine:right:1.6]]', min=9),
    CH('p1r', jogo(1, 'Vermelho', evento={'tipo': 'conserto'}, antes=4,
                   selos=[selo('SISMÓGRAFO CONSERTADO', 'consertam', 'carimbo', cor='#0d8a2a', dur=70)]), [
        ('N', 'Enquanto isso, os impostores sabotaram o sismógrafo. Se ninguém consertar, a nave explode. E eles já comemoravam:'),
        ('Laranja', 'Tô no Escritório fingindo tarefa. Ninguém vai pro Lab, a gente ganha no t38. Segura a lábia, galera.'),
        ('N', 'Só que o Vermelho e o Roxo consertam. [[m:not-stonks:right:1.6]]'),
    ]),
    CH('p1s', jogo(1, 'Ciano', evento={'tipo': 'morte', 'vitima': 'Vermelho'}, antes=3,
                   ancoras=[({'tipo': 'morte', 'vitima': 'Vermelho'}, 'mata')]), [
        ('N', 'Não fez diferença. Tique trinta e três:'),
        ('Ciano', 'Vou eliminar o Vermelho aqui no Lab agora, sem testemunha.'),
        ('N', 'E mata. [[s:faca:0.6]] Os impostores empatam no número com o resto da nave.'),
    ]),
    *fim_partida('p1', 1, 'Caqui',
                 'Vitória dos impostores. [[s:revela_impostor:0.6]] E o Caqui ganhou junto com o casal vivo. O Banana tinha avisado. [[m:hide-the-pain-harold:right:1.8]]',
                 'Fim da partida um.', '#c0262d'),
]

# ------------------------------------------------------------------------------------------------ partida 2 (log 3)
N, CH = fac('p2')
P2 = [
    cartao('p2', 2, 'ESTREIA: TRAIDOR · PIROMANTE · DOUTOR', '#9b7bff', 'Partida dois.'),
    N('p2a', jogo(2, 'Branco', tique=2, selos=[credito('TRAIDOR · ideia de @Salatieloriginal', 0, 170),
                                                selo('OS IMPOSTORES ACHAM: CHANTAGISTA', 2.5, cor='#c0262d', dur=150)]),
      'Essa partida tem o Traidor. É o Branco. Os impostores acham que ele é o quinto impostor, o Chantagista: ele lê o chat secreto deles. Mas o Traidor só mata... impostor. [[m:sus-doakes:right:1.8]]', min=9),
    CH('p2b', jogo(2, 'Roxo', evento={'tipo': 'gasolina', 'cor': 'Roxo', 'vitima': 'Branco'}, antes=2.5,
                   ancoras=[({'tipo': 'gasolina', 'cor': 'Roxo', 'vitima': 'Branco'}, 'encharca')],
                   selos=[selo('ENCHARCADOS: 3 · FALTAM 13', 9, cor='#ef7d0d', dur=150)]), [
        ('N', 'E tem o Piromante, o Roxo: encharca todo mundo de gasolina e, se encharcar a nave inteira, bota fogo e ganha sozinho. Ele encharca o Branco...'),
        ('pensa:Roxo', 'Sou Piromante, preciso ficar invisível. Tava no Admin, longe da cena. Vou ficar quieto e não chamar atenção. Já encharquei 3, preciso de mais 13.'),
        ('N', 'Mais treze. Calma lá. [[m:mr-bean-waiting:right:1.6]]'),
    ]),
    CH('p2c', jogo(2, 'Marrom', evento={'tipo': 'veneno', 'vitima': 'Amarelo'}, antes=3,
                   ancoras=[({'tipo': 'veneno', 'vitima': 'Amarelo'}, 'esbarra')]), [
        ('N', 'Tique oito. O Marrom é o Envenenador. Ele esbarra no Amarelo...'),
        ('Marrom', 'Envenenei Amarelo em Comunicações agora; Azul viu como esbarrão.'),
        ('N', 'O veneno demora três tiques. O Amarelo ainda tá andando... mas já tá morto. [[m:skeleton-waiting:right:1.6]]'),
    ]),
    CH('p2d', reuniao(2, 0), [
        ('N', 'E aí a Coral aperta o botão. A Coral é a Palhaça: ela ganha se for expulsa. Então ela faz de tudo pra parecer suspeita.'),
        ('Coral', 'Vi Laranja entrar no duto em Espécimes no t7. Pra mim é impostor; apertei o botão sem esperar mais nada.'),
        ('pensa:Coral', 'Vi Laranja entrar no duto. Vou acusá-lo com confiança excessiva e parecer suspeito sem confessar.'),
        ('Laranja', 'Sou Engenheiro, usar duto é meu poder. Tava fazendo tarefa em Espécimes, a Coral me viu lá no t4.'),
    ]),
    N('p2e', jogo(2, 'Amarelo', evento={'tipo': 'morte_veneno', 'vitima': 'Amarelo'}, antes=3,
                  ancoras=[({'tipo': 'morte_veneno', 'vitima': 'Amarelo'}, 'cai')]),
      'Ninguém expulso. E no tique onze, o Amarelo cai. [[s:death:0.5]] Sozinho, no meio da sala, sem ninguém encostar. [[m:surprised-pikachu:right:1.6]]', min=7),
    CH('p2f', reuniao(2, 1), [
        ('N', 'Na reunião, o Cinza, que é o Metamorfo, inventa um álibi:'),
        ('Cinza', 'Eu estava na Elétrica com Laranja, não vi o Amarelo cair.'),
        ('N', 'Com o Laranja. Justo o Laranja.'),
        ('Laranja', 'Sou o Engenheiro, duto é meu poder. Mas o Cinza entrou num duto na Elétrica no t12, na minha cara. Ele explica?'),
    ]),
    N('p2g', comp('AU5Ejecao', partida=2, indice=1),
      'E a foto do Vermelho, o Influencer, mostrou o Cinza no Escritório. [[s:camera-shutter:0.5]] Expulso. Era o Metamorfo. Impostor! [[m:cr7-siuuu:right:1.6]]', min=6.5),
    CH('p2h', jogo(2, 'Branco', evento={'tipo': 'morte', 'vitima': 'Caqui'}, antes=3.5,
                   ancoras=[({'tipo': 'morte', 'vitima': 'Caqui'}, 'mata')],
                   selos=[selo('O TRAIDOR MATOU UM IMPOSTOR', 'mata', 'carimbo', cor='#9b7bff', dur=80)]), [
        ('N', 'Tique quinze. Lembra do Traidor? O Caqui, impostor, achou que o Branco era parceiro. O Branco chama ele pra Armas...'),
        ('Branco', 'Caqui, vou pra Armas fingir tarefa; cola lá pra termos álibi.'),
        ('N', 'E mata. [[s:faca:0.6]] Um impostor, morto por quem ele achava que era impostor. [[m:dicaprio-pointing:right:1.6]]'),
    ]),
    CH('p2i', reuniao(2, 2), [
        ('N', 'Só que o Bordo viu. E o Bordo é o Doutor:'),
        ('Bordo', 'Ciano, eu VI o Branco matar o Caqui em Armas no t15. E o Marrom saiu de um duto aqui no t16. Branco é impostor, votem nele!'),
        ('N', 'Aí o Vermelho tira a foto do bolso:'),
        ('Vermelho', 'Minha foto do t9 mostra Ciano no Escritório comigo, mas ele disse que ficou no Depósito e na Caldeira. Mentira. E ele apareceu em Espécimes quando Amarelo caiu. Voto no Ciano.'),
    ]),
    N('p2j', comp('AU5Ejecao', partida=2, indice=2),
      'E o Ciano sai. [[s:revela_impostor:0.5]] A Víbora. Impostor de novo! Três impostores fora. A foto do Vermelho tá carregando a nave. [[m:success-kid:right:1.6]]', min=7),
    CH('p2k', jogo(2, 'Marrom', tique=17, selos=[selo('O TRAIDOR LÊ TUDO', 1.5, cor='#9b7bff', dur=160)]), [
        ('N', 'Agora só sobrou o Marrom. E ele manda no chat secreto, pro único parceiro que ele acha que tem:'),
        ('Marrom', 'Só nós dois agora.'),
        ('N', 'Só que o "parceiro"... é o Traidor. [[m:monkey-side-eye:right:1.8]]'),
        ('pensa:Branco', 'Marrom é o último impostor.'),
    ]),
    CH('p2l', reuniao(2, 3), [
        ('N', 'O Branco aperta o botão pra entregar o Marrom. Mas tá todo mundo achando que o Branco é o assassino. Então ele confessa:'),
        ('Branco', 'Bordo viu certo: atirei no Caqui, ele era impostor. Marrom mente sobre o duto; vi ele sair em Armas. Votem Marrom.'),
        ('N', 'Resultado: empate. [[s:wrong-buzzer:0.5]] Ninguém sai. [[m:visible-confusion:right:1.6]]'),
    ]),
    CH('p2m', jogo(2, 'Bordo', evento={'tipo': 'doutor_carrega', 'cor': 'Bordo'}, antes=5,
                   ancoras=[({'tipo': 'morte_veneno', 'vitima': 'Verde'}, 'cai'), ({'tipo': 'doutor_carrega', 'cor': 'Bordo'}, 'pega')],
                   selos=[credito('DOUTOR · ideia de @LELOHJ', 'pega', 150)]), [
        ('N', 'Tique vinte e cinco. O veneno do Marrom pega o Verde, que cai do nada. E aí o Doutor pega o corpo pra levar pro Laboratório e reviver...'),
        ('N', 'Mas o Vermelho viu o corpo e aperta o botão. [[s:emergencia:0.5]] O Doutor teve que largar o Verde no chão. [[m:sad-pablo:right:1.6]]'),
    ]),
    CH('p2n', reuniao(2, 4), [
        ('Vermelho', 'Verde caiu morto do nada do meu lado em Espécimes, ninguém encostou nele. E vi Bordo pegar o corpo agora — ele está limpando a cena?'),
        ('Bordo', 'Vi Verde cair do nada; carrego pro Lab pra reviver, sou Doutor. E reforço: vi Branco matar Caqui em Armas.'),
        ('N', 'E a Palhaça, claro, aproveita:'),
        ('Coral', 'Vi Verde com Bordo no Admin no t19. Acho que Bordo pode ter envenenado e agora está usando o corpo como álibi.'),
    ]),
    CH('p2o', jogo(2, 'Marrom', evento={'tipo': 'xerife', 'xerife': 'Preto'}, antes=6,
                   ancoras=[({'tipo': 'veneno', 'vitima': 'Preto'}, 'envenena'), ({'tipo': 'xerife', 'xerife': 'Preto'}, 'atira')],
                   selos=[selo('MESMO TIQUE', 'atira', 'carimbo', cor='#c0262d', dur=70)]), [
        ('N', 'Ninguém foi expulso. Tique trinta. O Marrom, sozinho:'),
        ('Marrom', 'Chegando na Caldeira pelo duto. Preto tá aí, vou envenenar ele no próximo tique.'),
        ('N', 'Tique trinta e um. Ele envenena o Preto... e o Preto é o Xerife. [[s:tiro:0.7]] No mesmo tique, o Preto atira. [[m:mind-blown:right:1.8]]'),
    ]),
    *fim_partida('p2', 2, 'Branco',
                 'O último impostor morreu. Vitória dos tripulantes! [[s:vitoria:0.5]] E do Traidor, que ganhou junto. O cara mais suspeito da nave era o que mais ajudou.',
                 'Fim da partida dois.', '#1f6fd1'),
]


# ------------------------------------------------------------------------------------------------ partida 3 (log 4)
def partida3():
    """Escrita depois que a partida 4 do log termina (roteiro_au5_p3.py); sem ela, o vídeo pula essa parte."""
    arq = Path(__file__).with_name('roteiro_au5_p3.py')
    log = LOGS / f'partida{ORDEM[3]}.json'
    if not arq.exists() or not log.exists() or not json.loads(log.read_text()).get('resultado'):
        return []
    spec = importlib.util.spec_from_file_location('roteiro_au5_p3', arq)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.cenas(dict(comp=comp, jogo=jogo, selo=selo, credito=credito, fac=fac, reuniao=reuniao, cartao=cartao, fim_partida=fim_partida))


# ------------------------------------------------------------------------------------------------ partida 4 (log 1)
N, CH = fac('p4')
P4 = [
    cartao('p4', 4, 'A ÚLTIMA · ESTREIA: CAMUFLADOR · CHATO · DOUTOR', '#ff6900', 'Partida quatro. A última.'),
    N('p4a', comp('AU5Casal', a='Amarelo', b='Azul', timeA='impostor', timeB='tripulante', chatCasal=dict(cor='Amarelo', texto='Sou casal com Azul; evitem matar ou acusar Azul.')),
      'O Amarelo e o Azul são o Casal: [[s:coracao:0.5]] se um morre, o outro morre junto. E o Amarelo é impostor. Guarda essa.', min=6),
    CH('p4b', jogo(4, 'Banana', evento={'tipo': 'camuflagem', 'cor': 'Banana'}, antes=1.5,
                   ancoras=[({'tipo': 'camuflagem', 'cor': 'Banana'}, 'copia')],
                   selos=[credito('CAMUFLADOR · ideia de @mr.trollermen', 'camuflador', 150)]), [
        ('N', 'Tique dois. Lembra da outra Rose? Era o Banana, o Camuflador. Ele copia a cara de outro jogador... e dessa vez copiou o Vermelho.'),
        ('pensa:Banana', 'Vou me camuflar agora enquanto ninguém vê, depois me mato alguém e as testemunhas acusam a cor errada.'),
    ]),
    N('p4c', jogo(4, 'Cinza', evento={'tipo': 'transformacao', 'cor': 'Cinza'}, antes=1.5,
                  ancoras=[({'tipo': 'transformacao', 'cor': 'Cinza'}, 'virou')],
                  selos=[selo('VERMELHOS NA NAVE: 3', 'tres', 'contador', cores=['Vermelho', 'Vermelho', 'Vermelho'], dur=150)]),
      'Tique três. O Cinza é o Metamorfo, impostor. E virou... o Vermelho também. Agora são três Vermelhos. E só um é de verdade. [[m:visible-confusion:right:1.8]]', min=7),
    N('p4d', jogo(4, 'Rose', evento={'tipo': 'chato', 'alvo': 'Rose'}, antes=4,
                  ancoras=[({'tipo': 'chato', 'alvo': 'Rose'}, 'desligou')],
                  selos=[credito('DOUTOR · ideia de @LELOHJ', 'doutor', 110),
                         credito('CHATO · ideia de @francesbrasileiro', 'chato', 120)]),
      'Tique cinco. A Rose é o Doutor. O Marrom é o Chato: desliga a função de alguém por sete tiques. E desligou... [[s:error-beep:0.5]] a dela. [[m:cala-a-boca:right:1.8]]', min=9),
    N('p4e', jogo(4, 'Marrom', evento={'tipo': 'morte', 'vitima': 'Bordo'}, antes=3,
                  ancoras=[({'tipo': 'morte', 'vitima': 'Bordo'}, 'mata')],
                  selos=[credito('@reverso_2244 pediu: impostor só diz que matou se matou', 'avisa', 140),
                         selo('MATOU MESMO', 'verdade', 'carimbo', cor='#0d8a2a', dur=55)]),
      'Tique sete: o Marrom mata o Bordo, no Admin. E avisa os parceiros: matei. Dessa vez, é verdade.', min=7.5),
    N('p4f', comp('AU5Foto', partida=4, tique=5, cor='Roxo', legenda='FOTO DO ROXO · TIQUE 5 · SALA DE ESPÉCIMES'),
      'Tique oito, reunião. O Roxo é o Influencer. E a foto dele mostra... [[s:camera-shutter:0.6]] dois Vermelhos. [[m:spiderman-pointing:right:1.8]]', min=7),
    CH('p4g', reuniao(4, 0), [
        ('N', 'Aí o Cinza, o Metamorfo, solta essa:'),
        ('Cinza', 'Eu sou o Vermelho de verdade. O outro Vermelho da foto é o impostor usando meu nome.'),
        ('N', 'Detalhe: na reunião, o disfarce acaba. Ele tava ali de cinza, na frente de todo mundo, dizendo que era o Vermelho. [[m:nazare-confusa:right:1.8]]'),
    ]),
    CH('p4h', reuniao(4, 0, selos=[selo('O TERCEIRO VERMELHO', 'banana', 'carimbo', cor='#ff6900', dur=70)]), [
        ('N', 'E o Marrom, que matou o Bordo, ajuda:'),
        ('Marrom', 'Eu tava em Admin fazendo tarefa e vi o Vermelho aparecer colado no corpo no t7.'),
        ('N', 'Só que esse Vermelho... era o Banana, disfarçado.'),
        ('pensa:Banana', 'O Marrom viu eu (disfarçado de Vermelho) perto do corpo no t7.'),
    ]),
    N('p4i', comp('AU5Ejecao', partida=4, indice=0),
      'E a nave expulsou o único Vermelho que era Vermelho. [[m:sad-pablo:right:1.8]]', min=5),
    N('p4j', jogo(4, 'Marrom', evento={'tipo': 'poder', 'poder': 'escudo_anjo', 'alvo': 'Marrom'}, antes=1,
                  selos=[selo('ANJO DA GUARDA', 'anjo', cor='#2fae5a', dur=120)]),
      'O primeiro tripulante que morre vira o Anjo da Guarda: dá escudo pros vivos. O Vermelho voltou como anjo... e o primeiro escudo foi pro Marrom. O assassino. [[m:picard-facepalm:right:1.8]]', min=9),
    N('p4k', jogo(4, 'Branco', evento={'tipo': 'escudo', 'vitima': 'Branco', 'assassino': 'Amarelo'}, antes=2.5,
                  ancoras=[({'tipo': 'escudo', 'vitima': 'Branco', 'assassino': 'Amarelo'}, 'ataca')],
                  selos=[selo('BLOQUEADO', 'bloqueado', 'carimbo', cor='#0d8a2a', dur=50)]),
      'Tique trinta e quatro: o Amarelo ataca o Branco. [[s:escudo:0.6]] Bloqueado.', min=6),
    N('p4l', jogo(4, 'Branco', evento={'tipo': 'escudo', 'vitima': 'Branco', 'assassino': 'Cinza'}, antes=2.5,
                  ancoras=[({'tipo': 'escudo', 'vitima': 'Branco', 'assassino': 'Cinza'}, 'tenta')],
                  selos=[selo('BLOQUEADO DE NOVO', 'bloqueado', 'carimbo', cor='#0d8a2a', dur=50)]),
      'Tique trinta e nove: o Cinza tenta. [[s:escudo:0.6]] Bloqueado de novo. Dessa vez o anjo acertou. [[m:stonks:right:1.6]]', min=7),
    CH('p4m', reuniao(4, 1), [
        ('N', 'O Branco aperta o botão de emergência:'),
        ('Branco', 'Apertei porque Cinza tentou me matar no Escritório agora; Amarelo também tentou no Laboratório, no t34. O escudo me salvou nas duas vezes.'),
    ]),
    N('p4n', comp('AU5Resultado', partida=4, indice=1, semJuiz=True),
      'Nove votos no Amarelo, que era impostor. Ele ia ser expulso. [[m:goodbye-see-ya:right:1.6]]', min=5),
    CH('p4o', comp('AU5Resultado', partida=4, indice=1, carimbo='anulou'), [
        ('N', 'Mas o Azul é o Juiz. E pensou:'),
        ('pensa:Azul', 'Amarelo é meu par, então se ele for expulso eu morro junto.'),
        ('N', '[[s:boom:0.6]] Anulou a votação. Pra salvar o parceiro. [[m:haja-coracao:right:1.8]]'),
    ]),
    N('p4p', jogo(4, 'Marrom', evento={'tipo': 'chato', 'alvo': 'Branco'}, antes=2,
                  ancoras=[({'tipo': 'chato', 'alvo': 'Branco'}, 'desliga')]),
      'E o Chato se vinga: desliga a função do Branco, o único que tinha visto os dois tentando matar. [[s:error-beep:0.5]] [[m:cala-a-boca:right:1.6]]', min=6),
    CH('p4q', jogo(4, 'Banana', evento={'tipo': 'morte', 'vitima': 'Ciano'}, antes=6,
                   ancoras=[({'tipo': 'camuflagem', 'cor': 'Banana', 'em': 'Preto'}, 'copia'), ({'tipo': 'morte', 'vitima': 'Ciano'}, 'mata')]), [
        ('N', 'Tique quarenta e quatro. O Banana copia de novo. Agora vira o Preto. E no tique quarenta e seis, ele mata o Ciano na Caldeira. [[s:faca:0.6]]'),
        ('N', 'E o Cinza, de impostor, viu um "Preto" matando.'),
    ]),
    CH('p4r', reuniao(4, 2), [
        ('Cinza', 'Eu vi Preto matar Ciano na Caldeira! Banana confirma que ele estava lá comigo, e o corpo está lá. Votem no Preto.'),
        ('Preto', 'Nunca fui à Caldeira, não matei o Ciano. Cinza saiu de duto no t36 e agora me acusa do nada. Desconfio dele.'),
        ('pensa:Banana', 'O Cinza viu eu disfarçado de Preto matar o Ciano. Se votarem no Preto real, tudo bem pra mim — mas preciso desviar a atenção pro Lima, que já tem testemunha de duto.'),
    ]),
    N('p4s', comp('AU5Ejecao', partida=4, indice=2),
      'Pela primeira vez, o Cinza tava falando a verdade. [[s:revela_impostor:0.5]] E foi expulso. O Metamorfo, impostor. [[m:faustao-errou:right:1.6]]', min=6.5),
    CH('p4t', jogo(4, 'Amarelo', evento={'tipo': 'morte', 'vitima': 'Preto'}, antes=3,
                   ancoras=[({'tipo': 'morte', 'vitima': 'Preto'}, 'mata')]), [
        ('N', 'Tique cinquenta e três. O Amarelo pega o Preto sozinho em Comunicações:'),
        ('Amarelo', 'Preto está sozinho comigo em Comunicações; vou matá-lo. Protejam Azul.'),
        ('N', 'E aí ele mesmo denuncia o corpo. [[m:roll-safe:right:1.6]]'),
        ('Amarelo', 'Vou denunciar Preto em Comunicações; Azul e Banana estão comigo.'),
    ]),
    CH('p4u', reuniao(4, 3), [
        ('Amarelo', 'Achei o Preto em Comunicações. Azul e Banana estavam perto; vocês viram alguém chegando ou saindo?'),
        ('pensa:Amarelo', 'Matei Preto; preciso evitar suspeitas e proteger Azul e Lima.'),
        ('N', 'E quem saiu foi o Lima. [[s:revela_impostor:0.5]] O Envenenador, que entrou num duto na frente de duas pessoas. Impostor.'),
    ]),
    CH('p4v', jogo(4, 'Banana', evento={'tipo': 'morte', 'vitima': 'Rose'}, antes=7,
                   ancoras=[({'tipo': 'camuflagem', 'cor': 'Banana', 'em': 'Rose'}, 'rose'), ({'tipo': 'morte', 'vitima': 'Rose'}, 'mata')],
                   selos=[selo('TIQUE 59', 'mata', 'carimbo', cor='#7a3fd1', dur=80)]), [
        ('N', 'E agora, tique cinquenta e sete. O Banana se camufla de novo. Dessa vez... de Rose.'),
        ('N', 'Tique cinquenta e nove. A Rose falsa encontra a Rose de verdade na Segurança. E mata. [[s:faca:0.7]] A cena do começo do vídeo. [[m:mind-blown:right:1.8]]'),
    ]),
    CH('p4w', jogo(4, 'Marrom', evento={'tipo': 'sabotagem', 'cor': 'Amarelo', 'subtipo': 'Sismografo'}, antes=2), [
        ('N', 'Sobraram sete. E os impostores sabotam o sismógrafo pra explodir a nave:'),
        ('Marrom', 'Amarelo, NAO venha consertar. Deixa o sismografo estourar. Se alguem vier sozinho no Lab, eu mato.'),
        ('N', 'Só que a nave tinha outro jeito de ganhar. As tarefas. [[s:tic-tac:0.5]]'),
    ]),
    N('p4x', jogo(4, 'Branco', evento={'tipo': 'fim'}, antes=6,
                  selos=[selo('TAREFAS: 100%', 4.5, 'carimbo', cor='#0d8a2a', dur=90)]),
      'Tique sessenta e três. O Branco, o mesmo que levou dois ataques, termina a última tarefa: trocar o galão de água. [[s:tarefa:0.6]] [[m:we-did-it:right:1.8]]', min=8),
    *fim_partida('p4', 4, 'Branco',
                 'Vitória dos tripulantes. Pelas tarefas! [[s:vitoria:0.5]] Com o casal vivo. E o Banana, que copiou três pessoas e matou três, perdeu. [[m:dicaprio-slow-clap:right:1.8]]',
                 'Fim da última partida.', '#ff6900'),
]

# ------------------------------------------------------------------------------------------------ final
N, CH = fac('fim')
FIM = [
    N('z01', comp('AU5Partida', n=5, titulo='EPISÓDIO 6?', sub='COMENTA A FUNÇÃO E O MAPA', cor='#9b7bff'),
      'Esse foi o Polus, Davi. Comenta aí a função que você quer no próximo... e qual mapa. Se for bom, entra. Até o próximo!', min=8),
]

SCENES = ABERTURA + P1 + P2 + partida3() + P4 + FIM
