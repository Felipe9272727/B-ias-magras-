// Prévia das roupas e pets do AU4 (só para conferir visual): cada roupa num tripulante de cor diferente, parado e
// andando, e cada pet ao lado de um tripulante. Use: npx remotion still AU4Roupas out/x.png --frame=10
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COR} from './Crewmate';
import {Crewmate4} from './Crewmate4';
import {PETS, ROUPAS} from './roupas4';

export const AU4Roupas: React.FC = () => {
  const f = useCurrentFrame();
  const cores = Object.keys(COR);
  const roupas = Object.entries(ROUPAS);
  const pets = Object.entries(PETS);
  const rotulo: React.CSSProperties = {position: 'absolute', width: 170, textAlign: 'center', color: '#f2f5fb', fontFamily: 'sans-serif', fontSize: 22, fontWeight: 700};
  return (
    <AbsoluteFill style={{background: '#1e2740'}}>
      <div style={{position: 'absolute', top: 24, width: '100%', textAlign: 'center', color: '#fff', fontFamily: 'sans-serif', fontSize: 44, fontWeight: 800}}>ROUPAS E PETS · AU4</div>
      {roupas.map(([id, r], i) => {
        const x = 60 + (i % 6) * 300, y = 100 + Math.floor(i / 6) * 330
        return (
          <div key={id}>
            <Crewmate4 cor={cores[i % cores.length]} size={120} t={f} roupa={id} style={{position: 'absolute', left: x, top: y}} />
            <Crewmate4 cor={cores[(i + 5) % cores.length]} size={120} t={f} passo={f / 16} roupa={id} virado style={{position: 'absolute', left: x + 125, top: y}} />
            <div style={{...rotulo, left: x + 40, top: y + 155}}>{r.nome}</div>
          </div>
        )
      })}
      {pets.map(([id, p], i) => {
        const x = 120 + i * 290, y = 800
        return (
          <div key={id}>
            <Crewmate4 cor={cores[(i + 2) % cores.length]} size={120} t={f} passo={f / 16} pet={id} style={{position: 'absolute', left: x, top: y}} />
            <div style={{...rotulo, left: x - 20, top: y + 155}}>{p.nome}</div>
          </div>
        )
      })}
    </AbsoluteFill>
  );
};
