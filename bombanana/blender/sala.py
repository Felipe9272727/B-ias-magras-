"""Cenário 3D do BOMBANANA! das IAs (arte própria no clima do jogo): o interior da van azul (painéis, teto curvo,
janelas, cortinas vermelhas com dobras, luminária laranja, prateleira com cacho de banana de cada cor, rádio,
caixotes de dinamite), a mesa redonda de feltro verde, os banquinhos e a bomba (maleta preta com tampa aberta;
o LCD é um plano chamado 'lcd' que o three.js troca pela textura do cronômetro).
Uso: blender -b -P bombanana/blender/sala.py [-- --previa]  ->  public/bb/3d/sala_van.glb e bomba.glb
"""
import bpy, math, os, sys
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.normpath(os.path.join(AQUI, '..', '..', 'video', 'remotion', 'public', 'bb', '3d'))
os.makedirs(SAIDA, exist_ok=True)


def mat(nome, cor, rough=0.6, emit=0.0, metal=0.0):
    m = bpy.data.materials.get(nome) or bpy.data.materials.new(nome)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*[c ** 2.2 for c in cor], 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*[c ** 2.2 for c in cor], 1)
        b.inputs['Emission Strength'].default_value = emit
    return m


def fim(o, m, suave=True, bisel=0.0, nome=None):
    if nome:
        o.name = nome
    if bisel:
        md = o.modifiers.new('bisel', 'BEVEL'); md.width = bisel; md.segments = 3
    o.data.materials.clear(); o.data.materials.append(m)
    for p in o.data.polygons:
        p.use_smooth = suave
    return o


def cubo(nome, loc, meia, m, rot=(0, 0, 0), bisel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o = bpy.context.active_object; o.scale = meia
    bpy.ops.object.transform_apply(scale=True)
    return fim(o, m, suave=bool(bisel), bisel=bisel, nome=nome)


def cil(nome, loc, r, h, m, rot=(0, 0, 0), v=48, bisel=0.0, r2=None):
    if r2 is not None:
        bpy.ops.mesh.primitive_cone_add(vertices=v, radius1=r, radius2=r2, depth=h, location=loc, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cylinder_add(vertices=v, radius=r, depth=h, location=loc, rotation=rot)
    o = bpy.context.active_object
    return fim(o, m, bisel=bisel, nome=nome)


def esfera(nome, loc, esc, m):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, location=loc)
    o = bpy.context.active_object; o.scale = esc
    bpy.ops.object.transform_apply(scale=True)
    return fim(o, m, nome=nome)


def banana(nome, loc, rot, cor):
    """banana de desenho: cilindro afinando nas pontas e curvado (Simple Deform Bend)"""
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.045, depth=0.32, location=(0, 0, 0))
    o = bpy.context.active_object
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.subdivide(number_cuts=8); bpy.ops.object.mode_set(mode='OBJECT')
    for v in o.data.vertices:  # afina nas pontas
        k = 1 - (abs(v.co.z) / 0.16) ** 2 * 0.75
        v.co.x *= k; v.co.y *= k
    md = o.modifiers.new('curva', 'SIMPLE_DEFORM'); md.deform_method = 'BEND'; md.angle = math.radians(70); md.deform_axis = 'Y'
    bpy.ops.object.modifier_apply(modifier='curva')
    o.location = loc; o.rotation_euler = rot
    fim(o, mat(f'banana_{cor[0]}', cor[1], 0.45), nome=nome)
    cil(nome + '_cabo', (0, 0, 0), 0.012, 0.05, mat('cabo_banana', (0.3, 0.2, 0.1))).parent = o
    return o


def exportar(arquivo, objs):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
        for c in o.children_recursive:
            c.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(SAIDA, arquivo), export_format='GLB', use_selection=True, export_apply=True, export_lights=False, export_cameras=False)
    print('ok', arquivo)


bpy.ops.wm.read_factory_settings(use_empty=True)
AZUL = mat('parede', (0.16, 0.31, 0.66), 0.75)
AZUL_ESC = mat('parede_esc', (0.1, 0.2, 0.48), 0.75)
TETO = mat('teto', (0.1, 0.17, 0.4), 0.8)
CHAO = mat('chao', (0.33, 0.22, 0.15), 0.85)
CHAO2 = mat('chao2', (0.29, 0.19, 0.13), 0.85)
VERMELHO = mat('cortina', (0.78, 0.13, 0.13), 0.9)
VIDRO = mat('janela', (0.62, 0.83, 0.96), 0.1, emit=1.2)
MOLDURA = mat('moldura', (0.08, 0.13, 0.3), 0.5)
LARANJA = mat('lampada', (1.0, 0.56, 0.0), 0.4)
LUZ = mat('luz', (1.0, 0.85, 0.6), 0.2, emit=8)
FELTRO = mat('feltro', (0.18, 0.49, 0.2), 0.95)
MADEIRA = mat('madeira', (0.43, 0.26, 0.14), 0.55)
BANCO = mat('banco', (0.9, 0.92, 0.95), 0.35)
METAL = mat('metal', (0.6, 0.62, 0.66), 0.3, metal=0.9)

van = bpy.data.objects.new('van', None); bpy.context.collection.objects.link(van)
partes = []
# chão em tábuas
for i in range(10):
    partes.append(cubo(f'tabua{i}', (0, -2.7 + i * 0.6, -0.02), (3.0, 0.29, 0.02), CHAO if i % 2 else CHAO2))
# paredes com painéis horizontais (fundo = +Y no Blender = longe da câmera)
partes.append(cubo('parede_fundo', (0, 2.3, 1.6), (3.0, 0.05, 1.6), AZUL))
for lado in (-1, 1):
    partes.append(cubo(f'parede_{lado}', (2.75 * lado, 0, 1.6), (0.05, 3.0, 1.6), AZUL))
    for k in range(3):
        partes.append(cubo(f'friso_{lado}_{k}', (2.7 * lado, 0, 0.45 + k * 0.9), (0.03, 3.0, 0.035), AZUL_ESC, bisel=0.01))
for k in range(3):
    partes.append(cubo(f'friso_fundo_{k}', (0, 2.25, 0.45 + k * 0.9), (3.0, 0.03, 0.035), AZUL_ESC, bisel=0.01))
# teto curvo (meio cilindro) com nervuras
o = cil('teto', (0, 0, 2.6), 2.9, 6.0, TETO, rot=(math.pi / 2, 0, 0), v=64)
bpy.ops.object.transform_apply(rotation=True)
o.scale = (1, 1, 0.12); bpy.ops.object.transform_apply(scale=True)
o.modifiers.new('sol', 'SOLIDIFY').thickness = 0.05
fim(o, TETO); partes.append(o)
for k in range(5):
    t = cil(f'nervura{k}', (0, -2.2 + k * 1.1, 2.58), 2.9, 0.06, AZUL_ESC, rot=(math.pi / 2, 0, 0), v=64)
    bpy.ops.object.transform_apply(rotation=True)
    t.scale = (1, 1, 0.12); bpy.ops.object.transform_apply(scale=True); partes.append(t)
# janelas no fundo com moldura arredondada e cortinas com dobras
for x in (-1.3, 1.3):
    partes.append(cubo(f'janela_{x}', (x, 2.24, 1.75), (0.55, 0.01, 0.33), VIDRO))
    partes.append(cubo(f'moldura_{x}', (x, 2.22, 1.75), (0.6, 0.02, 0.38), MOLDURA, bisel=0.05))
    for lado in (-1, 1):
        bpy.ops.mesh.primitive_plane_add(size=1, location=(x + 0.66 * lado, 2.15, 1.65), rotation=(math.pi / 2, 0, 0))
        c = bpy.context.active_object; c.scale = (0.28, 1.1, 1); bpy.ops.object.transform_apply(scale=True)
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.subdivide(number_cuts=24); bpy.ops.object.mode_set(mode='OBJECT')
        for v in c.data.vertices:
            v.co.z += math.sin(v.co.x * 60) * 0.025  # dobras
        c.modifiers.new('sol', 'SOLIDIFY').thickness = 0.02
        fim(c, VERMELHO, nome=f'cortina_{x}_{lado}'); partes.append(c)
    partes.append(cil(f'varao_{x}', (x, 2.13, 2.25), 0.015, 1.7, METAL, rot=(0, math.pi / 2, 0), v=16))
# luminária laranja com lâmpada acesa
partes.append(cil('fio', (0, 0, 2.45), 0.01, 0.3, mat('fio', (0.1, 0.1, 0.1))))
lamp = cil('luminaria', (0, 0, 2.25), 0.32, 0.22, LARANJA, v=48, r2=0.06)
lamp.modifiers.new('sol', 'SOLIDIFY').thickness = 0.02; partes.append(lamp)
partes.append(esfera('lampada', (0, 0, 2.15), (0.07, 0.07, 0.07), LUZ))
# prateleira com bananas de cada cor na parede direita (o Mudo aponta para elas)
partes.append(cubo('prateleira', (2.55, 0.0, 1.35), (0.18, 1.0, 0.025), MADEIRA, bisel=0.01))
partes.append(cubo('prateleira2', (2.55, 0.0, 1.85), (0.18, 1.0, 0.025), MADEIRA, bisel=0.01))
CORES = [('vermelho', (0.9, 0.22, 0.21)), ('azul', (0.12, 0.53, 0.9)), ('amarelo', (0.99, 0.85, 0.21)), ('verde', (0.26, 0.63, 0.28)),
         ('branco', (0.96, 0.96, 0.96)), ('preto', (0.15, 0.15, 0.15)), ('roxo', (0.56, 0.14, 0.67)), ('laranja', (0.98, 0.55, 0.0))]
for i, c in enumerate(CORES):
    partes.append(banana(f'banana_{c[0]}', (2.5, -0.75 + (i % 4) * 0.5, 1.45 + (i // 4) * 0.5), (0, math.radians(90), math.radians(20)), c))
# rádio e caixotes de dinamite no canto esquerdo
partes.append(cubo('radio', (-2.4, 1.6, 1.0), (0.25, 0.12, 0.15), mat('radio', (0.31, 0.76, 0.97), 0.4), bisel=0.03))
for i, x in enumerate((-0.12, 0.12)):
    partes.append(cil(f'autofalante{i}', (-2.4 + x, 1.47, 1.0), 0.08, 0.02, mat('preto', (0.12, 0.12, 0.12)), rot=(math.pi / 2, 0, 0)))
partes.append(cubo('caixote', (-2.3, 1.7, 0.3), (0.35, 0.3, 0.3), mat('caixote', (0.62, 0.42, 0.22), 0.8), bisel=0.02))
for i in range(5):
    partes.append(cil(f'dinamite{i}', (-2.45 + i * 0.07, 1.4, 0.68), 0.03, 0.28, mat('dinamite', (0.85, 0.18, 0.15), 0.6), rot=(0, 0.2, 0)))
# mesa redonda: tampo verde, borda de madeira, pé
partes.append(cil('feltro', (0, 0, 0.74), 1.05, 0.04, FELTRO, v=96))
bpy.ops.mesh.primitive_torus_add(major_radius=1.08, minor_radius=0.065, major_segments=96, location=(0, 0, 0.74))
partes.append(fim(bpy.context.active_object, MADEIRA, nome='borda'))
partes.append(cil('pe_mesa', (0, 0, 0.37), 0.12, 0.72, MADEIRA, r2=0.18))
partes.append(cil('base_mesa', (0, 0, 0.03), 0.45, 0.05, MADEIRA, bisel=0.02))
# banquinhos (Cego à esquerda, Mudo no fundo, Surdo à direita)
for nome, (x, y) in (('banco_cego', (-1.35, -0.45)), ('banco_mudo', (0, 1.4)), ('banco_surdo', (1.35, -0.45))):
    partes.append(cil(nome, (x, y, 0.42), 0.3, 0.08, BANCO, bisel=0.03))
    partes.append(cil(nome + '_pe', (x, y, 0.2), 0.05, 0.4, METAL, v=24))
    partes.append(cil(nome + '_base', (x, y, 0.02), 0.25, 0.03, METAL))
for p in partes:
    if p.parent is None:
        p.parent = van
exportar('sala_van.glb', [van])

# ----- bomba: maleta preta, tampa aberta com LCD, dinamite, fios
bomba = bpy.data.objects.new('bomba', None); bpy.context.collection.objects.link(bomba)
CASE = mat('maleta', (0.17, 0.18, 0.21), 0.5)
CASE2 = mat('maleta2', (0.12, 0.13, 0.15), 0.5)
pb = []
pb.append(cubo('maleta', (0, 0, 0.84), (0.46, 0.32, 0.08), CASE, bisel=0.03))
pb.append(cubo('painel', (0, 0, 0.92), (0.42, 0.28, 0.005), mat('painel', (0.28, 0.3, 0.35), 0.6)))
tampa = cubo('tampa', (0, 0.36, 1.08), (0.46, 0.04, 0.24), CASE2, rot=(math.radians(-15), 0, 0), bisel=0.03); pb.append(tampa)
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.315, 1.12), rotation=(math.radians(90 - 15), 0, 0))
lcd = bpy.context.active_object; lcd.scale = (0.32, 0.13, 1); bpy.ops.object.transform_apply(scale=True)
fim(lcd, mat('lcd', (0.09, 0.14, 0.06), 0.3, emit=0.5), suave=False, nome='lcd'); pb.append(lcd)
pb.append(cubo('moldura_lcd', (0, 0.33, 1.12), (0.36, 0.015, 0.16), mat('verde_escuro', (0.23, 0.29, 0.17), 0.5), rot=(math.radians(-15), 0, 0), bisel=0.01))
# dinamite amarrada do lado
for i in range(4):
    pb.append(cil(f'dinamite_b{i}', (0.58, -0.18 + i * 0.12, 0.84), 0.055, 0.4, mat('dinamite', (0.85, 0.18, 0.15), 0.6), rot=(0, math.pi / 2, 0), v=24))
pb.append(cil('fita_dinamite', (0.58, 0.0, 0.84), 0.06, 0.48, mat('fita_d', (0.25, 0.22, 0.2), 0.9), rot=(math.pi / 2, 0, 0), v=24))
# fios coloridos saindo da maleta para a dinamite
for i, c in enumerate([(0.9, 0.22, 0.21), (0.12, 0.53, 0.9), (0.99, 0.85, 0.21), (0.26, 0.63, 0.28)]):
    bpy.ops.curve.primitive_bezier_curve_add(location=(0, 0, 0))
    cv = bpy.context.active_object
    pts = cv.data.splines[0].bezier_points
    pts[0].co = (0.35, -0.12 + i * 0.07, 0.93); pts[0].handle_right = (0.5, -0.12 + i * 0.07, 1.05); pts[0].handle_left = (0.2, -0.12 + i * 0.07, 0.93)
    pts[1].co = (0.58, -0.2 + i * 0.13, 0.9); pts[1].handle_left = (0.58, -0.2 + i * 0.13, 1.05); pts[1].handle_right = (0.58, -0.2 + i * 0.13, 0.8)
    cv.data.bevel_depth = 0.012; cv.data.bevel_resolution = 4
    bpy.ops.object.convert(target='MESH')
    pb.append(fim(bpy.context.active_object, mat(f'fio{i}', c, 0.4), nome=f'fio_bomba{i}'))
for p in pb:
    p.parent = bomba
exportar('bomba.glb', [bomba])

if '--previa' in sys.argv:
    # render de conferência no Cycles (câmera como a do jogo: de frente, de cima)
    bpy.ops.wm.append  # noqa
    # os três macacos nos banquinhos, cada um só com o acessório do papel e a gola da cor da IA
    for papel, (x, y, rz, cor) in {'Cego': (-1.35, -0.45, 66, (0.85, 0.47, 0.34)), 'Mudo': (0, 1.4, 0, (0.26, 0.52, 0.96)), 'Surdo': (1.35, -0.45, -66, (0.06, 0.64, 0.5))}.items():
        antes = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=os.path.join(SAIDA, 'macaco.glb'))
        novos = [o for o in bpy.data.objects if o not in antes]
        raiz = next(o for o in novos if o.name.startswith('macaco'))
        raiz.location = (x, y, 0.42); raiz.rotation_mode = 'XYZ'; raiz.rotation_euler = (0, 0, math.radians(rz))
        for o in novos:
            base = o.name.split('.')[0]
            esconder = (base.startswith('venda') and papel != 'Cego') or (base.startswith('fone') and papel != 'Surdo') or ((base.startswith('fita') or base.startswith('manual')) and papel != 'Mudo') or (base.startswith(('olho', 'brilho')) and papel == 'Cego') or (base == 'boca' and papel == 'Mudo')
            if esconder:
                o.hide_render = True
            if base == 'gola' and o.type == 'MESH':
                m = o.active_material.copy(); o.active_material = m
                m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*[c ** 2.2 for c in cor], 1)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 24; sc.cycles.use_denoising = True
    sc.render.resolution_x, sc.render.resolution_y = 960, 540
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); bpy.context.collection.objects.link(cam)
    cam.location = (0, -4.4, 2.75); cam.rotation_euler = (math.radians(70), 0, 0); cam.data.lens = 30; sc.camera = cam
    sol = bpy.data.objects.new('sol', bpy.data.lights.new('sol', 'SUN')); bpy.context.collection.objects.link(sol)
    sol.data.energy = 2.5; sol.rotation_euler = (math.radians(40), math.radians(20), 0)
    p = bpy.data.objects.new('ponto', bpy.data.lights.new('ponto', 'POINT')); bpy.context.collection.objects.link(p)
    p.location = (0, 0, 2.1); p.data.energy = 300; p.data.color = (1, 0.8, 0.55)
    sc.world = bpy.data.worlds.new('w'); sc.world.color = (0.3, 0.35, 0.5)
    sc.render.filepath = os.path.join(SAIDA, 'previa_sala.png')
    bpy.ops.render.render(write_still=True)
    print('previa ok')
