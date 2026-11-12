#!/usr/bin/env python3
"""Troca falas do narrador SEM re-render: gera a voz nova e encaixa no lugar da antiga, no mesmo instante e sem passar
da duração antiga (acelera de leve se precisar). A timeline (e o vídeo mudo) não mudam; depois é só refazer a faixa de áudio.
Uso (de video/remotion): python3 ../scripts/pk_troca_falas.py"""
import json, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_pokemon as P  # noqa: E402
B = P.B
TROCAS = [
    ('Ele não prometeu nada. Aí o Felipe foi lá e perguntou.', 'Ele não prometeu nada. Aí eu fui lá e perguntei.'),
    ('Com três quartos da partida, e nenhum sinal de mudança, o Felipe encerrou. Olha o placar do Roteirista. No diário: Squirtle, onze mapas, insígnia. Na partida: quatro mapas e zero Pokémon. Nem visto de longe. Ele pediu pra começar o jogo. O jogo dele nunca começou.',
     'Com três quartos da partida, e nenhum sinal de mudança, eu encerrei. Olha o placar do Roteirista. No diário: Squirtle, onze mapas, insígnia. Na partida: quatro mapas e zero Pokémon. Nem visto de longe. Ele pediu pra começar o jogo. O jogo dele nunca começou.'),
    ('Depois da partida, o Felipe mandou o resultado pras três e perguntou: o que aconteceu com a sua IA? O Gemini abriu o próprio código e fez a autópsia.',
     'Depois da partida, eu mandei o resultado pras três e perguntei: o que aconteceu com a sua IA? O Gemini abriu o próprio código e fez a autópsia.'),
]
PUB = P.PUB
tl = json.loads((PUB / 'timeline_pokemon.json').read_text())
for velho, novo in TROCAS:
    sv, dv = P.tts(velho, B.NARRADOR)
    sn, dn = P.tts(novo, B.NARRADOR)
    final = sn
    if dn > dv:  # acelera só o necessário pra caber no tempo da fala antiga
        final = sn.replace('.mp3', '_cabe.mp3')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(PUB / sn), '-af', f'atempo={dn / dv:.4f}', str(PUB / final)], check=True)
    n = 0
    for c in tl['cenas']:
        for a in c['audio']:
            if a['src'] == sv:
                a['src'] = final; n += 1
    print(f'{n} troca(s): {dv:.2f}s -> {dn:.2f}s', final)
(PUB / 'timeline_pokemon.json').write_text(json.dumps(tl, ensure_ascii=False))
