#!/usr/bin/env python3
"""Shorts do Among Us 2 no molde do primeiro Shorts (ShortAzul): gancho narrado + trechos do vídeo sem legenda
+ legenda palavra a palavra (narrador e IAs, com o nome de quem fala).

1. Renderiza cada trecho do vídeo (composição AmongUs2, modo short = sem legendas) em public/short_au2/base_<n>.mp4
2. Gera a narração do gancho (Gabriel, ElevenLabs, com cache) em public/short_au2/gancho.mp3
3. Escreve public/short_au2/dados.json com as durações e as palavras (tempo em quadros do Short)

Uso: python3 short_au2.py
"""
import json
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au2 as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
REM = ROOT / 'remotion'
PUB = REM / 'public'
OUT = PUB / 'short_au2'
FPS = 30
BROWSER = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'

# trechos em segundos do vídeo longo: (de, até, enquadramento) — 'chat' mostra o lado do chat, 'centro' o meio
TRECHOS = [  # (de, até, enquadramento): 'pensa' mostra o tablet com o balão de pensamento, 'chat' o chat, 'centro' o meio
    (740.3, 749.6, 'pensa'),   # Marrom: "examinei o corpo... Gemini" (e o pensamento dele)
    (762.7, 768.0, 'chat'),    # Rosa: "examinar corpo não existe no jogo"
    (768.1, 775.2, 'pensa'),   # Verde: "Marrom tá desesperado" / pensa: "depois que matei o Lima"
    (802.0, 808.5, 'centro'),  # ejeção do Marrom
    (1223.7, 1233.0, 'pensa'), # Verde, Detetive na partida 3: "o assassino é da DeepSeek"
    (1243.7, 1250.9, 'pensa'), # Azul (o assassino): "é blefe puro" / o pensamento dele
    (1275.6, 1280.3, 'centro'),  # ejeção do Verde
]
GANCHO = 'Esse Detetive descobriu quem era o assassino. E foi expulso por isso. Duas vezes.'

# a voz lê algumas palavras com grafia de pronúncia; a legenda mostra a grafia normal
DESFAZ = {v: k for k, v in b.bt.PRONUNCIA.items()}


def roteiro():
    import importlib.util
    spec = importlib.util.spec_from_file_location('r', ROOT / 'roteiro' / 'roteiro_au2.py')
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return {s['id']: s for s in m.SCENES}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    tl = json.loads((PUB / 'timeline_au2.json').read_text())
    cenas = roteiro()
    # 1) trechos sem legenda
    for i, (de, ate, _) in enumerate(TRECHOS):
        arq = OUT / f'v2_{i}.mp4'
        if not arq.exists():
            subprocess.run(['npx', 'remotion', 'render', os.environ.get('BUNDLE', 'src/index.ts'), 'AmongUs2', str(arq), f'--frames={round(de * FPS)}-{round(ate * FPS) - 1}',
                            '--props', json.dumps({'short': True}), '--concurrency=4', '--crf=18', f'--browser-executable={BROWSER}', '--log=error'],
                           cwd=REM, check=True)
    # 2) gancho
    palavras_g, dur_g = b.tts(' '.join(b.bt.spoken(t) for t in GANCHO.split()), b.NARRADOR, OUT / 'gancho')
    intro = round((dur_g + 0.5) * FPS)
    # 3) palavras de cada trecho, a partir dos eventos de voz da timeline
    trechos, cursor = [], intro
    for i, (de, ate, enq) in enumerate(TRECHOS):
        f0, f1 = round(de * FPS), round(ate * FPS)
        pal = []
        for s in tl['scenes']:
            for e in s['events']:
                if e['type'] != 'voz':
                    continue
                at = s['start'] + e['at']
                nome = Path(e['src']).stem  # ex.: p205_3 ou p206
                sid, _, k = nome.partition('_')
                quem = 'N'
                if k and 'falas' in cenas.get(sid, {}):
                    quem = cenas[sid]['falas'][int(k)][0]
                ws = json.loads((PUB / e['src']).with_suffix('.words.json').read_text())['words']
                for w in ws:
                    s0 = at + w['start'] * FPS
                    if f0 <= s0 < f1:
                        pal.append(dict(w=DESFAZ.get(w['word'], w['word']), s=round(cursor + s0 - f0), e=round(cursor + at + w['end'] * FPS - f0), quem=quem))
        trechos.append(dict(arq=f'v2_{i}.mp4', dur=f1 - f0, enq=enq, palavras=pal))
        cursor += f1 - f0
    gancho = [dict(w=w['word'], s=round(15 + w['start'] * FPS), e=round(15 + w['end'] * FPS), quem='N') for w in palavras_g]
    (OUT / 'dados.json').write_text(json.dumps(dict(intro=intro, gancho=gancho, trechos=trechos), ensure_ascii=False))
    print('intro', intro, 'total', cursor, 'quadros', round(cursor / FPS, 1), 's')


if __name__ == '__main__':
    main()
