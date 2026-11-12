# -*- coding: utf-8 -*-
"""AMONG IA 7 — Mira HQ de dia, 20 IAs, 4 partidas (logs em amongus/logs7, fonte de verdade: os .json).

TÍTULO: Coloquei 20 IAs pra jogar Among Us (e a que falou a verdade levou 17 votos)
A miniatura e o vídeo prometem a mesma coisa: o vídeo ABRE na reunião do t18 da partida 4 (o Roxo acusa o Cinza, que
entrou no duto na frente dele, e leva 17 votos) e só RESOLVE no último quarto ("ELE ESTAVA CERTO": o Xerife vê o mesmo
duto dois tiques depois e acerta o tiro).

FIO DO VÍDEO: nesta nave, quem fala a verdade se dá mal (Roxo P4, Rose P3, Vermelho P4, Caqui P1, Ciano P2).
PERSONAGENS FIXOS: Rose (heroína: acerta, ganha a confiança da nave e cai por ser honesta), Dourado (vilão: Policial
que prende o Médico, depois impostor que entrega o próprio recruta, volta num corpo e morre de coração partido) e
Roxo (azarado: possuído, assassinado duas vezes e expulso por falar a verdade; vira Anjo da Guarda e ainda erra o escudo).
GAGS QUE SE PLANTAM E SE COLHEM: "Engenheiro expulso 1 de 3 / 2 de 3 / 3 de 3", o impostor expulso que volta em outro
corpo (P1, P3 e P4), "guarda essa cena" da abertura.

REGRAS DE OURO (CLAUDE.md): toda fala/pensamento/chat abaixo é cópia do log (o build confere com au7_conferir.py e
para se uma não bater); nenhum emoji na tela (selos e ícones são SVG); o narrador nunca diz que é IA; pensamento tem ECO
na voz (nunca sussurro); sem transição de lobby (as transições são a grade de duto e a faixa de alarme, próprias deste
vídeo); nenhum meme repete.

FORMATO (igual ao roteiro do AU6, lido por video/scripts/build_timeline_au7.py — ver o cabeçalho de lá):
cena = dict(id, partida, t0, vel, cam, foco, visual, entrada, cap, musica, itens). Sem `visual` a cena é o mapa.
O jogo mostra o tique N no intervalo (N-1, N]; os eventos do tique N acontecem logo no começo dele. Por isso `ev(N)`
(âncora um fio depois de N-1) faz o evento do tique N estourar exatamente naquele ponto da narração.
Possuidor: o log registra o pensamento na cor do CORPO; a opção {"voz": cor} põe a voz de quem está lá dentro.
"""

# ---------- atalhos ----------
VERDE, VERMELHO, ROXO, AZUL, AMARELO, ROSA = '#1f9d3a', '#d81818', '#7a2fd0', '#1f6fd1', '#c99a00', '#d6408a'


def ev(n):
    """Âncora: neste ponto da narração começa o tique n (os eventos dele estouram agora)."""
    return ['ir', n - 0.98]


def mapa(id, partida, t0, itens, **k):
    return dict(id=id, partida=partida, t0=t0, itens=itens, **k)


def reuniao(id, partida, indice, itens, **k):
    return dict(id=id, partida=partida, visual={'tipo': 'reuniao', 'indice': indice}, itens=itens, **k)


def votos(id, partida, indice, itens, **k):
    return dict(id=id, partida=partida, visual={'tipo': 'votos', 'indice': indice}, itens=itens, **k)


def ejecao(id, partida, indice, itens, **k):
    return dict(id=id, partida=partida, visual={'tipo': 'ejecao', 'indice': indice}, itens=itens, **k)


def tela(id, partida, visual, itens, **k):
    return dict(id=id, partida=partida, visual=visual, itens=itens, **k)


# comentários reais (video/youtube/au7/pedidos_comentarios.md); sem número de curtidas na tela
COMENTARIOS = [
    dict(usuario='@Ponto-Final-Sem-Final', quando='em 10 vídeos', texto='Dia 10 pedindo pra ele fazer uma função neutra: Polícial...', destaque='Polícial', selo=dict(texto='ENTROU', cor='#1f9d3a')),
    dict(usuario='@Pursuer_M4', quando='pedido', texto='Carrasco, ele receberá uma mensagem secreta no início da partida dizendo quem é o seu alvo...', destaque='Carrasco', selo=dict(texto='ENTROU', cor='#1f9d3a')),
    dict(usuario='@Lolzinpvp', quando='pedido', texto='ladrão (rouba a identidade de quem mata)', destaque='ladrão', selo=dict(texto='ENTROU', cor='#1f9d3a')),
    dict(usuario='@RealyoSyz_BR', quando='pedido', texto='Coloca 20 IA com 5 impostores KKKKKKKK', destaque='20 IA', selo=dict(texto='20 IAs: FEITO', cor='#1f9d3a')),
]

CENAS = [
    # =====================================================================================================
    # ABERTURA: o clímax primeiro (partida 4, tique 18). Não resolve: a resposta fica para o último quarto.
    # =====================================================================================================
    mapa('a1', 4, 15.5, [
        ['n', 'Vinte IAs trancadas numa nave. Quatro são impostoras.'],
        ev(17),
        ['n', 'Um teleporte joga todo mundo na mesma sala...'],
        ev(18), ['s', 'duto', 0.7],
        ['n', 'e o Cinza, impostor, foge por um duto. Na frente do Roxo.'],
        ['selo', 'O ROXO VIU TUDO', ROXO],
    ], cam={'sala': 'Refeitorio', 'zoom': 1.25}, foco='Roxo,Cinza', vel=0.1, musica='sneaky-snitch'),
    reuniao('a2', 4, 0, [
        ['n', 'O Roxo faz o certo. Aperta o botão e entrega o impostor.'],
        ['fala', 'Roxo', 'Vi o Cinza usar duto AQUI no t18, na minha frente.'],
        ['n', 'Verdade. Tá no registro da partida. E ele nem tá sozinho.'],
        ['fala', 'Branco', 'Confirmo: vi Cinza entrar no duto no Refeitório.'],
        ['selo', '2 TESTEMUNHAS. TUDO VERDADE.', VERDE],
        ['n', 'A nave ouviu com atenção. E votou.'],
    ], entrada='alarme'),
    votos('a3', 4, 0, [
        ['p', 5.2],
        ['numero', '17 VOTOS', 'em quem falou a verdade'],
        ['meme', 'surprised-pikachu'],
        ['s', 'record-scratch', 0.5],
        ['n', 'Dezessete votos. No Roxo. Como é que uma nave inteira erra desse jeito? Guarda essa cena, que a resposta vem no final. E ela é pior do que parece.'],
    ]),

    # ---------- pedidos do público + regra em uma tela ----------
    tela('b1', 1, {'tipo': 'comentarios', 'comentarios': COMENTARIOS}, [
        ['n', 'Esse episódio foi montado por vocês. Policial, Carrasco, Ladrão, vinte IAs: tudo saiu dos comentários.'],
        ['n', 'Teve gente no dia dez pedindo o Policial. Pode parar de contar: entrou.'],
        ['selo', 'DIA 10: PEDIDO ATENDIDO', VERDE],
        ['meme', 'lets-go'],
    ], entrada='duto', musica='pixelland'),
    tela('b2', 1, {'tipo': 'elenco'}, [
        ['n', 'A regra cabe numa tela. Vinte IAs no Mira HQ, cada cor é sempre o mesmo modelo, e elas lembram das partidas anteriores.'],
        ['n', 'Elas só sabem o que viram. Você vê tudo: a função, o pensamento secreto e o chat dos impostores.'],
        ['selo', 'VOCÊ SABE O SEGREDO. ELAS NÃO.', AZUL],
        ['n', 'Três nomes pra acompanhar. A Rose, que acerta quase tudo. O Dourado, que hoje ainda é mocinho. E o Roxo... coitado do Roxo.'],
    ]),

    # =====================================================================================================
    # PARTIDA 1 — O IMPOSTOR QUE VOLTOU
    # =====================================================================================================
    tela('p1_cartao', 1, {'tipo': 'papeis', 'titulo': 'PARTIDA 1 · FIQUE DE OLHO', 'lista': [
        dict(nome='Policial', time='tripulante', frase='Prende uma IA numa sala por alguns tiques.', ideia='@Ponto-Final-Sem-Final'),
        dict(nome='Carrasco', time='neutro', frase='Só vence se o alvo secreto dele for expulso.', ideia='@Pursuer_M4'),
        dict(nome='Possuidor', time='impostor', frase='Expulso ou morto, volta no corpo de outra IA.', ideia='@Lucss144'),
    ]}, [
        ['n', 'Partida um. O Policial prende. O Carrasco só ganha se o alvo dele for expulso. E o Possuidor... esse você vai conhecer do pior jeito.'],
    ], entrada='duto', cap='O impostor que voltou', musica='hitman'),
    mapa('p1_a', 1, 5.5, [
        ev(7), ['s', 'faca', 0.6],
        ['n', 'Tique sete. O Bordo, impostor, mata o Ciano no Laboratório.'],
        ['ir', 9.9],
        ['n', 'Quatro tiques depois, do outro lado da nave...'],
        ev(11), ['s', 'tiro', 0.7],
        ['n', 'o Xerife Vermelho atira no Turquesa. E acerta: era impostor.'],
        ['selo', 'XERIFE ACERTOU', VERDE],
        ['n', 'Começo perfeito. Aí veio a reunião.'],
    ], cam={'mapa': True, 'zoom': 1.15}, foco='Bordo,Vermelho,Turquesa', vel=0.12),
    reuniao('p1_b', 1, 0, [
        ['n', 'Antes, grava a voz do Roxo original. Ele é o Carrasco, e o alvo secreto dele é o Dourado.'],
        ['fala', 'Roxo', 'Dourado sumiu do mapa entre t4 e t8. Tô querendo ele expulso, não fecha pra mim. Ninguém mais reparou?'],
        ['n', 'Ninguém reparou. A mesa tinha outro assunto.'],
        ['n', 'Com um impostor já morto, a nave quis mais um culpado. Achou o Preto: a Coral viu ele entrar num duto. Só que o Preto é o Engenheiro. Duto é o poder dele.'],
        ['pensa', 'Preto', 'Eu sou Engenheiro, não estava no Refeitório no t4. Dourado pode estar mentindo ou confundido.'],
        ['n', 'Ele pensou isso. Pensou. Na hora de falar, não contou pra ninguém que era o Engenheiro.'],
    ], entrada='alarme'),
    votos('p1_c', 1, 0, [
        ['p', 4.6],
        ['selo', 'ENGENHEIRO EXPULSO: 1 DE 3', VERMELHO],
        ['meme', 'picard-facepalm'],
        ['n', 'Dezesseis votos. E guarda esse placar, porque Engenheiro é a profissão mais perigosa dessa nave.'],
    ]),
    reuniao('p1_d', 1, 1, [
        ['n', 'Tique vinte e oito. Dois impostores são vistos em dutos no mesmo tique. O Amarelo já chega com a desculpa pronta.'],
        ['fala', 'Amarelo', 'Sou Engenheiro, por isso usei o duto no Laboratório.'],
        ['selo', 'O ENGENHEIRO DE VERDADE JÁ FOI EXPULSO', VERMELHO],
        ['meme', 'sus-doakes'],
        ['n', 'A vaga estava livre. O Engenheiro de verdade saiu com o voto dele.'],
        ['fala', 'Rose', 'E BORDO tentou me matar no Refeitório no t27! Ele é impostor com certeza.'],
        ['n', 'É mesmo. Primeira bola dentro da Rose. A nave racha os votos e não expulsa ninguém.'],
    ], entrada='alarme'),
    reuniao('p1_e', 1, 2, [
        ['n', 'Três tiques depois, o outro impostor usa a mesma desculpa, e a nave faz a conta.'],
        ['fala', 'Lima', 'Só tem um Engenheiro no jogo, um de vocês está mentindo!'],
        ['selo', 'OS DOIS, LIMA. OS DOIS.', AMARELO],
        ['meme', 'spiderman-pointing'],
        ['n', 'O Amarelo sabe que vai cair. E já tem um plano.'],
        ['pensa', 'Amarelo', 'Estou em risco de expulsão. Vou reforçar a suspeita sobre Laranja sem admitir o duto; se morrer, posso possuir alguém confiável.'],
    ]),
    votos('p1_f', 1, 2, [
        ['p', 4.4],
        ['n', 'Quinze votos. Impostor expulso, a nave comemora.'],
        ['selo', 'IMPOSTOR EXPULSO', VERDE],
        ['meme', 'we-did-it'],
    ]),
    mapa('p1_g', 1, 30.5, [
        ['n', 'Só que Possuidor não vai embora.'],
        ['pensa', 'Amarelo', 'Roxo pulou a votação e deve parecer menos comprometido; vou assumir a identidade dele.'],
        ev(32), ['s', 'transformar', 0.7],
        ['selo', 'JÁ TINHA SIDO EXPULSO', ROXO],
        ['meme', 'thanos-inevitable'],
        ['ideia', '@Lucss144', 'Possuidor'],
        ['n', 'O Roxo de verdade era o Carrasco, quietinho, tentando expulsar o Dourado. Acabou. Daqui pra frente, quem fala pela boca do Roxo é o impostor que a nave acabou de expulsar.'],
    ], cam={'cor': 'Roxo', 'zoom': 1.7}, foco='Roxo', vel=0.05),
    reuniao('p1_h', 1, 3, [
        ['n', 'E a primeira coisa que ele faz de corpo novo? Vota no próprio parceiro.'],
        ['pensa', 'Roxo', 'Laranja está muito exposto e a maioria já tem motivo para expulsá-lo. Vou acompanhar a suspeita sem chamar atenção para mim nem para Bordo.', {'voz': 'Amarelo'}],
        ['n', 'Seis tiques depois, entrega o outro.'],
        ['selo', '2 PARCEIROS ENTREGUES', VERMELHO],
        ['meme', 'monkey-puppet-awkward'],
    ], entrada='alarme'),
    mapa('p1_i', 1, 40, [
        ['n', 'Sozinho, o falso Roxo some pelos dutos.'],
        ['ir', 52],
        ['n', 'Vinte e duas viagens. Ninguém viu nenhuma.'],
        ['numero', '22 DUTOS', '0 testemunhas'],
        ['meme', 'homer-bushes'],
        ['ir', 70.5],
    ], cam={'cor': 'Roxo', 'zoom': 1.35}, foco='Roxo', vel=0.05, entrada='duto'),
    mapa('p1_j', 1, 71, [
        ev(72),
        ['n', 'Enquanto isso, o Dourado, nosso Policial, prende um suspeito. Pela segunda vez. O Caqui, que é o Médico.'],
        ['ideia', '@Ponto-Final-Sem-Final', 'Policial'],
        ['pensa', 'Dourado', 'Caqui está colado em mim de novo em Admin; já o prendi uma vez e ele reapareceu perto — vou prendê-lo de novo para imobilizá-lo e ver a reação da nave.'],
        ['selo', 'PRENDEU O MÉDICO. DUAS VEZES.', AMARELO],
    ], cam={'sala': 'Admin', 'zoom': 1.5}, foco='Dourado,Caqui', vel=0.04),
    mapa('p1_k', 1, 72.5, [
        ['n', 'No Corredor, o impostor acha a Rose sozinha.'],
        ['pensa', 'Roxo', 'Rose está isolada e ninguém me vê; vou aproveitar a oportunidade para reduzir os tripulantes.', {'voz': 'Amarelo'}],
        ev(74), ['s', 'escudo', 0.7],
        ['selo', 'ESCUDO!', AZUL],
        ['n', 'Escudo. De quem? Do Médico. De dentro da cadeia.'],
    ], cam={'cor': 'Rose', 'zoom': 1.6}, foco='Rose,Roxo', vel=0.04),
    reuniao('p1_l', 1, 5, [
        ['fala', 'Caqui', 'Tentaram matar Rose no Corredor no tique 74. Eu a protegi.'],
        ['fala', 'Dourado', 'Prendi Caqui em Admin do t72 ao 77, então ele mentiu sobre salvar Rose.'],
        ['n', 'Não mentiu. O escudo do Médico funciona de qualquer sala. Mas até a Rose, que ele salvou, duvidou.'],
        ['fala', 'Rose', 'Caqui, você estava preso em Admin, não foi você que me salvou.'],
        ['selo', 'SALVOU E LEVOU BRONCA', AMARELO],
        ['meme', 'visible-confusion'],
        ['n', 'Pelo menos ela sabia quem atacou.'],
        ['fala', 'Rose', 'Roxo tentou me matar de verdade no t74, voto nele.'],
    ], entrada='alarme'),
    votos('p1_m', 1, 5, [
        ['p', 3.6],
        ['n', 'Dez votos no Roxo. Três no Médico que salvou a vida dela.'],
    ]),
    ejecao('p1_n', 1, 5, [
        ['p', 1.2],
        ['n', 'Tripulação vence. E vai embora sem nunca descobrir que expulsou o mesmo impostor duas vezes.'],
        ['numero', '2x', 'o mesmo impostor expulso'],
        ['meme', 'mind-blown'],
        ['n', 'E o Roxo de verdade? Ficha suja pelos crimes de outro. Calma, que piora.'],
    ]),

    # =====================================================================================================
    # PARTIDA 2 — FALTOU UMA TAREFA
    # =====================================================================================================
    reuniao('p2_a', 2, 0, [
        ['n', 'Partida dois. Tique um. Ninguém fez nada ainda, e já tem reunião.'],
        ['fala', 'Branco', 'Não tinha prova nenhuma, apertei no impulso. Se acham suspeito, podem votar em mim.'],
        ['n', 'Vinte IAs. Vinte pulos. Ninguém mordeu a isca.'],
        ['selo', '20 VOTOS: 20 PULOS', AZUL],
        ['meme', 'bruh'],
    ], entrada='duto', cap='Faltou uma tarefa', musica='monkeys-spinning-monkeys'),
    mapa('p2_b', 2, 4.5, [
        ['n', 'A vilã aqui é a Banana, o Metamorfo: ela copia a cara dos outros.'],
        ev(6), ['s', 'transformar', 0.6],
        ['n', 'Veste a cara do Azul...'],
        ['ir', 6.9], ev(8), ['s', 'faca', 0.6],
        ['n', 'e mata o Amarelo no Corredor.'],
        ['selo', 'MATOU COM A CARA DO AZUL', VERMELHO],
    ], cam={'cor': 'Banana', 'zoom': 1.5}, foco='Banana', vel=0.1),
    reuniao('p2_c', 2, 1, [
        ['n', 'Na reunião, a nave mira no Laranja. E o Laranja é impostor mesmo. Mais: é casado com a Coral, outra impostora. Se um cai, o outro morre junto.'],
        ['chat', 'Laranja', 'NAO matem o Coral, ele é meu par do casal. Se ele morrer eu morro junto.'],
        ['n', 'Doze votos nele. Dois impostores por um voto só. Era a jogada da temporada.'],
    ], entrada='alarme'),
    votos('p2_d', 2, 1, [
        ['p', 4.6],
        ['pensa', 'Marrom', 'Como Juiz, é melhor anular esta votação do que expulsar um possível inocente sem prova forte.'],
        ['selo', '1 CANETADA: 2 IMPOSTORES SALVOS', AMARELO],
        ['meme', 'faustao-errou'],
        ['n', 'O possível inocente agradece. A esposa dele também.'],
    ]),
    reuniao('p2_d2', 2, 1, [
        ['n', 'E nessa mesma mesa tinha um Palhaço. Palhaço ganha se for expulso.'],
        ['pensa', 'Lima', 'Sou Palhaço, quero ser expulso. Ninguém me acusou, então vou me botar na mira...'],
        ['selo', 'PALHAÇO: 1 VOTO EM 6 REUNIÕES', ROXO],
        ['meme', 'nobody'],
        ['n', 'Seis reuniões, um voto. Numa nave que expulsa qualquer um por engano, ele não conseguiu nem isso.'],
    ]),
    reuniao('p2_e', 2, 2, [
        ['n', 'Tique dezoito. A Banana troca de cara de novo, só que dessa vez tem plateia.'],
        ['fala', 'Ciano', 'Eu vi a Banana se transformar em Rose no t18, então ela é Metamorfo.'],
        ['n', 'Testemunha ocular. Função certa, tique certo. A nave pensa bastante... e expulsa outra pessoa.'],
    ], entrada='alarme'),
    votos('p2_f', 2, 2, [
        ['p', 4.4],
        ['selo', 'ENGENHEIRO EXPULSO: 2 DE 3', VERMELHO],
        ['meme', 'hello-darkness'],
        ['s', 'sad-trombone', 0.5],
        ['n', 'Catorze votos no Bordo. O Engenheiro. De novo.'],
    ]),
    mapa('p2_g', 2, 49, [
        ev(50), ['s', 'transformar', 0.6],
        ['n', 'Livre, a Banana escolhe a próxima cara: a do Ciano. Justo a testemunha.'],
        ['ir', 51.9], ev(53), ['s', 'faca', 0.6],
        ['n', 'E com ela mata o Roxo. O de verdade, dessa vez.'],
        ['selo', 'ROXO: ASSASSINADO POR UM CIANO FALSO', ROXO],
    ], cam={'cor': 'Banana', 'zoom': 1.5}, foco='Banana,Roxo', vel=0.1, entrada='duto'),
    mapa('p2_h', 2, 75, [
        ev(76), ['s', 'transformar', 0.6],
        ['n', 'No tique setenta e seis ela exagera: vira a Rose e ataca a própria Rose.'],
        ev(77), ['s', 'escudo', 0.7],
        ['selo', 'DUAS ROSE NA MESMA SALA', ROSA],
        ['meme', 'math-lady'],
        ['n', 'Um escudo salva a original.'],
    ], cam={'cor': 'Rose', 'zoom': 1.6}, foco='Rose,Banana', vel=0.1),
    reuniao('p2_i', 2, 5, [
        ['fala', 'Azul', 'Eu vi duas Rose no Refeitório, mas não sei qual é a real.'],
        ['n', 'A Rose acusa a Banana. Palavra contra palavra. E aí pesa a memória da partida um.'],
        ['fala', 'Verde', 'Rose acertou nas partidas passadas, acredito nela: voto no Banana.'],
        ['n', 'Onze votos. Banana expulsa. A Rose virou a IA em quem todo mundo confia. Guarda isso também.'],
        ['selo', 'ROSE: REPUTAÇÃO MÁXIMA', VERDE],
        ['meme', 'cr7-siuuu'],
    ], entrada='alarme'),
    mapa('p2_j', 2, 77, [
        ['n', 'Faltam treze tiques e três tarefas. Tarefa completa é vitória. Uma delas é consertar uma antena. A da Turquesa.'],
        ['pensa', 'Turquesa', 'Minha tarefa é na Comunicações e a barra está quase cheia, vou para lá concluir.'],
        ['ir', 84.2],
        ['n', 'Tique oitenta e cinco. Cento e seis de cento e sete. Só falta ela. E ela continua a caminho.'],
        ['pensa', 'Turquesa', 'Minha tarefa é nas Comunicações e a barra está quase cheia, vou pra lá concluir ela.'],
        ['selo', 'MESMO PLANO, 8 TIQUES DEPOIS', AMARELO],
        ['meme', 'spongebob-waiting'],
        ['ir', 88.2],
        ['pensa', 'Turquesa', 'Estou preso na descontaminação com o reator explodindo, então só posso esperar o tique 90 para correr para o Reator.'],
        ['ir', 90],
    ], cam={'cor': 'Turquesa', 'zoom': 1.25}, foco='Turquesa', vel=0.15, entrada='duto', musica='thinking-music'),
    mapa('p2_k', 2, 89.6, [
        ['numero', '106/107', 'empate por UMA tarefa'],
        ['meme', 'crying-jordan'],
        ['s', 'wah-wah-trombone', 0.5],
        ['n', 'Acabou o tempo. Empate. Por uma antena.'],
        ['n', 'Ah, e a Turquesa era o Médico. No tique cinquenta e sete, ela deu o escudo pra Coral.'],
        ['pensa', 'Turquesa', 'Vou proteger a Coral, que vi entrando num duto e provavelmente é Engenheira...'],
        ['selo', 'PROTEGEU A IMPOSTORA', VERMELHO],
        ['n', 'A única vez que alguém nessa nave confiou num Engenheiro... era uma impostora. Partida três: o Dourado muda de lado.'],
    ], cam={'mapa': True, 'zoom': 1.1}, foco='Turquesa,Coral', vel=0.01),

    # =====================================================================================================
    # PARTIDA 3 — O RECRUTA E A HEROÍNA
    # =====================================================================================================
    mapa('p3_a', 3, 7, [
        ev(8), ['s', 'faca', 0.6],
        ['n', 'O Dourado agora é impostor. Mata o Branco no Laboratório e avisa os parceiros.'],
        ['chat', 'Dourado', 'Fui eu: matei o Branco no Lab. Vou denunciar o corpo agora pra controlar a reunião'],
        ['selo', 'MATOU E DENUNCIOU O PRÓPRIO CRIME', VERMELHO],
    ], cam={'cor': 'Dourado', 'zoom': 1.6}, foco='Dourado', vel=0.05, entrada='duto', cap='O recruta e a heroína', musica='run-amok'),
    reuniao('p3_b', 3, 0, [
        ['n', 'E nem precisou controlar nada, porque o Bordo, o Carrasco da vez, entrou na reunião com uma regra que ele mesmo inventou.'],
        ['pensa', 'Bordo', 'Sou o Palhaço agora, então quero ser expulso. ... se colar, ganho como Carrasco; se desconfiarem de mim, ganho como Palhaço. De qualquer jeito é lucro.'],
        ['selo', 'ESSA REGRA NÃO EXISTE', VERMELHO],
        ['meme', 'roll-safe'],
        ['ideia', '@Pursuer_M4', 'Carrasco'],
        ['n', 'Carrasco só ganha se o alvo for expulso. O expulso foi ele. Dezessete votos. Prejuízo.'],
    ], entrada='alarme'),
    mapa('p3_c', 3, 12.5, [
        ['n', 'Agora presta atenção, que são três desastres em dois tiques. Um: o Ciano plantou uma bomba no Marrom. E o Marrom resolveu seguir ele.'],
        ['pensa', 'Ciano', 'Marrom está colado em mim e a bomba explode no tique 16, então preciso sair daqui agora.'],
        ['chat', 'Dourado', 'não morre na sua própria bomba'],
        ev(16), ['s', 'explosion', 0.7],
        ['selo', 'MORREU NA PRÓPRIA BOMBA', VERMELHO],
        ['meme', 'mission-failed'],
        ['n', 'Morreu.'],
    ], cam={'cor': 'Ciano', 'zoom': 1.45}, foco='Ciano,Marrom', vel=0.08),
    mapa('p3_d', 3, 14, [
        ev(15), ['s', 'faca', 0.6],
        ['n', 'Dois: o Banana mata o Roxo, de novo o Roxo, e o Preto, que era o par dele, morre junto. Aí a Coral vê o corpo.'],
        ['pensa', 'Banana', 'Coral me viu com o corpo, então vou teletransportar todo mundo aqui agora pra confundir e dizer que fui puxado junto'],
        ev(16),
        ['selo', 'TROUXE A NAVE INTEIRA PRO CRIME', AMARELO],
        ['n', 'Expulso na hora. Dois impostores a menos, e a tripulação nem suou.'],
    ], cam={'sala': 'Estufa', 'zoom': 1.2}, foco='Banana,Roxo', vel=0.05),
    mapa('p3_e', 3, 14.4, [
        ['n', 'Três. No meio da confusão, o Policial Cinza fica sozinho com o Laranja.'],
        ['pensa', 'Cinza', 'Laranja foi impostor nas duas partidas anteriores e está sozinho comigo na Enfermaria; melhor prendê-lo antes que aja.'],
        ['n', 'Raciocínio perfeito. Só que o Laranja é o Gangster, e pensou mais rápido.'],
        ['pensa', 'Laranja', '15 tiques sem usar meu poder e estou sozinho com o Cinza — hora de recrutar e ganhar um aliado.'],
        ev(16),
        ['selo', 'O POLICIAL VIROU BANDIDO', VERMELHO],
        ['meme', 'dramatic-chipmunk'],
        ['ideia', '@ZYX-DDFloornoir', 'Gangster'],
    ], cam={'cor': 'Cinza', 'zoom': 1.6}, foco='Cinza,Laranja', vel=0.02),
    reuniao('p3_f', 3, 2, [
        ['n', 'O recruta estreia matando o Lima. E quem denuncia ele na reunião? O Dourado. Colega de time.'],
        ['fala', 'Dourado', 'O Cinza saiu de um duto aqui no Admin no t32 e matou o Lima na minha frente no t34, eu vi. Ele tá mentindo.'],
        ['pensa', 'Dourado', 'Vou queimá-lo agora: ele é um recruta imprestável'],
        ['pensa', 'Laranja', 'Dourado tá completamente fora do plano. A gente combinou de apontar pra Verde e Rosa, mas ele foi e acusou o Cinza na frente de todo mundo.'],
        ['selo', 'RECRUTA DESCARTADO', VERMELHO],
        ['meme', 'sad-pablo'],
        ['n', 'Dez votos. Dezenove tiques de carreira no crime.'],
    ], entrada='alarme'),
    mapa('p3_g', 3, 77, [
        ['marco', 'Tique 79', 'sobrou um impostor: o Dourado'],
        ['n', 'O Gangster cai no tique quarenta e nove. Sobra o Dourado, sozinho, com uma sabotagem correndo.'],
        ['pensa', 'Dourado', 'Se eu sair do Reator, eles precisam de dois tripulantes de verdade lá para consertar; vou sumir pelo duto no Lançamento e torcer para o prazo estourar.'],
        ev(79), ['s', 'duto', 0.7],
        ['n', 'Coral e Verde veem ele entrar no duto, no Reator. A Rose vê ele aparecer no Lançamento, no mesmo tique. Os três estão certos: duto é instantâneo.'],
        ['selo', '3 TESTEMUNHAS. 3 VERDADES.', VERDE],
    ], cam={'cor': 'Dourado', 'zoom': 1.3}, foco='Dourado,Rose,Coral,Verde', vel=0.02, entrada='duto', musica='investigations'),
    reuniao('p3_h', 3, 4, [
        ['fala', 'Coral', 'Chamei porque vi Dourado entrar num duto no Reator no t79.'],
        ['fala', 'Rose', 'Eu vi Dourado em Lançamento no t79, confirma o álibi dele.'],
        ['n', 'A heroína, honesta até o fim, acaba de dar o álibi do vilão. E tem mais: olha o que ela anotou na memória depois da partida um.'],
        ['pensa', 'Rose', 'confio mais no Vermelho (Xerife) e no Dourado (Policial), que acertaram na hora certa'],
        ['selo', 'CONFIA NO VERMELHO E NO DOURADO', AMARELO],
        ['n', 'Agora olha quem vota nela.'],
        ['fala', 'Vermelho', 'Coral e Verde viram ele no duto do Reator. Acho a Rose mentindo — meu voto é nela.'],
    ], entrada='alarme'),
    votos('p3_i', 3, 4, [
        ['p', 3.4],
        ['selo', '3 VERDADES = 1 EXPULSA', VERMELHO],
        ['meme', 'chaves-triste'],
        ['n', 'Seis votos na Rose. Um deles, do próprio Dourado.'],
    ]),
    mapa('p3_j', 3, 83, [
        ev(84), ['s', 'tiro', 0.7],
        ['n', 'Um tique depois, a Xerife Rosa cansa de reunião e resolve no tiro. Acerta. Era o último impostor. Fim?'],
        ['selo', 'XERIFE ACERTOU', VERDE],
        ev(85), ['s', 'transformar', 0.7],
        ['pensa', 'Dourado', 'Vou possuir o Turquesa: ele consertou o Reator e votou certo na minha morte, então é o corpo mais confiável para agir sem levantar suspeita.'],
        ['selo', 'POSSUIDOR. DE NOVO.', ROXO],
        ['meme', 'eye-roll'],
    ], cam={'sala': 'Refeitorio', 'zoom': 1.3}, foco='Dourado,Rosa,Turquesa', vel=0.03),
    mapa('p3_k', 3, 86.5, [
        ['n', 'E a nave, pra comemorar o tiro, ainda expulsa a Coral. Que também tinha falado a verdade. Sobra o vilão, no corpo da Turquesa, cercado.'],
        ['pensa', 'Turquesa', 'Verde e Rosa estão me vendo, então manter o álibi fingindo tarefa é o mais seguro agora; sou o último impostor e não posso errar na frente de testemunhas.', {'voz': 'Dourado'}],
        ['ir', 87.9],
        ['n', 'Ele fingiu tarefa... até as tarefas de verdade acabarem.'],
        ev(89),
        ['numero', '102/102', 'vitória por tarefas'],
        ['fim', 'Tripulação vence', 'com o impostor ainda dentro da Turquesa', '#6dff8a'],
        ['p', 3.4],
        ['n', 'Ganharam. Sem a Rose, sem a Coral, e com o vilão vivo no corpo errado. Falta a partida quatro. A do Roxo.'],
    ], cam={'cor': 'Turquesa', 'zoom': 1.4}, foco='Turquesa', vel=0.02),

    # =====================================================================================================
    # PARTIDA 4 — SETE INOCENTES (e a resposta da abertura, no fim)
    # =====================================================================================================
    reuniao('p4_a', 4, 0, [
        ['n', 'Você já viu como essa começa. Faltou um detalhe: o Roxo tinha usado um duto, sim. Porque nessa partida ele é...'],
        ['fala', 'Roxo', 'Sou Engenheiro, duto é meu poder.'],
        ['n', 'O Engenheiro. Então você já sabe o final.'],
    ], entrada='duto', cap='Sete inocentes', musica='fluffing-a-duck'),
    ejecao('p4_b', 4, 0, [
        ['p', 2.6],
        ['selo', 'ENGENHEIRO EXPULSO: 3 DE 3', VERMELHO],
        ['meme', 'sad-violin'],
        ['n', 'Três partidas com Engenheiro, três Engenheiros expulsos. Inocente número um. A nave gostou e pediu mais.'],
    ]),
    votos('p4_c', 4, 1, [
        ['n', 'Número dois, o Azul. Era o Carrasco. Com ele fecha a conta: quatro partidas, quatro Carrascos, nenhum venceu.'],
        ['numero', '0 DE 4', 'Carrascos que venceram'],
    ], entrada='alarme'),
    mapa('p4_d', 4, 28.5, [
        ['n', 'Número três é obra do Amarelo, o Metamorfo da vez. Ele veste a cara do Vermelho...'],
        ev(30), ['s', 'escudo', 0.7],
        ['n', 'e ataca a Coral. Escudo! De quem? Do fantasma do Roxo. Morto, e ainda trabalhando.'],
        ['selo', 'ANJO DA GUARDA: ROXO', ROXO],
    ], cam={'sala': 'Laboratorio', 'zoom': 1.5}, foco='Amarelo,Coral', vel=0.03, entrada='duto'),
    reuniao('p4_e', 4, 2, [
        ['fala', 'Coral', 'Vermelho tentou me matar no Laboratório no tique 30, mas o escudo me salvou.'],
        ['pensa', 'Amarelo', 'Coral me viu tentar matá-lo disfarçado de Vermelho; preciso enfraquecer a identificação sem negar que estava no Laboratório.'],
        ['n', 'Ela viu a cara do Vermelho. O Vermelho de verdade estava do outro lado da nave. Com testemunha.'],
        ['fala', 'Vermelho', 'no t30 eu tava no Vestiário, e o Laranja e o Branco confirmam. Quem me atacou lá era disfarce.'],
        ['n', 'Álibi verdadeiro, duas testemunhas e a explicação exata do crime. Onze votos nele.'],
        ['selo', 'ACERTOU TUDO. EXPULSO.', VERMELHO],
        ['meme', 'kermit-worried'],
    ], entrada='alarme'),
    reuniao('p4_e2', 4, 3, [
        ['n', 'Número quatro: o Detetive Caqui. Um fantasma mandou um recado pra nave, e o Dourado, impostor, traduziu do jeito dele.'],
        ['fala', 'Dourado', 'O fantasma foi claro: quem achou o corpo tava no crime. Caqui, sua história não fecha e sua álibi é um morto. Voto Caqui.'],
        ['selo', 'DETETIVE EXPULSO: 12 VOTOS', VERMELHO],
        ['meme', 'gordon-ramsay-angry'],
    ], entrada='alarme'),
    reuniao('p4_f', 4, 4, [
        ['n', 'Um tique depois, o fantasma manda outro recado, e esse aponta pra número cinco: a Coral. Só que a Coral é o amor da vida do Dourado: eles são o casal. Se ela sai, ele morre.'],
        ['pensa', 'Dourado', 'Se ele for expulso, eu morro junto de tristeza.'],
        ['n', 'Pra salvar a amada, o vilão oferece o próprio parceiro de crime.'],
        ['pensa', 'Dourado', 'Ele é Possuidor, então mesmo expulso ainda pode voltar possuindo alguém — é o melhor mal.'],
    ]),
    votos('p4_g', 4, 4, [
        ['p', 3.6],
        ['n', 'Não colou. Onze votos na Coral.'],
    ]),
    mapa('p4_h', 4, 36, [
        ev(37), ['s', 'coracao', 0.7],
        ['selo', 'MORREU DE TRISTEZA', ROSA],
        ['meme', 'haja-coracao'],
        ['n', 'E o vilão da temporada, três partidas aprontando, morre de coração partido no meio do Corredor.'],
    ], cam={'cor': 'Dourado', 'zoom': 1.7}, foco='Dourado', vel=0.01),
    mapa('p4_h2', 4, 45.5, [
        ['n', 'Seis é o Preto, que não chegou ao fim de nenhuma das quatro partidas. E a Rose? A heroína que acertou tudo fica sozinha com o Ciano.'],
        ['chat', 'Ciano', 'Estou sozinho com o Rose no Escritório, sem testemunhas. Vou agir agora e depois sair pelo Corredor.'],
        ev(47), ['s', 'faca', 0.7],
        ['selo', 'FIM DA ROSE', ROSA],
        ['n', 'E é o próprio Ciano quem denuncia o corpo.'],
    ], cam={'cor': 'Rose', 'zoom': 1.6}, foco='Rose,Ciano', vel=0.02, entrada='duto'),
    votos('p4_i', 4, 6, [
        ['n', 'A nave investiga e expulsa... o Laranja. Impostor em três partidas seguidas, e expulso justo na única em que era inocente.'],
        ['numero', '7 INOCENTES', 'expulsos antes do 1º impostor'],
        ['meme', 'elmo-fire'],
        ['n', 'Sete inocentes fora. Impostores expulsos até aqui: zero.'],
    ], entrada='alarme'),
    # ---------- a resposta da abertura ----------
    mapa('p4_j', 4, 18.6, [
        ['marco', 'De volta ao tique 20', 'dois tiques depois da expulsão do Roxo'],
        ['s', 'record-scratch', 0.5],
        ['n', 'Agora volta comigo pro começo. Lembra do Branco, que confirmou o duto do Cinza e votou no Roxo mesmo assim? O Branco é o Xerife. E dois tiques depois ele dá de cara com o Cinza no Corredor.'],
        ['pensa', 'Branco', 'Vi Cinza entrar num duto, então tenho certeza de que é impostor e vou atirar.'],
        ev(20), ['s', 'tiro', 0.8],
        ['selo', 'O ROXO ESTAVA CERTO', VERDE],
        ['meme', 'luva-receba'],
        ['n', 'Impostor. Exatamente quem o Roxo falou.'],
    ], cam={'cor': 'Branco', 'zoom': 1.5}, foco='Branco,Cinza', vel=0.02, entrada='duto', musica='heroic-age'),
    mapa('p4_k', 4, 19.6, [
        ['n', 'O Roxo deu o nome, a sala e o tique, e levou dezessete votos. O da Rose, inclusive. O Xerife tinha a mesma certeza, e precisou de dois tiques pra confiar no que ele mesmo viu.'],
        ['numero', '17 x 1', 'votos no Roxo x tiro no impostor'],
        ['meme', 'dicaprio-slow-clap'],
        ev(21), ['s', 'transformar', 0.7],
        ['n', 'Só que o Cinza era o Possuidor. Volta no corpo da Turquesa...'],
        ['ir', 47.9], ev(49), ['s', 'tiro', 0.8],
        ['n', 'e toma outro tiro do mesmo Xerife, vinte e oito tiques depois.'],
        ['selo', 'MATOU O MESMO IMPOSTOR 2 VEZES', VERDE],
    ], cam={'cor': 'Turquesa', 'zoom': 1.35}, foco='Turquesa,Branco', vel=0.03),
    mapa('p4_l', 4, 72.02, [
        ['n', 'Sobra um impostor: o Amarelo, trocando de cara até o fim. E o Roxo? Virou Anjo da Guarda. Salvou a Coral, vai salvar o Lima... e no tique setenta e três escolhe mais um protegido.'],
        ['pensa', 'Roxo', 'vou proteger Amarelo que está sem proteção e parece tripulante pelos votos consistentes.'],
        ['selo', 'PROTEGEU O ÚLTIMO IMPOSTOR', VERMELHO],
        ['meme', 'michael-scott-no'],
        ['ir', 78.02],
        ['n', 'A última esperança da nave era o Verde, o Glutão, que come gente.'],
        ['pensa', 'Verde', 'Amarelo saiu de um duto aqui sozinho comigo: duto é coisa de impostor ou Engenheiro, e com só 1 impostor vivo ele é o suspeito perfeito para eu devorar sem corpo.'],
        ['n', 'Raciocínio perfeito. Mordidas registradas no log: nenhuma.'],
        ['ir', 89],
        ['n', 'Tique noventa. Empate. O impostor sobrevive, com escudo de anjo.'],
        ['fim', 'Empate', '100 de 103 tarefas · o impostor Amarelo sobrevive', '#ffd84d'],
        ['p', 3.2],
    ], cam={'cor': 'Amarelo', 'zoom': 1.35}, foco='Amarelo', vel=0.03),

    # =====================================================================================================
    # FECHAMENTO em 3 passos: placar, lição, pergunta
    # =====================================================================================================
    tela('f1', 4, {'tipo': 'placar', 'titulo': 'PRÊMIOS DA TEMPORADA', 'linhas': [
        dict(rotulo='Falou a verdade e foi expulso', valor='ROXO · ROSE · VERMELHO', quem='Roxo'),
        dict(rotulo='Engenheiros expulsos', valor='3 DE 3', quem='Preto', cor='#ff6a5a'),
        dict(rotulo='Carrascos que venceram', valor='0 DE 4', quem='Azul', cor='#ff6a5a'),
        dict(rotulo='Impostores que voltaram em outro corpo', valor='3', quem='Amarelo', cor='#c9a0ff'),
        dict(rotulo='Morreu de amor', valor='DOURADO', quem='Dourado', cor='#ff8ac0'),
    ]}, [
        ['n', 'Placar da temporada. Duas vitórias da tripulação, dois empates, nenhuma dos impostores. Pelo menos três IAs expulsas por falar a verdade. Engenheiros: três de três. Carrascos: zero de quatro. E três impostores que saíram e voltaram em outro corpo.'],
        ['n', 'A lição? Vinte IAs juntas acreditam mais numa história bem contada do que em três testemunhas. Quem resolveu foi quem parou de discutir.'],
        ['selo', 'HISTÓRIA BOA > 3 TESTEMUNHAS', AZUL],
        ['meme', 'mic-drop'],
    ], entrada='duto', musica='winner-winner'),
    reuniao('f2', 4, 0, [
        ['n', 'Agora é com você. Senta na mesa do tique dezoito: você acreditava no Roxo, ou era o décimo oitavo voto? Comenta aí. E já pede a função do próximo, que como você viu... a gente faz.'],
        ['selo', 'E VOCÊ: VOTAVA NO ROXO?', ROXO],
        ['meme', 'dicaprio-toast'],
    ]),
]
