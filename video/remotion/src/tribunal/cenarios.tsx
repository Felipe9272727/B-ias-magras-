// TRIBUNAL: os cenários. Tribunal de madeira de navio (5 planos), mesa de investigação, cais, planta do museu (maquete),
// corte do museu com a régua de latão da noite do crime, gravura "SÓ VOCÊ VÊ" de 15 anos atrás, dado grande e tela dividida.
import React, {useContext} from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import {AMBAR, BANG, C, CamCtx, CHUMBO, cl, COR, ease, hash, LATAO, LUZ, MAD_C, MAD_E, MARINHO, MONO, NOITE, NOME, PERG, Pedra, POP, quique, rnd, sombra, TINTA, type Humor} from './base';
import {Chip, Piso} from './pecas';

export type Clima = 'noite' | 'dia' | 'tarde';
const CEU: Record<Clima, string> = {noite: 'linear-gradient(#060b18, #14243f)', dia: 'linear-gradient(#5d6b7c, #93a0ad)', tarde: 'linear-gradient(#f7a04b, #c65a3a 60%, #5a2f4a)'};

// chuva riscada (dentro de qualquer caixa)
export const Chuva: React.FC<{f: number; n?: number; w?: number; h?: number; op?: number; cor?: string}> = ({f, n = 60, w = 1920, h = 1080, op = 0.5, cor = '#c8d6e8'}) => (
  <svg width={w} height={h} style={{position: 'absolute', inset: 0, opacity: op}}>
    {Array.from({length: n}).map((_, i) => { const x = (rnd(i) * (w + 300) + f * 3) % (w + 300) - 150, y = (rnd(i + 50) * (h + 200) + f * (22 + rnd(i + 9) * 10)) % (h + 200) - 100; return <path key={i} d={`M${x} ${y} l-10 34`} stroke={cor} strokeWidth={2.2} strokeLinecap="round" />; })}
  </svg>
);

// vitral redondo de escotilha, com o farol lá fora girando (feixe a cada 4 s)
export const Vitral: React.FC<{f: number; x: number; y: number; r: number; clima: Clima; contraluz?: boolean}> = ({f, x, y, r, clima, contraluz}) => {
  const ph = ((f % 120) / 120) * Math.PI * 2, flash = Math.max(0, Math.cos(ph)) ** 12;
  return (
    <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', background: contraluz ? `radial-gradient(${LUZ}, #f0b860 60%, #8a5a2a)` : CEU[clima]}}>
        {!contraluz ? <svg width={r * 2} height={r * 2} style={{position: 'absolute', inset: 0}}>
          <path d={`M${r * 1.25} ${r * 1.55} L${r * 1.31} ${r * 0.95} H${r * 1.41} L${r * 1.47} ${r * 1.55}Z`} fill="#0a0f1a" />
          <path d={`M${r * 1.36} ${r * 0.98} L${r * 1.36 + Math.cos(ph) * r * 2} ${r * 0.98 - r * 0.35} L${r * 1.36 + Math.cos(ph) * r * 2} ${r * 0.98 + r * 0.3}Z`} fill={LUZ} opacity={0.35 + 0.4 * Math.abs(Math.cos(ph))} />
          <circle cx={r * 1.36} cy={r * 0.98} r={r * 0.06} fill={LUZ} />
          <path d={`M0 ${r * 1.6} Q${r * 0.5} ${r * 1.5} ${r} ${r * 1.6} T${r * 2} ${r * 1.6} V${r * 2} H0Z`} fill="#0b1526" />
        </svg> : null}
        {clima !== 'tarde' ? <Chuva f={f} n={18} w={r * 2} h={r * 2} op={0.55} /> : null}
        <div style={{position: 'absolute', inset: 0, background: LUZ, opacity: flash * 0.55}} />
        <div style={{position: 'absolute', left: '48%', top: 0, bottom: 0, width: '4%', background: '#2a1a10'}} />
        <div style={{position: 'absolute', top: '48%', left: 0, right: 0, height: '4%', background: '#2a1a10'}} />
      </div>
      <div style={{position: 'absolute', inset: -r * 0.12, borderRadius: '50%', border: `${r * 0.14}px solid ${LATAO}`, boxShadow: `inset 0 0 0 4px #6d5410, 0 0 0 5px ${TINTA}, 0 10px 0 6px #0007`}} />
      {Array.from({length: 10}).map((_, i) => { const a = (i / 10) * Math.PI * 2; return <div key={i} style={{position: 'absolute', left: r + Math.cos(a) * r * 1.05 - 7, top: r + Math.sin(a) * r * 1.05 - 7, width: 14, height: 14, borderRadius: 7, background: '#8a6d14', border: '2px solid #111'}} />; })}
    </div>
  );
};

// parede de madeira de navio com faixas de latão e rebites; o feixe do farol varre a sala
export const Parede: React.FC<{f: number; clima?: Clima; tom?: number; feixe?: boolean}> = ({f, clima = 'dia', tom = 0, feixe = true}) => {
  const ph = (f % 120) / 120;
  return (
    <AbsoluteFill style={{background: clima === 'noite' ? '#24140b' : clima === 'tarde' ? '#5e3a22' : '#3d2516'}}>
      <AbsoluteFill style={{backgroundImage: `repeating-linear-gradient(90deg, #0000 0 116px, #00000055 116px 121px), repeating-linear-gradient(90deg, #ffffff08 0 30px, #0000 30px 60px)`, backgroundPosition: `${tom}px 0`}} />
      {[200, 690].map((y) => <div key={y} style={{position: 'absolute', left: 0, right: 0, top: y, height: 26, background: `linear-gradient(${LATAO}, #8a6d14)`, borderTop: '3px solid #111', borderBottom: '3px solid #111'}}>{Array.from({length: 24}).map((_, i) => <div key={i} style={{position: 'absolute', left: 20 + i * 82, top: 6, width: 12, height: 12, borderRadius: 6, background: '#6d5410', border: '2px solid #111'}} />)}</div>)}
      {feixe ? <AbsoluteFill style={{background: `linear-gradient(100deg, #0000 ${ph * 160 - 40}%, ${LUZ}22 ${ph * 160 - 22}%, #0000 ${ph * 160 - 4}%)`}} /> : null}
      <AbsoluteFill style={{background: clima === 'noite' ? 'radial-gradient(ellipse at 50% 40%, #0000 30%, #000c 100%)' : 'radial-gradient(ellipse at 50% 40%, #0000 45%, #000a 100%)'}} />
    </AbsoluteFill>
  );
};


// ---------- fundo ilustrado (cenários do Felipe, ampliados): anda mais devagar que a câmera (paralaxe 2.5D) e fica
// levemente desfocado; bancadas e personagens na frente ficam nítidos ----------
const NOVO: Record<string, string> = {tribunal_geral: 'geral', tribunal_noite: 'geral', bancada_juiz: 'juiz', mesa_defesa: 'tribuna', mesa_acusacao: 'promotor', estrado: 'banco', escritorio: 'escritorio', investigacao: 'lab', corredor: 'corredor', farol_tarde: 'cais', farol_noite: 'farol_noite', ...Object.fromEntries(['juiz', 'banco', 'tribuna', 'promotor', 'geral', 'lab', 'cais'].map((k) => [k, k]))};
export const Fundo: React.FC<{nome: string; f: number; k?: number; blur?: number; luz?: number; pos?: string; zoom?: number}> = ({nome, f, k = 0.45, blur = 0, luz = 0.9, pos = '50% 50%', zoom = 1}) => {
  const [x, y, z] = useContext(CamCtx);
  const xb = 960 + (x - 960) * k, yb = 540 + (y - 540) * k, zb = 1 + (z - 1) * k;
  const sc = zb / z, tx = (960 - xb * zb - (960 - x * z)) / z, ty = (540 - yb * zb - (540 - y * z)) / z;
  const dr = Math.sin(f / 150 + nome.length) * 16, W = 2112 * zoom, H = 1188 * zoom;
  const novo = NOVO[nome];
  return (
    <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(${sc})`, transformOrigin: '0 0'}}>
      <Img src={staticFile(novo ? `tribunal/palco/${novo}.jpg` : `tribunal/cenarios/${nome}.jpg`)} style={{position: 'absolute', left: 960 - W / 2 + dr, top: 540 - H / 2 + Math.cos(f / 190) * 6, width: W, height: H, objectFit: 'cover', objectPosition: pos, filter: `blur(${blur}px) brightness(${luz}) saturate(1.06)`}} />
    </AbsoluteFill>
  );
};
const FUNDO_PLANO: Record<string, [string, string]> = {geral: ['tribunal_geral', '50% 40%'], banco: ['estrado', '50% 30%'], tribuna: ['mesa_defesa', '40% 50%'], juiz: ['bancada_juiz', '50% 35%'], promotor: ['mesa_acusacao', '60% 50%']};
// luz da sala: o feixe do farol varre a parede + vinheta
const LuzSala: React.FC<{f: number; clima: Clima}> = ({f, clima}) => {
  const ph = (f % 120) / 120;
  return <>
    <AbsoluteFill style={{zIndex: 50, background: `linear-gradient(100deg, #0000 ${ph * 160 - 40}%, ${LUZ}2a ${ph * 160 - 22}%, #0000 ${ph * 160 - 4}%)`, mixBlendMode: 'screen'}} />
    <AbsoluteFill style={{zIndex: 50, background: clima === 'noite' ? 'radial-gradient(ellipse at 50% 40%, #0000 30%, #000b 100%)' : 'radial-gradient(ellipse at 50% 40%, #0000 55%, #0007 100%)'}} />
  </>;
};

// móveis: frente de bancada de madeira com moldura de latão e plaquinha de nome
export const Bancada: React.FC<{x: number; y: number; w: number; h: number; nome?: string; cor?: string; children?: React.ReactNode; z?: number}> = ({x, y, w, h, nome, cor, children, z = 5}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, zIndex: z}}>
    <div style={{position: 'absolute', left: -14, right: -14, top: -16, height: 26, background: `linear-gradient(${MAD_C}, ${MAD_E})`, border: `4px solid ${TINTA}`, borderRadius: 6}} />
    <div style={{position: 'absolute', inset: 0, top: 6, background: `repeating-linear-gradient(90deg, ${MAD_E} 0 70px, #4e311e 70px 74px)`, border: `5px solid ${TINTA}`, boxShadow: 'inset 0 0 0 10px #0002, 0 16px 0 #0006'}}>
      <div style={{position: 'absolute', inset: 14, border: `4px solid ${LATAO}`, borderRadius: 6, opacity: 0.8}} />
    </div>
    {nome ? <div style={{position: 'absolute', left: '50%', top: 34, transform: 'translateX(-50%)', fontFamily: POP, fontWeight: 800, fontSize: 28, color: TINTA, background: `linear-gradient(${LUZ}, ${LATAO})`, border: `4px solid ${TINTA}`, borderLeft: cor ? `16px solid ${COR[cor]}` : undefined, borderRadius: 8, padding: '0 14px', whiteSpace: 'nowrap'}}>{nome}</div> : null}
    {children}
  </div>
);

export type Gente = {cor: string; exp?: string; humor?: Humor; fala?: boolean; gesto?: number; cadeados?: number; maoBolso?: boolean; semAnel?: boolean; cabecaBaixa?: number; silh?: boolean; olhar?: [number, number]; brilho?: number; dx?: number; dy?: number; papel?: any};
const P: React.FC<{g?: Gente; x: number; y: number; s: number; f: number; rod?: string | null; z?: number; flip?: boolean}> = ({g, x, y, s, f, rod, z = 3, flip}) => g ? (
  <div style={{position: 'absolute', left: x + (g.dx ?? 0), top: y + (g.dy ?? 0), zIndex: z, transform: flip ? 'scaleX(-1)' : undefined}}>
    <Pedra cor={g.cor} s={s} f={f} rod={rod} humor={g.humor} fala={g.fala} gesto={g.gesto} cadeados={g.cadeados} maoBolso={g.maoBolso} semAnel={g.semAnel} cabecaBaixa={g.cabecaBaixa} silh={g.silh} olhar={flip && g.olhar ? [-g.olhar[0], g.olhar[1]] : g.olhar} brilho={g.brilho} papel={g.papel} exp={g.exp} espelho={flip} tag />
  </div>
) : null;
const tag = (g: Gente | undefined, rod: string | null | undefined, papel: string) => (g ? `${NOME[g.cor].toUpperCase()} · ${papel}` : undefined);

// ---------- o tribunal, em 5 planos ----------
export type Plano = 'geral' | 'banco' | 'tribuna' | 'juiz' | 'promotor';
export type Quem = {juiz?: Gente; testemunha?: Gente; advogada?: Gente; re?: Gente; promotor?: Gente; acusado?: Gente; assistente?: Gente; delegado?: Gente};
// ---------- PALCO 2.5D/3D: cenário gerado (OpenRouter) fatiado por profundidade (Depth Anything) ----------
// Cada camada anda numa velocidade conforme a profundidade: com a câmera da cena e com uma órbita lenta própria
// (o fundo vai para um lado, o móvel da frente para o outro, o personagem fica no meio). A parede do fundo ainda
// ganha um deslocamento por pixel pelo mapa de profundidade (feDisplacementMap) = sensação 3D.
export const PALCO: Record<string, {prof: number[]}> = {
  fb_tranca: {prof: [0.11, 0.78]}, fb_apagado: {prof: [0.17, 0.75]}, fb_naufragio: {prof: [0.18, 0.75]}, fb_anselmo: {prof: [0.16, 0.8]}, fb_envelope: {prof: [0.18, 0.75]},
  juiz: {prof: [0.33, 0.87]}, banco: {prof: [0.41, 0.87]}, tribuna: {prof: [0.26, 0.94]}, promotor: {prof: [0.36, 0.83]}, geral: {prof: [0.06, 0.26, 0.69]},
  escritorio: {prof: [0.28, 0.9]}, corredor: {prof: [0.41, 0.88]}, lab: {prof: [0.33, 0.89]}, cais: {prof: [0.28, 0.85]}, farol_noite: {prof: [0.2, 0.91]},
};
const P_ATOR = 0.62;
 // profundidade "do personagem" (logo atrás do móvel)
export const orbita = (f: number, amp = 1): [number, number] => [Math.sin(f / 95) * 22 * amp + Math.sin(f / 41) * 4 * amp, Math.cos(f / 130) * 8 * amp];
const Camada: React.FC<{src: string; prof: number; f: number; z: number; zoom: number; ox: number; oy: number; desl?: string; filtro?: string; amp?: number}> = ({src, prof, f, z, zoom, ox, oy, desl, filtro, amp = 1}) => {
  const [x, y, zc] = useContext(CamCtx);
  const k = Math.max(0.35, 1 + (prof - P_ATOR) * 1.1);
  const xb = 960 + (x - 960) * k, yb = 540 + (y - 540) * k, zb = 1 + (zc - 1) * k;
  const sc = zb / zc, tx = (960 - xb * zb - (960 - x * zc)) / zc, ty = (540 - yb * zb - (540 - y * zc)) / zc;
  const [obx, oby] = orbita(f, amp), d = prof - P_ATOR;
  const W = 1920 * zoom, H = 1080 * zoom;
  const id = `d${src.replace(/[^a-z0-9]/gi, '')}`;
  const esc = desl ? (Math.sin(f / 95) * 26 + Math.sin(f / 41) * 5) * amp : 0;
  return (
    <AbsoluteFill style={{zIndex: z, transform: `translate(${tx}px, ${ty}px) scale(${sc})`, transformOrigin: '0 0', pointerEvents: 'none'}}>
      {desl ? <svg width={0} height={0} style={{position: 'absolute'}}><filter id={id} x={0} y={0} width={W} height={H} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feImage href={desl} x={0} y={0} width={W} height={H} preserveAspectRatio="none" result="m" /><feDisplacementMap in="SourceGraphic" in2="m" scale={esc} xChannelSelector="R" yChannelSelector="G" /></filter></svg> : null}
      <Img src={src} style={{position: 'absolute', left: 960 - W / 2 + ox + obx * d, top: 540 - H / 2 + oy + oby * d, width: W, height: H, objectFit: 'cover', filter: [desl ? `url(#${id})` : '', filtro ?? ''].join(' ') || undefined}} />
    </AbsoluteFill>
  );
};
// z das camadas: c0 = 0, c1 = 20, c2 = 40 (quem fica atrás do móvel usa z menor que o dele)
export const Palco: React.FC<{nome: string; f: number; zoom?: number; ox?: number; oy?: number; luz?: number; noite?: boolean; amp?: number; frente?: boolean; atras?: boolean}> = ({nome, f, zoom = 1.06, ox = 0, oy = 0, luz = 1, noite, amp = 1, frente = true, atras}) => {
  const P = PALCO[nome];
  const filtro = `brightness(${luz * (noite ? 0.62 : 1)}) saturate(${noite ? 0.85 : 1.05})${noite ? ' hue-rotate(-8deg)' : ''}`;
  return <>
    <Camada src={staticFile(`tribunal/palco/${nome}_c0.jpg`)} prof={P.prof[0]} f={f} z={0} zoom={zoom} ox={ox} oy={oy} desl={staticFile(`tribunal/palco/${nome}_desl.png`)} filtro={filtro} amp={amp} />
    {P.prof.slice(1).map((pr, i) => (frente || i < P.prof.length - 2) ? <Camada key={i} src={staticFile(`tribunal/palco/${nome}_c${i + 1}.png`)} prof={pr} f={f} z={atras ? i + 1 : 20 * (i + 1)} zoom={zoom} ox={ox} oy={oy} filtro={filtro} amp={amp} /> : null)}
  </>;
};
// plaquinha de latão com o nome (fica sobre o móvel do cenário)
const Plaq: React.FC<{x: number; y: number; txt?: string; cor?: string; z?: number}> = ({x, y, txt, cor, z = 45}) => txt && useContext(CamCtx)[2] < 1.6 ? (
  <div style={{position: 'absolute', left: x, top: y, zIndex: z, transform: 'translateX(-50%)', fontFamily: POP, fontWeight: 800, fontSize: 28, color: TINTA, background: `linear-gradient(${LUZ}, ${LATAO})`, border: `4px solid ${TINTA}`, borderLeft: cor ? `16px solid ${COR[cor]}` : undefined, borderRadius: 8, padding: '0 14px', whiteSpace: 'nowrap', boxShadow: '0 6px 0 #0007'}}>{txt}</div>
) : null;

export const Sala: React.FC<{plano: Plano; f: number; clima?: Clima; rod?: string | null; quem: Quem; children?: React.ReactNode; contraluz?: boolean; vazio?: boolean}> = ({plano, f, clima = 'dia', rod, quem: q, children, contraluz, vazio}) => {
  const noite = clima === 'noite';
  return (
    <AbsoluteFill style={{background: '#120b06'}}>
      {plano === 'geral' ? <>
        <Palco nome="geral" f={f} noite={noite} />
        <P g={q.juiz} x={835} y={150} s={250} f={f} rod={rod} z={10} />
        <P g={q.testemunha} x={183} y={325} s={210} f={f} rod={rod} z={30} />
        <P g={q.delegado} x={400} y={470} s={150} f={f} rod={rod} z={30} />
        <P g={q.assistente} x={1260} y={470} s={160} f={f} rod={rod} z={30} />
        <P g={q.advogada} x={1380} y={365} s={230} f={f} rod={rod} z={31} />
        <P g={q.re} x={1560} y={425} s={180} f={f} rod={rod} z={32} />
        <Plaq x={960} y={560} txt={vazio ? undefined : 'JUIZ'} cor="Roxo" z={25} />
        <Plaq x={330} y={650} txt={tag(q.testemunha, rod, 'TESTEMUNHA')} cor={q.testemunha?.cor} />
        <Plaq x={1570} y={720} txt={q.advogada ? `DEFESA · ${NOME[q.advogada.cor].toUpperCase()}` : undefined} cor={q.advogada?.cor} />
        <P g={q.promotor} x={200} y={700} s={190} f={f} rod={rod} z={50} />
        {q.promotor ? <Bancada x={130} y={900} w={500} h={180} nome={tag(q.promotor, rod, 'PROMOTOR')} cor={q.promotor?.cor} z={55} /> : null}
      </> : null}
      {plano === 'banco' ? <>
        <Palco nome="banco" f={f} zoom={1.35} ox={-10} oy={177} noite={noite} />
        <P g={q.delegado} x={640} y={330} s={200} f={f} rod={rod} z={5} />
        <P g={q.testemunha} x={180} y={70} s={400} f={f} rod={rod} z={10} />
        <Plaq x={390} y={700} txt={tag(q.testemunha, rod, 'TESTEMUNHA')} cor={q.testemunha?.cor} />
      </> : null}
      {plano === 'tribuna' ? <>
        <Palco nome="tribuna" f={f} noite={noite} />
        <P g={q.advogada} x={120} y={190} s={380} f={f} rod={rod} z={12} />
        <P g={q.re} x={560} y={355} s={270} f={f} rod={rod} z={11} />
        <P g={q.assistente} x={790} y={460} s={200} f={f} rod={rod} z={10} />
        <P g={q.acusado} x={1400} y={250} s={340} f={f} rod={rod} flip z={12} />
        <Plaq x={420} y={790} txt={q.advogada ? `DEFESA · ${NOME[q.advogada.cor].toUpperCase()}` : undefined} cor={q.advogada?.cor} />
        <Plaq x={1560} y={790} txt={tag(q.acusado, rod, 'TESTEMUNHA')} cor={q.acusado?.cor} />
      </> : null}
      {plano === 'juiz' ? <>
        <Palco nome="juiz" f={f} noite={noite || contraluz} luz={contraluz ? 0.8 : 1} />
        {contraluz ? <AbsoluteFill style={{zIndex: 5, background: `radial-gradient(circle at 50% 22%, ${LUZ}cc, #f0b86055 18%, #0000 40%)`}} /> : null}
        <div style={{position: 'absolute', left: 745, top: 45, zIndex: 10, filter: contraluz ? 'brightness(0.25) contrast(1.2)' : undefined}}><P g={q.juiz} x={0} y={0} s={430} f={f} rod={rod} /></div>
        <Plaq x={960} y={700} txt={vazio ? undefined : 'JUIZ · AMETISTA'} cor="Roxo" />
      </> : null}
      {plano === 'promotor' ? <>
        <Palco nome="promotor" f={f} noite={noite} />
        <P g={q.promotor} x={620} y={140} s={480} f={f} rod={rod} z={10} />
        <Plaq x={960} y={880} txt={tag(q.promotor, rod, 'PROMOTOR')} cor={q.promotor?.cor} />
      </> : null}
      <LuzSala f={f} clima={clima} />
      {children ? <AbsoluteFill style={{zIndex: 60}}>{children}</AbsoluteFill> : null}
    </AbsoluteFill>
  );
};

// ---------- mesa de investigação: duas cadeiras de frente, o Registro na mesa ----------
export const Mesa: React.FC<{f: number; esq: Gente; dir: Gente; rod: string; lugar?: 'sala' | 'cais' | 'corredor' | 'lab'; children?: React.ReactNode; tv?: boolean}> = ({f, esq, dir, rod, lugar = 'sala', children, tv}) => (
  <AbsoluteFill>
    <Palco nome={lugar === 'cais' ? 'cais' : lugar === 'corredor' ? 'corredor' : lugar === 'lab' ? 'lab' : 'escritorio'} f={f} atras />
    <LuzSala f={f} clima="dia" />
    {tv ? <div style={{position: 'absolute', left: 1500, top: 250, width: 300, height: 210, background: '#1b1b1b', border: `8px solid #333`, outline: `4px solid ${TINTA}`, borderRadius: 12, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, background: '#2c7a3a'}}><div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 3, background: '#fff8'}} /><div style={{position: 'absolute', left: '42%', top: '38%', width: '16%', height: '24%', border: '3px solid #fff8', borderRadius: '50%'}} /></div>
      <div style={{position: 'absolute', left: 10, top: 10, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: '#fff', background: '#000c', padding: '0 8px', opacity: Math.floor(f / 12) % 2 ? 1 : 0.6}}>FINAL 1 x 0</div>
      <div style={{position: 'absolute', left: 10, bottom: 8, fontFamily: POP, fontWeight: 800, fontSize: 20, color: LUZ}}>ÚLTIMO MINUTO</div>
    </div> : null}
    <div style={{position: 'absolute', left: 175, top: lugar === 'cais' ? 230 : 175, zIndex: 3}}><Pedra cor={esq.cor} s={360} f={f} rod={rod} humor={esq.humor} fala={esq.fala} gesto={esq.gesto} cadeados={esq.cadeados} olhar={esq.olhar ?? [1, 0]} brilho={esq.brilho} exp={esq.exp} tag /></div>
    <div style={{position: 'absolute', left: 1385 + (lugar === 'cais' ? -40 : 0), top: lugar === 'cais' ? 250 : 195, zIndex: 3, transform: 'scaleX(-1)'}}><Pedra cor={dir.cor} s={360} f={f} rod={rod} humor={dir.humor} fala={dir.fala} gesto={dir.gesto} cadeados={dir.cadeados} maoBolso={dir.maoBolso} semAnel={dir.semAnel} cabecaBaixa={dir.cabecaBaixa} olhar={dir.olhar ? [-dir.olhar[0], dir.olhar[1]] : [-1, 0]} brilho={dir.brilho} exp={dir.exp} espelho tag /></div>
    {lugar === 'cais' ? <div style={{position: 'absolute', left: 1380, top: 860, width: 400, height: 200, background: `repeating-linear-gradient(0deg, #8a6a3a 0 40px, #6a4e26 40px 44px)`, border: `5px solid ${TINTA}`, zIndex: 4}}><div style={{position: 'absolute', left: 20, top: 60, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: '#3a2a10'}}>PEIXE · PEDRA ALTA</div></div> : null}
    <div style={{position: 'absolute', left: 360, top: 720, width: 1200, height: 380, zIndex: 5}}>
      <Img src={staticFile('tribunal/palco/tribuna_c1.png')} style={{position: 'absolute', left: -360, top: -692, width: 1920, height: 1080, filter: lugar === 'cais' ? 'brightness(0.85) sepia(0.2)' : undefined}} />
      <div style={{position: 'absolute', left: 430, top: 6, width: 340, height: 100, background: PERG, border: '3px solid #6b5a3a', transform: 'perspective(500px) rotateX(48deg)', boxShadow: '0 8px 0 #3b1d10'}}><div style={{position: 'absolute', left: 168, top: 0, bottom: 0, width: 4, background: '#6b5a3a'}} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Chip rod={rod} f={f} fs={22} extra={lugar === 'cais' ? 'CAIS' : lugar === 'corredor' ? 'CORREDOR DOS FUNDOS' : lugar === 'lab' ? 'LABORATÓRIO' : 'INVESTIGAÇÃO'} /></div>
    </div>
    {children}
  </AbsoluteFill>
);

// ---------- planta do museu (maquete vista de cima) ----------
export const LOC: Record<string, [number, number, number, number, string]> = {
  L1: [756, 236, 440, 380, 'SALÃO DA LENTE'], L2: [1024, 40, 412, 310, 'TERRAÇO'], L5: [1200, 360, 80, 310, 'CORREDOR DO TERRAÇO'], L3: [566, 620, 184, 320, 'SALA DE SEGURANÇA'],
  L6: [756, 620, 440, 320, 'SALÃO DA FESTA'], L4: [124, 40, 286, 290, 'CASA DA RÉ'], L7: [1396, 704, 240, 286, 'ARQUIVO DO JORNAL'], L8: [1640, 704, 230, 286, 'LABORATÓRIO'], FUNDOS: [1200, 670, 80, 110, 'PORTA DOS FUNDOS'],
};
export const centroLoc = (id: string): [number, number] => { const l = LOC[id] ?? LOC.L1; return [l[0] + l[2] / 2, l[1] + l[3] / 2]; };
export const Planta: React.FC<{f: number; visitados?: {loc: string; at: number}[]; quem?: {cor: string; rota: {loc: string; at: number}[]}[]; rod?: string; acesos?: string[]}> = ({f, visitados = [], quem = [], rod, acesos = []}) => (
  <AbsoluteFill style={{background: '#1c2a3a'}}>
    <Img src={staticFile('tribunal/palco/museu_planta.jpg')} style={{position: 'absolute', left: 0, top: 4, width: 1920, height: 1072}} />
    {Object.entries(LOC).map(([id, [x, y, w, h, nome]]) => {
      const v = visitados.find((q) => q.loc === id && f >= q.at), t = v ? f - v.at : -1, aceso = acesos.includes(id) || t >= 0;
      const estreito = w < 120;
      return (
        <div key={id} style={{position: 'absolute', left: x, top: y, width: w, height: h, border: aceso ? `6px solid ${LUZ}` : '3px dashed #ffffff66', borderRadius: 8, boxShadow: aceso ? `0 0 ${30 + 10 * Math.sin(f * 0.2)}px ${LUZ}, inset 0 0 40px ${LUZ}55` : 'none', transform: `scale(${t >= 0 && t < 14 ? 1 + 0.05 * Math.sin((t / 14) * Math.PI) : 1})`}}>
          <div style={{position: 'absolute', left: estreito ? w + 8 : 10, top: estreito ? 10 : 8, fontFamily: POP, fontWeight: 800, fontSize: 21, lineHeight: 1.05, color: TINTA, background: aceso ? `linear-gradient(${LUZ}, ${LATAO})` : PERG, border: `3px solid ${TINTA}`, borderRadius: 6, padding: '1px 8px', whiteSpace: 'nowrap', boxShadow: '0 4px 0 #0007'}}>{nome}</div>
        </div>
      );
    })}
    {quem.map((q, i) => {
      const r = q.rota; let k = 0; while (k < r.length - 1 && f >= r[k + 1].at) k++;
      const a = centroLoc(r[k].loc), b = r[k + 1] ? centroLoc(r[k + 1].loc) : a, t0 = r[k + 1] ? r[k + 1].at - 26 : 1e9;
      const u = r[k + 1] ? ease(f, t0, r[k + 1].at) : 0, x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u, anda = u > 0 && u < 1;
      return <div key={i} style={{position: 'absolute', left: x - 70 + i * 50, top: y - 150 - (anda ? Math.abs(Math.sin(f * 0.5)) * 14 : 0), zIndex: 20}}><Pedra cor={q.cor} s={140} f={f} rod={rod} humor={anda ? 'normal' : 'feliz'} olhar={[b[0] > a[0] ? 1 : -1, 0]} /></div>;
    })}
  </AbsoluteFill>
);

// ---------- o museu em corte + a régua de latão (noite do crime, 22:10 a 22:35) ----------
const NIVEL: Record<string, number> = {'22:12': 1, '22:16': 1, '22:26': 1, '22:27': 2, '22:35': 1};
export const MARCOS = ['22:10', '22:12', '22:14', '22:16', '22:18', '22:22', '22:26', '22:27', '22:28', '22:35'];
const min = (h: string) => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };
export const xHora = (h: string) => 150 + ((min(h) - min('22:10')) / 25) * 1620;
export const SALA_C: [string, number, number, string][] = [['SEGURANÇA', 72, 222, 'L3'], ['SALÃO DA FESTA', 294, 413, 'L6'], ['CORREDOR', 707, 180, 'ESC'], ['SALÃO DA LENTE', 887, 401, 'L1'], ['CORREDOR DO TERRAÇO', 1288, 197, 'L5'], ['FUNDOS', 1485, 186, 'FUNDOS']];
// posições antigas (diagrama) -> posições na ilustração do museu em corte (paredes medidas na imagem)
const XA = [60, 335, 705, 885, 1255, 1535, 1800], XN = [72, 294, 707, 887, 1288, 1485, 1671];
export const mxC = (x: number) => { if (x <= XA[0]) return XN[0] + (x - XA[0]); for (let i = 0; i < XA.length - 1; i++) if (x <= XA[i + 1]) return XN[i] + ((x - XA[i]) / (XA[i + 1] - XA[i])) * (XN[i + 1] - XN[i]); return XN[XN.length - 1] + (x - XA[XA.length - 1]); };
export const Corte: React.FC<{f: number; aceso: (h: string) => number; escuro?: number; janela?: [string, string, number]; children?: React.ReactNode; sobre?: React.ReactNode; atores?: React.ReactNode}> = ({f, aceso, escuro = 0, janela, children, sobre, atores}) => (
  <AbsoluteFill style={{background: NOITE}}>
    <Img src={staticFile('tribunal/palco/museu_corte.jpg')} style={{position: 'absolute', left: -12, top: -124, width: 1775, height: 991}} />
    <Chuva f={f} n={40} op={0.18} />
    <AbsoluteFill style={{background: `linear-gradient(100deg, #0000 ${((f % 120) / 120) * 160 - 40}%, ${LUZ}1c ${((f % 120) / 120) * 160 - 22}%, #0000 ${((f % 120) / 120) * 160 - 4}%)`, mixBlendMode: 'screen'}} />
    {SALA_C.map(([n, x, w]) => <div key={n} style={{position: 'absolute', left: x + w / 2, top: 196, transform: 'translateX(-50%)', fontFamily: POP, fontWeight: 800, fontSize: w < 230 ? 18 : 22, lineHeight: 1.05, color: TINTA, background: `linear-gradient(${LUZ}, ${LATAO})`, border: `3px solid ${TINTA}`, borderRadius: 6, padding: '1px 8px', whiteSpace: 'nowrap', boxShadow: '0 4px 0 #0007', zIndex: 2}}>{n}</div>)}
    <div style={{position: 'absolute', left: 1470, top: 40, transform: 'translateX(-50%)', fontFamily: POP, fontWeight: 800, fontSize: 22, color: TINTA, background: `linear-gradient(${LUZ}, ${LATAO})`, border: `3px solid ${TINTA}`, borderRadius: 6, padding: '1px 8px', zIndex: 2}}>TERRAÇO</div>
    {atores}
    {escuro > 0 ? <AbsoluteFill style={{background: '#000', opacity: escuro * 0.82}} /> : null}
    {/* a régua */}
    <div style={{position: 'absolute', left: 110, top: 790, width: 1700, height: 30, background: `linear-gradient(${LUZ}, ${LATAO} 50%, #8a6d14)`, border: `4px solid ${TINTA}`, borderRadius: 8}} />
    {janela ? <div style={{position: 'absolute', left: xHora(janela[0]), top: 760, width: xHora(janela[1]) - xHora(janela[0]), height: 90, border: `5px dashed ${PERG}`, borderRadius: 10, opacity: janela[2]}}><div style={{position: 'absolute', left: 0, right: 0, top: -44, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 28, color: PERG}}>LAUDO: {janela[0]} A {janela[1]}</div></div> : null}
    {MARCOS.map((h) => { const a = aceso(h), x = xHora(h), golpe = h === '22:18'; return (
      <div key={h} style={{position: 'absolute', left: x - 60, top: 770, width: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: golpe ? 30 : 10}}>
        <div style={{width: 34, height: 34, borderRadius: 17, background: a > 0 ? (golpe ? '#C0262E' : LUZ) : CHUMBO, border: `5px solid ${TINTA}`, boxShadow: a > 0 ? `0 0 ${20 + 14 * a}px ${golpe ? '#ff3b3b' : LUZ}` : 'none', marginTop: 22, transform: `scale(${1 + 0.4 * a * (a < 1 ? 1 : 0)})`}} />
        <div style={{marginTop: 8, fontFamily: MONO, fontWeight: 700, fontSize: golpe && a > 0 ? 50 : 34, lineHeight: 1, color: a > 0 ? (golpe ? '#ff5a4a' : '#fff') : '#7c8590', ...C(6), transform: `translateY(${(NIVEL[h] ?? 0) * 46}px)`}}>{h}</div>
      </div>
    ); })}
    {children}
    {sobre}
  </AbsoluteFill>
);

// ---------- gravura "SÓ VOCÊ VÊ": 15 anos atrás, noite de tempestade (azul-noite e âmbar) ----------
export type GravK = {luz?: number; rubi?: number; tranca?: number; anel?: number; barco?: number; naufragio?: number; anselmo?: number; janela?: number; cores?: boolean; relogio?: string; envelope?: number; peridoto?: number};
// imagem inteira (sem fatiar, sem buracos) com deslocamento 3D pelo mapa de profundidade
const Inteira: React.FC<{nome: string; f: number}> = ({nome, f}) => <Camada src={staticFile(`tribunal/palco/${nome}.jpg`)} prof={0.62} f={f} z={0} zoom={1.08} ox={0} oy={0} desl={staticFile(`tribunal/palco/${nome}_desl.png`)} amp={0.8} />;
// ---------- o passado (15 anos atrás): ilustrações geradas, em camadas 2.5D, trocando conforme a cena pede ----------
export const Gravura: React.FC<{f: number; k: GravK; apagada?: number}> = ({f, k, apagada = 0}) => {
  const env = k.envelope ?? 0, ans = Math.max(k.anselmo ?? 0, k.janela ?? 0), nau = Math.max(k.naufragio ?? 0, k.peridoto ?? 0), bar = k.barco ?? 0;
  const tr = Math.max(k.rubi ?? 0, k.tranca ?? 0, k.anel ?? 0);
  const base = tr > 0.01 || (!bar && !nau && !ans && !env) ? 'fb_tranca' : 'fb_apagado';
  const cam: [string, number][] = [['fb_apagado', base === 'fb_tranca' ? bar : 0], ['fb_naufragio', nau], ['fb_anselmo', ans], ['fb_envelope', env]];
  const aceso = Math.max(tr, bar, nau, ans, env, k.luz ?? 0);
  const cor = k.cores ? 'saturate(1.08)' : 'saturate(0.7) sepia(0.15)';
  const brilho = (0.38 + 0.62 * aceso) * (1 - apagada * 0.6);
  return (
    <AbsoluteFill style={{background: '#070b14', overflow: 'hidden'}}>
      <AbsoluteFill style={{filter: `${cor} brightness(${brilho})`, transform: `scale(${1.02 + 0.05 * Math.sin(f / 200)})`}}>
        <Inteira nome={base} f={f} />
        {cam.map(([n, w]) => w > 0.01 ? <AbsoluteFill key={n} style={{opacity: Math.min(1, w / 0.12)}}><Inteira nome={n} f={f} /></AbsoluteFill> : null)}
      </AbsoluteFill>
      {base === 'fb_tranca' && (k.anel ?? 0) > 0 ? <div style={{position: 'absolute', left: 0.56 * 1920 - 90, top: 0.57 * 1080 - 90, width: 180, height: 180, borderRadius: 90, background: `radial-gradient(${LUZ}ee, ${LATAO}66 40%, #0000 70%)`, opacity: (k.anel ?? 0) * (0.6 + 0.4 * Math.sin(f * 0.3)), mixBlendMode: 'screen'}} /> : null}
      <Chuva f={f} n={70} op={0.35} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #0000 45%, #000c 100%)'}} />
      {k.relogio ? <div style={{position: 'absolute', right: 200, top: 200, fontFamily: MONO, fontWeight: 700, fontSize: 64, color: LUZ, background: '#0009', border: `4px solid ${LATAO}`, borderRadius: 12, padding: '0 18px', ...C(4)}}>{k.relogio}</div> : null}
    </AbsoluteFill>
  );
};

export const GravuraSvg: React.FC<{f: number; k: GravK; apagada?: number}> = ({f, k, apagada = 0}) => {
  const cores = !!k.cores, AZ = cores ? '#1d3a66' : '#0d1a33', TR = cores ? '#2a4a7a' : '#1c3156', AM = '#E8A33A';
  const raio = Math.max(0, Math.sin(f * 0.13) ** 40) * (cores ? 0.6 : 0.4);
  return (
    <AbsoluteFill style={{background: AZ, opacity: 1 - apagada}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <defs><pattern id="hach" width={9} height={9} patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0 V9" stroke={TR} strokeWidth={2.4} /></pattern><pattern id="hach2" width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><path d="M0 0 V7" stroke="#08101f" strokeWidth={2.6} /></pattern></defs>
        <rect width={1920} height={780} fill="url(#hach)" />
        <rect width={1920} height={1080} fill="#fff" opacity={raio} />
        {/* penhasco e torre */}
        <path d="M0 1080 V720 Q160 640 380 660 Q560 610 700 700 L760 1080Z" fill={cores ? '#3a3a3a' : '#0a1426'} stroke="#000" strokeWidth={5} />
        <path d="M0 1080 V720 Q160 640 380 660 Q560 610 700 700 L760 1080Z" fill="url(#hach2)" />
        <path d="M430 660 L470 220 H570 L610 660Z" fill={cores ? '#e9e2cf' : '#1a2a48'} stroke="#000" strokeWidth={6} />
        {cores ? [0, 1, 2].map((i) => <path key={i} d={`M${446 + i * 6} ${560 - i * 120} L${452 + i * 6} ${500 - i * 120} H${588 - i * 6} L${594 - i * 6} ${560 - i * 120}Z`} fill="#b5372e" />) : <path d="M430 660 L470 220 H570 L610 660Z" fill="url(#hach2)" opacity={0.6} />}
        <rect x={455} y={150} width={130} height={72} fill={k.luz ? LUZ : '#0a0f1a'} stroke="#000" strokeWidth={6} />
        <path d="M440 150 L520 96 L600 150Z" fill={cores ? '#6a2a1a' : '#0a1426'} stroke="#000" strokeWidth={6} />
        {k.luz ? <path d={`M520 186 L${520 + 1400 * Math.cos(f / 22)} ${120} L${520 + 1400 * Math.cos(f / 22)} ${260}Z`} fill={LUZ} opacity={0.25 * (k.luz ?? 0)} /> : null}
        {(k.janela ?? 0) > 0 ? <g opacity={k.janela}><rect x={495} y={300} width={50} height={64} fill={AM} stroke="#000" strokeWidth={4} /><path d={`M505 ${352 - Math.abs(Math.sin(f * 0.6)) * 14} l10 -16 l10 16`} fill="#000" /><text x={600} y={330} fontFamily="Bangers" fontSize={44} fill={AM} transform={`rotate(-8 600 330)`}>TUM! TUM!</text></g> : null}
        {/* porta da torre */}
        <rect x={492} y={560} width={58} height={100} fill={cores ? '#5a3a24' : '#08101f'} stroke="#000" strokeWidth={5} />
        {(k.tranca ?? 0) > 0 ? <g transform="translate(545 610)"><g transform="scale(1.4)"><rect x={-9} y={-4} width={18} height={15} rx={3} fill={LATAO} stroke="#000" strokeWidth={2.5} /><path d={`M-6 -4 V${-10 + (1 - (k.tranca ?? 0)) * -6} a6 6 0 0 1 12 0 V-4`} fill="none" stroke="#000" strokeWidth={3} /></g></g> : null}
        {/* mar */}
        <path d={`M700 800 Q900 ${770 + Math.sin(f * 0.05) * 10} 1100 800 T1500 800 T1920 800 V1080 H700Z`} fill={cores ? '#16325a' : '#0b1730'} />
        {Array.from({length: 8}).map((_, i) => <path key={i} d={`M${700 + ((f * 1.5 + i * 160) % 1300)} ${830 + i * 28} q40 -16 80 0 q40 16 80 0`} fill="none" stroke={cores ? '#7aa6d6' : '#2a4a7a'} strokeWidth={4} />)}
        {/* pedras à direita */}
        <path d="M1500 1080 L1560 880 L1640 920 L1700 860 L1800 940 L1920 900 V1080Z" fill={cores ? '#2f2f2f' : '#070d18'} stroke="#000" strokeWidth={5} />
        {/* barco sem luzes entrando na enseada */}
        {(k.barco ?? 0) > 0 ? (() => { const x = 1900 - (k.barco ?? 0) * 900; return <g transform={`translate(${x} ${812 + Math.sin(f * 0.1) * 6})`}><path d="M-110 0 H110 L80 46 H-80Z" fill={cores ? '#3a2a1a' : '#050a14'} stroke={cores ? '#000' : '#2a4a7a'} strokeWidth={4} /><path d="M0 0 V-130 M0 -120 L70 -20 H0" fill="none" stroke={cores ? '#000' : '#2a4a7a'} strokeWidth={4} /><text x={0} y={-150} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={30} fill={AM}>BARCO SEM LUZES</text></g>; })() : null}
        {/* Estrela do Mar nas pedras */}
        {(k.naufragio ?? 0) > 0 ? <g opacity={Math.min(1, (k.naufragio ?? 0) * 2)} transform={`translate(1640 ${860 + (k.naufragio ?? 0) * 30}) rotate(${-18 * (k.naufragio ?? 0)})`}><path d="M-130 0 H130 L96 56 H-96Z" fill={cores ? '#e9e2cf' : '#1c3156'} stroke="#000" strokeWidth={5} /><path d="M-20 0 V-140" stroke="#000" strokeWidth={6} /><circle cx={-30} cy={-150} r={10} fill={AM} opacity={0.5 + 0.5 * Math.sin(f * 0.6)} /><text x={0} y={40} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={22} fill="#000">ESTRELA DO MAR</text></g> : null}
        {(k.naufragio ?? 0) > 0.5 ? [0, 1, 2].map((i) => <g key={i} transform={`translate(${1300 + i * 110} ${930 + Math.sin(f * 0.15 + i) * 8})`}><circle r={22} fill={cores ? '#d8b89a' : '#3a5a8a'} stroke="#000" strokeWidth={4} />{i === 1 ? <path d="M-24 -10 Q0 -40 24 -10 Z M14 -14 l26 -2" fill={COR.Lima} stroke="#000" strokeWidth={4} /> : null}</g>) : null}
        {(k.peridoto ?? 0) > 0 ? <g opacity={k.peridoto}><path d="M1410 870 L1420 800" stroke={COR.Lima} strokeWidth={8} /><path d="M1420 790 l-14 22 l26 0Z" fill={COR.Lima} /><text x={1420} y={770} textAnchor="middle" fontFamily="Bangers" fontSize={64} fill={COR.Lima} stroke="#000" strokeWidth={8} paintOrder="stroke fill">PERIDOTO</text></g> : null}
        {/* Anselmo religa a luz */}
        {(k.anselmo ?? 0) > 0 ? <g opacity={Math.min(1, (k.anselmo ?? 0) * 3)}><path d="M455 150 l40 30 M585 150 l-30 40" stroke="#fff" strokeWidth={5} /><circle cx={520} cy={250} r={26} fill={cores ? '#E9E1CC' : '#2a4a7a'} stroke="#000" strokeWidth={4} /><path d="M494 320 Q520 270 546 320Z" fill={cores ? '#E9E1CC' : '#2a4a7a'} stroke="#000" strokeWidth={4} /><text x={360} y={260} textAnchor="end" fontFamily="Poppins" fontWeight={800} fontSize={30} fill={AM}>ANSELMO</text>{(k.anselmo ?? 0) > 0.5 ? <g transform="translate(600 420) rotate(8)"><rect width={70} height={50} fill={PERG} stroke="#000" strokeWidth={3} /><path d="M10 14 h50 M10 26 h40" stroke="#000" strokeWidth={3} /><text x={80} y={36} fontFamily="Poppins" fontWeight={800} fontSize={24} fill={AM}>A PÁGINA, NA BASE DA LENTE</text></g> : null}</g> : null}
      </svg>
      {/* o jovem Rubi com a lanterna, trancando a porta por fora */}
      {(k.rubi ?? 0) > 0 ? <div style={{position: 'absolute', left: 560, top: 470, opacity: k.rubi, filter: cores ? undefined : 'saturate(0.35) brightness(0.8)'}}>
        <svg width={260} height={240} style={{position: 'absolute', left: -60, top: 20, overflow: 'visible'}}><path d={`M70 120 L-80 70 L-80 190Z`} fill={AM} opacity={0.35 + 0.1 * Math.sin(f * 0.4)} /><circle cx={70} cy={120} r={12} fill={AM} /></svg>
        <Pedra cor="Vermelho" s={170} f={f} olhar={[-1, 0]} gesto={0.6} humor="cinico" />
        {(k.anel ?? 0) > 0 ? <svg width={120} height={120} style={{position: 'absolute', left: 130, top: 170, overflow: 'visible'}}><path d="M0 -40 L8 -8 L40 0 L8 8 L0 40 L-8 8 L-40 0 L-8 -8Z" fill={LUZ} opacity={k.anel} transform={`rotate(${f * 4}) scale(${0.6 + 0.4 * Math.sin(f * 0.3)})`} /></svg> : null}
      </div> : null}
      {(k.envelope ?? 0) > 0 ? <div style={{position: 'absolute', left: 820 + (1 - (k.envelope ?? 0)) * 500, top: 360, transform: `rotate(${-8 + (k.envelope ?? 0) * 8}deg)`}}>
        <svg width={360} height={220}><rect x={10} y={10} width={340} height={200} fill={PERG} stroke="#000" strokeWidth={6} /><path d="M10 10 L180 120 L350 10" fill="none" stroke="#000" strokeWidth={5} /><text x={180} y={190} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={26} fill="#000">ESTALEIRO</text></svg>
      </div> : null}
      {k.relogio ? <div style={{position: 'absolute', right: 80, top: 70, display: 'flex', alignItems: 'center', gap: 14}}><svg width={110} height={110}><circle cx={55} cy={55} r={48} fill={PERG} stroke="#000" strokeWidth={6} /><path d={`M55 55 L55 18 M55 55 L${55 + 30 * Math.cos(-Math.PI / 2 + (Number(k.relogio.slice(3)) / 60) * Math.PI * 2)} ${55 + 30 * Math.sin(-Math.PI / 2 + (Number(k.relogio.slice(3)) / 60) * Math.PI * 2)}`} stroke="#000" strokeWidth={6} strokeLinecap="round" /></svg><div style={{fontFamily: MONO, fontWeight: 700, fontSize: 110, color: AM, ...C(8)}}>{k.relogio}</div></div> : null}
      <Chuva f={f} n={90} op={cores ? 0.35 : 0.55} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #0000 50%, #000b 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- dado grande: fundo liso de noite com moldura de latão ----------
export const Liso: React.FC<{f: number; tom?: string; children?: React.ReactNode}> = ({f, tom = NOITE, children}) => (
  <AbsoluteFill style={{background: tom}}>
    <Img src={staticFile('tribunal/palco/geral.jpg')} style={{position: 'absolute', left: -120 + Math.sin(f / 95) * 30, top: -70 + Math.cos(f / 130) * 12, width: 2160, height: 1220, objectFit: 'cover', filter: 'brightness(0.34) saturate(0.85)'}} />
    <AbsoluteFill style={{background: tom, opacity: 0.55}} />
    <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(35deg, #ffffff06 0 2px, #0000 2px 9px)', backgroundPosition: `${f * 0.3}px 0`}} />
    <AbsoluteFill style={{background: `linear-gradient(100deg, #0000 ${((f % 120) / 120) * 160 - 40}%, ${LUZ}14 ${((f % 120) / 120) * 160 - 22}%, #0000 ${((f % 120) / 120) * 160 - 4}%)`}} />
    <div style={{position: 'absolute', inset: 26, border: `5px solid ${LATAO}88`, borderRadius: 18}} />
    {children}
  </AbsoluteFill>
);

// ---------- tela dividida S x J, fio de latão no meio ----------
export const Divide: React.FC<{f: number; esq: React.ReactNode; dir: React.ReactNode; foco?: number}> = ({f, esq, dir, foco = 0}) => {
  const m = 960 + foco * 300;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, top: 0, width: m, height: 1080, overflow: 'hidden', background: '#10203e'}}><div style={{position: 'absolute', left: (m - 960) / 2, top: 0, width: 960, height: 1080}}>{esq}</div></div>
      <div style={{position: 'absolute', left: m, top: 0, right: 0, height: 1080, overflow: 'hidden', background: '#0e2a22'}}><div style={{position: 'absolute', left: (1920 - m - 960) / 2, top: 0, width: 960, height: 1080}}>{dir}</div></div>
      <div style={{position: 'absolute', left: m - 7, top: 0, width: 14, height: 1080, background: `linear-gradient(90deg, #8a6d14, ${LUZ}, #8a6d14)`, borderLeft: `3px solid ${TINTA}`, borderRight: `3px solid ${TINTA}`, zIndex: 20}} />
    </AbsoluteFill>
  );
};

// ---------- figura de papel para quem não é IA (a vítima Lia, o Anselmo) ----------
// pessoas que não são IA (Lia, Anselmo, Dr. Valdomiro): retratos gerados; o resto cai no boneco de papel
const EXTRA = (nome: string) => /LIA/i.test(nome) ? 'lia' : /ANSELMO/i.test(nome) ? 'anselmo' : /VALDOMIRO/i.test(nome) ? 'valdomiro' : null;
export const Papel: React.FC<{s: number; nome: string; cor?: string; caida?: number}> = (p) => {
  const ex = EXTRA(p.nome);
  if (!ex) return <PapelSvg {...p} />;
  const {s, nome, cor = '#E9E1CC', caida = 0} = p;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `rotate(${caida * 82}deg)`, transformOrigin: '50% 100%'}}>
      <div style={{width: s * 1.3, height: s * 1.5, overflow: 'hidden', display: 'flex', justifyContent: 'center'}}><Img src={staticFile(`tribunal/sprites/extra_${ex}.png`)} style={{height: s * 2.2, width: 'auto', filter: 'drop-shadow(0 6px 8px #0008)'}} /></div>
      <div style={{fontFamily: POP, fontWeight: 800, fontSize: Math.max(18, s * 0.22), color: TINTA, background: cor, border: `3px solid ${TINTA}`, borderRadius: 6, padding: '0 6px', whiteSpace: 'nowrap', transform: `rotate(${-caida * 82}deg)`}}>{nome}</div>
    </div>
  );
};
const PapelSvg: React.FC<{s: number; nome: string; cor?: string; caida?: number}> = ({s, nome, cor = '#E9E1CC', caida = 0}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `rotate(${caida * 82}deg)`, transformOrigin: '50% 100%'}}>
    <svg viewBox="0 0 100 150" width={s} height={s * 1.5}><g stroke={TINTA} strokeWidth={5} fill={cor}><circle cx={50} cy={32} r={24} /><path d="M18 148 L26 70 Q50 58 74 70 L82 148Z" /></g></svg>
    <div style={{fontFamily: POP, fontWeight: 800, fontSize: Math.max(18, s * 0.22), color: TINTA, background: cor, border: `3px solid ${TINTA}`, borderRadius: 6, padding: '0 6px', whiteSpace: 'nowrap', transform: `rotate(${-caida * 82}deg)`}}>{nome}</div>
  </div>
);

export {Piso};
