"""Auxiliar: mostra peças ampliadas sobre fundo de grama. ver.py saida.png fator arq1 arq2 ..."""
import sys
from PIL import Image
sai, f = sys.argv[1], int(sys.argv[2]); ims = [Image.open(a).convert('RGBA') for a in sys.argv[3:]]
W = sum(i.width for i in ims) * f + 10 * (len(ims) + 1); H = max(i.height for i in ims) * f + 20
bg = Image.new('RGBA', (W, H), (120, 160, 80, 255)); x = 10
for i in ims:
    i = i.resize((i.width * f, i.height * f), Image.LANCZOS); bg.alpha_composite(i, (x, 10)); x += i.width + 10
bg.convert('RGB').save(sai)
