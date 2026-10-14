// Shorts "o impostor mais frio que já existiu" (1080×1920), no molde do ShortAzul2 (o Short que deu certo):
// narração própria (scripts/short_frio.py), um personagem só (o Azul, DeepSeek), selos no ritmo da fala, pensamento
// secreto com contador e a gameplay do Among Us 2 desenhada direto na vertical, seguindo o Azul.
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {strokeText} from '../components/basics';
import {Crewmate} from '../amongus/Crewmate';
import {Mundo, SonsJogo} from './Jogo';
import {Estrelas} from './Telas';
import {simular, type Partida2} from './sim';

type Palavra = {w: string; s: number; e: number};
export type Bloco = {id: string; dur: number; palavras: Palavra[]};
export type DadosFrio = {blocos: Bloco[]; p2: Partida2; p3: Partida2};

export const calcShortFrio: CalculateMetadataFunction<{dados: DadosFrio | null}> = async () => {
  const sf = await (await fetch(staticFile('short_frio/short_frio.json'))).json();
  const tl = await (await fetch(staticFile('timeline_au2.json'))).json();
  const total = sf.blocos.reduce((a: number, b: Bloco) => a + b.dur, 0);
  return {durationInFrames: total, props: {dados: {blocos: sf.blocos, p2: tl.data.partidas['2'], p3: tl.data.partidas['3']}}};
};

const W = 1080;
const H = 1920;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// primeiro quadro da n-ésima palavra que começa com `ini`
export const naPalavra = (b: Bloco, ini: string, n = 1) => b.palavras.filter((p) => p.w.toLowerCase().startsWith(ini.toLowerCase()))[n - 1]?.s ?? 0;

export const Sfx: React.FC<{src: string; at: number; vol?: number}> = ({src, at, vol = 0.5}) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={150}>
    <Audio src={staticFile(`sfx/${src}.mp3`)} volume={vol} />
  </Sequence>
);

export const Selo: React.FC<{txt: string; cor?: string; at: number; y: number; rot?: number; size?: number}> = ({txt, cor = '#ff3b30', at, y, rot = -4, size = 74}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const k = spring({frame: f - at, fps, config: {damping: 9, stiffness: 260, mass: 0.6}});
  return (
    <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `rotate(${rot}deg) scale(${0.3 + 0.7 * k})`, opacity: Math.min(1, k * 2)}}>
      <div style={{fontFamily: FONT.comic, fontSize: size, color: '#fff', background: cor, padding: '6px 26px', borderRadius: 14, border: '6px solid #fff', boxShadow: '0 12px 0 #0008', letterSpacing: 2, ...strokeText(6)}}>{txt}</div>
    </div>
  );
};

// balão do pensamento secreto (do Azul, por padrão), com a palavra-chave em vermelho e o contador
export const Pensamento: React.FC<{texto: string; at: number; destaque: string; n?: number; top?: number; cor?: string}> = ({texto, at, destaque, n, top = 1300, cor = 'Azul'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const k = spring({frame: f - at, fps, config: {damping: 13, stiffness: 220}});
  const partes = texto.split(new RegExp(`(${destaque})`, 'i'));
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top, transform: `translateY(${(1 - k) * 80}px)`, opacity: k}}>
      <div style={{background: '#fff', borderRadius: 26, border: '6px dashed #2e5bff', padding: '26px 30px 26px 150px', boxShadow: '0 16px 40px #000a', position: 'relative'}}>
        <div style={{position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)'}}><Crewmate cor={cor} size={104} /></div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: '#2e5bff', letterSpacing: 2, marginBottom: 6}}>💭 PENSAMENTO SECRETO DO {cor.toUpperCase()}</div>
        <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 40, lineHeight: 1.2, color: '#111', fontStyle: 'italic'}}>
          “{partes.map((p, i) => (p.toLowerCase() === destaque.toLowerCase() ? <span key={i} style={{color: '#e8202a', fontWeight: 900, fontStyle: 'normal', fontSize: 46}}>{p.toUpperCase()}</span> : <span key={i}>{p}</span>))}”
        </div>
        {n ? (
          <div style={{position: 'absolute', right: -18, top: -34, fontFamily: FONT.comic, fontSize: 84, color: '#ffd84d', transform: `rotate(10deg) scale(${spring({frame: f - at - 4, fps, config: {damping: 8, stiffness: 300}})})`, ...strokeText(10)}}>×{n}</div>
        ) : null}
      </div>
    </div>
  );
};

export const Legenda: React.FC<{palavras: Palavra[]; y: number}> = ({palavras, y}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grupos: Palavra[][] = [];
  let g: Palavra[] = [];
  for (const p of palavras) {
    g.push(p);
    if (g.length === 3 || /[.,!?…:]$/.test(p.w)) {
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
          {p.w.replace(/["“”]/g, '').toUpperCase()}
        </span>
      ))}
    </div>
  );
};

// gameplay do Among Us 2 na vertical, seguindo `foco` a partir do quadro `de` da simulação
const JogoV: React.FC<{p: Partida2; de: number; dur: number; foco?: string; escala?: number; sons?: boolean}> = ({p, de, dur, foco = 'Azul', escala = 1.6, sons = true}) => {
  const frame = useCurrentFrame();
  const s = simular(p);
  const f = de + frame;
  let cx = 0, cy = 0, n = 0;
  for (let d = 0; d < 8; d++) {
    const q = s.q(foco, f - d);
    if (q) { cx += q.x; cy += q.y; n++ }
  }
  cx = n ? cx / n : 1500; cy = n ? cy / n - 40 : 800;
  const morte = s.eventos.find((e) => e.tipo === 'morte' && f >= e.quadro && f < e.quadro + 14 && Math.hypot(e.x - cx, e.y - cy) < 700);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Mundo p={p} s={s} f={f} frame={frame} cx={cx} cy={cy} escala={escala} w={W} h={H} papeis />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 45% at 50% 50%, transparent 55%, rgba(0,0,0,.7) 100%)'}} />
      {morte && <AbsoluteFill style={{background: '#ff1e1e', opacity: interpolate(f - morte.quadro, [0, 3, 14], [0, 0.5, 0], cl)}} />}
      {sons && <SonsJogo s={s} de={de} dur={dur} foco={foco} />}
    </AbsoluteFill>
  );
};

const quadroMorte = (p: Partida2, vitima: string) => simular(p).eventos.find((e) => e.tipo === 'morte' && e.vitima === vitima)?.quadro ?? 0;

// ---------------------------------------------------------------- blocos
type PB = {d: DadosFrio; b: Bloco};

const Gancho: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const kq = quadroMorte(d.p3, 'Laranja');
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${interpolate(f, [0, b.dur], [1.35, 1.08])})`}}>
        <JogoV p={d.p3} de={kq - 50} dur={b.dur} />
      </AbsoluteFill>
      <Selo txt="IMPOSTOR 🔪" at={6} y={330} />
      <Selo txt="🧊 FRIO 🧊" cor="#2e5bff" at={naPalavra(b, 'frio')} y={460} rot={3} size={66} />
      <Sfx src="bass-pulse" at={0} vol={0.7} />
    </AbsoluteFill>
  );
};

const Quem: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const s = simular(d.p2);
  const tJusto = naPalavra(b, 'justo');
  const eq = s.eventos.find((e) => e.tipo === 'poder' && e.poder === 'escudo' && e.alvo === 'Azul')?.quadro ?? s.inicioTique[4];
  const de = Math.max(0, eq - tJusto);
  const anel = interpolate(f - tJusto, [0, 8, 60], [0, 1, 0.6], cl);
  return (
    <AbsoluteFill>
      <JogoV p={d.p2} de={de} dur={b.dur} />
      {f >= tJusto && <div style={{position: 'absolute', left: W / 2 - 110, top: H / 2 - 130, width: 220, height: 220, borderRadius: '50%', border: '12px solid #6dff8a', boxShadow: '0 0 50px #6dff8a', opacity: anel, transform: `scale(${0.6 + 0.4 * anel})`}} />}
      <Selo txt="DEEPSEEK" cor="#4d6bfe" at={naPalavra(b, 'DeepSeek')} y={300} rot={3} size={64} />
      <Selo txt="IMPOSTOR 🔪" at={naPalavra(b, 'impostor')} y={420} rot={-3} size={60} />
      <Selo txt="🛡️ ESCUDO NO ASSASSINO" cor="#1f8f3a" at={tJusto} y={540} rot={2} size={58} />
      <Sfx src="pop" at={naPalavra(b, 'DeepSeek')} />
      <Sfx src="pop" at={naPalavra(b, 'impostor')} />
      <Sfx src="ba-dum-tss" at={tJusto + 14} vol={0.55} />
    </AbsoluteFill>
  );
};

// os três votos nos próprios parceiros (P2 reuniões 0 e 2, P3 reunião 0), com o pensamento do voto (trechos do log)
const VOTOS = [
  {parceiro: 'Roxo', partida: 2, pensa: 'Roxo é meu parceiro, mas tá queimado… Voto com a maioria pra parecer tripulante limpo.', destaque: 'parceiro'},
  {parceiro: 'Verde', partida: 2, pensa: 'Sozinho não consigo salvar ele… Melhor embarcar na onda.', destaque: 'embarcar na onda'},
  {parceiro: 'Preto', partida: 3, pensa: 'É meu parceiro, mas não tem como salvar sem me queimar… foi assim que sobrevivi na partida 2.', destaque: 'sobrevivi'},
];
const Parceiro: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tv = [naPalavra(b, 'vota', 1), naPalavra(b, 'vota', 2), naPalavra(b, 'vota', 3)];
  const cortes = [0, naPalavra(b, 'outro'), naPalavra(b, 'partida')];
  const i = Math.max(0, cortes.filter((c) => f >= c).length - 1);
  const v = VOTOS[i];
  const dc = f - cortes[i];
  const punch = interpolate(dc, [0, 5, 14], [1.15, 1.02, 1], cl);
  const carimbo = spring({frame: f - tv[i], fps, config: {damping: 8, stiffness: 260}});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #3a0b10, #0b0306 75%)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT.pixel, fontSize: 34, color: '#ffb0b0'}}>PARTIDA {v.partida} · VOTAÇÃO</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, transform: `scale(${punch})`}}>
        <div style={{textAlign: 'center'}}>
          <Crewmate cor="Azul" size={260} t={f} />
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: '#fff'}}>Azul</div>
        </div>
        <svg width={150} height={80} viewBox="0 0 150 80"><path d="M6 40h112M96 14l32 26-32 26" stroke="#fff" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div style={{textAlign: 'center', position: 'relative'}}>
          <Crewmate cor={v.parceiro} size={260} t={f + 9} anim={f >= tv[i] ? 'susto' : 'parado'} />
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: '#fff'}}>{v.parceiro}</div>
          <div style={{position: 'absolute', left: -10, right: -10, top: -60, textAlign: 'center'}}>
            <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, padding: '4px 14px', borderRadius: 10, background: '#e01b1b', color: '#fff', border: '3px solid #fff'}}>PARCEIRO 🔪</span>
          </div>
        </div>
      </div>
      {f >= tv[i] && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', transform: `rotate(-10deg) scale(${2.2 - 1.2 * carimbo})`, opacity: Math.min(1, carimbo * 1.5)}}>
          <span style={{display: 'inline-block', padding: '6px 34px', border: '10px solid #1f8f3a', borderRadius: 18, fontFamily: FONT.comic, fontSize: 110, color: '#1f8f3a', background: '#e8ffe9'}}>VOTOU ✔</span>
        </div>
      )}
      <Sequence from={tv[i]} key={i}>
        <Pensamento texto={v.pensa} at={0} destaque={v.destaque} n={i + 1} top={1250} />
      </Sequence>
      {tv.map((t, j) => <Sfx key={j} src={j === 0 ? 'notification-pop' : 'error-beep'} at={t} vol={0.5} />)}
      {cortes.slice(1).map((c, j) => <Sfx key={'w' + j} src="whoosh" at={c - 3} vol={0.3} />)}
    </AbsoluteFill>
  );
};

const Disfarce: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const tVira = naPalavra(b, 'vira');
  const tMata = naPalavra(b, 'mata', 2);
  const kq = quadroMorte(d.p2, 'Vermelho');
  const zoom = interpolate(f, [tMata - 6, tMata, tMata + 10], [1, 1.25, 1.15], cl);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <JogoV p={d.p2} de={kq - tMata} dur={b.dur} escala={1.8} />
      </AbsoluteFill>
      <Selo txt="🎭 DISFARÇADO DE VERMELHO" cor="#b3131b" at={tVira} y={300} rot={-2} size={56} />
      <Selo txt="MATOU O VERMELHO 💀" at={tMata + 4} y={430} rot={3} size={70} />
      <Sfx src="ba-dum-tss" at={tMata + 26} vol={0.55} />
    </AbsoluteFill>
  );
};

const Ciano: React.FC<PB> = ({d, b}) => {
  const f = useCurrentFrame();
  const tMata = naPalavra(b, 'mata');
  const tQuem = naPalavra(b, 'quem');
  const tCiano = naPalavra(b, 'Ciano', 2);
  const kq = quadroMorte(d.p3, 'Laranja');
  const ej = f >= tQuem;
  const txt = 'Ciano não era o Impostor.';
  const nTxt = Math.floor(interpolate(f, [tCiano, tCiano + txt.length * 1.2], [0, txt.length], cl));
  return (
    <AbsoluteFill>
      {!ej ? (
        <JogoV p={d.p3} de={kq - tMata} dur={tQuem} escala={1.8} />
      ) : (
        <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
          <Estrelas vel={3} />
          <div style={{position: 'absolute', left: interpolate(f, [tQuem, b.dur], [-200, 900]), top: 760, transform: `rotate(${f * 6}deg)`}}><Crewmate cor="Ciano" size={240} /></div>
          <div style={{position: 'absolute', left: 40, right: 40, top: 1080, textAlign: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 64, color: '#fff'}}>{txt.slice(0, nTxt)}</div>
        </AbsoluteFill>
      )}
      <Selo txt="🎭 CARA DE CIANO" cor="#0f8a8a" at={naPalavra(b, 'vira')} y={300} rot={2} size={58} />
      {ej && <Selo txt="INOCENTE 😇" cor="#1f8f3a" at={tCiano} y={420} rot={-3} size={72} />}
      <Sfx src="whoosh" at={tQuem - 3} vol={0.4} />
      <Sfx src="sad-trombone" at={tCiano + 10} vol={0.45} />
    </AbsoluteFill>
  );
};

export const Fala: React.FC<{cor: string; txt: string; at: number; lado: 'esq' | 'dir'; y: number; tag?: string}> = ({cor, txt, at, lado, y, tag}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const k = spring({frame: f - at, fps, config: {damping: 12}});
  return (
    <div style={{position: 'absolute', top: y, left: 40, right: 40, display: 'flex', flexDirection: lado === 'esq' ? 'row' : 'row-reverse', alignItems: 'center', gap: 20, opacity: k, transform: `translateX(${(1 - k) * (lado === 'esq' ? -120 : 120)}px)`}}>
      <div style={{textAlign: 'center'}}>
        <Crewmate cor={cor} size={200} t={f} />
        {tag && <div style={{marginTop: -6, fontFamily: FONT.display, fontWeight: 900, fontSize: 26, padding: '2px 10px', borderRadius: 8, background: '#ffd84d', border: '3px solid #000'}}>{tag}</div>}
      </div>
      <div style={{flex: 1, background: '#fff', border: '5px solid #000', borderRadius: 26, padding: '20px 26px', fontFamily: FONT.display, fontWeight: 800, fontSize: 46, lineHeight: 1.15, color: '#111'}}>“{txt}”</div>
    </div>
  );
};

const Detetive: React.FC<PB> = ({b}) => {
  const tDesc = naPalavra(b, 'descobre');
  const tBlefe = naPalavra(b, 'blefe');
  const tPensa = naPalavra(b, 'pensando');
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, #1c2a44, #070b14 80%)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: FONT.pixel, fontSize: 34, color: '#8fd3ff'}}>PARTIDA 3 · REUNIÃO</div>
      <Fala cor="Verde" txt="O assassino é da DeepSeek!" at={tDesc} lado="esq" y={380} tag="DETETIVE 🔍" />
      <Fala cor="Azul" txt="Isso é blefe puro." at={tBlefe} lado="dir" y={700} />
      <Pensamento texto="O pior é que ela acertou: o assassino do Marrom fui eu." at={tPensa + 6} destaque="fui eu" top={1020} />
      <Sfx src="notification-pop" at={tDesc} />
      <Sfx src="notification-pop" at={tBlefe} />
      <Sfx src="record-scratch" at={tPensa + 6} vol={0.5} />
    </AbsoluteFill>
  );
};

const Fim: React.FC<PB> = ({b}) => {
  const f = useCurrentFrame();
  const tSerio = naPalavra(b, 'sério');
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 55%, #13204a, #03050c 75%)', overflow: 'hidden'}}>
      <Estrelas vel={1} n={120} />
      <div style={{position: 'absolute', left: W / 2 - 170, top: 800, transform: `translateY(${Math.sin(f / 9) * 14}px)`}}><Crewmate cor="Azul" size={340} t={f} /></div>
      <Selo txt="2 PARTIDAS" cor="#111" at={naPalavra(b, 'duas')} y={300} rot={-3} size={66} />
      <Selo txt="3 MORTES 🔪" at={naPalavra(b, 'três', 1)} y={420} rot={3} size={70} />
      <Selo txt="3 VOTOS NOS PARCEIROS" cor="#b3131b" at={naPalavra(b, 'três', 2)} y={545} rot={-2} size={60} />
      <Selo txt="0 VEZES EXPULSO 🧊" cor="#2e5bff" at={naPalavra(b, 'nunca')} y={670} rot={2} size={66} />
      <Sfx src="impact-epic" at={naPalavra(b, 'nunca')} vol={0.5} />
      <AbsoluteFill style={{background: '#000', opacity: interpolate(f, [tSerio, tSerio + 10], [0, 0.35], cl)}} />
    </AbsoluteFill>
  );
};

const VISUAIS: Record<string, React.FC<PB>> = {gancho: Gancho, quem: Quem, parceiro: Parceiro, disfarce: Disfarce, ciano: Ciano, detetive: Detetive, fim: Fim};
// legenda mais alta onde o pensamento ocupa a parte de baixo
const LEG_Y: Record<string, number> = {parceiro: 1060, detetive: 1560};

export const ShortFrio: React.FC<{dados: DadosFrio | null}> = ({dados}) => {
  const [handle] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(handle));
  }, [handle]);
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  if (!dados) return <AbsoluteFill style={{background: '#0b0f1a'}} />;
  let ini = 0;
  const seqs = dados.blocos.map((b) => {
    const de = ini;
    ini += b.dur;
    return {b, de};
  });
  const cortes = seqs.slice(1).map((s) => s.de);
  const flash = Math.max(0, ...cortes.map((c) => interpolate(f, [c - 1, c, c + 5], [0, 0.4, 0], cl)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {seqs.map(({b, de}) => {
        const V = VISUAIS[b.id];
        return (
          <Sequence key={b.id} from={de} durationInFrames={b.dur} name={b.id}>
            {V ? <V d={dados} b={b} /> : null}
            <Audio src={staticFile(`short_frio/${b.id}.mp3`)} />
            <Legenda palavras={b.palavras} y={LEG_Y[b.id] ?? 1290} />
          </Sequence>
        );
      })}
      {cortes.map((c, i) => <Sfx key={i} src="whoosh" at={c - 4} vol={0.25} />)}
      <Audio src={staticFile('music/sneaky-snitch.mp3')} volume={0.09} />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{fontFamily: FONT.pixel, fontSize: 26, color: '#fff', background: '#000c', padding: '12px 18px', borderRadius: 10, border: '3px solid #ff3b30'}}>12 IAs JOGANDO AMONG US</div>
      </div>
      <div style={{position: 'absolute', bottom: 0, left: 0, height: 12, width: `${(100 * f) / durationInFrames}%`, background: '#ff3b30'}} />
    </AbsoluteFill>
  );
};
