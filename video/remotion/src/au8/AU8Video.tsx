// AMONG IA 8 (The Skeld, 11/12 IAs, 4 partidas). Lê public/timeline_au8.json (gerada por
// video/scripts/build_timeline_au8.py a partir de video/roteiro/roteiro_au8.py) e os logs convertidos (public/au8/partidaN.json).
// Cópia do AU7Video com o mapa do Skeld (Jogo8) e o modo "segredo" da abertura (cor aparente o tempo todo, sem função).
// Mesmo desenho do vídeo do AU6 (zumbi/ZumbiVideo.tsx): cada cena mostra uma partida a partir do tique t0, com a câmera
// pedida e os itens do roteiro por cima (fala, pensamento com eco, chat dos impostores, selo, meme, número, capítulo,
// "ideia de @"). Cenas com `visual` trocam o mapa por uma tela cheia: mesa de reunião (discussão/votos), ejeção,
// cartões de função, elenco, comentários e placar. Soco de zoom em selo/meme/número e deriva lenta em toda cena.
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';
import {Gif} from '@remotion/gif';
import {MemeCard, type MemeInfo} from '../components/overlays';
import {AU2Comentarios, type Comentario} from '../amongus3/Comentarios';
import {Jogo8, relogio, type Cam, type Log} from './Jogo8';
import {Balao, Barra, Capitulo, DUR_TRANS8, Feed, FimPartida, Ideia, Numero8, Selo, Transicao8, Vivos} from './Hud8';
import {Ejecao, Elenco, Encerramento, Mesa, Papeis, Placar, type LinhaPlacar, type PapelCartao} from './Telas8';

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
  | {tipo: 'elenco'; titulo?: string; destaques?: string[]; nota?: Record<string, string>}
  | {tipo: 'comentarios'; comentarios: Comentario[]}
  | {tipo: 'placar'; titulo: string; linhas: LinhaPlacar[]}
  | {tipo: 'encerramento'; titulo: string; sub?: string};
type Cena = {id: string; dur: number; partida: number; t0: number; vel: number; tk?: [number, number][]; entrada?: 'duto' | 'alarme' | 'o2'; cam: Cam; foco?: string; hud?: boolean; papeis?: boolean; over: Over[]; audio: {src: string; at: number; vol?: number}[]; visual?: Visual; segredo?: boolean};
type TL = {cenas: Cena[]};

export const calcAU8: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl = await (await fetch(staticFile('timeline_au8.json'))).json();
  return {durationInFrames: tl.cenas.reduce((a: number, c: Cena) => a + c.dur, 0), props: {tl}};
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
type FalaOver = Extract<Over, {tipo: 'fala' | 'pensa' | 'chat'}>;

const CenaView: React.FC<{c: Cena; log: Log; elenco: Log}> = ({c, log, elenco}) => {
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
  // segredo: quem se disfarça em algum tique da cena fica com a cara do disfarce desde o começo (o espectador não vê a troca)
  const mascara = useMemo(() => {
    if (!c.segredo) return undefined;
    const m: Record<string, string> = {};
    for (let n = Math.max(1, Math.ceil(c.t0)); n <= Math.min(log.tiques.length, Math.ceil(R.T(c.dur - 1))); n++) for (const e of log.tiques[n - 1].estados) if (e.ap) m[e.cor] = e.ap;
    return m;
  }, [c, log, R]);
  const v = c.visual;
  // na mesa de reunião, a função e o time são os do tique da reunião (antes do voto)
  const tqFala = v && 'indice' in v ? log.tiques[Math.max(0, log.reunioes[v.indice].tique - 2)] : tq;
  const estadoDe = (cor: string) => tqFala.estados.find((e) => e.cor === cor);
  const falando = falasOver.filter((o) => f >= o.at && f < o.at + o.dur).map((o) => o.cor);
  const ehVotos = v?.tipo === 'votos';
  const ehEncerramento = v?.tipo === 'encerramento';
  const temMemeAgora = c.over.some((o) => o.tipo === 'meme' && o.pos !== 'left' && f >= o.at && f < o.at + o.dur);
  const temOverlayEmbaixo = falando.length > 0 || c.over.some((o) => (o.tipo === 'numero' || o.tipo === 'meme' || o.tipo === 'selo') && f >= o.at && f < o.at + o.dur);
  const flash = c.entrada ? 0 : interpolate(f, [0, 5], [0.45, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#050814'}}>
      <AbsoluteFill style={{transform: `${tremor ? `translate(${Math.sin(f * 2.7) * tremor}px, ${Math.cos(f * 3.3) * tremor}px) ` : ''}scale(${1 + soco})`}}>
        {!v ? <Jogo8 log={log} R={R} cam={c.cam} zoomDe={zoomDe} falas={falas} f={f} foco={c.foco} papeis={c.papeis} mascara={mascara} segredo={c.segredo} /> : null}
        {v?.tipo === 'reuniao' ? <Mesa log={log} idx={v.indice} f={f} dur={c.dur} fase="discussao" falando={falando} segredo={c.segredo} /> : null}
        {v?.tipo === 'votos' ? <Mesa log={log} idx={v.indice} f={f} dur={c.dur} fase="votos" falando={falando} segredo={c.segredo} temBalao={falando.length > 0} ocupadoEmbaixo={temOverlayEmbaixo} /> : null}
        {v?.tipo === 'ejecao' ? <Ejecao log={log} idx={v.indice} f={f} dur={c.dur} /> : null}
        {v?.tipo === 'papeis' ? <Papeis lista={v.lista} titulo={v.titulo} f={f} dur={c.dur} /> : null}
        {v?.tipo === 'elenco' ? <Elenco log={elenco} f={f} dur={c.dur} titulo={v.titulo} destaques={v.destaques} nota={v.nota} /> : null}
        {v?.tipo === 'placar' ? <Placar titulo={v.titulo} linhas={v.linhas} f={f} dur={c.dur} /> : null}
        {v?.tipo === 'encerramento' ? <Encerramento titulo={v.titulo} sub={v.sub} f={f} dur={c.dur} comMeme={temMemeAgora} /> : null}
        {v?.tipo === 'comentarios' ? <AbsoluteFill style={{background: '#0b1428'}}><AbsoluteFill style={{transform: `scale(${0.9 + 0.03 * clamp01(f / c.dur)})`}}><AU2Comentarios comentarios={v.comentarios} passo={Math.max(24, Math.floor((c.dur - 50) / Math.max(1, v.comentarios.length)))} /></AbsoluteFill></AbsoluteFill> : null}
      </AbsoluteFill>
      {!v && c.hud !== false ? (
        <>
          <Barra partida={log.partida} T={T} t={tq} limite={log.cfg.limite} />
          <Vivos t={tq} />
          <Feed eventos={log.eventos} T={T} segredo={c.segredo} f={f} fDe={R.fDe} esconder={temMemeAgora} />
        </>
      ) : null}
      {c.over.map((o, i) => (
        <Sequence key={i} from={o.at} durationInFrames={o.dur}>
          {o.tipo === 'fala' || o.tipo === 'pensa' || o.tipo === 'chat' ? <SeqBalao o={o} modelo={J[o.cor]?.modelo ?? ''} papel={c.segredo ? undefined : estadoDe(o.cor)?.papel} time={c.segredo ? undefined : estadoDe(o.cor)?.time} /> : null}
          {o.tipo === 'selo' ? <SeqSelo texto={o.texto} cor={o.cor} comMeme={c.over.some((m) => m.tipo === 'meme' && m.pos !== 'left' && m.at < o.at + o.dur && m.at + m.dur > o.at)} baixo={c.over.some((m) => m.tipo === 'numero' && m.at < o.at + o.dur && m.at + m.dur > o.at)} sobreVotos={ehVotos} temBalao={falando.length > 0} /> : null}
          {o.tipo === 'meme' ? (ehVotos ? <MemeCompacto info={o.info} dur={o.dur} modo="votos" /> : ehEncerramento ? <MemeCompacto info={o.info} dur={o.dur} modo="encerramento" /> : <MemeCard info={o.info} dur={o.dur} pos={o.pos} />) : null}
          {o.tipo === 'numero' ? <Numero8 texto={o.texto} sub={o.sub} dur={o.dur} sobreVotos={ehVotos} /> : null}
          {o.tipo === 'marco' ? <SeqCap titulo={o.titulo} sub={o.sub} dur={o.dur} /> : null}
          {o.tipo === 'fim' ? <SeqFim o={o} /> : null}
          {o.tipo === 'ideia' ? <SeqIdeia o={o} /> : null}
        </Sequence>
      ))}
      {c.audio.map((a, i) => (
        <Sequence key={`a${i}`} from={a.at}><Audio src={staticFile(a.src)} volume={a.vol ?? 1} /></Sequence>
      ))}
      {!v && (tq.sab === 'O2' || tq.sab === 'Sismografo') ? (
        <AbsoluteFill style={{pointerEvents: 'none', boxShadow: `inset 0 0 ${110 + Math.sin(f / 4.5) * 30}px rgba(220,24,38,${0.26 + 0.14 * Math.sin(f / 4.5)})`}} />
      ) : null}
      {c.segredo ? (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 14, background: 'linear-gradient(180deg, rgba(2,4,12,0.85), transparent)', pointerEvents: 'none'}} />
          <div style={{position: 'absolute', right: 28, bottom: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(10,14,28,0.84)', border: '2px solid rgba(192,132,252,0.65)', borderRadius: 10, padding: '4px 14px', fontFamily: "'Poppins', 'Inter', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: 2, color: '#e9d5ff', pointerEvents: 'none'}}>
            <span style={{width: 8, height: 8, borderRadius: 99, background: '#c084fc'}} />
            ABERTURA · SEM SPOILER
          </div>
        </>
      ) : null}
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
const SeqBalao: React.FC<{o: FalaOver; modelo: string; papel?: string; time?: string}> = ({o, modelo, papel, time}) => <Balao k={o.tipo} cor={o.cor} modelo={modelo} papel={papel} time={time} texto={o.texto} f={useCurrentFrame()} dur={o.dur} />;
const SeqSelo: React.FC<{texto: string; cor?: string; comMeme?: boolean; baixo?: boolean; sobreVotos?: boolean; temBalao?: boolean}> = ({texto, cor, comMeme, baixo, sobreVotos, temBalao}) => <Selo texto={texto} cor={cor} comMeme={comMeme} baixo={baixo} sobreVotos={sobreVotos} temBalao={temBalao} f={useCurrentFrame()} />;
const MemeCompacto: React.FC<{info: MemeInfo; dur: number; modo: 'votos' | 'encerramento'}> = ({info, dur, modo}) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [0, 7], [0.55, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outP = interpolate(f, [dur - 7, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ar = info.width / Math.max(1, info.height);
  const maxW = modo === 'votos' ? 380 : 410;
  const maxH = modo === 'votos' ? 248 : 340;
  let w = maxW, h = w / ar;
  if (h > maxH) { h = maxH; w = h * ar; }
  const posStyle: React.CSSProperties = modo === 'votos'
    ? {right: 40, bottom: 20}
    : {right: 54, top: Math.round((1080 - h) / 2) + 20};
  return (
    <div style={{position: 'absolute', ...posStyle, width: Math.round(w), height: Math.round(h), transform: `rotate(2.2deg) scale(${inP * outP})`, opacity: Math.min(1, f / 3) * outP, border: '8px solid #fff', borderRadius: 14, boxShadow: '0 20px 50px #000c', overflow: 'hidden', background: '#000', pointerEvents: 'none'}}>
      <Gif src={staticFile(`gifs/${info.file}`)} width={Math.round(w)} height={Math.round(h)} fit="cover" style={{width: '100%', height: '100%'}} />
    </div>
  );
};
const SeqCap: React.FC<{titulo: string; sub?: string; dur: number}> = ({titulo, sub, dur}) => <Capitulo titulo={titulo} sub={sub} f={useCurrentFrame()} dur={dur} />;
const SeqFim: React.FC<{o: {dur: number; titulo: string; sub?: string; cor?: string}}> = ({o}) => <FimPartida titulo={o.titulo} sub={o.sub} cor={o.cor} f={useCurrentFrame()} dur={o.dur} />;
const SeqIdeia: React.FC<{o: {dur: number; autor: string; oque?: string}}> = ({o}) => <Ideia autor={o.autor} oque={o.oque} f={useCurrentFrame()} dur={o.dur} />;
const SeqTrans: React.FC<{tipo: 'duto' | 'alarme' | 'o2'}> = ({tipo}) => <Transicao8 tipo={tipo} f={useCurrentFrame()} />;

export const AU8Video: React.FC<{tl: TL | null}> = ({tl}) => {
  const [logs, setLogs] = useState<Record<number, Log> | null>(null);
  const [h] = useState(() => delayRender('logs au8'));
  useEffect(() => {
    (async () => {
      const out: Record<number, Log> = {};
      for (const n of [1, 2, 3, 4]) out[n] = await (await fetch(staticFile(`au8/partida${n}.json`))).json();
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
      {tl.cenas.map((c, i) => <Sequence key={c.id} from={inicios[i]} durationInFrames={c.dur}><CenaView c={c} log={logs[c.partida]} elenco={logs[2]} /></Sequence>)}
      {/* transições próprias (grade de duto / faixa de alarme) por cima do corte: o corte cai no quadro 22 */}
      {tl.cenas.map((c, i) => (c.entrada ? <Sequence key={`t${c.id}`} from={Math.max(0, inicios[i] - 22)} durationInFrames={DUR_TRANS8}><SeqTrans tipo={c.entrada} /></Sequence> : null))}
    </AbsoluteFill>
  );
};
