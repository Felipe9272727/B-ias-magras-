"""Itens do 60 Segundos das IAs em 3D (desenho próprio), um sprite por item, com a mesma câmera da casa.
Saída: video/remotion/public/sessenta/itens/<id>.png + itens.json (tamanho e ponto de apoio de cada um).
Uso: xvfb-run -a blender -b -P sessenta/blender/itens.py -- [--teste]
"""
import bpy, json, math, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.append(AQUI)
import comum as C  # noqa: E402

TESTE = '--teste' in sys.argv
SAIDA = os.path.join(C.PUBLIC, 'itens')
PX = 220
Q = 1.2  # quadro de 1,2 m (cabe o rifle e o machado)


def m(nome, cor, **kw):
    return C.mat(nome, cor, **kw)


def sopa():
    C.cilindro('lata', (0, 0, 0.09), 0.07, 0.18, m('lata', (0.8, 0.8, 0.82), rough=0.3, metal=0.8))
    C.cilindro('rotulo', (0, 0, 0.09), 0.072, 0.11, m('rot', (0.85, 0.15, 0.12), rough=0.5))
    C.cilindro('faixa', (0, 0, 0.1), 0.073, 0.03, m('fx', (0.98, 0.95, 0.85), rough=0.5))


def agua():
    C.cilindro('garrafa', (0, 0, 0.12), 0.06, 0.24, m('vid', (0.55, 0.8, 0.95), rough=0.05, emit=0.15))
    C.cilindro('gargalo', (0, 0, 0.27), 0.025, 0.07, m('vid2', (0.55, 0.8, 0.95), rough=0.05))
    C.cilindro('tampa', (0, 0, 0.31), 0.028, 0.03, m('tp', (0.2, 0.45, 0.9)))
    C.cilindro('rot', (0, 0, 0.12), 0.062, 0.08, m('rotb', (0.95, 0.95, 0.98)))


def radio():
    C.cubo('caixa', (0, 0, 0.12), (0.17, 0.08, 0.12), m('mad', (0.6, 0.35, 0.18)), bisel=0.02)
    C.cilindro('alto', (-0.07, -0.081, 0.12), 0.06, 0.01, m('tec', (0.85, 0.78, 0.55)), rot=(math.pi / 2, 0, 0))
    C.cubo('dial', (0.08, -0.082, 0.15), (0.06, 0.005, 0.03), m('dl', (0.95, 0.9, 0.6), emit=0.5))
    C.cilindro('bot', (0.08, -0.085, 0.07), 0.018, 0.02, m('bt', (0.1, 0.1, 0.1)), rot=(math.pi / 2, 0, 0))
    C.cilindro('antena', (0.12, 0, 0.32), 0.006, 0.28, m('in', (0.8, 0.8, 0.85), metal=0.9), rot=(0, 0.3, 0))


def mapa():
    for i in range(3):
        C.cubo(f'f{i}', (-0.08 + i * 0.08, 0, 0.01 + i * 0.004), (0.04, 0.12, 0.004), m(f'pap{i}', [(0.95, 0.88, 0.65), (0.75, 0.88, 0.7), (0.95, 0.88, 0.65)][i]), rot=(0, 0.15 * (i - 1), 0))
    C.cubo('rota', (0, 0, 0.022), (0.08, 0.005, 0.002), m('rt', (0.85, 0.1, 0.1)))


def mascara():
    C.esfera('face', (0, 0, 0.12), (0.1, 0.08, 0.12), m('bor', (0.25, 0.3, 0.25), rough=0.7))
    for s in (-1, 1):
        C.cilindro(f'lente{s}', (s * 0.045, -0.07, 0.16), 0.03, 0.02, m('len', (0.6, 0.8, 0.9), rough=0.05), rot=(math.pi / 2, 0, 0))
    C.cilindro('filtro', (0, -0.09, 0.06), 0.04, 0.07, m('flt', (0.5, 0.52, 0.5), metal=0.6), rot=(math.pi / 2, 0, 0))


def kit():
    C.cubo('caixa', (0, 0, 0.08), (0.14, 0.09, 0.08), m('bra', (0.96, 0.96, 0.94)), bisel=0.02)
    C.cubo('cruz1', (0, -0.091, 0.08), (0.05, 0.003, 0.015), m('ver', (0.85, 0.1, 0.1)))
    C.cubo('cruz2', (0, -0.091, 0.08), (0.015, 0.003, 0.05), m('ver', (0.85, 0.1, 0.1)))
    C.cubo('alca', (0, 0, 0.17), (0.05, 0.01, 0.01), m('al', (0.3, 0.3, 0.3)))


def rifle():
    C.cubo('coronha', (-0.2, 0, 0.04), (0.1, 0.025, 0.04), m('mad', (0.55, 0.32, 0.15)), bisel=0.01)
    C.cubo('corpo', (0.0, 0, 0.045), (0.12, 0.02, 0.025), m('mad', (0.55, 0.32, 0.15)))
    C.cilindro('cano', (0.22, 0, 0.055), 0.012, 0.3, m('fer', (0.2, 0.2, 0.22), metal=0.8), rot=(0, math.pi / 2, 0))


def machado():
    C.cilindro('cabo', (0, 0, 0.02), 0.015, 0.45, m('mad2', (0.7, 0.48, 0.25)), rot=(0, math.pi / 2, 0))
    C.cubo('lamina', (0.2, 0, 0.05), (0.04, 0.012, 0.07), m('lam', (0.75, 0.15, 0.12), metal=0.4))
    C.cubo('fio', (0.2, 0, 0.115), (0.04, 0.01, 0.008), m('fio', (0.85, 0.85, 0.9), metal=0.9))


def lanterna():
    C.cilindro('corpo', (0, 0, 0.03), 0.025, 0.2, m('lt', (0.85, 0.7, 0.15), metal=0.5), rot=(0, math.pi / 2, 0))
    C.cilindro('cab', (0.12, 0, 0.035), 0.04, 0.05, m('lt', (0.85, 0.7, 0.15)), rot=(0, math.pi / 2, 0))
    C.cilindro('luz', (0.146, 0, 0.035), 0.033, 0.005, m('luz', (1, 1, 0.8), emit=2), rot=(0, math.pi / 2, 0))


def cadeado():
    C.cubo('corpo', (0, 0, 0.05), (0.05, 0.025, 0.05), m('lat', (0.85, 0.7, 0.25), metal=0.8), bisel=0.01)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.035, minor_radius=0.01, location=(0, 0, 0.11), rotation=(math.pi / 2, 0, 0))
    C._fim(bpy.context.active_object, m('arg', (0.8, 0.8, 0.85), metal=0.9), None)


def inseticida():
    C.cilindro('lata', (0, 0, 0.11), 0.045, 0.22, m('ins', (0.3, 0.65, 0.3), metal=0.5))
    C.cilindro('tampa', (0, 0, 0.24), 0.03, 0.04, m('tpi', (0.9, 0.9, 0.2)))
    C.cilindro('rot', (0, 0, 0.1), 0.047, 0.06, m('ri', (0.95, 0.95, 0.9)))


def mala():
    C.cubo('mala', (0, 0, 0.16), (0.2, 0.07, 0.15), m('mal', (0.55, 0.3, 0.15), rough=0.6), bisel=0.02)
    C.cubo('alca', (0, 0, 0.33), (0.05, 0.015, 0.02), m('alc', (0.3, 0.18, 0.1)))
    for s in (-1, 1):
        C.cubo(f'fecho{s}', (s * 0.1, -0.072, 0.27), (0.02, 0.004, 0.015), m('fec', (0.85, 0.75, 0.3), metal=0.8))


def baralho():
    for i in range(3):
        C.cubo(f'c{i}', (i * 0.03 - 0.03, 0, 0.005 + i * 0.004), (0.04, 0.06, 0.002), m(f'ca{i}', (0.97, 0.97, 0.97) if i < 2 else (0.85, 0.15, 0.15)), rot=(0, 0, 0.3 * (i - 1)))


def damas():
    C.cubo('tab', (0, 0, 0.01), (0.12, 0.12, 0.01), m('tb', (0.15, 0.15, 0.15)))
    for i in range(4):
        for j in range(4):
            if (i + j) % 2 == 0:
                C.cubo(f'q{i}{j}', (-0.09 + i * 0.06, -0.09 + j * 0.06, 0.021), (0.03, 0.03, 0.002), m('qv', (0.85, 0.15, 0.15)))
    for k, (x, y) in enumerate([(-0.09, -0.09), (0.03, 0.03), (-0.03, 0.09)]):
        C.cilindro(f'p{k}', (x, y, 0.03), 0.022, 0.015, m('pp', (0.95, 0.95, 0.9)))


def gaita():
    C.cubo('g', (0, 0, 0.02), (0.08, 0.02, 0.015), m('gm', (0.8, 0.8, 0.85), metal=0.9), bisel=0.005)
    for i in range(6):
        C.cubo(f'b{i}', (-0.065 + i * 0.026, -0.021, 0.02), (0.008, 0.002, 0.006), m('bur', (0.1, 0.1, 0.1)))


def manual():
    C.cubo('capa', (0, 0, 0.02), (0.08, 0.11, 0.02), m('cp', (0.2, 0.45, 0.25)), bisel=0.005)
    C.cubo('pag', (0.004, 0, 0.02), (0.077, 0.105, 0.015), m('pg', (0.97, 0.95, 0.88)))
    C.cubo('emb', (0, 0, 0.041), (0.03, 0.03, 0.002), m('em', (0.9, 0.75, 0.2)))


def municao():
    C.cubo('caixa', (0, 0, 0.04), (0.07, 0.05, 0.04), m('cx', (0.45, 0.5, 0.3)), bisel=0.005)
    for i in range(3):
        C.cilindro(f'bala{i}', (-0.03 + i * 0.03, 0, 0.1), 0.008, 0.04, m('lat', (0.85, 0.7, 0.25), metal=0.8))


ITENS = {k: v for k, v in globals().items() if k in ('sopa', 'agua', 'radio', 'mapa', 'mascara', 'kit', 'rifle', 'machado', 'lanterna', 'cadeado', 'inseticida', 'mala', 'baralho', 'damas', 'gaita', 'manual', 'municao')}


def main_glb():
    # todos os itens num arquivo só; cada um é um nó com o id (o three.js clona o que precisa), já no tamanho do jogo
    C.limpar()
    for iid, f in ITENS.items():
        antes = set(bpy.data.objects)
        f()
        pai = bpy.data.objects.new(iid, None)
        bpy.context.collection.objects.link(pai)
        pai.scale = (1.6, 1.6, 1.6)
        for o in set(bpy.data.objects) - antes - {pai}:
            if o.parent is None:
                o.parent = pai
    C.exportar_glb('itens', juntar=False)


def main():
    if '--glb' in sys.argv:
        return main_glb()
    os.makedirs(SAIDA, exist_ok=True)
    info = {'px_m': PX, 'quadro_m': Q, 'itens': {}}
    for iid, f in ITENS.items():
        C.limpar()
        f()
        # tudo um pouco maior que o real (para ler no vídeo)
        for o in bpy.data.objects:
            if o.parent is None and o.type == 'MESH':
                o.scale = [s * 1.6 for s in o.scale]
                o.location = [c * 1.6 for c in o.location]
        sc = C.cena_sprite(Q, Q, teste=TESTE, alvo=(0, 0, 0.15), px_m=PX, amostras=16)
        sc.render.filepath = os.path.join(SAIDA, f'{iid}.png')
        bpy.ops.render.render(write_still=True)
        info['itens'][iid] = {'base': C.ponto_na_tela(sc, sc.camera, (0, 0, 0)), 'w': sc.render.resolution_x, 'h': sc.render.resolution_y}
        print('OK', iid)
    json.dump(info, open(os.path.join(SAIDA, 'itens.json'), 'w'), indent=1)


main()
