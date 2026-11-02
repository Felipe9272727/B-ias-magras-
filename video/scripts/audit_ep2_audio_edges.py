"""Inspect actual decoded clip tails; never generates speech or changes media."""
import concurrent.futures
import argparse
import json
from pathlib import Path
import subprocess
import numpy as np

ROOT=Path(__file__).resolve().parents[2];PUBLIC=ROOT/'video/remotion/public';VOICE=PUBLIC/'voice_lobo_ep2'
parser=argparse.ArgumentParser();parser.add_argument('--voice-dir',default='voice_lobo_ep2/scenes');parser.add_argument('--out-name',default='clip_edge_audit.json');args=parser.parse_args()
jobs=json.loads((VOICE/'jobs.json').read_text())
def inspect(j):
    base=PUBLIC/args.voice_dir/j['id'];d=json.loads(base.with_suffix('.words.json').read_text())
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(base.with_suffix('.mp3')),'-ac','1','-ar','24000','-f','f32le','-'])
    a=np.frombuffer(raw,dtype='<f4');last=d['words'][-1]['end'] if d['words'] else 0
    def rms(n):return float(20*np.log10(max(1e-10,float(np.sqrt(np.mean(a[-int(n*.001*24000):]**2))))))
    return {'id':j['id'],'speaker':j['speaker'],'textEnd':' '.join(w['word']for w in d['words'])[-100:],'decodedSeconds':len(a)/24000,'lastWordEnd':last,'tailAfterLastWord':len(a)/24000-last,'last20msRmsDbfs':rms(20),'last50msRmsDbfs':rms(50),'lastSampleAmplitude':float(a[-1]),'source':d.get('audioRevision',d.get('source'))}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:rows=list(pool.map(inspect,jobs))
report={'clips':rows,'clipCount':len(rows),'tailsUnder80ms':sum(r['tailAfterLastWord']<.08 for r in rows),'audibleLast20msAboveMinus40Db':sum(r['last20msRmsDbfs']>-40 for r in rows)}
out=ROOT/'ci_artifacts/wolves-ep2/audio_revision';out.mkdir(parents=True,exist_ok=True);(out/args.out_name).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items()if k!='clips'}));print(json.dumps(sorted(rows,key=lambda r:-r['last20msRmsDbfs'])[:12],ensure_ascii=False))
