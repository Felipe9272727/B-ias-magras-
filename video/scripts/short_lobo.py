#!/usr/bin/env python3
"""Short do Lobisomem das IAs: "o Bobo mais teimoso que já existiu" (molde do Short do impostor frio) — a Boticária (GLM), o Bobo
da partida 3. Mesmo molde do short_int.py (composição ShortLobo). As falas das IAs são as vozes do vídeo longo
(voice_lobo), do log lobisomem/logs/partida3.json; o narrador só conta o que o log mostra.
Gera remotion/public/short_lobo/<bloco>_<n>.mp3 e short_lobo.json.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_lobo as b  # noqa: E402  (narrador e pronúncias do Lobisomem)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_lobo'
VOZ = ROOT / 'remotion' / 'public' / 'voice_lobo'
FPS = 30

# bloco: [('n', texto) | ('c', arquivo do voice_lobo, quem, mp3 alternativo)], folga no fim (s)
BLOCOS = [
    ('gancho', [('n', 'Esse é o Bobo mais teimoso que já existiu.')], 0.15),
    ('quem', [('n', 'É uma IA, o GLM. No Lobisomem, o Bobo só ganha se a vila linchar ele. E ela pensa:'),
              ('c', 'p305_1', 'boticaria', 'p305_1_eco')], 0.2),
    ('pede', [('n', 'No dia quatro, ela apela:'),
              ('c', 'p322_1', 'boticaria', None),
              ('n', 'Ninguém vota nela.')], 0.2),
    ('presa', [('n', 'No último dia, sobram três: a Carcereira, o lobo... e ela.'),
               ('c', 'p326_2', 'boticaria', None)], 0.2),
    ('voto', [('n', 'Votação final. A Padeira vota no lobo. O lobo vota nela. E ela... vota nela mesma.')], 0.3),
    ('fim', [('n', 'Três partidas sorteada de Bobo. Duas vitórias. A última, com o próprio voto. Sério... esse é o Bobo mais teimoso que já existiu.')], 0.6),
]
DESFAZ = {v: k for k, v in b.bt.PRONUNCIA.items()}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    blocos = []
    for bid, partes, folga in BLOCOS:
        t, auds, palavras = 0.0, [], []
        for k, p in enumerate(partes):
            if p[0] == 'n':
                texto = p[1]
                falado = ' '.join(b.bt.spoken(x) for x in texto.split())
                words, dur = b.tts(falado, b.NARRADOR, OUT / f'{bid}_{k}')
                escritas = texto.split()
                for w, e in zip(words, escritas) if len(escritas) == len(words) else ((w, DESFAZ.get(w['word'], w['word'])) for w in words):
                    w['word'] = e
                auds.append(dict(src=f'short_lobo/{bid}_{k}.mp3', at=round(t * FPS), de=0))
                palavras += [dict(w=w['word'], s=round((t + w['start']) * FPS), e=round((t + w['end']) * FPS)) for w in words]
                t += dur + 0.15
            else:
                _, arq, quem, alt = p
                d = json.loads((VOZ / f'{arq}.words.json').read_text())
                ws = [w for w in d['words'] if not w['word'].startswith('[')]
                dur = d['dur'] + (0.35 if alt else 0)  # o eco estica o fim
                auds.append(dict(src=f'voice_lobo/{alt or arq}.mp3', at=round(t * FPS), de=0, ate=round(dur * FPS), quem=quem, pensa=bool(alt)))
                palavras += [dict(w=w['word'], s=round((t + w['start']) * FPS), e=round((t + w['end']) * FPS), quem=quem) for w in ws]
                t += dur + 0.2
        blocos.append(dict(id=bid, dur=int(round((t + folga) * FPS)), audios=auds, palavras=palavras))
        print(f'{bid:8s} {t:5.2f}s')
    (OUT / 'short_lobo.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print('total', sum(x['dur'] for x in blocos) / FPS, 's')


if __name__ == '__main__':
    main()
