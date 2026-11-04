"""Pós-processo (Python do sistema, com PIL): corta pelo canal alfa, reduz SS× com Lanczos e grava PNG final.
Uso: pos.py <entrada.png> <saida.png> <ss> <ancora_x> <ancora_y>   -> imprime JSON {w,h,ancora}"""
import sys, json
from PIL import Image
ent, sai, ss, ax, ay = sys.argv[1], sys.argv[2], int(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5])
im = Image.open(ent).convert('RGBA')
a = im.split()[3].point(lambda v: 255 if v > 3 else 0)
bb = a.getbbox() or (0, 0, im.width, im.height)
x0 = max(0, (bb[0] // ss) * ss - ss); y0 = max(0, (bb[1] // ss) * ss - ss)
x1 = min(im.width, -(-bb[2] // ss) * ss + ss); y1 = min(im.height, -(-bb[3] // ss) * ss + ss)
x1 = x0 + -(-(x1 - x0) // ss) * ss; y1 = y0 + -(-(y1 - y0) // ss) * ss
im = im.crop((x0, y0, x1, y1))
# premultiplicar para não sujar a borda ao reduzir
px = im.load()
w, h = im.size
r, g, b, al = im.split()
from PIL import ImageChops
pm = Image.merge('RGBA', (ImageChops.multiply(r, al), ImageChops.multiply(g, al), ImageChops.multiply(b, al), al))
pm = pm.resize((w // ss, h // ss), Image.LANCZOS)
r, g, b, al = pm.split()
def un(c):
    return Image.eval(Image.merge('LA', (c, al)), lambda v: v).split()[0]
rr, gg, bb2 = r.load(), g.load(), b.load()
aa = al.load()
out = Image.new('RGBA', pm.size)
po = out.load()
for yy in range(pm.height):
    for xx in range(pm.width):
        A = aa[xx, yy]
        if A == 0:
            po[xx, yy] = (0, 0, 0, 0)
        else:
            f = 255.0 / A
            po[xx, yy] = (min(255, int(rr[xx, yy] * f + .5)), min(255, int(gg[xx, yy] * f + .5)), min(255, int(bb2[xx, yy] * f + .5)), A)
out.save(sai, optimize=True)
print(json.dumps({'w': out.width, 'h': out.height, 'ancora': [round((ax - x0) / ss, 1), round((ay - y0) / ss, 1)]}))
