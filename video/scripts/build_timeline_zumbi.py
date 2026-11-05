#!/usr/bin/env python3
"""AMONG IA 6 (modo zumbi): roteiro (video/roteiro/roteiro_zumbi.json) -> public/timeline_zumbi.json + vozes (public/zumbi/voz).
Cena: {id, partida, t0 (tique), vel (tiques por segundo de vídeo), cam, foco?, cap?, hud?, visual?, comentarios?, itens}.
Itens: ["n", texto] narrador · ["fala", cor, texto] fala por proximidade na voz da cor · ["pensa", cor, texto] pensamento
com ECO (regra do canal: nunca sussurro) · ["selo", texto, cor?] · ["meme", id, pos?] (mesmo tempo do selo da cena) ·
["numero", texto, sub?] · ["marco", titulo, sub?] · ["s", sfx, vol?] · ["p", segundos].
v3: ["ir", tique] âncora (neste ponto da narração o jogo está no tique X; entre âncoras o tique é interpolado) ·
["fimpartida", titulo, sub?] cartão de fim de partida · ["popups"] comentários que pediram o modo (roteiro/comentarios_zumbi.json) ·
campo de cena "entrada": aranha|fantasma|morcegos (transição de Halloween cobrindo o corte).
Meme logo depois de um selo começa junto com o selo (nunca antes do evento).
Selo fica o tempo de ler; a cena nunca corta selo/meme/número (padrão aprovado do AGE v4).
--contar: só conta os caracteres que faltam gerar (não gasta nada) e compara com a cota do ElevenLabs.
A chave do ElevenLabs vem do ambiente (ELEVENLABS_API_KEY) ou do mod chaves-ias (/chave elevenlabs ...)."""
import glob, hashlib, json, os, subprocess, sys, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'remotion' / 'public'
VOZ = PUB / 'zumbi' / 'voz'
VOZ.mkdir(parents=True, exist_ok=True)
FPS = 30
MODELO = 'eleven_v4'
AJUSTES = {'stability': 0.5, 'similarity_boost': 0.75}
NARRADOR = 'lvkgCBi6spByiTZMPJEK'  # Gabriel
VOZES = {  # mesmas do AU5 (cada cor é um personagem) + as 2 cores novas
    'Vermelho': 'YU8EsJtXFMyKMxYtheDk', 'Azul': 'dX7gRq1dIvLTgUaWpEFn', 'Verde': '2CECaLAGTS5NRGxgbcxr', 'Rosa': 'GDzHdQOi6jjf8zaXhCYD',
    'Laranja': 'YbP0Eq5RE5uOoCEl7F3T', 'Amarelo': '4za2kOXGgUd57HRSQ1fn', 'Preto': 'bJrNspxJVFovUxNBQ0wh', 'Branco': '7lu3ze7orhWaNeSPowWx',
    'Roxo': 'ZYCQDYoXnl78dNdU6JeG', 'Marrom': 'pVJr1h0A4fisVFn0dCVn', 'Ciano': 'ohZOfA9iwlZ5nOsoY7LB', 'Lima': '33B4UnXyTNbgLmdEDh5P',
    'Cinza': '6GWfivGWZoUg1lb8HBrE', 'Coral': 'xcNJswC7UcxsIiCuih19', 'Bordo': 'NDUHL9ozN4FPvbUqxHVJ', 'Banana': 'm5fAy5I8fIHSzvsA8sRt',
    'Caqui': 'NrirjBupLRUlqHita17L', 'Rose': 'cgSgspJ2msm6clMCkdW9',
    'Turquesa': 'n2a9VtkZLl8j1FSXHsL7',  # Sofia (Tencent HY4)
    'Dourado': 'TX3LPaxmHKxFdv7VOQHJ',  # Liam, multilíngue (LFM 2.5 24B)
}
PRON = {'Haiku': 'Raicu', 'GPT': 'GêPêTê', 'GLM': 'Gê Éle Ême', 'DeepSeek': 'Dípsíque', 'Qwen': 'Cuên', 'MiMo': 'Mímo', 'MiniMax': 'Mini Mécs',
        'LFM': 'Éle Éfe Ême', 'HY4': 'Agá Ípsilon Quatro', 'Tencent': 'Tênsent', 'Luna': 'Lúna', 'Terra': 'Térra', 'Mira': 'Míra', 'HQ': 'Agá Quê', 'Among': 'Amông', 'Us': 'Âs'}
CONTAR = '--contar' in sys.argv
SEM_VOZ = '--sem-voz' in sys.argv  # prévia: duração estimada, sem áudio de voz (não gasta cota)
MEMES = {m['id']: m for m in json.loads((PUB / 'gifs' / 'catalog.json').read_text())}
gasto, falta = 0, 0


def chave():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if k:
        return k
    for f in glob.glob('/root/.claude/plugins/store/chaves-ias*.json'):
        v = json.loads(Path(f).read_text())
        for d in (v, v.get('data', {}), v.get('values', {})):
            if isinstance(d, dict) and d.get('elevenlabs'):
                return d['elevenlabs']
    raise SystemExit('SEM CHAVE do ElevenLabs (use /chave elevenlabs ... ou ELEVENLABS_API_KEY)')


def falado(t):
    for a, b in PRON.items():
        t = t.replace(a, b)
    return t


def dur(f):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)], capture_output=True, text=True).stdout)


def tts(texto, voz, eco=False):
    global gasto, falta
    h = hashlib.sha1(json.dumps([texto, voz, eco, MODELO]).encode()).hexdigest()[:16]
    mp3 = VOZ / f'{h}.mp3'
    if not mp3.exists():
        if SEM_VOZ:
            return None, max(0.8, len(texto) / 14)
        if CONTAR:
            falta += len(texto)
            return f'zumbi/voz/{h}.mp3', max(0.8, len(texto) / 14)
        body = json.dumps({'text': falado(texto), 'model_id': MODELO, 'voice_settings': AJUSTES}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voz}?output_format=mp3_44100_128', data=body, headers={'xi-api-key': chave(), 'Content-Type': 'application/json'})
        cru = VOZ / f'{h}_cru.mp3' if eco else mp3
        try:
            cru.write_bytes(urllib.request.urlopen(req, timeout=180).read())
        except urllib.error.HTTPError as e:
            corpo = e.read().decode('utf-8', 'replace')
            if 'quota' in corpo.lower() or e.code in (401, 402):
                raise SystemExit(f'SEM_COTA no ElevenLabs (já gerados {gasto} caracteres nesta rodada): {corpo[:200]}')
            raise
        gasto += len(texto)
        if eco:  # pensamento: mesma voz, com eco
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(cru), '-af', 'aecho=0.8:0.7:90|180:0.35|0.2,apad=pad_dur=0.35', str(mp3)], check=True)
            cru.unlink()
    return f'zumbi/voz/{h}.mp3', dur(mp3)


def main():
    rot = json.loads((ROOT / 'roteiro' / 'roteiro_zumbi.json').read_text())
    cenas = []
    for c in rot['cenas']:
        t, over, audio, fim_selo, tk, ult = 0.0, [], [], 0.0, [], None
        if c.get('cap'):
            over.append(dict(tipo='marco', at=0, dur=80, titulo=c['cap'], sub=f"Partida {c['partida']}"))
            audio.append(dict(src='sfx/whoosh.mp3', at=0, vol=0.4))
            t += 0.6
        for it in c['itens']:
            k = it[0]
            if k not in ('s', 'p', 'ir'):
                ult = k if k != 'meme' else ult
            if k == 'ir':
                fr = round(t * FPS)
                if tk and fr <= tk[-1][0]:
                    tk[-1] = [tk[-1][0], max(tk[-1][1], float(it[1]))]
                elif not tk or float(it[1]) >= tk[-1][1]:
                    tk.append([fr, float(it[1])])
            elif k == 'fimpartida':
                over.append(dict(tipo='fim', at=round(t * FPS), dur=round(4.6 * FPS), titulo=it[1], **({'sub': it[2]} if len(it) > 2 else {})))
                audio.append(dict(src='sfx/impact-epic.mp3', at=round(t * FPS), vol=0.45))
            elif k == 'popups':
                cs = [dict(autor=x['autor'], texto=x['texto']) for x in json.loads((ROOT / 'roteiro' / 'comentarios_zumbi.json').read_text())][:8]
                over.append(dict(tipo='popups', at=round(t * FPS), dur=round((0.6 * len(cs) + 3.4) * FPS), comentarios=cs))
                for j in range(len(cs)):
                    audio.append(dict(src='sfx/pop.mp3', at=round((t + 0.6 * j) * FPS), vol=0.35))
            elif k == 'n':
                src, d = tts(it[1], NARRADOR)
                if src: audio.append(dict(src=src, at=round(t * FPS)))
                t += d + 0.12
            elif k in ('fala', 'pensa'):
                src, d = tts(it[2], VOZES[it[1]], eco=(k == 'pensa'))
                if src: audio.append(dict(src=src, at=round(t * FPS)))
                over.append(dict(tipo=k, at=round(t * FPS), dur=round((d + 0.6) * FPS), cor=it[1], texto=it[2]))
                t += d + 0.25
            elif k == 'selo':
                ds = min(3.0, max(1.6, 0.9 + 0.3 * len(it[1].split())))
                ini = max(t, fim_selo)
                fim_selo = ini + ds
                over.append(dict(tipo='selo', at=round(ini * FPS), dur=round(ds * FPS), texto=it[1], **({'cor': it[2]} if len(it) > 2 else {})))
                audio.append(dict(src='sfx/pop.mp3', at=round(ini * FPS), vol=0.5))
            elif k == 'marco':
                over.append(dict(tipo='marco', at=round(t * FPS), dur=110 if 'HALLOWEEN' in it[1].upper() else 80, titulo=it[1], **({'sub': it[2]} if len(it) > 2 else {})))
                audio.append(dict(src='sfx/whoosh.mp3', at=round(t * FPS), vol=0.4))
            elif k == 'meme':
                m = MEMES[it[1]]
                selo_ant = [o for o in over if o['tipo'] == 'selo']
                at_m = selo_ant[-1]['at'] if ult == 'selo' and selo_ant else round(t * FPS)  # junto com o selo do evento
                over.append(dict(tipo='meme', at=at_m, dur=None, id=it[1], pos=it[2] if len(it) > 2 else 'right',
                                 info=dict(file=Path(m['file_gif']).name, width=m['width'], height=m['height'], duration=m['duration_sec'])))
            elif k == 'numero':
                over.append(dict(tipo='numero', at=round(t * FPS), dur=round(2.4 * FPS), texto=it[1], sub=it[2] if len(it) > 2 else None))
                audio.append(dict(src='sfx/impact-epic.mp3', at=round(t * FPS), vol=0.45))
            elif k == 's':
                audio.append(dict(src=f'sfx/{it[1]}.mp3', at=round(t * FPS), vol=it[2] if len(it) > 2 else 0.5))
            elif k == 'p':
                t += float(it[1])
        selos = [o['dur'] for o in over if o['tipo'] == 'selo']
        for o in over:
            if o['tipo'] == 'meme':
                o['dur'] = max(selos) if selos else round(2.2 * FPS)  # meme fica o mesmo tempo do selo da cena
        n = max(round((t + c.get('folga', 0.5)) * FPS), 45)
        n = max(n, max((o['at'] + o['dur'] + 4 for o in over if o['tipo'] in ('selo', 'meme', 'numero', 'marco', 'fim', 'popups')), default=0))
        vel = float(c.get('vel', 0.25)) / FPS
        cenas.append(dict(id=c['id'], dur=n, partida=c['partida'], t0=float(c['t0']), vel=round(vel, 5), cam=c.get('cam', {'mapa': True}), foco=c.get('foco'),
                          hud=c.get('hud', True), over=over, audio=audio, visual=c.get('visual'), comentarios=c.get('comentarios'),
                          **({'tk': tk} if tk else {}), **({'entrada': c['entrada']} if c.get('entrada') else {})))
    tot = sum(c['dur'] for c in cenas) / FPS
    if CONTAR:
        print(f'duração estimada {tot / 60:.1f} min; faltam gerar {falta} caracteres de voz')
        return
    (PUB / 'timeline_zumbi.json').write_text(json.dumps(dict(cenas=cenas), ensure_ascii=False))
    print(f'total {tot / 60:.1f} min; caracteres gastos agora: {gasto}')


if __name__ == '__main__':
    main()
