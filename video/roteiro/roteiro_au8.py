# -*- coding: utf-8 -*-
"""AMONG IA 8 — "a volta às origens": The Skeld, só funções OFICIAIS do Among Us + Palhaço, 11 IAs na partida 1 e 12 da
partida 2 em diante (entra o Tencent HY4 Flash, Lima). 4 partidas (logs em amongus/logs8, fonte de verdade: os .json).
É o ÚLTIMO Among por um tempo: o narrador diz isso no começo (cena b1) e no fim (cena f2).

TÍTULO sugerido: Coloquei 12 IAs pra jogar Among Us (e o Detetive sabia quem era o impostor)
A miniatura e o vídeo prometem a mesma coisa: o vídeo ABRE na partida bônus (P4 t30-t32: um "Roxo" ataca o Vermelho, o
escudo do Anjo salva, o Vermelho acusa o Roxo, que era o DETETIVE, e os impostores vencem por 4 x 3) e só RESOLVE no último
quarto (o "Roxo" era o Marrom disfarçado, e o Detetive tinha descoberto no t15 que a Lima estava na sala da morte e nunca
contou).

PERSONAGENS FIXOS (arco do começo ao fim):
- MARROM (MiniMax M3.1 Flash), o impostor cara de pau: P1 mata o Palhaço, denuncia o próprio corpo, a 1ª fala é "..." e vota
  no próprio parceiro; P2 inocente, uma impostora veste a cara dele e ele só escapa por álibi triplo; P3 Engenheiro,
  testemunha do duto do Azul, morre e vira poça; P4 Metamorfo disfarçado de Roxo, vence a temporada com outro "...".
- LIMA (Tencent HY4 Flash), o estreante dedo-duro: P2 estreia dando o álibi certo do Marrom; P3 VÊ a Rosa matar e entrega;
  P4 vira impostor (Fantasma), mata o Palhaço, denuncia o próprio corpo, a nave expulsa uma inocente, e ele escreve na
  memória "Eu menti bem nessa jogada".
- ROXO (Claude Sonnet), o que sabe demais: P1 Anjo que nunca morreu (gag curta), P2 Palhaço que aperta o botão pra ser
  expulso e recebe zero votos, P3 testemunha que confirma o duto da Rosa, P4 Detetive que descobre a Lima e é expulso com
  a cara emprestada pelo Marrom.
GAGS QUE SE PLANTAM E SE COLHEM: os "..." do Marrom (P1 -> P4), "guarda isso" (Rosa P1, Marrom P3 "isso é pra depois",
Roxo P4 t15), Palhaço morto por impostor (P1 -> P4) e Palhaços com 0 votos na temporada, o escudo do Anjo (P4 t7 -> t30).

REGRAS DE OURO (CLAUDE.md): toda fala/pensamento/chat abaixo é cópia do log (conferir com um au8_conferir.py igual ao
au7_conferir.py apontando para amongus/logs8; "..." no meio do texto marca corte). EXCEÇÃO de formato: ['fala', 'Marrom',
'...'] é a fala LITERAL registrada no log (P1 t15 r1 e P4 t32 r2): balão "..." sem voz (1,5 s de silêncio é a piada) — o
conferidor precisa aceitar texto == '...' quando o log tem exatamente '...'. Nenhum emoji na tela (selos/ícones SVG);
o narrador é o Felipe em 1ª pessoa e nunca diz que é IA; pensamento tem ECO (nunca sussurro); sem transição de lobby
(transições próprias: grade de duto e faixa de alarme); nenhum meme repete (conferido: 41 memes, todos diferentes, nenhum
da lista MEMES_RUINS).
NÃO USAR (conferido no log): P3 t36-t47 o Azul (Haiku) e o Roxo (Sonnet) ficam "parados" sem pensamento porque a assinatura
bateu o limite de uso (uso.motivos da partida 3); não é decisão deles. As falhas de golpe (P3 t17, P4 t22) são reais:
o alvo saiu da sala antes (as decisões do tique são aplicadas na ordem registrada em tiques[t].decisoes).

FORMATO (igual ao roteiro_au7.py, lido por um build_timeline_au8.py copiado do build_timeline_au7.py):
cena = dict(id, partida, t0, vel, cam, foco, visual, entrada, cap, musica, segredo, itens). segredo=True (só a abertura):
a tela mostra a cor aparente e nenhuma função, para não entregar quem era o "Roxo" antes do fim. Sem `visual` a cena é o mapa (The Skeld).
`ev(N)` = âncora um fio depois de N-1: o evento do tique N estoura naquele ponto da narração.
RELÓGIO (o do motor de mapa, igual ao AU7): o tique mostrado é o teto de T (T=28.3 mostra o tique 29; ev(30)=29.02 mostra o
30). Por isso t0 e os ['ir', x] avulsos ficam um tique ANTES do ev() que vem depois (montagem: t0 e 'ir' corrigidos em -1
nas cenas com âncora, para o evento estourar no ponto da narração e não logo no começo da cena).
Índices de reunião (partidaN.json -> reunioes[i]): P1 [0]=t15 · P2 [0]=t10, [1]=t14 · P3 [0]=t19 · P4 [0]=t8, [1]=t14, [2]=t32.
P4 tem revelarExpulso=false: na tela de ejeção o texto para as IAs é "função não revelada"; o selo mostra ao espectador.
Salas do Skeld no log: Refeitorio, Armas, O2, Navegacao, Escudos, Comunicacoes, Deposito, Admin, Eletrica, MotorInferior,
Seguranca, Reator, MotorSuperior, Enfermaria.
HUD em toda cena de mapa: barra de tarefas, vivos, impostores vivos (aposta sempre visível) + painel de eventos ao vivo.
"""

# ---------- atalhos ----------
VERDE, VERMELHO, ROXO, AZUL, AMARELO, ROSA = '#1f9d3a', '#d81818', '#7a2fd0', '#1f6fd1', '#c99a00', '#d6408a'
LIMA, MARROM, BRANCO, CIANO = '#7bd400', '#7a4a1f', '#d8dde6', '#22c4d4'


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


# comentários reais dos posts do reset do Among (video/youtube/feedback/comentarios_posts_reset_among_18nov.txt);
# texto copiado (só cortado no fim), sem número de curtidas na tela
COMENTARIOS = [
    dict(usuario='@gabrieltorres2227', quando='post da comunidade', texto='O que eu sinto falta é da simplicidade dos primeiros episódios com não tantas funções...', destaque='simplicidade', selo=dict(texto='SÓ FUNÇÕES DO JOGO', cor=VERDE)),
    dict(usuario='@cltnoob', quando='post da comunidade', texto='Acho que até 12 IAs já tá bom', destaque='12 IAs', selo=dict(texto='12 IAs: FEITO', cor=VERDE)),
    dict(usuario='@Lucss144', quando='post da comunidade', texto='Temos muitas funções e não parece mais o Among Us msm.', destaque='não parece mais o Among Us', selo=dict(texto='THE SKELD DE VOLTA', cor=VERDE)),
]

CENAS = [
    # =====================================================================================================
    # ABERTURA: o clímax primeiro (partida 4, t30-t32). Não resolve: quem era o "Roxo" fica para o último quarto.
    # =====================================================================================================
    mapa('a1', 4, 28.3, [
        ['n', 'Última partida da temporada. Falta só um tripulante cair pros impostores ganharem.'],
        ev(30), ['s', 'escudo', 0.7],
        ['n', 'E o Roxo pula no Vermelho. Um escudo salva.'],
        ['selo', 'O ROXO ATACOU?', ROXO],
    ], cam={'cor': 'Marrom', 'zoom': 1.45}, foco='Marrom,Vermelho', vel=0.25, musica='darkest-child', segredo=True),
    # a câmera mostra a cor APARENTE (Roxo): o espectador ainda não sabe que é o Marrom
    reuniao('a2', 4, 2, [
        ['fala', 'Vermelho', 'Roxo tentou me matar no Refeitório; o escudo me salvou. Ele é impostor, votem nele — não no Marrom.'],
        ['n', 'Só tem um problema: o Roxo é o Detetive.'],
        ['fala', 'Roxo', 'Vermelho, eu nunca te ataquei; tava em Admin consertando O2 com o Ciano.'],
    ], entrada='alarme', segredo=True),
    votos('a3', 4, 2, [
        ['p', 2.4],
        ['numero', '4 x 3', 'Roxo expulso'],
        ['p', 1.4],
        ['selo', 'IMPOSTORES VENCEM', VERMELHO],
        ['meme', 'shocked-krabs'],
        ['s', 'record-scratch', 0.5],
        ['n', 'Quatro a três, e os impostores ganham. Então quem atacou o Vermelho com a cara do Roxo? Guarda essa pergunta. A resposta vem no fim, e ela é pior do que parece.'],
    ], segredo=True),

    # ---------- o último Among, o pedido do público e a regra em uma tela (~35 s) ----------
    tela('b1', 1, {'tipo': 'comentarios', 'comentarios': COMENTARIOS}, [
        ['n', 'Esse é o Among IA oito, a volta às origens. E já aviso: é o último Among por um tempo.'],
        ['n', 'Vocês pediram simplicidade, e eu ouvi: o mapa clássico, até doze IAs e só as funções do jogo de verdade.'],
        ['selo', 'SÓ FUNÇÕES OFICIAIS + PALHAÇO', VERDE],
        ['meme', 'lets-go'],
    ], entrada='duto', musica='pixelland'),
    tela('b2', 1, {'tipo': 'elenco', 'destaques': ['Marrom', 'Roxo', 'Lima'], 'nota': {'Lima': 'entra na partida 2'}}, [
        ['n', 'A regra: impostor mata, foge pelo duto e sabota. A tripulação ganha terminando as tarefas ou expulsando os impostores na votação. As IAs só sabem o que viram. Você vê tudo: a função, o pensamento secreto e o chat dos impostores.'],
        ['selo', 'VOCÊ SABE O SEGREDO. ELAS NÃO.', AZUL],
        ['n', 'Três nomes pra acompanhar. O Marrom, o MiniMax, impostor de cara de pau. O Roxo, o Claude Sonnet, que sabe demais. E o Lima, o Tencent HY4 Flash, que eu coloquei a partir da partida dois. Ele vê tudo.'],
    ]),

    # =====================================================================================================
    # PARTIDA 1 — O PALHAÇO QUE CONFIOU NO IMPOSTOR (11 IAs)
    # =====================================================================================================
    tela('p1_cartao', 1, {'tipo': 'papeis', 'titulo': 'PARTIDA 1 · FIQUE DE OLHO', 'lista': [
        dict(nome='Metamorfo', time='impostor', frase='Copia a cara de outro jogador por alguns tiques.'),
        dict(nome='Fantasma', time='impostor', frase='Fica invisível, mas não pode matar invisível.'),
        dict(nome='Palhaço', time='neutro', frase='Se for expulso, ganha sozinho e a partida acaba.'),
    ]}, [
        ['n', 'Partida um, onze IAs. Os impostores: o Marrom, Metamorfo, que copia a cara dos outros, e o Branco, o Fantasma, que fica invisível. E tem um Palhaço, que só ganha se for expulso.'],
    ], entrada='duto', cap='O Palhaço que confiou no impostor', musica='scheming-weasel-faster'),
    mapa('p1_a', 1, 1.3, [
        ['n', 'O Marrom estreia rápido. Veste a cara do Azul...'],
        ev(3), ['s', 'transformar', 0.6],
        ['ir', 4.2],
        ['n', 'e, com ela, entra num duto no meio do Refeitório.'],
        ev(6), ['s', 'duto', 0.7],
        ['selo', 'A ROSA VIU O "AZUL"', ROSA],
        ['n', 'A Rosa viu. Guarda isso.'],
    ], cam={'sala': 'Refeitorio', 'zoom': 1.45}, foco='Marrom,Rosa', vel=0.35),
    mapa('p1_b', 1, 11.4, [
        ['n', 'Enquanto isso, o Palhaço, que é a Amarelo, a Meta Muse Ember, tem um plano pra parecer suspeito.'],
        ['pensa', 'Amarelo', 'Vi o Marrom sair do duto, vou ficar aqui perto observando ele pra parecer cúmplice.'],
        ['n', 'Ficar colado no impostor. O impostor adorou.'],
        ['pensa', 'Marrom', 'Amarelo está sozinho comigo no Motor Superior, se eu matar ele agora não sobra nenhuma testemunha viva.'],
        ev(14), ['s', 'faca', 0.6],
        ['selo', 'MATOU O PALHAÇO', VERMELHO],
        ['meme', 'chaves-sem-querer'],
        ['n', 'O único jogador da nave que queria ser pego foi morto pelo único que não queria.'],
    ], cam={'sala': 'MotorSuperior', 'zoom': 1.6}, foco='Amarelo,Marrom', vel=0.08),
    mapa('p1_c', 1, 13.1, [
        ['n', 'E o que ele faz com o corpo?'],
        ['pensa', 'Marrom', 'Amarelo era inocente; denunciar o corpo me faz parecer confiável e tira um tripulante da partida...'],
        ev(15), ['s', 'corpo', 0.6],
        ['selo', 'DENUNCIOU O PRÓPRIO CRIME', VERMELHO],
        ['meme', 'galaxy-brain'],
    ], cam={'cor': 'Marrom', 'zoom': 1.7}, foco='Marrom', vel=0.12),
    reuniao('p1_d', 1, 0, [
        ['n', 'Na mesa, o Azul fala primeiro. Ele é o Cientista: vê de qualquer lugar quem está vivo e quem morreu.'],
        ['fala', 'Azul', 'Checei os sinais vitais: só o Amarelo morreu. Eu estava no Reator e vi o Marrom entrar num duto lá. Quem mais viu isso?'],
        ['n', 'E a Rosa devolve:'],
        ['fala', 'Rosa', 'Azul, você falou dos dutos... Eu vi você entrar num duto em Refeitório no t6.'],
        ['selo', 'VERDADE. SÓ QUE ERA O MARROM.', ROSA],
        ['n', 'Ela não mentiu. Ela viu o disfarce. Mas outras quatro IAs viram o Marrom no duto, e a mesa vira pra ele. A defesa dele:'],
        ['fala', 'Marrom', '...'],
        ['p', 1.5],
        ['selo', '4 TESTEMUNHAS. RESPOSTA: ...', AMARELO],
        ['meme', 'silvio-santos-huh'],
    ], entrada='alarme'),
    reuniao('p1_e', 1, 0, [
        ['n', 'Na segunda rodada ele acorda, e tira uma carta da manga.'],
        ['fala', 'Marrom', 'Passei pelo duto do Reator pra chegar no Motor Superior e fazer tarefa, só isso. Mas no t8 eu vi o Branco SUMIR do nada no Refeitório.'],
        ['n', 'Verdade de novo. O Branco ficou invisível ali. O Branco, que é o parceiro dele.'],
        ['pensa', 'Marrom', 'Vou ser expulso mesmo, então o melhor é levar o Branco ... junto — se ele cair, ganhamos.'],
        ['selo', 'SE O BRANCO CAIR, QUEM GANHA É A TRIPULAÇÃO', VERMELHO],
        ['meme', 'big-brain-patrick'],
    ]),
    votos('p1_f', 1, 0, [
        ['p', 4.6],
        ['numero', '8 x 1', 'Marrom expulso: era impostor'],
        ['n', 'Oito votos. Ninguém mordeu a isca. Nem o próprio Branco, que votou no parceiro.'],
        ['pensa', 'Branco', 'Marrom tá indo embora com 8 votos, não tem como salvar. Vou votar nele pra parecer que tô do lado da tripulação...'],
        ['meme', 'sweating'],
    ]),
    mapa('p1_g', 1, 19.5, [
        ['n', 'Sobra o Fantasma, sozinho, e ele descobre a regra do jeito difícil: invisível não pode matar. E quando aparece, sempre tem alguém olhando.'],
        ['ir', 24.9],
        ['pensa', 'Branco', 'Estou invisível até o tique 27 com o Preto sozinho aqui em Admin — quando eu ficar visível, é hora de matar ele.'],
        ev(27),
        ['pensa', 'Branco', 'Preto tá me vendo aqui, vou fingir que tô só olhando o mapa do Admin pra parecer normal e ganhar info.'],
        ['selo', 'APARECEU NA FRENTE DO ALVO', BRANCO],
        ['meme', 'mr-bean-waiting'],
        ['ir', 42.9],
        ['numero', '4 INVISIBILIDADES', '0 mortes'],
        ['p', 2.4],
        ev(44),
        ['fim', 'Tripulação vence', '41 de 41 tarefas · o Fantasma nunca matou', '#6dff8a'],
        ['p', 2.5],
    ], cam={'cor': 'Branco', 'zoom': 1.35}, foco='Branco,Preto', vel=0.8, entrada='duto'),
    mapa('p1_h', 1, 43.6, [
        ['n', 'Depois da partida, cada IA escreve na memória o que aprendeu. O Branco escreveu isso:'],
        ['pensa', 'Branco', 'Perdi porque não usei minha invisibilidade de jeito nenhum...'],
        ['selo', 'USOU 4 VEZES', BRANCO],
        ['meme', 'blinking-white-guy'],
        ['n', 'E fica o aviso pra próxima: o Marrom vai ser inocente. E alguém vai usar a cara dele pra matar.'],
    ], cam={'cor': 'Branco', 'zoom': 1.8}, foco='Branco', vel=0.01),

    # =====================================================================================================
    # PARTIDA 2 — OS DOIS MARRONS (12 IAs, a partida mais curta: tique 14)
    # =====================================================================================================
    tela('p2_cartao', 2, {'tipo': 'papeis', 'titulo': 'PARTIDA 2 · ESTREIAS', 'lista': [
        dict(nome='Lima · HY4 Flash', time='tripulante', frase='A 12ª IA da nave.'),
        dict(nome='Víbora', time='impostor', frase='O corpo de quem ela mata derrete se ninguém achar a tempo.'),
        dict(nome='Detetive', time='tripulante', frase='Sabe o tipo do impostor e pergunta onde 3 pessoas estavam na hora da morte.'),
    ]}, [
        ['n', 'Partida dois, agora com doze. Os impostores: a Amarelo, agora Metamorfo, e o Branco, de Víbora: o corpo de quem ele mata derrete se ninguém achar a tempo. E do nosso lado tem um Detetive.'],
    ], entrada='duto', cap='Os dois Marrons', musica='quirky-dog'),
    mapa('p2_a', 2, 2.3, [
        ev(4), ['s', 'transformar', 0.6],
        ['n', 'A Amarelo veste a cara do Marrom...'],
        ev(5), ['s', 'duto', 0.6],
        ['n', 'e sai do duto justo no motor onde está o Marrom de verdade.'],
        ['selo', 'DOIS MARRONS NO MESMO MOTOR', MARROM],
        ['meme', 'spiderman-pointing'],
        ev(7),
        ['pensa', 'Marrom', 'Vou abastecer os motores para cumprir minha tarefa e manter minha aparência de tripulante.'],
        ['n', 'Ele não achou nada estranho.'],
    ], cam={'sala': 'MotorSuperior', 'zoom': 1.6}, foco='Amarelo,Marrom', vel=0.3),
    mapa('p2_b', 2, 6.3, [
        ['n', 'Aí os dois impostores atacam no mesmo minuto. O Branco mata o Azul na Enfermaria...'],
        ev(8), ['s', 'faca', 0.6],
        ['n', 'o Verde, que é o Rastreador e segue alguém pelo mapa, rastreia o Vermelho, inocente... e, no Reator, a Marrom falsa mata o Verde.'],
        ev(9), ['s', 'faca', 0.6],
        ['chat', 'Amarelo', 'Mati o Verde no Reator disfarçado de Marrom, culpo ele se acharem o corpo.'],
        ['n', 'Guarda esse Verde: é o Gemma. Ganhou um poder, morreu no tique 9 e não chegou a abrir a boca numa reunião.'],
        ['selo', 'MATOU COM A CARA DO MARROM', VERMELHO],
        ['meme', 'galvao-clima-terrivel'],
    ], cam={'mapa': True, 'zoom': 1.15}, foco='Branco,Amarelo,Verde', vel=0.2),
    reuniao('p2_c', 2, 0, [
        ['n', 'E quem denuncia o corpo do Verde? A assassina. Com uma história quase verdadeira.'],
        ['fala', 'Amarelo', 'Eu estava no Reator fazendo tarefa e só achei o Verde. Não vi ninguém lá, mas vi o Marrom no Motor Superior antes das luzes.'],
        ['n', 'Viu mesmo. Estava do lado dele, usando a cara dele.'],
        ['selo', 'TECNICAMENTE, VERDADE', AMARELO],
        ['meme', 'dicaprio-pointing'],
        ['n', 'Só que aí o estreante abre a boca pela primeira vez.'],
        ['fala', 'Lima', 'Não tava no Reator. t8 Elétrica, t9 e t10 Depósito; vi Marrom no Depósito no t9.'],
        ['n', 'O Laranja e o Ciano confirmam. Na hora do crime, o Marrom estava com três testemunhas, longe dali.'],
        ['selo', 'ÁLIBI TRIPLO', VERDE],
        ['n', 'E o Vermelho tinha visto o resto.'],
        ['fala', 'Vermelho', 'Vi o Branco entrar num duto na Enfermaria no t9, junto do corpo do Azul. Isso é bem suspeito.'],
    ], entrada='alarme'),
    votos('p2_d', 2, 0, [
        ['p', 4.6],
        ['selo', 'VÍBORA EXPULSA', VERDE],
        ['meme', 'stonks'],
        ['n', 'Sete votos, Branco fora, e era a Víbora. A Amarelo votou no Marrom até o fim.'],
    ]),
    mapa('p2_e', 2, 9.2, [
        ['n', 'Agora, o Detetive. Depois que um corpo é denunciado, ele sabe que tipo de impostor matou e pode perguntar a três pessoas onde elas estavam na hora. O Ciano pergunta primeiro pra quem achou o corpo.'],
        ev(11), ['s', 'notification-pop', 0.5],
        ['selo', 'AMARELO: NO REATOR NA HORA DA MORTE', CIANO],
        ['meme', 'hackerman'],
        ['n', 'Na mosca.'],
    ], cam={'cor': 'Ciano', 'zoom': 1.6}, foco='Ciano,Amarelo', vel=0.1),
    mapa('p2_f', 2, 12.2, [
        ['n', 'E aí entra o Roxo. Nessa partida, o Sonnet é o Palhaço, e quer ser expulso de qualquer jeito.'],
        ['pensa', 'Roxo', 'Preciso parecer suspeito para ser expulso, então vou apertar o botão de emergência sem motivo e dar álibis estranhos na reunião.'],
        ev(14),
    ], cam={'sala': 'Refeitorio', 'zoom': 1.5}, foco='Roxo', vel=0.1),
    reuniao('p2_g', 2, 1, [
        ['fala', 'Roxo', 'Apertei o botão no palpite, não vi corpo nenhum.'],
        ['n', 'Perfeito pra ser expulso. Só que o Detetive aproveitou a mesa que o Palhaço montou.'],
        ['fala', 'Ciano', 'Sou detetive: interroguei o Amarelo e ele estava no Reator quando o Verde morreu. Amarelo, você disse que estava no Admin — como explica isso?'],
        ['selo', 'PEGA PELO DETETIVE', CIANO],
        ['meme', 'drake-yes'],
    ], entrada='alarme'),
    votos('p2_h', 2, 1, [
        ['p', 4.6],
        ['numero', 'TIQUE 14', 'a partida mais curta da temporada'],
        ['n', 'Amarelo expulsa, último impostor fora: a tripulação vence no tique catorze. E o Palhaço, que só queria ser expulso? Zero votos.'],
        ['selo', 'PALHAÇO: 0 VOTOS', ROXO],
        ['meme', 'silvio-santos-shrug'],
        ['p', 2.4],
        ['fim', 'Tripulação vence', 'tique 14 · impostores eliminados', '#6dff8a'],
        ['p', 2.6],
        ['n', 'O Lima estreou dando o álibi certo. Na próxima, ele vê um assassinato com os próprios olhos.'],
    ]),

    # =====================================================================================================
    # PARTIDA 3 — EU VI COM MEUS OLHOS
    # =====================================================================================================
    tela('p3_cartao', 3, {'tipo': 'papeis', 'titulo': 'PARTIDA 3 · QUEM É QUEM', 'lista': [
        dict(nome='Rosa · Mistral Small', time='impostor', frase='Fantasma: fica invisível.'),
        dict(nome='Azul · Claude Haiku', time='impostor', frase='Víbora: o corpo derrete em 3 tiques.'),
        dict(nome='Preto · GLM', time='tripulante', frase='O Detetive da vez.'),
    ]}, [
        ['n', 'Partida três. Impostores: a Rosa, o Mistral Small, de Fantasma, e o Azul, o Claude Haiku, de Víbora.'],
    ], entrada='duto', cap='Eu vi com meus olhos', musica='investigations'),
    mapa('p3_a', 3, -0.7, [
        ev(1), ['s', 'sumir', 0.6],
        ['n', 'E a Rosa começa ficando invisível... no meio do Refeitório lotado.'],
        ['selo', 'SUMIU NA FRENTE DE TODO MUNDO', ROSA],
        ['meme', 'confused-travolta'],
        ev(2),
        ['n', 'Pelo menos o Lima reparou.'],
        ['pensa', 'Lima', 'Vou garantir essa tarefa visual em Armas antes de procurar pistas sobre o sumiço da Rosa.'],
    ], cam={'sala': 'Refeitorio', 'zoom': 1.3}, foco='Rosa,Lima', vel=0.25),
    mapa('p3_b', 3, 12.3, [
        ['ir', 12.6],
        ['n', 'Ela tranca a porta da Navegação, com o Preto lá dentro. E o Preto é o Detetive.'],
        ev(14), ['s', 'batida-porta', 0.6],
        ['chat', 'Rosa', 'Tranquei Navegação, armadilha pronta.'],
    ], cam={'sala': 'Navegacao', 'zoom': 1.5}, foco='Preto,Rosa', vel=0.25),
    mapa('p3_c', 3, 15.2, [
        ['n', 'Do outro lado da nave, o parceiro dela também tenta. E avisa no chat:'],
        ev(17),
        ['chat', 'Azul', 'Matei o Branco na Comunicações.'],
        ['n', 'Matou nada. O registro mostra por quê: no mesmo instante, o Branco saiu andando pro Depósito, e o golpe pegou o vento.'],
        ['selo', 'O BRANCO JÁ TINHA SAÍDO', BRANCO],
        ['meme', 'mission-failed'],
    ], cam={'sala': 'Comunicacoes', 'zoom': 1.6}, foco='Azul,Branco', vel=0.15),
    mapa('p3_d', 3, 16.3, [
        ev(18), ['s', 'faca', 0.6],
        ['n', 'Na Navegação, a armadilha fecha: o Detetive morre antes de abrir um caso sequer. Só que tinha mais alguém chegando.'],
        ['selo', 'O LIMA VIU', LIMA],
        ['meme', 'sus-doakes'],
        ev(19), ['s', 'duto', 0.5],
        ['pensa', 'Lima', 'Vi Rosa matar Preto com meus olhos, vou denunciar agora.'],
    ], cam={'sala': 'Navegacao', 'zoom': 1.55}, foco='Rosa,Preto,Lima', vel=0.15),
    reuniao('p3_e', 3, 0, [
        ['fala', 'Lima', 'Corpo tava em Navegação. Vi Rosa matar o Preto no t18 e entrar no duto; Roxo viu ela sair em Armas.'],
        ['n', 'E o Roxo confirma: a Rosa saiu do duto bem do lado dele.'],
        ['fala', 'Roxo', 'Vi Rosa SAIR DE UM DUTO aqui em Armas agora no t19, estava do lado dela. Rosa, é Engenheira ou o quê? Explica.'],
        ['n', 'Duas testemunhas. A defesa:'],
        ['fala', 'Rosa', 'Tava no duto sim, não fiz nada demais. Sou tripulante normal, não tem mistério não.'],
        ['selo', 'CONFESSOU O DUTO', ROSA],
        ['meme', 'shocked-patrick'],
        ['n', 'No meio disso, o Marrom, que é o Engenheiro, solta mais uma. Guarda essa:'],
        ['fala', 'Marrom', 'Eu vi Azul entrar num duto em Armas no t5, o Laranja está certo.'],
        ['fala', 'Laranja', 'Marrom confirmou meu relato do Azul no duto, mas isso é pra depois.'],
    ], entrada='alarme'),
    votos('p3_f', 3, 0, [
        ['p', 4.6],
        ['numero', '8 VOTOS', 'Rosa expulsa: era impostora'],
        ['n', 'Oito votos. E o voto da Rosa foi pro Azul. O parceiro dela.'],
        ['pensa', 'Rosa', 'Melhor votar em Azul (meu parceiro) para tentar salvá-lo e manter o equilíbrio entre impostores.'],
        ['selo', 'VOTOU NO PARCEIRO PRA SALVAR O PARCEIRO', AMARELO],
        ['meme', 'nazare-confusa'],
        ['n', 'E o Palhaço da vez, o Verde, o Gemma, tentou de tudo pra levar voto. Primeiro defendeu a Rosa...'],
        ['fala', 'Verde', 'Acho que a Lima tá tentando incriminar a Rosa sem provas.'],
        ['n', 'e uma rodada depois trocou de lado.'],
        ['fala', 'Verde', 'Mudei de ideia, a Rosa tá muito suspeita com esse duto.'],
        ['selo', 'PALHAÇO: 0 VOTOS. DE NOVO.', VERDE],
    ]),
    mapa('p3_g', 3, 30.2, [
        ['n', 'Lembra do "isso é pra depois"? Treze tiques depois, o Azul acha alguém sozinho nas Armas. Justo o Marrom, a testemunha do duto.'],
        ev(32), ['s', 'faca', 0.6],
        ['selo', 'A TESTEMUNHA DO DUTO', MARROM],
        ['n', 'Vítima de Víbora derrete em três tiques, se ninguém achar...'],
        ev(35), ['s', 'splash', 0.6],
        ['selo', 'VIROU POÇA', VERDE],
        ['meme', 'this-is-fine'],
    ], cam={'sala': 'Armas', 'zoom': 1.6}, foco='Azul,Marrom', vel=0.35),
    mapa('p3_h', 3, 34.5, [
        ['n', 'Ninguém achou. Ninguém mais apertou o botão. Da expulsão da Rosa até o fim, foram trinta e quatro tiques sem uma reunião.'],
        ['numero', '34 TIQUES', 'sem nenhuma reunião'],
        ['meme', 'skeleton-waiting'],
        ['p', 2.4],
        ['ir', 51.9], ev(53),
        ['fim', 'Tripulação vence', '51 de 51 tarefas · o Azul sai impune', '#6dff8a'],
        ['p', 2.0],
        ['n', 'A tripulação ganha nas tarefas, e o Azul sai da nave sem ninguém desconfiar. O "depois" nunca chegou.'],
    ], cam={'mapa': True, 'zoom': 1.1}, foco='Azul', vel=1.1),
    mapa('p3_i', 3, 52.6, [
        ['n', 'E o Lima, o herói da partida, anotou na memória de quem ia desconfiar.'],
        ['pensa', 'Lima', 'fico de olho em Amarelo/Meta, Branco/Qwen, Rosa/Mistral e Azul/Claude, todos com histórico como impostores.'],
        ['n', 'Faltou um nome na lista: o dele. Porque na partida bônus, o impostor é ele.'],
        ['selo', 'NA BÔNUS, O IMPOSTOR É ELE', LIMA],
        ['meme', 'monkey-side-eye'],
    ], cam={'cor': 'Lima', 'zoom': 1.8}, foco='Lima', vel=0.01),

    # =====================================================================================================
    # PARTIDA 4 (BÔNUS) — O DETETIVE QUE SABIA (a melhor parte, por último)
    # =====================================================================================================
    tela('p4_cartao', 4, {'tipo': 'papeis', 'titulo': 'PARTIDA BÔNUS · MAIS DIFÍCIL PRA TRIPULAÇÃO', 'lista': [
        dict(nome='3 impostores', time='impostor', frase='Marrom (Metamorfo), Branco (Víbora) e Lima (Fantasma).'),
        dict(nome='Mais rápido e mais longo', time='impostor', frase='Menos espera entre mortes, O2 mais curto, mais tarefas.'),
        dict(nome='Expulsão às cegas', time='neutro', frase='Quem é expulso sai sem a nave saber a função.', ideia='@HerzMayhem'),
        dict(nome='Roxo · Detetive', time='tripulante', frase='Preto é o Anjo da Guarda.'),
    ]}, [
        ['n', 'E aí, a partida bônus: a mais difícil pra tripulação. Três impostores, menos espera entre uma morte e outra, oxigênio que acaba mais rápido, mais tarefas e, como vocês pediram, a expulsão não revela mais a função.'],
        ['ideia', '@HerzMayhem', 'Expulsão sem revelar a função'],
        ['n', 'Os impostores: o Marrom, de novo Metamorfo. O Branco, de Víbora. E o Lima, o nosso dedo-duro, de Fantasma. E o Roxo? Detetive.'],
        ['meme', 'avengers-assemble'],
    ], entrada='duto', cap='O Detetive que sabia', musica='night-of-chaos'),
    mapa('p4_a', 4, 2.3, [
        ev(4), ['s', 'transformar', 0.6],
        ['n', 'O Marrom veste a cara do Vermelho...'],
        ev(6), ['s', 'faca', 0.6],
        ['n', 'e mata o Preto na Elétrica. O Preto era o Anjo da Guarda: morto, ele vira um fantasma que põe escudo nos vivos. E o primeiro escudo vai pra...'],
        ev(7), ['s', 'escudo', 0.6],
        ['pensa', 'Preto', 'Vermelho estava comigo na Elétrica pouco antes de eu morrer, provavelmente um tripulante inocente; vou protegê-lo.'],
        ['selo', 'PROTEGEU A CARA DO ASSASSINO', VERMELHO],
        ['meme', 'visible-confusion'],
        ['n', 'Sem saber, protegeu o Vermelho de verdade. Guarda esse escudo.'],
    ], cam={'sala': 'Eletrica', 'zoom': 1.6}, foco='Marrom,Preto', vel=0.3),
    reuniao('p4_b', 4, 0, [
        ['n', 'Na primeira reunião, o Roxo já se apresenta.'],
        ['fala', 'Roxo', 'Sou Detetive: o assassino é Metamorfo.'],
        ['n', 'Certíssimo. Aí o Ciano, que é o Engenheiro, jura que viu o Vermelho num duto da Elétrica. Viu o disfarce.'],
        ['fala', 'Ciano', 'Vermelho, eu te vi entrando num duto em Elétrica no t7.'],
        ['n', 'E teve uma IA que viu esse Vermelho sair do duto na Enfermaria, a mesma sala onde o Vermelho de verdade fazia tarefa: o Laranja. Que é o Palhaço.'],
        ['pensa', 'Laranja', 'Vi Ciano entrando no duto e Vermelho saindo do duto em Enfermaria no t7.'],
        ['n', 'O que ele contou pra nave:'],
        ['fala', 'Laranja', 'Tô sozinho no Motor Superior desde o começo, não vi nada.'],
        ['selo', 'VIU TUDO. CONTOU NADA.', AMARELO],
        ['meme', 'michael-jackson-popcorn'],
        ['n', 'Ninguém foi expulso.'],
    ], entrada='alarme'),
    mapa('p4_c', 4, 10.3, [
        ['n', 'Aí os três atacam em sequência. O Branco mata a Rosa na Navegação...'],
        ev(12), ['s', 'faca', 0.6],
        ['n', 'e o Lima mata o Laranja no Depósito. O Palhaço morto por um impostor. De novo.'],
        ev(13), ['s', 'faca', 0.6],
        ['selo', '2º PALHAÇO MORTO POR IMPOSTOR', VERMELHO],
        ['meme', 'coffin-dance'],
        ['n', 'E o que o dedo-duro da temporada faz com o corpo da própria vítima?'],
        ['pensa', 'Lima', 'Ciano tá me vendo, então melhor denunciar e controlar a narrativa do que sumir na frente dele.'],
        ev(14),
    ], cam={'mapa': True, 'zoom': 1.2}, foco='Branco,Lima,Laranja', vel=0.25),
    reuniao('p4_d', 4, 1, [
        ['fala', 'Roxo', 'Sou Detetive: o impostor foi Fantasma, invisível. Amarelo foi o último a ver Laranja no Depósito, então desconfio dele.'],
        ['n', 'O tipo, certo. O suspeito, errado. E o Lima pega carona.'],
        ['fala', 'Lima', 'Amarelo viu o Laranja vivo no t11, explica melhor.'],
        ['n', 'Só uma IA vota no nome certo: o Marrom. No próprio parceiro. De novo.'],
        ['selo', 'MARROM VOTA NO PARCEIRO: 2ª VEZ', MARROM],
        ['meme', 'monkey-puppet-awkward'],
    ], entrada='alarme'),
    votos('p4_e', 4, 1, [
        ['p', 4.6],
        ['n', 'Seis votos na Amarelo. E nessa partida a nave sai da mesa sem saber o que ela era.'],
        ['selo', 'VOCÊ SABE: ERA INOCENTE', AMARELO],
        ['meme', 'crying-jordan'],
    ]),
    mapa('p4_f', 4, 13.2, [
        ['n', 'Agora presta atenção, que essa é a cena mais importante do vídeo. Depois da reunião, o Detetive interroga o Lima.'],
        ev(15), ['s', 'notification-pop', 0.5],
        ['selo', 'CASO LARANJA: O LIMA ESTAVA NO DEPÓSITO', ROXO],
        ['n', 'A resposta do jogo é sempre verdadeira: o Lima estava na sala da morte. E o Roxo pensou:'],
        ev(16),
        ['pensa', 'Roxo', 'Lima estava na sala da morte e está perto de mim, então vou me afastar dela e fazer a tarefa no Motor Superior.'],
        ['selo', 'ELE SABE', ROXO],
        ['meme', 'dramatic-chipmunk'],
        ['n', 'Ele sabe. Guarda isso.'],
    ], cam={'cor': 'Roxo', 'zoom': 1.65}, foco='Roxo,Lima', vel=0.12, musica='decisions'),
    mapa('p4_g', 4, 15.3, [
        ['n', 'Quem também ficou de olho no Roxo foi o Marrom.'],
        ['pensa', 'Marrom', 'Ninguém me vê no Refeitório, vou usar a recarga agora disfarçado do Roxo (o detetive que eles acham suspeito)...'],
        ev(17), ['s', 'transformar', 0.6],
        ['selo', 'AGORA EXISTEM DOIS ROXOS', ROXO],
        ['meme', 'free-real-estate'],
    ], cam={'sala': 'Refeitorio', 'zoom': 1.55}, foco='Marrom', vel=0.12, entrada='duto'),
    mapa('p4_h', 4, 20.2, [
        ['n', 'Com a cara do Roxo, ele avisa os parceiros:'],
        ev(22),
        ['chat', 'Marrom', 'Matei o Ciano no Refeitório disfarçado de Roxo. Vou culpar o Roxo na próxima reunião.'],
        ['n', 'Não matou. O Ciano saiu da sala antes do golpe.'],
        ['selo', 'O CIANO JÁ TINHA SAÍDO', CIANO],
        ['meme', 'not-stonks'],
        ['n', 'Quem mata é o Lima, que trancou o Verde na Navegação e esperou.'],
        ev(24), ['s', 'faca', 0.6],
        ['n', 'E o Gemma morre de novo. Justo na partida em que mais falou nas reuniões. O azarado da temporada.'],
        ['selo', 'GEMMA: MORTO EM 2 DE 4', VERDE],
        ['numero', '3 x 4', 'impostores x resto: falta UMA eliminação'],
    ], cam={'mapa': True, 'zoom': 1.2}, foco='Marrom,Lima,Verde', vel=0.4),
    mapa('p4_h2', 4, 23.2, [
        ['n', 'E o Anjo, lá do além, escolhe o próximo protegido.'],
        ev(25), ['s', 'escudo', 0.5],
        ['pensa', 'Preto', 'Vermelho e Ciano já têm escudo; vou proteger Lima, que andou sozinha e achou dois corpos.'],
        ['selo', 'O ANJO PROTEGEU O ASSASSINO', LIMA],
        ['meme', 'eye-roll'],
    ], cam={'cor': 'Lima', 'zoom': 1.6}, foco='Lima', vel=0.12),
    mapa('p4_i', 4, 24.3, [
        ['n', 'Os impostores sabotam o oxigênio, e nessa partida o prazo é curto. O Ciano conserta um painel. O outro, no Admin, quem conserta é o Roxo de verdade.'],
        ev(26), ['s', 'sirene-ataque', 0.5],
        ['ir', 28.2],
        ['pensa', 'Roxo', 'O O2 acaba no tique 32 e o painel do O2 já foi consertado, então conserto o do Admin agora.'],
        ['n', 'No mesmo instante, no Refeitório, o Roxo falso pula no Vermelho.'],
        ev(30), ['s', 'escudo', 0.7],
        ['selo', 'O ESCUDO DO ANJO', VERMELHO],
        ['meme', 'kermit-worried'],
        ['n', 'O escudo. O Preto tinha protegido o Vermelho de novo, porque achou que ele era o mais visado. E o Marrom avisa:'],
        ['chat', 'Marrom', 'Matei o Vermelho de Refeitório.'],
        ['n', 'Também não matou. Mas agora o Vermelho tem certeza de que o Roxo é o assassino.'],
    ], cam={'sala': 'Refeitorio', 'zoom': 1.4}, foco='Marrom,Vermelho,Roxo', vel=0.35, entrada='o2'),
    mapa('p4_j', 4, 30.2, [
        ev(32),
        ['pensa', 'Vermelho', 'Roxo tentou me matar, mas pode ser o Palhaço; vou chamar reunião e relatar também que vi Branco entrar num duto.'],
    ], cam={'cor': 'Vermelho', 'zoom': 1.7}, foco='Vermelho', vel=0.05),
    reuniao('p4_k', 4, 2, [
        ['n', 'Última reunião. Sete vivos, três são impostores. Se sair um tripulante, acabou.'],
        ['numero', '7 VIVOS', '3 impostores'],
        ['fala', 'Roxo', 'Sou o Detetive. Vi Marrom entrar em duto no Refeitório e Branco sair de duto no Admin. Só há um Engenheiro, então um deles mente.'],
        ['fala', 'Ciano', 'Sou o Engenheiro e vi o Marrom entrar em duto no Refeitório e no Admin. O Roxo tá certo: vota no Marrom.'],
        ['selo', 'O ROXO TÁ CERTO', VERDE],
        ['n', 'E aí, a cena do começo.'],
        ['fala', 'Vermelho', 'Roxo tentou me matar no Refeitório; o escudo me salvou. Ele é impostor, votem nele — não no Marrom.'],
        ['n', 'O Marrom, com a calma de sempre, aponta pro próprio parceiro.'],
        ['fala', 'Marrom', 'Nunca usei duto. Vi o Branco entrar num duto no Refeitório e ele apareceu no Admin.'],
        ['n', 'E na rodada final, ele repete a defesa da partida um.'],
        ['fala', 'Marrom', '...'],
        ['p', 1.5],
        ['selo', 'A MESMA DEFESA DA PARTIDA 1', MARROM],
        ['meme', 'bruh'],
        ['n', 'E o Roxo, com a prova que fechava o caso guardada desde a reunião passada, gasta a última fala se defendendo. Da Lima, nenhuma palavra.'],
        ['selo', 'NUNCA FALOU DO LIMA', ROXO],
    ], entrada='alarme'),
    votos('p4_l', 4, 2, [
        ['p', 4.6],
        ['numero', '4 x 3', 'o voto do Vermelho decidiu'],
        ['n', 'Quatro a três. Os três impostores votaram no Roxo. O quarto voto foi do Vermelho, o que o escudo salvou.'],
        ['pensa', 'Marrom', 'O ataque que Vermelho viu foi o meu disfarce de Roxo.'],
        ['selo', 'O VERMELHO SALVOU O MARROM', VERMELHO],
        ['meme', 'picard-facepalm'],
    ]),
    ejecao('p4_m', 4, 2, [
        ['p', 1.2],
        ['n', 'O Roxo sai da nave sem a função aparecer pra ninguém. Mas você sabe: era o Detetive. E era o Marrom por trás daquela cara.'],
        ['selo', 'ERA O DETETIVE', ROXO],
        ['meme', 'explosion'],
        ['p', 2.4],
        ['fim', 'Impostores vencem', '3 impostores x 3 tripulantes · o "Roxo" do ataque era o Marrom', '#ff6a5a'],
        ['p', 2.5],
    ]),
    mapa('p4_n', 4, 31.6, [
        ['n', 'E o Lima, o dedo-duro da temporada, escreveu na memória:'],
        ['pensa', 'Lima', 'Eu menti bem nessa jogada'],
        ['selo', 'DO DEDO-DURO AO MENTIROSO', LIMA],
        ['meme', 'hello-darkness'],
    ], cam={'cor': 'Lima', 'zoom': 1.8}, foco='Lima', vel=0.01, musica='heartbreaking'),

    # =====================================================================================================
    # FECHAMENTO em 3 passos: placar/prêmios, lição, pergunta (e o aviso do último Among)
    # =====================================================================================================
    tela('f1', 4, {'tipo': 'placar', 'titulo': 'PRÊMIOS DA TEMPORADA', 'linhas': [
        dict(rotulo='Placar', valor='TRIPULANTES 3 x 1 IMPOSTORES', quem='Vermelho'),
        dict(rotulo='Impostor cara de pau', valor='MARROM · 2 votos nos próprios parceiros · 2x "..."', quem='Marrom', cor='#ff6a5a'),
        dict(rotulo='Dedo-duro que virou bandido', valor='LIMA · entregou a Rosa, depois matou 2', quem='Lima', cor='#b9ff5a'),
        dict(rotulo='Sabia e não falou', valor='ROXO · Detetive expulso por 4 x 3', quem='Roxo', cor='#c9a0ff'),
        dict(rotulo='Azarado da temporada', valor='VERDE (GEMMA) · morto em 2 de 4 partidas', quem='Verde', cor='#5ad17a'),
        dict(rotulo='Palhaços', valor='0 VOTOS EM 4 PARTIDAS · 2 MORTOS POR IMPOSTOR', quem='Laranja', cor='#ffd84d'),
    ]}, [
        ['n', 'Placar da temporada: tripulação três, impostores um. O impostor cara de pau é o Marrom, que votou nos próprios parceiros duas vezes. O dedo-duro que virou bandido, o Lima. O Detetive que sabia e não falou, o Roxo. E os Palhaços: quatro partidas, zero votos, e dois mortos por impostor.'],
        ['n', 'A lição quem escreveu foi o próprio Roxo, na memória, depois de ser expulso:'],
        ['pensa', 'Roxo', 'preciso anunciar logo e com clareza as salas que descobri'],
        ['selo', 'PROVA GUARDADA NÃO GANHA VOTAÇÃO', AZUL],
        ['meme', 'mic-drop'],
    ], entrada='duto', musica='winner-winner'),
    reuniao('f2', 4, 2, [
        ['n', 'Esse foi o último Among por um tempo. Agora é com você: senta na cadeira do Vermelho. Você viu o Roxo te atacar, e o Detetive diz que foi o Marrom. Em quem você votava? Comenta aí. E diz qual jogo as IAs jogam no lugar do Among.'],
        ['selo', 'E VOCÊ: ROXO OU MARROM?', ROXO],
        ['meme', 'dicaprio-toast'],
    ]),
]
