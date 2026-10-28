// Abertura do Among Us 5 (seguindo a crítica do AU4: no máximo 3 comentários em ~12 s, carimbo grande em cada um,
// e o mapa novo mostrado de verdade, num voo de câmera pelo Polus). Desenho próprio, sem emoji.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';
import {ArtePolus, TILE} from './polus/ArtePolus';
import {POLUS} from './polus/mapaPolus';
import {Crewmate4} from '../amongus/Crewmate4';

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export type Comentario5 = {autor: string; texto: string; likes?: number; selo: string; cor: string};

// os comentários entram um por vez (cada um ~1/3 da cena), com o carimbo batendo no final de cada um
export const AU5Comentarios: React.FC<{comentarios: Comentario5[]; gatilhos?: number[]}> = ({comentarios, gatilhos}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const passo = durationInFrames / comentarios.length;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #2b2350, #0d0a1c 75%)', overflow: 'hidden'}}>
      {/* neve caindo ao fundo (é o Polus) */}
      {Array.from({length: 60}).map((_, i) => {
        const x = (i * 337) % 1920, v = 1.5 + (i % 5) * 0.6;
        return <div key={i} style={{position: 'absolute', left: x + 30 * Math.sin((f + i * 20) / 40), top: ((f * v + i * 97) % 1180) - 60, width: 6 + (i % 3) * 3, height: 6 + (i % 3) * 3, borderRadius: '50%', background: '#fff', opacity: 0.35}} />;
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#fff', WebkitTextStroke: '3px #000', textShadow: '0 6px 0 #000'}}>VOCÊS PEDIRAM</div>
      {comentarios.map((c, i) => {
        const ini = gatilhos?.[i] ?? Math.round(i * passo);
        const k = f - ini;
        if (k < 0) return null;
        const entra = interpolate(k, [0, 10], [0, 1], {...cl, easing: Easing.out(Easing.back(1.6))});
        const carimbo = interpolate(k, [22, 30], [2.6, 1], cl);
        const y = 190 + i * 285;
        return (
          <div key={i} style={{position: 'absolute', left: 230, width: 1460, top: y, transform: `translateX(${(1 - entra) * (i % 2 ? 1400 : -1400)}px) rotate(${i % 2 ? 1 : -1}deg)`}}>
            <div style={{display: 'flex', gap: 22, padding: '22px 28px', borderRadius: 22, background: '#fff', border: '6px solid #000', boxShadow: '0 10px 0 #000'}}>
              <div style={{flex: 'none', width: 86, height: 86, borderRadius: '50%', background: c.cor, border: '5px solid #000', display: 'grid', placeItems: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: '#fff', WebkitTextStroke: '2px #000'}}>{c.autor.replace('@', '').charAt(0).toUpperCase()}</div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#333'}}>{c.autor}</div>
                <div style={{marginTop: 4, fontFamily: FONT.display, fontWeight: 700, fontSize: 36, lineHeight: 1.2, color: '#000', whiteSpace: 'pre-line'}}>{c.texto}</div>
                {c.likes !== undefined && <div style={{marginTop: 6, fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: '#666'}}>{c.likes} curtida{c.likes === 1 ? '' : 's'}</div>}
              </div>
            </div>
            {k >= 22 && (
              <div style={{position: 'absolute', right: -40, top: -58, padding: '6px 26px', borderRadius: 14, border: '8px solid #0d8a2a', color: '#0d8a2a', background: 'rgba(235,255,238,.95)', fontFamily: FONT.display, fontWeight: 900, fontSize: 54, transform: `rotate(-10deg) scale(${carimbo})`, opacity: interpolate(k, [22, 25], [0, 1], cl)}}>{c.selo}</div>
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// voo de câmera pelo Polus (mapa inteiro com os nomes) com as novidades em etiquetas
type Cartao = {autor: string; texto: string; selo: string; at: number; dur: number; likes?: number};
export const AU5Polus: React.FC<{etiquetas?: {txt: string; at: number; cor?: string; cores?: string[]}[]; cartoes?: Cartao[]; inicioVoo?: number}> = ({etiquetas = [], cartoes = [], inicioVoo = 0}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const W = POLUS.cols * TILE, H = POLUS.rows * TILE;
  const k = interpolate(f, [inicioVoo, durationInFrames], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  // começa de perto na Nave de Pouso e abre até mostrar o mapa inteiro
  const ds = POLUS.salas.Dropship.rect;
  const cx0 = (ds.c + ds.w / 2) * TILE, cy0 = (ds.r + ds.h) * TILE;
  const cx = interpolate(k, [0, 1], [cx0, W / 2]), cy = interpolate(k, [0, 1], [cy0, H / 2]);
  const esc = interpolate(k, [0, 1], [0.55, 1920 / W]);
  return (
    <AbsoluteFill style={{background: '#1c2029', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${960 - cx * esc}px, ${540 - cy * esc}px) scale(${esc})`}}>
        <ArtePolus nomes={k > 0.55} />
      </div>
      <div style={{position: 'absolute', left: 30, top: 26, padding: '6px 24px', borderRadius: 16, background: '#000c', border: '5px solid #9b7bff', fontFamily: FONT.display, fontWeight: 900, fontSize: 62, color: '#fff', opacity: interpolate(f, [inicioVoo, inicioVoo + 10], [0, 1], cl)}}>MAPA NOVO: POLUS</div>
      {cartoes.filter((c) => f >= c.at && f < c.at + c.dur).map((c, i) => {
        const kk = f - c.at;
        return (
          <AbsoluteFill key={'c' + i} style={{background: c.at === 0 ? `rgba(13,10,28,${interpolate(kk, [c.dur - 8, c.dur], [1, 0], cl)})` : undefined}}>
            <div style={{position: 'absolute', left: 260, right: 260, top: c.at === 0 ? 360 : 640, transform: `scale(${interpolate(kk, [0, 8], [0.6, 1], {...cl, easing: Easing.out(Easing.back(1.5))})})`, opacity: interpolate(kk, [c.dur - 6, c.dur], [1, 0], cl)}}>
              <div style={{padding: '22px 30px', borderRadius: 22, background: '#fff', border: '6px solid #000', boxShadow: '0 10px 0 #000'}}>
                <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#333'}}>{c.autor}</div>
                <div style={{marginTop: 4, fontFamily: FONT.display, fontWeight: 700, fontSize: 38, lineHeight: 1.2, color: '#000'}}>{c.texto}</div>
                {c.likes ? <div style={{marginTop: 6, fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: '#666'}}>{c.likes} curtida{c.likes === 1 ? '' : 's'}</div> : null}
              </div>
              {kk >= 14 && <div style={{position: 'absolute', right: -40, top: -96, padding: '6px 26px', borderRadius: 14, border: '8px solid #0d8a2a', color: '#0d8a2a', background: 'rgba(235,255,238,.95)', fontFamily: FONT.display, fontWeight: 900, fontSize: 58, transform: `rotate(-10deg) scale(${interpolate(kk, [14, 21], [2.6, 1], cl)})`}}>{c.selo}</div>}
            </div>
          </AbsoluteFill>
        );
      })}
      <div style={{position: 'absolute', right: 40, bottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14}}>
        {etiquetas.filter((e) => f >= e.at).map((e, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 24px', borderRadius: 16, background: '#000d', border: `5px solid ${e.cor ?? '#fff'}`, fontFamily: FONT.display, fontWeight: 900, fontSize: 42, color: '#fff', transform: `scale(${interpolate(f - e.at, [0, 6, 10], [0.3, 1.15, 1], cl)})`}}>
            {(e.cores ?? []).map((c) => <div key={c} style={{width: 46, height: 56}}><Crewmate4 cor={c} size={46} /></div>)}
            {e.txt}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// o Davi (@David_alves-p1f) e os 30 comentários dele pedindo o Polus: os cartões vão caindo cada vez mais rápido e se
// empilhando na tela, com o contador subindo; no fim, carimbo de "ATENDIDO"
// `vozes` (enxurrada.json): os comentários lidos por várias vozes ao mesmo tempo (sobrecarga); `pops`: um "pop" a cada
// comentário que cai; `feito`: no fim, o carimbo com esse texto bate com explosão (flash, estilhaços e tremor)
export const AU5Davi: React.FC<{autor: string; lista: string[]; fim?: number; total?: number; semCarimbo?: boolean; vozes?: {src: string; at: number; vol: number}[]; pops?: boolean; feito?: string}> = ({autor, lista, fim, total, semCarimbo, vozes, pops, feito}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const ate = fim ?? Math.round(durationInFrames * 0.78);
  // quadro em que entra o comentário i: começa devagar (1 por segundo) e acelera
  const entrada = (i: number) => Math.round(ate * Math.pow(i / lista.length, 1.9));
  const vistos = lista.filter((_, i) => f >= entrada(i)).length;
  // o contador vai além dos cartões mostrados: chega ao total de pedidos de verdade
  const n = total ? Math.round(interpolate(f, [0, ate], [1, total], cl)) : vistos;
  const h = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x) };
  const kf = f - ate - 8; // quadros desde a explosão
  const tremor = feito && kf >= 0 && kf < 18 ? (18 - kf) * 1.6 : 0;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #2b2350, #0d0a1c 75%)', overflow: 'hidden', transform: `translate(${Math.sin(f * 2.3) * tremor}px, ${Math.cos(f * 3.1) * tremor}px)`}}>
      {vozes?.map((v, i) => <Sequence key={'v' + i} from={v.at} layout="none"><Audio src={staticFile(v.src)} volume={v.vol} /></Sequence>)}
      {pops && lista.map((_, i) => <Sequence key={'p' + i} from={entrada(i)} durationInFrames={20} layout="none"><Audio src={staticFile('sfx/pop.mp3')} volume={0.5} /></Sequence>)}
      {lista.map((t, i) => {
        const k = f - entrada(i);
        if (k < 0) return null;
        const x = (feito ? -60 : 80) + h(i, 1) * (feito ? 1500 : 1380), y = (feito ? 120 : 170) + h(i, 2) * (feito ? 860 : 760), rot = -8 + h(i, 3) * 16;
        const cai = interpolate(k, [0, 8], [0, 1], {...cl, easing: Easing.out(Easing.back(1.4))});
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y - (1 - cai) * 300, width: feito ? 600 : 520, opacity: cai, transform: `rotate(${rot}deg) scale(${0.6 + 0.4 * cai})`, padding: '14px 20px', borderRadius: 16, background: '#fff', border: '5px solid #000', boxShadow: '0 8px 0 #000', zIndex: i}}>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 22, color: '#555'}}>{autor}</div>
            <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: t.length > 60 ? (feito ? 28 : 24) : (feito ? 40 : 32), lineHeight: 1.15, color: '#000', whiteSpace: 'pre-line'}}>{t}</div>
          </div>
        );
      })}
      {/* contador */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center', zIndex: 100}}>
        <div style={{padding: '10px 34px', borderRadius: 20, background: '#000d', border: '6px solid #ff4d4d', fontFamily: FONT.display, fontWeight: 900, fontSize: 50, color: '#fff', textAlign: 'center', transform: `scale(${1 + 0.08 * Math.max(0, 1 - (f - entrada(Math.max(0, vistos - 1))) / 6)})`}}>
          PEDIDOS DE POLUS: <span style={{color: '#ff4d4d', fontSize: 70}}>{n}</span>
          <div style={{fontSize: 30, color: '#ffc9c9'}}>todos do {autor}</div>
        </div>
      </div>
      {feito && kf >= 0 && (
        <>
          <Sequence from={ate + 8} layout="none"><Audio src={staticFile('sfx/explosion.mp3')} volume={0.9} /></Sequence>
          <Sequence from={ate + 8} layout="none"><Audio src={staticFile('sfx/impact-epic.mp3')} volume={0.7} /></Sequence>
          {/* estrela da explosão */}
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, zIndex: 102}}>
            {Array.from({length: 22}).map((_, i) => {
              const a = (i / 22) * Math.PI * 2, r = interpolate(kf, [0, 12], [60, 1300], {...cl, easing: Easing.out(Easing.cubic)});
              return <path key={i} d={`M960 500 L${960 + Math.cos(a - 0.07) * r} ${500 + Math.sin(a - 0.07) * r} L${960 + Math.cos(a + 0.07) * r} ${500 + Math.sin(a + 0.07) * r} Z`} fill={i % 2 ? '#ffd21f' : '#ff6a00'} opacity={interpolate(kf, [0, 20], [0.95, 0.25], cl)} />;
            })}
            <circle cx={960} cy={500} r={interpolate(kf, [0, 10], [40, 520], {...cl, easing: Easing.out(Easing.cubic)})} fill="#fff6c8" opacity={interpolate(kf, [0, 14], [0.95, 0], cl)} />
          </svg>
          <AbsoluteFill style={{background: '#fff', opacity: interpolate(kf, [0, 6], [0.85, 0], cl), zIndex: 103}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', zIndex: 104}}>
            <div style={{padding: '18px 64px', borderRadius: 30, border: '18px solid #0d8a2a', color: '#0d8a2a', background: 'rgba(235,255,238,.97)', fontFamily: FONT.display, fontWeight: 900, fontSize: 190, transform: `rotate(-8deg) scale(${interpolate(kf, [0, 7], [3.2, 1], {...cl, easing: Easing.out(Easing.back(2))})})`, boxShadow: '0 14px 0 #0006'}}>{feito}</div>
          </div>
        </>
      )}
      {!semCarimbo && !feito && f >= ate + 10 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', zIndex: 101}}>
          <div style={{padding: '14px 50px', borderRadius: 24, border: '14px solid #0d8a2a', color: '#0d8a2a', background: 'rgba(235,255,238,.96)', fontFamily: FONT.display, fontWeight: 900, fontSize: 130, transform: `rotate(-8deg) scale(${interpolate(f - ate - 10, [0, 8], [3, 1], cl)})`, opacity: interpolate(f - ate - 10, [0, 4], [0, 1], cl)}}>ATENDIDO</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
