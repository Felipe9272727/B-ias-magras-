#!/usr/bin/env python3
"""AGE DAS IAs: 6 IAs jogando 0 A.D. (RTS estilo Age of Empires) de verdade, pela interface de RL do jogo.
Cada IA controla um império. A cada TURNO_S segundos de jogo, as 6 decidem ao mesmo tempo (o jogo fica pausado):
pensamento secreto, fala pública, mensagens privadas e ações de alto nível (distribuir aldeões, treinar, construir,
evoluir de fase, atacar, defender, diplomacia, tributo). Entre os turnos o motor cuida do micro (aldeão parado volta a
trabalhar, prédios são posicionados). Tudo vai para gravacoes/<nome>/: turnos.jsonl (decisões, falas, resultados) e
quadros.jsonl (posição de tudo a cada QUADRO_S segundos de jogo, para o vídeo).
Uso: ./servidor.sh && python3 motor.py <nome> [minutos_de_jogo=30]   (MOCK=1 para testar sem gastar)"""
import json
import math
import os
import random
import re
import subprocess
import sys
import time
import urllib.request
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from mapa6 import cfg

URL = 'http://127.0.0.1:6000'
PASSO_MS = 200
TURNO_S = 30
QUADRO_S = 2
NOME = sys.argv[1] if len(sys.argv) > 1 else 'teste'
MINUTOS = float(sys.argv[2]) if len(sys.argv) > 2 else 30
DIR = Path(__file__).parent / 'gravacoes' / NOME
DIR.mkdir(parents=True, exist_ok=True)
MOCK = bool(os.environ.get('MOCK'))

# elenco (favoritas do canal, video/IAS_FAVORITAS.md); jogador 1..6
IAS = [
    dict(nome='Claude', modelo='Claude Haiku 5.5', empresa='Anthropic', provider='or:anthropic/claude-haiku-5.5'),
    dict(nome='Qwen', modelo='Qwen 3.8 27B', empresa='Alibaba', provider='or:qwen/qwen3.8-27b'),
    dict(nome='GPT', modelo='GPT-5.6 Luna', empresa='OpenAI', provider='or:openai/gpt-5.6-luna'),
    dict(nome='MiMo', modelo='MiMo V2.6 Flash', empresa='Xiaomi', provider='or:xiaomi/mimo-v2.6-flash'),
    dict(nome='GLM', modelo='GLM 5.3 Flash', empresa='Z.ai', provider='or:z-ai/glm-5.3-flash'),
    dict(nome='DeepSeek', modelo='DeepSeek V4.1 Flash', empresa='DeepSeek', provider='ds:deepseek-flash'),
]
CIVS = ['brit', 'gaul', 'rome', 'athen', 'spart', 'iber']
NOME_CIV = {'brit': 'Bretões', 'gaul': 'Gauleses', 'rome': 'Romanos', 'athen': 'Atenienses', 'spart': 'Espartanos', 'iber': 'Ibéricos'}
COR = ['vermelho', 'azul', 'amarelo', 'verde', 'roxo', 'laranja']

# ---------------------------------------------------------------- 0 A.D.
def post(rota, dados=b''):
    return json.loads(urllib.request.urlopen(f'{URL}/{rota}', data=dados, timeout=600).read())


def step(cmds=()):
    corpo = '\n'.join(f'{p};{json.dumps(c)}' for p, c in cmds)
    return post('step', corpo.encode())


# ---------------------------------------------------------------- IAs
ARQ_CHAVE = '/root/.claude/plugins/store/deepseek_inline-6aaca6566e14.json'
_txt_chave = Path(ARQ_CHAVE).read_text() if Path(ARQ_CHAVE).exists() else ''
CHAVE_OR = (re.search(r'sk-or-[A-Za-z0-9_-]+', _txt_chave) or [None])[0]
CHAVE_DS = (re.search(r'sk-(?!or-)[A-Za-z0-9]{20,}', _txt_chave) or [None])[0]


def perguntar(provider, system, prompt, max_tokens=900):
    if MOCK:
        return json.dumps(dict(pensamento='teste', fala='oi', privado=[], acoes=[dict(tipo='aldeoes', comida=50, madeira=40, pedra=0, metal=10), dict(tipo='treinar', unidade='aldeao', qtd=3), dict(tipo='construir', predio='casa')]))
    if provider.startswith('ds:'):
        url, chave = 'https://api.deepseek.com/chat/completions', CHAVE_DS
        corpo = dict(model='deepseek-flash', max_tokens=max_tokens + 2500, reasoning_effort='low')
    else:
        url, chave = 'https://openrouter.ai/api/v1/chat/completions', CHAVE_OR
        corpo = dict(model=provider[3:], max_tokens=max_tokens + 2500, reasoning={'effort': 'low'})
    corpo['messages'] = [dict(role='system', content=system), dict(role='user', content=prompt)]
    for tentativa in range(3):
        try:
            r = subprocess.run(['curl', '-sS', '--max-time', '120', '-X', 'POST', url, '-H', 'Content-Type: application/json',
                                '-H', f'Authorization: Bearer {chave}', '--data-binary', '@-'], input=json.dumps(corpo).encode(),
                               capture_output=True, timeout=140)
            d = json.loads(r.stdout)
            t = d['choices'][0]['message'].get('content') or ''
            if t.strip():
                return t
        except Exception as e:  # noqa: BLE001
            print('  falha IA', provider, tentativa, str(e)[:120], flush=True)
        time.sleep(3)
    return ''


def ler_json(t):
    t = re.sub(r'^```(json)?|```$', '', t.strip(), flags=re.M).strip()
    m = re.search(r'\{.*\}', t, re.S)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except Exception:  # noqa: BLE001
        try:
            return json.loads(re.sub(r',\s*([}\]])', r'\1', m.group(0)))
        except Exception:  # noqa: BLE001
            return None


SYSTEM = """Você é {nome}, uma IA ({modelo}, da {empresa}), e governa os {civ} (cor {cor}, jogador {j}) numa partida de 0 A.D.,
um jogo de estratégia estilo Age of Empires, contra outras 5 IAs, todos contra todos. Ganha quem destruir/derrotar os outros
(conquista). Você pode fazer alianças, prometer coisas, mentir e trair: a diplomacia é livre e muda a qualquer momento.
Recursos: comida, madeira, pedra, metal. Aldeões coletam; casas aumentam a população; quartel treina infantaria;
estábulo treina cavalaria; torre defende; evoluir de fase (Vila -> Cidade -> Metrópole) libera prédios e unidades fortes.
A cada turno (30 s de jogo) você responde SÓ um JSON:
{{"pensamento": "seu plano secreto, 1-2 frases (ninguém vê)",
 "fala": "mensagem pública no chat para todas as IAs (pode ser vazia)",
 "privado": [{{"para": "NomeDaIA", "texto": "mensagem secreta só para ela"}}],
 "acoes": [ ... ]}}
Ações possíveis (use várias por turno):
 {{"tipo":"aldeoes","comida":%,"madeira":%,"pedra":%,"metal":%}}   distribui seus aldeões (porcentagens)
 {{"tipo":"treinar","unidade":"aldeao|lanceiro|atirador|cavaleiro","qtd":N}}
 {{"tipo":"construir","predio":"casa|fazenda|quartel|estabulo|torre|ferreiro|templo|mercado|fortaleza|maravilha"}}
 {{"tipo":"evoluir"}}   pesquisa a próxima fase no Centro da Cidade
 {{"tipo":"atacar","alvo":"NomeDaIA","forca":"tudo|metade"}}   manda o exército atacar a base dela
 {{"tipo":"defender"}}   chama o exército de volta para casa
 {{"tipo":"diplomacia","com":"NomeDaIA","estado":"aliado|neutro|inimigo"}}
 {{"tipo":"tributo","para":"NomeDaIA","recurso":"comida|madeira|pedra|metal","qtd":N}}
Fale em português do Brasil, com personalidade. Seja estratégico e curto."""


# ---------------------------------------------------------------- estado
def tipo_ent(t):
    if 'female_citizen' in t:
        return 'aldeao'
    if 'cavalry' in t:
        return 'cavaleiro'
    if 'infantry' in t or 'champion' in t or 'hero' in t:
        return 'soldado'
    if 'war_dog' in t:
        return 'cao'
    if t.startswith('structures/'):
        return 'predio'
    return 'outro'


def recurso_gaia(t):
    if 'gaia/tree' in t:
        return 'madeira'
    if 'gaia/fruit' in t or 'fauna_' in t:
        return 'comida'
    if 'gaia/rock' in t:
        return 'pedra'
    if 'gaia/ore' in t:
        return 'metal'
    return None


PREDIO = {'casa': 'house', 'fazenda': 'field', 'quartel': 'barracks', 'estabulo': 'stable', 'torre': 'defense_tower',
          'ferreiro': 'forge', 'templo': 'temple', 'mercado': 'market', 'fortaleza': 'fortress', 'maravilha': 'wonder',
          'armazem': 'storehouse', 'celeiro': 'farmstead'}
NOME_PREDIO = {v: k for k, v in PREDIO.items()}
UNIDADE_ATIRADOR = {'brit': 'infantry_slinger_b', 'gaul': 'infantry_slinger_b', 'rome': 'infantry_javelineer_b',
                    'athen': 'infantry_slinger_b', 'spart': 'infantry_javelineer_b', 'iber': 'infantry_slinger_b'}
UNIDADE_CAV = {c: 'cavalry_javelineer_b' for c in CIVS}


def fase_tech(civ, fase):
    proxima = {'village': 'town', 'town': 'city'}.get(fase)
    if not proxima:
        return None
    return f'phase_{proxima}_athen' if civ == 'athen' else f'phase_{proxima}_generic'


class Jogo:
    def __init__(self):
        self.st = None
        self.aloc = {j: dict(comida=60, madeira=30, pedra=0, metal=10) for j in range(1, 7)}
        self.ataque = {}  # j -> (alvo_j, ate_t)
        self.turnos = open(DIR / 'turnos.jsonl', 'a')
        self.quadros = open(DIR / 'quadros.jsonl', 'a')
        self.eventos_turno = {j: [] for j in range(1, 7)}
        self.chat = []  # mensagens públicas recentes
        self.caixa = {j: [] for j in range(1, 7)}  # privadas recebidas
        self.historia = {j: [] for j in range(1, 7)}  # resumo das últimas decisões
        self.mortos_por = Counter()

    # ---- leitura
    def ents(self, owner=None):
        return [e for e in self.st['entities'].values() if owner is None or e['owner'] == owner]

    def cc(self, j):
        for e in self.ents(j):
            if 'civil_centre' in e['template']:
                return e
        return None

    def base(self, j):
        c = self.cc(j)
        if c:
            return c['position']
        us = [e['position'] for e in self.ents(j) if 'position' in e]
        if not us:
            return None
        return [sum(p[0] for p in us) / len(us), sum(p[1] for p in us) / len(us)]

    def vivo(self, j):
        return self.st['players'][j]['state'] == 'active'

    def jog(self, nome):
        for i, ia in enumerate(IAS):
            if ia['nome'].lower() == str(nome).lower():
                return i + 1
        return None

    def resumo(self, j):
        p = self.st['players'][j]
        mine = self.ents(j)
        c = Counter(tipo_ent(e['template']) for e in mine)
        predios = Counter(NOME_PREDIO.get(e['template'].split('/')[-1], e['template'].split('/')[-1]) for e in mine if e['template'].startswith('structures/'))
        fund = Counter(NOME_PREDIO.get(e['template'].split('/')[-1].replace('foundation|', ''), '?') for e in mine if e['template'].startswith('foundation|'))
        b = self.base(j)
        linhas = [f"Tempo de jogo: {int(self.st['timeElapsed'] / 60000)} min. Sua fase: {dict(village='Vila', town='Cidade', city='Metrópole').get(p['phase'], p['phase'])}.",
                  f"Recursos: comida {int(p['resourceCounts']['food'])}, madeira {int(p['resourceCounts']['wood'])}, pedra {int(p['resourceCounts']['stone'])}, metal {int(p['resourceCounts']['metal'])}.",
                  f"População {p['popCount']}/{p['popLimit']}. Aldeões {c['aldeao']}, soldados {c['soldado']}, cavaleiros {c['cavaleiro']}.",
                  f"Aldeões coletando: {', '.join(f'{k} {v}' for k, v in self.aloc[j].items())} (%).",
                  f"Prédios: {', '.join(f'{k} {v}' for k, v in predios.items()) or 'nenhum'}" + (f"; em construção: {', '.join(f'{k} {v}' for k, v in fund.items())}" if fund else '') + '.']
        # diplomacia e vizinhos
        dip = []
        for k in range(1, 7):
            if k == j:
                continue
            q = self.st['players'][k]
            est = 'aliado' if p['isAlly'][k] else 'inimigo' if p['isEnemy'][k] else 'neutro'
            dele = 'aliado' if q['isAlly'][j] else 'inimigo' if q['isEnemy'][j] else 'neutro'
            if q['state'] != 'active':
                dip.append(f"{IAS[k - 1]['nome']}: DERROTADO")
                continue
            bk = self.base(k)
            dist = int(math.dist(b, bk)) if b and bk else 0
            mk = self.ents(k)
            ck = Counter(tipo_ent(e['template']) for e in mk)
            dip.append(f"{IAS[k - 1]['nome']} ({NOME_CIV[CIVS[k - 1]]}, {COR[k - 1]}): você o trata como {est}, ele te trata como {dele}; distância {dist}; "
                       f"exército ~{ck['soldado'] + ck['cavaleiro']}, aldeões ~{ck['aldeao']}, fase {dict(village='Vila', town='Cidade', city='Metrópole').get(q['phase'], q['phase'])}")
        linhas.append('Outras IAs:\n - ' + '\n - '.join(dip))
        if self.eventos_turno[j]:
            linhas.append('Desde o último turno: ' + '; '.join(self.eventos_turno[j][-8:]) + '.')
        if self.chat:
            linhas.append('Chat público recente:\n' + '\n'.join(self.chat[-10:]))
        if self.caixa[j]:
            linhas.append('Mensagens privadas para você:\n' + '\n'.join(self.caixa[j][-6:]))
        if self.historia[j]:
            linhas.append('Seus últimos planos: ' + ' | '.join(self.historia[j][-3:]))
        return '\n'.join(linhas)

    # ---- quadros para o vídeo
    def gravar_quadro(self):
        es = []
        for e in self.ents():
            if e['owner'] == 0 and not ('fauna' in e['template']):
                continue
            pos = e.get('position')
            if not pos:
                continue
            es.append([e['id'], e['owner'], e['template'].split('/')[-1] if e['owner'] else e['template'], round(pos[0]), round(pos[1]),
                       round(e.get('hitpoints', 0)), (e.get('unitAIState') or '')[:30]])
        ps = [dict(fase=p['phase'], rec={k: int(v) for k, v in p['resourceCounts'].items()}, pop=p['popCount'], lim=p['popLimit'], estado=p['state'],
                   aliado=p['isAlly'], inimigo=p['isEnemy']) for p in self.st['players']]
        self.quadros.write(json.dumps(dict(t=self.st['timeElapsed'], ents=es, jogadores=ps)) + '\n')

    def gravar_arvores(self):
        arv = [[round(e['position'][0]), round(e['position'][1]), e['template']] for e in self.ents(0) if 'position' in e and recurso_gaia(e['template'])]
        (DIR / 'mapa.json').write_text(json.dumps(dict(tamanho=self.st['mapSize'], recursos=arv, ias=IAS, civs=CIVS)))

    # ---- eventos do jogo
    def ler_eventos(self):
        ev = self.st.get('events') or {}
        for d in ev.get('Destroy', []):
            pass
        for d in ev.get('TrainingFinished', []):
            j = d.get('owner')
        for d in ev.get('ConstructionFinished', []):
            ent = self.st['entities'].get(str(d.get('newentity')))
            if ent and ent['owner'] in self.eventos_turno:
                self.eventos_turno[ent['owner']].append(f"terminou {NOME_PREDIO.get(ent['template'].split('/')[-1], ent['template'].split('/')[-1])}")
        for d in ev.get('PlayerDefeated', []):
            j = d.get('playerId')
            for k in self.eventos_turno:
                self.eventos_turno[k].append(f"{IAS[j - 1]['nome']} FOI DERROTADO")
            self.log(dict(tipo='derrota', j=j, t=self.st['timeElapsed']))
        for d in ev.get('TributeExchanged', []):
            self.log(dict(tipo='tributo_ev', dados=d, t=self.st['timeElapsed']))
        for d in ev.get('DiplomacyChanged', []):
            self.log(dict(tipo='diplomacia_ev', dados=d, t=self.st['timeElapsed']))
        atk = Counter()
        for d in ev.get('Attacked', []):
            alvo = self.st['entities'].get(str(d.get('target')))
            if alvo and d.get('attackerOwner') and alvo['owner'] and d['attackerOwner'] != alvo['owner']:
                atk[(d['attackerOwner'], alvo['owner'])] += 1
        for (a, v), n in atk.items():
            msg = f"{IAS[a - 1]['nome']} está atacando você"
            if v in self.eventos_turno and msg not in self.eventos_turno[v]:
                self.eventos_turno[v].append(msg)
                self.log(dict(tipo='ataque_ev', de=a, em=v, t=self.st['timeElapsed']))

    def log(self, d):
        self.turnos.write(json.dumps(d, ensure_ascii=False) + '\n')
        self.turnos.flush()

    # ---- micro entre turnos
    def micro(self):
        cmds = []
        gaia = [e for e in self.ents(0) if 'position' in e and recurso_gaia(e['template'])]
        for j in range(1, 7):
            if not self.vivo(j):
                continue
            b = self.base(j)
            if not b:
                continue
            ald = [e for e in self.ents(j) if tipo_ent(e['template']) == 'aldeao']
            if not ald:
                continue
            fund = [e for e in self.ents(j) if e['template'].startswith('foundation|')]
            # quantos em cada recurso agora
            atual = Counter()
            for a in ald:
                od = a.get('unitAIOrderData') or []
                tgt = od[0].get('target') if od and isinstance(od[0], dict) else None
                te = self.st['entities'].get(str(tgt)) if tgt else None
                r = recurso_gaia(te['template']) if te else ('comida' if te and 'field' in te['template'] else None)
                if r:
                    atual[r] += 1
            alvo = {r: round(len(ald) * self.aloc[j][r] / 100) for r in self.aloc[j]}
            ociosos = [a for a in ald if a.get('idle')]
            # fundações recebem até 2 ociosos
            for f in fund:
                if ociosos:
                    pegar = ociosos[:2]
                    ociosos = ociosos[2:]
                    cmds.append((j, dict(type='repair', entities=[a['id'] for a in pegar], target=f['id'], autocontinue=True, queued=False)))
            for a in ociosos:
                falta = sorted(alvo, key=lambda r: atual[r] - alvo[r])
                r = falta[0]
                cands = [g for g in gaia if recurso_gaia(g['template']) == r]
                if r == 'comida':
                    campos = [e for e in self.ents(j) if 'field' in e['template'] and not e['template'].startswith('foundation')]
                    cands = cands + campos
                if not cands:
                    continue
                g = min(cands, key=lambda g: math.dist(g['position'], a['position']))
                if math.dist(g['position'], b) > 260:
                    continue
                cmds.append((j, dict(type='gather', entities=[a['id']], target=g['id'], queued=False)))
                atual[r] += 1
            # ataque em andamento: unidades paradas continuam indo
            if j in self.ataque:
                alvo_j, ate = self.ataque[j]
                if not self.vivo(alvo_j) or self.st['timeElapsed'] > ate:
                    del self.ataque[j]
                else:
                    bt = self.base(alvo_j)
                    mil = [e['id'] for e in self.ents(j) if tipo_ent(e['template']) in ('soldado', 'cavaleiro') and e.get('idle')]
                    if mil and bt:
                        cmds.append((j, dict(type='attack-walk', entities=mil, x=bt[0], z=bt[1], targetClasses={'attack': ['Unit', 'Structure']}, allowCapture=False, queued=False)))
        return cmds

    # ---- ações das IAs
    def construir(self, j, nome):
        civ = CIVS[j - 1]
        tpl = PREDIO.get(nome)
        if not tpl:
            return 'prédio desconhecido'
        b = self.base(j)
        ald = [e for e in self.ents(j) if tipo_ent(e['template']) == 'aldeao']
        if not b or not ald:
            return 'sem aldeões'
        raio = {'house': 32, 'field': 30, 'defense_tower': 55, 'wonder': 60, 'fortress': 60}.get(tpl, 45)
        ang = random.uniform(0, 2 * math.pi)
        x, z = b[0] + raio * math.cos(ang) + random.uniform(-8, 8), b[1] + raio * math.sin(ang) + random.uniform(-8, 8)
        perto = sorted(ald, key=lambda a: math.dist(a['position'], (x, z)))[:3 if tpl not in ('house', 'field') else 2]
        return [(j, dict(type='construct', template=f'structures/{civ}/{tpl}', x=x, z=z, angle=random.uniform(0, 6.28), actorSeed=random.randint(1, 9999),
                         entities=[a['id'] for a in perto], autorepair=True, autocontinue=True, queued=False))]

    def aplicar(self, j, dec):
        cmds, res = [], []
        civ = CIVS[j - 1]
        for a in (dec.get('acoes') or [])[:8]:
            if not isinstance(a, dict):
                continue
            t = a.get('tipo')
            try:
                if t == 'aldeoes':
                    v = {r: max(0, float(a.get(r, 0) or 0)) for r in ('comida', 'madeira', 'pedra', 'metal')}
                    s = sum(v.values()) or 1
                    self.aloc[j] = {r: round(100 * x / s) for r, x in v.items()}
                    # reatribui já: põe todo mundo ocioso
                    ald = [e['id'] for e in self.ents(j) if tipo_ent(e['template']) == 'aldeao']
                    cmds.append((j, dict(type='stop', entities=ald, queued=False)))
                    res.append('aldeões redistribuídos')
                elif t == 'treinar':
                    u = a.get('unidade', 'aldeao')
                    n = max(1, min(10, int(a.get('qtd', 1) or 1)))
                    tpl = {'aldeao': 'support_female_citizen', 'lanceiro': 'infantry_spearman_b', 'atirador': UNIDADE_ATIRADOR[civ], 'cavaleiro': UNIDADE_CAV[civ]}.get(u)
                    if not tpl:
                        res.append(f'unidade {u} não existe')
                        continue
                    pref = {'aldeao': ['civil_centre'], 'lanceiro': ['barracks', 'civil_centre'], 'atirador': ['barracks', 'civil_centre'], 'cavaleiro': ['stable', 'civil_centre']}[u]
                    for p in pref:
                        ps = [e for e in self.ents(j) if e['template'].endswith('/' + p)]
                        if ps:
                            cmds.append((j, dict(type='train', entities=[ps[0]['id']], template=f'units/{civ}/{tpl}', count=n)))
                            res.append(f'treinando {n} {u}')
                            break
                    else:
                        res.append(f'sem prédio para treinar {u}')
                elif t == 'construir':
                    c = self.construir(j, a.get('predio', ''))
                    if isinstance(c, str):
                        res.append(c)
                    else:
                        cmds += c
                        res.append(f"construindo {a.get('predio')}")
                elif t == 'evoluir':
                    c = self.cc(j)
                    tech = fase_tech(civ, self.st['players'][j]['phase'])
                    if c and tech:
                        cmds.append((j, dict(type='research', entity=c['id'], template=tech)))
                        res.append('pesquisando a próxima fase')
                elif t == 'atacar':
                    k = self.jog(a.get('alvo'))
                    if not k or k == j or not self.vivo(k):
                        res.append('alvo inválido')
                        continue
                    mil = [e for e in self.ents(j) if tipo_ent(e['template']) in ('soldado', 'cavaleiro')]
                    if a.get('forca') == 'metade':
                        mil = mil[: max(1, len(mil) // 2)]
                    bt = self.base(k)
                    if mil and bt:
                        cmds.append((j, dict(type='diplomacy', player=k, to='enemy')))
                        cmds.append((j, dict(type='attack-walk', entities=[e['id'] for e in mil], x=bt[0], z=bt[1], targetClasses={'attack': ['Unit', 'Structure']}, allowCapture=False, queued=False)))
                        self.ataque[j] = (k, self.st['timeElapsed'] + 150000)
                        res.append(f"atacando {IAS[k - 1]['nome']} com {len(mil)} unidades")
                        self.log(dict(tipo='ordem_ataque', de=j, em=k, n=len(mil), t=self.st['timeElapsed']))
                    else:
                        res.append('sem exército para atacar')
                elif t == 'defender':
                    b = self.base(j)
                    mil = [e['id'] for e in self.ents(j) if tipo_ent(e['template']) in ('soldado', 'cavaleiro')]
                    self.ataque.pop(j, None)
                    if mil and b:
                        cmds.append((j, dict(type='attack-walk', entities=mil, x=b[0], z=b[1], targetClasses={'attack': ['Unit']}, allowCapture=False, queued=False)))
                        res.append('exército voltando para defender')
                elif t == 'diplomacia':
                    k = self.jog(a.get('com'))
                    to = {'aliado': 'ally', 'neutro': 'neutral', 'inimigo': 'enemy'}.get(a.get('estado'))
                    if k and to and k != j:
                        cmds.append((j, dict(type='diplomacy', player=k, to=to)))
                        res.append(f"agora {a.get('estado')} de {IAS[k - 1]['nome']}")
                elif t == 'tributo':
                    k = self.jog(a.get('para'))
                    r = {'comida': 'food', 'madeira': 'wood', 'pedra': 'stone', 'metal': 'metal'}.get(a.get('recurso'))
                    q = max(0, int(a.get('qtd', 0) or 0))
                    tem = self.st['players'][j]['resourceCounts'].get(r, 0) if r else 0
                    q = min(q, int(tem))
                    if k and r and q > 0 and k != j:
                        cmds.append((j, dict(type='tribute', player=k, amounts={r: q})))
                        res.append(f"mandou {q} de {a.get('recurso')} para {IAS[k - 1]['nome']}")
                        self.eventos_turno[k].append(f"{IAS[j - 1]['nome']} te mandou {q} de {a.get('recurso')}")
            except Exception as e:  # noqa: BLE001
                res.append(f'erro: {e}')
        return cmds, res

    # ---- laço
    def turno(self, n):
        vivos = [j for j in range(1, 7) if self.vivo(j)]
        resumos = {j: self.resumo(j) for j in vivos}

        def decide(j):
            ia = IAS[j - 1]
            sysm = SYSTEM.format(nome=ia['nome'], modelo=ia['modelo'], empresa=ia['empresa'], civ=NOME_CIV[CIVS[j - 1]], cor=COR[j - 1], j=j)
            t0 = time.time()
            txt = perguntar(ia['provider'], sysm, resumos[j])
            return j, txt, time.time() - t0

        with ThreadPoolExecutor(6) as ex:
            saidas = list(ex.map(decide, vivos))
        todos = []
        novo_chat = []
        for j, txt, dt in saidas:
            dec = ler_json(txt) or {}
            cmds, res = self.aplicar(j, dec)
            todos += cmds
            nome = IAS[j - 1]['nome']
            if dec.get('fala'):
                novo_chat.append(f"{nome}: {str(dec['fala'])[:300]}")
                todos.append((j, dict(type='aichat', message=str(dec['fala'])[:300])))
            for p in (dec.get('privado') or [])[:3]:
                k = self.jog(p.get('para')) if isinstance(p, dict) else None
                if k and k != j:
                    self.caixa[k].append(f"{nome} (só pra você): {str(p.get('texto', ''))[:300]}")
            if dec.get('pensamento'):
                self.historia[j].append(str(dec['pensamento'])[:200])
            self.log(dict(tipo='decisao', turno=n, t=self.st['timeElapsed'], j=j, ia=nome, estado=resumos[j], resposta=dec, bruto=txt if not dec else None,
                          resultado=res, segundos=round(dt, 1)))
            print(f"  [{nome}] {str(dec.get('pensamento', '(sem json)'))[:90]} | {', '.join(res)[:100]}", flush=True)
        self.chat += novo_chat
        self.eventos_turno = {j: [] for j in range(1, 7)}
        return todos

    def rodar(self):
        print('reset...', flush=True)
        self.st = post('reset?saveReplay=1&', cfg(seed=random.randint(1, 9999)).encode())
        self.gravar_arvores()
        self.log(dict(tipo='inicio', ias=IAS, civs=CIVS, t=0))
        fim = MINUTOS * 60000
        n = 0
        prox_turno = 0
        prox_quadro = 0
        pendentes = []
        while self.st['timeElapsed'] < fim:
            if self.st['timeElapsed'] >= prox_turno:
                n += 1
                print(f"turno {n}  ({self.st['timeElapsed'] / 60000:.1f} min)", flush=True)
                pendentes += self.turno(n)
                prox_turno += TURNO_S * 1000
            if self.st['timeElapsed'] >= prox_quadro:
                self.gravar_quadro()
                prox_quadro += QUADRO_S * 1000
            cmds = pendentes + (self.micro() if int(self.st['timeElapsed'] / PASSO_MS) % 10 == 0 else [])
            pendentes = []
            self.st = step(cmds)
            self.ler_eventos()
            vivos = [j for j in range(1, 7) if self.vivo(j)]
            if len(vivos) <= 1:
                self.log(dict(tipo='fim', vencedor=vivos, t=self.st['timeElapsed']))
                print('FIM: vencedor', [IAS[j - 1]['nome'] for j in vivos], flush=True)
                break
        else:
            self.log(dict(tipo='fim_tempo', t=self.st['timeElapsed']))
        self.gravar_quadro()
        print('PARTIDA FIM', flush=True)


if __name__ == '__main__':
    Jogo().rodar()
