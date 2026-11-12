#!/usr/bin/env python3
"""Gameplay do vídeo do Pokémon refeita a partir do trajeto (cada botão apertado), no emulador determinístico.
  estados <ia>                 : passa a partida inteira salvando um estado a cada 2000 passos (confere a posição)
  clip <ia> <ini> <n> <K> <out>: grava os passos [ini, ini+n) — K=0 tempo real (30 fps), K>=1 um quadro a cada K passos
Trajetos: /home/user/pk_dados/<ia>/trajeto.jsonl.gz (branches pokemon-resultado-*). ROM fora do git."""
import gzip, json, os, subprocess, sys, zlib
from pathlib import Path
sys.path.insert(0, '/home/user/B-ias-magras-/pokemon')
os.environ.setdefault('POKEMON_ROM', '/home/user/B-ias-magras-/pokemon/rom/pokemon_firered.gba')
from ambiente_firered import FireRed, BOTOES, SEGURA, PASSO  # noqa: E402

DADOS = Path('/home/user/pk_dados')
CADA = 2000


def trajeto(ia):
    return [json.loads(l) for l in gzip.open(DADOS / ia / 'trajeto.jsonl.gz', 'rt')]


def passo(env, b, pegar=None):
    """igual ao FireRed.step (mesmas chamadas ao núcleo), com captura opcional de quadros intermediários"""
    k = BOTOES[b]
    if k is not None:
        env.core.set_keys(k)
    for i in range(PASSO):
        if i == SEGURA:
            env.core.set_keys()
        env.core.run_frame()
        if pegar is not None and i % pegar[1] == pegar[1] - 1:
            pegar[0](env)
    env.core.set_keys()
    env.quadro += PASSO


def estados(ia):
    T = trajeto(ia)
    pasta = DADOS / ia / 'estados'
    pasta.mkdir(parents=True, exist_ok=True)
    env = FireRed(); env.reset()
    (pasta / '0.st').write_bytes(zlib.compress(env.salvar_estado(), 6))
    for r in T:
        passo(env, r['b'])
        if r['p'] % CADA == 0:
            i = env.info()
            ok = (tuple(i['mapa']), i['x'], i['y']) == (tuple(r['mapa']), r['x'], r['y'])
            (pasta / f"{r['p']}.st").write_bytes(zlib.compress(env.salvar_estado(), 6))
            print(r['p'], 'ok' if ok else f'DIVERGIU {i["mapa"]} {i["x"]},{i["y"]} x {r["mapa"]} {r["x"]},{r["y"]}', flush=True)
    print('FIM', len(T))


TL = {'claude': '/home/user/pk_dados/mp4/partida_claude.mp4', 'gemini': '/home/user/pk_dados/mp4/partida_gemini.mp4'}


def clip_tl(ia, ini, n, K, out):
    """da gravação original da partida (1 quadro a cada 8 passos): quadro i = passo 8*(i+1)"""
    T = trajeto(ia)
    i0, s = max(0, ini // 8 - 1), max(1, K // 8)
    i1 = i0 + n // 8
    sel = f"select='between(n\\,{i0}\\,{i1 - 1})*not(mod(n-{i0}\\,{s}))',setpts=N/30/TB,scale=960:640:flags=neighbor"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', TL[ia], '-vf', sel, '-an', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', out], check=True)
    meta = []
    for i in range(i0, i1, s):
        r = T[min(len(T) - 1, 8 * (i + 1) - 1)]
        t = r['time'][0] if r['time'] else None
        meta.append([r['q'], t['nivel'] if t else 0, r['dinheiro'], r['pokedex_capturados'], t['hp'] if t else 0, t['hp_max'] if t else 0, r['mapa']])
    Path(out).with_suffix('.json').write_text(json.dumps(meta))


def clip(ia, ini, n, K, out):
    est = DADOS / ia / 'estados' / f'{(ini // CADA) * CADA}.st'
    if ia in TL and (K >= 8 and K % 8 == 0 or not est.exists()):
        print('  (da gravação original)', ia, ini, flush=True)
        return clip_tl(ia, ini, n, max(8, (K // 8) * 8), out)
    T = trajeto(ia)
    pasta = DADOS / ia / 'estados'
    base = (ini // CADA) * CADA
    env = FireRed(); env.reset()
    env.carregar_estado(zlib.decompress((pasta / f'{base}.st').read_bytes()))
    for r in T[base:ini]:  # T[j] é o passo j+1
        passo(env, r['b'])
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '240x160', '-r', '30', '-i', '-',
                           '-vf', 'scale=960:640:flags=neighbor', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    meta = []  # por quadro do clipe: [quadro do jogo, nível, dinheiro, capturados, hp, hp_max, mapa]
    def grava(e, r):
        ff.stdin.write(e.tela().tobytes())
        t = r['time'][0] if r['time'] else None
        meta.append([r['q'], t['nivel'] if t else 0, r['dinheiro'], r['pokedex_capturados'], t['hp'] if t else 0, t['hp_max'] if t else 0, r['mapa']])
    for j, r in enumerate(T[ini:ini + n]):
        if K <= 0:  # K=0: tempo real (1 quadro a cada 2 do GBA); K=-k: 1 a cada k quadros do GBA (k/2 vezes mais rápido)
            passo(env, r['b'], (lambda e, r=r: grava(e, r), max(2, -K)))
        else:
            passo(env, r['b'])
            if j % K == 0:
                grava(env, r)
    ff.stdin.close(); ff.wait()
    Path(out).with_suffix('.json').write_text(json.dumps(meta))


def lote():
    import importlib.util
    spec = importlib.util.spec_from_file_location('r', '/home/user/B-ias-magras-/video/roteiro/roteiro_pokemon.py')
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    pasta = Path('/home/user/B-ias-magras-/video/remotion/public/pokemon/clips'); pasta.mkdir(parents=True, exist_ok=True)
    so = sys.argv[2:]
    for nome, (ia, ini, n, K) in m.CLIPS.items():
        out = pasta / f'{nome}.mp4'
        if (so and nome not in so and so != ['todos']) or (not so and out.exists()):
            continue
        clip(ia, ini, n, K, str(out)); print('clipe', nome, flush=True)


if __name__ == '__main__':
    if sys.argv[1] == 'lote':
        lote()
    elif sys.argv[1] == 'estados':
        estados(sys.argv[2])
    else:
        clip(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), sys.argv[6])
