// Peças do Short do Interrogatório (feitas do zero, no tema da delegacia): etiqueta de prova (selo), legenda de
// relatório policial e som. Substituem as dos Shorts do Among Us.
import React from 'react';
import {Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';

type Palavra = {w: string; s: number; e: number; chef?: string};
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// quadro em que a n-ésima palavra que começa com `ini` é dita
export const naPalavra = (b: {palavras: Palavra[]}, ini: string, n = 1) => b.palavras.filter((p) => p.w.toLowerCase().startsWith(ini.toLowerCase()))[n - 1]?.s ?? 0;

export const Som: React.FC<{src: string; at: number; vol?: number}> = ({src, at, vol = 0.5}) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={150}>
    <Audio src={staticFile(`sfx/${src}.mp3`)} volume={vol} />
  </Sequence>
);

// etiqueta de prova: papel kraft com furo e barbante, número da prova e o texto em tinta
export const Etiqueta: React.FC<{txt: string; cor?: string; at: number; y: number; rot?: number; size?: number}> = ({txt, cor = '#c81e1e', at, y, rot = -3, size = 66}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const k = spring({frame: f - at, fps, config: {damping: 10, stiffness: 190}});
  const n = (Math.abs(Math.round(at * 7.3)) % 90) + 10;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', transform: `translateX(${(1 - k) * 700}px) rotate(${rot + (1 - k) * 18}deg)`}}>
      <div style={{position: 'relative', padding: '10px 34px 12px 70px', background: '#e8d3a3', border: '5px solid #2a1a0a', borderRadius: '12px 30px 30px 12px', boxShadow: '0 10px 0 #0009', fontFamily: FONT.comic, fontSize: size, letterSpacing: 2, color: cor, WebkitTextStroke: '1.5px #2a1a0a', whiteSpace: 'nowrap'}}>
        <div style={{position: 'absolute', left: 18, top: '50%', width: 30, height: 30, marginTop: -15, borderRadius: 15, background: '#2a1a0a', boxShadow: 'inset 0 0 0 7px #e8d3a3'}} />
        <div style={{position: 'absolute', left: -60, top: '50%', width: 80, height: 4, background: '#8a6a3a', transform: 'rotate(-12deg)'}} />
        <span style={{position: 'absolute', right: 14, top: 4, fontFamily: FONT.mono, fontSize: 18, color: '#5a4630', WebkitTextStroke: '0'}}>PROVA {n}</span>
        {txt}
      </div>
    </div>
  );
};

// legenda de relatório: caixa preta com fonte de máquina de escrever; a palavra da vez fica sublinhada em vermelho
export const LegendaRelatorio: React.FC<{palavras: Palavra[]; y: number}> = ({palavras, y}) => {
  const f = useCurrentFrame();
  const grupos: Palavra[][] = [];
  for (let i = 0; i < palavras.length; i += 3) grupos.push(palavras.slice(i, i + 3));
  const g = grupos.find((x, i) => f >= x[0].s && f < (grupos[i + 1]?.[0].s ?? x[x.length - 1].e + 12));
  if (!g) return null;
  const k = interpolate(f, [g[0].s, g[0].s + 4], [0.85, 1], cl);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: y, display: 'flex', justifyContent: 'center', transform: `scale(${k})`}}>
      <div style={{padding: '12px 26px', background: '#0d0d0d', border: '4px solid #fff', borderRadius: 8, fontFamily: FONT.mono, fontWeight: 700, fontSize: 64, color: '#fff', textTransform: 'uppercase', display: 'flex', gap: 22}}>
        {g.map((p, i) => {
          const atual = f >= p.s && f < p.e + 3;
          return <span key={i} style={{borderBottom: `8px solid ${atual ? '#ff3b3b' : 'transparent'}`, color: atual ? '#ffd21f' : '#fff'}}>{p.w}</span>;
        })}
      </div>
    </div>
  );
};
