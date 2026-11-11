#!/usr/bin/env python3
"""IA JOGANDO ROBLOX (IA ou humano?): roteiro (video/roteiro/roteiro_roblox.json) -> public/timeline_roblox.json,
vozes (public/roblox/voz) e os trechos do gameplay já recortados na duração de cada cena (public/roblox/clips).

Cena: {id, clip: [arquivo, t0, t1] (segundos no vídeo de origem) | img, cam: [x, y, z0, z1] (foco 0..1 e zoom), cap?,
       hud?, visual?, props?, escuro?, folga?, itens}.
Itens: ["n", texto] narrador · ["ia", texto, falado?] fala do Carlos (texto copiado do log; "falado" é só a pronúncia)
· ["bush", texto, pausa?] / ["jog", texto, pausa?] balão do chat (sem voz) · ["selo", texto, cor?] · ["meme", id, pos?]
(mesmo tempo do selo da cena) · ["numero", texto, sub?] · ["marco", titulo, sub?] · ["morte"] (placar +1, caveira e som)
· ["hud", "sobrev"|"percebeu"] · ["seta", x, y, rotulo, lado?] aponta um ponto do gameplay · ["tempo", texto] marcador
de tempo · ["marca"] guarda o quadro para o cartão da cena · ["ir", t] âncora: neste ponto da narração o gameplay está em
t (entre âncoras a velocidade é ajustada) · ["voz", falado] voz do Carlos sem balão · ["s", sfx, vol?] · ["p", segundos].
A cena dura a narração; o trecho [t0, t1] é esticado/acelerado para caber (avisa quando sai de 0,45x a 6x).
Selo fica o tempo de ler; a cena nunca corta selo/meme/número (padrão aprovado do AGE v4).
--contar: só conta os caracteres que faltam gerar (não gasta nada). --sem-voz: prévia com duração estimada.
A chave do ElevenLabs vem do ambiente (ELEVENLABS_API_KEY) ou do mod chaves-ias; nunca fica em arquivo do repositório."""
import glob, hashlib, json, os, re, shutil, subprocess, sys, urllib.request, urllib.error
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'remotion' / 'public'
FOOT = PUB / 'footage' / 'roblox'
VOZ = PUB / 'roblox' / 'voz'
CLIPS = PUB / 'roblox' / 'clips'
IMG = PUB / 'roblox' / 'img'
for d in (VOZ, CLIPS, IMG):
    d.mkdir(parents=True, exist_ok=True)
FPS = 30
MODELO = 'eleven_v4'
AJUSTES = {'stability': 0.5, 'similarity_boost': 0.75}
NARRADOR = 'lvkgCBi6spByiTZMPJEK'  # Gabriel (narrador do canal)
CARLOS = '7lu3ze7orhWaNeSPowWx'  # Lucas: voz jovem para a IA
PRON = {'Roblox': 'Roblócs', 'Bush': 'Bâsh', 'Murder': 'Mârder', 'Brookhaven': 'Bruquirrêiven', 'Natural Disaster Survival': 'Nétchural Dizáster Sarváival'}
ARQ = {'A': 'partida_ia.mp4', 'B': 'partida_ia2.mp4', 'T': 'teste_final.mp4', 'N': 'nds_gameplay.mp4',
       'F2': 'testes/repo_flicker-connection-02.mkv', 'D1': 'testes/repo_natural-disasters-connection-01.mkv',
       'D2': 'testes/repo_natural-disasters-network-diagnostic.mkv'}
CONTAR = '--contar' in sys.argv
SEM_VOZ = '--sem-voz' in sys.argv
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


def tts(texto, voz):
    global gasto, falta
    h = hashlib.sha1(json.dumps([texto, voz, MODELO]).encode()).hexdigest()[:16]
    mp3 = VOZ / f'{h}.mp3'
    if not mp3.exists():
        if SEM_VOZ or CONTAR:
            falta += len(texto)
            return (None if SEM_VOZ else f'roblox/voz/{h}.mp3'), max(0.8, len(texto) / 15.5)
        body = json.dumps({'text': falado(texto), 'model_id': MODELO, 'voice_settings': AJUSTES}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voz}?output_format=mp3_44100_128', data=body, headers={'xi-api-key': chave(), 'Content-Type': 'application/json'})
        try:
            mp3.write_bytes(urllib.request.urlopen(req, timeout=180).read())
        except urllib.error.HTTPError as e:
            corpo = e.read().decode('utf-8', 'replace')
            if 'quota' in corpo.lower() or e.code in (401, 402):
                raise SystemExit(f'SEM_COTA no ElevenLabs (já gerados {gasto} caracteres nesta rodada): {corpo[:200]}')
            raise SystemExit(f'ERRO ElevenLabs {e.code}: {corpo[:300]}')
        gasto += len(texto)
    return f'roblox/voz/{h}.mp3', dur(mp3)


def leitura(texto, base=1.2, por=0.3, mn=1.8, mx=4.0):
    return min(mx, max(mn, base + por * len(texto.split())))


def recortar(cid, arq, segs):
    """segs: [(quadros, s0, s1)] -> um mp4 com exatamente sum(quadros) quadros (cada trecho na sua velocidade)."""
    spec = json.dumps([arq, segs, 'v3'])
    h = hashlib.sha1(spec.encode()).hexdigest()[:10]
    out = CLIPS / f'{cid}_{h}.mp4'
    if out.exists() or SEM_VOZ and '--clips' not in sys.argv:
        return f'roblox/clips/{out.name}'
    for velho in CLIPS.glob(f'{cid}_*.mp4'):
        velho.unlink()
    ins, fil = [], []
    for i, (n, s0, s1) in enumerate(segs):
        d = max(s1 - s0, 1 / FPS)
        k = (n / FPS) / d
        ins += ['-ss', f'{s0:.3f}', '-t', f'{d + 0.2:.3f}', '-i', str(FOOT / arq)]
        fil.append(f'[{i}:v]setpts=(PTS-STARTPTS)*{k:.5f},fps={FPS},tpad=stop_mode=clone:stop_duration=3,trim=end_frame={n},setpts=PTS-STARTPTS,scale=1280:720,setsar=1[v{i}]')
    fil.append(''.join(f'[v{i}]' for i in range(len(segs))) + f'concat=n={len(segs)}:v=1:a=0[v]')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fil), '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17', '-g', '15', '-pix_fmt', 'yuv420p', str(out)], check=True)
    return f'roblox/clips/{out.name}'


def main():
    rot = json.loads((ROOT / 'roteiro' / 'roteiro_roblox.json').read_text())
    cenas, avisos = [], []
    hud = dict(mortes=0, percebeu=0, sobrev=0)
    hud_on = False
    for c in rot['cenas']:
        t, over, audio, fim_selo, anc, ult, marcas, ev = 0.0, [], [], 0.0, [], None, [], []
        base = dict(hud)
        if 'hud' in c:
            hud_on = bool(c['hud'])
        if c.get('cap'):
            over.append(dict(tipo='marco', at=0, dur=72, titulo=c['cap'], **({'sub': c['capsub']} if c.get('capsub') else {})))
            audio.append(dict(src='sfx/whoosh.mp3', at=0, vol=0.4))
            t += 1.0
        for it in c['itens']:
            k = it[0]
            fr = round(t * FPS)
            if k not in ('s', 'p', 'ir', 'marca', 'hud', 'meme'):
                ult = k
            if k == 'n':
                src, d = tts(it[1], NARRADOR)
                if src: audio.append(dict(src=src, at=fr))
                t += d + 0.14
            elif k == 'ia':
                src, d = tts(it[2] if len(it) > 2 else it[1], CARLOS)
                if src: audio.append(dict(src=src, at=fr, vol=1.0))
                audio.append(dict(src='sfx/notification-pop.mp3', at=fr, vol=0.3))
                over.append(dict(tipo='ia', at=fr, dur=round((d + 0.7) * FPS), texto=it[1]))
                t += d + 0.28
            elif k == 'voz':  # voz do Carlos sem balão (a tela já mostra a mensagem em tamanho grande)
                src, d = tts(it[1], CARLOS)
                if src: audio.append(dict(src=src, at=fr))
                t += d + 0.3
            elif k in ('bush', 'jog'):
                ds = leitura(it[1], 1.3, 0.28, 1.9, 3.6)
                over.append(dict(tipo=k, at=fr, dur=round(ds * FPS), texto=it[1]))
                audio.append(dict(src='sfx/pop.mp3', at=fr, vol=0.45))
                t += float(it[2]) if len(it) > 2 else 0.0
            elif k == 'selo':
                ds = min(3.0, max(1.6, 0.9 + 0.3 * len(it[1].split())))
                ini = max(t, fim_selo)
                fim_selo = ini + ds
                over.append(dict(tipo='selo', at=round(ini * FPS), dur=round(ds * FPS), texto=it[1], **({'cor': it[2]} if len(it) > 2 else {})))
                audio.append(dict(src='sfx/pop.mp3', at=round(ini * FPS), vol=0.5))
            elif k == 'meme':
                m = MEMES[it[1]]
                selos = [o for o in over if o['tipo'] == 'selo']
                at_m = selos[-1]['at'] if ult == 'selo' and selos else fr  # junto com o selo do evento
                over.append(dict(tipo='meme', at=at_m, dur=None, id=it[1], pos=it[2] if len(it) > 2 else 'right',
                                 info=dict(file=Path(m['file_gif']).name, width=m['width'], height=m['height'], duration=m['duration_sec'])))
            elif k == 'numero':
                over.append(dict(tipo='numero', at=fr, dur=round(2.5 * FPS), texto=it[1], sub=it[2] if len(it) > 2 else None))
                audio.append(dict(src='sfx/impact-epic.mp3', at=fr, vol=0.45))
            elif k == 'marco':
                over.append(dict(tipo='marco', at=fr, dur=72, titulo=it[1], **({'sub': it[2]} if len(it) > 2 else {})))
                audio.append(dict(src='sfx/whoosh.mp3', at=fr, vol=0.4))
            elif k == 'morte':
                hud['mortes'] += 1
                ev.append(dict(at=fr, k='mortes'))
                over.append(dict(tipo='morte', at=fr, dur=round(2.0 * FPS), n=hud['mortes']))
                audio.append(dict(src='sfx/death.mp3', at=fr, vol=0.6))
            elif k == 'hud':
                hud[it[1]] += 1
                ev.append(dict(at=fr, k=it[1]))
                audio.append(dict(src='sfx/correct-ding.mp3', at=fr, vol=0.4))
            elif k == 'seta':
                ds = leitura(it[3], 1.4, 0.3, 2.0, 3.4)
                over.append(dict(tipo='seta', at=fr, dur=round(ds * FPS), x=it[1], y=it[2], rotulo=it[3], **({'lado': it[4]} if len(it) > 4 else {})))
                audio.append(dict(src='sfx/swoosh-air.mp3', at=fr, vol=0.3))
            elif k == 'tempo':
                over.append(dict(tipo='tempo', at=fr, dur=round(2.6 * FPS), texto=it[1]))
            elif k == 'marca':
                marcas.append(fr)
            elif k == 'ir':
                anc.append([fr, float(it[1])])
            elif k == 's':
                audio.append(dict(src=f'sfx/{it[1]}.mp3', at=fr, vol=it[2] if len(it) > 2 else 0.5))
            elif k == 'p':
                t += float(it[1])
            else:
                raise SystemExit(f"item desconhecido {k} na cena {c['id']}")
        selos = [o['dur'] for o in over if o['tipo'] == 'selo']
        for o in over:
            if o['tipo'] == 'meme':
                o['dur'] = max(selos) if selos else round(2.2 * FPS)  # meme fica o mesmo tempo do selo da cena
        n = max(round((t + c.get('folga', 0.4)) * FPS), 45)
        n = max(n, max((o['at'] + o['dur'] + 4 for o in over), default=0))  # nada é cortado pelo fim da cena
        cam = c.get('cam', [0.5, 0.5, 1.0, 1.08])
        cena = dict(id=c['id'], dur=n, cam=dict(x=cam[0], y=cam[1], z0=cam[2], z1=cam[3]), over=over, audio=audio, marcas=marcas,
                    hud=dict(mostra=hud_on and c.get('placar', True), ev=ev, **base))
        for kk in ('visual', 'props', 'escuro'):
            if kk in c:
                cena[kk] = c[kk]
        if c.get('clip'):
            arq, a, b = c['clip']
            pts = [[0, a]] + [p for p in anc if 0 < p[0] < n] + [[n, b]]
            if anc and anc[0][0] == 0:
                pts[0][1] = anc[0][1]
            segs = []
            for (f0, s0), (f1, s1) in zip(pts, pts[1:]):
                if f1 <= f0:
                    continue
                s1 = max(s1, s0)
                segs.append((f1 - f0, round(s0, 3), round(s1, 3)))
                v = (s1 - s0) / ((f1 - f0) / FPS)
                if (v < 0.45 or v > 6) and (f1 - f0) > 20:
                    avisos.append(f"{c['id']}: velocidade {v:.2f}x em {(f1 - f0) / FPS:.1f}s (origem {s0:.1f}-{s1:.1f})")
            cena['vel'] = round((b - pts[0][1]) / (n / FPS), 2)
            cena['clip'] = recortar(c['id'], ARQ[arq], segs)
        elif c.get('img'):
            destino = IMG / Path(c['img'][1] if isinstance(c['img'], list) else c['img']).name
            origem = FOOT / (c['img'][0] if isinstance(c['img'], list) else c['img'])
            if not destino.exists():
                shutil.copy(origem, destino)
            cena['img'] = f'roblox/img/{destino.name}'
        cenas.append(cena)
    tot = sum(c['dur'] for c in cenas) / FPS
    # conferências do padrão do canal
    memes = Counter(o['id'] for c in cenas for o in c['over'] if o['tipo'] == 'meme')
    rep = [m for m, q in memes.items() if q > 1]
    if rep:
        avisos.append(f'MEME REPETIDO: {rep}')
    for c in cenas:
        for o in c['over']:
            if o['at'] + o['dur'] > c['dur']:
                avisos.append(f"{c['id']}: {o['tipo']} cortado pelo fim da cena")
    # efeito a cada ~15-20 s
    efeitos, ini = [], 0
    for c in cenas:
        efeitos += [(ini + o['at']) / FPS for o in c['over'] if o['tipo'] in ('selo', 'meme', 'numero', 'morte', 'marco', 'seta')]
        ini += c['dur']
    efeitos = sorted(set(round(e) for e in efeitos))
    for a, b in zip([0] + efeitos, efeitos + [round(tot)]):
        if b - a > 22:
            avisos.append(f'sem efeito entre {a // 60}:{a % 60:02d} e {b // 60}:{b % 60:02d}')
    print('\n'.join(avisos))
    ini = 0
    for c in cenas:
        if any(o['tipo'] == 'marco' for o in c['over']):
            print(f"  {ini / FPS / 60:5.2f} min  {[o['titulo'] for o in c['over'] if o['tipo'] == 'marco'][0]}")
        ini += c['dur']
    print(f'memes: {len(memes)} ({len(memes) / (tot / 60):.1f}/min)')
    if CONTAR or SEM_VOZ:
        print(f'duração estimada {tot / 60:.2f} min; faltam gerar {falta} caracteres de voz')
        if CONTAR:
            return
    (PUB / 'timeline_roblox.json').write_text(json.dumps(dict(cenas=cenas), ensure_ascii=False))
    print(f'total {tot / 60:.2f} min ({sum(c["dur"] for c in cenas)} quadros); caracteres gastos agora: {gasto}')


if __name__ == '__main__':
    main()
