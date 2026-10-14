#!/usr/bin/env python3
"""Efeitos sonoros do Among Us 2 gerados no ElevenLabs (text-to-sound-effects), descritos o mais perto possível
dos sons do jogo original (sem usar nenhum arquivo do jogo). Saída: remotion/public/sfx_au2/eleven/<nome>.mp3
Uso: python3 sfx_eleven_au2.py [nome ...]   (sem nomes: todos que ainda não existem)"""
import json, sys, urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'remotion' / 'public' / 'sfx_au2' / 'eleven'
SONS = {
    # descrições no estilo dos sons do jogo original (timbre, ritmo e duração), sem usar nenhum arquivo do jogo
    'faca': ('cartoon space game kill: a quick sharp knife slash swish, then a squishy wet stab splat and a short punchy low bass thud, very short and snappy', 1.0),
    'corpo': ('cartoon space game dead body reported: a loud blaring alarm horn burst layered with a heavy cinematic bass impact and a tense synth stab, dramatic', 2.0),
    'emergencia': ('cartoon space game emergency meeting: a loud blaring klaxon alarm horn honk with a heavy cinematic bass boom hit, urgent and dramatic', 2.2),
    'voto': ('a soft rubber stamp thunk on paper, single short stamp, game UI', 0.5),
    'tarefa': ('mobile game task completed: a quick bright cheerful two-note ascending bling chime, clean digital synth', 0.8),
    'duto': ('cartoon game vent: a springy metallic grate popping open with a hollow metal clunk, quick and snappy', 0.8),
    'reator': ('spaceship reactor meltdown: a loud repeating whoop whoop klaxon siren alarm, harsh and urgent', 3.0),
    'luzes': ('electrical sabotage: a crackling electric zap and the power shutting down with a descending whine into silence', 1.5),
    'shhh': ('a breathy whispered shhhh, then a deep cinematic bass boom with long dark reverb tail, suspenseful game intro', 2.5),
    'revela_tripulante': ('cinematic game role reveal: a deep bass boom followed by a bright hopeful synth pad swell with shimmering sparkle, spacey', 3.0),
    'revela_impostor': ('cinematic game role reveal for the villain: a deep heavy bass boom followed by a dark sinister synth swell and ominous low drone, menacing', 3.0),
    'ejecao': ('spaceship airlock: a heavy door hiss and a rushing whoosh of air sucked out into space, fading to an eerie quiet space ambience', 4.0),
    'digitando': ('retro computer terminal text typing: rapid soft electronic blip beeps, one per letter, steady rhythm', 2.0),
    'vitoria': ('cartoon space game victory: a short triumphant synth fanfare with a bright choir pad, uplifting', 3.0),
    'derrota': ('cartoon space game defeat: a short low ominous synth chord descending into a dark drone, sad and tense', 3.0),
    'chat': ('chat message pop: a single soft round bubbly bloop, short', 0.5),
    'passos': ('dragging a heavy body across a metal floor, a short scraping slide', 1.5),
    'escudo': ('energy shield turning on around a character: a shimmering rising electric hum with a soft chime', 1.2),
    'tiro': ('single sci-fi laser pistol shot, sharp zap with short echo', 0.8),
    'sumir': ('a character vanishing and becoming invisible: a magical shimmering whoosh that fades away', 1.2),
    'transformar': ('shapeshifter transformation: a quick gooey squelchy morph with a magic sparkle', 1.2),
}


def gerar(nome):
    texto, dur = SONS[nome]
    chave = (Path.home() / '.config' / 'elevenlabs' / 'api_key').read_text().strip()
    body = json.dumps({'text': texto, 'duration_seconds': dur, 'prompt_influence': 0.6}).encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation', data=body, headers={'xi-api-key': chave, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=180) as r:
        (OUT / f'{nome}.mp3').write_bytes(r.read())


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    nomes = sys.argv[1:] or [n for n in SONS if not (OUT / f'{n}.mp3').exists()]
    for n in nomes:
        gerar(n)
        print('ok', n)


if __name__ == '__main__':
    main()
