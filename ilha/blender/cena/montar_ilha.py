"""Monta a ilha completa: terreno + mar calmo + vegetação por bioma + Cornucópia e as 12 plataformas de largada.

Espalhamento determinístico (mesma seed = mesma ilha). Usa cópias ligadas (mesma malha) para ficar leve.
As posições das plataformas vão para ilha/dados/plataformas.json (o jogo e o Remotion usam).

Uso:  from montar_ilha import montar_ilha;  montar_ilha()
Teste: xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P ilha/blender/cena/montar_ilha.py
"""
import bpy, json, math, os, random, sys
import mathutils

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.append(AQUI)
sys.path.append(os.path.join(AQUI, '..', 'assets'))
from terreno import criar_ilha, altura, zona_em, ZONAS, exportar_dados  # noqa: E402
from mar import criar_mar, criar_mar_calmo, ceu_dia  # noqa: E402
from util import mat_cor  # noqa: E402
import natureza as N  # noqa: E402
import objetos as O  # noqa: E402
import animais as A  # noqa: E402

DADOS = os.path.join(AQUI, '..', '..', 'dados')
R_PLAT = 24  # raio do círculo de plataformas em volta da Cornucópia


def _modelos():
    """Cria 3–5 variações de cada modelo (escondidas) para copiar."""
    col = bpy.data.collections.new('modelos')
    bpy.context.scene.collection.children.link(col)
    tipos = {
        'palmeira': [N.criar_palmeira, 4], 'coqueiro': [N.criar_coqueiro, 3], 'pinheiro': [N.criar_pinheiro, 4],
        'redonda': [N.criar_arvore_redonda, 4], 'morta': [N.criar_arvore_morta, 3], 'arbusto': [N.criar_arbusto, 4],
        'arbusto_frutas': [N.criar_arbusto_frutas, 3], 'capim': [N.criar_capim, 3], 'flores': [N.criar_flores, 3],
        'cogumelos': [N.criar_cogumelos, 2], 'tronco': [N.criar_tronco_caido, 2], 'cacto': [N.criar_cacto, 2],
    }
    mods = {}
    for k, (fn, n) in tipos.items():
        mods[k] = []
        for i in range(n):
            o = fn(f'M_{k}_{i}', seed=i * 7 + 1)
            for c in o.users_collection:
                c.objects.unlink(o)
            col.objects.link(o)
            mods[k].append(o)
    mods['pedra'] = []
    for t in range(3):
        for i in range(2):
            o = N.criar_pedra(f'M_pedra_{t}_{i}', seed=i * 5 + t, tipo=t)
            for c in o.users_collection:
                c.objects.unlink(o)
            col.objects.link(o)
            mods['pedra'].append(o)
    col.hide_render = True
    col.hide_viewport = True
    return mods


def _copia(mods, tipo, x, y, rnd, escala=1.0, destino=None):
    m = rnd.choice(mods[tipo])
    o = m.copy()  # cópia ligada: mesma malha
    o.location = (x, y, altura(x, y) - 0.05)
    o.rotation_euler = (0, 0, rnd.uniform(0, 6.283))
    s = escala * rnd.uniform(0.8, 1.25)
    o.scale = (s, s, s)
    (destino or bpy.context.scene.collection).objects.link(o)
    return o


def espalhar(mods, seed=11, densidade=1.0):
    rnd = random.Random(seed)
    col = bpy.data.collections.new('vegetacao')
    bpy.context.scene.collection.children.link(col)
    n = int(5200 * densidade)
    for _ in range(n):
        x, y = rnd.uniform(-150, 150), rnd.uniform(-150, 150)
        h = altura(x, y)
        if h < 0.35:
            continue
        if math.hypot(x, y) < R_PLAT + 12:  # clareira da Cornucópia limpa
            continue
        z = zona_em(x, y, torcer=True)
        b = z['bioma']
        r = rnd.random()
        if h < 2.2 and b in ('praia', 'campo', 'clareira', 'floresta', 'mangue'):
            if r < 0.12:
                _copia(mods, rnd.choice(['palmeira', 'coqueiro']), x, y, rnd, 1.3, col)
            elif r < 0.17:
                _copia(mods, 'pedra', x, y, rnd, 0.8, col)
        elif h > 26:
            if r < 0.10:
                _copia(mods, 'pedra', x, y, rnd, 2.2, col)
        elif h > 13:
            if r < 0.18:
                _copia(mods, 'pedra', x, y, rnd, 1.8, col)
            elif r < 0.30:
                _copia(mods, 'pinheiro', x, y, rnd, 1.1, col)
        elif b == 'floresta' or (b == 'montanha'):
            if r < 0.42:
                _copia(mods, rnd.choice(['pinheiro', 'redonda', 'redonda']), x, y, rnd, 1.4, col)
            elif r < 0.55:
                _copia(mods, rnd.choice(['arbusto', 'arbusto_frutas', 'cogumelos']), x, y, rnd, 1.0, col)
            elif r < 0.6:
                _copia(mods, 'tronco', x, y, rnd, 1.0, col)
        elif b == 'mangue':
            if r < 0.2:
                _copia(mods, rnd.choice(['morta', 'arbusto']), x, y, rnd, 1.3, col)
            elif r < 0.3:
                _copia(mods, 'capim', x, y, rnd, 1.3, col)
        elif b == 'campo':
            if r < 0.06:
                _copia(mods, 'redonda', x, y, rnd, 1.3, col)
            elif r < 0.25:
                _copia(mods, rnd.choice(['capim', 'flores', 'capim']), x, y, rnd, 1.4, col)
        elif b == 'ruinas':
            if r < 0.08:
                _copia(mods, 'pedra', x, y, rnd, 1.4, col)
            elif r < 0.16:
                _copia(mods, rnd.choice(['arbusto', 'capim']), x, y, rnd, 1.0, col)
        elif b == 'lago':
            if r < 0.15:
                _copia(mods, rnd.choice(['capim', 'arbusto', 'flores']), x, y, rnd, 1.1, col)
        else:
            if r < 0.1:
                _copia(mods, rnd.choice(['redonda', 'arbusto', 'capim', 'flores']), x, y, rnd, 1.2, col)
    return col


def ruinas(seed=4):
    """Colunas quebradas e blocos de pedra (feito aqui, simples)."""
    rnd = random.Random(seed)
    z = next(z for z in ZONAS if z['id'] == 'ruinas')
    cx, cy = z['c']
    mat = mat_cor('ruina_pedra', (0.78, 0.74, 0.66))
    for i in range(10):
        a = i / 10 * 6.283
        x, y = cx + math.cos(a) * 9, cy + math.sin(a) * 9
        alt = rnd.choice([1.2, 2.5, 4.2, 4.2, 0.6])
        bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.55, depth=alt, location=(x, y, altura(x, y) + alt / 2))
        c = bpy.context.object
        c.data.materials.append(mat)
        c.rotation_euler = (rnd.uniform(-0.08, 0.08), rnd.uniform(-0.08, 0.08), 0)
    for i in range(14):
        x, y = cx + rnd.uniform(-11, 11), cy + rnd.uniform(-11, 11)
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, altura(x, y) + 0.3))
        b = bpy.context.object
        b.scale = (rnd.uniform(0.6, 1.4), rnd.uniform(0.5, 1.0), rnd.uniform(0.4, 0.8))
        b.rotation_euler = (0, rnd.uniform(-0.2, 0.2), rnd.uniform(0, 3))
        b.data.materials.append(mat)


def cornucopia_e_plataformas():
    h0 = altura(0, 0)
    c = O.criar_cornucopia('Cornucopia', seed=1)
    c.location = (0, 0, h0)
    c.scale = (2, 2, 2)  # 12 m: tem que ser o marco da ilha
    c.rotation_euler = (0, 0, math.radians(-90))  # boca virada para o sul (praia)
    rnd = random.Random(9)
    # suprimentos espalhados na frente da boca
    fabs = [O.criar_caixote, O.criar_mochila, O.criar_lanca, O.criar_arco, O.criar_machado, O.criar_kit_medico,
            O.criar_cantil, O.criar_lata_comida, O.criar_mochila, O.criar_faca, O.criar_garrafa_agua, O.criar_caixote]
    for i, fn in enumerate(fabs * 2):
        a = math.radians(-90) + rnd.uniform(-1.0, 1.0)
        d = rnd.uniform(4, 15)
        x, y = math.cos(a) * d, math.sin(a) * d
        o = fn(f'sup_{i}', seed=i)
        o.location = (x, y, altura(x, y))
        o.rotation_euler = (0, 0, rnd.uniform(0, 6.28))
    # 12 plataformas metálicas em círculo
    metal = mat_cor('plataforma_metal', (0.62, 0.66, 0.70), rough=0.35)
    plats = []
    for i in range(12):
        a = math.radians(90) - i / 12 * 6.283
        x, y = math.cos(a) * R_PLAT, math.sin(a) * R_PLAT
        bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.9, depth=0.25, location=(x, y, altura(x, y) + 0.12))
        p = bpy.context.object
        p.name = f'plataforma_{i}'
        p.data.materials.append(metal)
        plats.append({'i': i, 'x': round(x, 2), 'y': round(y, 2), 'z': round(altura(x, y) + 0.25, 2)})
    os.makedirs(DADOS, exist_ok=True)
    with open(os.path.join(DADOS, 'plataformas.json'), 'w') as f:
        json.dump(plats, f)
    return plats


def montar_ilha(densidade=1.0, mar_calmo=True):
    exportar_dados(os.path.join(DADOS, 'ilha.json'))
    criar_ilha()
    criar_mar_calmo() if mar_calmo else criar_mar(tempestade=True)
    mods = _modelos()
    espalhar(mods, densidade=densidade)
    ruinas()
    cornucopia_e_plataformas()
    return mods


if __name__ == '__main__':
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    montar_ilha()
    ceu_dia()
    bpy.ops.object.light_add(type='SUN'); s = bpy.context.object
    s.rotation_euler = (math.radians(50), math.radians(10), math.radians(35)); s.data.energy = 4.5; s.data.angle = math.radians(3)
    bpy.ops.object.camera_add(); cam = bpy.context.object; sc.camera = cam
    sc.render.engine = 'BLENDER_EEVEE_NEXT'; sc.eevee.taa_render_samples = 16
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Punchy'
    sc.render.resolution_x, sc.render.resolution_y = 1600, 900
    S = '/tmp/claude-0/-home-user-B-ias-magras-/1ec1e0ad-a38d-55a9-9e93-6eda9da8f7bf/scratchpad/'
    for nome, loc, alvo, lente in [('aerea', (190, -260, 170), (0, 5, 0), 35), ('cornucopia', (30, -48, 16), (0, -2, 3), 32)]:
        cam.location = loc; cam.data.lens = lente
        cam.rotation_euler = (mathutils.Vector(alvo) - mathutils.Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = S + f'ilhaM_{nome}.png'; bpy.ops.render.render(write_still=True)
    print('OK')
