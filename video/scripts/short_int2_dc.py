#!/usr/bin/env python3
"""Short Director Cut — Interrogatório das IAs 2 (Caso 6: A Ópera no Armário do GLM).
Reaproveita 100% das vozes reais do Caso 6 em public/voice_int2/ e gera apenas
as linhas curtas de narração com timestamps palavra-a-palavra no ElevenLabs.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_int as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_int2_dc'
VOZ2 = ROOT / 'remotion' / 'public' / 'voice_int2'
FPS = 30

# ('n', texto) ou ('c', arq_voice_int2, start_s, end_s, ia)
BLOCOS = [
    ('gancho', [
        ('n', 'Essa IA foi condenada por esconder um cachorro no prédio. Só que o uivo das três da manhã... era outra coisa.'),
    ], 0.08),
    ('pistas', [
        ('n', 'Na pasta: uivos de madrugada, petiscos de carne e o vizinho jurando que ouviu: bom garoto! Olha a desculpa do GLM:'),
        ('c', 'c604_5', 0.0, None, 'glm'),
    ], 0.08),
    ('tropeco', [
        ('n', 'Fifí... o casaco. Mas aí veio o tropeço da temporada:'),
        ('c', 'c607_2', 2.65, None, 'glm'),
    ], 0.08),
    ('veredito', [
        ('n', 'O detetive MiniMax bateu o martelo:'),
        ('c', 'c610_0', 4.92, None, 'minimax'),
    ], 0.08),
    ('confissao', [
        ('c', 'c610_2', 0.0, 9.62, 'glm'),
    ], 0.08),
    ('fim', [
        ('n', 'Inocente! Era só ópera no armário. Você condenava ou liberava o GLM? Comenta aí!'),
    ], 0.40),
]

DESFAZ = {v: k for k, v in b.bt.PRONUNCIA.items()}
DESFAZ.update({'Gê Éle Ême': 'GLM', 'Mini Mécs': 'MiniMax', 'Fifí': 'Fifí'})


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    blocos = []
    for bid, partes, folga in BLOCOS:
        t, auds, palavras = 0.0, [], []
        for k, p in enumerate(partes):
            if p[0] == 'n':
                texto = p[1]
                falado = ' '.join(b.bt.spoken(x) for x in texto.split())
                falado = falado.replace('GLM', 'Gê Éle Ême').replace('MiniMax', 'Mini Mécs')
                words, dur = b.tts(falado, b.NARRADOR, OUT / f'{bid}_{k}')
                escritas = texto.split()
                if len(escritas) == len(words):
                    for w, e in zip(words, escritas):
                        w['word'] = e
                else:
                    for w in words:
                        w['word'] = DESFAZ.get(w['word'], w['word'])
                auds.append(dict(src=f'short_int2_dc/{bid}_{k}.mp3', at=round(t * FPS), de=0))
                palavras += [dict(w=w['word'], s=round((t + w['start']) * FPS), e=round((t + w['end']) * FPS)) for w in words]
                t += dur + 0.06
            else:
                _, arq, ini_s, fim_s, ia = p
                d = json.loads((VOZ2 / f'{arq}.words.json').read_text())
                ws = [w for w in d['words'] if not w['word'].startswith('[')]
                corte = float(ini_s or 0.0)
                fim_real = float(fim_s) if fim_s is not None else float(d['dur'])
                dur = max(0.2, fim_real - corte)
                auds.append(dict(src=f'voice_int2/{arq}.mp3', at=round(t * FPS), de=round(corte * FPS), ate=round(dur * FPS), ia=ia))
                palavras += [
                    dict(w=w['word'], s=round((t + w['start'] - corte) * FPS), e=round((t + w['end'] - corte) * FPS), ia=ia)
                    for w in ws if w['start'] >= corte - 0.02 and w['end'] <= fim_real + 0.08
                ]
                t += dur + 0.06
        blocos.append(dict(id=bid, dur=int(round((t + folga) * FPS)), audios=auds, palavras=palavras))
        print(f'[ShortInt2DC] {bid:10s} {t:5.2f}s')
    total_s = sum(x['dur'] for x in blocos) / FPS
    (OUT / 'short_int2_dc.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print(f'ShortInt2DC pronto: {total_s:.1f}s ({sum(x["dur"] for x in blocos)} quadros)')


if __name__ == '__main__':
    main()
