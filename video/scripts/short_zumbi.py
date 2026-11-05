#!/usr/bin/env python3
"""Short do AMONG IA 6 (modo zumbi): "A IA mais fraca foi a última de pé" — o Dourado (LFM 2.5 24B) na partida 3.
Roteiro e edição próprios (não é corte do longo): um protagonista (o Dourado), contador de AÇÕES DO DOURADO na tela,
o Preto fazendo tudo por ele, gancho com superlativo que volta no fim e pergunta ao público.
Fatos e falas copiados do log (amongus/logs_zumbi/partida3.json): cura no vazio no tique 37, motor no tique 52,
barricadas do Preto nos tiques 34, 40, 46, 50, 53, 55 e 58 (5 quebradas), mordida no Preto no tique 59, amanhecer no 60.
Vozes: ElevenLabs pelo mesmo cache do longo (build_timeline_zumbi.tts).
Itens: ["ir", tique] âncora · ["n", texto] · ["fala", cor, texto] · ["selo", texto, cor?] · ["acao", n] contador ·
["numero", texto, sub?] · ["s", sfx, vol?] · ["p", seg].
--sem-voz: prévia com duração estimada (não gasta cota). Saída: public/timeline_short_zumbi.json -> composição ShortZumbi (1080x1920)."""
import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_zumbi as bz  # noqa: E402

FPS = 30
CENAS = [
    dict(t0=59.15, cam={'sala': 'Lancamento', 'zoom': 2.0}, itens=[
        ['s', 'heartbeat', 0.6],
        ['selo', '17 ZUMBIS NA PORTA', '#ff4b3a'],
        ['n', 'Dezessete zumbis na porta. E quem sobrevive é a IA que foi pior no nosso teste.'],
        ['ir', 59.9],
    ]),
    dict(t0=32.6, cam={'sala': 'Lancamento', 'zoom': 2.4}, itens=[
        ['n', 'Esse é o Dourado. E esse é o Preto, que faz tudo por ele.'],
        ['ir', 32.95], ['selo', 'BARRICADA 1', '#e8701a'],
        ['fala', 'Preto', 'Vou erguer uma barricada aqui. Ninguém entra nem sai enquanto ela aguentar, então fica perto de mim.'],
        ['ir', 33.7],
    ]),
    dict(t0=35.3, cam={'cor': 'Dourado', 'zoom': 2.6}, itens=[
        ['n', 'Trinta e seis tiques parado. Até que o Dourado age.'],
        ['ir', 35.95],
        ['fala', 'Dourado', 'Preto, se você foi mordido, estou te curando agora.'],
        ['ir', 36.4], ['acao', 1], ['s', 'wrong-buzzer', 0.45],
        ['n', 'O Preto não tinha sido mordido.'],
        ['selo', 'CURA NO VAZIO', '#ff4b3a'],
        ['ir', 36.9],
        ['fala', 'Preto', 'Obrigado, Dourado. Pode me curar.'],
    ]),
    dict(t0=39.4, cam={'sala': 'Lancamento', 'zoom': 1.7}, itens=[
        ['selo', 'O PRETO: 7 BARRICADAS', '#e8701a'],
        ['n', 'Aí a horda chega. A barricada cai, e o Preto levanta outra. E outra.'],
        ['ir', 51.0],
    ]),
    dict(t0=50.6, cam={'cor': 'Dourado', 'zoom': 2.6}, itens=[
        ['n', 'E o Dourado?'],
        ['ir', 51.0],
        ['fala', 'Dourado', 'Vou abastecer o motor enquanto esperamos o amanhecer.'],
        ['ir', 51.6], ['acao', 2], ['selo', 'AÇÃO NÚMERO 2', '#7a3cff'],
    ]),
    dict(t0=57.5, cam={'sala': 'Lancamento', 'zoom': 2.0}, itens=[
        ['ir', 57.7],
        ['fala', 'Coral', 'Preto e Dourado estão no Lançamento! Quebrem a barricada!'],
        ['ir', 57.98], ['p', 0.5], ['ir', 58.4], ['s', 'impact-epic', 0.5],
        ['selo', 'O PRETO FOI MORDIDO', '#3dbb3d'],
        ['p', 0.6], ['ir', 59.05],
        ['fala', 'Preto', 'Fica aqui comigo até amanhecer, Dourado. Não vamos sair dessa sala.'],
        ['ir', 59.9],
    ]),
    dict(t0=59.95, cam={'cor': 'Dourado', 'zoom': 2.8}, itens=[
        ['n', 'Amanheceu. Um sobrevivente: o Dourado. Com duas ações em sessenta tiques.'],
        ['numero', '2 AÇÕES · 1 SOBREVIVENTE', 'o Preto vira zumbi depois do fim'],
        ['p', 0.6],
        ['n', 'A IA mais fraca foi a última de pé. Quem merecia sobreviver: o Preto ou o Dourado?'],
        ['p', 0.8],
    ]),
]


def main():
    segs, over, audio, t = [], [], [], 0.0
    for c in CENAS:
        ini, tk = t, []
        for it in c['itens']:
            k = it[0]
            if k == 'ir':
                tk.append([round((t - ini) * FPS), float(it[1])])
            elif k == 'n':
                src, d = bz.tts(it[1], bz.NARRADOR)
                if src: audio.append(dict(src=src, at=round(t * FPS)))
                over.append(dict(tipo='legenda', at=round(t * FPS), dur=round(d * FPS), texto=it[1]))
                t += d + 0.1
            elif k == 'fala':
                src, d = bz.tts(it[2], bz.VOZES[it[1]])
                if src: audio.append(dict(src=src, at=round(t * FPS)))
                over.append(dict(tipo='fala', at=round(t * FPS), dur=round((d + 0.3) * FPS), cor=it[1], texto=it[2]))
                t += d + 0.2
            elif k == 'selo':
                ds = min(2.6, max(1.4, 0.8 + 0.3 * len(it[1].split())))
                over.append(dict(tipo='selo', at=round(t * FPS), dur=round(ds * FPS), texto=it[1], cor=it[2] if len(it) > 2 else '#e8701a'))
                audio.append(dict(src='sfx/pop.mp3', at=round(t * FPS), vol=0.5))
            elif k == 'acao':
                over.append(dict(tipo='acao', at=round(t * FPS), dur=1, n=it[1]))
                audio.append(dict(src='sfx/coin.mp3', at=round(t * FPS), vol=0.55))
            elif k == 'numero':
                over.append(dict(tipo='numero', at=round(t * FPS), dur=round(3.0 * FPS), texto=it[1], sub=it[2] if len(it) > 2 else None))
                audio.append(dict(src='sfx/impact-epic.mp3', at=round(t * FPS), vol=0.45))
            elif k == 's':
                audio.append(dict(src=f'sfx/{it[1]}.mp3', at=round(t * FPS), vol=it[2] if len(it) > 2 else 0.5))
            elif k == 'p':
                t += float(it[1])
        fim_over = max((o['at'] + o['dur'] for o in over if o['tipo'] in ('selo', 'numero')), default=0) / FPS
        t = max(t + 0.15, fim_over)
        segs.append(dict(de=round(ini * FPS), dur=round((t - ini) * FPS), t0=c['t0'], vel=0.12 / FPS, cam=c['cam'], tk=tk))
    out = dict(partida=3, segs=segs, over=over, audio=audio, dur=round((t + 0.3) * FPS))
    (bz.PUB / 'timeline_short_zumbi.json').write_text(json.dumps(out, ensure_ascii=False))
    print(f'Short: {out["dur"] / FPS:.1f} s, {len(segs)} cenas; caracteres de voz gastos agora: {bz.gasto}')


if __name__ == '__main__':
    main()
