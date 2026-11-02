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
    p=argparse.ArgumentParser();p.add_argument('--index',type=int,required=True);p.add_argument('--count',type=int,default=16);p.add_argument('--out',type=Path,required=True);p.add_argument('--scale',type=float,choices=[0.5,1],default=0.5);p.add_argument('--crf',type=int,default=18);p.add_argument('--timeline',default='video/remotion/public/timeline_lobo_ep2.json');p.add_argument('--entry',default='src/lobisomem/Episodio2.tsx');p.add_argument('--composition',default='LobisomemEp2');args=p.parse_args()
    timeline=ROOT/args.timeline;data=json.loads(timeline.read_text());total=data['durationInFrames'];fps=data['fps']
    assert 0<=args.index<args.count and data['data']['completedActualMatches']==3
    start=total*args.index//args.count;end=total*(args.index+1)//args.count-1
    args.out.mkdir(parents=True,exist_ok=True);file=(args.out/f'part_{args.index:02d}.mkv').resolve()
    browser=shutil.which('google-chrome') or shutil.which('chromium');assert browser
    cmd=['npx','remotion','render',args.entry,args.composition,str(file),f'--frames={start}-{end}',f'--scale={args.scale}','--concurrency=2',f'--browser-executable={browser}','--codec=h264-mkv','--audio-codec=pcm-16','--sample-rate=48000',f'--crf={args.crf}','--x264-preset=veryfast','--log=info']
    subprocess.run(cmd,cwd=ROOT/'video/remotion',check=True)
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(file)]))
    v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
    dimensions=[round(1920*args.scale),round(1080*args.scale)]
    assert int(v['nb_read_frames'])==end-start+1 and [v['width'],v['height']]==dimensions
    assert a['codec_name']=='pcm_s16le' and int(a['sample_rate'])==48000
    report={'index':args.index,'count':args.count,'startFrame':start,'endFrame':end,'frames':end-start+1,'fps':fps,'file':file.name,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'timelineSha256':hashlib.sha256(timeline.read_bytes()).hexdigest(),'commit':os.environ.get('GITHUB_SHA'),'audioCodec':a['codec_name'],'sampleRate':48000,'dimensions':dimensions,'nativeResolution':args.scale==1,'crf':args.crf}
    file.with_suffix('.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
if __name__=='__main__':main()
