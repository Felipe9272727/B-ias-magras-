// Transições do Lobisomem (estilo Wolvesville, feitas do zero): começam no quadro 0 da cena e somem sozinhas.
//  - 'noite': uma lua cheia cresce do centro cobrindo a tela de azul-escuro e abre
//  - 'dia': raios de sol amarelos giram e abrem a cena
//  - 'rosa': faixas rosa com patas passam na diagonal (títulos, papéis, placar, fim)
//  - 'corte': flash curto entre telas do jogo (votação, linchamento, tiro)
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export type TipoTransicaoLobo = 'noite' | 'dia' | 'rosa' | 'corte' | 'nenhuma';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export const escolherTransicaoLobo = (anterior: string | undefined, atual: string): TipoTransicaoLobo => {
  if (!anterior) return 'nenhuma';
  if (atual === 'LOBFase') return 'rosa';
  if (atual === 'LOBNoite' && anterior !== 'LOBNoite') return 'noite';
  if (atual === 'LOBAmanhecer') return 'dia';
  if (['LOBTitulo', 'LOBPlacar', 'LOBPapeis', 'LOBFim', 'LOBElenco', 'LOBSorteio'].includes(atual)) return 'rosa';
  if (['LOBVotos', 'LOBLinchado', 'LOBTiro'].includes(atual) && anterior !== atual) return 'corte';
  return 'nenhuma';
};

const Noite: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 16) return null;
  const abre = interpolate(f, [3, 16], [0, 1], {...cl, easing: Easing.in(Easing.cubic)});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: '#0b1630', clipPath: `circle(${(1 - abre) * 120}% at 50% 50%)`}} />
      <div style={{position: 'absolute', left: 960 - 120, top: 540 - 120, width: 240, height: 240, borderRadius: 999, background: '#fff3c4', boxShadow: '0 0 90px 30px rgba(255,243,196,0.5)', transform: `scale(${1 - abre})`}} />
    </AbsoluteFill>
  );
};

const Dia: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 16) return null;
  const abre = interpolate(f, [2, 16], [0, 1], {...cl, easing: Easing.inOut(Easing.quad)});
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: 1 - abre}}>
      <AbsoluteFill style={{background: '#ffe082'}} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform={`translate(960 540) rotate(${f * 6})`}>
          {Array.from({length: 12}).map((_, i) => <path key={i} d="M0 0 L-90 -1300 L90 -1300Z" fill="#ffca28" transform={`rotate(${i * 30})`} />)}
        </g>
        <circle cx={960} cy={540} r={180 * (1 + abre * 3)} fill="#fff8e1" />
      </svg>
    </AbsoluteFill>
  );
};

const Rosa: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 18) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {[0, 1, 2, 3].map((i) => {
        const k = interpolate(f, [i * 1.5, i * 1.5 + 14], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
        return <div key={i} style={{position: 'absolute', left: -600, top: -300 + i * 420, width: 3200, height: 440, background: i % 2 ? '#ff3d7f' : '#e91e63', transform: `rotate(-14deg) translateX(${-3300 + k * 6600}px)`}} />;
      })}
    </AbsoluteFill>
  );
};

const Corte: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6], [0.7, 0], cl);
  return o > 0 ? <AbsoluteFill style={{pointerEvents: 'none', background: '#fff', opacity: o}} /> : null;
};

export const TransicaoLobo: React.FC<{tipo: TipoTransicaoLobo}> = ({tipo}) => {
  if (tipo === 'noite') return <Noite />;
  if (tipo === 'dia') return <Dia />;
  if (tipo === 'rosa') return <Rosa />;
  if (tipo === 'corte') return <Corte />;
  return null;
};
