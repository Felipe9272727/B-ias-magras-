#!/usr/bin/env python3
"""Short do POKÉMON (vertical): "Essa IA escreveu a vitória antes de jogar" (Gemini). Roteiro novo e curto, fatos do pacote/logs;
as telas são as do vídeo longo (VIS do roteiro_pokemon), dentro do quadro vertical. -> public/timeline_short_pokemon.json"""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_pokemon as P  # noqa: E402
B = P.B
FPS = 30
CENAS = [
    ('A1', [['n', 'Essa IA entregou o diário da vitória: primeiro ginásio vencido em três horas.'],
            ['selo', 'ESCRITO ANTES DE JOGAR'], ['s', 'record-scratch', 0.5],
            ['n', 'Só que, quando escreveu isso, o jogo nunca tinha sido ligado.']]),
    ('P1c', [['n', 'Na partida de verdade, ela levou dezessete horas só pra chegar no laboratório.'], ['selo', '17 h 23 min'], ['s', 'boom', 0.45]]),
    ('P1e', [['n', 'E aí travou. Apertando A contra a parede. Cento e doze mil vezes.'], ['selo', 'A x 112.027'], ['s', 'mouse-click', 0.5],
             ['n', 'Zero Pokémon. Zero insígnias.']]),
    ('V1', [['n', 'Eu perguntei o que deu errado. E ela mesma achou o erro no próprio código.'],
            ['cita', 'gemini', 'resposta', 'Eu caí numa armadilha que eu mesmo criei na matemática de exploração.'],
            ['selo', 'ERA O GEMINI']]),
    ('F2', [['n', 'E a IA mais simples das três foi a única que jogou os dois dias inteiros. Qual dessas você botaria pra jogar?']]),
]


def main():
    mod = P.carregar()
    clips = {f.stem: json.loads(f.read_text()) for f in (P.PUB / 'pokemon' / 'clips').glob('*.json')}
    cenas = []
    for sid, itens in CENAS:
        t, over, audio = 0.3, [], [dict(src=B.sfx('whoosh'), at=0, vol=0.3)]
        for it in itens:
            k = it[0]
            if k == 'n':
                src, d = P.tts(it[1], B.NARRADOR)
                audio.append(dict(src=src, at=round(t * FPS))); over.append(dict(tipo='legenda', at=round(t * FPS), dur=round(d * FPS), texto=it[1]))
                t += d + 0.12
            elif k == 'cita':
                src, d = P.tts(it[3], P.VOZ_IA[it[1]])
                audio.append(dict(src=src, at=round(t * FPS))); over.append(dict(tipo='cita', at=round(t * FPS), dur=round((d + 0.5) * FPS), ia=it[1], tag=it[2], texto=it[3]))
                t += d + 0.25
            elif k == 'selo':
                over.append(dict(tipo='selo', at=round(t * FPS), dur=round(2.2 * FPS), texto=it[1])); audio.append(dict(src=B.sfx('pop'), at=round(t * FPS), vol=0.45))
            elif k == 's':
                audio.append(dict(src=B.sfx(it[1]), at=round(t * FPS), vol=it[2]))
        n = max(round((t + 0.4) * FPS), max(o['at'] + o['dur'] + 3 for o in over))
        vis = json.loads(json.dumps(mod.VIS[sid]))
        def anexa(v):
            if v.get('tipo') == 'gba':
                v['n'] = len(clips.get(v['clip'], [1])); v['meta'] = clips.get(v['clip'], [])
            if v.get('tipo') == 'split':
                anexa(v['esq']); anexa(v['dir'])
        anexa(vis)
        cenas.append(dict(id=sid, dur=n, visual=vis, over=over, audio=audio))
    tot = sum(c['dur'] for c in cenas)
    (P.PUB / 'timeline_short_pokemon.json').write_text(json.dumps(dict(cenas=cenas, musica='music/hitman.mp3'), ensure_ascii=False))
    print(f'Short Pokémon: {tot / FPS:.1f} s; caracteres gastos: {B.gasto}')


if __name__ == '__main__':
    main()
