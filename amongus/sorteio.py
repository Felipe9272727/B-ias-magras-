#!/usr/bin/env python3
"""Sorteio da temporada do Among Us 2 com aleatoriedade de verdade (módulo secrets = fonte do sistema operacional).

Sorteia, uma vez por temporada:
  - a cor de cada IA (fixa nas 3 partidas, para o público acompanhar cada personagem);
  - para cada partida: os papéis (3 impostores de 3 empresas diferentes) e a semente do motor;
  - em qual partida e qual impostor joga com a estratégia mandada pela inscrita.
Grava logs2/temporada.json; o motor (jogo2.mjs --temporada ... --partida N) só lê, não sorteia nada.

Uso: python3 sorteio.py [--partidas 3] [--saida logs2/temporada.json]
"""
import argparse, json, secrets
from datetime import datetime, timezone
from pathlib import Path

R = secrets.SystemRandom()
CORES = ['Vermelho', 'Azul', 'Verde', 'Rosa', 'Laranja', 'Amarelo', 'Preto', 'Branco', 'Roxo', 'Marrom', 'Ciano', 'Lima']
VAGAS = {'deepseek': 3, 'haiku': 3, 'or:openai/gpt-5.6-luna': 2, 'or:google/gemini-3.8-flash': 2, 'or:x-ai/grok-4.3': 2}
IMPOSTORES = ['Metamorfo', 'Fantasma', 'Faxineiro']
TRIPULANTES = ['Engenheiro', 'Cientista', 'Rastreador', 'Barulhento', 'Xerife', 'Medico', 'Prefeito', 'Detetive', 'Tripulante']


def sortear_partida(cores, cfg=None, opus=False):
    # 3 empresas diferentes para os 3 impostores; dentro de cada empresa, uma das cores dela.
    # Com opus=True, uma das empresas é a Anthropic e a cor sorteada dela passa a ser jogada pelo Claude Opus.
    empresas = (['haiku'] + R.sample([e for e in VAGAS if e != 'haiku'], 2)) if opus else R.sample(list(VAGAS), 3)
    imps = [R.choice([c for c, p in cores.items() if p == e]) for e in empresas]
    papeis_imp = IMPOSTORES[:]
    R.shuffle(papeis_imp)
    resto = [c for c in CORES if c not in imps]
    papeis_trip = TRIPULANTES[:]
    R.shuffle(papeis_trip)
    papeis = {**dict(zip(imps, papeis_imp)), **dict(zip(resto, papeis_trip))}
    out = {'papeis': {c: papeis[c] for c in CORES}, 'seed': secrets.randbelow(2**31), 'estrategia': None}
    if opus:
        out['providers'] = {imps[0]: 'opus'}
        out['treinado'] = imps[0]
    if cfg:
        out['cfg'] = cfg
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--partidas', type=int, default=3)
    ap.add_argument('--saida', default=str(Path(__file__).parent / 'logs2' / 'temporada.json'))
    ap.add_argument('--adicionar', type=int, default=0, help='acrescenta N partidas a uma temporada que já existe (mesmas cores)')
    ap.add_argument('--cfg', default='', help='JSON com configurações da sala para as partidas acrescentadas')
    ap.add_argument('--opus-impostor', action='store_true', help='na partida acrescentada, um Claude Opus entra como impostor (no lugar de um Haiku) com o manual do bom impostor')
    a = ap.parse_args()
    if a.adicionar:
        temp = json.loads(Path(a.saida).read_text())
        for _ in range(a.adicionar):
            temp['partidas'].append(sortear_partida(temp['cores'], json.loads(a.cfg) if a.cfg else None, a.opus_impostor))
        Path(a.saida).write_text(json.dumps(temp, ensure_ascii=False, indent=1))
        n = len(temp['partidas'])
        p = temp['partidas'][-1]
        print(f'partida {n} acrescentada (impostores sorteados; cfg {p.get("cfg")})')
        return

    vagas = [p for p, n in VAGAS.items() for _ in range(n)]
    R.shuffle(vagas)
    cores = dict(zip(CORES, vagas))  # cor → provider, a temporada inteira

    partidas = [sortear_partida(cores) for _ in range(a.partidas)]

    n = secrets.randbelow(a.partidas)  # a partida em que um impostor recebe a estratégia da inscrita
    imps_n = [c for c, p in partidas[n]['papeis'].items() if p in IMPOSTORES]
    partidas[n]['estrategia'] = R.choice(imps_n)

    out = {'sorteado_em': datetime.now(timezone.utc).isoformat(timespec='seconds'), 'fonte': 'python secrets (SystemRandom)',
           'cores': cores, 'partidas': partidas}
    Path(a.saida).parent.mkdir(parents=True, exist_ok=True)
    Path(a.saida).write_text(json.dumps(out, ensure_ascii=False, indent=1))
    for i, p in enumerate(partidas, 1):
        imps = ', '.join(f'{c} ({p["papeis"][c]}, {cores[c]})' for c in CORES if p['papeis'][c] in IMPOSTORES)
        print(f'partida {i}: impostores = {imps}' + (f' | estratégia: {p["estrategia"]}' if p['estrategia'] else ''))
    print('→', a.saida)


if __name__ == '__main__':
    main()
