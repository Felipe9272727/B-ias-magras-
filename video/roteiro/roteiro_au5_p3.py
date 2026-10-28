# -*- coding: utf-8 -*-
"""Partida 3 do vídeo = amongus/logs5/partida4.json (o Traidor mata a Víbora e o Casal morre junto, o Glutão come um
impostor, a Prefeita blindada pelo Médico, o recado do além errado que vira desculpa, e o último impostor que mata
no tique em que as tarefas acabam). Falas e pensamentos copiados do log. Usado por roteiro_au5.partida3()."""


def cenas(h):
    comp, jogo, selo, credito, reuniao = h['comp'], h['jogo'], h['selo'], h['credito'], h['reuniao']
    N, CH = h['fac']('p3')
    return [
        h['cartao']('p3', 3, 'O TRAIDOR VOLTA · GLUTÃO · PALHAÇO', '#ef7d0d', 'Partida três.'),
        N('p3a', comp('AU5Casal', a='Lima', b='Rose', timeA='impostor', timeB='tripulante'),
          'O Casal: o Lima e a Rose. [[s:coracao:0.5]] O Lima é impostor, a Víbora. E nessa partida também tem um Traidor. Já dá pra imaginar.', min=6),
        CH('p3b', reuniao(3, 0), [
            ('N', 'Tique dois. Ninguém morreu ainda, e o Vermelho aperta o botão. O Vermelho é o Palhaço: ganha se for expulso.'),
            ('Vermelho', 'Apertei porque ouvi passos correndo na direção do Admin. E esse Lima montando álibi pra todo mundo é esquema demais, tô desconfiado dele.'),
            ('pensa:Vermelho', 'Sou o Palhaço: preciso ser expulso, sem confessar.'),
        ]),
        CH('p3c', reuniao(3, 0), [
            ('N', 'Ninguém comprou. Então ele apelou:'),
            ('Vermelho', 'Cansado desse teatro de álibi. Se o Lima é inocente mesmo, então votem em mim: eu não vou me calar e sair absolvido hoje.'),
            ('Bordo', 'Quem pede para ser votado assim tá querendo nos pegar. Sem corpo e sem prova, pulo — e não votem no Vermelho.'),
            ('N', 'Zero votos nele. [[m:sad-pablo:right:1.4]]'),
        ]),
        N('p3d', jogo(3, 'Azul', evento={'tipo': 'morte', 'vitima': 'Lima'}, antes=3.5,
                      ancoras=[({'tipo': 'morte', 'vitima': 'Lima'}, 'mata')],
                      selos=[selo('O CASAL MORRE JUNTO', 'rose', 'carimbo', cor='#e0457b', dur=70)]),
          'Tique três. O Azul é o Traidor. E mata o Lima, no meio do Escritório. [[s:faca:0.6]] Era a Víbora, impostor. Só que o Lima era casal da Rose... e a Rose cai junto. [[s:coracao:0.5]] [[m:crying-jordan:right:1.6]]', min=9),
        CH('p3e', reuniao(3, 1), [
            ('N', 'Só que tinha gente demais olhando.'),
            ('Rosa', 'Eu também VI o Azul matar o Lima no Escritório no t3, com meus olhos. Muita gente confirmando o mesmo. Voto nele.'),
            ('Azul', 'Eu não matei o Lima, estava fingindo tarefa. Roxo estava do lado do corpo e Branco quer votar antes de checar. Quem viu o Coral se mexer?'),
            ('pensa:Azul', 'Eu matei o Lima, então preciso me proteger sem me entregar. Roxo e Branco são impostores e estavam perto do corpo.'),
        ]),
        N('p3f', comp('AU5Ejecao', partida=3, indice=1),
          'E o Traidor saiu no tique quatro. [[s:wrong-buzzer:0.5]] Levou um impostor, mas foi junto. [[m:goodbye-see-ya:right:1.4]]', min=5.5),
        N('p3g', jogo(3, 'Caqui', evento={'tipo': 'morte', 'vitima': 'Ciano'}, antes=3,
                      ancoras=[({'tipo': 'morte', 'vitima': 'Ciano'}, 'come')],
                      selos=[credito('GLUTÃO · ideia de @Tinanossauro', 'glutao', 150),
                             selo('ERA IMPOSTOR', 'come', 'carimbo', cor='#0d8a2a', dur=60)]),
          'Tique quatorze. O Caqui é o Glutão, um neutro que engole gente. Ele pega o Ciano sozinho no Admin e come. [[s:nhac:0.7]] Sem corpo. E o Ciano era o Apostador, impostor. [[m:im-hungry-cat:right:1.6]]', min=9),
        CH('p3h', jogo(3, 'Roxo', evento={'tipo': 'recrutamento', 'cor': 'Roxo'}, antes=3,
                       selos=[selo('RECRUTADO', 'recruta', 'carimbo', cor='#c0262d', dur=60)]), [
            ('N', 'Tique quinze. O Roxo, o Gangster, recruta o Amarelo, o Influencer:'),
            ('Roxo', 'Amarelo: você foi recrutado, agora é impostor.'),
        ]),
        CH('p3i', jogo(3, 'Rosa', evento={'tipo': 'escudo', 'vitima': 'Rosa', 'assassino': 'Branco'}, antes=3,
                       ancoras=[({'tipo': 'escudo', 'vitima': 'Rosa', 'assassino': 'Branco'}, 'ataca')],
                       selos=[selo('BLOQUEADO', 'bloqueado', 'carimbo', cor='#0d8a2a', dur=50)]), [
            ('N', 'A Rosa é a Prefeita: o voto dela vale dois. E o Banana, o Médico, decidiu que ela não morre. Escudo nela quase todo tique. Tique vinte e quatro: o Branco ataca. [[s:escudo:0.6]] Bloqueado.'),
            ('Branco', 'Rosa estava protegida; meu ataque falhou. Vou agir na Nave de Pouso.'),
        ]),
        N('p3j', jogo(3, 'Rosa', evento={'tipo': 'escudo', 'vitima': 'Rosa', 'assassino': 'Caqui'}, antes=3,
                      ancoras=[({'tipo': 'escudo', 'vitima': 'Rosa', 'assassino': 'Caqui'}, 'tenta')],
                      selos=[selo('BLOQUEADO DE NOVO', 'bloqueado', 'carimbo', cor='#0d8a2a', dur=50)]),
          'Tique vinte e oito: o Glutão tenta comer a Rosa. [[s:escudo:0.6]] Bloqueado de novo. Mas no mesmo tique, o Branco mata a Coral e o Amarelo mata o Cinza, o Xerife. [[m:this-is-fine:right:1.6]]', min=9),
        CH('p3k', reuniao(3, 2), [
            ('Rosa', 'Branco tentou me matar no t24 no Laboratório, e agora t29 apareceu do nada em Nave de Pouso, na sala do corpo de Coral. Suspeitíssimo. E Caqui tentou me matar no t28 também!'),
            ('Banana', 'Confirmo: coloquei escudo na Rosa e recebi os alertas das duas tentativas. Caqui e Branco são suspeitos fortes.'),
            ('N', 'E o Palhaço, tentando ser expulso de qualquer jeito:'),
            ('Vermelho', 'Marrom encostou em Coral no Laboratório t28. E eu... o sismógrafo sussurra comigo, juro. Se quiserem me expulsar, eu aceito.'),
            ('N', 'Oi? [[m:visible-confusion:right:1.6]]'),
        ]),
        N('p3l', comp('AU5Ejecao', partida=3, indice=2),
          'Sai o Branco. [[s:revela_impostor:0.5]] O Chato, impostor! A Prefeita blindada tá limpando a nave. [[m:success-kid:right:1.4]]', min=5.5),
        CH('p3m', reuniao(3, 3, selos=[selo('RECADO DO ALÉM (t23): "...estava disfarçado com a cor dele. Tem disfarçado na base."', 0, cor='#6b4fd1', dur=200)]), [
            ('N', 'No tique seguinte, a Rosa chama outra reunião, contra o Caqui. Só que antes, o Bordo, que morreu, virou o Influencer Fantasma: manda recados anônimos do além. E mandou um... errado. Disse que tinha alguém disfarçado.'),
            ('N', 'E o Caqui usou isso:'),
            ('Caqui', 'Não fui eu! O recado do além avisou que tem disfarçado — usaram minha cor pra me incriminar. Confiem nisso.'),
            ('N', 'Não colou. [[m:drake-no:right:1.4]]'),
        ]),
        N('p3n', comp('AU5Ejecao', partida=3, indice=3),
          'O Glutão foi expulso. [[s:wrong-buzzer:0.4]] Ele não era impostor, mas já tinha comido um. [[m:im-hungry-cat:right:1.4]]', min=5),
        CH('p3o', jogo(3, 'Amarelo', evento={'tipo': 'escudo', 'vitima': 'Rosa', 'assassino': 'Amarelo', 'sala': 'Descontaminacao'}, antes=4,
                       ancoras=[({'tipo': 'escudo', 'vitima': 'Rosa', 'assassino': 'Amarelo', 'sala': 'Descontaminacao'}, 'tenta')],
                       selos=[selo('ATAQUES NA ROSA: 4 · MORTES: 0', 'tenta', 'carimbo', cor='#0d8a2a', dur=80)]), [
            ('N', 'Aí o Amarelo, o recrutado, tenta a Rosa no tique quarenta e um. Bloqueado. E no quarenta e quatro, preso com ela na descontaminação, tenta de novo. [[s:escudo:0.6]]'),
            ('Amarelo', 'Estou preso na descontaminação com Rosa; tentei matá-la antes, mas tinha escudo. Não conserte o sismógrafo.'),
            ('N', 'Aí ele desiste da Rosa e tenta matar o Médico. E quem salva o Médico... é o Anjo da Guarda. A Rose. Que morreu de tristeza no tique três. [[m:dicaprio-toast:right:1.6]]'),
        ]),
        CH('p3p', reuniao(3, 4), [
            ('N', 'Tique cinquenta. O Banana chama reunião.'),
            ('Rosa', 'Gente, AMARELO tentou me matar DUAS vezes (t41 em Elétrica e t44 em Descontaminação) e o escudo me salvou. É impostor, voto nele!'),
            ('Banana', 'Amarelo também TENTOU ME MATAR no t47 em Descontaminação, o escudo me salvou. Ele atacou Rosa duas vezes e agora eu. É impostor, voto nele!'),
            ('Amarelo', 'Nego os ataques. Vi Rosa na Descontaminação no t43 e Banana no t46, mas proximidade não prova que ataquei. Por que não denunciaram antes?'),
        ]),
        N('p3q', comp('AU5Ejecao', partida=3, indice=4),
          'Expulso. [[s:revela_impostor:0.5]] Agora só sobrou o Roxo, o Gangster. Sozinho contra sete. [[m:sweating:right:1.4]]', min=5),
        CH('p3r', jogo(3, 'Roxo', evento={'tipo': 'morte', 'vitima': 'Laranja'}, antes=7,
                       ancoras=[({'tipo': 'sabotagem', 'cor': 'Roxo', 'subtipo': 'Luzes'}, 'apaga'), ({'tipo': 'morte', 'vitima': 'Laranja'}, 'mata')],
                       selos=[selo('TAREFAS: 100%', 'mesmo', 'carimbo', cor='#0d8a2a', dur=90)]), [
            ('Roxo', 'Preso na Desc2 com Verde me vendo, não consigo matar. Sismógrafo já foi consertado no t47. Preciso de plano B.'),
            ('N', 'Quinze tiques depois, o plano B: tique sessenta e cinco, ele apaga as luzes. Tique sessenta e seis, pega o Laranja sozinho no Admin e mata. [[s:faca:0.6]]'),
            ('N', 'Só que, nesse mesmo tique, a nave termina a última tarefa. [[s:tarefa:0.6]] [[m:mr-bean-waiting:right:1.6]]'),
        ]),
        *h['fim_partida']('p3', 3, 'Rosa',
                          'Vitória dos tripulantes, pelas tarefas. [[s:vitoria:0.5]] A Rosa levou quatro ataques e chegou viva no fim.',
                          'Fim da partida três.', '#ef7d0d'),
    ]
