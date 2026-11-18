// "Tribunal das IAs — Assassinato no Museu do Farol". Lê public/timeline_tribunal.json (cenas, citações, selos, memes,
// capítulos) e public/tribunal/caso.json (o log real das duas rodadas). Identidade: Tribunal de Pedra Alta (direcao_edicao.md):
// madeira de navio e latão; pergaminho + luz âmbar + lacre = SÓ VOCÊ VÊ. O visual de cada cena (cenas.tsx) segue os "at"
// das citações/selos e a duração da cena (proporções), então aguenta a timeline nova quando as vozes forem geradas.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction} from 'remotion';
import {MemeCard} from '../components/overlays';
import {Selo} from '../au7/Hud7';
import {AMBAR, BANG, C, CHUMBO, cl, COR, ease, hash, Icone, LATAO, LUZ, MAD_C, MAD_E, MARINHO, MONO, NOITE, NOME, norm, PERG, Pedra, POP, quique, ROD_NOME, rotuloDe, sombra, TINTA, VINHO} from './base';
import {Lacre} from './pecas';
import {Liso} from './cenarios';
import {mkDados, mkX, type CapO, type Cena, type CitaO, type Dados, type TL} from './dados';
import {CENAS, GRIFO, PARADO} from './cenas';

export const calcTribunal: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl = await (await fetch(staticFile('timeline_tribunal.json'))).json();
  return {durationInFrames: tl.cenas.reduce((a: number, c: Cena) => a + c.dur, 0), props: {tl}};
};

// ---------- citações: balão (fala/resposta), nuvem com eco (pensamento), balão roxo com martelo (sentença) ----------
const ROT_EV: Record<string, string> = {responde: 'RESPOSTA', resposta: 'RESPOSTA', conversar: 'PERGUNTA', assistente: 'ASSISTENTE', abertura: 'ABERTURA', final_defesa: 'ALEGAÇÕES FINAIS', defesa: 'DEFESA', promotor: 'PROMOTOR', acusado_responde: 'RESPOSTA À ACUSAÇÃO', apresentar: 'MOSTRA A PROVA'};
const faixas = (texto: string, alvos: string[]) => {
  const n = norm(texto).replace(/\s/g, ' ');
  const out: [number, number][] = [];
  for (const a of alvos) { const q = norm(a); let i = n.indexOf(q); while (i >= 0 && q) { out.push([i, i + q.length]); i = n.indexOf(q, i + q.length); } }
  return out;
};
const Cita: React.FC<{o: CitaO; D: Dados; k: number; cena: string}> = ({o, D, k, cena}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 14, stiffness: 160}}) * interpolate(f, [o.dur - 8, o.dur], [1, 0], cl);
  const [R, i] = D.ref(o.ref);
  const ev = D.ev(R, i);
  const pens = o.tipoCita === 'pensamento', sent = o.tipoCita === 'sentença', obj = o.tipoCita === 'objeção', dep = o.tipoCita === 'depoimento';
  const cor = COR[o.cor] ?? '#999';
  const g = GRIFO[`${cena}#${k}`];
  const fx = faixas(o.texto, g?.w ?? []);
  const palavras: {w: string; ini: number}[] = [];
  { let p = 0; for (const w of o.texto.split(' ')) { palavras.push({w, ini: p}); p += w.length + 1; } }
  const n = interpolate(f, [3, Math.max(14, o.dur * 0.45)], [0, palavras.length], cl);
  const L = o.texto.length, fs0 = L > 240 ? 36 : L > 170 ? 40 : L > 120 ? 45 : L > 70 ? 51 : 58;
  const encolhe = g?.encolhe;
  const di = dep ? D.declIdx(R, i, o.texto) : -1;
  const head = pens ? 'PENSAMENTO · SÓ VOCÊ VÊ' : sent ? 'SENTENÇA DO JUIZ' : dep ? `DEPOIMENTO${di >= 0 ? ` (${di + 1})` : ''}` : obj ? (o.cor === 'Laranja' ? 'OBJEÇÃO DO PROMOTOR' : ev?.acao === 'acusar' || ev?.acao === 'passado' || /TOMA ESSA/i.test(o.texto) ? 'TOMA ESSA!' : 'OBJEÇÃO!') : ROT_EV[ev?.tipo ?? ''] ?? 'FALA';
  const falando = !pens && n < palavras.length;
  const bg = pens ? PERG : sent ? '#2E1740' : '#FBF6EA', tx = sent ? PERG : TINTA;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, bottom: 26, display: 'flex', gap: 10, alignItems: 'flex-end', opacity: Math.min(1, e * 1.4), transform: `translateY(${(1 - e) * 110}px)`, zIndex: 50}}>
      <div style={{position: 'relative', width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${-Math.abs(Math.sin(f * 0.2)) * (falando ? 7 : 2)}px) rotate(${Math.sin(f / 30) * 2}deg)`}}>
        <Pedra cor={o.cor} s={200} f={f} rod={R} busto fala={falando} olhar={pens ? [0.6, -1] : [1, 0]} humor={o.cor === 'Vermelho' ? (pens ? 'normal' : 'cinico') : sent ? 'normal' : obj ? 'bravo' : 'normal'} brilho={falando ? 0.5 + 0.5 * Math.sin(f * 0.4) : 0} />
        <div style={{marginTop: -10, fontFamily: POP, fontWeight: 800, fontSize: 36, lineHeight: 1.05, color: '#fff', ...C(8)}}>{NOME[o.cor]}</div>
        <div style={{fontFamily: POP, fontWeight: 800, fontSize: 17, color: TINTA, background: PERG, border: '3px solid #6b5a3a', padding: '0 6px', whiteSpace: 'nowrap', textAlign: 'center'}}>{rotuloDe(o.cor, R).split(' · ')[0]}</div>
      </div>
      <div style={{position: 'relative', flex: 1, marginBottom: 20}}>
        {pens ? [0, 1, 2].map((r) => { const t = ((f + r * 18) % 54) / 54; return <div key={r} style={{position: 'absolute', inset: -6, border: `5px solid ${AMBAR}`, borderRadius: 90, opacity: 0.55 * (1 - t), transform: `scale(${1 + t * 0.07}, ${1 + t * 0.22})`}} />; }) : null}
        {pens ? [0, 1, 2].map((r) => <div key={r} style={{position: 'absolute', left: -26 - r * 22, bottom: 34 - r * 24, width: 36 - r * 9, height: 36 - r * 9, borderRadius: '50%', background: PERG, border: `5px dashed ${AMBAR}`, transform: `translateY(${Math.sin(f * 0.15 + r) * 4}px)`}} />) : <svg width={50} height={64} style={{position: 'absolute', left: -40, bottom: 56, zIndex: 2}}><path d="M48 4 L4 34 L48 56" fill={bg} stroke={sent ? LATAO : cor} strokeWidth={8} strokeLinejoin="round" /><path d="M48 0 V60" stroke={bg} strokeWidth={10} /></svg>}
        <div style={{position: 'relative', background: bg, border: pens ? `7px dashed ${AMBAR}` : `${obj ? 11 : 8}px solid ${sent ? LATAO : cor}`, outline: pens ? undefined : `4px solid ${TINTA}`, borderRadius: pens ? 80 : 26, boxShadow: pens ? `0 0 40px ${LUZ}88, 0 14px 0 #0008` : sombra, padding: pens ? '16px 56px 22px' : '14px 34px 20px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, flexWrap: 'wrap'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: POP, fontWeight: 800, fontSize: 26, color: pens ? TINTA : sent ? TINTA : claro2(o.cor) ? TINTA : '#fff', background: pens ? LUZ : sent ? LATAO : obj ? (o.cor === 'Laranja' ? '#E8871E' : VINHO) : dep ? MAD_C : cor, border: `4px solid ${TINTA}`, borderRadius: 30, padding: '0 18px 0 8px', whiteSpace: 'nowrap'}}>
              {pens ? <Lacre s={36} /> : sent ? <Icone n="martelo" s={32} cor={TINTA} /> : <Icone n="balao" s={30} cor={claro2(o.cor) && !obj && !dep ? TINTA : '#fff'} />}
              <span style={{color: pens || sent ? TINTA : obj || dep ? '#fff' : claro2(o.cor) ? TINTA : '#fff'}}>{head}</span>
            </div>
            <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 21, color: sent ? '#d9c9f0' : '#5a5343', whiteSpace: 'nowrap'}}>{ROD_NOME[R]} · DIA {o.dt[1]} · {o.ref}</div>
            {g?.rot ? <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, color: PERG, background: '#2a2622', border: `3px solid ${LATAO}`, borderRadius: 4, padding: '0 10px', transform: `rotate(-2deg) scale(${interpolate(f, [8, 14], [1.8, 1], cl)})`, opacity: f > 8 ? 1 : 0, whiteSpace: 'nowrap'}}>{g.rot}</div> : null}
          </div>
          <div style={{fontFamily: POP, fontWeight: 800, fontSize: fs0, lineHeight: 1.2, color: tx, fontStyle: pens ? 'italic' : 'normal'}}>
            “{palavras.map(({w, ini}, j) => {
              const hl = fx.some(([a, b]) => ini < b && ini + w.length > a);
              const esc = encolhe ? interpolate(j, [0, palavras.length - 1], [1.3, 0.55]) : 1;
              return <span key={j} style={{opacity: j < n ? 1 : 0, fontSize: encolhe ? fs0 * esc : undefined, background: hl ? (sent ? LATAO : LUZ) : j < n && j >= n - 1 ? (sent ? '#ffffff22' : '#ffe29a88') : undefined, borderBottom: hl ? `4px solid ${TINTA}` : undefined, color: hl && sent ? TINTA : undefined, borderRadius: 5, padding: hl ? '0 4px' : undefined}}>{w}{j < palavras.length - 1 ? ' ' : ''}</span>;
            })}<span style={{opacity: n >= palavras.length ? 1 : 0}}>”</span>
          </div>
          {sent ? <div style={{position: 'absolute', right: -24, top: -34, transform: `rotate(${-20 + Math.max(0, 1 - quique(f, 0, 14)) * 30}deg)`}}><Icone n="martelo" s={78} cor={LATAO} /></div> : null}
        </div>
      </div>
    </div>
  );
};
const claro2 = (cor: string) => ['Amarelo', 'Lima', 'Ciano', 'Rosa'].includes(cor);

// ---------- cartão de capítulo: tábua de madeira com cantoneiras de latão; o feixe do farol passa ----------
const Capitulo: React.FC<{o: CapO; id: string}> = ({o, id}) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 5], [0, 1], cl) * interpolate(f, [o.dur - 8, o.dur], [1, 0], cl);
  const so = norm(o.titulo).includes('SO VOCE VE');
  const ac = /SAFIRA/.test(o.titulo) ? COR.Azul : /JADE/.test(o.titulo) ? COR.Verde : LATAO;
  const fs = Math.min(190, 2300 / Math.max(6, o.titulo.length));
  const ph = (f % 60) / 60;
  return (
    <AbsoluteFill style={{opacity: a, zIndex: 60}}>
      <Liso f={f + hash(id)} tom={so ? '#0b1222' : '#1a0f08'} />
      <div style={{position: 'absolute', left: 230, top: 210, width: 1460, height: 620, transform: `translateY(${(1 - quique(f, 0, 16)) * -900}px) rotate(${-1.5 + Math.sin(f / 30) * 0.4}deg)`}}>
        <div style={{position: 'absolute', inset: 0, background: so ? PERG : `repeating-linear-gradient(1deg, ${MAD_C} 0 44px, #7b4e2e 44px 48px)`, border: `8px solid ${TINTA}`, borderRadius: 20, boxShadow: `${sombra}, 0 0 80px ${so ? LUZ : '#000'}66`}} />
        {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x ? 1460 - 70 : -6, top: y ? 620 - 70 : -6, width: 76, height: 76, background: `linear-gradient(135deg, ${LUZ}, ${LATAO}, #8a6d14)`, border: `4px solid ${TINTA}`, borderRadius: 10, clipPath: ['polygon(0 0,100% 0,0 100%)', 'polygon(0 0,100% 0,100% 100%)', 'polygon(0 0,0 100%,100% 100%)', 'polygon(100% 0,100% 100%,0 100%)'][i]}} />)}
        <div style={{position: 'absolute', left: 0, right: 0, top: 22, height: 18, background: ac, opacity: 0.85}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18}}>
          {so ? <Lacre s={150} rot={Math.sin(f / 20) * 6} /> : null}
          <div style={{fontFamily: BANG, fontSize: fs, lineHeight: 1, letterSpacing: 6, color: so ? TINTA : '#fff', ...(so ? {} : C(12)), whiteSpace: 'nowrap', clipPath: `inset(-20% ${100 - ease(f, 6, 22) * 104}% -20% -5%)`}}>{o.titulo}</div>
          {o.sub ? <div style={{fontFamily: POP, fontWeight: 800, fontSize: 60, lineHeight: 1.15, color: TINTA, background: so ? LUZ : PERG, border: `6px solid ${TINTA}`, padding: '4px 30px', boxShadow: sombra, transform: `rotate(-1.5deg) scale(${interpolate(f, [20, 30], [0, 1], {...cl, easing: (t) => 1 - (1 - t) ** 3})})`}}>“{o.sub}”</div> : null}
        </div>
        <div style={{position: 'absolute', inset: 0, borderRadius: 20, background: `linear-gradient(100deg, #0000 ${ph * 160 - 40}%, ${LUZ}44 ${ph * 160 - 22}%, #0000 ${ph * 160 - 4}%)`, pointerEvents: 'none'}} />
      </div>
    </AbsoluteFill>
  );
};

// selo: o Selo do canal, na cor do material (latão = aceito, chumbo = recusado/errado, âmbar = só você vê)
const corSelo = (t: string) => {
  const n = norm(t);
  if (n.includes('SO VOCE VE')) return '#B5651D';
  if (/ABSOLVIDA|ACEITA|ABERTO|ACERTOU|LIVRE/.test(n) && !/NUNCA|CONDEN/.test(n)) return '#A8840F';
  if (/CONDENADA|RECUSADA|ERRAD|NAO EXISTE|0 DE 6|NAO PROVADO|INVENTADO|ERRO DO MODELO|NUNCA/.test(n)) return CHUMBO;
  if (n.startsWith('IDEIA DE')) return MARINHO;
  return VINHO;
};
const SeloT: React.FC<{texto: string; dur: number; comMeme?: boolean}> = ({texto, dur, comMeme}) => {
  const f = useCurrentFrame();
  return <div style={{position: 'absolute', inset: 0, zIndex: 55, opacity: interpolate(f, [dur - 7, dur], [1, 0], cl), transform: `translateY(96px) rotate(${((hash(texto) % 9) - 4) * 0.9}deg) scale(${1 + 0.012 * Math.sin(f * 0.25)})`}}><Selo texto={texto} cor={corSelo(texto)} f={f} comMeme={comMeme} /></div>;
};

// ---------- uma cena: mundo (com deriva lenta de câmera) + HUD fixo + overlays da timeline ----------
const CenaView: React.FC<{c: Cena; D: Dados}> = ({c, D}) => {
  const f0 = useCurrentFrame();
  const par = PARADO[c.id]?.(mkX(c, f0, D));
  const parado = !!par && f0 >= par[0] && f0 < par[1];
  const f = parado ? par![0] : f0;
  const X = mkX(c, f, D);
  const cena = CENAS[c.id];
  const out: {m: React.ReactNode; h?: React.ReactNode} = cena ? cena(X) : {m: <Liso f={f}><div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BANG, fontSize: 120, color: PERG}}>{c.visual.titulo ?? c.id}</div></Liso>};
  let soco = 0;
  for (const o of c.over) { const d = f0 - o.at; if (d >= 0 && d < 12 && (o.tipo === 'selo' || o.tipo === 'meme')) soco = Math.max(soco, 0.045 * (1 - d / 12)); }
  const wk = Math.min(1, X.cita.reduce((a, o) => a + ease(f0, o.at, o.at + 16) * (1 - ease(f0, o.at + o.dur - 12, o.at + o.dur)), 0));
  const sd = hash(c.id);
  const z = (1.0 + 0.04 * (f / Math.max(1, c.dur)) + (parado ? 0 : soco)) * (1 - 0.13 * wk);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: NOITE}}>
      <AbsoluteFill style={{transform: `translate(${Math.sin(f / 97 + sd) * 12}px, ${Math.cos(f / 131 + sd) * 8}px) scale(${z})`, transformOrigin: '50% 8%'}}>{out.m}</AbsoluteFill>
      {out.h}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0000 62%, #0007 100%)', pointerEvents: 'none'}} />
      {c.over.map((o, i) => (
        <Sequence key={i} from={o.at} durationInFrames={Math.max(1, o.dur)}>
          {o.tipo === 'cita' ? <Cita o={o} D={D} k={X.cita.indexOf(o)} cena={c.id} /> : null}
          {o.tipo === 'selo' ? <SeloT texto={o.texto} dur={o.dur} comMeme={c.over.some((m) => m.tipo === 'meme' && m.at < o.at + o.dur && m.at + m.dur > o.at)} /> : null}
          {o.tipo === 'meme' ? <MemeCard info={o.info} dur={o.dur} pos={o.pos} /> : null}
          {o.tipo === 'capitulo' ? <Capitulo o={o} id={c.id} /> : null}
        </Sequence>
      ))}
      {c.audio.map((a, i) => <Sequence key={`a${i}`} from={a.at}><Audio src={staticFile(a.src)} volume={a.vol ?? 1} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const TribunalVideo: React.FC<{tl: TL | null}> = ({tl}) => {
  const [D, setD] = useState<Dados | null>(null);
  const [h] = useState(() => delayRender('caso do tribunal'));
  useEffect(() => { fetch(staticFile('tribunal/caso.json')).then((r) => r.json()).then((d) => { setD(mkDados(d)); continueRender(h); }); }, [h]);
  if (!tl || !D) return null;
  let ini = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.cenas.map((c) => { const s = ini; ini += c.dur; return <Sequence key={c.id} from={s} durationInFrames={c.dur}><CenaView c={c} D={D} /></Sequence>; })}
    </AbsoluteFill>
  );
};
