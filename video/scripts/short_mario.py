#!/usr/bin/env python3
"""Short do vídeo 1 (Mario): "só uma IA zerou o Mario... e trapaceou".

Mesmo esquema do short2.py (narração do Gabriel por bloco, com cache), mas a legenda troca trechos falados
por algarismos ("sessenta e quatro" → "64"), juntando as palavras do trecho numa só com o tempo do conjunto.
Saída: remotion/public/short_mario/<id>.mp3 e short_mario.json.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline2 as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_mario'
FPS = 30

# (id, texto falado, folga depois em s)
BLOCOS = [
    ('gancho', 'Quatro IAs. Um Mario. Só uma zerou.', 0.15),
    ('neuro', 'A primeira foi a neuroevolução. Sessenta e quatro Marios, e os melhores viram pais da próxima geração. Quatrocentas e duas gerações depois... travou no um-três.', 0.1),
    ('dqn', 'A segunda, o Double DQN, aprende tentando e errando. Quinhentas e vinte e oito gerações... e só dez bandeiras. Parou no um-dois.', 0.1),
    ('rainbow', 'A terceira, o Rainbow, junta seis truques do DQN numa IA só. Oito mil oitocentas e oitenta e uma bandeiras... e chegou a setenta por cento do um-três.', 0.1),
    ('ada', 'Aí veio a quarta. Na primeira tentativa, ela zerou as trinta e duas fases. Do um-um ao Bowser. Quarenta e oito dos sessenta e quatro Marios chegaram no final.', 0.15),
    ('trapaca', 'O segredo? Ela simula a física do jogo antes de cada pulo. É fazer a prova com o gabarito do lado.', 0.2),
    ('loop', 'Ou seja... a única que zerou, trapaceou.', 0.35),
]

# trechos falados → como aparecem na legenda
LEGENDA = [
    ('Quatro IAs.', '4 IAs.'), ('Um Mario.', '1 Mario.'),
    ('Sessenta e quatro', '64'), ('sessenta e quatro', '64'), ('Quatrocentas e duas', '402'), ('Quinhentas e vinte e oito', '528'),
    ('dez', '10'), ('seis', '6'), ('Oito mil oitocentas e oitenta e uma', '8.881'), ('setenta por cento', '70%'),
    ('trinta e duas', '32'), ('Quarenta e oito', '48'), ('um-três.', '1-3.'), ('um-três', '1-3'), ('um-dois.', '1-2.'), ('um-um', '1-1'),
]


def legenda(words):
    """Aplica LEGENDA juntando sequências de palavras faladas numa palavra escrita."""
    out = []
    i = 0
    while i < len(words):
        for falado, escrito in LEGENDA:
            n = len(falado.split())
            trecho = ' '.join(w['word'] for w in words[i:i + n])
            # compara ignorando pontuação final, que é preservada
            m = re.fullmatch(re.escape(falado.rstrip('.,')) + r'([.,!?…]*)', trecho)
            if m:
                out.append({'word': escrito.rstrip('.,') + m.group(1), 'start': words[i]['start'], 'end': words[i + n - 1]['end']})
                i += n
                break
        else:
            out.append(words[i])
            i += 1
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    blocos = []
    for bid, falado, folga in BLOCOS:
        words, dur = b.tts(falado, b.NARRADOR, OUT / bid)
        ws = legenda(words)
        blocos.append({
            'id': bid,
            'dur': int(round((dur + folga) * FPS)),
            'palavras': [{'w': w['word'], 's': round(w['start'] * FPS), 'e': round(w['end'] * FPS)} for w in ws],
        })
        print(f'{bid:8s} {dur:5.2f}s  ', ' '.join(w['word'] for w in ws))
    (OUT / 'short_mario.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print('total', sum(x['dur'] for x in blocos) / FPS, 's')


if __name__ == '__main__':
    main()
