// Abertura do Among Us 2: os comentários do vídeo anterior (e do Short) pedindo o que virou este vídeo.
// Cards no estilo de comentário do YouTube (desenho próprio; avatar = bolinha com a inicial, sem foto de ninguém),
// entrando um por um e empilhando; o trecho que virou ideia fica marcado em amarelo.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';

export type Comentario = {usuario: string; texto: string; destaque?: string; likes?: number; quando?: string};

const CORES_AVATAR = ['#e0533c', '#2f8f5b', '#3b6fd8', '#c2410c', '#7c3aed', '#0f766e', '#b45309', '#be185d'];

const Card: React.FC<{c: Comentario; i: number; d: number; x: number; y: number; rot: number}> = ({c, i, d, x, y, rot}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: d, fps, config: {damping: 14, stiffness: 170}});
  if (d < 0) return null;
  const partes = c.destaque && c.texto.includes(c.destaque) ? c.texto.split(c.destaque) : [c.texto];
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 900, transform: `translateY(${(1 - e) * 60}px) rotate(${rot}deg) scale(${0.85 + 0.15 * e})`, opacity: e,
      background: '#fff', borderRadius: 22, padding: '22px 28px', boxShadow: '0 18px 50px rgba(0,0,0,.45)', display: 'flex', gap: 20}}>
      <div style={{flex: '0 0 64px', height: 64, borderRadius: '50%', background: CORES_AVATAR[i % CORES_AVATAR.length], display: 'grid', placeItems: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 32, color: '#fff'}}>
        {c.usuario.replace('@', '')[0].toUpperCase()}
      </div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 24, color: '#606060'}}>
          <b style={{color: '#0f0f0f'}}>{c.usuario}</b> · {c.quando ?? 'há 5 dias'}
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 500, fontSize: 32, lineHeight: 1.3, color: '#0f0f0f', marginTop: 6}}>
          {partes.length > 1 ? (
            <>
              {partes[0]}
              <span style={{background: '#ffe34d', borderRadius: 6, padding: '0 4px', fontWeight: 700}}>{c.destaque}</span>
              {partes.slice(1).join(c.destaque)}
            </>
          ) : c.texto}
        </div>
        <div style={{marginTop: 10, display: 'flex', gap: 26, fontFamily: FONT.display, fontSize: 24, color: '#0f0f0f', alignItems: 'center'}}>
          <span>👍 {c.likes ?? ''}</span>
          <span>👎</span>
          <span style={{color: '#606060'}}>Responder</span>
        </div>
      </div>
    </div>
  );
};

// cada card entra `passo` quadros depois do anterior e fica empilhado (os mais antigos vão escurecendo)
export const AU2Comentarios: React.FC<{comentarios: Comentario[]; passo?: number}> = ({comentarios, passo = 38}) => {
  const f = useCurrentFrame();
  const pos = [[90, 120, -2], [930, 260, 2.5], [160, 470, 1.5], [880, 640, -2], [300, 760, -1], [960, 90, 1]];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1b2440 0%, #070a14 75%)', overflow: 'hidden'}}>
      {/* estrelas */}
      {Array.from({length: 70}, (_, k) => (
        <div key={k} style={{position: 'absolute', left: (k * 397) % 1920, top: (k * 211) % 1080, width: 3, height: 3, borderRadius: 2, background: '#fff', opacity: 0.25 + 0.5 * ((k * 7) % 10) / 10}} />
      ))}
      {comentarios.map((c, i) => {
        const d = f - i * passo;
        const p = pos[i % pos.length];
        const atras = Math.max(0, (f - (i + 1) * passo) / passo);
        return (
          <div key={i} style={{filter: `brightness(${interpolate(atras, [0, 3], [1, 0.55], {extrapolateRight: 'clamp'})})`}}>
            <Card c={c} i={i} d={d} x={p[0]} y={p[1]} rot={p[2]} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
