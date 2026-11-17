// TRIBUNAL: peças do jogo e da edição (farol da paciência, cadeados, Registro, placa de depoimento, flâmula ALTO LÁ,
// bandeira OBJEÇÃO, arpão TOMA ESSA, contadores de gag, lacre "SÓ VOCÊ VÊ", desenho do piso, anel, carimbos). Tudo SVG.
import React from 'react';
import {interpolate} from 'remotion';
import {AMBAR, BANG, C, CHUMBO, cl, COR, Cadeado0, ease, FAROL_COR, hash, LACRE, LATAO, LUZ, MAD_C, MAD_E, MARINHO, MONO, NOITE, NOME, PERG, Pedra, POP, quique, rnd, ROD_NOME, rotuloDe, sombra, TINTA, VINHO, type Humor, type Papel} from './base';

// ---------- estado do farol a partir de passos [quadro, luzes] ----------
export type Passo = [number, number];
export const estado = (f: number, passos: Passo[]) => {
  let n = passos[0]?.[1] ?? 6, antes = n, t = 999;
  for (const [q, v] of passos.slice(1)) if (f >= q) { antes = n; n = v; t = f - q; }
  return {n, antes, t};
};

// ---------- farol da paciência: 6 lentes no topo ----------
export const FarolPac: React.FC<{rod: string; n: number; antes?: number; t?: number; s: number; f: number; aviso?: string; rot?: string; placa?: string; placaT?: number; risco?: number}> = ({rod, n, antes = n, t = 999, s, f, aviso, rot, placa, placaT = 999, risco = 0}) => {
  const luz = FAROL_COR[rod] ?? LUZ;
  const L = [[62, 62], [80, 58], [98, 62], [62, 88], [80, 92], [98, 88]];
  const ordem = [3, 4, 5, 0, 1, 2];
  const pisca = risco > 0 && Math.floor(f / 6) % 2 === 0;
  return (
    <div style={{position: 'relative', width: s, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <svg viewBox="0 0 160 260" width={s} height={s * 1.62} style={{overflow: 'visible'}}>
        {n > 0 ? <g opacity={0.5}><path d={`M80 75 L${80 + 240 * Math.cos(f / 19)} ${75 + 70 * Math.sin(f / 19) - 30} L${80 + 240 * Math.cos(f / 19 + 0.35)} ${75 + 70 * Math.sin(f / 19 + 0.35) + 30}Z`} fill={luz} opacity={0.35} /></g> : null}
        <g stroke="#111" strokeWidth={4} strokeLinejoin="round">
          <path d="M44 252 L60 112 H100 L116 252Z" fill={PERG} />
          {[0, 1, 2].map((k) => <path key={k} d={`M${52 - k * 1 + k * 0} ${222 - k * 46} L${54 + k * 2} ${204 - k * 46} H${106 - k * 2} L${108 + k * 1} ${222 - k * 46}Z`} fill={rod === 'S' ? '#2F6BD8' : rod === 'J' ? '#1E9E6A' : '#8a6d14'} />)}
          <rect x={40} y={104} width={80} height={10} rx={3} fill={LATAO} />
          <rect x={48} y={42} width={64} height={64} rx={6} fill="#141c2a" />
          <path d="M44 44 L80 14 L116 44Z" fill={MAD_E} /><circle cx={80} cy={12} r={6} fill={LATAO} />
          <rect x={66} y={232} width={28} height={20} rx={3} fill={MAD_C} />
        </g>
        {L.map(([x, y], i) => {
          const k = ordem.indexOf(i);
          const aceso = k < n, apagando = k >= n && k < antes, acende = k < n && k >= antes;
          const tt = apagando ? t - (antes - 1 - k) * 9 : acende ? t - (k - antes) * 9 : 999;
          const flash = apagando && tt >= 0 && tt < 8 ? 1 - tt / 8 : 0;
          const vivo = aceso && !(risco > 0 && k >= n - risco && !pisca);
          const sc = acende && tt >= 0 ? quique(tt, 0, 14) : 1;
          return (
            <g key={i}>
              {vivo ? <circle cx={x} cy={y} r={16 * sc} fill={luz} opacity={0.35 + 0.15 * Math.sin(f * 0.2 + i)} /> : null}
              <circle cx={x} cy={y} r={9 * (apagando && tt < 0 ? 1 : sc)} fill={vivo || (apagando && tt < 0) ? luz : CHUMBO} stroke="#111" strokeWidth={3} />
              {risco > 0 && k >= n - risco && k < n ? <circle cx={x} cy={y} r={13} fill="none" stroke="#FF5A3C" strokeWidth={3} opacity={pisca ? 1 : 0.2} /> : null}
              {flash > 0 ? <circle cx={x} cy={y} r={9 + (1 - flash) * 26} fill="none" stroke="#fff" strokeWidth={5 * flash} /> : null}
              {apagando && tt >= 0 && tt < 45 ? [0, 1, 2].map((p) => <circle key={p} cx={x + (p - 1) * 6 + Math.sin(tt / 5 + p) * 4} cy={y - tt * 0.9 - p * 7} r={4 + tt * 0.16} fill="#9aa1ab" opacity={0.7 * (1 - tt / 45)} />) : null}
              {!aceso && !(apagando && tt < 0) ? <path d={`M${x - 5} ${y - 4} l4 3 l-2 4 M${x + 4} ${y - 5} l-2 5`} stroke="#111" strokeWidth={1.6} fill="none" /> : null}
            </g>
          );
        })}
      </svg>
      <div style={{marginTop: -6, fontFamily: BANG, fontSize: s * 0.3, lineHeight: 1, letterSpacing: 2, color: '#fff', ...C(s * 0.05)}}>{n} DE 6</div>
      {rot ? <div style={{fontFamily: MONO, fontWeight: 700, fontSize: Math.max(18, s * 0.12), color: '#fff', background: '#000a', borderRadius: 6, padding: '0 8px', whiteSpace: 'nowrap'}}>{rot}</div> : null}
      {aviso ? <div style={{marginTop: 6, fontFamily: BANG, fontSize: Math.max(30, s * 0.2), letterSpacing: 2, color: '#fff', background: '#7a1a12', border: `4px solid ${LATAO}`, borderRadius: 10, padding: '0 12px', whiteSpace: 'nowrap', opacity: pisca ? 1 : 0.75}}>{aviso}</div> : null}
      {placa && placaT >= 0 && placaT < 150 ? <div style={{position: 'absolute', top: s * 1.62 + (rot ? 70 : 40), right: 0, transform: `scale(${quique(placaT, 0, 12) * interpolate(placaT, [140, 150], [1, 0], cl)})`, transformOrigin: '100% 0%'}}><PlacaJogo txt={placa} /></div> : null}
    </div>
  );
};

// mensagem do próprio jogo (sem voz): ardósia com borda de latão, JetBrains Mono
export const PlacaJogo: React.FC<{txt: string; fs?: number; style?: React.CSSProperties}> = ({txt, fs = 26, style}) => (
  <div style={{background: '#20262e', border: `4px solid ${LATAO}`, borderRadius: 10, boxShadow: sombra, padding: '6px 16px 8px', maxWidth: 640, ...style}}>
    <div style={{fontFamily: POP, fontWeight: 800, fontSize: fs * 0.62, letterSpacing: 2, color: LATAO}}>MENSAGEM DO JOGO</div>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: fs, lineHeight: 1.2, color: '#F1E6CF'}}>{txt}</div>
  </div>
);

// ---------- cadeado grande ----------
export const Cadeado: React.FC<{s: number; f: number; estado?: 'fechado' | 'faisca' | 'aberto'; t?: number; chaves?: string[]; chK?: number; intacto?: boolean}> = ({s, f, estado: e = 'fechado', t = 999, chaves, chK = 1, intacto}) => {
  const tremor = e === 'faisca' && t < 30 ? Math.sin(t * 2.2) * 6 * (1 - t / 30) : Math.sin(f * 0.07) * 1.5;
  const abre = e === 'aberto' ? ease(t, 0, 8) : 0, cai = e === 'aberto' ? Math.max(0, t - 10) : 0;
  return (
    <div style={{position: 'relative', width: s, height: s * 1.2}}>
      <svg viewBox="-60 -80 120 140" width={s} height={s * 1.4} style={{overflow: 'visible', position: 'absolute', left: 0, top: 0}}>
        <path d="M0 -80 V-46" stroke="#6b5a3a" strokeWidth={3} />
        <g transform={`translate(${tremor} ${cai * cai * 0.12}) rotate(${cai * 1.4})`} opacity={interpolate(cai, [30, 50], [1, 0], cl)}>
          <g transform="scale(3)"><Cadeado0 abre={abre} /></g>
        </g>
        {e === 'faisca' && t < 22 ? Array.from({length: 9}).map((_, i) => { const a = (i / 9) * Math.PI * 2 + rnd(i) * 0.5, r0 = 30 + t * 2.5, r1 = r0 + 14; return <path key={i} d={`M${Math.cos(a) * r0} ${Math.sin(a) * r0 + 10} L${Math.cos(a) * r1} ${Math.sin(a) * r1 + 10}`} stroke={i % 2 ? '#FFE29A' : '#fff'} strokeWidth={4} strokeLinecap="round" opacity={1 - t / 22} />; }) : null}
        {e === 'aberto' && t < 20 ? <circle r={20 + t * 4} fill="none" stroke={LUZ} strokeWidth={6 * (1 - t / 20)} /> : null}
      </svg>
      {intacto ? <div style={{position: 'absolute', left: s * 0.5, top: s * 1.05, transform: 'translateX(-50%) rotate(-4deg)', fontFamily: BANG, fontSize: Math.max(26, s * 0.2), letterSpacing: 1.5, color: '#fff', background: CHUMBO, border: `4px solid ${LATAO}`, borderRadius: 8, padding: '0 10px', whiteSpace: 'nowrap'}}>INTACTO</div> : null}
      {chaves ? <div style={{position: 'absolute', left: s * 0.62, top: s * 0.5, display: 'flex', flexDirection: 'column', gap: 8, opacity: chK, transform: `translateX(${(1 - chK) * 40}px)`}}>
        {chaves.map((k, i) => <div key={k} style={{display: 'flex', alignItems: 'center', gap: 6, transform: `rotate(${(i % 2 ? 4 : -3) + Math.sin(f * 0.08 + i) * 2}deg)`}}><div style={{width: 34, height: 3, background: '#7a6440'}} /><TagSo txt={k} fs={22} /></div>)}
      </div> : null}
    </div>
  );
};

// ---------- lacre de cera com o olho-farol + etiqueta "SÓ VOCÊ VÊ" ----------
export const Lacre: React.FC<{s: number; rot?: number}> = ({s, rot = 0}) => (
  <svg viewBox="-50 -50 100 100" width={s} height={s} style={{flexShrink: 0, transform: `rotate(${rot}deg)`}}>
    <path d={Array.from({length: 18}).map((_, i) => { const a = (i / 18) * Math.PI * 2, r = 44 + (i % 2 ? 4 : -2) + rnd(i) * 3; return `${i ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`; }).join(' ') + 'Z'} fill={LACRE} stroke="#4a140c" strokeWidth={3} />
    <circle r={31} fill="none" stroke="#c0503a" strokeWidth={3} />
    <path d="M-8 26 L-5 -6 H5 L8 26Z M-7 -6 V-16 H7 V-6" fill="#f0c8a0" stroke="#4a140c" strokeWidth={2.5} />
    <path d="M-22 -11 Q0 -30 22 -11 Q0 8 -22 -11Z" fill="#f7e0c2" stroke="#4a140c" strokeWidth={2.5} /><circle cy={-11} r={5} fill="#4a140c" />
  </svg>
);
export const TagSo: React.FC<{txt?: string; fs?: number; style?: React.CSSProperties}> = ({txt = 'SÓ VOCÊ VÊ', fs = 26, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: fs * 0.3, background: PERG, border: `3px solid ${AMBAR}`, borderRadius: 8, boxShadow: `0 0 18px ${LUZ}99, 5px 5px 0 #0007`, padding: `2px ${fs * 0.45}px 2px 4px`, fontFamily: POP, fontWeight: 800, fontSize: fs, lineHeight: 1.15, color: TINTA, whiteSpace: 'nowrap', ...style}}><Lacre s={fs * 1.4} />{txt}</div>
);

// ---------- chip "RODADA DA SAFIRA · DIA 1 · AÇÃO 1/10" ----------
export const Chip: React.FC<{rod: string; dia?: number | string; acao?: number | null; extra?: string; f: number; fs?: number}> = ({rod, dia, acao, extra, f, fs = 30}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontWeight: 700, fontSize: fs, lineHeight: 1.35, color: PERG, background: '#2a1a10ee', border: `4px solid ${LATAO}`, borderLeft: `20px solid ${rod === 'J' ? COR.Verde : COR.Azul}`, borderRadius: 10, padding: '0 16px 0 10px', boxShadow: '6px 6px 0 #0008', whiteSpace: 'nowrap', transform: `rotate(${-0.8 + Math.sin(f / 70) * 0.4}deg)`}}>
    {ROD_NOME[rod]}{dia != null ? ` · DIA ${dia}` : ''}{acao ? <> · AÇÃO <span key={acao} style={{color: LUZ, display: 'inline-block', transform: `scale(${1})`}}>{acao}/10</span></> : null}{extra ? ` · ${extra}` : ''}
  </div>
);

// ---------- o desenho do piso: âncora dentro de um círculo (sempre o mesmo SVG) ----------
export const ANCORA_D = 'M0 -34 V30 M-16 -20 H16 M-30 8 Q-28 34 0 36 Q28 34 30 8 M-30 8 l-7 8 M-30 8 l9 3 M30 8 l7 8 M30 8 l-9 3';
export const Piso: React.FC<{s: number; k?: number; cor?: string; circulo?: boolean; w?: number; style?: React.CSSProperties}> = ({s, k = 1, cor = '#2a1c10', circulo = true, w = 5, style}) => (
  <svg viewBox="-60 -60 120 120" width={s} height={s} style={{overflow: 'visible', ...style}}>
    <circle cx={0} cy={-38} r={5} fill="none" stroke={cor} strokeWidth={w} strokeDasharray="1 1" pathLength={1} strokeDashoffset={1 - Math.min(1, k * 2)} />
    <path d={ANCORA_D} fill="none" stroke={cor} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.min(1, k * 1.6)} />
    {circulo ? <circle r={50} fill="none" stroke={cor} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - interpolate(k, [0.5, 1], [0, 1], cl)} transform="rotate(-90)" /> : null}
  </svg>
);
// o anel do Rubi visto de frente: o aro dourado é o círculo, a âncora em relevo no meio
export const Anel: React.FC<{s: number; f: number}> = ({s, f}) => (
  <svg viewBox="-70 -70 140 140" width={s} height={s} style={{overflow: 'visible'}}>
    <circle r={52} fill="none" stroke="#6d5410" strokeWidth={20} />
    <circle r={52} fill="none" stroke={LATAO} strokeWidth={14} />
    <circle r={52} fill="none" stroke="#fff3b8" strokeWidth={3} strokeDasharray="30 300" strokeDashoffset={-f * 2} />
    <circle r={41} fill="#3b2a10" opacity={0.5} />
    <g transform="scale(0.95)"><path d={ANCORA_D} fill="none" stroke="#6d5410" strokeWidth={10} strokeLinecap="round" /><path d={ANCORA_D} fill="none" stroke={LATAO} strokeWidth={6} strokeLinecap="round" /><circle cx={0} cy={-38} r={5} fill="none" stroke={LATAO} strokeWidth={4} /></g>
  </svg>
);
export const Colar: React.FC<{s: number; f: number}> = ({s, f}) => (
  <svg viewBox="-70 -90 140 160" width={s} height={s * 1.14} style={{overflow: 'visible'}}>
    <path d="M-60 -90 Q-40 -40 0 -44 Q40 -40 60 -90" fill="none" stroke="#bfa77a" strokeWidth={4} strokeDasharray="6 4" />
    <g transform={`rotate(${Math.sin(f * 0.06) * 5} 0 -44)`}><circle cx={0} cy={-38} r={5} fill="none" stroke={LATAO} strokeWidth={4} /><path d={ANCORA_D} fill="none" stroke="#6d5410" strokeWidth={10} strokeLinecap="round" /><path d={ANCORA_D} fill="none" stroke={LATAO} strokeWidth={6} strokeLinecap="round" /></g>
  </svg>
);

// ---------- carimbos de cena (veredito, aceita, recusada) ----------
export const Carimbo: React.FC<{txt: string; tipo: 'condenada' | 'absolvida' | 'aceita' | 'recusada' | 'neutro'; t: number; fs?: number; rot?: number}> = ({txt, tipo, t, fs = 90, rot}) => {
  if (t < 0) return null;
  const r = rot ?? ((hash(txt) % 9) - 4) * 1.4;
  const bg = tipo === 'absolvida' ? PERG : tipo === 'neutro' ? '#2a1a10' : '#0000';
  const cor = tipo === 'absolvida' ? '#6d5410' : tipo === 'aceita' ? LATAO : tipo === 'neutro' ? PERG : '#4a5058';
  const borda = tipo === 'absolvida' || tipo === 'aceita' ? LATAO : '#4a5058';
  return (
    <div style={{position: 'relative', display: 'inline-block', transform: `rotate(${r}deg) scale(${interpolate(t, [0, 6], [2.6, 1], cl)})`, opacity: interpolate(t, [0, 3], [0, 1], cl)}}>
      {tipo === 'absolvida' ? <div style={{position: 'absolute', inset: -30, borderRadius: 40, background: `radial-gradient(${LUZ}aa, #0000 70%)`}} /> : null}
      <div style={{position: 'relative', fontFamily: BANG, fontSize: fs, lineHeight: 1.05, letterSpacing: 4, color: cor, background: bg, border: `${Math.max(6, fs / 12)}px solid ${borda}`, outline: tipo === 'condenada' ? '4px dashed #4a5058' : undefined, outlineOffset: 6, borderRadius: 14, padding: `0 ${fs * 0.3}px`, whiteSpace: 'nowrap', textShadow: tipo === 'aceita' ? `0 0 14px ${LUZ}` : undefined, ...(tipo === 'aceita' || tipo === 'neutro' ? C(3, '#000') : {}), WebkitMaskImage: 'repeating-linear-gradient(77deg, #000 0 9px, #000c 9px 11px, #000 11px 23px)'}}>
        {txt}
        {tipo === 'aceita' ? <div style={{position: 'absolute', top: 0, bottom: 0, width: 60, left: `${((t * 3) % 160) - 30}%`, background: `linear-gradient(90deg, #0000, ${LUZ}cc, #0000)`, mixBlendMode: 'screen'}} /> : null}
        {tipo === 'recusada' ? <div style={{position: 'absolute', left: -10, right: -10, top: '48%', height: fs / 10, background: '#4a5058', transform: 'rotate(-6deg)'}} /> : null}
      </div>
      {tipo === 'condenada' ? <svg width="100%" height={fs * 0.7} style={{position: 'absolute', left: 0, top: '96%'}}>{[0.18, 0.36, 0.61, 0.8].map((x, i) => <rect key={i} x={`${x * 100}%`} y={0} width={9} height={Math.min(fs * 0.6, t * (1.2 + rnd(i))) } rx={4} fill="#4a5058" />)}</svg> : null}
    </div>
  );
};

// ---------- retrato: pedra + plaquinha com nome, modelo e etiqueta do papel ----------
export const Retrato: React.FC<{cor: string; rod?: string | null; s: number; f: number; modelo?: string; rot?: string | null; humor?: Humor; fala?: boolean; olhar?: [number, number]; gesto?: number; maoBolso?: boolean; semAnel?: boolean; cadeados?: number; cabecaBaixa?: number; brilho?: number; silh?: boolean; busto?: boolean; papel?: Papel; nome?: boolean}> = ({cor, rod, s, f, modelo, rot, nome = true, ...p}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: s}}>
    <Pedra cor={cor} s={s} f={f} rod={rod} {...p} />
    {nome ? <div style={{marginTop: -s * 0.08, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, zIndex: 2}}>
      <div style={{fontFamily: POP, fontWeight: 800, fontSize: Math.max(26, s * 0.17), lineHeight: 1.05, color: '#fff', background: COR[cor], border: `4px solid ${TINTA}`, borderRadius: 10, padding: '0 14px', whiteSpace: 'nowrap', ...C(5)}}>{NOME[cor]}</div>
      {modelo ? <div style={{fontFamily: MONO, fontWeight: 700, fontSize: Math.max(18, s * 0.1), color: PERG, background: '#000b', borderRadius: 6, padding: '0 8px', whiteSpace: 'nowrap'}}>{modelo}</div> : null}
      {rot !== null ? <div style={{fontFamily: POP, fontWeight: 800, fontSize: Math.max(17, s * 0.085), color: TINTA, background: PERG, border: '3px solid #6b5a3a', padding: '0 8px', whiteSpace: 'nowrap', transform: 'rotate(-1.5deg)'}}>{rot ?? rotuloDe(cor, rod)}</div> : null}
    </div> : null}
  </div>
);

// ---------- ícones das provas ----------
export const IconeProva: React.FC<{id: string; s: number}> = ({id, s}) => {
  const k = id.startsWith('PF') ? 'PF' : id.startsWith('R') ? 'R' : id;
  const st = {stroke: '#111', strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  return (
    <svg viewBox="0 0 60 60" width={s} height={s} style={{flexShrink: 0, overflow: 'visible'}}>
      <g {...st}>
        {k === 'P1' ? <><rect x={12} y={6} width={36} height={48} rx={3} fill="#fff" /><path d="M18 16 h24 M18 24 h24 M18 32 h14" fill="none" /><circle cx={40} cy={42} r={7} fill="none" stroke="#7a1a12" /></> : null}
        {k === 'P2' ? <><rect x={20} y={16} width={20} height={38} rx={6} fill="#B5372E" /><path d="M24 16 V8 H36 L44 4 M30 8 V16" fill="none" /><path d="M23 30 q4 -5 8 0" fill="none" stroke="#fff" /></> : null}
        {k === 'P3' ? <><path d="M16 10 L26 6 L30 12 L34 6 L44 10 L52 52 H8Z" fill="#8a6c7a" /><path d="M30 12 V52" fill="none" /><circle cx={18} cy={34} r={3.5} fill="#7a1a12" stroke="none" /><path d="M38 40 l4 -4 l2 5Z M44 30 l3 -3 l1 4Z" fill="#cfe9ff" strokeWidth={1.5} /></> : null}
        {k === 'P4' ? <><rect x={12} y={8} width={36} height={46} rx={3} fill="#e8d9b5" /><rect x={22} y={4} width={16} height={8} rx={2} fill={LATAO} /><path d="M18 22 h24 M18 30 h24" fill="none" /><text x={30} y={48} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={12} fill="#111" stroke="none">22:35</text></> : null}
        {k === 'P5' ? <><path d="M6 10 H54 V40 H26 L14 52 V40 H6Z" fill="#fff" /><path d="M18 20 q-4 6 0 10 M26 20 q-4 6 0 10" fill="none" strokeWidth={4} /></> : null}
        {k === 'P6' ? <><rect x={4} y={4} width={52} height={52} rx={4} fill={MAD_C} /><g transform="translate(30 30) scale(0.42)"><circle r={50} fill="none" stroke="#2a1c10" strokeWidth={7} /><path d={ANCORA_D} fill="none" stroke="#2a1c10" strokeWidth={7} /></g></> : null}
        {k === 'P7' ? <><circle cx={30} cy={26} r={20} fill="#cfe9ff" /><circle cx={30} cy={26} r={12} fill="none" /><path d="M20 14 L30 26 L44 18 M30 26 L26 44" fill="none" strokeWidth={2} /><rect x={18} y={46} width={24} height={10} fill={MAD_E} /><rect x={25} y={48} width={10} height={6} fill="#111" /></> : null}
        {k === 'E1' ? <><path d="M10 50 L34 26" fill="none" strokeWidth={6} stroke="#888" /><path d="M10 50 L34 26" fill="none" strokeWidth={2} /><rect x={32} y={10} width={12} height={22} rx={4} fill={LATAO} transform="rotate(45 38 21)" /></> : null}
        {k === 'E2' ? <><rect x={6} y={10} width={48} height={32} rx={4} fill="#F2EAD3" /><path d="M30 42 V56" fill="none" strokeWidth={5} /><path d="M16 34 v-4 M22 34 v-8 M28 34 v-12 M34 34 v-16" fill="none" strokeWidth={4} /><path d="M14 16 L42 38" fill="none" stroke="#7a1a12" strokeWidth={4} /><text x={47} y={22} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={7} fill="#111" stroke="none">SEM</text><text x={47} y={30} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={7} fill="#111" stroke="none">SINAL</text></> : null}
        {k === 'E3' ? <><path d="M8 12 Q30 4 30 12 Q30 4 52 12 V50 Q30 42 30 50 Q30 42 8 50Z" fill="#7a3b22" /><circle cx={42} cy={40} r={11} fill="#fff" /><path d="M42 33 V40 L47 43" fill="none" /></> : null}
        {k === 'E4' ? <><rect x={8} y={14} width={44} height={34} rx={2} fill={PERG} /><path d="M8 14 L30 34 L52 14" fill="none" /><circle cx={30} cy={36} r={6} fill={LACRE} /></> : null}
        {k === 'E5' ? <><rect x={8} y={14} width={44} height={34} rx={4} fill="#EDE6D6" /><path d="M30 20 V42 M19 31 H41" fill="none" stroke={LATAO} strokeWidth={6} /><text x={30} y={58} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={11} fill="#111" stroke="none">22:22</text></> : null}
        {k === 'E6' ? <><path d="M10 6 H50 V30 Q44 34 46 40 Q38 38 36 46 Q28 42 24 52 Q18 46 10 50Z" fill={PERG} /><path d="M16 14 h28 M16 21 h22" fill="none" strokeWidth={2} /><path d="M50 30 Q44 34 46 40 Q38 38 36 46 Q28 42 24 52 Q18 46 10 50" fill="none" stroke="#3a2010" strokeWidth={5} /></> : null}
        {k === 'E7' ? <><rect x={6} y={8} width={48} height={44} fill="#e9e2cf" /><rect x={10} y={14} width={18} height={18} fill="#9a9080" /><circle cx={19} cy={21} r={4} fill="#5a5040" stroke="none" /><circle cx={24} cy={29} r={2.4} fill="none" stroke={LATAO} strokeWidth={2} /><path d="M32 16 h18 M32 22 h18 M32 28 h14 M10 38 h40 M10 44 h40" fill="none" strokeWidth={2} /></> : null}
        {k === 'E8' ? <><path d="M20 6 Q8 26 8 36 a12 12 0 0 0 24 0 Q32 26 20 6Z" fill="#9b1b24" /><text x={20} y={40} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={11} fill="#fff" stroke="none">O-</text><rect x={36} y={16} width={18} height={34} rx={4} fill="#22262e" /><rect x={39} y={21} width={12} height={20} fill="#8fd3ff" strokeWidth={1.5} /></> : null}
        {k === 'R' ? <><rect x={10} y={8} width={40} height={44} rx={3} fill={PERG} /><path d="M16 18 h28 M16 26 h28 M16 34 h18" fill="none" strokeWidth={2} /><circle cx={42} cy={44} r={8} fill={LACRE} /></> : null}
        {k === 'PF' ? <><rect x={8} y={6} width={44} height={48} rx={4} fill="#e9e2cf" /><circle cx={30} cy={24} r={10} fill="#8a7a66" /><path d="M14 50 Q30 32 46 50" fill="#8a7a66" /></> : null}
      </g>
    </svg>
  );
};

// ---------- ficha de prova ----------
export const Ficha: React.FC<{id: string; nome: string; w?: number; brilho?: boolean; tag?: string; tagSo?: boolean; f?: number; style?: React.CSSProperties; dim?: boolean}> = ({id, nome, w = 230, brilho, tag, tagSo, f = 0, style, dim}) => (
  <div style={{position: 'relative', width: w, height: w * 0.72, background: '#F7EFDC', border: `${Math.max(3, w / 55)}px solid ${brilho ? LUZ : LATAO}`, outline: `3px solid ${TINTA}`, borderRadius: 10, boxShadow: brilho ? `0 0 ${20 + 8 * Math.sin(f * 0.25)}px ${LUZ}, 6px 6px 0 #0008` : '6px 6px 0 #0008', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${w * 0.03}px ${w * 0.04}px`, opacity: dim ? 0.55 : 1, ...style}}>
    <div style={{position: 'absolute', left: -6, top: -12, fontFamily: MONO, fontWeight: 700, fontSize: Math.max(16, w * 0.1), color: PERG, background: TINTA, borderRadius: 6, padding: '0 6px'}}>{id}</div>
    <IconeProva id={id} s={w * 0.38} />
    <div style={{fontFamily: POP, fontWeight: 800, fontSize: Math.max(14, w * 0.075), lineHeight: 1.08, color: TINTA, textAlign: 'center'}}>{nome}</div>
    {tag ? <div style={{position: 'absolute', right: -14, bottom: -16, transform: 'rotate(-6deg)'}}>{tagSo ? <TagSo txt={tag} fs={Math.max(17, w * 0.08)} /> : <div style={{fontFamily: BANG, fontSize: Math.max(20, w * 0.1), letterSpacing: 1.5, color: '#fff', background: MARINHO, border: `3px solid ${LATAO}`, borderRadius: 6, padding: '0 8px', whiteSpace: 'nowrap'}}>{tag}</div>}</div> : null}
  </div>
);

// ---------- o Registro do Tribunal (caderno de couro com abas PROVAS e PERFIS) ----------
export type ItemReg = {id: string; nome: string; at?: number; brilho?: boolean; tag?: string; tagSo?: boolean; dim?: boolean};
export const Registro: React.FC<{f: number; itens: ItemReg[]; w?: number; cols?: number; foraDosAutos?: number; titulo?: string; folheia?: number}> = ({f, itens, w = 900, cols = 4, foraDosAutos, titulo = 'REGISTRO DO TRIBUNAL', folheia}) => {
  const fw = (w - 80) / cols - 18;
  const linhas = Math.ceil(Math.max(1, itens.length) / cols);
  const H = 110 + linhas * (fw * 0.72 + 30);
  const fl = folheia != null && f >= folheia && f < folheia + 40 ? (f - folheia) / 40 : -1;
  return (
    <div style={{position: 'relative', width: w, height: H}}>
      <div style={{position: 'absolute', inset: -16, background: 'linear-gradient(135deg, #5a2e1a, #3b1d10)', borderRadius: 22, border: '5px solid #1d0e06', boxShadow: '14px 14px 0 #0009'}} />
      {[[-16, -16], [w - 34, -16], [-16, H - 34], [w - 34, H - 34]].map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x, top: y, width: 50, height: 50, borderRadius: 8, background: `linear-gradient(135deg, ${LATAO}, #8a6d14)`, border: '3px solid #1d0e06', clipPath: i === 0 ? 'polygon(0 0,100% 0,0 100%)' : i === 1 ? 'polygon(0 0,100% 0,100% 100%)' : i === 2 ? 'polygon(0 0,0 100%,100% 100%)' : 'polygon(100% 0,100% 100%,0 100%)'}} />)}
      <div style={{position: 'absolute', inset: 0, background: PERG, borderRadius: 10, border: '3px solid #6b5a3a', backgroundImage: 'repeating-linear-gradient(0deg, #0000 0 38px, #6b5a3a22 38px 40px)'}} />
      <div style={{position: 'absolute', left: w / 2 - 3, top: 0, bottom: 0, width: 6, background: '#6b5a3a55'}} />
      {[['PROVAS', 30], ['PERFIS', 150]].map(([t, y]) => <div key={t as string} style={{position: 'absolute', right: -64, top: y as number, width: 60, height: 110, background: t === 'PROVAS' ? '#7a3b22' : '#2c4a5a', border: '3px solid #1d0e06', borderRadius: '0 10px 10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{transform: 'rotate(90deg)', fontFamily: POP, fontWeight: 800, fontSize: 20, color: PERG, letterSpacing: 2}}>{t}</div></div>)}
      {foraDosAutos != null && f >= foraDosAutos ? <div style={{position: 'absolute', right: -64, top: 270, width: 60, height: 140, border: '4px dashed #7a1a12', borderRadius: '0 10px 10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ease(f, foraDosAutos, foraDosAutos + 10)}}><div style={{transform: 'rotate(90deg)', fontFamily: POP, fontWeight: 800, fontSize: 18, color: '#7a1a12', letterSpacing: 1, whiteSpace: 'nowrap'}}>CONVERSAS?</div></div> : null}
      <div style={{position: 'absolute', left: 30, top: 14, fontFamily: POP, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: '#5a2e1a'}}>{titulo}</div>
      {itens.map((it, i) => {
        const r = Math.floor(i / cols), col = i % cols, x = 40 + col * (fw + 18), y = 80 + r * (fw * 0.72 + 30);
        const a = it.at ?? -99, k = f < a ? 0 : ease(f, a, a + 16);
        if (f < a) return null;
        return <div key={it.id + i} style={{position: 'absolute', left: x + (1 - k) * 700, top: y - (1 - k) * 500, transform: `rotate(${(1 - k) * 30 + (rnd(i) - 0.5) * 3}deg) scale(${1 + (1 - k) * 0.6})`, zIndex: it.brilho ? 3 : 1}}><Ficha id={it.id} nome={it.nome} w={fw} brilho={it.brilho} tag={it.tag} tagSo={it.tagSo} f={f} dim={it.dim} /></div>;
      })}
      {fl >= 0 ? <div style={{position: 'absolute', left: w / 2, top: 0, width: w / 2, height: H, background: PERG, border: '3px solid #6b5a3a', transformOrigin: '0 50%', transform: `perspective(1600px) rotateY(${-fl * 180}deg)`, zIndex: 9}} /> : null}
    </div>
  );
};

// ---------- placa de depoimento: tábua com as declarações numeradas ----------
export const Placa: React.FC<{cor: string; titulo?: string; decl: string[]; lit?: number | null; f: number; w?: number; max?: number; reescreve?: {i: number; txt: string; at: number} | null; carimbos?: {i: number; txt: string; at: number; tipo?: 'chumbo' | 'latao'}[]; fs?: number; entra?: number}> = ({cor, titulo, decl, lit, f, w = 860, max = 150, reescreve, carimbos = [], fs = 23, entra = -99}) => (
  <div style={{position: 'relative', width: w, background: `repeating-linear-gradient(2deg, ${MAD_E} 0 46px, #4e311e 46px 49px)`, border: `6px solid ${TINTA}`, borderRadius: 16, boxShadow: sombra, padding: '12px 22px 18px', boxSizing: 'border-box'}}>
    {[[8, 8], [w - 26, 8]].map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x, top: y, width: 14, height: 14, borderRadius: 7, background: LATAO, border: '2px solid #111'}} />)}
    <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8}}><div style={{width: 18, height: 18, borderRadius: 9, background: COR[cor], border: '3px solid #111'}} /><div style={{fontFamily: POP, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: PERG}}>{titulo ?? `DEPOIMENTO · ${NOME[cor].toUpperCase()}`}</div></div>
    {decl.map((d, i) => {
      const aceso = lit === i, re = reescreve && reescreve.i === i && f >= reescreve.at ? f - reescreve.at : -1;
      const ap = ease(f, entra + i * 8, entra + i * 8 + 10);
      const txt = aceso || d.length <= max ? d : d.slice(0, max).replace(/\s+\S*$/, '') + '…';
      const cb = carimbos.filter((c) => c.i === i && f >= c.at);
      return (
        <div key={i} style={{position: 'relative', display: 'flex', gap: 10, alignItems: 'flex-start', margin: '6px 0', padding: '6px 10px', borderRadius: 8, background: aceso ? LUZ : '#F1E6CFe8', boxShadow: aceso ? `0 0 ${24 + 6 * Math.sin(f * 0.3)}px ${LUZ}` : 'none', transform: `translateX(${(1 - ap) * -60}px) scale(${aceso ? 1.015 : 1})`, opacity: ap, border: aceso ? `3px solid ${TINTA}` : '3px solid #0000'}}>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: fs + 2, color: TINTA, flexShrink: 0}}>({i + 1})</div>
          <div style={{position: 'relative', fontFamily: MONO, fontWeight: aceso ? 700 : 500, fontSize: aceso ? fs + 1 : fs - 2, lineHeight: 1.25, color: TINTA}}>
            <span style={{opacity: re >= 0 ? 0.5 : 1}}>{txt}</span>
            {re >= 0 ? <div style={{position: 'absolute', left: 0, top: '0.6em', height: 5, width: `${ease(re, 0, 12) * 100}%`, background: VINHO, transform: 'rotate(-0.6deg)'}} /> : null}
            {re >= 0 ? <div style={{fontFamily: POP, fontWeight: 600, fontStyle: 'italic', fontSize: fs + 2, color: MARINHO, marginTop: 4}}>{reescreve!.txt.split(' ').map((p, k, arr) => <span key={k} style={{opacity: re > 12 + (k / arr.length) * 40 ? 1 : 0}}>{p} </span>)}</div> : null}
          </div>
          {cb.map((c, k) => <div key={k} style={{position: 'absolute', right: -18 - k * 6, bottom: -14, transform: `rotate(${-5 + k * 3}deg) scale(${interpolate(f - c.at, [0, 6], [2.2, 1], cl)})`, fontFamily: BANG, fontSize: 26, letterSpacing: 1.5, color: c.tipo === 'latao' ? TINTA : '#fff', background: c.tipo === 'latao' ? LATAO : CHUMBO, border: `3px solid ${TINTA}`, borderRadius: 6, padding: '0 8px', whiteSpace: 'nowrap', zIndex: 4}}>{c.txt}</div>)}
        </div>
      );
    })}
  </div>
);

// ---------- ALTO LÁ! (flâmula náutica dourada que chicoteia com o vento) ----------
export const Flamula: React.FC<{t: number; s?: number; n?: number}> = ({t, s = 1, n}) => {
  if (t < 0) return null;
  const k = ease(t, 0, 7), vento = Math.sin(t * 0.9) * 14 * Math.exp(-t / 14) + Math.sin(t * 0.3) * 3;
  return (
    <div style={{position: 'relative', width: 640 * s, height: 300 * s, transform: `translateX(${(1 - k) * -900}px) rotate(${-6 + vento * 0.3}deg)`}}>
      <svg viewBox="0 0 640 300" width={640 * s} height={300 * s} style={{overflow: 'visible'}}>
        <rect x={10} y={10} width={16} height={290} rx={6} fill={MAD_E} stroke="#111" strokeWidth={5} /><circle cx={18} cy={10} r={12} fill={LATAO} stroke="#111" strokeWidth={4} />
        <path d={`M26 30 Q200 ${30 + vento} 620 ${130 + vento * 1.5} Q200 ${230 - vento} 26 230Z`} fill="#E5B53A" stroke="#111" strokeWidth={6} strokeLinejoin="round" />
        <path d={`M26 110 Q200 ${118 + vento * 0.6} 420 ${134 + vento} Q200 ${150 - vento * 0.6} 26 150Z`} fill={MARINHO} />
      </svg>
      <div style={{position: 'absolute', left: 50 * s, top: 70 * s, fontFamily: BANG, fontSize: 112 * s, lineHeight: 1, letterSpacing: 4, color: '#fff', ...C(11 * s), transform: `rotate(${vento * 0.25}deg) skewX(${-vento * 0.4}deg)`}}>ALTO LÁ!</div>
      {n ? <div style={{position: 'absolute', left: 430 * s, top: 190 * s, fontFamily: BANG, fontSize: 80 * s, color: LUZ, ...C(9 * s), transform: `scale(${interpolate(t, [2, 8], [2.2, 1], cl)})`}}>×{n}</div> : null}
    </div>
  );
};

// ---------- OBJEÇÃO! (bandeira quadrada de latão e vinho, a ficha pregada nela) ----------
export const Bandeira: React.FC<{t: number; ficha?: {id: string; nome: string}; promotor?: boolean; s?: number; txt?: string}> = ({t, ficha, promotor, s = 1, txt = 'OBJEÇÃO!'}) => {
  if (t < 0) return null;
  const k = ease(t, 0, 8), b = quique(t, 0, 16);
  const c1 = promotor ? '#E8871E' : VINHO, c2 = promotor ? '#7a3c08' : LATAO;
  return (
    <div style={{position: 'relative', width: 700 * s, height: 460 * s, transform: `translateX(${(1 - k) * -1100}px) rotate(${(1 - b) * -12 - 3}deg)`, transformOrigin: '6% 100%'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 22 * s, height: 460 * s, background: MAD_E, border: '5px solid #111', borderRadius: 8}} />
      <div style={{position: 'absolute', left: 22 * s, top: 14 * s, width: 640 * s, height: 340 * s, background: `linear-gradient(135deg, ${c1} 0 58%, ${c2} 58% 100%)`, border: '7px solid #111', boxShadow: sombra, transform: `skewY(${Math.sin(t * 0.4) * 1.5}deg)`}}>
        {[[14, 14], [596, 14], [14, 296], [596, 296]].map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x * s, top: y * s, width: 18 * s, height: 18 * s, borderRadius: 9, background: '#ddd', border: '3px solid #111'}} />)}
        <div style={{position: 'absolute', left: 30 * s, top: 24 * s, fontFamily: BANG, fontSize: 132 * s, lineHeight: 1, letterSpacing: 4, color: '#fff', ...C(12 * s)}}>{txt}</div>
        {promotor ? <div style={{position: 'absolute', left: 34 * s, top: 170 * s, fontFamily: POP, fontWeight: 800, fontSize: 30 * s, color: '#fff', ...C(5)}}>DO PROMOTOR</div> : null}
      </div>
      {ficha ? <div style={{position: 'absolute', left: 360 * s, top: 180 * s, transform: `rotate(6deg) scale(${quique(t, 6, 12)})`}}><Ficha id={ficha.id} nome={ficha.nome} w={250 * s} brilho f={t} /><div style={{position: 'absolute', left: 116 * s, top: -8, width: 18, height: 18, borderRadius: 9, background: '#999', border: '3px solid #111'}} /></div> : null}
    </div>
  );
};

// ---------- TOMA ESSA! (arpão de latão que atravessa a tela e crava) ----------
export const Arpao: React.FC<{t: number; alvoX: number; y: number; lento?: boolean; item?: {id: string; nome: string}}> = ({t, alvoX, y, lento, item}) => {
  if (t < 0) return null;
  const dv = lento ? 26 : 10, k = ease(t, 0, dv), x = -400 + (alvoX + 400) * k, crava = t >= dv;
  const tc = t - dv, treme = crava ? Math.sin(tc * 2.4) * 5 * Math.exp(-tc / 8) : 0, des = ease(tc, 2, 16);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, pointerEvents: 'none'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <path d={`M${x - 560} ${y + 40} Q${x - 400} ${y + 70} ${x - 300} ${y}`} fill="none" stroke="#7a6440" strokeWidth={6} strokeDasharray="14 8" />
        <g transform={`translate(${x} ${y}) rotate(${treme})`}>
          <rect x={-320} y={-9} width={300} height={18} rx={6} fill={LATAO} stroke="#111" strokeWidth={5} />
          <path d="M-20 -22 L60 0 L-20 22 L-4 0Z" fill="#d8dde2" stroke="#111" strokeWidth={5} strokeLinejoin="round" />
          <path d="M-6 -12 L-40 -34 M-6 12 L-40 34" stroke="#111" strokeWidth={7} strokeLinecap="round" />
          <path d="M-6 -12 L-40 -34 M-6 12 L-40 34" stroke="#d8dde2" strokeWidth={3} strokeLinecap="round" />
        </g>
        {crava ? Array.from({length: 7}).map((_, i) => { const a = -Math.PI / 2 + (i - 3) * 0.4, r = 30 + tc * 4; return tc < 14 ? <path key={i} d={`M${x + 50 + Math.cos(a) * r} ${y + Math.sin(a) * r} l${Math.cos(a) * 18} ${Math.sin(a) * 18}`} stroke={MAD_C} strokeWidth={6} strokeLinecap="round" opacity={1 - tc / 14} /> : null; }) : null}
      </svg>
      <div style={{position: 'absolute', left: x - 300, top: y + 10, width: 280, transformOrigin: '50% 0%', transform: `scaleY(${crava ? des : 0.08}) rotate(${treme * 0.3}deg)`}}>
        <div style={{background: MARINHO, border: `6px solid ${LATAO}`, outline: '4px solid #111', padding: '10px 14px 26px', clipPath: 'polygon(0 0,100% 0,100% 100%,50% 86%,0 100%)'}}>
          <div style={{fontFamily: BANG, fontSize: 70, lineHeight: 1, letterSpacing: 3, color: '#fff', textAlign: 'center', ...C(7)}}>TOMA ESSA!</div>
        </div>
      </div>
      {item ? <div style={{position: 'absolute', left: x - 170, top: y - 150, transform: `rotate(-8deg) scale(${0.9})`}}><Ficha id={item.id} nome={item.nome} w={200} brilho f={t} /></div> : null}
    </div>
  );
};

// ---------- VERSÕES DO RUBI (painel de latão, três colunas) ----------
export type Marca = {col: number; txt: string; rod: string; at: number; ref?: string};
export const Versoes: React.FC<{f: number; marcas: Marca[]; w?: number; total?: boolean; fs?: number}> = ({f, marcas, w = 820, total, fs = 21}) => {
  const COLS = ['TERRAÇO', 'MÃO', 'CÍRCULO'];
  const vis = marcas.filter((m) => f >= m.at);
  return (
    <div style={{width: w, background: `linear-gradient(160deg, #e2c35a, ${LATAO} 40%, #8a6d14)`, border: `6px solid ${TINTA}`, borderRadius: 14, boxShadow: sombra, padding: '8px 14px 12px', boxSizing: 'border-box'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: BANG, fontSize: 46, letterSpacing: 2, color: TINTA}}>VERSÕES DO RUBI <span style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, background: TINTA, color: LATAO, borderRadius: 6, padding: '0 8px'}}>{vis.length}</span>{total ? <span style={{fontFamily: POP, fontWeight: 800, fontSize: 18, background: PERG, border: '2px solid #111', borderRadius: 4, padding: '0 6px', marginLeft: 'auto'}}>CÁLCULO NOSSO</span> : null}</div>
      <div style={{display: 'flex', gap: 10}}>
        {COLS.map((c, ci) => (
          <div key={c} style={{flex: 1, background: '#00000022', borderRadius: 8, padding: '4px 8px 8px', minHeight: 60}}>
            <div style={{fontFamily: POP, fontWeight: 800, fontSize: 24, color: TINTA, borderBottom: `3px solid ${TINTA}`, marginBottom: 4}}>{c} <span style={{fontFamily: MONO}}>×{vis.filter((m) => m.col === ci).length}</span></div>
            {vis.filter((m) => m.col === ci).map((m, i) => { const t = f - m.at; return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 6, margin: '3px 0', transform: `scale(${t < 40 ? interpolate(t, [0, 8], [1.6, 1], cl) : 1})`, transformOrigin: '0 50%', background: t < 60 ? `${LUZ}${Math.round(interpolate(t, [0, 60], [255, 0], cl)).toString(16).padStart(2, '0')}` : undefined, borderRadius: 4}}>
                <svg width={22} height={26}><path d={`M4 24 L18 2`} stroke={VINHO} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease(t, 0, 8)} /></svg>
                <div style={{fontFamily: POP, fontWeight: 600, fontSize: fs, lineHeight: 1.1, color: TINTA}}>{m.txt}</div>
                <div style={{marginLeft: 'auto', fontFamily: MONO, fontWeight: 700, fontSize: 16, color: '#fff', background: m.rod === 'J' ? COR.Verde : COR.Azul, borderRadius: 4, padding: '0 5px'}}>{m.rod}</div>
              </div>
            ); })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- CORAÇÃO EM PEDAÇOS (coração de vidro do promotor) ----------
const RACHA = ['M60 30 L52 52 L64 66', 'M88 40 L78 58 L90 72 L82 92', 'M40 56 L58 70 L48 88', 'M70 70 L96 64 L104 50', 'M60 96 L74 84 L72 70', 'M30 44 L44 50 L40 66'];
export const Coracao: React.FC<{n: number; t?: number; s: number; f: number; rot?: boolean}> = ({n, t = 999, s, f, rot = true}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${Math.sin(f * 0.07) * 6}px) rotate(${t < 20 ? Math.sin(t * 2) * 6 * (1 - t / 20) : 0}deg)`}}>
    <svg viewBox="0 0 130 120" width={s} height={s * 0.92} style={{overflow: 'visible'}}>
      <path d="M65 112 C20 80 4 56 10 34 C16 12 44 6 65 30 C86 6 114 12 120 34 C126 56 110 80 65 112Z" fill="#cfe9ffaa" stroke="#111" strokeWidth={5} />
      <path d="M30 30 Q38 18 52 22" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
      {RACHA.slice(0, Math.min(6, n)).map((d, i) => <path key={i} d={d} fill="none" stroke="#111" strokeWidth={3.5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={i === n - 1 ? 1 - ease(t, 0, 8) : 0} />)}
      {n >= 5 ? [0, 1, 2].map((i) => <path key={i} d="M0 0 l8 -4 l3 9Z" fill="#cfe9ff" stroke="#111" strokeWidth={2} transform={`translate(${50 + i * 14} ${104 + Math.min(40, Math.max(0, t - 6) * (1 + i * 0.3))}) rotate(${t * 6 * (i + 1)})`} opacity={interpolate(t, [10, 40], [1, 0], cl)} />) : null}
    </svg>
    {rot ? <div style={{fontFamily: BANG, fontSize: s * 0.22, letterSpacing: 1.5, color: '#fff', background: '#7a3c08', border: `4px solid ${LATAO}`, borderRadius: 8, padding: '0 10px', whiteSpace: 'nowrap', transform: `scale(${t < 12 ? interpolate(t, [0, 8], [1.6, 1], cl) : 1})`}}>CORAÇÃO EM PEDAÇOS ×{n}</div> : null}
  </div>
);

// ---------- SÓ A TEMPESTADE ×N (âncora de ferro pendurada) ----------
export const AncoraConta: React.FC<{n: number; t?: number; s: number; f: number}> = ({n, t = 999, s, f}) => {
  const bal = Math.sin(f * 0.08) * 6 + (t < 40 ? Math.sin(t * 0.5) * 22 * (1 - t / 40) : 0);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <svg viewBox="-60 0 120 170" width={s} height={s * 1.4} style={{overflow: 'visible'}}>
        <g transform={`rotate(${bal} 0 0)`}>
          {Array.from({length: 6}).map((_, i) => <ellipse key={i} cx={0} cy={8 + i * 12} rx={i % 2 ? 3 : 6} ry={7} fill="none" stroke="#555" strokeWidth={4} />)}
          <g transform="translate(0 118) scale(1.2)"><circle cx={0} cy={-38} r={6} fill="none" stroke="#2b2f36" strokeWidth={6} /><path d={ANCORA_D} fill="none" stroke="#111" strokeWidth={11} strokeLinecap="round" /><path d={ANCORA_D} fill="none" stroke="#5c636e" strokeWidth={6} strokeLinecap="round" /></g>
        </g>
      </svg>
      <div style={{fontFamily: BANG, fontSize: s * 0.3, letterSpacing: 1.5, color: '#fff', background: '#2b2f36', border: `4px solid ${LATAO}`, borderRadius: 8, padding: '0 10px', whiteSpace: 'nowrap', transform: `scale(${t < 12 ? interpolate(t, [0, 8], [1.7, 1], cl) : 1})`}}>SÓ A TEMPESTADE ×{n}</div>
    </div>
  );
};

// ---------- cartão "ESTREIA: ..." (tábua pendurada por cordas) ----------
export const Estreia: React.FC<{titulo: string; sub?: string; t: number; dur: number}> = ({titulo, sub, t, dur}) => {
  if (t < 0 || t > dur) return null;
  const k = quique(t, 0, 18), sai = ease(t, dur - 10, dur);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - k) * -700 - sai * 900}px) rotate(${Math.sin(t * 0.12) * 1.2}deg)`, transformOrigin: '50% 0%', zIndex: 40}}>
      <svg width={900} height={170} style={{position: 'absolute', top: 0}}><path d="M200 0 L260 170 M700 0 L640 170" stroke="#7a6440" strokeWidth={6} /></svg>
      <div style={{marginTop: 160, background: `repeating-linear-gradient(1deg, ${MAD_C} 0 34px, #7b4e2e 34px 37px)`, border: `7px solid ${TINTA}`, borderRadius: 18, boxShadow: sombra, padding: '14px 46px 20px', textAlign: 'center', maxWidth: 1500}}>
        <div style={{display: 'inline-block', fontFamily: POP, fontWeight: 800, fontSize: 34, letterSpacing: 6, color: TINTA, background: LATAO, border: '4px solid #111', borderRadius: 8, padding: '0 18px'}}>ESTREIA</div>
        <div style={{fontFamily: BANG, fontSize: titulo.length > 22 ? 92 : 120, lineHeight: 1.02, letterSpacing: 3, color: '#fff', ...C(10)}}>{titulo}</div>
        {sub ? <div style={{fontFamily: POP, fontWeight: 800, fontSize: 40, lineHeight: 1.15, color: TINTA, background: PERG, border: '4px solid #111', borderRadius: 8, padding: '2px 18px', display: 'inline-block'}}>{sub}</div> : null}
      </div>
    </div>
  );
};

// número gigante na tela
export const Numero: React.FC<{txt: string; t: number; fs?: number; cor?: string; sub?: string}> = ({txt, t, fs = 260, cor = '#fff', sub}) => t < 0 ? null : (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${interpolate(t, [0, 7], [2.2, 1], cl)}) rotate(-2deg)`, opacity: interpolate(t, [0, 3], [0, 1], cl)}}>
    <div style={{fontFamily: BANG, fontSize: fs, lineHeight: 0.95, letterSpacing: 6, color: cor, ...C(fs / 18), filter: 'drop-shadow(10px 10px 0 #000a)', whiteSpace: 'nowrap'}}>{txt}</div>
    {sub ? <div style={{fontFamily: POP, fontWeight: 800, fontSize: fs * 0.16, color: TINTA, background: PERG, border: '4px solid #111', borderRadius: 8, padding: '0 16px', whiteSpace: 'nowrap'}}>{sub}</div> : null}
  </div>
);

// bolinhas de ações do dia (10)
export const Acoes: React.FC<{f: number; n?: number; marcadas?: {i: number; at: number; cor: string}[]; rot?: string; s?: number}> = ({f, n = 10, marcadas = [], rot, s = 46}) => (
  <div style={{display: 'inline-flex', flexDirection: 'column', gap: 6, background: '#2a1a10ee', border: `4px solid ${LATAO}`, borderRadius: 12, padding: '8px 14px', boxShadow: sombra}}>
    <div style={{display: 'flex', gap: 8}}>{Array.from({length: n}).map((_, i) => { const m = marcadas.find((x) => x.i === i && f >= x.at); const t = m ? f - m.at : -1; return <div key={i} style={{width: s, height: s, borderRadius: s / 2, border: '4px solid #111', background: m ? COR[m.cor] ?? m.cor : PERG, transform: `scale(${t >= 0 && t < 12 ? interpolate(t, [0, 8], [1.6, 1], cl) : 1})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: s * 0.45, color: m ? '#fff' : TINTA}}>{i + 1}</div>; })}</div>
    {rot ? <div style={{fontFamily: POP, fontWeight: 800, fontSize: 24, color: PERG}}>{rot}</div> : null}
  </div>
);

export const ceu = NOITE;
