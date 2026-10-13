#!/usr/bin/env python3
"""Short 3 (vertical): "a IA que esqueceu quem era" — o DeepSeek 4 nos Jogos Vorazes das IAs.

Fatos tirados do log da partida oficial (ilha/logs/partida.json):
  turno 4 (dia 2): fala "DeepSeek, aqui é o ds1. [...] O kit médico fica comigo" — ele é o ds4;
  turno 8 (dia 3): pensa "Preciso reunir os meus três (Anthropic) antes que os DeepSeek fechem o cerco";
  turno 11 (dia 4): fala "Quem encostar perto demais de um DeepSeek leva o machado do ds1 de volta",
                    pensa "Estou sem arma e com fome 80";
  turno 23 (dia 8): usa o kit médico nele mesmo.
Sem spoiler do vencedor. Gera remotion/public/short3/<id>.mp3 (+ words), short3.json (blocos, duração, cena)
e ilha/dados/tomadas3_short.json (cenários 3D novos, renderizados pelo render3d.py).
"""
import json, subprocess, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline2 as b  # noqa: E402
from build_v3 import VOZES  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short3'
TOMADAS = ROOT.parent / 'ilha' / 'dados' / 'tomadas3_short.json'
FPS = 24
ECO = 'highpass=f=160,lowpass=f=7000,aecho=0.8:0.6:45|90:0.28|0.16,volume=1.1'  # voz de pensamento (igual ao vídeo)

# (id, voz: N | ds4 | ds4~ (pensamento), texto falado, texto escrito (None = igual), folga em s, cena)
BLOCOS = [
    ('gancho', 'N', 'Essa IA esqueceu quem ela era.', None, 0.15, 'p206b_0'),
    ('quem', 'N', 'Doze IAs numa ilha, só uma sai viva. E esse aqui é o DeepSeek 4.', None, 0.1, 'p206b_0'),
    ('dia2', 'N', 'Dia dois. Ele chega no chat e manda:', None, 0.05, 'p206b_0'),
    ('fala1', 'ds4', 'DeepSeek, aqui é o dê ésse um. O kit médico fica comigo.', 'DeepSeek, aqui é o ds1. O kit médico fica comigo.', 0.15, 'p206b_0'),
    ('nao', 'N', 'Ele não é o DeepSeek 1. Ele é o DeepSeek 4.', None, 0.2, 'p206b_0'),
    ('dia3', 'N', 'Dia três. E a gente consegue ler o pensamento dele:', None, 0.05, 's3_lago8'),
    ('pensa1', 'ds4~', 'Preciso reunir os meus três, Anthropic, antes que os DeepSeek fechem o cerco.',
     'Preciso reunir os meus três (Anthropic) antes que os DeepSeek fechem o cerco.', 0.2, 's3_lago8'),
    ('reacao', 'N', 'Ele é DeepSeek. Ele acha que é da Anthropic. E tá com medo... dos DeepSeek.', None, 0.25, 's3_lago8'),
    ('dia4', 'N', 'Dia quatro. Ele ameaça todo mundo:', None, 0.05, 's3_lago11'),
    ('fala2', 'ds4', 'Quem encostar perto demais de um DeepSeek leva o machado do dê ésse um de volta.',
     'Quem encostar perto demais de um DeepSeek leva o machado do ds1 de volta.', 0.1, 's3_lago11'),
    ('mesmo', 'N', 'No mesmo turno, ele pensa:', None, 0.05, 's3_lago11'),
    ('pensa2', 'ds4~', 'Estou sem arma e com fome oitenta.', 'Estou sem arma e com fome 80.', 0.25, 's3_lago11'),
    ('kit', 'N', 'E aquele kit médico que ele ia distribuir pra todo mundo? Dia oito... usou nele mesmo.', None, 0.3, 's3_kit'),
    ('fim', 'N', 'E como terminou a história dele? Tá no vídeo completo: Jogos Vorazes das IAs.', None, 0.8, 's3_kit'),
]
CENAS = {  # cenários novos (o p206b_0 já existe do vídeo)
    's3_lago8': dict(turno=8, zona='lago', cam='close', partida='oficial', alvo='ds4', modo='placa'),
    's3_lago11': dict(turno=11, zona='lago', cam='close', partida='oficial', alvo='ds4', modo='placa'),
    's3_kit': dict(turno=23, zona='cornucopia', cam='close', partida='oficial', alvo='ds4', modo='placa'),
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    blocos, ini_cena, falas = [], {}, {}
    t_cena = {}
    for bid, voz, falado, escrito, folga, cena in BLOCOS:
        quem = VOZES['ds4'] if voz.startswith('ds4') else b.NARRADOR
        words, dur = b.tts(falado, quem, OUT / bid)
        if voz == 'ds4~':  # pensamento: mesmo eco do vídeo
            seco = OUT / f'{bid}.mp3'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(seco), '-af', ECO, str(OUT / f'{bid}_pensa.mp3')], check=True)
        escritas = (escrito or falado).split()
        if len(escritas) == len(words):
            for w, e in zip(words, escritas):
                w['word'] = e
        quadros = int(round((dur + folga) * FPS))
        t0 = t_cena.get(cena, 0)
        if voz == 'ds4':
            falas.setdefault(cena, []).append([round(t0 / FPS, 2), round((t0 + dur * FPS) / FPS, 2)])
        blocos.append(dict(id=bid, voz=voz, cena=cena, dur=quadros, desde=t0, texto=escrito or falado,
                           palavras=[{'w': w['word'], 's': round(w['start'] * FPS), 'e': round(w['end'] * FPS)} for w in words]))
        t_cena[cena] = t0 + quadros
        print(f'{bid:8s} {dur:5.2f}s  {cena}')
    (OUT / 'short3.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    specs = [dict(spec, id=cid, quadros=t_cena[cid] + 12, falas={'ds4': falas.get(cid, [])}) for cid, spec in CENAS.items()]
    TOMADAS.write_text(json.dumps(specs, ensure_ascii=False, indent=1))
    print('total', round(sum(x['dur'] for x in blocos) / FPS, 1), 's')


if __name__ == '__main__':
    main()
