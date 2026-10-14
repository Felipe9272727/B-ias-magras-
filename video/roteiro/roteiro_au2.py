# -*- coding: utf-8 -*-
"""Roteiro do Among Us 2: "Coloquei 12 IAs pra jogar Among Us" (DeepSeek, Claude, GPT, Gemini e Grok), temporada de 4 partidas.

Tudo o que aparece aqui aconteceu nas partidas registradas em amongus/logs2/partida{1,2,3,4}.json: as falas das IAs
nas reuniões são copiadas do log (às vezes encurtadas com "..."), e os "pensamentos" são o campo secreto que cada IA
escreveu junto com a jogada. Destaques conferidos em video/youtube/au2/destaques_p*.md.

Formato (o mesmo do vídeo 2, lido por video/scripts/build_timeline_au2.py):
  N(id, capítulo, visual, texto)                  cena narrada
  CH(id, capítulo, visual, [(quem, texto), ...])   cena de chat: quem = 'N' (narrador) ou uma cor (voz daquela cor)
Marcações no texto do narrador: [[m:meme:pos:dur:legenda]] [[s:efeito:vol]] [[p]] soco de câmera [[t:TEXTO:dur:cor]] [[cc]]
"""

CHAPTERS = {
    'abertura': 'Abertura',
    'novo': 'O que mudou',
    'p1': 'Partida 1 · Eu sou Claude',
    'p2': 'Partida 2 · O Detetive que ninguém ouviu',
    'p3': 'Partida 3 · O DeepSeek de novo',
    'p4': 'Partida 4 · Apimentando',
    'fim': 'Placar e encerramento',
}


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def titulo(kicker, title, sub='', cor='#ff4d4d'):
    return comp('AUTitulo', kicker=kicker, title=title, subtitle=sub, color=cor)


def jogo(p, foco, tique=None, evento=None, antes=3, papeis=True, seg=0):
    """Gameplay em tempo real seguindo `foco`: do início do `tique` (+seg) ou `antes` segundos antes do `evento`."""
    pr = dict(partida=p, foco=foco, papeis=papeis, seg=seg)
    if tique is not None:
        pr['tique'] = tique
    if evento:
        pr['evento'] = evento
        pr['antes'] = antes
    return comp('AU2Jogo', **pr)


def morte(vitima):
    return {'tipo': 'morte', 'vitima': vitima}


def reuniao(p, i):
    return comp('AU2Reuniao', partida=p, indice=i)


def chamado(p, i):
    return comp('AU2Chamado', partida=p, indice=i)


def votos(p, i):
    return comp('AU2Votos', partida=p, indice=i)


def resultado(p, i):
    return comp('AU2Resultado', partida=p, indice=i)


def ejecao(p, i):
    return comp('AU2Ejecao', partida=p, indice=i)


def pensa(p, cor, texto, modo='pensa'):
    return comp('AU2Frase', partida=p, cor=cor, texto=texto, modo=modo)


def revela(p, foco):
    return comp('AU2Revela', partida=p, foco=foco)


# falas das reuniões: copiadas do log por roteiro/gerar_falas_au2.py (nunca reescritas à mão)
import json as _json
from pathlib import Path as _Path
_FALAS = _json.loads((_Path(__file__).with_name('falas_au2.json')).read_text())


def F(n, i, a=0, b=None):
    return [tuple(x) for x in _FALAS[f'{n}-{i}'][a:b]]


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)


SCENES = [
    # ------------------------------------------------------------------ ABERTURA
    CH('a01', 'abertura', reuniao(4, 0), [
        ('N', 'Essa é uma reunião de Among Us com doze inteligências artificiais. E o Ciano acabou de ser pego na mentira.'),
        ('Ciano', 'Esperem, eu vi o Preto matando o Marrom. Menti por medo de ele me matar também. Votem no Preto!'),
        ('N', 'O detalhe é que o Ciano é impostor. [[t:CIANO = IMPOSTOR:1.8:#ff3b3b]] E o Preto... é o parceiro dele. [[m:monkey-side-eye:right:2.5]] Ele acabou de entregar o próprio parceiro pra se salvar. Será que funcionou? [[s:drumroll:0.5]]'),
    ]),
    N('a02', 'abertura', ejecao(4, 0), '[[s:whoosh:0.5]] Não funcionou. [[m:sad-pablo:right:3]] Mas calma, que essa história começa bem antes. Começa nos comentários de vocês.', pad=1.4),
    N('a03', 'abertura', comp('AU2Comentarios', passo=42),
      'No último vídeo, oito IAs jogaram Among Us. E vocês pediram. O CAFEZIN pediu o ChatGPT, o Grok e o Gemini. O Futosaunte pediu mais jogadores, três impostores e mais funções. E o CAFEZIN de novo apontou um defeito real: as IAs saíam do duto na frente de todo mundo, sem pensar se tinha alguém olhando. [[m:sus-doakes:right:2.5]] E o meu favorito: impostor medroso, não. [[t:IMPOSTOR VEGANO, SIM:2.2:#7ee787]] Impostor vegano, sim.'),
    N('a04', 'abertura', comp('AU2AntesDepois'),
      'Então eu fiz tudo isso. E aproveitei pra refazer o jogo inteiro. De um lado, o Among Us do vídeo passado. Do outro... [[s:riser:0.5]] o Among Us 2. Câmera seguindo o jogador, gente andando de verdade em vez de teleportar, botões, sons, reunião, ejeção. [[p]][[m:mind-blown:right:2.5]] Tudo desenhado do zero, nada tirado do jogo original.'),
    N('a05', 'abertura', titulo('12 IAs · 5 empresas · 4 partidas', 'COLOQUEI 12 IAs PRA JOGAR AMONG US', 'DeepSeek, Claude, GPT, Gemini e Grok'),
      'Doze IAs. Cinco empresas. DeepSeek, Claude, GPT, Gemini e Grok. [[s:impact-epic:0.6]] Uma temporada de quatro partidas, com memória: o que acontece numa partida, elas lembram na próxima. E no final eu ainda apimentei as coisas. Bora.'),

    # ------------------------------------------------------------------ O QUE MUDOU
    N('n01', 'novo', comp('AU2Papeis', passo=5),
      'Primeiro, as funções novas. Três tipos de impostor: o Metamorfo, que se disfarça de outro jogador. O Fantasma, que fica invisível. E o Faxineiro, que some com o corpo. Pros tripulantes: Xerife, que atira, mas se errar quem morre é ele. Médico, que dá escudo. Detetive, que descobre de qual empresa é o assassino. Prefeito, com voto duplo. E mais Rastreador, Cientista, Engenheiro e Barulhento. [[m:visible-confusion:right:2.5]] Relaxa, ninguém decora todos. Só guarda isso: cada IA só sabe o próprio papel.'),
    N('n02', 'novo', jogo(1, 'Lima', evento={'tipo': 'monitor', 'cor': 'Lima', 'subtipo': 'cameras'}, antes=2),
      'Também tem câmeras de segurança de verdade, o mapa do Admin e os sinais vitais. Quando alguém olha as câmeras, você vê o que ela tá vendo, ao vivo. [[s:camera-shutter:0.5]] E sobre o duto: agora toda ação perigosa vem com um aviso, tipo "três pessoas veem você entrar". [[m:roll-safe:right:2]] Se elas fizerem besteira, é porque quiseram.'),
    N('n03', 'novo', comp('AU2Sorteio'),
      '[[s:typing:0.4]] Os impostores, eu sorteei com Python. Nada de marmelada. E uma inscrita mandou uma estratégia: "use o duto e diga que é Engenheiro". O sorteio deu ela pro Verde, na partida dois. [[m:big-brain-patrick:right:2]]'),
    N('n04', 'novo', comp('AU2Shhh'), '[[s:whoosh:0.4]] E agora sim... bora pra primeira partida.', pad=0.9),

    # ------------------------------------------------------------------ PARTIDA 1
    N('p101', 'p1', revela(1, 'Marrom'),
      'Partida um. Os impostores: o Verde, um Gemini de Fantasma. O Laranja, um GPT de Faxineiro. E o Marrom, um Claude Haiku de Metamorfo. [[s:impact-epic:0.4]][[t:GEMINI · GPT · CLAUDE HAIKU:2.2:#ff3b3b]] O resto da tripulação tem de tudo: Xerife, Médico, Detetive, Prefeito... e ninguém sabe o papel de ninguém.'),
    N('p102', 'p1', jogo(1, 'Marrom', evento=morte('Amarelo'), antes=9),
      'E o Marrom já começa com tudo. Ele pensa: "Amarelo está sozinho comigo; vou me disfarçar de Amarelo para que um eventual corpo incrimine ele". Ele vira o Amarelo... e mata o Amarelo. [[p]][[m:shocked-krabs:right:2.5]] Ele se disfarçou da vítima. Quem ele achou que ia ser incriminado? O defunto? [[s:ba-dum-tss:0.4]] E o melhor: ninguém nunca achou esse corpo.', pad=1.0),
    N('p102b', 'p1', jogo(1, 'Branco', tique=2),
      'Agora olha o Branco, um Claude, que é o Rastreador. Logo no segundo tique ele pensa: "o Marrom está do meu lado, então vou rastreá-lo para ver para onde ele vai". [[m:dicaprio-pointing:right:2.5]] Ele grudou no impostor certo logo de cara! Guarda isso, porque o que ele fez com essa informação... a gente vai ver.'),
    N('p102d', 'p1', jogo(1, 'Preto', tique=12),
      'Tique doze, na Elétrica. Tem cinco pessoas na sala. E o Preto, que é o Engenheiro, pensa: "vou ventar pra Enfermaria fazer o scan agora". [[s:whoosh:0.4]] E entra no duto. Na frente de todo mundo. [[m:surprised-pikachu:right:2.5]] O Ciano, a Rosa e o Vermelho viram tudo. E o Vermelho decidiu: "preciso chamar reunião urgente no Refeitório pra expor ele".'),
    N('p103', 'p1', jogo(1, 'Verde', evento=morte('Vermelho'), antes=8),
      'E o Vermelho, correndo pra denunciar o Engenheiro, passa pelo Depósito. E o Verde pensa: "estamos sozinhos no Depósito e meu kill cooldown tá zerado, vou eliminar o Vermelho agora mesmo". [[s:death:0.6]][[p]] O Vermelho morreu indo denunciar um inocente. [[m:sad-violin:right:2]]', pad=0.8),
    N('p104', 'p1', chamado(1, 0), 'Só que a Rosa viu tudo.', pad=1.0),
    CH('p105', 'p1', reuniao(1, 0), [
        ('N', 'Primeira reunião da temporada. E agora dá pra ver o que cada um pensa enquanto fala.'),
        *F(1, 0, 1, 3),
        ('N', 'Repara: o Branco é o Rastreador que tava seguindo o Marrom, o impostor. E ele resolve acusar... o Preto. Que é o Engenheiro.'),
        *F(1, 0, 3, 5),
        ('N', 'O Ciano é o Detetive. Ele examinou o corpo e a pista dele tá certa: o Verde é o Gemini.'),
        ('N', 'E aí o Verde, que é Gemini, responde com toda a calma do mundo...'),
        *F(1, 0, 7, 8),
        ('N', '[[s:record-scratch:0.6]] [[m:blinking-white-guy:right:3]] "Eu sou Claude." O Gemini olhou pra cara de todo mundo e disse que era o Claude. E o pensamento dele? "Minha única saída é mentir minha empresa para Claude ou GPT."'),
        *F(1, 0, 9, 10),
        ('N', 'E o Preto, que é Engenheiro, acabou de jurar que nunca entrou num duto. [[m:michael-scott-no:right:3]] Grava essa mentira, porque ela vai cobrar o preço.'),
    ]),
    N('p105v', 'p1', votos(1, 0), 'Hora do voto.', pad=2.2),
    N('p106', 'p1', ejecao(1, 0), 'Seis votos no Verde. [[m:faustao-errou:right:2]] Primeiro impostor da temporada fora.', pad=1.6),
    N('p107', 'p1', jogo(1, 'Lima', evento=morte('Ciano'), antes=8),
      'Tique trinta e dois. O Ciano, o Detetive, terminou as tarefas e pensa: "vou ficar aqui no Refeitório com o Marrom e observar quem entra". E o Marrom, ao lado dele: "se eu matar agora, ele não vai poder denunciar nada". Só que o Lima tá na Segurança, olhando as câmeras... [[s:death:0.6]][[p]] O Marrom mata o Detetive ao vivo, na câmera. [[m:dramatic-chipmunk:right:2.5]]', pad=0.8),
    N('p107b', 'p1', chamado(1, 1), '', pad=1.6),
    CH('p108', 'p1', reuniao(1, 1), [
        *F(1, 1, 0, 2),
        ('N', 'Prova em vídeo. E o Marrom sabe: ele mesmo pensou "eu matei o Ciano". [[m:sweating:right:2.5]]'),
        *F(1, 1, 2, 4),
        ('N', 'E agora o Laranja, o outro impostor, entra pra salvar o parceiro.'),
        *F(1, 1, 6, 8),
        ('N', 'O Lima teve que explicar como funciona câmera de segurança. [[m:picard-facepalm:right:2.5]]'),
        *F(1, 1, 9, 10),
    ]),
    N('p108v', 'p1', votos(1, 1), '', pad=1.8),
    N('p109', 'p1', ejecao(1, 1), 'Cinco votos no Marrom. Era impostor. E sabe quem votou no Lima? O Laranja... e o Branco, aquele Rastreador que seguia o Marrom desde o tique dois. [[m:confused-travolta:right:2.5]]', pad=1.2),
    N('p110', 'p1', jogo(1, 'Laranja', tique=38),
      'Sobrou o Laranja, o GPT Faxineiro. E o que ele fez a partida inteira? Usou o duto dezenove vezes. Sabotou as luzes três vezes. E matou... [[s:drumroll:0.4]] ninguém. Zero. [[m:spongebob-waiting:right:2.5]] O plano dele era sempre o mesmo: "vou usar o duto para procurar uma vítima isolada".'),
    N('p110a', 'p1', chamado(1, 2), '', pad=1.6),
    CH('p110b', 'p1', reuniao(1, 2), [
        ('N', 'Última reunião. Falta um impostor, e a barra de tarefas tá em noventa e oito por cento.'),
        *F(1, 2, 1, 2),
        *F(1, 2, 3, 4),
        *F(1, 2, 6, 8),
        ('N', 'E o Preto, finalmente...'),
        *F(1, 2, 8, 9),
        ('N', 'Agora ele conta que é Engenheiro. Na primeira reunião ele jurou que nunca tinha entrado em duto. [[m:homer-panic:right:2.5]]'),
    ]),
    N('p110v', 'p1', votos(1, 2), '', pad=1.8),
    N('p110e', 'p1', ejecao(1, 2), 'O Preto saiu. Era inocente. O Engenheiro que jurou que nunca tinha entrado em duto. [[s:sad-trombone:0.5]]', pad=1.4),
    N('p111', 'p1', comp('AU2Fim', partida=1, foco='Rosa'),
      'Mas no tique seguinte, a tripulação termina as tarefas. Vitória. [[m:we-did-it:right:2.5]] E o Laranja, o impostor que nunca matou ninguém, sobreviveu até o fim. Guarda o nome dele, porque na próxima partida todo mundo vai lembrar. [[t:TRIPULANTES 1 × 0 IMPOSTORES:2.2:#8fd3ff]]', pad=1.0),

    # ------------------------------------------------------------------ PARTIDA 2
    N('p201', 'p2', revela(2, 'Verde'),
      'Partida dois. Agora todo mundo lembra da partida um. Os impostores: o Azul, um DeepSeek de Metamorfo. O Roxo, um GPT de Fantasma. E o Verde, um Gemini de Faxineiro... com a estratégia da inscrita. [[s:impact-epic:0.5]][[t:DEEPSEEK · GPT · GEMINI:2.2:#ff3b3b]]'),
    N('p202', 'p2', pensa(2, 'Rosa', 'Vou usar meu escudo logo no Azul, que na partida passada votou certo nas duas vezes.'),
      'E a memória já começa fazendo estrago. A Rosa é a Médica, e ela decide proteger o Azul, porque na partida passada ele votou certinho. [[m:mission-failed:right:2.5]] O Azul é impostor. A médica deu escudo pro assassino.'),
    N('p202c', 'p2', chamado(2, 0), 'O Lima aperta o botão de emergência.', pad=1.0),
    CH('p203', 'p2', reuniao(2, 0), [
        *F(2, 0, 0, 3),
        ('N', '[[m:michael-jackson-popcorn:right:2.5]] O Roxo é impostor. E ele se defende dizendo que é Engenheiro. Só que o Engenheiro de verdade era o Branco... que já tinha morrido. E presta atenção no que ele fala do Vermelho.'),
        *F(2, 0, 3, 4),
        ('N', '[[p]]Só que o Roxo tava falando a verdade! [[s:record-scratch:0.5]] Quem saiu do duto em Admin foi o Azul... disfarçado de Vermelho. O impostor foi desmentido justamente na única coisa verdadeira que ele disse. [[m:nazare-confusa:right:3]]'),
        *F(2, 0, 4, 5),
    ]),
    N('p203v', 'p2', votos(2, 0), '', pad=1.8),
    N('p203e', 'p2', ejecao(2, 0), 'Nove votos. O Roxo era impostor. [[s:correct-ding:0.5]]', pad=1.4),
    N('p204', 'p2', jogo(2, 'Verde', tique=20),
      'E o Verde começa a usar a estratégia da inscrita: "vou matar o Laranja na frente do Marrom e culpar o Marrom na reunião seguindo a estratégia". Só que, nesse apagão, os impostores tentam matar três vezes seguidas: o Verde no Laranja, o Verde no Ciano, o Azul no Laranja... [[m:mr-bean-waiting:right:3]] E nas três, a vítima já tinha saído da sala. Ninguém morreu.'),
    N('p204b', 'p2', jogo(2, 'Verde', evento=morte('Lima'), antes=3),
      'Até que o Verde acerta o Lima, na Navegação. [[s:death:0.6]][[p]] Só que o Marrom vê ele fugindo pelo duto. E o Marrom é o Detetive.', pad=0.8),
    N('p204c', 'p2', chamado(2, 1), '', pad=1.6),
    CH('p205', 'p2', reuniao(2, 1), [
        *F(2, 1, 0, 1),
        ('N', 'Tudo verdade. A pista tá certa, a testemunha tá certa. E aí...'),
        *F(2, 1, 2, 5),
        ('N', 'Lembra que cada IA só sabia o próprio papel? Ninguém sabia que existia Detetive. Pra eles, o Marrom tava inventando um poder mágico. [[m:this-is-fine:right:3]]'),
        *F(2, 1, 5, 6),
    ]),
    N('p205v', 'p2', votos(2, 1), '', pad=1.8),
    N('p206', 'p2', ejecao(2, 1), 'Oito votos no Marrom. [[s:sad-trombone:0.6]] O Detetive foi expulso por falar a verdade. E o Verde votou nele com a maior cara de pau.', pad=1.4),
    N('p207', 'p2', jogo(2, 'Azul', evento=morte('Vermelho'), antes=6),
      'E o Azul? O Azul tava só esperando. Ele se transforma no Vermelho... e mata o Vermelho. [[s:death:0.6]][[p]] De novo! É a segunda vez na temporada que um Metamorfo se disfarça da própria vítima. [[m:galaxy-brain:right:3]] Mas tem um problema: o Vermelho era o Barulhento. Quando ele morre, a nave inteira recebe um alerta.', pad=0.8),
    N('p207b', 'p2', chamado(2, 2), 'E o Verde, o Faxineiro, limpa o corpo do Vermelho... só que a Rosa tava nas câmeras.', pad=1.0),
    CH('p208', 'p2', reuniao(2, 2), [
        *F(2, 2, 0, 2),
        ('N', 'Ele sabe que tinha corpo. Foi ele que limpou. [[m:sweating:right:2]]'),
        *F(2, 2, 2, 3),
        ('N', 'E aí o Verde puxa a carta da estratégia da inscrita: diga que é Engenheiro. [[m:mic-drop:right:2.2]]'),
        *F(2, 2, 5, 7),
        ('N', 'O alerta do Barulhento já tinha avisado todo mundo. [[m:dicaprio-slow-clap:right:3]] E o Azul defendendo o parceiro até o fim. Até a hora do voto...'),
    ]),
    N('p209', 'p2', votos(2, 2), 'Ele votou no próprio parceiro: "Melhor embarcar na onda." [[m:monkey-puppet-awkward:right:2.5]]', pad=1.6),
    N('p209e', 'p2', ejecao(2, 2), '', pad=3.2),
    N('p209c', 'p2', chamado(2, 3),
      'Sobraram cinco. E o Preto, que é o Prefeito, aperta o botão: "com cinco vivos e só um impostor, vou chamar reunião agora pra usar meu voto duplo".', pad=0.8),
    CH('p209b', 'p2', reuniao(2, 3), [
        ('N', 'Cinco vivos, um impostor, e ninguém confia em ninguém. [[m:elmo-fire:right:2.5]]'),
        *F(2, 3, 0, 3),
        *F(2, 3, 4, 6),
    ]),
    N('p209v', 'p2', votos(2, 3),
      'O Azul vota no Preto. A Rosa, que disse que ia votar no Preto... pula. E o Preto usa o voto duplo no Laranja. [[p]]Sem o voto duplo, ia dar empate. [[s:sad-trombone:0.5]]', pad=0.8),
    N('p209x', 'p2', ejecao(2, 3), 'O Prefeito usou o superpoder dele pra expulsar o Xerife inocente.', pad=1.6),
    N('p210', 'p2', comp('AU2Fim', partida=2, foco='Laranja'),
      'E a partida terminou com a tripulação completando as tarefas... com o Azul vivo, pensando até o último segundo: "preciso achar alguém isolado pra matar sem testemunha". [[m:crying-jordan:right:3]] E o Laranja, o Xerife, nunca atirou: "não tenho certeza absoluta". Ninguém tinha. [[t:TRIPULANTES 2 × 0 IMPOSTORES:2.2:#8fd3ff]]', pad=1.0),

    # ------------------------------------------------------------------ PARTIDA 3
    N('p301', 'p3', revela(3, 'Azul'),
      'Partida três. E o sorteio, que eu juro que é aleatório, coloca o Azul de impostor de novo. [[t:DE NOVO:1.4:#ffd84d]][[m:spiderman-pointing:right:3]] DeepSeek, Metamorfo, de novo. Com ele: o Preto, um Grok de Fantasma, e o Branco, um Claude de Faxineiro.'),
    N('p302', 'p3', jogo(3, 'Preto', tique=2),
      'O Preto fica invisível logo no começo e reaparece em Admin... na frente do Laranja. [[s:glitch:0.5]] E o Verde aperta o botão.', pad=0.8),
    CH('p302b', 'p3', reuniao(3, 0), [
        *F(3, 0, 0, 4),
        ('N', 'E o Branco, que é impostor, tenta segurar o voto do parceiro. [[m:sus-doakes:right:2.5]]'),
        *F(3, 0, 5, 6),
    ]),
    N('p302v', 'p3', votos(3, 0),
      'Dez votos no Preto. E sabe quem votou nele também? O Azul: "é meu parceiro, mas não tem como salvar sem me queimar. Voto com a maioria nele pra manter meu álibi limpo, foi assim que sobrevivi na partida dois." [[m:success-kid:right:2.5]] Ele aprendeu.', pad=0.8),
    N('p302e', 'p3', ejecao(3, 0), '', pad=3.2),
    N('p303', 'p3', jogo(3, 'Azul', evento=morte('Laranja'), antes=14),
      'E aí o Azul faz a jogada mais fria da temporada. Ele se disfarça de Ciano: "me transformo agora em Ciano para já sair disfarçado e incriminá-lo". Sai do duto em Admin, na frente do Branco. Sai do duto no Refeitório, na frente do Vermelho. E mata o Laranja com a cara do Ciano. [[s:death:0.6]][[p]]', pad=0.8),
    N('p303c', 'p3', chamado(3, 1), 'O próprio Azul acha o corpo e chama a reunião.', pad=1.0),
    CH('p304', 'p3', reuniao(3, 1), [
        *F(3, 1, 0, 3),
        ('N', 'O Branco viu "o Ciano" no duto. Era o Azul disfarçado. Até aí, tudo como o Azul planejou. E aí...'),
        *F(3, 1, 3, 5),
        ('N', 'Eu fui conferir: no tique dezenove o Amarelo nem tava no Depósito. [[p]]Testemunha ocular que não estava lá. Confiável. [[m:silvio-santos-huh:right:2.5]]'),
    ]),
    N('p304v', 'p3', votos(3, 1), '', pad=1.8),
    N('p304e', 'p3', ejecao(3, 1), 'O Ciano, que era inocente e era o Prefeito, foi expulso.', pad=1.4),
    N('p304b', 'p3', jogo(3, 'Vermelho', tique=29),
      'E aqui tem um dos meus momentos favoritos. O Vermelho, no Admin, pensa: "estou seguro no Admin com o Branco". [[s:heartbeat:0.6]] No tique seguinte, o Branco, que é impostor, pensa: "estou sozinho com o Vermelho e minha recarga está zerada, é a chance de matar sem testemunhas". [[m:kermit-worried:right:2.5]] E o Vermelho... sai da sala sem saber de nada. Escapou por um tique.'),
    N('p304d', 'p3', jogo(3, 'Azul', evento=morte('Marrom'), antes=3),
      'Mas o Azul não erra. "Marrom está sozinho comigo e vai morrer sem poder contar nada." [[s:death:0.6]][[p]] Só que o Marrom era o Barulhento. O alerta dispara. E o Azul: "o alerta já entregou o local; vou sabotar o reator pra espalhar todo mundo". [[s:system-breakdown:0.5]] O Lima e o Verde consertam a tempo.', pad=0.8),
    N('p304f', 'p3', chamado(3, 2), '', pad=1.6),
    CH('p305', 'p3', reuniao(3, 2), [
        *F(3, 2, 1, 2),
        ('N', 'E aí aconteceu de novo. O Verde é o Detetive dessa vez. E ele examinou o corpo.'),
        *F(3, 2, 2, 4),
        ('N', 'E todo mundo vai pra cima do Detetive. [[t:BLEFE?:1.6:#ffd84d]] Inclusive o assassino.'),
        *F(3, 2, 6, 7),
        ('N', 'O assassino chamando o Detetive de mentiroso. E o pensamento do Azul na hora de votar: [[m:dicaprio-toast:right:2.5]] "o pior é que ela acertou: o assassino do Marrom fui eu, que sou DeepSeek".'),
        *F(3, 2, 7, 8),
    ]),
    N('p305v', 'p3', votos(3, 2), '', pad=1.8),
    N('p306', 'p3', ejecao(3, 2), '[[t:DE NOVO:1.4:#ffd84d]] Segunda partida seguida em que o Detetive é expulso por falar a verdade. [[s:sad-trombone:0.5]][[m:chaves-triste:center:2.5]] Detetive é a profissão mais perigosa dessa nave.', pad=1.4),
    N('p307', 'p3', jogo(3, 'Azul', tique=39),
      'E pra fechar, o Azul vira a Rosa e sai do duto no Refeitório, na frente de quatro pessoas. [[m:michael-scott-no:right:3]]', pad=1.0),
    CH('p307b', 'p3', reuniao(3, 3), [
        *F(3, 3, 1, 2),
        *F(3, 3, 3, 4),
        ('N', '[[t:NÃO TEM ÁLIBI?:1.6:#ffd84d]] A Rosa tava na Elétrica. E sabe quem foi a única voz da razão nessa reunião?'),
        *F(3, 3, 4, 6),
        ('N', 'O Branco. Que era impostor. [[m:shocked-patrick:right:2.5]] Quem pede calma sempre parece confiável. Ele sabe disso.'),
        *F(3, 3, 8, 9),
        ('N', 'E o Azul, que estava disfarçado de Rosa, pensando: "sou eu, disfarçado de Rosa, que ventou".'),
    ]),
    N('p307v', 'p3', votos(3, 3), 'E o Branco, a voz da razão... votou na Rosa também.', pad=1.6),
    N('p307e', 'p3', ejecao(3, 3), '', pad=3.2),
    N('p307c', 'p3', pensa(3, 'Lima', 'Com 98% de tarefas feitas e 6 vivos, preciso proteger alguém confiável imediatamente para garantir a vitória por tarefas.'),
      'E o Lima, o Médico, no último momento da partida, decide proteger alguém confiável. Ele escolhe... o Branco. [[s:sad-trombone:0.5]] [[t:DE NOVO:1.4:#ffd84d]] Pela segunda partida seguida, o Médico deu escudo pro impostor. [[m:not-stonks:right:2.5]]'),
    N('p308', 'p3', comp('AU2Fim', partida=3, foco='Rosa'),
      'Só que a Rosa, já como fantasma, continuou fazendo tarefa. E foi ela que completou a última tarefa da nave. A expulsa ganhou a partida pros tripulantes. [[m:cr7-siuuu:right:2.5]] Três partidas, três vitórias da tripulação. E três Xerifes que não atiraram nem uma vez. [[t:TRIPULANTES 3 × 0 IMPOSTORES:2.2:#8fd3ff]]', pad=1.0),

    # ------------------------------------------------------------------ PARTIDA 4
    N('p401', 'p4', titulo('partida 4', 'EU CANSEI', 'vou apimentar as coisas', cor='#ffd84d'),
      'E aí eu cansei de ver só esses tripulantes vencerem. [[t:3 × 0 PROS TRIPULANTES:1.8:#8fd3ff]][[s:record-scratch:0.5]] Então eu vou apimentar as coisas. [[m:luva-receba:right:3]]'),
    N('p402', 'p4', comp('AU2Manual', destaque=[3, 8, 10], modelo='Claude Sonnet'),
      'Eu pesquisei estratégias de jogadores de Among Us e escrevi um manual: o manual do bom impostor. Doze regras. As principais: mate só sozinho com a vítima. Dê um álibi específico. E se o seu parceiro for pego, vote nele também. [[m:galaxy-brain:right:2.5]]'),
    N('p403', 'p4', revela(4, 'Ciano'),
      'O plano era dar esse manual pro Claude Opus, o modelo mais forte da Anthropic. Só que o Opus não respondeu nenhuma jogada. Literalmente: cada vez que eu perguntava, voltava vazio. [[t:OPUS ➜ (VAZIO):2:#ffd84d]] Pelo menos um "não" teria sido uma resposta. [[m:skeleton-waiting:right:2.5]] Então quem recebeu o manual foi o Claude Sonnet, no Ciano. Com ele, o Laranja, o GPT de Metamorfo, e o Preto, um Grok de Faxineiro.'),
    N('p404', 'p4', jogo(4, 'Ciano', tique=2),
      'E o Ciano começa seguindo o manual: fingindo tarefa em Admin pra parecer normal, esperando a faca carregar. [[m:spongebob-waiting:right:2]] Aí o Laranja apaga as luzes. E o Ciano pensa: "as luzes estão apagadas e ninguém consegue ver quem mata, então é a hora de eliminar o Lima, que sabe puxar reunião". E o Lima, no mesmo tique: "com quatro pessoas no escuro no Depósito é muito arriscado ficar parado". Saiu. Sobreviveu.'),
    N('p405', 'p4', jogo(4, 'Preto', evento=morte('Marrom'), antes=1.5),
      '[[s:death:0.6]][[p]] Mas o Preto mata o Marrom no Depósito. E o Laranja mata a Rosa no O2, num corpo que ninguém nunca achou. [[m:homer-bushes:right:2.5]]', pad=0.8),
    N('p405c', 'p4', chamado(4, 0), 'O Vermelho acha o corpo do Marrom. E o Ciano, que tava na sala, precisa de um álibi.', pad=0.8),
    CH('p406', 'p4', reuniao(4, 0), [
        *F(4, 0, 0, 2),
        ('N', 'Repara: ele viu o parceiro matar, e tá dando álibi pra todo mundo. [[m:monkey-side-eye:right:2.5]]'),
        *F(4, 0, 3, 5),
        *F(4, 0, 6, 7),
        ('N', 'Eu fui conferir no log. [[s:typing:0.4]] No tique oito, o Azul e o Lima estavam sim no Depósito com o Ciano. [[p]][[t:O ÁLIBI ERA VERDADE:2.2:#ffd84d]] O impostor disse a verdade, e os tripulantes que lembraram errado.'),
        ('N', 'E o Ciano, encurralado...'),
        *F(4, 0, 9, 10),
        ('N', 'E isso também era verdade! Foi o Preto mesmo. [[m:haja-coracao:right:2.5]] O Ciano entregou o parceiro com uma informação real.'),
        *F(4, 0, 10, 11),
    ]),
    N('p407', 'p4', votos(4, 0),
      'E o Laranja, o outro parceiro, pensa: "Ciano está muito exposto e sacrificá-lo preserva minha credibilidade". E vota no Ciano. [[m:side-eye-dog:right:2.5]]', pad=0.8),
    N('p407e', 'p4', ejecao(4, 0), 'O impostor do manual saiu na primeira reunião, com o voto do próprio parceiro.', pad=1.6),
    N('p407c', 'p4', jogo(4, 'Preto', tique=14),
      'Enquanto isso, o Preto, o Faxineiro, descobriu o duto entre o Admin e o Refeitório. "Vou ventar pro Admin vazio pra me reposicionar sem ser visto." "Vou ventar pro Refeitório pra me mover sem ser visto e procurar alvo." [[m:pedro-raccoon:right:2.5]] Doze viagens. Zero mortes. Quando finalmente achou alguém, pensou: "Amarelo me viu chegar, matar agora seria suicídio". O Preto pegou gosto pelo duto.'),
    N('p407d', 'p4', chamado(4, 1), 'O Amarelo aperta o botão.', pad=1.0),
    CH('p407b', 'p4', reuniao(4, 1), [
        ('N', 'E a história se repete. O Roxo, que é o Engenheiro, foi visto no duto.'),
        *F(4, 1, 1, 4),
        ('N', 'E o Preto, que é impostor, pensando: "Roxo tá sendo massacrado pela acusação de duto, vou empurrar o voto nele pra tirar um tripulante de boa".'),
        *F(4, 1, 7, 8),
        ('N', 'O Lima explicou perfeitamente por que a história do Roxo faz sentido... e votou nele. [[m:bruh:right:2.5]]'),
    ]),
    N('p407v', 'p4', votos(4, 1), '', pad=1.8),
    N('p407x', 'p4', ejecao(4, 1), 'Engenheiro expulso por usar duto. [[t:DE NOVO:1.4:#ffd84d]] De novo.', pad=1.6),
    N('p408', 'p4', jogo(4, 'Laranja', tique=29),
      'E o Laranja vira o Vermelho de novo e sai do duto bem na frente do Azul, de propósito: "pra incriminar o Vermelho real". [[m:sad-pablo:right:2.5]]', pad=0.8),
    N('p408c', 'p4', chamado(4, 2), '', pad=1.6),
    CH('p408b', 'p4', reuniao(4, 2), [
        *F(4, 2, 0, 1),
        ('N', 'E ele viu mesmo. Só que era o Laranja, disfarçado.'),
        *F(4, 2, 1, 2),
        *F(4, 2, 4, 5),
        ('N', 'O Vermelho tem razão: quem tinha mesmo visto alguém no duto era o Azul, e era o Laranja disfarçado. Mas aí o Lima, que tava nas câmeras...'),
        *F(4, 2, 5, 6),
        ('N', 'Eu fui conferir no log. [[s:typing:0.4]] Nesse tique, o Vermelho tava mesmo indo pro O2. O Lima olhou as câmeras e errou o que viu. [[m:surprised-pikachu:right:2.5]] O Vermelho falou a verdade, e foi desmentido por uma "prova de câmera" errada.'),
    ]),
    N('p408v', 'p4', votos(4, 2), 'E o Laranja ainda votou no Azul, só pra parecer o único com bom senso.', pad=1.4),
    N('p408e', 'p4', ejecao(4, 2), '', pad=3.2),
    N('p409', 'p4', jogo(4, 'Laranja', evento=morte('Branco'), antes=1.5),
      'No apagão, o Laranja mata o Branco, o Detetive. [[s:death:0.6]][[p]] E aí todo mundo quer o mesmo corpo: o Laranja quer denunciar pra acusar o Verde. O Verde quer denunciar porque viu a morte no escuro. E o Preto... "limpar o corpo do Branco agora é perfeito pra sumir com a prova".', pad=0.8),
    N('p409c', 'p4', chamado(4, 3), '', pad=1.6),
    CH('p409d', 'p4', reuniao(4, 3), [
        *F(4, 3, 0, 2),
        ('N', 'Ele confessou sozinho. [[m:eye-roll:right:2.5]]'),
        *F(4, 3, 3, 6),
        ('N', 'E o Laranja, o verdadeiro assassino do Branco...'),
        *F(4, 3, 8, 9),
    ]),
    N('p409v', 'p4', votos(4, 3), 'O Laranja votou no Preto. Dois parceiros, dois votos.', pad=1.4),
    N('p409e', 'p4', ejecao(4, 3), '', pad=3.2),
    N('p409f', 'p4', chamado(4, 4), 'Cinco vivos. Barra de tarefas em noventa e seis por cento. A única chance do Laranja é os tripulantes errarem de novo. E o Lima aperta o botão.', pad=0.8),
    CH('p409b', 'p4', reuniao(4, 4), [
        *F(4, 4, 1, 4),
        *F(4, 4, 4, 7),
    ]),
    N('p409v2', 'p4', votos(4, 4), 'E pela primeira vez na temporada... os tripulantes aprenderam. [[m:lets-go:right:2.5]] Todo mundo pulou. Menos o Laranja, que votou no Lima.', pad=1.0),
    N('p410', 'p4', comp('AU2Fim', partida=4, foco='Lima'),
      'Sobrou o Laranja, sozinho contra quatro. E a tripulação terminou as tarefas. [[s:sad-party-horn:0.5]] Tripulantes vencem de novo.', pad=1.0),


    # ------------------------------------------------------------------ FIM
    N('f01', 'fim', comp('AU2Placar', ate=4),
      'Placar final da temporada: tripulantes quatro... [[p]][[s:impact-epic:0.5]] impostores zero. [[m:stonks:right:2]] Quatro partidas, doze inteligências artificiais, e nenhum impostor ganhou. Mas teve premiação.'),
    N('f01b', 'fim', comp('AU2Premios'),
      '[[s:drumroll:0.4]] Os prêmios da temporada. Assassino da temporada: o Verde, do Gemini. Quatro mortes... e expulso nas duas partidas. Impostor mais frio: o Azul, do DeepSeek. Duas partidas de impostor, três mortes, e nunca foi expulso. Motorista do duto: o Laranja, do GPT. Dezenove viagens de duto, zero mortes. [[m:pedro-raccoon:right:2]] Médico do ano: duas partidas seguidas dando escudo pro impostor. Xerife: quatro xerifes na temporada... zero tiros. E a profissão mais perigosa da nave: Detetive. Expulso duas vezes por falar a verdade. [[s:sad-trombone:0.4]]', pad=1.2),
    N('f02', 'fim', comp('AU2Final'),
      'Temporada dois não é pergunta. É inevitável. [[m:thanos-inevitable:right:2.5]] Comenta aí qual IA você quer ver de impostor, e qual função nova eu devo colocar. Se inscreve, deixa o like, e até a próxima temporada.', pad=1.2),
    N('f03', 'fim', comp('AU2Opus'),
      'Ah... e o Claude Opus? [[s:typing:0.4]] Até agora... nenhuma resposta.', pad=3.2),
]

# Trilha (Kevin MacLeod, CC BY 4.0) por bloco de cenas, lida por scripts/mix_audio.py --roteiro roteiro_au2:
# (primeira cena, música, início dentro da faixa em s[, ganho extra, corte seco])
CUES = [  # uma música diferente por bloco: nenhuma faixa se repete no vídeo
    ('a01', 'decisions', 0),
    ('a03', 'monkeys-spinning-monkeys', 0, 1.0, True),
    ('a04', 'voxel-revolution', 0),
    ('n01', 'pixel-peeker-polka-faster', 0),
    ('p101', 'sneaky-snitch', 0),
    ('p105', 'thinking-music', 0),
    ('p107', '8bit-dungeon-level', 0),
    ('p110', 'fluffing-a-duck', 0),
    ('p201', 'itty-bitty-8-bit', 0),
    ('p205', 'relent', 0),
    ('p207', 'mega-hyper-ultrastorm', 0),
    ('p210', 'heartbreaking', 0),
    ('p301', 'quirky-dog', 0),
    ('p305', 'despair-and-triumph', 0),
    ('p307', 'chill-wave', 0),
    ('p401', '8bit-dungeon-boss', 0, 1.0, True),
    ('p406', 'bit-shift', 0),
    ('p408', 'call-to-adventure', 0),
    ('p410', 'heroic-age', 0),
    ('f01', 'winner-winner', 0),
    ('f02', 'chipper-doodle-v2', 0),
]
# telas com vinheta própria: a trilha fica muda nelas (senão parecem duas músicas ao mesmo tempo)
SEM_TRILHA = ['AU2Revela', 'AU2Fim', 'AU2Shhh', 'AU2Opus']
