"""Macaco 3D do BOMBANANA! das IAs (arte própria no estilo do jogo: macaco marrom de desenho, cara clara em forma de
coração, olhos grandes, luva branca de 4 dedos). Corpo e cabeça saem de metaballs (formas macias, de desenho), as
partes que mexem ficam separadas com pivôs nomeados para o three.js animar:
  cabeca (pivô no pescoço) > boca, olho_e/olho_d, venda, fone, fita
  ombro_e / ombro_d (pivô no ombro) > braco_* > cotovelo_* > antebraco_* > mao_* > dedo_*_1..4 (pivô na junta) e polegar_*
  gola (cor da IA), manual (fichário azul, preso na mão esquerda)
Uso: blender -b -P bombanana/blender/macaco.py  ->  video/remotion/public/bb/3d/macaco.glb
"""
import bpy, math, os
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.normpath(os.path.join(AQUI, '..', '..', 'video', 'remotion', 'public', 'bb', '3d'))
os.makedirs(SAIDA, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(nome, cor, rough=0.6, emit=0.0):
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*[c ** 2.2 for c in cor], 1)
    b.inputs['Roughness'].default_value = rough
    if emit:
        b.inputs['Emission Color'].default_value = (*[c ** 2.2 for c in cor], 1)
        b.inputs['Emission Strength'].default_value = emit
    return m


MARROM = mat('pelo', (0.48, 0.29, 0.15), 0.85)
PELE = mat('pele', (0.94, 0.77, 0.6), 0.7)
PRETO = mat('olho', (0.07, 0.07, 0.08), 0.2)
BRANCO = mat('luva', (0.97, 0.97, 0.97), 0.5)
BRILHO = mat('brilho', (1, 1, 1), 0.1, emit=1.5)
BOCA = mat('boca', (0.22, 0.05, 0.07), 0.6)
NARIZ = mat('nariz', (0.32, 0.18, 0.09), 0.5)
VERMELHO = mat('venda', (0.86, 0.15, 0.15), 0.6)
FONE = mat('fone', (0.13, 0.13, 0.14), 0.35)
FONE_LUZ = mat('fone_luz', (0.9, 0.15, 0.15), 0.4, emit=0.6)
FITA = mat('fita', (0.95, 0.89, 0.72), 0.8)
GOLA = mat('gola', (0.85, 0.47, 0.34), 0.6)
MANUAL = mat('manual', (0.66, 0.86, 0.94), 0.6)
MANUAL_ARGOLA = mat('argola', (0.9, 0.36, 0.46), 0.4)


def vazio(nome, loc, pai=None):
    from mathutils import Matrix
    o = bpy.data.objects.new(nome, None)
    bpy.context.collection.objects.link(o)
    if pai:
        o.parent = pai
    o.matrix_world = Matrix.Translation(loc)  # posição no mundo (sem somar a do pai)
    return o


def malha(o, m, pai=None, suave=True):
    o.data.materials.clear(); o.data.materials.append(m)
    if suave:
        for p in o.data.polygons:
            p.use_smooth = True
    if pai:
        loc = o.matrix_world.copy()
        o.parent = pai
        o.matrix_world = loc
    return o


def esfera(nome, loc, esc, m, pai=None, seg=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2, location=loc)
    o = bpy.context.active_object; o.name = nome; o.scale = esc
    bpy.ops.object.transform_apply(scale=True)
    return malha(o, m, pai)


def capsula(nome, a, b, r, m, pai=None):
    """cilindro com pontas redondas de a até b (para braços e dedos)"""
    a, b = Vector(a), Vector(b)
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=r, depth=d.length, location=(a + b) / 2)
    o = bpy.context.active_object; o.name = nome
    o.rotation_mode = 'QUATERNION'; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    bpy.ops.object.transform_apply(rotation=True)
    md = o.modifiers.new('sub', 'SUBSURF'); md.levels = 2
    bpy.ops.object.modifier_apply(modifier='sub')
    malha(o, m)
    for p, n in ((a, nome + '_a'), (b, nome + '_b')):
        e = esfera(n, p, (r, r, r), m)
        e.select_set(True)
    o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.join()
    if pai:
        malha(o, m, pai)
    return o


def metaball(nome, elementos, m, res=0.035):
    mb = bpy.data.metaballs.new(nome)
    mb.resolution = res; mb.render_resolution = res; mb.threshold = 0.1  # com 0.1 a superfície fica quase no raio pedido
    o = bpy.data.objects.new(nome, mb)
    bpy.context.collection.objects.link(o)
    for (x, y, z), raio, (sx, sy, sz) in elementos:
        e = mb.elements.new(); e.co = (x, y, z); e.radius = raio; e.size_x, e.size_y, e.size_z = sx, sy, sz
        e.type = 'ELLIPSOID'
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    o = bpy.context.active_object; o.name = nome
    md = o.modifiers.new('suave', 'SMOOTH'); md.iterations = 4; md.factor = 0.6
    bpy.ops.object.modifier_apply(modifier='suave')
    return malha(o, m)


# coordenadas: Y = frente (para a câmera é -Y no Blender? usamos -Y como frente), Z = cima, em metros (macaco ~1,1 m sentado)
raiz = vazio('macaco', (0, 0, 0))
# corpo (barriga clara na frente)
corpo = metaball('corpo', [((0, 0, 0.42), 0.36, (1.0, 0.85, 1.15)), ((0, 0, 0.2), 0.34, (1.05, 0.95, 0.8))], MARROM)
corpo.parent = raiz
esfera('barriga', (0, -0.2, 0.36), (0.24, 0.12, 0.3), PELE, corpo)
bpy.ops.mesh.primitive_torus_add(major_radius=0.2, minor_radius=0.07, location=(0, -0.01, 0.74))
gola = bpy.context.active_object; gola.name = 'gola'; gola.scale = (1.05, 0.95, 0.45); bpy.ops.object.transform_apply(scale=True)
malha(gola, GOLA, raiz)

# cabeça (pivô no pescoço)
cab = vazio('cabeca', (0, 0, 0.76), raiz)
cabm = metaball('cabeca_pelo', [((0, 0, 1.1), 0.44, (1.0, 0.92, 0.92))], MARROM, 0.03)
malha(cabm, MARROM, cab)
# cara clara em forma de coração (duas bolotas em cima + queixo)
cara = metaball('cara', [((-0.13, -0.2, 1.17), 0.19, (1, 0.6, 1)), ((0.13, -0.2, 1.17), 0.19, (1, 0.6, 1)), ((0, -0.24, 0.98), 0.24, (1.25, 0.7, 0.9))], PELE, 0.02)
malha(cara, PELE, cab)
for lado, x in (('e', -1), ('d', 1)):
    esfera(f'orelha_{lado}', (0.34 * x, 0.02, 1.1), (0.12, 0.065, 0.13), MARROM, cab)
    esfera(f'orelha_dentro_{lado}', (0.36 * x, -0.03, 1.1), (0.075, 0.04, 0.085), PELE, cab)
    o = esfera(f'olho_{lado}', (0.12 * x, -0.4, 1.18), (0.075, 0.05, 0.095), PRETO, cab)
    esfera(f'brilho_{lado}', (0.12 * x + 0.025, -0.445, 1.22), (0.022, 0.012, 0.022), BRILHO, o)
    esfera(f'narina_{lado}', (0.035 * x, -0.47, 1.03), (0.02, 0.012, 0.014), NARIZ, cab)
boca = esfera('boca', (0, -0.405, 0.93), (0.075, 0.02, 0.022), BOCA, cab)
# acessórios (o three.js liga só o do papel)
venda = vazio('venda', (0, 0, 1.18), cab)
bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.345, depth=0.12, location=(0, 0, 1.17), end_fill_type='NOTHING')
v = bpy.context.active_object; v.name = 'venda_faixa'; v.scale = (1, 0.98, 1); bpy.ops.object.transform_apply(scale=True)
md = v.modifiers.new('sol', 'SOLIDIFY'); md.thickness = 0.03; bpy.ops.object.modifier_apply(modifier='sol')
malha(v, VERMELHO, venda)
for i, ang in enumerate((-25, 20)):
    p = capsula(f'venda_ponta{i}', (0.3, 0.2, 1.17), (0.42 + 0.08 * i, 0.36, 1.17 + 0.12 * (1 if i == 0 else -1)), 0.035, VERMELHO, venda)
fone = vazio('fone', (0, 0, 1.18), cab)
bpy.ops.mesh.primitive_torus_add(major_radius=0.38, minor_radius=0.035, location=(0, 0.02, 1.12), rotation=(math.pi / 2, 0, 0))
arco = bpy.context.active_object; arco.name = 'fone_arco'
# só o arco de cima (de orelha a orelha por cima da cabeça)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='DESELECT'); bpy.ops.object.mode_set(mode='OBJECT')
for v in arco.data.vertices:
    v.select = (arco.matrix_world @ v.co).z < 1.08
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.delete(type='VERT'); bpy.ops.object.mode_set(mode='OBJECT')
malha(arco, FONE, fone)
for lado, x in (('e', -1), ('d', 1)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.13, depth=0.11, location=(0.37 * x, 0.02, 1.1), rotation=(0, math.pi / 2, 0))
    c = bpy.context.active_object; c.name = f'fone_concha_{lado}'
    md = c.modifiers.new('bisel', 'BEVEL'); md.width = 0.03; md.segments = 4; bpy.ops.object.modifier_apply(modifier='bisel')
    malha(c, FONE, fone)
    esfera(f'fone_luz_{lado}', (0.43 * x, 0.02, 1.1), (0.01, 0.04, 0.04), FONE_LUZ, fone)
fita = vazio('fita', (0, -0.45, 0.94), cab)
for i, ang in enumerate((-14, 14)):
    bpy.ops.mesh.primitive_cube_add(location=(0, -0.455, 0.94), rotation=(0, math.radians(ang), 0))
    t = bpy.context.active_object; t.name = f'fita{i}'; t.scale = (0.14, 0.012, 0.035); bpy.ops.object.transform_apply(scale=True)
    md = t.modifiers.new('bisel', 'BEVEL'); md.width = 0.01; bpy.ops.object.modifier_apply(modifier='bisel')
    malha(t, FITA, fita, suave=False)

MAOS = {}
# braços com pivôs (ombro > cotovelo > mão > dedos); posição de descanso: braço caído do lado
for lado, x in (('e', -1), ('d', 1)):
    ombro = vazio(f'ombro_{lado}', (0.3 * x, 0, 0.62), raiz)
    capsula(f'braco_{lado}', (0.3 * x, 0, 0.62), (0.36 * x, -0.06, 0.38), 0.075, MARROM, ombro)
    cot = vazio(f'cotovelo_{lado}', (0.36 * x, -0.06, 0.38), ombro)
    capsula(f'antebraco_{lado}', (0.36 * x, -0.06, 0.38), (0.36 * x, -0.2, 0.2), 0.07, MARROM, cot)
    mao = vazio(f'mao_{lado}', (0.36 * x, -0.22, 0.17), cot)
    MAOS[lado] = mao
    esfera(f'palma_{lado}', (0.36 * x, -0.23, 0.15), (0.1, 0.07, 0.1), BRANCO, mao)
    esfera(f'punho_{lado}', (0.36 * x, -0.2, 0.22), (0.085, 0.085, 0.05), BRANCO, mao)
    for k in range(4):  # 4 dedos de desenho
        jx = 0.36 * x + (k - 1.5) * 0.045 * x
        j = vazio(f'dedo_{lado}_{k + 1}', (jx, -0.25, 0.07), mao)
        capsula(f'dedo_{lado}_{k + 1}_m', (jx, -0.25, 0.07), (jx, -0.25, -0.02), 0.026, BRANCO, j)
    jp = vazio(f'polegar_{lado}', (0.36 * x - 0.08 * x, -0.27, 0.15), mao)
    capsula(f'polegar_{lado}_m', (0.36 * x - 0.08 * x, -0.27, 0.15), (0.36 * x - 0.13 * x, -0.3, 0.09), 0.028, BRANCO, jp)
# manual (fichário azul) preso na mão esquerda, aberto
man = vazio('manual', (-0.36, -0.3, 0.17), MAOS['e'])
bpy.ops.mesh.primitive_cube_add(location=(-0.24, -0.33, 0.12), rotation=(math.radians(10), 0, 0))
c = bpy.context.active_object; c.name = 'manual_capa'; c.scale = (0.24, 0.17, 0.02); bpy.ops.object.transform_apply(scale=True)
md = c.modifiers.new('bisel', 'BEVEL'); md.width = 0.015; md.segments = 3; bpy.ops.object.modifier_apply(modifier='bisel')
malha(c, MANUAL, man, suave=False)
for k in range(3):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.025, minor_radius=0.007, location=(-0.24, -0.355, 0.06 + k * 0.06), rotation=(0, math.pi / 2, 0))
    a = bpy.context.active_object; a.name = f'manual_argola{k}'
    malha(a, MANUAL_ARGOLA, man)

# vira a frente para +Z do glTF (o exportador converte Z-up -> Y-up; frente -Y vira +Z)
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.export_scene.gltf(filepath=os.path.join(SAIDA, 'macaco.glb'), export_format='GLB', export_apply=True, export_lights=False, export_cameras=False)
print('ok', os.path.join(SAIDA, 'macaco.glb'))
