#!/usr/bin/env python3
"""Renderiza as explicações em Manim do vídeo 3 com a duração exata de cada cena (lista ilha/dados/manim3[_nome].json)
em video/remotion/public/ilha/manim/<cena_id>.mp4 (1920x1080, 24 fps). Pula as que já existem com a mesma duração."""
import json, os, subprocess, sys, shutil
from pathlib import Path
REPO = Path(__file__).resolve().parents[2]
lista = REPO / 'ilha' / 'dados' / (sys.argv[1] if len(sys.argv) > 1 else 'manim3.json')
OUT = REPO / 'video' / 'remotion' / 'public' / 'ilha' / 'manim'
OUT.mkdir(parents=True, exist_ok=True)
TMP = REPO / 'ilha' / 'render' / 'manim'
for job in json.loads(lista.read_text()):
    alvo = OUT / f"{job['id']}.mp4"
    marca = OUT / f"{job['id']}.dur"
    if alvo.exists() and marca.exists() and marca.read_text() == str(job['dur']):
        continue
    env = dict(os.environ, DUR=str(job['dur']))
    subprocess.run(['manim', '-qh', '--fps', '24', '-r', '1920,1080', '--media_dir', str(TMP), '-o', job['id'],
                    str(REPO / 'video' / 'manim' / 'explica3.py'), job['cena']], env=env, check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    feito = next(TMP.glob(f"videos/explica3/*/{job['id']}.mp4"))
    shutil.copy(feito, alvo)
    marca.write_text(str(job['dur']))
    print('MANIM', job['id'], job['cena'], job['dur'], flush=True)
