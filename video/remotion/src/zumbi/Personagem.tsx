// Personagem do modo zumbi: o tripulante do canal (Crewmate4) em três estados:
// humano (cor normal), mordido (cor normal + contorno verde pulsando, só para o espectador ver) e zumbi
// (todo verde, skin própria: visor rachado amarelo-esverdeado com olhos vermelhos, costuras, baba, braços pra frente).
// Por cima: estrelas girando quando atordoado e a etiqueta com a cor.
import React from 'react';
import {Crewmate4} from '../amongus/Crewmate4';

export type Estado = 'humano' | 'mordido' | 'zumbi';

const Estrelas: React.FC<{f: number; s: number}> = ({f, s}) => (
  <svg width={s} height={s * 0.5} viewBox="-50 -25 100 50" style={{position: 'absolute', left: -s / 2, top: -s * 0.95, overflow: 'visible'}}>
    <ellipse cx={0} cy={0} rx={40} ry={12} fill="none" stroke="#fff6" strokeWidth={3} />
    {[0, 1, 2].map((i) => {
      const a = f / 6 + (i * Math.PI * 2) / 3;
      const x = 40 * Math.cos(a), y = 12 * Math.sin(a);
      return <path key={i} transform={`translate(${x},${y}) scale(${0.8 + 0.3 * Math.sin(a)})`} d="M0 -9 L2.6 -2.6 L9 0 L2.6 2.6 L0 9 L-2.6 2.6 L-9 0 L-2.6 -2.6 Z" fill="#ffe14a" stroke="#000" strokeWidth={2} />;
    })}
  </svg>
);

// por cima do tripulante verde: a cara de zumbi (no mesmo viewBox 0 0 100 120 do Crewmate4)
const RostoZumbi: React.FC<{s: number; f: number; virado?: boolean}> = ({s, f, virado}) => (
  <svg width={s} height={s * 1.2} viewBox="0 0 100 120" style={{position: 'absolute', left: 0, top: 0, transform: virado ? 'scaleX(-1)' : undefined}}>
    {/* visor podre com rachadura */}
    <rect x={43} y={24} width={41} height={25} rx={12.5} fill="#c9d65a" stroke="#000" strokeWidth={5} />
    <path d="M58 25 L62 34 L57 40 L63 48" stroke="#000" strokeWidth={2.5} fill="none" />
    <circle cx={53} cy={36} r={4.2} fill="#ff2a2a" /><circle cx={73} cy={36} r={4.2} fill="#ff2a2a" />
    <circle cx={53} cy={36} r={7} fill="#ff2a2a" opacity={0.25 + 0.15 * Math.sin(f / 4)} /><circle cx={73} cy={36} r={7} fill="#ff2a2a" opacity={0.25 + 0.15 * Math.sin(f / 4)} />
    {/* costuras e mancha */}
    <path d="M32 66 L52 70 M36 62 L36 72 M44 64 L43 74 M50 66 L49 75" stroke="#1d3311" strokeWidth={3} strokeLinecap="round" />
    <ellipse cx={66} cy={78} rx={9} ry={6} fill="#4a7a2e" opacity={0.8} />
    {/* baba */}
    <path d={`M70 49 Q71 ${58 + 3 * Math.sin(f / 7)} 69 ${62 + 4 * Math.sin(f / 7)}`} stroke="#d8ff7a" strokeWidth={3} fill="none" strokeLinecap="round" />
    {/* braços esticados para a frente */}
    <path d={`M78 58 L98 ${56 + 2 * Math.sin(f / 5)}`} stroke="#000" strokeWidth={14} strokeLinecap="round" />
    <path d={`M78 58 L98 ${56 + 2 * Math.sin(f / 5)}`} stroke="#6fae4a" strokeWidth={8} strokeLinecap="round" />
  </svg>
);

export const Personagem: React.FC<{cor: string; estado: Estado; f: number; s?: number; andando?: boolean; virado?: boolean; atordoado?: boolean; destaque?: boolean; etiqueta?: boolean}> = ({cor, estado, f, s = 120, andando, virado, atordoado, destaque, etiqueta = true}) => {
  const zumbi = estado === 'zumbi';
  const brilho = 0.6 + 0.4 * Math.sin(f / 5);
  const filtro = estado === 'mordido' ? `drop-shadow(0 0 ${5 * brilho}px #3dff4a) drop-shadow(0 0 3px #3dff4a) drop-shadow(0 0 1px #3dff4a)` : destaque ? 'drop-shadow(0 0 6px #fff) drop-shadow(0 0 2px #fff)' : zumbi ? 'drop-shadow(0 0 8px #6aff3a88)' : undefined;
  const balanco = zumbi && !andando ? Math.sin(f / 9) * 4 : 0;
  return (
    <div style={{position: 'absolute', left: -s / 2, top: -s * 1.1, width: s, height: s * 1.2, filter: filtro, transform: `rotate(${balanco}deg)`}}>
      <Crewmate4 cor={zumbi ? 'Zumbi' : cor} size={s} passo={andando ? f / (zumbi ? 18 : 12) : 0} virado={virado} t={f} />
      {zumbi ? <RostoZumbi s={s} f={f} virado={virado} /> : null}
      {atordoado ? <Estrelas f={f} s={s} /> : null}
      {etiqueta ? (
        <div style={{position: 'absolute', left: '50%', top: -s * 0.32, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: 'Inter, Arial', fontWeight: 900, fontSize: s * 0.2, color: zumbi ? '#9dff6a' : '#fff', WebkitTextStroke: `${s * 0.035}px #000`, paintOrder: 'stroke fill'}}>{cor}</div>
      ) : null}
    </div>
  );
};
