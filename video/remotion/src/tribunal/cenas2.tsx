// TRIBUNAL: cenas D1–F3 (Safira dia 2, troca de cadeira, Jade dias 1 e 2).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BANG, C, COR, ease, janela, LATAO, LUZ, MONO, NOME, PERG, Pedra, POP, quique, sombra, TINTA} from './base';
import {AncoraConta, Anel, Arpao, Bandeira, Cadeado, Carimbo, Coracao, Estreia, FarolPac, Ficha, Flamula, Garcom, Leme, Mao, Numero, Piso, Placa, PlacaJogo, Radio, Registro, Retrato, TagSo, Versoes, estado} from './pecas';
import {Gravura, Liso, Mesa, Sala} from './cenarios';
import {palT, sk, type X} from './dados';
import {Cam, Hud, marcasPara, passos, pop, Recorte, Rot, type CenaFn} from './util';
import {HORA_FR, Noite} from './cenas1';

const g = (a: number, b: number, x: number) => a + (b - a) * x;
const fala = (X: X, ...ks: number[]) => ks.some((k) => X.c[k] && X.f >= X.c[k].at && X.f < X.c[k].end);
// sequência de flâmulas ALTO LÁ (uma em cima da outra, com o contador)
const Flamulas: React.FC<{f: number; a: number; b: number; n: number}> = ({f, a, b, n}) => {
  if (f < a || f > b + 20) return null;
  const passo = (b - a) / n, k = Math.min(n, Math.floor((f - a) / passo) + 1);
  return <AbsoluteFill style={{zIndex: 35, opacity: 1 - ease(f, b + 4, b + 20)}}>
    {Array.from({length: k}).map((_, i) => <div key={i} style={{position: 'absolute', left: 140 + (i % 3) * 60, top: 120 + (i % 4) * 70, transform: `rotate(${(i % 2 ? 4 : -3)}deg)`}}><Flamula t={f - a - i * passo} s={0.95} n={i === k - 1 ? i + 1 : undefined} /></div>)}
  </AbsoluteFill>;
};

// ---------- D1: o promotor que nunca perdeu ----------
const D1: CenaFn = (X) => {
  const {f, t0, D} = X, c0 = sk(X, X.c, 0, 0.12), c1 = sk(X, X.c, 1, 0.4), c2 = sk(X, X.c, 2, 0.5), c3 = sk(X, X.c, 3, 0.64);
  const gp = c1.at - c0.end, lemb = c0.end, obj = c0.end + gp * 0.3;
  const pen = D.penal('S')[0], rev = D.primeiro('S', (e) => e.tipo === 'revisao' && e.cor === 'Amarelo'), ob2 = D.primeiro('S', (e) => e.tipo === 'defesa' && e.acao === 'objecao' && e.i > (rev?.i ?? 0));
  const cr1 = lemb + gp * 0.12, cr2 = palT(X, 1, 'coração');
  const nCor = f < cr1 ? 0 : f < cr2 ? 1 : 2, tCor = f - (nCor === 2 ? cr2 : cr1);
  const farol = {rod: 'S', passos: passos(6, [c3.end + 6, D.pac('S', pen?.i ?? 35)]), placa: pen ? {txt: pen.fala ?? '', at: c3.end + 6} : undefined};
  const hud = <><Hud f={f} rod="S" dia={2} aparece={t0} farol={farol} /><Estreia titulo="JULGAMENTO" sub="DEPOIMENTO · OBJEÇÃO · PACIÊNCIA DO JUIZ" t={f - t0} dur={Math.min(110, c0.at - t0 + 30)} /></>;
  const prom = (vira: boolean) => <Cam f={f} k={[[t0, 960, 520, 1], [c0.end, 900, 480, 1.08]]}><Sala plano="promotor" f={f} quem={{promotor: {cor: 'Laranja', gesto: vira ? 0.4 : 1, fala: fala(X, 0, 1, 2), humor: vira ? 'triste' : 'feliz', olhar: vira ? [-1, 0] : [0, 0]}}}><div style={{position: 'absolute', left: 1220, top: 230, zIndex: 9}}><Coracao n={nCor} t={tCor} s={250} f={f} /></div></Sala></Cam>;
  if (f < c0.end || (f >= c1.at - 10 && f < c3.at)) return {m: prom(f >= c1.at - 10), h: hud};
  if (f < c1.at - 10) {
    const lembra = f < obj;
    return {m: <Cam f={f} k={[[c0.end, 1200, 500, 1.04], [c1.at, 1300, 480, 1.1]]}><Sala plano="banco" f={f} quem={{testemunha: {cor: 'Amarelo', humor: 'triste'}}}>
      <div style={{position: 'absolute', left: 880, top: 110, zIndex: 10}}><Placa cor="Amarelo" decl={lembra ? D.decl('S', 25) : rev?.declaracoes ?? []} lit={lembra ? 1 : (ob2?.declaracao ?? 3) - 1} f={f} w={1000} max={110} carimbos={lembra ? [{i: 1, txt: 'OBJEÇÃO ACEITA', at: lemb + 4, tipo: 'latao'}] : []} entra={lembra ? -99 : obj} /></div>
      {lembra ? <div style={{position: 'absolute', left: 900, top: 40, zIndex: 11}}><Rot fs={34} bg={LUZ}>LEMBRETE: A OBJEÇÃO DO VIGIA</Rot></div> : null}
      {lembra ? <div style={{position: 'absolute', left: 560, top: 640, zIndex: 12, transform: 'scale(0.6)', transformOrigin: '0 0'}}><Coracao n={nCor} t={tCor} s={250} f={f} /></div> : null}
      <div style={{position: 'absolute', left: 140, top: 200, zIndex: 30}}><Bandeira t={f - (obj + gp * 0.25)} ficha={D.ficha(ob2?.prova ?? 'E2')} /></div>
    </Sala></Cam>, h: hud};
  }
  if (f < c3.end + 30) return {m: <Cam f={f} k={[[c3.at, 960, 440, 1], [c3.end, 960, 400, 1.1]]}><Sala plano="juiz" f={f} quem={{juiz: {cor: 'Roxo', fala: fala(X, 3), gesto: ease(f, c3.end - 20, c3.end)}}} /></Cam>, h: hud};
  return {m: <Cam f={f} k={[[c3.end + 30, 960, 560, 1], [X.dur, 1100, 600, 1.12]]}><Sala plano="geral" f={f} quem={{juiz: {cor: 'Roxo'}, testemunha: {cor: 'Amarelo', humor: 'triste'}, advogada: {cor: 'Azul', humor: 'triste'}, re: {cor: 'Rosa', cadeados: 2}, promotor: {cor: 'Laranja', humor: 'triste'}, assistente: {cor: 'Verde'}}} rod="S"><div style={{position: 'absolute', left: 300, top: 560, zIndex: 9, transform: 'scale(0.55)'}}><Coracao n={2} s={250} f={f} /></div></Sala></Cam>, h: hud};
};

// ---------- D2: conversa não é prova ----------
const D2: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.07), c1 = sk(X, X.c, 1, 0.24), c2 = sk(X, X.c, 2, 0.6);
  const gp = c2.at - c1.end, a = c1.end;
  const ch = D.primeiro('S', (e) => e.tipo === 'chamada' && e.cor === 'Vermelho'), dep = D.primeiro('S', (e) => e.tipo === 'depoimento' && e.cor === 'Vermelho');
  const ob = D.primeiro('S', (e) => e.tipo === 'defesa' && e.acao === 'objecao' && e.i > (dep?.i ?? 0));
  const pen = D.penal('S')[1];
  const lit = (ob?.declaracao ?? 3) - 1;
  const farol = {rod: 'S', passos: passos(D.pac('S', 34 + 1), [c2.end + 6, D.pac('S', pen?.i ?? 47)]), placa: pen ? {txt: pen.fala ?? '', at: c2.end + 6} : undefined};
  const hud = <Hud f={f} rod="S" dia={2} farol={farol} />;
  if (f < c2.at - 6) return {m: <Cam f={f} k={[[0, 700, 520, 1.1], [c1.end, 600, 520, 1.15], [a + gp * 0.15, 1100, 520, 1.02], [c2.at, 1150, 500, 1.06]]}><Sala plano="banco" f={f} quem={{testemunha: {cor: 'Vermelho', humor: f < c1.end ? 'bravo' : 'cinico', fala: f > a && f < a + gp * 0.4}}}>
    <div style={{position: 'absolute', left: 900, top: 40, zIndex: 11, opacity: janela(f, 0, c0.at + 30, 8)}}><Rot fs={44} bg={LUZ}>{(ch?.fala ?? 'Testemunha: Rubi').toUpperCase()}</Rot></div>
    {f >= a ? <div style={{position: 'absolute', left: 860, top: 110, zIndex: 10}}><Placa cor="Vermelho" decl={dep?.declaracoes ?? []} lit={f >= a + gp * 0.12 ? lit : null} f={f} w={1020} max={105} entra={a} /></div> : null}
    {f >= a + gp * 0.28 ? <div style={{position: 'absolute', left: 40, top: 690, zIndex: 20, transform: `scale(${0.72 * pop(f, a + gp * 0.28)})`, transformOrigin: '0 0'}}><Versoes f={f} marcas={marcasPara('D2', [a + gp * 0.32, a + gp * 0.38])} w={1100} /></div> : null}
    <div style={{position: 'absolute', left: 120, top: 180, zIndex: 30}}><Bandeira t={f - (a + gp * 0.6)} ficha={D.ficha(ob?.prova ?? 'E5')} /></div>
  </Sala></Cam>, h: hud};
  if (f < c2.end + 24) return {m: <Cam f={f} k={[[c2.at - 6, 960, 450, 1], [c2.end, 960, 400, 1.1]]}><Sala plano="juiz" f={f} quem={{juiz: {cor: 'Roxo', fala: fala(X, 2), gesto: ease(f, c2.end - 20, c2.end)}}} /></Cam>, h: hud};
  const b = c2.end + 24, conf = D.frase('S', 17, 'peguei dois');
  const itens = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', ...D.novas('S', 1).map((e) => e.prova ?? '')].map((id) => D.ficha(id));
  return {m: <Liso f={f}>
    <div style={{position: 'absolute', left: 80, top: 120, transform: 'scale(0.82)', transformOrigin: '0 0'}}><Registro f={f} itens={itens} w={1000} cols={4} folheia={b + 6} foraDosAutos={b + 40} /></div>
    <div style={{position: 'absolute', left: 1020, top: 260}}><Recorte cor="Vermelho" txt={conf} rod="S" dia={1} ref="S#17" t={f - b - 20} carimbo={40} w={820} /></div>
  </Liso>, h: hud};
};

// ---------- D3: meu anel não tem círculo ----------
const D3: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.23), c1 = sk(X, X.c, 1, 0.35), c2 = sk(X, X.c, 2, 0.6), c3 = sk(X, X.c, 3, 0.69);
  const nAlto = D.conta('S', (e) => e.dia === 2 && e.acao === 'pressionar');
  const fa = c0.at * 0.34, fb = c0.at - 6, dedo = palT(X, 2, 'anelar'), anelMesa = c3.end + 6;
  const hud = <><Hud f={f} rod="S" dia={2} farol={{rod: 'S', passos: passos(D.pac('S', 47))}} /><Estreia titulo="ALTO LÁ!" sub="PEDIR DETALHE · NÃO GASTA PACIÊNCIA" t={f} dur={fa} /><Flamulas f={f} a={fa} b={fb} n={nAlto} /></>;
  if (f >= c2.at - 8 && f < c3.at) return {m: <Liso f={f}><div style={{position: 'absolute', left: 620, top: 90}}><Mao s={620} f={f} dedo={0} tag="GUARDA ESSE DEDO: ANELAR" tagT={f - dedo} /></div><div style={{position: 'absolute', left: 120, top: 200}}><Retrato cor="Vermelho" rod="S" s={300} f={f} humor="cinico" fala={fala(X, 2)} /></div></Liso>, h: hud};
  const ring = f >= anelMesa, sob = ease(f, anelMesa + 50, anelMesa + 80);
  return {m: <Cam f={f} k={[[0, 960, 540, 1], [c0.at, 1300, 500, 1.08], [c1.end, 900, 520, 1.02], [c3.at, 1500, 520, 1.1], [anelMesa + 10, 1520, 880, 2.1], [X.dur, 1520, 880, 2.25]]}>
    <Sala plano="tribuna" f={f} quem={{advogada: {cor: 'Azul', gesto: janela(f, fa, fb, 10)}, re: {cor: 'Rosa', cadeados: 2}, acusado: {cor: 'Vermelho', humor: 'cinico', fala: fala(X, 0, 1, 3), semAnel: ring}}} rod="S">
      <div style={{position: 'absolute', left: 860, top: 380, zIndex: 1, opacity: ease(f, c1.end, c1.end + 14)}}><Pedra cor="Ciano" s={220} f={f} rod="S" /><div style={{textAlign: 'center', marginTop: -6}}><Rot fs={24} bg={LUZ}>DELEGADO TURQUESA · NÃO FALA</Rot></div></div>
      {ring ? <div style={{position: 'absolute', left: 1440, top: 800, zIndex: 20, transform: `scale(${quique(f, anelMesa, 14) * 0.9})`}}><Anel s={170} f={f} />{sob > 0 ? <div style={{position: 'absolute', left: -24, top: -24, opacity: sob, filter: `drop-shadow(0 0 12px ${LUZ})`}}><Piso s={218} cor={LUZ} w={5} /></div> : null}</div> : null}
      {sob > 0.8 ? <div style={{position: 'absolute', left: 1390, top: 990, zIndex: 21, transform: `scale(${pop(f, anelMesa + 76) * 0.5})`, transformOrigin: '0 0'}}><Rot fs={40} bg={LUZ}>O ARO É O CÍRCULO</Rot></div> : null}
    </Sala>
  </Cam>, h: hud};
};

// ---------- D4: adiado (e a mesa da defesa gira como um leme) ----------
const D4: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.1), s0 = sk(X, X.s, 0, 0.78);
  const adi = D.primeiro('S', (e) => e.tipo === 'adiado'), gp = s0.at - c0.end, painel = c0.end + 6, leme = c0.end + gp * 0.62, para = c0.end + gp * 0.86;
  const obj = D.conta('S', (e) => e.dia === 2 && e.acao === 'objecao'), ok = D.conta('S', (e) => e.dia === 2 && e.tipo === 'juiz' && e.decisao === 'procede'), alto = D.conta('S', (e) => e.dia === 2 && e.acao === 'pressionar');
  if (f < c0.at) return {m: <Sala plano="juiz" f={f} quem={{juiz: {cor: 'Roxo', gesto: ease(f, 0, 14)}}}><div style={{position: 'absolute', left: 560, top: 300, zIndex: 20, transform: `scale(${pop(f, 6) * 1.3})`}}><PlacaJogo txt={adi?.fala ?? ''} fs={34} /></div></Sala>, h: <Hud f={f} rod="S" dia={2} />};
  if (f < painel) return {m: <Sala plano="tribuna" f={f} quem={{advogada: {cor: 'Azul', humor: 'triste'}, assistente: {cor: 'Verde', humor: 'feliz', dy: -Math.abs(Math.sin(f * 0.35)) * 60, gesto: 1}, re: {cor: 'Rosa', cadeados: 2}}} rod="S" />, h: <Hud f={f} rod="S" dia={2} />};
  if (f < leme) {
    const e = estado(f, passos(D.pac('S', 61)));
    return {m: <Liso f={f}>
      <div style={{position: 'absolute', left: 140, top: 150}}><FarolPac rod="S" n={e.n} s={300} f={f} rot="RODADA DA SAFIRA · FIM DO DIA 2" /></div>
      <div style={{position: 'absolute', left: 720, top: 170, display: 'flex', flexDirection: 'column', gap: 30}}>
        {[[`${ok} DE ${obj}`, 'OBJEÇÕES ACEITAS'], [`×${alto}`, 'ALTO LÁ'], ['0', 'CONFISSÕES']].map(([n, t], i) => <div key={t} style={{display: 'flex', alignItems: 'center', gap: 26, opacity: ease(f, painel + i * 14, painel + i * 14 + 8), transform: `translateX(${(1 - ease(f, painel + i * 14, painel + i * 14 + 10)) * 300}px)`}}><div style={{fontFamily: BANG, fontSize: 150, lineHeight: 1, color: n === '0' ? '#9aa1ab' : '#fff', ...C(9), minWidth: 360, textAlign: 'right'}}>{n}</div><Rot fs={48}>{t}</Rot></div>)}
      </div>
    </Liso>, h: <Hud f={f} rod="S" dia={2} />};
  }
  const rot = f < para ? (f - leme) ** 1.6 * 2 : (para - leme) ** 1.6 * 2 + (1 - Math.exp(-(f - para) / 8)) * 30;
  const nova = f >= para;
  return {m: <AbsoluteFill style={{background: '#24140b'}}>
    <Sala plano="tribuna" f={f} quem={nova ? {advogada: {cor: 'Verde', gesto: 0.6, humor: 'feliz'}, re: {cor: 'Rosa', cadeados: 2}} : {advogada: {cor: 'Azul'}, assistente: {cor: 'Verde'}, re: {cor: 'Rosa', cadeados: 2}}} rod={nova ? 'J' : 'S'} />
    <div style={{position: 'absolute', left: 120, top: 120, opacity: 1 - ease(f, para + 4, para + 20), transform: `scale(${1 + 0.1 * (1 - ease(f, para, para + 20))})`}}><Leme s={840} rot={rot} /></div>
    {nova ? <div style={{position: 'absolute', left: 560, top: 140, transform: `scale(${pop(f, para + 10)})`}}><Rot fs={54} bg={COR.Verde} cor="#fff">RODADA 2 · ADVOGADA JADE · {D.modelo('Verde')}</Rot></div> : null}
  </AbsoluteFill>, h: <Hud f={f} rod={nova ? 'J' : 'S'} dia={nova ? 1 : 2} />};
};

// ---------- E1: troca de cadeira ----------
const E1: CenaFn = (X) => {
  const {f, t0, D} = X, c0 = sk(X, X.c, 0, 0.23), c1 = sk(X, X.c, 1, 0.62), mesa = c0.end + 8;
  const conv = D.primeiro('J', (e) => e.tipo === 'conversar' && e.pessoa === 'Amarelo');
  const dois = {S: passos(D.pac('S', 61)), J: passos(6), rot: undefined, de: t0 + 10};
  if (f < mesa) {
    const G = c0.at - t0;
    const elenco: [string, string, number, number][] = [['Verde', 'ADVOGADA', 200, t0 + G * 0.1], ['Ciano', 'ASSISTENTE', 760, t0 + G * 0.35], ['Azul', 'DELEGADA (NÃO FALA)', 1320, t0 + G * 0.6]];
    return {m: <Liso f={f}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center'}}><Rot fs={46} bg={LUZ}>RODADA DA JADE · MESMO CASO, MESMO RUBI, TUDO DO ZERO</Rot></div>
      {elenco.map(([cor, rot, x, at]) => <div key={cor} style={{position: 'absolute', left: x, top: 380, opacity: ease(f, at, at + 10) * (cor === 'Azul' ? 0.75 : 1), transform: `translateY(${(1 - quique(f, at, 14)) * 120}px) scale(${cor === 'Ciano' && f >= c0.at ? 1.12 : 1})`}}><Retrato cor={cor} rod="J" s={300} f={f} modelo={D.modelo(cor)} rot={`${rot} · RODADA DA JADE`} fala={cor === 'Ciano' && fala(X, 0)} /></div>)}
    </Liso>, h: <Hud f={f} rod="J" dia={1} aparece={t0} dois={dois} />};
  }
  return {m: <Cam f={f} k={[[mesa, 960, 540, 1], [c1.at, 1300, 520, 1.1], [X.dur, 1450, 480, 1.18]]}><Mesa f={f} rod="J" lugar="corredor" tv esq={{cor: 'Verde', gesto: 0.4, fala: f >= mesa && f < c1.at}} dir={{cor: 'Amarelo', fala: fala(X, 1, 2), humor: 'feliz'}} /></Cam>, h: <Hud f={f} rod="J" dia={1} acao={conv ? D.acao('J', conv.i) : null} farol={{rod: 'J', passos: passos(6)}} />};
};

// ---------- E2: o cadeado do vigia ----------
const E2: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.38);
  const ap = D.primeiro('J', (e) => e.tipo === 'apresentar' && e.pessoa === 'Amarelo'), cq = D.primeiro('J', (e) => e.tipo === 'cadeado_quebrado');
  const apS = D.primeiro('S', (e) => e.tipo === 'apresentar' && e.pessoa === 'Amarelo'), cqS = D.primeiro('S', (e) => e.tipo === 'cadeado_quebrado');
  const est = c0.at * 0.32, a1 = c0.at * 0.5, ab = c0.at * 0.8, r2 = c0.at * 0.9, cmp = c0.end + 8;
  const rel = D.ficha(D.cadeados.vigia?.revela?.id ?? 'R2');
  return {m: <Cam f={f} k={[[0, 960, 540, 1], [a1, 1200, 500, 1.1], [c0.at, 1250, 520, 1.12], [c0.end, 960, 540, 1]]}>
    <Mesa f={f} rod="J" lugar="corredor" esq={{cor: 'Verde', gesto: janela(f, a1 - 10, a1 + 30, 8), humor: f > ab ? 'feliz' : 'normal'}} dir={{cor: 'Amarelo', cadeados: f < ab ? 1 : 0, fala: fala(X, 0), humor: 'triste'}}>
      <div style={{position: 'absolute', left: 760, top: 560, zIndex: 8, opacity: ease(f, a1, a1 + 10)}}><Ficha id="E3" nome={D.ficha('E3').nome} w={290} brilho f={f} /></div>
      <div style={{position: 'absolute', left: 1500, top: 120, zIndex: 9}}><Cadeado s={150} f={f} estado={f < ab ? 'fechado' : 'aberto'} t={f - ab} /></div>
      {f >= ab ? <div style={{position: 'absolute', left: 1210, top: 120, zIndex: 10, transform: `scale(${pop(f, ab + 4)})`}}><PlacaJogo txt={cq?.fala ?? ''} /></div> : null}
      {f >= r2 ? <div style={{position: 'absolute', left: 700, top: 200, zIndex: 10, transform: `scale(${pop(f, r2)}) rotate(-3deg)`}}><Ficha id={rel.id} nome={rel.nome} w={300} brilho f={f} tag="NOVA PROVA" /></div> : null}
      {f >= cmp ? <div style={{position: 'absolute', left: 360, top: 120, zIndex: 12, display: 'flex', flexDirection: 'column', gap: 16, transform: `scale(${pop(f, cmp)})`}}>
        <Rot fs={40} bg={COR.Verde} cor="#fff">JADE · DIA {cq?.dia} · AÇÃO {ap ? D.acao('J', ap.i) : '?'}</Rot>
        <Rot fs={40} bg={COR.Azul} cor="#fff">SAFIRA · DIA {cqS?.dia} · AÇÃO {apS ? D.acao('S', apS.i) : '?'}</Rot>
      </div> : null}
    </Mesa>
  </Cam>, h: <><Hud f={f} rod="J" dia={1} acao={ap ? D.acao('J', ap.i) : null} farol={{rod: 'J', passos: passos(6)}} /><Estreia titulo="CADEADO DE SEGREDO" sub="NEGA ATÉ VER A PROVA CERTA · ABRIU, VIRA PROVA" t={f} dur={est} /></>};
};

// ---------- E3: a senhora Topázio ----------
const E3: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.16), c2 = sk(X, X.c, 2, 0.6);
  const ap = D.primeiro('J', (e) => e.tipo === 'apresentar' && e.pessoa === 'Vermelho'), a1 = c0.at * 0.4, radio = palT(X, 2, 'rádio'), pv = c2.end - 10;
  return {m: <Cam f={f} k={[[0, 960, 540, 1], [c0.at, 700, 520, 1.08], [c0.end, 1300, 500, 1.1], [c2.end, 1200, 480, 1.04]]}>
    <Mesa f={f} rod="J" esq={{cor: 'Verde', gesto: janela(f, a1 - 10, a1 + 30, 8), fala: fala(X, 0)}} dir={{cor: 'Vermelho', humor: fala(X, 1) ? 'bravo' : 'cinico', fala: fala(X, 2)}}>
      <div style={{position: 'absolute', left: 760, top: 560, zIndex: 8, opacity: ease(f, a1, a1 + 10), transform: `translateX(${(1 - ease(f, a1, a1 + 16)) * -400}px)`}}><Ficha id="E2" nome={D.ficha('E2').nome} w={290} f={f} /></div>
      {f >= radio ? <div style={{position: 'absolute', left: 1180, top: 260, zIndex: 9, transform: `scale(${pop(f, radio)}) rotate(-6deg)`}}><Radio s={240} f={f} /><div style={{marginTop: -20}}><Carimbo txt="INVENTADO NA HORA" tipo="recusada" t={f - radio - 10} fs={46} /></div></div> : null}
      {f >= pv ? <div style={{position: 'absolute', left: 260, top: 30, zIndex: 20, transform: `scale(${0.9 * pop(f, pv)})`, transformOrigin: '50% 0%'}}><Versoes f={f} marcas={marcasPara('E3', [pv + 12])} w={1300} /></div> : null}
    </Mesa>
  </Cam>, h: <Hud f={f} rod="J" dia={1} acao={ap ? D.acao('J', ap.i) : null} farol={{rod: 'J', passos: passos(6)}} />};
};

// ---------- E4: só a tempestade (o cais) ----------
const E4: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.28), c1 = sk(X, X.c, 1, 0.36), c2 = sk(X, X.c, 2, 0.58);
  const cv = D.evs('J').filter((e) => e.tipo === 'conversar' && e.pessoa === 'Lima' && e.dia === 1);
  const t1 = palT(X, 0, 'tempestade'), t4 = palT(X, 2, 'tempestade');
  const n = f < t1 ? 0 : f < t4 ? 1 : 4, tn = f - (n === 4 ? t4 : t1);
  const acao = cv.length ? D.acao('J', (f < c1.end + (c2.at - c1.end) * 0.4 ? cv[0] : cv[cv.length - 1]).i) : null;
  return {m: <Cam f={f} k={[[0, 1300, 520, 1.12], [c0.at, 1200, 520, 1.06], [c2.at, 1300, 500, 1.12], [X.dur, 960, 480, 1.02]]}>
    <Mesa f={f} rod="J" lugar="cais" esq={{cor: 'Verde', gesto: 0.3}} dir={{cor: 'Lima', cadeados: 2, fala: fala(X, 0, 1, 2), humor: 'triste', olhar: [0.4, -0.6]}}>
      <div style={{position: 'absolute', left: 560, top: 50, width: 820, height: 440, overflow: 'hidden', border: `6px solid ${TINTA}`, borderRadius: 12, opacity: 0.25 + 0.55 * ease(f, c2.end, c2.end + 20), zIndex: 2}}><div style={{transform: 'scale(0.43)', transformOrigin: '0 0', width: 1920, height: 1080, position: 'relative'}}><Gravura f={f} k={{luz: 0, rubi: 1, tranca: 1, anel: 0.6 + 0.4 * Math.sin(f * 0.3), relogio: '22:50'}} /></div><div style={{position: 'absolute', left: 14, top: 12}}><TagSo txt="O QUE ELE VIU" fs={28} /></div></div>
      <div style={{position: 'absolute', left: 1500, top: 30, zIndex: 9, opacity: n ? 1 : 0}}><AncoraConta n={n} t={tn} s={170} f={f} /></div>
      <div style={{position: 'absolute', left: 1360, top: 820, zIndex: 9, opacity: janela(f, c0.at * 0.3, c0.at + 10, 10)}}><Rot fs={30} bg={LUZ}>PERIDOTO · {D.modelo('Lima')} · VIU TUDO</Rot></div>
    </Mesa>
  </Cam>, h: <Hud f={f} rod="J" dia={1} acao={acao} farol={{rod: 'J', passos: passos(6)}} />};
};

// ---------- F1: toma essa (cedo demais) ----------
const F1: CenaFn = (X) => {
  const {f, t0, D} = X, c0 = sk(X, X.c, 0, 0.27), c1 = sk(X, X.c, 1, 0.36), c2 = sk(X, X.c, 2, 0.43), c3 = sk(X, X.c, 3, 0.61);
  const pen = D.penal('J')[0], est = t0 + (c0.at - t0) * 0.5;
  const dep = D.primeiro('J', (e) => (e.tipo === 'depoimento' || e.tipo === 'revisao') && e.cor === 'Amarelo');
  const farol = {rod: 'J', passos: passos(6, [c3.end + 6, D.pac('J', pen?.i ?? 39)]), placa: pen ? {txt: pen.fala ?? '', at: c3.end + 6} : undefined};
  const hud = <><Hud f={f} rod="J" dia={2} aparece={t0} farol={farol} dois={f > c3.end + 40 ? {S: passos(D.pac('S', 61)), J: passos(D.pac('J', pen?.i ?? 39)), rot: 'MESMO PONTO', de: c3.end + 40} : null} /><Estreia titulo="TOMA ESSA!" sub="ACUSAR ALGUÉM · SE ERRAR, APAGA 2" t={f - t0} dur={est - t0} /></>;
  if (f < c0.at - 20) return {m: <Cam f={f} k={[[est, 1200, 520, 1.02], [c0.at, 1300, 500, 1.08]]}><Sala plano="banco" f={f} rod="J" quem={{testemunha: {cor: 'Amarelo', humor: 'triste', fala: true}}}><div style={{position: 'absolute', left: 880, top: 120, zIndex: 10}}><Placa cor="Amarelo" decl={dep?.declaracoes ?? []} f={f} w={1000} max={110} entra={est} /></div></Sala></Cam>, h: hud};
  if (f < c3.at - 6) return {m: <Cam f={f} k={[[c0.at - 20, 700, 520, 1.05], [c1.at, 960, 540, 1], [c2.at, 1500, 520, 1.12]]}><Sala plano="tribuna" f={f} rod="J" quem={{advogada: {cor: 'Verde', gesto: ease(f, c0.at, c0.at + 20), fala: fala(X, 0, 1), humor: 'bravo'}, re: {cor: 'Rosa', cadeados: 2}, assistente: {cor: 'Ciano'}, acusado: {cor: 'Vermelho', fala: fala(X, 2), humor: 'normal'}}}><Arpao t={f - (c1.at - 22)} alvoX={1400} y={860} /></Sala></Cam>, h: hud};
  return {m: <Cam f={f} k={[[c3.at, 960, 430, 1], [c3.end, 960, 400, 1.12], [X.dur, 960, 420, 1.06]]}><Sala plano="juiz" f={f} rod="J" quem={{juiz: {cor: 'Roxo', fala: fala(X, 3), gesto: ease(f, c3.end - 20, c3.end)}}}>{f > c3.end + 40 ? <div style={{position: 'absolute', left: 120, top: 620, zIndex: 10, transform: `scale(${pop(f, c3.end + 40)}) rotate(-3deg)`}}><Rot fs={40} bg={LUZ}>O JUIZ PEDIU: EXAME DE SANGUE · GUARDA ISSO</Rot></div> : null}</Sala></Cam>, h: hud};
};

// ---------- F2: o garçom que não existia ----------
const F2: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.24), c1 = sk(X, X.c, 1, 0.48), c2 = sk(X, X.c, 2, 0.82);
  const ch = D.evs('J').find((e) => e.tipo === 'chamada' && e.cor === 'Vermelho' && e.dia === 2), fim = D.primeiro('J', (e) => e.tipo === 'adiado');
  const nAlto = D.conta('J', (e) => e.acao === 'pressionar' && e.i > (ch?.i ?? 0) && e.i < (fim?.i ?? 999));
  const dep = D.primeiro('J', (e) => e.tipo === 'depoimento' && e.cor === 'Vermelho');
  const nilo = palT(X, 1, 'Nilo'), bolso = c1.end + (c2.at - c1.end) * 0.45, pv = c1.end + 10;
  return {m: <Cam f={f} k={[[0, 960, 540, 1], [c0.at, 640, 520, 1.15], [c1.at, 700, 540, 1.05], [bolso - 10, 560, 760, 1.6], [c2.at, 600, 600, 1.2]]}>
    <Sala plano="banco" f={f} rod="J" quem={{testemunha: {cor: 'Vermelho', humor: fala(X, 0) ? 'bravo' : 'cinico', fala: fala(X, 1, 2), maoBolso: f >= bolso}}}>
      <div style={{position: 'absolute', left: 900, top: 120, zIndex: 10, opacity: 1 - ease(f, pv, pv + 10)}}><Placa cor="Vermelho" decl={dep?.declaracoes ?? []} f={f} w={1000} max={100} /></div>
      {f >= nilo - 4 ? <div style={{position: 'absolute', left: 560, top: 200, zIndex: 8}}><Garcom s={280} f={f} k={ease(f, nilo - 4, nilo + 30)} /><div style={{marginTop: -30, transform: `scale(${pop(f, nilo + 24)}) rotate(-3deg)`}}><TagSo txt="NILO BRANDÃO · NÃO EXISTE NO CASO" fs={28} /></div></div> : null}
      {f >= pv ? <div style={{position: 'absolute', left: 900, top: 90, zIndex: 11, transform: `scale(${0.78 * pop(f, pv)})`, transformOrigin: '0 0'}}><Versoes f={f} marcas={marcasPara('F2', [pv + 14, pv + 24])} w={1230} /></div> : null}
      {f >= bolso ? <div style={{position: 'absolute', left: 140, top: 640, zIndex: 12, transform: `scale(${pop(f, bolso + 6)})`}}><Rot fs={34} bg={LUZ}>A MÃO DIREITA FOI PRO BOLSO</Rot></div> : null}
    </Sala>
  </Cam>, h: <><Hud f={f} rod="J" dia={2} farol={{rod: 'J', passos: passos(D.pac('J', 39))}} /><Flamulas f={f} a={4} b={c0.at * 0.78} n={nAlto} /></>};
};

// ---------- F3: ela não estava lá ----------
const F3: CenaFn = (X) => {
  const {f, D} = X, c0 = sk(X, X.c, 0, 0.14), c1 = sk(X, X.c, 1, 0.54), s0 = sk(X, X.s, 0, 0.8);
  const adi = D.primeiro('J', (e) => e.tipo === 'adiado'), gp = c1.at - c0.end, desce = c0.at + c0.dur * 0.55, ad = c0.end + gp * 0.55;
  const T = (h: string) => desce + 4 + (h === '22:28' ? 0 : 1e9) + (HORA_FR[h] ?? 0) * 0;
  const caca = ease(f, c1.at, c1.end + 30);
  return {m: <Cam f={f} k={[[0, 1300, 560, 1.1], [c0.end, 960, 540, 1], [c1.at, 1300, 600, 1.08]]}>
    <Sala plano="geral" f={f} rod="J" quem={{juiz: {cor: 'Roxo'}, testemunha: {cor: 'Vermelho', humor: 'cinico'}, advogada: {cor: 'Verde', fala: fala(X, 0), gesto: 0.8, olhar: [-1, 0]}, re: {cor: 'Rosa', cadeados: 2, humor: 'triste'}, promotor: {cor: 'Laranja'}, assistente: f < c1.at ? {cor: 'Ciano'} : undefined}}>
      {f >= desce && f < ad ? <div style={{position: 'absolute', left: 260, top: -40 + ease(f, desce, desce + 20) * 120, width: 1400, height: 790, zIndex: 30, border: `8px solid ${LATAO}`, borderRadius: 16, overflow: 'hidden', boxShadow: sombra}}><div style={{transform: 'scale(0.73)', transformOrigin: '0 0', width: 1920, height: 1080, position: 'relative'}}><Noite f={f} T={T} so={['22:28']} texto={false} /></div><div style={{position: 'absolute', left: 20, top: 16}}><TagSo txt="SÓ VOCÊ VÊ: ÀS 22:28 ELA ESTAVA LÁ, AJOELHADA" fs={30} /></div></div> : null}
      {f >= ad && f < c1.at + 20 ? <div style={{position: 'absolute', left: 560, top: 300, zIndex: 30, transform: `scale(${pop(f, ad) * 1.25})`}}><PlacaJogo txt={adi?.fala ?? ''} fs={32} /></div> : null}
      {f >= c1.at ? <><div style={{position: 'absolute', left: g(1100, 1640, caca), top: 560, zIndex: 25}}><Pedra cor="Ciano" s={220} f={f} rod="J" fala={fala(X, 1)} humor="feliz" olhar={[1, 0]} /></div><div style={{position: 'absolute', left: g(1450, 1900, caca), top: 470, zIndex: 24}}><Garcom s={170} f={f} /></div></> : null}
    </Sala>
  </Cam>, h: <Hud f={f} rod="J" dia={2} farol={{rod: 'J', passos: passos(D.pac('J', 39))}} dois={f >= c1.end ? {S: passos(D.pac('S', 61)), J: passos(D.pac('J', 39)), rot: 'EMPATE', de: c1.end + 4} : null} />};
};

export const CENAS2: Record<string, CenaFn> = {D1, D2, D3, D4, E1, E2, E3, E4, F1, F2, F3};
export {Flamulas, fala};
