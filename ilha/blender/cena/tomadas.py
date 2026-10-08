"""Tomadas 3D da ilha (depois do naufrágio), renderizadas em PNG por quadro (24 fps, retomável).

  praia        amanhecer na Praia do Naufrágio: destroços, botes, tributos caídos na areia; câmera sobe e revela a ilha
  plataformas  os 12 tributos em pé nas plataformas em volta da Cornucópia; câmera orbita (apresentação)
  aerea        sobrevoo da ilha inteira (para explicar o mapa)

Uso: xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P ilha/blender/cena/tomadas.py -- <tomada> render <pasta> [ini fim]
     ... -- <tomada> teste [quadros...]
"""
import bpy, json, math, os, random, sys
import mathutils

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.append(AQUI)
sys.path.append(os.path.join(AQUI, '..', 'assets'))
from montar_ilha import montar_ilha, R_PLAT  # noqa: E402
from terreno import altura, ZONAS  # noqa: E402
from mar import ceu_dia  # noqa: E402
import personagens as P  # noqa: E402
import navio as NV  # noqa: E402

DADOS = os.path.join(AQUI, '..', '..', 'dados')
# ordem dos tributos nas plataformas (alterna distritos, como no jogo)
TRIBUTOS = [
    ('opus', 'anthropic', '#E8743B'), ('ds1', 'deepseek', '#4FC3F7'), ('qwen1', 'alibaba', '#4DB6AC'),
    ('sonnet', 'anthropic', '#F2B134'), ('ds2', 'deepseek', '#81C784'), ('qwen2', 'alibaba', '#FF8A65'),
    ('haiku1', 'anthropic', '#E05A6D'), ('ds3', 'deepseek', '#FFD54F'), ('qwen3', 'alibaba', '#9575CD'),
    ('haiku2', 'anthropic', '#B07CE8'), ('ds4', 'deepseek', '#F06292'), ('qwen4', 'alibaba', '#AED581'),
]


def rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def camera(loc, alvo, lente=35):
    bpy.ops.object.camera_add(location=loc)
    c = bpy.context.object
    c.data.lens = lente
    c.data.clip_end = 3000
    c.rotation_euler = (mathutils.Vector(alvo) - mathutils.Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = c
    return c


def mirar(c, alvo):
    c.rotation_euler = (mathutils.Vector(alvo) - c.location).to_track_quat('-Z', 'Y').to_euler()


def luz_sol(elev=35, rot=35, energia=4.5, cor=(1, 0.97, 0.9)):
    bpy.ops.object.light_add(type='SUN')
    s = bpy.context.object
    s.rotation_euler = (math.radians(90 - elev), 0, math.radians(rot))
    s.data.energy = energia
    s.data.color = cor
    s.data.angle = math.radians(3)
    return s


def base(densidade=0.8, sol_elev=35):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.fps = 24
    montar_ilha(densidade=densidade)
    ceu_dia(sol_elev=sol_elev)
    sc.render.engine = 'BLENDER_EEVEE_NEXT'
    sc.eevee.taa_render_samples = 12
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Punchy'
    sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
    return sc


def tomada_praia():
    sc = base(sol_elev=8)  # amanhecer
    luz_sol(elev=8, rot=110, energia=3.5, cor=(1.0, 0.78, 0.55))
    rnd = random.Random(3)
    cx, cy = 0, -100
    # destroços na areia e na água rasa
    for i in range(10):
        x, y = cx + rnd.uniform(-25, 25), cy + rnd.uniform(-12, 6)
        o = NV.criar_boia_salva_vidas(f'boia{i}', seed=i) if i % 3 == 0 else NV.criar_bote(f'bote{i}', seed=i)
        o.location = (x, y, max(0.0, altura(x, y)))
        o.rotation_euler = (rnd.uniform(-0.3, 0.3), rnd.uniform(-0.2, 0.2), rnd.uniform(0, 6.28))
        if i % 3 != 0 and i > 3:
            o.hide_render = True
    # tributos caídos (acordando): 12 espalhados na areia
    for i, (tid, emp, cor) in enumerate(TRIBUTOS):
        x, y = cx + (i - 5.5) * 3.6 + rnd.uniform(-1, 1), cy + rnd.uniform(-6, 4)
        pose = 'dormindo' if i % 4 else 'sentado'
        if i == 0:
            pose = 'parado'  # o Opus já está de pé olhando a ilha
        o = P.criar_tributo(f'T_{tid}', emp, rgb(cor), pose=pose, seed=i + 3)
        o.location = (x, y, altura(x, y))
        o.rotation_euler = (0, 0, rnd.uniform(-0.6, 0.6) + (math.pi if pose == 'parado' else 0))
    c = camera((cx + 6, cy - 22, 2.2), (cx, cy + 4, 1.0), 30)
    # câmera: rente à areia → sobe e revela a ilha com a montanha ao fundo
    c.keyframe_insert('location', frame=1)
    c.keyframe_insert('rotation_euler', frame=1)
    c.location = (cx + 10, cy - 40, 38)
    mirar(c, (0, 20, 8))
    c.keyframe_insert('location', frame=168)
    c.keyframe_insert('rotation_euler', frame=168)
    sc.frame_start, sc.frame_end = 1, 168
    return sc


def tomada_plataformas():
    sc = base(sol_elev=40)
    luz_sol(elev=40, rot=30)
    plats = json.load(open(os.path.join(DADOS, 'plataformas.json')))
    for p, (tid, emp, cor) in zip(plats, TRIBUTOS):
        o = P.criar_tributo(f'T_{tid}', emp, rgb(cor), pose='parado', seed=p['i'] + 3)
        o.location = (p['x'], p['y'], p['z'])
        o.rotation_euler = (0, 0, math.atan2(-p['y'], -p['x']) + math.pi / 2)  # olhando a Cornucópia
    c = camera((0, -42, 9), (0, 0, 2), 28)
    n = 240
    for q in range(1, n + 1, 12):
        a = -math.pi / 2 + (q / n) * math.radians(150)
        r = 40 - 8 * (q / n)
        c.location = (math.cos(a) * r, math.sin(a) * r, 9 - 3 * (q / n))
        mirar(c, (0, 0, 2.5))
        c.keyframe_insert('location', frame=q)
        c.keyframe_insert('rotation_euler', frame=q)
    sc.frame_start, sc.frame_end = 1, n
    return sc


def tomada_aerea():
    sc = base(sol_elev=45)
    luz_sol(elev=45, rot=35)
    c = camera((230, -260, 190), (0, 0, 0), 32)
    n = 192
    for q in range(1, n + 1, 8):
        a = math.radians(-50) + (q / n) * math.radians(70)
        c.location = (math.cos(a) * 330, math.sin(a) * 330, 190 - 40 * (q / n))
        mirar(c, (0, 10, 0))
        c.keyframe_insert('location', frame=q)
        c.keyframe_insert('rotation_euler', frame=q)
    sc.frame_start, sc.frame_end = 1, n
    return sc


TOMADAS = {'praia': tomada_praia, 'plataformas': tomada_plataformas, 'aerea': tomada_aerea}

if __name__ == '__main__':
    args = sys.argv[sys.argv.index('--') + 1:]
    nome, modo = args[0], args[1]
    sc = TOMADAS[nome]()
    if modo == 'teste':
        S = '/tmp/claude-0/-home-user-B-ias-magras-/1ec1e0ad-a38d-55a9-9e93-6eda9da8f7bf/scratchpad/'
        sc.render.resolution_percentage = 50
        for q in [int(x) for x in (args[2:] or [str(sc.frame_start), str(sc.frame_end)])]:
            sc.frame_set(q)
            sc.render.filepath = S + f'tm_{nome}_{q:03d}.png'
            bpy.ops.render.render(write_still=True)
            print('QUADRO', q)
    else:
        pasta = args[2]
        ini = int(args[3]) if len(args) > 3 else sc.frame_start
        fim = int(args[4]) if len(args) > 4 else sc.frame_end
        os.makedirs(pasta, exist_ok=True)
        for q in range(ini, fim + 1):
            alvo = os.path.join(pasta, f'{q:04d}.png')
            if os.path.exists(alvo):
                continue
            sc.frame_set(q)
            sc.render.filepath = alvo
            bpy.ops.render.render(write_still=True)
            print('QUADRO', q, flush=True)
