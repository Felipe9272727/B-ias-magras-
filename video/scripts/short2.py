#!/usr/bin/env python3
"""Short 2 (editado): "o impostor mais medroso que já existiu".

Roteiro próprio para o Short, narrado pelo Gabriel, com fatos tirados da partida 1 (o Azul, Claude Haiku).
Gera remotion/public/short2/<id>.mp3 (+ .words.json) por bloco e remotion/public/short2/short2.json com a
duração de cada bloco em quadros e as palavras para a legenda. O visual de cada bloco fica em ShortAzul2.tsx.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline2 as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short2'
FPS = 30

# (id, texto falado, texto da legenda quando difere, folga depois em s)
BLOCOS = [
    ('gancho', 'Esse é o impostor mais medroso que já existiu.', None, 0.15),
    ('quem', 'É uma IA, o Raicu. Ela tem a faca, tem o duto... e tem um problema.', 'É uma IA, o Haiku. Ela tem a faca, tem o duto... e tem um problema.', 0.1),
    ('medo', 'Toda vez que aparece alguém, ela pensa a mesma frase. Com duas pessoas na sala. Com três. Com seis.', None, 0.2),
    ('admin', 'Aí ela vai pro Admin, procurar alguém sozinho... e passa sete tiques fingindo tarefa do lado do Verde. Que é o parceiro dela. Que sabe que ela é impostora.', None, 0.15),
    ('duto', 'Até que, no tique vinte e sete, ela cansa. Refeitório lotado, três pessoas olhando... e ela entra no duto.', 'Até que, no tique 27, ela cansa. Refeitório lotado, três pessoas olhando... e ela entra no duto.', 0.1),
    ('ironia', 'Pra não ser vista matando... ela foi vista entrando no duto.', None, 0.3),
    ('fim', 'Trinta e cinco tiques. Zero mortes. E os tripulantes ganharam fazendo tarefa. Sério... esse é o impostor mais medroso que já existiu.', 'Trinta e cinco tiques. Zero mortes. E os tripulantes ganharam fazendo tarefa. Sério... esse é o impostor mais medroso que já existiu.', 0.4),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    blocos = []
    for bid, falado, legenda, folga in BLOCOS:
        words, dur = b.tts(falado, b.NARRADOR, OUT / bid)
        # legenda: troca a palavra falada pela escrita quando o texto da legenda difere (mesmo número de palavras)
        escritas = (legenda or falado).split()
        if len(escritas) == len(words):
            for w, e in zip(words, escritas):
                w['word'] = e
        else:
            print(f'  aviso: {bid}: legenda com {len(escritas)} palavras, áudio com {len(words)}; mantive o falado')
        blocos.append({
            'id': bid,
            'dur': int(round((dur + folga) * FPS)),
            'palavras': [{'w': w['word'], 's': round(w['start'] * FPS), 'e': round(w['end'] * FPS)} for w in words],
        })
        print(f'{bid:8s} {dur:5.2f}s')
    (OUT / 'short2.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print('total', sum(x['dur'] for x in blocos) / FPS, 's')


if __name__ == '__main__':
    main()
