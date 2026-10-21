// Among Us 4: animações de morte, do Glutão, do Canibal e dos dutos (desenho próprio, no estilo cartoon do jogo).
// Tudo em px de mundo, desenhado dentro do Mundo (amongus3/Jogo.tsx) quando a cena tem skins (mapa v5).
//  - morte (facada): golpe em arco + respingos, a vítima cai e o corpo quica;  - xerife: clarão do cano e o traço da bala;
//  - bomba: bola de fogo, onda de choque, destroços e fumaça (corpos tostados);  - fogo do Piromante: chamas em cada
//    encharcado;  - casal: coração partido;  - Glutão: uma bocarra fecha em cima da vítima e engole (não sobra corpo);
//  - Canibal: mordidas no corpo até sobrar só o osso;  - duto: a tampa abre, quem entra afunda e quem sai pula.
import React from 'react';
import {interpolate} from 'remotion';
import {FONT} from '../theme';
import {COR} from '../amongus/Crewmate';
import type {EvQ, Sim} from '../amongus3/sim';

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
// pseudoaleatório fixo (mesmo desenho em todo render)
const h = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const corDe = (c: string) => (COR as Record<string, {body: string}>)[c]?.body ?? '#c51111';

export const DUR_EFEITO4 = 70;

// `dy`: sobe mais (para não encavalar com outro texto no mesmo lugar)
const Onomatopeia: React.FC<{txt: string; cor: string; k: number; tam?: number; dy?: number}> = ({txt, cor, k, tam = 44, dy = 0}) => (
  <div style={{position: 'absolute', left: '50%', top: -150 - dy - 40 * Math.min(1, k * 2), transform: `translateX(-50%) rotate(-6deg) scale(${interpolate(k, [0, 0.08, 0.16], [0.3, 1.25, 1], cl)})`, whiteSpace: 'nowrap', fontFamily: FONT.display, fontWeight: 900, fontSize: tam, color: cor, WebkitTextStroke: '2px #000', textShadow: '0 4px 0 #000', opacity: interpolate(k, [0, 0.05, 0.75, 1], [0, 1, 1, 0], cl)}}>{txt}</div>
);

// respingos (sangue no estilo do jogo: a "gosma" é da cor do osso/vermelho escuro)
const Respingos: React.FC<{k: number; n?: number; cor?: string; raio?: number; seed?: number}> = ({k, n = 9, cor = '#b8001f', raio = 90, seed = 1}) => (
  <>
    {Array.from({length: n}, (_, i) => {
      const a = h(i, seed) * Math.PI * 2;
      const r = raio * (0.5 + h(i, seed + 1) * 0.7) * Math.min(1, k * 4);
      const g = 60 * k * k; // gravidade
      const t = 8 + h(i, seed + 2) * 12;
      return <div key={i} style={{position: 'absolute', left: Math.cos(a) * r - t / 2, top: Math.sin(a) * r * 0.7 + g - t / 2, width: t, height: t, borderRadius: '50%', background: cor, border: '2px solid #000', opacity: interpolate(k, [0.5, 1], [1, 0], cl)}} />;
    })}
  </>
);

const Fumaca: React.FC<{k: number; n?: number; raio?: number; seed?: number}> = ({k, n = 7, raio = 120, seed = 3}) => (
  <>
    {Array.from({length: n}, (_, i) => {
      const a = h(i, seed) * Math.PI * 2;
      const r = raio * (0.3 + h(i, seed + 1) * 0.7) * Math.min(1, k * 2);
      const t = (60 + h(i, seed + 2) * 50) * (0.6 + k);
      return <div key={i} style={{position: 'absolute', left: Math.cos(a) * r - t / 2, top: Math.sin(a) * r * 0.6 - t / 2 - 90 * k, width: t, height: t, borderRadius: '50%', background: '#3b3b44', border: '3px solid #1a1a20', opacity: interpolate(k, [0.15, 0.4, 1], [0, 0.85, 0], cl)}} />;
    })}
  </>
);

const Chamas: React.FC<{f: number; k: number; tam?: number}> = ({f, k, tam = 1}) => (
  <div style={{position: 'absolute', left: 0, top: 0, opacity: interpolate(k, [0, 0.06, 0.8, 1], [0, 1, 1, 0], cl)}}>
    {[0, 1, 2, 3, 4].map((i) => {
      const x = (-44 + i * 22) * tam;
      const alt = (70 + 30 * Math.sin(f / 3 + i * 1.7)) * tam;
      return (
        <svg key={i} width={50 * tam} height={alt + 10} style={{position: 'absolute', left: x - 25 * tam, top: -alt - 30, overflow: 'visible'}} viewBox={`0 0 50 ${alt + 10}`}>
          <path d={`M25 0 C 40 ${alt * 0.4} 50 ${alt * 0.7} 25 ${alt} C 0 ${alt * 0.7} 10 ${alt * 0.4} 25 0 Z`} fill="#ff6a00" stroke="#000" strokeWidth={3} />
          <path d={`M25 ${alt * 0.35} C 33 ${alt * 0.6} 36 ${alt * 0.8} 25 ${alt} C 14 ${alt * 0.8} 17 ${alt * 0.6} 25 ${alt * 0.35} Z`} fill="#ffd21f" />
        </svg>
      );
    })}
  </div>
);

// a bocarra do Glutão: duas mandíbulas com dentes que abrem e fecham em cima da vítima
export const Bocarra: React.FC<{k: number; cor: string}> = ({k, cor}) => {
  // abre (0-0.3), fecha (0.3-0.45), mastiga duas vezes (0.45-0.9), some
  const abre = k < 0.3 ? interpolate(k, [0, 0.3], [0.2, 1]) : k < 0.45 ? interpolate(k, [0.3, 0.45], [1, 0]) : 0.25 * Math.abs(Math.sin((k - 0.45) * Math.PI * 4.4));
  const vis = interpolate(k, [0, 0.06, 0.85, 1], [0, 1, 1, 0], cl);
  const W = 200, gap = 70 * abre;
  const dentes = (cima: boolean) => Array.from({length: 7}, (_, i) => {
    const x = 18 + i * 27;
    return cima ? `M${x} 52 L${x + 13} 74 L${x + 26} 52` : `M${x} 8 L${x + 13} -14 L${x + 26} 8`;
  }).join(' ');
  return (
    <div style={{position: 'absolute', left: -W / 2 - 6, top: -150, opacity: vis, transform: `scale(${interpolate(k, [0, 0.12], [0.5, 1], cl)})`}}>
      <svg width={W + 12} height={230} viewBox="-6 -10 212 230" style={{overflow: 'visible'}}>
        <g transform={`translate(0 ${-gap})`}>
          <path d="M0 52 Q100 -30 200 52 Z" fill={cor} stroke="#000" strokeWidth={6} />
          <path d={dentes(true)} fill="#fff" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
        </g>
        <g transform={`translate(0 ${80 + gap})`}>
          <path d={dentes(false)} fill="#fff" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
          <path d="M0 8 Q100 90 200 8 Z" fill={cor} stroke="#000" strokeWidth={6} />
        </g>
        {abre > 0.15 && <ellipse cx={100} cy={70} rx={88} ry={Math.max(2, gap * 0.9)} fill="#3a0010" opacity={0.85} />}
      </svg>
    </div>
  );
};

// efeitos dos eventos (desenhados por cima dos tripulantes)
export const Efeito4: React.FC<{e: EvQ; s: Sim; f: number}> = ({e, s, f}) => {
  const dt = f - e.quadro;
  const k = dt / DUR_EFEITO4;
  if (dt < 0 || k >= 1 || e.x === undefined) {
    // duto e gasolina não têm x obrigatório; tratados abaixo
    if (!(dt >= 0 && k < 1 && (e.tipo === 'duto' || e.tipo === 'gasolina' || e.tipo === 'bomba_plantada'))) return null;
  }
  const pos = (x: number, y: number, filho: React.ReactNode, key?: string) => <div key={key} style={{position: 'absolute', left: x, top: y}}>{filho}</div>;

  if (e.tipo === 'morte' && !e.devorado) {
    const kk = dt / 40;
    if (kk >= 1) return null;
    const lado = (s.q(e.assassino, e.quadro)?.x ?? e.x - 1) < e.x ? 1 : -1;
    return pos(e.x, e.y - 40, <>
      {/* golpe em arco */}
      <svg width={220} height={160} viewBox="0 0 220 160" style={{position: 'absolute', left: -110, top: -100, overflow: 'visible', opacity: interpolate(kk, [0, 0.05, 0.3, 0.45], [0, 1, 1, 0], cl), transform: `scaleX(${lado})`}}>
        <path d="M20 130 Q110 -20 200 60" fill="none" stroke="#fff" strokeWidth={interpolate(kk, [0, 0.3], [26, 4], cl)} strokeLinecap="round" strokeDasharray="420" strokeDashoffset={interpolate(kk, [0, 0.18], [420, 0], cl)} />
      </svg>
      <Respingos k={kk} seed={e.quadro % 97} />
      <Onomatopeia txt="SLASH!" cor="#ff3b3b" k={kk} tam={40} />
    </>);
  }
  if (e.tipo === 'xerife') {
    const kk = dt / 36;
    if (kk >= 1) return null;
    const de = e.de ?? {x: e.x - 120, y: e.y};
    const ang = Math.atan2(e.y - de.y, e.x - de.x);
    const len = Math.hypot(e.x - de.x, e.y - de.y);
    return <>
      {pos(de.x, de.y - 50, <>
        {/* clarão no cano */}
        <div style={{position: 'absolute', left: -60, top: -60, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,250,200,${interpolate(kk, [0, 0.03, 0.2], [0, 1, 0], cl)}) 0%, rgba(255,170,0,${interpolate(kk, [0, 0.03, 0.2], [0, 0.8, 0], cl)}) 40%, transparent 70%)`}} />
        {/* traço da bala */}
        <div style={{position: 'absolute', left: 0, top: -3, width: len, height: 6, transformOrigin: '0 50%', transform: `rotate(${ang}rad) scaleX(${interpolate(kk, [0, 0.12], [0, 1], cl)})`, background: 'linear-gradient(90deg, transparent, #ffe680 30%, #fff)', boxShadow: '0 0 12px #ffcc33', opacity: interpolate(kk, [0.1, 0.35], [1, 0], cl)}} />
      </>, 'a')}
      {pos(e.x, e.y - 50, <>
        <Respingos k={Math.max(0, kk - 0.08)} n={7} seed={e.quadro % 89} />
        <Onomatopeia txt="BANG!" cor="#ffd21f" k={kk} tam={46} />
      </>, 'b')}
    </>;
  }
  if (e.tipo === 'bomba') {
    const kk = dt / DUR_EFEITO4;
    const r = interpolate(kk, [0, 0.12, 0.5], [20, 230, 260], cl);
    return pos(e.x, e.y - 40, <>
      {/* onda de choque */}
      <div style={{position: 'absolute', left: -r * 1.6, top: -r * 1.1, width: r * 3.2, height: r * 2.2, borderRadius: '50%', border: `${interpolate(kk, [0, 0.4], [18, 1], cl)}px solid #fff7d6`, opacity: interpolate(kk, [0, 0.4], [1, 0], cl)}} />
      {/* bola de fogo */}
      <div style={{position: 'absolute', left: -r, top: -r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle, #fffbe0 0%, #ffd21f 25%, #ff7a00 55%, #d42a00 75%, transparent 76%)', border: '6px solid #000', opacity: interpolate(kk, [0, 0.04, 0.35, 0.55], [0, 1, 1, 0], cl), transform: `scale(${1 + 0.05 * Math.sin(dt)})`}} />
      <Fumaca k={kk} n={9} raio={200} seed={e.quadro % 53} />
      {/* destroços */}
      {Array.from({length: 10}, (_, i) => {
        const a = h(i, 9) * Math.PI * 2, d = 280 * Math.min(1, kk * 2.5);
        return <div key={i} style={{position: 'absolute', left: Math.cos(a) * d - 9, top: Math.sin(a) * d * 0.7 + 200 * kk * kk - 9, width: 18, height: 12, background: i % 2 ? '#8a94a3' : '#5b6370', border: '2px solid #000', transform: `rotate(${dt * 25 + i * 40}deg)`, opacity: interpolate(kk, [0.6, 0.9], [1, 0], cl)}} />;
      })}
      <Onomatopeia txt="BUUUM!" cor="#ff7a00" k={kk} tam={72} />
    </>);
  }
  if (e.tipo === 'incendio') {
    return <>{(e.posMortos ?? []).map((m: any, i: number) => pos(m.x, m.y - 20, <>
      <Chamas f={f + i * 7} k={k} tam={1.3} />
      <Fumaca k={k} n={4} raio={60} seed={i + 11} />
      {i === 0 && <Onomatopeia txt="FOOOSH!" cor="#ff6a00" k={k} tam={56} />}
    </>, 'm' + i))}</>;
  }
  if (e.tipo === 'casal_morre') {
    const kk = dt / 60;
    if (kk >= 1) return null;
    return pos(e.x, e.y - 120, <>
      <div style={{position: 'absolute', left: -40, top: -60 - 70 * kk, fontSize: 80, opacity: interpolate(kk, [0, 0.08, 0.8, 1], [0, 1, 1, 0], cl)}}>
        <span style={{display: 'inline-block', transform: `translateX(${-14 * Math.min(1, Math.max(0, kk - 0.25) * 4)}px) rotate(${-18 * Math.min(1, Math.max(0, kk - 0.25) * 4)}deg)`}}>{kk < 0.25 ? '❤️' : '💔'}</span>
      </div>
    </>);
  }
  if (e.tipo === 'morte' && e.devorado) {
    const kk = dt / 45;
    if (kk >= 1) return null;
    const glutao = s.q(e.assassino, f);
    return pos(e.x, e.y - 30, <>
      <Bocarra k={kk} cor={corDe(e.aparente ?? e.assassino)} />
      {kk > 0.4 && <Respingos k={(kk - 0.4) / 0.6} n={8} cor="#c99a5e" raio={70} seed={e.quadro % 71} />}
      <Onomatopeia txt="NHAC!" cor="#ff9f1a" k={kk} tam={58} />
      {glutao && kk > 0.5 && <div style={{position: 'absolute', left: glutao.x - e.x - 30, top: glutao.y - e.y - 160, fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#fff', WebkitTextStroke: '1.5px #000', opacity: interpolate(kk, [0.5, 0.6, 0.95, 1], [0, 1, 1, 0], cl)}}>*arroto*</div>}
    </>);
  }
  if (e.tipo === 'canibal_come') {
    const kk = dt / 50;
    if (kk >= 1) return null;
    return pos(e.x, e.y - 40, <>
      {/* mordidas: três "nhac" seguidos */}
      {[0, 1, 2].map((i) => {
        const ki = kk * 3 - i;
        return ki > 0 && ki < 1 ? <div key={i} style={{position: 'absolute', left: -30 + i * 24, top: -30 + i * 10, width: 60, height: 60, borderRadius: '50%', border: '6px dashed #fff', transform: `scale(${interpolate(ki, [0, 0.3, 1], [1.4, 0.8, 1], cl)})`, opacity: 1 - ki}} /> : null;
      })}
      <Respingos k={kk} n={10} cor="#b8001f" raio={60} seed={e.quadro % 61} />
      <Onomatopeia txt="CRUNCH!" cor="#ff3b3b" k={kk} tam={50} />
      {e.total !== undefined && <div style={{position: 'absolute', left: -60, top: 30, width: 120, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 28, color: '#ffb3b3', WebkitTextStroke: '1.5px #000', opacity: interpolate(kk, [0.3, 0.4, 0.9, 1], [0, 1, 1, 0], cl)}}>🍖 {e.total}/3</div>}
    </>);
  }
  if (e.tipo === 'gasolina') {
    const v = s.q(e.vitima, f);
    if (!v) return null;
    const kk = dt / 40;
    if (kk >= 1) return null;
    return pos(v.x, v.y - 60, <>
      {Array.from({length: 8}, (_, i) => {
        const x = -40 + h(i, 5) * 80, y = -60 + ((kk * 160 + h(i, 6) * 60) % 110);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 14, height: 18, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#f5b400', border: '2px solid #000', opacity: interpolate(kk, [0, 0.1, 0.8, 1], [0, 1, 1, 0], cl)}} />;
      })}
      <Onomatopeia txt="SPLASH" cor="#f5b400" k={kk} tam={30} />
    </>);
  }
  if (e.tipo === 'poder' && (e.poder === 'escudo' || e.poder === 'escudo_anjo')) {
    const v = s.q(e.alvo, f);
    const kk = dt / 45;
    if (!v || kk >= 1) return null;
    const anjo = e.poder === 'escudo_anjo';
    const cor = anjo ? '#ffe14d' : '#6dff8a';
    return pos(v.x, v.y - 50, <>
      <div style={{position: 'absolute', left: -75, top: -75, width: 150, height: 150, borderRadius: '50%', border: `8px solid ${cor}`, boxShadow: `0 0 34px ${cor}, inset 0 0 24px ${cor}88`, transform: `scale(${interpolate(kk, [0, 0.2], [0.3, 1], cl)})`, opacity: interpolate(kk, [0.6, 1], [1, 0], cl)}} />
      <Onomatopeia txt={anjo ? '😇 ESCUDO DO ANJO' : '🛡️ ESCUDO'} cor={cor} k={kk} tam={30} />
    </>);
  }
  if (e.tipo === 'poder' && e.poder === 'colete') {
    const v = s.q(e.cor, f);
    const kk = dt / 40;
    if (!v || kk >= 1) return null;
    return pos(v.x, v.y - 50, <Onomatopeia txt="🦺 COLETE!" cor="#ff9f1a" k={kk} tam={34} />);
  }
  if (e.tipo === 'poder' && e.poder === 'rastrear') {
    const a = s.q(e.cor, f), b = s.q(e.alvo, f);
    const kk = dt / 50;
    if (!a || kk >= 1) return null;
    const ang = b ? Math.atan2(b.y - a.y, b.x - a.x) : 0;
    return pos(a.x, a.y - 50, <>
      {[0, 1, 2].map((i) => {
        const ki = Math.max(0, Math.min(1, kk * 2 - i * 0.25));
        return <div key={i} style={{position: 'absolute', left: -140 * ki, top: -140 * ki, width: 280 * ki, height: 280 * ki, borderRadius: '50%', border: '4px solid #3ee0ff', opacity: 1 - ki}} />;
      })}
      {b && <div style={{position: 'absolute', left: 0, top: -10, width: 150, height: 20, transformOrigin: '0 50%', transform: `rotate(${ang}rad)`, opacity: interpolate(kk, [0.1, 0.2, 0.85, 1], [0, 1, 1, 0], cl)}}>
        <div style={{position: 'absolute', left: 60, top: 6, width: 70, height: 8, background: '#3ee0ff', border: '2px solid #000'}} />
        <div style={{position: 'absolute', left: 126, top: -2, width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: '22px solid #3ee0ff'}} />
      </div>}
      <Onomatopeia txt={`📍 ${e.alvo}`} cor="#3ee0ff" k={kk} tam={30} />
    </>);
  }
  if (e.tipo === 'poder' && e.poder === 'pegadas') {
    // as pegadas de verdade: o caminho que cada um fez nos últimos 3 s, brilhando no chão
    const kk = dt / DUR_EFEITO4;
    const quem: string[] = e.quem ?? [];
    const al = interpolate(kk, [0, 0.1, 0.8, 1], [0, 1, 1, 0], cl);
    return <>
      {quem.flatMap((c, j) => Array.from({length: 7}, (_, i) => {
        const q = s.q(c, e.quadro - 90 + i * 15) ?? s.q(c, e.quadro);
        if (!q) return null;
        return <div key={c + i} style={{position: 'absolute', left: q.x - 9 + (i % 2 ? 9 : -9), top: q.y - 6, width: 14, height: 20, borderRadius: '50% 50% 45% 45%', background: ['#ffd84d', '#ff7ad9', '#7dff5a', '#6ab8ff'][j % 4], border: '2px solid #000', opacity: al * (0.4 + 0.6 * (i / 6)), boxShadow: '0 0 10px #fff8'}} />;
      }))}
      {(() => { const a = s.q(e.cor, f); return a ? pos(a.x, a.y - 50, <Onomatopeia txt={`🔍 pegadas: ${quem.join(', ') || 'ninguém'}`} cor="#ffd84d" k={kk} tam={26} />, 'r') : null })()}
    </>;
  }
  if (e.tipo === 'chantagem') {
    const v = s.q(e.alvo, f);
    const kk = dt / 45;
    if (!v || kk >= 1) return null;
    return pos(v.x, v.y - 60, <Onomatopeia txt="🤐 CHANTAGEADO" cor="#c08bff" k={kk} tam={30} dy={70} />);
  }
  return null;
};

// marcas que ficam em cima de um jogador vivo: bomba grudada (com o pavio piscando) e gotas de gasolina
export const MarcasJogador: React.FC<{s: Sim; cor: string; f: number; papeis: boolean}> = ({s, cor, f, papeis}) => {
  if (!papeis) return null;
  const plantada = [...s.eventos].reverse().find((e) => e.tipo === 'bomba_plantada' && e.vitima === cor && e.quadro <= f);
  const explodiu = plantada && s.eventos.some((e) => e.tipo === 'bomba' && e.portador === cor && e.quadro >= plantada.quadro && e.quadro <= f);
  const t = s.tique(f);
  const proxReuniao = (de: number) => s.reunioes.find((r) => r.quadro > de)?.quadro ?? Infinity;
  const colete = s.eventos.some((e) => e.tipo === 'poder' && e.poder === 'colete' && e.cor === cor && e.quadro <= f && t < (e.ate ?? e.tique + 3));
  const calado = s.eventos.some((e) => e.tipo === 'chantagem' && e.alvo === cor && e.quadro + 40 <= f && f < proxReuniao(e.quadro));
  const encharcado = s.eventos.some((e) => e.tipo === 'gasolina' && e.vitima === cor && e.quadro + 30 <= f) && !s.eventos.some((e) => e.tipo === 'incendio' && e.quadro <= f);
  return (
    <>
      {plantada && !explodiu && (
        <div style={{position: 'absolute', left: 52, top: 30, width: 30, height: 30, borderRadius: '50%', background: '#1b1b1f', border: '3px solid #000', boxShadow: f % 20 < 10 ? '0 0 14px #ff2b2b' : 'none'}}>
          <div style={{position: 'absolute', left: 12, top: -12, width: 4, height: 12, background: '#c9a46a'}} />
          <div style={{position: 'absolute', left: 9, top: -18, width: 10, height: 10, borderRadius: '50%', background: f % 20 < 10 ? '#ff3b3b' : '#ffd21f'}} />
        </div>
      )}
      {colete && <div style={{position: 'absolute', left: 6, top: 38, width: 64, height: 38, borderRadius: 10, background: 'repeating-linear-gradient(90deg, #ff8a1f 0 12px, #ffd21f 12px 16px)', border: '3px solid #000', opacity: 0.92}} />}
      {calado && <div style={{position: 'absolute', left: 46, top: -6, fontSize: 26}}>🤐</div>}
      {encharcado && <div style={{position: 'absolute', left: -6, top: 6, width: 14, height: 18, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: '#f5b400', border: '2px solid #000', transform: `translateY(${(f % 40) / 4}px)`, opacity: 0.9}} />}
    </>
  );
};

// duto: quem entra afunda na tampa, quem sai pula dela (transform aplicado no desenho do tripulante)
export function animDuto(s: Sim, cor: string, f: number): {transform?: string; clip?: boolean; tampa?: {x: number; y: number; k: number}} {
  for (const e of s.eventos) {
    if (e.tipo !== 'duto' || e.cor !== cor) continue;
    const dt = f - e.quadro;
    if (dt >= -12 && dt < 0) {
      // entrando: pulinho e afunda
      const k = (dt + 12) / 12;
      const pulo = k < 0.35 ? -26 * Math.sin((k / 0.35) * Math.PI) : 0;
      const afunda = k >= 0.35 ? ((k - 0.35) / 0.65) * 100 : 0;
      return {transform: `translateY(${pulo + afunda}px) scaleX(${1 - 0.15 * Math.max(0, k - 0.35)})`, clip: k >= 0.35};
    }
    if (dt >= 0 && dt < 14) {
      // saindo: sobe da tampa com um pulo
      const k = dt / 14;
      const sai = k < 0.5 ? (1 - k / 0.5) * 100 : -24 * Math.sin(((k - 0.5) / 0.5) * Math.PI);
      return {transform: `translateY(${sai}px)`, clip: k < 0.5};
    }
  }
  return {};
}

// tampas de duto abrindo (na entrada e na saída) no momento em que alguém passa
export const TampasDuto: React.FC<{s: Sim; f: number; ponto: (sala: string) => {x: number; y: number} | null}> = ({s, f, ponto}) => (
  <>
    {s.eventos.filter((e) => e.tipo === 'duto' && f >= e.quadro - 12 && f < e.quadro + 16).flatMap((e, i) => {
      const lista: React.ReactNode[] = [];
      for (const [sala, ini] of [[e.de, e.quadro - 12], [e.para, e.quadro]] as [string, number][]) {
        const p = ponto(sala);
        if (!p) continue;
        const k = (f - ini) / 16;
        if (k < 0 || k > 1) continue;
        const ab = Math.sin(Math.min(1, k * 1.4) * Math.PI);
        lista.push(
          <div key={`${i}-${sala}`} style={{position: 'absolute', left: p.x - 28, top: p.y - 20}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 56, height: 40, borderRadius: 5, background: '#05070b', border: '3px solid #000'}} />
            <div style={{position: 'absolute', left: 0, top: 0, width: 56, height: 40, borderRadius: 5, background: 'repeating-linear-gradient(0deg, #2a313c 0 4px, #0f1319 4px 7px)', border: '3px solid #0b0d14', transformOrigin: '50% 0%', transform: `perspective(200px) rotateX(${ab * 75}deg) translateY(${-ab * 22}px)`}} />
          </div>,
        );
      }
      return lista;
    })}
  </>
);

// duto tapado pelo Mecânico: tábuas em X em cima da tampa até a próxima reunião
export const DutosTapados: React.FC<{s: Sim; f: number; ponto: (sala: string) => {x: number; y: number} | null}> = ({s, f, ponto}) => (
  <>
    {s.eventos.filter((e) => e.tipo === 'poder' && e.poder === 'tapar_duto' && e.quadro <= f && !s.reunioes.some((r) => r.quadro > e.quadro && r.quadro <= f)).map((e, i) => {
      const p = ponto(e.sala);
      if (!p) return null;
      const k = Math.min(1, (f - e.quadro) / 10);
      return (
        <div key={i} style={{position: 'absolute', left: p.x - 40, top: p.y - 14, transform: `scale(${0.6 + 0.4 * k})`, opacity: k}}>
          {[-18, 18].map((r) => <div key={r} style={{position: 'absolute', left: 0, top: 6, width: 80, height: 16, background: '#a9743f', border: '3px solid #000', borderRadius: 3, transform: `rotate(${r}deg)`}} />)}
        </div>
      );
    })}
  </>
);

// o corpo no chão, com a animação de queda e os modos do AU4 (devorado, comido, tostado)
export const Corpo4: React.FC<{c: ReturnType<Sim['corpos']>[number]; f: number; s: Sim; desenho: (props: {morto: true; queimado?: boolean}) => React.ReactNode; vivo: () => React.ReactNode}> = ({c, f, s, desenho, vivo}) => {
  const idade = f - c.desde;
  const queimado = c.causa === 'bomba' || c.causa === 'fogo';
  // primeiros quadros: a vítima ainda de pé, tremendo; depois cai e o corpo quica (o Glutão engole de pé)
  if (c.modo === 'devorado' && c.k !== undefined) {
    const sobe = interpolate(c.k, [0.25, 0.42], [0, 1], cl);
    if (c.k > 0.42) return null;
    return <div style={{transform: `translateY(${-90 * sobe}px) scale(${1 - sobe}) rotate(${sobe * 200}deg)`, transformOrigin: '50% 50%'}}>{vivo()}</div>;
  }
  if (idade < 7 && c.causa !== 'veneno') {
    return <div style={{transform: `translateX(${3 * Math.sin(idade * 3)}px) rotate(${idade * 4}deg)`, transformOrigin: '50% 100%', filter: queimado ? 'brightness(1.6) saturate(0.4)' : undefined}}>{vivo()}</div>;
  }
  const kq = Math.min(1, (idade - 7) / 10);
  const quica = 1 + 0.35 * Math.sin(kq * Math.PI) * (1 - kq);
  const style: React.CSSProperties = {transform: `scale(${quica}, ${2 - quica})`, transformOrigin: '50% 100%'};
  if (c.modo === 'comido' && c.k !== undefined) {
    const some = interpolate(c.k, [0.1, 0.8], [0, 1], cl);
    return (
      <>
        <div style={{transform: `scale(${1 - 0.6 * some})`, transformOrigin: '50% 100%', opacity: 1 - some, clipPath: `circle(${Math.round(70 - 40 * some)}% at 50% 70%)`}}>{desenho({morto: true, queimado})}</div>
        {/* sobra o osso */}
        <div style={{position: 'absolute', left: 16, top: 52, fontSize: 40, opacity: interpolate(c.k, [0.6, 0.75, 0.95, 1], [0, 1, 1, 0], cl), transform: 'rotate(-20deg)'}}>🦴</div>
      </>
    );
  }
  void s;
  return (
    <div style={style}>
      <div style={{filter: queimado ? 'brightness(0.35) saturate(0.3)' : undefined}}>{desenho({morto: true, queimado})}</div>
      {queimado && idade < 160 && [0, 1].map((i) => <div key={i} style={{position: 'absolute', left: 24 + i * 22, top: 30 - ((idade * 1.5 + i * 30) % 60), width: 16, height: 16, borderRadius: '50%', background: '#55555f', opacity: 0.6 * (1 - ((idade * 1.5 + i * 30) % 60) / 60)}} />)}
    </div>
  );
};
