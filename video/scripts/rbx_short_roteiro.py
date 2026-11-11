#!/usr/bin/env python3
"""Roteiro do SHORT do Roblox: "Troquei o cérebro da IA pelo mais forte de todos" -> roteiro/roteiro_roblox_short.json.
Gancho = a mensagem de limite (clímax) e depois a escalada Haiku -> Sonnet -> Opus, fechando com o Carlos sobrevivendo
parado e a pergunta ao público. Mesmos fatos e falas do vídeo longo (conferidos no log do agente); narrador = Felipe (Bush).
Tempos de origem em segundos (A = partida_ia, B = partida_ia2). Gera: python3 rbx_short_roteiro.py && \
python3 build_timeline_roblox.py --nome=roblox_short"""
import json
from pathlib import Path

C = []
HAIKU = dict(jev='JEV', olho='CLAUDE HAIKU', chat='CLAUDE HAIKU')
SONNET = dict(jev='JEV', olho='CLAUDE SONNET', chat='CLAUDE SONNET')
OPUS = dict(jev='JEV', olho='CLAUDE SONNET', chat='CLAUDE OPUS')


def cena(id, clip, itens, cer, **k):
    C.append(dict(id=id, clip=clip, itens=itens, cerebro=cer, hud=False, **k))


cena('g', ['B', 380, 394], [
    ['n', 'Botei a IA mais forte que existe pra jogar Roblox. A primeira mensagem dela foi essa.'],
    ['marca'], ['s', 'glitch', 0.6], ['voz', "You've hit your five hour limit."], ['p', 0.4],
    ['selo', 'VOCÊ ATINGIU SEU LIMITE DE 5 HORAS'], ['meme', 'blinking-white-guy']], OPUS, cam=[0.5, 0.45, 1.0, 1.3], visual='limite')
cena('r1', ['A', 180, 197], [
    ['n', 'Volta um pouco. O primeiro cérebro do Carlos foi o Claude Haiku. Inventou lava, e morreu oito vezes.'],
    ['ia', 'bush se vc cair na lava eu não te salvo kkk', 'Bush, se você cair na lava, eu não te salvo.'],
    ['selo', 'LAVA NA TELA: ZERO'], ['meme', 'confused-travolta']], dict(HAIKU, muda=['olho', 'chat']), cam=[0.5, 0.55, 1.1, 1.3])
cena('r3', ['B', 344, 364], [
    ['atualiza', 'tudo', 'HAIKU', 'SONNET', 'um modelo mais forte'],
    ['n', 'Troquei pelo Sonnet, e ele zoou meu erro de digitação.'],
    ['ia', 'slk bush, "exited" nao existe mn, ce ta digitando com o pe kkkk', 'Cê é louco, Bush. Exited não existe, mano. Cê tá digitando com o pé.'],
    ['meme', 'mic-drop']], dict(SONNET, muda=['olho', 'chat']), cam=[0.5, 0.55, 1.1, 1.3])
cena('r4', ['B', 368, 400], [
    ['atualiza', 'chat', 'SONNET', 'OPUS', 'o mais forte de todos'],
    ['n', 'Aí botei o Opus, o mais forte de todos. E a primeira mensagem foi aquela.'], ['ir', 384.5], ['marca'], ['s', 'glitch', 0.6], ['p', 1.2],
    ['meme', 'nuclear-mushroom-cloud', 'full', 'O MODELO MAIS FORTE DE TODOS', 'explosion'],
    ], dict(OPUS, muda=['chat']), cam=[0.5, 0.45, 1.0, 1.35], visual='limite')
cena('r5', ['B', 418, 446], [
    ['n', 'Sem cérebro, ficou parado no meio da tempestade.'], ['crono', 'CARLOS PARADO', 0, 80, 4.0],
    ['selo', 'CÉREBRO DESLIGADO'], ['p', 1.2]], OPUS, cam=[0.5, 0.6, 1.1, 1.4])
cena('r6', ['B', 466, 480], [
    ['n', 'Só que olha a lista.'], ['ir', 471.5], ['seta', 0.31, 0.47, 'OLHA O CARLOS', 'baixo'], ['p', 0.6],
    ['selo', 'SOBREVIVEU PARADO', '#2aa84a'], ['p', 1.8], ['meme', 'dicaprio-slow-clap', 'full', 'A MELHOR JOGADA DO CARLOS: NENHUMA', 'crowd-applause']], OPUS, cam=[0.38, 0.5, 1.0, 1.2])
cena('f', ['B', 480, 492], [
    ['n', 'Pensando, morreu oito vezes. Desligado, sobreviveu.'], ['numero', '8 MORTES', '1 vitória parado'],
    ['n', 'Qual IA você botaria no lugar dele?'], ['meme', 'dicaprio-pointing']], OPUS, cam=[0.45, 0.5, 1.0, 1.15], folga=1.2)

out = Path(__file__).resolve().parents[1] / 'roteiro' / 'roteiro_roblox_short.json'
json.dump({'titulo': 'Troquei o cérebro da IA pelo mais forte de todos', 'cenas': C}, open(out, 'w'), ensure_ascii=False, indent=1)
print(len(C), 'cenas')
