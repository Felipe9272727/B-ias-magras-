// Short do AGE DAS IAs (1080x1920): "a IA que pagou proteção pra todo mundo" — o Qwen. Molde dos Shorts do canal:
// gancho que volta no fim, um personagem só, contador que sobe ("VEZES QUE PAGOU"), selos no ritmo da fala, legenda
// grande e flash/zoom entre blocos. Imagem: recortes do vídeo longo numa faixa no meio; fundo desfocado. Sem emoji.
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {CORES_J} from './Mapa';

type Fala = {texto: string; at: number; dur: number; j?: number; pensa?: boolean};
type Bloco = {id: string; dur: number; audios: {src: string; at: number}[]; falas: Fala[]; selo: string | null; contador: number};
type IA = {nome: string; modelo: string; empresa: string};
type SA = {ias: IA[]; blocos: Bloco[]};

export const calcShortAge: CalculateMetadataFunction<{sa: SA | null}> = async () => {
  const sa = await (await fetch(staticFile('short_age/short_age.json'))).json();
  return {durationInFrames: sa.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0), props: {sa}};
};

const FONTE = "'Poppins', sans-serif";
const OURO = '#d9b45a';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const contorno = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill'});
const FY = 640;
const FH = 608;

const Titulo: React.FC<{f: number}> = ({f}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 12, stiffness: 160}});
  return (
    <div style={{position: 'absolute', top: 160, left: 30, right: 30, textAlign: 'center', transform: `scale(${0.6 + 0.4 * e})`, opacity: e}}>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 80, lineHeight: 1.05, color: '#fff', ...contorno(14)}}>A IA QUE PAGOU</div>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 96, lineHeight: 1.05, color: OURO, ...contorno(14)}}>PROTEÇÃO</div>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 80, lineHeight: 1.05, color: '#fff', ...contorno(14)}}>PRA TODO MUNDO</div>
    </div>
  );
};

const Cartao: React.FC<{ia: IA; j: number; pensa?: boolean; f: number}> = ({ia, j, pensa, f}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 12, stiffness: 180}});
  return (
    <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `translateX(${(1 - e) * -700}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, background: 'linear-gradient(#1d1a16f5, #12100df5)', border: `5px solid ${pensa ? '#b9a7ff' : OURO}`, borderRadius: 26, padding: '16px 34px'}}>
        <div style={{width: 26, height: 96, borderRadius: 6, background: CORES_J[j], border: '3px solid #000'}} />
        <div>
          <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 66, color: '#fff', lineHeight: 1}}>{ia.nome}</div>
          <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 28, color: pensa ? '#b9a7ff' : OURO, letterSpacing: 2, marginTop: 8}}>{pensa ? 'PENSAMENTO SECRETO' : ia.modelo.toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
};

const Contador: React.FC<{n: number; f: number; subiu: boolean}> = ({n, f, subiu}) => {
  const {fps} = useVideoConfig();
  const p = subiu ? spring({frame: f, fps, config: {damping: 8, stiffness: 220}}) : 1;
  return (
    <div style={{position: 'absolute', top: FY + FH + 40, right: 46, display: 'flex', alignItems: 'center', gap: 16, background: '#111', border: `6px solid ${OURO}`, borderRadius: 24, padding: '10px 26px', transform: `rotate(3deg) scale(${subiu ? 0.7 + 0.3 * p + (1 - p) * 0.5 : 1})`}}>
      <svg width={64} height={64} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill={OURO} /><circle cx="12" cy="12" r="6.5" fill="none" stroke="#7a5a10" strokeWidth="2" /></svg>
      <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 30, color: '#fff', lineHeight: 1.05}}>ESCUDOS<br />PAGOS</div>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 96, color: OURO, lineHeight: 1}}>{n}</div>
    </div>
  );
};

const Selo: React.FC<{texto: string; f: number}> = ({texto, f}) => (
  <div style={{position: 'absolute', top: FY + FH - 120, left: 40, transform: `rotate(-9deg) scale(${interpolate(f, [0, 6], [2.2, 1], cl)})`, opacity: interpolate(f, [0, 3], [0, 1], cl)}}>
    <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: texto.length > 12 ? 62 : 84, color: '#fff', background: '#d92b2b', border: '8px solid #fff', borderRadius: 18, padding: '4px 30px', boxShadow: '0 10px 0 #000a', ...contorno(4)}}>{texto}</div>
  </div>
);

// legenda grande: 3 palavras por vez, a falada em amarelo (estimada pelo tempo da fala)
const Legenda: React.FC<{falas: Fala[]; f: number}> = ({falas, f}) => {
  const fl = falas.find((x) => f >= x.at && f < x.at + x.dur);
  if (!fl) return null;
  const ws = fl.texto.split(/\s+/);
  const i = Math.min(ws.length - 1, Math.floor(((f - fl.at) / Math.max(1, fl.dur)) * ws.length));
  const ini = Math.floor(i / 3) * 3;
  return (
    <div style={{position: 'absolute', top: 1460, left: 40, right: 40, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 22px'}}>
      {ws.slice(ini, ini + 3).map((w, k) => (
        <span key={k} style={{fontFamily: FONTE, fontWeight: 900, fontSize: 84, lineHeight: 1.15, textTransform: 'uppercase', color: ini + k === i ? (fl.pensa ? '#b9a7ff' : '#ffd400') : '#fff', ...contorno(12)}}>{w}</span>
      ))}
    </div>
  );
};

const BlocoView: React.FC<{b: Bloco; n0: number; ias: IA[]}> = ({b, n0, ias}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const zoom = 1.25 - 0.25 * spring({frame: f, fps, config: {damping: 20, stiffness: 90}});
  const src = staticFile(`short_age/v_${b.id}.mp4`);
  const fala = b.falas.find((x) => x.j && f >= x.at && f < x.at + x.dur);
  const seloAt = Math.round(b.dur * 0.4);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: 'blur(38px) brightness(0.45) saturate(1.4)', transform: 'scale(1.3)'}}>
        <OffthreadVideo src={src} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', top: FY, left: 0, width: 1080, height: FH, overflow: 'hidden', borderTop: `8px solid ${OURO}`, borderBottom: `8px solid ${OURO}`}}>
        <OffthreadVideo src={src} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom * 1.35})`}} />
      </div>
      {b.id === 'gancho' || b.id === 'fim' ? <Titulo f={b.id === 'fim' ? f - Math.round(b.dur * 0.4) : f} /> : null}
      {fala?.j ? <Cartao ia={ias[fala.j - 1]} j={fala.j} pensa={fala.pensa} f={f - fala.at} /> : null}
      {b.contador > 0 ? <Contador n={b.contador} f={f} subiu={b.contador > n0} /> : null}
      {b.selo && f >= seloAt ? <Selo texto={b.selo} f={f - seloAt} /> : null}
      <Legenda falas={b.falas} f={f} />
      {b.audios.map((a, i) => (
        <Sequence key={i} from={a.at}><Audio src={staticFile(a.src)} /></Sequence>
      ))}
      <Sequence from={0} durationInFrames={20}><Audio src={staticFile(b.id === 'fim' ? 'sfx/explosion.mp3' : 'sfx/whoosh.mp3')} volume={b.id === 'fim' ? 0.7 : 0.35} /></Sequence>
      {b.selo ? <Sequence from={seloAt} durationInFrames={20}><Audio src={staticFile('sfx/pop.mp3')} volume={0.5} /></Sequence> : null}
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 5], [0.85, 0], cl), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

export const ShortAge: React.FC<{sa: SA | null}> = ({sa}) => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(h));
  }, [h]);
  if (!sa) return null;
  let t = 0;
  return (
    <AbsoluteFill style={{background: '#0b0d12'}}>
      {sa.blocos.map((b, i) => {
        const de = t;
        t += b.dur;
        return (
          <Sequence key={b.id} from={de} durationInFrames={b.dur}>
            <BlocoView b={b} n0={i > 0 ? sa.blocos[i - 1].contador : 0} ias={sa.ias} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
