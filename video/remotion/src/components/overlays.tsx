import React, {useMemo} from 'react';
import {Gif} from '@remotion/gif';
import {AbsoluteFill, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Segment, Word} from '../types';
import {C, FONT} from '../theme';
import {strokeText} from './basics';

// Trecho de gameplay gravado (public/footage). Leve zoom contínuo para dar vida.
export const ClipView: React.FC<{seg: Segment}> = ({seg}) => {
  const frame = useCurrentFrame();
  const len = seg.end - seg.start;
  const zoom = seg.zoom ?? 1;
  const drift = interpolate(frame, [0, Math.max(1, len)], [1, 1.035]);
  const s = zoom * drift;
  // Foco perto do líder: a câmera do jogo o mantém a ~30% da largura.
  const ox = zoom > 1 ? '34%' : '50%';
  const oy = zoom > 1 ? '70%' : '50%';
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: `${ox} ${oy}`}}>
        <OffthreadVideo
          src={staticFile(`footage/${seg.clip}.mp4`)}
          trimBefore={Math.max(0, Math.round(seg.from))}
          playbackRate={seg.rate}
          muted
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
        />
      </AbsoluteFill>
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
    <div
      style={{
        position: 'absolute',
        right: 48,
        top: 150,
        transform: `translateX(${(1 - p) * 120}%)`,
        background: '#11191bee',
        border: `4px solid ${C.gold}`,
        borderRadius: 16,
        padding: '18px 26px',
        boxShadow: '0 18px 40px #0009',
        textAlign: 'right',
      }}
    >
      <div style={{fontFamily: FONT.pixel, fontSize: 34, color: C.gold, letterSpacing: 2}}>{main}</div>
      {sub ? <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: C.ink, marginTop: 10}}>{sub}</div> : null}
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

type Group = {words: Word[]; s: number; e: number};

function groupWords(words: Word[]): Group[] {
  const groups: Group[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) groups.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e});
    cur = [];
  };
  words.forEach((w, i) => {
    const prev = words[i - 1];
    if (cur.length && prev && w.s - prev.e > 12) flush();
    cur.push(w);
    const chars = cur.reduce((n, x) => n + x.w.length + 1, 0);
    if (/[.!?…:;]$/.test(w.w) || cur.length >= 7 || chars > 38 || (/,$/.test(w.w) && cur.length >= 3)) flush();
  });
  flush();
  return groups;
}

// Legendas palavra a palavra (a palavra falada fica dourada).
export const Captions: React.FC<{words: Word[]; offset: number}> = ({words, offset}) => {
  const frame = useCurrentFrame() - offset;
  const groups = useMemo(() => groupWords(words), [words]);
  const gi = groups.findIndex((g, i) => frame >= g.s - 2 && frame < (groups[i + 1] ? Math.min(groups[i + 1].s - 2, g.e + 18) : g.e + 18));
  if (gi < 0) return null;
  const g = groups[gi];
  const local = frame - (g.s - 2);
  const pop = Math.min(1, local / 4);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 92, pointerEvents: 'none'}}>
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
