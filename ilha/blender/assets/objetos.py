"""Objetos low-poly de "Jogos Vorazes das IAs" (contrato: ilha/blender/SPEC.md).

Cada criar_<item>(nome, seed=0, **opcoes) devolve um objeto de malha: 1 unidade = 1 m,
origem no chão e centralizada em x/y, flat shading, materiais simples via util.mat_cor.
Prévias: xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P ilha/blender/assets/objetos.py
"""
import math
import os
import random
import sys

import bpy
from mathutils import Euler, Vector

_DIR = (os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals()
        else "/home/user/B-ias-magras-/ilha/blender/assets")
sys.path.append(_DIR)
from util import limpar_cena, mat_cor, previa  # noqa: E402

# nome: (cor sRGB 0..1, roughness, emissão)
_MATS = {
    "madeira": ((0.55, 0.36, 0.20), 0.9, 0.0),
    "madeira_clara": ((0.74, 0.55, 0.34), 0.9, 0.0),
    "madeira_escura": ((0.36, 0.23, 0.14), 0.95, 0.0),
    "ouro": ((0.96, 0.76, 0.26), 0.3, 0.0),
    "ouro_escuro": ((0.78, 0.52, 0.16), 0.4, 0.0),
    "bronze": ((0.62, 0.40, 0.18), 0.4, 0.0),
    "couro": ((0.42, 0.26, 0.14), 0.7, 0.0),
    "couro_escuro": ((0.28, 0.17, 0.10), 0.8, 0.0),
    "lona_verde": ((0.36, 0.46, 0.27), 0.95, 0.0),
    "lona_laranja": ((0.85, 0.50, 0.22), 0.95, 0.0),
    "lona_bege": ((0.80, 0.74, 0.58), 0.95, 0.0),
    "lona_escura": ((0.20, 0.22, 0.20), 0.95, 0.0),
    "mochila_verde": ((0.30, 0.44, 0.28), 0.9, 0.0),
    "mochila_cinza": ((0.45, 0.46, 0.44), 0.9, 0.0),
    "metal": ((0.66, 0.68, 0.70), 0.35, 0.0),
    "metal_escuro": ((0.30, 0.31, 0.33), 0.5, 0.0),
    "cantil": ((0.36, 0.44, 0.26), 0.8, 0.0),
    "agua": ((0.55, 0.80, 0.95), 0.3, 0.0),
    "azul_escuro": ((0.15, 0.40, 0.75), 0.4, 0.0),
    "branco": ((0.94, 0.94, 0.92), 0.7, 0.0),
    "vermelho": ((0.82, 0.14, 0.12), 0.7, 0.0),
    "laranja_bote": ((0.95, 0.45, 0.10), 0.6, 0.0),
    "laranja": ((0.95, 0.52, 0.12), 0.7, 0.0),
    "verde_lata": ((0.25, 0.55, 0.30), 0.6, 0.0),
    "lata": ((0.72, 0.74, 0.76), 0.4, 0.0),
    "pedra": ((0.52, 0.50, 0.47), 0.95, 0.0),
    "pedra_escura": ((0.36, 0.35, 0.34), 0.95, 0.0),
    "cinza": ((0.42, 0.40, 0.38), 1.0, 0.0),
    "carvao": ((0.12, 0.11, 0.10), 1.0, 0.0),
    "folha": ((0.26, 0.52, 0.22), 0.9, 0.0),
    "folha_escura": ((0.18, 0.38, 0.17), 0.9, 0.0),
    "corda": ((0.76, 0.62, 0.40), 0.95, 0.0),
    "pano": ((0.50, 0.40, 0.28), 1.0, 0.0),
    "fruta_vermelha": ((0.86, 0.18, 0.18), 0.5, 0.0),
    "fruta_amarela": ((0.96, 0.82, 0.22), 0.5, 0.0),
    "fruta_roxa": ((0.50, 0.22, 0.62), 0.5, 0.0),
    "fruta_verde": ((0.45, 0.70, 0.25), 0.5, 0.0),
    "para_vermelho": ((0.85, 0.16, 0.14), 0.8, 0.0),
    "para_branco": ((0.96, 0.96, 0.94), 0.8, 0.0),
    "chama_laranja": ((1.0, 0.45, 0.08), 0.6, 6.0),
    "chama_amarela": ((1.0, 0.85, 0.25), 0.6, 9.0),
    "brasa": ((1.0, 0.35, 0.05), 0.6, 4.0),
}


def _mat(nome):
    rgb, rough, emis = _MATS[nome]
    return mat_cor(nome, rgb, rough, emis)


# ---------------------------------------------------------------- geometria local
def _newell(pts):
    """Normal de polígono (regra da mão direita para a ordem dos vértices)."""
    nx = ny = nz = 0.0
    n = len(pts)
    for i in range(n):
        x1, y1, z1 = pts[i]
        x2, y2, z2 = pts[(i + 1) % n]
        nx += (y1 - y2) * (z1 + z2)
        ny += (z1 - z2) * (x1 + x2)
        nz += (x1 - x2) * (y1 + y2)
    return Vector((nx, ny, nz))


def _g_caixa(sx, sy, sz):
    hx, hy, hz = sx / 2, sy / 2, sz / 2
    p = [(-hx, -hy, -hz), (hx, -hy, -hz), (hx, hy, -hz), (-hx, hy, -hz),
         (-hx, -hy, hz), (hx, -hy, hz), (hx, hy, hz), (-hx, hy, hz)]
    f = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [0, 4, 7, 3], [1, 2, 6, 5]]
    return p, f


def _g_tronco(r1, r2, h, lados=10):
    """Cilindro/cone centrado na origem, eixo Z. r2=0 faz ponta."""
    n = lados
    p = [(r1 * math.cos(2 * math.pi * i / n), r1 * math.sin(2 * math.pi * i / n), -h / 2) for i in range(n)]
    ponta = r2 <= 1e-9
    if ponta:
        p.append((0.0, 0.0, h / 2))
    else:
        p += [(r2 * math.cos(2 * math.pi * i / n), r2 * math.sin(2 * math.pi * i / n), h / 2) for i in range(n)]
    f = []
    for i in range(n):
        j = (i + 1) % n
        if ponta:
            f.append([i, j, n])
        else:
            f.append([i, j, n + j, n + i])
    f.append(list(range(n)))
    if not ponta:
        f.append(list(range(n, 2 * n)))
    return p, f


def _g_esfera(r, seg=8, anel=5):
    p = [(0.0, 0.0, r)]
    for k in range(1, anel):
        ph = math.pi * k / anel
        for i in range(seg):
            th = 2 * math.pi * i / seg
            p.append((r * math.sin(ph) * math.cos(th), r * math.sin(ph) * math.sin(th), r * math.cos(ph)))
    p.append((0.0, 0.0, -r))
    sul = len(p) - 1

    def ix(k, i):
        return 1 + (k - 1) * seg + (i % seg)

    f = [[0, ix(1, i), ix(1, i + 1)] for i in range(seg)]
    for k in range(1, anel - 1):
        for i in range(seg):
            f.append([ix(k, i), ix(k + 1, i), ix(k + 1, i + 1), ix(k, i + 1)])
    f += [[ix(anel - 1, i), sul, ix(anel - 1, i + 1)] for i in range(seg)]
    return p, f


def _g_prisma(poli, h):
    """Polígono convexo (XY) extrudado em Z, centrado em z=0."""
    n = len(poli)
    p = [(x, y, -h / 2) for x, y in poli] + [(x, y, h / 2) for x, y in poli]
    f = []
    for i in range(n):
        j = (i + 1) % n
        f.append([i, j, n + j, n + i])
    f.append(list(range(n)))
    f.append(list(range(n, 2 * n)))
    mx = sum(x for x, _ in poli) / n
    my = sum(y for _, y in poli) / n
    return p, f, [(mx, my, 0.0)] * len(f)


def _frames(path, fechado=False):
    """Tangente, normal e binormal ao longo do caminho (transporte paralelo)."""
    m = len(path)
    tans = []
    for i in range(m):
        if fechado:
            a, b = path[(i - 1) % m], path[(i + 1) % m]
        else:
            a, b = path[max(i - 1, 0)], path[min(i + 1, m - 1)]
        d = b - a
        if d.length < 1e-9:
            d = Vector((0, 0, 1))
        tans.append(d.normalized())
    t0 = tans[0]
    ref = Vector((0, 0, 1)) if abs(t0.z) < 0.9 else Vector((1, 0, 0))
    nr = ref - t0 * ref.dot(t0)
    nr.normalize()
    out = []
    for t in tans:
        nr = nr - t * nr.dot(t)
        if nr.length < 1e-9:
            nr = t.orthogonal()
        nr.normalize()
        out.append((t, nr, t.cross(nr)))
    return out


def _g_tubo(pontos, raios, lados=8, fechado=False, tampas=(True, True)):
    path = [Vector(p) for p in pontos]
    m = len(path)
    fr = _frames(path, fechado)
    pts = []
    for i in range(m):
        _, nr, bi = fr[i]
        for j in range(lados):
            a = 2 * math.pi * j / lados
            pts.append(path[i] + (nr * math.cos(a) + bi * math.sin(a)) * raios[i])
    faces, refs = [], []
    for i in range(m if fechado else m - 1):
        i2 = (i + 1) % m
        ref = (path[i] + path[i2]) * 0.5
        for j in range(lados):
            j2 = (j + 1) % lados
            faces.append([i * lados + j, i * lados + j2, i2 * lados + j2, i2 * lados + j])
            refs.append(ref)
    if not fechado:
        if tampas[0]:
            faces.append(list(range(0, lados)))
            refs.append(path[0] + fr[0][0] * 0.1)
        if tampas[1]:
            base = (m - 1) * lados
            faces.append(list(range(base, base + lados)))
            refs.append(path[-1] - fr[-1][0] * 0.1)
    return pts, faces, refs


def _g_loft(aneis):
    """Anéis (listas de pontos, mesmo tamanho, fechados) ligados em sequência."""
    K = len(aneis)
    n = len(aneis[0])
    pts = [Vector(p) for a in aneis for p in a]
    cs = [sum((Vector(p) for p in a), Vector()) / n for a in aneis]

    def ix(k, j):
        return k * n + (j % n)

    faces, refs = [], []
    for k in range(K - 1):
        for j in range(n):
            faces.append([ix(k, j), ix(k + 1, j), ix(k + 1, j + 1), ix(k, j + 1)])
            refs.append((cs[k] + cs[k + 1]) * 0.5)
    faces.append([ix(0, j) for j in range(n)])
    refs.append(cs[0] + (cs[1] - cs[0]) * 0.3)
    faces.append([ix(K - 1, j) for j in range(n)])
    refs.append(cs[K - 1] + (cs[K - 2] - cs[K - 1]) * 0.3)
    return pts, faces, refs


def _circulo(centro, normal, r, n=12):
    nr = Vector(normal).normalized()
    u = nr.orthogonal().normalized()
    v = nr.cross(u)
    c = Vector(centro)
    return [c + (u * math.cos(2 * math.pi * k / n) + v * math.sin(2 * math.pi * k / n)) * r for k in range(n)]


class _Malha:
    """Acumula primitivas com material por face e gera um objeto Blender."""

    def __init__(self):
        self.v = []
        self.f = []
        self.mi = []
        self.mats = []
        self._slots = {}

    def _slot(self, nome):
        if nome not in self._slots:
            self._slots[nome] = len(self.mats)
            self.mats.append(_mat(nome))
        return self._slots[nome]

    def add(self, pts, faces, mat, refs=None, centro=(0, 0, 0), rot=(0, 0, 0), esc=(1, 1, 1)):
        """Adiciona faces (índices em pts). refs = ponto interno por face, para orientar normais."""
        R = Euler(rot, "XYZ").to_matrix()
        c = Vector(centro)

        def T(p):
            return c + R @ Vector((p[0] * esc[0], p[1] * esc[1], p[2] * esc[2]))

        mi = self._slot(mat)
        mapa = {}
        for f in faces:
            for i in f:
                if i not in mapa:
                    mapa[i] = len(self.v)
                    self.v.append(T(pts[i]))
        for k, f in enumerate(faces):
            gi = [mapa[i] for i in f]
            P = [self.v[g] for g in gi]
            cen = sum(P, Vector()) / len(P)
            ref = T(refs[k]) if refs else c
            if _newell(P).dot(cen - ref) < 0:
                gi.reverse()
            self.f.append(gi)
            self.mi.append(mi)

    def caixa(self, centro, tam, mat, rot=(0, 0, 0)):
        p, f = _g_caixa(*tam)
        self.add(p, f, mat, centro=centro, rot=rot)

    def tronco(self, centro, r1, r2, h, mat, rot=(0, 0, 0), lados=10, esc=(1, 1, 1)):
        p, f = _g_tronco(r1, r2, h, lados)
        self.add(p, f, mat, centro=centro, rot=rot, esc=esc)

    def esfera(self, centro, r, mat, esc=(1, 1, 1), seg=8, anel=5, rot=(0, 0, 0)):
        p, f = _g_esfera(r, seg, anel)
        self.add(p, f, mat, centro=centro, rot=rot, esc=esc)

    def prisma(self, poli, h, mat, centro=(0, 0, 0), rot=(0, 0, 0)):
        p, f, refs = _g_prisma(poli, h)
        self.add(p, f, mat, refs=refs, centro=centro, rot=rot)

    def tubo(self, pontos, raios, mat, lados=8, fechado=False, tampas=(True, True)):
        if not hasattr(raios, "__len__"):
            raios = [raios] * len(pontos)
        p, f, refs = _g_tubo(pontos, raios, lados, fechado, tampas)
        self.add(p, f, mat, refs=refs)

    def loft(self, aneis, mat):
        p, f, refs = _g_loft(aneis)
        self.add(p, f, mat, refs=refs)

    def triangulos(self):
        return sum(len(f) - 2 for f in self.f)

    def objeto(self, nome, ancorar=True):
        """Cria o objeto: origem no chão (menor z = 0) e centro em x/y."""
        vs = list(self.v)
        if ancorar and vs:
            xs = [v.x for v in vs]
            ys = [v.y for v in vs]
            zs = [v.z for v in vs]
            dx = -(min(xs) + max(xs)) / 2
            dy = -(min(ys) + max(ys)) / 2
            dz = -min(zs)
            vs = [(v.x + dx, v.y + dy, v.z + dz) for v in vs]
        else:
            vs = [tuple(v) for v in vs]
        me = bpy.data.meshes.new(nome)
        me.from_pydata(vs, [], self.f)
        me.update()
        for m in self.mats:
            me.materials.append(m)
        for poly, mi in zip(me.polygons, self.mi):
            poly.material_index = mi
        ob = bpy.data.objects.new(nome, me)
        bpy.context.scene.collection.objects.link(ob)
        ob["triangulos"] = self.triangulos()
        return ob


# ---------------------------------------------------------------- itens
def criar_cornucopia(nome, seed=0, **opcoes):
    """Chifre dourado gigante, espiral na ponta, boca larga virada para fora, deitado no chão."""
    rng = random.Random(seed)
    comp = opcoes.get("comprimento", 6.0)
    N = 72
    ds = comp / N
    xy = [(0.0, 0.0)]
    phi = rng.uniform(-0.1, 0.1)
    for i in range(N):
        s = i / N
        phi += (1.5 * (1 - s) ** 2 + 0.12) * ds  # curvatura forte na ponta -> espiral
        x, y = xy[-1]
        xy.append((x + ds * math.cos(phi), y + ds * math.sin(phi)))
    raios = [0.07 + 0.95 * (i / N) ** 2.0 for i in range(N + 1)]
    # a boca sobe um pouco para aparecer de cima
    linha = [Vector((x, y, r + 6.0 * max(0.0, i / N - 0.6) ** 2))
             for i, ((x, y), r) in enumerate(zip(xy, raios))]
    fr = _frames(linha)
    m = _Malha()
    m.tubo(linha, raios, "ouro", lados=14, tampas=(True, False))
    # faixa espiralada em volta do chifre
    hel, rh = [], []
    for i in range(4, N - 3):
        _, nr, bi = fr[i]
        th = 2 * math.pi * 4 * i / N
        hel.append(linha[i] + (nr * math.cos(th) + bi * math.sin(th)) * (raios[i] + 0.03))
        rh.append(0.045)
    m.tubo(hel, rh, "bronze", lados=5)
    # aro da boca
    t_fim, nr_fim, bi_fim = fr[-1]
    angs = [2 * math.pi * k / 14 for k in range(14)]
    aro = [linha[-1] + (nr_fim * math.cos(a) + bi_fim * math.sin(a)) * (raios[-1] + 0.03) for a in angs]
    m.tubo(aro, [0.06] * 14, "ouro_escuro", lados=6, fechado=True)
    # frutas derramadas na frente da boca
    zchao = min(p.z - r for p, r in zip(linha, raios))
    for k, mat in enumerate(["fruta_vermelha", "fruta_amarela", "fruta_roxa", "fruta_verde", "fruta_amarela"]):
        d = 0.7 + 0.35 * k + rng.uniform(0, 0.2)
        lat = rng.uniform(-0.5, 0.5)
        cx = linha[-1].x + t_fim.x * d - t_fim.y * lat
        cy = linha[-1].y + t_fim.y * d + t_fim.x * lat
        r = rng.uniform(0.13, 0.18)
        m.esfera((cx, cy, zchao + r), r, mat, seg=7, anel=4)
    return m.objeto(nome)


def criar_caixote(nome, seed=0, **opcoes):
    """Caixote de madeira com ripas, cantoneiras e tampa."""
    rng = random.Random(seed)
    m = _Malha()
    L = opcoes.get("largura", rng.uniform(0.8, 1.0))
    P = opcoes.get("profundidade", rng.uniform(0.6, 0.7))
    H = opcoes.get("altura", rng.uniform(0.55, 0.7))
    tom = rng.choice(["madeira", "madeira_clara"])
    m.caixa((0, 0, H / 2), (L, P, H), tom)
    for z in (H * 0.25, H * 0.5, H * 0.75):
        m.caixa((0, -P / 2 - 0.004, z), (L, 0.012, 0.03), "madeira_escura")
        m.caixa((0, P / 2 + 0.004, z), (L, 0.012, 0.03), "madeira_escura")
    for y in (-P / 4, P / 4):
        m.caixa((0, y, H + 0.005), (L, 0.05, 0.01), "madeira_escura")
    for sx in (-1, 1):
        for sy in (-1, 1):
            m.caixa((sx * L / 2, sy * P / 2, H / 2), (0.06, 0.06, H + 0.01), "madeira_escura")
    return m.objeto(nome)


def criar_mochila(nome, seed=0, **opcoes):
    """Mochila de lona com aba, bolsos laterais e rolo de cobertor em cima."""
    rng = random.Random(seed)
    m = _Malha()
    cor = rng.choice(["mochila_verde", "mochila_cinza"])
    m.esfera((0, 0, 0.42), 1.0, cor, esc=(0.24, 0.17, 0.36), seg=8, anel=5)
    m.caixa((0, -0.17, 0.62), (0.36, 0.05, 0.2), "couro")
    for sx in (-1, 1):
        m.caixa((sx * 0.25, 0, 0.35), (0.05, 0.12, 0.22), "couro")
    m.tronco((0, 0, 0.8), 0.1, 0.1, 0.42, "madeira_clara", rot=(0, math.pi / 2, 0), lados=8)
    return m.objeto(nome)


def criar_cantil(nome, seed=0, **opcoes):
    """Cantil metálico achatado com tampa."""
    m = _Malha()
    m.esfera((0, 0, 0.13), 1.0, "cantil", esc=(0.09, 0.035, 0.11), seg=10, anel=6)
    m.tronco((0, 0, 0.255), 0.03, 0.03, 0.03, "metal_escuro", lados=8)
    m.tronco((0, 0, 0.285), 0.035, 0.035, 0.03, "metal", lados=8)
    return m.objeto(nome)


def criar_garrafa_agua(nome, seed=0, **opcoes):
    """Garrafa d'água de plástico azul com rótulo."""
    m = _Malha()
    m.tronco((0, 0, 0.11), 0.042, 0.042, 0.22, "agua", lados=10)
    m.tronco((0, 0, 0.12), 0.044, 0.044, 0.08, "branco", lados=10)
    m.tronco((0, 0, 0.245), 0.042, 0.016, 0.05, "agua", lados=10)
    m.tronco((0, 0, 0.28), 0.016, 0.016, 0.03, "agua", lados=8)
    m.tronco((0, 0, 0.31), 0.02, 0.02, 0.03, "azul_escuro", lados=8)
    return m.objeto(nome)


def criar_lata_comida(nome, seed=0, **opcoes):
    """Lata de comida com rótulo colorido e lingueta."""
    rng = random.Random(seed)
    m = _Malha()
    m.tronco((0, 0, 0.055), 0.05, 0.05, 0.11, "lata", lados=12)
    m.tronco((0, 0, 0.056), 0.0508, 0.0508, 0.06, rng.choice(["vermelho", "laranja", "verde_lata"]), lados=12)
    m.tronco((0, 0, 0.112), 0.044, 0.044, 0.004, "metal_escuro", lados=12)
    m.caixa((0.008, 0, 0.1165), (0.03, 0.014, 0.003), "metal")
    return m.objeto(nome)


def criar_frutas(nome, seed=0, **opcoes):
    """Cacho de frutas (tipo uva) com haste e folha, no chão."""
    rng = random.Random(seed)
    m = _Malha()
    principal = opcoes.get("cor", rng.choice(["fruta_vermelha", "fruta_roxa", "fruta_amarela", "fruta_verde"]))
    destaque = rng.choice(["fruta_amarela", "fruta_vermelha", "fruta_verde"])
    pos = []
    for k in range(6):
        a = 2 * math.pi * k / 6
        pos.append((0.11 * math.cos(a), 0.11 * math.sin(a), 0.075))
    for k in range(4):
        a = 2 * math.pi * k / 4 + 0.4
        pos.append((0.055 * math.cos(a), 0.055 * math.sin(a), 0.13))
    pos.append((0.0, 0.0, 0.18))
    for i, (x, y, z) in enumerate(pos):
        m.esfera((x, y, z), 0.075, destaque if i % 4 == 2 else principal, seg=7, anel=4)
    m.tubo([(0, 0, 0.16), (0.01, 0, 0.27), (0.03, 0, 0.32)], [0.012, 0.01, 0.008], "madeira", lados=5)
    m.prisma([(0.0, 0.0), (0.1, 0.04), (0.2, 0.0), (0.1, -0.04)], 0.008, "folha",
             centro=(0.05, 0, 0.33), rot=(0.5, 0, 0.6))
    return m.objeto(nome)


def criar_faca(nome, seed=0, **opcoes):
    """Faca deitada no chão: cabo de couro, guarda e lâmina triangular."""
    m = _Malha()
    m.tronco((-0.075, 0, 0.013), 0.013, 0.013, 0.12, "couro", rot=(0, math.pi / 2, 0), lados=8)
    m.caixa((0, 0, 0.013), (0.012, 0.05, 0.026), "metal_escuro")
    poli = [(0.006, -0.0125), (0.006, 0.0125), (0.106, 0.0)]
    m.prisma(poli, 0.003, "metal", centro=(0, 0, 0.013))
    return m.objeto(nome)


def criar_lanca(nome, seed=0, **opcoes):
    """Lança de madeira em pé, com ponta de metal e amarras de couro."""
    comp = opcoes.get("comprimento", 2.0)
    m = _Malha()
    m.tronco((0, 0, comp / 2), 0.02, 0.016, comp, "madeira_clara", lados=7)
    m.tronco((0, 0, comp + 0.11), 0.035, 0.0, 0.22, "metal", lados=6)
    for z in (comp - 0.25, comp - 0.4):
        pts = [(0.026 * math.cos(a), 0.026 * math.sin(a), z) for a in [2 * math.pi * k / 8 for k in range(8)]]
        m.tubo(pts, [0.008] * 8, "couro", lados=5, fechado=True)
    return m.objeto(nome)


def criar_arco(nome, seed=0, **opcoes):
    """Arco de madeira em pé (com corda), aljava de couro e flechas."""
    rng = random.Random(seed)
    m = _Malha()
    R, meio, cx = 1.1, 0.62, 0.8
    cz = R * math.sin(meio)
    n = 15
    arco, raios = [], []
    for k in range(n):
        t = k / (n - 1)
        th = math.pi - meio + 2 * meio * t
        arco.append((cx + R * math.cos(th), 0.0, cz + R * math.sin(th)))
        raios.append(0.011 + 0.016 * math.sin(math.pi * t))
    m.tubo(arco, raios, "madeira", lados=6)
    xc = cx - R * math.cos(meio)
    m.tubo([(xc, 0, 0.0), (xc, 0, 2 * cz)], [0.005, 0.005], "corda", lados=3)
    # aljava
    m.tronco((0.5, 0.2, 0.3), 0.085, 0.07, 0.6, "couro", lados=10)
    angs = [2 * math.pi * k / 10 for k in range(10)]
    m.tubo([(0.5 + 0.07 * math.cos(a), 0.2 + 0.07 * math.sin(a), 0.6) for a in angs],
           [0.01] * 10, "couro_escuro", lados=5, fechado=True)
    for _ in range(6):
        a = rng.uniform(0, 2 * math.pi)
        p0 = (0.5 + 0.03 * math.cos(a), 0.2 + 0.03 * math.sin(a), 0.3)
        top = Vector((0.5 + rng.uniform(-0.1, 0.1), 0.2 + rng.uniform(-0.1, 0.1), rng.uniform(0.95, 1.1)))
        d = (top - Vector(p0)).normalized()
        ponta_base = top - d * 0.07
        m.tubo([p0, tuple(ponta_base)], [0.006, 0.006], "madeira_clara", lados=5)
        m.tubo([tuple(ponta_base), tuple(top)], [0.02, 0.0005], "metal", lados=5)
    return m.objeto(nome)


def criar_machado(nome, seed=0, **opcoes):
    """Machado deitado no chão cabo de madeira e lâmina de metal."""
    m = _Malha()
    m.tronco((0, 0, 0.02), 0.02, 0.02, 0.72, "madeira", rot=(0, math.pi / 2, 0), lados=7)
    poli = [(0.27, 0.0), (0.40, 0.02), (0.44, 0.07), (0.40, 0.13), (0.27, 0.12)]
    m.prisma(poli, 0.03, "metal", rot=(math.pi / 2, 0, 0))
    return m.objeto(nome)


def criar_tocha(nome, seed=0, **opcoes):
    """Tocha em pé com trapo embebido e chama emissiva (cones laranja e amarelo)."""
    m = _Malha()
    m.tronco((0, 0, 0.375), 0.016, 0.022, 0.75, "madeira", lados=7)
    m.tronco((0, 0, 0.80), 0.03, 0.035, 0.12, "pano", lados=8)
    m.tronco((0, 0, 1.0), 0.05, 0.0, 0.28, "chama_laranja", rot=(0.08, 0, 0.3), lados=7)
    m.tronco((0.01, 0, 0.96), 0.03, 0.0, 0.2, "chama_amarela", lados=6)
    return m.objeto(nome)


def criar_kit_medico(nome, seed=0, **opcoes):
    """Caixa branca com cruz vermelha no topo."""
    m = _Malha()
    m.caixa((0, 0, 0.06), (0.36, 0.22, 0.12), "branco")
    m.caixa((0, 0, 0.1215), (0.2, 0.06, 0.004), "vermelho")
    m.caixa((0, 0, 0.1215), (0.06, 0.2, 0.004), "vermelho")
    return m.objeto(nome)


def criar_corda(nome, seed=0, **opcoes):
    """Corda enrolada em espiral (rolo) no chão."""
    rng = random.Random(seed)
    voltas, por_volta = 5, 20
    pts = []
    for k in range(voltas * por_volta + 1):
        th = 2 * math.pi * k / por_volta
        r = 0.2 - 0.02 * (k / (voltas * por_volta)) + rng.uniform(-0.003, 0.003)
        pts.append((r * math.cos(th), r * math.sin(th), 0.022 + 0.035 * k / por_volta))
    m = _Malha()
    m.tubo(pts, [0.022] * len(pts), "corda", lados=6)
    return m.objeto(nome)


def criar_fogueira(nome, seed=0, **opcoes):
    """Fogueira em anel de pedras. acesa=True: lenha em tripé e chamas emissivas;
    acesa=False: brasas apagadas, cinzas e carvão."""
    rng = random.Random(seed)
    acesa = opcoes.get("acesa", True)
    m = _Malha()
    for k in range(9):
        a = 2 * math.pi * k / 9 + rng.uniform(-0.12, 0.12)
        r = 0.66 + rng.uniform(-0.04, 0.04)
        s = rng.uniform(0.12, 0.15)
        m.esfera((r * math.cos(a), r * math.sin(a), 0.6 * s), s, rng.choice(["pedra", "pedra_escura"]),
                 esc=(1.1, 1.0, 0.6), seg=6, anel=4)
    if acesa:
        for k in range(5):
            a = 2 * math.pi * k / 5 + rng.uniform(-0.2, 0.2)
            base = (0.36 * math.cos(a), 0.36 * math.sin(a), 0.04)
            topo = (0.05 * math.cos(a), 0.05 * math.sin(a), 0.42)
            m.tubo([base, topo], [0.05, 0.045], "madeira_escura", lados=6)
        for k in range(3):
            a = 2 * math.pi * k / 3 + rng.uniform(-0.3, 0.3)
            rr = rng.uniform(0.0, 0.1)
            h = rng.uniform(0.6, 0.85)
            m.tronco((rr * math.cos(a), rr * math.sin(a), 0.12 + h / 2), 0.2, 0.0, h, "chama_laranja",
                     rot=(rng.uniform(-0.12, 0.12), 0, rng.uniform(-0.12, 0.12)), lados=7)
        for k in range(2):
            a = 2 * math.pi * k / 2 + rng.uniform(-0.4, 0.4)
            m.tronco((0.03 * math.cos(a), 0.03 * math.sin(a), 0.12 + 0.25), 0.11, 0.0, 0.5,
                     "chama_amarela", rot=(0, 0, rng.uniform(0, 1)), lados=6)
        for k in range(6):
            a = 2 * math.pi * k / 6 + rng.uniform(-0.2, 0.2)
            rr = rng.uniform(0.2, 0.3)
            m.esfera((rr * math.cos(a), rr * math.sin(a), 0.045), 0.045, "brasa", seg=5, anel=3)
    else:
        for k in range(4):
            a = 2 * math.pi * k / 4 + rng.uniform(-0.3, 0.3)
            p0 = (0.35 * math.cos(a), 0.35 * math.sin(a), 0.04)
            p1 = (-0.35 * math.cos(a + 0.3), -0.35 * math.sin(a + 0.3), 0.04)
            m.tubo([p0, p1], [0.04, 0.035], "carvao", lados=6)
        m.tronco((0, 0, 0.015), 0.42, 0.4, 0.03, "cinza", lados=10)
        for k in range(4):
            a = rng.uniform(0, 2 * math.pi)
            rr = rng.uniform(0.0, 0.3)
            m.esfera((rr * math.cos(a), rr * math.sin(a), 0.03), 0.05, "carvao", esc=(1, 1, 0.6), seg=5, anel=3)
    return m.objeto(nome)


def criar_abrigo_galhos(nome, seed=0, **opcoes):
    """Abrigo triangular de galhos com telhado de folhas (aberto na frente e atrás)."""
    rng = random.Random(seed)
    m = _Malha()
    W, C, H = 0.8, 1.2, 1.25
    nu, nv = 3, 4
    for s in (-1, 1):
        pts = []
        for u in range(nu + 1):
            for v in range(nv + 1):
                uu, vv = u / nu, v / nv
                x = s * W * (1 - uu) + rng.uniform(-0.03, 0.03)
                y = -C + 2 * C * vv
                z = H * uu + (rng.uniform(-0.03, 0.03) if 0 < u < nu else 0.0)
                pts.append((x, y, z))

        def ix(u, v):
            return u * (nv + 1) + v

        claras, escuras = [], []
        for u in range(nu):
            for v in range(nv):
                q = [ix(u, v), ix(u + 1, v), ix(u + 1, v + 1), ix(u, v + 1)]
                (claras if (u + v) % 2 == 0 else escuras).append(q)
        m.add(pts, claras, "folha")
        m.add(pts, escuras, "folha_escura")
    m.tubo([(0, -C, H), (0, C, H)], [0.035, 0.035], "madeira", lados=6)
    for y in (-C, C):
        m.tubo([(-W, y, 0), (0, y, H), (W, y, 0)], [0.03, 0.03, 0.03], "madeira", lados=5)
    for s in (-1, 1):
        m.tubo([(s * W, -C, 0.03), (s * W, C, 0.03)], [0.03, 0.03], "madeira_escura", lados=5)
    for u in (0.33, 0.66):
        for s in (-1, 1):
            x = s * W * (1 - u)
            m.tubo([(x, -C * 0.97, H * u + 0.03), (x, C * 0.97, H * u + 0.03)], [0.022, 0.022],
                   "madeira", lados=5)
    return m.objeto(nome)


def criar_barraca_lona(nome, seed=0, **opcoes):
    """Barraca de lona de duas pessoas, com porta escura, varas e cordas de fixação."""
    rng = random.Random(seed)
    m = _Malha()
    cor = opcoes.get("cor", rng.choice(["lona_verde", "lona_laranja", "lona_bege"]))
    W, C, H = 0.85, 1.1, 1.1
    for s in (-1, 1):
        m.add([(s * W, -C, 0), (0, -C, H), (0, C, H), (s * W, C, 0)], [[0, 1, 2, 3]], cor)
    m.add([(-W, -C, 0), (W, -C, 0), (0, -C, H)], [[0, 1, 2]], cor)
    m.add([(-W, C, 0), (W, C, 0), (0, C, H)], [[0, 1, 2]], cor)
    m.add([(-0.3, -C - 0.01, 0), (0.3, -C - 0.01, 0), (0.3, -C - 0.01, 0.7), (-0.3, -C - 0.01, 0.7)],
          [[0, 1, 2, 3]], "lona_escura")
    m.tubo([(0, -C, H), (0, C, H)], [0.025, 0.025], "madeira_clara", lados=5)
    for y in (-C, C):
        m.tubo([(-W, y, 0), (0, y, H), (W, y, 0)], [0.025, 0.025, 0.025], "madeira_clara", lados=5)
    for s in (-1, 1):
        for y in (-C, C):
            m.tubo([(0, y, H), (s * (W + 0.6), y * 1.5, 0)], [0.008, 0.008], "corda", lados=3)
    return m.objeto(nome)


def criar_armadilha(nome, seed=0, **opcoes):
    """Armadilha de estacas afiadas em círculo, amarradas por cordas."""
    rng = random.Random(seed)
    m = _Malha()
    n = 10
    for k in range(n):
        a = 2 * math.pi * k / n + rng.uniform(-0.1, 0.1)
        base = (0.5 * math.cos(a), 0.5 * math.sin(a), 0.0)
        ponta = (0.72 * math.cos(a), 0.72 * math.sin(a), 0.85 + rng.uniform(-0.1, 0.1))
        m.tubo([base, ponta], [0.05, 0.004], "madeira", lados=6)
    for z, r in ((0.35, 0.59), (0.7, 0.67)):
        pts = [(r * math.cos(2 * math.pi * k / 16), r * math.sin(2 * math.pi * k / 16), z) for k in range(16)]
        m.tubo(pts, [0.022] * 16, "corda", lados=5, fechado=True)
    return m.objeto(nome)


def criar_caixa_paraquedas(nome, seed=0, **opcoes):
    """Caixa de suprimentos no chão com paraquedas listrado (vermelho/branco) acima e cordas.
    paraquedas=False deixa só a caixa; altura_dossel e raio ajustam o paraquedas."""
    m = _Malha()
    L, P, H = 0.9, 0.7, 0.6
    m.caixa((0, 0, H / 2), (L, P, H), "madeira_clara")
    for x in (-0.22, 0.22):
        m.caixa((x, 0, H + 0.006), (0.06, P + 0.03, 0.012), "metal_escuro")
    for y in (-P / 2 - 0.006, P / 2 + 0.006):
        m.caixa((0, y, H * 0.5), (L + 0.02, 0.012, 0.06), "metal_escuro")
    if opcoes.get("paraquedas", True):
        Ht = opcoes.get("altura_dossel", 3.6)
        R = opcoes.get("raio", 2.0)
        G, K = 12, 4
        pts = [(0.0, 0.0, R)]

        def ix(k, g):
            return 1 + (k - 1) * G + (g % G)

        for k in range(1, K + 1):
            ph = (math.pi / 2) * k / K
            for g in range(G):
                th = 2 * math.pi * g / G
                pts.append((R * math.sin(ph) * math.cos(th), R * math.sin(ph) * math.sin(th), R * math.cos(ph)))
        por_mat = {"para_vermelho": [], "para_branco": []}
        for g in range(G):
            mat = "para_vermelho" if g % 2 == 0 else "para_branco"
            por_mat[mat].append([0, ix(1, g), ix(1, g + 1)])
            for k in range(1, K):
                por_mat[mat].append([ix(k, g), ix(k + 1, g), ix(k + 1, g + 1), ix(k, g + 1)])
        for mat, faces in por_mat.items():
            m.add(pts, faces, mat, centro=(0, 0, Ht))
        cantos = [(-0.4, -0.3), (0.4, -0.3), (0.4, 0.3), (-0.4, 0.3)]
        for k in range(8):
            th = 2 * math.pi * k / 8
            borda = Vector((R * math.cos(th), R * math.sin(th), Ht))
            cx_, cy_ = cantos[k % 4]
            m.tubo([borda, Vector((cx_, cy_, H))], [0.006, 0.006], "corda", lados=4)
    return m.objeto(nome)


criar_caixa_suprimentos = criar_caixa_paraquedas


def criar_balsa(nome, seed=0, **opcoes):
    """Balsa de troncos amarrados, com travessas e cintas de corda."""
    rng = random.Random(seed)
    m = _Malha()
    Lg = 3.6
    for y in (-0.78, -0.52, -0.26, 0.0, 0.26, 0.52, 0.78):
        r = rng.uniform(0.11, 0.14)
        m.tronco((0, y, r), r, r, Lg * rng.uniform(0.96, 1.03), rng.choice(["madeira", "madeira_escura"]),
                 rot=(0, math.pi / 2, 0), lados=8)
    for x in (-1.0, 1.0):
        m.tubo([(x, -0.95, 0.3), (x, 0.95, 0.3)], [0.03, 0.03], "madeira_clara", lados=5)
    for x in (-1.0, 0.0, 1.0):
        pts = [(x, 0.97 * math.cos(a), 0.2 + 0.19 * math.sin(a))
               for a in [2 * math.pi * k / 16 for k in range(16)]]
        m.tubo(pts, [0.018] * 16, "corda", lados=4, fechado=True)
    return m.objeto(nome)


def criar_bote_salva_vidas(nome, seed=0, **opcoes):
    """Bote salva-vidas laranja: casco convexo, convés escuro, borda branca, bancos e remos."""
    m = _Malha()
    Lh, topo, K, M = 1.6, 0.6, 9, 7
    aneis, est = [], []
    for k in range(K):
        x = -Lh + 2 * Lh * k / (K - 1)
        f = max(0.06, (1 - (abs(x) / Lh) ** 2.4) ** 0.5)
        w, d = 0.62 * f, 0.5 * f ** 0.8
        anel = [(x, w * math.cos(math.pi * j / (M - 1)), topo - d * math.sin(math.pi * j / (M - 1)))
                for j in range(M)]
        aneis.append(anel)
        est.append((x, w))
    m.loft(aneis, "laranja_bote")
    contorno = [(x, 0.85 * w) for x, w in est] + [(x, -0.85 * w) for x, w in reversed(est)]
    m.prisma(contorno, 0.004, "carvao", centro=(0, 0, topo + 0.002))
    borda = [(x, w, topo) for x, w in est] + [(x, -w, topo) for x, w in reversed(est)]
    m.tubo(borda, [0.03] * len(borda), "branco", lados=5, fechado=True)
    for x in (-0.9, 0.0, 0.9):
        m.caixa((x, 0, topo + 0.04), (0.28, 0.7, 0.08), "madeira_clara")
    for s in (-1, 1):
        m.tubo([(-0.9, s * 0.8, topo + 0.1), (0.9, s * 1.25, topo + 0.2)], [0.02, 0.02], "madeira_clara", lados=5)
    return m.objeto(nome)


# ---------------------------------------------------------------- prévia
def _dims(ob):
    xs = [v.co.x for v in ob.data.vertices]
    ys = [v.co.y for v in ob.data.vertices]
    zs = [v.co.z for v in ob.data.vertices]
    return max(xs) - min(xs), max(ys) - min(ys), max(zs) - min(zs)


def _grade(objs, largura_max=24.0, folga=1.0):
    """Dispõe os objetos em linhas (shelf packing) centradas na origem; devolve (largura, profundidade)."""
    linhas, atual, larg = [], [], 0.0
    for ob in objs:
        w = _dims(ob)[0] + folga
        if atual and larg + w > largura_max:
            linhas.append(atual)
            atual, larg = [], 0.0
        atual.append(ob)
        larg += w
    if atual:
        linhas.append(atual)
    y, total_w = 0.0, 0.0
    for linha in linhas:
        x = 0.0
        prof = max(_dims(ob)[1] for ob in linha)
        for ob in linha:
            dx, dy, _ = _dims(ob)
            ob.location = (x + dx / 2, y + dy / 2, 0.0)
            x += dx + folga
        total_w = max(total_w, x)
        y += prof + folga
    total_h = y
    for ob in objs:
        ob.location.x -= total_w / 2
        ob.location.y -= total_h / 2
    return total_w, total_h


def _lista_grande():
    return [
        ("cornucopia", lambda n: criar_cornucopia(n, seed=1)),
        ("caixote", lambda n: criar_caixote(n, seed=0)),
        ("caixote_b", lambda n: criar_caixote(n, seed=4)),
        ("mochila", lambda n: criar_mochila(n, seed=0)),
        ("cantil", lambda n: criar_cantil(n)),
        ("garrafa", lambda n: criar_garrafa_agua(n)),
        ("lata", lambda n: criar_lata_comida(n, seed=0)),
        ("frutas", lambda n: criar_frutas(n, seed=0)),
        ("faca", lambda n: criar_faca(n)),
        ("lanca", lambda n: criar_lanca(n)),
        ("arco", lambda n: criar_arco(n, seed=0)),
        ("machado", lambda n: criar_machado(n)),
        ("tocha", lambda n: criar_tocha(n)),
        ("kit_medico", lambda n: criar_kit_medico(n)),
        ("corda", lambda n: criar_corda(n, seed=0)),
        ("fogueira_acesa", lambda n: criar_fogueira(n, seed=0, acesa=True)),
        ("fogueira_apagada", lambda n: criar_fogueira(n, seed=0, acesa=False)),
        ("abrigo_galhos", lambda n: criar_abrigo_galhos(n, seed=0)),
        ("barraca", lambda n: criar_barraca_lona(n, seed=0)),
        ("armadilha", lambda n: criar_armadilha(n, seed=0)),
        ("caixa_paraquedas", lambda n: criar_caixa_paraquedas(n, seed=0)),
        ("balsa", lambda n: criar_balsa(n, seed=0)),
        ("bote", lambda n: criar_bote_salva_vidas(n, seed=0)),
    ]


def _lista_pequena():
    return [
        ("mochila", lambda n: criar_mochila(n, seed=0)),
        ("cantil", lambda n: criar_cantil(n)),
        ("garrafa", lambda n: criar_garrafa_agua(n)),
        ("lata", lambda n: criar_lata_comida(n, seed=0)),
        ("frutas", lambda n: criar_frutas(n, seed=0)),
        ("faca", lambda n: criar_faca(n)),
        ("machado", lambda n: criar_machado(n)),
        ("tocha", lambda n: criar_tocha(n)),
        ("kit_medico", lambda n: criar_kit_medico(n)),
        ("corda", lambda n: criar_corda(n, seed=0)),
        ("arco", lambda n: criar_arco(n, seed=0)),
    ]


def _construir(lista):
    objs = []
    for nome, fn in lista:
        ob = fn(nome)
        objs.append(ob)
        print("TRIS", nome, ob["triangulos"])
    return objs


if __name__ == "__main__":
    pasta = os.path.join(os.path.dirname(_DIR), "previas")
    os.makedirs(pasta, exist_ok=True)

    limpar_cena()
    objs = _construir(_lista_grande())
    w, h = _grade(objs, largura_max=21.0, folga=1.2)
    previa(os.path.join(pasta, "objetos.png"), objetos=objs, dist=(w + 3) * 1.25, alvo=(0, 0, 0.6))

    limpar_cena()
    objs = _construir(_lista_pequena())
    w, h = _grade(objs, largura_max=9.0, folga=1.3)
    previa(os.path.join(pasta, "objetos_pequenos.png"), objetos=objs, dist=(w + 3) * 0.95, alvo=(0, 0, 0.4))
