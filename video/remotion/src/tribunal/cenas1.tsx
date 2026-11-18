// TRIBUNAL: cenas A1–C4 (abertura, "SÓ VOCÊ VÊ", Safira dia 1). Cada cena lê as âncoras da timeline (X.c = citações,
// X.s = selos, X.t0 = fim do cartão de capítulo) e reparte o resto por proporção: nada preso a quadro fixo.
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {AMBAR, BANG, C, cl, COR, ease, janela, LATAO, LUZ, MAD_C, MONO, NOME, PERG, Pedra, POP, quique, rnd, sombra, TINTA, VINHO} from './base';
import {Anel, Bandeira, Cadeado, Carimbo, Colar, Estreia, Ficha, Lacre, Numero, Piso, Placa, Registro, Retrato, TagSo, Versoes, FarolPac, estado} from './pecas';
import {Corte, Gravura, Liso, MARCOS, Mesa, mxC, Papel, Planta, Sala, xHora} from './cenarios';
import {palT, sk, type X} from './dados';
import {Cam, CartaoSo, Hud, marcasPara, passos, pop, Rot, type CenaFn} from './util';

const g = (a: number, b: number, x: number) => a + (b - a) * x;

// ---------- A1: duas sentenças (sem revelar qual advogada condenou: farol neutro) ----------
const A1: CenaFn = (X) => {
  const {f, dur} = X, c0 = sk(X, X.c, 0, 0), c1 = sk(X, X.c, 1, 0.35), s1 = sk(X, X.s, 1, 0.88);
  const p2 = c0.end + 8, corte = c1.at - 14, sil = c1.end + 26, piso = Math.max(s1.at + 6, dur - 48);
  const off = c0.end - 22;
  const fase = f < p2 ? 1 : f < corte ? 2 : f < sil ? 3 : f < piso ? 4 : 5;
  const flash = Math.max(janela(f, corte - 3, corte + 9, 4), janela(f, p2 - 3, p2 + 6, 3) * 0.6);
  const quem = (cab: number) => ({juiz: {cor: 'Roxo', fala: fase === 1 || fase === 3, gesto: fase === 1 ? ease(f, off - 30, off) : 0.3}, testemunha: {cor: 'Vermelho', humor: 'cinico' as const}, re: {cor: 'Rosa', cadeados: 2, cabecaBaixa: cab}, promotor: {cor: 'Laranja'}});
  const m = fase === 1 ? <Cam f={f} k={[[0, 960, 420, 1.05], [c0.end, 960, 470, 1.15]]}><Sala plano="juiz" f={f} clima="noite" quem={{juiz: quem(0).juiz}} /></Cam>
    : fase === 2 || fase === 3 ? <Cam f={f} k={fase === 2 ? [[p2, 1300, 560, 1.05], [corte, 1560, 600, 1.35]] : [[corte, 960, 520, 1.0], [c1.end, 1500, 600, 1.3]]}>
      <Sala plano="geral" f={f} clima="noite" quem={quem(fase === 2 ? ease(f, p2 + 14, p2 + 40) : 0)}>
        <div style={{position: 'absolute', left: 1490, top: 610, zIndex: 20}}>{fase === 2 ? <Carimbo txt="CONDENADA" tipo="condenada" t={f - (p2 + 12)} fs={96} /> : <Carimbo txt="ABSOLVIDA" tipo="absolvida" t={f - (c1.end - 8)} fs={96} />}</div>
      </Sala>
    </Cam>
    : fase === 4 ? <Liso f={f}>
      {['Azul', 'Verde'].map((cor, i) => <div key={cor} style={{position: 'absolute', left: i ? 1180 : 240, top: 200 + Math.sin(f / 20 + i) * 8}}><Pedra cor={cor} s={420} f={f} rod={cor === 'Azul' ? 'S' : 'J'} silh /><div style={{textAlign: 'center', fontFamily: POP, fontWeight: 800, fontSize: 40, color: COR[cor], ...C(6)}}>ADVOGADA {i + 1}</div></div>)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 280, textAlign: 'center', fontFamily: BANG, fontSize: 360, color: LUZ, ...C(16), transform: `scale(${pop(f, sil, 14)}) rotate(${Math.sin(f / 9) * 4}deg)`}}>?</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 800, display: 'flex', justifyContent: 'center', gap: 60, opacity: ease(f, sil + 20, sil + 30)}}><Carimbo txt="SALVOU" tipo="absolvida" t={f - sil - 20} fs={70} /><Carimbo txt="CONDENOU" tipo="condenada" t={f - sil - 34} fs={70} /></div>
    </Liso>
    : <AbsoluteFill style={{background: `repeating-linear-gradient(90deg, ${MAD_C} 0 150px, #6a4126 150px 156px)`}}><Cam f={f} k={[[piso, 960, 540, 1.6], [dur, 960, 540, 1.9]]}><div style={{position: 'absolute', left: 660, top: 240, filter: `drop-shadow(0 0 ${30 * ease(f, piso + 10, piso + 30)}px ${LUZ})`}}><Piso s={600} k={ease(f, piso, piso + 30)} w={7} /></div></Cam><AbsoluteFill style={{background: 'radial-gradient(#0000 30%, #000c)'}} /></AbsoluteFill>;
  const farolPs = fase <= 2 ? passos(2, [off, 0]) : passos(2);
  return {m: <>{m}<AbsoluteFill style={{background: '#fff', opacity: flash}} /></>, h: fase <= 3 ? <Hud f={f} farol={{rod: 'X', passos: farolPs, s: 130}} /> : null};
};

// ---------- A2: o experimento (título entalhado + elenco) ----------
const A2: CenaFn = (X) => {
  const {f} = X, c0 = sk(X, X.c, 0, 0.35), s0 = sk(X, X.s, 0, 0.82);
  const tA = c0.at * 0.42, tR = c0.at * 0.55, gp = s0.at - c0.end;
  const sobe = ease(f, tA, tA + 20);
  const D = X.D, titulo = String(D.caso.TITULO ?? '').toUpperCase();
  const ent = (at: number) => ({opacity: ease(f, at, at + 10), transform: `translateY(${(1 - quique(f, at, 14)) * 120}px)`});
  const elenco: [string, string | null, number, number, number, string][] = [['Azul', 'S', 720, 420, c0.end + gp * 0.05, 'ADVOGADA · RODADA 1'], ['Verde', 'J', 1080, 420, c0.end + gp * 0.25, 'ADVOGADA · RODADA 2'], ['Roxo', null, 1480, 300, c0.end + gp * 0.5, 'JUIZ']];
  return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 0, right: 0, top: g(300, 26, sobe), display: 'flex', justifyContent: 'center', transform: `scale(${g(1, 0.56, sobe) * (f < 12 ? quique(f, 0, 14) : 1)})`, transformOrigin: '50% 0%'}}>
      <div style={{position: 'relative', background: `repeating-linear-gradient(1deg, ${MAD_C} 0 50px, #7b4e2e 50px 54px)`, border: `8px solid ${TINTA}`, borderRadius: 20, boxShadow: sombra, padding: '16px 70px 26px', textAlign: 'center'}}>
        {[[-6, -6], [1, -6]].map(([x], i) => <div key={i} style={{position: 'absolute', [i ? 'right' : 'left']: -6, top: -6, width: 70, height: 70, background: `linear-gradient(135deg, ${LUZ}, ${LATAO})`, border: `4px solid ${TINTA}`, clipPath: i ? 'polygon(0 0,100% 0,100% 100%)' : 'polygon(0 0,100% 0,0 100%)'}} />)}
        <div style={{fontFamily: BANG, fontSize: 200, lineHeight: 1, letterSpacing: 8, color: '#3a2010', textShadow: '0 4px 0 #c9945e, 0 -3px 0 #2a1408'}}>TRIBUNAL DAS IAs</div>
        <div style={{fontFamily: POP, fontWeight: 800, fontSize: 52, color: PERG, letterSpacing: 3, ...C(6)}}>{titulo}</div>
        <div style={{position: 'absolute', right: -40, bottom: -36, transform: 'rotate(-6deg)'}}><Rot fs={30} bg={LUZ}>ideia de @SwordMan333</Rot></div>
      </div>
    </div>
    <div style={{position: 'absolute', left: 90, top: 300, ...ent(tR)}}>
      <div style={{position: 'absolute', inset: -40, borderRadius: 60, background: `radial-gradient(${LUZ}55, #0000 70%)`}} />
      <Retrato cor="Vermelho" rod="S" s={330} f={f} modelo={D.modelo('Vermelho')} humor="cinico" rot="O ASSASSINO · TESTEMUNHA" />
      <div style={{position: 'absolute', left: 250, top: 10, opacity: ease(f, tR + 30, tR + 40), transform: `rotate(6deg) scale(${pop(f, tR + 30)})`}}><TagSo txt="SÓ VOCÊ VÊ: É ELE" fs={30} /></div>
    </div>
    {elenco.map(([cor, rod, x, y, at, rot]) => <div key={cor} style={{position: 'absolute', left: x, top: y, ...ent(at)}}><Retrato cor={cor} rod={rod} s={cor === 'Roxo' ? 300 : 270} f={f} modelo={D.modelo(cor)} rot={rot} /></div>)}
    <div style={{position: 'absolute', left: 700, top: 880, opacity: ease(f, c0.end + gp * 0.78, c0.end + gp * 0.85)}}><Rot fs={40} bg={LUZ}>VOCÊ VAI SABER A VERDADE. ELAS, NÃO.</Rot></div>
  </Liso>};
};

// ---------- A3: a regra numa objeção + demonstração do farol ----------
const A3: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.2), c1 = sk(X, X.c, 1, 0.44), c2 = sk(X, X.c, 2, 0.5), s0 = sk(X, X.s, 0, 0.85);
  const [R, i] = D.ref(X.cita[0]?.ref ?? 'S#25');
  const decl = D.decl(R, i), lit = D.declIdx(R, i, X.cita[0]?.texto ?? '');
  const obj = D.primeiro(R, (e) => e.i > i && e.tipo === 'defesa' && e.acao === 'objecao');
  const fp = D.ficha(obj?.prova ?? 'E3');
  const demo = c2.end + 6, gp = s0.at - demo;
  if (f < demo) {
    const reg = c0.end + (c1.at - c0.end) * 0.2;
    return {m: <Cam f={f} k={[[0, 960, 540, 1], [c0.at, 1250, 480, 1.08], [c1.at, 1000, 520, 1], [c2.at + 10, 1300, 440, 1.12]]}>
      <Sala plano="banco" f={f} quem={{testemunha: {cor: 'Amarelo', fala: f >= c0.at && f < c0.end, humor: f > c2.at ? 'triste' : 'normal'}}}>
        <div style={{position: 'absolute', left: 880, top: 120, zIndex: 10}}><Placa cor="Amarelo" decl={decl} lit={f >= c0.at - 10 ? lit : null} f={f} w={1000} entra={c0.at * 0.15} carimbos={[{i: lit, txt: 'OBJEÇÃO ACEITA', at: c2.at + 12, tipo: 'latao'}]} /></div>
        <div style={{position: 'absolute', left: 80, top: 640, zIndex: 12, opacity: janela(f, reg, c1.at - 30, 10), transform: `translateY(${(1 - ease(f, reg, reg + 14)) * 300}px) scale(0.62)`, transformOrigin: '0 0'}}><Registro f={f} itens={['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', fp.id].map((id, k) => ({...D.ficha(id), brilho: id === fp.id && f > reg + 20, at: k === 7 ? reg + 10 : undefined}))} w={1100} cols={4} /></div>
        <div style={{position: 'absolute', left: 120, top: 180, zIndex: 30}}><Bandeira t={f - (c1.at - 34)} ficha={fp} /></div>
      </Sala>
    </Cam>, h: <Hud f={f} rod={R} dia={D.ev(R, i)?.dia} />};
  }
  const lf = f - demo;
  const st = [0.12, 0.38, 0.62, 0.86].map((x) => demo + gp * x);
  const n = f < st[0] ? 6 : f < st[1] ? 5 : f < st[2] ? 3 : f < st[3] ? 0 : 6;
  const pss = passos(6, [st[0], 5], [st[1], 3], [st[2], 0], [st[3], 6]), e = estado(f, pss);
  const rot = [['-1 · OBJEÇÃO ERRADA', st[0]], ['-2 · ACUSAÇÃO ERRADA', st[1]], ['0 = RÉ CONDENADA', st[2]]] as const;
  return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 260, top: 110, transform: `translateX(${(1 - ease(lf, 0, 14)) * 900}px)`}}><FarolPac rod="S" n={e.n} antes={e.antes} t={e.t} s={360} f={f} /></div>
    <div style={{position: 'absolute', left: 760, top: 160, display: 'flex', flexDirection: 'column', gap: 34}}>
      <Rot fs={44} bg={LUZ}>A PACIÊNCIA DO JUIZ: 6 LUZES</Rot>
      {rot.map(([t, at], k) => <div key={t} style={{opacity: ease(f, at, at + 8), transform: `scale(${pop(f, at)})`, transformOrigin: '0 50%'}}><Carimbo txt={t} tipo={k === 2 ? 'condenada' : 'recusada'} t={f - at} fs={74} rot={-2} /></div>)}
      <div style={{opacity: ease(f, st[3], st[3] + 8)}}><Rot fs={40}>(EXEMPLO · CADA RODADA TEM O SEU)</Rot></div>
    </div>
    {n === 0 ? null : null}
  </Liso>};
};

// ---------- B1: quinze anos atrás (gravura) ----------
const B1: CenaFn = (X) => {
  const {f, t0, D} = X, s0 = sk(X, X.s, 0, 0.85), G = s0.at - t0, r = (x: number) => t0 + G * x;
  const fr = (f - t0) / Math.max(1, G);
  const pf3 = D.desc('PF3');
  const k = {
    luz: fr < 0.27 ? 1 : fr < 0.66 ? 0 : ease(f, r(0.66), r(0.72)),
    rubi: janela(f, r(0.02), r(0.32), 12), tranca: ease(f, r(0.1), r(0.22)), anel: janela(f, r(0.14), r(0.3), 8),
    barco: fr > 0.3 ? ease(f, r(0.3), r(0.5)) : 0, naufragio: fr > 0.48 ? ease(f, r(0.48), r(0.6)) : 0, peridoto: Math.max(janela(f, r(0.54), r(0.64), 8), ease(f, r(0.92), r(0.97))),
    anselmo: fr > 0.62 && fr < 0.8 ? ease(f, r(0.62), r(0.7)) : 0, envelope: fr > 0.88 ? ease(f, r(0.88), r(0.96)) : 0,
    relogio: fr < 0.48 ? '22:50' : fr < 0.62 ? '23:10' : fr < 0.8 ? '23:40' : undefined,
  };
  const cond = janela(f, r(0.78), r(0.9), 10);
  return {m: <Cam f={f} k={[[t0, 600, 560, 1.45], [r(0.25), 560, 520, 1.2], [r(0.32), 1000, 560, 1], [r(0.48), 1450, 760, 1.25], [r(0.62), 900, 500, 1.05], [r(0.66), 560, 300, 1.35], [r(0.8), 960, 540, 1], [r(0.9), 1300, 700, 1.3], [X.dur, 1380, 760, 1.45]]}>
    <Gravura f={f} k={k} />
    {cond > 0 ? <AbsoluteFill style={{opacity: cond, background: '#0d1a33dd'}}>
      <div style={{position: 'absolute', left: 360, top: 300}}><Papel s={200} nome="ANSELMO PRADO (FAROLEIRO)" /></div>
      <div style={{position: 'absolute', left: 300, top: 640}}><Carimbo txt="CONDENADO" tipo="condenada" t={f - r(0.8)} fs={110} /></div>
      <div style={{position: 'absolute', left: 1080, top: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}><Papel s={200} nome="DR. VALDOMIRO" cor="#d8c7a0" /><Rot fs={30} bg={LUZ}>MENTOR DO PROMOTOR DE HOJE</Rot><div style={{maxWidth: 560, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: PERG, textAlign: 'center'}}>{pf3}</div></div>
    </AbsoluteFill> : null}
  </Cam>, h: <AbsoluteFill style={{pointerEvents: 'none'}}><div style={{position: 'absolute', left: 36, top: 28, display: 'flex', gap: 14, alignItems: 'center', opacity: ease(f, t0, t0 + 10)}}><TagSo fs={32} /><Rot fs={32} bg="#0d1a33" cor={AMBAR}>12 DE MARÇO · 15 ANOS ATRÁS</Rot></div></AbsoluteFill>};
};

// ---------- B2: a noite da festa (corte do museu + régua de latão) ----------
export const HORA_FR: Record<string, number> = {'22:10': 0.02, '22:12': 0.07, '22:14': 0.16, '22:16': 0.24, '22:18': 0.32, piso: 0.42, '22:22': 0.5, '22:26': 0.58, '22:27': 0.65, '22:28': 0.8, '22:35': 0.88, balao: 0.93};
type Pos = [number, number];
const ROTA0: Record<string, [string, Pos][]> = {
  Vermelho: [['0', [470, 560]], ['22:10', [1350, 165]], ['22:16', [960, 560]], ['22:22', [1360, 560]], ['22:26', [540, 560]], ['22:27', [760, 560]], ['22:28', [400, 560]]],
  Amarelo: [['0', [380, 560]], ['22:12', [120, 560]], ['22:35', [1580, 560]]],
  Rosa: [['0', [-200, 560]], ['22:26', [240, 560]], ['22:27', [760, 560]], ['22:28', [990, 600]], ['22:35', [1660, 560]]],
};
// na ilustração do museu: x pelas paredes medidas; o chão desceu 40 px; o terraço virou a escada do corredor do terraço
const ROTA: Record<string, [string, Pos][]> = Object.fromEntries(Object.entries(ROTA0).map(([k, r]) => [k, r.map(([h, [x, y]]) => [h, [mxC(x), y < 300 ? 330 : y + 22]] as [string, Pos])]));
export const Noite: React.FC<{f: number; T: (h: string) => number; so?: string[]; texto?: boolean; janelaLaudo?: number}> = ({f, T, so, texto = true, janelaLaudo = 0}) => {
  const aceso = (h: string) => (so && !so.includes(h) ? 0 : f >= T(h) ? (f < T(h) + 12 ? 1 + (1 - (f - T(h)) / 12) * 0 : 1) : 0);
  const t18 = T('22:18'), escuro = so ? (so.includes('22:18') ? janela(f, t18, t18 + 60, 8) * 0.8 : 0) : janela(f, t18, t18 + 40, 6);
  const pos = (cor: string): Pos => { const r = ROTA[cor]; let k = 0; while (k < r.length - 1 && f >= (r[k + 1][0] === '0' ? -1e9 : T(r[k + 1][0]) - 18)) k++; const a = r[k][1], nx = r[k + 1]; if (!nx) return a; const t0 = T(nx[0]) - 18; const u = ease(f, t0, t0 + 18); return [a[0] + (nx[1][0] - a[0]) * u, a[1] + (nx[1][1] - a[1]) * u]; };
  const liaCai = ease(f, t18, t18 + 10);
  const cap: [string, string][] = [['22:10', 'RUBI SOBE AO TERRAÇO: “VOU FAZER UMA LIGAÇÃO”'], ['22:12', 'O VIGIA LARGA O POSTO PRA VER A FINAL'], ['22:14', 'LIA ESCREVE PARA “PATROCINADOR”: “PODE VIR, ESTOU ABRINDO AGORA.”'], ['22:16', 'LIA ABRE O COMPARTIMENTO DA LENTE'], ['22:18', 'O GOLPE'], ['piso', 'ELA RISCA UM DESENHO NO PISO'], ['22:22', 'RUBI CORTA A MÃO NUM CACO E PEGA 2 CURATIVOS'], ['22:26', 'A PÁGINA VAI PRA LAREIRA (METADE NÃO QUEIMA)'], ['22:27', 'CORREDOR ESCURO: QUARTZO CRUZA COM ELE'], ['22:28', 'QUARTZO ACHA A LIA E TENTA SOCORRER'], ['22:35', 'QUARTZO FOGE PELOS FUNDOS · O VIGIA VÊ'], ['balao', 'À POLÍCIA: “EU NUNCA ENTREI NO SALÃO DA LENTE.”']];
  const atual = texto ? [...cap].reverse().find(([h]) => f >= T(h) && (!so || so.includes(h))) : undefined;
  const atores = (
    <>
      <div style={{position: 'absolute', left: mxC(1000), top: 582, zIndex: 3}}><div style={{transform: `rotate(${liaCai * 80}deg)`, transformOrigin: '50% 100%'}}><Papel s={90} nome="LIA" /></div></div>
      {f >= T('piso') && (!so || so.includes('piso')) ? <div style={{position: 'absolute', left: mxC(1080), top: 662, zIndex: 4}}><Piso s={70} k={ease(f, T('piso'), T('piso') + 30)} cor={LUZ} w={8} /></div> : null}
      {(['Amarelo', 'Vermelho', 'Rosa'] as const).map((cor) => { const [x, y] = pos(cor); return <div key={cor} style={{position: 'absolute', left: x, top: y, zIndex: 5, transition: 'none'}}><Pedra cor={cor} s={118} f={f} rod="S" maoBolso={false} humor={cor === 'Rosa' && f > T('22:28') ? 'susto' : 'normal'} cadeados={0} /><div style={{textAlign: 'center', fontFamily: POP, fontWeight: 800, fontSize: 20, color: '#fff', ...C(4)}}>{NOME[cor]}</div></div>; })}
      {f >= T('22:10') && f < T('22:16') && (!so) ? <div style={{position: 'absolute', left: mxC(1450), top: 250, zIndex: 6}}><Ficha id="E2" nome="SEM SINAL" w={120} /></div> : null}
      {f >= T('22:14') && f < T('22:18') && (!so) ? <div style={{position: 'absolute', left: mxC(1000), top: 400, zIndex: 6, transform: `scale(${pop(f, T('22:14'))})`}}><Rot fs={22} bg="#8fd3ff">“Pode vir, estou abrindo agora.”</Rot></div> : null}
      {f >= T('22:22') && f < T('22:22') + 50 && (!so) ? [0, 1].map((k) => <div key={k} style={{position: 'absolute', left: mxC(1440) + k * 30, top: 560 - (f - T('22:22')) * 2, width: 34, height: 20, background: '#f5efe0', border: '3px solid #111', transform: `rotate(${(f - T('22:22')) * 6 * (k ? 1 : -1)}deg)`, zIndex: 6}} />) : null}
      {f >= T('22:26') && f < T('22:26') + 60 && (!so) ? <div style={{position: 'absolute', left: mxC(470), top: 580 + Math.min(60, (f - T('22:26')) * 2), zIndex: 6}}><Ficha id="E6" nome="PÁGINA" w={110} /></div> : null}
    </>
  );
  return (
    <Corte f={f} aceso={aceso} escuro={escuro} atores={atores} janela={janelaLaudo > 0 ? ['22:15', '22:25', janelaLaudo] : undefined}
      sobre={<>
        {escuro > 0.05 ? <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: escuro, fontFamily: MONO, fontWeight: 700, fontSize: 260, color: '#ff4a3a', ...C(12), zIndex: 40}}>22:18</div> : null}
        {atual ? <div key={atual[0]} style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', zIndex: 35, transform: `scale(${pop(f, T(atual[0]), 10)})`}}><Rot fs={atual[1].length > 44 ? 34 : 40} bg={atual[0] === '22:18' ? '#C0262E' : LUZ} cor={atual[0] === '22:18' ? '#fff' : TINTA}>{atual[0].includes(':') ? `${atual[0]} · ` : ''}{atual[1]}</Rot></div> : null}
      </>} />
  );
};
const B2: CenaFn = (X) => {
  const {f} = X, s0 = sk(X, X.s, 0, 0.85), T = (h: string) => (h === '0' ? -1e9 : (HORA_FR[h] ?? 0) * s0.at);
  return {m: <Cam f={f} k={[[0, 960, 540, 1], [T('22:16'), 1080, 520, 1.12], [T('22:22'), 1250, 520, 1.1], [T('22:26'), 700, 540, 1.1], [T('22:28'), 900, 540, 1.15], [s0.at, 960, 600, 1.02]]}><Noite f={f} T={T} /></Cam>,
    h: <AbsoluteFill style={{pointerEvents: 'none'}}><div style={{position: 'absolute', left: 36, top: 28}}><TagSo txt="SÓ VOCÊ VÊ · A NOITE DA FESTA" fs={30} /></div></AbsoluteFill>};
};

// ---------- B3: por que a inocente parece culpada ----------
const B3: CenaFn = (X) => {
  const {f, D} = X, s0 = sk(X, X.s, 0, 0.78), G = s0.at, r = (x: number) => G * x, fr = f / Math.max(1, G);
  const cad = D.cadeados;
  const tri: [string, string, number][] = [['Rosa', 'reu', 2], ['Amarelo', 'vigia', 1], ['Lima', 'pescador', 2]];
  if (fr < 0.3) return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 90, top: 150}}><Retrato cor="Rosa" rod="S" s={380} f={f} modelo={D.modelo('Rosa')} rot="A RÉ · BANCO DOS RÉUS" humor="triste" /></div>
    <div style={{position: 'absolute', left: 660, top: 150}}><Registro f={f} titulo="PROVAS DA POLÍCIA" itens={['P3', 'P4', 'P5', 'P6'].map((id, k) => ({...D.ficha(id), at: r(0.03 + k * 0.06)}))} w={1120} cols={2} /></div>
  </Liso>};
  if (fr < 0.62) {
    const desl = f < r(0.38) ? 0 : f < r(0.5) ? -1 : 1, u = ease(f, desl < 0 ? r(0.38) : r(0.5), (desl < 0 ? r(0.38) : r(0.5)) + 18);
    const x = desl === 0 ? 860 : desl < 0 ? g(860, 380, u) : g(380, 1360, u), cabe = desl > 0 && u > 0.95;
    return {m: <Liso f={f}>
      <div style={{position: 'absolute', left: 958, top: 60, bottom: 60, width: 10, background: LATAO}} />
      <div style={{position: 'absolute', left: 220, top: 180}}><Colar s={420} f={f} /><div style={{textAlign: 'center'}}><Rot fs={34}>COLAR DA QUARTZO: SÓ A ÂNCORA</Rot></div></div>
      <div style={{position: 'absolute', left: 1240, top: 230}}><Anel s={420} f={f} /><div style={{textAlign: 'center', marginTop: 20}}><Rot fs={34} bg={LUZ}>ANEL DO RUBI: ÂNCORA DENTRO DO ARO</Rot></div></div>
      <div style={{position: 'absolute', left: x, top: 240, opacity: ease(f, r(0.32), r(0.36)), filter: cabe ? `drop-shadow(0 0 30px ${LUZ})` : undefined, transform: desl < 0 && u > 0.9 ? `translateX(${Math.sin(f * 1.3) * 8}px)` : undefined}}><Piso s={420} cor={cabe ? LUZ : PERG} w={6} /></div>
      {desl < 0 && u > 0.9 ? <div style={{position: 'absolute', left: 260, top: 760}}><Carimbo txt="NÃO ENCAIXA" tipo="recusada" t={f - r(0.38) - 18} fs={80} /></div> : null}
      {cabe ? <div style={{position: 'absolute', left: 1280, top: 760}}><Carimbo txt="ENCAIXA" tipo="aceita" t={f - r(0.5) - 18} fs={90} /></div> : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center'}}><Rot fs={40} bg={LUZ}>O DESENHO DO PISO: ÂNCORA DENTRO DE UM CÍRCULO</Rot></div>
    </Liso>};
  }
  const cd = r(0.64);
  return {m: <Liso f={f}>
    {tri.map(([cor, k, n], i) => { const at = cd + i * 14, ch = (cad[k]?.chaves ?? []) as string[]; return (
      <div key={cor} style={{position: 'absolute', left: 120 + i * 600, top: 170}}>
        <Retrato cor={cor} rod="S" s={300} f={f} modelo={D.modelo(cor)} />
        <div style={{position: 'absolute', left: 262, top: -150 + ease(f, at, at + 16) * 430, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 3}}>{Array.from({length: n}).map((_, j) => <Cadeado key={j} s={90} f={f} />)}</div>
        <div style={{position: 'absolute', left: -20, top: 630, width: 420, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: PERG, opacity: ease(f, at + 10, at + 20)}}>SEGREDO: {cad[k]?.assunto}</div>
        <div style={{position: 'absolute', left: -20, top: 700, display: 'flex', flexDirection: 'column', gap: 10, opacity: ease(f, cd + 50, cd + 62), transform: `translateY(${(1 - ease(f, cd + 50, cd + 62)) * 40}px)`}}>{ch.map((id) => <TagSo key={id} txt={`CHAVE: ${D.ficha(id).nome.toUpperCase()}`} fs={26} />)}</div>
      </div>
    ); })}
    <div style={{position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center', opacity: ease(f, cd, cd + 10)}}><Rot fs={38}>CADEADO DE SEGREDO: SÓ ABRE COM A PROVA CERTA</Rot></div>
  </Liso>};
};

// ---------- C1: cinco lugares, cinco provas (planta do museu) ----------
const C1: CenaFn = (X) => {
  const {f, t0, D} = X, c0 = sk(X, X.c, 0, 0.72), s1 = sk(X, X.s, 1, 0.9), G = c0.at - t0, r = (x: number) => t0 + G * x;
  const ex = D.exames('S', 1), nv = D.novas('S', 1);
  const at = ex.map((_, j) => r(0.26 + j * 0.115));
  const rota = [{loc: 'L6', at: -1e9}, ...ex.map((e, j) => ({loc: e.local ?? 'L1', at: at[j]}))];
  const feitas = at.filter((a) => f >= a).length, acao = feitas ? D.acao('S', ex[feitas - 1].i) : null;
  const chave = (id: string) => ((D.cadeados.reu?.chaves ?? []) as string[]).indexOf(id);
  const itens = [{...D.ficha('P3'), at: -99}, ...nv.map((e, j) => ({...D.ficha(e.prova ?? ''), at: at[j] + 18}))].map((it) => {
    const ci = chave(it.id), quando = it.id === 'P3' ? at[3] + 30 : (it.at ?? 0) + 14;
    return {...it, brilho: ci >= 0 && f >= quando, tag: f >= s1.at && ci >= 0 ? 'NO BOLSO' : ci >= 0 && f >= quando ? `CHAVE ${ci + 1} DA QUARTZO` : undefined, tagSo: ci >= 0 && f < s1.at};
  });
  const c = ex.map((e) => e.local ?? 'L1');
  return {m: <Cam f={f} k={[[t0, 960, 540, 1], ...c.map((l, j) => [at[j], ...(l === 'L4' ? [500, 400, 1.12] : l === 'L2' ? [1300, 400, 1.12] : l === 'L3' ? [700, 600, 1.12] : l === 'L5' ? [1300, 480, 1.12] : [1000, 480, 1.12])] as [number, number, number, number]), [c0.at, 960, 560, 1]]}>
    <Planta f={f} rod="S" visitados={ex.map((e, j) => ({loc: e.local ?? 'L1', at: at[j]}))} quem={[{cor: 'Azul', rota}]} />
    <div style={{position: 'absolute', left: 40, top: 880, zIndex: 30, transform: 'scale(0.62)', transformOrigin: '0 0'}}><Registro f={f} itens={itens} w={2000} cols={6} /></div>
    <div style={{position: 'absolute', left: 1320, top: 600, zIndex: 25, opacity: ease(f, r(0.86), r(0.92)), transform: `translateY(${(1 - ease(f, r(0.86), r(0.92))) * 200}px)`}}><Retrato cor="Verde" rod="S" s={240} f={f} humor="feliz" modelo={D.modelo('Verde')} rot="NESTA RODADA: ASSISTENTE" /></div>
  </Cam>, h: <><Hud f={f} rod="S" dia={1} acao={acao} aparece={t0} farol={{rod: 'S', passos: passos(6)}} /><Estreia titulo="INVESTIGAÇÃO" sub="10 AÇÕES POR DIA · EXAMINAR, CONVERSAR, APRESENTAR" t={f - t0} dur={G * 0.22} /></>};
};

// mesa com a prova que desliza da advogada para o centro
const Desliza: React.FC<{f: number; at: number; id: string; nome: string; x?: number; y?: number; w?: number; sai?: number; rot?: React.ReactNode}> = ({f, at, id, nome, x = 760, y = 560, w = 300, sai, rot}) => {
  if (f < at || (sai != null && f > sai + 16)) return null;
  const k = ease(f, at, at + 18), s = sai != null ? ease(f, sai, sai + 16) : 0;
  return <div style={{position: 'absolute', left: g(340, x, k) - s * 420, top: y + (1 - k) * 80 + s * 120, zIndex: 8, transform: `rotate(${(1 - k) * -14 + 3 - s * 10}deg) scale(${1 - s * 0.3})`, opacity: 1 - s}}><Ficha id={id} nome={nome} w={w} brilho={k > 0.9 && k < 1.01 && f < at + 50} f={f} />{rot ? <div style={{position: 'absolute', left: -20, top: w * 0.72 + 10}}>{rot}</div> : null}</div>;
};

// ---------- C2: não toquei em nada ----------
const C2: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.2), c1 = sk(X, X.c, 1, 0.32), c2 = sk(X, X.c, 2, 0.53), c3 = sk(X, X.c, 3, 0.66);
  const a1 = c0.at * 0.38, a2 = c1.end + (c2.at - c1.end) * 0.4, fim = c3.end + 8;
  const ap = D.evs('S').filter((e) => e.tipo === 'apresentar' && e.dia === 1);
  const acao = f < a1 ? 6 : f < a2 ? D.acao('S', ap[0]?.i ?? 14) : D.acao('S', ap[1]?.i ?? 16);
  const e5 = D.desc('E5');
  if (f >= fim) {
    const lf = f - fim;
    return {m: <Liso f={f}>
      <div style={{position: 'absolute', left: 958, top: 60, bottom: 60, width: 10, background: LATAO}} />
      {[[`AÇÃO ${D.acao('S', ap[0]?.i ?? 14)} · S#15`, 'NÃO TOQUEI EM NADA', 0, 0], [`AÇÃO ${D.acao('S', ap[1]?.i ?? 16)} · S#17`, 'PEGUEI DOIS DA CAIXA DO CORREDOR', 1, 14]].map(([ch, t, i, d]) => <div key={t as string} style={{position: 'absolute', left: (i as number) ? 1040 : 90, top: 260, width: 800, transform: `scale(${pop(lf, d as number)}) rotate(${(i as number) ? 2 : -2}deg)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}><Pedra cor="Vermelho" s={170} busto f={f} humor="cinico" /><div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, color: PERG}}>{ch}</div></div>
        <div style={{background: '#FBF6EA', border: `9px solid ${COR.Vermelho}`, outline: `4px solid ${TINTA}`, borderRadius: 26, padding: '18px 28px', fontFamily: BANG, fontSize: 92, lineHeight: 1.02, letterSpacing: 2, color: TINTA, boxShadow: sombra}}>“{t}”</div>
      </div>)}
      <div style={{position: 'absolute', left: 700, top: 760, opacity: ease(lf, 24, 34)}}><Rot fs={44} bg={LUZ}>NA RESPOSTA SEGUINTE →</Rot></div>
    </Liso>, h: <Hud f={f} rod="S" dia={1} acao={acao} />};
  }
  return {m: <Cam f={f} k={[[0, 960, 540, 1], [c0.at, 1250, 520, 1.12], [c1.end, 960, 560, 1.02], [c2.at, 1250, 520, 1.1], [c3.end, 1000, 560, 1.04]]}>
    <Mesa f={f} rod="S" esq={{cor: 'Azul', fala: false, gesto: janela(f, a1 - 10, a1 + 30, 8) + janela(f, a2 - 10, a2 + 30, 8)}} dir={{cor: 'Vermelho', humor: f >= c0.at && f < c0.end ? 'bravo' : 'cinico', fala: (f >= c1.at && f < c1.end) || (f >= c2.at && f < c3.end)}}>
      <Desliza f={f} at={a1} id="E5" nome={D.ficha('E5').nome} x={620} y={520} sai={a2} rot={<Rot fs={26} bg={LUZ}>22:22 · FALTAM 2</Rot>} />
      <Desliza f={f} at={a2} id="E2" nome={D.ficha('E2').nome} x={780} y={520} />
      <div style={{position: 'absolute', left: 520, top: 150, width: 880, zIndex: 9, opacity: janela(f, a1 + 20, c0.at - 4, 10)}}><div style={{background: '#20262e', border: `4px solid ${LATAO}`, borderRadius: 10, padding: '6px 16px', fontFamily: MONO, fontWeight: 700, fontSize: 25, color: PERG}}>{e5}</div></div>
    </Mesa>
  </Cam>, h: <Hud f={f} rod="S" dia={1} acao={acao} />};
};

// ---------- C3: o anel do pai, o anel do avô ----------
const C3: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.2), c1 = sk(X, X.c, 1, 0.47), c2 = sk(X, X.c, 2, 0.63);
  const a1 = c0.at * 0.35, pv = c0.end + 10;
  const ap = D.primeiro('S', (e) => e.tipo === 'apresentar' && e.prova === 'P6');
  const nResp = (r: string) => { const [R, i] = D.ref(r); return D.conta(R, (e) => e.tipo === 'responde' && e.i <= i); };
  return {m: <Cam f={f} k={[[0, 960, 540, 1], [c0.at, 1100, 500, 1.06], [c1.at, 960, 520, 1]]}>
    <Mesa f={f} rod="S" esq={{cor: 'Azul', gesto: janela(f, a1 - 10, a1 + 30, 8)}} dir={{cor: 'Vermelho', humor: 'cinico', fala: X.c.some((s) => f >= s.at && f < s.end)}}>
      <Desliza f={f} at={a1} id="P6" nome={D.ficha('P6').nome} x={760} y={530} />
      <div style={{position: 'absolute', left: 300, top: 40, zIndex: 20, opacity: ease(f, pv, pv + 12), transform: `translateY(${(1 - ease(f, pv, pv + 12)) * -300}px) scale(0.92)`, transformOrigin: '50% 0%'}}><Versoes f={f} marcas={marcasPara('C3', [pv + 16])} w={1320} /></div>
      {f > pv + 20 ? <div style={{position: 'absolute', left: 640, top: 330, zIndex: 24}}><Carimbo txt="NÃO EXISTE NO CASO" tipo="recusada" t={f - pv - 20} fs={56} /></div> : null}
      {janela(f, pv + 34, c1.at, 10) > 0 ? <div style={{position: 'absolute', left: 1080, top: 300, zIndex: 22, opacity: janela(f, pv + 34, c1.at, 10), display: 'flex', flexDirection: 'column', alignItems: 'center'}}><Retrato cor="Lima" rod="S" s={180} f={f} rot={null} /><Rot fs={26} bg={LUZ}>“COLÔNIA DE PESCADORES”: JOGOU NO PESCADOR</Rot></div> : null}
      {[[c1, 'S#13', 'DO PAI', 560], [c2, 'S#21', 'DO AVÔ', 980]].map(([s, r, t, x]) => { const sg = s as {at: number}; return f >= sg.at ? <div key={r as string} style={{position: 'absolute', left: x as number, top: 520, zIndex: 23, transform: `scale(${pop(f, sg.at)}) rotate(${(x as number) > 500 ? 3 : -3}deg)`}}><div style={{background: '#FBF6EA', border: `8px solid ${COR.Vermelho}`, outline: `4px solid ${TINTA}`, borderRadius: 20, padding: '8px 26px', boxShadow: sombra}}><div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, color: '#5a5343'}}>RESPOSTA {nResp(r as string)} · {r as string}</div><div style={{fontFamily: BANG, fontSize: 110, lineHeight: 1, color: TINTA}}>ANEL {t as string}</div></div></div> : null; })}
    </Mesa>
  </Cam>, h: <Hud f={f} rod="S" dia={1} acao={ap ? D.acao('S', ap.i) : null} />};
};

// ---------- C4: foi o vento ----------
const C4: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.24), c1 = sk(X, X.c, 1, 0.33), s0 = sk(X, X.s, 0, 0.8);
  const ap = D.primeiro('S', (e) => e.tipo === 'apresentar' && e.prova === 'E4');
  const carta = /"([^"]+)"/.exec(D.desc('E4'))?.[1] ?? '';
  const a1 = c0.at * 0.3, vento = palT(X, 1, 'vento'), sai = c1.end + (s0.at - c1.end) * 0.45;
  const nov = D.novas('S', 1).length, cad = D.conta('S', (e) => e.tipo === 'cadeado_quebrado' && e.dia === 1);
  if (f >= sai) return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}><Rot fs={46} bg={LUZ}>FIM DO DIA 1 · RODADA DA SAFIRA</Rot></div>
    <div style={{position: 'absolute', left: 120, right: 120, top: 300, display: 'flex', justifyContent: 'space-around'}}>
      {[[`${nov}`, 'PROVAS NOVAS', 0], ['2', 'CONTRADIÇÕES (CÁLCULO NOSSO)', 12], [`${cad}`, 'CADEADOS ABERTOS', 24]].map(([n, t, d]) => <div key={t as string} style={{opacity: ease(f, sai + (d as number), sai + (d as number) + 6)}}><Numero txt={n as string} t={f - sai - (d as number)} fs={300} cor={n === '0' ? '#9aa1ab' : '#fff'} sub={t as string} /></div>)}
    </div>
  </Liso>, h: <Hud f={f} rod="S" dia={1} acao={ap ? D.acao('S', ap.i) : null} />};
  if (f >= vento) {
    const lf = f - vento;
    return {m: <Cam f={f} k={[[vento, 620, 600, 1.5], [sai, 620, 560, 1.25]]}><Gravura f={f} k={{luz: 0, rubi: 1, tranca: ease(lf, 0, 30), anel: 0.6 + 0.4 * Math.sin(f * 0.3), relogio: '22:50'}} /></Cam>, h: <AbsoluteFill><div style={{position: 'absolute', left: 36, top: 30, transform: `scale(${pop(lf, 4)})`}}><TagSo txt="SÓ VOCÊ VÊ: QUEM TRANCOU FOI ELE" fs={34} /></div></AbsoluteFill>};
  }
  return {m: <Cam f={f} k={[[0, 960, 500, 1], [c0.at, 960, 420, 1.1], [c1.at, 1200, 520, 1.12]]}>
    <Mesa f={f} rod="S" esq={{cor: 'Azul', gesto: janela(f, a1 - 10, a1 + 30, 8)}} dir={{cor: 'Vermelho', humor: 'cinico', fala: f >= c0.at}}>
      <Desliza f={f} at={a1} id="E4" nome={D.ficha('E4').nome} x={300} y={560} w={240} />
      {f >= a1 + 16 ? <div style={{position: 'absolute', left: 560, top: 150, width: 800, zIndex: 9, transform: `rotate(-2deg) scaleY(${ease(f, a1 + 16, a1 + 34)})`, transformOrigin: '50% 0%'}}>
        <div style={{background: PERG, border: `5px solid #6b5a3a`, boxShadow: `0 0 40px ${LUZ}66, ${sombra}`, padding: '22px 34px', fontFamily: POP, fontWeight: 600, fontStyle: 'italic', fontSize: 46, lineHeight: 1.25, color: TINTA}}>“{carta}”<div style={{fontFamily: POP, fontWeight: 800, fontStyle: 'normal', fontSize: 26, marginTop: 10, color: '#6b5a3a'}}>CARTA DE ANSELMO À FILHA · {D.ficha('E4').id}</div></div>
      </div> : null}
    </Mesa>
  </Cam>, h: <Hud f={f} rod="S" dia={1} acao={ap ? D.acao('S', ap.i) : null} />};
};

export const CENAS1: Record<string, CenaFn> = {A1, A2, A3, B1, B2, B3, C1, C2, C3, C4};
