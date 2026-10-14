#!/usr/bin/env python3
"""Efeitos sonoros do Among Us 2, sintetizados do zero com numpy (nenhum arquivo do jogo; sem licença de terceiros).
Cada um imita o PAPEL do som no jogo (facada, reunião, voto...), não a gravação original.

Saída: remotion/public/sfx_au2/<id>.mp3 e amostra_sfx_au2.mp3 (todos em sequência, com o nome falado antes não; só pausas).
Uso: python3 video/scripts/sfx_au2.py
"""
import subprocess, wave
from pathlib import Path
import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parents[1] / 'remotion' / 'public' / 'sfx_au2'
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(d * SR)) / SR


def env(n, a=0.005, r=0.2):
    e = np.ones(n)
    na, nr = int(a * SR), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def dec(n, tau):
    return np.exp(-np.arange(n) / SR / tau)


def lp(x, fc):  # passa-baixa de 1 polo (aplicado 2x)
    a = np.exp(-2 * np.pi * fc / SR)
    for _ in range(2):
        y = np.zeros_like(x)
        acc = 0.0
        for i in range(len(x)):
            acc = (1 - a) * x[i] + a * acc
            y[i] = acc
        x = y
    return x


def hp(x, fc):
    return x - lp(x, fc)


def saw(f, d):
    tt = t(d)
    return 2 * ((tt * f) % 1) - 1


def sq(f, d):
    return np.sign(np.sin(2 * np.pi * f * t(d)))


def sin(f, d):
    return np.sin(2 * np.pi * f * t(d))


def tri(f, d):
    return 2 * np.abs(saw(f, d)) - 1


def ruido(d):
    return rng.uniform(-1, 1, int(d * SR))


def reverb(x, mix=0.25, d=0.9):
    y = np.concatenate([x, np.zeros(int(d * SR))])
    out = y.copy()
    for atraso, g in ((0.029, 0.6), (0.037, 0.55), (0.041, 0.5), (0.053, 0.45)):
        n = int(atraso * SR)
        c = np.zeros_like(y)
        for i in range(n, len(y)):
            c[i] = y[i - n] + g * c[i - n]
        out += mix * 0.25 * c
    return out


def junta(*partes):
    n = max(len(p) for p in partes)
    s = np.zeros(n)
    for p in partes:
        s[:len(p)] += p
    return s


def seq(*partes):
    return np.concatenate(partes)


def norm(x, pico=0.89):
    m = np.abs(x).max() or 1
    return x / m * pico


def faca():
    corte = hp(ruido(0.07), 2500) * dec(int(0.07 * SR), 0.015) * 1.2
    baque = sin(70, 0.35) * dec(int(0.35 * SR), 0.08) * 1.4 + sin(120, 0.35) * dec(int(0.35 * SR), 0.05) * 0.6
    squish = lp(ruido(0.35), 900) * env(int(0.35 * SR), 0.02, 0.3) * 0.9
    return reverb(junta(corte, baque, np.concatenate([np.zeros(int(0.03 * SR)), squish])), 0.2, 0.5)


def acorde(fs, d, voz=saw, corte=1600, a=0.02, r=0.6):
    return lp(sum(voz(f, d) for f in fs) / len(fs), corte) * env(int(d * SR), a, r)


def corpo():  # "corpo denunciado": dois acordes graves descendo, com impacto
    imp = sin(55, 0.8) * dec(int(0.8 * SR), 0.25) * 1.2
    a1 = acorde([110, 164.8, 220], 0.55, saw, 1200, 0.01, 0.2)
    a2 = acorde([87.3, 130.8, 174.6], 1.2, saw, 900, 0.01, 0.9)
    return reverb(junta(seq(a1, a2) * 0.9, imp), 0.35, 1.2)


def emergencia():  # alarme subindo duas vezes + "dum"
    def sobe(d):
        tt = t(d)
        f = 500 + 700 * (tt / d)
        return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(len(tt), 0.01, 0.05)
    al = lp(seq(sobe(0.42), sobe(0.42), sobe(0.42)), 3500) * 0.5
    dum = sin(65, 1.6) * dec(int(1.6 * SR), 0.4) * 1.1
    return reverb(junta(al, dum), 0.3, 0.9)


def voto():
    return junta(sin(1046, 0.12) * dec(int(0.12 * SR), 0.03), sin(1568, 0.12) * dec(int(0.12 * SR), 0.02) * 0.4, hp(ruido(0.01), 3000) * 0.3)


def tarefa():  # plim duplo subindo
    n1 = tri(880, 0.22) * dec(int(0.22 * SR), 0.09)
    n2 = tri(1318.5, 0.45) * dec(int(0.45 * SR), 0.15)
    return reverb(seq(n1, n2) * 0.8, 0.25, 0.6)


def duto():  # clank metálico + baque abafado
    d = 0.5
    parc = sum(sin(f, d) * dec(int(d * SR), tau) * g for f, tau, g in ((233, 0.18, 1), (567, 0.12, 0.7), (893, 0.08, 0.5), (1377, 0.05, 0.35)))
    baque = lp(ruido(0.2), 400) * dec(int(0.2 * SR), 0.05) * 1.5
    return reverb(junta(parc * 0.7, baque), 0.3, 0.6)


def reator():  # sirene pulsando (2 ciclos)
    um = seq(acorde([440, 445], 0.45, saw, 2200, 0.01, 0.05), acorde([587, 592], 0.45, saw, 2200, 0.01, 0.05))
    return lp(seq(um, um), 3000) * 0.8


def luzes():  # queda de energia: zap descendo
    d = 0.9
    tt = t(d)
    f = 900 * np.exp(-tt * 3.5) + 60
    zap = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(len(tt), 0.005, 0.5) * 0.4
    return reverb(junta(lp(zap, 2500), hp(ruido(0.15), 2000) * dec(int(0.15 * SR), 0.03) * 0.5), 0.25, 0.6)


def shhh():
    d = 1.0
    x = hp(lp(ruido(d), 9000), 2800) * env(int(d * SR), 0.08, 0.5)
    return x * 0.8


def revela(impostor):
    if impostor:
        c = acorde([65.4, 77.8, 98, 130.8], 2.2, saw, 1100, 0.02, 1.4)
        boom = sin(41, 1.6) * dec(int(1.6 * SR), 0.5) * 1.3
        return reverb(junta(c, boom), 0.4, 1.4)
    c = acorde([261.6, 329.6, 392, 523.3], 2.0, saw, 2400, 0.03, 1.3)
    brilho = tri(1046.5, 1.2) * dec(int(1.2 * SR), 0.4) * 0.3
    return reverb(junta(c, brilho), 0.4, 1.2)


def ejecao():  # vento espacial
    d = 3.5
    x = lp(ruido(d), 600) * env(int(d * SR), 1.0, 1.8)
    return x * 1.2


def vitoria():
    notas = [523.3, 659.3, 784, 1046.5]
    arp = seq(*[tri(f, 0.16) * dec(int(0.16 * SR), 0.1) for f in notas])
    fim = acorde([523.3, 659.3, 784], 1.4, saw, 2600, 0.02, 1.0)
    return reverb(seq(arp, fim), 0.35, 1.2)


def derrota():
    notas = [392, 311.1, 261.6]
    arp = seq(*[acorde([f, f / 2], 0.32, saw, 1400, 0.01, 0.15) for f in notas])
    fim = acorde([196, 233.1, 293.7], 1.6, saw, 1000, 0.02, 1.3)
    return reverb(seq(arp, fim), 0.35, 1.2)


def chat():
    return junta(sin(1318.5, 0.08) * dec(int(0.08 * SR), 0.02), sin(1760, 0.08) * dec(int(0.08 * SR), 0.015) * 0.5) * 0.8


def passos():  # 8 passos leves
    um = lp(ruido(0.06), 700) * dec(int(0.06 * SR), 0.015)
    pausa = np.zeros(int(0.22 * SR))
    return seq(*[seq(um * (0.8 + 0.2 * (i % 2)), pausa) for i in range(8)]) * 0.9


def escudo():
    d = 0.7
    tt = t(d)
    f = 600 + 900 * tt / d
    return reverb(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.01, 0.4) * 0.6, 0.35, 0.8)


def tiro():
    estalo = hp(ruido(0.12), 1200) * dec(int(0.12 * SR), 0.02) * 1.4
    corpo_ = sin(90, 0.4) * dec(int(0.4 * SR), 0.1)
    return reverb(junta(estalo, corpo_), 0.35, 1.0)


def sumir():  # fantasma ficando invisível
    d = 0.8
    tt = t(d)
    f = 1400 * np.exp(-tt * 2) + 200
    return reverb(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.01, 0.6) * 0.5, 0.45, 1.0)


def transformar():
    d = 0.6
    return reverb(junta(hp(ruido(d), 1500) * env(int(d * SR), 0.01, 0.5) * 0.4, sin(220, d) * dec(int(d * SR), 0.2) * 0.6), 0.4, 0.8)


SONS = {
    'faca': faca, 'corpo': corpo, 'emergencia': emergencia, 'voto': voto, 'tarefa': tarefa, 'duto': duto,
    'reator': reator, 'luzes': luzes, 'shhh': shhh, 'revela_tripulante': lambda: revela(False),
    'revela_impostor': lambda: revela(True), 'ejecao': ejecao, 'vitoria': vitoria, 'derrota': derrota,
    'chat': chat, 'passos': passos, 'escudo': escudo, 'tiro': tiro, 'sumir': sumir, 'transformar': transformar,
}


def salvar_wav(path, x):
    y = (norm(x) * 32767).astype(np.int16)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    amostra = []
    for nome, fn in SONS.items():
        x = fn()
        wav = OUT / f'{nome}.wav'
        salvar_wav(wav, x)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-b:a', '160k', str(OUT / f'{nome}.mp3')], check=True)
        wav.unlink()
        amostra += [norm(x), np.zeros(int(0.7 * SR))]
        print(nome, round(len(x) / SR, 2), 's')
    salvar_wav(OUT / 'amostra.wav', np.concatenate(amostra))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(OUT / 'amostra.wav'), '-b:a', '160k', str(OUT / 'amostra_sfx_au2.mp3')], check=True)
    (OUT / 'amostra.wav').unlink()


if __name__ == '__main__':
    main()
