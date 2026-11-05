#!/usr/bin/env python3
"""Destaques de uma partida do modo zumbi para o roteiro: elenco, placar por tique e, para cada evento grande
(virou zumbi, mordida, cura, imunidade, atordoamento, barricada quebrada/aberta, uivo, resgate, salvo), as falas e os
pensamentos de quem estava na sala naquele tique e no anterior, COPIADOS do log (nunca editar).
Uso: python3 destaques_zumbi.py <n> -> logs_zumbi/destaques<n>.md"""
import json, sys
from pathlib import Path

n = sys.argv[1]
d = json.loads(Path(f'logs_zumbi/partida{n}.json').read_text())
J = {j['cor']: j for j in d['jogadores']}
NOME = {k: v['nome'] for k, v in d['salas'].items()}
falas = {}
for f in d['falas']:
    falas.setdefault(f['tique'], []).append(f)
out = [f"# Partida {n} — destaques (modo zumbi)", '', f"Resultado: {json.dumps(d['resultado'], ensure_ascii=False)}", '', '## Elenco']
for c, j in J.items():
    out.append(f"- {c}: {j['modelo']} — {j['papel']}{' — PACIENTE ZERO (vira no tique ' + str(j['viraEm']) + ', nem ele sabe)' if j['pacienteZero'] else ''}")
out += ['', '## Placar por tique (humanos limpos / mordidos / zumbis / rádio)']
for t in d['tiques']:
    from collections import Counter
    c = Counter(e['estado'] for e in t['estados'])
    out.append(f"- t{t['tique']}: {c.get('humano',0)}/{c.get('mordido',0)}/{c.get('zumbi',0)} rádio {t['radio']}" + (f" RESGATE desde t{t['resgateEm']}" if t['resgateEm'] is not None else ''))
GRANDES = {'virou_zumbi', 'mordida', 'mordida_imune', 'cura', 'atordoou', 'barricada_quebrou', 'abriu_barricada', 'uivo', 'fugiu_uivo', 'resgate_chegou', 'resgate_perdido', 'salvo', 'cura_vazia'}
out += ['', '## Eventos grandes, com falas e pensamentos da sala (copiados do log)']
vistos = set()
for e in d['eventos']:
    if e['tipo'] not in GRANDES:
        continue
    det = {k: v for k, v in e.items() if k not in ('tique', 'tipo')}
    out.append(f"\n### t{e['tique']} {e['tipo']} {json.dumps(det, ensure_ascii=False)}")
    sala = e.get('sala')
    envolvidos = {e.get(k) for k in ('cor', 'zumbi', 'alvo', 'por', 'doutor') if e.get(k)}
    for t in (e['tique'] - 1, e['tique']):
        for f in falas.get(t, []):
            if (f['sala'] == sala or f['cor'] in envolvidos) and (t, f['cor']) not in vistos and (f['fala'] or f['pensamento']):
                vistos.add((t, f['cor']))
                out.append(f"- t{t} {f['cor']} ({J[f['cor']]['modelo']}, {f['estado']}{', ' + f['tipo'] if f['tipo'] else ''}, em {NOME[f['sala']]}) ação: {f['acao']}")
                if f['pensamento']: out.append(f"  - PENSOU: {f['pensamento']}")
                if f['fala']: out.append(f"  - FALOU: {f['fala']}")
Path(f'logs_zumbi/destaques{n}.md').write_text('\n'.join(out))
print(f'logs_zumbi/destaques{n}.md', len(out), 'linhas')
