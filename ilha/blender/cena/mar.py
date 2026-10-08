"""Oceano low-poly (modificador Ocean do Blender, resolução baixa + faces chapadas) e céu de tempestade/dia."""
import bpy, math, os, sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'assets'))
from util import mat_cor


def criar_mar(nome='Mar', tamanho=240, tempestade=True, resolucao=14):
    bpy.ops.mesh.primitive_plane_add(size=2)
    ob = bpy.context.object
    ob.name = nome
    mod = ob.modifiers.new('ocean', 'OCEAN')
    mod.geometry_mode = 'GENERATE'
    mod.size = 1.0
    mod.spatial_size = int(tamanho)
    mod.resolution = resolucao
    mod.repeat_x = mod.repeat_y = 1
    mod.wave_scale = 8.0 if tempestade else 0.7
    mod.choppiness = 1.8 if tempestade else 0.6
    mod.wind_velocity = 34 if tempestade else 9
    mod.wave_alignment = 0.4
    mod.wave_scale_min = 0.6
    mod.random_seed = 4
    # tempo animado: 1 s de oceano por segundo de vídeo
    mod.time = 0
    mod.keyframe_insert('time', frame=1)
    mod.time = 400 / 24
    mod.keyframe_insert('time', frame=401)
    for fc in ob.animation_data.action.fcurves:
        for k in fc.keyframe_points:
            k.interpolation = 'LINEAR'
    cor = (0.13, 0.33, 0.45) if tempestade else (0.15, 0.55, 0.78)
    ob.data.materials.append(mat_cor('mar_tempestade' if tempestade else 'mar_dia', cor, rough=0.12))
    bpy.ops.object.shade_flat()
    # faces chapadas também na malha gerada pelo oceano (visual low-poly)
    es = ob.modifiers.new('facetas', 'EDGE_SPLIT')
    es.split_angle = 0
    return ob


def ceu(tempestade=True, forca=None):
    sc = bpy.context.scene
    w = bpy.data.worlds.new('ceu_t' if tempestade else 'ceu_d')
    sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    bg.inputs[0].default_value = (0.06, 0.08, 0.12, 1) if tempestade else (0.45, 0.68, 0.95, 1)
    bg.inputs[1].default_value = forca if forca is not None else (1.0 if tempestade else 0.9)
    if tempestade:
        # neblina volumétrica leve dá profundidade ao mar escuro
        return w  # (neblina volumétrica desligada: escurecia tudo no EEVEE)
        vol = w.node_tree.nodes.new('ShaderNodeVolumePrincipled')
        vol.inputs['Density'].default_value = 0.0035
        vol.inputs['Color'].default_value = (0.35, 0.42, 0.5, 1)
        w.node_tree.links.new(vol.outputs[0], w.node_tree.nodes['World Output'].inputs['Volume'])
    return w


def raio(sol, quadros, base=0.25, pico=9.0):
    """Relâmpagos: picos curtos na energia da luz nos quadros dados."""
    sol.data.energy = base
    sol.data.keyframe_insert('energy', frame=1)
    for q in quadros:
        for dq, e in [(-1, base), (0, pico), (1, base * 2), (2, pico * 0.7), (4, base)]:
            sol.data.energy = e
            sol.data.keyframe_insert('energy', frame=q + dq)
