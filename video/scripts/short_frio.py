#!/usr/bin/env python3
"""Shorts do Among Us 2 no molde do Short que deu certo (ShortAzul2, "o impostor mais medroso que já existiu"):
roteiro próprio narrado, um personagem só, gancho com superlativo que volta no fim, selos no ritmo da fala,
pensamento secreto com contador e gameplay desenhada na vertical.

Personagem: o Azul (DeepSeek), impostor nas partidas 2 e 3. Fatos conferidos em amongus/logs2/partida2.json e
partida3.json: escudo da Médica (Rosa) nele no t4 da partida 2; votou nos parceiros Roxo (P2, reunião 0), Verde
(P2, reunião 2) e Preto (P3, reunião 0); virou o Vermelho e matou o Vermelho (P2, t37); virou o Ciano e matou o
Laranja (P3, t19), e o Ciano foi expulso; o Detetive (Verde) disse que o assassino era da DeepSeek e o Azul pensou
"o pior é que ela acertou: o assassino do Marrom fui eu"; 3 mortes, nunca expulso.

Gera remotion/public/short_frio/<bloco>.mp3 (+ .words.json) e short_frio.json (duração e palavras de cada bloco).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au2 as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_frio'
FPS = 30

# (id, texto, folga depois em s)
BLOCOS = [
    ('gancho', 'Esse é o impostor mais frio que já existiu.', 0.15),
    ('quem', 'É uma IA, o DeepSeek. Na partida dois, ele é impostor. E a médica escolhe dar escudo... justo pra ele.', 0.15),
    ('parceiro', 'Aí o parceiro dele é pego. E ele vota no parceiro. O outro parceiro é pego... e ele vota de novo. Na partida três? Vota no parceiro de novo.', 0.2),
    ('disfarce', 'E ele não mata com a própria cara. Ele vira o Vermelho... e mata o Vermelho.', 0.3),
    ('ciano', 'Depois, ele vira o Ciano e mata o Laranja. E quem é expulso? O Ciano.', 0.25),
    ('detetive', 'Até que o Detetive descobre: o assassino é do DeepSeek. E ele chama de blefe, pensando...', 1.6),
    ('fim', 'Duas partidas. Três mortes. Três votos nos próprios parceiros. E nunca foi expulso. Sério... esse é o impostor mais frio que já existiu.', 0.5),
]

DESFAZ = {v: k for k, v in b.bt.PRONUNCIA.items()}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    blocos = []
    for bid, texto, folga in BLOCOS:
        falado = ' '.join(b.bt.spoken(t) for t in texto.split())
        words, dur = b.tts(falado, b.NARRADOR, OUT / bid)
        escritas = texto.split()
        if len(escritas) == len(words):
            for w, e in zip(words, escritas):
                w['word'] = e
        else:
            for w in words:
                w['word'] = DESFAZ.get(w['word'], w['word'])
        blocos.append({'id': bid, 'dur': int(round((dur + folga) * FPS)),
                       'palavras': [{'w': w['word'], 's': round(w['start'] * FPS), 'e': round(w['end'] * FPS)} for w in words]})
        print(f'{bid:9s} {dur:5.2f}s')
    (OUT / 'short_frio.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print('total', sum(x['dur'] for x in blocos) / FPS, 's')


if __name__ == '__main__':
    main()
