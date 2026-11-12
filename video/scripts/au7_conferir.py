#!/usr/bin/env python3
"""AMONG IA 7: confere que cada fala, pensamento e chat do roteiro (video/roteiro/roteiro_au7.py) foi COPIADO do log
(amongus/logs7/partidaN.json, fonte de verdade). Regra do canal: nada de fala inventada.
Cada item ["fala"|"pensa"|"chat", cor, texto] precisa aparecer inteiro num texto da MESMA cor na MESMA partida
(fala de reunião, pensamento da fala, pensamento do voto, pensamento/chat da jogada ou chat dos impostores).
Reticências ("...") no roteiro marcam corte: cada pedaço precisa estar no mesmo texto, na ordem.
Quando a cena diz quem está no corpo (opção {"voz": cor}), o texto é procurado na cor do corpo (é ela que o log registra).
Uso: python3 video/scripts/au7_conferir.py            (confere o roteiro inteiro; sai com erro se algo não bater)
     python3 video/scripts/au7_conferir.py 'trecho'   (procura um trecho em todas as partidas e diz onde está)"""
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOGS = ROOT / 'amongus' / 'logs7'


def norm(t):
    return re.sub(r'\s+', ' ', (t or '').replace('’', "'").replace('“', '"').replace('”', '"')).strip()


def fontes(n):
    """(cor, onde, texto) de tudo que uma IA disse ou pensou na partida n."""
    p = json.loads((LOGS / f'partida{n}.json').read_text())
    out = []
    for i, r in enumerate(p['reunioes']):
        for f in r['falas']:
            out.append((f['cor'], f'reunião {i} (t{r["tique"]}) fala r{f.get("rodada")}', f['texto']))
            out.append((f['cor'], f'reunião {i} (t{r["tique"]}) pensamento da fala r{f.get("rodada")}', f.get('pensamento')))
        for c, t in (r.get('pensamentosVoto') or {}).items():
            out.append((c, f'reunião {i} (t{r["tique"]}) pensamento do voto', t))
    for tq in p['tiques']:
        for d in tq['decisoes']:
            out.append((d['cor'], f't{tq["tique"]} pensamento da jogada', d.get('pensamento')))
            out.append((d['cor'], f't{tq["tique"]} chat da jogada', d.get('chat')))
    for c in p['chatImpostores']:
        out.append((c['cor'], f't{c["tique"]} chat dos impostores', c['texto']))
    # memória que cada IA escreveu depois das partidas anteriores (amongus/logs7/memoria.json) e leva para esta
    mem = json.loads((LOGS / 'memoria.json').read_text())['partidas']
    for i, m in enumerate(mem[:n]):
        for c, t in (m.get('reflexoes') or {}).items():
            out.append((c, f'memória escrita depois da partida {i + 1}', t))
    return [(c, o, norm(t)) for c, o, t in out if t]


_F = {}


def achar(n, cor, texto):
    """Lista de lugares do log da partida n onde a cor disse/pensou o texto (com cortes em '...')."""
    if n not in _F:
        _F[n] = fontes(n)
    pedacos = [norm(x) for x in re.split(r'\.\.\.|…', texto) if norm(x)]
    achados = []
    for c, onde, t in _F[n]:
        if cor and c != cor:
            continue
        pos = 0
        for pd in pedacos:
            pos = t.find(pd, pos)
            if pos < 0:
                break
            pos += len(pd)
        else:
            achados.append(onde)
    return achados


def main():
    if len(sys.argv) > 1:
        for n in (1, 2, 3, 4):
            if n not in _F:
                _F[n] = fontes(n)
            for c, onde, t in _F[n]:
                if norm(sys.argv[1]) in t:
                    print(f'P{n} {c}: {onde}')
        return
    spec = importlib.util.spec_from_file_location('roteiro_au7', ROOT / 'video' / 'roteiro' / 'roteiro_au7.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    ok = ruim = 0
    for c in mod.CENAS:
        for it in c['itens']:
            if it[0] in ('fala', 'pensa', 'chat'):
                a = achar(c['partida'], it[1], it[2])
                if a:
                    ok += 1
                else:
                    ruim += 1
                    print(f'NÃO ACHEI  cena {c["id"]}  P{c["partida"]} {it[1]}: {it[2][:90]}')
    print(f'{ok} falas/pensamentos conferidos no log, {ruim} sem origem')
    sys.exit(1 if ruim else 0)


if __name__ == '__main__':
    main()
