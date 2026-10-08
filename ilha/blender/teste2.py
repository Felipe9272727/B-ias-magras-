import bpy, sys, time
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
for i in range(40):
    bpy.ops.mesh.primitive_cone_add(vertices=6, location=((i%8)*2-8,(i//8)*2-4,1), depth=2)
bpy.ops.mesh.primitive_plane_add(size=40)
bpy.ops.object.light_add(type='SUN', location=(5,5,10)); bpy.context.object.data.energy=4
bpy.ops.object.camera_add(location=(14,-14,10), rotation=(1.0,0,0.78)); sc.camera=bpy.context.object
sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
eng=sys.argv[-1]; sc.render.engine=eng
if eng=='BLENDER_EEVEE_NEXT': sc.eevee.taa_render_samples=8
else: sc.cycles.device='CPU'; sc.cycles.samples=6; sc.cycles.use_denoising=True; sc.cycles.denoiser='OPENIMAGEDENOISE'; sc.render.resolution_percentage=67
sc.frame_start, sc.frame_end = 1, 4
sc.render.filepath='/tmp/claude-0/-home-user-B-ias-magras-/1ec1e0ad-a38d-55a9-9e93-6eda9da8f7bf/scratchpad/anim_'+eng+'_'
ts=[]
def pre(s): ts.append(time.time())
bpy.app.handlers.render_pre.append(pre)
t=time.time(); bpy.ops.render.render(animation=True); ts.append(time.time())
print('TEMPOS', eng, [round(b-a,1) for a,b in zip(ts,ts[1:])])
