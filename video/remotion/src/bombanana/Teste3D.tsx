import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cena3D, CAMERAS} from './Cena3D';
export const Teste3D: React.FC<{cam: string}> = ({cam}) => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Cena3D width={width} height={height} t={f} resta={95} luzes={['vermelha', 'verde']} lugar="van" camera={CAMERAS[cam ?? 'geral']}
        atores={{Cego: {papel: 'Cego', cor: '#d97757', boca: 0.5, gesto: (cam === 'lado' ? 'teste' : ''), mexendo: 1}, Surdo: {papel: 'Surdo', cor: '#10a37f', boca: 0, gesto: 'apontar:esquerda'}, Mudo: {papel: 'Mudo', cor: '#4285f4', boca: 0, gesto: (cam === 'lado' ? 'zero' : 'dedos:3')}}} />
    </AbsoluteFill>
  );
};
