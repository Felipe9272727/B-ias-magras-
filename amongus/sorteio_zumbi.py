#!/usr/bin/env python3
"""Sorteio do MODO ZUMBI (Among IA 6) com aleatoriedade de verdade (módulo secrets = fonte do sistema).

Elenco: as 18 cores do Among Us 5 com as MESMAS IAs (o público reconhece os personagens) + Turquesa (Tencent HY4) e
Dourado (Liquid LFM 2.5 24B). Para cada partida sorteia: as profissões (2 Doutores, Engenheiro, Vigia, Enlouquecido e
15 Sobreviventes), o Paciente Zero (um Sobrevivente; nem ele sabe), o tique em que ele vira zumbi, a sala inicial de
cada um, a ordem dos tipos de zumbi (cada um que vira pega o próximo da lista) e a semente para o resto.
Grava logs_zumbi/temporada.json; o motor (zumbi.mjs --temporada ... --partida N) só lê, não sorteia nada disso.

Uso: python3 sorteio_zumbi.py [--partidas 4] [--saida logs_zumbi/temporada.json]
"""
import argparse, json, secrets
from datetime import datetime, timezone
from pathlib import Path

R = secrets.SystemRandom()
TROCA = {'or:openai/gpt-6.1-terra': 'or:openai/gpt-6-luna'}  # 5/11: o Terra foi 43% do gasto (vale da partida 4 do AU6 em diante)
NOVAS = {'Turquesa': 'or:tencent/hy4', 'Dourado': 'or:liquid/lfm-2.5-24b-a2b'}
SALAS_INI = ['Lancamento', 'Enfermaria', 'Comunicacoes', 'Vestiario', 'Descontaminacao', 'Reator', 'Laboratorio', 'Escritorio', 'Admin', 'Estufa', 'Refeitorio', 'Varanda', 'Deposito']
TIPOS = ['Normal', 'Grande', 'Rapido', 'Cuspidor', 'Uivador']
PZ_VIRA = (5, 8)


def sortear_partida(cores):
    nomes = list(cores)
    papeis = ['Doutor', 'Doutor', 'Engenheiro', 'Vigia', 'Enlouquecido'] + ['Sobrevivente'] * (len(nomes) - 5)
    R.shuffle(papeis)
    papeis = dict(zip(nomes, papeis))
    pz = R.choice([c for c, p in papeis.items() if p == 'Sobrevivente'])
    # tipos de zumbi: sacos com os 5 tipos embaralhados (todo tipo aparece antes de repetir)
    tipos = [t for _ in range(len(nomes) // len(TIPOS) + 1) for t in R.sample(TIPOS, len(TIPOS))][: len(nomes)]
    return {'papeis': papeis, 'pacienteZero': pz, 'pzViraEm': R.randint(*PZ_VIRA), 'salas': {c: R.choice(SALAS_INI) for c in nomes},
            'tiposZumbi': tipos, 'seed': secrets.randbelow(2**31)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--partidas', type=int, default=4)
    ap.add_argument('--saida', default=str(Path(__file__).parent / 'logs_zumbi' / 'temporada.json'))
    a = ap.parse_args()
    au5 = json.loads((Path(__file__).parent / 'logs5' / 'temporada.json').read_text())
    cores = {**{c: TROCA.get(p, p) for c, p in au5['cores'].items()}, **NOVAS}
    partidas = [sortear_partida(cores) for _ in range(a.partidas)]
    out = {'sorteado_em': datetime.now(timezone.utc).isoformat(timespec='seconds'), 'fonte': 'python secrets (SystemRandom)', 'cores': cores, 'partidas': partidas}
    Path(a.saida).parent.mkdir(parents=True, exist_ok=True)
    Path(a.saida).write_text(json.dumps(out, ensure_ascii=False, indent=1))
    for i, p in enumerate(partidas, 1):
        print(f"partida {i}: Paciente Zero {p['pacienteZero']} (vira no tique {p['pzViraEm']}), Enlouquecido {[c for c, x in p['papeis'].items() if x == 'Enlouquecido'][0]}")


if __name__ == '__main__':
    main()
