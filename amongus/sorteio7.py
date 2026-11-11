#!/usr/bin/env python3
"""Sorteio da temporada do AMONG IA 7 (Mira HQ, modo clássico) com aleatoriedade de verdade (módulo secrets).

Elenco: as 20 cores do AU6 (zumbi) com as mesmas IAs, trocando o Turquesa (Tencent HY4) pela Meta Muse Ember e o
Dourado (Liquid LFM 2.5 24B) pela Nex N2.6. Por partida: 4 impostores de 4 empresas diferentes (entre as funções de
impostor), 3 neutros e 13 tripulantes, o Casal e a semente do motor. As 4 funções NOVAS pedidas nos comentários
(Ladrão de Função, Carrasco, Teletransportador e Policial) entram em TODAS as partidas; Glutão, Víbora e Médico (os que
mais pediram de volta) em pelo menos uma.
Grava logs7/temporada.json; o motor (jogo7.mjs --temporada ... --partida N) só lê.
Uso: python3 sorteio7.py [--partidas 4]
"""
import argparse, json, secrets
from datetime import datetime, timezone
from pathlib import Path

R = secrets.SystemRandom()
AQUI = Path(__file__).parent
CORES = ['Vermelho', 'Azul', 'Verde', 'Rosa', 'Laranja', 'Amarelo', 'Preto', 'Branco', 'Roxo', 'Marrom', 'Ciano', 'Lima', 'Cinza', 'Coral', 'Bordo', 'Banana', 'Caqui', 'Rose', 'Turquesa', 'Dourado']
NOVAS = {'Turquesa': 'or:meta/muse-ember', 'Dourado': 'or:nex-agi/nex-n2.6'}
IMPOSTORES = ['Metamorfo', 'Espectro', 'Vibora', 'Envenenador', 'Gangster', 'Chantagista', 'Possuidor', 'Bombardeiro', 'Apostador', 'Chato', 'Teletransportador']
NEUTROS = ['Palhaco', 'Glutao', 'Sobrevivente', 'Piromante', 'Paciente', 'Camuflador', 'Traidor', 'Ladrao', 'Carrasco']
TRIPULANTES = ['Engenheiro', 'Cientista', 'Localizador', 'Barulhento', 'Xerife', 'Medico', 'Prefeito', 'Detetive', 'Influencer', 'Juiz', 'Seguranca', 'Perito', 'Mecanico', 'Doutor', 'Armadilheiro', 'Policial']
SEMPRE = {'impostor': ['Teletransportador'], 'neutro': ['Ladrao', 'Carrasco'], 'tripulante': ['Policial']}
PELO_MENOS_UMA = ['Glutao', 'Vibora', 'Medico']
CFG = json.loads((AQUI / 'logs5' / 'temporada.json').read_text())['partidas'][0]['cfg']
CFG = {**CFG, 'nImpostores': 4, 'nNeutros': 3}


def sortear_partida(cores):
    empresas = R.sample(sorted(set(cores.values())), 4)
    imps = [R.choice([c for c, p in cores.items() if p == e]) for e in empresas]
    papeis_imp = SEMPRE['impostor'] + R.sample([p for p in IMPOSTORES if p not in SEMPRE['impostor']], 3)
    R.shuffle(papeis_imp)
    resto = [c for c in CORES if c not in imps]
    neu = SEMPRE['neutro'] + R.sample([p for p in NEUTROS if p not in SEMPRE['neutro']], 1)
    tri = SEMPRE['tripulante'] + R.sample([p for p in TRIPULANTES if p not in SEMPRE['tripulante']], len(resto) - 3 - 1)
    outros = neu + tri
    R.shuffle(outros)
    papeis = {**dict(zip(imps, papeis_imp)), **dict(zip(resto, outros))}
    return {'papeis': {c: papeis[c] for c in CORES}, 'casal': R.sample(CORES, 2), 'seed': secrets.randbelow(2**31), 'cfg': CFG}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--partidas', type=int, default=4)
    ap.add_argument('--saida', default=str(AQUI / 'logs7' / 'temporada.json'))
    a = ap.parse_args()
    au6 = json.loads((AQUI / 'logs_zumbi' / 'temporada.json').read_text())
    cores = {**{c: au6['cores'][c] for c in CORES}, **NOVAS}
    tentativas = 0
    while True:
        tentativas += 1
        partidas = [sortear_partida(cores) for _ in range(a.partidas)]
        presentes = {p for x in partidas for p in x['papeis'].values()}
        if all(o in presentes for o in PELO_MENOS_UMA):
            break
    out = {'sorteado_em': datetime.now(timezone.utc).isoformat(timespec='seconds'), 'fonte': 'python secrets (SystemRandom)', 'tentativas': tentativas, 'cores': cores, 'partidas': partidas}
    Path(a.saida).parent.mkdir(parents=True, exist_ok=True)
    Path(a.saida).write_text(json.dumps(out, ensure_ascii=False, indent=1))
    for i, p in enumerate(partidas, 1):
        imps = ', '.join(f'{c} ({p["papeis"][c]})' for c in CORES if p['papeis'][c] in IMPOSTORES)
        neu = ', '.join(f'{c} ({p["papeis"][c]})' for c in CORES if p['papeis'][c] in NEUTROS)
        pol = [c for c in CORES if p['papeis'][c] == 'Policial'][0]
        print(f'partida {i}: impostores = {imps} | neutros = {neu} | Policial = {pol} | casal = {" e ".join(p["casal"])}')
    print('→', a.saida)


if __name__ == '__main__':
    main()
