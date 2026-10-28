#!/usr/bin/env python3
"""Teste de retenção (regra do canal) da prévia do Minecraft: janelas de 30 s; em cada uma, 6 quadros (um a cada 5 s)
e o texto do trecho (narração, falas e pensamentos das IAs, mortes, memes). Lê public/mc_previa/previa.json.
Uso: python3 retencao_previa_mc.py <video.mp4> <pasta de saída>"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FPS = 30
JANELA = 30


def main():
    video, saida = sys.argv[1], Path(sys.argv[2])
    saida.mkdir(parents=True, exist_ok=True)
    cenas = json.loads((ROOT / 'remotion' / 'public' / 'mc_previa' / 'previa.json').read_text())['cenas']
    itens, at = [], 0
    for c in cenas:
        for a in c['audios']:
            quem = 'narrador' if a['tipo'] == 'n' else f"{c['quem']} ({'pensamento, voz com eco' if a['tipo'] == 'pensa' else 'chat, voz dele'})"
            itens.append(((at + a['at']) / FPS, f'{quem}: {a["texto"]}'))
        if c.get('titulo'):
            itens.append((at / FPS, f"título na tela: {c['titulo']}"))
        if c.get('morte'):
            m = c['morte']
            itens.append(((at + m['at']) / FPS, f"MORTE: imagem congela e fica cinza, selo '{m['selo']}', aviso '{m['texto']}', meme '{c.get('meme')}'"))
        at += c['dur']
    total = at / FPS
    n = 0
    while n * JANELA < total - 3:
        a, b = n * JANELA, min(total, (n + 1) * JANELA)
        ts = [t for t in (a + k * 5 + 2 for k in range(6)) if t < b]
        ent = [x for t in ts for x in ('-ss', f'{t:.2f}', '-i', video)]
        filtro = ''.join(f'[{i}:v]scale=640:360[v{i}];' for i in range(len(ts))) + ''.join(f'[v{i}]' for i in range(len(ts))) + f'xstack=inputs={len(ts)}:layout=' + '|'.join(f'{(i % 3) * 640}_{(i // 3) * 360}' for i in range(len(ts))) + ':fill=black'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', filtro, '-frames:v', '1', saida / f'j{n}.jpg'], check=True)
        linhas = [f'JANELA {n}: {int(a)} s a {int(b)} s do vídeo (total {int(total)} s). Quadros da imagem: um a cada 5 s, começando em {int(a) + 2} s.', '']
        linhas += [f'{int(t // 60)}:{int(t % 60):02d}  {txt}' for t, txt in itens if a <= t < b]
        (saida / f'j{n}.txt').write_text('\n'.join(linhas))
        n += 1
    print(n, 'janelas')


if __name__ == '__main__':
    main()
