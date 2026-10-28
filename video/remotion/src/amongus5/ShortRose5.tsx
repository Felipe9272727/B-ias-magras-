// Short do Among Us 5 (1080×1920): "a IA copiou a cara da outra... e matou a original" — o Banana (MiMo V2.6 Flash),
// Camuflador da última partida do vídeo (log 1). Molde dos Shorts do AU3/AU4 (ShortPalhaco/ShortPossuidor): a partida
// na vertical seguindo quem importa, selos no ritmo da fala, as falas e pensamentos das IAs em cartões, e as telas de
// votação/ejeção do vídeo no meio. Sem emoji (regra do canal): os ícones são desenhados.
// Narração em scripts/short_au5_rose.py (fatos conferidos em amongus/logs5/partida1.json).
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {Crewmate4} from '../amongus/Crewmate4';
import {Legenda, naPalavra, Selo, Sfx} from '../amongus2/ShortFrio';
import {EMPRESA, Mundo5, SonsJogo5} from './Jogo5';
import {Ejecao2, Fim2, Votacao} from './Telas5';
import {simular, type Partida2} from './sim5';

type Palavra = {w: string; s: number; e: number; chef?: string};
type Aud = {src: string; at: number; de: number; ate?: number; chef?: string; pensa?: boolean};
type Bloco = {id: string; dur: number; audios: Aud[]; palavras: Palavra[]};
type Skins = Record<string, {cabeca?: string; roupa?: string}>;
type Dados = {blocos: Bloco[]; p: Partida2; skins: Skins};

export const calcShortRose5: CalculateMetadataFunction<{dados: Dados | null}> = async () => {
  const so = await (await fetch(staticFile('short_au5/short_au5.json'))).json();
  const tl = await (await fetch(staticFile('timeline_au5.json'))).json();
  const total = so.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0);
  return {durationInFrames: total, props: {dados: {blocos: so.blocos, p: tl.data.partidas['4'], skins: tl.data.skins}}};
};

const W = 1080;
const H = 1920;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const MIMO = EMPRESA['MiMo V2.6 Flash']?.cor ?? '#ff6900';
const ROSA = '#ff6fa8';
const nb = (b: Bloco, w: string, n = 1) => naPalavra(b as never, w, n);
const fala = (b: Bloco, n = 1) => b.audios.filter((a) => a.chef)[n - 1];
const fimFala = (b: Bloco, n = 1) => { const a = fala(b, n); return a ? a.at + (a.ate ?? 120) : 0 };

// a partida na vertical seguindo `foco` (a câmera é a média de uns quadros, pra não tremer)
const JogoV: React.FC<{d: Dados; de: number; dur: number; foco: string; escala?: number}> = ({d, de, dur, foco, escala = 1.6}) => {
  const frame = useCurrentFrame();
  const s = simular(d.p);
  const f = de + frame;
  let cx = 0, cy = 0, n = 0;
  for (let k = 0; k < 8; k++) { const q = s.q(foco, f - k); if (q) { cx += q.x; cy += q.y; n++ } }
  if (!n) { const c = s.corpos(f).find((c) => c.cor === foco); cx = c?.x ?? 1500; cy = c?.y ?? 800; n = 1 }
  cx /= n; cy = cy / n - 40;
  const morte = s.eventos.find((e) => e.tipo === 'morte' && f >= e.quadro && f < e.quadro + 14 && Math.hypot(e.x - cx, e.y - cy) < 700);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Mundo5 p={d.p} s={s} f={f} frame={frame} cx={cx} cy={cy} escala={escala} w={W} h={H} skins={d.skins} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 62% 46% at 50% 50%, transparent 55%, rgba(0,0,0,.7) 100%)'}} />
      {morte && <AbsoluteFill style={{background: '#ff1e1e', opacity: interpolate(f - morte.quadro, [0, 3, 14], [0, 0.55, 0], cl)}} />}
      <SonsJogo5 s={s} de={de} dur={dur} foco={foco} />
    </AbsoluteFill>
  );
};

// uma tela 1920×1080 do vídeo encaixada no meio da vertical, com o fundo desfocado
const Tela: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: '#070b14'}}>
    <div style={{position: 'absolute', left: -420, top: 0, width: 1920, height: 1080, transform: 'scale(1.78)', transformOrigin: '50% 0', filter: 'blur(26px) brightness(0.45)'}}>{children}</div>
    <div style={{position: 'absolute', left: 0, top: 720, width: 1920, height: 1080, transform: 'scale(0.5625)', transformOrigin: '0 0', borderTop: '6px solid #fff3', borderBottom: '6px solid #fff3'}}>{children}</div>
  </AbsoluteFill>
);

const Etiqueta: React.FC<{cor: string}> = ({cor}) => {
  const j = {Banana: 'MiMo · CAMUFLADOR', Rose: 'MiMo · DOUTORA', Marrom: 'CHATO', Vermelho: 'CIENTISTA'}[cor] ?? '';
  return j ? <span style={{fontSize: 22, padding: '2px 10px', borderRadius: 8, color: '#fff', background: cor === 'Banana' || cor === 'Rose' ? MIMO : '#455a64', marginLeft: 8}}>{j}</span> : null;
};

// balão de fala (reunião) ou de pensamento (nuvem, com eco na voz) — o texto é o do log
const FalaCard: React.FC<{cor: string; texto: string; at: number; ate: number; top?: number; pensa?: boolean}> = ({cor, texto, at, ate, top = 300, pensa}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at || f > ate + 20) return null;
  const k = spring({frame: f - at, fps, config: {damping: 13, stiffness: 220}});
  const sai = interpolate(f, [ate, ate + 20], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top, opacity: k * sai, transform: `translateY(${(1 - k) * -60}px)`}}>
      <div style={{background: pensa ? '#efe9ff' : '#fff', borderRadius: pensa ? 60 : 26, border: `6px ${pensa ? 'dashed' : 'solid'} #000`, padding: '22px 30px 22px 150px', boxShadow: '0 14px 0 #0008', position: 'relative', minHeight: 130}}>
        <div style={{position: 'absolute', left: 22, top: 16}}><Crewmate4 cor={cor} size={104} /></div>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#000'}}>{cor}{pensa ? ' pensou' : ''}<Etiqueta cor={cor} /></div>
        <div style={{marginTop: 6, fontFamily: FONT.display, fontWeight: 700, fontStyle: pensa ? 'italic' : 'normal', fontSize: 38, lineHeight: 1.18, color: '#111'}}>“{texto}”</div>
      </div>
      {pensa && [0, 1].map((i) => <div key={i} style={{position: 'absolute', left: 70 + i * 34, bottom: -34 - i * 26, width: 34 - i * 12, height: 34 - i * 12, borderRadius: '50%', background: '#efe9ff', border: '5px solid #000'}} />)}
    </div>
  );
};

// selo com um tripulante desenhado do lado (no lugar de emoji)
const SeloCor: React.FC<{txt: string; cor: string; fundo?: string; at: number; y: number; rot?: number}> = ({txt, cor, fundo = '#111', at, y, rot = -3}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const k = spring({frame: f - at, fps, config: {damping: 9, stiffness: 260, mass: 0.6}});
  return (
    <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `rotate(${rot}deg) scale(${0.3 + 0.7 * k})`, opacity: Math.min(1, k * 2)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, background: fundo, border: '6px solid #fff', borderRadius: 20, padding: '8px 26px 8px 12px', boxShadow: '0 10px 0 #0009'}}>
        <Crewmate4 cor={cor} size={74} />
        <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 60, color: '#fff', letterSpacing: 1}}>{txt}</span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- blocos
type PB = {d: Dados; b: Bloco};
const sim = (d: Dados) => simular(d.p);
const tq = (d: Dados, t: number) => sim(d).inicioTique[t] ?? 0;
const quadroDe = (d: Dados, tipo: string, t: number, cor?: string) =>
  sim(d).eventos.find((e) => e.tipo === tipo && e.tique === t && (!cor || e.cor === cor || e.vitima === cor))?.quadro ?? tq(d, t);

const Gancho: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const tMata = nb(b, 'matar');
  // a morte cai no "acabou de" (as duas Roses lado a lado antes disso); câmera mais aberta pra ver a falsa chegando
  const tAcabou = nb(b, 'acabou');
  const morte = quadroDe(d, 'morte', 59, 'Rose');
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${interpolate(f, [0, b.dur], [1.2, 1.02])})`}}>
        <JogoV d={d} de={Math.max(0, morte - tAcabou)} dur={b.dur} foco="Rose" escala={1.6} />
      </AbsoluteFill>
      <SeloCor txt="ROSE" cor="Rose" fundo={ROSA} at={nb(b, 'Rose')} y={300} rot={-3} />
      <SeloCor txt="ROSE TAMBÉM" cor="Rose" fundo={ROSA} at={nb(b, 'também')} y={430} rot={3} />
      <Selo txt="UMA É FALSA" cor="#111" at={tMata} y={560} rot={-2} size={64} />
      <Sfx src="bass-pulse" at={0} vol={0.7} />
      <Sfx src="impact-epic" at={tMata} vol={0.5} />
    </AbsoluteFill>
  );
};

const Regra: React.FC<PB> = ({d, b}) => {
  const tCopia = nb(b, 'copia');
  const camu = quadroDe(d, 'camuflagem', 2, 'Banana');
  return (
    <AbsoluteFill>
      <JogoV d={d} de={Math.max(0, camu - tCopia)} dur={b.dur} foco="Banana" escala={2} />
      <SeloCor txt="BANANA" cor="Banana" fundo="#c9a400" at={nb(b, 'Banana')} y={300} rot={3} />
      <Selo txt="IA DA XIAOMI" cor={MIMO} at={nb(b, 'Xiaomi')} y={430} rot={-3} size={60} />
      <Selo txt="CAMUFLADOR" cor="#8e5cf7" at={nb(b, 'Camuflador')} y={550} rot={2} size={72} />
      <Selo txt="COPIA A CARA DE QUALQUER UM" cor="#111" at={tCopia} y={680} rot={-2} size={46} />
      <Sfx src="pop" at={nb(b, 'Banana')} />
      <Sfx src="glitch" at={tCopia} vol={0.5} />
    </AbsoluteFill>
  );
};

const Plano: React.FC<PB> = ({d, b}) => {
  const a = fala(b);
  return (
    <AbsoluteFill>
      <JogoV d={d} de={tq(d, 3)} dur={b.dur} foco="Banana" escala={1.9} />
      <SeloCor txt="VIROU O VERMELHO" cor="Vermelho" fundo="#c62828" at={nb(b, 'Vermelho')} y={300} rot={-3} />
      <FalaCard cor="Banana" pensa texto="Vou me camuflar agora enquanto ninguém vê, depois me mato alguém e as testemunhas acusam a cor errada." at={a.at} ate={fimFala(b)} top={1100} />
      <Sfx src="glitch" at={nb(b, 'Vermelho')} vol={0.4} />
    </AbsoluteFill>
  );
};

const Reuniao: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const tOnze = nb(b, 'Onze');
  const tExp = nb(b, 'expulso');
  const k = Math.max(0, f - tOnze);
  return (
    <AbsoluteFill>
      {f < tExp ? (
        <Tela><Votacao p={d.p} idx={0} fase={f >= tOnze ? 'votacao' : 'discussao'} votos={f >= tOnze ? Math.min(1, k / 30) : 0} chat={false} timer={f >= tOnze ? 0 : 45} /></Tela>
      ) : (
        <Sequence from={tExp} layout="none"><Ejecao2 p={d.p} idx={0} skins={d.skins} /></Sequence>
      )}
      <FalaCard cor="Marrom" texto="Eu tava em Admin fazendo tarefa e vi o Vermelho aparecer colado no corpo no t7." at={fala(b, 1).at} ate={fimFala(b, 1)} top={300} />
      <FalaCard cor="Banana" pensa texto="O Marrom viu eu (disfarçado de Vermelho) perto do corpo no t7." at={fala(b, 2).at} ate={fimFala(b, 2)} top={300} />
      {f > fimFala(b, 2) && <SeloCor txt="ERA O BANANA" cor="Banana" fundo="#c9a400" at={fimFala(b, 2)} y={300} rot={-3} />}
      <Selo txt="11 VOTOS" at={tOnze} y={430} rot={3} size={76} />
      <Selo txt="ERA INOCENTE" cor="#1f8f3a" at={nb(b, 'inocente')} y={1250} rot={-2} size={66} />
      <Sfx src="crowd-boo" at={tOnze} vol={0.3} />
      <Sfx src="sad-trombone" at={nb(b, 'inocente')} vol={0.35} />
    </AbsoluteFill>
  );
};

const Serie: React.FC<PB> = ({d, b}) => {
  const tMata = nb(b, 'mata');
  const morte = quadroDe(d, 'morte', 46, 'Ciano');
  return (
    <AbsoluteFill>
      <JogoV d={d} de={Math.max(0, morte - tMata)} dur={b.dur} foco="Ciano" escala={1.9} />
      <SeloCor txt="LIMA" cor="Lima" fundo="#5a8f1c" at={nb(b, 'Lima')} y={280} rot={-4} />
      <SeloCor txt="CIANO" cor="Ciano" fundo="#00838f" at={nb(b, 'Ciano')} y={400} rot={3} />
      <SeloCor txt="PRETO" cor="Preto" fundo="#263238" at={nb(b, 'Preto')} y={520} rot={-2} />
      <Selo txt="MATOU O CIANO" cor="#c62828" at={tMata} y={660} rot={2} size={66} />
      <Sfx src="glitch" at={nb(b, 'Lima')} vol={0.35} />
      <Sfx src="glitch" at={nb(b, 'Ciano')} vol={0.35} />
      <Sfx src="glitch" at={nb(b, 'Preto')} vol={0.35} />
    </AbsoluteFill>
  );
};

const Rose: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const tCopia = nb(b, 'copia');
  const tMata = nb(b, 'mata');
  const tMimo = nb(b, 'MiMo', 1);
  const camu = quadroDe(d, 'camuflagem', 57, 'Banana');
  const morte = quadroDe(d, 'morte', 59, 'Rose');
  const corte = Math.round((tCopia + tMata) / 2);
  return (
    <AbsoluteFill>
      {f < corte
        ? <JogoV d={d} de={Math.max(0, camu - tCopia)} dur={corte} foco="Banana" escala={2} />
        : <Sequence from={corte} layout="none"><JogoV d={d} de={Math.max(0, morte - (tMata - corte))} dur={b.dur - corte} foco="Rose" escala={2.1} /></Sequence>}
      <SeloCor txt="VIROU A ROSE" cor="Rose" fundo={ROSA} at={tCopia} y={300} rot={-3} />
      <Selo txt="SOZINHOS NA SEGURANÇA" cor="#111" at={nb(b, 'sozinho')} y={430} rot={2} size={50} />
      {f >= tMimo && (
        <div style={{position: 'absolute', top: 1060, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40, transform: `scale(${spring({frame: f - tMimo, fps: 30, config: {damping: 10, stiffness: 200}})})`}}>
          {['Banana', 'Rose'].map((c, i) => (
            <div key={c} style={{background: '#fff', border: '6px solid #000', borderRadius: 24, padding: '14px 22px', textAlign: 'center', boxShadow: '0 12px 0 #0009'}}>
              <Crewmate4 cor={c} size={150} morto={i === 1 && f >= tMata} />
              <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 34}}>{c}</div>
              <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: '#fff', background: MIMO, borderRadius: 8, padding: '2px 10px', marginTop: 4}}>MiMo V2.6 Flash</div>
            </div>
          ))}
        </div>
      )}
      <Selo txt="A MiMo MATOU A MiMo" cor={MIMO} at={nb(b, 'MiMo', 2)} y={1480} rot={-2} size={66} />
      <Sfx src="impact-epic" at={tMata} vol={0.5} />
      <Sfx src="record-scratch" at={nb(b, 'MiMo', 2)} vol={0.45} />
    </AbsoluteFill>
  );
};

const Fim: React.FC<PB> = ({d, b}) => (
  <AbsoluteFill>
    <Tela><Fim2 p={d.p} foco="Banana" skins={d.skins} /></Tela>
    <Selo txt="3 MORTES DISFARÇADO" cor="#c62828" at={nb(b, 'Três')} y={300} rot={-3} size={62} />
    <Selo txt="NINGUÉM DESCOBRIU" cor="#111" at={nb(b, 'descobriu')} y={430} rot={3} size={62} />
    <Selo txt="E PERDEU" cor="#1f6fd1" at={nb(b, 'perdeu')} y={1300} rot={-2} size={80} />
    <Selo txt="TAREFAS 100%" cor="#1f8f3a" at={nb(b, 'tarefas')} y={1440} rot={2} size={60} />
    <Sfx src="ba-dum-tss" at={nb(b, 'perdeu') + 6} vol={0.4} />
  </AbsoluteFill>
);

const BLOCOS: Record<string, React.FC<PB>> = {gancho: Gancho, regra: Regra, plano: Plano, reuniao: Reuniao, serie: Serie, rose: Rose, fim: Fim};

export const ShortRose5: React.FC<{dados: Dados | null}> = ({dados}) => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
  if (!dados) return <AbsoluteFill style={{background: '#000'}} />;
  let t = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {dados.blocos.map((b) => {
        const de = t;
        t += b.dur;
        const C = BLOCOS[b.id];
        return (
          <Sequence key={b.id} from={de} durationInFrames={b.dur} name={b.id}>
            {C && <C d={dados} b={b} />}
            <Legenda palavras={b.palavras.filter((p) => !p.chef)} y={1560} />
            {b.audios.map((a, i) => (
              <Sequence key={i} from={a.at} durationInFrames={a.ate ?? undefined}>
                <Audio src={staticFile(a.src)} startFrom={a.de} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      <Audio src={staticFile('music/sneaky-snitch.mp3')} volume={0.08} />
    </AbsoluteFill>
  );
};
