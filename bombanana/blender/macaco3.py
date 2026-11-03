"""Macaco do BOMBANANA! das IAs, versão 3 (estilo bonequinho de vinil do jogo): sem pernas, sentado num copinho azul
com aro amarelo; cabeça larga com topete em espiral de sorvete, orelhas grandes redondas de frente, costeletas,
máscara bege com borda ondulada (duas bossas sobre os olhos e bico no meio), olhos ovais pretos foscos, nariz
coral com narinas, sorriso fino; barriga oval em relevo; braços curtos com luvas de mitene. Tudo fosco.
Pele = uma malha (voxel remesh) pintada por vértice; esqueleto com pesos automáticos para o three.js.
Uso: blender -b -P bombanana/blender/macaco3.py -- <cego|surdo|mudo> [--render]
"""
import bpy, math, os, sys
from mathutils import Vector

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
PAPEL = (ARGS[0] if ARGS else 'cego').lower()
RENDER = '--render' in ARGS
AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.normpath(os.path.join(AQUI, '..', '..', 'video', 'remotion', 'public', 'bb', '3d'))
os.makedirs(SAIDA, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
srgb = lambda c: tuple(k ** 2.2 for k in c)


def mat(nome, cor, rough=0.7):
    m = bpy.data.materials.new(nome); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*srgb(cor), 1); b.inputs['Roughness'].default_value = rough
    return m


MARROM = (0.6, 0.27, 0.1)
MARROM_ESC = (0.5, 0.22, 0.08)
BEGE = (0.9, 0.6, 0.4)
PELO = mat('pelo', MARROM)
TOPETE = mat('topete', MARROM_ESC)
PELE = mat('pele', BEGE)
LUVA = mat('luva', (0.96, 0.95, 0.94), 0.6)
OLHO = mat('olho', (0.05, 0.05, 0.06), 0.45)
NARIZ = mat('nariz', (0.86, 0.3, 0.22), 0.55)
LINHA = mat('linha', (0.32, 0.13, 0.05), 0.7)
COPO = mat('copo', (0.43, 0.6, 0.82), 0.6)
ARO = mat('aro', (0.88, 0.6, 0.12), 0.55)
GOLA = mat('gola', {'cego': (0.95, 0.55, 0.1), 'surdo': (0.15, 0.7, 0.45), 'mudo': (0.25, 0.5, 0.95)}.get(PAPEL, (0.9, 0.9, 0.9)), 0.6)  # cor da IA (o three.js troca por fase)
VERMELHO = mat('vermelho', (0.88, 0.2, 0.15), 0.75)


def esfera(loc, esc, rot=(0, 0, 0), seg=48):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, location=loc, rotation=rot)
    o = bpy.context.active_object; o.scale = esc
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    return o


def tubo(a, b, r1, r2=None):
    a, b = Vector(a), Vector(b); r2 = r1 if r2 is None else r2
    d = b - a
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=r1, radius2=r2, depth=d.length, location=(a + b) / 2)
    o = bpy.context.active_object
    o.rotation_mode = 'QUATERNION'; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    bpy.ops.object.transform_apply(rotation=True)
    return [o, esfera(tuple(a), (r1, r1, r1), seg=24), esfera(tuple(b), (r2, r2, r2), seg=24)]


def juntar(objs, nome):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    o = bpy.context.active_object; o.name = nome
    return o


def fundir(objs, nome, voxel, reduz):
    o = juntar(objs, nome)
    for tipo, cfg in (('REMESH', dict(mode='VOXEL', voxel_size=voxel)), ('SMOOTH', dict(factor=0.8, iterations=5)), ('DECIMATE', dict(ratio=reduz))):
        md = o.modifiers.new(tipo.lower(), tipo)
        for k, v in cfg.items():
            setattr(md, k, v)
        bpy.ops.object.modifier_apply(modifier=md.name)
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def curva(pontos, raio, nome, raios=None, res=24):
    bpy.ops.curve.primitive_bezier_curve_add(location=(0, 0, 0))
    cv = bpy.context.active_object
    sp = cv.data.splines[0]; sp.bezier_points.add(len(pontos) - 2)
    for k, co in enumerate(pontos):
        b = sp.bezier_points[k]; b.co = co; b.handle_left_type = b.handle_right_type = 'AUTO'
        b.radius = raios[k] if raios else 1
    cv.data.dimensions = '3D'; cv.data.bevel_depth = raio; cv.data.bevel_resolution = 4; cv.data.resolution_u = res
    bpy.ops.object.convert(target='MESH')
    o = bpy.context.active_object; o.name = nome
    for p in o.data.polygons:
        p.use_smooth = True
    return o


# ---------------------------------------------------------------- pele (Z para cima, frente = -Y), ~1 m com o copo
CAB = Vector((0, 0, 0.8))
f = []
f.append(esfera(CAB, (0.3, 0.255, 0.245)))                        # cabeça larga
f.append(esfera((0, -0.05, 0.86), (0.27, 0.2, 0.17)))               # testa
f.append(esfera((0, -0.14, 0.7), (0.23, 0.14, 0.12)))               # focinho/queixo (parte de baixo da cara)
for x in (-1, 1):
    for k, (dz, r) in enumerate(((0.71, 0.04), (0.675, 0.032))):   # costeletas em tufinhos
        f.append(esfera((0.255 * x, -0.04, dz), (r * 1.1, r, r)))
    f.append(esfera((0.32 * x, 0.0, 0.8), (0.035, 0.07, 0.07)))     # base da orelha
f.append(esfera((0, 0, 0.36), (0.25, 0.21, 0.21)))                  # tronco (pera)
f.append(esfera((0, 0, 0.27), (0.26, 0.22, 0.12)))                  # base do tronco, mais larga
f.append(esfera((0, 0, 0.53), (0.2, 0.17, 0.12)))                   # ombros/pescoço
OMBRO = {}
for x, lado in ((-1, 'L'), (1, 'R')):
    om, pu = Vector((0.19 * x, 0.0, 0.51)), Vector((0.29 * x, -0.045, 0.37))
    OMBRO[lado] = (om, pu)
    f += tubo(om, pu, 0.068, 0.06)
pele = fundir(f, 'pele', 0.0055, 0.4)

# pintura: máscara bege (borda de cima ondulada: bossas sobre os olhos, bico no meio), base do copo nada
ca = pele.data.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')


def borda_mascara(x):
    ax = abs(x)
    return 0.815 + 0.06 * math.exp(-((ax - 0.105) / 0.075) ** 2) - 0.015 * math.exp(-(ax / 0.03) ** 2)


for v in pele.data.vertices:
    c = v.co
    w = 0.0
    if c.y < -0.06 and c.z > 0.58 and abs(c.x) < 0.25:
        dz = borda_mascara(c.x) - c.z
        lateral = 0.25 - abs(c.x)
        w = max(0.0, min(1.0, dz / 0.008 + 0.5)) * max(0.0, min(1.0, lateral / 0.015))
    col = Vector(MARROM).lerp(Vector(BEGE), w)
    ca.data[v.index].color = (*srgb(col), 1)
PINT = bpy.data.materials.new('pele_pintada'); PINT.use_nodes = True
nt = PINT.node_tree; bsdf = nt.nodes['Principled BSDF']; bsdf.inputs['Roughness'].default_value = 0.7
at = nt.nodes.new('ShaderNodeVertexColor'); at.layer_name = 'Col'; nt.links.new(at.outputs['Color'], bsdf.inputs['Base Color'])
pele.data.materials.append(PINT)

pecas = []  # presas na cabeça
corpo_pecas = []  # presas na coluna
# barriga oval em relevo
b = esfera((0, -0.175, 0.37), (0.155, 0.055, 0.165)); b.name = 'barriga'; b.data.materials.append(PELE); corpo_pecas.append(b)
# orelhas grandes, de frente, com miolo bege
for x in (-1, 1):
    o = esfera((0.34 * x, 0.0, 0.8), (0.15, 0.05, 0.15)); o.name = f'orelha_{"LR"[x > 0]}'; o.data.materials.append(PELO); pecas.append(o)
    i = esfera((0.345 * x, -0.035, 0.8), (0.1, 0.025, 0.1)); i.name = f'orelha_miolo_{"LR"[x > 0]}'; i.data.materials.append(PELE); pecas.append(i)
# topete em chama: nasce largo na testa, sobe e a ponta enrola para trás (como no boneco de referência)
pts = [(0, -0.17, 0.97), (0, -0.14, 1.06), (0, -0.07, 1.13), (0, 0.02, 1.15), (0, 0.07, 1.11), (0, 0.05, 1.07)]
rs = [1.0, 0.95, 0.8, 0.55, 0.32, 0.12]
top = curva(pts, 0.075, 'topete', rs, res=32)
top.scale = (1.45, 1, 1); bpy.ops.object.transform_apply(scale=True)
top.data.materials.append(TOPETE); pecas.append(top)
base_top = esfera((0, -0.08, 0.985), (0.16, 0.13, 0.05)); base_top.name = 'topete_base'; base_top.data.materials.append(TOPETE); pecas.append(base_top)
# olhos ovais pretos foscos
olhos = []
for x in (-1, 1):
    o = esfera((0.105 * x, -0.243, 0.8), (0.03, 0.012, 0.043)); o.name = f'olho_{"LR"[x > 0]}'; o.data.materials.append(OLHO); olhos.append(o)
# nariz coral com narinas
n = esfera((0, -0.285, 0.735), (0.04, 0.022, 0.026)); n.name = 'nariz'; n.data.materials.append(NARIZ); pecas.append(n)
for x in (-1, 1):
    na = esfera((0.014 * x, -0.302, 0.733), (0.007, 0.004, 0.006)); na.name = f'narina_{"LR"[x > 0]}'; na.data.materials.append(LINHA); pecas.append(na)
# sorriso fino (curva) colado na cara
boca = curva([(-0.09, -0.27, 0.69), (0, -0.29, 0.665), (0.09, -0.27, 0.69)], 0.006, 'boca')
md = boca.modifiers.new('cola', 'SHRINKWRAP'); md.target = pele; md.offset = 0.002; bpy.ops.object.modifier_apply(modifier='cola')
boca.data.materials.append(LINHA)
# gola (cor da IA): faixinha no pescoço
bpy.ops.mesh.primitive_torus_add(major_radius=0.185, minor_radius=0.035, location=(0, -0.015, 0.585))
gola = bpy.context.active_object; gola.name = 'gola'; gola.scale = (1.12, 1.0, 0.55); bpy.ops.object.transform_apply(scale=True)
gola.data.materials.append(GOLA)
bpy.data.objects.remove(gola)  # sem gola: o boneco de referência não tem; a IA é identificada pelo letreiro do vídeo
for p in []:
    p.use_smooth = True
# luvas de mitene (peça lisa à parte)
luvas = []
for lado in ('L', 'R'):
    om, pu = OMBRO[lado]; x = -1 if lado == 'L' else 1
    g = [esfera(pu + Vector((0, -0.01, -0.005)), (0.075, 0.07, 0.05)),          # punho
         esfera(pu + Vector((0.01 * x, -0.02, -0.07)), (0.085, 0.065, 0.085))]  # mitene
    for k in range(3):
        dx = (k - 1) * 0.035
        g.append(esfera(pu + Vector((0.015 * x + dx, -0.035, -0.14)), (0.03, 0.03, 0.035)))  # pontas dos dedos
    g += tubo(pu + Vector((-0.055 * x, -0.04, -0.05)), pu + Vector((-0.085 * x, -0.07, -0.09)), 0.028, 0.025)  # polegar
    o = fundir(g, f'luva.{lado}', 0.005, 0.3); o.data.materials.append(LUVA); luvas.append(o)
# copinho azul com aro amarelo (onde o macaco fica sentado)
bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=0.2, radius2=0.235, depth=0.2, location=(0, 0, 0.1))
copo = bpy.context.active_object; copo.name = 'copo'
md = copo.modifiers.new('bisel', 'BEVEL'); md.width = 0.02; md.segments = 4; bpy.ops.object.modifier_apply(modifier='bisel')
copo.data.materials.append(COPO)
bpy.ops.mesh.primitive_torus_add(major_radius=0.235, minor_radius=0.018, major_segments=64, location=(0, 0, 0.205))
aro = bpy.context.active_object; aro.name = 'aro'; aro.data.materials.append(ARO)
bpy.ops.mesh.primitive_torus_add(major_radius=0.25, minor_radius=0.025, major_segments=64, location=(0, 0, 0.17))
borda = bpy.context.active_object; borda.name = 'copo_borda'; borda.data.materials.append(COPO)
for o in (copo, aro, borda):
    for p in o.data.polygons:
        p.use_smooth = True

# ---------------------------------------------------------------- acessório do papel
acess = []
if PAPEL == 'cego':
    # venda de pano: faixa larga colada na cabeça, cobrindo os olhos, com dobras e nó atrás
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=0.33, depth=0.15, location=(0, 0, 0.83), end_fill_type='NOTHING')
    v = bpy.context.active_object; v.name = 'venda'
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.subdivide(number_cuts=6); bpy.ops.object.mode_set(mode='OBJECT')
    for vert in v.data.vertices:
        ang = math.atan2(vert.co.y, vert.co.x)
        vert.co.z += 0.008 * math.sin(ang * 9) + (0.01 if vert.co.y < 0 else 0)   # dobras do pano
    md = v.modifiers.new('cola', 'SHRINKWRAP'); md.target = pele; md.wrap_method = 'NEAREST_SURFACEPOINT'; md.offset = 0.014
    bpy.ops.object.modifier_apply(modifier='cola')
    md = v.modifiers.new('sol', 'SOLIDIFY'); md.thickness = 0.018; md.offset = 1; bpy.ops.object.modifier_apply(modifier='sol')
    md = v.modifiers.new('sub', 'SUBSURF'); md.levels = 1; bpy.ops.object.modifier_apply(modifier='sub')
    v.data.materials.append(VERMELHO); acess.append(v)
    no = esfera((0, 0.265, 0.84), (0.055, 0.035, 0.045)); no.name = 'venda_no'; no.data.materials.append(VERMELHO); acess.append(no)
    for i, dx in enumerate((0.05, -0.05)):
        p = curva([(0, 0.27, 0.84), (dx, 0.32, 0.78), (dx * 1.6, 0.31, 0.7)], 0.026, f'venda_ponta{i}', [1, 0.9, 0.7])
        p.scale = (1, 0.4, 1); bpy.ops.object.transform_apply(scale=True)
        p.data.materials.append(VERMELHO); acess.append(p)
    for o in olhos:
        bpy.data.objects.remove(o)
    olhos = []
elif PAPEL == 'surdo':
    # arco preto por cima e conchas vermelhas grossas cobrindo as orelhas
    PRETO = mat('arco', (0.13, 0.13, 0.14), 0.55)
    arco = curva([(-0.36, 0.0, 0.8), (0, 0.0, 1.12), (0.36, 0.0, 0.8)], 0.032, 'fone_arco')
    arco.scale = (1, 0.7, 1); bpy.ops.object.transform_apply(scale=True)
    arco.data.materials.append(PRETO); acess.append(arco)
    for x in (-1, 1):
        bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.13, depth=0.11, location=(0.35 * x, 0.0, 0.79), rotation=(0, math.pi / 2, 0))
        c = bpy.context.active_object; c.name = f'fone_concha_{"LR"[x > 0]}'
        md = c.modifiers.new('bisel', 'BEVEL'); md.width = 0.045; md.segments = 6; bpy.ops.object.modifier_apply(modifier='bisel')
        c.data.materials.append(VERMELHO); acess.append(c)
        for p in c.data.polygons:
            p.use_smooth = True
        e = esfera((0.31 * x, 0.0, 0.79), (0.02, 0.035, 0.05)); e.name = f'fone_haste_{"LR"[x > 0]}'; e.data.materials.append(PRETO); acess.append(e)
    for nome in ('orelha_L', 'orelha_R', 'orelha_miolo_L', 'orelha_miolo_R'):  # as orelhas ficam dentro das conchas
        o = bpy.data.objects[nome]; pecas.remove(o); bpy.data.objects.remove(o)
elif PAPEL == 'mudo':
    # fita vermelha em X na boca, colada no focinho
    for i, ang in enumerate((-18, 18)):
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -0.32, 0.69), rotation=(math.pi / 2, math.radians(ang), 0))
        t = bpy.context.active_object; t.name = f'fita{i}'; t.scale = (0.24, 0.05, 1); bpy.ops.object.transform_apply(scale=True, rotation=True)
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.subdivide(number_cuts=14); bpy.ops.object.mode_set(mode='OBJECT')
        md = t.modifiers.new('cola', 'SHRINKWRAP'); md.target = pele; md.wrap_method = 'PROJECT'; md.use_project_y = True
        md.use_negative_direction = True; md.use_positive_direction = True; md.offset = 0.004 + 0.005 * i
        bpy.ops.object.modifier_apply(modifier='cola')
        md = t.modifiers.new('sol', 'SOLIDIFY'); md.thickness = 0.008; bpy.ops.object.modifier_apply(modifier='sol')
        md = t.modifiers.new('bisel', 'BEVEL'); md.width = 0.003; bpy.ops.object.modifier_apply(modifier='bisel')
        t.data.materials.append(VERMELHO); acess.append(t)
    bpy.data.objects.remove(boca); boca = None

# ---------------------------------------------------------------- esqueleto
bpy.ops.object.armature_add(location=(0, 0, 0))
arm = bpy.context.active_object; arm.name = 'esqueleto'
bpy.ops.object.mode_set(mode='EDIT')
eb = arm.data.edit_bones; eb.remove(eb[0])


def osso(nome, a, b, pai=None):
    o = eb.new(nome); o.head = Vector(a); o.tail = Vector(b)
    if pai:
        o.parent = eb[pai]
    return o


osso('quadril', (0, 0, 0.2), (0, 0, 0.3))
osso('coluna', (0, 0, 0.3), (0, 0, 0.55), 'quadril')
osso('cabeca', (0, 0, 0.57), (0, 0, 1.05), 'coluna')
for lado in ('L', 'R'):
    om, pu = OMBRO[lado]; x = -1 if lado == 'L' else 1
    osso(f'braco.{lado}', tuple(om), tuple(pu), 'coluna')
    osso(f'mao.{lado}', tuple(pu), tuple(pu + Vector((0.01 * x, -0.02, -0.15))), f'braco.{lado}')
    osso(f'polegar.{lado}', tuple(pu + Vector((-0.05 * x, -0.04, -0.05))), tuple(pu + Vector((-0.09 * x, -0.075, -0.1))), f'mao.{lado}')
bpy.ops.object.mode_set(mode='OBJECT')
for o in [pele] + luvas:
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')


def prender(o, nome_osso):
    mw = o.matrix_world.copy()
    o.parent = arm; o.parent_type = 'BONE'; o.parent_bone = nome_osso
    o.matrix_world = mw


for o in pecas + olhos + acess + ([boca] if boca else []):
    prender(o, 'cabeca')
for o in corpo_pecas:
    prender(o, 'coluna')
for o in (copo, aro, borda):
    prender(o, 'quadril')
raiz = bpy.data.objects.new('macaco', None); bpy.context.collection.objects.link(raiz); arm.parent = raiz
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=os.path.join(SAIDA, f'macaco3_{PAPEL}.glb'), export_format='GLB', export_skins=True, export_lights=False, export_cameras=False)
print('ok', PAPEL, len(pele.data.polygons))

if RENDER:
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 48; sc.cycles.use_denoising = True
    sc.view_settings.view_transform = 'Standard'
    sc.render.resolution_x, sc.render.resolution_y = 720, 720
    sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True
    sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.55, 0.55, 0.57, 1)
    sc.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.55
    bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, 0)); chao = bpy.context.active_object; chao.data.materials.append(mat('chao', (0.7, 0.7, 0.72), 0.9))
    for nome, loc, en in (('chave', (1.6, -2.6, 2.6), 110), ('preenche', (-2.2, -2.0, 1.2), 55), ('recorte', (0, 2.5, 2.5), 80)):
        l = bpy.data.objects.new(nome, bpy.data.lights.new(nome, 'AREA')); bpy.context.collection.objects.link(l)
        l.data.energy = en; l.data.size = 3; l.location = loc
        l.rotation_euler = (Vector((0, 0, 0.55)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); bpy.context.collection.objects.link(cam); sc.camera = cam
    cam.data.lens = 70
    for nome, ang in (('frente', 0), ('34', 35)):
        a = math.radians(ang)
        cam.location = (math.sin(a) * 3.0, -math.cos(a) * 3.0, 0.75)
        cam.rotation_euler = (Vector((0, 0, 0.55)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(SAIDA, f'macaco3_{PAPEL}_{nome}.png')
        bpy.ops.render.render(write_still=True)
    print('render ok')
