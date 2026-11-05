// Salas da estrutura (parte do Claude): Lançamento (foguete deitado na plataforma com o anel amarelo, caixas,
// piso branco e a faixa verde embaixo), Descontaminação (esteira amarela e preta com portas em cima e embaixo)
// e o centro de vidro do Corredor em Y. Halloween: abóboras, caveira, teias, luzinhas.
import React from 'react';
import {Abobora, Caveira, L, Luzinhas, Piso, type SalaProps, Teia, Vela} from './comum';

export const SalaLancamento: React.FC<SalaProps> = ({r}) => {
  const cx = r.x + r.w * 0.36, cy = r.y + r.h * 0.5;
  return (
    <g>
      <Piso id="piso_lanc" r={r} a="#d6dde2" b="#c5ccd2" tam={80} />
      {/* parede do fundo com janelas para o céu */}
      <rect x={r.x} y={r.y} width={r.w} height={90} fill="#4a525c" />
      {[0.15, 0.4, 0.65, 0.88].map((k) => <rect key={k} x={r.x + r.w * k - 50} y={r.y + 18} width={100} height={50} rx={10} fill="#1d1240" stroke={L} strokeWidth={6} />)}
      {/* plataforma: anel amarelo */}
      <circle cx={cx} cy={cy} r={r.h * 0.36} fill="#f2c94c" stroke={L} strokeWidth={10} />
      <circle cx={cx} cy={cy} r={r.h * 0.26} fill="#5a6270" stroke={L} strokeWidth={8} />
      {/* foguete deitado (como no jogo) */}
      <g transform={`translate(${cx},${cy}) rotate(-20)`}>
        <path d="M-150 -60 L120 -60 Q210 -60 230 0 Q210 60 120 60 L-150 60 Z" fill="#e9b830" stroke={L} strokeWidth={10} />
        <rect x={-150} y={-60} width={50} height={120} fill="#c9962a" stroke={L} strokeWidth={8} />
        <path d="M-150 -60 L-200 -110 L-120 -60 Z M-150 60 L-200 110 L-120 60 Z" fill="#c0392b" stroke={L} strokeWidth={8} />
        <circle cx={90} cy={0} r={30} fill="#7ad0ff" stroke={L} strokeWidth={8} />
        <rect x={-60} y={-60} width={20} height={120} fill="#c9962a" />
      </g>
      {/* caixas e cilindros verdes nos cantos, como na arte */}
      {[[0.82, 0.3], [0.9, 0.55], [0.08, 0.75], [0.8, 0.8]].map(([a, b], i) => (
        <g key={i} transform={`translate(${r.x + r.w * a},${r.y + r.h * b})`}>
          <rect x={-45} y={-45} width={90} height={90} rx={10} fill={i % 2 ? '#3f8a5a' : '#5a6b7a'} stroke={L} strokeWidth={7} />
          <rect x={-30} y={-30} width={60} height={20} rx={4} fill="#00000033" />
        </g>
      ))}
      <Abobora x={r.x + r.w * 0.68} y={r.y + r.h * 0.78} s={1.6} />
      <Caveira x={r.x + r.w * 0.1} y={r.y + r.h * 0.35} s={1.6} />
      <Vela x={r.x + r.w * 0.16} y={r.y + r.h * 0.4} s={1.3} />
      <Teia x={r.x + 8} y={r.y + 8} r={120} />
      <Luzinhas x1={r.x + 40} x2={r.x + r.w - 40} y={r.y + 92} />
    </g>
  );
};

export const SalaDescontaminacao: React.FC<SalaProps> = ({r}) => (
  <g>
    <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="#2a2a2a" />
    {/* esteira listrada amarela e preta */}
    <defs>
      <pattern id="listra_decon" width={80} height={80} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width={80} height={80} fill="#e8c020" /><rect width={40} height={80} fill="#2a2a2a" />
      </pattern>
    </defs>
    <rect x={r.x + 30} y={r.y + 20} width={r.w - 60} height={r.h - 40} fill="url(#listra_decon)" stroke={L} strokeWidth={6} />
    <rect x={r.x + r.w / 2 - 50} y={r.y + 20} width={100} height={r.h - 40} fill="#3a3a3a" opacity={0.75} />
    {/* portas de cima e de baixo */}
    {[r.y + 10, r.y + r.h - 40].map((y, i) => <rect key={i} x={r.x + 20} y={y} width={r.w - 40} height={30} rx={6} fill="#7a8794" stroke={L} strokeWidth={6} />)}
    {/* luz verde de descontaminação */}
    <rect x={r.x + 30} y={r.y + 20} width={r.w - 60} height={r.h - 40} fill="#b4ff5a" opacity={0.08} />
    <Abobora x={r.x + r.w / 2} y={r.y + r.h * 0.5} s={1.2} />
  </g>
);

export const SalaCorredor: React.FC<SalaProps> = ({r}) => (
  <g>
    {/* centro do Y: piso de vidro com a estrutura metálica aparecendo */}
    <polygon points={`${r.x + r.w * 0.2},${r.y} ${r.x + r.w * 0.8},${r.y} ${r.x + r.w},${r.y + r.h * 0.7} ${r.x},${r.y + r.h * 0.7}`} fill="#6f8fbf" opacity={0.9} />
    {[0.3, 0.5, 0.7].map((k) => <line key={k} x1={r.x + r.w * k} y1={r.y} x2={r.x + r.w * k} y2={r.y + r.h * 0.7} stroke="#9ab6e0" strokeWidth={8} />)}
    <Vela x={r.x + r.w * 0.5} y={r.y + r.h * 0.45} s={1.4} />
  </g>
);
