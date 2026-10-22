#!/usr/bin/env python3
"""Short do Interrogatório das IAs: "acusado de sumir com o peixe... e confessou outra coisa" — o Qwen, inocente, caso 6.
Mesmo molde do short_au4_possuidor.py (composição ShortInterrogatorio). As falas das IAs são as vozes do vídeo longo
(voice_int), do log interrogatorio/logs/peixe.json; o narrador só conta o caso e a verdade (interrogatorio/casos.mjs).
Gera remotion/public/short_int/<bloco>_<n>.mp3 e short_int.json.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_int as b  # noqa: E402  (narrador e pronúncias do Interrogatório)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_int'
VOZ_OC = ROOT / 'remotion' / 'public' / 'voice_int'
FPS = 30

# bloco: [('n', texto) | ('c', arquivo do voice_oc, palavra de início, nome do chef)], folga no fim (s)
BLOCOS = [
    ('gancho', [('n', 'Essa IA foi acusada de sumir com o peixe da empresa. E pra se defender... confessou outra coisa.')], 0.15),
    ('pasta', [('n', 'O peixe dourado sumiu do aquário. E o detetive tem as pistas:'),
               ('c', 'c603_7', None, 'deepseek', None)], 0.2),
    ('desculpa', [('c', 'c603_8', None, 'qwen', None),
                  ('n', 'Testar a câmera. Claro.'),
                  ('c', 'c604_2', None, 'deepseek', None),
                  ('n', 'Blefe. Ele não ligou pra mãe de ninguém. Mas olha a resposta:'),
                  ('c', 'c604_4', None, 'qwen', None)], 0.2),
    ('pressao', [('n', 'Estresse: cem.'),
                 ('c', 'c605_4', None, 'deepseek', None)], 0.2),
    ('fim', [('c', 'c606_1', None, 'qwen', None),
             ('n', 'E ele era inocente. O peixe tava na casa da faxineira, tomando banho. E o Qwen foi condenado mesmo assim.')], 0.5),
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
                auds.append(dict(src=f'short_int/{bid}_{k}.mp3', at=round(t * FPS), de=0))
                palavras += [dict(w=w['word'], s=round((t + w['start']) * FPS), e=round((t + w['end']) * FPS)) for w in words]
                t += dur + 0.15
            else:
                _, arq, ini, chef = p[:4]
                fimp = p[4] if len(p) > 4 else None
                d = json.loads((VOZ_OC / f'{arq}.words.json').read_text())
                ws = [w for w in d['words'] if not w['word'].startswith('[')]
                corte = 0.0
                if ini:
                    # última ocorrência da palavra de início (o pedaço final da fala)
                    corte = max(w['start'] for w in ws if w['word'].rstrip(',!.') == ini) - 0.05
                fim_s = d['dur']
                if fimp:
                    fim_s = min(w['end'] for w in ws if w['start'] >= corte and w['word'] == fimp) + 0.12
                dur = fim_s - corte
                auds.append(dict(src=f'voice_int/{arq}.mp3', at=round(t * FPS), de=round(corte * FPS), ate=round(dur * FPS), chef=chef))
                palavras += [dict(w=w['word'], s=round((t + w['start'] - corte) * FPS), e=round((t + w['end'] - corte) * FPS), chef=chef)
                             for w in ws if w['start'] >= corte and w['end'] <= fim_s + 0.01]
                t += dur + 0.2
        blocos.append(dict(id=bid, dur=int(round((t + folga) * FPS)), audios=auds, palavras=palavras))
        print(f'{bid:8s} {t:5.2f}s')
    (OUT / 'short_int.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print('total', sum(x['dur'] for x in blocos) / FPS, 's')


if __name__ == '__main__':
    main()
