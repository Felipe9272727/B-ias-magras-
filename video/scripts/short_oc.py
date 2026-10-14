#!/usr/bin/env python3
"""Shorts do Overcooked das IAs no molde dos Shorts que deram certo (ShortFrio): narração própria, um personagem só
(o Deep, DeepSeek), gancho com superlativo que volta no fim, selos no ritmo da fala, pensamento secreto e a partida
de verdade na vertical, com a câmera em cima dele. As falas dos chefs são as vozes já geradas para o vídeo longo
(voice_oc), cortadas na palavra certa.

Fatos conferidos nos logs (overcooked/logs): fase 1, cozinha DeepSeek, t37-t40, os dois cobram a sopa do fogão 1,
que do t24 ao t48 teve UMA cebola; t40 Deep: "PARA DE GRITAR E ANDA!"; fase 3, t73-t74, Deep e Seek se xingam;
coop: o Deep travou alguém 89 vezes (47 o Gepeto); t58 pensamento do Claudinho "já me travou quatro vezes";
t109 Deep: "FOI MAL, TRAVEI NO MEIO DE TODO MUNDO!".

Gera remotion/public/short_oc/<bloco>_<n>.mp3 (narração) e short_oc.json: por bloco, a duração, as partes de áudio
(narração ou fala de chef, com o ponto de corte) e as palavras (para legenda e selos).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_oc as oc  # noqa: E402  (pronúncias e vozes do Overcooked)
import build_timeline_au2 as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_oc'
VOZ_OC = ROOT / 'remotion' / 'public' / 'voice_oc'
FPS = 30

# bloco: [('n', texto) | ('c', arquivo do voice_oc, palavra de início, nome do chef)], folga no fim (s)
BLOCOS = [
    ('gancho', [('n', 'Esse é o pior colega de cozinha que já existiu.')], 0.15),
    ('quem', [('n', 'É uma IA, o DeepSeek, jogando Overcooked em dupla... com outro DeepSeek.')], 0.15),
    ('sopa', [('n', 'Na primeira fase, os dois brigam trinta segundos por uma sopa.'),
              ('c', 'f110_4', 'Para', 'Deep'),
              ('n', 'Só que a panela tinha uma cebola. Uma. A sopa não existia.')], 0.2),
    ('xinga', [('n', 'Depois, ele xinga o parceiro.'),
               ('c', 'a02_1', 'E', 'Deep'),
               ('c', 'a02_2', None, 'Seek'),
               ('n', 'É o DeepSeek xingando o DeepSeek.')], 0.2),
    ('coop', [('n', 'No coop, com Claude, GPT e Gemini, ele ficou no caminho de alguém oitenta e nove vezes. Até o Claude reclamou em segredo:'),
              ('c', 'c08_3', 'mas', 'Claudinho')], 0.25),
    ('fim', [('n', 'E no último segundo, ele admite:'),
             ('c', 'c14_1', None, 'Deep'),
             ('n', 'Sério... esse é o pior colega de cozinha que já existiu.')], 0.5),
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
                auds.append(dict(src=f'short_oc/{bid}_{k}.mp3', at=round(t * FPS), de=0))
                palavras += [dict(w=w['word'], s=round((t + w['start']) * FPS), e=round((t + w['end']) * FPS)) for w in words]
                t += dur + 0.15
            else:
                _, arq, ini, chef = p
                d = json.loads((VOZ_OC / f'{arq}.words.json').read_text())
                ws = [w for w in d['words'] if not w['word'].startswith('[')]
                corte = 0.0
                if ini:
                    # última ocorrência da palavra de início (o pedaço final da fala)
                    corte = max(w['start'] for w in ws if w['word'].rstrip(',!.') == ini) - 0.05
                dur = d['dur'] - corte
                auds.append(dict(src=f'voice_oc/{arq}.mp3', at=round(t * FPS), de=round(corte * FPS), chef=chef))
                palavras += [dict(w=w['word'], s=round((t + w['start'] - corte) * FPS), e=round((t + w['end'] - corte) * FPS), chef=chef)
                             for w in ws if w['start'] >= corte]
                t += dur + 0.2
        blocos.append(dict(id=bid, dur=int(round((t + folga) * FPS)), audios=auds, palavras=palavras))
        print(f'{bid:8s} {t:5.2f}s')
    (OUT / 'short_oc.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print('total', sum(x['dur'] for x in blocos) / FPS, 's')


if __name__ == '__main__':
    main()
