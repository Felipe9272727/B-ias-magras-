import React from 'react';
import {AbsoluteFill,Audio,Composition,Sequence,interpolate,spring,staticFile,useCurrentFrame,useVideoConfig,registerRoot} from 'remotion';
import {Avatar} from './Avatar';
import {IconePapel,IconeUi} from './Papeis';
import words from './ep2_words.json';
import {Quadro,Jogador,FONTE,ROSA} from './Tela';

// New independent Shorts production; facts verified from the EP2 Match7 log.
const players: Record<string,Jogador>={
 padeira:{id:'padeira',nome:'Padeira',modelo:'Claude Haiku 5.5',papel:'pistoleiro',numero:1},
 bardo:{id:'bardo',nome:'Bardo',modelo:'MiniMax M3.1 Flash',papel:'carcereiro',numero:8},
 ferreiro:{id:'ferreiro',nome:'Ferreiro',modelo:'Claude Haiku 5.5',papel:'lobisomem',numero:2},
 ceramista:{id:'ceramista',nome:'Ceramista',modelo:'MiMo V2.6 Flash',papel:'lobisomem',numero:12},
 florista:{id:'florista',nome:'Florista',modelo:'Ling 3.1 Flash',papel:'padre',numero:14},
 mineiro:{id:'mineiro',nome:'Mineiro',modelo:'MiMo V2.6 Flash',papel:'lobo_alfa',numero:11},
 astronoma:{id:'astronoma',nome:'Astrônoma',modelo:'GPT-6 Luna',papel:'lobo_vidente',numero:10},
 relojoeiro:{id:'relojoeiro',nome:'Relojoeiro',modelo:'Solar Mini 4',papel:'bobo',numero:16},
 boticaria:{id:'boticaria',nome:'Boticária',modelo:'GLM 5.3 Flash',papel:'aldeao',numero:3},
 lenhador:{id:'lenhador',nome:'Lenhador',modelo:'GLM 5.3 Flash',papel:'vidente',numero:4},
 viajante:{id:'viajante',nome:'Viajante',modelo:'GPT-6.1 Terra',papel:'prefeito',numero:9},
 pescador:{id:'pescador',nome:'Pescador',modelo:'Qwen 3.8 27B',papel:'xerife',numero:6},
 costureira:{id:'costureira',nome:'Costureira',modelo:'Qwen 3.8 27B',papel:'aldeao',numero:5},
};
const FPS=30;
const sections=[
 {start:0,end:8.7,ids:['relojoeiro','ferreiro','padeira'],header:'16 IAs NUMA VILA',pop:'A VILA DEU A VITÓRIA AO BOBO!',col:'#e72b67',phase:'hook'},
 {start:8.7,end:17.2,ids:['padeira','bardo'],header:'A PRIMEIRA BALA',pop:'ACERTOU O CARCEREIRO!',col:'#ec4048',phase:'shot'},
 {start:17.2,end:22.3,ids:['ferreiro','padeira'],header:'A VILA INVESTIGOU',pop:'1º LOBO ELIMINADO',col:'#23b67b',phase:'reveal'},
 {start:22.3,end:29.0,ids:['florista','ceramista'],header:'ÁGUA BENTA',pop:'2º LOBO ELIMINADO',col:'#20beae',phase:'holy'},
 {start:29.0,end:36.0,ids:['padeira','mineiro'],header:'A SEGUNDA BALA',pop:'O LOBO ALFA CAIU!',col:'#ffc13e',phase:'shot'},
 {start:36.0,end:42.0,ids:['astronoma','relojoeiro'],header:'TRÊS LOBOS FORA',pop:'SÓ FALTAVA UM...',col:'#ef5959',phase:'wolf'},
 {start:42.0,end:47.5,ids:['relojoeiro','astronoma','pescador'],header:'VOTAÇÃO FINAL',pop:'5 VOTOS NO RELOJOEIRO',col:'#f8a72c',phase:'vote'},
 {start:47.5,end:54.5,ids:['relojoeiro'],header:'REVELAÇÃO',pop:'ERA O BOBO!',col:'#f4c932',phase:'jester'},
 {start:54.5,end:67.33,ids:['relojoeiro','padeira','astronoma'],header:'VITÓRIA DO BOBO',pop:'SEM VOTAR NENHUMA VEZ!',col:'#ffcc39',phase:'ending'},
] as const;
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const Selo:React.FC<{s:string;bg:string;f:number;y:number;size?:number}>=({s,bg,f,y,size=57})=>{
 const {fps}=useVideoConfig();const k=spring({frame:Math.max(0,f),fps,config:{damping:10,stiffness:240}});
 return <div style={{position:'absolute',top:y,left:40,right:40,display:'flex',justifyContent:'center',transform:`rotate(${Math.sin(f/16)*2}deg) scale(${.58+.42*k})`,opacity:Math.min(1,k*3),zIndex:30}}>
 <div style={{maxWidth:980,textAlign:'center',fontFamily:FONTE,fontSize:size,fontWeight:950,lineHeight:1.12,color:'#fff',padding:'20px 24px',borderRadius:16,border:'7px solid white',background:bg,WebkitTextStroke:'1.5px #161923',boxShadow:'0 14px 0 rgba(0,0,0,.5)',textShadow:'0 3px 3px #12131d'}}>{s}</div></div>;
};
const Face:React.FC<{id:string;f:number;x:number;y:number;size:number;dead?:boolean;selected?:boolean;votes?:number}>=({id,f,x,y,size,dead=false,selected=false,votes})=>{
 const j=players[id]; if(!j)return null;
 const k=spring({frame:Math.max(0,f),fps:FPS,config:{damping:12,stiffness:160}});
 return <div style={{position:'absolute',left:x,top:y,transform:`translateY(${(1-k)*130+Math.sin(f/12+ x)*7}px) scale(${.8+.2*k})`,zIndex:selected?6:3,filter:dead?'grayscale(1)':'none'}}>
 <Quadro j={j} s={{destaque:selected,revelado:dead, morto:dead, votos:votes}} noite={false} t={f+10} tam={size}/></div>;
};
const FinalVotes:React.FC<{f:number}>=({f})=><div style={{position:'absolute',top:1020,left:110,width:860,height:330,zIndex:15}}>
 {[0,1,2,3,4].map(i=><div key={i} style={{position:'absolute',left:70+i*145,top:80-Math.min(1,Math.max(0,(f-20-i*9)/14))*70,opacity:interpolate(f,[20+i*9,28+i*9],[0,1],clamp),transform:`rotate(${(i-2)*9}deg)`}}>
 <svg width="126" height="140" viewBox="0 0 110 130"><rect x="6" y="5" width="95" height="110" rx="12" fill="#fff6d2" stroke="#23222b" strokeWidth="8"/><path d="M24 56l20 20 39-42" fill="none" stroke="#e73562" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/></svg></div>)}
 <div style={{position:'absolute',top:180,left:0,right:0,textAlign:'center',fontWeight:900,fontFamily:FONTE,fontSize:48,color:'#ffe144',textShadow:'0 4px 0 #000'}}>5 VOTOS</div>
 </div>;
const Subtitles:React.FC<{sec:number;frame:number}>=({sec,frame})=>{
 const active=words.reduce((acc,w,i)=>w.start<=sec?i:acc,-1);
 if(active<0)return null;
 const start=Math.floor(active/3)*3;
 const group=words.slice(start,start+3);
 const enter=Math.round(group[0].start*FPS);
 const k=spring({frame:Math.max(0,frame-enter),fps:FPS,config:{damping:12,stiffness:260}});
 return <div style={{position:'absolute',left:38,right:38,top:1150,zIndex:45,display:'flex',alignItems:'center',justifyContent:'center',gap:13,transform:`scale(${.82+.18*k})`}}>
 {group.map((w,i)=><span key={start+i} style={{fontSize:66,fontWeight:950,fontFamily:FONTE,lineHeight:1.08,color:start+i===active?'#ffe044':'#fff',WebkitTextStroke:'5px #0b0b0c',paintOrder:'stroke fill',textShadow:'0 8px 8px #000',textTransform:'uppercase'}}>{w.text}</span>)}
 </div>;
};
const NativeShort:React.FC=()=>{
 const f=useCurrentFrame(),sec=f/FPS,idx=sections.findIndex((s,i)=>sec>=s.start&&sec<(sections[i+1]?.start??70));
 const n=Math.max(0,idx),s=sections[n],local=Math.max(0,f-Math.round(s.start*FPS));
 const z=interpolate(local,[0,16,140],[.96,1.08,1.12],clamp);
 const flash=Math.max(0,1-local/6)*.35;
 return <AbsoluteFill style={{background:'#0e1b29',overflow:'hidden',fontFamily:FONTE}}>
 <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 50%,#35526a 0%,#192a3c 58%,#0c1320 100%)'}}/>
 <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position:'absolute',inset:0}}>
 <circle cx="870" cy="370" r="175" fill="#ffedd0" opacity=".12"/><path d="M0 1630L120 1550 240 1595 440 1520 620 1590 850 1480 1080 1580V1920H0Z" fill="#122b2e"/>
 {Array.from({length:22}).map((_,i)=><circle key={i} cx={(i*199+35)%1080} cy={(i*271+120)%1650} r={2+i%3} fill="#fff" opacity=".25"/>)}
 </svg>
 <div style={{position:'absolute',top:100,left:45,right:45,textAlign:'center',fontSize:39,fontWeight:950,color:'#f4d34a',textShadow:'0 4px 0 #171717'}}>WOLVESVILLE • PARTE 2</div>
 <div style={{position:'absolute',top:222,left:0,right:0,textAlign:'center',fontSize:66,fontWeight:950,color:'#fff',WebkitTextStroke:'3px #101019',textShadow:'0 7px 0 #111'}}>{s.header}</div>
 <div style={{position:'absolute',top:460,left:0,right:0,height:760,transform:`scale(${z})`,transformOrigin:'50% 45%'}}>
 {s.ids.length===1?<Face id={s.ids[0]} f={local} x={260} y={30} size={560} selected/>:s.ids.length===2?<>
 <Face id={s.ids[0]} f={local} x={70} y={90} size={450} selected/>
 <Face id={s.ids[1]} f={local-10} x={560} y={130} size={400} dead={['ferreiro','ceramista','mineiro','bardo'].includes(s.ids[1])&&local>115} />
 </>:s.ids.map((id,i)=><Face key={id} id={id} f={local-i*7} x={65+i*330} y={160+(i%2)*90} size={360} selected={i===0}/>)}
 {s.phase==='vote'&&<FinalVotes f={local}/>}
 </div>
 <Subtitles sec={sec} frame={f}/>
 <Selo s={s.pop} bg={s.col} f={local-8} y={1370} size={s.pop.length>26?50:67}/>
 {s.phase==='shot'&&local>50&&local<75?<div style={{position:'absolute',top:800,left:390,fontSize:100,color:'#fff',textShadow:'0 0 25px #ffde4c'}}>✦</div>:null}
 {s.phase==='jester'&&<div style={{position:'absolute',top:1180,left:435,transform:`rotate(${Math.sin(local/7)*9}deg)`}}><IconePapel papel="bobo" tamanho={220}/></div>}
 {s.phase==='wolf'&&<div style={{position:'absolute',top:1210,left:470}}><IconePapel papel="lobo_vidente" tamanho={180}/></div>}
 <div style={{position:'absolute',top:1645,left:80,right:80,textAlign:'center',color:'#fff',fontSize:33,fontWeight:850,textShadow:'0 3px 5px #000'}}>DECISÕES REAIS DAS IAs</div>
 {s.phase==='ending'&&<div style={{position:'absolute',top:1765,left:45,right:45,textAlign:'center',fontSize:52,fontWeight:950,color:'#ffe35b',textShadow:'0 5px 0 #090909'}}>VÍDEO COMPLETO NO CANAL</div>}
 <div style={{position:'absolute',left:0,bottom:0,height:14,width:`${Math.min(100,sec/67.24*100)}%`,background:ROSA,zIndex:60}}/>
 <AbsoluteFill style={{background:'#fff',opacity:flash,pointerEvents:'none'}}/>
 <Audio src={staticFile('ep2_native/narrator.mp3')}/>
 <Audio src={staticFile('music/sneaky-snitch.mp3')} volume={0.065}/>
 {sections.slice(1).map((x,i)=><Sequence key={i} from={Math.round(x.start*FPS)} durationInFrames={29}><Audio src={staticFile('sfx/pop.mp3')} volume={0.13}/></Sequence>)}
 </AbsoluteFill>
};
registerRoot(()=> <Composition id="WolvesvilleEp2ShortNative" component={NativeShort} width={1080} height={1920} fps={FPS} durationInFrames={2020}/>);
