// Caminhos no Polus (Among Us 5): A* na grade de mapaPolus.ts (células andáveis: piso '.', neve ',' e portas 'D'),
// com custo maior colado na parede (o jogador anda pelo meio do corredor) e o caminho "esticado" depois
// (linha reta enquanto não encosta em parede), para ninguém andar em escadinha. Coordenadas de mundo em px (48 por célula).
import {POLUS, type SalaPolus} from './mapaPolus';
import {obstaculosPolus} from './obstaculosPolus';

export type Pt = {x: number; y: number};
const T = 48;
const C = POLUS.cols, R = POLUS.rows;
const ch = (c: number, r: number) => (c < 0 || r < 0 || c >= C || r >= R ? ' ' : POLUS.grid[r].charAt(c));
// os móveis desenhados (mesas, canos, canhão...) bloqueiam as células que o centro cai dentro (com uma folga);
// porta nunca é bloqueada
const FOLGA = 14;
const MOVEL = new Uint8Array(C * R);
for (const o of obstaculosPolus()) {
  for (let r = Math.floor((o.y - FOLGA) / T); r <= Math.floor((o.y + o.h + FOLGA) / T); r++) for (let c = Math.floor((o.x - FOLGA) / T); c <= Math.floor((o.x + o.w + FOLGA) / T); c++) {
    const x = (c + 0.5) * T, y = (r + 0.5) * T;
    if (c >= 0 && r >= 0 && c < C && r < R && x > o.x - FOLGA && x < o.x + o.w + FOLGA && y > o.y - FOLGA && y < o.y + o.h + FOLGA && ch(c, r) !== 'D') MOVEL[r * C + c] = 1;
  }
}
// a chapa ondulada (face externa da parede de baixo, ArtePolus > Sala) é desenhada na neve logo abaixo de cada '#':
// essa fileira também é parede
for (let r = 1; r < R; r++) for (let c = 0; c < C; c++) if (ch(c, r) === ',' && ch(c, r - 1) === '#') MOVEL[r * C + c] = 1;
const andavel = (c: number, r: number) => {
  const k = ch(c, r);
  return (k === '.' || k === ',' || k === 'D') && !MOVEL[r * C + c];
};
// custo extra perto de parede
const CUSTO = new Float32Array(C * R);
for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
  let n = 0;
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (!andavel(c + dc, r + dr)) n++;
  CUSTO[r * C + c] = 1 + (n ? 2.5 : 0);
}

const celula = (p: Pt) => ({c: Math.floor(p.x / T), r: Math.floor(p.y / T)});
export const livre = (p: Pt) => { const {c, r} = celula(p); return andavel(c, r) };
// o corpo do tripulante (uns 50 px de largura, mais o batente das portas; pés no ponto): nenhum pedaço dele pode ficar em cima de parede
const CORPO = [[0, 0], [-30, 0], [30, 0], [0, -14], [0, 10], [-30, -14], [30, -14], [-30, 10], [30, 10]];
export const cabe = (p: Pt) => CORPO.every(([ox, oy]) => livre({x: p.x + ox, y: p.y + oy}));

// ponto andável mais perto (quem cai fora do mapa volta para o chão)
export function soltar(p: Pt): Pt {
  if (cabe(p)) return p;
  // primeiro empurra o corpo pra longe da parede (até 30 px), mantendo o ponto onde o motor mandou
  for (let d = 4; d <= 30; d += 4) for (const [ox, oy] of [[d, 0], [-d, 0], [0, d], [0, -d], [d, d], [-d, d], [d, -d], [-d, -d]]) { const q = {x: p.x + ox, y: p.y + oy}; if (cabe(q)) return q }
  if (livre(p)) return p;
  const {c, r} = celula(p);
  for (let d = 1; d < 12; d++) for (let dr = -d; dr <= d; dr++) for (let dc = -d; dc <= d; dc++) {
    if (Math.max(Math.abs(dr), Math.abs(dc)) !== d) continue;
    const q = {x: (c + dc + 0.5) * T, y: (r + dr + 0.5) * T};
    if (andavel(c + dc, r + dr) && (cabe(q) || d > 6)) return q;
  }
  return p;
}

// sala em que o ponto está (null = lá fora, na neve)
export function salaEm(p: Pt): SalaPolus | null {
  for (const s of Object.keys(POLUS.salas) as SalaPolus[]) {
    const {c, r, w, h} = POLUS.salas[s].rect;
    if (p.x >= c * T && p.x < (c + w) * T && p.y >= r * T && p.y < (r + h) * T) return s;
  }
  return null;
}

// linha reta entre dois pontos sem encostar em célula bloqueada (amostra a cada 12 px, com folga lateral)
function reta(a: Pt, b: Pt): boolean {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  const n = Math.max(1, Math.ceil(d / 12));
  for (let i = 0; i <= n; i++) {
    const x = a.x + ((b.x - a.x) * i) / n, y = a.y + ((b.y - a.y) * i) / n;
    if (!cabe({x, y})) return false;
  }
  return true;
}

const cache = new Map<string, Pt[]>();
export function caminho(a0: Pt, b0: Pt): Pt[] {
  const a = soltar(a0), b = soltar(b0);
  const A = celula(a), B = celula(b);
  const chave = `${A.c},${A.r}>${B.c},${B.r}`;
  const pronto = cache.get(chave);
  if (pronto) return [a, ...pronto.slice(1, -1), b];
  if (reta(a, b)) return [a, b];
  // A* (8 vizinhos, sem cortar quina)
  const N = C * R, ini = A.r * C + A.c, fim = B.r * C + B.c;
  const g = new Float32Array(N).fill(Infinity), de = new Int32Array(N).fill(-1), fechado = new Uint8Array(N);
  const heap: [number, number][] = [];
  const push = (k: number, f: number) => { heap.push([f, k]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p } };
  const pop = () => { const top = heap[0]; const last = heap.pop()!; if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m } } return top };
  const hz = (k: number) => Math.hypot((k % C) - B.c, Math.floor(k / C) - B.r);
  g[ini] = 0; push(ini, hz(ini));
  while (heap.length) {
    const [, k] = pop();
    if (fechado[k]) continue;
    fechado[k] = 1;
    if (k === fim) break;
    const c = k % C, r = Math.floor(k / C);
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nc = c + dc, nr = r + dr;
      if (!andavel(nc, nr) || (dr && dc && (!andavel(c + dc, r) || !andavel(c, r + dr)))) continue;
      const nk = nr * C + nc;
      const ng = g[k] + (dr && dc ? 1.414 : 1) * CUSTO[nk];
      if (ng < g[nk]) { g[nk] = ng; de[nk] = k; push(nk, ng + hz(nk)) }
    }
  }
  if (de[fim] < 0 && fim !== ini) return [a, b];
  const cel: Pt[] = [];
  for (let k = fim; k !== -1; k = de[k]) cel.push({x: ((k % C) + 0.5) * T, y: (Math.floor(k / C) + 0.5) * T});
  cel.reverse();
  // estica: do ponto atual, pula para o mais longe que dá em linha reta
  const pts: Pt[] = [a];
  let i = 0;
  const todos = [a, ...cel.slice(1, -1), b];
  while (i < todos.length - 1) {
    let j = todos.length - 1;
    while (j > i + 1 && !reta(todos[i], todos[j])) j--;
    pts.push(todos[j]);
    i = j;
  }
  cache.set(chave, pts);
  return pts;
}
