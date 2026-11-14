// DESENHA E ADIVINHA: telas de "dado grande" e galeria (placar, corrida, relógio, mosaico, elenco, rodada 2, prêmios, pergunta).
// Todo número vem de partida.json (placarDepois, ms, acertos, tiques).
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {BANG, Boneco, C, CARIMBO, cl, claro, COR, Desenho, Dica, ease, Etiqueta, Fita, FOLHA, Folha, hash, Icone, KRAFT, MADEIRA, MONO, norm, POP, POST, quique, rnd, sombra, tempo, TINTA, tracosDe} from './base';

type P = any;
export const NOME = (p: P, cor: string): string => p.jogadores.find((j: any) => j.cor === cor)?.nome ?? cor;
export const MODELO = (p: P, cor: string): string => p.jogadores.find((j: any) => j.cor === cor)?.modelo ?? '';
export const placarApos = (p: P, n: number): Record<string, number> => (n <= 0 ? Object.fromEntries(p.jogadores.map((j: any) => [j.cor, 0])) : p.desenhos[n - 1].placarDepois);
export const ordem = (m: Record<string, number>) => Object.keys(m).sort((a, b) => m[b] - m[a]);
const Cabecalho: React.FC<{t: string; sub?: string; f: number}> = ({t, sub, f}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${(1 - quique(f, 0, 14)) * -160}px)`}}>
    <div style={{fontFamily: BANG, fontSize: 84, lineHeight: 1.05, letterSpacing: 3, color: '#fff', ...C(11)}}>{t}</div>
    {sub ? <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 32, color: TINTA, background: POST, border: '4px solid #111', borderRadius: 8, padding: '0 16px', marginTop: 2}}>{sub}</div> : null}
  </div>
);

// ---------- placar em barras: A -> B (as barras trocam de lugar deslizando) ----------
export const Placar: React.FC<{p: P; f: number; A: Record<string, number>; B: Record<string, number>; mov?: [number, number]; titulo: string; sub?: string; marcas?: Record<string, string>; colch?: {cores: string[]; txt: string}[]; entra?: number[]; mais2?: {cor: string; n: number; at: number}; risco?: {cor: string; v: number; txt: string; at: number}; nota?: {txt: string; at: number}; max?: number; un?: string; modelo?: boolean; top?: number}> = ({p, f, A, B, mov, titulo, sub, marcas, colch, entra, mais2, risco, nota, max, un = '', modelo, top}) => {
  const k = mov ? ease(f, mov[0], mov[1]) : 1;
  const oa = ordem(A), ob = ordem(B), M = max ?? Math.max(...Object.values(B)) * 1.06;
  const Y0 = 168, RH = 86, X0 = 470, BW = 1130;
  const y = (cor: string) => Y0 + (oa.indexOf(cor) + (ob.indexOf(cor) - oa.indexOf(cor)) * k) * RH;
  return (
    <AbsoluteFill>
      <Cabecalho t={titulo} sub={sub} f={f} />
      {ob.map((cor, r) => {
        const e0 = entra ? entra[r] : 6 + r * 3, e = quique(f, e0, 14), v = A[cor] + (B[cor] - A[cor]) * k, cresc = ease(f, e0, e0 + 22);
        if (f < e0) return null;
        const dest = top != null && r < top;
        return (
          <div key={cor} style={{position: 'absolute', left: 60, top: y(cor), width: 1800, height: RH - 10, display: 'flex', alignItems: 'center', transform: `translateX(${(1 - e) * -500}px)`, zIndex: 20 - r}}>
            <div style={{width: 70, fontFamily: BANG, fontSize: 56, color: '#fff', ...C(8), textAlign: 'right', marginRight: 10}}>{Math.round(oa.indexOf(cor) + (r - oa.indexOf(cor)) * k) + 1}º</div>
            <Boneco cor={cor} s={62} f={f} bracos={false} coroa={r === 0 && k > 0.9 && !un} humor={r === 0 ? 'feliz' : 'normal'} />
            <div style={{width: 250, marginLeft: 8}}>
              <div style={{fontFamily: POP, fontWeight: 800, fontSize: 40, lineHeight: 1, color: '#fff', ...C(7)}}>{NOME(p, cor)}</div>
              {modelo ? <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 20, lineHeight: 1.1, color: TINTA, whiteSpace: 'nowrap'}}>{MODELO(p, cor)}</div> : null}
            </div>
            <div style={{position: 'absolute', left: X0 - 60, height: RH - 22, width: Math.max(30, (v / M) * BW * cresc), background: COR[cor], border: '5px solid #111', borderRadius: 12, boxShadow: dest ? `0 0 0 6px ${POST}, 6px 6px 0 #0007` : '6px 6px 0 #0007'}}>
              {risco && risco.cor === cor && f > risco.at ? <div style={{position: 'absolute', left: (risco.v / v) * 100 + '%', top: -12, bottom: -12, borderLeft: '6px dashed #111'}}><Etiqueta fs={22} style={{position: 'absolute', left: -70, top: -34, transform: `scale(${quique(f, risco.at, 12)})`}}>{risco.txt}</Etiqueta></div> : null}
              {mais2 && mais2.cor === cor ? <div style={{position: 'absolute', left: 30, top: -14, display: 'flex', gap: 10}}>{Array.from({length: mais2.n}).map((_, i) => f > mais2.at + i * 9 ? <div key={i} style={{fontFamily: BANG, fontSize: 52, lineHeight: 1.1, color: CARIMBO, background: FOLHA, border: `5px solid ${CARIMBO}`, outline: '3px solid #111', borderRadius: 10, padding: '0 12px', transform: `rotate(${(i % 2 ? 5 : -6)}deg) scale(${interpolate(f, [mais2.at + i * 9, mais2.at + i * 9 + 6], [2.6, 1], cl)})`}}>+2</div> : null)}</div> : null}
            </div>
            <div style={{position: 'absolute', left: X0 - 40 + Math.max(30, (v / M) * BW * cresc), fontFamily: BANG, fontSize: 62, lineHeight: 1, color: '#fff', ...C(9), whiteSpace: 'nowrap'}}>{Math.round(v * cresc)}{un}
              {marcas?.[cor] ? <span style={{marginLeft: 18, fontFamily: POP, fontWeight: 800, fontSize: 30, WebkitTextStroke: '0', color: TINTA, background: POST, border: '4px solid #111', borderRadius: 8, padding: '2px 12px', verticalAlign: 'middle', display: 'inline-block', transform: `rotate(-3deg) scale(${quique(f, 60 + r * 4, 12)})`}}>{marcas[cor]}</span> : null}
            </div>
          </div>
        );
      })}
      {(colch ?? []).map((c, i) => { const ys = c.cores.map(y), a = Math.min(...ys), b = Math.max(...ys), at = 150 + i * 90, e = quique(f, at, 14); if (f < at) return null; const dif = Math.abs(B[c.cores[0]] - B[c.cores[1]]); return (
        <div key={i} style={{position: 'absolute', left: 1500, top: a, height: b - a + RH - 10, display: 'flex', alignItems: 'center', gap: 10, transform: `scale(${e})`, transformOrigin: '0 50%', zIndex: 40}}>
          <svg width={40} height={b - a + RH - 10}><path d={`M4 6 H30 V${b - a + RH - 16} H4`} fill="none" stroke="#111" strokeWidth={8} /></svg>
          <div style={{fontFamily: BANG, fontSize: 54, lineHeight: 1.05, color: '#fff', background: CARIMBO, border: '6px solid #111', borderRadius: 12, padding: '4px 20px', boxShadow: sombra, transform: 'rotate(-3deg)', textAlign: 'center'}}>{c.txt}<br />{dif} PONTO{dif > 1 ? 'S' : ''}</div>
        </div>
      ); })}
      {nota && f > nota.at ? <div style={{position: 'absolute', left: 0, right: 0, bottom: 14, display: 'flex', justifyContent: 'center'}}><Etiqueta fs={40} rot={-1.5} style={{transform: `rotate(-1.5deg) scale(${quique(f, nota.at, 14)})`}}>{nota.txt}</Etiqueta></div> : null}
    </AbsoluteFill>
  );
};

// ---------- parede da galeria: molduras com plaquinha de museu ----------
export const Quadrinho: React.FC<{p: P; n: number; w: number; f: number; de?: number; durD?: number; dica?: boolean; placa?: boolean; carimbo?: string}> = ({p, n, w, f, de = 0, durD = 50, dica, placa = true, carimbo}) => {
  const d = p.desenhos[n - 1], tr = tracosDe(d, 9), ult = d.tiques[d.tiques.length - 1];
  const t1 = d.acertos.filter((a: any) => a.tique === 1).length;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: w * 0.03, transform: `translateY(${(1 - quique(f, de, 16)) * -900}px) rotate(${Math.sin(f / 60 + n) * 0.8 + (1 - ease(f, de, de + 30)) * 5}deg)`, transformOrigin: '50% -40px'}}>
      <div style={{padding: w * 0.035, background: 'linear-gradient(135deg, #E8B84A, #B9862A)', border: '6px solid #111', boxShadow: '14px 14px 0 #0008', position: 'relative'}}>
        <Folha w={w} fita={false}><Desenho tr={tr} vis={tr.length * interpolate(f, [de + 12, de + 12 + durD], [0, 1], cl)} lapis={COR[d.desenhista]} /></Folha>
        {carimbo && f > de + 18 + durD ? <div style={{position: 'absolute', right: -w * 0.04, bottom: -w * 0.02, fontFamily: BANG, fontSize: w * 0.13, lineHeight: 1.1, color: CARIMBO, background: FOLHA, border: `${w * 0.014}px solid ${CARIMBO}`, outline: '3px solid #111', borderRadius: 10, padding: `0 ${w * 0.03}px`, transform: `rotate(-9deg) scale(${interpolate(f, [de + 18 + durD, de + 24 + durD], [2.6, 1], cl)})`, whiteSpace: 'nowrap'}}>{carimbo}</div> : null}
      </div>
      {placa ? (
        <div style={{background: '#F1E9D2', border: '4px solid #111', borderRadius: 6, boxShadow: '5px 5px 0 #0007', padding: `${w * 0.008}px ${w * 0.04}px`, textAlign: 'center'}}>
          <div style={{fontFamily: BANG, fontSize: w * 0.085, lineHeight: 1.1, letterSpacing: 1.5, color: TINTA}}>{String(d.palavra).toUpperCase()}</div>
          <div style={{fontFamily: POP, fontWeight: 800, fontSize: w * 0.05, lineHeight: 1.15, color: TINTA, whiteSpace: 'nowrap'}}>{NOME(p, d.desenhista)} · {tr.length} traços</div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: w * 0.046, lineHeight: 1.2, color: CARIMBO, whiteSpace: 'nowrap'}}>{t1} de 9 de primeira · {d.acertos.length} de 9 no fim</div>
        </div>
      ) : null}
      {dica ? <div style={{opacity: ease(f, de + 40, de + 55)}}><Dica dica={ult.dica} s={w * 0.085} /><div style={{fontFamily: MONO, fontWeight: 700, fontSize: w * 0.045, color: '#fff', textAlign: 'center', marginTop: 6}}>A DICA FINAL</div></div> : null}
    </div>
  );
};
const PAREDE = '#3F5C58';
export const Galeria: React.FC<{p: P; f: number; ns: number[]; dica?: boolean; titulo?: string}> = ({p, f, ns, dica, titulo}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: `linear-gradient(${PAREDE} 0 86%, #2a3d3a 86% 88%, #6b4a2c 88%)`}} />
    <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(90deg, #0000 0 118px, #ffffff0d 118px 120px)'}} />
    {titulo ? <Cabecalho t={titulo} f={f} /> : null}
    <div style={{position: 'absolute', left: 0, right: 0, top: titulo ? 150 : 110, display: 'flex', justifyContent: 'center', gap: ns.length > 2 ? 60 : 120, transform: `translateX(${Math.sin(f / 90) * 14}px)`}}>
      {ns.map((n, i) => <Quadrinho key={n} p={p} n={n} w={ns.length > 2 ? 500 : 640} f={f} de={6 + i * 14} dica={dica} />)}
    </div>
  </AbsoluteFill>
);

// ---------- B1: mosaico da rodada 1 + o número gigante ----------
export const Mosaico: React.FC<{p: P; f: number}> = ({p, f}) => {
  const r1 = p.desenhos.filter((d: any) => d.rodada === 1);
  const prim = r1.reduce((a: number, d: any) => a + d.acertos.filter((x: any) => x.tique === 1).length, 0), tot = r1.length * 9;
  const at = 96 + r1.length * 13;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 40, top: 30, width: 1840, display: 'flex', flexWrap: 'wrap', gap: '26px 22px', justifyContent: 'center', transform: `scale(${1 - 0.04 * ease(f, at, at + 20)})`, filter: f > at + 6 ? 'brightness(0.62)' : undefined}}>
        {r1.map((d: any, i: number) => <Quadrinho key={d.n} p={p} n={d.n} w={316} f={f} de={84 + i * 13} durD={34} placa={false} carimbo={`${d.acertos.filter((x: any) => x.tique === 1).length} DE 9`} />)}
      </div>
      {f > at ? <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: BANG, fontSize: 330, lineHeight: 1, letterSpacing: 6, color: POST, ...C(26), transform: `rotate(-4deg) scale(${interpolate(f, [at, at + 7], [3, 1], cl) * (1 + 0.015 * Math.sin(f * 0.2))})`}}>{prim} DE {tot}</div>
        <Etiqueta fs={48} rot={-2} style={{opacity: ease(f, at + 10, at + 18)}}>ACERTOS DE PRIMEIRA NA RODADA 1</Etiqueta>
      </div> : null}
    </AbsoluteFill>
  );
};

// ---------- A2: o estojo abre e saem os dez ----------
export const Elenco: React.FC<{p: P; f: number; dur: number}> = ({p, f, dur}) => {
  const J = p.jogadores as any[];
  const foco: [string, number][] = [['Roxo', 150], ['Azul', 215], ['Amarelo', 280], ['Marrom', 335]];
  const fc = foco.find(([, a]) => f >= a && f < a + 62);
  const fim = 452;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 26, textAlign: 'center', fontFamily: BANG, fontSize: 104, lineHeight: 1, letterSpacing: 3, color: FOLHA, ...C(13, '#3a3a3a'), clipPath: `inset(-20% ${100 - ease(f, 2, 40) * 104}% -20% -5%)`, transform: `rotate(-1.5deg)`}}>COLOQUEI 10 IAs PRA JOGAR GARTIC</div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}><path d={`M250 150 Q960 ${176 + Math.sin(f / 20) * 4} ${250 + 1420 * ease(f, 20, 50)} 152`} fill="none" stroke="#3a3a3a" strokeWidth={9} strokeLinecap="round" /></svg>
      {/* o estojo */}
      <div style={{position: 'absolute', left: 560, top: 930, width: 800, height: 200, background: '#35506B', border: '8px solid #111', borderRadius: 40, boxShadow: sombra}} />
      <div style={{position: 'absolute', left: 560, top: 900, width: 800, height: 70, background: '#48698C', border: '8px solid #111', borderRadius: '40px 40px 0 0', transformOrigin: '50% 100%', transform: `perspective(900px) rotateX(${ease(f, 20, 44) * 78}deg)`}} />
      {J.map((j, i) => {
        const at = 44 + i * 10, k = ease(f, at, at + 18), gx = 150 + (i % 5) * 330, gy = 250 + Math.floor(i / 5) * 330;
        const x = 900 + (gx - 900) * k, y = 900 + (gy - 900) * k - Math.sin(k * Math.PI) * 260;
        const emF = fc?.[0] === j.cor, kf = fc && emF ? ease(f, fc[1], fc[1] + 10) * (1 - ease(f, fc[1] + 52, fc[1] + 62)) : 0;
        if (f < at) return null;
        return (
          <div key={j.cor} style={{position: 'absolute', left: x + (810 - x) * kf, top: y + (330 - y) * kf, width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${(0.4 + 0.6 * k) * (1 + 0.75 * kf)}) rotate(${Math.sin(f / 22 + i) * 2.5}deg)`, zIndex: emF ? 30 : 5, opacity: fc && !emF ? 0.55 : 1, filter: f > fim ? 'brightness(0.6)' : undefined}}>
            <Boneco cor={j.cor} s={170} f={f + i * 13} humor={emF ? 'feliz' : 'normal'} fala={emF} />
            <div style={{fontFamily: POP, fontWeight: 800, fontSize: 44, lineHeight: 1.05, color: '#fff', ...C(8)}}>{j.nome}</div>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 23, lineHeight: 1.2, color: claro(j.cor) ? '#111' : '#fff', background: COR[j.cor], border: '4px solid #111', borderRadius: 8, padding: '0 10px', whiteSpace: 'nowrap'}}>{j.modelo}</div>
          </div>
        );
      })}
      {f > 385 && f < fim ? <div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', fontFamily: BANG, fontSize: 96, letterSpacing: 3, color: '#fff', ...C(12), transform: `scale(${quique(f, 385, 14)})`}}>1 DESENHA · 9 ADIVINHAM</div> : null}
      {f > fim ? <div style={{position: 'absolute', left: 580, top: 330, transform: `rotate(-4deg) scale(${quique(f, fim, 16)})`}}><Guardados f={f - fim} dur={dur - fim} /></div> : null}
    </AbsoluteFill>
  );
};
// o post-it "guarda essas duas" (volta em J6 com as palavras riscadas)
export const Guardados: React.FC<{f: number; dur: number; risca?: number}> = ({f, risca}) => (
  <div style={{width: 760, background: POST, border: '6px solid #111', boxShadow: '14px 14px 0 #0008', padding: '18px 30px 26px', position: 'relative'}}>
    <Fita x={300} y={-24} rot={-3} w={160} />
    <div style={{fontFamily: POP, fontWeight: 800, fontSize: 40, color: TINTA}}>GUARDA ESSAS DUAS:</div>
    {['PESADELO', 'CASCAVEL'].map((w, i) => (
      <div key={w} style={{position: 'relative', fontFamily: BANG, fontSize: 150, lineHeight: 1.02, letterSpacing: 5, color: TINTA, width: 'fit-content', opacity: risca != null ? 1 : ease(f, 20 + i * 30, 28 + i * 30), transform: `translateX(${Math.sin(f / 12 + i) * 3}px)`}}>
        {w}
        {risca != null ? <div style={{position: 'absolute', left: -10, top: '46%', height: 16, borderRadius: 8, background: CARIMBO, width: `${(i === 0 ? 1 : ease(f, risca, risca + 14)) * 104}%`, transform: 'rotate(-3deg)'}} /> : null}
      </div>
    ))}
  </div>
);

// ---------- B3: cartão "RODADA 2" (oito riscos e as dez palavras) ----------
export const Rodada2: React.FC<{p: P; f: number}> = ({p, f}) => {
  const ws = p.desenhos.filter((d: any) => d.rodada === 2).map((d: any) => String(d.palavra).toUpperCase());
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center', fontFamily: BANG, fontSize: 250, lineHeight: 1, letterSpacing: 8, color: '#fff', ...C(22), transform: `rotate(-3deg) scale(${interpolate(f, [0, 8], [2.4, 1], cl)})`}}>RODADA 2</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 34}}>
        {Array.from({length: 8}).map((_, i) => { const some = 60 + i * 13, k = ease(f, some, some + 10); return <div key={i} style={{width: 30, height: 190, borderRadius: 12, background: k > 0.5 ? '#0000' : TINTA, border: `6px ${k > 0.5 ? 'dashed' : 'solid'} #111`, transform: `rotate(${(rnd(i) - 0.5) * 16 + Math.sin(f / 9 + i) * 2}deg) scale(${1 + 0.3 * Math.sin(k * Math.PI)})`, opacity: 1 - 0.55 * k}} />; })}
        <div style={{fontFamily: BANG, fontSize: 120, lineHeight: 1, color: POST, ...C(12), marginLeft: 20, whiteSpace: 'nowrap'}}>{Math.max(0, 8 - Math.floor(Math.max(0, f - 60) / 13))} TRAÇOS</div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 590, display: 'flex', gap: 30, transform: `translateX(${1800 - f * 13}px)`}}>
        {[...ws, ...ws].map((w, i) => <div key={i} style={{background: POST, border: '6px solid #111', boxShadow: sombra, padding: '10px 34px', fontFamily: BANG, fontSize: 110, lineHeight: 1.1, letterSpacing: 3, color: TINTA, whiteSpace: 'nowrap', transform: `rotate(${(i % 2 ? 2.5 : -2.5) + Math.sin(f / 14 + i) * 1.2}deg)`}}>{w}</div>)}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 850, display: 'flex', justifyContent: 'center'}}><Etiqueta fs={44} rot={-1}><Icone n="olho" s={44} />AS 10 PALAVRAS DA RODADA · SÓ VOCÊ VÊ</Etiqueta></div>
    </AbsoluteFill>
  );
};

// ---------- H1: a corrida (mediana real do tempo de resposta) ----------
export const medianas = (p: P): Record<string, number> => {
  const m: Record<string, number[]> = {};
  for (const d of p.desenhos) for (const t of d.tiques) for (const x of t.palpites) (m[x.cor] ??= []).push(x.ms);
  return Object.fromEntries(Object.entries(m).map(([c, v]) => { const s = [...v].sort((a, b) => a - b), h = s.length >> 1; return [c, s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2]; }));
};
export const erros = (p: P): Record<string, number> => {
  const m: Record<string, number> = Object.fromEntries(p.jogadores.map((j: any) => [j.cor, 0]));
  for (const d of p.desenhos) for (const t of d.tiques) for (const x of t.palpites) if (!x.acertou && x.palpite) m[x.cor]++;
  return m;
};
export const Corrida: React.FC<{p: P; f: number; t0: number}> = ({p, f, t0}) => {
  const med = medianas(p), cs = Object.keys(med).sort((a, b) => med[a] - med[b]);
  const X0 = 400, X1 = 1640;
  return (
    <AbsoluteFill>
      <Cabecalho t="TEMPO PRA RESPONDER" sub="MEDIANA POR RESPOSTA" f={f} />
      <div style={{position: 'absolute', left: 40, top: 190, width: 1840, height: 860, background: '#B5552F', border: '8px solid #111', borderRadius: 26, boxShadow: sombra}} />
      <div style={{position: 'absolute', left: X1 + 60, top: 190, width: 46, height: 860, backgroundImage: 'repeating-conic-gradient(#111 0 25%, #fff 0 50%)', backgroundSize: '46px 46px', border: '4px solid #111'}} />
      {cs.map((cor, i) => {
        const s = med[cor] / 1000, k = interpolate(f, [t0, t0 + s * 15], [0, 1], cl), fim = k >= 1, y = 196 + i * 85;
        return (
          <div key={cor} style={{position: 'absolute', left: 40, top: y, width: 1840, height: 85, borderTop: i ? '4px dashed #ffffff99' : undefined}}>
            <div style={{position: 'absolute', left: 16, top: 16, width: 300, fontFamily: POP, fontWeight: 800, fontSize: 40, lineHeight: 1.2, color: '#fff', ...C(7)}}>{NOME(p, cor)}</div>
            {!fim && k > 0 ? [0, 1, 2].map((j) => <div key={j} style={{position: 'absolute', left: X0 - 90 + (X1 - X0) * k - j * 34, top: 26 + j * 12, width: 50 + (9 - i) * 6, height: 6, borderRadius: 3, background: '#fff', opacity: 0.7 - j * 0.2}} />) : null}
            <div style={{position: 'absolute', left: X0 - 60 + (X1 - X0) * k, top: -8 - (fim ? 0 : Math.abs(Math.sin(f * 0.5 + i)) * 10), transform: `rotate(${fim ? 0 : 8}deg)`}}><Boneco cor={cor} s={72} f={f + i * 9} humor={fim ? 'feliz' : 'normal'} /></div>
            {fim ? <div style={{position: 'absolute', left: X1 + 78, top: 8, fontFamily: BANG, fontSize: 60, lineHeight: 1.1, color: i === 0 || i === cs.length - 1 ? POST : '#fff', ...C(8), whiteSpace: 'nowrap', transform: `scale(${quique(f, t0 + s * 15, 12)})`, transformOrigin: '0 50%'}}>{s.toFixed(1).replace('.', ',')} s</div> : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
export const Relogios: React.FC<{p: P; f: number; n: number; tq: number; cores: string[]}> = ({p, f, n, tq, cores}) => {
  const d = p.desenhos[n - 1], ps = d.tiques[tq - 1].palpites;
  return (
    <AbsoluteFill>
      <Cabecalho t={`${String(d.palavra).toUpperCase()} · TIQUE ${tq}`} sub="TEMPO DE RESPOSTA" f={f} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', gap: 130}}>
        {cores.map((cor, i) => { const ms = ps.find((x: any) => x.cor === cor)?.ms ?? 0, e = quique(f, 8 + i * 14, 16), sg = interpolate(f, [8 + i * 14, 70 + i * 14], [0, ms / 1000], cl); return (
          <div key={cor} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${e}) rotate(${Math.sin(f / 8 + i * 2) * (sg * 1000 >= ms ? 2.5 : 0.5)}deg)`}}>
            <div style={{width: 560, height: 560, borderRadius: '50%', background: FOLHA, border: '16px solid #111', boxShadow: `0 0 0 14px ${COR[cor]}, 16px 16px 0 12px #0007`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width={560} height={560} style={{position: 'absolute', inset: -16}}>{Array.from({length: 12}).map((_, k) => <line key={k} x1={280} y1={44} x2={280} y2={74} stroke="#111" strokeWidth={10} transform={`rotate(${k * 30} 280 280)`} />)}<line x1={280} y1={280} x2={280} y2={90} stroke={CARIMBO} strokeWidth={12} strokeLinecap="round" transform={`rotate(${sg * 6} 280 280)`} /><circle cx={280} cy={280} r={16} fill="#111" /></svg>
              <div style={{fontFamily: BANG, fontSize: 190, lineHeight: 1, color: TINTA, background: '#fffd', borderRadius: 20, padding: '0 20px', zIndex: 2}}>{tempo(Math.max(60000, sg * 1000))}</div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', marginTop: 8}}><Boneco cor={cor} s={110} f={f} humor="triste" /><div style={{fontFamily: POP, fontWeight: 800, fontSize: 66, color: '#fff', ...C(10)}}>{NOME(p, cor)}</div></div>
          </div>
        ); })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- L2: medalhas de papel recortado ----------
const Medalha: React.FC<{cor: string; f: number; s: number}> = ({cor, f, s}) => (
  <div style={{position: 'relative', width: s, height: s * 1.25, transform: `rotate(${Math.sin(f / 16) * 4}deg)`, transformOrigin: '50% 0'}}>
    <svg viewBox="0 0 200 250" width={s} height={s * 1.25} style={{position: 'absolute', inset: 0}}>
      <path d="M62 0 L100 96 L80 110 L30 10Z M138 0 L100 96 L120 110 L170 10Z" fill={COR[cor]} stroke="#111" strokeWidth={7} strokeLinejoin="round" />
      <path d={Array.from({length: 24}).map((_, i) => { const a = (i / 24) * Math.PI * 2, r = i % 2 ? 84 : 96; return `${i ? 'L' : 'M'}${100 + r * Math.cos(a)} ${152 + r * Math.sin(a)}`; }).join(' ') + 'Z'} fill="#FFD84D" stroke="#111" strokeWidth={7} strokeLinejoin="round" />
      <circle cx={100} cy={152} r={66} fill={FOLHA} stroke="#111" strokeWidth={6} />
    </svg>
    <div style={{position: 'absolute', left: s * 0.29, top: s * 0.5}}><Boneco cor={cor} s={s * 0.42} f={f} bracos={false} humor="feliz" /></div>
  </div>
);
export const Premios: React.FC<{p: P; f: number; dur: number}> = ({p, f, dur}) => {
  const ats = [0, Math.round(dur * 0.42), Math.round(dur * 0.62), Math.round(dur * 0.83)];
  const atual = ats.filter((a) => f >= a).length - 1, lf = f - ats[atual];
  const d16 = p.desenhos[15], dicaF = d16.tiques[d16.tiques.length - 1].dica.split(' ');
  const o10 = ordem(placarApos(p, 10)), o15 = ordem(placarApos(p, 15));
  const mais2 = p.desenhos.filter((d: any) => d.acertos.some((a: any) => a.cor === 'Verde' && a.pontos === 2)).length;
  const itens = [
    {cor: 'Verde', t: 'O PESADELO DO LÁPIS', sub: `DE ${o10.indexOf('Verde') + 1}º PARA ${o15.indexOf('Verde') + 1}º`, corpo: <div style={{display: 'flex', alignItems: 'center', gap: 26}}><Quadrinho p={p} n={12} w={300} f={lf + 40} placa={false} /><div style={{display: 'flex', gap: 10, flexWrap: 'wrap', width: 520}}>{Array.from({length: mais2}).map((_, i) => lf > 40 + i * 10 ? <div key={i} style={{fontFamily: BANG, fontSize: 84, lineHeight: 1.1, color: CARIMBO, background: FOLHA, border: `7px solid ${CARIMBO}`, outline: '4px solid #111', borderRadius: 12, padding: '0 16px', transform: `rotate(${i % 2 ? 5 : -6}deg) scale(${interpolate(lf, [40 + i * 10, 46 + i * 10], [2.6, 1], cl)})`}}>+2</div> : null)}</div></div>},
    {cor: 'Rosa', t: 'CONTA DO GIZ', sub: '3 CONTAGENS DE LETRA · 3 ERRADAS', corpo: <div style={{display: 'flex', gap: 22}}>{['NATUREZA', 'FUZIL', 'DORMINDO'].map((w, i) => <div key={w} style={{position: 'relative', fontFamily: MONO, fontWeight: 700, fontSize: 62, color: TINTA, background: FOLHA, border: '6px solid #111', borderRadius: 12, padding: '4px 18px', boxShadow: sombra, transform: `rotate(${i % 2 ? 3 : -3}deg) scale(${quique(lf, 20 + i * 14, 12)})`}}>{w}<div style={{position: 'absolute', right: -24, top: -30}}><Icone n="x" s={70} cor={CARIMBO} /></div></div>)}</div>},
    {cor: 'Marrom', t: 'NÃO LEU A DICA: CARVÃO', sub: 'SOLETROU E NÃO VIU O L', corpo: <div style={{display: 'flex', flexDirection: 'column', gap: 10}}><Dica dica={dicaF.join(' ')} s={74} /><div style={{display: 'flex', gap: 74 * 0.14}}>{'MARCIANO'.split('').map((ch, i) => { const ruim = dicaF[i] && dicaF[i] !== '_' && norm(dicaF[i]) !== ch; return <div key={i} style={{width: 74, height: 92, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 68, color: ruim ? '#fff' : TINTA, background: ruim ? CARIMBO : dicaF[i] !== '_' ? POST : '#fff8', border: '4px solid #111', borderRadius: 8, opacity: lf > 16 + i * 5 ? 1 : 0, transform: ruim ? `translateX(${Math.sin(lf * 1.3) * 5}px) rotate(6deg)` : undefined}}>{ch}</div>; })}</div></div>},
    {cor: 'Lima', t: 'CHUTE DO ANO: GRAFITE', sub: 'ENCAIXAVA NA DICA INTEIRA', corpo: <div style={{display: 'flex', alignItems: 'center', gap: 30}}><Quadrinho p={p} n={16} w={300} f={lf + 40} placa={false} /><div style={{fontFamily: BANG, fontSize: 170, lineHeight: 1, letterSpacing: 5, color: POST, ...C(16), transform: `rotate(-4deg) scale(${interpolate(lf, [22, 30], [3, 1], cl)})`, opacity: lf > 22 ? 1 : 0}}>CASCAVEL</div></div>},
  ];
  const it = itens[atual];
  return (
    <AbsoluteFill>
      <Cabecalho t="OS PRÊMIOS" f={f} />
      <div style={{position: 'absolute', left: 90, top: 190, display: 'flex', alignItems: 'center', gap: 50, transform: `translateX(${(1 - quique(lf, 0, 16)) * 1900}px)`}}>
        <Medalha cor={it.cor} f={f} s={430} />
        <div>
          <div style={{fontFamily: BANG, fontSize: Math.min(140, 2500 / it.t.length), lineHeight: 1.02, letterSpacing: 3, color: '#fff', ...C(14), whiteSpace: 'nowrap'}}>{it.t}</div>
          <Etiqueta fs={44} rot={-1.5} style={{marginBottom: 30}}>{it.sub}</Etiqueta>
          <div style={{marginTop: 10}}>{it.corpo}</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 20, display: 'flex', justifyContent: 'center', gap: 40}}>
        {itens.map((x, i) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 6, opacity: i <= atual ? 1 : 0.25, transform: `scale(${i === atual ? 1.08 + 0.03 * Math.sin(f * 0.2) : 1})`}}><Medalha cor={x.cor} f={f + i * 20} s={110} /><div style={{fontFamily: POP, fontWeight: 800, fontSize: 32, color: '#fff', ...C(6)}}>{i <= atual ? NOME(p, x.cor) : '?'}</div></div>)}
      </div>
    </AbsoluteFill>
  );
};

// ---------- L3: a folha em branco e a pergunta ----------
export const Pergunta: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill>
    <div style={{position: 'absolute', left: 130, top: 150, transform: `rotate(${-2 + Math.sin(f / 40) * 0.8}deg)`}}>
      <Folha w={980}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
          <div style={{fontFamily: BANG, fontSize: 120, lineHeight: 1.05, letterSpacing: 2, color: '#3a3a3a', textAlign: 'center', clipPath: `inset(-10% ${100 - ease(f, 12, 70) * 104}% -10% -5%)`}}>QUAL DESSES VOCÊ<br />TERIA ACERTADO?</div>
          <svg width={700} height={40}><path d={`M10 20 Q350 ${36 + Math.sin(f / 9) * 6} ${10 + 680 * ease(f, 60, 90)} 16`} fill="none" stroke="#3a3a3a" strokeWidth={9} strokeLinecap="round" /></svg>
        </div>
      </Folha>
    </div>
    <div style={{position: 'absolute', left: 1180, top: 170, width: 640, background: POST, border: '6px solid #111', boxShadow: '14px 14px 0 #0008', padding: '16px 26px 30px', transform: `rotate(${3 + Math.sin(f / 30) * 1.2}deg) scale(${quique(f, 20, 16)})`}}>
      <Fita x={240} y={-24} rot={2} w={150} />
      <div style={{fontFamily: POP, fontWeight: 800, fontSize: 40, color: TINTA}}>A PRÓXIMA PALAVRA:</div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 110, lineHeight: 1.3, color: TINTA, whiteSpace: 'nowrap'}}>{'_ _ _ _ _'}<span style={{opacity: Math.floor(f / 12) % 2 ? 1 : 0}}>|</span></div>
      <div style={{fontFamily: POP, fontWeight: 800, fontSize: 34, color: CARIMBO}}>ESCREVE NOS COMENTÁRIOS</div>
    </div>
    <svg viewBox="0 0 200 300" width={280} height={420} style={{position: 'absolute', left: 1400, top: 560, transform: `rotate(${28 + Math.sin(f / 10) * 9}deg) translateY(${Math.abs(Math.sin(f / 10)) * -24}px)`}}>
      <g stroke="#111" strokeWidth={8} strokeLinejoin="round"><path d="M70 60 L100 6 L130 60Z" fill="#e8cfa0" /><path d="M90 24 L100 6 L110 24Z" fill="#111" /><rect x={70} y={60} width={60} height={190} fill={MADEIRA} /><rect x={70} y={250} width={60} height={34} rx={8} fill="#f2a0a0" /><path d="M90 60V250M110 60V250" strokeWidth={4} opacity={0.4} /></g>
    </svg>
  </AbsoluteFill>
);
export const fundoDe = (tela: string) => (tela === 'placar' || tela === 'erros' ? '#8C6A3F' : tela === 'relogio' ? '#6E5A7A' : tela === 'premios' ? '#7A4B3A' : tela === 'rodada2' ? '#5A4636' : KRAFT);
export {hash};
