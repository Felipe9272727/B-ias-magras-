"""Macaco do BOMBANANA! das IAs, versão 2 (modelagem de verdade): a pele é UMA malha contínua (formas fundidas por
voxel remesh, alisadas e reduzidas), pintada por região (pelo marrom, cara clara em coração, barriga, dentro da
orelha, luvas brancas). Tem esqueleto (coluna, cabeça, braços, mãos e dedos) com pesos automáticos, para o three.js
animar sem quebrar a malha. Olhos, boca e acessórios do papel ficam presos ao osso da cabeça.
Uso: blender -b -P bombanana/blender/macaco2.py -- <cego|surdo|mudo> [--render]
Saída: public/bb/3d/macaco_<papel>.glb (+ macaco_<papel>_{frente,34,lado}.png com --render)
"""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Matrix

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
PAPEL = (ARGS[0] if ARGS else 'cego').lower()
RENDER = '--render' in ARGS
AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.normpath(os.path.join(AQUI, '..', '..', 'video', 'remotion', 'public', 'bb', '3d'))
os.makedirs(SAIDA, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(nome, cor, rough=0.6, emit=0.0, coat=0.0):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*[c ** 2.2 for c in cor], 1)
    b.inputs['Roughness'].default_value = rough
    if coat:
        b.inputs['Coat Weight'].default_value = coat
    if emit:
        b.inputs['Emission Color'].default_value = (*[c ** 2.2 for c in cor], 1)
        b.inputs['Emission Strength'].default_value = emit
    return m


PELO = mat('pelo', (0.47, 0.27, 0.13), 0.8)
PELE = mat('pele', (0.96, 0.8, 0.62), 0.65)
LUVA = mat('luva', (0.98, 0.98, 0.98), 0.45)
OLHO = mat('olho', (0.04, 0.04, 0.05), 0.08, coat=1.0)
BRILHO = mat('brilho', (1, 1, 1), 0.1, emit=2.0)
BOCA = mat('boca', (0.28, 0.06, 0.08), 0.6)
LINGUA = mat('lingua', (0.85, 0.35, 0.38), 0.5)
NARIZ = mat('nariz', (0.3, 0.16, 0.08), 0.4)
SOBRANCELHA = mat('sobrancelha', (0.3, 0.17, 0.08), 0.7)
GOLA = mat('gola', (0.85, 0.47, 0.34), 0.6)
VENDA = mat('venda', (0.72, 0.06, 0.06), 0.75)
VENDA_ESC = mat('venda_esc', (0.5, 0.04, 0.04), 0.75)


def esfera(loc, esc, rot=(0, 0, 0), seg=48):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, location=loc, rotation=rot)
    o = bpy.context.active_object; o.scale = esc
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    return o


def tubo(a, b, r1, r2=None):
    """tubo afinando de a até b com pontas redondas (braço, dedo, perna)"""
    a, b = Vector(a), Vector(b); r2 = r1 if r2 is None else r2
    d = b - a
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=r1, radius2=r2, depth=d.length, location=(a + b) / 2)
    o = bpy.context.active_object
    o.rotation_mode = 'QUATERNION'; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    bpy.ops.object.transform_apply(rotation=True)
    partes = [o, esfera(tuple(a), (r1, r1, r1), seg=24), esfera(tuple(b), (r2, r2, r2), seg=24)]
    return partes


def juntar(objs, nome):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    o = bpy.context.active_object; o.name = nome
    return o


# ---------------------------------------------------------------- forma (Z para cima, frente = -Y), ~1,2 m
CAB = Vector((0, 0, 0.86))
formas = []
formas.append(esfera(CAB, (0.37, 0.34, 0.33)))                                  # cabeça grande, um pouco larga
formas.append(esfera((0, -0.06, 0.98), (0.3, 0.27, 0.2)))                         # testa
for x in (-1, 1):
    formas.append(esfera((0.125 * x, -0.25, 0.9), (0.16, 0.1, 0.15)))             # bochechas de cima do coração (olhos)
formas.append(esfera((0, -0.27, 0.74), (0.22, 0.14, 0.13)))                       # focinho (ponta do coração)
for x in (-1, 1):
    formas.append(esfera((0.4 * x, 0.02, 0.86), (0.035, 0.13, 0.13), rot=(0, 0, math.radians(-25 * x))))  # orelhas
    formas.append(esfera((0.37 * x, 0.0, 0.86), (0.07, 0.08, 0.09)))             # base da orelha
formas.append(esfera((0, 0, 0.42), (0.27, 0.23, 0.3)))                            # tronco (pera)
formas.append(esfera((0, 0.0, 0.25), (0.3, 0.26, 0.2)))                           # quadril
formas.append(esfera((0, 0.0, 0.58), (0.17, 0.15, 0.12)))                         # pescoço
# pernas curtas e pés
for x in (-1, 1):
    formas += tubo((0.13 * x, -0.02, 0.18), (0.16 * x, -0.12, 0.05), 0.085, 0.07)
    formas.append(esfera((0.17 * x, -0.17, 0.035), (0.09, 0.13, 0.05)))
# braços caídos do lado (posição de descanso), luvas com 4 dedos de desenho
SHOULDER = {}
LUVAS = []
for x, lado in ((-1, 'L'), (1, 'R')):
    om, co, pu = Vector((0.24 * x, 0.0, 0.53)), Vector((0.31 * x, -0.03, 0.36)), Vector((0.33 * x, -0.07, 0.2))
    SHOULDER[lado] = (om, co, pu)
    formas += tubo(om, co, 0.07, 0.06)
    formas += tubo(co, pu, 0.06, 0.055)
    g = [esfera(pu + Vector((0, -0.01, -0.01)), (0.08, 0.072, 0.06)), esfera(pu + Vector((0, -0.025, -0.075)), (0.075, 0.06, 0.07))]  # punho e palma
    for k in range(4):
        dx = (k - 1.5) * 0.034 * x
        g += tubo(pu + Vector((dx, -0.03, -0.12)), pu + Vector((dx * 1.15, -0.045, -0.19)), 0.022, 0.02)
    g += tubo(pu + Vector((-0.06 * x, -0.06, -0.06)), pu + Vector((-0.085 * x, -0.09, -0.11)), 0.024, 0.021)  # polegar
    LUVAS.append(g)
pele = juntar(formas, 'pele')
md = pele.modifiers.new('remesh', 'REMESH'); md.mode = 'VOXEL'; md.voxel_size = 0.009
bpy.ops.object.modifier_apply(modifier='remesh')
md = pele.modifiers.new('suave', 'SMOOTH'); md.factor = 0.8; md.iterations = 6
bpy.ops.object.modifier_apply(modifier='suave')
md = pele.modifiers.new('reduz', 'DECIMATE'); md.ratio = 0.18
bpy.ops.object.modifier_apply(modifier='reduz')
for p in pele.data.polygons:
    p.use_smooth = True


# ---------------------------------------------------------------- pintura por região
def dentro(c, centro, raios):
    v = Vector(((c.x - centro[0]) / raios[0], (c.y - centro[1]) / raios[1], (c.z - centro[2]) / raios[2]))
    return v.length <= 1


def suave(d):  # 1 dentro, 0 fora, transição curta na borda (d = distância normalizada ao centro)
    return max(0.0, min(1.0, (1.08 - d) / 0.16))


def dist(c, centro, raios):
    return Vector(((c.x - centro[0]) / raios[0], (c.y - centro[1]) / raios[1], (c.z - centro[2]) / raios[2])).length


cor_pelo, cor_pele = Vector((0.47, 0.27, 0.13)), Vector((0.96, 0.8, 0.62))
ca = pele.data.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
for v in pele.data.vertices:
    c = v.co
    w = 0.0
    if c.y < -0.12:
        w = max(w, suave(dist(c, (-0.125, -0.25, 0.9), (0.15, 0.2, 0.15))), suave(dist(c, (0.125, -0.25, 0.9), (0.15, 0.2, 0.15))), suave(dist(c, (0, -0.27, 0.75), (0.23, 0.2, 0.15))))
    if c.y < -0.05:
        w = max(w, suave(dist(c, (0, -0.2, 0.36), (0.19, 0.2, 0.22))))
    if abs(c.x) > 0.36 and c.y < 0.01:
        w = max(w, suave(dist(c, (math.copysign(0.4, c.x), -0.03, 0.86), (0.07, 0.1, 0.1))))
    if c.z < 0.09 and c.y < -0.08:
        w = max(w, 1.0)
    col = cor_pelo.lerp(cor_pele, w)
    ca.data[v.index].color = (*[k ** 2.2 for k in col], 1)
PINTADA = bpy.data.materials.new('pele_pintada'); PINTADA.use_nodes = True
nt = PINTADA.node_tree; bsdf = nt.nodes['Principled BSDF']; bsdf.inputs['Roughness'].default_value = 0.75
attr = nt.nodes.new('ShaderNodeVertexColor'); attr.layer_name = 'Col'
nt.links.new(attr.outputs['Color'], bsdf.inputs['Base Color'])
pele.data.materials.clear(); pele.data.materials.append(PINTADA)

# luvas: peça lisa à parte (uma por mão), branca
luvas = []
for lado, g in zip(('L', 'R'), LUVAS):
    o = juntar(g, f'luva.{lado}')
    md = o.modifiers.new('remesh', 'REMESH'); md.mode = 'VOXEL'; md.voxel_size = 0.005
    bpy.ops.object.modifier_apply(modifier='remesh')
    md = o.modifiers.new('suave', 'SMOOTH'); md.factor = 0.7; md.iterations = 4
    bpy.ops.object.modifier_apply(modifier='suave')
    md = o.modifiers.new('reduz', 'DECIMATE'); md.ratio = 0.25
    bpy.ops.object.modifier_apply(modifier='reduz')
    o.data.materials.append(LUVA)
    for p in o.data.polygons:
        p.use_smooth = True
    luvas.append(o)

# ---------------------------------------------------------------- olhos, sobrancelhas, nariz, boca
extras = []
olhos = []
for x in (-1, 1):
    o = esfera((0.115 * x, -0.335, 0.9), (0.075, 0.035, 0.095)); o.name = f'olho_{"LR"[x > 0]}'
    o.data.materials.append(OLHO); olhos.append(o)
    b = esfera((0.115 * x + 0.025, -0.365, 0.94), (0.022, 0.01, 0.026)); b.name = f'brilho_{"LR"[x > 0]}'
    b.data.materials.append(BRILHO); olhos.append(b)
    s = esfera((0.12 * x, -0.31, 1.035), (0.075, 0.02, 0.018), rot=(0, math.radians(12 * x), 0)); s.name = f'sobrancelha_{"LR"[x > 0]}'
    s.data.materials.append(SOBRANCELHA); extras.append(s)
for x in (-1, 1):
    n = esfera((0.03 * x, -0.405, 0.79), (0.018, 0.01, 0.012)); n.name = f'narina_{"LR"[x > 0]}'; n.data.materials.append(NARIZ); extras.append(n)
# boca: um sorriso largo escuro (a abertura é escalada pelo three.js quando fala) com língua
boca = esfera((0, -0.39, 0.7), (0.11, 0.02, 0.032)); boca.name = 'boca'; boca.data.materials.append(BOCA)
for v in boca.data.vertices:  # sorriso: as pontas sobem
    v.co.z += 0.04 * ((v.co.x / 0.11) ** 2)
    v.co.y += 0.012 * ((v.co.x / 0.11) ** 2)
lingua = esfera((0, -0.392, 0.69), (0.05, 0.012, 0.015)); lingua.name = 'lingua'; lingua.data.materials.append(LINGUA); lingua.parent = boca
extras.append(boca)
for o in olhos + extras:
    for p in o.data.polygons:
        p.use_smooth = True
# gola (cor da IA) em volta do pescoço
bpy.ops.mesh.primitive_torus_add(major_radius=0.165, minor_radius=0.055, location=(0, -0.01, 0.575))
gola = bpy.context.active_object; gola.name = 'gola'; gola.scale = (1.1, 1.0, 0.55); bpy.ops.object.transform_apply(scale=True)
gola.data.materials.append(GOLA)
for p in gola.data.polygons:
    p.use_smooth = True

# ---------------------------------------------------------------- acessório do papel
acessorios = []
if PAPEL == 'cego':
    # venda: faixa larga em volta da cabeça, na altura dos olhos, com nó e duas pontas atrás
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=1, depth=0.13, location=(0, 0, 0), end_fill_type='NOTHING')
    v = bpy.context.active_object; v.name = 'venda'
    # encaixa a faixa na cabeça: raio que acompanha a forma (mais larga na frente por causa da cara)
    for vert in v.data.vertices:
        ang = math.atan2(vert.co.y, vert.co.x)
        frente = max(0.0, -math.sin(ang))
        r = 0.375 + 0.035 * frente
        vert.co.x, vert.co.y = math.cos(ang) * r * 1.02, math.sin(ang) * r * 0.95 - 0.015 * frente
        vert.co.z = vert.co.z * (1 + 0.25 * frente) + 0.9
    md = v.modifiers.new('cola', 'SHRINKWRAP'); md.target = pele; md.wrap_method = 'NEAREST_SURFACEPOINT'; md.offset = 0.012
    bpy.ops.object.modifier_apply(modifier='cola')
    md = v.modifiers.new('sol', 'SOLIDIFY'); md.thickness = 0.02; md.offset = 1; bpy.ops.object.modifier_apply(modifier='sol')
    md = v.modifiers.new('sub', 'SUBSURF'); md.levels = 1; bpy.ops.object.modifier_apply(modifier='sub')
    v.data.materials.append(VENDA)
    no = esfera((0, 0.355, 0.9), (0.06, 0.04, 0.05)); no.name = 'venda_no'; no.data.materials.append(VENDA_ESC)
    acessorios += [v, no]
    for i, (dx, dz) in enumerate(((0.07, -0.12), (-0.06, -0.15))):
        bpy.ops.curve.primitive_bezier_curve_add(location=(0, 0, 0))
        cv = bpy.context.active_object
        pts = cv.data.splines[0].bezier_points
        pts[0].co = (0, 0.37, 0.9); pts[0].handle_left = (0, 0.35, 0.92); pts[0].handle_right = (dx * 0.5, 0.42, 0.88)
        pts[1].co = (dx * 1.6, 0.43, 0.9 + dz); pts[1].handle_left = (dx * 1.2, 0.45, 0.9 + dz * 0.4); pts[1].handle_right = (dx * 2, 0.42, 0.9 + dz * 1.3)
        cv.data.bevel_depth = 0.03; cv.data.bevel_resolution = 3
        cv.data.dimensions = '3D'
        sp = cv.data.splines[0]
        for pt in sp.bezier_points:
            pt.radius = 1.0
        cv.scale = (1, 1, 1)
        bpy.ops.object.convert(target='MESH')
        fita = bpy.context.active_object; fita.name = f'venda_ponta{i}'
        fita.scale = (1, 0.35, 1); bpy.ops.object.transform_apply(scale=True)  # fita achatada
        fita.data.materials.append(VENDA); acessorios.append(fita)
    for o in acessorios:
        for p in o.data.polygons:
            p.use_smooth = True
    for o in olhos:  # o Cego não mostra os olhos (estão embaixo da venda)
        bpy.data.objects.remove(o)
    olhos = []
    # sobrancelhas aparecem por cima da venda, preocupadas
    for s in [o for o in extras if o.name.startswith('sobrancelha')]:
        s.location.z += 0.03
if PAPEL == 'surdo':
    # fone grande: arco de orelha a orelha por cima da cabeça (acompanha a cabeça) e duas conchas com luz vermelha
    FONE = mat('fone', (0.1, 0.1, 0.11), 0.35, coat=0.6)
    ALMOFADA = mat('almofada', (0.2, 0.2, 0.22), 0.8)
    LUZF = mat('fone_luz', (1.0, 0.15, 0.12), 0.3, emit=3.0)
    bpy.ops.curve.primitive_bezier_circle_add(radius=1, location=(0, 0, 0))
    cv = bpy.context.active_object
    pts = cv.data.splines[0].bezier_points
    # meio arco: só os pontos de cima (de orelha a orelha), no plano X-Z
    cv.data.splines.remove(cv.data.splines[0])
    sp = cv.data.splines.new('BEZIER'); sp.bezier_points.add(2)
    for k, (x, z) in enumerate(((-0.43, 0.9), (0, 1.25), (0.43, 0.9))):
        b = sp.bezier_points[k]; b.co = (x, 0.01, z)
        b.handle_left_type = b.handle_right_type = 'AUTO'
    cv.data.dimensions = '3D'; cv.data.bevel_depth = 0.035; cv.data.bevel_resolution = 4
    cv.data.resolution_u = 24
    bpy.ops.object.convert(target='MESH')
    arco = bpy.context.active_object; arco.name = 'fone_arco'
    arco.scale = (1, 0.6, 1); bpy.ops.object.transform_apply(scale=True)  # arco achatado, como faixa
    arco.data.materials.append(FONE); acessorios.append(arco)
    for x in (-1, 1):
        bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.12, depth=0.1, location=(0.42 * x, 0.01, 0.86), rotation=(0, math.pi / 2, 0))
        c = bpy.context.active_object; c.name = f'fone_concha_{"LR"[x > 0]}'
        md = c.modifiers.new('bisel', 'BEVEL'); md.width = 0.035; md.segments = 5; bpy.ops.object.modifier_apply(modifier='bisel')
        c.data.materials.append(FONE); acessorios.append(c)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.1, minor_radius=0.03, location=(0.37 * x, 0.01, 0.86), rotation=(0, math.pi / 2, 0))
        a = bpy.context.active_object; a.name = f'fone_almofada_{"LR"[x > 0]}'; a.data.materials.append(ALMOFADA); acessorios.append(a)
        l = esfera((0.475 * x, 0.01, 0.86), (0.008, 0.045, 0.045)); l.name = f'fone_luz_{"LR"[x > 0]}'; l.data.materials.append(LUZF); acessorios.append(l)
    for o in acessorios:
        for p in o.data.polygons:
            p.use_smooth = True
# rabinho enrolado (todos)
bpy.ops.curve.primitive_bezier_curve_add(location=(0, 0, 0))
cv = bpy.context.active_object
sp = cv.data.splines[0]; sp.bezier_points.add(2)
for k, co in enumerate(((0, 0.22, 0.2), (0.05, 0.42, 0.28), (0.18, 0.4, 0.45), (0.12, 0.3, 0.52))):
    b = sp.bezier_points[k]; b.co = co; b.handle_left_type = b.handle_right_type = 'AUTO'
cv.data.dimensions = '3D'; cv.data.bevel_depth = 0.032; cv.data.bevel_resolution = 4
for k, b in enumerate(sp.bezier_points):
    b.radius = 1 - 0.45 * k / 3
bpy.ops.object.convert(target='MESH')
rabo = bpy.context.active_object; rabo.name = 'rabo'; rabo.data.materials.append(PELO)
for p in rabo.data.polygons:
    p.use_smooth = True

# ---------------------------------------------------------------- esqueleto
bpy.ops.object.armature_add(location=(0, 0, 0))
arm = bpy.context.active_object; arm.name = 'esqueleto'
bpy.ops.object.mode_set(mode='EDIT')
eb = arm.data.edit_bones
eb.remove(eb[0])


def osso(nome, a, b, pai=None):
    o = eb.new(nome); o.head = Vector(a); o.tail = Vector(b)
    if pai:
        o.parent = eb[pai]; o.use_connect = False
    return o


osso('quadril', (0, 0, 0.12), (0, 0, 0.3))
osso('coluna', (0, 0, 0.3), (0, 0, 0.56), 'quadril')
osso('cabeca', (0, 0, 0.58), (0, 0, 1.15), 'coluna')
for lado, x in (('L', -1), ('R', 1)):
    om, co, pu = SHOULDER[lado]
    osso(f'ombro.{lado}', (0.1 * x, 0, 0.53), tuple(om), 'coluna')
    osso(f'braco.{lado}', tuple(om), tuple(co), f'ombro.{lado}')
    osso(f'antebraco.{lado}', tuple(co), tuple(pu), f'braco.{lado}')
    osso(f'mao.{lado}', tuple(pu), tuple(pu + Vector((0, -0.03, -0.1))), f'antebraco.{lado}')
    for k in range(4):
        dx = (k - 1.5) * 0.034 * x
        osso(f'dedo{k + 1}.{lado}', tuple(pu + Vector((dx, -0.03, -0.11))), tuple(pu + Vector((dx * 1.15, -0.045, -0.2))), f'mao.{lado}')
    osso(f'polegar.{lado}', tuple(pu + Vector((-0.055 * x, -0.055, -0.05))), tuple(pu + Vector((-0.09 * x, -0.095, -0.115))), f'mao.{lado}')
    osso(f'perna.{lado}', (0.13 * x, -0.02, 0.18), (0.17 * x, -0.17, 0.035), 'quadril')
bpy.ops.object.mode_set(mode='OBJECT')
# pesos automáticos na pele
bpy.ops.object.select_all(action='DESELECT')
pele.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
for o in luvas:
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')
# olhos, boca, acessórios: presos ao osso da cabeça (sem deformar)


def prender(o, nome_osso):
    mw = o.matrix_world.copy()
    o.parent = arm; o.parent_type = 'BONE'; o.parent_bone = nome_osso
    o.matrix_world = mw


for o in olhos + extras + acessorios:
    if o.parent is None:
        prender(o, 'cabeca')
prender(gola, 'coluna')
prender(rabo, 'quadril')

raiz = bpy.data.objects.new('macaco', None); bpy.context.collection.objects.link(raiz)
arm.parent = raiz

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=os.path.join(SAIDA, f'macaco_{PAPEL}.glb'), export_format='GLB', export_apply=False, export_skins=True, export_lights=False, export_cameras=False)
print('ok', f'macaco_{PAPEL}.glb', len(pele.data.polygons), 'faces')

if RENDER:
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 32; sc.cycles.use_denoising = True
    sc.view_settings.view_transform = 'Standard'  # cores como pintadas (o AgX padrão desbota o vermelho)
    sc.render.resolution_x, sc.render.resolution_y = 720, 720
    sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True
    sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.16, 0.26, 0.55, 1)
    sc.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6
    for nome, loc, en in (('chave', (1.5, -2.5, 2.5), 380), ('recorte', (-2, 1.5, 2), 220), ('preenche', (-1.5, -2.5, 0.8), 110)):
        l = bpy.data.objects.new(nome, bpy.data.lights.new(nome, 'AREA')); bpy.context.collection.objects.link(l)
        l.data.energy = en; l.data.size = 2; l.location = loc
        l.rotation_euler = (Vector((0, 0, 0.6)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); bpy.context.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = 60
    for nome, ang in (('frente', 0), ('34', 35), ('lado', 90)):
        a = math.radians(ang)
        cam.location = (math.sin(a) * 3.2, -math.cos(a) * 3.2, 0.75)
        cam.rotation_euler = (Vector((0, 0, 0.6)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(SAIDA, f'macaco_{PAPEL}_{nome}.png')
        bpy.ops.render.render(write_still=True)
    print('render ok')
