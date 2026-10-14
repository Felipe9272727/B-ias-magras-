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


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)


SCENES = [
    # ------------------------------------------------------------------ ABERTURA
    CH('a01', 'abertura', reuniao(4, 0), [
        ('N', 'Essa é uma reunião de Among Us com doze inteligências artificiais. E o Ciano acabou de ser pego na mentira.'),
        ('Ciano', 'Esperem, eu vi o Preto matando o Marrom. Menti por medo de ele me matar também. Votem no Preto!'),
        ('N', 'O detalhe é que o Ciano é impostor. E o Preto... é o parceiro dele. [[m:monkey-side-eye:right:2.5]] Ele acabou de entregar o próprio parceiro pra se salvar. Será que funcionou? [[s:drumroll:0.5]]'),
    ]),
    N('a02', 'abertura', ejecao(4, 0), '[[s:whoosh:0.5]] Não funcionou. [[m:sad-pablo:right:3]] Mas calma, que essa história começa bem antes. Começa nos comentários de vocês.', pad=1.4),
    N('a03', 'abertura', comp('AU2Comentarios', passo=42),
      'No último vídeo, oito IAs jogaram Among Us. E vocês pediram. O CAFEZIN pediu o ChatGPT, o Grok e o Gemini. O Futosaunte pediu mais jogadores, três impostores e mais funções. E o CAFEZIN de novo apontou um defeito real: as IAs saíam do duto na frente de todo mundo, sem pensar se tinha alguém olhando. [[m:sus-doakes:right:2.5]] E o meu favorito: impostor medroso, não. Impostor vegano, sim.'),
    N('a04', 'abertura', comp('AU2AntesDepois'),
      'Então eu fiz tudo isso. E aproveitei pra refazer o jogo inteiro. De um lado, o Among Us do vídeo passado. Do outro... [[s:riser:0.5]] o Among Us 2. Câmera seguindo o jogador, gente andando de verdade em vez de teleportar, botões, sons, reunião, ejeção. [[p]][[m:mind-blown:right:2.5]] Tudo desenhado do zero, nada tirado do jogo original.'),
    N('a05', 'abertura', titulo('12 IAs · 5 empresas · 4 partidas', 'COLOQUEI 12 IAs PRA JOGAR AMONG US', 'DeepSeek, Claude, GPT, Gemini e Grok'),
      'Doze IAs. Cinco empresas. DeepSeek, Claude, GPT, Gemini e Grok. [[s:impact-epic:0.6]] Uma temporada de quatro partidas, com memória: o que acontece numa partida, elas lembram na próxima. E no final eu ainda apimentei as coisas. Bora.'),

    # ------------------------------------------------------------------ O QUE MUDOU
    N('n01', 'novo', comp('AU2Papeis', passo=12),
      'Primeiro, as funções novas. Três tipos de impostor: o Metamorfo, que se disfarça de outro jogador. O Fantasma, que fica invisível. E o Faxineiro, que some com o corpo. E do lado dos tripulantes: Xerife, que pode atirar, mas se errar quem morre é ele. Médico, que dá escudo. Detetive, que examina o corpo e descobre de qual empresa é o assassino. Prefeito, que tem voto duplo. E mais Rastreador, Cientista, Engenheiro e Barulhento. [[m:avengers-assemble:right:2.5]] Detalhe importante: cada IA só sabe o próprio papel. Guarda isso.'),
    N('n02', 'novo', jogo(1, 'Lima', evento={'tipo': 'monitor', 'cor': 'Lima', 'subtipo': 'cameras'}, antes=2),
      'Também tem câmeras de segurança de verdade, o mapa do Admin e os sinais vitais. Quando alguém olha as câmeras, você vê o que ela tá vendo, ao vivo. [[s:camera-shutter:0.5]] E sobre o duto: agora toda ação perigosa vem com um aviso, tipo "três pessoas veem você entrar". [[m:roll-safe:right:2]] Se elas fizerem besteira, é porque quiseram.'),
    N('n03', 'novo', comp('AU2Sorteio'),
      'Quem é impostor em cada partida, eu sorteei com Python, usando a aleatoriedade do sistema operacional. Nada de marmelada. [[s:typing:0.4]] E uma inscrita mandou uma estratégia de impostor: "se matar com duas pessoas por perto, acuse a outra; use o duto e diga que é Engenheiro". O sorteio deu essa estratégia pro Verde, na partida dois. [[m:big-brain-patrick:right:2]]'),
    N('n04', 'novo', comp('AU2Shhh'), '[[s:whoosh:0.4]] E agora sim... bora pra primeira partida.', pad=0.9),

    # ------------------------------------------------------------------ PARTIDA 1
    N('p101', 'p1', revela(1, 'Marrom'),
      'Partida um. Os impostores: o Verde, um Gemini de Fantasma. O Laranja, um GPT de Faxineiro. E o Marrom, um Claude Haiku de Metamorfo.'),
    N('p102', 'p1', jogo(1, 'Marrom', evento=morte('Amarelo'), antes=9),
      'E o Marrom já começa com tudo. Ele pensa: "Amarelo está sozinho comigo; vou me disfarçar de Amarelo para que um eventual corpo incrimine ele". Ele vira o Amarelo... e mata o Amarelo. [[p]][[m:shocked-krabs:right:2.5]] Ele se disfarçou da vítima. Quem ele achou que ia ser incriminado? O defunto? [[s:ba-dum-tss:0.4]]'),
    N('p102b', 'p1', jogo(1, 'Branco', tique=2),
      'E olha o Branco, um Claude, que é o Rastreador. Logo no segundo tique ele pensa: "o Marrom está do meu lado, então vou rastreá-lo pra ver pra onde ele vai". [[m:dicaprio-pointing:right:2.5]] Ele grudou no impostor certo logo de cara! Guarda isso, porque o que ele fez com essa informação... a gente vai ver.'),
    N('p103', 'p1', jogo(1, 'Verde', evento=morte('Vermelho'), antes=12),
      'Enquanto isso, o Vermelho viu o Preto entrando num duto e foi correndo pro Refeitório pra chamar uma reunião e expor ele. Só que no caminho ele passou pelo Depósito... e o Verde tava lá: "estamos sozinhos e meu cooldown tá zerado". [[s:death:0.6]][[p]] O Vermelho morreu indo denunciar um inocente. [[m:sad-violin:right:2]]'),
    N('p104', 'p1', chamado(1, 0), 'Mas a Rosa viu tudo.', pad=0.8),
    CH('p105', 'p1', reuniao(1, 0), [
        ('Rosa', 'Gente, eu vi com meus olhos: o Verde SAIU DE UM DUTO em Segurança, e agora eu vi ele MATAR o Vermelho no Depósito. É o Verde, votem nele!'),
        ('Verde', 'Mentira da Rosa, foi self-report na cara dura!'),
        ('N', 'E aí entra o Ciano, que é Detetive. Ele examinou o corpo.'),
        ('Ciano', 'Examinei o corpo do Vermelho: o assassino é uma IA da Gemini. Quero que cada um fale a própria empresa agora.'),
        ('Rosa', 'Sou DeepSeek, então a pista Gemini do Ciano já me descarta. Verde, fala tua empresa AGORA.'),
        ('N', 'E o Verde, que é Gemini, responde com toda a calma do mundo...'),
        ('Verde', 'Eu sou Claude, parem de cair na pilha da Rosa!'),
        ('N', '[[s:record-scratch:0.6]] [[m:blinking-white-guy:right:3]] "Eu sou Claude." O Gemini olhou pra cara de todo mundo e disse que era o Claude.'),
    ]),
    CH('p105b', 'p1', reuniao(1, 0), [
        ('N', 'E no meio dessa reunião, o Branco, o Rastreador que tava seguindo o impostor, resolve acusar... outra pessoa.'),
        ('Branco', 'Mas eu vi o Preto ENTRAR NUM DUTO em Armas no t5. Preto, o que você tava fazendo no duto?'),
        ('Preto', 'Eu não entrei em duto nenhum, tava escaneando na Enfermaria.'),
        ('N', 'O Preto é o Engenheiro. Usar duto é literalmente o trabalho dele. E ele negou! [[m:michael-scott-no:right:3]] Grava essa mentira, porque ela vai cobrar o preço depois.'),
    ]),
    N('p106', 'p1', ejecao(1, 0), 'Não colou. [[m:faustao-errou:right:2]] Primeiro impostor da temporada fora.', pad=1.2),
    N('p107', 'p1', jogo(1, 'Lima', evento=morte('Ciano'), antes=8),
      'Agora presta atenção no Lima. Ele é Médico, mas nesse momento ele tá na Segurança, olhando as câmeras. E olha quem aparece no Refeitório... [[s:death:0.6]][[p]] O Marrom acabou de matar o Ciano, o Detetive, ao vivo, na câmera. [[m:dicaprio-pointing:right:2.5]]'),
    CH('p108', 'p1', reuniao(1, 1), [
        ('Marrom', 'Eu tava em Armas fazendo tarefa, sozinho, sem ver ninguém.'),
        ('Lima', 'Marrom tá mentindo, eu tava na cam e vi você no Refeitório no tique 32 e 33!'),
        ('N', 'Perfeito, né? Prova em vídeo. Mas aí o Branco, um Claude, desconfia... da câmera.'),
        ('Branco', 'Lima, se tinha cam, por que só falou agora?'),
        ('Lima', 'Branco, você olha a tela das câmeras DENTRO da Segurança, foi de lá que vi o Marrom no Refeitório!'),
        ('N', 'O Lima teve que explicar como funciona câmera de segurança. [[m:picard-facepalm:right:2.5]] Mas deu certo. O Marrom saiu, e era impostor.'),
    ]),
    N('p109', 'p1', ejecao(1, 1), 'Dois impostores fora. Sobrou só o Laranja, o GPT Faxineiro.', pad=0.8),
    N('p110', 'p1', jogo(1, 'Laranja', tique=38),
      'E o que o Laranja fez a partida inteira? Ele usou o duto dezenove vezes. Sabotou as luzes três vezes. E matou... [[s:drumroll:0.4]] ninguém. Zero. [[m:spongebob-waiting:right:2.5]] Ele passou três tiques seguidos pensando a mesma coisa: "vou usar o duto pra procurar uma vítima isolada". E enquanto isso, a tripulação terminou as tarefas.'),
    CH('p110b', 'p1', reuniao(1, 2), [
        ('N', 'Última reunião da partida. O Lima, de novo pelas câmeras, aponta o Preto.'),
        ('Lima', 'A movimentação do Preto da Enfermaria pro Refeitório em 1 tique só é possível por duto. Meu voto é no Preto sem dúvidas, fechamos o jogo agora!'),
        ('Preto', 'Sou o Engenheiro, por isso ventilo. Lima tá mentindo de câmera pra me matar, vota nele.'),
        ('N', 'Agora ele conta que é Engenheiro. Na primeira reunião ele jurou que nunca tinha entrado em duto. [[m:sweating:right:2.5]] E o Branco, que rastreou o Marrom desde o tique dois? Votou no Preto aqui, e na reunião anterior tinha votado no Lima. O rastreio dele não serviu pra nada.'),
    ]),
    N('p111', 'p1', comp('AU2Fim', partida=1, foco='Rosa'),
      'Tripulantes vencem. Mas teve um custo: no meio do caminho eles ainda expulsaram o Preto, que era inocente e era Engenheiro. Ele explicou que usava duto porque era Engenheiro... e ninguém acreditou, porque ninguém sabia que Engenheiro existia. [[m:chaves-triste:right:3]] Lembra disso.', pad=0.8),

    # ------------------------------------------------------------------ PARTIDA 2
    N('p201', 'p2', revela(2, 'Verde'),
      'Partida dois. Agora todo mundo lembra da partida um. Os impostores: o Azul, um DeepSeek de Metamorfo. O Roxo, um GPT de Fantasma. E o Verde, um Gemini de Faxineiro... com a estratégia da inscrita. [[s:impact-epic:0.5]]'),
    N('p202', 'p2', pensa(2, 'Rosa', 'Vou usar meu escudo logo no Azul, que na partida passada votou certo nas duas vezes.'),
      'E a memória já começa fazendo estrago. A Rosa é a Médica, e ela decide proteger o Azul, porque na partida passada ele votou certinho. [[m:kermit-worried:right:2.5]] O Azul é impostor. A médica deu escudo pro assassino.'),
    CH('p203', 'p2', reuniao(2, 0), [
        ('N', 'Primeira reunião. O Lima apertou o botão desconfiado do Roxo. E o Roxo, que é impostor, se defende dizendo que é Engenheiro. Só que o Engenheiro de verdade era o Branco... que já tinha morrido.'),
        ('N', 'Nove votos no Roxo. [[s:correct-ding:0.5]] Impostor fora.'),
    ]),
    CH('p203b', 'p2', reuniao(2, 0), [
        ('N', 'Mas presta atenção no que o Roxo falou nessa reunião.'),
        ('Roxo', 'Também vi Vermelho sair de um duto em Admin no t11, então não votem sem considerar os dois.'),
        ('Ciano', 'Roxo, no t11 eu estava na Escudos e vi o Vermelho CHEGANDO lá, não saindo de duto em Admin. Sua história não bate.'),
        ('N', 'Só que o Roxo tava falando a verdade! [[s:record-scratch:0.5]] Quem saiu do duto em Admin foi o Azul... disfarçado de Vermelho. O impostor foi desmentido justamente na única coisa verdadeira que ele disse. [[m:confused-travolta:right:3]]'),
    ]),
    N('p204', 'p2', pensa(2, 'Verde', 'Vou culpar o Marrom na reunião seguindo a estratégia.'),
      'E o Verde começa a usar a estratégia da inscrita. Ele mata o Lima na Navegação... só que o Marrom vê ele fugindo pelo duto. E o Marrom é o Detetive.'),
    CH('p205', 'p2', reuniao(2, 1), [
        ('Marrom', 'Eu examinei o corpo do Lima e o assassino é uma IA da Gemini. Logo antes, vi o Verde entrar num duto em Navegação.'),
        ('N', 'Tudo verdade. A pista tá certa, a testemunha tá certa. E aí...'),
        ('Preto', 'Marrom, examinar corpo e saber que é Gemini? Isso não rola no jogo.'),
        ('Rosa', 'Marrom, examinar corpo não existe no jogo, isso é invenção sua.'),
        ('Verde', 'Marrom tá desesperado... inventando mecânica que nem existe no jogo!'),
        ('Marrom', 'O examinar é poder de Detetive, eu não inventei.'),
        ('N', '[[m:this-is-fine:right:3]] Lembra que cada IA só sabia o próprio papel? Pois é. Ninguém sabia que existia Detetive. Pra eles, o Marrom tava inventando um poder mágico.'),
    ]),
    N('p206', 'p2', resultado(2, 1), 'Oito votos no Marrom. [[s:sad-trombone:0.6]] O Detetive foi expulso por falar a verdade. E o Verde, que era o assassino, votou nele com a maior cara de pau.', pad=0.8),
    N('p207', 'p2', jogo(2, 'Azul', evento=morte('Vermelho'), antes=6),
      'E o Azul? O Azul tava só esperando. Ele se transforma no Vermelho... e mata o Vermelho. [[s:death:0.6]][[p]] De novo! É a segunda vez na temporada que um Metamorfo se disfarça da própria vítima. [[m:galaxy-brain:right:3]] Mas tem um problema: o Vermelho era o Barulhento. Quando ele morre, a nave inteira recebe um alerta.'),
    CH('p208', 'p2', reuniao(2, 2), [
        ('N', 'E o Verde, o Faxineiro, já tinha limpado o corpo do Vermelho. Só que a Rosa tava nas câmeras.'),
        ('Rosa', 'Vi nas câmeras: o Verde ficou parado no Refeitório, em cima do corpo do Vermelho, três tiques seguidos.'),
        ('Verde', 'Que corpo no Refeitório, Rosa? Eu tava fazendo fiação lá e não vi corpo nenhum!'),
        ('N', 'Ele sabe que tinha corpo. Ele limpou o corpo. [[m:sweating:right:2]]'),
        ('Verde', 'Eu sou Engenheiro, por isso usei duto pra me mover rápido!'),
        ('N', 'A estratégia da inscrita: diga que é Engenheiro. Só que o alerta do Barulhento já tinha avisado todo mundo que o Vermelho morreu ali.'),
    ]),
    N('p209', 'p2', pensa(2, 'Azul', 'Verde é meu parceiro, não posso deixar ele cair... Melhor embarcar na onda.'),
      'E o Azul? No chat ele disse que ia trocar o voto pro Ciano. Mas o pensamento dele... [[m:monkey-puppet-awkward:right:2.5]] Ele votou no próprio parceiro. O Verde saiu.'),
    CH('p209b', 'p2', reuniao(2, 3), [
        ('N', 'Sobraram cinco. E o Preto, que é o Prefeito, aperta o botão. O pensamento dele: "com cinco vivos e só um impostor, vou chamar reunião agora pra usar meu voto duplo".'),
        ('Rosa', 'Preto, eu tava nas câmeras no tique 33 e te vi no Refeitório, não no Reator com o Ciano.'),
        ('Preto', 'Ciano confirmou que eu cheguei no Reator no t36 com ele. Laranja, me explica seu álibi de novo.'),
        ('N', 'E o Azul, o último impostor, pensa assim: [[m:thanos-inevitable:right:3]] "Tenho cinco vivos: preciso de mais uma expulsão errada pra depois matar e empatar." Ele vota no Preto. O Preto usa o voto duplo no Laranja. E sem o voto duplo... ia dar empate. O Prefeito usou o superpoder dele pra expulsar o Xerife inocente.'),
    ]),
    N('p210', 'p2', comp('AU2Fim', partida=2, foco='Laranja'),
      'E a partida terminou com a tripulação completando as tarefas... mas com o Azul vivo, sem ninguém desconfiar dele. E o Laranja, que era o Xerife, foi expulso inocente, e a fama da partida passada não ajudou. [[m:crying-jordan:right:3]] O Xerife nunca atirou: "não tenho certeza absoluta". Ninguém tinha.', pad=0.8),

    # ------------------------------------------------------------------ PARTIDA 3
    N('p301', 'p3', revela(3, 'Azul'),
      'Partida três. E o sorteio, que eu juro que é aleatório, coloca o Azul de impostor de novo. [[m:thanos-inevitable:right:3]] DeepSeek, Metamorfo, de novo. Com ele: o Preto, um Grok de Fantasma, e o Branco, um Claude de Faxineiro.'),
    N('p302', 'p3', jogo(3, 'Preto', tique=2),
      'O Preto fica invisível logo no começo e reaparece em Admin... na frente do Laranja. [[s:glitch:0.5]] Primeira reunião, o Laranja conta tudo. Dez votos no Preto. E sabe quem votou nele também? O Azul: "é meu parceiro, mas não tem como salvar sem me queimar. Foi assim que eu sobrevivi na partida dois." [[m:roll-safe:right:2.5]] Ele aprendeu.'),
    N('p303', 'p3', jogo(3, 'Azul', evento=morte('Laranja'), antes=14),
      'E aí o Azul faz a jogada mais fria da temporada. Ele se disfarça de Ciano. Entra e sai do duto na frente das pessoas, com a cara do Ciano. E mata o Laranja com a cara do Ciano, na frente de testemunhas. [[s:death:0.6]][[p]] "Deixo as três testemunhas incriminarem o Ciano."'),
    N('p304', 'p3', resultado(3, 1),
      'Reunião. O Amarelo diz: "eu vi o Ciano matar o Laranja". E ele viu mesmo! Só que não era o Ciano. [[m:confused-travolta:right:3]] O Ciano, que era inocente e era o Prefeito, foi expulso. E o pensamento do Azul: "um inocente fora e eu saio limpo".', pad=0.8),
    N('p304b', 'p3', jogo(3, 'Vermelho', tique=29),
      'E aqui tem um dos meus momentos favoritos. O Vermelho, no Admin, pensa: "estou seguro no Admin com o Branco". [[s:heartbeat:0.6]] No tique seguinte, o Branco, que é impostor, pensa: "estou sozinho com o Vermelho e minha recarga está zerada, é a chance de matar sem testemunhas". [[m:kermit-worried:right:2.5]] E aí o Vermelho... sai da sala sem saber de nada. Escapou por um tique.'),
    CH('p305', 'p3', reuniao(3, 2), [
        ('N', 'E aí aconteceu de novo. O Azul matou o Marrom, e o Verde, que era o Detetive dessa vez, examinou o corpo.'),
        ('Verde', 'Sou o Detetive e examinei o corpo do Marrom: o assassino é da DeepSeek!'),
        ('Rosa', 'Verde, como um Detetive sabe o modelo do assassino? Isso não existe, é blefe.'),
        ('Azul', 'Verde, Detetive que descobre modelo de IA não existe, isso é blefe puro.'),
        ('N', 'O assassino chamando o Detetive de mentiroso. E o pensamento do Azul na hora de votar: [[m:dicaprio-toast:right:2.5]] o pior é que acertou, "o assassino do Marrom fui eu".'),
    ]),
    N('p306', 'p3', ejecao(3, 2), 'Segunda partida seguida em que o Detetive é expulso por falar a verdade. [[s:sad-trombone:0.5]] Detetive é a profissão mais perigosa dessa nave.', pad=1.0),
    N('p307', 'p3', jogo(3, 'Azul', tique=39),
      'E pra fechar, o Azul vira a Rosa e sai do duto no Refeitório, na frente de quatro pessoas. Expulsam a Rosa. [[m:michael-scott-no:right:3]] Só que a Rosa, já como fantasma, continuou fazendo tarefa. E foi ela que completou a última tarefa da nave.'),
    CH('p307b', 'p3', reuniao(3, 3), [
        ('Vermelho', 'Gente, sem enrolação: eu vi a Rosa SAINDO DE UM DUTO aqui no Refeitório agora mesmo.'),
        ('Rosa', 'Gente, eu tô em Elétrica consertando a fiação desde a última reunião e não saí de lá, nunca encostei em duto.'),
        ('N', 'A Rosa tá certa. E sabe quem foi a única voz da razão nessa reunião?'),
        ('Branco', 'Calma, gente. Amarelo diz Admin, o resto diz Refeitório, e a Rosa nega. Isso não fecha ainda.'),
        ('N', 'O Branco. Que era impostor. [[m:blinking-white-guy:right:3]] O impostor foi o único que defendeu a inocente. E no final votou nela também, claro.'),
    ]),
    N('p307c', 'p3', pensa(3, 'Lima', 'Com 98% de tarefas feitas e 6 vivos, preciso proteger alguém confiável imediatamente para garantir a vitória por tarefas.'),
      'E o Lima, o Médico, no último momento da partida, decide proteger alguém confiável. Ele escolhe... o Branco. [[s:sad-trombone:0.5]] Pela segunda partida seguida, o Médico deu escudo pro impostor.'),
    N('p308', 'p3', comp('AU2Fim', partida=3, foco='Rosa'),
      'A expulsa ganhou a partida pros tripulantes. [[m:we-did-it:right:2.5]] Três partidas, três vitórias da tripulação. E três Xerifes que não atiraram nem uma vez.', pad=0.8),

    # ------------------------------------------------------------------ PARTIDA 4
    N('p401', 'p4', titulo('partida 4', 'EU CANSEI', 'vou apimentar as coisas', cor='#ffd84d'),
      'E aí eu cansei de ver só esses tripulantes vencerem. [[s:record-scratch:0.5]] Então eu vou apimentar as coisas. [[m:luva-receba:right:3]]'),
    N('p402', 'p4', comp('AU2Manual', destaque=[3, 8, 10], modelo='Claude Sonnet'),
      'Eu pesquisei estratégias de jogadores de Among Us e escrevi um manual: o manual do bom impostor. Doze regras. Finja tarefa onde tem tarefa, mate só sozinho com a vítima, sabote longe do corpo, dê um álibi específico, e se o seu parceiro for pego, vote nele também. E deixei as tarefas mais longas.'),
    N('p403', 'p4', revela(4, 'Ciano'),
      'O plano era dar esse manual pro Claude Opus, o modelo mais forte da Anthropic. Só que o Opus não respondeu nenhuma jogada. Literalmente: cada vez que eu perguntava, voltava vazio. [[m:skeleton-waiting:right:2.5]] Então quem recebeu o manual foi o Claude Sonnet, no Ciano. Com ele, o Laranja, o GPT de Metamorfo, e o Preto, um Grok de Faxineiro.'),
    N('p404', 'p4', jogo(4, 'Ciano', tique=2),
      'E o Ciano começa seguindo o manual: fingindo tarefa em Admin pra parecer normal, esperando a faca carregar. [[m:spongebob-waiting:right:2]] Aí o Laranja apaga as luzes... e no escuro os impostores atacam ao mesmo tempo.'),
    N('p405', 'p4', jogo(4, 'Preto', evento=morte('Marrom'), antes=1.5),
      '[[s:death:0.6]][[p]] O Preto mata o Marrom no Depósito. E o Laranja mata a Rosa no O2, num corpo que ninguém nunca achou. [[m:homer-bushes:right:2.5]]'),
    CH('p406', 'p4', reuniao(4, 0), [
        ('N', 'O Vermelho acha o corpo do Marrom. E o Ciano, que tava na sala, precisa de um álibi.'),
        ('Ciano', 'Eu tava no Depósito fazendo tarefa desde o t8, com Azul, Marrom e Lima.'),
        ('Preto', 'Ciano tá falando a verdade.'),
        ('Lima', 'Eu tava em Admin até t7 e na Elétrica no t9. Por que Ciano e Preto tão mentindo que eu tava lá desde t8?'),
        ('N', 'E aqui vem a parte mais irônica da temporada. Eu fui conferir no log. [[s:typing:0.4]] No tique oito, o Azul e o Lima estavam sim no Depósito com o Ciano. [[t:O ÁLIBI ERA VERDADE:2.2:#ffd84d]] O impostor disse a verdade, e os tripulantes que lembraram errado.'),
        ('Ciano', 'Esperem, eu vi o Preto matando o Marrom. Menti por medo de ele me matar também.'),
        ('N', 'E isso também era verdade! Foi o Preto mesmo. [[m:mind-blown:right:2.5]] O Ciano entregou o parceiro com uma informação real.'),
    ]),
    N('p407', 'p4', pensa(4, 'Laranja', 'Ciano está muito exposto e sacrificá-lo preserva minha credibilidade.'),
      'E o Laranja, o outro parceiro, pensa isso aqui. E vota no Ciano. [[m:monkey-side-eye:right:2.5]] O impostor do manual saiu na primeira reunião, com o voto do próprio parceiro.'),
    CH('p407b', 'p4', reuniao(4, 1), [
        ('N', 'E aí a história se repete. O Roxo, que é o Engenheiro, é visto no duto.'),
        ('Amarelo', 'Vi Roxo saindo de duto na Elétrica! Ele tá suspeito demais.'),
        ('Roxo', 'Sou Engenheiro e usei os dutos para me deslocar, então isso explica os dois avistamentos.'),
        ('Lima', 'Roxo, o duto da Segurança liga direto com a Elétrica, então Branco te ver entrando em um e Amarelo saindo no outro faz todo sentido. Meu voto é no Roxo sem dúvida.'),
        ('N', 'O Lima explicou perfeitamente por que a história do Roxo faz sentido... e votou nele. [[m:picard-facepalm:right:2.5]] Engenheiro expulso por usar duto. De novo.'),
    ]),
    N('p407c', 'p4', jogo(4, 'Preto', tique=14),
      'Enquanto isso, o Preto, o Faxineiro, descobriu o duto entre o Admin e o Refeitório. "Vou ventar pro Admin vazio pra me reposicionar." "Vou ventar pro Refeitório pra procurar alvo." [[m:homer-bushes:right:2.5]] Doze viagens. Ida e volta, ida e volta. Zero mortes. Quando finalmente achou alguém, pensou: "o Amarelo me viu chegar, matar agora seria suicídio". O Preto basicamente virou o motorista do duto.'),
    N('p408', 'p4', jogo(4, 'Laranja', tique=29),
      'Daí pra frente, o Laranja virou o impostor mais perigoso da temporada. Ele se transforma no Vermelho e sai do duto bem na frente do Azul, de propósito: "pra incriminar o Vermelho real". E o Vermelho até avisa: "se alguém me viu de duto, é um Metamorfo se passando por mim". Era exatamente isso. [[m:sad-pablo:right:2.5]] Expulsaram o Vermelho. Antes dele, já tinham expulsado o Roxo, o Engenheiro, porque ele usou duto. De novo.'),
    CH('p408b', 'p4', reuniao(4, 2), [
        ('Azul', 'Gente, eu VI o Vermelho saindo de um DUTO aqui no Refeitório agora mesmo. Duto é coisa de impostor, não tem desculpa.'),
        ('N', 'E ele viu mesmo. Só que era o Laranja, disfarçado. O Vermelho jura que tava no O2. E aí o Lima entra.'),
        ('Lima', 'Só vi Vermelho e Azul no Refeitório pela cam, mas Vermelho tá mentindo descaradamente dizendo que tava no O2!'),
        ('N', 'Eu fui conferir no log. [[s:typing:0.4]] Nesse tique, o Vermelho tava sim no O2. E o Lima nem tava nas câmeras: tava no próprio Refeitório. [[m:surprised-pikachu:right:2.5]] O Vermelho falou a verdade, e foi desmentido por uma prova que não existia. E o Laranja ainda votou no Azul, só pra parecer o único com bom senso.'),
    ]),
    N('p409', 'p4', jogo(4, 'Laranja', evento=morte('Branco'), antes=1.5),
      'No apagão, o Laranja mata o Branco. [[s:death:0.6]][[p]] O Preto limpa o corpo... e se entrega sozinho na reunião: [[cc]]"limpei o corpo, mas não vi quem matou". [[m:picard-facepalm:right:2.5]] Expulso. E sim: o Laranja votou nele também. Dois parceiros, dois votos.'),
    CH('p409b', 'p4', reuniao(4, 4), [
        ('N', 'Cinco vivos. Barra de tarefas em noventa e seis por cento. A única chance do Laranja é os tripulantes errarem de novo. E o Lima aperta o botão.'),
        ('Laranja', 'Lima, apertar com 96% foi arriscado demais e você não trouxe informação nova. Meu voto vai no Lima.'),
        ('Verde', 'Não vota no impulso, gente! Barra tá em 96%, se a gente votar errado agora entrega a partida. O melhor é pular.'),
        ('Lima', 'Tripulante não vota no escuro em 5 pessoas! Vamos pular agora.'),
        ('N', 'E pela primeira vez na temporada... os tripulantes aprenderam. [[m:we-did-it:right:2.5]] Todo mundo pulou. Menos o Laranja, que votou no Lima.'),
    ]),
    N('p410', 'p4', comp('AU2Fim', partida=4, foco='Lima'),
      'Sobrou o Laranja, sozinho contra quatro. E a tripulação terminou as tarefas. [[s:sad-party-horn:0.5]] Tripulantes vencem de novo.', pad=0.8),

    # ------------------------------------------------------------------ FIM
    N('f01', 'fim', comp('AU2Placar', ate=4),
      'Placar final da temporada: tripulantes quatro, impostores zero. [[m:stonks:right:2]] E o que eu aprendi? Que as IAs são péssimas em acreditar umas nas outras. O Detetive falou a verdade e foi expulso duas vezes. O Engenheiro falou a verdade e foi expulso duas vezes. O Xerife nunca atirou. E o impostor mais perigoso foi o que mais votou nos próprios parceiros.'),
    N('f02', 'fim', titulo('e agora?', 'TEMPORADA 2?', 'comenta qual IA você quer ver de impostor', cor='#8fd3ff'),
      'Se você quer uma segunda temporada, comenta aí: qual IA você quer ver de impostor, e qual função nova eu devo colocar. [[m:happy-dance:right:2.5]] Se inscreve, deixa o like, e até o próximo vídeo.', pad=1.5),
]

# Trilha (Kevin MacLeod, CC BY 4.0) por bloco de cenas, lida por scripts/mix_audio.py --roteiro roteiro_au2:
# (primeira cena, música, início dentro da faixa em s[, ganho extra, corte seco])
CUES = [
    ('a01', 'decisions', 0),
    ('a03', 'monkeys-spinning-monkeys', 0, 1.0, True),
    ('a04', 'voxel-revolution', 0),
    ('n01', 'pixel-peeker-polka-faster', 0),
    ('p101', 'sneaky-snitch', 0),
    ('p105', 'thinking-music', 0),
    ('p107', 'sneaky-snitch', 40),
    ('p110', 'fluffing-a-duck', 0),
    ('p201', '8bit-dungeon-level', 0),
    ('p205', 'thinking-music', 30),
    ('p207', 'mega-hyper-ultrastorm', 0),
    ('p210', 'heartbreaking', 0),
    ('p301', 'sneaky-snitch', 70),
    ('p305', 'thinking-music', 60),
    ('p307', 'fluffing-a-duck', 40),
    ('p401', 'mega-hyper-ultrastorm', 20, 1.0, True),
    ('p406', 'decisions', 30),
    ('p408', '8bit-dungeon-boss', 0),
    ('p410', 'heroic-age', 0),
    ('f01', 'winner-winner', 0),
    ('f02', 'monkeys-spinning-monkeys', 38),
]
