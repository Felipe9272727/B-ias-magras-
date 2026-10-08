"""Utilitários comuns dos assets low-poly (importar com: import sys, os; sys.path.append(os.path.dirname(__file__)); from util import *)."""
import bpy


def mat_cor(nome, rgb, rough=0.9, emissao=0.0):
    """Material simples de cor sólida (reutiliza se já existir com esse nome). rgb em 0..1 (sRGB aproximado)."""
    m = bpy.data.materials.get(nome)
    if m:
        return m
    m = bpy.data.materials.new(nome)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    cor = (rgb[0] ** 2.2, rgb[1] ** 2.2, rgb[2] ** 2.2, 1.0)  # sRGB -> linear
    b.inputs['Base Color'].default_value = cor
    b.inputs['Roughness'].default_value = rough
    if emissao > 0:
        b.inputs['Emission Color'].default_value = cor
        b.inputs['Emission Strength'].default_value = emissao
    m.diffuse_color = (rgb[0], rgb[1], rgb[2], 1.0)  # cor usada pelo Workbench (color_type MATERIAL)
    return m


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def flat(obj):
    for p in obj.data.polygons:
        p.use_smooth = False


def limpar_cena():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def previa(caminho, objetos=None, dist=None, alvo=(0, 0, 0.8), res=(1600, 900)):
    """Câmera 3/4, sol, fundo céu e render Workbench para conferir os assets."""
    import mathutils
    sc = bpy.context.scene
    objs = objetos or [o for o in sc.objects if o.type == 'MESH']
    xs = [v for o in objs for v in (o.location.x,)]
    largura = (max(xs) - min(xs) + 4) if xs else 6
    d = dist or max(6, largura * 0.9)
    cx = (max(xs) + min(xs)) / 2 if xs else 0
    alvo = mathutils.Vector((cx, alvo[1], alvo[2]))
    cam_loc = alvo + mathutils.Vector((0, -d, d * 0.55))
    bpy.ops.object.camera_add(location=cam_loc)
    cam = bpy.context.object
    cam.rotation_euler = (alvo - cam_loc).to_track_quat('-Z', 'Y').to_euler()
    cam.data.lens = 40
    sc.camera = cam
    bpy.ops.object.light_add(type='SUN', location=(4, -4, 10))
    bpy.context.object.data.energy = 3
    bpy.ops.mesh.primitive_plane_add(size=400, location=(cx, 0, 0))
    chao = bpy.context.object
    chao.data.materials.append(mat_cor('chao_previa', (0.86, 0.80, 0.62)))
    w = bpy.data.worlds.new('ceu') if not sc.world else sc.world
    sc.world = w
    w.color = (0.55, 0.75, 0.95)
    sc.render.engine = 'BLENDER_WORKBENCH'
    sh = sc.display.shading
    sh.light = 'STUDIO'
    sh.color_type = 'MATERIAL'
    sh.show_shadows = True
    sh.show_cavity = True
    sh.show_object_outline = True
    sh.background_type = 'WORLD'
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.filepath = caminho
    bpy.ops.render.render(write_still=True)
    print('PREVIA', caminho)
