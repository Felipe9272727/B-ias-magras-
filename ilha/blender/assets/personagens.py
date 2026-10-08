"""Tributos low-poly do "Jogos Vorazes das IAs" - bonecos facetados com uniforme por empresa.

criar_tributo(nome, empresa, cor, pose="parado", item=None, seed=0) -> objeto unico (malha ja juntada)
criar_tributo_rig(nome, empresa, cor, seed=0) -> Empty pai; filhos <nome>_tronco (pivo quadril, pai de
    <nome>_cabeca, <nome>_braco_e, <nome>_braco_d) e <nome>_perna_e, <nome>_perna_d (pivos no quadril).

Geometria: cabeca em icosfera, tronco em prisma octogonal afunilado, membros em cilindros de 7 lados,
maos e botas em elipsoides facetados. Flat shading. Unidades: 1 unidade = 1 m, altura ~1,8 m,
origem no chao e centrada em x/y.
Execucao direta gera as previas em ilha/blender/previas/personagens.png e personagens_poses.png.
"""
import math
import os
import random
import sys

import bpy
from mathutils import Euler, Matrix, Vector

try:
    _DIR = os.path.dirname(os.path.abspath(__file__))
except NameError:  # execucao sem __file__
    _DIR = "/home/user/B-ias-magras-/ilha/blender/assets"
sys.path.append(_DIR)
from util import hexrgb, limpar_cena, mat_cor, previa  # noqa: E402

V = Vector
S2 = math.sqrt(2)

# ---------------------------------------------------------------- paleta e constantes
EMPRESAS = {
    "anthropic": {"main": "#B4532F", "det": "#F0E6D2", "acento": "#F0E6D2"},  # macacao terracota escuro, creme
    "openai": {"main": "#1E1E1E", "det": "#FFFFFF", "acento": "#10A37F"},     # preto, branco, verde-agua
    "deepseek": {"main": "#4D6BFE", "det": "#FFFFFF", "acento": "#FFFFFF"},   # azul com branco
    "alibaba": {"main": "#6B4EE6", "det": "#FFFFFF", "acento": "#FF6A00"},    # Qwen: roxo, branco, laranja Alibaba
}
PELES = ["#F4C7A1", "#E0AC7E", "#C68A5B", "#8D5A3B", "#5A3822", "#FFDDBB"]
CABELOS = ["#2B1B12", "#111111", "#D9A93B", "#B5532B", "#EDEAE4", "#7B3FA0", "#3FA7C9", "#E24C8A"]
ESTILOS = ["curto", "rabo", "careca", "topete"]
ITENS = (None, "faca", "lanca", "arco", "machado", "tocha")
EMPRESAS_VALIDAS = tuple(EMPRESAS)
POSES_VALIDAS = ("parado", "andando_a", "andando_b", "correndo", "atacando", "coletando",
                 "sentado", "dormindo", "morto", "acenando")
PARTES = ("cabeca", "tronco", "braco_e", "braco_d", "perna_e", "perna_d")

BOTA = "#2A2623"
MOCHILA = "#6B4A36"
ALJAVA = "#5A3A22"
FLECHA = "#E9DCC0"
PENA = "#D9473A"
OLHO = "#141414"
BOCA = "#4A2424"
METAL = "#BFC7D0"
MADEIRA = "#8B5A2B"
CABO = "#3A2A1E"
CORDA = "#E6E6E6"
CHAMA_EXT = "#FF8A2B"
CHAMA_INT = "#FFD23F"
BRANCO = (1.0, 1.0, 1.0)

# articulacoes (x: direita = -X, esquerda = +X; personagem de frente para -Y)
PIV_TRONCO = V((0, 0, 0.78))     # quadril (pai do tronco)
PIV_CABECA = V((0, 0, 1.32))     # pescoco
PIV_BRACO = {"braco_d": V((-0.28, 0, 1.22)), "braco_e": V((0.28, 0, 1.22))}   # ombros
PIV_PERNA = {"perna_d": V((-0.11, 0, 0.78)), "perna_e": V((0.11, 0, 0.78))}   # quadris

# angulos em graus (rx, ry, rz). Frente = -Y. rx negativo leva membros para frente; rx positivo, tronco para frente.
POSES = {
    "parado": dict(tronco=(0, 0, 0), cabeca=(0, 0, 0), braco_d=(0, 6, 0), braco_e=(0, -6, 0),
                   perna_d=(0, 0, 0), perna_e=(0, 0, 0)),
    "andando_a": dict(tronco=(2, 0, 0), cabeca=(0, 0, 0), braco_d=(18, 6, 0), braco_e=(-18, -6, 0),
                      perna_d=(-22, 0, 0), perna_e=(8, 0, 0)),
    "andando_b": dict(tronco=(2, 0, 0), cabeca=(0, 0, 0), braco_d=(-18, 6, 0), braco_e=(18, -6, 0),
                      perna_d=(8, 0, 0), perna_e=(-22, 0, 0)),
    "correndo": dict(tronco=(12, 0, 0), cabeca=(-8, 0, 0), braco_d=(-55, 4, 0), braco_e=(40, -4, 0),
                     perna_d=(40, 0, 0), perna_e=(-50, 0, 0)),
    "atacando": dict(tronco=(6, 0, 0), cabeca=(-4, 0, 0), braco_d=(-85, 0, 0), braco_e=(-40, -10, 0),
                     perna_d=(15, 0, 0), perna_e=(-25, 0, 0)),
    "coletando": dict(tronco=(45, 0, 0), cabeca=(-25, 0, 0), braco_d=(-70, 4, 0), braco_e=(-70, -4, 0),
                      perna_d=(-10, 0, 0), perna_e=(-10, 0, 0)),
    "sentado": dict(tronco=(0, 0, 0), cabeca=(0, 0, 0), braco_d=(-55, 6, 0), braco_e=(-55, -6, 0),
                    perna_d=(-90, 0, -8), perna_e=(-90, 0, 8)),
    # deitado de lado: deita de costas (Rx -90) e rola sobre o eixo longitudinal (Ry 90)
    "dormindo": dict(tronco=(0, 0, 0), cabeca=(0, 0, 8), braco_d=(-30, 0, 0), braco_e=(-20, 0, 0),
                     perna_d=(25, 0, 0), perna_e=(-15, 0, 0), G=[(-90, 0, 0), (0, 90, 0)]),
    # deitado de costas, bracos abertos
    "morto": dict(tronco=(0, 0, 0), cabeca=(0, 0, 20), braco_d=(0, 55, 0), braco_e=(0, -55, 0),
                  perna_d=(0, 0, -4), perna_e=(0, 0, 4), G=[(-90, 0, 0)]),
    "acenando": dict(tronco=(0, 0, 0), cabeca=(0, 0, 8), braco_d=(0, 155, 0), braco_e=(0, -12, 0),
                     perna_d=(0, 0, 0), perna_e=(0, 0, 0)),
}

# ---------------------------------------------------------------- primitivas facetadas
_ICO_V = [(-1, 1.618, 0), (1, 1.618, 0), (-1, -1.618, 0), (1, -1.618, 0),
          (0, -1, 1.618), (0, 1, 1.618), (0, -1, -1.618), (0, 1, -1.618),
          (1.618, 0, -1), (1.618, 0, 1), (-1.618, 0, -1), (-1.618, 0, 1)]
_ICO_F = [(0, 11, 5), (0, 5, 1), (0, 1, 7), (0, 7, 10), (0, 10, 11), (1, 5, 9), (5, 11, 4), (11, 10, 2),
          (10, 7, 6), (7, 1, 8), (3, 9, 4), (3, 4, 2), (3, 2, 6), (3, 6, 8), (3, 8, 9), (4, 9, 5),
          (2, 4, 11), (6, 2, 10), (8, 6, 7), (9, 8, 1)]
_ico_cache = {}


def _icosfera(sub):
    """Vertices (unitarios) e triangulos de uma icosfera com 'sub' subdivisoes (0: 20 tris, 1: 80, 2: 320)."""
    if sub in _ico_cache:
        return _ico_cache[sub]
    verts = [V(v).normalized() for v in _ICO_V]
    faces = list(_ICO_F)
    for _ in range(sub):
        meio = {}

        def m(a, b):
            chave = (min(a, b), max(a, b))
            if chave not in meio:
                verts.append(((verts[a] + verts[b]) / 2).normalized())
                meio[chave] = len(verts) - 1
            return meio[chave]

        novas = []
        for a, b, c in faces:
            ab, bc, ca = m(a, b), m(b, c), m(c, a)
            novas += [(a, ab, ca), (b, bc, ab), (c, ca, bc), (ab, bc, ca)]
        faces = novas
    _ico_cache[sub] = (verts, faces)
    return _ico_cache[sub]


def _orienta(faces, spec):
    """Faces de um solido convexo, com normais para fora. Retorna lista (pontos, spec)."""
    pts = [p for f in faces for p in f]
    cen = sum(pts, V((0, 0, 0))) / len(pts)
    saida = []
    for f in faces:
        c = sum(f, V((0, 0, 0))) / len(f)
        n = (f[1] - f[0]).cross(f[2] - f[0])
        if n.dot(c - cen) < 0:
            f = f[::-1]
        saida.append((list(f), spec))
    return saida


class _Grupo:
    """Geometria de uma parte articulada, em coordenadas do personagem em pe (antes da pose)."""

    def __init__(self):
        self.faces = []

    def prisma(self, z0, z1, rx0, ry0, rx1, ry1, n, cor, x=0.0, y=0.0, dx=0.0, dy=0.0,
               giro=0.0, emissao=0.0):
        """Prisma de n lados (cilindro/octogono) afunilado; elipse de raios rx, ry; topo deslocado (dx, dy)."""
        ang = [giro + 2 * math.pi * k / n for k in range(n)]
        base = [V((x + rx0 * math.cos(a), y + ry0 * math.sin(a), z0)) for a in ang]
        topo = [V((x + dx + rx1 * math.cos(a), y + dy + ry1 * math.sin(a), z1)) for a in ang]
        faces = [base, topo]
        for i in range(n):
            j = (i + 1) % n
            faces.append([base[i], base[j], topo[j], topo[i]])
        self.faces += _orienta(faces, (tuple(cor), float(emissao)))

    def elipsoide(self, cx, cy, cz, rx, ry, rz, cor, sub=1, emissao=0.0):
        """Icosfera deformada em elipsoide (facetada)."""
        vs, fs = _icosfera(sub)
        pts = [V((cx + v.x * rx, cy + v.y * ry, cz + v.z * rz)) for v in vs]
        faces = [[pts[a], pts[b], pts[c]] for a, b, c in fs]
        self.faces += _orienta(faces, (tuple(cor), float(emissao)))

    def frustum(self, z0, z1, w0, d0, w1, d1, cor, x=0.0, y=0.0, dx=0.0, dy=0.0, emissao=0.0):
        """Caixa (ou tronco de piramide) retangular, para os itens."""
        self.prisma(z0, z1, w0 / 2 * S2, d0 / 2 * S2, w1 / 2 * S2, d1 / 2 * S2, 4, cor,
                    x=x, y=y, dx=dx, dy=dy, giro=math.pi / 4, emissao=emissao)

    def caixa(self, x, y, z0, z1, w, d, cor, emissao=0.0):
        self.frustum(z0, z1, w, d, w, d, cor, x, y, emissao=emissao)


# ---------------------------------------------------------------- itens (mao direita)
MAO = (-0.28, -0.10, 0.60)  # centro da mao direita, em coordenadas do braco pendurado


def _item(g, item):
    """Item na mao direita (grupo braco_d). Eixo do item na frente da mao."""
    if item is None:
        return
    if item not in ITENS:
        raise ValueError(f"item invalido: {item}")
    x, y = MAO[0], MAO[1]
    if item == "faca":
        g.caixa(x, y, 0.57, 0.65, 0.035, 0.035, hexrgb(CABO))
        g.caixa(x, y, 0.65, 0.67, 0.075, 0.03, hexrgb(METAL))
        g.caixa(x, y, 0.67, 0.87, 0.03, 0.01, hexrgb(METAL))
    elif item == "lanca":
        g.caixa(x, y, 0.22, 1.60, 0.03, 0.03, hexrgb(MADEIRA))
        g.frustum(1.60, 1.78, 0.06, 0.06, 0.004, 0.004, hexrgb(METAL), x, y)
    elif item == "arco":
        n = 11
        for k in range(n):
            t = -1 + 2 * k / (n - 1)
            z = MAO[2] + 0.46 * t
            g.caixa(x, y - 0.03 - 0.10 * (1 - t * t), z - 0.04, z + 0.04, 0.03, 0.03, hexrgb(MADEIRA))
        g.caixa(x, y - 0.03, MAO[2] - 0.43, MAO[2] + 0.49, 0.006, 0.006, hexrgb(CORDA))
    elif item == "machado":
        g.caixa(x, y, 0.47, 0.99, 0.04, 0.04, hexrgb(MADEIRA))
        g.frustum(0.95, 1.13, 0.14, 0.03, 0.04, 0.03, hexrgb(METAL), x - 0.05, y)
    elif item == "tocha":
        g.caixa(x, y, 0.40, 0.88, 0.035, 0.035, hexrgb(MADEIRA))
        g.frustum(0.86, 0.98, 0.10, 0.10, 0.02, 0.02, hexrgb(CHAMA_EXT), x, y, emissao=0.8)
        g.frustum(0.86, 0.97, 0.06, 0.06, 0.012, 0.012, hexrgb(CHAMA_INT), x, y, emissao=1.0)


def _frente_cabeca(z):
    """Y da frente da cabeca (elipsoide 0.21 x 0.20 x 0.20, centro z=1.52) na altura z."""
    return -0.20 * math.sqrt(max(0.0, 1 - ((z - 1.52) / 0.20) ** 2))


def _frente_tronco(z):
    """Y da frente do tronco octogonal (raio y 0.115 -> 0.15 entre z 0.80 e 1.28, flat frontal)."""
    return -0.924 * (0.115 + 0.035 * (z - 0.80) / 0.48)


def _construir(empresa, cor, sorteio, item=None):
    """Monta as 6 partes do tributo em pe. Retorna dict parte -> _Grupo."""
    e = EMPRESAS[empresa]
    main, det, acento = hexrgb(e["main"]), hexrgb(e["det"]), hexrgb(e["acento"])
    pele = hexrgb(sorteio["pele"])
    pele_sombra = tuple(c * 0.86 for c in pele)             # nariz
    rubor = tuple(c * 0.55 + k * 0.45 for c, k in zip(pele, (0.95, 0.55, 0.6)))  # bochecha sutil
    cabelo = hexrgb(sorteio["cabelo"])
    olho = hexrgb(OLHO)
    cor = tuple(cor)
    G = {k: _Grupo() for k in PARTES}
    giro_t = math.pi / 8  # octogono com faces planas na frente/tras e nas laterais

    # tronco: octogono afunilado (ombros mais largos que a cintura), cinto largo, emblema redondo
    t = G["tronco"]
    t.prisma(0.80, 1.28, 0.165, 0.115, 0.225, 0.15, 8, main, giro=giro_t)
    t.prisma(0.80, 0.86, 0.178, 0.124, 0.185, 0.13, 8, det, giro=giro_t)
    t.prisma(1.24, 1.30, 0.105, 0.09, 0.11, 0.095, 8, det, giro=giro_t)          # gola
    t.prisma(1.22, 1.36, 0.065, 0.065, 0.06, 0.06, 7, pele)                      # pescoco
    t.elipsoide(0, _frente_tronco(1.10) + 0.003, 1.10, 0.055, 0.012, 0.055, acento, sub=1)  # emblema
    t.caixa(0, 0.17, 0.98, 1.24, 0.26, 0.10, hexrgb(MOCHILA))                    # mochila
    if item == "arco":  # aljava com flechas nas costas
        t.caixa(0.15, 0.19, 1.00, 1.36, 0.08, 0.08, hexrgb(ALJAVA))
        t.caixa(0.15, 0.19, 1.30, 1.46, 0.02, 0.02, hexrgb(FLECHA))
        t.caixa(0.15, 0.19, 1.44, 1.48, 0.03, 0.03, hexrgb(PENA))

    # bracos: manga cilindrica, punho e mao esferica; bracadeira na cor pessoal (braco esquerdo)
    for lado, x in (("braco_d", -0.28), ("braco_e", 0.28)):
        g = G[lado]
        g.prisma(0.70, 1.22, 0.072, 0.072, 0.064, 0.064, 7, main, x=x)
        g.prisma(0.66, 0.72, 0.076, 0.076, 0.072, 0.072, 8, acento, x=x)
        g.elipsoide(x, 0, MAO[2], 0.07, 0.07, 0.07, pele, sub=0)
    G["braco_e"].prisma(0.98, 1.10, 0.083, 0.083, 0.085, 0.085, 8, cor, x=0.28)
    _item(G["braco_d"], item)

    # pernas: cilindros no mesmo macacao, botas arredondadas
    for lado, x in (("perna_e", 0.11), ("perna_d", -0.11)):
        G[lado].prisma(0.14, 0.82, 0.07, 0.07, 0.085, 0.085, 7, main, x=x)
        G[lado].elipsoide(x, -0.02, 0.085, 0.10, 0.13, 0.085, hexrgb(BOTA), sub=1)

    # cabeca: icosfera, olhos ovais com brilho, sobrancelhas, nariz, boca, rubor, faixa, cabelo
    h = G["cabeca"]
    h.elipsoide(0, 0, 1.52, 0.21, 0.20, 0.20, pele, sub=1)
    for x in (-0.21, 0.21):
        h.elipsoide(x, 0, 1.50, 0.03, 0.05, 0.06, pele, sub=0)                  # orelhas
    for x in (-0.085, 0.085):
        y = _frente_cabeca(1.50) + 0.004
        h.elipsoide(x, y, 1.50, 0.035, 0.016, 0.05, olho, sub=0)                # olho oval
        h.elipsoide(x + 0.012, y - 0.014, 1.52, 0.011, 0.006, 0.011, BRANCO, sub=0)  # brilho
        h.elipsoide(x, _frente_cabeca(1.585) + 0.002, 1.585, 0.035, 0.008, 0.009, cabelo, sub=0)  # sobrancelha
    for x in (-0.14, 0.14):
        h.elipsoide(x, _frente_cabeca(1.43), 1.43, 0.035, 0.012, 0.022, rubor, sub=0)  # rubor
    h.elipsoide(0, _frente_cabeca(1.46) + 0.005, 1.46, 0.02, 0.02, 0.022, pele_sombra, sub=0)  # nariz
    h.elipsoide(0, _frente_cabeca(1.39) + 0.004, 1.39, 0.02, 0.008, 0.008, hexrgb(BOCA), sub=0)  # boca
    h.prisma(1.60, 1.65, 0.196, 0.19, 0.165, 0.16, 10, cor)                     # faixa na cor pessoal
    estilo = sorteio["estilo"]
    if estilo != "careca":  # cabelo com volume: cupula + bloco atras
        h.elipsoide(0, 0.02, 1.72, 0.225, 0.215, 0.095, cabelo, sub=1)
        h.elipsoide(0, 0.13, 1.64, 0.18, 0.10, 0.10, cabelo, sub=0)
    if estilo == "rabo":
        h.elipsoide(0, 0.23, 1.50, 0.07, 0.065, 0.17, cabelo, sub=0)
        h.prisma(1.60, 1.66, 0.075, 0.07, 0.075, 0.07, 7, cor, y=0.23)           # elastico na cor pessoal
    elif estilo == "topete":
        h.elipsoide(0, -0.02, 1.80, 0.10, 0.11, 0.06, cabelo, sub=0)
    return G


def _rot(graus):
    """Matriz 4x4 de rotacao Euler XYZ (em graus)."""
    return Euler([math.radians(a) for a in graus], "XYZ").to_matrix().to_4x4()


def _em_torno(p, R):
    return Matrix.Translation(p) @ R @ Matrix.Translation(-p)


def _matrizes(pose):
    """Matriz global de cada parte para uma pose (hierarquia: tronco -> cabeca e bracos; quadril -> pernas)."""
    Gm = Matrix.Identity(4)
    for r in pose.get("G", ()):
        Gm = _rot(r) @ Gm
    Mt = _em_torno(PIV_TRONCO, _rot(pose["tronco"]))
    return {
        "tronco": Gm @ Mt,
        "cabeca": Gm @ Mt @ _em_torno(PIV_CABECA, _rot(pose["cabeca"])),
        "braco_e": Gm @ Mt @ _em_torno(PIV_BRACO["braco_e"], _rot(pose["braco_e"])),
        "braco_d": Gm @ Mt @ _em_torno(PIV_BRACO["braco_d"], _rot(pose["braco_d"])),
        "perna_e": Gm @ _em_torno(PIV_PERNA["perna_e"], _rot(pose["perna_e"])),
        "perna_d": Gm @ _em_torno(PIV_PERNA["perna_d"], _rot(pose["perna_d"])),
    }


def _assentar(polys):
    """Centraliza em x/y e poe a base (menor z) no chao."""
    pts = [p for f, _ in polys for p in f]
    minx, maxx = min(p.x for p in pts), max(p.x for p in pts)
    miny, maxy = min(p.y for p in pts), max(p.y for p in pts)
    minz = min(p.z for p in pts)
    off = V((-(minx + maxx) / 2, -(miny + maxy) / 2, -minz))
    return [([p + off for p in f], spec) for f, spec in polys]


def _montar(G, pose_nome, escala):
    """Aplica a pose a cada parte, escala e assenta. Retorna lista (pontos, spec)."""
    Ms = _matrizes(POSES[pose_nome])
    polys = []
    for k, g in G.items():
        M = Ms[k]
        for f, spec in g.faces:
            polys.append(([(M @ p) * escala for p in f], spec))
    return _assentar(polys)


def _objeto(nome, polys, origem=V((0, 0, 0))):
    """Cria um unico objeto de malha (flat shading) a partir de poligonos; vertices relativos a 'origem'."""
    mesh = bpy.data.meshes.new(nome + "_mesh")
    vs, fs, mids, mats, indice = [], [], [], [], {}
    for f, spec in polys:
        ids = []
        for p in f:
            q = p - origem
            vs.append((q.x, q.y, q.z))
            ids.append(len(vs) - 1)
        fs.append(ids)
        if spec not in indice:
            indice[spec] = len(mats)
            mats.append(_material(spec))
        mids.append(indice[spec])
    mesh.from_pydata(vs, [], fs)
    for m in mats:
        mesh.materials.append(m)
    for poly, mi in zip(mesh.polygons, mids):
        poly.material_index = mi
        poly.use_smooth = False
    mesh.validate()
    mesh.update()
    ob = bpy.data.objects.new(nome, mesh)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def _material(spec):
    rgb, emissao = spec
    nome = "tri_%02x%02x%02x" % tuple(int(round(c * 255)) for c in rgb) + ("_e" if emissao else "")
    return mat_cor(nome, rgb, rough=0.85, emissao=emissao)


def _sorteio(seed):
    r = random.Random(seed)
    return {
        "pele": r.choice(PELES),
        "cabelo": r.choice(CABELOS),
        "estilo": r.choice(ESTILOS),
        "escala": 1 + r.uniform(-0.05, 0.05),
    }


def _checar(empresa, pose=None, item=None):
    if empresa not in EMPRESAS:
        raise ValueError(f"empresa invalida: {empresa}")
    if pose is not None and pose not in POSES:
        raise ValueError(f"pose invalida: {pose}")
    if item not in ITENS:
        raise ValueError(f"item invalido: {item}")


# ---------------------------------------------------------------- API publica
def criar_tributo(nome, empresa, cor, pose="parado", item=None, seed=0):
    """Tributo como objeto unico. cor = (r,g,b) 0..1 da faixa e da braçadeira."""
    _checar(empresa, pose, item)
    sorteio = _sorteio(seed)
    G = _construir(empresa, cor, sorteio, item)
    return _objeto(nome, _montar(G, pose, sorteio["escala"]))


def criar_tributo_rig(nome, empresa, cor, seed=0):
    """Tributo em pose de repouso com partes separadas. Retorna o Empty pai.

    Filhos (objetos): <nome>_tronco (pivo no quadril, pai de <nome>_cabeca, <nome>_braco_e, <nome>_braco_d),
    <nome>_perna_e e <nome>_perna_d (pivos no quadril, filhos do Empty). Cada objeto tem origem no proprio pivo.
    """
    _checar(empresa)
    sorteio = _sorteio(seed)
    esc = sorteio["escala"]
    G = _construir(empresa, cor, sorteio, None)

    raiz = bpy.data.objects.new(nome, None)
    raiz.empty_display_type = "PLAIN_AXES"
    raiz.empty_display_size = 0.3
    bpy.context.scene.collection.objects.link(raiz)

    pivos = {"tronco": PIV_TRONCO, "cabeca": PIV_CABECA, **PIV_BRACO, **PIV_PERNA}
    pais = {"cabeca": "tronco", "braco_e": "tronco", "braco_d": "tronco"}
    objs = {}
    for k in ("tronco", "perna_e", "perna_d", "cabeca", "braco_e", "braco_d"):
        piv = pivos[k] * esc
        polys = [([p * esc for p in f], spec) for f, spec in G[k].faces]
        ob = _objeto(f"{nome}_{k}", polys, origem=piv)
        ob.location = piv
        objs[k] = ob
    bpy.context.view_layer.update()
    for k, ob in objs.items():
        pai = objs[pais[k]] if k in pais else raiz
        ob.parent = pai
        ob.matrix_parent_inverse = pai.matrix_world.inverted()
    return raiz


# ---------------------------------------------------------------- previas
COR_PESSOAL = ["#E63946", "#FFD60A", "#9B5DE5", "#7CB342", "#FF5FA2", "#00E5FF",
               "#C77DFF", "#2EC4B6", "#8D6E63", "#D81B60", "#E0FF4F", "#00C853"]

if __name__ == "__main__":
    pasta = os.path.normpath(os.path.join(_DIR, "..", "previas"))
    os.makedirs(pasta, exist_ok=True)

    # 12 tributos lado a lado: 4 de cada empresa, cores pessoais variadas
    limpar_cena()
    objs = []
    i = 0
    for emp in EMPRESAS_VALIDAS:
        for _ in range(4):
            ob = criar_tributo(f"tributo_{i + 1:02d}_{emp}", emp, hexrgb(COR_PESSOAL[i]), seed=i + 1)
            ob.location.x = (i - 5.5) * 1.1
            objs.append(ob)
            i += 1
    previa(os.path.join(pasta, "personagens.png"), objetos=objs, dist=14, alvo=(0, 0, 0.9))

    # um tributo em todas as poses, com itens
    limpar_cena()
    sequencia = [("parado", "lanca"), ("andando_a", "faca"), ("andando_b", "arco"),
                 ("correndo", "tocha"), ("atacando", "machado"), ("coletando", None),
                 ("sentado", "faca"), ("dormindo", None), ("morto", "arco"), ("acenando", "tocha")]
    objs = []
    for i, (pose, item) in enumerate(sequencia):
        ob = criar_tributo(f"pose_{pose}", "anthropic", hexrgb("#9B5DE5"), pose=pose, item=item, seed=7)
        ob.location.x = (i - 4.5) * 1.5
        objs.append(ob)
    previa(os.path.join(pasta, "personagens_poses.png"), objetos=objs, dist=15, alvo=(0, 0, 0.9))
