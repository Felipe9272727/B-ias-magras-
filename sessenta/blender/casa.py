"""Casa da fase de coleta do 60 Segundos das IAs, em 3D (desenho próprio, casa de subúrbio dos anos 50 em corte,
paredes baixas para ver por dentro). Lê a MESMA planta do motor (sessenta/casa.mjs --json) e renderiza o fundo
estático inteiro numa imagem só: piso de cada cômodo, paredes, portas, móveis e o alçapão do abrigo.
Itens e pessoas NÃO entram aqui (são sprites à parte, porque somem/andam).

Saída: video/remotion/public/sessenta/casa/casa.png + casa.json (px por metro e onde cai cada ponto da grade na
imagem: origem e vetores de +1 casa em x, +1 casa em y e +1 m de altura).

Uso: xvfb-run -a blender -b -P sessenta/blender/casa.py -- [--teste]
"""
import bpy, json, math, os, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.append(AQUI)
import comum as C  # noqa: E402

TESTE = '--teste' in sys.argv
SAIDA = os.path.join(C.PUBLIC, 'casa')
PLANTA = json.loads(subprocess.run(['node', os.path.join(C.RAIZ, 'sessenta', 'casa.mjs'), '--json', 'planta'], capture_output=True, text=True, check=True).stdout)
LARG, ALT = PLANTA['larg'], PLANTA['alt']
G = PLANTA['grade']
H_PAREDE = 0.75      # paredes baixas (corte), para enxergar dentro dos cômodos
H_FUNDO = 2.4        # a parede do fundo da casa fica inteira, com papel de parede e janelas
ESP = 0.32           # espessura da parede
M = {}


def X(x):  # casa da grade → metros no Blender (y da grade cresce para a frente da tela)
    return x


def Y(y):
    return ALT - y


def mats():
    c = C.mat
    M['concreto'] = c('concreto', (0.62, 0.63, 0.64), rough=0.9)
    M['xadrez_a'] = c('xadrez_a', (0.95, 0.94, 0.90), rough=0.3)
    M['xadrez_b'] = c('xadrez_b', (0.15, 0.17, 0.22), rough=0.3)
    M['taco'] = c('taco', (0.72, 0.49, 0.28), rough=0.55)
    M['taco2'] = c('taco2', (0.62, 0.40, 0.22), rough=0.55)
    M['carpete'] = c('carpete', (0.55, 0.22, 0.20), rough=0.95)
    M['carpete_az'] = c('carpete_az', (0.32, 0.50, 0.62), rough=0.95)
    M['azulejo'] = c('azulejo', (0.70, 0.88, 0.90), rough=0.2)
    M['parede'] = c('parede', (0.93, 0.89, 0.78), rough=0.8)
    M['parede_topo'] = c('parede_topo', (0.30, 0.24, 0.20), rough=0.8)
    M['papel'] = c('papel', (0.55, 0.72, 0.62), rough=0.8)
    M['rodape'] = c('rodape', (0.42, 0.28, 0.18), rough=0.6)
    M['madeira'] = c('madeira', (0.66, 0.43, 0.24), rough=0.6)
    M['madeira_esc'] = c('madeira_esc', (0.40, 0.24, 0.13), rough=0.6)
    M['branco'] = c('branco', (0.96, 0.96, 0.94), rough=0.35)
    M['creme'] = c('creme', (0.98, 0.90, 0.70), rough=0.4)
    M['menta'] = c('menta', (0.55, 0.85, 0.75), rough=0.35)
    M['rosa'] = c('rosa', (0.95, 0.60, 0.65), rough=0.5)
    M['vermelho'] = c('vermelho', (0.82, 0.18, 0.16), rough=0.4)
    M['laranja'] = c('laranja', (0.95, 0.55, 0.20), rough=0.6)
    M['azul'] = c('azul', (0.25, 0.42, 0.75), rough=0.6)
    M['verde'] = c('verde', (0.35, 0.58, 0.32), rough=0.7)
    M['amarelo'] = c('amarelo', (1.0, 0.80, 0.15), rough=0.5)
    M['preto'] = c('preto', (0.06, 0.06, 0.07), rough=0.4)
    M['inox'] = c('inox', (0.78, 0.80, 0.84), rough=0.25, metal=0.9)
    M['ferro'] = c('ferro', (0.22, 0.23, 0.25), rough=0.45, metal=0.6)
    M['vidro'] = c('vidro', (0.60, 0.80, 0.95), rough=0.05, emit=0.25)
    M['tela'] = c('tela', (0.55, 0.75, 0.70), rough=0.2, emit=0.6)
    M['colchao'] = c('colchao', (0.92, 0.92, 0.98), rough=0.7)
    M['cobertor'] = c('cobertor', (0.36, 0.48, 0.80), rough=0.8)
    M['cobertor2'] = c('cobertor2', (0.85, 0.42, 0.50), rough=0.8)


# ---------------------------------------------------------------- piso
PISOS = {'garagem': 'concreto', 'cozinha': 'xadrez', 'sala': 'taco', 'corredor': 'carpete', 'quarto': 'taco',
         'banheiro': 'azulejo', 'criancas': 'carpete_az', 'despensa': 'taco'}


def piso():
    for cid, c in PLANTA['comodos'].items():
        tipo = PISOS[cid]
        for y in range(c['y'], c['y'] + c['h']):
            for x in range(c['x'], c['x'] + c['w']):
                if tipo == 'xadrez':
                    m = M['xadrez_a'] if (x + y) % 2 == 0 else M['xadrez_b']
                elif tipo == 'taco':
                    # tacos em ripas (4 por casa, alternando a direção como espinha de peixe simples)
                    for k in range(4):
                        mk = M['taco'] if (k + x + y) % 2 == 0 else M['taco2']
                        if (x + y) % 2 == 0:
                            C.cubo(f'p{x}_{y}_{k}', (X(x) + 0.125 + k * 0.25, Y(y) - 0.5, -0.02), (0.12, 0.49, 0.02), mk)
                        else:
                            C.cubo(f'p{x}_{y}_{k}', (X(x) + 0.5, Y(y) - 0.125 - k * 0.25, -0.02), (0.49, 0.12, 0.02), mk)
                    continue
                else:
                    m = M[tipo]
                C.cubo(f'p{x}_{y}', (X(x) + 0.5, Y(y) - 0.5, -0.02), (0.5, 0.5, 0.02), m)
    # piso das portas (mesmo do corredor)
    for p in PLANTA['portas']:
        C.cubo(f'pp{p["x"]}_{p["y"]}', (X(p['x']) + 0.5, Y(p['y']) - 0.5, -0.02), (0.5, 0.5, 0.02), M['taco2'])
    # contrapiso da casa inteira (debaixo das paredes não aparece grama)
    C.cubo('contrapiso', (LARG / 2, ALT / 2, -0.035), (LARG / 2, ALT / 2, 0.012), C.mat('contrapiso', (0.45, 0.36, 0.30), rough=0.9))
    # chão de fora (grama) em volta da casa
    C.cubo('grama', (LARG / 2, ALT / 2, -0.06), (LARG / 2 + 3, ALT / 2 + 3, 0.03), C.mat('grama', (0.38, 0.62, 0.30), rough=0.9))


# ---------------------------------------------------------------- paredes (finas, ligadas às vizinhas)
def e_parede(x, y):
    return 0 <= x < LARG and 0 <= y < ALT and G[y][x] == '#'


def paredes():
    for y in range(ALT):
        for x in range(LARG):
            if G[y][x] != '#':
                continue
            fundo = y == 0
            h = H_FUNDO if fundo else H_PAREDE
            cx, cy = X(x) + 0.5, Y(y) - 0.5
            partes = [(cx, cy, ESP / 2, ESP / 2)]
            if e_parede(x + 1, y): partes.append((cx + 0.25, cy, 0.25 + ESP / 4, ESP / 2))
            if e_parede(x - 1, y): partes.append((cx - 0.25, cy, 0.25 + ESP / 4, ESP / 2))
            if e_parede(x, y - 1): partes.append((cx, cy + 0.25, ESP / 2, 0.25 + ESP / 4))
            if e_parede(x, y + 1): partes.append((cx, cy - 0.25, ESP / 2, 0.25 + ESP / 4))
            for i, (px, py, hx, hy) in enumerate(partes):
                C.cubo(f'w{x}_{y}_{i}', (px, py, h / 2), (hx, hy, h / 2), M['papel'] if fundo else M['parede'])
                C.cubo(f't{x}_{y}_{i}', (px, py, h + 0.02), (hx + 0.01, hy + 0.01, 0.025), M['parede_topo'])
    # janelas na parede do fundo (no lado de dentro)
    for wx in (3, 9, 15):
        C.cubo(f'jan{wx}', (wx + 0.5, Y(0) - 0.5 - ESP / 2 - 0.01, 1.35), (0.55, 0.01, 0.42), M['vidro'])
        C.cubo(f'janm{wx}', (wx + 0.5, Y(0) - 0.5 - ESP / 2 - 0.02, 1.35), (0.6, 0.01, 0.03), M['branco'])
        C.cubo(f'janv{wx}', (wx + 0.5, Y(0) - 0.5 - ESP / 2 - 0.02, 1.35), (0.03, 0.01, 0.45), M['branco'])


def portas():
    # batente nas portas (duas colunas finas da cor da madeira)
    for p in PLANTA['portas']:
        cx, cy = X(p['x']) + 0.5, Y(p['y']) - 0.5
        horiz = e_parede(p['x'] - 1, p['y']) or e_parede(p['x'] + 1, p['y'])
        for s in (-1, 1):
            loc = (cx + s * 0.48, cy, H_PAREDE / 2) if horiz else (cx, cy + s * 0.48, H_PAREDE / 2)
            C.cubo(f'bat{p["x"]}_{p["y"]}_{s}', loc, (0.04, ESP / 2 + 0.02, H_PAREDE / 2 + 0.02) if horiz else (ESP / 2 + 0.02, 0.04, H_PAREDE / 2 + 0.02), M['madeira_esc'])


def alcapao():
    a = PLANTA['abrigo']
    cx, cy = X(a['x']) + 0.5, Y(a['y']) - 0.5
    # faixa amarela e preta em volta (a "zona segura") e a tampa de metal com volante
    for i in range(16):
        ang = i / 16 * 2 * math.pi
        C.cubo(f'fx{i}', (cx + 0.46 * math.cos(ang), cy + 0.46 * math.sin(ang), 0.005), (0.09, 0.05, 0.01), M['amarelo'] if i % 2 else M['preto'], rot=(0, 0, ang + math.pi / 2))
    C.cilindro('tampa', (cx, cy, 0.03), 0.38, 0.05, M['ferro'])
    C.cilindro('volante', (cx, cy, 0.08), 0.16, 0.03, M['vermelho'])
    C.cubo('raio1', (cx, cy, 0.09), (0.15, 0.02, 0.012), M['vermelho'])
    C.cubo('raio2', (cx, cy, 0.09), (0.02, 0.15, 0.012), M['vermelho'])


# ---------------------------------------------------------------- móveis (cada um no seu retângulo de casas)
def movel(m):
    x0, y0, w, h = m['x'], m['y'], m['w'], m['h']
    cx, cy = X(x0) + w / 2, Y(y0) - h / 2
    W, D = w / 2 - 0.06, h / 2 - 0.06
    t = m['tipo']
    n = f"{t}_{x0}_{y0}"
    if t == 'carro':
        C.cubo(n + 'b', (cx, cy, 0.42), (W - 0.05, D, 0.28), M['menta'], bisel=0.12)
        C.cubo(n + 'c', (cx, cy - 0.15, 0.85), (W - 0.12, D * 0.5, 0.2), M['menta'], bisel=0.1)
        C.cubo(n + 'v', (cx, cy - 0.15, 0.86), (W - 0.1, D * 0.5 - 0.05, 0.16), M['vidro'], bisel=0.06)
        for sx in (-1, 1):
            for sy in (-1, 1):
                C.cilindro(n + f'r{sx}{sy}', (cx + sx * (W - 0.02), cy + sy * (D - 0.35), 0.2), 0.2, 0.14, M['preto'], rot=(0, math.pi / 2, 0))
        C.cubo(n + 'f', (cx, cy - D - 0.01, 0.42), (W - 0.2, 0.02, 0.08), M['inox'])
    elif t in ('bancada', 'aparador', 'armario'):
        hh = 0.85 if t != 'aparador' else 0.7
        C.cubo(n, (cx, cy, hh / 2), (W, D, hh / 2), M['madeira'], bisel=0.03)
        C.cubo(n + 't', (cx, cy, hh + 0.02), (W + 0.03, D + 0.03, 0.03), M['madeira_esc'], bisel=0.01)
    elif t == 'prateleira':
        for k, z in enumerate((0.25, 0.75, 1.25)):
            C.cubo(n + f's{k}', (cx, cy, z), (W, D, 0.025), M['madeira'])
        for sx in (-1, 1):
            C.cubo(n + f'l{sx}', (cx + sx * W, cy, 0.7), (0.03, D, 0.7), M['madeira_esc'])
        C.cubo(n + 'cx1', (cx - W * 0.4, cy, 0.38), (0.18, 0.15, 0.11), M['laranja'], bisel=0.02)
        C.cubo(n + 'cx2', (cx + W * 0.3, cy, 0.88), (0.2, 0.15, 0.11), M['azul'], bisel=0.02)
    elif t == 'fogao':
        C.cubo(n, (cx, cy, 0.45), (W, D, 0.45), M['creme'], bisel=0.04)
        for sx in (-1, 1):
            for sy in (-1, 1):
                C.cilindro(n + f'b{sx}{sy}', (cx + sx * 0.18, cy + sy * 0.15, 0.92), 0.09, 0.02, M['preto'])
    elif t == 'pia':
        C.cubo(n, (cx, cy, 0.43), (W, D, 0.43), M['creme'], bisel=0.03)
        C.cubo(n + 'c', (cx, cy, 0.86), (W * 0.5, D * 0.6, 0.03), M['inox'])
        C.cilindro(n + 't', (cx, cy + D * 0.6, 1.0), 0.03, 0.25, M['inox'])
    elif t == 'geladeira':
        C.cubo(n, (cx, cy, 0.9), (W, D, 0.9), M['creme'], bisel=0.12)
        C.cubo(n + 'p', (cx + W * 0.6, cy - D - 0.01, 1.1), (0.03, 0.02, 0.25), M['inox'])
    elif t == 'mesa':
        C.cilindro(n + 'tp', (cx, cy, 0.75), min(W, D) * 0.75, 0.05, M['vermelho'])
        C.cilindro(n + 'bd', (cx, cy, 0.72), min(W, D) * 0.77, 0.02, M['inox'])
        C.cilindro(n + 'pe', (cx, cy, 0.37), 0.06, 0.72, M['inox'])
        for k in range(4):
            a = k * math.pi / 2 + math.pi / 4
            C.cilindro(n + f'ca{k}', (cx + math.cos(a) * W * 0.95, cy + math.sin(a) * D * 0.95, 0.45), 0.17, 0.07, M['vermelho'])
    elif t == 'sofa':
        C.cubo(n + 'a', (cx, cy, 0.25), (W, D, 0.22), M['laranja'], bisel=0.08)
        C.cubo(n + 'e', (cx, cy + D * 0.7, 0.55), (W, D * 0.3, 0.3), M['laranja'], bisel=0.08)
        for sx in (-1, 1):
            C.cubo(n + f'b{sx}', (cx + sx * W, cy, 0.4), (0.1, D, 0.25), M['laranja'], bisel=0.06)
    elif t == 'tv':
        C.cubo(n, (cx, cy, 0.45), (W * 0.7, D, 0.45), M['madeira_esc'], bisel=0.05)
        C.cubo(n + 't', (cx, cy - D - 0.005, 0.55), (W * 0.45, 0.01, 0.25), M['tela'], bisel=0.03)
        C.cilindro(n + 'an', (cx - 0.1, cy, 1.05), 0.012, 0.35, M['inox'], rot=(0, 0.5, 0))
    elif t == 'estante':
        C.cubo(n, (cx, cy, 0.9), (W, D, 0.9), M['madeira_esc'], bisel=0.03)
        for k, z in enumerate((0.45, 0.95, 1.45)):
            for j in range(4):
                C.cubo(n + f'l{k}{j}', (cx - 0.2 + 0.03, cy - D * 0.6 + j * D * 0.4, z), (0.02, 0.06, 0.16), [M['vermelho'], M['azul'], M['verde'], M['amarelo']][(k + j) % 4])
    elif t == 'poltrona':
        C.cubo(n, (cx, cy, 0.25), (W, D, 0.22), M['verde'], bisel=0.1)
        C.cubo(n + 'e', (cx + W * 0.6, cy, 0.55), (W * 0.35, D, 0.3), M['verde'], bisel=0.1)
    elif t in ('cama_casal', 'cama'):
        C.cubo(n + 'b', (cx, cy, 0.2), (W, D, 0.18), M['madeira'], bisel=0.03)
        C.cubo(n + 'c', (cx, cy, 0.42), (W - 0.03, D - 0.03, 0.08), M['colchao'], bisel=0.05)
        C.cubo(n + 'cob', (cx, cy - D * 0.15, 0.5), (W - 0.02, D * 0.8, 0.04), M['cobertor'] if t == 'cama_casal' else M['cobertor2'], bisel=0.03)
        C.cubo(n + 'cab', (cx, cy + D, 0.55), (W, 0.05, 0.5), M['madeira_esc'], bisel=0.02)
        C.cubo(n + 'trav', (cx, cy + D * 0.75, 0.52), (W * 0.7, 0.16, 0.06), M['branco'], bisel=0.04)
    elif t == 'guarda_roupa':
        C.cubo(n, (cx, cy, 1.0), (W, D, 1.0), M['madeira'], bisel=0.03)
        C.cubo(n + 'f', (cx - W - 0.005, cy, 1.0), (0.01, 0.02, 0.9), M['madeira_esc'])
    elif t == 'banheira':
        C.cubo(n, (cx, cy, 0.3), (W, D, 0.3), M['branco'], bisel=0.12)
        C.cubo(n + 'a', (cx, cy, 0.56), (W - 0.08, D - 0.1, 0.03), C.mat('agua', (0.5, 0.78, 0.95), rough=0.05))
    elif t == 'pia_banheiro':
        C.cilindro(n + 'p', (cx, cy, 0.4), 0.08, 0.8, M['branco'])
        C.cubo(n + 'c', (cx, cy, 0.82), (W * 0.8, D * 0.7, 0.06), M['branco'], bisel=0.05)
    elif t == 'bau_brinquedos':
        C.cubo(n, (cx, cy, 0.25), (W, D, 0.25), M['vermelho'], bisel=0.04)
        C.cubo(n + 't', (cx, cy, 0.52), (W + 0.02, D + 0.02, 0.03), M['amarelo'], bisel=0.02)
    else:
        C.cubo(n, (cx, cy, 0.4), (W, D, 0.4), M['madeira'])


def main():
    C.limpar()
    mats()
    piso()
    paredes()
    portas()
    alcapao()
    for m in PLANTA['moveis']:
        movel(m)
    larg, alt = LARG + 0.6, ALT * math.sin(math.radians(C.ELEV)) + H_FUNDO * math.cos(math.radians(C.ELEV)) + 0.6
    sc = C.cena_sprite(larg, alt, teste=TESTE, alvo=(LARG / 2, ALT / 2 + 0.35, H_FUNDO * 0.45), px_m=220, amostras=32)
    sc.render.film_transparent = False
    sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.38 ** 2.2, 0.62 ** 2.2, 0.30 ** 2.2, 1)
    cam = sc.camera
    os.makedirs(SAIDA, exist_ok=True)
    sc.render.filepath = os.path.join(SAIDA, 'casa_teste.png' if TESTE else 'casa.png')
    bpy.ops.render.render(write_still=True)
    # mapeamento grade → pixel (a câmera é ortográfica: basta origem + 3 vetores)
    o = C.ponto_na_tela(sc, cam, (X(0), Y(0), 0))
    vx = [a - b for a, b in zip(C.ponto_na_tela(sc, cam, (X(1), Y(0), 0)), o)]
    vy = [a - b for a, b in zip(C.ponto_na_tela(sc, cam, (X(0), Y(1), 0)), o)]
    vz = [a - b for a, b in zip(C.ponto_na_tela(sc, cam, (X(0), Y(0), 1)), o)]
    info = {'img': 'sessenta/casa/' + os.path.basename(sc.render.filepath), 'w': sc.render.resolution_x, 'h': sc.render.resolution_y,
            'origem': o, 'vx': vx, 'vy': vy, 'vz': vz, 'larg': LARG, 'alt': ALT}
    json.dump(info, open(os.path.join(SAIDA, 'casa_teste.json' if TESTE else 'casa.json'), 'w'), indent=1)
    print('OK', info)


main()
