// Short do POKÉMON (1080x1920): "Essa IA escreveu a vitória antes de jogar". Roteiro em video/scripts/short_pokemon.py.
// As telas são as mesmas do vídeo longo (CenaView, 1920x1080) num quadro no meio; em cima o gancho fixo, embaixo a legenda grande.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';
import {CenaView, type Cena} from './PokemonVideo';

type Leg = {tipo: 'legenda'; at: number; dur: number; texto: string};
type TL = {cenas: Cena[]; musica?: string};
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const C = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill'});
const POP = "'Poppins', sans-serif";

export const calcShortPokemon: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl = await (await fetch(staticFile('timeline_short_pokemon.json'))).json();
  return {durationInFrames: tl.cenas.reduce((a: number, c: Cena) => a + c.dur, 0), props: {tl}};
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
    <div style={{position: 'absolute', left: 40, right: 40, top: 1330, textAlign: 'center', fontFamily: POP, fontWeight: 900, fontSize: 78, lineHeight: 1.1, color: '#fff', transform: `scale(${e})`, ...C(12)}}>
      {blocos[idx].map((w, j) => <span key={j} style={{color: /^(dezessete|112|cento|doze|mil|zero|Gemini|parede|três|vitória)/i.test(w) ? '#FFC83D' : '#fff'}}>{w} </span>)}
    </div>
  );
};

export const ShortPokemon: React.FC<{tl: TL | null}> = ({tl}) => {
  const f = useCurrentFrame();
  if (!tl) return null;
  let ini = 0;
  return (
    <AbsoluteFill style={{background: '#12162B'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(#ffffff0b 2px, transparent 2px), linear-gradient(90deg, #ffffff0b 2px, transparent 2px)', backgroundSize: '48px 48px'}} />
      {tl.cenas.map((c) => {
        const s = ini; ini += c.dur;
        return (
          <Sequence key={c.id} from={s} durationInFrames={c.dur}>
            <div style={{position: 'absolute', left: -132, top: 540, width: 1920, height: 1080, transform: 'scale(0.7)', transformOrigin: '0 0', overflow: 'hidden', borderTop: '8px solid #000', borderBottom: '8px solid #000'}}>
              <CenaView c={c} />
            </div>
            {c.over.map((o, i) => ((o as unknown as Leg).tipo === 'legenda' ? <Sequence key={i} from={o.at} durationInFrames={o.dur}><Legenda o={o as unknown as Leg} /></Sequence> : null))}
          </Sequence>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center'}}>
        <div style={{display: 'inline-block', fontFamily: POP, fontWeight: 800, fontSize: 30, color: '#FFC83D', background: '#0b0e1ccc', border: '4px solid #000', borderRadius: 14, padding: '4px 18px', letterSpacing: 2}}>3 IAs CRIARAM IAs PRA JOGAR POKÉMON</div>
        <div style={{fontFamily: POP, fontWeight: 900, fontSize: 70, lineHeight: 1.05, color: '#fff', marginTop: 16, ...C(11), transform: `scale(${1 + 0.02 * Math.sin(f / 12)})`}}>ESSA IA ESCREVEU<br /><span style={{color: '#FFC83D'}}>A VITÓRIA ANTES DE JOGAR</span></div>
      </div>
      {tl.musica ? <Audio src={staticFile(tl.musica)} volume={0.12} /> : null}
    </AbsoluteFill>
  );
};
