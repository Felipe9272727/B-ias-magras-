// SHORT do Roblox (1080x1920): "Troquei o cérebro da IA pelo mais forte de todos". Lê public/timeline_roblox_short.json
// (mesmo formato do vídeo longo, gerado por build_timeline_roblox.py --nome=roblox_short). Layout vertical: título fixo no
// topo, gameplay recortado no centro (com câmera em deriva), legenda grande do narrador e balões embaixo.
// Sem emoji (tudo SVG), selo/meme nunca cortados pelo fim da cena.
import React, {useEffect, useState} from 'react';
import {fontsReady} from '../fonts';
import {AbsoluteFill, continueRender, delayRender, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';
import {MemeCard} from '../components/overlays';
import {Atualiza, CerebroHud, Crono, Fala, Limite, Morte, NumeroG, Pensa, Selo, Seta, type Cena, type TL} from './RobloxVideo';

const F = "'Poppins', sans-serif";
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const BOX_Y = 300, BOX_H = 1080; // gameplay: 1778x1000 recortado no centro (1080 de largura)
const CW = 1778;

export const calcRobloxShort: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl = await (await fetch(staticFile('timeline_roblox_short.json'))).json();
  return {durationInFrames: tl.cenas.reduce((a: number, c: Cena) => a + c.dur, 0), props: {tl}};
};

const Titulo: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center'}}>
      <div style={{display: 'inline-block', fontFamily: F, fontWeight: 900, fontSize: 64, lineHeight: 1.05, color: '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', transform: `rotate(${Math.sin(f / 30) * 0.8}deg)`}}>
        TROQUEI O CÉREBRO DA IA
        <br />
        <span style={{color: '#ffd400'}}>PELO MAIS FORTE DE TODOS</span>
      </div>
    </div>
  );
};

// legenda grande do narrador (Shorts são vistos sem som): palavra a palavra, no ritmo da fala
const Legenda: React.FC<{texto: string; dur: number}> = ({texto, dur}) => {
  const f = useCurrentFrame();
  const pal = texto.split(' ');
  const k = Math.min(pal.length, Math.floor((f / Math.max(1, dur - 6)) * pal.length) + 1);
  const ini = Math.max(0, k - 6);
  return (
    <div style={{position: 'absolute', left: 30, right: 30, top: BOX_Y + BOX_H + 26, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 62, lineHeight: 1.12, color: '#fff', WebkitTextStroke: '9px #000', paintOrder: 'stroke fill'}}>
      {pal.slice(ini, k).map((w, i) => (
        <span key={i} style={{color: i === k - ini - 1 ? '#ffd400' : '#fff'}}>{w} </span>
      ))}
    </div>
  );
};

const CenaShort: React.FC<{c: Cena}> = ({c}) => {
  const f = useCurrentFrame();
  let soco = 0, tremor = 0;
  for (const o of c.over) {
    const d = f - o.at;
    if (d >= 0 && d < 12 && (o.tipo === 'selo' || o.tipo === 'numero' || o.tipo === 'morte')) soco = Math.max(soco, 0.06 * (1 - d / 12));
    if (d >= 0 && d < 14 && (o.tipo === 'numero' || o.tipo === 'morte')) tremor = Math.max(tremor, 12 * (1 - d / 14));
  }
  const k = c.dur > 1 ? f / (c.dur - 1) : 0;
  const s = k * k * (3 - 2 * k);
  const z = (c.cam.z0 + (c.cam.z1 - c.cam.z0) * s) * (1 + soco);
  const dx = Math.sin(f / 60) * 10 + (tremor ? Math.sin(f * 2.7) * tremor : 0);
  const dy = Math.cos(f / 80) * 6 + (tremor ? Math.cos(f * 3.3) * tremor : 0);
  // o recorte acompanha o foco da câmera na horizontal (sem sair da imagem)
  const foco = Math.min(CW - 540, Math.max(540, c.cam.x * CW));
  const left = 540 - foco;
  const m = c.marcas ?? [];
  const leg = c.audio.filter((a) => (a as {txt?: string}).txt) as {at: number; txt: string; src: string}[];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0a1a33, #050a14)'}}>
      <div style={{position: 'absolute', left: 0, top: BOX_Y, width: 1080, height: BOX_H, overflow: 'hidden', borderTop: '6px solid #ffd400', borderBottom: '6px solid #ffd400', background: '#000'}}>
        <div style={{position: 'absolute', left, top: 0, width: CW, height: BOX_H, transformOrigin: `${c.cam.x * 100}% ${c.cam.y * 100}%`, transform: `translate(${dx}px, ${dy}px) scale(${z * 1.02})`}}>
          {c.clip ? <OffthreadVideo src={staticFile(c.clip)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : null}
          {c.img ? <Img src={staticFile(c.img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : null}
          {c.over.map((o, i) => (o.tipo === 'seta' ? <Sequence key={i} from={o.at} durationInFrames={o.dur} layout="none"><Seta x={o.x} y={o.y} rotulo={o.rotulo} lado={o.lado} dur={o.dur} /></Sequence> : null))}
        </div>
        {c.escuro ? <AbsoluteFill style={{background: `rgba(4,10,24,${c.escuro})`}} /> : null}
        <AbsoluteFill style={{boxShadow: 'inset 0 0 160px 20px #000a'}} />
        {c.over.map((o, i) =>
          o.tipo === 'meme' && o.pos !== 'full' ? (
            <Sequence key={`m${i}`} from={o.at} durationInFrames={o.dur}>
              <AbsoluteFill style={{transform: 'translateY(170px) scale(0.85)'}}><MemeCard info={o.info} dur={o.dur} pos="center" caption={o.caption} /></AbsoluteFill>
            </Sequence>
          ) : null,
        )}
        {c.cerebro ? <div style={{position: 'absolute', left: 0, top: 0, transform: 'scale(1.05)', transformOrigin: '0 0'}}><div style={{position: 'relative', width: 560, height: 200}}><CerebroHud c={c.cerebro} /></div></div> : null}
        {c.over.map((o, i) =>
          ['selo', 'numero', 'morte', 'crono', 'pensa'].includes(o.tipo) ? (
            <Sequence key={`o${i}`} from={o.at} durationInFrames={o.dur}>
              {o.tipo === 'selo' ? <div style={{position: 'absolute', left: -230, right: -230, top: 120, transform: 'scale(0.8)'}}><Selo texto={o.texto} cor={o.cor} /></div> : null}
              {o.tipo === 'numero' ? <div style={{position: 'absolute', left: -200, right: -200, top: 0, transform: 'scale(0.85)'}}><NumeroG texto={o.texto} sub={o.sub} dur={o.dur} /></div> : null}
              {o.tipo === 'morte' ? <Morte n={o.n} dur={o.dur} /> : null}
              {o.tipo === 'crono' ? <Crono rotulo={o.rotulo} de={o.de} ate={o.ate} dur={o.dur} /> : null}
              {o.tipo === 'pensa' ? <div style={{position: 'absolute', left: 0, right: 0, top: 210, transform: 'scale(0.86)', transformOrigin: '50% 0%'}}><Pensa quem={o.quem} texto={o.texto} extra={o.extra} dur={o.dur} short /></div> : null}
            </Sequence>
          ) : null,
        )}
        {c.visual === 'limite' ? <div style={{position: 'absolute', inset: 0, transform: 'scale(0.62)'}}><Limite marcas={m} /></div> : null}
      </div>
      <Titulo />
      {leg.map((a, i) => (
        <Sequence key={`l${i}`} from={a.at} durationInFrames={Math.max(20, ((leg[i + 1]?.at ?? c.dur) - a.at))}>
          <Legenda texto={a.txt} dur={Math.max(20, ((leg[i + 1]?.at ?? c.dur) - a.at))} />
        </Sequence>
      ))}
      <div style={{position: 'absolute', left: 0, top: BOX_Y + BOX_H + 230, width: 1080, height: 1920 - (BOX_Y + BOX_H + 230)}}>
        {c.over.map((o, i) =>
          o.tipo === 'ia' || o.tipo === 'bush' || o.tipo === 'jog' ? (
            <Sequence key={`f${i}`} from={o.at} durationInFrames={o.dur}><Fala quem={o.tipo} texto={o.texto} dur={o.dur} short /></Sequence>
          ) : null,
        )}
      </div>
      {c.over.map((o, i) =>
        o.tipo === 'atualiza' ? (
          <Sequence key={`a${i}`} from={o.at} durationInFrames={o.dur}><div style={{position: 'absolute', inset: 0, transform: 'scale(0.92)'}}><Atualiza slot={o.slot} de={o.de} para={o.para} nota={o.nota} dur={o.dur} /></div></Sequence>
        ) : null,
      )}
      {c.over.map((o, i) =>
        o.tipo === 'meme' && o.pos === 'full' ? (
          <Sequence key={`x${i}`} from={o.at} durationInFrames={o.dur}><MemeCard info={o.info} dur={o.dur} pos="full" caption={o.caption} /></Sequence>
        ) : null,
      )}
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 5], [0.35, 0], cl), pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

export const RobloxShort: React.FC<{tl: TL | null}> = ({tl}) => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(h));
  }, [h]);
  if (!tl) return null;
  let ini = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.cenas.map((c) => {
        const de = ini;
        ini += c.dur;
        return <Sequence key={c.id} from={de} durationInFrames={c.dur}><CenaShort c={c} /></Sequence>;
      })}
    </AbsoluteFill>
  );
};
