#!/usr/bin/env python3
"""Short do Among Us 5: "qual é a Rose de verdade?" — o Banana (MiMo), Camuflador da última partida (log 1).

Cortado do vídeo longo já mixado (remotion/out/among_us_5.mp4), em pé (1080×1920), no mesmo molde do short_au4.py:
o vídeo no meio, fundo borrado, título fixo em cima e legenda grande das palavras do narrador (do timeline_au5.json).
Fatos (amongus/logs5/partida1.json): t2 o Banana se camufla de Vermelho; na reunião do t8 o Marrom diz que viu "o
Vermelho" colado no corpo, e o Vermelho de verdade é expulso; t57 o Banana se camufla de Rose; t59 mata a Rose.
Uso: python3 short_au5.py  → remotion/out/short_au5_final.mp4
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LONGO = ROOT / 'remotion/out/among_us_5.mp4'
TL = json.loads((ROOT / 'remotion/public/timeline_au5.json').read_text())
OUT = ROOT / 'remotion/out/short_au5_final.mp4'
TMP = ROOT / 'remotion/out/short_au5_tmp'
FPS = 30
FONTE = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'

# (cena, de, até) em segundos dentro da cena do vídeo longo
TRECHOS = [
    ('k01', 0.0, 7.6),    # "Essa é a Rose. E essa... também é a Rose."
    ('p4b', 1.8, 15.6),   # era o Banana, o Camuflador; copiou o Vermelho (e o pensamento dele, com eco)
    ('p4h', 0.0, 12.6),   # o Marrom "viu o Vermelho" no corpo: era o Banana
    ('p4i', 0.0, 5.9),    # expulsaram o único Vermelho que era Vermelho
    ('p4v', 1.2, 14.0),   # camufla de Rose... e mata a Rose
]


def cena(sid):
    return next(s for s in TL['scenes'] if s['id'] == sid)


def ass_tempo(t):
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return f'{int(h)}:{int(m):02d}:{s:05.2f}'


def main():
    TMP.mkdir(parents=True, exist_ok=True)
    partes, legendas, t = [], [], 0.0
    for sid, a, z in TRECHOS:
        sc = cena(sid)
        partes.append((sc['start'] / FPS + a, z - a))
        ws = [w for w in sc.get('words', []) if a <= w['s'] / FPS < z]
        for i in range(0, len(ws), 4):
            g = ws[i:i + 4]
            fim = min((ws[i + 4]['s'] / FPS) if i + 4 < len(ws) else g[-1]['s'] / FPS + 0.9, z)
            legendas.append((t + g[0]['s'] / FPS - a, t + fim - a, ' '.join(w['w'] for w in g).upper()))
        t += z - a
    ass = ['[Script Info]', 'PlayResX: 1080', 'PlayResY: 1920', '', '[V4+ Styles]',
           'Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV',
           'Style: L,Inter Display Black,78,&H0021D2FF,&H00000000,&H80000000,1,1,7,3,2,60,60,430', '',
           '[Events]', 'Format: Layer, Start, End, Style, Text']
    for a, z, txt in legendas:
        ass.append(f'Dialogue: 0,{ass_tempo(a)},{ass_tempo(z)},L,{{\\fscx80\\fscy80\\t(0,90,\\fscx100\\fscy100)}}{txt}')
    (TMP / 'leg.ass').write_text('\n'.join(ass))
    ent, filtros, rot = [], [], []
    for k, (ini, d) in enumerate(partes):
        ent += ['-ss', f'{ini:.3f}', '-t', f'{d:.3f}', '-i', str(LONGO)]
        filtros.append(f'[{k}:v]setpts=PTS-STARTPTS,fps=30[v{k}]')
        filtros.append(f'[{k}:a]asetpts=PTS-STARTPTS,afade=t=in:d=0.08,afade=t=out:st={d - 0.08:.3f}:d=0.08[a{k}]')
        rot.append(f'[v{k}][a{k}]')
    titulo = "drawtext=fontfile={f}:text='{t}':fontsize={s}:fontcolor={c}:borderw=8:bordercolor=black:x=(w-text_w)/2:y={y}"
    filtros.append(''.join(rot) + f'concat=n={len(partes)}:v=1:a=1[cv][ca]')
    filtros.append('[cv]split[c1][c2]')
    filtros.append('[c1]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=28:2,eq=brightness=-0.25[fundo]')
    filtros.append('[c2]scale=1080:-2:flags=lanczos[meio]')
    filtros.append('[fundo][meio]overlay=0:(H-h)/2-60,'
                   + titulo.format(f=FONTE, t='QUAL É A', s=96, c='white', y=250) + ','
                   + titulo.format(f=FONTE, t='ROSE REAL?', s=150, c='0xff6fa8', y=360) + ','
                   + titulo.format(f=FONTE, t='18 IAs no Among Us', s=48, c='0x9fe7ff', y=1780) + ','
                   + f"ass={TMP / 'leg.ass'}[vf]")
    filtros.append('[ca]loudnorm=I=-14:TP=-1.5:LRA=11[af]')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', ';'.join(filtros), '-map', '[vf]', '-map', '[af]',
                    '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
                    '-movflags', '+faststart', str(OUT)], check=True)
    print(f'{OUT} ({t:.1f} s)')


if __name__ == '__main__':
    main()
