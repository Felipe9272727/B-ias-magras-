// Tipos e utilitários para ler o log de uma partida (amongus/jogo.mjs).
export type Decisao = {cor: string; acao: string; pensamento: string; de: string; para: string};
export type EstadoJog = {cor: string; sala: string; vivo: boolean; ejetado: boolean; aparente: string};
export type Tique = {
  tique: number;
  decisoes: Decisao[];
  estado: {jogadores: EstadoJog[]; corpos: {cor: string; sala: string; tique: number}[]; sabotagem: {tipo: string; desde: number} | null; tarefas: number; totalTarefas: number} | null;
};
export type Fala = {cor: string; rodada: number; texto: string; pensamento: string};
export type Reuniao = {
  tique: number;
  tipo: 'corpo' | 'emergencia';
  chamador: string;
  corpo?: string;
  sala: string;
  falas: Fala[];
  votos: Record<string, string>;
  pensamentosVoto?: Record<string, string>;
  expulso: string | null;
  eraImpostor?: boolean;
  empate: boolean;
};
export type Evento = {tique: number; tipo: string; [k: string]: any};
export type Partida = {
  seed: number;
  salas: Record<string, {x: number; y: number; nome: string}>;
  jogadores: {cor: string; papel: string; time: 'impostor' | 'tripulante'; modelo: string; provider: string}[];
  tiques: Tique[];
  reunioes: Reuniao[];
  eventos: Evento[];
  resultado: {time: string; motivo: string; tique: number};
};

export const ORDEM = ['Vermelho', 'Azul', 'Verde', 'Rosa', 'Laranja', 'Amarelo', 'Preto', 'Branco'];

// Sala de cada jogador ao FIM do tique t (antes de uma eventual reunião). Mortos: null.
export function salasNoTique(p: Partida, t: number): Record<string, {sala: string; vivo: boolean; aparente: string} | null> {
  const out: Record<string, {sala: string; vivo: boolean; aparente: string} | null> = {};
  const tq = p.tiques[t];
  for (const cor of ORDEM) {
    const d = tq?.decisoes.find((x) => x.cor === cor);
    const e = tq?.estado?.jogadores.find((x) => x.cor === cor);
    const morteAqui = p.eventos.find((ev) => ev.tipo === 'morte' && ev.vitima === cor && ev.tique <= t);
    const ejetado = p.reunioes.find((r) => r.expulso === cor && r.tique < t);
    if (morteAqui || ejetado) { out[cor] = null; continue }
    if (d) out[cor] = {sala: d.para, vivo: true, aparente: e?.aparente ?? cor};
    else if (e) out[cor] = {sala: e.sala, vivo: e.vivo, aparente: e.aparente};
    else out[cor] = t > 0 ? salasNoTique(p, t - 1)[cor] : {sala: 'Refeitorio', vivo: true, aparente: cor};
  }
  return out;
}

// Corpos visíveis ao fim do tique t: mortes ainda não "limpas" por uma reunião
export function corposNoTique(p: Partida, t: number) {
  return p.eventos
    .filter((ev) => ev.tipo === 'morte' && ev.tique <= t)
    .filter((ev) => !p.reunioes.some((r) => r.tique >= ev.tique && r.tique < t))
    .map((ev) => ({cor: ev.vitima as string, sala: ev.sala as string, tique: ev.tique as number}));
}

export const papelDe = (p: Partida, cor: string) => p.jogadores.find((j) => j.cor === cor)!;
export const siglaModelo = (m: string) => (m.includes('DeepSeek') ? 'DeepSeek' : 'Haiku');
