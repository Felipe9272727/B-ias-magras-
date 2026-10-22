// Transições do Lobisomem (feitas do zero para a vila): começam no quadro 0 da cena e somem sozinhas.
//  - 'garras': três rasgos de garra cortam a tela e abrem a cena (a noite caindo, lobos)
//  - 'nuvens': nuvens cobrem a tela e se abrem (amanhecer, mudança de dia)
//  - 'pergaminho': um pergaminho desenrola de cima a baixo (títulos, placar, votação)
//  - 'sino': ondas do sino da vila saem do centro (volta para o debate)
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export type TipoTransicaoLobo = 'garras' | 'nuvens' | 'pergaminho' | 'sino' | 'nenhuma';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export const escolherTransicaoLobo = (anterior: string | undefined, atual: string): TipoTransicaoLobo => {
  if (!anterior) return 'nenhuma';
  if (atual === 'LOBNoite') return 'garras';
  if (atual === 'LOBAmanhecer') return 'nuvens';
  if (['LOBTitulo', 'LOBPlacar', 'LOBVotos', 'LOBElenco', 'LOBPapeis', 'LOBLobby', 'LOBRegras'].includes(atual)) return 'pergaminho';
  if (atual === 'LOBFogueira' && anterior !== 'LOBFogueira') return 'sino';
  return 'nenhuma';
};

const Garras: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 16) return null;
  const abre = interpolate(f, [4, 16], [0, 1], {...cl, easing: Easing.in(Easing.cubic)});
  const risco = (i: number) => {
    const k = interpolate(f, [i * 1.5, i * 1.5 + 5], [0, 1], cl);
    const x0 = 520 + i * 360;
    return <path key={i} d={`M${x0 - 300} -60 Q${x0} 540 ${x0 + 260} 1140`} fill="none" stroke="#fff3d6" strokeWidth={34 * (1 - abre * 0.6)} strokeLinecap="round" strokeDasharray="1600" strokeDashoffset={1600 * (1 - k)} />;
  };
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: '#0a0612', opacity: 1 - abre}} />
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: 1 - abre * 0.9}}>
        {[0, 1, 2].map(risco)}
      </svg>
    </AbsoluteFill>
  );
};

const Nuvens: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 18) return null;
  const abre = interpolate(f, [2, 18], [0, 1], {...cl, easing: Easing.inOut(Easing.quad)});
  const nuvem = (x: number, y: number, r: number, lado: number, i: number) => (
    <g key={i} transform={`translate(${x + lado * abre * 1300} ${y})`}>
      {[0, 1, 2, 3].map((k) => <circle key={k} cx={k * r * 0.8 - r} cy={(k % 2) * -r * 0.4} r={r} fill="#f4f1ea" stroke="#14141f" strokeWidth={8} />)}
    </g>
  );
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080}>
        {[[300, 200, 220, -1], [1500, 260, 240, 1], [500, 640, 260, -1], [1400, 760, 250, 1], [960, 450, 280, 1], [150, 980, 230, -1], [1800, 1000, 220, 1]].map(([x, y, r, l], i) => nuvem(x, y, r, l, i))}
      </svg>
    </AbsoluteFill>
  );
};

const Pergaminho: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 16) return null;
  const desce = interpolate(f, [0, 8], [0, 1], {...cl, easing: Easing.out(Easing.quad)});
  const some = interpolate(f, [9, 16], [0, 1], cl);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', transform: `translateY(${some * -1150}px)`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1080 * desce, background: 'linear-gradient(90deg, #d8bf8a, #efe0b8 50%, #d8bf8a)', borderBottom: '10px solid #5a3b1d'}} />
      <div style={{position: 'absolute', left: -20, right: -20, top: 1080 * desce - 50, height: 80, borderRadius: 40, background: 'linear-gradient(#a8763c, #6b4520)', border: '8px solid #2a1a0a'}} />
    </AbsoluteFill>
  );
};

const Sino: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 14) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080}>
        {[0, 1, 2].map((i) => {
          const k = interpolate(f, [i * 2, i * 2 + 12], [0, 1], cl);
          return <circle key={i} cx={960} cy={540} r={60 + k * 1100} fill="none" stroke="#ffd36b" strokeWidth={26 * (1 - k)} opacity={1 - k} />;
        })}
      </svg>
      <AbsoluteFill style={{background: '#fff8e0', opacity: interpolate(f, [0, 5], [0.55, 0], cl)}} />
    </AbsoluteFill>
  );
};

export const TransicaoLobo: React.FC<{tipo: TipoTransicaoLobo}> = ({tipo}) => {
  if (tipo === 'garras') return <Garras />;
  if (tipo === 'nuvens') return <Nuvens />;
  if (tipo === 'pergaminho') return <Pergaminho />;
  if (tipo === 'sino') return <Sino />;
  return null;
};
