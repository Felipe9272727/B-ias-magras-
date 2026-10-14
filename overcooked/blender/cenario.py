"""Peças 3D do cenário e itens do Overcooked das IAs, renderizadas uma a uma com a mesma câmera e luz dos chefs.
O Remotion monta a cozinha encaixando as peças na grade (fileiras de trás para a frente), como os cenários
pré-renderizados do Donkey Kong Country.

Peças (1 m × 1 m de base, bancada com 0,9 m de altura), ponto de referência = centro da base no chão:
  piso_a, piso_b, parede, bancada, caixa_<ing>, tabua, fogao, grelha, pia, entrega, lixo, retorno, pratos
Itens (ponto de referência = centro da base do item):
  <ing>, <ing>_picado, carne_grelhada, prato, prato_sujo, prato_sopa_<x>, panela, panela_<x>, frigideira,
  frigideira_carne, frigideira_grelhada, frigideira_queimada, extintor
Saída: video/remotion/public/overcooked/pecas/<nome>.png + pecas.json (tamanho, âncora, px por metro)

Uso: xvfb-run -a blender -b -P overcooked/blender/cenario.py -- [--teste]
"""
import bpy, json, math, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.append(AQUI)
import comum as C  # noqa: E402

SAIDA = os.path.join(C.PUBLIC, 'pecas')
ALT = 0.9  # altura da bancada

M = {}


def mats():
    M['madeira'] = C.mat('madeira', (0.86, 0.62, 0.38), rough=0.55)
    M['madeira_esc'] = C.mat('madeira_esc', (0.55, 0.34, 0.18), rough=0.6)
    M['tampo'] = C.mat('tampo', (0.93, 0.78, 0.55), rough=0.5)
    M['inox'] = C.mat('inox', (0.78, 0.80, 0.84), rough=0.25, metal=0.9)
    M['ferro'] = C.mat('ferro', (0.16, 0.17, 0.19), rough=0.45, metal=0.5)
    M['piso_a'] = C.mat('piso_a', (0.94, 0.90, 0.80), rough=0.35)
    M['piso_b'] = C.mat('piso_b', (0.82, 0.76, 0.64), rough=0.35)
    M['rejunte'] = C.mat('rejunte', (0.55, 0.50, 0.42), rough=0.8)
    M['azulejo'] = C.mat('azulejo', (0.56, 0.80, 0.86), rough=0.2)
    M['branco'] = C.mat('branco_l', (0.97, 0.97, 0.95), rough=0.3)
    M['agua'] = C.mat('agua', (0.45, 0.72, 0.92), rough=0.05)
    M['amarelo'] = C.mat('amarelo', (1.0, 0.82, 0.2), rough=0.4, emit=0.4)
    M['vermelho'] = C.mat('vermelho_l', (0.88, 0.16, 0.14), rough=0.35)
    M['caixa'] = C.mat('caixa', (0.70, 0.46, 0.24), rough=0.7)
    M['brasa'] = C.mat('brasa', (1.0, 0.35, 0.08), rough=0.5, emit=2.5)
    ING = {'tomate': (0.91, 0.22, 0.16), 'cebola': (0.95, 0.84, 0.58), 'cogumelo': (0.80, 0.62, 0.46), 'alface': (0.45, 0.80, 0.27),
           'pao': (0.90, 0.64, 0.33), 'carne': (0.85, 0.30, 0.30), 'grelhada': (0.45, 0.25, 0.12), 'folha': (0.2, 0.55, 0.15),
           'queimada': (0.08, 0.07, 0.07)}
    for k, v in ING.items():
        M[k] = C.mat('i_' + k, v, rough=0.4)
    for k, v in {'sopa_tomate': (0.85, 0.18, 0.1), 'sopa_cebola': (0.93, 0.76, 0.38), 'sopa_cogumelo': (0.62, 0.45, 0.30), 'sopa_misturada': (0.55, 0.42, 0.28)}.items():
        M[k] = C.mat(k, v, rough=0.15)


def bancada_base(tampo=True):
    """Armário de madeira com porta e puxador, tampo por cima."""
    C.cubo('armario', (0, 0, ALT / 2 - 0.03), (0.49, 0.49, ALT / 2 - 0.03), M['madeira'], bisel=0.02)
    C.cubo('porta', (0, -0.495, 0.40), (0.38, 0.01, 0.30), M['madeira_esc'], bisel=0.01)
    C.cubo('puxador', (0.25, -0.51, 0.55), (0.03, 0.015, 0.06), M['inox'], bisel=0.01)
    if tampo:
        C.cubo('tampo', (0, 0, ALT - 0.03), (0.5, 0.5, 0.04), M['tampo'], bisel=0.015)


# ---------------------------------------------------------------- ingredientes (inteiros e picados)
def ingrediente(nome, z=0.0, esc=1.0, picado=False):
    s = 0.22 * esc
    if picado:
        cor = M['grelhada'] if nome == 'carne_grelhada' else M['carne'] if nome == 'carne' else M[nome]
        if nome.startswith('carne'):
            C.esfera('bife', (0, 0, z + 0.04 * esc), (0.17 * esc, 0.13 * esc, 0.05 * esc), cor)
            return
        for (x, y) in ((-0.07, -0.04), (0.06, -0.06), (-0.04, 0.06), (0.07, 0.05)):
            C.cubo('pedaco', (x * esc, y * esc, z + 0.04 * esc), (0.05 * esc, 0.05 * esc, 0.035 * esc), cor, bisel=0.012 * esc)
        return
    if nome == 'tomate':
        C.esfera('tomate', (0, 0, z + s * 0.8), (s, s, s * 0.85), M['tomate'])
        for a in range(5):
            C.esfera('folha', (0.05 * math.cos(a * 1.26) * esc, 0.05 * math.sin(a * 1.26) * esc, z + s * 1.55), (0.05 * esc, 0.02 * esc, 0.012 * esc), M['folha'], rot=(0, 0, a * 1.26))
    elif nome == 'cebola':
        C.esfera('cebola', (0, 0, z + s * 0.85), (s * 0.95, s * 0.95, s), M['cebola'])
        C.cilindro('pontinha', (0, 0, z + s * 1.85), 0.025 * esc, 0.08 * esc, M['madeira_esc'])
    elif nome == 'cogumelo':
        C.cilindro('talo', (0, 0, z + s * 0.45), s * 0.35, s * 0.9, M['branco'])
        C.esfera('chapeu', (0, 0, z + s * 0.95), (s * 1.0, s * 1.0, s * 0.6), M['cogumelo'])
    elif nome == 'alface':
        for i in range(6):
            a = i * 1.05
            C.esfera('folha', (0.06 * math.cos(a) * esc, 0.06 * math.sin(a) * esc, z + s * 0.75), (s * 0.7, s * 0.5, s * 0.6), M['alface'], rot=(0.4, 0, a))
        C.esfera('miolo', (0, 0, z + s * 0.8), (s * 0.6, s * 0.6, s * 0.6), M['alface'])
    elif nome == 'pao':
        C.esfera('pao', (0, 0, z + s * 0.45), (s * 1.1, s * 1.1, s * 0.55), M['pao'])
        for (x, y) in ((-0.06, 0.0), (0.05, 0.04), (0.02, -0.06)):
            C.esfera('gergelim', (x * esc, y * esc, z + s * 0.95), (0.018 * esc, 0.012 * esc, 0.008 * esc), M['branco'])
    elif nome == 'carne':
        C.esfera('carne', (0, 0, z + s * 0.35), (s * 1.0, s * 0.8, s * 0.4), M['carne'])
        C.esfera('osso', (0.04 * esc, 0, z + s * 0.6), (0.04 * esc, 0.03 * esc, 0.02 * esc), M['branco'])


def prato(z=0.0, sujo=False, sopa=None):
    C.cilindro('prato', (0, 0, z + 0.02), 0.26, 0.04, M['branco'] if not sujo else C.mat('sujo', (0.72, 0.68, 0.55), rough=0.7))
    C.cilindro('borda', (0, 0, z + 0.045), 0.2, 0.012, C.mat('borda_prato', (0.9, 0.9, 0.86), rough=0.3))
    if sujo:
        for (x, y) in ((-0.08, 0.04), (0.07, -0.05), (0.02, 0.1)):
            C.esfera('mancha', (x, y, z + 0.05), (0.04, 0.03, 0.01), C.mat('mancha', (0.45, 0.35, 0.2), rough=0.8))
    if sopa:
        C.cilindro('tigela', (0, 0, z + 0.09), 0.17, 0.12, M['branco'])
        C.cilindro('sopa', (0, 0, z + 0.153), 0.15, 0.008, M['sopa_' + sopa])


def panela(conteudo=None):
    C.cilindro('panela', (0, 0, 0.13), 0.24, 0.26, C.mat('panela_m', (0.42, 0.45, 0.5), rough=0.35, metal=0.7))
    C.cilindro('boca', (0, 0, 0.262), 0.215, 0.006, C.mat('fundo_panela', (0.12, 0.12, 0.13), rough=0.6))
    for sx in (-1, 1):
        C.cubo('alca', (0.29 * sx, 0, 0.22), (0.06, 0.03, 0.02), M['ferro'], bisel=0.01)
    if conteudo:
        C.cilindro('liquido', (0, 0, 0.268), 0.2, 0.008, M['queimada'] if conteudo == 'queimada' else M['sopa_' + conteudo])


def frigideira(conteudo=None):
    C.cilindro('frig', (0, 0, 0.04), 0.24, 0.07, M['ferro'])
    C.cubo('cabo', (0.36, 0, 0.06), (0.14, 0.03, 0.02), M['madeira_esc'], bisel=0.01)
    if conteudo:
        C.esfera('bife', (0, 0, 0.09), (0.15, 0.11, 0.04), {'carne': M['carne'], 'grelhada': M['grelhada'], 'queimada': M['queimada']}[conteudo])


def extintor():
    C.cilindro('corpo', (0, 0, 0.22), 0.09, 0.42, M['vermelho'])
    C.esfera('topo', (0, 0, 0.43), (0.09, 0.09, 0.05), M['vermelho'])
    C.cubo('gatilho', (0, 0, 0.5), (0.05, 0.02, 0.03), M['ferro'], bisel=0.01)
    C.cubo('bico', (0.07, 0, 0.52), (0.06, 0.015, 0.015), M['ferro'])
    C.cubo('rotulo', (0, -0.088, 0.24), (0.06, 0.005, 0.07), M['branco'])


# ---------------------------------------------------------------- peças do cenário
def peca(nome):
    if nome in ('piso_a', 'piso_b'):
        C.cubo('ladrilho', (0, 0, -0.02), (0.49, 0.49, 0.02), M[nome], bisel=0.01)
        C.cubo('rejunte', (0, 0, -0.035), (0.5, 0.5, 0.01), M['rejunte'])
    elif nome == 'parede':
        C.cubo('parede', (0, 0.3, 0.9), (0.5, 0.2, 0.9), M['azulejo'])
        for z in (0.45, 0.9, 1.35):
            C.cubo('linha', (0, 0.095, z), (0.5, 0.006, 0.006), M['branco'])
        C.cubo('linha_v', (0, 0.095, 0.9), (0.006, 0.006, 0.9), M['branco'])
        C.cubo('rodape', (0, 0.12, 0.05), (0.5, 0.03, 0.05), M['madeira_esc'])
    elif nome == 'bancada':
        bancada_base()
    elif nome.startswith('caixa_'):
        bancada_base(tampo=False)
        C.cubo('caixa', (0, 0, ALT - 0.02), (0.47, 0.47, 0.06), M['caixa'], bisel=0.02)
        for i in range(3):
            C.cubo('ripa', (0, -0.48, ALT - 0.06 + i * 0.0), (0.46, 0.01, 0.02), M['madeira_esc'])
        ing = nome.split('_', 1)[1]
        for (x, y) in ((-0.17, -0.15), (0.15, -0.12), (0.0, 0.12), (-0.18, 0.16), (0.18, 0.18)):
            bpy.ops.object.empty_add(location=(x, y, 0))
            ancora = bpy.context.active_object
            antes = set(bpy.data.objects)
            ingrediente(ing, z=ALT + 0.03, esc=0.75)
            for o in set(bpy.data.objects) - antes:
                o.location.x += x; o.location.y += y
            bpy.data.objects.remove(ancora)
    elif nome == 'tabua':
        bancada_base()
        C.cubo('tabua', (0, 0, ALT + 0.03), (0.34, 0.26, 0.025), C.mat('tabua_m', (0.95, 0.86, 0.66), rough=0.6), bisel=0.02)
        C.cubo('faca', (0.3, 0.2, ALT + 0.07), (0.14, 0.025, 0.006), M['inox'], rot=(0, 0, 0.6))
        C.cubo('cabo', (0.42, 0.29, ALT + 0.07), (0.06, 0.02, 0.012), M['madeira_esc'], rot=(0, 0, 0.6))
    elif nome in ('fogao', 'grelha'):
        C.cubo('fogao', (0, 0, ALT / 2 - 0.02), (0.49, 0.49, ALT / 2 - 0.02), M['inox'], bisel=0.02)
        C.cubo('forno', (0, -0.495, 0.40), (0.38, 0.01, 0.24), M['ferro'], bisel=0.01)
        C.cubo('janela', (0, -0.505, 0.42), (0.26, 0.005, 0.12), C.mat('vidro', (0.25, 0.18, 0.12), rough=0.1))
        for x in (-0.25, 0.0, 0.25):
            C.cilindro('botao', (x, -0.51, 0.76), 0.04, 0.03, M['ferro'], rot=(math.pi / 2, 0, 0))
        C.cubo('tampo', (0, 0, ALT - 0.01), (0.5, 0.5, 0.025), M['ferro'], bisel=0.01)
        if nome == 'fogao':
            C.cilindro('boca', (0, 0, ALT + 0.02), 0.2, 0.02, M['brasa'])
            for a in range(4):
                C.cubo('grade', (0, 0, ALT + 0.04), (0.25, 0.015, 0.012), M['ferro'], rot=(0, 0, a * math.pi / 4))
        else:
            C.cubo('chapa', (0, 0, ALT + 0.025), (0.36, 0.36, 0.015), C.mat('chapa', (0.22, 0.2, 0.2), rough=0.4, metal=0.6))
            for i in range(5):
                C.cubo('risca', (0, -0.24 + i * 0.12, ALT + 0.042), (0.33, 0.012, 0.004), M['brasa'])
    elif nome == 'pia':
        bancada_base(tampo=False)
        C.cubo('tampo', (0, 0, ALT - 0.03), (0.5, 0.5, 0.04), M['inox'], bisel=0.015)
        C.cubo('cuba', (0, -0.02, ALT - 0.01), (0.34, 0.3, 0.03), M['agua'])
        C.cilindro('torneira', (0, 0.36, ALT + 0.12), 0.025, 0.24, M['inox'])
        C.cubo('bico', (0, 0.28, ALT + 0.23), (0.025, 0.09, 0.02), M['inox'])
    elif nome == 'entrega':
        C.cubo('base', (0, 0, ALT / 2 - 0.02), (0.49, 0.49, ALT / 2 - 0.02), M['ferro'], bisel=0.02)
        C.cubo('esteira', (0, 0, ALT - 0.01), (0.47, 0.47, 0.03), C.mat('esteira', (0.25, 0.27, 0.3), rough=0.5))
        for i in range(3):
            C.cubo('seta', (-0.12 + i * 0.14, 0, ALT + 0.025), (0.05, 0.12, 0.006), M['amarelo'], rot=(0, 0, 0))
        C.cilindro('sino_base', (0.32, -0.32, ALT + 0.03), 0.07, 0.02, M['ferro'])
        C.esfera('sino', (0.32, -0.32, ALT + 0.07), (0.06, 0.06, 0.05), C.mat('dourado', (0.95, 0.75, 0.25), rough=0.2, metal=1))
    elif nome == 'lixo':
        C.cilindro('lixo', (0, 0, 0.42), 0.36, 0.84, C.mat('lixo_m', (0.35, 0.38, 0.42), rough=0.4, metal=0.3))
        C.cilindro('tampa', (0, 0, 0.86), 0.38, 0.05, C.mat('lixo_t', (0.25, 0.28, 0.3), rough=0.4, metal=0.3))
        C.cubo('pedal', (0, -0.38, 0.06), (0.1, 0.06, 0.02), M['ferro'])
    elif nome in ('retorno', 'pratos'):
        bancada_base()
        if nome == 'retorno':
            C.cubo('janela', (0, 0.2, ALT + 0.16), (0.42, 0.1, 0.16), M['ferro'], bisel=0.02)
            C.cubo('buraco', (0, 0.1, ALT + 0.14), (0.34, 0.01, 0.11), C.mat('escuro', (0.05, 0.05, 0.05)))


ITENS = {}
for i in ('tomate', 'cebola', 'cogumelo', 'alface', 'pao', 'carne'):
    ITENS[i] = (lambda i=i: ingrediente(i))
    if i != 'pao':
        ITENS[i + '_picado'] = (lambda i=i: ingrediente(i, picado=True))
ITENS['carne_grelhada'] = lambda: ingrediente('carne_grelhada', picado=True)
ITENS['prato'] = lambda: prato()
ITENS['prato_sujo'] = lambda: prato(sujo=True)
for s in ('tomate', 'cebola', 'cogumelo', 'misturada'):
    ITENS['prato_sopa_' + s] = (lambda s=s: prato(sopa=s))
    ITENS['panela_' + s] = (lambda s=s: panela(s))
ITENS['panela'] = lambda: panela()
ITENS['panela_queimada'] = lambda: panela('queimada')
ITENS['frigideira'] = lambda: frigideira()
for c in ('carne', 'grelhada', 'queimada'):
    ITENS['frigideira_' + c] = (lambda c=c: frigideira(c))
ITENS['extintor'] = extintor

PECAS = ['piso_a', 'piso_b', 'parede', 'bancada', 'tabua', 'fogao', 'grelha', 'pia', 'entrega', 'lixo', 'retorno', 'pratos'] + [f'caixa_{i}' for i in ('tomate', 'cebola', 'cogumelo', 'alface', 'pao', 'carne')]


def limpar_objetos():
    for o in [o for o in bpy.data.objects if o.type not in ('CAMERA', 'LIGHT')]:
        bpy.data.objects.remove(o)


def renderizar(teste=False):
    os.makedirs(SAIDA, exist_ok=True)
    meta = {'px_m': C.PX * (0.5 if teste else 1), 'pecas': {}, 'itens': {}}
    for grupo, lista, (larg, alt, alvo) in (('pecas', PECAS, (1.25, 2.3, (0, 0, 0.75))), ('itens', list(ITENS), (0.9, 0.9, (0, 0, 0.15)))):
        C.limpar()
        mats()
        sc = C.cena_sprite(larg, alt, teste, alvo=alvo)
        anc = C.ponto_na_tela(sc, sc.camera, (0, 0, 0))
        for nome in lista:
            limpar_objetos()
            (peca(nome) if grupo == 'pecas' else ITENS[nome]())
            sc.render.filepath = os.path.join(SAIDA, f'{nome}.png')
            bpy.ops.render.render(write_still=True)
            meta[grupo][nome] = {'w': sc.render.resolution_x, 'h': sc.render.resolution_y, 'ancora': anc}
            print('peça', nome, flush=True)
    with open(os.path.join(SAIDA, 'pecas.json'), 'w') as fh:
        json.dump(meta, fh)


if __name__ == '__main__':
    args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    renderizar('--teste' in args)
