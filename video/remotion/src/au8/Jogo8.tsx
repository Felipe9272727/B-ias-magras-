// AMONG IA 8 (The Skeld): uma partida do Among clássico desenhada a partir do log real (public/au8/partidaN.json, gerado
// por video/scripts/au8_dados.py). Cópia do motor de mapa do AU7 (Jogo7: relógio por âncoras, caminhada em velocidade
// constante, passinhos, empurrão suave, câmera em grade fixa com Catmull-Rom), trocando a Mira HQ pelo THE SKELD
// (src/amongus/nave: ArteSkeld + mapa.ts). Ponte das coordenadas: o "ponto" do log (pontos3.json do motor) já está no
// mesmo mundo da arte (grade de 48 px de mapa.ts); só passa por foraDoCanto() (cantos cortados das salas desenhadas).
// O que o AU8 tem de novo: Fantasma invisível (o espectador vê translúcido), escudo do Anjo (bolha), corpo que derrete
// (poça da Víbora), portas trancadas, O2 e sismógrafo (alarme), interrogatório do Detetive e o modo "segredo" (abertura:
// só a cor aparente, sem nome verdadeiro nem função, para não entregar quem era o "Roxo").
import React from 'react';
import {ArteSkeld, pontoV5} from '../amongus/nave/ArteSkeld';
import {NAVE, caminho, centroSala, salaEm} from '../amongus/nave/mapa';
import {TILE, type Sala} from '../amongus/nave/spec';
import {relogio, type Relogio} from '../zumbi/Jogo';
import {Crewmate4} from '../amongus/Crewmate4';

export {relogio, type Relogio};
type Pt = {x: number; y: number};
export type EstadoJ = {cor: string; sala: Sala; p: [number, number]; vivo: boolean; corpo: boolean; poca?: boolean; papel: string; time: string; ap?: string; inv?: boolean; esc?: boolean; ejetado?: boolean; salto?: 'duto'};
export type Tique = {tique: number; tarefas: number; total: number; sab: string | null; portas: string[]; estados: EstadoJ[]};
export type Evento = {tique: number; tipo: string; [k: string]: unknown};
export type Reuniao = {tique: number; tipo: string; chamador: string; corpo?: string | null; sala: string; votos: Record<string, string>; expulso: string | null; empate: boolean; eraImpostor?: boolean | null; papelExpulso?: string | null; motivos?: {cor: string; alvo: string; texto: string}[]};
export type Log = {partida: number; jogadores: {cor: string; modelo: string; papel: string; time: string}[]; tiques: Tique[]; eventos: Evento[]; reunioes: Reuniao[]; cfg: {limite: number; revelarExpulso: boolean; nImpostores: number}; resultado: {time: string; motivo: string; tique: number}};
export type Cam = {sala?: Sala; cor?: string; mapa?: boolean; zoom?: number};

export const MUNDO = {w: NAVE.cols * TILE, h: NAVE.rows * TILE};
export const nomeSala = (s: string) => NAVE.salas[s as Sala]?.nome ?? s;
let W = 1920, H = 1080;
const estadosEm = (log: Log, n: number) => log.tiques[Math.max(0, Math.min(log.tiques.length - 1, n - 1))].estados;
const hash = (s: string, k = 0) => {
  let h = 2166136261 ^ k;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  h = Math.imul(h ^ (h >>> 13), 0x5bd1e995);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
};
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

function aoLongo(pts: Pt[], k: number): Pt {
  if (pts.length < 2) return pts[0];
  const seg = pts.slice(1).map((q, j) => Math.hypot(q.x - pts[j].x, q.y - pts[j].y));
  const tot = seg.reduce((a, b) => a + b, 0);
  let alvo = clamp(k) * tot;
  for (let j = 0; j < seg.length; j++) {
    if (alvo <= seg[j] || j === seg.length - 1) { const u = seg[j] ? clamp(alvo / seg[j]) : 1; return {x: pts[j].x + (pts[j + 1].x - pts[j].x) * u, y: pts[j].y + (pts[j + 1].y - pts[j].y) * u}; }
    alvo -= seg[j];
  }
  return pts[pts.length - 1];
}

// lugar de cada um no tique n: o ponto REAL do log (motor), fora dos cantos cortados da sala desenhada
const lugarEm = (log: Log, n: number, i: number): Pt => { const e = estadosEm(log, n)[i]; return pontoV5(e.sala, {x: e.p[0], y: e.p[1]}); };

// plano de cada tique: de onde para onde cada um anda (caminho pelos corredores do Skeld), com memória
type Plano = {a: EstadoJ; b: EstadoJ; pts: Pt[]; len: number};
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
    const pa = lugarEm(log, nn <= 1 ? 1 : nn - 1, i), pb = lugarEm(log, nn, i);
    const longe = Math.hypot(pb.x - pa.x, pb.y - pa.y) > 2;
    const pts = !longe ? [pa, pb] : b.salto || !a.vivo ? [pa, pb] : a.sala !== b.sala ? caminho(pa, pb) : [pa, pb];
    const len = pts.slice(1).reduce((s, q, j) => s + Math.hypot(q.x - pts[j].x, q.y - pts[j].y), 0);
    return {a, b, pts, len};
  });
  m.set(nn, p);
  return p;
}

const VEL = 15; // px do mundo por quadro (~450 px/s: um corredor do Skeld em 2-4 s)

function janela(log: Log, R: Relogio, n: number, i: number) {
  const pl = plano(log, n)[i];
  const fs = R.fDe(n - 1), fe = R.fDe(n);
  const D = Math.max(1, fe - fs);
  if (pl.len < 2) return {pl, fs, fe, D, ws: fs, wd: 0};
  const atraso = Math.min(0.3 * D, 10 + hash(pl.b.cor, 1) * 14);
  const ws = fs + atraso;
  const wd = pl.b.salto ? Math.max(1, Math.min(18, (fe - ws) * 0.94)) : Math.max(1, Math.min(pl.len / VEL, (fe - ws) * 0.94));
  return {pl, fs, fe, D, ws, wd};
}

function passeio(cor: string, f: number, raio: number): Pt {
  if (raio <= 0) return {x: 0, y: 0};
  const per = 84, fase = hash(cor, 2) * per;
  const g = f + fase, k = Math.floor(g / per), u = (g - k * per) / per;
  const alvo = (j: number) => { const a = hash(cor, 10 + j) * Math.PI * 2, r = raio * Math.sqrt(hash(cor, 50 + j)); return {x: r * Math.cos(a), y: 0.55 * r * Math.sin(a)}; };
  const p0 = alvo(k - 1), p1 = alvo(k);
  const m = clamp(u / 0.42), e = m * m * (3 - 2 * m);
  return {x: p0.x + (p1.x - p0.x) * e, y: p0.y + (p1.y - p0.y) * e};
}

type Pos = {cor: string; e: EstadoJ; morto: boolean; k: number; p: Pt; rastro?: Pt[]; andando: boolean; virado: boolean};

function posBase(log: Log, R: Relogio, i: number, f: number): Pos {
  const T = R.T(f);
  const n = Math.max(1, Math.ceil(T));
  const J = janela(log, R, n, i);
  const {pl, fs, D, ws, wd} = J;
  const {a, b} = pl;
  let base: Pt = pl.pts[0], m = 0, kEsc = 1;
  if (pl.len >= 2 && b.salto) { // duto: encolhe onde está e reaparece no destino (nunca atravessa o mapa andando)
    m = clamp((f - ws) / wd);
    base = m < 0.5 ? pl.pts[0] : pl.pts[pl.pts.length - 1];
    kEsc = Math.abs(1 - 2 * m);
  } else if (pl.len >= 2) {
    m = clamp((f - ws) / wd);
    const e = 0.7 * m + 0.3 * m * m * (3 - 2 * m);
    base = aoLongo(pl.pts, e);
    if (a.sala !== b.sala && m > 0 && m < 1) { // faixa lateral por cor nos corredores
      const q = aoLongo(pl.pts, Math.min(1, e + 0.01)), dx = q.x - base.x, dy = q.y - base.y, d = Math.hypot(dx, dy) || 1;
      const lado = (hash(b.cor, 3) - 0.5) * 50 * Math.min(1, m * 5, (1 - m) * 5);
      base = {x: base.x - (dy / d) * lado, y: base.y + (dx / d) * lado};
    }
  } else base = pl.pts[pl.pts.length - 1];
  let dist = Infinity;
  for (const nn of [n - 1, n, n + 1]) {
    if (nn < 1 || nn > log.tiques.length) continue;
    const j = nn === n ? J : janela(log, R, nn, i);
    if (j.wd <= 0) continue;
    dist = Math.min(dist, f < j.ws ? j.ws - f : f > j.ws + j.wd ? f - j.ws - j.wd : 0);
  }
  const dentro = f - fs;
  const muda = Math.min(0.3 * D, 12);
  const cai = Math.max(muda, pl.len >= 2 ? ws + wd - fs : 0);
  const morto = !b.vivo && (!a.vivo || dentro >= cai);
  const eAgora: EstadoJ = dentro < muda ? {...b, ap: a.ap, inv: a.inv, esc: a.esc, poca: a.poca} : b;
  const w = clamp(dist / 12);
  const o = passeio(b.cor, f, morto ? 0 : 26);
  return {cor: b.cor, e: eAgora, morto, k: kEsc, p: {x: base.x + o.x * w, y: base.y + o.y * w}, andando: false, virado: false};
}

function separa(ps: Pos[], R0 = 120) {
  for (let it = 0; it < 4; it++) {
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      if (ps[i].morto !== ps[j].morto) continue;
      const A = ps[i].p, B = ps[j].p;
      let dx = B.x - A.x, dy = (B.y - A.y) * 1.6;
      let d = Math.hypot(dx, dy);
      if (d >= R0) continue;
      if (d < 0.5) d = 0.5;
      const k = ((R0 - d) / R0) * 18;
      // empurra quase só para os lados (um em cima do outro empilha os nomes); no mesmo ponto, o lado sai do hash do par
      const sx = Math.abs(dx) < 3 ? (hash(ps[i].cor + ps[j].cor) < 0.5 ? -3 : 3) : dx, sy = dy * 0.25, n = Math.hypot(sx, sy) || 1;
      const ux = sx / n, uy = sy / n / 1.6;
      ps[i].p = {x: A.x - ux * k, y: A.y - uy * k};
      ps[j].p = {x: B.x + ux * k, y: B.y + uy * k};
    }
  }
  return ps;
}

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
      if (v > 55) p.rastro = [x(f - 2), x(f - 4), x(f - 6)];
      let vx = b.x - a.x, achou = Math.abs(vx) > 4;
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
function alvoCam(log: Log, R: Relogio, f: number, cam: Cam, falas: AlvoFala[], focos: string[] = []): {x: number; y: number; s: number} {
  const fit = Math.min(W / MUNDO.w, H / MUNDO.h);
  if (cam.mapa || (!cam.sala && !cam.cor)) {
    // mapa aberto: centro no grupo em foco (quem a cena acompanha), sem passar da borda da nave
    // (enquadra o grupo com folga: nunca mais aberto que o mapa inteiro no zoom pedido, nunca mais perto que uma sala)
    const s0 = fit * (cam.zoom ?? 1);
    const ps = focos.length ? posicoes(log, R, f).filter((x) => focos.includes(x.cor)) : [];
    if (!ps.length) return {x: MUNDO.w / 2, y: MUNDO.h / 2, s: s0};
    const xs = ps.map((q) => q.p.x), ys = ps.map((q) => q.p.y);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2 - 40;
    const s = clamp(Math.min(W / (Math.max(...xs) - Math.min(...xs) + 1500), H / (Math.max(...ys) - Math.min(...ys) + 1000)), s0, 0.62);
    const lim = (c: number, vis: number, tot: number, folga: number) => (vis >= tot + 2 * folga ? tot / 2 : clamp(c, vis / 2 - folga, tot - vis / 2 + folga));
    return {x: lim(cx, W / s, MUNDO.w, 120), y: lim(cy, H / s, MUNDO.h, 160), s};
  }
  const s = 0.62 * (cam.zoom ?? 1.6);
  const ps = cam.cor || falas.length ? posicoes(log, R, f) : [];
  let alvo: Pt = cam.sala ? centroSala(cam.sala) : ps.find((x) => x.cor === cam.cor)?.p ?? {x: MUNDO.w / 2, y: MUNDO.h / 2};
  if (!cam.sala) alvo = {x: alvo.x, y: alvo.y - 60};
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

// portas de cada sala (células 'D' da grade encostadas no piso da sala): ficam fechadas enquanto o log diz "portas"
const PORTAS: Record<string, Pt[]> = (() => {
  const r: Record<string, Pt[]> = {};
  const g = NAVE.grid;
  for (let y = 0; y < NAVE.rows; y++) for (let x = 0; x < NAVE.cols; x++) {
    if (g[y][x] !== 'D') continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (g[y + dy]?.[x + dx] !== '.') continue;
      const s = salaEm({x: (x + dx + 0.5) * TILE, y: (y + dy + 0.5) * TILE});
      if (s) (r[s] ??= []).push({x: x * TILE, y: y * TILE});
    }
  }
  return r;
})();

// ---------- efeitos dos eventos do log ----------
const FONTE = "'Poppins', 'Inter', Arial, sans-serif";
// tipo (ou poder) -> [quem leva o efeito, texto, cor]
const FX: Record<string, [string, string, string]> = {
  morte: ['vitima', 'MORTO!', '#ff2a2a'], escudo: ['vitima', 'ESCUDO!', '#5ad0ff'], transformacao: ['cor', 'DISFARCE!', '#ff9a2a'], duto: ['cor', 'DUTO!', '#6dff8a'],
  invisivel: ['cor', 'SUMIU!', '#c9d6ff'], reaparece: ['cor', 'APARECEU!', '#c9d6ff'], derreteu: ['cor', 'DERRETEU!', '#7dff5a'], portas: ['sala', 'PORTAS TRANCADAS', '#ffd23a'],
  interrogar: ['alvo', 'INTERROGADO', '#22c4d4'], escudo_anjo: ['alvo', 'ESCUDO DO ANJO', '#ffffff'], rastrear: ['alvo', 'RASTREADO', '#7bd400'],
};
const chaveFx = (e: Evento) => (e.tipo === 'poder' ? String(e.poder) : e.tipo);
const Fx: React.FC<{log: Log; R: Relogio; f: number; ps: Pos[]; segredo?: boolean}> = ({log, R, f, ps, segredo}) => {
  const n = Math.max(1, Math.ceil(R.T(f)));
  const fs = R.fDe(n - 1), D = Math.max(1, R.fDe(n) - fs);
  const temMorte = log.eventos.some((e) => e.tique === n && e.tipo === 'morte');
  const L = clamp(0.7 * D, 10, temMorte ? 56 : 40);
  const vida = (f - fs - Math.min(0.06 * D, 3)) / L;
  if (vida <= 0 || vida >= 1) return null;
  const a = 1 - vida * vida;
  const pos = (e: Evento, quem: string): Pt | undefined => (quem === 'sala' ? centroSala(e.sala as Sala) : ps.find((x) => x.cor === e[quem])?.p);
  const evs = log.eventos.filter((e) => e.tique === n && FX[chaveFx(e)] && !(segredo && e.tipo === 'transformacao'));
  return (
    <>
      {evs.map((e, i) => {
        const [quem, txt, cor] = FX[chaveFx(e)];
        const p = pos(e, quem);
        if (!p) return null;
        const q = e.tipo === 'morte' || e.tipo === 'escudo' ? ps.find((x) => x.cor === e.assassino)?.p : null;
        const sala = quem === 'sala';
        return (
          <React.Fragment key={i}>
            {q ? (
              <svg width={MUNDO.w} height={MUNDO.h} style={{position: 'absolute', left: 0, top: 0, opacity: a}}>
                <line x1={q.x} y1={q.y - 60} x2={p.x} y2={p.y - 60} stroke={cor} strokeWidth={9} strokeDasharray="18 14" opacity={0.75} />
              </svg>
            ) : null}
            <svg width={360} height={360} viewBox="-100 -100 200 200" style={{position: 'absolute', left: p.x - 180, top: p.y - 60 - 180, opacity: sala ? 0 : a, overflow: 'visible'}}>
              <circle r={20 + vida * 70} fill={cor} opacity={0.22} />
              <circle r={14 + vida * 78} fill="none" stroke={cor} strokeWidth={9 * (1 - vida) + 2} />
              {e.tipo === 'morte' ? (
                <g>
                  <path d="M-70 -50 Q0 -90 70 40" fill="none" stroke="#fff" strokeWidth={14 * Math.max(0, 1 - vida * 3)} strokeLinecap="round" strokeDasharray="260" strokeDashoffset={260 * (1 - Math.min(1, vida * 5))} />
                  <path d="M-34 -34 L34 34 M34 -34 L-34 34" stroke="#ff2a2a" strokeWidth={13} strokeLinecap="round" transform={`scale(${Math.min(1, vida * 4)})`} />
                  {Array.from({length: 14}).map((_, j) => { const an = (j / 14) * Math.PI * 2 + 0.3, r = 18 + Math.min(1, vida * 2.2) * (40 + (j % 4) * 14), y0 = vida * vida * 40; return <circle key={j} cx={r * Math.cos(an)} cy={r * Math.sin(an) + y0} r={(7 - (j % 3) * 2) * (1 - vida * 0.6)} fill="#c80000" stroke="#000" strokeWidth={1.5} />; })}
                </g>
              ) : null}
              {e.tipo === 'escudo' || chaveFx(e) === 'escudo_anjo' ? <path d="M0 -40 L32 -26 V6 Q32 34 0 46 Q-32 34 -32 6 V-26 Z" fill="#5ad0ff55" stroke="#fff" strokeWidth={5} /> : null}
              {chaveFx(e) === 'interrogar' ? <g fill="none" stroke="#22c4d4" strokeWidth={9}><circle cx={-8} cy={-8} r={26} /><path d="M12 12 L40 40" strokeLinecap="round" /></g> : null}
            </svg>
            <div style={{position: 'absolute', left: p.x - 400, width: 800, top: (sala ? p.y - 60 : p.y - 250) - vida * 30, textAlign: 'center', fontFamily: FONTE, fontWeight: 900, fontSize: sala ? 64 : 46, color: cor, WebkitTextStroke: '9px #000', paintOrder: 'stroke fill', opacity: a, transform: `scale(${0.7 + Math.min(1, vida * 4) * 0.4})`}}>{txt}</div>
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------- o tripulante na cena ----------
// nomes das funções como no Among Us em português (o motor chama o Fantasma de "Espectro" e o Rastreador de "Localizador")
export const PAPEL8: Record<string, string> = {Palhaco: 'Palhaço', Vibora: 'Víbora', Espectro: 'Fantasma', Localizador: 'Rastreador', Anjo: 'Anjo da Guarda'};
export const papelNome = (p: string) => PAPEL8[p] ?? p;
export const corTime = (t: string) => (t === 'impostor' ? '#e01818' : t === 'tripulante' ? '#1f6fd1' : '#8a3fd1');
const Boneco: React.FC<{p: Pos; f: number; destaque: boolean; papeis: boolean; ui: number; mascara?: string}> = ({p, f, destaque, papeis, ui, mascara}) => {
  const s = 108, e = p.e;
  const imp = e.time === 'impostor' && !mascara;
  const aparente = mascara ?? e.ap ?? p.cor;
  const nomeFs = Math.max(s * 0.27, 26 * ui);
  if (p.morto) {
    if (e.poca) {
      return (
        <svg width={220} height={110} viewBox="-110 -55 220 110" style={{position: 'absolute', left: -110, top: -40}}>
          <path d="M-90 4 C-86 -26 -40 -34 -6 -26 C30 -38 92 -20 86 6 C82 30 30 34 -4 28 C-44 36 -94 28 -90 4 Z" fill="#5bbf3a" stroke="#1f4a12" strokeWidth={6} opacity={0.9} />
          <ellipse cx={-34} cy={-8} rx={20} ry={6} fill="#b8ff8a" opacity={0.6} />
          <text x={0} y={70} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={24 * Math.min(2, ui)} fill="#b8ff8a" stroke="#000" strokeWidth={5} paintOrder="stroke">poça: {p.cor}</text>
        </svg>
      );
    }
    return e.corpo ? (
      <div style={{position: 'absolute', left: -s / 2, top: -s * 0.9, width: s, height: s * 1.2}}>
        <svg width={s * 1.6} height={s * 0.7} viewBox="-80 -35 160 70" style={{position: 'absolute', left: -s * 0.3, top: s * 0.62}}>
          <path d="M-62 0 C-60 -22 -20 -30 6 -24 C40 -30 70 -14 64 4 C60 22 20 28 -6 22 C-36 30 -64 20 -62 0 Z" fill="#a80000" opacity={0.85} />
        </svg>
        <Crewmate4 cor={p.cor} size={s} morto t={f} />
        <div style={{position: 'absolute', left: '50%', top: s * 1.02, transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: FONTE, fontWeight: 900, fontSize: Math.max(19, 17 * ui), color: '#ffb0b0', WebkitTextStroke: '4px #000', paintOrder: 'stroke fill'}}>corpo: {p.cor}</div>
      </div>
    ) : null;
  }
  const inv = !!e.inv;
  return (
    <div style={{position: 'absolute', left: -s / 2, top: -s * 1.1, width: s, height: s * 1.2, transform: `scale(${p.k})`, transformOrigin: '50% 95%', filter: destaque ? 'drop-shadow(0 0 7px #fff) drop-shadow(0 0 3px #fff)' : undefined}}>
      {e.esc ? (
        <svg width={s * 1.7} height={s * 1.7} viewBox="-50 -50 100 100" style={{position: 'absolute', left: -s * 0.35, top: -s * 0.3}}>
          <circle r={44 + Math.sin(f / 7) * 2} fill="#7fd8ff2e" stroke="#bfeeff" strokeWidth={3.5} strokeDasharray="10 6" />
        </svg>
      ) : null}
      <div style={{opacity: inv ? 0.38 + 0.08 * Math.sin(f / 5) : 1, filter: inv ? 'saturate(0.4) brightness(1.3)' : undefined}}>
        <Crewmate4 cor={aparente} size={s} passo={p.andando ? f / 12 : 0} virado={p.virado} t={f} />
      </div>
      <div style={{position: 'absolute', left: '50%', bottom: s * 1.2 + 2, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', whiteSpace: 'nowrap'}}>
        {(papeis || destaque) && !mascara ? <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 19 * Math.min(ui, 1.8), color: '#fff', background: corTime(e.time), border: '3px solid #000', borderRadius: 8, padding: '0 7px', marginBottom: -2}}>{papelNome(e.papel)}{inv ? ' · INVISÍVEL' : ''}</div> : null}
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: nomeFs, color: imp ? '#ff6a5a' : '#fff', WebkitTextStroke: `${Math.max(s * 0.035, 3.5 * ui)}px #000`, paintOrder: 'stroke fill'}}>
          {mascara ?? p.cor}
          {!mascara && e.ap ? <span style={{fontSize: nomeFs * 0.66, color: '#ffd23a'}}> (disfarce de {e.ap})</span> : null}
        </div>
      </div>
    </div>
  );
};

// R: relógio da cena; f: quadro da cena; falas(g): quem fala/pensa no quadro g (peso 0..1, para a câmera seguir)
// foco: cores separadas por vírgula (brilho e etiqueta da função mesmo com o mapa aberto)
// mascara: modo segredo (cor -> cor aparente que fica a cena inteira, sem nome verdadeiro nem função)
export const Jogo8: React.FC<{log: Log; R: Relogio; cam: Cam; f: number; foco?: string; falas?: (g: number) => AlvoFala[]; zoomDe?: (g: number) => number; papeis?: boolean; mascara?: Record<string, string>; segredo?: boolean; w?: number; h?: number}> = ({log, R, cam, f, foco, falas, zoomDe, papeis, mascara, segredo, w = 1920, h = 1080}) => {
  W = w; H = h;
  const focos = (foco ?? '').split(',').filter(Boolean);
  const S = 6, K = 8, SIG = 4.2;
  const base = Math.floor(f / S) * S, fr = (f - base) / S;
  const amostra = new Map<number, {x: number; y: number; s: number}>();
  const alvoEm = (g: number) => {
    const gg = Math.max(0, g);
    let v = amostra.get(gg);
    if (!v) { const camG = zoomDe ? {...cam, zoom: zoomDe(gg)} : cam; v = alvoCam(log, R, gg, camG, falas ? falas(gg) : [], focos); amostra.set(gg, v); }
    return v;
  };
  const media = (b: number) => {
    let x = 0, y = 0, s = 0, W0 = 0;
    for (let k = -K; k <= K; k++) { const wk = Math.exp(-(k * k) / (2 * SIG * SIG)); const a = alvoEm(b + k * S); x += wk * a.x; y += wk * a.y; s += wk * a.s; W0 += wk; }
    return {x: x / W0, y: y / W0, s: s / W0};
  };
  const mA = media(base - S), m0 = media(base), m1 = media(base + S), mB = media(base + 2 * S);
  const cr = (a: number, b: number, c2: number, d: number) => 0.5 * (2 * b + (-a + c2) * fr + (2 * a - 5 * b + 4 * c2 - d) * fr * fr + (-a + 3 * b - 3 * c2 + d) * fr * fr * fr);
  const c = {x: cr(mA.x, m0.x, m1.x, mB.x), y: cr(mA.y, m0.y, m1.y, mB.y), s: cr(mA.s, m0.s, m1.s, mB.s)};
  const ui = Math.max(1, 0.62 / c.s); // mapa aberto: boneco e nome maiores para continuar legível
  const ps0 = posicoes(log, R, f, true);
  const ps = ui > 1.05 ? separa(ps0.map((q) => ({...q})), 120 * Math.min(1.7, 1 + (ui - 1) * 0.6)) : ps0;
  const vis = [...ps].sort((a, b) => (a.morto ? -1e6 + a.p.y : a.p.y) - (b.morto ? -1e6 + b.p.y : b.p.y));
  const tq = log.tiques[Math.max(0, Math.min(log.tiques.length - 1, Math.ceil(R.T(f)) - 1))];
  const verPapeis = papeis ?? !(cam.mapa || (!cam.sala && !cam.cor));
  const nT = Math.max(1, Math.ceil(R.T(f))), fsT = R.fDe(nT - 1);
  const morteAgora = log.eventos.some((e) => e.tique === nT && e.tipo === 'morte');
  const dM = f - fsT - 2;
  const flash = morteAgora && dM >= 0 && dM < 14 ? 1 - dM / 14 : 0;
  const tremor = flash > 0 ? {x: Math.sin(f * 2.7) * 9 * flash, y: Math.cos(f * 3.1) * 7 * flash} : {x: 0, y: 0};
  const alarme = !!tq.sab && tq.sab !== 'Luzes';
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#050913'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: MUNDO.w, height: MUNDO.h, transformOrigin: '0 0', transform: `translate(${W / 2 - c.x * c.s + tremor.x}px, ${H / 2 - c.y * c.s + tremor.y}px) scale(${c.s})`}}>
        <ArteSkeld alertaReator={alarme ? 0.08 + 0.07 * Math.sin(f / 4) : 0} />
        {/* portas trancadas (sabotagem de portas): placas amarelo-e-preto nas portas da sala */}
        {tq.portas.flatMap((s) => (PORTAS[s] ?? []).map((q, i) => (
          <svg key={`${s}${i}`} width={TILE} height={TILE} viewBox="0 0 48 48" style={{position: 'absolute', left: q.x, top: q.y}}>
            <rect x={1} y={1} width={46} height={46} fill="#2a2f3a" stroke="#000" strokeWidth={3} />
            <path d="M0 12 L12 0 M0 30 L30 0 M0 48 L48 0 M18 48 L48 18 M36 48 L48 36" stroke="#ffd23a" strokeWidth={7} />
          </svg>
        )))}
        {vis.map((p) => (
          <div key={p.cor} style={{position: 'absolute', left: p.p.x, top: p.p.y}}>
            <div style={{position: 'absolute', left: 0, top: 0, transform: `scale(${ui > 1 && !p.morto ? Math.min(1.7, 1 + (ui - 1) * 0.6) : 1})`, transformOrigin: '0 0'}}>
              <Boneco p={p} f={f + p.cor.length * 7} destaque={focos.includes(p.cor)} papeis={verPapeis} ui={ui} mascara={mascara?.[p.cor] ?? (segredo ? p.e.ap ?? p.cor : undefined)} />
            </div>
          </div>
        ))}
        <Fx log={log} R={R} f={f} ps={ps} segredo={segredo} />
      </div>
      {tq.sab === 'Luzes' ? <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, #02041055 20%, #020410cc 100%)', pointerEvents: 'none'}} /> : null}
      {alarme ? <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${90 + 50 * Math.sin(f / 4)}px #ff1a1acc`, pointerEvents: 'none'}} /> : null}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 62%, #0a183066 100%)', pointerEvents: 'none'}} />
      {flash > 0 ? <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, #ff000000 35%, #c00000${Math.round(flash * 170).toString(16).padStart(2, '0')} 100%)`, pointerEvents: 'none'}} /> : null}
    </div>
  );
};
