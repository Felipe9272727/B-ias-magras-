// Among Us 3: simulação em tempo real do log de uma partida (amongus/jogo3.mjs).
// Diferença para o AU2: o motor já guarda o PONTO de cada jogador dentro da sala em todo tique (é com ele que o motor
// calcula o campo de visão), então aqui cada um anda até exatamente esse ponto, em velocidade constante.
// Ninguém teleporta: no duto o jogador anda até a entrada antes de sumir; na facada o assassino corre até a vítima
// (o tique espera ele chegar); a volta à mesa do Refeitório só acontece depois de uma reunião (a cena corta antes).
// As rotas desviam dos objetos da sala (nave/obstaculos3.ts), testando os pés de cada um.
// Resultado: posição de cada jogador em cada quadro (30 fps), mais os eventos com o quadro em que acontecem.
import {NAVE, salaEm} from '../amongus/nave/mapa';
import {caminho3 as caminho, livre3, soltar} from '../amongus/nave/obstaculos3';
import type {Pt, Sala} from '../amongus/nave/spec';

export const FPS = 30;
export const VEL = 7.5; // px de mundo por quadro
const ALCANCE = 70;

export const CORES = ['Vermelho', 'Azul', 'Verde', 'Rosa', 'Laranja', 'Amarelo', 'Preto', 'Branco', 'Roxo', 'Marrom', 'Ciano', 'Lima', 'Cinza', 'Coral', 'Bordo'];

export type Decisao = {cor: string; acao: string; pensamento: string; de: string; para: string; ponto?: Pt; chat?: string};
type EstadoJ = {cor: string; sala: string; ponto: Pt; vivo: boolean; aparente: string; invisivel?: boolean; time: string; papel: string};
export type Partida2 = {
  partida: number;
  jogadores: {cor: string; papel: string; time: 'impostor' | 'tripulante' | 'neutro'; modelo: string; provider: string; tarefas?: {sala: string; nome: string}[]}[];
  tiques: ({tique: number; decisoes: Decisao[]; estado: {jogadores: EstadoJ[]; tarefas: number; totalTarefas: number; sabotagem: {tipo: string; desde: number; consertos?: string[]} | null; portas?: Record<string, number>; corpos?: any[]} | null} | null)[];
  reunioes: {tique: number; subtipo?: string; tipo?: string; chamador: string; corpo?: string; sala: string; falas: {cor: string; rodada: number; texto: string; pensamento: string}[]; votos: Record<string, string>; pensamentosVoto?: Record<string, string>; expulso: string | null; eraImpostor?: boolean; papelExpulso?: string; empate: boolean; anulada?: any}[];
  eventos: {tique: number; tipo: string; [k: string]: any}[];
  fotos?: any[];
  chatImpostores?: {tique: number; cor: string; texto: string}[];
  resultado: {time: string; motivo: string; tique: number};
  palhaco?: any;
  memoria?: {resumo: string; reflexoes: Record<string, string>};
};

export type Q = {x: number; y: number; andando: boolean; dir: number; alpha: number; tarefa: boolean; aparente: string; vivo: boolean; escala: number};
export type EvQ = {quadro: number; tipo: string; tique: number; [k: string]: any};
export type Sim = {
  total: number;
  inicioTique: number[];
  q: (cor: string, f: number) => Q | null;
  eventos: EvQ[];
  // causa: faca, tiro, bomba, fogo, casal, veneno (AU4); modo/k: o Glutão engolindo (devorado) ou o Canibal comendo (comido), k de 0 a 1
  corpos: (f: number) => {cor: string; x: number; y: number; arrasto?: number; desde: number; causa?: string; modo?: 'devorado' | 'comido'; k?: number; por?: string}[];
  reunioes: {quadro: number; tique: number; idx: number}[];
  tarefas: (f: number) => number;
  sabotagem: (f: number) => string | null;
  portas: (f: number) => string[]; // salas com as portas trancadas
  envenenados: (f: number) => string[];
  tique: (f: number) => number;
};

const S = (k: string) => NAVE.salas[k as Sala];
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const idx = (cor: string) => CORES.indexOf(cor);

// mesma conta do motor (jogo3.mjs): lugar de cada cor em volta da mesa do botão
function assento(cor: string): Pt {
  const r = S('Refeitorio').rect;
  const a = (idx(cor) / CORES.length) * Math.PI * 2;
  const p = {x: Math.round(r.c * 48 + (r.w * 48) / 2 + Math.cos(a) * 230), y: Math.round(r.r * 48 + (r.h * 48) / 2 + Math.sin(a) * 150)};
  return soltar(livre3(p) ? p : {x: r.c * 48 + (r.w * 48) / 2, y: r.r * 48 + (r.h * 48) / 2});
}
// dois jogadores no mesmo ponto (o motor tem 8 pontos por sala e 15 jogadores): o segundo fica ao lado
function afastar(p: Pt, ocupados: Pt[]): Pt {
  if (!ocupados.some((o) => dist(o, p) < 40)) return soltar(p);
  for (const [dx, dy] of [[62, 0], [-62, 0], [0, 54], [62, 54], [-62, 54], [0, -54], [124, 0], [-124, 0]]) {
    const q = {x: p.x + dx, y: p.y + dy};
    if (livre3(q) && salaEm(q) === salaEm(p) && !ocupados.some((o) => dist(o, q) < 40)) return q;
  }
  return soltar(p);
}

type Estado = {pos: Pt; rota: Pt[]; vivo: boolean; dir: number; tarefa: boolean};
const cache = new Map<Partida2, Sim>();

export function simular(p: Partida2): Sim {
  const c = cache.get(p);
  if (c) return c;
  const T = p.resultado?.tique ?? p.tiques.length - 1;
  const st: Record<string, Estado> = {};
  for (const cor of CORES) st[cor] = {pos: assento(cor), rota: [], vivo: true, dir: 1, tarefa: false};
  const N = CORES.length;
  const buf: number[][] = CORES.map(() => []);
  const eventos: EvQ[] = [];
  const reunioes: Sim['reunioes'] = [];
  const inicioTique: number[] = [0, 0];
  const corposVivos: {cor: string; x: number; y: number; desde: number; ate: number; limpo?: number; causa?: string; devorado?: boolean; por?: string; comido?: number}[] = [];
  // AU4: quem morre no meio do tique por bomba, fogo ou casal (o retrato do estado é tirado antes da reunião)
  const matar = (cor: string, causa: string) => {
    const v = st[cor];
    if (!v?.vivo) return null;
    v.vivo = false; v.rota = [];
    envenenados.delete(cor);
    corposVivos.push({cor, x: v.pos.x, y: v.pos.y, desde: f, ate: Infinity, causa});
    return v.pos;
  };
  const tarefasQ: number[] = [];
  const sabQ: (string | null)[] = [];
  const portasQ: string[][] = [];
  const venenoQ: string[][] = [];
  const tiqueQ: number[] = [];
  let f = 0;
  let sab: string | null = null;
  const envenenados = new Set<string>();

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
  };
  const comprimento = (e: Estado) => e.rota.reduce((s, q, i) => s + dist(i ? e.rota[i - 1] : e.pos, q), 0);

  for (let t = 1; t <= T; t++) {
    const tq = p.tiques[t];
    const est = tq?.estado;
    const dec: Record<string, Decisao> = {};
    for (const d of tq?.decisoes ?? []) dec[d.cor] = d;
    const ev = p.eventos.filter((e) => e.tique === t);
    const dutoDe: Record<string, any> = {};
    for (const e of ev) if (e.tipo === 'duto') dutoDe[e.cor] = e;
    // AU4: quem já está morto no retrato deste tique sem uma morte animada nele (expulso, Casal ou Apostador na reunião
    // anterior) sai de cena em silêncio; antes, o simulador do AU3 deixava essa gente andando
    // no tique da reunião o retrato já é de depois dela: as mortes da reunião (expulso, Casal, Apostador) só valem depois do corte
    const tiqueDeReuniao = p.reunioes.some((r) => r.tique === t);
    const estAntes = tiqueDeReuniao ? p.tiques[t - 1]?.estado : est;
    const mortoNoTique = (cor: string) => est?.jogadores.some((j) => j.cor === cor && !j.vivo) ?? false;
    const animadas = new Set<string>();
    for (const e of ev) {
      const cs = e.tipo === 'morte' || e.tipo === 'morte_veneno' || e.tipo === 'casal_morre' ? [e.vitima] : e.tipo === 'xerife' ? [e.acertou ? e.alvo : e.xerife] : e.tipo === 'bomba' || e.tipo === 'incendio' ? e.mortos ?? [] : [];
      for (const c of cs) if (mortoNoTique(c) && !(tiqueDeReuniao && e.tipo === 'casal_morre')) animadas.add(c);
    }
    for (const j of estAntes?.jogadores ?? []) if (!j.vivo && st[j.cor]?.vivo && !animadas.has(j.cor)) { st[j.cor].vivo = false; st[j.cor].rota = [] }
    // destino de cada um: o ponto do motor no fim do tique
    const ocupados: Pt[] = [];
    for (const cor of CORES) {
      const e = st[cor];
      if (!e.vivo) continue;
      const ej = est?.jogadores.find((j) => j.cor === cor);
      const d = dec[cor];
      e.tarefa = !!d && (/^fazer tarefa|^fingir|^consertar|^olhar|^ver sinais/.test(d.acao));
      if (dutoDe[cor]) { const v = S(dutoDe[cor].de).duto; if (v) ir(e, v); continue }
      // o Canibal vai até o corpo como ele está no vídeo (o motor manda para o ponto do corpo no motor)
      const come = ev.find((x) => x.tipo === 'canibal_come' && x.cor === cor);
      const corpo = come && corposVivos.find((c) => c.cor === come.corpo && c.ate === Infinity);
      if (corpo) { const lado = {x: corpo.x + 55, y: corpo.y}; ir(e, livre3(lado) ? lado : soltar(lado)); continue }
      if (!ej?.ponto) continue;
      const alvo = afastar(ej.ponto, ocupados);
      ocupados.push(alvo);
      ir(e, alvo);
    }
    const tempos = CORES.filter((c) => st[c].vivo && st[c].rota.length).map((c) => comprimento(st[c]) / VEL).sort((a, b) => a - b);
    const mediana = tempos.length ? tempos[Math.floor(tempos.length * 0.6)] : 0;
    const dur = Math.round(Math.min(4.5 * FPS, Math.max(2.5 * FPS, mediana * 1.1)));
    const mortes = ev.filter((e) => e.tipo === 'morte' || e.tipo === 'xerife');
    // telas de vigilância (também as do Segurança e do Cientista, de qualquer lugar)
    for (const cor of CORES) {
      const d = dec[cor];
      const tipo = d && ({'olhar as câmeras': 'cameras', 'olhar as câmeras de qualquer lugar': 'cameras', 'olhar o mapa do Admin': 'admin', 'ver sinais vitais': 'vitais'} as Record<string, string>)[d.acao];
      if (!tipo || !st[cor].vivo) continue;
      const ant = eventos.find((x) => x.tipo === 'monitor' && x.cor === cor && x.subtipo === tipo && x.ate === f);
      if (ant) ant.ate = f + dur;
      else eventos.push({quadro: f + Math.min(dur - 20, Math.round(comprimento(st[cor]) / VEL) + 8), ate: f + dur, tipo: 'monitor', subtipo: tipo, tique: t, cor});
    }
    // chat dos impostores deste tique
    // (no meio do tique, depois das jogadas: a mensagem muitas vezes conta o que acabou de acontecer)
    const inicioDoTique = f;
    const portasT = Object.entries(est?.portas ?? {}).filter(([, ate]) => ate > t).map(([s]) => s);
    const novasPortas = ev.filter((e) => e.tipo === 'portas').map((e) => e.sala as string);
    const feitos = new Set<any>();
    const dutosFeitos = new Set<string>();
    const correndo = new Set<string>(); // assassinos correndo atrás da vítima
    const atrasados: any[] = []; // limpeza e alerta esperando a morte acontecer
    // o tique só acaba quando todas as facadas e dutos aconteceram (no máximo 6 s a mais)
    const pendente = () => mortes.some((m) => !feitos.has(m) && st[m.tipo === 'morte' ? m.assassino : m.xerife]?.vivo && st[m.tipo === 'morte' ? m.vitima : m.alvo]?.vivo)
      || Object.keys(dutoDe).some((c) => !dutosFeitos.has(c) && st[c].vivo) || atrasados.length > 0;
    for (let k = 0; k < dur || (pendente() && k < dur + 6 * FPS); k++) {
      const ultimo = k >= dur + 6 * FPS - 1;
      for (const cor of Object.keys(dutoDe)) {
        const e = st[cor];
        if (dutosFeitos.has(cor) || !e.vivo) continue;
        const ent = S(dutoDe[cor].de).duto;
        // entra no duto quando chega na entrada (passada a metade do tique); se a entrada não existe, some onde está
        if (k >= Math.round(dur * 0.45) && (!ent || (dist(e.pos, ent) < 6 && !e.rota.length) || ultimo)) {
          dutosFeitos.add(cor);
          const v = S(dutoDe[cor].para).duto;
          eventos.push({quadro: f, tipo: 'duto', tique: t, cor, de: dutoDe[cor].de, para: dutoDe[cor].para, x: e.pos.x, y: e.pos.y});
          if (v) { e.pos = v; e.rota = [] }
        } else if (ent && !e.rota.length && dist(e.pos, ent) >= 6) ir(e, ent);
      }
      for (const m of mortes) {
        if (feitos.has(m)) continue;
        const a = st[m.tipo === 'morte' ? m.assassino : m.xerife];
        const v = st[m.tipo === 'morte' ? m.vitima : m.alvo];
        if (!a?.vivo || !v?.vivo) continue;
        const lado = (q: Pt) => {
          for (const s of [a.pos.x < v.pos.x ? -1 : 1, a.pos.x < v.pos.x ? 1 : -1]) { const pp = {x: q.x + ALCANCE * s, y: q.y}; if (livre3(pp)) return pp }
          return {x: q.x, y: q.y};
        };
        const cA = m.tipo === 'morte' ? m.assassino : m.xerife;
        if (k > dur * 0.15 && (k % 6 === 0 || !a.rota.length)) { a.rota = caminho(a.pos, lado(v.pos)).slice(1); correndo.add(cA) }
        if ((dist(a.pos, v.pos) <= ALCANCE + 4 && k > dur * 0.2) || ultimo) {
          feitos.add(m);
          correndo.delete(cA);
          if (ultimo) a.pos = lado(v.pos); // nunca acontece nas partidas do vídeo (o teste acusa)
          a.rota = [];
          a.dir = v.pos.x > a.pos.x ? 1 : -1;
          const morto = m.tipo === 'morte' ? m.vitima : m.acertou ? m.alvo : m.xerife;
          const quem = st[morto];
          quem.vivo = false;
          v.rota = [];
          envenenados.delete(morto);
          corposVivos.push({cor: morto, x: quem.pos.x, y: quem.pos.y, desde: f, ate: Infinity, causa: m.tipo === 'xerife' ? 'tiro' : 'faca', devorado: !!m.devorado, por: cA});
          eventos.push({quadro: f, ...m, x: quem.pos.x, y: quem.pos.y, ...(m.tipo === 'xerife' ? {de: {x: a.pos.x, y: a.pos.y}} : {})});
        }
      }
      if (k === Math.round(dur * 0.5)) {
        for (const e of ev) {
          if (['morte', 'xerife', 'duto'].includes(e.tipo)) continue;
          // o corpo some (Faxineiro) e o alerta do Barulhento: só depois que a morte aconteceu (fila de atrasados)
          if (e.tipo === 'limpeza' || e.tipo === 'alerta_barulhento') { atrasados.push(e); continue }
          // o veneno age: a vítima cai onde está, sem ninguém por perto
          if (e.tipo === 'morte_veneno') {
            const v = st[e.vitima];
            if (v?.vivo) {
              v.vivo = false; v.rota = [];
              envenenados.delete(e.vitima);
              corposVivos.push({cor: e.vitima, x: v.pos.x, y: v.pos.y, desde: f, ate: Infinity, causa: 'veneno'});
              eventos.push({quadro: f, ...e, x: v.pos.x, y: v.pos.y});
            }
            continue;
          }
          if (e.tipo === 'bomba' || e.tipo === 'incendio') {
            // a bomba explode em cima do portador; o fogo pega em todo mundo encharcado, cada um onde está
            const centro = st[e.portador ?? e.cor]?.pos;
            const pos = (e.mortos ?? []).filter((c: string) => mortoNoTique(c)).map((c: string) => ({cor: c, ...(matar(c, e.tipo === 'bomba' ? 'bomba' : 'fogo') ?? st[c].pos)}));
            const c0 = centro ?? pos[0] ?? {x: 0, y: 0};
            eventos.push({quadro: f, ...e, x: c0.x, y: c0.y, posMortos: pos});
            continue;
          }
          // o Casal morre logo depois do par (espera a morte do par acontecer no vídeo)
          if (e.tipo === 'casal_morre') { if (animadas.has(e.vitima)) atrasados.push(e); continue }
          if (e.tipo === 'canibal_come') { atrasados.push(e); continue }
          if (e.tipo === 'veneno') envenenados.add(e.vitima);
          const q = e.cor && st[e.cor] ? st[e.cor].pos : undefined;
          eventos.push({quadro: f, ...e, ...(q && e.x === undefined ? {x: q.x, y: q.y} : {})});
          if (e.tipo === 'sabotagem') sab = e.subtipo ?? null;
          if (e.tipo === 'conserto') sab = null;
        }
      }
      for (let i = atrasados.length - 1; i >= 0; i--) {
        const e = atrasados[i];
        const quem = e.tipo === 'limpeza' || e.tipo === 'canibal_come' ? e.corpo : e.vitima;
        const c = corposVivos.find((c) => c.cor === quem && c.ate === Infinity);
        if (e.tipo === 'casal_morre') {
          const par = corposVivos.find((c) => c.cor === e.par);
          if ((par && f >= par.desde + 18) || (!par && !st[e.par]?.vivo) || ultimo) {
            const q = matar(e.vitima, 'casal');
            if (q) eventos.push({quadro: f, ...e, x: q.x, y: q.y});
            atrasados.splice(i, 1);
          }
          continue;
        }
        if (e.tipo === 'canibal_come') {
          // o Canibal come quando chega no corpo (o motor manda ele para o ponto do corpo)
          const can = st[e.cor];
          if (c && (dist(can.pos, c) < 110 || ultimo)) {  // o tique espera ele chegar (como na facada)
            c.comido = f; c.ate = f + 50; c.por = e.cor;
            eventos.push({quadro: f, ...e, x: c.x, y: c.y});
            atrasados.splice(i, 1);
          } else if (!c) atrasados.splice(i, 1);
          continue;
        }
        if (c && f >= c.desde + (e.tipo === 'limpeza' ? 24 : 30)) {
          if (e.tipo === 'limpeza') { c.limpo = f; c.ate = f + 45 }
          eventos.push({quadro: f, ...e, x: c.x, y: c.y, ...(c.devorado ? {devorado: true} : {})});
          atrasados.splice(i, 1);
        } else if (!c && (ultimo || !mortes.some((m) => (m.vitima ?? m.alvo) === quem || m.xerife === quem))) {
          // a morte foi num tique anterior (corpo já no chão desde antes) ou nunca acontece: sai agora
          const c2 = corposVivos.find((c) => c.cor === quem && c.ate === Infinity);
          if (c2 && e.tipo === 'limpeza') { c2.limpo = f; c2.ate = f + 45 }
          eventos.push({quadro: f, ...e, ...(c2 ? {x: c2.x, y: c2.y} : {})});
          atrasados.splice(i, 1);
        }
      }
      for (const cor of CORES) {
        const e = st[cor];
        const resta = Math.max(1, dur - k);
        if (e.vivo) anda(e, correndo.has(cor) ? VEL * 1.7 : e.rota.length && comprimento(e) > VEL * resta * 1.6 ? VEL * 1.25 : VEL);
      }
      for (let i = 0; i < N; i++) {
        const cor = CORES[i];
        const e = st[cor];
        const inv = p.eventos.some((x) => x.tipo === 'invisivel' && x.cor === cor && (x.tique < t || (x.tique === t && k >= dur * 0.5)) && t < x.ate);
        const ap = est?.jogadores.find((j) => j.cor === cor)?.aparente ?? cor;
        const transf = p.eventos.find((x) => x.tipo === 'transformacao' && x.cor === cor && x.tique === t);
        const aparente = transf && k < dur * 0.5 ? p.tiques[t - 1]?.estado?.jogadores.find((j) => j.cor === cor)?.aparente ?? cor : ap;
        buf[i].push(e.pos.x, e.pos.y, (e.vivo ? 1 : 0) | (e.rota.length ? 2 : 0) | (e.dir < 0 ? 4 : 0) | (e.tarefa && !e.rota.length ? 8 : 0) | (inv ? 16 : 0), Math.max(0, CORES.indexOf(aparente)));
      }
      tarefasQ.push(est ? est.tarefas / est.totalTarefas : tarefasQ[tarefasQ.length - 1] ?? 0);
      sabQ.push(sab);
      portasQ.push(portasT.filter((s) => k >= dur * 0.5 || !novasPortas.includes(s)));
      venenoQ.push([...envenenados]);
      tiqueQ.push(t);
      f++;
    }
    // chat (depois das facadas deste tique, que contam o que acabou de acontecer)
    const ultimaMorte = Math.max(-1, ...eventos.filter((e) => e.tique === t && (e.tipo === 'morte' || e.tipo === 'xerife')).map((e) => e.quadro));
    p.chatImpostores?.filter((x) => x.tique === t).forEach((m, i) => eventos.push({quadro: Math.max(inicioDoTique + Math.round(dur * 0.55), ultimaMorte + 12) + 4 + i * 10, tipo: 'chat', tique: t, cor: m.cor, texto: m.texto}));
    inicioTique[t + 1] = f;
    const r = p.reunioes.findIndex((x) => x.tique === t);
    if (r >= 0) {
      reunioes.push({quadro: f, tique: t, idx: r});
      for (const c of corposVivos) if (c.ate === Infinity) c.ate = f;
      const ex = p.reunioes[r].expulso;
      if (ex && st[ex]) st[ex].vivo = false;
      for (const j of est?.jogadores ?? []) if (!j.vivo && st[j.cor]) st[j.cor].vivo = false; // Casal e Apostador da reunião
      for (const cor of CORES) if (st[cor].vivo) { st[cor].pos = assento(cor); st[cor].rota = []; st[cor].tarefa = false }
      sab = null;
    }
  }

  const total = f;
  const em = <T,>(a: T[], fr: number, pad: T) => a[Math.max(0, Math.min(a.length - 1, Math.floor(fr)))] ?? pad;
  const sim: Sim = {
    total,
    inicioTique,
    eventos,
    reunioes,
    q: (cor, fr) => {
      const i = idx(cor);
      if (i < 0) return null;
      const k = Math.max(0, Math.min(total - 1, Math.floor(fr)));
      const b = buf[i];
      const fl = b[k * 4 + 2];
      if (!(fl & 1)) return null;
      return {x: b[k * 4], y: b[k * 4 + 1], vivo: true, andando: !!(fl & 2), dir: fl & 4 ? -1 : 1, tarefa: !!(fl & 8), alpha: fl & 16 ? 0.28 : 1, aparente: CORES[b[k * 4 + 3]] ?? cor, escala: 1};
    },
    corpos: (fr) => corposVivos.filter((c) => fr >= c.desde && fr < c.ate).map((c) => {
      const base = {cor: c.cor, x: c.x, y: c.y, desde: c.desde, causa: c.causa, por: c.por};
      // o Glutão engole na hora da morte (a bocarra começa junto com ela)
      if (c.devorado) return {...base, modo: 'devorado' as const, k: (fr - c.desde) / 45};
      if (c.comido !== undefined && fr >= c.comido) return {...base, modo: 'comido' as const, k: (fr - c.comido) / 50};
      return {...base, arrasto: c.limpo !== undefined && fr >= c.limpo ? (fr - c.limpo) / 45 : undefined};
    }),
    tarefas: (fr) => em(tarefasQ, fr, 0),
    sabotagem: (fr) => em(sabQ, fr, null),
    portas: (fr) => em(portasQ, fr, []),
    envenenados: (fr) => em(venenoQ, fr, []),
    tique: (fr) => em(tiqueQ, fr, 1),
  };
  cache.set(p, sim);
  return sim;
}
