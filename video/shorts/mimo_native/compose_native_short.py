"""Compose the approved Short over native portrait footage after video upscale.

Run beside the recovered project modules or pass --project. No landscape crop
is performed. The approved AAC packets are copied without re-encoding.
"""
import argparse
import hashlib
import importlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

import av
from PIL import Image, ImageDraw


def audio_hash(path):
    return subprocess.check_output([
        'ffmpeg', '-v', 'error', '-i', str(path), '-map', '0:a:0',
        '-c', 'copy', '-f', 'hash', '-hash', 'sha256', '-'
    ], text=True).strip()


def main():
    ap = argparse.ArgumentParser(__doc__)
    ap.add_argument('--project', type=Path, required=True)
    ap.add_argument('--gameplay', type=Path, required=True)
    ap.add_argument('--output', type=Path, required=True)
    args = ap.parse_args()
    project = args.project.resolve()
    sys.path.insert(0, str(project))
    edition = importlib.import_module('reframe_vertical')
    timeline = json.loads((project / 'roteiro_timeline.json').read_text())
    approved = project / 'audio_aprovado.m4a'
    expected_audio = audio_hash(approved)
    work = Path(tempfile.mkdtemp(prefix='mimo_native_final_'))
    silent, output = work / 'silent.mp4', work / 'mimo_short_native_vertical.mp4'
    qa = work / 'review'
    qa.mkdir()
    # Retain the already approved meme insert and the original timed overlays.
    old_context = edition.load('contexto_mimo')
    meme = old_context[-1].crop((656, 97, 938, 378)).resize((235, 235)).convert('RGBA')
    del old_context
    source = av.open(str(args.gameplay))
    stream = source.streams.video[0]
    assert stream.height > stream.width, 'Native portrait source required'
    assert abs(stream.width / stream.height - 9 / 16) < .002
    assert stream.width >= 1080, 'Use the video-upscaled source'
    frames = source.decode(video=0)
    encoder = subprocess.Popen([
        'ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
        '-s', '1080x1920', '-r', '30', '-i', '-', '-an', '-c:v', 'libx264',
        '-preset', 'medium', '-crf', '17', '-threads', '2', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', str(silent)
    ], stdin=subprocess.PIPE)
    total = 0
    try:
        for block in timeline['blocks']:
            for f in range(block['frames']):
                raw = next(frames).to_image().convert('RGBA')
                # Same complete 9:16 viewport. Resize only; never crop.
                raw = raw.resize((1080, 1920), Image.Resampling.LANCZOS)
                layer = edition.overlay(block, f, meme).resize((1080, 1920), Image.Resampling.LANCZOS)
                frame = Image.alpha_composite(raw, layer)
                draw = ImageDraw.Draw(frame)
                draw.rectangle((0, 1911, int(1080 * total / timeline['frames']), 1919), fill='#ffda43')
                if f in (0, block['frames'] // 2, block['frames'] - 1):
                    frame.convert('RGB').save(qa / f'{total:04d}_{block["id"]}.jpg', quality=93)
                encoder.stdin.write(frame.convert('RGB').tobytes())
                total += 1
            print('Composed', block['id'], flush=True)
    finally:
        source.close()
        encoder.stdin.close()
    assert encoder.wait() == 0
    assert total == timeline['frames'] == 2201
    subprocess.run([
        'ffmpeg', '-y', '-v', 'error', '-i', str(silent), '-i', str(approved),
        '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy', '-movflags', '+faststart', str(output)
    ], check=True)
    metadata = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-count_frames', '-show_streams', '-of', 'json', str(output)
    ]))
    video = next(s for s in metadata['streams'] if s['codec_type'] == 'video')
    assert (video['width'], video['height'], int(video['nb_read_frames'])) == (1080, 1920, 2201)
    assert audio_hash(output) == expected_audio
    # Validate the completed /tmp file before moving it into the shared workspace.
    subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(output), '-f', 'null', '-'], check=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(output, args.output)
    shutil.copytree(qa, args.output.parent / 'native_review', dirs_exist_ok=True)
    report = {'frames': total, 'resolution': '1080x1920', 'audio_hash': expected_audio,
              'sha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'source': 'native portrait + video upscale'}
    args.output.with_suffix('.validation.json').write_text(json.dumps(report, indent=2))
    print('Exported', args.output, flush=True)


if __name__ == '__main__':
    main()
