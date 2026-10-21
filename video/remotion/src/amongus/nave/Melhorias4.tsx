// Melhorias visuais do mapa no Among Us 4 (só desenho; a planta e o motor não mudam):
//  - espaço de verdade em volta da nave (azul-noite, estrelas, nebulosa) e um halo no casco;
//  - cantos cortados: o Refeitório vira octógono e a Navegação ganha a "ponta" da nave (dois cantos cortados à
//    direita), como no Skeld. Quem estiver num canto cortado (jogador, console, duto) é empurrado para dentro da sala
//    por foraDoCanto(), que o vídeo usa ao posicionar tudo;
//  - a janela grande de vidro da Navegação, com estrelas.
import React from 'react';
import {NAVE} from './mapa';
import {TILE, type Sala} from './spec';

const W = NAVE.cols * TILE;
const H = NAVE.rows * TILE;
const CONTORNO_COR = '#0b0d14';

type Canto = 'tl' | 'tr' | 'bl' | 'br';
// tamanho do corte de cada canto, em px
export const CANTOS: Partial<Record<Sala, Partial<Record<Canto, number>>>> = {
  Refeitorio: {tl: 3 * TILE, tr: 3 * TILE, bl: 3 * TILE, br: 3 * TILE},
  Navegacao: {tr: 4 * TILE, br: 4 * TILE},
};
const MARGEM = 46; // distância mínima da diagonal (meia largura de um tripulante)

const ret = (s: Sala) => {
  const {c, r, w, h} = NAVE.salas[s].rect;
  return {x0: c * TILE, y0: r * TILE, x1: (c + w) * TILE, y1: (r + h) * TILE};
};

// empurra um ponto que caiu dentro (ou colado) de um canto cortado para dentro da sala, ao longo da diagonal
export function foraDoCanto(sala: Sala | undefined | null, p: {x: number; y: number}): {x: number; y: number} {
  const cs = sala && CANTOS[sala];
  if (!cs) return p;
  const {x0, y0, x1, y1} = ret(sala);
  let {x, y} = p;
  for (const [canto, k] of Object.entries(cs) as [Canto, number][]) {
    const dx = canto === 'tl' || canto === 'bl' ? x - x0 : x1 - x;
    const dy = canto === 'tl' || canto === 'tr' ? y - y0 : y1 - y;
    const falta = k + MARGEM - (dx + dy);
    if (falta > 0) {
      const m = falta / 2;
      x += canto === 'tl' || canto === 'bl' ? m : -m;
      y += canto === 'tl' || canto === 'tr' ? m : -m;
    }
  }
  return {x: Math.round(x), y: Math.round(y)};
}

// estrelas determinísticas (sempre as mesmas)
function estrelas(n: number) {
  let s = 1234567;
  const r = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  return Array.from({length: n}, () => ({x: -1600 + r() * (W + 3200), y: -1200 + r() * (H + 2400), r: r() < 0.06 ? 3.2 : r() < 0.3 ? 2 : 1.2, o: 0.35 + r() * 0.65}));
}
const ESTRELAS = estrelas(1400);

// fundo: vai por trás de tudo
export const FundoEspaco: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="esp4-fundo" cx="50%" cy="45%" r="75%">
        <stop offset="0%" stopColor="#141c3a" />
        <stop offset="60%" stopColor="#0a0f24" />
        <stop offset="100%" stopColor="#04060f" />
      </radialGradient>
      <radialGradient id="esp4-neb1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#5b3fa8" stopOpacity={0.35} />
        <stop offset="100%" stopColor="#5b3fa8" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="esp4-neb2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1f7a9c" stopOpacity={0.3} />
        <stop offset="100%" stopColor="#1f7a9c" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-1600} y={-1200} width={W + 3200} height={H + 2400} fill="url(#esp4-fundo)" />
    <ellipse cx={W * 0.82} cy={H * 0.12} rx={1500} ry={900} fill="url(#esp4-neb1)" />
    <ellipse cx={W * 0.12} cy={H * 0.95} rx={1300} ry={800} fill="url(#esp4-neb2)" />
    {ESTRELAS.map((e, i) => <circle key={i} cx={e.x} cy={e.y} r={e.r} fill="#e8eeff" opacity={e.o} />)}
  </g>
);

// halo azulado em volta do casco (recebe o contorno da nave já montado)
export const HaloCasco: React.FC<{d: string}> = ({d}) => (
  <g>
    <defs>
      <filter id="esp4-halo" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation={28} />
      </filter>
    </defs>
    <path d={d} fill="#4c7fd6" opacity={0.45} filter="url(#esp4-halo)" />
  </g>
);

// os cantos cortados, desenhados por cima do piso com a cor do topo da parede da sala e uma face clara na diagonal
export const CantosCortados: React.FC = () => (
  <g>
    {(Object.entries(CANTOS) as [Sala, Partial<Record<Canto, number>>][]).flatMap(([sala, cs]) => {
      const {x0, y0, x1, y1} = ret(sala);
      const tema = NAVE.salas[sala].tema;
      return (Object.entries(cs) as [Canto, number][]).map(([canto, k]) => {
        const [cx, cy, sx, sy] = canto === 'tl' ? [x0, y0, 1, 1] : canto === 'tr' ? [x1, y0, -1, 1] : canto === 'bl' ? [x0, y1, 1, -1] : [x1, y1, -1, -1];
        // um pouco além do canto, para cobrir a quina da parede
        const e = 24;
        const pts = `${cx - sx * e},${cy - sy * e} ${cx + sx * k},${cy - sy * e} ${cx - sx * e},${cy + sy * k}`;
        const face = `${cx + sx * k},${cy} ${cx},${cy + sy * k} ${cx + sx * (k - 26)},${cy + sy * 26 * 0} `;
        return (
          <g key={`${sala}-${canto}`}>
            <polygon points={pts} fill={tema.paredeTopo} stroke={CONTORNO_COR} strokeWidth={7} strokeLinejoin="round" />
            {/* face da parede na diagonal (lado que olha para a sala) */}
            <line x1={cx + sx * k} y1={cy} x2={cx} y2={cy + sy * k} stroke={tema.parede} strokeWidth={14} strokeLinecap="round" />
            <line x1={cx + sx * k} y1={cy} x2={cx} y2={cy + sy * k} stroke={CONTORNO_COR} strokeWidth={3} opacity={0.7} transform={`translate(${sx * 7} ${sy * 7})`} />
            {face && null}
          </g>
        );
      });
    })}
  </g>
);

// a janela de vidro da Navegação, na parede da "ponta" (lado direito), entre os dois cantos cortados
export const JanelaNavegacao: React.FC = () => {
  const {y0, y1, x1} = ret('Navegacao');
  const k = CANTOS.Navegacao?.tr ?? 0;
  const ya = y0 + k - 10, yb = y1 - k + 10;
  const sts = estrelas(60).map((e, i) => ({x: x1 - 30 + ((e.x % 70) + 70) % 70, y: ya + (((e.y % (yb - ya)) + (yb - ya)) % (yb - ya)), r: e.r * 0.8, o: e.o, i}));
  return (
    <g>
      <defs>
        <clipPath id="nav4-vidro"><rect x={x1 - 34} y={ya} width={82} height={yb - ya} rx={18} /></clipPath>
        <linearGradient id="nav4-reflexo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9fd8ff" stopOpacity={0.35} />
          <stop offset="50%" stopColor="#9fd8ff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={x1 - 34} y={ya} width={82} height={yb - ya} rx={18} fill="#060b1e" />
      <g clipPath="url(#nav4-vidro)">
        {sts.map((s) => <circle key={s.i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />)}
        <rect x={x1 - 34} y={ya} width={82} height={yb - ya} fill="url(#nav4-reflexo)" />
      </g>
      <rect x={x1 - 34} y={ya} width={82} height={yb - ya} rx={18} fill="none" stroke="#9aa8bb" strokeWidth={8} />
      <rect x={x1 - 34} y={ya} width={82} height={yb - ya} rx={18} fill="none" stroke={CONTORNO_COR} strokeWidth={3} />
      {[1, 2].map((i) => <line key={i} x1={x1 - 34} x2={x1 + 48} y1={ya + ((yb - ya) * i) / 3} y2={ya + ((yb - ya) * i) / 3} stroke="#9aa8bb" strokeWidth={6} />)}
    </g>
  );
};
