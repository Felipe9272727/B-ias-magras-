#!/usr/bin/env python3
"""Efeitos sonoros do Overcooked das IAs gerados no ElevenLabs (text-to-sound-effects), descritos o mais perto possível
dos sons do gênero (sem usar nenhum arquivo do jogo). Saída: remotion/public/overcooked/sfx/<nome>.mp3
Uso: python3 sfx_eleven_oc.py [nome ...]   (sem nomes: todos que ainda não existem)"""
import json, sys, urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'remotion' / 'public' / 'overcooked' / 'sfx'
SONS = {
    # baseado na pesquisa video/pesquisa/sons_overcooked.md (descrição dos sons do gênero, sem usar arquivos do jogo)
    'picar': ('Kitchen knife chopping vegetables quickly on a wooden cutting board, rhythmic thock thock thock, cartoonish, close mic, dry, no music.', 2.0),
    'fritar': ('Food sizzling in a frying pan, bright crackling sizzle with small pops, close mic, cartoonish, no music.', 4.0),
    'ferver': ('Pot of soup bubbling on a stove, rolling boil with gentle plopping bubbles, cartoonish, close mic.', 4.0),
    'pronto': ('Bright metallic service bell ding, single clear tone, short, slight reverb, game success chime, dry.', 1.5),
    'pedido': ('Two-note high bright pling notification chime, game order received, dry, short.', 1.0),
    'alarme': ('Urgent cartoon kitchen warning alarm, fast repeated electronic beeps, high pitched, insistent, game alert.', 2.0),
    'relogio': ('Fast clock ticking with rising tension, tick tick tick accelerating, cartoon game timer, dry.', 5.0),
    'moeda': ('Cash register ka-ching with a few coins jingling, bright cartoon game reward, short.', 1.5),
    'quebrou': ('Ceramic plate shattering on a tile floor, short crash with small pieces tinkling, cartoonish.', 1.5),
    'lavar': ('Water running into a sink with dishes clinking and sliding, cartoonish, close mic.', 3.0),
    'pegar': ('Soft cartoon pop when picking up an item in a cooking game, short pluck, light and bouncy, dry.', 0.5),
    'largar': ('Soft wooden clack of placing an object on a kitchen counter, short, cartoonish, dry.', 0.5),
    'jogar_panela': ('Vegetables plopping into a pot of liquid, short splash, cartoonish, dry.', 0.8),
    'buzzer': ('Low harsh game-show buzzer, wrong answer, short, descending.', 1.0),
    'expirou': ('Sad short descending cartoon tone, order failed in a cooking game, two notes, dry.', 1.0),
    'fogo': ('Small kitchen fire bursting into flames with a whoosh, then crackling, cartoonish, close mic.', 3.0),
    'extintor': ('Fire extinguisher spraying foam, pressurized hiss and whoosh, cartoonish, close mic.', 2.0),
    'estrelas': ('Triumphant cartoon victory chime, ascending arpeggio with sparkle, three quick star collect sounds, short.', 3.0),
    'largada': ('Cartoon game start countdown, three short beeps and one long high beep, bright, dry, no voice.', 4.0),
    'fim': ('Loud cartoon kitchen timer bell ringing, time is up, game over whistle, short.', 2.0),
    'esbarrao': ('Cartoon bump of two characters colliding, soft squishy thud with a little squeak, comedic, short.', 0.7),
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
