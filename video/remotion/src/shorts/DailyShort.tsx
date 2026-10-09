import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ShortAzul2} from '../amongus/ShortAzul2';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import type {Block, DailyProps, Word} from './pack';
import evo from '../../../data/runs_canon/evolution/summary.json';
import ddqn from '../../../data/runs_canon/ddqn/summary.json';
import rainbow from '../../../data/runs_canon/rainbow/summary.json';
import adaptive from '../../../data/runs_canon/adaptive/summary.json';

const INK = '#f6f0e4';
const GOLD = '#ffd45a';
const COLORS: Record<string, string> = {neuro: '#71dcc6', dqn: '#ffac70', rainbow: '#ba9aff', gancho: GOLD, ada: '#71dcc6', trapaca: '#88cfff'};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const at = (b: Block, word: string) => b.palavras.find(p => p.w.toLowerCase().startsWith(word.toLowerCase()))?.s ?? 0;

const Captions: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  const groups: Word[][] = [];
  let group: Word[] = [];
  for (const word of words) {
    group.push(word);
    if (group.length === 3 || /[.,!?…]$/.test(word.w)) {groups.push(group); group = [];}
  }
  if (group.length) groups.push(group);
  const active = groups.find((g, i) => f >= g[0].s - 2 && f < (groups[i + 1]?.[0].s ?? g[g.length - 1].e + 12) - 2);
  if (!active) return null;
  return <div style={{position: 'absolute', left: 55, right: 145, top: 1420, textAlign: 'center', fontFamily: FONT.display, fontSize: 76, fontWeight: 900, lineHeight: 1.15, textShadow: '0 5px 0 #000, 0 0 20px #000'}}>
    {active.map((w, i) => <span key={i} style={{color: f >= w.s - 2 ? GOLD : INK, display: 'inline-block', margin: '0 9px'}}>{w.w}</span>)}
  </div>;
};

const Label: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = GOLD}) => <div style={{fontFamily: FONT.mono, fontSize: 26, fontWeight: 700, letterSpacing: 3, color, textTransform: 'uppercase'}}>{children}</div>;

const Population: React.FC<{progress: number; winners?: boolean}> = ({progress, winners}) => {
  const f = useCurrentFrame();
  return <div style={{display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 10, marginTop: 30}}>
    {Array.from({length: 64}, (_, i) => {
      const selected = winners ? i < adaptive.totalWins : (i + Math.floor(progress * 20)) % 8 === 0;
      const jump = selected ? Math.max(0, Math.sin(f / 9 + i) * 7) : 0;
      return <svg key={i} viewBox="0 0 24 24" width="100%" height={52} style={{transform: `translateY(${-jump}px)`, opacity: winners && !selected ? 0.18 : 1}}>
        <path d="M7 2h10v3h3v3H4V5h3z" fill={selected ? GOLD : '#658fa2'} />
        <path d="M7 8h10v7H7z" fill="#f0cba4" /><path d="M9 15h6v5H9zM5 17h4v5H5zM15 17h4v5h-4z" fill={selected ? '#71dcc6' : '#46616b'} />
        <path d="M5 22h5v2H5zM14 22h5v2h-5zM15 10h2v2h-2z" fill={INK} />
      </svg>;
    })}
  </div>;
};

const JumpSimulator: React.FC = () => {
  const f = useCurrentFrame();
  const t = (f % 100) / 100;
  return <svg viewBox="0 0 860 450" width="100%" style={{overflow: 'visible'}}>
    <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#88cfff" strokeOpacity=".09" /></pattern></defs>
    <rect width="860" height="450" fill="url(#grid)" />
    <path d="M0 360h300v90H0zM530 285h330v165H530z" fill="#304954" /><path d="M0 360h300M530 285h330" stroke="#71dcc6" strokeWidth="9" />
    {[0, 1, 2].map((i) => <path key={i} d={`M170 342 Q380 ${i * 120 - 85} ${i === 0 ? 590 : i === 1 ? 450 : 790} ${i === 1 ? 440 : 270}`} fill="none" stroke={i === 0 ? GOLD : '#ff746c'} strokeWidth={i === 0 ? 6 : 3} strokeDasharray={i === 0 ? '10 7' : '5 12'} opacity={i === 0 ? 1 : 0.3} />)}
    <circle cx={170 + 420 * t} cy={342 * (1 - t) * (1 - t) + 2 * (-85) * t * (1 - t) + 270 * t * t} r="15" fill={GOLD} />
    <text x="45" y="420" fill={INK} fontFamily="monospace" fontSize="24">TESTA → ESCOLHE → AGE</text>
  </svg>;
};

const MarioBlock: React.FC<{b: Block}> = ({b}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: f, fps, config: {damping: 18, stiffness: 140}});
  const color = COLORS[b.id];
  const base: React.CSSProperties = {position: 'absolute', top: 420, left: 65, right: 145, transform: `translateY(${(1 - pop) * 32}px)`, opacity: pop};
  const resultStyle: React.CSSProperties = {fontFamily: FONT.display, fontSize: 96, fontWeight: 900, lineHeight: 1.08, letterSpacing: -4};
  let content: React.ReactNode;
  if (b.id === 'gancho') {
    const cards = ['NEUROEVOLUÇÃO', 'DOUBLE DQN', 'RAINBOW', 'ADAPTATIVA'];
    content = <><Label>EXPERIMENTO REAL · SEED 7</Label><div style={{...resultStyle, margin: '36px 0 50px'}}>4 IAs.<br />32 fases.<br /><span style={{color}}>1 conseguiu.</span></div>
      {cards.map((name, i) => <div key={name} style={{fontFamily: FONT.display, fontSize: 32, padding: '16px 0', borderTop: '1px solid #ffffff20', display: 'flex', gap: 22, opacity: interpolate(f - i * 5, [0, 14], [0.3, 1], clamp)}}><span style={{color}}>{`0${i + 1}`}</span>{name}<span style={{marginLeft: 'auto', color: i === 3 ? '#71dcc6' : '#ff746c'}}>{i === 3 && f > 90 ? '32 / 32' : '?'}</span></div>)}</>;
  } else if (b.id === 'ada') {
    const winAt = at(b, '48');
    content = <><Label color={color}>ADAPTATIVA</Label><div style={{...resultStyle, margin: '30px 0 15px', color}}>{f >= winAt ? `${adaptive.totalWins} de 64` : `${Math.round(interpolate(f, [at(b, 'zerou'), at(b, 'Bowser')], [0, 32], clamp))} fases`}</div>
      <div style={{fontFamily: FONT.display, fontSize: 33, color: INK, marginBottom: 20}}>{f >= winAt ? 'chegaram ao fim da campanha' : 'da fase 1-1 ao último castelo'}</div><Population progress={f / b.dur} winners={f >= winAt} /></>;
  } else if (b.id === 'trapaca') {
    content = <><Label color={color}>O SEGREDO</Label><div style={{...resultStyle, fontSize: 78, margin: '36px 0 50px'}}>Ela testa o pulo<br /><span style={{color}}>antes de agir.</span></div><JumpSimulator />
      <div style={{fontFamily: FONT.display, fontSize: 30, marginTop: 36, color: '#acbcc7'}}>Simulação interna da física do jogo</div></>;
  } else if (b.id === 'neuro') {
    content = <><Label color={color}>01 · NEUROEVOLUÇÃO</Label><div style={{...resultStyle, color, margin: '30px 0 0'}}>64 agentes</div><Population progress={f / b.dur} />
      <div style={{marginTop: 35, fontFamily: FONT.display, fontSize: 34}}>Os melhores geram a próxima população.</div>
      {f >= at(b, '402') && <div style={{marginTop: 26, fontFamily: FONT.display, fontSize: 42, fontWeight: 800, color: '#ff746c'}}>{evo.generation} gerações → travou no 1-3</div>}</>;
  } else if (b.id === 'dqn') {
    content = <><Label color={color}>02 · DOUBLE DQN</Label><div style={{...resultStyle, color, margin: '36px 0'}}>Tenta.<br />Erra.<br />Aprende.</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '40px 0'}}>{['AÇÃO', 'ERRO', 'AJUSTE'].map((label, i) => <React.Fragment key={label}>{i > 0 && <span style={{fontSize: 42, color}}>→</span>}<div style={{fontFamily: FONT.mono, fontSize: 24, border: `2px solid ${color}`, padding: '25px 20px', background: f % 72 >= i * 24 && f % 72 < (i + 1) * 24 ? `${color}30` : 'transparent'}}>{label}</div></React.Fragment>)}</div>
      {f >= at(b, '528') && <div style={{fontFamily: FONT.display, fontSize: 42, fontWeight: 800}}>{ddqn.generation} gerações<br /><span style={{color: '#ff746c'}}>Só {ddqn.totalStageClears} bandeiras · fase 1-2</span></div>}</>;
  } else {
    const flagsAt = at(b, '8.881');
    content = <><Label color={color}>03 · RAINBOW</Label><div style={{...resultStyle, color, margin: '36px 0'}}>6 técnicas<br />em 1 IA.</div>
      <div style={{fontFamily: FONT.display, fontSize: 105, fontWeight: 900, marginTop: 80}}>{Math.round(interpolate(f, [flagsAt, flagsAt + 35], [0, rainbow.totalStageClears], clamp)).toLocaleString('pt-BR')}</div><Label>bandeiras acumuladas no treino</Label>
      {f >= at(b, '70%') && <div style={{marginTop: 80}}><div style={{fontFamily: FONT.display, fontSize: 47, fontWeight: 800, color}}>~70% da fase 1-3</div><div style={{marginTop: 20, height: 18, background: '#ffffff16'}}><div style={{height: '100%', width: `${interpolate(f, [at(b, '70%'), b.dur], [0, 70], clamp)}%`, background: color}} /></div><div style={{fontFamily: FONT.display, fontSize: 28, color: '#acbcc7', marginTop: 20}}>Ainda sem zerar a campanha.</div></div>}</>;
  }
  return <AbsoluteFill><div style={base}>{content}</div><Captions words={b.palavras} /><Audio src={staticFile(`short_mario/${b.id}.mp3`)} />
    <Sequence from={0} durationInFrames={30}><Audio src={staticFile('sfx/whoosh.mp3')} volume={0.13} /></Sequence>
  </AbsoluteFill>;
};

export const DailyShort: React.FC<DailyProps> = ({short, blocks, partida}) => {
  const [handle] = useState(() => delayRender('fontes dos Shorts'));
  useEffect(() => {fontsReady.then(() => continueRender(handle));}, [handle]);
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  if (short === 'flagra' || short === 'parceiro') {
    return <ShortAzul2 dados={{blocos: blocks, partida}} musicFile={null} title={short === 'flagra' ? 'O IMPOSTOR SE ENTREGOU' : 'ENGANANDO O PRÓPRIO PARCEIRO'} />;
  }
  let from = 0;
  return <AbsoluteFill style={{background: '#101a22', color: INK, overflow: 'hidden'}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 20% 10%, #203d4c 0%, transparent 55%)'}} />
    <svg viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.09}}>{Array.from({length: 14}, (_, i) => <line key={i} x1={i * 90} y1={0} x2={i * 90} y2={1920} stroke={INK} />)}{Array.from({length: 24}, (_, i) => <line key={i} x1={0} y1={i * 90 + f % 90} x2={1080} y2={i * 90 + f % 90} stroke={INK} />)}</svg>
    <div style={{position: 'absolute', left: 65, right: 145, top: 145}}><Label>MARIO + INTELIGÊNCIA ARTIFICIAL</Label><div style={{fontFamily: FONT.display, fontSize: 65, fontWeight: 900, lineHeight: 1.1, marginTop: 22, letterSpacing: -2}}>{short === 'simulador' ? <>Zerou de primeira.<br /><span style={{color: GOLD}}>Mas tinha um segredo.</span></> : <>3 IAs tentando passar<br /><span style={{color: GOLD}}>do começo do Mario.</span></>}</div></div>
    {blocks.map(b => {const start = from; from += b.dur; return <Sequence key={b.id} from={start} durationInFrames={b.dur}><MarioBlock b={b} /></Sequence>;})}
    <div style={{position: 'absolute', left: 65, bottom: 300, right: 145, borderTop: '1px solid #ffffff30', paddingTop: 15, fontFamily: FONT.mono, color: '#9cb2c0', fontSize: 20, letterSpacing: 2}}>DADOS DO EXPERIMENTO · VISUALIZAÇÃO ANIMADA</div>
    <div style={{position: 'absolute', left: 0, bottom: 0, height: 9, width: `${100 * f / durationInFrames}%`, background: GOLD}} />
  </AbsoluteFill>;
};
