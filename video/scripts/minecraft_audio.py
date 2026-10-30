"""Export the original Minecraft voice/SFX graph, then reuse mix_audio.py ducking."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import tarfile
import urllib.request

from distributed_pipeline import ROOT, digest, write_json
from distributed_render import browser, download_part

REMOTION = ROOT / 'video/remotion'
MONTAGE = REMOTION / 'public/mc/video/abertura.json'


def inspect_sources():
    data = json.loads(MONTAGE.read_text())
    sources = {item['src'] for scene in data['cenas'] for item in scene['itens']
               if item['tipo'] in ('n', 'chat', 'pensa', 'nota')}
    sources |= {'sfx/' + item['sfx'] + '.mp3' for scene in data['cenas'] for item in scene['itens']
                if item['tipo'] == 'meme' and item.get('sfx')}
    for path in (REMOTION / 'src/minecraft').glob('*.tsx'):
        sources.update(re.findall(r"staticFile\(['\"](sfx/[^'\"]+\.mp3)['\"]\)", path.read_text()))
    sources.add('music/voxel-revolution.mp3')
    missing = [src for src in sorted(sources) if not (REMOTION / 'public' / src).is_file()]
    if missing:
        raise ValueError('Missing original audio sources: ' + ', '.join(missing))
    return data, {src: digest(REMOTION / 'public' / src) for src in sorted(sources)}


def prepare(args):
    work = Path(args.work).resolve()
    work.mkdir(parents=True, exist_ok=True)
    shared = work / 'audio-assets.tar.gz'
    if not shared.exists():
        parts = json.loads((ROOT / 'video/scripts/distributed_asset_parts.json').read_text())
        downloads = work / 'downloads'
        downloads.mkdir(exist_ok=True)
        with ThreadPoolExecutor(max_workers=3) as pool:
            paths = list(pool.map(lambda part: download_part(part, downloads), parts))
        combined = work / 'original-package.tar'
        with combined.open('wb') as target:
            for path in paths:
                with path.open('rb') as source:
                    shutil.copyfileobj(source, target, 1024 * 1024)
        extracted = work / 'extracted'
        extracted.mkdir(exist_ok=True)
        with tarfile.open(combined) as archive:
            for member in archive:
                name = str(PurePosixPath(member.name))
                if member.isfile() and name.startswith(('public/gifs/', 'public/music/', 'public/sfx/')):
                    archive.extract(member, extracted, filter='data')
        with tarfile.open(shared, 'w:gz', compresslevel=1) as archive:
            for name in ('gifs', 'music', 'sfx'):
                folder = extracted / 'public' / name
                if folder.exists():
                    archive.add(folder, arcname='public/' + name)
        combined.unlink()
        shutil.rmtree(extracted)
        shutil.rmtree(downloads)
    # Source-controlled originals take precedence over the fallback package.
    with tarfile.open(shared) as archive:
        for member in archive:
            if member.isfile() and not (REMOTION / member.name).exists():
                archive.extract(member, REMOTION, filter='data')
    music = REMOTION / 'public/music/voxel-revolution.mp3'
    if not music.exists():
        catalog = json.loads((REMOTION / 'public/music/music.json').read_text())
        track = next(item for item in catalog if item['id'] == 'voxel-revolution')
        if not track['media_url'].startswith('https://incompetech.com/'):
            raise ValueError('Expected the original music author URL from the source catalog')
        temp = music.with_name(music.name + '.partial')
        with urllib.request.urlopen(track['media_url'], timeout=120) as response, temp.open('wb') as target:
            shutil.copyfileobj(response, target)
        if abs(float(probe(temp)['format']['duration']) - track['duration_sec']) > .2:
            raise ValueError('Original music catalog duration mismatch')
        temp.replace(music)
    data, sources = inspect_sources()
    write_json(work / 'sources.json', {'scene_count': len(data['cenas']),
        'content_frames': sum(scene['dur'] for scene in data['cenas']), 'source_sha256': sources})
    print(f'Original audio assets checked: {len(sources)} files', flush=True)


def probe(path):
    return json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
        'format=duration:stream=codec_type,sample_rate,channels,codec_name', '-of', 'json', str(path)]))


def render(args):
    work = Path(args.work).resolve()
    work.mkdir(parents=True, exist_ok=True)
    data, sources = inspect_sources()
    total = sum(scene['dur'] for scene in data['cenas'])
    last = min(total, round(args.preview_seconds * 30)) if args.preview_seconds else total
    if last < 1:
        raise ValueError('Audio export needs at least one frame')
    bundle = work / 'bundle'
    cli = REMOTION / 'node_modules/@remotion/cli/remotion-cli.js'
    subprocess.run(['node', str(cli), 'bundle', 'src/minecraft/AudioEntry.tsx', '--out-dir=' + str(bundle)], cwd=REMOTION, check=True)
    stem = work / 'minecraft-voices-effects.wav'
    subprocess.run(['node', '--require', str(ROOT / 'video/scripts/remotion_local.cjs'), str(cli),
        'render', str(bundle), 'MinecraftAudio', str(stem), '--codec=wav', '--audio-codec=pcm-16',
        '--sample-rate=48000', '--frames=0-' + str(last - 1), '--concurrency=2',
        '--offthreadvideo-cache-size-in-bytes=268435456', '--offthreadvideo-video-threads=1',
        '--browser-executable=' + browser(work), '--log=error'], cwd=REMOTION, check=True, timeout=7200)
    info = probe(stem)
    if abs(float(info['format']['duration']) - last / 30) > .002:
        raise ValueError('Voice/SFX stem duration mismatch')
    if len(info['streams']) != 1 or info['streams'][0]['codec_type'] != 'audio':
        raise ValueError('Expected a single original-audio stem')
    write_json(work / 'export.json', {'content_frames': last, 'full_content_frames': total,
        'fps': 30, 'scene_count': len(data['cenas']), 'source_sha256': sources,
        'stem_sha256': digest(stem), 'gameplay_video_required': False})
    shutil.rmtree(bundle)
    print('Original voice/SFX stem exported:', stem, flush=True)


def mix(args):
    work = Path(args.work).resolve()
    output = Path(args.output).resolve()
    output.mkdir(parents=True, exist_ok=True)
    data, sources = inspect_sources()
    exported = json.loads((work / 'export.json').read_text())
    content_frames = exported['content_frames']
    if sources != exported['source_sha256']:
        raise ValueError('Audio sources changed after the original stem export')
    if digest(work / 'minecraft-voices-effects.wav') != exported['stem_sha256']:
        raise ValueError('Original voice/SFX stem changed before mixing')
    total_frames = content_frames + (3 if content_frames == exported['full_content_frames'] else 0)
    scenes, at = [], 0
    for scene in data['cenas']:
        if at >= content_frames:
            break
        duration = min(scene['dur'], content_frames - at)
        scenes.append({'id': scene['id'], 'start': at, 'duration': duration,
                       'visual': {'type': 'component', 'name': 'Minecraft'}})
        at += duration
    timeline = work / 'minecraft-audio-timeline.json'
    write_json(timeline, {'fps': 30, 'durationInFrames': content_frames, 'scenes': scenes})
    reference = work / 'audio-reference.mkv'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'lavfi', '-i', 'color=black:s=16x16:r=30',
        '-i', str(work / 'minecraft-voices-effects.wav'), '-filter_complex', '[1:a]apad=pad_dur=0.1[a]',
        '-map', '0:v', '-map', '[a]', '-t', str(total_frames / 30), '-c:v', 'libx264',
        '-threads', '1', '-preset', 'ultrafast', '-crf', '35', '-c:a', 'pcm_s16le', str(reference)], check=True)
    mixed = work / 'audio-mixed-reference.mp4'
    # Reuse the established mixer. Its compressor, voice/SFX route, normalization,
    # limiter and AAC settings are unchanged; only the Minecraft cue/fades differ.
    subprocess.run(['python', str(ROOT / 'video/scripts/mix_audio.py'), str(reference), str(mixed),
        '--timeline', str(timeline), '--roteiro', str(ROOT / 'video/scripts/minecraft_audio_roteiro.py')], check=True, timeout=7200)
    audio = output / 'minecraft-original-audio-ducked.m4a'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(mixed), '-map', '0:a:0', '-vn',
        '-c:a', 'copy', '-movflags', '+faststart', str(audio)], check=True)
    info = probe(audio)
    if any(stream['codec_type'] != 'audio' for stream in info['streams']):
        raise ValueError('Delivery artifact must contain audio only')
    if abs(float(info['format']['duration']) - total_frames / 30) > .05:
        raise ValueError('Final audio timeline duration mismatch')
    write_json(output / 'minecraft-audio-diagnostics.json', {**exported, 'output_frames': total_frames,
        'tail_padding_frames': total_frames - content_frames, 'duration_seconds': float(info['format']['duration']),
        'audio_sha256': digest(audio), 'music_base_volume': .1, 'music_fade_in_frames': 20,
        'music_fade_out_frames': 40, 'mixer': 'video/scripts/mix_audio.py',
        'sidechaincompress': 'threshold=0.015:ratio=9:attack=25:release=450:makeup=1',
        'loudnorm': 'I=-14:TP=-1.5:LRA=11', 'limiter': 'limit=0.79:level=false',
        'original_voices_and_effects': True, 'original_scene_timing': True})
    print('Original audio mixed with existing ducking:', audio, flush=True)


def main():
    parser = argparse.ArgumentParser(__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    p = commands.add_parser('prepare')
    p.add_argument('--work', required=True)
    p = commands.add_parser('render')
    p.add_argument('--work', required=True)
    p.add_argument('--preview-seconds', type=float, default=0)
    p = commands.add_parser('mix')
    p.add_argument('--work', required=True)
    p.add_argument('--output', required=True)
    args = parser.parse_args()
    {'prepare': prepare, 'render': render, 'mix': mix}[args.command](args)


if __name__ == '__main__':
    main()
