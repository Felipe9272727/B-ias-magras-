// AMONG IA 7 (Mira HQ de dia, 20 IAs, 4 partidas). Lê public/timeline_au7.json (gerada por
// video/scripts/build_timeline_au7.py a partir de video/roteiro/roteiro_au7.py) e os logs convertidos (public/au7/partidaN.json).
// Mesmo desenho do vídeo do AU6 (zumbi/ZumbiVideo.tsx): cada cena mostra uma partida a partir do tique t0, com a câmera
// pedida e os itens do roteiro por cima (fala, pensamento com eco, chat dos impostores, selo, meme, número, capítulo,
// "ideia de @"). Cenas com `visual` trocam o mapa por uma tela cheia: mesa de reunião (discussão/votos), ejeção,
// cartões de função, elenco, comentários e placar. Soco de zoom em selo/meme/número e deriva lenta em toda cena.
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';
import {Numero} from '../age/Extras';
import {MemeCard, type MemeInfo} from '../components/overlays';
import {AU2Comentarios, type Comentario} from '../amongus3/Comentarios';
import {Jogo7, relogio, type Cam, type Log} from './Jogo7';
import {Balao, Barra, Capitulo, DUR_TRANS7, Feed, FimPartida, Ideia, Selo, Transicao7, Vivos} from './Hud7';
import {Ejecao, Elenco, Mesa, Papeis, Placar, type LinhaPlacar, type PapelCartao} from './Telas7';

type Over =
  | {tipo: 'fala' | 'pensa' | 'chat'; at: number; dur: number; cor: string; texto: string}
  | {tipo: 'selo'; at: number; dur: number; texto: string; cor?: string}
  | {tipo: 'meme'; at: number; dur: number; id: string; pos: string; info: MemeInfo}
  | {tipo: 'numero'; at: number; dur: number; texto: string; sub?: string}
  | {tipo: 'marco'; at: number; dur: number; titulo: string; sub?: string}
  | {tipo: 'fim'; at: number; dur: number; titulo: string; sub?: string; cor?: string}
  | {tipo: 'ideia'; at: number; dur: number; autor: string; oque?: string};
type Visual =
  | {tipo: 'reuniao' | 'votos' | 'ejecao'; indice: number}
  | {tipo: 'papeis'; lista: PapelCartao[]; titulo?: string}
  | {tipo: 'elenco'; titulo?: string; papeis?: boolean}
  | {tipo: 'comentarios'; comentarios: Comentario[]}
  | {tipo: 'placar'; titulo: string; linhas: LinhaPlacar[]};
type Cena = {id: string; dur: number; partida: number; t0: number; vel: number; tk?: [number, number][]; entrada?: 'duto' | 'alarme'; cam: Cam; foco?: string; hud?: boolean; papeis?: boolean; over: Over[]; audio: {src: string; at: number; vol?: number}[]; visual?: Visual};
type TL = {cenas: Cena[]};

export const calcAU7: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl = await (await fetch(staticFile('timeline_au7.json'))).json();
  return {durationInFrames: tl.cenas.reduce((a: number, c: Cena) => a + c.dur, 0), props: {tl}};
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
type FalaOver = Extract<Over, {tipo: 'fala' | 'pensa' | 'chat'}>;

const CenaView: React.FC<{c: Cena; log: Log}> = ({c, log}) => {
  const f = useCurrentFrame();
  // relógio da cena: t0 + vel, passando pelas âncoras ["ir", tique] do roteiro; nunca passa do último tique registrado
  const R = useMemo(() => relogio(c.t0, c.vel, c.tk ?? [], log.tiques.length), [c, log]);
  const T = R.T(f);
  let soco = 0, tremor = 0;
  for (const o of c.over) {
    const d = f - o.at;
    if (d >= 0 && d < 12 && (o.tipo === 'selo' || o.tipo === 'meme' || o.tipo === 'numero')) soco = Math.max(soco, 0.06 * (1 - d / 12));
    if (d >= 0 && d < 14 && o.tipo === 'numero') tremor = Math.max(tremor, 12 * (1 - d / 14));
  }
  // deriva lenta em toda cena (nada de tela parada); o soco vai por fora da câmera (não é suavizado)
  const zoomDe = (g: number) => {
    const k = c.dur > 1 ? clamp01(g / (c.dur - 1)) : 0;
    return (c.cam.zoom ?? (c.cam.mapa ? 1 : 1.6)) * (1 + 0.08 * k * k * (3 - 2 * k));
  };
  const falasOver = c.over.filter((o): o is FalaOver => o.tipo === 'fala' || o.tipo === 'pensa' || o.tipo === 'chat');
  // quem fala/pensa puxa a câmera (rampa de 0,4 s na entrada e na saída)
  const tq = log.tiques[Math.max(0, Math.min(log.tiques.length - 1, Math.ceil(T) - 1))];
  // (fantasma não puxa: o pensamento do Possuidor morto não tira a câmera do corpo que ele vai tomar)
  const vivoNaCena = (cor: string) => tq.estados.find((e) => e.cor === cor)?.vivo !== false;
  const falas = (g: number) => falasOver.filter((o) => vivoNaCena(o.cor)).map((o) => ({cor: o.cor, peso: clamp01(Math.min(g - o.at + 6, o.at + o.dur - g) / 12)})).filter((a) => a.peso > 0);
  const J = Object.fromEntries(log.jogadores.map((j) => [j.cor, j]));
  const v = c.visual;
  // na mesa de reunião, a função e o time são os do tique da reunião (antes do voto)
  const tqFala = v && 'indice' in v ? log.tiques[Math.max(0, log.reunioes[v.indice].tique - 2)] : tq;
  const estadoDe = (cor: string) => tqFala.estados.find((e) => e.cor === cor);
  const falando = falasOver.filter((o) => f >= o.at && f < o.at + o.dur).map((o) => o.cor);
  const flash = c.entrada ? 0 : interpolate(f, [0, 5], [0.45, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#050814'}}>
      <AbsoluteFill style={{transform: `${tremor ? `translate(${Math.sin(f * 2.7) * tremor}px, ${Math.cos(f * 3.3) * tremor}px) ` : ''}scale(${1 + soco})`}}>
        {!v ? <Jogo7 log={log} R={R} cam={c.cam} zoomDe={zoomDe} falas={falas} f={f} foco={c.foco} papeis={c.papeis} /> : null}
        {v?.tipo === 'reuniao' ? <Mesa log={log} idx={v.indice} f={f} dur={c.dur} fase="discussao" falando={falando} /> : null}
        {v?.tipo === 'votos' ? <Mesa log={log} idx={v.indice} f={f} dur={c.dur} fase="votos" falando={falando} /> : null}
        {v?.tipo === 'ejecao' ? <Ejecao log={log} idx={v.indice} f={f} dur={c.dur} /> : null}
        {v?.tipo === 'papeis' ? <Papeis lista={v.lista} titulo={v.titulo} f={f} dur={c.dur} /> : null}
        {v?.tipo === 'elenco' ? <Elenco log={log} f={f} dur={c.dur} titulo={v.titulo} papeis={v.papeis} /> : null}
        {v?.tipo === 'placar' ? <Placar titulo={v.titulo} linhas={v.linhas} f={f} dur={c.dur} /> : null}
        {v?.tipo === 'comentarios' ? <AbsoluteFill style={{background: '#0b1428'}}><AbsoluteFill style={{transform: `scale(${0.9 + 0.03 * clamp01(f / c.dur)})`}}><AU2Comentarios comentarios={v.comentarios} passo={Math.max(24, Math.floor((c.dur - 50) / Math.max(1, v.comentarios.length)))} /></AbsoluteFill></AbsoluteFill> : null}
      </AbsoluteFill>
      {!v && c.hud !== false ? (
        <>
          <Barra partida={log.partida} T={T} t={tq} limite={log.cfg.limite} />
          <Vivos t={tq} />
          <Feed eventos={log.eventos} T={T} />
        </>
      ) : null}
      {c.over.map((o, i) => (
        <Sequence key={i} from={o.at} durationInFrames={o.dur}>
          {o.tipo === 'fala' || o.tipo === 'pensa' || o.tipo === 'chat' ? <SeqBalao o={o} modelo={J[o.cor]?.modelo ?? ''} papel={estadoDe(o.cor)?.papel} time={estadoDe(o.cor)?.time} /> : null}
          {o.tipo === 'selo' ? <SeqSelo texto={o.texto} cor={o.cor} comMeme={c.over.some((m) => m.tipo === 'meme' && m.pos !== 'left' && m.at < o.at + o.dur && m.at + m.dur > o.at)} /> : null}
          {o.tipo === 'meme' ? <MemeCard info={o.info} dur={o.dur} pos={o.pos} /> : null}
          {o.tipo === 'numero' ? <Numero texto={o.texto} sub={o.sub} dur={o.dur} /> : null}
          {o.tipo === 'marco' ? <SeqCap titulo={o.titulo} sub={o.sub} dur={o.dur} /> : null}
          {o.tipo === 'fim' ? <SeqFim o={o} /> : null}
          {o.tipo === 'ideia' ? <SeqIdeia o={o} /> : null}
        </Sequence>
      ))}
      {c.audio.map((a, i) => (
        <Sequence key={`a${i}`} from={a.at}><Audio src={staticFile(a.src)} volume={a.vol ?? 1} /></Sequence>
      ))}
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
const SeqBalao: React.FC<{o: FalaOver; modelo: string; papel?: string; time?: string}> = ({o, modelo, papel, time}) => <Balao k={o.tipo} cor={o.cor} modelo={modelo} papel={papel} time={time} texto={o.texto} f={useCurrentFrame()} dur={o.dur} />;
const SeqSelo: React.FC<{texto: string; cor?: string; comMeme?: boolean}> = ({texto, cor, comMeme}) => <Selo texto={texto} cor={cor} comMeme={comMeme} f={useCurrentFrame()} />;
const SeqCap: React.FC<{titulo: string; sub?: string; dur: number}> = ({titulo, sub, dur}) => <Capitulo titulo={titulo} sub={sub} f={useCurrentFrame()} dur={dur} />;
const SeqFim: React.FC<{o: {dur: number; titulo: string; sub?: string; cor?: string}}> = ({o}) => <FimPartida titulo={o.titulo} sub={o.sub} cor={o.cor} f={useCurrentFrame()} dur={o.dur} />;
const SeqIdeia: React.FC<{o: {dur: number; autor: string; oque?: string}}> = ({o}) => <Ideia autor={o.autor} oque={o.oque} f={useCurrentFrame()} dur={o.dur} />;
const SeqTrans: React.FC<{tipo: 'duto' | 'alarme'}> = ({tipo}) => <Transicao7 tipo={tipo} f={useCurrentFrame()} />;

export const AU7Video: React.FC<{tl: TL | null}> = ({tl}) => {
  const [logs, setLogs] = useState<Record<number, Log> | null>(null);
  const [h] = useState(() => delayRender('logs au7'));
  useEffect(() => {
    (async () => {
      const out: Record<number, Log> = {};
      for (const n of [1, 2, 3, 4]) out[n] = await (await fetch(staticFile(`au7/partida${n}.json`))).json();
      setLogs(out);
      continueRender(h);
    })();
  }, [h]);
  if (!tl || !logs) return null;
  const inicios: number[] = [];
  let ini = 0;
  for (const c of tl.cenas) { inicios.push(ini); ini += c.dur; }
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.cenas.map((c, i) => <Sequence key={c.id} from={inicios[i]} durationInFrames={c.dur}><CenaView c={c} log={logs[c.partida]} /></Sequence>)}
      {/* transições próprias (grade de duto / faixa de alarme) por cima do corte: o corte cai no quadro 22 */}
      {tl.cenas.map((c, i) => (c.entrada ? <Sequence key={`t${c.id}`} from={Math.max(0, inicios[i] - 22)} durationInFrames={DUR_TRANS7}><SeqTrans tipo={c.entrada} /></Sequence> : null))}
    </AbsoluteFill>
  );
};
