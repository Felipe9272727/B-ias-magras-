#!/usr/bin/env python3
"""POKÉMON (3 IAs criaram as próprias IAs): storyboard do Fable (video/youtube/pokemon/storyboard.md: narração, citações,
selo, meme, som) + decisões da edição (video/roteiro/roteiro_pokemon.py: o que aparece na tela, clipes, música, capítulos)
-> public/timeline_pokemon.json + vozes (public/pokemon/voz). Mesmo motor de voz/efeitos do AU7.
--contar: só conta o que falta gerar de voz (não gasta) · --sem-voz: prévia com duração estimada."""
import importlib.util, json, re, subprocess, sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au7 as B  # noqa: E402  (tts, sfx, MEMES, chave: mesmo pipeline do AU7)

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'remotion' / 'public'
VOZ = PUB / 'pokemon' / 'voz'
VOZ.mkdir(parents=True, exist_ok=True)
B.VOZ = VOZ
FPS = 30
VOZ_IA = {'claude': 'dX7gRq1dIvLTgUaWpEFn', 'gemini': '2CECaLAGTS5NRGxgbcxr', 'gpt': '4za2kOXGgUd57HRSQ1fn'}
B.PRON.update({'IGNIS-ZERO': 'Ígnis Zero', 'PPO': 'pê pê ó', 'CPU': 'cê pê u', 'FireRed': 'Fáier Réd', 'README': 'ríd mi', 'START': 'start'})
COR = {'claude': '#E8763A', 'gemini': '#3D7BF2', 'gpt': '#19A974'}


def tts(texto, voz):
    src, d = B.tts(texto, voz)
    return (src.replace('au7/voz/', 'pokemon/voz/') if src else None), d


def carregar():
    spec = importlib.util.spec_from_file_location('roteiro_pokemon', ROOT / 'roteiro' / 'roteiro_pokemon.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def ia_de(txt):
    t = txt.lower()
    return 'gemini' if 'gemini' in t else 'gpt' if 'gpt' in t else 'claude' if 'claude' in t else None


def ler_storyboard(mod):
    txt = (ROOT / 'youtube' / 'pokemon' / 'storyboard.md').read_text()
    txt = txt.split('# Conferência')[0]
    cenas = []
    for bloco in re.split(r'\n## ', txt)[1:]:
        cab = bloco.split('\n', 1)[0]
        mm = re.match(r'([A-Z]\d?[a-z]?)\s+—\s+(.+?)\s+·', cab)
        if not mm:
            continue
        sid, titulo = mm.group(1), mm.group(2)
        itens, fecho, selos, memes, sons = [], [], [], [], []
        for ln in bloco.split('\n')[1:]:
            ln = ln.strip()
            if ln.startswith('- **NARRAÇÃO (fecho)**'):
                fecho.append(['n', re.search(r'"(.+)"', ln).group(1)])
            elif ln.startswith('- **NARRAÇÃO'):
                t = re.search(r'"(.+)"', ln).group(1)
                t = re.sub(r'\s*`\[CONFERIR[^`]*\]`\s*', ' ', t).strip()
                itens.append(['n', t])
            elif ln.startswith('- **CITAÇÃO'):
                tag = (re.search(r'`\[([^\]]+)\]`', ln) or [None, ''])[1]
                quem = ia_de(ln.split(':', 1)[0] if ':' in ln else ln) or ia_de(ln)
                qs = re.findall(r'\*"(.+?)"\*', ln)
                so_tela = (not qs) or any('{' in q for q in qs) or tag.startswith(('treino.log', 'jogar.log', 'anotação')) or re.search(r'x\d+ na tela|só na tela|na tela \d+ vezes', ln)
                for q in qs or []:
                    itens.append(['cita', quem or 'claude', tag, q, {'mudo': bool(so_tela)}])
            elif ln.startswith('- **SELO**'):
                selos += re.findall(r'"([^"]+)"', ln)[:2]
            elif ln.startswith('- **MEME**'):
                memes += re.findall(r'`([a-z0-9-]+)`', ln)[:2]
            elif ln.startswith('- **SOM**'):
                sons += re.findall(r'`([a-z0-9-]+)`', ln)[:2]
        memes = [mod.TROCA_MEME.get(m, m) for m in memes]
        clima = []
        for i, s in enumerate(selos):
            clima.append(['selo', s])
            if i < len(memes):
                clima.append(['meme', memes[i]])
            if i < len(sons):
                clima.append(['s', sons[i], 0.55])
        for s in sons[len(selos):]:
            clima.append(['s', s, 0.5])
        cenas.append(dict(id=sid, titulo=titulo, itens=itens + clima + fecho))
    return cenas


def main():
    mod = carregar()
    cenas_sb = ler_storyboard(mod)
    # o veredito das IAs entra depois do placar (F1)
    ordem = []
    for c in cenas_sb:
        ordem.append(c)
        if c['id'] == 'F1':
            ordem += [dict(id=v['id'], titulo='', itens=v['itens']) for v in mod.VEREDITO]
    usados = Counter(it[1] for c in ordem for it in c['itens'] if it[0] == 'meme')
    erros = [f'meme repetido: {m} ({n}x)' for m, n in usados.items() if n > 1]
    erros += [f'meme ruim/inexistente: {m}' for m in usados if m not in B.MEMES or m in B.MEMES_RUINS]
    erros += [f'cena sem visual: {c["id"]}' for c in ordem if c['id'] not in mod.VIS]
    if erros:
        raise SystemExit('REPROVADO:\n  ' + '\n  '.join(erros))
    clips = {}
    for f in (PUB / 'pokemon' / 'clips').glob('*.json'):
        clips[f.stem] = dict(n=len(json.loads(f.read_text())), meta=json.loads(f.read_text()))
    cenas = []
    for c in ordem:
        t, over, audio, fim_selo, ult = 0.0, [], [], 0.0, None
        sid = c['id']
        if sid in mod.CAPS:
            falha = sid in mod.FALHA
            over.append(dict(tipo='salvando', at=0, dur=46, titulo=mod.CAPS[sid], falha=falha))
            audio.append(dict(src=B.sfx('glitch' if falha else 'mouse-click'), at=30 if falha else 34, vol=0.5))
            t += 1.4
        else:
            audio.append(dict(src=B.sfx('whoosh'), at=0, vol=0.25))
        for it in c['itens']:
            k = it[0]
            opc = it[-1] if isinstance(it[-1], dict) else {}
            if opc:
                it = it[:-1]
            if k not in ('s', 'p'):
                ult = k if k != 'meme' else ult
            if k == 'n':
                src, d = tts(it[1], B.NARRADOR)
                if src: audio.append(dict(src=src, at=round(t * FPS)))
                t += d + 0.15
            elif k == 'cita':
                ia, tag, texto = it[1], it[2], it[3]
                if opc.get('mudo'):
                    d = min(4.5, max(2.2, len(texto) / 16))
                else:
                    src, d = tts(texto, VOZ_IA[ia])
                    if src: audio.append(dict(src=src, at=round(t * FPS)))
                over.append(dict(tipo='cita', at=round(t * FPS), dur=round((d + 0.6) * FPS), ia=ia, tag=tag, texto=texto))
                t += d + 0.3
            elif k == 'selo':
                ds = min(3.0, max(1.8, 0.9 + 0.3 * len(it[1].split())))
                ini = max(t, fim_selo)
                fim_selo = ini + ds
                over.append(dict(tipo='selo', at=round(ini * FPS), dur=round(ds * FPS), texto=it[1]))
                audio.append(dict(src=B.sfx('pop'), at=round(ini * FPS), vol=0.45))
            elif k == 'meme':
                m = B.MEMES[it[1]]
                selo_ant = [o for o in over if o['tipo'] == 'selo']
                at_m = selo_ant[-1]['at'] if ult == 'selo' and selo_ant else round(t * FPS)
                over.append(dict(tipo='meme', at=at_m, dur=None, id=it[1], pos='right',
                                 info=dict(file=Path(m['file_gif']).name, width=m['width'], height=m['height'], duration=m['duration_sec'])))
            elif k == 's':
                ats = [o['at'] for o in over if o['tipo'] == 'selo']
                at = ats[-1] if ats and ult == 'selo' else round(t * FPS)
                audio.append(dict(src=B.sfx(it[1]), at=at, vol=it[2] if len(it) > 2 else 0.5))
            elif k == 'p':
                t += float(it[1])
        selos = [o['dur'] for o in over if o['tipo'] == 'selo']
        for o in over:
            if o['tipo'] == 'meme':
                o['dur'] = max(selos) if selos else round(2.4 * FPS)
        n = max(round((t + 0.6) * FPS), 60)
        n = max(n, max((o['at'] + o['dur'] + 4 for o in over), default=0))
        vis = json.loads(json.dumps(mod.VIS[sid]))
        def anexa(v):
            if v and v.get('tipo') == 'gba':
                v['n'] = clips.get(v['clip'], {}).get('n', 1)
                v['meta'] = clips.get(v['clip'], {}).get('meta', [])
            if v and v.get('tipo') == 'split':
                anexa(v['esq']); anexa(v['dir'])
        anexa(vis)
        if vis.get('tipo') == 'comentarios':
            vis['comentarios'] = mod.COMENTARIOS
        cenas.append(dict(id=sid, dur=n, visual=vis, over=over, audio=audio, **({'musica': mod.MUSICA[sid]} if sid in mod.MUSICA else {})))
    tot = sum(c['dur'] for c in cenas) / FPS
    if B.CONTAR:
        print(f'duração estimada {tot / 60:.1f} min; faltam gerar {B.falta} caracteres de voz')
        return
    (PUB / 'timeline_pokemon.json').write_text(json.dumps(dict(cenas=cenas), ensure_ascii=False))
    print(f'total {tot / 60:.2f} min ({sum(c["dur"] for c in cenas)} quadros), {len(cenas)} cenas, {len(usados)} memes; caracteres gastos agora: {B.gasto}')


if __name__ == '__main__':
    main()
