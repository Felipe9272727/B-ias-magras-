// Shorts "o pior colega de cozinha que já existiu" (1080×1920), no molde do ShortFrio: narração própria
// (scripts/short_oc.py) + as vozes dos chefs do vídeo longo, um personagem só (o Deep, DeepSeek), selos no ritmo da
// fala, pensamento secreto, efeito TRIGGERED nos xingamentos e a partida de verdade na vertical, com a câmera nele.
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {strokeText} from '../components/basics';
import {Legenda, naPalavra, Selo, Sfx} from '../amongus2/ShortFrio';
import type {LogOC} from './Cozinha';
import {COR_EMPRESA} from './Cozinha';
import {ChefSprite, geometria, posChef} from './Cozinha3D';
import {empresaDe, OCJogo, tempoEm} from './Cenas';

type Palavra = {w: string; s: number; e: number; chef?: string};
type Aud = {src: string; at: number; de: number; chef?: string};
type Bloco = {id: string; dur: number; audios: Aud[]; palavras: Palavra[]};
type Dados = {blocos: Bloco[]; logs: Record<string, LogOC>};

export const calcShortOC: CalculateMetadataFunction<{dados: Dados | null}> = async () => {
  const so = await (await fetch(staticFile('short_oc/short_oc.json'))).json();
  const tl = await (await fetch(staticFile('timeline_oc.json'))).json();
  const total = so.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0);
  return {durationInFrames: total, props: {dados: {blocos: so.blocos, logs: tl.data.logs}}};
};

const W = 1080;
const H = 1920;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
type Chave = {at: number; tick: number};

// quadro em que começa a fala do chef (n-ésima parte de áudio de chef do bloco)
const fala = (b: Bloco, n = 1) => b.audios.filter((a) => a.chef)[n - 1];
const fimFala = (b: Bloco, n = 1) => {
  const a = fala(b, n);
  const ws = b.palavras.filter((p) => p.chef === a?.chef && p.s >= (a?.at ?? 0));
  return ws.length ? ws[ws.length - 1].e : (a?.at ?? 0) + 60;
};

// a partida de verdade (OCJogo, 1920×1080) recortada na vertical com a câmera seguindo `foco` (chef ou casa do mapa)
const JogoV: React.FC<{d: Dados; log: string; cz: number; de: number; vel?: number; chaves?: Chave[]; foco: (f: number) => string | {x: number; y: number}; z?: number; congela?: number}> = ({d, log, cz, de, vel = 1, chaves = [], foco, z = 1.9, congela}) => {
  const frame = useCurrentFrame();
  const L = d.logs[log];
  const g = geometria(L.mapa, 1920, 1080, true);
  const alvo = (f: number) => {
    const t = Math.min(L.tiques.length - 0.001, congela ?? tempoEm(f, de, vel, chaves));
    const fo = foco(f);
    const p = typeof fo === 'string' ? posChef(L, cz, fo, t) : fo;
    return {x: g.cx(p.x), y: g.cy(p.y) - g.T * 0.6};
  };
  let x = 0, y = 0, n = 0;
  for (let k = Math.max(0, frame - 10); k <= frame; k++) {
    const a = alvo(k);
    x += a.x; y += a.y; n++;
  }
  x /= n; y /= n;
  const tx = Math.min(0, Math.max(W - 1920 * z, W / 2 - x * z));
  const ty = Math.min(0, Math.max(H - 1080 * z, H / 2 - y * z));
  return (
    <AbsoluteFill style={{background: '#0b1720', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${z})`}}>
        <OCJogo log={log} modo="um" cz={cz} de={de} vel={vel} perto={1} logs={d.logs} chaves={chaves} congela={congela} volume={0.8} />
      </div>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 50%, transparent 55%, rgba(0,0,0,.6) 100%)'}} />
    </AbsoluteFill>
  );
};

// TRIGGERED: vermelho, tremendo, faixa embaixo
const Trig: React.FC<{de: number; ate: number; children: React.ReactNode}> = ({de, ate, children}) => {
  const f = useCurrentFrame();
  const on = f >= de && f < ate;
  const r = (k: number) => (on ? (Math.sin(f * 12.9898 + k * 78.233) * 43758.5453) % 1 : 0);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: on ? `translate(${r(1) * 26}px, ${r(2) * 26}px) scale(1.06)` : undefined}}>{children}</AbsoluteFill>
      {on && (
        <>
          <AbsoluteFill style={{background: '#ff1a1a', mixBlendMode: 'multiply', opacity: 0.55}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: 1240 + r(3) * 14, height: 170, background: '#e01010', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '7px solid #000', borderBottom: '7px solid #000'}}>
            <span style={{fontFamily: 'Poppins, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 120, letterSpacing: 8, color: '#fff', textShadow: '6px 6px 0 #000', transform: `translate(${r(5) * 12}px, ${r(6) * 8}px)`}}>TRIGGERED</span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

// pensamento secreto de um chef, com a parte-chave em vermelho
const Pensamento: React.FC<{chef: string; texto: string; destaque: string; at: number; top?: number}> = ({chef, texto, destaque, at, top = 1330}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const k = spring({frame: f - at, fps, config: {damping: 13, stiffness: 220}});
  const e = empresaDe(chef);
  const partes = texto.split(new RegExp(`(${destaque})`, 'i'));
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top, transform: `translateY(${(1 - k) * 80}px)`, opacity: k}}>
      <div style={{background: '#fff', borderRadius: 26, border: `6px dashed ${COR_EMPRESA[e]}`, padding: '26px 30px 26px 170px', boxShadow: '0 16px 40px #000a', position: 'relative', minHeight: 150}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 160, height: 200}}><ChefSprite cor={COR_EMPRESA[e]} anim="parado" dir={0} x={84} y={180} k={0.55} frame={f} z={1} /></div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: COR_EMPRESA[e], letterSpacing: 2, marginBottom: 6}}>💭 PENSAMENTO SECRETO DO {chef.toUpperCase()} ({e.toUpperCase()})</div>
        <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 40, lineHeight: 1.2, color: '#111', fontStyle: 'italic'}}>
          “{partes.map((p, i) => (p.toLowerCase() === destaque.toLowerCase() ? <span key={i} style={{color: '#e8202a', fontWeight: 900, fontStyle: 'normal', fontSize: 46}}>{p.toUpperCase()}</span> : <span key={i}>{p}</span>))}”
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- blocos
type PB = {d: Dados; b: Bloco};
const narr = (b: Bloco) => b.palavras.filter((p) => !p.chef);

const Gancho: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${interpolate(f, [0, b.dur], [1.25, 1.05])})`}}>
        <JogoV d={d} log="coop1" cz={0} de={86.6} vel={0.7} foco={() => 'Deep'} />
      </AbsoluteFill>
      <Selo txt="DEEPSEEK" cor={COR_EMPRESA.DeepSeek} at={4} y={300} rot={-3} size={70} />
      <Selo txt="🍳 PIOR COLEGA" at={naPalavra(b, 'pior')} y={430} rot={3} size={76} />
      <Sfx src="bass-pulse" at={0} vol={0.7} />
    </AbsoluteFill>
  );
};

const Quem: React.FC<PB> = ({d, b}) => (
  <AbsoluteFill>
    <JogoV d={d} log="fase1" cz={0} de={0} vel={0.6} foco={() => ({x: 2.5, y: 1.5})} z={1.7} />
    <Selo txt="IA DA DEEPSEEK 🤖" cor={COR_EMPRESA.DeepSeek} at={naPalavra(b, 'DeepSeek')} y={300} rot={3} size={62} />
    <Selo txt="🍳 OVERCOOKED" cor="#e67e22" at={naPalavra(b, 'Overcooked')} y={420} rot={-3} size={62} />
    <Selo txt="+ OUTRO DEEPSEEK" cor="#1d3fb8" at={naPalavra(b, 'outro')} y={540} rot={2} size={62} />
    <Sfx src="pop" at={naPalavra(b, 'DeepSeek')} />
    <Sfx src="pop" at={naPalavra(b, 'Overcooked')} />
    <Sfx src="boing" at={naPalavra(b, 'outro')} vol={0.45} />
  </AbsoluteFill>
);

const Sopa: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const a = fala(b).at;
  const fim = fimFala(b);
  const tUma = naPalavra(b, 'uma', 1);
  // até a fala: a briga (t36→t40); na fala do Deep, o tique 40; depois, câmera na panela do fogão 1 e congela
  const chaves = [{at: a, tick: 40.05}, {at: fim + 4, tick: 40.9}];
  return (
    <AbsoluteFill>
      <JogoV d={d} log="fase1" cz={0} de={36.2} vel={1} chaves={chaves} congela={f > fim + 4 ? 40.9 : undefined}
        foco={(k) => (k < a ? 'Seek' : k <= fim + 4 ? 'Deep' : {x: 6, y: 0.4})} z={f > fim + 4 ? 2.4 : 1.9} />
      <Selo txt="⏱️ 30 SEGUNDOS DE BRIGA" at={naPalavra(b, 'trinta')} y={300} rot={-3} size={58} />
      {f > fim && <Selo txt="🧅 1 CEBOLA DE 3" cor="#b3131b" at={tUma} y={420} rot={3} size={74} />}
      {f > fim && <Selo txt="A SOPA NÃO EXISTIA" cor="#111" at={naPalavra(b, 'existia')} y={560} rot={-2} size={62} />}
      <Sfx src="record-scratch" at={fim + 2} vol={0.5} />
      <Sfx src="ba-dum-tss" at={naPalavra(b, 'existia') + 12} vol={0.5} />
    </AbsoluteFill>
  );
};

const Xinga: React.FC<PB> = ({d, b}) => {
  const a1 = fala(b, 1).at, f1 = fimFala(b, 1), a2 = fala(b, 2).at, f2 = fimFala(b, 2);
  const chaves = [{at: a1, tick: 73.05}, {at: f1, tick: 73.9}, {at: a2, tick: 74.05}, {at: f2, tick: 74.9}];
  return (
    <AbsoluteFill>
      <Trig de={a1} ate={f2 + 6}>
        <JogoV d={d} log="fase3" cz={0} de={72.4} vel={0.3} chaves={chaves} foco={(k) => (k < a2 ? 'Deep' : 'Seek')} />
      </Trig>
      <Selo txt="🤬 DEEPSEEK × DEEPSEEK" at={naPalavra(b, 'xingando')} y={300} rot={-3} size={58} />
      <Sfx src="bass-pulse" at={a1} vol={0.55} />
      <Sfx src="bass-pulse" at={a2} vol={0.55} />
      <Sfx src="censor-beep" at={f1 - 12} vol={0.35} />
    </AbsoluteFill>
  );
};

const Coop: React.FC<PB> = ({d, b}) => {
  const a = fala(b).at;
  const chaves = [{at: a, tick: 58.05}];
  return (
    <AbsoluteFill>
      <JogoV d={d} log="coop1" cz={0} de={52} vel={0.7} chaves={chaves} foco={(k) => (k < a ? 'Deep' : 'Claudinho')} z={1.7} />
      <Selo txt="4 IAs NA MESMA COZINHA" cor="#e67e22" at={naPalavra(b, 'coop')} y={300} rot={2} size={56} />
      <Selo txt="🚧 89× NO CAMINHO" at={naPalavra(b, 'oitenta')} y={420} rot={-3} size={76} />
      <Sfx src="pop" at={naPalavra(b, 'coop')} />
      <Sfx src="wrong-buzzer" at={naPalavra(b, 'oitenta')} vol={0.4} />
      <Pensamento chef="Claudinho" at={a - 6} texto="...o Deep tá enroscado perto da tábua e já me travou quatro vezes." destaque="já me travou quatro vezes" />
    </AbsoluteFill>
  );
};

const Fim: React.FC<PB> = ({d, b}) => {
  const a = fala(b).at;
  const fim = fimFala(b);
  const chaves = [{at: a, tick: 109.05}, {at: fim, tick: 109.9}];
  return (
    <AbsoluteFill>
      <JogoV d={d} log="coop1" cz={0} de={108.2} vel={0.3} chaves={chaves} foco={() => 'Deep'} />
      <Selo txt="FOI MAL 🙏" cor="#1f8f3a" at={naPalavra(b, 'Foi')} y={300} rot={3} size={76} />
      <Selo txt="🍳 PIOR COLEGA" at={naPalavra(b, 'pior')} y={430} rot={-3} size={76} />
      <Selo txt="QUE JÁ EXISTIU" cor="#111" at={naPalavra(b, 'existiu')} y={560} rot={2} size={62} />
      <Sfx src="sad-trombone" at={fim + 4} vol={0.35} />
    </AbsoluteFill>
  );
};

const BLOCOS: Record<string, React.FC<PB>> = {gancho: Gancho, quem: Quem, sopa: Sopa, xinga: Xinga, coop: Coop, fim: Fim};

export const ShortOC: React.FC<{dados: Dados | null}> = ({dados}) => {
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
            <Legenda palavras={narr(b)} y={1560} />
            {b.audios.map((a, i) => (
              <Sequence key={i} from={a.at}>
                <Audio src={staticFile(a.src)} startFrom={a.de} volume={a.chef ? 1 : 1} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}
      <Audio src={staticFile('music/fluffing-a-duck.mp3')} volume={0.08} />
    </AbsoluteFill>
  );
};
