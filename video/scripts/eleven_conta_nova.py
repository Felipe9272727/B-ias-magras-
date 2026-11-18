#!/usr/bin/env python3
"""Conta nova do ElevenLabs: adiciona à conta nova as vozes da biblioteca pública que o canal usa (lista salva em
vozes_elevenlabs.json, tirada da conta antiga) e grava vozes_mapa.json (id antigo -> id na conta nova), que o
build_timeline_au7.tts usa nas chamadas. Vozes 'generated' (Marrom, Banana, Caqui) não passam de conta.
Uso: python3 eleven_conta_nova.py   (com a chave nova em '/chave elevenlabs2 ...' ou ELEVENLABS_API_KEY)"""
import json, sys, urllib.request, urllib.error
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import build_timeline_au7 as B

K = B.chave()
H = {'xi-api-key': K, 'Content-Type': 'application/json'}
vozes = json.loads((Path(__file__).parent / 'vozes_elevenlabs.json').read_text())
def req(url, body=None):
    r = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None, headers=H, method='POST' if body is not None else 'GET')
    return json.load(urllib.request.urlopen(r, timeout=60))
sub = req('https://api.elevenlabs.io/v1/user/subscription')
print('conta nova:', sub.get('tier'), sub.get('status'), 'caracteres livres:', sub['character_limit'] - sub['character_count'])
minhas = {v['voice_id']: v for v in req('https://api.elevenlabs.io/v2/voices?page_size=100').get('voices', [])}
mapa = {}
for nome, v in vozes.items():
    if v['voice_id'] in minhas:
        mapa[v['voice_id']] = v['voice_id']; print(f'{nome}: já está na conta'); continue
    if not v.get('public_owner_id'):
        print(f'{nome}: {v["category"]} — não dá para copiar de conta'); continue
    orig = v.get('original_voice_id') or v['voice_id']
    try:
        d = req(f'https://api.elevenlabs.io/v1/voices/add/{v["public_owner_id"]}/{orig}', {'new_name': f'{nome} - {v["name"]}'[:90]})
        mapa[v['voice_id']] = d['voice_id']; print(f'{nome}: adicionada -> {d["voice_id"]}')
    except urllib.error.HTTPError as e:
        print(f'{nome}: ERRO {e.code} {e.read().decode()[:160]}')
(Path(__file__).parent / 'vozes_mapa.json').write_text(json.dumps(mapa, indent=1))
print('mapa salvo:', len(mapa), 'vozes')
