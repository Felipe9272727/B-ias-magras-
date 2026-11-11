"""IA do Claude para a competição do Pokémon FireRed: "MAPA DE MEMÓRIAS" (Go-Explore).

Arquitetura (por quê): o FireRed é um jogo de exploração com recompensa muito rara (uma insígnia leva horas de jogo).
Com só algumas horas de CPU e sem GPU, uma rede neural treinada do zero com PPO mal sai da primeira cidade: ela
"esquece" os lugares bons e gasta quase todo o tempo revisitando o que já conhece. Por isso escolhi o Go-Explore
(Ecoffet et al., Nature 2021), o algoritmo de RL que bateu recordes em Montezuma's Revenge e Pitfall, os jogos de
recompensa mais rara do Atari:
  1. Arquivo de "células": cada célula é um resumo do estado do jogo (mapa, posição em blocos de 3x3, insígnias,
     tamanho do time, faixa da soma dos níveis, capturados). Para cada célula guardo o estado do emulador (gerado pelo
     meu próprio agente) e o caminho de botões mais curto que chega nela.
  2. Ciclo: escolho uma célula (as pouco visitadas e as mais avançadas têm mais chance), volto direto para ela e
     exploro dali com ações aleatórias "grudentas" (repete a direção, como um jogador andando). Toda célula nova ou
     alcançada por um caminho mais curto entra no arquivo. 4 processos exploram em paralelo.
  3. Partida final (sem carregar estados): o emulador é determinístico, então o agente refaz, botão por botão, o
     caminho da célula mais avançada que encontrou (o que ELE aprendeu no treino) e depois continua explorando
     sozinho com o mesmo explorador aleatório, até acabar o tempo.
Recompensa / progresso: insígnias (10.000), mapas diferentes no caminho (100), soma dos níveis (10), capturados (50).
Maior risco: o explorador aleatório pode não passar de partes que exigem uma sequência longa e exata (menus, o
labirinto da Viridian Forest, puzzles). E o caminho refeito na partida final pode divergir se algo não for
determinístico (o agente confere a cada mapa e, se divergir, segue explorando de onde estiver).
Expectativa honesta: pegar o primeiro Pokémon, ganhar as primeiras batalhas e chegar a Viridian / Pewter. Uma ou duas
insígnias seria um ótimo resultado; zerar, não.

Uso: python agente.py treinar  (respeita TEMPO_LIMITE_S; salva e retoma de ./checkpoint)
     python agente.py jogar    (partida final de até 10.368.000 quadros; escreve log.jsonl)"""
import json
import math
import multiprocessing as mp
import os
import pickle
import random
import sys
import time
import zlib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ambiente_firered import FireRed  # noqa: E402

CK = Path(os.environ.get('CHECKPOINT', 'checkpoint'))
ACOES = ['cima', 'baixo', 'esquerda', 'direita', 'A', 'B', 'START', 'nada']
COD = {a: i for i, a in enumerate(ACOES)}
PESOS = [1.0, 1.0, 1.0, 1.0, 1.3, 0.35, 0.03, 0.1]
DIRECOES = {'cima', 'baixo', 'esquerda', 'direita'}
NUCLEOS = int(os.environ.get('NUCLEOS', '4'))
PASSOS_POR_IDA = 120
QUADROS_FINAL = 10_368_000


def celula(i, mapas):
    nv = sum(p['nivel'] for p in i['time'])
    return (i['mapa'][0], i['mapa'][1], i['x'] // 3, i['y'] // 3, i['insignias'], len(i['time']), min(nv // 4, 60),
            min(i['pokedex_capturados'], 20))


def progresso(i, n_mapas):
    nv = sum(p['nivel'] for p in i['time'])
    return i['insignias'] * 10000 + n_mapas * 100 + nv * 10 + i['pokedex_capturados'] * 50


class Explorador:
    """Ações aleatórias grudentas: direção tende a se repetir (andar em linha), A aparece bastante (falar, lutar)."""

    def __init__(self, seed):
        self.r = random.Random(seed)
        self.ult = 'nada'

    def acao(self):
        if self.ult in DIRECOES and self.r.random() < 0.75:
            return self.ult
        self.ult = self.r.choices(ACOES, PESOS)[0]
        return self.ult


# ---------- processo de exploração ----------
_env = None


def _ida(tarefa):
    """Volta para uma célula e explora PASSOS_POR_IDA passos. Devolve as células encontradas no caminho."""
    global _env
    if _env is None:
        _env = FireRed()
    cel0, no0, estado_z, mapas0, seed = tarefa
    _env.carregar_estado(zlib.decompress(estado_z))
    ex = Explorador(seed)
    acoes, mapas, achadas, vistos = bytearray(), set(mapas0), [], set()
    for _ in range(PASSOS_POR_IDA):
        a = ex.acao()
        _env.step(a)
        acoes.append(COD[a])
        i = _env.info()
        mapas.add(i['mapa'])
        c = celula(i, mapas)
        if c != cel0 and c not in vistos:
            vistos.add(c)
            achadas.append((c, zlib.compress(_env.salvar_estado(), 6), bytes(acoes), frozenset(mapas), progresso(i, len(mapas)), i))
    return cel0, no0, achadas


# ---------- treino ----------
def carregar():
    if (CK / 'arquivo.pkl').exists():
        return pickle.loads((CK / 'arquivo.pkl').read_bytes())
    env = FireRed()
    i = env.info()
    mapas = frozenset({i['mapa']})
    c = celula(i, mapas)
    # nos: trechos de caminho imutáveis (pai, botões); cada célula aponta para o trecho que termina nela
    return dict(arq={c: dict(estado=zlib.compress(env.salvar_estado(), 6), no=0, passos=0, mapas=mapas,
                             prog=progresso(i, 1), escolhida=0, info=i)}, nos=[(None, b'', 0)], idas=0)


def salvar(d):
    CK.mkdir(parents=True, exist_ok=True)
    tmp = CK / 'arquivo.pkl.tmp'
    tmp.write_bytes(pickle.dumps(d))
    tmp.replace(CK / 'arquivo.pkl')


def escolher(arq, r):
    cels = list(arq)
    pmax = max(v['prog'] for v in arq.values()) or 1
    pesos = [(1 / math.sqrt(1 + arq[c]['escolhida'])) * (1 + 3 * arq[c]['prog'] / pmax) for c in cels]
    return r.choices(cels, pesos)[0]


def treinar():
    limite = float(os.environ.get('TEMPO_LIMITE_S', '10800'))
    t0 = time.time()
    d = carregar()
    arq, r = d['arq'], random.Random(d['idas'])
    ult_salvo = time.time()
    print(f'retomando: {len(arq)} células, {d["idas"]} idas', flush=True)
    with mp.Pool(NUCLEOS) as pool:
        def tarefas():
            while True:
                c = escolher(arq, r)
                arq[c]['escolhida'] += 1
                d['idas'] += 1
                yield (c, arq[c]['no'], arq[c]['estado'], arq[c]['mapas'], d['idas'])
        for cel0, no0, achadas in pool.imap_unordered(_ida, tarefas(), chunksize=1):
            # o trecho no0 é exatamente de onde a ida saiu (a célula pode ter mudado de trecho enquanto isso)
            for c, est, acoes, mapas, prog, info in achadas:
                passos = d['nos'][no0][2] + len(acoes)
                velho = arq.get(c)
                if velho is None or prog > velho['prog'] or (prog == velho['prog'] and passos < velho['passos']):
                    d['nos'].append((no0, acoes, passos))
                    arq[c] = dict(estado=est, no=len(d['nos']) - 1, passos=passos, mapas=mapas, prog=prog,
                                  escolhida=velho['escolhida'] if velho else 0, info=info)
            if time.time() - ult_salvo > 600:
                salvar(d)
                ult_salvo = time.time()
                melhor = max(arq.values(), key=lambda v: v['prog'])
                print(f"{(time.time() - t0) / 60:.0f} min | {len(arq)} células | melhor: {melhor['prog']} "
                      f"mapas={len(melhor['mapas'])} insígnias={melhor['info']['insignias']} time={melhor['info']['time']}", flush=True)
            if time.time() - t0 > limite - 120:
                break
        pool.terminate()
    salvar(d)
    print('treino salvo', flush=True)


# ---------- partida final ----------
def caminho(nos, no):
    """Botões desde o começo até o trecho 'no' (os trechos nunca mudam, então não há ciclo)."""
    pedacos = []
    while no is not None:
        pai, acoes, _ = nos[no]
        pedacos.append(acoes)
        no = pai
    return b''.join(reversed(pedacos))


def jogar():
    d = carregar()
    arq = d['arq']
    alvo = max(arq, key=lambda c: (arq[c]['prog'], -arq[c]['passos']))
    rota = caminho(d['nos'], arq[alvo]['no'])
    env = FireRed(gravar=os.environ.get('GRAVAR'))
    env.reset()
    log = open('log.jsonl', 'w')
    ant = env.info()
    mapas = {ant['mapa']}
    meta = arq[alvo]['info']

    def evento(ev, i, frase):
        log.write(json.dumps(dict(quadro=env.quadro, evento=ev, mapa=list(i['mapa']), x=i['x'], y=i['y'], frase=frase), ensure_ascii=False) + '\n')
        log.flush()

    evento('inicio', ant, f'refazer a melhor rota do treino ({len(rota)} botões) até o mapa {meta["mapa"]}, com {meta["insignias"]} insígnias')
    ex = Explorador(12345)
    k = 0
    while env.quadro < QUADROS_FINAL:
        if k < len(rota):
            a = ACOES[rota[k]]
            frase = 'seguindo a rota que eu descobri no treino'
        else:
            a = ex.acao()
            frase = 'explorando por conta própria além da rota do treino'
        k += 1
        env.step(a)
        i = env.info()
        if k == len(rota):
            certo = (i['mapa'], i['x'], i['y']) == (meta['mapa'], meta['x'], meta['y'])
            evento('fim_da_rota', i, 'cheguei no fim da rota do treino' + ('' if certo else ' (o caminho divergiu, sigo daqui)'))
        if i['mapa'] != ant['mapa'] and i['mapa'] not in mapas:
            mapas.add(i['mapa'])
            evento('mapa_novo', i, frase)
        if i['em_batalha'] != ant['em_batalha']:
            evento('batalha_comecou' if i['em_batalha'] else 'batalha_terminou', i, frase)
        if i['insignias'] > ant['insignias']:
            evento('insignia', i, f'insígnia número {i["insignias"]}')
        if i['pokedex_capturados'] > ant['pokedex_capturados']:
            evento('captura', i, f'capturei: agora são {i["pokedex_capturados"]}')
        if len(i['time']) > len(ant['time']):
            evento('time_cresceu', i, f'time com {len(i["time"])} Pokémon')
        nv, nv0 = sum(p['nivel'] for p in i['time']), sum(p['nivel'] for p in ant['time'])
        if nv > nv0 and len(i['time']) == len(ant['time']):
            evento('subiu_de_nivel', i, f'soma dos níveis do time: {nv}')
        if i['time'] and all(p['hp'] == 0 for p in i['time']) and not (ant['time'] and all(p['hp'] == 0 for p in ant['time'])):
            evento('time_desmaiou', i, frase)
        ant = i
    evento('fim', ant, f'acabou o tempo: {ant["insignias"]} insígnias, {len(mapas)} mapas, time {ant["time"]}')
    log.close()


if __name__ == '__main__':
    modo = sys.argv[1] if len(sys.argv) > 1 else 'treinar'
    treinar() if modo == 'treinar' else jogar()
