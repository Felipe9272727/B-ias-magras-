#!/usr/bin/env python3
"""Renderiza as tomadas 3D de ilha/dados/tomadas3.json com o diretor (cena/gameplay.py), em N processos.

Retomável: cada tomada guarda spec.json; se a especificação mudou, os quadros velhos são apagados.
No fim de cada tomada completa: video/remotion/public/ilha/3d/<id>.mp4 (24 fps) e <id>.json (posições na tela).

Uso: python3 ilha/blender/render3d.py [N=2] [--teste] [--so id1,id2]
  --teste  3 quadros por tomada em 50% e uma folha de contato em ilha/render/3d_teste.jpg
"""
import json, os, shutil, subprocess, sys, tempfile, time
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
LISTA = REPO / 'ilha' / 'dados' / 'tomadas3.json'
RENDER = REPO / 'ilha' / 'render' / '3d'
PUB = REPO / 'video' / 'remotion' / 'public' / 'ilha' / '3d'
DIRETOR = REPO / 'ilha' / 'blender' / 'cena' / 'gameplay.py'


def completa(spec):
    d = RENDER / spec['id']
    if spec.get('modo') == 'placa':
        return (d / 'placa.png').exists() and (d / 'pos.json').exists()
    return all((d / f'{q:04d}.png').exists() for q in range(1, spec['quadros'] + 1)) and (d / 'pos.json').exists()


def preparar(spec):
    """Apaga quadros de uma versão antiga da tomada."""
    d = RENDER / spec['id']
    d.mkdir(parents=True, exist_ok=True)
    f = d / 'spec.json'
    atual = json.dumps(spec, sort_keys=True)
    if f.exists() and f.read_text() != atual:
        for p in d.glob('*.png'):
            p.unlink()
        if (d / 'placa.png').exists():
            (d / 'placa.png').unlink()
        for p in (PUB / f"{spec['id']}.mp4", PUB / f"{spec['id']}.jpg", PUB / f"{spec['id']}.json"):
            if p.exists():
                p.unlink()
    f.write_text(atual)


def codificar(spec):
    d = RENDER / spec['id']
    PUB.mkdir(parents=True, exist_ok=True)
    if spec.get('modo') == 'placa':  # cenário em JPG (leve) + trilha dos atores
        jpg = PUB / f"{spec['id']}.jpg"
        if not jpg.exists():
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(d / 'placa.png'), '-q:v', '2', str(jpg)], check=True)
        shutil.copy(d / 'pos.json', PUB / f"{spec['id']}.json")
        return
    mp4 = PUB / f"{spec['id']}.mp4"
    if not mp4.exists():
        tmp = mp4.with_suffix('.tmp.mp4')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', str(d / '%04d.png'),
                        '-vf', 'scale=1920:1080:flags=lanczos', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-g', '24', str(tmp)], check=True)
        tmp.rename(mp4)
    shutil.copy(d / 'pos.json', PUB / f"{spec['id']}.json")


def main():
    args = [a for a in sys.argv[1:]]
    teste = '--teste' in args
    so = None
    if '--so' in args:
        so = set(args[args.index('--so') + 1].split(','))
    nums = [a for i, a in enumerate(args) if a.isdigit() and (i == 0 or args[i - 1] not in ('--lista', '--so'))]
    n = int(nums[0]) if nums else 2
    lista_arq = Path(args[args.index('--lista') + 1]) if '--lista' in args else LISTA
    specs = json.loads(lista_arq.read_text())
    if so:
        specs = [s for s in specs if s['id'] in so]
    if teste:
        pasta = RENDER.parent / '3d_teste'
        shutil.rmtree(pasta, ignore_errors=True)
        pasta.mkdir(parents=True)
        lista = pasta / 'lista.json'
        lista.write_text(json.dumps([dict(s, teste=[1, max(1, s['quadros'] // 2), s['quadros']]) for s in specs]))
        subprocess.run(['xvfb-run', '-a', '-s', '-screen 0 1920x1080x24', 'blender', '-b', '-P', str(DIRETOR), '--',
                        str(lista), str(pasta), '', '--teste'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        imgs = []
        for s in specs:
            for q in (1, max(1, s['quadros'] // 2), s['quadros']):
                p = pasta / s['id'] / f'{q:04d}.png'
                if p.exists():
                    imgs.append(p)
        if imgs:
            from PIL import Image, ImageDraw
            cols, w, h = 3, 480, 270
            rows = (len(imgs) + cols - 1) // cols
            folha = Image.new('RGB', (cols * w, rows * h), 'black')
            for i, p in enumerate(imgs):
                im = Image.open(p).convert('RGB').resize((w, h))
                ImageDraw.Draw(im).text((6, 6), f'{p.parent.name} {p.stem}', fill='yellow')
                folha.paste(im, ((i % cols) * w, (i // cols) * h))
            folha.save(RENDER.parent / '3d_teste.jpg', quality=85)
        print('TESTE', RENDER.parent / '3d_teste.jpg')
        return
    for s in specs:
        preparar(s)
    pend = [s for s in specs if not completa(s)]
    for s in specs:
        if completa(s):
            codificar(s)
    print(f'{len(specs)} tomadas; {len(pend)} pendentes ({sum(s["quadros"] for s in pend)} quadros), {n} processos', flush=True)
    if not pend:
        print('PRONTO')
        return
    # divide por carga (quadros), maiores primeiro
    grupos = [[] for _ in range(min(n, len(pend)))]
    carga = [0] * len(grupos)
    for s in sorted(pend, key=lambda s: -s['quadros']):
        i = carga.index(min(carga))
        grupos[i].append(s)
        carga[i] += s['quadros']
    procs = []
    tmpd = Path(tempfile.mkdtemp(prefix='r3d_'))
    for i, g in enumerate(grupos):
        lista = tmpd / f'lista{i}.json'
        lista.write_text(json.dumps(g))
        log = open(REPO / 'ilha' / 'logs' / f'render3d_{i}.log', 'w')
        procs.append((subprocess.Popen(['xvfb-run', '-a', '-s', '-screen 0 1920x1080x24', 'blender', '-b', '-P', str(DIRETOR),
                                        '--', str(lista), str(RENDER)], stdout=log, stderr=subprocess.STDOUT), g))
    feitos = set()
    while procs:
        time.sleep(20)
        for s in pend:
            if s['id'] not in feitos and completa(s):
                codificar(s)
                feitos.add(s['id'])
                print('TOMADA', s['id'], flush=True)
        procs = [(p, g) for p, g in procs if p.poll() is None]
    for s in pend:
        if s['id'] not in feitos and completa(s):
            codificar(s)
            print('TOMADA', s['id'], flush=True)
    faltam = [s['id'] for s in specs if not completa(s)]
    print('PRONTO' if not faltam else f'FALTAM {faltam}', flush=True)


if __name__ == '__main__':
    main()
