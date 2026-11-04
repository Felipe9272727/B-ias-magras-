// AGE DAS IAs: o mapa da partida de 0 A.D. desenhado com sprites 3D pré-renderizados no Blender (age/blender), no
// mesmo esquema do Overcooked: câmera ortográfica a 52 graus, chão achatado por sin(52), peças ordenadas de trás
// para frente. Posições reais da partida (quadros.jsonl a cada 2 s de jogo), interpoladas entre quadros.
// Sem sprite (ainda não renderizado), a peça vira uma forma simples na cor do jogador.
import React from 'react';
import {Img, staticFile} from 'remotion';

export type Ent = [number, number, string, number, number, number, string]; // id, dono, modelo, x, z, vida, estado
export type Quadro = {t: number; ents: Ent[]; jogadores: {fase: string; rec: Record<string, number>; pop: number; lim: number; estado: string}[]};
export type Recurso = [number, number, string];
type Meta = {w: number; h: number; ancora: [number, number]};
export type Pecas = {px_m: number; px_m_unidades?: number; pecas: Record<string, Meta>};

export const CORES_J = ['#888', '#dc2828', '#285ae6', '#f0c81e', '#28aa3c', '#963cc8', '#f0821e'];
export const NOME_COR = ['', 'vermelho', 'azul', 'amarelo', 'verde', 'roxo', 'laranja'];
const SIN = Math.sin((52 * Math.PI) / 180);

export function pecaDe(modelo: string, dono: number): {nome: string; unidade: boolean; tam: number} | null {
  const m = modelo.replace('foundation|', '');
  const fund = modelo.startsWith('foundation|');
  const cor = NOME_COR[dono];
  if (dono === 0) {
    if (modelo.includes('fauna')) return {nome: 'cervo', unidade: true, tam: 2};
    if (modelo.includes('tree')) {
      const k = modelo.includes('pine') ? 2 : modelo.includes('maple') ? 3 : 1;
      return {nome: `arvore${k}`, unidade: false, tam: 6};
    }
    if (modelo.includes('fruit')) return {nome: 'arbusto_frutas', unidade: false, tam: 3};
    if (modelo.includes('rock')) return {nome: 'pedra', unidade: false, tam: 5};
    if (modelo.includes('ore')) return {nome: 'metal', unidade: false, tam: 5};
    return null;
  }
  if (fund) return {nome: 'fundacao', unidade: false, tam: 10};
  const P: Record<string, [string, number]> = {civil_centre: ['centro_cidade', 22], house: ['casa', 8], barracks: ['quartel', 16], stable: ['estabulo', 15], defense_tower: ['torre', 6],
    sentry_tower: ['torre', 5], field: ['fazenda', 14], forge: ['ferreiro', 12], temple: ['templo', 16], market: ['mercado', 16], fortress: ['fortaleza', 30], wonder: ['maravilha', 34],
    storehouse: ['casa', 7], farmstead: ['casa', 8], outpost: ['torre', 4], corral: ['estabulo', 12], range: ['quartel', 14], arsenal: ['quartel', 16], dock: ['casa', 10]};
  for (const [k, [n, t]] of Object.entries(P)) if (m.endsWith(k) || m.includes(k + '_')) return {nome: `${n}_${cor}`, unidade: false, tam: t};
  if (m.includes('female_citizen')) return {nome: `aldeao_${cor}`, unidade: true, tam: 1.7};
  if (m.includes('cavalry')) return {nome: `cavaleiro_${cor}`, unidade: true, tam: 2.4};
  if (m.includes('slinger') || m.includes('javelin') || m.includes('archer')) return {nome: `atirador_${cor}`, unidade: true, tam: 1.8};
  if (m.includes('infantry') || m.includes('champion') || m.includes('hero')) return {nome: `lanceiro_${cor}`, unidade: true, tam: 1.8};
  if (m.includes('war_dog')) return {nome: `cervo`, unidade: true, tam: 1.2};
  return null;
}

// posição de cada entidade no tempo t (ms de jogo), interpolando entre os dois quadros vizinhos
export function entsEm(qs: Quadro[], t: number): {e: Ent; x: number; z: number; anda: boolean; morreu: boolean}[] {
  if (!qs.length) return [];
  let i = 0;
  while (i < qs.length - 1 && qs[i + 1].t <= t) i++;
  const a = qs[i];
  const b = qs[Math.min(i + 1, qs.length - 1)];
  const k = b.t > a.t ? Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t))) : 0;
  const pb = new Map(b.ents.map((e) => [e[0], e]));
  return a.ents.map((e) => {
    const f = pb.get(e[0]);
    if (!f) return {e, x: e[3], z: e[4], anda: false, morreu: k > 0.5};
    const dx = f[3] - e[3];
    const dz = f[4] - e[4];
    return {e, x: e[3] + dx * k, z: e[4] + dz * k, anda: Math.abs(dx) + Math.abs(dz) > 1.5, morreu: false};
  });
}

export const Mapa: React.FC<{qs: Quadro[]; recursos: Recurso[]; pecas: Pecas | null; t: number; cx: number; cz: number; zoom?: number; w?: number; h?: number; f: number}> = ({qs, recursos, pecas, t, cx, cz, zoom = 1, w = 1920, h = 1080, f}) => {
  const pxm = (pecas?.px_m ?? 8) * zoom;
  const pxu = (pecas?.px_m_unidades ?? pecas?.px_m ?? 8) * zoom;
  const larg = w / pxm / 2 + 40;
  const alt = h / (pxm * SIN) / 2 + 40;
  const tela = (x: number, z: number) => [w / 2 + (x - cx) * pxm, h / 2 - (z - cz) * pxm * SIN];
  const itens: {y: number; el: React.ReactNode}[] = [];
  const dentro = (x: number, z: number) => Math.abs(x - cx) < larg && Math.abs(z - cz) < alt;
  recursos.forEach(([x, z, m], i) => {
    if (!dentro(x, z)) return;
    const p = pecaDe(m, 0);
    if (!p) return;
    const [sx, sy] = tela(x, z);
    itens.push({y: sy, el: <Peca key={`r${i}`} nome={p.nome} tam={p.tam} sx={sx} sy={sy} px={pxm} pecas={pecas} cor="#2d6b2d" />});
  });
  for (const {e, x, z, anda, morreu} of entsEm(qs, t)) {
    if (!dentro(x, z) || (e[1] === 0 && !e[2].includes('fauna'))) continue;
    const p = pecaDe(e[2], e[1]);
    if (!p) continue;
    const [sx, sy] = tela(x, z);
    const combate = e[6].includes('COMBAT') || e[6].includes('ATTACK');
    let nome = p.nome;
    if (p.unidade && e[1] > 0) {
      const [base, cor] = [nome.slice(0, nome.lastIndexOf('_')), nome.slice(nome.lastIndexOf('_') + 1)];
      nome = combate ? `${base}_atacar_${cor}` : `${base}_andar${anda && Math.floor(f / 4 + e[0]) % 2 ? 2 : 1}_${cor}`;
    }
    itens.push({y: sy, el: <Peca key={`e${e[0]}`} nome={nome} tam={p.tam} sx={sx} sy={sy} px={p.unidade ? pxu : pxm} pecas={pecas} cor={CORES_J[e[1]]} unidade={p.unidade} sumindo={morreu} />});
  }
  itens.sort((a, b) => a.y - b.y);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 40%, #7fae4a 0%, #6a9a3c 55%, #557f30 100%)'}}>
      <Chao cx={cx} cz={cz} pxm={pxm} w={w} h={h} />
      {itens.map((i) => i.el)}
    </div>
  );
};

// chão de grama com manchas de terra (fixas no mundo, andam com a câmera)
const Chao: React.FC<{cx: number; cz: number; pxm: number; w: number; h: number}> = ({cx, cz, pxm, w, h}) => {
  const manchas: React.ReactNode[] = [];
  const passo = 36;
  const x0 = Math.floor((cx - w / pxm / 2) / passo) - 1;
  const x1 = Math.ceil((cx + w / pxm / 2) / passo) + 1;
  const z0 = Math.floor((cz - h / (pxm * SIN) / 2) / passo) - 1;
  const z1 = Math.ceil((cz + h / (pxm * SIN) / 2) / passo) + 1;
  for (let i = x0; i <= x1; i++)
    for (let j = z0; j <= z1; j++) {
      const r = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1;
      const r2 = Math.abs(Math.sin(i * 39.3468 + j * 11.135) * 24634.6345) % 1;
      const x = w / 2 + (i * passo + r * passo - cx) * pxm;
      const y = h / 2 - (j * passo + r2 * passo - cz) * pxm * SIN;
      const tam = (8 + r * 22) * pxm;
      manchas.push(<div key={`${i}_${j}`} style={{position: 'absolute', left: x - tam / 2, top: y - (tam * SIN) / 2, width: tam, height: tam * SIN, borderRadius: '50%',
        background: r2 > 0.82 ? 'radial-gradient(#b39a62cc, #b39a6200 70%)' : r2 > 0.5 ? 'radial-gradient(#8fbf55aa, #8fbf5500 70%)' : 'radial-gradient(#4f7a2b88, #4f7a2b00 70%)'}} />);
    }
  return <>{manchas}</>;
};

const Peca: React.FC<{nome: string; tam: number; sx: number; sy: number; px: number; pecas: Pecas | null; cor: string; unidade?: boolean; sumindo?: boolean}> = ({nome, tam, sx, sy, px, pecas, cor, unidade, sumindo}) => {
  const meta = pecas?.pecas?.[nome];
  const op = sumindo ? 0.4 : 1;
  if (meta) {
    const esc = px / ((unidade ? pecas?.px_m_unidades : undefined) ?? pecas!.px_m);
    return <Img src={staticFile(`age/pecas/${nome}.png`)} style={{position: 'absolute', left: sx - meta.ancora[0] * esc, top: sy - meta.ancora[1] * esc, width: meta.w * esc, height: meta.h * esc, opacity: op}} />;
  }
  // sem sprite: forma simples
  const r = Math.max(3, tam * px * 0.5);
  if (unidade) return <div style={{position: 'absolute', left: sx - r * 0.4, top: sy - r * 1.6, width: r * 0.8, height: r * 1.6, borderRadius: r, background: cor, border: '2px solid #0008', opacity: op}} />;
  return <div style={{position: 'absolute', left: sx - r, top: sy - r * 1.3, width: r * 2, height: r * 1.3, borderRadius: 6, background: cor, border: '3px solid #0006', opacity: op}} />;
};
