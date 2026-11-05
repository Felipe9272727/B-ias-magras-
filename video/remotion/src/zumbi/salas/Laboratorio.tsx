// Laboratório (ao lado do Reator): piso claro azulado, bancadas com computadores e telas, tubos de amostra verdes,
// mesa grande no centro; Halloween: tubos borbulhando, frasco com olho, abóbora, teia, velas.
import React from 'react';
import {Abobora, L, Piso, rnd, type SalaProps, Teia, Vela} from './comum';

const Tubo: React.FC<{x: number; y: number; s?: number; i: number}> = ({x, y, s = 1, i}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-16} y={-70} width={32} height={80} rx={14} fill="#bfeedd" fillOpacity={0.45} stroke={L} strokeWidth={5} />
    <rect x={-12} y={-34} width={24} height={40} rx={10} fill="#5aff7a" />
    {[0, 1, 2].map((k) => <circle key={k} cx={-6 + k * 7} cy={-40 - rnd(i + k) * 18} r={3 + k} fill="#c9ffd0" stroke={L} strokeWidth={1.5} />)}
    <rect x={-20} y={-76} width={40} height={10} rx={4} fill="#5a6270" stroke={L} strokeWidth={4} />
  </g>
);

const Bancada: React.FC<{x: number; y: number; w: number; h: number; i: number}> = ({x, y, w, h, i}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={8} fill="#8fa3b0" stroke={L} strokeWidth={7} />
    <rect x={x + 6} y={y + h - 16} width={w - 12} height={10} fill="#00000033" />
    {Array.from({length: Math.max(1, Math.floor(w / 110))}).map((_, k) => (
      <g key={k} transform={`translate(${x + 30 + k * 110},${y + 12})`}>
        <rect width={64} height={44} rx={5} fill="#1c2a38" stroke={L} strokeWidth={5} />
        <rect x={6} y={6} width={52} height={28} fill={k % 2 ? '#7ae8ff' : '#5aff7a'} opacity={0.85} />
        <rect x={20} y={46} width={24} height={8} fill="#5a6270" />
      </g>
    ))}
    <Tubo x={x + w - 30} y={y + 40} s={0.7} i={i} />
  </g>
);

export const SalaLaboratorio: React.FC<SalaProps> = ({r}) => {
  const cx = r.x + r.w / 2, W = r.w, H = r.h - 70;
  return (
    <g>
      <Piso id="lab_piso" r={r} a="#dfe9ee" b="#ccdae2" tam={72} />
      <rect x={r.x} y={r.y} width={W} height={86} fill="#56707e" />
      <rect x={r.x} y={r.y + 78} width={W} height={10} fill="#33464f" />
      {/* janelas */}
      {[0.2, 0.5, 0.8].map((k) => <rect key={k} x={r.x + W * k - 45} y={r.y + 14} width={90} height={44} rx={8} fill="#142a3a" stroke={L} strokeWidth={6} />)}
      {/* bancadas ao longo do fundo e da lateral */}
      <Bancada x={r.x + 16} y={r.y + 96} w={200} h={76} i={1} />
      <Bancada x={r.x + W - 216} y={r.y + 96} w={200} h={76} i={2} />
      <Bancada x={r.x + 14} y={r.y + 190} w={64} h={150} i={3} />
      <Bancada x={r.x + W - 78} y={r.y + 190} w={64} h={150} i={4} />
      {/* tubos de amostra verdes em fila */}
      {[0, 1, 2, 3, 4].map((k) => <Tubo key={k} x={cx - 70 + k * 36} y={r.y + 168} i={k} />)}
      {/* mesa grande */}
      <g stroke={L} strokeWidth={9}>
        <rect x={cx - 150} y={r.y + 270} width={300} height={140} rx={22} fill="#a8bac6" />
        <rect x={cx - 134} y={r.y + 282} width={268} height={100} rx={14} fill="#c7d6df" />
      </g>
      <rect x={cx - 120} y={r.y + 292} width={64} height={44} rx={6} fill="#1c2a38" stroke={L} strokeWidth={5} />
      <rect x={cx - 114} y={r.y + 298} width={52} height={30} fill="#5aff7a" opacity={0.85} />
      <rect x={cx + 56} y={r.y + 292} width={64} height={44} rx={6} fill="#1c2a38" stroke={L} strokeWidth={5} />
      <rect x={cx + 62} y={r.y + 298} width={52} height={30} fill="#7ae8ff" opacity={0.85} />
      {/* frasco com olho */}
      <g transform={`translate(${cx},${r.y + 350}) scale(0.8)`}>
        <rect x={-30} y={-46} width={60} height={70} rx={22} fill="#bfeedd" fillOpacity={0.6} stroke={L} strokeWidth={5} />
        <rect x={-26} y={-18} width={52} height={38} rx={16} fill="#5aff7a" opacity={0.8} />
        <ellipse cx={0} cy={-2} rx={17} ry={12} fill="#fff" stroke={L} strokeWidth={3} />
        <circle cx={0} cy={-2} r={7} fill="#c0392b" stroke={L} strokeWidth={2} /><circle cx={0} cy={-2} r={3} fill={L} />
        <rect x={-18} y={-56} width={36} height={12} rx={4} fill="#5a6270" stroke={L} strokeWidth={4} />
      </g>
      {/* Halloween */}
      <Abobora x={r.x + W - 70} y={r.y + H - 40} s={1.5} />
      <Abobora x={r.x + 70} y={r.y + H - 50} s={1.2} />
      <Vela x={cx + 170} y={r.y + 300} s={1.4} />
      <Vela x={r.x + 110} y={r.y + 300} s={1.3} />
      <Teia x={r.x + 6} y={r.y + 6} r={130} />
      <Teia x={r.x + W - 6} y={r.y + H - 4} r={110} rot={-90} />
    </g>
  );
};
