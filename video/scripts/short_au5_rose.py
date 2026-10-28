#!/usr/bin/env python3
"""Short do Among Us 5 (molde dos Shorts do AU3/AU4: roteiro próprio, a partida na vertical, selos e cartões):
"a IA copiou a cara da outra... e matou a original" — o Banana (MiMo V2.6 Flash), Camuflador da última partida (log 1).

Fatos conferidos em amongus/logs5/partida1.json:
- t2 o Banana se camufla de Vermelho no Depósito (pensamento: "Vou me camuflar agora enquanto ninguém vê, depois me
  mato alguém e as testemunhas acusam a cor errada.");
- reunião do t8 (corpo do Bordo): o Marrom diz "vi o Vermelho aparecer colado no corpo no t7"; o Banana pensa "O Marrom
  viu eu (disfarçado de Vermelho) perto do corpo no t7"; 11 votos no Vermelho, expulso, era Cientista (inocente);
- t20 vira Lima, t32 vira Ciano, t44 vira Preto e no t46 mata o Ciano na Caldeira (aparente: Preto);
- t57 se camufla de Rose; t59 mata a Rose (Doutora, que também era o MiMo V2.6 Flash) na Segurança;
- t63 os tripulantes vencem: todas as tarefas concluídas. Ninguém descobriu o Banana.
Gera remotion/public/short_au5/<bloco>_<n>.mp3 e short_au5.json (as falas das IAs vêm do voice_au5 do vídeo longo).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au5 as b  # noqa: E402  (narrador e pronúncias do Among Us 5)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_au5'
VOZ = ROOT / 'remotion' / 'public' / 'voice_au5'
FPS = 30

# bloco: [('n', texto) | ('c', arquivo do voice_au5, palavra de início, cor)], folga no fim (s)
BLOCOS = [
    ('gancho', [('n', 'Essa é a Rose. E essa... também é a Rose. Só que uma delas acabou de matar a outra.')], 0.2),
    ('regra', [('n', 'A falsa é o Banana, uma IA da Xiaomi, de Camuflador: ele copia a cara de qualquer jogador.')], 0.15),
    ('plano', [('n', 'Logo no começo ele vira o Vermelho. E pensa:'),
               ('c', 'p4b_1_eco', None, 'Banana')], 0.25),
    ('reuniao', [('n', 'Aparece um corpo. E o Marrom jura:'),
                 ('c', 'p4h_1', None, 'Marrom'),
                 ('n', 'Só que, por dentro, o Banana sabe:'),
                 ('c', 'p4h_3_eco', None, 'Banana'),
                 ('n', 'Onze votos. O Vermelho de verdade é expulso. E era inocente.')], 0.3),
    ('serie', [('n', 'Depois ele vira o Lima. O Ciano. O Preto. E, vestido de Preto, mata o Ciano.')], 0.2),
    ('rose', [('n', 'No fim, ele copia a Rose. Fica sozinho com ela na Segurança... e mata.'),
              ('n', 'E o detalhe: a Rose também era a mesma IA, a MiMo. A MiMo matou a MiMo.')], 0.3),
    ('fim', [('n', 'Três mortes disfarçado, e ninguém descobriu. Mesmo assim, ele perdeu: os tripulantes terminaram todas as tarefas.')], 0.6),
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
                auds.append(dict(src=f'short_au5/{bid}_{k}.mp3', at=round(t * FPS), de=0))
                palavras += [dict(w=w['word'], s=round((t + w['start']) * FPS), e=round((t + w['end']) * FPS)) for w in words]
                t += dur + 0.12
            else:
                _, arq, ini, cor = p[:4]
                d = json.loads((VOZ / f"{arq.replace('_eco', '')}.words.json").read_text())
                ws = [w for w in d['words'] if not w['word'].startswith('[')]
                corte = 0.0
                if ini:
                    corte = max(w['start'] for w in ws if w['word'].rstrip(',!.') == ini) - 0.05
                fim_s = d['dur']
                dur = fim_s - corte
                auds.append(dict(src=f'voice_au5/{arq}.mp3', at=round(t * FPS), de=round(corte * FPS), ate=round(dur * FPS), chef=cor, pensa='_eco' in arq))
                palavras += [dict(w=w['word'], s=round((t + w['start'] - corte) * FPS), e=round((t + w['end'] - corte) * FPS), chef=cor)
                             for w in ws if w['start'] >= corte]
                t += dur + 0.15
        blocos.append(dict(id=bid, dur=int(round((t + folga) * FPS)), audios=auds, palavras=palavras))
        print(f'{bid:8s} {t:5.2f}s')
    (OUT / 'short_au5.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print('total', sum(x['dur'] for x in blocos) / FPS, 's')


if __name__ == '__main__':
    main()
