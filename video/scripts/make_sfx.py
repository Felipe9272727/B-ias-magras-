#!/usr/bin/env python3
"""Sintetiza os efeitos sonoros do vídeo (sem licenças de terceiros).

Uso: python3 make_sfx.py ../remotion/public/sfx
Gera WAVs 48 kHz/16 bits normalizados em ~-3 dBFS e um sfx.json com a lista.
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.005, r=0.1, curve=3.0):
    """Envelope ataque/decaimento (em segundos)."""
    x = np.ones(n)
    na = max(1, int(SR * a))
    x[:na] = np.linspace(0, 1, na)
    nr = max(1, int(SR * r))
    if nr < n:
        x[-nr:] *= np.linspace(1, 0, nr) ** curve
    return x


def square(freq, d, duty=0.5):
    ph = np.cumsum(np.full(int(SR * d), freq) / SR) if np.isscalar(freq) else np.cumsum(freq / SR)
    return np.where((ph % 1.0) < duty, 1.0, -1.0)


def sweep_square(f0, f1, d, duty=0.5):
    f = np.geomspace(f0, f1, int(SR * d))
    return square(f, d, duty)


def lowpass(x, cutoff):
    """Passa-baixa de 1 polo (cutoff pode variar no tempo)."""
    c = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * c / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def notes(seq, voice='square', gap=0.0, duty=0.5):
    out = []
    for f, d in seq:
        n = int(SR * d)
        if f <= 0:
            out.append(np.zeros(n))
            continue
        w = square(f, d, duty) if voice == 'square' else np.sin(2 * np.pi * f * t(d))
        out.append(w * env(n, 0.003, d * 0.5, 2))
        if gap:
            out.append(np.zeros(int(SR * gap)))
    return np.concatenate(out)


def norm(x, peak_db=-3.0):
    x = x - np.mean(x)
    p = np.max(np.abs(x)) or 1
    return x / p * (10 ** (peak_db / 20))


def save(path, x):
    x = np.clip(norm(x), -1, 1)
    data = (x * 32767).astype('<i2')
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    return len(x) / SR


def make():
    fx = {}
    # whoosh: ruído com filtro varrendo
    d = 0.45
    n = int(SR * d)
    noise = rng.standard_normal(n)
    cut = np.concatenate([np.geomspace(300, 6000, n // 2), np.geomspace(6000, 400, n - n // 2)])
    fx['whoosh'] = (lowpass(noise, cut) * np.sin(np.linspace(0, np.pi, n)) ** 1.5, 'varredura de ar para transições')
    # pop
    d = 0.12
    fx['pop'] = (np.sin(2 * np.pi * np.geomspace(900, 300, int(SR * d)).cumsum() / SR) * env(int(SR * d), 0.002, 0.1), 'estalo curto')
    # boom: grave cinematográfico (seno descendente + saturação + cauda)
    d = 1.4
    tt = t(d)
    f = 34 + 70 * np.exp(-tt * 9)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.6)
    click = rng.standard_normal(len(tt)) * np.exp(-tt * 60) * 0.5
    fx['boom'] = (np.tanh((body + lowpass(click, 1800)) * 2.6), 'impacto grave estilo "vine boom"')
    # ding
    d = 1.2
    tt = t(d)
    ding = sum(np.sin(2 * np.pi * 1318.5 * k * tt) / k ** 1.6 for k in (1, 2.01, 3.03)) * np.exp(-tt * 4)
    fx['ding'] = (ding * env(len(tt), 0.002, 0.3), 'sino curto')
    # coin: duas notas de onda quadrada (B5 → E6)
    fx['coin'] = (notes([(987.8, 0.07), (1318.5, 0.32)], duty=0.5), 'moedinha 8-bit')
    # jump: chirp ascendente
    d = 0.22
    fx['jump'] = (sweep_square(300, 900, d, 0.25) * env(int(SR * d), 0.003, 0.08), 'pulo 8-bit')
    # death: melodia descendente
    fx['death'] = (notes([(987.8, 0.09), (0, 0.04), (987.8, 0.09), (0, 0.12), (740, 0.1), (659, 0.1), (587, 0.1), (523, 0.12), (392, 0.35)], duty=0.5), 'morte 8-bit')
    # error: buzzer
    d = 0.5
    fx['error'] = (square(110, d, 0.5) * 0.6 + square(116, d, 0.5) * 0.4, 'buzina de erro')
    fx['error'] = (fx['error'][0] * env(int(SR * d), 0.005, 0.08), fx['error'][1])
    # record scratch: ruído filtrado com "pitch" oscilante
    d = 0.55
    n = int(SR * d)
    tt = t(d)
    wob = 900 + 700 * np.sin(2 * np.pi * 7 * tt) * np.exp(-tt * 3)
    scratch = lowpass(rng.standard_normal(n), wob) * 3 + np.sin(2 * np.pi * np.cumsum(wob * 0.35) / SR) * 0.4
    fx['record-scratch'] = (scratch * env(n, 0.005, 0.2), 'disco arranhando')
    # click
    d = 0.03
    fx['click'] = (rng.standard_normal(int(SR * d)) * env(int(SR * d), 0.0005, 0.025, 4), 'clique')
    # typing: cliques irregulares por 1,5 s
    d = 1.5
    typing = np.zeros(int(SR * d))
    pos = 0.02
    while pos < d - 0.05:
        i = int(SR * pos)
        k = rng.standard_normal(int(SR * 0.012)) * env(int(SR * 0.012), 0.0005, 0.01, 4) * rng.uniform(0.4, 1)
        typing[i : i + len(k)] += k
        pos += rng.uniform(0.05, 0.13)
    fx['typing'] = (lowpass(typing, 5000), 'teclado digitando')
    # level-up: arpejo ascendente
    fx['level-up'] = (notes([(523.3, 0.07), (659.3, 0.07), (784, 0.07), (1046.5, 0.07), (1318.5, 0.07), (1568, 0.3)], duty=0.25), 'arpejo de vitória 8-bit')
    # drumroll: caixa rápida crescendo + prato
    d = 2.0
    n = int(SR * d)
    roll = np.zeros(n)
    hit = rng.standard_normal(int(SR * 0.03)) * env(int(SR * 0.03), 0.0005, 0.025, 3)
    p = 0.0
    while p < d - 0.05:
        i = int(SR * p)
        g = 0.35 + 0.65 * (p / d)
        roll[i : i + len(hit)] += hit * g
        p += 0.045
    fx['drumroll'] = (lowpass(roll, 3500), 'rufar de tambor')
    # tada: fanfarra curta
    tada = notes([(523.3, 0.1), (0, 0.03), (523.3, 0.08), (659.3, 0.08), (784, 0.5)], duty=0.5)
    tada2 = notes([(392, 0.1), (0, 0.03), (392, 0.08), (523.3, 0.08), (659.3, 0.5)], duty=0.25)
    m = min(len(tada), len(tada2))
    fx['tada'] = (tada[:m] + 0.6 * tada2[:m], 'fanfarra "ta-dá"')
    return fx


def main():
    out = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
    out.mkdir(parents=True, exist_ok=True)
    meta = []
    for name, (x, desc) in make().items():
        dur = save(out / f'{name}.wav', x)
        meta.append(dict(id=name, file=f'{name}.wav', duration_sec=round(dur, 3), description=desc))
        print(f'{name:16s} {dur:5.2f}s  {desc}')
    (out / 'sfx.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
