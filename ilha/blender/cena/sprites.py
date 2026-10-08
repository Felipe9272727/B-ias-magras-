"""Sprites PNG (RGBA, fundo transparente) dos 12 tributos, para o Remotion animar sobre o mapa isometrico.

Saida: video/remotion/public/ilha/sprites/<id>_<pose>.png (256x256, camera ortografica isometrica)
       video/remotion/public/ilha/sprites/<id>_retrato.png (384x384, busto, camera perspectiva frontal)

Lista de tributos, empresas, cores e seeds (indice + 3) vem de tomadas.TRIBUTOS, para bater com as outras cenas.
Camera isometrica: 35 graus de elevacao, 45 graus de azimute. Escala ortografica unica para todos (calibrada
pelo tributo mais alto em pe, que ocupa 75% da altura). Pes a 10% da base.

Uso: xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P ilha/blender/cena/sprites.py
"""
import math
import os
import sys

import bpy
from mathutils import Vector

try:
    AQUI = os.path.dirname(os.path.abspath(__file__))
except NameError:  # execucao sem __file__
    AQUI = "/home/user/B-ias-magras-/ilha/blender/cena"
sys.path.append(AQUI)
sys.path.append(os.path.join(AQUI, "..", "assets"))
import personagens as P  # noqa: E402
from tomadas import TRIBUTOS  # noqa: E402
from util import hexrgb  # noqa: E402

SAIDA = os.path.normpath(os.path.join(AQUI, "..", "..", "..", "video", "remotion", "public", "ilha", "sprites"))
POSES = ["parado", "andando_a", "andando_b", "atacando", "coletando", "sentado", "dormindo", "morto", "acenando"]
ITEM_POR_POSE = {"atacando": "lanca"}

ISO_ELEV = math.radians(35)
ISO_AZ = math.radians(45)
ISO_RES = 256
RETRATO_RES = 384
ALTURA_FIG = 0.75   # fracao da altura do frame ocupada pelo boneco de 1,8 m
PES_BASE = 0.10     # pes a 10% da base do frame
DIST_CAM = 30.0     # so afasta a camera (ortografica nao depende disso)


def direcao_iso():
    """p: direcao da camera ao alvo (de alvo para camera). u: vetor 'cima' da camera (perpendicular a p)."""
    el, az = ISO_ELEV, ISO_AZ
    p = Vector((math.cos(el) * math.sin(az), -math.cos(el) * math.cos(az), math.sin(el)))
    u = Vector((-math.sin(el) * math.sin(az), math.sin(el) * math.cos(az), math.cos(el)))
    return p, u


def apagar(ob):
    """Remove objeto e a malha dele (para nao acumular dados entre renders)."""
    malha = ob.data
    bpy.data.objects.remove(ob, do_unlink=True)
    if malha is not None and malha.users == 0:
        bpy.data.meshes.remove(malha)


def preparar_cena():
    """Renderizacao EEVEE com fundo transparente, PNG RGBA, luz suave e mundo claro."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    r = sc.render
    r.engine = "BLENDER_EEVEE_NEXT"
    sc.eevee.taa_render_samples = 16
    r.film_transparent = True
    r.image_settings.file_format = "PNG"
    r.image_settings.color_mode = "RGBA"
    r.image_settings.color_depth = "8"
    r.resolution_percentage = 100
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Punchy"

    mundo = bpy.data.worlds.new("mundo_sprites")
    mundo.use_nodes = True
    fundo = mundo.node_tree.nodes["Background"]
    fundo.inputs["Color"].default_value = (0.9, 0.92, 0.95, 1.0)
    fundo.inputs["Strength"].default_value = 1.0
    sc.world = mundo

    # sol suave (angulo grande = sombras macias), vindo da frente-esquerda e de cima
    luz = bpy.data.lights.new("sol", "SUN")
    luz.energy = 3.0
    luz.angle = math.radians(10)
    luz.color = (1.0, 0.97, 0.92)
    ob = bpy.data.objects.new("sol", luz)
    sc.collection.objects.link(ob)
    ps = Vector((math.cos(math.radians(50)) * math.sin(math.radians(-30)),
                 -math.cos(math.radians(50)) * math.cos(math.radians(-30)),
                 math.sin(math.radians(50))))
    ob.rotation_euler = (-ps).to_track_quat("-Z", "Y").to_euler()
    return sc


def calibrar_escala(sc, u):
    """Escala ortografica tal que o boneco em pe mais alto ocupe ALTURA_FIG do frame (medida na vertical da camera)."""
    maior = 0.0
    for i, (tid, emp, cor) in enumerate(TRIBUTOS):
        ob = P.criar_tributo(f"ref_{tid}", emp, hexrgb(cor), pose="parado", seed=i + 3)
        proj = [(ob.matrix_world @ v.co).dot(u) for v in ob.data.vertices]
        maior = max(maior, max(proj) - min(proj))
        apagar(ob)
    return maior / ALTURA_FIG


def criar_cameras(sc, S, p, u):
    """Camera isometrica ortografica (alvo deslocado para o pe ficar a 10% da base) e camera de retrato."""
    alvo_iso = u * (S * (0.5 - PES_BASE))  # centro do frame acima da origem (pes)
    dados_iso = bpy.data.cameras.new("cam_iso")
    dados_iso.type = "ORTHO"
    dados_iso.ortho_scale = S
    dados_iso.clip_start, dados_iso.clip_end = 0.1, 100.0
    cam_iso = bpy.data.objects.new("cam_iso", dados_iso)
    sc.collection.objects.link(cam_iso)
    cam_iso.location = alvo_iso + p * DIST_CAM
    cam_iso.rotation_euler = (alvo_iso - cam_iso.location).to_track_quat("-Z", "Y").to_euler()

    # retrato: frontal (o boneco olha para -Y), 50 mm, busto de z~0,9 a z~1,95
    dados_ret = bpy.data.cameras.new("cam_retrato")
    dados_ret.lens = 50
    dados_ret.clip_start, dados_ret.clip_end = 0.05, 50.0
    cam_ret = bpy.data.objects.new("cam_retrato", dados_ret)
    sc.collection.objects.link(cam_ret)
    alvo_ret = Vector((0.0, 0.0, 1.42))
    cam_ret.location = alvo_ret + Vector((0.0, -1.6, 0.0))
    cam_ret.rotation_euler = (alvo_ret - cam_ret.location).to_track_quat("-Z", "Y").to_euler()
    return cam_iso, cam_ret


def render(sc, cam, res, caminho, ob):
    sc.camera = cam
    sc.render.resolution_x = sc.render.resolution_y = res
    sc.render.filepath = caminho
    bpy.ops.render.render(write_still=True)
    apagar(ob)
    print("SPRITE", caminho, flush=True)


if __name__ == "__main__":
    os.makedirs(SAIDA, exist_ok=True)
    sc = preparar_cena()
    p, u = direcao_iso()
    S = calibrar_escala(sc, u)
    cam_iso, cam_ret = criar_cameras(sc, S, p, u)
    print(f"ortho_scale={S:.4f}", flush=True)

    total = 0
    for i, (tid, emp, cor) in enumerate(TRIBUTOS):
        seed = i + 3
        rgb = hexrgb(cor)
        for pose in POSES:
            ob = P.criar_tributo(f"{tid}_{pose}", emp, rgb, pose=pose, item=ITEM_POR_POSE.get(pose), seed=seed)
            render(sc, cam_iso, ISO_RES, os.path.join(SAIDA, f"{tid}_{pose}.png"), ob)
            total += 1
        ob = P.criar_tributo(f"{tid}_retrato", emp, rgb, pose="parado", seed=seed)
        render(sc, cam_ret, RETRATO_RES, os.path.join(SAIDA, f"{tid}_retrato.png"), ob)
        total += 1
    print(f"CONCLUIDO {total} PNGs em {SAIDA}", flush=True)
