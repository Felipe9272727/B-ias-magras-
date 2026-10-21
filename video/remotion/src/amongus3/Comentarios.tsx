// Abertura do Among Us 2: os comentários do vídeo anterior pedindo o que virou este vídeo, no visual da folha de
// comentários do app do YouTube (fonte Roboto, ícones em contorno desenhados aqui; avatar = bolinha com a inicial,
// sem foto de ninguém). Os comentários entram um por um no topo da lista; um marca-texto amarelo passa no pedido.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';

// selo (opcional, AU4): carimbo que bate no comentário um pouco depois dele entrar (ex.: "✅ ENTROU", "❌ FICOU DE FORA")
export type Comentario = {usuario: string; texto: string; destaque?: string; likes?: number; quando?: string; selo?: {texto: string; cor: string}};

const ROBOTO = "'Roboto', 'Poppins', sans-serif";
const CINZA = '#606060';
const CORES_AVATAR = ['#e0533c', '#2f8f5b', '#3b6fd8', '#c2410c', '#7c3aed', '#0f766e', '#b45309', '#be185d'];

const s = {stroke: '#0f0f0f', strokeWidth: 1.8, fill: 'none', strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const Like: React.FC<{baixo?: boolean}> = ({baixo}) => (
  <svg width={38} height={38} viewBox="0 0 24 24" style={{transform: baixo ? 'rotate(180deg)' : undefined}}>
    <path {...s} d="M7 10v11H3V10h4zm0 0l4-7c1.4 0 2.3 1.1 2 2.4L12.3 9H19c1.2 0 2.1 1.1 1.9 2.3l-1.3 7.5c-.2.7-.8 1.2-1.6 1.2H7" />
  </svg>
);
const Responder = () => (
  <svg width={38} height={38} viewBox="0 0 24 24">
    <path {...s} d="M4 4h16v12H8l-4 4V4z" />
    <path {...s} d="M8 9h8M8 12h5" />
  </svg>
);

const Item: React.FC<{c: Comentario; i: number; idade: number}> = ({c, i, idade}) => {
  const marca = interpolate(idade, [14, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const partes = c.destaque && c.texto.includes(c.destaque) ? c.texto.split(c.destaque) : null;
  return (
    <div style={{position: 'relative', display: 'flex', gap: 22, padding: '26px 34px 20px'}}>
      {c.selo && idade >= 24 && (
        <div style={{position: 'absolute', right: 70, top: 14, padding: '3px 12px', border: `4px solid ${c.selo.cor}`, borderRadius: 10, color: c.selo.cor, fontFamily: ROBOTO, fontWeight: 900, fontSize: 22, background: '#fffe', transform: `rotate(-6deg) scale(${interpolate(idade, [24, 30], [1.8, 1], {extrapolateRight: 'clamp'})})`, opacity: interpolate(idade, [24, 28], [0, 1], {extrapolateRight: 'clamp'}), zIndex: 2}}>{c.selo.texto}</div>
      )}
      <div style={{flex: '0 0 62px', height: 62, borderRadius: '50%', background: CORES_AVATAR[i % CORES_AVATAR.length], display: 'grid', placeItems: 'center', fontFamily: ROBOTO, fontWeight: 500, fontSize: 30, color: '#fff'}}>
        {c.usuario.replace('@', '')[0].toUpperCase()}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{fontFamily: ROBOTO, fontSize: 26, color: CINZA}}>
          {c.usuario} • {c.quando ?? 'há 5 dias'}
        </div>
        <div style={{fontFamily: ROBOTO, fontSize: 34, lineHeight: 1.36, color: '#0f0f0f', marginTop: 4}}>
          {partes ? (
            <>
              {partes[0]}
              <span style={{backgroundImage: 'linear-gradient(#ffe34d, #ffe34d)', backgroundRepeat: 'no-repeat', backgroundSize: `${marca * 100}% 100%`, borderRadius: 4}}>{c.destaque}</span>
              {partes.slice(1).join(c.destaque)}
            </>
          ) : c.texto}
        </div>
        <div style={{marginTop: 14, display: 'flex', alignItems: 'center', gap: 34, fontFamily: ROBOTO, fontSize: 26, color: '#0f0f0f'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: 10}}><Like />{c.likes ? c.likes : ''}</span>
          <Like baixo />
          <Responder />
        </div>
      </div>
      <div style={{flex: '0 0 30px', display: 'flex', flexDirection: 'column', gap: 5, paddingTop: 10}}>
        {[0, 1, 2].map((k) => <div key={k} style={{width: 6, height: 6, borderRadius: 3, background: '#0f0f0f', marginLeft: 12}} />)}
      </div>
    </div>
  );
};

// folha de comentários centralizada; cada comentário novo entra no topo, empurrando os anteriores pra baixo
export const AU2Comentarios: React.FC<{comentarios: Comentario[]; passo?: number}> = ({comentarios, passo = 40}) => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(h));
  }, [h]);
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  // altura de cada comentário: cabeçalho + linhas de texto (~44 caracteres por linha) + ícones
  const altura = (c: Comentario) => 128 + 46 * Math.max(1, Math.ceil(c.texto.length / 44));
  const visiveis = comentarios.map((c, i) => ({c, i, d: f - i * passo})).filter((x) => x.d >= 0);
  const entrada = spring({frame: f, fps, config: {damping: 18, stiffness: 120}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #2a2f3d 0%, #0d0f15 80%)', alignItems: 'center'}}>
      <div style={{position: 'relative', marginTop: 60 + (1 - entrada) * 900, width: 1100, height: 1020, background: '#fff', borderRadius: '34px 34px 0 0', overflow: 'hidden', boxShadow: '0 30px 80px #000c'}}>
        <div style={{display: 'flex', justifyContent: 'center', paddingTop: 16}}><div style={{width: 80, height: 8, borderRadius: 4, background: '#ccc'}} /></div>
        <div style={{display: 'flex', alignItems: 'center', padding: '22px 34px 18px', fontFamily: ROBOTO, fontWeight: 700, fontSize: 44, color: '#0f0f0f'}}>
          Comentários
          <span style={{marginLeft: 'auto', fontWeight: 400, fontSize: 46}}>✕</span>
        </div>
        <div style={{display: 'flex', gap: 14, padding: '0 34px 22px', borderBottom: '1px solid #e5e5e5'}}>
          {['Principais', 'Mais recentes', 'Inscritos públicos'].map((t, k) => (
            <div key={t} style={{padding: '12px 26px', borderRadius: 12, background: k === 0 ? '#0f0f0f' : '#f2f2f2', color: k === 0 ? '#fff' : '#0f0f0f', fontFamily: ROBOTO, fontWeight: 500, fontSize: 28}}>{t}</div>
          ))}
        </div>
        <div style={{position: 'relative'}}>
          {visiveis.map(({c, i, d}) => {
            const acima = visiveis.filter((x) => x.i > i);
            const y = acima.reduce((soma, x) => soma + altura(x.c) * spring({frame: x.d, fps, config: {damping: 16, stiffness: 140}}), 0);
            const e = spring({frame: d, fps, config: {damping: 16, stiffness: 140}});
            return (
              <div key={i} style={{position: 'absolute', left: 0, right: 0, top: y, opacity: e, background: interpolate(d, [0, 30], [1, 0], {extrapolateRight: 'clamp'}) > 0 ? `rgba(255,243,170,${interpolate(d, [0, 30], [0.6, 0], {extrapolateRight: 'clamp'})})` : undefined}}>
                <Item c={c} i={i} idade={d} />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
