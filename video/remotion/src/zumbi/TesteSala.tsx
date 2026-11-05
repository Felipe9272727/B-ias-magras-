// Prévia de uma sala do Mira HQ (para quem desenha conferir): zoom na sala pedida (props.sala) ou no mapa todo.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ArteMira, CamadaViva} from './ArteMira';
import {MUNDO, SALAS, type SalaId} from './mapaMira';
export const TesteSala: React.FC<{sala?: SalaId}> = ({sala}) => {
  const f = useCurrentFrame();
  const r = sala ? SALAS[sala] : {x: 0, y: 0, w: MUNDO.w, h: MUNDO.h};
  const m = sala ? 120 : 0;
  const s = Math.min(1920 / (r.w + 2 * m), 1080 / (r.h + 2 * m));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', left: 960 - (r.x + r.w / 2) * s, top: 540 - (r.y + r.h / 2) * s, width: MUNDO.w, height: MUNDO.h, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        <ArteMira /><CamadaViva f={f} />
      </div>
    </AbsoluteFill>
  );
};
