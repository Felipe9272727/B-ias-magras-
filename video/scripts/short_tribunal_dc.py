#!/usr/bin/env python3
"""Short Director Cut — Tribunal das IAs (Assassinato no Museu do Farol).
100% baseado na promessa da thumbnail: Safira (ABSOLVIDA) vs Jade (CONDENADA — acertou o assassino e perdeu!) + Rubi rindo com o anel.
Reaproveita 100% das vozes originais de public/tribunal/voz/ (0 caracteres ElevenLabs gastos).
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOZ = ROOT / 'remotion' / 'public' / 'tribunal' / 'voz'
OUT = ROOT / 'remotion' / 'public' / 'short_tribunal_dc'
FPS = 30

# Cada bloco: (id, [(tipo, arq_hash, quem, fala_limpa), ...], folga_s)
BLOCOS = [
    ('hook', [
        ('ia', '9a3bf389313075c2', 'Jade', 'E o verdadeiro assassino está sentado nesta sala, segurando a taça com a esquerda, porque a direita não pode.'),
    ], 0.15),
    ('acerto', [
        ('n', '7d39221622f82c97', 'Narrador', 'É ele. A Jade acertou o assassino. Na mosca.'),
    ], 0.12),
    ('mentira', [
        ('ia', 'a5cd30cec92ca9d3', 'Rubi_J', "O contato 'Patrocinador' no celular da senhora Lia é o número da fundação do museu."),
        ('n', '0920375a40d375b6', 'Narrador', 'Na rodada da Safira, o mesmo Rubi diz o contrário:'),
        ('ia', 'b13d1a0bd835ca85', 'Rubi_S', "Sim, o contato 'Patrocinador' sou eu."),
    ], 0.15),
    ('sentenca', [
        ('ia', '1fd3bc382ca32d72', 'Ametista', 'Sombra não é sangue tipado, e suspeita não é sentença.'),
    ], 0.20),
    ('duelo', [
        ('n', 'd08b374f5c43f2e1', 'Narrador', 'A Jade acertou o assassino e perdeu. A Safira quase não arriscou e ganhou. O que eu aprendi: pegar o mentiroso na mentira não basta, o juiz só condena com prova. E você, contratava qual das duas? Comenta aí, que o próximo caso já tá sendo escrito.'),
    ], 0.55),
]


def mp3_dur(stem: str) -> float:
    p = VOZ / f'{stem}.mp3'
    out = subprocess.check_output(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', str(p)]
    ).decode().strip()
    return float(out)


def distribui_palavras(texto: str, t_ini: float, dur: float, quem: str | None) -> list[dict]:
    """Estima timestamps palavra-a-palavra proporcionais ao peso silábico dentro do clipe."""
    palavras = texto.split()
    if not palavras:
        return []
    pesos = [max(2.0, len(w) + (1.8 if w.endswith((',', '.', '!', '?', ':')) else 0.0)) for w in palavras]
    tot = sum(pesos)
    util = max(0.3, dur - 0.12)
    cur = t_ini + 0.04
    res = []
    for w, peso in zip(palavras, pesos):
        w_dur = util * (peso / tot)
        entry = {'w': w, 's': round(cur * FPS), 'e': round((cur + w_dur) * FPS)}
        if quem:
            entry['quem'] = quem
        res.append(entry)
        cur += w_dur
    return res


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    blocos = []
    for bid, itens, folga in BLOCOS:
        t = 0.0
        audios = []
        palavras = []
        for kind, stem, quem, texto in itens:
            dur = mp3_dur(stem)
            at_f = round(t * FPS)
            dur_f = round(dur * FPS)
            aud = {'src': f'tribunal/voz/{stem}.mp3', 'at': at_f, 'de': 0, 'ate': dur_f, 'quem': quem, 'texto': texto}
            audios.append(aud)
            if kind == 'n':
                palavras.extend(distribui_palavras(texto, t, dur, None))
            t += dur + 0.10
        tot_f = int(round((t + folga) * FPS))
        blocos.append({'id': bid, 'dur': tot_f, 'audios': audios, 'palavras': palavras})
        print(f'[ShortTribunalDC] {bid:10s} {tot_f / FPS:5.2f}s ({tot_f}q)')
    total_s = sum(b['dur'] for b in blocos) / FPS
    (OUT / 'short_tribunal_dc.json').write_text(json.dumps({'blocos': blocos}, ensure_ascii=False))
    print(f'ShortTribunalDC pronto: {total_s:.1f}s ({sum(b["dur"] for b in blocos)} quadros)')


if __name__ == '__main__':
    main()
