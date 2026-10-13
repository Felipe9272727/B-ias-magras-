// Short 3 (1080×1920, 24 fps): "a IA que esqueceu quem era" — o DeepSeek 4 nos Jogos Vorazes das IAs.
// Narração e falas: scripts/short3.py (public/short3/short3.json). Cenário: as placas 3D do vídeo (Placa) recortadas
// na vertical em volta do DeepSeek 4; por cima, balão de fala, cartão de pensamento e legenda grande.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {strokeText} from '../components/basics';
import {Placa} from './Tres';
import {Retrato} from './comum';

type Palavra = {w: string; s: number; e: number};
type Bloco = {id: string; voz: string; cena: string; dur: number; desde: number; texto: string; palavras: Palavra[]};
export type DadosShort3 = {blocos: Bloco[]};

const ESC = 1.95;  // a placa (1920×1080) cresce até cobrir a altura com folga
// centro horizontal (0..1 da placa) do DeepSeek 4 em cada cenário e o período (filtro de luz)
const CENA: Record<string, {x: number; periodo: string; dia: string}> = {
  p206b_0: {x: 0.5, periodo: 'manhã', dia: 'DIA 2'},
  s3_lago8: {x: 0.5, periodo: 'tarde', dia: 'DIA 3'},
  s3_lago11: {x: 0.5, periodo: 'tarde', dia: 'DIA 4'},
  s3_kit: {x: 0.5, periodo: 'tarde', dia: 'DIA 8'},
};

const Legenda: React.FC<{palavras: Palavra[]}> = ({palavras}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grupos: Palavra[][] = [];
  let g: Palavra[] = [];
  for (const p of palavras) {
    g.push(p);
    if (g.length === 3 || /[.,!?…:]$/.test(p.w)) {
      grupos.push(g);
      g = [];
    }
  }
  if (g.length) grupos.push(g);
  const i = grupos.findIndex((gr, j) => f >= gr[0].s - 2 && f < (grupos[j + 1]?.[0].s ?? gr[gr.length - 1].e + 10) - 2);
  if (i < 0) return null;
  const atual = grupos[i];
  const pop = spring({frame: f - (atual[0].s - 2), fps, config: {damping: 12, stiffness: 260, mass: 0.5}});
  return (
    <div style={{position: 'absolute', top: 1290, left: 30, right: 30, textAlign: 'center', transform: `scale(${0.85 + 0.15 * pop})`}}>
      {atual.map((p, j) => (
        <span key={j} style={{fontFamily: FONT.comic, fontSize: 96, lineHeight: 1.05, letterSpacing: 2, margin: '0 12px', color: f >= p.s - 2 ? '#ffd84d' : '#fff', ...strokeText(13)}}>
          {p.w.toUpperCase()}
        </span>
      ))}
    </div>
  );
};

// balão (fala) ou cartão (pensamento) do DeepSeek 4, digitando no ritmo da voz
const Cartao: React.FC<{b: Bloco; pensa: boolean}> = ({b, pensa}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 14, stiffness: 200}});
  const fimVoz = b.palavras.length ? b.palavras[b.palavras.length - 1].e : b.dur;
  const n = Math.ceil(b.texto.length * Math.min(1, f / Math.max(1, fimVoz)));
  return (
    <div style={{position: 'absolute', top: 300, left: 60, right: 60, transform: `scale(${0.6 + 0.4 * e})`, opacity: e, transformOrigin: '50% 100%'}}>
      <div style={{padding: '26px 34px 30px', borderRadius: 30, background: pensa ? 'rgba(14,16,30,.94)' : '#fff', border: pensa ? '5px solid #6d8cff' : '5px solid #111', boxShadow: '0 14px 0 #0008'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12}}>
          <Retrato id="ds4" size={78} borda="#6d8cff" />
          <div>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: pensa ? '#fff' : '#111'}}>DeepSeek 4</div>
            <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: pensa ? '#ffd34d' : '#6d8cff'}}>{pensa ? '🔒 PENSAMENTO SECRETO' : 'NO CHAT'}</div>
          </div>
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 50, lineHeight: 1.2, color: pensa ? '#e9ecff' : '#111', fontStyle: pensa ? 'italic' : 'normal'}}>
          {pensa ? '“' : ''}{b.texto.slice(0, n)}<span style={{opacity: 0}}>{b.texto.slice(n)}</span>{pensa ? '”' : ''}
        </div>
      </div>
      {!pensa && <svg width={70} height={40} style={{marginLeft: 470, marginTop: -6}}><path d="M0 0 L70 0 L30 40 Z" fill="#fff" stroke="#111" strokeWidth={5} /></svg>}
    </div>
  );
};

const Fim: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f - 30, fps, config: {damping: 13, stiffness: 140}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: `rgba(0,0,0,${0.55 * Math.min(1, Math.max(0, (f - 24) / 10))})`}}>
      <div style={{transform: `scale(${0.5 + 0.5 * e}) rotate(${(1 - e) * -6}deg)`, opacity: e, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -260}}>
        <Img src={staticFile('short3/thumb3.png')} style={{width: 900, borderRadius: 26, border: '8px solid #fff', boxShadow: '0 20px 60px #000c'}} />
        <div style={{marginTop: 30, fontFamily: FONT.comic, fontSize: 92, color: '#ffd84d', textAlign: 'center', ...strokeText(12)}}>VÍDEO COMPLETO NO CANAL</div>
      </div>
    </AbsoluteFill>
  );
};

export const ShortDS4: React.FC<{dados: DadosShort3 | null}> = ({dados}) => {
  const [handle] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  if (!dados) return <AbsoluteFill style={{background: '#000'}} />;
  // blocos em sequência; cada cenário é uma faixa contínua (a placa não recomeça a cada bloco)
  let ini = 0;
  const seqs = dados.blocos.map((b) => {
    const de = ini;
    ini += b.dur;
    return {b, de};
  });
  const faixas: {cena: string; de: number; dur: number}[] = [];
  for (const {b, de} of seqs) {
    const ult = faixas[faixas.length - 1];
    if (ult && ult.cena === b.cena) ult.dur += b.dur;
    else faixas.push({cena: b.cena, de, dur: b.dur});
  }
  const cortes = faixas.slice(1).map((x) => x.de);
  const flash = Math.max(0, ...cortes.map((c) => interpolate(f, [c - 1, c, c + 5], [0, 0.45, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  const atualF = faixas.find((x) => f >= x.de && f < x.de + x.dur) ?? faixas[faixas.length - 1];
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      {faixas.map((x) => {
        const c = CENA[x.cena];
        return (
          <Sequence key={x.cena + x.de} from={x.de} durationInFrames={x.dur}>
            <div style={{position: 'absolute', width: 1920, height: 1080, left: 540 - c.x * 1920 * ESC, top: 960 - 540 * ESC, transform: `scale(${ESC})`, transformOrigin: '0 0'}}>
              <Placa id={x.cena} periodo={c.periodo} dur={x.dur} falando={[['ds4', 0, 99999, false]]} />
            </div>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #000a 0%, #0000 22%, #0000 60%, #000b 100%)'}} />
      {seqs.map(({b, de}) => (
        <Sequence key={b.id} from={de} durationInFrames={b.dur}>
          <Audio src={staticFile(`short3/${b.id}${b.voz === 'ds4~' ? '_pensa' : ''}.mp3`)} />
          {b.voz === 'N' ? <Legenda palavras={b.palavras} /> : <Cartao b={b} pensa={b.voz === 'ds4~'} />}
          {b.id === 'fim' && <Fim />}
        </Sequence>
      ))}
      {cortes.map((c) => (
        <Sequence key={`w${c}`} from={Math.max(0, c - 4)} durationInFrames={40}>
          <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.25} />
        </Sequence>
      ))}
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      {/* faixa fixa no topo, dia da história e barra de progresso */}
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff', background: '#000c', padding: '12px 22px', borderRadius: 14, border: '4px solid #ff3b30', letterSpacing: 2}}>12 IAs · JOGOS VORAZES</div>
      </div>
      {atualF && f >= 60 && (
        <div style={{position: 'absolute', top: 205, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div style={{fontFamily: FONT.comic, fontSize: 64, color: '#ffd84d', letterSpacing: 3, ...strokeText(9)}}>{CENA[atualF.cena].dia}</div>
        </div>
      )}
      <div style={{position: 'absolute', bottom: 0, left: 0, height: 12, width: `${(100 * f) / durationInFrames}%`, background: '#ff3b30'}} />
    </AbsoluteFill>
  );
};
