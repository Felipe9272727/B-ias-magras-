// Reator (esquerda): núcleo amarelo/laranja no centro com estrutura metálica, máquinas escuras com luzes verdes,
// faixas de alerta amarelo e preto, caveiras, velas, teia e brilho laranja.
import React from 'react';
import {Caveira, L, Piso, type SalaProps, Teia, Vela} from './comum';

const Maquina: React.FC<{x: number; y: number; w: number; h: number; verde?: boolean}> = ({x, y, w, h, verde}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={10} fill="#262a34" stroke={L} strokeWidth={8} />
    <rect x={x + 10} y={y + 10} width={w - 20} height={h * 0.3} rx={5} fill="#171a22" />
    {[0, 1, 2].map((k) => <circle key={k} cx={x + 24 + k * 22} cy={y + h * 0.55} r={7} fill={verde ? '#5aff7a' : '#ffb02a'} stroke={L} strokeWidth={2} />)}
    <rect x={x + 10} y={y + h - 26} width={w - 20} height={10} fill="#3c4250" />
  </g>
);

export const SalaReator: React.FC<SalaProps> = ({r}) => {
  const cx = r.x + r.w / 2, cy = r.y + r.h * 0.42, W = r.w, H = r.h - 70;
  return (
    <g>
      <Piso id="reator_piso" r={r} a="#3a3f4a" b="#323641" tam={72} />
      <defs>
        <pattern id="reator_alerta" width={44} height={44} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={44} height={44} fill="#e8c020" /><rect width={22} height={44} fill="#1a1a1a" />
        </pattern>
        <radialGradient id="reator_brilho"><stop offset="0" stopColor="#ffd23a" stopOpacity={0.75} /><stop offset="0.5" stopColor="#ff8a1a" stopOpacity={0.3} /><stop offset="1" stopColor="#ff8a1a" stopOpacity={0} /></radialGradient>
      </defs>
      {/* parede de cima */}
      <rect x={r.x} y={r.y} width={W} height={90} fill="#242730" />
      <rect x={r.x} y={r.y + 82} width={W} height={10} fill="#12141a" />
      {/* brilho do núcleo no chão */}
      <circle cx={cx} cy={cy} r={W * 0.62} fill="url(#reator_brilho)" />
      {/* faixas de alerta laterais */}
      <rect x={r.x + W * 0.2} y={r.y + 120} width={26} height={H - 120} fill="url(#reator_alerta)" stroke={L} strokeWidth={4} />
      <rect x={r.x + W * 0.8 - 26} y={r.y + 120} width={26} height={H - 120} fill="url(#reator_alerta)" stroke={L} strokeWidth={4} />
      <rect x={r.x + W * 0.28} y={r.y + H - 40} width={W * 0.44} height={26} fill="url(#reator_alerta)" stroke={L} strokeWidth={4} />
      {/* máquinas escuras dos lados */}
      <Maquina x={r.x + 20} y={r.y + 120} w={110} h={150} verde />
      <Maquina x={r.x + W - 130} y={r.y + 120} w={110} h={150} verde />
      <Maquina x={r.x + 20} y={r.y + H - 190} w={110} h={150} />
      <Maquina x={r.x + W - 130} y={r.y + H - 190} w={110} h={150} />
      {/* estrutura metálica em volta do núcleo */}
      <g stroke={L} strokeWidth={10} strokeLinejoin="round">
        <rect x={cx - 200} y={cy - 210} width={400} height={420} rx={40} fill="#4a5060" />
        <rect x={cx - 160} y={cy - 170} width={320} height={340} rx={30} fill="#2c303c" />
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], k) => <circle key={k} cx={cx + a * 200} cy={cy + b * 210} r={26} fill="#6a7184" />)}
        <rect x={cx - 70} y={cy - 250} width={140} height={60} rx={10} fill="#5a6072" />
        <rect x={cx - 70} y={cy + 190} width={140} height={50} rx={10} fill="#5a6072" />
      </g>
      {/* núcleo */}
      <circle cx={cx} cy={cy} r={125} fill="#ffb02a" opacity={0.35} />
      <circle cx={cx} cy={cy} r={95} fill="#f5a31a" stroke={L} strokeWidth={9} />
      <circle cx={cx} cy={cy} r={62} fill="#ffd23a" stroke={L} strokeWidth={6} />
      <circle cx={cx} cy={cy} r={30} fill="#fff3a8" />
      <path d={`M${cx - 95} ${cy} L${cx + 95} ${cy} M${cx} ${cy - 95} L${cx} ${cy + 95}`} stroke={L} strokeWidth={5} opacity={0.55} />
      {/* Halloween */}
      <Caveira x={cx - 240} y={cy + 250} s={1.8} />
      <Caveira x={cx + 250} y={r.y + 130} s={1.5} />
      <Vela x={cx - 190} y={cy + 262} s={1.7} />
      <Vela x={cx + 195} y={cy + 262} s={1.7} />
      <Vela x={cx + 300} y={r.y + 150} s={1.4} />
      <Teia x={r.x + 6} y={r.y + 6} r={190} />
      <Teia x={r.x + W - 6} y={r.y + 6} r={170} rot={90} />
    </g>
  );
};
