#!/usr/bin/env python3
"""AMONG IA 7 (Mira HQ de dia, 20 IAs): roteiro (video/roteiro/roteiro_au7.py) -> public/timeline_au7.json + vozes
(public/au7/voz). Mesmo pipeline do AU6 (build_timeline_zumbi.py), com as telas do Among clássico.
Cena: {id, partida, t0 (tique), vel (tiques por segundo de vídeo), cam, foco?, cap?, sub?, hud?, papeis?, visual?, entrada?,
musica?, folga?, itens}.
  visual: {"tipo": "reuniao"|"votos"|"ejecao", "indice": n} (mesa de reunião lida do log) · {"tipo": "papeis", "lista": [...]} ·
          {"tipo": "elenco"} · {"tipo": "comentarios", "comentarios": [...]} · {"tipo": "placar", "titulo", "linhas"}; sem visual = mapa.
  entrada: "duto" | "alarme" (transição própria do vídeo cobrindo o corte; não existe transição de lobby).
  musica: id da trilha (public/music) que começa nesta cena e vai até a próxima cena com "musica" (lido pelo au7_final.py).
Itens: ["n", texto] narrador · ["fala", cor, texto] fala de reunião na voz da cor · ["pensa", cor, texto] pensamento com
ECO (regra do canal: nunca sussurro) · ["chat", cor, texto] chat secreto dos impostores · opção final {"voz": cor} em
fala/pensa/chat = quem fala pela boca daquele corpo (Possuidor) · ["selo", texto, cor?] · ["meme", id, pos?] (mesmo tempo do
selo da cena) · ["numero", texto, sub?] · ["marco", titulo, sub?] · ["fim", titulo, sub?, cor?] · ["ideia", "@autor", funcao?] ·
["s", sfx, vol?] · ["p", segundos] · ["ir", tique] âncora (neste ponto da narração o jogo está no tique X).
Selo fica o tempo de ler; meme junto com o selo; a cena nunca corta selo/meme/número (padrão aprovado do AGE v4).
Toda fala/pensamento/chat é conferida no log antes de gerar voz (au7_conferir.py): se uma não bater, para.
--contar: só conta os caracteres que faltam gerar (não gasta nada) · --sem-voz: prévia com duração estimada.
A chave do ElevenLabs vem do ambiente (ELEVENLABS_API_KEY) ou do mod chaves-ias (/chave elevenlabs ...)."""
import glob, hashlib, importlib.util, json, os, re, subprocess, sys, urllib.request, urllib.error
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'remotion' / 'public'
VOZ = PUB / 'au7' / 'voz'
VOZ.mkdir(parents=True, exist_ok=True)
FPS = 30
MODELO = 'eleven_v4'
AJUSTES = {'stability': 0.5, 'similarity_boost': 0.75}
NARRADOR = 'lvkgCBi6spByiTZMPJEK'  # Gabriel
VOZES = {  # as mesmas do AU5/AU6: cada cor é um personagem
    'Vermelho': 'YU8EsJtXFMyKMxYtheDk', 'Azul': 'dX7gRq1dIvLTgUaWpEFn', 'Verde': '2CECaLAGTS5NRGxgbcxr', 'Rosa': 'GDzHdQOi6jjf8zaXhCYD',
    'Laranja': 'YbP0Eq5RE5uOoCEl7F3T', 'Amarelo': '4za2kOXGgUd57HRSQ1fn', 'Preto': 'bJrNspxJVFovUxNBQ0wh', 'Branco': '7lu3ze7orhWaNeSPowWx',
    'Roxo': 'ZYCQDYoXnl78dNdU6JeG', 'Marrom': 'pVJr1h0A4fisVFn0dCVn', 'Ciano': 'ohZOfA9iwlZ5nOsoY7LB', 'Lima': '33B4UnXyTNbgLmdEDh5P',
    'Cinza': '6GWfivGWZoUg1lb8HBrE', 'Coral': 'xcNJswC7UcxsIiCuih19', 'Bordo': 'NDUHL9ozN4FPvbUqxHVJ', 'Banana': 'm5fAy5I8fIHSzvsA8sRt',
    'Caqui': 'NrirjBupLRUlqHita17L', 'Rose': 'cgSgspJ2msm6clMCkdW9', 'Turquesa': 'n2a9VtkZLl8j1FSXHsL7', 'Dourado': 'TX3LPaxmHKxFdv7VOQHJ',
}
# pronúncia só para a voz (a tela mostra o texto original do log)
PRON = {'Haiku': 'Raicu', 'GPT': 'GêPêTê', 'GLM': 'Gê Éle Ême', 'DeepSeek': 'Dípsíque', 'Qwen': 'Cuên', 'MiMo': 'Mímo', 'MiniMax': 'Mini Mécs',
        'Luna': 'Lúna', 'Mira': 'Míra', 'HQ': 'Agá Quê', 'Among': 'Amông', 'Us': 'Âs', 'NAO': 'não', 'AQUI': 'aqui', 'Lab': 'Lab', 'Bordo': 'Bórdô'}
CONTAR = '--contar' in sys.argv
SEM_VOZ = '--sem-voz' in sys.argv
MEMES = {m['id']: m for m in json.loads((PUB / 'gifs' / 'catalog.json').read_text())}
# entradas do catálogo com media_url errado (todas baixam o mesmo GIF): não usar (MEMORIA_TECNICA.md)
MEMES_RUINS = {'cat-ok-thumbs-up', 'coffin-dance-byu', 'goodbye-see-ya', 'hangry-cat', 'hide-the-pain-harold', 'im-hungry-cat', 'nuclear-mushroom-cloud', 'running-from-problems', 'wait-who-are-you'}
gasto, falta = 0, 0

sys.path.insert(0, str(Path(__file__).parent))
import au7_conferir  # noqa: E402


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
    t = re.sub(r'\bt(\d+)(?:/(\d+))?', lambda m: f'tique {m.group(1)}' + (f' ou {m.group(2)}' if m.group(2) else ''), t)  # "t18" do log -> "tique 18"
    for a, b in PRON.items():
        t = re.sub(rf'\b{a}\b', b, t)
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
            return f'au7/voz/{h}.mp3', max(0.8, len(texto) / 14)
        body = json.dumps({'text': falado(texto), 'model_id': MODELO, 'voice_settings': AJUSTES}).encode()
        req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voz}?output_format=mp3_44100_128', data=body, headers={'xi-api-key': chave(), 'Content-Type': 'application/json'})
        cru = VOZ / f'{h}_cru.mp3' if eco else mp3
        for tentativa in range(4):
            try:
                cru.write_bytes(urllib.request.urlopen(req, timeout=180).read())
                break
            except urllib.error.HTTPError as e:
                corpo = e.read().decode('utf-8', 'replace')
                if 'quota' in corpo.lower() or e.code in (401, 402):
                    raise SystemExit(f'SEM_COTA no ElevenLabs (já gerados {gasto} caracteres nesta rodada): {corpo[:200]}')
                if tentativa == 3:
                    raise
            except Exception:  # noqa: BLE001  (rede: tenta de novo)
                if tentativa == 3:
                    raise
        gasto += len(texto)
        if eco:  # pensamento: mesma voz, com eco (nunca sussurro)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(cru), '-af', 'aecho=0.8:0.7:90|180:0.35|0.2,apad=pad_dur=0.35', str(mp3)], check=True)
            cru.unlink()
    return f'au7/voz/{h}.mp3', dur(mp3)


def sfx(nome):
    for pasta in ('sfx', 'sfx_au2', 'sfx_au4'):
        if (PUB / pasta / f'{nome}.mp3').exists():
            return f'{pasta}/{nome}.mp3'
    raise SystemExit(f'efeito sonoro {nome} não existe')


def carregar():
    spec = importlib.util.spec_from_file_location('roteiro_au7', ROOT / 'roteiro' / 'roteiro_au7.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def conferir(cenas):
    erros = []
    for c in cenas:
        for it in c['itens']:
            if it[0] in ('fala', 'pensa', 'chat') and not au7_conferir.achar(c['partida'], it[1], it[2]):
                erros.append(f"cena {c['id']}: {it[1]} não disse/pensou isto no log da partida {c['partida']}: {it[2][:80]}")
    usados = Counter(it[1] for c in cenas for it in c['itens'] if it[0] == 'meme')
    erros += [f'meme repetido: {m} ({n}x)' for m, n in usados.items() if n > 1]
    erros += [f'meme inexistente ou com arquivo errado: {m}' for m in usados if m not in MEMES or m in MEMES_RUINS]
    if erros:
        raise SystemExit('ROTEIRO REPROVADO:\n  ' + '\n  '.join(erros))
    return len(usados)


def main():
    mod = carregar()
    n_memes = conferir(mod.CENAS)
    logs = {n: json.loads((PUB / 'au7' / f'partida{n}.json').read_text()) for n in (1, 2, 3, 4)}
    cenas = []
    for c in mod.CENAS:
        t, over, audio, fim_selo, tk, ult, t0 = 0.0, [], [], 0.0, [], None, float(c.get('t0', 1))
        vis = c.get('visual')
        if c.get('entrada'):  # som da transição (o corte cai no meio dela)
            audio.append(dict(src=sfx('emergencia' if c['entrada'] == 'alarme' else 'duto'), at=0, vol=0.45 if c['entrada'] == 'alarme' else 0.6))
        if vis and vis['tipo'] == 'ejecao':
            audio.append(dict(src=sfx('ejecao'), at=4, vol=0.5))
        if c.get('cap'):
            over.append(dict(tipo='marco', at=0, dur=84, titulo=c['cap'], sub=c.get('sub', f"Partida {c['partida']}")))
            audio.append(dict(src=sfx('whoosh'), at=0, vol=0.4))
            t += 0.7
        for it in c['itens']:
            k = it[0]
            opc = it[-1] if isinstance(it[-1], dict) else {}
            if opc:
                it = it[:-1]
            if k not in ('s', 'p', 'ir', 'ideia'):
                ult = k if k != 'meme' else ult
            if k == 'ir':
                fr = round(t * FPS)
                if fr == 0 and not tk:
                    t0 = float(it[1])
                elif tk and fr <= tk[-1][0]:
                    tk[-1] = [tk[-1][0], max(tk[-1][1], float(it[1]))]
                elif not tk or float(it[1]) >= tk[-1][1]:
                    tk.append([fr, float(it[1])])
            elif k == 'fim':
                over.append(dict(tipo='fim', at=round(t * FPS), dur=round(4.4 * FPS), titulo=it[1], **({'sub': it[2]} if len(it) > 2 else {}), **({'cor': it[3]} if len(it) > 3 else {})))
                audio.append(dict(src=sfx('impact-epic'), at=round(t * FPS), vol=0.45))
            elif k == 'n':
                src, d = tts(it[1], NARRADOR)
                if src: audio.append(dict(src=src, at=round(t * FPS)))
                t += d + 0.12
            elif k in ('fala', 'pensa', 'chat'):
                src, d = tts(it[2], VOZES[opc.get('voz', it[1])], eco=(k == 'pensa'))
                if src: audio.append(dict(src=src, at=round(t * FPS)))
                over.append(dict(tipo=k, at=round(t * FPS), dur=round((d + 0.5) * FPS), cor=it[1], texto=it[2]))
                t += d + 0.25
            elif k == 'selo':
                ds = min(3.0, max(1.6, 0.9 + 0.3 * len(it[1].split())))
                ini = max(t, fim_selo)
                fim_selo = ini + ds
                over.append(dict(tipo='selo', at=round(ini * FPS), dur=round(ds * FPS), texto=it[1], **({'cor': it[2]} if len(it) > 2 else {})))
                audio.append(dict(src=sfx('pop'), at=round(ini * FPS), vol=0.5))
            elif k == 'marco':
                over.append(dict(tipo='marco', at=round(t * FPS), dur=84, titulo=it[1], **({'sub': it[2]} if len(it) > 2 else {})))
                audio.append(dict(src=sfx('whoosh'), at=round(t * FPS), vol=0.4))
            elif k == 'ideia':
                over.append(dict(tipo='ideia', at=round(t * FPS), dur=round(3.4 * FPS), autor=it[1], **({'oque': it[2]} if len(it) > 2 else {})))
                audio.append(dict(src=sfx('notification-pop'), at=round(t * FPS), vol=0.4))
            elif k == 'meme':
                m = MEMES[it[1]]
                selo_ant = [o for o in over if o['tipo'] == 'selo']
                at_m = selo_ant[-1]['at'] if ult == 'selo' and selo_ant else round(t * FPS)  # junto com o selo do evento
                over.append(dict(tipo='meme', at=at_m, dur=None, id=it[1], pos=it[2] if len(it) > 2 else 'right',
                                 info=dict(file=Path(m['file_gif']).name, width=m['width'], height=m['height'], duration=m['duration_sec'])))
            elif k == 'numero':
                over.append(dict(tipo='numero', at=round(t * FPS), dur=round(2.6 * FPS), texto=it[1], sub=it[2] if len(it) > 2 else None))
                audio.append(dict(src=sfx('impact-epic'), at=round(t * FPS), vol=0.45))
            elif k == 's':
                audio.append(dict(src=sfx(it[1]), at=round(t * FPS), vol=it[2] if len(it) > 2 else 0.5))
            elif k == 'p':
                t += float(it[1])
            else:
                raise SystemExit(f"cena {c['id']}: item desconhecido {k}")
        selos = [o['dur'] for o in over if o['tipo'] == 'selo']
        for o in over:
            if o['tipo'] == 'meme':
                o['dur'] = max(selos) if selos else round(2.2 * FPS)  # meme fica o mesmo tempo do selo da cena
        n = max(round((t + c.get('folga', 0.5)) * FPS), 45)
        n = max(n, max((o['at'] + o['dur'] + 4 for o in over if o['tipo'] in ('selo', 'meme', 'numero', 'marco', 'fim', 'ideia', 'fala', 'pensa', 'chat')), default=0))
        if vis and vis['tipo'] == 'votos':  # tempo de ver os votos entrarem e o carimbo bater
            nv = len(logs[c['partida']]['reunioes'][vis['indice']]['votos'])
            n = max(n, round((14 + nv * 9) / 0.62) + 10, 14 + nv * 9 + 10 + 55)
            for j in range(nv):
                audio.append(dict(src=sfx('voto'), at=14 + j * 9, vol=0.22))
            fim_v = max(44, min(n * 0.62, 14 + nv * 9))
            audio.append(dict(src=sfx('boom'), at=round(fim_v + 10), vol=0.5))
        if vis and vis['tipo'] == 'ejecao':
            n = max(n, round(4.6 * FPS))
        vel = float(c.get('vel', 0.25)) / FPS
        cenas.append(dict(id=c['id'], dur=n, partida=c['partida'], t0=t0, vel=round(vel, 5), cam=c.get('cam', {'mapa': True}), foco=c.get('foco'),
                          hud=c.get('hud', True), over=over, audio=audio, **({'visual': vis} if vis else {}), **({'papeis': c['papeis']} if 'papeis' in c else {}),
                          **({'tk': tk} if tk else {}), **({'entrada': c['entrada']} if c.get('entrada') else {}), **({'musica': c['musica']} if c.get('musica') else {}),
                          **({'cap': c['cap']} if c.get('cap') else {})))
    tot = sum(c['dur'] for c in cenas) / FPS
    falas = sum(len(it[1] if it[0] == 'n' else it[2]) for c in mod.CENAS for it in c['itens'] if it[0] in ('n', 'fala', 'pensa', 'chat'))
    if CONTAR:
        print(f'duração estimada {tot / 60:.1f} min; texto falado {falas} caracteres; faltam gerar {falta} caracteres de voz')
        return
    (PUB / 'timeline_au7.json').write_text(json.dumps(dict(cenas=cenas), ensure_ascii=False))
    print(f'total {tot / 60:.2f} min ({sum(c["dur"] for c in cenas)} quadros), {len(cenas)} cenas, {n_memes} memes sem repetição; caracteres gastos agora: {gasto}')
    ini = 0
    for c in cenas:
        if c.get('cap') or c.get('musica'):
            print(f"  {ini / FPS // 60:02.0f}:{ini / FPS % 60:02.0f}  {c.get('cap') or c['id']}  [{c.get('musica', '')}]")
        ini += c['dur']


if __name__ == '__main__':
    main()
