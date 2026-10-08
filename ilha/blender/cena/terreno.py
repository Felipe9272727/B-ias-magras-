"""Terreno da ilha (low-poly facetado) + definição das zonas do jogo.

A ilha é gerada por uma função de altura determinística (mesma seed = mesma ilha), usada também pelo
motor do jogo para saber a zona de cada ponto. Exporta ilha/dados/ilha.json com as zonas (centro, raio,
nome, bioma) para o simulador e para o Remotion.

Uso no Blender:  from terreno import criar_ilha, ZONAS, altura
"""
import json
import math
import os
import random

R_ILHA = 120.0  # raio aproximado da ilha (m)
NIVEL_MAR = 0.0

# zonas do jogo: centro (x, y), raio, bioma. A Cornucópia fica no centro.
ZONAS = [
    {'id': 'cornucopia', 'nome': 'Cornucópia', 'c': (0, 0), 'r': 16, 'bioma': 'clareira'},
    {'id': 'praia_sul', 'nome': 'Praia do Naufrágio', 'c': (0, -95), 'r': 26, 'bioma': 'praia'},
    {'id': 'floresta', 'nome': 'Floresta Densa', 'c': (62, 10), 'r': 34, 'bioma': 'floresta'},
    {'id': 'montanha', 'nome': 'Montanha', 'c': (-5, 72), 'r': 32, 'bioma': 'montanha'},
    {'id': 'caverna', 'nome': 'Caverna', 'c': (-30, 62), 'r': 10, 'bioma': 'caverna'},
    {'id': 'lago', 'nome': 'Lago', 'c': (-58, 12), 'r': 18, 'bioma': 'lago'},
    {'id': 'pantano', 'nome': 'Mangue', 'c': (-70, -40), 'r': 24, 'bioma': 'mangue'},
    {'id': 'ruinas', 'nome': 'Ruínas', 'c': (48, 66), 'r': 18, 'bioma': 'ruinas'},
    {'id': 'praia_leste', 'nome': 'Praia dos Coqueiros', 'c': (92, -42), 'r': 22, 'bioma': 'praia'},
    {'id': 'campo', 'nome': 'Campo Aberto', 'c': (28, -48), 'r': 26, 'bioma': 'campo'},
]


def _ruido(x, y, seed=7):
    """Ruído suave determinístico sem depender do mathutils (para rodar também fora do Blender)."""
    def h(ix, iy):
        n = (ix * 374761393 + iy * 668265263 + seed * 2147483647) & 0xFFFFFFFF
        n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
        return ((n ^ (n >> 16)) & 0xFFFF) / 65535.0
    x0, y0 = math.floor(x), math.floor(y)
    fx, fy = x - x0, y - y0
    sx, sy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a, b, c, d = h(x0, y0), h(x0 + 1, y0), h(x0, y0 + 1), h(x0 + 1, y0 + 1)
    return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy


def fbm(x, y, oit=4, seed=7):
    s, amp, f = 0.0, 1.0, 1.0
    for i in range(oit):
        s += amp * _ruido(x * f, y * f, seed + i * 31)
        amp *= 0.5
        f *= 2.0
    return s / 1.875


def altura(x, y):
    """Altura do terreno (m). Abaixo de 0 é mar."""
    # contorno irregular da ilha
    ang = math.atan2(y, x)
    borda = R_ILHA * (0.70 + 0.42 * fbm(math.cos(ang) * 1.6 + 5, math.sin(ang) * 1.6 + 5, 4, 11))
    d = math.hypot(x / 1.18, y) / borda  # ilha alongada leste-oeste
    base = 1.0 - d * d
    h = base * 6.0 + (fbm(x / 26, y / 26, 5) - 0.42) * 11.0 * max(0.0, base) ** 0.7
    # morros espalhados
    h += max(0.0, fbm(x / 45 + 9, y / 45 + 3, 3, 23) - 0.45) * 30.0 * max(0.0, base)
    # montanha ao norte
    dm = math.hypot((x + 5) * 0.9, y - 74) / 52
    crista = 0.75 + 0.5 * fbm(x / 14 + 3, y / 14 + 8, 3, 41)  # encosta irregular
    h += max(0.0, 1 - dm) ** 1.35 * 44.0 * crista
    # lago (bacia) a oeste
    dl = math.hypot(x + 58, y - 12) / 18
    if dl < 1:
        h = min(h, -1.2 + dl * dl * 3.5)
    # clareira plana da Cornucópia
    dc = math.hypot(x, y) / 18
    if dc < 1:
        alvo = 3.2
        k = (1 - dc) ** 0.6
        h = h * (1 - k) + alvo * k
    # praias: suaviza perto do mar
    if 0 < h < 1.2:
        h *= 0.85
    if d > 1:
        h = -2.0 - (d - 1) * 30
    return h


def zona_em(x, y, torcer=False):
    """Zona do jogo mais próxima (por distância relativa ao raio). torcer=True borra as fronteiras (só visual)."""
    if torcer:
        x += (fbm(x / 22 + 40, y / 22, 3, 5) - 0.5) * 40
        y += (fbm(x / 22, y / 22 + 40, 3, 6) - 0.5) * 40
    melhor, md = None, 1e9
    for z in ZONAS:
        dd = math.hypot(x - z['c'][0], y - z['c'][1]) / z['r']
        if dd < md:
            melhor, md = z, dd
    return melhor


def exportar_dados(caminho):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, 'w') as f:
        json.dump({'raio': R_ILHA, 'zonas': ZONAS}, f, ensure_ascii=False, indent=1)


# ---------------------------------------------------------------- Blender
def criar_ilha(nome='Ilha', passo=4.0, extensao=150.0):
    """Malha triangulada facetada do terreno, com material por face conforme altura/zona."""
    import bpy
    import bmesh
    import sys
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'assets'))
    from util import mat_cor

    mats = {
        'areia': mat_cor('ilha_areia', (0.93, 0.84, 0.6)),
        'areia_molhada': mat_cor('ilha_areia_molhada', (0.80, 0.70, 0.48)),
        'grama': mat_cor('ilha_grama', (0.47, 0.72, 0.33)),
        'grama_escura': mat_cor('ilha_grama_escura', (0.27, 0.52, 0.27)),
        'campo': mat_cor('ilha_campo', (0.62, 0.76, 0.36)),
        'terra': mat_cor('ilha_terra', (0.55, 0.42, 0.30)),
        'rocha': mat_cor('ilha_rocha', (0.55, 0.55, 0.58)),
        'rocha_escura': mat_cor('ilha_rocha_escura', (0.40, 0.40, 0.44)),
        'neve': mat_cor('ilha_neve', (0.95, 0.96, 0.98)),
        'mangue': mat_cor('ilha_mangue', (0.36, 0.45, 0.26)),
        'fundo': mat_cor('ilha_fundo', (0.76, 0.68, 0.5)),
    }
    ordem = list(mats)
    me = bpy.data.meshes.new(nome)
    ob = bpy.data.objects.new(nome, me)
    bpy.context.collection.objects.link(ob)
    for k in ordem:
        me.materials.append(mats[k])
    bm = bmesh.new()
    rnd = random.Random(3)
    n = int(2 * extensao / passo) + 1
    grade = []
    for j in range(n):
        linha = []
        for i in range(n):
            x = -extensao + i * passo + (rnd.random() - 0.5) * passo * 0.5
            y = -extensao + j * passo + (rnd.random() - 0.5) * passo * 0.5
            linha.append(bm.verts.new((x, y, altura(x, y))))
        grade.append(linha)
    for j in range(n - 1):
        for i in range(n - 1):
            a, b, c, d = grade[j][i], grade[j][i + 1], grade[j + 1][i + 1], grade[j + 1][i]
            tris = [(a, b, c), (a, c, d)] if (i + j) % 2 == 0 else [(a, b, d), (b, c, d)]
            for t in tris:
                f = bm.faces.new(t)
                cx = sum(v.co.x for v in t) / 3
                cy = sum(v.co.y for v in t) / 3
                cz = sum(v.co.z for v in t) / 3
                incl = f.normal.z if f.normal.z > 0 else 1
                z = zona_em(cx, cy, torcer=True)
                if cz < -0.4:
                    k = 'fundo'
                elif cz < 0.6:
                    k = 'areia_molhada' if cz < 0.15 else 'areia'
                elif cz > 30:
                    k = 'neve'
                elif cz > 14 or incl < 0.72:
                    k = 'rocha' if (cz > 20 or rnd.random() < 0.6) else 'rocha_escura'
                elif z['bioma'] == 'floresta' or (z['bioma'] == 'montanha' and cz < 14):
                    k = 'grama_escura'
                elif z['bioma'] == 'campo':
                    k = 'campo'
                elif z['bioma'] == 'mangue':
                    k = 'mangue'
                elif z['bioma'] == 'praia' and cz < 2.2:
                    k = 'areia'
                elif z['bioma'] == 'ruinas' and rnd.random() < 0.35:
                    k = 'terra'
                else:
                    k = 'grama' if rnd.random() < 0.85 else 'grama_escura'
                f.material_index = ordem.index(k)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = False
    return ob


if __name__ == '__main__':
    raiz = os.path.join(os.path.dirname(__file__), '..', '..')
    exportar_dados(os.path.join(raiz, 'dados', 'ilha.json'))
    print('zonas exportadas')
