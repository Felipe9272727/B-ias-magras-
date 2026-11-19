// Short Director Cut (1080×1920) — Interrogatório das IAs 1 · Caso 6 (O Sumiço do Peixe Dourado / K-pop do Qwen).
// Estilo Phoenix Wright / Ace Attorney vertical: speedlines radiais, cortes de protesto, câmera dinâmica
// entre DeepSeek e Qwen, monitor de estresse ao vivo, memes encaixados na zona segura e legendas cinéticas.
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Gif} from '@remotion/gif';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {Som as Sfx} from './ShortKit';
import {ASSENTO, SalaInterrogatorio} from './Sala';
import {IAS, Personagem, type Expressao, type IA} from './Personagens';
import {MonitorEstresse} from './Hud';

type Palavra = {w: string; s: number; e: number; ia?: string; eco?: boolean};
type Aud = {src: string; at: number; de: number; ate?: number; ia?: string | null; eco?: boolean};
type Bloco = {id: string; dur: number; audios: Aud[]; palavras: Palavra[]};

export const calcShortInt1DC: CalculateMetadataFunction<{blocos: Bloco[] | null}> = async () => {
  const so = await (await fetch(staticFile('short_int1_dc/short_int1_dc.json'))).json();
  return {durationInFrames: so.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0), props: {blocos: so.blocos}};
};

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const CONTORNO = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill'});
const DET: IA = 'deepseek';
const SUS: IA = 'qwen';
const HIGHLIGHT = /^(peixe|bolhinha|qwen|deepseek|blefe|primo|dieta|assado|culpado|k-pop|coreografia|post-it|vergonha|inocente|faxineira|exposto|condenava|liberava|segredo)/i;

const quemFala = (b: Bloco, f: number) =>
  b.audios.find((a) => a.ia && f >= a.at && f <= a.at + (a.ate ?? 0))?.ia as IA | undefined;

const audioIAAtivo = (b: Bloco, f: number) =>
  b.audios.find((a) => a.ia && f >= a.at && f <= a.at + (a.ate ?? 0) + 10);

const textoIA = (b: Bloco, a: Aud) =>
  b.palavras
    .filter((p) => p.ia === a.ia && Boolean(p.eco) === Boolean(a.eco) && p.s >= a.at - 4 && p.s <= a.at + (a.ate ?? 0) + 18)
    .map((p) => p.w)
    .join(' ')
    .replace(/Cuên/g, 'Qwen')
    .replace(/Dípsíque/g, 'DeepSeek');

const Speedlines: React.FC<{cor?: string; op?: number}> = ({cor = '#ffd84d', op = 0.28}) => {
  const f = useCurrentFrame();
  return (
    <svg width={1080} height={1920} viewBox="-540 -960 1080 1920" style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: op}}>
      {Array.from({length: 36}).map((_, i) => {
        const ang = (i * 10 + ((f * 3) % 10)) * (Math.PI / 180);
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

const SlashBanner: React.FC<{txt: string; cor: string; at: number; dur?: number; y?: number}> = ({txt, cor, at, dur = 52, y = 555}) => {
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
          <span style={{fontFamily: FONT.comic, fontWeight: 900, fontSize: txt.length > 16 ? 58 : 74, letterSpacing: 3, color: '#fff', ...CONTORNO(9)}}>{txt}</span>
        </div>
      </div>
    </>
  );
};

const MemeCentered: React.FC<{file: string; at: number; dur: number; y?: number}> = ({file, at, dur, y = 1040}) => {
  const f = useCurrentFrame() - at;
  const {fps} = useVideoConfig();
  if (f < 0 || f > dur) return null;
  const e = spring({frame: f, fps, config: {damping: 12, stiffness: 220}});
  const out = interpolate(f, [dur - 7, dur], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 22}}>
      <div style={{width: 420, height: 270, borderRadius: 20, border: '8px solid #fff', overflow: 'hidden', background: '#000', boxShadow: '0 22px 54px #000c', transform: `rotate(-2deg) scale(${e * out})`, opacity: Math.min(1, f / 3) * out}}>
        <Gif src={staticFile(`gifs/${file}`)} width={420} height={270} fit="cover" style={{width: '100%', height: '100%'}} />
      </div>
    </div>
  );
};

const LegendaDC: React.FC<{palavras: Palavra[]}> = ({palavras}) => {
  const f = useCurrentFrame();
  const narr = palavras.filter((p) => !p.ia);
  if (!narr.length) return null;
  const grupos: Palavra[][] = [];
  for (let i = 0; i < narr.length; i += 3) grupos.push(narr.slice(i, i + 3));
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
              transform: `scale(${atual ? 1.08 : 1})`,
              padding: atual ? '0 10px' : '0 2px',
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

const FalaCourt: React.FC<{b: Bloco; top?: number}> = ({b, top = 236}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = audioIAAtivo(b, f);
  if (!a || !a.ia) return null;
  const k = spring({frame: f - a.at, fps, config: {damping: 13, stiffness: 220}});
  const out = interpolate(f, [a.at + (a.ate ?? 0), a.at + (a.ate ?? 0) + 10], [1, 0], cl);
  const ia = a.ia as IA;
  const ehDet = ia === DET;
  const ehEco = Boolean(a.eco);
  const txt = textoIA(b, a);
  return (
    <div style={{position: 'absolute', left: 44, right: 44, top, opacity: k * out, transform: `translateY(${(1 - k) * -45}px)`, zIndex: 20}}>
      <div style={{background: ehEco ? 'linear-gradient(180deg, rgba(48,18,74,0.95), rgba(18,8,34,0.98))' : 'linear-gradient(180deg, rgba(11,18,38,0.94), rgba(6,10,24,0.97))', borderRadius: 24, border: `5px ${ehEco ? 'dashed' : 'solid'} ${ehEco ? '#c084fc' : ehDet ? '#ff5a4a' : '#ffd84d'}`, padding: '16px 24px 20px', boxShadow: '0 18px 42px rgba(0,0,0,0.75)'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8}}>
          <span style={{display: 'inline-block', padding: '3px 14px', borderRadius: 10, border: '3px solid #000', background: ehEco ? '#9333ea' : IAS[ia].cor, color: '#fff', fontFamily: FONT.comic, fontSize: 28, letterSpacing: 2}}>
            {IAS[ia].nome.toUpperCase()} · {ehEco ? 'PENSAMENTO' : ehDet ? 'DETETIVE' : 'SUSPEITO'}
          </span>
          <span style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 18, color: ehEco ? '#e9d5ff' : '#94a3b8', letterSpacing: 2}}>
            {ehEco ? 'EM SEGREDO' : 'DEPOIMENTO REAL'}
          </span>
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: txt.length > 105 ? 32 : 36, lineHeight: 1.22, color: ehEco ? '#f3e8ff' : '#fff', fontStyle: ehEco ? 'italic' : 'normal'}}>
          “{txt}”
        </div>
      </div>
    </div>
  );
};

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
          relogio="18:30"
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

const TopoCaso: React.FC = () => (
  <div style={{position: 'absolute', left: 40, right: 40, top: 68, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', zIndex: 35}}>
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(9,14,30,0.9)', border: '3px solid #ffd84d', borderRadius: 12, padding: '4px 18px'}}>
      <span style={{width: 10, height: 10, borderRadius: 99, background: '#ef4444'}} />
      <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 22, color: '#ffd84d', letterSpacing: 2.5}}>INTERROGATÓRIO DAS IAs 1 · CASO 06</span>
    </div>
    <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 42, color: '#fff', marginTop: 6, letterSpacing: 1, textAlign: 'center', ...CONTORNO(7)}}>
      O SUMIÇO DO <span style={{color: '#fbbf24'}}>PEIXE DOURADO</span>
    </div>
  </div>
);

const CarimboV: React.FC<{texto: string; cor: string; at: number; y: number; rot?: number}> = ({texto, cor, at, y, rot = -8}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const dt = f - at;
  const k = spring({frame: dt, fps: 30, config: {damping: 9, stiffness: 320, mass: 0.65}});
  const escala = 2.15 - 1.15 * k;
  const tremor = dt < 20 ? Math.sin(dt * 2.4) * (1 - dt / 20) * 14 : 0;
  return (
    <div style={{position: 'absolute', left: 540, top: y, transform: `translate(-50%, -50%) translate(${tremor}px, ${tremor * 0.4}px) rotate(${rot}deg) scale(${escala})`, opacity: Math.min(1, dt / 3), pointerEvents: 'none', zIndex: 30}}>
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 108, letterSpacing: 6, color: cor, padding: '10px 38px', border: `10px solid ${cor}`, borderRadius: 18, background: 'rgba(6,8,16,0.78)', textShadow: '0 6px 24px #000c', boxShadow: `0 18px 46px rgba(0,0,0,0.75), 0 0 36px ${cor}66`, whiteSpace: 'nowrap'}}>
        {texto}
      </div>
    </div>
  );
};

const BlocoView: React.FC<{b: Bloco}> = ({b}) => {
  const f = useCurrentFrame();

  if (b.id === 'gancho') {
    return (
      <AbsoluteFill>
        <SalaV b={b} foco={SUS} estresse={96} exprSus="suando" exprDet="desconfiado" zoomExtra={1.06} />
        <Speedlines cor="#ff4d4d" op={0.26} />
        <SlashBanner txt="PROTESTO!" cor="#e01818" at={6} dur={42} y={555} />
        <SlashBanner txt="O SEGREDO DO QWEN..." cor="#1d4ed8" at={Math.max(85, b.dur - 76)} dur={66} y={555} />
        <Sfx src="batida-porta" at={4} vol={0.62} />
      </AbsoluteFill>
    );
  }

  if (b.id === 'blefe') {
    const aPrimo = b.audios[3];
    return (
      <AbsoluteFill>
        <SalaV b={b} foco={SUS} estresse={88} exprSus="suando" exprDet="confiante" acaoDet="apontar" />
        <FalaCourt b={b} top={236} />
        {aPrimo ? <SlashBanner txt="PRIMO DE DIETA?!" cor="#d97706" at={aPrimo.at + 4} dur={74} y={555} /> : null}
        {aPrimo ? <MemeCentered file="nazare-confusa.gif" at={aPrimo.at + 8} dur={76} y={1355} /> : null}
        {aPrimo ? <Sfx src="record-scratch" at={aPrimo.at + 4} vol={0.52} /> : null}
      </AbsoluteFill>
    );
  }

  if (b.id === 'veredito') {
    const tremor = f < 16 ? Math.sin(f * 3) * (16 - f) * 0.9 : 0;
    const aNarr = b.audios[1];
    const stampAt = aNarr ? aNarr.at + 2 : 195;
    return (
      <AbsoluteFill style={{transform: `translate(${tremor}px, ${tremor * 0.6}px)`}}>
        <SalaV b={b} foco={DET} estresse={100} exprSus="suando" exprDet="bravo" acaoDet="bater_mesa" />
        <Speedlines cor="#ff5a4a" op={0.22} />
        <FalaCourt b={b} top={236} />
        <CarimboV texto="CULPADO!" cor="#ef4444" at={stampAt} y={810} rot={-9} />
        <Sfx src="boom" at={stampAt} vol={0.62} />
      </AbsoluteFill>
    );
  }

  if (b.id === 'confissao') {
    return (
      <AbsoluteFill>
        <SalaV b={b} foco={SUS} estresse={100} exprSus="suando" exprDet="desconfiado" acaoDet="nenhuma" zoomExtra={1.06} />
        <Speedlines cor="#ffd84d" op={0.34} />
        <FalaCourt b={b} top={236} />
        <SlashBanner txt="COREOGRAFIA DE K-POP!!" cor="#9333ea" at={76} dur={84} y={555} />
        <MemeCentered file="shocked-krabs.gif" at={84} dur={95} y={1355} />
        <Sfx src="impact-epic" at={76} vol={0.55} />
      </AbsoluteFill>
    );
  }

  const eCard = spring({frame: f - 8, fps: 30, config: {damping: 12, stiffness: 170}});
  return (
    <AbsoluteFill>
      <SalaV b={b} foco={SUS} estresse={12} exprSus="neutro" exprDet="bravo" acaoDet="cruzar_bracos" />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(16,185,129,0.22), rgba(4,7,18,0.86) 75%)'}} />
      <Speedlines cor="#34d399" op={0.22} />
      <CarimboV texto="INOCENTE!" cor="#22c55e" at={4} y={390} rot={-6} />
      <div style={{position: 'absolute', left: 52, right: 52, top: 560, background: 'linear-gradient(180deg, rgba(15,23,42,0.95), rgba(7,11,24,0.98))', border: '6px solid #ffd84d', borderRadius: 28, padding: '24px 26px', textAlign: 'center', boxShadow: '0 24px 60px #000c', transform: `scale(${0.7 + 0.3 * eCard})`, opacity: eCard, zIndex: 24}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 32, color: '#a7f3d0', letterSpacing: 1.5}}>VEREDITO REAL</div>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 48, color: '#fff', lineHeight: 1.12, marginTop: 8, ...CONTORNO(6)}}>
          INOCENTE &amp; K-POP EXPOSTO
        </div>
        <div style={{height: 4, width: '70%', margin: '16px auto', background: 'linear-gradient(90deg, transparent, #ffd84d, transparent)'}} />
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 38, color: '#ffd84d', lineHeight: 1.15, ...CONTORNO(5)}}>
          VOCÊ CONDENAVA OU LIBERAVA O QWEN?
        </div>
      </div>
      <MemeCentered file="coffin-dance.gif" at={14} dur={Math.max(40, b.dur - 20)} y={1075} />
      <Sfx src="correct-ding" at={4} vol={0.55} />
    </AbsoluteFill>
  );
};

export const ShortInt1DC: React.FC<{blocos: Bloco[] | null}> = ({blocos}) => {
  const [h] = useState(() => delayRender('fontes short int1 dc'));
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
              <Sequence key={`a${i}`} from={a.at} durationInFrames={a.ate}>
                <Audio src={staticFile(a.src)} startFrom={a.de} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      <TopoCaso />
    </AbsoluteFill>
  );
};
