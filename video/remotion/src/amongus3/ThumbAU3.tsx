// Thumbnail do Among Us 3 (1280×720): o Palhaço sendo ejetado no espaço feliz da vida (ele queria ser expulso),
// os outros olhando de baixo, e "15 IAs" com as empresas da temporada.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Crewmate} from '../amongus/Crewmate';
import {FONT} from '../theme';
import {CORES} from './sim';

const EMPRESAS = [
  {nome: 'GPT', cor: '#10a37f'},
  {nome: 'Gemini', cor: '#8e5cf7'},
  {nome: 'Claude', cor: '#d97a47'},
  {nome: 'DeepSeek', cor: '#2f6bff'},
  {nome: 'GLM', cor: '#0f9d8a'},
  {nome: 'MiniMax', cor: '#e2325a'},
];

// chapéu de palhaço (cone listrado com pompons), desenho próprio
const Palhaco: React.FC<{size: number}> = ({size}) => (
  <div style={{position: 'relative', width: size, height: size}}>
    <Crewmate cor="Preto" size={size} />
    <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transform: 'translate(6%, 3%) rotate(8deg)'}}>
      <defs>
        <pattern id="listra" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="10" height="10" fill="#ffd400" />
          <rect width="5" height="10" fill="#ff2a6d" />
        </pattern>
      </defs>
      <path d="M30 14 L52 -34 L70 14 Z" fill="url(#listra)" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="52" cy="-36" r="7" fill="#33d1ff" stroke="#000" strokeWidth="3" />
      {[30, 43, 57, 70].map((x, i) => <circle key={x} cx={x} cy={15} r={5} fill={['#33d1ff', '#7dff5a', '#ff2a6d', '#ffd400'][i]} stroke="#000" strokeWidth="2.5" />)}
    </svg>
  </div>
);

export const ThumbAU3: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 68% 50%, #4a1640 0%, #12081f 55%, #000 100%)', overflow: 'hidden'}}>
    <svg width={1280} height={720} style={{position: 'absolute'}}>
      {Array.from({length: 120}, (_, i) => <circle key={i} cx={(i * 7919) % 1280} cy={(i * 104729) % 720} r={1 + (i % 3) * 0.7} fill="#fff" opacity={0.3 + (i % 4) * 0.15} />)}
    </svg>
    {/* fila dos outros, pequenos, embaixo à esquerda */}
    <div style={{position: 'absolute', left: 14, bottom: 4, display: 'flex', alignItems: 'flex-end'}}>
      {CORES.filter((c) => c !== 'Preto').slice(0, 10).map((c, i) => (
        <div key={c} style={{marginLeft: i ? -30 : 0, transform: `scale(${1 - i * 0.035})`, transformOrigin: 'bottom'}}><Crewmate cor={c} size={84} /></div>
      ))}
    </div>
    {/* o Palhaço ejetado */}
    <div style={{position: 'absolute', left: 790, top: 250, transform: 'rotate(-24deg)'}}>
      <Palhaco size={360} />
    </div>
    <div style={{position: 'absolute', left: 690, top: 40, padding: '14px 26px', background: '#fff', border: '7px solid #000', borderRadius: 30, fontFamily: FONT.display, fontWeight: 900, fontSize: 50, lineHeight: 1.05, color: '#000', transform: 'rotate(3deg)', boxShadow: '0 8px 0 #000a'}}>
      OBRIGADO POR<br />ME EXPULSAR!
    </div>
    <div style={{position: 'absolute', left: 36, top: 26, fontFamily: FONT.display, fontWeight: 900, fontSize: 150, lineHeight: 0.92, color: '#ff2a2a', WebkitTextStroke: '6px #000', textShadow: '0 10px 0 #000', letterSpacing: -2}}>
      15 IAs
    </div>
    <div style={{position: 'absolute', left: 42, top: 186, fontFamily: FONT.display, fontWeight: 900, fontSize: 74, lineHeight: 1, color: '#fff', WebkitTextStroke: '4px #000', textShadow: '0 8px 0 #000'}}>
      NO AMONG US
    </div>
    <div style={{position: 'absolute', left: 40, top: 290, display: 'flex', flexWrap: 'wrap', gap: 10, width: 600}}>
      {EMPRESAS.map((e) => (
        <span key={e.nome} style={{padding: '6px 18px', borderRadius: 14, background: e.cor, border: '4px solid #fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff'}}>{e.nome}</span>
      ))}
    </div>
  </AbsoluteFill>
);
