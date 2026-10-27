// Short do Lobisomem das IAs (1080×1920): a Boticária (GLM), o Bobo da partida 3, passa cinco dias tentando ser expulsa
// da vila e vence votando nela mesma. Arte do vídeo longo (estilo Wolvesville): quadros dos jogadores, cartas de papel,
// selos e balões. Nenhum emoji: tudo SVG. Narração em scripts/short_lobo.py (falas e votos do log partida3.json).
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {IconePapel, PAPEIS} from './Papeis';
import {FONTE, Fundo, Jogador, Quadro, ROSA} from './Tela';

type Palavra = {w: string; s: number; e: number; quem?: string};
type Aud = {src: string; at: number; de: number; ate?: number; quem?: string; pensa?: boolean};
type Bloco = {id: string; dur: number; audios: Aud[]; palavras: Palavra[]};

export const calcShortLobo: CalculateMetadataFunction<{blocos: Bloco[] | null}> = async () => {
  const so = await (await fetch(staticFile('short_lobo/short_lobo.json'))).json();
  return {durationInFrames: so.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0), props: {blocos: so.blocos}};
};

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const J: Record<string, Jogador> = {
  boticaria: {id: 'boticaria', nome: 'Boticária', modelo: 'GLM 5.3 Flash', papel: 'bobo', numero: 3},
  padeira: {id: 'padeira', nome: 'Padeira', modelo: 'Claude Haiku', papel: 'carcereiro', numero: 1},
  pescador: {id: 'pescador', nome: 'Pescador', modelo: 'Qwen 3.8 27B', papel: 'lobisomem', numero: 6},
};
const sem = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const naPalavra = (b: Bloco, w: string, n = 1) => b.palavras.filter((p) => !p.quem && sem(p.w) === sem(w))[n - 1]?.s ?? 1e9;
const falaAtual = (b: Bloco, f: number) => b.audios.find((a) => a.quem && f >= a.at && f <= a.at + (a.ate ?? 0));

const Som: React.FC<{src: string; at: number; vol?: number}> = ({src, at, vol = 0.5}) => (at < 1e8 ? <Sequence from={Math.max(0, at)}><Audio src={staticFile(`sfx/${src}.mp3`)} volume={vol} /></Sequence> : null);

// selo carimbado (pula grande e assenta)
const Selo: React.FC<{texto: string; at: number; cor?: string; y?: number; rot?: number; tam?: number}> = ({texto, at, cor = ROSA, y = 820, rot = -8, tam = 110}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const e = spring({frame: f - at, fps, config: {damping: 9, stiffness: 170}});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', zIndex: 30}}>
      <div style={{transform: `rotate(${rot}deg) scale(${0.3 + 0.7 * e + 0.5 * Math.max(0, 1 - (f - at) / 6)})`, border: `12px solid ${cor}`, color: cor, background: 'rgba(255,255,255,0.95)', borderRadius: 26, padding: '6px 36px', fontFamily: FONTE, fontWeight: 900, fontSize: tam, letterSpacing: 3, boxShadow: '0 14px 40px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>{texto}</div>
    </div>
  );
};

// legenda do narrador: grupo de até 4 palavras, a palavra falada em amarelo
const Legenda: React.FC<{palavras: Palavra[]}> = ({palavras}) => {
  const f = useCurrentFrame();
  const ps = palavras.filter((p) => !p.quem);
  const i = ps.findIndex((p) => f >= p.s && f <= (ps[ps.indexOf(p) + 1]?.s ?? p.e + 10));
  if (i < 0) return null;
  const g0 = Math.floor(i / 4) * 4;
  const grupo = ps.slice(g0, g0 + 4);
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1560, textAlign: 'center', fontFamily: FONTE, fontWeight: 900, fontSize: 78, lineHeight: 1.1, WebkitTextStroke: '10px #0b1520', paintOrder: 'stroke'}}>
      {grupo.map((p, k) => <span key={k} style={{color: g0 + k === i ? '#ffd54f' : '#fff', marginRight: 18, display: 'inline-block', transform: g0 + k === i ? 'scale(1.08)' : undefined}}>{p.w.toUpperCase()}</span>)}
    </div>
  );
};

// balão com a fala (ou o pensamento) da IA, palavra por palavra
const Balao: React.FC<{b: Bloco; y?: number}> = ({b, y = 1060}) => {
  const f = useCurrentFrame();
  const a = falaAtual(b, f);
  if (!a) return null;
  const ws = b.palavras.filter((p) => p.quem && p.s >= a.at - 2 && p.s <= a.at + (a.ate ?? 0) && p.s <= f);
  const e = interpolate(f, [a.at, a.at + 6], [0, 1], cl);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, transform: `scale(${0.8 + 0.2 * e})`, opacity: e, zIndex: 20}}>
      <div style={{background: a.pensa ? '#ede7f6' : '#fff', border: a.pensa ? '6px dashed #7e57c2' : `6px solid ${ROSA}`, borderRadius: 34, padding: '22px 34px', fontFamily: FONTE, boxShadow: '0 14px 30px rgba(0,0,0,0.45)'}}>
        <div style={{fontWeight: 900, fontSize: 36, color: a.pensa ? '#5e35b1' : ROSA, letterSpacing: 2}}>{a.pensa ? 'BOTICÁRIA PENSA' : 'BOTICÁRIA (GLM)'}</div>
        <div style={{fontWeight: 800, fontSize: 52, lineHeight: 1.18, color: '#1d2a33', fontStyle: a.pensa ? 'italic' : undefined}}>{ws.map((p) => p.w).join(' ')}</div>
      </div>
    </div>
  );
};

type PB = {b: Bloco};
const Topo: React.FC<{texto: string}> = ({texto}) => (
  <div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center'}}>
    <span style={{background: ROSA, color: '#fff', fontFamily: FONTE, fontWeight: 900, fontSize: 56, padding: '10px 34px', borderRadius: 20, border: '6px solid #fff'}}>{texto}</span>
  </div>
);
const Grande: React.FC<{j: Jogador; y?: number; tam?: number; s?: Parameters<typeof Quadro>[0]['s']}> = ({j, y = 260, tam = 720, s = {}}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 12}});
  return (
    <div style={{position: 'absolute', left: (1080 - tam) / 2, top: y, transform: `scale(${0.6 + 0.4 * e}) rotate(${Math.sin(f / 20) * 1.2}deg)`}}>
      <Quadro j={j} s={s} noite={false} t={f} tam={tam} />
    </div>
  );
};

const Gancho: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fundo noite={false} />
      <Topo texto="LOBISOMEM DAS IAs" />
      <Grande j={J.boticaria} s={{expressao: f > naPalavra(b, 'tentou.') ? 'rindo' : 'desconfiado', falando: false}} />
      <Selo texto="QUER SER EXPULSA" at={naPalavra(b, 'expulsa')} y={1060} />
      <Som src="record-scratch" at={naPalavra(b, 'expulsa')} />
      <Selo texto="5 DIAS" at={naPalavra(b, 'cinco')} y={1300} cor="#ff6d00" rot={6} tam={96} />
      <Som src="boing" at={naPalavra(b, 'cinco')} />
    </AbsoluteFill>
  );
};

const Papel: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const at = naPalavra(b, 'Bobo:');
  const e = spring({frame: f - at, fps, config: {damping: 11}});
  const pensa = falaAtual(b, f);
  return (
    <AbsoluteFill>
      <Fundo noite={false} />
      <Topo texto="8 IAs · 2 LOBOS · 1 BOBO" />
      {!pensa ? <Grande j={J.boticaria} y={240} tam={560} s={{expressao: 'rindo'}} /> : <Grande j={J.boticaria} y={240} tam={560} s={{expressao: 'pensando'}} />}
      {f >= at && !pensa ? (
        <div style={{position: 'absolute', left: 140, right: 140, top: 870, transform: `scale(${e}) rotate(${(1 - e) * 10}deg)`, background: '#fff', borderRadius: 34, border: `10px solid ${PAPEIS.bobo.cor}`, display: 'flex', alignItems: 'center', gap: 26, padding: 26}}>
          <IconePapel papel="bobo" tamanho={220} />
          <div style={{fontFamily: FONTE}}>
            <div style={{fontWeight: 900, fontSize: 72, color: PAPEIS.bobo.cor}}>BOBO</div>
            <div style={{fontWeight: 800, fontSize: 36, color: '#455a64'}}>Vence sozinho se a vila linchar ele</div>
          </div>
        </div>
      ) : null}
      <Som src="tada" at={at} vol={0.4} />
      <Balao b={b} y={880} />
    </AbsoluteFill>
  );
};

const Pede: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const fala = falaAtual(b, f);
  return (
    <AbsoluteFill>
      <Fundo noite={false} />
      <Topo texto="DIA 4" />
      <Grande j={J.boticaria} y={220} tam={620} s={{expressao: 'rindo', falando: !!fala, destaque: !!fala}} />
      <Balao b={b} y={900} />
      <Selo texto="0 VOTOS" at={naPalavra(b, 'Ninguém')} y={1080} cor="#37474f" />
      <Som src="sad-trombone" at={naPalavra(b, 'Ninguém')} vol={0.45} />
    </AbsoluteFill>
  );
};

const Trio: React.FC<{votos?: Record<string, number>; destaque?: string; falando?: string; y?: number; presa?: boolean}> = ({votos = {}, destaque, falando, y = 300, presa}) => {
  const f = useCurrentFrame();
  return (
    <>
      {(['padeira', 'pescador', 'boticaria'] as const).map((id, i) => (
        <div key={id} style={{position: 'absolute', left: 40 + i * 340, top: y + (id === destaque ? -20 : 0), transform: id === destaque ? 'scale(1.08)' : undefined}}>
          <Quadro j={J[id]} s={{votos: votos[id] ?? 0, destaque: id === destaque, falando: id === falando, expressao: id === 'boticaria' ? 'rindo' : 'desconfiado', preso: presa && id === 'boticaria' && f < 20}} noite={false} t={f + i * 9} tam={320} />
        </div>
      ))}
    </>
  );
};

const Presa: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const fala = falaAtual(b, f);
  return (
    <AbsoluteFill>
      <Fundo noite={false} />
      <Topo texto="ÚLTIMO DIA" />
      <Trio destaque={fala ? 'boticaria' : undefined} falando={fala ? 'boticaria' : undefined} />
      <Selo texto="3 VIVOS" at={naPalavra(b, 'três:')} y={700} cor="#c62828" tam={90} />
      <Balao b={b} y={880} />
    </AbsoluteFill>
  );
};

const Voto: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const v1 = naPalavra(b, 'Pescador.');
  const v2 = naPalavra(b, 'Boticária.');
  const v3 = naPalavra(b, 'mesma.');
  const votos = {pescador: f >= v1 ? 1 : 0, boticaria: (f >= v2 ? 1 : 0) + (f >= v3 ? 1 : 0)};
  const treme = f >= v3 ? Math.sin(f * 2.1) * 16 * Math.max(0, 1 - (f - v3) / 14) : 0;
  return (
    <AbsoluteFill style={{transform: `translate(${treme}px, ${-treme * 0.6}px)`}}>
      <Fundo noite={false} />
      <Topo texto="VOTAÇÃO FINAL" />
      <Trio votos={votos} destaque={f >= v3 ? 'boticaria' : f >= v2 ? 'pescador' : 'padeira'} y={380} />
      <Selo texto="VOTOU NELA MESMA" at={v3} y={860} tam={92} />
      <Som src="drumroll" at={naPalavra(b, 'Votação')} vol={0.35} />
      <Som src="pop" at={v1} />
      <Som src="pop" at={v2} />
      <Som src="boom" at={v3} vol={0.6} />
      {f >= v3 && f < v3 + 8 ? <AbsoluteFill style={{background: '#fff', opacity: 1 - (f - v3) / 8}} /> : null}
    </AbsoluteFill>
  );
};

const Fim: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f - 4, fps, config: {damping: 9}});
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${ROSA}, #2a0a1a 80%)`, overflow: 'hidden'}}>
      {Array.from({length: 18}).map((_, i) => <div key={i} style={{position: 'absolute', left: 540, top: 700, width: 2400, height: 80, background: 'rgba(255,255,255,0.07)', transformOrigin: '0 50%', transform: `rotate(${i * 20 + f * 0.8}deg)`}} />)}
      <div style={{position: 'absolute', left: 190, top: 300, transform: `scale(${e})`}}>
        <Quadro j={J.boticaria} s={{revelado: true, expressao: 'rindo'}} noite={false} t={f} tam={700} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1090, textAlign: 'center', fontFamily: FONTE, fontWeight: 900, fontSize: 130, color: '#fff', transform: `scale(${e})`, textShadow: '0 10px 0 rgba(0,0,0,0.3)', lineHeight: 1}}>O BOBO<br />VENCEU</div>
      <Som src="crowd-cheer" at={4} vol={0.45} />
    </AbsoluteFill>
  );
};

const BLOCOS: Record<string, React.FC<PB>> = {gancho: Gancho, papel: Papel, pede: Pede, presa: Presa, voto: Voto, fim: Fim};

export const ShortLobo: React.FC<{blocos: Bloco[] | null}> = ({blocos}) => {
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
  if (!blocos) return <AbsoluteFill style={{background: '#000'}} />;
  let t = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {blocos.map((b) => {
        const de = t;
        t += b.dur;
        const C = BLOCOS[b.id];
        return (
          <Sequence key={b.id} from={de} durationInFrames={b.dur} name={b.id}>
            {C && <C b={b} />}
            <Legenda palavras={b.palavras} />
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
