import React,{useEffect,useState} from 'react';
import {registerRoot,Composition,AbsoluteFill,delayRender,continueRender} from 'remotion';
import {LOBVisual} from './lobisomem/Cenas';
import {fontsReady} from './fonts';
import config from '../../../lobisomem/elenco_ep2.json';
import type {Scene,Timeline} from './types';
import {AberturaEp2} from './lobisomem/AberturaEp2';
const jogadores=config.players.map((j,i)=>({...j,numero:i+1,papel:config.roles[i]}));
const scene={id:'preview',chapter:'preview',start:0,duration:600,audioOffset:0,audioDuration:0,words:[],visual:{type:'component',name:'LOBElenco'},segments:[],events:[],capGroups:[]} as Scene;
const timeline={data:{partidas:{5:{partida:5,jogadores,noites:[],dias:[],resultado:{vencedor:'empate',dias:0,vivos:[]}}}}} as unknown as Timeline;
const Preview:React.FC<{pagina:number}>=({pagina})=>{
 const [h]=useState(()=>delayRender('fontes'));
 useEffect(()=>{fontsReady.then(()=>continueRender(h)).catch(()=>continueRender(h))},[h]);
 return <AbsoluteFill><LOBVisual name={pagina<0?'LOBElenco':'LOBPapeis'} props={{partida:5,pagina}} scene={scene} timeline={timeline}/><div style={{position:'absolute',bottom:8,left:12,fontFamily:'Arial',fontSize:18,color:'#fff',background:'#18243acc',padding:'4px 10px'}}>PRÉVIA TÉCNICA — sem partida realizada</div></AbsoluteFill>;
};
const Root=()=> <>
 <Composition id="WolvesEp2Layout" component={Preview} width={1920} height={1080} fps={30} durationInFrames={600} defaultProps={{pagina:-1}}/>
 <Composition id="WolvesEp2Roles" component={Preview} width={1920} height={1080} fps={30} durationInFrames={600} defaultProps={{pagina:1}}/>
 <Composition id="WolvesEp2Opening" component={AberturaEp2} width={1920} height={1080} fps={30} durationInFrames={810}/>
</>;
registerRoot(Root);
