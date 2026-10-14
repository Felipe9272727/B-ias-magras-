// A cozinha do Overcooked das IAs desenhada a partir do log do motor (overcooked/cozinha.mjs).
// `t` é o tempo em tiques (fracionário): no começo de cada tique os chefs andam pelo caminho registrado e, ao chegar,
// o estado da cozinha passa para o do fim do tique. Arte própria, no espírito do jogo (vista de cima inclinada).
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FONT} from '../theme';
import {Fogo, Item, type Obj} from './Itens';
import {Ingrediente} from './Itens';

export type LogOC = {
  mapa: string[]; duracao: number; tickS: number; receitas: string[];
  cozinhas: {nome: string; chefs: {nome: string; provider: string; empresa: string; modelo: string; inicio: {x: number; y: number}}[]}[];
  tiques: {tique: number; cozinhas: {nome: string; chefs: Record<string, {de: P; caminho: P[]; acao: string; fala: string; pensa: string; fez: string | null; bloqueado: string | null}>; eventos: any[]; estado: Estado}[]}[];
};
type P = {x: number; y: number};
type Estado = {tique: number; pontos: number; pedidos: {id: number; receita: string; resta: number; tempo: number}[]; chefs: {nome: string; pos: P; obj: Obj | null}[]; tiles: {x: number; y: number; obj: Obj | null; fogo: boolean; pratos?: number; sujos?: number; picando?: number}[]};

export const COR_EMPRESA: Record<string, string> = {DeepSeek: '#4d6bfe', Claude: '#d97a47', GPT: '#10a37f', Gemini: '#8b5cf6'};
const CAIXA: Record<string, string> = {T: 'tomate', O: 'cebola', M: 'cogumelo', A: 'alface', P: 'pão', K: 'carne'};
const ANDAR = 0.55; // fração do tique gasta andando
const COZ: Record<string, number> = {panela: 4, frigideira: 3};

export const estadoEm = (log: LogOC, cz: number, i: number): Estado | null => (i >= 0 ? log.tiques[Math.min(i, log.tiques.length - 1)]?.cozinhas[cz].estado ?? null : null);

const gritando = (s: string) => {
  const letras = s.replace(/[^A-Za-zÀ-ú]/g, '');
  return letras.length > 6 && letras.replace(/[^A-ZÀ-Ý]/g, '').length / letras.length > 0.6;
};

// ---------------------------------------------------------------- peças fixas do mapa
const Bancada: React.FC<{ch: string; s: number}> = ({ch, s}) => {
  const topo = s * 0.74;
  const madeira = ch === 'B' ? '#e9c89a' : '#d39b62';
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 1, right: 1, top: 1, height: topo, background: ch === 'F' || ch === 'G' ? '#4a4f58' : ch === 'S' ? '#b9c4cf' : ch === 'E' ? '#c9ced6' : madeira, borderRadius: s * 0.08, border: '3px solid #2a1a0c', boxSizing: 'border-box'}} />
      <div style={{position: 'absolute', left: 1, right: 1, top: topo - 2, bottom: 1, background: ch === 'F' || ch === 'G' ? '#2d3138' : '#9a6436', borderRadius: `0 0 ${s * 0.08}px ${s * 0.08}px`, border: '3px solid #2a1a0c', borderTop: 'none', boxSizing: 'border-box'}} />
      {ch === 'B' && <svg width={s} height={topo} viewBox="0 0 100 74" style={{position: 'absolute', left: 0, top: 0}}><rect x={14} y={12} width={72} height={50} rx={8} fill="#f3dcb4" stroke="#8a5a2a" strokeWidth={3} /><path d="M70 18l16 -10" stroke="#9aa3ad" strokeWidth={6} strokeLinecap="round" /></svg>}
      {(ch === 'F' || ch === 'G') && <svg width={s} height={topo} viewBox="0 0 100 74" style={{position: 'absolute', left: 0, top: 0}}><circle cx={50} cy={37} r={26} fill="none" stroke="#1d1f24" strokeWidth={6} /><circle cx={50} cy={37} r={14} fill="none" stroke="#ff7a1a" strokeWidth={3} opacity={0.6} /></svg>}
      {ch === 'S' && <svg width={s} height={topo} viewBox="0 0 100 74" style={{position: 'absolute', left: 0, top: 0}}><rect x={16} y={14} width={68} height={46} rx={10} fill="#7fb6d9" stroke="#4a6a80" strokeWidth={3} /><path d="M50 4v14" stroke="#9aa3ad" strokeWidth={6} /></svg>}
      {ch === 'E' && <svg width={s} height={topo} viewBox="0 0 100 74" style={{position: 'absolute', left: 0, top: 0}}><rect x={6} y={8} width={88} height={58} rx={6} fill="#2b2f36" /><path d="M24 37h44M56 24l14 13-14 13" stroke="#ffd84d" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      {ch === 'L' && <svg width={s} height={topo} viewBox="0 0 100 74" style={{position: 'absolute', left: 0, top: 0}}><ellipse cx={50} cy={37} rx={30} ry={24} fill="#3b3f46" stroke="#1d1f24" strokeWidth={4} /><path d="M38 30l24 14M62 30l-24 14" stroke="#888" strokeWidth={5} /></svg>}
      {CAIXA[ch] && (
        <>
          <svg width={s} height={topo} viewBox="0 0 100 74" style={{position: 'absolute', left: 0, top: 0}}><rect x={8} y={6} width={84} height={62} rx={6} fill="#b5763a" stroke="#5a3613" strokeWidth={4} /><path d="M8 22h84M8 52h84" stroke="#5a3613" strokeWidth={3} /></svg>
          <div style={{position: 'absolute', left: s * 0.18, top: -s * 0.02}}><Ingrediente nome={CAIXA[ch]} s={s * 0.64} /></div>
        </>
      )}
    </div>
  );
};

const Chef: React.FC<{cor: string; nome: string; empresa: string; s: number; virado: boolean; anda: boolean; frame: number; obj: Obj | null; acao: string}> = ({cor, nome, empresa, s, virado, anda, frame, obj, acao}) => {
  const balanca = anda ? Math.sin(frame / 2.2) * 4 : Math.sin(frame / 9) * 1.5;
  const picando = /^picar/.test(acao) && !anda;
  const mao = picando ? Math.sin(frame / 1.6) * s * 0.08 : 0;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: s, height: s, transform: `translateY(${-Math.abs(balanca)}px)`}}>
      <div style={{position: 'absolute', left: s * 0.18, top: s * 0.82, width: s * 0.64, height: s * 0.16, borderRadius: '50%', background: '#0005'}} />
      <svg width={s} height={s * 1.25} viewBox="0 0 100 125" style={{position: 'absolute', left: 0, top: -s * 0.42, transform: virado ? 'scaleX(-1)' : undefined}}>
        {/* chapéu */}
        <rect x={30} y={18} width={40} height={20} rx={4} fill="#fff" stroke="#1d1206" strokeWidth={4} />
        <circle cx={38} cy={18} r={12} fill="#fff" stroke="#1d1206" strokeWidth={4} />
        <circle cx={52} cy={12} r={13} fill="#fff" stroke="#1d1206" strokeWidth={4} />
        <circle cx={64} cy={18} r={11} fill="#fff" stroke="#1d1206" strokeWidth={4} />
        <rect x={32} y={22} width={36} height={12} fill="#fff" />
        {/* corpo */}
        <ellipse cx={50} cy={78} rx={33} ry={36} fill={cor} stroke="#1d1206" strokeWidth={5} />
        <path d="M30 84c6 20 34 20 40 0v26c-12 8-28 8-40 0z" fill="#fff" stroke="#1d1206" strokeWidth={4} />
        {/* rosto */}
        <circle cx={60} cy={62} r={5} fill="#1d1206" />
        <circle cx={76} cy={62} r={5} fill="#1d1206" />
        <path d="M62 76q8 6 14 0" stroke="#1d1206" strokeWidth={4} fill="none" strokeLinecap="round" />
      </svg>
      {/* mãos flutuando */}
      <div style={{position: 'absolute', left: virado ? s * -0.02 : s * 0.78, top: s * 0.28 + mao, width: s * 0.2, height: s * 0.2, borderRadius: '50%', background: '#fff', border: '3px solid #1d1206'}} />
      {obj && <div style={{position: 'absolute', left: virado ? -s * 0.28 : s * 0.48, top: s * 0.02}}><Item o={obj} s={s * 0.62} frame={frame} /></div>}
      <div style={{position: 'absolute', left: -s, right: -s, top: -s * 0.78, textAlign: 'center', whiteSpace: 'nowrap'}}>
        <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: s * 0.2, color: '#fff', WebkitTextStroke: `${Math.max(1, s * 0.012)}px #000`, textShadow: '0 2px 0 #000'}}>{nome}</span>
        <span style={{marginLeft: 4, fontFamily: FONT.display, fontWeight: 800, fontSize: s * 0.13, padding: '1px 5px', borderRadius: 5, background: cor, color: '#fff', verticalAlign: 'middle', border: '2px solid #000'}}>{empresa}</span>
      </div>
    </div>
  );
};

const Balao: React.FC<{txt: string; s: number; idade: number}> = ({txt, s, idade}) => {
  const grito = gritando(txt);
  const ap = Math.min(1, idade / 6);
  const tremor = grito ? Math.sin(idade * 1.7) * 3 : 0;
  return (
    <div style={{position: 'absolute', left: -s * 1.6, width: s * 4.2, bottom: s * 1.3, display: 'flex', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * ap}) translateX(${tremor}px)`, transformOrigin: '50% 100%', opacity: ap}}>
      <div style={{background: grito ? '#fff1a8' : '#fff', border: `${grito ? 5 : 3}px solid ${grito ? '#e01b1b' : '#000'}`, borderRadius: grito ? 8 : 18, padding: `${s * 0.06}px ${s * 0.1}px`, fontFamily: FONT.display, fontWeight: grito ? 900 : 700, fontSize: s * (grito ? 0.2 : 0.17), lineHeight: 1.15, color: '#111', textAlign: 'center', boxShadow: '0 4px 0 #0007', maxWidth: s * 4.2}}>{txt}</div>
    </div>
  );
};

// ---------------------------------------------------------------- HUD (pedidos, pontos, relógio)
const RECEITA_ING: Record<string, string[]> = {
  'Sopa de tomate': ['tomate', 'tomate', 'tomate'], 'Sopa de cebola': ['cebola', 'cebola', 'cebola'], 'Sopa de cogumelo': ['cogumelo', 'cogumelo', 'cogumelo'],
  Salada: ['alface', 'tomate'], 'Hambúrguer': ['pão', 'carne'], 'Hambúrguer com alface': ['pão', 'carne', 'alface'],
};
export const Pedidos: React.FC<{e: Estado; esc: number; frame: number}> = ({e, esc, frame}) => (
  <div style={{display: 'flex', gap: 10 * esc}}>
    {e.pedidos.map((p) => {
      const fr = Math.max(0, p.resta / p.tempo);
      const cor = fr > 0.5 ? '#4cd137' : fr > 0.25 ? '#fbc531' : '#e84118';
      const treme = fr < 0.25 ? Math.sin(frame / 1.5) * 3 * esc : 0;
      const ings = RECEITA_ING[p.receita] ?? [];
      return (
        <div key={p.id} style={{width: 150 * esc, background: '#fdf6e3', border: `${3 * esc}px solid #2a1a0c`, borderRadius: 10 * esc, overflow: 'hidden', transform: `translateX(${treme}px)`, boxShadow: '0 4px 0 #0006'}}>
          <div style={{height: 10 * esc, background: '#0002'}}><div style={{height: '100%', width: `${fr * 100}%`, background: cor}} /></div>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 17 * esc, textAlign: 'center', color: '#2a1a0c', padding: `${2 * esc}px 4px 0`}}>{p.receita}</div>
          <div style={{display: 'flex', justifyContent: 'center', gap: 2 * esc, paddingBottom: 4 * esc}}>{ings.map((n, i) => <Ingrediente key={i} nome={n} picado={n !== 'pão'} s={32 * esc} />)}</div>
        </div>
      );
    })}
  </div>
);

export const Cozinha: React.FC<{log: LogOC; cz: number; t: number; w: number; h: number; hud?: boolean; titulo?: boolean; falas?: boolean}> = ({log, cz, t, w, h, hud = true, titulo = true, falas = true}) => {
  const frame = useCurrentFrame();
  const mapa = log.mapa;
  const cols = Math.max(...mapa.map((l) => l.length));
  const rows = mapa.length;
  const s = Math.floor(Math.min((w * 0.94) / cols, (h * (hud ? 0.74 : 0.9)) / rows));
  const ox = (w - s * cols) / 2;
  const oy = hud ? h * 0.2 + (h * 0.74 - s * rows) / 2 : (h - s * rows) / 2;
  const i = Math.max(0, Math.min(Math.floor(t), log.tiques.length - 1));
  const f = Math.max(0, Math.min(1, t - Math.floor(t)));
  const tq = log.tiques[i].cozinhas[cz];
  const depois = f >= ANDAR || t >= log.tiques.length;
  const est = depois ? tq.estado : estadoEm(log, cz, i - 1) ?? {...tq.estado, chefs: tq.estado.chefs.map((c) => ({...c, obj: null}))};
  const info = log.cozinhas[cz];
  const esc = w / 1920;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'hidden', background: 'radial-gradient(circle at 50% 40%, #2b5f73, #11283a 80%)'}}>
      {/* piso */}
      {mapa.map((l, y) => [...l].map((ch, x) => (ch === '.' || /[1-4]/.test(ch)) && (
        <div key={`p${x},${y}`} style={{position: 'absolute', left: ox + x * s, top: oy + y * s, width: s, height: s, background: (x + y) % 2 ? '#efe6d2' : '#e2d6bc'}} />
      )))}
      {/* bancadas e estações */}
      {mapa.map((l, y) => [...l].map((ch, x) => (ch !== '.' && ch !== ' ' && !/[1-4]/.test(ch)) && (
        <div key={`b${x},${y}`} style={{position: 'absolute', left: ox + x * s, top: oy + y * s, width: s, height: s}}><Bancada ch={ch === 'X' ? '#' : ch === 'R' || ch === 'D' ? '#' : ch} s={s} /></div>
      )))}
      {/* o que está em cima das bancadas */}
      {est.tiles.map((tl) => {
        const ch = mapa[tl.y]?.[tl.x];
        const prog = tl.obj && (tl.obj.tipo === 'panela' || tl.obj.tipo === 'frigideira') && (tl.obj.estado === 'cozinhando') ? (tl.obj.prog ?? 0) / COZ[tl.obj.tipo] : 0;
        const alarme = tl.obj?.estado === 'queimando' || (tl.obj?.estado === 'pronta' && (tl.obj.prog ?? 0) >= COZ[tl.obj.tipo] + 2);
        return (
          <div key={`i${tl.x},${tl.y}`} style={{position: 'absolute', left: ox + tl.x * s, top: oy + tl.y * s, width: s, height: s}}>
            {ch === 'D' && Array.from({length: Math.min(5, tl.pratos ?? 0)}, (_, k) => <div key={k} style={{position: 'absolute', left: s * 0.12, top: s * (0.18 - k * 0.07)}}><Item o={{tipo: 'prato', conteudo: []}} s={s * 0.76} frame={frame} /></div>)}
            {(ch === 'R' || ch === 'S') && Array.from({length: Math.min(5, tl.sujos ?? 0)}, (_, k) => <div key={k} style={{position: 'absolute', left: s * 0.12, top: s * (0.18 - k * 0.07)}}><Item o={{tipo: 'prato', sujo: true, conteudo: []}} s={s * 0.76} frame={frame} /></div>)}
            {tl.obj && <div style={{position: 'absolute', left: s * 0.12, top: s * 0.02}}><Item o={tl.obj} s={s * 0.76} frame={frame} /></div>}
            {(tl.picando ?? 0) > 0 && <div style={{position: 'absolute', left: s * 0.1, right: s * 0.1, top: -s * 0.12, height: s * 0.1, background: '#000a', borderRadius: 4}}><div style={{width: `${((tl.picando ?? 0) / 2) * 100}%`, height: '100%', background: '#4cd137', borderRadius: 4}} /></div>}
            {prog > 0 && <div style={{position: 'absolute', left: s * 0.1, right: s * 0.1, top: -s * 0.12, height: s * 0.1, background: '#000a', borderRadius: 4}}><div style={{width: `${Math.min(1, prog) * 100}%`, height: '100%', background: '#4cd137', borderRadius: 4}} /></div>}
            {alarme && frame % 10 < 6 && <div style={{position: 'absolute', left: s * 0.25, top: -s * 0.55, width: s * 0.5, height: s * 0.5, borderRadius: '50%', background: '#e84118', border: '3px solid #fff', color: '#fff', fontFamily: FONT.display, fontWeight: 900, fontSize: s * 0.36, textAlign: 'center', lineHeight: `${s * 0.44}px`}}>!</div>}
            {tl.fogo && <div style={{position: 'absolute', left: s * 0.05, top: -s * 0.35}}><Fogo s={s * 0.9} frame={frame} seed={tl.x * 3 + tl.y} /></div>}
          </div>
        );
      })}
      {/* chefs (ordenados por y para sobreposição) */}
      {[...info.chefs].map((c) => {
        const q = tq.chefs[c.nome];
        const cam = q?.caminho?.length ? q.caminho : [est.chefs.find((x) => x.nome === c.nome)?.pos ?? c.inicio];
        const fa = Math.min(1, f / ANDAR);
        const pos = cam.length > 1 && !depois ? (() => { const u = fa * (cam.length - 1); const a = cam[Math.floor(u)], b = cam[Math.min(cam.length - 1, Math.floor(u) + 1)]; const r = u - Math.floor(u); return {x: a.x + (b.x - a.x) * r, y: a.y + (b.y - a.y) * r} })() : cam[cam.length - 1];
        const ultimo = cam.length > 1 ? cam[cam.length - 1].x - cam[cam.length - 2].x : 0;
        const anda = !depois && cam.length > 1;
        const obj = est.chefs.find((x) => x.nome === c.nome)?.obj ?? null;
        return {c, q, pos, virado: ultimo < 0, anda, obj};
      }).sort((a, b) => a.pos.y - b.pos.y).map(({c, q, pos, virado, anda, obj}) => (
        <div key={c.nome} style={{position: 'absolute', left: ox + pos.x * s, top: oy + pos.y * s, width: s, height: s, zIndex: 10 + Math.round(pos.y)}}>
          <Chef cor={COR_EMPRESA[c.empresa] ?? '#888'} nome={c.nome} empresa={c.empresa} s={s} virado={virado} anda={anda} frame={frame} obj={obj} acao={q?.acao ?? ''} />
          {falas && q?.fala && <Balao txt={q.fala} s={s} idade={f * 60} />}
          {q?.bloqueado && f < 0.9 && <div style={{position: 'absolute', left: s * 0.3, top: -s * 1.05, fontFamily: FONT.display, fontWeight: 900, fontSize: s * 0.3, color: '#ffd84d', WebkitTextStroke: '2px #000'}}>💢</div>}
        </div>
      ))}
      {hud && (
        <>
          <div style={{position: 'absolute', left: 24 * esc, top: 18 * esc}}><Pedidos e={est} esc={esc * 1.15} frame={frame} /></div>
          <div style={{position: 'absolute', left: 24 * esc, bottom: 20 * esc, display: 'flex', alignItems: 'center', gap: 10 * esc}}>
            <div style={{width: 64 * esc, height: 64 * esc, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #ffe680, #e0a800)', border: `${4 * esc}px solid #7a5200`}} />
            <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 64 * esc, color: '#fff', WebkitTextStroke: `${3 * esc}px #000`}}>{est.pontos}</span>
          </div>
          <div style={{position: 'absolute', right: 30 * esc, bottom: 20 * esc, fontFamily: FONT.display, fontWeight: 900, fontSize: 64 * esc, color: (log.duracao - t) * log.tickS < 30 ? '#ff5a3c' : '#fff', WebkitTextStroke: `${3 * esc}px #000`}}>
            {(() => { const r = Math.max(0, Math.ceil((log.duracao - t) * log.tickS)); return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}` })()}
          </div>
          {titulo && <div style={{position: 'absolute', right: 30 * esc, top: 20 * esc, fontFamily: FONT.display, fontWeight: 900, fontSize: 40 * esc, color: '#fff', padding: `${4 * esc}px ${16 * esc}px`, borderRadius: 12 * esc, background: COR_EMPRESA[info.nome] ?? '#000a', border: `${3 * esc}px solid #000`}}>{info.nome === 'Todas' ? 'TODAS AS IAs' : `Cozinha ${info.nome}`}</div>}
        </>
      )}
    </div>
  );
};
