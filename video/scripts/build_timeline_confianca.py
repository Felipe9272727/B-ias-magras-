#!/usr/bin/env python3
"""JOGO DE CONFIANÇA: storyboard do Fable + roteiro_confianca.py -> public/timeline_confianca.json + vozes + dados da partida
(public/confianca/partida.json). Vozes: narrador = Felipe (1ª pessoa); cada cor tem a voz fixa do canal; pensamento com ECO."""
import importlib.util, json, re, sys
from collections import Counter
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au7 as B  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'remotion' / 'public'
VOZ = PUB / 'confianca' / 'voz'; VOZ.mkdir(parents=True, exist_ok=True)
B.VOZ = VOZ
FPS = 30
APRESENTADOR = B.VOZES['Branco']
LOG = json.loads((ROOT.parent / 'confianca' / 'logs' / 'partida1.json').read_text())
CORES = [j['cor'] for j in LOG['jogadores']]


def tts(texto, voz, eco=False):
    src, d = B.tts(texto, voz, eco=eco)
    return (src.replace('au7/voz/', 'confianca/voz/') if src else None), d


def carregar():
    spec = importlib.util.spec_from_file_location('r', ROOT / 'roteiro' / 'roteiro_confianca.py')
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m


def ler(mod):
    txt = (ROOT / 'youtube' / 'confianca' / 'storyboard.md').read_text().split('# CONFERÊNCIA')[0]
    cenas = []
    for bloco in re.split(r'\n## ', txt)[1:]:
        mm = re.match(r'([A-Z]\d+)\s+—\s+(.+?)\s+·', bloco.split('\n', 1)[0])
        if not mm:
            continue
        sid = mm.group(1)
        itens, fecho, selos, memes, sons, pos = [], [], [], [], [], None
        alvo = itens
        for ln in bloco.split('\n')[1:]:
            s = ln.strip()
            if s.startswith('- **NARRAÇÃO'):
                q = re.search(r'"(.+)"', s)
                if not q:
                    continue
                if re.search(r'NARRAÇÃO \((depois|fecho)', s):
                    fecho.append(['n', q.group(1)])
                else:
                    itens.append(['n', q.group(1)])
            elif re.match(r'(- )?\*\*(\w+)\*\* `\[', s) or (s.startswith('- **CITAÇÃO') and '“' in s):
                cor = re.search(r'\*\*(Vermelho|Azul|Verde|Amarelo|Rosa|Laranja|Roxo|Ciano)\*\*', s)
                tipo = (re.search(r'`\[([^\]]+)\]`', s) or [None, ''])[1]
                mt = re.search(r'\(M(\d) t(\d+)\)', s)
                qs = re.findall(r'“(.+?)”', s)
                if not qs:
                    continue
                if mt and not pos:
                    pos = (int(mt.group(1)), int(mt.group(2)))
                mudo = 'só na tela' in s or tipo.startswith('post') or not cor
                (fecho if fecho else itens).append(['cita', cor.group(1) if cor else None, tipo, qs[0], {'mudo': mudo, 'mt': list(map(int, mt.groups())) if mt else None}])
            elif s.startswith('- **SELO**'):
                selos += [x for x in re.findall(r'"([^"]+)"', s)][:2]
            elif s.startswith('- **MEME**'):
                memes += [mod.TROCA_MEME.get(x, x) for x in re.findall(r'`([a-z0-9-]+)`', s)][:1]
            elif s.startswith('- **SOM**'):
                sons += re.findall(r'`([a-z0-9-]+)`', s)[:2]
        clima = []
        for i, x in enumerate(selos):
            clima.append(['selo', x])
            if i == 0 and memes:
                clima.append(['meme', memes[0]])
            if i < len(sons):
                clima.append(['s', sons[i], 0.5])
        cenas.append(dict(id=sid, itens=itens + clima + fecho, pos=pos))
    return cenas


def dados():
    """resumo da partida para as telas (ligações por tique, segredos, botões, votos, bombas, placar)"""
    mjs = []
    for m in LOG['minijogos']:
        tiq = [dict(tique=t['tique'], ligacoes=[{k: l.get(k) for k in ('de', 'mostrado', 'para', 'caiu', 'vivaVoz')} for l in t['ligacoes']],
                    poderes=[{k: p.get(k) for k in ('cor', 'poder', 'alvo', 'como')} for p in t['poderes']], bombas=t.get('bombas', [])) for t in m['tiques']]
        mjs.append(dict(n=m['n'], nome=m['nome'], evento=m['evento'], eventoTique=m['eventoTique'], tiques=tiq, ganhos=m['ganhos'], score=m['score'],
                        detalhe={k: v for k, v in m['detalhe'].items() if k in ('nomes', 'moedas', 'votos', 'impostor', 'comum', 'diferente', 'suspeitos', 'estado', 'manual', 'bomba')},
                        botoes=m.get('botoes'), duplas=m.get('duplas')))
    out = dict(jogadores=LOG['jogadores'], minijogos=mjs, placar=LOG['placarFinal'])
    (PUB / 'confianca' / 'partida.json').write_text(json.dumps(out, ensure_ascii=False))


def main():
    mod = carregar(); dados()
    cenas_sb = ler(mod)
    usados = Counter(it[1] for c in cenas_sb for it in c['itens'] if it[0] == 'meme')
    erros = [f'meme repetido {m}' for m, n in usados.items() if n > 1] + [f'meme ruim {m}' for m in usados if m not in B.MEMES or m in B.MEMES_RUINS]
    erros += [f'sem visual {c["id"]}' for c in cenas_sb if c['id'] not in mod.VIS]
    if erros:
        raise SystemExit('REPROVADO: ' + '; '.join(erros))
    cenas = []
    for c in cenas_sb:
        t, over, audio, fim_selo, ult = 0.0, [], [], 0.0, None
        sid = c['id']
        if sid in mod.CAPS:
            over.append(dict(tipo='capitulo', at=0, dur=round(2.6 * FPS), titulo=mod.CAPS[sid][0], regra=mod.CAPS[sid][1]))
            audio.append(dict(src=B.sfx('mouse-click'), at=6, vol=0.5)); t += 2.4
        elif cenas:
            audio.append(dict(src=B.sfx('whoosh'), at=0, vol=0.22))
        for it in c['itens']:
            k = it[0]; opc = it[-1] if isinstance(it[-1], dict) else {}
            if opc: it = it[:-1]
            if k not in ('s',):
                ult = k if k != 'meme' else ult
            if k == 'n':
                src, d = tts(it[1], B.NARRADOR); audio.append(dict(src=src, at=round(t * FPS), txt=it[1])); t += d + 0.15
            elif k == 'cita':
                cor, tipo, texto = it[1], it[2], it[3]
                if opc.get('mudo'):
                    d = min(5.0, max(2.4, len(texto) / 15))
                else:
                    voz = APRESENTADOR if tipo.startswith('poder') and not cor else B.VOZES.get(cor, APRESENTADOR)
                    src, d = tts(texto, voz, eco=tipo.startswith('pensamento')); audio.append(dict(src=src, at=round(t * FPS), txt=f'{cor or ""} ({tipo}): {texto}'))
                over.append(dict(tipo='cita', at=round(t * FPS), dur=round((d + 0.6) * FPS), cor=cor, tipoCita=tipo, texto=texto, mt=opc.get('mt')))
                t += d + 0.3
            elif k == 'selo':
                ds = min(3.0, max(2.5, 0.9 + 0.3 * len(it[1].split()))); ini = max(t, fim_selo); fim_selo = ini + ds
                over.append(dict(tipo='selo', at=round(ini * FPS), dur=round(ds * FPS), texto=it[1])); audio.append(dict(src=B.sfx('pop'), at=round(ini * FPS), vol=0.45))
            elif k == 'meme':
                m = B.MEMES[it[1]]; sel = [o for o in over if o['tipo'] == 'selo']
                over.append(dict(tipo='meme', at=sel[-1]['at'] if sel else round(t * FPS), dur=None, id=it[1], pos='right', info=dict(file=Path(m['file_gif']).name, width=m['width'], height=m['height'], duration=m['duration_sec'])))
            elif k == 's':
                try: audio.append(dict(src=B.sfx(it[1]), at=round(t * FPS), vol=it[2]))
                except SystemExit: pass
        sd = [o['dur'] for o in over if o['tipo'] == 'selo']
        for o in over:
            if o['tipo'] == 'meme': o['dur'] = max(sd) if sd else round(2.5 * FPS)
        n = max(round((t + 0.6) * FPS), 75, max((o['at'] + o['dur'] + 4 for o in over), default=0))
        vis = json.loads(json.dumps(mod.VIS[sid]))
        if vis.get('tipo') in ('mesa', 'telao') and c['pos']:
            vis.setdefault('mj', c['pos'][0]); vis.setdefault('tique', c['pos'][1])
        if vis.get('tipo') == 'telao':
            vis.setdefault('tique', 1)
        cenas.append(dict(id=sid, dur=n, visual=vis, over=over, audio=audio, **({'musica': mod.MUSICA[sid]} if sid in mod.MUSICA else {})))
    tot = sum(c['dur'] for c in cenas) / FPS
    if B.CONTAR:
        print(f'duração estimada {tot / 60:.1f} min; faltam {B.falta} caracteres')
        if '--provisorio' not in sys.argv: return
        for c in cenas: c['audio'] = [a for a in c['audio'] if (PUB / a['src']).exists()]
    (PUB / 'timeline_confianca.json').write_text(json.dumps(dict(cenas=cenas), ensure_ascii=False))
    print(f'total {tot / 60:.2f} min ({sum(c["dur"] for c in cenas)} quadros), {len(cenas)} cenas, {len(usados)} memes; gastos {B.gasto}')


if __name__ == '__main__':
    main()
