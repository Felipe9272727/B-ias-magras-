// Mira HQ (Among IA 6, modo zumbi) em coordenadas de mundo, copiando a planta oficial do jogo (mapa da wiki do Among Us,
// 1000x563, escalado 4,2x): Lançamento grande à esquerda ligado pelo corredor de baixo; Reator e Laboratório no alto,
// ligados ao corredor de baixo pelo corredor vertical da Descontaminação; o Corredor em Y (haste da Estufa, que é uma
// cúpula no topo, com Escritório e Admin dos lados) que se divide para Vestiário/Comunicações/Enfermaria (braço esquerdo)
// e para Depósito/Refeitório (braço direito); a Varanda embaixo do Refeitório. Dutos onde o jogo tem.
// As salas são as mesmas ids do motor (amongus/zumbi.mjs); o caminho entre duas salas segue os corredores reais.
export type SalaId = 'Lancamento' | 'Enfermaria' | 'Comunicacoes' | 'Vestiario' | 'Descontaminacao' | 'Corredor' | 'Reator' | 'Laboratorio' | 'Escritorio' | 'Admin' | 'Estufa' | 'Refeitorio' | 'Varanda' | 'Deposito';
export type Pt = {x: number; y: number};
export type Sala = {nome: string; x: number; y: number; w: number; h: number; piso: string; piso2: string; parede: string; luz: string; porta: Pt};

const K = 7; // escala da imagem de referência (arte do jogo, 588x453) para o mundo
const OX = 0, OY = 0;
export const P = (x: number, y: number): Pt => ({x: (x - OX) * K, y: (y - OY) * K});
const R = (x0: number, y0: number, x1: number, y1: number) => ({x: (x0 - OX) * K, y: (y0 - OY) * K, w: (x1 - x0) * K, h: (y1 - y0) * K});

export const MUNDO = {w: 560 * K, h: 432 * K};

// medidas tiradas da arte do jogo (imagem de referência do Felipe): Estufa retangular no alto, Escritório e Admin
// embaixo dela com a haste do Y entre os dois; Reator e Laboratório lado a lado com o corredor que desce pela
// Descontaminação (esteira amarela) até o Vestiário; Lançamento à esquerda com a faixa verde; corredor de baixo de
// tijolo; braço esquerdo do Y (claro) com Comunicações e Enfermaria; braço direito para Depósito, Refeitório e Varanda.
export const SALAS: Record<SalaId, Sala> = {
  Estufa: {nome: 'Estufa', ...R(320, 5, 460, 78), piso: '#3f6d4a', piso2: '#37613f', parede: '#2e4a3a', luz: '#ff9a2a', porta: P(390, 78)},
  Escritorio: {nome: 'Escritório', ...R(320, 78, 378, 150), piso: '#c9cfd6', piso2: '#b9c0c9', parede: '#4a5566', luz: '#ffc46a', porta: P(378, 115)},
  Admin: {nome: 'Admin', ...R(404, 78, 460, 150), piso: '#2f4a46', piso2: '#294140', parede: '#3c5a56', luz: '#6affc8', porta: P(404, 115)},
  Reator: {nome: 'Reator', ...R(148, 155, 215, 250), piso: '#3a3f4a', piso2: '#323641', parede: '#2a2d36', luz: '#ffd23a', porta: P(215, 200)},
  Laboratorio: {nome: 'Laboratório', ...R(247, 165, 312, 240), piso: '#dfe9ee', piso2: '#ccdae2', parede: '#56707e', luz: '#7ae8ff', porta: P(247, 200)},
  Descontaminacao: {nome: 'Descontaminação', ...R(214, 240, 258, 336), piso: '#e8c020', piso2: '#2a2a2a', parede: '#5a5a5a', luz: '#ffe14a', porta: P(236, 288)},
  Vestiario: {nome: 'Vestiário', ...R(200, 336, 300, 378), piso: '#d9dfe6', piso2: '#c6cdd6', parede: '#56606e', luz: '#ffb04a', porta: P(250, 357)},
  Lancamento: {nome: 'Lançamento', ...R(0, 285, 150, 378), piso: '#d6dde2', piso2: '#c5ccd2', parede: '#4a525c', luz: '#ff8a2a', porta: P(100, 378)},
  Comunicacoes: {nome: 'Comunicações', ...R(335, 290, 386, 340), piso: '#2f3a44', piso2: '#28323b', parede: '#3c4752', luz: '#7ad0ff', porta: P(335, 315)},
  Enfermaria: {nome: 'Enfermaria', ...R(335, 340, 386, 410), piso: '#cfe6e2', piso2: '#bcd8d3', parede: '#4f7a78', luz: '#8fffd2', porta: P(335, 375)},
  Corredor: {nome: 'Corredor', ...R(352, 178, 428, 250), piso: '#7f96b8', piso2: '#7088ab', parede: '#3d4f6a', luz: '#ff7a1a', porta: P(390, 215)},
  Deposito: {nome: 'Depósito', ...R(390, 290, 430, 385), piso: '#4a5048', piso2: '#41463f', parede: '#363b35', luz: '#ff8a3a', porta: P(430, 330)},
  Refeitorio: {nome: 'Refeitório', ...R(430, 290, 545, 382), piso: '#d9e0e6', piso2: '#c8d0d8', parede: '#4f5966', luz: '#ffa640', porta: P(470, 290)},
  Varanda: {nome: 'Varanda', ...R(390, 385, 545, 412), piso: '#3b4048', piso2: '#33373e', parede: '#2b2f35', luz: '#c9d6ff', porta: P(470, 385)},
};

// rede de corredores
const N: Record<string, Pt> = {
  rl: P(231, 200), dcTop: P(236, 248), dcBot: P(236, 330), loc: P(250, 357), baixo1: P(236, 395), lanc: P(100, 395),
  baixo2: P(318, 395), enfP: P(318, 375), yEsqB: P(318, 350), comP: P(318, 315), yEsqT: P(318, 262), junc: P(390, 215),
  stemM: P(390, 115), stemT: P(390, 78), yDirT: P(470, 262), refP: P(470, 290), refC: P(470, 335),
};
const TRECHOS: [string, string][] = [
  ['rl', 'dcTop'], ['dcTop', 'dcBot'], ['dcBot', 'loc'], ['dcBot', 'baixo1'], ['lanc', 'baixo1'], ['baixo1', 'baixo2'],
  ['baixo2', 'enfP'], ['enfP', 'yEsqB'], ['yEsqB', 'comP'], ['comP', 'yEsqT'], ['yEsqT', 'junc'], ['junc', 'stemM'], ['stemM', 'stemT'],
  ['junc', 'yDirT'], ['yDirT', 'refP'], ['refP', 'refC'],
];
const SAIDA: Record<SalaId, string> = {
  Lancamento: 'lanc', Reator: 'rl', Laboratorio: 'rl', Descontaminacao: 'dcTop', Vestiario: 'loc', Comunicacoes: 'comP',
  Enfermaria: 'enfP', Corredor: 'junc', Escritorio: 'stemM', Admin: 'stemM', Estufa: 'stemT', Deposito: 'refC', Refeitorio: 'refP', Varanda: 'refC',
};
// corredores para desenhar (com o tipo de piso de cada trecho, como na arte do jogo)
export const CORREDORES: {pts: Pt[]; piso: 'vidro' | 'tijolo' | 'verde' | 'metal' | 'claro'}[] = [
  {pts: [N.lanc, P(200, 395)], piso: 'verde'},
  {pts: [P(200, 395), N.baixo1, N.baixo2], piso: 'tijolo'},
  {pts: [N.rl, P(231, 165)], piso: 'metal'},
  {pts: [N.baixo2, N.enfP, N.yEsqB, N.comP, N.yEsqT], piso: 'claro'},
  {pts: [N.yEsqT, N.junc], piso: 'vidro'},
  {pts: [N.junc, N.yDirT, N.refP], piso: 'vidro'},
  {pts: [N.junc, N.stemM, N.stemT], piso: 'vidro'},
];
// dutos (grades no chão) onde o jogo tem: quase todas as salas e os corredores; não no Vestiário, Comunicações,
// Depósito nem Refeitório
export const DUTOS: Pt[] = [P(40, 300), P(170, 235), P(300, 225), P(236, 262), P(335, 140), P(445, 140), P(440, 30), P(360, 400), P(520, 400), P(390, 160), P(280, 395)];

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
