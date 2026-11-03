"""Van do BOMBANANA! (v3, a partir do trailer e das capturas da Steam): a van comprida azul-marinho por dentro, com a
cabine na frente (bancos laranja, volante, para-brisa) separada por cortinas vermelhas, janelas foscas, mangueiras
coloridas no teto, luminária laranja sobre a mesa retangular de feltro verde com borda de madeira arredondada,
geladeira azul-clara com adesivos, cômoda marrom com rádio e fitas, aro de basquete no hexágono roxo, placa de
radiação, TV com barras coloridas em cima de caixotes, fliperama, monitor verde, galão vermelho, caixotes de
dinamite, garrafas e bananas pelo chão. Arte própria (sem logos/marcas).
A bomba é outro GLB: maleta marrom-escura com tampa aberta, tela verde ('lcd') cercada de bananas de dinamite em anel,
e o painel de módulos ('painel', que recebe a textura dos módulos no three.js).
Assentos: Cego e Surdo lado a lado de um lado da mesa, Mudo do outro (como no jogo).
Uso: blender -b -P bombanana/blender/van.py [-- --previa]  ->  public/bb/3d/van.glb, bomba3.glb
"""
import bpy, math, os, sys, random
from mathutils import Vector

_aqui = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(_aqui, 'sala2.py')).read().split('W, D, H =')[0])  # helpers (mat, caixa, cil, esfera, toro, tubo, plano, banana) e paleta
random.seed(11)

W, D0, D1, H = 1.65, -2.6, 2.3, 2.35   # meia largura; fundo (-Y) e frente da área (+Y, onde começa a cabine); altura
CAB = 3.5                               # fim da cabine
NAVY = mat('van_parede', (0.1, 0.16, 0.36), 0.75)
NAVY_PAINEL = mat('van_painel', (0.14, 0.24, 0.52), 0.7)
NAVY_ESC = mat('van_escuro', (0.07, 0.1, 0.24), 0.8)
TETO_V = mat('van_teto', (0.2, 0.2, 0.34), 0.85)
PISO = mat('van_piso', (0.13, 0.14, 0.2), 0.9)
FOSCO = mat('vidro_fosco', (0.7, 0.88, 0.98), 0.15, emit=0.35)
ESTOFADO = mat('estofado', (0.98, 0.62, 0.16), 0.7)
GELADEIRA = mat('geladeira', (0.62, 0.86, 0.92), 0.35)
MARROM = mat('comoda_marrom', (0.42, 0.24, 0.14), 0.6)
MARROM2 = mat('comoda_marrom2', (0.33, 0.18, 0.1), 0.6)
CAIXA_MAD = mat('caixote_mad', (0.78, 0.48, 0.25), 0.7)
DINAMITE = mat('dinamite', (0.85, 0.12, 0.1), 0.55)
RADIO_AZUL = mat('radio_azul', (0.55, 0.75, 0.9), 0.4)

# ---------------- casca: piso, paredes com painéis, teto arredondado, janelas foscas
caixa('piso', (0, (D0 + CAB) / 2, -0.05), (2 * W, CAB - D0, 0.1), PISO, r=0)
for lado in (-1, 1):
    caixa(f'parede_{lado}', (lado * (W + 0.05), (D0 + CAB) / 2, H / 2), (0.1, CAB - D0, H), NAVY, r=0)
    # faixa de painéis azuis com frisos na altura da cintura e janelas foscas em cima
    caixa(f'painel_baixo_{lado}', (lado * (W - 0.03), (D0 + D1) / 2, 0.55), (0.05, D1 - D0 - 0.2, 0.7), NAVY_PAINEL, r=0.04)
    for k in range(5):
        caixa(f'friso_{lado}_{k}', (lado * (W - 0.06), (D0 + D1) / 2, 0.3 + k * 0.12), (0.03, D1 - D0 - 0.3, 0.025), NAVY_ESC, r=0.01)
    for i, y in enumerate((-1.75, -0.35, 1.05)):
        caixa(f'janela_moldura_{lado}_{i}', (lado * (W - 0.02), y, 1.5), (0.06, 0.95, 0.6), NAVY_ESC, r=0.12)
        caixa(f'janela_{lado}_{i}', (lado * (W - 0.05), y, 1.5), (0.02, 0.82, 0.48), FOSCO, r=0.1)
        caixa(f'janela_reflexo_{lado}_{i}', (lado * (W - 0.065), y - 0.12, 1.53), (0.01, 0.07, 0.4), mat('reflexo', (1, 1, 1), 0.1, emit=1.4), r=0.01, rot=(math.radians(28) * lado, 0, 0))
caixa('parede_fundo', (0, D0 - 0.05, H / 2), (2 * W + 0.2, 0.1, H), NAVY, r=0)
caixa('porta_fundo', (0, D0 + 0.03, 1.0), (1.5, 0.06, 1.8), NAVY_PAINEL, r=0.08)
for x in (-0.38, 0.38):
    caixa(f'porta_fundo_janela{x}', (x, D0 + 0.065, 1.45), (0.6, 0.02, 0.45), FOSCO, r=0.1)
caixa('teto', (0, (D0 + CAB) / 2, H + 0.05), (2 * W + 0.2, CAB - D0, 0.1), TETO_V, r=0)
for lado in (-1, 1):  # cantos arredondados do teto
    cil(f'canto_teto_{lado}', (lado * (W - 0.12), (D0 + CAB) / 2, H - 0.12), 0.2, CAB - D0, TETO_V, rot=(math.radians(90), 0, 0), v=32)
for i, y in enumerate((-1.8, -0.6, 0.6, 1.8)):
    caixa(f'nervura_teto{i}', (0, y, H - 0.02), (2 * W, 0.1, 0.06), NAVY_ESC, r=0.03)
# mangueiras coloridas pelo teto (verde, amarela, vermelha, azul)
tubo('mang_verde', [(-W, -2.0, 2.1), (-0.9, -1.3, 2.2), (-0.2, -0.4, 2.05), (0.6, 0.4, 2.2), (W, 1.2, 2.15)], 0.035, mat('mang_verde', (0.2, 0.7, 0.25), 0.5))
tubo('mang_amarela', [(W, -2.2, 2.2), (0.7, -1.2, 2.05), (0.1, -0.2, 2.25), (-0.8, 0.9, 2.1), (-W, 1.9, 2.2)], 0.04, AMARELO)
tubo('mang_vermelha', [(-W, 0.2, 2.25), (-0.6, 0.7, 2.0), (0.4, 1.3, 2.2), (W, 1.9, 2.1)], 0.03, VERMELHO)
tubo('mang_azul', [(W, -0.6, 2.2), (0.4, -1.6, 2.1), (-0.5, -2.2, 2.25), (-W, -2.5, 2.2)], 0.035, AZUL_VIVO)

# ---------------- cabine na frente: cortina vermelha aberta no meio, bancos laranja, volante, painel e para-brisa
cil('varao_cortina', (0, D1, 2.12), 0.025, 2 * W, TEAL, rot=(0, math.radians(90), 0), v=16)
for lado in (-1, 1):
    c = plano(f'cortina_cab{lado}', (0, 0, 0), (1.0, 1.95), CORTINA, cortes=36, onda=lambda x, y: 0.06 * math.sin(x * 30))
    c.rotation_euler = (math.radians(90), 0, 0); c.location = (lado * (W - 0.5), D1, 1.13)
    bpy.context.view_layer.objects.active = c; c.modifiers.new('s', 'SOLIDIFY').thickness = 0.02
    acabar(c, CORTINA, f'cortina_cab{lado}')
    for i in range(6):
        toro(f'argola_cab{lado}_{i}', (lado * (W - 0.95 + i * 0.18), D1, 2.12), 0.04, 0.01, TEAL, rot=(0, math.radians(90), 0))
for x in (-0.75, 0.75):
    caixa(f'banco_assento{x}', (x, 2.95, 0.5), (0.7, 0.6, 0.18), ESTOFADO, r=0.08)
    caixa(f'banco_encosto{x}', (x, 2.68, 0.95), (0.7, 0.16, 0.8), ESTOFADO, r=0.08, rot=(math.radians(-8), 0, 0))
    caixa(f'banco_cabeca{x}', (x, 2.66, 1.45), (0.4, 0.12, 0.2), ESTOFADO, r=0.06)
caixa('painel_carro', (0, 3.38, 0.95), (2 * W, 0.3, 0.35), NAVY_ESC, r=0.08)
toro('volante', (-0.75, 3.2, 1.2), 0.2, 0.03, PRETO, rot=(math.radians(60), 0, 0))
cil('volante_eixo', (-0.75, 3.28, 1.12), 0.03, 0.2, PRETO, rot=(math.radians(60), 0, 0))
caixa('parabrisa', (0, CAB - 0.02, 1.65), (2 * W - 0.2, 0.03, 0.9), mat('parabrisa', (0.75, 0.92, 1.0), 0.1, emit=1.3), r=0.08)
caixa('parede_cabine', (0, CAB + 0.03, H / 2), (2 * W + 0.2, 0.06, H), NAVY, r=0)
caixa('retrovisor', (0, CAB - 0.1, 2.0), (0.3, 0.04, 0.09), PRETO, r=0.03)

# ---------------- luminária laranja sobre a mesa
LX, LY = 0.0, 0.0
cil('lum_fio', (LX, LY, 2.22), 0.008, 0.26, VERMELHO, v=8)
bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=0.34, radius2=0.08, depth=0.2, end_fill_type='NOTHING', location=(LX, LY, 2.0))
cup = ativo()
for v in cup.data.vertices:
    t = (v.co.z + 0.1) / 0.2
    k = 1 + 0.3 * math.sin(t * math.pi) * (1 - t)
    v.co.x *= k; v.co.y *= k
md = cup.modifiers.new('sub', 'SUBSURF'); md.levels = 2
cup.modifiers.new('s', 'SOLIDIFY').thickness = 0.025
acabar(cup, LARANJA, 'luminaria_cupula')
toro('lum_borda', (LX, LY, 1.9), 0.34, 0.016, mat('lum_borda', (1.0, 0.78, 0.45), 0.5))
esfera('lampada', (LX, LY, 1.93), (0.08, 0.08, 0.07), LUZ)

# ---------------- mesa retangular: feltro verde, borda de madeira arredondada, dois pés
MZ = 0.74
caixa('mesa_tampo', (0, 0, MZ - 0.03), (1.5, 1.15, 0.07), MAD_VERM, r=0.03)
caixa('mesa_feltro', (0, 0, MZ + 0.008), (1.3, 0.95, 0.02), FELTRO, r=0.01)
for lado in (-1, 1):
    caixa(f'mesa_borda_x{lado}', (lado * 0.7, 0, MZ + 0.03), (0.12, 1.15, 0.08), MAD_VERM, r=0.04)
    caixa(f'mesa_borda_y{lado}', (0, lado * 0.52, MZ + 0.03), (1.5, 0.12, 0.08), MAD_VERM, r=0.04)
    caixa(f'mesa_pe{lado}', (lado * 0.5, 0, 0.36), (0.12, 0.8, 0.7), MAD2, r=0.03)
# objetos em cima da mesa: garrafa verde, banana, chave inglesa
cil('mesa_garrafa', (0.55, -0.35, MZ + 0.14), 0.05, 0.24, VERDE, bis=0.02)
cil('mesa_garrafa_gargalo', (0.55, -0.35, MZ + 0.31), 0.02, 0.12, VERDE, r2=0.016)
caixa('mesa_garrafa_rotulo', (0.55, -0.4, MZ + 0.13), (0.07, 0.01, 0.08), VERMELHO, r=0.004)
BAN = mat('banana', (0.98, 0.82, 0.2), 0.45)
banana('mesa_banana', (-0.5, 0.32, MZ + 0.04), (math.radians(90), 0, math.radians(30)), BAN)
caixa('mesa_chave', (0.42, 0.3, MZ + 0.02), (0.26, 0.04, 0.02), METAL, r=0.008, rot=(0, 0, math.radians(-25)))

# banquinhos: copo azul em cima de um pé (o macaco senta no copo do próprio modelo)
BANCO = mat('banco_pe', (0.6, 0.68, 0.82), 0.4)
ASSENTOS = {'cego': (-0.42, -0.98), 'surdo': (0.42, -0.98), 'mudo': (0.0, 0.98)}
for papel, (x, y) in ASSENTOS.items():
    cil(f'banco_{papel}_prato', (x, y, 0.34), 0.26, 0.05, BANCO, v=48, bis=0.02)
    cil(f'banco_{papel}_haste', (x, y, 0.17), 0.045, 0.34, METAL, v=24)
    cil(f'banco_{papel}_pe', (x, y, 0.02), 0.22, 0.04, BANCO, v=48, bis=0.015)

# ---------------- lado direito (+X): geladeira com adesivos, cômoda com rádio e fitas, aro de basquete
GX, GY = 1.22, -1.55
caixa('geladeira', (GX, GY, 0.55), (0.62, 0.62, 1.1), GELADEIRA, r=0.1)
caixa('geladeira_porta_linha', (GX - 0.315, GY, 0.75), (0.01, 0.58, 0.01), mat('geladeira_esc', (0.45, 0.68, 0.76), 0.4), r=0)
caixa('geladeira_puxador', (GX - 0.33, GY + 0.22, 0.6), (0.03, 0.04, 0.3), METAL, r=0.012)
ADES = [VERMELHO, AMARELO, LARANJA, AZUL_VIVO, VERDE, ROXO, CREME, mat('rosa', (0.95, 0.5, 0.6), 0.5)]
for i in range(9):  # adesivos redondos e quadrados na frente da geladeira (lado que olha para a mesa)
    y = GY - 0.22 + (i % 3) * 0.2 + random.uniform(-0.03, 0.03); z = 0.3 + (i // 3) * 0.25 + random.uniform(-0.03, 0.03)
    if i % 2:
        cil(f'adesivo{i}', (GX - 0.312, y, z), 0.055, 0.006, ADES[i % 8], rot=(0, math.radians(90), 0), v=24)
    else:
        caixa(f'adesivo{i}', (GX - 0.312, y, z), (0.006, 0.1, 0.08), ADES[i % 8], r=0.01, rot=(math.radians(random.uniform(-15, 15)), 0, 0))
# patinho amarelo e cone em cima da geladeira
esfera('patinho', (GX, GY + 0.1, 1.17), (0.07, 0.06, 0.06), AMARELO); esfera('patinho_cab', (GX - 0.04, GY + 0.1, 1.25), (0.04, 0.04, 0.04), AMARELO)
cil('cone', (GX + 0.05, GY - 0.15, 1.2), 0.07, 0.2, LARANJA, r2=0.01)
# cômoda marrom com gavetas e puxadores
CX2, CY2 = 1.33, 0.25
caixa('comoda', (CX2, CY2, 0.42), (0.55, 1.3, 0.84), MARROM, r=0.04)
for i in range(3):
    caixa(f'comoda_gaveta{i}', (CX2 - 0.28, CY2, 0.18 + i * 0.26), (0.03, 1.2, 0.22), MARROM2, r=0.02)
    for y in (-0.3, 0.3):
        esfera(f'comoda_puxador{i}{y}', (CX2 - 0.31, CY2 + y, 0.18 + i * 0.26), (0.03, 0.05, 0.05), mat('puxador', (0.2, 0.18, 0.3), 0.5))
caixa('radio', (CX2 - 0.02, CY2 + 0.3, 1.0), (0.26, 0.42, 0.26), RADIO_AZUL, r=0.05)
cil('radio_falante', (CX2 - 0.15, CY2 + 0.4, 0.98), 0.08, 0.02, PRETO, rot=(0, math.radians(90), 0))
cil('radio_lente', (CX2 - 0.16, CY2 + 0.4, 0.98), 0.05, 0.02, ARDOSIA, rot=(0, math.radians(90), 0))
caixa('radio_tela', (CX2 - 0.15, CY2 + 0.17, 1.03), (0.01, 0.14, 0.08), mat('radio_tela', (0.95, 0.5, 0.5), 0.4), r=0.01)
cil('radio_antena', (CX2, CY2 + 0.12, 1.3), 0.008, 0.36, METAL, rot=(math.radians(-15), 0, 0), v=12)
for i in range(3):  # fitas cassete
    caixa(f'fita_k7_{i}', (CX2 - 0.05, CY2 - 0.25 + i * 0.03, 0.86 + i * 0.025), (0.2, 0.12, 0.022), [mat('k7a', (0.95, 0.55, 0.6), 0.5), CREME, mat('k7b', (0.5, 0.85, 0.7), 0.5)][i], r=0.006, rot=(0, 0, math.radians(i * 12)))
# hexágono roxo com tabela e aro de basquete na parede direita
cil('hexagono', (W - 0.04, 0.9, 1.68), 0.48, 0.05, ROXO, rot=(0, math.radians(90), 0), v=6, bis=0.02)
cil('hexagono_borda', (W - 0.03, 0.9, 1.68), 0.54, 0.03, mat('hex_borda', (0.95, 0.85, 0.65), 0.5), rot=(0, math.radians(90), 0), v=6, bis=0.01)
caixa('tabela', (W - 0.09, 0.9, 1.72), (0.05, 0.42, 0.36), CREME, r=0.05)
caixa('tabela_quadro', (W - 0.115, 0.9, 1.66), (0.01, 0.2, 0.15), PRETO, r=0.02)
toro('aro', (W - 0.33, 0.9, 1.55), 0.2, 0.025, VERMELHO)

# ---------------- lado esquerdo (-X): TV com barras sobre caixotes, fliperama, monitor verde, galão, placa de radiação
TX, TY = -1.2, -1.45
caixa('tv_caixote1', (TX, TY, 0.3), (0.55, 0.55, 0.6), CAIXA_MAD, r=0.03)
caixa('tv_caixote2', (TX, TY, 0.75), (0.45, 0.45, 0.3), LARANJA, r=0.03)
caixa('tv', (TX + 0.02, TY, 1.12), (0.36, 0.46, 0.4), ROXO, r=0.08)
BARRAS = [(1, 1, 1), (1, 0.95, 0.2), (0.2, 0.95, 0.95), (0.2, 0.9, 0.2), (0.95, 0.2, 0.95), (0.95, 0.15, 0.15), (0.15, 0.2, 0.95)]
for i, c in enumerate(BARRAS):
    caixa(f'tv_barra{i}', (TX + 0.205, TY - 0.15 + i * 0.05, 1.12), (0.01, 0.05, 0.26), mat(f'barra{i}', c, 0.3, emit=1.0), r=0)
for a in (-25, 25):
    cil(f'tv_antena{a}', (TX, TY + math.sin(math.radians(a)) * 0.12, 1.45), 0.006, 0.3, METAL, rot=(math.radians(a), 0, 0), v=8)
# fliperama
FX, FY = -1.3, 1.5
caixa('fliper', (FX, FY, 0.85), (0.6, 0.7, 1.7), AZUL, r=0.05)
caixa('fliper_lado_l', (FX, FY - 0.36, 0.85), (0.62, 0.04, 1.72), LARANJA, r=0.02)
caixa('fliper_lado_r', (FX, FY + 0.36, 0.85), (0.62, 0.04, 1.72), LARANJA, r=0.02)
caixa('fliper_tela', (FX + 0.31, FY, 1.25), (0.02, 0.5, 0.4), mat('fliper_tela', (0.2, 0.45, 0.95), 0.2, emit=1.2), r=0.03)
caixa('fliper_letreiro', (FX + 0.3, FY, 1.6), (0.04, 0.62, 0.18), mat('fliper_letreiro', (1.0, 0.55, 0.15), 0.3, emit=0.6), r=0.03)
caixa('fliper_controle', (FX + 0.36, FY, 0.92), (0.2, 0.6, 0.08), PRETO, r=0.02, rot=(0, math.radians(-15), 0))
for i, c in enumerate((VERMELHO, AMARELO, VERDE)):
    cil(f'fliper_botao{i}', (FX + 0.42, FY - 0.1 + i * 0.1, 0.97), 0.025, 0.03, c, v=16)
cil('fliper_alavanca', (FX + 0.42, FY + 0.2, 1.0), 0.01, 0.1, PRETO, v=8); esfera('fliper_bola', (FX + 0.42, FY + 0.2, 1.06), (0.03, 0.03, 0.03), VERMELHO)
# mesinha com monitor verde e galão vermelho
caixa('mesinha_esq', (-1.3, 0.25, 0.7), (0.5, 0.9, 0.05), MAD, r=0.02)
for dy in (-0.38, 0.38):
    caixa(f'mesinha_esq_pe{dy}', (-1.3, 0.25 + dy, 0.35), (0.05, 0.05, 0.7), MAD2, r=0.01)
caixa('monitor', (-1.35, 0.4, 0.97), (0.34, 0.4, 0.32), mat('monitor', (0.85, 0.85, 0.8), 0.5), r=0.05)
caixa('monitor_tela', (-1.175, 0.4, 0.99), (0.01, 0.3, 0.22), mat('monitor_tela', (0.35, 0.95, 0.4), 0.2, emit=1.0), r=0.02)
caixa('galao', (-1.3, 0.0, 0.88), (0.22, 0.14, 0.3), VERMELHO, r=0.03)
for a in (45, -45):
    caixa(f'galao_x{a}', (-1.185, 0.0, 0.88), (0.01, 0.03, 0.18), PRETO, r=0.005, rot=(math.radians(a), 0, 0))
# placa amarela de radiação na parede esquerda
cil('placa_radiacao', (-W + 0.04, -0.4, 1.75), 0.26, 0.03, AMARELO, rot=(0, math.radians(90), 0), v=3, bis=0.04)
cil('placa_radiacao_miolo', (-W + 0.06, -0.4, 1.73), 0.04, 0.01, PRETO, rot=(0, math.radians(90), 0), v=20)
for i in range(3):
    a = math.radians(90 + i * 120)
    cil(f'placa_radiacao_pa{i}', (-W + 0.06, -0.4 + math.cos(a) * 0.08, 1.73 + math.sin(a) * 0.08), 0.06, 0.01, PRETO, rot=(0, math.radians(90), 0), v=3)

# ---------------- caixotes de dinamite e coisas no chão
def caixote_dinamite(nome, c):
    caixa(nome, c, (0.5, 0.4, 0.3), CAIXA_MAD, r=0.025)
    for i in range(5):
        cil(f'{nome}_dina{i}', (c[0] - 0.18 + i * 0.09, c[1], c[2] + 0.2), 0.04, 0.36, DINAMITE, rot=(math.radians(90), 0, 0), v=16)
caixote_dinamite('caixote_dina1', (-1.25, -0.6, 0.15))
caixote_dinamite('caixote_dina2', (1.25, 1.35, 0.15))
for i, (x, y) in enumerate(((0.95, -0.4), (-0.85, 1.0), (0.3, -1.9), (-0.6, -2.1), (1.0, 2.0))):
    banana(f'chao_banana{i}', (x, y, 0.04), (math.radians(90), 0, random.uniform(0, 3)), BAN)
for i, (x, y) in enumerate(((1.05, -0.8), (-0.95, -1.95), (0.7, 1.85))):
    cil(f'chao_garrafa{i}', (x, y, 0.12), 0.05, 0.24, VERDE if i != 1 else VERMELHO, bis=0.02)
    cil(f'chao_garrafa_g{i}', (x, y, 0.29), 0.02, 0.1, VERDE if i != 1 else VERMELHO, r2=0.016)

bpy.ops.object.select_all(action='DESELECT')
for o in TODOS:
    o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(SAIDA, 'van.glb'), export_format='GLB', use_selection=True, export_apply=True, export_lights=False, export_cameras=False)
SALA = list(TODOS); TODOS.clear()

# ================= BOMBA: maleta marrom-escura; origem no centro do feltro
B0 = Vector((0, 0, MZ + 0.018))
P = lambda x, y, z: (B0.x + x, B0.y + y, B0.z + z)
MAL = mat('maleta', (0.2, 0.16, 0.14), 0.55)
MAL2 = mat('maleta_borda', (0.28, 0.23, 0.2), 0.5)
MAL_FUNDO = mat('maleta_fundo', (0.12, 0.1, 0.09), 0.7)
caixa('bomba_base', P(0, 0, 0.07), (0.78, 0.56, 0.14), MAL, r=0.06)
caixa('bomba_base_aro', P(0, 0, 0.14), (0.8, 0.58, 0.03), MAL2, r=0.015)
caixa('bomba_base_fundo', P(0, 0, 0.145), (0.7, 0.48, 0.02), MAL_FUNDO, r=0.03)
pn = plano('painel', P(0, 0, 0.157), (0.66, 0.44), MAL_FUNDO)
acabar(pn, mat('painel_mod', (0.25, 0.25, 0.28), 0.6), 'painel', liso=False)
for x in (-0.22, 0.22):  # trincos
    caixa(f'bomba_trinco{x}', P(x, -0.285, 0.12), (0.12, 0.03, 0.05), ARDOSIA, r=0.01)
# tampa aberta (dobradiça no lado +Y, a tela olha para -Y = para o Cego e o Surdo)
ang = math.radians(-8)
tampa_c = Vector(P(0, 0.31, 0.38))
caixa('bomba_tampa', tuple(tampa_c), (0.78, 0.12, 0.56), MAL, r=0.06, rot=(ang, 0, 0))
caixa('bomba_tampa_aro', tuple(tampa_c + Vector((0, -0.065, 0))), (0.8, 0.03, 0.58), MAL2, r=0.015, rot=(ang, 0, 0))
caixa('bomba_tampa_fundo', tuple(tampa_c + Vector((0, -0.07, 0))), (0.7, 0.02, 0.48), MAL_FUNDO, r=0.03, rot=(ang, 0, 0))
# anéis de dinamite (tubos coloridos) atrás da tela
for i, (cor, dz) in enumerate(((VERMELHO, 0.16), (AMARELO, 0.08), (VERDE, 0.0), (AZUL_VIVO, -0.08), (VERMELHO, -0.16))):
    toro(f'bomba_anel{i}', tuple(tampa_c + Vector((0, -0.1, dz * 0.9))), 0.29, 0.034, cor, rot=(math.radians(90) + ang, 0, 0), esc=(1.0, 0.42, 1))
caixa('bomba_tela_moldura', tuple(tampa_c + Vector((0, -0.14, 0.0))), (0.48, 0.05, 0.36), mat('tela_moldura', (0.33, 0.3, 0.28), 0.5), r=0.05, rot=(ang, 0, 0))
bpy.ops.mesh.primitive_plane_add(size=1, location=tuple(tampa_c + Vector((0, -0.168, 0.0))), rotation=(math.radians(90) + ang, 0, 0))
lcd = ativo(); lcd.scale = (0.4, 0.29, 1); bpy.ops.object.transform_apply(scale=True)
acabar(lcd, mat('lcd', (0.45, 0.95, 0.45), 0.3, emit=1.2), 'lcd', liso=False)
for x in (-0.25, 0.25):
    cil(f'bomba_dobradica{x}', P(x, 0.27, 0.15), 0.03, 0.1, ARDOSIA, rot=(0, math.radians(90), 0), v=16)
bpy.ops.object.select_all(action='DESELECT')
for o in TODOS:
    o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(SAIDA, 'bomba3.glb'), export_format='GLB', use_selection=True, export_apply=True, export_lights=False, export_cameras=False)
print('ok van.glb bomba3.glb')

if '--previa' in sys.argv:
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 40; sc.cycles.use_denoising = True
    sc.view_settings.view_transform = 'Standard'
    sc.render.resolution_x, sc.render.resolution_y = 1280, 720
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); bpy.context.collection.objects.link(cam)
    sc.camera = cam; cam.data.lens = 16
    sc.world = bpy.data.worlds.new('w'); sc.world.color = (0.06, 0.08, 0.15)
    L = bpy.data.objects.new('l', bpy.data.lights.new('l', 'POINT')); bpy.context.collection.objects.link(L); L.location = (0, 0, 1.85); L.data.energy = 220; L.data.color = (1, 0.82, 0.6)
    A = bpy.data.objects.new('a', bpy.data.lights.new('a', 'AREA')); bpy.context.collection.objects.link(A); A.location = (0, -1.5, 2.2); A.data.energy = 150; A.data.size = 2.5
    for nome, (loc, alvo) in {'previa_van': ((0.0, -2.4, 1.6), (0, 0.6, 0.8)), 'previa_van_mudo': ((0.0, 1.0, 1.35), (0, -1.0, 0.9))}.items():
        cam.location = loc
        d = Vector(alvo) - Vector(loc); cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(SAIDA, nome + '.png'); bpy.ops.render.render(write_still=True)
    print('previa ok')
