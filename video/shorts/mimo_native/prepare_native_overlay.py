"""Prepare the approved transparent editorial layer for the native capture."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from PIL import Image, ImageDraw


def main():
    ap = argparse.ArgumentParser(__doc__)
    ap.add_argument('--project', type=Path, required=True)
    ap.add_argument('--output', type=Path, required=True)
    args = ap.parse_args()
    root = args.project.resolve()
    sys.path.insert(0, str(root))
    import reframe_vertical as edition
    data = json.loads((root / 'roteiro_timeline.json').read_text())
    old = edition.load('contexto_mimo')
    meme = old[-1].crop((656, 97, 938, 378)).resize((235, 235)).convert('RGBA')
    del old
    work = Path(tempfile.mkdtemp(prefix='mimo_native_overlay_'))
    out = work / 'native-overlay.mov'
    enc = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo',
        '-pix_fmt', 'rgba', '-s', '1080x1920', '-r', '30', '-i', '-', '-an',
        '-c:v', 'qtrle', '-pix_fmt', 'argb', '-threads', '2', str(out)], stdin=subprocess.PIPE)
    n = 0
    for block in data['blocks']:
        for f in range(block['frames']):
            frame = edition.overlay(block, f, meme).copy()
            draw = ImageDraw.Draw(frame)
            draw.rectangle((0, 1274, int(720 * n / data['frames']), 1279), fill='#ffda43')
            frame = frame.resize((1080, 1920), Image.Resampling.LANCZOS)
            enc.stdin.write(frame.tobytes())
            n += 1
        print('Overlay prepared:', block['id'], flush=True)
    enc.stdin.close()
    assert enc.wait() == 0 and n == 2201
    args.output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(out, args.output)


if __name__ == '__main__':
    main()
