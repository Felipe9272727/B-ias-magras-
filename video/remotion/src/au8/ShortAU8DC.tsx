// Short Director Cut (1080×1920) — Among IA 8 (O Disfarce Perfeito do Marrom + Defesa "...").
// Estilo thriller vertical 9:16: Skeld ao vivo em 1080×1920, vinheta pulsante de O2, cartões de fala
// com tremor no "...", ejeção vertical no espaço com nebulosa roxa e duelo final ROXO vs MARROM.
import React, {useEffect, useMemo, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Gif} from '@remotion/gif';
import {Crewmate4} from '../amongus/Crewmate4';
import {Cabeca, Chip, corDe, FONTE, PAINEL} from './Hud8';
import {Jogo8, relogio, type Cam, type Log} from './Jogo8';
import {Estrelas} from './Telas8';

type Palavra = {w: string; s: number; e: number};
type Aud = {src: string; at: number; de: number; vol?: number};
type FalaItem = {tipo: 'fala' | 'pensa'; cor: string; texto: string; at: number; dur: number};
type Bloco = {
  id: string;
  tipo: 'mapa_segredo' | 'mapa_revela' | 'reuniao' | 'silencio' | 'ejecao' | 'duelo';
  dur: number;
  t0: number;
  vel: number;
  cam: Cam;
  foco?: string;
  audios: Aud[];
  palavras: Palavra[];
  falas: FalaItem[];
};
type TL = {partida: number; blocos: Bloco[]; dur: number};

export const calcShortAU8DC: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl: TL = await (await fetch(staticFile('short_au8_dc/short_au8_dc.json'))).json();
  return {durationInFrames: tl.dur, props: {tl}};
};

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const CONTORNO = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill'});
const HIGHLIGHT = /^(roxo|marrom|vermelho|detetive|impostores|disfarce|escudo|quatro|três|tres|venceram|votava|defesa|ejetado|comenta)/i;

const LegendaV: React.FC<{palavras: Palavra[]}> = ({palavras}) => {
  const f = useCurrentFrame();
  if (!palavras.length) return null;
  const grupos: Palavra[][] = [];
  for (let i = 0; i < palavras.length; i += 3) grupos.push(palavras.slice(i, i + 3));
  const ativo = grupos.find((g) => f >= g[0].s - 2 && f <= g[g.length - 1].e + 8);
  if (!ativo) return null;
  return (
    <div style={{position: 'absolute', left: 48, right: 112, top: 1425, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 24px', pointerEvents: 'none', zIndex: 35}}>
      {ativo.map((p, idx) => {
        const atual = f >= p.s - 1 && f <= p.e + 3;
        const destaque = HIGHLIGHT.test(p.w.replace(/[.,!?:;"'()—]/g, ''));
        return (
          <span
            key={`${p.s}_${idx}`}
            style={{
              fontFamily: FONTE,
              fontWeight: 900,
              fontSize: atual ? 74 : 66,
              lineHeight: 1.08,
              color: destaque ? '#ffd84d' : atual ? '#fff' : '#e2e8f0',
              transform: `scale(${atual ? 1.08 : 1})`, padding: atual ? '0 10px' : '0 2px',
              textShadow: atual ? '0 0 28px rgba(255,216,77,0.45)' : '0 8px 18px rgba(0,0,0,0.85)',
              ...CONTORNO(11),
            }}
          >
            {p.w}
          </span>
        );
      })}
    </div>
  );
};

const FalaCardV: React.FC<{item: FalaItem; log: Log; top?: number}> = ({item, log, top = 1040}) => {
  const f = useCurrentFrame() - item.at;
  const {fps} = useVideoConfig();
  if (f < 0 || f > item.dur) return null;
  const e = spring({frame: f, fps, config: {damping: 13, stiffness: 200}});
  const out = interpolate(f, [item.dur - 7, item.dur], [1, 0], cl);
  const j = log.jogadores.find((x) => x.cor === item.cor);
  const pensa = item.tipo === 'pensa';
  const borda = pensa ? '#c084fc' : item.cor === 'Marrom' ? '#ff5a4a' : '#ffd84d';
  return (
    <div style={{position: 'absolute', left: 42, right: 42, top, opacity: Math.min(1, e) * out, transform: `translateY(${(1 - e) * 60}px)`, zIndex: 28}}>
      <div style={{...PAINEL, border: `5px ${pensa ? 'dashed' : 'solid'} ${borda}`, background: pensa ? 'linear-gradient(180deg, rgba(44,20,78,0.95), rgba(16,8,34,0.98))' : 'linear-gradient(180deg, rgba(15,23,44,0.95), rgba(7,11,24,0.98))', padding: '16px 22px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px 24px', marginBottom: 8}}>
          <Cabeca cor={item.cor} s={68} />
          <div style={{minWidth: 0}}>
            <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 32, color: item.cor === 'Marrom' ? '#ff7a6a' : '#fff', lineHeight: 1}}>{item.cor.toUpperCase()}</div>
            <div style={{fontFamily: FONTE, fontWeight: 700, fontSize: 18, color: '#94a3b8'}}>{j?.modelo ?? ''}</div>
          </div>
          <span style={{marginLeft: 'auto', fontFamily: FONTE, fontWeight: 900, fontSize: 17, letterSpacing: 1.5, color: borda}}>
            {pensa ? 'PENSAMENTO SECRETO' : 'FALOU NA MESA'}
          </span>
        </div>
        <div style={{fontFamily: FONTE, fontWeight: pensa ? 700 : 800, fontStyle: pensa ? 'italic' : undefined, fontSize: item.texto.length <= 4 ? 72 : 36, textAlign: item.texto.length <= 4 ? 'center' : 'left', color: '#fff', lineHeight: 1.2}}>
          “{item.texto}”
        </div>
      </div>
    </div>
  );
};

const SeloImpacto: React.FC<{txt: string; cor: string; at: number; dur?: number; y?: number}> = ({txt, cor, at, dur = 54, y = 410}) => {
  const f = useCurrentFrame() - at;
  const {fps} = useVideoConfig();
  if (f < 0 || f > dur) return null;
  const e = spring({frame: f, fps, config: {damping: 10, stiffness: 240}});
  const out = interpolate(f, [dur - 8, dur], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 36, right: 36, top: y, display: 'flex', justifyContent: 'center', opacity: out, pointerEvents: 'none', zIndex: 30}}>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: txt.length > 18 ? 48 : 60, color: '#fff', background: `linear-gradient(180deg, ${cor}, ${cor}cc)`, border: '7px solid #fff', borderRadius: 20, padding: '8px 34px', textAlign: 'center', transform: `rotate(-3.5deg) scale(${0.5 + 0.5 * e})`, boxShadow: `0 16px 0 #0009, 0 0 42px ${cor}88`, ...CONTORNO(5)}}>
        {txt}
      </div>
    </div>
  );
};

const TopoAU8: React.FC<{mostrarPlacar: boolean}> = ({mostrarPlacar}) => (
  <div style={{position: 'absolute', left: 38, right: 38, top: 68, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', zIndex: 40}}>
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(9,14,30,0.9)', border: '3px solid #c084fc', borderRadius: 12, padding: '4px 18px'}}>
      <span style={{width: 10, height: 10, borderRadius: 99, background: '#c084fc'}} />
      <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 22, color: '#e9d5ff', letterSpacing: 2.5}}>AMONG IA 8 · PARTIDA FINAL</span>
    </div>
    <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 44, color: '#fff', marginTop: 6, textAlign: 'center', lineHeight: 1.08, ...CONTORNO(7)}}>
      O DISFARCE QUE <span style={{color: '#ffd84d'}}>ENGANOU A NAVE</span>
    </div>
    {mostrarPlacar ? (
      <div style={{marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 16, background: 'rgba(11,16,32,0.92)', border: '4px solid #ef4444', borderRadius: 16, padding: '6px 24px', boxShadow: '0 10px 28px #000a'}}>
        <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 28, color: '#c084fc'}}>ROXO 4</span>
        <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 24, color: '#ffd84d'}}>×</span>
        <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 28, color: '#ff6a5a'}}>3 MARROM</span>
      </div>
    ) : null}
  </div>
);

const BlocoAU8: React.FC<{b: Bloco; log: Log}> = ({b, log}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const R = useMemo(() => relogio(b.t0, b.vel, [], log.tiques.length), [b, log]);
  const zoomDe = (g: number) => (b.cam.zoom ?? 1.5) * (1 + 0.08 * (g / Math.max(1, b.dur)));

  if (b.tipo === 'mapa_segredo' || b.tipo === 'mapa_revela') {
    const segredo = b.tipo === 'mapa_segredo';
    const mascara = useMemo(() => {
      if (!segredo) return undefined;
      return {Marrom: 'Roxo'};
    }, [segredo]);
    return (
      <AbsoluteFill>
        <Jogo8 log={log} R={R} cam={b.cam} zoomDe={zoomDe} f={f} foco={b.foco} papeis={!segredo} mascara={mascara} segredo={segredo} w={1080} h={1920} />
        <AbsoluteFill style={{pointerEvents: 'none', boxShadow: `inset 0 0 ${110 + Math.sin(f / 4) * 35}px rgba(220,24,38,${0.32 + 0.14 * Math.sin(f / 4)})`}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,7,18,0.72) 0%, transparent 18%, transparent 70%, rgba(4,7,18,0.88) 100%)', pointerEvents: 'none'}} />
        {segredo ? <SeloImpacto txt="O ROXO ATACOU?!" cor="#7c3aed" at={26} dur={70} y={320} /> : <SeloImpacto txt="ERA O MARROM DISFARÇADO!" cor="#e01818" at={10} dur={74} y={320} />}
        {b.falas.map((fl, i) => (
          <FalaCardV key={i} item={fl} log={log} top={1010} />
        ))}
      </AbsoluteFill>
    );
  }

  if (b.tipo === 'reuniao') {
    const e = spring({frame: f, fps, config: {damping: 12, stiffness: 160}});
    return (
      <AbsoluteFill>
        <Estrelas f={f} vel={2} />
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 42%, rgba(168,85,247,0.28), transparent 62%)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${0.8 + 0.2 * e})`}}>
          <div style={{filter: 'drop-shadow(0 0 36px rgba(168,85,247,0.75))', transform: `translateY(${Math.sin(f / 12) * 10}px)`}}>
            <Crewmate4 cor="Roxo" size={320} t={f} />
          </div>
          <div style={{marginTop: 10, display: 'flex', alignItems: 'center', gap: 12}}>
            <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 52, color: '#e9d5ff', ...CONTORNO(7)}}>ROXO</span>
            <Chip papel="Detetive" time="tripulante" fs={24} />
          </div>
        </div>
        {b.falas.map((fl, i) => (
          <FalaCardV key={i} item={fl} log={log} top={980} />
        ))}
        <SeloImpacto txt="O DETETIVE TAVA CERTO!" cor="#16a34a" at={Math.max(40, b.dur - 72)} dur={66} y={840} />
      </AbsoluteFill>
    );
  }

  if (b.tipo === 'silencio') {
    const tr = f < 16 ? Math.sin(f * 3.1) * (16 - f) * 1.1 : 0;
    const eDots = spring({frame: f - 4, fps, config: {damping: 9, stiffness: 260}});
    return (
      <AbsoluteFill style={{transform: `translate(${tr}px, ${tr * 0.6}px)`}}>
        <Estrelas f={f} vel={1.5} />
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 44%, rgba(220,38,38,0.34), rgba(5,8,20,0.92) 70%)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{filter: 'drop-shadow(0 0 36px rgba(239,68,68,0.7))'}}>
            <Crewmate4 cor="Marrom" size={300} t={f} virado />
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px 24px', marginTop: 6}}>
            <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 48, color: '#fecaca', ...CONTORNO(6)}}>MARROM</span>
            <Chip papel="Metamorfo" time="impostor" fs={22} />
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', transform: `scale(${eDots})`}}>
          <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 28, background: '#0b1020ee', border: '8px solid #fff', borderRadius: 28, padding: '44px 76px', boxShadow: '0 22px 60px #000c'}}>
            {[0, 1, 2].map((d) => (
              <div key={d} style={{width: 40, height: 40, borderRadius: 99, background: '#ffd84d', border: '5px solid #000', boxShadow: '0 0 18px rgba(255,216,77,0.65)'}} />
            ))}
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1090, display: 'flex', justifyContent: 'center'}}>
          <div style={{width: 440, height: 290, borderRadius: 20, border: '8px solid #fff', overflow: 'hidden', background: '#000', boxShadow: '0 24px 60px #000c', transform: `rotate(-2deg) scale(${spring({frame: f - 14, fps, config: {damping: 12}})})`}}>
            <Gif src={staticFile('gifs/bruh.gif')} width={440} height={290} fit="cover" style={{width: '100%', height: '100%'}} />
          </div>
        </div>
        <Audio src={staticFile('sfx/record-scratch.mp3')} volume={0.5} />
      </AbsoluteFill>
    );
  }

  if (b.tipo === 'ejecao') {
    const xPos = interpolate(f, [0, b.dur], [-180, 1180], cl);
    const yPos = 540 + Math.sin(f / 14) * 44;
    const eBadge = spring({frame: f - 18, fps, config: {damping: 12, stiffness: 180}});
    return (
      <AbsoluteFill>
        <Estrelas f={f} vel={7} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, rgba(124,58,237,0.34), transparent 62%)'}} />
        {[1, 2, 3, 4].map((k) => (
          <div key={k} style={{position: 'absolute', left: xPos - k * 48 + 40, top: yPos + 96 + Math.sin((f - k * 4) / 12) * 14, width: 32 - k * 5, height: 10 - k * 1.5, borderRadius: 99, background: corDe('Roxo'), opacity: 0.45 - k * 0.08, filter: 'blur(3px)'}} />
        ))}
        <div style={{position: 'absolute', left: xPos, top: yPos, transform: `rotate(${f * 5.8}deg)`, filter: 'drop-shadow(0 0 32px rgba(168,85,247,0.85))'}}>
          <Crewmate4 cor="Roxo" size={230} t={f} />
        </div>
        <div style={{position: 'absolute', left: 40, right: 40, top: 820, textAlign: 'center', transform: `scale(${0.7 + 0.3 * eBadge})`, opacity: eBadge}}>
          <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 66, color: '#fff', ...CONTORNO(9)}}>Roxo foi ejetado.</div>
          <div style={{marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: '10px 24px', fontFamily: FONTE, fontWeight: 900, fontSize: 36, color: '#fde68a', background: 'linear-gradient(180deg, #1e293b, #0f172a)', border: '5px dashed #fbbf24', borderRadius: 16, padding: '6px 26px', boxShadow: '0 0 30px rgba(251,191,36,0.3)'}}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none"><rect x={5} y={11} width={14} height={10} rx={2.5} fill="#fbbf24" stroke="#000" strokeWidth={1.8} /><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#fbbf24" strokeWidth={2.5} strokeLinecap="round" /></svg>
            FUNÇÃO NÃO REVELADA
          </div>
        </div>
        {b.falas.map((fl, i) => (
          <FalaCardV key={i} item={fl} log={log} top={1055} />
        ))}
        <Audio src={staticFile('sfx_au2/ejecao.mp3')} volume={0.65} />
      </AbsoluteFill>
    );
  }

  // duelo final vertical ROXO vs MARROM
  const e1 = spring({frame: f - 4, fps, config: {damping: 12, stiffness: 160}});
  const e2 = spring({frame: f - 10, fps, config: {damping: 12, stiffness: 160}});
  return (
    <AbsoluteFill>
      <Estrelas f={f} vel={3} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 25% 42%, rgba(168,85,247,0.32), transparent 52%), radial-gradient(circle at 75% 42%, rgba(239,68,68,0.32), transparent 52%)'}} />
      <div style={{position: 'absolute', left: 36, right: 36, top: 330, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20}}>
        <div style={{flex: 1, ...PAINEL, border: '6px solid #a855f7', background: 'linear-gradient(180deg, rgba(44,20,78,0.95), rgba(14,10,34,0.98))', padding: '22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transform: `translateX(${(1 - e1) * -90}px)`, opacity: e1}}>
          <Crewmate4 cor="Roxo" size={180} t={f} />
          <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 44, color: '#e9d5ff', ...CONTORNO(6)}}>ROXO</div>
          <Chip papel="Detetive" time="tripulante" fs={18} />
          <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 22, color: '#fff', marginTop: 10, lineHeight: 1.2}}>Caiu inocente 4 x 3</div>
        </div>
        <div style={{flex: 'none', width: 92, height: 92, borderRadius: 99, background: 'linear-gradient(180deg, #ffd84d, #f59e0b)', border: '6px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTE, fontWeight: 900, fontSize: 38, color: '#0b1020', boxShadow: '0 0 36px rgba(255,216,77,0.6)', transform: 'rotate(-6deg)'}}>VS</div>
        <div style={{flex: 1, ...PAINEL, border: '6px solid #ef4444', background: 'linear-gradient(180deg, rgba(72,22,22,0.95), rgba(24,10,14,0.98))', padding: '22px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transform: `translateX(${(1 - e2) * 90}px)`, opacity: e2}}>
          <Crewmate4 cor="Marrom" size={180} t={f + 10} virado />
          <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 44, color: '#fecaca', ...CONTORNO(6)}}>MARROM</div>
          <Chip papel="Metamorfo" time="impostor" fs={18} />
          <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 22, color: '#fff', marginTop: 10, lineHeight: 1.2}}>Defesa: “...” e venceu</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 48, right: 48, top: 960, textAlign: 'center'}}>
        <div style={{display: 'inline-block', fontFamily: FONTE, fontWeight: 900, fontSize: 52, color: '#ff6a5a', ...CONTORNO(9), letterSpacing: 1.5}}>IMPOSTORES VENCEM</div>
        <div style={{marginTop: 14, display: 'inline-block', fontFamily: FONTE, fontWeight: 900, fontSize: 34, color: '#fef08a', background: 'rgba(15,23,42,0.9)', border: '4px solid #ffd84d', borderRadius: 18, padding: '10px 26px'}}>
          EM QUEM VOCÊ VOTAVA? COMENTA AÍ!
        </div>
      </div>
      <Audio src={staticFile('sfx/impact-epic.mp3')} volume={0.5} />
    </AbsoluteFill>
  );
};

export const ShortAU8DC: React.FC<{tl: TL | null}> = ({tl}) => {
  const f = useCurrentFrame();
  const [log, setLog] = useState<Log | null>(null);
  const [h] = useState(() => delayRender('log short au8 dc'));
  useEffect(() => {
    if (!tl) return;
    fetch(staticFile(`au8/partida${tl.partida}.json`))
      .then((r) => r.json())
      .then((d: Log) => {
        setLog(d);
        continueRender(h);
      });
  }, [tl, h]);
  if (!tl || !log) return null;
  let acc = 0;
  let curTipo: Bloco['tipo'] = 'mapa_segredo';
  for (const b of tl.blocos) {
    if (f >= acc && f < acc + b.dur) curTipo = b.tipo;
    acc += b.dur;
  }
  acc = 0;
  return (
    <AbsoluteFill style={{background: '#050814'}}>
      {tl.blocos.map((b) => {
        const from = acc;
        acc += b.dur;
        return (
          <Sequence key={b.id} from={from} durationInFrames={b.dur}>
            <BlocoAU8 b={b} log={log} />
            <LegendaV palavras={b.palavras} />
            {b.audios.map((a, i) => (
              <Sequence key={`a${i}`} from={a.at}>
                <Audio src={staticFile(a.src)} startFrom={a.de} volume={a.vol ?? 1} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      <TopoAU8 mostrarPlacar={curTipo === 'ejecao' || curTipo === 'duelo'} />
    </AbsoluteFill>
  );
};
