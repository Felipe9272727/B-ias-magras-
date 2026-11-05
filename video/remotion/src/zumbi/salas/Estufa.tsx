// Estufa (topo do mapa): piso verde-azulado, passarela de vidro em X, canteiros com abóboras gigantes, árvores secas,
// teias e luzinhas. Deixa ~70 px livres embaixo para o nome.
import React from 'react';
import {Abobora, L, Luzinhas, Piso, rnd, type SalaProps, Teia} from './comum';

const Arvore: React.FC<{x: number; y: number; s: number; i: number}> = ({x, y, s, i}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={4} rx={34} ry={8} fill="#000" opacity={0.35} />
    <path d="M-10 0 L-6 -50 Q-8 -80 -2 -100 L6 -100 Q10 -70 8 -48 L12 0 Z" fill="#4a3526" stroke={L} strokeWidth={5} />
    <g stroke={L} strokeWidth={4} fill="none" strokeLinecap="round">
      <path d="M0 -70 Q-30 -85 -48 -120 M-24 -96 L-52 -96" stroke="#4a3526" strokeWidth={8} />
      <path d="M2 -88 Q32 -100 52 -134 M30 -112 L58 -108" stroke="#4a3526" strokeWidth={8} />
      <path d="M0 -100 Q-6 -130 -18 -150 M-4 -126 L14 -146" stroke="#4a3526" strokeWidth={7} />
    </g>
    {[[-48, -120], [52, -134], [-18, -150], [14, -146]].map(([a, b], k) => <circle key={k} cx={a} cy={b} r={5 + rnd(i + k) * 3} fill="#6b8a3a" stroke={L} strokeWidth={2} />)}
  </g>
);

const Canteiro: React.FC<{x: number; y: number; w: number; i: number}> = ({x, y, w, i}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={0} y={0} width={w} height={44} rx={8} fill="#6b4a2e" stroke={L} strokeWidth={6} />
    <rect x={6} y={6} width={w - 12} height={20} rx={5} fill="#3b2a1a" />
    {Array.from({length: Math.floor(w / 46)}).map((_, k) => (
      <path key={k} d={`M${24 + k * 46} 18 q-8 -22 -14 -28 M${24 + k * 46} 18 q4 -26 12 -30`} stroke="#58b04a" strokeWidth={6} fill="none" strokeLinecap="round" />
    ))}
    <rect x={0} y={32} width={w} height={12} fill="#00000033" />
    <g transform={`translate(${w * (0.3 + rnd(i) * 0.4)},-8)`}><Abobora x={0} y={0} s={1.15} /></g>
  </g>
);

export const SalaEstufa: React.FC<SalaProps> = ({r}) => {
  const top = r.y, h = r.h - 70, cx = r.x + r.w / 2;
  return (
    <g>
      <Piso id="estufa_piso" r={r} a="#3f6d6a" b="#38625f" tam={56} />
      {/* parede de vidro do fundo com cúpula */}
      <rect x={r.x} y={top} width={r.w} height={64} fill="#3a4a58" />
      {Array.from({length: Math.floor(r.w / 110)}).map((_, k) => (
        <rect key={k} x={r.x + 14 + k * 110} y={top + 10} width={92} height={44} rx={6} fill="#142a3a" stroke={L} strokeWidth={5} />
      ))}
      <rect x={cx - 130} y={top} width={260} height={74} rx={30} fill="#7fa5b8" stroke={L} strokeWidth={8} />
      <rect x={cx - 100} y={top + 12} width={200} height={50} rx={22} fill="#b9dbe8" opacity={0.7} />
      {/* passarela em X de vidro */}
      <g stroke={L} strokeWidth={8} strokeLinejoin="round">
        <polygon points={`${cx - 300},${top + 70} ${cx - 240},${top + 70} ${cx + 300},${top + h} ${cx + 240},${top + h}`} fill="#a9d4e6" />
        <polygon points={`${cx + 300},${top + 70} ${cx + 240},${top + 70} ${cx - 300},${top + h} ${cx - 240},${top + h}`} fill="#a9d4e6" />
        <rect x={cx - 52} y={top + h - 6} width={104} height={12} fill="#7fb0c8" />
      </g>
      <g stroke="#e8f6fb" strokeWidth={3} opacity={0.7}>
        <line x1={cx - 270} y1={top + 70} x2={cx + 270} y2={top + h} /><line x1={cx + 270} y1={top + 70} x2={cx - 270} y2={top + h} />
      </g>
      {/* canteiros com abóboras */}
      <Canteiro x={r.x + 40} y={top + 96} w={210} i={1} />
      <Canteiro x={r.x + 300} y={top + h - 78} w={240} i={2} />
      <Canteiro x={r.x + r.w - 250} y={top + 96} w={210} i={3} />
      <Canteiro x={r.x + r.w - 540} y={top + h - 78} w={240} i={4} />
      <Canteiro x={cx - 460} y={top + 100} w={180} i={5} />
      <Canteiro x={cx + 280} y={top + 100} w={180} i={6} />
      {/* árvores secas */}
      <Arvore x={r.x + 60} y={top + h - 6} s={1.5} i={1} />
      <Arvore x={r.x + r.w - 70} y={top + h - 6} s={1.5} i={9} />
      <Arvore x={cx - 160} y={top + 150} s={1.1} i={4} />
      <Arvore x={cx + 170} y={top + 150} s={1.1} i={7} />
      <Abobora x={cx - 600} y={top + h - 40} s={1.6} />
      <Abobora x={cx + 620} y={top + h - 40} s={1.6} />
      <Teia x={r.x + 6} y={r.y + 6} r={130} />
      <Teia x={r.x + r.w - 6} y={r.y + 6} r={130} rot={90} />
      <Luzinhas x1={r.x + 60} x2={cx - 150} y={top + 70} />
      <Luzinhas x1={cx + 150} x2={r.x + r.w - 60} y={top + 70} />
    </g>
  );
};
