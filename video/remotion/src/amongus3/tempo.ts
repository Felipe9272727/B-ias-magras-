// Among Us 3: o relógio da cena de jogo. Cada cena tem âncoras "este evento da partida acontece quando o narrador
// fala esta palavra"; entre duas âncoras a partida acelera (até vmax) ou desacelera (câmera lenta, até VMIN) para
// chegar na hora certa. Quando o salto é grande demais para acelerar, a cena corta (escurece rápido e mostra o tique),
// numa pausa da narração, e chega na âncora seguinte uns segundos antes, em velocidade normal. Nunca congela no meio.
// Reunião: a cena desacelera para não atravessar; se não der, vira corte ("depois da reunião"), porque na reunião
// todo mundo volta para a mesa e isso não pode aparecer como teleporte.
import type {Sim} from './sim';

export const VMIN = 0.3;
const VMIN_REUNIAO = 0.25;
const FPS = 30;

export type Corte = {k: number; tipo: 'tempo' | 'reuniao'};
export type Mapa = {quadros: number[]; cortes: Corte[]};

// ancs: [quadro da cena, quadro da partida]; pausas: quadros da cena entre palavras (bons para cortar)
export function mapaTempo(ancs: [number, number][], dur: number, de: number, total: number, reunioes: number[], pausas: number[], vmax = 2): Mapa {
  const q: number[] = new Array(dur).fill(0);
  const cortes: Corte[] = [];
  const a: [number, number][] = [];
  for (const [c, s] of ancs) {
    if (c < 0 || c >= dur || s < 0) continue;
    if (a.length && (c <= a[a.length - 1][0] || s <= a[a.length - 1][1])) continue;
    a.push([c, s]);
  }
  const reuniaoEntre = (x: number, y: number) => reunioes.find((r) => x < r && y >= r);

  // trecho livre de [k0, k1] partindo do quadro s0 em velocidade normal, sem atravessar reunião
  const livre = (k0: number, k1: number, s0: number) => {
    let v = 1;
    const r = reuniaoEntre(s0, s0 + (k1 - k0));
    if (r !== undefined && k1 > k0) v = Math.max(VMIN_REUNIAO, (r - 1 - s0) / (k1 - k0));
    for (let k = k0; k <= k1; k++) q[k] = s0 + (k - k0) * v;
  };

  if (!a.length) {
    livre(0, dur - 1, de);
  } else {
    // antes da primeira âncora: velocidade normal, voltando no tempo; se isso cruzaria uma reunião (ou o começo da
    // partida), começa logo depois dela e anda um pouco mais devagar
    const [c0, s0] = a[0];
    let ini = s0 - c0;
    const r = reunioes.filter((r) => r > ini && r <= s0).pop();
    if (r !== undefined) ini = r;
    if (ini < 0) ini = 0;
    const v0 = c0 > 0 ? Math.max(VMIN, (s0 - ini) / c0) : 1;
    for (let k = 0; k <= c0; k++) q[k] = Math.max(ini, s0 - (c0 - k) * v0);
    let cur = s0; // onde a partida está de fato na âncora atual (pode ter chegado adiantada)
    for (let i = 0; i + 1 < a.length; i++) {
      const c = a[i][0], [c1, s1] = a[i + 1];
      const v = (s1 - cur) / (c1 - c);
      if (v <= vmax) {
        const vv = Math.max(v, VMIN);
        for (let k = c + 1; k <= c1; k++) q[k] = cur + (k - c) * vv;
        cur = q[c1];
        continue;
      }
      // corte numa pausa da fala, de preferência 3 s antes da âncora seguinte
      const alvo = c1 - 3 * FPS;
      const ok = pausas.filter((p) => p > c + 0.8 * FPS && p < c1 - 1.2 * FPS);
      const corte = ok.length ? ok.reduce((m, p) => (Math.abs(p - alvo) < Math.abs(m - alvo) ? p : m)) : Math.round(Math.max(c + 1, Math.min(c1 - 1, (c + c1) / 2)));
      for (let k = c + 1; k < corte; k++) q[k] = cur + (k - c);
      for (let k = corte; k <= c1; k++) q[k] = s1 - (c1 - k);
      cortes.push({k: corte, tipo: 'tempo'});
      cur = s1;
    }
    const cu = a[a.length - 1][0];
    if (cu + 1 < dur) livre(cu + 1, dur - 1, cur + 1);
  }
  for (let k = 0; k < dur; k++) q[k] = Math.max(0, Math.min(total - 1, q[k]));
  // reunião que sobrou no meio da cena (ou dentro de um corte): vira corte "depois da reunião"
  for (let k = 1; k < dur; k++) {
    if (reuniaoEntre(q[k - 1], q[k]) === undefined) continue;
    const c = cortes.find((c) => c.k === k);
    if (c) c.tipo = 'reuniao';
    else cortes.push({k, tipo: 'reuniao'});
  }
  cortes.sort((x, y) => x.k - y.k);
  return {quadros: q, cortes};
}

// quadro da cena em que o evento (quadro da partida) aparece; -1 se fica fora da cena
export function quandoNaCena(m: Mapa, quadroSim: number): number {
  const q = m.quadros;
  if (q[0] >= quadroSim) return q[0] - quadroSim < 1 ? 0 : -1;
  for (let k = 1; k < q.length; k++) if (q[k - 1] < quadroSim && q[k] >= quadroSim) return k;
  return -1;
}

// velocidade da partida em volta do quadro k (para o selo "⏩ 2x" / "câmera lenta")
export function velocidade(m: Mapa, k: number): number {
  const q = m.quadros;
  const a = Math.max(0, k - 6), b = Math.min(q.length - 1, k + 6);
  if (m.cortes.some((c) => c.k > a && c.k <= b) || b === a) return 1;
  return (q[b] - q[a]) / (b - a);
}

// quadro da partida de um evento: {tique: N} é o começo do tique; 'contem' procura no texto (mensagens do chat)
export const quadroDoEvento = (s: Sim, ev: Record<string, unknown>): number => {
  const ks = Object.keys(ev);
  if (ks.length === 1 && ks[0] === 'tique') return s.inicioTique[ev.tique as number] ?? -1;
  const e = s.eventos.find((x) => Object.entries(ev).every(([k, v]) => (k === 'contem' ? String(x.texto ?? '').includes(v as string) : x[k] === v)));
  return e ? e.quadro : -1;
};

// quadro (na cena) em que o narrador fala cada termo, procurado depois do anterior; -1 se não achou
const semAcento = (w: string) => w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
export function palavrasNaCena(words: {w: string; s: number}[], termos: string[]): number[] {
  let k = 0;
  return termos.map((t) => {
    const alvo = t.split(' ').map(semAcento);
    for (let i = k; i < words.length; i++) {
      if (alvo.every((a, j) => semAcento(words[i + j]?.w ?? '') === a)) {
        k = i + 1;
        return words[i].s;
      }
    }
    return -1;
  });
}

type CenaJogo = {duration: number; words?: unknown[]};
// o relógio de uma cena AU3Jogo (props do roteiro): onde começa e, com âncoras, o mapa quadro da cena → quadro da partida
export function mapaDaCena(scene: CenaJogo, p: Record<string, any>, s: Sim): {de: number; mapa: Mapa; ditas: number[]; pares: [number, number][]} {
  let de = (s.inicioTique[p.tique ?? 1] ?? 0) + Math.round((p.seg ?? 0) * 30);
  if (p.evento) {
    const q = quadroDoEvento(s, p.evento);
    if (q >= 0) de = Math.max(0, q - Math.round((p.antes ?? 3) * 30));
  }
  const ancs = (p.ancoras ?? []) as [Record<string, unknown>, string][];
  const ws = (scene.words ?? []) as {w: string; s: number; e: number}[];
  const ditas = palavrasNaCena(ws, ancs.map((x) => x[1]));
  const pares = ancs.map((x, i) => [ditas[i], quadroDoEvento(s, x[0])] as [number, number]);
  const pausas = ws.slice(1).map((w, i) => (w.s - ws[i].e >= 6 ? Math.round((w.s + ws[i].e) / 2) : -1)).filter((x) => x > 0);
  const mapa = mapaTempo(pares.filter(([c, q]) => c >= 0 && q >= 0), scene.duration, de, s.total, s.reunioes.map((r) => r.quadro), pausas, p.vmax ?? 2);
  return {de, mapa, ditas, pares};
}
