"""Animações em Manim do "60 Segundos das IAs", no estilo do canal (fundo escuro, Inter). Tudo lido dos logs (sessenta/logs).

Cada cena dura DUR segundos (variável de ambiente) para casar com a narração.
  Coletas   os 60 segundos das 4 IAs lado a lado: cada entrada no abrigo vira um ponto, e no fim o que cada uma salvou
  Corrida   quantas pessoas cada família ainda tem, dia a dia, até a última cair

Uso: DUR=12 manim -qh --fps 24 -r 1920,1080 video/manim/explica_s60.py Coletas -o coletas.mp4
"""
import json
import os
from pathlib import Path

from manim import *

RAIZ = Path(__file__).resolve().parents[2]
DUR = float(os.environ.get('DUR', '12'))
FONTE = 'Inter'
FUNDO = '#140c0a'
TINTA = '#f3ead8'
APAGADO = '#5a4a40'
VERMELHO = '#ff5a3c'
IAS = [('MiniMax', 'ep5_minimax', '#e8336d'), ('GPT', 'ep5_gpt', '#12b886'),
       ('DeepSeek', 'ep5_deepseek', '#4d6bfe'), ('Claude', 'ep5_claude', '#d97757')]
PESSOAS = {'pai': 'Osvaldo', 'mae': 'Celeste', 'filha': 'Juju', 'filho': 'Tico'}
config.background_color = FUNDO


def log(nome):
    f = RAIZ / 'sessenta' / 'logs' / f'{nome}.json'
    return json.loads(f.read_text()) if f.exists() else None


def txt(s, tam=36, cor=TINTA, peso=BOLD):
    return Text(s, font=FONTE, font_size=tam, color=cor, weight=peso)


def pl(n, s):
    return f'{n} {s}' + ('' if n == 1 else 's')


class Base(Scene):
    def tempo(self, fracao):
        return max(0.15, DUR * fracao)

    def titulo(self, s, sub=None):
        t = txt(s, 46).to_edge(UP, buff=0.45)
        g = VGroup(t)
        if sub:
            g.add(txt(sub, 24, APAGADO, NORMAL).next_to(t, DOWN, buff=0.15))
        self.play(FadeIn(g, shift=DOWN * 0.3), run_time=self.tempo(0.06))
        return g


class Coletas(Base):
    def construct(self):
        self.titulo('OS 60 SEGUNDOS DE CADA IA', 'cada ponto é uma entrada no abrigo')
        x0, x1 = -4.2, 4.6
        xs = lambda s: x0 + (x1 - x0) * s / 60
        linhas, pontos, finais = VGroup(), [], VGroup()
        for i, (nome, arq, cor) in enumerate(IAS):
            L = log(arq)
            y = 1.7 - i * 1.25
            rot = txt(nome, 30, cor).move_to([-5.6, y, 0])
            base = Line([x0, y, 0], [x1, y, 0], color=APAGADO, stroke_width=6)
            linhas.add(VGroup(rot, base))
            if not L:
                pontos.append([])
                continue
            ent = [f['gasto'] / 1000 for f in L['coleta']['falas'] if f.get('acao') == 'correr até o abrigo' and f.get('valida', True)]
            pontos.append([(s, Dot([xs(s), y, 0], radius=0.13, color=cor)) for s in ent])
            r = L['coleta']['resultado']
            it = r.get('itens', {})
            finais.add(txt(f"{len(r['pessoas'])} pessoas · {pl(it.get('sopa', 0), 'sopa')} · {pl(it.get('agua', 0), 'água')}", 22, cor, NORMAL)
                       .next_to(base, DOWN, buff=0.12).align_to(base, RIGHT))
        marcas = VGroup(*[txt(f'{s}s', 18, APAGADO, NORMAL).move_to([xs(s), -3.35, 0]) for s in (0, 15, 30, 45, 60)])
        self.play(LaggedStart(*[FadeIn(l, shift=RIGHT * 0.3) for l in linhas], lag_ratio=0.2), FadeIn(marcas), run_time=self.tempo(0.12))
        # o relógio corre e os pontos acendem no segundo em que cada IA entrou no abrigo
        relogio = ValueTracker(0)
        agulha = always_redraw(lambda: Line([xs(relogio.get_value()), 2.35, 0], [xs(relogio.get_value()), -3.1, 0], color=VERMELHO, stroke_width=3))
        seg = always_redraw(lambda: txt(f'{relogio.get_value():4.1f}s', 26, VERMELHO).next_to(agulha, UP, buff=0.05))
        self.add(agulha, seg)
        acesos = set()

        def acender(m):
            for lst in pontos:
                for s, d in lst:
                    if s <= relogio.get_value() and id(d) not in acesos:
                        acesos.add(id(d))
                        self.add(d)
        agulha.add_updater(lambda m: acender(m))
        self.play(relogio.animate.set_value(60), run_time=self.tempo(0.5), rate_func=linear)
        agulha.clear_updaters()
        self.play(FadeOut(agulha), FadeOut(seg), LaggedStart(*[FadeIn(f, shift=UP * 0.2) for f in finais], lag_ratio=0.25), run_time=self.tempo(0.12))
        self.wait(self.tempo(0.2))


class Corrida(Base):
    def construct(self):
        self.titulo('QUEM AINDA ESTAVA NO JOGO', 'pessoas da família, dia a dia')
        dados = []
        for nome, arq, cor in IAS:
            L = log(arq)
            if not L:
                continue
            serie = [len(L['coleta']['resultado']['pessoas'])]
            for d in L['dias']:
                serie.append(sum(1 for p in d['antes']['pessoas'] if p.get('vivo') and not p.get('perdido') and not p.get('fugiu')))
            serie.append(0)
            dados.append((nome, cor, serie, L['final']['dia']))
        maxd = max(len(x[2]) for x in dados)
        eixos = Axes(x_range=[0, maxd, 10], y_range=[0, 4, 1], x_length=9.6, y_length=4.6,
                     axis_config={'color': APAGADO, 'stroke_width': 3, 'include_ticks': True},
                     ).shift(DOWN * 0.55 + LEFT * 1.6)
        nums = VGroup(*[txt(str(d), 20, APAGADO, NORMAL).next_to(eixos.c2p(d, 0), DOWN, buff=0.15) for d in range(0, maxd + 1, 10)],
                      *[txt(str(v), 20, APAGADO, NORMAL).next_to(eixos.c2p(0, v), LEFT, buff=0.15) for v in (1, 2, 3, 4)],
                      txt('dias', 20, APAGADO, NORMAL).next_to(eixos.x_axis, RIGHT, buff=0.1))
        self.play(Create(eixos), FadeIn(nums), run_time=self.tempo(0.08))
        curvas, fins = [], []
        for k, (nome, cor, serie, ult) in enumerate(dados):
            pts = []
            for d, v in enumerate(serie):
                if d:
                    pts.append(eixos.c2p(d, serie[d - 1]))
                pts.append(eixos.c2p(d, v))
            off = (k - 1.5) * 0.035
            c = VMobject(color=cor, stroke_width=6).set_points_as_corners([p + UP * off for p in pts])
            curvas.append(c)
            fins.append(txt(f'{nome} · {ult} dias', 28, cor).move_to([5.4, 1.2 - 0.7 * k, 0]))
        self.play(*[Create(c) for c in curvas], run_time=self.tempo(0.55), rate_func=linear)
        self.play(LaggedStart(*[FadeIn(f, scale=1.2) for f in fins], lag_ratio=0.25), run_time=self.tempo(0.12))
        self.wait(self.tempo(0.18))
