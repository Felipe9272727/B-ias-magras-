import React from 'react';
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT} from '../theme';
import {HL, useHL} from './hl';

// Busca em feixe do planejador desenhada sobre um quadro real do jogo.
// O fundo é deslocado 200 px para cima, deixando a faixa das legendas livre.
export const BeamSearch: React.FC<{highlights: HL}> = ({highlights}) => {
  const frame = useCurrentFrame();
  const h = useHL(highlights);
  const depthMax = 12;
  const grow = interpolate(frame, [10, 150], [0, depthMax], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pruned = h.on('poda');
  const best = h.on('melhor');
  const x0 = 842; // posição do Mario no quadro de fundo
  const y0 = 700;
  const dx = 78;
  // trajetória "melhor": sobe para pular o Goomba e o buraco, pousa adiante
  const bestY = (d: number) => y0 - Math.sin((d / depthMax) * Math.PI) * 220;
  const lines: React.ReactNode[] = [];
  for (let d = 0; d < depthMax; d++) {
    if (d > grow) break;
    const branches = pruned ? 5 : 12;
    for (let b = 0; b < branches; b++) {
      const spread = (b - (branches - 1) / 2) * (pruned ? 22 : 30) * (1 + d * 0.08);
      const ya = bestY(d) + spread * 0.85 + (random(`j${d}-${b}`) - 0.5) * 26;
      const yb = bestY(d + 1) + spread + (random(`k${d}-${b}`) - 0.5) * 26;
      const fall = !pruned && random(`f${d}-${b}`) < 0.25;
      lines.push(
        <line
          key={`${d}-${b}`}
          x1={x0 + d * dx}
          y1={ya}
          x2={x0 + (d + 1) * dx}
          y2={fall ? yb + 120 : yb}
          stroke={fall ? C.red : C.teal}
          strokeOpacity={pruned ? 0.45 : 0.6}
          strokeWidth={3}
        />,
      );
      if (fall)
        lines.push(
          <text key={`x${d}-${b}`} x={x0 + (d + 1) * dx - 9} y={yb + 140} fill={C.red} fontSize={26} fontFamily="monospace">
            ✕
          </text>,
        );
    }
  }
  const bestPath = new Array(depthMax + 1)
    .fill(0)
    .map((_, d) => `${x0 + d * dx},${bestY(d)}`)
    .join(' ');
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Img src={staticFile('stills/planner_bg.jpg')} style={{position: 'absolute', left: 0, top: -200, width: 1920, height: 1080, opacity: 0.75}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #11191bdd 0%, #11191b33 22%, #11191b22 60%, #11191b 82%)'}} />
      <div style={{position: 'absolute', top: 44, width: '100%', textAlign: 'center', fontFamily: FONT.pixel, fontSize: 34, color: C.gold, letterSpacing: 3}}>
        O PLANEJADOR SIMULA O FUTURO
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {lines}
        {best ? (
          <polyline
            points={bestPath}
            fill="none"
            stroke={C.gold}
            strokeWidth={10}
            strokeLinejoin="round"
            strokeDasharray="2000"
            strokeDashoffset={interpolate(h.since('melhor'), [0, 30], [2000, 0], {extrapolateRight: 'clamp'})}
          />
        ) : null}
        <circle cx={x0} cy={y0} r={10} fill={C.gold} />
      </svg>
      <div style={{position: 'absolute', left: 70, top: 150, width: 520, display: 'flex', flexDirection: 'column', gap: 16}}>
        {(
          [
            ['6 ações', 'testadas a cada bloco de 6 quadros', true],
            ['até 20 blocos', '≈ 2 segundos de futuro', true],
            ['48 melhores', 'futuros mantidos (o resto é podado)', pruned],
            ['1 caminho', 'o melhor vira as próximas ações', best],
          ] as [string, string, boolean][]
        ).map(([a, b, on], i) => (
          <div key={i} style={{background: '#11191be6', border: `3px solid ${on ? C.gold : C.line}`, borderRadius: 16, padding: '12px 20px', opacity: on ? 1 : 0.35}}>
            <div style={{fontFamily: FONT.pixel, fontSize: 22, color: C.gold}}>{a}</div>
            <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 26, color: C.ink, marginTop: 6}}>{b}</div>
          </div>
        ))}
        <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, color: C.teal, marginTop: 6}}>
          quadros simulados neste plano:
          <br />
          {Math.floor(interpolate(frame, [10, 150], [0, 34560], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})).toLocaleString('pt-BR')}
        </div>
      </div>
    </AbsoluteFill>
  );
};
