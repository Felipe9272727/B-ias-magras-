import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Macaco} from './Macaco';
export const TesteBB: React.FC = () => (
  <AbsoluteFill style={{background: '#20407a', display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
    {([['Cego', '#d97757', 'polegar_cima'], ['Surdo', '#10a37f', 'apontar:esquerda'], ['Mudo', '#4285f4', 'dedos:3'], ['Cego', '#888', ''], ['Surdo', '#e91e63', 'mao_parada'], ['Mudo', '#ff6900', 'jogar_banana']] as const).map(([p, c, g], i) => (
      <div key={i} style={{width: 640, height: 540}}><Macaco papel={p} cor={c} gesto={g} boca={i === 1 ? 0.8 : 0} manual={p === 'Mudo'} /></div>
    ))}
  </AbsoluteFill>
);
