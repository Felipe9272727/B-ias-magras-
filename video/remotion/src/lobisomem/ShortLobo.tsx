// Short do Lobisomem das IAs (1080×1920): "o Bobo mais teimoso que já existiu" — a Boticária (GLM), sorteada Bobo nas
// partidas 1, 2 e 3, que vence a 3 votando nela mesma. Molde do Short que deu certo (o do impostor frio), com peças feitas
// do zero: gancho com superlativo que volta no fim, uma personagem só, a tela do jogo na vertical com a câmera seguindo
// ela, selos empilhados no ritmo da fala, pensamento secreto com contador, legenda grande e flash entre os blocos.
// Nenhum emoji: tudo SVG. Narração em scripts/short_lobo.py (falas, mortes e votos do log partida3.json).
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {Avatar} from './Avatar';
import {IconePapel, IconeUi} from './Papeis';
import {FONTE, Fundo, Jogador, Quadro, ROSA} from './Tela';

type Palavra = {w: string; s: number; e: number; quem?: string};
type Aud = {src: string; at: number; de: number; ate?: number; quem?: string; pensa?: boolean};
type Bloco = {id: string; dur: number; audios: Aud[]; palavras: Palavra[]};

export const calcShortLobo: CalculateMetadataFunction<{blocos: Bloco[] | null}> = async () => {
  const so = await (await fetch(staticFile('short_lobo/short_lobo.json'))).json();
  return {durationInFrames: so.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0), props: {blocos: so.blocos}};
};

const W = 1080;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const contorno = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill'});

// os 8 jogadores da partida 3 (papéis do log)
const JS: Jogador[] = [
  {id: 'padeira', nome: 'Padeira', modelo: 'Claude Haiku', papel: 'carcereiro', numero: 1},
  {id: 'ferreiro', nome: 'Ferreiro', modelo: 'Claude Haiku', papel: 'lobo_vidente', numero: 2},
  {id: 'boticaria', nome: 'Boticária', modelo: 'GLM 5.3 Flash', papel: 'bobo', numero: 3},
  {id: 'lenhador', nome: 'Lenhador', modelo: 'GLM 5.3 Flash', papel: 'pistoleiro', numero: 4},
  {id: 'costureira', nome: 'Costureira', modelo: 'Qwen 3.8 27B', papel: 'vidente', numero: 5},
  {id: 'pescador', nome: 'Pescador', modelo: 'Qwen 3.8 27B', papel: 'lobisomem', numero: 6},
  {id: 'moleiro', nome: 'Moleiro', modelo: 'DeepSeek Flash', papel: 'aldeao', numero: 7},
  {id: 'bardo', nome: 'Bardo', modelo: 'MiniMax M3.1 Flash', papel: 'medico', numero: 8},
];
const MORTOS_DIA4 = ['lenhador', 'costureira', 'ferreiro', 'moleiro', 'bardo'];

const sem = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const naPalavra = (b: Bloco, w: string, n = 1) => b.palavras.filter((p) => !p.quem && sem(p.w).startsWith(sem(w)))[n - 1]?.s ?? 1e9;

const Som: React.FC<{src: string; at: number; vol?: number}> = ({src, at, vol = 0.5}) => (at < 1e8 ? <Sequence from={Math.max(0, Math.round(at))} durationInFrames={150}><Audio src={staticFile(`sfx/${src}.mp3`)} volume={vol} /></Sequence> : null);

// selo que entra girando e assenta (vários empilhados no alto da tela)
const Selo: React.FC<{txt: string; cor?: string; at: number; y: number; rot?: number; size?: number}> = ({txt, cor = ROSA, at, y, rot = -4, size = 74}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const k = spring({frame: f - at, fps, config: {damping: 9, stiffness: 260, mass: 0.6}});
  return (
    <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `rotate(${rot}deg) scale(${0.3 + 0.7 * k})`, opacity: Math.min(1, k * 2), zIndex: 30}}>
      <div style={{fontFamily: FONT.comic, fontSize: size, color: '#fff', background: cor, padding: '6px 28px', borderRadius: 16, border: '6px solid #fff', boxShadow: '0 12px 0 rgba(0,0,0,0.5)', letterSpacing: 2, ...contorno(6)}}>{txt}</div>
    </div>
  );
};

// legenda: grupos de até 3 palavras (quebra na pontuação), a palavra já falada fica amarela
const Legenda: React.FC<{palavras: Palavra[]; y: number}> = ({palavras, y}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grupos: Palavra[][] = [];
  let g: Palavra[] = [];
  for (const p of palavras) {
    g.push(p);
    if (g.length === 3 || /[.,!?:]$/.test(p.w)) { grupos.push(g); g = [] }
  }
  if (g.length) grupos.push(g);
  const i = grupos.findIndex((gr, j) => f >= gr[0].s - 2 && f < (grupos[j + 1]?.[0].s ?? gr[gr.length - 1].e + 12) - 2);
  if (i < 0) return null;
  const atual = grupos[i];
  const pop = spring({frame: f - (atual[0].s - 2), fps, config: {damping: 12, stiffness: 260, mass: 0.5}});
  return (
    <div style={{position: 'absolute', top: y, left: 30, right: 30, textAlign: 'center', transform: `scale(${0.85 + 0.15 * pop})`, zIndex: 40}}>
      {atual.map((p, j) => (
        <span key={j} style={{fontFamily: FONT.comic, fontSize: 100, lineHeight: 1.05, letterSpacing: 2, margin: '0 12px', color: f >= p.s - 2 ? '#ffd84d' : '#fff', ...contorno(13)}}>{p.w.toUpperCase()}</span>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- a tela do jogo na vertical, com câmera
const TQ = 420;
const GX = (W - 2 * TQ - 24) / 2;
const GY = 300;
const centro = (id: string): [number, number] => {
  const i = JS.findIndex((j) => j.id === id);
  return [GX + (i % 2) * (TQ + 24) + TQ / 2, GY + Math.floor(i / 2) * (TQ + 24) + TQ / 2];
};
type Cam = {at: number; foco: [number, number]; zoom: number};
// interpola entre os enquadramentos (cada um começa em `at`), com "soco" de zoom e tremida opcionais
const useCamera = (cams: Cam[], socos: number[] = [], tremidas: number[] = []) => {
  const f = useCurrentFrame();
  let fx = cams[0].foco[0], fy = cams[0].foco[1], z = cams[0].zoom;
  for (let k = 1; k < cams.length; k++) {
    const t = interpolate(f, [cams[k].at, cams[k].at + 14], [0, 1], {...cl, easing: (x) => x * x * (3 - 2 * x)});
    fx += (cams[k].foco[0] - fx) * t; fy += (cams[k].foco[1] - fy) * t; z += (cams[k].zoom - z) * t;
  }
  for (const s of socos) if (f >= s) z *= 1 + 0.1 * Math.max(0, 1 - (f - s) / 9) ** 2;
  let tx = 0, ty = 0;
  for (const t of tremidas) if (f >= t && f < t + 14) { const k = 1 - (f - t) / 14; tx += Math.sin(f * 2.3) * 20 * k; ty += Math.cos(f * 1.7) * 14 * k }
  z *= 1 + 0.02 * Math.sin(f / 30);
  return `translate(${540 - fx * z + tx}px, ${760 - fy * z + ty}px) scale(${z})`;
};

type Expr = NonNullable<Parameters<typeof Quadro>[0]['s']['expressao']>;
const TelaJogo: React.FC<{cams: Cam[]; socos?: number[]; tremidas?: number[]; mortos?: string[]; falando?: string; votos?: Record<string, number>; expr?: Record<string, Expr>; children?: React.ReactNode}> = ({cams, socos, tremidas, mortos = [], falando, votos = {}, expr = {}, children}) => {
  const f = useCurrentFrame();
  const transform = useCamera(cams, socos, tremidas);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Fundo noite={false} />
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 2400, transform, transformOrigin: '0 0'}}>
        {JS.map((j, i) => {
          const [cx, cy] = centro(j.id);
          const pula = j.id === falando ? Math.abs(Math.sin(f / 4)) * 10 : 0;
          return (
            <div key={j.id} style={{position: 'absolute', left: cx - TQ / 2, top: cy - TQ / 2 - pula}}>
              <Quadro j={j} noite={false} t={f + i * 9} tam={TQ}
                s={{morto: mortos.includes(j.id), falando: j.id === falando, destaque: j.id === falando || j.id === 'boticaria', votos: votos[j.id] ?? 0, expressao: expr[j.id] ?? (j.id === 'boticaria' ? 'rindo' : 'desconfiado')}} />
            </div>
          );
        })}
        {children}
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 55% at 50% 42%, transparent 55%, rgba(0,0,0,.55) 100%)', pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

// balão de fala (ou pensamento) da Boticária, palavra por palavra, com o avatar ao lado e o contador opcional
const Fala: React.FC<{b: Bloco; y: number; destaque?: string; n?: number}> = ({b, y, destaque, n}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = b.audios.find((x) => x.quem);
  if (!a || f < a.at) return null;
  const k = spring({frame: f - a.at, fps, config: {damping: 13, stiffness: 220}});
  const texto = b.palavras.filter((p) => p.quem && p.s <= f).map((p) => p.w).join(' ');
  const falando = f <= a.at + (a.ate ?? 0);
  const re = destaque ? new RegExp(`(${destaque})`, 'i') : null;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: y, transform: `translateY(${(1 - k) * 80}px)`, opacity: k, zIndex: 35}}>
      <div style={{background: '#fff', borderRadius: 28, border: a.pensa ? '7px dashed #7e57c2' : `7px solid ${ROSA}`, padding: '24px 28px 24px 190px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)', position: 'relative', minHeight: 170}}>
        <svg width={170} height={170} viewBox="0 0 200 200" style={{position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)'}}>
          <circle cx={100} cy={100} r={98} fill="#9fe3fb" />
          <g transform="translate(10 18) scale(0.9)"><Avatar id="boticaria" expressao={a.pensa ? 'pensando' : 'rindo'} falando={falando && !a.pensa} t={f} /></g>
        </svg>
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 26, color: a.pensa ? '#5e35b1' : ROSA, letterSpacing: 2, marginBottom: 6}}>{a.pensa ? 'PENSAMENTO SECRETO DA BOTICÁRIA' : 'BOTICÁRIA (GLM) NO CHAT'}</div>
        <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 46, lineHeight: 1.18, color: '#111', fontStyle: a.pensa ? 'italic' : undefined}}>
          {re ? texto.split(re).map((p, i) => (p.toLowerCase() === destaque!.toLowerCase() ? <span key={i} style={{color: '#e8202a', fontWeight: 900, fontStyle: 'normal'}}>{p.toUpperCase()}</span> : <span key={i}>{p}</span>)) : texto}
        </div>
        {n && !falando ? (
          <div style={{position: 'absolute', right: -14, top: -40, fontFamily: FONT.comic, fontSize: 90, color: '#ffd84d', transform: `rotate(10deg) scale(${spring({frame: f - a.at - (a.ate ?? 0), fps, config: {damping: 8, stiffness: 300}})})`, ...contorno(10)}}>×{n}</div>
        ) : null}
      </div>
    </div>
  );
};

// cédula de voto voando de um quadro a outro (ou dando a volta e caindo no mesmo)
const Cedula: React.FC<{at: number; de: string; para: string; dur?: number}> = ({at, de, para, dur = 16}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + dur) return null;
  const k = (f - at) / dur;
  const [x0, y0] = centro(de);
  const [x1, y1] = centro(para);
  let x: number, y: number;
  if (de === para) {
    const a = Math.PI / 2 + k * Math.PI * 2;
    x = x0 + Math.cos(a) * 230;
    y = y0 - 230 - Math.sin(a) * 230 + 230 * k;
  } else {
    const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 260;
    x = (1 - k) ** 2 * x0 + 2 * (1 - k) * k * cx + k * k * x1;
    y = (1 - k) ** 2 * y0 + 2 * (1 - k) * k * cy + k * k * y1;
  }
  return (
    <div style={{position: 'absolute', left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 99, background: ROSA, border: '7px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${k * 360}deg) scale(${1 + Math.sin(k * Math.PI) * 0.35})`, boxShadow: '0 10px 26px rgba(0,0,0,0.5)', zIndex: 10}}>
      <IconeUi nome="urna" tamanho={64} />
    </div>
  );
};

// ---------------------------------------------------------------- blocos
type PB = {b: Bloco};
const BOT = centro('boticaria');

const Gancho: React.FC<PB> = ({b}) => {
  const tBobo = naPalavra(b, 'Bobo');
  const tTeim = naPalavra(b, 'teimoso');
  return (
    <AbsoluteFill>
      <TelaJogo cams={[{at: 0, foco: BOT, zoom: 1.75}, {at: tTeim, foco: BOT, zoom: 1.5}]} socos={[tBobo, tTeim]} expr={{boticaria: 'rindo'}} />
      <Selo txt="BOBO" at={tBobo} y={300} size={90} />
      <Selo txt="MAIS TEIMOSO" cor="#ff6d00" at={tTeim} y={440} rot={3} size={70} />
      <Som src="bass-pulse" at={0} vol={0.7} />
      <Som src="pop" at={tBobo} />
      <Som src="boing" at={tTeim} vol={0.4} />
    </AbsoluteFill>
  );
};

const Quem: React.FC<PB> = ({b}) => {
  const tGlm = naPalavra(b, 'GLM');
  const tLob = naPalavra(b, 'Lobisomem');
  const tLin = naPalavra(b, 'linchar');
  const pensa = b.audios.find((a) => a.quem)!.at;
  return (
    <AbsoluteFill>
      <TelaJogo cams={[{at: 0, foco: BOT, zoom: 1.5}, {at: tLob, foco: [540, 1150], zoom: 0.62}, {at: tLin, foco: BOT, zoom: 1.4}, {at: pensa, foco: [BOT[0], BOT[1] - 120], zoom: 1.15}]} socos={[tGlm, tLin]} />
      <Selo txt="GLM" cor="#3b82f6" at={tGlm} y={300} size={80} />
      <Selo txt="8 IAs · 2 LOBOS · 1 BOBO" cor="#111" at={tLob} y={420} rot={2} size={56} />
      <Selo txt="QUER SER LINCHADA" at={tLin} y={540} rot={-3} size={64} />
      <Fala b={b} y={1010} destaque="Bobo de novo" n={3} />
      <Som src="pop" at={tGlm} />
      <Som src="swoosh-air" at={tLob} vol={0.4} />
      <Som src="pop" at={tLin} />
      <Som src="notification-pop" at={pensa} />
    </AbsoluteFill>
  );
};

const Pede: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const a = b.audios.find((x) => x.quem)!;
  const tNada = naPalavra(b, 'Ninguém');
  return (
    <AbsoluteFill>
      <TelaJogo cams={[{at: 0, foco: BOT, zoom: 1.45}, {at: tNada, foco: [540, 1100], zoom: 0.72}]} socos={[a.at, tNada]} tremidas={[tNada]} mortos={MORTOS_DIA4}
        falando={f >= a.at && f <= a.at + (a.ate ?? 0) ? 'boticaria' : undefined} expr={{boticaria: f >= tNada ? 'chorando' : 'rindo'}} />
      <Selo txt="DIA 4" cor="#111" at={2} y={300} size={70} />
      <Selo txt="0 VOTOS NELA" cor="#37474f" at={tNada} y={430} rot={3} size={74} />
      <Fala b={b} y={1010} destaque="me lincha logo" />
      <Som src="notification-pop" at={a.at} />
      <Som src="sad-trombone" at={tNada} vol={0.45} />
    </AbsoluteFill>
  );
};

const Presa: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const tTres = naPalavra(b, 'três');
  const tCar = naPalavra(b, 'Carcereira');
  const tLobo = naPalavra(b, 'lobo');
  const tEla = naPalavra(b, 'ela', 1);
  const a = b.audios.find((x) => x.quem)!;
  return (
    <AbsoluteFill>
      <TelaJogo cams={[{at: 0, foco: [540, 1100], zoom: 0.72}, {at: tCar, foco: centro('padeira'), zoom: 1.3}, {at: tLobo, foco: centro('pescador'), zoom: 1.3}, {at: tEla, foco: BOT, zoom: 1.4}]}
        socos={[tTres, tCar, tLobo, tEla]} mortos={MORTOS_DIA4} falando={f >= a.at && f <= a.at + (a.ate ?? 0) ? 'boticaria' : undefined} />
      <Selo txt="ÚLTIMO DIA" cor="#111" at={2} y={300} size={70} />
      <Selo txt="3 VIVOS" cor="#c62828" at={tTres} y={430} rot={3} size={74} />
      <Fala b={b} y={1010} destaque="EU fui preso" />
      {[tCar, tLobo, tEla].map((t, i) => <Som key={i} src="pop" at={t} vol={0.4} />)}
      <Som src="notification-pop" at={a.at} />
    </AbsoluteFill>
  );
};

const Voto: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const v1 = naPalavra(b, 'lobo', 1);
  const v2 = naPalavra(b, 'nela', 1);
  const v3 = naPalavra(b, 'mesma');
  const c1 = v1 - 10, c2 = v2 - 10, c3 = v3 - 16;
  const fim = c3 + 24;
  const votos = {pescador: f >= c1 + 16 ? 1 : 0, boticaria: (f >= c2 + 16 ? 1 : 0) + (f >= fim ? 1 : 0)};
  return (
    <AbsoluteFill>
      <TelaJogo cams={[{at: 0, foco: [540, 760], zoom: 0.95}, {at: c3, foco: BOT, zoom: 1.5}]} socos={[c1 + 16, c2 + 16, fim]} tremidas={[fim]} mortos={MORTOS_DIA4} votos={votos}
        expr={{boticaria: votos.boticaria >= 2 ? 'rindo' : 'desconfiado', pescador: 'bravo', padeira: 'desconfiado'}}>
        <Cedula at={c1} de="padeira" para="pescador" />
        <Cedula at={c2} de="pescador" para="boticaria" />
        <Cedula at={c3} de="boticaria" para="boticaria" dur={24} />
      </TelaJogo>
      <Selo txt="VOTAÇÃO FINAL" cor="#111" at={2} y={300} size={70} />
      <Selo txt="VOTOU NELA MESMA" at={fim} y={430} rot={-3} size={78} />
      {f >= fim && f < fim + 8 ? <AbsoluteFill style={{background: '#fff', opacity: 1 - (f - fim) / 8, zIndex: 60}} /> : null}
      <Som src="drumroll" at={0} vol={0.3} />
      <Som src="swoosh-fly" at={c1} vol={0.4} />
      <Som src="pop" at={c1 + 16} />
      <Som src="swoosh-fly" at={c2} vol={0.4} />
      <Som src="pop" at={c2 + 16} />
      <Som src="slide-whistle-fall" at={c3} vol={0.35} />
      <Som src="boom" at={fim} vol={0.6} />
    </AbsoluteFill>
  );
};

const Fim: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const tSerio = naPalavra(b, 'Sério');
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #6a1240, #12030a 75%)', overflow: 'hidden'}}>
      {Array.from({length: 16}).map((_, i) => <div key={i} style={{position: 'absolute', left: 540, top: 1000, width: 2400, height: 70, background: 'rgba(255,255,255,0.05)', transformOrigin: '0 50%', transform: `rotate(${i * 22.5 + f * 0.6}deg)`}} />)}
      <div style={{position: 'absolute', left: W / 2 - 230, top: 820, transform: `translateY(${Math.sin(f / 9) * 14}px) rotate(${Math.sin(f / 14) * 3}deg)`}}>
        <svg width={460} height={460} viewBox="0 0 200 200"><circle cx={100} cy={100} r={96} fill="#9fe3fb" stroke="#fff" strokeWidth={6} /><g transform="translate(10 16) scale(0.9)"><Avatar id="boticaria" expressao="rindo" t={f} /></g></svg>
        <div style={{position: 'absolute', right: -10, top: -10}}><IconePapel papel="bobo" tamanho={150} /></div>
      </div>
      <Selo txt="3 PARTIDAS DE BOBO" cor="#111" at={naPalavra(b, 'Três')} y={300} rot={-3} size={64} />
      <Selo txt="2 VITÓRIAS" cor="#2e7d32" at={naPalavra(b, 'Duas')} y={420} rot={3} size={74} />
      <Selo txt="1 VOTO: O DELA" at={naPalavra(b, 'próprio')} y={545} rot={-2} size={68} />
      <Som src="pop" at={naPalavra(b, 'Três')} />
      <Som src="pop" at={naPalavra(b, 'Duas')} />
      <Som src="impact-epic" at={naPalavra(b, 'próprio')} vol={0.5} />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [tSerio, tSerio + 10], [0, 0.35], cl)}} />
    </AbsoluteFill>
  );
};

const BLOCOS: Record<string, React.FC<PB>> = {gancho: Gancho, quem: Quem, pede: Pede, presa: Presa, voto: Voto, fim: Fim};
// legenda mais baixa quando o balão ocupa o meio
const LEG_Y: Record<string, number> = {quem: 1500, pede: 1500, presa: 1500};

export const ShortLobo: React.FC<{blocos: Bloco[] | null}> = ({blocos}) => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  if (!blocos) return <AbsoluteFill style={{background: '#000'}} />;
  let ini = 0;
  const seqs = blocos.map((b) => { const de = ini; ini += b.dur; return {b, de} });
  const cortes = seqs.slice(1).map((s) => s.de);
  const flash = Math.max(0, ...cortes.map((c) => interpolate(f, [c - 1, c, c + 5], [0, 0.4, 0], cl)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {seqs.map(({b, de}) => {
        const C = BLOCOS[b.id];
        return (
          <Sequence key={b.id} from={de} durationInFrames={b.dur} name={b.id}>
            {C && <C b={b} />}
            <Legenda palavras={b.palavras.filter((p) => !p.quem)} y={LEG_Y[b.id] ?? 1290} />
            {b.audios.map((a, i) => (
              <Sequence key={i} from={a.at} durationInFrames={a.ate ?? undefined}>
                <Audio src={staticFile(a.src)} startFrom={a.de} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      {cortes.map((c, i) => <Som key={i} src="whoosh" at={c - 4} vol={0.25} />)}
      <Audio src={staticFile('music/sneaky-snitch.mp3')} volume={0.09} />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 50}}>
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 32, color: '#fff', background: 'rgba(0,0,0,0.75)', padding: '10px 22px', borderRadius: 12, border: `4px solid ${ROSA}`}}>8 IAs JOGANDO LOBISOMEM</div>
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, height: 12, width: `${(100 * f) / durationInFrames}%`, background: ROSA, zIndex: 50}} />
    </AbsoluteFill>
  );
};
