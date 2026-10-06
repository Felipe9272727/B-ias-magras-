import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ALG, AlgKey, C, FONT} from '../theme';
import {GridBackground, Panel} from '../components/basics';
import {HL, useHL} from './hl';

export type RunRow = {key: AlgKey; cleared: number; partial: number; label: string; detail: string};

// Placar: 32 quadradinhos por algoritmo (fases concluídas pelo melhor indivíduo numa tentativa).
export const Scoreboard: React.FC<{highlights: HL; rows: RunRow[]; title?: string; subtitle?: string}> = ({highlights, rows, title, subtitle}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const h = useHL(highlights);
  return (
    <AbsoluteFill>
      <GridBackground accent={C.gold} />
      <div style={{position: 'absolute', top: 44, width: '100%', textAlign: 'center', fontFamily: FONT.pixel, fontSize: 36, color: C.gold, letterSpacing: 3}}>
        {title ?? 'PLACAR FINAL'}
      </div>
      {subtitle ? (
        <div style={{position: 'absolute', top: 104, width: '100%', textAlign: 'center', fontFamily: FONT.display, fontWeight: 600, fontSize: 30, color: C.muted}}>{subtitle}</div>
      ) : null}
      <div style={{position: 'absolute', left: 110, top: 160, width: 1700, display: 'flex', flexDirection: 'column', gap: 16}}>
        {rows.map((r) => {
          const alg = ALG[r.key];
          const on = h.on(r.key);
          const since = Math.max(0, h.since(r.key));
          const p = on ? spring({frame: since, fps, config: {damping: 16}}) : 0;
          const fillCount = on ? interpolate(since, [6, 6 + Math.max(10, r.cleared * 1.6)], [0, r.cleared + r.partial], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
          return (
            <Panel key={r.key} style={{padding: '12px 28px', opacity: 0.25 + 0.75 * p, transform: `scale(${0.97 + 0.03 * p})`, borderColor: on ? alg.color : C.line}}>
              <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
                <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: alg.color}}>{alg.name}</div>
                <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 30, color: C.ink}}>{on ? r.label : '?'}</div>
              </div>
              <div style={{display: 'flex', gap: 6, marginTop: 8}}>
                {new Array(32).fill(0).map((_, i) => {
                  const f = Math.max(0, Math.min(1, fillCount - i));
                  return (
                    <div key={i} style={{width: 46, height: 26, borderRadius: 5, background: C.bg2, border: `2px solid ${C.line}`, overflow: 'hidden'}}>
                      <div style={{width: `${f * 100}%`, height: '100%', background: alg.color}} />
                    </div>
                  );
                })}
              </div>
              <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: C.muted, marginTop: 6, opacity: p}}>{r.detail}</div>
            </Panel>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Curva de aprendizado (melhor recompensa por geração) com anotações.
export const LearningCurve: React.FC<{
  highlights: HL;
  series: {gen: number; best: number; mean: number}[];
  color?: string;
  title: string;
  marks?: {gen: number; text: string}[];
  yLabel?: string;
}> = ({highlights, series, color = C.teal, title, marks = [], yLabel = 'melhor recompensa'}) => {
  const frame = useCurrentFrame();
  const h = useHL(highlights);
  const X0 = 200,
    X1 = 1720,
    Y0 = 760,
    Y1 = 190;
  const maxG = Math.max(...series.map((s) => s.gen), 1);
  const minG = Math.min(...series.map((s) => s.gen));
  const maxY = Math.max(...series.map((s) => s.best), 1) * 1.08;
  const sx = (g: number) => X0 + ((g - minG) / Math.max(1, maxG - minG)) * (X1 - X0);
  const sy = (v: number) => Y0 - (Math.max(0, v) / maxY) * (Y0 - Y1);
  const reveal = interpolate(frame, [8, 110], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shown = series.filter((s) => s.gen <= minG + reveal * (maxG - minG));
  const path = (key: 'best' | 'mean') => shown.map((s, i) => `${i ? 'L' : 'M'}${sx(s.gen).toFixed(1)},${sy(s[key]).toFixed(1)}`).join(' ');
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(maxY * t));
  return (
    <AbsoluteFill>
      <GridBackground accent={color} dim={0.6} />
      <div style={{position: 'absolute', top: 48, width: '100%', textAlign: 'center', fontFamily: FONT.pixel, fontSize: 32, color: C.gold, letterSpacing: 3}}>{title}</div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={X0} x2={X1} y1={sy(t)} y2={sy(t)} stroke={C.line} strokeWidth={2} />
            <text x={X0 - 20} y={sy(t) + 10} fill={C.muted} fontSize={26} textAnchor="end" fontFamily="JetBrains Mono">
              {t}
            </text>
          </g>
        ))}
        <text x={X0} y={Y0 + 50} fill={C.muted} fontSize={26} fontFamily="JetBrains Mono">
          geração {minG}
        </text>
        <text x={X1} y={Y0 + 50} fill={C.muted} fontSize={26} textAnchor="end" fontFamily="JetBrains Mono">
          geração {maxG}
        </text>
        <path d={path('mean')} stroke="#748f89" strokeWidth={4} fill="none" />
        <path d={path('best')} stroke={color} strokeWidth={7} fill="none" strokeLinejoin="round" />
        {marks.map((m, i) => {
          const visible = m.gen <= minG + reveal * (maxG - minG);
          const pt = series.reduce((a, b) => (Math.abs(b.gen - m.gen) < Math.abs(a.gen - m.gen) ? b : a), series[0]);
          return visible ? (
            <g key={i}>
              <circle cx={sx(pt.gen)} cy={sy(pt.best)} r={14} fill={C.gold} stroke="#000" strokeWidth={3} />
              <line x1={sx(pt.gen)} x2={sx(pt.gen)} y1={sy(pt.best) - 18} y2={sy(pt.best) - 70} stroke={C.gold} strokeWidth={3} />
              <text x={sx(pt.gen)} y={sy(pt.best) - 84} fill={C.gold} fontSize={32} textAnchor={sx(pt.gen) > 1400 ? 'end' : 'middle'} fontFamily="Poppins" fontWeight={800}>
                {m.text}
              </text>
            </g>
          ) : null;
        })}
      </svg>
      <div style={{position: 'absolute', left: X0, top: 120, display: 'flex', gap: 40, fontFamily: FONT.display, fontWeight: 600, fontSize: 26, color: C.muted}}>
        <span>
          <b style={{display: 'inline-block', width: 34, height: 6, background: color, verticalAlign: 'middle', marginRight: 10}} />
          {yLabel}
        </span>
        <span>
          <b style={{display: 'inline-block', width: 34, height: 6, background: '#748f89', verticalAlign: 'middle', marginRight: 10}} />
          média da população
        </span>
      </div>
      {h.current() ? null : null}
    </AbsoluteFill>
  );
};
