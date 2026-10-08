#!/usr/bin/env python3
"""Trilha extra de efeitos "de jogo" para o vídeo 2, montada a partir de remotion/public/timeline2.json.

- "plim" a cada mensagem que aparece no chat das reuniões;
- alarme no "CORPO ENCONTRADO!" / "REUNIÃO DE EMERGÊNCIA!";
- facada + "splash" no instante da animação de morte (marcações [[k:T]] que caem num tique com morte);
- passos baixinhos enquanto o jogador seguido pela câmera anda entre salas.

Os sons são do Mixkit (licença livre). Saída: WAV mono 48 kHz para o mix_audio.py (--extra).
Uso: python3 sfx_jogo2.py remotion/public/sfx_jogo data/sfx_jogo2.wav
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SR = 48000
FPS = 30

# id: (arquivo, início s, duração s, ganho)
SONS = {
    'chat': ('mixkit_2354.mp3', 0.0, 0.6, 0.30),
    'alarme': ('mixkit_1000.mp3', 0.0, 2.2, 0.32),
    'faca': ('mixkit_1487.mp3', 0.0, 0.32, 0.55),
    'sangue': ('mixkit_2361.mp3', 0.0, 0.9, 0.38),
    'passos': ('mixkit_543.mp3', 0.0, 8.0, 0.10),
}


def carregar(pasta, arq, ini, dur):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(ini), '-t', str(dur), '-i', str(pasta / arq), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).copy()
    pico = np.abs(x).max() or 1.0
    x /= pico  # normaliza pelo pico; o ganho de SONS define o nível
    n = min(len(x), int(0.02 * SR))
    x[-n:] *= np.linspace(1, 0, n)
    return x


def sala_em(p, cor, t):
    """Sala do jogador ao fim do tique t (mesma regra do componente), ou None se morto."""
    for e in p['eventos']:
        if e['tipo'] == 'morte' and e['vitima'] == cor and e['tique'] <= t:
            return None
    if any(r['expulso'] == cor and r['tique'] < t for r in p['reunioes']):
        return None
    tq = p['tiques'][t] if t < len(p['tiques']) else None
    if tq:
        for d in tq['decisoes']:
            if d['cor'] == cor:
                return d['para']
        if tq.get('estado'):
            for j in tq['estado']['jogadores']:
                if j['cor'] == cor:
                    return j['sala']
    return sala_em(p, cor, t - 1) if t > 0 else 'Refeitorio'


def relogio(de, ate, dur, chaves):
    pts = [(0, de)] + sorted((c['at'], c['tick'] - 0.5) for c in chaves if de < c['tick'] - 0.5 < ate) + [(max(1, dur), ate - 0.001)]
    pts.sort()

    def tf(f):
        if f <= pts[0][0]:
            return pts[0][1]
        for (a0, t0), (a1, t1) in zip(pts, pts[1:]):
            if f <= a1:
                return t0 + (t1 - t0) * (f - a0) / max(1, a1 - a0)
        return pts[-1][1]
    return tf


def main():
    pasta, saida = Path(sys.argv[1]), Path(sys.argv[2])
    tl = json.loads((ROOT / 'remotion' / 'public' / 'timeline2.json').read_text())
    ps = tl['data']['partidas']
    sons = {k: carregar(pasta, *v[:3]) * v[3] for k, v in SONS.items()}
    trilha = np.zeros(int(tl['durationInFrames'] / FPS * SR) + SR, dtype=np.float32)
    cont = {k: 0 for k in SONS}

    def por(nome, frame, dur_s=None):
        s = sons[nome]
        if dur_s is not None:  # passos: repete o loop até cobrir a duração
            reps = int(np.ceil(dur_s * SR / len(s)))
            s = np.tile(s, reps)[: int(dur_s * SR)].copy()
            n = min(len(s), int(0.08 * SR))
            s[:n] *= np.linspace(0, 1, n)
            s[-n:] *= np.linspace(1, 0, n)
        i = int(frame / FPS * SR)
        trilha[i:i + len(s)] += s[: max(0, len(trilha) - i)]
        cont[nome] += 1

    for sc in tl['scenes']:
        v = sc['visual']
        if v.get('type') != 'component':
            continue
        props = v.get('props', {})
        nome = v.get('name')
        if nome == 'AUReuniao':
            if props.get('splash'):
                por('alarme', sc['start'] + 3)
            for c in props.get('chat', []):
                por('chat', sc['start'] + c['at'])
        if nome in ('AUReplay', 'AUSplit'):
            p = ps[str(props['partida'])]
            chaves = [e for e in sc['events'] if e['type'] == 'tk']
            mortes = {e['tique'] for e in p['eventos'] if e['tipo'] == 'morte'}
            for c in chaves:
                if int(c['tick']) in mortes:
                    por('faca', sc['start'] + c['at'] + 1)
                    por('sangue', sc['start'] + c['at'] + 6)
            foco = (props.get('pensamentos') or [None])[0] if nome == 'AUReplay' else props.get('esquerda')
            if not foco:
                continue
            tf = relogio(props['de'], props['ate'], sc['duration'], chaves)
            # percorre a cena e acha os trechos em que o foco anda entre salas (frac 0 → 0.8 do tique)
            andando, ini = False, 0
            for f in range(0, sc['duration'], 2):
                t = tf(f)
                t0 = int(t)
                frac = t - t0
                a, b = sala_em(p, foco, t0), sala_em(p, foco, t0 + 1)
                reuniao = any(r['tique'] == t0 for r in p['reunioes'])
                anda = bool(a and b and a != b and not reuniao and frac < 0.8)
                ventou = any(e['tipo'] == 'duto' and e['tique'] == t0 + 1 and e.get('cor') == foco for e in p['eventos'])
                anda = anda and not ventou
                if anda and not andando:
                    andando, ini = True, f
                elif not anda and andando:
                    andando = False
                    if f - ini > 10:
                        por('passos', sc['start'] + ini, (f - ini) / FPS)
            if andando and sc['duration'] - ini > 10:
                por('passos', sc['start'] + ini, (sc['duration'] - ini) / FPS)

    pico = np.abs(trilha).max()
    if pico > 0.98:
        trilha *= 0.98 / pico
    pcm = (trilha * 32767).astype('<i2').tobytes()
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', str(saida)], input=pcm, check=True)
    print('efeitos:', cont, '→', saida)


if __name__ == '__main__':
    main()
