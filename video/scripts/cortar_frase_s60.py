#!/usr/bin/env python3
"""Tira um trecho de uma narração JÁ GERADA (sem gastar cota do ElevenLabs): corta o áudio no ponto certo, ajusta as
palavras e grava o cache com o hash do texto novo, para o build_timeline_s60.py reaproveitar.

Uso: python3 cortar_frase_s60.py <voz_base sem extensão> "<texto antigo>" "<texto novo>"
O texto novo tem que ser o antigo sem um pedaço contínuo (marcações [[...]] podem mudar à vontade).
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import build_timeline as bt  # noqa: E402
import build_timeline_au2 as au  # noqa: E402


def falado(texto):
    import re
    texto = re.sub(r'\s*\.\.\.\s*(?=\[\[)', ' ', texto)
    tokens, _ = bt.parse(texto)
    return tokens, ' '.join(bt.spoken(t) for t in tokens)


def main():
    base, antigo, novo = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
    ta, fa = falado(antigo)
    tn, fn = falado(novo)
    i = 0
    while i < len(tn) and tn[i] == ta[i]:
        i += 1
    j = 0
    while j < len(tn) - i and tn[-1 - j] == ta[-1 - j]:
        j += 1
    ini, fim = i, len(ta) - j  # tokens [ini, fim) do antigo saem
    assert ta[:ini] + ta[fim:] == tn, 'o texto novo não é o antigo sem um trecho contínuo'
    d = json.loads(base.with_suffix('.words.json').read_text())
    starts, ends = bt.align(ta, d['words'])
    t0 = ends[ini - 1] + 0.12 if ini > 0 else 0.0
    t1 = starts[fim] - 0.05 if fim < len(ta) else d['dur']
    corte = t1 - t0
    mp3 = base.with_suffix('.mp3')
    tmp = base.with_suffix('.tmp.mp3')
    filtro = f"[0:a]atrim=0:{t0:.3f},asetpts=N/SR/TB[a];[0:a]atrim={t1:.3f},asetpts=N/SR/TB[b];[a][b]concat=n=2:v=0:a=1[o]" if fim < len(ta) else f"[0:a]atrim=0:{t0:.3f}[o]"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-filter_complex', filtro, '-map', '[o]', '-c:a', 'libmp3lame', '-q:a', '2', tmp], check=True)
    tmp.replace(mp3)
    words = []
    for w in d['words']:
        if w['start'] < t0 - 0.01:
            words.append(w)
        elif w['start'] >= t1 - 0.06:
            words.append(dict(w, start=round(w['start'] - corte, 3), end=round(w['end'] - corte, 3)))
    h = hashlib.sha1(json.dumps([fn, au.NARRADOR, au.MODELO, au.AJUSTES]).encode()).hexdigest()
    base.with_suffix('.words.json').write_text(json.dumps({'hash': h, 'words': words, 'dur': round(d['dur'] - corte, 3)}, ensure_ascii=False))
    print(f'{base.name}: cortei {corte:.2f}s ({" ".join(ta[ini:fim])})')


if __name__ == '__main__':
    main()
