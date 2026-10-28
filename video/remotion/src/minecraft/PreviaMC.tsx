// Prévia (2 min) do vídeo do Minecraft: 6 IAs sobrevivendo 3 horas num servidor oficial 1.21.4, depois arena.
// As cenas 3D são o replay da gravação (minecraft/replay.mjs, texturas oficiais). A montagem (falas, tempos, mortes)
// vem de scripts/previa_mc.py -> public/mc_previa/previa.json: narrador + as vozes das IAs (pensamento com eco), tudo
// copiado de minecraft/gravacoes/partida1/eventos_*.jsonl. Por cima: etiqueta da IA (cabeça da skin), pensamento em
// cartão, chat no estilo do jogo, e na morte a imagem congela, fica cinza, e entram o selo, o aviso do servidor e um meme.
// Sem emoji (regra do canal): ícones em SVG/CSS.
import React, {useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, Audio, continueRender, delayRender, Freeze, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';

const FPS = 30;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const IAS: Record<string, {modelo: string; cor: string}> = {
  DeepSeek: {modelo: 'DeepSeek V4.1 Flash', cor: '#4d6bfe'},
  Qwen: {modelo: 'Qwen 3.8 27B', cor: '#8b6cff'},
  Claude: {modelo: 'Claude Sonnet 5.5', cor: '#d97757'},
  GPT: {modelo: 'GPT-5.6 Luna', cor: '#10a37f'},
  GLM: {modelo: 'GLM 5.3 Flash', cor: '#3d7bff'},
  MiMo: {modelo: 'MiMo V2.6 Flash', cor: '#ff6900'},
};

type Palavra = {w: string; s: number; e: number};
type Aud = {src: string; at: number; dur: number; tipo: 'n' | 'chat' | 'pensa'; texto: string; palavras: Palavra[]};
type Cena = {id: string; quem: string | null; titulo?: string | null; meme?: string | null; t0?: number; video?: number; dur: number; audios: Aud[]; morte?: {at: number; selo: string; texto: string}};
type Dados = {cenas: Cena[]};

// placar de mortes nas 3 horas de sobrevivência (mensagens de morte do servidor até 10800 s)
const PLACAR: [string, number][] = [['Qwen', 5], ['GPT', 5], ['GLM', 4], ['DeepSeek', 1], ['MiMo', 1], ['Claude', 1]];
// som extra de cada morte (além do estrondo)
const SOM_MORTE: Record<string, string> = {c2: 'sfx/sad-trombone.mp3', c3: 'sfx/explosion.mp3', c4: 'sfx/wrong-buzzer.mp3', c7: 'sfx/fail-piano.mp3'};

export const calcPreviaMC: CalculateMetadataFunction<{dados: Dados | null}> = async () => {
  const d: Dados = await (await fetch(staticFile('mc_previa/previa.json'))).json();
  return {durationInFrames: d.cenas.reduce((a, c) => a + c.dur, 0), props: {dados: d}};
};

// cabeça da skin (8x8 em 8,8 do PNG 64x64, mais a camada do chapéu em 40,8), pixelada
const Cabeca: React.FC<{nome: string; tam: number}> = ({nome, tam}) => (
  <div style={{width: tam, height: tam, overflow: 'hidden', position: 'relative', border: `${Math.max(3, Math.round(tam / 16))}px solid #000`, boxSizing: 'content-box', flexShrink: 0}}>
    <Img src={staticFile(`mc_previa/skins/${nome}.png`)} style={{position: 'absolute', width: tam * 8, height: tam * 8, left: -tam, top: -tam, imageRendering: 'pixelated'}} />
    <Img src={staticFile(`mc_previa/skins/${nome}.png`)} style={{position: 'absolute', width: tam * 8, height: tam * 8, left: -tam * 5, top: -tam, imageRendering: 'pixelated'}} />
  </div>
);

const Etiqueta: React.FC<{quem: string}> = ({quem}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f - 3, fps: FPS, config: {damping: 14}});
  const ia = IAS[quem];
  return (
    <div style={{position: 'absolute', left: 40, top: 36, display: 'flex', alignItems: 'center', gap: 18, transform: `translateX(${(1 - e) * -480}px)`}}>
      <Cabeca nome={quem} tam={84} />
      <div style={{background: 'rgba(0,0,0,0.72)', padding: '10px 22px', borderLeft: `8px solid ${ia.cor}`}}>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 46, color: '#fff', lineHeight: 1}}>{quem}</div>
        <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 26, color: ia.cor, marginTop: 4}}>{ia.modelo}</div>
      </div>
    </div>
  );
};

// quanto do texto já foi falado (pelas palavras do TTS; sem elas, proporcional ao tempo)
function falado(a: Aud, f: number) {
  const t = f / FPS;
  const ws = a.texto.split(' ');
  if (a.palavras.length === ws.length) return ws.slice(0, Math.max(1, a.palavras.filter((p) => p.s <= t).length)).join(' ');
  return a.texto.slice(0, Math.max(1, Math.round((a.texto.length * t) / Math.max(0.5, a.dur * 0.92))));
}

// pensamento: cartão com borda tracejada (nuvem), cabeça e o texto acompanhando a voz (com eco)
const Pensa: React.FC<{quem: string; a: Aud; ate: number}> = ({quem, a, ate}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f, fps: FPS, config: {damping: 13}});
  const sai = interpolate(f, [ate - 7, ate], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 250, right: 250, bottom: 54, opacity: sai, transform: `scale(${0.85 + e * 0.15}) translateY(${(1 - e) * 60}px)`}}>
      <div style={{background: 'rgba(255,255,255,0.96)', border: '6px dashed #5b5b8f', borderRadius: 40, padding: '22px 34px', display: 'flex', gap: 22, alignItems: 'flex-start', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
        <Cabeca nome={quem} tam={64} />
        <div>
          <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: '#5b5b8f', letterSpacing: 1}}>{quem.toUpperCase()} PENSOU</div>
          <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 36, color: '#1c1c2a', lineHeight: 1.25, marginTop: 4}}>{falado(a, f)}</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 60, top: -34, width: 26, height: 26, borderRadius: 13, background: '#fff', border: '4px dashed #5b5b8f'}} />
      <div style={{position: 'absolute', left: 36, top: -66, width: 16, height: 16, borderRadius: 8, background: '#fff', border: '3px dashed #5b5b8f'}} />
    </div>
  );
};

// chat do jogo: fundo escuro translúcido, "<Nome> mensagem", letra de jogo
const Chat: React.FC<{quem: string; a: Aud; ate: number}> = ({quem, a, ate}) => {
  const f = useCurrentFrame();
  const sai = interpolate(f, [ate - 7, ate], [1, 0], cl);
  const e = spring({frame: f, fps: FPS, config: {damping: 15}});
  return (
    <div style={{position: 'absolute', left: 40, bottom: 120, maxWidth: 1300, opacity: sai, transform: `translateY(${(1 - e) * 40}px)`}}>
      <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: '#fff', background: IAS[quem].cor, display: 'inline-block', padding: '2px 12px', marginBottom: 6}}>CHAT DO SERVIDOR</div>
      <div style={{background: 'rgba(0,0,0,0.66)', padding: '12px 20px', fontFamily: FONT.pixel, fontSize: 25, color: '#fff', lineHeight: 1.6, textShadow: '3px 3px 0 #3f3f3f'}}>
        <span style={{color: IAS[quem].cor}}>{'<'}{quem}{'>'}</span> {falado(a, f)}
      </div>
    </div>
  );
};

// caveira em pixel (selo de morte)
const Caveira: React.FC<{tam: number}> = ({tam}) => (
  <svg width={tam} height={tam} viewBox="0 0 16 16" shapeRendering="crispEdges">
    <rect x="3" y="2" width="10" height="9" fill="#f2f2f2" />
    <rect x="2" y="4" width="12" height="5" fill="#f2f2f2" />
    <rect x="5" y="11" width="6" height="3" fill="#f2f2f2" />
    <rect x="4" y="6" width="3" height="3" fill="#111" />
    <rect x="9" y="6" width="3" height="3" fill="#111" />
    <rect x="7" y="9" width="2" height="2" fill="#111" />
    <rect x="6" y="12" width="1" height="2" fill="#111" />
    <rect x="9" y="12" width="1" height="2" fill="#111" />
  </svg>
);

const Morte: React.FC<{c: Cena}> = ({c}) => {
  const f = useCurrentFrame();
  const m = c.morte!;
  const e = spring({frame: f - 2, fps: FPS, config: {damping: 9, stiffness: 160}});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: '#ff1a1a', opacity: interpolate(f, [0, 3, 14], [0, 0.55, 0], cl)}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 40%, rgba(110,0,0,0.6) 100%)', opacity: interpolate(f, [0, 8], [0, 1], cl)}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${e}) rotate(${(1 - e) * -14 - 4}deg)`, display: 'flex', alignItems: 'center', gap: 26, background: '#b3121b', border: '8px solid #fff', padding: '16px 40px', boxShadow: '0 12px 0 rgba(0,0,0,0.4)'}}>
          <Caveira tam={110} />
          <div style={{fontFamily: FONT.comic, fontSize: 124, color: '#fff', letterSpacing: 4, lineHeight: 1}}>{m.selo}</div>
        </div>
      </div>
      {/* o aviso do servidor no canto (o texto do log, traduzido) */}
      <div style={{position: 'absolute', right: 40, top: 44, background: 'rgba(0,0,0,0.7)', padding: '10px 18px', fontFamily: FONT.pixel, fontSize: 20, color: '#ff6b6b', opacity: interpolate(f, [0, 5], [0, 1], cl), transform: `translateX(${interpolate(f, [0, 6], [60, 0], cl)}px)`}}>{m.texto}</div>
      <Audio src={staticFile('sfx/boom.mp3')} volume={0.5} />
      {SOM_MORTE[c.id] ? <Sequence from={6} layout="none"><Audio src={staticFile(SOM_MORTE[c.id])} volume={0.35} /></Sequence> : null}
      {c.meme ? <Sequence from={14} durationInFrames={78} layout="none"><Meme id={c.meme} /></Sequence> : null}
    </AbsoluteFill>
  );
};

const Meme: React.FC<{id: string}> = ({id}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f, fps: FPS, config: {damping: 11}});
  const sai = interpolate(f, [70, 78], [1, 0], cl);
  return (
    <div style={{position: 'absolute', right: 70, bottom: 90, width: 520, opacity: sai, transform: `scale(${e}) rotate(${4 - e * 1}deg)`, background: '#fff', padding: 12, boxShadow: '0 14px 0 rgba(0,0,0,0.4)'}}>
      <OffthreadVideo src={staticFile(`gifs/${id}.mp4`)} muted style={{width: '100%', display: 'block'}} />
      <Audio src={staticFile('sfx/pop.mp3')} volume={0.35} />
    </div>
  );
};

const Titulo: React.FC<{texto: string}> = ({texto}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f, fps: FPS, config: {damping: 12}});
  const sai = interpolate(f, [70, 80], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', justifyContent: 'center', opacity: sai}}>
      <div style={{transform: `scale(${e}) rotate(-2deg)`, fontFamily: FONT.comic, fontSize: 92, color: '#ffe14d', background: 'rgba(0,0,0,0.75)', padding: '10px 36px', border: '5px solid #ffe14d', letterSpacing: 3}}>{texto}</div>
      <Audio src={staticFile('sfx/swish-triple.mp3')} volume={0.3} />
    </div>
  );
};

// abertura: as 6 IAs entrando no servidor
const Abertura: React.FC = () => {
  const f = useCurrentFrame();
  const nomes = Object.keys(IAS);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55), transparent 40%, transparent 60%, rgba(0,0,0,0.6))'}} />
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.comic, fontSize: 140, color: '#fff', letterSpacing: 4, textShadow: '7px 7px 0 #000', transform: `scale(${spring({frame: f, fps: FPS, config: {damping: 12}})})`}}>
        6 IAs NO MINECRAFT
      </div>
      <div style={{position: 'absolute', top: 245, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 46, color: '#ffe14d', textShadow: '4px 4px 0 #000', opacity: interpolate(f, [120, 132], [0, 1], cl)}}>
        3 horas pra sobreviver. Depois, a arena.
      </div>
      <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 34}}>
        {nomes.map((n, i) => {
          const k = f - 30 - i * 9;
          const e = spring({frame: k, fps: FPS, config: {damping: 11}});
          return (
            <div key={n} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transform: `translateY(${(1 - e) * 300}px)`}}>
              <Cabeca nome={n} tam={110} />
              <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: '#fff', background: IAS[n].cor, padding: '2px 14px'}}>{n}</div>
              <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 20, color: '#fff', textShadow: '2px 2px 0 #000'}}>{IAS[n].modelo}</div>
              <Sequence from={30 + i * 9} durationInFrames={20} layout="none"><Audio src={staticFile('sfx/pop.mp3')} volume={0.3} /></Sequence>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Fim: React.FC = () => {
  const f = useCurrentFrame();
  const max = PLACAR[0][1];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, #2b2f3a, #0d0f14)'}}>
      <div style={{position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 62, color: '#fff'}}>MORTES NAS 3 HORAS DE SOBREVIVÊNCIA</div>
      <div style={{position: 'absolute', top: 190, left: 360, right: 360}}>
        {PLACAR.map(([n, k], i) => {
          const e = spring({frame: f - 6 - i * 5, fps: FPS, config: {damping: 14}});
          return (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22, opacity: e, transform: `translateX(${(1 - e) * -80}px)`}}>
              <Cabeca nome={n} tam={70} />
              <div style={{width: 170, fontFamily: FONT.display, fontWeight: 800, fontSize: 40, color: '#fff'}}>{n}</div>
              <div style={{height: 52, width: (k / max) * 760 * e, background: IAS[n].cor, border: '4px solid #000'}} />
              <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 48, color: '#fff'}}>{k}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.comic, fontSize: 96, color: '#ffe14d', letterSpacing: 3, opacity: interpolate(f, [72, 82], [0, 1], cl), transform: `scale(${interpolate(f, [72, 82], [1.4, 1], cl)})`}}>
        AGORA VEM A ARENA
      </div>
      <Sequence from={72} layout="none"><Audio src={staticFile('sfx/impact-epic.mp3')} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};

const CenaMC: React.FC<{c: Cena}> = ({c}) => {
  const f = useCurrentFrame();
  const m = c.morte;
  const congela = c.video ?? c.dur;
  // tremida no impacto; depois a imagem congelada vai ficando cinza e aproximando devagar
  let dx = 0, dy = 0, z = 1, cinza = 0;
  if (m) {
    const k = f - m.at;
    if (k >= 0 && k < 14) { const a = (14 - k) * 1.8; dx = Math.sin(k * 2.7) * a; dy = Math.cos(k * 3.1) * a }
    z = 1 + interpolate(k, [0, 6], [0, 0.07], cl) + interpolate(f, [congela, c.dur], [0, 0.07], cl);
    cinza = interpolate(f, [congela, congela + 12], [0, 0.85], cl);
  }
  const falas = c.audios.filter((a) => a.tipo !== 'n');
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${z})`, filter: `grayscale(${cinza}) brightness(${1 - cinza * 0.25})`}}>
        {f < congela
          ? <OffthreadVideo src={staticFile(`mc_previa/${c.id}.mp4`)} style={{width: '100%', height: '100%'}} muted />
          : <Freeze frame={congela - 1}><OffthreadVideo src={staticFile(`mc_previa/${c.id}.mp4`)} style={{width: '100%', height: '100%'}} muted /></Freeze>}
      </AbsoluteFill>
      {c.id === 'c1' ? <Abertura /> : c.quem ? <Etiqueta quem={c.quem} /> : null}
      {c.titulo ? <Sequence layout="none" from={2} durationInFrames={80}><Titulo texto={c.titulo} /></Sequence> : null}
      {c.audios.map((a, i) => <Sequence key={`a${i}`} from={a.at} layout="none"><Audio src={staticFile(a.src)} volume={a.tipo === 'n' ? 1 : 0.95} /></Sequence>)}
      {falas.map((a, i) => {
        const ate = Math.min(c.dur - a.at, Math.round(a.dur * FPS) + 14);
        return (
          <Sequence key={`f${i}`} from={a.at} durationInFrames={ate} layout="none">
            {a.tipo === 'pensa' ? <Pensa quem={c.quem!} a={a} ate={ate} /> : <Chat quem={c.quem!} a={a} ate={ate} />}
            <Audio src={staticFile('sfx/notification-pop.mp3')} volume={0.25} />
          </Sequence>
        );
      })}
      {m ? <Sequence from={m.at} layout="none"><Morte c={c} /></Sequence> : null}
      {/* corte: flash branco rápido e whoosh (no lugar de transição de lobby) */}
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 5], [0.7, 0], cl), pointerEvents: 'none'}} />
      <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.3} />
    </AbsoluteFill>
  );
};

export const PreviaMC: React.FC<{dados: Dados | null}> = ({dados}) => {
  const {durationInFrames} = useVideoConfig();
  const [h] = useState(() => delayRender('fontes'));
  useEffect(() => {
    fontsReady.then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
  if (!dados) return null;
  let at = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {dados.cenas.map((c) => {
        const de = at;
        at += c.dur;
        return <Sequence key={c.id} from={de} durationInFrames={c.dur}>{c.id === 'fim' ? <><Fim />{c.audios.map((a, i) => <Sequence key={i} from={a.at} layout="none"><Audio src={staticFile(a.src)} /></Sequence>)}</> : <CenaMC c={c} />}</Sequence>;
      })}
      <Audio src={staticFile('music/voxel-revolution.mp3')} volume={(f) => interpolate(f, [0, 20, durationInFrames - 40, durationInFrames], [0, 0.13, 0.13, 0], cl)} />
    </AbsoluteFill>
  );
};
