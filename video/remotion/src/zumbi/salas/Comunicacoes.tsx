// Comunicações (COMMS, centro): sala escura com consoles de rádio, telas azuis, antena e uma mesa central com monitor.
// Halloween: velas e caveira na mesa, abóbora no chão e teia no canto de cima.
import React from 'react';
import {Abobora, Caveira, L, Piso, type SalaProps, Teia, Vela} from './comum';

export const SalaComunicacoes: React.FC<SalaProps> = ({r}) => {
  const H = r.h - 70; // área útil: os ~70 px de baixo ficam livres
  const N = Math.max(3, Math.round(r.w / 130));
  const u = (r.w - 40) / N;
  const deskX = r.x + r.w * 0.3;
  const deskW = r.w * 0.4;
  const deskY = r.y + H * 0.6;
  return (
    <g>
      <Piso id="piso_Comunicacoes" r={{...r, h: H}} a="#2f3a44" b="#28323b" />
      {/* parede do fundo com faixa de luz azul */}
      <rect x={r.x} y={r.y} width={r.w} height={112} fill="#3c4752" />
      <rect x={r.x} y={r.y + 112} width={r.w} height={8} fill="#1d242b" stroke={L} strokeWidth={6} />
      <rect x={r.x} y={r.y + 36} width={r.w} height={4} fill="#7ad0ff" opacity={0.5} />

      {/* consoles de rádio com telas azuis */}
      {Array.from({length: N}).map((_, i) => {
        const x = r.x + 20 + i * u;
        return (
          <g key={i}>
            <rect x={x + 4} y={r.y + 62} width={u - 8} height={96} rx={6} fill="#4a5866" stroke={L} strokeWidth={6} />
            <rect x={x + u * 0.16} y={r.y + 74} width={u * 0.68} height={42} rx={3} fill="#7ad0ff" stroke={L} strokeWidth={3} />
            <rect x={x + u * 0.22} y={r.y + 84} width={u * 0.56} height={4} fill="#2a6f9a" />
            <rect x={x + u * 0.22} y={r.y + 96} width={u * 0.3} height={4} fill="#2a6f9a" />
            <circle cx={x + u * 0.25} cy={r.y + 135} r={5} fill="#ff5a4a" stroke={L} strokeWidth={2} />
            <circle cx={x + u * 0.5} cy={r.y + 135} r={5} fill="#ffd23a" stroke={L} strokeWidth={2} />
            <circle cx={x + u * 0.75} cy={r.y + 135} r={5} fill="#7aff9a" stroke={L} strokeWidth={2} />
          </g>
        );
      })}

      {/* antena no canto de cima, à direita */}
      <g>
        <line x1={r.x + r.w - 50} y1={r.y + 150} x2={r.x + r.w - 50} y2={r.y + 24} stroke={L} strokeWidth={5} />
        <line x1={r.x + r.w - 50} y1={r.y + 60} x2={r.x + r.w - 80} y2={r.y + 150} stroke={L} strokeWidth={3} />
        <line x1={r.x + r.w - 50} y1={r.y + 60} x2={r.x + r.w - 20} y2={r.y + 150} stroke={L} strokeWidth={3} />
        <circle cx={r.x + r.w - 50} cy={r.y + 24} r={7} fill="#ff5a4a" stroke={L} strokeWidth={3} />
      </g>

      {/* mesa central com monitor */}
      <rect x={deskX + deskW * 0.5 - 40} y={deskY - 56} width={80} height={50} rx={4} fill="#2a323a" stroke={L} strokeWidth={5} />
      <rect x={deskX + deskW * 0.5 - 32} y={deskY - 48} width={64} height={34} fill="#7ad0ff" opacity={0.85} />
      <rect x={deskX + deskW * 0.5 - 6} y={deskY - 6} width={12} height={8} fill="#2a323a" />
      <rect x={deskX} y={deskY} width={deskW} height={26} rx={4} fill="#5b6a78" stroke={L} strokeWidth={6} />
      {[0.08, 0.92].map((k) => (
        <rect key={k} x={deskX + deskW * k - 5} y={deskY + 26} width={10} height={30} fill="#2f3a44" stroke={L} strokeWidth={3} />
      ))}

      {/* Halloween: velas e caveira na mesa */}
      <Vela x={deskX + deskW * 0.14} y={deskY + 2} s={1.1} />
      <Vela x={deskX + deskW * 0.86} y={deskY + 2} s={1.1} />
      <Caveira x={deskX + deskW * 0.76} y={deskY - 4} s={1.1} />
      <Abobora x={r.x + r.w * 0.14} y={r.y + H * 0.84} s={0.9} />

      {/* teia no canto de cima, à esquerda */}
      <Teia x={r.x + 4} y={r.y + 4} r={100} rot={0} />

      {/* clima de noite de Halloween */}
      <rect x={r.x} y={r.y} width={r.w} height={H} fill="#1b0a2b" opacity={0.22} />
    </g>
  );
};
