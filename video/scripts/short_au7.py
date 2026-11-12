#!/usr/bin/env python3
"""Short do AMONG IA 7 (vertical): "A IA que falou a verdade levou 17 votos" (partida 4, tiques 18 a 49).
Roteiro novo (não é corte do vídeo longo), com fatos e falas copiados do log (conferidos pelo au7_conferir).
Gera public/timeline_short_au7.json + vozes. Uso (de video/remotion): python3 ../scripts/short_au7.py"""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au7 as B  # noqa: E402
import au7_conferir  # noqa: E402

FPS = 30
ROXO, VERDE, VERM = '#7a2fd0', '#1f9d3a', '#d81818'


def ev(n):
    return ['ir', n - 0.98]


CENAS = [
    dict(t0=15.5, cam={'sala': 'Refeitorio', 'zoom': 1.5}, itens=[
        ['n', 'Vinte IAs numa nave. Quatro são impostoras.'],
        ev(17), ['n', 'Um teleporte joga todo mundo no Refeitório...'],
        ev(18), ['s', 'duto', 0.7],
        ['n', 'e o Cinza, impostor, foge por um duto. Na frente do Roxo.'],
        ['selo', 'O ROXO VIU TUDO', ROXO],
    ]),
    dict(t0=17.97, vel=0.0, cam={'sala': 'Refeitorio', 'zoom': 1.7}, itens=[
        ['n', 'O Roxo aperta o botão e entrega o impostor.'],
        ['fala', 'Roxo', 'Vi o Cinza usar duto AQUI no t18, na minha frente.'],
        ['fala', 'Branco', 'Confirmo: vi Cinza entrar no duto no Refeitório.'],
        ['n', 'Duas testemunhas. Tudo verdade. E a nave votou...'],
        *[['acao', i] for i in range(1, 18)],
        ['numero', '17 VOTOS · NO ROXO', 'expulso por falar a verdade'],
        ['s', 'record-scratch', 0.5],
        ['p', 0.6],
    ]),
    dict(t0=18.6, cam={'cor': 'Branco', 'zoom': 1.9}, itens=[
        ['n', 'Dois tiques depois, o Xerife Branco, que votou no Roxo, dá de cara com o Cinza.'],
        ['pensa', 'Branco', 'Vi Cinza entrar num duto, então tenho certeza de que é impostor e vou atirar.'],
        ev(20), ['s', 'tiro', 0.8],
        ['selo', 'IMPOSTOR. O ROXO ESTAVA CERTO', VERDE],
    ]),
    dict(t0=20.2, cam={'sala': 'Refeitorio', 'zoom': 1.35}, itens=[
        ev(21), ['s', 'transformar', 0.7],
        ['n', 'Só que o Cinza era o Possuidor. Voltou no corpo da Turquesa...'],
        ['ir', 47.9], ev(49), ['s', 'tiro', 0.8],
        ['n', 'e levou outro tiro do mesmo Xerife.'],
        ['selo', 'MATOU O MESMO IMPOSTOR 2 VEZES', VERM],
        ['p', 0.4],
        ['n', 'Dezessete votos no único que falou a verdade. Você teria acreditado no Roxo?'],
        ['p', 0.8],
    ]),
]


def main():
    erros = [it for c in CENAS for it in c['itens'] if it[0] in ('fala', 'pensa') and not au7_conferir.achar(4, it[1], it[2])]
    if erros:
        raise SystemExit(f'fala que não está no log: {erros}')
    segs, over, audio, t = [], [], [], 0.0
    audio.append(dict(src='music/sneaky-snitch.mp3', at=0, vol=0.13))
    for c in CENAS:
        ini, tk = t, []
        for it in c['itens']:
            k = it[0]
            if k == 'ir':
                tk.append([round((t - ini) * FPS), float(it[1])])
            elif k == 'n':
                src, d = B.tts(it[1], B.NARRADOR)
                if src: audio.append(dict(src=src, at=round(t * FPS)))
                over.append(dict(tipo='legenda', at=round(t * FPS), dur=round(d * FPS), texto=it[1]))
                t += d + 0.1
            elif k in ('fala', 'pensa'):
                src, d = B.tts(it[2], B.VOZES[it[1]], eco=(k == 'pensa'))
                if src: audio.append(dict(src=src, at=round(t * FPS)))
                over.append(dict(tipo='fala', at=round(t * FPS), dur=round((d + 0.3) * FPS), cor=it[1], texto=it[2]))
                t += d + 0.2
            elif k == 'selo':
                ds = min(2.6, max(1.6, 0.8 + 0.3 * len(it[1].split())))
                over.append(dict(tipo='selo', at=round(t * FPS), dur=round(ds * FPS), texto=it[1], cor=it[2] if len(it) > 2 else '#e8701a'))
                audio.append(dict(src='sfx/pop.mp3', at=round(t * FPS), vol=0.5))
            elif k == 'acao':  # um voto por vez no contador
                over.append(dict(tipo='acao', at=round(t * FPS), dur=1, n=it[1]))
                audio.append(dict(src=B.sfx('voto'), at=round(t * FPS), vol=0.35))
                t += 0.09
            elif k == 'numero':
                over.append(dict(tipo='numero', at=round(t * FPS), dur=round(2.8 * FPS), texto=it[1], sub=it[2] if len(it) > 2 else None))
                audio.append(dict(src='sfx/impact-epic.mp3', at=round(t * FPS), vol=0.45))
            elif k == 's':
                audio.append(dict(src=B.sfx(it[1]), at=round(t * FPS), vol=it[2] if len(it) > 2 else 0.5))
            elif k == 'p':
                t += float(it[1])
        fim_over = max((o['at'] + o['dur'] for o in over if o['tipo'] in ('selo', 'numero')), default=0) / FPS
        t = max(t + 0.15, fim_over)
        segs.append(dict(de=round(ini * FPS), dur=round((t - ini) * FPS), t0=c['t0'], vel=c.get('vel', 0.12) / FPS, cam=c['cam'], tk=tk))
    out = dict(partida=4, segs=segs, over=over, audio=audio, dur=round((t + 0.3) * FPS))
    (B.PUB / 'timeline_short_au7.json').write_text(json.dumps(out, ensure_ascii=False))
    print(f'Short AU7: {out["dur"] / FPS:.1f} s, {len(segs)} cenas; caracteres de voz gastos agora: {B.gasto}')


if __name__ == '__main__':
    main()
