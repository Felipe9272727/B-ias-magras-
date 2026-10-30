"""Shared render assets, bounded Remotion parts and a validated silent final movie."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path, PurePosixPath
import shutil
import subprocess
import tarfile
import time
import urllib.request
import zipfile

from distributed_pipeline import ROOT, digest, write_json


def git_digest(path):
    path = Path(path)
    h = hashlib.sha1(f'blob {path.stat().st_size}\0'.encode())
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def download_part(part, folder):
    path = folder / part['name']
    if path.exists() and path.stat().st_size == part['size'] and git_digest(path) == part['git_sha1']:
        return path
    for attempt in range(3):
        try:
            temp = path.with_name(path.name + '.partial')
            with urllib.request.urlopen(part['url'], timeout=120) as response, temp.open('wb') as stream:
                shutil.copyfileobj(response, stream, 1024 * 1024)
            if temp.stat().st_size != part['size'] or git_digest(temp) != part['git_sha1']:
                raise ValueError('Asset package integrity mismatch: ' + part['name'])
            temp.replace(path)
            return path
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2)


def assets(args):
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    parts = json.loads((ROOT / 'video/scripts/distributed_asset_parts.json').read_text())
    downloads = output / 'downloads'
    downloads.mkdir(exist_ok=True)
    with ThreadPoolExecutor(max_workers=3) as pool:
        paths = list(pool.map(lambda p: download_part(p, downloads), parts))
    combined = output / 'original-assets.tar'
    with combined.open('wb') as target:
        for path in paths:
            with path.open('rb') as source:
                shutil.copyfileobj(source, target, 1024 * 1024)
    extracted = output / 'extracted'
    extracted.mkdir(exist_ok=True)
    with tarfile.open(combined) as archive:
        for member in archive:
            name = str(PurePosixPath(member.name))
            if member.isfile() and name.startswith('public/gifs/'):
                archive.extract(member, extracted, filter='data')
    gifs = list((extracted / 'public/gifs').glob('*.gif'))
    if len(gifs) != 66 or not (extracted / 'public/gifs/catalog.json').is_file():
        raise ValueError(f'Expected original GIF catalog and 66 GIFs; got {len(gifs)}')
    with tarfile.open(output / 'render-assets.tar.gz', 'w:gz', compresslevel=1) as archive:
        archive.add(extracted / 'public/gifs', arcname='public/gifs')
    combined.unlink()
    shutil.rmtree(extracted)
    shutil.rmtree(downloads)
    print('Shared GIF assets verified', flush=True)


def browser(folder):
    for command in ('google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'):
        path = shutil.which(command)
        if path:
            return path
    # Official Chrome for Testing fallback when the runner has no installed Chrome.
    with urllib.request.urlopen('https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json', timeout=120) as response:
        info = json.load(response)
    url = next(x['url'] for x in info['channels']['Stable']['downloads']['chrome-headless-shell'] if x['platform'] == 'linux64')
    archive = folder / 'chrome.zip'
    with urllib.request.urlopen(url, timeout=120) as response, archive.open('wb') as target:
        shutil.copyfileobj(response, target)
    with zipfile.ZipFile(archive) as zipped:
        zipped.extractall(folder)
        for member in zipped.infolist():
            mode = member.external_attr >> 16
            if mode:
                (folder / member.filename).chmod(mode)
    return str(folder / 'chrome-headless-shell-linux64/chrome-headless-shell')


def render(args):
    plan = Path(args.plan).resolve()
    remotion = ROOT / 'video/remotion'
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    with tarfile.open(args.assets) as archive:
        archive.extractall(remotion, filter='data')
    shutil.copy2(plan / 'abertura.json', remotion / 'public/mc/video/abertura.json')
    # UI portraits are the exact recorded players' skins.
    portraits = remotion / 'public/mc_previa/skins'
    portraits.mkdir(parents=True, exist_ok=True)
    for skin in (ROOT / 'minecraft/skins').glob('*.png'):
        shutil.copy2(skin, portraits / skin.name)
    bundle = output / 'bundle'
    cli = remotion / 'node_modules/@remotion/cli/remotion-cli.js'
    subprocess.run(['node', str(cli), 'bundle', 'src/minecraft/RealEntry.tsx', '--out-dir=' + str(bundle)], cwd=remotion, check=True)
    subprocess.run(['python', str(ROOT / 'video/scripts/render_minecraft_real.py'), str(ROOT),
                    str(Path(args.clips).resolve()), str(bundle), str(output), browser(output), str(args.part)], check=True)
    # The bundle duplicates public assets and is not part of the delivery artifact.
    shutil.rmtree(bundle)


def frame_count(path):
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_frames',
                            '-show_entries', 'stream=nb_read_frames', '-of', 'json', str(path)],
                           capture_output=True, text=True, check=True)
    if probe.stderr.strip():
        raise ValueError('Decode errors: ' + probe.stderr)
    return int(json.loads(probe.stdout)['streams'][0]['nb_read_frames'])


def merge(args):
    plan = json.loads(Path(args.plan).read_text())
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    parts = []
    for part in plan['render_parts']:
        matches = list(Path(args.parts).resolve().rglob(f'parte_{part}.mp4'))
        if len(matches) != 1:
            raise ValueError(f'Expected one render part {part}, found {len(matches)}')
        expected = min(9000, plan['frames'] - part * 9000)
        if frame_count(matches[0]) != expected:
            raise ValueError('Incomplete render part: ' + str(part))
        parts.append(matches[0])
    manifest = output / 'concat.txt'
    if any("'" in str(p) or '\n' in str(p) for p in parts):
        raise ValueError('Unsupported concat path')
    manifest.write_text(''.join("file '" + str(p) + "'\n" for p in parts))
    padding = 3 if plan['is_complete_original'] else 0
    movie = output / 'minecraft-real-silent.mp4'
    filters = 'scale=1920:1080:flags=lanczos'
    if padding:
        filters += ',tpad=stop_mode=clone:stop_duration=0.1'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', str(manifest),
                    '-vf', filters, '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21',
                    '-threads', '4', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(movie)], check=True)
    expected = plan['frames'] + padding
    if frame_count(movie) != expected:
        raise ValueError('Final video frame count mismatch')
    write_json(output / 'timeline.json', {'schema': 1, 'mode': plan['mode'], 'frames': expected,
        'fps': 30, 'audio_included': False, 'is_complete_original': plan['is_complete_original'],
        'native_hash': plan['native_hash'], 'plan_hash': plan['plan_hash'], 'sha256': digest(movie),
        'original_audio_mux_required': True, 'tail_padding_frames': padding})
    manifest.unlink()
    print('Validated silent final movie:', movie, flush=True)


def main():
    parser = argparse.ArgumentParser(__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    p = commands.add_parser('assets')
    p.add_argument('--output', required=True)
    p = commands.add_parser('render')
    for key in ('plan', 'assets', 'clips', 'output'):
        p.add_argument('--' + key, required=True)
    p.add_argument('--part', type=int, required=True)
    p = commands.add_parser('merge')
    for key in ('plan', 'parts', 'output'):
        p.add_argument('--' + key, required=True)
    args = parser.parse_args()
    {'assets': assets, 'render': render, 'merge': merge}[args.command](args)


if __name__ == '__main__':
    main()
