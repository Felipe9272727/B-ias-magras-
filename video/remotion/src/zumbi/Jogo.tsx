// Uma partida do modo zumbi desenhada a partir do log real (amongus/logs_zumbi/partidaN.json).
// Relógio: cada cena diz em que tique o jogo está em cada quadro (t0 + vel, com âncoras ["ir", tique] do roteiro para que
// cada evento aconteça na tela enquanto o narrador fala dele). O intervalo entre o fim do tique n-1 e o fim do tique n
// mostra o tique n: mordidas, tasers, curas e transformações no começo (como no motor) e depois cada um anda pelos
// corredores reais até a sala nova, em VELOCIDADE CONSTANTE (px por segundo de vídeo; só acelera se o tique for curto
// demais para a caminhada caber). Parado na sala, cada um dá passinhos curtos e para (nada de tela parada), sem teleporte:
// o passeio some suavemente perto de uma caminhada. Colisão: empurrão suave entre quem está perto demais e faixa lateral
// por cor nos corredores. Lado para onde olha = sentido real do movimento (guarda o último quando para).
import React from 'react';
import {ArteMira, CamadaViva} from './ArteMira';
import {aoLongo, caminho, centro, MUNDO, SALAS, spotN, type Pt, type SalaId} from './mapaMira';
import {Personagem, type Estado} from './Personagem';

export type EstadoJ = {cor: string; sala: SalaId; estado: Estado; tipo: string | null; atordoado: boolean; salvo: boolean; viraEm: number | null};
export type Tique = {tique: number; radio: number; resgateEm: number | null; barricadas: Record<string, {vida: number; ate: number}>; estados: EstadoJ[]};
export type Evento = {tique: number; tipo: string; [k: string]: unknown};
export type Log = {jogadores: {cor: string; modelo: string; papel: string; pacienteZero: boolean}[]; tiques: Tique[]; eventos: Evento[]; cfg: {amanhecer: number; radioMeta: number}; resultado: unknown};
export type Cam = {sala?: SalaId; cor?: string; mapa?: boolean; zoom?: number};

// ---------- relógio da cena: quadro -> tique (e o inverso) ----------
export type Relogio = {T: (f: number) => number; fDe: (T: number) => number};
export function relogio(t0: number, vel: number, ancoras: [number, number][] = [], max = Infinity): Relogio {
  const v = Math.max(vel, 1e-4);
  const P: [number, number][] = [[0, t0]];
  for (const [f, t] of [...ancoras].sort((a, b) => a[0] - b[0])) if (f > P[P.length - 1][0] && t >= P[P.length - 1][1]) P.push([f, t]);
  const T = (f: number) => {
    let r: number;
    if (f <= 0) r = t0 + f * v;
    else {
      let i = 0;
      while (i < P.length - 1 && P[i + 1][0] <= f) i++;
      if (i === P.length - 1) r = P[i][1] + (f - P[i][0]) * v;
      else r = P[i][1] + ((f - P[i][0]) / (P[i + 1][0] - P[i][0])) * (P[i + 1][1] - P[i][1]);
    }
    return Math.min(r, max);
  };
  const fDe = (t: number) => {
    if (t <= t0) return (t - t0) / v;
    for (let i = 0; i < P.length - 1; i++) {
      if (t <= P[i + 1][1] && P[i + 1][1] > P[i][1]) return P[i][0] + ((t - P[i][1]) / (P[i + 1][1] - P[i][1])) * (P[i + 1][0] - P[i][0]);
    }
    const u = P[P.length - 1];
    return u[0] + (t - u[1]) / v;
  };
  return {T, fDe};
}

let W = 1920, H = 1080; // o Short (vertical) troca para 1080x1920 via props
const FPS = 30;
const estadosEm = (log: Log, n: number) => log.tiques[Math.max(0, Math.min(log.tiques.length - 1, n - 1))].estados;
const hash = (s: string, k = 0) => {
  let h = 2166136261 ^ k;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  h = Math.imul(h ^ (h >>> 13), 0x5bd1e995);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
};
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// lugar de cada um em cada tique: uma célula da grade da sala; quem continua na sala MANTÉM a célula (a sala não se
// rearruma toda vez que alguém entra ou sai) e quem chega pega uma célula livre (preferência fixa por cor)
const CELULAS = new WeakMap<Log, Map<string, Pt>[]>();
function todasCelulas(log: Log): Map<string, Pt>[] {
  let r = CELULAS.get(log);
  if (r) return r;
  r = [];
  let prev = new Map<string, [string, number]>();
  for (const tq of log.tiques) {
    const agora = new Map<string, [string, number]>();
    const pos = new Map<string, Pt>();
    const por: Record<string, string[]> = {};
    for (const e of tq.estados) (por[e.sala] ??= []).push(e.cor);
    for (const [sala, cores] of Object.entries(por)) {
      const S = SALAS[sala as SalaId];
      const tot = Math.max(1, Math.floor((S.w - 60) / 95)) * Math.max(1, Math.floor((S.h - 140) / 95));
      const usados = new Set<number>();
      for (const c of cores) { const v = prev.get(c); if (v && v[0] === sala && !usados.has(v[1])) { agora.set(c, v); usados.add(v[1]); } }
      for (const c of cores) {
        if (agora.has(c)) continue;
        const pref = Math.floor(hash(c + sala, 7) * tot);
        let j = 0, k = pref;
        for (; ; j++) { k = j < tot ? (pref + j) % tot : j; if (!usados.has(k)) break; }
        agora.set(c, [sala, k]); usados.add(k);
      }
      for (const c of cores) pos.set(c, spotN(sala as SalaId, agora.get(c)![1], 9999));
    }
    r.push(pos);
    prev = agora;
  }
  CELULAS.set(log, r);
  return r;
}
const lugarEm = (log: Log, n: number, cor: string) => todasCelulas(log)[Math.max(0, Math.min(log.tiques.length - 1, n - 1))].get(cor)!;

// plano de cada tique: de onde para onde cada um anda (caminho e comprimento), com memória
type Plano = {a: EstadoJ; b: EstadoJ; pts: Pt[]; len: number; seg: number[]};
const PLANOS = new WeakMap<Log, Map<number, Plano[]>>();
function plano(log: Log, n: number): Plano[] {
  let m = PLANOS.get(log);
  if (!m) PLANOS.set(log, (m = new Map()));
  const nn = Math.max(1, Math.min(log.tiques.length, n));
  let p = m.get(nn);
  if (p) return p;
  const A = nn <= 1 ? estadosEm(log, 1) : estadosEm(log, nn - 1), B = estadosEm(log, nn);
  p = B.map((b, i) => {
    const a = A[i];
    const pa = lugarEm(log, nn <= 1 ? 1 : nn - 1, b.cor), pb = lugarEm(log, nn, b.cor);
    const pts = a.sala !== b.sala ? caminho(a.sala, b.sala, pa, pb) : [pa, pb];
    const seg = pts.slice(1).map((q, j) => Math.hypot(q.x - pts[j].x, q.y - pts[j].y));
    return {a, b, pts, len: seg.reduce((x, y) => x + y, 0), seg};
  });
  m.set(nn, p);
  return p;
}

// velocidade de caminhada (px do mundo por quadro): tripulante ~780 px/s; zumbi mais lento, o Rápido mais rápido
const velDe = (e: EstadoJ) => (e.estado !== 'zumbi' ? 26 : e.tipo === 'Rapido' || e.tipo === 'Rápido' ? 30 : e.tipo === 'Grande' ? 15 : 19);

// janela de caminhada do jogador i no tique n (em quadros da cena)
function janela(log: Log, R: Relogio, n: number, i: number) {
  const pl = plano(log, n)[i];
  const fs = R.fDe(n - 1), fe = R.fDe(n);
  const D = Math.max(1, fe - fs);
  if (pl.len < 2) return {pl, fs, fe, D, ws: fs, wd: 0};
  const atraso = Math.min(0.3 * D, 10 + hash(pl.b.cor, 1) * 14); // eventos primeiro; saída escalonada por cor
  const ws = fs + atraso;
  const wd = Math.max(1, Math.min(pl.len / velDe(pl.a.estado === 'zumbi' ? pl.a : pl.b), (fe - ws) * 0.94));
  return {pl, fs, fe, D, ws, wd};
}

// passinhos dentro da célula: anda até um ponto perto, para, anda de novo (determinístico pelo quadro)
function passeio(cor: string, f: number, raio: number, zumbi: boolean): Pt {
  if (raio <= 0) return {x: 0, y: 0};
  const per = zumbi ? 64 : 84, fase = hash(cor, 2) * per;
  const g = f + fase, k = Math.floor(g / per), u = (g - k * per) / per;
  const alvo = (j: number) => { const a = hash(cor, 10 + j) * Math.PI * 2, r = raio * Math.sqrt(hash(cor, 50 + j)); return {x: r * Math.cos(a), y: 0.55 * r * Math.sin(a)}; };
  const p0 = alvo(k - 1), p1 = alvo(k);
  const m = clamp(u / 0.42), e = m * m * (3 - 2 * m);
  return {x: p0.x + (p1.x - p0.x) * e, y: p0.y + (p1.y - p0.y) * e};
}

type Pos = {cor: string; p: Pt; rastro?: Pt[]; andando: boolean; virado: boolean; estado: Estado; tipo: string | null; atordoado: boolean; salvo: boolean; sala: SalaId};

// posição (sem colisão) do jogador i no quadro f
function posBase(log: Log, R: Relogio, i: number, f: number): Pos {
  const T = R.T(f);
  const n = Math.max(1, Math.ceil(T));
  const J = janela(log, R, n, i);
  const {pl, fs, D, ws, wd} = J;
  const {a, b} = pl;
  let base: Pt = pl.pts[0], m = 0;
  if (pl.len >= 2) {
    m = clamp((f - ws) / wd);
    const e = 0.7 * m + 0.3 * m * m * (3 - 2 * m);
    base = aoLongo(pl.pts, e);
    if (a.sala !== b.sala && m > 0 && m < 1) { // faixa lateral por cor nos corredores (não andam um em cima do outro)
      const q = aoLongo(pl.pts, Math.min(1, e + 0.01)), dx = q.x - base.x, dy = q.y - base.y, d = Math.hypot(dx, dy) || 1;
      const lado = (hash(b.cor, 3) - 0.5) * 70 * Math.min(1, m * 5, (1 - m) * 5);
      base = {x: base.x - (dy / d) * lado, y: base.y + (dx / d) * lado};
    }
  } else base = pl.pts[pl.pts.length - 1];
  // passeio pela célula, sumindo perto de qualquer caminhada (deste tique, do anterior e do próximo)
  let dist = Infinity;
  for (const nn of [n - 1, n, n + 1]) {
    if (nn < 1 || nn > log.tiques.length) continue;
    const j = nn === n ? J : janela(log, R, nn, i);
    if (j.wd <= 0) continue;
    dist = Math.min(dist, f < j.ws ? j.ws - f : f > j.ws + j.wd ? f - j.ws - j.wd : 0);
  }
  const dentro = f - fs;
  const muda = Math.min(0.3 * D, 12); // estado novo (virou zumbi, atordoado) logo no começo do tique
  const estado: Estado = dentro < muda && a.estado !== 'zumbi' ? (a.estado as Estado) : (b.estado as Estado);
  const atordoado = b.atordoado && dentro >= muda;
  const zumbi = estado === 'zumbi';
  const w = clamp(dist / 12);
  const o = passeio(b.cor, f, atordoado ? 0 : zumbi ? 34 : 24, zumbi);
  return {cor: b.cor, p: {x: base.x + o.x * w, y: base.y + o.y * w}, andando: false, virado: false, estado, tipo: zumbi ? b.tipo : null, atordoado, salvo: b.salvo && f > fs + 0.9 * D, sala: m < 0.5 ? a.sala : b.sala};
}

// empurrão suave entre quem está perto demais (contínuo: sem tranco quando entra/sai do raio)
function separa(ps: Pos[]) {
  const R0 = 62;
  for (let it = 0; it < 3; it++) {
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const A = ps[i].p, B = ps[j].p;
      let dx = B.x - A.x, dy = (B.y - A.y) * 1.6;
      let d = Math.hypot(dx, dy);
      if (d >= R0) continue;
      if (d < 0.5) { const an = hash(ps[i].cor + ps[j].cor) * Math.PI * 2; dx = Math.cos(an); dy = Math.sin(an); d = 1; }
      const k = ((R0 - d) / R0) * 14;
      const ux = dx / d, uy = dy / d / 1.6;
      ps[i].p = {x: A.x - ux * k, y: A.y - uy * k};
      ps[j].p = {x: B.x + ux * k, y: B.y + uy * k};
    }
  }
  return ps;
}

// todos no quadro f; com lado=true calcula andando/virado pelo movimento real (custa mais; só para desenhar)
export function posicoes(log: Log, R: Relogio, f: number, lado = false): Pos[] {
  const n = estadosEm(log, Math.max(1, Math.ceil(R.T(f)))).length;
  const ps: Pos[] = [];
  for (let i = 0; i < n; i++) {
    const p = posBase(log, R, i, f);
    if (lado) {
      const x = (g: number) => posBase(log, R, i, g).p;
      const a = x(f - 2), b = x(f + 2);
      const v = Math.hypot(b.x - a.x, b.y - a.y) / 4;
      p.andando = v > 0.9;
      if (v > 45) p.rastro = [x(f - 2), x(f - 4), x(f - 6)]; // tique curto (avanço rápido): rastro de velocidade, não teleporte
      let vx = b.x - a.x, achou = Math.abs(vx) > 4;
      // parado: olha para onde andou por último (janelas presas a uma grade de 4 quadros: não pisca de um lado para o outro)
      const g0 = Math.floor(f / 4) * 4;
      for (let k = 0; !achou && k < 30; k++) {
        const q = x(g0 - 4 * k - 6), q2 = x(g0 - 4 * k);
        vx = q2.x - q.x;
        achou = Math.abs(vx) > 4;
      }
      p.virado = achou ? vx < 0 : hash(p.cor, 4) < 0.5;
    }
    ps.push(p);
  }
  return separa(ps);
}

export type AlvoFala = {cor: string; peso: number};
function alvoCam(log: Log, R: Relogio, f: number, cam: Cam, falas: AlvoFala[]): {x: number; y: number; s: number} {
  const fit = Math.min(W / MUNDO.w, H / MUNDO.h);
  if (cam.mapa || (!cam.sala && !cam.cor)) return {x: MUNDO.w / 2, y: MUNDO.h / 2, s: fit * (cam.zoom ?? 1)};
  const s = 0.62 * (cam.zoom ?? 1.6);
  const ps = cam.cor || falas.length ? posicoes(log, R, f) : [];
  let alvo: Pt = cam.sala ? centro(cam.sala) : ps.find((x) => x.cor === cam.cor)?.p ?? {x: MUNDO.w / 2, y: MUNDO.h / 2};
  if (!cam.sala) alvo = {x: alvo.x, y: alvo.y - 60};
  // quem está falando ou pensando puxa a câmera (numa sala, só metade do caminho, para a sala continuar na tela)
  let wx = 0, wy = 0, W0 = 0;
  for (const a of falas) {
    const p = ps.find((x) => x.cor === a.cor)?.p;
    if (!p || a.peso <= 0) continue;
    wx += a.peso * p.x; wy += a.peso * (p.y - 60); W0 += a.peso;
  }
  if (W0 > 0) {
    const k = Math.min(1, W0) * (cam.sala ? 0.55 : 1);
    alvo = {x: alvo.x + (wx / W0 - alvo.x) * k, y: alvo.y + (wy / W0 - alvo.y) * k};
  }
  return {...alvo, s};
}

// ---------- efeitos dos eventos ----------
const Fx: React.FC<{log: Log; R: Relogio; f: number; ps: Pos[]}> = ({log, R, f, ps}) => {
  const T = R.T(f);
  const n = Math.max(1, Math.ceil(T));
  const fs = R.fDe(n - 1), D = Math.max(1, R.fDe(n) - fs);
  const evs = log.eventos.filter((e) => e.tique === n);
  const pos = (cor?: unknown) => ps.find((x) => x.cor === cor)?.p;
  // efeito dura ~0,9 s de vídeo (ou menos, se o tique for curto), logo no começo do tique
  const L = clamp(0.6 * D, 8, 27);
  const vida = (f - fs - Math.min(0.06 * D, 3)) / L;
  if (vida <= 0 || vida >= 1) return null;
  const a = 1 - vida;
  return (
    <>
      {evs.map((e, i) => {
        const p = pos(e.alvo ?? e.cor ?? e.zumbi);
        if (!p && e.tipo !== 'barricada_quebrou') return null;
        switch (e.tipo) {
          case 'mordida':
          case 'mordida_imune':
            return (
              <div key={i} style={{position: 'absolute', left: p!.x - 90, top: p!.y - 190, width: 180, height: 180, transform: `scale(${0.6 + vida})`, opacity: a}}>
                <svg viewBox="-50 -50 100 100" width={180} height={180}>
                  <circle r={44} fill={e.tipo === 'mordida' ? '#ff2a2a55' : '#ffffff33'} />
                  {[-22, -8, 6, 20].map((x) => <path key={x} d={`M${x - 5} -14 L${x} -2 L${x + 5} -14 Z M${x - 5} 14 L${x} 2 L${x + 5} 14 Z`} fill="#fff" stroke="#000" strokeWidth={2.5} />)}
                </svg>
                <div style={{position: 'absolute', top: -20, width: '100%', textAlign: 'center', font: '900 34px Inter, Arial', color: e.tipo === 'mordida' ? '#ff4a3a' : '#fff', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>{e.tipo === 'mordida' ? (e.como === 'cuspe' ? 'CUSPE!' : 'NHAC!') : 'IMUNE?!'}</div>
              </div>
            );
          case 'virou_zumbi':
            return (
              <svg key={i} width={420} height={420} viewBox="-100 -100 200 200" style={{position: 'absolute', left: p!.x - 210, top: p!.y - 270, opacity: a}}>
                {Array.from({length: 14}).map((_, j) => { const an = (j / 14) * Math.PI * 2; const r = 30 + vida * 70; return <circle key={j} cx={r * Math.cos(an)} cy={r * Math.sin(an)} r={14 * a + 4} fill="#7dff4a" opacity={0.7} />; })}
                <circle r={40 * vida + 10} fill="none" stroke="#b6ff5a" strokeWidth={10 * a} />
              </svg>
            );
          case 'atordoou': {
            const q = pos(e.por);
            if (!q) return null;
            const d = `M${q.x} ${q.y - 70} L${(q.x + p!.x) / 2 + 20} ${(q.y + p!.y) / 2 - 90} L${(q.x + p!.x) / 2 - 10} ${(q.y + p!.y) / 2 - 60} L${p!.x} ${p!.y - 70}`;
            return (
              <svg key={i} width={MUNDO.w} height={MUNDO.h} style={{position: 'absolute', left: 0, top: 0, opacity: f % 4 < 2 ? a : a * 0.5}}>
                <path d={d} stroke={e.como === 'uv' ? '#c48aff' : '#7ae8ff'} strokeWidth={22} fill="none" opacity={0.4} />
                <path d={d} stroke="#fff" strokeWidth={7} fill="none" />
              </svg>
            );
          }
          case 'cura':
            return (
              <svg key={i} width={200} height={200} viewBox="-50 -50 100 100" style={{position: 'absolute', left: p!.x - 100, top: p!.y - 230 - vida * 40, opacity: a}}>
                <path d="M-10 -30 H10 V-10 H30 V10 H10 V30 H-10 V10 H-30 V-10 H-10 Z" fill="#4aff8a" stroke="#000" strokeWidth={4} />
              </svg>
            );
          case 'uivo':
            return (
              <svg key={i} width={900} height={900} viewBox="-450 -450 900 900" style={{position: 'absolute', left: p!.x - 450, top: p!.y - 510, opacity: a}}>
                {[0, 1, 2].map((j) => <circle key={j} r={((vida * 300 + j * 100) % 400) + 20} fill="none" stroke="#c9b8ff" strokeWidth={12} opacity={0.6} />)}
              </svg>
            );
          case 'barricada_quebrou': {
            const s = SALAS[e.sala as SalaId];
            return s ? <div key={i} style={{position: 'absolute', left: s.porta.x - 80, top: s.porta.y - 120, font: '900 40px Inter, Arial', color: '#ffb04a', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', opacity: a, transform: `scale(${0.8 + vida * 0.6})`}}>CRASH!</div> : null;
          }
          default:
            return null;
        }
      })}
    </>
  );
};

// tábuas pregadas na porta de cada sala com barricada (racham conforme perdem vida)
const Barricadas: React.FC<{t: Tique}> = ({t}) => (
  <>
    {Object.entries(t.barricadas ?? {}).map(([sala, b]) => {
      const s = SALAS[sala as SalaId];
      if (!s) return null;
      return (
        <svg key={sala} width={220} height={220} viewBox="-110 -110 220 220" style={{position: 'absolute', left: s.porta.x - 110, top: s.porta.y - 110}}>
          {[-50, 0, 50].map((y, j) => (
            <g key={j} transform={`rotate(${j % 2 ? -14 : 12})`}>
              <rect x={-95} y={y - 16} width={190} height={32} rx={6} fill="#a8743a" stroke="#000" strokeWidth={6} />
              {b.vida < 2 && j === 1 ? <path d={`M-10 ${y - 16} L4 ${y} L-6 ${y + 16}`} stroke="#000" strokeWidth={5} fill="none" /> : null}
              <circle cx={-78} cy={y} r={5} fill="#555" /><circle cx={78} cy={y} r={5} fill="#555" />
            </g>
          ))}
        </svg>
      );
    })}
  </>
);

// R: relógio da cena; f: quadro da cena; falas(g): quem fala/pensa no quadro g (com peso 0..1, para a câmera seguir)
export const Jogo: React.FC<{log: Log; R: Relogio; cam: Cam; f: number; foco?: string; falas?: (g: number) => AlvoFala[]; zoomDe?: (g: number) => number; w?: number; h?: number}> = ({log, R, cam, f, foco, falas, zoomDe, w = 1920, h = 1080}) => {
  W = w; H = h;
  // câmera: média dos alvos em quadros vizinhos (±0,4 s), para não dar trancos
  let x = 0, y = 0, s = 0;
  const N = 9;
  for (let i = 0; i < N; i++) {
    const g = f + (i - (N - 1) / 2) * 3;
    const camG = zoomDe ? {...cam, zoom: zoomDe(g)} : cam;
    const a = alvoCam(log, R, g, camG, falas ? falas(g) : []);
    x += a.x; y += a.y; s += a.s;
  }
  const c = {x: x / N, y: y / N, s: s / N};
  const ps = posicoes(log, R, f, true);
  const vis = ps.filter((p) => !p.salvo).sort((a, b) => a.p.y - b.p.y);
  const tq = log.tiques[Math.max(0, Math.min(log.tiques.length - 1, Math.ceil(R.T(f)) - 1))];
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#0b0820'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: MUNDO.w, height: MUNDO.h, transformOrigin: '0 0', transform: `translate(${W / 2 - c.x * c.s}px, ${H / 2 - c.y * c.s}px) scale(${c.s})`}}>
        <ArteMira />
        <CamadaViva f={f} />
        <Barricadas t={tq} />
        {vis.flatMap((p) => (p.rastro ?? []).map((q, j) => (
          <div key={`${p.cor}r${j}`} style={{position: 'absolute', left: q.x, top: q.y, opacity: 0.32 - j * 0.09}}>
            <Personagem cor={p.cor} estado={p.estado} f={f} s={p.tipo === 'Grande' ? 150 : 108} andando virado={p.virado} etiqueta={false} />
          </div>
        )))}
        {vis.map((p) => (
          <div key={p.cor} style={{position: 'absolute', left: p.p.x, top: p.p.y}}>
            <Personagem cor={p.cor} estado={p.estado} f={f + p.cor.length * 7} s={p.tipo === 'Grande' ? 150 : 108} andando={p.andando} virado={p.virado} atordoado={p.atordoado} destaque={foco === p.cor} />
          </div>
        ))}
        <Fx log={log} R={R} f={f} ps={ps} />
      </div>
      {/* vinheta noturna */}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 55%, #05020dcc 100%)', pointerEvents: 'none'}} />
    </div>
  );
};
