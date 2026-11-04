"""Prédios do vídeo estilo Age of Empires IV. Origem = centro da base no chão; frente = lado -Y (câmera)."""
import math
from base import *  # noqa
import base as B

M = B.M
PI = math.pi


def casa():
    plataforma(0, 0, 7.8, 7.8, 0.5)
    caixa(0, 0, 0.5, 6.8, 6.4, 3.3, M['cal'], bisel=0.1)
    caixa(0, 0, 0.5, 6.95, 6.55, 0.35, M['pedra'], bisel=0.05)
    for xx in (-3.4, -1.1, 1.1, 3.4):
        caixa(xx, -3.22, 0.85, 0.2, 0.14, 2.95, M['madeira_esc'], bisel=0.02)
    caixa(0, -3.22, 3.5, 6.9, 0.16, 0.22, M['madeira_esc'], bisel=0.02)
    caixa(0, -3.22, 0.85, 6.9, 0.16, 0.2, M['madeira_esc'], bisel=0.02)
    porta(-1.4, -3.2, 0.5, 1.5, 2.3)
    janela(2.0, -3.2, 1.7, 1.0, 1.2, veneziana=M['jog'])
    telhado(0, 0, 3.8, 6.4, 6.8, 3.0, M['telha1'], M['telha2'], rot90=True, m_nucleo=M['cal'], m_cumeeira=M['jog'])
    caixa(-2.2, 1.2, 3.4, 1.0, 1.0, 3.6, M['pedra'], bisel=0.06)
    caixa(-2.2, 1.2, 7.0, 1.2, 1.2, 0.25, M['pedra_esc'], bisel=0.04)
    fumaca(-2.2, 1.2, 7.5, n=2, r=0.35)
    pano(-3.55 + 0.0, -3.28, 3.0, 0.0, 0.0) if False else None
    barril(3.4, -4.1, 0.5, r=0.45, h=0.9)
    mastro(-3.6, -3.7, 0.5, 4.0, 1.4, 0.9, M['jog'], forma='pontuda')


def _torre_q(x, y, z0, s, h, pai=None, tel=True, m_tel=None, alt_tel=None, bandeira_alt=0):
    caixa(x, y, z0, s + 0.4, s + 0.4, 0.7, M['pedra_esc'], pai, bisel=0.06)
    caixa(x, y, z0, s, s, h, M['pedra'], pai, bisel=0.08)
    caixa(x, y, z0 + h, s + 0.7, s + 0.7, 0.55, M['pedra_esc'], pai, bisel=0.06)
    caixa(x, y - s / 2 - 0.02, z0 + h * 0.55, 0.28, 0.12, 1.2, M['preto'], pai, bisel=0.02)
    caixa(x + s / 2 + 0.02, y, z0 + h * 0.55, 0.12, 0.28, 1.2, M['preto'], pai, bisel=0.02)
    if tel:
        alt_tel = alt_tel or s * 1.1
        piramide(x, y, z0 + h + 0.55, s + 1.2, alt_tel, m_tel or M['jog'], pai)
        esf(x, y, z0 + h + 0.55 + alt_tel + 0.1, 0.22, 0.22, 0.22, M['ouro'], pai, seg=8, anel=6)


def centro_cidade():
    plataforma(0, 0, 22, 22, 0.8)
    # salão principal
    caixa(0, 3, 0.8, 15.5, 11, 6.2, M['pedra'], bisel=0.12)
    caixa(0, 3, 0.8, 15.7, 11.2, 0.8, M['pedra_esc'], bisel=0.06)
    telhado(0, 3, 7.0, 15.5, 11, 5.0, M['telha1'], M['telha2'], m_nucleo=M['pedra'], m_cumeeira=M['jog'], ov=0.9, filas=9)
    # torre central com cúpula na cor
    caixa(0, 3, 9.0, 4.4, 4.4, 5.0, M['pedra'], bisel=0.1)
    caixa(0, 3, 14.0, 5.2, 5.2, 0.5, M['pedra_esc'], bisel=0.06)
    piramide(0, 3, 14.5, 6.0, 4.5, M['jog'])
    esf(0, 3, 19.2, 0.3, 0.3, 0.3, M['ouro'], seg=8, anel=6)
    mastro(0, 3, 19.4, 2.4, 2.0, 1.2, M['jog'])
    # torres de canto
    for (tx, ty, hh) in ((-9, -9, 9.5), (9, -9, 9.5), (-9, 9, 11), (9, 9, 11)):
        _torre_q(tx, ty, 0.8, 4.2, hh, alt_tel=4.2)
    # muro frontal baixo com portão
    for xs in (-1, 1):
        caixa(xs * 5.4, -9.4, 0.8, 7.6, 1.4, 3.0, M['pedra'], bisel=0.08)
        ameias(xs * 5.4, -9.4, 3.8, 7.6, 1.4, M['pedra_esc'], lados='f', alt=0.8)
    caixa(0, -9.4, 0.8, 3.6, 1.4, 0.7, M['pedra_esc'], bisel=0.05)
    for xs in (-1, 1):
        caixa(xs * 2.1, -9.5, 0.8, 0.9, 1.6, 4.0, M['pedra_esc'], bisel=0.08)
    caixa(0, -9.5, 4.0, 4.8, 1.6, 0.8, M['pedra_esc'], bisel=0.08)
    # fachada do salão
    porta(0, -2.55, 0.8, 2.6, 3.4)
    for xx in (-5.6, 5.6):
        pano(xx, -2.6, 6.6, 1.8, 4.2)
    for xx in (-3.6, 3.6):
        janela(xx, -2.55, 2.4, 0.9, 1.5, veneziana=M['jog'])
    for xx in (-6.2, 6.2):
        janela(xx, -2.55, 2.4, 0.9, 1.5)
    for (bx, by) in ((-6.0, -5.2), (6.2, -6.0)):
        barril(bx, by, 0.8)
    caixote(-6.9, -6.4, 0.8, s=0.9)
    caixote(7.0, -4.2, 0.8, s=0.8)
    mastro(-9, -9, 10.3, 3.2, 2.2, 1.3, M['jog'])
    mastro(9, -9, 10.3, 3.2, 2.2, 1.3, M['jog'])


def quartel():
    caixa(0, 0, 0, 15.6, 15.6, 0.3, M['terra'], bisel=0.1)
    # salão com empena para a frente
    caixa(-1.6, 3.2, 0.3, 9.6, 8.6, 4.2, M['madeira'], bisel=0.1)
    caixa(-1.6, 3.2, 0.3, 9.8, 8.8, 1.1, M['pedra'], bisel=0.06)
    for xx in (-6.0, -3.8, -1.6, 0.6, 2.8):
        caixa(xx, -1.15, 1.3, 0.3, 0.3, 3.2, M['madeira_esc'], bisel=0.03)
    caixa(-1.6, -1.15, 4.2, 9.8, 0.3, 0.4, M['madeira_esc'], bisel=0.03)
    telhado(-1.6, 3.2, 4.5, 8.6, 9.6, 4.2, M['tabua1'], M['tabua2'], rot90=True, m_nucleo=M['madeira'], m_cumeeira=M['jog'], ov=0.8, filas=7)
    caixa(-1.6, -1.6, 4.4, 10.8, 0.2, 0.3, M['jog'], bisel=0.02)
    porta(-1.6, -1.1, 0.3, 2.6, 3.0, moldura=M['madeira_esc'])
    for xx in (-5.4, 2.2):
        pano(xx, -1.25, 4.1, 1.4, 3.0)
    # anexo (arsenal) à direita
    caixa(5.4, 3.6, 0.3, 4.2, 6.2, 2.8, M['madeira'], bisel=0.08)
    telhado(5.4, 3.6, 3.1, 6.2, 4.2, 1.6, M['tabua2'], M['tabua1'], rot90=True, m_nucleo=M['madeira'], m_cumeeira=M['madeira_esc'], ov=0.5, filas=5)
    # pátio de treino
    for xx in (-5.2, -1.0):
        caixa(xx, -4.6, 0.3, 0.22, 0.22, 2.2, M['madeira_esc'], bisel=0.03)
        caixa(xx, -4.6, 1.6, 1.5, 0.18, 0.2, M['madeira_esc'], bisel=0.03)
        esf(xx, -4.6, 2.45, 0.34, 0.34, 0.34, M['palha1'], seg=10, anel=8)
        cil(xx, -4.87, 1.0, 0.45, 0.1, M['jog'], rot=(PI / 2, 0, 0), verts=14, centro=True)
    caixa(3.6, -4.6, 0.3, 2.4, 0.4, 0.7, M['madeira_esc'], bisel=0.03)
    for i in range(5):
        xx = 2.7 + i * 0.45
        cil(xx, -4.6, 0.3, 0.05, 2.9, M['madeira_lisa'], verts=6)
        cil(xx, -4.6, 3.1, 0.12, 0.45, M['aco'], verts=6, r2=0.0)
    cerca(-7.4, -7.0, 7.4, -7.0)
    cerca(-7.4, -7.0, -7.4, -2.0)
    cerca(7.4, -7.0, 7.4, -2.0)
    mastro(5.8, -6.2, 0.3, 5.2, 2.0, 1.2, M['jog'])
    barril(6.2, -1.0, 0.3)


def estabulo():
    caixa(0, 0, 0, 16, 14, 0.3, M['terra'], bisel=0.1)
    caixa(-2.6, 2.4, 0.3, 9.4, 8.8, 3.8, M['madeira'], bisel=0.1)
    caixa(-2.6, 2.4, 0.3, 9.6, 9.0, 0.8, M['pedra'], bisel=0.06)
    telhado(-2.6, 2.4, 4.1, 8.8, 9.4, 4.2, M['palha1'], M['palha2'], rot90=True, m_nucleo=M['madeira'], m_cumeeira=M['jog'], ov=0.9, filas=7)
    caixa(-2.6, -2.35, 0.3, 4.4, 0.3, 3.2, M['porta'], bisel=0.05)
    for s in (-1, 1):
        caixa(-2.6 + s * 2.4, -2.4, 0.3, 0.5, 0.4, 3.4, M['madeira_esc'], bisel=0.03)
        caixa(-2.6 + s * 1.1, -2.55, 0.5, 0.2, 0.1, 2.6, M['jog'], bisel=0.02)
    caixa(-2.6, -2.4, 3.5, 5.4, 0.4, 0.5, M['madeira_esc'], bisel=0.03)
    caixa(-2.6, -2.56, 1.2, 4.2, 0.12, 0.25, M['jog'], bisel=0.02)
    for xx in (-7.0, 1.7):
        pano(xx, -2.4, 3.8, 1.2, 2.6)
    # curral à direita com cocho e feno
    cerca(2.8, -6.8, 7.4, -6.8)
    cerca(7.4, -6.8, 7.4, 6.4)
    cerca(2.8, -6.8, 2.8, -3.6)
    cerca(2.8, 6.4, 7.4, 6.4)
    caixa(5.4, 3.0, 0.3, 2.4, 0.7, 0.5, M['madeira_esc'], bisel=0.05)
    caixa(5.4, 3.0, 0.75, 2.2, 0.5, 0.1, M['agua'], bisel=0.02)
    for (hx, hy, rz) in ((5.2, -2.2, 0), (6.3, -2.6, 0.3), (5.6, -3.7, -0.2)):
        cil(hx, hy, 0.3, 0.65, 1.1, M['feno'], rot=(0, PI / 2, rz), verts=14)
    cil(6.0, 0.0, 0.3, 0.65, 1.1, M['feno'], rot=(0, PI / 2, 0.4), verts=14)
    caixa(-7.0, -4.6, 0.3, 1.2, 0.9, 0.9, M['feno'], bisel=0.1)
    mastro(-6.0, -6.4, 0.3, 5.6, 2.0, 1.2, M['jog'])


def torre():
    caixa(0, 0, 0, 6.2, 6.2, 0.7, M['pedra_esc'], bisel=0.08)
    cil(0, 0, 0.7, 3.95, 8.4, M['pedra'], rot=(0, 0, PI / 4), verts=4, r2=3.25)
    caixa(0, 0, 9.1, 6.0, 6.0, 0.7, M['pedra_esc'], bisel=0.06)
    caixa(0, 0, 9.8, 5.2, 5.2, 2.2, M['madeira'], bisel=0.08)
    for (ax, ay) in ((-1.7, -2.65), (0, -2.65), (1.7, -2.65)):
        caixa(ax, ay, 10.4, 0.7, 0.1, 0.8, M['preto'], bisel=0.02)
    for xx in (-2.6, 2.6):
        caixa(xx, -2.6, 9.8, 0.3, 0.3, 2.2, M['madeira_esc'], bisel=0.03)
        caixa(-xx, 2.6, 9.8, 0.3, 0.3, 2.2, M['madeira_esc'], bisel=0.03)
    caixa(0, 0, 12.0, 5.8, 5.8, 0.35, M['jog_esc'], bisel=0.04)
    piramide(0, 0, 12.35, 6.0, 3.0, M['jog'])
    esf(0, 0, 15.45, 0.2, 0.2, 0.2, M['ouro'], seg=8, anel=6)
    mastro(0, 0, 15.4, 2.2, 1.9, 1.1, M['jog'])
    porta(0, -3.0, 0.7, 1.4, 2.6)
    for zz in (4.2, 6.6):
        caixa(0, -2.9 + (zz - 4) * 0.055, zz, 0.25, 0.14, 1.1, M['preto'], bisel=0.02)
    pano(0, -3.15, 8.6, 1.3, 3.2) if False else None
    cil(0, -3.0, 5.2, 0.55, 0.1, M['jog'], rot=(PI / 2 + 0.0, 0, 0), verts=14, centro=True) if False else None


def fazenda():
    caixa(0, 0, 0, 14, 14, 0.3, M['solo'], bisel=0.12)
    for i in range(7):
        yy = -5.7 + i * 1.9
        caixa(0, yy, 0.3, 12.6, 1.1, 0.35, M['solo_esc'], bisel=0.12)
        verde = (i % 3 == 2)
        for j in range(12):
            xx = -5.9 + j * 1.07
            cil(xx, yy, 0.55, 0.28, 0.9, M['trigo_v'] if verde else M['trigo'], verts=6, r2=0.04)
    cerca(-7, 7, 7, 7, h=0.9)
    cerca(-7, 7, -7, -7, h=0.9)
    cerca(7, 7, 7, -7, h=0.9)
    # espantalho
    cil(5.2, -6.0, 0.3, 0.08, 2.0, M['madeira_esc'], verts=6)
    caixa(5.2, -6.0, 1.7, 1.5, 0.1, 0.1, M['madeira_esc'], bisel=0.01)
    caixa(5.2, -6.0, 0.9, 0.5, 0.28, 0.9, M['jog'], bisel=0.05)
    esf(5.2, -6.0, 2.2, 0.28, 0.28, 0.28, M['palha1'], seg=10, anel=8)
    cone = cil(5.2, -6.0, 2.4, 0.5, 0.35, M['palha2'], verts=10, r2=0.1)
    mastro(-6.6, -6.7, 0.3, 3.0, 1.5, 0.95, M['jog'])


def ferreiro():
    caixa(0, 0, 0, 12, 12, 0.3, M['terra'], bisel=0.1)
    caixa(2.2, 2.2, 0.3, 6.8, 7.2, 3.4, M['pedra'], bisel=0.1)
    telhado(2.2, 2.2, 3.7, 7.2, 6.8, 3.0, M['tabua1'], M['tabua2'], rot90=True, m_nucleo=M['pedra'], m_cumeeira=M['jog'], ov=0.8, filas=6)
    caixa(-1.9, 4.2, 0.3, 1.6, 1.6, 7.2, M['pedra'], bisel=0.08)
    caixa(-1.9, 4.2, 7.5, 2.0, 2.0, 0.3, M['pedra_esc'], bisel=0.05)
    fumaca(-1.9, 4.2, 8.1, n=3, r=0.45)
    porta(3.4, -1.45, 0.3, 1.5, 2.4)
    janela(0.6, -1.45, 1.7, 0.9, 1.0, veneziana=M['jog'])
    pano(5.3, -1.52, 3.5, 1.0, 2.2)
    caixa(-3.6, -1.6, 0.3, 2.2, 1.6, 1.0, M['pedra_esc'], bisel=0.06)
    caixa(-3.6, -1.6, 1.25, 1.8, 1.2, 0.15, M['brasa'], bisel=0.02)
    esf(-3.6, -1.6, 1.45, 0.6, 0.45, 0.25, M['fogo'], seg=8, anel=6)
    caixa(-0.6, -4.2, 0.3, 0.6, 0.6, 0.75, M['madeira_esc'], bisel=0.04)
    caixa(-0.6, -4.2, 1.05, 1.3, 0.55, 0.3, M['ferro'], bisel=0.05)
    caixa(0.0, -4.2, 1.1, 0.5, 0.35, 0.18, M['ferro'], bisel=0.04)
    barril(3.8, -4.6, 0.3)
    for i in range(3):
        caixa(5.55 + 0.0, 1.0 + i * 0.5, 1.7, 0.06, 0.1, 1.4, M['aco'], bisel=0.01)
    rocha(-4.3, -4.8, 0.55, 0.55, M['pedra_esc'], seed=9)
    mastro(5.2, -5.2, 0.3, 4.0, 1.6, 1.0, M['jog'])


def templo():
    caixa(0, 0, 0, 14, 20, 0.5, M['pedra'], bisel=0.08)
    caixa(0, 0, 0.5, 13, 19, 0.5, M['pedra'], bisel=0.08)
    caixa(0, 0, 1.0, 12.2, 18.2, 0.4, M['marmore'], bisel=0.06)
    caixa(0, 3.2, 1.4, 9.6, 12.4, 5.6, M['marmore'], bisel=0.1)
    caixa(0, 3.2, 1.4, 9.8, 12.6, 0.5, M['pedra'], bisel=0.05)
    # degraus
    for i in range(3):
        caixa(0, -9.5 - i * 0.6 + 0.6, 0.0, 6.0 + i * 0.0, 1.0, 0.5 - i * 0.0 - 0.0 + 0.0, M['pedra'], bisel=0.04) if False else None
    for i in range(3):
        caixa(0, -9.3 - i * 0.55, 0, 6.5, 0.7, 1.2 - i * 0.4, M['marmore'], bisel=0.05)
    # colunata frontal
    for xx in (-4.4, -2.65, -0.9, 0.9, 2.65, 4.4):
        caixa(xx, -6.8, 1.4, 1.1, 1.1, 0.35, M['pedra'], bisel=0.04)
        cil(xx, -6.8, 1.75, 0.5, 5.2, M['marmore'], verts=14, liso=True)
        caixa(xx, -6.8, 6.95, 1.2, 1.2, 0.3, M['pedra'], bisel=0.04)
    caixa(0, -6.8, 7.25, 10.8, 1.5, 0.5, M['marmore'], bisel=0.05)
    caixa(0, -6.8, 7.75, 10.8, 1.5, 0.12, M['jog'], bisel=0.02)
    # frontão (ridge ao longo de y) cobrindo cela e pórtico
    telhado(0, 1.6, 7.75, 16.6 + 0.0, 11.2, 3.2, M['telha1'], M['telha2'], rot90=True, m_nucleo=M['marmore'], m_cumeeira=M['jog'], ov=0.7, ovx=0.55, filas=7)
    esf(0, -7.0, 11.9, 0.35, 0.35, 0.35, M['ouro'], seg=8, anel=6)
    porta(0, -2.95, 1.4, 2.2, 3.8, moldura=M['pedra_esc'])
    for xx in (-3.5, 3.5):
        pano(xx, -2.98, 5.8, 1.4, 3.4)
    # braseiros
    for xx in (-6.0, 6.0):
        cil(xx, -10.0, 0, 0.5, 1.2, M['pedra_esc'], verts=10, r2=0.7)
        esf(xx, -10.0, 1.6, 0.5, 0.5, 0.55, M['fogo'], seg=8, anel=6)


def mercado():
    plataforma(0, 0, 16, 16, 0.3)
    # barracas laterais com toldos listrados
    def barraca(x, y, giro, esc=1.0):
        g = grupo((x, y, 0.3), (0, 0, giro))
        for (px, py) in ((-1.7, -1.1), (1.7, -1.1), (-1.7, 1.1), (1.7, 1.1)):
            cil(px, py, 0, 0.12, 3.0 if py < 0 else 3.6, M['madeira_esc'], g, verts=6)
        caixa(0, -0.7, 0.0, 3.2, 1.1, 1.0, M['madeira_lisa'], g, bisel=0.05)
        for i in range(6):
            cor = M['jog'] if i % 2 == 0 else M['creme']
            xx = -1.95 + i * 0.78
            caixa(xx + 0.39, 0, 3.3, 0.78, 3.0, 0.14, cor, g, rot=(0.28, 0, 0), bisel=0.02, centro=False)
        for i, mm in enumerate((M['baga'], M['trigo'], M['verde2'])):
            esf(-1.0 + i * 1.0, -0.7, 1.15, 0.28, 0.28, 0.28, mm, g, seg=10, anel=7)
        caixote(2.3, 0.5, 0, g, s=0.8)
    barraca(-4.4, -4.2, 0)
    barraca(4.4, -4.2, 0)
    barraca(-4.4, 4.6, 0)
    barraca(4.4, 4.6, 0)
    # pavilhão central
    for (px, py) in ((-1.8, -1.8), (1.8, -1.8), (-1.8, 1.8), (1.8, 1.8)):
        cil(px, py, 0.3, 0.16, 4.2, M['madeira_esc'], verts=6)
    caixa(0, 0, 4.5, 4.4, 4.4, 0.3, M['madeira_esc'], bisel=0.04)
    cil(0, 0, 4.8, 3.2, 2.6, M['jog'], rot=(0, 0, PI / 4), verts=4, r2=0.0)
    caixa(0, 0, 4.8, 4.6, 4.6, 0.32, M['creme'], bisel=0.03)
    mastro(0, 0, 7.3, 2.0, 1.6, 1.0, M['jog'])
    esf(0, 0, 0.7, 0.9, 0.9, 0.5, M['agua'], seg=10, anel=6)
    cil(0, 0, 0.3, 1.0, 0.6, M['pedra_esc'], verts=12, r2=1.1)
    for (bx, by) in ((-6.8, 0.2), (6.8, 0.2)):
        barril(bx, by, 0.3)
    caixote(0, -6.8, 0.3, s=0.9)
    caixote(0.9, -6.9, 0.3, s=0.7, rot=(0, 0, 0.5))


def _muralha(x, y, z0, sx, sy, h, lados):
    caixa(x, y, z0, sx, sy, h, M['pedra'], bisel=0.1)
    caixa(x, y, z0, sx + 0.2, sy + 0.2, 0.8, M['pedra_esc'], bisel=0.06)
    ameias(x, y, z0 + h, sx, sy, M['pedra_esc'], lados=lados, alt=0.9, larg=1.0, esp=0.7, passo=2.2)


def fortaleza():
    plataforma(0, 0, 30, 30, 0.5)
    z = 0.5
    # muralhas (frente com portão, laterais e fundo)
    for xs in (-1, 1):
        _muralha(xs * 9.2, -13.0, z, 9.6, 2.0, 6.0, 'f')
        _muralha(xs * 13.0, 0, z, 2.0, 24.0, 6.0, 'de' if xs > 0 else 'e')
    _muralha(0, 13.0, z, 24.0, 2.0, 6.0, 't')
    # keep central
    caixa(0, 3, z, 13, 12, 8, M['pedra'], bisel=0.12)
    caixa(0, 3, z, 13.3, 12.3, 0.9, M['pedra_esc'], bisel=0.06)
    caixa(0, 3, z + 8, 14.2, 13.2, 0.7, M['pedra_esc'], bisel=0.06)
    ameias(0, 3, z + 8.7, 14.2, 13.2, M['pedra_esc'], alt=0.9, larg=1.0, esp=0.7, passo=2.2)
    caixa(0, 3, z + 8.7, 8, 7, 3.5, M['pedra'], bisel=0.1)
    telhado(0, 3, z + 12.2, 8, 7, 3.6, M['telha1'], M['telha2'], m_nucleo=M['pedra'], m_cumeeira=M['jog'], ov=0.7)
    porta(0, -3.05, z + 0.0, 2.8, 4.0)
    for xx in (-4.2, 4.2):
        pano(xx, -3.1, z + 8.0, 1.8, 5.0)
        janela(xx * 1.35, -3.05, z + 4.4, 0.9, 1.5, veneziana=M['jog'])
    mastro(0, 3, z + 15.6, 3.0, 2.4, 1.4, M['jog'])
    # torres de canto
    for (tx, ty) in ((-13, -13), (13, -13), (-13, 13), (13, 13)):
        _torre_q(tx, ty, z, 5.2, 9.0, alt_tel=5.0)
    # portaria
    for xs in (-1, 1):
        _torre_q(xs * 3.7, -13, z, 3.8, 8.0, alt_tel=3.6)
    caixa(0, -13, z + 5.2, 4.2, 2.2, 2.2, M['pedra'], bisel=0.08)
    caixa(0, -14.05, z, 3.6, 0.3, 4.6, M['porta'], bisel=0.06)
    cil(0, -14.05, z + 4.6, 1.8, 0.3, M['porta'], rot=(PI / 2, 0, 0), verts=16, centro=True)
    for xx in (-1.2, 0, 1.2):
        caixa(xx, -14.25, z, 0.12, 0.1, 5.0, M['ferro'], bisel=0.01)
    for xs in (-1, 1):
        pano(xs * 8.0, -14.1, z + 5.4, 1.5, 3.2)
    mastro(-13, -13, z + 9.6, 3.0, 2.2, 1.3, M['jog'])
    mastro(13, -13, z + 9.6, 3.0, 2.2, 1.3, M['jog'])
    # carga no pátio
    barril(-5.5, -7.5, z)
    barril(-4.4, -7.8, z)
    caixote(6.5, -8.0, z)


def maravilha():
    # base escalonada
    niveis = [(34, 34, 0.0, 2.4), (29, 29, 2.4, 2.4), (24, 24, 4.8, 2.4), (19, 19, 7.2, 2.4)]
    for (sx, sy, z0, h) in niveis:
        caixa(0, 0, z0, sx, sy, h, M['pedra'], bisel=0.12)
        caixa(0, 0, z0 + h - 0.35, sx + 0.5, sy + 0.5, 0.5, M['marmore'], bisel=0.06)
        caixa(0, -sy / 2 - 0.1, z0 + 0.5, sx - 0.5, 0.2, 0.28, M['jog'], bisel=0.03)
    # escadaria frontal
    for i in range(8):
        caixa(0, -17.6 - 0.0 + i * 0.0 + (7 - i) * -0.0, 0, 7.0, 0.01, 0.01, M['pedra']) if False else None
    for i in range(9):
        caixa(0, -17.7 - (8 - i) * 0.0 + 0.0, 0, 1, 1, 1, M['pedra']) if False else None
    for i in range(4):
        zz = i * 2.4
        for j in range(3):
            caixa(0, -(17 - i * 2.5) - 1.2 + j * 0.0 - j * 0.0, zz + j * 0.0, 7.5 - i * 0.6, 1.2, 0.8 * (j + 1) * (1.0 if False else 1.0) / 1.0, M['marmore'], bisel=0.04) if False else None
    for i in range(4):
        zz = i * 2.4
        yb = -(17 - i * 2.5)
        for j in range(3):
            caixa(0, yb - 0.9 * (2 - j), 0, 7.4, 0.9, zz + 0.8 * (j + 1), M['marmore'], bisel=0.03)
    # cela superior
    caixa(0, 0, 9.6, 12, 12, 7.0, M['marmore'], bisel=0.14)
    caixa(0, 0, 9.6, 12.4, 12.4, 0.7, M['pedra'], bisel=0.06)
    caixa(0, 0, 16.6, 13.2, 13.2, 0.8, M['ouro'], bisel=0.08)
    porta(0, -6.05, 9.6, 3.2, 4.6, moldura=M['pedra_esc'])
    for xx in (-4.2, 4.2):
        pano(xx, -6.1, 15.8, 2.0, 5.0)
    # colunas frontais
    for xx in (-5.4, -3.6, 3.6, 5.4):
        cil(xx, -7.6, 9.6, 0.5, 6.6, M['marmore'], verts=14, liso=True)
    caixa(0, -7.6, 16.2, 12.4, 1.4, 0.4, M['marmore'], bisel=0.04)
    # cúpula dourada
    esf(0, 0, 17.2, 5.4, 5.4, 4.6, M['ouro'], seg=24, anel=14)
    cil(0, 0, 21.3, 0.9, 0.9, M['ouro'], verts=10)
    piramide(0, 0, 22.0, 1.4, 3.6, M['jog'])
    esf(0, 0, 25.8, 0.35, 0.35, 0.35, M['ouro'], seg=8, anel=6)
    mastro(0, 0, 26.0, 3.0, 2.6, 1.5, M['jog'])
    # obeliscos de canto na cor do jogador
    for (ox, oy) in ((-15.2, -15.2), (15.2, -15.2), (-12.5, 11.5), (12.5, 11.5)):
        zb = 2.4
        caixa(ox, oy, zb, 2.2, 2.2, 0.5, M['pedra_esc'], bisel=0.05)
        cil(ox, oy, zb + 0.5, 0.75, 5.6, M['jog'], rot=(0, 0, PI / 4), verts=4, r2=0.5)
        cil(ox, oy, zb + 6.1, 0.55, 1.4, M['ouro'], rot=(0, 0, PI / 4), verts=4, r2=0.0)
    # braseiros nas quinas do segundo nível
    for xx in (-10.5, 10.5):
        cil(xx, -12.2, 4.8, 0.55, 1.1, M['pedra_esc'], verts=10, r2=0.75)
        esf(xx, -12.2, 6.3, 0.55, 0.55, 0.65, M['fogo'], seg=8, anel=6)


def fundacao():
    plataforma(0, 0, 10, 10, 0.4)
    caixa(0, 0, 0.4, 9.4, 9.4, 0.12, M['solo_esc'], bisel=0.04)
    # paredes de pedra começando num canto
    for i in range(4):
        caixa(-3.4 + i * 1.7, 3.6, 0.5, 1.6, 0.9, 0.7 + (i % 2) * 0.35, M['pedra'], bisel=0.05)
    for i in range(3):
        caixa(-4.0, 1.4 - i * 1.7, 0.5, 0.9, 1.6, 0.7 + (i % 2) * 0.35, M['pedra'], bisel=0.05)
    # andaime de madeira
    for (px, py) in ((-4.2, -4.2), (4.2, -4.2), (-4.2, 4.2), (4.2, 4.2), (0, -4.2), (0, 4.2)):
        caixa(px, py, 0.4, 0.3, 0.3, 6.4, M['tabua1'], bisel=0.03)
    for zz in (2.2, 4.6):
        caixa(0, -4.2, zz, 8.6, 0.24, 0.26, M['tabua2'], bisel=0.02)
        caixa(0, 4.2, zz, 8.6, 0.24, 0.26, M['tabua2'], bisel=0.02)
        caixa(-4.2, 0, zz, 0.24, 8.6, 0.26, M['tabua2'], bisel=0.02)
        caixa(4.2, 0, zz, 0.24, 8.6, 0.26, M['tabua2'], bisel=0.02)
    for xx in (-2.1, 2.1):
        caixa(xx, -4.2, 3.4, 0.2, 0.2, 3.2, M['tabua2'], rot=(0, 0.7 if xx < 0 else -0.7, 0), bisel=0.02, centro=True)
    caixa(2.2, -4.0, 4.6, 3.8, 1.4, 0.22, M['tabua1'], bisel=0.03)
    caixa(-2.2, 4.0, 2.2, 3.8, 1.4, 0.22, M['tabua1'], bisel=0.03)
    # escada, pilha de tábuas e pedras
    caixa(5.4, -1.0, 0.4, 0.2, 0.2, 4.0, M['tabua2'], rot=(0.0, 0.0, 0), bisel=0.02)
    for i in range(7):
        caixa(5.2, -0.4 + 0, 0.9 + i * 0.5, 0.15, 0.2, 0.15, M['tabua2'], bisel=0.01) if False else None
    for i in range(3):
        caixa(3.0, -2.6 + i * 0.0, 0.52 + i * 0.22, 2.2, 0.55, 0.2, M['tabua1'], bisel=0.02)
    rocha(-2.2, -1.6, 0.9, 0.7, M['pedra_esc'], seed=3)
    rocha(-1.2, -2.4, 0.7, 0.55, M['pedra'], seed=4)
    caixa(0.8, -3.0, 0.52, 1.0, 0.8, 0.6, M['pedra'], bisel=0.05)


def ruina():
    rnd = random.Random(7)
    cil(0, 0, 0, 3.8, 0.12, M['carvao'], verts=18)
    # restos de parede
    for (x, y, sx, sy, sz, a) in ((-2.4, 1.6, 2.6, 1.0, 1.8, 0.2), (1.8, 2.2, 1.6, 1.0, 1.1, -0.3), (2.6, -0.4, 1.0, 2.0, 0.9, 0.1),
                                  (-2.8, -1.4, 1.0, 1.8, 0.7, 0.4)):
        caixa(x, y, 0.1, sx, sy, sz, M['pedra_esc'], rot=(0, 0, a), bisel=0.06)
    # escombros
    for i in range(14):
        a = rnd.uniform(0, 2 * PI); r = rnd.uniform(0.5, 3.6)
        rocha(r * math.cos(a), r * math.sin(a), 0.25, rnd.uniform(0.25, 0.6), M['pedra_esc'] if i % 2 else M['pedra'], seed=i,
              esc=(1, 1, 0.7), rot=(0, 0, rnd.uniform(0, 3)))
    # vigas queimadas
    for (x, y, comp, a, t) in ((0.3, -0.8, 4.0, 0.5, 0.3), (-0.6, 0.3, 3.0, -0.8, 0.28), (1.2, 0.8, 2.6, 1.9, 0.26)):
        caixa(x, y, 0.5 + t * 0.4, comp, t, t, M['carvao'], rot=(0.0, 0.1, a), bisel=0.04, centro=True)
    caixa(-1.0, -0.6, 0.0, 0.3, 0.3, 2.4, M['carvao'], rot=(0.35, 0.1, 0), bisel=0.04)
    for i in range(6):
        a = rnd.uniform(0, 2 * PI); r = rnd.uniform(0.2, 1.6)
        esf(r * math.cos(a), r * math.sin(a), 0.25, 0.14, 0.14, 0.1, M['brasa'], seg=6, anel=4)
    fumaca(0.2, 0.2, 1.4, n=4, r=0.55)


PREDIOS = {
    'centro_cidade': (centro_cidade, True), 'casa': (casa, True), 'quartel': (quartel, True), 'estabulo': (estabulo, True),
    'torre': (torre, True), 'fazenda': (fazenda, True), 'ferreiro': (ferreiro, True), 'templo': (templo, True),
    'mercado': (mercado, True), 'fortaleza': (fortaleza, True), 'maravilha': (maravilha, True),
    'fundacao': (fundacao, False), 'ruina': (ruina, False),
}
