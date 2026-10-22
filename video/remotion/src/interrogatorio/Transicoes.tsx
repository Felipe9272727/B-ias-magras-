// Transições de entrada de cena do Interrogatório das IAs (feitas do zero, com o tema da delegacia).
// Cada uma é uma sobreposição que começa no quadro 0 da cena e some sozinha:
//  - 'grades':  grades de cela descem com tudo e sobem (começo de caso)
//  - 'flash':   flash de câmera de perícia, com as lâminas do obturador fechando e abrindo (pasta, verdade)
//  - 'fita':    fita amarela "NÃO ULTRAPASSE" atravessa a tela na diagonal (sala de espera, placar, títulos)
//  - 'lupa':    uma lupa passa pela tela e "revela" a cena por dentro do vidro (volta para a sala)
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {FONT} from '../theme';

export type TipoTransicaoInt = 'grades' | 'flash' | 'fita' | 'lupa' | 'nenhuma';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export const escolherTransicaoInt = (anterior: string | undefined, atual: string): TipoTransicaoInt => {
  if (!anterior) return 'nenhuma';
  if (atual === 'INTCapa') return 'grades';
  if (atual === 'INTPasta' || atual === 'INTVerdade') return 'flash';
  if (atual === 'INTLobby' || atual === 'INTPlacar' || atual === 'INTTitulo' || atual === 'INTElenco' || atual === 'INTComentario') return 'fita';
  if (atual === 'INTSala' && anterior !== 'INTSala') return 'lupa';
  return 'nenhuma'; // sala → sala: a câmera da própria sala já corta entre quem fala
};

const Grades: React.FC = () => {
  const f = useCurrentFrame();
  const desce = interpolate(f, [0, 6], [-1100, 0], {...cl, easing: Easing.in(Easing.quad)});
  const sobe = interpolate(f, [12, 20], [0, -1100], {...cl, easing: Easing.in(Easing.cubic)});
  const y = f < 12 ? desce : sobe;
  const pulo = f >= 6 && f < 12 ? Math.sin((f - 6) * 1.6) * 14 * (1 - (f - 6) / 6) : 0;
  if (f > 20) return null;
  return (
    <AbsoluteFill style={{transform: `translateY(${y + pulo}px)`, pointerEvents: 'none'}}>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="barra" x1="0" x2="1">
            <stop offset="0" stopColor="#2a2f38" />
            <stop offset="0.45" stopColor="#9aa3b2" />
            <stop offset="1" stopColor="#1c2028" />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={1920} height={1080} fill="#000" opacity={0.35} />
        {Array.from({length: 13}, (_, i) => <rect key={i} x={30 + i * 150} y={0} width={46} height={1080} rx={12} fill="url(#barra)" stroke="#0b0d12" strokeWidth={6} />)}
        {[210, 860].map((yy) => <rect key={yy} x={0} y={yy} width={1920} height={52} rx={10} fill="url(#barra)" stroke="#0b0d12" strokeWidth={6} />)}
      </svg>
    </AbsoluteFill>
  );
};

const Flash: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 14) return null;
  const branco = interpolate(f, [0, 2, 9], [1, 0.9, 0], cl);
  const fecha = interpolate(f, [0, 4, 10], [0, 1, 0], cl); // lâminas do obturador
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {Array.from({length: 6}, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          const r = 1400 * (1 - fecha) + 80;
          const cx = 960 + Math.cos(a) * r, cy = 540 + Math.sin(a) * r;
          return <path key={i} d={`M${cx} ${cy} l ${Math.cos(a + 2.1) * 2200} ${Math.sin(a + 2.1) * 2200} l ${Math.cos(a + 1.05) * 2200} ${Math.sin(a + 1.05) * 2200} Z`} fill="#111318" stroke="#2b2f38" strokeWidth={8} />;
        })}
      </svg>
      <AbsoluteFill style={{background: '#fff', opacity: branco}} />
    </AbsoluteFill>
  );
};

const Fita: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 16) return null;
  const x = interpolate(f, [0, 16], [-2600, 2600], {...cl, easing: Easing.inOut(Easing.quad)});
  const faixa = (dy: number, rot: number, atraso: number) => (
    <div style={{position: 'absolute', left: -400 + x * (1 - atraso * 0.15), top: 480 + dy, width: 2800, height: 120, background: '#ffd21f', border: '8px solid #111', transform: `rotate(${rot}deg)`, display: 'flex', alignItems: 'center', overflow: 'hidden', whiteSpace: 'nowrap', boxShadow: '0 12px 0 #0007'}}>
      <span style={{fontFamily: FONT.comic, fontSize: 70, letterSpacing: 8, color: '#111'}}>
        {'NÃO ULTRAPASSE · ÁREA DE INTERROGATÓRIO · '.repeat(5)}
      </span>
    </div>
  );
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      {faixa(-150, -8, 0)}
      {faixa(140, 6, 1)}
    </AbsoluteFill>
  );
};

const Lupa: React.FC = () => {
  const f = useCurrentFrame();
  if (f > 14) return null;
  const r = interpolate(f, [0, 14], [60, 1500], {...cl, easing: Easing.in(Easing.quad)});
  const cx = interpolate(f, [0, 14], [1500, 960], cl), cy = 540;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080}>
        <defs>
          <mask id="vidro">
            <rect width={1920} height={1080} fill="#fff" />
            <circle cx={cx} cy={cy} r={r} fill="#000" />
          </mask>
        </defs>
        <rect width={1920} height={1080} fill="#0b0d12" mask="url(#vidro)" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#c9a46a" strokeWidth={34} />
        <line x1={cx + r * 0.72} y1={cy + r * 0.72} x2={cx + r * 0.72 + 260} y2={cy + r * 0.72 + 260} stroke="#6b3a1f" strokeWidth={70} strokeLinecap="round" />
      </svg>
    </AbsoluteFill>
  );
};

export const TransicaoInt: React.FC<{tipo: TipoTransicaoInt}> = ({tipo}) => {
  if (tipo === 'grades') return <Grades />;
  if (tipo === 'flash') return <Flash />;
  if (tipo === 'fita') return <Fita />;
  if (tipo === 'lupa') return <Lupa />;
  return null;
};
