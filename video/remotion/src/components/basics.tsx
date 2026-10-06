import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {PALETTE, SPRITES} from '../spriteData';
import {C, FONT} from '../theme';

// Sprite em pixel art desenhado como SVG (pixels nítidos em qualquer escala).
export const Sprite: React.FC<{name: string; size: number; tint?: string; flip?: boolean; style?: React.CSSProperties; opacity?: number}> = ({
  name,
  size,
  tint,
  flip,
  style,
  opacity = 1,
}) => {
  const rows = SPRITES[name] ?? SPRITES.stand;
  const h = rows.length;
  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) =>
    [...row].forEach((code, x) => {
      if (code === '.') return;
      const fill = tint && (code === 'r' || code === 'o') ? tint : PALETTE[code];
      rects.push(<rect key={x + '-' + y} x={x} y={y} width={1.04} height={1.04} fill={fill} />);
    }),
  );
  return (
    <svg
      viewBox={`0 0 16 ${h}`}
      width={size}
      height={(size * h) / 16}
      style={{shapeRendering: 'crispEdges', transform: flip ? 'scaleX(-1)' : undefined, opacity, overflow: 'visible', ...style}}
    >
      {rects}
    </svg>
  );
};

// Fundo escuro com grade sutil e "poeira" de pixels subindo.
export const GridBackground: React.FC<{accent?: string; dim?: number}> = ({accent = C.lime, dim = 1}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const particles = new Array(36).fill(0).map((_, i) => {
    const x = random('px' + i) * width;
    const speed = 0.4 + random('ps' + i) * 1.2;
    const y = height - ((frame * speed + random('py' + i) * height) % (height + 40));
    const s = 4 + Math.floor(random('pz' + i) * 3) * 4;
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: s, height: s, background: i % 3 === 0 ? accent : C.line, opacity: 0.35 * dim}} />;
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 35%, #1a2729 0%, ${C.bg} 55%, ${C.bg2} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.line}55 1px, transparent 1px), linear-gradient(90deg, ${C.line}55 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          backgroundPosition: `0px ${(frame * 0.6) % 64}px`,
          opacity: 0.55 * dim,
        }}
      />
      {particles}
    </AbsoluteFill>
  );
};

// Entrada com mola (escala + opacidade).
export const usePop = (delay = 0, damping = 12) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, stiffness: 180, mass: 0.7}});
};

export const Pill: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = C.lime, style}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 22px',
      borderRadius: 999,
      border: `3px solid ${color}`,
      color,
      fontFamily: FONT.pixel,
      fontSize: 22,
      background: '#0b1112cc',
      letterSpacing: 1,
      ...style,
    }}
  >
    {children}
  </div>
);

// Texto com contorno grosso estilo "YouTube".
export const strokeText = (px: number, color = '#000'): React.CSSProperties => ({
  WebkitTextStroke: `${px}px ${color}`,
  paintOrder: 'stroke fill',
});

export const Panel: React.FC<{children: React.ReactNode; style?: React.CSSProperties; color?: string}> = ({children, style, color = C.line}) => (
  <div
    style={{
      background: `linear-gradient(180deg, ${C.panel} 0%, #172022 100%)`,
      border: `2px solid ${color}`,
      borderRadius: 22,
      boxShadow: '0 30px 80px #0008',
      ...style,
    }}
  >
    {children}
  </div>
);

export const fadeInOut = (frame: number, dur: number, inF = 8, outF = 8) =>
  interpolate(frame, [0, inF, dur - outF, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
