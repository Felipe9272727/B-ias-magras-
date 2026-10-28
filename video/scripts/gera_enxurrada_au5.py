#!/usr/bin/env python3
"""Abertura do AU5 (cena c01): os pedidos do Davi lidos em voz alta por várias vozes ao mesmo tempo, para dar a sensação de
sobrecarga enquanto os comentários enchem a tela. Gera remotion/public/voice_au5/enx_<n>.mp3 (ElevenLabs, vozes das cores) e
remotion/public/amongus5/enxurrada.json com {src, at (quadro na cena), vol}. Os textos são os comentários reais
(remotion/public/amongus5/davi_polus.json)."""
import json
import random
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au5 as b  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / 'remotion/public'
TEXTOS = json.loads((PUB / 'amongus5/davi_polus.json').read_text())
# os comentários lidos (índices do davi_polus.json): curtos e longos misturados
LIDOS = [0, 1, 3, 4, 5, 13, 15, 17, 19, 21, 22, 23, 27, 28, 29]
VOZES = ['Verde', 'Rosa', 'Laranja', 'Amarelo', 'Preto', 'Roxo', 'Ciano', 'Lima', 'Coral', 'Banana', 'Caqui', 'Rose', 'Azul', 'Bordo', 'Branco']


def main():
    random.seed(5)
    out = []
    for n, i in enumerate(LIDOS):
        txt = TEXTOS[i].replace('\n', ' ')
        base = PUB / 'voice_au5' / f'enx_{n}'
        b.tts(' '.join(b.bt.spoken(x) for x in txt.split()), b.VOZES[VOZES[n % len(VOZES)]], base)
        # entram cada vez mais juntas: as primeiras sozinhas, depois todas por cima umas das outras
        at = round(12 + 190 * (n / len(LIDOS)) ** 1.5)
        out.append(dict(src=f'voice_au5/enx_{n}.mp3', at=at, vol=round(0.55 - 0.02 * n, 2)))
    (PUB / 'amongus5/enxurrada.json').write_text(json.dumps(out, ensure_ascii=False))
    print(len(out), 'vozes')


if __name__ == '__main__':
    main()
