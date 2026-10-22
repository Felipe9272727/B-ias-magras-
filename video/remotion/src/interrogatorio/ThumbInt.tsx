// Thumbnail do "Interrogatório das IAs" (1280×720): o DeepSeek, detetive, apontando para o Qwen suando, com o
// estresse em 100 e o carimbo de MENTIRA. O Qwen era inocente (só escondia uma coreografia de K-pop).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {FONT} from '../theme';
import {Personagem} from './Personagens';
import {MonitorEstresse} from './Hud';

export const ThumbInt: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 20%, #fff3b0 0%, #c9a640 14%, #3a2c10 42%, #0b0804 100%)', overflow: 'hidden'}}>
    {/* cone da lâmpada */}
    <svg width={1280} height={720} style={{position: 'absolute'}}>
      <path d="M560 0 L720 0 L1060 720 L220 720 Z" fill="#fff6c8" opacity={0.12} />
      <rect x={0} y={560} width={1280} height={160} fill="#5a3b1d" />
      <rect x={0} y={556} width={1280} height={10} fill="#2a1a0a" />
    </svg>
    <div style={{position: 'absolute', left: 270, top: 660}}>
      <Personagem ia="deepseek" expressao="bravo" falando t={12} virado="direita" altura={520} acao="apontar" />
    </div>
    <div style={{position: 'absolute', left: 1000, top: 690}}>
      <Personagem ia="qwen" expressao="chocado" falando={false} t={30} virado="esquerda" altura={560} estresse={1} />
    </div>
    <div style={{position: 'absolute', left: 500, top: 34, transform: "rotate(3deg)", border: '6px solid #000', borderRadius: 18, overflow: 'hidden', boxShadow: '0 10px 0 #000a'}}>
      <MonitorEstresse estresse={100} bpm={152} t={18} largura={330} altura={200} />
    </div>
    <div style={{position: 'absolute', left: 30, top: 22, fontFamily: FONT.comic, fontSize: 132, lineHeight: 0.9, color: '#fff', WebkitTextStroke: '6px #000', textShadow: '0 10px 0 #000', transform: 'rotate(-3deg)'}}>
      QUEM<br /><span style={{color: '#ff3b3b'}}>MENTIU?</span>
    </div>
    <div style={{position: 'absolute', left: 40, bottom: 30, padding: '8px 22px', background: '#ffd21f', border: '6px solid #000', borderRadius: 16, fontFamily: FONT.display, fontWeight: 900, fontSize: 42, color: '#000', transform: 'rotate(-2deg)'}}>
      6 IAs · INTERROGATÓRIO
    </div>
  </AbsoluteFill>
);
