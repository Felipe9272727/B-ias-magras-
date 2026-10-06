import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {GridBackground, Sprite, strokeText} from '../components/basics';

// Cartela de capítulo: "IA #1 · NEUROEVOLUÇÃO" em estilo de jogo antigo.
export const TitleCard: React.FC<{kicker?: string; title: string; subtitle?: string; color?: string; sprite?: string}> = ({
  kicker,
  title,
  subtitle,
  color = C.gold,
  sprite = 'run',
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width} = useVideoConfig();
  const pIn = spring({frame, fps, config: {damping: 13, stiffness: 160}});
  const pSub = spring({frame: frame - 8, fps, config: {damping: 14}});
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shake = frame < 10 ? (random('sh' + frame) - 0.5) * 18 : 0;
  const run = Math.floor(frame / 5) % 2 === 0 ? 'run' : 'stand';
  const marioX = interpolate(frame, [0, durationInFrames], [-160, width + 160]);
  return (
    <AbsoluteFill style={{opacity: out}}>
      <GridBackground accent={color} />
      {/* faixas diagonais */}
      <AbsoluteFill style={{transform: `skewY(-6deg) translateY(${(1 - pIn) * 300}px)`}}>
        <div style={{position: 'absolute', left: -100, right: -100, top: 330, height: 420, background: `${color}1f`, borderTop: `6px solid ${color}`, borderBottom: `6px solid ${color}`}} />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `translateX(${shake}px)`}}>
        {kicker ? (
          <div style={{fontFamily: FONT.pixel, fontSize: 40, color, letterSpacing: 6, marginBottom: 34, opacity: pIn, transform: `translateY(${(1 - pIn) * -40}px)`}}>{kicker}</div>
        ) : null}
        <div
          style={{
            fontFamily: FONT.pixel,
            fontSize: title.length > 14 ? 74 : 96,
            color: C.ink,
            letterSpacing: 4,
            textAlign: 'center',
            maxWidth: 1700,
            lineHeight: 1.25,
            transform: `scale(${0.6 + 0.4 * pIn})`,
            opacity: pIn,
            textShadow: `8px 8px 0 ${color}66`,
            ...strokeText(6, '#0b1112'),
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 44, color: C.muted, marginTop: 40, opacity: pSub, transform: `translateY(${(1 - pSub) * 30}px)`}}>
            {subtitle}
          </div>
        ) : null}
      </AbsoluteFill>
      <div style={{position: 'absolute', left: marioX, bottom: 120}}>
        <Sprite name={sprite === 'run' ? run : sprite} size={110} />
      </div>
    </AbsoluteFill>
  );
};
