"""Gameplay 3D do vídeo 3: um "diretor" que lê o log da partida e filma cada turno na ilha low-poly.

Cada tomada (lista em JSON) diz: partida, turno, zona, tipo de câmera e quantos quadros. Os tributos ficam na zona onde
estavam no fim do turno; quem chegou naquele turno entra andando vindo da zona anterior; cada um faz a animação da sua
ação (beber, coletar, comer, sentar, dormir, atacar, falar); quem morreu no turno cai; mortos de antes somem.
Personagens com joelhos e cotovelos (personagens.criar_tributo_articulado), arma na mão conforme o inventário,
cabeça virando para quem fala. Luz por período, fogueiras, névoa roxa.

Campos de uma tomada: id, partida ('oficial'|'teste'), turno, zona, quadros, cam (orbita|baixa|segue|close|ombro|duelo|
aerea|grua|travel), alvo, para, angulo, lente, falas {id: [[ini, fim] em s]}, golpe (fração do tempo do ataque),
morte (fração do tempo da queda), acoes {id: ação}, mostrar [ids], largada (corrida das plataformas até a Cornucópia).
Saída: <pasta>/<id>/0001.png … + pos.json (posição na tela da cabeça de cada tributo por quadro, para os balões).

Uso: xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P ilha/blender/cena/gameplay.py -- <tomadas.json> <pasta> [ids] [--teste]
Ambiente: GP_PCT (resolução %, padrão 67 = 1280x720), GP_TAA (amostras, padrão 6), GP_DENS (vegetação, padrão 0.6).
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
import personagens as P  # noqa: E402
import objetos as O  # noqa: E402

RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
LOGS = {'oficial': os.path.join(RAIZ, 'logs', 'partida.json'), 'teste': os.path.join(RAIZ, 'logs', 'partida_v2_abortada.json')}
EMPRESA = {'Anthropic': 'anthropic', 'DeepSeek': 'deepseek', 'Alibaba': 'alibaba'}
ZC = {z['id']: z for z in ZONAS}
FPS = 24
LT, LS = 0.31, 0.47  # coxa (quadril→joelho) e canela+pé (joelho→chão)
ARMAS = ('machado', 'lanca', 'arco', 'faca')  # prioridade do que aparece na mão
ORDEM_PLAT = ['opus', 'ds1', 'qwen1', 'sonnet', 'ds2', 'qwen2', 'haiku1', 'ds3', 'qwen3', 'haiku2', 'ds4', 'qwen4']


def rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def chao(x, y):
    return max(altura(x, y), 0.0)


def suave(u):
    u = min(1.0, max(0.0, u))
    return u * u * (3 - 2 * u)


def ang_dif(a, b):
    return (a - b + math.pi) % (2 * math.pi) - math.pi


def direcao(dx, dy):
    return math.atan2(dx, -dy)  # frente local = -Y


def tremor(t, s, amp):
    """Câmera na mão: soma de senos (determinística)."""
    return Vector((amp * (math.sin(t * 1.3 + s) + 0.5 * math.sin(t * 3.1 + 2 * s)),
                   amp * (math.sin(t * 1.7 + 3 * s) + 0.5 * math.sin(t * 2.6 + s)),
                   amp * 0.6 * (math.sin(t * 2.1 + 5 * s))))


# ------------------------------------------------------------------ cena fixa (montada uma vez)
class Ilha:
    def __init__(self, tributos):
        bpy.ops.wm.read_factory_settings(use_empty=True)
        sc = self.sc = bpy.context.scene
        sc.render.fps = FPS
        montar_ilha(densidade=float(os.environ.get('GP_DENS', '0.6')))
        self.mundo = ceu_dia(sol_elev=35)
        sc.render.engine = 'BLENDER_EEVEE_NEXT'
        sc.eevee.taa_render_samples = int(os.environ.get('GP_TAA', '6'))
        sc.view_settings.view_transform = 'AgX'
        sc.view_settings.look = 'AgX - Punchy'
        sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
        sc.render.resolution_percentage = int(os.environ.get('GP_PCT', '67'))
        if os.environ.get('GP_RAPIDO', '1') == '1':  # CPU sem GPU: corta o que custa e quase não aparece
            ee = sc.eevee
            for nome, val in (('use_raytracing', False), ('shadow_ray_count', 1), ('shadow_step_count', 2),
                              ('shadow_resolution_scale', 0.5), ('use_volumetric_shadows', False),
                              ('volumetric_tile_size', '16'), ('volumetric_samples', 24), ('use_gtao', False)):
                if hasattr(ee, nome):
                    try:
                        setattr(ee, nome, val)
                    except Exception:
                        pass
        bpy.ops.object.light_add(type='SUN')
        self.sol = bpy.context.object
        self.sol.data.angle = math.radians(3)
        bpy.ops.object.camera_add()
        self.cam = bpy.context.object
        self.cam.data.clip_start, self.cam.data.clip_end = 0.1, 3000
        sc.camera = self.cam
        bpy.ops.object.light_add(type='AREA')  # preenchimento preso à câmera: rosto nunca fica em silhueta
        self.fill = bpy.context.object
        self.fill.data.size = 6
        self.fill.data.specular_factor = 0.0
        self.fill.data.use_shadow = False
        self.fill.parent = self.cam
        self.fill.location = (0, 1.5, 0.5)
        self.rig = {}
        for t in tributos:  # mesma semente das tomadas do Blender (praia) e dos retratos: ordem das plataformas
            self.rig[t['id']] = P.criar_tributo_articulado(f"R_{t['id']}", EMPRESA[t['distrito']], rgb(t['cor']),
                                                           seed=ORDEM_PLAT.index(t['id']) + 3)
        veg = bpy.data.collections.get('vegetacao')
        self.veg = [(o, o.location.x, o.location.y) for o in (veg.objects if veg else [])]
        self.terreno = next(o for o in bpy.data.objects if o.type == 'MESH' and o.name.lower().startswith('ilha'))
        self.fogos, self.nevoas = [], []
        self.mat_nevoa = bpy.data.materials.new('nevoa')
        self.mat_nevoa.use_nodes = True
        nt = self.mat_nevoa.node_tree
        nt.nodes.clear()
        vol = nt.nodes.new('ShaderNodeVolumePrincipled')
        vol.inputs['Color'].default_value = (0.55, 0.15, 0.85, 1)
        vol.inputs['Density'].default_value = 0.012
        vol.inputs['Emission Strength'].default_value = 0.05
        vol.inputs['Emission Color'].default_value = (0.6, 0.2, 1.0, 1)
        out = nt.nodes.new('ShaderNodeOutputMaterial')
        nt.links.new(vol.outputs[0], out.inputs['Volume'])
        self._palcos = {}
        self.caverna()
        self.noite = bpy.data.worlds.new('ceu_noite')
        self.noite.use_nodes = True
        ntn = self.noite.node_tree
        bgn = ntn.nodes['Background']
        coord = ntn.nodes.new('ShaderNodeTexCoord')
        grad = ntn.nodes.new('ShaderNodeSeparateXYZ')
        ramp = ntn.nodes.new('ShaderNodeValToRGB')
        ramp.color_ramp.elements[0].color = (0.07, 0.1, 0.22, 1)
        ramp.color_ramp.elements[1].position = 0.6
        ramp.color_ramp.elements[1].color = (0.012, 0.02, 0.06, 1)
        ntn.links.new(coord.outputs['Generated'], grad.inputs[0])
        ntn.links.new(grad.outputs['Z'], ramp.inputs[0])
        estr = ntn.nodes.new('ShaderNodeTexVoronoi')
        estr.inputs['Scale'].default_value = 420
        cut = ntn.nodes.new('ShaderNodeMath')
        cut.operation = 'LESS_THAN'
        cut.inputs[1].default_value = 0.035
        ntn.links.new(coord.outputs['Generated'], estr.inputs['Vector'])
        ntn.links.new(estr.outputs['Distance'], cut.inputs[0])
        mix = ntn.nodes.new('ShaderNodeMix')
        mix.data_type = 'RGBA'
        ntn.links.new(cut.outputs[0], mix.inputs['Factor'])
        ntn.links.new(ramp.outputs['Color'], mix.inputs[6])
        mix.inputs[7].default_value = (0.9, 0.92, 1.0, 1)
        ntn.links.new(mix.outputs[2], bgn.inputs['Color'])
        bgn.inputs['Strength'].default_value = 2.2

    def caverna(self):
        px, py = self.palco('caverna')
        zx, zy = ZC['caverna']['c']
        tras = Vector((zx - px, zy - py))
        tras = tras.normalized() if tras.length > 1 else Vector((0, 1))
        cx, cy = px + tras.x * 9, py + tras.y * 9
        rocha = P.mat_cor('caverna_rocha', (0.40, 0.38, 0.36), rough=0.95)
        escuro = P.mat_cor('caverna_boca', (0.02, 0.02, 0.025), rough=1.0)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1, location=(cx, cy, chao(cx, cy) - 0.8))
        m = bpy.context.object
        m.name = 'caverna_morro'
        m.scale = (7.5, 6.0, 5.0)
        m.rotation_euler = (0, 0, math.atan2(tras.y, tras.x))
        m.data.materials.append(rocha)
        rnd = random.Random(5)
        for v in m.data.vertices:  # irregular, facetado
            v.co *= rnd.uniform(0.86, 1.12)
        frente = Vector((-tras.x, -tras.y, 0))
        bx, by = cx + frente.x * 6.9, cy + frente.y * 6.9
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1, location=(bx, by, chao(bx, by) + 1.2))
        b = bpy.context.object
        b.name = 'caverna_boca'
        b.scale = (2.4, 0.9, 2.0)
        b.rotation_euler = frente.to_track_quat('-Y', 'Z').to_euler()
        b.data.materials.append(escuro)
        for i in range(7):  # pedras soltas na entrada
            a = rnd.uniform(-1.2, 1.2)
            d = rnd.uniform(6.5, 9)
            rx = cx + math.cos(math.atan2(frente.y, frente.x) + a) * d
            ry = cy + math.sin(math.atan2(frente.y, frente.x) + a) * d
            bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=rnd.uniform(0.4, 1.1), location=(rx, ry, chao(rx, ry)))
            pd = bpy.context.object
            pd.scale.z = rnd.uniform(0.5, 0.9)
            pd.data.materials.append(rocha)

    def periodo(self, per):
        s, w = self.sol, self.mundo
        self.sc.world = self.noite if per == 'noite' else self.mundo
        bg = w.node_tree.nodes.get('Background')
        ceu = next((n for n in w.node_tree.nodes if n.type == 'TEX_SKY'), None)
        if ceu:
            ceu.sun_elevation = math.radians({'manhã': 12, 'tarde': 42}.get(per, -4))
        self.fill.data.energy = {'manhã': 220, 'tarde': 140}.get(per, 520)
        self.fill.data.color = (1, 0.92, 0.85) if per != 'noite' else (0.7, 0.8, 1.0)
        self.sc.view_settings.exposure = -0.25 if per == 'noite' else 0.0
        if per == 'manhã':
            s.rotation_euler = (math.radians(90 - 14), 0, math.radians(110)); s.data.energy = 3.2; s.data.color = (1, 0.8, 0.6)
            if bg: bg.inputs['Strength'].default_value = 0.3
        elif per == 'tarde':
            s.rotation_euler = (math.radians(90 - 42), 0, math.radians(35)); s.data.energy = 4.5; s.data.color = (1, 0.97, 0.9)
            if bg: bg.inputs['Strength'].default_value = 0.35
        else:  # noite: lua azulada
            s.rotation_euler = (math.radians(90 - 35), 0, math.radians(-60)); s.data.energy = 2.2; s.data.color = (0.5, 0.62, 1.0)
            if bg: bg.inputs['Strength'].default_value = 0.2
        s.data.specular_factor = 0.35 if per == 'noite' else 1.0

    def extras(self, zonas_estado, per):
        for o in self.fogos + self.nevoas:
            bpy.data.objects.remove(o, do_unlink=True)
        self.fogos, self.nevoas = [], []
        for zid, z in zonas_estado.items():
            if zid not in ZC:
                continue
            cx, cy = self.palco(zid)
            if z.get('fogueira'):
                fx, fy = cx + 1.8, cy + 1.8
                f = O.criar_fogueira(f'fogo_{zid}', acesa=True, seed=1)
                f.location = (fx, fy, chao(fx, fy))
                bpy.ops.object.light_add(type='POINT', location=(fx, fy, chao(fx, fy) + 1.0))
                l = bpy.context.object
                l.data.energy = 700 if per == 'noite' else 200
                l.data.color = (1, 0.55, 0.2)
                l.data.shadow_soft_size = 0.3
                self.fogos += [f, l]
            if z.get('nevoa'):
                zx, zy = ZC[zid]['c']
                r = ZC[zid]['r'] * 0.9
                bpy.ops.mesh.primitive_cube_add(size=1, location=(zx, zy, chao(zx, zy) + 3.5))
                n = bpy.context.object
                n.scale = (r * 2, r * 2, 9)
                n.data.materials.append(self.mat_nevoa)
                self.nevoas.append(n)

    def palco(self, zid):
        """Ponto mais plano e seco perto do centro da zona (a Cornucópia fica na frente da boca)."""
        if zid in self._palcos:
            return self._palcos[zid]
        if zid == 'cornucopia':
            self._palcos[zid] = (0.0, -15.0)
            return self._palcos[zid]
        cx, cy = ZC[zid]['c']
        melhor, nota = (cx, cy), 1e9
        for r in range(0, 34, 3):
            for a in range(0, 360, 20 if r else 360):
                x, y = cx + math.cos(math.radians(a)) * r, cy + math.sin(math.radians(a)) * r
                h = altura(x, y)
                if h < 0.5:
                    continue
                incl = max(abs(altura(x + dx, y + dy) - h) for dx, dy in ((3, 0), (-3, 0), (0, 3), (0, -3), (5, 5), (-5, -5)))
                nt = incl + 0.04 * r + (2 if h > 30 else 0)
                if nt < nota:
                    melhor, nota = (x, y), nt
        self._palcos[zid] = melhor
        return melhor

    def esconder_vegetacao(self, pontos, raio):
        r2 = raio * raio
        for o, x, y in self.veg:
            o.hide_render = any((x - px) ** 2 + (y - py) ** 2 < r2 for px, py in pontos)

    def livre(self, mira, loc):
        """Sobe a câmera até o terreno não tapar a visão do alvo."""
        inv = self.terreno.matrix_world.inverted()
        for _ in range(16):
            o, d = inv @ mira, (inv @ loc) - (inv @ mira)
            ok, *_ = self.terreno.ray_cast(o, d.normalized(), distance=max(0.01, d.length - 0.05))
            if not ok and altura(loc.x, loc.y) < loc.z - 0.6:
                return loc
            loc = loc + Vector((0, 0, 1.2))
        return loc


# ------------------------------------------------------------------ animação
def extensao(coxa, joelho):
    """Altura do quadril acima do pé para uma perna (graus; coxa negativa = para frente)."""
    return LT * math.cos(math.radians(coxa)) + LS * math.cos(math.radians(coxa + joelho))


def pose_andar(t, fase, corre=False):
    f = 1.55 if corre else 0.95
    p = 2 * math.pi * (t * f + fase)
    s, c = math.sin(p), math.cos(p)
    A = 44 if corre else 26
    K = 85 if corre else 50
    B = 40 if corre else 22
    return {
        'perna_e': (-A * s, 0, 0), 'perna_d': (A * s, 0, 0),
        'canela_e': (6 + K * max(0.0, c) ** 1.3, 0, 0), 'canela_d': (6 + K * max(0.0, -c) ** 1.3, 0, 0),
        'braco_e': (B * s, 0, -4), 'braco_d': (-B * s, 0, 4),
        'antebraco_e': (-(75 if corre else 18), 0, 0), 'antebraco_d': (-(75 if corre else 18), 0, 0),
        'tronco': (14 if corre else 4, 0, 6 * s), 'cabeca': (-8 if corre else -2, 0, -5 * s),
    }


def pose_parado(t, fase, ferido=False):
    r = math.sin(2 * math.pi * (t * 0.27 + fase))
    if ferido:
        return {'tronco': (22 + 2 * r, 0, 6), 'cabeca': (12, 0, 0), 'braco_e': (-25, 0, 6), 'antebraco_e': (-60, 0, 0),
                'braco_d': (4, 0, -4), 'antebraco_d': (-12, 0, 0), 'perna_e': (-12, 0, 0), 'canela_e': (20, 0, 0),
                'perna_d': (6, 0, 0), 'canela_d': (8, 0, 0)}
    return {'tronco': (1.5 * r, 0, 2 * math.sin(2 * math.pi * (t * 0.11 + fase))), 'cabeca': (1.5 * r, 0, 0),
            'braco_e': (1.5 * r, 0, 5), 'braco_d': (-1.5 * r, 0, -5), 'antebraco_e': (-10, 0, 0), 'antebraco_d': (-12, 0, 0),
            'perna_e': (-3, 0, 2), 'canela_e': (5, 0, 0), 'perna_d': (2, 0, -2), 'canela_d': (3, 0, 0)}


def pose_falar(t, fase, g):
    """g: intensidade (0 = ouvindo, 1 = falando)."""
    a = pose_parado(t, fase)
    w = math.sin(2 * math.pi * (t * 1.15 + fase))
    w2 = math.sin(2 * math.pi * (t * 0.8 + fase + 0.3))
    a['braco_d'] = (-20 - 30 * g - 18 * g * w, 6, -12 * g)
    a['antebraco_d'] = (-20 - 55 * g - 15 * g * w2, 0, -10 * g)
    a['braco_e'] = (-6 - 14 * g * (0.5 + 0.5 * w2), 0, 8)
    a['antebraco_e'] = (-12 - 35 * g, 0, 10 * g)
    a['cabeca'] = (4 * g * math.sin(2 * math.pi * (t * 2.2 + fase)), 0, 0)
    a['tronco'] = (2 + 3 * g, 0, 5 * g * w2)
    return a


def pose_agachar(t, fase, acao):
    m = math.sin(2 * math.pi * (t * 0.7 + fase))
    a = {'perna_e': (-98, 0, 4), 'canela_e': (118, 0, 0), 'perna_d': (-88, 0, -4), 'canela_d': (112, 0, 0),
         'tronco': (40, 0, 0), 'cabeca': (-22, 0, 0)}
    if acao == 'beber':  # pega água com a mão e leva à boca
        b = 0.5 + 0.5 * m
        a.update({'braco_d': (-40 - 60 * b, 0, -8), 'antebraco_d': (-20 - 90 * b, 0, 0),
                  'braco_e': (-55, 0, 6), 'antebraco_e': (-25, 0, 0), 'tronco': (45 - 15 * b, 0, 0), 'cabeca': (-25 + 20 * b, 0, 0)})
    else:  # coletar, pegar, fogueira
        a.update({'braco_d': (-55 - 12 * m, 0, -6), 'antebraco_d': (-30 - 15 * m, 0, 0),
                  'braco_e': (-50 + 12 * m, 0, 6), 'antebraco_e': (-30 + 15 * m, 0, 0)})
    return a


def pose_comer(t, fase):
    a = pose_parado(t, fase)
    b = max(0.0, math.sin(2 * math.pi * (t * 0.65 + fase)))
    a.update({'braco_d': (-25 - 25 * b, 4, -10), 'antebraco_d': (-60 - 70 * b, 0, -10), 'cabeca': (6 * b, 0, 0),
              'braco_e': (-15, 0, 6), 'antebraco_e': (-45, 0, 0)})
    return a


def pose_sentar(t, fase):
    r = math.sin(2 * math.pi * (t * 0.25 + fase))
    return {'perna_e': (-122, 0, 8), 'canela_e': (72, 0, 0), 'perna_d': (-118, 0, -8), 'canela_d': (66, 0, 0),
            'tronco': (-6 + 1.5 * r, 0, 0), 'cabeca': (6, 0, 0), 'braco_e': (-58, 0, 10), 'antebraco_e': (-55, 0, 0),
            'braco_d': (-58, 0, -10), 'antebraco_d': (-55, 0, 0)}


def pose_dormir(t, fase):
    r = math.sin(2 * math.pi * (t * 0.2 + fase))
    return {'perna_e': (-55, 0, 0), 'canela_e': (75, 0, 0), 'perna_d': (-40, 0, 0), 'canela_d': (60, 0, 0),
            'tronco': (10 + 1.5 * r, 0, 0), 'cabeca': (12, 0, 0), 'braco_e': (-70, 0, 0), 'antebraco_e': (-60, 0, 0),
            'braco_d': (-40, 0, 0), 'antebraco_d': (-70, 0, 0)}


def pose_atacar(t, golpe_t, arma):
    """Prepara, golpeia no instante golpe_t (s) e volta. Devolve (ângulos, avanço em m)."""
    d = t - golpe_t
    prep = suave((d + 0.55) / 0.45) if d < 0 else 1.0
    bate = suave(d / 0.16) if d >= 0 else 0.0
    volta = suave((d - 0.6) / 0.5) if d > 0.6 else 0.0
    if arma == 'arco':
        puxa = prep * (1 - bate)
        a = {'braco_e': (-90, 0, 10), 'antebraco_e': (0, 0, 0), 'braco_d': (-90, 0, -10), 'antebraco_d': (-100 * puxa, 0, 0),
             'tronco': (4, 0, 30), 'cabeca': (0, 0, -25)}
    else:
        cima = prep * (1 - bate)
        a = {'braco_d': (-150 * cima + (15 - 40 * volta) * bate, 0, -10), 'antebraco_d': (-60 * cima - 10 * bate, 0, 0),
             'braco_e': (-35, 0, 10), 'antebraco_e': (-50, 0, 0),
             'tronco': (-8 * cima + 22 * bate * (1 - volta), 0, -14 * cima + 18 * bate * (1 - volta)), 'cabeca': (-6, 0, 0)}
    a.update({'perna_e': (-28, 0, 4), 'canela_e': (22, 0, 0), 'perna_d': (22, 0, -4), 'canela_d': (14, 0, 0)})
    avanco = 0.55 * bate * (1 - volta) if arma != 'arco' else 0.0
    return a, avanco


def pose_atingido(a, t, golpe_t):
    d = t - golpe_t
    if 0 <= d < 0.9:
        k = math.sin(min(1.0, d / 0.9) * math.pi)
        a = dict(a)
        a['tronco'] = (a.get('tronco', (0, 0, 0))[0] - 22 * k, 0, 10 * k)
        a['cabeca'] = (-15 * k, 0, 0)
        return a, -0.35 * k
    return a, 0.0


ACAO = {'mover': 'andar', 'beber': 'beber', 'beber_garrafa': 'comer', 'beber_cantil': 'comer', 'encher_cantil': 'coletar',
        'coletar_comida': 'coletar', 'coletar_madeira': 'coletar', 'pegar': 'pegar', 'comer': 'comer', 'descansar': 'descansar',
        'esconder': 'descansar', 'atacar': 'atacar', 'fogueira': 'fogueira', 'abrigo': 'coletar', 'curar': 'comer',
        'propor_alianca': 'falar', 'aceitar_alianca': 'falar', 'romper_alianca': 'falar'}


# ------------------------------------------------------------------ uma tomada
def lugares(ilha, ids, zid, seed, centro=None):
    """Posição de cada tributo na zona: roda solta em volta do palco, sempre em chão seco."""
    cx, cy = centro or ilha.palco(zid)
    rnd = random.Random(seed)
    n = max(1, len(ids))
    out = {}
    for i, tid in enumerate(sorted(ids)):
        a = 2 * math.pi * i / n + rnd.uniform(-0.3, 0.3)
        r = (1.6 + 0.42 * n) * rnd.uniform(0.8, 1.15) if n > 1 else 0.0
        x, y = cx + math.cos(a) * r, cy + math.sin(a) * r
        v = Vector((x - cx, y - cy))
        v = v.normalized() if v.length > 0.01 else Vector((1, 0))
        for _ in range(40):
            if altura(x, y) > 0.35:
                break
            x, y = x - v.x * 0.8, y - v.y * 0.8
        out[tid] = (x, y)
    return out


def arma_de(itens):
    return next((a for a in ARMAS if a in (itens or [])), None)


def filmar(ilha, log, tom, pasta, teste=False):
    k = tom['turno']
    turno = log['turnos'][k - 1]
    est = {s['id']: s for s in turno['estado']}
    ant = {s['id']: s for s in log['turnos'][k - 2]['estado']} if k > 1 else {}
    dec = {d['id']: d for d in turno['decisoes']}
    mortes = {e['vitima']: e for e in turno.get('eventos', []) if e['tipo'] == 'morte'}
    ataques = [e for e in turno.get('eventos', []) if e['tipo'] in ('ataque', 'revide')]
    zid = tom['zona']
    per = tom.get('periodo', turno['periodo'])
    ilha.periodo(per)
    ilha.extras(turno.get('zonas', {}), per)
    n = tom['quadros']
    dur = n / FPS
    golpe_t = tom.get('golpe', 0.45) * dur
    falas = {tid: [tuple(iv) for iv in ivs] for tid, ivs in tom.get('falas', {}).items()}

    if tom.get('largada'):  # corrida das plataformas até a boca da Cornucópia
        plats = json.load(open(os.path.join(RAIZ, 'dados', 'plataformas.json')))
        ordem = ORDEM_PLAT
        aqui = list(ordem)
        fim = lugares(ilha, aqui, 'cornucopia', seed=7, centro=(0.0, -8.0))
        ini = {tid: (p['x'], p['y']) for tid, p in zip(ordem, plats)}
        if tom['largada'] == 'parado':  # todos em cima das plataformas, esperando o sinal
            fim = dict(ini)
    else:
        aqui = tom.get('mostrar') or [i for i, s in est.items() if s['zona'] == zid and (s['vivo'] or i in mortes)]
        fim = lugares(ilha, aqui, zid, seed=k * 31 + len(aqui))
        ini = {}
    cx, cy = ilha.palco(zid)
    plano = {}
    for tid, (r, partes, itens) in ilha.rig.items():
        vis = tid in aqui
        for ob in [r] + list(partes.values()):
            ob.hide_render = not vis
        arma = None
        if vis:  # arma do golpe; senão a do inventário (quem morre no turno perde os itens no estado final)
            golpe_ev = next((e for e in ataques if e['id'] == tid and e.get('arma') in ARMAS), None)
            arma = golpe_ev['arma'] if golpe_ev else (arma_de(est.get(tid, {}).get('itens')) or arma_de(ant.get(tid, {}).get('itens')))
        for nome_item, ob in itens.items():
            ob.hide_render = (nome_item != arma)
        if not vis:
            continue
        x1, y1 = fim[tid]
        d = dec.get(tid, {})
        acao = tom.get('acoes', {}).get(tid) or ACAO.get(d.get('acao', ''), 'parado')
        if tom.get('largada') == 'parado':
            x0, y0 = x1, y1
            acao = 'parado'
        elif tom.get('largada'):
            x0, y0 = ini[tid]
            acao = 'pegar'
        elif tid in ant and ant[tid]['zona'] != zid and ant[tid]['zona'] in ZC:  # entra andando vindo da zona anterior
            ax, ay = ZC[ant[tid]['zona']]['c']
            v = Vector((ax - x1, ay - y1)).normalized()
            x0, y0 = x1 + v.x * 10, y1 + v.y * 10
            if acao == 'andar':
                acao = 'parado'
        else:
            x0, y0 = x1, y1
        if acao == 'andar':  # "se moveu" para a zona onde já estava: chega andando de perto
            v = Vector((x1 - cx, y1 - cy))
            v = v.normalized() if v.length > 0.01 else Vector((1, 0))
            x0, y0 = x1 + v.x * 6, y1 + v.y * 6
            acao = 'parado'
        if acao == 'descansar' and per == 'noite':
            acao = 'dormir'
        if acao == 'parado' and (d.get('fala') or tid in falas):
            acao = 'falar'
        alvo_atq = next((e['alvo'] for e in ataques if e['id'] == tid and e['alvo'] in fim), None)
        if acao == 'atacar' and not alvo_atq:
            acao = 'falar' if d.get('fala') else 'parado'
        atingido = any(e['alvo'] == tid and e['id'] in fim for e in ataques)
        plano[tid] = dict(x0=x0, y0=y0, x1=x1, y1=y1, acao=acao, anda=(abs(x0 - x1) + abs(y0 - y1)) > 0.01,
                          alvo=alvo_atq, atingido=atingido, arma=arma, morre=tid in mortes and tid not in tom.get('imortais', []),
                          ferido=est[tid]['vida'] < 35, fase=random.Random(tid + str(k)).random(),
                          corre=tom.get('largada') is True, plataforma=tom.get('largada') == 'parado')
    ids = list(plano)
    gx = sum(plano[i]['x1'] for i in ids) / len(ids) if ids else cx
    gy = sum(plano[i]['y1'] for i in ids) / len(ids) if ids else cy
    grupo = Vector((gx, gy, chao(gx, gy) + 1.0))
    espalho = max([math.hypot(plano[i]['x1'] - gx, plano[i]['y1'] - gy) for i in ids] + [1.0])

    def quem_fala(t):
        for tid, ivs in falas.items():
            if tid in plano and any(a <= t <= b for a, b in ivs):
                return tid
        return None

    # ---- posição/pose de cada tributo no instante t
    def estado_trib(tid, t):
        p = plano[tid]
        if p['anda']:
            dist = math.hypot(p['x1'] - p['x0'], p['y1'] - p['y0'])
            vel = 4.6 if p['corre'] else 1.45
            t_chega = max(dist / vel, dur * 0.25)
            w = min(1.0, t / t_chega)
            w = (w * w * (3 - 2 * w)) * 0.15 + w * 0.85  # arranque e chegada suaves
            x = p['x0'] + (p['x1'] - p['x0']) * w
            y = p['y0'] + (p['y1'] - p['y0']) * w
            andando = w < 0.999
        else:
            x, y, andando = p['x1'], p['y1'], False
        if andando:
            th = direcao(p['x1'] - p['x0'], p['y1'] - p['y0'])
        elif p['alvo']:
            th = direcao(plano[p['alvo']]['x1'] - x, plano[p['alvo']]['y1'] - y)
        elif len(ids) > 1:
            th = direcao(gx - x, gy - y) if math.hypot(gx - x, gy - y) > 0.4 else direcao(cx - x, cy - y)
        else:
            th = math.radians(tom.get('angulo', 200) + 180)
        avanco, deitar, lado = 0.0, 0.0, 0.0
        if andando:
            a = pose_andar(t, p['fase'], corre=p['corre'])
        else:
            ac = p['acao']
            if ac in ('beber', 'coletar', 'pegar', 'fogueira'):
                a = pose_agachar(t, p['fase'], ac)
            elif ac == 'comer':
                a = pose_comer(t, p['fase'])
            elif ac == 'descansar':
                a = pose_sentar(t, p['fase'])
            elif ac == 'dormir':
                a = pose_dormir(t, p['fase'])
                lado = 1.0
            elif ac == 'atacar':
                a, avanco = pose_atacar(t, golpe_t, p['arma'])
            elif ac == 'falar':
                g = 1.0 if quem_fala(t) == tid else (0.0 if falas else 0.5 + 0.5 * math.sin(t * 0.9 + p['fase'] * 6))
                a = pose_falar(t, p['fase'], g)
            else:
                a = pose_parado(t, p['fase'], ferido=p['ferido'])
        if p['atingido']:
            a, recuo = pose_atingido(a, t, golpe_t + 0.12)
            avanco += recuo
        foco = quem_fala(t)  # cabeça vira para quem está falando
        if foco and foco != tid and not andando and lado == 0:
            rel = math.degrees(ang_dif(direcao(plano[foco]['x1'] - x, plano[foco]['y1'] - y), th))
            cab = a.get('cabeca', (0, 0, 0))
            a['cabeca'] = (cab[0], cab[1], max(-65.0, min(65.0, rel)))
        tm = dur * tom.get('morte', 0.6)
        if p['morre']:  # cambaleia e cai de costas
            if t > tm - 0.8:
                a = pose_parado(t, p['fase'], ferido=True)
            deitar = suave((t - tm) / 0.45) if t > tm else 0.0
            if deitar > 0:
                a = {kk: tuple(v * (1 - deitar) for v in val) for kk, val in a.items()}
        ext = max(extensao(a.get('perna_e', (0,))[0], a.get('canela_e', (0,))[0]),
                  extensao(a.get('perna_d', (0,))[0], a.get('canela_d', (0,))[0]))
        baixar = 0.78 - min(0.78, ext)  # quadril na altura certa para os pés tocarem o chão
        frente = Vector((math.sin(th), -math.cos(th), 0))
        pos = Vector((x, y, 0)) + frente * avanco
        z = chao(pos.x, pos.y)
        if lado:
            rot = (0.0, math.radians(90), th)
            z += 0.24
        elif deitar:
            quique = 0.06 * math.sin(min(1.0, max(0.0, (t - tm - 0.45) / 0.3)) * math.pi)
            rot = (math.radians(-88 * deitar), 0.0, th)
            z += 0.13 * deitar + quique - baixar * (1 - deitar)
        else:
            rot = (0.0, 0.0, th)
            z -= baixar
        if p['plataforma']:
            z += 0.25
        return pos.x, pos.y, z, rot, a

    def aplicar(tid, t):
        r, partes, _ = ilha.rig[tid]
        x, y, z, rot, a = estado_trib(tid, t)
        r.location = (x, y, z)
        r.rotation_euler = rot
        for nome, ob in partes.items():
            rx, ry, rz = a.get(nome, (0, 0, 0))
            ob.rotation_euler = (math.radians(rx), math.radians(ry), math.radians(rz))

    # ---- câmera
    alvo = tom.get('alvo') if tom.get('alvo') in plano else None
    para = tom.get('para') if tom.get('para') in plano else None
    tipo = tom.get('cam', 'orbita')
    rnd = random.Random(k * 7 + len(zid) + len(tom['id']))
    a0 = tom.get('angulo', rnd.uniform(0, 360))
    if a0 == 'centro':  # câmera do lado do centro da zona (no lago: em cima da água, olhando a margem)
        zx, zy = ZC[zid]['c']
        a0 = math.degrees(math.atan2(zy - gy, zx - gx))
    semente = rnd.uniform(0, 10)

    def pos_trib(tid, t):
        x, y, z, _, _ = estado_trib(tid, t)
        return Vector((x, y, z))

    def camera_em(t, u):
        c = ilha.cam
        e = suave(u)
        if tipo == 'segue' and alvo:
            p = plano[alvo]
            q = pos_trib(alvo, t)
            th = direcao(p['x1'] - p['x0'], p['y1'] - p['y0']) if p['anda'] else math.radians(a0)
            atras = Vector((-math.sin(th), math.cos(th), 0))
            lado = Vector((math.cos(th), math.sin(th), 0))
            loc = q + atras * (4.0 - 0.6 * e) + lado * 1.0 + Vector((0, 0, 2.1))
            mira = q + Vector((0, 0, 1.2)) - atras * 2.5
            lente = 30
        elif tipo == 'close' and alvo:
            q = pos_trib(alvo, t)
            if tom.get('angulo') is not None:
                th = math.radians(a0)
            elif len(ids) > 1:
                th = direcao(gx - q.x, gy - q.y)
            else:
                th = math.radians(a0)
            frente = Vector((math.sin(th), -math.cos(th), 0))
            lado = Vector((math.cos(th), math.sin(th), 0))
            loc = q + frente * (3.4 - 0.5 * e) + lado * 0.8 + Vector((0, 0, 1.6))
            mira = q + Vector((0, 0, 1.25))
            lente = 40
        elif tipo == 'ombro' and alvo and para:
            qa, qb = pos_trib(alvo, t), pos_trib(para, t)
            dv = qb - qa
            dv.z = 0
            dv = dv.normalized() if dv.length > 0.01 else Vector((1, 0, 0))
            lado = Vector((-dv.y, dv.x, 0))
            loc = qa - dv * (1.7 - 0.3 * e) + lado * 0.65 + Vector((0, 0, 1.75))
            mira = qb + Vector((0, 0, 1.3))
            lente = 38
        elif tipo == 'duelo' and alvo:
            qa = pos_trib(alvo, t)
            ob = plano[alvo]['alvo'] or para
            qb = pos_trib(ob, t) if ob else qa + Vector((2, 0, 0))
            m = (qa + qb) / 2
            dv = qb - qa
            dv.z = 0
            dv = dv.normalized() if dv.length > 0.01 else Vector((1, 0, 0))
            nrm = Vector((-dv.y, dv.x, 0))
            if math.cos(math.radians(a0)) < 0:
                nrm = -nrm
            sep = (qb - qa).length
            loc = m + nrm * (max(4.2, sep * 1.1 + 2.6) - 0.8 * e) - dv * 0.5 + Vector((0, 0, 1.45))
            mira = m + Vector((0, 0, 1.0))
            lente = 32
        elif tipo == 'aerea':
            a = math.radians(a0 + 30 * e)
            loc = Vector((grupo.x + math.cos(a) * 42, grupo.y + math.sin(a) * 42, grupo.z + 26 - 8 * e))
            mira = grupo.copy()
            lente = 30
        elif tipo == 'grua':  # sobe do chão e revela o grupo
            a = math.radians(a0 + 15 * e)
            r = espalho + 7
            loc = Vector((grupo.x + math.cos(a) * r, grupo.y + math.sin(a) * r, grupo.z - 0.6 + 9 * e))
            mira = grupo + Vector((0, 0, -0.4 + 0.2 * e))
            lente = 28
        elif tipo == 'travel':
            a = math.radians(a0)
            dirc = Vector((math.cos(a), math.sin(a), 0))
            lado = Vector((-dirc.y, dirc.x, 0))
            loc = grupo + dirc * (espalho + 6) + lado * (-4 + 8 * e) + Vector((0, 0, 0.8))
            mira = grupo + lado * (-1 + 2 * e)
            lente = 34
        elif tipo == 'alta':
            a = math.radians(a0 + 20 * e)
            r = espalho + 9
            loc = Vector((grupo.x + math.cos(a) * r, grupo.y + math.sin(a) * r, grupo.z + 6.5 - 1.0 * e))
            mira = grupo - Vector((0, 0, 0.6))
            lente = 30
        elif tipo == 'baixa':
            a = math.radians(a0)
            r = espalho + 8 - 4 * e
            loc = Vector((grupo.x + math.cos(a) * r, grupo.y + math.sin(a) * r, grupo.z - 0.35))
            mira = grupo + Vector((0, 0, 0.5))
            lente = 26
        else:  # órbita em volta do grupo
            a = math.radians(a0 + 32 * e)
            r = espalho + 6.5
            loc = Vector((grupo.x + math.cos(a) * r, grupo.y + math.sin(a) * r, grupo.z + 1.6))
            mira = grupo - Vector((0, 0, 0.25))
            lente = 30
        loc = loc + tremor(t, semente, 0.15 if tipo == 'aerea' else 0.025)
        mira = mira + tremor(t * 0.8, semente + 1, 0.015)
        loc = ilha.livre(mira, loc)
        c.data.lens = tom.get('lente', lente)
        c.location = loc
        c.rotation_euler = (mira - loc).to_track_quat('-Z', 'Y').to_euler()

    # vegetação que atrapalha: some perto dos tributos e do caminho da câmera
    pontos = [(plano[i]['x0'], plano[i]['y0']) for i in ids] + [(plano[i]['x1'], plano[i]['y1']) for i in ids]
    pontos += [((plano[i]['x0'] + plano[i]['x1']) / 2, (plano[i]['y0'] + plano[i]['y1']) / 2) for i in ids if plano[i]['anda']]
    for q in range(0, n, max(1, n // 6)):
        camera_em(q / FPS, q / max(1, n - 1))
        pontos.append((ilha.cam.location.x, ilha.cam.location.y))
    ilha.esconder_vegetacao(pontos, 2.6)

    destino = os.path.join(pasta, tom['id'])
    os.makedirs(destino, exist_ok=True)
    sc = ilha.sc
    if teste:
        sc.render.resolution_percentage = 50
    quadros = set(tom.get('teste', [1, n // 2, n])) if teste else set(range(1, n + 1))
    telas = []
    for q in range(1, n + 1):
        t = (q - 1) / FPS
        u = (q - 1) / max(1, n - 1)
        for tid in ids:
            aplicar(tid, t)
        camera_em(t, u)
        bpy.context.view_layer.update()
        reg = {}
        for tid in ids:
            cab = ilha.rig[tid][1]['cabeca'].matrix_world.translation + Vector((0, 0, 0.5))
            v = world_to_camera_view(sc, ilha.cam, cab)
            if -0.05 <= v.x <= 1.05 and -0.05 <= v.y <= 1.05 and v.z > 0:
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
