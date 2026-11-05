// Vestiário (LOCKER ROOM, embaixo da Descontaminação): piso claro, fileira de armários na parede de cima e banco de madeira.
// Halloween: capa e lençol-fantasma pendurados num varal, abóbora e vela no banco, teia no canto, tom de noite.
import React from 'react';
import {Abobora, L, Piso, type SalaProps, Teia, Vela} from './comum';

export const SalaVestiario: React.FC<SalaProps> = ({r}) => {
  const H = r.h - 70; // área útil: os ~70 px de baixo ficam livres
  const N = Math.max(4, Math.round(r.w / 85));
  const lw = (r.w - 40) / N;
  const cores = ['#3e7fb0', '#c0463a', '#4f9a5a', '#d9a23a', '#7a5cc4'];
  const parede = 96;
  const varalY = r.y + 210;
  const capaX = r.x + r.w * 0.66;
  const fantasmaX = r.x + r.w * 0.85;
  const bancoY = r.y + H * 0.8;
  const bancoX = r.x + r.w * 0.08;
  const bancoW = r.w * 0.42;
  return (
    <g>
      <Piso id="piso_Vestiario" r={{...r, h: H}} a="#d9dfe6" b="#c6cdd6" />
      {/* parede do fundo e rodapé */}
      <rect x={r.x} y={r.y} width={r.w} height={parede} fill="#56606e" />
      <rect x={r.x} y={r.y + parede} width={r.w} height={10} fill="#3a424d" stroke={L} strokeWidth={6} />

      {/* fileira de armários encostados na parede */}
      {Array.from({length: N}).map((_, i) => {
        const x = r.x + 20 + i * lw;
        return (
          <g key={i}>
            <rect x={x + 3} y={r.y + 14} width={lw - 6} height={150} rx={4} fill={cores[i % cores.length]} stroke={L} strokeWidth={6} />
            <line x1={x + lw / 2} y1={r.y + 14} x2={x + lw / 2} y2={r.y + 164} stroke={L} strokeWidth={3} />
            <rect x={x + lw * 0.2} y={r.y + 24} width={lw * 0.6} height={12} rx={2} fill="#1d2129" />
            <circle cx={x + lw / 2 - 10} cy={r.y + 100} r={4} fill="#e8e8e8" stroke={L} strokeWidth={2} />
            <circle cx={x + lw / 2 + 10} cy={r.y + 100} r={4} fill="#e8e8e8" stroke={L} strokeWidth={2} />
            <rect x={x + 3} y={r.y + 164} width={lw - 6} height={10} fill="#00000044" />
          </g>
        );
      })}

      {/* varal com fantasias de Halloween */}
      <line x1={r.x + r.w * 0.56} y1={varalY} x2={r.x + r.w - 24} y2={varalY} stroke={L} strokeWidth={6} />
      {/* capa roxa */}
      <g transform={`translate(${capaX},${varalY})`}>
        <circle cx={0} cy={-6} r={5} fill="none" stroke={L} strokeWidth={3} />
        <path d="M-26 4 L26 4 L44 116 Q0 136 -44 116 Z" fill="#4b1d6b" stroke={L} strokeWidth={5} />
        <path d="M-26 4 L0 40 L26 4" fill="none" stroke={L} strokeWidth={4} />
        <path d="M-40 110 Q0 126 40 110" fill="none" stroke="#b06aff" strokeWidth={3} opacity={0.8} />
      </g>
      {/* lençol-fantasma */}
      <g transform={`translate(${fantasmaX},${varalY})`}>
        <circle cx={0} cy={-6} r={5} fill="none" stroke={L} strokeWidth={3} />
        <path d="M-30 4 Q-30 -36 0 -36 Q30 -36 30 4 L30 96 Q20 80 10 96 Q0 80 -10 96 Q-20 80 -30 96 Z" fill="#f4f1ea" stroke={L} strokeWidth={5} />
        <ellipse cx={-10} cy={-10} rx={5} ry={7} fill={L} />
        <ellipse cx={10} cy={-10} rx={5} ry={7} fill={L} />
        <ellipse cx={0} cy={10} rx={5} ry={6} fill={L} />
      </g>

      {/* banco de madeira com abóbora e vela */}
      {[0.1, 0.9].map((k) => (
        <rect key={k} x={bancoX + bancoW * k - 5} y={bancoY + 12} width={10} height={30} fill="#6b4a2b" stroke={L} strokeWidth={3} />
      ))}
      <rect x={bancoX} y={bancoY} width={bancoW} height={24} rx={4} fill="#b8804f" stroke={L} strokeWidth={6} />
      <Abobora x={bancoX + bancoW * 0.25} y={bancoY - 20} s={0.8} />
      <Vela x={bancoX + bancoW * 0.72} y={bancoY + 2} s={1} />

      {/* teia no canto de cima, à direita */}
      <Teia x={r.x + r.w - 4} y={r.y + 4} r={90} rot={90} />

      {/* clima de noite de Halloween */}
      <rect x={r.x} y={r.y} width={r.w} height={H} fill="#1b0a2b" opacity={0.22} />
    </g>
  );
};
