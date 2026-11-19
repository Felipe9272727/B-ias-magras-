// Short Director Cut (1080×1920) — Tribunal das IAs: Assassinato no Museu do Farol.
// Promessa fiel à thumbnail: Safira (ABSOLVIDA) vs Jade (CONDENADA — acertou o assassino e perdeu!) + Rubi ajeitando o anel.
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';

type Palavra = {w: string; s: number; e: number};
type Aud = {src: string; at: number; de: number; ate: number; quem: string; texto: string};
type Bloco = {id: string; dur: number; audios: Aud[]; palavras: Palavra[]};

export const calcShortTribunalDC: CalculateMetadataFunction<{blocos: Bloco[] | null}> = async () => {
  const so = await (await fetch(staticFile('short_tribunal_dc/short_tribunal_dc.json'))).json();
  return {durationInFrames: so.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0), props: {blocos: so.blocos}};
};

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const CONTORNO = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill'});

const QUEM_META: Record<string, {nome: string; modelo: string; cor: string; borda: string}> = {
  Jade: {nome: 'JADE · ADVOGADA', modelo: 'Qwen 3.8 27B', cor: '#16a34a', borda: '#4ade80'},
  Rubi_J: {nome: 'RUBI (RODADA JADE)', modelo: 'Claude Haiku · Testemunha', cor: '#dc2626', borda: '#f87171'},
  Rubi_S: {nome: 'RUBI (RODADA SAFIRA)', modelo: 'Claude Haiku · Testemunha', cor: '#b91c1c', borda: '#fca5a5'},
  Ametista: {nome: 'AMETISTA · JUIZ', modelo: 'DeepSeek V4.1', cor: '#7c3aed', borda: '#c084fc'},
};

const HIGHLIGHT = /^(jade|safira|rubi|assassino|perdeu|ganhou|acertou|absolvida|condenada|prova|mentira|mentiroso|juiz|duas|contratava|esquerda|anel)/i;

const Speedlines: React.FC<{cor?: string; op?: number}> = ({cor = '#ffd84d', op = 0.28}) => {
  const f = useCurrentFrame();
  return (
    <svg width={1080} height={1920} viewBox="-540 -960 1080 1920" style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: op}}>
      {Array.from({length: 36}).map((_, i) => {
        const ang = (i * 10 + ((f * 3) % 10)) * (Math.PI / 180);
        const r1 = 240 + ((i * 41 + f * 12) % 190);
        const r2 = 1220;
        const w = i % 3 === 0 ? 8 : 3.5;
        return (
          <line
            key={i}
            x1={Math.cos(ang) * r1}
            y1={Math.sin(ang) * r1}
            x2={Math.cos(ang) * r2}
            y2={Math.sin(ang) * r2}
            stroke={i % 2 === 0 ? cor : '#ffffff'}
            strokeWidth={w}
            opacity={0.42 + (i % 3) * 0.22}
          />
        );
      })}
    </svg>
  );
};

const BgTribunal: React.FC<{img: string; zoomIni?: number; zoomFim?: number; tint?: string}> = ({
  img,
  zoomIni = 1.04,
  zoomFim = 1.12,
  tint = 'rgba(5,8,18,0.45)',
}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, 320], [zoomIni, zoomFim], cl);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#050814'}}>
      <Img
        src={staticFile(`tribunal/cenarios/${img}`)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${z})`,
          filter: 'contrast(1.08) saturate(1.14)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(4,6,14,0.86) 0%, ${tint} 26%, ${tint} 68%, rgba(4,6,14,0.92) 95%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const SlashBanner: React.FC<{txt: string; cor: string; at: number; dur?: number; y?: number}> = ({
  txt,
  cor,
  at,
  dur = 64,
  y = 540,
}) => {
  const f = useCurrentFrame() - at;
  const {fps} = useVideoConfig();
  if (f < 0 || f > dur) return null;
  const e = spring({frame: f, fps, config: {damping: 10, stiffness: 260}});
  const out = interpolate(f, [dur - 8, dur], [1, 0], cl);
  const flash = interpolate(f, [0, 5], [0.45, 0], cl);
  return (
    <>
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', left: -80, right: -80, top: y, transform: `rotate(-4deg) scale(${0.55 + 0.45 * e})`, opacity: out, pointerEvents: 'none', zIndex: 28}}>
        <div style={{background: `linear-gradient(90deg, #090d1a, ${cor} 18%, ${cor} 82%, #090d1a)`, borderTop: '8px solid #fff', borderBottom: '8px solid #fff', padding: '14px 36px', textAlign: 'center', boxShadow: `0 20px 55px #000c, 0 0 46px ${cor}aa`}}>
          <span style={{fontFamily: FONT.comic, fontWeight: 900, fontSize: txt.length > 18 ? 56 : 72, letterSpacing: 2.5, color: '#fff', ...CONTORNO(9)}}>{txt}</span>
        </div>
      </div>
    </>
  );
};

const CarimboV: React.FC<{texto: string; cor: string; at: number; x?: number; y: number; rot?: number; fs?: number}> = ({
  texto,
  cor,
  at,
  x = 540,
  y,
  rot = -8,
  fs = 104,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const dt = f - at;
  const k = spring({frame: dt, fps: 30, config: {damping: 9, stiffness: 320, mass: 0.65}});
  const escala = 2.1 - 1.1 * k;
  const tremor = dt < 18 ? Math.sin(dt * 2.5) * (1 - dt / 18) * 14 : 0;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translate(${tremor}px, ${tremor * 0.4}px) rotate(${rot}deg) scale(${escala})`, opacity: Math.min(1, dt / 3), pointerEvents: 'none', zIndex: 32}}>
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: fs, letterSpacing: 4, color: cor, padding: '8px 30px', border: `9px solid ${cor}`, borderRadius: 16, background: 'rgba(6,8,16,0.82)', textShadow: '0 6px 24px #000c', boxShadow: `0 18px 46px rgba(0,0,0,0.8), 0 0 34px ${cor}66`, whiteSpace: 'nowrap'}}>
        {texto}
      </div>
    </div>
  );
};

const FalaTribunal: React.FC<{a?: Aud; top?: number}> = ({a, top = 236}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!a || a.quem === 'Narrador') return null;
  if (f < a.at || f > a.at + a.ate + 10) return null;
  const meta = QUEM_META[a.quem] ?? {nome: a.quem.toUpperCase(), modelo: 'IA', cor: '#ffd84d', borda: '#ffd84d'};
  const k = spring({frame: f - a.at, fps, config: {damping: 13, stiffness: 220}});
  const out = interpolate(f, [a.at + a.ate, a.at + a.ate + 10], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 42, right: 42, top, opacity: k * out, transform: `translateY(${(1 - k) * -36}px)`, zIndex: 25}}>
      <div style={{background: 'linear-gradient(180deg, rgba(11,16,34,0.95), rgba(6,9,20,0.98))', borderRadius: 24, border: `5px solid ${meta.borda}`, padding: '16px 24px 20px', boxShadow: '0 20px 48px rgba(0,0,0,0.8)'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8}}>
          <span style={{display: 'inline-block', padding: '4px 14px', borderRadius: 10, border: '3px solid #000', background: meta.cor, color: '#fff', fontFamily: FONT.comic, fontSize: 25, letterSpacing: 1.5}}>
            {meta.nome}
          </span>
          <span style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 18, color: '#cbd5e1', letterSpacing: 1}}>{meta.modelo}</span>
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: a.texto.length > 105 ? 32 : 36, lineHeight: 1.22, color: '#fff'}}>
          “{a.texto}”
        </div>
      </div>
    </div>
  );
};

const LegendaDC: React.FC<{palavras: Palavra[]}> = ({palavras}) => {
  const f = useCurrentFrame();
  if (!palavras.length) return null;
  const grupos: Palavra[][] = [];
  for (let i = 0; i < palavras.length; i += 3) grupos.push(palavras.slice(i, i + 3));
  const ativo = grupos.find((g) => f >= g[0].s - 2 && f <= g[g.length - 1].e + 8);
  if (!ativo) return null;
  return (
    <div style={{position: 'absolute', left: 48, right: 112, top: 1415, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 24px', pointerEvents: 'none', zIndex: 35}}>
      {ativo.map((p, idx) => {
        const atual = f >= p.s - 1 && f <= p.e + 3;
        const jaFoi = f >= p.s - 1;
        const destaque = HIGHLIGHT.test(p.w.replace(/[.,!?:;"'()]/g, ''));
        return (
          <span
            key={`${p.s}_${idx}`}
            style={{
              fontFamily: FONT.display,
              fontWeight: 900,
              fontSize: atual ? 72 : 64,
              lineHeight: 1.08,
              color: destaque ? '#ffd84d' : atual ? '#fff' : jaFoi ? '#f1f5f9' : '#94a3b8',
              transform: `scale(${atual ? 1.08 : 1})`,
              padding: atual ? '0 10px' : '0 2px',
              textShadow: atual ? '0 0 28px rgba(255,216,77,0.5)' : '0 8px 18px rgba(0,0,0,0.85)',
              ...CONTORNO(10),
            }}
          >
            {p.w}
          </span>
        );
      })}
    </div>
  );
};

const LuzesPaciencia: React.FC<{acesas: number; piscaUltimas?: boolean; atPisca?: number}> = ({acesas, piscaUltimas, atPisca = 90}) => {
  const f = useCurrentFrame();
  const apagou = piscaUltimas && f >= atPisca;
  const mostra = apagou ? 0 : acesas;
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(8,12,24,0.92)', border: '4px solid #ffd84d', borderRadius: 16, padding: '10px 22px', boxShadow: '0 14px 34px #000c'}}>
      <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 22, color: '#fde68a', letterSpacing: 1.5, marginRight: 6}}>PACIÊNCIA DO JUIZ</span>
      {Array.from({length: 6}).map((_, i) => {
        const on = i < mostra;
        return (
          <div
            key={i}
            style={{
              width: 28,
              height: 28,
              borderRadius: 99,
              border: '3px solid #000',
              background: on ? '#22c55e' : '#334155',
              boxShadow: on ? '0 0 18px #22c55e' : 'none',
            }}
          />
        );
      })}
      <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 26, color: mostra === 0 ? '#ef4444' : '#fff', marginLeft: 8}}>
        {mostra}/6
      </span>
    </div>
  );
};

const TopoTribunal: React.FC = () => (
  <div style={{position: 'absolute', left: 36, right: 36, top: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', zIndex: 40}}>
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(9,14,30,0.92)', border: '3px solid #ffd84d', borderRadius: 12, padding: '5px 18px'}}>
      <span style={{width: 11, height: 11, borderRadius: 99, background: '#ef4444'}} />
      <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 22, color: '#ffd84d', letterSpacing: 2}}>2 IAs NO TRIBUNAL · CASO DO FAROL</span>
    </div>
    <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: '#fff', marginTop: 6, letterSpacing: 1, textAlign: 'center', ...CONTORNO(7)}}>
      ACERTOU O ASSASSINO E <span style={{color: '#ff4d4d'}}>PERDEU?!</span>
    </div>
  </div>
);

const Sfx: React.FC<{src: string; at: number; vol?: number}> = ({src, at, vol = 0.55}) => (
  <Sequence from={Math.max(0, Math.round(at))}>
    <Audio src={staticFile(`sfx/${src}.mp3`)} volume={vol} />
  </Sequence>
);

const BlocoView: React.FC<{b: Bloco}> = ({b}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const aCur = b.audios.find((x) => f >= x.at && f <= x.at + x.ate + 10);

  if (b.id === 'hook') {
    const tremor = f < 14 ? Math.sin(f * 3.1) * (14 - f) * 1.1 : 0;
    const eSprite = spring({frame: f, fps, config: {damping: 12, stiffness: 180}});
    return (
      <AbsoluteFill style={{transform: `translate(${tremor}px, ${tremor * 0.5}px)`}}>
        <BgTribunal img="tribunal_impacto.jpg" zoomIni={1.08} zoomFim={1.18} />
        <Speedlines cor="#22c55e" op={0.34} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 260, display: 'flex', justifyContent: 'center', transform: `scale(${0.86 + 0.16 * eSprite})`, filter: 'drop-shadow(0 26px 40px #000c)'}}>
          <Img src={staticFile('tribunal/sprites/jade_toma_essa.png')} style={{height: 980, width: 'auto', objectFit: 'contain'}} />
        </div>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 58%, rgba(4,6,14,0.92) 96%)', pointerEvents: 'none'}} />
        <FalaTribunal a={b.audios[0]} top={236} />
        <SlashBanner txt="PROTESTO! TOMA ESSA!" cor="#16a34a" at={6} dur={56} y={620} />
        <Sfx src="batida-porta" at={2} vol={0.65} />
      </AbsoluteFill>
    );
  }

  if (b.id === 'acerto') {
    const eRubi = spring({frame: f - 4, fps, config: {damping: 12, stiffness: 190}});
    return (
      <AbsoluteFill>
        <BgTribunal img="tribunal_testemunha.jpg" zoomIni={1.06} zoomFim={1.14} />
        <Speedlines cor="#ff4d4d" op={0.3} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 320, display: 'flex', justifyContent: 'center', transform: `scale(${0.88 + 0.12 * eRubi})`, filter: 'drop-shadow(0 24px 44px #000c)'}}>
          <Img src={staticFile('tribunal/sprites/rubi_choque.png')} style={{height: 940, width: 'auto', objectFit: 'contain'}} />
        </div>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 58%, rgba(4,6,14,0.94) 96%)', pointerEvents: 'none'}} />
        <div style={{position: 'absolute', left: 56, right: 56, top: 270, textAlign: 'center'}}>
          <div style={{display: 'inline-block', background: '#b91c1c', border: '5px solid #ffd84d', borderRadius: 18, padding: '12px 28px', fontFamily: FONT.display, fontWeight: 900, fontSize: 38, color: '#fff', boxShadow: '0 18px 40px #000c', ...CONTORNO(5)}}>
            ASSASSINO REAL: RUBI (CLAUDE HAIKU)
          </div>
        </div>
        <Sfx src="impact-epic" at={4} vol={0.58} />
      </AbsoluteFill>
    );
  }

  if (b.id === 'mentira') {
    const fase = f < b.audios[1].at ? 0 : f < b.audios[2].at ? 1 : 2;
    return (
      <AbsoluteFill>
        <BgTribunal img="tribunal_geral.jpg" zoomIni={1.03} zoomFim={1.09} tint="rgba(6,9,22,0.58)" />
        <Speedlines cor="#ffd84d" op={0.22} />
        {/* Tela dividida: Rubi (Jade) vs Rubi (Safira) */}
        <div style={{position: 'absolute', left: 32, right: 32, top: 615, height: 690, display: 'flex', gap: 16}}>
          <div style={{flex: 1, borderRadius: 24, overflow: 'hidden', border: `6px solid ${fase === 0 ? '#4ade80' : '#475569'}`, background: 'linear-gradient(180deg, rgba(16,42,28,0.88), rgba(6,12,18,0.96))', position: 'relative', boxShadow: fase === 0 ? '0 0 36px rgba(74,222,128,0.45)' : 'none'}}>
            <div style={{position: 'absolute', top: 14, left: 14, right: 14, textAlign: 'center', background: '#16a34a', borderRadius: 10, padding: '6px 10px', fontFamily: FONT.display, fontWeight: 900, fontSize: 22, color: '#fff', zIndex: 4}}>
              RODADA JADE (VERDE)
            </div>
            <Img src={staticFile('tribunal/sprites/rubi_t_frio.png')} style={{position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', height: 590, width: 'auto', objectFit: 'contain'}} />
            <div style={{position: 'absolute', bottom: 16, left: 12, right: 12, background: 'rgba(6,10,20,0.92)', border: '3px solid #4ade80', borderRadius: 12, padding: '8px 12px', fontFamily: FONT.display, fontWeight: 900, fontSize: 22, color: '#bbf7d0', textAlign: 'center'}}>
              “É o número da fundação!”
            </div>
          </div>

          <div style={{flex: 1, borderRadius: 24, overflow: 'hidden', border: `6px solid ${fase === 2 ? '#60a5fa' : '#475569'}`, background: 'linear-gradient(180deg, rgba(16,32,68,0.88), rgba(6,12,24,0.96))', position: 'relative', boxShadow: fase === 2 ? '0 0 36px rgba(96,165,250,0.45)' : 'none'}}>
            <div style={{position: 'absolute', top: 14, left: 14, right: 14, textAlign: 'center', background: '#2563eb', borderRadius: 10, padding: '6px 10px', fontFamily: FONT.display, fontWeight: 900, fontSize: 22, color: '#fff', zIndex: 4}}>
              RODADA SAFIRA (AZUL)
            </div>
            <Img src={staticFile('tribunal/sprites/rubi_t_ajeita_anel.png')} style={{position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%) scaleX(-1)', height: 590, width: 'auto', objectFit: 'contain'}} />
            <div style={{position: 'absolute', bottom: 16, left: 12, right: 12, background: 'rgba(6,10,20,0.92)', border: '3px solid #60a5fa', borderRadius: 12, padding: '8px 12px', fontFamily: FONT.display, fontWeight: 900, fontSize: 22, color: '#bfdbfe', textAlign: 'center'}}>
              “O Patrocinador SOU EU!”
            </div>
          </div>
        </div>
        <FalaTribunal a={aCur} top={236} />
        {fase >= 1 ? <SlashBanner txt="MESMA IA · MENTIRA OPOSTA" cor="#d97706" at={b.audios[1].at + 6} dur={74} y={530} /> : null}
        <Sfx src="record-scratch" at={b.audios[1].at + 4} vol={0.5} />
      </AbsoluteFill>
    );
  }

  if (b.id === 'sentenca') {
    const tremor = f < 18 ? Math.sin(f * 3) * (18 - f) * 0.9 : 0;
    return (
      <AbsoluteFill style={{transform: `translate(${tremor}px, ${tremor * 0.6}px)`}}>
        <BgTribunal img="bancada_juiz.jpg" zoomIni={1.06} zoomFim={1.15} tint="rgba(22,8,28,0.58)" />
        <Speedlines cor="#ef4444" op={0.28} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 320, display: 'flex', justifyContent: 'center', filter: 'drop-shadow(0 26px 46px #000c)'}}>
          <Img src={staticFile('tribunal/sprites/ametista_martelo.png')} style={{height: 920, width: 'auto', objectFit: 'contain'}} />
        </div>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 55%, rgba(4,6,14,0.95) 95%)', pointerEvents: 'none'}} />
        <FalaTribunal a={b.audios[0]} top={236} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 530, display: 'flex', justifyContent: 'center', zIndex: 28}}>
          <LuzesPaciencia acesas={2} piscaUltimas atPisca={55} />
        </div>
        <CarimboV texto="CONDENADA!" cor="#ef4444" at={68} y={1395} rot={-6} fs={96} />
        <Sfx src="boom" at={68} vol={0.65} />
      </AbsoluteFill>
    );
  }

  // duelo final: Safira ABSOLVIDA vs Jade CONDENADA + Rubi no meio (idêntico à thumb!)
  const eL = spring({frame: f - 4, fps, config: {damping: 12, stiffness: 165}});
  const eR = spring({frame: f - 10, fps, config: {damping: 12, stiffness: 165}});
  const eM = spring({frame: f - 16, fps, config: {damping: 12, stiffness: 165}});
  return (
    <AbsoluteFill>
      <BgTribunal img="tribunal_geral.jpg" zoomIni={1.02} zoomFim={1.08} tint="rgba(6,9,22,0.68)" />
      <Speedlines cor="#ffd84d" op={0.2} />
      <div style={{position: 'absolute', left: 28, right: 28, top: 270, height: 730, display: 'flex', gap: 14}}>
        {/* SAFIRA - ABSOLVIDA */}
        <div style={{flex: 1, borderRadius: 24, overflow: 'hidden', border: '6px solid #3b82f6', background: 'linear-gradient(180deg, rgba(20,52,112,0.92), rgba(8,14,34,0.98))', position: 'relative', transform: `translateX(${(1 - eL) * -90}px)`, opacity: eL, boxShadow: '0 20px 50px #000c'}}>
          <div style={{padding: '14px 12px', textAlign: 'center', background: '#1d4ed8'}}>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 32, color: '#fff', ...CONTORNO(4)}}>SAFIRA</div>
            <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 18, color: '#bfdbfe'}}>Claude Sonnet · 2/6 luzes</div>
          </div>
          <Img src={staticFile('tribunal/sprites/safira_alivio.png')} style={{position: 'absolute', bottom: 86, left: '50%', transform: 'translateX(-50%)', height: 500, width: 'auto', objectFit: 'contain'}} />
          <div style={{position: 'absolute', left: 12, right: 12, bottom: 16, textAlign: 'center', background: '#0b1630ee', border: '4px solid #60a5fa', borderRadius: 14, padding: '8px 6px', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#60a5fa', ...CONTORNO(5)}}>
            ABSOLVIDA!
          </div>
        </div>

        {/* JADE - CONDENADA */}
        <div style={{flex: 1, borderRadius: 24, overflow: 'hidden', border: '6px solid #22c55e', background: 'linear-gradient(180deg, rgba(18,62,38,0.92), rgba(8,18,14,0.98))', position: 'relative', transform: `translateX(${(1 - eR) * 90}px)`, opacity: eR, boxShadow: '0 20px 50px #000c'}}>
          <div style={{padding: '14px 12px', textAlign: 'center', background: '#15803d'}}>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 32, color: '#fff', ...CONTORNO(4)}}>JADE</div>
            <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 18, color: '#bbf7d0'}}>Qwen · Acertou o assassino!</div>
          </div>
          <Img src={staticFile('tribunal/sprites/jade_derrota.png')} style={{position: 'absolute', bottom: 84, left: '50%', transform: 'translateX(-50%)', height: 540, width: 'auto', objectFit: 'contain', clipPath: 'inset(13% 0 0 0)'}} />
          <div style={{position: 'absolute', left: 12, right: 12, bottom: 16, textAlign: 'center', background: '#1f0b10ee', border: '4px solid #ef4444', borderRadius: 14, padding: '8px 6px', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#ff5a5a', ...CONTORNO(5)}}>
            CONDENADA!
          </div>
        </div>
      </div>

      {/* Rubi rindo no centro + CTA */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 1020, background: 'linear-gradient(90deg, rgba(56,12,18,0.96), rgba(15,23,42,0.98))', border: '5px solid #ffd84d', borderRadius: 24, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${0.8 + 0.2 * eM})`, opacity: eM, boxShadow: '0 20px 50px #000c', zIndex: 28}}>
        <Img src={staticFile('tribunal/sprites/rubi_ajeita_anel.png')} style={{height: 170, width: 150, objectFit: 'contain', borderRadius: 16, background: '#1e0b12', border: '3px solid #f87171', flexShrink: 0}} />
        <div>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 22, color: '#fca5a5', letterSpacing: 1}}>O ASSASSINO (RUBI) MENTIU ATÉ O FIM</div>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#ffd84d', lineHeight: 1.15, marginTop: 4, ...CONTORNO(5)}}>
            VOCÊ CONTRATAVA QUAL DAS DUAS?
          </div>
        </div>
      </div>

      <Sfx src="correct-ding" at={4} vol={0.5} />
    </AbsoluteFill>
  );
};

export const ShortTribunalDC: React.FC<{blocos: Bloco[] | null}> = ({blocos}) => {
  const [h] = useState(() => delayRender('fontes short tribunal dc'));
  useEffect(() => {
    fontsReady.then(() => continueRender(h));
  }, [h]);
  if (!blocos) return null;
  let acc = 0;
  return (
    <AbsoluteFill style={{background: '#050814'}}>
      {blocos.map((b) => {
        const from = acc;
        acc += b.dur;
        return (
          <Sequence key={b.id} from={from} durationInFrames={b.dur}>
            <BlocoView b={b} />
            <LegendaDC palavras={b.palavras} />
            {b.audios.map((a, i) => (
              <Sequence key={`a${i}`} from={a.at}>
                <Audio src={staticFile(a.src)} startFrom={a.de} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      <TopoTribunal />
    </AbsoluteFill>
  );
};
