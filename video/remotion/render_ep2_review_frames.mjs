import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderFrames} from '@remotion/renderer';

const root=process.cwd();
const out=path.resolve(root,'../../ci_artifacts/wolves-ep2/review_frames');
fs.mkdirSync(out,{recursive:true});
const timelineFile=path.join(root,'public/timeline_lobo_ep2.json');
const timeline=JSON.parse(fs.readFileSync(timelineFile,'utf8'));
const duration=timeline.durationInFrames/timeline.fps;
const blocks=[];const names=new Map();
for(let start=0;start<duration;start+=30){
 const end=Math.min(duration,start+30);
 const frames=[start+(end-start)/6,start+2*(end-start)/3].map((t,i)=>{
  const frame=Math.min(timeline.durationInFrames-1,Math.round(t*timeline.fps));
  const file=`frame_${String(start).padStart(4,'0')}_${i}.jpg`;
  names.set(frame,file);return {frame,seconds:frame/timeline.fps,file};
 });
 blocks.push({start,end,frames});
}
const serveUrl=await bundle({entryPoint:path.join(root,'src/lobisomem/Episodio2.tsx')});
const composition=await selectComposition({serveUrl,id:'LobisomemEp2',browserExecutable:'/usr/bin/chromium',inputProps:{},logLevel:'error'});
await renderFrames({serveUrl,composition,inputProps:composition.props,frames:[...names.keys()],outputDir:null,imageFormat:'jpeg',jpegQuality:72,scale:.5,concurrency:2,browserExecutable:'/usr/bin/chromium',muted:true,logLevel:'error',onStart:()=>{},onFrameUpdate:(n)=>{if(n%20===0)process.stdout.write(`Reviewed-frame render ${n}/${names.size}\n`);},onFrameBuffer:async(buffer,frame)=>{fs.writeFileSync(path.join(out,names.get(frame)),buffer);}});
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
for(const b of blocks)for(const f of b.frames)f.sha256=sha(path.join(out,f.file));
fs.writeFileSync(path.join(out,'composition_frames.json'),JSON.stringify({kind:'exact_composition_frames_before_encoding',finalEncodedVideoVerified:false,timelineSha256:sha(timelineFile),entrySha256:sha(path.join(root,'src/lobisomem/Episodio2.tsx')),visualSourceSha256:sha(path.join(root,'src/lobisomem/Cenas.tsx')),durationSeconds:duration,blocks},null,2));
console.log(JSON.stringify({actualFramesRendered:names.size,blocks:blocks.length,out}));
