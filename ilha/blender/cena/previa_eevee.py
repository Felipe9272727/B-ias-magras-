import bpy, os, sys, math, mathutils
sys.path.append(os.path.dirname(__file__)); sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'assets'))
from terreno import criar_ilha, exportar_dados
from util import mat_cor
SAIDA = '/tmp/claude-0/-home-user-B-ias-magras-/1ec1e0ad-a38d-55a9-9e93-6eda9da8f7bf/scratchpad/'
bpy.ops.wm.read_factory_settings(use_empty=True)
exportar_dados(os.path.join(os.path.dirname(__file__), '..', '..', 'dados', 'ilha.json'))
criar_ilha()
bpy.ops.mesh.primitive_plane_add(size=1200, location=(0, 0, 0.05)); mar = bpy.context.object
m = mat_cor('mar', (0.15, 0.55, 0.78), rough=0.25); mar.data.materials.append(m)
sc = bpy.context.scene
w = bpy.data.worlds.new('ceu'); sc.world = w; w.use_nodes = True
bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.45, 0.68, 0.95, 1); bg.inputs[1].default_value = 0.9
bpy.ops.object.light_add(type='SUN'); sol = bpy.context.object; sol.rotation_euler = (math.radians(50), math.radians(10), math.radians(35)); sol.data.energy = 4.5; sol.data.angle = math.radians(3)
bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam
sc.render.engine = 'BLENDER_EEVEE_NEXT'; sc.eevee.taa_render_samples = 16
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'
sc.render.resolution_x, sc.render.resolution_y = 1600, 900
for nome, loc, alvo in [('topo', (0, -1, 360), (0, 0, 0)), ('aerea', (170, -250, 160), (0, 5, 0))]:
    cam.location = loc; cam.data.lens = 35
    cam.rotation_euler = (mathutils.Vector(alvo) - mathutils.Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = SAIDA + f'ilhaE_{nome}.png'; bpy.ops.render.render(write_still=True)
print('OK')
