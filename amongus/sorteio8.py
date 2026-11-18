#!/usr/bin/env python3
"""Sorteio da temporada do AMONG IA 8 ("a volta às origens", último Among por um tempo) com aleatoriedade de verdade.

10 IAs (as favoritas do canal) no The Skeld, só funções OFICIAIS + Palhaço, com RODÍZIO: cada partida usa 2 impostores
com função, 3 tripulantes com função e o Palhaço; o resto é tripulante comum. As 9 funções oficiais aparecem ao longo das
3 partidas. Os 2 impostores são sempre de empresas diferentes. Grava logs8/temporada.json; o motor (jogo8.mjs) só lê.
Uso: python3 sorteio8.py
"""
import json, secrets
from datetime import datetime, timezone
from pathlib import Path

R = secrets.SystemRandom()
AQUI = Path(__file__).parent
CORES = ['Vermelho', 'Azul', 'Verde', 'Rosa', 'Laranja', 'Amarelo', 'Preto', 'Branco', 'Roxo', 'Ciano']
IAS = ['haiku', 'sonnet', 'or:qwen/qwen3.8-27b', 'or:openai/gpt-6-luna', 'or:xiaomi/mimo-v2.6-flash', 'or:z-ai/glm-5.3-flash',
       'or:deepseek/deepseek-v4.1-flash', 'or:minimax/minimax-m3.1-flash', 'or:mistralai/mistral-small-2603', 'or:google/gemma-4-26b-a4b-it']
EMPRESA = lambda p: 'anthropic' if p in ('haiku', 'sonnet') else p.split('/')[0]
RODIZIO = [
    (['Metamorfo', 'Espectro'], ['Engenheiro', 'Cientista', 'Anjo']),
    (['Vibora', 'Metamorfo'], ['Localizador', 'Barulhento', 'Detetive']),
    (['Espectro', 'Vibora'], ['Detetive', 'Engenheiro', 'Anjo']),
]
CFG = {'recargaMorte': 3, 'recargaSabotagem': 6, 'recargaPortas': 5, 'portasDuracao': 4, 'metamorfoRecarga': 12, 'metamorfoDuracao': 8,
       'fantasmaRecarga': 6, 'fantasmaDuracao': 6, 'sismografoPrazo': 8, 'o2Prazo': 8, 'VISAO_ESCURO': 150, 'tarefasReais': True,
       'tarefasLongas': 1, 'tarefasCurtas': 3, 'avisoPalhaco': True, 'nImpostores': 2, 'nNeutros': 1, 'reunioesEmergencia': 1}


def main():
    cores = dict(zip(CORES, R.sample(IAS, len(IAS))))
    partidas = []
    for imp_papeis, tri_papeis in RODIZIO:
        while True:
            imps = R.sample(CORES, 2)
            if EMPRESA(cores[imps[0]]) != EMPRESA(cores[imps[1]]):
                break
        resto = [c for c in CORES if c not in imps]
        outros = ['Palhaco'] + tri_papeis + ['Tripulante'] * (len(resto) - 1 - len(tri_papeis))
        R.shuffle(outros)
        papeis = {**dict(zip(imps, R.sample(imp_papeis, 2))), **dict(zip(resto, outros))}
        partidas.append({'papeis': {c: papeis[c] for c in CORES}, 'seed': secrets.randbelow(2**31), 'cfg': CFG})
    out = {'sorteado_em': datetime.now(timezone.utc).isoformat(timespec='seconds'), 'fonte': 'python secrets (SystemRandom)', 'cores': cores, 'partidas': partidas}
    (AQUI / 'logs8').mkdir(exist_ok=True)
    (AQUI / 'logs8' / 'temporada.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
    for i, p in enumerate(partidas, 1):
        print(f'Partida {i}:', ', '.join(f'{c}={p["papeis"][c]}' for c in CORES if p['papeis'][c] != 'Tripulante'))
    print('Elenco:', ', '.join(f'{c}={v}' for c, v in cores.items()))


if __name__ == '__main__':
    main()
