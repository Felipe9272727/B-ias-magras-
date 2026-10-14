// Thumbnail do Among Us 2 (1280×720): o Detetive sendo ejetado no espaço gritando que falou a verdade,
// os outros 11 olhando da janela, e "12 IAs" com as empresas.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Crewmate} from '../amongus/Crewmate';
import {FONT} from '../theme';
import {CORES} from './sim';

const EMPRESAS = [
  {nome: 'GPT', cor: '#10a37f'},
  {nome: 'Gemini', cor: '#8e5cf7'},
  {nome: 'Grok', cor: '#111'},
  {nome: 'Claude', cor: '#d97a47'},
  {nome: 'DeepSeek', cor: '#2f6bff'},
];

export const ThumbAU2: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 45%, #2b1a5a 0%, #0a0820 55%, #000 100%)', overflow: 'hidden'}}>
    {/* estrelas */}
    <svg width={1280} height={720} style={{position: 'absolute'}}>
      {Array.from({length: 110}, (_, i) => <circle key={i} cx={(i * 7919) % 1280} cy={(i * 104729) % 720} r={1 + (i % 3) * 0.7} fill="#fff" opacity={0.3 + (i % 4) * 0.15} />)}
    </svg>
    {/* fila dos outros 11, pequenos, embaixo à esquerda */}
    <div style={{position: 'absolute', left: 18, bottom: 6, display: 'flex', alignItems: 'flex-end'}}>
      {CORES.filter((c) => c !== 'Marrom').slice(0, 8).map((c, i) => (
        <div key={c} style={{marginLeft: i ? -26 : 0, transform: `scale(${1 - i * 0.04})`, transformOrigin: 'bottom'}}><Crewmate cor={c} size={92} /></div>
      ))}
    </div>
    {/* o Detetive ejetado */}
    <div style={{position: 'absolute', left: 770, top: 170, transform: 'rotate(-28deg)'}}>
      <Crewmate cor="Marrom" size={380} />
    </div>
    {/* balão */}
    <div style={{position: 'absolute', left: 700, top: 34, padding: '14px 26px', background: '#fff', border: '7px solid #000', borderRadius: 30, fontFamily: FONT.display, fontWeight: 900, fontSize: 50, lineHeight: 1.05, color: '#000', transform: 'rotate(3deg)', boxShadow: '0 8px 0 #000a'}}>
      EU FALEI<br />A VERDADE!
    </div>
    {/* título */}
    <div style={{position: 'absolute', left: 36, top: 26, fontFamily: FONT.display, fontWeight: 900, fontSize: 150, lineHeight: 0.92, color: '#ff2a2a', WebkitTextStroke: '6px #000', textShadow: '0 10px 0 #000', letterSpacing: -2}}>
      12 IAs
    </div>
    <div style={{position: 'absolute', left: 42, top: 186, fontFamily: FONT.display, fontWeight: 900, fontSize: 74, lineHeight: 1, color: '#fff', WebkitTextStroke: '4px #000', textShadow: '0 8px 0 #000'}}>
      NO AMONG US
    </div>
    <div style={{position: 'absolute', left: 40, top: 290, display: 'flex', flexWrap: 'wrap', gap: 10, width: 640}}>
      {EMPRESAS.map((e) => (
        <span key={e.nome} style={{padding: '6px 18px', borderRadius: 14, background: e.cor, border: '4px solid #fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff'}}>{e.nome}</span>
      ))}
    </div>
  </AbsoluteFill>
);
