// Pré-visualização temporária do desenho da nave (stills para conferir o visual).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Arte} from './Arte';
import {NAVE} from './mapa';
import {TILE} from './spec';

const W = NAVE.cols * TILE;
const H = NAVE.rows * TILE;

type Props = {cx?: number; cy?: number; escala?: number};

// Sem escala: a nave inteira cabe no quadro. Com cx/cy/escala: câmera centrada num ponto do mundo.
export const ArtePreview: React.FC<Props> = ({cx, cy, escala}) => {
  const s = escala ?? Math.min(1920 / W, 1080 / H);
  const x = cx ?? W / 2;
  const y = cy ?? H / 2;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0',
          transform: `translate(${960 - x * s}px, ${540 - y * s}px) scale(${s})`,
        }}
      >
        <Arte />
      </div>
    </AbsoluteFill>
  );
};
