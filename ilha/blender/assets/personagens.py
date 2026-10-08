"""Tributos low-poly do "Jogos Vorazes das IAs" - bonecos de maquete com uniforme por empresa.

criar_tributo(nome, empresa, cor, pose="parado", item=None, seed=0) -> objeto unico (malha ja juntada)
criar_tributo_rig(nome, empresa, cor, seed=0) -> Empty pai; filhos cabeca, tronco, braco_e, braco_d,
    perna_e, perna_d com pivôs nas articulações (pescoço, ombros, quadril), tronco pai de cabeça e braços.

Unidades: 1 unidade = 1 m, altura ~1,8 m, origem no chão e centrada em x/y.
Execução direta gera as prévias em ilha/blender/previas/personagens.png e personagens_poses.png.
"""
import math
import os
import random
import sys

import bpy
from mathutils import Euler, Matrix, Vector

try:
    _DIR = os.path.dirname(os.path.abspath(__file__))
except NameError:  # execução sem __file__
    _DIR = "/home/user/B-ias-magras-/ilha/blender/assets"
sys.path.append(_DIR)
from util import hexrgb, limpar_cena, mat_cor, previa  # noqa: E402

V = Vector

# ---------------------------------------------------------------- paleta e constantes
EMPRESAS = {
    "anthropic": {"main": "#D97757", "det": "#F0E6D2", "acento": "#F0E6D2"},  # macacao terracota, creme
    "openai": {"main": "#222222", "det": "#FFFFFF", "acento": "#10A37F"},     # preto, branco, verde-agua
    "deepseek": {"main": "#4D6BFE", "det": "#FFFFFF", "acento": "#FFFFFF"},   # azul com branco
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
BOCHECHA = "#F29A9A"
METAL = "#BFC7D0"
MADEIRA = "#8B5A2B"
CABO = "#3A2A1E"
CORDA = "#E6E6E6"
CHAMA_EXT = "#FF8A2B"
CHAMA_INT = "#FFD23F"

# articulações (x: direita = -X, esquerda = +X; personagem de frente para -Y)
PIV_TRONCO = V((0, 0, 0.78))     # quadril (pai do tronco)
PIV_CABECA = V((0, 0, 1.32))     # pescoço
PIV_BRACO = {"braco_d": V((-0.30, 0, 1.22)), "braco_e": V((0.30, 0, 1.22))}
PIV_PERNA = {"perna_d": V((-0.11, 0, 0.78)), "perna_e": V((0.11, 0, 0.78))}

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
    # deitado de lado: deita de costas (Rx -90) e depois rola sobre o eixo longitudinal (Ry 90)
    "dormindo": dict(tronco=(0, 0, 0), cabeca=(0, 0, 8), braco_d=(-30, 0, 0), braco_e=(-20, 0, 0),
                     perna_d=(25, 0, 0), perna_e=(-15, 0, 0), G=[(-90, 0, 0), (0, 90, 0)]),
    # deitado de costas, braços abertos
    "morto": dict(tronco=(0, 0, 0), cabeca=(0, 0, 20), braco_d=(0, 55, 0), braco_e=(0, -55, 0),
                  perna_d=(0, 0, -4), perna_e=(0, 0, 4), G=[(-90, 0, 0)]),
    "acenando": dict(tronco=(0, 0, 0), cabeca=(0, 0, 8), braco_d=(0, 155, 0), braco_e=(0, -12, 0),
                     perna_d=(0, 0, 0), perna_e=(0, 0, 0)),
}


# ---------------------------------------------------------------- geometria
def _solido(base, topo, spec):
    """Faces (quads) de um sólido convexo com base e topo de 4 pontos; orientadas para fora."""
    cen = sum(base + topo, V((0, 0, 0))) / 8
    faces = [base[::-1], topo[:]]
    for i in range(4):
        j = (i + 1) % 4
        faces.append([base[i], base[j], topo[j], topo[i]])
    saida = []
    for f in faces:
        c = sum(f, V((0, 0, 0))) / len(f)
        n = (f[1] - f[0]).cross(f[2] - f[0])
        if n.dot(c - cen) < 0:
            f = f[::-1]
        saida.append((f, spec))
    return saida


class _Grupo:
    """Geometria de uma parte articulada, em coordenadas do personagem em pé (antes da pose)."""

    def __init__(self):
        self.faces = []

    def frustum(self, z0, z1, w0, d0, w1, d1, cor, x=0.0, y=0.0, dx=0.0, dy=0.0, emissao=0.0):
        base = [V((x - w0 / 2, y - d0 / 2, z0)), V((x + w0 / 2, y - d0 / 2, z0)),
                V((x + w0 / 2, y + d0 / 2, z0)), V((x - w0 / 2, y + d0 / 2, z0))]
        topo = [V((x + dx - w1 / 2, y + dy - d1 / 2, z1)), V((x + dx + w1 / 2, y + dy - d1 / 2, z1)),
                V((x + dx + w1 / 2, y + dy + d1 / 2, z1)), V((x + dx - w1 / 2, y + dy + d1 / 2, z1))]
        self.faces += _solido(base, topo, (tuple(cor), float(emissao)))

    def caixa(self, x, y, z0, z1, w, d, cor, emissao=0.0):
        self.frustum(z0, z1, w, d, w, d, cor, x, y, emissao=emissao)


def _item(g, item):
    """Item na mão direita (grupo braco_d, em coordenadas do braço pendurado)."""
    if item is None:
        return
    if item not in ITENS:
        raise ValueError(f"item invalido: {item}")
    x, y = -0.30, -0.12  # na frente da mão
    if item == "faca":
        g.caixa(x, y, 0.60, 0.68, 0.035, 0.035, hexrgb(CABO))
        g.caixa(x, y, 0.68, 0.70, 0.075, 0.03, hexrgb(METAL))
        g.caixa(x, y, 0.70, 0.90, 0.03, 0.01, hexrgb(METAL))
    elif item == "lanca":
        g.caixa(x, y, 0.25, 1.62, 0.03, 0.03, hexrgb(MADEIRA))
        g.frustum(1.62, 1.80, 0.06, 0.06, 0.004, 0.004, hexrgb(METAL), x, y)
    elif item == "arco":
        n = 11
        for k in range(n):
            t = -1 + 2 * k / (n - 1)
            z = 0.63 + 0.46 * t
            g.caixa(x, -0.14 - 0.10 * (1 - t * t), z - 0.04, z + 0.04, 0.03, 0.03, hexrgb(MADEIRA))
        g.caixa(x, -0.14, 0.17, 1.09, 0.006, 0.006, hexrgb(CORDA))
    elif item == "machado":
        g.caixa(x, y, 0.50, 1.02, 0.04, 0.04, hexrgb(MADEIRA))
        g.frustum(0.98, 1.16, 0.14, 0.03, 0.04, 0.03, hexrgb(METAL), x - 0.05, y)
    elif item == "tocha":
        g.caixa(x, y, 0.42, 0.90, 0.035, 0.035, hexrgb(MADEIRA))
        g.frustum(0.88, 1.00, 0.10, 0.10, 0.02, 0.02, hexrgb(CHAMA_EXT), x, y, emissao=0.8)
        g.frustum(0.88, 0.99, 0.06, 0.06, 0.012, 0.012, hexrgb(CHAMA_INT), x, y, emissao=1.0)


def _construir(empresa, cor, sorteio, item=None):
    """Monta as 6 partes do tributo em pé. Retorna dict parte -> _Grupo."""
    e = EMPRESAS[empresa]
    main, det, acento = hexrgb(e["main"]), hexrgb(e["det"]), hexrgb(e["acento"])
    pele = hexrgb(sorteio["pele"])
    cabelo = hexrgb(sorteio["cabelo"])
    cor = tuple(cor)
    G = {k: _Grupo() for k in PARTES}

    # tronco: macacao, cinto, peitoral (logo), mochila, gola, pescoco
    t = G["tronco"]
    t.frustum(0.78, 1.26, 0.36, 0.24, 0.46, 0.28, main)
    t.frustum(0.79, 0.85, 0.38, 0.265, 0.38, 0.265, det)
    t.caixa(0, -0.146, 1.00, 1.12, 0.13, 0.024, acento)
    t.caixa(0, 0.20, 0.98, 1.24, 0.28, 0.12, hexrgb(MOCHILA))
    t.caixa(0, 0, 1.25, 1.29, 0.26, 0.20, det)
    t.caixa(0, 0, 1.25, 1.33, 0.14, 0.14, pele)
    if item == "arco":  # aljava com flechas nas costas
        t.caixa(0.17, 0.19, 1.02, 1.36, 0.08, 0.08, hexrgb(ALJAVA))
        t.caixa(0.17, 0.19, 1.30, 1.46, 0.02, 0.02, hexrgb(FLECHA))
        t.caixa(0.17, 0.19, 1.44, 1.48, 0.03, 0.03, hexrgb(PENA))

    # bracos: manga, punho (acento), mao em bloco; braçadeira na cor pessoal no braço esquerdo
    for lado, x in (("braco_d", -0.30), ("braco_e", 0.30)):
        g = G[lado]
        g.caixa(x, 0, 0.76, 1.22, 0.14, 0.14, main)
        g.caixa(x, 0, 0.70, 0.76, 0.16, 0.16, acento)
        g.caixa(x, 0, 0.56, 0.70, 0.14, 0.14, pele)
    G["braco_e"].caixa(0.30, 0, 0.98, 1.10, 0.155, 0.155, cor)
    _item(G["braco_d"], item)

    # pernas: calca no mesmo macacao, botas escuras
    for lado, x in (("perna_e", 0.11), ("perna_d", -0.11)):
        G[lado].caixa(x, 0, 0.12, 0.80, 0.18, 0.20, main)
        G[lado].caixa(x, -0.02, 0.00, 0.13, 0.20, 0.26, hexrgb(BOTA))

    # cabeça: rosto simples, faixa na cor pessoal, cabelo conforme o estilo
    h = G["cabeca"]
    h.caixa(0, 0, 1.32, 1.72, 0.40, 0.38, pele)
    for x in (-0.21, 0.21):
        h.caixa(x, 0, 1.46, 1.56, 0.04, 0.08, pele)
    for x in (-0.095, 0.095):
        h.caixa(x, -0.20, 1.495, 1.565, 0.05, 0.02, hexrgb(OLHO))
    for x in (-0.13, 0.13):
        h.caixa(x, -0.195, 1.42, 1.46, 0.06, 0.02, hexrgb(BOCHECHA))
    h.caixa(0, -0.20, 1.385, 1.415, 0.07, 0.02, hexrgb(BOCA))
    h.caixa(0, 0, 1.58, 1.64, 0.44, 0.42, cor)
    estilo = sorteio["estilo"]
    if estilo != "careca":  # cabelo em cupula (tronco de piramide), não tampa reta
        h.frustum(1.645, 1.77, 0.44, 0.42, 0.38, 0.36, cabelo, 0, 0.01)
    if estilo == "rabo":
        h.caixa(0, 0.24, 1.30, 1.62, 0.12, 0.10, cabelo)
        h.caixa(0, 0.24, 1.60, 1.66, 0.14, 0.12, cor)
    elif estilo == "topete":
        h.frustum(1.765, 1.86, 0.17, 0.21, 0.07, 0.12, cabelo, 0, 0, 0, -0.05)
    return G


def _rot(graus):
    """Matriz 4x4 de rotação Euler XYZ (em graus)."""
    return Euler([math.radians(a) for a in graus], "XYZ").to_matrix().to_4x4()


def _em_torno(p, R):
    return Matrix.Translation(p) @ R @ Matrix.Translation(-p)


def _matrizes(pose):
    """Matriz global de cada parte para uma pose (hierarquia: tronco -> cabeça e braços; quadril -> pernas)."""
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
    """Centraliza em x/y e põe a base (menor z) no chão."""
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
    """Cria um único objeto de malha (flat shading) a partir de polígonos; vértices relativos a 'origem'."""
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
    """Tributo como objeto único. cor = (r,g,b) 0..1 da faixa e da braçadeira."""
    _checar(empresa, pose, item)
    sorteio = _sorteio(seed)
    G = _construir(empresa, cor, sorteio, item)
    return _objeto(nome, _montar(G, pose, sorteio["escala"]))


def criar_tributo_rig(nome, empresa, cor, seed=0):
    """Tributo em pose de repouso com partes separadas. Retorna o Empty pai.

    Filhos (objetos): <nome>_tronco (pivô no quadril, pai de <nome>_cabeca, <nome>_braco_e, <nome>_braco_d),
    <nome>_perna_e e <nome>_perna_d (pivôs no quadril, pais do Empty). Cada objeto tem origem no próprio pivô.
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
