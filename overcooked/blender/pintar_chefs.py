#!/usr/bin/env python3
"""Pinta o chef branco na cor de cada empresa (multiplica a cor onde a máscara marca o corpo), uma vez só, em PIL.
Mesmo resultado do mix-blend-mode: multiply + mask do Remotion, sem o custo de compor isso em cada quadro.
Saída: video/remotion/public/overcooked/chefs/<empresa>/<anim>_<dir>.png"""
from pathlib import Path
from PIL import Image, ImageChops

D = Path(__file__).resolve().parents[2] / 'video' / 'remotion' / 'public' / 'overcooked' / 'chefs'
CORES = {'DeepSeek': '#4d6bfe', 'Claude': '#d97a47', 'GPT': '#10a37f', 'Gemini': '#8b5cf6'}
for emp, cor in CORES.items():
    out = D / emp
    out.mkdir(exist_ok=True)
    rgb = tuple(int(cor[i:i + 2], 16) for i in (1, 3, 5))
    for f in sorted((D / 'base').glob('*.png')):
        base = Image.open(f).convert('RGBA')
        a = Image.open(D / 'mascara' / f.name).convert('RGBA').getchannel('A')
        r, g, b, alfa = base.split()
        mult = ImageChops.multiply(Image.merge('RGB', (r, g, b)), Image.new('RGB', base.size, rgb))
        pint = Image.composite(mult, Image.merge('RGB', (r, g, b)), a)
        pint.putalpha(alfa)
        pint.save(out / f.name, optimize=True)
    print(emp, 'ok')
