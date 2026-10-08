// Leitura do log de partida (ilha/logs/*.json) guardado em timeline.data.partidas.
import mapa from '../../public/ilha/mapa.json';
import type {Timeline} from '../types';
import {TRIBUTOS} from './regras';

export type Decisao = {id: string; acao: string; alvo?: string; fala?: string; pensamento?: string};
export type EstadoTrib = {id: string; vivo: boolean; zona: string; vida: number; fome: number; sede: number; itens?: string[]};
export type Evento = {tipo: string; [k: string]: unknown};
export type ZonaTurno = {fogueira?: number; itens?: string[]; inundada?: boolean; nevoa?: boolean; abrigos?: unknown[]};
export type Turno = {
  k: number;
  dia: number;
  periodo: string;
  arena?: unknown[];
  decisoes: Decisao[];
  eventos: Evento[];
  estado: EstadoTrib[];
  zonas: Record<string, ZonaTurno>;
};
export type Partida = {
  meta?: unknown;
  turnos: Turno[];
  fim?: {vencedores?: string[]; motivo?: string; dia?: number; periodo?: string} | null;
};

export type ZonaMapa = {nome: string; centro: [number, number]; pontos: [number, number][]};

export const MAPA_W: number = mapa.largura;
export const MAPA_H: number = mapa.altura;
export const ZONAS = (mapa as unknown as {zonas: Record<string, ZonaMapa>}).zonas;
export const ZONA_INICIAL = 'cornucopia';

export const centroDe = (zona: string): [number, number] => (ZONAS[zona] ?? ZONAS[ZONA_INICIAL]).centro;
export const nomeZona = (zona: string): string => ZONAS[zona]?.nome ?? zona;

export function partidaDe(timeline: Timeline, chave?: string | number | null): Partida | null {
  const ps = ((timeline.data as Record<string, unknown>).partidas ?? {}) as Record<string, Partida>;
  return ps[chave == null ? 'oficial' : String(chave)] ?? ps.oficial ?? Object.values(ps)[0] ?? null;
}

export const turnoDe = (p: Partida, k: number): Turno | null => p.turnos.find((t) => t.k === k) ?? null;

// Estado no fim do turno k. Antes do primeiro turno, todos na Cornucópia.
export function estadoDe(p: Partida, k: number): Map<string, EstadoTrib> {
  const t = p.turnos.filter((x) => x.k <= k).sort((a, b) => b.k - a.k)[0];
  if (t) return new Map(t.estado.map((e) => [e.id, e]));
  return new Map(TRIBUTOS.map((tr) => [tr.id, {id: tr.id, vivo: true, zona: ZONA_INICIAL, vida: 100, fome: 10, sede: 10}]));
}

// Posição (em pixels do mapa 3840x2160) de cada tributo. Vários na mesma zona = círculo em volta do centro.
export function posicoes(estado: Map<string, EstadoTrib>): Record<string, [number, number]> {
  const grupos: Record<string, string[]> = {};
  for (const t of TRIBUTOS) {
    const z = estado.get(t.id)?.zona ?? ZONA_INICIAL;
    (grupos[z] ??= []).push(t.id);
  }
  const out: Record<string, [number, number]> = {};
  for (const [z, ids] of Object.entries(grupos)) {
    const [cx, cy] = centroDe(z);
    const n = ids.length;
    const r = n === 1 ? 0 : 60 + 22 * n;
    ids.forEach((id, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      out[id] = [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    });
  }
  return out;
}

// Eventos de combate do turno, na ordem em que aparecem (ataque/revide/morte).
export const efeitosDo = (t: Turno | null) =>
  (t?.eventos ?? []).filter((e) => e.tipo === 'ataque' || e.tipo === 'revide' || e.tipo === 'morte');

// Último pensamento secreto do tributo, em qualquer turno.
export function ultimoPensamento(p: Partida, id: string): {texto: string; k: number; dia: number; periodo: string} | null {
  for (const t of [...p.turnos].reverse()) {
    const d = t.decisoes.find((x) => x.id === id && x.pensamento);
    if (d?.pensamento) return {texto: d.pensamento, k: t.k, dia: t.dia, periodo: t.periodo};
  }
  return null;
}

// Primeira morte do tributo no log: turno e causa.
export function mortePorId(p: Partida, id: string) {
  for (const t of p.turnos) {
    const ev = t.eventos.find((e) => e.tipo === 'morte' && e.vitima === id);
    if (ev) return {turno: t, causa: String(ev.causa ?? ''), por: (ev.por as string | null) ?? null, zona: String(ev.zona ?? '')};
  }
  return null;
}
