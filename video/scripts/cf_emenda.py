#!/usr/bin/env python3
"""JOGO DE CONFIANÇA: monta a versão nova aproveitando o vídeo anterior. As cenas que mudaram vêm de out/cf_cena_<ID>.mp4
(cf_cenas.mjs, 540p) com o mesmo tratamento do cf_final (upscale Lanczos + cor); as que não mudaram são cortadas, quadro a
quadro, do vídeo anterior (já em 1080p). Saída: vídeo mudo 1080p em out/cf_emenda.mp4 (depois: cf_audio + cf_final com COPIA=1).
Uso (de video/remotion): python3 ../scripts/cf_emenda.py <video_anterior.mp4> <timeline_anterior.json>"""
import json, subprocess, sys
from pathlib import Path

ant, tl_ant = sys.argv[1:3]
velho = json.loads(Path(tl_ant).read_text())['cenas']
novo = json.loads(Path('public/timeline_confianca.json').read_text())['cenas']
limpa = lambda c: {**c, 'audio': [{k: v for k, v in a.items() if k != 'txt'} for a in c['audio']]}
ini_v, p = {}, 0
for c in velho: ini_v[c['id']] = p; p += c['dur']
COD = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30', '-an']
segs, corrida = [], None  # corrida = [inicio_no_antigo, quadros]
for cv, cn in zip(velho, novo):
    if limpa(cv) == limpa(cn):
        if corrida and corrida[0] + corrida[1] == ini_v[cn['id']]: corrida[1] += cn['dur']
        else:
            if corrida: segs.append(('velho', *corrida))
            corrida = [ini_v[cn['id']], cn['dur']]
    else:
        if corrida: segs.append(('velho', *corrida)); corrida = None
        segs.append(('nova', cn['id'], cn['dur']))
if corrida: segs.append(('velho', *corrida))
D = Path('out/cf_emenda_seg'); D.mkdir(exist_ok=True)
lista = []
for i, s in enumerate(segs):
    f = D / f'{i:03d}.mp4'
    if s[0] == 'velho':
        a, n = s[1], s[2]
        t = max(0, (a - 0.3) / 30)
        cmd = ['ffmpeg', '-v', 'error', '-y', '-ss', f'{t:.4f}', '-i', ant, '-frames:v', str(n), *COD, str(f)]
    else:
        n = s[2]
        cmd = ['ffmpeg', '-v', 'error', '-y', '-i', f'out/cf_cena_{s[1]}.mp4', '-frames:v', str(n),
               '-vf', 'scale=1920:1080:flags=lanczos,eq=contrast=1.03:saturation=1.08,unsharp=5:5:0.4', *COD, str(f)]
    subprocess.run(cmd, check=True)
    q = int(subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', str(f)], capture_output=True, text=True).stdout.strip().strip(','))
    print(s, '->', q, 'quadros', '' if q == n else 'ERRO')
    assert q == n, (s, q)
    lista.append(f"file '{f.name}'")
(D / 'lista.txt').write_text('\n'.join(lista) + '\n')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(D / 'lista.txt'), '-c', 'copy', 'out/cf_emenda.mp4'], check=True)
print('ok out/cf_emenda.mp4', sum(c['dur'] for c in novo), 'quadros')
