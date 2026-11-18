// TRIBUNAL: tipos da timeline e leitura dos dados reais (public/tribunal/caso.json). Nada inventado: provas, perfis,
// depoimentos, decisões, cadeados e paciência saem daqui.
import type {MemeInfo} from '../components/overlays';

export type CitaO = {tipo: 'cita'; at: number; dur: number; cor: string; tipoCita: string; texto: string; dt: [string, number]; ref: string};
export type SeloO = {tipo: 'selo'; at: number; dur: number; texto: string};
export type MemeO = {tipo: 'meme'; at: number; dur: number; id: string; pos: string; info: MemeInfo};
export type CapO = {tipo: 'capitulo'; at: number; dur: number; titulo: string; sub?: string};
export type Over = CitaO | SeloO | MemeO | CapO;
export type Cena = {id: string; dur: number; visual: {tela?: string; titulo?: string; rodada?: string | null; dia?: number | null}; over: Over[]; audio: {src: string; at: number; vol?: number}[]; musica?: string | null};
export type TL = {cenas: Cena[]};
export type Seg = {at: number; end: number; dur: number};

export type Ev = {i: number; dia: number; tipo: string; cor?: string; fala?: string; declaracoes?: string[]; acao?: string; prova?: string; declaracao?: number; decisao?: string; local?: string; nomeLocal?: string; pessoa?: string; [k: string]: any};

export const mkDados = (d: any) => {
  const ev = (R: string, i: number): Ev | undefined => d?.rodadas?.[R]?.eventos?.[i];
  const evs = (R: string): Ev[] => d?.rodadas?.[R]?.eventos ?? [];
  const caso = d?.caso ?? {};
  const catalogo: Record<string, {id: string; nome: string; desc: string}> = {};
  for (const p of [...(caso.PROVAS ?? []), ...(caso.PERFIS ?? [])]) catalogo[p.id] = p;
  for (const ls of Object.values(caso.LOCAIS ?? {}) as any[]) for (const l of ls) { if (l.prova) catalogo[l.prova.id] = l.prova; }
  for (const c of Object.values(caso.CADEADOS ?? {}) as any[]) if (c.revela) catalogo[c.revela.id] = c.revela;
  const locais: Record<string, string> = {};
  for (const ls of Object.values(caso.LOCAIS ?? {}) as any[]) for (const l of ls) locais[l.id] = l.nome;
  const ficha = (id: string) => ({id, nome: (catalogo[id]?.nome ?? id).replace(/ \(.*\)$/, '')});
  const desc = (id: string) => catalogo[id]?.desc ?? '';
  const ref = (r: string): [string, number] => { const m = /^([SJ])#(\d+)$/.exec(r ?? ''); return m ? [m[1], Number(m[2])] : ['S', 0]; };
  // paciência depois do evento i (penalidade "N de 6"; cadeado aberto devolve uma luz)
  const pac = (R: string, i: number) => {
    let p = 6;
    for (const e of evs(R)) {
      if (e.i > i) break;
      const m = /(\d+) de 6/.exec(e.fala ?? '');
      if (e.tipo === 'penalidade' && m) p = Number(m[1]);
      if (e.tipo === 'cadeado_quebrado') p = Math.min(6, p + 1);
    }
    return p;
  };
  const acao = (R: string, i: number) => { const e = ev(R, i); if (!e) return null; let n = 0; for (const x of evs(R)) { if (x.i > i) break; if (x.dia === e.dia && ['examinar', 'conversar', 'apresentar'].includes(x.tipo)) n++; } return n; };
  const decl = (R: string, i: number): string[] => ev(R, i)?.declaracoes ?? [];
  const declIdx = (R: string, i: number, texto: string) => { const ds = decl(R, i); const t = texto.slice(0, 40); return ds.findIndex((x) => x.includes(t) || texto.includes(x.slice(0, 40))); };
  const conta = (R: string, p: (e: Ev) => boolean) => evs(R).filter(p).length;
  const modelo = (cor: string): string => caso.IAS?.[cor]?.modelo ?? '';
  const res = (R: string) => d?.rodadas?.[R]?.resultado ?? {};
  const novas = (R: string, dia: number) => evs(R).filter((e) => e.tipo === 'nova_prova' && e.dia === dia);
  const exames = (R: string, dia: number) => evs(R).filter((e) => e.tipo === 'examinar' && e.dia === dia);
  const penal = (R: string) => evs(R).filter((e) => e.tipo === 'penalidade');
  const primeiro = (R: string, p: (e: Ev) => boolean) => evs(R).find(p);
  const cadeados = caso.CADEADOS ?? {};
  // a frase do log (fala ou declaração) que contém o termo: para recortes, sempre cópia do log
  const frase = (R: string, i: number, termo: string) => { const e = ev(R, i); const t = [e?.fala ?? '', ...(e?.declaracoes ?? [])].join(' '); const fr = t.split(/(?<=[.!?])\s+/); return fr.find((x) => x.toLowerCase().includes(termo.toLowerCase())) ?? ''; };
  return {frase, d, ev, evs, ficha, desc, ref, pac, acao, decl, declIdx, conta, modelo, res, novas, exames, penal, primeiro, cadeados, locais, caso};
};
export type Dados = ReturnType<typeof mkDados>;

// contexto de cada cena: âncoras tiradas da própria timeline (citações, selos, memes) para o visual seguir as durações
export type X = {f: number; dur: number; t0: number; c: Seg[]; s: Seg[]; m: Seg[]; cita: CitaO[]; selo: SeloO[]; D: Dados; id: string; R: string | null; dia: number | null};
export const mkX = (c: Cena, f: number, D: Dados): X => {
  const sg = (o: {at: number; dur: number}): Seg => ({at: o.at, end: o.at + o.dur, dur: o.dur});
  const cita = c.over.filter((o) => o.tipo === 'cita') as CitaO[];
  const selo = c.over.filter((o) => o.tipo === 'selo') as SeloO[];
  const cap = c.over.find((o) => o.tipo === 'capitulo');
  return {f, dur: c.dur, t0: cap ? cap.at + cap.dur - 6 : 0, c: cita.map(sg), s: selo.map(sg), m: c.over.filter((o) => o.tipo === 'meme').map(sg), cita, selo, D, id: c.id, R: c.visual.rodada ?? null, dia: c.visual.dia ?? null};
};
// segmento k (ou um substituto proporcional, se a timeline nova tiver menos itens)
export const sk = (X: X, arr: Seg[], k: number, fb = 0.5): Seg => arr[k] ?? {at: Math.round(X.dur * fb), end: Math.round(X.dur * fb) + 60, dur: 60};
// quadro em que a palavra w aparece na voz da citação k (proporção do texto)
export const palT = (X: X, k: number, w: string) => {
  const o = X.cita[k]; if (!o) return X.dur * 0.5;
  const n = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const i = n(o.texto).indexOf(n(w));
  return o.at + o.dur * (i < 0 ? 0.5 : i / Math.max(1, o.texto.length));
};
