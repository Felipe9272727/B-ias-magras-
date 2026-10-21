#!/usr/bin/env python3
"""Short do Among Us 4: "essa IA QUIS ser expulsa" — o Bordô (DeepSeek), Possuidor da partida bônus (log 5).
Mesmo molde do short_au3.py (composição ShortPossuidor, cópia do ShortPalhaco).

Fatos conferidos em amongus/logs4/partida5.json: t53 o Bordô escreve no chat dos impostores "Coral, vou matar Lima na
frente de Preto/Roxo pra me expulsarem. Se eu morrer/for expulso, revivo como Possuidor em algum corpo morto" e mata a
Lima no Reator; reunião 2 (t54): ele fala do Laranja ("jura que viu tudo") e é expulso com 10 votos; t55 possessão:
revive no corpo do Cinza (que morreu no t5, junto com o par Vermelho, no Casal); chat t55: "Sou eu, Bordo, voltei no
corpo do Cinza"; reunião 4 (t68): "Não morri nada, gente", 6 votos no Cinza, expulso; impostores eliminados.

Gera remotion/public/short_au4/<bloco>_<n>.mp3 e short_au4.json (falas cortadas de voice_au4).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au4 as b  # noqa: E402  (narrador e pronúncias do Among Us 4)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_au4'
VOZ_OC = ROOT / 'remotion' / 'public' / 'voice_au4'
FPS = 30

# bloco: [('n', texto) | ('c', arquivo do voice_oc, palavra de início, nome do chef)], folga no fim (s)
BLOCOS = [
    ('gancho', [('n', 'Essa IA quis ser expulsa. Pra voltar... no corpo de um morto.')], 0.15),
    ('regra', [('n', 'É o DeepSeek, no Among Us, de Possuidor: se ele morrer, o espírito dele revive no corpo de um tripulante morto.')], 0.15),
    ('plano', [('n', 'Então ele escreve no chat dos impostores: vou matar o Lima na frente do Preto e do Roxo, pra me expulsarem.'),
               ('n', 'E mata. Na frente das testemunhas.')], 0.25),
    ('expulso', [('n', 'Na reunião, ele ainda faz teatro:'),
                 ('c', 'p510_2', None, 'Bordo', 'tudo'),
                 ('n', 'Dez votos. Expulso... exatamente como ele planejou.')], 0.3),
    ('volta', [('n', 'E aí, o Cinza, que tinha morrido no tique cinco... levanta.'),
               ('n', 'No chat: sou eu, Bordô, voltei no corpo do Cinza.')], 0.3),
    ('fim', [('n', 'Só que a nave inteira tinha visto o Cinza morrer. E a defesa dele:'),
             ('c', 'p518_3', None, 'Cinza', 'gente'),
             ('n', 'Seis votos. Expulso pela segunda vez. E dessa vez... sem volta.')], 0.5),
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
                auds.append(dict(src=f'short_au4/{bid}_{k}.mp3', at=round(t * FPS), de=0))
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
                auds.append(dict(src=f'voice_au4/{arq}.mp3', at=round(t * FPS), de=round(corte * FPS), ate=round(dur * FPS), chef=chef))
                palavras += [dict(w=w['word'], s=round((t + w['start'] - corte) * FPS), e=round((t + w['end'] - corte) * FPS), chef=chef)
                             for w in ws if w['start'] >= corte and w['end'] <= fim_s + 0.01]
                t += dur + 0.2
        blocos.append(dict(id=bid, dur=int(round((t + folga) * FPS)), audios=auds, palavras=palavras))
        print(f'{bid:8s} {t:5.2f}s')
    (OUT / 'short_au4.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print('total', sum(x['dur'] for x in blocos) / FPS, 's')


if __name__ == '__main__':
    main()
