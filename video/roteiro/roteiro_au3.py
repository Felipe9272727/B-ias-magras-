# -*- coding: utf-8 -*-
"""Roteiro do Among Us 3: "Coloquei 15 IAs pra jogar Among Us" — temporada com 15 IAs de 6 empresas.

Tudo o que aparece aqui aconteceu nas partidas registradas em amongus/logs3/partida{1,2,3,4}.json: as falas das IAs
nas reuniões vêm do log (roteiro/falas_au3.json, gerado por gerar_falas_au3.py, só cortadas em fim de frase), e os
"pensamentos" são o campo secreto que cada IA escreveu junto com a jogada. Resumos conferidos em video/youtube/au3/.
A partida 1 é cortada na expulsão do Palhaço (pela regra certa, a partida acaba ali; a regra foi corrigida depois).

Formato (o mesmo do AU2, lido por video/scripts/build_timeline_au3.py):
  N(id, capítulo, visual, texto)                  cena narrada
  CH(id, capítulo, visual, [(quem, texto), ...])   cena de chat: quem = 'N' (narrador) ou uma cor (voz daquela cor)
Marcações no texto do narrador: [[m:meme:pos:dur:legenda]] [[s:efeito:vol]] [[p]] soco de câmera [[t:TEXTO:dur:cor]] [[cc]]
"""

CHAPTERS = {
    'abertura': 'Abertura',
    'novo': 'O que mudou',
    'p1': 'Partida 1 · O Palhaço',
    'p2': 'Partida 2',
    'p3': 'Partida 3',
    'p4': 'Partida 4',
    'fim': 'Placar e encerramento',
}


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def titulo(kicker, title, sub='', cor='#ff4d4d'):
    return comp('AUTitulo', kicker=kicker, title=title, subtitle=sub, color=cor)


def jogo(p, foco, tique=None, evento=None, antes=3, papeis=True, seg=0, chat=True):
    """Gameplay em tempo real seguindo `foco`: do início do `tique` (+seg) ou `antes` segundos antes do `evento`."""
    pr = dict(partida=p, foco=foco, papeis=papeis, seg=seg, chat=chat)
    if tique is not None:
        pr['tique'] = tique
    if evento:
        pr['evento'] = evento
        pr['antes'] = antes
    return comp('AU3Jogo', **pr)


def morte(vitima):
    return {'tipo': 'morte', 'vitima': vitima}


def reuniao(p, i):
    return comp('AU3Reuniao', partida=p, indice=i)


def chamado(p, i):
    return comp('AU3Chamado', partida=p, indice=i)


def votos(p, i):
    return comp('AU3Votos', partida=p, indice=i)


def ejecao(p, i):
    return comp('AU3Ejecao', partida=p, indice=i)


def pensa(p, cor, texto, modo='pensa'):
    return comp('AU3Frase', partida=p, cor=cor, texto=texto, modo=modo)


def revela(p, foco):
    return comp('AU3Revela', partida=p, foco=foco)


# falas das reuniões: copiadas do log por roteiro/gerar_falas_au3.py (nunca reescritas à mão)
import json as _json
from pathlib import Path as _Path
_FALAS = _json.loads((_Path(__file__).with_name('falas_au3.json')).read_text())


def F(n, i, a=0, b=None):
    return [tuple(x) for x in _FALAS[f'{n}-{i}'][a:b]]


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)


SCENES = [
    # ------------------------------------------------------------------ ABERTURA
    N('a01', 'abertura', jogo(1, 'Preto', tique=15),
      'Quinze inteligências artificiais jogando Among Us. E essa aqui, o Preto, ganhou a partida sozinho... convencendo todo mundo a expulsar ele. [[m:roll-safe:right:2.5]] Ele é o Palhaço: se for expulso, ganha. E as outras catorze IAs caíram direitinho. Daqui a pouco você vai ver como.'),
    N('a02', 'abertura', comp('AU3Comentarios', passo=40),
      'Mas antes, os comentários. O último vídeo teve mais de cem, e o mais curtido, do manodoRoblox, reclamou de uma coisa: impostor quase nunca usava habilidade. [[m:sus-doakes:right:2.2]] Nessa temporada, eles usam. E muito. Também pediram Juiz, fotógrafo, chat dos impostores, quinze IAs... e um tal de Palhaço.'),
    N('a03', 'abertura', comp('AU3Ideias', marca='fiz'),
      'Sério. Vocês me encheram de ideias boas... mas infelizmente não consegui fazer todas. [[s:sad-trombone:0.4]] Mapa novo e vinte IAs ficaram pra próxima. Mas olha só o que eu fiz: [[s:level-up:0.5]] dezenove ideias de vocês estão nesse vídeo.'),
    N('a04', 'abertura', comp('AU3Nave'),
      'E teve gente reclamando do visual também. Então a nave foi redesenhada: objetos maiores, paredes com janela, terminais de tarefa que dá pra ver de longe, caixa, extintor, planta... [[m:mind-blown:right:2.2]] Tudo desenhado aqui, nada tirado do jogo original.'),
    N('a05', 'abertura', titulo('15 IAs · 6 empresas · 4 partidas', 'COLOQUEI 15 IAs PRA JOGAR AMONG US', 'agora com Palhaço, Juiz, Influencer, Gangster e Envenenador'),
      '[[s:impact-epic:0.6]] Quinze IAs. Três impostores. Um Palhaço. Uma temporada inteira com memória, onde o que acontece numa partida, elas lembram na próxima. Bora.'),

    # ------------------------------------------------------------------ O QUE MUDOU
    N('n01', 'novo', comp('AU3Elenco'),
      'Primeiro, o elenco. O Grok saiu: no último vídeo ele foi caro e jogou mal. [[m:michael-scott-no:right:2]] No lugar dele chegaram duas empresas novas: a Mistral, da França, e o GLM, da China. Junto com DeepSeek, Claude, GPT e Gemini, são seis empresas. E como quinze não divide por seis, o sorteio decidiu quem jogava com três IAs e quem jogava com duas.'),
    N('n02', 'novo', comp('AU3Papeis', passo=6),
      'As funções. Pros impostores, duas novas: o Envenenador, que mata devagar, e o Gangster, que recruta um tripulante pro time dele. O Palhaço, que é neutro. E pros tripulantes, três novas pedidas por vocês: Influencer, Juiz e Segurança. [[m:visible-confusion:right:2.2]] Não precisa decorar: quando cada uma aparecer, eu explico.'),
    N('n03', 'novo', jogo(1, 'Marrom', tique=3),
      'Como funciona: o jogo anda em tiques, que são tipo rodadas. A cada tique, cada IA lê o que tá vendo e escolhe uma jogada. Dessa vez todas sabem quais funções existem na partida, só não sabem quem é quem. [[p]] E cada uma só enxerga o que tá perto dela, olha o círculo de visão.'),
    N('n04', 'novo', jogo(1, 'Vermelho', tique=1),
      'E o mais pedido: o chat dos impostores. [[s:notification-pop:0.5]] Ali no canto, você vê os impostores combinando o plano em segredo. Os outros não veem nada disso. [[m:michael-jackson-popcorn:right:2.5]] Só você.'),
    N('n05', 'novo', comp('AU3Shhh'), '[[s:whoosh:0.4]] Bora pra primeira partida.', pad=0.9),

    # ------------------------------------------------------------------ PARTIDA 1
    N('p101', 'p1', revela(1, 'Vermelho'),
      'Partida um. Os impostores. O Vermelho, da Mistral: Gangster. [[s:faca:0.4]] O Amarelo, do GPT: Envenenador. [[s:faca:0.4]] E o Marrom, do DeepSeek: Faxineiro, o que some com os corpos. [[s:impact-epic:0.4]] E o Palhaço é o Preto, um Claude.'),
    N('p102', 'p1', jogo(1, 'Branco', tique=1),
      'E a partida já começa com uma ironia. O Branco é o Médico, e o poder dele é dar um escudo em alguém. No primeiro tique ele escolhe proteger... o Vermelho. [[s:boing:0.5]][[m:monkey-puppet-awkward:right:2.5]] O impostor. O Médico gastou o escudo no assassino.'),
    N('p103', 'p1', jogo(1, 'Vermelho', evento={'tipo': 'recrutamento', 'alvo': 'Branco'}, antes=6),
      'E fica melhor. Tique nove, em Escudos. O Vermelho, que é o Gangster, pensa: "o Branco acabou de fazer tarefa visual, é perfeito pra recrutar". [[s:transformar:0.6]] E recruta o Branco. [[p]] O Médico que deu escudo no impostor... agora é impostor. No chat ele avisa: "agora somos quatro, cuidado pra não matar ele". [[m:shocked-krabs:right:2.5]]'),
    N('p104', 'p1', jogo(1, 'Vermelho', evento=morte('Rosa'), antes=5),
      'E no tique seguinte o Vermelho mata a Rosa, um GLM que era a Segurança. [[s:death:0.6]] Só que tinha um detalhe. O próprio Vermelho pensou: "o Lima está me vendo aqui com o corpo". [[m:sweating:right:2.5]] E o Lima é o Detetive.', pad=0.8),
    N('p105', 'p1', jogo(1, 'Marrom', tique=10),
      'Enquanto isso, no chat dos impostores, uma coisa bizarra. O Amarelo manda: "envenenei a Coral no O2". E o Marrom: "matei o Preto em Armas e escondi o corpo". [[s:boing:0.5]] Nada disso aconteceu. A Coral e o Preto tão vivos. [[m:visible-confusion:right:2.5]] Os impostores mentindo... pros próprios parceiros.'),
    N('p106', 'p1', chamado(1, 0), 'O Bordô acha o corpo da Rosa.', pad=1.0),
    CH('p107', 'p1', reuniao(1, 0), [
        ('N', 'Primeira reunião. E quem abre é o Palhaço, que quer chamar atenção.'),
        *F(1, 0, 0, 1),
        ('N', 'E o Amarelo, que é impostor, tem uma ideia pra se salvar...'),
        *F(1, 0, 1, 2),
        ('N', 'Só que o Engenheiro de verdade tá na mesa. É o Cinza.'),
        *F(1, 0, 2, 3),
        ('N', '[[m:dicaprio-pointing:right:2.5]] Pego na mentira. E o Vermelho tenta desviar...'),
        *F(1, 0, 3, 4),
        *F(1, 0, 4, 5),
        ('N', 'Testemunha ocular. E olha o Marrom, parceiro do Vermelho, entregando ele pra ganhar crédito.'),
        *F(1, 0, 5, 6),
    ]),
    N('p107v', 'p1', votos(1, 0), 'Até o Amarelo e o Branco, os dois parceiros, votaram no Vermelho.', pad=1.8),
    N('p108', 'p1', ejecao(1, 0), 'Nove votos. O Vermelho, o Mistral, foi o primeiro expulso. [[m:faustao-errou:right:2]]', pad=1.4),
    N('p109', 'p1', jogo(1, 'Verde', evento={'tipo': 'xerife', 'xerife': 'Verde'}, antes=6),
      'Mas a mentira do Amarelo ainda ia fazer estrago. Tique dezessete, Segurança. O Verde, que é o Xerife, vê o Cinza saindo de um duto. E pensa: "o Amarelo também saiu de duto, dois engenheiros é impossível, então o Cinza é impostor". [[s:tiro:0.7]][[p]] Atira. [[s:fail-piano:0.5]] Só que o Cinza era o Engenheiro de verdade. E quando o Xerife erra, quem morre é ele. [[m:mission-failed:right:2.5]] A mentira do impostor matou o Xerife.', pad=0.8),
    N('p110', 'p1', jogo(1, 'Ciano', evento={'tipo': 'foto', 'cor': 'Ciano'}, antes=3),
      'E agora lembra do Preto, o Palhaço. Dois tiques antes, o Ciano, que é o Influencer, postou uma foto pra nave inteira. [[s:camera-shutter:0.6]] Na foto: o Preto, sozinho em Escudos... do lado da Segurança. [[m:side-eye-dog:right:2.2]]'),
    N('p111', 'p1', chamado(1, 1), 'A Coral acha o corpo do Xerife na Segurança.', pad=1.0),
    CH('p112', 'p1', reuniao(1, 1), [
        ('N', 'E o Palhaço vê a chance perfeita. Ele pensa: "preciso parecer suspeito sem confessar". E inventa isso:'),
        *F(1, 1, 0, 1),
        ('N', '[[s:record-scratch:0.5]] Scan... em Escudos. Só que o scan fica na Enfermaria.'),
        *F(1, 1, 1, 4),
        ('N', 'E o Preto pensa: "já estão quase todos votando em mim, e isso é exatamente o que eu quero". [[m:roll-safe:right:2.5]] E faz cara de coitado...'),
        *F(1, 1, 4, 5),
    ]),
    N('p112v', 'p1', votos(1, 1), 'Oito votos no Preto. Até o Marrom e o Amarelo, impostores, embarcaram.', pad=1.8),
    N('p113', 'p1', ejecao(1, 1),
      '[[s:crowd-laugh:0.5]] Expulsaram o Palhaço. Ele ganhou, e a partida acabou ali mesmo. [[m:dicaprio-toast:right:3]] Ninguém naquela mesa sabia que o morto era o Xerife que errou o próprio tiro. E a foto do Influencer, criada pra pegar impostor... ajudou o Palhaço a ganhar.', pad=1.2),
]
