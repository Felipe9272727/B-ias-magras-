"""Natureza low-poly da ilha (Blender 4.2): palmeira, coqueiro, pinheiro, arvores, arbustos, pedras,
tronco caido, cogumelos, flores, capim e cacto. Tudo gerado por codigo (bmesh), 1 unidade = 1 m,
origem no chao. Prévia: python natureza.py (ver SPEC.md)."""
import bpy
import bmesh
import math
import os
import random
import sys
from mathutils import Euler, Matrix, Vector

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from util import mat_cor, hexrgb, flat, limpar_cena, previa  # noqa: E402

TAU = math.tau


# ---------------------------------------------------------------- helpers

def _rng(seed, extra=0):
    return random.Random(seed * 131 + extra)


def _cor(hexcor):
    """Material de cor solida, reutilizado pelo nome (compartilhado entre funcoes)."""
    return mat_cor('nat_' + hexcor.lstrip('#'), hexrgb(hexcor))


def _M(loc=(0, 0, 0), rot=(0, 0, 0), esc=(1, 1, 1)):
    return (Matrix.Translation(Vector(loc))
            @ Euler(rot, 'XYZ').to_matrix().to_4x4()
            @ Matrix.Diagonal(Vector(esc)).to_4x4())


def _rot_z(d):
    """Matriz 4x4 que alinha o eixo Z local com o vetor d."""
    d = Vector(d)
    if d.length < 1e-9:
        return Matrix.Identity(4)
    return Vector((0.0, 0.0, 1.0)).rotation_difference(d.normalized()).to_matrix().to_4x4()


class Malha:
    """Acumula todas as partes numa unica bmesh (= um objeto ja 'juntado').
    Cada parte e construida numa bmesh temporaria (sem ambiguidade de elementos novos) e copiada
    para a malha final com o indice de material desejado."""

    def __init__(self):
        self.bm = bmesh.new()

    def _anexar(self, src, mat, mat_cap=None, seg=None):
        vmap = {}
        for v in src.verts:
            vmap[v] = self.bm.verts.new(Vector(v.co))
        for f in src.faces:
            nf = self.bm.faces.new([vmap[v] for v in f.verts])
            tampa = mat_cap is not None and seg is not None and len(f.verts) == seg
            nf.material_index = mat_cap if tampa else mat
        src.free()

    def tronco(self, p0, p1, r0, r1=None, seg=6, mat=0, mat_cap=None):
        """Cilindro/cone de p0 a p1 (raio r0 na base, r1 no topo). mat_cap pinta as tampas."""
        p0, p1 = Vector(p0), Vector(p1)
        d = p1 - p0
        r1 = r0 if r1 is None else r1
        src = bmesh.new()
        bmesh.ops.create_cone(src, cap_ends=True, cap_tris=False, segments=seg,
                              radius1=max(r0, 0.02), radius2=max(r1, 0.02), depth=d.length,
                              matrix=Matrix.Translation((p0 + p1) / 2) @ _rot_z(d))
        self._anexar(src, mat, mat_cap, seg)

    def esfera(self, centro, raio, esc=(1, 1, 1), sub=1, jit=0.0, rng=None, rot=(0, 0, 0), mat=0):
        """Icosfera (sub=1: 20 tris, sub=2: 80 tris) escalada, rotacionada e com vertices perturbados."""
        src = bmesh.new()
        bmesh.ops.create_icosphere(src, subdivisions=sub, radius=1.0, matrix=Matrix.Identity(4))
        M = _M(centro, rot, [raio * e for e in esc])
        for v in src.verts:
            co = Vector(v.co)
            if jit and rng is not None:
                co = co * (1 + rng.uniform(-jit, jit))
            v.co = M @ co
        self._anexar(src, mat)

    def folha(self, base, direcao, comp, larg, queda, mat=0, K=5, arco=0.12, subida=0.0):
        """Folha/lamina em leque: faixa de quads com nervura central elevada (efeito V, facetado).
        queda = quanto a ponta cai (fração de comp); subida = quanto a lamina sobe (fração de comp)."""
        src = bmesh.new()
        base = Vector(base)
        h = Vector((direcao[0], direcao[1], 0.0)).normalized()
        lado = Vector((-h.y, h.x, 0.0))
        linhas = []
        for i in range(K + 1):
            t = i / K
            c = (base + h * (comp * t)
                 + Vector((0, 0, comp * (arco * math.sin(math.pi * t) + subida * t - queda * t * t))))
            w = max(larg * (1 - t) ** 0.6 * (0.45 + 0.55 * min(1.0, t * 4)), 0.015)
            L = src.verts.new(c + lado * w + Vector((0, 0, -w * 0.35)))
            C = src.verts.new(c + Vector((0, 0, w * 0.45)))
            R = src.verts.new(c - lado * w + Vector((0, 0, -w * 0.35)))
            linhas.append((L, C, R))
        for i in range(K):
            (l0, c0, r0), (l1, c1, r1) = linhas[i], linhas[i + 1]
            src.faces.new((l0, c0, c1, l1))
            src.faces.new((c0, r0, r1, c1))
        self._anexar(src, mat)


def _objeto(nome, malha, cores, centro_xy=False):
    """Converte a malha em objeto: base em z=0 (e opcionalmente centrado em x/y), flat shading."""
    me = bpy.data.meshes.new(nome + '_mesh')
    malha.bm.to_mesh(me)
    malha.bm.free()
    for c in cores:
        me.materials.append(c)
    xs = [v.co.x for v in me.vertices]
    ys = [v.co.y for v in me.vertices]
    zs = [v.co.z for v in me.vertices]
    dx = -(max(xs) + min(xs)) / 2 if centro_xy else 0.0
    dy = -(max(ys) + min(ys)) / 2 if centro_xy else 0.0
    dz = -min(zs)
    for v in me.vertices:
        v.co.x += dx
        v.co.y += dy
        v.co.z += dz
    me.update()
    ob = bpy.data.objects.new(nome, me)
    bpy.context.scene.collection.objects.link(ob)
    flat(ob)
    return ob


# ---------------------------------------------------------------- palmeiras

def _tronco_palmeira(m, r, altura, curva, mat_tronco, mat_anel):
    """Tronco segmentado que curva (parabola) para uma direcao aleatoria. Devolve (topo, angulo)."""
    ang = r.uniform(0, TAU)
    dx, dy = math.cos(ang) * curva, math.sin(ang) * curva
    S = 8

    def ponto(j):
        t = j / S
        return Vector((dx * t * t, dy * t * t, altura * t))

    def raio(j):
        return 0.23 * (1 - 0.45 * j / S)

    for j in range(S):
        m.tronco(ponto(j), ponto(j + 1), raio(j), raio(j + 1), seg=6,
                 mat=mat_tronco if j % 2 == 0 else mat_anel)
    return ponto(S), ang


def _copa_palmeira(m, r, topo, n, mats_folha, comp_base=2.6, queda=(0.45, 0.75)):
    for i in range(n):
        a = TAU * i / n + r.uniform(-0.2, 0.2)
        comp = comp_base * r.uniform(0.85, 1.12)
        m.folha(topo + Vector((0, 0, 0.05)), (math.cos(a), math.sin(a)), comp, 0.55,
                r.uniform(*queda), mat=mats_folha[i % len(mats_folha)], arco=0.1)


def criar_palmeira(nome, seed=0, **opcoes):
    r = _rng(seed, 1)
    altura = opcoes.get('altura', r.uniform(5.0, 6.8))
    curva = opcoes.get('curvatura', r.uniform(0.4, 1.0))
    n = opcoes.get('folhas', r.randint(7, 9))
    cores = [_cor('#B5835A'), _cor('#9C6B45'), _cor('#3FA34D'), _cor('#4DB55A'), _cor('#2F8F4A')]
    m = Malha()
    topo, _ = _tronco_palmeira(m, r, altura, curva, 0, 1)
    _copa_palmeira(m, r, topo, n, [2, 3, 4])
    return _objeto(nome, m, cores)


def criar_coqueiro(nome, seed=0, **opcoes):
    r = _rng(seed, 2)
    altura = opcoes.get('altura', r.uniform(5.5, 7.0))
    inclin = opcoes.get('inclinacao', r.uniform(1.2, 1.8))
    n = opcoes.get('folhas', r.randint(7, 9))
    cores = [_cor('#B5835A'), _cor('#9C6B45'), _cor('#3FA34D'), _cor('#4DB55A'),
             _cor('#2F8F4A'), _cor('#8A5A32')]
    m = Malha()
    topo, ang = _tronco_palmeira(m, r, altura, inclin, 0, 1)
    _copa_palmeira(m, r, topo, n, [2, 3, 4], queda=(0.55, 0.85))
    # cocos pendurados logo abaixo da copa
    for _ in range(r.randint(3, 5)):
        a = r.uniform(0, TAU)
        p = topo + Vector((math.cos(a) * 0.45, math.sin(a) * 0.45, -0.7 - r.uniform(0, 0.15)))
        m.esfera(p, 0.13 * r.uniform(0.9, 1.1), sub=0, mat=5)
    return _objeto(nome, m, cores)


# ---------------------------------------------------------------- arvores

def criar_pinheiro(nome, seed=0, **opcoes):
    r = _rng(seed, 3)
    h = opcoes.get('altura', r.uniform(4.5, 6.5))
    copa = r.choice(['#2E7D4F', '#2F8A55', '#276B48'])
    copa_clara = r.choice(['#3F9461', '#4AA36B'])
    cores = [_cor('#7A5233'), _cor(copa), _cor(copa_clara)]
    m = Malha()
    m.tronco((0, 0, 0), (0, 0, h * 0.4), 0.18, 0.12, seg=6, mat=0)
    L = r.randint(4, 5)
    for i in range(L):
        f = i / (L - 1)
        zb = 0.9 + f * (h - 2.4)
        rb = 1.75 * (1 - 0.62 * f) * r.uniform(0.92, 1.08)
        ch = 2.1 * (1 - 0.2 * f)
        ox, oy = r.uniform(-0.1, 0.1), r.uniform(-0.1, 0.1)
        m.tronco((ox, oy, zb), (ox, oy, zb + ch), rb, 0.04, seg=8, mat=1 if i % 2 == 0 else 2)
    return _objeto(nome, m, cores)


def criar_arvore_redonda(nome, seed=0, **opcoes):
    r = _rng(seed, 4)
    h = opcoes.get('altura', r.uniform(3.8, 5.0))
    tons = r.sample(['#6DBE45', '#5BAE4A', '#7CC755', '#4FA653'], 2)
    cores = [_cor('#8B6239'), _cor(tons[0]), _cor(tons[1])]
    m = Malha()
    m.tronco((0, 0, 0), (0, 0, h * 0.62), 0.2, 0.13, seg=6, mat=0)
    R = h * 0.3 * r.uniform(0.9, 1.1)
    c = Vector((0, 0, h * 0.7))
    m.esfera(c, R, esc=(1, 1, 0.9), sub=2, jit=0.16, rng=r,
             rot=(0, 0, r.uniform(0, TAU)), mat=1)
    for _ in range(2):
        a = r.uniform(0, TAU)
        off = Vector((math.cos(a) * R * 0.6, math.sin(a) * R * 0.6, r.uniform(-0.1, 0.35) * R))
        m.esfera(c + off, R * r.uniform(0.6, 0.7), esc=(1, 1, 0.9), sub=2, jit=0.16, rng=r,
                 rot=(0, 0, r.uniform(0, TAU)), mat=r.choice([1, 2]))
    return _objeto(nome, m, cores)


def criar_arvore_morta(nome, seed=0, **opcoes):
    r = _rng(seed, 5)
    h = opcoes.get('altura', r.uniform(3.5, 4.8))
    cores = [_cor(r.choice(['#8C8074', '#A08F7F'])), _cor('#6E6259')]
    m = Malha()
    m.tronco((0, 0, 0), (0, 0, h * 0.75), 0.28, 0.1, seg=6, mat=0)
    for i in range(r.randint(4, 6)):
        z = h * r.uniform(0.45, 0.9)
        a = TAU * i / 5 + r.uniform(-0.4, 0.4)
        elev = r.uniform(0.5, 1.0)  # quanto o galho sobe
        d = Vector((math.cos(a), math.sin(a), elev)).normalized()
        comp = r.uniform(0.9, 1.7)
        p0 = Vector((0, 0, z))
        p1 = p0 + d * comp
        m.tronco(p0, p1, 0.1, 0.025, seg=5, mat=0)
        if r.random() < 0.5:  # ramo secundario
            q = p0 + d * comp * 0.6
            d2 = Vector((math.cos(a + 0.9), math.sin(a + 0.9), 0.8)).normalized()
            m.tronco(q, q + d2 * comp * 0.5, 0.05, 0.015, seg=4, mat=1)
    return _objeto(nome, m, cores)


# ---------------------------------------------------------------- arbustos

def _moita(m, r, s, mats):
    blobs = [((0.0, 0.0), 0.55, 0), ((0.42, 0.1), 0.42, 1), ((-0.35, -0.2), 0.4, 2)]
    for (x, y), rr, mat in blobs:
        rr = rr * s * r.uniform(0.9, 1.1)
        m.esfera((x * s, y * s, rr * 0.75), rr, esc=(1, 1, 0.8), sub=2, jit=0.15, rng=r,
                 rot=(0, 0, r.uniform(0, TAU)), mat=mat % len(mats))
    return 0.55 * s


def criar_arbusto(nome, seed=0, **opcoes):
    r = _rng(seed, 6)
    s = opcoes.get('tamanho', r.uniform(0.85, 1.2))
    cores = [_cor('#4CAF50'), _cor('#5DBB63'), _cor('#3E9B57')]
    m = Malha()
    _moita(m, r, s, cores)
    return _objeto(nome, m, cores, centro_xy=True)


def criar_arbusto_frutas(nome, seed=0, **opcoes):
    r = _rng(seed, 7)
    s = opcoes.get('tamanho', r.uniform(0.85, 1.15))
    n = opcoes.get('frutas', r.randint(7, 9))
    cores = [_cor('#4CAF50'), _cor('#5DBB63'), _cor('#3E9B57'), _cor('#E53935')]
    m = Malha()
    R = _moita(m, r, s, cores)
    centro = Vector((0, 0, R * 0.75))
    for _ in range(n):
        th = r.uniform(0.35, 1.25)  # colatitude (0 = topo)
        ph = r.uniform(0, TAU)
        v = Vector((math.sin(th) * math.cos(ph), math.sin(th) * math.sin(ph), math.cos(th)))
        p = centro + Vector((v.x * R * 1.02, v.y * R * 1.02, v.z * R * 0.8))
        m.esfera(p, 0.085 * s * r.uniform(0.9, 1.1), sub=0, mat=3)
    return _objeto(nome, m, cores, centro_xy=True)


# ---------------------------------------------------------------- pedras

def criar_pedra(nome, seed=0, tipo=0, **opcoes):
    """tipo 0: pedra redonda; 1: laje achatada e alongada; 2: aglomerado de 3 pedras."""
    r = _rng(seed, 30 + tipo)
    cores = [_cor(h) for h in ['#9AA0A6', '#8A9199', '#A7A39D', '#7F868E']]
    m = Malha()
    s = r.uniform(0.85, 1.2)
    rot = lambda: (r.uniform(-0.2, 0.2), r.uniform(-0.2, 0.2), r.uniform(0, TAU))  # noqa: E731
    if tipo == 0:
        m.esfera((0, 0, 0.4 * s), 0.5 * s, esc=(1.0, 0.85, 0.75), sub=2, jit=0.22, rng=r,
                 rot=rot(), mat=r.randrange(4))
    elif tipo == 1:
        m.esfera((0, 0, 0.22 * s), 0.6 * s, esc=(1.3, 0.8, 0.42), sub=2, jit=0.2, rng=r,
                 rot=rot(), mat=r.randrange(4))
    else:
        m.esfera((0, 0, 0.32 * s), 0.5 * s, esc=(1.0, 0.9, 0.75), sub=2, jit=0.22, rng=r,
                 rot=rot(), mat=r.randrange(4))
        m.esfera((0.55 * s, 0.15, 0.18 * s), 0.3 * s, esc=(1.0, 1.0, 0.7), sub=2, jit=0.22, rng=r,
                 rot=rot(), mat=r.randrange(4))
        m.esfera((-0.42 * s, -0.3, 0.14 * s), 0.24 * s, esc=(1.0, 1.0, 0.7), sub=2, jit=0.22, rng=r,
                 rot=rot(), mat=r.randrange(4))
    return _objeto(nome, m, cores, centro_xy=True)


# ---------------------------------------------------------------- chao e detalhes

def criar_tronco_caido(nome, seed=0, **opcoes):
    r = _rng(seed, 40)
    L = opcoes.get('comprimento', r.uniform(2.6, 3.8))
    R = opcoes.get('raio', r.uniform(0.24, 0.32))
    ang = r.uniform(0, TAU)
    cores = [_cor('#7D5A3C'), _cor('#E8C28A'), _cor('#6B8E3A')]  # casca, miolo cortado, musgo
    c, s_ = math.cos(ang), math.sin(ang)

    def g(x, y, z):
        return Vector((x * c - y * s_, x * s_ + y * c, z))

    m = Malha()
    m.tronco(g(-L / 2, 0, R), g(L / 2, 0, R), R, R * 0.92, seg=8, mat=0, mat_cap=1)
    # galho quebrado
    x0 = r.uniform(-0.5, 0.5) * L
    d = g(r.uniform(-0.3, 0.3), r.uniform(-0.5, 0.5), 0.8).normalized()
    p = g(x0, 0, 1.6 * R)
    m.tronco(p, p + d * r.uniform(0.3, 0.45), 0.07, 0.04, seg=6, mat=0, mat_cap=1)
    # manchas de musgo no topo
    for _ in range(2):
        x = r.uniform(-0.35, 0.35) * L
        m.esfera(g(x, 0, 1.9 * R), R * 0.7, esc=(1.2, 0.9, 0.25), sub=0, mat=2)
    return _objeto(nome, m, cores, centro_xy=True)


def criar_cogumelos(nome, seed=0, **opcoes):
    r = _rng(seed, 50)
    n = opcoes.get('quantidade', r.randint(3, 4))
    cores = [_cor('#F4EAD5'), _cor('#E0443E'), _cor('#F28C38'), _cor('#FFFFFF'), _cor('#B5543A')]
    m = Malha()
    for _ in range(n):
        s = r.uniform(0.9, 1.35)
        a = r.uniform(0, TAU)
        d = r.uniform(0.0, 0.35)
        x, y = math.cos(a) * d, math.sin(a) * d
        hs = 0.36 * s
        m.tronco((x, y, 0), (x, y, hs), 0.07 * s, 0.055 * s, seg=6, mat=0)
        m.esfera((x, y, hs), 0.24 * s, esc=(1, 1, 0.62), sub=1, mat=r.choice([1, 1, 1, 2]))
        for _ in range(r.randint(2, 3)):
            sa = r.uniform(0, TAU)
            dist = r.uniform(0.0, 0.12) * s
            m.esfera((x + math.cos(sa) * dist, y + math.sin(sa) * dist, hs + 0.13 * s),
                     0.055 * s, sub=0, mat=3)
    return _objeto(nome, m, cores, centro_xy=True)


def criar_flores(nome, seed=0, **opcoes):
    r = _rng(seed, 60)
    n = opcoes.get('quantidade', r.randint(6, 9))
    petalas = ['#FFD54F', '#F06292', '#FFFFFF', '#BA68C8', '#FF8A65']
    cores = [_cor('#4CAF50'), _cor('#66BB6A'), _cor('#FFEB3B')] + [_cor(h) for h in petalas]
    m = Malha()
    for _ in range(n):
        a = r.uniform(0, TAU)
        d = r.uniform(0.0, 0.7)
        x, y = math.cos(a) * d, math.sin(a) * d
        hf = r.uniform(0.35, 0.6)
        m.tronco((x, y, 0), (x, y, hf), 0.018, 0.012, seg=4, mat=0)
        m.esfera((x, y, hf), 0.1, esc=(1, 1, 0.8), sub=0, mat=3 + r.randrange(len(petalas)))
        m.esfera((x, y, hf + 0.02), 0.04, sub=0, mat=2)
        for k in range(2):
            m.folha((x, y, hf * 0.3), (math.cos(a + k * math.pi + 0.5), math.sin(a + k * math.pi + 0.5)),
                    0.22, 0.06, 0.3, mat=1, K=2, arco=0.1)
    return _objeto(nome, m, cores, centro_xy=True)


def criar_capim(nome, seed=0, **opcoes):
    r = _rng(seed, 70)
    n = opcoes.get('laminas', r.randint(9, 12))
    cores = [_cor('#7CB342'), _cor('#9CCC65'), _cor('#C0CA33')]
    m = Malha()
    for i in range(n):
        a = TAU * i / n + r.uniform(-0.3, 0.3)
        base = Vector((r.uniform(-0.08, 0.08), r.uniform(-0.08, 0.08), 0.0))
        m.folha(base, (math.cos(a), math.sin(a)), r.uniform(0.45, 0.8), 0.05,
                r.uniform(0.25, 0.5), mat=r.randrange(3), K=3, arco=0.05, subida=0.9)
    return _objeto(nome, m, cores, centro_xy=True)


def criar_cacto(nome, seed=0, **opcoes):
    r = _rng(seed, 80)
    H = opcoes.get('altura', r.uniform(0.9, 1.3))
    cores = [_cor('#4CAF6A'), _cor('#3B8E55'), _cor('#F06292')]
    R = 0.16 * r.uniform(0.9, 1.1)
    m = Malha()
    m.tronco((0, 0, 0), (0, 0, H), R, R * 0.95, seg=8, mat=0)
    m.esfera((0, 0, H), R * 0.98, sub=1, mat=0)
    lado = r.choice([-1, 1])
    bracos = [(lado, H * r.uniform(0.35, 0.5))]
    if r.random() < 0.7:
        bracos.append((-lado, H * r.uniform(0.5, 0.65)))
    for sinal, hb in bracos:
        ext = r.uniform(0.2, 0.28)
        topo_b = hb + r.uniform(0.22, 0.32)
        m.tronco((0, 0, hb), (sinal * ext, 0, hb), 0.075, 0.075, seg=6, mat=0)
        m.esfera((sinal * ext, 0, hb), 0.075, sub=0, mat=1)
        m.tronco((sinal * ext, 0, hb), (sinal * ext, 0, topo_b), 0.075, 0.072, seg=6, mat=0)
        m.esfera((sinal * ext, 0, topo_b), 0.075, sub=0, mat=1)
    if r.random() < 0.5:
        m.esfera((0, 0, H + R * 0.7), 0.07, esc=(1, 1, 0.6), sub=0, mat=2)
    return _objeto(nome, m, cores, centro_xy=True)


# ---------------------------------------------------------------- previa

if __name__ == "__main__":
    limpar_cena()
    specs = [
        ("palmeira", criar_palmeira, 0, {}),
        ("palmeira_b", criar_palmeira, 1, {}),
        ("coqueiro", criar_coqueiro, 0, {}),
        ("pinheiro", criar_pinheiro, 0, {}),
        ("arvore_redonda", criar_arvore_redonda, 0, {}),
        ("arvore_morta", criar_arvore_morta, 0, {}),
        ("arbusto", criar_arbusto, 0, {}),
        ("arbusto_frutas", criar_arbusto_frutas, 0, {}),
        ("pedra_0", criar_pedra, 0, {'tipo': 0}),
        ("pedra_1", criar_pedra, 0, {'tipo': 1}),
        ("pedra_2", criar_pedra, 0, {'tipo': 2}),
        ("tronco_caido", criar_tronco_caido, 0, {}),
        ("cogumelos", criar_cogumelos, 0, {}),
        ("flores", criar_flores, 0, {}),
        ("capim", criar_capim, 0, {}),
        ("cacto", criar_cacto, 0, {}),
    ]
    COLUNAS = 6
    ESPACO = 4.2
    objs = []
    for i, (nome, fn, seed, op) in enumerate(specs):
        ob = fn(nome, seed=seed, **op)
        linha, col = divmod(i, COLUNAS)
        na_linha = min(COLUNAS, len(specs) - linha * COLUNAS)
        x = (col - (na_linha - 1) / 2) * ESPACO
        ob.location = (x, -linha * 6.0, 0.0)
        objs.append(ob)
    previa(os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                         '..', 'previas', 'natureza.png')),
           objetos=objs, dist=28, alvo=(0, -6.0, 2.4))
