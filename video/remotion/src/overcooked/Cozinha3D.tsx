// A cozinha do Overcooked das IAs montada com sprites 3D pré-renderizados no Blender (overcooked/blender):
// piso, parede, bancadas e estações encaixadas fileira por fileira (as de trás primeiro), itens por cima das
// bancadas, chefs animados por tiras de quadros. Mesma lógica de tempo do Cozinha.tsx (2D).
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from '../theme';
import {Fogo, type Obj} from './Itens';
import {COR_EMPRESA, estadoEm, type LogOC} from './Cozinha';
import PECAS from '../../public/overcooked/pecas/pecas.json';
import CHEFS from '../../public/overcooked/chefs/chefs.json';

const ELEV = (52 * Math.PI) / 180;
const SIN = Math.sin(ELEV);
const COS = Math.cos(ELEV);
const ALT = 0.9;
export const ANDAR = 0.55;
const COZ: Record<string, number> = {panela: 4, frigideira: 3};
const PECA: Record<string, string> = {'#': 'bancada', X: 'bancada', T: 'caixa_tomate', O: 'caixa_cebola', M: 'caixa_cogumelo', A: 'caixa_alface', P: 'caixa_pao', K: 'caixa_carne', B: 'tabua', F: 'fogao', G: 'grelha', D: 'pratos', R: 'retorno', S: 'pia', E: 'entrega', L: 'lixo'};
type Meta = {w: number; h: number; ancora: [number, number]};
const META = PECAS as unknown as {px_m: number; pecas: Record<string, Meta>; itens: Record<string, Meta>};
const CM = CHEFS as unknown as {quadro: [number, number]; px_m: number; pes: [number, number]; anims: Record<string, {n: number; dur: number}>};

const gritando = (s: string) => {
  const l = s.replace(/[^A-Za-zÀ-ú]/g, '');
  return l.length > 6 && l.replace(/[^A-ZÀ-Ý]/g, '').length / l.length > 0.6;
};

// nome do sprite de um item do motor
export function spriteItem(o: Obj | null | undefined): string[] {
  if (!o) return [];
  if (o.tipo === 'ing') {
    const n = o.nome === 'pão' ? 'pao' : o.nome!;
    if (o.grelhado) return ['carne_grelhada'];
    return [o.picado && n !== 'pao' ? `${n}_picado` : n];
  }
  if (o.tipo === 'prato') {
    if (o.sujo) return ['prato_sujo'];
    const c = (o.conteudo ?? []).map(String);
    const sopa = c.find((x) => x.startsWith('sopa'));
    if (sopa) return [`prato_sopa_${sopa.includes('tomate') ? 'tomate' : sopa.includes('cebola') ? 'cebola' : sopa.includes('cogumelo') ? 'cogumelo' : 'misturada'}`];
    const ings = c.map((x) => (x.startsWith('carne grelhada') ? 'carne_grelhada' : x.startsWith('pão') ? 'pao' : `${x.split(' ')[0]}_picado`));
    return ['prato', ...ings];
  }
  if (o.tipo === 'panela') {
    if (o.estado === 'queimada') return ['panela_queimada'];
    const n = (o.conteudo ?? []).map((i: any) => i.nome);
    if (!n.length) return ['panela'];
    const u = new Set(n);
    return [`panela_${u.size === 1 ? n[0] : 'misturada'}`];
  }
  if (o.tipo === 'frigideira') {
    if (o.estado === 'queimada') return ['frigideira_queimada'];
    if (!(o.conteudo ?? []).length) return ['frigideira'];
    return [o.estado === 'pronta' || o.estado === 'queimando' ? 'frigideira_grelhada' : 'frigideira_carne'];
  }
  if (o.tipo === 'extintor') return ['extintor'];
  return [];
}

// um sprite de peça/item colocado pelo ponto de referência (base) em (x, y) da tela
export const Sprite: React.FC<{nome: string; grupo: 'pecas' | 'itens'; x: number; y: number; k: number; z?: number; esc?: number}> = ({nome, grupo, x, y, k, z, esc = 1}) => {
  const m = META[grupo][nome];
  if (!m) return null;
  const s = k * esc;
  return <Img src={staticFile(`overcooked/pecas/${nome}.png`)} style={{position: 'absolute', left: x - m.ancora[0] * s, top: y - m.ancora[1] * s, width: m.w * s, height: m.h * s, zIndex: z}} />;
};

// um chef só (corpo branco) pintado na cor da empresa: a cor é multiplicada só onde a máscara marca o corpo
export const ChefSprite: React.FC<{cor: string; anim: string; dir: number; x: number; y: number; k: number; frame: number; z: number}> = ({cor, anim, dir, x, y, k, frame, z}) => {
  const a = CM.anims[anim] ?? CM.anims.parado;
  const idx = Math.floor((frame / 30) * (a.n / a.dur)) % a.n;
  const [qw, qh] = CM.quadro;
  const s = (k * META.px_m) / CM.px_m;
  const espelho = dir === 270;
  const d = espelho ? 90 : dir;
  const tira = (camada: string) => staticFile(`overcooked/chefs/${camada}/${anim}_${d}.png`);
  const pos = `${-idx * qw * s}px 0px`;
  const tam = `${qw * s * a.n}px ${qh * s}px`;
  return (
    <div style={{position: 'absolute', left: x - CM.pes[0] * s, top: y - CM.pes[1] * s, width: qw * s, height: qh * s, zIndex: z, transform: espelho ? 'scaleX(-1)' : undefined, isolation: 'isolate'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${tira('base')})`, backgroundPosition: pos, backgroundSize: tam}} />
      <div style={{position: 'absolute', inset: 0, background: cor, mixBlendMode: 'multiply', WebkitMaskImage: `url(${tira('mascara')})`, maskImage: `url(${tira('mascara')})`, WebkitMaskPosition: pos, maskPosition: pos, WebkitMaskSize: tam, maskSize: tam, WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat'}} />
    </div>
  );
};

const censura = (s: string) => s.replace(/\b([pP])orra\b/g, '$1*rra').replace(/\bPORRA\b/g, 'P*RRA');

const Balao: React.FC<{txt: string; t: number; idade: number; embaixo?: boolean}> = ({txt: bruto, t, idade, embaixo}) => {
  const txt = censura(bruto);
  const grito = gritando(txt);
  const ap = Math.min(1, idade / 6);
  const tremor = grito ? Math.sin(idade * 1.7) * 3 : 0;
  return (
    <div style={{position: 'absolute', left: -t * 2.1, width: t * 4.2, ...(embaixo ? {top: 0} : {bottom: 0}), display: 'flex', justifyContent: 'center', transform: `scale(${0.6 + 0.4 * ap}) translateX(${tremor}px)`, transformOrigin: embaixo ? '50% 0%' : '50% 100%', opacity: ap}}>
      <div style={{background: grito ? '#fff1a8' : '#fff', border: `${grito ? 5 : 3}px solid ${grito ? '#e01b1b' : '#000'}`, borderRadius: grito ? 8 : 18, padding: `${t * 0.05}px ${t * 0.09}px`, fontFamily: FONT.display, fontWeight: grito ? 900 : 700, fontSize: t * (grito ? 0.19 : 0.16), lineHeight: 1.15, color: '#111', textAlign: 'center', boxShadow: '0 4px 0 #0007'}}>{txt}</div>
    </div>
  );
};

// onde cada casa do mapa cai na tela (a mesma conta do desenho; usada também pelo zoom das cenas)
export const geometria = (mapa: string[], w: number, h: number, hud = true) => {
  const cols = Math.max(...mapa.map((l) => l.length));
  const rows = mapa.length;
  // tamanho da casa: a cozinha (com a parede e a altura das bancadas) cabe na área útil
  const areaH = h * (hud ? 0.8 : 0.94);
  const T = Math.floor(Math.min((w * 0.95) / cols, areaH / (rows * SIN + ALT * COS + 0.9)));
  const D = T * SIN;
  const topo = ALT * T * COS;
  const ox = (w - T * cols) / 2;
  const oy = (hud ? h * 0.17 : h * 0.03) + topo + T * 0.75 + (areaH - (rows * D + topo + T * 0.9)) / 2;
  return {cols, rows, T, D, topo, ox, oy, cx: (x: number) => ox + (x + 0.5) * T, cy: (y: number) => oy + (y + 0.5) * D};
};

// posição de um chef no tempo t (fracionário, em tiques), em casas do mapa
export const posChef = (log: LogOC, cz: number, nome: string, t: number) => {
  const i = Math.max(0, Math.min(Math.floor(t), log.tiques.length - 1));
  const f = Math.max(0, Math.min(1, t - Math.floor(t)));
  const tq = log.tiques[i].cozinhas[cz];
  const q = tq.chefs[nome];
  const cam = q?.caminho?.length ? q.caminho : [tq.estado.chefs.find((x) => x.nome === nome)?.pos ?? {x: 0, y: 0}];
  if (f >= ANDAR || cam.length < 2) return cam[cam.length - 1];
  const u = (f / ANDAR) * (cam.length - 1);
  const a = cam[Math.floor(u)], b = cam[Math.min(cam.length - 1, Math.floor(u) + 1)];
  const r = u - Math.floor(u);
  return {x: a.x + (b.x - a.x) * r, y: a.y + (b.y - a.y) * r};
};

// balão de pensamento (o "pensa" secreto do log): nuvem cinza em itálico
const Nuvem: React.FC<{txt: string; t: number; idade: number}> = ({txt, t, idade}) => {
  const ap = Math.min(1, idade / 8);
  return (
    <div style={{position: 'absolute', left: -t * 2.3, width: t * 4.6, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: ap, transform: `scale(${0.7 + 0.3 * ap})`, transformOrigin: '50% 100%'}}>
      <div style={{background: '#eef1f7', border: '3px solid #5b6577', borderRadius: t * 0.3, padding: `${t * 0.06}px ${t * 0.12}px`, fontFamily: FONT.display, fontStyle: 'italic', fontWeight: 600, fontSize: t * 0.15, lineHeight: 1.18, color: '#2d3442', textAlign: 'center', boxShadow: '0 4px 0 #0005'}}>
        <span style={{fontSize: t * 0.12, fontWeight: 900, color: '#7b5cff', fontStyle: 'normal', marginRight: 6}}>PENSA:</span>{txt}
      </div>
      <div style={{width: t * 0.16, height: t * 0.16, borderRadius: '50%', background: '#eef1f7', border: '3px solid #5b6577', marginTop: 4}} />
      <div style={{width: t * 0.09, height: t * 0.09, borderRadius: '50%', background: '#eef1f7', border: '3px solid #5b6577', marginTop: 3, marginLeft: t * 0.12}} />
    </div>
  );
};

export const Cozinha3D: React.FC<{log: LogOC; cz: number; t: number; w: number; h: number; hud?: boolean; titulo?: boolean; falas?: boolean; pensa?: string[]; so?: string[]; camera?: {s: number; tx: number; ty: number}; Pedidos?: React.FC<any>}> = ({log, cz, t, w, h, hud = true, titulo = true, falas = true, pensa = [], so, camera, Pedidos}) => {
  const frame = useCurrentFrame();
  const mapa = log.mapa;
  const {cols, T, D, topo, ox, cx, cy} = geometria(mapa, w, h, hud);
  const k = T / META.px_m;
  const i = Math.max(0, Math.min(Math.floor(t), log.tiques.length - 1));
  const f = Math.max(0, Math.min(1, t - Math.floor(t)));
  const tq = log.tiques[i].cozinhas[cz];
  const depois = f >= ANDAR || t >= log.tiques.length;
  const est = depois ? tq.estado : estadoEm(log, cz, i - 1) ?? {...tq.estado, chefs: tq.estado.chefs.map((c) => ({...c, obj: null}))};
  const info = log.cozinhas[cz];
  const esc = w / 1920;
  const tilesEst = new Map(est.tiles.map((tl) => [`${tl.x},${tl.y}`, tl]));
  // última direção de cada chef (olhando os tiques anteriores)
  const direcao = (nome: string): number => {
    for (let j = i; j >= Math.max(0, i - 30); j--) {
      const c = log.tiques[j].cozinhas[cz].chefs[nome]?.caminho;
      if (c && c.length > 1) {
        const a = c[c.length - 2], b = c[c.length - 1];
        return b.y > a.y ? 0 : b.y < a.y ? 180 : b.x > a.x ? 90 : 270;
      }
    }
    return 0;
  };
  const els: React.ReactNode[] = [];
  // piso
  mapa.forEach((l, y) => [...l].forEach((ch, x) => {
    if (ch === '.' || /[1-4]/.test(ch)) els.push(<Sprite key={`p${x},${y}`} nome={(x + y) % 2 ? 'piso_a' : 'piso_b'} grupo="pecas" x={cx(x)} y={cy(y)} k={k} z={0} />);
  }));
  // parede atrás da primeira fileira
  for (let x = 0; x < cols; x++) els.push(<Sprite key={`w${x}`} nome="parede" grupo="pecas" x={cx(x)} y={cy(-0.6)} k={k} z={1} />);
  // estações e itens, fileira por fileira
  mapa.forEach((l, y) => [...l].forEach((ch, x) => {
    const p = PECA[ch];
    if (!p) return;
    const z = 10 + y * 10;
    els.push(<Sprite key={`b${x},${y}`} nome={p} grupo="pecas" x={cx(x)} y={cy(y)} k={k} z={z} />);
    const tl = tilesEst.get(`${x},${y}`);
    if (!tl) return;
    const sy = cy(y) - topo - (ch === 'B' ? T * 0.04 : 0);
    if (ch === 'D') for (let n = 0; n < Math.min(5, tl.pratos ?? 0); n++) els.push(<Sprite key={`d${x},${y},${n}`} nome="prato" grupo="itens" x={cx(x)} y={sy - n * T * 0.05} k={k} z={z + 1} />);
    if (ch === 'R' || ch === 'S') for (let n = 0; n < Math.min(5, tl.sujos ?? 0); n++) els.push(<Sprite key={`s${x},${y},${n}`} nome="prato_sujo" grupo="itens" x={cx(x)} y={sy - n * T * 0.05} k={k} z={z + 1} />);
    const sp = spriteItem(tl.obj);
    sp.forEach((n, j) => els.push(<Sprite key={`i${x},${y},${j}`} nome={n} grupo="itens" x={cx(x) + (j ? (j - (sp.length) / 2) * T * 0.16 : 0)} y={sy - (j ? T * 0.04 : 0)} k={k} esc={j ? 0.6 : 1} z={z + 2 + j} />));
    const o = tl.obj;
    const barra = (v: number) => els.push(<div key={`bar${x},${y}`} style={{position: 'absolute', left: cx(x) - T * 0.35, top: sy - T * 0.7, width: T * 0.7, height: T * 0.1, background: '#000b', borderRadius: 5, zIndex: 500}}><div style={{width: `${Math.min(1, v) * 100}%`, height: '100%', background: '#4cd137', borderRadius: 5}} /></div>);
    if ((tl.picando ?? 0) > 0) barra((tl.picando ?? 0) / 2);
    if (o && (o.tipo === 'panela' || o.tipo === 'frigideira') && o.estado === 'cozinhando') barra((o.prog ?? 0) / COZ[o.tipo]);
    const alarme = o?.estado === 'queimando' || (o?.estado === 'pronta' && (o.prog ?? 0) >= COZ[o.tipo] + 2);
    if (alarme && frame % 10 < 6) els.push(<div key={`al${x},${y}`} style={{position: 'absolute', left: cx(x) - T * 0.25, top: sy - T * 1.05, width: T * 0.5, height: T * 0.5, borderRadius: '50%', background: '#e84118', border: '3px solid #fff', color: '#fff', fontFamily: FONT.display, fontWeight: 900, fontSize: T * 0.36, textAlign: 'center', lineHeight: `${T * 0.44}px`, zIndex: 501}}>!</div>);
    if (o && (o.estado === 'cozinhando' || o.estado === 'pronta' || o.estado === 'queimando')) for (let n = 0; n < 3; n++) {
      const u = ((frame + n * 17) % 50) / 50;
      els.push(<div key={`v${x},${y},${n}`} style={{position: 'absolute', left: cx(x) - T * 0.1 + Math.sin(u * 6 + n) * T * 0.12, top: sy - T * 0.3 - u * T * 0.6, width: T * 0.18, height: T * 0.18, borderRadius: '50%', background: o.estado === 'queimando' ? '#3338' : '#fff8', opacity: 1 - u, zIndex: z + 5, filter: 'blur(2px)'}} />);
    }
    if (tl.fogo) els.push(<div key={`f${x},${y}`} style={{position: 'absolute', left: cx(x) - T * 0.45, top: sy - T * 0.85, zIndex: z + 6}}><Fogo s={T * 0.9} frame={frame} seed={x * 3 + y} /></div>);
  }));
  // chefs
  for (const c of info.chefs) {
    const q = tq.chefs[c.nome];
    const cam = q?.caminho?.length ? q.caminho : [est.chefs.find((x) => x.nome === c.nome)?.pos ?? c.inicio];
    const fa = Math.min(1, f / ANDAR);
    const anda = !depois && cam.length > 1;
    let pos = cam[cam.length - 1], dir = direcao(c.nome);
    if (anda) {
      const u = fa * (cam.length - 1);
      const a = cam[Math.floor(u)], b = cam[Math.min(cam.length - 1, Math.floor(u) + 1)];
      const r = u - Math.floor(u);
      pos = {x: a.x + (b.x - a.x) * r, y: a.y + (b.y - a.y) * r};
      dir = b.y > a.y ? 0 : b.y < a.y ? 180 : b.x > a.x ? 90 : b.x < a.x ? 270 : dir;
    }
    const obj = est.chefs.find((x) => x.nome === c.nome)?.obj ?? null;
    const acao = q?.acao ?? '';
    const grita = !!q?.fala && gritando(q.fala) && !anda;
    const anim = anda ? (obj ? 'carregar_andar' : 'andar') : /^picar/.test(acao) && depois ? 'picar' : grita && !obj ? 'panico' : obj ? 'carregar' : 'parado';
    const x = cx(pos.x), y = cy(pos.y);
    const z = 15 + Math.round(pos.y * 10);
    els.push(<div key={`sh${c.nome}`} style={{position: 'absolute', left: x - T * 0.32, top: y - T * 0.12, width: T * 0.64, height: T * 0.24, borderRadius: '50%', background: '#0004', zIndex: z - 1}} />);
    els.push(<ChefSprite key={`c${c.nome}`} cor={COR_EMPRESA[c.empresa] ?? '#888'} anim={anim} dir={dir} x={x} y={y} k={k} frame={frame + c.nome.length * 7} z={z} />);
    // item na mão: na frente (de frente/de lado) ou atrás (de costas)
    const sp = spriteItem(obj);
    if (sp.length) {
      const fx = dir === 90 ? 0.38 : dir === 270 ? -0.38 : 0;
      const fy = dir === 0 ? 0.36 : dir === 180 ? -0.3 : 0.02;
      const hx = x + fx * T, hy = y + fy * D - 0.62 * T * COS;
      sp.forEach((n, j) => els.push(<Sprite key={`m${c.nome}${j}`} nome={n} grupo="itens" x={hx + (j ? (j - sp.length / 2) * T * 0.14 : 0)} y={hy - (j ? T * 0.04 : 0)} k={k} esc={j ? 0.55 : 0.85} z={dir === 180 ? z - 1 : z + 1 + j} />));
    }
    // nome e empresa
    els.push(
      <div key={`n${c.nome}`} style={{position: 'absolute', left: x - T * 2, width: T * 4, top: y - T * 1.55, textAlign: 'center', zIndex: 600, whiteSpace: 'nowrap'}}>
        <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: T * 0.2, color: '#fff', WebkitTextStroke: `${Math.max(1, T * 0.012)}px #000`, textShadow: '0 2px 0 #000'}}>{c.nome}</span>
        {w >= 1200 && <span style={{marginLeft: 4, fontFamily: FONT.display, fontWeight: 800, fontSize: T * 0.13, padding: '1px 5px', borderRadius: 5, background: COR_EMPRESA[c.empresa] ?? '#888', color: '#fff', verticalAlign: 'middle', border: '2px solid #000'}}>{c.empresa}</span>}
      </div>,
    );
    const embaixo = pos.y < 2.6 || !!(pensa.includes(c.nome) && q?.pensa);
    const bx = Math.max(ox + T * 2.1, Math.min(ox + cols * T - T * 2.1, x));
    const nuvem = pensa.includes(c.nome) && q?.pensa;
    if (nuvem) els.push(<div key={`pz${c.nome}`} style={{position: 'absolute', left: bx, top: y - T * 1.62, width: 0, height: 0, zIndex: 720}}><Nuvem txt={q!.pensa} t={T} idade={f * 60} /></div>);
    if (falas && q?.fala && (!so || so.includes(c.nome))) els.push(<div key={`f${c.nome}`} style={{position: 'absolute', left: bx, top: embaixo ? y + T * 0.3 : y - T * 1.62, width: 0, height: 0, zIndex: 700}}><Balao txt={q.fala} t={T} idade={f * 60} embaixo={embaixo} /></div>);
    if (q?.bloqueado && f < 0.9) els.push(<div key={`bl${c.nome}`} style={{position: 'absolute', left: x + T * 0.2, top: y - T * 1.2, fontSize: T * 0.32, zIndex: 650}}>💢</div>);
  }
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'hidden', background: 'radial-gradient(circle at 50% 35%, #34708a, #0f2433 85%)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: '0 0', transform: camera ? `translate(${camera.tx}px, ${camera.ty}px) scale(${camera.s})` : undefined}}>{els}</div>
      {hud && Pedidos && <div style={{position: 'absolute', left: 24 * esc, top: 16 * esc, zIndex: 900}}><Pedidos e={est} esc={esc * 1.15} frame={frame} /></div>}
      {hud && (
        <>
          <div style={{position: 'absolute', left: 24 * esc, bottom: 18 * esc, display: 'flex', alignItems: 'center', gap: 10 * esc, zIndex: 900}}>
            <div style={{width: 64 * esc, height: 64 * esc, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #ffe680, #e0a800)', border: `${4 * esc}px solid #7a5200`}} />
            <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 64 * esc, color: '#fff', WebkitTextStroke: `${3 * esc}px #000`}}>{est.pontos}</span>
          </div>
          <div style={{position: 'absolute', right: 30 * esc, bottom: 18 * esc, fontFamily: FONT.display, fontWeight: 900, fontSize: 64 * esc, color: (log.duracao - t) * log.tickS < 30 ? '#ff5a3c' : '#fff', WebkitTextStroke: `${3 * esc}px #000`, zIndex: 900}}>
            {(() => { const r = Math.max(0, Math.ceil((log.duracao - t) * log.tickS)); return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}` })()}
          </div>
          {titulo && <div style={{position: 'absolute', right: 30 * esc, top: 18 * esc, fontFamily: FONT.display, fontWeight: 900, fontSize: 40 * esc, color: '#fff', padding: `${4 * esc}px ${16 * esc}px`, borderRadius: 12 * esc, background: COR_EMPRESA[info.nome] ?? '#000a', border: `${3 * esc}px solid #000`, zIndex: 900}}>{info.nome === 'Todas' ? 'TODAS AS IAs' : `Cozinha ${info.nome}`}</div>}
        </>
      )}
    </div>
  );
};
