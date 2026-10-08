import bpy, os, sys, math, mathutils, time
sys.path.append(os.path.dirname(__file__))
from mar import criar_mar, ceu, raio
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
criar_mar()
ceu(True)
bpy.ops.object.light_add(type='SUN'); sol = bpy.context.object; sol.rotation_euler = (math.radians(70), 0, math.radians(160))
sol.data.color = (0.75, 0.82, 1.0); raio(sol, [30], base=2.2, pico=12)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 2)); nav = bpy.context.object; nav.scale = (22, 5, 4)
bpy.ops.object.camera_add(location=(45, -55, 7)); cam = bpy.context.object; sc.camera = cam; cam.data.lens = 35
cam.rotation_euler = (mathutils.Vector((0, 0, 2)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
sc.render.engine = 'BLENDER_EEVEE_NEXT'; sc.eevee.taa_render_samples = 12
sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'
sc.render.resolution_x, sc.render.resolution_y = 1280, 720
S = '/tmp/claude-0/-home-user-B-ias-magras-/1ec1e0ad-a38d-55a9-9e93-6eda9da8f7bf/scratchpad/'
for f in (10, 30):
    sc.frame_set(f); sc.render.filepath = S + f'mar_{f}.png'; t = time.time(); bpy.ops.render.render(write_still=True); print('T', f, round(time.time() - t, 1))
