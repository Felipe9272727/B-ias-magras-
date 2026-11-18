// TRIBUNAL: os cenários. Tribunal de madeira de navio (5 planos), mesa de investigação, cais, planta do museu (maquete),
// corte do museu com a régua de latão da noite do crime, gravura "SÓ VOCÊ VÊ" de 15 anos atrás, dado grande e tela dividida.
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {AMBAR, BANG, C, CHUMBO, cl, COR, ease, hash, LATAO, LUZ, MAD_C, MAD_E, MARINHO, MONO, NOITE, NOME, PERG, Pedra, POP, quique, rnd, sombra, TINTA, type Humor} from './base';
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

export type Gente = {cor: string; humor?: Humor; fala?: boolean; gesto?: number; cadeados?: number; maoBolso?: boolean; semAnel?: boolean; cabecaBaixa?: number; silh?: boolean; olhar?: [number, number]; brilho?: number; dx?: number; dy?: number; papel?: any};
const P: React.FC<{g?: Gente; x: number; y: number; s: number; f: number; rod?: string | null; z?: number; flip?: boolean}> = ({g, x, y, s, f, rod, z = 3, flip}) => g ? (
  <div style={{position: 'absolute', left: x + (g.dx ?? 0), top: y + (g.dy ?? 0), zIndex: z, transform: flip ? 'scaleX(-1)' : undefined}}>
    <Pedra cor={g.cor} s={s} f={f} rod={rod} humor={g.humor} fala={g.fala} gesto={g.gesto} cadeados={g.cadeados} maoBolso={g.maoBolso} semAnel={g.semAnel} cabecaBaixa={g.cabecaBaixa} silh={g.silh} olhar={flip && g.olhar ? [-g.olhar[0], g.olhar[1]] : g.olhar} brilho={g.brilho} papel={g.papel} />
  </div>
) : null;
const tag = (g: Gente | undefined, rod: string | null | undefined, papel: string) => (g ? `${NOME[g.cor].toUpperCase()} · ${papel}` : undefined);

// ---------- o tribunal, em 5 planos ----------
export type Plano = 'geral' | 'banco' | 'tribuna' | 'juiz' | 'promotor';
export type Quem = {juiz?: Gente; testemunha?: Gente; advogada?: Gente; re?: Gente; promotor?: Gente; acusado?: Gente; assistente?: Gente; delegado?: Gente};
export const Sala: React.FC<{plano: Plano; f: number; clima?: Clima; rod?: string | null; quem: Quem; children?: React.ReactNode; contraluz?: boolean; vazio?: boolean}> = ({plano, f, clima = 'dia', rod, quem: q, children, contraluz, vazio}) => {
  const tom = hash(plano) % 60;
  return (
    <AbsoluteFill>
      <Parede f={f} clima={clima} tom={tom} />
      {plano === 'geral' ? <>
        <Vitral f={f} x={960} y={210} r={120} clima={clima} />
        <P g={q.juiz} x={835} y={250} s={250} f={f} rod={rod} />
        <Bancada x={600} y={520} w={720} h={170} nome={vazio ? undefined : 'JUIZ'} />
        <P g={q.testemunha} x={150} y={420} s={210} f={f} rod={rod} />
        <Bancada x={90} y={640} w={380} h={150} nome={tag(q.testemunha, rod, 'TESTEMUNHA')} cor={q.testemunha?.cor} />
        <P g={q.delegado} x={520} y={600} s={150} f={f} rod={rod} z={2} />
        <P g={q.advogada} x={1290} y={480} s={230} f={f} rod={rod} />
        <P g={q.re} x={1560} y={560} s={190} f={f} rod={rod} />
        <P g={q.assistente} x={1110} y={600} s={160} f={f} rod={rod} z={2} />
        <Bancada x={1200} y={770} w={640} h={150} nome={q.advogada ? `DEFESA · ${NOME[q.advogada.cor].toUpperCase()}` : undefined} cor={q.advogada?.cor} />
        <P g={q.promotor} x={130} y={700} s={190} f={f} rod={rod} />
        <Bancada x={60} y={900} w={500} h={140} nome={tag(q.promotor, rod, 'PROMOTOR')} cor={q.promotor?.cor} />
        {Array.from({length: 2}).map((_, i) => <div key={i} style={{position: 'absolute', left: 560 + i * 40, right: 560 - i * 40 + (i ? 0 : 0), top: 960 + i * 50, height: 40, background: '#1a0f08', border: '3px solid #000', borderRadius: 6, zIndex: 6}} />)}
      </> : null}
      {plano === 'banco' ? <>
        <Vitral f={f} x={720} y={170} r={100} clima={clima} />
        <P g={q.testemunha} x={170} y={250} s={420} f={f} rod={rod} />
        <Bancada x={60} y={700} w={760} h={380} nome={tag(q.testemunha, rod, 'TESTEMUNHA')} cor={q.testemunha?.cor} />
        <P g={q.delegado} x={640} y={420} s={200} f={f} rod={rod} z={1} />
      </> : null}
      {plano === 'tribuna' ? <>
        <Vitral f={f} x={960} y={190} r={105} clima={clima} />
        <P g={q.advogada} x={120} y={260} s={380} f={f} rod={rod} />
        <P g={q.re} x={560} y={470} s={270} f={f} rod={rod} />
        <P g={q.assistente} x={760} y={540} s={200} f={f} rod={rod} z={2} />
        <Bancada x={40} y={790} w={900} h={300} nome={q.advogada ? `DEFESA · ${NOME[q.advogada.cor].toUpperCase()}` : undefined} cor={q.advogada?.cor} />
        <P g={q.acusado} x={1400} y={350} s={340} f={f} rod={rod} flip />
        <Bancada x={1220} y={810} w={660} h={280} nome={tag(q.acusado, rod, 'TESTEMUNHA')} cor={q.acusado?.cor} />
      </> : null}
      {plano === 'juiz' ? <>
        <Vitral f={f} x={960} y={330} r={250} clima={clima} contraluz={contraluz} />
        <div style={{position: 'absolute', left: 960 - 270, top: 40, filter: contraluz ? 'brightness(0.25) contrast(1.2)' : undefined}}><P g={q.juiz} x={0} y={0} s={540} f={f} rod={rod} /></div>
        <Bancada x={-20} y={640} w={1960} h={460} nome={vazio ? undefined : 'JUIZ · AMETISTA'} cor="Roxo">
          <svg width={200} height={200} style={{position: 'absolute', left: 880, top: 140}}><g stroke={TINTA} strokeWidth={6} fill={LATAO}><path d="M80 180 L90 60 H110 L120 180Z" /><rect x={82} y={30} width={36} height={30} /><path d="M70 30 L100 6 L130 30Z" /></g></svg>
        </Bancada>
      </> : null}
      {plano === 'promotor' ? <>
        <Vitral f={f} x={1560} y={200} r={110} clima={clima} />
        <P g={q.promotor} x={620} y={190} s={480} f={f} rod={rod} />
        <Bancada x={260} y={800} w={1300} h={290} nome={tag(q.promotor, rod, 'PROMOTOR')} cor={q.promotor?.cor} />
      </> : null}
      {children}
    </AbsoluteFill>
  );
};

// ---------- mesa de investigação: duas cadeiras de frente, o Registro na mesa ----------
export const Mesa: React.FC<{f: number; esq: Gente; dir: Gente; rod: string; lugar?: 'sala' | 'cais' | 'corredor' | 'lab'; children?: React.ReactNode; tv?: boolean}> = ({f, esq, dir, rod, lugar = 'sala', children, tv}) => (
  <AbsoluteFill>
    {lugar === 'cais' ? <AbsoluteFill style={{background: CEU.tarde}}>
      <div style={{position: 'absolute', left: 1380, top: 200, width: 120, height: 120, borderRadius: 60, background: '#ffd27a', boxShadow: '0 0 90px #ffb04d'}} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d="M0 520 H1920 V1080 H0Z" fill="#3a2d4f" />
        {Array.from({length: 9}).map((_, i) => <path key={i} d={`M${-100 + ((f * (0.6 + i * 0.05)) % 200)} ${540 + i * 26} q60 -10 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0`} fill="none" stroke="#ffb04d" strokeWidth={3} opacity={0.35 - i * 0.03} />)}
        <path d="M200 520 L230 300 H262 L292 520Z" fill="#20182e" /><rect x={226} y={270} width={40} height={30} fill="#20182e" /><circle cx={246} cy={285} r={9} fill={LUZ} opacity={0.7 + 0.3 * Math.sin(f * 0.2)} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, bottom: 0, background: `repeating-linear-gradient(90deg, ${MAD_C} 0 130px, #6a4126 130px 136px)`, borderTop: `6px solid ${TINTA}`}} />
    </AbsoluteFill> : <>
      <Parede f={f} clima={lugar === 'lab' ? 'dia' : 'tarde'} tom={lugar === 'corredor' ? 40 : 10} />
      <div style={{position: 'absolute', left: 760, top: 120, width: 400, height: 300, background: lugar === 'lab' ? CEU.dia : CEU.tarde, border: `14px solid ${MAD_E}`, outline: `4px solid ${TINTA}`, overflow: 'hidden'}}>
        <svg width={400} height={300}><path d="M300 300 L312 150 H332 L344 300Z" fill="#20182e" /><circle cx={322} cy={142} r={8} fill={LUZ} /><path d={`M322 142 L${322 + 260 * Math.cos(f / 19)} ${120} L${322 + 260 * Math.cos(f / 19)} ${170}Z`} fill={LUZ} opacity={0.3} /><path d="M0 250 Q100 236 200 250 T400 250 V300 H0Z" fill="#3a2d4f" /></svg>
        <div style={{position: 'absolute', left: 196, top: 0, bottom: 0, width: 8, background: MAD_E}} />
      </div>
      <AbsoluteFill style={{background: 'linear-gradient(120deg, #0000 40%, #ffcf8a1a 50%, #0000 62%)'}} />
    </>}
    {tv ? <div style={{position: 'absolute', left: 1500, top: 250, width: 300, height: 210, background: '#1b1b1b', border: `8px solid #333`, outline: `4px solid ${TINTA}`, borderRadius: 12, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, background: '#2c7a3a'}}><div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 3, background: '#fff8'}} /><div style={{position: 'absolute', left: '42%', top: '38%', width: '16%', height: '24%', border: '3px solid #fff8', borderRadius: '50%'}} /></div>
      <div style={{position: 'absolute', left: 10, top: 10, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: '#fff', background: '#000c', padding: '0 8px', opacity: Math.floor(f / 12) % 2 ? 1 : 0.6}}>FINAL 1 x 0</div>
      <div style={{position: 'absolute', left: 10, bottom: 8, fontFamily: POP, fontWeight: 800, fontSize: 20, color: LUZ}}>ÚLTIMO MINUTO</div>
    </div> : null}
    <div style={{position: 'absolute', left: 80, top: 300, zIndex: 3}}><Pedra cor={esq.cor} s={380} f={f} rod={rod} humor={esq.humor} fala={esq.fala} gesto={esq.gesto} cadeados={esq.cadeados} olhar={esq.olhar ?? [1, 0]} brilho={esq.brilho} /></div>
    <div style={{position: 'absolute', left: 1440 + (lugar === 'cais' ? -40 : 0), top: lugar === 'cais' ? 360 : 300, zIndex: 3, transform: 'scaleX(-1)'}}><Pedra cor={dir.cor} s={380} f={f} rod={rod} humor={dir.humor} fala={dir.fala} gesto={dir.gesto} cadeados={dir.cadeados} maoBolso={dir.maoBolso} semAnel={dir.semAnel} cabecaBaixa={dir.cabecaBaixa} olhar={dir.olhar ? [-dir.olhar[0], dir.olhar[1]] : [-1, 0]} brilho={dir.brilho} /></div>
    {lugar === 'cais' ? <div style={{position: 'absolute', left: 1380, top: 860, width: 400, height: 200, background: `repeating-linear-gradient(0deg, #8a6a3a 0 40px, #6a4e26 40px 44px)`, border: `5px solid ${TINTA}`, zIndex: 4}}><div style={{position: 'absolute', left: 20, top: 60, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: '#3a2a10'}}>PEIXE · PEDRA ALTA</div></div> : null}
    <div style={{position: 'absolute', left: 360, top: 720, width: 1200, height: 380, zIndex: 5}}>
      <svg width={1200} height={380} style={{position: 'absolute', inset: 0}}><path d="M80 0 H1120 L1200 120 H0Z" fill={lugar === 'cais' ? '#7a5530' : MAD_C} stroke={TINTA} strokeWidth={6} /><path d="M0 120 H1200 V160 H0Z" fill={MAD_E} stroke={TINTA} strokeWidth={6} /><path d="M70 160 V380 M1130 160 V380" stroke={MAD_E} strokeWidth={30} /></svg>
      <div style={{position: 'absolute', left: 430, top: 6, width: 340, height: 100, background: PERG, border: '3px solid #6b5a3a', transform: 'perspective(500px) rotateX(48deg)', boxShadow: '0 8px 0 #3b1d10'}}><div style={{position: 'absolute', left: 168, top: 0, bottom: 0, width: 4, background: '#6b5a3a'}} /></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center'}}><Chip rod={rod} f={f} fs={22} extra={lugar === 'cais' ? 'CAIS' : lugar === 'corredor' ? 'CORREDOR DOS FUNDOS' : lugar === 'lab' ? 'LABORATÓRIO' : 'INVESTIGAÇÃO'} /></div>
    </div>
    {children}
  </AbsoluteFill>
);

// ---------- planta do museu (maquete vista de cima) ----------
export const LOC: Record<string, [number, number, number, number, string]> = {
  L1: [760, 300, 420, 300, 'SALÃO DA LENTE'], L2: [1230, 120, 360, 230, 'TERRAÇO'], L5: [1230, 390, 360, 120, 'CORREDOR DO TERRAÇO'], L3: [300, 560, 380, 240, 'SALA DE SEGURANÇA'],
  L6: [760, 640, 420, 230, 'SALÃO DA FESTA'], L4: [80, 120, 330, 220, 'CASA DA RÉ'], L7: [1640, 620, 250, 220, 'ARQUIVO DO JORNAL'], L8: [1620, 880, 280, 170, 'LABORATÓRIO'], FUNDOS: [1230, 560, 220, 110, 'PORTA DOS FUNDOS'],
};
export const centroLoc = (id: string): [number, number] => { const l = LOC[id] ?? LOC.L1; return [l[0] + l[2] / 2, l[1] + l[3] / 2]; };
export const Planta: React.FC<{f: number; visitados?: {loc: string; at: number}[]; quem?: {cor: string; rota: {loc: string; at: number}[]}[]; rod?: string; acesos?: string[]}> = ({f, visitados = [], quem = [], rod, acesos = []}) => (
  <AbsoluteFill style={{background: '#1c2a3a'}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(#ffffff0c 2px, #0000 2px), linear-gradient(90deg, #ffffff0c 2px, #0000 2px)', backgroundSize: '60px 60px', backgroundPosition: `${f * 0.2}px ${f * 0.1}px`}} />
    <div style={{position: 'absolute', left: 700, top: 90, width: 1160, height: 800, background: '#d8c9a8', border: `8px solid ${TINTA}`, borderRadius: 10, boxShadow: '20px 24px 0 #0008'}} />
    {Object.entries(LOC).map(([id, [x, y, w, h, nome]]) => {
      const v = visitados.find((q) => q.loc === id && f >= q.at), t = v ? f - v.at : -1, aceso = acesos.includes(id) || t >= 0;
      return (
        <div key={id} style={{position: 'absolute', left: x, top: y, width: w, height: h, background: aceso ? '#f6e7c4' : '#b9a986', border: `6px solid ${TINTA}`, borderRadius: 6, boxShadow: `10px 12px 0 #0007${aceso ? `, 0 0 ${30 + 10 * Math.sin(f * 0.2)}px ${LUZ}` : ''}`, transform: `translateY(${t >= 0 && t < 14 ? -14 * (1 - quique(t, 0, 14)) : 0}px)`}}>
          <div style={{position: 'absolute', left: 10, top: 6, fontFamily: POP, fontWeight: 800, fontSize: w < 260 ? 19 : 24, lineHeight: 1.05, color: TINTA, maxWidth: w - 20}}>{nome}</div>
          {id !== 'FUNDOS' ? <div style={{position: 'absolute', right: 8, bottom: 4, fontFamily: MONO, fontWeight: 700, fontSize: 20, color: '#6b5a3a'}}>{id}</div> : null}
          {id === 'L1' ? <svg width={w} height={h} style={{position: 'absolute', inset: 0}}><circle cx={w / 2} cy={h / 2 + 20} r={60} fill="#cfe9ff" stroke={TINTA} strokeWidth={5} /><circle cx={w / 2} cy={h / 2 + 20} r={36} fill="none" stroke={TINTA} strokeWidth={3} /></svg> : null}
          {id === 'L6' ? <svg width={w} height={h} style={{position: 'absolute', inset: 0}}><rect x={w / 2 - 50} y={h - 60} width={100} height={50} fill="#3a2010" stroke={TINTA} strokeWidth={4} /><path d={`M${w / 2 - 26} ${h - 14} q10 -${24 + 6 * Math.sin(f * 0.5)} 26 -30 q16 6 26 30Z`} fill={AMBAR} /></svg> : null}
          {id === 'L3' ? <div style={{position: 'absolute', left: w / 2 - 50, top: h / 2 - 20, width: 100, height: 64, background: '#2c7a3a', border: `5px solid #222`, opacity: 0.6 + 0.4 * Math.sin(f * 0.4)}} /> : null}
          {id === 'L2' ? <div style={{position: 'absolute', left: 8, right: 8, bottom: 8, height: 14, backgroundImage: `repeating-linear-gradient(90deg, ${TINTA} 0 6px, #0000 6px 22px)`}} /> : null}
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
export const SALA_C: [string, number, number, string][] = [['SEGURANÇA', 60, 270, 'L3'], ['SALÃO DA FESTA', 340, 360, 'L6'], ['CORREDOR', 710, 170, 'ESC'], ['SALÃO DA LENTE', 890, 360, 'L1'], ['CORREDOR DO TERRAÇO', 1260, 270, 'L5'], ['FUNDOS', 1540, 260, 'FUNDOS']];
export const Corte: React.FC<{f: number; aceso: (h: string) => number; escuro?: number; janela?: [string, string, number]; children?: React.ReactNode; sobre?: React.ReactNode; atores?: React.ReactNode}> = ({f, aceso, escuro = 0, janela, children, sobre, atores}) => (
  <AbsoluteFill style={{background: NOITE}}>
    <Chuva f={f} n={50} op={0.25} />
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <path d="M60 300 L960 150 L1860 300Z" fill="#2a1a10" stroke={TINTA} strokeWidth={6} />
      <rect x={1260} y={200} width={270} height={100} fill="#3a2a1a" stroke={TINTA} strokeWidth={5} />
      <path d="M1260 200 h270" stroke={LATAO} strokeWidth={6} strokeDasharray="6 14" />
      <text x={1395} y={190} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={26} fill={PERG}>TERRAÇO</text>
      <path d="M40 700 H1880" stroke={TINTA} strokeWidth={10} />
    </svg>
    {SALA_C.map(([n, x, w, id]) => <div key={n} style={{position: 'absolute', left: x, top: 330, width: w, height: 370, background: id === 'ESC' ? 'linear-gradient(#20140c, #120a05)' : 'linear-gradient(#5b3a24, #3b2516)', border: `6px solid ${TINTA}`, boxSizing: 'border-box'}}><div style={{position: 'absolute', left: 8, top: 8, fontFamily: POP, fontWeight: 800, fontSize: w < 200 ? 19 : 23, lineHeight: 1.05, color: PERG}}>{n}</div></div>)}
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <circle cx={1070} cy={560} r={70} fill="#cfe9ff55" stroke={TINTA} strokeWidth={5} /><rect x={1030} y={630} width={80} height={60} fill={MAD_E} stroke={TINTA} strokeWidth={4} />
      <rect x={470} y={620} width={110} height={70} fill="#2a1408" stroke={TINTA} strokeWidth={4} /><path d={`M500 690 q12 -${30 + 6 * Math.sin(f * 0.5)} 26 -34 q16 8 26 34Z`} fill={AMBAR} />
      <rect x={110} y={520} width={120} height={80} fill="#2c7a3a" stroke="#222" strokeWidth={6} opacity={0.6 + 0.4 * Math.sin(f * 0.4)} />
      <rect x={1440} y={560} width={70} height={50} fill="#EDE6D6" stroke={TINTA} strokeWidth={4} /><path d="M1475 566 v38 M1456 585 h38" stroke={LATAO} strokeWidth={6} />
      <rect x={1680} y={480} width={80} height={220} fill="#1a0f08" stroke={TINTA} strokeWidth={5} />
    </svg>
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
export const Gravura: React.FC<{f: number; k: GravK; apagada?: number}> = ({f, k, apagada = 0}) => {
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
export const Papel: React.FC<{s: number; nome: string; cor?: string; caida?: number}> = ({s, nome, cor = '#E9E1CC', caida = 0}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `rotate(${caida * 82}deg)`, transformOrigin: '50% 100%'}}>
    <svg viewBox="0 0 100 150" width={s} height={s * 1.5}><g stroke={TINTA} strokeWidth={5} fill={cor}><circle cx={50} cy={32} r={24} /><path d="M18 148 L26 70 Q50 58 74 70 L82 148Z" /></g></svg>
    <div style={{fontFamily: POP, fontWeight: 800, fontSize: Math.max(18, s * 0.22), color: TINTA, background: cor, border: `3px solid ${TINTA}`, borderRadius: 6, padding: '0 6px', whiteSpace: 'nowrap', transform: `rotate(${-caida * 82}deg)`}}>{nome}</div>
  </div>
);

export {Piso};
