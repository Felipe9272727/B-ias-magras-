// 60 Segundos das IAs — prévia (abertura + bloco do GPT). Monta os segmentos de public/sessenta/previa/dados.json
// (gerado por video/scripts/previa_s60.py): título, clipes 3D já renderizados da coleta, dias 2D do abrigo e cartões,
// com a narração de cada segmento, trilha e efeitos.
import React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, Freeze, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from '../theme';
import {Dia, carregarDia, duracaoDia, type DadosDia} from './Dia';

type Seg = {tipo: 'titulo' | 'video' | 'dia' | 'card'; arq?: string; arquivo?: string; dia?: number; texto?: string; sub?: string; cor?: string; narr: string; dur: number; durClipe: number};
type Props = {segs: (Seg & {dados?: DadosDia})[] | null};

export const calcPrevia: CalculateMetadataFunction<Props> = async () => {
  const d = await (await fetch(staticFile('sessenta/previa/dados.json'))).json();
  const segs = await Promise.all(d.segmentos.map(async (s: Seg) => (s.tipo === 'dia' ? {...s, dados: await carregarDia(s.arquivo!, s.dia!)} : s)));
  return {durationInFrames: segs.reduce((a: number, s: Seg) => a + s.dur, 0), props: {segs}};
};

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const Titulo: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const n = Math.max(0, 60 - Math.floor((f / dur) * 4));
  const pulso = 0.5 + 0.5 * Math.sin(f / 4);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle, #3a0d0d ${20 + pulso * 10}%, #0b0605 75%)`, display: 'grid', placeItems: 'center'}}>
      <div style={{textAlign: 'center', transform: `scale(${interpolate(spring({frame: f, fps: 30, config: {damping: 12}}), [0, 1], [1.4, 1])})`}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 230, color: '#f2c230', WebkitTextStroke: '6px #000', lineHeight: 0.9}}>0:{String(n).padStart(2, '0')}</div>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 96, color: '#fff', WebkitTextStroke: '3px #000', marginTop: 10}}>60 SEGUNDOS DAS IAs</div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 40, color: '#ffb3a8', marginTop: 6}}>☢️ salve a família. sobreviva no abrigo. ☢️</div>
      </div>
    </AbsoluteFill>
  );
};

const Cartao: React.FC<{s: Seg}> = ({s}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f, fps: 30, config: {damping: 13}});
  return (
    <AbsoluteFill style={{background: `linear-gradient(135deg, ${s.cor ?? '#2a2a2a'}, #0c0c0c)`, display: 'grid', placeItems: 'center'}}>
      <div style={{textAlign: 'center', transform: `translateY(${(1 - e) * 80}px) rotate(${(1 - e) * -4}deg)`, opacity: e}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 150, color: '#fff', WebkitTextStroke: '4px #000', lineHeight: 1}}>{s.texto}</div>
        {s.sub && <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 46, color: '#f2c230', marginTop: 18, opacity: interpolate(f, [10, 22], [0, 1], cl)}}>{s.sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

const Clipe: React.FC<{s: Seg}> = ({s}) => {
  const f = useCurrentFrame();
  const v = <OffthreadVideo src={staticFile(`sessenta/previa/${s.arq}.mp4`)} muted />;
  return f < s.durClipe ? v : <Freeze frame={s.durClipe - 1}>{v}</Freeze>;
};

export const Previa: React.FC<Props> = ({segs}) => {
  if (!segs) return null;
  let at = 0;
  const trilha: {de: number; dur: number; arq: string; vol: number}[] = [];
  const blocos = segs.map((s, i) => {
    const de = at;
    at += s.dur;
    let el: React.ReactNode = null;
    if (s.tipo === 'titulo') el = <Titulo dur={s.dur} />;
    if (s.tipo === 'card') el = <Cartao s={s} />;
    if (s.tipo === 'video') el = <Clipe s={s} />;
    if (s.tipo === 'dia' && s.dados) el = <Dia dados={s.dados} arquivo={s.arquivo!} dia={s.dia!} vel={Math.max(1, Math.min(3, duracaoDia(s.dados.dia) / s.dur))} />;
    return (
      <Sequence key={i} from={de} durationInFrames={s.dur}>
        {el}
        <Audio src={staticFile(s.narr)} volume={1} />
        {s.arq?.startsWith('luna') && <Sequence from={Math.max(0, s.durClipe - 75)}><Audio src={staticFile('sfx/sad-trombone.mp3')} volume={0.55} /></Sequence>}
        {s.tipo === 'video' && s.arq !== 'abertura' && <Sequence from={Math.max(0, s.durClipe - 105)}><Audio src={staticFile('sfx/explosion.mp3')} volume={0.6} /></Sequence>}
        {s.tipo === 'card' && <Audio src={staticFile('sfx/swoosh-air.mp3')} volume={0.5} />}
      </Sequence>
    );
  });
  // trilha: tensa na coleta, triste no abrigo
  const iAbrigo = segs.findIndex((s) => s.tipo === 'dia');
  const tAbrigo = segs.slice(0, iAbrigo).reduce((a, s) => a + s.dur, 0);
  trilha.push({de: 0, dur: tAbrigo, arq: 'music/mega-hyper-ultrastorm.mp3', vol: 0.12});
  trilha.push({de: tAbrigo, dur: at - tAbrigo, arq: 'music/heartbreaking.mp3', vol: 0.16});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {blocos}
      {trilha.map((t, i) => (
        <Sequence key={'m' + i} from={t.de} durationInFrames={t.dur}>
          <Audio src={staticFile(t.arq)} volume={(f) => t.vol * interpolate(f, [0, 20, t.dur - 30, t.dur], [0, 1, 1, 0], cl)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
