import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';
import {GridBackground, Panel, Sprite, strokeText} from '../components/basics';
import {HL, useHL} from './hl';

// Cartões de lições (aparecem conforme a narração).
export const Lessons: React.FC<{highlights: HL; items: {key: string; icon: string; title: string; text: string}[]; title?: string}> = ({highlights, items, title}) => {
  const {fps} = useVideoConfig();
  const h = useHL(highlights);
  return (
    <AbsoluteFill>
      <GridBackground accent={C.lime} />
      <div style={{position: 'absolute', top: 48, width: '100%', textAlign: 'center', fontFamily: FONT.pixel, fontSize: 36, color: C.gold, letterSpacing: 3}}>
        {title ?? 'O QUE EU APRENDI'}
      </div>
      <div style={{position: 'absolute', left: 120, right: 120, top: 170, display: 'flex', gap: 40}}>
        {items.map((it, i) => {
          const on = h.on(it.key);
          const p = on ? spring({frame: h.since(it.key), fps, config: {damping: 13}}) : 0;
          return (
            <Panel key={it.key} style={{flex: 1, padding: 40, minHeight: 520, opacity: 0.15 + 0.85 * p, transform: `translateY(${(1 - p) * 60}px)`, borderColor: on ? C.lime : C.line}}>
              <div style={{fontFamily: FONT.pixel, fontSize: 30, color: C.gold}}>{i + 1}.</div>
              <div style={{fontSize: 92, margin: '20px 0'}}>{it.icon}</div>
              <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: C.ink, lineHeight: 1.15}}>{it.title}</div>
              <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 30, color: C.muted, marginTop: 18, lineHeight: 1.3}}>{it.text}</div>
            </Panel>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Tela final com inscrição e créditos.
export const EndScreen: React.FC<{highlights: HL; credits: string[]}> = ({highlights, credits}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const h = useHL(highlights);
  const p = spring({frame, fps, config: {damping: 12}});
  const like = h.on('like') ? spring({frame: h.since('like'), fps, config: {damping: 8}}) : 0;
  const sub = h.on('inscreva') ? spring({frame: h.since('inscreva'), fps, config: {damping: 8}}) : 0;
  const scroll = interpolate(frame, [0, durationInFrames], [0, -260]);
  return (
    <AbsoluteFill>
      <GridBackground accent={C.gold} />
      <div style={{position: 'absolute', left: 120, top: 120, width: 820}}>
        <div style={{fontFamily: FONT.pixel, fontSize: 64, color: C.gold, transform: `scale(${p})`, transformOrigin: 'left', lineHeight: 1.3}}>VALEU!</div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 40, color: C.ink, marginTop: 30, lineHeight: 1.3}}>Aprender. Morrer. Tentar de novo.</div>
        <div style={{display: 'flex', gap: 30, marginTop: 60}}>
          <div style={{transform: `scale(${0.4 + 0.6 * like})`, opacity: like, background: '#fff', color: '#111', borderRadius: 999, padding: '22px 40px', fontFamily: FONT.display, fontWeight: 900, fontSize: 40}}>👍 LIKE</div>
          <div style={{transform: `scale(${0.4 + 0.6 * sub})`, opacity: sub, background: '#e62117', color: '#fff', borderRadius: 14, padding: '22px 40px', fontFamily: FONT.display, fontWeight: 900, fontSize: 40}}>INSCREVA-SE 🔔</div>
        </div>
        <div style={{position: 'absolute', top: 520, left: 0, display: 'flex', gap: 22, alignItems: 'flex-end'}}>
          {['stand', 'run', 'jump', 'run', 'stand'].map((s, i) => (
            <div key={i} style={{transform: `translateY(${Math.sin((frame + i * 9) / 7) * 12}px)`}}>
              <Sprite name={s} size={70} tint={i === 2 ? undefined : '#d8fff2'} opacity={i === 2 ? 1 : 0.6} />
            </div>
          ))}
        </div>
      </div>
      <Panel style={{position: 'absolute', right: 110, top: 100, width: 760, height: 700, overflow: 'hidden', padding: '30px 40px'}}>
        <div style={{fontFamily: FONT.pixel, fontSize: 24, color: C.gold, marginBottom: 20}}>CRÉDITOS</div>
        <div style={{transform: `translateY(${scroll}px)`}}>
          {credits.map((c, i) => (
            <div key={i} style={{fontFamily: FONT.display, fontWeight: c.startsWith('#') ? 800 : 600, fontSize: c.startsWith('#') ? 28 : 24, color: c.startsWith('#') ? C.lime : C.ink, marginTop: c.startsWith('#') ? 22 : 6, lineHeight: 1.3}}>
              {c.replace(/^#\s*/, '')}
            </div>
          ))}
        </div>
      </Panel>
    </AbsoluteFill>
  );
};

// Captura alta da interface do laboratório com "câmera" que passeia entre regiões.
export const UIPan: React.FC<{src: string; keys: {at: number; x: number; y: number; w: number}[]; srcW: number; speed?: number}> = ({src, keys, srcW, speed = 1}) => {
  const frame = useCurrentFrame();
  const ks = keys.length ? keys : [{at: 0, x: 0, y: 0, w: srcW}];
  const at = ks.map((k) => k.at);
  const pick = (f: (k: (typeof ks)[number]) => number) =>
    ks.length === 1 ? f(ks[0]) : interpolate(frame, at, ks.map(f), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (t) => t * t * (3 - 2 * t)});
  const w = pick((k) => k.w);
  const x = pick((k) => k.x);
  const y = pick((k) => k.y);
  const scale = 1920 / w;
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${scale}) translate(${-x}px, ${-y}px)`}}>
        <OffthreadVideo src={staticFile(`footage/${src}.mp4`)} muted playbackRate={speed} style={{display: 'block'}} />
      </div>
    </AbsoluteFill>
  );
};

// Painel lateral listando os sensores sobre o clipe "Líder + sensores".
export const SensorPanel: React.FC<{highlights: HL; items: {key: string; text: string}[]; title: string}> = ({highlights, items, title}) => {
  const {fps} = useVideoConfig();
  const h = useHL(highlights);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', right: 50, top: 150, width: 560, background: '#11191bee', border: `3px solid ${C.lime}`, borderRadius: 20, padding: '24px 30px', boxShadow: '0 30px 70px #000a'}}>
        <div style={{fontFamily: FONT.pixel, fontSize: 22, color: C.lime, marginBottom: 14}}>{title}</div>
        {items.map((it) => {
          const on = h.on(it.key);
          const p = on ? spring({frame: h.since(it.key), fps, config: {damping: 14}}) : 0;
          return (
            <div key={it.key} style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 28, color: C.ink, opacity: p, transform: `translateX(${(1 - p) * 40}px)`, padding: '6px 0', borderBottom: `1px solid ${C.line}`}}>
              {it.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Professor (planejador) × aluno (rede): a parte honesta da IA adaptativa.
export const PlannerVsNet: React.FC<{highlights: HL}> = ({highlights}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const h = useHL(highlights);
  const pL = spring({frame, fps, config: {damping: 14}});
  const pR = h.on('aluno') ? spring({frame: h.since('aluno'), fps, config: {damping: 14}}) : 0;
  const flow = h.on('aluno') ? (frame % 40) / 40 : 0;
  return (
    <AbsoluteFill>
      <GridBackground accent={C.lime} />
      <div style={{position: 'absolute', top: 48, width: '100%', textAlign: 'center', fontFamily: FONT.pixel, fontSize: 34, color: C.gold, letterSpacing: 3}}>
        PROFESSOR × ALUNO
      </div>
      <Panel style={{position: 'absolute', left: 140, top: 170, width: 700, height: 560, padding: 40, transform: `scale(${pL})`}} color={C.gold}>
        <div style={{fontSize: 90}}>🔮</div>
        <div style={{fontFamily: FONT.pixel, fontSize: 26, color: C.gold, margin: '16px 0'}}>PLANEJADOR</div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 36, color: C.ink, lineHeight: 1.3}}>conhece a física exata do jogo</div>
        <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 30, color: C.muted, marginTop: 14, lineHeight: 1.35}}>
          simula o futuro antes de agir.
          <br />
          {h.on('gabarito') ? <span style={{color: C.red}}>= fazer a prova com o gabarito do lado</span> : null}
        </div>
      </Panel>
      <div style={{position: 'absolute', left: 860, top: 420, width: 200, height: 10, background: C.line, borderRadius: 5, overflow: 'hidden', opacity: pR}}>
        <div style={{position: 'absolute', left: `${flow * 100 - 20}%`, width: '30%', height: '100%', background: C.gold}} />
      </div>
      <div style={{position: 'absolute', left: 850, top: 360, width: 220, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: C.gold, opacity: pR}}>exemplos</div>
      <Panel style={{position: 'absolute', left: 1080, top: 170, width: 700, height: 560, padding: 40, transform: `scale(${pR})`}} color={C.lime}>
        <div style={{fontSize: 90}}>🧠</div>
        <div style={{fontFamily: FONT.pixel, fontSize: 26, color: C.lime, margin: '16px 0'}}>REDE NEURAL</div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 36, color: C.ink, lineHeight: 1.3}}>imita as decisões do planejador</div>
        <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 30, color: C.muted, marginTop: 14, lineHeight: 1.35}}>
          44 sensores → 32 → 6 ações.
          <br />
          {h.on('quarto') ? <span style={{color: C.lime}}>¼ da população pratica com ela</span> : null}
        </div>
      </Panel>
    </AbsoluteFill>
  );
};

// Texto grande sobre fundo (para piadas/rupturas).
export const BigText: React.FC<{text: string; sub?: string; color?: string}> = ({text, sub, color = C.gold}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame, fps, config: {damping: 10}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <GridBackground accent={color} />
      <div style={{fontFamily: FONT.comic, fontSize: 150, color, letterSpacing: 4, transform: `scale(${p})`, textAlign: 'center', lineHeight: 1, ...strokeText(14)}}>{text}</div>
      {sub ? <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 46, color: C.ink, marginTop: 30, opacity: p}}>{sub}</div> : null}
    </AbsoluteFill>
  );
};
