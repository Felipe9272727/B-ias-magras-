#!/usr/bin/env python3
"""Enriquece os logs (pedidos novos/expirados reconstruídos do estado, para os logs antigos) e escreve um resumo
legível por cozinha em overcooked/destaques/<log>_<cozinha>.txt, para achar os melhores momentos.
Uso: python3 overcooked/digest.py fase1 fase2 fase3 coop1"""
import json, sys
from pathlib import Path

LOGS = Path(__file__).with_name('logs')
OUT = Path(__file__).with_name('destaques')


def enriquecer(d):
    """Os logs antigos perdiam os eventos de pedido/expirou (gerados antes do recorte do tique): reconstrói."""
    for cz in range(len(d['cozinhas'])):
        ant = {}
        for t in d['tiques']:
            c = t['cozinhas'][cz]
            evs = c['eventos']
            if any(e['tipo'] in ('pedido', 'expirou') for e in evs):
                ant = {p['id']: p for p in c['estado']['pedidos']}
                continue
            agora = {p['id']: p for p in c['estado']['pedidos']}
            entregues = sum(1 for e in evs if e['tipo'] == 'entregou')
            novos = [dict(tique=t['tique'], tipo='pedido', receita=p['receita'], id=i) for i, p in agora.items() if i not in ant]
            sumiu = [p for i, p in ant.items() if i not in agora]
            # o que sumiu e não foi entregue expirou (entregas tiram o pedido da lista no mesmo tique)
            sumiu.sort(key=lambda p: p['resta'])
            exp = [dict(tique=t['tique'], tipo='expirou', receita=p['receita'], id=p['id']) for p in sumiu if p['resta'] <= 1][:max(0, len(sumiu) - entregues)]
            c['eventos'] = exp + novos + evs
            ant = agora
    return d


def resumo(d, cz):
    info = d['cozinhas'][cz]
    L = [f"COZINHA {info['nome']} · fase {d['fase']} ({d['modo']}) · chefs: " + ', '.join(f"{c['nome']} ({c['empresa']})" for c in info['chefs'])]
    for t in d['tiques']:
        c = t['cozinhas'][cz]
        e = c['estado']
        ped = ', '.join(f"{p['receita']}({p['resta'] * d['tickS']}s)" for p in e['pedidos'])
        L.append(f"\n== t{t['tique']} ({t['tique'] * d['tickS'] // 60}:{t['tique'] * d['tickS'] % 60:02d}) pontos {e['pontos']} | pedidos: {ped}")
        for nome, q in c['chefs'].items():
            s = f"  {nome}: ação='{q.get('acao')}' → {q.get('fez')}"
            if q.get('bloqueado'):
                s += f" [BLOQUEADO por {q['bloqueado']}]"
            if q.get('invalida'):
                s += f" [RESPOSTA INVÁLIDA: {q['invalida']}]"
            if q.get('fala'):
                s += f"\n     fala: \"{q['fala']}\""
            if q.get('pensa'):
                s += f"\n     pensa: \"{q['pensa']}\""
            L.append(s)
        evs = [x for x in c['eventos'] if x['tipo'] not in ('picando', 'largou', 'pegou')]
        if evs:
            L.append('  eventos: ' + '; '.join(' '.join(f"{k}={v}" for k, v in x.items() if k != 'tique') for x in evs))
    return '\n'.join(L)


if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    for n in sys.argv[1:]:
        f = LOGS / f'{n}.json'
        d = enriquecer(json.loads(f.read_text()))
        f.write_text(json.dumps(d, ensure_ascii=False))
        for cz, info in enumerate(d['cozinhas']):
            (OUT / f"{n}_{info['nome']}.txt").write_text(resumo(d, cz))
        print(n, [(x['nome'], sum(1 for t in d['tiques'] for e in t['cozinhas'][i]['eventos'] if e['tipo'] == 'expirou'), r['expirados']) for i, (x, r) in enumerate(zip(d['cozinhas'], d.get('resultado') or d['cozinhas']))])
