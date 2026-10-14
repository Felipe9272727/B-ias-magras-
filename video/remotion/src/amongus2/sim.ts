// Among Us 2: simulação em tempo real do log de uma partida (amongus/jogo2.mjs).
// O motor é por tiques (cada um anda uma sala por tique), mas aqui cada jogador ANDA em velocidade constante,
// como num jogo de verdade: quem não chegou no fim do tique continua andando no seguinte (nunca acelera, nunca pula).
// Os únicos "saltos" são os do próprio jogo: sair pelo outro duto, o assassino indo até a vítima na hora da morte
// e todo mundo de volta à mesa do Refeitório depois de uma reunião.
// Resultado: posição de cada jogador em cada quadro da partida inteira (30 fps), mais os eventos com o quadro em que acontecem.
import {NAVE, andavel, caminho, salaEm} from '../amongus/nave/mapa';
import type {Pt, Sala} from '../amongus/nave/spec';

export const FPS = 30;
export const VEL = 7.5; // px de mundo por quadro (~3 corpos por segundo, como no jogo)
const ALCANCE = 70; // distância do impostor à vítima na hora da facada

export const CORES = ['Vermelho', 'Azul', 'Verde', 'Rosa', 'Laranja', 'Amarelo', 'Preto', 'Branco', 'Roxo', 'Marrom', 'Ciano', 'Lima'];

export type Decisao = {cor: string; acao: string; pensamento: string; de: string; para: string};
export type Partida2 = {
  partida: number;
  jogadores: {cor: string; papel: string; time: 'impostor' | 'tripulante'; modelo: string; provider: string; estrategia?: boolean}[];
  tiques: ({tique: number; decisoes: Decisao[]; estado: {jogadores: {cor: string; sala: string; vivo: boolean; aparente: string; invisivel?: boolean}[]; tarefas: number; totalTarefas: number; sabotagem: {tipo: string; desde: number} | null} | null} | null)[];
  reunioes: {tique: number; subtipo?: string; tipo?: string; chamador: string; corpo?: string; sala: string; falas: {cor: string; rodada: number; texto: string; pensamento: string}[]; votos: Record<string, string>; pensamentosVoto?: Record<string, string>; expulso: string | null; eraImpostor?: boolean; empate: boolean}[];
  eventos: {tique: number; tipo: string; [k: string]: any}[];
  resultado: {time: string; motivo: string; tique: number};
  memoria?: {resumo: string; reflexoes: Record<string, string>};
};

// estado de um jogador num quadro
export type Q = {x: number; y: number; andando: boolean; dir: number; alpha: number; tarefa: boolean; aparente: string; vivo: boolean; escala: number};
export type EvQ = {quadro: number; tipo: string; tique: number; [k: string]: any};
export type Sim = {
  total: number; // quadros
  inicioTique: number[]; // quadro em que cada tique começa
  q: (cor: string, f: number) => Q | null;
  eventos: EvQ[];
  corpos: (f: number) => {cor: string; x: number; y: number; arrasto?: number}[];
  reunioes: {quadro: number; tique: number; idx: number}[];
  tarefas: (f: number) => number; // fração da barra de tarefas
  sabotagem: (f: number) => string | null;
};

const S = (k: string) => NAVE.salas[k as Sala];
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const idx = (cor: string) => CORES.indexOf(cor);

// ponto de descanso dentro da sala (8 pontos por sala no mapa; as cores 9-12 ficam ao lado de um deles)
function spot(sala: string, cor: string, variacao = 0): Pt {
  const sp = S(sala).spots;
  const i = idx(cor) + variacao * 5;
  const base = sp[i % sp.length];
  if (idx(cor) < sp.length && variacao === 0) return base;
  for (const [dx, dy] of [[56, 0], [-56, 0], [0, 56], [0, -56], [56, 56], [-56, -56]]) {
    const p = {x: base.x + dx, y: base.y + dy};
    if (andavel(p) && salaEm(p) === sala) return p; // nunca do outro lado da parede, em outra sala
  }
  return base;
}
function console_(sala: string, chave: string): Pt {
  const cs = S(sala).consoles;
  let h = 0;
  for (const ch of chave) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return cs[h % cs.length];
}
// mesa do Refeitório depois da reunião: em volta do centro, um lugar por cor
function assento(cor: string): Pt {
  const r = S('Refeitorio').rect;
  const c = {x: (r.c + r.w / 2) * 48, y: (r.r + r.h / 2) * 48};
  const a = (idx(cor) / CORES.length) * Math.PI * 2;
  const p = {x: c.x + Math.cos(a) * 230, y: c.y + Math.sin(a) * 150};
  return andavel(p) ? p : c;
}

type Estado = {pos: Pt; rota: Pt[]; vivo: boolean; dir: number; tarefa: boolean; alvo?: Pt};

const cache = new Map<Partida2, Sim>();

export function simular(p: Partida2): Sim {
  const c = cache.get(p);
  if (c) return c;
  const T = p.resultado?.tique ?? p.tiques.length - 1;
  const st: Record<string, Estado> = {};
  for (const cor of CORES) st[cor] = {pos: assento(cor), rota: [], vivo: true, dir: 1, tarefa: false};
  const N = CORES.length;
  const buf: number[][] = CORES.map(() => []); // por quadro: x, y, flags
  const eventos: EvQ[] = [];
  const reunioes: Sim['reunioes'] = [];
  const inicioTique: number[] = [0];
  const corposVivos: {cor: string; x: number; y: number; desde: number; ate: number; limpo?: number}[] = [];
  const tarefasQ: number[] = [];
  const sabQ: (string | null)[] = [];
  let f = 0;
  let sab: string | null = null;

  const anda = (e: Estado, vel: number) => {
    let resta = vel;
    while (resta > 0 && e.rota.length) {
      const prox = e.rota[0];
      const d = dist(e.pos, prox);
      if (Math.abs(prox.x - e.pos.x) > 1) e.dir = Math.sign(prox.x - e.pos.x);
      if (d <= resta) { e.pos = prox; e.rota.shift(); resta -= d }
      else { e.pos = {x: e.pos.x + ((prox.x - e.pos.x) * resta) / d, y: e.pos.y + ((prox.y - e.pos.y) * resta) / d}; resta = 0 }
    }
  };
  const ir = (e: Estado, alvo: Pt) => {
    const ultimo = e.rota.length ? e.rota[e.rota.length - 1] : e.pos;
    if (dist(ultimo, alvo) < 2) return;
    e.rota = caminho(e.pos, alvo).slice(1);
    e.alvo = alvo;
  };
  const comprimento = (e: Estado) => e.rota.reduce((s, q, i) => s + dist(i ? e.rota[i - 1] : e.pos, q), 0);

  for (let t = 1; t <= T; t++) {
    const tq = p.tiques[t];
    const dec: Record<string, Decisao> = {};
    for (const d of tq?.decisoes ?? []) dec[d.cor] = d;
    const ev = p.eventos.filter((e) => e.tique === t);
    // destinos do tique
    const dutoDe: Record<string, any> = {};
    for (const e of ev) if (e.tipo === 'duto') dutoDe[e.cor] = e;
    for (const cor of CORES) {
      const e = st[cor];
      const d = dec[cor];
      if (!e.vivo || !d) continue;
      e.tarefa = false;
      let m: RegExpMatchArray | null;
      if (dutoDe[cor]) { const v = S(dutoDe[cor].de).duto; if (v) ir(e, v) }
      else if ((m = d.acao.match(/^fazer tarefa: (.+)$/)) && d.de === d.para) { ir(e, console_(d.para, m[1])); e.tarefa = true }
      else if (d.acao === 'fingir que faz tarefa' || /^olhar|^ver sinais|^consertar/.test(d.acao)) { ir(e, console_(d.para, cor + d.acao.slice(0, 6))); e.tarefa = true }
      else if (d.de !== d.para || /^ir para|^continuar/.test(d.acao)) ir(e, spot(d.para, cor, t % 2))
      else if (!e.rota.length && dist(e.pos, spot(d.para, cor)) > 400) ir(e, spot(d.para, cor));
    }
    // duração do tique: o tempo que a maioria leva pra chegar (entre 2,5 s e 4,5 s); quem passar disso continua andando depois
    const tempos = CORES.filter((c) => st[c].vivo && st[c].rota.length).map((c) => comprimento(st[c]) / VEL).sort((a, b) => a - b);
    const mediana = tempos.length ? tempos[Math.floor(tempos.length * 0.6)] : 0;
    const dur = Math.round(Math.min(4.5 * FPS, Math.max(2.5 * FPS, mediana * 1.1)));
    // momentos dos eventos dentro do tique
    const momento = (frac: number) => f + Math.round(dur * frac);
    const mortes = ev.filter((e) => e.tipo === 'morte' || e.tipo === 'xerife');
    // telas de vigilância (câmeras / mapa do Admin / sinais vitais): abrem quando o jogador chega no console e
    // ficam abertas até o fim do tique; se ele continua olhando no tique seguinte, a tela não fecha
    for (const cor of CORES) {
      const d = dec[cor];
      const tipo = d && ({'olhar as câmeras': 'cameras', 'olhar o mapa do Admin': 'admin', 'ver sinais vitais': 'vitais'} as Record<string, string>)[d.acao];
      if (!tipo || !st[cor].vivo) continue;
      const ant = eventos.find((x) => x.tipo === 'monitor' && x.cor === cor && x.subtipo === tipo && x.ate === f);
      if (ant) ant.ate = f + dur;
      else eventos.push({quadro: f + Math.min(dur - 20, Math.round(comprimento(st[cor]) / VEL) + 8), ate: f + dur, tipo: 'monitor', subtipo: tipo, tique: t, cor});
    }
    const feitos = new Set<any>();
    for (let k = 0; k < dur; k++) {
      // dutos: some no duto na metade, aparece no outro
      for (const cor of Object.keys(dutoDe)) {
        const e = st[cor];
        if (k === Math.round(dur * 0.55) && e.vivo) {
          const v = S(dutoDe[cor].para).duto;
          eventos.push({quadro: f, tipo: 'duto', tique: t, cor, de: dutoDe[cor].de, para: dutoDe[cor].para, x: e.pos.x, y: e.pos.y});
          if (v) { e.pos = v; e.rota = [] }
        }
      }
      // assassino vai até a vítima; a facada sai quando chega perto (ou aos 60% do tique, aí ele salta até ela, como no jogo)
      for (const m of mortes) {
        if (feitos.has(m)) continue;
        const a = st[m.tipo === 'morte' ? m.assassino : m.xerife];
        const v = st[m.tipo === 'morte' ? m.vitima : m.alvo];
        if (!a?.vivo || !v?.vivo) continue;
        // vai até a vítima pelo caminho de verdade (recalculado a cada 6 quadros, porque a vítima também anda)
        const lado = (q: Pt) => {
          for (const s of [a.pos.x < v.pos.x ? -1 : 1, a.pos.x < v.pos.x ? 1 : -1]) { const p = {x: q.x + ALCANCE * s, y: q.y}; if (andavel(p)) return p }
          return {x: q.x, y: q.y};
        };
        if (k > dur * 0.15 && (k % 6 === 0 || !a.rota.length)) a.rota = caminho(a.pos, lado(v.pos)).slice(1);
        if ((dist(a.pos, v.pos) <= ALCANCE + 4 && k > dur * 0.2) || k >= Math.round(dur * 0.6)) {
          feitos.add(m);
          a.pos = lado(v.pos);
          a.rota = [];
          a.dir = v.pos.x > a.pos.x ? 1 : -1;
          const morto = m.tipo === 'morte' ? m.vitima : m.acertou ? m.alvo : m.xerife;
          const quem = st[morto];
          quem.vivo = false;
          corposVivos.push({cor: morto, x: quem.pos.x, y: quem.pos.y, desde: f, ate: Infinity});
          eventos.push({quadro: f, ...m, x: quem.pos.x, y: quem.pos.y});
        }
      }
      // limpeza do Faxineiro: arrasta o corpo (some aos poucos)
      for (const e of ev.filter((x) => x.tipo === 'limpeza')) {
        if (k !== Math.round(dur * 0.5)) continue;
        const c = corposVivos.find((c) => c.cor === e.corpo && c.ate === Infinity);
        if (c) { c.limpo = f; c.ate = f + 45; eventos.push({quadro: f, ...e, x: c.x, y: c.y}) }
      }
      // outros eventos (poderes, sabotagem, conserto, escudo, transformação, invisível): no meio do tique
      if (k === Math.round(dur * 0.5)) {
        for (const e of ev) {
          if (['morte', 'xerife', 'duto', 'limpeza'].includes(e.tipo)) continue;
          eventos.push({quadro: f, ...e});
          if (e.tipo === 'sabotagem') sab = e.subtipo ?? null;
          if (e.tipo === 'conserto') sab = null;
        }
      }
      for (const cor of CORES) {
        const e = st[cor];
        if (e.vivo) anda(e, e.rota.length && comprimento(e) > VEL * (dur - k) * 1.6 ? VEL * 1.25 : VEL);
      }
      // grava o quadro
      const est = tq?.estado;
      for (let i = 0; i < N; i++) {
        const cor = CORES[i];
        const e = st[cor];
        const inv = p.eventos.some((x) => x.tipo === 'invisivel' && x.cor === cor && (x.tique < t || (x.tique === t && k >= dur * 0.5)) && t < x.ate);
        const ap = est?.jogadores.find((j) => j.cor === cor)?.aparente ?? cor;
        const transf = p.eventos.find((x) => x.tipo === 'transformacao' && x.cor === cor && x.tique === t);
        const aparente = transf && k < dur * 0.5 ? p.tiques[t - 1]?.estado?.jogadores.find((j) => j.cor === cor)?.aparente ?? cor : ap;
        buf[i].push(e.pos.x, e.pos.y, (e.vivo ? 1 : 0) | (e.rota.length ? 2 : 0) | (e.dir < 0 ? 4 : 0) | (e.tarefa && !e.rota.length ? 8 : 0) | (inv ? 16 : 0), CORES.indexOf(aparente));
      }
      const tqE = tq?.estado;
      tarefasQ.push(tqE ? tqE.tarefas / tqE.totalTarefas : tarefasQ[tarefasQ.length - 1] ?? 0);
      sabQ.push(sab);
      f++;
    }
    inicioTique[t + 1] = f;
    // reunião no fim do tique: corpos somem, todo mundo volta pra mesa
    const r = p.reunioes.findIndex((x) => x.tique === t);
    if (r >= 0) {
      reunioes.push({quadro: f, tique: t, idx: r});
      for (const c of corposVivos) if (c.ate === Infinity) c.ate = f;
      const ex = p.reunioes[r].expulso;
      if (ex) st[ex].vivo = false;
      for (const cor of CORES) if (st[cor].vivo) { st[cor].pos = assento(cor); st[cor].rota = []; st[cor].tarefa = false }
      sab = null;
    }
  }

  const total = f;
  const sim: Sim = {
    total,
    inicioTique,
    eventos,
    reunioes,
    q: (cor, fr) => {
      const i = idx(cor);
      const k = Math.max(0, Math.min(total - 1, Math.floor(fr)));
      const b = buf[i];
      const fl = b[k * 4 + 2];
      if (!(fl & 1)) return null;
      return {x: b[k * 4], y: b[k * 4 + 1], vivo: true, andando: !!(fl & 2), dir: fl & 4 ? -1 : 1, tarefa: !!(fl & 8), alpha: fl & 16 ? 0.28 : 1, aparente: CORES[b[k * 4 + 3]] ?? cor, escala: 1};
    },
    corpos: (fr) => corposVivos.filter((c) => fr >= c.desde && fr < c.ate).map((c) => ({cor: c.cor, x: c.x, y: c.y, arrasto: c.limpo !== undefined && fr >= c.limpo ? (fr - c.limpo) / 45 : undefined})),
    tarefas: (fr) => tarefasQ[Math.max(0, Math.min(tarefasQ.length - 1, Math.floor(fr)))] ?? 0,
    sabotagem: (fr) => sabQ[Math.max(0, Math.min(sabQ.length - 1, Math.floor(fr)))] ?? null,
  };
  cache.set(p, sim);
  return sim;
}
