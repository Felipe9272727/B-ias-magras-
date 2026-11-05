// Sala Admin (Mira HQ, noite de Halloween): piso esverdeado, mesa central com o mapa holográfico em verde,
// armários nas laterais, monitores na parede de cima. Halloween: caveira na mesa, velas nos cantos de baixo,
// luzinhas na parede e teia no canto.
import React from 'react';
import {Caveira, L, Luzinhas, Piso, type SalaProps, Teia, Vela} from './comum';

// cadeira vista de cima (ao redor da mesa)
const Cadeira: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <circle cx={x} cy={y} r={17} fill="#3b4a46" stroke={L} strokeWidth={4} />
    <circle cx={x} cy={y} r={7} fill="#516661" />
  </g>
);

export const SalaAdmin: React.FC<SalaProps> = ({r}) => {
  const cx = r.x + r.w / 2, cy = r.y + r.h * 0.46;
  return (
    <g>
      {/* piso esverdeado de ladrilhos */}
      <Piso id="piso_Admin" r={r} a={r.piso} b={r.piso2} tam={64} />

      {/* parede de cima com monitores */}
      <rect x={r.x} y={r.y} width={r.w} height={66} fill={r.parede} />
      <rect x={r.x} y={r.y + 66} width={r.w} height={6} fill={L} />
      {[0.12, 0.6].map((k, i) => (
        <g key={i}>
          <rect x={r.x + r.w * k} y={r.y + 12} width={96} height={46} rx={3} fill="#0d1f1c" stroke={L} strokeWidth={5} />
          <path d={`M${r.x + r.w * k + 10} ${r.y + 26} H${r.x + r.w * k + 70} M${r.x + r.w * k + 10} ${r.y + 40} H${r.x + r.w * k + 50}`} stroke="#6affc8" strokeWidth={3} opacity={0.8} />
        </g>
      ))}
      <Luzinhas x1={r.x + 30} x2={r.x + r.w * 0.5} y={r.y + 66} />
      <Teia x={r.x + r.w - 4} y={r.y + 4} r={66} rot={90} />

      {/* armários nas laterais */}
      {[r.y + 110, r.y + 214].map((yy, i) => (
        <g key={i}>
          <rect x={r.x + 8} y={yy} width={44} height={92} fill="#4f6b66" stroke={L} strokeWidth={5} />
          <rect x={r.x + r.w - 52} y={yy} width={44} height={92} fill="#4f6b66" stroke={L} strokeWidth={5} />
          <rect x={r.x + 38} y={yy + 40} width={5} height={14} fill="#cfe9e2" />
          <rect x={r.x + r.w - 40} y={yy + 40} width={5} height={14} fill="#cfe9e2" />
        </g>
      ))}

      {/* mesa central com o mapa holográfico */}
      <circle cx={cx} cy={cy} r={150} fill="#6affc8" opacity={0.1} />
      <rect x={cx - 18} y={cy + 30} width={36} height={56} fill="#2a3f3b" stroke={L} strokeWidth={5} />
      <ellipse cx={cx} cy={cy + 88} rx={52} ry={12} fill="#2a3f3b" stroke={L} strokeWidth={5} />
      <ellipse cx={cx} cy={cy} rx={112} ry={62} fill="#1f3330" stroke={L} strokeWidth={8} />
      <ellipse cx={cx} cy={cy} rx={92} ry={48} fill="#6affc8" opacity={0.35} />
      {/* desenho do mapa no holograma (salas em linhas verdes) */}
      <g stroke="#b4ffe0" strokeWidth={3} fill="none" opacity={0.85}>
        <rect x={cx - 58} y={cy - 26} width={44} height={30} />
        <rect x={cx - 8} y={cy - 30} width={50} height={26} />
        <rect x={cx + 10} y={cy + 2} width={44} height={26} />
        <path d={`M${cx - 14} ${cy - 11} H${cx - 8} M${cx + 42} ${cy - 17} V${cy + 2}`} />
      </g>
      <circle cx={cx + 26} cy={cy - 18} r={5} fill="#b4ffe0" />
      <circle cx={cx - 34} cy={cy + 4} r={5} fill="#b4ffe0" />
      {/* caveira sobre a mesa, do lado esquerdo */}
      <Caveira x={cx - 84} y={cy + 16} s={1.2} />

      {/* cadeiras ao redor da mesa */}
      <Cadeira x={cx - 128} y={cy} />
      <Cadeira x={cx + 128} y={cy} />
      <Cadeira x={cx - 70} y={cy + 110} />
      <Cadeira x={cx + 70} y={cy + 110} />

      {/* velas nos cantos de baixo */}
      <Vela x={r.x + 36} y={r.y + r.h * 0.76} s={1.4} />
      <Vela x={r.x + r.w - 36} y={r.y + r.h * 0.76} s={1.4} />
      <Vela x={cx} y={r.y + r.h * 0.8} s={1} />
    </g>
  );
};
