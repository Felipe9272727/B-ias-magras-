// Mira HQ (Among IA 6, modo zumbi) em coordenadas de mundo, copiando a planta oficial do jogo (mapa da wiki do Among Us,
// 1000x563, escalado 4,2x): Lançamento grande à esquerda ligado pelo corredor de baixo; Reator e Laboratório no alto,
// ligados ao corredor de baixo pelo corredor vertical da Descontaminação; o Corredor em Y (haste da Estufa, que é uma
// cúpula no topo, com Escritório e Admin dos lados) que se divide para Vestiário/Comunicações/Enfermaria (braço esquerdo)
// e para Depósito/Refeitório (braço direito); a Varanda embaixo do Refeitório. Dutos onde o jogo tem.
// As salas são as mesmas ids do motor (amongus/zumbi.mjs); o caminho entre duas salas segue os corredores reais.
export type SalaId = 'Lancamento' | 'Enfermaria' | 'Comunicacoes' | 'Vestiario' | 'Descontaminacao' | 'Corredor' | 'Reator' | 'Laboratorio' | 'Escritorio' | 'Admin' | 'Estufa' | 'Refeitorio' | 'Varanda' | 'Deposito';
export type Pt = {x: number; y: number};
export type Sala = {nome: string; x: number; y: number; w: number; h: number; piso: string; piso2: string; parede: string; luz: string; porta: Pt};

const K = 5.6; // escala da planta da wiki para o mundo
const OX = 100, OY = 0; // recorte da planta (sem o vazio da esquerda)
export const P = (x: number, y: number): Pt => ({x: (x - OX) * K, y: (y - OY) * K});
const R = (x0: number, y0: number, x1: number, y1: number) => ({x: (x0 - OX) * K, y: (y0 - OY) * K, w: (x1 - x0) * K, h: (y1 - y0) * K});

export const MUNDO = {w: (900 - OX) * K, h: 560 * K};

export const SALAS: Record<SalaId, Sala> = {
  Lancamento: {nome: 'Lançamento', ...R(148, 330, 340, 470), piso: '#3b3f4a', piso2: '#33363f', parede: '#5a6070', luz: '#ff8a2a', porta: P(290, 470)},
  Reator: {nome: 'Reator', ...R(345, 182, 432, 300), piso: '#34364a', piso2: '#2c2e40', parede: '#545a78', luz: '#4ad8ff', porta: P(432, 245)},
  Laboratorio: {nome: 'Laboratório', ...R(474, 207, 557, 300), piso: '#e3e8ef', piso2: '#d0d7e2', parede: '#7c8ca6', luz: '#b88cff', porta: P(474, 255)},
  Descontaminacao: {nome: 'Descontaminação', ...R(434, 300, 472, 425), piso: '#9aa7a0', piso2: '#8a968f', parede: '#5f7a6d', luz: '#b4ff5a', porta: P(453, 362)},
  Vestiario: {nome: 'Vestiário', ...R(490, 365, 542, 470), piso: '#6b5a48', piso2: '#5f4f3f', parede: '#8a7660', luz: '#ffb04a', porta: P(542, 415)},
  Comunicacoes: {nome: 'Comunicações', ...R(585, 365, 642, 432), piso: '#3a4250', piso2: '#323946', parede: '#5d6b80', luz: '#7ad0ff', porta: P(585, 400)},
  Enfermaria: {nome: 'Enfermaria', ...R(585, 432, 642, 510), piso: '#cfd8dc', piso2: '#b9c4c9', parede: '#7d9aa6', luz: '#8fffd2', porta: P(585, 470)},
  Corredor: {nome: 'Corredor', ...R(600, 255, 712, 330), piso: '#4a4f5c', piso2: '#424653', parede: '#6b7184', luz: '#ff7a1a', porta: P(656, 292)},
  Escritorio: {nome: 'Escritório', ...R(570, 95, 636, 182), piso: '#6d4a3a', piso2: '#5f4033', parede: '#8a6452', luz: '#ffc46a', porta: P(636, 140)},
  Admin: {nome: 'Admin', ...R(679, 95, 745, 182), piso: '#4a3a5c', piso2: '#40324f', parede: '#6a5880', luz: '#d36aff', porta: P(679, 140)},
  Estufa: {nome: 'Estufa', ...R(570, 28, 745, 95), piso: '#4d6b3a', piso2: '#435d32', parede: '#5f7f4a', luz: '#ff9a2a', porta: P(657, 95)},
  Deposito: {nome: 'Depósito', ...R(658, 366, 712, 446), piso: '#5c4e3c', piso2: '#524534', parede: '#7c6a52', luz: '#ff8a3a', porta: P(712, 400)},
  Refeitorio: {nome: 'Refeitório', ...R(715, 366, 856, 470), piso: '#7a6a58', piso2: '#6d5e4d', parede: '#94806a', luz: '#ffa640', porta: P(755, 366)},
  Varanda: {nome: 'Varanda', ...R(658, 485, 856, 522), piso: '#5a5560', piso2: '#4f4a55', parede: '#7a7385', luz: '#c9d6ff', porta: P(700, 485)},
};

// rede de corredores (nós e trechos), da planta: corredor de baixo, haste da Descontaminação, Y central
const N: Record<string, Pt> = {
  lanc: P(290, 495), baixoA: P(410, 495), deconBaixo: P(453, 495), baixoB: P(560, 495), deconAlto: P(453, 245),
  deconMeio: P(453, 362), vestP: P(560, 415), comP: P(565, 400), enfP: P(565, 470), yEsq: P(560, 330),
  junc: P(656, 292), hasteMeio: P(656, 140), hasteTopo: P(656, 95), yDir: P(755, 330), refP: P(755, 366),
  depP: P(735, 400), varP: P(735, 485),
};
const TRECHOS: [string, string][] = [
  ['lanc', 'baixoA'], ['baixoA', 'deconBaixo'], ['deconBaixo', 'baixoB'], ['deconBaixo', 'deconMeio'], ['deconMeio', 'deconAlto'],
  ['baixoB', 'enfP'], ['enfP', 'comP'], ['comP', 'vestP'], ['vestP', 'yEsq'], ['yEsq', 'junc'], ['junc', 'hasteMeio'], ['hasteMeio', 'hasteTopo'],
  ['junc', 'yDir'], ['yDir', 'refP'], ['refP', 'depP'], ['depP', 'varP'],
];
// de que nó da rede cada sala sai
const SAIDA: Record<SalaId, string> = {
  Lancamento: 'lanc', Reator: 'deconAlto', Laboratorio: 'deconAlto', Descontaminacao: 'deconMeio', Vestiario: 'vestP', Comunicacoes: 'comP',
  Enfermaria: 'enfP', Corredor: 'junc', Escritorio: 'hasteMeio', Admin: 'hasteMeio', Estufa: 'hasteTopo', Deposito: 'depP', Refeitorio: 'refP', Varanda: 'varP',
};
// para desenhar: os trechos da rede (corredores largos) e as bocas de cada sala até a rede
export const CORREDORES: Pt[][] = [
  ...TRECHOS.map(([a, b]) => [N[a], N[b]]),
  ...(Object.keys(SALAS) as SalaId[]).map((s) => [SALAS[s].porta, N[SAIDA[s]]]),
];

// dutos (grades no chão) onde o jogo tem: quase todas as salas e os corredores; não no Vestiário, Comunicações,
// Depósito nem Refeitório
export const DUTOS: Pt[] = [P(200, 360), P(400, 270), P(530, 230), P(453, 330), P(600, 120), P(720, 120), P(700, 55), P(620, 495), P(830, 505), P(656, 220), P(520, 495)];

export const centro = (s: SalaId): Pt => ({x: SALAS[s].x + SALAS[s].w / 2, y: SALAS[s].y + SALAS[s].h / 2});

// menor caminho na rede (Dijkstra pequeno, com memória)
const VIZ: Record<string, {n: string; d: number}[]> = {};
for (const [a, b] of TRECHOS) {
  const d = Math.hypot(N[a].x - N[b].x, N[a].y - N[b].y);
  (VIZ[a] ??= []).push({n: b, d});
  (VIZ[b] ??= []).push({n: a, d});
}
const MEMO = new Map<string, Pt[]>();
function rede(a: string, b: string): Pt[] {
  const dist: Record<string, number> = {[a]: 0};
  const ant: Record<string, string> = {};
  const aberto = new Set(Object.keys(N));
  while (aberto.size) {
    let u = '';
    for (const x of aberto) if (dist[x] !== undefined && (u === '' || dist[x] < dist[u])) u = x;
    if (!u || u === b) break;
    aberto.delete(u);
    for (const {n, d} of VIZ[u] ?? []) if (dist[u] + d < (dist[n] ?? Infinity)) { dist[n] = dist[u] + d; ant[n] = u; }
  }
  const out: string[] = [b];
  while (out[0] !== a && ant[out[0]]) out.unshift(ant[out[0]]);
  return out.map((k) => N[k]);
}

// caminho de uma sala a outra pelos corredores reais: lugar na sala A -> porta A -> rede -> porta B -> lugar na sala B
export function caminho(a: SalaId, b: SalaId, de?: Pt, para?: Pt): Pt[] {
  const k = `${a}>${b}`;
  let meio = MEMO.get(k);
  if (!meio) {
    meio = a === b ? [] : [SALAS[a].porta, ...rede(SAIDA[a], SAIDA[b]), SALAS[b].porta];
    MEMO.set(k, meio);
  }
  return [de ?? centro(a), ...meio, para ?? centro(b)];
}

// ponto ao longo de uma polilinha (k de 0 a 1, por comprimento)
export function aoLongo(pts: Pt[], k: number): Pt {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const tot = seg.reduce((a, b) => a + b, 0) || 1;
  let d = Math.max(0, Math.min(1, k)) * tot;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const f = seg[i] ? Math.min(1, d / seg[i]) : 0;
      return {x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f};
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
}

// lugar de cada um dentro da sala: grade da sala, uma célula por pessoa (na ordem das cores), espalhando bem
export function spotN(s: SalaId, i: number, n: number): Pt {
  const r = SALAS[s];
  const cols = Math.max(1, Math.floor((r.w - 60) / 95));
  const rows = Math.max(1, Math.floor((r.h - 140) / 95));
  const tot = cols * rows;
  const passo = n <= tot ? Math.max(1, Math.floor(tot / Math.max(1, n))) : 1;
  const c = (i * passo) % tot;
  const volta = Math.floor((i * passo) / tot); // mais gente que células: segunda camada deslocada
  return {x: r.x + 30 + ((c % cols) + 0.5 + volta * 0.45) * ((r.w - 60) / cols), y: r.y + 115 + (Math.floor(c / cols) + 0.5 + volta * 0.35) * ((r.h - 140) / rows)};
}
export function spot(s: SalaId, cor: string): Pt { return spotN(s, 0, 1); }
