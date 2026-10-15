#!/usr/bin/env python3
"""Sorteio da temporada do Among Us 3 com aleatoriedade de verdade (módulo secrets = fonte do sistema operacional).

Sorteia, uma vez por temporada:
  - quais 3 das 6 empresas têm 3 IAs (as outras 3 têm 2) e a cor de cada IA (fixa em todas as partidas, para o
    público acompanhar cada personagem);
  - para cada partida: os papéis (3 impostores de 3 empresas diferentes, escolhidos entre as 5 funções de impostor;
    o Palhaço; as 11 funções de tripulante) e a semente do motor.
Grava logs3/temporada.json; o motor (jogo3.mjs --temporada ... --partida N) só lê, não sorteia nada.

Uso: python3 sorteio3.py [--partidas 4] [--saida logs3/temporada.json]
"""
import argparse, json, secrets
from datetime import datetime, timezone
from pathlib import Path

R = secrets.SystemRandom()
CORES = ['Vermelho', 'Azul', 'Verde', 'Rosa', 'Laranja', 'Amarelo', 'Preto', 'Branco', 'Roxo', 'Marrom', 'Ciano', 'Lima', 'Cinza', 'Coral', 'Bordo']
EMPRESAS = ['or:deepseek/deepseek-v4.1-flash', 'haiku', 'or:openai/gpt-5.6-luna', 'or:google/gemini-3.8-flash', 'or:mistralai/mistral-large-4-0', 'or:z-ai/glm-5.3-flash']
IMPOSTORES = ['Metamorfo', 'Fantasma', 'Faxineiro', 'Envenenador', 'Gangster']
TRIPULANTES = ['Engenheiro', 'Cientista', 'Rastreador', 'Barulhento', 'Xerife', 'Medico', 'Prefeito', 'Detetive', 'Influencer', 'Juiz', 'Seguranca']


def sortear_partida(cores):
    empresas = R.sample(EMPRESAS, 3)
    imps = [R.choice([c for c, p in cores.items() if p == e]) for e in empresas]
    papeis_imp = R.sample(IMPOSTORES, 3)
    resto = [c for c in CORES if c not in imps]
    outros = TRIPULANTES + ['Palhaco']
    R.shuffle(outros)
    papeis = {**dict(zip(imps, papeis_imp)), **dict(zip(resto, outros))}
    return {'papeis': {c: papeis[c] for c in CORES}, 'seed': secrets.randbelow(2**31)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--partidas', type=int, default=4)
    ap.add_argument('--saida', default=str(Path(__file__).parent / 'logs3' / 'temporada.json'))
    a = ap.parse_args()
    com3 = R.sample(EMPRESAS, 3)
    vagas = [e for e in EMPRESAS for _ in range(3 if e in com3 else 2)]
    R.shuffle(vagas)
    cores = dict(zip(CORES, vagas))
    partidas = [sortear_partida(cores) for _ in range(a.partidas)]
    out = {'com3': com3, 'sorteado_em': datetime.now(timezone.utc).isoformat(timespec='seconds'), 'fonte': 'python secrets (SystemRandom)', 'cores': cores, 'partidas': partidas}
    Path(a.saida).parent.mkdir(parents=True, exist_ok=True)
    Path(a.saida).write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print('empresas com 3 IAs:', ', '.join(com3))
    for i, p in enumerate(partidas, 1):
        imps = ', '.join(f'{c} ({p["papeis"][c]}, {cores[c]})' for c in CORES if p['papeis'][c] in IMPOSTORES)
        pal = next(c for c in CORES if p['papeis'][c] == 'Palhaco')
        print(f'partida {i}: impostores = {imps} | palhaço = {pal}')
    print('→', a.saida)


if __name__ == '__main__':
    main()
