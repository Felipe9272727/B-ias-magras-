import React from 'react';
import {Gif} from '@remotion/gif';
import {AbsoluteFill, Freeze, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {CapGroup, Segment} from '../types';
import {C, FONT} from '../theme';
import {strokeText} from './basics';

type RLE<T> = [number, T][];

function rleAt<T>(rle: RLE<T> | undefined, f: number): T | undefined {
  if (!rle || !rle.length) return undefined;
  let lo = 0,
    hi = rle.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (rle[mid][0] <= f) lo = mid;
    else hi = mid - 1;
  }
  return rle[lo][1];
}

export type ClipInfo = {
  frames: number;
  width: number;
  height: number;
  pop?: number;
  gen?: RLE<number>;
  alive?: RLE<number>;
  stage?: RLE<string>;
  speed?: RLE<number>;
  done?: RLE<number>;
};

const METHOD: Record<string, {name: string; color: string}> = {
  evo: {name: 'NEUROEVOLUÇÃO', color: C.teal},
  ddqn: {name: 'DOUBLE DQN', color: C.orange},
  rainbow: {name: 'RAINBOW-IQN', color: C.violet},
  ada: {name: 'ADAPTATIVA', color: C.lime},
  human: {name: 'EU JOGANDO', color: C.gold},
};

// Placar estilo MarI/O desenhado a partir dos metadados de cada quadro gravado.
const ClipHud: React.FC<{seg: Segment; info: ClipInfo}> = ({seg, info}) => {
  const frame = useCurrentFrame();
  const f = Math.round(seg.from + frame * seg.rate);
  const method = METHOD[seg.clip.split('_')[0]];
  if (!method) return null;
  const gen = rleAt(info.gen, f);
  const alive = rleAt(info.alive, f);
  const stage = rleAt(info.stage, f);
  const pop = info.pop ?? 64;
  const human = seg.clip.startsWith('human');
  const speed = Math.round((rleAt(info.speed, f) ?? 1) * seg.rate * 10) / 10;
  return (
    <div
      style={{
        position: 'absolute',
        left: 34,
        top: 152,
        background: '#0b1112d9',
        border: `3px solid ${method.color}`,
        borderRadius: 16,
        padding: '14px 20px',
        minWidth: 300,
        boxShadow: '0 14px 30px #0008',
      }}
    >
      <div style={{fontFamily: FONT.pixel, fontSize: 18, color: '#0b1112', background: method.color, display: 'inline-block', padding: '6px 10px', borderRadius: 6}}>{method.name}</div>
      {!human && gen !== undefined ? (
        <div style={{fontFamily: FONT.pixel, fontSize: 22, color: C.ink, marginTop: 14}}>
          GERAÇÃO <span style={{color: C.gold}}>{String(gen).padStart(3, '0')}</span>
        </div>
      ) : null}
      {rleAt(info.done, f) ? <div style={{fontFamily: FONT.pixel, fontSize: 18, color: C.lime, marginTop: 12}}>✔ ZEROU!</div> : null}
      {!human && alive !== undefined && !rleAt(info.done, f) ? (
        <div style={{marginTop: 12}}>
          <div style={{fontFamily: FONT.pixel, fontSize: 18, color: C.muted}}>
            VIVOS <span style={{color: alive > 0 ? C.lime : C.red}}>{alive}</span>/{pop}
          </div>
          <div style={{height: 10, background: '#263233', borderRadius: 5, marginTop: 8, overflow: 'hidden'}}>
            <div style={{height: '100%', width: `${(100 * alive) / pop}%`, background: method.color}} />
          </div>
        </div>
      ) : null}
      {stage ? <div style={{fontFamily: FONT.pixel, fontSize: 18, color: C.muted, marginTop: 12}}>FASE <span style={{color: C.ink}}>{stage.replace('-', '–')}</span></div> : null}
      {speed !== 1 && seg.rate !== 0 ? (
        <div style={{fontFamily: FONT.pixel, fontSize: 18, color: C.gold, marginTop: 12}}>
          {speed > 1 ? '▶▶' : '▶'} {String(speed).replace('.', ',')}×
        </div>
      ) : null}
    </div>
  );
};

// Trecho de gameplay gravado (public/footage). Leve zoom contínuo para dar vida.
export const ClipView: React.FC<{seg: Segment; info?: ClipInfo}> = ({seg, info}) => {
  const frame = useCurrentFrame();
  const len = seg.end - seg.start;
  const zoom = seg.zoom ?? 1;
  const drift = interpolate(frame, [0, Math.max(1, len)], [1, 1.035]);
  const s = zoom * drift;
  // Foco perto do líder: a câmera do jogo o mantém a ~30% da largura.
  const ox = zoom > 1 ? `${seg.ox ?? 34}%` : '50%';
  const oy = zoom > 1 ? `${seg.oy ?? 70}%` : '50%';
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: `${ox} ${oy}`}}>
        {seg.rate === 0 ? (
          // quadro congelado (ex.: a tela "CAMPANHA COMPLETA!")
          <Freeze frame={0}>
            <OffthreadVideo src={staticFile(`footage/${seg.clip}.mp4`)} trimBefore={Math.max(0, Math.round(seg.from))} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </Freeze>
        ) : (
          <OffthreadVideo
            src={staticFile(`footage/${seg.clip}.mp4`)}
            trimBefore={Math.max(0, Math.round(seg.from))}
            playbackRate={seg.rate}
            muted
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        )}
      </AbsoluteFill>
      {info ? <ClipHud seg={seg} info={info} /> : null}
      {seg.label ? <ClipLabel text={seg.label} /> : null}
    </AbsoluteFill>
  );
};

const ClipLabel: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 14}});
  const [main, sub] = text.split('|');
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 118, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          transform: `translateY(${(1 - p) * -40}px) scale(${0.8 + 0.2 * p})`,
          opacity: p,
          background: '#11191bee',
          border: `4px solid ${C.gold}`,
          borderRadius: 16,
          padding: '16px 28px',
          boxShadow: '0 18px 40px #0009',
          textAlign: 'center',
        }}
      >
        <div style={{fontFamily: FONT.pixel, fontSize: 34, color: C.gold, letterSpacing: 2}}>{main}</div>
        {sub ? <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: C.ink, marginTop: 10}}>{sub}</div> : null}
      </div>
    </div>
  );
};

export type MemeInfo = {file: string; width: number; height: number; duration: number};

// Meme (GIF) que entra com mola, fica um tempo e sai.
export const MemeCard: React.FC<{info: MemeInfo; dur: number; pos: string; caption?: string}> = ({info, dur, pos, caption}) => {
  const frame = useCurrentFrame();
  const {fps, width: W, height: H} = useVideoConfig();
  const inP = spring({frame, fps, config: {damping: 11, stiffness: 200, mass: 0.6}});
  const outP = interpolate(frame, [dur - 7, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ar = info.width / info.height;
  const src = staticFile(`gifs/${info.file}`);

  if (pos === 'full') {
    const o = Math.min(1, frame / 3) * outP;
    return (
      <AbsoluteFill style={{background: '#000', opacity: o}}>
        <Gif src={src} width={W} height={H} fit="contain" style={{width: '100%', height: '100%'}} />
        {caption ? <MemeCaption text={caption} big /> : null}
      </AbsoluteFill>
    );
  }

  let boxW = pos === 'center' ? 1000 : 600;
  let boxH = boxW / ar;
  const maxH = pos === 'center' ? 700 : 520;
  if (boxH > maxH) {
    boxH = maxH;
    boxW = boxH * ar;
  }
  const rot = pos === 'left' ? -3 : pos === 'right' ? 3 : 0;
  const scale = inP * outP;
  const style: React.CSSProperties = {
    position: 'absolute',
    width: boxW,
    height: boxH,
    transform: `rotate(${rot}deg) scale(${scale})`,
    border: '10px solid #fff',
    borderRadius: 10,
    boxShadow: '0 30px 70px #000c',
    overflow: 'hidden',
    background: '#000',
  };
  if (pos === 'right') Object.assign(style, {right: 70, top: (H - boxH) / 2 - 70});
  if (pos === 'left') Object.assign(style, {left: 70, top: (H - boxH) / 2 - 70});
  if (pos === 'top') Object.assign(style, {left: (W - boxW) / 2, top: 70});
  if (pos === 'center') Object.assign(style, {left: (W - boxW) / 2, top: (H - boxH) / 2 - 50});
  return (
    <AbsoluteFill style={{background: pos === 'center' ? `rgba(0,0,0,${0.45 * scale})` : undefined}}>
      <div style={style}>
        <Gif src={src} width={Math.round(boxW)} height={Math.round(boxH)} fit="cover" />
        {caption ? <MemeCaption text={caption} /> : null}
      </div>
    </AbsoluteFill>
  );
};

const MemeCaption: React.FC<{text: string; big?: boolean}> = ({text, big}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: big ? 130 : 14,
      textAlign: 'center',
      fontFamily: FONT.comic,
      fontSize: big ? 96 : 54,
      lineHeight: 1,
      color: '#fff',
      letterSpacing: 2,
      textTransform: 'uppercase',
      ...strokeText(big ? 12 : 8),
    }}
  >
    {text}
  </div>
);

// Texto grande que "explode" na tela.
export const TextPop: React.FC<{text: string; dur: number; color?: string}> = ({text, dur, color = C.gold}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 9, stiffness: 220, mass: 0.5}});
  const out = interpolate(frame, [dur - 6, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: 210}}>
      <div
        style={{
          fontFamily: FONT.comic,
          fontSize: 132,
          color,
          letterSpacing: 4,
          transform: `scale(${p * out}) rotate(${(1 - p) * -8 - 2}deg)`,
          textAlign: 'center',
          maxWidth: 1600,
          lineHeight: 1.02,
          textShadow: '0 12px 0 #0007',
          ...strokeText(14),
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// Legendas seletivas: só os blocos escolhidos em build_timeline.py (termos técnicos,
// números difíceis e frases marcadas com [[cc]]). A palavra falada fica dourada.
export const Captions: React.FC<{groups: CapGroup[]; topo?: boolean}> = ({groups, topo}) => {
  const frame = useCurrentFrame();
  const gi = groups.findIndex((g, i) => frame >= g.s - 2 && frame < (groups[i + 1] ? Math.min(groups[i + 1].s - 2, g.e + 18) : g.e + 18));
  if (gi < 0) return null;
  const g = groups[gi];
  const local = frame - (g.s - 2);
  const pop = Math.min(1, local / 4);
  return (
    <AbsoluteFill style={{justifyContent: topo ? 'flex-start' : 'flex-end', alignItems: 'center', paddingBottom: 92, paddingTop: topo ? 150 : 0, pointerEvents: 'none'}}>
      <div
        style={{
          maxWidth: 1500,
          textAlign: 'center',
          fontFamily: FONT.display,
          fontWeight: 900,
          fontSize: 58,
          lineHeight: 1.18,
          color: '#fff',
          transform: `translateY(${(1 - pop) * 14}px)`,
          opacity: pop,
          ...strokeText(11, '#0b1112'),
          textShadow: '0 6px 0 #0b111299',
        }}
      >
        {g.words.map((w, i) => {
          const active = frame >= w.s && frame < (g.words[i + 1]?.s ?? w.e + 6);
          return (
            <span key={i} style={{color: active ? C.gold : '#fff', display: 'inline-block', margin: '0 9px', transform: active ? 'scale(1.08)' : undefined}}>
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
