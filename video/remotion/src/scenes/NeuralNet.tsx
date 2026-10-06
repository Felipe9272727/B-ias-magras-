import React from 'react';
import {AbsoluteFill, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {GridBackground} from '../components/basics';
import {HL, useHL} from './hl';

const SENSOR_LABELS = ['velocidade X', 'velocidade Y', 'no chão?', 'altura', 'inimigo: dist.', 'inimigo: altura', 'próx. plataforma', 'próx. buraco', 'moeda perto', 'teto?', 'grade 4×4 de terreno', 'ameaça em movimento', 'alvo de pouso', '…'];

// Rede neural estilizada: sensores → neurônios → ações, com ativações piscando.
export const NeuralNet: React.FC<{highlights: HL; inputs?: number; hidden?: number; outputs?: string[]; title?: string}> = ({
  highlights,
  inputs = 44,
  hidden = 32,
  outputs = ['←', 'parado', '→', '← + pulo', 'pulo', '→ + pulo'],
  title,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const h = useHL(highlights);
  const pin = spring({frame, fps, config: {damping: 16}});
  const colX = [470, 960, 1450];
  const inN = SENSOR_LABELS.length;
  const hidN = 10;
  const outN = outputs.length;
  const top = 150;
  const span = 600;
  const ys = (n: number) => new Array(n).fill(0).map((_, i) => top + (span * (i + 0.5)) / n);
  const yi = ys(inN);
  const yh = ys(hidN);
  const yo = ys(outN);
  const tick = Math.floor(frame / 6);
  const act = (seed: string) => random(seed + tick);
  const best = Math.floor(random('best' + Math.floor(frame / 24)) * outN);
  const edges: React.ReactNode[] = [];
  yi.forEach((a, i) =>
    yh.forEach((b, j) => {
      const w = random(`w${i}-${j}`) * 2 - 1;
      edges.push(<line key={`a${i}-${j}`} x1={colX[0] + 18} y1={a} x2={colX[1] - 18} y2={b} stroke={w > 0 ? C.lime : C.red} strokeOpacity={0.08 + Math.abs(w) * 0.22 * (h.on('pesos') ? 1.8 : 1)} strokeWidth={1 + Math.abs(w) * 2} />);
    }),
  );
  yh.forEach((a, j) =>
    yo.forEach((b, k) => {
      const w = random(`v${j}-${k}`) * 2 - 1;
      edges.push(<line key={`b${j}-${k}`} x1={colX[1] + 18} y1={a} x2={colX[2] - 18} y2={b} stroke={w > 0 ? C.lime : C.red} strokeOpacity={0.1 + Math.abs(w) * 0.3} strokeWidth={1 + Math.abs(w) * 2.5} />);
    }),
  );
  return (
    <AbsoluteFill>
      <GridBackground accent={C.teal} />
      <div style={{position: 'absolute', top: 48, width: '100%', textAlign: 'center', fontFamily: FONT.pixel, fontSize: 34, color: C.gold, letterSpacing: 3}}>
        {title ?? `REDE NEURAL · ${inputs} → ${hidden} → ${outN}`}
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: pin}}>
        {edges}
        {yi.map((y, i) => (
          <circle key={'i' + i} cx={colX[0]} cy={y} r={15} fill={C.panel} stroke={C.teal} strokeWidth={3} fillOpacity={1} style={{fill: `rgba(168,217,213,${0.15 + act('i' + i) * 0.85})`}} />
        ))}
        {yh.map((y, j) => (
          <circle key={'h' + j} cx={colX[1]} cy={y} r={20} stroke={C.gold} strokeWidth={3} style={{fill: `rgba(241,207,108,${0.1 + act('h' + j) * 0.9})`}} />
        ))}
        {yo.map((y, k) => (
          <circle key={'o' + k} cx={colX[2]} cy={y} r={22} stroke={k === best ? C.lime : C.line} strokeWidth={k === best ? 6 : 3} style={{fill: k === best ? C.lime : C.panel}} />
        ))}
      </svg>
      {yi.map((y, i) => (
        <div key={'l' + i} style={{position: 'absolute', right: 1920 - colX[0] + 32, top: y - 17, fontFamily: FONT.display, fontWeight: 600, fontSize: 24, color: h.on('sensores') ? C.ink : C.muted, whiteSpace: 'nowrap'}}>
          {SENSOR_LABELS[i]}
        </div>
      ))}
      {yo.map((y, k) => (
        <div key={'o' + k} style={{position: 'absolute', left: colX[2] + 40, top: y - 22, fontFamily: FONT.display, fontWeight: 800, fontSize: 32, color: k === best ? C.lime : C.ink}}>
          {outputs[k]}
        </div>
      ))}
      <div style={{position: 'absolute', top: 770, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '0 260px', fontFamily: FONT.pixel, fontSize: 20, color: C.muted}}>
        <span style={{color: h.on('sensores') ? C.teal : C.muted}}>{inputs} SENSORES</span>
        <span style={{color: h.on('neuronios') ? C.gold : C.muted}}>{hidden} NEURÔNIOS</span>
        <span style={{color: h.on('acoes') ? C.lime : C.muted}}>{outN} AÇÕES</span>
      </div>
    </AbsoluteFill>
  );
};
