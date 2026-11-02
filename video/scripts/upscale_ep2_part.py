"""Upscale a verified cloud part without re-rendering its frames or audio."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

p=argparse.ArgumentParser();p.add_argument('--input',type=Path,required=True);p.add_argument('--out',type=Path,required=True);args=p.parse_args()
args.out.mkdir(parents=True,exist_ok=True)
meta=json.loads(args.input.with_suffix('.json').read_text());assert hashlib.sha256(args.input.read_bytes()).hexdigest()==meta['sha256']
file=args.out/args.input.name
subprocess.run(['ffmpeg','-v','warning','-y','-i',str(args.input),'-vf','scale=1920:1080:flags=lanczos','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-c:a','copy',str(file)],check=True)
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-of','json',str(file)]));v=next(s for s in probe['streams'] if s['codec_type']=='video');assert int(v['nb_read_frames'])==meta['frames'] and (v['width'],v['height'])==(1920,1080)
meta.update(original540Sha256=meta['sha256'],sha256=hashlib.sha256(file.read_bytes()).hexdigest(),dimensions=[1920,1080],upscale='Lanczos; original lossless PCM copied')
file.with_suffix('.json').write_text(json.dumps(meta,indent=2));print(json.dumps(meta))
