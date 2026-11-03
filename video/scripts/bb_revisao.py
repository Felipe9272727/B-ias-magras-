#!/usr/bin/env python3
"""Prepara a revisão de retenção do BOMBANANA! (regra do canal: Haikus avaliam cada ~30 s antes da entrega).
Para cada trecho de 30 s do vídeo: 3 quadros (início, meio, fim) e o texto que aparece/fala no trecho (da timeline).
Uso: python3 bb_revisao.py <video.mp4> [timeline=remotion/public/bb/timeline3d.json] [saida=/tmp/bb_rev]
Saída: <saida>/trecho_NNN.jpg (3 quadros lado a lado) + <saida>/trechos.json"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
video = sys.argv[1]
tl = json.loads(Path(sys.argv[2] if len(sys.argv) > 2 else ROOT / 'remotion/public/bb/timeline3d.json').read_text())
out = Path(sys.argv[3] if len(sys.argv) > 3 else '/tmp/bb_rev'); out.mkdir(parents=True, exist_ok=True)
FPS = 30
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], capture_output=True, text=True).stdout)

# textos com tempo absoluto
textos = []
ini = 0
for b in tl['blocos']:
    for fl in b.get('falas', []):
        textos.append(((ini + fl['ini']) / FPS, f"{fl['quem']} ({fl['papel']}{', pensando' if fl.get('pensa') else ''}): {fl['texto']}"))
    for n in b.get('narr', []):
        textos.append(((ini + n['ini']) / FPS, f"NARRADOR: {n['texto']}"))
    if b['tipo'] in ('fase', 'vitoria', 'explosao', 'abertura'):
        textos.append((ini / FPS, f"[{b['tipo'].upper()}] {b.get('titulo', '')} {b.get('sub', '')}"))
    if b.get('acao'):
        textos.append(((ini + b['acao']['ini']) / FPS, f"[AÇÃO NA BOMBA] {b['acao']['texto']}"))
    ini += b['dur']

trechos = []
t = 0.0
k = 0
while t < dur - 3:
    fim = min(dur, t + 30)
    fotos = []
    for j, tt in enumerate((t + 2, (t + fim) / 2, fim - 2)):
        f = out / f'_q{k}_{j}.jpg'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{tt:.2f}', '-i', video, '-frames:v', '1', '-vf', 'scale=640:-2', str(f)], check=True)
        fotos.append(str(f))
    folha = out / f'trecho_{k:03d}.jpg'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', fotos[0], '-i', fotos[1], '-i', fotos[2], '-filter_complex', 'hstack=3', str(folha)], check=True)
    for f in fotos:
        Path(f).unlink()
    trechos.append({'n': k, 'de': round(t), 'ate': round(fim), 'imagem': str(folha), 'texto': [x[1] for x in textos if t <= x[0] < fim]})
    t += 30
    k += 1
(out / 'trechos.json').write_text(json.dumps(trechos, ensure_ascii=False, indent=1))
print(len(trechos), 'trechos em', out)
