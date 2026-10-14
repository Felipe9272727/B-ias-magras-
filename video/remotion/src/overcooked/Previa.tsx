// Prévia da cozinha (teste do visual): uma cozinha em tela cheia ou as quatro do versus em 2×2.
import React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {Cozinha, Pedidos, type LogOC} from './Cozinha';
import {Cozinha3D} from './Cozinha3D';

export const calcPreviaOC: CalculateMetadataFunction<{log: LogOC | null; cz: number; de: number; grade: boolean; d3?: boolean}> = async ({props}) => {
  const log = (await (await fetch(staticFile('overcooked/previa.json'))).json()) as LogOC;
  return {props: {...props, log}, durationInFrames: Math.max(30, (log.tiques.length - props.de) * 60)};
};

export const PreviaOC: React.FC<{log: LogOC | null; cz: number; de: number; grade: boolean; d3?: boolean}> = ({log, cz, de, grade, d3 = true}) => {
  const K = (p: any) => (d3 ? <Cozinha3D {...p} Pedidos={Pedidos} /> : <Cozinha {...p} />);
  const f = useCurrentFrame();
  if (!log) return <AbsoluteFill style={{background: '#000'}} />;
  const t = de + f / 60;
  if (!grade) return <AbsoluteFill>{K({log, cz, t, w: 1920, h: 1080})}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {log.cozinhas.map((_, i) => (
        <div key={i} style={{position: 'absolute', left: (i % 2) * 960, top: Math.floor(i / 2) * 540, width: 960, height: 540, overflow: 'hidden', border: '3px solid #000', boxSizing: 'border-box'}}>
          {K({log, cz: i, t, w: 960, h: 540})}
        </div>
      ))}
    </AbsoluteFill>
  );
};
