"""Folha de contato: uma amostra de cada peça (cor azul/sem cor) em _folha.png. Usa o Python do sistema (PIL)."""
import json, os
from PIL import Image
D = '/home/user/B-ias-magras-/video/remotion/public/age/pecas'
meta = json.load(open(f'{D}/pecas.json'))['pecas']
nomes = [n for n in meta if not any(n.endswith('_' + c) for c in ('vermelho', 'amarelo', 'verde', 'roxo', 'laranja'))]
# prédios ampliados 1x, resto 2x
itens = []
for n in nomes:
    im = Image.open(f'{D}/{n}.png').convert('RGBA')
    f = 1 if meta[n]['px_m'] <= 8 and im.width > 100 else 2 if meta[n]['px_m'] <= 8 else 1
    itens.append((n, im.resize((im.width * f, im.height * f), Image.LANCZOS)))
L = 1800; x = y = 8; linha = 0; pos = []
for n, im in itens:
    if x + im.width + 8 > L:
        x = 8; y += linha + 8; linha = 0
    pos.append((x, y, im)); x += im.width + 8; linha = max(linha, im.height)
H = y + linha + 8
bg = Image.new('RGBA', (L, H), (118, 158, 78, 255))
for (x, y, im) in pos:
    bg.alpha_composite(im, (x, y))
# faixa com as 6 cores do centro da cidade
cores = ['vermelho', 'azul', 'amarelo', 'verde', 'roxo', 'laranja']
fx = [Image.open(f'{D}/casa_{c}.png').convert('RGBA') for c in cores] + [Image.open(f'{D}/aldeao_andar1_{c}.png').convert('RGBA').resize((130, 120)) for c in cores]
W2 = sum(i.width for i in fx) + 8 * (len(fx) + 1); H2 = max(i.height for i in fx) + 16
b2 = Image.new('RGBA', (max(L, W2), H + H2), (118, 158, 78, 255)); b2.alpha_composite(bg, (0, 0))
xx = 8
for i in fx:
    b2.alpha_composite(i, (xx, H + 8)); xx += i.width + 8
b2.convert('RGB').save(f'{D}/_folha.png', optimize=True)
print(b2.size)
