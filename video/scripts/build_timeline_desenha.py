#!/usr/bin/env python3
"""DESENHA E ADIVINHA ("Coloquei 10 IAs pra jogar Gartic"): storyboard do Fable -> public/timeline_desenha.json + vozes
(public/desenha/voz) + dados da partida para as telas (public/desenha/partida.json, com os traços de cada tique).
Narrador = Felipe (1ª pessoa); cada cor tem a voz fixa do canal; pensamento com ECO; toda fala de IA em balão tem voz.
A narração do storyboard vem entremeada: "texto" (Giz) "texto" (plano) "texto"... Cada marcador puxa as citações da
cena: pelo nome do personagem (todas as dele em sequência) ou, se genérico (plano, reação, citações...), a próxima.
Uso (de video/remotion): python3 ../scripts/build_timeline_desenha.py [--contar] [--provisorio]"""
import json, re, sys
from collections import Counter
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au7 as B  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'remotion' / 'public'
VOZ = PUB / 'desenha' / 'voz'; VOZ.mkdir(parents=True, exist_ok=True)
B.VOZ = VOZ
FPS = 30
LOG = json.loads((ROOT.parent / 'desenha' / 'logs' / 'partida1.json').read_text())
NOMES = {'Rabisco': 'Vermelho', 'Aquarela': 'Azul', 'Borrão': 'Amarelo', 'Giz': 'Rosa', 'Pincel': 'Roxo', 'Lápis': 'Verde',
         'Traço': 'Ciano', 'Tinta': 'Laranja', 'Carvão': 'Marrom', 'Grafite': 'Lima'}
CORES = '|'.join(NOMES.values())
B.PRON.update({'Gartic': 'Gártic', 'Haiku': 'Raicu', 'GLM': 'Gê Éle Ême', 'DeepSeek': 'Dípsíque'})
# trilha por cena (direcao_edicao.md, seção 8); 'silencio' = sem música no bloco
MUSICA = {'A1': 'decisions', 'A2': 'pixel-peeker-polka-faster', 'C1': 'heartbreaking', 'D1': 'ghost-story', 'D4': 'comedic-juggernaut',
          'D7': 'call-to-adventure', 'E1': 'local-forecast-elevator', 'F1': 'quirky-dog', 'G1': 'monkeys-spinning-monkeys', 'H1': 'run-amok',
          'H2': 'chill-wave', 'I1': 'sneaky-snitch', 'J1': 'fluffing-a-duck', 'J4': 'thinking-music', 'J5': 'chipper-doodle-v2',
          'J6': 'silencio', 'K1': 'mega-hyper-ultrastorm', 'L1': 'winner-winner', 'L3': 'heroic-age'}


def tts(texto, voz, eco=False):
    src, d = B.tts(texto.replace('*****', '...'), voz, eco=eco)
    return (src.replace('au7/voz/', 'desenha/voz/') if src else None), d


def ler():
    txt = (ROOT / 'youtube' / 'desenha' / 'storyboard.md').read_text().split('## Memes usados')[0]
    caps, cenas, cap_atual = {}, [], None
    for parte in re.split(r'\n(?=# |## )', txt):
        h = parte.split('\n', 1)[0]
        if h.startswith('# ') and not h.startswith('# STORYBOARD'):
            m = re.match(r'# (.+?)(?: — (.+))?$', h)
            cap_atual = (m.group(1).strip(), (m.group(2) or '').strip().strip('"'))
            continue
        mm = re.match(r'## ([A-Z]\d+)\s+—\s+(.+?)\s+·', h)
        if not mm:
            continue
        sid = mm.group(1)
        if cap_atual and cap_atual[0] not in ('ABERTURA',):
            caps[sid] = cap_atual
        cap_atual = None
        tela, nar, citas, selos, memes, sons = '', None, [], [], [], []
        for ln in parte.split('\n')[1:]:
            s = ln.strip()
            if s.startswith('- **TELA**'):
                tela = s.split(':', 1)[1].strip()
            elif s.startswith('- **NARRAÇÃO'):
                nar = s.split(':', 1)[1].strip()
            elif re.match(r'- \*\*(\w+)\*\* `\[', s) and '“' in s:
                cor = re.search(rf'\*\*({CORES})\*\*', s)
                tipo = (re.search(r'`\[([^\]]+)\]`', s) or [None, ''])[1]
                mt = re.search(r'\(desenho (\d+), tique (\d+)\)', s)
                q = re.search(r'“(.+?)”', s)
                pal = re.search(r'→ palpite: ([^\s(]+)', s)
                citas.append(dict(cor=cor.group(1) if cor else None, tipo=tipo, texto=q.group(1), dt=[int(mt.group(1)), int(mt.group(2))] if mt else None,
                                  palpite=pal.group(1) if pal else None))
            elif s.startswith('- **SELO**'):
                selos += re.findall(r'"([^"]+)"', s)[:2]
            elif s.startswith('- **MEME**'):
                memes += re.findall(r'`([a-z0-9-]+)`', s)[:1]
            elif s.startswith('- **SOM**'):
                sons += re.findall(r'`([a-z0-9-]+)`', s)[:2]
        # narração entremeada: segmentos "..." e marcadores (X)
        seq = []
        for m in re.finditer(r'"([^"]+)"|\(([^)]{1,40})\)', nar or ''):
            seq.append(['n', m.group(1)] if m.group(1) else ['marca', m.group(2)])
        resto = list(citas)
        itens = []
        for x in seq:
            if x[0] == 'n':
                itens.append(x)
                continue
            quem = [NOMES[n.strip().split(',')[0].strip()] if False else None for n in []]
            nomes = [NOMES[p.strip()] for p in re.split(r',| e ', x[1]) if p.strip() in NOMES]
            if nomes:
                pegou = [c for c in resto if c['cor'] in nomes]
            elif x[1].strip() == 'citações':
                pegou = list(resto)
            else:
                pegou = resto[:1]
            for c in pegou:
                resto.remove(c); itens.append(['cita', c])
        if resto:  # citações sem marcador: entram antes do último trecho de narração (ou no fim)
            pos = len(itens) - 1 if len(itens) > 1 and itens[-1][0] == 'n' and any(i[0] == 'marca' for i in seq) else len(itens)
            itens[pos:pos] = [['cita', c] for c in resto]
        cenas.append(dict(id=sid, titulo=mm.group(2), tela=tela, itens=itens, selos=selos, memes=memes, sons=sons,
                          dt=next((c['dt'] for c in citas if c['dt']), None)))
    return cenas, caps


def dados():
    """os 20 desenhos com os traços de cada tique, chutes, tempos, acertos e o placar depois de cada desenho"""
    nome = {j['cor']: j['nome'] for j in LOG['jogadores']}
    pl = {j['cor']: 0 for j in LOG['jogadores']}
    des = []
    for d in LOG['desenhos']:
        for a in d['acertos']:
            pl[a['cor']] += a['pontos']; pl[d['desenhista']] += 2
        for v in d['vazamentos']:
            pl[v['cor']] -= 2
        des.append(dict(n=d['n'], rodada=d['rodada'], palavra=d['palavra'], desenhista=d['desenhista'], acertos=d['acertos'],
                        tiques=[dict(tique=t['tique'], novos=t['novos'], dica=t['dica'], reacao=t['chatDesenhista'], total=t['totalTracos'],
                                     palpites=[{k: p.get(k) for k in ('cor', 'palpite', 'chat', 'ms', 'acertou', 'perto')} for p in t['palpites']]) for t in d['tiques']],
                        placarDepois=dict(pl)))
    out = dict(jogadores=[dict(cor=j['cor'], nome=j['nome'], modelo=j['modelo']) for j in LOG['jogadores']], desenhos=des, placarFinal=LOG['placar'])
    (PUB / 'desenha' / 'partida.json').write_text(json.dumps(out, ensure_ascii=False))


def main():
    dados()
    cenas_sb, caps = ler()
    usados = Counter(m for c in cenas_sb for m in c['memes'])
    erros = [f'meme repetido {m}' for m, n in usados.items() if n > 1] + [f'meme ruim {m}' for m in usados if m not in B.MEMES or m in B.MEMES_RUINS]
    if erros:
        raise SystemExit('REPROVADO: ' + '; '.join(erros))
    cenas = []
    for c in cenas_sb:
        t, over, audio, fim_selo = 0.0, [], [], 0.0
        sid = c['id']
        if sid in caps:
            over.append(dict(tipo='capitulo', at=0, dur=round(2.6 * FPS), titulo=caps[sid][0], sub=caps[sid][1]))
            audio.append(dict(src=B.sfx('mouse-click'), at=6, vol=0.5)); t += 2.4
        elif cenas:
            audio.append(dict(src=B.sfx('whoosh'), at=0, vol=0.22))
        for it in c['itens']:
            if it[0] == 'n':
                src, d = tts(it[1], B.NARRADOR); audio.append(dict(src=src, at=round(t * FPS), txt=it[1])); t += d + 0.15
            else:
                x = it[1]
                src, d = tts(x['texto'], B.VOZES.get(x['cor'], B.NARRADOR), eco=x['tipo'].startswith('pensamento'))
                audio.append(dict(src=src, at=round(t * FPS), txt=f"{x['cor']} ({x['tipo']}): {x['texto']}"))
                if '*****' in x['texto']:
                    audio.append(dict(src=B.sfx('censor-beep'), at=round((t + 0.3) * FPS), vol=0.35))
                over.append(dict(tipo='cita', at=round(t * FPS), dur=round((d + 0.6) * FPS), cor=x['cor'], tipoCita=x['tipo'], texto=x['texto'], dt=x['dt'], palpite=x['palpite']))
                t += d + 0.3
        for i, s in enumerate(c['selos']):
            ds = min(3.0, max(2.5, 0.9 + 0.3 * len(s.split()))); ini = max(t - 1.5 if i == 0 else t, fim_selo); fim_selo = ini + ds
            over.append(dict(tipo='selo', at=round(ini * FPS), dur=round(ds * FPS), texto=s)); audio.append(dict(src=B.sfx('pop'), at=round(ini * FPS), vol=0.45))
            if i == 0 and c['memes']:
                m = B.MEMES[c['memes'][0]]
                over.append(dict(tipo='meme', at=round(ini * FPS), dur=round(ds * FPS), id=c['memes'][0], pos='right', info=dict(file=Path(m['file_gif']).name, width=m['width'], height=m['height'], duration=m['duration_sec'])))
            if i < len(c['sons']):
                try: audio.append(dict(src=B.sfx(c['sons'][i]), at=round(ini * FPS), vol=0.5))
                except SystemExit: pass
        n = max(round((max(t, fim_selo) + 0.6) * FPS), 75, max((o['at'] + o['dur'] + 4 for o in over), default=0))
        vis = dict(tela=c['tela'], titulo=c['titulo'], **({'desenho': c['dt'][0], 'tique': c['dt'][1]} if c['dt'] else {}))
        cenas.append(dict(id=sid, dur=n, visual=vis, over=over, audio=audio, **({'musica': MUSICA[sid]} if sid in MUSICA else {})))
    tot = sum(c['dur'] for c in cenas) / FPS
    if B.CONTAR:
        print(f'duração estimada {tot / 60:.1f} min; faltam {B.falta} caracteres')
        if '--provisorio' not in sys.argv: return
        for c in cenas: c['audio'] = [a for a in c['audio'] if (PUB / a['src']).exists()]
    (PUB / 'timeline_desenha.json').write_text(json.dumps(dict(cenas=cenas), ensure_ascii=False))
    print(f'total {tot / 60:.2f} min ({sum(c["dur"] for c in cenas)} quadros), {len(cenas)} cenas, {len(usados)} memes; gastos {B.gasto}')


if __name__ == '__main__':
    main()
