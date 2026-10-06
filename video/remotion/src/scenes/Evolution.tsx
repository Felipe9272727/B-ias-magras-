import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {GridBackground, Sprite} from '../components/basics';
import {HL, useHL} from './hl';

// 64 Marios: aleatórios → ranqueados → elite preservada + mutantes + novatos.
export const Evolution: React.FC<{highlights: HL}> = ({highlights}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const h = useHL(highlights);
  const fitness = new Array(64).fill(0).map((_, i) => random('fit' + i) ** 2);
  const order = fitness.map((f, i) => [f, i] as [number, number]).sort((a, b) => b[0] - a[0]).map((x) => x[1]);
  const rankOf = new Array(64).fill(0);
  order.forEach((idx, r) => (rankOf[idx] = r));
  const ranked = h.on('rank');
  const rp = ranked ? spring({frame: h.since('rank'), fps, config: {damping: 18}}) : 0;
  const nextGen = h.on('mutacao');
  const np = nextGen ? spring({frame: h.since('mutacao'), fps, config: {damping: 16}}) : 0;
  const cell = 74;
  const gridX = (i: number) => 120 + (i % 8) * cell;
  const gridY = (i: number) => 200 + Math.floor(i / 8) * cell;

  const sprites = new Array(64).fill(0).map((_, i) => {
    const slot = ranked ? rankOf[i] : i;
    const x = interpolate(rp, [0, 1], [gridX(i), gridX(slot)]);
    const y = interpolate(rp, [0, 1], [gridY(i), gridY(slot)]);
    const r = rankOf[i];
    const elite = ranked && r < 7;
    const dead = ranked && r >= 48;
    const bob = Math.sin((frame + i * 7) / 6) * 3;
    return (
      <div key={i} style={{position: 'absolute', left: x, top: y + bob, opacity: dead ? 0.35 : 1}}>
        <Sprite name={Math.floor((frame + i) / 6) % 2 ? 'run' : 'stand'} size={46} tint={elite ? undefined : `hsl(${Math.round(fitness[i] * 120)},55%,60%)`} />
        {elite ? <div style={{position: 'absolute', top: -26, left: 8, fontSize: 26}}>👑</div> : null}
      </div>
    );
  });

  // próxima geração (direita)
  const next = new Array(64).fill(0).map((_, j) => {
    const kind = j < 7 ? 'elite' : j >= 58 ? 'novo' : 'mutante';
    const appear = spring({frame: h.since('mutacao') - j * 0.6, fps, config: {damping: 14}});
    const showNew = kind !== 'novo' || h.on('novatos');
    const x = 1180 + (j % 8) * cell;
    const y = 200 + Math.floor(j / 8) * cell;
    const tint = kind === 'elite' ? undefined : kind === 'novo' ? '#9a9a9a' : `hsl(${Math.round(80 + random('m' + j) * 60)},55%,62%)`;
    return (
      <div key={'n' + j} style={{position: 'absolute', left: x, top: y, transform: `scale(${nextGen && showNew ? appear : 0})`}}>
        <Sprite name="stand" size={46} tint={tint} />
        {kind === 'novo' ? <div style={{position: 'absolute', top: -8, left: 30, fontFamily: FONT.pixel, fontSize: 18, color: C.gold}}>?</div> : null}
        {kind === 'mutante' && Math.floor(frame / 4 + j) % 9 === 0 ? <div style={{position: 'absolute', top: -14, left: 30, fontSize: 20}}>✨</div> : null}
      </div>
    );
  });

  return (
    <AbsoluteFill>
      <GridBackground accent={C.teal} />
      <div style={{position: 'absolute', top: 48, width: '100%', textAlign: 'center', fontFamily: FONT.pixel, fontSize: 34, color: C.gold, letterSpacing: 3}}>
        SELEÇÃO NATURAL, VERSÃO MARIO
      </div>
      <div style={{position: 'absolute', left: 120, top: 130, width: 592, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: C.ink}}>
        Geração N {ranked ? <span style={{color: C.gold}}>· ranqueada</span> : null}
      </div>
      {sprites}
      <svg width={1920} height={1080} style={{position: 'absolute', pointerEvents: 'none'}}>
        {nextGen ? (
          <g opacity={np}>
            <path d="M 740 420 C 880 360, 1020 360, 1150 420" stroke={C.gold} strokeWidth={8} fill="none" strokeDasharray="18 12" strokeDashoffset={-frame * 2} />
            <polygon points="1150,420 1124,400 1128,432" fill={C.gold} />
          </g>
        ) : null}
      </svg>
      {nextGen ? (
        <div style={{position: 'absolute', left: 1180, top: 130, width: 592, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: C.ink, opacity: np}}>
          Geração N+1
        </div>
      ) : null}
      {next}
      <div style={{position: 'absolute', top: 820 - 60, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 60, fontFamily: FONT.display, fontWeight: 800, fontSize: 30}}>
        <span style={{color: C.gold, opacity: h.on('rank') ? 1 : 0.25}}>👑 10% elite intacta</span>
        <span style={{color: C.lime, opacity: h.on('mutacao') ? 1 : 0.25}}>✨ 80% cópias com mutação</span>
        <span style={{color: C.muted, opacity: h.on('novatos') ? 1 : 0.25}}>? 10% novatos aleatórios</span>
      </div>
    </AbsoluteFill>
  );
};
