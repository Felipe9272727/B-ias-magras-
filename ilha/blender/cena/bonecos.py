"""Bonecos 3D pré-renderizados dos 12 tributos, para o Remotion montar a gameplay em cima dos cenários (placas).

Para cada tributo, animação e uma das 8 direções (0 = de frente para a câmera, 90 = virado para a direita da tela,
180 = de costas, 270 = para a esquerda) renderiza os quadros com fundo transparente e junta numa tira PNG:
  video/remotion/public/ilha/bonecos/<id>/<anim>_<dir>.png
Câmera ortográfica um pouco de cima (10°), mesma luz de dia em todos; os pés ficam sempre no mesmo ponto do quadro.
bonecos.json (na mesma pasta) diz tamanho do quadro, ponto dos pés, pixels por metro e as animações (quadros, duração, laço).
As poses são as mesmas do diretor 3D (gameplay.py), então o boneco anda/fala/morre igual às tomadas em 3D.

Uso: xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P ilha/blender/cena/bonecos.py -- [ids,separados] [--teste]
"""
import bpy, json, math, os, sys
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.append(AQUI)
sys.path.append(os.path.join(AQUI, '..', 'assets'))
import gameplay as G  # noqa: E402  (poses, cores, ordem das sementes)
import personagens as P  # noqa: E402
from mar import ceu_dia  # noqa: E402

RAIZ = os.path.normpath(os.path.join(AQUI, '..', '..'))
SAIDA = os.path.normpath(os.path.join(RAIZ, '..', 'video', 'remotion', 'public', 'ilha', 'bonecos'))
QW, QH = 1280, 1032         # quadro em px (2x: aguenta close)
LARG = 3.6                 # metros na largura do quadro (ortográfica)
INCL = 10                  # graus de inclinação da câmera
DIRS = [0, 45, 90, 135, 180]  # 225, 270 e 315 = espelho de 135, 90 e 45 (feito no Remotion)


def falar_ciclo(t):
    """Gesticular falando, com período de 2 s (fecha o laço)."""
    a = G.pose_parado(t * 0.5 / 0.27, 0)
    w = math.sin(2 * math.pi * t)
    w2 = math.sin(math.pi * t)
    a['braco_d'] = (-50 - 18 * w, 6, -12)
    a['antebraco_d'] = (-75 - 15 * w2, 0, -10)
    a['braco_e'] = (-6 - 14 * (0.5 + 0.5 * w2), 0, 8)
    a['antebraco_e'] = (-47, 0, 10)
    a['cabeca'] = (4 * math.sin(4 * math.pi * t), 0, 0)
    a['tronco'] = (5, 0, 5 * w2)
    return a


def cair(t):
    """Cambaleia e cai de costas (0,75 s). Devolve (pose, deitar 0..1, quique)."""
    a = G.pose_parado(t, 0, ferido=True)
    d = G.suave(t / 0.45)
    a = {k: tuple(v * (1 - d) for v in val) for k, val in a.items()}
    q = 0.06 * math.sin(min(1.0, max(0.0, (t - 0.45) / 0.3)) * math.pi)
    return a, d, q


# nome: (quadros, duração em s, laço?, função t -> (pose, extras))
def _p(f):
    return lambda t: (f(t), {})


ANIMS = {
    'parado': (6, 1 / 0.27, True, _p(lambda t: G.pose_parado(t, 0))),
    'ferido': (6, 1 / 0.27, True, _p(lambda t: G.pose_parado(t, 0, ferido=True))),
    'andar': (10, 1 / 0.95, True, _p(lambda t: G.pose_andar(t, 0))),
    'correr': (8, 1 / 1.55, True, _p(lambda t: G.pose_andar(t, 0, corre=True))),
    'falar': (12, 2.0, True, _p(falar_ciclo)),
    'beber': (8, 1 / 0.7, True, _p(lambda t: G.pose_agachar(t, 0, 'beber'))),
    'coletar': (8, 1 / 0.7, True, _p(lambda t: G.pose_agachar(t, 0, 'coletar'))),
    'comer': (8, 1 / 0.65, True, _p(lambda t: G.pose_comer(t, 0))),
    'sentar': (4, 4.0, True, _p(lambda t: G.pose_sentar(t, 0))),
    'dormir': (4, 5.0, True, lambda t: (G.pose_dormir(t, 0), {'lado': 1})),
    'atingido': (6, 0.9, False, lambda t: (lambda r: (r[0], {'avanco': r[1]}))(G.pose_atingido(G.pose_parado(t, 0), t, 0.0))),
    'cair': (8, 0.75, False, lambda t: (lambda r: (r[0], {'deitar': r[1], 'quique': r[2]}))(cair(t))),
    'morto': (1, 0.1, False, lambda t: ({}, {'deitar': 1.0})),
}
for arma in ('machado', 'lanca', 'faca', 'maos', 'arco'):  # ataque com cada arma (golpe aos 0,6 s)
    ANIMS[f'atacar_{arma}'] = (12, 1.6, False,
                               (lambda arma: lambda t: (lambda r: (r[0], {'avanco': r[1], 'arma': arma}))(
                                   G.pose_atacar(t, 0.6, None if arma == 'maos' else arma)))(arma))


def armas_usadas():
    out = {}
    for log in G.LOGS.values():
        for t in json.load(open(log))['turnos']:
            for e in t.get('eventos', []):
                if e['tipo'] in ('ataque', 'revide'):
                    arma = {'mãos': 'maos'}.get(e.get('arma'), e.get('arma'))
                    if arma in ('machado', 'lanca', 'faca', 'maos', 'arco'):
                        out.setdefault(e['id'], set()).add(arma)
    return out


def montar():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    ceu_dia(sol_elev=42)
    sc.render.engine = 'BLENDER_EEVEE_NEXT'
    sc.eevee.taa_render_samples = 1
    sc.eevee.use_shadows = False  # a sombra no chão é feita no Remotion
    sc.render.film_transparent = True
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Punchy'
    sc.render.resolution_x, sc.render.resolution_y = QW, QH
    sc.render.resolution_percentage = 100
    sc.render.image_settings.color_mode = 'RGBA'
    bpy.ops.object.light_add(type='SUN')
    s = bpy.context.object
    s.rotation_euler = (math.radians(90 - 42), 0, math.radians(35))
    s.data.energy = 4.5
    s.data.angle = math.radians(3)
    bpy.ops.object.camera_add()
    cam = bpy.context.object
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = LARG
    alvo = Vector((0, 0, 1.05))
    cam.location = alvo + Vector((0, -12 * math.cos(math.radians(INCL)), 12 * math.sin(math.radians(INCL))))
    cam.rotation_euler = (alvo - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = cam
    bpy.ops.object.light_add(type='AREA')
    f = bpy.context.object
    f.data.size = 6
    f.data.energy = 140
    f.data.use_shadow = False
    f.data.specular_factor = 0
    f.parent = cam
    f.location = (0, 1.5, 0.5)
    return sc, cam


def pe_na_tela(sc, cam):
    from bpy_extras.object_utils import world_to_camera_view
    v = world_to_camera_view(sc, cam, Vector((0, 0, 0)))
    return [round(v.x, 4), round(1 - v.y, 4)]


QUADROS = os.path.join(RAIZ, 'render', 'bonecos')  # quadros soltos; ilha/blender/tiras.py junta em tiras


def renderizar(ids, teste=False):
    sc, cam = montar()
    meta = dict(quadro=[QW, QH], pe=pe_na_tela(sc, cam), ppm=round(QW / LARG, 3), incl=INCL, dirs=DIRS,
                anims={k: dict(n=v[0], dur=round(v[1], 4), laco=v[2]) for k, v in ANIMS.items()})
    os.makedirs(SAIDA, exist_ok=True)
    with open(os.path.join(SAIDA, 'bonecos.json'), 'w') as fj:
        json.dump(meta, fj)
    tributos = json.load(open(G.LOGS['oficial']))['meta']['tributos']
    if ids:  # na ordem pedida
        tributos = sorted([t for t in tributos if t['id'] in ids], key=lambda t: ids.index(t['id']))
    for t in tributos:
        raiz, partes, itens = P.criar_tributo_articulado(f"B_{t['id']}", G.EMPRESA[t['distrito']], G.rgb(t['cor']),
                                                          seed=G.ORDEM_PLAT.index(t['id']) + 3)
        pasta = os.path.join(SAIDA, t['id'])
        os.makedirs(pasta, exist_ok=True)
        usadas = armas_usadas().get(t['id'], set()) | {'maos'}
        anims = {k: v for k, v in ANIMS.items() if not k.startswith('atacar_') or k[8:] in usadas}
        anims = anims if not teste else {k: ANIMS[k] for k in ('andar', 'falar', 'atacar_lanca', 'cair')}
        for nome, (n, dur, laco, fn) in anims.items():
            dirs = DIRS if not teste else [0, 90, 135]
            for d in dirs:
                tira = os.path.join(pasta, f'{nome}_{d}.png')
                if os.path.exists(tira) and not teste:
                    continue
                qdir = os.path.join(QUADROS, t['id'], f'{nome}_{d}')
                os.makedirs(qdir, exist_ok=True)
                for i in range(n):
                    arq = os.path.join(qdir, f'{i:02d}.png')
                    if os.path.exists(arq) and not teste:
                        continue
                    tt = (i / n) * dur if laco else (i / max(1, n - 1)) * dur
                    a, ex = fn(tt)
                    arma = ex.get('arma')
                    for nm, ob in itens.items():
                        ob.hide_render = (nm != arma)
                    th = math.radians(d)
                    frente = Vector((math.sin(th), -math.cos(th), 0))
                    ext = max(G.extensao(a.get('perna_e', (0,))[0], a.get('canela_e', (0,))[0]),
                              G.extensao(a.get('perna_d', (0,))[0], a.get('canela_d', (0,))[0]))
                    baixar = 0.78 - min(0.78, ext)
                    pos = frente * ex.get('avanco', 0.0)
                    deitar = ex.get('deitar', 0.0)
                    if ex.get('lado'):
                        raiz.rotation_euler = (0, math.radians(90), th)
                        z = 0.24
                    elif deitar:
                        raiz.rotation_euler = (math.radians(-88 * deitar), 0, th)
                        z = 0.13 * deitar + ex.get('quique', 0.0) - baixar * (1 - deitar)
                    else:
                        raiz.rotation_euler = (0, 0, th)
                        z = -baixar
                    raiz.location = (pos.x, pos.y, z)
                    for nm, ob in partes.items():
                        rx, ry, rz = a.get(nm, (0, 0, 0))
                        ob.rotation_euler = (math.radians(rx), math.radians(ry), math.radians(rz))
                    bpy.context.view_layer.update()
                    sc.render.filepath = arq
                    bpy.ops.render.render(write_still=True)
                print('TIRA', t['id'], nome, d, flush=True)
        for ob in [raiz] + list(partes.values()) + list(itens.values()):
            bpy.data.objects.remove(ob, do_unlink=True)


if __name__ == '__main__':
    args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    teste = '--teste' in args
    args = [a for a in args if a != '--teste']
    ids = args[0].split(',') if args and args[0] else None
    renderizar(ids, teste)
    print('FIM')
