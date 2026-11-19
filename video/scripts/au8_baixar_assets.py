#!/usr/bin/env python3
"""Baixa automaticamente os GIFs de meme (catalog.json) e trilhas Kevin MacLeod (music.json)
usados em timeline_au8.json que não estão versionados no git.
Uso (de video/remotion): python3 ../scripts/au8_baixar_assets.py [--gifs] [--music]
"""
import json
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

PUB = Path('public')
args = set(sys.argv[1:]) or {'--gifs', '--music'}
tl = json.loads((PUB / 'timeline_au8.json').read_text())

HEADERS = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'}

def download(url: str, dest: Path) -> None:
    last_err = None
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as r:
                data = r.read()
            if len(data) < 512:
                raise RuntimeError(f'arquivo muito pequeno ({len(data)} bytes)')
            dest.write_bytes(data)
            return
        except Exception as e:
            last_err = e
    raise RuntimeError(f'falha ao baixar {url}: {last_err}')

if '--gifs' in args:
    cat = {m['id']: m for m in json.loads((PUB / 'gifs/catalog.json').read_text())}
    needed = {}
    for c in tl['cenas']:
        for o in c.get('over', []):
            if o.get('tipo') == 'meme':
                needed[o['id']] = o['info']['file']
    for mid, fname in sorted(needed.items()):
        dest = PUB / 'gifs' / fname
        if dest.exists() and dest.stat().st_size > 512 and dest.read_bytes()[:4] == b'GIF8':
            continue
        meta = cat.get(mid)
        if not meta or not meta.get('media_url'):
            raise SystemExit(f'GIF sem media_url no catalog.json: {mid}')
        url = meta['media_url']
        with tempfile.NamedTemporaryFile(delete=False) as tf:
            tmp = Path(tf.name)
        try:
            download(url, tmp)
            magic = tmp.read_bytes()[:4]
            if magic == b'GIF8':
                shutil.move(str(tmp), str(dest))
            else:
                subprocess.run(
                    ['ffmpeg', '-v', 'error', '-y', '-i', str(tmp),
                     '-vf', 'fps=15,scale=360:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
                     str(dest)],
                    check=True,
                )
                tmp.unlink(missing_ok=True)
            print(f'GIF OK: {fname} ({dest.stat().st_size // 1024} KB)')
        except Exception:
            tmp.unlink(missing_ok=True)
            raise

if '--music' in args:
    info = {m['id']: m for m in json.loads((PUB / 'music/music.json').read_text())}
    needed_m = set()
    for c in tl['cenas']:
        if c.get('musica'):
            needed_m.add(c['musica'])
    if not needed_m:
        needed_m.add('sneaky-snitch')
    for mid in sorted(needed_m):
        dest = PUB / 'music' / f'{mid}.mp3'
        if dest.exists() and dest.stat().st_size > 10_000:
            continue
        meta = info.get(mid) or {}
        candidates = []
        if meta.get('media_url'):
            candidates.append(meta['media_url'])
        title = meta.get('title', mid.replace('-', ' ').title())
        from urllib.parse import quote
        base = 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/'
        candidates.extend([
            base + quote(title + '.mp3'),
            base + quote(title.replace(' faster', ' (faster version)') + '.mp3'),
            base + quote(title + ' A.mp3'),
        ])
        ok = False
        last_e = None
        for url in candidates:
            try:
                download(url, dest)
                ok = True
                break
            except Exception as e:
                last_e = e
        if not ok:
            raise SystemExit(f'Falha ao baixar música {mid}: {last_e}')
        print(f'MUSIC OK: {mid}.mp3 ({dest.stat().st_size // 1024} KB)')

print('ASSETS_AU8_PRONTOS')
