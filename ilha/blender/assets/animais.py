"""Animais low-poly, estilo jogo mobile (fofos, olhos pretos com brilho branco).

Funcoes: criar_caranguejo, criar_javali, criar_coelho, criar_gaivota, criar_cobra, criar_peixe,
criar_tartaruga, criar_macaco. Assinatura: (nome, seed=0, pose="parado", **opcoes).
Poses: "parado" | "andando" | "morto" (morto = deitado de lado, ou de barriga pra cima quando o bicho
e de casco/ave/cobra/peixe).

Convencoes: 1 unidade = 1 m, origem no chao (z=0), centrado em x/y, flat shading.
Frente do bicho = -Y. Materiais via util.mat_cor. Variacao de tom/tamanho por seed.

Previa: xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P ilha/blender/assets/animais.py
"""
import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from util import flat, limpar_cena, mat_cor  # noqa: E402

POSES = ("parado", "andando", "morto")
_ROT_COSTAS = Matrix.Rotation(math.pi, 4, "X")   # de barriga pra cima
_ROT_LADO = Matrix.Rotation(math.pi / 2, 4, "Y")  # deitado de lado


# ---------------------------------------------------------------- primitivas

def _checar_pose(pose):
    if pose not in POSES:
        raise ValueError(f"pose invalida: {pose!r} (use {POSES})")


def _var(rgb, rng, amp=0.07):
    k = 1 + rng.uniform(-amp, amp)
    return tuple(min(1.0, max(0.0, c * k)) for c in rgb)


def _mats(nome, seed, cores):
    m = {k: mat_cor(f"bicho_{nome}_{seed}_{k}", c) for k, c in cores.items()}
    m["preto"] = mat_cor("bicho_olho_preto", (0.03, 0.03, 0.03), rough=0.4)
    m["brilho"] = mat_cor("bicho_olho_brilho", (1.0, 1.0, 1.0), rough=0.3)
    return m


def _malha(fn):
    bm = bmesh.new()
    fn(bm)
    bm.normal_update()
    me = bpy.data.meshes.new("malha_bicho")
    bm.to_mesh(me)
    bm.free()
    return me


def _objeto(me, loc=(0, 0, 0), rot=(0, 0, 0), tam=(1, 1, 1), mat=None):
    if mat is not None:
        me.materials.append(mat)
    ob = bpy.data.objects.new("parte_bicho", me)
    ob.location = loc
    ob.rotation_euler = rot
    ob.scale = tam
    bpy.context.scene.collection.objects.link(ob)
    return ob


def _esfera(loc, tam, mat, seg=6, rot=(0, 0, 0)):
    def fn(bm):
        bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=max(3, seg // 2 + 1), radius=1.0)
    return _objeto(_malha(fn), loc, rot, tam, mat)


def _caixa(loc, tam, mat, rot=(0, 0, 0)):
    return _objeto(_malha(lambda bm: bmesh.ops.create_cube(bm, size=1.0)), loc, rot, tam, mat)


def _tubo(p0, p1, r0, r1, mat, seg=5):
    """Cone/cilindro de p0 (raio r0) ate p1 (raio r1)."""
    a, b = Vector(p0), Vector(p1)
    d = b - a
    comp = d.length
    me = _malha(lambda bm: bmesh.ops.create_cone(
        bm, cap_ends=True, cap_tris=False, segments=seg, radius1=r0, radius2=r1, depth=comp))
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_euler()
    return _objeto(me, tuple((a + b) / 2), tuple(rot), (1, 1, 1), mat)


def _poli(pts, mat):
    """Face plana (barbatana, asa, cauda) com os pontos dados."""
    def fn(bm):
        vs = [bm.verts.new(p) for p in pts]
        bm.faces.new(vs)
    return _objeto(_malha(fn), mat=mat)


def _olho(x, y, z, r, m):
    """Olho preto com brilho branco, voltado para a frente (-Y)."""
    return [
        _esfera((x, y, z), (r, r, r), m["preto"], seg=6),
        _esfera((x + 0.4 * r, y - 0.75 * r, z + 0.4 * r), (0.35 * r,) * 3, m["brilho"], seg=4),
    ]


def _marcha(pose, n):
    """Angulos de balanco das pernas (n=2 ou 4; trote diagonal: FL,FR,BL,BR)."""
    a = 0.35 if pose == "andando" else 0.0
    return [a, -a] if n == 2 else [a, -a, -a, a]


def _patas(pivos, comp, r, mat, angulos):
    """Pernas: cada uma sai do pivo e desce `comp`, inclinada em torno do eixo X pelo angulo."""
    partes, pes = [], []
    for (x, y, z), ang in zip(pivos, angulos):
        p0 = Vector((x, y, z))
        p1 = p0 + Vector((0, math.sin(ang), -math.cos(ang))) * comp
        partes.append(_tubo(p0, p1, r, r * 0.75, mat))
        pes.append(p1)
    return partes, pes


def _rot_morto(pose, costas=False):
    if pose != "morto":
        return None
    return _ROT_COSTAS if costas else _ROT_LADO


def _montar(nome, partes, rot=None, escala=1.0):
    """Junta as partes, aplica rotacao/escala, assenta no chao (z=0) e centra em x/y."""
    vl = bpy.context.view_layer
    vl.update()  # atualiza matrix_world das partes recem criadas (senao o join ignora loc/rot/escala)
    bpy.ops.object.select_all(action="DESELECT")
    for p in partes:
        p.select_set(True)
    vl.objects.active = partes[0]
    bpy.ops.object.join()
    vl.update()
    ob = vl.objects.active
    ob.name = nome
    me = ob.data
    me.transform(ob.matrix_world)          # join deixa os vertices no espaco local do ativo
    ob.matrix_world = Matrix.Identity(4)
    if rot is not None:
        me.transform(rot)
    if escala != 1.0:
        me.transform(Matrix.Scale(escala, 4))
    xs = [v.co.x for v in me.vertices]
    ys = [v.co.y for v in me.vertices]
    zs = [v.co.z for v in me.vertices]
    cx, cy = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2
    me.transform(Matrix.Translation((-cx, -cy, -min(zs))))
    flat(ob)
    return ob


def contar_tris(ob):
    return sum(max(0, len(p.vertices) - 2) for p in ob.data.polygons)


# ---------------------------------------------------------------- animais

def criar_caranguejo(nome, seed=0, pose="parado", **opcoes):
    _checar_pose(pose)
    rng = random.Random(seed)
    m = _mats(nome, seed, {"casca": _var((0.90, 0.32, 0.25), rng),
                           "perna": _var((0.72, 0.20, 0.16), rng)})
    esc = rng.uniform(0.93, 1.07)
    lift = 0.03 if pose == "andando" else 0.0
    partes = [_esfera((0, 0, 0.055), (0.10, 0.075, 0.042), m["casca"])]
    for i, yi in enumerate((-0.02, 0.012, 0.042)):
        off = (0.02 if i % 2 == 0 else -0.02) if pose == "andando" else 0.0
        for s in (-1, 1):
            off_s = off * s
            partes.append(_tubo((s * 0.07, yi, 0.05), (s * 0.14, yi + off_s, 0.012),
                                0.011, 0.007, m["perna"]))
    for s in (-1, 1):
        zc = 0.05 + lift
        partes.append(_tubo((s * 0.08, -0.045, zc + 0.01), (s * 0.14, -0.115, zc), 0.018, 0.014, m["casca"]))
        partes.append(_esfera((s * 0.15, -0.125, zc), (0.045, 0.05, 0.04), m["casca"]))
        partes.append(_tubo((s * 0.15, -0.15, zc + 0.015), (s * 0.15, -0.20, zc + 0.01), 0.02, 0.004, m["casca"]))
        partes.append(_tubo((s * 0.15, -0.15, zc - 0.012), (s * 0.15, -0.195, zc - 0.015), 0.016, 0.004, m["casca"]))
        partes.append(_tubo((s * 0.035, -0.05, 0.085), (s * 0.035, -0.06, 0.125), 0.009, 0.008, m["casca"]))
        partes += _olho(s * 0.035, -0.066, 0.13, 0.017, m)
    return _montar(nome, partes, _rot_morto(pose, costas=True), esc)


def criar_javali(nome, seed=0, pose="parado", **opcoes):
    _checar_pose(pose)
    rng = random.Random(seed)
    m = _mats(nome, seed, {"pelo": _var((0.52, 0.36, 0.22), rng),
                           "escuro": _var((0.32, 0.21, 0.13), rng),
                           "focinho": _var((0.86, 0.62, 0.55), rng),
                           "presa": (0.97, 0.94, 0.84)})
    esc = rng.uniform(0.95, 1.05)
    partes = [
        _esfera((0, 0.04, 0.42), (0.21, 0.30, 0.23), m["pelo"], seg=7),   # corpo
        _esfera((0, -0.30, 0.44), (0.16, 0.17, 0.18), m["pelo"], seg=7),  # cabeca
        _tubo((0, -0.40, 0.40), (0, -0.49, 0.37), 0.08, 0.07, m["focinho"]),
        _esfera((0, -0.50, 0.37), (0.065, 0.03, 0.06), m["focinho"], seg=6),
        _tubo((0, 0.34, 0.50), (0, 0.40, 0.58), 0.025, 0.01, m["escuro"]),  # rabo
    ]
    for s in (-1, 1):
        partes.append(_esfera((s * 0.025, -0.52, 0.37), (0.012, 0.012, 0.012), m["escuro"], seg=4))
        partes.append(_tubo((s * 0.07, -0.43, 0.31), (s * 0.10, -0.52, 0.42), 0.03, 0.006, m["presa"], seg=4))
        partes.append(_tubo((s * 0.09, -0.27, 0.58), (s * 0.13, -0.24, 0.68), 0.045, 0.01, m["escuro"], seg=4))
        partes += _olho(s * 0.09, -0.44, 0.49, 0.026, m)
    for y in (-0.22, -0.06, 0.10, 0.24):   # cerdas do dorso
        partes.append(_tubo((0, y, 0.56), (0, y - 0.02, 0.74), 0.05, 0.005, m["escuro"], seg=4))
    pivos = [(0.12, -0.2, 0.26), (-0.12, -0.2, 0.26), (-0.12, 0.22, 0.26), (0.12, 0.22, 0.26)]
    pernas, pes = _patas(pivos, 0.26, 0.05, m["escuro"], _marcha(pose, 4))
    partes += pernas
    for p in pes:
        partes.append(_esfera((p.x, p.y, 0.02), (0.06, 0.06, 0.03), m["escuro"], seg=5))
    return _montar(nome, partes, _rot_morto(pose), esc)


def criar_coelho(nome, seed=0, pose="parado", **opcoes):
    _checar_pose(pose)
    rng = random.Random(seed)
    m = _mats(nome, seed, {"pelo": _var((0.86, 0.70, 0.50), rng),
                           "orelha": (0.96, 0.62, 0.62),
                           "rabo": (0.97, 0.96, 0.92),
                           "nariz": (0.95, 0.50, 0.55)})
    esc = rng.uniform(0.92, 1.08)
    partes = [
        _esfera((0, 0.0, 0.17), (0.11, 0.14, 0.11), m["pelo"], seg=7),      # corpo
        _esfera((0, -0.14, 0.27), (0.095, 0.095, 0.085), m["pelo"], seg=7),  # cabeca
        _esfera((0, 0.17, 0.20), (0.05, 0.05, 0.05), m["rabo"], seg=5),     # rabo
        _esfera((0, -0.238, 0.255), (0.013, 0.013, 0.013), m["nariz"], seg=4),
    ]
    for s in (-1, 1):
        rot = (-0.15, 0, s * 0.12)
        partes.append(_esfera((s * 0.045, -0.13, 0.43), (0.03, 0.02, 0.13), m["pelo"], seg=5, rot=rot))
        partes.append(_esfera((s * 0.045, -0.152, 0.43), (0.015, 0.006, 0.10), m["orelha"], seg=4, rot=rot))
        partes.append(_esfera((s * 0.035, -0.07, 0.10), (0.02, 0.02, 0.02), m["pelo"], seg=4))  # ombro
        partes.append(_esfera((s * 0.06, -0.012, 0.025), (0.04, 0.08, 0.02), m["rabo"], seg=5))  # pata traseira
        partes += _olho(s * 0.05, -0.225, 0.28, 0.021, m)
    pivos = [(0.05, -0.09, 0.10), (-0.05, -0.09, 0.10), (-0.07, 0.06, 0.12), (0.07, 0.06, 0.12)]
    pernas, _ = _patas(pivos, 0.10, 0.022, m["pelo"], _marcha(pose, 4))
    partes += pernas
    return _montar(nome, partes, _rot_morto(pose), esc)


def criar_gaivota(nome, seed=0, pose="parado", **opcoes):
    _checar_pose(pose)
    rng = random.Random(seed)
    m = _mats(nome, seed, {"branco": _var((0.97, 0.97, 0.95), rng),
                           "cinza": _var((0.66, 0.74, 0.82), rng),
                           "ponta": (0.22, 0.26, 0.32),
                           "bico": (0.98, 0.72, 0.20),
                           "bico_ponta": (0.90, 0.22, 0.20),
                           "perna": (0.97, 0.60, 0.35)})
    esc = rng.uniform(0.94, 1.06)
    partes = [
        _esfera((0, 0.02, 0.22), (0.09, 0.19, 0.095), m["branco"], seg=7),   # corpo
        _esfera((0, 0.03, 0.285), (0.07, 0.12, 0.035), m["cinza"], seg=6),   # dorso cinza
        _esfera((0, -0.20, 0.33), (0.072, 0.078, 0.072), m["branco"], seg=7),  # cabeca
        _tubo((0, -0.26, 0.33), (0, -0.37, 0.315), 0.028, 0.010, m["bico"], seg=4),
        _esfera((0, -0.37, 0.315), (0.012, 0.012, 0.012), m["bico_ponta"], seg=4),
        _poli([(-0.05, 0.18, 0.24), (0.05, 0.18, 0.24), (0.0, 0.32, 0.27)], m["cinza"]),  # cauda
    ]
    partes += _olho(-0.04, -0.255, 0.35, 0.02, m) + _olho(0.04, -0.255, 0.35, 0.02, m)
    for s in (-1, 1):
        partes.append(_poli([(s * 0.06, -0.12, 0.33), (s * 0.36, -0.07, 0.36),
                             (s * 0.36, 0.12, 0.34), (s * 0.06, 0.14, 0.30)], m["branco"]))
        partes.append(_poli([(s * 0.36, -0.07, 0.36), (s * 0.66, -0.02, 0.38),
                             (s * 0.60, 0.10, 0.37), (s * 0.36, 0.12, 0.34)], m["ponta"]))
    pernas, _ = _patas([(0.035, 0.0, 0.14), (-0.035, 0.0, 0.14)], 0.13, 0.012, m["perna"],
                       _marcha(pose, 2))
    partes += pernas
    return _montar(nome, partes, _rot_morto(pose, costas=True), esc)


def criar_cobra(nome, seed=0, pose="parado", **opcoes):
    _checar_pose(pose)
    rng = random.Random(seed)
    m = _mats(nome, seed, {"verde": _var((0.30, 0.66, 0.30), rng),
                           "amarelo": _var((0.84, 0.84, 0.38), rng),
                           "lingua": (0.90, 0.22, 0.28)})
    amp, fase = {"parado": (0.12, 0.0), "andando": (0.15, 1.1), "morto": (0.03, 0.0)}[pose]
    fase += rng.uniform(-0.3, 0.3)
    esc = rng.uniform(0.94, 1.06)
    n, comp = 13, 1.4
    pts = []
    for i in range(n):
        s = i / (n - 1)
        x = amp * math.sin(2 * math.pi * 1.6 * s + fase)
        y = -0.6 + comp * s
        r = 0.05 - 0.035 * s
        pts.append((x, y, r * 0.9, r))
    partes = []
    for i, (x, y, z, r) in enumerate(pts):
        partes.append(_esfera((x, y, z), (r, r, r * 0.9), m["verde"], seg=5))
        if i + 1 < n:
            x2, y2, z2, r2 = pts[i + 1]
            partes.append(_tubo((x, y, z), (x2, y2, z2), r, r2, m["verde"], seg=5))
        if i % 3 == 1:  # manchas amarelas no dorso
            partes.append(_esfera((x, y, z + r * 0.8), (r * 0.5, r * 0.6, r * 0.25), m["amarelo"], seg=4))
    hx = pts[0][0]
    partes.append(_esfera((hx, -0.66, 0.05), (0.062, 0.085, 0.05), m["verde"], seg=6))
    for s in (-1, 1):
        partes += _olho(hx + s * 0.035, -0.70, 0.075, 0.014, m)
    partes.append(_tubo((hx, -0.74, 0.05), (hx, -0.84, 0.05), 0.005, 0.004, m["lingua"], seg=4))
    for s in (-1, 1):
        partes.append(_tubo((hx, -0.84, 0.05), (hx + s * 0.02, -0.87, 0.05), 0.004, 0.002, m["lingua"], seg=4))
    return _montar(nome, partes, _rot_morto(pose, costas=True), esc)


def criar_peixe(nome, seed=0, pose="parado", **opcoes):
    """Peixe deitado na areia. 'andando' = se debatendo (corpo tombado de lado)."""
    _checar_pose(pose)
    rng = random.Random(seed)
    m = _mats(nome, seed, {"corpo": _var((0.98, 0.56, 0.27), rng),
                           "barbatana": _var((0.86, 0.38, 0.20), rng)})
    esc = rng.uniform(0.93, 1.07)
    partes = [
        _esfera((0, 0, 0.12), (0.08, 0.26, 0.12), m["corpo"], seg=7),
        _poli([(0, -0.06, 0.23), (0, 0.10, 0.23), (0, 0.0, 0.36)], m["barbatana"]),       # dorsal
        _poli([(0, 0.22, 0.14), (0, 0.38, 0.27), (0, 0.31, 0.14)], m["barbatana"]),        # cauda
        _poli([(0, 0.22, 0.14), (0, 0.31, 0.14), (0, 0.38, 0.01)], m["barbatana"]),
    ]
    for s in (-1, 1):
        partes.append(_poli([(s * 0.08, -0.10, 0.12), (s * 0.16, -0.02, 0.06),
                             (s * 0.08, 0.02, 0.10)], m["barbatana"]))
        partes += _olho(s * 0.045, -0.235, 0.16, 0.03, m)
    rot = None
    if pose == "morto":
        rot = _ROT_COSTAS
    elif pose == "andando":
        rot = Matrix.Rotation(0.35, 4, "Y")
    return _montar(nome, partes, rot, esc)


def criar_tartaruga(nome, seed=0, pose="parado", **opcoes):
    _checar_pose(pose)
    rng = random.Random(seed)
    m = _mats(nome, seed, {"casco": _var((0.40, 0.62, 0.30), rng),
                           "placa": _var((0.27, 0.45, 0.22), rng),
                           "pele": _var((0.70, 0.84, 0.46), rng),
                           "plastrao": (0.95, 0.87, 0.52)})
    esc = rng.uniform(0.92, 1.08)
    partes = [
        _esfera((0, 0.0, 0.20), (0.19, 0.23, 0.13), m["casco"], seg=8),      # casco (cupula)
        _esfera((0, 0.0, 0.10), (0.16, 0.20, 0.04), m["plastrao"], seg=6),
        _tubo((0, 0, 0.30), (0, 0, 0.345), 0.07, 0.07, m["placa"], seg=6),   # placa central
    ]
    for k in range(6):
        t = k * math.pi / 3
        x, y = 0.10 * math.cos(t), 0.13 * math.sin(t)
        partes.append(_tubo((x, y, 0.27), (x, y, 0.33), 0.04, 0.04, m["placa"], seg=6))
    partes.append(_tubo((0, -0.18, 0.14), (0, -0.27, 0.14), 0.05, 0.045, m["pele"]))  # pescoco
    partes.append(_esfera((0, -0.31, 0.15), (0.07, 0.09, 0.065), m["pele"], seg=6))
    for s in (-1, 1):
        partes += _olho(s * 0.035, -0.385, 0.165, 0.016, m)
    pivos = [(0.13, -0.12, 0.12), (-0.13, -0.12, 0.12), (-0.12, 0.14, 0.12), (0.12, 0.14, 0.12)]
    pernas, _ = _patas(pivos, 0.12, 0.045, m["pele"], _marcha(pose, 4))
    partes += pernas
    partes.append(_tubo((0, 0.22, 0.10), (0, 0.33, 0.08), 0.028, 0.01, m["pele"]))  # rabo
    return _montar(nome, partes, _rot_morto(pose, costas=True), esc)


def criar_macaco(nome, seed=0, pose="parado", **opcoes):
    _checar_pose(pose)
    rng = random.Random(seed)
    m = _mats(nome, seed, {"pelo": _var((0.52, 0.34, 0.20), rng),
                           "rosto": _var((0.93, 0.80, 0.60), rng),
                           "barriga": (0.86, 0.72, 0.50),
                           "orelha": (0.95, 0.62, 0.60)})
    esc = rng.uniform(0.94, 1.06)
    partes = [
        _esfera((0, 0.02, 0.52), (0.14, 0.13, 0.20), m["pelo"], seg=7),        # tronco
        _esfera((0, -0.07, 0.50), (0.09, 0.06, 0.14), m["barriga"], seg=6),
        _esfera((0, -0.03, 0.80), (0.13, 0.12, 0.13), m["pelo"], seg=7),       # cabeca
        _esfera((0, -0.12, 0.79), (0.085, 0.05, 0.085), m["rosto"], seg=6),
        _esfera((0, -0.17, 0.765), (0.02, 0.012, 0.014), m["pelo"], seg=4),    # focinho
    ]
    for s in (-1, 1):
        partes.append(_esfera((s * 0.13, -0.02, 0.82), (0.035, 0.025, 0.04), m["pelo"], seg=5))
        partes.append(_esfera((s * 0.13, -0.035, 0.82), (0.02, 0.01, 0.025), m["orelha"], seg=4))
        partes += _olho(s * 0.045, -0.155, 0.82, 0.02, m)
        partes.append(_tubo((s * 0.15, 0.0, 0.60), (s * 0.20, -0.08, 0.36), 0.045, 0.035, m["pelo"], seg=5))
        partes.append(_esfera((s * 0.21, -0.10, 0.33), (0.05, 0.05, 0.05), m["pelo"], seg=5))  # mao
    pernas, pes = _patas([(0.08, 0.0, 0.36), (-0.08, 0.0, 0.36)], 0.36, 0.06, m["pelo"], _marcha(pose, 2))
    partes += pernas
    for p in pes:
        partes.append(_esfera((p.x, p.y - 0.02, 0.02), (0.05, 0.08, 0.025), m["pelo"], seg=5))
    partes.append(_tubo((0, 0.14, 0.30), (0, 0.24, 0.22), 0.03, 0.025, m["pelo"], seg=4))  # rabo
    partes.append(_tubo((0, 0.24, 0.22), (0, 0.30, 0.30), 0.025, 0.02, m["pelo"], seg=4))
    partes.append(_tubo((0, 0.30, 0.30), (0, 0.26, 0.42), 0.02, 0.018, m["pelo"], seg=4))
    return _montar(nome, partes, _rot_morto(pose), esc)


# ---------------------------------------------------------------- previa

def _todos():
    return [criar_caranguejo, criar_javali, criar_coelho, criar_gaivota,
            criar_cobra, criar_peixe, criar_tartaruga, criar_macaco]


def _render(caminho, objetos, colunas, espac=2.2, ortho=9.0, res=(1600, 900)):
    """Grade de animais vista de 3/4 de cima, camera ortografica, Workbench."""
    sc = bpy.context.scene
    linhas = math.ceil(len(objetos) / colunas)
    for i, ob in enumerate(objetos):
        r, c = divmod(i, colunas)
        ob.location = ((c - (colunas - 1) / 2) * espac, -r * espac, 0.0)
        ob.rotation_euler = (0.0, 0.0, -0.7)
    alvo = Vector((0.0, -(linhas - 1) * espac / 2, 0.25))
    cam_loc = alvo + Vector((0.0, -12.0, 9.0))
    bpy.ops.object.camera_add(location=cam_loc)
    cam = bpy.context.object
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = ortho
    cam.rotation_euler = (alvo - cam_loc).to_track_quat("-Z", "Y").to_euler()
    sc.camera = cam
    bpy.ops.object.light_add(type="SUN", location=(4, -4, 10))
    bpy.context.object.data.energy = 3
    bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 0, 0))
    bpy.context.object.data.materials.append(mat_cor("chao_previa", (0.86, 0.80, 0.62)))
    w = bpy.data.worlds.new("ceu")
    sc.world = w
    w.color = (0.55, 0.75, 0.95)
    sc.render.engine = "BLENDER_WORKBENCH"
    sh = sc.display.shading
    sh.light = "STUDIO"
    sh.color_type = "MATERIAL"
    sh.show_shadows = True
    sh.show_cavity = True
    sh.show_object_outline = True
    sh.background_type = "WORLD"
    sc.render.resolution_x, sc.render.resolution_y = res
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    sc.render.filepath = caminho
    bpy.ops.render.render(write_still=True)
    print("PREVIA", caminho)


if __name__ == "__main__":
    base = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "previas"))

    limpar_cena()
    objs = []
    for f in _todos():
        nome = f.__name__.replace("criar_", "")
        ob = f(nome, seed=0, pose="parado")
        vs = [v.co for v in ob.data.vertices]
        dims = [max(c[i] for c in vs) - min(c[i] for c in vs) for i in range(3)]
        print(f"ANIMAL {nome}: dims=({dims[0]:.2f}, {dims[1]:.2f}, {dims[2]:.2f}) tris={contar_tris(ob)}")
        objs.append(ob)
    _render(os.path.join(base, "animais.png"), objs, colunas=4, espac=1.8, ortho=7.6)

    limpar_cena()
    objs = []
    for pose in ("andando", "morto"):
        for f in _todos():
            nome = f.__name__.replace("criar_", "")
            objs.append(f(nome, seed=0, pose=pose))
    _render(os.path.join(base, "animais_poses.png"), objs, colunas=4, espac=1.9, ortho=9.0)
