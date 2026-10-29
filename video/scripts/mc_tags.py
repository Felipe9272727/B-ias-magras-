#!/usr/bin/env python3
"""Etiqueta "SEGUINDO <IA>" / "NOS OLHOS DE <IA>" aplicada na pós (ffmpeg overlay) sobre o vídeo já renderizado, sem
re-render: gera os PNGs (cabeça da skin + nome na cor da IA) e imprime o filtro do ffmpeg com os intervalos de cada cena
replay de abertura.json. Uso: mc_tags.py <pasta mc/video|mc/short> <largura> -> escreve tags_filtro.txt na pasta."""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parents[2]
PUB = RAIZ / 'video' / 'remotion' / 'public' / 'mc'
CORES = {'DeepSeek': '#4d6bfe', 'Qwen': '#8b6cff', 'Claude': '#d97757', 'GPT': '#10a37f', 'GLM': '#3d7bff', 'MiMo': '#ff6900'}
FONTE = '/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'


def etiqueta(nome, modo, esc):
    h = int(56 * esc); cab = int(40 * esc); pad = int(10 * esc)
    f1 = ImageFont.truetype(FONTE, int(17 * esc)); f2 = ImageFont.truetype(FONTE, int(30 * esc))
    rot = 'NOS OLHOS DE' if modo == 'olhos' else 'SEGUINDO'
    w1 = f1.getlength(rot); w2 = f2.getlength(nome)
    w = int(pad + cab + pad + max(w1, w2) + pad * 2)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=int(8 * esc), fill=(0, 0, 0, 150))
    d.rectangle([0, int(6 * esc), int(5 * esc), h - int(6 * esc)], fill=CORES[nome])
    skin = Image.open(RAIZ / 'minecraft' / 'skins' / f'{nome}.png').convert('RGBA')
    face = skin.crop((8, 8, 16, 16)); face.alpha_composite(skin.crop((40, 8, 48, 16)))
    im.paste(face.resize((cab, cab), Image.NEAREST), (pad + int(4 * esc), (h - cab) // 2))
    x = pad * 2 + cab + int(4 * esc)
    d.text((x, int(5 * esc)), rot, font=f1, fill=CORES[nome])
    d.text((x, int(20 * esc)), nome, font=f2, fill='white', stroke_width=max(1, int(2 * esc)), stroke_fill='black')
    return im


def main():
    pasta = PUB / sys.argv[1].split('/')[-1]; larg = int(sys.argv[2]); esc = 1.5 if larg > 1200 else 2.1
    d = json.load(open(pasta / 'abertura.json'))
    tags = PUB / 'tags'; usos = {}; a = 0
    for c in d['cenas']:
        v = c['visual']; cam = v.get('camera', '')
        if v['tipo'] == 'replay' and ':' in cam:
            modo, nome = cam.split(':', 1)
            if nome in CORES: usos.setdefault((nome, 'olhos' if modo == 'olhos' else 'segue'), []).append((a / 30 + 0.3, (a + c['dur']) / 30 - 0.15))
        a += c['dur']
    entradas, filtros, ant = [], [], '0:v'
    for i, ((nome, modo), ints) in enumerate(sorted(usos.items())):
        arq = tags / f'{nome}_{modo}_{larg}.png'; etiqueta(nome, modo, esc).save(arq); entradas.append(str(arq))
        en = '+'.join(f'between(t,{x:.2f},{y:.2f})' for x, y in ints)
        y = 64 if larg > 1200 else 230
        filtros.append(f"[{ant}][{i + 1}:v]overlay=x=(W-w)/2:y={y}:enable='{en}'[t{i}]"); ant = f't{i}'
    (pasta / 'tags_entradas.txt').write_text('\n'.join(entradas))
    (pasta / 'tags_filtro.txt').write_text(';'.join(filtros) + f';[{ant}]null[vt]')
    print(len(entradas), 'etiquetas,', sum(len(v) for v in usos.values()), 'cenas')


if __name__ == '__main__':
    main()
