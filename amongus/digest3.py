#!/usr/bin/env python3
"""Resumo legível de uma partida do Among Us 3 (amongus/logs3/partidaN.json) para escrever o roteiro:
elenco, linha do tempo dos eventos, chat dos impostores, pensamentos dos impostores nas horas-chave e todas as
reuniões (falas, pensamentos e votos). Tudo copiado do log, nada inventado.
Uso: python3 digest3.py N [--ate TIQUE]  → escreve video/youtube/au3/destaques_pN.md"""
import json, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
n = int(sys.argv[1])
ate = int(sys.argv[sys.argv.index('--ate') + 1]) if '--ate' in sys.argv else 10**9
d = json.loads((RAIZ / 'logs3' / f'partida{n}.json').read_text())
pap = {j['cor']: j for j in d['jogadores']}
L = [f"# Partida {n} — resultado: {d.get('resultado')}", '']
L.append('## Elenco')
for j in d['jogadores']:
    L.append(f"- {j['cor']}: {j['papel']} ({j['time']}) — {j['modelo']}")
L += ['', '## Linha do tempo (eventos)']
IGN = {'tarefa', 'tarefa_etapa'}
for e in d['eventos']:
    if e['tique'] > ate or e['tipo'] in IGN:
        continue
    extra = {k: v for k, v in e.items() if k not in ('tique', 'tipo', 'ponto', 'pessoas', 'corpos')}
    L.append(f"- t{e['tique']} **{e['tipo']}** {json.dumps(extra, ensure_ascii=False)}")
vis = [e for e in d['eventos'] if e['tipo'] == 'tarefa' and e.get('visual') and e['tique'] <= ate]
L.append(f"- tarefas visuais feitas: {', '.join(f't{e['tique']} {e['cor']} ({e['nome']})' for e in vis)}")
L += ['', '## Chat dos impostores']
for m in d.get('chatImpostores', []):
    if m['tique'] <= ate:
        L.append(f"- t{m['tique']} {m['cor']}: {m['texto']}")
L += ['', '## Pensamentos dos impostores e do Palhaço (ações fortes)']
FORTE = ('matar', 'envenenar', 'recrutar', 'sabotar', 'trancar', 'entrar no duto', 'ficar invisível', 'transformar', 'limpar', 'denunciar', 'atirar', 'postar foto')
for t in d['tiques']:
    if not t or t['tique'] > ate:
        continue
    for x in t['decisoes']:
        j = pap[x['cor']]
        if (j['time'] != 'tripulante' or x['acao'].startswith(('atirar', 'postar foto', 'denunciar'))) and x['acao'].startswith(FORTE) and x['pensamento']:
            L.append(f"- t{t['tique']} {x['cor']} ({j['papel']}): **{x['acao']}** — “{x['pensamento']}”")
L += ['', '## Reuniões']
for i, r in enumerate(d['reunioes']):
    if r['tique'] > ate:
        continue
    L.append(f"### Reunião {i} (t{r['tique']}, {r.get('tipo')}) chamada por {r['chamador']}{' — corpo de ' + r['corpo'] if r.get('corpo') else ''}")
    for k, f in enumerate(r['falas']):
        L.append(f"{k}. **{f['cor']}** ({pap[f['cor']]['papel']}) r{f['rodada']}: {f['texto']}")
        if f.get('pensamento'):
            L.append(f"   - pensou: “{f['pensamento']}”")
    L.append(f"- votos: {r['votos']}")
    if r.get('pensamentosVoto'):
        for c, p in r['pensamentosVoto'].items():
            if pap[c]['time'] != 'tripulante':
                L.append(f"   - voto de {c} ({pap[c]['papel']}): “{p}”")
    L.append(f"- resultado: expulso={r['expulso']} eraImpostor={r.get('eraImpostor')} papel={r.get('papelExpulso')} anulada={r.get('anulada')} empate={r.get('empate')}")
    L.append('')
if d.get('memoria'):
    L += ['## Reflexões no fim', *[f"- {c}: {t}" for c, t in d['memoria']['reflexoes'].items()]]
saida = RAIZ.parent / 'video' / 'youtube' / 'au3' / f'destaques_p{n}.md'
saida.parent.mkdir(parents=True, exist_ok=True)
saida.write_text('\n'.join(L))
print(saida, len('\n'.join(L)), 'caracteres')
