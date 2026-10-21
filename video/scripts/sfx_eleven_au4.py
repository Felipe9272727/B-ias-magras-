#!/usr/bin/env python3
"""Efeitos sonoros novos do Among Us 4 (Glutão, Canibal, Piromante, Casal, Bombardeiro). Copiado do sfx_eleven_au2.py.
Efeitos sonoros do Among Us 2 gerados no ElevenLabs (text-to-sound-effects), descritos o mais perto possível
dos sons do jogo original (sem usar nenhum arquivo do jogo). Saída: remotion/public/sfx_au4/<nome>.mp3
Uso: python3 sfx_eleven_au4.py [nome ...]   (sem nomes: todos que ainda não existem)"""
import json, sys, urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'remotion' / 'public' / 'sfx_au4'
SONS = {
    'nhac': ('cartoon monster giant chomp: a huge wet gulp bite with teeth clacking shut, then a satisfied short burp, funny', 1.6),
    'crunch': ('cartoon character eating: three quick crunchy bites, chewing bones crunch crunch crunch, gross and funny', 1.4),
    'fogo': ('a big fire ignition: a loud whoosh of gasoline catching fire, roaring flames burst then crackling', 2.0),
    'coracao': ('cartoon heartbreak: a single soft heartbeat thump, then a glass-like cracking shatter and a sad descending slide whistle', 1.6),
    'splash': ('a quick liquid splash of gasoline poured on someone, sloshy glug splash, short', 0.8),
    'bip': ('a small time bomb attached: a metallic click then two quick electronic warning beeps, short and tense', 0.9),
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
