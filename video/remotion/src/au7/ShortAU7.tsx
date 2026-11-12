// Short do AMONG IA 7 (1080x1920): "A IA que falou a verdade levou 17 votos" (partida 4). Adaptado do Short do AU6.
// Roteiro em video/scripts/short_au7.py (fatos e falas do log). A partida na vertical (mesmo Jogo do vídeo longo, com
// relógio por âncoras: cada evento acontece quando é narrado), contador AÇÕES DO DOURADO, cartão de fala da IA, legenda
// grande do narrador, selos e o amanhecer no fim. Sem emoji: tudo desenhado.
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';
import {relogio} from '../zumbi/Jogo';
import {Jogo7, type AlvoFala, type Cam, type Log} from './Jogo7';
import {Crewmate4} from '../amongus/Crewmate4';
import {corDe, FONTE} from './Hud7';

type Seg = {de: number; dur: number; t0: number; vel: number; cam: Cam; tk: [number, number][]};
type Ov =
  | {tipo: 'legenda'; at: number; dur: number; texto: string}
  | {tipo: 'fala'; at: number; dur: number; cor: string; texto: string}
  | {tipo: 'selo'; at: number; dur: number; texto: string; cor: string}
  | {tipo: 'acao'; at: number; dur: number; n: number}
  | {tipo: 'numero'; at: number; dur: number; texto: string; sub?: string};
type TL = {partida: number; segs: Seg[]; over: Ov[]; audio: {src: string; at: number; vol?: number}[]; dur: number};

export const calcShortAU7: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl = await (await fetch(staticFile('timeline_short_au7.json'))).json();
  return {durationInFrames: tl.dur, props: {tl}};
};

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const MODELO: Record<string, string> = {};
const contorno = (px: number) => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill' as const});

const SegView: React.FC<{s: Seg; log: Log; over: Ov[]; ultimo: boolean}> = ({s, log, over, ultimo}) => {
  const f = useCurrentFrame();
  const R = useMemo(() => relogio(s.t0, s.vel, s.tk, log.tiques.length), [s, log]);
  const falas = (g: number): AlvoFala[] => over.filter((o): o is Extract<Ov, {tipo: 'fala'}> => o.tipo === 'fala').map((o) => ({cor: o.cor, peso: Math.max(0, Math.min(1, Math.min(g + s.de - o.at + 6, o.at + o.dur - g - s.de) / 12))})).filter((a) => a.peso > 0);
  const k = s.dur > 1 ? f / (s.dur - 1) : 0;
  const zoomDe = (g: number) => (s.cam.zoom ?? 1.6) * (1 + 0.08 * Math.min(1, Math.max(0, g / Math.max(1, s.dur - 1))));
  const sol = 0; void ultimo;
  return (
    <AbsoluteFill>
      <Jogo7 log={log} R={R} cam={s.cam} f={f} zoomDe={zoomDe} falas={falas} foco="Roxo,Cinza,Branco,Turquesa" w={1080} h={1920} />
      {/* amanhecer: luz laranja subindo por trás */}
      {sol > 0 ? <AbsoluteFill style={{background: 'linear-gradient(0deg, #ffb347cc, #ff7e5f55 45%, transparent 75%)', opacity: sol * 0.85, mixBlendMode: 'screen'}} /> : null}
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 5], [0.35, 0], cl) * (k < 1 ? 1 : 0), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

// cartão de fala da IA (cor, modelo e o texto do log)
const CartaoFala: React.FC<{o: Extract<Ov, {tipo: 'fala'}>}> = ({o}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f, fps: 30, config: {damping: 14}});
  const sai = interpolate(f, [o.dur - 6, o.dur], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1090, transform: `translateY(${(1 - e) * 80}px)`, opacity: Math.min(e, sai), display: 'flex', gap: 22, alignItems: 'center', background: '#fffdf6', border: '7px solid #000', borderRadius: 28, padding: '22px 26px', boxShadow: '0 12px 0 #000a'}}>
      <div style={{position: 'relative', width: 120, height: 130, flex: 'none'}}>
        <div style={{position: 'absolute', left: 0, top: 0}}><Crewmate4 cor={o.cor} size={120} t={f} /></div>
      </div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 34, color: corDe(o.cor), ...contorno(5)}}>{o.cor.toUpperCase()} <span style={{color: '#555', fontSize: 26, WebkitTextStroke: '0px'}}>{MODELO[o.cor] ?? ''}</span></div>
        <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 40, lineHeight: 1.18, color: '#111'}}>"{o.texto}"</div>
      </div>
    </div>
  );
};

// legenda grande do narrador, em blocos de poucas palavras no ritmo da fala
const Legenda: React.FC<{o: Extract<Ov, {tipo: 'legenda'}>}> = ({o}) => {
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
    <div style={{position: 'absolute', left: 40, right: 40, top: 1480, textAlign: 'center', fontFamily: FONTE, fontWeight: 900, fontSize: 76, lineHeight: 1.1, color: '#fff', transform: `scale(${e})`, ...contorno(12)}}>
      {blocos[idx].map((w, j) => <span key={j} style={{color: /^(Roxo|Cinza|Xerife|verdade|impostor|Dezessete|dezessete|17)/i.test(w) ? '#ffd23a' : '#fff'}}>{w} </span>)}
    </div>
  );
};

const SeloV: React.FC<{o: Extract<Ov, {tipo: 'selo'}>}> = ({o}) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 6], [2.2, 1], cl);
  const sai = interpolate(f, [o.dur - 5, o.dur], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', opacity: sai}}>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: o.texto.length > 18 ? 64 : 80, color: '#fff', background: o.cor, border: '8px solid #fff', borderRadius: 18, padding: '6px 34px', maxWidth: 980, textAlign: 'center', transform: `rotate(-5deg) scale(${e})`, boxShadow: '0 14px 0 #0009', ...contorno(4)}}>{o.texto}</div>
    </div>
  );
};

const NumeroV: React.FC<{o: Extract<Ov, {tipo: 'numero'}>}> = ({o}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f, fps: 30, config: {damping: 9}});
  const tr = interpolate(f, [0, 14], [14, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', transform: `translate(${Math.sin(f * 2.7) * tr}px, ${Math.cos(f * 3.1) * tr}px) scale(${e})`}}>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: '#ffd23a', ...contorno(14)}}>{o.texto.split(' · ').map((x, i) => <div key={i}>{x}</div>)}</div>
      {o.sub ? <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 40, color: '#fff', marginTop: 10, ...contorno(8)}}>{o.sub}</div> : null}
    </div>
  );
};

// topo: gancho fixo + contador de VOTOS NO ROXO + tique
const Topo: React.FC<{acoes: number; desde: number; tique: number}> = ({acoes, desde, tique}) => {
  const f = useCurrentFrame();
  const pulo = desde >= 0 ? interpolate(f - desde, [0, 4, 10], [1, 1.45, 1], cl) : 1;
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center'}}>
        <div style={{display: 'inline-block', fontFamily: FONTE, fontWeight: 800, fontSize: 30, color: '#ffd84d', background: '#0b1020cc', border: '4px solid #000', borderRadius: 14, padding: '4px 18px', letterSpacing: 2}}>AMONG IA 7 · 20 IAs</div>
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 64, lineHeight: 1.05, color: '#fff', marginTop: 12, ...contorno(11)}}>A IA QUE FALOU A VERDADE<br /><span style={{color: '#ffd23a'}}>LEVOU 17 VOTOS</span></div>
      </div>
      <div style={{position: 'absolute', right: 34, top: 330, display: 'flex', alignItems: 'center', gap: 14, background: '#0b1020e6', border: '6px solid #000', borderRadius: 22, padding: '10px 22px 10px 12px'}}>
        <div style={{width: 70, height: 84}}><Crewmate4 cor="Roxo" size={74} t={f} /></div>
        <div>
          <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 24, color: '#c89bff', letterSpacing: 1}}>VOTOS NO ROXO</div>
          <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 64, lineHeight: 1, color: '#fff', transform: `scale(${pulo})`, transformOrigin: 'left center', ...contorno(8)}}>{acoes}<span style={{fontSize: 30, color: '#bbb', WebkitTextStroke: '0px'}}> / 18</span></div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 34, top: 350, fontFamily: FONTE, fontWeight: 900, fontSize: 34, color: '#fff', background: '#000a', borderRadius: 14, padding: '6px 16px', ...contorno(5)}}>TIQUE {tique}<span style={{color: '#aaa', fontSize: 24}}> / 90</span></div>
    </>
  );
};

export const ShortAU7: React.FC<{tl: TL | null}> = ({tl}) => {
  const f = useCurrentFrame();
  const [log, setLog] = useState<Log | null>(null);
  const [h] = useState(() => delayRender('log short au7'));
  useEffect(() => {
    if (!tl) return;
    fetch(staticFile(`au7/partida${tl.partida}.json`)).then((r) => r.json()).then((d: Log) => {
      for (const j of d.jogadores) MODELO[j.cor] = j.modelo;
      setLog(d);
      continueRender(h);
    });
  }, [tl, h]);
  if (!tl || !log) return null;
  const seg = tl.segs.find((s) => f >= s.de && f < s.de + s.dur) ?? tl.segs[tl.segs.length - 1];
  const R = relogio(seg.t0, seg.vel, seg.tk, log.tiques.length);
  const acoesOv = tl.over.filter((o): o is Extract<Ov, {tipo: 'acao'}> => o.tipo === 'acao' && o.at <= f);
  const ult = acoesOv[acoesOv.length - 1];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.segs.map((s, i) => (
        <Sequence key={i} from={s.de} durationInFrames={i === tl.segs.length - 1 ? tl.dur - s.de : s.dur}>
          <SegView s={s} log={log} over={tl.over.filter((o) => o.at >= s.de && o.at < s.de + s.dur)} ultimo={i === tl.segs.length - 1} />
        </Sequence>
      ))}
      <Topo acoes={ult?.n ?? 0} desde={ult ? f - ult.at : -1} tique={Math.max(1, Math.min(90, Math.ceil(R.T(f - seg.de))))} />
      {tl.over.map((o, i) => (
        <Sequence key={`o${i}`} from={o.at} durationInFrames={Math.max(1, o.dur)}>
          {o.tipo === 'legenda' ? <Legenda o={o} /> : null}
          {o.tipo === 'fala' ? <CartaoFala o={o} /> : null}
          {o.tipo === 'selo' ? <SeloV o={o} /> : null}
          {o.tipo === 'numero' ? <NumeroV o={o} /> : null}
        </Sequence>
      ))}
      {tl.audio.map((a, i) => (
        <Sequence key={`a${i}`} from={a.at}><Audio src={staticFile(a.src)} volume={a.vol ?? 1} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
