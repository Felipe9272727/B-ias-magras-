// Shorts do Among Us 2 (1080×1920), no molde do primeiro Shorts (amongus/ShortAzul.tsx): gancho narrado no começo,
// título grande no topo, o vídeo numa faixa no meio e legenda palavra a palavra embaixo, com o nome de quem fala
// quando é uma IA. Dados e trechos (sem legenda) vêm de scripts/short_au2.py → public/short_au2/.
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {strokeText} from '../components/basics';
import {COR} from '../amongus/Crewmate';

type Palavra = {w: string; s: number; e: number; quem: string};
type Trecho = {arq: string; dur: number; enq: 'chat' | 'centro' | 'pensa'; palavras: Palavra[]};
export type DadosShortAU2 = {intro: number; gancho: Palavra[]; trechos: Trecho[]};

export const calcShortAU2: CalculateMetadataFunction<{dados: DadosShortAU2 | null}> = async () => {
  const dados = (await (await fetch(staticFile('short_au2/dados.json'))).json()) as DadosShortAU2;
  return {durationInFrames: dados.intro + dados.trechos.reduce((a, t) => a + t.dur, 0) + 45, props: {dados}};
};

const VIDEO_Y = 560;
const VIDEO_H = 810;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// legenda: grupos de até 3 palavras do mesmo falante, quebrando em pontuação
const Legenda: React.FC<{palavras: Palavra[]}> = ({palavras}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grupos: Palavra[][] = [];
  let g: Palavra[] = [];
  for (const p of palavras) {
    if (g.length && (g.length === 3 || g[0].quem !== p.quem)) { grupos.push(g); g = [] }
    g.push(p);
    if (/[.,!?…"]$/.test(p.w)) { grupos.push(g); g = [] }
  }
  if (g.length) grupos.push(g);
  const atual = grupos.find((gr, i) => f >= gr[0].s - 2 && f < (grupos[i + 1]?.[0].s ?? gr[gr.length - 1].e + 20) - 2);
  if (!atual) return null;
  const pop = spring({frame: f - (atual[0].s - 2), fps, config: {damping: 12, stiffness: 260, mass: 0.5}});
  const quem = atual[0].quem;
  const cor = COR[quem];
  return (
    <div style={{position: 'absolute', top: VIDEO_Y + VIDEO_H + 60, left: 40, right: 40, textAlign: 'center'}}>
      {quem !== 'N' && cor && (
        <div style={{display: 'inline-block', marginBottom: 14, padding: '6px 22px', borderRadius: 14, background: cor.body, border: '5px solid #000', fontFamily: FONT.comic, fontSize: 52, letterSpacing: 2, color: '#fff', ...strokeText(6)}}>{quem.toUpperCase()}</div>
      )}
      <div style={{transform: `scale(${0.85 + 0.15 * pop})`}}>
        {atual.map((p, i) => (
          <span key={i} style={{fontFamily: FONT.comic, fontSize: 104, lineHeight: 1.05, letterSpacing: 2, margin: '0 14px', color: f >= p.s - 2 ? '#ffd84d' : '#fff', ...strokeText(12)}}>
            {p.w.replace(/["“”]/g, '').toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
};

export const ShortAU2: React.FC<{dados: DadosShortAU2 | null}> = ({dados}) => {
  const [handle] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);
  const f = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  if (!dados) return <AbsoluteFill style={{background: '#0b0f1a'}} />;
  const tituloIn = spring({frame: f, fps, config: {damping: 12, stiffness: 180}});
  const caixa: React.CSSProperties = {position: 'absolute', top: VIDEO_Y, left: 0, width: 1080, height: VIDEO_H, overflow: 'hidden', borderTop: '6px solid #ff3b30', borderBottom: '6px solid #ff3b30'};
  const video: React.CSSProperties = {position: 'absolute', top: 0, width: 1440, height: 810};
  const zoomGancho = interpolate(f, [0, dados.intro], [1.25, 1.05], cl);
  let ini = dados.intro;
  const seqs = dados.trechos.map((t) => { const de = ini; ini += t.dur; return {t, de} });
  const palavras = [...dados.gancho, ...dados.trechos.flatMap((t) => t.palavras)];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #1c2340 0%, #0b0f1a 60%, #05070d 100%)'}}>
      {/* gancho: a ejeção do primeiro Detetive, em zoom lento, com a narração do gancho */}
      <Sequence durationInFrames={dados.intro} name="gancho">
        <div style={caixa}>
          <OffthreadVideo src={staticFile('short_au2/v2_3.mp4')} muted style={{...video, left: -180, transform: `scale(${zoomGancho})`}} />
        </div>
        <Sequence from={15}><Audio src={staticFile('short_au2/gancho.mp3')} /></Sequence>
      </Sequence>
      {seqs.map(({t, de}) => (
        <Sequence key={t.arq} from={de} durationInFrames={t.dur} name={t.arq}>
          <div style={caixa}>
            <OffthreadVideo src={staticFile(`short_au2/${t.arq}`)} style={{...video, left: t.enq === 'chat' ? -360 : t.enq === 'pensa' ? 0 : -180}} />
          </div>
        </Sequence>
      ))}
      <Audio src={staticFile('music/sneaky-snitch.mp3')} volume={0.09} />
      {/* flash em cada virada de trecho */}
      {[dados.intro, ...seqs.map((x) => x.de)].map((q, i) => (
        <AbsoluteFill key={i} style={{background: '#fff', opacity: interpolate(f, [q - 2, q, q + 6], [0, 0.45, 0], cl), pointerEvents: 'none'}} />
      ))}
      {/* fechamento */}
      <Sequence from={ini} name="fim">
        <div style={{position: 'absolute', top: VIDEO_Y + 220, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.comic, fontSize: 150, color: '#ffd84d', ...strokeText(14)}}>DUAS VEZES.</div>
      </Sequence>

      {/* topo: selo + título fixo */}
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT.pixel, fontSize: 28, color: '#fff', background: '#111c', padding: '12px 18px', borderRadius: 10, border: '3px solid #ffffff55'}}>12 IAs JOGANDO AMONG US</div>
      </div>
      <div style={{position: 'absolute', top: 230, left: 30, right: 30, textAlign: 'center', fontFamily: FONT.comic, fontSize: 118, lineHeight: 0.98, color: '#ff3b30', letterSpacing: 2, ...strokeText(14), transform: `scale(${0.6 + 0.4 * tituloIn})`}}>
        O DETETIVE QUE <span style={{color: '#ffd84d'}}>NINGUÉM</span> OUVIU
      </div>

      <Legenda palavras={palavras} />

      {/* barra de progresso */}
      <div style={{position: 'absolute', bottom: 0, left: 0, height: 12, width: `${(100 * f) / durationInFrames}%`, background: '#ff3b30'}} />
    </AbsoluteFill>
  );
};
