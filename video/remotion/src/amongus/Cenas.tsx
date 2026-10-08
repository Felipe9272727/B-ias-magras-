import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crewmate, COR} from './Crewmate';
import {ORDEM, papelDe, Partida, siglaModelo} from './dados';
import {FONT} from '../theme';

const ESPACO: React.CSSProperties = {background: 'radial-gradient(ellipse at 50% 35%, #1b2550 0%, #05060c 75%)'};

const Estrelas: React.FC<{vel?: number}> = ({vel = 0.6}) => {
  const f = useCurrentFrame();
  const stars = React.useMemo(() => Array.from({length: 160}, (_, i) => ({x: (i * 7919) % 1920, y: (i * 104729) % 1080, r: 1 + (i % 3)})), []);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      {stars.map((s, i) => (
        <circle key={i} cx={(s.x - f * vel * (1 + (i % 3)) + 19200) % 1920} cy={s.y} r={s.r} fill="#fff" opacity={0.25 + (i % 4) * 0.15} />
      ))}
    </svg>
  );
};

export const Badge: React.FC<{modelo: string; size?: number}> = ({modelo, size = 16}) => {
  const ds = siglaModelo(modelo) === 'DeepSeek';
  return (
    <span style={{fontSize: size, fontWeight: 800, padding: '3px 10px', borderRadius: 9, background: ds ? '#2f6bff' : '#d97a47', color: '#fff', fontFamily: FONT.display}}>
      {ds ? 'DeepSeek' : 'Haiku'}
    </span>
  );
};

// ---------------------------------------------------------------- título de capítulo
export const AUTitulo: React.FC<{kicker?: string; title: string; subtitle?: string; color?: string}> = ({kicker, title, subtitle, color = '#ff4d4d'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 13}});
  const s2 = spring({frame: frame - 8, fps, config: {damping: 15}});
  return (
    <AbsoluteFill style={{...ESPACO, alignItems: 'center', justifyContent: 'center'}}>
      <Estrelas />
      {ORDEM.map((c, i) => {
        const ang = (i / 8) * Math.PI * 2 + frame / 140;
        return (
          <div key={c} style={{position: 'absolute', left: 960 + Math.cos(ang) * 820 - 40, top: 540 + Math.sin(ang) * 420 - 48, transform: `rotate(${frame * (i % 2 ? 1.2 : -1)}deg)`, opacity: 0.85}}>
            <Crewmate cor={c} size={80} />
          </div>
        );
      })}
      {kicker && (
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 38, color: '#cfd6f5', letterSpacing: 6, textTransform: 'uppercase', opacity: s2, marginBottom: 10}}>
          {kicker}
        </div>
      )}
      <div
        style={{
          fontFamily: FONT.display, fontWeight: 900, fontSize: title.length > 26 ? 92 : 124, color, textAlign: 'center', maxWidth: 1560, lineHeight: 1.02,
          transform: `scale(${0.6 + 0.4 * s})`, textShadow: '0 8px 0 #000, 0 0 40px rgba(0,0,0,.6)', WebkitTextStroke: '3px #000',
        }}
      >
        {title}
      </div>
      {subtitle && <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 40, color: '#fff', marginTop: 26, opacity: s2, textAlign: 'center', maxWidth: 1400}}>{subtitle}</div>}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- elenco
export const AUElenco: React.FC<{p: Partida; revelar?: boolean}> = ({p, revelar}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{...ESPACO, alignItems: 'center'}}>
      <Estrelas />
      <div style={{marginTop: 70, fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '0 6px 0 #000'}}>
        {revelar ? 'O ELENCO' : '8 IAs · 2 IMPOSTORES ESCONDIDOS'}
      </div>
      <div style={{display: 'flex', gap: 26, marginTop: 120, alignItems: 'flex-end'}}>
        {ORDEM.map((cor, i) => {
          const j = papelDe(p, cor);
          const s = spring({frame: frame - i * 5, fps, config: {damping: 12}});
          const imp = revelar && j.time === 'impostor';
          return (
            <div key={cor} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transform: `translateY(${(1 - s) * 300}px)`, opacity: s}}>
              <div style={{transform: `translateY(${Math.sin((frame + i * 9) / 9) * 6}px)`}}>
                <Crewmate cor={cor} size={150} />
              </div>
              <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: imp ? '#ff4d4d' : '#fff'}}>{cor}</div>
              <Badge modelo={j.modelo} size={20} />
            </div>
          );
        })}
      </div>
      <div style={{display: 'flex', gap: 60, marginTop: 90, fontFamily: FONT.display, fontWeight: 800, fontSize: 36}}>
        <span style={{color: '#7fa6ff'}}>4 × DeepSeek Flash</span>
        <span style={{color: '#fff'}}>vs</span>
        <span style={{color: '#ffab7a'}}>4 × Claude Haiku</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- papéis
const PAPEIS = [
  {n: 'Impostor', t: 'mata, usa dutos, sabota', c: '#ff4d4d'},
  {n: 'Metamorfo', t: 'impostor que se disfarça de outra cor', c: '#ff4d4d'},
  {n: 'Engenheiro', t: 'tripulante que pode usar dutos', c: '#7fd1ff'},
  {n: 'Cientista', t: 'vê quem está vivo ou morto', c: '#7fd1ff'},
  {n: 'Rastreador', t: 'segue um jogador pelo mapa', c: '#7fd1ff'},
  {n: 'Barulhento', t: 'quando morre, dispara um alarme', c: '#7fd1ff'},
  {n: 'Tripulante', t: 'faz tarefas e caça impostores', c: '#7fd1ff'},
];
export const AURegras: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {durationInFrames} = useVideoConfig();
  void durationInFrames;
  return (
    <AbsoluteFill style={{...ESPACO, padding: 80}}>
      <Estrelas vel={0.3} />
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 62, color: '#fff', textAlign: 'center', marginBottom: 40, textShadow: '0 6px 0 #000'}}>OS PAPÉIS</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, padding: '0 120px'}}>
        {PAPEIS.map((r, i) => {
          const s = spring({frame: frame - 12 - i * 22, fps, config: {damping: 14}});
          return (
            <div key={r.n} style={{display: 'flex', alignItems: 'center', gap: 22, background: '#eef1f8', border: `6px solid ${r.c === '#ff4d4d' ? '#c00' : '#0b0d14'}`, borderRadius: 20, padding: '14px 24px', transform: `scale(${s})`, opacity: s}}>
              <Crewmate cor={ORDEM[(i * 3) % 8]} size={70} />
              <div>
                <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 36, color: r.c === '#ff4d4d' ? '#c00' : '#0b0d14'}}>{r.n}</div>
                <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 26, color: '#333'}}>{r.t}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- o prompt que a IA recebe
export const AUPrompt: React.FC<{texto: string; resposta: string}> = ({texto, resposta}) => {
  const frame = useCurrentFrame();
  const n = Math.floor(interpolate(frame, [10, 10 + texto.length * 0.35], [0, texto.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const fimTexto = 10 + texto.length * 0.35;
  const r = Math.floor(interpolate(frame, [fimTexto + 40, fimTexto + 40 + resposta.length * 0.6], [0, resposta.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <AbsoluteFill style={{background: '#0a0d14', padding: '60px 90px', gap: 26}}>
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#7fd1ff'}}>📥 O QUE A IA RECEBE (só texto!)</div>
      <pre style={{margin: 0, fontFamily: FONT.mono, fontSize: 27, lineHeight: 1.32, color: '#d7e3ff', background: '#121826', border: '4px solid #2a3550', borderRadius: 16, padding: 26, whiteSpace: 'pre-wrap'}}>
        {texto.slice(0, n)}
        <span style={{opacity: frame % 20 < 10 ? 1 : 0}}>▌</span>
      </pre>
      {r > 0 && (
        <div style={{fontFamily: FONT.mono, fontSize: 28, color: '#ffe27a', background: '#2b1d05', border: '4px solid #8a6514', borderRadius: 16, padding: 22, lineHeight: 1.35}}>
          <b style={{fontFamily: FONT.display, color: '#ffb84d'}}>📤 RESPOSTA DO VERDE: </b>
          {resposta.slice(0, r)}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- pensamento/fala em destaque
export const AUFrase: React.FC<{p: Partida; cor: string; texto: string; modo?: 'pensa' | 'fala' | 'bug'}> = ({p, cor, texto, modo = 'pensa'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const j = papelDe(p, cor);
  const s = spring({frame, fps, config: {damping: 13}});
  const imp = j.time === 'impostor';
  return (
    <AbsoluteFill style={{...ESPACO, alignItems: 'center', justifyContent: 'center', gap: 60, flexDirection: 'row', padding: 100}}>
      <Estrelas vel={0.25} />
      <div style={{transform: `scale(${s}) translateY(${Math.sin(frame / 12) * 8}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <Crewmate cor={cor} size={300} />
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: imp ? '#ff4d4d' : '#fff'}}>{cor}</div>
        <Badge modelo={j.modelo} size={24} />
      </div>
      <div
        style={{
          maxWidth: 1060, background: modo === 'bug' ? '#1a0000' : '#fffdf2', border: `8px solid ${modo === 'bug' ? '#ff3b3b' : imp ? '#c00' : '#000'}`, borderRadius: 40,
          padding: '40px 50px', boxShadow: '0 14px 0 rgba(0,0,0,.45)', transform: `scale(${s})`,
        }}
      >
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: modo === 'bug' ? '#ff6b6b' : imp ? '#c00' : '#555', marginBottom: 12}}>
          {modo === 'pensa' ? '💭 PENSAMENTO SECRETO' : modo === 'bug' ? '⚠️ BUG' : '💬 NO CHAT'}
        </div>
        <div style={{fontFamily: modo === 'bug' ? FONT.mono : FONT.display, fontWeight: 700, fontSize: texto.length > 140 ? 40 : 48, lineHeight: 1.25, color: modo === 'bug' ? '#ffd1d1' : '#111'}}>
          “{texto}”
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- placar das partidas
export const AUPlacar: React.FC<{ps: Record<string, Partida>}> = ({ps}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const linhas = ['1', '2', '3'].map((k) => {
    const p = ps[k];
    const imps = p.jogadores.filter((j) => j.time === 'impostor');
    return {k, p, imps, venc: p.resultado.time, mortes: p.eventos.filter((e) => e.tipo === 'morte').length};
  });
  return (
    <AbsoluteFill style={{...ESPACO, alignItems: 'center', padding: 70}}>
      <Estrelas vel={0.3} />
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 66, color: '#fff', textShadow: '0 6px 0 #000', marginBottom: 40}}>PLACAR DAS 3 PARTIDAS</div>
      {linhas.map((l, i) => {
        const s = spring({frame: frame - 10 - i * 18, fps, config: {damping: 14}});
        return (
          <div key={l.k} style={{display: 'flex', alignItems: 'center', gap: 34, width: 1600, background: '#eef1f8', border: '6px solid #0b0d14', borderRadius: 24, padding: '18px 34px', marginBottom: 24, transform: `translateX(${(1 - s) * 1200}px)`}}>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 44, width: 200}}>Partida {l.k}</div>
            <div style={{display: 'flex', gap: 14, alignItems: 'center', width: 520}}>
              {l.imps.map((j) => (
                <div key={j.cor} style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <Crewmate cor={j.cor} size={56} />
                  <Badge modelo={j.modelo} />
                </div>
              ))}
            </div>
            <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 32, width: 230}}>🔪 {l.mortes} morte{l.mortes === 1 ? '' : 's'}</div>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 38, color: l.venc === 'impostor' ? '#c00' : '#1a7f2b'}}>
              {l.venc === 'impostor' ? 'IMPOSTORES VENCEM' : 'TRIPULANTES VENCEM'}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- comparativo DeepSeek × Haiku
type Stats = Record<'DeepSeek' | 'Haiku', {mortes: number; fingiu: number; dutos: number; votos: number; certos: number}>;
const STAT: Record<string, {titulo: string; sub: string; v: (s: Stats['DeepSeek']) => number; fmt?: (s: Stats['DeepSeek']) => string}> = {
  fingiu: {titulo: '“FINGIR QUE FAZ TAREFA”', sub: 'como impostor · partidas 2 e 3', v: (s) => s.fingiu},
  dutos: {titulo: 'VIAGENS DE DUTO', sub: 'partidas 2 e 3', v: (s) => s.dutos},
  votos: {titulo: 'VOTOS CERTOS COMO TRIPULANTE', sub: 'partidas 2 e 3', v: (s) => (s.votos ? s.certos / s.votos : 0), fmt: (s) => `${s.certos}/${s.votos} · ${Math.round((100 * s.certos) / Math.max(1, s.votos))}%`},
};
export const AUComparativo: React.FC<{stats: Stats; stat: string; p?: Partida}> = ({stats, stat, p}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (stat === 'mvp' && p) return <AUMvp />;
  const cfg = STAT[stat];
  const max = Math.max(cfg.v(stats.DeepSeek), cfg.v(stats.Haiku), 0.0001);
  return (
    <AbsoluteFill style={{...ESPACO, alignItems: 'center', justifyContent: 'center', gap: 50}}>
      <Estrelas vel={0.3} />
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 62, color: '#fff', textShadow: '0 6px 0 #000', textAlign: 'center'}}>{cfg.titulo}</div>
      <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 30, color: '#b9c3e6', marginTop: -30}}>{cfg.sub}</div>
      {(['DeepSeek', 'Haiku'] as const).map((m, i) => {
        const s = spring({frame: frame - 15 - i * 12, fps, config: {damping: 18}});
        const val = cfg.v(stats[m]);
        const w = (val / max) * 1100 * s;
        const cor = m === 'DeepSeek' ? '#2f6bff' : '#d97a47';
        return (
          <div key={m} style={{display: 'flex', alignItems: 'center', gap: 30, width: 1600}}>
            <div style={{width: 260, fontFamily: FONT.display, fontWeight: 900, fontSize: 46, color: cor, textAlign: 'right'}}>{m}</div>
            <div style={{width: Math.max(16, w), height: 96, background: cor, border: '6px solid #000', borderRadius: 18}} />
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 54, color: '#fff'}}>{cfg.fmt ? cfg.fmt(stats[m]) : Math.round(val * s)}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const AUMvp: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const mvps = [
    {cor: 'Laranja', txt: 'Partida 2 · desmascarou os 2 impostores', ok: true},
    {cor: 'Preto', txt: 'Partida 3 · descobriu os 2... e foi expulso', ok: false},
  ];
  return (
    <AbsoluteFill style={{...ESPACO, alignItems: 'center', justifyContent: 'center', gap: 30}}>
      <Estrelas vel={0.3} />
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 70, color: '#ffd84d', textShadow: '0 6px 0 #000'}}>🏆 MVPs (os dois são DeepSeek)</div>
      <div style={{display: 'flex', gap: 120, marginTop: 30}}>
        {mvps.map((m, i) => {
          const s = spring({frame: frame - 10 - i * 20, fps, config: {damping: 12}});
          return (
            <div key={m.cor} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, transform: `scale(${s})`}}>
              <div style={{transform: m.ok ? `translateY(${Math.sin(frame / 8) * 10}px)` : `rotate(${frame * 3}deg)`}}>
                <Crewmate cor={m.cor} size={240} fantasma={!m.ok} />
              </div>
              <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 46, color: '#fff'}}>{m.cor}</div>
              <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 30, color: m.ok ? '#7dff8a' : '#ff8a8a', maxWidth: 520, textAlign: 'center'}}>{m.txt}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- tela final
export const AUFim: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{...ESPACO, alignItems: 'center', justifyContent: 'center'}}>
      <Estrelas />
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 110, color: '#fff', textShadow: '0 8px 0 #000'}}>VALEU, FALOU!</div>
      <div style={{display: 'flex', gap: 10, marginTop: 50}}>
        {ORDEM.map((c, i) => (
          <div key={c} style={{transform: `translateY(${Math.sin((frame + i * 7) / 7) * 14}px)`}}>
            <Crewmate cor={c} size={110} passo={frame / 10} />
          </div>
        ))}
      </div>
      <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 34, color: '#b9c3e6', marginTop: 50}}>se alguém disser que veio pelo duto… é ele.</div>
      <div style={{position: 'absolute', bottom: 40, fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: '#7d86a8'}}>
        Among Us é da Innersloth · este vídeo usa uma recriação própria, feita do zero · músicas: Kevin MacLeod (incompetech.com), CC BY 4.0
      </div>
      <div style={{display: 'none'}}>{COR.Branco.body}</div>
    </AbsoluteFill>
  );
};
