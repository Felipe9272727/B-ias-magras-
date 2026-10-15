#!/usr/bin/env python3
"""Short 2 do Overcooked das IAs: "essa IA entregou um PÃO como prato" (o Claude), no molde do short_oc.py.

Fatos conferidos nos logs (overcooked/logs, cozinha 1 = Claude): fase 1, t19-t37, o Claudinho escolheu "esperar" em
18 de 19 tiques, segurando um prato (pensamento do t19: "vou esperar a panela ficar pronta e servir com ele");
fase 3, t78, a Claudete fala "eu seguro o prato e corro pra alface" e a ação é "esperar"; o Claude esperou 110
vezes nas três fases; fase 3, t89 (último tique), a Claudete entrega um prato só com pão: recusado, e o pensamento
foi "entregar o pão pelo menos libera minhas mãos".

Gera remotion/public/short_oc2/<bloco>_<n>.mp3 e short_oc2.json (mesmo formato do short_oc.json).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_oc as oc  # noqa: E402  (pronúncias e vozes do Overcooked)
import build_timeline_au2 as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_oc2'
VOZ_OC = ROOT / 'remotion' / 'public' / 'voice_oc'
FPS = 30

# bloco: [('n', texto) | ('c', arquivo do voice_oc, palavra de início, nome do chef)], folga no fim (s)
BLOCOS = [
    ('gancho', [('n', 'Essa IA entregou um pão. Só um pão. Como prato.')], 0.15),
    ('quem', [('n', 'É o Claude, jogando Overcooked em dupla... com outro Claude. O chef mais educado da cozinha.')], 0.15),
    ('espera', [('n', 'Na primeira fase, ele pega um prato pra servir a sopa...'),
                ('c', 'f105_1', 'Fico', 'Claudinho', 'sopa.'),
                ('n', 'E fica esperando. Dezoito de dezenove rodadas parado. Quase quarenta segundos segurando um prato vazio.')], 0.2),
    ('promessa', [('n', 'Na última fase, a parceira promete:'),
                  ('c', 'f309_1', 'Eu', 'Claudete', 'alface.'),
                  ('n', 'E a ação que ela escolheu foi... esperar. O Claude esperou cento e dez vezes no jogo inteiro.')], 0.2),
    ('fim', [('n', 'Último segundo. Ela tem um prato... só com pão.'),
             ('c', 'f310_1', None, 'Claudete', None),
             ('n', 'Recusado. E no pensamento secreto: entregar o pão pelo menos libera minhas mãos. Um pão. Como prato.')], 0.6),
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
                auds.append(dict(src=f'short_oc2/{bid}_{k}.mp3', at=round(t * FPS), de=0))
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
                auds.append(dict(src=f'voice_oc/{arq}.mp3', at=round(t * FPS), de=round(corte * FPS), ate=round(dur * FPS), chef=chef))
                palavras += [dict(w=w['word'], s=round((t + w['start'] - corte) * FPS), e=round((t + w['end'] - corte) * FPS), chef=chef)
                             for w in ws if w['start'] >= corte and w['end'] <= fim_s + 0.01]
                t += dur + 0.2
        blocos.append(dict(id=bid, dur=int(round((t + folga) * FPS)), audios=auds, palavras=palavras))
        print(f'{bid:8s} {t:5.2f}s')
    (OUT / 'short_oc2.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print('total', sum(x['dur'] for x in blocos) / FPS, 's')


if __name__ == '__main__':
    main()
