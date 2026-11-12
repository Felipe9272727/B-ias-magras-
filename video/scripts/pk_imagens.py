#!/usr/bin/env python3
"""Imagens de dados do vídeo do Pokémon, tiradas dos trajetos: mapas de calor (onde cada IA pisou) e o gráfico de nível."""
import gzip, json
from collections import Counter
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

D = Path('/home/user/pk_dados')
OUT = Path('/home/user/B-ias-magras-/video/remotion/public/pokemon/img')
F = '/home/user/B-ias-magras-/video/remotion/public/fonts/Poppins-ExtraBold.ttf'
COR = {'claude': (232, 118, 58), 'gemini': (61, 123, 242), 'gpt': (25, 169, 116)}


def traj(ia):
    return [json.loads(l) for l in gzip.open(D / ia / 'trajeto.jsonl.gz', 'rt')]


def calor(ia, mapa, nome, marcas=(), lado=56, titulo=''):
    c = Counter((r['x'], r['y']) for r in traj(ia) if r['mapa'] == mapa)
    xs = [p[0] for p in c] + [m[0] for m in marcas]; ys = [p[1] for p in c] + [m[1] for m in marcas]
    x0, x1, y0, y1 = min(xs) - 1, max(xs) + 1, min(ys) - 1, max(ys) + 1
    W, H = (x1 - x0 + 1) * lado, (y1 - y0 + 1) * lado
    im = Image.new('RGB', (W, H), (11, 14, 28)); d = ImageDraw.Draw(im)
    mx = max(c.values())
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            d.rectangle([(x - x0) * lado, (y - y0) * lado, (x - x0 + 1) * lado - 2, (y - y0 + 1) * lado - 2], fill=(26, 31, 54))
    for (x, y), n in c.items():
        k = (n / mx) ** 0.35
        r, g, b = COR[ia]
        cor = (int(r + (255 - r) * k * 0.9), int(g * (1 - k * 0.3) + 230 * k * 0.6), int(b * (1 - k * 0.6)))
        d.rectangle([(x - x0) * lado, (y - y0) * lado, (x - x0 + 1) * lado - 2, (y - y0 + 1) * lado - 2], fill=cor)
    fnt = ImageFont.truetype(F, max(14, lado // 3))
    for (x, y, txt, cor) in marcas:
        cx, cy = (x - x0 + 0.5) * lado, (y - y0 + 0.5) * lado
        d.ellipse([cx - lado * 0.45, cy - lado * 0.45, cx + lado * 0.45, cy + lado * 0.45], outline=cor, width=6)
        d.text((cx + lado * 0.55, cy - lado * 0.3), txt, fill=cor, font=fnt, stroke_width=3, stroke_fill=(0, 0, 0))
    im.save(OUT / nome)
    tot = sum(c.values())
    print(nome, 'ladrilhos', len(c), 'passos', tot, 'mais pisado', c.most_common(1))


def nivel(ia='claude', nome='nivel_claude.png'):
    T = traj(ia)
    W, H = 1200, 700
    im = Image.new('RGB', (W, H), (11, 14, 28)); d = ImageDraw.Draw(im)
    fnt = ImageFont.truetype(F, 26)
    for h in range(0, 49, 8):
        x = 80 + (W - 120) * h / 48
        d.line([x, 40, x, H - 70], fill=(40, 46, 80), width=2); d.text((x - 20, H - 60), f'{h} h', fill=(160, 176, 216), font=fnt)
    for nv in range(5, 23, 4):
        y = H - 80 - (H - 140) * (nv - 5) / 17
        d.line([80, y, W - 40, y], fill=(40, 46, 80), width=2); d.text((20, y - 16), str(nv), fill=(160, 176, 216), font=fnt)
    pts = []
    for r in T[::50]:
        if r['time']:
            pts.append((80 + (W - 120) * (r['q'] / 216000) / 48, H - 80 - (H - 140) * (r['time'][0]['nivel'] - 5) / 17))
    d.line(pts, fill=COR[ia], width=8)
    im.save(OUT / nome); print(nome)


# mesas dos iniciais e onde cada um pegou (eventos "captura" dos logs)
def captura(ia):
    for l in open(D / ia / 'log.jsonl'):
        e = json.loads(l)
        if e.get('evento') == 'captura':
            return e['x'], e['y']


gx, gy = captura('gpt'); cx, cy = captura('claude')
calor('gemini', [4, 3], 'calor_lab_gemini.png', [(gx, gy, 'GPT pegou aqui', (25, 169, 116)), (cx, cy, 'Claude pegou aqui', (232, 118, 58))])
calor('gpt', [4, 3], 'calor_lab_gpt.png', [(gx, gy, 'pegou o Squirtle', (255, 200, 61))])
calor('claude', [3, 19], 'calor_rota1_claude.png', [], lado=26)
nivel()
