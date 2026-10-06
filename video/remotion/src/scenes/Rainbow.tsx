import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {GridBackground} from '../components/basics';
import {HL, useHL} from './hl';

const CARDS = [
  {key: 'double', color: '#ff6b6b', icon: '⚖️', title: 'Double Q', text: 'uma rede escolhe, outra confere'},
  {key: 'dueling', color: '#ffa94d', icon: '🥊', title: 'Dueling', text: 'quão boa é a situação × quão boa é cada ação'},
  {key: 'per', color: '#ffd43b', icon: '📌', title: 'Memória priorizada', text: 'revisa mais o que surpreendeu'},
  {key: 'nstep', color: '#69db7c', icon: '👣', title: 'Retorno de 5 passos', text: 'olha 5 decisões à frente'},
  {key: 'noisy', color: '#4dabf7', icon: '📡', title: 'NoisyNet', text: 'ruído treinável para explorar'},
  {key: 'iqn', color: '#b197fc', icon: '📊', title: 'Distribucional (IQN)', text: 'prevê a distribuição, não só a média'},
];

// Os "Vingadores" do DQN: seis melhorias que viram o Rainbow.
export const RainbowCards: React.FC<{highlights: HL}> = ({highlights}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const h = useHL(highlights);
  const merged = h.on('rainbow');
  const mp = merged ? spring({frame: h.since('rainbow'), fps, config: {damping: 16}}) : 0;
  return (
    <AbsoluteFill>
      <GridBackground accent={C.violet} />
      <div style={{position: 'absolute', top: 48, width: '100%', textAlign: 'center', fontFamily: FONT.pixel, fontSize: 34, color: C.gold, letterSpacing: 3}}>
        RAINBOW = 6 MELHORIAS DO DQN
      </div>
      {CARDS.map((c, i) => {
        const on = h.on(c.key) || merged;
        const p = on ? spring({frame: h.since(c.key) >= 0 ? h.since(c.key) : 0, fps, config: {damping: 12}}) : 0;
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x0 = 150 + col * 560;
        const y0 = 150 + row * 300;
        // ao juntar, os cartões viram faixas de um arco-íris
        const x = interpolate(mp, [0, 1], [x0, 360]);
        const y = interpolate(mp, [0, 1], [y0, 180 + i * 78]);
        const w = interpolate(mp, [0, 1], [500, 1200]);
        const hgt = interpolate(mp, [0, 1], [260, 70]);
        const active = h.current() === c.key && !merged;
        return (
          <div
            key={c.key}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: w,
              height: hgt,
              borderRadius: interpolate(mp, [0, 1], [22, 999]),
              background: merged ? c.color : `linear-gradient(160deg, ${c.color}33, ${C.panel} 70%)`,
              border: `4px solid ${c.color}`,
              boxShadow: active ? `0 0 0 6px ${c.color}88, 0 0 70px ${c.color}` : '0 20px 50px #0008',
              transform: `scale(${on ? 0.6 + 0.4 * p : 0.6})`,
              opacity: on ? 1 : 0.18,
              padding: merged ? '0 40px' : 26,
              display: 'flex',
              flexDirection: merged ? 'row' : 'column',
              alignItems: merged ? 'center' : 'flex-start',
              gap: merged ? 24 : 10,
              overflow: 'hidden',
            }}
          >
            <div style={{fontSize: merged ? 40 : 58}}>{c.icon}</div>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: merged ? 34 : 38, color: merged ? '#111' : C.ink}}>{c.title}</div>
            {!merged ? <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 28, color: C.muted, lineHeight: 1.25}}>{c.text}</div> : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
