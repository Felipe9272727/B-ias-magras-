// Among Us 5: peças da montagem nova (crítica da prévia feita pelo Sonnet, critica_previa_au5_sonnet.md):
// selos/carimbos/créditos por cima de qualquer cena, balão de pensamento (a voz com eco vem da linha do tempo),
// a volta no tempo ("VOLTANDO AO TIQUE 1") com o título, a cena do Casal, a foto do Influencer como polaroid
// e o fecho congelado. Tudo desenhado aqui, sem emoji.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';
import {Crewmate4} from '../amongus/Crewmate4';
import {COR} from '../amongus/Crewmate';
import {Coracao} from './Icones5';
import {Mundo5, type Skins} from './Jogo5';
import {simular, type Partida2} from './sim5';

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const corDe = (c: string) => (COR as Record<string, {body: string}>)[c]?.body ?? '#888';

export type Selo = {txt: string; at: number; dur?: number; estilo?: 'carimbo' | 'credito' | 'etiqueta' | 'contador'; cor?: string; cores?: string[]};

// por cima da cena: carimbo (grande, inclinado, no meio), crédito (canto de baixo), etiqueta (faixa no alto) e contador
export const Sobreposicoes: React.FC<{selos: Selo[]}> = ({selos}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {selos.map((s, i) => {
        const k = f - s.at;
        const dur = s.dur ?? 75;
        if (k < 0 || k > dur) return null;
        const op = interpolate(k, [0, 4, dur - 6, dur], [0, 1, 1, 0], cl);
        const cor = s.cor ?? '#ff4d4d';
        if (s.estilo === 'carimbo')
          return (
            <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', opacity: op}}>
              <div style={{padding: '10px 44px', borderRadius: 22, border: `12px solid ${cor}`, color: cor, background: 'rgba(255,255,255,.93)', fontFamily: FONT.display, fontWeight: 900, fontSize: 96, transform: `rotate(-7deg) scale(${interpolate(k, [0, 7], [2.6, 1], cl)})`, whiteSpace: 'nowrap'}}>{s.txt}</div>
            </div>
          );
        if (s.estilo === 'credito')
          return (
            <div key={i} style={{position: 'absolute', left: 30, bottom: 200, opacity: op, transform: `translateX(${interpolate(k, [0, 8], [-80, 0], cl)}px)`, padding: '10px 22px', borderRadius: 14, background: '#fff', border: '5px solid #000', boxShadow: '0 6px 0 #000', fontFamily: FONT.display, fontWeight: 800, fontSize: 30, color: '#000', maxWidth: 900}}>{s.txt}</div>
          );
        if (s.estilo === 'contador')
          return (
            <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', justifyContent: 'center', opacity: op}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '10px 30px', borderRadius: 18, background: '#000d', border: `5px solid ${cor}`, fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: '#fff', transform: `scale(${interpolate(k, [0, 6, 10], [0.4, 1.12, 1], cl)})`}}>
                {(s.cores ?? []).map((c, j) => <div key={j} style={{width: 50, height: 62, opacity: interpolate(k, [6 + j * 8, 10 + j * 8], [0, 1], cl)}}><Crewmate4 cor={c} size={50} /></div>)}
                {s.txt}
              </div>
            </div>
          );
        // etiqueta: faixa no alto
        return (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', justifyContent: 'center', opacity: op}}>
            <div style={{padding: '8px 28px', borderRadius: 14, background: cor, border: '5px solid #000', fontFamily: FONT.display, fontWeight: 900, fontSize: 46, color: '#fff', WebkitTextStroke: '1.5px #000', transform: `scale(${interpolate(k, [0, 6], [0.5, 1], cl)})`}}>{s.txt}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// pensamento: nuvem com o rosto de quem pensa, enquanto a voz (com eco) toca
export const Pensamentos: React.FC<{chat: {cor: string; texto: string; at: number; ate?: number; pensa?: boolean}[]}> = ({chat}) => {
  const f = useCurrentFrame();
  const m = chat.filter((x) => x.pensa && f >= x.at - 4 && f < (x.ate ?? x.at + 150) + 18).pop();
  if (!m) return null;
  const k = f - (m.at - 4);
  const fim = (m.ate ?? m.at + 150) + 18;
  const op = Math.min(interpolate(k, [0, 8], [0, 1], cl), interpolate(f, [fim - 8, fim], [1, 0], cl));
  return (
    <AbsoluteFill style={{background: `rgba(10,8,30,${0.45 * op})`}}>
      <div style={{position: 'absolute', left: 160, right: 160, bottom: 90, opacity: op, transform: `translateY(${(1 - op) * 40}px)`}}>
        {/* bolinhas do balão de pensamento */}
        {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 120 + i * 34, bottom: -36 + i * 22, width: 18 + i * 10, height: 18 + i * 10, borderRadius: '50%', background: '#fff', border: '4px solid #000'}} />)}
        <div style={{display: 'flex', gap: 24, alignItems: 'center', padding: '26px 34px', borderRadius: 60, background: '#fff', border: '6px solid #000', boxShadow: `0 0 0 8px ${corDe(m.cor)}`}}>
          <div style={{flex: 'none', width: 110, height: 130}}><Crewmate4 cor={m.cor} size={110} /></div>
          <div>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 28, color: corDe(m.cor), WebkitTextStroke: '1px #000', letterSpacing: 2}}>{m.cor.toUpperCase()} PENSOU:</div>
            <div style={{fontFamily: FONT.display, fontWeight: 800, fontStyle: 'italic', fontSize: m.texto.length > 120 ? 36 : 42, lineHeight: 1.2, color: '#111'}}>“{m.texto}”</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// a volta no tempo: relógio girando ao contrário e "VOLTANDO AO TIQUE 1", depois o título
export const AU5Rebobina: React.FC<{de?: number; para?: number; kicker: string; titulo: string}> = ({de = 59, para = 1, kicker, titulo}) => {
  const f = useCurrentFrame();
  const corte = 48;
  const tq = Math.round(interpolate(f, [0, corte - 6], [de, para], {...cl, easing: Easing.in(Easing.cubic)}));
  if (f < corte)
    return (
      <AbsoluteFill style={{background: '#0d0a1c', display: 'grid', placeItems: 'center', filter: `hue-rotate(${f * 4}deg)`}}>
        <svg width={360} height={360} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={44} fill="#fff" stroke="#000" strokeWidth={6} />
          {Array.from({length: 12}).map((_, i) => <path key={i} d={`M50 10v6`} stroke="#000" strokeWidth={3} transform={`rotate(${i * 30} 50 50)`} />)}
          <path d="M50 50V18" stroke="#000" strokeWidth={5} strokeLinecap="round" transform={`rotate(${-f * 40} 50 50)`} />
          <path d="M50 50h22" stroke="#e01b1b" strokeWidth={4} strokeLinecap="round" transform={`rotate(${-f * 9} 50 50)`} />
        </svg>
        <div style={{position: 'absolute', bottom: 190, fontFamily: FONT.display, fontWeight: 900, fontSize: 80, color: '#fff', WebkitTextStroke: '3px #000'}}>VOLTANDO AO TIQUE {tq}</div>
      </AbsoluteFill>
    );
  const k = f - corte;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2b2350, #0d0a1c 75%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 46, letterSpacing: 8, color: '#c9b8ff', opacity: interpolate(k, [0, 8], [0, 1], cl)}}>{kicker}</div>
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 130, color: '#fff', WebkitTextStroke: '5px #000', textShadow: '0 10px 0 #000', transform: `scale(${interpolate(k, [0, 8, 12], [2, 0.95, 1], cl)})`}}>{titulo}</div>
    </AbsoluteFill>
  );
};

// o Casal: os dois, a linha com o coração e a mensagem do chat dos impostores que entrega quem é o par
export const AU5Casal: React.FC<{a: string; b: string; timeA: string; timeB: string; chat?: {cor: string; texto: string}}> = ({a, b, timeA, timeB, chat}) => {
  const f = useCurrentFrame();
  const chip = (t: string) => <div style={{marginTop: 10, padding: '4px 16px', borderRadius: 10, border: `4px solid ${t === 'impostor' ? '#d40000' : '#1f6fd1'}`, color: t === 'impostor' ? '#d40000' : '#1f6fd1', background: '#fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 30}}>{t.toUpperCase()}</div>;
  const lado = (c: string, t: string, x: number, d: number) => (
    <div style={{position: 'absolute', left: x, top: 230, width: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateX(${interpolate(f, [0, 14], [d, 0], {...cl, easing: Easing.out(Easing.back(1.3))})}px)`}}>
      <Crewmate4 cor={c} size={260} t={f} anim="parado" />
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 54, color: corDe(c), WebkitTextStroke: '2px #000'}}>{c}</div>
      {chip(t)}
    </div>
  );
  const linha = interpolate(f, [16, 34], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #3a1f3a, #120a16 75%)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 72, color: '#ff8fb0', WebkitTextStroke: '3px #000'}}>CASAL</div>
      {lado(a, timeA, 260, -500)}
      {lado(b, timeB, 1300, 500)}
      <div style={{position: 'absolute', left: 620, top: 420, width: 680 * linha, height: 10, background: '#ff5c8a', borderRadius: 5, boxShadow: '0 0 20px #ff5c8a'}} />
      <div style={{position: 'absolute', left: 890, top: 360, transform: `scale(${interpolate(f, [30, 38, 44], [0, 1.25, 1], cl) * (1 + 0.06 * Math.sin(f / 5))})`}}><Coracao tam={140} /></div>
      {chat && f > 50 && (
        <div style={{position: 'absolute', left: 360, right: 360, bottom: 60, padding: '16px 24px', borderRadius: 18, background: 'rgba(40,0,0,.9)', border: '4px solid #ff3b3b', fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: '#fff', opacity: interpolate(f, [50, 58], [0, 1], cl)}}>
          <div style={{fontSize: 22, color: '#ff8a8a', letterSpacing: 2}}>CHAT DOS IMPOSTORES · TIQUE 1</div>
          <span style={{color: corDe(chat.cor), WebkitTextStroke: '1px #000'}}>{chat.cor}</span>: {chat.texto}
        </div>
      )}
    </AbsoluteFill>
  );
};

// a foto do Influencer: o mundo no instante da foto, numa polaroid desenhada
export const AU5Foto: React.FC<{p: Partida2; skins?: Skins; tique: number; cor: string; legenda: string}> = ({p, skins, tique, cor, legenda}) => {
  const f = useCurrentFrame();
  const s = simular(p);
  const e = s.eventos.find((x) => x.tipo === 'foto' && x.tique === tique && x.cor === cor);
  const qf = e?.quadro ?? s.inicioTique[tique] ?? 0;
  const q = s.q(cor, qf) ?? {x: 0, y: 0};
  const flash = interpolate(f, [0, 3, 14], [0, 1, 0], cl);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1c2a44, #070b14 80%)'}}>
      <div style={{position: 'absolute', left: 460, top: 70, width: 1000, padding: '28px 28px 120px', background: '#fafaf5', border: '6px solid #000', boxShadow: '0 20px 50px #000a', transform: `rotate(${interpolate(f, [0, 16], [-14, -3], {...cl, easing: Easing.out(Easing.back(1.4))})}deg) scale(${interpolate(f, [0, 16], [0.6, 1], cl)})`}}>
        <div style={{position: 'relative', width: 944, height: 700, overflow: 'hidden', border: '4px solid #000', background: '#000'}}>
          <Mundo5 p={p} s={s} f={qf} frame={qf} cx={q.x} cy={q.y} escala={0.62} w={944} h={700} papeis={false} skins={skins} />
        </div>
        <div style={{position: 'absolute', left: 20, right: 20, bottom: 36, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#222', whiteSpace: 'nowrap'}}>{legenda}</div>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};
