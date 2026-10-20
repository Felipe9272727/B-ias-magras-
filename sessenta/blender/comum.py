"""Peças comuns dos renders do 60 Segundos das IAs (copiado do Overcooked): câmera ortográfica inclinada, luz,
materiais e primitivas."""
import bpy, math, os, subprocess, tempfile
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
PUBLIC = os.path.join(RAIZ, 'video', 'remotion', 'public', 'sessenta')
TMP = tempfile.mkdtemp(prefix='s60_quadros_')
PX = 220          # pixels por metro (o Remotion reduz para o tamanho da casa)
ELEV = 55         # graus da câmera acima do horizonte


def limpar():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(nome, cor, rough=0.5, metal=0.0, emit=0.0):
    m = bpy.data.materials.get(nome) or bpy.data.materials.new(nome)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    lin = tuple(c ** 2.2 for c in cor)  # as cores são escritas em sRGB; o Blender trabalha em linear
    b.inputs['Base Color'].default_value = (*lin, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*lin, 1)
        b.inputs['Emission Strength'].default_value = emit
    return m


def _fim(o, m, pai, rot=None):
    o.data.materials.append(m)
    for p in o.data.polygons:
        p.use_smooth = len(p.vertices) == 4  # tampas (n-gons) ficam planas
    if pai is not None:
        o.parent = pai
    if rot:
        o.rotation_euler = rot
    return o


def esfera(nome, loc, esc, m, pai=None, rot=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, location=loc)
    o = bpy.context.active_object
    o.name = nome
    o.scale = esc
    return _fim(o, m, pai, rot)


def cubo(nome, loc, meia, m, pai=None, rot=None, bisel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    o = bpy.context.active_object
    o.name = nome
    o.scale = meia
    if bisel:
        md = o.modifiers.new('bisel', 'BEVEL'); md.width = bisel; md.segments = 3
    o.data.materials.append(m)
    if pai is not None:
        o.parent = pai
    if rot:
        o.rotation_euler = rot
    return o


def cilindro(nome, loc, raio, alt, m, pai=None, rot=None, verts=40):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=raio, depth=alt, location=loc)
    o = bpy.context.active_object
    o.name = nome
    return _fim(o, m, pai, rot)


def cena_sprite(larg, alt, teste=False, alvo=(0, 0, 0.75), px_m=None, amostras=16):
    """Câmera ortográfica olhando de frente-cima (de -Y), luz de cozinha, fundo transparente, Eevee."""
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_EEVEE_NEXT'
    sc.eevee.taa_render_samples = 4 if teste else amostras
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    px = (px_m or PX) * (0.5 if teste else 1)
    sc.render.resolution_x = int(larg * px)
    sc.render.resolution_y = int(alt * px)
    sc.render.resolution_percentage = 100
    sc.view_settings.view_transform = 'Standard'
    w = bpy.data.worlds.new('mundo'); sc.world = w
    w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.75, 0.78, 0.85, 1)
    w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.55
    bpy.ops.object.camera_add()
    cam = bpy.context.active_object
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = max(larg, alt)
    if alt > larg:
        sc.render.resolution_x, sc.render.resolution_y = int(larg * px), int(alt * px)
    e = math.radians(ELEV)
    d = 20
    cam.location = Vector(alvo) + Vector((0, -d * math.cos(e), d * math.sin(e)))
    cam.rotation_euler = (math.pi / 2 - e, 0, 0)
    sc.camera = cam
    bpy.ops.object.light_add(type='SUN', location=(0, 0, 10))
    sol = bpy.context.active_object
    sol.data.energy = 2.4
    sol.rotation_euler = (math.radians(40), math.radians(-25), math.radians(-30))
    sol.data.angle = math.radians(12)
    bpy.ops.object.light_add(type='AREA', location=(-3, -4, 5))
    ar = bpy.context.active_object
    ar.data.energy = 120; ar.data.size = 6
    ar.rotation_euler = (math.radians(50), 0, math.radians(-35))
    return sc


def ponto_na_tela(sc, cam, p):
    """Pixel (x, y a partir do topo) onde o ponto 3D p aparece no quadro."""
    from bpy_extras.object_utils import world_to_camera_view
    v = world_to_camera_view(sc, cam, Vector(p))
    return [round(v.x * sc.render.resolution_x, 1), round((1 - v.y) * sc.render.resolution_y, 1)]


def juntar_tira(quadros, saida):
    """Junta os quadros PNG numa tira horizontal (usa o Python do sistema, que tem o PIL)."""
    os.makedirs(os.path.dirname(saida), exist_ok=True)
    cod = ('import sys\nfrom PIL import Image\nfs=sys.argv[2:]\nims=[Image.open(f) for f in fs]\nw,h=ims[0].size\n'
           't=Image.new("RGBA",(w*len(ims),h),(0,0,0,0))\nfor i,im in enumerate(ims): t.paste(im,(i*w,0))\nt.save(sys.argv[1],optimize=True)')
    subprocess.run(['/usr/bin/python3', '-c', cod, saida, *quadros], check=True)
    for f in quadros:
        os.remove(f)
