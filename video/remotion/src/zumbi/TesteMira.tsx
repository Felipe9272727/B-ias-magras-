import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ArteMira, CamadaViva} from './ArteMira';
import {MUNDO} from './mapaMira';
export const TesteMira: React.FC = () => {
  const f = useCurrentFrame();
  const s = Math.min(1920 / MUNDO.w, 1080 / MUNDO.h);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', left: (1920 - MUNDO.w * s) / 2, top: (1080 - MUNDO.h * s) / 2, width: MUNDO.w, height: MUNDO.h, transform: `scale(${s})`, transformOrigin: '0 0'}}>
        <ArteMira /><CamadaViva f={f} />
      </div>
    </AbsoluteFill>
  );
};
