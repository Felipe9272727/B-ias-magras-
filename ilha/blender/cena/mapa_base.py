"""Imagem base do mapa da ilha para a gameplay 2.5D (Remotion) + coordenadas de tela.

Câmera ORTOGRÁFICA isométrica (elevação 50°), sul (y negativo) embaixo na imagem, norte em cima, leste à direita.
Saídas em video/remotion/public/ilha/:
  mapa.png, mapa_noite.png  (4K, mesma câmera)
  mapa.json  {largura, altura, zonas: {id: {nome, centro, pontos, px_por_m}}, plataformas: [[x,y]...]}
As coordenadas estão em pixels, com origem no canto superior esquerdo.

Uso: xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P ilha/blender/cena/mapa_base.py
"""
import bpy, json, math, os, sys
from mathutils import Vector, kdtree
from bpy_extras.object_utils import world_to_camera_view

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.append(AQUI)
sys.path.append(os.path.join(AQUI, '..', 'assets'))
from montar_ilha import montar_ilha  # noqa: E402
from terreno import altura, ZONAS  # noqa: E402
from mar import ceu_dia  # noqa: E402

RAIZ = os.path.join(AQUI, '..', '..', '..')
DADOS = os.path.join(AQUI, '..', '..', 'dados')
SAIDA = os.path.join(RAIZ, 'video', 'remotion', 'public', 'ilha')
W, H = 3840, 2160
ELEV = 50  # elevação da câmera e do sol (graus)
SOL_ROT = 35  # azimute do sol (mesma convenção das tomadas)
MARGEM = 0.035  # folga em cada lado do enquadramento
PONTOS_POR_ZONA = 8


def preparar():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    montar_ilha(densidade=1.0)
    ceu_dia(sol_elev=ELEV, sol_rot=SOL_ROT)
    sc.render.engine = 'BLENDER_EEVEE_NEXT'
    sc.eevee.taa_render_samples = 32
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Punchy'
    sc.render.resolution_x, sc.render.resolution_y = W, H
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'
    return sc


def luz_sol(elev, rot, energia, cor):
    bpy.ops.object.light_add(type='SUN')
    s = bpy.context.object
    s.rotation_euler = (math.radians(90 - elev), 0, math.radians(rot))
    s.data.energy = energia
    s.data.color = cor
    s.data.angle = math.radians(3)
    for att, val in (('shadow_cascade_max_distance', 800.0), ('shadow_cascade_count', 4)):
        if hasattr(s.data, att):
            setattr(s.data, att, val)
    return s


def camera_isometrica(sc):
    bpy.ops.object.camera_add()
    cam = bpy.context.object
    cam.data.type = 'ORTHO'
    cam.data.clip_start = 1.0
    cam.data.clip_end = 5000.0
    sc.camera = cam
    alvo = Vector((0, 0, 0))
    el = math.radians(ELEV)
    cam.location = alvo + Vector((0, -math.cos(el) * 1000.0, math.sin(el) * 1000.0))  # sul, olhando para o norte
    cam.rotation_euler = (alvo - cam.location).to_track_quat('-Z', 'Y').to_euler()
    return cam


def enquadrar(cam):
    """Amostra a ilha acima do mar, ajusta a escala ortográfica e centraliza deslocando a câmera no próprio plano."""
    pts = []
    n = 75  # passo de 2 m em [-150, 150]
    for i in range(-n, n + 1):
        for j in range(-n, n + 1):
            x, y = i * 2.0, j * 2.0
            h = altura(x, y)
            if h > -0.3:
                pts.append(Vector((x, y, max(h, 0.0))))
    bpy.context.view_layer.update()
    M = cam.matrix_world.copy()
    Mi = M.inverted()
    loc = [Mi @ p for p in pts]
    minx, maxx = min(v.x for v in loc), max(v.x for v in loc)
    miny, maxy = min(v.y for v in loc), max(v.y for v in loc)
    cam.data.ortho_scale = max(maxx - minx, (maxy - miny) * W / H) * (1 + 2 * MARGEM)
    cam.location = cam.location + M.to_3x3() @ Vector(((minx + maxx) / 2, (miny + maxy) / 2, 0))
    bpy.context.view_layer.update()
    return pts


def tela(sc, cam, x, y, z):
    """(px, py) com origem no canto superior esquerdo."""
    v = world_to_camera_view(sc, cam, Vector((x, y, z)))
    return v.x * W, (1 - v.y) * H


def px_por_m(sc, cam, x, y):
    z = altura(x, y)
    p0 = tela(sc, cam, x, y, z)
    px = tela(sc, cam, x + 1, y, z)
    py = tela(sc, cam, x, y + 1, z)
    return round((math.dist(px, p0) + math.dist(py, p0)) / 2, 2)


def obstaculos():
    """Árvores, pedras, ruínas e suprimentos (posições no chão) para os pontos evitarem."""
    obs = []
    for o in bpy.context.scene.objects:
        if o.type != 'MESH' or any(c.name == 'modelos' for c in o.users_collection):
            continue
        if o.name.startswith(('Ilha', 'Mar', 'Cornucopia')):
            continue
        p = o.matrix_world.translation
        obs.append((p.x, p.y))
    kd = kdtree.KDTree(len(obs))
    for i, (x, y) in enumerate(obs):
        kd.insert((x, y, 0.0), i)
    kd.balance()
    return kd, len(obs)


def pontos_da_zona(z, kd):
    """8 pontos em terreno acima da água, dentro do raio, bem espalhados (farthest point) e longe de objetos."""
    cx, cy = z['c']
    r = z['r'] * 0.85
    cands = []
    n = int(r)
    for i in range(-n, n + 1):
        for j in range(-n, n + 1):
            x, y = cx + i, cy + j
            if math.hypot(x - cx, y - cy) > r or altura(x, y) < 0.9:
                continue
            if z['id'] == 'cornucopia' and math.hypot(x, y) < 8:
                continue  # a Cornucópia (12 m) ocupa o centro
            cands.append((x, y))
    usada = None
    for folga in (2.5, 1.5, 0.8):  # relaxa a folga só se faltarem candidatos
        ok = [p for p in cands if kd.find((p[0], p[1], 0.0))[2] >= folga]
        if len(ok) >= PONTOS_POR_ZONA:
            usada = folga
            break
    if usada is None:
        raise RuntimeError(f'zona {z["id"]}: poucos pontos em terreno ({len(cands)})')
    escolhidos = [min(ok, key=lambda p: math.hypot(p[0] - cx, p[1] - cy))]
    while len(escolhidos) < PONTOS_POR_ZONA:
        escolhidos.append(max(ok, key=lambda q: min(math.hypot(q[0] - e[0], q[1] - e[1]) for e in escolhidos)))
    return escolhidos, usada


def calcular_coordenadas(sc, cam):
    kd, n_obs = obstaculos()
    zonas = {}
    for z in ZONAS:
        cx, cy = z['c']
        pontos, folga = pontos_da_zona(z, kd)
        zonas[z['id']] = {
            'nome': z['nome'],
            'centro': [round(v, 1) for v in tela(sc, cam, cx, cy, altura(cx, cy))],
            'pontos': [[round(v, 1) for v in tela(sc, cam, x, y, altura(x, y))] for x, y in pontos],
            'px_por_m': px_por_m(sc, cam, cx, cy),
        }
        print(f"zona {z['id']:12s} altura_centro={altura(cx, cy):6.2f} folga={folga} "
              f"centro={zonas[z['id']]['centro']} px/m={zonas[z['id']]['px_por_m']}")
    plats = json.load(open(os.path.join(DADOS, 'plataformas.json')))
    plataformas = [[round(v, 1) for v in tela(sc, cam, p['x'], p['y'], p['z'])]
                   for p in sorted(plats, key=lambda p: p['i'])]
    print(f'objetos evitados: {n_obs}')
    return zonas, plataformas


def noite(sc, sol):
    mundo = bpy.data.worlds.new('noite')
    mundo.use_nodes = True
    bg = mundo.node_tree.nodes['Background']
    bg.inputs[0].default_value = (0.004, 0.007, 0.018, 1.0)
    bg.inputs[1].default_value = 1.0
    sc.world = mundo
    sol.data.energy = 0.35
    sol.data.color = (0.55, 0.68, 1.0)


def render(sc, nome):
    sc.render.filepath = os.path.join(SAIDA, nome)
    bpy.ops.render.render(write_still=True)
    print('RENDER', nome, flush=True)


if __name__ == '__main__':
    sc = preparar()
    sol = luz_sol(ELEV, SOL_ROT, 4.5, (1, 0.97, 0.9))
    cam = camera_isometrica(sc)
    pts = enquadrar(cam)
    xs = [tela(sc, cam, p.x, p.y, p.z)[0] for p in pts]
    ys = [tela(sc, cam, p.x, p.y, p.z)[1] for p in pts]
    print(f'ilha na tela: x {min(xs):.0f}..{max(xs):.0f}, y {min(ys):.0f}..{max(ys):.0f} (de {W}x{H})')
    zonas, plataformas = calcular_coordenadas(sc, cam)
    os.makedirs(SAIDA, exist_ok=True)
    with open(os.path.join(SAIDA, 'mapa.json'), 'w') as f:
        json.dump({'largura': W, 'altura': H, 'zonas': zonas, 'plataformas': plataformas}, f,
                  ensure_ascii=False, indent=1)
    render(sc, 'mapa.png')
    noite(sc, sol)
    render(sc, 'mapa_noite.png')
    print('OK')
