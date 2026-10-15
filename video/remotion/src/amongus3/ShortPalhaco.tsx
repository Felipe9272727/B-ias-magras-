// Short do Among Us 3 (1080×1920): "essa IA QUERIA ser expulsa" — o Roxo (Gemini), Palhaço da partida 2.
// Narração em scripts/short_au3.py (fatos conferidos em amongus/logs3/partida2.json); as falas são as vozes do vídeo
// longo. Molde dos Shorts que deram certo (ShortFrio): selos no ritmo da fala, pensamento secreto, a partida na
// vertical seguindo o Roxo, e as telas de reunião/votação/ejeção do vídeo encaixadas no meio da tela.
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {Crewmate} from '../amongus/Crewmate';
import {Legenda, naPalavra, Pensamento, Selo, Sfx} from '../amongus2/ShortFrio';
import {EMPRESA, Mundo, SonsJogo} from './Jogo';
import {Ejecao2, Votacao} from './Telas';
import {simular, type Partida2} from './sim';

type Palavra = {w: string; s: number; e: number; chef?: string};
type Aud = {src: string; at: number; de: number; ate?: number; chef?: string};
type Bloco = {id: string; dur: number; audios: Aud[]; palavras: Palavra[]};
type Dados = {blocos: Bloco[]; p: Partida2};

export const calcShortPalhaco: CalculateMetadataFunction<{dados: Dados | null}> = async () => {
  const so = await (await fetch(staticFile('short_au3/short_au3.json'))).json();
  const tl = await (await fetch(staticFile('timeline_au3.json'))).json();
  const total = so.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0);
  return {durationInFrames: total, props: {dados: {blocos: so.blocos, p: tl.data.partidas['2']}}};
};

const W = 1080;
const H = 1920;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const GEMINI = '#8e5cf7';
const nb = (b: Bloco, w: string, n = 1) => naPalavra(b as never, w, n);
const fala = (b: Bloco, n = 1) => b.audios.filter((a) => a.chef)[n - 1];

// a partida na vertical seguindo `foco`, a partir do quadro `de` da simulação
const JogoV: React.FC<{p: Partida2; de: number; dur: number; foco?: string; escala?: number}> = ({p, de, dur, foco = 'Roxo', escala = 1.6}) => {
  const frame = useCurrentFrame();
  const s = simular(p);
  const f = de + frame;
  let cx = 0, cy = 0, n = 0;
  for (let d = 0; d < 8; d++) {
    const q = s.q(foco, f - d);
    if (q) { cx += q.x; cy += q.y; n++ }
  }
  if (!n) { const c = s.corpos(f).find((c) => c.cor === foco); cx = c?.x ?? 1500; cy = c?.y ?? 800; n = 1 }
  cx /= n; cy = cy / n - 40;
  const morte = s.eventos.find((e) => (e.tipo === 'morte' || e.tipo === 'xerife') && f >= e.quadro && f < e.quadro + 14 && Math.hypot(e.x - cx, e.y - cy) < 700);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Mundo p={p} s={s} f={f} frame={frame} cx={cx} cy={cy} escala={escala} w={W} h={H} papeis />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 62% 46% at 50% 50%, transparent 55%, rgba(0,0,0,.7) 100%)'}} />
      {morte && <AbsoluteFill style={{background: '#ff1e1e', opacity: interpolate(f - morte.quadro, [0, 3, 14], [0, 0.55, 0], cl)}} />}
      <SonsJogo s={s} de={de} dur={dur} foco={foco} />
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

// balão de fala da reunião (a voz da IA está tocando)
const FalaCard: React.FC<{cor: string; texto: string; at: number; ate: number; top?: number}> = ({cor, texto, at, ate, top = 300}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at || f > ate + 20) return null;
  const k = spring({frame: f - at, fps, config: {damping: 13, stiffness: 220}});
  const sai = interpolate(f, [ate, ate + 20], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top, opacity: k * sai, transform: `translateY(${(1 - k) * -60}px)`}}>
      <div style={{background: '#fff', borderRadius: 26, border: '6px solid #000', padding: '22px 26px 22px 150px', boxShadow: '0 14px 0 #0008', position: 'relative', minHeight: 130}}>
        <div style={{position: 'absolute', left: 20, top: 16}}><Crewmate cor={cor} size={110} /></div>
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#000'}}>{cor} {cor === 'Roxo' && <span style={{fontSize: 22, padding: '2px 10px', borderRadius: 8, color: '#fff', background: EMPRESA['Gemini 3.8 Flash'].cor}}>Gemini · PALHAÇO 🤡</span>}</div>
        <div style={{marginTop: 6, fontFamily: FONT.display, fontWeight: 700, fontSize: 38, lineHeight: 1.18, color: '#111'}}>“{texto}”</div>
      </div>
    </div>
  );
};
const fimFala = (b: Bloco, n = 1) => { const a = fala(b, n); return a ? a.at + (a.ate ?? 120) : 0 };

// ---------------------------------------------------------------- blocos
type PB = {d: Dados; b: Bloco};
const tq = (d: Dados, t: number) => simular(d.p).inicioTique[t] ?? 0;

const Gancho: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${interpolate(f, [0, b.dur], [1.3, 1.06])})`}}>
        <JogoV p={d.p} de={tq(d, 19) + 20} dur={b.dur} escala={1.8} />
      </AbsoluteFill>
      <Selo txt="🤡 PALHAÇO" cor={GEMINI} at={6} y={300} rot={-3} size={76} />
      <Selo txt="QUERIA SER EXPULSO" at={nb(b, 'expulsa')} y={440} rot={3} size={64} />
      <Sfx src="bass-pulse" at={0} vol={0.7} />
    </AbsoluteFill>
  );
};

const Regra: React.FC<PB> = ({d, b}) => (
  <AbsoluteFill>
    <JogoV p={d.p} de={tq(d, 16)} dur={b.dur} />
    <Selo txt="IA DO GEMINI 🤖" cor={GEMINI} at={nb(b, 'Gemini')} y={300} rot={3} size={62} />
    <Selo txt="🤡 PALHAÇO" cor="#c0392b" at={nb(b, 'Palhaço')} y={420} rot={-3} size={66} />
    <Selo txt="EXPULSO = VITÓRIA 🏆" cor="#1f8f3a" at={nb(b, 'expulso')} y={545} rot={2} size={60} />
    <Sfx src="pop" at={nb(b, 'Gemini')} />
    <Sfx src="boing" at={nb(b, 'Palhaço')} vol={0.45} />
    <Sfx src="level-up" at={nb(b, 'expulso')} vol={0.4} />
  </AbsoluteFill>
);

const Botao: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const a = fala(b);
  const tNao = nb(b, 'Não');
  return (
    <AbsoluteFill>
      {f < a.at ? (
        <JogoV p={d.p} de={tq(d, 15) - 20} dur={b.dur} escala={1.7} />
      ) : (
        <Tela><Votacao p={d.p} idx={2} fase={f >= tNao ? 'resultado' : 'discussao'} chat={false} timer={f >= tNao ? 0 : 60} /></Tela>
      )}
      <Selo txt="🚨 BOTÃO DE EMERGÊNCIA" at={nb(b, 'botão')} y={300} rot={-3} size={56} />
      <FalaCard cor="Roxo" texto="Apertei porque o Vermelho tá claramente armando pra mim desde a rodada passada!" at={a.at} ate={fimFala(b)} top={430} />
      {f > fimFala(b) + 20 && <Selo txt="⏭️ 9 PULARAM" cor="#111" at={tNao} y={430} rot={3} size={70} />}
      <Sfx src="error-beep" at={tNao} vol={0.4} />
    </AbsoluteFill>
  );
};

const Scan: React.FC<PB> = ({d, b}) => (
  <AbsoluteFill>
    <JogoV p={d.p} de={tq(d, 17)} dur={b.dur} escala={1.9} />
    <Selo txt="❌ SCAN FALSO" at={nb(b, 'scan')} y={300} rot={-3} size={70} />
    <Selo txt="4×" cor="#111" at={nb(b, 'Quatro')} y={430} rot={4} size={90} />
    <Pensamento cor="Roxo" at={10} top={1180} texto="Vou fingir tarefa colado em Preto e Ciano para parecer que estou agindo estranho." destaque="agindo estranho" />
    <Sfx src="error-beep" at={nb(b, 'nunca')} vol={0.35} />
  </AbsoluteFill>
);

const Xerife: React.FC<PB> = ({d, b}) => {
  const s = simular(d.p);
  const xq = s.eventos.find((e) => e.tipo === 'xerife' && e.alvo === 'Roxo')?.quadro ?? tq(d, 20);
  const tAt = nb(b, 'atira');
  return (
    <AbsoluteFill>
      <JogoV p={d.p} de={Math.max(0, xq - tAt)} dur={b.dur} escala={1.8} />
      <Selo txt="🔫 XERIFE" cor="#e67e22" at={nb(b, 'Xerife')} y={300} rot={-3} size={70} />
      <Selo txt="🤡 NÃO É IMPOSTOR" cor={GEMINI} at={nb(b, 'Palhaço')} y={420} rot={3} size={58} />
      <Selo txt="💀 O XERIFE MORREU" at={nb(b, 'morre')} y={540} rot={-2} size={64} />
      <Sfx src="fail-piano" at={nb(b, 'morre')} vol={0.45} />
    </AbsoluteFill>
  );
};

const Fim: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const a1 = fala(b, 1), a2 = fala(b, 2);
  const tDez = nb(b, 'Dez');
  const tExp = nb(b, 'Expulso');
  const k = Math.max(0, f - tDez);
  return (
    <AbsoluteFill>
      {f < tExp ? (
        <Tela><Votacao p={d.p} idx={3} fase={f >= tDez ? 'votacao' : 'discussao'} votos={f >= tDez ? Math.min(1, k / 30) : 0} chat={false} timer={f >= tDez ? 0 : 45} /></Tela>
      ) : (
        <Sequence from={tExp} layout="none"><Ejecao2 p={d.p} idx={3} /></Sequence>
      )}
      <FalaCard cor="Rosa" texto="Eu VI Roxo subir no scanner na Enfermaria e o scan NÃO LIGOU — fake scan!" at={a1.at} ate={fimFala(b, 1)} top={300} />
      <FalaCard cor="Roxo" texto="Vocês tão caindo na historinha da Rosa," at={a2.at} ate={fimFala(b, 2)} top={300} />
      <Selo txt="🗳️ 10 VOTOS" at={tDez} y={300} rot={-3} size={76} />
      <Selo txt="🤡 PALHAÇO VENCEU" cor={GEMINI} at={nb(b, 'Palhaço')} y={1200} rot={3} size={66} />
      <Selo txt="E CONSEGUIU ✅" cor="#1f8f3a" at={nb(b, 'conseguiu')} y={1320} rot={-2} size={62} />
      <Sfx src="crowd-laugh" at={nb(b, 'Palhaço') + 6} vol={0.35} />
      <Sfx src="tada" at={nb(b, 'conseguiu')} vol={0.4} />
    </AbsoluteFill>
  );
};

const BLOCOS: Record<string, React.FC<PB>> = {gancho: Gancho, regra: Regra, botao: Botao, scan: Scan, xerife: Xerife, fim: Fim};

export const ShortPalhaco: React.FC<{dados: Dados | null}> = ({dados}) => {
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
