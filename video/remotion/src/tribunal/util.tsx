// TRIBUNAL: utilidades das cenas (câmera por quadros-chave, HUD fixo com chip e farol, painel de versões, recortes).
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {BANG, C, CamCtx, cl, COR, ease, LATAO, LUZ, MONO, NOME, PERG, Pedra, POP, quique, sombra, TINTA} from './base';
import {Chip, estado, FarolPac, PlacaJogo, TagSo, type Marca, type Passo} from './pecas';
import type {X} from './dados';

export type Out = {m: React.ReactNode; h?: React.ReactNode};
export type CenaFn = (X: X) => Out;

// câmera: quadros-chave [quadro, x, y, zoom] no mundo de 1920x1080, interpolados com suavidade (nada de pulo)
export const camEm = (f: number, k: [number, number, number, number][]) => {
  if (!k.length) return [960, 540, 1];
  if (f <= k[0][0]) return k[0].slice(1);
  for (let i = 0; i < k.length - 1; i++) {
    const [a, ...A] = k[i], [b, ...B] = k[i + 1];
    if (f < b) { const t = ease(f, a, b); return A.map((v, j) => v + (B[j] - v) * t); }
  }
  return k[k.length - 1].slice(1);
};
export const Cam: React.FC<{f: number; k: [number, number, number, number][]; children: React.ReactNode}> = ({f, k, children}) => {
  const [x0, y0, z] = camEm(f, k);
  // não deixa a câmera passar da borda do cenário (o palco tem ~60 px de sobra em volta)
  const mx = Math.max(0, 1017 - 960 / z), my = Math.max(0, 572 - 540 / z);
  const x = Math.min(960 + mx, Math.max(960 - mx, x0)), y = Math.min(540 + my, Math.max(540 - my, y0));
  return <CamCtx.Provider value={[x, y, z]}><AbsoluteFill style={{transform: `translate(${960 - x * z}px, ${540 - y * z}px) scale(${z})`, transformOrigin: '0 0'}}>{children}</AbsoluteFill></CamCtx.Provider>;
};

// HUD fixo: chip da rodada (canto superior esquerdo) e farol da paciência (canto superior direito)
export type FarolCfg = {rod: string; passos: Passo[]; placa?: {txt: string; at: number}; aviso?: string; risco?: number; rot?: string; s?: number};
export const Hud: React.FC<{f: number; rod?: string | null; dia?: number | string | null; acao?: number | null; extra?: string; farol?: FarolCfg | null; dois?: {S: Passo[]; J: Passo[]; rot?: string; de?: number} | null; aparece?: number}> = ({f, rod, dia, acao, extra, farol, dois, aparece = 0}) => {
  const a = ease(f, aparece, aparece + 10);
  const fe = farol ? estado(f, farol.passos) : null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', zIndex: 45}}>
      {rod ? <div style={{position: 'absolute', left: 36, top: 26, opacity: a, transform: `translateY(${(1 - a) * -40}px)`}}><Chip rod={rod} dia={dia ?? undefined} acao={acao} extra={extra} f={f} /></div> : null}
      {farol && fe ? <div style={{position: 'absolute', right: 34, top: 18, opacity: a}}><FarolPac rod={farol.rod} n={fe.n} antes={fe.antes} t={fe.t} s={farol.s ?? 100} f={f} aviso={farol.aviso} risco={farol.risco} rot={farol.rot} /></div> : null}
      {farol?.placa && f - farol.placa.at >= 0 && f - farol.placa.at < 150 ? <div style={{position: 'absolute', left: 0, right: 0, top: 22, display: 'flex', justifyContent: 'center', transform: `scale(${quique(f - farol.placa.at, 0, 12)})`, opacity: 1 - ease(f, farol.placa.at + 138, farol.placa.at + 150)}}><PlacaJogo txt={farol.placa.txt} fs={28} /></div> : null}
      {dois && f >= (dois.de ?? 0) ? (() => { const k = ease(f, dois.de ?? 0, (dois.de ?? 0) + 12); const S = estado(f, dois.S), J = estado(f, dois.J); return (
        <div style={{position: 'absolute', left: 36, top: 92, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, opacity: k, transform: `translateX(${(1 - k) * -300}px) scale(0.8)`, transformOrigin: '0 0'}}>
          {(['S', 'J'] as const).map((r) => { const e = r === 'S' ? S : J; return <div key={r} style={{display: 'flex', alignItems: 'center', gap: 10, background: '#1a0f08dd', border: `4px solid ${LATAO}`, borderRadius: 14, padding: '6px 16px 6px 10px', boxShadow: sombra}}><FarolPac rod={r} n={e.n} antes={e.antes} t={e.t} s={78} f={f} /><div style={{fontFamily: POP, fontWeight: 800, fontSize: 30, color: COR[r === 'S' ? 'Azul' : 'Verde'], ...C(5)}}>{r === 'S' ? 'SAFIRA' : 'JADE'}</div></div>; })}
          {dois.rot ? <div style={{alignSelf: 'center', fontFamily: BANG, fontSize: 56, letterSpacing: 2, color: '#fff', ...C(8)}}>{dois.rot}</div> : null}
        </div>
      ); })() : null}
    </AbsoluteFill>
  );
};

// passos do farol a partir do log: [quadro, luzes]
export const passos = (ini: number, ...ps: [number, number][]): Passo[] => [[-1e9, ini], ...ps];

// ---------- VERSÕES DO RUBI: a lista da direção (seção 6), na ordem em que entram no vídeo ----------
const V = (cena: string, col: number, txt: string, rod: string, ref: string) => ({cena, col, txt, rod, ref});
export const VERSOES_VIDEO = [
  V('C3', 2, 'selo da Colônia', 'S', 'S#19'),
  V('D2', 0, 'ficar sozinho, olhar o mar', 'S', 'S#42'), V('D2', 1, 'corte de sexta-feira', 'S', 'S#42'),
  V('E3', 0, 'rádio VHF', 'J', 'J#21'),
  V('F2', 1, 'ferro do estaleiro', 'J', 'J#48'), V('F2', 0, 'placa coberta por lona', 'J', 'J#52'),
  V('H1', 0, 'rádio portátil', 'J', 'J#93'),
  V('I1', 0, 'fornecedor de madeira', 'S', 'S#98'),
];
const ORDEM = 'A1 A2 A3 B1 B2 B3 C1 C2 C3 C4 D1 D2 D3 D4 E1 E2 E3 E4 F1 F2 F3 G1 G2 G3 G4 G5 G6 H1 H2 H3 H4 I1 I2 I3 I4 I5 I6 I7 J1 J2 J3 J4'.split(' ');
export const marcasPara = (cena: string, tempos: number[]): Marca[] => {
  const io = ORDEM.indexOf(cena); let k = 0;
  return VERSOES_VIDEO.filter((v) => ORDEM.indexOf(v.cena) <= io).map((v) => ({col: v.col, txt: v.txt, rod: v.rod, ref: v.ref, at: v.cena === cena ? tempos[k++] ?? 0 : -1}));
};
// lista completa (J3, "CÁLCULO NOSSO"): todas as desculpas que não existem no caso ou contradizem a anterior
export const VERSOES_TODAS: Marca[] = [
  ...['ligação (ao vigia)', 'olhar o mar', 'menti, tentei telefonar', 'ficar sozinho', 'sinal ruim', 'escada com sinal', 'fornecedor de madeira'].map((t) => ({col: 0, txt: t, rod: 'S', at: -1})),
  ...['ligação que não completou', 'rádio VHF', 'esqueceu a placa', 'placa sob lona', 'Seu Otávio e o saveiro', 'o mar me chama', 'rádio portátil'].map((t) => ({col: 0, txt: t, rod: 'J', at: -1})),
  ...['consertando barco', 'amarra de aço', 'trocou às 22:22', 'amarra de cabrestante', 'casco velho', 'sexta-feira', 'cabo do guincho'].map((t) => ({col: 1, txt: t, rod: 'S', at: -1})),
  ...['barco', 'amarra à tarde', 'ferro', 'casco do saveiro', 'casco velho', 'ferro no sábado', 'enfermeiro do posto'].map((t) => ({col: 1, txt: t, rod: 'J', at: -1})),
  ...['Colônia de Pescadores', 'Companhia do Porto'].map((t) => ({col: 2, txt: t, rod: 'S', at: -1})),
  ...['metade dos cascos da costa', 'cooperativa do Estrela do Mar'].map((t) => ({col: 2, txt: t, rod: 'J', at: -1})),
];

// recorte de conversa (jornal-replay) com carimbo FORA DOS AUTOS
export const Recorte: React.FC<{cor: string; txt: string; rod: string; dia: number; ref: string; t: number; carimbo?: number; w?: number}> = ({cor, txt, rod, dia, ref, t, carimbo = 999, w = 760}) => t < 0 ? null : (
  <div style={{position: 'relative', width: w, background: '#ECE4CF', border: `5px solid ${TINTA}`, boxShadow: sombra, padding: '12px 22px 18px', transform: `rotate(-2deg) scale(${quique(t, 0, 14)})`, clipPath: 'polygon(0 3%, 6% 0, 14% 2%, 30% 0, 52% 2%, 70% 0, 88% 2%, 100% 0, 99% 50%, 100% 100%, 80% 98%, 60% 100%, 38% 98%, 18% 100%, 0 98%)'}}>
    <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 20, color: '#5a5343'}}>CONVERSA · {rod === 'S' ? 'RODADA DA SAFIRA' : 'RODADA DA JADE'} · DIA {dia} · {ref}</div>
    <div style={{display: 'flex', gap: 12, alignItems: 'center'}}><Pedra cor={cor} s={110} busto f={t} humor="cinico" /><div style={{fontFamily: POP, fontWeight: 800, fontSize: 34, lineHeight: 1.2, color: TINTA}}><span style={{color: COR[cor]}}>{NOME[cor]}:</span> “{txt}”</div></div>
    {t >= carimbo ? <div style={{position: 'absolute', right: 20, bottom: 10, transform: `rotate(-9deg) scale(${interpolate(t - carimbo, [0, 6], [2.4, 1], cl)})`, fontFamily: BANG, fontSize: 64, letterSpacing: 3, color: '#4a5058', border: '7px solid #4a5058', borderRadius: 10, padding: '0 14px', background: '#ECE4CFcc'}}>FORA DOS AUTOS</div> : null}
  </div>
);

// cartão "SÓ VOCÊ VÊ" de abertura de trecho
export const CartaoSo: React.FC<{t: number; dur: number; txt: string}> = ({t, dur, txt}) => t < 0 || t > dur ? null : (
  <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, opacity: interpolate(t, [0, 6, dur - 8, dur], [0, 1, 1, 0], cl)}}>
    <div style={{transform: `scale(${quique(t, 0, 16)}) rotate(-2deg)`, boxShadow: `0 0 90px ${LUZ}`}}><TagSo txt={txt} fs={84} /></div>
  </AbsoluteFill>
);

// faixa de rótulo simples (papel)
export const Rot: React.FC<{children: React.ReactNode; fs?: number; bg?: string; cor?: string; rot?: number; style?: React.CSSProperties}> = ({children, fs = 30, bg = PERG, cor = TINTA, rot = -1.5, style}) => (
  <div style={{display: 'inline-block', fontFamily: POP, fontWeight: 800, fontSize: fs, lineHeight: 1.15, color: cor, background: bg, border: `4px solid ${TINTA}`, borderRadius: 8, padding: `2px ${fs * 0.45}px`, boxShadow: '5px 5px 0 #0008', whiteSpace: 'nowrap', transform: `rotate(${rot}deg)`, ...style}}>{children}</div>
);
export const pop = (f: number, at: number, d = 12) => (f < at ? 0 : quique(f, at, d));
