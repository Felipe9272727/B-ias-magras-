import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Avatar} from './Avatar';
import {IconePapel} from './Papeis';
import {AZUL, FONTE, Fundo, ROSA} from './Tela';

const Like: React.FC = () => <svg width={78} height={78} viewBox="0 0 64 64" fill="none"><path d="M24 28 34 9c5 0 8 4 6 11l-2 8h15c5 0 7 4 6 8l-5 17c-1 4-4 6-8 6H24V28Z" fill={ROSA} stroke={AZUL} strokeWidth={3}/><path d="M7 29h14v30H7z" fill="#3fa9f5" stroke={AZUL} strokeWidth={3}/></svg>;

export const EncerramentoCTA: React.FC<{commentAt?: number; goodbyeAt?: number}> = ({commentAt=210, goodbyeAt=360}) => {
  const f=useCurrentFrame();const {fps}=useVideoConfig();
  const enter=spring({frame:f,fps,config:{damping:17,stiffness:130}});
  const pulse=1+.022*Math.sin(f/9);const question=spring({frame:f-commentAt,fps,config:{damping:15}});
  const bye=interpolate(f,[goodbyeAt,goodbyeAt+16],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return <AbsoluteFill style={{fontFamily:FONTE,overflow:'hidden'}}>
    <Fundo noite={false}/><AbsoluteFill style={{background:'#102537b8'}}/>
    {Array.from({length:18},(_,i)=><div key={i} style={{position:'absolute',width:12+i%3*6,height:26,background:i%2?ROSA:'#3fa9f5',left:(i*137+f*(i%3+1))%2050-60,top:(i*83+f*1.8)%1200-80,transform:`rotate(${f*2+i*40}deg)`,opacity:.5}}/>)}
    <div style={{position:'absolute',left:80,right:80,top:62,color:'#fff',fontSize:68,fontWeight:900,textAlign:'center',textShadow:'0 5px 0 #102537',transform:`translateY(${(1-enter)*-100}px)`}}>{bye>.5?'ATÉ A PRÓXIMA!':'CURTIU ESSE CAOS?'}</div>
    <div style={{position:'absolute',left:100,top:255,width:430,height:570,borderRadius:32,background:'#fff',border:`7px solid ${ROSA}`,transform:`rotate(${-4+Math.sin(f/22)*2}deg) scale(${enter})`}}>
      <div style={{position:'absolute',left:66,top:12}}><IconePapel papel="bobo" tamanho={100}/></div>
      <div style={{position:'absolute',left:42,top:70,width:350,height:350}}><svg width={350} height={350} viewBox="0 0 200 200"><Avatar id="relojoeiro" expressao="rindo" t={f} falando={false}/></svg></div>
      <div style={{position:'absolute',left:20,right:20,bottom:38,color:AZUL,fontSize:34,fontWeight:900,textAlign:'center',lineHeight:1.15}}>O BOBO GANHOU.<br/><span style={{color:ROSA,fontSize:29}}>A vila fez o trabalho!</span></div>
    </div>
    <div style={{position:'absolute',left:650,right:95,top:250,height:590,borderRadius:32,background:'#fff',border:'6px solid #fff',boxShadow:'0 18px 0 #10253766',transform:`translateX(${(1-enter)*500}px)`}}>
      <div style={{position:'absolute',left:70,right:70,top:32,display:'flex',gap:25,alignItems:'center',color:AZUL,fontSize:48,fontWeight:900}}><Like/>DEIXA O LIKE!</div>
      <div style={{position:'absolute',left:62,right:62,top:160,padding:'24px 20px',borderRadius:22,background:ROSA,color:'#fff',fontWeight:900,fontSize:66,textAlign:'center',boxShadow:'0 8px 0 #b72358',transform:`scale(${pulse})`}}>INSCREVA-SE</div>
      <div style={{position:'absolute',left:55,right:55,top:340,textAlign:'center',color:AZUL,opacity:question,transform:`translateY(${(1-question)*35}px)`}}>
        <div style={{fontSize:41,fontWeight:900}}>QUEM JOGOU MELHOR?</div>
        <div style={{fontSize:31,fontWeight:700,marginTop:12}}>O Relojoeiro ou a vila que ajudou ele?</div>
        <div style={{fontSize:29,fontWeight:800,color:ROSA,marginTop:22}}>Defende essa votação nos comentários!</div>
      </div>
    </div>
    <div style={{position:'absolute',left:80,right:80,bottom:75,color:'#fff',fontSize:31,fontWeight:800,textAlign:'center'}}>Mesmos personagens. Mais chances de passar vergonha.</div>
  </AbsoluteFill>;
};
