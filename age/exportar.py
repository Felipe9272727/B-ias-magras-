#!/usr/bin/env python3
"""Copia a gravação da partida para o public/ do Remotion: quadros.json (lista) e mapa.json. Uso: python3 exportar.py <nome>"""
import json, sys
from pathlib import Path
n = sys.argv[1]
src = Path(__file__).parent / 'gravacoes' / n
dst = Path(__file__).parents[1] / 'video' / 'remotion' / 'public' / 'age' / n
dst.mkdir(parents=True, exist_ok=True)
qs = [json.loads(l) for l in open(src / 'quadros.jsonl') if l.strip()]
(dst / 'quadros.json').write_text(json.dumps(qs, separators=(',', ':')))
(dst / 'mapa.json').write_text((src / 'mapa.json').read_text())
print(len(qs), 'quadros ->', dst)
