# -*- coding: utf-8 -*-
"""JOGO DE CONFIANÇA (ideia do @Pursuer_M4). O TEXTO (narração, citações, selo, meme, som) vem do storyboard do Fable
(video/youtube/confianca/storyboard.md), lido pelo build_timeline_confianca.py. Aqui fica o que a edição decide: a tela de
cada cena (VIS), capítulos e música. A tela 'mesa' sem tique pega o minijogo/tique da primeira citação da cena."""

def mesa(foco=(), etiquetas=None, mj=None, tique=None):
    return dict(tipo='mesa', foco=list(foco), **({'etiquetas': etiquetas} if etiquetas else {}), **({'mj': mj} if mj else {}), **({'tique': tique} if tique else {}))

def cartao(titulo, linhas=(), selo=None, sub=None):
    return dict(tipo='cartao', titulo=titulo, linhas=list(linhas), **({'selo': selo} if selo else {}), **({'sub': sub} if sub else {}))

def bomba(cor, fio=None):
    return dict(tipo='bomba', cor=cor, **({'fio': fio} if fio else {}))

POST = 'quem ganha nesse jogo é aquele que for mais traíra ou mais gente boa'
VIS = {
    'A1': bomba('Roxo', 'preto'),
    'A2': cartao('IDEIA DE VÍDEO · @Pursuer_M4', [POST], selo='TAMBÉM FORAM IDEIA DELE: PALHAÇO · CARRASCO'),
    'A3': mesa(['Vermelho', 'Verde'], mj=1, tique=1),
    'A4': mesa([], mj=1, tique=1),
    'D1': mesa([], 'nomes', 1, 1), 'D2': mesa(['Laranja'], 'nomes'), 'D3': mesa(['Verde', 'Laranja'], 'nomes'), 'D4': mesa(['Rosa'], 'nomes'),
    'D5': mesa(['Ciano'], 'nomes'), 'D6': dict(tipo='vencedor', mj=1),
    'B1': dict(tipo='telao', tique=1), 'B2': dict(tipo='telao'), 'B3': dict(tipo='telao'), 'B4': mesa([], mj=2, tique=3),
    'B5': dict(tipo='telao'), 'B6': dict(tipo='telao'), 'B7': dict(tipo='moedas'),
    'V1': mesa(['Verde'], mj=3, tique=1), 'V2': mesa(['Verde']), 'V3': mesa(['Roxo', 'Ciano']), 'V4': dict(tipo='urna'), 'V5': dict(tipo='urna', resultado=True),
    'F1': dict(tipo='vestiario'), 'F2': dict(tipo='vestiario'), 'F3': mesa([], 'fantasias', 4, None), 'F4': dict(tipo='vestiario', suspeitos=True), 'F5': dict(tipo='vestiario', suspeitos=True, revela=True),
    'X1': bomba('Vermelho'), 'X2': mesa([], 'bombas'), 'X3': mesa(['Ciano'], 'bombas'), 'X4': bomba('Roxo'), 'X5': bomba('Roxo'), 'X6': bomba('Roxo'),
    'X7': bomba('Roxo', 'preto'), 'X8': bomba('Vermelho'), 'X9': mesa(['Vermelho', 'Verde'], 'bombas', 5, 6), 'X10': bomba('Vermelho', 'azul'), 'X11': dict(tipo='bombas'),
    'R1': dict(tipo='placar', fase='mini'), 'R2': dict(tipo='placar', fase='pacifista'), 'R3': dict(tipo='placar', fase='duplo'), 'R4': dict(tipo='placar', fase='final'),
    'Z1': dict(tipo='trofeus', itens=[['PACIFISTA DA PARTIDA', 'Vermelho · 15 pontos · 0 botões vermelhos', 'Vermelho'], ['MAIS TRAIÇÕES', 'Laranja · 3 facadas + 1 bomba', 'Laranja'],
                                     ['MAIS CORTADO', 'Ciano · 3 minijogos sem linha', 'Ciano'], ['VOTO MAIS CARO', 'Verde · voto x2', 'Verde']]),
    'Z2': cartao('O QUE O @Pursuer_M4 ESCREVEU', [POST], selo='TRAIR: +4 · COOPERAR: +6'),
    'Z3': cartao('IDEIA DE @Pursuer_M4', ['o jogo, as regras e os 5 minijogos são dele', 'no último tique, com uma fonte só: você cortava o fio?'], selo='COMENTA AÍ'),
}
CAPS = {'D1': ('1 · DESCONHECIDOS', 'Descubra o nome dos outros sem falar o seu.'), 'B1': ('2 · DILEMA DOS BOTÕES', 'Verde divide. Vermelho rouba.'),
        'V1': ('3 · VOTAÇÃO DA JUSTIÇA', 'Mais votos verdes ganha 3. Mais vermelhos perde 3.'), 'F1': ('4 · VESTIÁRIO MALUCO', 'Um tem a fantasia diferente e nem ele sabe.'),
        'X1': ('5 · INSTRUÇÕES EXPLOSIVAS', 'O manual da sua bomba está com outra IA.'), 'R1': ('A REVELAÇÃO', 'O placar secreto abre agora.')}
MUSICA = {'A1': 'hitman', 'D1': 'sneaky-snitch', 'B1': 'scheming-weasel-faster', 'V1': 'investigations', 'F1': 'quirky-dog', 'X1': 'thinking-music',
          'X4': 'darkest-child', 'X8': 'night-of-chaos', 'R1': 'spellbound', 'R2': 'heroic-age', 'Z1': 'winner-winner'}
TROCA_MEME = {'goodbye-see-ya': 'seu-madruga', 'hide-the-pain-harold': 'monkey-puppet-awkward', 'cat-ok-thumbs-up': 'pedro-raccoon', 'wait-who-are-you': 'blinking-white-guy', 'coffin-dance-byu': 'coffin-dance'}
