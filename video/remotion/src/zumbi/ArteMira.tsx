// Arte do Mira HQ na noite de Halloween, desenhada do zero em SVG (desenho próprio, no visual do jogo: contorno preto
// grosso, chão de cada sala com piso próprio, parede com faixa no alto) + decoração: abóboras acesas, teias, velas,
// lua cheia, morcegos e neblina. A parte estática (ArteMira) é memorizada; o que mexe (luz piscando, morcegos,
// neblina) fica em CamadaViva, desenhada por cima, quadro a quadro.
import React from 'react';
import {CORREDORES, DUTOS, MUNDO, P, SALAS, type SalaId} from './mapaMira';

const L = '#121014'; // contorno
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const Abobora: React.FC<{x: number; y: number; s?: number; brilho?: number}> = ({x, y, s = 1, brilho = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={26} rx={30} ry={7} fill="#000" opacity={0.35} />
    <circle cx={0} cy={0} r={42 * brilho} fill="#ff9a2a" opacity={0.18} />
    <ellipse cx={-14} cy={4} rx={16} ry={22} fill="#e8701a" stroke={L} strokeWidth={4} />
    <ellipse cx={14} cy={4} rx={16} ry={22} fill="#e8701a" stroke={L} strokeWidth={4} />
    <ellipse cx={0} cy={4} rx={16} ry={23} fill="#f58a24" stroke={L} strokeWidth={4} />
    <path d="M-3 -18 Q0 -30 8 -30" stroke="#3d6b22" strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M-18 -2 L-9 -9 L-6 0 Z M18 -2 L9 -9 L6 0 Z" fill="#ffe27a" />
    <path d="M-16 10 L-10 16 L-4 11 L2 17 L8 11 L14 16 L18 9 Q0 26 -16 10 Z" fill="#ffe27a" />
  </g>
);

const Teia: React.FC<{x: number; y: number; r?: number; rot?: number}> = ({x, y, r = 70, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`} stroke="#e8e8f0" strokeWidth={2} fill="none" opacity={0.55}>
    {[0, 22, 45, 68, 90].map((a) => <line key={a} x1={0} y1={0} x2={r * Math.cos((a * Math.PI) / 180)} y2={r * Math.sin((a * Math.PI) / 180)} />)}
    {[0.35, 0.6, 0.85].map((k) => (
      <path key={k} d={[0, 22, 45, 68, 90].map((a, i) => `${i ? 'Q' : 'M'}${i ? `${r * k * 0.8 * Math.cos(((a - 11) * Math.PI) / 180)} ${r * k * 0.8 * Math.sin(((a - 11) * Math.PI) / 180)} ` : ''}${r * k * Math.cos((a * Math.PI) / 180)} ${r * k * Math.sin((a * Math.PI) / 180)}`).join(' ')} />
    ))}
  </g>
);

const Vela: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x},${y})`}>
    <circle cx={0} cy={-26} r={22} fill="#ffcf6a" opacity={0.2} />
    <rect x={-6} y={-16} width={12} height={24} rx={3} fill="#f3ead2" stroke={L} strokeWidth={3} />
    <path d="M0 -30 Q6 -22 0 -17 Q-6 -22 0 -30 Z" fill="#ffb02a" />
  </g>
);

// ---------- objetos de cada sala (o que o jogo tem em cada uma) ----------
const Foguete: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-120} y={150} width={240} height={36} rx={8} fill="#2b2e36" stroke={L} strokeWidth={6} />
    <path d="M-60 150 L-60 -60 Q0 -190 60 -60 L60 150 Z" fill="#d9dde6" stroke={L} strokeWidth={8} />
    <path d="M-60 60 L-110 150 L-60 150 Z M60 60 L110 150 L60 150 Z" fill="#c03a3a" stroke={L} strokeWidth={7} />
    <circle cx={0} cy={-20} r={28} fill="#7ad0ff" stroke={L} strokeWidth={7} />
    <rect x={-60} y={90} width={120} height={18} fill="#c03a3a" stroke={L} strokeWidth={5} />
  </g>
);
const Maca: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-70} y={-24} width={140} height={48} rx={10} fill="#eef4f6" stroke={L} strokeWidth={5} />
    <rect x={-70} y={-24} width={36} height={48} rx={8} fill="#cfe3ea" stroke={L} strokeWidth={4} />
  </g>
);
const Armario: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={0} y={0} width={56} height={96} rx={4} fill="#5d7a8c" stroke={L} strokeWidth={5} />
    <line x1={8} y1={14} x2={48} y2={14} stroke={L} strokeWidth={3} /><line x1={8} y1={22} x2={48} y2={22} stroke={L} strokeWidth={3} />
    <circle cx={44} cy={52} r={4} fill="#d8d8d8" />
  </g>
);
const Mesa: React.FC<{x: number; y: number; r?: number; cor?: string}> = ({x, y, r = 60, cor = '#b7a68e'}) => (
  <g transform={`translate(${x},${y})`}>
    <ellipse cx={0} cy={10} rx={r} ry={r * 0.55} fill="#000" opacity={0.25} />
    <ellipse cx={0} cy={0} rx={r} ry={r * 0.55} fill={cor} stroke={L} strokeWidth={6} />
  </g>
);
const Console: React.FC<{x: number; y: number; cor?: string}> = ({x, y, cor = '#4ad8ff'}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-46} y={-22} width={92} height={44} rx={6} fill="#2a2e3a" stroke={L} strokeWidth={5} />
    <rect x={-36} y={-14} width={72} height={20} rx={3} fill={cor} opacity={0.85} />
  </g>
);
const Caixa: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-34} y={-34} width={68} height={68} rx={4} fill="#a37a4a" stroke={L} strokeWidth={5} />
    <path d="M-34 -34 L34 34 M34 -34 L-34 34" stroke="#7b5730" strokeWidth={5} />
  </g>
);
const Vaso: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-60} y={-20} width={120} height={46} rx={8} fill="#6b4a2c" stroke={L} strokeWidth={5} />
    {[-36, 0, 36].map((dx) => <path key={dx} d={`M${dx} -18 q-14 -30 0 -46 q14 16 0 46`} fill="#3f8a3a" stroke={L} strokeWidth={3} />)}
  </g>
);

function objetos(s: SalaId): React.ReactNode {
  const r = SALAS[s];
  const X = (k: number) => r.x + r.w * k, Y = (k: number) => r.y + r.h * k;
  switch (s) {
    case 'Lancamento': return <><Foguete x={X(0.4)} y={Y(0.45)} /><Abobora x={X(0.82)} y={Y(0.85)} s={1.3} /><Caixa x={X(0.85)} y={Y(0.22)} /><Vela x={X(0.12)} y={Y(0.9)} /></>;
    case 'Enfermaria': return <><Maca x={X(0.3)} y={Y(0.45)} /><Maca x={X(0.3)} y={Y(0.75)} /><Console x={X(0.78)} y={Y(0.4)} cor="#8fffd2" /><Vela x={X(0.82)} y={Y(0.82)} /></>;
    case 'Comunicacoes': return <><Console x={X(0.25)} y={Y(0.35)} cor="#7ad0ff" /><Console x={X(0.75)} y={Y(0.35)} cor="#7ad0ff" /><Abobora x={X(0.5)} y={Y(0.8)} /></>;
    case 'Vestiario': return <>{[0.08, 0.24, 0.4, 0.56, 0.72].map((k) => <Armario key={k} x={X(k)} y={Y(0.18)} />)}<Mesa x={X(0.5)} y={Y(0.72)} r={90} cor="#8a7660" /></>;
    case 'Descontaminacao': return <><rect x={X(0.08)} y={Y(0.3)} width={r.w * 0.84} height={r.h * 0.45} rx={10} fill="#b4ff5a" opacity={0.12} stroke="#b4ff5a" strokeWidth={4} strokeDasharray="16 10" /></>;
    case 'Corredor': return null;
    case 'Reator': return <><circle cx={X(0.5)} cy={Y(0.52)} r={95} fill="#123248" stroke={L} strokeWidth={8} /><circle cx={X(0.5)} cy={Y(0.52)} r={58} fill="#4ad8ff" opacity={0.85} stroke={L} strokeWidth={6} /><Console x={X(0.15)} y={Y(0.82)} /><Console x={X(0.85)} y={Y(0.82)} /></>;
    case 'Laboratorio': return <><Console x={X(0.2)} y={Y(0.35)} cor="#b88cff" /><Console x={X(0.5)} y={Y(0.35)} cor="#b88cff" />{[0.72, 0.8, 0.88].map((k) => <rect key={k} x={X(k)} y={Y(0.25)} width={34} height={90} rx={14} fill="#9be36a" opacity={0.75} stroke={L} strokeWidth={5} />)}<Mesa x={X(0.45)} y={Y(0.75)} r={110} cor="#c9d2de" /></>;
    case 'Escritorio': return <><rect x={X(0.15)} y={Y(0.3)} width={r.w * 0.7} height={70} rx={8} fill="#8a5a3a" stroke={L} strokeWidth={6} /><Console x={X(0.3)} y={Y(0.38)} cor="#ffc46a" /><Vela x={X(0.75)} y={Y(0.36)} /></>;
    case 'Admin': return <><rect x={X(0.2)} y={Y(0.35)} width={r.w * 0.6} height={r.h * 0.35} rx={14} fill="#2a2040" stroke={L} strokeWidth={6} /><rect x={X(0.26)} y={Y(0.41)} width={r.w * 0.48} height={r.h * 0.22} rx={6} fill="#d36aff" opacity={0.35} /></>;
    case 'Estufa': return <>{[0.12, 0.32, 0.52, 0.72, 0.9].map((k) => <Vaso key={k} x={X(k)} y={Y(0.3)} />)}{[0.18, 0.4, 0.62, 0.84].map((k, i) => <Abobora key={k} x={X(k)} y={Y(0.72)} s={1 + (i % 2) * 0.3} />)}</>;
    case 'Refeitorio': return <><Mesa x={X(0.25)} y={Y(0.35)} r={80} /><Mesa x={X(0.72)} y={Y(0.35)} r={80} /><Mesa x={X(0.25)} y={Y(0.75)} r={80} /><Mesa x={X(0.72)} y={Y(0.75)} r={80} /><Abobora x={X(0.25)} y={Y(0.33)} s={0.7} /><Vela x={X(0.72)} y={Y(0.35)} /><Console x={X(0.5)} y={Y(0.12)} cor="#ffa640" /></>;
    case 'Varanda': return <><rect x={X(0.86)} y={Y(0.05)} width={18} height={r.h * 0.9} fill="#9aa5c0" stroke={L} strokeWidth={4} /><Abobora x={X(0.4)} y={Y(0.8)} /></>;
    case 'Deposito': return <>{[[0.2, 0.35], [0.36, 0.35], [0.2, 0.68], [0.75, 0.5]].map(([a, b], i) => <Caixa key={i} x={X(a)} y={Y(b)} s={1.2} />)}<rect x={X(0.55)} y={Y(0.25)} width={46} height={70} rx={8} fill="#d23a3a" stroke={L} strokeWidth={5} /></>;
  }
}

const SalaArte: React.FC<{id: SalaId}> = ({id}) => {
  const r = SALAS[id];
  const pid = `piso_${id}`;
  return (
    <g>
      <defs>
        <pattern id={pid} width={64} height={64} patternUnits="userSpaceOnUse">
          <rect width={64} height={64} fill={r.piso} />
          <rect width={32} height={32} fill={r.piso2} /><rect x={32} y={32} width={32} height={32} fill={r.piso2} />
        </pattern>
      </defs>
      {id === 'Estufa' ? (
        <path d={`M${r.x} ${r.y + r.h} L${r.x} ${r.y + r.h * 0.55} Q${r.x + r.w / 2} ${r.y - r.h * 0.45} ${r.x + r.w} ${r.y + r.h * 0.55} L${r.x + r.w} ${r.y + r.h} Z`} fill={`url(#${pid})`} stroke={L} strokeWidth={14} />
      ) : (
        <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={22} fill={`url(#${pid})`} stroke={L} strokeWidth={14} />
      )}
      {/* parede do fundo com faixa, como no jogo */}
      {id !== 'Estufa' && id !== 'Lancamento' ? (
        <>
          <rect x={r.x + 7} y={r.y + 7} width={r.w - 14} height={70} rx={14} fill={r.parede} />
          <rect x={r.x + 7} y={r.y + 62} width={r.w - 14} height={10} fill="#00000040" />
          <line x1={r.x + 7} y1={r.y + 77} x2={r.x + r.w - 7} y2={r.y + 77} stroke={L} strokeWidth={6} />
        </>
      ) : null}
      {objetos(id)}
      {id !== 'Estufa' ? <><Teia x={r.x + 10} y={r.y + 10} r={Math.min(90, r.w * 0.25)} /><Teia x={r.x + r.w - 10} y={r.y + 10} r={Math.min(70, r.w * 0.2)} rot={90} /></> : null}
      <text x={r.x + r.w / 2} y={id === 'Estufa' ? r.y + r.h * 0.42 : r.y + 50} textAnchor="middle" fontFamily="Inter, Arial" fontWeight={900} fontSize={Math.min(38, (r.w - 30) / (r.nome.length * 0.68))} fill="#ffffffcc" stroke={L} strokeWidth={6} paintOrder="stroke">{r.nome.toUpperCase()}</text>
    </g>
  );
};

const Exterior: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0b0820" /><stop offset="0.6" stopColor="#1d1240" /><stop offset="1" stopColor="#3a1a3a" />
      </linearGradient>
      <radialGradient id="lua"><stop offset="0" stopColor="#fff8d8" /><stop offset="0.55" stopColor="#ffe9a8" /><stop offset="1" stopColor="#ffe9a800" /></radialGradient>
    </defs>
    <rect width={MUNDO.w} height={MUNDO.h} fill="url(#ceu)" />
    {Array.from({length: 220}).map((_, i) => <circle key={i} cx={rnd(i) * MUNDO.w} cy={rnd(i + 500) * MUNDO.h} r={1 + rnd(i + 9) * 3} fill="#fff" opacity={0.3 + rnd(i + 3) * 0.6} />)}
    <circle cx={260} cy={260} r={300} fill="url(#lua)" opacity={0.5} />
    <circle cx={260} cy={260} r={150} fill="#fff3c8" stroke="#e8d79a" strokeWidth={6} />
    <circle cx={220} cy={230} r={26} fill="#e9dba8" /><circle cx={300} cy={300} r={18} fill="#e9dba8" /><circle cx={290} cy={210} r={12} fill="#e9dba8" />
    {/* nuvens roxas atrás da estação */}
    {Array.from({length: 18}).map((_, i) => <ellipse key={i} cx={rnd(i + 40) * MUNDO.w} cy={MUNDO.h * (0.55 + rnd(i + 70) * 0.45)} rx={220 + rnd(i) * 260} ry={60 + rnd(i + 1) * 50} fill="#2c1d4a" opacity={0.55} />)}
  </g>
);

const Corredores: React.FC = () => (
  <g>
    {CORREDORES.map((pts, i) => {
      const d = pts.map((p, k) => `${k ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
      return <path key={`b${i}`} d={d} stroke={L} strokeWidth={196} fill="none" strokeLinejoin="round" strokeLinecap="square" />;
    })}
    {CORREDORES.map((pts, i) => {
      const d = pts.map((p, k) => `${k ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
      return (
        <g key={i}>
          <path d={d} stroke="#4b505c" strokeWidth={172} fill="none" strokeLinejoin="round" strokeLinecap="square" />
          <path d={d} stroke="#575c69" strokeWidth={90} fill="none" strokeLinejoin="round" strokeLinecap="square" strokeDasharray="40 40" opacity={0.55} />
        </g>
      );
    })}
  </g>
);

// grade de duto no chão, como no jogo
const Duto: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-38} y={-24} width={76} height={48} rx={6} fill="#2a2d35" stroke={L} strokeWidth={6} />
    {[-22, -8, 6, 20].map((dx) => <line key={dx} x1={dx} y1={-16} x2={dx} y2={16} stroke="#4a4f5c" strokeWidth={6} />)}
  </g>
);

// abóboras, velas e teias pelos corredores (o Y central e o corredor de baixo)
const CorredorDecor: React.FC = () => (
  <g>
    {[[656, 200], [600, 312], [712, 312], [380, 482], [500, 482], [453, 410]].map(([x, y], i) => (i % 2 ? <Vela key={i} {...P(x, y)} /> : <Abobora key={i} {...P(x, y)} s={0.9} />))}
  </g>
);

const ArteBase: React.FC = () => (
  <svg width={MUNDO.w} height={MUNDO.h} style={{position: 'absolute', left: 0, top: 0}}>
    <Exterior />
    <Corredores />
    {(Object.keys(SALAS) as SalaId[]).filter((id) => id !== 'Corredor').map((id) => <SalaArte key={id} id={id} />)}
    <CorredorDecor />
    {DUTOS.map((p, i) => <Duto key={i} {...p} />)}
  </svg>
);
export const ArteMira = React.memo(ArteBase);

// o que mexe: poças de luz que piscam em cada sala, morcegos, neblina rolando
export const CamadaViva: React.FC<{f: number; apagadas?: SalaId[]}> = ({f, apagadas = []}) => (
  <svg width={MUNDO.w} height={MUNDO.h} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
    <defs>
      {(Object.keys(SALAS) as SalaId[]).map((id) => (
        <radialGradient key={id} id={`luz_${id}`}><stop offset="0" stopColor={SALAS[id].luz} stopOpacity={0.32} /><stop offset="1" stopColor={SALAS[id].luz} stopOpacity={0} /></radialGradient>
      ))}
    </defs>
    {(Object.keys(SALAS) as SalaId[]).map((id, i) => {
      const r = SALAS[id];
      const pisca = 0.75 + 0.25 * Math.sin(f / (5 + (i % 4)) + i) * (Math.sin(f / 37 + i * 3) > 0.92 ? 3 : 1);
      return <ellipse key={id} cx={r.x + r.w / 2} cy={r.y + r.h / 2} rx={r.w * 0.6} ry={r.h * 0.6} fill={`url(#luz_${id})`} opacity={apagadas.includes(id) ? 0 : Math.max(0.2, pisca)} />;
    })}
    {Array.from({length: 7}).map((_, i) => {
      const x = ((f * (3 + i) + rnd(i) * MUNDO.w * 3) % (MUNDO.w + 400)) - 200;
      const y = 120 + rnd(i + 20) * 1600 + Math.sin(f / 12 + i) * 40;
      const a = Math.sin(f / 3 + i) * 18;
      return (
        <g key={i} transform={`translate(${x},${y}) scale(${0.8 + rnd(i) * 0.6})`}>
          <path d={`M0 0 Q-20 ${-14 - a} -46 ${-4 - a} Q-30 4 -16 6 Q-8 12 0 4 Q8 12 16 6 Q30 4 46 ${-4 - a} Q20 ${-14 - a} 0 0 Z`} fill="#140c1e" />
          <circle cx={-4} cy={0} r={2.5} fill="#ff4a2a" /><circle cx={4} cy={0} r={2.5} fill="#ff4a2a" />
        </g>
      );
    })}
    {Array.from({length: 10}).map((_, i) => (
      <ellipse key={i} cx={((rnd(i + 3) * MUNDO.w + f * (1 + rnd(i) * 1.5)) % (MUNDO.w + 800)) - 400} cy={rnd(i + 8) * MUNDO.h} rx={420} ry={90} fill="#c9b8ff" opacity={0.06} />
    ))}
  </svg>
);
