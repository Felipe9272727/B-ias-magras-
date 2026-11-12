// AMONG IA 7 (Mira HQ de dia): uma partida do Among clássico desenhada a partir do log real (public/au7/partidaN.json,
// gerado por video/scripts/au7_dados.py). Cópia do motor de mapa do AU6 (zumbi/Jogo.tsx: relógio por âncoras, caminhada
// em velocidade constante pelos corredores, passinhos na sala, empurrão suave, câmera média) com o que o clássico pede:
// mapa de dia (TemaMira halloween=false), corpo no chão onde morreu, fantasma fora de cena, disfarce (a cor que os outros
// veem) com o nome verdadeiro por cima, função e time de cada um (o espectador sabe o segredo), grade de preso, duto e
// teleporte (some e reaparece, não anda) e os efeitos dos eventos do log (morte, tiro do Xerife, escudo, bomba, posse...).
import React from 'react';
import {ArteMira, CamadaViva} from '../zumbi/ArteMira';
import {aoLongo, caminho, centro, MUNDO, SALAS, spotN, type Pt, type SalaId} from '../zumbi/mapaMira';
import {TemaMira} from '../zumbi/salas/comum';
import {relogio, type Relogio} from '../zumbi/Jogo';
import {Crewmate4} from '../amongus/Crewmate4';

export {relogio, type Relogio};
type Estado = string;
export type EstadoJ = {cor: string; sala: SalaId; estado: Estado; tipo: string | null; atordoado: boolean; salvo: boolean; vivo: boolean; corpo: boolean; papel: string; time: string; ap?: string; preso?: boolean; salto?: 'duto' | 'tele'};
export type Tique = {tique: number; tarefas: number; total: number; sab: string | null; estados: EstadoJ[]};
export type Evento = {tique: number; tipo: string; [k: string]: unknown};
export type Reuniao = {tique: number; tipo: string; chamador: string; corpo?: string | null; sala: string; votos: Record<string, string>; expulso: string | null; empate: boolean; eraImpostor?: boolean | null; papelExpulso?: string | null; juiz?: {cor: string; teriaSido: string}; motivos?: {cor: string; alvo: string; texto: string}[]};
export type Log = {partida: number; jogadores: {cor: string; modelo: string; papel: string; time: string; casal: string | null}[]; tiques: Tique[]; eventos: Evento[]; reunioes: Reuniao[]; cfg: {limite: number}; resultado: {time: string; motivo: string; tique: number}};
export type Cam = {sala?: SalaId; cor?: string; mapa?: boolean; zoom?: number};

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
    const pts = a.sala !== b.sala && !b.salto ? caminho(a.sala, b.sala, pa, pb) : [pa, pb];
    const seg = pts.slice(1).map((q, j) => Math.hypot(q.x - pts[j].x, q.y - pts[j].y));
    return {a, b, pts, len: seg.reduce((x, y) => x + y, 0), seg};
  });
  m.set(nn, p);
  return p;
}

// velocidade de caminhada (px do mundo por quadro): tripulante ~780 px/s; zumbi mais lento, o Rápido mais rápido
const velDe = (_e: EstadoJ) => 11;

// janela de caminhada do jogador i no tique n (em quadros da cena)
function janela(log: Log, R: Relogio, n: number, i: number) {
  const pl = plano(log, n)[i];
  const fs = R.fDe(n - 1), fe = R.fDe(n);
  const D = Math.max(1, fe - fs);
  if (pl.len < 2) return {pl, fs, fe, D, ws: fs, wd: 0};
  const atraso = Math.min(0.3 * D, 10 + hash(pl.b.cor, 1) * 14); // eventos primeiro; saída escalonada por cor
  const ws = fs + atraso;
  const wd = pl.b.salto ? Math.max(1, Math.min(18, (fe - ws) * 0.94)) : Math.max(1, Math.min(pl.len / velDe(pl.b), (fe - ws) * 0.94));
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

type Pos = {cor: string; e: EstadoJ; morto: boolean; k: number; p: Pt; rastro?: Pt[]; andando: boolean; virado: boolean; estado: Estado; tipo: string | null; atordoado: boolean; salvo: boolean; sala: SalaId};

// posição (sem colisão) do jogador i no quadro f
function posBase(log: Log, R: Relogio, i: number, f: number): Pos {
  const T = R.T(f);
  const n = Math.max(1, Math.ceil(T));
  const J = janela(log, R, n, i);
  const {pl, fs, D, ws, wd} = J;
  const {a, b} = pl;
  let base: Pt = pl.pts[0], m = 0, kEsc = 1;
  if (pl.len >= 2 && b.salto) { // duto ou teleporte: encolhe onde está e reaparece no destino (nunca atravessa o mapa andando)
    m = clamp((f - ws) / wd);
    base = m < 0.5 ? pl.pts[0] : pl.pts[pl.pts.length - 1];
    kEsc = Math.abs(1 - 2 * m);
  } else if (pl.len >= 2) {
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
  // quem morre neste tique cai depois dos efeitos do começo do tique (e depois de chegar, se vinha andando)
  const cai = Math.max(muda, pl.len >= 2 ? ws + wd - fs : 0);
  const morto = !b.vivo && (!a.vivo || dentro >= cai);
  const eAgora = dentro < muda ? {...b, preso: a.preso, ap: a.ap} : b;
  const w = clamp(dist / 12);
  const o = passeio(b.cor, f, morto || eAgora.preso ? 0 : 24, false);
  return {cor: b.cor, e: eAgora, morto, k: kEsc, p: {x: base.x + o.x * w, y: base.y + o.y * w}, andando: false, virado: false, estado: 'humano', tipo: null, atordoado: false, salvo: false, sala: m < 0.5 ? a.sala : b.sala};
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
    const k = Math.min(1, W0) * (cam.sala ? 0.45 : 0.7);
    alvo = {x: alvo.x + (wx / W0 - alvo.x) * k, y: alvo.y + (wy / W0 - alvo.y) * k};
  }
  return {...alvo, s};
}

// ---------- efeitos dos eventos do log ----------
const FONTE = "'Poppins', 'Inter', Arial, sans-serif";
// tipo -> [quem leva o efeito, texto, cor]
const FX: Record<string, [string, string, string]> = {
  morte: ['vitima', 'MORTO!', '#ff2a2a'], escudo: ['vitima', 'ESCUDO!', '#5ad0ff'], prisao: ['preso', 'PRESO!', '#ffd23a'], possessao_vivo: ['cor', 'POSSUÍDO!', '#b06aff'],
  recrutamento: ['alvo', 'RECRUTADO!', '#ff3a3a'], transformacao: ['cor', 'DISFARCE!', '#ff9a2a'], camuflagem: ['cor', 'CAMUFLOU!', '#9aa6b8'], casal_morre: ['vitima', 'MORREU DE TRISTEZA', '#ff6ab0'],
  ladrao: ['cor', 'ROUBOU A FUNÇÃO!', '#c9a0ff'], bomba_plantada: ['vitima', 'BOMBA PLANTADA', '#ff8a2a'], duto: ['cor', 'DUTO!', '#6dff8a'], xerife: ['alvo', 'TIRO!', '#ffe14a'],
  bomba: ['portador', 'BUM!', '#ff6a1a'], teleporte: ['cor', 'TELEPORTE!', '#7ae8ff'],
};
const Fx: React.FC<{log: Log; R: Relogio; f: number; ps: Pos[]}> = ({log, R, f, ps}) => {
  const n = Math.max(1, Math.ceil(R.T(f)));
  const fs = R.fDe(n - 1), D = Math.max(1, R.fDe(n) - fs);
  const temMorte = log.eventos.some((e) => e.tique === n && (e.tipo === 'morte' || e.tipo === 'xerife' || e.tipo === 'bomba'));
  const L = clamp(0.7 * D, 10, temMorte ? 56 : 36); // ~1,2 s (morte ~1,9 s), logo no começo do tique
  const vida = (f - fs - Math.min(0.06 * D, 3)) / L;
  if (vida <= 0 || vida >= 1) return null;
  const a = 1 - vida * vida;
  const pos = (cor?: unknown) => ps.find((x) => x.cor === cor)?.p;
  return (
    <>
      {log.eventos.filter((e) => e.tique === n && FX[e.tipo]).map((e, i) => {
        const [quem, txt, cor] = FX[e.tipo];
        const p = pos(e[quem]);
        if (!p) return null;
        const grande = e.tipo === 'bomba' || e.tipo === 'teleporte';
        const q = e.tipo === 'xerife' ? pos(e.xerife) : e.tipo === 'morte' ? pos(e.assassino) : null;
        return (
          <React.Fragment key={i}>
            {q ? (
              <svg width={MUNDO.w} height={MUNDO.h} style={{position: 'absolute', left: 0, top: 0, opacity: a}}>
                <line x1={q.x} y1={q.y - 60} x2={p.x} y2={p.y - 60} stroke={cor} strokeWidth={e.tipo === 'xerife' ? 16 : 9} strokeDasharray={e.tipo === 'xerife' ? undefined : '18 14'} opacity={0.75} />
                {e.tipo === 'xerife' ? <line x1={q.x} y1={q.y - 60} x2={p.x} y2={p.y - 60} stroke="#fff" strokeWidth={5} /> : null}
              </svg>
            ) : null}
            <svg width={grande ? 900 : 360} height={grande ? 900 : 360} viewBox="-100 -100 200 200" style={{position: 'absolute', left: p.x - (grande ? 450 : 180), top: p.y - 60 - (grande ? 450 : 180), opacity: a, overflow: 'visible'}}>
              <circle r={20 + vida * 70} fill={cor} opacity={0.22} />
              <circle r={14 + vida * 78} fill="none" stroke={cor} strokeWidth={9 * (1 - vida) + 2} />
              {e.tipo === 'morte' ? (
                <g>
                  {/* facada: o arco corta a vítima na primeira terça parte do efeito */}
                  <path d="M-70 -50 Q0 -90 70 40" fill="none" stroke="#fff" strokeWidth={14 * Math.max(0, 1 - vida * 3)} strokeLinecap="round" strokeDasharray="260" strokeDashoffset={260 * (1 - Math.min(1, vida * 5))} />
                  <path d="M-34 -34 L34 34 M34 -34 L-34 34" stroke="#ff2a2a" strokeWidth={13} strokeLinecap="round" transform={`scale(${Math.min(1, vida * 4)})`} />
                  {Array.from({length: 14}).map((_, j) => { const an = (j / 14) * Math.PI * 2 + 0.3, r = 18 + Math.min(1, vida * 2.2) * (40 + (j % 4) * 14), y0 = vida * vida * 40; return <circle key={j} cx={r * Math.cos(an)} cy={r * Math.sin(an) + y0} r={(7 - (j % 3) * 2) * (1 - vida * 0.6)} fill="#c80000" stroke="#000" strokeWidth={1.5} />; })}
                </g>
              ) : null}
              {e.tipo === 'bomba' ? Array.from({length: 12}).map((_, j) => { const an = (j / 12) * Math.PI * 2, r = 20 + vida * 75; return <circle key={j} cx={r * Math.cos(an)} cy={r * Math.sin(an)} r={13 * (1 - vida) + 3} fill={j % 2 ? '#ffd23a' : '#ff5a1a'} />; }) : null}
              {e.tipo === 'escudo' ? <path d="M0 -40 L32 -26 V6 Q32 34 0 46 Q-32 34 -32 6 V-26 Z" fill="#5ad0ff55" stroke="#fff" strokeWidth={5} /> : null}
              {e.tipo === 'casal_morre' ? <path d="M0 30 C-50 -6 -26 -44 0 -18 C26 -44 50 -6 0 30 Z M-4 -16 L8 -2 L-6 8 L4 24" fill="#ff6ab0" stroke="#000" strokeWidth={4} strokeLinejoin="round" /> : null}
            </svg>
            <div style={{position: 'absolute', left: p.x - 300, width: 600, top: p.y - 250 - vida * 30, textAlign: 'center', fontFamily: FONTE, fontWeight: 900, fontSize: grande ? 76 : 46, color: cor, WebkitTextStroke: '9px #000', paintOrder: 'stroke fill', opacity: a, transform: `scale(${0.7 + Math.min(1, vida * 4) * 0.4})`}}>{txt}</div>
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------- o tripulante na cena ----------
export const PAPEL7: Record<string, string> = {Medico: 'Médico', Palhaco: 'Palhaço', Seguranca: 'Segurança', Glutao: 'Glutão', Mecanico: 'Mecânico', Vibora: 'Víbora', Ladrao: 'Ladrão', Influencer: 'Fotógrafo'};
export const papelNome = (p: string) => PAPEL7[p] ?? p;
export const corTime = (t: string) => (t === 'impostor' ? '#e01818' : t === 'tripulante' ? '#1f6fd1' : '#8a3fd1');
const Boneco: React.FC<{p: Pos; f: number; destaque: boolean; papeis: boolean}> = ({p, f, destaque, papeis}) => {
  const s = 108, e = p.e;
  const imp = e.time === 'impostor';
  if (p.morto) {
    return e.corpo ? (
      <div style={{position: 'absolute', left: -s / 2, top: -s * 0.9, width: s, height: s * 1.2}}>
        <svg width={s * 1.6} height={s * 0.7} viewBox="-80 -35 160 70" style={{position: 'absolute', left: -s * 0.3, top: s * 0.62}}>
          <path d="M-62 0 C-60 -22 -20 -30 6 -24 C40 -30 70 -14 64 4 C60 22 20 28 -6 22 C-36 30 -64 20 -62 0 Z" fill="#a80000" opacity={0.85} />
          <ellipse cx={-30} cy={-6} rx={14} ry={5} fill="#ff5a5a" opacity={0.5} />
        </svg>
        <Crewmate4 cor={p.cor} size={s} morto t={f} />
        <div style={{position: 'absolute', left: '50%', top: s * 1.02, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: FONTE, fontWeight: 900, fontSize: 19, color: '#ffb0b0', WebkitTextStroke: '4px #000', paintOrder: 'stroke fill'}}>corpo: {p.cor}</div>
      </div>
    ) : null;
  }
  return (
    <div style={{position: 'absolute', left: -s / 2, top: -s * 1.1, width: s, height: s * 1.2, transform: `scale(${p.k})`, transformOrigin: '50% 95%', filter: destaque ? 'drop-shadow(0 0 7px #fff) drop-shadow(0 0 3px #fff)' : undefined}}>
      <Crewmate4 cor={e.ap ?? p.cor} size={s} passo={p.andando ? f / 12 : 0} virado={p.virado} t={f} />
      {e.preso ? (
        <svg width={s} height={s * 1.2} viewBox="0 0 100 120" style={{position: 'absolute', left: 0, top: 0}}>
          {[14, 32, 50, 68, 86].map((x) => <rect key={x} x={x - 3.5} y={6} width={7} height={110} rx={3} fill="#3a3f4a" stroke="#000" strokeWidth={2} />)}
          <rect x={4} y={4} width={92} height={9} rx={3} fill="#3a3f4a" stroke="#000" strokeWidth={2} /><rect x={4} y={109} width={92} height={9} rx={3} fill="#3a3f4a" stroke="#000" strokeWidth={2} />
        </svg>
      ) : null}
      <div style={{position: 'absolute', left: '50%', bottom: s * 1.2 + 2, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', whiteSpace: 'nowrap'}}>
        {papeis || destaque ? <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 15, color: '#fff', background: corTime(e.time), border: '3px solid #000', borderRadius: 8, padding: '0 7px', marginBottom: -2}}>{papelNome(e.papel)}</div> : null}
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: s * 0.2, color: imp ? '#ff6a5a' : '#fff', WebkitTextStroke: `${s * 0.035}px #000`, paintOrder: 'stroke fill'}}>{p.cor}{e.ap ? <span style={{fontSize: 14, color: '#ffd23a'}}> (disfarce de {e.ap})</span> : null}</div>
      </div>
    </div>
  );
};

// R: relógio da cena; f: quadro da cena; falas(g): quem fala/pensa no quadro g (com peso 0..1, para a câmera seguir)
// foco: uma cor ou várias separadas por vírgula (ganham brilho e a etiqueta da função mesmo com o mapa aberto)
export const Jogo7: React.FC<{log: Log; R: Relogio; cam: Cam; f: number; foco?: string; falas?: (g: number) => AlvoFala[]; zoomDe?: (g: number) => number; papeis?: boolean}> = ({log, R, cam, f, foco, falas, zoomDe, papeis}) => {
  W = 1920; H = 1080;
  // câmera: alvos amostrados numa GRADE FIXA (a cada S quadros, ±1,5 s, peso gaussiano) e interpolados quadro a quadro.
  // Média de amostras que andam junto com o quadro dava degraus (a câmera mudava a cada 6 quadros = ~5 por segundo)
  // quando o alvo pulava (troca de quem fala, duto, teleporte); na grade fixa o resultado é contínuo e liso.
  const S = 6, K = 8, SIG = 4.2;
  const base = Math.floor(f / S) * S, fr = (f - base) / S;
  const amostra = new Map<number, {x: number; y: number; s: number}>();
  const alvoEm = (g: number) => {
    const gg = Math.max(0, g); // nunca antes do começo da cena (lá a posição não existe e puxava a câmera pro meio do mapa)
    let v = amostra.get(gg);
    if (!v) { const camG = zoomDe ? {...cam, zoom: zoomDe(gg)} : cam; v = alvoCam(log, R, gg, camG, falas ? falas(gg) : []); amostra.set(gg, v); }
    return v;
  };
  const media = (b: number) => {
    let x = 0, y = 0, s = 0, W0 = 0;
    for (let k = -K; k <= K; k++) { const w = Math.exp(-(k * k) / (2 * SIG * SIG)); const a = alvoEm(b + k * S); x += w * a.x; y += w * a.y; s += w * a.s; W0 += w; }
    return {x: x / W0, y: y / W0, s: s / W0};
  };
  // Catmull-Rom entre os pontos da grade: posição E velocidade contínuas (sem mudança de ritmo a cada 6 quadros)
  const mA = media(base - S), m0 = media(base), m1 = media(base + S), mB = media(base + 2 * S);
  const cr = (a: number, b: number, c2: number, d: number) => 0.5 * (2 * b + (-a + c2) * fr + (2 * a - 5 * b + 4 * c2 - d) * fr * fr + (-a + 3 * b - 3 * c2 + d) * fr * fr * fr);
  const c = {x: cr(mA.x, m0.x, m1.x, mB.x), y: cr(mA.y, m0.y, m1.y, mB.y), s: cr(mA.s, m0.s, m1.s, mB.s)};
  const ps = posicoes(log, R, f, true);
  const vis = [...ps].sort((a, b) => (a.morto ? -1e6 : a.p.y) - (b.morto ? -1e6 : b.p.y));
  const tq = log.tiques[Math.max(0, Math.min(log.tiques.length - 1, Math.ceil(R.T(f)) - 1))];
  const focos = (foco ?? '').split(',');
  const verPapeis = papeis ?? !(cam.mapa || (!cam.sala && !cam.cor));
  const nT = Math.max(1, Math.ceil(R.T(f))), fsT = R.fDe(nT - 1);
  const morteAgora = log.eventos.some((e) => e.tique === nT && (e.tipo === 'morte' || e.tipo === 'bomba' || e.tipo === 'xerife'));
  const dM = f - fsT - 2;
  const flash = morteAgora && dM >= 0 && dM < 14 ? 1 - dM / 14 : 0;
  const tremor = flash > 0 ? {x: Math.sin(f * 2.7) * 9 * flash, y: Math.cos(f * 3.1) * 7 * flash} : {x: 0, y: 0};
  const alarme = tq.sab && tq.sab !== 'Luzes';
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#7fbdf2'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: MUNDO.w, height: MUNDO.h, transformOrigin: '0 0', transform: `translate(${W / 2 - c.x * c.s + tremor.x}px, ${H / 2 - c.y * c.s + tremor.y}px) scale(${c.s})`}}>
        <TemaMira.Provider value={{halloween: false}}>
          <ArteMira />
          <CamadaViva f={f} />
        </TemaMira.Provider>
        {vis.map((p) => (
          <div key={p.cor} style={{position: 'absolute', left: p.p.x, top: p.p.y}}>
            <Boneco p={p} f={f + p.cor.length * 7} destaque={focos.includes(p.cor)} papeis={verPapeis} />
          </div>
        ))}
        <Fx log={log} R={R} f={f} ps={ps} />
      </div>
      {/* sabotagem das luzes: a nave escurece; reator/sismógrafo: borda vermelha pulsando */}
      {tq.sab === 'Luzes' ? <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, #02041066 20%, #020410d8 100%)', pointerEvents: 'none'}} /> : null}
      {alarme ? <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${90 + 50 * Math.sin(f / 4)}px #ff1a1acc`, pointerEvents: 'none'}} /> : null}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 62%, #0a183066 100%)', pointerEvents: 'none'}} />
      {flash > 0 ? <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, #ff000000 35%, #c00000${Math.round(flash * 170).toString(16).padStart(2, '0')} 100%)`, pointerEvents: 'none'}} /> : null}
    </div>
  );
};
