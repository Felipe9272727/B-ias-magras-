#!/usr/bin/env python3
"""AMONG IA 8 (The Skeld, 11/12 IAs, 4 partidas): converte os logs do motor (amongus/logs8/partidaN.json, fonte de verdade)
para o formato leve que o Remotion lê (video/remotion/public/au8/partidaN.json). Cópia do au7_dados.py com o que o AU8 tem:
- "p" = ponto real do jogador no mundo do motor (pontos3.json = as mesmas coordenadas de src/amongus/nave/mapa.ts);
  o morto fica no ponto do corpo (estado.corpos/pocas do log); o ponto do morto em "jogadores" é o do fantasma, que anda;
- "inv" = invisível (Espectro/Fantasma), "esc" = escudo do Anjo ativo, "ap" = aparência (Metamorfo disfarçado);
- "salto" = duto no tique (some e reaparece, não anda); poças (Víbora: corpo derretido) e portas trancadas por tique;
- partida 4 tem cfg próprio (3 impostores, revelarExpulso=false): vai em cfg para a tela de ejeção.
Nada é inventado aqui: só recorta e renomeia campos.
Uso: python3 video/scripts/au8_dados.py"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOGS = ROOT / 'amongus' / 'logs8'
SAI = ROOT / 'video' / 'remotion' / 'public' / 'au8'
FORA = {'tarefa', 'tarefa_etapa', 'fantasma_funcao'}
PODER_FORA = {'vitais', 'cameras', 'mapa'}  # olhar câmeras/vitais/mapa não vira efeito nem linha no painel


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
    saltos = {}
    for e in ev:
        if e['tipo'] == 'duto':
            saltos.setdefault(e['tique'], {})[e['cor']] = 'duto'
    tiques, morte, ultimo = [], {}, {}
    for tq in p['tiques']:
        t, est = tq['tique'], tq['estado']
        if t == 0:
            continue
        corpos = {c['cor'] for c in est['corpos']}
        pocas = {c['cor'] for c in est.get('pocas') or []}
        estados = []
        onde_corpo = {c['cor']: (c['sala'], c['ponto']) for c in [*est['corpos'], *(est.get('pocas') or [])] if c.get('ponto')}
        for j in est['jogadores']:
            if j['vivo']:
                ultimo[j['cor']] = (j['sala'], j['ponto'])
            else:  # o "ponto" do morto no log é o do fantasma (ele anda): o corpo fica onde o log diz (estado.corpos/pocas)
                morte.setdefault(j['cor'], onde_corpo.get(j['cor']) or ultimo.get(j['cor']) or (j['sala'], j['ponto']))
            sala, pt = (j['sala'], j['ponto']) if j['vivo'] else morte[j['cor']]
            d = dict(cor=j['cor'], sala=sala, p=[round(pt['x']), round(pt['y'])], vivo=j['vivo'], corpo=j['cor'] in corpos, papel=j['papel'], time=j['time'])
            if j['cor'] in pocas:
                d['poca'] = True
            if j.get('aparente') and j['aparente'] != j['cor']:
                d['ap'] = j['aparente']
            if j['vivo'] and j.get('invisivel'):
                d['inv'] = True
            if j['vivo'] and j.get('escudoAnjo'):
                d['esc'] = True
            if j.get('ejetado'):
                d['ejetado'] = True
            if j['vivo'] and saltos.get(t, {}).get(j['cor']):
                d['salto'] = saltos[t][j['cor']]
            estados.append(d)
        sab = est.get('sabotagem')
        tiques.append(dict(tique=t, tarefas=est['tarefas'], total=est['totalTarefas'], sab=(sab or {}).get('tipo') if isinstance(sab, dict) else sab,
                           portas=sorted((est.get('portas') or {}).keys()), estados=estados))
    reunioes = []
    for r in p['reunioes']:
        reunioes.append(dict(tique=r['tique'], tipo=r['tipo'], chamador=r['chamador'], corpo=r.get('corpo'), sala=r['sala'], votos=r['votos'], expulso=r['expulso'],
                             empate=r['empate'], eraImpostor=r.get('eraImpostor'), papelExpulso=r.get('papelExpulso'), motivos=motivos(r)))
    eventos = [{k: v for k, v in e.items() if k != 'ponto'} for e in ev
               if e['tipo'] not in FORA and not (e['tipo'] == 'poder' and e.get('poder') in PODER_FORA)]
    cfg = p['cfg']
    out = dict(partida=n, jogadores=[dict(cor=j['cor'], modelo=j['modelo'], papel=j['papel'], time=j['time']) for j in p['jogadores']],
               tiques=tiques, eventos=eventos, reunioes=reunioes, resultado=p['resultado'],
               cfg=dict(limite=90, revelarExpulso=cfg.get('revelarExpulso', True), nImpostores=cfg.get('nImpostores', 2)))
    (SAI / f'partida{n}.json').write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
    print(f'partida{n}: {len(p["jogadores"])} IAs, {len(tiques)} tiques, {len(eventos)} eventos, {len(reunioes)} reuniões, cfg {out["cfg"]}')


if __name__ == '__main__':
    SAI.mkdir(parents=True, exist_ok=True)
    for n in (1, 2, 3, 4):
        converter(n)
