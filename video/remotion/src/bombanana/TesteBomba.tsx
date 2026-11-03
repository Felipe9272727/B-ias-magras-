import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Bomba} from './Bomba';
export const TesteBomba: React.FC<{modulos: any[]}> = ({modulos}) => (
  <AbsoluteFill style={{background: '#1b3a6b', padding: 40}}><Bomba modulos={modulos ?? []} resta={125} erros={1} maxErros={3} foco={0} /></AbsoluteFill>
);
