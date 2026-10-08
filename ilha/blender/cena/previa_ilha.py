import bpy, os, sys, math
sys.path.append(os.path.dirname(__file__)); sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'assets'))
from terreno import criar_ilha, exportar_dados
from util import mat_cor
SAIDA = '/tmp/claude-0/-home-user-B-ias-magras-/1ec1e0ad-a38d-55a9-9e93-6eda9da8f7bf/scratchpad/'
bpy.ops.wm.read_factory_settings(use_empty=True)
exportar_dados(os.path.join(os.path.dirname(__file__), '..', '..', 'dados', 'ilha.json'))
ilha = criar_ilha()
bpy.ops.mesh.primitive_plane_add(size=900, location=(0, 0, 0.05))
mar = bpy.context.object; mar.data.materials.append(mat_cor('mar', (0.22, 0.62, 0.82)))
sc = bpy.context.scene
w = bpy.data.worlds.new('ceu'); sc.world = w; w.color = (0.55, 0.78, 0.97)
bpy.ops.object.light_add(type='SUN', location=(0, 0, 50)); sol = bpy.context.object; sol.rotation_euler = (math.radians(40), math.radians(15), math.radians(30)); sol.data.energy = 3
bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam
sc.render.engine = 'BLENDER_WORKBENCH'
sh = sc.display.shading; sh.light = 'STUDIO'; sh.color_type = 'MATERIAL'; sh.show_shadows = True; sh.show_cavity = True; sh.background_type = 'WORLD'
sc.render.resolution_x, sc.render.resolution_y = 1600, 900
import mathutils
for nome, loc, alvo, lente in [('topo', (0, -1, 330), (0, 0, 0), 35), ('aerea', (150, -230, 150), (0, 5, 0), 35)]:
    cam.location = loc; cam.data.lens = lente
    cam.rotation_euler = (mathutils.Vector(alvo) - mathutils.Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = SAIDA + f'ilha_{nome}.png'; bpy.ops.render.render(write_still=True)
print('OK')
