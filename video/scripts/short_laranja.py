#!/usr/bin/env python3
"""Shorts do primeiro vídeo de Among Us (8 IAs), no molde do Short que deu certo: "a IA acusada em todas as reuniões".
Personagem: o Laranja (DeepSeek) na partida 2. Fatos do roteiro do vídeo 1 (roteiro/roteiro2.py, cenas p205 a p222, que
vêm do log): luzes apagadas e dois corpos no Refeitório; os dois impostores acusam o Laranja; o Verde diz que baixava
dados no Refeitório e o Laranja responde que essa tarefa é em Comunicações; empate 3 a 3; no corpo seguinte o Amarelo
acusa o Laranja de novo, diz que estava em Armas e que viu o Laranja no Refeitório, e depois "me confundi nos tiques";
Amarelo expulso (impostor); o Verde confessa "vindo pelo duto do Admin"; Verde expulso, tripulantes vencem.
Gera remotion/public/short_laranja/<bloco>.mp3 (+ .words.json) e short_laranja.json."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au2 as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'remotion' / 'public' / 'short_laranja'
FPS = 30

# (id, texto, folga depois em s)
BLOCOS = [
    ('gancho', 'Essa IA foi acusada em todas as reuniões. E mesmo assim, pegou os dois impostores.', 0.15),
    ('quem', 'É o Laranja, um DeepSeek. As luzes apagam... e aparecem dois corpos no Refeitório.', 0.15),
    ('acusa1', 'Na reunião, os dois impostores, sem combinar nada, apontam pra mesma pessoa: ele.', 0.15),
    ('tarefa', 'Aí o Verde diz que tava baixando dados no Refeitório. E o Laranja responde: baixar dados é em Comunicações.', 0.25),
    ('empate', 'Pego pela tarefa! Mas a votação dá três a três. Empate. Ninguém sai.', 0.2),
    ('acusa2', 'Próximo corpo. E de novo: foi o Laranja. O Amarelo diz que tava em Armas... e que viu o Laranja no Refeitório.', 0.15),
    ('tiques', 'Como? E o Amarelo: me confundi nos tiques. Irmão, você é um computador.', 0.3),
    ('duto', 'Amarelo, impostor. Sobrou o Verde. O Laranja aperta o botão, e o Verde solta: vim pelo duto.', 0.25),
    ('fim', 'Verde, impostor. Tripulantes vencem. Acusado em todas as reuniões... e pegou os dois impostores.', 0.5),
]

DESFAZ = {v: k for k, v in b.bt.PRONUNCIA.items()}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    blocos = []
    for bid, texto, folga in BLOCOS:
        falado = ' '.join(b.bt.spoken(t) for t in texto.split())
        words, dur = b.tts(falado, b.NARRADOR, OUT / bid)
        escritas = texto.split()
        if len(escritas) == len(words):
            for w, e in zip(words, escritas):
                w['word'] = e
        else:
            for w in words:
                w['word'] = DESFAZ.get(w['word'], w['word'])
        blocos.append({'id': bid, 'dur': int(round((dur + folga) * FPS)),
                       'palavras': [{'w': w['word'], 's': round(w['start'] * FPS), 'e': round(w['end'] * FPS)} for w in words]})
        print(f'{bid:9s} {dur:5.2f}s')
    (OUT / 'short_laranja.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print('total', sum(x['dur'] for x in blocos) / FPS, 's')


if __name__ == '__main__':
    main()
