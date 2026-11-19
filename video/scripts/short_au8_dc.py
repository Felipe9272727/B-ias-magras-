#!/usr/bin/env python3
"""Short Director Cut — Among IA 8 (O Disfarce Perfeito do Marrom + Defesa "...").
Reaproveita 100% das vozes reais do log já em public/au8/voz/ e gera apenas
5 falas curtas de narração com timestamps palavra-a-palavra no ElevenLabs.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au8 as au8  # noqa: E402
import build_timeline_int as bi  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_au8_dc'
FPS = 30

# Cenas do Short vertical (todas da partida 4)
# tipo: 'mapa_segredo' | 'mapa_revela' | 'reuniao' | 'silencio' | 'ejecao' | 'duelo'
CENAS = [
    dict(id='hook', tipo='mapa_segredo', t0=28.6, vel=0.26, cam={'cor': 'Marrom', 'zoom': 1.55}, foco='Marrom,Vermelho', itens=[
        ('n', 'Essa IA atacou na frente da vítima com a cara do Detetive. Na hora de se defender... olha o que ela falou.'),
        ('s', 'sfx_au2/escudo.mp3', 0.75, 1.3),
    ], folga=0.12),
    dict(id='disfarce', tipo='mapa_revela', t0=16.0, vel=0.32, cam={'sala': 'Refeitorio', 'zoom': 1.48}, foco='Marrom,Vermelho', itens=[
        ('n', 'O Marrom vestiu a cara do Roxo e pulou no Vermelho. O escudo do Anjo salvou — e o Vermelho jurou:'),
        ('s', 'sfx_au2/duto.mp3', 0.55, 0.3),
        ('fala', 'Vermelho', 'Roxo tentou me matar no Refeitório; o escudo me salvou. Ele é impostor, votem nele — não no Marrom.'),
    ], folga=0.12),
    dict(id='defesa', tipo='reuniao', t0=30.0, vel=0.05, cam={'cor': 'Roxo', 'zoom': 1.6}, foco='Roxo,Marrom', itens=[
        ('fala', 'Roxo', 'Vermelho, eu nunca te ataquei; tava em Admin consertando O2 com o Ciano.'),
        ('n', 'O Detetive tava certo. E qual foi a defesa do Marrom?'),
    ], folga=0.08),
    dict(id='silencio', tipo='silencio', t0=30.0, vel=0.02, cam={'cor': 'Marrom', 'zoom': 1.8}, foco='Marrom', itens=[
        ('fala', 'Marrom', '...'),
        ('p', 1.35),
    ], folga=0.10),
    dict(id='ejecao', tipo='ejecao', t0=31.0, vel=0.05, cam={'cor': 'Roxo', 'zoom': 1.5}, foco='Roxo', itens=[
        ('n', 'Quatro a três. O Detetive foi ejetado sem revelar a função.'),
        ('pensa', 'Marrom', 'O ataque que Vermelho viu foi o meu disfarce de Roxo.'),
    ], folga=0.12),
    dict(id='duelo', tipo='duelo', t0=31.0, vel=0.02, cam={'cor': 'Marrom', 'zoom': 1.5}, foco='Roxo,Marrom', itens=[
        ('n', 'Os impostores venceram. Na cadeira do Vermelho, em quem você votava? Comenta aí!'),
    ], folga=0.70),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    blocos = []
    for ci, c in enumerate(CENAS):
        t, auds, palavras, falas = 0.0, [], [], []
        for k, it in enumerate(c['itens']):
            kind = it[0]
            if kind == 'n':
                texto = it[1]
                falado = au8.falado(texto)
                words, dur = bi.tts(falado, bi.NARRADOR, OUT / f"{c['id']}_{k}")
                escritas = texto.split()
                if len(escritas) == len(words):
                    for w, e in zip(words, escritas):
                        w['word'] = e
                auds.append(dict(src=f"short_au8_dc/{c['id']}_{k}.mp3", at=round(t * FPS), de=0))
                palavras += [dict(w=w['word'], s=round((t + w['start']) * FPS), e=round((t + w['end']) * FPS)) for w in words]
                t += dur + 0.12
            elif kind in ('fala', 'pensa'):
                cor, texto = it[1], it[2]
                src, dur = au8.tts(texto, au8.VOZES[cor], eco=(kind == 'pensa'))
                at_f = round(t * FPS)
                dur_f = round((dur + 0.25) * FPS)
                auds.append(dict(src=src, at=at_f, de=0))
                falas.append(dict(tipo=kind, cor=cor, texto=texto, at=at_f, dur=dur_f))
                t += dur + 0.18
            elif kind == 's':
                _, ssrc, vol, offset = it
                auds.append(dict(src=ssrc, at=round(offset * FPS), de=0, vol=vol))
            elif kind == 'p':
                t += float(it[1])
        dur_tot = int(round((t + c['folga']) * FPS))
        blocos.append(dict(
            id=c['id'], tipo=c['tipo'], dur=dur_tot, t0=c['t0'], vel=c['vel'] / FPS,
            cam=c['cam'], foco=c['foco'], audios=auds, palavras=palavras, falas=falas,
        ))
        print(f"[ShortAU8DC] {c['id']:10s} {dur_tot/FPS:5.2f}s")
    total_f = sum(b['dur'] for b in blocos)
    (OUT / 'short_au8_dc.json').write_text(json.dumps({'partida': 4, 'blocos': blocos, 'dur': total_f}, ensure_ascii=False))
    print(f'ShortAU8DC pronto: {total_f/FPS:.1f}s ({total_f} quadros) | gasto extra au8={au8.gasto}')


if __name__ == '__main__':
    main()
