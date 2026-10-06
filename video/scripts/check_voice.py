#!/usr/bin/env python3
"""Confere a narração: transcreve cada cena com Whisper e compara com o texto enviado à voz.

Uso: .venv-tts/bin/python check_voice.py   (requer faster-whisper e o modelo large-v3-turbo em cache)
Escreve data/voice_check.json e imprime as cenas com diferenças.
"""
import difflib
import json
import re
import subprocess
import unicodedata
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[1]
VOICE = ROOT / 'remotion' / 'public' / 'voice'


def load(f):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(f), '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'])
    return np.frombuffer(raw, np.float32).copy()


def words(s):
    s = unicodedata.normalize('NFKD', s.lower())
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9 ]', ' ', s).split()


def main():
    import sys

    only = set(sys.argv[1].split(',')) if len(sys.argv) > 1 else None
    req = {x['id']: x['text'] for x in json.loads((ROOT / 'data' / 'tts_request.json').read_text()) if not only or x['id'] in only}
    model = WhisperModel('mobiuslabsgmbh/faster-whisper-large-v3-turbo', device='cpu', compute_type='int8', cpu_threads=4)
    out = {}
    for sid, text in req.items():
        segs, _ = model.transcribe(load(VOICE / f'{sid}.mp3'), language='pt', beam_size=5, condition_on_previous_text=False)
        hyp = ' '.join(s.text.strip() for s in segs)
        a, b = words(text), words(hyp)
        sm = difflib.SequenceMatcher(None, a, b)
        diffs = [(' '.join(a[i1:i2]), ' '.join(b[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
        out[sid] = dict(ratio=round(sm.ratio(), 3), hyp=hyp, diffs=diffs)
        print(f'{sid:5s} {sm.ratio():.3f}  ' + ' | '.join(f'{x!r}→{y!r}' for x, y in diffs[:8]), flush=True)
    path = ROOT / 'data' / 'voice_check.json'
    old = json.loads(path.read_text()) if path.exists() else {}
    old.update(out)
    path.write_text(json.dumps(old, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
