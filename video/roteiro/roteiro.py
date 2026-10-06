# -*- coding: utf-8 -*-
"""Roteiro do vídeo "4 IAs jogando Mario" (narração em pt-BR).

Cada cena tem um visual base e o texto narrado. Marcações entre [[ ]] no texto
disparam eventos no instante em que a PRÓXIMA palavra começa a ser falada:

  [[c:clipe@início*velocidade|RÓTULO|subtítulo]]  troca o trecho de gameplay
        início: segundos (12.5), quadro (f512), stage:2-2+3, clear, clear2, done, end-4
  [[z:1.5]]                 zoom no trecho atual (foco no líder)
  [[m:meme:pos:dur:legenda]] GIF de meme (pos: right/left/center/full/top; dur em s)
  [[s:efeito:volume]]        efeito sonoro de public/sfx
  [[h:chave]]                destaca parte de um diagrama
  [[t:TEXTO:dur:cor]]        texto grande na tela

Números entre chaves, como {evo.firstClearGen}, vêm dos logs reais de treino
(video/data/runs_canon/*/summary.json) e são preenchidos por build_timeline.py.
"""

CHAPTERS = {
    'abertura': 'Abertura',
    'lab': 'O laboratório',
    'rl': 'O que é RL',
    'olhos': 'Os olhos da IA',
    'evo': 'IA #1 · Neuroevolução',
    'ddqn': 'IA #2 · Double DQN',
    'rainbow': 'IA #3 · Rainbow-IQN',
    'ada': 'IA #4 · Adaptativa',
    'placar': 'Placar final',
    'fim': 'Encerramento',
}

SCENES = [
    # ------------------------------------------------------------------ ABERTURA
    dict(
        id='s01', chapter='abertura', visual=dict(type='clip'),
        text="""[[c:evo_g1@0.5|GERAÇÃO 1|neuroevolução]] Essa é a geração um. [[s:boom]] Sessenta e quatro Marios,
        e nenhum deles faz a menor ideia do que está fazendo. [[c:evo_g1@4.5]] Esse aqui correu direto pro Goomba. [[m:surprised-pikachu:right:2.2]]
        Esse outro decidiu que o melhor plano era... ficar parado. [[m:mr-bean-waiting:left:2.6]]
        [[c:evo_g1@9]] E esse pulou no buraco. Com convicção. [[m:faustao-errou:right:1.8]]""",
    ),
    dict(
        id='s02', chapter='abertura', visual=dict(type='clip'),
        text="""[[c:ada_campaign@done-7|8–4|campanha completa]] Mas uma dessas inteligências artificiais fez isso aqui: [[s:drumroll]]
        zerou as trinta e duas fases. Do um-um até o Bowser no oito-quatro. Sem eu encostar no controle. [[m:dicaprio-toast:right:2.2]]""",
    ),
    dict(
        id='s03', chapter='abertura',
        visual=dict(type='title', kicker='MARIO RL LAB', title='4 IAs · 32 FASES · 1 BOWSER', subtitle='quem aprende a zerar o Mario?'),
        text="""Hoje eu coloquei quatro tipos diferentes de inteligência artificial pra jogar um Mario que eu recriei do zero, no navegador.
        Só uma zerou o jogo. E no final eu vou te contar por que a vitória dela é... meio que trapaça. [[m:monkey-side-eye:right:2.2]]""",
    ),
    # ------------------------------------------------------------------ LABORATÓRIO
    dict(
        id='s04', chapter='lab',
        visual=dict(type='ui', src='ui_evolution', keys=[dict(at=0, x=0, y=0, w=1925), dict(at=5, x=270, y=90, w=1400), dict(at=11, x=270, y=90, w=1400), dict(at=15, x=0, y=0, w=1925)]),
        text="""Primeiro, deixa eu te apresentar o laboratório. Isso aqui é o Mario RL Lab: um único arquivo HTML, que roda direto no navegador,
        até no celular. Sem emulador, sem ROM da Nintendo, sem nada baixado. [[m:cat-typing:right:2]]
        Eu recriei as trinta e duas fases, do um-um ao oito-quatro, com mapas próprios inspirados no jogo de mil novecentos e oitenta e cinco.""",
    ),
    dict(
        id='s05', chapter='lab', visual=dict(type='clip'),
        text="""[[c:ada_campaign@stage:1-1+3]] Tem fase de campo, [[c:ada_campaign@stage:1-2+4]] subsolo, [[c:ada_campaign@stage:1-3+5]] plataformas lá no alto,
        [[c:ada_campaign@stage:2-3+6]] ponte, [[c:ada_campaign@stage:1-4+9]] castelo com barra de fogo, [[c:ada_campaign@stage:2-2+5]] fase debaixo d'água com natação,
        [[c:ada_campaign@stage:3-1+4]] fase de noite, [[c:ada_campaign@stage:8-3+14]] Hammer Bros, e claro, [[c:ada_campaign@stage:8-4+40]] o Bowser lá no final.
        [[c:ada_campaign@stage:4-1+3]] A física roda a sessenta quadros por segundo, e cada agente tem a sua própria simulação, independente das outras.""",
    ),
    dict(
        id='s06', chapter='lab',
        visual=dict(type='ui', src='ui_speed', keys=[dict(at=0, x=270, y=560, w=1400), dict(at=8, x=270, y=560, w=1400), dict(at=13, x=270, y=760, w=1400)]),
        text="""E o melhor: dá pra acelerar o tempo. [[h:x1]] Uma vez, dez vezes, cem vezes, mil vezes... ou no máximo,
        que é basicamente o modo "treina aí enquanto eu vou pegar um café". [[m:skeleton-waiting:right:2.4]]""",
    ),
    # ------------------------------------------------------------------ O QUE É RL
    dict(
        id='s07', chapter='rl', visual=dict(type='component', name='RLLoop'),
        text="""Agora, o básico. O que é aprendizado por reforço? É o jeito que você ensina um cachorro a sentar.
        Ele faz alguma coisa, você dá um petisco se foi bom, e uma bronca se foi ruim. Repete isso mil vezes e pronto.
        Aqui é igual. [[h:agente]] O agente [[h:estado]] olha o estado do jogo, [[h:acao]] escolhe uma ação,
        [[h:recompensa]] o jogo responde com uma recompensa, [[h:ciclo]] e o ciclo recomeça.
        [[h:objetivo]] O objetivo é um só: juntar o máximo de recompensa possível.""",
    ),
    dict(
        id='s08', chapter='rl', visual=dict(type='component', name='RewardTable'),
        text="""E quem decide o que é bom ou ruim sou eu, nessa tabela de recompensas. [[h:landing]] Pousar numa plataforma nova vale mais um.
        [[h:platform]] Superar uma plataforma, mais dois. [[h:death]] Morrer, menos um. [[h:win]] Terminar a fase vale cem pontos.
        [[h:idle]] E ficar parado custa um pouquinho por segundo, pra ninguém ficar de bobeira.""",
    ),
    dict(
        id='s09', chapter='rl', visual=dict(type='component', name='RewardTable'),
        text="""Parece simples, mas esse é o ponto mais perigoso do projeto inteiro. [[s:record-scratch]]
        [[h:hack]] Se eu pagar demais por moeda, por exemplo, a IA para de tentar terminar a fase e vira uma caçadora profissional de moedas.
        [[m:distracted-boyfriend:center:2.8]] Isso tem nome: hackear a recompensa. A IA não faz o que você quer.
        Ela faz exatamente o que você paga pra ela fazer. [[h:progress]] Por isso, aqui no jogo, o avanço só é pago depois que o Mario pousa em segurança,
        e cada plataforma só paga uma vez por tentativa.""",
    ),
    # ------------------------------------------------------------------ OLHOS DA IA
    dict(
        id='s10', chapter='olhos', visual=dict(type='component', name='SensorPanel', props=dict(
            title='44 SENSORES',
            items=[dict(key='vel', text='🏃 velocidade e se está no chão'), dict(key='ini', text='👾 inimigo mais próximo'),
                   dict(key='bur', text='🕳️ próximo buraco'), dict(key='pla', text='🧱 próxima plataforma'),
                   dict(key='moe', text='🪙 moeda mais perto'), dict(key='gra', text='🟩 16 pontos de terreno'),
                   dict(key='ame', text='🔥 ameaça em movimento'), dict(key='pou', text='🎯 alvo de pouso')])),
        text="""[[c:ddqn_sensors@1|VISÃO DA IA|líder + sensores]] Outra pergunta importante: o que a IA enxerga? Ela não vê a tela como a gente.
        Ela recebe números. Quarenta e quatro sensores: [[h:vel]] a própria velocidade, se está no chão, [[h:ini]] a distância até o inimigo mais próximo,
        [[h:bur]] até o próximo buraco, [[h:pla]] até a próxima plataforma, [[h:moe]] a moeda mais perto, [[h:gra]] e uma gradezinha de dezesseis pontos
        ao redor do Mario dizendo onde tem chão. [[h:ame]] Tem até sensor de ameaça em movimento [[h:pou]] e de onde dá pra pousar.
        Esses quadradinhos verdes são, literalmente, os olhos dela.""",
    ),
    dict(
        id='s11', chapter='olhos', visual=dict(type='component', name='NeuralNet', props=dict(inputs=44, hidden=32)),
        text="""[[h:sensores]] Esses números entram numa rede neural, [[h:neuronios]] passam por uma camada de neurônios, [[h:acoes]] e saem como uma decisão:
        esquerda, parado ou direita, com ou sem pulo. [[h:pesos]] Cada linha dessas é um peso, um número que a IA pode ajustar.
        A pergunta de um milhão de reais é: como ajustar esses pesos pra rede jogar bem? [[m:galaxy-brain:right:2.4]]
        E é aqui que entram os quatro competidores de hoje.""",
    ),
    # ------------------------------------------------------------------ IA 1: NEUROEVOLUÇÃO
    dict(
        id='s12', chapter='evo', visual=dict(type='title', kicker='IA #1', title='NEUROEVOLUÇÃO', subtitle='mutação + seleção natural', color='#a8d9d5'),
        text="""[[s:whoosh]] Competidor número um: neuroevolução.""",
    ),
    dict(
        id='s13', chapter='evo', visual=dict(type='component', name='Evolution'),
        text="""Essa é a ideia mais antiga e mais preguiçosa de todas, e eu digo isso com carinho.
        Você cria sessenta e quatro cérebros completamente aleatórios e solta todo mundo na fase. Quem vai mais longe, ganha mais pontos.
        [[h:rank]] No fim da geração, os dez por cento melhores sobrevivem intactos. [[h:mutacao]] A maior parte da população vira cópia dos melhores,
        com pequenas mutações nos pesos. [[h:novatos]] E dez por cento são novatos aleatórios, só pra manter a diversidade.
        Seleção natural, versão Mario. É a mesma família de ideia do MarI/O, do SethBling, um dos vídeos mais famosos de IA jogando Mario.
        A diferença é que lá a estrutura da rede também evoluía. Aqui, só os pesos mudam.""",
    ),
    dict(
        id='s14', chapter='evo', visual=dict(type='clip'),
        text="""[[c:evo_g1@6|GERAÇÃO 1]] Na primeira geração, foi aquele show de horrores que você viu no começo. [[m:this-is-fine:right:2.6]]
        [[c:evo_g10@3|GERAÇÃO 10]] Na geração dez, alguns já aprenderam a pular os canos. [[c:evo_g10@11]] Ainda morrem de jeitos bem criativos,
        mas a gente comemora as pequenas vitórias.""",
    ),
    dict(
        id='s15', chapter='evo', visual=dict(type='clip'),
        text="""[[c:evo_first_clear@f430*2|GERAÇÃO {evo.firstClearGenPlus}|o campeão repete a corrida]] E aí, na geração {evo.firstClearGen}, aconteceu. [[s:drumroll:0.5]]
        Um indivíduo atravessou o um-um inteiro e tocou a bandeira. [[s:tada]] [[m:luva-receba:right:2.6]]
        E como o melhor sobrevive intacto pra próxima geração, ele repete exatamente a mesma corrida, todas as vezes.""",
    ),
    dict(
        id='s16', chapter='evo', visual=dict(type='clip'),
        text="""[[c:evo_stuck@f380*2|GERAÇÃO {evo.lateGen}]] Com o tempo, ela aprendeu também o um-dois, [[c:evo_stuck@f820*1|1–3|plataformas]] e aí chegou no um-três,
        a fase das plataformas lá no alto. E travou. [[m:visible-confusion:right:2.4]]
        Geração após geração, os melhores Marios morrem logo no começo do um-três.""",
    ),
    dict(
        id='s17', chapter='evo', visual=dict(type='component', name='LearningCurve', props=dict(series='@evo.history', color='#a8d9d5', title='NEUROEVOLUÇÃO · MELHOR RECOMPENSA', marks='@evo.marks')),
        text="""Olha a curva. No orçamento total, foram {evo.stepsWords} de passos de física, {evo.generation} gerações,
        e o melhor resultado foi passar de duas fases e cair no começo da terceira.
        O problema é que mutação aleatória é tipo consertar relógio na martelada: às vezes funciona,
        mas quanto mais complicado o relógio, mais difícil acertar. [[m:gordon-ramsay-raw:right:2]]""",
    ),
    # ------------------------------------------------------------------ IA 2: DOUBLE DQN
    dict(
        id='s18', chapter='ddqn', visual=dict(type='title', kicker='IA #2', title='DOUBLE DQN', subtitle='aprendizado por reforço de verdade', color='#ffb26b'),
        text="""[[s:whoosh]] Competidor número dois: Double DQN. Agora sim, aprendizado por reforço de verdade.""",
    ),
    dict(
        id='s19', chapter='ddqn', visual=dict(type='component', name='QValues'),
        text="""Em vez de evoluir cérebros às cegas, aqui uma única rede aprende a responder uma pergunta:
        se eu estiver nessa situação e apertar esse botão, quantos pontos eu vou ganhar daqui pra frente? Esse número se chama valor Q.
        São seis ações: esquerda, parado, direita, cada uma com ou sem pulo. E a IA escolhe a de maior valor.
        [[h:explorar]] Só que tem um dilema clássico aqui. [[m:sweating:right:2.4]] Se ela sempre fizer o que já sabe que funciona, nunca descobre nada novo.
        Se só fizer coisa aleatória, nunca aproveita o que aprendeu. É o famoso explorar versus aproveitar.
        A solução: no começo, quase tudo é aleatório. Com o tempo, a aleatoriedade vai diminuindo.""",
    ),
    dict(
        id='s20', chapter='ddqn', visual=dict(type='component', name='ReplayBuffer'),
        text="""Cada coisa que acontece vira uma memória: o que eu vi, o que eu fiz, quanto eu ganhei e o que veio depois.
        Ela guarda até dez mil memórias e vai estudando lotes aleatórios delas, tipo revisar a matéria antes da prova.
        [[h:double]] E o "Double" do nome? São duas redes. Uma escolhe a melhor ação, e a outra confere quanto ela realmente vale.
        Isso impede que a IA fique superconfiante e se ache melhor do que é. [[m:roll-safe:right:2]] Literalmente um mecanismo anti-ego.""",
    ),
    dict(
        id='s21', chapter='ddqn', visual=dict(type='clip'),
        text="""[[c:ddqn_g1@2|GERAÇÃO 1|double DQN]] No começo, como quase tudo é aleatório, parece um bando de Marios bêbados.
        [[c:ddqn_late@1*2|GERAÇÃO {ddqn.lateGen}|double DQN]] Com o mesmo orçamento de {budgetWords} de passos, o Double DQN {ddqn.resultSentence}
        [[m:{ddqn.meme}:right:2.2]] {ddqn.jokeSentence}""",
    ),
    # ------------------------------------------------------------------ IA 3: RAINBOW-IQN
    dict(
        id='s22', chapter='rainbow', visual=dict(type='title', kicker='IA #3', title='RAINBOW-IQN', subtitle='o chefão do RL clássico', color='#b9a6ff'),
        text="""[[s:boom]] Competidor número três: o chefão do aprendizado por reforço clássico. Rainbow IQN.""",
    ),
    dict(
        id='s23', chapter='rainbow', visual=dict(type='component', name='RainbowCards'),
        text="""Em dois mil e dezessete, pesquisadores da DeepMind pegaram seis melhorias diferentes do DQN e juntaram tudo num algoritmo só, chamado Rainbow.
        [[m:avengers-assemble:center:2.6]] Basicamente, os Vingadores do aprendizado por reforço.
        [[h:double]] Primeiro, o Double Q, que você já conhece. [[h:dueling]] Depois, a arquitetura dueling, que separa duas perguntas:
        o quanto essa situação é boa, e o quanto cada ação é melhor que as outras. [[h:per]] A memória priorizada, que revisa mais vezes
        as memórias que mais surpreenderam, tipo estudar mais as questões que você errou. [[h:nstep]] O retorno de cinco passos,
        que olha cinco decisões pra frente antes de aprender. [[h:noisy]] As redes ruidosas, que colocam um ruído treinável nos pesos,
        então a própria rede aprende o quanto deve explorar. [[h:iqn]] E por último, a parte distribucional: em vez de prever só a média de pontos,
        ela prevê a distribuição inteira, do cenário pessimista ao otimista. [[m:nazare-confusa:right:3]]
        Aqui eu usei a versão IQN, com regressão de quantis. [[h:rainbow]] Junta tudo, e temos o arco-íris.""",
    ),
    dict(
        id='s24', chapter='rainbow', visual=dict(type='clip'),
        text="""[[c:rainbow_sensors@1|VISÃO RAINBOW|400 sensores]] E ela ganhou olhos melhores: quatrocentos sensores.
        Os cento e doze sensores locais, mais uma grade de doze por seis cobrindo mil duzentos e cinquenta pixels da fase,
        com quatro canais: terreno, inimigos, perigos e itens. E os inimigos aparecem também onde vão estar daqui a oito e vinte e quatro quadros.
        É a IA com visão do futuro. [[m:big-brain-patrick:right:2]]""",
    ),
    dict(
        id='s25', chapter='rainbow', visual=dict(type='clip'),
        text="""[[c:rainbow_g1@2|GERAÇÃO 1|rainbow-IQN]] E o resultado? [[c:rainbow_late@1*2|GERAÇÃO {rainbow.lateGen}|rainbow-IQN]] {rainbow.resultSentence}
        [[m:{rainbow.meme}:right:2.4]] Isso é uma coisa que os vídeos de IA nem sempre contam: algoritmo poderoso não é mágica.
        O Rainbow original foi avaliado com duzentos milhões de quadros de Atari. A minha versão roda num worker do navegador,
        com uma rede pequenininha e {budgetWords} de passos. É o Rainbow no modo econômico.""",
    ),
    # ------------------------------------------------------------------ IA 4: ADAPTATIVA
    dict(
        id='s26', chapter='ada', visual=dict(type='title', kicker='IA #4', title='ADAPTATIVA', subtitle='planejar + imitar', color='#b9ed88'),
        text="""[[s:whoosh]] E finalmente, competidor número quatro: a IA adaptativa. A que zerou o jogo.""",
    ),
    dict(
        id='s27', chapter='ada', visual=dict(type='component', name='BeamSearch'),
        text="""Ela funciona de um jeito completamente diferente. Antes de se mexer, ela usa a própria física do jogo pra simular o futuro.
        Testa as seis ações em blocos de seis quadros, uns dois segundos pra frente, [[h:poda]] guarda os quarenta e oito futuros mais promissores,
        descarta o resto, [[h:melhor]] e segue o melhor caminho. [[m:thanos-inevitable:right:2.6]]
        É o Doutor Estranho olhando milhares de futuros pra achar aquele em que a gente vence.""",
    ),
    dict(
        id='s28', chapter='ada', visual=dict(type='clip'),
        text="""[[c:ada_campaign@stage:1-1+2|TENTATIVA 1|adaptativa]] E deu muito certo. Logo na primeira tentativa, sem nenhum treino antes,
        ela atravessou o um-um, [[c:ada_campaign@stage:1-2+6*3]] o subsolo, [[c:ada_campaign@stage:2-2+8*3]] a água,
        [[c:ada_campaign@stage:2-4+10*2]] os castelos com barras de fogo, [[c:ada_campaign@stage:5-3+4*3]] as plataformas,
        [[c:ada_campaign@stage:7-4+12*2]] os labirintos do mundo sete, [[c:ada_campaign@stage:8-2+20*3]] os Hammer Bros...
        tudo em mais ou menos {ada.wallWords} segundos de processamento. [[s:level-up]] [[m:lets-go:right:2]]""",
    ),
    dict(
        id='s29', chapter='ada', visual=dict(type='clip'),
        text="""[[c:ada_campaign@done-16|8–4|bowser]] E no oito-quatro, o Bowser. [[s:drumroll:0.6]] Bola de fogo... pulo... [[c:ada_campaign@done-4]] machado.
        [[s:tada]] Campanha completa! [[m:e-tetra:center:3]]""",
    ),
    dict(
        id='s30', chapter='ada', visual=dict(type='component', name='PlannerVsNet'),
        text="""Agora, a parte honesta. [[m:monkey-side-eye:right:2.2]] O planejador conhece o estado interno do jogo:
        a física exata e onde cada inimigo vai estar. Isso não é aprendizado por reforço puro. É busca com um simulador perfeito.
        [[h:gabarito]] É tipo fazer a prova com o gabarito do lado. [[h:aluno]] A parte que aprende de verdade é uma rede neural pequena,
        que fica imitando as decisões do planejador. [[h:quarto]] Um quarto da população pratica usando essa rede, e o resto continua planejando
        e gerando exemplos. Isso se chama aprendizado por imitação, inspirado num algoritmo chamado DAgger.""",
    ),
    dict(
        id='s31', chapter='ada', visual=dict(type='clip'),
        text="""[[c:human_play@0|EU JOGO|aprender comigo]] E tem um detalhe que eu acho genial: o modo "Aprender comigo". Eu jogo,
        e os meus movimentos viram exemplos com peso três vezes maior pra rede. Mas só os movimentos que sobrevivem um segundo e meio.
        As ações logo antes de uma morte são descartadas. Ou seja: ela aprende com os meus acertos e ignora as minhas burradas.
        [[c:human_play@end-5]] E olha... eu dei bastante burrada pra ela ignorar. [[s:death]] [[m:mission-failed:right:2.2]]""",
    ),
    # ------------------------------------------------------------------ PLACAR
    dict(
        id='s32', chapter='placar', visual=dict(type='component', name='Scoreboard', props=dict(rows='@scoreboard', title='PLACAR FINAL', subtitle='fases concluídas pelo melhor Mario, numa tentativa só, a partir do 1-1')),
        text="""Então, o placar final, todo mundo com o mesmo orçamento de {budgetWords} de passos de física, que dá umas cinco horas e meia de jogo
        pra cada um dos sessenta e quatro Marios. [[h:evolution]] A neuroevolução passou do um-um e do um-dois, e travou no um-três.
        [[h:ddqn]] O Double DQN {ddqn.scoreSentence} [[h:rainbow]] O Rainbow {rainbow.scoreSentence}
        [[h:adaptive]] E a adaptativa zerou tudo: trinta e duas fases, na primeira tentativa, usando só {ada.budgetPct} por cento do orçamento. [[m:stonks:right:2]]""",
    ),
    dict(
        id='s33', chapter='placar', visual=dict(type='component', name='Lessons', props=dict(items=[
            dict(key='l1', icon='🎯', title='A recompensa é tudo', text='A IA otimiza exatamente o que você mede. Nem mais, nem menos.'),
            dict(key='l2', icon='🗺️', title='Conhecer as regras é um superpoder', text='Planejar com um simulador perfeito venceu fácil. É a ideia por trás do AlphaZero.'),
            dict(key='l3', icon='💸', title='RL puro é lindo, mas caro', text='Aprender do zero, sem gabarito, exige MUITA experiência.')])),
        text="""E o que eu aprendi com tudo isso? [[h:l1]] Primeiro: a recompensa é tudo. A IA otimiza exatamente o que você mede, nem mais, nem menos.
        [[h:l2]] Segundo: conhecer as regras do mundo é um superpoder. É por isso que o AlphaZero, que planeja usando as regras do xadrez,
        é tão absurdamente forte. [[h:l3]] E terceiro: o aprendizado por reforço puro aprende do zero, sem gabarito, e isso é lindo.
        Mas custa caro. Muito caro. [[m:sad-pablo:right:2.4]]""",
    ),
    dict(
        id='s34', chapter='placar', visual=dict(type='clip'),
        text="""[[c:evo_g1@1|APRENDER. MORRER.|TENTAR DE NOVO.]] No fim, o lema do laboratório resume tudo: aprender, morrer, tentar de novo. [[s:death]]
        Que, sinceramente, também é como eu programo. [[m:this-is-fine:center:2.6]]""",
    ),
    # ------------------------------------------------------------------ FIM
    dict(
        id='s35', chapter='fim', visual=dict(type='component', name='EndScreen', props=dict(credits='@credits')),
        text="""[[h:like]] Se você curtiu, deixa o like, [[h:inscreva]] se inscreve, e comenta qual fase você quer ver a IA sofrendo no próximo vídeo.
        Ah, e sim: essa voz que você ouviu o vídeo inteiro também é uma inteligência artificial. [[m:shocked-patrick:right:2]]
        Valeu, e até a próxima!""",
        pad=3.0,
    ),
]
