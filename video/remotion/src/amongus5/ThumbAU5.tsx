// Thumbnail do Among Us 5 (1280×720): o Polus nevando e duas Roses iguais (coroa, terno e mini-tripulante, a skin que
// a MiMo escolheu); a de trás, que é o Banana camuflado, esconde uma faca. Sem emoji: faca e ícones em SVG.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Crewmate4} from '../amongus/Crewmate4';
import {FONT} from '../theme';

const EMPRESAS = [
  {nome: 'GPT', cor: '#10a37f'},
  {nome: 'Claude', cor: '#d97a47'},
  {nome: 'DeepSeek', cor: '#2f6bff'},
  {nome: 'GLM', cor: '#0f9d8a'},
  {nome: 'MiniMax', cor: '#e2325a'},
  {nome: 'Qwen', cor: '#6a4cff'},
  {nome: 'MiMo', cor: '#ff6900'},
];

const Faca: React.FC = () => (
  <svg width={190} height={80} viewBox="0 0 190 80">
    <path d="M60 30 L178 18 Q186 22 178 30 L60 50 Z" fill="#e8eef5" stroke="#000" strokeWidth={5} strokeLinejoin="round" />
    <path d="M70 34 L170 24" stroke="#fff" strokeWidth={4} opacity={0.8} />
    <rect x={8} y={26} width={56} height={28} rx={8} fill="#5a3418" stroke="#000" strokeWidth={5} />
    <rect x={52} y={16} width={12} height={48} rx={4} fill="#333" stroke="#000" strokeWidth={4} />
  </svg>
);

export const ThumbAU5: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 50%, #7a4bd8 0%, #3b1f7a 35%, #140a2e 75%)', overflow: 'hidden'}}>
    <svg width={1280} height={720} style={{position: 'absolute'}}>
      {/* chão de neve do Polus */}
      <path d="M0 610 Q200 570 420 600 T860 590 T1280 600 L1280 720 L0 720 Z" fill="#e9eefb" />
      <path d="M0 650 Q260 620 520 650 T1040 640 T1280 650 L1280 720 L0 720 Z" fill="#cdd6f0" />
      {Array.from({length: 120}, (_, i) => <circle key={i} cx={(i * 7919) % 1280} cy={(i * 104729) % 600} r={2 + (i % 3) * 1.4} fill="#fff" opacity={0.35 + (i % 4) * 0.12} />)}
    </svg>
    {/* a Rose falsa (Banana camuflado), atrás, com a faca */}
    <div style={{position: 'absolute', left: 640, top: 250, transform: 'rotate(-5deg)', filter: 'brightness(0.8) drop-shadow(0 0 30px #ff0000aa)'}}>
      <Crewmate4 cor="Rose" size={300} cosmetico="coroa" roupa="terno" pet="mini_tripulante" />
    </div>
    <div style={{position: 'absolute', left: 820, top: 380, transform: 'rotate(-20deg)'}}><Faca /></div>
    {/* a Rose de verdade, na frente, sem saber */}
    <div style={{position: 'absolute', left: 930, top: 270, transform: 'rotate(4deg)'}}>
      <Crewmate4 cor="Rose" size={330} cosmetico="coroa" roupa="terno" pet="mini_tripulante" />
    </div>
    <div style={{position: 'absolute', left: 860, top: 150, whiteSpace: 'nowrap', padding: '8px 20px', background: '#fff', border: '6px solid #000', borderRadius: 26, fontFamily: FONT.display, fontWeight: 900, fontSize: 42, color: '#000', transform: 'rotate(6deg)', boxShadow: '0 6px 0 #000a'}}>
      QUAL É A REAL?
    </div>
    <div style={{position: 'absolute', left: 36, top: 22, fontFamily: FONT.display, fontWeight: 900, fontSize: 150, lineHeight: 0.92, color: '#ff2a6a', WebkitTextStroke: '6px #000', textShadow: '0 10px 0 #000', letterSpacing: -2}}>
      18 IAs
    </div>
    <div style={{position: 'absolute', left: 42, top: 182, fontFamily: FONT.display, fontWeight: 900, fontSize: 80, lineHeight: 1, color: '#fff', WebkitTextStroke: '4px #000', textShadow: '0 8px 0 #000'}}>
      NO POLUS
    </div>
    <div style={{position: 'absolute', left: 40, top: 300, display: 'flex', flexWrap: 'wrap', gap: 10, width: 560}}>
      {EMPRESAS.map((e) => (
        <span key={e.nome} style={{padding: '6px 18px', borderRadius: 14, background: e.cor, border: '4px solid #fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff'}}>{e.nome}</span>
      ))}
    </div>
    <div style={{position: 'absolute', left: 40, bottom: 40, padding: '8px 22px', background: '#ffd21f', border: '5px solid #000', borderRadius: 16, fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: '#000', transform: 'rotate(-2deg)'}}>
      AMONG US 5
    </div>
  </AbsoluteFill>
);
