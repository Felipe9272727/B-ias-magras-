// Interface do Among IA 6 (modo zumbi), tema Halloween (roxo e laranja, sem emoji: ícones em SVG):
// placar Humanos/Mordidos/Zumbis (o "mordidos" só o espectador vê), barra do rádio de resgate, relógio da lua ao sol,
// balão de fala por proximidade (só quem estava na sala ouviu), pensamento secreto e cartão de capítulo.
import React from 'react';
import {interpolate, spring, useVideoConfig} from 'remotion';
import {COR} from '../amongus/Crewmate';
import type {Tique} from './Jogo';

export const FONTE = "'Poppins', 'Inter', sans-serif";
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const PAINEL: React.CSSProperties = {background: 'linear-gradient(180deg, #2a1640ee, #160b24ee)', border: '4px solid #ff8a2a', borderRadius: 18, boxShadow: '0 10px 0 #00000088, 0 0 30px #ff8a2a44'};
export const corDe = (c: string) => (COR[c] ?? COR.Branco).body;

const Cara: React.FC<{tipo: 'humano' | 'mordido' | 'zumbi'; s?: number}> = ({tipo, s = 34}) => (
  <svg width={s} height={s * 1.15} viewBox="0 0 100 115">
    <path d="M22 58 C22 28 34 8 51 8 C69 8 80 28 80 58 L80 92 Q80 100 72 100 L30 100 Q22 100 22 92 Z" fill={tipo === 'zumbi' ? '#6fae4a' : '#d6e0f0'} stroke={tipo === 'mordido' ? '#3dff4a' : '#000'} strokeWidth={tipo === 'mordido' ? 9 : 6} />
    <rect x={43} y={24} width={41} height={25} rx={12.5} fill={tipo === 'zumbi' ? '#c9d65a' : '#9fd8ff'} stroke="#000" strokeWidth={5} />
    {tipo === 'zumbi' ? <><circle cx={53} cy={36} r={4} fill="#f22" /><circle cx={73} cy={36} r={4} fill="#f22" /></> : null}
  </svg>
);

export const Placar: React.FC<{t: Tique; f: number}> = ({t, f}) => {
  const n = {humano: 0, mordido: 0, zumbi: 0, salvo: 0};
  for (const e of t.estados) { if (e.salvo) n.salvo++; else n[e.estado as 'humano' | 'mordido' | 'zumbi']++; }
  const item = (tipo: 'humano' | 'mordido' | 'zumbi', v: number, cor: string, rot: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
      <Cara tipo={tipo} s={30} />
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 36, color: cor, WebkitTextStroke: '5px #000', paintOrder: 'stroke fill', minWidth: 40}}>{v}</div>
      <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 14, color: '#ccc', letterSpacing: 1}}>{rot}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 24, top: 22, ...PAINEL, padding: '10px 18px', display: 'flex', gap: 22, alignItems: 'center'}}>
      {item('humano', n.humano, '#fff', 'HUMANOS')}
      {item('mordido', n.mordido, '#3dff4a', 'MORDIDOS')}
      {item('zumbi', n.zumbi, '#8cff5a', 'ZUMBIS')}
      {n.salvo ? <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 20, color: '#7ad0ff'}}>{n.salvo} NA NAVE</div> : null}
    </div>
  );
};

// relógio: a lua desce e o sol nasce conforme o tique se aproxima do amanhecer; e o rádio de resgate
export const Relogio: React.FC<{T: number; t: Tique; meta: number; amanhecer: number}> = ({T, t, meta, amanhecer}) => {
  const k = Math.max(0, Math.min(1, T / amanhecer));
  const radio = Math.min(1, t.radio / meta);
  return (
    <div style={{position: 'absolute', right: 24, top: 22, ...PAINEL, padding: '10px 18px', width: 330}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <svg width={64} height={48} viewBox="0 0 64 48">
          <rect width={64} height={48} rx={8} fill={`rgb(${20 + 200 * k},${12 + 110 * k},${50 + 40 * k})`} />
          <circle cx={14 + 36 * k} cy={10 + 30 * k} r={9} fill="#fff3c8" opacity={1 - k} />
          <circle cx={50 - 36 * (1 - k)} cy={44 - 26 * k} r={10} fill="#ffcc33" opacity={k} />
        </svg>
        <div>
          <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 26, color: '#fff'}}>TIQUE {Math.max(1, Math.ceil(T))}<span style={{color: '#aaa', fontSize: 18}}> / {amanhecer}</span></div>
          <div style={{fontFamily: FONTE, fontWeight: 700, fontSize: 14, color: '#ffb04a', letterSpacing: 1}}>AMANHECER NO TIQUE {amanhecer}</div>
        </div>
      </div>
      <div style={{marginTop: 8, fontFamily: FONTE, fontWeight: 800, fontSize: 14, color: '#ccc', letterSpacing: 1}}>RÁDIO DE RESGATE {t.resgateEm != null ? '— A NAVE CHEGOU!' : ''}</div>
      <div style={{height: 16, borderRadius: 8, background: '#0008', border: '3px solid #000', overflow: 'hidden', marginTop: 4}}>
        <div style={{width: `${radio * 100}%`, height: '100%', background: t.resgateEm != null ? '#7ad0ff' : 'linear-gradient(90deg, #ff8a2a, #ffd04a)'}} />
      </div>
    </div>
  );
};

const Cabeca: React.FC<{cor: string; modelo: string; estado?: string}> = ({cor, modelo, estado}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6}}>
    <span style={{width: 26, height: 26, background: estado === 'zumbi' ? '#6fae4a' : corDe(cor), border: `3px solid ${estado === 'mordido' ? '#3dff4a' : '#000'}`, borderRadius: 13}} />
    <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 28, color: estado === 'zumbi' ? '#9dff6a' : '#fff'}}>{cor}{estado === 'zumbi' ? ' (zumbi)' : ''}</span>
    <span style={{fontFamily: FONTE, fontWeight: 600, fontSize: 20, color: '#bbb'}}>{modelo}</span>
  </div>
);

export const Fala: React.FC<{cor: string; modelo: string; texto: string; f: number; dur: number; sala?: string; estado?: string}> = ({cor, modelo, texto, f, dur, sala, estado}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 14, stiffness: 160}});
  const n = Math.floor(interpolate(f, [4, Math.max(8, Math.min(dur * 0.35, texto.length * 0.9))], [0, texto.length], cl));
  return (
    <div style={{position: 'absolute', left: 260, right: 260, bottom: 40, transform: `translateY(${(1 - e) * 300}px)`, opacity: e}}>
      <div style={{...PAINEL, padding: '16px 24px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Cabeca cor={cor} modelo={modelo} estado={estado} />
          <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 18, letterSpacing: 2, color: '#ff8a2a'}}>FALOU {sala ? `NA SALA: ${sala.toUpperCase()}` : ''}</span>
        </div>
        <div style={{fontFamily: FONTE, fontWeight: 700, fontSize: 36, color: '#fff', lineHeight: 1.25}}>{texto.slice(0, n)}</div>
      </div>
    </div>
  );
};

export const Pensamento: React.FC<{cor: string; modelo: string; texto: string; f: number; dur: number; estado?: string}> = ({cor, modelo, texto, f, dur, estado}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 14, stiffness: 160}});
  const n = Math.floor(interpolate(f, [4, Math.max(8, Math.min(dur * 0.35, texto.length * 0.9))], [0, texto.length], cl));
  return (
    <div style={{position: 'absolute', left: 260, right: 260, bottom: 40, transform: `translateY(${(1 - e) * 300}px)`, opacity: e}}>
      <div style={{...PAINEL, border: '4px dashed #b88cff', background: 'linear-gradient(180deg, #24123ae8, #120822e8)', padding: '16px 24px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Cabeca cor={cor} modelo={modelo} estado={estado} />
          <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 18, letterSpacing: 2, color: '#b88cff'}}>PENSAMENTO SECRETO</span>
        </div>
        <div style={{fontFamily: FONTE, fontWeight: 600, fontStyle: 'italic', fontSize: 34, color: '#e6dcff', lineHeight: 1.25}}>{texto.slice(0, n)}</div>
      </div>
    </div>
  );
};

export const Capitulo: React.FC<{titulo: string; sub?: string; f: number}> = ({titulo, sub, f}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 12}});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', opacity: interpolate(f, [60, 80], [1, 0], cl)}}>
      <div style={{...PAINEL, padding: '22px 60px', textAlign: 'center', transform: `scale(${0.6 + 0.4 * e}) rotate(${(1 - e) * -8}deg)`}}>
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 66, color: '#ff9a2a', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', letterSpacing: 2}}>{titulo.toUpperCase()}</div>
        {sub ? <div style={{fontFamily: FONTE, fontWeight: 700, fontSize: 30, color: '#e6dcff', marginTop: 4}}>{sub}</div> : null}
      </div>
    </div>
  );
};
