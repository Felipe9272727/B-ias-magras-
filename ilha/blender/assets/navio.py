"""Navio de cruzeiro/expedicao low-poly (~50 m) para a abertura do naufragio.

Funcoes:
  criar_navio(nome, seed=0, partes_separadas=False)
      -> Object   (sem partes separadas)
      -> dict {"proa": Object, "popa": Object, "destrocos": [Object, ...]} (com partes separadas)
  criar_boia_salva_vidas(nome, seed=0) -> Object
  criar_bote(nome, seed=0) -> Object

Escala: 1 unidade = 1 m. Eixo X = comprimento (proa em +X). Origem no centro do navio,
na linha d'agua (z=0). Casco de z=-4 m (quilha) ate o convés em z=+4 m.
"""
import math
import os
import random
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from util import hexrgb, limpar_cena, mat_cor  # noqa: E402

# nome do material -> (cor hex, roughness, emissao)
PAL = {
    'navio_casco_vermelho': ('#B8262C', 0.85, 0.0),
    'navio_branco': ('#F2EFE6', 0.85, 0.0),
    'navio_azul_marinho': ('#1D3557', 0.80, 0.0),
    'navio_madeira': ('#C8945E', 0.90, 0.0),
    'navio_madeira_escura': ('#8E5F36', 0.90, 0.0),
    'navio_janela': ('#FFD76A', 0.50, 4.0),
    'navio_chamine': ('#F2B632', 0.85, 0.0),
    'navio_preto': ('#22262B', 0.90, 0.0),
    'navio_cinza': ('#6B7480', 0.90, 0.0),
    'navio_laranja': ('#F2701E', 0.80, 0.0),
    'navio_bandeira': ('#D62828', 0.90, 0.0),
}

# materiais por segmento do anel do casco (segmento k liga o ponto k ao k+1)
_SEG_CASCO = [
    'navio_casco_vermelho', 'navio_casco_vermelho', 'navio_casco_vermelho',  # quilha -> linha d'agua
    'navio_branco', 'navio_azul_marinho', 'navio_branco',                     # costado
    'navio_madeira',                                                          # convés
    'navio_branco', 'navio_azul_marinho', 'navio_branco',                     # costado (bombordo)
    'navio_casco_vermelho', 'navio_casco_vermelho', 'navio_casco_vermelho',   # bordo -> quilha
]

BOIA_R = 0.36   # raio maior do anel
BOIA_r = 0.11   # raio do tubo


def _mat(nome):
    hexc, rough, emi = PAL[nome]
    return mat_cor(nome, hexrgb(hexc), rough, emi)


def _passo(a, b, passo):
    out, x = [], a
    while x < b - 1e-6:
        out.append(round(x, 4))
        x += passo
    return out


def _ang(n):
    return [2 * math.pi * k / n for k in range(n)]


class Malha:
    """Acumula faces com material por face; vira um objeto Blender com fim()."""

    def __init__(self, nome, xlim=None, T=None):
        self.nome = nome
        self.bm = bmesh.new()
        self.xlim = xlim          # recorte em X (para partes separadas)
        self.T = T if T is not None else Matrix.Identity(4)
        self.slots = []

    def dentro(self, x):
        return self.xlim is None or self.xlim[0] <= x < self.xlim[1]

    def v(self, p):
        q = self.T @ Vector((p[0], p[1], p[2], 1.0))
        return self.bm.verts.new((q.x, q.y, q.z))

    def _slot(self, nome):
        if nome not in self.slots:
            _mat(nome)
            self.slots.append(nome)
        return self.slots.index(nome)

    def face(self, vs, nome):
        f = self.bm.faces.new(vs)
        f.material_index = self._slot(nome)
        return f

    def caixa_pts(self, c, nome):
        vs = [self.v(p) for p in c]
        for idx in ((0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4),
                    (2, 3, 7, 6), (0, 4, 7, 3), (1, 2, 6, 5)):
            self.face([vs[i] for i in idx], nome)

    def caixa(self, x0, x1, y0, y1, z0, z1, nome):
        if self.xlim:
            x0, x1 = max(x0, self.xlim[0]), min(x1, self.xlim[1])
            if x1 - x0 < 1e-3:
                return
        self.caixa_pts([(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
                        (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], nome)

    def cilindro(self, cx, cy, z0, z1, r0, r1, n, nome):
        if not self.dentro(cx):
            return
        base = [self.v((cx + r0 * math.cos(t), cy + r0 * math.sin(t), z0)) for t in _ang(n)]
        topo = [self.v((cx + r1 * math.cos(t), cy + r1 * math.sin(t), z1)) for t in _ang(n)]
        for i in range(n):
            j = (i + 1) % n
            self.face([base[i], base[j], topo[j], topo[i]], nome)
        self.face(base, nome)
        self.face(topo, nome)

    def loft(self, aneis, segs, cap_ini, cap_fim):
        """aneis: lista de anéis fechados (mesmo nº de pontos 3D), do início ao fim."""
        n = len(aneis[0])
        vs = [[self.v(p) for p in anel] for anel in aneis]
        for a in range(len(aneis) - 1):
            for k in range(n):
                k2 = (k + 1) % n
                self.face([vs[a][k], vs[a][k2], vs[a + 1][k2], vs[a + 1][k]], segs[k])
        self.face(vs[0], cap_ini)
        self.face(vs[-1], cap_fim)

    def toro(self, c, R, r, deitada, nseg, nsec, nomes):
        """Anel. deitada=True: plano XY (boia na água). False: plano XZ (em pé, de frente para Y)."""
        cx, cy, cz = c
        grade = []
        for i in range(nseg):
            th = 2 * math.pi * i / nseg
            linha = []
            for j in range(nsec):
                ph = 2 * math.pi * j / nsec
                rr = R + r * math.cos(ph)
                xl, yl, zl = rr * math.cos(th), rr * math.sin(th), r * math.sin(ph)
                p = (cx + xl, cy + yl, cz + zl) if deitada else (cx + xl, cy + zl, cz + yl)
                linha.append(self.v(p))
            grade.append(linha)
        for i in range(nseg):
            i2 = (i + 1) % nseg
            nome = nomes[(i * 4 // nseg) % 2]  # 4 setores alternados
            for j in range(nsec):
                j2 = (j + 1) % nsec
                self.face([grade[i][j], grade[i2][j], grade[i2][j2], grade[i][j2]], nome)

    def fim(self):
        bm = self.bm
        bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
        me = bpy.data.meshes.new(self.nome)
        bm.to_mesh(me)
        bm.free()
        for nome in self.slots:
            me.materials.append(bpy.data.materials[nome])
        for p in me.polygons:
            p.use_smooth = False
        obj = bpy.data.objects.new(self.nome, me)
        bpy.context.collection.objects.link(obj)
        return obj


# ---------------------------------------------------------------- casco

def _dims(x):
    """(meia-boca, cota da quilha, cota do convés) em função de x."""
    if x < -15:
        s = min(max((x + 25) / 10.0, 0.0), 1.0)
        w = 5.5 + 0.5 * (3 * s * s - 2 * s ** 3)
    elif x <= 14:
        w = 6.0
    else:
        s = min((x - 14) / 11.0, 1.0)
        w = max(0.12, 6.0 * (1 - s ** 1.7) ** 0.75)
    b = min(max((x - 14) / 11.0, 0.0), 1.0)
    zk = -4.0 + 2.6 * b * b      # quilha sobe na proa
    zt = 4.0 + 1.6 * b * b       # convés sobe na proa
    return w, zk, zt


def _anel_casco(x, dx=None, dz=None):
    w, zk, zt = _dims(x)
    pts = [
        (0.0, zk), (0.5 * w, 0.9 * zk), (w, 0.45 * zk), (w, 0.0), (w, 2.2), (w, 2.9), (w, zt),
        (-w, zt), (-w, 2.9), (-w, 2.2), (-w, 0.0), (-w, 0.45 * zk), (-0.5 * w, 0.9 * zk),
    ]
    out = []
    for k, (y, z) in enumerate(pts):
        ddx = dx[k] if dx else 0.0
        ddz = dz[k] if dz else 0.0
        out.append((x + ddx, y, z + ddz))
    return out


def _jitter(rng):
    return ([rng.uniform(-1.3, 1.3) for _ in range(13)],
            [rng.uniform(-0.5, 0.5) for _ in range(13)])


# ---------------------------------------------------------------- superestrutura

def _janelas_lado(m, s, yface, xs, z0, z1):
    y0, y1 = (yface, yface + 0.1) if s > 0 else (-yface - 0.1, -yface)
    for x in xs:
        m.caixa(x, x + 0.9, y0, y1, z0, z1, 'navio_janela')


def _davi(m, xb, s):
    y = s * 6.1
    for dx in (-2.3, 2.3):
        m.caixa(xb + dx - 0.07, xb + dx + 0.07, y - 0.07, y + 0.07, 4.0, 7.5, 'navio_azul_marinho')
    y2 = s * 7.0
    m.caixa(xb - 2.4, xb + 2.4, min(y, y2) - 0.07, max(y, y2) + 0.07, 7.5, 7.7, 'navio_azul_marinho')


def _bote(m, cx, cy, cz, escala=1.0):
    xs = [(-3.0 + 0.75 * k) * escala for k in range(9)]
    aneis = []
    for x in xs:
        w = 1.15 * max(0.05, 1 - (abs(x) / (3.0 * escala)) ** 2.2) ** 0.6
        pts = [(0.0, 0.0), (0.6 * w, 0.15), (w, 0.7), (w, 1.0), (-w, 1.0), (-w, 0.7), (-0.6 * w, 0.15)]
        aneis.append([(cx + x, cy + y, cz + z) for (y, z) in pts])
    segs = ['navio_laranja'] * 3 + ['navio_madeira'] + ['navio_laranja'] * 3
    m.loft(aneis, segs, 'navio_laranja', 'navio_laranja')
    # toldo
    tol = []
    for x in [-2.2, -1.4, -0.6, 0.2, 1.0]:
        tol.append([(cx + x, cy + y, cz + z) for (y, z) in [(-0.9, 1.0), (0.9, 1.0), (0.75, 1.6), (-0.75, 1.6)]])
    m.loft(tol, ['navio_branco'] * 4, 'navio_branco', 'navio_branco')


def _boia(m, centro, deitada=False):
    m.toro(centro, BOIA_R, BOIA_r, deitada, 16, 6, ['navio_laranja', 'navio_branco'])


def _cadeira(m):
    m.caixa(-0.3, 0.3, -0.3, 0.3, 0.42, 0.48, 'navio_madeira')    # assento
    m.caixa(-0.3, 0.3, 0.25, 0.3, 0.48, 0.95, 'navio_madeira')    # encosto
    for x in (-0.27, 0.27):
        for y in (-0.27, 0.27):
            m.caixa(x - 0.03, x + 0.03, y - 0.03, y + 0.03, 0.0, 0.42, 'navio_madeira_escura')


def _superestrutura(m, alt_ch, alt_mast):
    B, A, N = 'navio_branco', 'navio_azul_marinho', 'navio_janela'

    # níveis da casa
    m.caixa(-16, 12, -5.4, 5.4, 4.0, 7.0, B)
    m.caixa(-16.05, 12.05, -5.45, 5.45, 4.0, 4.35, A)
    m.caixa(-13, 8, -4.8, 4.8, 7.0, 9.8, B)
    m.caixa(-13.05, 8.05, -4.85, 4.85, 7.0, 7.3, A)
    m.caixa(-7, 5, -3.8, 3.8, 9.8, 12.4, B)
    m.caixa(-7.05, 5.05, -3.85, 3.85, 9.8, 10.1, A)
    m.caixa(-7.2, 5.2, -3.9, 3.9, 12.4, 12.6, A)   # teto da ponte

    # janelas laterais (emissivas)
    for s in (-1, 1):
        _janelas_lado(m, s, 5.38, _passo(-14.5, 10.0, 1.5), 5.1, 5.8)
        _janelas_lado(m, s, 4.78, _passo(-11.5, 6.0, 1.5), 7.8, 8.6)
        _janelas_lado(m, s, 3.78, _passo(-5.5, 3.5, 1.5), 10.6, 11.3)

    # janela de comando na frente da ponte, com montantes
    m.caixa(5.0, 5.08, -3.1, 3.1, 10.7, 11.5, N)
    for y in (-1.55, 1.55):
        m.caixa(5.0, 5.1, y - 0.05, y + 0.05, 10.7, 11.5, B)

    # chaminé com faixa e topo escuro (atrás da ponte)
    xc = -10.5
    topo = 17.5 + alt_ch
    m.cilindro(xc, 0.0, 9.8, topo, 1.45, 1.3, 10, 'navio_chamine')
    m.cilindro(xc, 0.0, 13.6, 14.2, 1.52, 1.52, 10, A)
    m.cilindro(xc, 0.0, topo, topo + 0.3, 1.32, 1.32, 10, 'navio_preto')

    # mastro com antena e bandeira (sobre a ponte)
    xm = 0.5
    top_m = 24.0 + alt_mast
    m.cilindro(xm, 0.0, 12.6, top_m, 0.14, 0.1, 6, 'navio_cinza')
    m.caixa(xm - 0.3, xm + 0.3, -1.3, 1.3, 19.6, 19.85, 'navio_cinza')
    m.caixa(xm - 0.25, xm + 0.25, -0.9, 0.9, 16.8, 17.05, 'navio_cinza')
    if m.dentro(xm):
        z = top_m
        pts = [(xm, 0.0, z - 0.1), (xm - 1.9, 0.0, z - 0.3), (xm - 1.5, 0.0, z - 0.65),
               (xm - 1.9, 0.0, z - 1.0), (xm, 0.0, z - 1.2)]
        m.face([m.v(p) for p in pts], 'navio_bandeira')


def _acessorios(m):
    # corrimãos e postes dos dois bordos
    for s in (-1, 1):
        for xa in _passo(-23.0, 14.0, 2.5):
            xb = min(xa + 2.5, 14.0)
            yr = s * (min(_dims(xa)[0], _dims(xb)[0]) - 0.25)
            m.caixa(xa, xb, yr - 0.05, yr + 0.05, 4.9, 5.0, 'navio_azul_marinho')
            m.caixa(xa - 0.05, xa + 0.05, yr - 0.05, yr + 0.05, 4.0, 4.9, 'navio_azul_marinho')

    # boias de popa presas ao corrimão
    for s in (-1, 1):
        if m.dentro(-23.8):
            _boia(m, (-23.8, s * 5.95, 4.8), deitada=False)

    # botes salva-vidas pendurados nas laterais (2 por bordo)
    for s in (-1, 1):
        for xb in (-10.0, 3.0):
            if m.dentro(xb):
                _davi(m, xb, s)
                _bote(m, xb, s * 7.0, 5.8)


def _montar_parte(nome, xlim, aneis, cap_ini, cap_fim, alt_ch, alt_mast):
    m = Malha(nome, xlim=xlim)
    m.loft(aneis, _SEG_CASCO, cap_ini, cap_fim)
    _superestrutura(m, alt_ch, alt_mast)
    _acessorios(m)
    return m.fim()


# ---------------------------------------------------------------- destroços

def _posicao_destroco(rng):
    x = rng.uniform(-14.0, 14.0)
    y = rng.choice((-1, 1)) * rng.uniform(8.0, 16.0)
    z = rng.uniform(-0.1, 0.1)
    return (Matrix.Translation((x, y, z))
            @ Matrix.Rotation(rng.uniform(0, 2 * math.pi), 4, 'Z')
            @ Matrix.Rotation(rng.uniform(-0.3, 0.3), 4, 'X'))


def _destrocos(nome, rng):
    objs = []
    for i in range(4):  # caixotes
        m = Malha(f'{nome}_destroco_caixote_{i}', T=_posicao_destroco(rng))
        m.caixa(-0.6, 0.6, -0.6, 0.6, 0.0, 1.2, 'navio_madeira_escura')
        objs.append(m.fim())
    for i in range(3):  # tábuas
        m = Malha(f'{nome}_destroco_tabua_{i}', T=_posicao_destroco(rng))
        m.caixa(-1.8, 1.8, -0.12, 0.12, 0.0, 0.06, 'navio_madeira')
        objs.append(m.fim())
    for i in range(2):  # boias deitadas na água
        m = Malha(f'{nome}_destroco_boia_{i}', T=_posicao_destroco(rng))
        _boia(m, (0.0, 0.0, 0.0), deitada=True)
        objs.append(m.fim())
    for i in range(3):  # cadeiras de convés
        m = Malha(f'{nome}_destroco_cadeira_{i}', T=_posicao_destroco(rng))
        _cadeira(m)
        objs.append(m.fim())
    return objs


# ---------------------------------------------------------------- API pública

def criar_navio(nome, seed=0, partes_separadas=False):
    rng = random.Random(seed)
    alt_ch = rng.uniform(-0.3, 0.3)
    alt_mast = rng.uniform(-0.4, 0.4)
    xs = [round(-25.0 + 1.25 * k, 4) for k in range(41)]  # -25 .. 25 m

    if not partes_separadas:
        aneis = [_anel_casco(x) for x in xs]
        return _montar_parte(nome, None, aneis, 'navio_branco', 'navio_branco', alt_ch, alt_mast)

    # casco partido em x=0, com borda irregular (anéis do corte com deslocamentos)
    jp = _jitter(rng)
    jb = _jitter(rng)
    aneis_popa = [_anel_casco(x) for x in xs if x < 0] + [_anel_casco(0.0, *jp)]
    aneis_proa = [_anel_casco(0.0, *jb)] + [_anel_casco(x) for x in xs if x > 0]
    popa = _montar_parte(f'{nome}_popa', (-99.0, 0.0), aneis_popa,
                         'navio_branco', 'navio_madeira_escura', alt_ch, alt_mast)
    proa = _montar_parte(f'{nome}_proa', (0.0, 99.0), aneis_proa,
                         'navio_madeira_escura', 'navio_branco', alt_ch, alt_mast)
    return {'proa': proa, 'popa': popa, 'destrocos': _destrocos(nome, rng)}


def criar_boia_salva_vidas(nome, seed=0):
    rng = random.Random(seed)
    R = BOIA_R * rng.uniform(0.95, 1.05)
    m = Malha(nome)
    m.toro((0.0, 0.0, R + BOIA_r), R, BOIA_r, False, 16, 6, ['navio_laranja', 'navio_branco'])
    return m.fim()


def criar_bote(nome, seed=0):
    rng = random.Random(seed)
    m = Malha(nome)
    _bote(m, 0.0, 0.0, 0.0, escala=rng.uniform(0.94, 1.06))
    return m.fim()


# ---------------------------------------------------------------- prévia

def _previa(caminho, offset, alvo, lente=38):
    sc = bpy.context.scene
    alvo = Vector(alvo)
    cam_loc = alvo + Vector(offset)
    bpy.ops.object.camera_add(location=cam_loc)
    cam = bpy.context.object
    cam.rotation_euler = (alvo - cam_loc).to_track_quat('-Z', 'Y').to_euler()
    cam.data.lens = lente
    sc.camera = cam
    bpy.ops.object.light_add(type='SUN', location=(4, -4, 10),
                             rotation=(math.radians(50), 0, math.radians(30)))
    bpy.context.object.data.energy = 3
    w = bpy.data.worlds.new('ceu') if not sc.world else sc.world
    sc.world = w
    w.color = (0.55, 0.75, 0.95)
    sc.render.engine = 'BLENDER_WORKBENCH'
    sh = sc.display.shading
    sh.light = 'STUDIO'
    sh.color_type = 'MATERIAL'
    sh.show_shadows = True
    sh.show_cavity = True
    sh.show_object_outline = True
    sh.background_type = 'WORLD'
    sc.render.resolution_x, sc.render.resolution_y = 1600, 900
    sc.render.filepath = caminho
    bpy.ops.render.render(write_still=True)
    print('PREVIA', caminho)


if __name__ == "__main__":
    limpar_cena()
    pasta = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'previas'))
    os.makedirs(pasta, exist_ok=True)

    navio = criar_navio('Navio', seed=0)
    bote = criar_bote('Bote', seed=0)
    bote.location = (-6.0, -21.0, 0.0)
    boia = criar_boia_salva_vidas('Boia', seed=0)
    boia.location = (7.0, -21.0, 0.0)
    _previa(os.path.join(pasta, 'navio.png'), (-40, -70, 36), (0, 0, 6))

    limpar_cena()
    partes = criar_navio('Navio', seed=0, partes_separadas=True)
    partes['proa'].location = (4.0, -6.5, 1.0)
    partes['proa'].rotation_euler = (0, 0, math.radians(6))
    partes['popa'].location = (-5.0, 6.5, -0.4)
    partes['popa'].rotation_euler = (math.radians(3), 0, math.radians(-7))
    _previa(os.path.join(pasta, 'navio_partido.png'), (-48, -80, 40), (0, 0, 4))
