// AGE DAS IAs: o vídeo. Lê public/age/<partida>/{quadros,mapa}.json e a timeline (timeline_age.json, gerada por
// video/scripts/build_timeline_age.py a partir do roteiro). Cada cena: câmera num ponto do mapa (ou seguindo um
// império), o jogo correndo de t0 numa velocidade, e por cima falas, pensamentos secretos, selos e cartões; HUD
// estilo AoE4 sempre visível (recursos do império em foco, placar das 6 IAs, minimapa, relógio).
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {Mapa, type Ent, type Pecas, type Quadro, type Recurso} from './Mapa';
import {AU2Comentarios, type Comentario} from '../amongus3/Comentarios';
import {Diagrama, Elenco, Numero, type Seta} from './Extras';
import {MemeCard} from '../components/overlays';
import {BarraRecursos, CartaoMarco, Fala, FONTE, type IA, Minimapa, Pensamento, Placar, Selo, Tempo} from './Hud';

type Over =
  | {tipo: 'pensa'; at: number; dur: number; j: number; texto: string}
  | {tipo: 'fala'; at: number; dur: number; j: number; texto: string; para?: string}
  | {tipo: 'selo'; at: number; dur: number; texto: string; cor?: string}
  | {tipo: 'marco'; at: number; dur: number; titulo: string; sub?: string}
  | {tipo: 'legenda'; at: number; dur: number; texto: string}
  | {tipo: 'meme'; at: number; dur: number; id: string; pos: string; info: {file: string; width: number; height: number; duration: number}}
  | {tipo: 'diagrama'; at: number; dur: number; setas: Seta[]}
  | {tipo: 'numero'; at: number; dur: number; texto: string; sub?: string};
type Cena = {id: string; dur: number; t0: number; vel: number; cam: {j?: number; batalha?: number; exercito?: number; x?: number; z?: number; zoom?: number; x2?: number; z2?: number; zoom2?: number}; foco?: number; hud?: boolean; over: Over[]; audio: {src: string; at: number; vol?: number}[]; visual?: string; marcas?: number[]; comentarios?: Comentario[]; partida?: string};
type TL = {partida: string; ias: IA[]; cenas: Cena[]};

export const calcAge: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl = await (await fetch(staticFile('timeline_age.json'))).json();
  return {durationInFrames: tl.cenas.reduce((a: number, c: Cena) => a + c.dur, 0), props: {tl}};
};

type Dados = {qs: Quadro[]; rec: Recurso[]; tam: number; pecas: Pecas | null; vidaMax: Map<number, number>};

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

const MIL = (m: string) => m.includes('infantry') || m.includes('cavalry') || m.includes('champion');
type Modo = 'base' | 'batalha' | 'exercito';
// ponto de interesse em UM quadro (sem média): base do império, soldados em combate perto dela, ou o exército dele
function pontoQuadro(q: Quadro, modo: Modo, j: number): [number, number] | null {
  const cc = q.ents.find((e) => e[1] === j && e[2].includes('civil_centre'));
  let base: [number, number] | null = cc ? [cc[3], cc[4]] : null;
  if (!base) {
    const es = q.ents.filter((e) => e[1] === j);
    base = es.length ? [es.reduce((a, e) => a + e[3], 0) / es.length, es.reduce((a, e) => a + e[4], 0) / es.length] : null;
  }
  if (modo === 'base') return base;
  // o maior grupo de soldados (média dos vizinhos a <55 m do soldado mais cercado): média de grupos espalhados caía
  // no meio do mato, longe de qualquer luta
  const luta = (e: Ent) => e[6].includes('COMBAT') || e[6].includes('FIGHTING');
  let es: Ent[];
  const [bx, bz] = base ?? [640, 640];
  if (modo === 'exercito') es = q.ents.filter((e) => e[1] === j && MIL(e[2]));
  else {
    es = q.ents.filter((e) => e[1] > 0 && MIL(e[2]) && luta(e) && Math.hypot(e[3] - bx, e[4] - bz) < 420);
    if (es.length < 2) es = q.ents.filter((e) => e[1] > 0 && MIL(e[2]) && luta(e));
  }
  if (!es.length) return base;
  let melhor = es[0];
  let nota = -1e9;
  for (const e of es) {
    let n = 0;
    for (const o of es) if (Math.abs(o[3] - e[3]) < 55 && Math.abs(o[4] - e[4]) < 55) n += luta(o) ? 1.5 : 1;
    const v = n - (modo === 'batalha' ? Math.hypot(e[3] - bx, e[4] - bz) / 120 : 0);
    if (v > nota) {
      nota = v;
      melhor = e;
    }
  }
  const viz = es.filter((o) => Math.abs(o[3] - melhor[3]) < 55 && Math.abs(o[4] - melhor[4]) < 55);
  return [viz.reduce((a, e) => a + e[3], 0) / viz.length, viz.reduce((a, e) => a + e[4], 0) / viz.length];
}
const CACHE_PT = new WeakMap<Quadro[], Map<string, [number, number] | null>>();
// câmera contínua: média gaussiana (sigma 3 s de jogo) dos pontos de cada quadro, com peso que varia suave com o
// tempo; antes a câmera pulava a cada quadro do log (2 s de jogo), o que dava a sensação de 2 FPS
function alvo(qs: Quadro[], t: number, modo: Modo, j: number): [number, number] {
  let m = CACHE_PT.get(qs);
  if (!m) CACHE_PT.set(qs, (m = new Map()));
  const S = modo === 'base' ? 2000 : 3500;
  let lo = 0;
  let hi = qs.length - 1;
  while (lo < hi) {
    const md = (lo + hi) >> 1;
    if (qs[md].t < t - 3 * S) lo = md + 1;
    else hi = md;
  }
  let sx = 0;
  let sz = 0;
  let sw = 0;
  for (let i = lo; i < qs.length && qs[i].t <= t + 3 * S; i++) {
    const k = modo + '|' + j + '|' + i;
    let p = m.get(k);
    if (p === undefined) m.set(k, (p = pontoQuadro(qs[i], modo, j)));
    if (!p) continue;
    const w = Math.exp(-0.5 * ((qs[i].t - t) / S) ** 2);
    sx += p[0] * w;
    sz += p[1] * w;
    sw += w;
  }
  if (sw > 0) return [sx / sw, sz / sw];
  return centroDe(qs, j, t);
}

const CenaView: React.FC<{c: Cena; d: Dados; ias: IA[]}> = ({c, d, ias}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = c.t0 + f * c.vel;
  const k = c.dur > 1 ? f / (c.dur - 1) : 0;
  const ease = (x: number) => x * x * (3 - 2 * x);
  let [cx, cz] = c.cam.batalha ? alvo(d.qs, t, 'batalha', c.cam.batalha) : c.cam.exercito ? alvo(d.qs, t, 'exercito', c.cam.exercito) : c.cam.j ? alvo(d.qs, t, 'base', c.cam.j) : [c.cam.x ?? 640, c.cam.z ?? 640];
  // nada de tela parada: deriva lenta da câmera (empurra o zoom e passeia um pouco) em toda cena
  const deriva = ease(k);
  cx += Math.sin(k * Math.PI * 1.3 + c.dur) * 7;
  cz += Math.cos(k * Math.PI * 1.1 + c.dur) * 5;
  if (c.cam.x2 !== undefined && c.cam.z2 !== undefined) {
    cx = cx + (c.cam.x2 - cx) * ease(k);
    cz = cz + (c.cam.z2 - cz) * ease(k);
  }
  const zoom0 = (c.cam.zoom ?? 1.6) + ((c.cam.zoom2 ?? c.cam.zoom ?? 1.6) - (c.cam.zoom ?? 1.6)) * ease(k);
  // impacto: cada selo/meme/número dá um soco de zoom; explosões e números tremem a tela
  let soco = 0;
  let tremor = 0;
  for (const o of c.over) {
    const d = f - o.at;
    if (d >= 0 && d < 12 && (o.tipo === 'selo' || o.tipo === 'meme' || o.tipo === 'numero')) soco = Math.max(soco, 0.07 * (1 - d / 12));
    if (d >= 0 && d < 14 && o.tipo === 'numero') tremor = Math.max(tremor, 14 * (1 - d / 14));
  }
  for (const a of c.audio) {
    const d = f - a.at;
    if (d >= 0 && d < 16 && a.src.includes('explosion')) tremor = Math.max(tremor, 16 * (1 - d / 16));
  }
  const zoom = zoom0 * (1 + 0.09 * deriva) * (1 + soco);
  const tx = tremor ? Math.sin(f * 2.7) * tremor : 0;
  const ty = tremor ? Math.cos(f * 3.3) * tremor : 0;
  const q = quadroEm(d.qs, t);
  const pxm = (d.pecas?.px_m ?? 8) * zoom;
  const flash = interpolate(f, [0, 5], [0.6, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px)`}}><Mapa qs={d.qs} recursos={d.rec} pecas={d.pecas} t={t} cx={cx} cz={cz} zoom={zoom} f={f} vidaMax={d.vidaMax} /></AbsoluteFill>
      {c.visual === 'comentarios' && c.comentarios ? (
        <AbsoluteFill style={{transform: 'scale(0.92)'}}><AU2Comentarios comentarios={c.comentarios} passo={45} /></AbsoluteFill>
      ) : null}
      {c.visual === 'elenco' ? <Elenco ias={ias} marcas={c.marcas} /> : null}
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
          {o.tipo === 'meme' ? <MemeCard info={o.info} dur={o.dur} pos={o.pos} /> : null}
          {o.tipo === 'diagrama' ? <Diagrama ias={ias} setas={o.setas} dur={o.dur} /> : null}
          {o.tipo === 'numero' ? <Numero texto={o.texto} sub={o.sub} dur={o.dur} /> : null}
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
  const [d, setD] = useState<Record<string, Dados> | null>(null);
  const [h] = useState(() => delayRender('dados age'));
  useEffect(() => {
    if (!tl) return;
    (async () => {
      await fontsReady;
      let pecas = null;
      try {
        const r = await fetch(staticFile('age/pecas/pecas.json'));
        if (r.ok) pecas = await r.json();
      } catch { /* sem sprites */ }
      const nomes = [...new Set(tl.cenas.map((c) => c.partida ?? tl.partida))];
      const tudo: Record<string, Dados> = {};
      for (const n of nomes) {
        const qs = await (await fetch(staticFile(`age/${n}/quadros.json`))).json();
        const m = await (await fetch(staticFile(`age/${n}/mapa.json`))).json();
        const vidaMax = new Map<number, number>();
        // fogo só em prédio pronto que levou dano (a chave negativa guarda quando a vida máxima foi atingida)
        for (const q of qs as Quadro[]) for (const e of q.ents) if (e[1] > 0 && e[2].indexOf('/') < 0 && !(vidaMax.get(e[0]) >= e[5])) { vidaMax.set(e[0], e[5]); vidaMax.set(-e[0], q.t); }
        tudo[n] = {qs, rec: m.recursos, tam: m.tamanho, pecas, vidaMax};
      }
      setD(tudo);
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
            <CenaView c={c} d={d[c.partida ?? tl.partida]} ias={tl.ias} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
