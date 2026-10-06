import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {GridBackground, Panel, Sprite} from '../components/basics';
import {HL, useHL} from './hl';

const ACTIONS = ['←', 'parado', '→', '← + pulo', 'pulo', '→ + pulo'];

// Valores Q das 6 ações para uma situação do jogo; a maior vence (argmax).
export const QValues: React.FC<{highlights: HL}> = ({highlights}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const h = useHL(highlights);
  const base = [0.4, 0.9, 3.1, 0.2, 1.4, 5.6];
  const values = base.map((v, i) => v + Math.sin(frame / 14 + i) * 0.25);
  const best = values.indexOf(Math.max(...values));
  const explore = h.on('explorar');
  const dice = explore && Math.floor(frame / 30) % 3 === 2;
  const randomPick = Math.floor(random('pick' + Math.floor(frame / 30)) * 6);
  const chosen = dice ? randomPick : best;
  const p = spring({frame, fps, config: {damping: 15}});
  return (
    <AbsoluteFill>
      <GridBackground accent={C.orange} />
      <div style={{position: 'absolute', top: 48, width: '100%', textAlign: 'center', fontFamily: FONT.pixel, fontSize: 34, color: C.gold, letterSpacing: 3}}>
        QUANTO VALE CADA BOTÃO AQUI?
      </div>
      <Panel style={{position: 'absolute', left: 110, top: 150, width: 760, height: 600, overflow: 'hidden', transform: `scale(${p})`}}>
        <Img src={staticFile('stills/qsituation.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', left: 20, top: 20, fontFamily: FONT.pixel, fontSize: 20, color: '#fff', background: '#0009', padding: '8px 12px', borderRadius: 8}}>ESTADO s</div>
      </Panel>
      <div style={{position: 'absolute', left: 960, top: 150, width: 860}}>
        {ACTIONS.map((a, i) => {
          const v = values[i];
          const w = interpolate(v, [0, 6], [20, 600]);
          const isChosen = i === chosen;
          const s = spring({frame: frame - 6 - i * 4, fps, config: {damping: 14}});
          return (
            <div key={a} style={{display: 'flex', alignItems: 'center', height: 92, gap: 18, opacity: s}}>
              <div style={{width: 200, fontFamily: FONT.display, fontWeight: 800, fontSize: 32, color: isChosen ? (dice ? C.gold : C.lime) : C.ink, textAlign: 'right'}}>{a}</div>
              <div style={{height: 46, width: w * s, borderRadius: 10, background: isChosen ? (dice ? C.gold : C.lime) : C.panel2, border: `2px solid ${isChosen ? '#fff' : C.line}`}} />
              <div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 30, color: C.muted}}>Q = {v.toFixed(1)}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 960, top: 720, width: 860, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 36, color: dice ? C.gold : C.lime}}>
        {explore ? (dice ? '🎲 explorando: ação aleatória!' : '✅ aproveitando: maior valor Q') : 'escolhe a ação com o maior Q'}
      </div>
    </AbsoluteFill>
  );
};

// Memória de replay: experiências entram numa caixa e lotes aleatórios saem para treinar.
export const ReplayBuffer: React.FC<{highlights: HL}> = ({highlights}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const h = useHL(highlights);
  const cards = new Array(8).fill(0).map((_, i) => {
    const t = ((frame + i * 11) % 88) / 88;
    const x = interpolate(t, [0, 1], [140, 760]);
    const o = interpolate(t, [0, 0.1, 0.85, 1], [0, 1, 1, 0]);
    return (
      <div key={i} style={{position: 'absolute', left: x, top: 250 + (i % 4) * 92, opacity: o, fontFamily: FONT.mono, fontSize: 21, color: C.ink, background: C.panel2, border: `2px solid ${C.line}`, borderRadius: 10, padding: '8px 12px', whiteSpace: 'nowrap'}}>
        (s, a={['→', '⤒', '←'][i % 3]}, r={['+1', '−1', '+0.2', '+2'][i % 4]}, s′)
      </div>
    );
  });
  const batch = new Array(4).fill(0).map((_, i) => {
    const t = ((frame + i * 9) % 60) / 60;
    const x = interpolate(t, [0, 1], [1260, 1560]);
    return (
      <div key={i} style={{position: 'absolute', left: x, top: 360 + i * 46, opacity: interpolate(t, [0, 0.2, 0.8, 1], [0, 1, 1, 0]), width: 60, height: 34, borderRadius: 8, background: C.gold}} />
    );
  });
  const doubleP = h.on('double') ? spring({frame: h.since('double'), fps, config: {damping: 14}}) : 0;
  return (
    <AbsoluteFill>
      <GridBackground accent={C.orange} />
      <div style={{position: 'absolute', top: 48, width: '100%', textAlign: 'center', fontFamily: FONT.pixel, fontSize: 34, color: C.gold, letterSpacing: 3}}>
        MEMÓRIA DE REPLAY
      </div>
      <div style={{opacity: 1 - doubleP * 0.85}}>
        {cards}
        <Panel style={{position: 'absolute', left: 820, top: 220, width: 400, height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16}} color={C.orange}>
          <div style={{fontSize: 90}}>🧠</div>
          <div style={{fontFamily: FONT.pixel, fontSize: 28, color: C.orange}}>10.000</div>
          <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 32, color: C.ink}}>memórias</div>
        </Panel>
        {batch}
        <div style={{position: 'absolute', left: 1500, top: 600, fontFamily: FONT.display, fontWeight: 800, fontSize: 30, color: C.gold}}>lotes aleatórios → treino</div>
      </div>
      {h.on('double') ? (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${doubleP})`}}>
          <div style={{display: 'flex', gap: 120, alignItems: 'center', marginTop: -80}}>
            <Panel style={{width: 520, padding: 40, textAlign: 'center'}} color={C.lime}>
              <div style={{fontSize: 80}}>🧑‍🏫</div>
              <div style={{fontFamily: FONT.pixel, fontSize: 24, color: C.lime, margin: '14px 0'}}>REDE ONLINE</div>
              <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 36, color: C.ink}}>escolhe a melhor ação</div>
            </Panel>
            <div style={{fontFamily: FONT.pixel, fontSize: 54, color: C.gold}}>⇄</div>
            <Panel style={{width: 520, padding: 40, textAlign: 'center'}} color={C.sky}>
              <div style={{fontSize: 80}}>🧐</div>
              <div style={{fontFamily: FONT.pixel, fontSize: 24, color: C.sky, margin: '14px 0'}}>REDE ALVO</div>
              <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 36, color: C.ink}}>confere quanto ela vale</div>
            </Panel>
          </div>
        </AbsoluteFill>
      ) : null}
      <div style={{position: 'absolute', left: 40, top: 690}}>
        <Sprite name="jump" size={90} />
      </div>
    </AbsoluteFill>
  );
};
