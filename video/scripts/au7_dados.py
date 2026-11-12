#!/usr/bin/env python3
"""AMONG IA 7 (Mira HQ de dia, 20 IAs, 4 partidas): converte os logs do motor (amongus/logs7/partidaN.json, fonte de
verdade) para o formato leve que o Remotion lê (video/remotion/public/au7/partidaN.json), no molde do motor de mapa do
AU6 (src/zumbi/Jogo.tsx): um estado por jogador por tique. Nada é inventado aqui: só recorta e renomeia campos.
- morto fica parado na sala onde morreu; "corpo" diz se o corpo ainda está no chão (estado.corpos do log);
- "ap" = aparência (Metamorfo/Camuflador disfarçado); "papel"/"time" = os do tique (o possuído e o recrutado mudam);
- "preso" = evento prisao (do tique até "ate"); "salto" = duto ou teleporte no tique (some e reaparece, não anda).
Uso: python3 video/scripts/au7_dados.py"""
import re, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOGS = ROOT / 'amongus' / 'logs7'
SAI = ROOT / 'video' / 'remotion' / 'public' / 'au7'
FORA = {'tarefa', 'tarefa_etapa', 'descontaminacao', 'poder', 'foto', 'recado', 'chantagem', 'chato', 'fantasma_funcao', 'alerta_barulhento', 'conserto'}


def frase(t, alvo, lim=150):
    """trecho copiado do pensamento de voto: a frase que cita o alvo (ou a primeira), cortada em fim de frase"""
    fs = [x.strip() for x in re.split(r'(?<=[.!?])\s+', t) if x.strip()]
    if not fs:
        return None
    f = next((x for x in fs if alvo in x), fs[0])
    if len(f) > lim:
        f = f[:lim].rsplit(' ', 1)[0].rstrip(',;:') + '...'
    return f


def motivos(r):
    """por que a mesa votou assim: até 2 pensamentos de voto (copiados do log) de quem votou no mais votado"""
    pv = r.get('pensamentosVoto') or {}
    cont = {}
    for a in r['votos'].values():
        if a != 'pular':
            cont[a] = cont.get(a, 0) + 1
    if not cont:
        return []
    alvo = r['expulso'] or max(cont, key=cont.get)
    out = []
    eleitores = [e for e, a in r['votos'].items() if a == alvo and pv.get(e)]
    eleitores.sort(key=lambda e: (alvo not in pv[e], len(pv[e])))
    for e in eleitores[:2]:
        f = frase(pv[e], alvo)
        if f:
            out.append(dict(cor=e, alvo=alvo, texto=f))
    return out


def converter(n):
    p = json.loads((LOGS / f'partida{n}.json').read_text())
    ev = p['eventos']
    presos, saltos = {}, {}
    for e in ev:
        if e['tipo'] == 'prisao':
            for t in range(e['tique'], e['ate'] + 1):
                presos.setdefault(t, set()).add(e['preso'])
        elif e['tipo'] == 'duto':
            saltos.setdefault(e['tique'], {})[e['cor']] = 'duto'
        elif e['tipo'] == 'teleporte':
            for c in [e['cor'], *e['puxados']]:
                saltos.setdefault(e['tique'], {})[c] = 'tele'
    tiques, sala_morte = [], {}
    for tq in p['tiques']:
        t, est = tq['tique'], tq['estado']
        if t == 0:
            continue
        corpos = {c['cor'] for c in est['corpos']}
        estados = []
        for j in est['jogadores']:
            if not j['vivo']:
                sala_morte.setdefault(j['cor'], j['sala'])
            sala = j['sala'] if j['vivo'] else sala_morte[j['cor']]
            d = dict(cor=j['cor'], sala=sala, estado='humano', tipo=None, atordoado=False, salvo=False, vivo=j['vivo'], corpo=j['cor'] in corpos,
                     papel=j['papel'], time=j['time'])
            if j.get('aparente') and j['aparente'] != j['cor']:
                d['ap'] = j['aparente']
            if j['cor'] in presos.get(t, ()):
                d['preso'] = True
            if j['vivo'] and saltos.get(t, {}).get(j['cor']):
                d['salto'] = saltos[t][j['cor']]
            estados.append(d)
        sab = est.get('sabotagem')
        tiques.append(dict(tique=t, tarefas=est['tarefas'], total=est['totalTarefas'], sab=(sab or {}).get('subtipo') if isinstance(sab, dict) else sab, estados=estados))
    reunioes = []
    for r in p['reunioes']:
        juiz = next((e for e in ev if e['tipo'] == 'juiz' and e['tique'] == r['tique']), None)
        reunioes.append(dict(tique=r['tique'], tipo=r['tipo'], chamador=r['chamador'], corpo=r.get('corpo'), sala=r['sala'], votos=r['votos'], expulso=r['expulso'],
                             empate=r['empate'], eraImpostor=r.get('eraImpostor'), papelExpulso=r.get('papelExpulso'), motivos=motivos(r), **({'juiz': juiz} if juiz else {})))
    eventos = [{k: v for k, v in e.items() if k != 'ponto'} for e in ev if e['tipo'] not in FORA]
    out = dict(partida=n, jogadores=[dict(cor=j['cor'], modelo=j['modelo'], papel=j['papel'], time=j['time'], casal=j.get('casal')) for j in p['jogadores']],
               tiques=tiques, eventos=eventos, reunioes=reunioes, resultado=p['resultado'], casal=p.get('casal'), alvoCarrasco=p.get('alvoCarrasco'),
               cfg=dict(limite=90))
    (SAI / f'partida{n}.json').write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
    print(f'partida{n}: {len(tiques)} tiques, {len(eventos)} eventos, {len(reunioes)} reuniões')


if __name__ == '__main__':
    SAI.mkdir(parents=True, exist_ok=True)
    for n in (1, 2, 3, 4):
        converter(n)
