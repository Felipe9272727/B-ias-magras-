"""Join verified cloud frame ranges, mix the original music, upscale and verify."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import shutil

ROOT=Path(__file__).resolve().parents[2]
def audio_sha(path):
    proc=subprocess.Popen(['ffmpeg','-v','error','-i',str(path),'-map','0:a:0','-c:a','copy','-f','adts','-'],stdout=subprocess.PIPE)
    digest=hashlib.sha256()
    for chunk in iter(lambda:proc.stdout.read(1024*1024),b''):digest.update(chunk)
    assert proc.wait()==0
    return digest.hexdigest()

def main():
    p=argparse.ArgumentParser();p.add_argument('--parts',type=Path,required=True);p.add_argument('--out',type=Path,required=True);p.add_argument('--audio-from',type=Path);p.add_argument('--audio-sha256');args=p.parse_args();args.out.mkdir(parents=True,exist_ok=True)
    timeline=ROOT/'video/remotion/public/timeline_lobo_ep2.json';data=json.loads(timeline.read_text());sha=hashlib.sha256(timeline.read_bytes()).hexdigest()
    parts=sorted((json.loads(f.read_text()) for f in args.parts.glob('part_*.json')),key=lambda x:x['index']);assert len(parts)==16
    next_frame=0
    for i,x in enumerate(parts):
        assert x['index']==i and x['count']==16 and x['startFrame']==next_frame and x['timelineSha256']==sha
        assert hashlib.sha256((args.parts/x['file']).read_bytes()).hexdigest()==x['sha256']
        next_frame=x['endFrame']+1
    assert next_frame==data['durationInFrames']
    listing=args.out/'concat.txt';listing.write_text(''.join(f"file '{(args.parts/x['file']).resolve()}'\n" for x in parts))
    raw=args.out/'wolvesville_ep2_joined_540.mkv';mixed=args.out/'wolvesville_ep2_mix_540.mp4';final=args.out/'wolvesville_ep2_1080p.mp4'
    subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(listing),'-c','copy',str(raw)],check=True)
    preserved_audio=None
    if args.audio_from:
        assert args.audio_sha256 and all(x.get('dimensions')==[1920,1080] for x in parts)
        assert audio_sha(args.audio_from)==args.audio_sha256
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-i',str(args.audio_from),'-map','0:v:0','-map','1:a:0','-c','copy','-movflags','+faststart','-shortest',str(final)],check=True)
        preserved_audio=audio_sha(final)
        assert preserved_audio==args.audio_sha256
    else:
        subprocess.run([sys.executable,str(ROOT/'video/scripts/mix_audio.py'),str(raw),str(mixed),'--timeline',str(timeline),'--roteiro','roteiro_lobo_ep2'],check=True)
        if all(x.get('dimensions')==[1920,1080] for x in parts):
            shutil.copyfile(mixed,final)
        else:
            subprocess.run(['ffmpeg','-v','warning','-y','-i',str(mixed),'-vf','scale=1920:1080:flags=lanczos','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',str(final)],check=True)
    report=args.out/'verified_export_ep2.json'
    subprocess.run([sys.executable,str(ROOT/'video/scripts/verify_wolvesville_ep2.py'),str(final),'--report',str(report),'--decode'],check=True)
    (args.out/'cloud_assembly.json').write_text(json.dumps({'frameRangesAreContiguous':True,'totalFrames':next_frame,'timelineSha256':sha,'parts':parts,'preservedOriginalMixedAudioSha256':preserved_audio,'mechanicalVerification':json.loads(report.read_text())},indent=2))
if __name__=='__main__':main()
