#!/usr/bin/env python3
"""DESENHA E ADIVINHA: transforma os traços de uma IA (JSON) em PNG 800x600, como a tela que as outras IAs veem.
Uso: python3 raster.py <tracos.json> <saida.png>   (tracos.json = lista de traços, na ordem em que foram feitos)
Traço: {"tipo": "linha"|"circulo"|"retangulo"|"poligono", "cor": nome da paleta, "espessura": 2-30, "preenchido": bool,
        "pontos": [[x,y],...] (linha/poligono), "centro": [x,y], "raio": r (circulo), "de": [x,y], "ate": [x,y] (retangulo)}"""
import json, sys
from PIL import Image, ImageDraw

PALETA = {'preto': '#111111', 'branco': '#ffffff', 'cinza': '#8a8a8a', 'vermelho': '#e53935', 'laranja': '#fb8c00', 'amarelo': '#fdd835',
          'verde': '#43a047', 'azul': '#1e88e5', 'azul claro': '#81d4fa', 'roxo': '#8e24aa', 'rosa': '#f48fb1', 'marrom': '#795548', 'pele': '#f5c79c'}
W, H, S = 800, 600, 2


def cor(t):
    c = str(t.get('cor', 'preto')).lower().strip()
    return PALETA.get(c, c if c.startswith('#') and len(c) in (4, 7) else '#111111')


def pt(p):
    return (max(-50, min(W + 50, float(p[0]))) * S, max(-50, min(H + 50, float(p[1]))) * S)


def desenhar(tracos, saida):
    im = Image.new('RGB', (W * S, H * S), 'white')
    d = ImageDraw.Draw(im)
    for t in tracos:
        try:
            c, e = cor(t), max(1, min(40, float(t.get('espessura', 6)))) * S
            tipo, cheio = t.get('tipo', 'linha'), bool(t.get('preenchido'))
            if tipo == 'circulo':
                (x, y), r = pt(t['centro']), max(1, min(400, float(t['raio']))) * S
                d.ellipse((x - r, y - r, x + r, y + r), fill=c if cheio else None, outline=c, width=int(e))
            elif tipo == 'retangulo':
                (x0, y0), (x1, y1) = pt(t['de']), pt(t['ate'])
                d.rectangle((min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1)), fill=c if cheio else None, outline=c, width=int(e))
            elif tipo == 'poligono' and cheio:
                d.polygon([pt(p) for p in t['pontos'][:200]], fill=c, outline=c)
            else:
                ps = [pt(p) for p in t['pontos'][:200]]
                if tipo == 'poligono': ps.append(ps[0])
                if len(ps) == 1: ps = ps * 2
                d.line(ps, fill=c, width=int(e), joint='curve')
                for x, y in (ps[0], ps[-1]):
                    d.ellipse((x - e / 2, y - e / 2, x + e / 2, y + e / 2), fill=c)
        except Exception:  # noqa: BLE001  traço malformado: a IA "errou o pincel", só não aparece
            pass
    im.resize((W, H), Image.LANCZOS).save(saida)


if __name__ == '__main__':
    desenhar(json.load(open(sys.argv[1])), sys.argv[2])
