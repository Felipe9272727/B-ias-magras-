// As cenas do "Interrogatório das IAs" (roteiro/roteiro_int.py → timeline_int.json). A arte (sala, personagens, HUD)
// é dos Haikus; aqui ela é ligada ao log de cada caso (timeline.data.casos[caso], de interrogatorio/logs/<caso>.json):
// quem está falando, a expressão e o gesto que a própria IA escolheu, e o estresse/BPM que o suspeito informou.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Scene, Timeline} from '../types';
import {FONT} from '../theme';
import {ASSENTO, SalaInterrogatorio} from './Sala';
import {IAS, Personagem, type Expressao, type IA} from './Personagens';
import {Carimbo, Contador, Fala, MonitorEstresse, PastaCaso, PensamentoSecreto, Placa} from './Hud';

type Ent = {quem: 'detetive' | 'suspeito'; k: number; fala: string; pensamento?: string; estresse?: number; bpm?: number; expressao?: string; gesto?: string};
type Log = {caso: {id: string; detetive: IA; suspeito: IA; culpado: boolean; titulo: string; local: string; hora: string; pistas: string[]}; historico: Ent[]; fim: {tipo: string; k: number}; acertou: boolean};
type Item = {cor: IA; texto: string; at: number; ate: number; pensa?: boolean};

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const EXPR: Expressao[] = ['neutro', 'confiante', 'nervoso', 'suando', 'bravo', 'chocado', 'rindo', 'pensando', 'culpado', 'desconfiado'];
const ex = (e?: string, pad: Expressao = 'neutro'): Expressao => (EXPR.includes(e as Expressao) ? (e as Expressao) : pad);
const GESTOS = ['nenhuma', 'bater_mesa', 'apontar', 'cruzar_bracos', 'mao_no_queixo'] as const;
const ge = (g?: string) => (GESTOS.includes(g as never) ? (g as (typeof GESTOS)[number]) : 'nenhuma');
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9à-ú]/g, '');

// o item do chat → a entrada do log (pela fala, ou pelo pensamento se for 'pensa')
const achar = (L: Log, it: Item): Ent | undefined => {
  const papel = it.cor === L.caso.detetive ? 'detetive' : 'suspeito';
  const alvo = norm(it.texto).slice(0, 40);
  return L.historico.find((x) => x.quem === papel && norm((it.pensa ? x.pensamento : x.fala) ?? '').includes(alvo));
};

// gatilhos: quadro (na cena) em que o narrador fala cada termo, um depois do outro
const semAcento = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9-]/g, '');
const gatilhos = (scene: Scene, termos: string[]): number[] => {
  const ws = (scene.words ?? []) as {w: string; s: number}[];
  let k = 0;
  return termos.map((t) => {
    const alvo = semAcento(t);
    for (let i = k; i < ws.length; i++) if (semAcento(ws[i].w).startsWith(alvo)) { k = i + 1; return ws[i].s }
    return -1;
  });
};

const Boneco: React.FC<{ia: IA; papel: 'detetive' | 'suspeito'; expressao: Expressao; falando: boolean; estresse: number; acao: (typeof GESTOS)[number]; t: number}> = ({ia, papel, expressao, falando, estresse, acao, t}) => (
  <div style={{position: 'absolute', left: ASSENTO.altura / 2, top: ASSENTO.altura}}>
    <Personagem ia={ia} expressao={expressao} falando={falando} t={t} virado={papel === 'detetive' ? 'direita' : 'esquerda'} altura={ASSENTO.altura} estresse={estresse} acao={acao} />
  </div>
);

// ---------------------------------------------------------------- a sala, durante o interrogatório
export const INTSala: React.FC<{L: Log; chat: Item[]; carimbo?: string; demo?: boolean}> = ({L, chat, carimbo, demo}) => {
  const f = useCurrentFrame();
  const {durationInFrames: D} = useVideoConfig();
  const det = L.caso.detetive, sus = L.caso.suspeito;
  const ents = chat.map((it) => ({it, e: achar(L, it)}));
  const agora = (q: number) => ents.find(({it}) => q >= it.at && q <= it.ate + 4);
  // estresse/BPM: a última resposta do suspeito que já foi dita; antes disso, a anterior no log
  const primeiro = ents.find(({e}) => e)?.e;
  const base = L.historico.filter((x) => x.quem === 'suspeito' && x.k < (primeiro?.k ?? 1)).pop();
  const leit = (q: number) => {
    let v = {e: base?.estresse ?? (L.caso.culpado ? 35 : 30), bpm: base?.bpm ?? 90, at: -99};
    for (const {it, e} of ents) if (e && e.quem === 'suspeito' && e.estresse != null && q >= it.at + 10) v = {e: e.estresse, bpm: e.bpm ?? 90, at: it.at + 10};
    return v;
  };
  let estresse: number, bpm: number;
  if (demo) {
    estresse = interpolate(f, [20, D - 30], [32, 100], cl);
    bpm = Math.round(68 + estresse * 0.85);
  } else {
    const a = leit(f), antes = leit(a.at - 1);
    const k = interpolate(f, [a.at, a.at + 24], [0, 1], cl);
    estresse = antes.e + (a.e - antes.e) * k;
    bpm = Math.round(antes.bpm + (a.bpm - antes.bpm) * k);
  }
  // câmera: vai até quem está falando (média dos últimos 14 quadros, para não dar tranco)
  let cx = 0, cz = 0;
  for (let i = 0; i < 14; i++) {
    const q = f - i;
    const fa = demo ? {it: {cor: sus}} : agora(q);
    const alvo = !fa ? 0 : fa.it.cor === det ? -0.55 : 0.55;
    cx += alvo; cz += fa ? 1.28 : 1.05;
  }
  cx /= 14; cz /= 14;
  // expressão e gesto: de quem fala, os da própria fala; do outro, os da última fala dele
  const ult = (papel: 'detetive' | 'suspeito') => {
    let e: Ent | undefined = L.historico.filter((x) => x.quem === papel && x.k < (primeiro?.k ?? 1)).pop();
    for (const {it, e: en} of ents) if (en && en.quem === papel && f >= it.at && !it.pensa) e = en;
    return e;
  };
  const fa = demo ? undefined : agora(f);
  const ed = ult('detetive'), es = ult('suspeito');
  const tCarimbo = 8;
  const tremor = carimbo ? interpolate(f, [tCarimbo + 6, tCarimbo + 22], [1, 0], cl) : estresse > 95 ? 0.12 : 0;
  const luz = estresse > 90 ? 0.78 + 0.22 * Math.abs(Math.sin(f / 5)) : 1;
  const nDet = Math.max(1, ...ents.filter(({e}) => e?.quem === 'detetive' && f >= 0).map(({e}) => e!.k), ed?.k ?? 1);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <SalaInterrogatorio
        camera={{x: cx, zoom: cz}}
        relogio={L.caso.hora}
        luz={luz}
        tremor={tremor}
        monitor={<MonitorEstresse estresse={estresse} bpm={bpm} t={f} largura={360} altura={220} />}
        detetive={<Boneco ia={det} papel="detetive" t={f} estresse={0.08}
          expressao={ex(fa && fa.it.cor === det && !fa.it.pensa ? fa.e?.expressao : ed?.expressao, 'desconfiado')}
          falando={!!fa && fa.it.cor === det && !fa.it.pensa} acao={ge(fa && fa.it.cor === det ? fa.e?.gesto : ed?.gesto)} />}
        suspeito={<Boneco ia={sus} papel="suspeito" t={f + 37} estresse={demo ? estresse / 100 : estresse / 100}
          expressao={demo ? (estresse > 85 ? 'suando' : estresse > 60 ? 'nervoso' : 'neutro') : ex(fa && fa.it.cor === sus && !fa.it.pensa ? fa.e?.expressao : es?.expressao, 'nervoso')}
          falando={!!fa && fa.it.cor === sus && !fa.it.pensa} acao={ge(fa && fa.it.cor === sus ? fa.e?.gesto : es?.gesto)} />}
      />
      {/* sinais vitais grandes no canto, para dar pra ler no celular */}
      <div style={{position: 'absolute', left: 24, top: 24}}><MonitorEstresse estresse={estresse} bpm={bpm} t={f} largura={330} altura={200} /></div>
      {!demo && <Contador n={Math.min(15, nDet)} total={15} />}
      <Placa nome={IAS[det].nome} papel="DETETIVE" cor={IAS[det].cor} at={2} lado="esquerda" />
      <Placa nome={IAS[sus].nome} papel="SUSPEITO" cor={IAS[sus].cor} at={6} lado="direita" />
      {chat.map((it, i) => {
        const lado = it.cor === det ? 'esquerda' : 'direita';
        const P = it.pensa ? PensamentoSecreto : Fala;
        return <P key={i} nome={IAS[it.cor].nome} cor={IAS[it.cor].cor} texto={it.texto} at={it.at} ate={it.ate} lado={lado} />;
      })}
      {carimbo && <Carimbo texto={carimbo} cor={carimbo === 'CONFESSOU!' ? '#e8202a' : carimbo === 'INOCENTE' ? '#1f8f3a' : '#e8202a'} at={tCarimbo} y={430} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- a pasta do caso
export const INTPasta: React.FC<{L: Log; ancoras: string[]; scene: Scene}> = ({L, ancoras, scene}) => {
  const f = useCurrentFrame();
  const ts = gatilhos(scene, ancoras);
  const pistas = L.caso.pistas.map((texto, i) => ({texto, at: ts[i] >= 0 ? ts[i] : 40 + i * 60}));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{filter: 'blur(10px) brightness(0.45)'}}>
        <SalaInterrogatorio camera={{x: 0, zoom: 1.05}} relogio={L.caso.hora}
          detetive={<Boneco ia={L.caso.detetive} papel="detetive" t={f} estresse={0} expressao="pensando" falando={false} acao="mao_no_queixo" />}
          suspeito={<Boneco ia={L.caso.suspeito} papel="suspeito" t={f} estresse={0.3} expressao="nervoso" falando={false} acao="nenhuma" />} />
      </AbsoluteFill>
      <PastaCaso titulo={L.caso.titulo} local={L.caso.local} hora={L.caso.hora} pistas={pistas} abre={12} t={f} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- capa do caso (detetive x suspeito)
export const INTCapa: React.FC<{L: Log; n: number}> = ({L, n}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = (d: number) => spring({frame: f - d, fps, config: {damping: 12, stiffness: 160}});
  const lado = (ia: IA, papel: 'detetive' | 'suspeito', d: number) => (
    <div style={{position: 'absolute', left: papel === 'detetive' ? 260 : 1200, top: 300, width: 460, height: 600, transform: `translateX(${(1 - s(d)) * (papel === 'detetive' ? -700 : 700)}px)`}}>
      <div style={{position: 'absolute', left: 0, top: 0}}>
        <Boneco ia={ia} papel={papel} t={f} estresse={papel === 'suspeito' ? 0.4 : 0} expressao={papel === 'detetive' ? 'confiante' : 'nervoso'} falando={false} acao={papel === 'detetive' ? 'cruzar_bracos' : 'nenhuma'} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center', fontFamily: FONT.comic, fontSize: 64, color: IAS[ia].cor, WebkitTextStroke: '3px #000', letterSpacing: 2}}>{IAS[ia].nome}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 552, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 28, color: '#fff', letterSpacing: 6}}>{papel.toUpperCase()}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #3a2a12 0%, #15100a 55%, #000 100%)', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: `repeating-linear-gradient(90deg, transparent 0 120px, rgba(255,210,31,${0.05 + 0.03 * Math.sin(f / 10)}) 120px 124px)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 50, textAlign: 'center', transform: `scale(${s(0)})`}}>
        <div style={{display: 'inline-block', padding: '6px 30px', background: '#ffd21f', border: '6px solid #000', borderRadius: 14, fontFamily: FONT.comic, fontSize: 60, letterSpacing: 4, transform: 'rotate(-3deg)'}}>CASO {n}</div>
        <div style={{marginTop: 18, fontFamily: FONT.comic, fontSize: 104, color: '#fff', WebkitTextStroke: '4px #000', textShadow: '0 8px 0 #000', letterSpacing: 2}}>{L.caso.titulo.toUpperCase()}</div>
      </div>
      {lado(L.caso.detetive, 'detetive', 10)}
      {lado(L.caso.suspeito, 'suspeito', 18)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: FONT.comic, fontSize: 150, color: '#ff3b3b', WebkitTextStroke: '6px #000', transform: `scale(${s(26) * (1 + 0.04 * Math.sin(f / 4))}) rotate(-6deg)`}}>VS</div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- a verdade
export const INTVerdade: React.FC<{L: Log; scene: Scene}> = ({L, scene}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [tAc] = gatilhos(scene, [L.acertou ? 'acertou' : 'errou']);
  const k = spring({frame: f - 6, fps, config: {damping: 13, stiffness: 150}});
  const sus = L.caso.suspeito;
  return (
    <AbsoluteFill style={{background: L.caso.culpado ? 'radial-gradient(circle at 50% 45%, #5a1010 0%, #1a0505 60%, #000 100%)' : 'radial-gradient(circle at 50% 45%, #10502a 0%, #05180c 60%, #000 100%)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', fontFamily: FONT.comic, fontSize: 120, color: '#ffd21f', WebkitTextStroke: '5px #000', letterSpacing: 6, transform: `scale(${k})`}}>A VERDADE</div>
      <div style={{position: 'absolute', left: 960 - 260, top: 260, width: 520, height: 600}}>
        <div style={{position: 'absolute', left: 30, top: 0}}>
          <Boneco ia={sus} papel="suspeito" t={f} estresse={0} expressao={L.caso.culpado ? 'culpado' : 'chocado'} falando={false} acao={L.caso.culpado ? 'nenhuma' : 'apontar'} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center'}}>
        <span style={{display: 'inline-block', padding: '10px 40px', background: L.caso.culpado ? '#e8202a' : '#1f8f3a', border: '7px solid #000', borderRadius: 18, fontFamily: FONT.comic, fontSize: 78, color: '#fff', letterSpacing: 3, WebkitTextStroke: '2px #000', transform: `rotate(-2deg) scale(${spring({frame: f - 20, fps, config: {damping: 10}})})`}}>
          {IAS[sus].nome.toUpperCase()} ERA {L.caso.culpado ? 'CULPADO' : 'INOCENTE'}
        </span>
      </div>
      {tAc >= 0 && <Carimbo texto={L.acertou ? 'ACERTOU' : 'ERROU'} cor={L.acertou ? '#1f8f3a' : '#e8202a'} at={tAc} x={1500} y={300} rot={10} />}
      {tAc >= 0 && <div style={{position: 'absolute', left: 1300, top: 400, width: 420, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 34, color: '#fff', opacity: interpolate(f, [tAc + 6, tAc + 14], [0, 1], cl)}}>detetive: {IAS[L.caso.detetive].nome}</div>}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- comentário do Cafezin (a ideia)
export const INTComentario: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = spring({frame: f, fps, config: {damping: 13, stiffness: 140}});
  const txt = 'Mano muito bom, seria interessante se você fizesse um jogo de investigação estilo patrick jane, onde uma empresa de IA deve ser o que vai interrogar e fazer o culpado assumir o que fez, e também uma empresa de outra IA que vai ser a culpada do caso e vai ter que mentir e não ser pega...';
  const chars = Math.round(interpolate(f, [10, 200], [0, txt.length], cl));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#141821, #07090d)', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 1400, padding: '40px 50px', background: '#fff', borderRadius: 30, border: '6px solid #000', boxShadow: '0 20px 0 #000a', transform: `scale(${0.7 + 0.3 * k}) rotate(-1deg)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
          <div style={{width: 90, height: 90, borderRadius: 45, background: 'linear-gradient(135deg,#6b3a1f,#d98a4a)', border: '4px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50}}>☕</div>
          <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 40, color: '#111'}}>@CAFEZIN-K</div>
        </div>
        <div style={{marginTop: 24, fontFamily: FONT.display, fontWeight: 600, fontSize: 40, lineHeight: 1.35, color: '#222', minHeight: 330}}>{txt.slice(0, chars)}</div>
        <div style={{marginTop: 10, fontFamily: FONT.display, fontWeight: 800, fontSize: 32, color: '#c81e1e'}}>❤️ ideia aceita</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- os suspeitos de sempre (parede de reconhecimento)
const ORDEM_IAS: IA[] = ['gpt', 'claude', 'deepseek', 'glm', 'minimax', 'qwen'];
export const INTElenco: React.FC<{fim?: boolean}> = ({fim}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: '#2b3040', overflow: 'hidden'}}>
      {/* régua de altura */}
      {Array.from({length: 9}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: 0, right: 0, top: 120 + i * 90, borderTop: `${i % 2 ? 3 : 6}px solid #ffffff${i % 2 ? '33' : '66'}`}}>
          <span style={{position: 'absolute', left: 20, top: -34, fontFamily: FONT.mono, fontWeight: 700, fontSize: 26, color: '#ffffff99'}}>{(2.1 - i * 0.15).toFixed(2)} m</span>
        </div>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: FONT.comic, fontSize: 84, color: '#ffd21f', WebkitTextStroke: '4px #000', letterSpacing: 4}}>{fim ? 'ATÉ O PRÓXIMO INTERROGATÓRIO' : 'OS SUSPEITOS DE SEMPRE'}</div>
      {ORDEM_IAS.map((ia, i) => {
        const s = spring({frame: f - 8 - i * 7, fps, config: {damping: 12, stiffness: 170}});
        const x = 160 + i * 320;
        return (
          <div key={ia} style={{position: 'absolute', left: x - 160, top: 1080 - 230 - 420, width: 320, height: 640, transform: `translateY(${(1 - s) * 500}px)`}}>
            <div style={{position: 'absolute', left: 160, top: 430}}>
              <Personagem ia={ia} expressao={fim ? 'rindo' : (['confiante', 'nervoso', 'desconfiado', 'pensando', 'suando', 'culpado'] as Expressao[])[i]} falando={false} t={f + i * 13} altura={400} virado={i < 3 ? 'direita' : 'esquerda'} estresse={fim ? 0 : 0.3} />
            </div>
            <div style={{position: 'absolute', left: 40, right: 40, top: 445, padding: '6px 0', background: '#111', border: '4px solid #fff', borderRadius: 10, textAlign: 'center', fontFamily: FONT.mono, fontWeight: 700, fontSize: 24, color: '#fff', whiteSpace: 'nowrap'}}>
              Nº {i + 1} · {IAS[ia].nome}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- sala de espera entre os casos (até 5 s)
export const INTLobby: React.FC<{L: Log; proximo: number; chat: Item[]}> = ({L, proximo, chat}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames: D} = useVideoConfig();
  const entra = interpolate(f, [0, 9], [0, 1], cl);
  const sai = interpolate(f, [D - 8, D], [0, 1], cl);
  const resta = Math.max(1, Math.ceil(((D - f) / D) * 3));
  const quem: IA[] = [L.caso.suspeito, L.caso.detetive];
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{clipPath: `polygon(0 0, ${entra * 140}% 0, ${entra * 140 - 40}% 100%, 0 100%)`, transform: `scale(${1 + sai * 0.25})`}}>
        <AbsoluteFill style={{background: 'linear-gradient(#5b6a7a 0%, #46525f 62%, #2c333b 63%, #20262c 100%)'}} />
        {/* sala de espera: placa, banco, máquina de café e quadro de procurados */}
        <div style={{position: 'absolute', left: 60, top: 24, padding: '6px 26px', background: '#1b4d8c', border: '6px solid #0c1f38', borderRadius: 12, fontFamily: FONT.display, fontWeight: 900, fontSize: 40, color: '#fff', letterSpacing: 6}}>SALA DE ESPERA</div>
        <div style={{position: 'absolute', left: 120, top: 190, width: 200, height: 420, background: '#7a2a2a', border: '7px solid #1a0a0a', borderRadius: 16}}>
          <div style={{margin: 20, height: 140, background: '#111', borderRadius: 8, color: '#7fe08a', fontFamily: FONT.mono, fontSize: 22, padding: 10}}>CAFÉ ☕<br />R$ 2,00</div>
        </div>
        <div style={{position: 'absolute', left: 1500, top: 180, width: 300, height: 230, background: '#c9a46a', border: '7px solid #4a3216', borderRadius: 8, fontFamily: FONT.comic, fontSize: 34, textAlign: 'center', paddingTop: 10}}>PROCURADOS<div style={{fontSize: 80}}>🐟🎂📱</div></div>
        <div style={{position: 'absolute', left: 300, right: 300, top: 640, height: 40, background: '#6b4a2a', border: '6px solid #2a1a0a', borderRadius: 10}} />
        {quem.map((ia, i) => (
          <div key={ia} style={{position: 'absolute', left: i === 0 ? 700 : 1220, top: 760}}>
            <Personagem ia={ia} expressao={i === 0 ? (L.caso.culpado ? 'culpado' : 'bravo') : 'rindo'} falando={chat.some((c) => c.cor === ia && f >= c.at && f <= c.ate)} t={f + i * 20} altura={420} virado={i === 0 ? 'direita' : 'esquerda'} estresse={0} />
          </div>
        ))}
        {chat.map((m, i) => {
          if (f < m.at) return null;
          const s = spring({frame: f - m.at, fps, config: {damping: 11, stiffness: 180}});
          const sobe = interpolate(f, [chat[i + 1]?.at ?? 1e9, (chat[i + 1]?.at ?? 1e9) + 6], [0, 130], cl);
          const lado = m.cor === quem[0] ? -1 : 1;
          return (
            <div key={i} style={{position: 'absolute', left: 960 + lado * 260 - 330, top: 260 - sobe, width: 660, display: 'flex', justifyContent: 'center', transform: `scale(${s}) rotate(${lado * 2}deg)`}}>
              <div style={{padding: '14px 26px', background: '#fff', border: '6px solid #000', borderRadius: 28, fontFamily: FONT.display, fontWeight: 900, fontSize: 44, lineHeight: 1.1, color: '#111', textAlign: 'center', boxShadow: '0 8px 0 #000a', opacity: sobe > 0 ? 0.6 : 1}}>
                <div style={{fontSize: 24, color: IAS[m.cor].cor}}>{IAS[m.cor].nome}</div>
                {m.texto}
              </div>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: '50%', bottom: 36, transform: 'translateX(-50%)', padding: '10px 34px', background: '#ffd21f', border: '6px solid #000', borderRadius: 20, fontFamily: FONT.display, fontWeight: 900, fontSize: 46, color: '#000', whiteSpace: 'nowrap'}}>
          CASO {proximo} EM {resta}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: sai}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- placar final
export const INTPlacar: React.FC<{casos: Record<string, Log>; scene: Scene}> = ({casos, scene}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lista = Object.values(casos);
  const [tAc] = gatilhos(scene, ['acertaram']);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1a1030, #07050d)'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: FONT.comic, fontSize: 96, color: '#ffd21f', WebkitTextStroke: '4px #000'}}>PLACAR FINAL</div>
      {ORDEM_IAS.map((ia, i) => {
        const comoDet = lista.find((L) => L.caso.detetive === ia);
        const comoSus = lista.find((L) => L.caso.suspeito === ia);
        const s = spring({frame: f - 10 - i * 8, fps, config: {damping: 13}});
        const sus = !comoSus ? '' : comoSus.fim.tipo === 'confissao' || (comoSus.historico.some((x) => x.confessou) && comoSus.caso.culpado) ? 'CONFESSOU' : comoSus.caso.culpado ? 'NEGOU ATÉ O FIM' : 'INOCENTE CONDENADO';
        return (
          <div key={ia} style={{position: 'absolute', left: 160, right: 160, top: 180 + i * 140, height: 120, display: 'flex', alignItems: 'center', gap: 30, background: '#ffffff12', border: `5px solid ${IAS[ia].cor}`, borderRadius: 24, padding: '0 30px', transform: `translateX(${(1 - s) * -1800}px)`}}>
            <div style={{position: 'relative', width: 120, height: 120}}><div style={{position: 'absolute', left: 60, top: 118}}><Personagem ia={ia} expressao={comoDet?.acertou ? 'confiante' : 'culpado'} falando={false} t={f + i * 9} altura={130} /></div></div>
            <div style={{width: 260, fontFamily: FONT.comic, fontSize: 60, color: IAS[ia].cor, WebkitTextStroke: '2px #000'}}>{IAS[ia].nome}</div>
            <div style={{flex: 1, fontFamily: FONT.display, fontWeight: 900, fontSize: 36, color: '#fff'}}>
              detetive: <span style={{color: comoDet?.acertou ? '#5ff08a' : '#ff6060', opacity: f >= tAc ? 1 : 0}}>{comoDet?.acertou ? '✅ ACERTOU' : '❌ ERROU'}</span>
            </div>
            <div style={{flex: 1, fontFamily: FONT.display, fontWeight: 900, fontSize: 36, color: '#fff'}}>suspeito: <span style={{color: '#ffd21f'}}>{sus}</span></div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- liga os nomes do roteiro aos componentes
export const INTVisual: React.FC<{name: string; props: Record<string, any>; scene: Scene; timeline: Timeline}> = ({name, props: p, scene, timeline}) => {
  const casos = (timeline.data as any).casos as Record<string, Log>;
  const L = casos[p.caso];
  switch (name) {
    case 'INTSala': return <INTSala L={L} chat={(p.chat ?? []) as Item[]} carimbo={p.carimbo} demo={p.demo} />;
    case 'INTPasta': return <INTPasta L={L} ancoras={p.ancoras ?? []} scene={scene} />;
    case 'INTCapa': return <INTCapa L={L} n={p.n} />;
    case 'INTVerdade': return <INTVerdade L={L} scene={scene} />;
    case 'INTComentario': return <INTComentario />;
    case 'INTElenco': return <INTElenco fim={p.fim} />;
    case 'INTLobby': return <INTLobby L={L} proximo={p.proximo} chat={(p.chat ?? []) as Item[]} />;
    case 'INTPlacar': return <INTPlacar casos={casos} scene={scene} />;
    default: return <AbsoluteFill style={{background: '#300'}} />;
  }
};
