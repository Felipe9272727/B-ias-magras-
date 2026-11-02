"""Preserve original speech, replace diagnosed hard cuts, and add quiet edge handles.

Only the 27 explicitly receipted takes and the requested outro are new speech.
No game or inference code is invoked. Original media and timeline stay intact.
"""
import concurrent.futures
import difflib
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import unicodedata
import numpy as np

ROOT=Path(__file__).resolve().parents[2];PUBLIC=ROOT/'video/remotion/public';VOICE=PUBLIC/'voice_lobo_ep2';REV=VOICE/'audio_revision';OUT=REV/'scenes';OUT.mkdir(exist_ok=True)
sys.path.insert(0,str(ROOT/'video/scripts'))
import build_timeline_lobo as b

def norm(x):
    s=re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',x.lower()).encode('ascii','ignore').decode())
    return {'zero':'0','um':'1','uma':'1','dois':'2','duas':'2','tres':'3','quatro':'4','cinco':'5','seis':'6','sete':'7','oito':'8','nove':'9','dez':'10','onze':'11','doze':'12','treze':'13','catorze':'14','quatorze':'14','quinze':'15','dezesseis':'16'}.get(s,s)
jobs=json.loads((VOICE/'jobs.json').read_text());retakes={j['id']:j for j in json.loads((REV/'retake_jobs.json').read_text())}
ranges={r['id']:r for r in json.loads((REV/'asr_reference_ranges.json').read_text())}
transcript=json.loads((REV/'retakes_words.json').read_text())['words']
receipts={r['jobId']:r for r in json.loads((REV/'generation_receipts.json').read_text())}
outro_request=json.loads((REV/'outro_request.json').read_text());outro=re.sub(r'\[[^\]]+\]\s*','',outro_request['prompt']).strip()
outro_tokens,_=b.bt.parse(outro);outro_spoken=' '.join(b.bt.spoken(t)for t in outro_tokens)
for j in jobs:
    if j['id']=='ep2p723':
        j['text']=outro_spoken;j['hash']=hashlib.sha1(json.dumps([outro_spoken,j['voiceId'],b.MODELO,b.AJUSTES]).encode()).hexdigest()

def align(j,duration):
    r=ranges[j['id']];actual=[w for w in transcript if w.get('type','word')=='word' and r['start']<=(w['start']+w['end'])/2<r['end']]
    expected=j['text'].split();a=[norm(t)for t in expected];z=[norm(w['text'])for w in actual]
    matcher=difflib.SequenceMatcher(None,a,z,autojunk=False);anchors={}
    for block in matcher.get_matching_blocks():
        for k in range(block.size):anchors[block.a+k]=actual[block.b+k]
    if matcher.ratio()<.85:raise RuntimeError(f'ASR needs review for {j["id"]}: {matcher.ratio():.3f}; '+ ' '.join(w['text']for w in actual))
    if len(expected)-1 not in anchors:raise RuntimeError('Last word not verified in actual audio: '+j['id']+' / '+' '.join(w['text']for w in actual[-8:]))
    words=[];indices=sorted(anchors)
    for k,t in enumerate(expected):
        if k in anchors:s,e=anchors[k]['start']-r['start'],anchors[k]['end']-r['start']
        else:
            before=max((i for i in indices if i<k),default=-1);after=min((i for i in indices if i>k),default=len(expected))
            left=anchors[before]['end']-r['start']if before>=0 else 0;right=anchors[after]['start']-r['start']if after<len(expected)else duration
            s=left+(right-left)*(k-before-1)/(after-before-1);e=left+(right-left)*(k-before)/(after-before-1)
        words.append({'word':t,'start':max(0,s),'end':min(duration,max(s,e))})
    return words,matcher.ratio()

def repair(j):
    new=j['id']in retakes or j['id']=='ep2p723'
    source=REV/'outro_raw.mp3'if j['id']=='ep2p723'else REV/'raw'/(j['id']+'.mp3')if new else VOICE/'scenes'/(j['id']+'.mp3')
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(source),'-ar','48000','-ac','2','-f','f32le','-'])
    a=np.frombuffer(raw,dtype='<f4').reshape(-1,2).copy();physical_duration=len(a)/48000
    if new:words,ratio=align(j,physical_duration)
    else:
        old=json.loads((VOICE/'scenes'/(j['id']+'.words.json')).read_text());words=old['words'];ratio=None
    if new:
        # Find the final audible release from the waveform, never cut at ASR end.
        mono=np.mean(a,axis=1);block=480;count=len(mono)//block
        rms=np.sqrt(np.mean(mono[:count*block].reshape(count,block)**2,axis=1));active=np.flatnonzero(rms>10**(-50/20))
        active_end=(int(active[-1])+1)*.01 if len(active)else 0
        keep=min(physical_duration,max(active_end+.20,words[-1]['end']+.18));a=a[:round(keep*48000)]
    else:keep=physical_duration
    n=min(144,len(a));a[:n]*=np.linspace(0,1,n)[:,None]
    n=min(384,len(a));a[-n:]*=np.linspace(1,0,n)[:,None]
    pad=max(.12,words[-1]['end']-len(a)/48000+.18)
    a=np.concatenate([a,np.zeros((round(pad*48000),2),dtype=np.float32)])
    file=OUT/(j['id']+'.mp3')
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar','48000','-ac','2','-i','pipe:0','-c:a','libmp3lame','-b:a','192k',str(file)],input=a.astype('<f4').tobytes(),check=True)
    duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(file)]))
    data={'hash':j['hash'],'words':words,'dur':duration,'audioRevision':{'newTake':new,'originalFile':str(source.relative_to(PUBLIC)),'originalSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'keptSourceSeconds':keep,'fadeInMs':3,'fadeOutMs':8,'quietHandleMs':round(pad*1000,3),'alignmentRatio':ratio,'lastWordVerified':True if new else 'original cached alignment','generationId':receipts.get(j['id'],{}).get('generationId')}}
    file.with_suffix('.words.json').write_text(json.dumps(data,ensure_ascii=False)+'\n')
    return {'id':j['id'],'newTake':new,'duration':duration,'decodedDuration':len(a)/48000,'lastWordEnd':words[-1]['end'],'tailAfterLastWord':len(a)/48000-words[-1]['end'],'alignmentRatio':ratio,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()}

with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:rows=list(pool.map(repair,jobs))
assert len(rows)==163 and sum(r['newTake']for r in rows)==28
report={'newCharacterOrNarrationTakes':27,'newOutro':1,'existingTakesReused':135,'clips':rows,'openingAudioChanged':False,'minimumTailAfterLastWord':min(r['tailAfterLastWord']for r in rows)}
(REV/'prepared_manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items()if k!='clips'}))
