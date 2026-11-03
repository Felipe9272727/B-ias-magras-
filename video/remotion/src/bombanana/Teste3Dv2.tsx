import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Cena3D, camPadrao, Lugar3D} from './Cena3Dv2';
const MODS = [{"tipo": "cabo", "nome": "Cabos", "cabos": ["azul", "preto", "preto"], "luz": "vermelha", "cortados": [], "resolvido": false, "acoes": "cortar_cabo(posição 1..N)"}, {"tipo": "slider", "nome": "Slider de Cor", "cor": "laranja", "pos": 3, "resolvido": false, "acoes": "travar_slider(entalhe 1..5)"}];
export const Teste3Dv2: React.FC<{cam: string; gc: string; gs: string; gm: string; lugar: Lugar3D; exp?: number; t?: number; debug?: string; pov?: any; modulos?: any}> = ({cam, gc, gs, gm, lugar, exp, t, debug, pov, modulos}) => {
  const f = useCurrentFrame() + (t ?? 30); const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Cena3D width={width} height={height} t={f} resta={95} erros={1} maxErros={3} lugar={lugar ?? 'van'} camera={camPadrao(cam ?? 'jogo', f)} explosao={exp} debug={debug} pov={pov} modulos={modulos ?? MODS}
        atores={{Cego: {boca: 0.6, gesto: gc ?? 'mexer'}, Surdo: {boca: 0.8, gesto: gs ?? 'falar'}, Mudo: {boca: 0, gesto: gm ?? 'dedos:3'}}} />
    </AbsoluteFill>
  );
};
