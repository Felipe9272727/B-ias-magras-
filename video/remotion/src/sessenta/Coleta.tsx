// 60 Segundos das IAs — a fase de coleta como gameplay: o fundo 3D da casa (sessenta/blender/casa.py), os itens e a
// família como sprites 3D pré-renderizados, o pai correndo pela rota exata do registro (sessenta/coleta.mjs), a
// câmera seguindo, o relógio de 60 s, as mãos (4 espaços) e o que já está no abrigo. 1 s de jogo = 1 s de vídeo.
import React from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from '../theme';

type Pt = {x: number; y: number};
type Reg = {tique: number; acao: string; tipo: string; de: Pt & {comodo: string}; para: Pt & {comodo: string}; rota: Pt[] | null; uids: string[]; maosUids: string[]; tempoMs: number};
type Coisa = {uid: string; id: string; x: number; y: number};
export type DadosColeta = {
  coleta: {semente: string; casa: {itens: Coisa[]; pessoas: {id: string; x: number; y: number}[]; inicio: Pt; abrigo: Pt}; log: Reg[]; fim: {resultado: string; pessoas: string[]; itens: Record<string, number>}};
  casa: {img: string; w: number; h: number; origem: [number, number]; vx: [number, number]; vy: [number, number]; vz: [number, number]};
  fam: {anims: Record<string, {quadros: number; dur: number}>; pessoas: Record<string, {pes: [number, number]; w: number; h: number}>};
  itens: {itens: Record<string, {base: [number, number]; w: number; h: number}>};
  ia?: {nome: string; cor: string};
};

export const calcColeta: CalculateMetadataFunction<{dados: DadosColeta | null; arquivo?: string}> = async ({props}) => {
  const j = async (f: string) => (await fetch(staticFile(f))).json();
  const [coleta, casa, fam, itens] = await Promise.all([j(props.arquivo ?? 'sessenta/coleta_teste.json'), j('sessenta/casa/casa.json'), j('sessenta/familia/familia.json'), j('sessenta/itens/itens.json')]);
  return {durationInFrames: 30 * (60 + 4), props: {...props, dados: {coleta, casa, fam, itens, ia: props.dados?.ia}}};
};

const FPS = 30;
const INTRO = 1.5; // s antes do relógio começar
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// posição do pai (em casas, fracionária) e o que ele está fazendo no instante t (ms de jogo)
function estadoPai(log: Reg[], inicio: Pt, t: number) {
  let t0 = 0;
  let pos: Pt = inicio;
  for (const r of log) {
    const t1 = r.tempoMs;
    if (t < t1) {
      const k = (t - t0) / Math.max(1, t1 - t0);
      if (r.rota && r.rota.length > 1) {
        const n = r.rota.length - 1;
        const s = Math.min(n - 1e-6, k * n);
        const i = Math.floor(s);
        const a = r.rota[i], b = r.rota[i + 1];
        return {x: a.x + (b.x - a.x) * (s - i), y: a.y + (b.y - a.y) * (s - i), dx: b.x - a.x, dy: b.y - a.y, andando: true, reg: r, k};
      }
      return {...pos, dx: 0, dy: 0, andando: false, reg: r, k};
    }
    t0 = t1;
    pos = r.para;
  }
  return {...pos, dx: 0, dy: 0, andando: false, reg: null as Reg | null, k: 1};
}

export const Coleta: React.FC<{dados: DadosColeta | null}> = ({dados}) => {
  const frame = useCurrentFrame();
  if (!dados) return <AbsoluteFill style={{background: '#000'}} />;
  const {coleta, casa, fam, itens} = dados;
  const t = Math.max(0, (frame / FPS - INTRO) * 1000); // ms de jogo
  const acabou = t >= 60000;
  const tela = (p: Pt, z = 0) => ({x: casa.origem[0] + casa.vx[0] * p.x + casa.vy[0] * p.y + casa.vz[0] * z, y: casa.origem[1] + casa.vx[1] * p.x + casa.vy[1] * p.y + casa.vz[1] * z});
  const centro = (p: Pt) => tela({x: p.x + 0.5, y: p.y + 0.5});

  // o que já foi pego até agora (some do chão no meio da ação de pegar) e o que está nas mãos
  const pai = estadoPai(coleta.log, coleta.casa.inicio, Math.min(t, 59999));
  const pegos = new Set<string>();
  const largadosNoChao = new Map<string, Pt>();
  let maos: string[] = [];
  let noAbrigo: string[] = [];
  {
    let t0 = 0;
    for (const r of coleta.log) {
      const meio = t0 + (r.tempoMs - t0) * 0.5;
      if (t >= meio) {
        if (r.tipo === 'pegar') for (const u of r.uids) { pegos.add(u); largadosNoChao.delete(u) }
        if (r.tipo === 'largar') for (const u of r.uids) largadosNoChao.set(u, r.para);
        if (r.tipo === 'depositar' || r.tipo === 'depositar_tudo') noAbrigo = [...noAbrigo, ...r.uids];
        maos = r.maosUids;
      }
      t0 = r.tempoMs;
    }
  }
  const idDe = (uid: string) => coleta.casa.itens.find((i) => i.uid === uid)?.id ?? uid;
  const ehPessoa = (uid: string) => ['mae', 'filha', 'filho'].includes(uid);

  // câmera: segue o pai com um leve atraso
  const alvo = centro(pai);
  const Z = 0.62;
  const W = 1920, H = 1080;
  const cx = Math.max(W / 2 / Z, Math.min(casa.w - W / 2 / Z, alvo.x));
  const cy = Math.max(H / 2 / Z, Math.min(casa.h - H / 2 / Z, alvo.y - 60));

  // sprite de uma pessoa
  const dirDe = (dx: number, dy: number) => (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 90 : 270) : dy > 0 ? 0 : dy < 0 ? 180 : 0);
  const Pessoa: React.FC<{id: string; p: Pt; anim: string; dir: number; fase?: number}> = ({id, p, anim, dir, fase = 0}) => {
    const info = fam.pessoas[id];
    const a = fam.anims[anim];
    if (!info || !a) return null;
    const q = Math.floor(((frame / FPS + fase) / a.dur) * a.quadros) % a.quadros;
    const d = dir === 270 ? 90 : dir;
    const pt = centro(p);
    return (
      <div style={{position: 'absolute', left: pt.x - info.pes[0], top: pt.y - info.pes[1], width: info.w, height: info.h, overflow: 'hidden', transform: dir === 270 ? 'scaleX(-1)' : undefined, transformOrigin: `${info.pes[0]}px ${info.pes[1]}px`}}>
        <Img src={staticFile(`sessenta/familia/${id}/${anim}_${d}.png`)} style={{position: 'absolute', left: -q * info.w, top: 0, height: info.h}} />
      </div>
    );
  };
  const Item: React.FC<{id: string; p: Pt; dz?: number; esc?: number}> = ({id, p, dz = 0, esc = 1}) => {
    const info = itens.itens[id];
    if (!info) return null;
    const pt = centro(p);
    return <Img src={staticFile(`sessenta/itens/${id}.png`)} style={{position: 'absolute', left: pt.x - info.base[0] * esc, top: pt.y - info.base[1] * esc + casa.vz[1] * dz, width: info.w * esc}} />;
  };

  // pessoas da família: paradas em pânico onde estão, ou seguindo o pai depois de pegas
  const levadas = maos.filter(ehPessoa);
  const dirPai = pai.andando ? dirDe(pai.dx, pai.dy) : 0;
  const animPai = acabou ? 'parado' : pai.andando ? (maos.some((u) => !ehPessoa(u)) ? 'carregar' : 'correr') : 'parado';
  const coisas: {y: number; el: React.ReactNode}[] = [];
  for (const it of coleta.casa.itens) {
    const chao = largadosNoChao.get(it.uid);
    if (pegos.has(it.uid) && !chao) continue;
    const p = chao ?? it;
    coisas.push({y: p.y, el: <Item key={it.uid} id={it.id} p={p} />});
  }
  for (const pe of coleta.casa.pessoas) {
    if (pegos.has(pe.id) || noAbrigo.includes(pe.id)) continue;
    coisas.push({y: pe.y, el: <Pessoa key={pe.id} id={pe.id} p={pe} anim="panico" dir={0} fase={pe.x * 0.13} />});
  }
  levadas.forEach((id, i) => {
    const atras = estadoPai(coleta.log, coleta.casa.inicio, Math.max(0, Math.min(t, 59999) - 380 * (i + 1)));
    coisas.push({y: atras.y - 0.01, el: <Pessoa key={'l' + id} id={id} p={atras} anim={atras.andando ? 'correr' : 'parado'} dir={atras.andando ? dirDe(atras.dx, atras.dy) : 0} fase={i * 0.2} />});
  });
  const naoEntrou = acabou && coleta.fim.resultado !== 'ok';
  if (!(acabou && !naoEntrou)) coisas.push({y: pai.y, el: <Pessoa key="pai" id="pai" p={pai} anim={animPai} dir={dirPai} />});
  // itens que o pai carrega: pilha flutuando acima da cabeça
  const pilha = maos.filter((u) => !ehPessoa(u));
  coisas.sort((a, b) => a.y - b.y);

  const restante = Math.max(0, Math.ceil((60000 - t) / 1000));
  const urgente = restante <= 10 && !acabou;
  const flash = acabou ? interpolate(t - 60000, [0, 200, 2500], [0, 1, 0.85], cl) : 0;

  return (
    <AbsoluteFill style={{background: '#4d7f3c', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: casa.w, height: casa.h, transformOrigin: '0 0', transform: `translate(${W / 2 - cx * Z}px, ${H / 2 - cy * Z}px) scale(${Z})`}}>
        <Img src={staticFile(casa.img)} style={{position: 'absolute', left: 0, top: 0, width: casa.w, height: casa.h}} />
        {coisas.map((c, i) => <React.Fragment key={i}>{c.el}</React.Fragment>)}
        {!acabou && pilha.map((u, i) => <Item key={'m' + u} id={idDe(u)} p={pai} dz={1.95 + i * 0.32} esc={0.8} />)}
      </div>
      {/* relógio */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center'}}>
        <span style={{display: 'inline-block', padding: '6px 34px', borderRadius: 18, background: urgente ? '#b3131b' : '#000c', border: '5px solid #fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 84, color: '#fff', letterSpacing: 3, transform: urgente ? `scale(${1 + 0.06 * Math.sin(frame / 2.5)})` : undefined}}>
          0:{String(restante).padStart(2, '0')}
        </span>
      </div>
      {/* mãos: 4 espaços */}
      <div style={{position: 'absolute', left: 30, bottom: 30, display: 'flex', gap: 10, alignItems: 'flex-end'}}>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 28, color: '#fff', marginRight: 8, WebkitTextStroke: '1.5px #000'}}>MÃOS</div>
        {maos.map((u) => (
          <div key={u} style={{width: 110, height: 110, borderRadius: 16, background: '#fffe', border: '5px solid #000', display: 'grid', placeItems: 'center', overflow: 'hidden'}}>
            {ehPessoa(u) ? <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 22}}>{u.toUpperCase()}</div> : <Img src={staticFile(`sessenta/itens/${idDe(u)}.png`)} style={{width: 150, marginTop: 10}} />}
          </div>
        ))}
      </div>
      {/* abrigo */}
      <div style={{position: 'absolute', right: 30, bottom: 30, padding: '12px 18px', borderRadius: 16, background: '#000b', border: '4px solid #f2c230', fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: '#fff', maxWidth: 520}}>
        <div style={{color: '#f2c230', fontWeight: 900}}>☢️ NO ABRIGO: {noAbrigo.length}</div>
        <div style={{fontSize: 22, opacity: 0.9}}>{resumoAbrigo(noAbrigo.map(idDe))}</div>
      </div>
      {dados.ia && <div style={{position: 'absolute', left: 30, top: 34, padding: '8px 18px', borderRadius: 12, background: dados.ia.cor, border: '4px solid #fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff'}}>{dados.ia.nome}</div>}
      {/* a bomba */}
      {acabou && <AbsoluteFill style={{background: '#fff8e0', opacity: flash}} />}
      {acabou && t - 60000 > 600 && (
        <AbsoluteFill style={{display: 'grid', placeItems: 'center'}}>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 130, color: naoEntrou ? '#b3131b' : '#222', textAlign: 'center', lineHeight: 1}}>
            {naoEntrou ? 'FICOU DE FORA' : 'BOOM!'}
            <div style={{fontSize: 48, marginTop: 14}}>{naoEntrou ? 'o pai não chegou ao abrigo' : `${coleta.fim.pessoas.length} pessoa(s) e ${Object.values(coleta.fim.itens).reduce((a, b) => a + b, 0)} itens no abrigo`}</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const NOMES: Record<string, string> = {sopa: 'sopa', agua: 'água', radio: 'rádio', mapa: 'mapa', mascara: 'máscara', kit: 'kit médico', rifle: 'rifle', machado: 'machado', lanterna: 'lanterna', cadeado: 'cadeado', inseticida: 'inseticida', mala: 'mala', baralho: 'baralho', damas: 'damas', gaita: 'gaita', manual: 'manual', municao: 'munição', mae: 'Celeste', filha: 'Juju', filho: 'Tico'};
function resumoAbrigo(ids: string[]) {
  const c: Record<string, number> = {};
  for (const i of ids) c[i] = (c[i] ?? 0) + 1;
  return Object.entries(c).map(([k, n]) => (n > 1 ? `${n}× ${NOMES[k] ?? k}` : NOMES[k] ?? k)).join(' · ') || '—';
}
