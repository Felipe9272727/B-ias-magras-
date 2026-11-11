// IA JOGANDO ROBLOX: IA OU HUMANO? — vídeo montado em cima do gameplay gravado (Natural Disaster Survival).
// Lê public/timeline_roblox.json (gerada por video/scripts/build_timeline_roblox.py a partir de roteiro/roteiro_roblox.json).
// Cada cena tem um fundo (trecho do gameplay já recortado em public/roblox/clips, ou um print) com câmera em deriva lenta
// e zoom no foco, e por cima: placar fixo (mortes x admitidas), balões de fala (Carlos = IA, Bush = Felipe), selos, memes,
// números, setas apontando o que conferir na tela e cartões especiais. Sem áudio aqui: a faixa é montada por rbx_audio.py.
// Regras do canal: nada de emoji (tudo SVG), selo/meme nunca cortados pelo fim da cena, deriva em toda cena.
import React, {useEffect, useState} from 'react';
import {fontsReady} from '../fonts';
import {AbsoluteFill, continueRender, delayRender, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction} from 'remotion';
import {MemeCard, type MemeInfo} from '../components/overlays';

const F = "'Poppins', sans-serif";
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const AZUL = '#1b8df2';

type Over =
  | {tipo: 'ia' | 'bush' | 'jog'; at: number; dur: number; texto: string}
  | {tipo: 'selo'; at: number; dur: number; texto: string; cor?: string}
  | {tipo: 'meme'; at: number; dur: number; id: string; pos: string; info: MemeInfo; caption?: string}
  | {tipo: 'numero'; at: number; dur: number; texto: string; sub?: string}
  | {tipo: 'marco'; at: number; dur: number; titulo: string; sub?: string}
  | {tipo: 'morte'; at: number; dur: number; n: number}
  | {tipo: 'seta'; at: number; dur: number; x: number; y: number; rotulo: string; lado?: string}
  | {tipo: 'tempo'; at: number; dur: number; texto: string}
  | {tipo: 'crono'; at: number; dur: number; rotulo: string; de: number; ate: number}
  | {tipo: 'pensa'; at: number; dur: number; quem: 'olho' | 'jev' | 'chat'; texto: string; extra?: string}
  | {tipo: 'atualiza'; at: number; dur: number; slot: 'jev' | 'olho' | 'chat' | 'tudo'; de: string; para: string; nota?: string};
type Cerebro = {jev: string; olho: string; chat: string; muda?: string[]};
type Hud = {mostra: boolean; mortes: number; percebeu: number; sobrev: number; ev: {at: number; k: 'mortes' | 'percebeu' | 'sobrev'}[]};
type Cena = {id: string; dur: number; cerebro?: Cerebro; clip?: string; img?: string; cam: {x: number; y: number; z0: number; z1: number}; escuro?: number; blur?: number; estado?: string; vel?: number; visual?: string; props?: Record<string, unknown>; marcas?: number[]; hud: Hud; over: Over[]; audio: {src: string; at: number; vol?: number}[]};
type TL = {cenas: Cena[]};

export const calcRoblox: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl = await (await fetch(staticFile('timeline_roblox.json'))).json();
  return {durationInFrames: tl.cenas.reduce((a: number, c: Cena) => a + c.dur, 0), props: {tl}};
};

// ---------- ícones (SVG próprio; nunca emoji) ----------
const Caveira: React.FC<{s?: number; cor?: string}> = ({s = 40, cor = '#fff'}) => (
  <svg width={s} height={s} viewBox="0 0 40 40">
    <path d="M20 3 C9 3 4 10 4 18 C4 24 7 27 10 29 V35 H30 V29 C33 27 36 24 36 18 C36 10 31 3 20 3 Z" fill={cor} stroke="#000" strokeWidth="2.5" />
    <circle cx="13.5" cy="18" r="4.6" fill="#000" />
    <circle cx="26.5" cy="18" r="4.6" fill="#000" />
    <path d="M20 22 L17.5 27 H22.5 Z" fill="#000" />
    <path d="M15 30 V35 M20 30 V35 M25 30 V35" stroke="#000" strokeWidth="2" />
  </svg>
);
const CabecaCarlos: React.FC<{s?: number}> = ({s = 84}) => (
  <svg width={s} height={s} viewBox="0 0 84 84">
    <rect x="16" y="22" width="52" height="50" rx="10" fill="#f3c9a0" stroke="#000" strokeWidth="3" />
    <path d="M10 34 C8 14 26 6 42 8 C62 5 78 16 74 36 C70 30 66 26 62 30 C58 22 52 22 48 28 C44 20 36 20 32 28 C26 22 18 26 16 36 C13 37 11 36 10 34 Z" fill="#a8562a" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
    <path d="M22 16 C30 10 40 12 46 16 M50 14 C58 10 66 14 70 22" stroke="#d98a4a" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="32" cy="46" r="4" fill="#111" />
    <circle cx="52" cy="46" r="4" fill="#111" />
    <path d="M30 58 Q42 68 54 58" stroke="#111" strokeWidth="3.5" fill="none" strokeLinecap="round" />
  </svg>
);
const CabecaBush: React.FC<{s?: number}> = ({s = 84}) => (
  <svg width={s} height={s} viewBox="0 0 84 84">
    <ellipse cx="42" cy="56" rx="27" ry="24" fill="#ffd21f" stroke="#000" strokeWidth="3" />
    <rect x="24" y="6" width="36" height="28" rx="3" fill="#15151a" stroke="#000" strokeWidth="3" />
    <rect x="12" y="30" width="60" height="9" rx="4" fill="#15151a" stroke="#000" strokeWidth="3" />
    <circle cx="33" cy="54" r="3.6" fill="#111" />
    <circle cx="51" cy="54" r="3.6" fill="#111" />
    <path d="M31 64 Q42 73 53 64" stroke="#111" strokeWidth="3.5" fill="none" strokeLinecap="round" />
  </svg>
);
const CabecaJog: React.FC<{s?: number}> = ({s = 84}) => (
  <svg width={s} height={s} viewBox="0 0 84 84">
    <rect x="16" y="16" width="52" height="54" rx="10" fill="#b9c2cc" stroke="#000" strokeWidth="3" />
    <path d="M34 40 Q34 30 42 30 Q50 30 50 38 Q50 44 42 46 V52" stroke="#111" strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="42" cy="61" r="3.4" fill="#111" />
  </svg>
);
const Olho: React.FC = () => (
  <svg width={110} height={110} viewBox="0 0 110 110">
    <path d="M8 55 Q55 8 102 55 Q55 102 8 55 Z" fill="#fff" stroke="#000" strokeWidth="5" />
    <circle cx="55" cy="55" r="20" fill={AZUL} stroke="#000" strokeWidth="4" />
    <circle cx="55" cy="55" r="8" fill="#000" />
  </svg>
);
const Controle: React.FC = () => (
  <svg width={110} height={110} viewBox="0 0 110 110">
    <rect x="8" y="34" width="94" height="48" rx="22" fill="#ff5a5a" stroke="#000" strokeWidth="5" />
    <path d="M28 50 V66 M20 58 H36" stroke="#000" strokeWidth="6" strokeLinecap="round" />
    <circle cx="74" cy="52" r="6" fill="#000" />
    <circle cx="86" cy="64" r="6" fill="#000" />
  </svg>
);
const Balao: React.FC = () => (
  <svg width={110} height={110} viewBox="0 0 110 110">
    <path d="M12 20 H98 V72 H52 L34 92 V72 H12 Z" fill="#6fe07a" stroke="#000" strokeWidth="5" strokeLinejoin="round" />
    <path d="M28 38 H82 M28 54 H66" stroke="#000" strokeWidth="6" strokeLinecap="round" />
  </svg>
);
const Trofeu: React.FC<{s?: number}> = ({s = 150}) => (
  <svg width={s} height={s} viewBox="0 0 150 150">
    <path d="M40 18 H110 V52 C110 80 94 92 75 94 C56 92 40 80 40 52 Z" fill="#ffcf3a" stroke="#000" strokeWidth="5" />
    <path d="M40 28 H18 C18 52 28 62 44 64 M110 28 H132 C132 52 122 62 106 64" fill="none" stroke="#000" strokeWidth="5" />
    <rect x="66" y="94" width="18" height="22" fill="#e0a51a" stroke="#000" strokeWidth="5" />
    <rect x="46" y="116" width="58" height="16" rx="4" fill="#8a5a2a" stroke="#000" strokeWidth="5" />
    <g transform="translate(55 34)"><Caveira s={40} cor="#fff6dc" /></g>
  </svg>
);
const DiscoQuebrado: React.FC<{s?: number}> = ({s = 120}) => (
  <svg width={s} height={s} viewBox="0 0 120 120">
    <rect x="14" y="26" width="92" height="68" rx="10" fill="#3a4250" stroke="#000" strokeWidth="5" />
    <circle cx="40" cy="60" r="16" fill="#9aa6b6" stroke="#000" strokeWidth="4" />
    <circle cx="40" cy="60" r="4" fill="#000" />
    <rect x="66" y="46" width="30" height="8" rx="3" fill="#9aa6b6" />
    <rect x="66" y="62" width="22" height="8" rx="3" fill="#9aa6b6" />
    <path d="M22 18 L98 104 M98 18 L22 104" stroke="#ff3b3b" strokeWidth="10" strokeLinecap="round" />
  </svg>
);

// ---------- peças ----------
const Selo: React.FC<{texto: string; cor?: string; hud?: boolean}> = ({texto, cor = '#e8371a', hud}) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 6], [2.4, 1], cl);
  const fs = texto.length > 34 ? 44 : texto.length > 22 ? 54 : 68;
  return (
    <div style={{position: 'absolute', left: hud ? 30 : 0, right: hud ? 470 : 0, top: 190, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: F, fontWeight: 900, fontSize: fs, color: '#fff', background: cor, border: '7px solid #fff', maxWidth: hud ? 1380 : 1500, textAlign: 'center', borderRadius: 16, padding: '4px 34px', transform: `rotate(-4deg) scale(${e})`, opacity: interpolate(f, [0, 3], [0, 1], cl), boxShadow: '0 12px 0 #0008', WebkitTextStroke: '3px #000', paintOrder: 'stroke fill'}}>{texto}</div>
    </div>
  );
};
const NumeroG: React.FC<{texto: string; sub?: string; dur: number}> = ({texto, sub, dur}) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 7], [2.6, 1], cl);
  const o = interpolate(f, [0, 4, dur - 8, dur], [0, 1, 1, 0], cl);
  return (
    <div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', opacity: o}}>
      <div style={{fontFamily: F, fontWeight: 900, fontSize: texto.length > 8 ? 130 : 180, lineHeight: 1, color: '#ffd400', transform: `scale(${e})`, WebkitTextStroke: '18px #000', paintOrder: 'stroke fill'}}>{texto}</div>
      {sub ? <div style={{fontFamily: F, fontWeight: 900, fontSize: 50, color: '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', marginTop: 8}}>{sub}</div> : null}
    </div>
  );
};
// cartão de parte no estilo do aviso "Próximo Mapa" do próprio jogo
const Marco: React.FC<{titulo: string; sub?: string; dur: number}> = ({titulo, sub, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 13, stiffness: 160}});
  const o = interpolate(f, [dur - 10, dur], [1, 0], cl);
  return (
    <AbsoluteFill style={{background: `rgba(6,12,26,${0.55 * o})`, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{opacity: o, transform: `translateY(${(1 - e) * -160}px) scale(${0.8 + 0.2 * e})`, borderRadius: 18, overflow: 'hidden', boxShadow: '0 24px 60px #000b', border: '6px solid #fff', minWidth: 760, maxWidth: 1500, textAlign: 'center'}}>
        <div style={{background: AZUL, color: '#fff', fontFamily: F, fontWeight: 800, fontSize: 40, padding: '10px 50px', letterSpacing: 3}}>{sub ?? 'PRÓXIMA PARTE'}</div>
        <div style={{background: '#eaf5ff', color: '#0e3d73', fontFamily: F, fontWeight: 900, fontSize: titulo.length > 22 ? 76 : 96, padding: '18px 60px 24px', lineHeight: 1.05}}>{titulo}</div>
      </div>
    </AbsoluteFill>
  );
};
const Fala: React.FC<{quem: 'ia' | 'bush' | 'jog'; texto: string; dur: number}> = ({quem, texto, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 13, stiffness: 190}});
  const o = interpolate(f, [dur - 6, dur], [1, 0], cl);
  const ia = quem === 'ia';
  const cor = ia ? '#39b7ff' : quem === 'bush' ? '#ffd21f' : '#c9d2dc';
  const nome = ia ? 'CARLOS' : quem === 'bush' ? 'BUSH' : 'JOGADOR DO SERVIDOR';
  const tag = ia ? 'IA' : quem === 'bush' ? 'EU' : 'HUMANO';
  const fs = ia ? (texto.length > 90 ? 50 : texto.length > 60 ? 58 : 68) : texto.length > 50 ? 54 : texto.length > 28 ? 62 : 74;
  const pos: React.CSSProperties = ia ? {left: 110, right: 110, bottom: 44} : {left: 50, top: quem === 'bush' ? 300 : 470, maxWidth: 1180};
  return (
    <div style={{position: 'absolute', ...pos, display: 'flex', justifyContent: ia ? 'center' : 'flex-start', opacity: o}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, transform: `translateY(${(1 - e) * (ia ? 90 : 0)}px) translateX(${(1 - e) * (ia ? 0 : -200)}px) scale(${0.85 + 0.15 * e})`}}>
        <div style={{flex: 'none', filter: 'drop-shadow(0 6px 0 #0007)'}}>{ia ? <CabecaCarlos s={150} /> : quem === 'bush' ? <CabecaBush s={140} /> : <CabecaJog s={130} />}</div>
        <div style={{background: '#fff', border: `7px solid ${cor}`, borderRadius: 26, padding: '10px 28px 16px', boxShadow: '0 10px 0 #0008'}}>
          <div style={{display: 'flex', gap: 12, alignItems: 'center', marginBottom: 2}}>
            <span style={{fontFamily: F, fontWeight: 900, fontSize: 32, color: '#111', letterSpacing: 1}}>{nome}</span>
            <span style={{fontFamily: F, fontWeight: 900, fontSize: 26, color: ia ? '#fff' : '#111', background: ia ? '#e8371a' : cor, borderRadius: 8, padding: '0 10px'}}>{tag}</span>
          </div>
          <div style={{fontFamily: F, fontWeight: 800, fontSize: fs, color: '#111', lineHeight: 1.12}}>{texto}</div>
        </div>
      </div>
    </div>
  );
};
// seta que aponta um ponto do gameplay (fica dentro da camada da câmera, então acompanha o zoom)
const Seta: React.FC<{x: number; y: number; rotulo: string; lado?: string; dur: number}> = ({x, y, rotulo, lado, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 11, stiffness: 200}});
  const o = interpolate(f, [dur - 6, dur], [1, 0], cl);
  const bal = Math.sin(f / 4) * 10;
  const baixo = lado === 'cima' ? false : y < 0.3 || lado === 'baixo'; // rótulo abaixo do ponto quando o alvo está no topo
  return (
    <div style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: 0, height: 0, opacity: o}}>
      <div style={{position: 'absolute', left: -70, top: -70, width: 140, height: 140, borderRadius: '50%', border: '9px solid #ffd400', boxShadow: '0 0 0 4px #000, inset 0 0 0 4px #000', transform: `scale(${2 - e + Math.sin(f / 5) * 0.05})`}} />
      <div style={{position: 'absolute', left: -400, width: 800, top: baixo ? 86 + bal : undefined, bottom: baixo ? undefined : 86 + bal, display: 'flex', flexDirection: baixo ? 'column' : 'column-reverse', alignItems: 'center', transform: `scale(${e})`}}>
        <svg width={70} height={56} viewBox="0 0 70 56" style={{transform: baixo ? undefined : 'rotate(180deg)'}}><path d="M35 2 L66 38 H46 V54 H24 V38 H4 Z" fill="#ffd400" stroke="#000" strokeWidth="5" strokeLinejoin="round" /></svg>
        <div style={{fontFamily: F, fontWeight: 900, fontSize: 50, color: '#111', background: '#ffd400', border: '6px solid #000', borderRadius: 12, padding: '2px 20px', whiteSpace: 'nowrap', boxShadow: '0 8px 0 #0008'}}>{rotulo}</div>
      </div>
    </div>
  );
};
const Morte: React.FC<{n: number; dur: number}> = ({n, dur}) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 7], [3, 1], cl);
  const o = interpolate(f, [0, 3, dur - 8, dur], [0, 1, 1, 0], cl);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{boxShadow: 'inset 0 0 260px 60px #d10000', opacity: interpolate(f, [0, 4, dur], [0, 0.9, 0], cl)}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, display: 'flex', justifyContent: 'center', opacity: o}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, background: '#16090a', border: '6px solid #ff3b3b', borderRadius: 18, padding: '8px 30px', transform: `scale(${e})`, boxShadow: '0 12px 0 #0008'}}>
          <Caveira s={74} />
          <div style={{fontFamily: F, fontWeight: 900, fontSize: 70, color: '#ff4a3a', WebkitTextStroke: '3px #000', paintOrder: 'stroke fill'}}>{n ? `MORTE Nº ${n}` : 'MORREU'}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
const Tempo: React.FC<{texto: string; dur: number}> = ({texto, dur}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 5, dur - 8, dur], [0, 1, 1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 34, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{fontFamily: F, fontWeight: 900, fontSize: 48, color: '#fff', background: '#000d', border: `5px solid ${AZUL}`, padding: '2px 30px', borderRadius: 12, letterSpacing: 2, transform: `translateY(${interpolate(f, [0, 7], [-110, 0], cl)}px)`, boxShadow: '0 8px 0 #0007'}}>{texto}</div>
    </div>
  );
};

const Crono: React.FC<{rotulo: string; de: number; ate: number; dur: number}> = ({rotulo, de, ate, dur}) => {
  const f = useCurrentFrame();
  const v = Math.floor(de + (ate - de) * Math.min(1, f / Math.max(1, dur - 20)));
  const o = interpolate(f, [0, 6, dur - 8, dur], [0, 1, 1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 470, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{background: '#000d', border: '6px solid #ff3b3b', borderRadius: 18, padding: '4px 34px', textAlign: 'center', transform: `scale(${1 + 0.03 * Math.sin(f / 4)})`}}>
        <div style={{fontFamily: F, fontWeight: 900, fontSize: 36, color: '#fff', letterSpacing: 2}}>{rotulo}</div>
        <div style={{fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 110, color: '#ff4a3a', lineHeight: 1}}>{Math.floor(v / 60)}:{String(v % 60).padStart(2, '0')}</div>
      </div>
    </div>
  );
};

// placar fixo: a aposta do vídeo sempre visível (mortes x admitidas, sobrevivências e quem percebeu)
const Placar: React.FC<{hud: Hud; estado?: string}> = ({hud, estado}) => {
  const f = useCurrentFrame();
  const v = {mortes: hud.mortes, percebeu: hud.percebeu, sobrev: hud.sobrev};
  let pulso: Record<string, number> = {};
  for (const e of hud.ev) {
    if (f >= e.at) {
      v[e.k] += 1;
      pulso[e.k] = Math.max(pulso[e.k] ?? 0, 1 - (f - e.at) / 18);
    }
  }
  const Linha: React.FC<{k: string; rot: string; val: number; cor: string}> = ({k, rot, val, cor}) => {
    const p = Math.max(0, pulso[k] ?? 0);
    return (
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 22, background: p > 0 ? `rgba(255,255,255,${0.25 * p})` : undefined, borderRadius: 8, padding: '0 8px'}}>
        <span style={{fontFamily: F, fontWeight: 800, fontSize: 25, color: '#dfe8f5'}}>{rot}</span>
        <span style={{fontFamily: F, fontWeight: 900, fontSize: 38, color: cor, transform: `scale(${1 + 0.9 * p})`, display: 'inline-block', WebkitTextStroke: '2px #000', paintOrder: 'stroke fill'}}>{val}</span>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', right: 22, top: 58, width: 372, transform: 'scale(1.18)', transformOrigin: '100% 0%', background: 'linear-gradient(#0d1b33ee, #08101fee)', border: `4px solid ${AZUL}`, borderRadius: 16, padding: '8px 12px 10px', boxShadow: '0 10px 0 #0007'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, borderBottom: '2px solid #ffffff33', paddingBottom: 4, marginBottom: 4}}>
        <CabecaCarlos s={46} />
        <span style={{fontFamily: F, fontWeight: 900, fontSize: 30, color: '#fff'}}>CARLOS</span>
        <span style={{fontFamily: F, fontWeight: 900, fontSize: 20, color: '#fff', background: '#e8371a', borderRadius: 7, padding: '0 9px'}}>IA</span>
      </div>
      <Linha k="mortes" rot="MORTES" val={v.mortes} cor="#ff5a4a" />
      <Linha k="adm" rot="MORTES ADMITIDAS" val={0} cor="#fff" />
      <Linha k="sobrev" rot="SOBREVIVEU" val={v.sobrev} cor="#6fe07a" />
      <Linha k="percebeu" rot="QUEM PERCEBEU" val={v.percebeu} cor="#ffd400" />
      {estado === 'morto' ? (
        <div style={{marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#b01212', borderRadius: 10, padding: '2px 0', opacity: 0.8 + 0.2 * Math.sin(f / 5)}}>
          <Caveira s={30} />
          <span style={{fontFamily: F, fontWeight: 900, fontSize: 25, color: '#fff', whiteSpace: 'nowrap'}}>AGORA: MORTO (TORRE)</span>
        </div>
      ) : null}
    </div>
  );
};

// ---------- cartões especiais ----------
const Cerebros: React.FC<{marcas: number[]}> = ({marcas}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const itens: [React.ReactNode, string, string][] = [
    [<Controle key="a" />, 'DECIDE', 'pra onde ir, pular, falar'],
    [<Olho key="b" />, 'OLHA A TELA', 'descreve o que está vendo'],
    [<Balao key="c" />, 'ESCREVE NO CHAT', 'gíria, kkk e erro de digitação'],
  ];
  return (
    <AbsoluteFill style={{background: '#040a18b0', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 150, fontFamily: F, fontWeight: 900, fontSize: 64, color: '#fff', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', opacity: interpolate(f, [70, 90], [1, 0], cl)}}>O CARLOS POR DENTRO</div>
      <div style={{display: 'flex', gap: 46, marginTop: 60}}>
        {itens.map(([ic, t, s], i) => {
          const m = marcas[i] ?? i * 40;
          const e = spring({frame: f - m, fps, config: {damping: 12, stiffness: 180}});
          const ativo = f >= m && (i === 2 || f < (marcas[i + 1] ?? 1e9));
          return (
            <div key={i} style={{width: 470, background: '#eaf5ff', border: `8px solid ${ativo ? '#ffd400' : AZUL}`, borderRadius: 26, padding: '26px 20px', textAlign: 'center', transform: `translateY(${(1 - e) * 300}px) scale(${ativo ? 1.06 : 0.96}) rotate(${ativo ? Math.sin(f / 7) * 1.2 : 0}deg)`, opacity: e, boxShadow: ativo ? '0 0 50px #ffd400aa' : '0 14px 0 #0008'}}>
              <div style={{fontFamily: F, fontWeight: 900, fontSize: 30, color: AZUL}}>IA {i + 1}</div>
              {ic}
              <div style={{fontFamily: F, fontWeight: 900, fontSize: 46, color: '#0e3d73', lineHeight: 1.05}}>{t}</div>
              <div style={{fontFamily: F, fontWeight: 700, fontSize: 28, color: '#33506e', marginTop: 6}}>{s}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
// a mensagem de limite refeita em tamanho grande (o balão do jogo é pequeno demais para ler)
const Limite: React.FC<{marcas: number[]}> = ({marcas}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const m0 = marcas[0] ?? 0;
  const fim = m0 + 100; // a caixa em inglês fica ~3 s; a tradução vem depois em selo
  if (f < m0 || f > fim) return null;
  const e = spring({frame: f - m0, fps, config: {damping: 10, stiffness: 150}});
  const o = interpolate(f, [fim - 8, fim], [1, 0], cl);
  const tr = Math.max(0, 1 - (f - m0) / 16) * 10;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: `rgba(0,0,0,${0.5 * o})`, opacity: o}}>
      <div style={{transform: `scale(${0.5 + 0.5 * e}) translate(${Math.sin(f * 3) * tr}px, ${Math.cos(f * 2.3) * tr}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <CabecaCarlos s={130} />
          <div style={{background: '#fff', border: '8px solid #e8371a', borderRadius: 30, padding: '20px 44px', boxShadow: '0 14px 0 #000a'}}>
            <div style={{fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 66, color: '#111', lineHeight: 1.15}}>You've hit your 5-hour limit</div>
            <div style={{fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: 44, color: '#555'}}>resets 8:40pm (UTC)</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
const SemGravacao: React.FC<{texto: string}> = ({texto}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 60, top: 60, display: 'flex', alignItems: 'center', gap: 16, background: '#000d', border: '4px solid #fff', borderRadius: 12, padding: '6px 22px'}}>
      <div style={{width: 26, height: 26, borderRadius: '50%', background: '#777', opacity: 0.5 + 0.5 * Math.sin(f / 6)}} />
      <span style={{fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 34, color: '#fff'}}>{texto}</span>
    </div>
  );
};
// carimbo fixo no canto dos prints das partidas perdidas
const Carimbo: React.FC<{texto: string; jogo: string}> = ({texto, jogo}) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [4, 12], [3, 1], cl);
  return (
    <div style={{position: 'absolute', left: 46, top: 46, display: 'flex', alignItems: 'center', gap: 18, opacity: interpolate(f, [4, 8], [0, 1], cl), transform: `scale(${e})`, transformOrigin: '0 0'}}>
      <DiscoQuebrado s={120} />
      <div style={{transform: 'rotate(-3deg)'}}>
        <div style={{fontFamily: F, fontWeight: 900, fontSize: 54, color: '#fff', background: '#e8371a', border: '6px solid #fff', borderRadius: 12, padding: '0 20px', WebkitTextStroke: '2px #000', paintOrder: 'stroke fill', boxShadow: '0 10px 0 #0008'}}>{texto}</div>
        <div style={{fontFamily: F, fontWeight: 900, fontSize: 38, color: '#111', background: '#ffd400', border: '5px solid #000', borderRadius: 10, padding: '0 16px', marginTop: 8, display: 'inline-block'}}>{jogo}</div>
      </div>
    </div>
  );
};
// Murder: não sobrou nem print, só o registro do chat (faca desenhada, balançando)
const MurderCard: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #5a1420, #16060a 75%)'}}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{position: 'absolute', left: -200 + ((f * 3 + i * 420) % 2500), top: 60 + i * 170, width: 300, height: 8, background: '#ffffff12', borderRadius: 4}} />
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, transform: `scale(${0.6 + 0.4 * e})`}}>
        <svg width={420} height={240} viewBox="0 0 300 170" style={{transform: `rotate(${Math.sin(f / 9) * 9 - 6}deg)`}}>
          <path d="M60 120 L190 40 Q214 30 226 46 L96 136 Z" fill="#dfe6ee" stroke="#000" strokeWidth="5" />
          <rect x="40" y="112" width="62" height="26" rx="8" transform="rotate(-32 70 125)" fill="#7a4a22" stroke="#000" strokeWidth="5" />
        </svg>
        <div>
          <div style={{fontFamily: F, fontWeight: 900, fontSize: 130, color: '#fff', lineHeight: 1, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill'}}>MURDER</div>
          <div style={{fontFamily: F, fontWeight: 900, fontSize: 40, color: '#111', background: '#ffd400', border: '5px solid #000', borderRadius: 10, padding: '0 16px', display: 'inline-block'}}>GRAVAÇÃO PERDIDA · SÓ O REGISTRO DO CHAT</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
const Final: React.FC<{marcas: number[]}> = ({marcas}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const linhas: [string, string, string][] = [
    ['MORTES NA GRAVAÇÃO', '8', '#ff5a4a'],
    ['MORTES ADMITIDAS', '0', '#fff'],
    ['RODADAS QUE SOBREVIVEU', '3', '#6fe07a'],
    ['DESASTRES QUE ELE INVENTOU', '2', '#ffb04a'],
    ['JOGADORES QUE DESCONFIARAM', '1', '#ffd400'],
  ];
  const mp = marcas[5];
  const premio = mp !== undefined && f >= mp;
  return (
    <AbsoluteFill style={{background: '#040a18d8'}}>
      <div style={{position: 'absolute', left: premio ? 90 : 430, top: 110, width: 1060, transition: 'none', transform: `translateX(${premio ? interpolate(f - mp, [0, 12], [340, 0], cl) : 0}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14}}>
          <CabecaCarlos s={110} />
          <div style={{fontFamily: F, fontWeight: 900, fontSize: 76, color: '#fff', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill'}}>PLACAR DO CARLOS</div>
        </div>
        {linhas.map(([r, v, cor], i) => {
          const m = marcas[i];
          if (m === undefined || f < m) return <div key={i} style={{height: 118}} />;
          const e = spring({frame: f - m, fps, config: {damping: 12, stiffness: 190}});
          return (
            <div key={i} style={{height: 104, marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d1b33', border: `5px solid ${AZUL}`, borderRadius: 16, padding: '0 34px', transform: `translateX(${(1 - e) * -500}px)`, opacity: e, boxShadow: '0 8px 0 #0008'}}>
              <span style={{fontFamily: F, fontWeight: 800, fontSize: 46, color: '#dfe8f5'}}>{r}</span>
              <span style={{fontFamily: F, fontWeight: 900, fontSize: 86, color: cor, WebkitTextStroke: '4px #000', paintOrder: 'stroke fill', transform: `scale(${interpolate(f - m, [0, 8], [2.4, 1], cl)})`, display: 'inline-block'}}>{v}</span>
            </div>
          );
        })}
      </div>
      {premio ? (
        <div style={{position: 'absolute', right: 80, top: 250, width: 600, textAlign: 'center', transform: `scale(${spring({frame: f - mp, fps, config: {damping: 9, stiffness: 140}})}) rotate(${Math.sin(f / 9) * 2}deg)`}}>
          <Trofeu s={300} />
          <div style={{fontFamily: F, fontWeight: 800, fontSize: 34, color: '#ffd400', letterSpacing: 2}}>PRÊMIO DO VÍDEO</div>
          <div style={{fontFamily: F, fontWeight: 900, fontSize: 62, color: '#fff', lineHeight: 1.05, WebkitTextStroke: '7px #000', paintOrder: 'stroke fill'}}>O MORTO MAIS VIVO DO ROBLOX</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
const Texto: React.FC<{cab: string; linhas: string[]; cor?: string}> = ({cab, linhas, cor = '#ffd400'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 13}});
  return (
    <AbsoluteFill style={{background: '#040a18cc', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 110}}>
      <div style={{textAlign: 'center', transform: `scale(${0.7 + 0.3 * e})`, opacity: e, maxWidth: 1640}}>
        <div style={{display: 'inline-block', fontFamily: F, fontWeight: 900, fontSize: 44, color: '#fff', background: AZUL, borderRadius: 12, padding: '2px 30px', marginBottom: 26, letterSpacing: 3}}>{cab}</div>
        {linhas.map((l, i) => (
          <div key={i} style={{fontFamily: F, fontWeight: 900, fontSize: 86, lineHeight: 1.1, color: i % 2 ? cor : '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', transform: `translateY(${interpolate(f - 6 - i * 10, [0, 10], [60, 0], cl)}px) rotate(${Math.sin(f / 22 + i) * 0.6}deg)`, opacity: interpolate(f - 6 - i * 10, [0, 8], [0, 1], cl)}}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- o cérebro do Carlos: quem controla, quem olha, quem escreve (sempre visível, canto de baixo à esquerda) ----------
const ICONE: Record<string, React.FC> = {jev: Controle, olho: Olho, chat: Balao};
const ROT: Record<string, string> = {jev: 'CONTROLE', olho: 'OLHOS', chat: 'CHAT'};
const COR: Record<string, string> = {jev: '#ff5a5a', olho: AZUL, chat: '#3cc84a'};
const CerebroHud: React.FC<{c: Cerebro}> = ({c}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 22, top: 22, transform: 'scale(1.18)', transformOrigin: '0 0', background: 'linear-gradient(#0d1b33ee, #08101fee)', border: '4px solid #ffffff55', borderRadius: 14, padding: '6px 12px 8px', boxShadow: '0 8px 0 #0007'}}>
      <div style={{fontFamily: F, fontWeight: 900, fontSize: 19, color: '#9fb6d6', letterSpacing: 2, marginBottom: 2}}>CÉREBRO DO CARLOS</div>
      {(['jev', 'olho', 'chat'] as const).map((k) => {
        const Ic = ICONE[k];
        const novo = c.muda?.includes(k);
        const p = novo ? Math.max(0, 1 - f / 60) : 0;
        return (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 8, height: 38, background: p ? `rgba(255,212,0,${0.45 * p})` : undefined, borderRadius: 8, padding: '0 4px'}}>
            <div style={{width: 34, height: 34, transform: 'scale(0.31)', transformOrigin: '0 0'}}><Ic /></div>
            <span style={{fontFamily: F, fontWeight: 800, fontSize: 19, color: COR[k], width: 112}}>{ROT[k]}</span>
            <span style={{fontFamily: F, fontWeight: 900, fontSize: 25, color: '#fff', transform: `scale(${1 + 0.5 * p})`, transformOrigin: '0 50%', display: 'inline-block'}}>{c[k]}</span>
          </div>
        );
      })}
    </div>
  );
};
// pensamento secreto: o que o "olho" descreveu ou o que o "controle" decidiu, copiado do log (o espectador sabe antes)
const Pensa: React.FC<{quem: 'olho' | 'jev' | 'chat'; texto: string; extra?: string; dur: number}> = ({quem, texto, extra, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 12, stiffness: 170}});
  const o = interpolate(f, [dur - 7, dur], [1, 0], cl);
  const n = Math.min(texto.length, Math.floor(f * 2.6));
  const Ic = ICONE[quem];
  const cab = quem === 'olho' ? 'O OLHO DO CARLOS VIU:' : quem === 'jev' ? 'O CONTROLE DECIDIU:' : 'O CHAT PENSOU:';
  return (
    <div style={{position: 'absolute', left: 40, right: 470, top: 250, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, maxWidth: 1400, transform: `scale(${0.6 + 0.4 * e}) translateY(${(1 - e) * -60}px)`}}>
        <div style={{flex: 'none', background: '#fff', borderRadius: '50%', border: `7px solid ${COR[quem]}`, width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 0 #0008'}}><Ic /></div>
        <div style={{background: '#101828f2', border: `6px dashed ${COR[quem]}`, borderRadius: 28, padding: '10px 30px 14px', boxShadow: '0 10px 0 #0008'}}>
          <div style={{fontFamily: F, fontWeight: 900, fontSize: 30, color: COR[quem], letterSpacing: 2}}>{cab}</div>
          <div style={{fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: texto.length > 70 ? 40 : 50, color: '#fff', lineHeight: 1.18}}>
            "{texto.slice(0, n)}{n < texto.length ? <span style={{opacity: Math.sin(f / 2) > 0 ? 1 : 0}}>|</span> : '"'}
          </div>
          {extra && n >= texto.length ? <div style={{fontFamily: F, fontWeight: 900, fontSize: 34, color: '#ffd400', marginTop: 4}}>{extra}</div> : null}
        </div>
      </div>
    </div>
  );
};
// cartão de atualização: o que eu troquei no Carlos (antes -> depois)
const Atualiza: React.FC<{slot: string; de: string; para: string; nota?: string; dur: number}> = ({slot, de, para, nota, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 11, stiffness: 150}});
  const o = interpolate(f, [dur - 8, dur], [1, 0], cl);
  const Ic = ICONE[slot] ?? Controle;
  const troca = interpolate(f, [16, 26], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: `rgba(4,10,24,${0.62 * o})`, justifyContent: 'center', alignItems: 'center', opacity: o}}>
      <div style={{transform: `scale(${0.7 + 0.3 * e}) rotate(${(1 - e) * -6}deg)`, background: '#eaf5ff', border: '8px solid #ffd400', borderRadius: 28, padding: '22px 56px 28px', textAlign: 'center', boxShadow: '0 0 70px #ffd40088, 0 18px 0 #000a', minWidth: 980, maxWidth: 1600}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, background: '#ffd400', border: '5px solid #000', borderRadius: 12, padding: '2px 24px'}}>
          <svg width={46} height={46} viewBox="0 0 46 46"><path d="M23 3 L27 15 L40 12 L32 22 L42 31 L29 31 L27 44 L20 33 L8 40 L12 27 L2 20 L15 17 Z" fill="#fff" stroke="#000" strokeWidth="3" transform={`rotate(${f * 4} 23 23)`} /></svg>
          <span style={{fontFamily: F, fontWeight: 900, fontSize: 44, color: '#111', letterSpacing: 2}}>ATUALIZAÇÃO DO CARLOS</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, marginTop: 18}}>
          {slot !== 'tudo' ? <Ic /> : null}
          <div style={{fontFamily: F, fontWeight: 900, fontSize: de.length > 16 ? 42 : 58, maxWidth: 560, lineHeight: 1.1, color: '#7a8796', textDecoration: 'line-through', textDecorationThickness: 8, textDecorationColor: '#e8371a', opacity: 1 - 0.4 * troca}}>{de}</div>
          <svg width={90} height={60} viewBox="0 0 90 60" style={{transform: `scaleX(${troca})`}}><path d="M4 22 H58 V6 L86 30 L58 54 V38 H4 Z" fill="#2aa84a" stroke="#000" strokeWidth="5" strokeLinejoin="round" /></svg>
          <div style={{fontFamily: F, fontWeight: 900, fontSize: para.length > 16 ? 56 : 72, maxWidth: 680, lineHeight: 1.08, color: '#0e3d73', transform: `scale(${troca})`}}>{para}</div>
        </div>
        {nota ? <div style={{fontFamily: F, fontWeight: 800, fontSize: 38, color: '#33506e', marginTop: 10, opacity: troca}}>{nota}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------- cena ----------
const CenaView: React.FC<{c: Cena}> = ({c}) => {
  const f = useCurrentFrame();
  let soco = 0, tremor = 0;
  for (const o of c.over) {
    const d = f - o.at;
    if (d >= 0 && d < 12 && (o.tipo === 'selo' || o.tipo === 'meme' || o.tipo === 'numero' || o.tipo === 'morte')) soco = Math.max(soco, 0.06 * (1 - d / 12));
    if (d >= 0 && d < 14 && (o.tipo === 'numero' || o.tipo === 'morte')) tremor = Math.max(tremor, 12 * (1 - d / 14));
  }
  // deriva lenta em toda cena: zoom de z0 a z1 em volta do foco + passeio de poucos pixels
  const k = c.dur > 1 ? f / (c.dur - 1) : 0;
  const s = k * k * (3 - 2 * k);
  const z = (c.cam.z0 + (c.cam.z1 - c.cam.z0) * s) * (1 + soco);
  const dx = Math.sin(f / 70 + c.dur) * 8 + (tremor ? Math.sin(f * 2.7) * tremor : 0);
  const dy = Math.cos(f / 90) * 5 + (tremor ? Math.cos(f * 3.3) * tremor : 0);
  const flash = interpolate(f, [0, 5], [0.45, 0], cl);
  const m = c.marcas ?? [];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transformOrigin: `${c.cam.x * 100}% ${c.cam.y * 100}%`, transform: `translate(${dx}px, ${dy}px) scale(${z * 1.012})`, filter: c.blur ? `blur(${c.blur}px)` : undefined}}>
        {c.clip ? <OffthreadVideo src={staticFile(c.clip)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : null}
        {c.img ? <Img src={staticFile(c.img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : null}
        {c.over.map((o, i) => (o.tipo === 'seta' ? <Sequence key={i} from={o.at} durationInFrames={o.dur} layout="none"><Seta x={o.x} y={o.y} rotulo={o.rotulo} lado={o.lado} dur={o.dur} /></Sequence> : null))}
      </AbsoluteFill>
      {c.escuro ? <AbsoluteFill style={{background: `rgba(4,10,24,${c.escuro})`}} /> : null}
      <AbsoluteFill style={{boxShadow: 'inset 0 0 200px 30px #000a', pointerEvents: 'none'}} />
      {c.vel && c.vel >= 3 ? (
        <div style={{position: 'absolute', left: 30, top: c.cerebro && c.hud.mostra ? 200 : 78, display: 'flex', alignItems: 'center', gap: 8, fontFamily: F, fontWeight: 900, fontSize: 38, color: '#fff', background: '#000b', borderRadius: 10, padding: '0 16px'}}>
          <svg width={44} height={30} viewBox="0 0 44 30"><path d="M2 2 L20 15 L2 28 Z M22 2 L40 15 L22 28 Z" fill="#fff" opacity={0.6 + 0.4 * Math.sin(f / 3)} /></svg>
          {Math.round(c.vel)}x
        </div>
      ) : null}
      {c.visual === 'cerebros' ? <Cerebros marcas={m} /> : null}
      {c.visual === 'murder' ? <MurderCard /> : null}
      {c.visual === 'carimbo' ? <Carimbo texto={String(c.props?.texto ?? 'GRAVAÇÃO PERDIDA')} jogo={String(c.props?.jogo ?? '')} /> : null}
      {c.visual === 'final' ? <Final marcas={m} /> : null}
      {c.visual === 'texto' ? <Texto cab={String(c.props?.cab ?? '')} linhas={(c.props?.linhas as string[]) ?? []} cor={c.props?.cor as string | undefined} /> : null}
      {c.visual === 'semgravacao' ? <SemGravacao texto={String(c.props?.texto ?? 'SEM GRAVAÇÃO')} /> : null}
      {c.over.map((o, i) =>
        o.tipo === 'meme' && o.pos !== 'full' ? (
          <Sequence key={`m${i}`} from={o.at} durationInFrames={o.dur}>
            <AbsoluteFill style={{transform: o.pos === 'left' || o.pos === 'right' ? 'translateY(150px)' : o.pos === 'top' ? 'translateY(-30px) scale(0.8)' : undefined}}>
              <MemeCard info={o.info} dur={o.dur} pos={o.pos} caption={o.caption} />
            </AbsoluteFill>
          </Sequence>
        ) : null,
      )}
      {c.hud.mostra ? <Placar hud={c.hud} estado={c.estado} /> : null}
      {c.cerebro && c.hud.mostra && c.visual !== 'semgravacao' ? <CerebroHud c={c.cerebro} /> : null}
      {c.visual === 'limite' ? <Limite marcas={m} /> : null}
      {c.over.map((o, i) =>
        o.tipo === 'seta' || o.tipo === 'meme' ? null : (
          <Sequence key={i} from={o.at} durationInFrames={o.dur}>
            {o.tipo === 'ia' || o.tipo === 'bush' || o.tipo === 'jog' ? <Fala quem={o.tipo} texto={o.texto} dur={o.dur} /> : null}
            {o.tipo === 'selo' ? <Selo texto={o.texto} cor={o.cor} hud={c.hud.mostra} /> : null}
            
            {o.tipo === 'numero' ? <NumeroG texto={o.texto} sub={o.sub} dur={o.dur} /> : null}
            {o.tipo === 'marco' ? <Marco titulo={o.titulo} sub={o.sub} dur={o.dur} /> : null}
            {o.tipo === 'morte' ? <Morte n={o.n} dur={o.dur} /> : null}
            {o.tipo === 'tempo' ? <Tempo texto={o.texto} dur={o.dur} /> : null}
            {o.tipo === 'crono' ? <Crono rotulo={o.rotulo} de={o.de} ate={o.ate} dur={o.dur} /> : null}
            {o.tipo === 'pensa' ? <Pensa quem={o.quem} texto={o.texto} extra={o.extra} dur={o.dur} /> : null}
            {o.tipo === 'atualiza' ? <Atualiza slot={o.slot} de={o.de} para={o.para} nota={o.nota} dur={o.dur} /> : null}
          </Sequence>
        ),
      )}
      {c.over.map((o, i) =>
        o.tipo === 'meme' && o.pos === 'full' ? (
          <Sequence key={`f${i}`} from={o.at} durationInFrames={o.dur}>
            <MemeCard info={o.info} dur={o.dur} pos="full" caption={o.caption} />
          </Sequence>
        ) : null,
      )}
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

export const RobloxVideo: React.FC<{tl: TL | null}> = ({tl}) => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(h));
  }, [h]);
  if (!tl) return null;
  let ini = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.cenas.map((c) => {
        const de = ini;
        ini += c.dur;
        return <Sequence key={c.id} from={de} durationInFrames={c.dur}><CenaView c={c} /></Sequence>;
      })}
    </AbsoluteFill>
  );
};
