#!/usr/bin/env python3
"""Baixa GIFs e músicas dos 3 Shorts Director's Cut que não estão versionados no git.
Uso (de video/remotion): python3 ../scripts/shorts_baixar_assets.py
"""
import json
import shutil
import subprocess
import tempfile
import urllib.request
from pathlib import Path
from urllib.parse import quote

PUB = Path('public')
HEADERS = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'}

NEEDED_GIFS = {
    'homer-panic': 'homer-panic.gif',
    'shocked-krabs': 'shocked-krabs.gif',
    'not-stonks': 'not-stonks.gif',
    'bruh': 'bruh.gif',
    'nazare-confusa': 'nazare-confusa.gif',
    'coffin-dance': 'coffin-dance.gif',
}
NEEDED_MUSIC = ['decisions', 'investigations', 'night-of-chaos']


def download(url: str, dest: Path) -> None:
    last_err = None
    for _ in range(3):
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


cat = {m['id']: m for m in json.loads((PUB / 'gifs/catalog.json').read_text())}
for mid, fname in NEEDED_GIFS.items():
    dest = PUB / 'gifs' / fname
    if dest.exists() and dest.stat().st_size > 512 and dest.read_bytes()[:4] == b'GIF8':
        continue
    meta = cat.get(mid)
    if not meta or not meta.get('media_url'):
        raise SystemExit(f'GIF sem media_url no catalog.json: {mid}')
    with tempfile.NamedTemporaryFile(delete=False) as tf:
        tmp = Path(tf.name)
    try:
        download(meta['media_url'], tmp)
        if tmp.read_bytes()[:4] == b'GIF8':
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

info = {m['id']: m for m in json.loads((PUB / 'music/music.json').read_text())}
for mid in NEEDED_MUSIC:
    dest = PUB / 'music' / f'{mid}.mp3'
    if dest.exists() and dest.stat().st_size > 10_000:
        continue
    meta = info.get(mid) or {}
    candidates = []
    if meta.get('media_url'):
        candidates.append(meta['media_url'])
    title = meta.get('title', mid.replace('-', ' ').title())
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

print('ASSETS_SHORTS_PRONTOS')
