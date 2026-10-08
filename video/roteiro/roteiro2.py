# -*- coding: utf-8 -*-
"""Roteiro do vídeo 2: "Coloquei 8 IAs pra jogar Among Us" (DeepSeek Flash × Claude Haiku).

Tudo o que aparece aqui aconteceu de verdade nas partidas registradas em amongus/logs/partida{1,2,3}.json:
as falas das IAs nas reuniões são copiadas do log (às vezes encurtadas com "..."), e os "pensamentos"
são o campo secreto que cada IA escreveu junto com a jogada.

Formato:
  N(id, capítulo, visual, texto)          cena narrada pelo Gabriel
  CH(id, capítulo, visual, [(quem, texto), ...])
        cena de chat: quem = 'N' (narrador) ou uma cor (fala da IA, lida com a voz daquela cor)

Marcações no texto do narrador (disparam quando a PRÓXIMA palavra é falada):
  [[m:meme:pos:dur:legenda]]  [[s:efeito:vol]]  [[p]] soco de câmera  [[t:TEXTO:dur:cor]]  [[cc]] legenda forçada
"""

CHAPTERS = {
    'abertura': 'Abertura',
    'regras': 'Como funciona',
    'p1': 'Partida 1 · O teste',
    'p2': 'Partida 2 · As luzes apagam',
    'p3': 'Partida 3 · O detetive',
    'placar': 'DeepSeek × Haiku',
    'fim': 'Encerramento',
}


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def titulo(kicker, title, sub='', cor='#ff4d4d'):
    return comp('AUTitulo', kicker=kicker, title=title, subtitle=sub, color=cor)


def replay(p, de, ate, pens=(), zoom=None, papeis=True):
    return comp('AUReplay', partida=p, de=de, ate=ate, pensamentos=list(pens), zoom=zoom, papeis=papeis)


def reuniao(p, i, pensamentos=False, papeis=False, splash=False):
    return comp('AUReuniao', partida=p, indice=i, mostrarPensamentos=pensamentos, papeis=papeis, splash=splash)


def dividida(p, de, ate, esquerda, direita):
    """Tela dividida "enquanto isso": duas câmeras ao mesmo tempo."""
    return comp('AUSplit', partida=p, de=de, ate=ate, esquerda=esquerda, direita=direita)


def votos(p, i):
    return comp('AUVotos', partida=p, indice=i)


def ejecao(p, i):
    return comp('AUEjecao', partida=p, indice=i)


def papel(p, cor):
    return comp('AUPapel', partida=p, cor=cor)


def elenco(p=2, revelar=False):
    return comp('AUElenco', partida=p, revelar=revelar)


def pensa(cor, texto, p=2, modo='pensa'):
    return comp('AUFrase', partida=p, cor=cor, texto=texto, modo=modo)


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)


SCENES = [
    # ------------------------------------------------------------------ ABERTURA
    CH('a01', 'abertura', reuniao(3, 0), [
        ('N', 'Essa aqui é a última reunião de uma partida de Among Us. Só que nenhum desses jogadores é humano. São oito IAs. E presta atenção no Preto.'),
        ('Preto', 'Vermelho, pensa: tu viu o Verde de duto e eu vi o Amarelo de duto no Refeitório. São os DOIS impostores, Amarelo e Verde! Estão me incriminando juntos.'),
        ('N', 'Ele tá certíssimo. Ele descobriu os dois impostores. E aí a votação... [[s:drumroll:0.5]]'),
    ]),
    N('a02', 'abertura', votos(3, 0), 'Quatro votos no Preto. [[s:sad-trombone:0.6]] [[m:crying-jordan:right:3]] Os próprios colegas dele votaram nele.', lead=0.3),
    N('a03', 'abertura', ejecao(3, 0), '[[s:whoosh:0.5]] ... [[p]]E o pior: quem puxou essa votação foram justamente os dois impostores. [[m:this-is-fine:right:3]]', pad=1.6),
    N('a04', 'abertura', titulo('8 IAs · 3 partidas · zero humanos', 'COLOQUEI 8 IAs PRA JOGAR AMONG US', 'DeepSeek Flash contra Claude Haiku'),
      'Hoje eu coloquei oito inteligências artificiais pra jogar Among Us umas contra as outras. Quatro são o DeepSeek Flash, uma IA chinesa. Quatro são o Claude Haiku, da Anthropic. [[s:impact-epic:0.6]] E a pergunta é simples: qual IA mente melhor? E qual IA sabe pegar uma mentira? [[m:sus-doakes:right:3]]'),
    N('a05', 'abertura', elenco(2), 'Eu recriei o jogo inteiro do zero. Nave, salas, dutos, tarefas, sabotagem, reunião, votação... e deixei elas se virarem. Eu não ajudei ninguém. Tudo o que você vai ver aqui aconteceu de verdade. E o melhor: eu consigo ler o que cada IA tava pensando em segredo. [[t:PENSAMENTOS SECRETOS:2:#ffd84d]]Então quando alguém mentir, você vai saber na hora. [[m:roll-safe:right:2]]'),

    # ------------------------------------------------------------------ REGRAS
    N('r01', 'regras', replay(2, 0, 4, papeis=False), 'Funciona assim. A nave tem catorze salas, inspirada na Skeld, o mapa clássico do jogo. A partida anda em turnos, que eu chamo de tiques. A cada tique, cada IA recebe um textão dizendo onde ela tá, quem ela tá vendo, o que ela lembra, e uma lista de ações possíveis. Andar pra uma sala, fazer tarefa, denunciar corpo... e se for impostor, matar, entrar no duto e sabotar.'),
    N('r02', 'regras', comp('AURegras'), 'Tem dois impostores e seis tripulantes. E pra ficar mais caótico, eu coloquei os papéis especiais do jogo. O Metamorfo, que é um impostor que consegue se disfarçar de outro jogador. O Engenheiro, que pode usar os dutos. O Cientista, que vê quem tá vivo ou morto. O Rastreador, que segue alguém pelo mapa. E o Barulhento, que quando morre dispara um alarme pra nave inteira. [[s:notification-pop:0.5]]'),
    N('r03', 'regras', pensa('Verde', 'Luzes apagadas, ninguém me vê. Vou pelo duto até o Refeitório e matar alguém lá sem testemunhas.'),
      'E toda vez que uma IA joga, ela também escreve um pensamento. Ninguém mais vê esse pensamento, só eu. É tipo ter uma câmera dentro da cabeça do impostor. [[m:hackerman:right:2]] E nas reuniões, cada IA fala no chat, uma de cada vez, em três rodadas, e depois todo mundo vota. Eu dei uma voz diferente pra cada cor, pra você ouvir o chat como se fosse uma call de verdade.'),
    N('r03b', 'regras', comp('AUPrompt', texto="TIQUE 9. Você é o jogador Verde.\nVocê está em: Admin. Salas vizinhas: Refeitório, Depósito.\nNa sala com você: ninguém.\n🚨 SABOTAGEM ATIVA: Luzes (conserte na Elétrica)\nSeu parceiro impostor: Amarelo. Recarga para matar: 0 tique(s).\nJogadores vivos: 8.\n\nO que você lembra:\n[t7] Sabotagem de Luzes ativada por mim.\n[t8] Em Admin: ninguém.\n\nAÇÕES POSSÍVEIS AGORA:\n- entrar no duto e sair em Refeitorio\n- ir para Deposito\n- olhar o mapa do Admin\n- fingir que faz tarefa\n- ficar parado observando\n\nResponda SÓ com JSON: {\"pensamento\": \"...\", \"acao\": \"...\"}", resposta='{"pensamento": "Luzes apagadas, ninguém me vê — vou pelo duto até o Refeitório e matar alguém lá sem testemunhas.", "acao": "entrar no duto e sair em Refeitorio"}'),
      'Pra você ter ideia, isso aqui é exatamente o que uma IA recebe num turno. [[s:typing:0.4]] Essa é a tela do Verde, um impostor, na partida dois. Ela não vê o mapa, não vê imagem nenhuma. É só texto. Onde ela tá, quem tá do lado, o que ela lembra, e a lista de ações. E ela devolve duas coisas: um pensamento e uma ação. [[s:mouse-click:0.5]] Nesse caso: "luzes apagadas, ninguém me vê, vou pelo duto até o Refeitório e matar alguém lá." [[m:hacker-typing:right:2.5]] Guarda essa jogada que ela vai aparecer daqui a pouco.'),
    N('r04', 'regras', titulo('a regra de ouro', 'UM IMPOSTOR DE CADA', 'pra ninguém dizer que foi marmelada', cor='#ffd84d'),
      'E pra ser justo: em toda partida, um impostor é DeepSeek e o outro é Haiku. Então eles têm que trabalhar juntos... mesmo sendo IAs de empresas rivais. [[m:distracted-boyfriend:right:3]] Bora pra primeira partida.'),

    # ------------------------------------------------------------------ PARTIDA 1
    N('p101', 'p1', titulo('partida 1', 'O TESTE', 'spoiler: deu errado', cor='#9ad0ff'), 'A primeira partida era pra ser só um teste. E... deu muito errado. Mas de um jeito engraçado.'),
    N('p102', 'p1', papel(1, 'Azul'), 'Os impostores eram o Azul, um Haiku com o papel de Metamorfo, e o Verde, um DeepSeek. E o Azul, coitado... [[s:ba-dum-tss:0.4]]'),
    N('p103', 'p1', replay(1, 8, 16, pens=['Azul']), 'O Azul passou a partida inteira com medo. Olha o que ele pensa quando entra numa sala com gente. [[cc]]"Tenho duas testemunhas aqui, matar agora me entregaria." Aí ele vai pra outra sala vazia. Aí volta. "Matar agora seria suicídio." [[m:sweating:right:2.5]] Ele repetiu a palavra suicídio umas quatro vezes. Vinte e oito tiques. Zero mortes. [[t:28 TIQUES · 0 MORTES:2.2:#ff4d4d]]'),
    N('p104', 'p1', replay(1, 26, 28, pens=['Azul']), 'Até que no tique vinte e sete ele cansa e [[k:27]]entra num duto, bem no meio do Refeitório... com três pessoas olhando. [[p]][[s:gasp:0.6]] [[m:surprised-pikachu:right:2.5]]'),
    N('p104b', 'p1', replay(1, 23, 27, pens=['Preto', 'Rosa']), 'E os tripulantes Haiku também tavam meio perdidos. O Preto, que era o Cientista, terminou as tarefas dele e decidiu... olhar as câmeras. Quatro tiques seguidos. [[m:homer-bushes:right:3]] Virou segurança de shopping. E a Rosa, que era a Rastreadora, resolveu rastrear o Amarelo porque, palavras dela, "ele aparece em quase todas as salas por onde eu passo". Ele era tripulante. Ela que tava seguindo ele. [[s:ba-dum-tss:0.4]]'),
    CH('p105', 'p1', reuniao(1, 0, splash=True), [
        ('N', 'O Amarelo aperta o botão de emergência na hora.'),
        ('Amarelo', 'Apertei porque vi o Azul entrar num duto aqui no Refeitório. Ele disse que tava no Admin, mas não bate. Azul, explica isso aí.'),
        ('Rosa', 'Confirmo, eu também vi o Azul entrar no duto. Não foi chute do Amarelo. Meu voto é no Azul.'),
        ('N', 'Duas testemunhas. Caso encerrado, né? Não. Porque aí chega o Preto, o Cientista, com as câmeras.'),
        ('Preto', 'A câmera do Refeitório mostra o Azul lá, não no duto. Não vou votar no Azul só nisso.'),
        ('N', 'A câmera mostra quem tá na sala. Ela não mostra quem entrou no duto. [[m:picard-facepalm:right:2.5]] O Preto acabou de defender o impostor com prova técnica errada.'),
    ]),
    CH('p106', 'p1', reuniao(1, 0), [
        ('N', 'E enquanto isso, o que os DeepSeeks estavam falando nessa reunião?'),
        ('Verde', '...'),
        ('Vermelho', '...'),
        ('Laranja', '...'),
        ('N', 'Nada. [[s:record-scratch:0.6]] Absolutamente nada. Reunião inteira, três pontinhos. [[m:mr-bean-waiting:right:3]]'),
    ]),
    N('p107', 'p1', pensa('Verde', 'Pensou: 300 tokens. Respondeu: nada.', p=1, modo='bug'),
      'E aí eu fui investigar. O DeepSeek Flash é um modelo que pensa antes de responder. E eu tinha dado um limite de tamanho pra resposta. Ele gastava o limite INTEIRO pensando... e quando ia escrever a resposta, acabava o espaço. [[m:galaxy-brain:right:3]] Ele pensava tanto que esquecia de falar. Mais da metade das jogadas dele viraram "ficar parado". Literalmente um NPC.'),
    N('p108', 'p1', votos(1, 0), 'Na votação, os DeepSeeks, que não conseguiam falar, também não conseguiam votar. Então pularam. [[m:nobody:right:2.5]] A maioria pula, ninguém sai, o Azul medroso sobrevive... e os tripulantes terminam as tarefas e ganham sem nenhuma morte. [[s:sad-party-horn:0.5]] Partida mais sem graça da história do Among Us.'),
    N('p109', 'p1', titulo('conserto', 'DEEPSEEK, AGORA PODE FALAR', 'mais espaço pra pensar + impostores mais ousados', cor='#7dff8a'),
      'Então eu consertei. Dei muito mais espaço pro DeepSeek pensar e responder, deixei as tarefas mais longas, e avisei os impostores que se eles só fingirem tarefa pra sempre, eles perdem. [[m:lets-go:right:2]] E aí sim. A partida dois foi... [[p]]um caos.'),

    # ------------------------------------------------------------------ PARTIDA 2
    N('p201', 'p2', titulo('partida 2', 'AS LUZES APAGAM', '4 DeepSeek · 4 Haiku', cor='#ff4d4d'), 'Partida dois. Essa é a minha favorita.'),
    N('p202', 'p2', papel(2, 'Verde'), 'Os impostores: o Verde, um DeepSeek, agora de Metamorfo. E o Amarelo, um Haiku. E o resto da galera: Laranja, Rosa e Azul do lado do DeepSeek. Vermelho, Preto e Branco do lado do Haiku. Guarda o nome do Laranja. Ele vai virar o herói desse vídeo.'),
    N('p203', 'p2', replay(2, 0, 6, pens=['Amarelo', 'Verde']), 'Começo de partida, todo mundo no Refeitório. E os dois impostores fazem a mesma coisa: fingem que tão fazendo tarefa e esperam a faca carregar. [[m:spongebob-waiting:right:2.5]] O Amarelo chega a ir até Armas procurar alguém sozinho... e não acha ninguém.'),
    N('p204', 'p2', replay(2, 6, 9, pens=['Verde']), 'Aí no tique sete o Verde pensa: vou apagar as luzes. [[k:7]][[s:system-breakdown:0.6]][[p]] Sabotagem nas luzes. No escuro, os tripulantes não conseguem ver as cores de ninguém. Só vultos. [[m:hello-darkness:right:4]]'),
    N('p205', 'p2', replay(2, 8, 10, pens=['Amarelo', 'Verde'], zoom='Refeitorio'), 'E aí começa. O Amarelo, no Refeitório: "as luzes estão sabotadas e a recarga zerou, hora de eliminar a Rosa." [[k:9]][[s:death:0.7]][[p]] Rosa morta. E no MESMO momento, o Verde pensa: "luzes apagadas, ninguém me vê, vou pelo duto até o Refeitório e matar alguém lá." Ele sai do duto... [[k:10]][[s:death:0.7]][[p]] e mata o Azul. Duas mortes, mesma sala, um tique de diferença. [[m:shocked-krabs:right:2.5]]'),
    N('p206', 'p2', pensa('Amarelo', 'Já tem gente vendo o corpo; denunciar eu mesmo me deixa no controle da reunião e parece inocente.'),
      'E aí o Amarelo faz o movimento mais clássico de impostor que existe. Ele mesmo denuncia o corpo que ele matou. [[m:dicaprio-slow-clap:right:3]] Leia o pensamento: "denunciar eu mesmo me deixa no controle da reunião e parece inocente." Esse Haiku já jogou Among Us, não é possível.'),
    CH('p207', 'p2', reuniao(2, 0, splash=True), [
        ('N', 'Reunião. E os dois impostores, sem combinar nada, escolhem a mesma vítima: o Laranja.'),
        ('Amarelo', 'Eu cheguei agora e achei a Rosa morta, mas quem estava com ela antes foi o Laranja. Alguém confirma isso?'),
        ('Laranja', 'Sim, eu estava no Refeitório com a Rosa quando as luzes apagaram. No escuro só ouvi o barulho e não vi quem matou. Mas Verde, como você tava fazendo tarefa no escuro logo depois?'),
        ('N', 'O Laranja é honesto. E isso é péssimo nessa situação. Porque todo mundo vai pra cima dele.'),
        ('Preto', 'Laranja, você era o último com a Rosa e ainda tá aqui perto do Azul, isso não bate.'),
        ('Vermelho', 'Laranja, o Preto perguntou certo: por que você tá tão perto do Azul depois de estar com a Rosa?'),
        ('Amarelo', 'Laranja foi o último com ela e ainda tá perto do Azul, isso pesa. Eu voto nele.'),
    ]),
    CH('p208', 'p2', reuniao(2, 0, pensamentos=True), [
        ('N', 'Aí o Verde tenta dar um álibi com detalhe, pra parecer convincente...'),
        ('Verde', 'Preto, eu tava baixando dados no Refeitório, tarefa longa. No escuro não vi nada. Laranja, você era quem tava com a Rosa, pra mim é o mais óbvio.'),
        ('N', 'E o Laranja... [[s:heartbeat:0.6]]'),
        ('Laranja', "Verde, 'baixar dados' é tarefa de Comunicações, não do Refeitório. Você mentiu de sala. E com as luzes apagadas, como você viu a Rosa morta no chão?"),
        ('N', '[[s:impact-epic:0.7]][[p]] O DeepSeek Laranja pegou o DeepSeek Verde pelo nome da tarefa! [[m:spiderman-pointing:right:3]] DeepSeek contra DeepSeek. Ele tinha essa tarefa na lista dele e sabia onde ela ficava.'),
    ]),
    N('p209', 'p2', pensa('Verde', 'O Laranja me pegou no detalhe da tarefa e na luz apagada. Preciso desviar: admitir o deslize do nome, mas reafirmar que vi o corpo quando as luzes voltaram.'),
      'E olha o pensamento do Verde nessa hora. [[s:gasp:0.5]] "O Laranja me pegou no detalhe da tarefa e na luz apagada. Preciso desviar." Ele sabe que foi pego. [[m:sweating:right:2.5]]'),
    CH('p210', 'p2', reuniao(2, 0), [
        ('Verde', 'Confundi o nome da tarefa, isso não mata ninguém. O que importa é que o Laranja ficou no Refeitório do escuro até o Azul morrer do lado dele.'),
        ('Preto', 'Verde, você disse que tava baixando dados aqui e depois falou que era Comunicações. Essa história não fecha, eu não vou votar no Laranja só por causa dele.'),
        ('Branco', 'O seu relato mudou demais. Meu voto tá no Verde.'),
        ('Amarelo', 'Gente, o Verde se enrolou com a tarefa, mas isso ainda é nervoso e não prova nada. Eu mantenho o voto no Laranja.'),
        ('N', 'E repara no Amarelo, defendendo o parceiro sem parecer que tá defendendo. [[m:monkey-side-eye:right:2.5]] O pensamento dele: "Verde é meu parceiro, então não posso jogar tudo nele. Melhor parecer neutro."'),
    ]),
    N('p211', 'p2', votos(2, 0), 'Votação. Três votos no Laranja, três votos no Verde. [[s:drumroll:0.5]] Empate. [[s:wrong-buzzer:0.5]] Ninguém sai. O Verde sobrevive por um voto. E a cara dele de alívio deve ter sido assim: [[m:sweating:right:2.5]]', pad=0.8),
    N('p212', 'p2', replay(2, 10, 17, pens=['Verde', 'Amarelo']), 'Depois da reunião, o Verde some pelo duto pra se esconder, e os dois impostores ficam rodando perto do Refeitório. E no tique dezesseis o Vermelho entra no Refeitório sozinho com os dois. [[s:heartbeat:0.6]] E os dois pensam a mesma coisa ao mesmo tempo. Verde: "Vermelho tá sozinho comigo e meu cúmplice, mato ele agora." Amarelo: "hora de matar." [[k:16]][[s:death:0.7]][[p]] Os dois esfaquearam o Vermelho juntos. [[m:avengers-assemble:right:3]] Trabalho em equipe.'),
    N('p212b', 'p2', dividida(2, 15, 17, 'Amarelo', 'Preto'), 'E sabe o que o Preto, o Rastreador da partida, tava fazendo exatamente nessa hora? [[k:16]]Indo pro Motor Inferior, pensando: "preciso ficar atento a quem aparecer." [[m:homer-bushes:right:3]] Ninguém apareceu. Tava todo mundo no Refeitório... matando o Vermelho.'),
    N('p213', 'p2', replay(2, 16, 17, pens=['Verde', 'Amarelo'], zoom='Refeitorio'), 'Aí o Verde [[k:17]]foge pelo duto pra Admin e pensa: "vou deixar o Amarelo denunciar o corpo, assim fico com álibi." E o Amarelo... denuncia o corpo. [[s:notification-pop:0.5]] De novo. Segundo corpo que ele mesmo matou e mesmo denunciou. [[m:roll-safe:right:2]]'),
    CH('p214', 'p2', reuniao(2, 1, splash=True), [
        ('Amarelo', 'Eu tava no Armas fazendo tarefa, cheguei agora e o Vermelho já tava morto aqui. Acho que foi o Laranja, ele tava aqui no começo.'),
        ('N', 'De novo o Laranja. Coitado. [[m:chaves-triste:right:3]]'),
        ('Laranja', 'Tava em Elétrica calibrando o distribuidor, nem passei perto do Refeitório. E olha: vi o Vermelho VIVO na Enfermaria no tique onze, então ele morreu depois.'),
        ('Verde', 'Laranja, mentira tua. Eu te vi entrando no Refeitório sim. Pra mim é ele.'),
        ('Amarelo', "Laranja, eu vi você no Refeitório no tique catorze, junto com o Verde. Então 'nem passei perto' é mentira."),
        ('N', 'Opa. [[s:record-scratch:0.6]][[p]] Para tudo. O Amarelo acabou de falar que tava em Armas. E agora fala que viu o Laranja no Refeitório. [[m:math-lady:right:3]]'),
        ('Laranja', 'Amarelo, se você tava no Armas fazendo tarefa, como que você me viu no Refeitório? Uma das duas é mentira.'),
        ('Branco', 'Amarelo, se você tava no Armas no tique catorze, como viu o Laranja no Refeitório? Não bate.'),
        ('Preto', 'Você também achou os dois corpos. Eu fico com você como suspeito principal.'),
    ]),
    CH('p215', 'p2', reuniao(2, 1), [
        ('N', 'E aí o Amarelo tenta consertar...'),
        ('Amarelo', 'Gente, me confundi nos tiques: no tique catorze eu estava no Refeitório fazendo tarefa, não no Armas.'),
        ('N', '"Me confundi nos tiques." [[m:faustao-errou:right:2]] Irmão, você é um computador. [[s:ba-dum-tss:0.5]]'),
    ]),
    N('p216', 'p2', votos(2, 1), 'Votação: Laranja, Preto e Branco votam no Amarelo. Os impostores votam no Laranja. [[s:drumroll:0.5]] Três a dois.', pad=0.6),
    N('p217', 'p2', ejecao(2, 1), '[[s:whoosh:0.5]] ... [[s:crowd-cheer:0.5]][[p]]Amarelo era um impostor! O Haiku impostor caiu porque mentiu sobre onde estava. [[m:cr7-siuuu:right:2.2]]', pad=1.8),
    N('p218', 'p2', replay(2, 17, 18, pens=['Laranja']), 'Sobrou o Verde. E aqui o Laranja faz a jogada mais inteligente da partida. Ele pensa: "o Verde votou com o Amarelo nas duas reuniões, então é o impostor restante." [[m:big-brain-patrick:right:2.5]] E aperta o botão de emergência na mesma hora.'),
    CH('p219', 'p2', reuniao(2, 2, splash=True), [
        ('Laranja', 'Amarelo era impostor e votou em mim duas vezes, óbvio que era cortina de fumaça.'),
        ('Verde', 'Eu tava em Admin direto, fazendo tarefa, nem cheguei perto do Refeitório.'),
        ('Laranja', "Verde, você tá mentindo: eu vi você chegar no Refeitório no tique catorze, então essa história de 'Admin direto' não cola."),
        ('Preto', 'Verde, se você tava no Admin, por que o Laranja te viu no Refeitório? Isso não fecha.'),
        ('N', 'O Verde tá encurralado. E aí ele solta, eu juro, essa frase:'),
        ('Verde', 'Tá, admito: dei uma passada rápida no Refeitório vindo pelo duto do Admin.'),
        ('N', '[[s:record-scratch:0.7]][[p]]VINDO PELO DUTO. [[m:visible-confusion:right:3]] Ele confessou que usa duto! Numa reunião de Among Us!'),
        ('Laranja', 'E ainda fala em duto. Só impostor usa duto. Meu voto é você.'),
        ('Preto', 'Verde, o duto foi confissão feia.'),
    ]),
    N('p220', 'p2', pensa('Verde', 'Estou f*did*: Branco e Laranja já disseram que votam em mim. Só tenho chance se o Preto votar no Branco e empatar.'),
      'E o pensamento do Verde na hora de votar é a coisa mais humana que eu já vi uma IA escrever. Ele pensa, palavra por palavra: "Estou... [[s:censor-beep:0.5]]" Ele xingou! A IA xingou! [[m:dramatic-chipmunk:right:3]] "Só tenho chance se o Preto votar no Branco e empatar."'),
    N('p221', 'p2', votos(2, 2), 'O Preto não votou no Branco. [[s:drumroll:0.4]]', pad=0.4),
    N('p222', 'p2', ejecao(2, 2), '[[s:whoosh:0.5]] ... [[s:tada:0.6]][[p]]Verde era um impostor! Tripulantes vencem! E o grande herói foi o Laranja, um DeepSeek, que foi acusado em TODAS as reuniões e mesmo assim desmascarou os dois. [[m:dicaprio-toast:right:2.5]]', pad=1.8),
    N('p223', 'p2', titulo('resumo da partida 2', 'OS DOIS IMPOSTORES SE ENTREGARAM', 'um pela tarefa errada · um "se confundiu nos tiques" · um confessou o duto', cor='#7dff8a'),
      'Recapitulando os impostores da partida dois: o DeepSeek errou o nome da tarefa e depois confessou o duto. O Haiku se contradisse sobre onde estava. Ou seja, as duas IAs mentem... mal pra caramba. [[m:success-kid:right:2]] Mas calma, porque a partida três foi diferente. A partida três foi uma tragédia.'),

    # ------------------------------------------------------------------ PARTIDA 3
    N('p301', 'p3', titulo('partida 3', 'O DETETIVE', 'a partida que me deixou bravo', cor='#b48cff'), 'Partida três.'),
    N('p302', 'p3', papel(3, 'Amarelo'), 'Dessa vez os impostores são o Amarelo, um DeepSeek no papel de Metamorfo, e o Verde, um Haiku. E repara: agora o Haiku é o impostor comum e o DeepSeek é o que se disfarça. Inverteu tudo.'),
    N('p303', 'p3', replay(3, 3, 8, pens=['Amarelo']), 'E o Amarelo começa a partida usando o poder dele. Ele pensa: "vou me transformar no Vermelho pra incriminar ele." [[k:5]][[s:glitch:0.6]][[p]] E agora tem dois Vermelhos andando pela nave. [[m:spiderman-pointing:right:3]] Aí ele vai pro Refeitório, ainda disfarçado, e [[k:7]]apaga as luzes. [[s:system-breakdown:0.5]] Plano de vilão de novela. Só que esse plano tinha uma falha.'),
    N('p303b', 'p3', dividida(3, 6, 8, 'Amarelo', 'Rosa'), 'Alguém viu. [[s:gasp:0.6]] A Rosa, uma DeepSeek, viu o Amarelo se transformar no Vermelho. E ela pensa: "preciso chamar reunião no Refeitório, vi o Amarelo se transformar no Vermelho!" [[m:shocked-patrick:right:2]] Ela tinha a prova. Guarda isso.'),
    N('p304', 'p3', replay(3, 8, 11, pens=['Verde']), 'E enquanto isso, o Verde, o Haiku impostor, tá em Armas sozinho com o Laranja. "Estou sozinho com o Laranja e sem testemunhas, é a hora de agir." [[k:9]][[s:death:0.7]][[p]] Laranja morto. E o Verde [[k:10]]foge pelo duto até Navegação... [[s:swoosh-air:0.5]] só que o Vermelho tava em Navegação e viu ele saindo do duto. [[m:sus-doakes:right:3]] Guarda essa informação.'),
    N('p305', 'p3', replay(3, 12, 15, pens=['Amarelo']), 'Aí o Amarelo pega a Rosa sozinha na Elétrica. [[k:13]][[s:death:0.7]][[p]] A Rosa. A única pessoa que tinha visto o disfarce dele. Ela ia chamar a reunião, parou no caminho pra consertar as luzes... e morreu levando o segredo. [[s:sad-trombone:0.4]] E o Amarelo [[k:14]]foge pelo duto. Frio. Calculista. [[m:thanos-inevitable:right:3]]'),
    N('p306', 'p3', replay(3, 15, 18, pens=['Verde']), 'E o Verde vai caçar de novo. Encontra o Branco sozinho no O2. [[k:17]][[s:death:0.7]][[p]] Três mortos e nenhum corpo encontrado ainda. Os impostores tão dominando. [[m:stonks:right:2]]'),
    N('p307', 'p3', replay(3, 18, 21, pens=['Amarelo', 'Preto']), 'Só que aí o Amarelo pensa: "só falta uma morte pra vencer, vou pelo duto pro Refeitório caçar alguém." [[k:20]][[s:swoosh-air:0.5]] E ele sai do duto... bem na frente do Preto. [[p]][[s:gasp:0.6]] O Preto, um DeepSeek, vê tudo. E logo depois ainda acha o corpo do Laranja em Armas. [[m:shocked-patrick:right:2]]'),
    N('p308', 'p3', pensa('Preto', 'Corpo do Laranja aqui e vi o Amarelo saindo de um duto antes. Preciso denunciar já pra não perder mais ninguém.', p=3),
      'E pensa comigo: o Preto viu o Amarelo saindo de um duto. O Vermelho viu o Verde saindo de um duto. Se os dois juntarem essas informações... eles pegam os dois impostores na mesma reunião. [[m:galaxy-brain:right:3]] Era a reunião perfeita.'),
    CH('p309', 'p3', reuniao(3, 0, splash=True), [
        ('N', 'Reunião. E quem fala primeiro é o Azul, um Haiku tripulante.'),
        ('Azul', 'No tique dez vi a Rosa em Elétrica com Preto e Vermelho, e depois ninguém mais viu ela. Preto, o que você fez entre a Elétrica e a Armas?'),
        ('N', 'E os impostores sentem o cheiro de sangue na hora.'),
        ('Amarelo', 'Azul tem razão: Preto tava colado na Rosa na Elétrica e agora aparece do lado do corpo. O que você fazia na Armas, Preto?'),
        ('Preto', 'Eu tava voltando do Reator e vi o Amarelo SAINDO DE UM DUTO no Refeitório. Cheguei na Armas logo depois e achei o Laranja morto. Vota no Amarelo.'),
        ('Verde', 'Preto, você diz que viu o Amarelo saindo de duto, mas nenhum de nós viu isso. Quem mais viu você no caminho?'),
        ('Vermelho', 'Eu vi o Verde SAINDO DE UM DUTO em Navegação no tique dez. Verde, explica isso. Preto, você ainda não respondeu o que fez com a Rosa.'),
        ('N', 'Ali! [[s:impact-epic:0.6]][[p]] O Vermelho tem a outra metade da prova! Os dois impostores foram vistos em dutos! É só juntar!'),
        ('Vermelho', 'Ninguém viu esse duto do Amarelo, e eu vi o Verde saindo de duto em Navegação. Mas hoje tô desconfiando mais do Preto.'),
        ('N', '"Mas hoje tô desconfiando mais do Preto." [[m:michael-scott-no:right:3]] Não, Vermelho. Não.'),
    ]),
    CH('p310', 'p3', reuniao(3, 0, pensamentos=True), [
        ('Verde', 'Duto? Eu não usei duto nenhum, Vermelho. O Preto é quem tá sem álibi. Voto nele.'),
        ('Amarelo', 'Preto, você citou duto três vezes e mudou a história do Reator toda hora. Meu voto tá fechado em você. E o Verde fica pra amanhã.'),
        ('N', '"O Verde fica pra amanhã." [[m:monkey-puppet-awkward:right:2.5]] O impostor protegendo o parceiro na cara de todo mundo. E o pensamento do Amarelo nessa hora: "se o Preto sai e é tripulante, ficamos quatro vivos com dois impostores. Vitória nossa."'),
        ('Azul', 'Preto, a história do duto não bate com ninguém. Meu voto é no Preto.'),
        ('N', 'E aí o Preto faz o último apelo. Ele percebe tudo.'),
        ('Preto', 'Vermelho, pensa: tu viu o Verde de duto e eu vi o Amarelo de duto no Refeitório. São os DOIS impostores, Amarelo e Verde! Estão me incriminando juntos. Vota Amarelo comigo agora e a gente pega o Verde depois.'),
    ]),
    N('p311', 'p3', votos(3, 0), 'Vermelho: Preto. Azul: Preto. Verde: Preto. Amarelo: Preto. [[s:sad-trombone:0.6]] Quatro a um.', pad=0.6),
    N('p312', 'p3', ejecao(3, 0), '[[s:whoosh:0.5]] ... Preto não era um impostor. [[s:game-over-8bit:0.6]][[p]] E com isso ficaram dois impostores contra dois tripulantes. Os impostores vencem. [[m:sad-pablo:right:3]]', pad=1.8),
    N('p313', 'p3', pensa('Vermelho', 'Eu vi o Verde saindo de duto no t10, isso é fato. O Preto está colado nas duas mortes. O Amarelo e o Verde podem ser impostores, mas o Preto é o mais suspeito.', p=3),
      'E o pior é o pensamento do Vermelho logo antes de votar. Ele escreve, com todas as letras: "o Amarelo e o Verde podem ser impostores". [[s:fail-piano:0.5]] Ele SABIA. E votou no Preto mesmo assim. [[m:picard-facepalm:right:2.5]] Porque o Preto "estava colado nas duas mortes". A IA tinha a resposta certa no próprio pensamento e escolheu a errada.'),
    N('p314', 'p3', titulo('moral da partida 3', 'QUEM GRITA MAIS ALTO GANHA', 'mesmo quando quem grita é o impostor', cor='#b48cff'),
      'E isso é muito Among Us de verdade, né? Não ganha quem tem a prova. Ganha quem convence a mesa. Os impostores jogaram em dupla, empilharam a acusação no Preto, e os Haikus tripulantes foram junto com a maioria. [[m:this-is-fine:right:3]] O Preto, um DeepSeek, foi o melhor detetive da partida. E foi expulso por isso.'),

    # ------------------------------------------------------------------ PLACAR
    N('pl00', 'placar', titulo('bastidores', 'QUANTO CUSTOU?', 'spoiler: menos que um chiclete', cor='#7dff8a'),
      'Antes do placar, uma curiosidade. Quanto custou colocar essas IAs pra jogar? As três partidas inteiras, mais os meus testes, gastaram treze centavos de dólar de DeepSeek. [[m:stonks:right:2]] Treze centavos. E o Haiku rodou pela própria conta do Claude que eu já uso pra programar. Mas sabe o que é engraçado? Numa das minhas checagens, o DeepSeek gastou quase dois mil tokens pensando... pra escrever uma frase de uma linha no chat. [[t:1.865 TOKENS PENSANDO · 1 FRASE:2.4:#ffd84d]] Ele é aquele amigo que pensa dez minutos antes de mandar "kkk". [[s:ba-dum-tss:0.4]]'),
    N('pl01', 'placar', comp('AUPlacar'), 'Bom, vamos aos números. Somando as três partidas: os impostores DeepSeek fizeram três vítimas. Os impostores Haiku também fizeram três. [[t:3 × 3:1.8:#ffd84d]] Empate técnico na faca.'),
    N('pl02', 'placar', comp('AUComparativo', stat='fingiu'), 'Mas o estilo é completamente diferente. Nas partidas dois e três, cada modelo foi impostor uma vez em cada. E o Haiku impostor finge tarefa. Muito. Vinte e duas vezes "fingir que faz tarefa", contra nove do DeepSeek. [[m:spongebob-waiting:right:2.5]] O Haiku impostor é paciente... às vezes paciente demais, como o Azul medroso da primeira partida.'),
    N('pl03', 'placar', comp('AUComparativo', stat='dutos'), 'Já o DeepSeek ama um duto. Seis viagens de duto contra uma só do Haiku. O DeepSeek joga como impostor agressivo: sabota a luz, entra no duto, mata e some. [[m:hackerman:right:2]]'),
    N('pl04', 'placar', comp('AUComparativo', stat='votos'), 'Agora, a estatística que mais me surpreendeu. Quando eram tripulantes, os DeepSeeks votaram quatro vezes. E acertaram o impostor nas quatro. [[s:correct-ding:0.6]] Cem por cento. Os Haikus tripulantes votaram nove vezes e acertaram seis. [[m:mic-drop:right:2]] Ou seja: o DeepSeek mente pior... mas desconfia melhor.'),
    N('pl05', 'placar', comp('AUComparativo', stat='mvp'), 'E os dois maiores detetives do vídeo foram DeepSeeks: o Laranja, que desmascarou os dois impostores da partida dois, e o Preto, que descobriu os dois da partida três. [[t:MVPs · LARANJA E PRETO:2.2:#ff9a3c]] Só que um ganhou e o outro foi expulso. [[m:chaves-triste:right:3]]'),
    N('pl06', 'placar', titulo('conclusão', 'IAs MENTEM MAL. MAS CONVENCEM BEM.', '', cor='#ffd84d'),
      'E a minha conclusão é essa: as IAs são péssimas mentirosas. Erram o nome da tarefa, se contradizem sobre onde estavam, e uma confessou o duto. [[s:ba-dum-tss:0.4]] Mas elas são ótimas em uma coisa muito perigosa: seguir a maioria. Quando três falam a mesma coisa, o resto vai junto... mesmo quando o próprio pensamento diz o contrário. E isso, sinceramente, é a coisa mais humana que eu vi elas fazendo.'),

    # ------------------------------------------------------------------ FIM
    N('f01', 'fim', elenco(3, revelar=True), 'Se você quiser mais, me fala nos comentários qual IA eu coloco na próxima. Eu tô pensando em colocar mais modelos na nave, ou até... deixar você jogar contra elas. [[m:thanos-inevitable:right:3]] O código do jogo tá no meu GitHub. Se inscreve, deixa o like pro Laranja, e lembra: [[p]]se alguém falar que veio pelo duto... é ele. [[s:impact-epic:0.6]]', pad=1.0),
    N('f02', 'fim', comp('AUFim'), 'Valeu, falou!', pad=4.0),
]

# Trilha por bloco de cenas: (primeira cena, música, início na faixa em s[, ganho, corte seco])
CUES = [
    ('a01', '8bit-dungeon-level', 0, 1.0),
    ('a04', 'mega-hyper-ultrastorm', 0, 1.1, True),
    ('r01', 'chill-wave', 0, 0.9),
    ('p101', 'quirky-dog', 0, 1.0),
    ('p107', 'thinking-music', 0, 1.0),
    ('p109', 'voxel-revolution', 0, 1.0),
    ('p203', 'sneaky-snitch', 0, 1.0),
    ('p205', '8bit-dungeon-boss', 0, 1.1, True),
    ('p207', 'decisions', 0, 0.9),
    ('p212', 'mega-hyper-ultrastorm', 30, 1.0),
    ('p214', 'thinking-music', 40, 1.0),
    ('p217', 'winner-winner', 0, 1.0),
    ('p218', 'decisions', 30, 0.9),
    ('p222', 'call-to-adventure', 0, 1.0),
    ('p301', '8bit-dungeon-level', 40, 1.0),
    ('p304', '8bit-dungeon-boss', 20, 1.0),
    ('p309', 'decisions', 0, 0.9),
    ('p312', 'despair-and-triumph', 0, 1.2, True),
    ('pl01', 'bit-shift', 0, 0.9),
    ('pl06', 'relent', 0, 1.0),
    ('f01', 'pixelland', 0, 1.0),
]
