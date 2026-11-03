#!/usr/bin/env python3
"""Linha do tempo do BOMBANANA! das IAs a partir das gravações do motor (bombanana/gravacoes/<nome>/faseN.jsonl).

Cada rodada vira um bloco: fala do Surdo, gesto do Mudo (+ pensamento dele, com eco), fala do Cego (+ pensamento
quando mexe na bomba) e a ação na bomba (visão do Cego, zoom, ding ou buzina). Rodadas repetidas em sequência viram
um resumo do narrador. Vozes: Edge TTS (grátis), uma voz por IA; pensamentos com eco (aecho), nunca sussurro.
Falas e pensamentos são copiados dos logs (só cortados no fim de frase quando passam do tamanho).
Uso: python3 bb_timeline.py [nome=partida1] [fases=1-9]
Saída: remotion/public/bb/timeline.json e remotion/public/bb/voz/*.mp3
"""
import asyncio
import difflib
import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'remotion' / 'public'
SAIDA = PUB / 'bb'
VOZ = SAIDA / 'voz'
GRAV = ROOT.parent / 'bombanana' / 'gravacoes'
FPS = 30
sys.path.insert(0, str(Path(__file__).parent))
import tts  # noqa: E402

NARRADOR = 'pt-BR-AntonioNeural'
VOZES = {  # voz de cada IA (as multilíngues falam português com sotaque, combina com macaco de IA)
    'Claude': ('en-US-AndrewMultilingualNeural', '+0Hz'), 'GPT': ('en-US-BrianMultilingualNeural', '+0Hz'),
    'Gemini': ('pt-BR-FranciscaNeural', '+0Hz'), 'Grok': ('fr-FR-RemyMultilingualNeural', '+0Hz'),
    'DeepSeek': ('ko-KR-HyunsuMultilingualNeural', '+0Hz'), 'Qwen': ('pt-BR-ThalitaMultilingualNeural', '+0Hz'),
    'GLM': ('de-DE-FlorianMultilingualNeural', '+0Hz'), 'MiMo': ('en-US-AvaMultilingualNeural', '+0Hz'),
    'Mistral': ('fr-FR-VivienneMultilingualNeural', '+0Hz'),
}
CORES = {'Claude': '#d97757', 'GPT': '#10a37f', 'Gemini': '#4285f4', 'Grok': '#9e9e9e', 'DeepSeek': '#4d6bfe', 'Qwen': '#8b6cff', 'GLM': '#3d7bff', 'MiMo': '#ff6900', 'Mistral': '#fa520f'}
MODELOS = {'Claude': 'Claude Haiku 5.5', 'GPT': 'GPT-5.6 Luna', 'Gemini': 'Gemini 3.8 Flash', 'Grok': 'Grok 4.7', 'DeepSeek': 'DeepSeek V4.1 Flash', 'Qwen': 'Qwen 3.8 Flash', 'GLM': 'GLM 5.3 Flash', 'MiMo': 'MiMo V2.6 Flash', 'Mistral': 'Mistral Large 4'}
LUGAR = {'van': 'NA VAN', 'aviao': 'NO AVIÃO', 'laboratorio': 'NO LABORATÓRIO'}
PRONUNCIA = {'GPT': 'GêPêTê', 'Grok': 'Gróqui', 'GLM': 'Gê Éle Ême', 'DeepSeek': 'Dípsíque', 'Qwen': 'Cuên', 'Gemini': 'Djêmini', 'MiMo': 'Mímo', 'Mistral': 'Mistrál', 'Claude': 'Clôd'}


def falado(t):
    for a, b in PRONUNCIA.items():
        t = re.sub(rf'\b{a}\b', b, t)
    return t


def curto(t, mx=170):
    t = ' '.join(str(t).split())
    if len(t) <= mx:
        return t
    corte = max(t.rfind(p, 0, mx) for p in '.!?')
    return t[:corte + 1] if corte > 40 else t[:mx].rsplit(' ', 1)[0] + '...'


def parecido(a, b):
    return bool(a and b) and difflib.SequenceMatcher(None, a.lower(), b.lower()).ratio() > 0.6


def carregar(nome, fases):
    out = {}
    for n in fases:
        f = GRAV / nome / f'fase{n}.jsonl'
        if f.exists():
            out[n] = [json.loads(l) for l in f.read_text().splitlines() if l.strip()]
    return out


def roteiro():
    p = Path(__file__).parent / 'bb_roteiro.py'
    if not p.exists():
        return {}
    spec = importlib.util.spec_from_file_location('bb_roteiro', p)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return getattr(m, 'ROTEIRO', {})


PEDIDOS = []


def voz(id_, texto, quem=None, eco=False):
    """Registra uma fala para o TTS; devolve o caminho público (o mp3 sai depois, em lote)."""
    v, p = VOZES.get(quem, (NARRADOR, '+0Hz')) if quem else (NARRADOR, '+0Hz')
    PEDIDOS.append({'id': id_, 'text': falado(texto), 'voice': v, 'pitch': p, 'rate': '+12%' if quem else '+6%', 'eco': eco})
    return f'bb/voz/{id_}{"_eco" if eco else ""}.mp3'


def dur_s(id_, eco=False):
    f = VOZ / f'{id_}{"_eco" if eco else ""}.mp3'
    return tts.duration(f) if f.exists() else 2.0


def montar(nome='partida1', fases=range(1, 10)):
    R = roteiro()
    dados = carregar(nome, fases)
    blocos = []  # cada bloco: dict com 'itens' (falas a cronometrar depois)

    def narr(id_, texto, lugar='van'):
        blocos.append({'tipo': 'narrador', 'lugar': lugar, 'texto': texto, 'itens': [('narr', id_, texto, None, False)]})

    for i, t in enumerate(R.get('intro', [])):
        narr(f'intro{i}', t)
    for n, evs in dados.items():
        ini = next(e for e in evs if e['tipo'] == 'inicio')
        fim = next((e for e in evs if e['tipo'] == 'fim'), {'resultado': 'tempo'})
        fase, time = ini['fase'], ini['time']
        blocos.append({'tipo': 'fase', 'titulo': f'FASE {n}', 'sub': f"{LUGAR[fase['lugar']]} · {' + '.join(m.upper() for m in fase['mods'])} · {fase['tempo'] // 60}:{fase['tempo'] % 60:02d}", 'time': time,
                       'itens': [('narr', f'f{n}_antes', R.get(f'f{n}_antes', f"Fase {n}. {time['Cego']} é o cego, {time['Surdo']} é o surdo e {time['Mudo']} é o mudo."), None, False)]})
        mods = ini['modulos']
        rods = [e for e in evs if e['tipo'] == 'rodada']
        ant = {}
        pulo = 0
        for k, r in enumerate(rods):
            d = r['dec']
            cego, surdo, mudo = time['Cego'], time['Surdo'], time['Mudo']
            fs, fc, gm = d[surdo]['fala'], d[cego]['fala'], d[mudo]['gesto']
            repetida = not r.get('acao') and parecido(fs, ant.get('fs')) and parecido(fc, ant.get('fc')) and gm == ant.get('gm')
            ant = {'fs': fs, 'fc': fc, 'gm': gm}
            if repetida and k < len(rods) - 1 and not (r['caos'].get('apagao') or r['caos'].get('alarme')):
                pulo += 1
                mods = r['modulos']
                continue
            if pulo:
                txt = R.get(f'f{n}_pulo{k}', f"E isso se repetiu por mais {pulo * 10} segundos.")
                blocos.append({'tipo': 'narrador', 'lugar': fase['lugar'], 'texto': txt, 'itens': [('narr', f'f{n}_p{k}', txt, None, False)]})
                pulo = 0
            itens = []
            if fs:
                itens.append(('fala', f'f{n}r{k}s', curto(fs), surdo, False))
            if gm:
                itens.append(('gesto', None, gm, mudo, False))
            if d[mudo]['pensamento'] and (k % 2 == 0 or gm in ('tapa', 'jogar_banana')):
                itens.append(('pensa', f'f{n}r{k}m', curto(d[mudo]['pensamento'], 120), mudo, True))
            if fc:
                itens.append(('fala', f'f{n}r{k}c', curto(fc), cego, False))
            if r.get('acao'):
                if d[cego]['pensamento']:
                    itens.append(('pensa', f'f{n}r{k}cp', curto(d[cego]['pensamento'], 110), cego, True))
                itens.append(('acao', None, r, cego, False))
            blocos.append({'tipo': 'rodada', 'fase': fase, 'lugar': fase['lugar'], 'time': time, 'resta': fase['tempo'] - r['t'], 'erros': r['erros'] - (1 if r.get('efeito') and r['efeito'].get('ok') is False else 0),
                           'maxErros': fase['erros'], 'modulos': mods, 'modulosDepois': r['modulos'], 'caos': r['caos'], 'itens': itens})
            mods = r['modulos']
        res = fim['resultado']
        if res == 'desarmou':
            blocos.append({'tipo': 'vitoria', 'titulo': 'DESARMADA!', 'sub': f'{time["Cego"]}, {time["Surdo"]} e {time["Mudo"]} salvaram a {fase["lugar"] == "van" and "van" or fase["lugar"] == "aviao" and "tripulação" or "cidade"}', 'time': time, 'itens': [('sfx', 'sfx/tada.mp3')]})
        else:
            blocos.append({'tipo': 'explosao', 'titulo': 'BOOOM!', 'sub': 'O tempo acabou' if res == 'tempo' else 'Erros demais', 'itens': [('sfx', 'sfx/explosion.mp3')]})
        if R.get(f'f{n}_depois'):
            narr(f'f{n}_depois', R[f'f{n}_depois'], fase['lugar'])
    return blocos


def cronometrar(blocos):
    """Gera as vozes (lote), aplica o eco e transforma itens em falas/áudios com frames."""
    VOZ.mkdir(parents=True, exist_ok=True)
    for b in blocos:
        for it in b["itens"]:
            if it[0] in ("narr", "fala", "pensa"):
                voz(it[1], it[2], it[3] if it[0] != "narr" else None, it[4])
    asyncio.run(tts.run_edge([{k: v for k, v in p.items() if k != 'eco'} for p in PEDIDOS], VOZ, 6))
    for p in PEDIDOS:
        if p['eco']:
            src, dst = VOZ / f"{p['id']}.mp3", VOZ / f"{p['id']}_eco.mp3"
            if not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime:
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-af', 'aecho=0.8:0.7:90|180:0.35|0.2,volume=1.1', str(dst)], check=True)
    out = []
    for b in blocos:
        itens = b.pop('itens', [])
        f, falas, audio = 12, [], []
        for it in itens:
            kind = it[0]
            if kind in ('narr', 'fala', 'pensa'):
                _, id_, texto, quem, eco = it
                src = f'bb/voz/{id_}{"_eco" if eco else ""}.mp3'
                d = int((dur_s(id_, eco) + 0.25) * FPS)
                audio.append({'src': src, 'ini': f})
                if kind != 'narr':
                    papel = next(k for k, v in b['time'].items() if v == quem)
                    falas.append({'quem': quem, 'papel': papel, 'texto': texto, 'ini': f, 'dur': d, 'pensa': kind == 'pensa'})
                else:
                    b.setdefault('narr', []).append({'texto': texto, 'ini': f, 'dur': d})
                f += d
            elif kind == 'gesto':
                b['gesto'] = {'quem': it[3], 'gesto': it[2], 'ini': f}
                audio.append({'src': 'sfx/boing.mp3' if it[2] in ('tapa', 'jogar_banana') else 'sfx/pop.mp3', 'ini': f, 'vol': 0.6})
                f += 30
            elif kind == 'acao':
                r = it[2]
                ef = r.get('efeito') or {}
                f += 45  # visão do Cego antes da ação
                b['acao'] = {'ini': f, 'modulo': int(r['acao'].get('modulo') or 1), 'tipo': r['acao'].get('tipo'), 'valor': r['acao'].get('valor'), 'ok': ef.get('ok'), 'texto': ef.get('texto', '')}
                audio.append({'src': 'sfx/correct-ding.mp3' if ef.get('ok') else 'sfx/wrong-buzzer.mp3' if ef.get('ok') is False else 'sfx/mouse-click.mp3', 'ini': f})
                f += 75
            elif kind == 'sfx':
                audio.append({'src': it[1], 'ini': 0})
                f = max(f, 105)
        if b['tipo'] == 'fase':
            f = max(f, 120)
        b['falas'] = falas
        b['dur'] = max(f + 10, 45)
        b['audio'] = audio
        out.append(b)
    return out


def main():
    nome = sys.argv[1] if len(sys.argv) > 1 else 'partida1'
    a, z = (sys.argv[2] if len(sys.argv) > 2 else '1-9').split('-')
    blocos = montar(nome, range(int(a), int(z) + 1))
    blocos = cronometrar(blocos)
    tl = {'blocos': blocos, 'cores': CORES, 'modelos': MODELOS, 'musica': 'music/monkeys-spinning-monkeys.mp3'}
    SAIDA.mkdir(parents=True, exist_ok=True)
    (SAIDA / 'timeline.json').write_text(json.dumps(tl, ensure_ascii=False))
    tot = sum(b['dur'] for b in blocos) / FPS
    print(f'{len(blocos)} blocos, {tot / 60:.1f} min')


if __name__ == '__main__':
    main()
