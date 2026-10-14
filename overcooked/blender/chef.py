"""Chefs 3D do Overcooked das IAs (design próprio, no espírito do jogo): corpo gordinho na cor da empresa, avental,
bigode, chapéu de chef, mãos e pés flutuando. Renderiza tiras de sprites com fundo transparente para o Remotion
(técnica do Donkey Kong Country: 3D pré-renderizado usado como 2D).

Câmera ortográfica inclinada (mesma das peças do cenário), 1 m = PX pixels. Direções: 0 = de frente para a câmera,
90 = virado para a direita da tela, 180 = de costas (270 = espelho de 90, feito no Remotion).
Saída: video/remotion/public/overcooked/chefs/<empresa>/<anim>_<dir>.png  + chefs.json (quadro, pés, animações)

Uso: xvfb-run -a blender -b -P overcooked/blender/chef.py -- [empresas,separadas] [--teste]
"""
import bpy, json, math, os, sys
from mathutils import Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.append(AQUI)
import comum as C  # noqa: E402

SAIDA = os.path.join(C.PUBLIC, 'chefs')
QW, QH = 1.6, 2.0  # metros do quadro (largura, altura na tela)
EMPRESAS = {'DeepSeek': (0.25, 0.38, 0.98), 'Claude': (0.88, 0.45, 0.24), 'GPT': (0.05, 0.62, 0.46), 'Gemini': (0.55, 0.32, 0.95)}
DIRS = [0, 90, 180]
PX_CHEF = 140  # o chef aparece com ~200 px de altura na cozinha

# nome: (quadros, duração s, laço)
ANIMS = {'parado': (6, 1.2, True), 'andar': (6, 0.5, True), 'carregar': (6, 1.2, True), 'carregar_andar': (6, 0.5, True),
         'picar': (6, 0.45, True), 'panico': (6, 0.5, True)}
# um chef só, com o corpo branco: a cor de cada empresa é pintada no Remotion (multiplicando pela máscara do corpo)
BRANCO = (0.93, 0.93, 0.93)


def chef(cor):
    """Monta o chef; devolve (raiz, partes) — partes são objetos animados: corpo, maoE, maoD, peE, peD, faca."""
    raiz = bpy.data.objects.new('chef', None)
    bpy.context.collection.objects.link(raiz)
    m_cor = C.mat('corpo', cor, rough=0.45)
    m_bra = C.mat('branco', (0.97, 0.96, 0.93), rough=0.6)
    m_pre = C.mat('preto', (0.04, 0.03, 0.03), rough=0.3)
    m_bigode = C.mat('bigode', (0.20, 0.11, 0.05), rough=0.7)
    m_boch = C.mat('bochecha', (1.0, 0.45, 0.45), rough=0.6)
    m_pe = C.mat('pe', (0.12, 0.1, 0.1), rough=0.5)
    m_faca = C.mat('faca', (0.8, 0.82, 0.86), rough=0.2, metal=0.8)
    corpo = bpy.data.objects.new('corpo', None); bpy.context.collection.objects.link(corpo); corpo.parent = raiz
    # corpo: feijão gordinho
    b = C.esfera('barriga', (0, 0, 0.42), (0.36, 0.33, 0.40), m_cor, corpo)
    C.esfera('cabeca', (0, 0, 0.86), (0.31, 0.29, 0.28), m_cor, corpo)
    # avental
    C.esfera('avental', (0, -0.235, 0.36), (0.27, 0.12, 0.27), m_bra, corpo)
    C.cubo('alca', (0, -0.29, 0.62), (0.16, 0.02, 0.05), m_bra, corpo)
    # rosto (frente = -Y)
    for sx in (-1, 1):
        C.esfera('olho', (0.11 * sx, -0.255, 0.92), (0.055, 0.03, 0.075), m_pre, corpo)
        C.esfera('brilho', (0.11 * sx - 0.015, -0.285, 0.945), (0.018, 0.01, 0.02), m_bra, corpo)
        C.esfera('bochecha', (0.19 * sx, -0.225, 0.82), (0.05, 0.02, 0.035), m_boch, corpo)
        C.esfera('bigode', (0.065 * sx, -0.275, 0.80), (0.085, 0.04, 0.035), m_bigode, corpo, rot=(0, 0.35 * sx, 0))
    # chapéu
    C.cilindro('faixa', (0, 0, 1.10), 0.21, 0.14, m_bra, corpo)
    for (x, y, z, r) in ((0, 0, 1.30, 0.20), (-0.15, 0.02, 1.25, 0.15), (0.15, 0.02, 1.25, 0.15), (0, 0.12, 1.24, 0.15), (0, -0.1, 1.24, 0.14)):
        C.esfera('puf', (x, y, z), (r, r, r * 0.9), m_bra, corpo)
    maoE = C.esfera('maoE', (-0.48, -0.05, 0.45), (0.11, 0.11, 0.11), m_bra, raiz)
    maoD = C.esfera('maoD', (0.48, -0.05, 0.45), (0.11, 0.11, 0.11), m_bra, raiz)
    peE = C.esfera('peE', (-0.15, -0.05, 0.05), (0.12, 0.16, 0.07), m_pe, raiz)
    peD = C.esfera('peD', (0.15, -0.05, 0.05), (0.12, 0.16, 0.07), m_pe, raiz)
    faca = bpy.data.objects.new('faca', None); bpy.context.collection.objects.link(faca); faca.parent = maoD
    C.cubo('lamina', (0.0, -0.16, 0.0), (0.025, 0.16, 0.06), m_faca, faca)
    C.cubo('cabo', (0.0, 0.02, 0.0), (0.03, 0.06, 0.035), m_pe, faca)
    return raiz, dict(corpo=corpo, maoE=maoE, maoD=maoD, peE=peE, peD=peD, faca=faca)


def pose(p, anim, u):
    """u: 0..1 dentro do ciclo. Posiciona as partes (relativas à raiz)."""
    s = math.sin(2 * math.pi * u)
    c = math.cos(2 * math.pi * u)
    ab = abs(math.sin(math.pi * u * 2))
    corpo, mE, mD, pE, pD, faca = (p[k] for k in ('corpo', 'maoE', 'maoD', 'peE', 'peD', 'faca'))
    corpo.location = (0, 0, 0); corpo.rotation_euler = (0, 0, 0); corpo.scale = (1, 1, 1)
    mE.location = (-0.48, -0.05, 0.45); mD.location = (0.48, -0.05, 0.45)
    pE.location = (-0.15, -0.05, 0.05); pD.location = (0.15, -0.05, 0.05)
    faca.hide_render = True
    carrega = anim.startswith('carregar')
    if anim in ('parado', 'carregar'):
        corpo.location.z = 0.02 * s
        corpo.scale = (1 + 0.015 * s, 1 + 0.015 * s, 1 - 0.02 * s)
        mE.location.z += 0.03 * s; mD.location.z += 0.03 * s
    if anim in ('andar', 'carregar_andar'):
        corpo.location.z = 0.07 * ab
        corpo.rotation_euler = (-0.12, 0, 0.06 * s)
        pE.location = (-0.15, -0.05 + 0.16 * s, 0.05 + 0.06 * max(0, s))
        pD.location = (0.15, -0.05 - 0.16 * s, 0.05 + 0.06 * max(0, -s))
        mE.location.y += -0.12 * s; mD.location.y += 0.12 * s
    if carrega:
        mE.location = (-0.22, -0.42, 0.62 + corpo.location.z); mD.location = (0.22, -0.42, 0.62 + corpo.location.z)
    if anim == 'picar':
        faca.hide_render = False
        mD.location = (0.18, -0.48, 0.55 + 0.22 * max(0, s)); mE.location = (-0.2, -0.45, 0.38)
        corpo.rotation_euler = (-0.15, 0, 0); corpo.location.z = -0.02 * ab
    if anim == 'lavar':
        mE.location = (-0.15 + 0.1 * s, -0.48, 0.4 + 0.04 * c); mD.location = (0.15 - 0.1 * s, -0.48, 0.4 - 0.04 * c)
        corpo.rotation_euler = (-0.2, 0, 0.05 * s)
    if anim == 'panico':
        corpo.location.x = 0.04 * s; corpo.location.z = 0.05 * ab
        corpo.rotation_euler = (0, 0.1 * s, 0)
        mE.location = (-0.42 + 0.08 * s, -0.1, 1.1 + 0.12 * c); mD.location = (0.42 - 0.08 * s, -0.1, 1.1 - 0.12 * c)
    if anim == 'comemorar':
        pulo = math.sin(math.pi * u)
        corpo.location.z = 0.35 * pulo
        corpo.scale = (1 - 0.06 * pulo, 1 - 0.06 * pulo, 1 + 0.1 * pulo)
        for m, sx in ((mE, -1), (mD, 1)):
            m.location = (0.4 * sx, -0.05, 1.15 + 0.35 * pulo)
        pE.location.z += 0.3 * pulo; pD.location.z += 0.3 * pulo


def renderizar(dirs, teste=False):
    C.limpar()
    sc = C.cena_sprite(QW, QH, teste, alvo=(0, 0, 0.62), px_m=PX_CHEF, amostras=6)
    cam = sc.camera
    os.makedirs(SAIDA, exist_ok=True)
    meta = {'quadro': [sc.render.resolution_x, sc.render.resolution_y], 'px_m': PX_CHEF * (0.5 if teste else 1), 'anims': {}, 'dirs': DIRS}
    meta['pes'] = C.ponto_na_tela(sc, cam, (0, 0, 0))
    for nome, (n, dur, laco) in ANIMS.items():
        meta['anims'][nome] = {'n': n, 'dur': dur, 'laco': laco}
    raiz, partes = chef(BRANCO)
    corpo_objs = [o for o in bpy.data.objects if o.name.split('.')[0] in ('barriga', 'cabeca')]
    outros = [o for o in bpy.data.objects if o.type == 'MESH' and o not in corpo_objs]
    m_mask = C.mat('mascara', (1, 1, 1), rough=1, emit=1.0)
    m_hold = bpy.data.materials.new('holdout'); m_hold.use_nodes = True
    nt = m_hold.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); hold = nt.nodes.new('ShaderNodeHoldout')
    nt.links.new(hold.outputs[0], out.inputs['Surface'])
    originais = {o.name: list(o.data.materials) for o in bpy.data.objects if o.type == 'MESH'}

    def modo_mascara(lig):
        for o in bpy.data.objects:
            if o.type != 'MESH':
                continue
            o.data.materials.clear()
            if not lig:
                for m in originais[o.name]:
                    o.data.materials.append(m)
            else:
                o.data.materials.append(m_mask if o in corpo_objs else m_hold)

    for anim, (n, dur, laco) in ANIMS.items():
        for d in dirs:
            raiz.rotation_euler = (0, 0, math.radians(d))
            for camada in ('base', 'mascara'):
                modo_mascara(camada == 'mascara')
                quadros = []
                for q in range(n):
                    pose(partes, anim, q / n)
                    f = os.path.join(C.TMP, f'{camada}_{anim}_{d}_{q:02d}.png')
                    sc.render.filepath = f
                    bpy.ops.render.render(write_still=True)
                    quadros.append(f)
                C.juntar_tira(quadros, os.path.join(SAIDA, camada, f'{anim}_{d}.png'))
            print('tira', anim, d, flush=True)
    with open(os.path.join(SAIDA, 'chefs.json'), 'w') as fh:
        json.dump(meta, fh)


if __name__ == '__main__':
    args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    teste = '--teste' in args
    ds = [a for a in args if not a.startswith('--')]
    renderizar([int(x) for x in ds[0].split(',')] if ds else DIRS, teste)
