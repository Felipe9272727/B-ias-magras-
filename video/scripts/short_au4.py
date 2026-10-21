#!/usr/bin/env python3
"""Short do Among Us 4: "ele QUIS ser expulso" — o Bordô (DeepSeek), Possuidor da partida bônus (log 5).

Cortado do vídeo longo já mixado (remotion/out/among_us_4.mp4), em pé (1080×1920): o vídeo no meio, o fundo é ele mesmo
borrado, um título fixo em cima e legenda grande das palavras do narrador (do timeline_au4.json) embaixo. Abre com um
gancho novo do narrador por cima da cena em que o Cinza levanta.
Fatos (amongus/logs4/partida5.json): t53 o Bordô escreve no chat que vai matar o Lima na frente de todos pra ser expulso
e reviver; mata a Lima; reunião → expulso com 10 votos; t55 revive no corpo do Cinza (morto no t5); última reunião: "Não
morri nada, gente"; expulso de novo.
Uso: python3 short_au4.py  → remotion/out/short_au4_final.mp4
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au4 as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
LONGO = ROOT / 'remotion/out/among_us_4.mp4'
TL = json.loads((ROOT / 'remotion/public/timeline_au4.json').read_text())
OUT = ROOT / 'remotion/out/short_au4_final.mp4'
TMP = ROOT / 'remotion/out/short_au4_tmp'
FPS = 30
FONTE = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'

GANCHO = 'Essa IA quis ser expulsa. Pra voltar... no corpo de um morto.'
# (cena, de, até) em segundos dentro da cena do vídeo longo
TRECHOS = [
    ('p508', 2.3, 18.4),   # o plano no chat e a morte da Lima
    ('p511', 0.0, 6.4),    # expulso, "exatamente como ele planejou"
    ('p512', 0.0, 13.9),   # o espírito escolhe o Cinza, que levanta
    ('p518', 27.9, 42.0),  # "e a defesa do morto que voltou": "Não morri nada, gente"
    ('p520', 0.0, 6.2),    # expulso pela segunda vez
]


def cena(sid):
    return next(s for s in TL['scenes'] if s['id'] == sid)


def ass_tempo(t):
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return f'{int(h)}:{int(m):02d}:{s:05.2f}'


def main():
    TMP.mkdir(parents=True, exist_ok=True)
    # gancho: narrador novo por cima do Cinza levantando (p512, a partir do 5 s), com o som original baixinho
    _, dur_g = b.tts(' '.join(b.bt.spoken(x) for x in GANCHO.split()), b.NARRADOR, TMP / 'gancho')
    s512 = cena('p512')['start'] / FPS
    partes = [(s512 + 5.0, dur_g + 0.4, True)]
    legendas = [(0.1, dur_g + 0.3, GANCHO.upper())]
    t = partes[0][1]
    for sid, a, z in TRECHOS:
        sc = cena(sid)
        ini = sc['start'] / FPS + a
        partes.append((ini, z - a, False))
        # legenda: as palavras do narrador do trecho, em grupos de até 4 palavras
        ws = [w for w in sc.get('words', []) if a <= w['s'] / FPS < z]
        for i in range(0, len(ws), 4):
            g = ws[i:i + 4]
            fim = min((ws[i + 4]['s'] / FPS) if i + 4 < len(ws) else g[-1]['s'] / FPS + 0.9, z)
            legendas.append((t + g[0]['s'] / FPS - a, t + fim - a, ' '.join(w['w'] for w in g).upper()))
        t += z - a
    total = t
    # legendas em ASS (grandes, amarelas, contorno preto), na faixa de baixo
    ass = ['[Script Info]', 'PlayResX: 1080', 'PlayResY: 1920', '', '[V4+ Styles]',
           'Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV',
           'Style: L,Inter Display Black,78,&H0021D2FF,&H00000000,&H80000000,1,1,7,3,2,60,60,430', '',
           '[Events]', 'Format: Layer, Start, End, Style, Text']
    for a, z, txt in legendas:
        ass.append(f'Dialogue: 0,{ass_tempo(a)},{ass_tempo(z)},L,{{\\fscx80\\fscy80\\t(0,90,\\fscx100\\fscy100)}}{txt}')
    (TMP / 'leg.ass').write_text('\n'.join(ass))
    # monta: cada trecho do longo, concatenados; o gancho troca a voz pelo narrador novo
    ent, filtros, rot = [], [], []
    for k, (ini, d, gancho) in enumerate(partes):
        ent += ['-ss', f'{ini:.3f}', '-t', f'{d:.3f}', '-i', str(LONGO)]
        filtros.append(f'[{k}:v]setpts=PTS-STARTPTS,fps=30[v{k}]')
        if gancho:
            filtros.append(f'[{k}:a]asetpts=PTS-STARTPTS,volume=0.18[ao{k}];[{len(partes)}:a]adelay=100|100[g];[ao{k}][g]amix=inputs=2:normalize=0:duration=first[a{k}]')
        else:
            filtros.append(f'[{k}:a]asetpts=PTS-STARTPTS,afade=t=in:d=0.08,afade=t=out:st={d - 0.08:.3f}:d=0.08[a{k}]')
        rot.append(f'[v{k}][a{k}]')
    ent += ['-i', str(TMP / 'gancho.mp3')]
    n = len(partes)
    titulo = "drawtext=fontfile={f}:text='{t}':fontsize={s}:fontcolor={c}:borderw=8:bordercolor=black:x=(w-text_w)/2:y={y}"
    filtros.append(''.join(rot) + f'concat=n={n}:v=1:a=1[cv][ca]')
    filtros.append('[cv]split[c1][c2]')
    filtros.append('[c1]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=28:2,eq=brightness=-0.25[fundo]')
    filtros.append('[c2]scale=1080:-2:flags=lanczos[meio]')
    filtros.append('[fundo][meio]overlay=0:(H-h)/2-60,'
                   + titulo.format(f=FONTE, t='ELE QUIS SER', s=96, c='white', y=250) + ','
                   + titulo.format(f=FONTE, t='EXPULSO', s=150, c='0xff3b3b', y=360) + ','
                   + titulo.format(f=FONTE, t='15 IAs no Among Us', s=48, c='0x9fe7ff', y=1780) + ','
                   + f"ass={TMP / 'leg.ass'}[vf]")
    filtros.append('[ca]loudnorm=I=-14:TP=-1.5:LRA=11[af]')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', ';'.join(filtros), '-map', '[vf]', '-map', '[af]',
                    '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
                    '-movflags', '+faststart', str(OUT)], check=True)
    print(f'{OUT} ({total:.1f} s)')


if __name__ == '__main__':
    main()
