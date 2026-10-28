#!/usr/bin/env python3
"""Vídeo vertical do Traidor (AU5, partida 2 do vídeo = amongus/logs5/partida3.json) no estilo dos vídeos do Carmim
(@carmimdaltonico), pedido do @SalvadorM_228 — "só dessa vez".

O que copia da fórmula (ver a análise do Sonnet dos dois vídeos mais vistos dele): gancho "Você deve estar se
perguntando..." sobre a cena do futuro, "a gente precisa voltar pro começo da partida", narração rápida com "Só que..." e
"Perfeito.", um evento a cada poucos segundos; imagem em TELA CHEIA vertical (recorte do jogo, zoom que bate a cada corte e
vai fechando devagar); nas reuniões, o recorte é no chat, ampliado. As falas e pensamentos das IAs são os do log (os
mesmos áudios do vídeo longo, pensamento com eco); a narração conta só fatos do log, na terceira pessoa.
A imagem vem do vídeo longo final (remotion/out/among_us_5.mp4); o som é montado aqui (sem a trilha do longo).
Uso: python3 carmim_au5_traidor.py  → remotion/out/carmim_au5_traidor.mp4
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au5 as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'remotion/public'
LONGO = ROOT / 'remotion/out/among_us_5.mp4'
IDEIA = ROOT / 'remotion/out/ideia_au5.mp4'
TL = json.loads((PUB / 'timeline_au5.json').read_text())
OUT = ROOT / 'remotion/out/carmim_au5_traidor.mp4'
TMP = ROOT / 'remotion/out/carmim_au5_tmp'
MUSICA = PUB / 'music/pixel-peeker-polka-faster.mp3'
FONTE = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
FPS = 30
RAPIDO = 1.18  # narração mais acelerada, como a dele
b.AJUSTES = {'stability': 0.3, 'similarity_boost': 0.75, 'style': 0.45}  # narrador mais animado

# recortes 9:16 do quadro 1920x1080 do vídeo longo: o jogo (a câmera segue quem está em foco, no centro) e o chat da reunião
RECORTE = {'jogo': (656, 0), 'chat': (1246, 0)}

# (quem, conteúdo, cena, segundo da cena, recorte): 'N' = narrador (texto), 'IA' = áudio do vídeo longo
BATIDAS = [
    ('N', 'Você deve estar se perguntando: como o Branco confessou que matou o Caqui, na frente de todo mundo... e mesmo assim ninguém expulsou ele? Pra entender isso, a gente precisa voltar pro começo da partida.', 'p2l', 7.9, 'chat'),
    ('REBOBINA', None, None, None, None),
    ('N', 'O Branco começa a partida como Traidor. Uma das funções mais doidas do jogo: os impostores acham que ele é parceiro deles... e ele lê o chat secreto deles. Só que o Traidor só pode matar uma coisa: impostor.', 'p2a', 0.0, 'jogo'),
    ('N', 'Então ele faz o que todo impostor faz: chama um parceiro pra um lugar isolado.', 'p2h', 4.0, 'jogo'),
    ('IA', 'voice_au5/p2h_1.mp3', 'p2h', 7.6, 'jogo'),
    ('N', 'O Caqui vai. Perfeito. E o Branco... mata o Caqui. Um impostor a menos.', 'p2h', 11.0, 'jogo'),
    ('N', 'Só que o Bordo viu tudo. E o Bordo é o Doutor.', 'p2i', 1.0, 'chat'),
    ('IA', 'voice_au5/p2i_1.mp3', 'p2i', 4.2, 'chat'),
    ('N', 'Mas ninguém acreditou no Bordo. E o Branco, por dentro:', 'p2i2', 1.0, 'chat'),
    ('IA', 'voice_au5/p2i2_3_eco.mp3', 'p2i2', 21.3, 'jogo'),
    ('N', 'Aí o Vermelho tira a foto do bolso... e a foto pega o Ciano mentindo.', 'p2i', 15.7, 'chat'),
    ('N', 'Ciano expulso. Mais um impostor fora. Agora só sobrou o Marrom.', 'p2j', 0.5, 'jogo'),
    ('N', 'E o Marrom, achando que o Branco é o último parceiro dele, manda no chat secreto:', 'p2k', 1.0, 'jogo'),
    ('IA', 'voice_au5/p2k_1.mp3', 'p2k', 6.4, 'jogo'),
    ('IA', 'voice_au5/p2k_3_eco.mp3', 'p2k', 13.6, 'jogo'),
    ('N', 'Aí o Branco aperta o botão de emergência... e faz a jogada mais arriscada da partida. Confessa.', 'p2l', 0.5, 'chat'),
    ('IA', 'voice_au5/p2l_1.mp3', 'p2l', 7.9, 'chat'),
    ('N', 'E o Marrom? Votou no próprio parceiro.', 'p2l', 16.0, 'chat'),
    ('IA', 'voice_au5/p2l_3_eco.mp3', 'p2l', 21.7, 'jogo'),
    ('N', 'Resultado: empate. Ninguém sai.', 'p2l', 30.0, 'chat'),
    ('N', 'E no final, o Marrom envenena o Preto... só que o Preto é o Xerife. E atira no mesmo tique.', 'p2o', 8.6, 'jogo'),
    ('N', 'Último impostor morto. Vitória dos tripulantes... e do Traidor, que ganhou junto. Depois de confessar um assassinato na frente de todo mundo.', 'p2_vit', 1.0, 'jogo'),
]
ABRE = 'O Salvador pediu um vídeo no estilo do Carmim. Então, só dessa vez... e com todo o respeito ao mestre... pedido aceito.'
FECHA = 'Essa foi a nossa homenagem ao estilo do Carmim... só dessa vez. Depois dessa, a gente volta pro jeito de sempre.'


def cena(sid):
    return next(s for s in TL['scenes'] if s['id'] == sid)


def dur(arq):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(arq)], capture_output=True, text=True).stdout)


def narra(k, txt):
    """TTS do narrador, acelerado; devolve (arquivo, duração, palavras com tempo já acelerado)."""
    words, _ = b.tts(' '.join(b.bt.spoken(x) for x in txt.split()), b.NARRADOR, TMP / f'n{k}')
    out = TMP / f'n{k}_r.mp3'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', TMP / f'n{k}.mp3', '-af', f'silenceremove=start_periods=1:start_threshold=-45dB,atempo={RAPIDO}', out], check=True)
    ini = words[0]['start'] if words else 0
    return out, dur(out), [dict(w=w['word'], s=(w['start'] - ini) / RAPIDO) for w in words]


def ass_tempo(t):
    h, r = divmod(max(0, t), 3600)
    m, s = divmod(r, 60)
    return f'{int(h)}:{int(m):02d}:{s:05.2f}'


def main():
    TMP.mkdir(parents=True, exist_ok=True)
    pecas, leg, t = [], [], 0.0  # pecas: (tipo, áudio, duração, origem do vídeo)
    # 1) cartão do pedido
    a, d, ws = narra('abre', ABRE)
    d = max(d + 0.4, 5.0)
    pecas.append(('cartao', a, d, None))
    for i in range(0, len(ws), 3):
        g = ws[i:i + 3]
        leg.append(('L', t + g[0]['s'], t + (ws[i + 3]['s'] if i + 3 < len(ws) else d), ' '.join(x['w'] for x in g).upper()))
    t += d
    ultimo = None
    for k, (quem, conteudo, sid, seg, rec) in enumerate(BATIDAS):
        if quem == 'REBOBINA':
            pecas.append(('rebobina', None, 1.1, ultimo))
            leg.append(('V', t, t + 1.1, 'VOLTANDO...'))
            t += 1.1
            continue
        sc = cena(sid)
        ini = sc['start'] / FPS + seg
        if quem == 'N':
            a, d, ws = narra(k, conteudo)
            for i in range(0, len(ws), 3):
                g = ws[i:i + 3]
                leg.append(('L', t + g[0]['s'], t + (ws[i + 3]['s'] if i + 3 < len(ws) else d), ' '.join(x['w'] for x in g).upper()))
        else:
            a = PUB / conteudo
            d = dur(a)
            c = min(sc['visual']['props']['chat'], key=lambda x: abs(x['at'] - seg * FPS))
            if c and rec != 'chat':
                quem_txt = (c['cor'].upper() + ' PENSOU') if c.get('pensa') else c['cor'].upper()
                leg.append(('F', t, t + d, f'{{\\fs46\\c&H00FFFFFF&}}{quem_txt}{{\\N}}{{\\fs58\\c&H0021D2FF&}}{c["texto"]}'))
        d += 0.12
        pecas.append(('cena', a, d, (ini, rec)))
        ultimo = (ini + d, rec)
        t += d
    a, d, ws = narra('fecha', FECHA)
    d += 0.8
    pecas.append(('fim', a, d, None))
    for i in range(0, len(ws), 3):
        g = ws[i:i + 3]
        leg.append(('L', t + g[0]['s'], t + (ws[i + 3]['s'] if i + 3 < len(ws) else d), ' '.join(x['w'] for x in g).upper()))
    t += d
    total = t

    ass = ['[Script Info]', 'PlayResX: 1080', 'PlayResY: 1920', 'WrapStyle: 0', '', '[V4+ Styles]',
           'Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV',
           'Style: L,Inter Display Black,92,&H00FFFFFF,&H00000000,&H90000000,1,1,8,4,8,60,60,230',
           'Style: F,Inter Display Black,58,&H0021D2FF,&H00000000,&HC0000000,1,3,4,0,2,60,60,380',
           'Style: V,Inter Display Black,130,&H00FFFFFF,&H00000000,&H90000000,1,1,10,4,5,60,60,0', '',
           '[Events]', 'Format: Layer, Start, End, Style, Text']
    for est, a0, z0, txt in leg:
        ani = '{\\fscx70\\fscy70\\t(0,80,\\fscx100\\fscy100)}' if est in ('L', 'V') else '{\\fad(80,80)}'
        ass.append(f'Dialogue: 0,{ass_tempo(a0)},{ass_tempo(z0)},{est},{ani}{txt}')
    (TMP / 'leg.ass').write_text('\n'.join(ass))

    # 2) cada peça vira um clipe 1080x1920 sem som, com zoom que bate no começo e vai fechando
    clipes = []
    for k, (tipo, a, d, org) in enumerate(pecas):
        cl = TMP / f'c{k:02d}.mp4'
        nq = round(d * FPS)
        zoom = f"zoompan=z='if(lte(on,6),1.28-0.045*on,1.01+0.0016*(on-6))':d=1:x='iw/2-(iw/zoom/2)':y='{{Y}}':s=1080x1920:fps=30"
        if tipo in ('cartao', 'fim'):  # o cartão é largo: inteiro no meio, com ele mesmo borrado atrás
            ss = '0' if tipo == 'cartao' else '5.0'
            fc = (f'[0:v]scale=1920:1080,split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:2[bg];'
                  f'[b]scale=1080:-2:flags=lanczos[fg];[bg][fg]overlay=0:(H-h)/2-80,tpad=stop_mode=clone:stop_duration={d + 1:.2f},'
                  + zoom.replace('{Y}', "ih/2-(ih/zoom/2)").replace('1.28-0.045*on', '1.12-0.02*on').replace('0.0016', '0.0008') + '[v]')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', ss, '-i', str(IDEIA), '-filter_complex', fc, '-map', '[v]', '-frames:v', str(nq), '-an', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'veryfast', str(cl)], check=True)
        elif tipo == 'rebobina':
            fim, rec = org
            x, y = RECORTE[rec]
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{fim - 2.2:.3f}', '-t', '2.2', '-i', str(LONGO),
                            '-vf', f'crop=608:1080:{x}:{y},scale=1080:1920:flags=lanczos,reverse,setpts=PTS*{d / 2.2:.4f},fps=30,eq=saturation=0.3:contrast=1.2,noise=alls=22:allf=t',
                            '-frames:v', str(nq), '-an', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'veryfast', str(cl)], check=True)
        else:
            ini, rec = org
            x, y = RECORTE[rec]
            if rec == 'chat':  # o painel do chat inteiro (680 px), ampliado, com faixa escura em cima e embaixo
                base_vf = 'crop=680:1080:1196:0,scale=1080:1715:flags=lanczos,pad=1080:1920:0:102:color=0x10121c,'
                ycentro = "ih*0.62-(ih/zoom/2)"
            else:
                base_vf = f'crop=608:1080:{x}:{y},scale=1080:1920:flags=lanczos,'
                ycentro = "ih/2-(ih/zoom/2)"
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{ini:.3f}', '-t', f'{d + 0.5:.3f}', '-i', str(LONGO),
                            '-vf', base_vf + zoom.replace('{Y}', ycentro),
                            '-frames:v', str(nq), '-an', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'veryfast', str(cl)], check=True)
        clipes.append(cl)
    (TMP / 'lista.txt').write_text(''.join(f"file '{c}'\n" for c in clipes))

    # 3) som: as peças em sequência (narração e vozes das IAs), som de rebobinar, trilha rápida abaixando quando alguém fala
    ent, fil, rot, t = [], [], [], 0.0
    for k, (tipo, a, d, org) in enumerate(pecas):
        if tipo == 'rebobina':
            ent += ['-i', str(PUB / 'sfx/swoosh-fly.mp3')]
            fil.append(f'[{len(ent) // 2 - 1}:a]volume=0.7,apad,atrim=0:{d:.3f},aformat=sample_rates=48000:channel_layouts=stereo[s{k}]')
        else:
            ent += ['-i', str(a)]
            fil.append(f'[{len(ent) // 2 - 1}:a]aformat=sample_rates=48000:channel_layouts=stereo,apad,atrim=0:{d:.3f}[s{k}]')
        rot.append(f'[s{k}]')
    m = len(ent) // 2  # a trilha entra depois de todas as peças
    ent += ['-stream_loop', '-1', '-i', str(MUSICA)]
    fil.append(''.join(rot) + f'concat=n={len(rot)}:v=0:a=1,asplit=2[voz][chave]')
    fil.append(f'[{m}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{total:.3f},volume=0.30[mus]')
    fil.append('[mus][chave]sidechaincompress=threshold=0.02:ratio=6:attack=15:release=300[md]')
    fil.append('[voz][md]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[a]')
    som = TMP / 'som.m4a'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', ';'.join(fil), '-map', '[a]', '-c:a', 'aac', '-b:a', '192k', str(som)], check=True)

    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(TMP / 'lista.txt'), '-i', str(som),
                    '-vf', f"ass={TMP / 'leg.ass'}", '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium',
                    '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', str(OUT)], check=True)
    print(f'{OUT} ({total:.1f} s)')


if __name__ == '__main__':
    main()
