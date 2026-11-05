// Mira HQ (Among IA 6, modo zumbi): salas e corredores em coordenadas de mundo (px), seguindo a planta do jogo
// real: Lançamento à esquerda (com o foguete), Enfermaria e Comunicações embaixo, Vestiário e Descontaminação levando
// ao Corredor central; dele saem o Reator e o Laboratório (no alto), o Escritório e o Admin, a Estufa (canto de cima à
// direita) e o Refeitório (com Varanda e Depósito). As vizinhanças são as mesmas do motor (amongus/zumbi.mjs).
export type SalaId = 'Lancamento' | 'Enfermaria' | 'Comunicacoes' | 'Vestiario' | 'Descontaminacao' | 'Corredor' | 'Reator' | 'Laboratorio' | 'Escritorio' | 'Admin' | 'Estufa' | 'Refeitorio' | 'Varanda' | 'Deposito';
export type Pt = {x: number; y: number};
export type Sala = {nome: string; x: number; y: number; w: number; h: number; piso: string; piso2: string; parede: string; luz: string};

export const MUNDO = {w: 3700, h: 1950};

export const SALAS: Record<SalaId, Sala> = {
  Lancamento: {nome: 'Lançamento', x: 90, y: 820, w: 640, h: 700, piso: '#3b3f4a', piso2: '#33363f', parede: '#5a6070', luz: '#ff8a2a'},
  Enfermaria: {nome: 'Enfermaria', x: 820, y: 1430, w: 420, h: 360, piso: '#cfd8dc', piso2: '#b9c4c9', parede: '#7d9aa6', luz: '#8fffd2'},
  Comunicacoes: {nome: 'Comunicações', x: 820, y: 1010, w: 420, h: 340, piso: '#3a4250', piso2: '#323946', parede: '#5d6b80', luz: '#7ad0ff'},
  Vestiario: {nome: 'Vestiário', x: 820, y: 560, w: 440, h: 360, piso: '#6b5a48', piso2: '#5f4f3f', parede: '#8a7660', luz: '#ffb04a'},
  Descontaminacao: {nome: 'Descontaminação', x: 1350, y: 600, w: 300, h: 280, piso: '#9aa7a0', piso2: '#8a968f', parede: '#5f7a6d', luz: '#b4ff5a'},
  Corredor: {nome: 'Corredor', x: 1740, y: 600, w: 760, h: 290, piso: '#4a4f5c', piso2: '#424653', parede: '#6b7184', luz: '#ff7a1a'},
  Reator: {nome: 'Reator', x: 1380, y: 80, w: 520, h: 400, piso: '#34364a', piso2: '#2c2e40', parede: '#545a78', luz: '#4ad8ff'},
  Laboratorio: {nome: 'Laboratório', x: 2000, y: 70, w: 620, h: 400, piso: '#e3e8ef', piso2: '#d0d7e2', parede: '#7c8ca6', luz: '#b88cff'},
  Escritorio: {nome: 'Escritório', x: 2600, y: 560, w: 360, h: 300, piso: '#6d4a3a', piso2: '#5f4033', parede: '#8a6452', luz: '#ffc46a'},
  Admin: {nome: 'Admin', x: 3060, y: 500, w: 400, h: 330, piso: '#4a3a5c', piso2: '#40324f', parede: '#6a5880', luz: '#d36aff'},
  Estufa: {nome: 'Estufa', x: 2730, y: 60, w: 760, h: 360, piso: '#4d6b3a', piso2: '#435d32', parede: '#5f7f4a', luz: '#ff9a2a'},
  Refeitorio: {nome: 'Refeitório', x: 2560, y: 1000, w: 640, h: 470, piso: '#7a6a58', piso2: '#6d5e4d', parede: '#94806a', luz: '#ffa640'},
  Varanda: {nome: 'Varanda', x: 3300, y: 1030, w: 300, h: 420, piso: '#5a5560', piso2: '#4f4a55', parede: '#7a7385', luz: '#c9d6ff'},
  Deposito: {nome: 'Depósito', x: 2620, y: 1560, w: 480, h: 300, piso: '#5c4e3c', piso2: '#524534', parede: '#7c6a52', luz: '#ff8a3a'},
};

export const centro = (s: SalaId): Pt => ({x: SALAS[s].x + SALAS[s].w / 2, y: SALAS[s].y + SALAS[s].h / 2});

// corredores entre salas vizinhas: a sequência de pontos por onde se anda (do centro de A ao centro de B)
// e por onde o corredor é desenhado (largura 110). As pontas ficam dentro das salas.
export const LIGACOES: {a: SalaId; b: SalaId; pts: Pt[]}[] = [
  {a: 'Lancamento', b: 'Vestiario', pts: [{x: 600, y: 900}, {x: 600, y: 740}, {x: 900, y: 740}]},
  {a: 'Lancamento', b: 'Comunicacoes', pts: [{x: 650, y: 1180}, {x: 900, y: 1180}]},
  {a: 'Lancamento', b: 'Enfermaria', pts: [{x: 600, y: 1450}, {x: 600, y: 1610}, {x: 900, y: 1610}]},
  {a: 'Comunicacoes', b: 'Enfermaria', pts: [{x: 1030, y: 1300}, {x: 1030, y: 1480}]},
  {a: 'Comunicacoes', b: 'Vestiario', pts: [{x: 1030, y: 1060}, {x: 1030, y: 870}]},
  {a: 'Vestiario', b: 'Descontaminacao', pts: [{x: 1200, y: 740}, {x: 1400, y: 740}]},
  {a: 'Descontaminacao', b: 'Corredor', pts: [{x: 1600, y: 745}, {x: 1800, y: 745}]},
  {a: 'Corredor', b: 'Reator', pts: [{x: 1860, y: 650}, {x: 1860, y: 420}, {x: 1700, y: 420}]},
  {a: 'Corredor', b: 'Laboratorio', pts: [{x: 2200, y: 650}, {x: 2200, y: 420}]},
  {a: 'Corredor', b: 'Escritorio', pts: [{x: 2450, y: 710}, {x: 2660, y: 710}]},
  {a: 'Corredor', b: 'Estufa', pts: [{x: 2420, y: 650}, {x: 2420, y: 520}, {x: 2880, y: 520}, {x: 2880, y: 380}]},
  {a: 'Corredor', b: 'Refeitorio', pts: [{x: 2300, y: 840}, {x: 2300, y: 1180}, {x: 2620, y: 1180}]},
  {a: 'Escritorio', b: 'Admin', pts: [{x: 2900, y: 700}, {x: 3120, y: 700}]},
  {a: 'Admin', b: 'Estufa', pts: [{x: 3260, y: 560}, {x: 3260, y: 380}]},
  {a: 'Refeitorio', b: 'Varanda', pts: [{x: 3150, y: 1240}, {x: 3350, y: 1240}]},
  {a: 'Refeitorio', b: 'Deposito', pts: [{x: 2860, y: 1420}, {x: 2860, y: 1610}]},
];

// caminho de A para B (sempre vizinhas no motor): centro de A, pontos do corredor, centro de B
export function caminho(a: SalaId, b: SalaId): Pt[] {
  const l = LIGACOES.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
  if (!l) return [centro(a), centro(b)];
  const pts = l.a === a ? l.pts : [...l.pts].reverse();
  return [centro(a), ...pts, centro(b)];
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

// lugar fixo de cada cor dentro da sala (grade, para não amontoar), com um balanço pequeno
function h(s: string) { let x = 0; for (const c of s) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x; }
export function spot(s: SalaId, cor: string, idx = 0): Pt {
  const r = SALAS[s];
  const cols = Math.max(2, Math.floor((r.w - 120) / 90));
  const rows = Math.max(2, Math.floor((r.h - 160) / 80));
  const i = (h(cor) + idx * 7) % (cols * rows);
  return {x: r.x + 60 + ((i % cols) + 0.5) * ((r.w - 120) / cols), y: r.y + 110 + (Math.floor(i / cols) + 0.5) * ((r.h - 160) / rows)};
}
