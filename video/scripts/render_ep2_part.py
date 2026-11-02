"""Render one exact frame range with lossless audio for parallel cloud assembly."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import os

ROOT=Path(__file__).resolve().parents[2]
def main():
    p=argparse.ArgumentParser();p.add_argument('--index',type=int,required=True);p.add_argument('--count',type=int,default=16);p.add_argument('--out',type=Path,required=True);args=p.parse_args()
    timeline=ROOT/'video/remotion/public/timeline_lobo_ep2.json';data=json.loads(timeline.read_text());total=data['durationInFrames'];fps=data['fps']
    assert 0<=args.index<args.count and data['data']['completedActualMatches']==3
    start=total*args.index//args.count;end=total*(args.index+1)//args.count-1
    args.out.mkdir(parents=True,exist_ok=True);file=(args.out/f'part_{args.index:02d}.mkv').resolve()
    browser=shutil.which('google-chrome') or shutil.which('chromium');assert browser
    cmd=['npx','remotion','render','src/lobisomem/Episodio2.tsx','LobisomemEp2',str(file),f'--frames={start}-{end}','--scale=0.5','--concurrency=2',f'--browser-executable={browser}','--codec=h264-mkv','--audio-codec=pcm-16','--sample-rate=48000','--crf=18','--x264-preset=veryfast','--log=info']
    subprocess.run(cmd,cwd=ROOT/'video/remotion',check=True)
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(file)]))
    v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
    assert int(v['nb_read_frames'])==end-start+1 and (v['width'],v['height'])==(960,540)
    assert a['codec_name']=='pcm_s16le' and int(a['sample_rate'])==48000
    report={'index':args.index,'count':args.count,'startFrame':start,'endFrame':end,'frames':end-start+1,'fps':fps,'file':file.name,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'timelineSha256':hashlib.sha256(timeline.read_bytes()).hexdigest(),'commit':os.environ.get('GITHUB_SHA'),'audioCodec':a['codec_name'],'sampleRate':48000,'dimensions':[960,540]}
    file.with_suffix('.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
if __name__=='__main__':main()
