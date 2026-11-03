"""Cenário 3D v2 do BOMBANANA! a partir da folha de referência do Felipe (sala azul-marinho com faixa amarela, aro de
basquete no hexágono roxo, cômoda de madeira, rádio azul, mesa da bomba com feltro verde, janela com cortina vermelha,
caixotes laranja e roxos com banana, luminária laranja, mangueiras no teto, porta, estante e grade de ventilação no fundo).
A bomba é outro GLB: maleta cinza arredondada, tampa com tela verde ('lcd', que o three.js troca pela textura do
cronômetro), painel azul ('painel', que recebe a textura dos módulos) e fios coloridos.
Uso: blender -b -P bombanana/blender/sala2.py [-- --previa]  ->  public/bb/3d/sala2.glb e bomba2.glb
"""
import bpy, math, os, sys, random
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.normpath(os.path.join(AQUI, '..', '..', 'video', 'remotion', 'public', 'bb', '3d'))
random.seed(7)


def lin(c):
    return tuple(x ** 2.2 for x in c)


def mat(nome, cor, rough=0.6, emit=0.0, metal=0.0):
    m = bpy.data.materials.get(nome)
    if m:
        return m
    m = bpy.data.materials.new(nome); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*lin(cor), 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*lin(cor), 1)
        b.inputs['Emission Strength'].default_value = emit
    return m


def ativo():
    return bpy.context.active_object


def acabar(o, m, nome, liso=True):
    o.name = nome
    o.data.materials.clear(); o.data.materials.append(m)
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    for md in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=md.name)
    if liso:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(40))
    else:
        bpy.ops.object.shade_flat()
    TODOS.append(o)
    return o


def caixa(nome, loc, tam, m, r=0.02, rot=(0, 0, 0)):
    """caixa arredondada: tam = tamanho total (x, y, z)"""
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o = ativo(); o.scale = [t / 2 for t in tam]
    bpy.ops.object.transform_apply(scale=True)
    if r:
        md = o.modifiers.new('b', 'BEVEL'); md.width = min(r, min(tam) / 2.05); md.segments = 4
    return acabar(o, m, nome)


def cil(nome, loc, r, h, m, rot=(0, 0, 0), v=40, bis=0.0, r2=None):
    if r2 is not None:
        bpy.ops.mesh.primitive_cone_add(vertices=v, radius1=r, radius2=r2, depth=h, location=loc, rotation=rot)
    else:
        bpy.ops.mesh.primitive_cylinder_add(vertices=v, radius=r, depth=h, location=loc, rotation=rot)
    o = ativo()
    if bis:
        md = o.modifiers.new('b', 'BEVEL'); md.width = bis; md.segments = 3
    return acabar(o, m, nome)


def esfera(nome, loc, esc, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, location=loc, rotation=rot)
    o = ativo(); o.scale = esc
    bpy.ops.object.transform_apply(scale=True)
    return acabar(o, m, nome)


def toro(nome, loc, R, r, m, rot=(0, 0, 0), esc=(1, 1, 1)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=64, minor_segments=16, location=loc, rotation=rot)
    o = ativo(); o.scale = esc
    bpy.ops.object.transform_apply(scale=True)
    return acabar(o, m, nome)


def tubo(nome, pontos, raio, m):
    """mangueira / fio: curva NURBS suave pelos pontos"""
    cd = bpy.data.curves.new(nome, 'CURVE'); cd.dimensions = '3D'
    cd.bevel_depth = raio; cd.bevel_resolution = 5; cd.resolution_u = 24; cd.use_fill_caps = True
    sp = cd.splines.new('NURBS'); sp.points.add(len(pontos) - 1)
    for p, c in zip(sp.points, pontos):
        p.co = (*c, 1)
    sp.use_endpoint_u = True; sp.order_u = 4
    o = bpy.data.objects.new(nome, cd); bpy.context.collection.objects.link(o)
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.convert(target='MESH')
    return acabar(ativo(), m, nome)


def plano(nome, loc, tam, m, rot=(0, 0, 0), cortes=0, onda=None):
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
    o = ativo(); o.scale = (tam[0], tam[1], 1)
    bpy.ops.object.transform_apply(scale=True)
    if cortes:
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.subdivide(number_cuts=cortes); bpy.ops.object.mode_set(mode='OBJECT')
    if onda:
        for v in o.data.vertices:
            v.co.z += onda(v.co.x, v.co.y)
    o.location = loc; o.rotation_euler = rot
    bpy.ops.object.transform_apply(location=False, rotation=True)
    o.location = loc
    return o


def banana(nome, loc, rot, m, esc=1.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.045 * esc, depth=0.32 * esc, location=(0, 0, 0))
    o = ativo()
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.subdivide(number_cuts=8); bpy.ops.object.mode_set(mode='OBJECT')
    for v in o.data.vertices:
        k = 1 - (abs(v.co.z) / (0.16 * esc)) ** 2 * 0.7
        v.co.x *= k; v.co.y *= k
    md = o.modifiers.new('curva', 'SIMPLE_DEFORM'); md.deform_method = 'BEND'; md.angle = math.radians(75); md.deform_axis = 'Y'
    bpy.ops.object.modifier_apply(modifier='curva')
    o.location = loc; o.rotation_euler = rot
    return acabar(o, m, nome)


def logo_banana(nome, centro, normal_y, esc, m):
    """banana chapada (logo) no meio de uma face; normal_y=-1 olha para -Y, 'x' para lateral"""
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.055 * esc, depth=0.4 * esc)
    o = ativo()
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.subdivide(number_cuts=10); bpy.ops.object.mode_set(mode='OBJECT')
    for v in o.data.vertices:
        k = 1 - (abs(v.co.z) / (0.2 * esc)) ** 2 * 0.75
        v.co.x *= k; v.co.y *= k * 0.35  # achatada
    md = o.modifiers.new('curva', 'SIMPLE_DEFORM'); md.deform_method = 'BEND'; md.angle = math.radians(110); md.deform_axis = 'Y'
    bpy.ops.object.modifier_apply(modifier='curva')
    if normal_y == 'x':
        o.rotation_euler = (math.radians(90), math.radians(35), math.radians(90))
    else:
        o.rotation_euler = (math.radians(90), math.radians(35), 0)
    o.location = centro
    return acabar(o, m, nome)


bpy.ops.wm.read_factory_settings(use_empty=True)
TODOS = []

# ---------------- paleta da folha
MARINHO = mat('marinho', (0.12, 0.19, 0.42), 0.8)
MARINHO2 = mat('marinho2', (0.09, 0.14, 0.32), 0.8)
TETO = mat('teto', (0.27, 0.26, 0.45), 0.8)
CINZA_LIL = mat('cinza_lilas', (0.55, 0.56, 0.7), 0.5)
CHAO = mat('chao', (0.42, 0.4, 0.52), 0.85)
AMARELO = mat('amarelo', (0.98, 0.76, 0.18), 0.55)
LARANJA = mat('laranja', (0.97, 0.55, 0.16), 0.5)
LARANJA2 = mat('laranja2', (0.85, 0.42, 0.1), 0.55)
ROXO = mat('roxo', (0.44, 0.25, 0.75), 0.5)
ROXO2 = mat('roxo2', (0.33, 0.18, 0.6), 0.5)
VERMELHO = mat('vermelho', (0.88, 0.12, 0.14), 0.45)
CORTINA = mat('cortina', (0.82, 0.1, 0.12), 0.85)
TEAL = mat('teal', (0.22, 0.62, 0.6), 0.4)
MAD = mat('madeira', (0.74, 0.5, 0.31), 0.6)
MAD2 = mat('madeira2', (0.6, 0.38, 0.22), 0.6)
MAD_VERM = mat('madeira_verm', (0.7, 0.34, 0.2), 0.55)
VERDE = mat('verde', (0.28, 0.83, 0.3), 0.5)
FELTRO = mat('feltro', (0.2, 0.6, 0.22), 0.95)
AZUL = mat('azul', (0.2, 0.5, 0.92), 0.4)
AZUL_VIVO = mat('azul_vivo', (0.12, 0.55, 0.98), 0.35)
ARDOSIA = mat('ardosia', (0.38, 0.42, 0.52), 0.5)
CREME = mat('creme', (0.97, 0.95, 0.9), 0.5)
PRETO = mat('preto', (0.08, 0.08, 0.1), 0.6)
METAL = mat('metal', (0.62, 0.64, 0.7), 0.35, metal=0.6)
VIDRO_VERDE = mat('vidro_verde', (0.3, 0.8, 0.35), 0.15)
CEU = mat('ceu', (0.35, 0.65, 0.98), 0.3, emit=0.7)
NUVEM = mat('nuvem', (1, 1, 1), 0.5, emit=0.9)
LUZ = mat('luz', (1, 0.88, 0.6), 0.2, emit=12)

W, D, H = 3.0, 2.5, 2.8  # meia largura, meia profundidade, altura

# ---------------- casca da sala
caixa('chao', (0, 0, -0.05), (2 * W, 2 * D, 0.1), CHAO, r=0)
toro('faixa_amarela', (0.0, 0.2, 0.005), 1.85, 0.075, AMARELO, esc=(1.12, 1, 0.06))
caixa('parede_fundo', (0, D + 0.05, H / 2), (2 * W + 0.2, 0.1, H), MARINHO, r=0)
caixa('parede_frente', (0, -D - 0.05, H / 2), (2 * W + 0.2, 0.1, H), MARINHO, r=0)
for lado in (-1, 1):
    caixa(f'parede_{lado}', (lado * (W + 0.05), 0, H / 2), (0.1, 2 * D, H), MARINHO, r=0)
    # cantos arredondados (colunas) e rodapé
    for y in (-1, 1):
        cil(f'coluna_{lado}_{y}', (lado * W, y * D, H / 2), 0.09, H, MARINHO2, v=24)
caixa('rodape_fundo', (0, D - 0.02, 0.06), (2 * W, 0.05, 0.12), MARINHO2, r=0.01)
caixa('rodape_frente', (0, -D + 0.02, 0.06), (2 * W, 0.05, 0.12), MARINHO2, r=0.01)
for lado in (-1, 1):
    caixa(f'rodape_{lado}', (lado * (W - 0.02), 0, 0.06), (0.05, 2 * D, 0.12), MARINHO2, r=0.01)
# teto: placa lilás com moldura arredondada cinza em volta e vigas
caixa('teto', (0, 0, H + 0.05), (2 * W, 2 * D, 0.1), TETO, r=0)
for lado in (-1, 1):
    caixa(f'sanca_y{lado}', (0, lado * (D - 0.12), H - 0.08), (2 * W, 0.3, 0.18), CINZA_LIL, r=0.07)
    caixa(f'sanca_x{lado}', (lado * (W - 0.12), 0, H - 0.08), (0.3, 2 * D, 0.18), CINZA_LIL, r=0.07)
for i, y in enumerate((-1.2, 0.0, 1.2)):
    caixa(f'viga{i}', (0, y, H - 0.05), (2 * W, 0.16, 0.12), CINZA_LIL, r=0.05)

# mangueiras do teto (amarela grossa, roxa e pretas)
tubo('mangueira_amarela', [(-W, 1.9, 2.55), (-2.0, 2.2, 2.25), (-0.8, 2.3, 2.45), (0.6, 2.1, 2.55), (1.6, 2.3, 2.65), (W, 2.0, 2.7)], 0.045, AMARELO)
tubo('mangueira_roxa', [(-0.2, 2.45, 2.7), (0.1, 2.35, 2.3), (0.45, 2.0, 2.35), (0.7, 1.7, 2.65)], 0.04, ROXO)
tubo('fio_preto1', [(-W + 0.05, 2.3, 2.7), (-2.6, 2.4, 2.1), (-2.2, 2.45, 2.3), (-1.4, 2.45, 2.65)], 0.025, PRETO)
tubo('fio_preto2', [(-W + 0.05, 1.2, 2.6), (-W + 0.05, 1.5, 2.2), (-W + 0.05, 1.9, 1.95), (-W + 0.05, 2.3, 2.5)], 0.02, PRETO)

# ---------------- parede do fundo
# faixa amarela presa com fita preta nos cantos (leve ondulação)
fx = plano('faixa', (0, 0, 0), (1.7, 0.85), AMARELO, cortes=12, onda=lambda x, y: 0.015 * math.sin(x * 9) * math.cos(y * 5))
for v in fx.data.vertices:  # cantos de cima/baixo levemente arqueados, como pano preso
    v.co.y += -0.06 * (1 - (v.co.x / 0.85) ** 2) * (1 if v.co.y > 0 else -0.4)
fx.rotation_euler = (math.radians(90), 0, 0); fx.location = (-0.75, D - 0.02, 1.85)
bpy.context.view_layer.objects.active = fx; fx.modifiers.new('s', 'SOLIDIFY').thickness = 0.01
acabar(fx, AMARELO, 'faixa')
for i, (x, z) in enumerate(((-1.6, 2.27), (0.1, 2.27), (-1.6, 1.43), (0.1, 1.43))):
    caixa(f'fita_faixa{i}', (x, D - 0.035, z), (0.17, 0.02, 0.1), PRETO, r=0.005, rot=(0, math.radians(40 if i in (0, 3) else -40), 0))
# bilhetes amarelos
for i, (x, z, a) in enumerate(((-2.35, 1.72, 6), (-2.55, 1.42, -5), (-1.95, 1.3, 3))):
    caixa(f'bilhete{i}', (x, D - 0.02, z), (0.2, 0.01, 0.2), AMARELO, r=0.004, rot=(0, math.radians(a), 0))
    cil(f'tacha{i}', (x, D - 0.035, z + 0.07), 0.012, 0.01, VERMELHO, rot=(math.radians(90), 0, 0), v=12)
# caixa elétrica roxa com fios (canto superior esquerdo)
caixa('tomada_fundo', (-2.6, D - 0.05, 2.15), (0.32, 0.08, 0.32), ROXO, r=0.04)
toro('tomada_fundo_aro', (-2.6, D - 0.1, 2.15), 0.09, 0.018, CINZA_LIL, rot=(math.radians(90), 0, 0))
caixa('tomada_fundo_fenda', (-2.6, D - 0.1, 2.15), (0.12, 0.01, 0.03), CINZA_LIL, r=0.005)
# placa hexagonal roxa com tabela branca e aro de basquete vermelho
cil('hexagono', (0.95, D - 0.05, 1.95), 0.5, 0.06, ROXO, rot=(math.radians(90), 0, 0), v=6, bis=0.02)
cil('hexagono_borda', (0.95, D - 0.04, 1.95), 0.56, 0.04, ROXO2, rot=(math.radians(90), 0, 0), v=6, bis=0.015)
caixa('tabela', (0.95, D - 0.1, 2.0), (0.4, 0.05, 0.46), CREME, r=0.05)
caixa('tabela_quadro', (0.95, D - 0.125, 1.9), (0.2, 0.01, 0.16), mat('lilas_claro', (0.84, 0.84, 0.95), 0.5), r=0.02)
toro('aro', (0.95, D - 0.35, 1.78), 0.2, 0.025, VERMELHO, esc=(1, 1, 1))
caixa('aro_suporte', (0.95, D - 0.16, 1.78), (0.06, 0.12, 0.03), VERMELHO, r=0.01)
tubo('cano_roxo_hex', [(0.6, D - 0.1, 2.4), (0.75, D - 0.25, 2.55), (1.0, D - 0.3, 2.7)], 0.04, ROXO)

# cômoda de madeira com gavetas e puxadores
CX, CY = -1.05, D - 0.33
caixa('comoda_base', (CX, CY, 0.08), (2.5, 0.55, 0.12), MAD2, r=0.02)
caixa('comoda', (CX, CY, 0.47), (2.6, 0.6, 0.7), MAD, r=0.03)
caixa('comoda_tampo', (CX, CY - 0.02, 0.85), (2.72, 0.68, 0.07), MAD, r=0.025)
for i in range(5):
    x = CX - 1.04 + i * 0.52
    if i in (1, 3):  # duas gavetas empilhadas
        for k, z in enumerate((0.62, 0.33)):
            caixa(f'gaveta{i}_{k}', (x, CY - 0.31, z), (0.46, 0.04, 0.24), MAD, r=0.02)
            esfera(f'puxador{i}_{k}', (x, CY - 0.35, z), (0.03, 0.025, 0.03), ARDOSIA)
    else:
        caixa(f'porta{i}', (x, CY - 0.31, 0.47), (0.46, 0.04, 0.54), MAD, r=0.02)
        esfera(f'puxador{i}', (x + (0.14 if i < 2 else -0.14), CY - 0.36, 0.55), (0.045, 0.035, 0.045), ARDOSIA)
TOPO = 0.885
# extintor vermelho
cil('extintor', (-2.15, CY, TOPO + 0.22), 0.1, 0.44, VERMELHO, bis=0.03)
esfera('extintor_topo', (-2.15, CY, TOPO + 0.44), (0.1, 0.1, 0.06), VERMELHO)
cil('extintor_valvula', (-2.15, CY, TOPO + 0.52), 0.03, 0.08, PRETO)
caixa('extintor_alavanca', (-2.1, CY, TOPO + 0.57), (0.14, 0.03, 0.02), PRETO, r=0.008)
tubo('extintor_mangueira', [(-2.15, CY, TOPO + 0.52), (-2.03, CY - 0.06, TOPO + 0.5), (-2.04, CY - 0.11, TOPO + 0.3), (-2.07, CY - 0.11, TOPO + 0.15)], 0.014, PRETO)
caixa('extintor_rotulo', (-2.15, CY - 0.1, TOPO + 0.2), (0.12, 0.01, 0.1), CREME, r=0.005)
# caixinha amarela e grampeador cinza
caixa('caixinha', (-1.7, CY, TOPO + 0.05), (0.32, 0.18, 0.1), AMARELO, r=0.02)
caixa('grampeador', (-1.42, CY + 0.02, TOPO + 0.04), (0.18, 0.08, 0.08), ARDOSIA, r=0.02)
# a "hélice" vermelha (registro em X)
cil('x_cubo', (-1.0, CY, TOPO + 0.2), 0.05, 0.08, VERMELHO, rot=(math.radians(90), 0, 0))
for i, a in enumerate((35, 125, 215, 305)):
    r = math.radians(a)
    p = (-1.0 + 0.13 * math.cos(r), CY, TOPO + 0.2 + 0.13 * math.sin(r))
    cil(f'x_braco{i}', p, 0.03, 0.26, VERMELHO, rot=(0, math.radians(90) - r, 0), bis=0.01)
    cil(f'x_ponta{i}', (-1.0 + 0.26 * math.cos(r), CY, TOPO + 0.2 + 0.26 * math.sin(r)), 0.042, 0.05, VERMELHO, rot=(0, math.radians(90) - r, 0), bis=0.01)
cil('x_pe', (-1.0, CY, TOPO + 0.04), 0.06, 0.08, VERMELHO)
# chave inglesa azul deitada
caixa('chave_cabo', (-0.72, CY - 0.18, TOPO + 0.015), (0.32, 0.05, 0.025), AZUL_VIVO, r=0.01, rot=(0, 0, math.radians(8)))
cil('chave_boca', (-0.54, CY - 0.155, TOPO + 0.015), 0.045, 0.025, AZUL_VIVO, v=24)
caixa('chave_fenda_boca', (-0.51, CY - 0.15, TOPO + 0.015), (0.05, 0.035, 0.03), MAD)
# garrafa verde
cil('garrafa', (-0.55, CY + 0.05, TOPO + 0.12), 0.055, 0.24, VERDE, bis=0.02)
cil('garrafa_gargalo', (-0.55, CY + 0.05, TOPO + 0.3), 0.022, 0.13, VERDE, r2=0.018)
cil('garrafa_tampa', (-0.55, CY + 0.05, TOPO + 0.37), 0.024, 0.02, CREME)
caixa('garrafa_rotulo', (-0.55, CY - 0.002, TOPO + 0.12), (0.08, 0.01, 0.06), CREME, r=0.003)
# bandeja laranja cheia de bananas
caixa('bandeja', (-0.05, CY, TOPO + 0.07), (0.6, 0.36, 0.14), LARANJA, r=0.03)
caixa('bandeja_fundo', (-0.05, CY, TOPO + 0.12), (0.52, 0.28, 0.04), LARANJA2, r=0.01)
BAN = mat('banana', (0.98, 0.82, 0.2), 0.45)
for i in range(7):
    banana(f'banana{i}', (-0.05 + random.uniform(-0.18, 0.18), CY + random.uniform(-0.08, 0.08), TOPO + 0.17 + random.uniform(0, 0.06)),
           (random.uniform(1.2, 1.9), random.uniform(-0.4, 0.4), random.uniform(0, 3.1)), BAN, esc=0.85)

# mesinha lateral com rádio azul
MX, MY = 1.05, D - 0.45
caixa('mesinha_tampo', (MX, MY, 0.78), (0.7, 0.5, 0.06), MAD, r=0.02)
for i, (dx, dy) in enumerate(((-0.28, -0.18), (0.28, -0.18), (-0.28, 0.18), (0.28, 0.18))):
    caixa(f'mesinha_pe{i}', (MX + dx, MY + dy, 0.38), (0.06, 0.06, 0.76), MAD2, r=0.015)
caixa('mesinha_trave', (MX, MY, 0.25), (0.56, 0.04, 0.04), MAD2, r=0.01)
RZ = 0.81
caixa('radio', (MX, MY, RZ + 0.15), (0.48, 0.2, 0.3), AZUL, r=0.05)
toro('radio_falante_aro', (MX + 0.08, MY - 0.105, RZ + 0.14), 0.085, 0.02, ARDOSIA, rot=(math.radians(90), 0, 0))
cil('radio_falante', (MX + 0.08, MY - 0.095, RZ + 0.14), 0.085, 0.02, PRETO, rot=(math.radians(90), 0, 0))
cil('radio_falante_miolo', (MX + 0.08, MY - 0.105, RZ + 0.14), 0.03, 0.02, ARDOSIA, rot=(math.radians(90), 0, 0))
caixa('radio_visor', (MX - 0.13, MY - 0.105, RZ + 0.2), (0.14, 0.02, 0.07), CREME, r=0.01)
for i in range(3):
    caixa(f'radio_botao{i}', (MX - 0.17 + i * 0.045, MY - 0.105, RZ + 0.09), (0.03, 0.02, 0.03), CINZA_LIL, r=0.006)
caixa('radio_alca', (MX - 0.02, MY, RZ + 0.33), (0.3, 0.04, 0.04), ARDOSIA, r=0.015)
cil('radio_antena', (MX + 0.2, MY + 0.04, RZ + 0.5), 0.008, 0.45, METAL, rot=(0, math.radians(14), 0), v=12)
esfera('radio_antena_ponta', (MX + 0.255, MY + 0.04, RZ + 0.72), (0.018, 0.018, 0.018), ARDOSIA)

# ---------------- parede direita: janela com céu, varão teal com argolas e cortina vermelha
JY = 1.35
caixa('janela_moldura', (W - 0.03, JY, 1.65), (0.08, 0.95, 0.85), CINZA_LIL, r=0.06)
caixa('janela_ceu', (W - 0.075, JY, 1.65), (0.02, 0.8, 0.7), CEU, r=0.03)
for i, (dy, dz, s) in enumerate(((-0.15, -0.12, 0.12), (0.0, -0.08, 0.16), (0.16, -0.13, 0.11), (0.25, 0.15, 0.07))):
    esfera(f'nuvem{i}', (W - 0.09, JY + dy, 1.65 + dz), (0.01, s, s * 0.6), NUVEM)
cil('varao', (W - 0.2, 0.75, 2.42), 0.03, 1.9, TEAL, rot=(math.radians(90), 0, 0), v=20)
for y in (-0.2, 1.7):
    esfera(f'varao_ponta{y}', (W - 0.2, y, 2.42), (0.05, 0.05, 0.05), TEAL)
    caixa(f'varao_suporte{y}', (W - 0.1, y + (0.1 if y < 0 else -0.1), 2.42), (0.2, 0.03, 0.03), TEAL, r=0.01)
for i in range(9):
    toro(f'argola{i}', (W - 0.2, -0.05 + i * 0.2, 2.42), 0.05, 0.012, TEAL, rot=(math.radians(90), 0, 0) if False else (0, math.radians(90), 0))
cort = plano('cortina', (0, 0, 0), (1.25, 1.75), CORTINA, cortes=40,
             onda=lambda x, y: 0.07 * math.sin(x * 32) * (0.6 + 0.4 * (0.875 - y) / 1.75))
cort.rotation_euler = (math.radians(90), 0, math.radians(90)); cort.location = (W - 0.22, 0.45, 1.5)
bpy.context.view_layer.objects.active = cort; cort.modifiers.new('s', 'SOLIDIFY').thickness = 0.02
acabar(cort, CORTINA, 'cortina')

# ---------------- parede esquerda: caixa elétrica roxa e tomada
caixa('tomada_esq', (-W + 0.05, 0.9, 1.55), (0.08, 0.3, 0.3), ROXO, r=0.04)
toro('tomada_esq_aro', (-W + 0.1, 0.9, 1.55), 0.085, 0.017, CINZA_LIL, rot=(0, math.radians(90), 0))

# ---------------- caixotes
def caixote_laranja(nome, c, t=0.5):
    caixa(nome, c, (t, t, t), LARANJA, r=0.025)
    for i in range(3):  # ripas verticais mais escuras em todas as faces laterais
        o = -t / 3 + i * t / 3
        caixa(f'{nome}_ripa_f{i}', (c[0] + o, c[1] - t / 2 - 0.005, c[2]), (t / 3 - 0.05, 0.015, t - 0.08), LARANJA2, r=0.008)
        caixa(f'{nome}_ripa_l{i}', (c[0] - t / 2 - 0.005, c[1] + o, c[2]), (0.015, t / 3 - 0.05, t - 0.08), LARANJA2, r=0.008)
        caixa(f'{nome}_ripa_r{i}', (c[0] + t / 2 + 0.005, c[1] + o, c[2]), (0.015, t / 3 - 0.05, t - 0.08), LARANJA2, r=0.008)
    caixa(f'{nome}_topo', (c[0], c[1], c[2] + t / 2 + 0.005), (t - 0.08, t - 0.08, 0.015), LARANJA2, r=0.008)


def caixote_roxo(nome, c, t=0.55, face='y'):
    caixa(nome, c, (t, t, t), METAL, r=0.05)
    m = t / 2 + 0.006
    caixa(f'{nome}_f', (c[0], c[1] - m, c[2]), (t - 0.12, 0.02, t - 0.12), ROXO, r=0.02)
    caixa(f'{nome}_l', (c[0] - m, c[1], c[2]), (0.02, t - 0.12, t - 0.12), ROXO, r=0.02)
    caixa(f'{nome}_r', (c[0] + m, c[1], c[2]), (0.02, t - 0.12, t - 0.12), ROXO, r=0.02)
    caixa(f'{nome}_t', (c[0], c[1], c[2] + m), (t - 0.12, t - 0.12, 0.02), ROXO, r=0.02)
    if face == 'y':
        logo_banana(f'{nome}_logo', (c[0], c[1] - m - 0.012, c[2]), -1, t * 1.15, AMARELO)
    else:
        logo_banana(f'{nome}_logo', (c[0] + m + 0.012, c[1], c[2]), 'x', t * 1.15, AMARELO)


caixote_roxo('caixote_roxo_esq', (-2.6, 1.55, 0.275), face='x')
caixote_laranja('caixote_laranja_esq', (-2.6, 1.55, 0.8))
caixote_laranja('caixote_laranja_esq2', (-2.65, 0.95, 0.25))
caixote_laranja('caixote_laranja_dir', (2.62, 0.35, 0.8))
caixote_roxo('caixote_roxo_dir', (2.62, 0.35, 0.275), face='y')
caixote_laranja('caixote_laranja_fundo', (2.55, -1.95, 0.22), t=0.45)

# ---------------- mesa hexagonal no centro (como no jogo): borda de madeira, feltro verde, pé central
BX, BY = 0.0, 0.2
MESA_Z = 0.74
cil('mesa_tampo', (BX, BY, MESA_Z - 0.05), 0.98, 0.1, MAD_VERM, v=6, bis=0.03)
cil('mesa_borda', (BX, BY, MESA_Z + 0.005), 0.98, 0.05, MAD_VERM, v=6, bis=0.02)
cil('mesa_feltro', (BX, BY, MESA_Z + 0.012), 0.84, 0.03, FELTRO, v=6, bis=0.008)
cil('mesa_pe', (BX, BY, 0.36), 0.14, 0.6, MAD, r2=0.1, v=32)
cil('mesa_base', (BX, BY, 0.04), 0.5, 0.08, MAD, v=6, bis=0.02)
# banquinhos dos três macacos (o copo azul do macaco senta no prato do banco)
BANCO_Z = 0.36
ASSENTOS = {'cego': 252, 'surdo': 140, 'mudo': 30}  # ângulo (graus) em volta da mesa
BANCO_R = 1.32
BANCO_MAT = mat('banco', (0.62, 0.7, 0.86), 0.45)
for papel, ang in ASSENTOS.items():
    x = BX + BANCO_R * math.cos(math.radians(ang)); y = BY + BANCO_R * math.sin(math.radians(ang))
    cil(f'banco_{papel}_prato', (x, y, BANCO_Z - 0.03), 0.28, 0.06, BANCO_MAT, v=48, bis=0.02)
    cil(f'banco_{papel}_haste', (x, y, BANCO_Z / 2), 0.05, BANCO_Z, METAL, v=24)
    cil(f'banco_{papel}_pe', (x, y, 0.025), 0.24, 0.05, BANCO_MAT, v=48, bis=0.02)

# ---------------- luminária laranja pendurada
LX, LY = 0.0, 0.2
cil('luminaria_fio', (LX, LY, 2.55), 0.008, 0.5, PRETO, v=8)
cil('luminaria_canopla', (LX, LY, H - 0.03), 0.06, 0.04, ARDOSIA)
cil('luminaria_topo', (LX, LY, 2.29), 0.05, 0.06, LARANJA)
bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=0.36, radius2=0.08, depth=0.26, end_fill_type='NOTHING', location=(LX, LY, 2.2))
cup = ativo()
for v in cup.data.vertices:  # cúpula abaulada em vez de cone reto
    t = (v.co.z + 0.13) / 0.26
    k = 1 + 0.35 * math.sin(t * math.pi) * (1 - t)
    v.co.x *= k; v.co.y *= k
md = cup.modifiers.new('sub', 'SUBSURF'); md.levels = 2
cup.modifiers.new('s', 'SOLIDIFY').thickness = 0.02
acabar(cup, LARANJA, 'luminaria_cupula')
toro('luminaria_borda', (LX, LY, 2.07), 0.36, 0.014, LARANJA2)
esfera('lampada', (LX, LY, 2.1), (0.09, 0.09, 0.09), LUZ)

# ---------------- objetos no chão: chave de fenda azul e rolo de fita vermelha
caixa('chave_fenda_cabo', (-1.55, -1.35, 0.05), (0.32, 0.09, 0.09), AZUL_VIVO, r=0.04, rot=(0, 0, math.radians(-15)))
cil('chave_fenda_haste', (-1.25, -1.43, 0.05), 0.012, 0.3, METAL, rot=(0, math.radians(90), math.radians(-15)), v=12)
cil('fita_rolo', (1.55, -1.25, 0.06), 0.2, 0.12, VERMELHO, v=48, bis=0.02)
cil('fita_miolo', (1.55, -1.25, 0.061), 0.11, 0.125, mat('papelao', (0.75, 0.6, 0.42), 0.8), v=48)
cil('fita_furo', (1.55, -1.25, 0.062), 0.09, 0.13, CHAO, v=48)

# ---------------- parede da frente (o "fundo" da folha): porta, estante com caixas, grade de ventilação
caixa('porta_batente', (-0.9, -D + 0.04, 0.97), (0.95, 0.08, 1.94), ARDOSIA, r=0.05)
caixa('porta', (-0.9, -D + 0.08, 0.95), (0.82, 0.06, 1.85), CINZA_LIL, r=0.06)
caixa('porta_janela_moldura', (-0.9, -D + 0.115, 1.45), (0.45, 0.02, 0.4), ARDOSIA, r=0.08)
caixa('porta_janela', (-0.9, -D + 0.125, 1.45), (0.36, 0.01, 0.31), mat('porta_vidro', (0.55, 0.82, 0.98), 0.1, emit=0.6), r=0.06)
esfera('porta_macaneta', (-0.6, -D + 0.14, 0.95), (0.04, 0.04, 0.04), PRETO)
caixa('porta_fechadura', (-0.6, -D + 0.12, 0.85), (0.04, 0.02, 0.08), PRETO, r=0.01)
caixa('grade_vent', (1.6, -D + 0.04, 2.25), (0.6, 0.05, 0.35), CINZA_LIL, r=0.03)
for i in range(4):
    caixa(f'grade_aleta{i}', (1.6, -D + 0.07, 2.13 + i * 0.08), (0.5, 0.03, 0.03), ARDOSIA, r=0.01)
EX, EY = 0.95, -D + 0.3
for lado in (-1, 1):
    for f in (-1, 1):
        caixa(f'estante_pe{lado}{f}', (EX + lado * 0.6, EY + f * 0.2, 0.8), (0.06, 0.06, 1.6), METAL, r=0.015)
for i, z in enumerate((0.15, 0.7, 1.25)):
    caixa(f'estante_prat{i}', (EX, EY, z), (1.3, 0.48, 0.04), METAL, r=0.01)
for i, (x, z) in enumerate(((-0.3, 0.17), (0.25, 0.17), (0.0, 0.72), (-0.35, 1.27))):
    caixa(f'estante_caixa{i}', (EX + x, EY, z + 0.13), (0.42, 0.34, 0.24), LARANJA if i % 2 == 0 else AMARELO, r=0.02)
caixote_laranja('caixote_laranja_frente', (2.55, -D + 0.35, 0.25))

# ---------------- exporta a sala
bpy.ops.object.select_all(action='DESELECT')
for o in TODOS:
    o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(SAIDA, 'sala2.glb'), export_format='GLB', use_selection=True,
                          export_apply=True, export_lights=False, export_cameras=False)
SALA = list(TODOS)
TODOS.clear()

# ================= BOMBA (no centro da mesa: origem no feltro)
B0 = Vector((BX, BY, MESA_Z + 0.027))
CASE = mat('maleta', (0.5, 0.52, 0.6), 0.45)
CASE_ESC = mat('maleta_esc', (0.3, 0.32, 0.38), 0.5)
P = lambda x, y, z: (B0.x + x, B0.y + y, B0.z + z)
caixa('bomba_base', P(0, 0, 0.07), (0.92, 0.66, 0.14), CASE, r=0.05)
caixa('bomba_aro', P(0, 0, 0.145), (0.95, 0.69, 0.03), CASE_ESC, r=0.015)
pn = plano('painel', P(0, -0.02, 0.163), (0.82, 0.54), AZUL)
acabar(pn, mat('painel_mod', (0.17, 0.33, 0.66), 0.5), 'painel', liso=False)
# botões decorativos (fileiras vermelhas, brancas e amarelas como na folha) — 'deco_' pode ser escondido no three.js
for i in range(7):
    for k in range(2):
        cor = [VERMELHO, CREME, AMARELO, VERMELHO, AZUL_VIVO, CREME, VERMELHO][(i + k) % 7]
        cil(f'deco_botao{i}_{k}', P(-0.33 + i * 0.11, -0.17 + k * 0.17, 0.175), 0.028, 0.025, cor, v=20, bis=0.008)
for i in range(4):
    caixa(f'deco_tecla{i}', P(-0.28 + i * 0.19, 0.12, 0.172), (0.12, 0.06, 0.02), [VERMELHO, CREME, AMARELO, CREME][i], r=0.008)
# tampa levantada atrás, com tela verde
ang = math.radians(-12)
caixa('bomba_tampa', P(0, 0.36, 0.38), (0.92, 0.1, 0.52), CASE, r=0.05, rot=(ang, 0, 0))
caixa('bomba_tampa_moldura', P(-0.06, 0.31, 0.39), (0.56, 0.03, 0.4), PRETO, r=0.04, rot=(ang, 0, 0))
bpy.ops.mesh.primitive_plane_add(size=1, location=P(-0.06, 0.293, 0.39), rotation=(math.radians(90) + ang, 0, 0))
lcd = ativo(); lcd.scale = (0.48, 0.32, 1); bpy.ops.object.transform_apply(scale=True)
acabar(lcd, mat('lcd', (0.35, 0.95, 0.35), 0.3, emit=1.6), 'lcd', liso=False)
for lado in (-1, 1):
    cil(f'bomba_dobradica{lado}', P(lado * 0.3, 0.33, 0.13), 0.035, 0.12, CASE_ESC, rot=(0, math.radians(90), 0), v=20)
# feixe de fios coloridos no lado direito da tampa
for i, cor in enumerate((VERMELHO, AMARELO, AZUL_VIVO, VERDE, LARANJA, ROXO)):
    dz = i * 0.05
    tubo(f'bomba_fio{i}', [P(0.26, 0.3, 0.2 + dz), P(0.36, 0.24, 0.3 + dz), P(0.33, 0.27, 0.42 + dz * 0.6), P(0.4, 0.3, 0.55 - dz * 0.4)], 0.016, cor)
# pino com botão vermelho no topo da tampa
cil('bomba_pino', P(0.32, 0.4, 0.66), 0.03, 0.1, PRETO)
esfera('bomba_pino_botao', P(0.32, 0.4, 0.72), (0.05, 0.05, 0.04), VERMELHO)
bpy.ops.object.select_all(action='DESELECT')
for o in TODOS:
    o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(SAIDA, 'bomba2.glb'), export_format='GLB', use_selection=True,
                          export_apply=True, export_lights=False, export_cameras=False)
print('ok sala2.glb bomba2.glb')

if '--previa' in sys.argv:
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 64; sc.cycles.use_denoising = True
    sc.view_settings.view_transform = 'Standard'
    sc.render.resolution_x, sc.render.resolution_y = 1280, 720
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); bpy.context.collection.objects.link(cam)
    sc.camera = cam; cam.data.lens = 20
    sc.world = bpy.data.worlds.new('w'); sc.world.color = (0.08, 0.1, 0.2)
    def luz(nome, tipo, loc, e, cor=(1, 1, 1), tam=1.0):
        L = bpy.data.objects.new(nome, bpy.data.lights.new(nome, tipo)); bpy.context.collection.objects.link(L)
        L.location = loc; L.data.energy = e; L.data.color = cor
        if tipo == 'AREA':
            L.data.size = tam
        return L
    luz('lampada_l', 'POINT', (LX, LY, 1.98), 180, (1, 0.8, 0.55)).data.shadow_soft_size = 0.1
    a = luz('preenche', 'AREA', (0, -1.8, 2.5), 260, (0.85, 0.9, 1), 3.5); a.rotation_euler = (math.radians(35), 0, 0)
    _j = luz('janela_l', 'AREA', (W - 0.4, JY, 1.65), 25, (0.7, 0.85, 1), 0.8); _j.rotation_euler = (0, math.radians(-90), 0)
    luz('canto', 'POINT', (-2.0, 1.2, 2.2), 50, (0.8, 0.85, 1))
    for papel, ang in ASSENTOS.items():
        x = BX + BANCO_R * math.cos(math.radians(ang)); y = BY + BANCO_R * math.sin(math.radians(ang))
        antes = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=os.path.join(SAIDA, f'macaco3_{papel}.glb'))
        raiz = next(o for o in bpy.data.objects if o not in antes and o.name.startswith('macaco'))
        raiz.location = (x, y, BANCO_Z); raiz.scale = (1.35,) * 3; raiz.rotation_mode = 'XYZ'
        dx, dy = BX - x, BY - y
        raiz.rotation_euler = (0, 0, math.atan2(dx, -dy))
    def mirar(c, alvo):
        d = Vector(alvo) - c.location
        c.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    vistas = {'previa_sala2': ((-0.9, -2.3, 1.55), (math.radians(78), 0, math.radians(-14))),
              'previa_sala2_fundo': ((0.2, 2.0, 1.6), (math.radians(80), 0, math.radians(180)))}
    ca = math.radians(ASSENTOS['cego'])
    vistas['previa_jogo'] = ((BX + 2.45 * math.cos(ca) - 0.2, BY + 2.45 * math.sin(ca), 2.05), None)
    vistas['previa_jogo_mudo'] = ((BX + 2.3 * math.cos(math.radians(205)), BY + 2.3 * math.sin(math.radians(205)), 1.9), None)
    for nome, (loc, rot) in vistas.items():
        cam.location = loc
        if rot is None:
            bpy.context.view_layer.update(); mirar(cam, (BX + 0.1, BY + 0.25, 0.85))
        else:
            cam.rotation_euler = rot
        sc.render.filepath = os.path.join(SAIDA, nome + '.png')
        bpy.ops.render.render(write_still=True)
    print('previa ok')
