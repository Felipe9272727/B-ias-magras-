#!/usr/bin/env python3
"""Vídeo vertical do Traidor (AU5, partida 2 do vídeo = amongus/logs5/partida3.json) no estilo dos vídeos do Carmim
(@carmimdaltonico), pedido do @SalvadorM_228 — "só dessa vez".

Feito a partir da análise quadro a quadro (4 Haikus) do vídeo dele "COMO EU FUI O ÚNICO QUE DESCOBRIU O IMPOSTOR":
- gancho com a cena do futuro e legenda palavra por palavra (fonte pixelada, branca, no terço de baixo);
- a volta no tempo é uma RAJADA: tela preta curta e uns 10 cortes de 0,25 s de partes diferentes da partida, terminando
  num flash da vitória; depois o cartão "A sua função é" com o nome da função em glitch;
- corte (ou mudança de enquadramento com zoom batendo) a cada 1,5 s no máximo; tela cheia, nada parado;
- reunião: o chat ampliado; final com vitória e a frase de efeito em caixa alta.
As falas e pensamentos das IAs são os do log (os mesmos áudios do vídeo longo, pensamento com eco); a narração conta só
fatos do log. A imagem vem do vídeo longo final (remotion/out/among_us_5.mp4); o som é montado aqui.
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
# a batida de "Impostor" (M4rkim), que o Carmim usa nos Shorts: voz tirada com o Demucs; começa já na batida
MUSICA = PUB / 'music/impostor-m4rkim-beat.mp3'
MUSICA_INI = 0.0
PIXEL = str(PUB / 'fonts/Silkscreen-Bold.ttf')
FPS = 30
RAPIDO = 1.25
MAX_PLANO = 1.5  # nenhum plano dura mais que isso: corta (muda o enquadramento) com zoom batendo
b.AJUSTES = {'stability': 0.25, 'similarity_boost': 0.75, 'style': 0.55}

# (quem, conteúdo, cena, segundo da cena, recorte[, nome]) — 'N' narrador; 'IA' áudio de fala/pensamento do vídeo longo
BATIDAS = [
    ('N', 'Você deve estar se perguntando: como o Branco confessou que matou o Caqui, na frente de todo mundo... e ninguém expulsou ele?', 'p2l', 7.9, 'chat'),
    ('N', 'Pra entender isso, a gente precisa voltar pro começo da partida.', 'RAJADA', None, None),
    ('FUNCAO', 'TRAIDOR', None, None, None),
    ('N', 'Uma das funções mais doidas do jogo: os impostores acham que ele é parceiro deles, e ele lê o chat secreto. Só que o Traidor só mata uma coisa: impostor.', 'p2a', 1.0, 'jogo'),
    ('N', 'Então ele chama um impostor pra um lugar isolado.', 'p2h', 4.0, 'jogo'),
    ('IA', 'voice_au5/p2h_1', 'p2h', 7.6, 'jogo', 'Branco'),
    ('N', 'O Caqui vai. Perfeito. E o Branco mata o Caqui.', 'p2h', 11.2, 'jogo'),
    ('N', 'Só que o Bordo viu tudo.', 'p2i', 1.0, 'chat'),
    ('IA', 'voice_au5/p2i_1', 'p2i', 4.2, 'chat', 'Bordo'),
    ('N', 'Mas ninguém acreditou no Bordo. E o Branco, por dentro:', 'p2i2', 1.0, 'chat'),
    ('IA', 'voice_au5/p2i2_3_eco', 'p2i2', 21.3, 'jogo', 'Branco pensou'),
    ('N', 'Aí a foto do Vermelho pega o Ciano mentindo. Ciano expulso. Impostor.', 'p2i', 15.7, 'chat'),
    ('N', 'Agora só sobrou o Marrom. E ele manda pro único parceiro que acha que tem:', 'p2k', 1.0, 'jogo'),
    ('IA', 'voice_au5/p2k_1', 'p2k', 6.4, 'jogo', 'Marrom'),
    ('IA', 'voice_au5/p2k_3_eco', 'p2k', 13.6, 'jogo', 'Branco pensou'),
    ('N', 'Aí o Branco aperta o botão... e faz a jogada mais arriscada da partida. Confessa.', 'p2l', 0.5, 'chat'),
    ('IA', 'voice_au5/p2l_1', 'p2l', 7.9, 'chat', 'Branco'),
    ('N', 'E o Marrom? Votou no próprio parceiro. Resultado: empate. Ninguém sai.', 'p2l', 21.0, 'chat'),
    ('N', 'No fim, o Marrom envenena o Preto... só que o Preto é o Xerife. E atira no mesmo tique.', 'p2o', 8.6, 'jogo'),
    ('N', 'Vitória dos tripulantes. E do Traidor, que ganhou junto.', 'p2_vit', 1.0, 'jogo'),
    ('PUNCH', 'CONFESSOU UM ASSASSINATO|E GANHOU', 'p2_vit', 3.0, 'jogo'),
]
ABRE = 'O Salvador pediu um vídeo no estilo do Carmim. Então, só dessa vez... e com todo o respeito ao mestre... pedido aceito.'
FECHA = 'Essa foi a nossa homenagem ao estilo do Carmim... só dessa vez. Depois dessa, a gente volta pro jeito de sempre.'
# a rajada da volta no tempo: (cena, segundo) de partes diferentes da partida; a última é o flash da vitória
RAJADA = [('p2l', 12.0), ('p2o', 15.0), ('p2k', 7.0), ('p2j', 2.0), ('p2i', 20.0), ('p2h', 12.5), ('p2d', 5.0), ('p2c', 6.0), ('p2b', 8.0), ('p2a', 3.0), ('p2_vit', 2.5)]
RECORTE = {'jogo': 'crop=608:1080:656:0,scale=1080:1920:flags=lanczos',
           'chat': 'crop=680:1080:1196:0,scale=1080:1715:flags=lanczos,pad=1080:1920:0:102:color=0x10121c'}


def cena(sid):
    return next(s for s in TL['scenes'] if s['id'] == sid)


def dur(arq):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(arq)], capture_output=True, text=True).stdout)


def narra(k, txt):
    """TTS do narrador, acelerado; devolve (arquivo, duração, palavras com o tempo já acelerado)."""
    words, _ = b.tts(' '.join(b.bt.spoken(x) for x in txt.split()), b.NARRADOR, TMP / f'n{k}')
    out = TMP / f'n{k}_r.mp3'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', TMP / f'n{k}.mp3', '-af', f'silenceremove=start_periods=1:start_threshold=-45dB,atempo={RAPIDO}', out], check=True)
    ini = words[0]['start'] if words else 0
    return out, dur(out), [dict(w=w['word'], s=(w['start'] - ini) / RAPIDO) for w in words]


def ass_tempo(t):
    h, r = divmod(max(0, t), 3600)
    m, s = divmod(r, 60)
    return f'{int(h)}:{int(m):02d}:{s:05.2f}'


def palavras_leg(ws, t, d, cor='&H00FFFFFF&'):
    """Legenda de 1 ou 2 palavras por vez (como a dele)."""
    out, i = [], 0
    while i < len(ws):
        n = 2 if len(ws[i]['w']) <= 4 and i + 1 < len(ws) else 1
        g = ws[i:i + n]
        fim = ws[i + n]['s'] if i + n < len(ws) else d
        out.append(('L', t + g[0]['s'], t + fim, f'{{\\c{cor}}}' + ' '.join(x['w'] for x in g).upper()))
        i += n
    return out


def clipe(saida, ini, d, rec, zoom_base=1.0, deslize=0):
    """Um plano de d segundos: recorte 9:16, zoom que bate no começo (punch) e vai fechando; deslize em px."""
    nq = max(1, round(d * FPS))
    y = "ih*0.62-(ih/zoom/2)" if rec == 'chat' else "ih/2-(ih/zoom/2)"
    z = f"zoompan=z='{zoom_base}*(if(lte(on,5),1.22-0.044*on,1+0.002*(on-5)))':d=1:x='iw/2-(iw/zoom/2)+{deslize}':y='{y}':s=1080x1920:fps=30"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{ini:.3f}', '-t', f'{d + 0.4:.3f}', '-i', str(LONGO), '-vf', RECORTE[rec] + ',' + z,
                    '-frames:v', str(nq), '-an', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'veryfast', str(saida)], check=True)


def cartao(saida, d, ss):
    """O cartão do pedido (largo): inteiro no meio, com ele mesmo borrado atrás."""
    fc = ('[0:v]scale=1920:1080,split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:2[bg];'
          f'[b]scale=1080:-2:flags=lanczos[fg];[bg][fg]overlay=0:(H-h)/2-80,tpad=stop_mode=clone:stop_duration={d + 1:.2f}[v]')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', ss, '-i', str(IDEIA), '-filter_complex', fc, '-map', '[v]', '-frames:v', str(round(d * FPS)),
                    '-an', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'veryfast', str(saida)], check=True)


def main():
    TMP.mkdir(parents=True, exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', '0.5', str(TMP / 'sil.mp3')], check=True)
    pecas, leg, t = [], [], 0.0  # pecas: (áudio, duração, [planos de vídeo])
    nplano = [0]

    def novo():
        nplano[0] += 1
        return TMP / f'v{nplano[0]:03d}.mp4'

    def planos(ini, d, rec):
        """Quebra a peça em planos de até MAX_PLANO s, cada um com outro zoom/deslize (a imagem segue andando)."""
        fs, feito, k = [], 0.0, 0
        variacoes = [(1.0, 0), (1.18, 60), (1.08, -50), (1.28, 0)]
        while feito < d - 0.01:
            dd = min(MAX_PLANO, d - feito)
            zb, dz = variacoes[k % len(variacoes)]
            arq = novo()
            clipe(arq, ini + feito, dd, rec, zb if rec == 'jogo' else 1.0 + (zb - 1) * 0.5, dz)
            fs.append(arq)
            feito += dd
            k += 1
        return fs

    # 1) cartão do pedido (o comentário do @SalvadorM_228 e a inspiração no Carmim)
    a, d, ws = narra('abre', ABRE)
    d = max(d + 0.3, 5.0)
    arq = novo()
    cartao(arq, d, '0')
    pecas.append((a, d, [arq]))
    leg += palavras_leg(ws, t, d)
    t += d

    for k, bt_ in enumerate(BATIDAS):
        quem, conteudo, sid = bt_[0], bt_[1], bt_[2]
        if quem == 'FUNCAO':  # cartão "A sua função é" com o nome em glitch (como a tela de função do jogo)
            d = 2.4
            arq = novo()
            gl = "if(between(t\\,0.5\\,0.8)+between(t\\,1.4\\,1.55)\\,{v}\\,0)"
            txt = (f"drawtext=fontfile={PIXEL}:text='A SUA FUNÇÃO É':fontsize=64:fontcolor=white:x=(w-text_w)/2:y=640,"
                   f"drawtext=fontfile={PIXEL}:text='{conteudo}':fontsize=150:fontcolor=0xff3355@0.8:x=(w-text_w)/2+{gl.format(v=-22)}:y=760,"
                   f"drawtext=fontfile={PIXEL}:text='{conteudo}':fontsize=150:fontcolor=0x33e6ff@0.8:x=(w-text_w)/2+{gl.format(v=22)}:y=760,"
                   f"drawtext=fontfile={PIXEL}:text='{conteudo}':fontsize=150:fontcolor=white:x=(w-text_w)/2:y=760,"
                   f"drawtext=fontfile={PIXEL}:text='MATE SÓ IMPOSTORES':fontsize=48:fontcolor=0x9fe7ff:x=(w-text_w)/2:y=960")
            ini = cena('p2a')['start'] / FPS + 2.0  # o Branco (recorte do jogo) embaixo do nome
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'color=c=black:s=1080x1920:d={d}:r=30', '-ss', f'{ini:.3f}', '-t', f'{d:.3f}', '-i', str(LONGO),
                            '-filter_complex', f'[1:v]crop=420:420:750:330,scale=560:560[p];[0:v][p]overlay=(W-w)/2:1080,{txt}[v]', '-map', '[v]', '-frames:v', str(round(d * FPS)),
                            '-an', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'veryfast', str(arq)], check=True)
            pecas.append((TMP / 'sil.mp3', d, [arq]))
            t += d
            continue
        if quem == 'PUNCH':  # frase de efeito final em caixa alta, por cima da vitória
            d = 2.6
            l1, l2 = conteudo.split('|')
            arq = novo()
            clipe(arq, cena(sid)['start'] / FPS + bt_[3], d, 'jogo', 1.1)
            pecas.append((TMP / 'sil.mp3', d, [arq]))
            leg.append(('P', t, t + d, f'{l1}\\N{{\\c&H003B3BFF&}}{l2}'))
            t += d
            continue
        if quem == 'N':
            a, d, ws = narra(k, conteudo)
            leg += palavras_leg(ws, t, d)
        else:
            a = PUB / f'{conteudo}.mp3'
            d = dur(a)
            base = conteudo.replace('_eco', '')
            ws = [dict(w=w['word'], s=w['start']) for w in json.loads((PUB / f'{base}.words.json').read_text())['words']]
            leg.append(('N', t, t + d, bt_[5].upper()))
            leg += palavras_leg(ws, t, d, '&H0021D2FF&')
        d += 0.1
        if sid == 'RAJADA':  # a fala da ponte cobre a rajada: preto curto, ~10 cortes de 0,25 s, flash da vitória
            fs = []
            arq = novo()
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=black:s=1080x1920:d=0.2:r=30', '-frames:v', '6', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '17', str(arq)], check=True)
            fs.append(arq)
            passo = max(0.2, (d - 0.2) / len(RAJADA))
            for j, (rs, rseg) in enumerate(RAJADA):
                arq = novo()
                clipe(arq, cena(rs)['start'] / FPS + rseg, passo, 'chat' if rs in ('p2l', 'p2i', 'p2d') else 'jogo', 1.15 if j % 2 else 1.0, 40 if j % 3 == 0 else -40)
                fs.append(arq)
            dd = 0.2 + round(passo * FPS) / FPS * len(RAJADA)
            pecas.append((a, dd, fs))
            t += dd
            continue
        ini = cena(sid)['start'] / FPS + bt_[3]
        pecas.append((a, d, planos(ini, d, bt_[4])))
        t += d

    a, d, ws = narra('fecha', FECHA)
    d += 0.8
    arq = novo()
    cartao(arq, d, '5.0')
    pecas.append((a, d, [arq]))
    leg += palavras_leg(ws, t, d)
    t += d
    total = t

    ass = ['[Script Info]', 'PlayResX: 1080', 'PlayResY: 1920', 'WrapStyle: 0', '', '[V4+ Styles]',
           'Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV',
           'Style: L,Silkscreen,92,&H00FFFFFF,&H00000000,&H90000000,1,1,7,3,2,50,50,620',
           'Style: N,Silkscreen,46,&H00FFFFFF,&H00000000,&H90000000,1,1,5,2,2,50,50,760',
           'Style: P,Silkscreen,96,&H00FFFFFF,&H00000000,&H90000000,1,1,8,4,5,60,60,0', '',
           '[Events]', 'Format: Layer, Start, End, Style, Text']
    for est, a0, z0, txt in leg:
        ani = '{\\fscx80\\fscy80\\t(0,60,\\fscx100\\fscy100)}' if est in ('L', 'P') else ''
        ass.append(f'Dialogue: 0,{ass_tempo(a0)},{ass_tempo(z0)},{est},{ani}{txt}')
    (TMP / 'leg.ass').write_text('\n'.join(ass))

    todos = [arq for _, _, fs in pecas for arq in fs]
    (TMP / 'lista.txt').write_text(''.join(f"file '{c}'\n" for c in todos))
    ent, fil, rot = [], [], []
    for k, (a, d, _) in enumerate(pecas):
        ent += ['-i', str(a)]
        fil.append(f'[{k}:a]aformat=sample_rates=48000:channel_layouts=stereo,apad,atrim=0:{d:.3f}[s{k}]')
        rot.append(f'[s{k}]')
    m = len(pecas)
    ent += ['-stream_loop', '-1', '-ss', f'{MUSICA_INI:.2f}', '-i', str(MUSICA)]
    fil.append(''.join(rot) + f'concat=n={len(rot)}:v=0:a=1,asplit=2[voz][chave]')
    fil.append(f'[{m}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{total:.3f},volume=0.32[mus]')
    fil.append('[mus][chave]sidechaincompress=threshold=0.02:ratio=5:attack=15:release=250[md]')
    fil.append('[voz][md]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[a]')
    som = TMP / 'som.m4a'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', ';'.join(fil), '-map', '[a]', '-c:a', 'aac', '-b:a', '192k', str(som)], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(TMP / 'lista.txt'), '-i', str(som),
                    '-vf', f"ass={TMP / 'leg.ass'}:fontsdir={PUB / 'fonts'}", '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium',
                    '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', str(OUT)], check=True)
    print(f'{OUT} ({total:.1f} s, {len(todos)} planos)')


if __name__ == '__main__':
    main()
