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

// ---------- painel de eventos ao vivo (kill feed): cartões com o que o log registrou nos últimos tiques ----------
const ICONE: Record<string, React.ReactNode> = {
  mordida: <path d="M4 6 L8 14 L12 6 L16 14 L20 6" stroke="#ff4a3a" strokeWidth={3} fill="none" strokeLinejoin="round" />,
  virou: <><circle cx={12} cy={11} r={8} fill="#6fae4a" stroke="#000" strokeWidth={2} /><circle cx={9} cy={10} r={1.6} fill="#f22" /><circle cx={15} cy={10} r={1.6} fill="#f22" /></>,
  taser: <path d="M13 2 L5 13 H11 L9 22 L19 9 H13 Z" fill="#7ae8ff" stroke="#000" strokeWidth={1.5} />,
  cura: <path d="M9 3 H15 V9 H21 V15 H15 V21 H9 V15 H3 V9 H9 Z" fill="#4aff8a" stroke="#000" strokeWidth={1.5} />,
  barricada: <><rect x={2} y={6} width={20} height={5} rx={1} fill="#a8743a" stroke="#000" strokeWidth={1.5} /><rect x={2} y={13} width={20} height={5} rx={1} fill="#a8743a" stroke="#000" strokeWidth={1.5} /></>,
  quebrou: <path d="M3 12 L9 9 L12 13 L16 8 L21 12" stroke="#ffb04a" strokeWidth={3} fill="none" />,
  imune: <circle cx={12} cy={12} r={8} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="4 3" />,
  uivo: <><path d="M6 8 Q12 4 18 8" stroke="#c9b8ff" strokeWidth={2.5} fill="none" /><path d="M4 13 Q12 7 20 13" stroke="#c9b8ff" strokeWidth={2.5} fill="none" /></>,
  nave: <path d="M12 2 Q18 8 16 18 H8 Q6 8 12 2 Z" fill="#d9dde6" stroke="#000" strokeWidth={1.5} />,
};
const NOME_SALA: Record<string, string> = {Lancamento: 'Lançamento', Comunicacoes: 'Comunicações', Vestiario: 'Vestiário', Descontaminacao: 'Descontaminação', Laboratorio: 'Laboratório', Escritorio: 'Escritório', Refeitorio: 'Refeitório', Deposito: 'Depósito'};
const sal = (s: unknown) => NOME_SALA[String(s)] ?? String(s ?? '');
function texto(e: {tipo: string; [k: string]: unknown}): [string, string] | null {
  switch (e.tipo) {
    case 'mordida': return ['mordida', `${e.zumbi} ${e.como === 'cuspe' ? 'cuspiu em' : 'mordeu'} ${e.alvo}`];
    case 'virou_zumbi': return ['virou', `${e.cor} virou zumbi ${String(e.classe ?? '').toLowerCase()}`];
    case 'atordoou': return ['taser', `${e.por} atordoou ${e.zumbi}${e.como === 'uv' ? ' (UV)' : ''}`];
    case 'cura': return ['cura', `${e.doutor} curou ${e.alvo}`];
    case 'barricada': return ['barricada', `${e.cor}: barricada em ${sal(e.sala)}`];
    case 'barricada_quebrou': return ['quebrou', `barricada de ${sal(e.sala)} caiu`];
    case 'abriu_barricada': return ['quebrou', `${e.cor} ABRIU a barricada`];
    case 'mordida_imune': return ['imune', `${e.alvo} levou mordida... e nada`];
    case 'uivo': return ['uivo', `${e.zumbi} uivou`];
    case 'resgate_chegou': return ['nave', 'A NAVE DE RESGATE CHEGOU'];
    case 'salvo': return ['nave', `${e.cor} entrou na nave`];
    default: return null;
  }
}
export const Feed: React.FC<{eventos: {tique: number; tipo: string; [k: string]: unknown}[]; T: number}> = ({eventos, T}) => {
  const n = Math.ceil(T);
  const itens = eventos.filter((e) => e.tique <= n && e.tique > n - 6 && texto(e)).slice(-5);
  return (
    <div style={{position: 'absolute', right: 24, top: 190, width: 360, display: 'flex', flexDirection: 'column', gap: 8}}>
      {itens.map((e, i) => {
        const [ic, tx] = texto(e)!;
        const idade = T - (e.tique - 0.85);
        const entra = Math.max(0, Math.min(1, idade * 3));
        if (idade < 0) return null;
        return (
          <div key={`${e.tique}_${i}_${tx}`} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', background: '#160b24dd', border: `3px solid ${ic === 'mordida' || ic === 'virou' ? '#6aff3a' : '#ff8a2a'}`, borderRadius: 12, transform: `translateX(${(1 - entra) * 400}px)`, opacity: Math.max(0.35, 1 - Math.max(0, n - e.tique) * 0.15)}}>
            <svg width={28} height={28} viewBox="0 0 24 24">{ICONE[ic]}</svg>
            <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 20, color: '#fff'}}>{tx}</span>
          </div>
        );
      })}
    </div>
  );
};
