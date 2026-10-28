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
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au5 as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'remotion/public'
LONGO = Path(os.environ.get('LONGO', ROOT / 'remotion/out/among_us_5.mp4'))
# o render 540p também serve: sobe pra 1080p (Lanczos) antes do recorte
PRE = 'scale=1920:1080:flags=lanczos,'
IDEIA = ROOT / 'remotion/out/ideia_au5.mp4'
TL = json.loads((PUB / 'timeline_au5.json').read_text())
OUT = ROOT / 'remotion/out/carmim_au5_traidor.mp4'
TMP = ROOT / 'remotion/out/carmim_au5_tmp'
# Ele troca de música conforme a história anda (no vídeo de referência: Delirious, New Beginnings e Treasure Hunt,
# do Epidemic Sound, que é pago). Aqui: três faixas livres (Kevin MacLeod, CC BY), cada uma começando na batida
# cujo texto começa assim.
# Faixas com mais ataques por segundo (librosa: as dele têm 5,3 a 6,0; estas, 6,4 a 7,0).
MUSICAS = [('', 'itty-bitty-8-bit.mp3'),
           ('Só que tinha um problema', 'bit-shift.mp3'),
           ('Então eu aperto o botão', 'mega-hyper-ultrastorm.mp3')]
# selos que pulam na tela no começo da batida (fatos do log): texto, cor da caixa (ASS, BGR), som
SELOS = {'O Caqui vem': ('ELIMINADO', '&H002020D0&', 'boom.mp3'),
         'Só que tinha um problema': ('TESTEMUNHA', '&H0000A5E6&', 'pop.mp3'),
         'Repara no final': ('DUTO!', '&H000070F0&', 'pop.mp3'),
         'Marrom|': ('CHAT SECRETO', '&H004030B0&', 'pop.mp3'),
         'A votação racha': ('CIANO EXPULSO', '&H00C08020&', 'pop.mp3'),
         'Então eu aperto o botão': ('BOTÃO!', '&H002020D0&', 'boom.mp3'),
         'Lembra do duto?': ('EMPATE 6 x 6', '&H00309030&', 'pop.mp3'),
         'No fim, o Marrom': ('XERIFE', '&H0000A5E6&', 'pop.mp3')}
# tremida de tela + clarão no primeiro plano destas batidas
TREMER = ('O Caqui vem', 'Então eu aperto o botão', 'voice_au5/p2l_1')
FX_TREME = (",crop=iw-48:ih-48:'24+24*sin(n*2.9)*lt(n,10)':'24+24*cos(n*3.7)*lt(n,10)',scale=1080:1920,"
            "fade=t=in:st=0:d=0.25:color=white")
# a rebobinada: cada pedaço passa ao contrário, com cara de fita (cor separada e chiado)
FX_REBOBINA = ',reverse,rgbashift=rh=-10:bh=10,noise=alls=28:allf=t,eq=saturation=1.35'
PIXEL = str(PUB / 'fonts/Silkscreen-Bold.ttf')
FPS = 30
RAPIDO = 1.45  # o Branco a ~4,2 palavras/s (o Carmim fala 3,84, sem pausa: nenhuma passa de 0,3 s)
RAPIDO_IA = 1.2
MAX_PLANO = 1.5  # nenhum plano dura mais que isso: corta (muda o enquadramento) com zoom batendo
b.AJUSTES = {'stability': 0.25, 'similarity_boost': 0.75, 'style': 0.55}

# (quem, conteúdo, cena, segundo da cena, recorte[, nome, (x, y) de quem fala no quadro 1080p]) — 'N' narrador; 'IA' áudio de fala/pensamento do vídeo longo
# Como nos vídeos dele, quem conta a história é o próprio jogador, em primeira pessoa: aqui o Branco, com a voz do
# Branco ('B'). Tudo o que ele narra são fatos do log (partida3.json); opinião e plano só aparecem nas falas e
# pensamentos dele copiados do log ('IA'). 'TTS': fala do log que o vídeo longo não tinha gravado, na voz da cor.
BATIDAS = [
    ('B', 'Você deve estar se perguntando como eu confessei um assassinato na frente da nave inteira... e ninguém me expulsou.', 'p2l', 7.9, 'chat'),
    ('B', 'Pra entender isso, a gente precisa voltar pro começo da partida.', 'RAJADA', None, None),
    ('FUNCAO', 'TRAIDOR', None, None, None),
    ('B', 'Eu começo o jogo como Traidor. Os impostores acham que eu sou um deles, e eu leio o chat secreto. Só que eu só posso matar uma coisa: impostor.', 'p2a', 1.0, 'jogo'),
    ('B', 'Então eu chamo um impostor pra um lugar vazio.', 'p2h', 4.0, 'jogo'),
    ('IA', 'voice_au5/p2h_1', 'p2h', 7.6, 'jogo', 'Branco', (914, 450)),
    ('B', 'O Caqui vem. E eu elimino o Caqui.', 'p2h', 11.2, 'jogo'),
    ('B', 'Só que tinha um problema: o Bordo viu tudo.', 'p2i', 1.0, 'chat'),
    ('IA', 'voice_au5/p2i_1', 'p2i', 4.2, 'chat', 'Bordo', (924, 670)),
    ('B', 'Repara no final: o Marrom saiu de um duto em Armas. Segura essa informação. E eu sabia que era verdade, porque o próprio Marrom tinha escrito no chat secreto:', 'p2i', 9.0, 'chat'),
    ('TTS', 'Marrom|Estou saindo pelo duto pra Armas; Branco/Bordo vão me ver.', 'p2k', 3.5, 'jogo', 'Marrom', (300, 880)),  # zoom na própria mensagem, no chat dos impostores
    ('IA', 'voice_au5/p2i2_3_eco', 'p2i2', 21.3, 'jogo', 'Branco pensou', (600, 460)),
    ('TTS', 'Branco|Bordo está errado sobre mim. Vi o Marrom sair do duto em Armas; ele precisa explicar isso.', 'p2i2', 16.5, 'chat', 'Branco', (565, 430)),
    ('B', 'A votação racha, e quem sai é o Ciano. Também impostor.', 'p2i', 15.7, 'chat'),
    ('B', 'Agora o Marrom acha que só sobrou nós dois.', 'p2k', 1.0, 'jogo'),
    ('IA', 'voice_au5/p2k_1', 'p2k', 6.4, 'jogo', 'Marrom', (960, 440)),
    ('IA', 'voice_au5/p2k_3_eco', 'p2k', 13.6, 'jogo', 'Branco pensou', (1000, 450)),
    ('B', 'Então eu aperto o botão. E faço a jogada mais arriscada da partida: eu confesso.', 'p2l', 0.5, 'chat'),
    ('IA', 'voice_au5/p2l_1', 'p2l', 7.9, 'chat', 'Branco', (596, 456)),
    ('B', 'Lembra do duto? O Bordo também tinha visto o Marrom sair dele. A nave racha no meio: seis votos em mim, seis no Marrom. Empate. Ninguém sai.', 'p2l', 21.0, 'chat'),
    ('B', 'No fim, o Marrom envenena o Preto. Só que o Preto é o Xerife, e atira no Marrom no mesmo tique.', 'p2o', 8.6, 'jogo'),
    ('B', 'Vitória dos tripulantes. E minha também.', 'p2_vit', 1.0, 'jogo'),
    ('PUNCH', 'CONFESSEI UM ASSASSINATO|E GANHEI', 'p2o', 12.0, 'jogo'),
]
ABRE = 'O Salvador pediu um vídeo no estilo do Carmim. Então, só dessa vez... e com todo o respeito ao mestre... pedido aceito.'
FECHA = 'Essa foi a nossa homenagem ao estilo do Carmim... só dessa vez. Depois dessa, a gente volta pro jeito de sempre.'
# a rajada da volta no tempo: (cena, segundo) de partes diferentes da partida; a última é o flash da vitória
RAJADA = [('p2o', 15.0), ('p2o', 5.0), ('p2n2', 3.0), ('p2n', 4.0), ('p2l', 12.0), ('p2l', 3.0), ('p2k', 7.0), ('p2i2', 10.0), ('p2i', 20.0),
          ('p2h', 12.5), ('p2f2', 4.0), ('p2f', 3.0), ('p2d2', 3.0), ('p2d', 5.0), ('p2c', 6.0), ('p2b', 8.0), ('p2a', 3.0), ('p2_vit', 2.5)]
RECORTE = {'jogo': 'crop=608:1080:{x}:0,scale=1080:1920:flags=lanczos',
           'grade': 'crop=680:1080:240:0,scale=1080:1715:flags=lanczos,pad=1080:1920:0:102:color=0x10121c',
           'chat': 'crop=680:1080:1196:0,scale=1080:1715:flags=lanczos,pad=1080:1920:0:102:color=0x10121c'}


def cena(sid):
    return next(s for s in TL['scenes'] if s['id'] == sid)


def dur(arq):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(arq)], capture_output=True, text=True).stdout)


def narra(k, txt, voz=None, rapido=RAPIDO):
    """TTS (narrador do canal, ou a voz de uma cor), acelerado; devolve (arquivo, duração, palavras no tempo acelerado)."""
    words, _ = b.tts(' '.join(b.bt.spoken(x) for x in txt.split()), voz or b.NARRADOR, TMP / f'n{k}')
    out = TMP / f'n{k}_r.mp3'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', TMP / f'n{k}.mp3', '-af', f'silenceremove=start_periods=1:start_threshold=-45dB,atempo={rapido}', out], check=True)
    ini = words[0]['start'] if words else 0
    return out, dur(out), [dict(w=w['word'], s=(w['start'] - ini) / rapido) for w in words]


def ass_tempo(t):
    h, r = divmod(max(0, t), 3600)
    m, s = divmod(r, 60)
    return f'{int(h)}:{int(m):02d}:{s:05.2f}'


def palavras_leg(ws, t, d, cor='&H00FFFFFF&', est='L'):
    """Legenda de 1 ou 2 palavras por vez (como a dele)."""
    out, i = [], 0
    while i < len(ws):
        n = 2 if len(ws[i]['w']) <= 4 and i + 1 < len(ws) else 1
        g = ws[i:i + n]
        fim = ws[i + n]['s'] if i + n < len(ws) else d
        out.append((est, t + g[0]['s'], t + fim, f'{{\\c{cor}}}' + ' '.join(x['w'] for x in g).upper()))
        i += n
    return out


def clipe(saida, ini, d, rec, zoom_base=1.0, deslize=0, fx=''):
    """Um plano de d segundos: recorte 9:16, zoom que bate no começo (punch) e vai fechando; deslize em px."""
    # sem zoom (o Felipe achou maçante): só o recorte parado; o ritmo vem dos cortes
    nq = max(1, round(d * FPS))
    rc = RECORTE[rec].replace('{x}', str(min(max(656 + deslize, 0), 1312)))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{ini:.3f}', '-t', f'{d + 0.4:.3f}', '-i', str(LONGO), '-vf', PRE + rc + ',fps=30' + fx,
                    '-frames:v', str(nq), '-an', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'veryfast', str(saida)], check=True)


COR_IA = {'Branco': '&H00FFFFFF&', 'Bordo': '&H005A5AE0&', 'Marrom': '&H003C8CD2&'}


def aneis():
    """Anéis vermelhos pulsando (15 quadros em loop), desenhados aqui mesmo: marcam quem está falando."""
    from PIL import Image, ImageDraw
    pasta = TMP / 'aneis'
    pasta.mkdir(exist_ok=True)
    for i in range(15):
        im = Image.new('RGBA', (420, 420), (0, 0, 0, 0))
        dr = ImageDraw.Draw(im)
        for k in range(3):
            f = ((i / 15) + k / 3) % 1
            r = 70 + 140 * f
            dr.ellipse([210 - r, 210 - r, 210 + r, 210 + r], outline=(255, 40, 60, int(230 * (1 - f))), width=9)
        im.save(pasta / f'a{i:02d}.png')
    return pasta


def fala_clipe(saida, ini, d, cx, cy, w=600, fx=''):
    """Fala de uma IA: zoom rápido em quem fala (8 quadros, depois parado) num quadrado no alto, com anéis pulsando
    em volta; a mensagem vai embaixo."""
    nq = max(1, round(d * FPS))
    z = 1080 / w
    x0 = min(max(cx - 540, 0), 840)
    lado = 1080 / z  # onde quem fala cai na tela depois do zoom (o zoompan encosta nas bordas)
    sx = (cx - x0 - min(max(cx - x0 - lado / 2, 0), 1080 - lado)) * z
    sy = (cy - min(max(cy - lado / 2, 0), 1080 - lado)) * z + 140
    fc = (f"[0:v]{PRE}crop=1080:1080:{x0}:0,zoompan=z='if(lte(on,8),1+{z - 1:.3f}*(1-pow(1-on/8,3)),{z:.3f})':d=1"
          f":x='{cx - x0}-iw/zoom/2':y='{cy}-ih/zoom/2':s=1080x1080:fps=30,pad=1080:1920:0:140:color=0x10121c,"
          f"drawbox=x=0:y=140:w=1080:h=1080:color=white@0.9:t=6[b];"
          f"[b][1:v]overlay=x={sx - 210:.0f}:y={sy - 210:.0f}:enable='gte(n,8)':shortest=1{fx}[v]")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{ini:.3f}', '-t', f'{d + 0.4:.3f}', '-i', str(LONGO),
                    '-stream_loop', '-1', '-framerate', '30', '-i', str(TMP / 'aneis/a%02d.png'), '-filter_complex', fc, '-map', '[v]',
                    '-frames:v', str(nq), '-an', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'veryfast', str(saida)], check=True)


def mensagem(ws, t, d, nome):
    """A mensagem inteira numa caixa embaixo, pintando palavra por palavra no tempo da voz (karaokê)."""
    pensou = nome.endswith('pensou')
    quem = nome.split()[0]
    partes = []
    for i, w in enumerate(ws):
        fim = ws[i + 1]['s'] if i + 1 < len(ws) else d
        partes.append(f"{{\\kf{max(1, round((fim - w['s']) * 100))}}}{w['w']} ")
    txt = ('{\\2c&H00A8A0A0&' + ('\\i1' if pensou else '') + '}') + ''.join(partes).strip()
    return [('NM', t, t + d, f"{{\\c{COR_IA.get(quem, '&H00FFFFFF&')}}}{nome.upper()}"), ('M', t, t + d, txt)]


def cartao(saida, d, ss):
    """O cartão do pedido (largo): inteiro no meio, com ele mesmo borrado atrás."""
    fc = ('[0:v]scale=1920:1080,split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:2[bg];'
          f'[b]scale=1080:-2:flags=lanczos[fg];[bg][fg]overlay=0:(H-h)/2-80,tpad=stop_mode=clone:stop_duration={d + 1:.2f}[v]')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', ss, '-i', str(IDEIA), '-filter_complex', fc, '-map', '[v]', '-frames:v', str(round(d * FPS)),
                    '-an', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'veryfast', str(saida)], check=True)


def main():
    TMP.mkdir(parents=True, exist_ok=True)
    aneis()
    sons = []  # (segundo, arquivo de sfx, volume)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', '0.5', str(TMP / 'sil.mp3')], check=True)
    pecas, leg, t = [], [], 0.0  # pecas: (áudio, duração, [planos de vídeo])
    nplano = [0]

    def novo():
        nplano[0] += 1
        return TMP / f'v{nplano[0]:03d}.mp4'

    def planos(ini, d, rec, fx=''):
        """Quebra a peça em planos de até MAX_PLANO s; cada corte muda o enquadramento (sem zoom): no jogo o recorte
        anda pros lados, na reunião alterna o chat e a grade de votos."""
        fs, feito, k = [], 0.0, 0
        while feito < d - 0.01:
            dd = min(MAX_PLANO, d - feito)
            arq = novo()
            r = ('chat', 'grade')[k % 2] if rec == 'chat' else rec
            clipe(arq, ini + feito, dd, r, 1.0, (0, -240, 240)[k % 3], fx if k == 0 else '')
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

    inicio = {}  # texto da batida -> segundo em que ela começa (pra trocar a música)
    for k, bt_ in enumerate(BATIDAS):
        inicio[str(bt_[1])] = t
        quem, conteudo, sid = bt_[0], bt_[1], bt_[2]
        selo = next((v for pre, v in SELOS.items() if str(conteudo).startswith(pre)), None)
        if selo:  # pula grande, gira um pouco e assenta
            leg.append(('S', t + 0.05, t + 1.25, f"{{\\3c{selo[1]}\\fscx260\\fscy260\\frz-7\\t(0,140,\\fscx100\\fscy100)}}{selo[0]}"))
            sons.append((t + 0.05, selo[2], 0.55))
        treme = str(conteudo).startswith(TREMER)
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
                            '-filter_complex', f'[1:v]{PRE}crop=420:420:750:330,scale=560:560[p];[0:v][p]overlay=(W-w)/2:1080,{txt}[v]', '-map', '[v]', '-frames:v', str(round(d * FPS)),
                            '-an', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '17', '-preset', 'veryfast', str(arq)], check=True)
            pecas.append((TMP / 'sil.mp3', d, [arq]))
            sons.append((t, 'glitch.mp3', 0.5))
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
        # no chat as mensagens ficam embaixo: a legenda vai pro alto, que fica vazio
        sobe = 'C' if len(bt_) > 4 and bt_[4] == 'chat' else ''
        if quem in ('N', 'B'):  # 'B': o Branco narrando, com a voz dele
            a, d, ws = narra(k, conteudo, b.VOZES['Branco'] if quem == 'B' else None)
            leg += palavras_leg(ws, t, d, est='L' + sobe)
        elif quem == 'TTS':  # fala do log sem gravação no vídeo longo: voz da cor, texto do log na caixa
            cor, txt = conteudo.split('|', 1)
            a, d, ws = narra(k, txt, b.VOZES[cor], RAPIDO_IA)
            if len(ws) == len(txt.split()):
                for w, o in zip(ws, txt.split()):
                    w['w'] = o
            leg += mensagem(ws, t, d, bt_[5])
        else:  # a fala gravada do vídeo longo, um pouco acelerada
            a = TMP / f'ia{k}.mp3'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(PUB / f'{conteudo}.mp3'), '-af', f'atempo={RAPIDO_IA}', str(a)], check=True)
            d = dur(a)
            base = conteudo.replace('_eco', '')
            ws = [dict(w=w['word'], s=w['start'] / RAPIDO_IA) for w in json.loads((PUB / f'{base}.words.json').read_text())['words']]
            # na caixa vai o texto do log (o words.json tem a grafia falada, tipo "Bórdô"): mesma contagem de palavras, só troca
            ats = [e['at'] for e in cena(sid)['events'] if e['type'] == 'voz' and e['src'] == f'{conteudo}.mp3']
            orig = next((x['texto'].split() for x in cena(sid)['visual']['props'].get('chat', []) if x['at'] in ats), [])
            if len(orig) == len(ws):
                for w, o in zip(ws, orig):
                    w['w'] = o
            leg += mensagem(ws, t, d, bt_[5])
        d += 0.03  # quase sem respiro entre as falas, como ele
        if sid == 'RAJADA':  # a fala da ponte cobre a rajada: preto curto, ~10 cortes de 0,25 s, flash da vitória
            fs = []
            arq = novo()
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=black:s=1080x1920:d=0.2:r=30', '-frames:v', '6', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '17', str(arq)], check=True)
            fs.append(arq)
            passo = max(0.13, (d - 0.2) / len(RAJADA))
            sons.append((t, 'record-scratch.mp3', 0.6))
            for j, (rs, rseg) in enumerate(RAJADA):
                arq = novo()
                chat = rs in ('p2l', 'p2i', 'p2i2', 'p2d', 'p2d2', 'p2f', 'p2f2', 'p2n', 'p2n2')
                clipe(arq, cena(rs)['start'] / FPS + rseg, passo, ('chat', 'grade')[j % 2] if chat else 'jogo', 1.0,
                      (0, -240, 240)[j % 3], FX_REBOBINA if rs != 'p2_vit' else '')
                fs.append(arq)
            dd = 0.2 + round(passo * FPS) / FPS * len(RAJADA)
            pecas.append((a, dd, fs))
            t += dd
            continue
        ini = cena(sid)['start'] / FPS + bt_[3]
        if quem in ('IA', 'TTS'):
            fs, feito, j = [], 0.0, 0
            while feito < d - 0.01:
                dd = min(2.0, d - feito) if d - feito - 2.0 > 0.6 else d - feito
                arq = novo()
                fala_clipe(arq, ini + feito, dd, *bt_[6], w=(600, 430)[j % 2], fx=FX_TREME if treme and j == 0 else '')
                fs.append(arq)
                feito += dd
                j += 1
            pecas.append((a, d, fs))
        else:
            pecas.append((a, d, planos(ini, d, bt_[4], FX_TREME if treme else '')))
        t += d

    a, d, ws = narra('fecha', FECHA)
    d += 0.3
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
           'Style: LC,Silkscreen,92,&H00FFFFFF,&H00000000,&H90000000,1,1,7,3,8,50,50,330',
           'Style: NC,Silkscreen,46,&H00FFFFFF,&H00000000,&H90000000,1,1,5,2,8,50,50,250',
           'Style: NM,Silkscreen,58,&H00FFFFFF,&H00000000,&H90000000,1,1,5,2,8,80,80,1265',
           'Style: M,Poppins,62,&H00241A14,&H00FFFFFF,&H00000000,0,3,22,0,8,70,70,1340',
           'Style: S,Silkscreen,104,&H00FFFFFF,&H002020D0,&H00000000,1,3,18,0,5,40,40,0',
           'Style: P,Silkscreen,96,&H00FFFFFF,&H00000000,&H90000000,1,1,8,4,5,60,60,0', '',
           '[Events]', 'Format: Layer, Start, End, Style, Text']
    for est, a0, z0, txt in leg:
        ani = '{\\fscx80\\fscy80\\t(0,60,\\fscx100\\fscy100)}' if est in ('L', 'LC', 'P') else ''
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
    cortes, acc = [], 0.0
    for arq in todos:
        nq = int(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=nb_frames', '-of', 'csv=p=0', str(arq)],
                                capture_output=True, text=True).stdout.strip().split(',')[0] or 0)
        if acc > 0 and nq >= 18:
            cortes.append(acc)
        acc += nq / FPS
    sons += [(c - 0.08, 'swoosh-air.mp3', 0.35) for c in cortes]
    rotulos = []
    for arqs in sorted({x[1] for x in sons}):
        lista = [x for x in sons if x[1] == arqs]
        ent += ['-i', str(PUB / 'sfx' / arqs)]
        corte = ',atrim=0:0.35,afade=t=out:st=0.2:d=0.15' if arqs == 'swoosh-air.mp3' else ',atrim=0:1.6'
        fil.append(f'[{m}:a]aformat=sample_rates=48000:channel_layouts=stereo{corte},asplit={len(lista)}' + ''.join(f'[x{m}_{i}]' for i in range(len(lista))))
        for i, (ts, _, vol) in enumerate(lista):
            fil.append(f'[x{m}_{i}]volume={vol},adelay={max(0, int(ts * 1000))}:all=1[y{m}_{i}]')
            rotulos.append(f'[y{m}_{i}]')
        m += 1
    fil.append(''.join(rotulos) + f'amix=inputs={len(rotulos)}:normalize=0[sw]')
    fil.append(''.join(rot) + f'concat=n={len(rot)}:v=0:a=1,asplit=2[voz][chave]')
    marcas = [0.0] + [next(v for txt, v in inicio.items() if txt.startswith(ini)) for ini, _ in MUSICAS[1:]] + [total]
    for i, (_, arq) in enumerate(MUSICAS):
        dm = marcas[i + 1] - marcas[i]
        ent += ['-stream_loop', '-1', '-i', str(PUB / 'music' / arq)]
        fil.append(f'[{m + i}:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:{dm:.3f},asetpts=PTS-STARTPTS,'
                   f'afade=t=in:d=0.15,afade=t=out:st={max(0, dm - 0.25):.3f}:d=0.25[mu{i}]')
    fil.append(''.join(f'[mu{i}]' for i in range(len(MUSICAS))) + f'concat=n={len(MUSICAS)}:v=0:a=1,volume=0.32[mus]')
    fil.append('[mus][chave]sidechaincompress=threshold=0.02:ratio=5:attack=15:release=250[md]')
    fil.append('[voz][md][sw]amix=inputs=3:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[a]')
    som = TMP / 'som.m4a'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ent, '-filter_complex', ';'.join(fil), '-map', '[a]', '-c:a', 'aac', '-b:a', '192k', str(som)], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(TMP / 'lista.txt'), '-i', str(som),
                    '-vf', f"ass={TMP / 'leg.ass'}:fontsdir={PUB / 'fonts'}", '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium',
                    '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', str(OUT)], check=True)
    print(f'{OUT} ({total:.1f} s, {len(todos)} planos)')


if __name__ == '__main__':
    main()
