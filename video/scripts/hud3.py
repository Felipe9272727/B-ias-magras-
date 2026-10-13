"""HUD coerente no vídeo 3 (o dia nunca volta, os vivos só caem quando o vídeo mostra a morte) e mortes marcantes.

- Tomadas com HUD formam uma sequência de turnos; as que saem da ordem (cenas paralelas, flashbacks, um
  pulo à frente) ficam sem HUD (`semHud`). Fica a maior sequência não decrescente, pesada pela duração.
- Cada cena com HUD ganha `anunciados`: [[id, quadro]] das mortes já mostradas (ELIMINADO) naquela partida;
  quadro -1 = morte de uma cena anterior. O HUD marca morto só a partir dali.

Chamado pelo build_v3.py; também roda sozinho: python3 video/scripts/hud3.py [timeline.json]
"""
import json, os, sys

# mortes que mais pesam na história: preto e branco + tecla F ('fim' = a cor não volta até o fim da cena)
DRAMA = {('p215', 'qwen1'): True, ('p222', 'ds2'): True, ('p226', 'opus'): 'fim'}


def ajustar(timeline):
    cenas = [c for c in timeline['scenes'] if (c.get('visual') or {}).get('name') == 'IL3D' and c['visual']['props'].get('hud')]
    seq = [tm for c in cenas for tm in c['visual']['props']['tomadas']]
    for partida in {tm['partida'] for tm in seq}:
        tms = [tm for tm in seq if tm['partida'] == partida]
        melhor, ant = [], []
        for i, tm in enumerate(tms):  # maior subsequência não decrescente pesada pela duração (O(n²), n pequeno)
            peso = tm['ate'] - tm['de']
            cand = [(melhor[j], j) for j in range(i) if tms[j]['turno'] <= tm['turno']]
            b, j = max(cand, default=(0, -1))
            melhor.append(b + peso)
            ant.append(j)
        i = max(range(len(tms)), key=lambda k: melhor[k]) if tms else -1
        fica = set()
        while i >= 0:
            fica.add(id(tms[i]))
            i = ant[i]
        for tm in tms:
            tm['semHud'] = id(tm) not in fica
    for c in timeline['scenes']:
        for e in ((c.get('visual') or {}).get('props') or {}).get('eliminados') or []:
            if (c['id'], e['id']) in DRAMA:
                e['drama'] = DRAMA[(c['id'], e['id'])]
    for c in timeline['scenes']:  # limpa a continuação de uma rodada anterior (idempotente)
        P = (c.get('visual') or {}).get('props') or {}
        if P.get('eliminados'):
            P['eliminados'] = [e for e in P['eliminados'] if not e.get('eco')]
    mostradas = {}
    for c in cenas:
        P = c['visual']['props']
        partida = P['tomadas'][0]['partida']
        ja = mostradas.setdefault(partida, [])
        P['anunciados'] = [[x, -1] for x in ja] + [[e['id'], e['at']] for e in P.get('eliminados', [])]
        ja.extend(e['id'] for e in P.get('eliminados', []))
    # morte no fim da cena: o banner (e o preto e branco) continua na cena seguinte em vez de sumir no corte
    sc = timeline['scenes']
    for c, prox in zip(sc, sc[1:]):
        P, Q = (c.get('visual') or {}).get('props') or {}, (prox.get('visual') or {}).get('props') or {}
        if (prox.get('visual') or {}).get('name') != 'IL3D':
            continue
        for e in P.get('eliminados') or []:
            if not e.get('eco') and c['duration'] - e['at'] < 130:
                Q.setdefault('eliminados', []).append(dict(e, at=e['at'] - c['duration'], eco=True))
    return timeline


if __name__ == '__main__':
    arq = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'remotion', 'public', 'timeline3_completo.json')
    tl = ajustar(json.load(open(arq)))
    json.dump(tl, open(arq, 'w'), ensure_ascii=False)
    for c in tl['scenes']:
        P = (c.get('visual') or {}).get('props') or {}
        sem = [tm['turno'] for tm in P.get('tomadas', []) if tm.get('semHud')]
        if sem:
            print('sem HUD', c['id'], sem)
