"""Gera os sprites 3D do vídeo estilo Age of Empires IV.
Uso: blender -b -P age/blender/gerar.py -- [--teste] [--so nome1,nome2] [--saida DIR]
Saída: video/remotion/public/age/pecas/<nome>.png + pecas.json {px_m, px_m_unidades, pecas:{nome:{w,h,ancora,px_m}}}"""
import bpy, json, os, subprocess, sys, time
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
import base as B  # noqa: E402
import predios  # noqa: E402

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
teste = '--teste' in args
so = args[args.index('--so') + 1].split(',') if '--so' in args else None
cor_so = args[args.index('--cor') + 1].split(',') if '--cor' in args else None
saida = args[args.index('--saida') + 1] if '--saida' in args else B.SAIDA
os.makedirs(saida, exist_ok=True)

# lista de trabalhos: (nome_arquivo, construtor, jogador|None, px_m, nome_base)
trabalhos = []
def reg(base, fn, colorido, px, sufixos=None):
    if so and base not in so and not any(s == base.split('_')[0] for s in so):
        return
    if colorido:
        for c in (cor_so or B.COR):
            trabalhos.append((f'{base}_{c}', fn, c, px, base))
    else:
        trabalhos.append((base, fn, None, px, base))

for nome, (fn, col) in predios.PREDIOS.items():
    reg(nome, fn, col, B.PX_PREDIOS)
try:
    import unidades
    for nome, (fn, col, px) in unidades.PECAS.items():
        reg(nome, fn, col, px)
except ImportError:
    pass

sc = B.iniciar(teste)
meta_path = os.path.join(saida, 'pecas.json')
meta = json.load(open(meta_path)) if os.path.exists(meta_path) else {}
meta.update({'px_m': B.PX_PREDIOS, 'px_m_unidades': B.PX_UNID})
meta.setdefault('pecas', {})
t0 = time.time()
for (arq, fn, cor, px, base) in trabalhos:
    B.limpar_peca()
    if cor:
        B.set_jog(cor)
    fn()
    tmp = os.path.join(B.TMP, 'q.png')
    r = B.renderizar_peca(sc, arq, px, tmp)
    out = subprocess.run(['/usr/bin/python3', os.path.join(AQUI, 'pos.py'), tmp, os.path.join(saida, arq + '.png'),
                          str(B.SS), str(r['ancora'][0]), str(r['ancora'][1])], capture_output=True, text=True, check=True)
    info = json.loads(out.stdout.strip().splitlines()[-1])
    info['px_m'] = px
    meta['pecas'][arq] = info
    print('peca', arq, info['w'], info['h'], f'{time.time()-t0:.0f}s', flush=True)
    os.remove(tmp)
    json.dump(meta, open(meta_path, 'w'))
