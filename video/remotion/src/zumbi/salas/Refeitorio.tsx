// Refeitório (CAFETERIA) de Halloween: piso claro, duas mesas compridas laranja com bancos, máquina de lanches,
// mesas com abóboras, velas e doces, guirlanda de luzinhas e teias. Coordenadas locais dentro de r.
import React from 'react';
import {Abobora, Caveira, L, Luzinhas, Piso, type SalaProps, Teia, Vela} from './comum';

const Mesa: React.FC<{y: number; w: number; x: number}> = ({x, y, w}) => (
  <g>
    {/* bancos de cima e de baixo */}
    <rect x={x + 20} y={y - 26} width={w - 40} height={16} rx={4} fill="#9c4f1a" stroke={L} strokeWidth={5} />
    <rect x={x + 20} y={y + 60} width={w - 40} height={16} rx={4} fill="#9c4f1a" stroke={L} strokeWidth={5} />
    {/* tampo laranja */}
    <rect x={x} y={y} width={w} height={50} rx={6} fill="#ef7d2c" stroke={L} strokeWidth={8} />
    <rect x={x + 8} y={y + 6} width={w - 16} height={6} fill="#ffb070" />
    <rect x={x + 8} y={y + 40} width={w - 16} height={4} fill="#b85a20" />
  </g>
);

const Doce: React.FC<{x: number; y: number; cor: string}> = ({x, y, cor}) => (
  <g>
    <circle cx={x} cy={y} r={8} fill={cor} stroke={L} strokeWidth={3} />
    <path d={`M${x - 5} ${y - 4} L${x + 5} ${y + 4} M${x + 5} ${y - 4} L${x - 5} ${y + 4}`} stroke="#ffffff" strokeWidth={2} opacity={0.8} />
  </g>
);

export const SalaRefeitorio: React.FC<SalaProps> = ({r}) => {
  const w = r.w, h = r.h;
  const mesa1 = 210, mesa2 = 380;
  return (
    <g transform={`translate(${r.x},${r.y})`}>
      <Piso id="ref_piso" r={{...r, x: 0, y: 0, w, h}} a="#ece4cf" b="#ddd3b8" tam={64} />
      {/* parede do fundo */}
      <rect x={0} y={0} width={w} height={80} fill="#3a4a63" />
      <rect x={0} y={78} width={w} height={6} fill={L} />
      <Luzinhas x1={40} x2={w - 40} y={86} />

      {/* máquina de lanches, encostada na parede da direita */}
      <rect x={680} y={120} width={90} height={170} rx={8} fill="#2a6fb0" stroke={L} strokeWidth={7} />
      <rect x={694} y={136} width={62} height={80} fill="#9ad8ff" stroke={L} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={694 + i * 16} y={228} width={12} height={12} fill={['#ff8a2a', '#f2c94c', '#ff5a7a', '#7ad0ff'][i]} stroke={L} strokeWidth={2} />
          <rect x={694 + i * 16} y={250} width={12} height={12} fill={['#b06aff', '#ff8a2a', '#7ad0ff', '#f2c94c'][i]} stroke={L} strokeWidth={2} />
        </g>
      ))}

      {/* duas mesas compridas com bancos */}
      <Mesa x={110} y={mesa1} w={540} />
      <Mesa x={110} y={mesa2} w={540} />

      {/* decoração da mesa de cima */}
      <Abobora x={240} y={mesa1 + 22} s={0.6} />
      <Abobora x={560} y={mesa1 + 22} s={0.6} />
      <Vela x={340} y={mesa1 + 26} s={1} />
      <Vela x={460} y={mesa1 + 26} s={1} />
      {[[300, 0], [400, 1], [510, 2]].map(([x, c], i) => (
        <Doce key={i} x={x} y={mesa1 + 42} cor={['#ff5a7a', '#f2c94c', '#7ad0ff'][c]} />
      ))}

      {/* decoração da mesa de baixo */}
      <Vela x={250} y={mesa2 + 26} s={1} />
      <Vela x={550} y={mesa2 + 26} s={1} />
      <Abobora x={400} y={mesa2 + 24} s={0.7} />
      {[[300, 0], [330, 1], [460, 2], [500, 0], [590, 1]].map(([x, c], i) => (
        <Doce key={i} x={x} y={mesa2 + 42} cor={['#b06aff', '#ff8a2a', '#7ad0ff'][c]} />
      ))}

      {/* chão de baixo: caveira e abóbora de canto */}
      <Caveira x={70} y={500} s={1.4} />
      <Abobora x={730} y={500} s={1.2} />

      {/* teias nos cantos de cima */}
      <Teia x={0} y={80} r={130} />
      <Teia x={w} y={80} r={110} rot={90} />
    </g>
  );
};
