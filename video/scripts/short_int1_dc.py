#!/usr/bin/env python3
"""Short Director Cut — Interrogatório das IAs 1 (Caso 6: O Sumiço do Peixe Dourado / K-pop do Qwen).
Reaproveita 100% das vozes reais do Caso 6 em public/voice_int/ e gera apenas
2 falas curtas de gancho + CTA (~220 chars) com timestamps palavra-a-palavra no ElevenLabs.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_int as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_int1_dc'
VOZ1 = ROOT / 'remotion' / 'public' / 'voice_int'
FPS = 30

# ('n', texto) ou ('c', arq_voice_int, start_s, end_s, ia, eco)
BLOCOS = [
    ('gancho', [
        ('n', 'O peixe dourado da empresa sumiu. Todas as pistas apontavam pro Qwen... até ele confessar o segredo.'),
    ], 0.08),
    ('blefe', [
        ('c', 'c604_2', 0.0, None, 'deepseek', False),
        ('c', 'c604_3', 0.0, None, None, False),
        ('c', 'c604_4', 0.0, None, 'qwen', False),
        ('c', 'c604_5', 0.0, None, None, False),
    ], 0.08),
    ('veredito', [
        ('c', 'c605_4', 0.0, 6.58, 'deepseek', False),
        ('c', 'c606_0', 0.0, None, None, False),
    ], 0.08),
    ('confissao', [
        ('c', 'c606_1', 0.0, None, 'qwen', False),
        ('c', 'c606_3', 0.0, None, 'qwen', True),
    ], 0.08),
    ('fim', [
        ('n', 'Inocente! A faxineira só levou o Bolhinha pra trocar a água. Caiu inocente e com o K-pop exposto! Você condenava ou liberava?'),
    ], 0.45),
]

DESFAZ = {v: k for k, v in b.bt.PRONUNCIA.items()}
DESFAZ.update({
    'Cuên': 'Qwen',
    'Cuên.': 'Qwen.',
    'Cuên,': 'Qwen,',
    'Dípsíque': 'DeepSeek',
    'Dípsíque.': 'DeepSeek.',
    'K-pop': 'K-pop',
})

def clean_word(w: str) -> str:
    if w in DESFAZ:
        return DESFAZ[w]
    return w.replace('Cuên', 'Qwen').replace('Dípsíque', 'DeepSeek')

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    blocos = []
    for bid, partes, folga in BLOCOS:
        t, auds, palavras = 0.0, [], []
        for k, p in enumerate(partes):
            if p[0] == 'n':
                texto = p[1]
                falado = ' '.join(b.bt.spoken(x) for x in texto.split())
                falado = falado.replace('Qwen', 'Cuên').replace('DeepSeek', 'Dípsíque')
                words, dur = b.tts(falado, b.NARRADOR, OUT / f'{bid}_{k}')
                escritas = texto.split()
                if len(escritas) == len(words):
                    for w, e in zip(words, escritas):
                        w['word'] = e
                else:
                    for w in words:
                        w['word'] = clean_word(w['word'])
                auds.append(dict(src=f'short_int1_dc/{bid}_{k}.mp3', at=round(t * FPS), de=0))
                palavras += [dict(w=w['word'], s=round((t + w['start']) * FPS), e=round((t + w['end']) * FPS)) for w in words]
                t += dur + 0.06
            else:
                _, arq, ini_s, fim_s, ia, eco = p
                d = json.loads((VOZ1 / f'{arq}.words.json').read_text())
                ws = [w for w in d['words'] if not w['word'].startswith('[')]
                corte = float(ini_s or 0.0)
                fim_real = float(fim_s) if fim_s is not None else float(d['dur'])
                dur = max(0.2, fim_real - corte)
                mp3 = f'voice_int/{arq}_eco.mp3' if (eco and (VOZ1 / f'{arq}_eco.mp3').exists()) else f'voice_int/{arq}.mp3'
                auds.append(dict(src=mp3, at=round(t * FPS), de=round(corte * FPS), ate=round(dur * FPS), ia=ia, eco=eco))
                for w in ws:
                    if w['start'] >= corte - 0.02 and w['end'] <= fim_real + 0.08:
                        entry = dict(w=clean_word(w['word']), s=round((t + w['start'] - corte) * FPS), e=round((t + w['end'] - corte) * FPS))
                        if ia:
                            entry['ia'] = ia
                        if eco:
                            entry['eco'] = True
                        palavras.append(entry)
                t += dur + 0.08
        blocos.append(dict(id=bid, dur=int(round((t + folga) * FPS)), audios=auds, palavras=palavras))
        print(f'[ShortInt1DC] {bid:10s} {t:5.2f}s')
    total_s = sum(x['dur'] for x in blocos) / FPS
    (OUT / 'short_int1_dc.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print(f'ShortInt1DC pronto: {total_s:.1f}s ({sum(x["dur"] for x in blocos)} quadros)')

if __name__ == '__main__':
    main()
