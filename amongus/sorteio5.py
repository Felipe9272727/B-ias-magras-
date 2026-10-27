#!/usr/bin/env python3
"""Sorteio da temporada do Among Us 5 (mapa Polus) com aleatoriedade de verdade (módulo secrets = fonte do sistema).

As 15 cores do Among Us 4 continuam com as mesmas IAs (o público reconhece os personagens), trocando o GPT-5.6 Luna
pelo GPT-6.1 Terra; as 3 cores novas (Banana, Caqui e Rose) ficam com a novata Xiaomi MiMo V2.6 Flash. Para cada
partida sorteia: os papéis (4 impostores de 4 empresas diferentes, entre as 10 funções de impostor; 3 das 7 neutras;
11 das 15 de tripulante), o Casal (2 cores quaisquer) e a semente do motor. O sorteio se repete até que cada função
pedida nos comentários (e as consertadas) apareça em pelo menos uma das partidas.
Grava logs5/temporada.json; o motor (jogo5.mjs --temporada ... --partida N) só lê, não sorteia nada.

Uso: python3 sorteio5.py [--partidas 4] [--saida logs5/temporada.json]
"""
import argparse, json, secrets
from datetime import datetime, timezone
from pathlib import Path

R = secrets.SystemRandom()
CORES = ['Vermelho', 'Azul', 'Verde', 'Rosa', 'Laranja', 'Amarelo', 'Preto', 'Branco', 'Roxo', 'Marrom', 'Ciano', 'Lima', 'Cinza', 'Coral', 'Bordo', 'Banana', 'Caqui', 'Rose']
TROCA = {'or:openai/gpt-5.6-luna': 'or:openai/gpt-6.1-terra', 'or:minimax/minimax-m3.1-flash:free': 'or:minimax/minimax-m3.1-flash'}  # o :free foi aposentado em 22/10
NOVAS = {'Banana': 'or:xiaomi/mimo-v2.6-flash', 'Caqui': 'or:xiaomi/mimo-v2.6-flash', 'Rose': 'or:xiaomi/mimo-v2.6-flash'}
IMPOSTORES = ['Metamorfo', 'Espectro', 'Vibora', 'Envenenador', 'Gangster', 'Chantagista', 'Possuidor', 'Bombardeiro', 'Apostador', 'Chato']
NEUTROS = ['Palhaco', 'Glutao', 'Sobrevivente', 'Piromante', 'Paciente', 'Camuflador', 'Traidor']
TRIPULANTES = ['Engenheiro', 'Cientista', 'Localizador', 'Barulhento', 'Xerife', 'Medico', 'Prefeito', 'Detetive', 'Influencer', 'Juiz', 'Seguranca', 'Perito', 'Mecanico', 'Doutor', 'Armadilheiro']
# pedidas nos comentários / prometidas pelo Felipe / consertadas: cada uma entra em pelo menos uma partida
OBRIGATORIAS = ['Vibora', 'Chato', 'Paciente', 'Camuflador', 'Traidor', 'Doutor', 'Armadilheiro', 'Juiz', 'Glutao', 'Metamorfo', 'Possuidor']

# ritmo afinado no Among Us 4 + Metamorfo com recarga maior (pedido do público)
CFG = json.loads((Path(__file__).parent / 'logs4' / 'temporada.json').read_text())['partidas'][-1]['cfg']
CFG = {**CFG, 'metamorfoRecarga': 12, 'nImpostores': 4, 'nNeutros': 3}


def sortear_partida(cores):
    empresas = R.sample(sorted(set(cores.values())), 4)
    imps = [R.choice([c for c, p in cores.items() if p == e]) for e in empresas]
    papeis_imp = R.sample(IMPOSTORES, 4)
    resto = [c for c in CORES if c not in imps]
    outros = R.sample(TRIPULANTES, 11) + R.sample(NEUTROS, 3)
    R.shuffle(outros)
    papeis = {**dict(zip(imps, papeis_imp)), **dict(zip(resto, outros))}
    return {'papeis': {c: papeis[c] for c in CORES}, 'casal': R.sample(CORES, 2), 'seed': secrets.randbelow(2**31), 'cfg': CFG}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--partidas', type=int, default=4)
    ap.add_argument('--saida', default=str(Path(__file__).parent / 'logs5' / 'temporada.json'))
    a = ap.parse_args()
    au4 = json.loads((Path(__file__).parent / 'logs4' / 'temporada.json').read_text())
    cores = {**{c: TROCA.get(p, p) for c, p in au4['cores'].items()}, **NOVAS}
    tentativas = 0
    while True:
        tentativas += 1
        partidas = [sortear_partida(cores) for _ in range(a.partidas)]
        presentes = {p for x in partidas for p in x['papeis'].values()}
        if all(o in presentes for o in OBRIGATORIAS):
            break
    out = {'sorteado_em': datetime.now(timezone.utc).isoformat(timespec='seconds'), 'fonte': 'python secrets (SystemRandom)', 'tentativas': tentativas, 'cores': cores, 'partidas': partidas}
    Path(a.saida).parent.mkdir(parents=True, exist_ok=True)
    Path(a.saida).write_text(json.dumps(out, ensure_ascii=False, indent=1))
    n = {}
    for p in cores.values(): n[p] = n.get(p, 0) + 1
    print('IAs:', ', '.join(f'{k} x{v}' for k, v in n.items()), f'| sorteios até cobrir as obrigatórias: {tentativas}')
    for i, p in enumerate(partidas, 1):
        imps = ', '.join(f'{c} ({p["papeis"][c]}, {cores[c]})' for c in CORES if p['papeis'][c] in IMPOSTORES)
        neu = ', '.join(f'{c} ({p["papeis"][c]})' for c in CORES if p['papeis'][c] in NEUTROS)
        novos = ', '.join(f'{c} ({p["papeis"][c]})' for c in CORES if p['papeis'][c] in ('Doutor', 'Armadilheiro', 'Juiz'))
        print(f'partida {i}: impostores = {imps} | neutros = {neu} | {novos} | casal = {" e ".join(p["casal"])}')
    print('→', a.saida)


if __name__ == '__main__':
    main()
