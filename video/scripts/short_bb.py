#!/usr/bin/env python3
"""Short do BOMBANANA!: "a IA que mais descreveu uma bomba na história" — o Mistral (Surdo) na fase 9, descrevendo a bomba
sem parar enquanto o MiMo (Cego) grita "PARA DE DESCREVER!". Molde dos Shorts do canal (short_lobo.py): gancho com superlativo
que volta no fim, um personagem só, contador, selos e legenda grande. As falas das IAs são as vozes do vídeo longo (bb/voz,
falas do log da fase 9); o narrador só conta o que o log e o vídeo longo mostram.
Gera remotion/public/short_bb/<bloco>_<n>.mp3 e short_bb.json (composição ShortBB, vídeo longo em public/bb/longo.mp4)."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_bb as b  # noqa: E402  (narrador Gabriel e pronúncias)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_bb'
VOZ = ROOT / 'remotion' / 'public' / 'bb' / 'voz'
FPS = 30

# bloco: (id, partes, folga, segundo do vídeo longo mostrado, selo, contador)
# partes: ('n', texto) | ('c', arquivo de bb/voz, quem, corta_em_s)
BLOCOS = [
    ('gancho', [('n', 'Essa é a IA que mais descreveu uma bomba na história.')], 0.2, 1700.5, None, 0),
    ('quem', [('n', 'Fase final. O MiMo é o cego, segura a bomba. O Mistral é o surdo, vê a bomba. E o GLM é o mudo, com o manual.')], 0.2, 1597.0, None, 0),
    ('d1', [('n', 'Com quatro minutos no relógio, o Mistral fala:'), ('c', 'f9_r05_0', 'mistral', 5.6)], 0.15, 1640.0, 'DESCREVEU', 1),
    ('grito1', [('c', 'f9_r12_3', 'mimo', None)], 0.2, 1676.0, 'PARA!', 1),
    ('d2', [('n', 'E o Mistral...'), ('c', 'f9_r13_0', 'mistral', 5.2)], 0.15, 1695.5, 'DESCREVEU DE NOVO', 2),
    ('grito2', [('c', 'f9_r23_2', 'mimo', 5.4)], 0.2, 1726.0, 'PARA DE DESCREVER!', 2),
    ('d3', [('n', 'Faltando cinquenta segundos... e o Mistral?'), ('c', 'f9_r25_0', 'mistral', 4.6)], 0.2, 1781.0, 'DE NOVO', 3),
    ('fim', [('n', 'BOOM. O cabo cortado era o errado. Sério... essa é a IA que mais descreveu uma bomba na história.')], 0.8, 1823.0, 'BOOM', 3),
]
DESFAZ = {v: k for k, v in b.bt.PRONUNCIA.items()}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    blocos = []
    for bid, partes, folga, video, selo, cont in BLOCOS:
        t, auds, palavras = 0.0, [], []
        for k, p in enumerate(partes):
            if p[0] == 'n':
                texto = p[1]
                falado = ' '.join(b.bt.spoken(x) for x in texto.split())
                words, dur = b.tts(falado, b.NARRADOR, OUT / f'{bid}_{k}')
                escritas = texto.split()
                pares = zip(words, escritas) if len(escritas) == len(words) else ((w, DESFAZ.get(w['word'], w['word'])) for w in words)
                for w, e in pares:
                    w['word'] = e
                auds.append(dict(src=f'short_bb/{bid}_{k}.mp3', at=round(t * FPS)))
                palavras += [dict(w=w['word'], s=round((t + w['start']) * FPS), e=round((t + w['end']) * FPS)) for w in words]
                t += dur + 0.15
            else:
                _, arq, quem, corta = p
                d = json.loads((VOZ / f'{arq}.words.json').read_text())
                dur = min(d['dur'], corta) if corta else d['dur']
                ws = [w for w in d['words'] if not w['word'].startswith('[') and w['start'] < dur - 0.1]
                auds.append(dict(src=f'bb/voz/{arq}.mp3', at=round(t * FPS), ate=round(dur * FPS), quem=quem))
                palavras += [dict(w=b.bt.PRONUNCIA and DESFAZ.get(w['word'], w['word']), s=round((t + w['start']) * FPS), e=round((t + w['end']) * FPS), quem=quem) for w in ws]
                t += dur + 0.2
        blocos.append(dict(id=bid, dur=int(round((t + folga) * FPS)), audios=auds, palavras=palavras, video=video, selo=selo, contador=cont))
        print(f'{bid:8s} {t:5.2f}s')
    (OUT / 'short_bb.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print('total', sum(x['dur'] for x in blocos) / FPS, 's')


if __name__ == '__main__':
    main()
