#!/usr/bin/env python3
"""Short do 60 Segundos das IAs: "a IA deixou o marido lá fora" (o GPT), no molde do short_oc2.py.

Fatos conferidos em sessenta/logs/ep5_gpt.json: na coleta, "Juju, cadê você?" aos 25,7 s e nunca mais procurou a filha
(ela ficou na casa); dia 2, carro_1 → sim, o Osvaldo sai de carro; dia 5, carro_2 → não (barulhos lá fora, faz dias
que o pai não volta), diário "curiosidade radioativa não é um hobby saudável"; a partida acaba no dia 44.

As falas da IA são as vozes do vídeo longo (voice_s60). Gera remotion/public/short_s60/<bloco>_<n>.mp3 e short_s60.json.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au2 as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_s60'
VOZ = ROOT / 'remotion' / 'public' / 'voice_s60'
FPS = 30

# bloco: [('n', texto) | ('c', arquivo do voice_s60, quem)], folga no fim (s)
BLOCOS = [
    ('gancho', [('n', 'Essa IA largou o marido no apocalipse. E fez piada no diário.')], 0.15),
    ('coleta', [('n', 'Sessenta segundos pra salvar a família antes da bomba. O GPT salva a mãe e o filho...'),
                ('c', 'g03_2', 'GPT'),
                ('n', 'E nunca mais procura a filha.')], 0.2),
    ('carro', [('n', 'No abrigo, dia dois: o pai sai de carro.'),
               ('c', 'g07_1', 'GPT')], 0.2),
    ('barulho', [('n', 'Dias depois, barulhos lá fora. Dava pra ir atrás dele. E a IA escreve:'),
                 ('c', 'g08_1', 'GPT')], 0.3),
    ('fim', [('n', 'Curiosidade radioativa. Era o marido dela. Vídeo completo no canal.')], 0.8),
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
                auds.append(dict(src=f'short_s60/{bid}_{k}.mp3', at=round(t * FPS), de=0))
                palavras += [dict(w=w['word'], s=round((t + w['start']) * FPS), e=round((t + w['end']) * FPS)) for w in words]
                t += dur + 0.15
            else:
                _, arq, quem = p
                d = json.loads((VOZ / f'{arq}.words.json').read_text())
                auds.append(dict(src=f'voice_s60/{arq}.mp3', at=round(t * FPS), de=0, chef=quem))
                palavras += [dict(w=w['word'], s=round((t + w['start']) * FPS), e=round((t + w['end']) * FPS), chef=quem) for w in d['words']]
                t += d['dur'] + 0.2
        blocos.append(dict(id=bid, dur=int(round((t + folga) * FPS)), audios=auds, palavras=palavras))
        print(f'{bid:8s} {t:5.2f}s')
    (OUT / 'short_s60.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print('total', sum(x['dur'] for x in blocos) / FPS, 's')


if __name__ == '__main__':
    main()
