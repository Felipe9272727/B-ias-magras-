"""Extract two real encoded-video frames per 30-second review block."""
import argparse
import concurrent.futures
import hashlib
import json
from pathlib import Path
import subprocess

p=argparse.ArgumentParser();p.add_argument('video',type=Path);p.add_argument('--out',type=Path,required=True);args=p.parse_args();args.out.mkdir(parents=True,exist_ok=True)
duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(args.video)]))
blocks=[]
for start in range(0,int(duration+.999),30):
    end=min(start+30,duration);frames=[]
    for index,t in enumerate([start+(end-start)/6,start+2*(end-start)/3]):
        frames.append({'seconds':t,'file':f'frame_{start:04d}_{index}.jpg'})
    blocks.append({'start':start,'end':end,'frames':frames})
def extract(frame):
    file=args.out/frame['file']
    subprocess.run(['ffmpeg','-v','error','-y','-threads','1','-ss',str(frame['seconds']),'-i',str(args.video),'-frames:v','1','-vf','scale=960:540','-q:v','4','-threads','1',str(file)],check=True)
    frame['sha256']=hashlib.sha256(file.read_bytes()).hexdigest()
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(extract,[f for b in blocks for f in b['frames']]))
(args.out/'encoded_review_frames.json').write_text(json.dumps({'source':'actual_encoded_video','durationSeconds':duration,'blocks':blocks},indent=2)+'\n')
print(json.dumps({'actualEncodedFrames':sum(len(b['frames']) for b in blocks),'blocks':len(blocks)}))
