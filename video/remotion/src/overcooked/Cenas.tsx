// Cenas do vídeo "Overcooked das IAs" (lidas do timeline_oc.json, gerado por video/scripts/build_timeline_oc.py).
// OCJogo é a partida de verdade (o log do motor) com câmera, sons dos eventos e balões; as outras são telas de apoio
// (título, elenco, receitas, prompt, placar, frase em destaque, números). Arte própria, no espírito do jogo.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';
import {COR_EMPRESA, Pedidos, type LogOC} from './Cozinha';
import {ANDAR, ChefSprite, Cozinha3D, geometria, posChef, Sprite} from './Cozinha3D';
import PECAS from '../../public/overcooked/pecas/pecas.json';

const PXM = (PECAS as unknown as {px_m: number}).px_m;
export const EMPRESAS = ['DeepSeek', 'Claude', 'GPT', 'Gemini'];
const MODELO: Record<string, string> = {DeepSeek: 'DeepSeek Flash', Claude: 'Claude Haiku', GPT: 'GPT-5.6 Luna', Gemini: 'Gemini 3.8 Flash'};
const CHEFS: Record<string, [string, string]> = {DeepSeek: ['Deep', 'Seek'], Claude: ['Claudinho', 'Claudete'], GPT: ['Gepeto', 'Gepeta'], Gemini: ['Gêmeo', 'Gêmea']};
export const empresaDe = (chef: string) => EMPRESAS.find((e) => CHEFS[e].includes(chef)) ?? 'DeepSeek';

// fundo comum das telas de apoio: azulejo de cozinha desfocado
const Fundo: React.FC<{cor?: string}> = ({cor = '#1d3b4f'}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${cor}, #0b1720 80%)`, overflow: 'hidden'}}>
      <AbsoluteFill style={{opacity: 0.13, backgroundImage: 'linear-gradient(#fff 3px, transparent 3px), linear-gradient(90deg, #fff 3px, transparent 3px)', backgroundSize: '96px 96px', backgroundPosition: `${f * 0.6}px ${f * 0.3}px`}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- tempo da cena → tique da partida
type Chave = {at: number; tick: number};
export const tempoEm = (frame: number, de: number, vel: number, chaves: Chave[]) => {
  const pts = [{at: 0, tick: de}, ...chaves.filter((c) => c.at > 0).sort((a, b) => a.at - b.at)];
  for (let i = pts.length - 1; i >= 0; i--) {
    if (frame >= pts[i].at) {
      const nx = pts[i + 1];
      if (!nx) return pts[i].tick + ((frame - pts[i].at) / 60) * vel;
      return interpolate(frame, [pts[i].at, nx.at], [pts[i].tick, nx.tick]);
    }
  }
  return de;
};

// ---------------------------------------------------------------- sons dos eventos do jogo
const SOM: Record<string, [string, number, boolean]> = {
  // tipo de evento: [arquivo, volume, toca na grade 2×2]
  picando: ['picar', 0.22, false], pegou: ['pegar', 0.3, false], largou: ['largar', 0.25, false], na_panela: ['jogar_panela', 0.35, false],
  pronto: ['pronto', 0.4, true], entregou: ['moeda', 0.55, true], expirou: ['expirou', 0.45, true], esbarrao: ['esbarrao', 0.35, false],
  fogo: ['fogo', 0.5, true], fogo_espalhou: ['fogo', 0.4, true], apagou: ['extintor', 0.45, true], lavou: ['lavar', 0.25, false],
  recusado: ['buzzer', 0.45, true], queimando: ['alarme', 0.4, true], pedido: ['pedido', 0.3, true], lixo: ['largar', 0.25, false],
};
const Sons: React.FC<{log: LogOC; czs: number[]; de: number; vel: number; chaves: Chave[]; grade: boolean; volume: number}> = ({log, czs, de, vel, chaves, grade, volume}) => {
  const {durationInFrames} = useVideoConfig();
  // quadro em que o tique i "acontece" (quando o chef chega e o estado muda)
  const quadros: Record<number, number> = {};
  let i0 = -1;
  for (let f = 0; f < durationInFrames; f++) {
    const t = tempoEm(f, de, vel, chaves);
    const i = Math.floor(t - ANDAR);
    if (i > i0) {
      for (let k = Math.max(i0 + 1, Math.floor(de - ANDAR) + 1); k <= i; k++) if (k >= 0 && k < log.tiques.length) quadros[k] = f;
      i0 = i;
    }
  }
  const out: React.ReactNode[] = [];
  for (const [ks, f] of Object.entries(quadros)) {
    const k = Number(ks);
    if (f <= 0 && k < de - 0.5) continue;
    const usados = new Set<string>();
    for (const cz of czs) {
      const c = log.tiques[k].cozinhas[cz];
      for (const e of c.eventos) {
        const s = SOM[e.tipo];
        if (!s || (grade && !s[2])) continue;
        const chave = `${s[0]}`;
        if (usados.has(chave)) continue; // o mesmo som no mesmo quadro (duas cozinhas): toca uma vez
        usados.add(chave);
        out.push(<Sequence key={`${k}-${cz}-${e.tipo}-${out.length}`} from={f} durationInFrames={90}><Audio src={staticFile(`overcooked/sfx/${s[0]}.mp3`)} volume={s[1] * volume * (grade ? 0.8 : 1) * 0.7} /></Sequence>);
      }
      // panela fervendo / frigideira chiando (só na cozinha única)
      if (!grade && czs.length === 1) {
        const ferve = c.estado.tiles.some((tl) => tl.obj?.tipo === 'panela' && tl.obj.estado === 'cozinhando');
        const frita = c.estado.tiles.some((tl) => tl.obj?.tipo === 'frigideira' && tl.obj.estado === 'cozinhando');
        if (ferve) out.push(<Sequence key={`fv${k}`} from={f} durationInFrames={Math.round(60 / Math.max(0.25, vel))}><Audio src={staticFile('overcooked/sfx/ferver.mp3')} volume={0.09 * volume} /></Sequence>);
        if (frita) out.push(<Sequence key={`fr${k}`} from={f} durationInFrames={Math.round(60 / Math.max(0.25, vel))}><Audio src={staticFile('overcooked/sfx/fritar.mp3')} volume={0.1 * volume} /></Sequence>);
      }
    }
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- a partida
export type PropsJogo = {
  log: string; modo?: 'um' | 'grade' | 'dupla'; cz?: number; czs?: number[]; de?: number; vel?: number;
  zoom?: {chef?: string; x?: number; y?: number; s: number; entra?: number}; pensa?: string[]; so?: string[];
  sons?: boolean; volume?: number; rotulo?: string; falas?: boolean; congela?: number; pensaJanelas?: {chef: string; de: number; ate: number}[];
};

const camera = (log: LogOC, cz: number, t: number, w: number, h: number, zoom: NonNullable<PropsJogo['zoom']>, frame: number) => {
  const g = geometria(log.mapa, w, h, true);
  const p = zoom.chef ? posChef(log, cz, zoom.chef, t) : {x: zoom.x ?? 0, y: zoom.y ?? 0};
  const px = g.cx(p.x), py = g.cy(p.y) - g.T * 0.5;
  const entra = zoom.entra ?? 18;
  const s = 1 + (zoom.s - 1) * (entra ? Math.min(1, Math.max(0, frame / entra)) ** 0.6 : 1);
  const tx = Math.min(0, Math.max(w - w * s, w / 2 - px * s));
  const ty = Math.min(0, Math.max(h - h * s, h / 2 - py * s));
  return {s, tx, ty};
};

export const OCJogo: React.FC<PropsJogo & {logs: Record<string, LogOC>; chaves: Chave[]}> = (p) => {
  const frame = useCurrentFrame();
  const log = p.logs[p.log];
  if (!log) return <AbsoluteFill style={{background: '#000'}} />;
  const vel = p.vel ?? 1;
  const de = p.de ?? 0;
  const t = Math.min(log.tiques.length - 0.001, p.congela ?? tempoEm(frame, de, vel, p.chaves));
  const modo = p.modo ?? (log.cozinhas.length > 1 ? 'grade' : 'um');
  const pensa = [...(p.pensa ?? []), ...(p.pensaJanelas ?? []).filter((j) => frame >= j.de && frame < j.ate).map((j) => j.chef)];
  const comum = {Pedidos, pensa, so: p.so, falas: p.falas ?? true};
  let corpo: React.ReactNode;
  let czs: number[];
  if (modo === 'um') {
    const cz = p.cz ?? 0;
    czs = [cz];
    const cam = p.zoom ? camera(log, cz, t, 1920, 1080, p.zoom, frame) : undefined;
    corpo = <Cozinha3D log={log} cz={cz} t={t} w={1920} h={1080} camera={cam} {...comum} />;
  } else if (modo === 'dupla') {
    czs = p.czs ?? [0, 1];
    corpo = czs.map((cz, i) => (
      <div key={cz} style={{position: 'absolute', left: i * 960, top: 0, width: 960, height: 1080, overflow: 'hidden', borderRight: i === 0 ? '6px solid #000' : undefined}}>
        <div style={{position: 'absolute', left: 0, top: 270, width: 960, height: 540}}><Cozinha3D log={log} cz={cz} t={t} w={960} h={540} {...comum} /></div>
      </div>
    ));
  } else {
    czs = log.cozinhas.map((_, i) => i);
    corpo = log.cozinhas.map((_, i) => (
      <div key={i} style={{position: 'absolute', left: (i % 2) * 960, top: Math.floor(i / 2) * 540, width: 960, height: 540, overflow: 'hidden', border: '3px solid #000', boxSizing: 'border-box'}}>
        <Cozinha3D log={log} cz={i} t={t} w={960} h={540} {...comum} falas={p.falas ?? false} />
      </div>
    ));
  }
  return (
    <AbsoluteFill style={{background: '#0b1720'}}>
      {corpo}
      {p.rotulo && (
        <div style={{position: 'absolute', left: 0, right: 0, ...(modo === 'grade' ? {top: 500} : {bottom: 26}), display: 'flex', justifyContent: 'center', zIndex: 2000}}>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff', background: '#e8411899', border: '3px solid #000', borderRadius: 12, padding: '2px 18px'}}>{p.rotulo}</div>
        </div>
      )}
      {p.sons !== false && p.congela === undefined && <Sons log={log} czs={czs} de={de} vel={vel} chaves={p.chaves} grade={modo === 'grade'} volume={p.volume ?? 1} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- título
export const OCTitulo: React.FC<{kicker?: string; title: string; subtitle?: string; color?: string}> = ({kicker, title, subtitle, color = '#ffcf33'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 12}});
  const s2 = spring({frame: frame - 8, fps, config: {damping: 15}});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Fundo />
      {EMPRESAS.map((e, i) => {
        const ang = (i / 4) * Math.PI * 2 + frame / 160;
        return <ChefSprite key={e} cor={COR_EMPRESA[e]} anim="andar" dir={90} x={960 + Math.cos(ang) * 780} y={600 + Math.sin(ang) * 380} k={0.62} frame={frame + i * 9} z={1} />;
      })}
      <div style={{position: 'relative', zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {kicker && <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 38, color: '#d9ecf5', letterSpacing: 6, textTransform: 'uppercase', opacity: s2, marginBottom: 10}}>{kicker}</div>}
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: title.length > 26 ? 96 : 128, color, textAlign: 'center', maxWidth: 1560, lineHeight: 1.02, transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -4}deg)`, textShadow: '0 8px 0 #000, 0 0 40px rgba(0,0,0,.6)', WebkitTextStroke: '3px #000'}}>{title}</div>
        {subtitle && <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 42, color: '#fff', marginTop: 26, opacity: s2, textAlign: 'center', maxWidth: 1400, textShadow: '0 3px 0 #000'}}>{subtitle}</div>}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- elenco: as 4 duplas
export const OCElenco: React.FC<{passo?: number; destaque?: string}> = ({passo = 20, destaque}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Fundo />
      <div style={{position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#fff', WebkitTextStroke: '2px #000', textShadow: '0 5px 0 #000'}}>AS DUPLAS</div>
      {EMPRESAS.map((e, i) => {
        const s = spring({frame: frame - i * passo, fps, config: {damping: 13}});
        const apaga = destaque && destaque !== e ? 0.35 : 1;
        const x = 240 + i * 480;
        return (
          <div key={e} style={{opacity: s * apaga, transform: `translateY(${(1 - s) * 120}px)`}}>
            {CHEFS[e].map((n, j) => <ChefSprite key={n} cor={COR_EMPRESA[e]} anim={frame - i * passo > 30 && j === 1 ? 'parado' : 'parado'} dir={0} x={x + (j ? 85 : -85)} y={640} k={0.95} frame={frame + j * 13} z={1} />)}
            <div style={{position: 'absolute', left: x - 220, width: 440, top: 690, textAlign: 'center'}}>
              <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#fff', textShadow: '0 3px 0 #000'}}>{CHEFS[e][0]} & {CHEFS[e][1]}</div>
              <div style={{display: 'inline-block', marginTop: 12, fontFamily: FONT.display, fontWeight: 900, fontSize: 38, color: '#fff', background: COR_EMPRESA[e], border: '4px solid #000', borderRadius: 14, padding: '4px 22px'}}>{e}</div>
              <div style={{marginTop: 10, fontFamily: FONT.display, fontWeight: 700, fontSize: 28, color: '#cfe3ee'}}>{MODELO[e]}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- receitas: o caminho de cada prato, com os sprites do jogo
const RECEITAS: Record<string, string[][]> = {
  'Sopa de tomate': [['tomate'], ['tomate_picado'], ['panela_tomate'], ['prato_sopa_tomate']],
  'Sopa de cebola': [['cebola'], ['cebola_picado'], ['panela_cebola'], ['prato_sopa_cebola']],
  Salada: [['alface', 'tomate'], ['alface_picado', 'tomate_picado'], ['prato', 'alface_picado', 'tomate_picado']],
  'Hambúrguer': [['carne'], ['carne_picado'], ['frigideira_grelhada'], ['prato', 'pao', 'carne_grelhada']],
};
const LEGENDA: Record<string, string[]> = {
  'Sopa de tomate': ['pega 3 tomates', 'pica na tábua', 'cozinha na panela', 'serve no prato e entrega'],
  'Sopa de cebola': ['pega 3 cebolas', 'pica na tábua', 'cozinha na panela', 'serve no prato e entrega'],
  Salada: ['pega alface e tomate', 'pica os dois', 'junta no prato e entrega'],
  'Hambúrguer': ['pega a carne', 'pica', 'grelha (e não deixa queimar!)', 'pão + carne no prato'],
};
export const OCReceitas: React.FC<{receitas: string[]; passo?: number}> = ({receitas, passo = 12}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = 150 / PXM;
  return (
    <AbsoluteFill>
      <Fundo cor="#3b2a1d" />
      <div style={{position: 'absolute', top: 50, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#ffcf33', WebkitTextStroke: '2px #000', textShadow: '0 5px 0 #000'}}>O CARDÁPIO</div>
      {receitas.map((r, i) => {
        const passos = RECEITAS[r] ?? [];
        const y = 230 + i * (receitas.length > 2 ? 250 : 330);
        return (
          <div key={r}>
            <div style={{position: 'absolute', left: 60, width: 400, top: y, fontFamily: FONT.display, fontWeight: 900, fontSize: 40, lineHeight: 1.05, color: '#fff', textShadow: '0 3px 0 #000', opacity: spring({frame: frame - i * passo * 4, fps})}}>{r}</div>
            {passos.map((ps, j) => {
              const s = spring({frame: frame - i * passo * 4 - j * passo, fps, config: {damping: 14}});
              const x = 600 + j * 340;
              return (
                <div key={j} style={{opacity: s, transform: `scale(${0.5 + 0.5 * s})`, transformOrigin: `${x}px ${y + 40}px`, position: 'absolute', inset: 0}}>
                  <div style={{position: 'absolute', left: x - 110, top: y - 40, width: 220, height: 170, borderRadius: 24, background: '#fdf6e3', border: '4px solid #2a1a0c', boxShadow: '0 6px 0 #0007'}} />
                  {ps.map((n, q) => <Sprite key={q} nome={n} grupo="itens" x={x + (ps.length > 1 && !(n === 'prato') ? (q - (ps.length - 1) / 2) * 60 : 0)} y={y + 85} k={k} z={2 + q} esc={ps.length > 1 && n !== 'prato' ? 0.8 : 1} />)}
                  <div style={{position: 'absolute', left: x - 140, width: 280, top: y + 140, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: '#fff', textShadow: '0 2px 0 #000'}}>{LEGENDA[r]?.[j]}</div>
                  {j < passos.length - 1 && <div style={{position: 'absolute', left: x + 120, top: y + 20, fontSize: 60, color: '#ffcf33', fontWeight: 900, textShadow: '0 4px 0 #000'}}>➜</div>}
                </div>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- o que a IA recebe e o que ela responde
export const OCPrompt: React.FC<{texto: string; resposta: string; chef: string}> = ({texto, resposta, chef}) => {
  const frame = useCurrentFrame();
  const linhas = texto.split('\n');
  const vis = Math.floor(interpolate(frame, [10, 10 + linhas.length * 3], [0, linhas.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const r = Math.floor(interpolate(frame, [30 + linhas.length * 3, 70 + linhas.length * 3], [0, resposta.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const e = empresaDe(chef);
  return (
    <AbsoluteFill>
      <Fundo cor="#202a3b" />
      <div style={{position: 'absolute', left: 70, top: 60, width: 1080, height: 960, background: '#0d1117', border: '4px solid #30363d', borderRadius: 18, padding: 26, boxSizing: 'border-box', overflow: 'hidden'}}>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: '#8b949e', marginBottom: 12}}>O que {chef} recebe a cada 2 segundos</div>
        <pre style={{margin: 0, fontFamily: 'monospace', fontSize: 19, lineHeight: 1.32, color: '#e6edf3', whiteSpace: 'pre-wrap'}}>{linhas.slice(0, vis).join('\n')}</pre>
      </div>
      <ChefSprite cor={COR_EMPRESA[e]} anim="parado" dir={0} x={1500} y={430} k={1.1} frame={frame} z={1} />
      <div style={{position: 'absolute', left: 1210, top: 480, width: 640, background: '#fff', border: '4px solid #000', borderRadius: 18, padding: 22, boxSizing: 'border-box', opacity: r > 0 ? 1 : 0}}>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: COR_EMPRESA[e], marginBottom: 8}}>A resposta de {chef}</div>
        <pre style={{margin: 0, fontFamily: 'monospace', fontSize: 22, lineHeight: 1.35, color: '#111', whiteSpace: 'pre-wrap'}}>{resposta.slice(0, r)}</pre>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- frase em destaque (fala ou pensamento de um chef)
export const OCFrase: React.FC<{chef: string; texto: string; modo?: 'fala' | 'pensa'; tique?: number; fase?: string}> = ({chef, texto, modo = 'fala', tique, fase}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = empresaDe(chef);
  const s = spring({frame, fps, config: {damping: 13}});
  const grito = modo === 'fala' && texto.replace(/[^A-ZÀ-Ý]/g, '').length > texto.replace(/[^A-Za-zÀ-ú]/g, '').length * 0.6;
  const tremor = grito ? Math.sin(frame * 1.9) * 4 : 0;
  return (
    <AbsoluteFill>
      <Fundo cor={modo === 'pensa' ? '#2c2547' : '#3b1f1f'} />
      <ChefSprite cor={COR_EMPRESA[e]} anim={grito ? 'panico' : 'parado'} dir={0} x={360} y={820} k={1.6} frame={frame} z={1} />
      <div style={{position: 'absolute', left: 300, top: 870, width: 120, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: '#fff', textShadow: '0 3px 0 #000', whiteSpace: 'nowrap'}}>
        <div style={{display: 'inline-block', marginLeft: -200, width: 520}}>{chef} <span style={{fontSize: 30, background: COR_EMPRESA[e], border: '3px solid #000', borderRadius: 10, padding: '2px 12px'}}>{e}</span></div>
      </div>
      <div style={{position: 'absolute', left: 700, top: 160, width: 1120, minHeight: 500, display: 'flex', alignItems: 'center', transform: `scale(${0.7 + 0.3 * s}) translateX(${tremor}px)`, transformOrigin: '0% 50%', opacity: s}}>
        <div style={{background: modo === 'pensa' ? '#eef1f7' : grito ? '#fff1a8' : '#fff', border: `${grito ? 8 : 5}px solid ${modo === 'pensa' ? '#5b6577' : grito ? '#e01b1b' : '#000'}`, borderRadius: modo === 'pensa' ? 80 : 30, padding: '40px 54px', boxShadow: '0 10px 0 #0008'}}>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: modo === 'pensa' ? '#7b5cff' : '#e01b1b', marginBottom: 12, letterSpacing: 3}}>{modo === 'pensa' ? 'PENSAMENTO SECRETO' : 'DISSE'}{tique !== undefined ? ` · ${fase ?? ''} tique ${tique}` : ''}</div>
          <div style={{fontFamily: FONT.display, fontWeight: grito ? 900 : 700, fontStyle: modo === 'pensa' ? 'italic' : 'normal', fontSize: texto.length > 120 ? 46 : 58, lineHeight: 1.18, color: '#111'}}>{modo === 'pensa' ? `“${texto}”` : texto}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- placar (por fase e total)
export type LinhaPlacar = {empresa: string; pontos: number[]; entregues?: number; expirados?: number};
export const OCPlacar: React.FC<{titulo: string; colunas: string[]; linhas: LinhaPlacar[]; total?: boolean; passo?: number}> = ({titulo, colunas, linhas, total = true, passo = 14}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const soma = (l: LinhaPlacar) => l.pontos.reduce((a, b) => a + b, 0);
  const ord = [...linhas].sort((a, b) => soma(b) - soma(a));
  return (
    <AbsoluteFill>
      <Fundo />
      <div style={{position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 66, color: '#ffcf33', WebkitTextStroke: '2px #000', textShadow: '0 5px 0 #000'}}>{titulo}</div>
      <div style={{position: 'absolute', top: 210, left: 160, right: 160}}>
        <div style={{display: 'flex', fontFamily: FONT.display, fontWeight: 800, fontSize: 30, color: '#cfe3ee', paddingBottom: 12}}>
          <div style={{width: 120}} />
          <div style={{width: 360}} />
          {colunas.map((c) => <div key={c} style={{width: 220, textAlign: 'center'}}>{c}</div>)}
          {total && colunas.length > 1 && <div style={{width: 220, textAlign: 'center', color: '#ffcf33'}}>TOTAL</div>}
        </div>
        {ord.map((l, i) => {
          const s = spring({frame: frame - (ord.length - 1 - i) * passo, fps, config: {damping: 14}});
          return (
            <div key={l.empresa} style={{display: 'flex', alignItems: 'center', height: 160, marginBottom: 14, background: i === 0 ? '#ffcf3322' : '#ffffff10', border: `4px solid ${i === 0 ? '#ffcf33' : '#ffffff30'}`, borderRadius: 20, opacity: s, transform: `translateX(${(1 - s) * -200}px)`, position: 'relative'}}>
              <div style={{width: 120, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: i === 0 ? '#ffcf33' : '#fff', WebkitTextStroke: '2px #000'}}>{i + 1}º</div>
              <div style={{width: 360, position: 'relative', height: 160}}>
                <ChefSprite cor={COR_EMPRESA[l.empresa]} anim={i === 0 ? 'panico' : 'parado'} dir={0} x={70} y={150} k={0.62} frame={frame} z={1} />
                <div style={{position: 'absolute', left: 140, top: 52, fontFamily: FONT.display, fontWeight: 900, fontSize: 46, color: '#fff', textShadow: '0 3px 0 #000'}}>{l.empresa}</div>
              </div>
              {l.pontos.map((p, j) => <div key={j} style={{width: 220, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 58, color: p < 0 ? '#ff6b5a' : '#7ee787', WebkitTextStroke: '2px #000'}}>{p}</div>)}
              {total && colunas.length > 1 && <div style={{width: 220, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 70, color: soma(l) < 0 ? '#ff6b5a' : '#ffcf33', WebkitTextStroke: '3px #000'}}>{soma(l)}</div>}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- números (barras por empresa)
export const OCNumeros: React.FC<{titulo: string; sub?: string; valores: {empresa: string; valor: number; rotulo?: string}[]; unidade?: string}> = ({titulo, sub, valores, unidade = ''}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const mx = Math.max(1, ...valores.map((v) => Math.abs(v.valor)));
  return (
    <AbsoluteFill>
      <Fundo />
      <div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 64, color: '#fff', WebkitTextStroke: '2px #000', textShadow: '0 5px 0 #000'}}>{titulo}</div>
      {sub && <div style={{position: 'absolute', top: 160, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 34, color: '#cfe3ee'}}>{sub}</div>}
      {valores.map((v, i) => {
        const s = spring({frame: frame - 10 - i * 8, fps, config: {damping: 16}});
        const w = (Math.abs(v.valor) / mx) * 1100 * s;
        return (
          <div key={v.empresa} style={{position: 'absolute', left: 160, top: 280 + i * 180, display: 'flex', alignItems: 'center'}}>
            <div style={{width: 300, fontFamily: FONT.display, fontWeight: 900, fontSize: 48, color: '#fff', textShadow: '0 3px 0 #000'}}>{v.empresa}</div>
            <div style={{width: w, height: 90, background: COR_EMPRESA[v.empresa], border: '4px solid #000', borderRadius: 14, boxShadow: '0 6px 0 #0007'}} />
            <div style={{marginLeft: 24, fontFamily: FONT.display, fontWeight: 900, fontSize: 60, color: '#fff', WebkitTextStroke: '2px #000', opacity: s}}>{Math.round(v.valor * s)}{unidade}</div>
            {v.rotulo && <div style={{marginLeft: 20, fontFamily: FONT.display, fontWeight: 700, fontSize: 30, color: '#cfe3ee', opacity: s}}>{v.rotulo}</div>}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
