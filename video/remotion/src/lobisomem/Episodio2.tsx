// Usa os componentes, legendas, memes e transições do próprio canal.
import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Composition,continueRender,delayRender,registerRoot,Sequence,staticFile,useCurrentFrame,type CalculateMetadataFunction} from 'remotion';
import type {Scene,Timeline} from '../types';
import {fontsReady} from '../fonts';
import {Captions,MemeCard,TextPop} from '../components/overlays';
import {LOBVisual} from './Cenas';
import {escolherTransicaoLobo,TransicaoLobo} from './Transicoes';
import {AberturaEp2} from './AberturaEp2';

const Cena:React.FC<{scene:Scene;timeline:Timeline;anterior?:string}>=({scene,timeline,anterior})=>{
 const f=useCurrentFrame();
 if(scene.visual.type!=='component')throw new Error('EP2 requer uma cena editorial explícita');
 const name=scene.visual.name;
 if(name==='EP2AberturaRecuperada')return <AberturaEp2 preview={false}/>;
 let bump=0,flash=0;
 for(const e of scene.events)if(e.type==='punch'){
  const d=f-e.at;if(d>=0&&d<24){bump+=.08*Math.exp(-d/5);flash=Math.max(flash,.45*Math.exp(-d/2.5))}
 }
 return <AbsoluteFill style={{background:'#0f2433'}}>
  <AbsoluteFill style={{transform:`scale(${1+bump})`}}><LOBVisual name={name} props={scene.visual.props??{}} scene={scene} timeline={timeline}/></AbsoluteFill>
  {flash>.01&&<AbsoluteFill style={{background:'#fff',opacity:flash}}/>}
  {scene.events.map((e,i)=>{
   if(e.type==='meme'&&timeline.memes[e.id])return <Sequence key={i} from={e.at} durationInFrames={e.dur}><MemeCard info={timeline.memes[e.id]} dur={e.dur} pos={e.pos} caption={e.caption}/></Sequence>;
   if(e.type==='txt')return <Sequence key={i} from={e.at} durationInFrames={e.dur}><TextPop text={e.text} dur={e.dur} color={e.color}/></Sequence>;
   if(e.type==='voz')return <Sequence key={i} from={e.at}><Audio src={staticFile(e.src)}/></Sequence>;
   if(e.type==='sfx')return <Sequence key={i} from={e.at}><Audio src={staticFile(e.file?.includes('/')?e.file:`sfx/${e.file??e.id+'.wav'}`)} volume={e.vol??.3}/></Sequence>;
   return null;
  })}
  {!!scene.capGroups?.length&&<Captions groups={scene.capGroups} bottom={10}/>}
  {scene.audio&&<Sequence from={scene.audioOffset}><Audio src={staticFile(scene.audio)}/></Sequence>}
  <TransicaoLobo tipo={escolherTransicaoLobo(anterior,name)}/>
 </AbsoluteFill>;
};
type Props={timeline:Timeline|null};
const Video:React.FC<Props>=({timeline})=>{
 const[h]=useState(()=>delayRender('fontes do canal'));
 useEffect(()=>{fontsReady.then(()=>continueRender(h)).catch(()=>continueRender(h))},[h]);
 if(!timeline)return null;
 return <AbsoluteFill>{timeline.scenes.map((s,i)=><Sequence key={s.id} from={s.start} durationInFrames={s.duration}><Cena scene={s} timeline={timeline} anterior={i&&timeline.scenes[i-1].visual.type==='component'?(timeline.scenes[i-1].visual as {name:string}).name:undefined}/></Sequence>)}</AbsoluteFill>;
};
const metadata:CalculateMetadataFunction<Props>=async()=>{
 const r=await fetch(staticFile('timeline_lobo_ep2.json'));if(!r.ok)throw new Error('Timeline real do EP2 ainda não construída');
 const timeline=await r.json() as Timeline;
 if((timeline.data as {completedActualMatches?:number}).completedActualMatches!==4)throw new Error('O episódio final exige quatro partidas reais concluídas');
 return {durationInFrames:timeline.durationInFrames,props:{timeline}};
};
registerRoot(()=> <Composition id="LobisomemEp2" component={Video} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{timeline:null}} calculateMetadata={metadata}/>);
