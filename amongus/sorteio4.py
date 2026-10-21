#!/usr/bin/env python3
"""Sorteio da temporada do Among Us 4 com aleatoriedade de verdade (módulo secrets = fonte do sistema operacional).

As cores de cada IA são as mesmas do Among Us 3 (logs3/temporada.json), para o público reconhecer os personagens;
as duas cores do Gemini passam para o Qwen. Para cada partida sorteia: os papéis (3 impostores de 3 empresas
diferentes, escolhidas entre as 9 funções de impostor; 2 das 5 neutras; 10 das 14 de tripulante), o Casal
(2 cores quaisquer) e a semente do motor.
Grava logs4/temporada.json; o motor (jogo4.mjs --temporada ... --partida N) só lê, não sorteia nada.

Uso: python3 sorteio4.py [--partidas 4] [--saida logs4/temporada.json]
"""
import argparse, json, secrets
from datetime import datetime, timezone
from pathlib import Path

R = secrets.SystemRandom()
CORES = ['Vermelho', 'Azul', 'Verde', 'Rosa', 'Laranja', 'Amarelo', 'Preto', 'Branco', 'Roxo', 'Marrom', 'Ciano', 'Lima', 'Cinza', 'Coral', 'Bordo']
TROCA = {'or:google/gemini-3.8-flash': 'or:qwen/qwen3.8-flash'}
IMPOSTORES = ['Metamorfo', 'Espectro', 'Faxineiro', 'Envenenador', 'Gangster', 'Chantagista', 'Possuidor', 'Bombardeiro', 'Apostador']
NEUTROS = ['Palhaco', 'Glutao', 'Canibal', 'Sobrevivente', 'Piromante']
TRIPULANTES = ['Engenheiro', 'Cientista', 'Localizador', 'Barulhento', 'Xerife', 'Medico', 'Prefeito', 'Detetive', 'Influencer', 'Juiz', 'Seguranca', 'Perito', 'Mecanico', 'Armador']


# o ritmo afinado no fim do Among Us 3 (recargas, prazos, tarefas em etapas, aviso do Palhaço)
CFG_AU3 = json.loads((Path(__file__).parent / 'logs3' / 'temporada.json').read_text())['partidas'][-1]['cfg']


def sortear_partida(cores):
    empresas = R.sample(sorted(set(cores.values())), 3)
    imps = [R.choice([c for c, p in cores.items() if p == e]) for e in empresas]
    papeis_imp = R.sample(IMPOSTORES, 3)
    resto = [c for c in CORES if c not in imps]
    outros = R.sample(TRIPULANTES, 10) + R.sample(NEUTROS, 2)
    R.shuffle(outros)
    papeis = {**dict(zip(imps, papeis_imp)), **dict(zip(resto, outros))}
    return {'papeis': {c: papeis[c] for c in CORES}, 'casal': R.sample(CORES, 2), 'seed': secrets.randbelow(2**31), 'cfg': CFG_AU3}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--partidas', type=int, default=4)
    ap.add_argument('--saida', default=str(Path(__file__).parent / 'logs4' / 'temporada.json'))
    a = ap.parse_args()
    au3 = json.loads((Path(__file__).parent / 'logs3' / 'temporada.json').read_text())
    cores = {c: TROCA.get(p, p) for c, p in au3['cores'].items()}
    com3 = [TROCA.get(p, p) for p in au3['com3']]
    partidas = [sortear_partida(cores) for _ in range(a.partidas)]
    out = {'com3': com3, 'sorteado_em': datetime.now(timezone.utc).isoformat(timespec='seconds'), 'fonte': 'python secrets (SystemRandom)', 'cores': cores, 'partidas': partidas}
    Path(a.saida).parent.mkdir(parents=True, exist_ok=True)
    Path(a.saida).write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print('empresas com 3 IAs:', ', '.join(com3))
    for i, p in enumerate(partidas, 1):
        imps = ', '.join(f'{c} ({p["papeis"][c]}, {cores[c]})' for c in CORES if p['papeis'][c] in IMPOSTORES)
        neu = ', '.join(f'{c} ({p["papeis"][c]})' for c in CORES if p['papeis'][c] in NEUTROS)
        print(f'partida {i}: impostores = {imps} | neutros = {neu} | casal = {" e ".join(p["casal"])}')
    print('→', a.saida)


if __name__ == '__main__':
    main()
