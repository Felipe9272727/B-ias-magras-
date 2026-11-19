// Short Director Cut (1080×1920) — Interrogatório das IAs 2 · Caso 6 (A Ópera no Armário do GLM).
// Estilo Phoenix Wright / Ace Attorney vertical: speedlines radiais, cortes de protesto, câmera dinâmica
// entre MiniMax e GLM, monitor de estresse ao vivo, memes encaixados na zona segura e legendas cinéticas.
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Gif} from '@remotion/gif';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {Som as Sfx} from './ShortKit';
import {ASSENTO, SalaInterrogatorio} from './Sala';
import {IAS, Personagem, type Expressao, type IA} from './Personagens';
import {Carimbo, MonitorEstresse} from './Hud';

type Palavra = {w: string; s: number; e: number; ia?: string};
type Aud = {src: string; at: number; de: number; ate?: number; ia?: string};
type Bloco = {id: string; dur: number; audios: Aud[]; palavras: Palavra[]};

export const calcShortInt2DC: CalculateMetadataFunction<{blocos: Bloco[] | null}> = async () => {
  const so = await (await fetch(staticFile('short_int2_dc/short_int2_dc.json'))).json();
  return {durationInFrames: so.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0), props: {blocos: so.blocos}};
};

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const CONTORNO = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill'});
const DET: IA = 'minimax';
const SUS: IA = 'glm';
const HIGHLIGHT = /^(cachorro|ópera|opera|armário|armario|veterinário|veterinario|culpado|inocente|fifí|fifi|glm|minimax|bom|garoto|uivo|outra|coisa|calouros|comenta)/i;

const quemFala = (b: Bloco, f: number) => b.audios.find((a) => a.ia && f >= a.at && f <= a.at + (a.ate ?? 0))?.ia as IA | undefined;
const falaIA = (b: Bloco, n = 1) => b.audios.filter((a) => a.ia)[n - 1];
const textoIA = (b: Bloco, a: Aud) =>
  b.palavras
    .filter((p) => p.ia === a.ia && p.s >= a.at - 4 && p.s <= a.at + (a.ate ?? 0) + 18)
    .map((p) => p.w)
    .join(' ')
    .replace(/Gê Éle Ême/g, 'GLM')
    .replace(/Mini Mécs/g, 'MiniMax');

// Speedlines radiais estilo Ace Attorney / anime
const Speedlines: React.FC<{cor?: string; op?: number}> = ({cor = '#ffd84d', op = 0.28}) => {
  const f = useCurrentFrame();
  return (
    <svg width={1080} height={1920} viewBox="-540 -960 1080 1920" style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: op}}>
      {Array.from({length: 36}).map((_, i) => {
        const ang = (i * 10 + (f * 3) % 10) * (Math.PI / 180);
        const r1 = 260 + ((i * 37 + f * 11) % 180);
        const r2 = 1200;
        const w = i % 3 === 0 ? 7 : 3;
        return (
          <line
            key={i}
            x1={Math.cos(ang) * r1}
            y1={Math.sin(ang) * r1}
            x2={Math.cos(ang) * r2}
            y2={Math.sin(ang) * r2}
            stroke={i % 2 === 0 ? cor : '#ffffff'}
            strokeWidth={w}
            opacity={0.45 + (i % 3) * 0.2}
          />
        );
      })}
    </svg>
  );
};

// Faixa diagonal de impacto Ace Attorney ("PROTESTO!", "VETERINÁRIO?!", "ÓPERA NO ARMÁRIO!")
const SlashBanner: React.FC<{txt: string; cor: string; at: number; dur?: number; y?: number}> = ({txt, cor, at, dur = 52, y = 780}) => {
  const f = useCurrentFrame() - at;
  const {fps} = useVideoConfig();
  if (f < 0 || f > dur) return null;
  const e = spring({frame: f, fps, config: {damping: 10, stiffness: 260}});
  const out = interpolate(f, [dur - 8, dur], [1, 0], cl);
  const flash = interpolate(f, [0, 5], [0.55, 0], cl);
  return (
    <>
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', left: -80, right: -80, top: y, transform: `rotate(-4.5deg) scale(${0.5 + 0.5 * e})`, opacity: out, pointerEvents: 'none', zIndex: 25}}>
        <div style={{background: `linear-gradient(90deg, #090d1a, ${cor} 18%, ${cor} 82%, #090d1a)`, borderTop: '8px solid #fff', borderBottom: '8px solid #fff', padding: '14px 40px', textAlign: 'center', boxShadow: `0 18px 50px #000c, 0 0 50px ${cor}aa`}}>
          <span style={{fontFamily: FONT.comic, fontWeight: 900, fontSize: txt.length > 16 ? 62 : 76, letterSpacing: 3, color: '#fff', ...CONTORNO(9)}}>{txt}</span>
        </div>
      </div>
    </>
  );
};

// Meme na zona segura esquerda (nunca bate nos botões do YouTube Shorts nem na legenda)
const MemeBox: React.FC<{file: string; at: number; dur: number; y?: number}> = ({file, at, dur, y = 840}) => {
  const f = useCurrentFrame() - at;
  const {fps} = useVideoConfig();
  if (f < 0 || f > dur) return null;
  const e = spring({frame: f, fps, config: {damping: 12, stiffness: 220}});
  const out = interpolate(f, [dur - 7, dur], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 52, top: y, width: 390, height: 270, borderRadius: 18, border: '8px solid #fff', overflow: 'hidden', background: '#000', boxShadow: '0 20px 50px #000c', transform: `rotate(-2.5deg) scale(${e * out})`, opacity: Math.min(1, f / 3) * out, zIndex: 22}}>
      <Gif src={staticFile(`gifs/${file}`)} width={390} height={270} fit="cover" style={{width: '100%', height: '100%'}} />
    </div>
  );
};

// Legenda cinética palavra-a-palavra (100% na zona segura do Shorts: y=1410, longe do rodapé do YouTube)
const LegendaDC: React.FC<{palavras: Palavra[]}> = ({palavras}) => {
  const f = useCurrentFrame();
  const narr = palavras.filter((p) => !p.ia);
  if (!narr.length) return null;
  const grupos: Palavra[][] = [];
  for (let i = 0; i < narr.length; i += 4) grupos.push(narr.slice(i, i + 4));
  const ativo = grupos.find((g) => f >= g[0].s - 2 && f <= g[g.length - 1].e + 8);
  if (!ativo) return null;
  return (
    <div style={{position: 'absolute', left: 48, right: 112, top: 1410, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 24px', pointerEvents: 'none', zIndex: 30}}>
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
              fontSize: atual ? 74 : 66,
              lineHeight: 1.08,
              color: destaque ? '#ffd84d' : atual ? '#fff' : jaFoi ? '#f1f5f9' : '#94a3b8',
              transform: `scale(${atual ? 1.08 : 1})`, padding: atual ? '0 10px' : '0 2px', padding: atual ? '0 10px' : '0 2px',
              textShadow: atual ? '0 0 28px rgba(255,216,77,0.45)' : '0 8px 18px rgba(0,0,0,0.8)',
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

// Cartão de fala de tribunal Ace Attorney
const FalaCourt: React.FC<{b: Bloco; a?: Aud; top?: number}> = ({b, a, top = 248}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!a || f < a.at || f > a.at + (a.ate ?? 0) + 12) return null;
  const k = spring({frame: f - a.at, fps, config: {damping: 13, stiffness: 220}});
  const out = interpolate(f, [a.at + (a.ate ?? 0), a.at + (a.ate ?? 0) + 12], [1, 0], cl);
  const ia = a.ia as IA;
  const ehDet = ia === DET;
  const txt = textoIA(b, a);
  return (
    <div style={{position: 'absolute', left: 44, right: 44, top, opacity: k * out, transform: `translateY(${(1 - k) * -45}px)`, zIndex: 20}}>
      <div style={{background: 'linear-gradient(180deg, rgba(11,18,38,0.94), rgba(6,10,24,0.97))', borderRadius: 24, border: `5px solid ${ehDet ? '#ff5a4a' : '#ffd84d'}`, padding: '16px 24px 20px', boxShadow: '0 18px 42px rgba(0,0,0,0.75)'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8}}>
          <span style={{display: 'inline-block', padding: '3px 14px', borderRadius: 10, border: '3px solid #000', background: IAS[ia].cor, color: '#fff', fontFamily: FONT.comic, fontSize: 28, letterSpacing: 2}}>
            {IAS[ia].nome.toUpperCase()} · {ehDet ? 'DETETIVE' : 'SUSPEITO'}
          </span>
          <span style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 18, color: '#94a3b8', letterSpacing: 2}}>DEPOIMENTO REAL</span>
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: txt.length > 110 ? 34 : 38, lineHeight: 1.2, color: '#fff'}}>“{txt}”</div>
      </div>
    </div>
  );
};

// Sala vertical com câmera dinâmica de estúdio + monitor de estresse
const SalaV: React.FC<{
  b: Bloco;
  foco?: IA;
  estresse: number;
  exprSus: Expressao;
  exprDet: Expressao;
  acaoDet?: 'apontar' | 'bater_mesa' | 'cruzar_bracos' | 'mao_no_queixo' | 'nenhuma';
  zoomExtra?: number;
}> = ({b, foco, estresse, exprSus, exprDet, acaoDet = 'nenhuma', zoomExtra = 1}) => {
  const f = useCurrentFrame();
  const E = (1920 / 1080) * zoomExtra;
  let cx = 0;
  for (let i = 0; i < 12; i++) {
    const q = quemFala(b, f - i) ?? foco ?? SUS;
    cx += q === DET ? ASSENTO.detetive.x : ASSENTO.suspeito.x;
  }
  cx /= 12;
  const fq = quemFala(b, f);
  const boneco = (ia: IA, papel: 'detetive' | 'suspeito') => (
    <div style={{position: 'absolute', left: ASSENTO.altura / 2, top: ASSENTO.altura}}>
      <Personagem
        ia={ia}
        expressao={papel === 'suspeito' ? exprSus : exprDet}
        falando={fq === ia}
        t={f + (papel === 'suspeito' ? 27 : 0)}
        virado={papel === 'detetive' ? 'direita' : 'esquerda'}
        altura={ASSENTO.altura}
        estresse={papel === 'suspeito' ? estresse / 100 : 0.08}
        acao={papel === 'detetive' ? acaoDet : 'nenhuma'}
      />
    </div>
  );
  return (
    <AbsoluteFill style={{background: '#050814', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 540 - cx * E, top: (1 - zoomExtra) * 420, width: 1920, height: 1080, transform: `scale(${E})`, transformOrigin: '0 0'}}>
        <SalaInterrogatorio
          camera={{x: 0, zoom: 1}}
          relogio="03:00"
          luz={estresse > 92 ? 0.82 + 0.18 * Math.abs(Math.sin(f / 5)) : 1}
          tremor={estresse > 96 ? 0.18 : 0}
          detetive={boneco(DET, 'detetive')}
          suspeito={boneco(SUS, 'suspeito')}
        />
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,7,18,0.72) 0%, transparent 18%, transparent 72%, rgba(4,7,18,0.88) 100%)', pointerEvents: 'none'}} />
      <div style={{position: 'absolute', left: 44, top: 1120, transform: 'rotate(-2deg) scale(0.84)', transformOrigin: '0 0'}}>
        <MonitorEstresse estresse={estresse} bpm={Math.round(70 + estresse * 0.86)} t={f} largura={420} altura={248} />
      </div>
    </AbsoluteFill>
  );
};

// Topo fixo de caso policial
const TopoCaso: React.FC = () => (
  <div style={{position: 'absolute', left: 40, right: 40, top: 68, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', zIndex: 35}}>
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(9,14,30,0.9)', border: '3px solid #ffd84d', borderRadius: 12, padding: '4px 18px'}}>
      <span style={{width: 10, height: 10, borderRadius: 99, background: '#ef4444'}} />
      <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 22, color: '#ffd84d', letterSpacing: 2.5}}>INTERROGATÓRIO DAS IAs 2 · CASO 06</span>
    </div>
    <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: '#fff', marginTop: 6, letterSpacing: 1, textAlign: 'center', ...CONTORNO(7)}}>
      O UIVO DAS <span style={{color: '#ff5a4a'}}>3 DA MANHÃ</span>
    </div>
  </div>
);


const CarimboV: React.FC<{texto: string; cor: string; at: number; y: number; rot?: number}> = ({
  texto,
  cor,
  at,
  y,
  rot = -8,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const dt = f - at;
  const k = spring({frame: dt, fps: 30, config: {damping: 9, stiffness: 320, mass: 0.65}});
  const escala = 2.15 - 1.15 * k;
  const tremor = dt < 20 ? Math.sin(dt * 2.4) * (1 - dt / 20) * 14 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 540,
        top: y,
        transform: `translate(-50%, -50%) translate(${tremor}px, ${tremor * 0.4}px) rotate(${rot}deg) scale(${escala})`,
        opacity: Math.min(1, dt / 3),
        pointerEvents: 'none',
        zIndex: 30,
      }}
    >
      <div
        style={{
          fontFamily: FONT.display,
          fontWeight: 900,
          fontSize: 108,
          letterSpacing: 6,
          color: cor,
          padding: '10px 38px',
          border: `10px solid ${cor}`,
          borderRadius: 18,
          background: 'rgba(6,8,16,0.72)',
          textShadow: '0 6px 24px #000c',
          boxShadow: `0 18px 46px rgba(0,0,0,0.75), 0 0 36px ${cor}66`,
          whiteSpace: 'nowrap',
        }}
      >
        {texto}
      </div>
    </div>
  );
};

const BlocoView: React.FC<{b: Bloco}> = ({b}) => {
  const f = useCurrentFrame();
  const a1 = falaIA(b, 1);

  if (b.id === 'gancho') {
    return (
      <AbsoluteFill>
        <SalaV b={b} foco={SUS} estresse={98} exprSus="suando" exprDet="bravo" acaoDet="apontar" zoomExtra={interpolate(f, [0, b.dur], [1.14, 1.02], cl)} />
        <Speedlines cor="#ef4444" op={0.25} />
        <SlashBanner txt="PROTESTO!" cor="#e01818" at={4} dur={48} y={660} />
        <SlashBanner txt="ERA OUTRA COISA..." cor="#7c3aed" at={Math.max(45, b.dur - 58)} dur={54} y={770} />
        <Sfx src="impact-epic" at={2} vol={0.55} />
        <Sfx src="record-scratch" at={Math.max(45, b.dur - 58)} vol={0.48} />
      </AbsoluteFill>
    );
  }
  if (b.id === 'pistas') {
    return (
      <AbsoluteFill>
        <SalaV b={b} foco={SUS} estresse={74} exprSus="nervoso" exprDet="desconfiado" acaoDet="mao_no_queixo" />
        <FalaCourt b={b} a={a1} top={236} />
        {a1 ? <SlashBanner txt="CASACO CHAMADO FIFÍ" cor="#d97706" at={a1.at + 38} dur={58} y={810} /> : null}
        <Sfx src="batida-porta" at={2} vol={0.4} />
        {a1 ? <Sfx src="ba-dum-tss" at={a1.at + 45} vol={0.42} /> : null}
      </AbsoluteFill>
    );
  }
  if (b.id === 'tropeco') {
    return (
      <AbsoluteFill>
        <SalaV b={b} foco={SUS} estresse={94} exprSus="suando" exprDet="confiante" acaoDet="apontar" />
        <FalaCourt b={b} a={a1} top={236} />
        {a1 ? <SlashBanner txt="VETERINÁRIO NÃO!!" cor="#dc2626" at={a1.at + Math.max(40, (a1.ate ?? 120) - 70)} dur={66} y={555} /> : null}
        {a1 ? <MemeBox file="homer-panic.gif" at={a1.at + Math.max(40, (a1.ate ?? 120) - 65)} dur={68} y={850} /> : null}
        {a1 ? <Sfx src="record-scratch" at={a1.at + Math.max(40, (a1.ate ?? 120) - 70)} vol={0.52} /> : null}
      </AbsoluteFill>
    );
  }
  if (b.id === 'veredito') {
    const tremor = f < 16 ? Math.sin(f * 3) * (16 - f) * 0.9 : 0;
    return (
      <AbsoluteFill style={{transform: `translate(${tremor}px, ${tremor * 0.6}px)`}}>
        <SalaV b={b} foco={DET} estresse={100} exprSus="suando" exprDet="bravo" acaoDet="bater_mesa" />
        <Speedlines cor="#ff5a4a" op={0.22} />
        <FalaCourt b={b} a={a1} top={236} />
        <CarimboV texto="CULPADO!" cor="#ef4444" at={(a1?.at ?? 20) + 68} y={810} rot={-9} />
        <Sfx src="boom" at={(a1?.at ?? 20) + 68} vol={0.6} />
      </AbsoluteFill>
    );
  }
  if (b.id === 'confissao') {
    return (
      <AbsoluteFill>
        <SalaV b={b} foco={SUS} estresse={100} exprSus="suando" exprDet="desconfiado" acaoDet="nenhuma" zoomExtra={1.06} />
        <Speedlines cor="#ffd84d" op={0.34} />
        <FalaCourt b={b} a={a1} top={236} />
        <SlashBanner txt="ÓPERA NO ARMÁRIO!" cor="#9333ea" at={138} dur={74} y={555} />
        <MemeBox file="shocked-krabs.gif" at={142} dur={84} y={840} />
        <Sfx src="impact-epic" at={138} vol={0.55} />
      </AbsoluteFill>
    );
  }
  // fim: Plot Twist INOCENTE + CTA
  const eCard = spring({frame: f - 8, fps: 30, config: {damping: 12, stiffness: 170}});
  return (
    <AbsoluteFill>
      <SalaV b={b} foco={SUS} estresse={12} exprSus="neutro" exprDet="bravo" acaoDet="cruzar_bracos" />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(16,185,129,0.22), rgba(4,7,18,0.86) 75%)'}} />
      <Speedlines cor="#34d399" op={0.22} />
      <CarimboV texto="INOCENTE!" cor="#22c55e" at={4} y={390} rot={-6} />
      <div style={{position: 'absolute', left: 56, right: 56, top: 560, background: 'linear-gradient(180deg, rgba(15,23,42,0.95), rgba(7,11,24,0.98))', border: '6px solid #ffd84d', borderRadius: 28, padding: '26px 28px', textAlign: 'center', boxShadow: '0 24px 60px #000c', transform: `scale(${0.7 + 0.3 * eCard})`, opacity: eCard, zIndex: 24}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#a7f3d0', letterSpacing: 1.5}}>VEREDITO REAL</div>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 52, color: '#fff', lineHeight: 1.12, marginTop: 8, ...CONTORNO(6)}}>
          CANTOR DE ÓPERA NO ARMÁRIO
        </div>
        <div style={{height: 4, width: '70%', margin: '18px auto', background: 'linear-gradient(90deg, transparent, #ffd84d, transparent)'}} />
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#ffd84d', lineHeight: 1.15, ...CONTORNO(5)}}>
          VOCÊ CONDENAVA OU LIBERAVA O GLM?
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1035, display: 'flex', justifyContent: 'center', zIndex: 22}}><div style={{width: 420, height: 270, borderRadius: 20, border: '8px solid #fff', overflow: 'hidden', background: '#000', boxShadow: '0 22px 54px #000c', transform: 'rotate(-2deg)'}}><Gif src={staticFile('gifs/not-stonks.gif')} width={420} height={270} fit='cover' style={{width: '100%', height: '100%'}} /></div></div>
      <Sfx src="correct-ding" at={4} vol={0.55} />
    </AbsoluteFill>
  );
};

export const ShortInt2DC: React.FC<{blocos: Bloco[] | null}> = ({blocos}) => {
  const [h] = useState(() => delayRender('fontes short int2 dc'));
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
              <Sequence key={`a${i}`} from={a.at} durationInFrames={a.ate ? a.ate + 4 : undefined}>
                <Audio src={staticFile(a.src)} startFrom={a.de} volume={1} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      <TopoCaso />
    </AbsoluteFill>
  );
};
