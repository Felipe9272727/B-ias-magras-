#!/usr/bin/env python3
"""AGE DAS IAs: roteiro (video/roteiro/roteiro_age.json) -> public/timeline_age.json + vozes (public/age/voz).
Itens de cada cena, em sequência:
  ["n", texto]                    narrador (Gabriel)
  ["fala", j, texto, para?]       fala pública (ou mensagem secreta, se 'para') na voz da IA do jogador j
  ["pensa", j, texto]             pensamento secreto na voz da IA, com ECO (regra do canal: nunca sussurro)
  ["selo", texto, cor?]           selo grande (não ocupa tempo)
  ["marco", titulo, sub?]         cartão de marco (não ocupa tempo)
  ["s", sfx, vol?]                efeito sonoro (public/sfx/<sfx>.mp3)
  ["p", segundos]                 pausa
Cena: {id, t0_s (tempo de jogo), vel (segundos de jogo por segundo de vídeo), cam, foco, itens}.
Falas e pensamentos das IAs são copiados do log (gravacoes/<partida>/turnos.jsonl), nunca inventados."""
import base64
import hashlib
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'remotion' / 'public'
VOZ = PUB / 'age' / 'voz'
VOZ.mkdir(parents=True, exist_ok=True)
FPS = 30
NARRADOR = 'lvkgCBi6spByiTZMPJEK'
VOZES = {1: 'dX7gRq1dIvLTgUaWpEFn', 2: 'ohZOfA9iwlZ5nOsoY7LB', 3: 'YU8EsJtXFMyKMxYtheDk', 4: '33B4UnXyTNbgLmdEDh5P', 5: 'bJrNspxJVFovUxNBQ0wh', 6: '2CECaLAGTS5NRGxgbcxr'}
PRON = {'GPT': 'GêPêTê', 'GLM': 'Gê Éle Ême', 'DeepSeek': 'Dípsíque', 'Qwen': 'Cuên', 'MiMo': 'Mímo', 'Mistral': 'Mistrál', 'Gemini': 'Djêmini'}
CHAVE = (Path.home() / '.config' / 'elevenlabs' / 'api_key').read_text().strip()
gasto = 0
MEMES = {m['id']: m for m in json.loads((PUB / 'gifs' / 'catalog.json').read_text())}


def falado(t):
    for a, b in PRON.items():
        t = t.replace(a, b)
    return t


def dur(f):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)], capture_output=True, text=True).stdout)


def tts(texto, voz, eco=False):
    global gasto
    h = hashlib.sha1(json.dumps([texto, voz, eco]).encode()).hexdigest()[:16]
    mp3 = VOZ / f'{h}.mp3'
    if not mp3.exists():
        body = json.dumps({'text': falado(texto), 'model_id': 'eleven_v4', 'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75}}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voz}?output_format=mp3_44100_128', data=body, headers={'xi-api-key': CHAVE, 'Content-Type': 'application/json'})
        cru = VOZ / f'{h}_cru.mp3' if eco else mp3
        cru.write_bytes(urllib.request.urlopen(req, timeout=180).read())
        gasto += len(texto)
        if eco:  # pensamento: mesma voz, com eco
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(cru), '-af', 'aecho=0.8:0.7:90|180:0.35|0.2,apad=pad_dur=0.35', str(mp3)], check=True)
            cru.unlink()
    return f'age/voz/{h}.mp3', dur(mp3)


def main():
    rot = json.loads((ROOT / 'roteiro' / 'roteiro_age.json').read_text())
    ias = rot['ias']
    cenas = []
    for c in rot['cenas']:
        t = 0.0
        over, audio = [], []
        for it in c['itens']:
            k = it[0]
            if k == 'n':
                src, d = tts(it[1], NARRADOR)
                audio.append(dict(src=src, at=round(t * FPS)))
                over.append(dict(tipo='legenda_n', at=round(t * FPS), dur=round(d * FPS), texto=it[1]))
                t += d + 0.12
            elif k in ('fala', 'pensa'):
                j = it[1]
                src, d = tts(it[2], VOZES[j], eco=(k == 'pensa'))
                audio.append(dict(src=src, at=round(t * FPS)))
                o = dict(tipo=k, at=round(t * FPS), dur=round((d + 0.6) * FPS), j=j, texto=it[2])
                if k == 'fala' and len(it) > 3 and it[3]:
                    o['para'] = it[3]
                over.append(o)
                t += d + 0.25
            elif k == 'selo':
                over.append(dict(tipo='selo', at=round(t * FPS), dur=55, texto=it[1], **({'cor': it[2]} if len(it) > 2 else {})))
                audio.append(dict(src='sfx/pop.mp3', at=round(t * FPS), vol=0.5))
            elif k == 'marco':
                over.append(dict(tipo='marco', at=round(t * FPS), dur=80, titulo=it[1], **({'sub': it[2]} if len(it) > 2 else {})))
                audio.append(dict(src='sfx/whoosh.mp3', at=round(t * FPS), vol=0.4))
            elif k == 'meme':  # ["meme", id, pos, segundos]
                m = MEMES[it[1]]
                d = float(it[3]) if len(it) > 3 else min(2.6, max(1.6, m['duration_sec']))
                over.append(dict(tipo='meme', at=round(t * FPS), dur=round(d * FPS), id=it[1], pos=it[2] if len(it) > 2 else 'right',
                                 info=dict(file=Path(m['file_gif']).name, width=m['width'], height=m['height'], duration=m['duration_sec'])))
            elif k == 'diagrama':  # ["diagrama", [[de, para, rotulo, cor], ...], segundos]
                over.append(dict(tipo='diagrama', at=round(t * FPS), dur=round(float(it[2] if len(it) > 2 else 6) * FPS), setas=it[1]))
            elif k == 'numero':  # ["numero", texto, sub, segundos]
                over.append(dict(tipo='numero', at=round(t * FPS), dur=round(float(it[3] if len(it) > 3 else 2.2) * FPS), texto=it[1], sub=it[2] if len(it) > 2 else None))
            elif k == 's':
                audio.append(dict(src=f'sfx/{it[1]}.mp3', at=round(t * FPS), vol=it[2] if len(it) > 2 else 0.5))
            elif k == 'p':
                t += float(it[1])
        n = max(round((t + c.get('folga', 0.4)) * FPS), 45)
        # legenda do narrador não aparece (regra: legenda só em palavra difícil); fica só para conferência
        over = [o for o in over if o['tipo'] != 'legenda_n']
        cenas.append(dict(id=c['id'], dur=n, t0=round(c['t0_s'] * 1000), vel=round(c.get('vel', 2.0) * 1000 / FPS, 3), cam=c['cam'], foco=c.get('foco'), hud=c.get('hud', True), over=over, audio=audio, cap=c.get('cap'), visual=c.get('visual'), comentarios=c.get('comentarios')))
        print(f"{c['id']:14s} {n / FPS:6.1f}s", flush=True)
    tl = dict(partida=rot['partida'], ias=ias, cenas=cenas)
    (PUB / 'timeline_age.json').write_text(json.dumps(tl, ensure_ascii=False))
    tot = sum(c['dur'] for c in cenas) / FPS
    print(f'total {tot / 60:.1f} min; caracteres gastos agora: {gasto}')


if __name__ == '__main__':
    main()
