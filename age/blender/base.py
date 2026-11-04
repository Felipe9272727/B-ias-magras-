"""Base dos sprites 3D do vídeo estilo Age of Empires IV: materiais, primitivas, câmera ortográfica inclinada
(ELEV=52 graus, igual ao Overcooked), sol quente com sombra (Cycles + shadow catcher) e gravação PNG + metadados."""
import bpy, bmesh, math, os, json, random, tempfile, subprocess
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
SAIDA = os.path.join(RAIZ, 'video', 'remotion', 'public', 'age', 'pecas')
TMP = tempfile.mkdtemp(prefix='age_q_')
ELEV = 52
SS = 2                     # supersampling (renderiza em 2x e reduz com Lanczos)
PX_PREDIOS = 8             # pixels por metro: prédios e árvores
PX_UNID = 40               # pixels por metro: unidades, animais, arbustos, rochas
LUZ = Vector((0.62, 0.30, -0.72)).normalized()   # direção em que a luz viaja (sombra cai para a direita/atrás)

COR = {'vermelho': (220, 40, 40), 'azul': (40, 90, 230), 'amarelo': (240, 200, 30),
       'verde': (40, 170, 60), 'roxo': (150, 60, 200), 'laranja': (240, 130, 30)}
M = {}


def lin(c):
    return tuple((v / 255.0) ** 2.2 if max(c) > 1 else v ** 2.2 for v in c)


def mat(nome, cor, rough=0.6, metal=0.0, emit=0.0):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*lin(cor), 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*lin(cor), 1)
        b.inputs['Emission Strength'].default_value = emit
    return m


def mat_tex(nome, c1, c2, mort, larg, alto, msz=0.05, rough=0.85, plano=False):
    """Blocos/tábuas procedurais em coordenadas de mundo: paredes usam (x+y, z); lajes usam (x, y)."""
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    b = n['Principled BSDF']
    b.inputs['Roughness'].default_value = rough
    geo = n.new('ShaderNodeNewGeometry')
    sep = n.new('ShaderNodeSeparateXYZ')
    l.new(geo.outputs['Position'], sep.inputs[0])
    comb = n.new('ShaderNodeCombineXYZ')
    if plano:
        l.new(sep.outputs['X'], comb.inputs['X'])
        l.new(sep.outputs['Y'], comb.inputs['Y'])
    else:
        add = n.new('ShaderNodeMath'); add.operation = 'ADD'
        l.new(sep.outputs['X'], add.inputs[0]); l.new(sep.outputs['Y'], add.inputs[1])
        l.new(add.outputs[0], comb.inputs['X'])
        l.new(sep.outputs['Z'], comb.inputs['Y'])
    br = n.new('ShaderNodeTexBrick')
    br.inputs['Color1'].default_value = (*lin(c1), 1)
    br.inputs['Color2'].default_value = (*lin(c2), 1)
    br.inputs['Mortar'].default_value = (*lin(mort), 1)
    br.inputs['Scale'].default_value = 1.0
    br.inputs['Mortar Size'].default_value = msz
    br.inputs['Mortar Smooth'].default_value = 0.1
    br.inputs['Brick Width'].default_value = larg
    br.inputs['Row Height'].default_value = alto
    l.new(comb.outputs[0], br.inputs['Vector'])
    l.new(br.outputs['Color'], b.inputs['Base Color'])
    return m


def mats():
    M['pedra'] = mat_tex('pedra', (200, 190, 168), (178, 168, 148), (120, 112, 98), 1.4, 0.7, 0.07)
    M['pedra_esc'] = mat_tex('pedra_esc', (150, 142, 130), (128, 120, 110), (90, 84, 76), 1.4, 0.7, 0.07)
    M['laje'] = mat_tex('laje', (214, 204, 182), (196, 186, 164), (140, 130, 114), 1.6, 1.6, 0.06, plano=True)
    M['cal'] = mat('cal', (236, 222, 188), 0.85)
    M['marmore'] = mat('marmore', (244, 240, 230), 0.4)
    M['madeira'] = mat_tex('madeira', (160, 108, 58), (140, 92, 48), (78, 48, 24), 0.55, 40.0, 0.05, 0.75)
    M['madeira_lisa'] = mat('madeira_lisa', (150, 100, 54), 0.75)
    M['madeira_esc'] = mat('madeira_esc', (92, 58, 30), 0.8)
    M['telha1'] = mat('telha1', (196, 78, 42), 0.7)
    M['telha2'] = mat('telha2', (170, 62, 34), 0.7)
    M['tabua1'] = mat('tabua1', (122, 86, 54), 0.8)
    M['tabua2'] = mat('tabua2', (104, 72, 44), 0.8)
    M['palha1'] = mat('palha1', (222, 184, 82), 0.9)
    M['palha2'] = mat('palha2', (200, 160, 66), 0.9)
    M['jog'] = mat('jog', (200, 50, 50), 0.55)
    M['jog_esc'] = mat('jog_esc', (120, 30, 30), 0.55)
    M['jog_cla'] = mat('jog_cla', (240, 120, 120), 0.55)
    M['ouro'] = mat('ouro', (255, 200, 70), 0.3, metal=0.9)
    M['aco'] = mat('aco', (178, 184, 192), 0.35, metal=0.85)
    M['ferro'] = mat('ferro', (60, 62, 68), 0.5, metal=0.6)
    M['preto'] = mat('preto', (34, 30, 28), 0.8)
    M['porta'] = mat('porta', (72, 44, 24), 0.8)
    M['vidro'] = mat('vidro', (40, 52, 70), 0.2)
    M['creme'] = mat('creme', (240, 228, 200), 0.8)
    M['branco'] = mat('branco', (246, 244, 238), 0.7)
    M['solo'] = mat('solo', (96, 62, 34), 0.95)
    M['solo_esc'] = mat('solo_esc', (70, 44, 24), 0.95)
    M['grama'] = mat('grama', (96, 150, 52), 0.9)
    M['trigo'] = mat('trigo', (232, 188, 54), 0.8)
    M['trigo_v'] = mat('trigo_v', (140, 180, 60), 0.8)
    M['verde1'] = mat('verde1', (70, 140, 52), 0.8)
    M['verde2'] = mat('verde2', (88, 160, 58), 0.8)
    M['verde3'] = mat('verde3', (52, 118, 56), 0.8)
    M['pinho1'] = mat('pinho1', (36, 100, 62), 0.8)
    M['pinho2'] = mat('pinho2', (48, 116, 66), 0.8)
    M['bordo1'] = mat('bordo1', (214, 96, 36), 0.8)
    M['bordo2'] = mat('bordo2', (230, 140, 40), 0.8)
    M['bordo3'] = mat('bordo3', (190, 64, 40), 0.8)
    M['tronco'] = mat('tronco', (110, 74, 44), 0.9)
    M['tronco_cl'] = mat('tronco_cl', (206, 160, 100), 0.8)
    M['pele'] = mat('pele', (236, 184, 140), 0.7)
    M['calca'] = mat('calca', (110, 84, 58), 0.8)
    M['couro'] = mat('couro', (130, 84, 44), 0.75)
    M['cavalo'] = mat('cavalo', (116, 72, 40), 0.7)
    M['cavalo_esc'] = mat('cavalo_esc', (48, 30, 20), 0.7)
    M['cervo'] = mat('cervo', (176, 122, 70), 0.8)
    M['rocha'] = mat('rocha', (190, 190, 186), 0.85)
    M['rocha2'] = mat('rocha2', (168, 168, 164), 0.85)
    M['rocha_esc'] = mat('rocha_esc', (96, 96, 104), 0.8)
    M['cristal'] = mat('cristal', (255, 204, 72), 0.25, metal=0.9, emit=0.35)
    M['fogo'] = mat('fogo', (255, 120, 20), 0.5, emit=6.0)
    M['brasa'] = mat('brasa', (255, 80, 10), 0.5, emit=3.0)
    M['fumaca'] = mat('fumaca', (120, 118, 116), 1.0)
    M['carvao'] = mat('carvao', (30, 26, 24), 0.9)
    M['baga'] = mat('baga', (200, 30, 50), 0.4)
    M['feno'] = mat('feno', (226, 190, 80), 0.9)
    M['agua'] = mat('agua', (70, 140, 200), 0.1)


def set_jog(nome):
    r, g, b = COR[nome]
    def pintar(m, f=1.0, mistura=0.0):
        c = tuple(min(255, (v * f) * (1 - mistura) + 255 * mistura) for v in (r, g, b))
        m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*lin(c), 1)
    pintar(M['jog']); pintar(M['jog_esc'], 0.58); pintar(M['jog_cla'], 1.0, 0.38)


# ------------------------------------------------------------------ primitivas
def _link(nome, me, m, pai, loc, rot):
    o = bpy.data.objects.new(nome, me)
    bpy.context.collection.objects.link(o)
    o.location = loc
    if rot:
        o.rotation_euler = rot
    if m is not None:
        o.data.materials.append(m)
    if pai is not None:
        o.parent = pai
    return o


def grupo(loc=(0, 0, 0), rot=None, pai=None, nome='grupo'):
    o = bpy.data.objects.new(nome, None)
    bpy.context.collection.objects.link(o)
    o.location = loc
    if rot:
        o.rotation_euler = rot
    if pai is not None:
        o.parent = pai
    return o


def _bisel(o, w):
    if w > 0:
        md = o.modifiers.new('bisel', 'BEVEL'); md.width = w; md.segments = 2; md.limit_method = 'ANGLE'


def caixa(x, y, z0, sx, sy, sz, m, pai=None, rot=None, bisel=0.05, centro=False):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= sx; v.co.y *= sy; v.co.z *= sz
    me = bpy.data.meshes.new('caixa')
    bm.to_mesh(me); bm.free()
    o = _link('caixa', me, m, pai, (x, y, z0 if centro else z0 + sz / 2), rot)
    _bisel(o, min(bisel, min(sx, sy, sz) * 0.3))
    return o


def cil(x, y, z0, r, h, m, pai=None, rot=None, verts=12, r2=None, liso=False, centro=False):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r if r2 is None else r2, depth=h,
                                    location=(x, y, z0 if centro else z0 + h / 2))
    o = bpy.context.active_object
    o.name = 'cil'
    o.data.materials.append(m)
    for p in o.data.polygons:
        p.use_smooth = liso
    if rot:
        o.rotation_euler = rot
    if pai is not None:
        o.parent = pai
    return o


def esf(x, y, z, rx, ry, rz, m, pai=None, rot=None, seg=16, anel=10, liso=True):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=anel, radius=1, location=(x, y, z))
    o = bpy.context.active_object
    o.name = 'esf'
    o.scale = (rx, ry, rz)
    o.data.materials.append(m)
    for p in o.data.polygons:
        p.use_smooth = liso
    if rot:
        o.rotation_euler = rot
    if pai is not None:
        o.parent = pai
    return o


def rocha(x, y, z, r, m, pai=None, seed=0, esc=(1, 1, 1), sub=1, ruido=0.2, rot=None, chato=True):
    """Pedra facetada (icosfera deformada, sombreamento chapado)."""
    rnd = random.Random(seed)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub, radius=1, location=(x, y, z))
    o = bpy.context.active_object
    o.name = 'rocha'
    for v in o.data.vertices:
        f = 1 + rnd.uniform(-ruido, ruido)
        v.co *= f
    o.scale = (r * esc[0], r * esc[1], r * esc[2])
    o.data.materials.append(m)
    for p in o.data.polygons:
        p.use_smooth = not chato
    if rot:
        o.rotation_euler = rot
    if pai is not None:
        o.parent = pai
    return o


def extrudar(nome, pts, esp, m, plano='xz', pos=(0, 0, 0), pai=None, rot=None):
    """Polígono 2D extrudado. plano 'xz': pts=(x,z), espessura em y; 'yz': pts=(y,z), espessura em x."""
    n = len(pts)
    vs = []
    for s in (-esp / 2, esp / 2):
        for (a, b) in pts:
            vs.append((a, s, b) if plano == 'xz' else (s, a, b))
    fs = [tuple(range(n)), tuple(range(2 * n - 1, n - 1, -1))]
    for i in range(n):
        j = (i + 1) % n
        fs.append((i, j, n + j, n + i))
    me = bpy.data.meshes.new(nome)
    me.from_pydata(vs, [], fs)
    me.update()
    o = _link(nome, me, m, pai, pos, rot)
    # normais para fora
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    return o


# ------------------------------------------------------------------ peças de arquitetura
def telhado(x, y, z_parede, w, d, subida, m1, m2, pai=None, rot90=False, ov=0.6, ovx=0.35, filas=7, m_nucleo=None, m_cumeeira=None):
    """Telhado de duas águas (cumeeira ao longo de x local) feito de fileiras de telhas sobrepostas.
    z_parede = altura do topo da parede; w = comprimento da cumeeira; d = profundidade da parede."""
    run = d / 2 + ov
    z0 = z_parede - subida * ov / run
    e = grupo((x, y, z0), (0, 0, math.pi / 2) if rot90 else None, pai, 'telhado')
    a = math.atan2(subida, run)
    L = math.hypot(run, subida)
    passo = L / filas
    # núcleo triangular (empena) na cor da parede
    if m_nucleo is not None:
        extrudar('empena', [(-d / 2, -0.1), (d / 2, -0.1), (0, subida - 0.15)], w, m_nucleo, 'yz', pai=e)
    for lado in (-1, 1):
        for i in range(filas):
            s = (i + 0.5) * passo
            yy = lado * (run - s * math.cos(a))
            zz = s * math.sin(a) + 0.09 * math.cos(a) + 0.045 * (i % 2)
            caixa(0, yy, zz, w + 2 * ovx, passo * 1.4, 0.16, m1 if i % 2 == 0 else m2, e,
                  rot=(lado * a, 0, 0), bisel=0.03, centro=True)
    caixa(0, 0, subida, w + 2 * ovx + 0.1, 0.5, 0.5, m_cumeeira or m1, e, rot=(math.pi / 4, 0, 0), bisel=0.04, centro=True)
    return e


def piramide(x, y, z0, lado, h, m, pai=None, giro=0.0):
    return cil(x, y, z0, lado * 0.7071, h, m, pai, rot=(0, 0, math.pi / 4 + giro), verts=4, r2=0.0)


def ameias(x, y, z0, sx, sy, m, pai=None, lados='ftde', alt=0.8, larg=0.9, esp=0.55, passo=1.8):
    """Dentes de muralha ao longo do retângulo sx × sy centrado em (x,y). f=frente(-y) t=trás d=direita e=esquerda."""
    def fila(compr, fixo, eixo):
        n = max(2, int(compr / passo))
        for i in range(n):
            t = -compr / 2 + larg / 2 + i * (compr - larg) / (n - 1)
            if eixo == 'x':
                caixa(x + t, y + fixo, z0, larg, esp, alt, m, pai, bisel=0.05)
            else:
                caixa(x + fixo, y + t, z0, esp, larg, alt, m, pai, bisel=0.05)
    if 'f' in lados: fila(sx, -sy / 2 + esp / 2, 'x')
    if 't' in lados: fila(sx, sy / 2 - esp / 2, 'x')
    if 'd' in lados: fila(sy, sx / 2 - esp / 2, 'y')
    if 'e' in lados: fila(sy, -sx / 2 + esp / 2, 'y')


def porta(x, y, z0, larg, alt, pai=None, moldura=None, folha=None):
    moldura = moldura or M['pedra_esc']; folha = folha or M['porta']
    caixa(x, y - 0.02, z0, larg + 0.7, 0.3, alt - larg / 2 + 0.35, moldura, pai, bisel=0.05)
    cil(x, y - 0.02, z0 + alt - larg / 2, larg / 2 + 0.35, 0.3, moldura, pai, rot=(math.pi / 2, 0, 0), verts=16)
    caixa(x, y - 0.12, z0, larg, 0.2, alt - larg / 2, folha, pai, bisel=0.03)
    cil(x, y - 0.12, z0 + alt - larg / 2, larg / 2, 0.2, folha, pai, rot=(math.pi / 2, 0, 0), verts=16)
    caixa(x, y - 0.24, z0 + 0.1, 0.12, 0.08, alt - larg / 2 - 0.1, M['ferro'], pai, bisel=0.01)


def janela(x, y, z0, larg=0.9, alt=1.2, pai=None, veneziana=None, arqueada=False):
    caixa(x, y - 0.02, z0 - 0.12, larg + 0.5, 0.2, alt + 0.24, M['creme'], pai, bisel=0.03)
    caixa(x, y - 0.14, z0, larg, 0.1, alt, M['vidro'], pai, bisel=0.02)
    caixa(x, y - 0.2, z0 + alt / 2 - 0.04, larg, 0.06, 0.08, M['creme'], pai, bisel=0.01)
    caixa(x, y - 0.2, z0, 0.08, 0.06, alt, M['creme'], pai, bisel=0.01)
    if veneziana is not None:
        for s in (-1, 1):
            caixa(x + s * (larg / 2 + 0.38), y - 0.2, z0, 0.38, 0.08, alt, veneziana, pai, bisel=0.02)


def bandeira(x, y, z, L, H, m, pai=None, forma='pontuda', esp=0.07, rot=None):
    """Bandeira no plano xz com o lado esquerdo (x) preso ao mastro; (x,y,z) = canto superior preso."""
    if forma == 'pontuda':
        pts = [(0, 0), (L, -H * 0.28), (L * 0.78, -H * 0.5), (L, -H * 0.72), (0, -H)]
    else:
        pts = [(0, 0), (L, 0), (L, -H), (0, -H)]
    return extrudar('bandeira', pts, esp, m, 'xz', (x, y, z), pai, rot)


def mastro(x, y, z0, h, L, H, m_pano, pai=None, forma='pontuda'):
    cil(x, y, z0, 0.1, h, M['madeira_esc'], pai, verts=8)
    esf(x, y, z0 + h + 0.1, 0.17, 0.17, 0.17, M['ouro'], pai, seg=8, anel=6)
    bandeira(x + 0.08, y, z0 + h - 0.1, L, H, m_pano, pai, forma)


def pano(x, y, z_topo, L, H, pai=None, emblema=True):
    """Estandarte pendurado de frente, na cor do jogador, com barra e emblema dourado (sem texto)."""
    caixa(x, y, z_topo - 0.12, L + 0.5, 0.14, 0.14, M['madeira_esc'], pai, bisel=0.02)
    extrudar('pano', [(-L / 2, 0), (L / 2, 0), (L / 2, -H), (0, -H * 0.82), (-L / 2, -H)], 0.08, M['jog'], 'xz', (x, y, z_topo - 0.14), pai)
    caixa(x, y - 0.03, z_topo - 0.5, L, 0.1, 0.12, M['ouro'], pai, bisel=0.02)
    if emblema:
        cil(x, y - 0.05, z_topo - H * 0.45, L * 0.2, 0.08, M['ouro'], pai, rot=(math.pi / 2, 0, 0), verts=14, centro=True)
        cil(x, y - 0.1, z_topo - H * 0.45, L * 0.1, 0.08, M['jog_esc'], pai, rot=(math.pi / 2, 0, 0), verts=14, centro=True)


def barril(x, y, z0=0, pai=None, r=0.5, h=0.95):
    cil(x, y, z0, r, h, M['madeira_lisa'], pai, verts=14, liso=True)
    for zz in (0.18, h - 0.28):
        cil(x, y, z0 + zz, r * 1.04, 0.1, M['ferro'], pai, verts=14)


def caixote(x, y, z0=0, pai=None, s=0.9, rot=None):
    caixa(x, y, z0, s, s, s, M['madeira_lisa'], pai, rot=rot, bisel=0.05)
    caixa(x, y, z0 + s - 0.05, s + 0.04, s * 0.18, 0.1, M['tabua2'], pai, rot=rot, bisel=0.02)


def plataforma(x, y, sx, sy, h, pai=None, z0=0.0):
    caixa(x, y, z0, sx, sy, h, M['pedra'], pai, bisel=0.08)
    caixa(x, y, z0 + h - 0.02, sx - 0.1, sy - 0.1, 0.06, M['laje'], pai, bisel=0.02)


def fumaca(x, y, z, pai=None, n=3, r=0.6):
    for i in range(n):
        esf(x + 0.3 * i, y, z + 1.0 * i, r * (1 + 0.35 * i), r * (1 + 0.35 * i), r * (0.9 + 0.3 * i), M['fumaca'], pai, seg=10, anel=7)


def cerca(x0, y0, x1, y1, pai=None, h=1.1, passo=1.6, m=None):
    m = m or M['madeira_lisa']
    comp = math.hypot(x1 - x0, y1 - y0)
    n = max(1, int(comp / passo))
    ang = math.atan2(y1 - y0, x1 - x0)
    for i in range(n + 1):
        t = i / n
        caixa(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, 0, 0.22, 0.22, h, m, pai, bisel=0.03)
    for zz in (h * 0.4, h * 0.78):
        caixa((x0 + x1) / 2, (y0 + y1) / 2, zz, comp, 0.11, 0.14, M['tabua1'], pai, rot=(0, 0, ang), bisel=0.02)


# ------------------------------------------------------------------ cena, câmera e render
def iniciar(teste=False):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    cy = sc.cycles
    cy.device = 'CPU'
    cy.samples = 8 if teste else 28
    cy.use_denoising = True
    try:
        cy.denoiser = 'OPENIMAGEDENOISE'
    except Exception:
        pass
    cy.max_bounces = 4
    cy.diffuse_bounces = 2
    cy.glossy_bounces = 2
    cy.transmission_bounces = 0
    cy.sample_clamp_indirect = 4.0
    sc.render.film_transparent = True
    sc.render.filter_size = 1.0
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.resolution_percentage = 100
    sc.render.threads = 3
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    w = bpy.data.worlds.new('mundo'); sc.world = w
    w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.62, 0.74, 0.95, 1)
    w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.95
    bpy.ops.object.camera_add()
    cam = bpy.context.active_object; cam.name = 'CAM'
    cam.data.type = 'ORTHO'; cam.data.clip_end = 400
    e = math.radians(ELEV)
    cam.rotation_euler = (math.pi / 2 - e, 0, 0)
    sc.camera = cam
    bpy.ops.object.light_add(type='SUN')
    sol = bpy.context.active_object; sol.name = 'SOL'
    sol.data.energy = 4.2
    sol.data.color = (1.0, 0.88, 0.70)
    sol.data.angle = math.radians(3.5)
    sol.rotation_euler = LUZ.to_track_quat('-Z', 'Y').to_euler()
    bpy.ops.object.light_add(type='SUN')
    fill = bpy.context.active_object; fill.name = 'SOL2'
    fill.data.energy = 0.9
    fill.data.color = (0.75, 0.85, 1.0)
    fill.data.angle = math.radians(40)
    fill.rotation_euler = Vector((-0.4, 0.8, -0.45)).to_track_quat('-Z', 'Y').to_euler()
    bpy.ops.mesh.primitive_plane_add(size=300, location=(0, 0, -0.01))
    ch = bpy.context.active_object; ch.name = 'CHAO'
    ch.is_shadow_catcher = True
    ch.data.materials.append(mat('chao', (200, 200, 200), 1.0))
    mats()
    return sc


def limpar_peca():
    for o in list(bpy.data.objects):
        if o.name in ('CAM', 'SOL', 'SOL2', 'CHAO'):
            continue
        bpy.data.objects.remove(o, do_unlink=True)
    for me in list(bpy.data.meshes):
        if me.users == 0:
            bpy.data.meshes.remove(me)


def _caixa_mundo():
    bpy.context.view_layer.update()
    pts = []
    for o in bpy.data.objects:
        if o.type != 'MESH' or o.name == 'CHAO':
            continue
        mw = o.matrix_world
        for c in o.bound_box:
            pts.append(mw @ Vector(c))
    return pts


def renderizar_peca(sc, nome, px_m, saida_tmp, margem=0.8):
    """Enquadra a peça (corpo + sombra), renderiza em SS× e devolve a âncora em pixels (antes do corte)."""
    cam = bpy.data.objects['CAM']
    e = math.radians(ELEV)
    se, ce = math.sin(e), math.cos(e)
    sx_, sy_ = [], []
    for p in _caixa_mundo():
        sx_.append(p.x); sy_.append(p.y * se + p.z * ce)
        if p.z > 0:
            t = p.z / -LUZ.z
            g = p + LUZ * t
            sx_.append(g.x); sy_.append(g.y * se)
    xmin, xmax = min(sx_) - margem, max(sx_) + margem
    ymin, ymax = min(sy_) - margem, max(sy_) + margem
    k = px_m * SS
    rx, ry = int(math.ceil((xmax - xmin) * k)), int(math.ceil((ymax - ymin) * k))
    sc.render.resolution_x, sc.render.resolution_y = rx, ry
    cam.data.ortho_scale = max(rx, ry) / k
    cx, cy = (xmin + xmax) / 2, (ymin + ymax) / 2
    # recalcula o centro com a resolução arredondada
    up = Vector((0, se, ce)); look = Vector((0, ce, -se))
    cam.location = Vector((cx, 0, 0)) + up * cy - look * 80
    sc.render.filepath = saida_tmp
    bpy.ops.render.render(write_still=True)
    return {'w': rx, 'h': ry, 'ancora': [rx / 2 + (0 - cx) * k, ry / 2 + cy * k]}
