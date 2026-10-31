// Remontagem da abertura recuperada: áudio já pago + componentes do próprio canal.
// Não contém cenas, resultados ou falas de partidas novas.
import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,continueRender,delayRender,Sequence,staticFile,useCurrentFrame} from 'remotion';
import {LOBVisual} from './Cenas';
import {TransicaoLobo} from './Transicoes';
import {AU2Comentarios} from '../amongus3/Comentarios';
import {fontsReady} from '../fonts';
import type {Scene,Timeline} from '../types';
import config from '../../../../lobisomem/elenco_ep2.json';
import comments from '../../public/voice_lobo_ep2/comentarios.source.json';

const scene={id:'abertura-ep2',chapter:'abertura',start:0,duration:810,audioOffset:0,audioDuration:808,words:[],segments:[],events:[],capGroups:[],visual:{type:'component',name:'LOBTitulo'}} as Scene;
// Papéis aqui são apenas catálogo técnico: nunca se revelam nesta abertura.
const jogadores=config.players.map((j,i)=>({...j,numero:i+1,papel:config.roles[i]}));
const timeline={data:{partidas:{5:{jogadores,noites:[],dias:[]}}}} as unknown as Timeline;
const Visual:React.FC<{name:string;props:Record<string,unknown>;duration:number}>=({name,props,duration})=><>
 <LOBVisual name={name} props={props} scene={{...scene,duration}} timeline={timeline}/>
 <TransicaoLobo tipo="rosa"/>
</>;
export const AberturaEp2:React.FC=()=>{
 const [h]=useState(()=>delayRender('fontes da abertura recuperada'));
 useEffect(()=>{fontsReady.then(()=>continueRender(h)).catch(()=>continueRender(h))},[h]);
 const f=useCurrentFrame();
 return <AbsoluteFill>
  <Audio src={staticFile('voice_lobo_ep2/abertura.mp3')}/>
  <Sequence from={0} durationInFrames={135}>
   <AU2Comentarios comentarios={comments.map(c=>({usuario:'Autor oculto',texto:c.excerpt,destaque:c.excerpt,quando:'trecho real'}))} passo={30}/>
   <div style={{position:'absolute',bottom:30,left:40,fontFamily:'Poppins',fontWeight:800,fontSize:23,color:'#fff',background:'#101724de',padding:'10px 18px',borderRadius:12}}>PEDIDOS DA PARTE 1 · TRECHOS REAIS</div>
  </Sequence>
  <Sequence from={135} durationInFrames={75}><Visual name="LOBTitulo" props={{titulo:'FINALMENTE, PARTE 2!',sub:'LOBISOMEM DAS IAs'}} duration={75}/></Sequence>
  <Sequence from={210} durationInFrames={210}><Visual name="LOBElenco" props={{partida:5}} duration={210}/></Sequence>
  <Sequence from={420} durationInFrames={180}><Visual name="LOBPapeis" props={{partida:5,pagina:1}} duration={180}/></Sequence>
  <Sequence from={600} durationInFrames={120}><Visual name="LOBTitulo" props={{titulo:'A VILA LEMBRA',sub:'Mesmos personagens. Novos papéis.'}} duration={120}/></Sequence>
  <Sequence from={720} durationInFrames={90}><Visual name="LOBTitulo" props={{titulo:'QUEM ENGANA A VILA?',sub:'16 IAs · 4 lobos · 1 Bobo'}} duration={90}/></Sequence>
  <div style={{position:'absolute',bottom:8,right:16,fontFamily:'Arial',fontSize:16,color:'#fff',background:'#18243acc',padding:'4px 8px'}}>ABERTURA REMONTADA · PRÉVIA{f<600?'':' · partidas pendentes'}</div>
 </AbsoluteFill>;
};
