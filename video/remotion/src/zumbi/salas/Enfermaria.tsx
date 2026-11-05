// Enfermaria (MEDBAY, embaixo de Comunicações): piso claro esverdeado, macas, scanner médico verde no chão.
// Halloween: uma maca com múmia enfaixada, frascos na prateleira, vela e abóbora, teia no canto de baixo.
import React from 'react';
import {Abobora, L, Piso, type SalaProps, Teia, Vela} from './comum';

const Maca: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={10} fill="#9aa6ad" stroke={L} strokeWidth={6} />
    <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx={6} fill="#eef4f4" stroke={L} strokeWidth={3} />
    <rect x={x + 12} y={y + h * 0.5 - 16} width={w * 0.2} height={32} rx={8} fill="#ffffff" stroke={L} strokeWidth={3} />
    <rect x={x + w * 0.55} y={y + 8} width={w * 0.45 - 8} height={h - 16} rx={4} fill="#5fb8a5" stroke={L} strokeWidth={3} />
    <circle cx={x + 10} cy={y + 10} r={4} fill={L} />
    <circle cx={x + w - 10} cy={y + 10} r={4} fill={L} />
    <circle cx={x + 10} cy={y + h - 10} r={4} fill={L} />
    <circle cx={x + w - 10} cy={y + h - 10} r={4} fill={L} />
  </g>
);

export const SalaEnfermaria: React.FC<SalaProps> = ({r}) => {
  const H = r.h - 70; // área útil: os ~70 px de baixo ficam livres
  const cx = r.x + r.w * 0.5;
  const cy = r.y + H * 0.68;
  const raio = Math.min(r.w, H) * 0.2;
  const mW = Math.min(150, r.w * 0.36);
  const mH = 64;
  const linhaY = r.y + 130;
  return (
    <g>
      <Piso id="piso_Enfermaria" r={{...r, h: H}} a="#cfe6e2" b="#bcd8d3" />
      {/* parede do fundo */}
      <rect x={r.x} y={r.y} width={r.w} height={100} fill="#4f7a78" />
      <rect x={r.x} y={r.y + 100} width={r.w} height={8} fill="#2f5250" stroke={L} strokeWidth={6} />

      {/* prateleira com frascos */}
      <rect x={r.x + 20} y={r.y + 22} width={r.w - 40} height={8} fill="#2a4a48" stroke={L} strokeWidth={3} />
      {Array.from({length: Math.max(4, Math.round(r.w / 80))}).map((_, i, a) => {
        const x = r.x + 36 + i * ((r.w - 72) / (a.length - 1));
        const cor = ['#8fffd2', '#b06aff', '#ff8a2a', '#ffe27a'][i % 4];
        return (
          <g key={i}>
            <rect x={x - 8} y={r.y + 4} width={16} height={18} rx={3} fill="#eef4f4" stroke={L} strokeWidth={3} />
            <rect x={x - 11} y={r.y + 4} width={22} height={6} rx={2} fill="#7a5a3a" stroke={L} strokeWidth={2} />
            <rect x={x - 9} y={r.y + 14} width={18} height={8} fill={cor} />
          </g>
        );
      })}

      {/* scanner médico verde no chão */}
      <circle cx={cx} cy={cy} r={raio + 16} fill="#8fffd2" opacity={0.25} />
      <circle cx={cx} cy={cy} r={raio} fill="#2fbf8a" stroke={L} strokeWidth={8} />
      <circle cx={cx} cy={cy} r={raio * 0.7} fill="none" stroke="#b4ffe0" strokeWidth={5} />
      <circle cx={cx} cy={cy} r={raio * 0.4} fill="none" stroke="#b4ffe0" strokeWidth={4} />
      <rect x={cx - 6} y={cy - 6} width={12} height={12} fill="#e8fff6" stroke={L} strokeWidth={2} />

      {/* macas */}
      <Maca x={r.x + r.w * 0.06} y={linhaY} w={mW} h={mH} />
      <Maca x={r.x + r.w * 0.94 - mW} y={linhaY} w={mW} h={mH} />

      {/* Halloween: maca com múmia enfaixada */}
      <g>
        <Maca x={r.x + r.w * 0.5 - mW / 2} y={linhaY + 140} w={mW} h={mH} />
        <rect x={r.x + r.w * 0.5 - mW / 2 + 22} y={linhaY + 148} width={mW - 52} height={mH - 16} rx={18} fill="#f2f0e6" stroke={L} strokeWidth={5} />
        <circle cx={r.x + r.w * 0.5 - mW / 2 + 26} cy={linhaY + 140 + mH / 2} r={16} fill="#f2f0e6" stroke={L} strokeWidth={4} />
        <circle cx={r.x + r.w * 0.5 - mW / 2 + 22} cy={linhaY + 140 + mH / 2 - 4} r={3} fill={L} />
        <circle cx={r.x + r.w * 0.5 - mW / 2 + 30} cy={linhaY + 140 + mH / 2 - 4} r={3} fill={L} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${r.x + r.w * 0.5 - mW / 2 + 48 + i * 16} ${linhaY + 146} L${r.x + r.w * 0.5 - mW / 2 + 60 + i * 16} ${linhaY + 194}`} stroke="#c3ccc8" strokeWidth={4} />
        ))}
      </g>
      <Vela x={r.x + r.w * 0.5 + mW / 2 + 22} y={linhaY + 200} s={1} />
      <Abobora x={r.x + r.w * 0.1} y={r.y + H * 0.9} s={0.8} />
      <Teia x={r.x + 4} y={r.y + H - 4} r={100} rot={-90} />
    </g>
  );
};
