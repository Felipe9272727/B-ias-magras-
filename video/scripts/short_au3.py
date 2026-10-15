#!/usr/bin/env python3
"""Short do Among Us 3: "essa IA QUERIA ser expulsa" — o Roxo (Gemini), Palhaço da partida 2.

Fatos conferidos em amongus/logs3/partida2.json: t15 o Roxo aperta o botão de emergência pensando "se eu apertar
de forma desesperada acusando o Vermelho, eles vão me expulsar com certeza"; reunião 2: 9 pulos, só Azul e Preto
votam nele; t17-t21 ele finge tarefa na Enfermaria (o scan não liga), pensamento do t17: "fingir tarefa colado em
Preto e Ciano para parecer que estou agindo estranho"; t20 o Xerife (Preto) atira nele e quem morre é o Xerife;
reunião 3 (t21): a Rosa acusa o "fake scan", o Roxo dá chilique acusando a Rosa, e é expulso com 10 votos (todos
os vivos menos ele): o Palhaço vence sozinho.

Gera remotion/public/short_au3/<bloco>_<n>.mp3 e short_au3.json (mesmo formato do short_oc2.json, falas de
voice_au3).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au3 as b  # noqa: E402  (narrador e pronúncias do Among Us 3)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_au3'
VOZ_OC = ROOT / 'remotion' / 'public' / 'voice_au3'
FPS = 30

# bloco: [('n', texto) | ('c', arquivo do voice_oc, palavra de início, nome do chef)], folga no fim (s)
BLOCOS = [
    ('gancho', [('n', 'Essa IA queria ser expulsa. E fez de tudo pra conseguir.')], 0.15),
    ('regra', [('n', 'É o Gemini, no Among Us, de Palhaço: se for expulso, ganha sozinho.')], 0.15),
    ('botao', [('n', 'Primeiro, ele aperta o botão de emergência e acusa o Vermelho do nada:'),
               ('c', 'p216_0', None, 'Roxo', None),
               ('n', 'Não colou. Nove pularam.')], 0.2),
    ('scan', [('n', 'Então ele finge o scan na Enfermaria. Quatro vezes. E o scan nunca liga.')], 0.2),
    ('xerife', [('n', 'O Xerife cai na armadilha... e atira. Só que o Palhaço não é impostor. E quando o Xerife erra, quem morre é o Xerife.')], 0.3),
    ('fim', [('n', 'Na reunião, a acusação vem sozinha:'),
             ('c', 'p221_1', 'VI', 'Rosa', None),
             ('n', 'E ele ainda dá um chilique:'),
             ('c', 'p221_7', None, 'Roxo', 'Rosa,'),
             ('n', 'Dez votos. Expulso. E o Palhaço ganha sozinho. Essa IA queria ser expulsa... e conseguiu.')], 0.45),
]
DESFAZ = {v: k for k, v in b.bt.PRONUNCIA.items()}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    blocos = []
    for bid, partes, folga in BLOCOS:
        t, auds, palavras = 0.0, [], []
        for k, p in enumerate(partes):
            if p[0] == 'n':
                texto = p[1]
                falado = ' '.join(b.bt.spoken(x) for x in texto.split())
                words, dur = b.tts(falado, b.NARRADOR, OUT / f'{bid}_{k}')
                escritas = texto.split()
                for w, e in zip(words, escritas) if len(escritas) == len(words) else ((w, DESFAZ.get(w['word'], w['word'])) for w in words):
                    w['word'] = e
                auds.append(dict(src=f'short_au3/{bid}_{k}.mp3', at=round(t * FPS), de=0))
                palavras += [dict(w=w['word'], s=round((t + w['start']) * FPS), e=round((t + w['end']) * FPS)) for w in words]
                t += dur + 0.15
            else:
                _, arq, ini, chef = p[:4]
                fimp = p[4] if len(p) > 4 else None
                d = json.loads((VOZ_OC / f'{arq}.words.json').read_text())
                ws = [w for w in d['words'] if not w['word'].startswith('[')]
                corte = 0.0
                if ini:
                    # última ocorrência da palavra de início (o pedaço final da fala)
                    corte = max(w['start'] for w in ws if w['word'].rstrip(',!.') == ini) - 0.05
                fim_s = d['dur']
                if fimp:
                    fim_s = min(w['end'] for w in ws if w['start'] >= corte and w['word'] == fimp) + 0.12
                dur = fim_s - corte
                auds.append(dict(src=f'voice_au3/{arq}.mp3', at=round(t * FPS), de=round(corte * FPS), ate=round(dur * FPS), chef=chef))
                palavras += [dict(w=w['word'], s=round((t + w['start'] - corte) * FPS), e=round((t + w['end'] - corte) * FPS), chef=chef)
                             for w in ws if w['start'] >= corte and w['end'] <= fim_s + 0.01]
                t += dur + 0.2
        blocos.append(dict(id=bid, dur=int(round((t + folga) * FPS)), audios=auds, palavras=palavras))
        print(f'{bid:8s} {t:5.2f}s')
    (OUT / 'short_au3.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print('total', sum(x['dur'] for x in blocos) / FPS, 's')


if __name__ == '__main__':
    main()
