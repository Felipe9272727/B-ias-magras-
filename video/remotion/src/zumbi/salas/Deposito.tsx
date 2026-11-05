// Depósito (STORAGE) de Halloween: sala escura com caixas empilhadas, barris, latas de combustível,
// um caixão no meio, abóboras e teias. Desenho em coordenadas locais (0..w, 0..h) dentro de r.
import React from 'react';
import {Abobora, L, Piso, type SalaProps, Teia, Vela} from './comum';

const Caixa: React.FC<{x: number; y: number; w?: number; h?: number; cor?: string}> = ({x, y, w = 48, h = 42, cor = '#9a7448'}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={cor} stroke={L} strokeWidth={5} />
    <path d={`M${x + 4} ${y + h / 2} L${x + w - 4} ${y + h / 2} M${x + w / 2} ${y + 4} L${x + w / 2} ${y + h - 4}`} stroke={L} strokeWidth={3} opacity={0.45} />
    <rect x={x + 4} y={y + 4} width={w - 8} height={5} fill="#ffffff" opacity={0.12} />
  </g>
);

const Barril: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <ellipse cx={x} cy={y + 60} rx={28} ry={7} fill="#000" opacity={0.35} />
    <rect x={x - 26} y={y} width={52} height={60} rx={12} fill="#5b6e82" stroke={L} strokeWidth={5} />
    <rect x={x - 26} y={y + 12} width={52} height={7} fill={L} opacity={0.6} />
    <rect x={x - 26} y={y + 42} width={52} height={7} fill={L} opacity={0.6} />
  </g>
);

const Lata: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <rect x={x} y={y} width={24} height={32} rx={3} fill="#c0392b" stroke={L} strokeWidth={4} />
    <path d={`M${x + 6} ${y} L${x + 6} ${y - 6} L${x + 18} ${y - 6} L${x + 18} ${y}`} stroke={L} strokeWidth={3} fill="none" />
    <rect x={x + 4} y={y + 10} width={16} height={8} fill="#ffe27a" />
  </g>
);

// caixão visto de cima: hexágono com a tampa e uma cruz clara
const Caixao: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <ellipse cx={x} cy={y + 92} rx={74} ry={9} fill="#000" opacity={0.35} />
    <polygon points={`${x - 40},${y} ${x + 40},${y} ${x + 64},${y + 45} ${x + 40},${y + 90} ${x - 40},${y + 90} ${x - 64},${y + 45}`}
      fill="#3b2a4a" stroke={L} strokeWidth={6} strokeLinejoin="round" />
    <polygon points={`${x - 30},${y + 10} ${x + 30},${y + 10} ${x + 48},${y + 45} ${x + 30},${y + 80} ${x - 30},${y + 80} ${x - 48},${y + 45}`}
      fill="none" stroke={L} strokeWidth={3} opacity={0.5} />
    <path d={`M${x} ${y + 20} L${x} ${y + 70} M${x - 22} ${y + 40} L${x + 22} ${y + 40}`} stroke="#c8b6e0" strokeWidth={6} strokeLinecap="round" />
  </g>
);

export const SalaDeposito: React.FC<SalaProps> = ({r}) => {
  const w = r.w, h = r.h;
  return (
    <g transform={`translate(${r.x},${r.y})`}>
      <Piso id="dep_piso" r={{...r, x: 0, y: 0, w, h}} a="#434a53" b="#3b4149" tam={56} />
      {/* parede do fundo, escura, com a lâmpada do teto */}
      <rect x={0} y={0} width={w} height={70} fill="#262c33" />
      <rect x={0} y={68} width={w} height={6} fill={L} />
      <rect x={118} y={22} width={44} height={12} fill="#ffe27a" stroke={L} strokeWidth={3} />
      <circle cx={140} cy={28} r={46} fill="#ffe27a" opacity={0.14} />

      {/* caixas empilhadas nas duas paredes laterais */}
      {[[14, 110], [66, 110], [14, 154], [66, 154], [40, 198], [92, 198]].map(([x, y], i) => (
        <Caixa key={`e${i}`} x={x} y={y} cor={i % 3 === 1 ? '#7d5c38' : '#9a7448'} />
      ))}
      {[[166, 110], [218, 110], [166, 154], [218, 154], [192, 198]].map(([x, y], i) => (
        <Caixa key={`d${i}`} x={x} y={y} cor={i % 2 ? '#8a6640' : '#a47d4e'} />
      ))}

      {/* latas de combustível perto da pilha da direita */}
      <Lata x={166} y={268} />
      <Lata x={196} y={268} />
      <Lata x={226} y={268} />
      <Lata x={180} y={302} />

      {/* caixão no meio do chão */}
      <Caixao x={140} y={330} />

      {/* barris no chão de baixo */}
      <Barril x={50} y={440} />
      <Barril x={96} y={500} />
      <Barril x={230} y={470} />

      {/* velas e abóboras, sempre acima da linha de 70 px livre embaixo */}
      <Vela x={62} y={322} s={1.2} />
      <Vela x={218} y={330} s={1.2} />
      <Abobora x={40} y={552} s={0.9} />
      <Abobora x={200} y={550} s={1} />

      {/* teias nos cantos de cima */}
      <Teia x={0} y={0} r={110} />
      <Teia x={w} y={0} r={100} rot={90} />
    </g>
  );
};
