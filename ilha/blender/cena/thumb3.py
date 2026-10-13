"""Opus da thumbnail do vídeo 3: pose de ataque com a lança apontando pra frente (na animação do jogo a lança
fica presa ao contrário quando o braço vai à frente). Mesma câmera/luz dos bonecos (bonecos.py), fundo transparente:
  video/remotion/public/ilha/thumb/opus_lanca_<t>.png
Uso: xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P ilha/blender/cena/thumb3.py
"""
import bpy, math, os, sys
from mathutils import Matrix, Vector

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.append(AQUI)
sys.path.append(os.path.join(AQUI, '..', 'assets'))
import bonecos as B  # noqa: E402
import gameplay as G  # noqa: E402
import personagens as P  # noqa: E402

SAIDA = os.path.join(B.SAIDA, '..', 'thumb')

sc, cam = B.montar()
sc.eevee.taa_render_samples = 16
os.makedirs(SAIDA, exist_ok=True)
raiz, partes, itens = P.criar_tributo_articulado('T_opus', G.EMPRESA['Anthropic'], G.rgb('#e0782a'), seed=G.ORDEM_PLAT.index('opus') + 3)
for t in (0.45, 0.55, 0.62):
    a, avanco = G.pose_atacar(t, 0.6, 'lanca')
    th = math.radians(90)
    raiz.rotation_euler = (0, 0, th)
    ext = max(G.extensao(a.get('perna_e', (0,))[0], a.get('canela_e', (0,))[0]),
              G.extensao(a.get('perna_d', (0,))[0], a.get('canela_d', (0,))[0]))
    raiz.location = (0, 0, -(0.78 - min(0.78, ext)))
    for nm, ob in partes.items():
        rx, ry, rz = a.get(nm, (0, 0, 0))
        ob.rotation_euler = (math.radians(rx), math.radians(ry), math.radians(rz))
    lanca = itens['lanca']
    lanca.hide_render = False
    bpy.context.view_layer.update()
    # aponta a lança a partir da mão: a ponta mira pra frente, no alvo
    zs = [v.co.z for v in lanca.data.vertices]
    e = (max(zs) - min(zs)) / (1.78 - 0.22)  # escala do tributo
    mao = (Vector(P.MAO) - P.PIV_COTOVELO['antebraco_d']) * e
    guarda = (lanca.parent, lanca.matrix_parent_inverse.copy(), lanca.matrix_basis.copy())
    mao_mundo = lanca.matrix_world @ mao
    mira = Vector((1, 0, -0.22)).normalized()  # pra frente (direita da tela) e um pouco pra baixo, no alvo
    rot = mira.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    nova = Matrix.Translation(mao_mundo) @ rot @ Matrix.Translation(-mao)
    lanca.parent = None
    lanca.matrix_world = nova
    sc.render.filepath = os.path.join(SAIDA, f'opus_lanca_{int(t * 100)}.png')
    bpy.ops.render.render(write_still=True)
    lanca.parent, lanca.matrix_parent_inverse, lanca.matrix_basis = guarda
print('FIM')
