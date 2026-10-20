// Cenas do "60 Segundos das IAs" no pipeline do canal (roteiro_s60.py → build_timeline_s60.py → Main).
// Liga os nomes S60* do roteiro aos componentes. A coleta 3D vem pré-renderizada (public/sessenta/coletas/<partida>.mp4,
// 65 s: 1,5 s de abertura + 60 s de jogo + 3,5 s do fim) e anda no tempo do jogo pelas chaves 'tk' (tick = segundos de jogo).
import React from 'react';
import {AbsoluteFill, Freeze, Img, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Scene, Timeline} from '../types';
import {FONT} from '../theme';
import {Dia, type DadosDia, type DiaLog} from './Dia';

const FPS = 30;
const INTRO = 1.5; // s de clipe antes do relógio começar
const QUADROS_CLIPE = 1950;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
type Chave = {at: number; tick: number};

// tempo da cena → segundo de jogo (igual ao tempoEm do Overcooked, com 1 "tique" = 1 s de jogo)
const segundoEm = (frame: number, de: number, vel: number, chaves: Chave[]) => {
  const pts = [{at: 0, tick: de}, ...chaves.filter((c) => c.at > 0).sort((a, b) => a.at - b.at)];
  for (let i = pts.length - 1; i >= 0; i--) {
    if (frame >= pts[i].at) {
      const nx = pts[i + 1];
      if (!nx) return pts[i].tick + ((frame - pts[i].at) / FPS) * vel;
      return interpolate(frame, [pts[i].at, nx.at], [pts[i].tick, nx.tick]);
    }
  }
  return de;
};
const quadroDoClipe = (seg: number) => Math.max(0, Math.min(QUADROS_CLIPE - 1, Math.round((seg + INTRO) * FPS)));

const Selo: React.FC<{texto: string}> = ({texto}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 150, display: 'flex', justifyContent: 'center', zIndex: 20}}>
    <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff', background: '#e8411899', border: '3px solid #000', borderRadius: 12, padding: '2px 18px'}}>{texto}</div>
  </div>
);

// ---------------------------------------------------------------- coleta 3D (clipe pré-renderizado, no tempo do jogo)
export const S60Coleta: React.FC<{partida: string; de?: number; vel?: number; rotulo?: string; zoom?: {s: number; x?: number; y?: number}; chaves: Chave[]; congela?: number}> = ({partida, de = 0, vel = 1, rotulo, zoom, chaves, congela}) => {
  const f = useCurrentFrame();
  const seg = congela ?? segundoEm(f, de, vel, chaves);
  const z = zoom ? interpolate(f, [0, 18], [1, zoom.s], cl) : 1;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: `${zoom?.x ?? 50}% ${zoom?.y ?? 50}%`}}>
        <Freeze frame={quadroDoClipe(seg)}>
          <OffthreadVideo src={staticFile(`sessenta/coletas/${partida}.mp4`)} muted />
        </Freeze>
      </AbsoluteFill>
      {rotulo && <Selo texto={rotulo} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- grade 2x2 de coletas (mesma casa, ao mesmo tempo)
export const S60Grade: React.FC<{clipes: {partida: string; nome: string; cor: string}[]; de?: number; vel?: number; rotulo?: string; chaves: Chave[]}> = ({clipes, de = 0, vel = 1, rotulo, chaves}) => {
  const f = useCurrentFrame();
  const seg = segundoEm(f, de, vel, chaves);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {clipes.slice(0, 4).map((c, i) => (
        <div key={i} style={{position: 'absolute', left: (i % 2) * 960, top: Math.floor(i / 2) * 540, width: 960, height: 540, overflow: 'hidden', border: '3px solid #000', boxSizing: 'border-box'}}>
          <div style={{width: 1920, height: 1080, transform: 'scale(0.5)', transformOrigin: '0 0'}}>
            <Freeze frame={quadroDoClipe(seg)}>
              <OffthreadVideo src={staticFile(`sessenta/coletas/${c.partida}.mp4`)} muted />
            </Freeze>
          </div>
          <div style={{position: 'absolute', right: 12, top: 12, fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#fff', background: c.cor, border: '3px solid #000', borderRadius: 10, padding: '2px 14px'}}>{c.nome}</div>
        </div>
      ))}
      {rotulo && <Selo texto={rotulo} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- um dia no abrigo (desenho 2D)
export const S60Dia: React.FC<{partida: string; dia: number; vel?: number; rotulo?: string; timeline: Timeline}> = ({partida, dia, vel = 1, rotulo, timeline}) => {
  const data = (timeline.data ?? {}) as any;
  const pt = data.partidas?.[partida];
  if (!pt) return <AbsoluteFill style={{background: '#000'}} />;
  const d: DiaLog = pt.dias.find((x: DiaLog) => x.dia === dia && !x.virada) ?? pt.dias.find((x: DiaLog) => x.dia === dia) ?? pt.dias[0];
  const dados: DadosDia = {dia: d, cena: data.abrigo.cena, itens: data.abrigo.itens ?? {}, figs: data.abrigo.figs, ia: pt.iaVisual, diasFadiga: 20};
  return (
    <AbsoluteFill>
      <Dia dados={dados} arquivo={partida} dia={dia} vel={vel} />
      {rotulo && <Selo texto={rotulo} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- fundo das telas de apoio: porão com o símbolo de radiação
const Fundo: React.FC<{cor?: string}> = ({cor = '#5a1414'}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${cor}, #0d0807 80%)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 960 - 520, top: 540 - 520, width: 1040, height: 1040, opacity: 0.08, fontSize: 900, lineHeight: '1040px', textAlign: 'center', color: '#f2c230', transform: `rotate(${f * 0.25}deg)`}}>☢</div>
      <AbsoluteFill style={{opacity: 0.1, backgroundImage: 'repeating-linear-gradient(-45deg, #f2c230 0 40px, transparent 40px 80px)', backgroundPosition: `${f * 0.8}px 0`, maskImage: 'linear-gradient(to bottom, transparent 82%, #000 82%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 82%, #000 82%)'}} />
    </AbsoluteFill>
  );
};

const FAMILIA = [['pai', 'Osvaldo', 'o pai'], ['mae', 'Celeste', 'a mãe'], ['filha', 'Juju', 'a filha'], ['filho', 'Tico', 'o filho']] as const;

// ---------------------------------------------------------------- cartão de capítulo
export const S60Titulo: React.FC<{kicker?: string; title: string; subtitle?: string; color?: string; fundo?: string}> = ({kicker, title, subtitle, color = '#f2c230', fundo}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 12}});
  const s2 = spring({frame: f - 8, fps, config: {damping: 15}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Fundo cor={fundo} />
      <div style={{position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {kicker && <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 38, color: '#ffd9c7', letterSpacing: 6, textTransform: 'uppercase', opacity: s2, marginBottom: 10}}>{kicker}</div>}
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: title.length > 26 ? 96 : 128, color, textAlign: 'center', maxWidth: 1560, lineHeight: 1.02, transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -4}deg)`, textShadow: '0 8px 0 #000, 0 0 40px rgba(0,0,0,.6)', WebkitTextStroke: '3px #000'}}>{title}</div>
        {subtitle && <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 42, color: '#fff', marginTop: 26, opacity: s2, textAlign: 'center', maxWidth: 1400, textShadow: '0 3px 0 #000'}}>{subtitle}</div>}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- a família (desenhos do abrigo)
export const S60Familia: React.FC<{passo?: number; destaque?: string; riscados?: string[]}> = ({passo = 16, destaque, riscados = []}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Fundo cor="#3d2a18" />
      <div style={{position: 'absolute', top: 50, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#fff', WebkitTextStroke: '2px #000', textShadow: '0 5px 0 #000'}}>A FAMÍLIA</div>
      {FAMILIA.map(([id, nome, papel], i) => {
        const s = spring({frame: f - i * passo, fps, config: {damping: 13}});
        const apaga = destaque && destaque !== id ? 0.3 : 1;
        const x = 240 + i * 480;
        return (
          <div key={id} style={{position: 'absolute', left: x - 200, top: 180, width: 400, opacity: s * apaga, transform: `translateY(${(1 - s) * 120}px)`, textAlign: 'center'}}>
            <Img src={staticFile(`sessenta/abrigo2d/personagens/${id}/base.svg`)} style={{width: 380, height: 570, objectFit: 'contain', filter: riscados.includes(id) ? 'grayscale(1) brightness(0.6)' : undefined}} />
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 48, color: '#fff', textShadow: '0 3px 0 #000', marginTop: -10}}>{nome}</div>
            <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 30, color: '#ffd9c7'}}>{papel}</div>
            {riscados.includes(id) && <div style={{position: 'absolute', top: 220, left: 0, right: 0, fontSize: 200, color: '#e8411b', fontWeight: 900, fontFamily: FONT.display, textShadow: '0 6px 0 #000'}}>✗</div>}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- as IAs
export const S60Elenco: React.FC<{ias: {nome: string; modelo: string; cor: string}[]; passo?: number; destaque?: string}> = ({ias, passo = 18, destaque}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = ias.length;
  return (
    <AbsoluteFill>
      <Fundo />
      <div style={{position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#fff', WebkitTextStroke: '2px #000', textShadow: '0 5px 0 #000'}}>OS JOGADORES</div>
      {ias.map((ia, i) => {
        const s = spring({frame: f - i * passo, fps, config: {damping: 13}});
        const apaga = destaque && destaque !== ia.nome ? 0.3 : 1;
        const w = 1700 / n;
        return (
          <div key={ia.nome} style={{position: 'absolute', left: 110 + i * w, top: 330, width: w - 40, height: 420, opacity: s * apaga, transform: `translateY(${(1 - s) * 140}px) rotate(${(i % 2 ? 1 : -1) * 1.5}deg)`, background: ia.cor, border: '6px solid #000', borderRadius: 26, boxShadow: '0 14px 0 #000a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#fff', WebkitTextStroke: '2px #000', textShadow: '0 4px 0 #000'}}>{ia.nome}</div>
            <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 32, color: '#fff', marginTop: 14, opacity: 0.95}}>{ia.modelo}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- o que a IA recebe e o que ela responde
export const S60Prompt: React.FC<{texto: string; resposta: string; cor?: string; titulo?: string}> = ({texto, resposta, cor = '#d97757', titulo = 'O QUE A IA RECEBE'}) => {
  const f = useCurrentFrame();
  const chars = Math.floor(f * 9);
  const r0 = 90;
  return (
    <AbsoluteFill>
      <Fundo cor="#1d1d1d" />
      <div style={{position: 'absolute', left: 70, top: 70, width: 1060, bottom: 70, background: '#0e1116', border: '5px solid #000', borderRadius: 20, padding: '24px 30px', fontFamily: FONT.mono, fontSize: 22, color: '#d6e2ea', whiteSpace: 'pre-wrap', overflow: 'hidden', lineHeight: 1.35, boxShadow: '0 12px 0 #000a'}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#f2c230', marginBottom: 12}}>{titulo}</div>
        {texto.slice(0, chars)}
      </div>
      <div style={{position: 'absolute', right: 70, top: 260, width: 640, background: '#fff', border: `6px solid ${cor}`, borderRadius: 22, padding: '22px 26px', fontFamily: FONT.mono, fontSize: 25, color: '#111', whiteSpace: 'pre-wrap', opacity: interpolate(f, [r0, r0 + 10], [0, 1], cl), transform: `scale(${interpolate(spring({frame: f - r0, fps: FPS, config: {damping: 12}}), [0, 1], [0.7, 1])})`, boxShadow: '0 12px 0 #000a'}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: cor, marginBottom: 10}}>A RESPOSTA</div>
        {resposta}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- placar (dias vividos), revelado de baixo pra cima
export const S60Placar: React.FC<{titulo: string; linhas: {nome: string; cor: string; dias: number; detalhe?: string}[]; passo?: number; ocultar?: number}> = ({titulo, linhas, passo = 22, ocultar = 0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ord = [...linhas].sort((a, b) => b.dias - a.dias);
  const max = Math.max(...ord.map((l) => l.dias), 1);
  return (
    <AbsoluteFill>
      <Fundo />
      <div style={{position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 70, color: '#f2c230', WebkitTextStroke: '2px #000', textShadow: '0 5px 0 #000'}}>{titulo}</div>
      {ord.map((l, i) => {
        const ordemRevela = ord.length - 1 - i; // o último colocado aparece primeiro
        const s = spring({frame: f - ordemRevela * passo, fps, config: {damping: 13}});
        const escondido = i < ocultar;
        const w = interpolate(s, [0, 1], [0, (l.dias / max) * 1000]);
        return (
          <div key={l.nome} style={{position: 'absolute', left: 160, top: 220 + i * 175, height: 140, display: 'flex', alignItems: 'center', opacity: s}}>
            <div style={{width: 90, fontFamily: FONT.display, fontWeight: 900, fontSize: 72, color: i === 0 ? '#f2c230' : '#fff', textShadow: '0 4px 0 #000'}}>{i + 1}º</div>
            <div style={{width: 330, fontFamily: FONT.display, fontWeight: 900, fontSize: 50, color: '#fff', textShadow: '0 4px 0 #000'}}>{escondido ? '???' : l.nome}</div>
            <div style={{width: w, height: 90, background: escondido ? '#555' : l.cor, border: i === 0 && !escondido ? '6px solid #f2c230' : '5px solid #000', borderRadius: 16, boxShadow: '0 8px 0 #000a'}} />
            <div style={{marginLeft: 24, fontFamily: FONT.display, fontWeight: 900, fontSize: 56, color: '#fff', textShadow: '0 4px 0 #000'}}>{escondido ? '' : `${Math.round(interpolate(s, [0, 1], [0, l.dias]))} dias`}</div>
            {l.detalhe && !escondido && <div style={{marginLeft: 22, fontFamily: FONT.display, fontWeight: 700, fontSize: 28, color: '#ffd9c7', maxWidth: 420}}>{l.detalhe}</div>}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- números curiosos (barras)
export const S60Numeros: React.FC<{titulo: string; sub?: string; valores: {nome: string; cor: string; valor: number; rotulo?: string}[]; unidade?: string}> = ({titulo, sub, valores, unidade = ''}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const max = Math.max(...valores.map((v) => v.valor), 1);
  return (
    <AbsoluteFill>
      <Fundo cor="#123040" />
      <div style={{position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#fff', WebkitTextStroke: '2px #000', textShadow: '0 5px 0 #000'}}>{titulo}</div>
      {sub && <div style={{position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 34, color: '#cfe3ee'}}>{sub}</div>}
      {valores.map((v, i) => {
        const s = spring({frame: f - i * 14, fps, config: {damping: 14}});
        return (
          <div key={v.nome} style={{position: 'absolute', left: 160, top: 260 + i * 170, display: 'flex', alignItems: 'center', opacity: s}}>
            <div style={{width: 320, fontFamily: FONT.display, fontWeight: 900, fontSize: 48, color: '#fff', textShadow: '0 4px 0 #000'}}>{v.nome}</div>
            <div style={{width: Math.max(8, (v.valor / max) * 980 * s), height: 80, background: v.cor, border: '5px solid #000', borderRadius: 14}} />
            <div style={{marginLeft: 22, fontFamily: FONT.display, fontWeight: 900, fontSize: 52, color: '#fff', textShadow: '0 4px 0 #000'}}>{Math.round(v.valor * s)}{unidade}</div>
            {v.rotulo && <div style={{marginLeft: 20, fontFamily: FONT.display, fontWeight: 700, fontSize: 28, color: '#cfe3ee'}}>{v.rotulo}</div>}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- registro
export const SessentaVisual: React.FC<{name: string; props: Record<string, any>; scene: Scene; timeline: Timeline}> = ({name, props: p, scene, timeline}) => {
  const chaves = scene.events.filter((e: any) => e.type === 'tk').map((e: any) => ({at: e.at, tick: e.tick}));
  switch (name) {
    case 'S60Coleta':
      return <S60Coleta {...(p as any)} chaves={chaves} />;
    case 'S60Grade':
      return <S60Grade {...(p as any)} chaves={chaves} />;
    case 'S60Dia':
      return <S60Dia {...(p as any)} timeline={timeline} />;
    case 'S60Titulo':
      return <S60Titulo {...(p as any)} />;
    case 'S60Familia':
      return <S60Familia {...(p as any)} />;
    case 'S60Elenco':
      return <S60Elenco {...(p as any)} />;
    case 'S60Prompt':
      return <S60Prompt {...(p as any)} />;
    case 'S60Placar':
      return <S60Placar {...(p as any)} />;
    case 'S60Numeros':
      return <S60Numeros {...(p as any)} />;
    default:
      return null;
  }
};
