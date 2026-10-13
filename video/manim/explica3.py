"""Explicações animadas do vídeo 3 (Jogos Vorazes das IAs), em Manim, no estilo do vídeo (fundo escuro, Inter).

Cada cena dura DUR segundos (variável de ambiente) para casar com a narração; as animações se distribuem nesse tempo.
  Status   fome e sede subindo turno a turno, vida caindo quando uma chega no máximo; frio à noite
  Mapa     as 10 regiões da ilha; água à vontade só no Lago (um pouco na Caverna e na Montanha)
  Eventos  linha do tempo da arena (paraquedas, regra da dupla, maré, névoa) e a névoa fechando a ilha
  Mortes   placar das 11 mortes por causa, com os retratos

Uso: DUR=12 manim -qh --fps 24 -r 1920,1080 video/manim/explica3.py Status -o status.mp4
"""
import json
import os
from pathlib import Path

from manim import *

RAIZ = Path(__file__).resolve().parents[2]
ILHA = json.loads((RAIZ / 'ilha' / 'dados' / 'ilha.json').read_text())
RETRATOS = RAIZ / 'video' / 'remotion' / 'public' / 'ilha' / 'sprites'
DUR = float(os.environ.get('DUR', '12'))
FONTE = 'Inter'
FUNDO = '#0b1018'
COR = {'vida': '#5fe37a', 'fome': '#ffb26b', 'sede': '#5cc8ff', 'nevoa': '#b06cff', 'ouro': '#ffcc33', 'tinta': '#f0f3df',
       'apagado': '#4a5566', 'vermelho': '#ff4b4b'}
config.background_color = FUNDO


def txt(s, tam=36, cor=COR['tinta'], peso=BOLD):
    return Text(s, font=FONTE, font_size=tam, color=cor, weight=peso)


class Base(Scene):
    """Distribui o tempo: cada passo recebe uma fração de DUR (soma das frações = 1)."""

    def tempo(self, fracao):
        return max(0.15, DUR * fracao)

    def fundo(self):
        grade = NumberPlane(x_range=[-10, 10, 1], y_range=[-6, 6, 1],
                            background_line_style={'stroke_color': '#1a2433', 'stroke_width': 1, 'stroke_opacity': 0.6},
                            axis_config={'stroke_opacity': 0})
        self.add(grade)


class Status(Base):
    def construct(self):
        self.fundo()
        titulo = txt('COMO SE MORRE NA ILHA', 46, COR['ouro'], HEAVY).to_edge(UP, buff=0.6)
        self.play(Write(titulo), run_time=self.tempo(0.06))
        nomes = [('VIDA', 'vida', 100), ('FOME', 'fome', 17), ('SEDE', 'sede', 21)]
        barras, valores, rotulos, nums = [], [], [], []
        L = 9.0
        for i, (nome, k, v0) in enumerate(nomes):
            y = 1.3 - i * 1.35
            r = txt(nome, 40, COR[k], HEAVY).move_to([-5.6, y, 0])
            moldura = RoundedRectangle(width=L, height=0.62, corner_radius=0.18, stroke_color='#ffffff', stroke_width=3,
                                       stroke_opacity=0.5).move_to([0.6, y, 0])
            vt = ValueTracker(v0)
            barra = always_redraw(lambda vt=vt, k=k, y=y: RoundedRectangle(
                width=max(0.05, L * vt.get_value() / 100), height=0.62, corner_radius=0.18, fill_color=COR[k],
                fill_opacity=0.9, stroke_width=0).align_to(np.array([0.6 - L / 2, y, 0]), LEFT).set_y(y))
            num = always_redraw(lambda vt=vt, y=y: txt(f'{int(round(vt.get_value()))}', 36).move_to([5.8, y, 0]))
            barras.append(barra); valores.append(vt); rotulos.append(r); nums.append(num)
            self.play(FadeIn(r, shift=RIGHT * 0.3), Create(moldura), FadeIn(barra), FadeIn(num), run_time=self.tempo(0.04))
        turno = txt('TURNO 1', 34, COR['tinta']).to_corner(UR, buff=0.6).shift(DOWN * 0.9)
        self.play(FadeIn(turno), run_time=self.tempo(0.03))
        vida, fome, sede = valores
        f, s, v = 17, 21, 100
        passos = 9
        for k in range(2, 2 + passos):  # sem comer nem beber: tudo sobe
            f, s = min(100, f + 7), min(100, s + 11)
            if s >= 100:
                v = max(0, v - 15)
            novo = txt(f'TURNO {k}', 34).to_corner(UR, buff=0.6).shift(DOWN * 0.9)
            self.play(fome.animate.set_value(f), sede.animate.set_value(s), vida.animate.set_value(v),
                      Transform(turno, novo), run_time=self.tempo(0.045))
        aviso = txt('chegou em 100 → começa a perder vida', 38, COR['vermelho'], HEAVY).to_edge(DOWN, buff=1.25)
        self.play(Indicate(rotulos[2], color=COR['vermelho']), FadeIn(aviso, shift=UP * 0.2), run_time=self.tempo(0.08))
        self.play(vida.animate.set_value(max(0, v - 25)), run_time=self.tempo(0.08))
        lua = VGroup(Circle(radius=0.42, fill_color='#cfe0ff', fill_opacity=1, stroke_width=0),
                     Circle(radius=0.36, fill_color=FUNDO, fill_opacity=1, stroke_width=0).shift(RIGHT * 0.2 + UP * 0.1))
        frio = txt('à noite, sem caverna ou fogueira: frio também tira vida', 32, '#9fb8ff')
        noite = VGroup(lua, frio).arrange(RIGHT, buff=0.35).next_to(aviso, DOWN, buff=0.35)
        self.play(FadeIn(noite, shift=UP * 0.2), run_time=self.tempo(0.07))
        self.wait(max(0, DUR - self.renderer.time))


def ilha_mob(escala=0.024, centro=(0.0, -0.3)):
    """Contorno da ilha + regiões (círculos) a partir de ilha.json. Devolve (grupo, {id: círculo}, rótulos)."""
    cx, cy = centro
    pts = []
    for z in ILHA['zonas']:
        for a in np.linspace(0, TAU, 24, endpoint=False):
            pts.append((z['c'][0] + np.cos(a) * z['r'] * 1.35, z['c'][1] + np.sin(a) * z['r'] * 1.35))
    pts = np.array(pts)
    centro_m = pts.mean(axis=0)
    ang = np.arctan2(pts[:, 1] - centro_m[1], pts[:, 0] - centro_m[0])
    contorno = []
    for a in np.linspace(-PI, PI, 72, endpoint=False):  # casca: ponto mais distante em cada direção
        sel = np.abs(((ang - a + PI) % TAU) - PI) < 0.09
        if sel.any():
            d = np.hypot(*(pts[sel] - centro_m).T)
            p = pts[sel][d.argmax()]
            contorno.append([cx + p[0] * escala, cy + p[1] * escala, 0])
    terra = Polygon(*contorno, fill_color='#2f6b3a', fill_opacity=1, stroke_color='#e8d9a8', stroke_width=8).round_corners(0.25)
    zonas, nomes = {}, VGroup()
    for z in ILHA['zonas']:
        c = Circle(radius=max(0.32, z['r'] * escala * 1.05), color='#ffffff', stroke_width=3, stroke_opacity=0.7,
                   fill_color='#1d4a27', fill_opacity=0.55).move_to([cx + z['c'][0] * escala, cy + z['c'][1] * escala, 0])
        zonas[z['id']] = c
        n = txt(z['nome'], 22, COR['tinta'], BOLD)
        v = np.array([z['c'][0], z['c'][1] - 5, 0.0])
        v = v / (np.linalg.norm(v) + 1e-6) if np.linalg.norm(v) > 1 else DOWN
        n.next_to(c, v, buff=0.08)
        if z['id'] == 'caverna':
            n.next_to(c, LEFT, buff=0.1)
        nomes.add(n)
    return VGroup(terra, *zonas.values()), zonas, nomes


class Mapa(Base):
    def construct(self):
        self.fundo()
        titulo = txt('A ILHA: 10 REGIÕES', 46, COR['ouro'], HEAVY).to_edge(UP, buff=0.5)
        grupo, zonas, nomes = ilha_mob(escala=0.0245, centro=(0.9, -0.55))
        mar = Rectangle(width=20, height=12, fill_color='#123a5c', fill_opacity=1, stroke_width=0)
        self.add(mar)
        self.play(Write(titulo), DrawBorderThenFill(grupo[0]), run_time=self.tempo(0.12))
        self.play(LaggedStart(*[GrowFromCenter(c) for c in zonas.values()], lag_ratio=0.15), run_time=self.tempo(0.12))
        self.play(LaggedStart(*[FadeIn(n) for n in nomes], lag_ratio=0.08), run_time=self.tempo(0.1))
        seco = [z for z in zonas if z not in ('lago', 'caverna', 'montanha')]
        self.play(*[zonas[z].animate.set_fill('#5a4a2a', 0.75) for z in seco], run_time=self.tempo(0.08))
        def gota(raio):
            return VGroup(Circle(radius=raio, fill_color=COR['sede'], fill_opacity=1, stroke_width=0),
                          Triangle(fill_color=COR['sede'], fill_opacity=1, stroke_width=0).scale(raio * 0.9).shift(UP * raio * 0.95))
        lago = zonas['lago']
        g1 = gota(0.34).move_to(lago.get_center())
        self.play(lago.animate.set_fill(COR['sede'], 0.9).scale(1.25), FadeIn(g1, scale=0.5), run_time=self.tempo(0.09))
        selo = txt('ÁGUA À VONTADE', 34, COR['sede'], HEAVY).next_to(lago, LEFT, buff=0.3)
        self.play(FadeIn(selo, shift=RIGHT * 0.2), Flash(lago, color=COR['sede'], line_length=0.4), run_time=self.tempo(0.08))
        pouca = VGroup()
        for z in ('caverna', 'montanha'):
            g = gota(0.14).move_to(zonas[z].get_center())
            pouca.add(g)
            self.play(zonas[z].animate.set_fill('#2e6f8f', 0.8), FadeIn(g, scale=0.5), run_time=self.tempo(0.05))
        s2 = txt('um pouco d\'água', 26, '#9fdcff').next_to(zonas['caverna'], LEFT, buff=0.15).shift(UP * 0.45)
        self.play(FadeIn(s2), run_time=self.tempo(0.05))
        s3 = txt('o resto: seco', 30, '#e7c98a', HEAVY).to_corner(DR, buff=0.6)
        self.play(FadeIn(s3, shift=UP * 0.2), run_time=self.tempo(0.06))
        self.wait(max(0, DUR - self.renderer.time))


class Eventos(Base):
    def construct(self):
        self.fundo()
        titulo = txt('A ARENA TAMBÉM JOGA', 46, COR['ouro'], HEAVY).to_edge(UP, buff=0.5)
        self.play(Write(titulo), run_time=self.tempo(0.06))
        linha = NumberLine(x_range=[1, 10, 1], length=12, color='#8aa0b8', include_numbers=False).shift(UP * 1.6)
        dias = VGroup(*[txt(f'D{d}', 24, '#8aa0b8').next_to(linha.n2p(d), DOWN, buff=0.15) for d in range(1, 11)])
        self.play(Create(linha), FadeIn(dias), run_time=self.tempo(0.07))
        eventos = [(2, 'paraquedas', COR['tinta']), (3, 'regra da dupla', COR['ouro']), (4, 'maré', COR['sede']),
                   (6, 'névoa', COR['nevoa'])]
        for i, (d, nome, cor) in enumerate(eventos):
            p = Dot(linha.n2p(d), radius=0.13, color=cor)
            r = txt(nome, 26, cor, HEAVY).next_to(p, UP, buff=0.2 + (0.55 if i % 2 else 0))
            self.play(GrowFromCenter(p), FadeIn(r, shift=DOWN * 0.15), run_time=self.tempo(0.06))
        grupo, zonas, nomes = ilha_mob(escala=0.017, centro=(0.0, -1.55))
        self.play(FadeIn(grupo), run_time=self.tempo(0.06))
        ondas = [('dia 6', ['ruinas', 'lago']), ('dia 7', ['montanha', 'caverna']), ('dia 8', ['floresta', 'campo'])]
        rot = None
        for nome, zs in ondas:
            novo = txt(nome, 30, COR['nevoa'], HEAVY).next_to(grupo, RIGHT, buff=0.6)
            anims = [zonas[z].animate.set_fill(COR['nevoa'], 0.85) for z in zs]
            anims.append(FadeIn(novo) if rot is None else Transform(rot, novo))
            self.play(*anims, run_time=self.tempo(0.09))
            rot = rot or novo
        centro = zonas['cornucopia']
        self.play(Indicate(centro, color=COR['ouro'], scale_factor=1.5), run_time=self.tempo(0.07))
        fim = txt('sobra só o centro', 30, COR['ouro'], HEAVY).next_to(grupo, LEFT, buff=0.6)
        self.play(FadeIn(fim), run_time=self.tempo(0.05))
        self.wait(max(0, DUR - self.renderer.time))


class Mortes(Base):
    def construct(self):
        self.fundo()
        log = json.loads((RAIZ / 'ilha' / 'logs' / 'partida.json').read_text())
        grupos = {}
        for t in log['turnos']:
            for e in t.get('eventos', []):
                if e['tipo'] == 'morte':
                    grupos.setdefault(e['causa'], []).append(e['vitima'])
        ordem = sorted(grupos, key=lambda c: -len(grupos[c]))
        rot = {'névoa': ('NÉVOA', COR['nevoa']), 'fome': ('FOME', COR['fome']), 'sede': ('SEDE', COR['sede']),
               'combate': ('COMBATE', COR['vermelho'])}
        total = sum(len(v) for v in grupos.values())
        titulo = txt(f'{total} MORTES', 60, COR['tinta'], HEAVY).to_edge(UP, buff=0.45)
        self.play(Write(titulo), run_time=self.tempo(0.08))
        for i, c in enumerate(ordem):
            y = 1.6 - i * 1.25
            nome, cor = rot.get(c, (c.upper(), COR['tinta']))
            r = txt(nome, 38, cor, HEAVY).move_to([-5.2, y, 0])
            barra = Rectangle(width=0.01, height=0.78, fill_color=cor, fill_opacity=0.85, stroke_width=0).align_to([-3.6, y, 0], LEFT).set_y(y)
            self.play(FadeIn(r, shift=RIGHT * 0.2), run_time=self.tempo(0.04))
            alvo = Rectangle(width=1.25 * len(grupos[c]), height=0.78, fill_color=cor, fill_opacity=0.85,
                             stroke_width=0).align_to([-3.6, y, 0], LEFT).set_y(y)
            n = txt(str(len(grupos[c])), 40, COR['tinta'], HEAVY).next_to(alvo, RIGHT, buff=0.25)
            self.play(Transform(barra, alvo), FadeIn(n), run_time=self.tempo(0.07))
            caras = Group()
            for j, tid in enumerate(grupos[c]):
                f = RETRATOS / f'{tid}_retrato.png'
                if f.exists():
                    im = ImageMobject(str(f)).set_height(0.66)
                    im.move_to([-3.6 + 0.62 + j * 1.25, y, 0])
                    caras.add(im)
            if len(caras):
                self.play(LaggedStart(*[FadeIn(cc, scale=0.6) for cc in caras], lag_ratio=0.2), run_time=self.tempo(0.06))
        destaque = txt('num battle royale, só 2 em combate', 34, COR['ouro'], HEAVY).to_edge(DOWN, buff=0.6)
        self.play(FadeIn(destaque, shift=UP * 0.2), run_time=self.tempo(0.08))
        self.wait(max(0, DUR - self.renderer.time))
