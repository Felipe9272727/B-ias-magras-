// AGE DAS IAs: o vídeo. Lê public/age/<partida>/{quadros,mapa}.json e a timeline (timeline_age.json, gerada por
// video/scripts/build_timeline_age.py a partir do roteiro). Cada cena: câmera num ponto do mapa (ou seguindo um
// império), o jogo correndo de t0 numa velocidade, e por cima falas, pensamentos secretos, selos e cartões; HUD
// estilo AoE4 sempre visível (recursos do império em foco, placar das 6 IAs, minimapa, relógio).
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {Mapa, type Pecas, type Quadro, type Recurso} from './Mapa';
import {AU2Comentarios, type Comentario} from '../amongus3/Comentarios';
import {BarraRecursos, CartaoMarco, Fala, FONTE, type IA, Minimapa, Pensamento, Placar, Selo, Tempo} from './Hud';

type Over =
  | {tipo: 'pensa'; at: number; dur: number; j: number; texto: string}
  | {tipo: 'fala'; at: number; dur: number; j: number; texto: string; para?: string}
  | {tipo: 'selo'; at: number; dur: number; texto: string; cor?: string}
  | {tipo: 'marco'; at: number; dur: number; titulo: string; sub?: string}
  | {tipo: 'legenda'; at: number; dur: number; texto: string};
type Cena = {id: string; dur: number; t0: number; vel: number; cam: {j?: number; x?: number; z?: number; zoom?: number; x2?: number; z2?: number; zoom2?: number}; foco?: number; hud?: boolean; over: Over[]; audio: {src: string; at: number; vol?: number}[]; visual?: string; comentarios?: Comentario[]};
type TL = {partida: string; ias: IA[]; cenas: Cena[]};

export const calcAge: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl = await (await fetch(staticFile('timeline_age.json'))).json();
  return {durationInFrames: tl.cenas.reduce((a: number, c: Cena) => a + c.dur, 0), props: {tl}};
};

type Dados = {qs: Quadro[]; rec: Recurso[]; tam: number; pecas: Pecas | null};

function quadroEm(qs: Quadro[], t: number): Quadro {
  let i = 0;
  while (i < qs.length - 1 && qs[i + 1].t <= t) i++;
  return qs[i];
}

function centroDe(qs: Quadro[], j: number, t: number): [number, number] {
  const q = quadroEm(qs, t);
  const cc = q.ents.find((e) => e[1] === j && e[2].includes('civil_centre'));
  if (cc) return [cc[3], cc[4]];
  const es = q.ents.filter((e) => e[1] === j);
  if (!es.length) return [640, 640];
  return [es.reduce((a, e) => a + e[3], 0) / es.length, es.reduce((a, e) => a + e[4], 0) / es.length];
}

const CenaView: React.FC<{c: Cena; d: Dados; ias: IA[]}> = ({c, d, ias}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = c.t0 + f * c.vel;
  const k = c.dur > 1 ? f / (c.dur - 1) : 0;
  const ease = (x: number) => x * x * (3 - 2 * x);
  let [cx, cz] = c.cam.j ? centroDe(d.qs, c.cam.j, t) : [c.cam.x ?? 640, c.cam.z ?? 640];
  if (c.cam.x2 !== undefined && c.cam.z2 !== undefined) {
    cx = cx + (c.cam.x2 - cx) * ease(k);
    cz = cz + (c.cam.z2 - cz) * ease(k);
  }
  const zoom = (c.cam.zoom ?? 1.6) + ((c.cam.zoom2 ?? c.cam.zoom ?? 1.6) - (c.cam.zoom ?? 1.6)) * ease(k);
  const q = quadroEm(d.qs, t);
  const pxm = (d.pecas?.px_m ?? 8) * zoom;
  const flash = interpolate(f, [0, 5], [0.6, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Mapa qs={d.qs} recursos={d.rec} pecas={d.pecas} t={t} cx={cx} cz={cz} zoom={zoom} f={f} />
      {c.visual === 'comentarios' && c.comentarios ? (
        <AbsoluteFill style={{transform: 'scale(0.92)'}}><AU2Comentarios comentarios={c.comentarios} passo={45} /></AbsoluteFill>
      ) : null}
      {c.hud !== false ? (
        <>
          {c.foco ? <BarraRecursos q={q} j={c.foco} ia={ias[c.foco - 1]} /> : null}
          <Placar q={q} ias={ias} foco={c.foco} />
          <Minimapa q={q} recursos={d.rec} tam={d.tam} cx={cx} cz={cz} vw={1920 / pxm} vh={1080 / (pxm * Math.sin((52 * Math.PI) / 180))} />
          <Tempo t={t} />
        </>
      ) : null}
      {c.over.map((o, i) => (
        <Sequence key={i} from={o.at} durationInFrames={o.dur}>
          {o.tipo === 'pensa' ? <PensaSeq ia={ias[o.j - 1]} j={o.j} texto={o.texto} dur={o.dur} /> : null}
          {o.tipo === 'fala' ? <FalaSeq ia={ias[o.j - 1]} j={o.j} texto={o.texto} dur={o.dur} para={o.para} /> : null}
          {o.tipo === 'selo' ? <SeloSeq texto={o.texto} cor={o.cor} /> : null}
          {o.tipo === 'marco' ? <MarcoSeq titulo={o.titulo} sub={o.sub} /> : null}
          {o.tipo === 'legenda' ? <Legenda texto={o.texto} /> : null}
        </Sequence>
      ))}
      {c.audio.map((a, i) => (
        <Sequence key={`a${i}`} from={a.at}>
          <Audio src={staticFile(a.src)} volume={a.vol ?? 1} />
        </Sequence>
      ))}
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

// componentes com o tempo local da Sequence
const PensaSeq: React.FC<{ia: IA; j: number; texto: string; dur: number}> = (p) => <Pensamento {...p} f={useCurrentFrame()} />;
const FalaSeq: React.FC<{ia: IA; j: number; texto: string; dur: number; para?: string}> = ({para, ...p}) => <Fala {...p} privado={para} f={useCurrentFrame()} />;
const SeloSeq: React.FC<{texto: string; cor?: string}> = ({texto, cor}) => <Selo texto={texto} cor={cor} f={useCurrentFrame()} />;
const MarcoSeq: React.FC<{titulo: string; sub?: string}> = ({titulo, sub}) => <CartaoMarco titulo={titulo} sub={sub} f={useCurrentFrame()} />;
const Legenda: React.FC<{texto: string}> = ({texto}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 15}});
  return (
    <div style={{position: 'absolute', bottom: 300, left: 300, right: 380, textAlign: 'center', opacity: e}}>
      <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 56, color: '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill'}}>{texto}</span>
    </div>
  );
};

export const AgeVideo: React.FC<{tl: TL | null}> = ({tl}) => {
  const [d, setD] = useState<Dados | null>(null);
  const [h] = useState(() => delayRender('dados age'));
  useEffect(() => {
    if (!tl) return;
    (async () => {
      await fontsReady;
      const qs = await (await fetch(staticFile(`age/${tl.partida}/quadros.json`))).json();
      const m = await (await fetch(staticFile(`age/${tl.partida}/mapa.json`))).json();
      let pecas = null;
      try {
        const r = await fetch(staticFile('age/pecas/pecas.json'));
        if (r.ok) pecas = await r.json();
      } catch { /* sem sprites */ }
      setD({qs, rec: m.recursos, tam: m.tamanho, pecas});
      continueRender(h);
    })();
  }, [h, tl]);
  if (!tl || !d) return null;
  let ini = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.cenas.map((c) => {
        const de = ini;
        ini += c.dur;
        return (
          <Sequence key={c.id} from={de} durationInFrames={c.dur}>
            <CenaView c={c} d={d} ias={tl.ias} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
