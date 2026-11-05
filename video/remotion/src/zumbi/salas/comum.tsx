// Peças comuns da arte do Mira HQ de Halloween (desenho próprio em SVG, sem emoji). Todas as salas usam o mesmo
// estilo do jogo: contorno preto grosso (L), cores chapadas com uma sombra mais escura, e as decorações de Halloween daqui.
import React from 'react';
import type {Sala} from '../mapaMira';

export const L = '#121014'; // contorno
export type SalaProps = {r: Sala}; // cada sala desenha TUDO dentro do retângulo r (x, y, w, h em px de mundo)
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// piso de ladrilhos (padrão SVG) — use como fill do chão da sala
export const Piso: React.FC<{id: string; r: Sala; a: string; b: string; tam?: number}> = ({id, r, a, b, tam = 64}) => (
  <>
    <defs>
      <pattern id={id} width={tam} height={tam} patternUnits="userSpaceOnUse">
        <rect width={tam} height={tam} fill={a} />
        <rect width={tam / 2} height={tam / 2} fill={b} /><rect x={tam / 2} y={tam / 2} width={tam / 2} height={tam / 2} fill={b} />
      </pattern>
    </defs>
    <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={`url(#${id})`} />
  </>
);

export const Abobora: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={26} rx={30} ry={7} fill="#000" opacity={0.35} />
    <circle cx={0} cy={0} r={42} fill="#ff9a2a" opacity={0.18} />
    <ellipse cx={-14} cy={4} rx={16} ry={22} fill="#e8701a" stroke={L} strokeWidth={4} />
    <ellipse cx={14} cy={4} rx={16} ry={22} fill="#e8701a" stroke={L} strokeWidth={4} />
    <ellipse cx={0} cy={4} rx={16} ry={23} fill="#f58a24" stroke={L} strokeWidth={4} />
    <path d="M-3 -18 Q0 -30 8 -30" stroke="#3d6b22" strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M-18 -2 L-9 -9 L-6 0 Z M18 -2 L9 -9 L6 0 Z" fill="#ffe27a" />
    <path d="M-16 10 L-10 16 L-4 11 L2 17 L8 11 L14 16 L18 9 Q0 26 -16 10 Z" fill="#ffe27a" />
  </g>
);

export const Teia: React.FC<{x: number; y: number; r?: number; rot?: number}> = ({x, y, r = 70, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`} stroke="#e8e8f0" strokeWidth={2} fill="none" opacity={0.55}>
    {[0, 22, 45, 68, 90].map((a) => <line key={a} x1={0} y1={0} x2={r * Math.cos((a * Math.PI) / 180)} y2={r * Math.sin((a * Math.PI) / 180)} />)}
    {[0.35, 0.6, 0.85].map((k) => (
      <path key={k} d={[0, 22, 45, 68, 90].map((a, i) => `${i ? 'Q' : 'M'}${i ? `${r * k * 0.8 * Math.cos(((a - 11) * Math.PI) / 180)} ${r * k * 0.8 * Math.sin(((a - 11) * Math.PI) / 180)} ` : ''}${r * k * Math.cos((a * Math.PI) / 180)} ${r * k * Math.sin((a * Math.PI) / 180)}`).join(' ')} />
    ))}
  </g>
);

export const Vela: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle cx={0} cy={-26} r={22} fill="#ffcf6a" opacity={0.2} />
    <rect x={-6} y={-16} width={12} height={24} rx={3} fill="#f3ead2" stroke={L} strokeWidth={3} />
    <path d="M0 -30 Q6 -22 0 -17 Q-6 -22 0 -30 Z" fill="#ffb02a" />
  </g>
);

export const Caveira: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-16 4 Q-18 -20 0 -20 Q18 -20 16 4 L10 8 L10 14 L-10 14 L-10 8 Z" fill="#efe9da" stroke={L} strokeWidth={4} />
    <circle cx={-7} cy={-4} r={5} fill={L} /><circle cx={7} cy={-4} r={5} fill={L} />
    <path d="M-5 14 L-5 8 M0 14 L0 8 M5 14 L5 8" stroke={L} strokeWidth={2.5} />
  </g>
);

// guirlanda de luzinhas laranja/roxas (para pendurar na parede de cima)
export const Luzinhas: React.FC<{x1: number; x2: number; y: number}> = ({x1, x2, y}) => {
  const n = Math.max(3, Math.floor((x2 - x1) / 60));
  return (
    <g>
      <path d={`M${x1} ${y} Q${(x1 + x2) / 2} ${y + 30} ${x2} ${y}`} stroke={L} strokeWidth={3} fill="none" />
      {Array.from({length: n}).map((_, i) => {
        const k = (i + 0.5) / n, x = x1 + (x2 - x1) * k, yy = y + 30 * 4 * k * (1 - k) * 0.5 + 6;
        return <circle key={i} cx={x} cy={yy} r={7} fill={i % 2 ? '#b06aff' : '#ff8a2a'} stroke={L} strokeWidth={2} />;
      })}
    </g>
  );
};
