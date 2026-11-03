// BOMBANANA! das IAs em 3D, com edição dinâmica no estilo do jogo original (primeira pessoa de cada macaco):
// - Surdo: vê a bomba colorida; Cego: tela preta com contornos brancos e a luva apontando; Mudo: o MANUAL nas mãos.
// - Cortes de câmera a cada fala, empurrões de zoom nos gritos, figurinhas de gesto (SVG), carimbos de CERTO/ERROU,
//   tremor e flash nos erros, explosão de desenho, confete na vitória, apagão e alarme.
// Lê a mesma linha do tempo do bb_timeline.py (blocos rodada/fase/vitoria/explosao/narrador). Sem voz por enquanto
// (tl.semVoz): o texto das falas aparece nos balões e as durações vêm do tempo de leitura.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {Cena3D, camPadrao, misturarCam, cabecaMacaco, posMacaco, MESA, Cam, Papel3D, Ator, Lugar3D} from './Cena3Dv2';
import {Figurinha, MaoCego} from './Figurinha';
import {Bloco, Timeline, Fala} from './Episodio';
import {FONT} from '../theme';
import MANUAL from '../../public/bb/manual.json';

const PAPEIS: Papel3D[] = ['Cego', 'Surdo', 'Mudo'];
const COR_PAPEL: Record<Papel3D, string> = {Cego: '#e8402f', Surdo: '#2f7de8', Mudo: '#f2b01e'};
const NOME_PAPEL: Record<Papel3D, string> = {Cego: 'CEGO', Surdo: 'SURDO', Mudo: 'MUDO'};
const sen = Math.sin;
const hash = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };

// ---------------------------------------------------------------- projeção 3D -> tela (para balões e etiquetas)
const _cam = new THREE.PerspectiveCamera();
function projetar(c: Cam, p: THREE.Vector3, w: number, h: number): {x: number; y: number; dentro: boolean} {
  _cam.fov = c.fov ?? 45; _cam.aspect = w / h; _cam.near = 0.05; _cam.far = 40;
  _cam.position.set(...c.pos); _cam.up.set(Math.sin(c.roll ?? 0), Math.cos(c.roll ?? 0), 0); _cam.lookAt(...c.alvo);
  _cam.updateProjectionMatrix(); _cam.updateMatrixWorld(true);
  const v = p.clone().project(_cam);
  return {x: (v.x + 1) / 2 * w, y: (1 - v.y) / 2 * h, dentro: v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.1};
}

// ---------------------------------------------------------------- peças de interface
const Cronometro: React.FC<{resta: number; erros: number; maxErros: number; f: number}> = ({resta, erros, maxErros, f}) => {
  const r = Math.max(0, resta);
  const txt = `${String(Math.floor(r / 60)).padStart(2, '0')}:${String(Math.floor(r % 60)).padStart(2, '0')}`;
  const alerta = r <= 30;
  return (
    <div style={{position: 'absolute', top: 18, left: '50%', transform: `translateX(-50%) scale(${alerta ? 1 + 0.04 * Math.abs(sen(f / 4)) : 1})`, display: 'flex', alignItems: 'center', gap: 14,
      background: '#3a2f2a', border: '6px solid #1a1412', borderRadius: 22, padding: '6px 20px', boxShadow: '0 8px 0 #0007'}}>
      <div style={{background: alerta ? '#3a0f0f' : '#9dfc7a', borderRadius: 12, padding: '0 16px', backgroundImage: 'repeating-linear-gradient(0deg, #0000 0 5px, #0001 5px 7px)'}}>
        <div style={{fontFamily: FONT.mono, fontWeight: 800, fontSize: 62, color: alerta ? '#ff5a4f' : '#1d1530', letterSpacing: 2}}>{txt}</div>
      </div>
      <div style={{display: 'flex', gap: 4}}>{Array.from({length: maxErros}, (_, i) => <span key={i} style={{fontFamily: FONT.comic, fontSize: 52, color: i < erros ? '#ff3b30' : '#6b5d55', textShadow: '0 3px 0 #000'}}>X</span>)}</div>
    </div>
  );
};

const Etiqueta: React.FC<{nome: string; papel: Papel3D; cor: string; x: number; y: number; s?: number}> = ({nome, papel, cor, x, y, s = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, 0) scale(${s})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pointerEvents: 'none'}}>
    <div style={{background: cor, color: '#fff', fontFamily: FONT.comic, fontSize: 38, padding: '0 16px', borderRadius: 12, border: '4px solid #fff', boxShadow: '0 5px 0 #0006', letterSpacing: 1, whiteSpace: 'nowrap'}}>{nome}</div>
    <div style={{background: COR_PAPEL[papel], color: '#fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 18, padding: '0 10px', borderRadius: 8, border: '3px solid #fff'}}>{NOME_PAPEL[papel]}</div>
  </div>
);

// balão de fala (preso perto da cabeça) ou de pensamento (nuvem tracejada); texto vai aparecendo
const Balao: React.FC<{fala: Fala; f: number; cor: string; x: number; y: number; w: number}> = ({fala, f, cor, x, w}) => {
  const s = spring({frame: f, fps: 30, config: {damping: 11, stiffness: 160}});
  const n = Math.ceil(Math.min(1, f / Math.max(12, fala.texto.length * 0.5)) * fala.texto.length);
  const larg = Math.min(1100, 380 + fala.texto.length * 6);
  const left = Math.max(40, Math.min(w - larg - 40, x - larg / 2));
  const ponta = Math.max(30, Math.min(larg - 90, x - left - 30));
  const grito = /!/.test(fala.texto) && fala.texto.replace(/[^A-Za-zÀ-ú]/g, '').length > 3 && fala.texto === fala.texto.toUpperCase();
  return (
    <div style={{position: 'absolute', left, bottom: 46, width: larg, transform: `scale(${0.6 + 0.4 * s}) rotate(${grito ? sen(f / 2) * 1.2 : 0}deg)`, transformOrigin: `${ponta + 30}px 0`}}>
      {fala.pensa ? (
        <svg width={90} height={60} style={{position: 'absolute', left: ponta, top: -56}}><circle cx={56} cy={14} r={9} fill="#f4f0ff" stroke={cor} strokeWidth={4} /><circle cx={36} cy={40} r={14} fill="#f4f0ff" stroke={cor} strokeWidth={4} /></svg>
      ) : (
        <svg width={64} height={50} style={{position: 'absolute', left: ponta, top: -42}}><path d="M8,48 L32,2 L56,48 Z" fill="#fff" stroke={cor} strokeWidth={6} strokeLinejoin="round" /><rect x={4} y={44} width={56} height={12} fill="#fff" /></svg>
      )}
      <div style={{background: fala.pensa ? '#f4f0ff' : '#fff', border: `6px ${fala.pensa ? 'dashed' : 'solid'} ${cor}`, borderRadius: fala.pensa ? 60 : 30, padding: '14px 26px',
        fontFamily: FONT.display, fontWeight: 800, fontSize: fala.texto.length > 120 ? 34 : 40, lineHeight: 1.18, color: '#161616', fontStyle: fala.pensa ? 'italic' : 'normal', boxShadow: '0 9px 0 #0006'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4}}>
          <span style={{background: cor, color: '#fff', fontFamily: FONT.comic, fontStyle: 'normal', fontSize: 28, padding: '0 12px', borderRadius: 8}}>{fala.quem}</span>
          <span style={{fontFamily: FONT.comic, fontStyle: 'normal', fontSize: 22, color: fala.pensa ? '#7a64c8' : '#888', letterSpacing: 1}}>{fala.pensa ? 'PENSANDO...' : (fala.papel as string).toUpperCase()}</span>
        </div>
        {fala.texto.slice(0, n)}
      </div>
    </div>
  );
};

const Carimbo: React.FC<{texto: string; cor: string; f: number; rot?: number; top?: number; tam?: number}> = ({texto, cor, f, rot = -8, top = 420, tam = 150}) => {
  const s = spring({frame: f, fps: 30, config: {damping: 8, stiffness: 220}});
  return (
    <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', transform: `scale(${2.2 - 1.2 * s}) rotate(${rot}deg)`, opacity: Math.min(1, f / 3)}}>
      <span style={{fontFamily: FONT.comic, fontSize: tam, color: '#fff', background: cor, padding: '0 40px', borderRadius: 30, border: '10px solid #fff', boxShadow: '0 14px 0 #0008', letterSpacing: 4}}>{texto}</span>
    </div>
  );
};

// página do manual (como o fichário de argolas do jogo), na mão do Mudo
const Manual: React.FC<{tipo: string; f: number}> = ({tipo, f}) => {
  const txt: string = (MANUAL as any)[tipo] ?? '';
  const [cab, ...linhas] = txt.split('\n');
  const titulo = cab.split('(')[0].trim();
  const sub = cab.includes('(') ? cab.slice(cab.indexOf('(') + 1, cab.lastIndexOf(')')) : '';
  const sobe = interpolate(f, [0, 10], [500, 0], {extrapolateRight: 'clamp', easing: (x) => 1 - (1 - x) ** 3});
  return (
    <div style={{position: 'absolute', left: 300, right: 300, bottom: -40, height: 720, transform: `translateY(${sobe}px) rotate(${-1.5 + sen(f / 30) * 0.6}deg)`}}>
      <div style={{position: 'absolute', inset: 0, background: '#a8dde8', borderRadius: 40, border: '8px solid #6fb3c4', boxShadow: '0 20px 0 #0006'}} />
      <div style={{position: 'absolute', left: 36, top: 30, right: 36, bottom: 60, background: '#fffdf6', borderRadius: 26, padding: '26px 40px', fontFamily: FONT.display, color: '#222'}}>
        <div style={{fontFamily: FONT.comic, fontSize: 64, letterSpacing: 2, color: '#2b2b2b'}}>{titulo}</div>
        <div style={{fontSize: 22, fontWeight: 700, color: '#555', marginBottom: 12}}>{sub}</div>
        {linhas.slice(0, 7).map((l, i) => <div key={i} style={{fontSize: 25, fontWeight: 700, lineHeight: 1.28, marginBottom: 8}}>{l}</div>)}
      </div>
      {[0, 1, 2, 3].map((i) => <div key={i} style={{position: 'absolute', left: -20, top: 110 + i * 150, width: 70, height: 26, borderRadius: 13, background: ['#5fd18a', '#f2a65a', '#4d7bd6', '#e8453c'][i], border: '4px solid #0003'}} />)}
      {/* luvas brancas segurando */}
      <svg viewBox="0 0 200 160" style={{position: 'absolute', left: -90, bottom: 40, width: 220}}><ellipse cx={100} cy={90} rx={90} ry={66} fill="#fff" stroke="#c9c9c9" strokeWidth={5} /></svg>
      <svg viewBox="0 0 200 160" style={{position: 'absolute', right: -90, bottom: 40, width: 220}}><ellipse cx={100} cy={90} rx={90} ry={66} fill="#fff" stroke="#c9c9c9" strokeWidth={5} /></svg>
    </div>
  );
};

// filtro de bordas da visão do Cego (contornos brancos no preto, como no jogo)
const FiltroContorno: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id="bb-contorno" colorInterpolationFilters="sRGB">
      <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" preserveAlpha="true" />
      <feColorMatrix type="matrix" values="2 2 2 0 0  2 2 2 0 0  2 2 2 0 0  0 0 0 1 0" />
      <feComponentTransfer>
        <feFuncR type="discrete" tableValues="0 0 1 1 1 1 1 1" /><feFuncG type="discrete" tableValues="0 0 1 1 1 1 1 1" /><feFuncB type="discrete" tableValues="0 0 1 1 1 1 1 1" />
      </feComponentTransfer>
    </filter>
  </svg>
);

// ---------------------------------------------------------------- plano de câmeras de uma rodada
type Plano = {ini: number; cam: string; pov?: Papel3D; manual?: string; contorno?: boolean};
function planos(b: Bloco): Plano[] {
  const t = b.time!;
  const papelDe = (quem: string) => (Object.keys(t) as Papel3D[]).find((p) => t[p] === quem)!;
  const ps: Plano[] = [{ini: 0, cam: hash(String(b.resta) + b.fase?.n) % 3 === 0 ? 'geral' : 'jogo'}];
  const evs: {ini: number; tipo: string; papel: Papel3D; i: number}[] = [];
  (b.falas ?? []).forEach((fl, i) => evs.push({ini: fl.ini, tipo: fl.pensa ? 'pensa' : 'fala', papel: fl.papel as Papel3D, i}));
  if (b.gesto) evs.push({ini: b.gesto.ini, tipo: 'gesto', papel: 'Mudo', i: 99});
  evs.sort((a, c) => a.ini - c.ini);
  const mod = b.modulos?.[0]?.tipo ?? 'cabo';
  for (const e of evs) {
    const k = hash(`${b.fase?.n}-${b.resta}-${e.i}-${e.tipo}`) % 4;
    if (e.tipo === 'gesto') {
      ps.push({ini: e.ini - 24, cam: 'pov:Mudo', pov: 'Mudo', manual: (b.modulos?.find((m: any) => !m.resolvido)?.tipo) ?? mod});
      ps.push({ini: e.ini, cam: k % 2 ? 'close:Mudo' : 'meio:Mudo'});
    } else if (e.papel === 'Surdo') {
      ps.push({ini: e.ini, cam: e.tipo === 'pensa' ? 'close:Surdo' : ['pov:Surdo', 'close:Surdo', 'meio:Surdo', 'frente'][k], pov: e.tipo !== 'pensa' && k === 0 ? 'Surdo' : undefined});
    } else if (e.papel === 'Cego') {
      ps.push({ini: e.ini, cam: ['close:Cego', 'meio:Cego', 'frente', 'close:Cego'][k]});
    } else {
      ps.push({ini: e.ini, cam: e.tipo === 'pensa' ? 'close:Mudo' : 'meio:Mudo'});
    }
  }
  if (b.acao) {
    ps.push({ini: b.acao.ini - 45, cam: 'pov:Cego', pov: 'Cego', contorno: true});
    ps.push({ini: b.acao.ini, cam: 'painel'});
    ps.push({ini: b.acao.ini + 50, cam: b.acao.ok === false ? 'jogo' : 'frente'});
  }
  return ps.filter((p) => p.ini >= 0).sort((a, c) => a.ini - c.ini);
}

// ---------------------------------------------------------------- rodada
const Rodada: React.FC<{b: Bloco; tl: Timeline}> = ({b, tl}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const t = b.time!;
  const ps = planos(b);
  const pi = ps.reduce((acc, p, i) => (f >= p.ini ? i : acc), 0);
  const pl = ps[pi];
  const df = f - pl.ini;
  // câmera: o plano atual com um empurrão lento; chicote (whip) de 5 quadros quando muda entre planos de "diretor"
  let cam = camPadrao(pl.cam, f);
  const empurra = Math.min(1, df / 120) * 0.06;
  cam = {...cam, fov: (cam.fov ?? 45) * (1 - empurra)};
  if (pi > 0 && df < 6 && !pl.pov && !ps[pi - 1].pov) cam = misturarCam(camPadrao(ps[pi - 1].cam, f), cam, df / 6);
  const falaAgora = b.falas?.find((x) => f >= x.ini && f < x.ini + x.dur);
  const papelFala = falaAgora && !falaAgora.pensa ? (falaAgora.papel as Papel3D) : null;
  const g = b.gesto && f >= b.gesto.ini && f < b.gesto.ini + 75 ? b.gesto.gesto : '';
  const fa = b.acao ? f - b.acao.ini : -999;
  const acaoAtiva = b.acao && fa >= 0;
  const erro = acaoAtiva && b.acao!.ok === false && fa < 45;
  const certo = acaoAtiva && b.acao!.ok === true && fa < 45;
  const mods = acaoAtiva ? b.modulosDepois ?? b.modulos : b.modulos;
  const erros = (b.erros ?? 0) + (acaoAtiva && b.acao!.ok === false ? 1 : 0);
  const atores: Record<Papel3D, Ator> = {} as any;
  for (const p of PAPEIS) {
    let gesto = '', tg = 0;
    if (papelFala === p) { gesto = 'falar'; tg = falaAgora!.ini; }
    if (falaAgora?.pensa && falaAgora.papel === p) { gesto = 'pensar'; tg = falaAgora.ini; }
    if (p === 'Mudo' && g) { gesto = g; tg = b.gesto!.ini; }
    if (p === 'Cego' && b.acao && fa > -45 && fa < 30) { gesto = 'mexer'; tg = b.acao.ini - 45; }
    if (erro && fa < 40) { gesto = p === 'Cego' ? 'desespero' : 'susto'; tg = b.acao!.ini; }
    if (certo && p === 'Surdo') { gesto = 'comemorar'; tg = b.acao!.ini; }
    atores[p] = {boca: papelFala === p ? 0.25 + 0.75 * Math.abs(sen(f / 2.6)) * (0.6 + 0.4 * sen(f / 7)) : 0, gesto, tg};
  }
  const apagao = b.caos?.apagao ? 1 : 0, alarme = b.caos?.alarme ? 1 : 0;
  const tremor = erro ? (1 - fa / 45) : 0;
  const shakeX = tremor * sen(f * 2.7) * 22, shakeY = tremor * sen(f * 3.3) * 14;
  const grito = falaAgora && /!/.test(falaAgora.texto) && f - falaAgora.ini < 8 ? 1 + 0.07 * (1 - (f - falaAgora.ini) / 8) : 1;
  const resta = (b.resta ?? 0) - 10 * Math.min(1, f / Math.max(1, b.dur));
  const contorno = !!pl.contorno;
  // posições na tela das cabeças (para etiquetas e balões)
  const tela = Object.fromEntries(PAPEIS.map((p) => [p, projetar(cam, cabecaMacaco(p), W, H)])) as Record<Papel3D, {x: number; y: number; dentro: boolean}>;
  const corDe = (quem: string) => tl.cores[quem] ?? '#888';
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <FiltroContorno />
      <AbsoluteFill style={{transform: `translate(${shakeX}px, ${shakeY}px) scale(${grito})`, filter: contorno ? 'url(#bb-contorno)' : undefined}}>
        <Cena3D width={W} height={H} t={f + (b.fase?.n ?? 0) * 1000} camera={cam} atores={atores} resta={resta} erros={erros} maxErros={b.maxErros ?? 3}
          lugar={(b.lugar ?? 'van') as Lugar3D} apagao={apagao} alarme={alarme} tremor={tremor} modulos={mods} foco={b.acao ? b.acao.modulo - 1 : undefined} pov={pl.pov} contorno={contorno}
          banana={b.gesto?.gesto === 'jogar_banana' && f >= b.gesto.ini ? {de: 'Mudo', para: 'Surdo', k: (f - b.gesto.ini - 8) / 22} : undefined} />
      </AbsoluteFill>
      {/* visão do Cego: mão branca indo até o módulo */}
      {contorno ? (
        <>
          <div style={{position: 'absolute', left: W / 2 - 130 + ((b.acao!.modulo - 1) % 2 ? 140 : -140) + sen(f / 6) * 10, top: H - 330 - Math.min(1, (f - pl.ini) / 30) * 120 + Math.floor((b.acao!.modulo - 1) / 2) * -60}}><MaoCego tam={240} /></div>
          <div style={{position: 'absolute', bottom: 34, width: '100%', textAlign: 'center', fontFamily: FONT.comic, fontSize: 52, color: '#fff', letterSpacing: 3}}>VISÃO DO CEGO · {t.Cego.toUpperCase()}</div>
        </>
      ) : null}
      {pl.manual ? <Manual tipo={pl.manual} f={f - pl.ini} /> : null}
      {pl.pov && !contorno ? (
        <div style={{position: 'absolute', top: 120, left: 34, fontFamily: FONT.comic, fontSize: 40, color: '#fff', background: COR_PAPEL[pl.pov], padding: '2px 18px', borderRadius: 12, border: '4px solid #fff'}}>
          VISÃO DO {NOME_PAPEL[pl.pov]} · {t[pl.pov].toUpperCase()}
        </div>
      ) : null}
      {/* apagão e alarme */}
      {apagao ? <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #0000 10%, #000c 70%)'}} /> : null}
      {alarme ? <AbsoluteFill style={{background: '#ff1a0a', opacity: 0.12 + 0.1 * sen(f / 3), mixBlendMode: 'screen'}} /> : null}
      {/* etiquetas com o nome das IAs */}
      {!contorno && !pl.manual && !pl.cam.startsWith('close') ? PAPEIS.filter((p) => tela[p].dentro && p !== pl.pov && !(falaAgora && falaAgora.papel === p)).map((p) => (
        <Etiqueta key={p} nome={t[p]} papel={p} cor={corDe(t[p])} x={tela[p].x} y={Math.max(120, tela[p].y - 200)} s={0.85} />
      )) : null}
      {pl.cam.startsWith('close') ? (() => { const p = pl.cam.split(':')[1] as Papel3D; return <div style={{position: 'absolute', left: 40, top: 120}}><Etiqueta nome={t[p]} papel={p} cor={corDe(t[p])} x={120} y={0} s={1.2} /></div>; })() : null}
      {/* gesto do Mudo: figurinha + legenda */}
      {g && !pl.manual ? (
        <div style={{position: 'absolute', left: Math.max(40, Math.min(W - 300, tela.Mudo.x + 140)), top: Math.max(130, tela.Mudo.y - 220), transform: `scale(${spring({frame: f - b.gesto!.ini, fps: 30, config: {damping: 9}})}) rotate(${sen(f / 9) * 4}deg)`}}>
          <Figurinha gesto={g} tam={260} />
        </div>
      ) : null}
      {g && !pl.manual ? (
        <div style={{position: 'absolute', top: 118, width: '100%', textAlign: 'center'}}>
          <span style={{fontFamily: FONT.comic, fontSize: 50, color: '#fff', background: corDe(t.Mudo), padding: '4px 26px', borderRadius: 16, border: '5px solid #fff', boxShadow: '0 8px 0 #0006'}}>{legendaGesto(g)}</span>
        </div>
      ) : null}
      {/* balão */}
      {falaAgora && !contorno ? (() => {
        const p = falaAgora.papel as Papel3D;
        const pos = tela[p].dentro && pl.pov !== p ? tela[p] : {x: W / 2, y: H * 0.42, dentro: true};
        return <Balao key={falaAgora.ini} fala={falaAgora} f={f - falaAgora.ini} cor={corDe(falaAgora.quem)} x={pos.x} y={pos.y - (pl.cam.startsWith('close') ? 230 : 90)} w={W} />;
      })() : null}
      {/* resultado da ação */}
      {acaoAtiva && fa < 70 && b.acao!.ok !== null ? (
        <>
          {fa < 8 ? <AbsoluteFill style={{background: b.acao!.ok ? '#7dff8a' : '#ff2a1a', opacity: 0.5 * (1 - fa / 8)}} /> : null}
          <Carimbo texto={b.acao!.ok ? 'CERTO!' : 'ERROU!'} cor={b.acao!.ok ? '#21b04b' : '#e3261b'} f={fa} rot={b.acao!.ok ? -6 : 7} top={300} />
          <div style={{position: 'absolute', top: 520, width: '100%', textAlign: 'center', fontFamily: FONT.comic, fontSize: 44, color: '#fff', textShadow: '0 4px 0 #000'}}>{String(b.acao!.texto).replace(/: (certo|errado)$/, '').toUpperCase()}</div>
          {b.acao!.ok === false && fa < 30 ? <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.comic, fontSize: 700, color: '#ff2a1a', opacity: 0.5 * (1 - fa / 30), transform: `scale(${1 + fa / 30})`}}>X</div> : null}
        </>
      ) : null}
      {b.caos?.apagao && f < 50 ? <Carimbo texto="APAGÃO!" cor="#222" f={f} top={200} tam={110} /> : null}
      {b.caos?.alarme && f < 50 ? <Carimbo texto="ALARME!" cor="#c4140b" f={f} top={200} tam={110} rot={5} /> : null}
      {!contorno ? <Cronometro resta={resta} erros={erros} maxErros={b.maxErros ?? 3} f={f} /> : null}
      <div style={{position: 'absolute', top: 26, left: 30, fontFamily: FONT.comic, fontSize: 46, color: '#fff', textShadow: '0 4px 0 #000', letterSpacing: 2}}>FASE {b.fase?.n}</div>
    </AbsoluteFill>
  );
};

const LEGENDA: Record<string, (v?: string) => string> = {
  polegar_cima: () => 'JOINHA!', polegar_baixo: () => 'POLEGAR PRA BAIXO', dedos: (v) => `${v} DEDO${v === '1' ? '' : 'S'}`,
  apontar: (v) => `APONTA PRA ${String(v).toUpperCase()}`, apontar_banana: (v) => `APONTA A BANANA ${String(v).toUpperCase()}`,
  mao_parada: () => 'ESPERA!', repetir: () => 'DE NOVO!', cabeca_sim: () => 'SIM COM A CABEÇA', cabeca_nao: () => 'NÃO COM A CABEÇA',
  tapa: () => 'TAPA!', jogar_banana: () => 'JOGOU UMA BANANA!',
};
const legendaGesto = (g: string) => { const [a, v] = g.split(':'); return (LEGENDA[a] ?? (() => a.toUpperCase()))(v); };

// ---------------------------------------------------------------- cartão da fase (painéis de quadrinho, como "ONE CAN'T SEE")
const Cartao: React.FC<{b: Bloco; tl: Timeline}> = ({b, tl}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const s = spring({frame: f, fps: 30, config: {damping: 12}});
  const FRASE: Record<Papel3D, string> = {Cego: 'NÃO VÊ', Surdo: 'NÃO OUVE', Mudo: 'NÃO FALA'};
  const atores = Object.fromEntries(PAPEIS.map((p) => [p, {boca: 0, gesto: p === 'Surdo' ? 'polegar_cima' : p === 'Cego' ? 'mexer' : '', tg: 0}])) as Record<Papel3D, Ator>;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: 'blur(3px) brightness(0.7)'}}>
        <Cena3D width={W} height={H} t={f} camera={camPadrao('orbita', f * 2)} atores={atores} resta={b.fase?.tempo ?? 150} erros={0} maxErros={b.fase?.erros ?? 3} lugar={(b.lugar ?? b.fase?.lugar ?? 'van') as Lugar3D} />
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 40, width: '100%', textAlign: 'center', transform: `scale(${s}) rotate(-3deg)`}}>
        <span style={{fontFamily: FONT.comic, fontSize: 150, color: '#fff', WebkitTextStroke: '10px #1d1530', paintOrder: 'stroke', letterSpacing: 6}}>{b.titulo}</span>
      </div>
      <div style={{position: 'absolute', top: 230, width: '100%', textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#ffe066', textShadow: '0 4px 0 #000'}}>{b.sub}</div>
      {b.time ? (
        <div style={{position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40}}>
          {PAPEIS.map((p, i) => {
            const k = spring({frame: f - 10 - i * 7, fps: 30, config: {damping: 11}});
            const quem = b.time![p as 'Cego'];
            return (
              <div key={p} style={{width: 470, height: 560, background: COR_PAPEL[p], borderRadius: 30, border: '10px solid #fff', boxShadow: '0 16px 0 #0008', transform: `translateY(${(1 - k) * 700}px) rotate(${[-3, 2, -2][i]}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10}}>
                <div style={{fontFamily: FONT.comic, fontSize: 64, color: '#fff', textShadow: '0 5px 0 #0006'}}>UM {FRASE[p]}</div>
                <div style={{fontFamily: FONT.comic, fontSize: 96, color: '#fff', background: tl.cores[quem] ?? '#333', padding: '0 26px', borderRadius: 20, border: '6px solid #fff'}}>{quem}</div>
                <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 28, color: '#fff'}}>{tl.modelos[quem]}</div>
                <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#fff', background: '#0005', padding: '4px 16px', borderRadius: 10, marginTop: 6}}>{p === 'Cego' ? 'SÓ ELE MEXE NA BOMBA' : p === 'Surdo' ? 'VÊ A BOMBA E FALA' : 'TEM O MANUAL'}</div>
              </div>
            );
          })}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- explosão (nuvens de desenho + bananas) e vitória
const Explosao: React.FC<{b: Bloco; tl: Timeline}> = ({b}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const k = Math.min(1.4, f / 40);
  const atores = Object.fromEntries(PAPEIS.map((p) => [p, {boca: 0.6, gesto: f > 40 ? 'explodiu' : 'susto', tg: f > 40 ? 40 : 0}])) as Record<Papel3D, Ator>;
  const cam = f < 40 ? camPadrao('bomba', f) : camPadrao('jogo', f);
  const sh = f < 30 ? (1 - f / 30) * 30 : 0;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sen(f * 3) * sh}px, ${sen(f * 2.3) * sh}px)`}}>
        <Cena3D width={W} height={H} t={f} camera={cam} atores={atores} resta={0} erros={3} maxErros={3} lugar={(b.lugar ?? 'van') as Lugar3D} explosao={f < 40 ? k : 0.5 + (f - 40) / 200} />
      </AbsoluteFill>
      {f < 6 ? <AbsoluteFill style={{background: '#fff'}} /> : null}
      {f < 70 ? Array.from({length: 22}, (_, i) => {
        const a = (i / 22) * Math.PI * 2 + i, d = interpolate(f, [0, 50], [0, 1100], {extrapolateRight: 'clamp'});
        return <div key={i} style={{position: 'absolute', left: W / 2 + Math.cos(a) * d - 90, top: H / 2 + Math.sin(a) * d * 0.7 - 90, width: 180 + (i % 4) * 50, height: 160 + (i % 3) * 50, borderRadius: '50%', background: i % 3 ? '#8f9fd6' : '#ff9a2a', opacity: interpolate(f, [0, 70], [1, 0]), boxShadow: 'inset -14px -14px 0 #0002'}} />;
      }) : null}
      {f < 80 ? Array.from({length: 8}, (_, i) => (
        <svg key={i} viewBox="-50 -30 100 60" width={160} style={{position: 'absolute', left: W / 2 + sen(i * 2.1) * f * 14, top: H / 2 - f * 9 + f * f * 0.22 + i * 10, transform: `rotate(${f * 14 + i * 40}deg)`}}>
          <path d="M-40,0 Q0,34 40,-6 Q30,20 0,24 Q-30,22 -40,0 Z" fill="#fdd835" stroke="#2a1a00" strokeWidth={4} />
        </svg>
      )) : null}
      <div style={{position: 'absolute', top: 260, width: '100%', textAlign: 'center', transform: `scale(${spring({frame: f - 4, fps: 30, config: {damping: 7}})}) rotate(-6deg)`}}>
        <span style={{fontFamily: FONT.comic, fontSize: 280, color: '#ff3d00', WebkitTextStroke: '14px #fff', paintOrder: 'stroke', textShadow: '0 16px 0 #000'}}>{b.titulo ?? 'BOOM!'}</span>
      </div>
      {b.sub ? <div style={{position: 'absolute', bottom: 70, width: '100%', textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 58, color: '#fff', textShadow: '0 5px 0 #000'}}>{b.sub}</div> : null}
    </AbsoluteFill>
  );
};

const Vitoria: React.FC<{b: Bloco; tl: Timeline}> = ({b, tl}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const atores = Object.fromEntries(PAPEIS.map((p) => [p, {boca: 0.5 + 0.5 * Math.abs(sen(f / 3)), gesto: 'comemorar', tg: PAPEIS.indexOf(p) * 5}])) as Record<Papel3D, Ator>;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Cena3D width={W} height={H} t={f} camera={camPadrao('orbita', f * 3)} atores={atores} resta={b.resta ?? 0} erros={0} maxErros={3} lugar={(b.lugar ?? 'van') as Lugar3D} />
      {Array.from({length: 60}, (_, i) => <div key={i} style={{position: 'absolute', left: (i * 97) % W, top: ((f * (7 + (i % 6))) + i * 61) % (H + 80) - 60, width: 18, height: 32, background: ['#ffd600', '#e53935', '#1e88e5', '#43a047', '#fff'][i % 5], transform: `rotate(${f * 9 + i * 23}deg)`}} />)}
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', transform: `scale(${spring({frame: f, fps: 30, config: {damping: 8}})}) rotate(-4deg)`}}>
        <span style={{fontFamily: FONT.comic, fontSize: 220, color: '#7dff6a', WebkitTextStroke: '12px #0d3b12', paintOrder: 'stroke', textShadow: '0 14px 0 #0008'}}>{b.titulo ?? 'DESARMADA!'}</span>
      </div>
      {b.sub ? <div style={{position: 'absolute', bottom: 70, width: '100%', textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 54, color: '#fff', textShadow: '0 5px 0 #000'}}>{b.sub}</div> : null}
    </AbsoluteFill>
  );
};

// narrador: a van em movimento com o texto em destaque (vira legenda quando entrar a voz)
const Narrador: React.FC<{b: Bloco; tl: Timeline}> = ({b}) => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const atores = Object.fromEntries(PAPEIS.map((p) => [p, {boca: 0, gesto: '', tg: 0}])) as Record<Papel3D, Ator>;
  const cams = ['geral', 'orbita', 'frente', 'lado'];
  const cam = camPadrao(cams[hash(String(b.texto)) % cams.length], f * 1.5);
  const txt = String(b.texto ?? '');
  const n = Math.ceil(Math.min(1, f / Math.max(15, txt.length * 0.45)) * txt.length);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Cena3D width={W} height={H} t={f} camera={{...cam, fov: (cam.fov ?? 45) * (1 - Math.min(1, f / 200) * 0.08)}} atores={atores} resta={150} erros={0} maxErros={3} lugar={(b.lugar ?? 'van') as Lugar3D} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #0000 45%, #000c 100%)'}} />
      <div style={{position: 'absolute', left: 120, right: 120, bottom: 80, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 56, lineHeight: 1.2, color: '#fff', textShadow: '0 5px 0 #000'}}>
        {txt.slice(0, n)}
      </div>
    </AbsoluteFill>
  );
};

// abertura no estilo do trailer: logo e um painel colorido para cada papel, com o close do macaco
const Abertura: React.FC<{b: Bloco; tl: Timeline}> = () => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const atores = Object.fromEntries(PAPEIS.map((p) => [p, {boca: 0, gesto: p === 'Mudo' ? 'mao_parada' : p === 'Surdo' ? 'falar' : 'cabeca_nao', tg: 0}])) as Record<Papel3D, Ator>;
  const cena = Math.floor(f / 75);
  const df = f - cena * 75;
  if (cena === 0) {
    const s = spring({frame: f - 6, fps: 30, config: {damping: 7, stiffness: 120}});
    return (
      <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
        <Cena3D width={W} height={H} t={f} camera={camPadrao('orbita', f * 6)} atores={atores} resta={150} erros={0} maxErros={3} lugar="van" />
        <AbsoluteFill style={{background: 'radial-gradient(circle, #ffb30055 0%, #000a 80%)'}} />
        {Array.from({length: 12}, (_, i) => (
          <svg key={i} viewBox="-50 -30 100 60" width={150} style={{position: 'absolute', left: (i * 173) % W, top: ((f * (9 + i % 4)) + i * 90) % (H + 100) - 80, transform: `rotate(${f * 8 + i * 30}deg)`}}>
            <path d="M-40,0 Q0,34 40,-6 Q30,20 0,24 Q-30,22 -40,0 Z" fill="#fdd835" stroke="#2a1a00" strokeWidth={4} />
          </svg>
        ))}
        <div style={{position: 'absolute', top: 300, width: '100%', textAlign: 'center', transform: `scale(${s}) rotate(${-4 + sen(f / 10) * 1.5}deg)`}}>
          <span style={{fontFamily: FONT.comic, fontSize: 260, color: '#ffd21f', WebkitTextStroke: '16px #b3220f', paintOrder: 'stroke', textShadow: '0 18px 0 #000a', letterSpacing: 6}}>BOMBANANA!</span>
        </div>
        <div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', transform: `scale(${spring({frame: f - 22, fps: 30, config: {damping: 9}})})`}}>
          <span style={{fontFamily: FONT.comic, fontSize: 110, color: '#fff', background: '#1f3fd6', padding: '0 40px', borderRadius: 26, border: '9px solid #fff', letterSpacing: 4}}>DAS IAs</span>
        </div>
      </AbsoluteFill>
    );
  }
  const p = PAPEIS[Math.min(2, cena - 1)];
  const FR: Record<Papel3D, [string, string]> = {Cego: ['UM', 'NÃO VÊ'], Surdo: ['UM', 'NÃO OUVE'], Mudo: ['UM', 'NÃO FALA']};
  const entra = spring({frame: df, fps: 30, config: {damping: 13}});
  const ladoDir = cena !== 2;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translateX(${ladoDir ? -220 : 220}px)`}}>
        <Cena3D width={W} height={H} t={f} camera={{...camPadrao(`close:${p}`, f), fov: 42 - df * 0.06}} atores={atores} resta={150} erros={0} maxErros={3} lugar="van" />
      </AbsoluteFill>
      <div style={{position: 'absolute', top: -40, bottom: -40, width: 760, [ladoDir ? 'right' : 'left']: -60, background: COR_PAPEL[p], transform: `translateX(${(1 - entra) * (ladoDir ? 900 : -900)}px) rotate(${ladoDir ? 4 : -4}deg)`, borderLeft: ladoDir ? '16px solid #fff' : undefined, borderRight: ladoDir ? undefined : '16px solid #fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT.comic, fontSize: 150, color: '#fff', lineHeight: 0.95, textAlign: 'center', textShadow: '0 10px 0 #0005', transform: `rotate(${ladoDir ? -4 : 4}deg)`}}>{FR[p][0]}<br />{FR[p][1]}</div>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff', marginTop: 30, background: '#0004', padding: '6px 20px', borderRadius: 12}}>{p === 'Cego' ? 'SÓ ELE MEXE NA BOMBA' : p === 'Surdo' ? 'SÓ ELE VÊ A BOMBA' : 'SÓ ELE TEM O MANUAL'}</div>
      </div>
    </AbsoluteFill>
  );
};

const BLOCOS: Record<string, React.FC<{b: Bloco; tl: Timeline}>> = {abertura: Abertura, rodada: Rodada, fase: Cartao, titulo: Cartao, explosao: Explosao, vitoria: Vitoria, narrador: Narrador};

export const EpisodioBB3D: React.FC<{tl: Timeline & {semVoz?: boolean}}> = ({tl}) => {
  let ini = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.blocos.map((b, i) => {
        const C = BLOCOS[b.tipo] ?? Narrador;
        const s = ini; ini += b.dur;
        return (
          <Sequence key={i} from={s} durationInFrames={b.dur}>
            <C b={b} tl={tl} />
            {(b.audio ?? []).filter((a) => !(tl.semVoz && a.src.startsWith('bb/voz/'))).map((a, k) => <Sequence key={k} from={a.ini}><Audio src={staticFile(a.src)} volume={a.vol ?? 1} /></Sequence>)}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const duracaoBB3D = (tl: Timeline) => Math.max(1, tl.blocos.reduce((s, b) => s + b.dur, 0));
export const VideoBB3D: React.FC<{tl: (Timeline & {semVoz?: boolean}) | null}> = ({tl}) => tl ? (
  <AbsoluteFill>
    <EpisodioBB3D tl={tl} />
    {tl.musica ? <Audio src={staticFile(tl.musica)} volume={tl.semVoz ? 0.16 : 0.07} loop /> : null}
  </AbsoluteFill>
) : null;
export const calcVideoBB3D = async ({props}: {props: {tl: Timeline | null; arquivo?: string; de?: number; ate?: number}}) => {
  const tl = (await (await fetch(staticFile(props.arquivo ?? 'bb/timeline3d.json'))).json()) as Timeline;
  return {durationInFrames: duracaoBB3D(tl), fps: 30, props: {...props, tl}};
};
