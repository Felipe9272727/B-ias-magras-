import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {GridBackground, Panel, Sprite} from '../components/basics';
import {HL, useHL} from './hl';

// Ciclo agente ↔ ambiente: estado → ação → recompensa.
export const RLLoop: React.FC<{highlights: HL}> = ({highlights}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const h = useHL(highlights);
  const pA = spring({frame: frame - 4, fps, config: {damping: 13}});
  const pE = spring({frame: frame - 12, fps, config: {damping: 13}});
  const glow = (key: string, color: string) => (h.current() === key ? `0 0 0 6px ${color}, 0 0 60px ${color}aa` : '0 30px 80px #0008');

  // ponto viajando no ciclo (elipse)
  const t = (frame % 90) / 90;
  const ang = t * Math.PI * 2 - Math.PI / 2;
  const cx = 960 + Math.cos(ang) * 470;
  const cy = 470 + Math.sin(ang) * 260;

  const actions = ['←', '→', '⤒', '→ ⤒'];
  const act = actions[Math.floor(frame / 20) % actions.length];
  const rewardChips = ['+1 pouso', '+2 plataforma', '−1 morte', '+100 fase'];

  return (
    <AbsoluteFill>
      <GridBackground />
      <div style={{position: 'absolute', top: 48, width: '100%', textAlign: 'center', fontFamily: FONT.pixel, fontSize: 38, color: C.gold, letterSpacing: 3}}>
        APRENDIZADO POR REFORÇO
      </div>
      {/* trilha do ciclo */}
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={C.ink} />
          </marker>
        </defs>
        <path d="M 640 300 C 820 150, 1100 150, 1280 300" stroke={h.current() === 'acao' ? C.gold : C.ink} strokeWidth={8} fill="none" strokeDasharray="22 16" strokeDashoffset={-frame * 2} markerEnd="url(#arr)" />
        <path d="M 1280 650 C 1100 800, 820 800, 640 650" stroke={h.current() === 'estado' || h.current() === 'recompensa' ? C.lime : C.ink} strokeWidth={8} fill="none" strokeDasharray="22 16" strokeDashoffset={-frame * 2} markerEnd="url(#arr)" />
        <circle cx={cx} cy={cy} r={12} fill={C.gold} opacity={h.on('ciclo') ? 1 : 0} />
      </svg>
      {/* agente */}
      <Panel style={{position: 'absolute', left: 170, top: 270, width: 480, height: 400, transform: `scale(${pA})`, boxShadow: glow('agente', C.gold), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
        <div style={{fontFamily: FONT.pixel, fontSize: 30, color: C.gold}}>AGENTE</div>
        <Sprite name={Math.floor(frame / 6) % 2 ? 'run' : 'stand'} size={150} />
        <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 28, color: C.muted}}>a rede neural do Mario</div>
      </Panel>
      {/* ambiente */}
      <Panel style={{position: 'absolute', left: 1270, top: 270, width: 480, height: 400, transform: `scale(${pE})`, boxShadow: glow('ambiente', C.sky), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, overflow: 'hidden'}}>
        <div style={{fontFamily: FONT.pixel, fontSize: 30, color: C.sky}}>AMBIENTE</div>
        <Img src={staticFile('stills/env.jpg')} style={{width: 400, height: 225, objectFit: 'cover', borderRadius: 12, border: `3px solid ${C.line}`}} />
        <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 28, color: C.muted}}>a fase, a física, os inimigos</div>
      </Panel>
      {/* rótulos das setas */}
      <div style={{position: 'absolute', top: 118, width: '100%', textAlign: 'center'}}>
        <div style={{display: 'inline-block', fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: h.current() === 'acao' ? C.gold : C.ink, transform: `scale(${h.current() === 'acao' ? 1.15 : 1})`}}>
          AÇÃO <span style={{fontFamily: FONT.mono, color: C.gold, marginLeft: 16}}>{act}</span>
        </div>
      </div>
      <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center'}}>
        <div style={{display: 'inline-flex', gap: 24, fontFamily: FONT.display, fontWeight: 900, fontSize: 38}}>
          <span style={{color: h.current() === 'estado' ? C.lime : C.ink, transform: `scale(${h.current() === 'estado' ? 1.15 : 1})`}}>ESTADO</span>
          <span style={{color: C.muted}}>+</span>
          <span style={{color: h.current() === 'recompensa' ? C.lime : C.ink, transform: `scale(${h.current() === 'recompensa' ? 1.15 : 1})`}}>RECOMPENSA</span>
        </div>
      </div>
      {h.on('recompensa')
        ? rewardChips.map((r, i) => {
            const s = h.since('recompensa') - i * 8;
            const p = interpolate(s, [0, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            if (s < 0 || p >= 1) return null;
            const x = interpolate(p, [0, 1], [1230, 640]);
            const y = 690 + Math.sin(p * Math.PI) * 70 + i * 6;
            return (
              <div key={i} style={{position: 'absolute', left: x, top: y, fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: r.startsWith('−') ? C.red : C.lime, opacity: 1 - p * 0.3}}>
                {r}
              </div>
            );
          })
        : null}
      {h.on('objetivo') ? (
        <div style={{position: 'absolute', top: 400, left: 660, width: 600, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 36, lineHeight: 1.25, color: C.gold, opacity: Math.min(1, h.since('objetivo') / 8)}}>
          Objetivo: somar o máximo de recompensa possível
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
