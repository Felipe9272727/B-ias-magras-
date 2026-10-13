"""Gameplay 3D do vídeo 3: um "diretor" que lê o log da partida e filma cada turno na ilha low-poly.

Cada tomada (lista em JSON) diz: partida, turno, zona, tipo de câmera e quantos quadros. Os tributos ficam na zona onde
estavam no fim do turno; quem chegou naquele turno entra andando vindo da zona anterior; cada um faz a pose da sua ação
(beber, coletar, comer, sentar, atacar, falar); quem morreu no turno cai; mortos de antes somem.
Luz por período (manhã/tarde/noite), fogueiras acesas, névoa tóxica roxa nas zonas cobertas.
Saída: <pasta>/<id>/0001.png … + pos.json (posição na tela da cabeça de cada tributo por quadro, para os balões no Remotion).

Uso: xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P ilha/blender/cena/gameplay.py -- <tomadas.json> <pasta> [ids,separados] [--teste]
"""
import bpy, json, math, os, random, sys
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.append(AQUI)
sys.path.append(os.path.join(AQUI, '..', 'assets'))
from montar_ilha import montar_ilha  # noqa: E402
from terreno import altura, ZONAS  # noqa: E402
from mar import ceu_dia  # noqa: E402
from util import mat_cor  # noqa: E402
import personagens as P  # noqa: E402
import objetos as O  # noqa: E402

RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
LOGS = {'oficial': os.path.join(RAIZ, 'logs', 'partida.json'), 'teste': os.path.join(RAIZ, 'logs', 'partida_v2_abortada.json')}
EMPRESA = {'Anthropic': 'anthropic', 'DeepSeek': 'deepseek', 'Alibaba': 'alibaba'}
ZC = {z['id']: z for z in ZONAS}
FPS = 24


def rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def chao(x, y):
    return max(altura(x, y), 0.0)


# ------------------------------------------------------------------ cena fixa (montada uma vez)
class Ilha:
    def __init__(self, tributos, densidade=0.6):
        bpy.ops.wm.read_factory_settings(use_empty=True)
        sc = self.sc = bpy.context.scene
        sc.render.fps = FPS
        montar_ilha(densidade=densidade)
        self.mundo = ceu_dia(sol_elev=35)
        sc.render.engine = 'BLENDER_EEVEE_NEXT'
        sc.eevee.taa_render_samples = 8
        sc.view_settings.view_transform = 'AgX'
        sc.view_settings.look = 'AgX - Punchy'
        sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
        bpy.ops.object.light_add(type='SUN')
        self.sol = bpy.context.object
        self.sol.data.angle = math.radians(3)
        bpy.ops.object.camera_add()
        self.cam = bpy.context.object
        self.cam.data.clip_end = 3000
        sc.camera = self.cam
        bpy.ops.object.light_add(type='AREA', location=(0, 0, 0))
        self.fill = bpy.context.object
        self.fill.data.size = 6
        self.fill.parent = self.cam
        self.fill.location = (0, 1.5, 0.5)
        # tributos com partes separadas
        self.rig = {}
        for i, t in enumerate(tributos):
            r = P.criar_tributo_rig(f"R_{t['id']}", EMPRESA[t['distrito']], rgb(t['cor']), seed=i + 3)
            partes = {k: bpy.data.objects[f"R_{t['id']}_{k}"] for k in ('tronco', 'cabeca', 'braco_e', 'braco_d', 'perna_e', 'perna_d')}
            self.rig[t['id']] = (r, partes)
        # extras reaproveitados entre tomadas
        self.fogos, self.nevoas = [], []
        self.mat_nevoa = bpy.data.materials.new('nevoa')
        self.mat_nevoa.use_nodes = True
        nt = self.mat_nevoa.node_tree
        nt.nodes.clear()
        vol = nt.nodes.new('ShaderNodeVolumePrincipled')
        vol.inputs['Color'].default_value = (0.55, 0.15, 0.85, 1)
        vol.inputs['Density'].default_value = 0.035
        vol.inputs['Emission Strength'].default_value = 0.15
        vol.inputs['Emission Color'].default_value = (0.6, 0.2, 1.0, 1)
        out = nt.nodes.new('ShaderNodeOutputMaterial')
        nt.links.new(vol.outputs[0], out.inputs['Volume'])

    def periodo(self, per):
        s, w = self.sol, self.mundo
        bg = w.node_tree.nodes.get('Background')
        ceu = next((n for n in w.node_tree.nodes if n.type == 'TEX_SKY'), None)
        if ceu:
            ceu.sun_elevation = math.radians({'manhã': 12, 'tarde': 42}.get(per, -4))
        self.fill.data.energy = {'manhã': 250, 'tarde': 150}.get(per, 450)
        self.fill.data.color = (1, 0.92, 0.85) if per != 'noite' else (0.7, 0.8, 1.0)
        if per == 'manhã':
            s.rotation_euler = (math.radians(90 - 14), 0, math.radians(110)); s.data.energy = 3.2; s.data.color = (1, 0.8, 0.6)
            if bg: bg.inputs['Strength'].default_value = 0.3
        elif per == 'tarde':
            s.rotation_euler = (math.radians(90 - 42), 0, math.radians(35)); s.data.energy = 4.5; s.data.color = (1, 0.97, 0.9)
            if bg: bg.inputs['Strength'].default_value = 0.35
        else:  # noite: lua azulada, céu quase apagado
            s.rotation_euler = (math.radians(90 - 35), 0, math.radians(-60)); s.data.energy = 1.6; s.data.color = (0.6, 0.7, 1.0)
            if bg: bg.inputs['Strength'].default_value = 0.12

    def extras(self, zonas_estado, per):
        for o in self.fogos + self.nevoas:
            bpy.data.objects.remove(o, do_unlink=True)
        self.fogos, self.nevoas = [], []
        for zid, z in zonas_estado.items():
            if zid not in ZC:
                continue
            cx, cy = ZC[zid]['c']
            if z.get('fogueira'):
                f = O.criar_fogueira(f'fogo_{zid}', acesa=True, seed=1)
                f.location = (cx + 2.5, cy + 2.5, chao(cx + 2.5, cy + 2.5))
                bpy.ops.object.light_add(type='POINT', location=(cx + 2.5, cy + 2.5, chao(cx + 2.5, cy + 2.5) + 1.2))
                l = bpy.context.object
                l.data.energy = 900 if per == 'noite' else 250
                l.data.color = (1, 0.55, 0.2)
                self.fogos += [f, l]
            if z.get('nevoa'):
                r = ZC[zid]['r'] * 0.9
                bpy.ops.mesh.primitive_cube_add(size=1, location=(cx, cy, chao(cx, cy) + 5))
                n = bpy.context.object
                n.scale = (r * 2, r * 2, 14)
                n.data.materials.append(self.mat_nevoa)
                self.nevoas.append(n)


# ------------------------------------------------------------------ poses (ângulos em graus; frente = -Y)
def aplicar_pose(partes, a):
    """a: dict parte -> (rx, ry, rz) em graus."""
    for k, ob in partes.items():
        rx, ry, rz = a.get(k, (0, 0, 0))
        ob.rotation_euler = (math.radians(rx), math.radians(ry), math.radians(rz))


def pose_em(acao, t, fase):
    """Pose no instante t (s) para a ação; fase desencontra os tributos."""
    s = math.sin(2 * math.pi * (t * 0.5 + fase))
    resp = 2 * math.sin(2 * math.pi * (t * 0.3 + fase))  # respiração
    if acao == 'andar':
        w = math.sin(2 * math.pi * (t * 1.6 + fase))
        return {'perna_e': (-32 * w, 0, 0), 'perna_d': (32 * w, 0, 0), 'braco_e': (28 * w, 0, 0), 'braco_d': (-28 * w, 0, 0),
                'tronco': (4, 0, 0), 'cabeca': (-3, 0, 4 * w)}
    if acao in ('beber', 'coletar', 'pegar', 'fogueira', 'encher'):
        m = math.sin(2 * math.pi * (t * 0.8 + fase))
        return {'tronco': (55 + 8 * m, 0, 0), 'perna_e': (-50, 0, 0), 'perna_d': (-35, 0, 0), 'braco_e': (-70 - 15 * m, 0, 0),
                'braco_d': (-60 + 15 * m, 0, 0), 'cabeca': (-25, 0, 0)}
    if acao == 'comer':
        m = max(0.0, math.sin(2 * math.pi * (t * 0.7 + fase)))
        return {'braco_d': (-120 * m - 10, 0, -20 * m), 'braco_e': (-15, 0, 0), 'cabeca': (6 * m, 0, 0), 'tronco': (resp, 0, 0)}
    if acao in ('descansar', 'dormir', 'esconder'):
        return {'perna_e': (-88, 0, 6), 'perna_d': (-88, 0, -6), 'tronco': (-8 + resp, 0, 0), 'braco_e': (-35, 0, 10), 'braco_d': (-35, 0, -10),
                'cabeca': (12, 0, 0), '_baixar': 0.6}
    if acao == 'atacar':
        c = (t * 1.2 + fase) % 1.0
        golpe = math.sin(min(c / 0.35, 1) * math.pi) if c < 0.35 else 0
        return {'braco_d': (-150 + 140 * golpe, 0, 0), 'braco_e': (-40, 0, 0), 'tronco': (8 + 22 * golpe, 0, 12 * golpe),
                'perna_e': (-25, 0, 0), 'perna_d': (20, 0, 0)}
    if acao == 'falar':
        return {'braco_d': (-45 - 25 * s, 0, -15), 'braco_e': (-10 + 8 * s, 0, 8), 'cabeca': (4 * s, 0, 8 * s), 'tronco': (resp, 0, 4 * s)}
    if acao == 'ferido':
        return {'tronco': (25, 0, 8), 'braco_e': (-30, 0, 0), 'braco_d': (-10, 0, 0), 'cabeca': (15, 0, 0), 'perna_e': (-10, 0, 0)}
    return {'tronco': (resp, 0, 0), 'braco_e': (resp, 0, 4), 'braco_d': (-resp, 0, -4), 'cabeca': (0, 0, 6 * s)}


ACAO = {'mover': 'andar', 'beber': 'beber', 'beber_garrafa': 'comer', 'beber_cantil': 'comer', 'encher_cantil': 'encher',
        'coletar_comida': 'coletar', 'coletar_madeira': 'coletar', 'pegar': 'pegar', 'comer': 'comer', 'descansar': 'descansar',
        'esconder': 'esconder', 'atacar': 'atacar', 'fogueira': 'fogueira', 'abrigo': 'coletar', 'curar': 'comer'}


# ------------------------------------------------------------------ uma tomada
PALCO = {'cornucopia': (0, -15)}  # a Cornucópia ocupa o centro: o grupo fica na frente da boca


def palco(zid):
    """Centro "pisável" da zona (fora d'água e fora da Cornucópia)."""
    if zid in PALCO:
        return PALCO[zid]
    cx, cy = ZC[zid]['c']
    if altura(cx, cy) > 0.4:
        return cx, cy
    for r in range(2, 60, 2):  # espiral até achar chão seco (beira do lago)
        for a in range(0, 360, 15):
            x, y = cx + math.cos(math.radians(a)) * r, cy + math.sin(math.radians(a)) * r
            if 0.4 < altura(x, y) < 8:
                return x + math.cos(math.radians(a)) * 3, y + math.sin(math.radians(a)) * 3
    return cx, cy


def seco(x, y, cx, cy):
    """Empurra o ponto para longe do centro até sair da água."""
    v = Vector((x - cx, y - cy))
    if v.length < 0.01:
        v = Vector((1, 0))
    v.normalize()
    for _ in range(40):
        if altura(x, y) > 0.35:
            break
        x, y = x + v.x, y + v.y
    return x, y


def lugares(ids, zid, seed):
    """Posição de cada tributo na zona: roda em volta do palco (raio ~3–4 m), sempre em chão seco."""
    cx, cy = palco(zid)
    rnd = random.Random(seed)
    n = max(1, len(ids))
    out = {}
    for i, tid in enumerate(sorted(ids)):
        a = 2 * math.pi * i / n + rnd.uniform(-0.25, 0.25)
        r = (2.2 + 0.45 * n) * rnd.uniform(0.85, 1.1) if n > 1 else 0
        out[tid] = seco(cx + math.cos(a) * r, cy + math.sin(a) * r, cx, cy)
    return out


def direcao(dx, dy):
    return math.atan2(dx, -dy)  # frente local = -Y


def filmar(ilha, log, tom, pasta, teste=False):
    k = tom['turno']
    turno = log['turnos'][k - 1]
    est = {s['id']: s for s in turno['estado']}
    ant = {s['id']: s for s in log['turnos'][k - 2]['estado']} if k > 1 else {}
    dec = {d['id']: d for d in turno['decisoes']}
    mortes = {e['vitima']: e for e in turno.get('eventos', []) if e['tipo'] == 'morte'}
    ataques = [e for e in turno.get('eventos', []) if e['tipo'] in ('ataque', 'revide')]
    zid = tom['zona']
    ilha.periodo(turno['periodo'])
    ilha.extras(turno.get('zonas', {}), turno['periodo'])

    # quem aparece: vivos na zona + quem morreu ali neste turno
    aqui = [i for i, s in est.items() if s['zona'] == zid and (s['vivo'] or i in mortes)]
    pos = lugares(aqui, zid, seed=k * 31 + len(aqui))
    cx, cy = palco(zid)
    centro = Vector((cx, cy, chao(cx, cy) + 1.0))
    n = tom['quadros']
    dur = n / FPS
    plano = {}
    for tid, (r, partes) in ilha.rig.items():
        vis = tid in aqui
        for ob in [r] + list(partes.values()):
            ob.hide_render = not vis
        if not vis:
            continue
        x1, y1 = pos[tid]
        d = dec.get(tid, {})
        acao = ACAO.get(d.get('acao', ''), 'parado')
        if acao == 'parado' and d.get('fala'):
            acao = 'falar'
        chegou = tid in ant and ant[tid]['zona'] != zid
        if chegou and ant[tid]['zona'] in ZC:  # entra andando vindo da zona anterior
            ax, ay = ZC[ant[tid]['zona']]['c']
            v = Vector((ax - cx, ay - cy)).normalized()
            x0, y0 = x1 + v.x * 9, y1 + v.y * 9
        else:
            x0, y0 = x1, y1
        alvo_atq = next((e['alvo'] for e in ataques if e['id'] == tid and e['alvo'] in pos), None)
        olhar = pos[alvo_atq] if alvo_atq else (cx, cy)
        plano[tid] = dict(x0=x0, y0=y0, x1=x1, y1=y1, acao=acao, chegou=chegou, olhar=olhar,
                          morre=tid in mortes, morto_antes=not est[tid]['vivo'] and tid not in mortes,
                          ferido=(est[tid]['vida'] < 35), fase=random.Random(tid).random())

    # câmera
    alvo = tom.get('alvo') if tom.get('alvo') in plano else None
    ids = list(plano)
    grupo = Vector((sum(plano[i]['x1'] for i in ids) / len(ids), sum(plano[i]['y1'] for i in ids) / len(ids), 0)) if ids else centro
    grupo.z = chao(grupo.x, grupo.y) + 1.0
    tipo = tom.get('cam', 'orbita')
    rnd = random.Random(k * 7 + len(zid))
    a0 = tom.get('angulo', rnd.uniform(0, 360))

    terreno = next(o for o in bpy.data.objects if o.type == 'MESH' and o.name.lower().startswith('ilha'))
    inv = terreno.matrix_world.inverted()

    def livre(mira, loc):
        """Sobe a câmera até o terreno não tapar a visão do alvo."""
        for _ in range(14):
            o, d = inv @ mira, (inv @ loc) - (inv @ mira)
            ok, *_ = terreno.ray_cast(o, d.normalized(), distance=d.length)
            if not ok and altura(loc.x, loc.y) < loc.z - 0.8:
                return loc
            loc = loc + Vector((0, 0, 1.5))
        return loc

    def camera_em(t, u):
        c = ilha.cam
        if tipo == 'segue' and alvo:
            p = plano[alvo]
            x = p['x0'] + (p['x1'] - p['x0']) * min(1, u * 1.15)
            y = p['y0'] + (p['y1'] - p['y0']) * min(1, u * 1.15)
            th = direcao(p['x1'] - p['x0'], p['y1'] - p['y0']) if p['chegou'] else math.radians(a0)
            atras = Vector((-math.sin(th), math.cos(th), 0)) * 4.2  # atrás = +Y local
            lado = Vector((math.cos(th), math.sin(th), 0)) * 1.1
            loc = Vector((x, y, 0)) + atras + lado
            loc.z = chao(loc.x, loc.y) + 2.3
            mira = Vector((x, y, chao(x, y) + 1.3)) - atras * 0.8
            c.data.lens = 30
        elif tipo == 'duelo' and alvo:
            p = plano[alvo]
            o = p['olhar']
            m = Vector(((p['x1'] + o[0]) / 2, (p['y1'] + o[1]) / 2, 0))
            dv = Vector((o[0] - p['x1'], o[1] - p['y1'], 0))
            nrm = Vector((-dv.y, dv.x, 0)).normalized() if dv.length > 0.01 else Vector((1, 0, 0))
            loc = m + nrm * (7.5 - 1.5 * u) + dv.normalized() * (-1.5 + 1.0 * u) if dv.length > 0.01 else m + nrm * 7
            loc.z = max(chao(loc.x, loc.y) + 1.4, chao(m.x, m.y) + 1.6)
            mira = Vector((m.x, m.y, chao(m.x, m.y) + 1.0))
            c.data.lens = 30
        elif tipo == 'aerea':
            a = math.radians(a0 + 25 * u)
            loc = Vector((cx + math.cos(a) * 45, cy + math.sin(a) * 45, chao(cx, cy) + 28 - 6 * u))
            mira = centro
            c.data.lens = 30
        elif tipo == 'baixa':
            a = math.radians(a0)
            r = 12 - 5 * u
            loc = Vector((grupo.x + math.cos(a) * r, grupo.y + math.sin(a) * r, 0))
            loc.z = max(chao(loc.x, loc.y), grupo.z - 1.0) + 0.7
            mira = grupo + Vector((0, 0, 0.4))
            c.data.lens = 26
        elif tipo == 'close' and alvo:
            p = plano[alvo]
            th = direcao(p['olhar'][0] - p['x1'], p['olhar'][1] - p['y1'])
            frente = Vector((math.sin(th), -math.cos(th), 0))
            lado = Vector((math.cos(th), math.sin(th), 0))
            loc = Vector((p['x1'], p['y1'], 0)) + frente * (3.0 - 0.8 * u) + lado * 0.9
            loc.z = chao(p['x1'], p['y1']) + 1.6
            mira = Vector((p['x1'], p['y1'], chao(p['x1'], p['y1']) + 1.25))
            c.data.lens = 40
        else:  # órbita em volta do grupo
            a = math.radians(a0 + 35 * u)
            r = 6 + 1.3 * len(ids) ** 0.8
            loc = Vector((grupo.x + math.cos(a) * r, grupo.y + math.sin(a) * r, 0))
            loc.z = max(chao(loc.x, loc.y) + 1.5, grupo.z + 2.6)
            mira = grupo - Vector((0, 0, 0.2))
            c.data.lens = 32
        loc = livre(mira, loc)
        c.location = loc
        c.rotation_euler = (mira - loc).to_track_quat('-Z', 'Y').to_euler()

    def tributos_em(t, u):
        for tid, p in plano.items():
            r, partes = ilha.rig[tid]
            if p['chegou']:
                w = min(1.0, u * 1.15)
                x = p['x0'] + (p['x1'] - p['x0']) * w
                y = p['y0'] + (p['y1'] - p['y0']) * w
                andando = w < 1.0
            else:
                x, y, andando = p['x1'], p['y1'], False
            ac = 'andar' if andando else p['acao']
            if not andando and ac == 'parado' and p['ferido']:
                ac = 'ferido'
            if andando:
                th = direcao(p['x1'] - p['x0'], p['y1'] - p['y0'])
            else:
                th = direcao(p['olhar'][0] - x, p['olhar'][1] - y) if (abs(p['olhar'][0] - x) + abs(p['olhar'][1] - y)) > 0.3 else math.radians(a0 + 180)
            a = pose_em(ac, t, p['fase'])
            baixar = a.pop('_baixar', 0)
            r.location = (x, y, chao(x, y) - baixar)
            queda = 0.0
            if p['morre']:
                queda = min(1.0, max(0.0, (u - 0.55) / 0.12))
            if p['morto_antes']:
                queda = 1.0
            if queda > 0:
                a = {k: tuple(v * (1 - queda) for v in val) for k, val in a.items()}
                r.rotation_euler = (math.radians(-88 * queda), 0, th)
                r.location = (x, y, chao(x, y) + 0.12 * queda)
            else:
                r.rotation_euler = (0, 0, th)
            aplicar_pose(partes, a)

    destino = os.path.join(pasta, tom['id'])
    os.makedirs(destino, exist_ok=True)
    sc = ilha.sc
    if teste:
        sc.render.resolution_percentage = 50
    quadros = tom.get('teste', [1, n // 2, n]) if teste else range(1, n + 1)
    telas = []
    for q in range(1, n + 1):
        t = (q - 1) / FPS
        u = (q - 1) / max(1, n - 1)
        camera_em(t, u)
        tributos_em(t, u)
        bpy.context.view_layer.update()
        reg = {}
        for tid in plano:
            cab = ilha.rig[tid][1]['cabeca'].matrix_world.translation + Vector((0, 0, 0.45))
            v = world_to_camera_view(sc, ilha.cam, cab)
            if 0 <= v.x <= 1 and 0 <= v.y <= 1 and v.z > 0:
                reg[tid] = [round(v.x, 4), round(1 - v.y, 4), round(v.z, 2)]
        telas.append(reg)
        if q not in quadros:
            continue
        arq = os.path.join(destino, f'{q:04d}.png')
        if os.path.exists(arq) and not teste:
            continue
        sc.render.filepath = arq
        bpy.ops.render.render(write_still=True)
        print('QUADRO', tom['id'], q, flush=True)
    with open(os.path.join(destino, 'pos.json'), 'w') as f:
        json.dump(dict(id=tom['id'], quadros=n, fps=FPS, telas=telas), f)


if __name__ == '__main__':
    args = sys.argv[sys.argv.index('--') + 1:]
    teste = '--teste' in args
    args = [a for a in args if a != '--teste']
    lista = json.load(open(args[0]))
    pasta = args[1]
    so = set(args[2].split(',')) if len(args) > 2 and args[2] else None
    logs = {}
    tributos = json.load(open(LOGS['oficial']))['meta']['tributos']
    ilha = Ilha(tributos)
    for tom in lista:
        if so and tom['id'] not in so:
            continue
        p = tom.get('partida', 'oficial')
        if p not in logs:
            logs[p] = json.load(open(LOGS[p]))
        filmar(ilha, logs[p], tom, pasta, teste)
    print('FIM')
