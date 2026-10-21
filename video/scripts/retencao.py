#!/usr/bin/env python3
"""Material para o teste de retenção com Haikus (regra do canal): o vídeo cortado em janelas de 30 s; para cada uma, uma
tira com 6 quadros (um a cada 5 s) e um texto com a fala do narrador/IAs, os memes e os efeitos daquele trecho.
Uso: python3 retencao.py <video.mp4> <timeline.json> <pasta de saída>
Saída: <pasta>/jNNN.jpg e <pasta>/jNNN.txt (NNN = número da janela) e <pasta>/indice.txt (janela → capítulo)."""
import json
import subprocess
import sys
from pathlib import Path

JANELA = 30
FPS = 30


def main():
    video, tl_arq, saida = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
    saida.mkdir(parents=True, exist_ok=True)
    tl = json.loads(tl_arq.read_text())
    total = tl['durationInFrames'] / FPS
    indice = []
    for n in range(int(total // JANELA) + 1):
        a, b = n * JANELA, min(total, (n + 1) * JANELA)
        if b - a < 3:
            break
        cap = next((c['title'] for c in tl['chapters'] if c['start'] / FPS <= a < c['end'] / FPS), '')
        indice.append(f'j{n:03d} {int(a) // 60}:{int(a) % 60:02d} {cap}')
        # 6 quadros lado a lado (2 linhas de 3), 640 px cada: busca direta (-ss) em cada quadro, que é bem mais rápido
        ts = [a + k * 5 + 2 for k in range(6) if a + k * 5 + 2 < b]
        ent = [x for t in ts for x in ('-ss', f'{t:.2f}', '-i', video)]
        filtro = ''.join(f'[{i}:v]scale=640:360[v{i}];' for i in range(len(ts))) + ''.join(f'[v{i}]' for i in range(len(ts))) + f'xstack=inputs={len(ts)}:layout=' + '|'.join(f'{(i % 3) * 640}_{(i // 3) * 360}' for i in range(len(ts))) + ':fill=black'
        if len(ts) == 1:
            filtro = '[0:v]scale=640:360'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', filtro, '-frames:v', '1', saida / f'j{n:03d}.jpg'], check=True)
        linhas = [f'JANELA {n} — {int(a) // 60}:{int(a) % 60:02d} a {int(b) // 60}:{int(b) % 60:02d} — capítulo: {cap}', '']
        for s in tl['scenes']:
            s0, s1 = s['start'] / FPS, (s['start'] + s['duration']) / FPS
            if s1 <= a or s0 >= b:
                continue
            v = s['visual']
            linhas.append(f"[cena {s['id']}: {v.get('name', v.get('type'))}]")
            fala = ' '.join(w['w'] for w in s.get('words', []) if a <= s0 + w['s'] / FPS < b)
            if fala:
                linhas.append(f'  narração: {fala}')
            chat = (v.get('props', {}) or {}).get('chat')
            for item in (chat if isinstance(chat, list) else []):
                t = s0 + item['at'] / FPS
                if a <= t < b:
                    linhas.append(f"  {item['cor']} fala: {item['texto']}")
            for e in s.get('events', []):
                t = s0 + e['at'] / FPS
                if a <= t < b and e['type'] in ('meme', 'sfx', 'txt', 'punch'):
                    linhas.append(f"  efeito {e['type']} em {int(t) // 60}:{int(t) % 60:02d}: {e.get('id', e.get('text', ''))}")
        (saida / f'j{n:03d}.txt').write_text('\n'.join(linhas))
    (saida / 'indice.txt').write_text('\n'.join(indice))
    print(len(indice), 'janelas')


if __name__ == '__main__':
    main()
