#!/usr/bin/env python3
"""Prévia do 60 Segundos das IAs (abertura + bloco do GPT): gera a narração (Gabriel, ElevenLabs, com cache) e
public/sessenta/previa/dados.json com os segmentos que a composição S60Previa monta.

Cada segmento: tipo 'titulo' | 'video' (clipe 3D já renderizado em public/sessenta/previa/<arq>.mp4) | 'dia' (cena 2D
do abrigo de uma partida) | 'card' (texto na tela), mais a fala do narrador. A duração é a maior entre o clipe e a fala.
Fatos conferidos nos logs: sessenta/logs/ep1_gpt_luna.json, ep1_gpt_luna_revanche.json e ep1_gpt.json.
Uso: python3 video/scripts/previa_s60.py
"""
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au2 as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'sessenta' / 'previa'
FPS = 30

SEGMENTOS = [
    dict(tipo='titulo', fala='Sessenta segundos. É o tempo que uma família tem pra salvar tudo o que importa antes da bomba cair.'),
    dict(tipo='video', arq='abertura', fala='Hoje, três inteligências artificiais vão jogar 60 Seconds. Elas pegam a comida, salvam a família e depois tentam sobreviver no abrigo. Ou não.'),
    dict(tipo='card', texto='⚠️ AVISO', sub='modelos 3D gratuitos (CC0, Kenney) • desenhos do abrigo traçados', fala='E antes que alguém comente: não, esses bonequinhos não são os do jogo. Os modelos oficiais têm direitos autorais, então a família foi trocada por uns bonecos de domínio público. Eles parecem mais felizes. A radiação é a mesma.'),
    dict(tipo='card', texto='GPT LUNA', sub='primeiro jogador', cor='#10a37f', fala='Primeiro jogador: o GPT. Na versão Luna, a mais baratinha.'),
    dict(tipo='video', arq='luna1', fala='Aos cinquenta e um segundos, ele já tinha a Celeste, o Tico, a sopa, o rifle e a máscara dentro do abrigo. Aí, faltando quatro segundos, ele lembrou que precisava de... mais uma sopa. O tempo acabou. O pai ficou do lado de fora. Dia zero.'),
    dict(tipo='card', texto='REVANCHE', sub='a gente avisou o que deu errado', cor='#10a37f', fala='A gente deu uma revanche. Mesma casa, e ainda contamos pra ele exatamente o que tinha dado errado.'),
    dict(tipo='video', arq='luna2', fala='Aos quarenta e nove segundos ele chegou no abrigo. E saiu de novo. Primeiro pela lanterna. Depois, aos cinquenta e seis, pelo rifle. De novo, do lado de fora. Duas partidas, zero dias.'),
    dict(tipo='card', texto='GPT TERRA', sub='o irmão mais velho (e mais caro)', cor='#0b7a5f', fala='Então chamamos o irmão mais velho: o GPT Terra. Mais caro, mais esperto. Em teoria.'),
    dict(tipo='video', arq='terra_fim', fala='E ele também foi buscando coisa até o último segundo: água, inseticida, cadeado. Só que chegou no alçapão com um segundo sobrando. Osvaldo, Celeste e Tico salvos. A Juju ficou na casa.'),
    dict(tipo='dia', arquivo='ep1_gpt', dia=3, fala='No terceiro dia, o abrigo alagou. Ele salvou o rádio, e o mapa foi embora com a água.'),
    dict(tipo='dia', arquivo='ep1_gpt', dia=5, fala='No quinto, invasores na porta. O cadeado segurou.'),
    dict(tipo='dia', arquivo='ep1_gpt', dia=7, fala='Aí veio a ideia genial: mandar o Osvaldo lá pra fora, no meio da radiação, sem máscara.'),
    dict(tipo='dia', arquivo='ep1_gpt', dia=9, fala='Ele não voltou. E o GPT achou que a melhor resposta pra isso era mandar o Tico também.'),
    dict(tipo='dia', arquivo='ep1_gpt', dia=11, fala='O Tico também não voltou. A Celeste ficou sozinha, sem água, e começou a perder a cabeça.'),
    dict(tipo='card', texto='GPT TERRA: 12 DIAS', sub='Celeste não resistiu à sede', cor='#0b7a5f', fala='No dia doze, a Celeste não resistiu à sede. GPT Terra: doze dias. É a marca pra bater.'),
]


def duracao(arq):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(arq)], capture_output=True, text=True)
    return float(r.stdout.strip() or 0)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    segs = []
    for i, s in enumerate(SEGMENTOS):
        palavras, dur = b.tts(' '.join(b.bt.spoken(t) for t in s['fala'].split()), b.NARRADOR, OUT / f'n{i:02d}')
        d = dict(s, narr=f'sessenta/previa/n{i:02d}.mp3', durNarr=round(dur * FPS))
        clipe = round(duracao(OUT / f"{s['arq']}.mp4") * FPS) if s['tipo'] == 'video' and (OUT / f"{s['arq']}.mp4").exists() else 0
        d['durClipe'] = clipe
        d['dur'] = max(clipe, round((dur + 0.6) * FPS))
        segs.append(d)
    (OUT / 'dados.json').write_text(json.dumps(dict(segmentos=segs), ensure_ascii=False, indent=1))
    print('total', round(sum(s['dur'] for s in segs) / FPS, 1), 's')


if __name__ == '__main__':
    main()
