"""Abertura do vídeo 3: o navio dos 12 tributos afunda numa tempestade (24 fps, ~16 s).

Tomadas (câmeras trocadas por marcadores da timeline):
  A   1–96   plano geral noturno: o navio pequeno entre ondas enormes, raio no quadro 40
  B  97–192  de perto, pela lateral: o navio jogando forte, janelas acesas, raio em 130
  C 193–300  o casco racha: proa e popa se separam e empinam, destroços voando, raios em 200 e 240
  D 301–384  a popa afunda de pé; botes e boias no primeiro plano; as luzes se apagam; último raio em 330

Rodar (quadros soltos para teste):
  xvfb-run -a -s "-screen 0 1920x1080x24" blender -b -P ilha/blender/cena/abertura.py -- teste
Render completo (PNG por quadro, retomável):
  ... -- render <pasta_saida> [inicio] [fim]
Os quadros dos raios vão em ilha/dados/abertura_raios.json (o Remotion sincroniza flash e trovão).
"""
import bpy, json, math, os, random, sys
import mathutils

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.append(AQUI)
sys.path.append(os.path.join(AQUI, '..', 'assets'))
from mar import criar_mar, ceu, raio  # noqa: E402
import navio as nv  # noqa: E402

RAIOS = [40, 130, 200, 240, 330]
FIM = 384
QUEBRA = 193  # quadro em que o navio inteiro dá lugar às duas metades


def chave(ob, attr, quadro, valor, interp='BEZIER'):
    setattr(ob, attr, valor)
    ob.keyframe_insert(attr, frame=quadro)


def balanco(ob, amp_rot=(0.06, 0.12, 0.0), amp_z=1.2, escala=18, seed=1):
    """Arfagem/rolagem com F-Curve noise (balanço contínuo nas ondas)."""
    ob.keyframe_insert('rotation_euler', frame=1)
    ob.keyframe_insert('location', frame=1)
    for fc in ob.animation_data.action.fcurves:
        amp = None
        if fc.data_path == 'rotation_euler':
            amp = amp_rot[fc.array_index]
        elif fc.data_path == 'location' and fc.array_index == 2:
            amp = amp_z
        if amp:
            m = fc.modifiers.new('NOISE')
            m.scale = escala
            m.strength = amp * 2
            m.phase = seed * 7 + fc.array_index * 13
            m.blend_in = 0


def visivel(ob, de=1, ate=None):
    """Objeto aparece só entre os quadros de..ate (inclusive); fora disso fica escondido."""
    marcas = [(1, de > 1), (de, False)]
    if ate:
        marcas.append((ate + 1, True))
    for q, escondido in marcas:
        ob.hide_render = escondido
        ob.keyframe_insert('hide_render', frame=q)
        ob.hide_viewport = escondido
        ob.keyframe_insert('hide_viewport', frame=q)
    for fc in ob.animation_data.action.fcurves:
        if fc.data_path in ('hide_render', 'hide_viewport'):
            for k in fc.keyframe_points:
                k.interpolation = 'CONSTANT'


def montar():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.fps = 24
    sc.frame_start, sc.frame_end = 1, FIM
    criar_mar(tempestade=True)
    ceu(True)

    # lua (luz principal) + raios
    bpy.ops.object.light_add(type='SUN')
    lua = bpy.context.object
    lua.name = 'Lua'
    lua.rotation_euler = (math.radians(68), 0, math.radians(160))
    lua.data.color = (0.72, 0.8, 1.0)
    raio(lua, RAIOS, base=2.0, pico=12)
    # luz quente vinda das janelas do navio (ajuda a ler o casco de perto)
    bpy.ops.object.light_add(type='POINT', location=(0, 0, 9))
    quente = bpy.context.object
    quente.data.color = (1.0, 0.75, 0.4)
    quente.data.shadow_soft_size = 6

    # navio inteiro (tomadas A e B) indo para a direita
    inteiro = nv.criar_navio('Navio', seed=2)
    inteiro.location = (-30, 0, -0.6)
    chave(inteiro, 'location', 1, (-30, 0, -0.6))
    chave(inteiro, 'location', QUEBRA - 1, (-6, 0, -1.0))
    balanco(inteiro, amp_rot=(0.07, 0.10, 0.02), amp_z=1.4)
    visivel(inteiro, 1, QUEBRA - 1)
    quente.parent = inteiro
    # a luz quente segue o navio inteiro; na quebra ela enfraquece e some com o apagão das janelas
    for q, e in [(1, 2500), (QUEBRA - 1, 2500), (QUEBRA, 900), (330, 900), (331, 0)]:
        quente.data.energy = e
        quente.data.keyframe_insert('energy', frame=q)

    # metades (tomadas C e D)
    partes = nv.criar_navio('NavioPartido', seed=2, partes_separadas=True)
    proa, popa = partes['proa'], partes['popa']
    for p, lado in [(proa, 1), (popa, -1)]:
        p.location = (-6, 0, -1.0)
        p.rotation_euler = (0, 0, 0)
        p.keyframe_insert('location', frame=QUEBRA)
        p.keyframe_insert('rotation_euler', frame=QUEBRA)
        # separam, empinam (pivô no corte) e afundam
        p.location = (-6 + lado * 9, lado * 2.5, -4)
        p.rotation_euler = (lado * 0.08, -lado * math.radians(28), lado * 0.12)
        p.keyframe_insert('location', frame=300)
        p.keyframe_insert('rotation_euler', frame=300)
        afund = -16 if lado < 0 else -30
        p.location = (-6 + lado * 11, lado * 3.5, afund)
        p.rotation_euler = (lado * 0.12, -lado * math.radians(70 if lado < 0 else 45), lado * 0.18)
        p.keyframe_insert('location', frame=FIM)
        p.keyframe_insert('rotation_euler', frame=FIM)
        visivel(p, QUEBRA)
    # destroços espirram no momento da quebra e ficam boiando
    rnd = random.Random(5)
    for i, d in enumerate(partes['destrocos']):
        x0, y0 = -6 + rnd.uniform(-3, 3), rnd.uniform(-3, 3)
        d.location = (x0, y0, 4)
        d.keyframe_insert('location', frame=QUEBRA)
        d.location = (x0 + rnd.uniform(-14, 14), y0 + rnd.uniform(-16, 16), rnd.uniform(6, 14))
        d.keyframe_insert('location', frame=QUEBRA + 14)
        d.location = (x0 + rnd.uniform(-20, 20), y0 + rnd.uniform(-22, 22), 0.2)
        d.keyframe_insert('location', frame=QUEBRA + 34)
        d.rotation_euler = (rnd.uniform(-3, 3), rnd.uniform(-3, 3), rnd.uniform(-3, 3))
        d.keyframe_insert('rotation_euler', frame=QUEBRA + 34)
        balanco(d, amp_rot=(0.3, 0.3, 0.2), amp_z=0.8, escala=10, seed=i + 3)
        visivel(d, QUEBRA)
    # botes e boias no primeiro plano da tomada D
    for i in range(3):
        b = nv.criar_bote(f'Bote{i}', seed=i) if i < 2 else nv.criar_boia_salva_vidas('Boia', seed=1)
        b.location = (14 + i * 7, -26 + i * 5, 0.2)
        b.rotation_euler = (0, 0, rnd.uniform(0, 6))
        balanco(b, amp_rot=(0.25, 0.25, 0.1), amp_z=1.0, escala=12, seed=20 + i)
        visivel(b, 301)

    # janelas apagam no fim (material emissivo do navio)
    mj = bpy.data.materials.get('navio_janela')
    if mj:
        em = mj.node_tree.nodes['Principled BSDF'].inputs['Emission Strength']
        for q, v in [(1, 4.0), (330, 4.0), (331, 0.0), (336, 2.5), (340, 0.0)]:
            em.default_value = v
            em.keyframe_insert('default_value', frame=q)

    # câmeras
    def camera(nome, loc, alvo, lente):
        bpy.ops.object.camera_add(location=loc)
        c = bpy.context.object
        c.name = nome
        c.data.lens = lente
        c.data.clip_end = 2000
        c.rotation_euler = (mathutils.Vector(alvo) - mathutils.Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        return c

    camA = camera('CamA', (40, -120, 9), (-20, 0, 6), 45)
    chave(camA, 'location', 1, (40, -120, 9))
    chave(camA, 'location', 96, (30, -100, 8))
    camB = camera('CamB', (4, -42, 6), (-12, 0, 8), 32)
    chave(camB, 'location', 97, (4, -42, 6))
    chave(camB, 'location', 192, (10, -40, 7))
    camC = camera('CamC', (10, -78, 14), (-6, 0, 6), 30)
    chave(camC, 'location', 193, (10, -78, 14))
    chave(camC, 'location', 300, (4, -66, 11))
    camD = camera('CamD', (30, -48, 4), (-10, 0, 6), 28)
    chave(camD, 'location', 301, (30, -48, 4))
    chave(camD, 'location', FIM, (26, -42, 3.5))
    for q, c in [(1, camA), (97, camB), (193, camC), (301, camD)]:
        m = sc.timeline_markers.new(c.name, frame=q)
        m.camera = c
    sc.camera = camA

    sc.render.engine = 'BLENDER_EEVEE_NEXT'
    sc.eevee.taa_render_samples = 12
    sc.eevee.use_shadows = True
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Punchy'
    sc.render.resolution_x, sc.render.resolution_y = 1920, 1080
    with open(os.path.join(AQUI, '..', '..', 'dados', 'abertura_raios.json'), 'w') as f:
        json.dump({'fps': 24, 'raios': RAIOS, 'quebra': QUEBRA, 'fim': FIM}, f)
    return sc


if __name__ == '__main__':
    args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else ['teste']
    sc = montar()
    if args[0] == 'teste':
        S = '/tmp/claude-0/-home-user-B-ias-magras-/1ec1e0ad-a38d-55a9-9e93-6eda9da8f7bf/scratchpad/'
        sc.render.resolution_percentage = 50
        for q in [int(x) for x in (args[1:] or ['50', '130', '160', '230', '290', '360'])]:
            sc.frame_set(q)
            sc.render.filepath = S + f'ab_{q:03d}.png'
            bpy.ops.render.render(write_still=True)
            print('QUADRO', q)
    elif args[0] == 'render':
        pasta = args[1]
        ini = int(args[2]) if len(args) > 2 else 1
        fim = int(args[3]) if len(args) > 3 else FIM
        os.makedirs(pasta, exist_ok=True)
        for q in range(ini, fim + 1):
            alvo = os.path.join(pasta, f'{q:04d}.png')
            if os.path.exists(alvo):
                continue
            sc.frame_set(q)
            sc.render.filepath = alvo
            bpy.ops.render.render(write_still=True)
            print('QUADRO', q, flush=True)
