import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {GridBackground, Panel, Sprite} from '../components/basics';
import {HL, useHL} from './hl';

// Mesma tabela de recompensas do painel do jogo (valores padrão da v11).
export const REWARDS: [string, string, number][] = [
  ['landing', 'Pousar em nova plataforma', 1],
  ['platform', 'Superar plataforma', 2],
  ['gap', 'Atravessar buraco', 2],
  ['coin', 'Pegar moeda', 0.5],
  ['enemy', 'Derrotar inimigo', 1],
  ['progress', 'Avanço seguro por bloco', 0.2],
  ['win', 'Concluir fase', 100],
  ['boss', 'Derrotar Bowser', 10],
  ['death', 'Morrer', -1],
  ['idle', 'Parado (por segundo)', -0.05],
];

export const RewardTable: React.FC<{highlights: HL; hack?: boolean}> = ({highlights}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const h = useHL(highlights);
  const cur = h.current();
  const coinHack = h.on('hack');
  return (
    <AbsoluteFill>
      <GridBackground accent={C.gold} />
      <div style={{position: 'absolute', top: 56, width: '100%', textAlign: 'center', fontFamily: FONT.pixel, fontSize: 38, color: C.gold, letterSpacing: 3}}>
        TABELA DE RECOMPENSAS
      </div>
      <Panel style={{position: 'absolute', left: 360, top: 130, width: 1200, padding: '14px 44px'}}>
        {REWARDS.map(([key, label, value], i) => {
          const p = spring({frame: frame - 4 - i * 3, fps, config: {damping: 14}});
          const active = cur === key;
          let shown = value;
          if (coinHack && key === 'coin') shown = Math.round(interpolate(h.since('hack'), [0, 30], [0.5, 50], {extrapolateRight: 'clamp'}) * 10) / 10;
          const neg = shown < 0;
          return (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 18px',
                margin: '2px -18px',
                borderRadius: 14,
                borderBottom: i < REWARDS.length - 1 ? `1px solid ${C.line}` : undefined,
                opacity: p,
                transform: `translateX(${(1 - p) * -60}px) scale(${active ? 1.04 : 1})`,
                background: active ? (neg ? `${C.red}26` : `${C.lime}22`) : coinHack && key === 'coin' ? `${C.gold}30` : 'transparent',
                boxShadow: active ? `0 0 0 3px ${neg ? C.red : C.lime}` : undefined,
              }}
            >
              <span style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 30, color: C.ink}}>{label}</span>
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontWeight: 700,
                  fontSize: 32,
                  color: neg ? C.red : C.lime,
                  border: `2px solid ${C.line}`,
                  background: '#14211d',
                  borderRadius: 10,
                  padding: '2px 18px',
                  minWidth: 140,
                  textAlign: 'right',
                }}
              >
                {shown > 0 ? '+' : ''}
                {shown}
              </span>
            </div>
          );
        })}
      </Panel>
      {cur && cur !== 'hack' ? (
        <div style={{position: 'absolute', left: 150, top: 150 + REWARDS.findIndex((r) => r[0] === cur) * 62, transform: `translateX(${Math.sin(frame / 4) * 10}px)`}}>
          <Sprite name="run" size={110} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
