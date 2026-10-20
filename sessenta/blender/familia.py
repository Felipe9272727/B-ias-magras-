"""A família do 60 Segundos das IAs em 3D (desenho próprio, cartum dos anos 50: cabeça grande, cores chapadas):
Osvaldo (pai), Celeste (mãe), Juju (filha) e Tico (filho). Renderiza tiras de sprites com fundo transparente,
com a MESMA câmera da casa (casa.py), para o Remotion colar por cima do fundo (3D pré-renderizado usado como 2D).

Direções: 0 = de frente para a câmera, 90 = virado para a direita da tela, 180 = de costas (270 = espelho do 90).
Animações: parado, correr, carregar (correndo com os braços para a frente, levando coisas), panico.
Saída: video/remotion/public/sessenta/familia/<id>/<anim>_<dir>.png + familia.json (tamanho do quadro, pés, mãos)

Uso: xvfb-run -a blender -b -P sessenta/blender/familia.py -- [ids,separados] [--teste]
"""
import bpy, json, math, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.append(AQUI)
import comum as C  # noqa: E402

TESTE = '--teste' in sys.argv
GLB = '--glb' in sys.argv  # exporta cada pessoa como modelo 3D com os pivôs nomeados (o three.js anima)
SAIDA = os.path.join(C.PUBLIC, 'familia')
PX = 220                 # px por metro (o mesmo da casa)
QW, QH = 1.3, 2.2        # quadro em metros na tela
DIRS = [0, 90, 180]
ANIMS = {'parado': (6, 1.4), 'correr': (6, 0.42), 'carregar': (6, 0.46), 'panico': (6, 0.5)}  # quadros, duração (s)
PELE = (0.98, 0.80, 0.66)

# altura total, cores e detalhes de cada um
# as cores e as roupas seguem o desenho 2D do abrigo (para a mesma família nas duas fases)
PESSOAS = {
    'pai': dict(alt=1.0, camisa=(0.96, 0.96, 0.94), calca=(0.55, 0.48, 0.36), cabelo=(0.08, 0.07, 0.07), sapato=(0.25, 0.16, 0.10),
                gravata=(0.88, 0.70, 0.18), colete=(0.50, 0.45, 0.25), gordo=True),
    'mae': dict(alt=0.94, camisa=(0.90, 0.84, 0.66), calca=None, vestido=(0.96, 0.94, 0.90), cabelo=(0.92, 0.42, 0.16), sapato=(0.85, 0.15, 0.20),
                avental=(0.85, 0.25, 0.18), longo=True, magra=True),
    'filha': dict(alt=0.82, camisa=(0.90, 0.92, 0.96), calca=None, vestido=(0.15, 0.18, 0.32), cabelo=(0.07, 0.07, 0.09), sapato=(0.40, 0.25, 0.15),
                  chanel=True, gorda=True),
    'filho': dict(alt=0.66, camisa=(0.98, 0.82, 0.25), calca=(0.40, 0.28, 0.16), cabelo=(0.92, 0.45, 0.12), sapato=(0.30, 0.22, 0.14),
                  listras=(0.25, 0.45, 0.85), afro=True, suspensorio=(0.45, 0.30, 0.18), magra=True),
}


def pivo(nome, loc, pai):
    o = bpy.data.objects.new(nome, None)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.parent = pai
    return o


def montar(cfg):
    """Monta a pessoa; devolve (raiz, partes). Escala geral = cfg['alt'] (o pai mede ~1,75 m)."""
    k = cfg['alt']
    raiz = bpy.data.objects.new('raiz', None)
    bpy.context.collection.objects.link(raiz)
    corpo = pivo('corpo', (0, 0, 0), raiz)
    m_pele = C.mat('pele', PELE, rough=0.55)
    m_cam = C.mat('camisa', cfg['camisa'], rough=0.6)
    m_cal = C.mat('calca', cfg['calca'] or cfg['vestido'], rough=0.65)
    m_cab = C.mat('cabelo', cfg['cabelo'], rough=0.5)
    m_sap = C.mat('sapato', cfg['sapato'], rough=0.35)
    m_pre = C.mat('preto', (0.04, 0.03, 0.03), rough=0.3)
    m_bra = C.mat('branco', (1, 1, 1), rough=0.3)
    quadril = 0.78 * k
    # pernas (pivô no quadril, giram em X = para a frente e para trás)
    pernas = []
    for s in (-1, 1):
        pv = pivo(f'perna{s}', (0.09 * k * s, 0, quadril), corpo)
        C.cilindro(f'coxa{s}', (0, 0, -0.36 * k), 0.075 * k, 0.72 * k, m_cal if cfg['calca'] else m_pele, pai=pv)
        C.cubo(f'sap{s}', (0, -0.05 * k, -0.74 * k), (0.07 * k, 0.12 * k, 0.05 * k), m_sap, pai=pv, bisel=0.03 * k)
        pernas.append(pv)
    # tronco
    if cfg.get('vestido') and not cfg['calca']:
        bpy.ops.mesh.primitive_cone_add(vertices=40, radius1=0.30 * k, radius2=0.17 * k, depth=0.62 * k, location=(0, 0, quadril + 0.05 * k))
        saia = bpy.context.active_object; saia.parent = corpo
        C._fim(saia, m_cal, None)
    # torso arredondado (mais largo nos ombros), quadril da cor da calça e pescoço
    lt = 1.3 if cfg.get('gordo') else 1.12 if cfg.get('gorda') else 0.85 if cfg.get('magra') else 1.0  # largura do tronco
    C.cubo('tronco', (0, 0, quadril + 0.32 * k), (0.17 * k * lt, 0.11 * k * lt, 0.27 * k), m_cam, pai=corpo, bisel=0.07 * k)
    if cfg.get('colete'):
        C.cubo('colete', (0, 0, quadril + 0.30 * k), (0.175 * k * lt, 0.118 * k * lt, 0.2 * k), C.mat('colete', cfg['colete'], rough=0.7), pai=corpo, bisel=0.07 * k)
    if cfg.get('avental'):
        C.cubo('avental', (0, -0.11 * k, quadril - 0.05 * k), (0.16 * k, 0.012 * k, 0.24 * k), C.mat('avental', cfg['vestido'], rough=0.7), pai=corpo)
        C.cubo('aventalf', (0, -0.125 * k, quadril - 0.27 * k), (0.16 * k, 0.012 * k, 0.025 * k), C.mat('aventalf', cfg['avental'], rough=0.7), pai=corpo)
        C.cubo('lacoav', (0, 0, quadril + 0.1 * k), (0.15 * k * lt, 0.115 * k, 0.025 * k), C.mat('aventalf', cfg['avental']), pai=corpo)
    if cfg.get('suspensorio'):
        for sx in (-1, 1):
            C.cubo(f'susp{sx}', (0.08 * k * sx, 0, quadril + 0.3 * k), (0.022 * k, 0.12 * k * lt, 0.27 * k), C.mat('susp', cfg['suspensorio']), pai=corpo)
    C.cubo('ombros', (0, 0, quadril + 0.53 * k), (0.2 * k, 0.115 * k, 0.07 * k), m_cam, pai=corpo, bisel=0.06 * k)
    if cfg['calca']:
        C.cubo('quadril', (0, 0, quadril + 0.04 * k), (0.165 * k, 0.105 * k, 0.09 * k), m_cal, pai=corpo, bisel=0.05 * k)
    C.cilindro('pescoco', (0, 0, quadril + 0.64 * k), 0.055 * k, 0.12 * k, m_pele, pai=corpo)
    if cfg.get('listras'):
        for i in range(3):
            C.cubo(f'lis{i}', (0, 0, quadril + 0.16 * k + i * 0.13 * k), (0.172 * k * lt, 0.112 * k * lt, 0.03 * k), C.mat('listra', cfg['listras'], rough=0.6), pai=corpo, bisel=0.02 * k)
    if cfg.get('gravata'):
        C.cubo('gravata', (0, -0.11 * k * lt - 0.03 * k, quadril + 0.40 * k), (0.035 * k, 0.012 * k, 0.17 * k), C.mat('gravata', cfg['gravata'], rough=0.5), pai=corpo)
    # braços (pivô no ombro)
    bracos = []
    for s in (-1, 1):
        pv = pivo(f'braco{s}', (0.215 * k * s, 0, quadril + 0.55 * k), corpo)
        C.cilindro(f'braco_c{s}', (0, 0, -0.14 * k), 0.06 * k, 0.28 * k, m_cam, pai=pv)
        C.cilindro(f'antebraco{s}', (0, 0, -0.36 * k), 0.048 * k, 0.24 * k, m_pele, pai=pv)
        C.esfera(f'mao{s}', (0, 0, -0.50 * k), (0.065 * k,) * 3, m_pele, pai=pv)
        bracos.append(pv)
    # cabeça grande (cartum): não escala tanto com a altura
    kc = 0.55 + 0.45 * k
    cab = pivo('cabeca', (0, 0, quadril + 0.70 * k + 0.19 * kc), corpo)
    C.esfera('rosto', (0, 0, 0), (0.19 * kc, 0.18 * kc, 0.2 * kc), m_pele, pai=cab)
    for s in (-1, 1):
        C.esfera(f'olho{s}', (0.07 * kc * s, -0.165 * kc, 0.03 * kc), (0.025 * kc, 0.015 * kc, 0.035 * kc), m_pre, pai=cab)
        C.esfera(f'brilho{s}', (0.075 * kc * s, -0.178 * kc, 0.045 * kc), (0.008 * kc,) * 3, m_bra, pai=cab)
        C.cubo(f'sobr{s}', (0.07 * kc * s, -0.17 * kc, 0.09 * kc), (0.035 * kc, 0.01 * kc, 0.008 * kc), m_cab, pai=cab)
        C.esfera(f'orelha{s}', (0.19 * kc * s, 0, 0), (0.03 * kc, 0.02 * kc, 0.045 * kc), m_pele, pai=cab)
    C.esfera('nariz', (0, -0.19 * kc, -0.01 * kc), (0.03 * kc,) * 3, m_pele, pai=cab)
    boca = C.esfera('boca', (0, -0.17 * kc, -0.08 * kc), (0.04 * kc, 0.01 * kc, 0.012 * kc), m_pre, pai=cab)
    # cabelo
    C.esfera('cabelo', (0, 0.02 * kc, 0.07 * kc), (0.20 * kc, 0.19 * kc, 0.16 * kc), m_cab, pai=cab)
    if cfg.get('longo'):  # cabelo comprido e volumoso até os ombros
        C.esfera('cabelo_l', (0, 0.05 * kc, -0.08 * kc), (0.24 * kc, 0.2 * kc, 0.24 * kc), m_cab, pai=cab)
    if cfg.get('chanel'):  # corte reto com franja
        C.esfera('cabelo_c', (0, 0.02 * kc, -0.02 * kc), (0.225 * kc, 0.215 * kc, 0.2 * kc), m_cab, pai=cab)
        C.cubo('franja', (0, -0.15 * kc, 0.1 * kc), (0.16 * kc, 0.05 * kc, 0.05 * kc), m_cab, pai=cab, bisel=0.03 * kc)
    if cfg.get('afro'):
        C.esfera('afro', (0, 0.02 * kc, 0.12 * kc), (0.3 * kc, 0.29 * kc, 0.26 * kc), m_cab, pai=cab)
    if cfg.get('bigode'):
        C.esfera('bigode', (0, -0.185 * kc, -0.045 * kc), (0.06 * kc, 0.02 * kc, 0.018 * kc), m_cab, pai=cab)
    if cfg.get('coque'):
        C.esfera('coque', (0, 0.06 * kc, 0.24 * kc), (0.12 * kc, 0.12 * kc, 0.12 * kc), m_cab, pai=cab)
    if cfg.get('rabo'):
        C.esfera('rabo', (0, 0.2 * kc, 0.02 * kc), (0.07 * kc, 0.09 * kc, 0.16 * kc), m_cab, pai=cab, rot=(0.5, 0, 0))
        C.esfera('laco', (0, 0.17 * kc, 0.12 * kc), (0.06 * kc, 0.03 * kc, 0.04 * kc), C.mat('laco', (0.95, 0.3, 0.5)), pai=cab)
    if cfg.get('bone'):
        m_bone = C.mat('bone', cfg['bone'], rough=0.5)
        C.esfera('bone', (0, 0.0, 0.12 * kc), (0.205 * kc, 0.195 * kc, 0.12 * kc), m_bone, pai=cab)
        C.cubo('aba', (0, -0.2 * kc, 0.08 * kc), (0.13 * kc, 0.09 * kc, 0.012 * kc), m_bone, pai=cab, bisel=0.01)
    return raiz, dict(corpo=corpo, pernas=pernas, bracos=bracos, cabeca=cab, boca=boca, quadril=quadril, k=k)


def pose(P, anim, i, n):
    """Coloca a pessoa na pose do quadro i de n da animação."""
    f = i / n
    th = f * 2 * math.pi
    cz, inc = 0.0, 0.0
    pe = [0, 0]
    br = [0, 0]
    bz = [0, 0]
    boca = 1.0
    if anim == 'parado':
        cz = 0.008 * math.sin(th)
        br = [0.05 * math.sin(th), -0.05 * math.sin(th)]
    elif anim in ('correr', 'carregar'):
        s = math.sin(th)
        pe = [0.5 * s, -0.5 * s]
        cz = 0.05 * abs(math.cos(th)) * P['k']
        inc = 0.14
        if anim == 'correr':
            br = [-0.75 * s, 0.75 * s]
        else:
            br = [-1.25 + 0.06 * s, -1.25 - 0.06 * s]  # braços para a frente, segurando a pilha de coisas
    elif anim == 'panico':
        cz = 0.06 * abs(math.sin(th)) * P['k']
        br = [math.pi * 0.92 + 0.25 * math.sin(th * 2), math.pi * 0.92 - 0.25 * math.sin(th * 2)]
        bz = [0.3, -0.3]
        pe = [0.25 * math.sin(th), -0.25 * math.sin(th)]
        boca = 3.0
    P['corpo'].location.z = cz
    P['corpo'].rotation_euler = (-inc, 0, 0)
    for j in range(2):
        P['pernas'][j].rotation_euler = (pe[j], 0, 0)
        P['bracos'][j].rotation_euler = (br[j], (1 if j else -1) * bz[j], 0)
    P['boca'].scale = (0.04, 0.01, 0.012 * boca)


def main():
    ids = [a for a in sys.argv[sys.argv.index('--') + 1:] if not a.startswith('--')] if '--' in sys.argv else []
    ids = ids[0].split(',') if ids else list(PESSOAS)
    info = {'px_m': PX, 'quadro_m': [QW, QH], 'anims': {a: {'quadros': n, 'dur': d} for a, (n, d) in ANIMS.items()}, 'pessoas': {}}
    for pid in ids:
        C.limpar()
        raiz, P = montar(PESSOAS[pid])
        if GLB:
            raiz.name = pid
            C.exportar_glb(pid, juntar=False)
            continue
        sc = C.cena_sprite(QW, QH, teste=TESTE, alvo=(0, 0, 0.95), px_m=PX, amostras=16)
        cam = sc.camera
        pes = C.ponto_na_tela(sc, cam, (0, 0, 0))
        for anim, (n, dur) in ANIMS.items():
            if TESTE and anim not in ('correr', 'carregar'):
                continue
            for d in DIRS:
                raiz.rotation_euler = (0, 0, math.radians(d))
                quadros = []
                for i in range(n):
                    pose(P, anim, i, n)
                    f = os.path.join(C.TMP, f'{pid}_{anim}_{d}_{i}.png')
                    sc.render.filepath = f
                    bpy.ops.render.render(write_still=True)
                    quadros.append(f)
                C.juntar_tira(quadros, os.path.join(SAIDA, pid, f'{anim}_{d}.png'))
        info['pessoas'][pid] = {'pes': pes, 'w': sc.render.resolution_x, 'h': sc.render.resolution_y}
        print('OK', pid)
    if GLB:
        return
    arq = os.path.join(SAIDA, 'familia.json')
    velho = json.load(open(arq)) if os.path.exists(arq) else {}
    velho.update({k: v for k, v in info.items() if k != 'pessoas'})
    velho.setdefault('pessoas', {}).update(info['pessoas'])
    json.dump(velho, open(arq, 'w'), indent=1)


main()
