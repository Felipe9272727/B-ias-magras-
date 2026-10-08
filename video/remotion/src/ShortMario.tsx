// Short do vídeo 1 (1080×1920): "só uma IA zerou o Mario... e trapaceou".
// Narração própria (scripts/short_mario.py) sobre as gravações reais do treino (public/footage), recortadas
// na vertical em volta do Mario líder. Mesmo estilo do Short do Among Us: selos, legenda grande, SFX por batida.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Freeze, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from './fonts';
import {FONT} from './theme';
import {strokeText} from './components/basics';

type Palavra = {w: string; s: number; e: number};
type Bloco = {id: string; dur: number; palavras: Palavra[]};
export type DadosShortMario = {blocos: Bloco[]};

// âncora = primeira palavra do bloco que começa com o texto (n-ésima ocorrência)
type Ancora = number | [string, number?];
type Corte = {em: Ancora; clip: string; de: number; cx?: number; congelar?: boolean};
type Selo = {em: Ancora; txt: string; cor?: string; y?: number; rot?: number; size?: number};
type Som = {em: Ancora; src: string; vol?: number; atraso?: number};
type Plano = {cortes: Corte[]; selos: Selo[]; sons: Som[]};

const ESCALA = 1.5; // vídeo 1920×1080 → 2880×1620; mostra 720 px do jogo na largura (Mario maior na tela do celular)
const VIDEO_Y = 280;
const VIDEO_H = 1080 * ESCALA;
const CX = 730; // centro padrão do recorte (x do jogo); o líder costuma ficar à esquerda do meio

// início de cada fase na gravação da IA adaptativa (s), para a montagem das 32 fases
const FASES = [0, 26.1, 50.2, 69.7, 87.6, 113.9, 145.2, 166.1, 186.2, 213.8, 240.3, 262.4, 283.7, 311.6, 339.4, 363.0, 385.8, 412.0, 439.0, 460.7, 482.9, 508.4, 537.9, 561.6, 587.0, 615.1, 652.9, 682.3, 712.7, 755.4, 787.7, 821.1];
const NOMES_FASES = FASES.map((_, i) => `${Math.floor(i / 4) + 1}-${(i % 4) + 1}`);

const PLANOS: Record<string, Plano> = {
  gancho: {
    cortes: [{em: 0, clip: 'ada_campaign', de: 853, cx: 800}],
    selos: [{em: 0, txt: '4 IAs · 1 MARIO', cor: '#111', y: 0, rot: -2}, {em: ['zerou'], txt: 'SÓ UMA ZEROU 🏁', y: 120, size: 84}],
    sons: [{em: 0, src: 'bass-pulse', vol: 0.7}, {em: ['zerou'], src: 'impact-epic', vol: 0.5}],
  },
  neuro: {
    cortes: [{em: 0, clip: 'evo_g1', de: 0.3}, {em: ['melhores'], clip: 'evo_g10', de: 3}, {em: ['402'], clip: 'evo_stuck', de: 25.6}],
    selos: [{em: 0, txt: 'IA #1 · NEUROEVOLUÇÃO', cor: '#2f6bff', y: 0, rot: -2, size: 60}, {em: ['64'], txt: '64 MARIOS 🧬', y: 120, cor: '#1f8f3a', size: 64}, {em: ['travou'], txt: 'TRAVOU NO 1-3 ❌', y: 120, size: 78}],
    sons: [{em: 0, src: 'whoosh', vol: 0.4}, {em: ['travou'], src: 'error-beep', vol: 0.45}],
  },
  dqn: {
    cortes: [{em: 0, clip: 'ddqn_g1', de: 0.5}, {em: ['528'], clip: 'ddqn_late', de: 5}],
    selos: [{em: 0, txt: 'IA #2 · DOUBLE DQN', cor: '#8a2be2', y: 0, rot: 2, size: 64}, {em: ['10'], txt: 'SÓ 10 BANDEIRAS 🚩', y: 120, size: 70}, {em: ['Parou'], txt: 'PAROU NO 1-2 ❌', y: 250, size: 70}],
    sons: [{em: 0, src: 'whoosh', vol: 0.4}, {em: ['10'], src: 'coin', vol: 0.5}, {em: ['Parou'], src: 'sad-trombone', vol: 0.4}],
  },
  rainbow: {
    cortes: [{em: 0, clip: 'rainbow_g1', de: 0.5}, {em: ['8.881'], clip: 'rainbow_late', de: 10}, {em: ['70%'], clip: 'rainbow_late', de: 31.6}],
    selos: [{em: 0, txt: 'IA #3 · RAINBOW 🌈', cor: '#e8742a', y: 0, rot: -2, size: 64}, {em: ['8.881'], txt: '8.881 BANDEIRAS 🚩', y: 120, cor: '#1f8f3a', size: 70}, {em: ['70%'], txt: '70% DO 1-3 😬', y: 250, size: 74}],
    sons: [{em: 0, src: 'whoosh', vol: 0.4}, {em: ['8.881'], src: 'coin', vol: 0.5}, {em: ['70%'], src: 'error-beep', vol: 0.4}],
  },
  ada: {
    cortes: [{em: 0, clip: 'ada_campaign', de: 2}, {em: ['zerou'], clip: '#montagem', de: 0}, {em: ['Bowser'], clip: 'ada_campaign', de: 852, cx: 820}, {em: ['48'], clip: 'ada_campaign', de: 860.5, cx: 900, congelar: true}],
    selos: [{em: 0, txt: 'IA #4 · ADAPTATIVA 🧠', cor: '#1f8f3a', y: 0, rot: 2, size: 60}, {em: ['Bowser'], txt: '32 FASES ✅', y: 120, cor: '#1f8f3a', size: 84}, {em: ['48'], txt: '48 DE 64 ZERARAM 🏆', y: 270, size: 70}],
    sons: [{em: 0, src: 'whoosh', vol: 0.4}, {em: ['zerou'], src: 'powerup-8bit', vol: 0.5}, {em: ['48'], src: 'tada', vol: 0.5}],
  },
  trapaca: {
    cortes: [{em: 0, clip: 'ada_campaign', de: 830, cx: 760}],
    selos: [{em: 0, txt: 'O SEGREDO? 🤔', cor: '#111', y: 0, rot: -2}, {em: ['simula'], txt: 'SIMULA A FÍSICA ANTES 🔮', y: 120, cor: '#2f6bff', size: 62}, {em: ['gabarito'], txt: 'COLA NA PROVA 📄', y: 250, size: 74}],
    sons: [{em: ['simula'], src: 'swoosh-fly', vol: 0.4}, {em: ['gabarito'], src: 'crowd-laugh', vol: 0.3}],
  },
  loop: {
    cortes: [{em: 0, clip: 'ada_campaign', de: 860.5, cx: 900, congelar: true}],
    selos: [{em: ['trapaceou'], txt: 'TRAPACEOU 🤡', y: 120, size: 96}],
    sons: [{em: ['trapaceou'], src: 'ba-dum-tss', vol: 0.55}],
  },
};

const quadro = (b: Bloco, a: Ancora) => {
  if (typeof a === 'number') return a;
  const [ini, n = 1] = a;
  const p = b.palavras.filter((w) => w.w.toLowerCase().startsWith(ini.toLowerCase()))[n - 1];
  return p ? Math.max(0, p.s - 2) : 0;
};

const Recorte: React.FC<{clip: string; de: number; cx?: number; congelar?: boolean}> = ({clip, de, cx = CX, congelar}) => {
  const v = (
    <OffthreadVideo
      src={staticFile(`footage/${clip}.mp4`)}
      startFrom={Math.round(de * 30)}
      muted
      style={{position: 'absolute', top: 0, left: 540 - cx * ESCALA, width: 1920 * ESCALA, height: VIDEO_H}}
    />
  );
  return congelar ? <Freeze frame={0}>{v}</Freeze> : v;
};

// as 32 fases em sequência rápida (2 quadros cada), com o nome da fase grande
const Montagem: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.min(FASES.length - 1, Math.floor(f / 2));
  return (
    <>
      {FASES.map((s, j) => (
        <Sequence key={j} from={j * 2} durationInFrames={2}>
          <Freeze frame={0}><Recorte clip="ada_campaign" de={s + 6} /></Freeze>
        </Sequence>
      ))}
      <div style={{position: 'absolute', top: VIDEO_H / 2 - 120, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.pixel, fontSize: 130, color: '#ffd84d', ...strokeText(12)}}>{NOMES_FASES[i]}</div>
    </>
  );
};

const SeloView: React.FC<{s: Selo}> = ({s}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = spring({frame: f, fps, config: {damping: 9, stiffness: 260, mass: 0.6}});
  return (
    <div style={{position: 'absolute', top: 360 + (s.y ?? 0), left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `rotate(${s.rot ?? -3}deg) scale(${0.3 + 0.7 * k})`, opacity: Math.min(1, k * 2)}}>
      <div style={{fontFamily: FONT.comic, fontSize: s.size ?? 74, color: '#fff', background: s.cor ?? '#ff3b30', padding: '6px 26px', borderRadius: 14, border: '6px solid #fff', boxShadow: '0 12px 0 #0008', letterSpacing: 2, whiteSpace: 'nowrap', ...strokeText(6)}}>{s.txt}</div>
    </div>
  );
};

const Legenda: React.FC<{palavras: Palavra[]}> = ({palavras}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grupos: Palavra[][] = [];
  let g: Palavra[] = [];
  for (const p of palavras) {
    g.push(p);
    if (g.length === 3 || /[.,!?…]$/.test(p.w)) {
      grupos.push(g);
      g = [];
    }
  }
  if (g.length) grupos.push(g);
  const i = grupos.findIndex((gr, j) => f >= gr[0].s - 2 && f < (grupos[j + 1]?.[0].s ?? gr[gr.length - 1].e + 12) - 2);
  if (i < 0) return null;
  const atual = grupos[i];
  const pop = spring({frame: f - (atual[0].s - 2), fps, config: {damping: 12, stiffness: 260, mass: 0.5}});
  return (
    <div style={{position: 'absolute', top: 1270, left: 30, right: 30, textAlign: 'center', transform: `scale(${0.85 + 0.15 * pop})`}}>
      {atual.map((p, j) => (
        <span key={j} style={{fontFamily: FONT.comic, fontSize: 100, lineHeight: 1.05, letterSpacing: 2, margin: '0 12px', color: f >= p.s - 2 ? '#ffd84d' : '#fff', ...strokeText(13)}}>
          {p.w.toUpperCase()}
        </span>
      ))}
    </div>
  );
};

const BlocoView: React.FC<{b: Bloco}> = ({b}) => {
  const f = useCurrentFrame();
  const plano = PLANOS[b.id];
  if (!plano) return null;
  const cortes = plano.cortes.map((c) => ({...c, de0: quadro(b, c.em)}));
  const punch = Math.max(1, ...cortes.map((c) => interpolate(f - c.de0, [0, 4, 12], [1.12, 1.03, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})).filter((_, i) => f >= cortes[i].de0));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: VIDEO_Y, left: 0, width: 1080, height: VIDEO_H, overflow: 'hidden', transform: `scale(${punch})`}}>
        {cortes.map((c, i) => {
          const fim = cortes[i + 1]?.de0 ?? b.dur;
          return (
            <Sequence key={i} from={c.de0} durationInFrames={Math.max(1, fim - c.de0)}>
              {c.clip === '#montagem' ? <Montagem /> : <Recorte clip={c.clip} de={c.de} cx={c.cx} congelar={c.congelar} />}
            </Sequence>
          );
        })}
      </div>
      {plano.selos.map((s, i) => (
        <Sequence key={'s' + i} from={quadro(b, s.em)}>
          <SeloView s={s} />
        </Sequence>
      ))}
      {plano.sons.map((s, i) => (
        <Sequence key={'a' + i} from={quadro(b, s.em) + (s.atraso ?? 0)} durationInFrames={150}>
          <Audio src={staticFile(`sfx/${s.src}.mp3`)} volume={s.vol ?? 0.5} />
        </Sequence>
      ))}
      <Audio src={staticFile(`short_mario/${b.id}.mp3`)} />
      <Legenda palavras={b.palavras} />
    </AbsoluteFill>
  );
};

export const ShortMario: React.FC<{dados: DadosShortMario | null}> = ({dados}) => {
  const [handle] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  if (!dados) return <AbsoluteFill style={{background: '#0b0f1a'}} />;
  let ini = 0;
  const seqs = dados.blocos.map((b) => {
    const de = ini;
    ini += b.dur;
    return {b, de};
  });
  const cortes = seqs.slice(1).map((s) => s.de);
  const flash = Math.max(0, ...cortes.map((c) => interpolate(f, [c - 1, c, c + 5], [0, 0.4, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #0b0f1a 0%, #141b33 50%, #0b0f1a 100%)'}}>
      {seqs.map(({b, de}) => (
        <Sequence key={b.id} from={de} durationInFrames={b.dur} name={b.id}>
          <BlocoView b={b} />
        </Sequence>
      ))}
      {cortes.map((c, i) => (
        <Sequence key={i} from={Math.max(0, c - 4)} durationInFrames={60}>
          <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.2} />
        </Sequence>
      ))}
      <Audio src={staticFile('music/sneaky-snitch.mp3')} volume={0.09} />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT.pixel, fontSize: 26, color: '#fff', background: '#000c', padding: '12px 18px', borderRadius: 10, border: '3px solid #ff3b30'}}>4 IAs TENTANDO ZERAR O MARIO</div>
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, height: 12, width: `${(100 * f) / durationInFrames}%`, background: '#ff3b30'}} />
    </AbsoluteFill>
  );
};
