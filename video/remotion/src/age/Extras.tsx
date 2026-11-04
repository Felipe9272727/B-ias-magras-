// Peças extras do AGE DAS IAs (revisão do Sonnet): cartão de elenco com as 6 IAs, diagrama de alianças com setas,
// número grande ("38 -> 5") e efeitos de combate (poeira/fumaça). Tudo desenhado em SVG/CSS, sem emoji.
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CORES_J} from './Mapa';
import {FONTE, type IA} from './Hud';

const OURO = '#d9b45a';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const PAINEL: React.CSSProperties = {background: 'linear-gradient(#1d1a16f2, #12100df2)', border: `3px solid ${OURO}`, borderRadius: 14, boxShadow: '0 10px 30px #000b'};
const CIV = ['Bretões', 'Gauleses', 'Romanos', 'Atenienses', 'Espartanos', 'Ibéricos'];

// escudo com a cor do império (o "rosto" de cada IA no vídeo)
export const Brasao: React.FC<{j: number; s?: number}> = ({j, s = 90}) => (
  <svg width={s} height={s * 1.15} viewBox="0 0 40 46">
    <path d="M4 4 H36 V22 Q36 38 20 44 Q4 38 4 22 Z" fill={CORES_J[j]} stroke="#1a1208" strokeWidth="2.5" />
    <path d="M4 4 H36 V12 H4 Z" fill="#00000033" />
    <path d="M20 14 L23 21 L30 21 L24.5 25.5 L26.5 33 L20 28.5 L13.5 33 L15.5 25.5 L10 21 L17 21 Z" fill="#fff6dc" stroke="#1a1208" strokeWidth="1" />
  </svg>
);

export const Elenco: React.FC<{ias: IA[]; destaque?: number[]}> = ({ias, destaque}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', inset: 0, background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 420px)', gap: 28}}>
        {ias.map((ia, i) => {
          const e = spring({frame: f - i * 18, fps, config: {damping: 13, stiffness: 170}});
          const dest = destaque?.includes(i + 1);
          return (
            <div key={i} style={{...PAINEL, borderColor: dest ? '#fff' : OURO, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'center', transform: `translateY(${(1 - e) * 120}px) scale(${0.8 + 0.2 * e})`, opacity: e}}>
              <Brasao j={i + 1} s={84} />
              <div>
                <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 44, color: '#fff', lineHeight: 1}}>{ia.nome}</div>
                <div style={{fontFamily: FONTE, fontWeight: 700, fontSize: 22, color: '#bbb', marginTop: 4}}>{ia.modelo}</div>
                <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 24, color: CORES_J[i + 1], marginTop: 6, letterSpacing: 1}}>{CIV[i].toUpperCase()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// diagrama de alianças: as 6 IAs num círculo, setas com rótulo (ex.: "PAGA", "ATACA")
export type Seta = [number, number, string, string?];
export const Diagrama: React.FC<{ias: IA[]; setas: Seta[]; dur: number}> = ({ias, setas, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 14}});
  const out = interpolate(f, [dur - 8, dur], [1, 0], cl);
  const W = 560;
  const R = 200;
  const pos = (j: number): [number, number] => {
    const a = -Math.PI / 2 + ((j - 1) * 2 * Math.PI) / 6;
    return [W / 2 + R * Math.cos(a), W / 2 + R * Math.sin(a)];
  };
  return (
    <div style={{position: 'absolute', left: 30, top: 100, width: W, height: W, ...PAINEL, opacity: e * out, transform: `scale(${0.85 + 0.15 * e})`}}>
      <svg width={W} height={W} style={{position: 'absolute', inset: 0}}>
        <defs>
          {setas.map((s, i) => (
            <marker key={i} id={`pt${i}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 Z" fill={s[3] ?? '#fff'} />
            </marker>
          ))}
        </defs>
        {setas.map(([a, b, rot, cor], i) => {
          const [x1, y1] = pos(a);
          const [x2, y2] = pos(b);
          const k = interpolate(f, [8 + i * 12, 22 + i * 12], [0, 1], cl);
          const dx = x2 - x1;
          const dy = y2 - y1;
          const L = Math.hypot(dx, dy);
          const sx = x1 + (dx / L) * 52;
          const sy = y1 + (dy / L) * 52;
          const ex = sx + (dx - (dx / L) * 104) * k;
          const ey = sy + (dy - (dy / L) * 104) * k;
          return (
            <g key={i}>
              <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={cor ?? '#fff'} strokeWidth={7} markerEnd={k > 0.95 ? `url(#pt${i})` : undefined} />
              {k > 0.6 ? (
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 8} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={24} fill="#fff" stroke="#000" strokeWidth={6} paintOrder="stroke">{rot}</text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {ias.map((ia, i) => {
        const [x, y] = pos(i + 1);
        return (
          <div key={i} style={{position: 'absolute', left: x - 50, top: y - 44, width: 100, textAlign: 'center'}}>
            <Brasao j={i + 1} s={56} />
            <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 22, color: '#fff', WebkitTextStroke: '5px #000', paintOrder: 'stroke fill', marginTop: -6}}>{ia.nome}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Numero: React.FC<{texto: string; sub?: string; dur: number}> = ({texto, sub, dur}) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 7], [2.6, 1], cl);
  const o = interpolate(f, [0, 4, dur - 8, dur], [0, 1, 1, 0], cl);
  return (
    <div style={{position: 'absolute', top: 260, left: 0, right: 360, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 170, lineHeight: 1, color: '#ffd400', transform: `scale(${e})`, WebkitTextStroke: '18px #000', paintOrder: 'stroke fill'}}>{texto}</div>
      {sub ? <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 46, color: '#fff', WebkitTextStroke: '9px #000', paintOrder: 'stroke fill', marginTop: 6}}>{sub}</div> : null}
    </div>
  );
};

// poeira/fumaça de combate em volta de uma unidade (posição em tela), animada pelo quadro
export const Poeira: React.FC<{sx: number; sy: number; s: number; f: number; seed: number}> = ({sx, sy, s, f, seed}) => {
  const fase = ((f + seed * 7) % 24) / 24;
  const r = s * (0.6 + fase * 0.9);
  return (
    <div style={{position: 'absolute', left: sx - r, top: sy - r * 0.8, width: r * 2, height: r * 1.3, borderRadius: '50%', pointerEvents: 'none',
      background: 'radial-gradient(#d8c8a8cc, #b8a07a66 45%, #b8a07a00 70%)', opacity: 1 - fase}} />
  );
};

export const Fogo: React.FC<{sx: number; sy: number; s: number; f: number; seed: number}> = ({sx, sy, s, f, seed}) => {
  const k = Math.sin((f + seed * 5) * 0.6) * 0.15 + 1;
  return (
    <div style={{position: 'absolute', left: sx - s * 0.5, top: sy - s * 1.4, width: s, height: s * 1.4, pointerEvents: 'none', transform: `scale(${k})`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50% 50% 40% 40%', background: 'radial-gradient(ellipse at 50% 70%, #ffef7a, #ff8a1e 45%, #e0321400 75%)'}} />
      <div style={{position: 'absolute', left: '10%', right: '10%', top: '-60%', height: '70%', borderRadius: '50%', background: 'radial-gradient(#55555588, #33333300 70%)'}} />
    </div>
  );
};
