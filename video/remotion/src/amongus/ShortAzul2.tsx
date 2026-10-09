// Short 2 (editado, 1080×1920): "o impostor mais medroso que já existiu".
// Narração própria (scripts/short2.py) e gameplay desenhada direto na vertical com a Vista da GameplayNova,
// seguindo o Azul (impostor, Claude Haiku) na partida 1. Cada bloco da narração tem o seu visual.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {strokeText} from '../components/basics';
import {Vista} from './GameplayNova';
import {Crewmate} from './Crewmate';
import type {Partida} from './dados';

type Palavra = {w: string; s: number; e: number};
type Bloco = {id: string; dur: number; palavras: Palavra[]};
export type DadosShort2 = {blocos: Bloco[]; partida: Partida | null};

const W = 1080;
const H = 1920;
const ESCALA = 1.5;
const FPT = 75; // quadros por tique para a caminhada (o relógio aqui anda em câmera lenta/congela) // câmera bem mais perto que no vídeo longo (tela de celular)

// tique contínuo por trechos lineares: pts = [[quadro, tique], ...]
const linha = (pts: [number, number][]) => (f: number) => {
  if (f <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (f <= pts[i][0]) {
      const [a0, t0] = pts[i - 1];
      const [a1, t1] = pts[i];
      return t0 + ((t1 - t0) * (f - a0)) / Math.max(1, a1 - a0);
    }
  }
  return pts[pts.length - 1][1];
};

const Selo: React.FC<{txt: string; cor?: string; at: number; y: number; rot?: number; size?: number}> = ({txt, cor = '#ff3b30', at, y, rot = -4, size = 74}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const k = spring({frame: f - at, fps, config: {damping: 9, stiffness: 260, mass: 0.6}});
  const label = txt.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').replace(/\s+/g, ' ').trim();
  return (
    <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `rotate(${rot}deg) scale(${0.3 + 0.7 * k})`, opacity: Math.min(1, k * 2)}}>
      <div style={{fontFamily: FONT.comic, fontSize: size, color: '#fff', background: cor, padding: '6px 26px', borderRadius: 14, border: '6px solid #fff', boxShadow: '0 12px 0 #0008', letterSpacing: 2, ...strokeText(6)}}>{label}</div>
    </div>
  );
};

// balão do pensamento secreto do Azul, com a palavra-chave em vermelho
const Pensamento: React.FC<{texto: string; at: number; destaque?: string; n?: number}> = ({texto, at, destaque = 'suicídio', n}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = spring({frame: f - at, fps, config: {damping: 13, stiffness: 220}});
  const partes = texto.split(new RegExp(`(${destaque})`, 'i'));
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1330, transform: `translateY(${(1 - k) * 80}px)`, opacity: k}}>
      <div style={{background: '#fff', borderRadius: 26, border: '6px dashed #2e5bff', padding: '26px 30px 26px 150px', boxShadow: '0 16px 40px #000a', position: 'relative'}}>
        <div style={{position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)'}}><Crewmate cor="Azul" size={104} /></div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: '#2e5bff', letterSpacing: 2, marginBottom: 6}}>💭 PENSAMENTO SECRETO DO AZUL</div>
        <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 40, lineHeight: 1.2, color: '#111', fontStyle: 'italic'}}>
          “{partes.map((p, i) => (p.toLowerCase() === destaque ? <span key={i} style={{color: '#e8202a', fontWeight: 900, fontStyle: 'normal', fontSize: 46}}>{p.toUpperCase()}</span> : <span key={i}>{p}</span>))}”
        </div>
        {n ? (
          <div style={{position: 'absolute', right: -18, top: -34, fontFamily: FONT.comic, fontSize: 84, color: '#ffd84d', transform: `rotate(10deg) scale(${spring({frame: f - at - 4, fps, config: {damping: 8, stiffness: 300}})})`, ...strokeText(10)}}>×{n}</div>
        ) : null}
      </div>
    </div>
  );
};

const Legenda: React.FC<{palavras: Palavra[]; y: number}> = ({palavras, y}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grupos: Palavra[][] = [];
  let g: Palavra[] = [];
  for (const p of palavras) {
    g.push(p);
    if (g.length === 3 || /[.,!?…]$/.test(p.w)) {
      grupos.push(g);
      g = [];
    }
  }
  if (g.length) grupos.push(g);
  const i = grupos.findIndex((gr, j) => f >= gr[0].s - 2 && f < (grupos[j + 1]?.[0].s ?? gr[gr.length - 1].e + 12) - 2);
  if (i < 0) return null;
  const atual = grupos[i];
  const pop = spring({frame: f - (atual[0].s - 2), fps, config: {damping: 12, stiffness: 260, mass: 0.5}});
  return (
    <div style={{position: 'absolute', top: y, left: 30, right: 30, textAlign: 'center', transform: `scale(${0.85 + 0.15 * pop})`}}>
      {atual.map((p, j) => (
        <span key={j} style={{fontFamily: FONT.comic, fontSize: 100, lineHeight: 1.05, letterSpacing: 2, margin: '0 12px', color: f >= p.s - 2 ? '#ffd84d' : '#fff', ...strokeText(13)}}>
          {p.w.toUpperCase()}
        </span>
      ))}
    </div>
  );
};

const Sfx: React.FC<{src: string; at: number; vol?: number}> = ({src, at, vol = 0.5}) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={150}>
    <Audio src={staticFile(`sfx/${src}.mp3`)} volume={vol} />
  </Sequence>
);

// primeiro quadro da n-ésima palavra que começa com `ini` (para cortar no ritmo da fala)
const naPalavra = (b: Bloco, ini: string, n = 1) => b.palavras.filter((p) => p.w.toLowerCase().startsWith(ini.toLowerCase()))[n - 1]?.s ?? 0;

const pensamentoDo = (p: Partida, t: number) => p.tiques[t]?.decisoes.find((d) => d.cor === 'Azul')?.pensamento ?? '';

// ---------------------------------------------------------------- blocos
const Gancho: React.FC<{p: Partida; b: Bloco}> = ({p, b}) => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, b.dur], [1.45, 1.12], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Vista p={p} tfDe={linha([[0, 25.6], [b.dur, 25.9]])} w={W} h={H} foco="Azul" mostrarPapeis deTique={25} hud={false} fptFixo={FPT} escalaFixa={ESCALA} />
      </AbsoluteFill>
      <Selo txt="IMPOSTOR 🔪" at={6} y={640} />
      <Sfx src="bass-pulse" at={0} vol={0.7} />
    </AbsoluteFill>
  );
};

const Quem: React.FC<{p: Partida; b: Bloco}> = ({p, b}) => {
  const tFaca = naPalavra(b, 'faca');
  const tProb = naPalavra(b, 'problema');
  return (
    <AbsoluteFill>
      <Vista p={p} tfDe={linha([[0, 1.2], [b.dur, 3.4]])} w={W} h={H} foco="Azul" mostrarPapeis deTique={1} hud={false} fptFixo={FPT} escalaFixa={ESCALA} />
      <Selo txt="CLAUDE HAIKU" cor="#d97a47" at={naPalavra(b, 'Haiku')} y={300} rot={3} size={64} />
      <Selo txt="🔪 FACA ✔" cor="#1f8f3a" at={tFaca} y={420} rot={-3} size={56} />
      <Selo txt="🕳️ DUTO ✔" cor="#1f8f3a" at={naPalavra(b, 'duto')} y={510} rot={2} size={56} />
      <Selo txt="CORAGEM ✘" at={tProb} y={600} rot={-5} size={56} />
      <Sfx src="pop" at={tFaca} />
      <Sfx src="pop" at={naPalavra(b, 'duto')} />
      <Sfx src="error-beep" at={tProb} vol={0.45} />
    </AbsoluteFill>
  );
};

const Medo: React.FC<{p: Partida; b: Bloco}> = ({p, b}) => {
  const f = useCurrentFrame();
  // 4 cortes: o pensamento repetido em situações diferentes (tiques reais da partida 1)
  const cortes = [
    {de: 0, t: 15},
    {de: naPalavra(b, 'com', 1), t: 25},
    {de: naPalavra(b, 'com', 2), t: 26},
    {de: naPalavra(b, 'com', 3), t: 34},
  ];
  const i = Math.max(0, cortes.filter((c) => f >= c.de).length - 1);
  const c = cortes[i];
  const fim = cortes[i + 1]?.de ?? b.dur;
  const punch = interpolate(f - c.de, [0, 5, 14], [1.18, 1.02, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${punch})`}}>
        <Vista p={p} tfDe={linha([[c.de, c.t - 0.75], [fim, c.t - 0.55]])} w={W} h={H} foco="Azul" mostrarPapeis deTique={c.t - 1} hud={false} fptFixo={FPT} escalaFixa={ESCALA} />
      </AbsoluteFill>
      <Sequence from={c.de} key={i}>
        <Pensamento texto={pensamentoDo(p, c.t)} at={0} n={i + 1} />
      </Sequence>
      {cortes.map((k, j) => <Sfx key={j} src={j === 0 ? 'notification-pop' : 'error-beep'} at={k.de + 3} vol={0.45} />)}
    </AbsoluteFill>
  );
};

const Admin: React.FC<{p: Partida; b: Bloco}> = ({p, b}) => {
  const f = useCurrentFrame();
  const tSete = naPalavra(b, 'sete');
  const tVerde = naPalavra(b, 'Verde');
  const tSabe = naPalavra(b, 'sabe');
  // time-lapse: os 7 tiques no Admin passam enquanto ele fala "sete tiques fingindo tarefa"
  const tfDe = linha([[0, 15.6], [tSete, 16.9], [tVerde + 20, 22.8], [b.dur, 23.0]]);
  const tique = Math.min(23, Math.max(17, Math.round(tfDe(f))));
  return (
    <AbsoluteFill>
      {/* câmera fixa na sala: o time-lapse faz o Azul trocar de console a cada tique */}
      <Vista p={p} tfDe={tfDe} w={W} h={H} zoom="Admin" mostrarPapeis deTique={15} hud={false} fptFixo={FPT} escalaFixa={1.3} />
      {f >= tSete && (
        <div style={{position: 'absolute', top: 290, right: 50, fontFamily: FONT.pixel, fontSize: 34, color: '#fff', background: '#000b', padding: '14px 18px', borderRadius: 12, border: '4px solid #ffd84d'}}>
          TIQUE {tique}
        </div>
      )}
      <Selo txt="PARCEIRO DELA 🔪" cor="#1f8f3a" at={tVerde} y={420} rot={3} size={60} />
      <Selo txt="FINGINDO PRA QUEM? 🤨" at={tSabe} y={540} rot={-3} size={62} />
      <Sfx src="swoosh-fly" at={tSete} vol={0.4} />
      <Sfx src="ba-dum-tss" at={tSabe + 22} vol={0.55} />
    </AbsoluteFill>
  );
};

// com FPT=75 o Azul chega ao duto do Refeitório em 26,18 e afunda entre 26,20 e 26,29 (conferido com poseNova)
const T_CHEGA = 26.18;
const T_DUTO = 26.23; // metade do afundamento: quadro do freeze
const Duto: React.FC<{p: Partida; b: Bloco}> = ({p, b}) => {
  const f = useCurrentFrame();
  const tVinte = naPalavra(b, 'vinte');
  const tTres = naPalavra(b, 'três');
  const tDuto = naPalavra(b, 'duto');
  // para antes de ele reaparecer no Admin (a câmera segue o Azul e pularia de sala)
  const tfDe = linha([[0, 25.55], [tTres, 25.9], [tDuto - 4, T_CHEGA], [tDuto + 10, 26.29], [b.dur, 26.32]]);
  const zoom = interpolate(f, [tTres, tDuto, tDuto + 12], [1, 1.12, 1.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Vista p={p} tfDe={tfDe} w={W} h={H} foco="Azul" mostrarPapeis deTique={25} hud={false} fptFixo={FPT} escalaFixa={1.0} />
      </AbsoluteFill>
      <Selo txt="TIQUE 27" cor="#111" at={tVinte} y={300} rot={2} size={58} />
      <Selo txt="👀 3 TESTEMUNHAS 👀" at={tTres} y={410} rot={-2} size={64} />
      <Sfx src="riser" at={tTres - 20} vol={0.35} />
      <Sfx src="gasp" at={tDuto + 6} vol={0.6} />
    </AbsoluteFill>
  );
};

const Ironia: React.FC<{p: Partida; b: Bloco}> = ({p, b}) => {
  const f = useCurrentFrame();
  const tVista = naPalavra(b, 'vista', 2);
  return (
    <AbsoluteFill>
      {/* freeze frame no instante do duto, com zoom lento e tom vermelho */}
      <AbsoluteFill style={{transform: `scale(${interpolate(f, [0, b.dur], [1.3, 1.5])})`, filter: `saturate(${f >= tVista ? 0.4 : 1})`}}>
        <Vista p={p} tfDe={() => T_DUTO} w={W} h={H} foco="Azul" mostrarPapeis deTique={25} hud={false} fptFixo={FPT} escalaFixa={1.0} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(circle, #0000 30%, #b0000088 100%)', opacity: f >= tVista ? 1 : 0}} />
      <Selo txt="⏸ PAUSA" cor="#111" at={0} y={300} rot={0} size={56} />
      <Selo txt="PEGA NO FLAGRA 🤡" at={tVista} y={420} rot={-4} size={78} />
      <Sfx src="record-scratch" at={0} vol={0.6} />
      <Sfx src="sad-trombone" at={tVista + 8} vol={0.45} />
    </AbsoluteFill>
  );
};

const Fim: React.FC<{p: Partida; b: Bloco}> = ({p, b}) => {
  const tZero = naPalavra(b, 'zero');
  const tTrip = naPalavra(b, 'tripulantes');
  const tSerio = naPalavra(b, 'sério');
  return (
    <AbsoluteFill>
      <Vista p={p} tfDe={linha([[0, 33.6], [b.dur, 34.9]])} w={W} h={H} foco="Azul" mostrarPapeis deTique={33} hud={false} fptFixo={FPT} escalaFixa={ESCALA} />
      <Selo txt="35 TIQUES" cor="#111" at={0} y={300} rot={-3} size={70} />
      <Selo txt="0 MORTES" at={tZero} y={420} rot={3} size={86} />
      <Selo txt="TRIPULANTES VENCEM ✅" cor="#1f8f3a" at={tTrip} y={560} rot={-2} size={62} />
      <Sfx src="impact-epic" at={tZero} vol={0.5} />
      <Sfx src="wah-wah-trombone" at={tTrip + 25} vol={0.45} />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(useCurrentFrame(), [tSerio, tSerio + 10], [0, 0.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
    </AbsoluteFill>
  );
};

const VISUAIS: Record<string, React.FC<{p: Partida; b: Bloco}>> = {gancho: Gancho, quem: Quem, medo: Medo, admin: Admin, duto: Duto, ironia: Ironia, fim: Fim};

export const ShortAzul2: React.FC<{dados: DadosShort2 | null; title?: string; musicFile?: string | null}> = ({dados, title = '8 IAs JOGANDO AMONG US', musicFile = 'music/sneaky-snitch.mp3'}) => {
  const [handle] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  if (!dados?.partida) return <AbsoluteFill style={{background: '#0b0f1a'}} />;
  const p = dados.partida;
  let ini = 0;
  const seqs = dados.blocos.map((b) => {
    const de = ini;
    ini += b.dur;
    return {b, de};
  });
  const cortes = seqs.slice(1).map((s) => s.de);
  const flash = Math.max(0, ...cortes.map((c) => interpolate(f, [c - 1, c, c + 5], [0, 0.4, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {seqs.map(({b, de}) => {
        const V = VISUAIS[b.id];
        return (
          <Sequence key={b.id} from={de} durationInFrames={b.dur} name={b.id}>
            {V ? <V p={p} b={b} /> : null}
            <Audio src={staticFile(`short2/${b.id}.mp3`)} />
            <Legenda palavras={b.palavras} y={b.id === 'medo' ? 1130 : 1290} />
          </Sequence>
        );
      })}
      {cortes.map((c, i) => <Sfx key={i} src="whoosh" at={c - 4} vol={0.25} />)}
      {musicFile && <Audio src={staticFile(musicFile)} volume={0.09} />}
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      {/* faixa fixa no topo + barra de progresso */}
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT.pixel, fontSize: 26, color: '#fff', background: '#000c', padding: '12px 18px', borderRadius: 10, border: '3px solid #ff3b30'}}>{title}</div>
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, height: 12, width: `${(100 * f) / durationInFrames}%`, background: '#ff3b30'}} />
    </AbsoluteFill>
  );
};
