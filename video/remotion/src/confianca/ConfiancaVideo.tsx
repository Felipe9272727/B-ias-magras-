// JOGO DE CONFIANÇA (ideia do @Pursuer_M4). Lê public/timeline_confianca.json (build_timeline_confianca.py: storyboard do Fable
// + roteiro_confianca.py) e public/confianca/partida.json (o log da partida). Identidade (direcao_edicao.md): central
// telefônica vista de cima, feltro verde-garrafa, papel creme = a verdade que só o público vê, fio = o que foi dito.
// Placar secreto: cadeado no canto até a revelação. Nada de emoji: tudo é desenho nosso (desenhos.tsx).
// Câmera: deriva lenta em toda cena; na mesa ela viaja até quem fala. Nenhum dado inventado: tudo sai do log/timeline.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction} from 'remotion';
import {MemeCard, type MemeInfo} from '../components/overlays';
import {Alicate, AMAR, BANG, C, cl, claro, COR, CORES, DO, ease, ESCURO, estrela, Etiqueta, Feltro, FIO, hash, Icone, MONO, PAPEL, POP, rnd, sombra, Telefone, TINTA, type Humor} from './desenhos';

type V = {tipo: string; [k: string]: any};
type Over =
  | {tipo: 'cita'; at: number; dur: number; cor: string | null; tipoCita: string; texto: string; mt?: number[]}
  | {tipo: 'selo'; at: number; dur: number; texto: string}
  | {tipo: 'meme'; at: number; dur: number; id: string; pos: string; info: MemeInfo}
  | {tipo: 'capitulo'; at: number; dur: number; titulo: string; regra: string};
type Cena = {id: string; dur: number; visual: V; over: Over[]; audio: {src: string; at: number; vol?: number}[]};
type TL = {cenas: Cena[]};
type P = any;
type Fala = {cor: string | null; tipo: string; w: number; mt?: number[]};
type Cx = {v: V; p: P; f: number; dur: number; t0: number; falas: Fala[]; id: string};

export const calcConfianca: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl = await (await fetch(staticFile('timeline_confianca.json'))).json();
  return {durationInFrames: tl.cenas.reduce((a: number, c: Cena) => a + c.dur, 0), props: {tl}};
};

const VERDE_B = '#1E9E5A';
const Nome: React.FC<{cor: string; fs?: number}> = ({cor, fs = 32}) => <div style={{fontFamily: POP, fontWeight: 800, fontSize: fs, lineHeight: 1.1, color: COR[cor], letterSpacing: 1, ...C(Math.max(5, fs / 5))}}>{cor.toUpperCase()}</div>;
const Titulo: React.FC<{children: React.ReactNode; f: number; sub?: string}> = ({children, f, sub}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${interpolate(f, [0, 10], [-40, 0], cl)}px)`}}>
    <div style={{fontFamily: BANG, fontSize: 84, lineHeight: 1, color: '#fff', letterSpacing: 3, ...C(10)}}>{children}</div>
    {sub ? <div style={{fontFamily: POP, fontWeight: 800, fontSize: 32, color: AMAR, ...C(6)}}>{sub}</div> : null}
  </div>
);

// ---------- a mesa telefônica: 8 telefones em roda, fio de quem liga, pulso que para no meio ----------
const pos = (i: number) => { const a = -Math.PI / 2 + (i / 8) * Math.PI * 2; return {x: 960 + 740 * Math.cos(a), y: 548 + 318 * Math.sin(a)}; };
const PP = (cor: string) => pos(Math.max(0, CORES.indexOf(cor)));
const qb = (a: {x: number; y: number}, m: {x: number; y: number}, b: {x: number; y: number}, t: number) => ({x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * m.x + t * t * b.x, y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * m.y + t * t * b.y});
const PODER: Record<string, string> = {cortar: 'tesoura', grampear: 'escuta', verificar: 'lupa', fingir: 'mascara', recado: 'envelope'};

const Mesa: React.FC<Cx> = ({v, p, f, dur, t0, falas}) => {
  const fala = falas[0];
  const mjN = v.mj ?? 1;
  const mj = p.minijogos[mjN - 1];
  const tN = fala?.mt && fala.mt[0] === mjN ? fala.mt[1] : v.tique ?? 1;
  const tq = mj?.tiques?.[tN - 1];
  const foco: string[] = v.foco ?? [];
  const J: Record<string, any> = Object.fromEntries(p.jogadores.map((j: any) => [j.cor, j]));
  const lig = (tq?.ligacoes ?? []) as any[];
  const poderes = (tq?.poderes ?? []) as any[];
  const apagao = mj?.evento === 'apagao' && mj?.eventoTique === tN;
  const f0 = Math.max(0, f - t0);
  const chamada = (cor: string | null | undefined) => lig.find((l) => l.de === cor);
  const etiqueta = (cor: string): string | null => {
    if (v.etiquetas === 'nomes') return p.minijogos[0].detalhe.nomes?.[cor];
    if (v.etiquetas === 'fantasias') { const d = p.minijogos[3].detalhe; return cor === d.impostor ? d.diferente : d.comum; }
    if (v.etiquetas === 'bombas') { const b = bombaAte(p, cor, tN); return b ? (b.desarmou ? 'DESARMADA' : 'EXPLODIU') : 'ARMADA'; }
    return null;
  };
  // câmera: deriva + puxada para o foco + viagem até quem fala (e o destino da ligação)
  let bx = 960, by = 560, bz = 1;
  if (foco.length) { bx = 960 + (foco.reduce((a, c) => a + PP(c).x, 0) / foco.length - 960) * 0.3; by = 560 + (foco.reduce((a, c) => a + PP(c).y, 0) / foco.length - 560) * 0.3; bz = 1.08; }
  let ws = 0, sx = 0, sy = 0, sz = 0;
  for (const fl of falas) {
    if (!fl.cor) continue;
    const a = PP(fl.cor), l = fl.tipo.startsWith('liga') ? chamada(fl.cor) : null;
    const b = l && !l.vivaVoz ? PP(l.para) : a;
    sx += fl.w * (a.x * 0.62 + b.x * 0.38); sy += fl.w * (a.y * 0.62 + b.y * 0.38); sz += fl.w * (l ? (l.vivaVoz ? 1.05 : 1.22) : 1.42); ws += fl.w;
  }
  const n = Math.max(1, ws), wk = Math.min(1, ws);
  const cx = bx * (1 - wk) + (sx / n) * (ws ? 1 : 0) + Math.sin(f / 97) * 16, cy = by * (1 - wk) + (sy / n) * (ws ? 1 : 0) + Math.cos(f / 131) * 10;
  const z = (bz * (1 - wk) + (sz / n) * (ws ? 1 : 0)) * (1 + 0.03 * (f / Math.max(1, dur)));
  const ay = 548 - 150 * wk;
  const quem = fala?.cor ?? null;
  return (
    <AbsoluteFill style={{transform: `translate(${960 - cx * z}px, ${ay - cy * z}px) scale(${z})`, transformOrigin: '0 0'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {/* painel da central no meio da mesa */}
        <ellipse cx={960} cy={574} rx={500} ry={232} fill="#000" opacity={0.35} />
        <ellipse cx={960} cy={560} rx={500} ry={232} fill="#3a2416" stroke="#111" strokeWidth={8} />
        <ellipse cx={960} cy={560} rx={470} ry={208} fill="#0c1f19" stroke="#6b4226" strokeWidth={6} />
        <ellipse cx={960} cy={560} rx={330} ry={140} fill="none" stroke="#2c5446" strokeWidth={3} strokeDasharray="4 14" transform={`rotate(${f * 0.05} 960 560)`} />
        {CORES.map((c, i) => { const a = -Math.PI / 2 + (i / 8) * Math.PI * 2, x = 960 + 400 * Math.cos(a), y = 560 + 172 * Math.sin(a), on = lig.some((l) => l.de === c) && !apagao; return <g key={c}><circle cx={x} cy={y} r={20} fill="#111" stroke="#c9a15a" strokeWidth={5} /><circle cx={x} cy={y} r={9} fill={on ? COR[c] : '#333'} opacity={on ? 0.75 + 0.25 * Math.sin(f * 0.3 + i) : 1} /></g>; })}
        {lig.map((l, i) => {
          const a0 = PP(l.de), b0 = PP(l.para);
          const dx = b0.x - a0.x, dy = b0.y - a0.y, len = Math.hypot(dx, dy) || 1;
          const a = {x: a0.x + (dx / len) * 70, y: a0.y + (dy / len) * 50}, b = {x: b0.x - (dx / len) * 80, y: b0.y - (dy / len) * 60};
          const m = {x: (a.x + b.x) / 2 + (960 - (a.x + b.x) / 2) * 0.3 + (dy / len) * 46, y: (a.y + b.y) / 2 + (560 - (a.y + b.y) / 2) * 0.3 - (dx / len) * 46};
          const d = `M${a.x} ${a.y} Q ${m.x} ${m.y} ${b.x} ${b.y}`;
          const ki = ease(f0, 6 + i * 6, 34 + i * 6);
          const caiu = !!l.caiu || apagao;
          const meu = quem ? l.de === quem : false;
          const op = quem ? (meu ? 1 : l.para === quem ? 0.45 : 0.14) : foco.length ? (foco.includes(l.de) || foco.includes(l.para) ? 1 : 0.28) : 0.92;
          const pt = qb(a, m, b, 0.5 * ki), mid = qb(a, m, b, 0.5);
          const corre = ((f + i * 23) % 80) / 80;
          const pc = qb(a, m, b, 0.5 * corre);
          const fala1 = meu && fala.tipo.startsWith('liga');
          return (
            <g key={i} opacity={op}>
              <path d={d} fill="none" stroke="#000" strokeWidth={caiu ? 9 : 16} strokeLinecap="round" opacity={0.75} pathLength={1} strokeDasharray={`${ki} 1`} />
              <path d={d} fill="none" stroke={caiu ? '#7a8086' : COR[l.de]} strokeWidth={caiu ? 5 : 10} strokeLinecap="round" pathLength={1} strokeDasharray={caiu ? '0.02 0.02' : `${ki} 1`} />
              {caiu ? null : <path d={d} fill="none" stroke="#ffffff66" strokeWidth={3} strokeDasharray="3 11" strokeDashoffset={-f * 0.6} opacity={ki} />}
              <circle cx={b.x} cy={b.y} r={12} fill="#111" stroke="#c9a15a" strokeWidth={4} opacity={ki} />
              {caiu ? (
                <g transform={`translate(${mid.x - 30} ${mid.y - 30 + Math.sin(f * 0.9 + i) * 3})`} opacity={ki}><Icone n="chiado" s={60} /></g>
              ) : (
                <g>
                  {ki > 0.98 ? <circle cx={pc.x} cy={pc.y} r={7} fill="#fff" opacity={0.9 * (1 - corre)} /> : null}
                  <g transform={`translate(${pt.x} ${pt.y + (ki > 0.98 ? Math.sin(f * 0.14 + i) * 4 : 0)}) scale(${fala1 ? 1.5 : 1})`}>
                    <circle r={30} fill={COR[l.de]} opacity={0.25 + 0.15 * Math.sin(f * 0.25 + i)} />
                    <path d="M-20 -17 H20 Q26 -17 26 -11 V7 Q26 13 20 13 H-4 L-14 23 V13 H-20 Q-26 13 -26 7 V-11 Q-26 -17 -20 -17 Z" fill="#fff" stroke="#111" strokeWidth={4} strokeLinejoin="round" />
                    {[-12, 0, 12].map((x, k) => <circle key={k} cx={x} cy={-2} r={3.6} fill={COR[l.de]} stroke="#111" strokeWidth={1} opacity={(Math.floor(f / 8) + k) % 3 === 0 ? 1 : 0.35} />)}
                  </g>
                </g>
              )}
              {l.vivaVoz ? CORES.filter((c) => c !== l.de && c !== l.para).map((c, k) => { const q = PP(c), kk = ease(f0, 20 + k * 3, 44 + k * 3); return <line key={c} x1={a0.x} y1={a0.y} x2={a0.x + (q.x - a0.x) * kk} y2={a0.y + (q.y - a0.y) * kk} stroke={COR[l.de]} strokeWidth={5} strokeDasharray="10 12" strokeDashoffset={-f * 1.4} strokeLinecap="round" />; }) : null}
            </g>
          );
        })}
        {poderes.filter((pp) => pp.poder === 'grampear' && pp.alvo).map((pp, i) => { const a = PP(pp.cor), b = PP(pp.alvo); return <line key={i} x1={a.x} y1={a.y - 40} x2={b.x} y2={b.y - 40} stroke="#fff" strokeWidth={4} strokeDasharray="4 12" strokeDashoffset={f * 0.8} opacity={foco.includes(pp.cor) || quem === pp.cor ? 0.9 : 0.25} />; })}
      </svg>
      {apagao ? <AbsoluteFill style={{background: '#000', opacity: 0.72 * ease(f0, 4, 16), left: -960, top: -540, width: 3840, height: 2160}} /> : null}
      {CORES.map((cor, i) => {
        const q = pos(i);
        const l = chamada(cor);
        const cortado = poderes.some((pp) => pp.poder === 'cortar' && pp.alvo === cor);
        const meus = poderes.filter((pp) => pp.cor === cor && PODER[pp.poder]);
        const emMim = poderes.filter((pp) => pp.alvo === cor && PODER[pp.poder]);
        const em = quem ? quem === cor || chamada(quem)?.para === cor : foco.length === 0 || foco.includes(cor);
        const et = etiqueta(cor);
        const fal = quem === cor;
        const alvo = l ? PP(l.para) : {x: 960, y: 560};
        const od = Math.hypot(alvo.x - q.x, alvo.y - q.y) || 1;
        const pulo = fal ? Math.abs(Math.sin(f * 0.22)) * 8 : 0;
        const ent = spring({frame: f0 - i * 3, fps: 30, config: {damping: 11}});
        const ruim = et === 'EXPLODIU';
        return (
          <div key={cor} style={{position: 'absolute', left: q.x - 150, top: q.y - 128, width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: em ? 1 : 0.5, filter: apagao ? 'brightness(0.55)' : undefined, transform: `translateY(${-pulo}px) scale(${(fal ? 1.16 : foco.includes(cor) && !quem ? 1.1 : 1) * (0.6 + 0.4 * ent)}) rotate(${Math.sin(f / 60 + i) * 1.5}deg)`}}>
            <div style={{position: 'relative'}}>
              <Telefone cor={cor} s={210} f={f} fora={!!l && !cortado} cinza={cortado} falando={fal && fala.tipo.startsWith('liga')} humor={ruim ? 'morto' : cortado ? 'triste' : et === 'DESARMADA' ? 'feliz' : 'normal'} olhar={fal && !fala.tipo.startsWith('liga') ? [0, -1] : [(alvo.x - q.x) / od, (alvo.y - q.y) / od]} fantasia={v.etiquetas === 'fantasias' ? et : null} />
              {apagao ? <div style={{position: 'absolute', left: 66, top: 90, width: 78, height: 78, borderRadius: 39, background: '#ffe9a8', opacity: 0.5 + 0.2 * Math.sin(f * 0.2 + i), boxShadow: '0 0 40px 16px #ffd96a'}} /> : null}
              {et ? <div style={{position: 'absolute', left: 118, top: -30}}><Etiqueta fs={28} rot={-5 + (i % 3) * 4} bg={et === 'EXPLODIU' ? ESCURO : et === 'DESARMADA' ? VERDE_B : PAPEL} cor={et === 'EXPLODIU' || et === 'DESARMADA' ? '#fff' : TINTA}>{et}</Etiqueta></div> : null}
              {emMim.map((pp, k) => <div key={k} style={{position: 'absolute', left: -34 - k * 50, top: 20, transform: `rotate(${Math.sin(f * 0.2) * 10}deg) scale(${1 + 0.12 * Math.sin(f * 0.25)})`}}><Icone n={PODER[pp.poder]} s={78} cor={COR[pp.cor]} /></div>)}
              {l?.vivaVoz ? <div style={{position: 'absolute', right: -70, top: -34, transform: `rotate(${-12 + Math.sin(f * 0.3) * 6}deg)`}}><Icone n="megafone" s={96} cor={COR[cor]} /></div> : null}
            </div>
            <Nome cor={cor} fs={34} />
            <div style={{fontFamily: POP, fontWeight: 800, fontSize: 23, color: '#fff', whiteSpace: 'nowrap', ...C(5)}}>{J[cor]?.modelo}</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, fontFamily: MONO, fontWeight: 700, fontSize: 22, color: TINTA, background: meus.length ? AMAR : PAPEL, border: '3px solid #111', borderRadius: 6, padding: '0 10px', whiteSpace: 'nowrap', transform: `rotate(-2deg) scale(${meus.length ? 1.22 + 0.06 * Math.sin(f * 0.3) : 1})`, boxShadow: '3px 3px 0 #000a'}}>
              {meus.map((pp, k) => <Icone key={k} n={PODER[pp.poder]} s={26} />)}{String(J[cor]?.profissao ?? '').toUpperCase()}{meus[0]?.como ? ` · COMO ${String(meus[0].como).toUpperCase()}` : ''}
            </div>
          </div>
        );
      })}
      {/* aviso preso ao fio de quem está falando */}
      {(() => {
        const l = fala && fala.tipo.startsWith('liga') ? chamada(quem) : null;
        if (!l || !quem) return null;
        const a = PP(l.de), b = PP(l.para), caiu = !!l.caiu || apagao;
        const m = {x: (a.x + b.x) / 2 + (960 - (a.x + b.x) / 2) * 0.3, y: (a.y + b.y) / 2 + (560 - (a.y + b.y) / 2) * 0.3};
        return <div style={{position: 'absolute', left: m.x - 300, top: m.y - 96, width: 600, display: 'flex', justifyContent: 'center', opacity: fala.w, transform: `scale(${1 / Math.max(1, z * 0.85)})`}}><Etiqueta fs={26} rot={-2} bg={caiu ? '#30363c' : l.vivaVoz ? AMAR : '#111'} cor={l.vivaVoz ? TINTA : '#fff'}>{caiu ? 'A LIGAÇÃO CAIU' : l.vivaVoz ? 'VIVA-VOZ: TODOS OUVEM' : 'CHEGA NO PRÓXIMO TIQUE'}</Etiqueta></div>;
      })()}
    </AbsoluteFill>
  );
};
const bombaAte = (p: P, cor: string, tN: number) => { for (const t of p.minijogos[4].tiques) if (t.tique <= tN) { const b = (t.bombas ?? []).find((x: any) => x.cor === cor); if (b) return b; } return null; };

// ---------- cartão de papel (comentário do Pursuer, lição, pergunta) ----------
const Cartao: React.FC<Cx> = ({v, f}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 12}});
  const linhas: string[] = v.linhas ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      {CORES.map((c, i) => { const a = (i / 8) * Math.PI * 2 + f / 260; return <div key={c} style={{position: 'absolute', left: 960 + 830 * Math.cos(a) - 80, top: 540 + 440 * Math.sin(a) - 76, opacity: 0.9, transform: `rotate(${Math.sin(f / 50 + i) * 6}deg)`}}><Telefone cor={c} s={160} f={f} olhar={[-Math.cos(a), -Math.sin(a)]} /></div>; })}
      <div style={{position: 'relative', width: 1380, background: PAPEL, border: '8px solid #111', borderRadius: 14, boxShadow: '16px 16px 0 #000', padding: '44px 64px 48px', transform: `scale(${0.6 + 0.4 * e}) rotate(${-1.5 + Math.sin(f / 70) * 0.8}deg)`}}>
        <div style={{position: 'absolute', left: '50%', top: -30, width: 240, height: 54, marginLeft: -120, background: '#ffe9a8cc', border: '3px solid #0003', transform: 'rotate(-3deg)'}} />
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <div style={{width: 84, height: 84, borderRadius: 42, background: ESCURO, border: '5px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}><Icone n="fone" s={54} cor={PAPEL} /></div>
          <div style={{fontFamily: POP, fontWeight: 800, fontSize: 60, lineHeight: 1.1, color: TINTA}}>{v.titulo}</div>
        </div>
        {linhas.map((l, i) => {
          const k = ease(f, 16 + i * 26, 46 + i * 26);
          return <div key={i} style={{fontFamily: POP, fontWeight: 800, fontSize: linhas.length > 1 ? 50 : 58, lineHeight: 1.3, color: '#2a261c', marginTop: 26, opacity: interpolate(f, [12 + i * 26, 22 + i * 26], [0, 1], cl)}}><span style={{backgroundImage: `linear-gradient(${AMAR}, ${AMAR})`, backgroundRepeat: 'no-repeat', backgroundSize: `${k * 100}% 46%`, backgroundPosition: '0 82%', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>“{l}”</span></div>;
        })}
        {v.selo ? <div style={{marginTop: 38, display: 'inline-block', fontFamily: BANG, fontSize: 62, letterSpacing: 2, color: '#fff', background: ESCURO, border: '6px solid #111', borderRadius: 10, padding: '2px 28px', boxShadow: '6px 6px 0 #000', opacity: interpolate(f, [50, 54], [0, 1], cl), transform: `rotate(-3deg) scale(${interpolate(f, [50, 58], [2.2, 1], cl) * (1 + 0.025 * Math.sin(f * 0.12))})`}}>{v.selo}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------- telão do dilema: 4 duplas, botões sob tampa ----------
const Telao: React.FC<Cx> = ({v, p, f, dur, t0, falas}) => {
  const mj = p.minijogos[1];
  const t = v.tique ?? 1;
  const bots = (mj.botoes ?? []).filter((b: any) => b.tique === t);
  const ab = Math.max(t0 + 40, dur * 0.55);
  const abre = (i: number) => spring({frame: f - ab - i * 9, fps: 30, config: {damping: 9, stiffness: 160}});
  const quem = falas[0]?.cor;
  const Botao = ({b, k}: {b: string; k: number}) => (
    <div style={{position: 'relative', width: 150, height: 150}}>
      <div style={{position: 'absolute', left: 8, top: 14, width: 134, height: 134, borderRadius: 67, background: '#111'}} />
      <div style={{position: 'absolute', left: 8, top: 6 + (k > 0.5 ? 8 : 0), width: 134, height: 134, borderRadius: 67, border: '6px solid #111', background: k > 0.02 ? `radial-gradient(circle at 35% 30%, #ffffff66, transparent 40%), ${b === 'verde' ? VERDE_B : ESCURO}` : '#3a4046', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: k > 0.5 ? `0 0 ${30 + 14 * Math.sin(f * 0.3)}px ${b === 'verde' ? '#3dff9a' : '#ff4a4a'}` : undefined}}>
        {k > 0.5 ? <Icone n={b === 'verde' ? 'aperto' : 'faca'} s={84} /> : null}
      </div>
      <div style={{position: 'absolute', left: 0, top: 0, width: 150, height: 150, borderRadius: 18, background: 'linear-gradient(135deg, #cfe6f2cc, #8fb4c8cc)', border: '6px solid #111', transformOrigin: '50% 0', transform: `perspective(500px) rotateX(${k * 112}deg)`, opacity: 1 - k * 0.55, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BANG, fontSize: 90, color: '#111'}}>{k < 0.3 ? '?' : ''}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Titulo f={f - t0}>RODADA <span style={{color: AMAR}}>{t}</span> DE {mj.tiques.length}</Titulo>
      <div style={{position: 'absolute', left: 60, right: 60, top: 222, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '26px 40px'}}>
        {bots.map((b: any, i: number) => {
          const k = abre(i), ent = spring({frame: f - t0 - i * 5, fps: 30, config: {damping: 13}});
          const hum = (meu: string, outro: string): Humor => (k < 0.5 ? 'normal' : meu === 'vermelho' && outro === 'verde' ? 'bravo' : meu === 'verde' && outro === 'vermelho' ? 'triste' : meu === 'verde' ? 'feliz' : 'bravo');
          const dest = quem === b.a || quem === b.b;
          const Lado = ({cor, hm, g, dir}: {cor: string; hm: Humor; g: number; dir: number}) => (
            <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 230, transform: `translateY(${quem === cor ? -Math.abs(Math.sin(f * 0.2)) * 8 : 0}px)`}}>
              <Telefone cor={cor} s={176} f={f} humor={hm} olhar={[dir, 0.2]} falando={quem === cor && falas[0].tipo.startsWith('liga')} fora={quem === cor && falas[0].tipo.startsWith('liga')} />
              <Nome cor={cor} fs={34} />
              {k > 0.5 ? <div style={{position: 'absolute', top: -34, [dir > 0 ? 'left' : 'right']: -6, fontFamily: BANG, fontSize: 76, lineHeight: 1, color: g ? AMAR : '#c9d2d6', ...C(9), transform: `scale(${k}) rotate(${dir * -8}deg)`}}>+{g}</div> : null}
            </div>
          );
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 330, background: 'linear-gradient(#12302a, #0a1a15)', border: `7px solid ${dest ? AMAR : '#111'}`, borderRadius: 22, padding: '0 22px', boxShadow: dest ? `0 0 0 6px #111, 0 0 50px ${AMAR}88` : '8px 8px 0 #000', transform: `scale(${(0.7 + 0.3 * ent) * (dest ? 1.02 : 1)}) rotate(${Math.sin(f / 80 + i * 2) * 0.6}deg)`, opacity: quem && !dest ? 0.6 : 1}}>
              <Lado cor={b.a} hm={hum(b.botaoA, b.botaoB)} g={b.ganhoA} dir={1} />
              <Botao b={b.botaoA} k={k} />
              <div style={{fontFamily: BANG, fontSize: 60, color: '#fff', ...C(6), transform: `scale(${1 + 0.1 * Math.sin(f * 0.15 + i)})`}}>X</div>
              <Botao b={b.botaoB} k={k} />
              <Lado cor={b.b} hm={hum(b.botaoB, b.botaoA)} g={b.ganhoB} dir={-1} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 948, display: 'flex', justifyContent: 'center', gap: 22}}>
        {[[VERDE_B, VERDE_B, '3 CADA'], [ESCURO, ESCURO, '1 CADA'], [ESCURO, VERDE_B, '5 x 0']].map(([a, b, tx], i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, background: PAPEL, border: '5px solid #111', borderRadius: 12, padding: '6px 20px', boxShadow: '5px 5px 0 #000', transform: `rotate(${i - 1}deg)`}}>
            <div style={{width: 40, height: 40, borderRadius: 20, background: a, border: '4px solid #111'}} /><div style={{fontFamily: BANG, fontSize: 34}}>+</div><div style={{width: 40, height: 40, borderRadius: 20, background: b, border: '4px solid #111'}} />
            <div style={{fontFamily: POP, fontWeight: 800, fontSize: 36, color: TINTA, marginLeft: 8}}>{tx}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- barras (moedas do dilema, quem ganhou o minijogo) ----------
const Barras: React.FC<{titulo: string; sub?: string; itens: [string, number][]; f: number; max?: number; icone?: string; sufixo?: string}> = ({titulo, sub, itens, f, max, icone, sufixo}) => {
  const m = max ?? Math.max(1, ...itens.map((x) => x[1]));
  const rh = Math.min(150, 770 / itens.length);
  const top = itens.reduce((a, x) => Math.max(a, x[1]), -99);
  return (
    <AbsoluteFill>
      <Titulo f={f} sub={sub}>{titulo}</Titulo>
      <div style={{position: 'absolute', left: 90, right: 90, top: 250 + (770 - rh * itens.length) / 2}}>
        {itens.map(([cor, val], i) => {
          const d = 14 + (itens.length - 1 - i) * 9;
          const g = spring({frame: f - d, fps: 30, config: {damping: 12, stiffness: 120}});
          const lider = val === top;
          return (
            <div key={cor} style={{display: 'flex', alignItems: 'center', gap: 18, height: rh, opacity: interpolate(f, [d - 6, d], [0, 1], cl)}}>
              <div style={{transform: `translateY(${lider ? -Math.abs(Math.sin(f * 0.18)) * 6 : 0}px)`}}><Telefone cor={cor} s={rh * 0.92} f={f} humor={lider ? 'feliz' : 'normal'} olhar={[1, 0]} /></div>
              <div style={{width: 250}}><Nome cor={cor} fs={Math.min(44, rh * 0.42)} /></div>
              <div style={{position: 'relative', height: rh * 0.62, width: Math.max(14, 1080 * (val / m) * g), background: `linear-gradient(#ffffff55, transparent 45%), ${COR[cor]}`, border: '6px solid #111', borderRadius: 12, boxShadow: '6px 6px 0 #000', overflow: 'hidden'}}>
                <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(115deg, #ffffff22 0 18px, transparent 18px 44px)', backgroundPosition: `${f * 1.2}px 0`}} />
              </div>
              {icone ? <div style={{transform: `rotate(${Math.sin(f * 0.1 + i) * 12}deg)`}}><Icone n={icone} s={rh * 0.5} /></div> : null}
              <div style={{fontFamily: BANG, fontSize: Math.min(110, rh * 0.9), lineHeight: 1, color: lider ? AMAR : '#fff', ...C(9), opacity: g}}>{Math.round(val * Math.min(1, g))}{sufixo ?? ''}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- placar da revelação: barras do último ao primeiro, bônus voando dos contadores ----------
const HUD_AP = {x: 1668, y: 168}, HUD_FA = {x: 1756, y: 168};
const Placar: React.FC<Cx> = ({v, p, f, dur, t0}) => {
  const pl = p.placar;
  const fase: string = v.fase;
  const mini = (c: string) => pl.pontos[c] - pl.bonus[c];
  const comB = (c: string, quais: string[]) => mini(c) + (quais.includes(c) ? pl.bonus[c] : 0);
  const antes = (c: string) => (fase === 'mini' ? 0 : fase === 'pacifista' ? mini(c) : fase === 'duplo' ? comB(c, ['Vermelho']) : pl.pontos[c]);
  const depois = (c: string) => (fase === 'mini' ? mini(c) : fase === 'pacifista' ? comB(c, ['Vermelho']) : fase === 'duplo' ? comB(c, ['Vermelho', 'Laranja']) : pl.pontos[c]);
  const quemSobe = fase === 'pacifista' ? 'Vermelho' : fase === 'duplo' ? 'Laranja' : null;
  const ordem = (fn: (c: string) => number) => [...CORES].sort((a, b) => fn(b) - fn(a) || CORES.indexOf(a) - CORES.indexOf(b));
  const oA = ordem(fase === 'mini' ? mini : antes), oD = ordem(depois);
  const f0 = f - t0;
  const tb = quemSobe ? Math.round(dur * 0.4) : 0; // quando o bônus cai
  const kb = quemSobe ? ease(f, tb + 26, tb + 70) : 1;
  const final = fase === 'final';
  const rh = final ? 92 : 98, topo = final ? 262 : 238, x0 = final ? 640 : 90, larg = final ? 560 : 980;
  const lider = oD[0];
  const titulo = fase === 'mini' ? 'PONTOS DOS 5 MINIJOGOS' : final ? 'PLACAR FINAL' : 'COM OS OBJETIVOS SECRETOS';
  return (
    <AbsoluteFill>
      <Titulo f={f0} sub={fase === 'mini' ? 'ainda sem os bônus secretos' : undefined}>{titulo}</Titulo>
      {final ? (
        <div style={{position: 'absolute', left: 70, top: 250, width: 520, height: 760, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <svg width={900} height={900} viewBox="-450 -450 900 900" style={{position: 'absolute', left: -190, top: -70, opacity: 0.5 * ease(f0, 30, 50)}}>{Array.from({length: 12}).map((_, i) => <path key={i} d="M0 0 L-42 -450 L42 -450 Z" fill={AMAR} transform={`rotate(${i * 30 + f * 0.4})`} opacity={0.5} />)}</svg>
          <div style={{transform: `translateY(${interpolate(f0, [30, 46], [-500, 0], {...cl, easing: (t) => 1 - (1 - t) ** 3})}px) rotate(${Math.sin(f / 20) * 5}deg)`, marginBottom: -34, zIndex: 2}}><Icone n="coroa" s={190} /></div>
          <div style={{transform: `scale(${spring({frame: f0 - 16, fps: 30, config: {damping: 9}})}) translateY(${-Math.abs(Math.sin(f * 0.16)) * 12}px)`}}><Telefone cor={lider} s={400} f={f} humor="feliz" /></div>
          <Nome cor={lider} fs={78} />
          <div style={{fontFamily: BANG, fontSize: 190, lineHeight: 0.95, color: AMAR, ...C(14), transform: `scale(${spring({frame: f0 - 40, fps: 30, config: {damping: 8}})})`}}>{pl.pontos[lider]}</div>
        </div>
      ) : null}
      {CORES.map((cor) => {
        const iA = oA.indexOf(cor), iD = oD.indexOf(cor);
        const d = 10 + (7 - iA) * (fase === 'mini' ? 15 : 3);
        const g = spring({frame: f0 - d, fps: 30, config: {damping: 11, stiffness: 130}});
        const kk = cor === quemSobe ? kb : 1;
        const val = fase === 'mini' ? depois(cor) * Math.min(1, g) : antes(cor) + (depois(cor) - antes(cor)) * (quemSobe ? kk : 1);
        const linha = iA + (iD - iA) * (quemSobe ? ease(f, tb + 60, tb + 90) : 1);
        const bonus = fase !== 'mini' && pl.bonus[cor] > 0 && (final || cor === quemSobe || (fase === 'duplo' && cor === 'Vermelho'));
        const base = bonus ? mini(cor) : val;
        const w = (x: number) => larg * (x / 16) * Math.min(1, g);
        const eLider = final ? iD === 0 : false, ult = final && iD === 7;
        return (
          <div key={cor} style={{position: 'absolute', left: x0, top: topo + linha * rh, height: rh, display: 'flex', alignItems: 'center', gap: 14, opacity: interpolate(f0, [d - 5, d], [0, 1], cl), zIndex: cor === quemSobe ? 3 : 1, transform: `translateX(${ult ? Math.sin(f * 0.5) * 3 : 0}px)`}}>
            <div style={{width: 70, fontFamily: BANG, fontSize: 60, color: eLider ? AMAR : '#fff', ...C(7), textAlign: 'right'}}>{Math.round(linha) + 1}<span style={{fontFamily: POP, fontWeight: 800, fontSize: 34}}>º</span></div>
            <Telefone cor={cor} s={rh * 0.95} f={f} humor={eLider ? 'feliz' : ult ? 'triste' : 'normal'} olhar={[1, 0]} />
            <div style={{width: 216}}><Nome cor={cor} fs={38} /><div style={{fontFamily: MONO, fontWeight: 700, fontSize: 19, color: '#fff', ...C(4), whiteSpace: 'nowrap'}}>{String(p.jogadores.find((j: any) => j.cor === cor)?.profissao ?? '').toUpperCase()}</div></div>
            <div style={{display: 'flex', height: rh * 0.64, border: '6px solid #111', borderRadius: 12, boxShadow: '6px 6px 0 #000', overflow: 'hidden', background: '#111'}}>
              <div style={{width: Math.max(8, w(base)), background: `linear-gradient(#ffffff55, transparent 45%), ${COR[cor]}`}} />
              {bonus ? <div style={{width: w(val - base), backgroundColor: COR[cor], backgroundImage: 'repeating-linear-gradient(115deg, #ffffffaa 0 12px, transparent 12px 26px)', backgroundPosition: `${f}px 0`, borderLeft: val - base > 0.2 ? '5px solid #111' : undefined}} /> : null}
            </div>
            {bonus && val - base > 0.5 ? <Icone n={cor === 'Vermelho' ? 'aperto' : 'faca'} s={54} /> : null}
            <div style={{fontFamily: BANG, fontSize: 82, lineHeight: 1, color: eLider || cor === quemSobe ? AMAR : '#fff', ...C(9), transform: `scale(${cor === quemSobe ? 1 + 0.35 * Math.sin(Math.PI * interpolate(f, [tb + 26, tb + 80], [0, 1], cl)) : 1})`}}>{Math.round(val)}</div>
            {bonus && val - base > 0.5 ? <Etiqueta fs={24} rot={-3} bg={AMAR}>BÔNUS +{Math.round(val - base)}</Etiqueta> : null}
          </div>
        );
      })}
      {/* os ícones guardados saem do contador e entram na barra (um por ponto de bônus) */}
      {quemSobe ? Array.from({length: pl.bonus[quemSobe]}).map((_, i) => {
        const k = ease(f, tb + i * 5, tb + 30 + i * 5);
        if (k <= 0 || k >= 1) return null;
        const a = quemSobe === 'Vermelho' ? HUD_AP : HUD_FA;
        const b = {x: x0 + 520 + (larg * mini(quemSobe)) / 16, y: topo + oA.indexOf(quemSobe) * rh + rh / 2};
        const x = a.x + (b.x - a.x) * k, y = a.y + (b.y - a.y) * k - Math.sin(k * Math.PI) * 220;
        return <div key={i} style={{position: 'absolute', left: x - 45, top: y - 45, zIndex: 5, transform: `rotate(${k * 540}deg) scale(${1 + Math.sin(k * Math.PI)})`}}><Icone n={quemSobe === 'Vermelho' ? 'aperto' : 'faca'} s={90} /></div>;
      }) : null}
      {final ? Array.from({length: 46}).map((_, i) => { const t = ((f0 * (0.9 + rnd(i))) / 190 + rnd(i + 50)) % 1; return <div key={i} style={{position: 'absolute', left: rnd(i + 9) * 1920 + Math.sin(f / 20 + i) * 30, top: -40 + t * 1160, width: 16, height: 26, background: COR[CORES[i % 8]], border: '2px solid #111', transform: `rotate(${f * (3 + rnd(i) * 5) + i * 40}deg)`, opacity: ease(f0, 30, 50)}} />; }) : null}
    </AbsoluteFill>
  );
};

// ---------- urna da votação: cédula na cor de quem votou ----------
const Urna: React.FC<Cx> = ({v, p, f, t0, dur, falas}) => {
  const mj = p.minijogos[2];
  const g = mj.ganhos ?? {};
  const votos: any[] = mj.detalhe.votos ?? [];
  const f0 = f - t0;
  const quem = falas[0]?.cor;
  const tr = Math.round(dur * 0.3);
  const Cedula = ({de, lado, k, n}: {de: string; lado: 'verde' | 'vermelho'; k: number; n: number}) => {
    const e = spring({frame: f0 - 12 - n * 4, fps: 30, config: {damping: 12}});
    return (
      <div style={{position: 'absolute', left: 20, top: lado === 'verde' ? 372 - k * 58 : 716 + k * 58, width: 180, height: 54, display: 'flex', alignItems: 'center', gap: 6, background: PAPEL, border: '4px solid #111', borderLeft: `22px solid ${COR[de]}`, borderRadius: 6, boxShadow: '4px 4px 0 #000', padding: '0 6px', opacity: Math.min(1, e * 2), transform: `translateY(${(1 - e) * (lado === 'verde' ? -300 : 300)}px) rotate(${(rnd(n) - 0.5) * 7}deg) scale(${quem === de ? 1.12 : 1})`}}>
        <Icone n={lado === 'verde' ? 'check' : 'xis'} s={34} cor={lado === 'verde' ? VERDE_B : ESCURO} />
        <div style={{fontFamily: POP, fontWeight: 800, fontSize: 21, color: TINTA}}>{de.toUpperCase()}</div>
      </div>
    );
  };
  let n = 0;
  return (
    <AbsoluteFill>
      {(['verde', 'vermelho'] as const).map((lado) => (
        <div key={lado} style={{position: 'absolute', left: 0, right: 0, top: lado === 'verde' ? 104 : 934, display: 'flex', justifyContent: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: BANG, fontSize: 62, letterSpacing: 2, lineHeight: 1.1, color: '#fff', background: lado === 'verde' ? VERDE_B : ESCURO, border: '6px solid #111', borderRadius: 14, padding: '0 30px', boxShadow: '7px 7px 0 #000', transform: `rotate(${lado === 'verde' ? -1.5 : 1.5}deg)`}}>
            <Icone n={lado === 'verde' ? 'check' : 'xis'} s={52} cor="#fff" />VOTOS {lado.toUpperCase()}S ({lado === 'verde' ? '+3' : '-3'})
          </div>
        </div>
      ))}
      {CORES.map((c, i) => {
        const gv = v.resultado ? g[c] ?? 0 : 0;
        const kr = gv ? spring({frame: f - tr - i * 4, fps: 30, config: {damping: 8}}) : 0;
        return (
          <div key={c} style={{position: 'absolute', left: 80 + i * 220, top: 0, width: 220, height: 1080}}>
            <div style={{position: 'absolute', left: 14, top: 228, width: 192, height: 676, borderRadius: 16, background: gv > 0 ? '#1e9e5a33' : gv < 0 ? '#9e1b1f44' : '#00000026', border: `4px dashed ${gv && kr > 0.3 ? (gv > 0 ? VERDE_B : ESCURO) : '#ffffff22'}`}} />
            <div style={{position: 'absolute', left: 22, top: 438, width: 176, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${quem === c ? -Math.abs(Math.sin(f * 0.2)) * 8 : Math.sin(f / 40 + i) * 3}px)`}}>
              <Telefone cor={c} s={170} f={f} humor={kr > 0.3 ? (gv > 0 ? 'feliz' : 'triste') : 'normal'} olhar={[0, gv < 0 ? 1 : -1]} />
              <Nome cor={c} fs={32} />
            </div>
            {(['verde', 'vermelho'] as const).map((lado) => { let k = 0; return votos.filter((x) => x[lado] === c).flatMap((x) => Array.from({length: x.peso ?? 1}).map(() => <Cedula key={`${lado}${x.cor}${k}`} de={x.cor} lado={lado} k={k++} n={n++} />)); })}
            {kr > 0.02 ? <div style={{position: 'absolute', left: 0, right: 0, top: 214, textAlign: 'center', fontFamily: BANG, fontSize: 104, lineHeight: 1, color: gv > 0 ? '#5dffa8' : '#ff5c5c', ...C(14), transform: `scale(${kr}) rotate(${gv > 0 ? -8 : 8}deg)`, zIndex: 4}}>{gv > 0 ? '+' : ''}{gv}</div> : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- vestiário: 8 cortinas, fantasia por baixo, barbante das apostas ----------
const Vestiario: React.FC<Cx> = ({v, p, f, t0, falas}) => {
  const d = p.minijogos[3].detalhe;
  const f0 = f - t0;
  const quem = falas[0]?.cor;
  const W = 215, GAP = 14, X0 = (1920 - 8 * W - 7 * GAP) / 2, TOP = 318, H = 500;
  const bx = (c: string) => X0 + CORES.indexOf(c) * (W + GAP) + W / 2;
  const rev = v.revela ? ease(f0, 30, 50) : 0;
  const conta = (c: string) => Object.values(d.suspeitos ?? {}).filter((x) => x === c).length;
  return (
    <AbsoluteFill>
      <Titulo f={f0}>7 {String(d.comum).toUpperCase()}S · <span style={{color: AMAR}}>1 {String(d.diferente).toUpperCase()}</span></Titulo>
      {CORES.map((c, i) => {
        const dif = c === d.impostor;
        const k = ease(f0, 12 + i * 5, 40 + i * 5);
        const fal = quem === c;
        return (
          <div key={c} style={{position: 'absolute', left: X0 + i * (W + GAP), top: TOP, width: W, height: H, opacity: rev && !dif ? 1 - rev * 0.55 : 1, transform: `scale(${dif && rev ? 1 + 0.08 * rev : fal ? 1.05 : 1})`, zIndex: dif && rev ? 3 : 1}}>
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#3b2a1c, #1d130c)', border: `7px solid ${dif && rev ? AMAR : '#111'}`, borderRadius: 14, overflow: 'hidden', boxShadow: dif && rev ? `0 0 60px ${AMAR}` : '7px 7px 0 #000'}}>
              <div style={{position: 'absolute', left: 0, right: 0, top: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transform: `translateY(${fal || (dif && rev) ? -Math.abs(Math.sin(f * 0.2)) * 12 : Math.sin(f / 35 + i) * 4}px)`}}>
                <Telefone cor={c} s={188} f={f} fantasia={dif ? d.diferente : d.comum} falando={fal && falas[0].tipo.startsWith('liga')} olhar={[Math.sin(f / 45 + i * 2), 0]} />
                <Etiqueta fs={30} rot={-3 + (i % 3) * 3} bg={dif ? '#15151a' : PAPEL} cor={dif ? '#fff' : TINTA}>{String(dif ? d.diferente : d.comum).toUpperCase()}</Etiqueta>
              </div>
              {[-1, 1].map((s) => <div key={s} style={{position: 'absolute', top: 0, bottom: 62, width: '50%', left: s < 0 ? 0 : '50%', background: `repeating-linear-gradient(90deg, ${COR[c]} 0 20px, #00000040 20px 27px)`, borderBottom: '6px solid #111', transformOrigin: s < 0 ? '0 0' : '100% 0', transform: `scaleX(${1 - k * 0.8}) skewX(${s * k * -5 + Math.sin(f / 22 + i) * 1.2}deg)`}} />)}
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 20, background: '#c9a15a', borderBottom: '5px solid #111'}} />
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 62, background: '#0d0805', borderTop: '5px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Nome cor={c} fs={32} /></div>
            </div>
            {v.suspeitos && conta(c) ? <div style={{position: 'absolute', left: W / 2 - 40, top: -46, width: 80, height: 80, borderRadius: 40, background: ESCURO, border: '6px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BANG, fontSize: 56, color: '#fff', transform: `scale(${spring({frame: f0 - 70, fps: 30, config: {damping: 8}}) * (1 + 0.06 * Math.sin(f * 0.2))})`, zIndex: 4}}>{conta(c)}</div> : null}
          </div>
        );
      })}
      {v.suspeitos ? (
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
          {CORES.map((c, i) => {
            const s = d.suspeitos?.[c]; if (!s) return null;
            const a = bx(c) + (i % 2 ? 22 : -22), b = bx(s) + (i - 3.5) * 9, k = ease(f0, 40 + i * 6, 66 + i * 6);
            const alt = s === c ? 110 : Math.min(100, 40 + Math.abs(b - a) * 0.08);
            const dd = s === c ? `M${a - 40} ${TOP} C ${a - 70} ${TOP - 150}, ${a + 70} ${TOP - 150}, ${a + 30} ${TOP - 8}` : `M${a} ${TOP} Q ${(a + b) / 2} ${TOP - alt * 2} ${b} ${TOP - 6}`;
            return <g key={c} opacity={quem && quem !== c ? 0.3 : 1}><path d={dd} fill="none" stroke="#111" strokeWidth={11} pathLength={1} strokeDasharray={`${k} 1`} strokeLinecap="round" /><path d={dd} fill="none" stroke={COR[c]} strokeWidth={6} pathLength={1} strokeDasharray={`${k} 1`} strokeLinecap="round" /><circle cx={s === c ? a - 40 : a} cy={TOP} r={10} fill={COR[c]} stroke="#111" strokeWidth={4} /></g>;
          })}
        </svg>
      ) : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 862, display: 'flex', justifyContent: 'center'}}>
        {v.revela ? <div style={{fontFamily: BANG, fontSize: 92, letterSpacing: 3, color: AMAR, ...C(11), transform: `scale(${interpolate(rev, [0, 1], [2, 1])}) rotate(-2deg)`, opacity: rev}}>O DIFERENTE ERA {DO(d.impostor) === 'DA' ? 'A' : 'O'} {String(d.impostor).toUpperCase()}</div>
          : <Etiqueta fs={40} rot={-1} bg={PAPEL} style={{display: 'flex', alignItems: 'center', gap: 14}}><Icone n="olho" s={48} />{v.suspeitos ? 'CADA FIO É UMA APOSTA: QUEM É O DIFERENTE?' : 'NINGUÉM SABE SE É O DIFERENTE · VOCÊ SABE'}</Etiqueta>}
      </div>
    </AbsoluteFill>
  );
};

// ---------- a bomba: 4 fios, alicate, folha do manual (a verdade) e explosão ----------
const Bomba: React.FC<Cx> = ({v, p, f, dur, t0, id}) => {
  const d = p.minijogos[4].detalhe;
  const cor: string = v.cor;
  const b = d.bomba[cor];
  const holder: string = d.manual?.[cor];
  const log = bombaAte(p, cor, 99); // o corte real do log (para a etiqueta da mentira)
  const corte: number = v.corte ?? Math.round(dur * 0.6);
  const tc = f - corte;
  const cortou = !!v.fio && tc >= 0;
  const explodiu = cortou && v.fio !== b.certo;
  const salvo = cortou && !explodiu;
  const mentira: string | null = log && !log.desarmou && log.seguiuInstrucaoDe && (v.fio || ['X5', 'X6'].includes(id)) ? log.fio : null;
  const f0 = f - t0;
  const WY = (i: number) => 520 + i * 96;
  const iCerto = b.fios.indexOf(b.certo), iFio = v.fio ? b.fios.indexOf(v.fio) : -1, iMent = mentira ? b.fios.indexOf(mentira) : -1;
  // alicate: passeia; com mentira vai e volta entre o fio certo e o fio da mentira; no fim desce no fio cortado
  const vai = mentira ? iCerto + (iMent - iCerto) * (0.5 - 0.5 * Math.cos(f / 26)) : 1.5 + 1.5 * Math.sin(f / 46);
  const kc = v.fio ? ease(f, corte - 50, corte - 16) : 0;
  const idx = vai * (1 - kc) + iFio * kc;
  const ay = WY(idx) - 30 * (1 - ease(f, corte - 8, corte)) + (cortou ? -interpolate(tc, [4, 30], [0, salvo ? 260 : 900], cl) : 0) + (kc < 1 ? Math.sin(f * 0.21) * 5 : 0);
  const ang = cortou ? 0 : 13 - 13 * ease(f, corte - 6, corte) + (kc > 0.9 ? 0 : 3 * Math.sin(f * 0.3));
  const tremor = explodiu && tc < 34 ? 30 * (1 - tc / 34) : !cortou && v.fio && tc > -16 ? 2.5 : 0;
  const ex = explodiu ? spring({frame: tc, fps: 30, config: {damping: 13, stiffness: 190}}) : 0;
  const some = explodiu ? interpolate(tc, [22, 46], [1, 0], cl) : 0;
  const pisca = Math.floor(f / 10) % 2 === 0;
  const medo: Humor = explodiu ? 'morto' : salvo ? 'feliz' : v.fio && tc > -60 ? 'medo' : 'normal';
  return (
    <AbsoluteFill style={{transform: `translate(${Math.sin(f * 2.3) * tremor}px, ${Math.cos(f * 2.9) * tremor}px)`}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        <g transform={`rotate(${-1 + Math.sin(f / 90) * 0.5} 660 560)`}>
          <rect x={112} y={212} width={1100} height={760} rx={34} fill="#000" opacity={0.5} />
          <rect x={96} y={194} width={1100} height={760} rx={34} fill={explodiu && tc > 4 ? '#17191c' : '#343b44'} stroke="#111" strokeWidth={10} />
          <rect x={120} y={218} width={1052} height={712} rx={22} fill="none" stroke="#ffffff1c" strokeWidth={5} />
          {[[130, 228], [1162, 228], [130, 920], [1162, 920]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={11} fill="#9aa5ad" stroke="#111" strokeWidth={4} /><path d={`M${x - 6} ${y - 6} L${x + 6} ${y + 6}`} stroke="#111" strokeWidth={3} /></g>)}
          {/* dinamite */}
          {!explodiu || tc < 3 ? [0, 1, 2].map((i) => <g key={i}><rect x={150} y={248 + i * 68} width={470} height={60} rx={14} fill="#c8322b" stroke="#111" strokeWidth={6} /><rect x={156} y={254 + i * 68} width={458} height={14} rx={7} fill="#ffffff44" /><rect x={300} y={248 + i * 68} width={170} height={60} fill={PAPEL} stroke="#111" strokeWidth={5} /><text x={385} y={292 + i * 68} textAnchor="middle" fontFamily={BANG} fontSize={42} fill={TINTA}>TNT</text></g>) : null}
          {!explodiu || tc < 3 ? <g><rect x={196} y={240} width={34} height={212} rx={4} fill="#15151a" stroke="#111" strokeWidth={4} /><rect x={540} y={240} width={34} height={212} rx={4} fill="#15151a" stroke="#111" strokeWidth={4} /><path d="M620 300 q40 -50 76 6" fill="none" stroke="#111" strokeWidth={8} /></g> : null}
          {/* visor */}
          <rect x={690} y={248} width={460} height={204} rx={18} fill="#0b0d0f" stroke="#111" strokeWidth={8} />
          <rect x={712} y={270} width={416} height={160} rx={10} fill={salvo ? '#062414' : explodiu ? '#050505' : '#2a0606'} />
          <text x={920} y={372} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={salvo ? 62 : 76} fill={salvo ? '#4dff9a' : '#ff4a3a'} opacity={explodiu ? 0 : salvo || pisca ? 1 : 0.35}>{salvo ? 'DESARMADA' : 'ARMADA'}</text>
          <circle cx={1118} cy={232} r={20} fill={salvo || explodiu ? '#2a2f33' : pisca ? '#ff3b2e' : '#6a1410'} stroke="#111" strokeWidth={6} />
          {!salvo && !explodiu && pisca ? <circle cx={1118} cy={232} r={38} fill="#ff3b2e" opacity={0.3} /> : null}
          {/* fios */}
          {b.fios.map((fio: string, i: number) => {
            const y = WY(i), cortado = cortou && i === iFio, cai = cortado ? Math.min(1, tc / 10) : 0;
            const dA = `M330 ${y} C 480 ${y - 34 + Math.sin(f / 30 + i) * 6}, 580 ${y + 34}, ${cortado ? 640 : 660} ${y + cai * 44}`, dB = `M${cortado ? 720 : 660} ${y + cai * 50} C 800 ${y - 30}, 960 ${y + 30 + Math.sin(f / 33 + i) * 6}, 1130 ${y}`;
            const meuAlvo = !cortou && Math.round(idx) === i;
            return (
              <g key={fio} opacity={explodiu && tc > 6 ? 0.45 : 1}>
                {[dA, dB].map((dd, k) => <g key={k}><path d={dd} stroke="#111" strokeWidth={30} fill="none" strokeLinecap="round" /><path d={dd} stroke={FIO[fio]} strokeWidth={19} fill="none" strokeLinecap="round" /><path d={dd} stroke="#ffffff55" strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray="30 50" /></g>)}
                <rect x={1118} y={y - 24} width={46} height={48} rx={8} fill="#9aa5ad" stroke="#111" strokeWidth={5} />
                <g transform={`translate(${meuAlvo ? 8 : 0} 0)`}><rect x={118} y={y - 36} width={228} height={72} rx={12} fill={FIO[fio]} stroke={meuAlvo ? AMAR : '#111'} strokeWidth={6} /><text x={232} y={y + 13} textAnchor="middle" fontFamily={POP} fontWeight={800} fontSize={34} fill={['branco', 'amarelo'].includes(fio) ? '#111' : '#fff'}>{fio.toUpperCase()}</text></g>
                {cortado && tc < 12 ? Array.from({length: 8}).map((_, k) => { const a = (k / 8) * Math.PI * 2; return <line key={k} x1={680 + Math.cos(a) * tc * 3} y1={y + Math.sin(a) * tc * 3} x2={680 + Math.cos(a) * (14 + tc * 9)} y2={y + Math.sin(a) * (14 + tc * 9)} stroke={AMAR} strokeWidth={7} strokeLinecap="round" opacity={1 - tc / 12} />; }) : null}
              </g>
            );
          })}
          <g transform={`translate(680 ${ay}) rotate(${Math.sin(f / 37) * 3})`}><Alicate ang={ang} /></g>
        </g>
      </svg>
      <div style={{position: 'absolute', left: 470, top: 84, display: 'flex', alignItems: 'center', gap: 14, transform: `rotate(-2deg) translateY(${interpolate(f0, [0, 10], [-60, 0], cl)}px)`}}>
        <div style={{fontFamily: BANG, fontSize: 86, letterSpacing: 3, lineHeight: 1, color: COR[cor], ...C(11)}}>BOMBA {DO(cor)} {cor.toUpperCase()}</div>
      </div>
      {/* a folha do manual: a verdade que só o público vê, presa no telefone de quem guarda */}
      <div style={{position: 'absolute', left: 1262, top: 196, width: 590, transform: `rotate(${2.5 + Math.sin(f / 55) * 1.2}deg) translateX(${interpolate(f0, [4, 18], [700, 0], {...cl, easing: (t) => 1 - (1 - t) ** 3})}px)`}}>
        <div style={{background: PAPEL, border: '7px solid #111', borderRadius: 10, boxShadow: '12px 12px 0 #000', padding: '58px 30px 78px', backgroundImage: 'repeating-linear-gradient(transparent 0 46px, #1d1a1214 46px 48px)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: '#5a5343'}}><Icone n="olho" s={38} cor={COR[holder]} />SÓ VOCÊ VÊ</div>
          <div style={{fontFamily: POP, fontWeight: 800, fontSize: 36, lineHeight: 1.15, color: TINTA, marginTop: 2}}>MANUAL DESSA BOMBA</div>
          <div style={{fontFamily: POP, fontWeight: 800, fontSize: 30, color: TINTA}}>quem guarda: <span style={{color: COR[holder], ...C(5, '#111')}}>{String(holder).toUpperCase()}</span></div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, color: '#5a5343', marginTop: 8}}>FIO CERTO:</div>
          <div style={{position: 'relative', marginTop: 4}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <div style={{width: 96, height: 40, borderRadius: 20, background: FIO[b.certo], border: '5px solid #111'}} />
              <div style={{fontFamily: BANG, fontSize: 104, lineHeight: 1, letterSpacing: 2, color: TINTA, transform: `scale(${1 + 0.03 * Math.sin(f * 0.12)})`, transformOrigin: '0 50%'}}>{String(b.certo).toUpperCase()}</div>
            </div>
            {mentira ? (
              <div style={{position: 'absolute', left: 200, top: 64, background: '#fff', border: '6px solid #111', borderRadius: 8, padding: '0 22px 4px', boxShadow: '6px 6px 0 #000', transform: `rotate(${-9 + Math.sin(f / 18) * 1.5}deg) scale(${interpolate(f0, [30, 38], [2.6, 1], cl)})`, opacity: interpolate(f0, [30, 33], [0, 1], cl)}}>
                <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, color: ESCURO}}>O QUE {DO(log.seguiuInstrucaoDe).slice(1) === 'A' ? 'A' : 'O'} {String(log.seguiuInstrucaoDe).toUpperCase()} DISSE:</div>
                <div style={{fontFamily: BANG, fontSize: 88, lineHeight: 1, letterSpacing: 2, color: ESCURO}}>{mentira.toUpperCase()}</div>
              </div>
            ) : null}
          </div>
        </div>
        <div style={{position: 'absolute', left: 190, top: -96}}><Telefone cor={holder} s={170} f={f} humor={mentira ? 'bravo' : 'normal'} olhar={[-0.8, 0.6]} /></div>
        <div style={{position: 'absolute', left: 244, top: 34, width: 62, height: 44, background: '#9aa5ad', border: '5px solid #111', borderRadius: 8}} />
      </div>
      {/* o dono da bomba, suando */}
      <div style={{position: 'absolute', left: 1440, top: 668, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateX(${!cortou && v.fio && tc > -60 ? Math.sin(f * 1.7) * 4 : 0}px) rotate(${explodiu ? interpolate(tc, [0, 14], [0, 14], cl) : 0}deg)`}}>
        <Telefone cor={cor} s={230} f={f} humor={medo} olhar={[-1, -0.3]} fora={!explodiu && !salvo} caindo={explodiu ? ease(tc, 4, 26) : 0} />
        <Nome cor={cor} fs={44} />
        {explodiu ? <svg width={230} height={218} viewBox="0 0 200 190" style={{position: 'absolute', left: 0, top: 0, opacity: ease(tc, 2, 10)}}><path d="M38 78 Q40 62 62 60 L138 60 Q160 62 162 78 L182 150 Q185 172 164 172 L36 172 Q15 172 18 150 Z" fill="#000" opacity={0.45} /></svg> : null}
      </div>
      {/* fumaça depois da explosão */}
      {explodiu && tc > 14 ? Array.from({length: 16}).map((_, i) => { const t = ((tc * (0.6 + rnd(i) * 0.6)) / 110 + rnd(i + 3)) % 1; return <div key={i} style={{position: 'absolute', left: 200 + rnd(i + 7) * 900 + Math.sin(tc / 25 + i) * 40, top: 800 - t * 760, width: 150 + rnd(i) * 150, height: 150 + rnd(i) * 150, borderRadius: '50%', background: i % 3 ? '#2a2d30' : '#51575c', opacity: 0.6 * Math.sin(t * Math.PI) * ease(tc, 14, 30), transform: `scale(${0.6 + t})`}} />; }) : null}
      {/* a explosão */}
      {explodiu && some > 0 ? (
        <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: some}}>
          <g transform={`translate(680 ${WY(iFio)})`}>
            {[0, 1].map((k) => <circle key={k} r={interpolate(tc, [k * 5, 26 + k * 5], [40, 1500], cl)} fill="none" stroke="#fff" strokeWidth={interpolate(tc, [k * 5, 26 + k * 5], [60, 4], cl)} opacity={0.8} />)}
            <polygon points={estrela(16, 1050 * ex, 620 * ex, tc * 0.02, 1)} fill={ESCURO} stroke="#111" strokeWidth={12} strokeLinejoin="round" />
            <polygon points={estrela(14, 800 * ex, 470 * ex, 0.3 - tc * 0.03, 2)} fill="#F2802E" stroke="#111" strokeWidth={10} strokeLinejoin="round" />
            <polygon points={estrela(12, 560 * ex, 320 * ex, 0.1 + tc * 0.02, 3)} fill={AMAR} stroke="#111" strokeWidth={8} strokeLinejoin="round" />
            <polygon points={estrela(10, 300 * ex, 170 * ex, 0.5, 4)} fill="#fff" />
            {Array.from({length: 18}).map((_, i) => { const a = rnd(i) * Math.PI * 2, sp = 26 + rnd(i + 20) * 34; return <rect key={i} x={Math.cos(a) * sp * tc - 18} y={Math.sin(a) * sp * tc + 0.9 * tc * tc - 12} width={36 + rnd(i + 5) * 30} height={22} rx={5} fill={i % 3 ? '#343b44' : '#c8322b'} stroke="#111" strokeWidth={5} transform={`rotate(${tc * (14 + i * 3)} ${Math.cos(a) * sp * tc} ${Math.sin(a) * sp * tc + 0.9 * tc * tc})`} />; })}
          </g>
        </svg>
      ) : null}
      {explodiu && tc < 40 ? <div style={{position: 'absolute', left: 0, width: 1360, top: 500, textAlign: 'center', fontFamily: BANG, fontSize: 380, lineHeight: 1, letterSpacing: 10, color: '#fff', ...C(30), transform: `scale(${interpolate(tc, [0, 7], [0.2, 1], {...cl, easing: (t) => 1 - (1 - t) ** 3}) + tc * 0.004}) rotate(-7deg)`, opacity: interpolate(tc, [28, 40], [1, 0], cl)}}>BUM!</div> : null}
      {explodiu && tc < 8 ? <AbsoluteFill style={{background: '#fff', opacity: interpolate(tc, [0, 8], [1, 0], cl), left: -200, top: -200, width: 2320, height: 1480}} /> : null}
      {salvo ? <AbsoluteFill style={{background: '#000', opacity: 0.38 * ease(tc, 2, 14), left: -200, top: -200, width: 2320, height: 1480, pointerEvents: 'none'}} /> : null}
    </AbsoluteFill>
  );
};

const Bombas: React.FC<Cx> = ({p, f}) => {
  const e = p.minijogos[4].detalhe.estado;
  const ok = Object.values(e).filter((x) => x === 'desarmada').length;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 70, top: 150, width: 1240, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24}}>
        {CORES.map((c, i) => {
          const k = spring({frame: f - 6 - i * 7, fps: 30, config: {damping: 10}}), bom = e[c] === 'desarmada';
          return (
            <div key={c} style={{height: 380, borderRadius: 22, border: '7px solid #111', background: bom ? 'linear-gradient(#1f4a36, #10261f)' : 'linear-gradient(#5a1a12, #260b08)', boxShadow: '8px 8px 0 #000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, transform: `scale(${k}) rotate(${Math.sin(f / 50 + i) * 1.5}deg)`}}>
              <Telefone cor={c} s={190} f={f} humor={bom ? 'feliz' : 'morto'} caindo={bom ? 0 : 0.7} />
              <Nome cor={c} fs={36} />
              <Etiqueta fs={30} rot={bom ? -3 : 4} bg={bom ? VERDE_B : ESCURO} cor="#fff">{String(e[c]).toUpperCase()}</Etiqueta>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 1330, top: 240, width: 540, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{fontFamily: BANG, fontSize: 320, lineHeight: 1, color: AMAR, ...C(18), transform: `scale(${spring({frame: f - 60, fps: 30, config: {damping: 8}})}) rotate(-4deg)`}}>{ok}/{CORES.length}</div>
        <div style={{transform: `rotate(${Math.sin(f * 0.35) * (f > 200 ? 12 : 3)}deg) scale(${1 + 0.06 * Math.sin(f * 0.2)})`}}><Icone n="cadeado" s={300} /></div>
      </div>
    </AbsoluteFill>
  );
};

const Trofeus: React.FC<Cx> = ({v, f}) => {
  const itens: string[][] = v.itens ?? [];
  return (
    <AbsoluteFill>
      <Titulo f={f}>PRÊMIOS DA PARTIDA</Titulo>
      <div style={{position: 'absolute', left: 80, right: 80, top: 236, display: 'grid', gridTemplateColumns: itens.length > 3 ? '1fr 1fr' : '1fr', gap: 28}}>
        {itens.map(([t, s, cor], i) => {
          const k = spring({frame: f - 8 - i * 14, fps: 30, config: {damping: 11}});
          return (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 20, height: itens.length > 3 ? 350 : 230, background: PAPEL, border: `8px solid #111`, borderLeft: `34px solid ${COR[cor]}`, borderRadius: 18, boxShadow: '12px 12px 0 #000', padding: '0 24px', transform: `scale(${k}) rotate(${(i % 2 ? 1 : -1) * (1 + Math.sin(f / 40 + i))}deg)`}}>
              <div style={{position: 'relative', flexShrink: 0, transform: `translateY(${-Math.abs(Math.sin(f * 0.15 + i)) * 10}px)`}}>
                <Telefone cor={cor} s={210} f={f} humor="feliz" />
                <div style={{position: 'absolute', right: -40, top: -50, transform: `rotate(${12 + Math.sin(f * 0.2 + i) * 8}deg)`}}><Icone n="trofeu" s={120} /></div>
              </div>
              <div>
                <div style={{fontFamily: BANG, fontSize: 68, lineHeight: 1.05, letterSpacing: 2, color: TINTA}}>{t}</div>
                <div style={{fontFamily: POP, fontWeight: 800, fontSize: 34, lineHeight: 1.2, color: TINTA, marginTop: 6}}>{s}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Visual: React.FC<Cx> = (x) => {
  const {v, p, f} = x;
  switch (v.tipo) {
    case 'mesa': return <Mesa {...x} />;
    case 'cartao': return <Cartao {...x} />;
    case 'telao': return <Telao {...x} />;
    case 'moedas': return <Barras titulo="MOEDAS DO DILEMA" sub="só deste minijogo" icone="moeda" itens={CORES.map((c) => [c, p.minijogos[1].detalhe.moedas[c]] as [string, number]).sort((a, b) => b[1] - a[1])} f={f - x.t0} />;
    case 'urna': return <Urna {...x} />;
    case 'vestiario': return <Vestiario {...x} />;
    case 'bomba': return <Bomba {...x} />;
    case 'bombas': return <Bombas {...x} />;
    case 'trofeus': return <Trofeus {...x} />;
    case 'vencedor': { const g = p.minijogos[v.mj - 1].ganhos; return <Barras titulo={`QUEM GANHOU O MINIJOGO ${v.mj}`} sub="pontos neste minijogo" sufixo="" itens={(Object.entries(g).filter(([, n]) => (n as number) > 0) as [string, number][]).sort((a, b) => b[1] - a[1])} f={f - x.t0} max={4} />; }
    case 'placar': return <Placar {...x} />;
    default: return null;
  }
};

// ---------- citação: três balões, sempre iguais (pensamento = nuvem com eco; ligação = balão com fone; poder = crachá) ----------
const ROT: Record<string, string> = {pensamento: 'PENSAMENTO · SÓ VOCÊ VÊ', 'ligação': 'LIGAÇÃO', 'ligação · caiu': 'LIGAÇÃO QUE CAIU', poder: 'PODER SECRETO'};
const Cita: React.FC<{o: Extract<Over, {tipo: 'cita'}>; p: P}> = ({o, p}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 13, stiffness: 150}}) * interpolate(f, [o.dur - 8, o.dur], [1, 0], cl);
  const pens = o.tipoCita.startsWith('pensamento'), poder = o.tipoCita.startsWith('poder'), caiu = o.tipoCita.includes('caiu'), liga = o.tipoCita.startsWith('liga');
  const cor = o.cor ? COR[o.cor] : ESCURO;
  const palavras = o.texto.split(' ');
  const n = interpolate(f, [4, Math.max(14, o.dur * 0.42)], [0, palavras.length], cl);
  const L = o.texto.length;
  const fs = L > 170 ? 39 : L > 120 ? 44 : L > 70 ? 50 : 58;
  const l = liga && o.mt ? (p.minijogos[o.mt[0] - 1]?.tiques?.[o.mt[1] - 1]?.ligacoes ?? []).find((x: any) => x.de === o.cor) : null;
  const rot = poder ? (o.cor === 'Ciano' ? 'PODER SECRETO · GUICHÊ DO APRESENTADOR' : ROT.poder) : liga && l ? (l.vivaVoz ? 'NO VIVA-VOZ, PARA TODOS' : `LIGOU PARA ${DO(l.para) === 'DA' ? 'A' : 'O'} ${String(l.para).toUpperCase()}`) + (caiu ? ' · CAIU' : '') : ROT[o.tipoCita] ?? o.tipoCita.toUpperCase();
  const borda = caiu ? '#7a8086' : cor;
  return (
    <div style={{position: 'absolute', left: 46, right: 46, bottom: 30, display: 'flex', gap: 6, alignItems: 'flex-end', opacity: Math.min(1, e * 1.4), transform: `translateY(${(1 - e) * 90}px)`}}>
      {o.cor ? (
        <div style={{width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${-Math.abs(Math.sin(f * 0.2)) * (liga ? 8 : 3)}px) rotate(${Math.sin(f / 30) * 2}deg)`}}>
          <Telefone cor={o.cor} s={220} f={f} fora={liga} falando={liga && n < palavras.length} humor={caiu ? 'triste' : 'normal'} olhar={pens ? [0.6, -1] : [1, 0]} />
          <Nome cor={o.cor} fs={36} />
        </div>
      ) : null}
      <div style={{position: 'relative', flex: 1, marginBottom: 26}}>
        {pens ? [2, 1].map((k) => <div key={k} style={{position: 'absolute', inset: 0, border: `6px solid ${cor}`, borderRadius: 70, opacity: 0.5 / k, transform: `translate(${k * (12 + 3 * Math.sin(f * 0.15))}px, ${-k * (10 + 3 * Math.sin(f * 0.15))}px)`}} />) : null}
        {pens && o.cor ? [0, 1, 2].map((k) => <div key={k} style={{position: 'absolute', left: -20 - k * 20, bottom: 30 - k * 26, width: 34 - k * 8, height: 34 - k * 8, borderRadius: '50%', background: '#fffdf4', border: `5px solid ${cor}`, transform: `translateY(${Math.sin(f * 0.15 + k) * 4}px)`}} />) : null}
        {!pens && o.cor ? <svg width={50} height={60} style={{position: 'absolute', left: -38, bottom: 54, zIndex: 2}}><path d="M48 4 L4 34 L48 52" fill={poder ? AMAR : PAPEL} stroke={borda} strokeWidth={8} strokeLinejoin="round" /><path d="M48 0 V58" stroke={poder ? AMAR : PAPEL} strokeWidth={10} /></svg> : null}
        <div style={{position: 'relative', background: pens ? '#fffdf4' : poder ? AMAR : PAPEL, border: `8px ${caiu ? 'dashed' : 'solid'} ${borda}`, borderRadius: pens ? 70 : poder ? 14 : 30, boxShadow: pens ? '0 14px 0 #0007' : sombra, padding: pens ? '20px 50px 26px' : '18px 36px 24px', outline: '4px solid #111', outlineOffset: 0}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: POP, fontWeight: 800, fontSize: 28, color: o.cor && claro(o.cor) && !caiu ? '#111' : '#fff', background: borda, border: '4px solid #111', borderRadius: 30, padding: '0 20px 0 12px', whiteSpace: 'nowrap'}}>
              <Icone n={pens ? 'olho' : poder ? 'lupa' : caiu ? 'chiado' : 'fone'} s={40} cor={PAPEL} />{o.cor ? rot : '@Pursuer_M4'}
            </div>
            {o.mt ? <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: '#5a5343', whiteSpace: 'nowrap'}}>MINIJOGO {o.mt[0]} · TIQUE {o.mt[1]}</div> : null}
          </div>
          <div style={{fontFamily: POP, fontWeight: 800, fontSize: fs, lineHeight: 1.22, color: TINTA, fontStyle: pens ? 'italic' : 'normal'}}>
            “{palavras.map((w, i) => <span key={i} style={{opacity: i < n ? 1 : 0, background: i < n && i >= n - 1 ? `${AMAR}` : undefined, borderRadius: 6}}>{w}{i < palavras.length - 1 ? ' ' : ''}</span>)}<span style={{opacity: n >= palavras.length ? 1 : 0}}>”</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- cartão de capítulo: a troca de pino ----------
const Capitulo: React.FC<{o: Extract<Over, {tipo: 'capitulo'}>; n: number}> = ({o, n}) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 5], [0, 1], cl) * interpolate(f, [o.dur - 9, o.dur], [1, 0], cl);
  const JX = (i: number) => 460 + i * 250;
  const de = n >= 1 && n <= 5 ? JX(Math.max(0, n - 2)) : 960, ate = n >= 1 && n <= 5 ? JX(n - 1) : 960;
  const k = ease(f, 2, 13);
  const px = de + (ate - de) * k, py = 170 - Math.sin(k * Math.PI) * 70 * (n > 1 ? 1 : 0) - (n === 1 ? (1 - k) * 120 : 0);
  const fio = ease(f, 8, 22);
  const fs = Math.min(150, 2900 / Math.max(10, o.titulo.length));
  return (
    <AbsoluteFill style={{opacity: a}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1c4234 0%, #0b1a15 70%, #040a08 100%)'}} />
      <div style={{position: 'absolute', left: 300, top: 96, width: 1320, height: 150, background: 'linear-gradient(#5a3a22, #3a2416)', border: '8px solid #111', borderRadius: 20, boxShadow: '10px 10px 0 #000'}} />
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {[0, 1, 2, 3, 4].map((i) => <g key={i}><circle cx={JX(i)} cy={170} r={34} fill="#111" stroke="#c9a15a" strokeWidth={8} /><circle cx={JX(i)} cy={170} r={13} fill={i === n - 1 && k > 0.95 ? AMAR : '#2a2a2a'} /><text x={JX(i) + 62} y={190} fontFamily={MONO} fontWeight={700} fontSize={54} fill={i === n - 1 ? AMAR : '#c9a15a'}>{i + 1}</text></g>)}
        {n >= 1 && n <= 5 ? (
          <g>
            <path d={`M${px} ${py + 40} C ${px} ${py + 300}, 140 420, 140 650 L ${140 + 1640 * fio} 650`} fill="none" stroke="#111" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M${px} ${py + 40} C ${px} ${py + 300}, 140 420, 140 650 L ${140 + 1640 * fio} 650`} fill="none" stroke={AMAR} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
            <rect x={px - 20} y={py - 6} width={40} height={66} rx={10} fill="#222" stroke="#111" strokeWidth={6} /><rect x={px - 9} y={py - 34} width={18} height={34} rx={4} fill="#c9a15a" stroke="#111" strokeWidth={4} />
            {/* a mão que troca o pino */}
            <g transform={`translate(${px + 14} ${py + 20}) rotate(${-18 + k * 12}) translate(${interpolate(f, [15, 26], [0, 520], cl)} ${interpolate(f, [15, 26], [0, -330], cl)})`}>
              <path d="M-6 -22 Q26 -40 60 -26 L210 20 L196 74 L48 50 Q10 54 -8 30 Z" fill={PAPEL} stroke="#111" strokeWidth={7} strokeLinejoin="round" />
              <path d="M150 0 L138 58" stroke="#111" strokeWidth={6} /><rect x={150} y={-4} width={90} height={84} rx={8} fill={ESCURO} stroke="#111" strokeWidth={7} transform="rotate(16 150 0)" />
              <path d="M4 -4 Q24 -12 46 -6 M0 12 Q22 6 46 12" stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" />
            </g>
          </g>
        ) : (
          <g>{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={JX(i) - 20} y={170 + f * f * (0.5 + i * 0.07)} width={40} height={66} rx={10} fill="#222" stroke="#111" strokeWidth={6} transform={`rotate(${f * (4 + i)} ${JX(i)} ${200 + f * f * 0.5})`} />)}<line x1={140} y1={650} x2={140 + 1640 * fio} y2={650} stroke={AMAR} strokeWidth={14} strokeLinecap="round" /></g>
        )}
      </svg>
      {n < 1 || n > 5 ? <div style={{position: 'absolute', left: 1560, top: 300, transform: `rotate(${Math.sin(f * 0.5) * 8}deg) scale(${1 + 0.1 * Math.sin(f * 0.3)})`}}><Icone n="cadeado" s={230} aberto={f > 30} /></div> : null}
      <div style={{position: 'absolute', left: 140, right: 100, top: 636 - fs * 1.12, fontFamily: BANG, fontSize: fs, lineHeight: 1, letterSpacing: 4, color: '#fff', ...C(12), whiteSpace: 'nowrap', clipPath: `inset(-20% ${100 - ease(f, 6, 22) * 104}% -20% -5%)`}}>{o.titulo}</div>
      <div style={{position: 'absolute', left: 140, right: 120, top: 684, fontFamily: POP, fontWeight: 800, fontSize: 56, lineHeight: 1.18, color: PAPEL, ...C(8), opacity: interpolate(f, [12, 20], [0, 1], cl), transform: `translateY(${interpolate(f, [12, 22], [30, 0], cl)}px)`}}>{o.regra}</div>
      <div style={{position: 'absolute', right: 110, top: 292, fontFamily: BANG, fontSize: 76, letterSpacing: 2, lineHeight: 1.15, color: '#fff', background: ESCURO, border: '8px solid #111', borderRadius: 14, padding: '2px 34px', boxShadow: '10px 10px 0 #000', opacity: interpolate(f, [14, 17], [0, 1], cl), transform: `rotate(-5deg) scale(${interpolate(f, [14, 22], [2.6, 1], cl) * (1 + 0.03 * Math.sin(f * 0.25))})`}}><span style={{fontSize: 44, display: 'block', lineHeight: 1, marginBottom: -6}}>IDEIA DE</span>@Pursuer_M4</div>
    </AbsoluteFill>
  );
};

// ---------- carimbo torto (selo): bate, fica o tempo de ler e sai dentro da própria duração ----------
const Carimbo: React.FC<{texto: string; dur: number; comMeme?: boolean}> = ({texto, dur, comMeme}) => {
  const f = useCurrentFrame();
  const partes = texto.split('~~');
  const L = texto.replace(/~~/g, '').length;
  const fs = comMeme ? (L > 34 ? 62 : L > 22 ? 78 : L > 12 ? 96 : 130) : L > 34 ? 84 : L > 22 ? 104 : L > 12 ? 128 : 170;
  const rot = ((hash(texto) % 11) - 5 || 3) * 1.1;
  const e = interpolate(f, [0, 6], [2.8, 1], {...cl, easing: (t) => 1 - (1 - t) ** 3});
  const sai = interpolate(f, [dur - 7, dur], [1, 0], cl);
  const credito = texto.includes('@');
  return (
    <div style={{position: 'absolute', left: comMeme ? 30 : 60, right: comMeme ? 700 : 60, top: 250, display: 'flex', justifyContent: 'center', opacity: interpolate(f, [0, 3], [0, 1], cl) * sai}}>
      <div style={{position: 'relative', transform: `rotate(${rot}deg) scale(${e * (1 + 0.012 * Math.sin(f * 0.25))})`}}>
        {f < 16 ? <div style={{position: 'absolute', inset: -30, border: '10px solid #fff', borderRadius: 40, opacity: 0.7 * (1 - f / 16), transform: `scale(${1 + f * 0.035})`}} /> : null}
        <div style={{fontFamily: BANG, fontSize: fs, lineHeight: 1.08, letterSpacing: 3, textAlign: 'center', color: credito ? '#fff' : ESCURO, background: credito ? ESCURO : PAPEL, border: `9px solid ${credito ? '#fff' : ESCURO}`, outline: '7px solid #111', borderRadius: 18, padding: '6px 40px 8px', boxShadow: '12px 12px 0 #000c', maxWidth: comMeme ? 1140 : 1700}}>
          {partes.map((t, i) => (i % 2 ? <span key={i} style={{position: 'relative', opacity: 0.6}}>{t}<span style={{position: 'absolute', left: -6, top: '46%', height: 12, borderRadius: 6, background: '#111', width: `${interpolate(f, [8, 20], [0, 108], cl)}%`, transform: 'rotate(-4deg)'}} /></span> : <span key={i}>{t}</span>))}
        </div>
      </div>
    </div>
  );
};

// ---------- HUD: aba do capítulo (com o crédito), relógio de tiques e cadeado do placar secreto ----------
const FALTAM: Record<string, number> = {A: 5, D: 5, B: 4, V: 3, F: 2, X: 1};
const MJ: Record<string, number> = {D: 1, B: 2, V: 3, F: 4, X: 5};
const Hud: React.FC<{c: Cena; p: P; f: number; tique?: number}> = ({c, p, f, tique}) => {
  const L = c.id[0];
  if (c.id === 'A1' || L === 'Z') return null;
  const faltam = FALTAM[L] ?? 0, mj = MJ[L] ? p.minijogos[MJ[L] - 1] : null;
  const bate = L === 'X' && c.id === 'X11' ? Math.sin(f * 0.6) * 6 : Math.sin(f / 26) * 2;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 26, top: 22, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, transform: `rotate(${-1 + Math.sin(f / 80) * 0.5}deg)`}}>
        <div style={{background: PAPEL, border: '5px solid #111', borderRadius: 12, boxShadow: '6px 6px 0 #000', padding: '4px 18px 6px'}}>
          <div style={{fontFamily: BANG, fontSize: 40, lineHeight: 1.05, letterSpacing: 1.5, color: TINTA, whiteSpace: 'nowrap'}}>{mj ? `${mj.n} · ${mj.nome}` : L === 'R' ? 'A REVELAÇÃO' : 'JOGO DE CONFIANÇA'}</div>
          <div style={{fontFamily: POP, fontWeight: 800, fontSize: 23, lineHeight: 1.1, color: ESCURO, whiteSpace: 'nowrap'}}>IDEIA DE @Pursuer_M4</div>
        </div>
        {tique && mj ? <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, color: AMAR, background: '#0b0d0f', border: '5px solid #111', borderRadius: 10, padding: '0 14px', boxShadow: '5px 5px 0 #000'}}>TIQUE {tique} DE {mj.tiques.length}</div> : null}
      </div>
      <div style={{position: 'absolute', right: 26, top: 22, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#0b0d0fee', border: '5px solid #111', borderRadius: 14, padding: '6px 18px 6px 10px', boxShadow: '6px 6px 0 #000', transform: `rotate(${bate}deg)`}}>
          <Icone n="cadeado" s={64} aberto={!faltam} />
          <div><div style={{fontFamily: BANG, fontSize: 38, lineHeight: 1.05, letterSpacing: 1.5, color: AMAR}}>{faltam ? 'PLACAR SECRETO' : 'PLACAR ABERTO'}</div>{faltam ? <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 22, lineHeight: 1.1, color: '#fff'}}>FALTA{faltam > 1 ? 'M' : ''} {faltam} MINIJOGO{faltam > 1 ? 'S' : ''}</div> : null}</div>
        </div>
        {/* os dois contadores guardados para a revelação (sem valor à vista) */}
        <div style={{display: 'flex', gap: 14, marginRight: 96}}>
          {(['aperto', 'faca'] as const).map((n, i) => <div key={n} style={{width: 74, height: 74, borderRadius: 37, background: PAPEL, border: `6px solid ${COR[i ? 'Laranja' : 'Vermelho']}`, outline: '4px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${Math.sin(f / 30 + i * 2) * 8}deg)`}}><Icone n={n} s={50} /></div>)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CenaView: React.FC<{c: Cena; p: P}> = ({c, p}) => {
  const f = useCurrentFrame();
  let soco = 0;
  for (const o of c.over) { const d = f - o.at; if (d >= 0 && d < 12 && (o.tipo === 'selo' || o.tipo === 'meme')) soco = Math.max(soco, 0.05 * (1 - d / 12)); }
  const falas: Fala[] = (c.over.filter((o) => o.tipo === 'cita') as Extract<Over, {tipo: 'cita'}>[])
    .map((o) => ({cor: o.cor, tipo: o.tipoCita, mt: o.mt, w: ease(f, o.at, o.at + 18) * (1 - ease(f, o.at + o.dur - 14, o.at + o.dur))}))
    .filter((x) => x.w > 0.001).sort((a, b) => b.w - a.w);
  const wk = Math.min(1, falas.reduce((a, x) => a + x.w, 0));
  const cap = c.over.find((o) => o.tipo === 'capitulo');
  const t0 = cap ? cap.at + cap.dur - 14 : 0;
  const selo1 = c.over.find((o) => o.tipo === 'selo');
  const mesa = c.visual.tipo === 'mesa';
  const sd = hash(c.id);
  const z = 1.02 + 0.03 * (f / Math.max(1, c.dur)) + soco;
  const enc = mesa ? 1 : 1 - 0.19 * wk;
  const v = {...c.visual, corte: selo1 ? selo1.at - 10 : undefined};
  const mjN = c.visual.mj ?? MJ[c.id[0]];
  const tique = mesa ? (falas[0]?.mt && falas[0].mt[0] === mjN ? falas[0].mt[1] : c.visual.tique ?? 1) : undefined;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Feltro f={f + sd} />
      <AbsoluteFill style={{transform: `translate(${Math.sin(f / 97 + sd) * (mesa ? 0 : 14)}px, ${Math.cos(f / 131 + sd) * (mesa ? 0 : 8) - (mesa ? 0 : 40 * wk)}px) scale(${z * enc})`, transformOrigin: mesa ? '50% 50%' : '50% 0%'}}>
        <Visual v={v} p={p} f={f} dur={c.dur} t0={t0} falas={falas} id={c.id} />
      </AbsoluteFill>
      <Hud c={c} p={p} f={f} tique={tique} />
      {c.over.map((o, i) => (
        <Sequence key={i} from={o.at} durationInFrames={o.dur}>
          {o.tipo === 'cita' ? <Cita o={o} p={p} /> : null}
          {o.tipo === 'selo' ? <Carimbo texto={o.texto} dur={o.dur} comMeme={c.over.some((m) => m.tipo === 'meme' && m.at < o.at + o.dur && m.at + m.dur > o.at)} /> : null}
          {o.tipo === 'meme' ? <MemeCard info={o.info} dur={o.dur} pos={o.pos} /> : null}
          {o.tipo === 'capitulo' ? <Capitulo o={o} n={MJ[c.id[0]] ?? 0} /> : null}
        </Sequence>
      ))}
      {c.audio.map((a, i) => <Sequence key={`a${i}`} from={a.at}><Audio src={staticFile(a.src)} volume={a.vol ?? 1} /></Sequence>)}
    </AbsoluteFill>
  );
};

export const ConfiancaVideo: React.FC<{tl: TL | null}> = ({tl}) => {
  const [p, setP] = useState<P | null>(null);
  const [h] = useState(() => delayRender('partida confiança'));
  useEffect(() => { fetch(staticFile('confianca/partida.json')).then((r) => r.json()).then((d) => { setP(d); continueRender(h); }); }, [h]);
  if (!tl || !p) return null;
  let ini = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.cenas.map((c) => { const s = ini; ini += c.dur; return <Sequence key={c.id} from={s} durationInFrames={c.dur}><CenaView c={c} p={p} /></Sequence>; })}
    </AbsoluteFill>
  );
};
