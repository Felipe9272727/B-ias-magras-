"""Export the upscaled native portrait Short with the approved audio packets."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile


def audio_hash(path):
    return subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(path),
        '-map', '0:a:0', '-c', 'copy', '-f', 'hash', '-hash', 'sha256', '-'], text=True).strip()


def main():
    ap = argparse.ArgumentParser(__doc__)
    for name in ('upscaled', 'overlay', 'audio', 'output'):
        ap.add_argument('--' + name, type=Path, required=True)
    args = ap.parse_args()
    work = Path(tempfile.mkdtemp(prefix='mimo_native_export_'))
    out = work / args.output.name
    meta = json.loads(subprocess.check_output(['ffprobe', '-v', 'error',
        '-show_streams', '-of', 'json', str(args.upscaled)]))
    source = next(s for s in meta['streams'] if s['codec_type'] == 'video')
    assert source['width'] >= 1080 and source['height'] > source['width']
    subprocess.run(['ffmpeg', '-y', '-v', 'warning', '-i', str(args.upscaled),
        '-i', str(args.overlay), '-i', str(args.audio), '-filter_complex',
        '[0:v]scale=1080:1920:flags=lanczos,setsar=1[game];'
        '[game][1:v]overlay=0:0:shortest=1,format=yuv420p[video]',
        '-map', '[video]', '-map', '2:a:0', '-frames:v', '2201', '-r', '30',
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-threads', '2',
        '-c:a', 'copy', '-movflags', '+faststart', str(out)], check=True)
    decoded = json.loads(subprocess.check_output(['ffprobe', '-v', 'error',
        '-count_frames', '-show_streams', '-of', 'json', str(out)]))
    video = next(s for s in decoded['streams'] if s['codec_type'] == 'video')
    assert (video['width'], video['height'], int(video['nb_read_frames'])) == (1080, 1920, 2201)
    expected = audio_hash(args.audio)
    assert audio_hash(out) == expected
    subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(out), '-f', 'null', '-'], check=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(out, args.output)
    report = {'frames': 2201, 'seconds': 2201 / 30, 'width': 1080, 'height': 1920,
        'fps': 30, 'audio_hash': expected, 'upscale': 'Topaz Video Upscale v2 / Proteus Natural / 2x',
        'sha256': hashlib.sha256(out.read_bytes()).hexdigest(), 'bytes': out.stat().st_size}
    args.output.with_suffix('.validation.json').write_text(json.dumps(report, indent=2))
    print(json.dumps(report), flush=True)


if __name__ == '__main__':
    main()
