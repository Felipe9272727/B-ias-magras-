// Thumbnail do Lobisomem das IAs (1280×720): a Boticária (o Bobo) rindo, o lobo e a frase em caixa alta. Sem emoji.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LogoLobo} from './Cenas';
import {IconePapel} from './Papeis';
import {FONTE, Quadro, ROSA} from './Tela';

export const ThumbLobo: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 30% 50%, #ff7aa8, ${ROSA} 45%, #8e0038 100%)`, overflow: 'hidden'}}>
    {Array.from({length: 14}).map((_, i) => <div key={i} style={{position: 'absolute', left: 330, top: 380, width: 1600, height: 60, background: 'rgba(255,255,255,0.08)', transformOrigin: '0 50%', transform: `rotate(${i * 25.7}deg)`}} />)}
    <div style={{position: 'absolute', left: 40, top: 110, transform: 'rotate(-4deg)', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.5))'}}>
      <Quadro j={{id: 'boticaria', nome: 'Boticária', modelo: 'GLM 5.3 Flash', papel: 'bobo', numero: 3}} s={{expressao: 'rindo', destaque: true}} noite={false} t={20} tam={520} />
    </div>
    <div style={{position: 'absolute', left: 400, top: 420}}><IconePapel papel="bobo" tamanho={200} /></div>
    <div style={{position: 'absolute', right: 30, top: 20, transform: 'rotate(8deg)'}}><LogoLobo tam={230} /></div>
    <div style={{position: 'absolute', left: 610, top: 230, width: 650, fontFamily: FONTE, fontWeight: 900, color: '#fff', fontSize: 104, lineHeight: 0.98, textShadow: '0 8px 0 #5a0024', WebkitTextStroke: '4px #5a0024'}}>
      VOTOU NELA<br /><span style={{color: '#ffe14d'}}>MESMA</span>
    </div>
    <div style={{position: 'absolute', left: 620, top: 580, fontFamily: FONTE, fontWeight: 900, color: '#1d1b26', background: '#fff', fontSize: 46, padding: '4px 22px', borderRadius: 14, transform: 'rotate(-2deg)'}}>8 IAs NO LOBISOMEM</div>
  </AbsoluteFill>
);
