#!/usr/bin/env python3
"""Short do Among Us 5 no formato "você deve estar se perguntando..." (ideia de @SalvadorM_228, no estilo dos Shorts do
Carmim): abre no momento mais absurdo, o narrador pergunta como chegou ali, o vídeo VOLTA (rebobina) e a história é
contada com a voz da própria IA (as falas e os pensamentos do log, com eco nos pensamentos, como no vídeo longo).

História: o Branco (GPT-6.1 Terra), o Traidor da partida 2 do vídeo (amongus/logs5/partida3.json). Os impostores
achavam que ele era parceiro; t15 mata o Caqui (impostor); o Marrom manda "Só nós dois agora" no chat secreto; na
reunião do t17 o Branco confessa ("atirei no Caqui, ele era impostor") e dá empate; os tripulantes vencem e o
Traidor vence junto.
Cortado do vídeo longo (remotion/out/among_us_5.mp4, que segue timeline_au5.json).
Uso: python3 short_au5_traidor.py  → remotion/out/short_au5_traidor.mp4
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au5 as b  # noqa: E402  (narrador e pronúncias do AU5)

ROOT = Path(__file__).resolve().parents[1]
LONGO = ROOT / 'remotion/out/among_us_5.mp4'
TL = json.loads((ROOT / 'remotion/public/timeline_au5.json').read_text())
OUT = ROOT / 'remotion/out/short_au5_traidor.mp4'
TMP = ROOT / 'remotion/out/short_au5_traidor_tmp'
SFX = ROOT / 'remotion/public/sfx'
FPS = 30
FONTE = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'

GANCHO = 'Você deve estar se perguntando como essa IA confessou que matou alguém... e ninguém expulsou ela. Pra entender, a gente tem que voltar.'
ABERTURA = ('p2l', 7.6, 15.8)  # o Branco confessando, com a voz dele
# (cena, de, até) em segundos dentro da cena do vídeo longo, depois da rebobinada
TRECHOS = [
    ('p2a', 0.0, 9.0),    # o Traidor: os impostores acham que ele é parceiro
    ('p2h', 5.4, 16.6),   # "Caqui, vou pra Armas..." e mata o Caqui
    ('p2k', 2.3, 15.9),   # "Só nós dois agora." / pensamento: "Marrom é o último impostor."
    ('p2l', 29.9, 33.0),  # empate, ninguém sai
    ('p2_vit', 3.8, 10.1),  # e o Traidor ganhou junto
]


def cena(sid):
    return next(s for s in TL['scenes'] if s['id'] == sid)


def ass_tempo(t):
    h, r = divmod(max(0, t), 3600)
    m, s = divmod(r, 60)
    return f'{int(h)}:{int(m):02d}:{s:05.2f}'


def legendas_do_trecho(sid, a, z, t):
    """Palavras do narrador (grupos de 4) e as falas das IAs (texto inteiro, menor) que caem no trecho."""
    sc = cena(sid)
    out = []
    ws = [w for w in sc.get('words', []) if a <= w['s'] / FPS < z]
    for i in range(0, len(ws), 4):
        g = ws[i:i + 4]
        fim = min((ws[i + 4]['s'] / FPS) if i + 4 < len(ws) else g[-1]['s'] / FPS + 0.9, z)
        out.append(('L', t + g[0]['s'] / FPS - a, t + fim - a, ' '.join(w['w'] for w in g).upper()))
    chat = sc['visual']['props'].get('chat')
    for c in chat if isinstance(chat, list) else []:
        ini, fim = c['at'] / FPS, c.get('ate', c['at'] + 90) / FPS
        if fim > a and ini < z:
            quem = ('PENSOU: ' if c.get('pensa') else '') + c['cor'].upper()
            out.append(('F', t + max(ini, a) - a, t + min(fim, z) - a, f'{{\\c&H00FFFFFF&\\fs44}}{quem}{{\\N}}{{\\fs56\\c&H0021D2FF&}}{c["texto"]}'))
    return out


def main():
    TMP.mkdir(parents=True, exist_ok=True)
    _, dur_g = b.tts(' '.join(b.bt.spoken(x) for x in GANCHO.split()), b.NARRADOR, TMP / 'gancho')
    s0, a0, z0 = ABERTURA
    ini0 = cena(s0)['start'] / FPS + a0
    legendas = legendas_do_trecho(s0, a0, z0, 0.0)
    t = z0 - a0
    rebob = dur_g + 0.3  # a rebobinada dura o gancho inteiro
    legendas.append(('L', t + 0.1, t + rebob, GANCHO.upper()))
    t_rebob = t
    t += rebob
    partes = []
    for sid, a, z in TRECHOS:
        partes.append((cena(sid)['start'] / FPS + a, z - a))
        legendas += legendas_do_trecho(sid, a, z, t)
        t += z - a
    total = t
    ass = ['[Script Info]', 'PlayResX: 1080', 'PlayResY: 1920', 'WrapStyle: 0', '', '[V4+ Styles]',
           'Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV',
           'Style: L,Inter Display Black,70,&H0021D2FF,&H00000000,&H80000000,1,1,7,3,2,60,60,420',
           'Style: F,Inter Display Black,56,&H0021D2FF,&H00000000,&H80000000,1,1,6,3,2,50,50,330', '',
           '[Events]', 'Format: Layer, Start, End, Style, Text']
    for est, a, z, txt in legendas:
        ani = '{\\fscx80\\fscy80\\t(0,90,\\fscx100\\fscy100)}' if est == 'L' else ''
        ass.append(f'Dialogue: 0,{ass_tempo(a)},{ass_tempo(z)},{est},{ani}{txt}')
    (TMP / 'leg.ass').write_text('\n'.join(ass))

    d0 = z0 - a0
    ent = ['-ss', f'{ini0:.3f}', '-t', f'{d0:.3f}', '-i', str(LONGO),   # 0: abertura
           '-ss', f'{ini0:.3f}', '-t', f'{d0:.3f}', '-i', str(LONGO),   # 1: a mesma, para rebobinar
           '-i', str(TMP / 'gancho.mp3'),                                 # 2: narrador do gancho
           '-i', str(SFX / 'swoosh-fly.mp3')]                             # 3: som da rebobinada
    base = 4
    for ini, d in partes:
        ent += ['-ss', f'{ini:.3f}', '-t', f'{d:.3f}', '-i', str(LONGO)]
    f = [f'[0:v]setpts=PTS-STARTPTS,fps=30[v0]', f'[0:a]asetpts=PTS-STARTPTS,afade=t=out:st={d0 - 0.1:.3f}:d=0.1[a0]',
         # rebobinada: a abertura ao contrário, acelerada para caber no gancho, com cor lavada e listras
         f'[1:v]reverse,setpts=PTS*{rebob / d0:.4f},fps=30,eq=saturation=0.4:contrast=1.15,noise=alls=18:allf=t[vr]',
         f'[2:a]adelay=150|150,apad,atrim=0:{rebob:.3f}[g]', f'[3:a]volume=0.5,apad,atrim=0:{rebob:.3f}[sw]', '[g][sw]amix=inputs=2:normalize=0[ar]']
    rot = ['[v0][a0]', '[vr][ar]']
    for k, (ini, d) in enumerate(partes):
        i = base + k
        f.append(f'[{i}:v]setpts=PTS-STARTPTS,fps=30[v{i}]')
        f.append(f'[{i}:a]asetpts=PTS-STARTPTS,afade=t=in:d=0.08,afade=t=out:st={d - 0.08:.3f}:d=0.08[a{i}]')
        rot.append(f'[v{i}][a{i}]')
    titulo = "drawtext=fontfile={f}:text='{t}':fontsize={s}:fontcolor={c}:borderw=8:bordercolor=black:x=(w-text_w)/2:y={y}"
    f.append(''.join(rot) + f'concat=n={len(rot)}:v=1:a=1[cv][ca]')
    f.append('[cv]split[c1][c2]')
    f.append('[c1]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=28:2,eq=brightness=-0.25[fundo]')
    f.append('[c2]scale=1080:-2:flags=lanczos[meio]')
    f.append('[fundo][meio]overlay=0:(H-h)/2-60,'
             + titulo.format(f=FONTE, t='ELE CONFESSOU', s=100, c='white', y=250) + ','
             + titulo.format(f=FONTE, t='E NÃO SAIU', s=130, c='0xff3b3b', y=370) + ','
             + f"drawtext=fontfile={FONTE}:text='VOLTANDO...':fontsize=90:fontcolor=white:borderw=8:bordercolor=black:x=(w-text_w)/2:y=1450:enable='between(t,{t_rebob:.2f},{t_rebob + rebob:.2f})',"
             + titulo.format(f=FONTE, t='18 IAs no Among Us', s=48, c='0x9fe7ff', y=1780) + ','
             + f"ass={TMP / 'leg.ass'}[vf]")
    f.append('[ca]loudnorm=I=-14:TP=-1.5:LRA=11[af]')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', ';'.join(f), '-map', '[vf]', '-map', '[af]',
                    '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
                    '-movflags', '+faststart', str(OUT)], check=True)
    print(f'{OUT} ({total:.1f} s)')


if __name__ == '__main__':
    main()
