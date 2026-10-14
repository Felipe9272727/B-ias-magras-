// Prévia da cozinha (teste do visual): uma cozinha em tela cheia ou as quatro do versus em 2×2.
import React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {Cozinha, type LogOC} from './Cozinha';

export const calcPreviaOC: CalculateMetadataFunction<{log: LogOC | null; cz: number; de: number; grade: boolean}> = async ({props}) => {
  const log = (await (await fetch(staticFile('overcooked/previa.json'))).json()) as LogOC;
  return {props: {...props, log}, durationInFrames: Math.max(30, (log.tiques.length - props.de) * 60)};
};

export const PreviaOC: React.FC<{log: LogOC | null; cz: number; de: number; grade: boolean}> = ({log, cz, de, grade}) => {
  const f = useCurrentFrame();
  if (!log) return <AbsoluteFill style={{background: '#000'}} />;
  const t = de + f / 60;
  if (!grade) return <AbsoluteFill><Cozinha log={log} cz={cz} t={t} w={1920} h={1080} /></AbsoluteFill>;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {log.cozinhas.map((_, i) => (
        <div key={i} style={{position: 'absolute', left: (i % 2) * 960, top: Math.floor(i / 2) * 540, width: 960, height: 540, overflow: 'hidden', border: '3px solid #000', boxSizing: 'border-box'}}>
          <Cozinha log={log} cz={i} t={t} w={960} h={540} />
        </div>
      ))}
    </AbsoluteFill>
  );
};
