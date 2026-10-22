#!/usr/bin/env python3
"""Lobisomem das IAs: monta o vídeo com cache POR CENA (cópia do montar_cenas_au4.py).

Cada cena vira out/cenas_lobo/<id>_<hash>.mkv (H.264 + áudio PCM). O hash vem do conteúdo da cena (visual, duração,
palavras, eventos), sem a posição no vídeo; então mudar uma frase refaz só aquela cena. Cenas com voz faltando
("pendente" no timeline) não são renderizadas. Cenas vizinhas que faltam são renderizadas numa chamada só.

Uso: python3 montar_cenas_lobo.py <bundle> [saida.mp4]      (sem saída: só renderiza as peças que faltam)
"""
import hashlib
import os
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REM = Path(__file__).resolve().parents[1] / 'remotion'
PUB = REM / 'public'
CENAS = REM / 'out' / 'cenas_lobo'
FPS = 30
ESCALA = float(os.environ.get('ESCALA', '1'))  # ex.: ESCALA=0.5 renderiza em 960x540 e amplia para 1080p (Lanczos), como no 60 Segundos
VERSAO = 1  # suba quando mudar o desenho dos componentes e quiser refazer tudo
BROWSER = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
VIDEO = ['-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', str(FPS)]
AUDIO = ['-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2']


def plano():
    tl = json.loads((PUB / 'timeline_lobo.json').read_text())
    out = []
    for s in tl['scenes']:
        sig = {k: v for k, v in s.items() if k not in ('start', 'chapter')}
        h = hashlib.sha1(json.dumps([VERSAO, sig], ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:14]
        out.append(dict(id=s['id'], ini=s['start'], fim=s['start'] + s['duration'], pendente=bool(s.get('pendente')), arq=CENAS / f"{s['id']}_{h}.mkv"))
    return out


def remotion(bundle, saida, ini, fim):
    subprocess.run(['npx', 'remotion', 'render', bundle, 'Lobisomem', str(saida), f'--frames={ini}-{fim - 1}', '--concurrency=4',
                    f'--browser-executable={BROWSER}', '--log=error', '--crf=16', *([f'--scale={ESCALA}'] if ESCALA != 1 else [])], cwd=REM, check=True)


def cortar(src, off, n, destino):
    tmp = destino.with_suffix('.tmp.mkv')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{off:.6f}', '-i', src, '-frames:v', str(n), '-vf', 'scale=1920:1080:flags=lanczos', *VIDEO, *AUDIO,
                    '-af', f'apad,atrim=0:{n / FPS:.6f}', tmp], check=True)
    shutil.move(tmp, destino)


def main():
    bundle = sys.argv[1]
    saida = Path(sys.argv[2]) if len(sys.argv) > 2 else None
    CENAS.mkdir(parents=True, exist_ok=True)
    cenas = plano()
    faltam = [c for c in cenas if not c['arq'].exists() and not c['pendente']]
    grupos = []
    for c in faltam:
        if grupos and grupos[-1][-1]['fim'] == c['ini'] and c['fim'] - grupos[-1][0]['ini'] <= 1800:  # pedaços de até ~1 min
            grupos[-1].append(c)
        else:
            grupos.append([c])
    pend = [c['id'] for c in cenas if c['pendente']]
    print(f'{len(cenas)} cenas; faltam {len(faltam)} ({sum(c["fim"] - c["ini"] for c in faltam) / FPS:.0f} s) em {len(grupos)} grupos; '
          f'{len(pend)} esperando voz', flush=True)
    for k, g in enumerate(grupos):
        ini, fim = g[0]['ini'], g[-1]['fim']
        print(f'[{k + 1}/{len(grupos)}] {g[0]["id"]}..{g[-1]["id"]} ({(fim - ini) / FPS:.1f}s)', flush=True)
        with tempfile.TemporaryDirectory(dir=CENAS) as td:
            r = Path(td) / 'r.mp4'
            try:
                remotion(bundle, r, ini, fim)
            except subprocess.CalledProcessError:
                print('  falhou; tentando de novo', flush=True)
                remotion(bundle, r, ini, fim)
            for c in g:
                cortar(r, (c['ini'] - ini) / FPS, c['fim'] - c['ini'], c['arq'])
    if not saida:
        print('PEÇAS PRONTAS', flush=True)
        return
    if pend:
        raise SystemExit(f'ainda faltam vozes: {pend[:5]}...')
    lista = CENAS / 'lista.txt'
    lista.write_text(''.join(f"file '{c['arq']}'\n" for c in cenas))
    junto = CENAS / 'junto.mkv'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', junto], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', junto, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', saida], check=True)
    junto.unlink()
    print('PRONTO', saida, flush=True)


if __name__ == '__main__':
    main()
