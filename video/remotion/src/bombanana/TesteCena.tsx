import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Sala} from './Sala';
import {Macaco} from './Macaco';
import {Bomba} from './Bomba';
export const TesteCena: React.FC<{modulos: any[]; lugar: any}> = ({modulos, lugar}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sala lugar={lugar ?? 'van'} frame={f} />
      <div style={{position: 'absolute', left: 120, top: 330, width: 520, height: 650}}><Macaco papel="Cego" cor="#d97757" gesto="" frame={f} /></div>
      <div style={{position: 'absolute', left: 1280, top: 300, width: 500, height: 620}}><Macaco papel="Surdo" cor="#10a37f" boca={0.6} frame={f} /></div>
      <div style={{position: 'absolute', left: 760, top: 200, width: 400, height: 500}}><Macaco papel="Mudo" cor="#4285f4" gesto="dedos:2" manual frame={f} /></div>
      <div style={{position: 'absolute', left: 700, top: 600, width: 520, height: 420}}><Bomba modulos={modulos ?? []} resta={95} erros={0} maxErros={3} /></div>
    </AbsoluteFill>
  );
};
