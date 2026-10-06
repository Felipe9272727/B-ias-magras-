import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT} from '../theme';
import {Sprite} from '../components/basics';
import {HL, useHL} from './hl';

// Busca em feixe do planejador: 6 ações por bloco de 6 quadros, mantém os 48 melhores futuros.
export const BeamSearch: React.FC<{highlights: HL}> = ({highlights}) => {
  const frame = useCurrentFrame();
  const h = useHL(highlights);
  const depthMax = 12;
  const grow = interpolate(frame, [10, 150], [0, depthMax], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pruned = h.on('poda');
  const best = h.on('melhor');
  const x0 = 380;
  const y0 = 600;
  const dx = 105;
  // trajetória "melhor": sobe para pular o buraco e pousa adiante
  const bestY = (d: number) => y0 - Math.sin((d / depthMax) * Math.PI) * 230 + d * 4;
  const lines: React.ReactNode[] = [];
  for (let d = 0; d < depthMax; d++) {
    if (d > grow) break;
    const branches = pruned ? 5 : 12;
    for (let b = 0; b < branches; b++) {
      const spread = (b - (branches - 1) / 2) * (pruned ? 26 : 38) * (1 + d * 0.08);
      const ya = bestY(d) + spread * 0.85 + (random(`j${d}-${b}`) - 0.5) * 30;
      const yb = bestY(d + 1) + spread + (random(`k${d}-${b}`) - 0.5) * 30;
      const fall = !pruned && random(`f${d}-${b}`) < 0.25;
      lines.push(
        <line
          key={`${d}-${b}`}
          x1={x0 + d * dx}
          y1={ya}
          x2={x0 + (d + 1) * dx}
          y2={fall ? yb + 160 : yb}
          stroke={fall ? C.red : C.teal}
          strokeOpacity={pruned ? 0.35 : 0.5}
          strokeWidth={3}
        />,
      );
      if (fall) lines.push(<text key={`x${d}-${b}`} x={x0 + (d + 1) * dx - 10} y={yb + 175} fill={C.red} fontSize={28} fontFamily="monospace">✕</text>);
    }
  }
  const bestPath = new Array(depthMax + 1).fill(0).map((_, d) => `${x0 + d * dx},${bestY(d)}`).join(' ');
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Img src={staticFile('stills/planner_bg.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55, filter: 'saturate(0.8)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #11191bcc 0%, #11191b55 40%, #11191b99 100%)'}} />
      <div style={{position: 'absolute', top: 48, width: '100%', textAlign: 'center', fontFamily: FONT.pixel, fontSize: 34, color: C.gold, letterSpacing: 3}}>
        O PLANEJADOR SIMULA O FUTURO
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {lines}
        {best ? <polyline points={bestPath} fill="none" stroke={C.gold} strokeWidth={10} strokeLinejoin="round" strokeDasharray="2000" strokeDashoffset={interpolate(h.since('melhor'), [0, 30], [2000, 0], {extrapolateRight: 'clamp'})} /> : null}
      </svg>
      <div style={{position: 'absolute', left: x0 - 70, top: y0 - 40}}>
        <Sprite name="stand" size={70} />
      </div>
      <div style={{position: 'absolute', right: 70, top: 150, width: 520, display: 'flex', flexDirection: 'column', gap: 18}}>
        {[
          ['6 ações', 'testadas a cada bloco de 6 quadros', true],
          ['até 20 blocos', '≈ 2 segundos de futuro', true],
          ['48 melhores', 'futuros mantidos (o resto é podado)', pruned],
          ['1 caminho', 'o melhor vira as próximas ações', best],
        ].map(([a, b, on], i) => (
          <div key={i} style={{background: '#11191bdd', border: `3px solid ${on ? C.gold : C.line}`, borderRadius: 16, padding: '14px 20px', opacity: on ? 1 : 0.35}}>
            <div style={{fontFamily: FONT.pixel, fontSize: 22, color: C.gold}}>{a as string}</div>
            <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 26, color: C.ink, marginTop: 6}}>{b as string}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 80, top: 160, fontFamily: FONT.mono, fontWeight: 700, fontSize: 28, color: C.teal}}>
        quadros simulados neste plano: {Math.floor(interpolate(frame, [10, 150], [0, 34560], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})).toLocaleString('pt-BR')}
      </div>
    </AbsoluteFill>
  );
};
