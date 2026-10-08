// Short vertical (1080×1920): corte "o impostor com medo de matar" (cenas p102–p104 do vídeo 2).
// O trecho 16:9 vem pré-renderizado sem legendas (public/short/base.mp4, modo short); aqui só montamos o
// layout vertical: gancho no topo, vídeo no meio, legenda palavra a palavra embaixo e barra de progresso.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {strokeText} from '../components/basics';

export type DadosShort = {intro: number; base: number; palavras: {w: string; s: number; e: number}[]};

const VIDEO_Y = 560;
const VIDEO_H = 810;
const ELENCO = 269;
const HOOK_DE = 983 + 40; // quadro do trecho em que o Azul vai até o duto do Refeitório (mostrado no gancho)

const Legenda: React.FC<{palavras: DadosShort['palavras']}> = ({palavras}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  // grupos de até 3 palavras, quebrando em pontuação
  const grupos: DadosShort['palavras'][] = [];
  let g: DadosShort['palavras'] = [];
  for (const p of palavras) {
    g.push(p);
    if (g.length === 3 || /[.,!?…"]$/.test(p.w)) {
      grupos.push(g);
      g = [];
    }
  }
  if (g.length) grupos.push(g);
  const atual = grupos.find((gr, i) => f >= gr[0].s - 2 && f < (grupos[i + 1]?.[0].s ?? gr[gr.length - 1].e + 20) - 2);
  if (!atual) return null;
  const pop = spring({frame: f - (atual[0].s - 2), fps, config: {damping: 12, stiffness: 260, mass: 0.5}});
  return (
    <div style={{position: 'absolute', top: VIDEO_Y + VIDEO_H + 90, left: 40, right: 40, textAlign: 'center', transform: `scale(${0.85 + 0.15 * pop})`}}>
      {atual.map((p, i) => {
        const ativa = f >= p.s - 2;
        return (
          <span key={i} style={{fontFamily: FONT.comic, fontSize: 104, lineHeight: 1.05, letterSpacing: 2, margin: '0 14px', color: ativa ? '#ffd84d' : '#fff', ...strokeText(12)}}>
            {p.w.replace(/["“”]/g, '').toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

export const ShortAzul: React.FC<{dados: DadosShort | null}> = ({dados}) => {
  const [handle] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);
  const f = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  if (!dados) return <AbsoluteFill style={{background: '#0b0f1a'}} />;
  const tituloIn = spring({frame: f, fps, config: {damping: 12, stiffness: 180}});
  const caixa: React.CSSProperties = {position: 'absolute', top: VIDEO_Y, left: 0, width: 1080, height: VIDEO_H, overflow: 'hidden', borderTop: '6px solid #ff3b30', borderBottom: '6px solid #ff3b30'};
  const video: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: 1440, height: 810};
  // gancho: zoom lento no momento do duto
  const zoomHook = interpolate(f, [0, dados.intro], [1.18, 1.05], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1c2340 0%, #0b0f1a 60%, #05070d 100%)'}}>
      <Sequence durationInFrames={dados.intro} name="gancho">
        <div style={caixa}>
          <OffthreadVideo src={staticFile('short/base.mp4')} startFrom={HOOK_DE} muted style={{...video, transform: `scale(${zoomHook})`}} />
        </div>
        <Audio src={staticFile('short/intro.mp3')} startFrom={0} />
        <Audio src={staticFile('music/sneaky-snitch.mp3')} volume={0.12} />
      </Sequence>
      <Sequence from={dados.intro} name="trecho">
        {/* elenco (p102, 269 quadros) é centralizado; a gameplay usa o recorte da esquerda, onde fica o painel de pensamento */}
        <Sequence durationInFrames={ELENCO} name="elenco">
          <div style={caixa}>
            <OffthreadVideo src={staticFile('short/base.mp4')} muted style={{...video, left: -180}} />
          </div>
        </Sequence>
        <Sequence from={ELENCO} name="gameplay">
          <div style={caixa}>
            <OffthreadVideo src={staticFile('short/base.mp4')} startFrom={ELENCO} muted style={video} />
          </div>
        </Sequence>
        <Audio src={staticFile('short/trecho.m4a')} />
      </Sequence>
      {/* flash na virada do gancho para a história */}
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [dados.intro - 2, dados.intro, dados.intro + 6], [0, 0.55, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), pointerEvents: 'none'}} />

      {/* topo: selo + gancho fixo */}
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT.pixel, fontSize: 28, color: '#fff', background: '#111c', padding: '12px 18px', borderRadius: 10, border: '3px solid #ffffff55'}}>8 IAs JOGANDO AMONG US</div>
      </div>
      <div
        style={{
          position: 'absolute', top: 230, left: 30, right: 30, textAlign: 'center', fontFamily: FONT.comic, fontSize: 132, lineHeight: 0.98,
          color: '#ff3b30', letterSpacing: 2, ...strokeText(14), transform: `scale(${0.6 + 0.4 * tituloIn})`,
        }}
      >
        O IMPOSTOR COM <span style={{color: '#ffd84d'}}>MEDO</span> DE MATAR
      </div>

      <Legenda palavras={dados.palavras} />

      {/* barra de progresso */}
      <div style={{position: 'absolute', bottom: 0, left: 0, height: 12, width: `${(100 * f) / durationInFrames}%`, background: '#ff3b30'}} />
    </AbsoluteFill>
  );
};
