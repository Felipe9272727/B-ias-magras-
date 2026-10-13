import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';
import {FundoBaixoPoli, Retrato} from './comum';
import {tributo} from './regras';

// Fechamento do vídeo 3: memorial dos doze (mortos em ordem, vencedor por último) e tela final com espaço
// para os elementos de fim de vídeo do YouTube.

type Ficha = {id: string; linha: string};
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const Coroa: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 100 62">
    <path d="M6 58 L2 14 L28 34 L50 4 L72 34 L98 14 L94 58 Z" fill="#ffd34d" stroke="#5a3d00" strokeWidth="4" strokeLinejoin="round" />
    <circle cx="50" cy="40" r="7" fill="#ff5a5a" stroke="#5a3d00" strokeWidth="3" />
  </svg>
);

const Cartao: React.FC<{f: Ficha; d: number}> = ({f, d}) => {
  const {fps} = useVideoConfig();
  const t = tributo(f.id);
  const entra = spring({frame: d, fps, config: {damping: 14, stiffness: 150}});
  const carimbo = spring({frame: d - 8, fps, config: {damping: 9, stiffness: 220}});
  if (d < 0) return <div style={{width: 250, height: 262}} />;
  return (
    <div style={{width: 250, height: 262, position: 'relative', opacity: entra, transform: `translateY(${(1 - entra) * 40}px)`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 22, background: 'rgba(8,10,18,.82)', border: `4px solid ${t?.cor ?? '#666'}55`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 18}}>
        <Retrato id={f.id} size={118} cinza borda="#2a2d38" />
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#e8e8ee', marginTop: 12}}>{t?.nome ?? f.id}</div>
        <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 22, color: '#ff8a8a', marginTop: 4, textAlign: 'center', padding: '0 10px'}}>{f.linha}</div>
      </div>
      <div style={{position: 'absolute', left: 66, top: 8, fontFamily: FONT.display, fontWeight: 900, fontSize: 130, color: '#ff3b3b', lineHeight: 1, WebkitTextStroke: '4px #000', opacity: carimbo * 0.85, transform: `scale(${interpolate(carimbo, [0, 1], [2.2, 1])})`}}>✕</div>
    </div>
  );
};

export const ILMemorial: React.FC<{mortos: Ficha[]; vencedor: Ficha; vencedorEm?: number}> = ({mortos, vencedor, vencedorEm}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const passo = 13;
  const vEm = vencedorEm ?? 12 + mortos.length * passo + 24;
  const v = spring({frame: f - vEm, fps, config: {damping: 12, stiffness: 120}});
  const t = tributo(vencedor.id);
  const linhas = [mortos.slice(0, 6), mortos.slice(6)];
  const apaga = clamp01((f - vEm) / 10) * 0.55;  // quando o vencedor entra, os mortos recuam
  return (
    <FundoBaixoPoli destaque="#b07ce8">
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 70, color: '#fff', letterSpacing: 4, opacity: clamp01(f / 10)}}>OS DOZE TRIBUTOS</div>
        <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'center', opacity: 1 - apaga, filter: apaga ? `blur(${apaga * 4}px)` : undefined, transform: 'scale(1.12)', transformOrigin: 'top center'}}>
          {linhas.map((ls, r) => (
            <div key={r} style={{display: 'flex', gap: 22}}>
              {ls.map((m, i) => (
                <Cartao key={m.id} f={m} d={f - (12 + (r * 6 + i) * passo)} />
              ))}
            </div>
          ))}
        </div>
      </AbsoluteFill>
      {f >= vEm && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{transform: `scale(${interpolate(v, [0, 1], [0.4, 1])})`, opacity: v, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '26px 70px 30px', borderRadius: 34, background: 'rgba(20,12,34,.92)', border: `6px solid ${t?.cor ?? '#ffd34d'}`, boxShadow: `0 0 ${60 + 20 * Math.sin(f / 6)}px ${t?.cor ?? '#ffd34d'}aa`}}>
            <Coroa size={130} />
            <div style={{marginTop: 6}}>
              <Retrato id={vencedor.id} size={210} borda="#ffd34d" />
            </div>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 70, color: '#fff', marginTop: 14, letterSpacing: 2}}>{t?.nome ?? vencedor.id}</div>
            <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 32, color: '#ffd34d', marginTop: 4, letterSpacing: 3}}>{vencedor.linha}</div>
          </div>
        </AbsoluteFill>
      )}
    </FundoBaixoPoli>
  );
};

export const ILTelaFinal: React.FC<{fundo: string; pergunta: string}> = ({fundo, pergunta}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 16, stiffness: 120}});
  const quadro = spring({frame: f - 14, fps, config: {damping: 16, stiffness: 120}});
  return (
    <AbsoluteFill style={{background: '#05070c'}}>
      <Img src={staticFile(fundo)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(14px) brightness(.45) saturate(1.1)', transform: `scale(${1.08 + 0.04 * (f / 600)})`}} />
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{marginTop: 90, fontFamily: FONT.display, fontWeight: 900, fontSize: 66, color: '#fff', textAlign: 'center', maxWidth: 1500, lineHeight: 1.15, opacity: e, transform: `translateY(${(1 - e) * 30}px)`, WebkitTextStroke: '2px #000', textShadow: '0 6px 0 #000a'}}>
          {pergunta}
        </div>
      </AbsoluteFill>
      {/* espaço livre para os elementos de fim de vídeo (vídeo sugerido à esquerda, inscrever à direita) */}
      <div style={{position: 'absolute', left: 250, top: 400, width: 800, height: 450, borderRadius: 18, border: '5px dashed rgba(255,255,255,.55)', opacity: quadro, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
        <div style={{marginBottom: -62, fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#ffd34d', letterSpacing: 3}}>ASSISTA TAMBÉM</div>
      </div>
      <div style={{position: 'absolute', left: 1290, top: 455, width: 340, height: 340, borderRadius: '50%', border: '5px dashed rgba(255,255,255,.55)', opacity: quadro, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
        <div style={{marginBottom: -62, fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#ff4d4d', letterSpacing: 3}}>SE INSCREVE</div>
      </div>
    </AbsoluteFill>
  );
};
