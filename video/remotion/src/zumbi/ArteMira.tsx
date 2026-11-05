// Arte do Mira HQ na noite de Halloween, desenhada do zero em SVG seguindo a arte do jogo (imagem de referência):
// corredores com o piso de cada trecho (Y de vidro azul, corredor de tijolo, faixa verde do Lançamento, braço claro),
// cada sala desenhada no seu arquivo (salas/*.tsx) e, por cima, o contorno grosso e o nome. O céu tem lua cheia,
// estrelas e nuvens roxas. A parte estática (ArteMira) é memorizada; o que mexe fica em CamadaViva.
import React from 'react';
import {CORREDORES, DUTOS, MUNDO, P, SALAS, type Sala, type SalaId} from './mapaMira';
import {Abobora, L, Luzinhas, rnd, Teia, Vela} from './salas/comum';
import {SalaEstufa} from './salas/Estufa';
import {SalaReator} from './salas/Reator';
import {SalaLaboratorio} from './salas/Laboratorio';
import {SalaEscritorio} from './salas/Escritorio';
import {SalaAdmin} from './salas/Admin';
import {SalaVestiario} from './salas/Vestiario';
import {SalaComunicacoes} from './salas/Comunicacoes';
import {SalaEnfermaria} from './salas/Enfermaria';
import {SalaDeposito} from './salas/Deposito';
import {SalaRefeitorio} from './salas/Refeitorio';
import {SalaVaranda} from './salas/Varanda';
import {SalaCorredor, SalaDescontaminacao, SalaLancamento} from './salas/Estrutura';

const DESENHO: Record<SalaId, React.FC<{r: Sala}>> = {
  Estufa: SalaEstufa, Reator: SalaReator, Laboratorio: SalaLaboratorio, Escritorio: SalaEscritorio, Admin: SalaAdmin, Vestiario: SalaVestiario,
  Comunicacoes: SalaComunicacoes, Enfermaria: SalaEnfermaria, Deposito: SalaDeposito, Refeitorio: SalaRefeitorio, Varanda: SalaVaranda,
  Lancamento: SalaLancamento, Descontaminacao: SalaDescontaminacao, Corredor: SalaCorredor,
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
    {Array.from({length: 260}).map((_, i) => <circle key={i} cx={rnd(i) * MUNDO.w} cy={rnd(i + 500) * MUNDO.h} r={1.5 + rnd(i + 9) * 3.5} fill="#fff" opacity={0.3 + rnd(i + 3) * 0.6} />)}
    <circle cx={700} cy={500} r={420} fill="url(#lua)" opacity={0.5} />
    <circle cx={700} cy={500} r={210} fill="#fff3c8" stroke="#e8d79a" strokeWidth={8} />
    <circle cx={640} cy={450} r={36} fill="#e9dba8" /><circle cx={760} cy={570} r={26} fill="#e9dba8" /><circle cx={750} cy={420} r={16} fill="#e9dba8" />
    {Array.from({length: 22}).map((_, i) => <ellipse key={i} cx={rnd(i + 40) * MUNDO.w} cy={MUNDO.h * (0.15 + rnd(i + 70) * 0.85)} rx={260 + rnd(i) * 320} ry={70 + rnd(i + 1) * 60} fill="#2c1d4a" opacity={0.5} />)}
  </g>
);

// piso dos corredores, por trecho, como na arte do jogo
const PISO_CORR: Record<string, {base: string; faixa: string; dash?: string}> = {
  vidro: {base: '#6f8fbf', faixa: '#9ab6e0', dash: '60 40'},
  tijolo: {base: '#9a4a3a', faixa: '#b85a46', dash: '50 12'},
  verde: {base: '#2f8a3a', faixa: '#3fa64a'},
  metal: {base: '#4a4f5c', faixa: '#5a606e', dash: '40 40'},
  claro: {base: '#c9d0d8', faixa: '#dde3ea', dash: '70 20'},
};
const LARG = 200;
const Corredores: React.FC = () => (
  <g>
    {CORREDORES.map((c, i) => <path key={`b${i}`} d={c.pts.map((p, k) => `${k ? 'L' : 'M'}${p.x} ${p.y}`).join(' ')} stroke={L} strokeWidth={LARG + 26} fill="none" strokeLinejoin="round" strokeLinecap="square" />)}
    {CORREDORES.map((c, i) => {
      const d = c.pts.map((p, k) => `${k ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
      const t = PISO_CORR[c.piso];
      return (
        <g key={i}>
          <path d={d} stroke={t.base} strokeWidth={LARG} fill="none" strokeLinejoin="round" strokeLinecap="square" />
          <path d={d} stroke={t.faixa} strokeWidth={LARG * 0.55} fill="none" strokeLinejoin="round" strokeLinecap="square" strokeDasharray={t.dash} opacity={0.7} />
          {c.piso === 'vidro' ? <path d={d} stroke="#ffffff" strokeWidth={6} fill="none" strokeDasharray="2 90" opacity={0.5} /> : null}
        </g>
      );
    })}
  </g>
);

const Duto: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-42} y={-26} width={84} height={52} rx={6} fill="#2a2d35" stroke={L} strokeWidth={6} />
    {[-24, -8, 8, 24].map((dx) => <line key={dx} x1={dx} y1={-18} x2={dx} y2={18} stroke="#4a4f5c" strokeWidth={6} />)}
  </g>
);

const Moldura: React.FC<{id: SalaId}> = ({id}) => {
  const r = SALAS[id];
  if (id === 'Corredor') return null;
  return (
    <g>
      <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={10} fill="none" stroke={L} strokeWidth={16} />
      <text x={r.x + r.w / 2} y={r.y + r.h - 24} textAnchor="middle" fontFamily="Poppins, Inter, Arial" fontWeight={900} fontSize={Math.min(44, (r.w - 30) / (r.nome.length * 0.66))} fill="#ffffffee" stroke={L} strokeWidth={8} paintOrder="stroke">{r.nome.toUpperCase()}</text>
    </g>
  );
};

const Decor: React.FC = () => (
  <g>
    {[[300, 395], [160, 395], [318, 300], [470, 270], [390, 140]].map(([x, y], i) => (i % 2 ? <Vela key={i} {...P(x, y)} s={1.3} /> : <Abobora key={i} {...P(x, y)} s={1.3} />))}
    <Teia {...P(320, 5)} r={110} /><Teia {...P(460, 5)} r={90} rot={90} /><Teia {...P(148, 155)} r={90} />
    <Luzinhas x1={P(320, 0).x + 30} x2={P(460, 0).x - 30} y={P(0, 8).y} />
  </g>
);

const ArteBase: React.FC = () => (
  <svg width={MUNDO.w} height={MUNDO.h} style={{position: 'absolute', left: 0, top: 0}}>
    <Exterior />
    <Corredores />
    {(Object.keys(SALAS) as SalaId[]).map((id) => {
      const D = DESENHO[id];
      return <g key={id}><D r={SALAS[id]} /></g>;
    })}
    {DUTOS.map((p, i) => <Duto key={i} {...p} />)}
    <Decor />
    {(Object.keys(SALAS) as SalaId[]).map((id) => <Moldura key={id} id={id} />)}
  </svg>
);
export const ArteMira = React.memo(ArteBase);

// o que mexe: poças de luz que piscam em cada sala, morcegos, neblina rolando
export const CamadaViva: React.FC<{f: number; apagadas?: SalaId[]}> = ({f, apagadas = []}) => (
  <svg width={MUNDO.w} height={MUNDO.h} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
    <defs>
      {(Object.keys(SALAS) as SalaId[]).map((id) => (
        <radialGradient key={id} id={`luz_${id}`}><stop offset="0" stopColor={SALAS[id].luz} stopOpacity={0.28} /><stop offset="1" stopColor={SALAS[id].luz} stopOpacity={0} /></radialGradient>
      ))}
    </defs>
    {(Object.keys(SALAS) as SalaId[]).map((id, i) => {
      const r = SALAS[id];
      const pisca = 0.75 + 0.25 * Math.sin(f / (5 + (i % 4)) + i) * (Math.sin(f / 37 + i * 3) > 0.92 ? 3 : 1);
      return <ellipse key={id} cx={r.x + r.w / 2} cy={r.y + r.h / 2} rx={r.w * 0.6} ry={r.h * 0.6} fill={`url(#luz_${id})`} opacity={apagadas.includes(id) ? 0 : Math.max(0.2, pisca)} />;
    })}
    {Array.from({length: 8}).map((_, i) => {
      const x = ((f * (4 + i) + rnd(i) * MUNDO.w * 3) % (MUNDO.w + 400)) - 200;
      const y = 150 + rnd(i + 20) * (MUNDO.h - 300) + Math.sin(f / 12 + i) * 50;
      const a = Math.sin(f / 3 + i) * 22;
      return (
        <g key={i} transform={`translate(${x},${y}) scale(${1.1 + rnd(i) * 0.8})`}>
          <path d={`M0 0 Q-20 ${-14 - a} -46 ${-4 - a} Q-30 4 -16 6 Q-8 12 0 4 Q8 12 16 6 Q30 4 46 ${-4 - a} Q20 ${-14 - a} 0 0 Z`} fill="#140c1e" />
          <circle cx={-4} cy={0} r={2.5} fill="#ff4a2a" /><circle cx={4} cy={0} r={2.5} fill="#ff4a2a" />
        </g>
      );
    })}
    {Array.from({length: 12}).map((_, i) => (
      <ellipse key={i} cx={((rnd(i + 3) * MUNDO.w + f * (1 + rnd(i) * 1.5)) % (MUNDO.w + 800)) - 400} cy={rnd(i + 8) * MUNDO.h} rx={520} ry={110} fill="#c9b8ff" opacity={0.05} />
    ))}
  </svg>
);
