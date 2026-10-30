"""Recompõe uma parte do vídeo com gameplay real e valida os quadros exportados.

Uso: python render_minecraft_real.py REPO CLIPES BUNDLE SAIDA BROWSER PARTE
O bundle é gerado uma vez com Remotion bundle src/minecraft/RealEntry.tsx.
"""
import sys, json, shutil, subprocess, os
from pathlib import Path

repo, clips, bundle, output, browser = map(lambda x:Path(x).resolve(),sys.argv[1:6])
part=int(sys.argv[6]);length=9000
remotion=repo/'video/remotion'
data=json.loads((remotion/'public/mc/video/abertura.json').read_text())
data['pasta']='mc/video_real'
total=sum(c['dur'] for c in data['cenas'])
begin=part*length;end=min(total,(part+1)*length)
if begin>=total:raise ValueError('Parte fora do vídeo')
at=0;required=[]
for c in data['cenas']:
    meta=clips/(c['id']+'.captura.json')
    if meta.exists():
        m=json.loads(meta.read_text())
        c['visual']['camera']=m['modo']+':'+c['visual']['camera'].split(':',1)[1]
    if c['visual']['tipo']=='replay' and at<end and at+c['dur']>begin:required.append(c['id'])
    at+=c['dur']
pub=bundle/'public/mc/video_real';pub.mkdir(exist_ok=True,parents=True)
for name in required:
    src=clips/(name+'.mp4')
    info=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_entries','format=duration:stream=nb_read_frames','-of','json',str(src)]))
    if int(info['streams'][0]['nb_read_frames'])!=round(float(info['format']['duration'])*30):raise ValueError('Captura incompleta: '+name)
    with src.open('rb') as source,(pub/src.name).open('wb') as target:
        shutil.copyfileobj(source,target,1024*1024);target.flush();os.fsync(target.fileno())
(pub/'abertura.json').write_text(json.dumps(data,ensure_ascii=False))
output.mkdir(parents=True,exist_ok=True)
temp=output/f'parte_{part}.partial.mp4';dest=output/f'parte_{part}.mp4'
cmd=['node','--require',str(repo/'video/scripts/remotion_local.cjs'),str(remotion/'node_modules/@remotion/cli/remotion-cli.js'),'render',str(bundle),'MinecraftReal',str(temp),f'--frames={begin}-{end-1}','--scale=0.5','--concurrency=2','--crf=18','--muted','--offthreadvideo-cache-size-in-bytes=268435456','--offthreadvideo-video-threads=1',f'--browser-executable={browser}','--log=error']
subprocess.run(cmd,cwd=remotion,check=True)
with temp.open('rb+') as f:os.fsync(f.fileno())
info=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_entries','format=duration:stream=nb_read_frames','-of','json',str(temp)]))
if int(info['streams'][0]['nb_read_frames'])!=end-begin:raise ValueError('Parte incompleta')
temp.replace(dest)
dest.with_suffix('.json').write_text(json.dumps({'parte':part,'de':begin,'ate':end-1,'quadros':end-begin,'clipes':required,'bytes':dest.stat().st_size},indent=2))
print('Parte validada:',dest,flush=True)
