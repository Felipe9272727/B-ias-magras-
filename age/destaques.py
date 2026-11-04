#!/usr/bin/env python3
"""Resumo da partida para o roteiro: por turno, o que cada IA pensou, falou (público e secreto) e fez, mais os eventos
do jogo (ataques, derrotas, tributos) e o placar (população, exército, fase) a cada 2 min de jogo.
Uso: python3 destaques.py <partida>  ->  gravacoes/<partida>/destaques.md"""
import json
import sys
from collections import Counter
from pathlib import Path

n = sys.argv[1]
D = Path(__file__).parent / 'gravacoes' / n
ts = [json.loads(l) for l in open(D / 'turnos.jsonl') if l.strip()]
ias = next(t['ias'] for t in ts if t['tipo'] == 'inicio')
nome = lambda j: ias[j - 1]['nome']
out = [f'# Destaques da {n}', '', 'Jogadores: ' + ', '.join(f"{i + 1}={a['nome']} ({a['modelo']})" for i, a in enumerate(ias)), '']

# placar a cada 2 min
qs = [json.loads(l) for l in open(D / 'quadros.jsonl') if l.strip()]
out.append('## Placar a cada 2 min (pop / exército / fase / estado)')
prox = 0
for q in qs:
    if q['t'] < prox:
        continue
    prox += 120000
    linha = []
    for j in range(1, 7):
        mil = sum(1 for e in q['ents'] if e[1] == j and ('infantry' in e[2] or 'cavalry' in e[2] or 'champion' in e[2]))
        p = q['jogadores'][j]
        linha.append(f"{nome(j)} {p['pop']}/{mil}/{p['fase']}{'' if p['estado'] == 'active' else ' ' + p['estado']}")
    out.append(f"- {q['t'] // 60000:02d}:{(q['t'] // 1000) % 60:02d}  " + ' | '.join(linha))
out.append('')

out.append('## Linha do tempo (t = mm:ss de jogo)')
for t in ts:
    mm = f"{t.get('t', 0) // 60000:02d}:{(t.get('t', 0) // 1000) % 60:02d}"
    if t['tipo'] == 'decisao':
        r = t.get('resposta') or {}
        partes = [f"**{t['ia']}** (turno {t['turno']}, {mm})"]
        if r.get('pensamento'):
            partes.append(f"PENSA: \"{r['pensamento']}\"")
        if r.get('fala'):
            partes.append(f"FALA (público): \"{r['fala']}\"")
        for p in r.get('privado') or []:
            if isinstance(p, dict) and p.get('texto'):
                partes.append(f"SECRETO para {p.get('para')}: \"{p['texto']}\"")
        partes.append('FEZ: ' + '; '.join(t.get('resultado') or []))
        out.append('- ' + ' | '.join(partes))
    elif t['tipo'] == 'ordem_ataque':
        out.append(f"- [{mm}] ORDEM DE ATAQUE: {nome(t['de'])} -> {nome(t['em'])} com {t['n']} unidades")
    elif t['tipo'] == 'ataque_ev':
        out.append(f"- [{mm}] COMBATE: {nome(t['de'])} está atacando {nome(t['em'])}")
    elif t['tipo'] == 'derrota':
        out.append(f"- [{mm}] DERROTA: {nome(t['j'])} foi derrotado")
    elif t['tipo'] in ('fim', 'fim_tempo'):
        out.append(f"- [{mm}] FIM DA PARTIDA {t.get('vencedor', '')}")
(D / 'destaques.md').write_text('\n'.join(out))
print(D / 'destaques.md', len(out), 'linhas')
