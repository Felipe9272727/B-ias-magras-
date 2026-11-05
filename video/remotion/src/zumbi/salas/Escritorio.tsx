// Sala Escritório (Mira HQ, noite de Halloween): piso claro de ladrilhos, parede de cima com janelas para a noite,
// quatro mesas com monitor, cadeira e teclado, arquivo na parede da direita. Halloween: abóbora na mesa,
// vela, teia nos cantos de cima e uma abóbora no chão.
import React from 'react';
import {Abobora, L, Piso, type SalaProps, Teia, Vela} from './comum';

// mesa com monitor (x, y = canto de cima-esquerda do tampo; w = largura do tampo) e cadeira embaixo
const Mesa: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => (
  <g>
    {/* cadeira (costas para baixo, longe da mesa) */}
    <rect x={x + w / 2 - 20} y={y + 92} width={40} height={22} rx={7} fill="#3b3f4a" stroke={L} strokeWidth={4} />
    <circle cx={x + w / 2} cy={y + 70} r={21} fill="#4a4f5c" stroke={L} strokeWidth={4} />
    {/* pernas do tampo */}
    <rect x={x + 6} y={y + 20} width={7} height={32} fill="#5a4030" />
    <rect x={x + w - 13} y={y + 20} width={7} height={32} fill="#5a4030" />
    {/* tampo */}
    <rect x={x} y={y} width={w} height={20} rx={3} fill="#9a7a58" stroke={L} strokeWidth={4} />
    <rect x={x} y={y + 14} width={w} height={6} fill="#7d6244" />
    {/* monitor e tela azul */}
    <rect x={x + w / 2 - 30} y={y - 42} width={60} height={38} rx={3} fill="#2b3340" stroke={L} strokeWidth={4} />
    <rect x={x + w / 2 - 25} y={y - 37} width={50} height={27} fill="#7ad0ff" opacity={0.85} />
    <path d={`M${x + w / 2 - 18} ${y - 28} H${x + w / 2 + 10}`} stroke="#e8fbff" strokeWidth={3} />
    <rect x={x + w / 2 - 4} y={y - 4} width={8} height={8} fill="#2b3340" />
    {/* teclado e caneca */}
    <rect x={x + w / 2 - 24} y={y + 5} width={48} height={8} rx={2} fill="#d9d4c7" stroke={L} strokeWidth={2} />
  </g>
);

export const SalaEscritorio: React.FC<SalaProps> = ({r}) => {
  const X = (k: number) => r.x + r.w * k;
  const Y = (k: number) => r.y + r.h * k;
  const deskW = 130;
  const colA = r.x + 40, colB = r.x + 190;
  const rowA = r.y + 118, rowB = r.y + 290;
  return (
    <g>
      {/* piso claro de ladrilhos */}
      <Piso id="piso_Escritorio" r={r} a={r.piso} b={r.piso2} tam={64} />

      {/* parede de cima com janelas para a noite */}
      <rect x={r.x} y={r.y} width={r.w} height={66} fill={r.parede} />
      <rect x={r.x} y={r.y + 66} width={r.w} height={6} fill={L} />
      {[0.36, 0.6].map((k, i) => (
        <g key={i}>
          <rect x={X(k)} y={r.y + 12} width={64} height={46} fill="#1d1240" stroke={L} strokeWidth={5} />
          <circle cx={X(k) + 46} cy={r.y + 30} r={8} fill="#ffe27a" />
          <line x1={X(k) + 32} y1={r.y + 12} x2={X(k) + 32} y2={r.y + 58} stroke={L} strokeWidth={3} />
        </g>
      ))}
      <Teia x={r.x + 4} y={r.y + 4} r={70} />
      <Teia x={r.x + r.w - 4} y={r.y + 4} r={70} rot={90} />

      {/* mesas com cadeira */}
      <Mesa x={colA} y={rowA} w={deskW} />
      <Mesa x={colB} y={rowA} w={deskW} />
      <Mesa x={colA} y={rowB} w={deskW} />
      <Mesa x={colB} y={rowB} w={deskW} />

      {/* Halloween nas mesas: abóbora e vela */}
      <Abobora x={colA + 104} y={rowA - 6} s={0.42} />
      <Vela x={colB + 20} y={rowB + 4} s={0.85} />

      {/* arquivo (dois armários) encostado na parede da direita */}
      {[Y(0.36), Y(0.36) + 96].map((yy, i) => (
        <g key={i}>
          <rect x={r.x + r.w - 66} y={yy} width={56} height={90} fill="#8a94a0" stroke={L} strokeWidth={5} />
          <rect x={r.x + r.w - 58} y={yy + 8} width={40} height={30} fill="#9ea8b4" stroke={L} strokeWidth={2} />
          <rect x={r.x + r.w - 58} y={yy + 48} width={40} height={30} fill="#9ea8b4" stroke={L} strokeWidth={2} />
          <rect x={r.x + r.w - 40} y={yy + 22} width={10} height={4} fill="#d9dde3" />
          <rect x={r.x + r.w - 40} y={yy + 62} width={10} height={4} fill="#d9dde3" />
        </g>
      ))}

      {/* abóbora no chão, do lado esquerdo, entre as mesas de baixo */}
      <Abobora x={X(0.08)} y={Y(0.7)} s={0.9} />
    </g>
  );
};
