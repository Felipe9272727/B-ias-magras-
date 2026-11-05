// AMONG IA 6 — Especial de Halloween (modo zumbi). Lê public/timeline_zumbi.json (gerada por
// video/scripts/build_timeline_zumbi.py a partir do roteiro) e os logs das partidas (public/zumbi/partidaN.json).
// Cada cena mostra uma partida a partir do tique t0, andando vel tiques por quadro, com a câmera pedida; por cima, a
// interface (placar, rádio, relógio) e os itens do roteiro (fala por proximidade, pensamento, selo, meme, número,
// capítulo). Soco de zoom em selo/meme/número e tremida no número, como no padrão aprovado (AGE v4).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame, type CalculateMetadataFunction} from 'remotion';
import {Numero} from '../age/Extras';
import {MemeCard, type MemeInfo} from '../components/overlays';
import {AU2Comentarios, type Comentario} from '../amongus3/Comentarios';
import {Jogo, type Cam, type Log} from './Jogo';
import {Capitulo, Fala, Pensamento, Placar, Relogio} from './HudZumbi';

type Over =
  | {tipo: 'fala' | 'pensa'; at: number; dur: number; cor: string; texto: string}
  | {tipo: 'selo'; at: number; dur: number; texto: string; cor?: string}
  | {tipo: 'meme'; at: number; dur: number; id: string; pos: string; info: MemeInfo}
  | {tipo: 'numero'; at: number; dur: number; texto: string; sub?: string}
  | {tipo: 'marco'; at: number; dur: number; titulo: string; sub?: string};
type Cena = {id: string; dur: number; partida: number; t0: number; vel: number; cam: Cam; foco?: string; hud?: boolean; over: Over[]; audio: {src: string; at: number; vol?: number}[]; visual?: string; comentarios?: Comentario[]};
type TL = {cenas: Cena[]};

export const calcZumbi: CalculateMetadataFunction<{tl: TL | null}> = async () => {
  const tl = await (await fetch(staticFile('timeline_zumbi.json'))).json();
  return {durationInFrames: tl.cenas.reduce((a: number, c: Cena) => a + c.dur, 0), props: {tl}};
};

const CenaView: React.FC<{c: Cena; log: Log}> = ({c, log}) => {
  const f = useCurrentFrame();
  const T = c.t0 + f * c.vel;
  let soco = 0, tremor = 0;
  for (const o of c.over) {
    const d = f - o.at;
    if (d >= 0 && d < 12 && (o.tipo === 'selo' || o.tipo === 'meme' || o.tipo === 'numero')) soco = Math.max(soco, 0.06 * (1 - d / 12));
    if (d >= 0 && d < 14 && o.tipo === 'numero') tremor = Math.max(tremor, 12 * (1 - d / 14));
  }
  // deriva lenta em toda cena (nada de tela parada) + soco
  const k = c.dur > 1 ? f / (c.dur - 1) : 0;
  const zoom = (c.cam.zoom ?? (c.cam.mapa ? 1 : 1.6)) * (1 + 0.07 * k * k * (3 - 2 * k)) * (1 + soco);
  const tq = log.tiques[Math.max(0, Math.min(log.tiques.length - 1, Math.ceil(T) - 1))];
  const J = Object.fromEntries(log.jogadores.map((j) => [j.cor, j]));
  const estadoDe = (cor: string) => tq.estados.find((e) => e.cor === cor)?.estado;
  const salaDe = (cor: string) => {
    const s = tq.estados.find((e) => e.cor === cor)?.sala;
    return s ? ({Lancamento: 'Lançamento', Comunicacoes: 'Comunicações', Vestiario: 'Vestiário', Descontaminacao: 'Descontaminação', Laboratorio: 'Laboratório', Escritorio: 'Escritório', Refeitorio: 'Refeitório', Deposito: 'Depósito'} as Record<string, string>)[s] ?? s : undefined;
  };
  const flash = interpolate(f, [0, 5], [0.5, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: tremor ? `translate(${Math.sin(f * 2.7) * tremor}px, ${Math.cos(f * 3.3) * tremor}px)` : undefined}}>
        <Jogo log={log} T={T} cam={{...c.cam, zoom}} f={f} foco={c.foco} />
      </AbsoluteFill>
      {c.visual === 'comentarios' && c.comentarios ? <AbsoluteFill style={{background: '#000a', transform: 'scale(0.92)'}}><AU2Comentarios comentarios={c.comentarios} passo={45} /></AbsoluteFill> : null}
      {c.hud !== false ? (
        <>
          <Placar t={tq} f={f} />
          <Relogio T={T} t={tq} meta={log.cfg.radioMeta} amanhecer={log.cfg.amanhecer} />
        </>
      ) : null}
      {c.over.map((o, i) => (
        <Sequence key={i} from={o.at} durationInFrames={o.dur}>
          {o.tipo === 'fala' ? <SeqF k="fala" o={o} modelo={J[o.cor]?.modelo ?? ''} estado={estadoDe(o.cor)} sala={salaDe(o.cor)} /> : null}
          {o.tipo === 'pensa' ? <SeqF k="pensa" o={o} modelo={J[o.cor]?.modelo ?? ''} estado={estadoDe(o.cor)} /> : null}
          {o.tipo === 'selo' ? <SeqSelo texto={o.texto} cor={o.cor} /> : null}
          {o.tipo === 'meme' ? <MemeCard info={o.info} dur={o.dur} pos={o.pos} /> : null}
          {o.tipo === 'numero' ? <Numero texto={o.texto} sub={o.sub} dur={o.dur} /> : null}
          {o.tipo === 'marco' ? <SeqCap titulo={o.titulo} sub={o.sub} /> : null}
        </Sequence>
      ))}
      {c.audio.map((a, i) => (
        <Sequence key={`a${i}`} from={a.at}><Audio src={staticFile(a.src)} volume={a.vol ?? 1} /></Sequence>
      ))}
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

const SeqF: React.FC<{k: 'fala' | 'pensa'; o: {cor: string; texto: string; dur: number}; modelo: string; estado?: string; sala?: string}> = ({k, o, modelo, estado, sala}) => {
  const f = useCurrentFrame();
  return k === 'fala' ? <Fala cor={o.cor} modelo={modelo} texto={o.texto} f={f} dur={o.dur} sala={sala} estado={estado} /> : <Pensamento cor={o.cor} modelo={modelo} texto={o.texto} f={f} dur={o.dur} estado={estado} />;
};
// selo centralizado, fonte menor quando o texto é longo (o do AGE ficava cortado na borda com texto comprido)
const SeqSelo: React.FC<{texto: string; cor?: string}> = ({texto, cor = '#e8701a'}) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 6], [2.4, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fs = texto.length > 34 ? 40 : texto.length > 22 ? 50 : 64;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center'}}>
      <div style={{fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: fs, color: '#fff', background: cor, border: '7px solid #fff', maxWidth: 1500, textAlign: 'center', borderRadius: 16, padding: '4px 34px', transform: `rotate(-5deg) scale(${e})`, opacity: interpolate(f, [0, 3], [0, 1], {extrapolateRight: 'clamp'}), boxShadow: '0 12px 0 #0008', WebkitTextStroke: '3px #000', paintOrder: 'stroke fill'}}>{texto}</div>
    </div>
  );
};
const SeqCap: React.FC<{titulo: string; sub?: string}> = ({titulo, sub}) => <Capitulo titulo={titulo} sub={sub} f={useCurrentFrame()} />;

export const ZumbiVideo: React.FC<{tl: TL | null}> = ({tl}) => {
  const [logs, setLogs] = useState<Record<number, Log> | null>(null);
  const [h] = useState(() => delayRender('logs zumbi'));
  useEffect(() => {
    (async () => {
      const out: Record<number, Log> = {};
      for (const n of [1, 2, 3]) out[n] = await (await fetch(staticFile(`zumbi/partida${n}.json`))).json();
      setLogs(out);
      continueRender(h);
    })();
  }, [h]);
  if (!tl || !logs) return null;
  let ini = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {tl.cenas.map((c) => {
        const de = ini;
        ini += c.dur;
        return <Sequence key={c.id} from={de} durationInFrames={c.dur}><CenaView c={c} log={logs[c.partida]} /></Sequence>;
      })}
    </AbsoluteFill>
  );
};
