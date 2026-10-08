import bpy, sys, time
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.mesh.primitive_plane_add(size=20)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, location=(0,0,1))
bpy.ops.mesh.primitive_cone_add(vertices=6, location=(3,0,1.5), depth=3)
bpy.ops.object.light_add(type='SUN', location=(5,5,10)); bpy.context.object.data.energy=4
bpy.ops.object.camera_add(location=(10,-10,8), rotation=(1.0,0,0.78)); sc.camera=bpy.context.object
w = bpy.data.worlds.new("w"); sc.world = w; w.color=(0.5,0.7,1.0)
sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
eng = sys.argv[-1]
sc.render.engine = eng
if eng == 'CYCLES':
    sc.cycles.device='CPU'; sc.cycles.samples=16; sc.cycles.use_denoising=True
sc.render.filepath = f'/tmp/claude-0/-home-user-B-ias-magras-/1ec1e0ad-a38d-55a9-9e93-6eda9da8f7bf/scratchpad/bl_{eng}.png'
t=time.time(); bpy.ops.render.render(write_still=True); print('RENDER_OK', eng, round(time.time()-t,2),'s')
