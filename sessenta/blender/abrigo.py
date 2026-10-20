"""O abrigo antiatômico do 60 Segundos das IAs em 3D (desenho próprio): um porão de concreto visto de cima na mesma
câmera da casa — beliches, prateleiras (onde o Remotion coloca os itens que a família tem), mesa com o lugar do
rádio, a escada do alçapão, a porta blindada, lâmpada pendurada, balde, cobertores.
Saída: video/remotion/public/sessenta/abrigo/abrigo.png + abrigo.json (mapeamento e os LUGARES: onde cada pessoa
fica sentada/deitada e onde vai cada item na prateleira, em pixels da imagem).
Uso: xvfb-run -a blender -b -P sessenta/blender/abrigo.py -- [--teste]
"""
import bpy, json, math, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.append(AQUI)
import comum as C  # noqa: E402

TESTE = '--teste' in sys.argv
SAIDA = os.path.join(C.PUBLIC, 'abrigo')
L, P, H = 7.0, 4.6, 2.3   # largura, profundidade, altura da parede do fundo (m)
M = {}


def mats():
    c = C.mat
    M['concreto'] = c('concreto', (0.58, 0.58, 0.56), rough=0.95)
    M['concreto2'] = c('concreto2', (0.50, 0.50, 0.49), rough=0.95)
    M['parede'] = c('parede', (0.66, 0.68, 0.62), rough=0.9)
    M['faixa'] = c('faixa', (0.32, 0.45, 0.35), rough=0.9)
    M['topo'] = c('topo', (0.25, 0.25, 0.25), rough=0.9)
    M['metal'] = c('metal', (0.42, 0.44, 0.46), rough=0.4, metal=0.7)
    M['metal_esc'] = c('metal_esc', (0.22, 0.23, 0.25), rough=0.4, metal=0.7)
    M['madeira'] = c('madeira', (0.62, 0.42, 0.24), rough=0.65)
    M['colchao'] = c('colchao', (0.85, 0.82, 0.70), rough=0.8)
    M['cob1'] = c('cob1', (0.55, 0.20, 0.18), rough=0.85)
    M['cob2'] = c('cob2', (0.25, 0.38, 0.30), rough=0.85)
    M['amarelo'] = c('amarelo', (1.0, 0.80, 0.15), rough=0.5)
    M['preto'] = c('preto', (0.06, 0.06, 0.07), rough=0.4)
    M['lampada'] = c('lampada', (1.0, 0.92, 0.6), rough=0.2, emit=8)
    M['balde'] = c('balde', (0.55, 0.58, 0.62), rough=0.4, metal=0.8)
    M['tapete'] = c('tapete', (0.55, 0.40, 0.22), rough=0.95)


def main():
    C.limpar()
    mats()
    # piso de placas de concreto
    for i in range(int(L)):
        for j in range(int(P)):
            C.cubo(f'pi{i}_{j}', (i + 0.5, j + 0.5, -0.02), (0.49, 0.49, 0.02), M['concreto'] if (i + j) % 2 else M['concreto2'])
    C.cubo('base', (L / 2, P / 2, -0.05), (L / 2 + 0.4, P / 2 + 0.4, 0.02), M['topo'])
    # paredes: fundo inteira (com faixa verde), laterais baixas (corte), frente quase nada
    C.cubo('fundo', (L / 2, P + 0.15, H / 2), (L / 2 + 0.3, 0.15, H / 2), M['parede'])
    C.cubo('faixaf', (L / 2, P - 0.005, 0.45), (L / 2, 0.01, 0.45), M['faixa'])
    for s, x in ((-1, -0.15), (1, L + 0.15)):
        C.cubo(f'lat{s}', (x, P / 2, 0.45), (0.15, P / 2 + 0.3, 0.45), M['parede'])
        C.cubo(f'latt{s}', (x, P / 2, 0.92), (0.16, P / 2 + 0.31, 0.02), M['topo'])
    C.cubo('frente', (L / 2, -0.15, 0.12), (L / 2 + 0.3, 0.15, 0.12), M['parede'])
    # porta blindada no fundo, à esquerda, com volante; escada do alçapão ao lado
    C.cubo('porta', (1.0, P - 0.02, 1.0), (0.55, 0.04, 1.0), M['metal'], bisel=0.04)
    C.cilindro('volante', (1.0, P - 0.08, 1.0), 0.22, 0.04, M['amarelo'], rot=(math.pi / 2, 0, 0))
    for k in range(6):
        C.cubo(f'deg{k}', (2.2, P - 0.12, 0.25 + k * 0.33), (0.3, 0.03, 0.02), M['metal_esc'])
    for s in (-1, 1):
        C.cubo(f'trilho{s}', (2.2 + s * 0.3, P - 0.12, 1.1), (0.025, 0.03, 1.1), M['metal_esc'])
    # prateleira grande no fundo (3 andares) — os itens entram por cima no Remotion
    PX0, PW = 3.2, 2.6
    for k, z in enumerate((0.35, 0.95, 1.55)):
        C.cubo(f'prat{k}', (PX0 + PW / 2, P - 0.3, z), (PW / 2, 0.28, 0.03), M['madeira'])
    for s in (0, 1):
        C.cubo(f'pratl{s}', (PX0 + s * PW, P - 0.3, 0.95), (0.03, 0.28, 0.95), M['madeira'])
    # beliche à direita
    for k, z in enumerate((0.45, 1.35)):
        C.cubo(f'cama{k}', (6.2, 2.6, z), (0.48, 1.0, 0.06), M['metal_esc'])
        C.cubo(f'colc{k}', (6.2, 2.6, z + 0.1), (0.45, 0.97, 0.06), M['colchao'], bisel=0.04)
        C.cubo(f'cob{k}', (6.2, 2.35, z + 0.17), (0.46, 0.7, 0.02), M['cob1'] if k else M['cob2'], bisel=0.02)
    for sx in (-1, 1):
        for sy in (-1, 1):
            C.cubo(f'pe{sx}{sy}', (6.2 + sx * 0.46, 2.6 + sy * 0.98, 0.85), (0.025, 0.025, 0.85), M['metal_esc'])
    # colchão no chão (filhos) à esquerda
    C.cubo('colchao_chao', (0.75, 1.4, 0.07), (0.6, 0.9, 0.07), M['colchao'], bisel=0.05)
    C.cubo('cob_chao', (0.75, 1.2, 0.15), (0.58, 0.6, 0.02), M['cob1'], bisel=0.02)
    # mesa com cadeiras no meio, tapete
    C.cubo('tapete', (3.6, 1.6, 0.003), (1.3, 0.9, 0.003), M['tapete'])
    C.cubo('mesa', (3.6, 1.7, 0.72), (0.7, 0.45, 0.03), M['madeira'], bisel=0.01)
    for sx in (-1, 1):
        for sy in (-1, 1):
            C.cubo(f'mp{sx}{sy}', (3.6 + sx * 0.62, 1.7 + sy * 0.38, 0.36), (0.03, 0.03, 0.36), M['madeira'])
    for k, (x, y) in enumerate(((2.6, 1.7), (4.6, 1.7))):
        C.cubo(f'cad{k}', (x, y, 0.42), (0.2, 0.2, 0.03), M['madeira'])
    # balde e lâmpada
    C.cilindro('balde', (6.5, 0.5, 0.18), 0.18, 0.36, M['balde'])
    C.cilindro('fio', (3.6, 2.4, 1.95), 0.005, 0.7, M['preto'])
    C.esfera('lampada', (3.6, 2.4, 1.55), (0.07, 0.07, 0.09), M['lampada'])
    bpy.ops.object.light_add(type='POINT', location=(3.6, 2.4, 1.45))
    lz = bpy.context.active_object
    lz.data.energy = 220; lz.data.color = (1.0, 0.85, 0.55); lz.data.shadow_soft_size = 0.2
    larg = L + 0.8
    alt = P * math.sin(math.radians(C.ELEV)) + H * math.cos(math.radians(C.ELEV)) + 0.8
    sc = C.cena_sprite(larg, alt, teste=TESTE, alvo=(L / 2, P / 2 + 0.25, H * 0.45), px_m=220, amostras=32)
    sc.render.film_transparent = False
    sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.02, 0.02, 0.025, 1)
    sc.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.15
    for o in bpy.data.objects:  # abrigo é escuro: só a lâmpada e uma luz fraca
        if o.type == 'LIGHT' and o.data.type == 'SUN':
            o.data.energy = 0.6
        if o.type == 'LIGHT' and o.data.type == 'AREA':
            o.data.energy = 40
    cam = sc.camera
    os.makedirs(SAIDA, exist_ok=True)
    sc.render.filepath = os.path.join(SAIDA, 'abrigo_teste.png' if TESTE else 'abrigo.png')
    bpy.ops.render.render(write_still=True)
    pt = lambda p: C.ponto_na_tela(sc, cam, p)  # noqa: E731
    lugares = {  # onde cada um fica no abrigo (pés), em px da imagem
        'pai': pt((2.6, 1.7, 0.0)), 'mae': pt((4.6, 1.7, 0.0)), 'filha': pt((0.6, 2.0, 0.0)), 'filho': pt((1.1, 1.0, 0.0)),
        'porta': pt((1.0, P - 0.3, 0.0)), 'escada': pt((2.2, P - 0.4, 0.0)), 'cama_cima': pt((6.2, 2.6, 1.55)), 'cama_baixo': pt((6.2, 2.6, 0.65)),
    }
    prateleira = [[pt((PX0 + 0.25 + i * 0.36, P - 0.3, z + 0.03)) for i in range(7)] for z in (1.55, 0.95, 0.35)]
    info = {'img': 'sessenta/abrigo/' + os.path.basename(sc.render.filepath), 'w': sc.render.resolution_x, 'h': sc.render.resolution_y,
            'lugares': lugares, 'prateleira': prateleira, 'mesa': pt((3.6, 1.7, 0.75)), 'px_m': 220}
    json.dump(info, open(os.path.join(SAIDA, 'abrigo_teste.json' if TESTE else 'abrigo.json'), 'w'), indent=1)
    print('OK', info['w'], info['h'])


main()
