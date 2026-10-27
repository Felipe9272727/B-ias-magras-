// Abertura do Among Us 5 (seguindo a crítica do AU4: no máximo 3 comentários em ~12 s, carimbo grande em cada um,
// e o mapa novo mostrado de verdade, num voo de câmera pelo Polus). Desenho próprio, sem emoji.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';
import {ArtePolus, TILE} from './polus/ArtePolus';
import {POLUS} from './polus/mapaPolus';
import {Crewmate4} from '../amongus/Crewmate4';

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export type Comentario5 = {autor: string; texto: string; likes: number; selo: string; cor: string};

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
                <div style={{marginTop: 4, fontFamily: FONT.display, fontWeight: 700, fontSize: 36, lineHeight: 1.2, color: '#000'}}>{c.texto}</div>
                <div style={{marginTop: 6, fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: '#666'}}>{c.likes} curtida{c.likes === 1 ? '' : 's'}</div>
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
export const AU5Polus: React.FC<{etiquetas?: {txt: string; at: number; cor?: string; cores?: string[]}[]}> = ({etiquetas = []}) => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const W = POLUS.cols * TILE, H = POLUS.rows * TILE;
  const k = interpolate(f, [0, durationInFrames], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
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
      <div style={{position: 'absolute', left: 40, top: 34, fontFamily: FONT.display, fontWeight: 900, fontSize: 70, color: '#fff', WebkitTextStroke: '3px #000', textShadow: '0 6px 0 #000', opacity: interpolate(f, [0, 10], [0, 1], cl)}}>MAPA NOVO: POLUS</div>
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
