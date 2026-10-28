# -*- coding: utf-8 -*-
"""Cenas extras de reunião do AU5 (pedido do Felipe: "o Amarelo foi expulso, mas a gente nem sabe o porquê").
Escolhidas por um Sonnet a partir de todas as falas dos logs; falas e pensamentos copiados (conferidos por
video/scripts/confere_reunioes_au5.py). EXTRAS: id da cena existente -> cenas que entram logo depois dela."""

# (id novo, partida do vídeo, índice da reunião, falas)
EXTRAS = {
    'p1d': [('p1d2', 1, 0, [
        ('N', 'Só que a votação não era sobre o corpo. Era sobre a Elétrica: no tique cinco, ninguém concordava sobre quem estava lá.'),
        ('Amarelo', 'No t5 eu estava na Elétrica com Vermelho e Lima. Azul, o que você viu ao encontrar o corpo?'),
        ('Vermelho', 'No t5 eu estava na Elétrica e vi só Amarelo e Bordo, não Lima. Amarelo, você pode explicar isso?'),
        ('Bordo', 'No t5 vi Vermelho e Lima perto de mim, não vi Amarelo. Amarelo, onde você estava exatamente?'),
        ('N', 'Três pessoas, três versões. E o Marrom, o Segurança, ainda diz que as câmeras mostram o Vermelho e o Lima na Nave de Pouso. [[m:confused-travolta:right:1.6]] Treze votos no Amarelo.'),
    ])],
    'p1f': [('p1f2', 1, 1, [
        ('N', 'O Preto aparece morto no Admin. E a Coral chega colada no corpo, já sabendo que ele morreu no tique onze. [[m:side-eye-dog:right:1.6]]'),
        ('Coral', 'Eu estava no Escritório no t12 e fui ao Admin no t13. Vi nos vitais que Preto já estava morto no t11.'),
        ('N', 'A Coral se explicou. Aí a nave virou pro Marrom, o Segurança que tinha ficado no Admin com o Preto.'),
        ('Rosa', 'O buraco do Marrom entre t9 e t12 é grave: ele estava com o Preto no Admin e some justo nesse meio-tempo.'),
        ('N', 'E quem empurrava isso por trás?'),
        ('pensa:Branco', 'Caqui matou Preto; vou pressionar Marrom para desviar a votação.'),
    ])],
    'p1k': [('p1k2', 1, 2, [
        ('N', 'Só que a história do Banana tinha um furo: o Verde estava em Comunicações e não viu o Banana lá.'),
        ('Verde', "Eu fiquei em Comunicações até o t17 e NÃO vi Banana lá. Agora ele 'viu tudo'? E por que esperou pra achar o corpo em vez de denunciar na hora?"),
        ('N', 'E o Caqui, impostor, só jogou lenha:'),
        ('pensa:Caqui', 'Banana viu o Branco matar, isso é péssimo. Preciso semear dúvida sem defender o Branco demais, senão fico suspeito.'),
    ])],
    'p1n': [('p1n2', 1, 3, [
        ('N', 'Metade da nave desconfiou do Banana de boa-fé. Já o Laranja... era impostor:'),
        ('Laranja', 'Banana, se você viu o Branco matar, por que não denunciou na hora? Anulou primeiro e só falou agora, isso não convence.'),
        ('pensa:Laranja', 'Banana é Juiz e viu o Branco matar, isso é péssimo pra nós. Preciso minar o testemunho dele sem parecer que tô defendendo o Branco diretamente.'),
        ('N', 'Quem votou no Banana de boa-fé errou. Os impostores votaram sabendo. [[m:monkey-side-eye:right:1.6]]'),
    ])],
    'p2d': [('p2d2', 2, 0, [
        ('N', 'Mas o duto do Laranja não era a maior pista da sala. O Azul tinha visto o Marrom encostar no Amarelo.'),
        ('Azul', 'Coral, ninguém morreu, então o que você viu? Eu estava na Comunicações e vi o Marrom esbarrar no Amarelo no t8.'),
        ('Marrom', 'Foi esbarrão sem querer no Amarelo, tava indo fazer tarefa. E o Laranja no duto, Coral, o que ele disse?'),
        ('pensa:Marrom', 'Azul me viu esbarrar no Amarelo — preciso soar natural e desviar o foco pro Laranja, que o Coral acusou. O Amarelo cai no t11, aí eu já estarei longe.'),
        ('N', 'Sem corpo, ninguém quis arriscar. A nave pulou. [[m:kermit-worried:right:1.6]]'),
    ])],
    'p2f': [('p2f2', 2, 1, [
        ('N', 'Só que o álibi do Cinza tinha um problema: ele disse Elétrica, mas várias pessoas viram ele no Escritório.'),
        ('Bordo', 'Cinza, Azul, Coral e Banana te viram no Escritório, não na Elétrica. Sua versão não fecha; meu voto vai no Cinza.'),
        ('Cinza', 'A foto prova que eu estava no Escritório no t9. No t11 eu estava na Elétrica com Laranja; ele está mentindo sobre o duto. Votem Laranja.'),
        ('N', 'E o Caqui, parceiro do Cinza, tentou dividir os votos:'),
        ('pensa:Caqui', 'A maioria está votando no Cinza, meu parceiro. Preciso redirecionar pro Laranja — ele apareceu no duto da Espécimes perto do corpo e sua alegação de Engenheiro é convenientemente suspeita.'),
    ])],
    'p2i': [('p2i2', 2, 2, [
        ('N', 'O Bordo falou a verdade, mas a nave desconfiou: por que ele só falou na reunião?'),
        ('Verde', 'Bordo, se você viu o Branco matar no t15, por que esperou até a reunião pra falar? Quem testemunha morte aperta botão na hora.'),
        ('Bordo', 'Eu chamei essa reunião agora, ué. Branco matou o Caqui na minha frente e o Marrom saiu do duto: votem no Branco.'),
        ('pensa:Branco', 'Bordo me viu matar; preciso negar e usar o duto do Marrom para desviar os votos.'),
        ('N', 'Com o Bordo sob suspeita, a foto do Vermelho decidiu.'),
    ])],
    'p2n': [('p2n2', 2, 4, [
        ('N', 'A nave inteira cobrou o Doutor: se é Doutor mesmo, reviva o Verde.'),
        ('Banana', 'Bordo, se for Doutor mesmo, Verde volta em breve e tá tudo certo. Se não voltar, você é o suspeito número um.'),
        ('N', 'E quem pediu calma foi justo o Branco, o Traidor que o Bordo acusava:'),
        ('Branco', 'Bordo pode tentar reviver Verde antes de decidirmos. Rose, você viu Marrom saindo do Admin no t23? Quem estava com ele?'),
        ('pensa:Branco', 'Bordo me viu matar Caqui, mas preciso sobreviver. Marrom envenenou Verde; é o último impostor.'),
    ])],
    'p3e': [('p3e2', 3, 1, [
        ('N', 'Muita gente dizia ter visto. Só que o Preto percebeu um problema numa das testemunhas.'),
        ('Preto', 'Eu estava na Elétrica, não vi o Lima nem a Rose. Marrom, você estava comigo na Nave de Pouso no t3. De onde exatamente viu o Azul?'),
        ('Vermelho', 'Marrom, você mentiu: o Preto disse que você estava com ele na Nave de Pouso no t3, como viu o Azul matar a 30m? Quem fabrica testemunha é o assassino.'),
        ('pensa:Vermelho', 'Sou o Palhaço: preciso ser expulso.'),
        ('N', 'Oito votos no Azul. Sete no Marrom. Foi por um voto. [[m:sweating:right:1.6]]'),
    ])],
    'p3k': [('p3k2', 3, 2, [
        ('N', 'O Branco tentou se defender. E o parceiro dele, o Roxo, ajudou sem aparecer.'),
        ('Branco', 'Eu estava na Nave quando Rosa chegou, mas não matei Coral. Rosa, como você sabe que eu e Caqui tentamos te matar?'),
        ('Roxo', 'Estava em O2 fazendo tarefa o tempo todo. Rosa, qual a prova de que Caqui tentou te matar no t28? Teve testemunha?'),
        ('pensa:Roxo', 'Rosa tá caçando o Branco com força - se ele for expulso, perdemos um impostor.'),
    ])],
    'p3m': [('p3m2', 3, 3, [
        ('N', 'Por que não colou? Porque a Rosa viu o ataque, e o Banana tinha o recibo do escudo:'),
        ('Rosa', 'Foi o CAQUI: ele tentou me matar na Descontaminação no t28, eu vi com meus olhos. Voto nele!'),
        ('Banana', 'Rosa está certa, meu escudo bloqueou o ataque no t28. Se ela viu Caqui, é Caqui. Voto nele.'),
        ('pensa:Caqui', 'Rosa me viu tentar o ataque, mas o escudo impediu. Preciso negar veementemente e usar o recado do disfarçado — é a única desculpa plausível que tenho.'),
    ])],
    'p3o': [('p3o2', 3, 4, [
        ('N', 'O Banana aperta o botão. E ele e a Rosa contam as tentativas, uma por uma:'),
        ('Rosa', 'Gente, AMARELO tentou me matar DUAS vezes (t41 em Elétrica e t44 em Descontaminação) e o escudo me salvou. É impostor, voto nele!'),
        ('Banana', 'Amarelo também TENTOU ME MATAR no t47 em Descontaminação, o escudo me salvou. Ele atacou Rosa duas vezes e agora eu. É impostor, voto nele!'),
        ('Amarelo', 'Também vi o scan do Vermelho não ligar no t48. Isso não prova minha culpa, mas merece atenção na próxima reunião.'),
        ('pensa:Amarelo', 'Provavelmente serei expulso; preciso evitar que desconfiem de Roxo e deixar outra suspeita para a próxima reunião.'),
    ])],
    'p4h': [('p4h2', 4, 0, [
        ('N', 'E quem tinha razão desde o começo? A Rose. Ela viu o Cinza entrar num duto.'),
        ('Rose', 'Pessoal, eu vi o Cinza entrar num duto no Admin no t2, isso é fato. O Vermelho da foto pode ser disfarçado. Voto no Cinza, evidência é direta!'),
        ('N', 'Só quatro votos no Cinza. Onze no Vermelho de verdade. E por trás, o Envenenador:'),
        ('pensa:Lima', 'Melhor seguir o fluxo da votação contra Vermelho e dar cobertura ao Cinza (Metamorfo, parceiro).'),
    ])],
    'p4m': [('p4m2', 4, 1, [
        ('N', 'No meio da confusão, o Roxo acusa o Ciano de mentir.'),
        ('Roxo', 'Ciano, no t35 eu tava na Nave de Pouso com você. Você não tava na Descontaminação, tá mentindo.'),
        ('Azul', 'Confirmo: no t35 e t36 o Ciano estava perto de mim na Descontaminação. Roxo, você se enganou.'),
        ('Roxo', 'Errei com o Ciano, desculpa. Amarelo com duas testemunhas de ataque, voto nele.'),
        ('N', 'Errou, pediu desculpa e mudou de voto. [[m:bruh:right:1.6]]'),
    ])],
    'p4r': [('p4r2', 4, 2, [
        ('N', 'O Preto negou tudo. E o Lima, parceiro do Cinza, aproveitou pra afundar ele:'),
        ('Preto', 'Nunca fui à Caldeira, não matei o Ciano. Cinza saiu de duto no t36 e agora me acusa do nada. Desconfio dele.'),
        ('Lima', 'Eu passei por O2 porque a sabotagem estava ativa e dutos estavam livres, sem matar ninguém. Cinza entrou em duto DUAS vezes na frente da Rosa. Voto nele, gente!'),
        ('pensa:Lima', 'Melhor defender e direcionar voto pro Cinza que já está quente, evitando Marrom.'),
    ])],
}

# falas a acrescentar no fim de cenas que já existem (antes da última fala do narrador)
ACRESCIMOS = {
    'p2l': [('N', 'E tem mais: o Marrom, achando que o Branco era parceiro, votou nele mesmo assim.'),
            ('pensa:Marrom', 'Branco já era, todos votam nele. Não posso me queimar defendendo ele agora; só preciso tirar o Azul de cima de mim e seguir a onda.')],
    'p4u': [('N', 'O Lima jurou que tava sozinho no Depósito. Só que o Azul e o Roxo tinham visto ele entrar num duto, duas vezes.'),
            ('Azul', 'Lima, eu vi você entrar num duto em O2 no t44 e no t46. Explica isso.'),
            ('pensa:Marrom', 'Lima vai cair mesmo com duas testemunhas. Votar nele me dá álibi de tripulante e preserva o Amarelo.')],
}
