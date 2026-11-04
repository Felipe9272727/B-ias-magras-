#!/usr/bin/env python3
"""Short do AGE DAS IAs: "a IA que pagou proteção pra todo mundo" — o Qwen. Molde dos Shorts do canal (gancho com
superlativo que volta no fim, um personagem só, contador, selos, legenda grande). Falas das IAs = as do vídeo longo
(mesmas vozes, timeline_age.json), copiadas do log; o narrador só conta o que a partida mostrou.
Gera public/short_age/<bloco>_<n>.mp3, recortes do vídeo longo (v_<bloco>.mp4) e short_age.json (composição ShortAge).
Uso (de video/scripts): python3 short_age.py ../remotion/out/age_bruto.mkv"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_age as b  # noqa: E402  (tts e vozes)

PUB = b.PUB
OUT = PUB / 'short_age'
OUT.mkdir(parents=True, exist_ok=True)
FPS = 30
VIDEO = sys.argv[1] if len(sys.argv) > 1 else str(PUB.parent / 'out' / 'age_bruto.mkv')
tl = json.loads((PUB / 'timeline_age.json').read_text())
ini = {}
t = 0
voz = {}  # texto -> (src, j)
for c in tl['cenas']:
    ini[c['id']] = t / FPS
    for o in c['over']:
        if o['tipo'] in ('fala', 'pensa'):
            a = next((x for x in c['audio'] if x['at'] == o['at']), None)
            if a:
                voz[o['texto']] = (a['src'], o['j'], o['tipo'])
    t += c['dur']

# (id, partes, cena do vídeo longo + segundos dentro dela, selo, contador)
BLOCOS = [
    ('gancho', [('n', 'Essa IA pagou proteção pra três impérios. Adivinha quem caiu primeiro.')], ('c01', 3), None, 0),
    ('pede', [('n', 'No primeiro turno, o Qwen, cercado, pede aliança pro GPT.'), ('ia', 'Que tal fazermos uma aliança mútua?')], ('c06', 2), None, 0),
    ('paga1', [('ia', 'Cercado por Claude e GLM. GPT é meu escudo — envio pedra e metal como pedido')], ('c06', 9), 'PAGOU O GPT', 1),
    ('paga2', [('n', 'Depois paga também o MiMo, por paz na fronteira sul.'), ('ia', 'Aceito: 100 de metal como tributo neste turno. Em troca, paz real — sem pressão na minha fronteira sul.')], ('c08', 1), 'PAGOU O MIMO', 2),
    ('escudo', [('n', 'O escudo romano vai lutar por ele... e perde o exército inteiro.')], ('c10', 6), '18 SOLDADOS → 0', 2),
    ('troco', [('n', 'E o MiMo, que recebeu o metal, vem cobrar o troco.'), ('ia', 'Qwen, aquele metal que me mandou era ótimo — pena que sul e leste estão ficando apertados pra Gália, né?')], ('c01', 8), 'PAGOU E APANHOU', 2),
    ('claude', [('n', 'Último pedido, pro Claude.'), ('ia', 'Não me abandona aqui, Parceiro.'), ('ia', 'Qwen é útil como escudo contra DeepSeek e GLM, então envio metal barato para mantê-lo de pé sem me expor.')], ('c20', 3), 'PARCEIRO X ESCUDO', 3),
    ('fim', [('n', 'Gália derrotada. Ele pagou três escudos... e caiu primeiro.')], ('c21', 5), 'DERROTADO', 3),
]


def main():
    blocos = []
    for bid, partes, (cena, dentro), selo, cont in BLOCOS:
        tt, auds, fal = 0.0, [], []
        for k, p in enumerate(partes):
            if p[0] == 'n':
                src, d = b.tts(p[1], b.NARRADOR)
                auds.append(dict(src=src, at=round(tt * FPS)))
                fal.append(dict(texto=p[1], at=round(tt * FPS), dur=round(d * FPS)))
            else:
                src, j, tipo = voz[p[1]]
                d = b.dur(PUB / src)
                auds.append(dict(src=src, at=round(tt * FPS)))
                fal.append(dict(texto=p[1], at=round(tt * FPS), dur=round(d * FPS), j=j, pensa=tipo == 'pensa'))
            tt += d + 0.15
        dur = int(round((tt + 0.3) * FPS))
        v = OUT / f'v_{bid}.mp4'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{ini[cena] + dentro:.2f}', '-t', f'{dur / FPS + 0.5:.2f}', '-i', VIDEO, '-an', '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-g', '15', str(v)], check=True)
        blocos.append(dict(id=bid, dur=dur, audios=auds, falas=fal, selo=selo, contador=cont))
        print(f'{bid:8s} {tt:5.2f}s')
    (OUT / 'short_age.json').write_text(json.dumps(dict(ias=tl['ias'], blocos=blocos), ensure_ascii=False))
    print('total', sum(x['dur'] for x in blocos) / FPS, 's; caracteres gastos', b.gasto)


if __name__ == '__main__':
    main()
