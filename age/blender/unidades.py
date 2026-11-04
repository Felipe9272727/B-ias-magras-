"""Unidades (aldeão, lanceiro, atirador, cavaleiro) e natureza (árvores, arbusto, pedras, cervo, toco).
Unidades olham para a direita-baixo (frente local = +X, girada -45 graus); o lado visível é o local -Y."""
import math, random
from base import *  # noqa
import base as B

M = B.M
PI = math.pi
R = math.radians
FRENTE = -PI / 4


def _raiz(girar=True):
    return grupo((0, 0, 0), (0, 0, FRENTE if girar else 0), None, 'raiz')


def humano(g, tun, pernas=(0, 0), bracos=(0, 0), ancho=0.13, sentado=False):
    """Boneco chunky de ~1,75 m. pernas/bracos = (lado da câmera, lado oposto) em graus, positivo = para frente."""
    for lado, sw in ((-1, pernas[0]), (1, pernas[1])):
        pv = grupo((0, lado * ancho, 0.9), (0, -R(sw), 0), g, 'perna')
        caixa(0, 0, -0.9, 0.18, 0.18, 0.82, M['calca'], pv, bisel=0.04)
        caixa(0.06, 0, -0.9, 0.3, 0.19, 0.12, M['couro'], pv, bisel=0.04)
    caixa(0, 0, 0.88, 0.32, 0.46, 0.54, tun, g, bisel=0.06)
    caixa(0, 0, 0.9, 0.34, 0.48, 0.08, M['couro'], g, bisel=0.02)
    caixa(0, 0, 0.0 + 0.62, 0.34, 0.48, 0.1, tun, g, bisel=0.02) if False else None
    esf(0.02, 0, 1.57, 0.17, 0.16, 0.18, M['pele'], g, seg=14, anel=10)
    maos = {}
    for lado, sw, nome in ((-1, bracos[0], 'cam'), (1, bracos[1], 'far')):
        pv = grupo((0, lado * 0.27, 1.34), (0, -R(sw), 0), g, 'braco')
        caixa(0, 0, -0.26, 0.12, 0.12, 0.28, tun, pv, bisel=0.03)
        caixa(0, 0, -0.52, 0.09, 0.09, 0.26, M['pele'], pv, bisel=0.02)
        mao = grupo((0, 0, -0.54), None, pv, 'mao_' + nome)
        esf(0, 0, 0, 0.065, 0.065, 0.065, M['pele'], mao, seg=8, anel=6)
        maos[nome] = mao
    return maos


def haste(mao, z_tras, z_frente, r=0.03, ponta=None, m=None, comp_ponta=0.3, r_ponta=0.07):
    """Haste ao longo do eixo z local da mão (z negativo = na direção do braço); ponta metálica na extremidade."""
    zmin, zmax = min(z_tras, z_frente), max(z_tras, z_frente)
    cil(0, 0, zmin, r, zmax - zmin, m or M['madeira_lisa'], mao, verts=6)
    if ponta:
        sinal = -1 if z_frente < z_tras else 1
        zp = z_frente + (0 if sinal < 0 else 0)
        c = cil(0, 0, z_frente + sinal * comp_ponta / 2, r_ponta, comp_ponta, ponta, mao, verts=6, r2=0.0, centro=True)
        if sinal < 0:
            c.rotation_euler = (PI, 0, 0)


# ------------------------------------------------------------------ aldeão
def aldeao(pose):
    g = _raiz()
    tun = M['jog']
    if pose == 'andar1':
        mo = humano(g, tun, (28, -28), (-22, 22))
    elif pose == 'andar2':
        mo = humano(g, tun, (-28, 28), (22, -22))
    else:
        mo = humano(g, tun, (6, -6), (150, 55))
    # chapéu de palha e lenço
    cil(0.02, 0, 1.69, 0.31, 0.05, M['palha1'], g, verts=16)
    cil(0.02, 0, 1.72, 0.16, 0.13, M['palha2'], g, verts=12, r2=0.1)
    # cesto nas costas com legumes
    cesto = grupo((-0.3, 0, 0.98), (0, 0.12, 0), g, 'cesto')
    cil(0, 0, 0, 0.22, 0.4, M['couro'], cesto, verts=10, r2=0.26)
    cil(0, 0, 0.38, 0.27, 0.05, M['tabua2'], cesto, verts=10)
    for (ex, ey, ez, mm) in ((0.05, 0.0, 0.5, 'verde2'), (-0.08, 0.1, 0.46, 'baga'), (0.08, -0.1, 0.44, 'trigo')):
        esf(ex, ey, ez, 0.1, 0.1, 0.1, M[mm], cesto, seg=8, anel=6)
    for s in (-1, 1):
        caixa(-0.02, s * 0.15, 1.18, 0.04, 0.04, 0.32, M['couro'], g, bisel=0.01)
    # enxada
    m = mo['far'] if pose != 'atacar' else mo['cam']
    if pose == 'atacar':
        haste(m, 0.3, -0.95, 0.03)
        caixa(0.0, 0, -1.0, 0.2, 0.05, 0.28, M['aco'], m, rot=(0, 0.0, 0), bisel=0.01)
        caixa(0.12, 0, -0.95, 0.24, 0.05, 0.08, M['ferro'], m, bisel=0.01)
    else:
        haste(m, -0.55, 1.05, 0.03)
        caixa(0.1, 0, 1.0, 0.26, 0.05, 0.1, M['aco'], m, bisel=0.01)
        caixa(0.18, 0, 0.9, 0.08, 0.05, 0.22, M['aco'], m, bisel=0.01)
    return g


# ------------------------------------------------------------------ lanceiro
def lanceiro(pose):
    g = _raiz()
    tun = M['jog']
    if pose == 'andar1':
        mo = humano(g, tun, (28, -28), (14, 18))
    elif pose == 'andar2':
        mo = humano(g, tun, (-28, 28), (22, 8))
    else:
        mo = humano(g, tun, (14, -22), (30, 95))
    # capacete com crista na cor
    esf(0.02, 0, 1.6, 0.2, 0.19, 0.16, M['aco'], g, seg=14, anel=8)
    caixa(0.02, 0, 1.75, 0.34, 0.05, 0.1, M['jog'], g, bisel=0.02)
    caixa(0.2, 0, 1.55, 0.04, 0.06, 0.12, M['aco'], g, bisel=0.01)
    # gibão de couro por cima e manto curto na cor
    caixa(-0.19, 0, 0.9, 0.05, 0.4, 0.5, M['jog_esc'], g, bisel=0.02)
    # escudo redondo no braço do lado da câmera
    sh = grupo((0.1, -0.14, 0.05), (0, 0, 0.0), mo['cam'], 'escudo')
    cil(0, 0, 0, 0.44, 0.07, M['aco'], sh, rot=(PI / 2, 0, 0), verts=24, centro=True)
    cil(0, -0.03, 0, 0.38, 0.07, M['jog'], sh, rot=(PI / 2, 0, 0), verts=24, centro=True)
    cil(0, -0.06, 0, 0.17, 0.06, M['creme'], sh, rot=(PI / 2, 0, 0), verts=16, centro=True)
    esf(0, -0.1, 0, 0.1, 0.07, 0.1, M['ouro'], sh, seg=10, anel=6)
    # lança
    if pose == 'atacar':
        haste(mo['far'], 0.8, -1.7, 0.035, M['aco'], M['madeira_lisa'], 0.4, 0.08)
    else:
        haste(mo['far'], -0.5, 1.85, 0.035, M['aco'], M['madeira_lisa'], 0.4, 0.08)
        # a haste termina em ponta para cima: inverter orientação da ponta
    return g


# ------------------------------------------------------------------ atirador (dardos)
def atirador(pose):
    g = _raiz()
    tun = M['jog']
    if pose == 'andar1':
        mo = humano(g, tun, (30, -30), (-24, 24))
    elif pose == 'andar2':
        mo = humano(g, tun, (-30, 30), (24, -24))
    else:
        mo = humano(g, tun, (10, -16), (150, 70))
    # capuz de couro e faixa na cor
    esf(0.0, 0, 1.6, 0.2, 0.19, 0.15, M['couro'], g, seg=14, anel=8)
    cil(0.02, 0, 1.57, 0.185, 0.07, M['jog_cla'], g, verts=14)
    # bandoleira e aljava com dardos
    caixa(0.0, 0, 1.08, 0.34, 0.5, 0.08, M['couro'], g, rot=(0.0, 0.0, 0.0), bisel=0.01) if False else None
    q = grupo((-0.26, 0.05, 1.0), (0, -0.35, 0), g, 'aljava')
    cil(0, 0, 0, 0.1, 0.55, M['couro'], q, verts=8)
    for (dy, dx) in ((-0.04, 0.0), (0.05, 0.03), (0.0, -0.04)):
        cil(dx, dy, 0.5, 0.018, 0.5, M['madeira_lisa'], q, verts=5)
        cil(dx, dy, 0.98, 0.04, 0.12, M['aco'], q, verts=5, r2=0.0)
    for s in (-1, 1):
        caixa(0.0, s * 0.13, 1.1, 0.04, 0.04, 0.42, M['couro'], g, rot=(0, 0, 0), bisel=0.01)
    if pose == 'atacar':
        haste(mo['cam'], 0.25, -0.95, 0.025, M['aco'], M['madeira_lisa'], 0.3, 0.05)
    else:
        haste(mo['far'], -0.4, 0.95, 0.025, M['aco'], M['madeira_lisa'], 0.3, 0.05)
    return g


# ------------------------------------------------------------------ cavaleiro
def cavalo(g, patas):
    c, e = M['cavalo'], M['cavalo_esc']
    esf(0, 0, 1.1, 0.95, 0.36, 0.42, c, g, seg=18, anel=12)
    esf(0.62, 0, 1.18, 0.5, 0.34, 0.42, c, g, seg=14, anel=10)
    esf(-0.6, 0, 1.13, 0.5, 0.36, 0.43, c, g, seg=14, anel=10)
    # pescoço, cabeça, crina, orelhas
    esf(1.08, 0, 1.6, 0.2, 0.15, 0.42, c, g, rot=(0, 0.55, 0), seg=12, anel=8)
    esf(1.42, 0, 1.88, 0.34, 0.14, 0.15, c, g, rot=(0, 0.55, 0), seg=12, anel=8)
    esf(1.62, 0, 1.78, 0.1, 0.1, 0.1, e, g, seg=8, anel=6)
    esf(0.98, 0, 1.78, 0.08, 0.05, 0.4, e, g, rot=(0, 0.55, 0), seg=8, anel=6)
    for s in (-1, 1):
        cil(1.22, s * 0.07, 2.02, 0.04, 0.16, c, g, verts=5, r2=0.01)
    esf(-1.0, 0, 1.12, 0.1, 0.1, 0.45, e, g, rot=(0, -0.35, 0), seg=8, anel=6)
    # manta/caparison na cor, mais enfeite no peito
    esf(0.0, 0, 1.12, 0.46, 0.375, 0.435, M['jog'], g, seg=16, anel=10)
    esf(0.0, 0, 1.12, 0.07, 0.38, 0.44, M['ouro'], g, seg=12, anel=8)
    esf(0.85, 0, 1.3, 0.12, 0.36, 0.34, M['jog'], g, seg=10, anel=8)
    esf(0.0, 0, 1.55, 0.2, 0.2, 0.08, M['couro'], g, seg=10, anel=6)   # sela
    for (lado, x, sw) in ((-1, 0.72, patas[0]), (1, 0.72, patas[1]), (-1, -0.7, patas[2]), (1, -0.7, patas[3])):
        pv = grupo((x, lado * 0.2, 0.92), (0, -R(sw), 0), g, 'pata')
        caixa(0, 0, -0.92, 0.15, 0.15, 0.66, c, pv, bisel=0.03)
        caixa(0, 0, -0.92, 0.12, 0.12, 0.3, c, pv, bisel=0.03)
        caixa(0.02, 0, -0.93, 0.18, 0.18, 0.16, e, pv, bisel=0.03)


def cavaleiro(pose):
    g = _raiz()
    if pose == 'andar1':
        cavalo(g, (32, -26, -28, 30))
        r = grupo((0.05, 0, 0.53), (0, 0, 0), g, 'cavaleiro')
        mo = humano(r, M['jog'], (24, 24), (22, 40), ancho=0.37)
    elif pose == 'andar2':
        cavalo(g, (-26, 32, 30, -28))
        r = grupo((0.05, 0, 0.53), (0, 0, 0), g, 'cavaleiro')
        mo = humano(r, M['jog'], (24, 24), (22, 40), ancho=0.37)
    else:
        cavalo(g, (62, 40, -12, 6))
        r = grupo((0.05, 0, 0.53), (0, 0, 0), g, 'cavaleiro')
        mo = humano(r, M['jog'], (24, 24), (150, 40), ancho=0.37)
    # manto na cor atrás do cavaleiro, capacete e dardos
    caixa(-0.2, 0, 0.55, 0.06, 0.42, 0.85, M['jog_esc'], r, rot=(0, 0.3, 0), bisel=0.02)
    esf(0.02, 0, 1.6, 0.2, 0.19, 0.16, M['aco'], r, seg=14, anel=8)
    caixa(0.02, 0, 1.75, 0.34, 0.05, 0.1, M['jog'], r, bisel=0.02)
    if pose == 'atacar':
        haste(mo['cam'], 0.25, -1.1, 0.03, M['aco'], M['madeira_lisa'], 0.35, 0.06)
    else:
        haste(mo['cam'], -0.5, 1.2, 0.03, M['aco'], M['madeira_lisa'], 0.35, 0.06)
    # escudo pequeno atrás (lado da câmera) para dar cor
    sh = grupo((-0.1, -0.5, 1.1), None, r, 'escudo')
    cil(0, 0, 0, 0.3, 0.06, M['jog'], sh, rot=(PI / 2, 0, 0), verts=20, centro=True)
    esf(0, -0.05, 0, 0.08, 0.06, 0.08, M['ouro'], sh, seg=8, anel=6)
    return g


# ------------------------------------------------------------------ natureza
def _copa(x, y, z, r, m, seed, esc=(1, 1, 0.85), g=None):
    rocha(x, y, z, r, m, g, seed=seed, esc=esc, sub=2, ruido=0.1, rot=(0, 0, seed))


def arvore1():
    # carvalho
    caixa(0, 0, 0, 0, 0, 0, M['tronco'], bisel=0) if False else None
    cil(0, 0, 0, 0.75, 5.6, M['tronco'], verts=9, r2=0.5, liso=False)
    for a in range(4):
        ang = a * PI / 2 + 0.4
        cil(0.6 * math.cos(ang), 0.6 * math.sin(ang), 0.0, 0.3, 0.8, M['tronco'], verts=6, r2=0.0, rot=(0.0, 0, 0))
    cil(0.0, 0.0, 4.0, 0.12, 2.6, M['tronco'], verts=6, rot=(0.7, 0, 0), centro=False)
    mm = ['verde1', 'verde2', 'verde3']
    for i, (x, y, z, r) in enumerate(((0, 0, 7.6, 3.2), (-2.6, 0.4, 6.3, 2.5), (2.6, -0.4, 6.4, 2.6), (0.2, -2.3, 6.0, 2.3),
                                       (-0.6, 2.2, 6.6, 2.4), (0.4, 0.2, 9.4, 2.4), (-1.8, -1.6, 8.0, 2.0), (1.9, 1.5, 8.2, 2.0))):
        _copa(x, y, z, r, M[mm[i % 3]], i + 1)


def arvore2():
    # pinheiro
    cil(0, 0, 0, 0.55, 3.4, M['tronco'], verts=8, r2=0.4)
    for i, (z, r, h) in enumerate(((1.8, 3.6, 3.6), (4.0, 3.0, 3.4), (6.2, 2.4, 3.2), (8.2, 1.8, 3.0), (10.0, 1.1, 2.4))):
        cil(0, 0, z, r, h, M['pinho1'] if i % 2 == 0 else M['pinho2'], verts=9, r2=0.0, rot=(0, 0, i * 0.3))


def arvore3():
    # bordo (outonal)
    cil(0, 0, 0, 0.7, 4.2, M['tronco'], verts=9, r2=0.45)
    for (rx, rz, h) in ((0.55, 0.3, 3.4), (-0.55, -0.4, 3.0), (0.4, -0.8, 3.0)):
        cil(0, 0, 3.3, 0.16, h, M['tronco'], verts=6, rot=(rx, rz * 0.6, 0))
    mm = ['bordo1', 'bordo2', 'bordo3']
    for i, (x, y, z, r) in enumerate(((0, 0, 6.8, 3.0), (-2.7, 0.6, 5.8, 2.3), (2.7, -0.2, 5.9, 2.4), (0.0, -2.4, 5.6, 2.1),
                                       (-1.0, 2.2, 6.0, 2.3), (0.4, 0.0, 8.6, 2.2), (2.2, 2.0, 7.0, 1.9))):
        _copa(x, y, z, r, M[mm[i % 3]], i + 11, esc=(1, 1, 0.8))


def arbusto_frutas():
    rnd = random.Random(5)
    for i, (x, y, r) in enumerate(((0, 0, 0.7), (0.7, 0.2, 0.55), (-0.65, 0.1, 0.55), (0.1, 0.6, 0.5), (0.2, -0.55, 0.5))):
        rocha(x, y, r * 0.8, r, M['verde1'] if i % 2 else M['verde2'], seed=20 + i, esc=(1, 1, 0.85), sub=2, ruido=0.08)
    for i in range(14):
        a = rnd.uniform(0, 2 * PI); b = rnd.uniform(0.2, 1.2)
        esf(0.95 * math.cos(a) * math.cos(b) * 0.9, 0.95 * math.sin(a) * math.cos(b) * 0.9 - 0.1, 0.65 + 0.7 * math.sin(b), 0.09, 0.09, 0.09, M['baga'], seg=8, anel=6)


def pedra():
    rocha(0, 0, 0.95, 1.55, M['rocha'], seed=31, esc=(1.1, 0.9, 0.85), sub=1, ruido=0.22)
    rocha(1.9, -0.7, 0.55, 0.95, M['rocha2'], seed=32, esc=(1, 0.9, 0.8), sub=1, ruido=0.22)
    rocha(-1.7, 0.9, 0.5, 0.85, M['rocha'], seed=33, esc=(1, 1, 0.8), sub=1, ruido=0.22)
    rocha(0.4, -1.5, 0.35, 0.6, M['rocha2'], seed=34, esc=(1, 1, 0.8), sub=1, ruido=0.22)
    rocha(0.0, 0.4, 1.7, 0.5, M['rocha'], seed=35, esc=(1, 1, 0.7), sub=1, ruido=0.2)


def metal():
    rocha(0, 0, 0.9, 1.5, M['rocha_esc'], seed=41, esc=(1.1, 0.95, 0.85), sub=1, ruido=0.22)
    rocha(1.8, -0.5, 0.5, 0.9, M['rocha_esc'], seed=42, esc=(1, 0.9, 0.8), sub=1, ruido=0.22)
    rocha(-1.6, 0.8, 0.45, 0.8, M['rocha_esc'], seed=43, esc=(1, 1, 0.8), sub=1, ruido=0.22)
    # veios e cristais dourados
    rnd = random.Random(2)
    for i in range(9):
        a = rnd.uniform(0, 2 * PI)
        x, y = 1.2 * math.cos(a), 1.0 * math.sin(a) - 0.3
        z = rnd.uniform(0.7, 1.9)
        cil(x, y, z, rnd.uniform(0.14, 0.24), rnd.uniform(0.5, 0.95), M['cristal'], verts=5, r2=0.0,
            rot=(rnd.uniform(-0.6, 0.6), rnd.uniform(-0.6, 0.6), rnd.uniform(0, 3)))
    for (x, y, z, rx, rz) in ((0.3, -1.3, 1.1, 0.6, 0.3), (-0.8, -1.0, 1.5, -0.4, 0.5), (1.5, -1.3, 0.55, 0.3, 0.1)):
        caixa(x, y, z, 0.9, 0.12, 0.16, M['ouro'], rot=(rx, 0, rz), bisel=0.03, centro=True)
    rocha(0.9, -0.2, 1.9, 0.35, M['cristal'], seed=44, sub=1)


def cervo(pose=None):
    g = _raiz()
    c = M['cervo']
    esf(0, 0, 0.98, 0.58, 0.22, 0.27, c, g, seg=14, anel=10)
    esf(0, 0, 0.82, 0.5, 0.19, 0.14, M['creme'], g, seg=10, anel=6)
    esf(0.55, 0, 1.3, 0.14, 0.12, 0.3, c, g, rot=(0, 0.5, 0), seg=10, anel=8)
    esf(0.78, 0, 1.6, 0.22, 0.1, 0.11, c, g, rot=(0, 0.35, 0), seg=10, anel=8)
    esf(0.97, 0, 1.54, 0.05, 0.05, 0.05, M['preto'], g, seg=6, anel=4)
    for s in (-1, 1):
        cil(0.62, s * 0.08, 1.72, 0.04, 0.16, c, g, verts=5, r2=0.01, rot=(s * 0.4, 0, 0))
        # galhada
        for (dx, dz, rx) in ((0.0, 0.0, 0.35), (-0.12, 0.28, 0.6)):
            cil(0.66 + dx, s * (0.09 + dz * 0.4), 1.76 + dz, 0.022, 0.4, M['tronco_cl'], g, verts=5, rot=(s * rx, -0.35, 0))
        cil(0.7, s * 0.2, 2.02, 0.022, 0.3, M['tronco_cl'], g, verts=5, rot=(s * 0.7, 0.3, 0))
        cil(0.58, s * 0.3, 2.1, 0.02, 0.28, M['tronco_cl'], g, verts=5, rot=(s * 0.9, -0.4, 0))
    esf(-0.58, 0, 1.0, 0.07, 0.06, 0.1, M['creme'], g, seg=6, anel=4)
    for (lado, x, sw) in ((-1, 0.38, 14), (1, 0.38, -12), (-1, -0.38, -14), (1, -0.38, 10)):
        pv = grupo((x, lado * 0.11, 0.9), (0, -R(sw), 0), g, 'pata')
        cil(0, 0, -0.9, 0.05, 0.9, c, pv, verts=6, r2=0.035)
        cil(0.0, 0, -0.9, 0.05, 0.08, M['preto'], pv, verts=6)
    for (x, y) in ((-0.22, -0.2), (0.1, -0.22), (-0.05, -0.2), (0.25, -0.18)):
        esf(x, y, 1.12, 0.045, 0.02, 0.045, M['creme'], g, seg=6, anel=4)


def toco():
    cil(0, 0, 0, 0.62, 0.75, M['tronco'], verts=12, r2=0.5)
    cil(0, 0, 0.74, 0.52, 0.05, M['tronco_cl'], verts=12)
    for r, m in ((0.4, 'tronco'), (0.28, 'tronco_cl'), (0.16, 'tronco')):
        cil(0, 0, 0.77, r, 0.02, M[m], verts=12)
    cil(0, 0, 0.78, 0.05, 0.02, M['tronco'], verts=8)
    for a in range(5):
        ang = a * 1.26 + 0.3
        esf(0.55 * math.cos(ang), 0.55 * math.sin(ang), 0.1, 0.32, 0.14, 0.14, M['tronco'], rot=(0, 0, ang), seg=8, anel=6)
    for (x, y, rz) in ((0.9, -0.5, 0.4), (-0.8, -0.7, 1.2), (0.6, 0.9, 2.2)):
        caixa(x, y, 0.0, 0.2, 0.09, 0.06, M['tronco_cl'], rot=(0, 0, rz), bisel=0.01)


def _un(nome, fn, px):
    # (construtor, colorido, px_m)
    return None


PECAS = {}
for _n, _f in (('aldeao', aldeao), ('lanceiro', lanceiro), ('atirador', atirador), ('cavaleiro', cavaleiro)):
    for _p in ('andar1', 'andar2', 'atacar'):
        PECAS[f'{_n}_{_p}'] = ((lambda f=_f, p=_p: f(p)), True, B.PX_UNID)
for _n, _f, _px in (('arvore1', arvore1, B.PX_PREDIOS), ('arvore2', arvore2, B.PX_PREDIOS), ('arvore3', arvore3, B.PX_PREDIOS),
                    ('arbusto_frutas', arbusto_frutas, B.PX_UNID), ('pedra', pedra, B.PX_UNID), ('metal', metal, B.PX_UNID),
                    ('cervo', cervo, B.PX_UNID), ('toco', toco, B.PX_UNID)):
    PECAS[_n] = (_f, False, _px)
