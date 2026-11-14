// Short do DESENHA E ADIVINHA (1080x1920): "Dei PESADELO pra IA desenhar e 7 chutaram NATUREZA". O vídeo do meio é o
// trecho do vídeo longo (abertura + o acerto do Pincel) em public/desenha/short/base.mp4 (com as vozes); em cima o gancho
// fixo, embaixo a legenda grande; no fim, a pergunta. Legendas: public/desenha/short/short.json.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';
import {BANG, C, COR, KRAFT, Mesa, POP} from './base';

type Leg = {at: number; dur: number; texto: string; quem: string | null};
type S = {dur: number; legendas: Leg[]};
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const NOME: Record<string, string> = {Azul: 'AQUARELA', Lima: 'GRAFITE', Marrom: 'CARVÃO', Roxo: 'PINCEL'};

export const calcShortDesenha: CalculateMetadataFunction<{s: S | null}> = async () => {
  const s = await (await fetch(staticFile('desenha/short/short.json'))).json();
  return {durationInFrames: s.dur, props: {s}};
};

const Legenda: React.FC<{o: Leg}> = ({o}) => {
  const f = useCurrentFrame();
  const ws = o.texto.split(' ');
  const blocos: string[][] = [];
  for (let i = 0; i < ws.length; i += 4) blocos.push(ws.slice(i, i + 4));
  const pesos = blocos.map((b) => b.join(' ').length + 3), tot = pesos.reduce((a, b) => a + b, 0);
  let acc = 0, idx = 0;
  for (let i = 0; i < blocos.length; i++) { if (f >= (acc / tot) * o.dur) idx = i; acc += pesos[i]; }
  const ini = (pesos.slice(0, idx).reduce((a, b) => a + b, 0) / tot) * o.dur;
  const e = interpolate(f - ini, [0, 4], [0.8, 1], cl);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1290, textAlign: 'center'}}>
      {o.quem ? <div style={{display: 'inline-block', fontFamily: POP, fontWeight: 900, fontSize: 34, color: '#fff', background: COR[o.quem], border: '5px solid #000', borderRadius: 12, padding: '2px 18px', marginBottom: 14, ...C(6)}}>{NOME[o.quem]}</div> : null}
      <div style={{fontFamily: POP, fontWeight: 900, fontSize: 80, lineHeight: 1.1, color: '#fff', transform: `scale(${e})`, ...C(13)}}>
        {blocos[idx].map((w, j) => <span key={j} style={{color: /(NATUREZA|pesadelo|PESADELO|jabuti|Sete|sete|Pincel|acerto|\*\*\*\*\*)/i.test(w) ? '#FFE66D' : '#fff'}}>{w} </span>)}
      </div>
    </div>
  );
};

export const ShortDesenha: React.FC<{s: S | null}> = ({s}) => {
  const f = useCurrentFrame();
  if (!s) return null;
  const fimVideo = s.dur - 96;
  const fim = interpolate(f, [fimVideo, fimVideo + 10], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: KRAFT}}>
      <Mesa f={f} />
      <div style={{position: 'absolute', left: 0, top: 600, width: 1080, height: 608, border: '0', borderTop: '10px solid #000', borderBottom: '10px solid #000', overflow: 'hidden', background: '#000'}}>
        <Sequence durationInFrames={fimVideo}><OffthreadVideo src={staticFile('desenha/short/base.mp4')} style={{width: 1080, height: 608}} /></Sequence>
      </div>
      {s.legendas.map((o, i) => <Sequence key={i} from={o.at} durationInFrames={o.dur}><Legenda o={o} /></Sequence>)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
        <div style={{display: 'inline-block', fontFamily: POP, fontWeight: 800, fontSize: 32, color: '#1d1a12', background: '#FFE66D', border: '5px solid #000', borderRadius: 14, padding: '4px 20px', letterSpacing: 2, transform: 'rotate(-2deg)'}}>10 IAs JOGANDO GARTIC</div>
        <div style={{fontFamily: BANG, fontSize: 96, lineHeight: 1.0, color: '#fff', marginTop: 18, ...C(12), transform: `scale(${1 + 0.02 * Math.sin(f / 12)})`}}>A PALAVRA ERA<br /><span style={{color: '#FFE66D'}}>PESADELO</span></div>
      </div>
      {fim > 0 ? (
        <AbsoluteFill style={{background: `rgba(29,26,18,${0.9 * fim})`, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30, opacity: fim}}>
          <div style={{fontFamily: BANG, fontSize: 120, color: '#FFE66D', textAlign: 'center', lineHeight: 1, ...C(12)}}>E VOCÊ,<br />TERIA ACERTADO?</div>
          <div style={{fontFamily: POP, fontWeight: 900, fontSize: 48, color: '#fff', ...C(8)}}>vídeo completo no canal</div>
        </AbsoluteFill>
      ) : null}
      <Audio src={staticFile('music/ghost-story.mp3')} volume={(fr) => 0.1 * interpolate(fr, [s.dur - 30, s.dur], [1, 0], cl)} />
    </AbsoluteFill>
  );
};
