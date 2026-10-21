# -*- coding: utf-8 -*-
"""Roteiro do Among Us 4: "Coloquei 15 IAs pra jogar Among Us 4" — temporada com 28 funções, fantasmas e skins.

Tudo o que aparece aqui aconteceu nas partidas de amongus/logs4/partida{1,2,3,4}.json. As falas das reuniões vêm do log
(roteiro/falas_au4.json, gerado por gerar_falas_au4.py, só cortadas em fim de frase), e os "pensamentos" são o campo
secreto que cada IA escreveu junto com a jogada. Resumos conferidos em video/youtube/au4/beats_p*.md.

ORDEM: o vídeo mostra as partidas na ordem 2, 3, 1, 4 do log (a melhor por último). Aqui tudo usa a numeração DO VÍDEO:
partida 1 do vídeo = partida 2 do log, e assim por diante (o build_timeline_au4.py renumera os dados do mesmo jeito).

Formato (o mesmo do AU3, lido por video/scripts/build_timeline_au4.py):
  N(id, capítulo, visual, texto)                  cena narrada
  CH(id, capítulo, visual, [(quem, texto), ...])   cena de chat: quem = 'N' (narrador) ou uma cor (voz daquela cor)
Marcações no texto do narrador: [[m:meme:pos:dur:legenda]] [[s:efeito:vol]] [[p]] soco de câmera [[t:TEXTO:dur:cor]] [[cc]]
"""

ORDEM = {1: 2, 2: 3, 3: 1, 4: 4}

CHAPTERS = {
    'abertura': 'Abertura',
    'novo': 'O que mudou',
    'p1': 'Partida 1 · A partida lenta',
    'p2': 'Partida 2 · O Juiz e o Metamorfo',
    'p3': 'Partida 3 · As bombas',
    'p4': 'Partida 4 · O Palhaço e o Apostador',
    'fim': 'Placar e encerramento',
}


def comp(name, **props):
    return dict(type='component', name=name, props=props)


def titulo(kicker, title, sub='', cor='#ff4d4d'):
    return comp('AUTitulo', kicker=kicker, title=title, subtitle=sub, color=cor)


def jogo(p, foco, tique=None, evento=None, antes=3, papeis=True, seg=0, chat=True, ancoras=None, vmax=None):
    """Gameplay (visual novo do AU4) seguindo `foco`: do início do `tique` (+seg) ou `antes` segundos antes do `evento`.
    `ancoras`: [(evento, 'palavras da narração'), ...] — o evento acontece quando o narrador fala as palavras."""
    pr = dict(partida=p, foco=foco, papeis=papeis, seg=seg, chat=chat)
    if ancoras:
        pr['ancoras'] = [[e, w] for e, w in ancoras]
    if vmax:
        pr['vmax'] = vmax
    if tique is not None:
        pr['tique'] = tique
    if evento:
        pr['evento'] = evento
        pr['antes'] = antes
    return comp('AU4Jogo', **pr)


def morte(vitima):
    return {'tipo': 'morte', 'vitima': vitima}


def reuniao(p, i):
    return comp('AU4Reuniao', partida=p, indice=i)


def chamado(p, i):
    return comp('AU4Chamado', partida=p, indice=i)


def votos(p, i):
    return comp('AU4Votos', partida=p, indice=i)


def ejecao(p, i):
    return comp('AU4Ejecao', partida=p, indice=i)


def aposta(p, i):
    return comp('AU4Aposta', partida=p, indice=i)


def revela(p, foco):
    return comp('AU4Revela', partida=p, foco=foco)


def pensa(p, cor, texto, modo='pensa'):
    return comp('AU4Frase', partida=p, cor=cor, texto=texto, modo=modo)


# falas das reuniões: copiadas do log por roteiro/gerar_falas_au4.py (nunca reescritas à mão); chave do log
import json as _json
from pathlib import Path as _Path
_FALAS = _json.loads((_Path(__file__).with_name('falas_au4.json')).read_text())


def F(n, i, a=0, b=None):
    return [tuple(x) for x in _FALAS[f'{ORDEM[n]}-{i}'][a:b]]


def N(id, chapter, visual, text, **kw):
    return dict(id=id, chapter=chapter, visual=visual, text=text, **kw)


def CH(id, chapter, visual, falas, **kw):
    return dict(id=id, chapter=chapter, visual=visual, falas=falas, **kw)


SCENES = [
    # ------------------------------------------------------------------ ABERTURA
    N('a01', 'abertura', jogo(3, 'Rosa', evento={'tipo': 'bomba_plantada', 'vitima': 'Rosa'}, antes=1,
                              ancoras=[({'tipo': 'bomba', 'portador': 'Rosa'}, 'bum')]),
      'Quinze IAs jogando Among Us de novo. Olha a Rosa aqui, tranquila... [[m:this-is-fine:right:2.2]] Só que o Vermelho, um MiniMax, chegou perto dela e grudou uma bomba. Três tiques depois... [[s:explosion:0.6]] bum. [[m:nuclear-mushroom-cloud:right:2]]'),
    N('a02', 'abertura', comp('AU4Comentarios', lista='entrou', passo=34),
      'Mas antes, os comentários. O último vídeo teve mais de trezentos. [[m:shocked-patrick:right:2]] Pediram porta que não tranca durante sabotagem, Xerife que mata neutro, fantasma... e chapéu. Tudo isso entrou.'),
    N('a03', 'abertura', comp('AU4Comentarios', lista='funcoes', passo=34),
      'E funções. Muitas funções. Apostador, Bombardeiro, Mecânico, Glutão, Canibal, Casal, Perito... [[m:visible-confusion:right:2.2]] Calma, quando cada uma aparecer, eu explico.'),
    N('a04', 'abertura', comp('AU4Comentarios', lista='fora', passo=26),
      'Algumas ficaram de fora. E David, eu vi. [[m:side-eye-dog:right:2]] Vinte e um comentários pedindo o mapa Polus. Vinte e um. [[s:record-scratch:0.4]] Esse fica pra um episódio só dele.'),
    N('a05', 'abertura', comp('AU4Comentarios', lista='familia', passo=40),
      'E o FAMILIAGMS reclamou que eu prometi e ele não apareceu. [[m:hide-the-pain-harold:right:2]] Pronto, apareceu. O modo cavalo... quem sabe.'),
    N('a09', 'abertura', titulo('15 IAs · 6 empresas · 4 partidas', 'COLOQUEI 15 IAs PRA JOGAR AMONG US 4', 'agora com fantasmas, bombas, Glutão, Apostador e Casal'),
      '[[s:impact-epic:0.6]] Quinze IAs. Vinte e oito funções. Uma temporada inteira com memória: o que acontece numa partida, elas lembram na próxima. Bora.'),

    # ------------------------------------------------------------------ O QUE MUDOU
    N('n01', 'novo', comp('AU4Elenco', partida=1, quemSaiu='Gemini', novos=['Qwen 3.8 27B', 'MiniMax M3.1 Flash'], gatilhoSaiu='gemini', gatilhoNovas='qwen'),
      'O elenco mudou. O Gemini saiu: era o mais caro. [[m:michael-scott-no:right:2]] Entrou o Qwen, da Alibaba, e o MiniMax voltou na versão nova. Seis empresas, quinze IAs. E pra ficar justo, quem joga com três IAs e quem joga com duas foi sorteado.'),
    N('n02', 'novo', comp('AU4Papeis', passo=3),
      'As funções. Pros impostores, as novas são o Bombardeiro, que gruda uma bomba em alguém, o Chantagista, que cala uma pessoa na reunião, o Apostador, que chuta a função de alguém e se acertar, mata. E o Possuidor. [[s:faca:0.4]] Os neutros jogam sozinhos: o Glutão, que devora a vítima, o Canibal, que come corpos, o Piromante, que encharca todo mundo de gasolina, e o Sobrevivente, que só quer ficar vivo. [[m:visible-confusion:right:2.2]] E pros tripulantes, Perito, Mecânico e Armador.'),
    N('n03', 'novo', jogo(1, 'Marrom', tique=2),
      'E tem o Casal. Em cada partida, o sorteio junta dois jogadores. Se um morrer... o outro morre junto, de tristeza. [[s:coracao:0.6]][[m:crying-jordan:right:2.2]] Pode ser tripulante com impostor. Eles sabem quem é o par.'),
    N('n04', 'novo', comp('AU4Roupas'),
      'E cada IA escolheu a própria roupa: chapéu, jaleco, terno, camisa havaiana... e até bichinho de estimação. [[m:happy-dance:right:2]] O mapa também foi refeito, bem mais parecido com o Skeld de verdade.'),
    N('n05', 'novo', jogo(3, 'Rosa', tique=15),
      'E o mais pedido: quem morre não sai mais do jogo. Vira fantasma. [[s:sumir:0.5]] Atravessa parede, termina as tarefas. O primeiro tripulante que morrer vira Anjo da Guarda, e coloca escudo nos vivos. O segundo vira Influencer fantasma, e manda recado anônimo pra nave. [[m:wait-who-are-you:right:2.2]] Só que recado anônimo... pode ser mentira.'),
    N('n06', 'novo', comp('AU4Shhh'), '[[s:whoosh:0.4]] Bora pra primeira partida.', pad=0.9),

    # ------------------------------------------------------------------ PARTIDA 1 (log 2): a partida lenta
    N('p101', 'p1', revela(1, 'Rosa'),
      'Partida um. Os impostores: a Rosa, um GLM, de Faxineira. [[s:faca:0.4]] O Preto, um Claude Haiku, de Apostador. [[s:faca:0.4]] E a Coral, do GPT, de Chantagista. [[s:impact-epic:0.4]] Nos neutros, o Amarelo é o Canibal, e o Roxo, um Qwen, é o Sobrevivente.'),
    N('p102', 'p1', jogo(1, 'Preto', evento=morte('Amarelo'), antes=5, ancoras=[(morte('Amarelo'), 'mata o')]),
      'E o Preto começa com tudo. Tique oito, as luzes caem, e ele mata o Amarelo no Refeitório. [[s:faca:0.6]] O Canibal, que nem chegou a comer nada. [[m:sad-violin:right:2]] No chat ele avisa: "Matei o Amarelo no Refeitório sem testemunhas". Só que o Roxo tava ali.', pad=0.6),
    N('p103', 'p1', chamado(1, 0), 'O Roxo denuncia o corpo.', pad=1.0),
    CH('p104', 'p1', reuniao(1, 0), [
        ('N', 'E o Sobrevivente vai direto ao ponto.'),
        *F(1, 0, 0, 1),
        ('N', 'O Preto tenta o álibi...'),
        *F(1, 0, 1, 2),
        ('N', 'E aí o Azul, um Claude, solta outra bomba:'),
        *F(1, 0, 2, 3),
        ('N', 'Ele viu a Rosa saindo de um duto. E a Rosa, pra se salvar, joga a culpa em quem achou o corpo:'),
        *F(1, 0, 3, 4),
    ]),
    N('p104v', 'p1', votos(1, 0), 'Nove votos no Preto. E a Rosa votou no próprio parceiro. O pensamento dela: "o Preto já tem maioria de votos e vai ser expulso de qualquer jeito, vou junto para parecer coerente". [[m:monkey-side-eye:right:2.5]]', pad=1.8),
    N('p105', 'p1', ejecao(1, 0), 'O Apostador, fora no tique nove. Sem nem chegar a apostar. [[m:goodbye-see-ya:right:2]]', pad=1.4),
    N('p106', 'p1', jogo(1, 'Rosa', tique=17, ancoras=[({'tipo': 'chat', 'cor': 'Coral', 'contem': 'Matei Vermelho'}, 'Matei Vermelho')]),
      'E aí começou a partida mais lenta da história desse canal. As duas impostoras que sobraram passaram trinta e dois tiques sem matar ninguém. [[m:spongebob-waiting:right:2.2]] Mas no chat... olha a Coral: "Matei Vermelho no Motor Superior durante as luzes". O Vermelho tá vivíssimo.'),
    N('p108', 'p1', jogo(1, 'Coral', tique=23, ancoras=[({'tipo': 'sabotagem', 'cor': 'Coral', 'tique': 23}, 'apaga as luzes'), ({'tipo': 'conserto', 'tique': 24}, 'conserta')]),
      'E a Coral? A Coral apaga as luzes pra parceira matar no escuro... [[s:luzes:0.5]] e no tique seguinte vai lá e conserta as luzes ela mesma. [[m:picard-facepalm:right:2.2]] Ela fez isso de novo com o reator.'),
    N('p107', 'p1', jogo(1, 'Coral', tique=32, ancoras=[({'tipo': 'chat', 'cor': 'Rosa', 'contem': 'Matei o Azul'}, 'Matei o Azul')]),
      'E a Rosa, no tique trinta e dois: "Matei o Azul no Depósito e escondi o corpo". [[s:record-scratch:0.5]] O Azul também tá vivo. Elas escolhiam "matar" e escreviam a mensagem na mesma hora, junto com a jogada... antes de saber se tinha dado certo. E não dava: o alvo saía de vista, ou a faca ainda tava recarregando. [[m:confused-travolta:right:2.5]] Foram quatro "matei" no chat que nunca aconteceram.'),
    N('p109', 'p1', jogo(1, 'Verde', evento=morte('Verde'), antes=4, ancoras=[(morte('Verde'), 'mata o Verde')]),
      'Finalmente, no tique quarenta e um, a Rosa mata o Verde no Depósito e some com o corpo. [[s:passos:0.4]] Ninguém nunca achou. [[m:homer-bushes:right:2]] E o Verde virou o Anjo da Guarda... e começou a dar escudo até nos impostores.'),
    N('p110', 'p1', jogo(1, 'Roxo', tique=55),
      'E o Roxo, o Sobrevivente? Esse jogou o jogo dele. Vestiu o colete duas vezes, ficou fingindo tarefa, e nunca se meteu em confusão. [[m:roll-safe:right:2.2]] A meta dele é só uma: estar vivo no final.'),
    N('p111', 'p1', chamado(1, 1), 'Tique setenta. O Cinza aperta o botão, sem corpo nenhum.', pad=0.8),
    CH('p112', 'p1', reuniao(1, 1), [
        *F(1, 1, 0, 1),
        ('N', 'E a desconfiança cai no Bordô, que andou pela nave inteira.'),
        *F(1, 1, 1, 2),
        *F(1, 1, 2, 3),
        ('N', 'E olha o que a Rosa, a impostora, pensou nessa hora: "acusar o Bordô desvia atenção, e ele não é dos nossos". [[m:sus-doakes:right:2.5]] Ela sabia que ele era inocente.'),
    ]),
    N('p112v', 'p1', votos(1, 1), 'Dez votos no Bordô. As duas impostoras votaram juntas.', pad=1.8),
    N('p113', 'p1', ejecao(1, 1), 'O Bordô, um DeepSeek, era o Barulhento. Inocente. [[m:faustao-errou:right:2]]', pad=1.4),
    N('p114', 'p1', comp('AU4Fim', partida=1, foco='Azul'),
      '[[s:tada:0.5]] E três tiques depois, a última tarefa. Tripulantes venceram! Setenta e três tiques, duas mortes. [[m:one-eternity-later:right:2.5]] E o Roxo, o Sobrevivente, ganhou junto. A reflexão da Coral no fim: "a demora da Rosa em matar e a nossa falta de pressão permitiram a vitória dos tripulantes". Pois é.'),

    # ------------------------------------------------------------------ PARTIDA 2 (log 3): o Juiz e o Metamorfo
    N('p201', 'p2', revela(2, 'Ciano'),
      'Partida dois. Os impostores: o Ciano, um Claude Haiku, de Bombardeiro. [[s:faca:0.4]] O Cinza, um MiniMax, de Chantagista. [[s:faca:0.4]] E o Bordô, um DeepSeek, de Metamorfo, o que se disfarça de outro jogador. [[s:impact-epic:0.4]] E dois neutros perigosos: o Branco é o Glutão, e a Coral, a Piromante.'),
    N('p202', 'p2', jogo(2, 'Coral', tique=1, ancoras=[({'tipo': 'gasolina', 'vitima': 'Vermelho'}, 'encharca')]),
      'E a Coral começa trabalhando: logo no primeiro tique, ela encharca o Vermelho de gasolina. [[s:splash:0.6]] Pra ganhar, a Piromante precisa encharcar todo mundo que tá vivo... e depois riscar o fósforo. [[m:elmo-fire:right:2.2]]'),
    N('p203', 'p2', jogo(2, 'Cinza', evento=morte('Coral'), antes=5, ancoras=[({'tipo': 'sabotagem', 'cor': 'Cinza', 'tique': 7}, 'apaga'), (morte('Coral'), 'mata a Coral')]),
      'Só que ela durou pouco. O Cinza apaga as luzes, e no escuro mata a Coral no Refeitório. [[s:faca:0.6]] E aí... [[p]] a Coral era o par do Marrom no Casal. [[s:coracao:0.6]] O Marrom, que era o Xerife, caiu morto também. [[m:crying-jordan:right:2.2]] Duas mortes com uma facada.', pad=0.6),
    N('p204', 'p2', chamado(2, 0), 'O Roxo acha o corpo da Coral.', pad=1.0),
    CH('p205', 'p2', reuniao(2, 0), [
        ('N', 'E a Rosa tinha visto o Cinza do lado do corpo.'),
        *F(2, 0, 0, 1),
        *F(2, 0, 1, 2),
        ('N', 'Aí entra o Bordô, o Metamorfo, que tá disfarçado de Amarelo nesse momento. E ele tem um plano:'),
        *F(2, 0, 2, 3),
        ('N', 'O pensamento dele: "melhor empurrar o Vermelho. Assim a nave expulsa um tripulante e eu preservo meu disfarce de Amarelo". [[m:sweating:right:2.2]]'),
        *F(2, 0, 3, 4),
    ]),
    N('p206', 'p2', votos(2, 0), 'E funcionou. Sete votos no Vermelho, que é inocente, contra cinco no Cinza, que é o assassino.', pad=1.8),
    N('p207', 'p2', comp('AU4Resultado', partida=2, indice=0),
      'Só que o Azul é o Juiz. E ele tinha pensado: "se a nave expulsar um inocente, posso usar meu poder de Juiz para anular". [[s:boom:0.6]] Votação anulada! [[m:galaxy-brain:right:2.5]] O Vermelho foi salvo pelo martelo.', pad=1.0),
    N('p208', 'p2', jogo(2, 'Bordo', evento=morte('Azul'), antes=6, ancoras=[({'tipo': 'transformacao', 'cor': 'Bordo', 'tique': 13}, 'vira'), (morte('Azul'), 'mata o Juiz')]),
      'Só que o Juiz virou alvo. Tique treze, no Admin. O Bordô vira a Rosa... [[s:transformar:0.6]] o Cinza tranca as portas, e o Bordô, disfarçado, mata o Juiz. [[s:faca:0.6]][[m:dramatic-chipmunk:right:2]]', pad=0.6),
    N('p209', 'p2', jogo(2, 'Azul', tique=14),
      'Mas o Azul morreu como segundo tripulante. Ou seja: Influencer fantasma. E no tique seguinte ele manda o recado do além: "Eu vejo o Bordô disfarçado de Rosa agora, no Admin. Não votem no Vermelho". [[s:notification-pop:0.6]][[m:shocked-krabs:right:2.2]] O morto dedurou o assassino.'),
    N('p210', 'p2', chamado(2, 1), 'O Branco aperta o botão.', pad=0.8),
    CH('p211', 'p2', reuniao(2, 1), [
        *F(2, 1, 0, 1),
        ('N', 'E o Bordô... tenta usar o próprio recado contra o morto.'),
        *F(2, 1, 1, 2),
        ('N', 'E solta o argumento da temporada:'),
        *F(2, 1, 2, 3),
        *F(2, 1, 3, 4),
    ]),
    N('p211v', 'p2', votos(2, 1), 'Nove votos no Bordô. Até o Cinza, parceiro dele, votou contra.', pad=1.8),
    N('p212', 'p2', ejecao(2, 1), 'O Metamorfo, fora. [[m:dicaprio-pointing:right:2]] Um recado do além decidiu a votação.', pad=1.4),
    N('p213', 'p2', jogo(2, 'Rosa', evento={'tipo': 'bomba', 'portador': 'Rosa'}, antes=4, ancoras=[({'tipo': 'bomba', 'portador': 'Rosa'}, 'bum')]),
      'Mas o Ciano, o Bombardeiro, estava quieto até agora. No tique dezenove ele gruda uma bomba na Rosa. E a Rosa vai pra Navegação... onde tá o Preto. [[s:bip:0.5]] Três tiques depois... [[s:explosion:0.6]] bum. [[m:nuclear-mushroom-cloud:right:2]] Dois de uma vez.', pad=0.6),
    N('p214', 'p2', jogo(2, 'Lima', evento=morte('Lima'), antes=5, ancoras=[(morte('Lima'), 'devora')]),
      'E o Glutão? O Branco esperou o momento. Tique vinte e quatro, Motor Inferior. A Lima, que na reunião tinha falado "tô com o Branco desde então"... [[s:nhac:0.7]] o Branco devora. [[m:im-hungry-cat:right:2.2]] Não sobra nem o corpo.', pad=0.6),
    N('p215', 'p2', jogo(2, 'Roxo', evento={'tipo': 'escudo', 'assassino': 'Cinza'}, antes=4, ancoras=[({'tipo': 'escudo', 'assassino': 'Cinza'}, 'Escudo')]),
      'Tique trinta e dois, no Reator. O Cinza fica sozinho com o Roxo e pensa: "vou eliminá-lo agora para avançar a vitória impostora". [[s:escudo:0.7]] Escudo! [[p]] Lembra do Marrom, o que morreu de tristeza? Ele virou o Anjo da Guarda. E tava protegendo o Roxo. [[m:cat-ok-thumbs-up:right:2.2]]'),
    N('p216', 'p2', chamado(2, 2), 'O Verde acha os corpos da bomba, escondidos na Navegação.', pad=0.8),
    CH('p217', 'p2', reuniao(2, 2), [
        *F(2, 2, 0, 1),
        ('N', 'E o Roxo tem a prova mais forte que existe:'),
        *F(2, 2, 1, 2),
        ('N', 'E o Cinza... confessa. Mais ou menos.'),
        *F(2, 2, 2, 3),
        ('N', '[[m:bruh:right:2]] Um "erro" tentando completar a sabotagem. Tá bom.'),
    ]),
    N('p217v', 'p2', votos(2, 2), 'Sete votos. E até o Ciano, parceiro dele, votou no Cinza.', pad=1.8),
    N('p218', 'p2', ejecao(2, 2), 'O Chantagista, fora. Sobrou só o Bombardeiro.', pad=1.4),
    N('p219', 'p2', jogo(2, 'Branco', evento={'tipo': 'bomba', 'portador': 'Branco'}, antes=5, ancoras=[({'tipo': 'escudo', 'assassino': 'Branco'}, 'escudo de novo'), ({'tipo': 'bomba', 'portador': 'Branco'}, 'bum')]),
      'E o Glutão tentou devorar o Roxo também. [[s:escudo:0.6]] O escudo de novo! O Anjo salvou o Roxo duas vezes. [[m:lets-go:right:2]] Só que o Ciano tinha grudado uma bomba... justamente no Branco. [[s:explosion:0.6]] bum. E levou o Laranja junto.', pad=0.6),
    N('p220', 'p2', chamado(2, 3), 'O Verde acha os corpos no Refeitório. O Ciano tava do lado.', pad=0.8),
    CH('p221', 'p2', reuniao(2, 3), [
        ('N', 'O Ciano, o último impostor, tenta desviar:'),
        *F(2, 3, 0, 1),
        *F(2, 3, 1, 2),
        ('N', 'E o Roxo, empolgado, chega a uma conclusão... quase certa.'),
        *F(2, 3, 2, 3),
        ('N', '[[m:math-lady:right:2.2]] O Branco não era impostor, era o Glutão. Mas o Vermelho não caiu nessa:'),
        *F(2, 3, 3, 4),
    ]),
    N('p222', 'p2', ejecao(2, 3), 'O Ciano, o Bombardeiro, fora.', pad=1.2),
    N('p223', 'p2', comp('AU4Fim', partida=2, foco='Verde'),
      '[[s:tada:0.5]] Tripulantes venceram! [[m:cr7-siuuu:right:2.5]] Com um Juiz que salvou um inocente, um fantasma que dedurou o assassino, e um Anjo que defendeu o Roxo duas vezes. Os mortos ganharam essa partida.'),

    # ------------------------------------------------------------------ PARTIDA 3 (log 1): as bombas
    N('p301', 'p3', revela(3, 'Vermelho'),
      'Partida três. Os impostores: o Vermelho, um MiniMax, de Bombardeiro. [[s:faca:0.4]] O Laranja, um Qwen, de Gangster. [[s:faca:0.4]] E o Marrom, um DeepSeek, de Chantagista. [[s:impact-epic:0.4]] Nos neutros, a Lima é a Piromante, e o Bordô, o Glutão. E o Casal: o Verde, tripulante... com o Marrom, impostor.'),
    N('p302', 'p3', jogo(3, 'Marrom', tique=1),
      'E o Marrom avisa logo no chat dos impostores: "Sou casal com Verde. NÃO matem o Verde, senão eu morro junto". [[m:kermit-worried:right:2.2]] Guarda isso.'),
    N('p303', 'p3', jogo(3, 'Laranja', evento={'tipo': 'recrutamento', 'alvo': 'Azul'}, antes=5, ancoras=[({'tipo': 'recrutamento', 'alvo': 'Azul'}, 'Recrutado'), (morte('Roxo'), 'devora')]),
      'Tique sete, o mais cheio da partida. O Laranja, o Gangster, fica sozinho com o Azul, um Claude, e pensa: "isso muda o jogo". [[s:transformar:0.6]] Recrutado: agora são quatro impostores. [[m:avengers-assemble:right:2]] E no mesmo tique, lá no O2, o Bordô devora o Roxo. [[s:nhac:0.6]] O Juiz, engolido no tique sete.'),
    N('p304', 'p3', jogo(3, 'Rosa', evento={'tipo': 'bomba_plantada', 'vitima': 'Rosa'}, antes=2, ancoras=[({'tipo': 'bomba_plantada', 'vitima': 'Rosa'}, 'gruda'), ({'tipo': 'bomba', 'portador': 'Rosa'}, 'bum')]),
      'Aí o Vermelho entra em ação. Ele passou cinco tiques indo e voltando pelo duto, e no tique dez... gruda a bomba na Rosa. [[s:bip:0.6]] E sai correndo pelo duto. [[s:explosion:0.6]] bum. [[m:this-is-fine:right:2]]', pad=0.6),
    N('p305', 'p3', jogo(3, 'Preto', evento={'tipo': 'xerife', 'alvo': 'Lima'}, antes=5, ancoras=[({'tipo': 'xerife', 'alvo': 'Lima'}, 'Atira')]),
      'No mesmo tique, no Admin. O Preto, o Xerife, pensa: "vi o Lima fingir o scan e o scan não ligou, então ele não é tripulante". [[s:tiro:0.7]][[p]] Atira. E acerta! Era a Piromante, que já tinha encharcado três. [[m:cr7-siuuu:right:2]] Essa regra veio de vocês: o Xerife agora pode matar neutro.', pad=0.6),
    N('p306', 'p3', jogo(3, 'Rosa', tique=14),
      'E a Rosa, que explodiu, é o segundo tripulante morto. Influencer fantasma. E o recado dela: "vi o Vermelho sair de duto em Motor Inferior duas vezes. Só Engenheiro usa dutos. Se o Vermelho não for Engenheiro, é impostor". [[s:notification-pop:0.6]][[m:dicaprio-pointing:right:2]]'),
    N('p307', 'p3', chamado(3, 0), 'O Cinza acha o corpo do Lima.', pad=1.0),
    CH('p308', 'p3', reuniao(3, 0), [
        ('N', 'O Amarelo foi chantageado pelo Marrom, então tá calado. E o Vermelho, encurralado pelo recado, se declara Engenheiro.'),
        *F(3, 0, 0, 1),
        ('N', 'O Xerife assume o tiro na cara dura.'),
        *F(3, 0, 1, 3),
        ('N', 'Só que o Marrom tinha escrito no chat, tique onze: "tô indo por duto pro Admin, sem testemunhas". E aqui ele diz:'),
        *F(3, 0, 3, 4),
        ('N', '[[m:picard-facepalm:right:2.2]] Ninguém acreditou.'),
    ]),
    N('p308v', 'p3', votos(3, 0), 'Nove votos no Marrom. E agora lembra do Casal...', pad=1.6),
    N('p309', 'p3', ejecao(3, 0), '[[s:coracao:0.5]] O Marrom foi expulso. E o Verde, o par dele, morreu junto. [[m:coffin-dance:right:2.5]] O Verde nem era impostor.', pad=1.6),
    N('p310', 'p3', jogo(3, 'Cinza', evento={'tipo': 'bomba', 'portador': 'Cinza'}, antes=6, ancoras=[({'tipo': 'sabotagem', 'cor': 'Laranja'}, 'apaga'), ({'tipo': 'bomba', 'portador': 'Cinza'}, 'bum')]),
      'Segunda bomba. Dessa vez no Cinza, o Engenheiro de verdade. O Laranja apaga as luzes pra cobrir... [[s:luzes:0.5]] e no Refeitório... [[s:explosion:0.6]] bum. O Cinza sobreviveu, mas a bomba pegou o Ciano do lado. [[m:shocked-patrick:right:2]]', pad=0.6),
    N('p311', 'p3', jogo(3, 'Azul', evento=morte('Coral'), antes=4, ancoras=[(morte('Coral'), 'mata a Coral')]),
      'E o Azul, o recrutado, mata a Coral ali mesmo. [[s:faca:0.6]] No chat: "matei a Coral agora". [[m:sweating:right:2]] Só que o Cinza viu.', pad=0.6),
    N('p312', 'p3', chamado(3, 1), 'O Laranja, que é impostor, denuncia o corpo do Ciano.', pad=0.8),
    CH('p313', 'p3', reuniao(3, 1), [
        ('N', 'E o Cinza conta a verdade.'),
        *F(3, 1, 0, 1),
        ('N', 'Só que o corpo denunciado é o do Ciano, e ele falou Coral. E o Laranja pensa: "perfeito, ele tá dando munição pra mim proteger o Azul".'),
        *F(3, 1, 1, 2),
        *F(3, 1, 2, 3),
        *F(3, 1, 3, 4),
    ]),
    N('p313v', 'p3', votos(3, 1), 'Sete votos no Cinza. O único que falou a verdade.', pad=1.8),
    N('p314', 'p3', ejecao(3, 1), 'O Cinza, o Engenheiro, inocente. Expulso por trocar um nome. [[m:sad-pablo:right:2.5]]', pad=1.4),
    N('p315', 'p3', jogo(3, 'Bordo', evento={'tipo': 'bomba', 'portador': 'Bordo'}, antes=5, ancoras=[({'tipo': 'bomba', 'portador': 'Bordo'}, 'bum')]),
      'E o Vermelho grudou a terceira bomba. No Bordô, o Glutão. [[s:bip:0.5]] Três impostores contra quatro... [[s:explosion:0.6]] bum.', pad=0.6),
    N('p316', 'p3', comp('AU4Fim', partida=3, foco='Vermelho'),
      '[[s:explosion:0.5]] Impostores venceram! Três contra três, empate é vitória deles. [[m:lets-go:right:2.5]] O Vermelho, um MiniMax gratuito, plantou três bombas e nunca estava perto quando elas explodiam.'),

    # ------------------------------------------------------------------ PARTIDA 4 (log 4): o Palhaço e o Apostador
    N('p401', 'p4', revela(4, 'Bordo'),
      'Última partida. Os impostores: o Vermelho, um MiniMax, de Envenenador. [[s:faca:0.4]] O Laranja, um Qwen, de Apostador. [[s:faca:0.4]] E o Bordô, um DeepSeek, de Chantagista. [[s:impact-epic:0.4]] O Amarelo é o Piromante. E o Palhaço, que ganha se for expulso... é o Branco.'),
    N('p402', 'p4', jogo(4, 'Bordo', evento={'tipo': 'escudo', 'assassino': 'Bordo'}, antes=4, ancoras=[({'tipo': 'escudo', 'assassino': 'Bordo'}, 'Escudo')]),
      'O Bordô começa chantageando o Ciano, que é o Médico, porque o Ciano viu ele. E no tique sete, tenta matar o Branco. [[s:escudo:0.7]] Escudo! O Médico tinha protegido o Branco. No chat, o Bordô escreve: "matei o Branco". [[m:monkey-puppet-awkward:right:2.2]] Não matou.'),
    N('p403', 'p4', chamado(4, 0),
      'E aí, tique nove, o Palhaço entra em ação. Ele aperta o botão de emergência, sem corpo nenhum. [[s:emergencia:0.5]] O pensamento dele: "preciso parecer culpado".', pad=0.6),
    CH('p404', 'p4', reuniao(4, 0), [
        ('N', 'O Vermelho, o impostor, aproveita pra atacar:'),
        *F(4, 0, 0, 1),
        ('N', 'E o Palhaço, pra parecer suspeito, conta uma coisa que viu de verdade:'),
        *F(4, 0, 1, 2),
        ('N', '[[s:record-scratch:0.5]] Ele dedurou o impostor... sem querer. E o Vermelho admite:'),
        *F(4, 0, 2, 3),
        *F(4, 0, 3, 4),
        ('N', 'E olha quem fecha o caixão. O Bordô. Parceiro do Vermelho.'),
        *F(4, 0, 4, 5),
    ]),
    N('p404v', 'p4', votos(4, 0), 'Treze votos no Vermelho. O Bordô pensou depois: "errei feio: me comprometi a votar no Vermelho, meu próprio parceiro". [[m:hide-the-pain-harold:right:2.2]]', pad=1.8),
    N('p405', 'p4', ejecao(4, 0), 'O Palhaço queria ser expulso... e expulsou um impostor. [[m:surprised-pikachu:right:2.5]]', pad=1.4),
    N('p406', 'p4', jogo(4, 'Bordo', evento=morte('Marrom'), antes=4, ancoras=[(morte('Marrom'), 'mata')]),
      'Sobraram dois impostores. E o Bordô virou máquina. Tique catorze, Motor Superior: mata o Marrom, o Prefeito. [[s:faca:0.6]] Sozinho, sem testemunha.', pad=0.6),
    N('p407', 'p4', chamado(4, 1), 'O Ciano acha o corpo... mas ele tá chantageado.', pad=0.8),
    CH('p408', 'p4', reuniao(4, 1), [
        ('N', 'Quem chamou a reunião não pode falar. [[m:cala-a-boca:right:2]]'),
        *F(4, 1, 0, 1),
        *F(4, 1, 1, 2),
        ('N', 'E quem é o Chantagista? Tá sentado ali. E desconversa:'),
        *F(4, 1, 2, 3),
    ]),
    N('p409', 'p4', comp('AU4Resultado', partida=4, indice=1), 'A maioria pulou. Ninguém saiu.', pad=1.2),
    N('p410', 'p4', jogo(4, 'Amarelo', evento=morte('Amarelo'), antes=5, ancoras=[(morte('Amarelo'), 'mata o Amarelo')]),
      'Tique vinte e quatro. O Amarelo, o Piromante, já tinha encharcado dois. E encharca o Bordô... [[s:splash:0.6]] e na mesma hora o Bordô mata o Amarelo. [[s:faca:0.6]] E o Amarelo era o par do Roxo no Casal. [[s:coracao:0.6]] O Roxo cai lá no Motor Superior. [[m:crying-jordan:right:2]]', pad=0.6),
    N('p411', 'p4', chamado(4, 2), 'O Azul acha o corpo do Roxo.', pad=0.8),
    CH('p412', 'p4', reuniao(4, 2), [
        ('N', 'E o Laranja, o Apostador, empurra a nave pro Branco.'),
        *F(4, 2, 0, 1),
        ('N', 'E o Palhaço adora:'),
        *F(4, 2, 1, 2),
        *F(4, 2, 2, 3),
    ]),
    N('p413', 'p4', comp('AU4Resultado', partida=4, indice=2),
      'Cinco votos no Branco. O Palhaço ia ganhar! [[s:boom:0.6]] Mas a Rosa é a Juíza... e anula. [[m:galaxy-brain:right:2.5]] O Juiz salvou a partida sem saber que tava salvando.', pad=1.0),
    N('p414', 'p4', jogo(4, 'Verde', evento=morte('Verde'), antes=5, ancoras=[({'tipo': 'sabotagem', 'cor': 'Bordo', 'tique': 32}, 'apaga'), (morte('Verde'), 'mata o Verde')]),
      'Agora o Laranja acorda. O Bordô apaga as luzes, e o Laranja pensa: "tô com cooldown zero, ninguém vê, e tá escuro". [[s:luzes:0.4]] E mata o Verde no Admin. [[s:faca:0.6]][[m:hello-darkness:right:2.2]]', pad=0.6),
    N('p415', 'p4', chamado(4, 3), 'E quem denuncia o corpo? O próprio Laranja.', pad=0.8),
    CH('p416', 'p4', reuniao(4, 3), [
        *F(4, 3, 0, 1),
        ('N', 'O Ciano, que ficou calado nas reuniões anteriores, finalmente fala. E acerta em cheio:'),
        *F(4, 3, 1, 2),
        ('N', 'Mas o Preto, o Cientista, vai contra ele. E o Preto disse a palavra errada...'),
        *F(4, 3, 2, 3),
    ]),
    N('p417', 'p4', aposta(4, 3),
      'O Laranja pensa: "o Preto disse confiro sinais vitais três vezes, ele se entregou como Cientista. É a aposta mais segura que existe". [[s:drumroll:0.5]] E aposta.', pad=0.8),
    N('p418', 'p4', ejecao(4, 3), 'O Preto morreu na hora. E a nave ainda expulsou o Ciano, o Médico, que tava certo sobre o Bordô. [[m:mission-failed:right:2.2]]', pad=1.4),
    N('p419', 'p4', jogo(4, 'Branco', evento=morte('Branco'), antes=4, ancoras=[(morte('Branco'), 'mata o Branco')]),
      'E o Palhaço? Sem o Médico, sem escudo. Tique quarenta e três, o Bordô mata o Branco. [[s:faca:0.6]] O Palhaço morreu sem nunca ser expulso. No chat: "chantageei o Branco, mas ele morreu. Desperdício". [[m:eye-roll:right:2]]', pad=0.6),
    N('p420', 'p4', jogo(4, 'Azul', tique=47, ancoras=[({'tipo': 'chat', 'cor': 'Bordo', 'contem': 'Matei Azul'}, 'Matei o Azul')]),
      'E o Bordô no chat: "Matei o Azul". Três vezes, em tiques diferentes. [[s:record-scratch:0.5]] E o Azul continua vivo, fazendo tarefa. [[m:confused-travolta:right:2.2]] Mas o Azul tava vendo o Bordô entrar e sair dos dutos.'),
    N('p421', 'p4', chamado(4, 4), 'O Cinza acha o corpo do Branco.', pad=0.8),
    CH('p422', 'p4', reuniao(4, 4), [
        *F(4, 4, 0, 2),
        ('N', 'Encurralado, o Bordô se declara Engenheiro. Só que o Engenheiro era o Roxo, que já morreu.'),
        *F(4, 4, 2, 3),
        ('N', 'E aí vem a maior traição da temporada. O Laranja, parceiro dele:'),
        *F(4, 4, 3, 4),
        ('N', 'O pensamento do Bordô: "o Laranja me traiu, sendo que ele é meu parceiro". [[m:distracted-boyfriend:right:2.2]]'),
    ]),
    N('p423', 'p4', aposta(4, 4),
      'E o Laranja ainda aposta. Pensa: "a Coral usou nas minhas câmeras, é uso público do poder de Segurança, praticamente confirmação de função". [[s:drumroll:0.5]]', pad=0.8),
    N('p424', 'p4', ejecao(4, 4), 'Segunda aposta certa: a Coral morre. E o Bordô, expulso pelo próprio parceiro. [[m:mic-drop:right:2.2]] Agora o Laranja tá sozinho. Quatro tripulantes vivos, e as tarefas em noventa e quatro por cento.', pad=1.4),
    N('p425', 'p4', chamado(4, 5), 'A Lima aperta o botão: falta pouco pra terminar as tarefas, ninguém pode morrer.', pad=0.8),
    CH('p426', 'p4', reuniao(4, 5), [
        ('N', 'E o Azul lembra de um detalhe do tique trinta e oito.'),
        *F(4, 5, 0, 1),
        ('N', 'O Laranja inventa um ponto cego...'),
        *F(4, 5, 1, 2),
        *F(4, 5, 2, 3),
        *F(4, 5, 3, 4),
    ]),
    N('p426v', 'p4', votos(4, 5), 'Quatro votos no Laranja.', pad=1.8),
    N('p427', 'p4', ejecao(4, 5), 'O Apostador, fora. [[m:dicaprio-toast:right:2.5]]', pad=1.4),
    N('p428', 'p4', comp('AU4Fim', partida=4, foco='Azul'),
      '[[s:tada:0.5]] Tripulantes venceram, com quatro vivos e quase todas as tarefas feitas. [[m:we-did-it:right:2.5]] E o Laranja, um Qwen que entrou nessa temporada, acertou duas apostas. Mas o scan que não ligou entregou ele.'),

    # ------------------------------------------------------------------ FIM
    N('f01', 'fim', comp('AU4Placar'),
      'Placar da temporada. [[s:drumroll:0.5]] Tripulantes três, impostores um. [[m:stonks:right:2.5]] No episódio passado, os tripulantes não tinham ganhado nenhuma. Agora, com fantasma, Juiz e Anjo da Guarda, viraram o jogo.'),
    N('f02', 'fim', comp('AU4Premios', gatilhos=['assassino da temporada', 'melhor jogada', 'maior traição'], premios=[
        {'titulo': 'ASSASSINO DA TEMPORADA', 'cores': ['Ciano'], 'nome': 'Ciano · Claude Haiku', 'stat': 'Bombardeiro · 4 mortes, todas de bomba', 'som': 'explosion'},
        {'titulo': 'MELHOR JOGADA', 'cores': ['Laranja'], 'nome': 'Laranja · Qwen 3.8 27B', 'stat': 'Apostador · acertou 2 apostas seguidas', 'som': 'transformar'},
        {'titulo': 'MAIOR TRAIÇÃO', 'cores': ['Bordo'], 'nome': 'Bordô · DeepSeek', 'stat': 'votou no parceiro... e foi expulso pelo outro', 'som': 'faca'},
    ]),
      'O assassino da temporada: o Ciano, um Claude Haiku, com quatro mortes, todas de bomba. [[m:mic-drop:right:2.2]] A melhor jogada: o Laranja, acertando duas apostas seguidas. E a maior traição: o Bordô, que votou no próprio parceiro... e depois foi expulso pelo outro.'),
    N('f03', 'fim', comp('AU4Nave', v5=True),
      'E pro episódio cinco? Mapa Polus? Mais neutros? O Canibal finalmente comendo alguém? [[m:big-brain-patrick:right:2]] Deixa nos comentários, que eu leio todos. Vocês viram: boa parte desse episódio veio de vocês.'),
    N('f04', 'fim', titulo('obrigado por assistir', 'SE INSCREVE NO CANAL', 'e comenta qual função você quer no próximo'),
      'Se você curtiu, deixa o like, se inscreve, e me conta qual foi a jogada mais genial. [[s:tada:0.5]] Até o próximo!', pad=1.5),
]

CUES = [  # uma música por bloco
    ('a01', 'sneaky-snitch', 0),
    ('a02', 'monkeys-spinning-monkeys', 0, 1.0, True),
    ('a09', 'voxel-revolution', 0),
    ('n01', 'pixel-peeker-polka-faster', 0),
    ('p101', '8bit-dungeon-level', 0),
    ('p103', 'thinking-music', 0),
    ('p106', 'fluffing-a-duck', 0),
    ('p111', 'decisions', 0),
    ('p114', 'chipper-doodle-v2', 0),
    ('p202', 'sneaky-snitch', 30),
    ('p204', 'thinking-music', 40),
    ('p208', 'relent', 0),
    ('p210', 'pixelland', 0),
    ('p213', 'bit-shift', 0),
    ('p216', 'quirky-dog', 0),
    ('p219', 'heroic-age', 0),
    ('p301', 'itty-bitty-8-bit', 0),
    ('p304', '8bit-dungeon-boss', 0),
    ('p307', 'thinking-music', 0),
    ('p310', 'mega-hyper-ultrastorm', 0),
    ('p312', 'decisions', 30),
    ('p315', '8bit-dungeon-boss', 40, 1.0, True),
    ('p401', 'airship-serenity', 0),
    ('p403', 'quirky-dog', 0),
    ('p406', 'relent', 30),
    ('p410', 'despair-and-triumph', 0),
    ('p414', 'sneaky-snitch', 60),
    ('p417', 'mega-hyper-ultrastorm', 0),
    ('p419', 'bit-shift', 40),
    ('p421', 'decisions', 0),
    ('p425', 'heroic-age', 0, 1.0, True),
    ('f01', 'monkeys-spinning-monkeys', 30),
]
SEM_TRILHA = ['AU4Revela', 'AU4Fim', 'AU4Shhh', 'AU4Aposta']
