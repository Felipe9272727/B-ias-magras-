// Prévia (2 min) do vídeo do Minecraft: 6 IAs sobrevivendo 3 horas num servidor oficial 1.21.4, depois arena.
// As cenas 3D são o replay da gravação (minecraft/replay.mjs, texturas oficiais). Por cima: etiqueta da IA (cabeça da
// skin), pensamento em cartão, chat no estilo do jogo, selo de morte. Tudo o que aparece vem de
// minecraft/gravacoes/partida1/eventos_*.jsonl (pensamentos e chat copiados; "t" é o segundo da partida).
// Sem emoji (regra do canal): ícones em SVG/CSS.
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../theme';

const FPS = 30;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const IAS: Record<string, {modelo: string; cor: string}> = {
  DeepSeek: {modelo: 'DeepSeek V4.1 Flash', cor: '#4d6bfe'},
  Qwen: {modelo: 'Qwen 3.8 27B', cor: '#7b5cff'},
  Claude: {modelo: 'Claude Sonnet 5.5', cor: '#d97757'},
  GPT: {modelo: 'GPT-5.6 Luna', cor: '#10a37f'},
  GLM: {modelo: 'GLM 5.3 Flash', cor: '#2f6bff'},
  MiMo: {modelo: 'MiMo V2.6 Flash', cor: '#ff6900'},
};

type Ev = {t: number; tipo: 'pensa' | 'chat' | 'morte'; texto: string; selo?: string};
type Cena = {id: string; t0: number; t1: number; quem: string; ev: Ev[]; titulo?: string};

const CENAS: Cena[] = [
  {id: 'c1', t0: 22, t1: 32, quem: 'Claude', ev: []},
  {id: 'c2', t0: 455, t1: 472, quem: 'Qwen', titulo: 'PRIMEIRA NOITE', ev: [
    {t: 455.3, tipo: 'pensa', texto: 'Preciso de comida urgente antes do anoitecer. Porcos a ~29 blocos. Vou explorar leste pra achá-los e matar um.'},
    {t: 471.01, tipo: 'morte', texto: 'Qwen se afogou', selo: 'AFOGOU'},
  ]},
  {id: 'c3', t0: 2096, t1: 2116, quem: 'MiMo', ev: [
    {t: 2097, tipo: 'pensa', texto: 'Tem um creeper a 5 blocos e eu estou com picareta de madeira na mão, preciso equipar a espada de ferro imediatamente antes de lutar.'},
    {t: 2103, tipo: 'pensa', texto: 'Creeper a 4 blocos é ameaça imediata, preciso atacar antes que ele exploda e me mate ou destrua meu equipamento.'},
    {t: 2114.69, tipo: 'morte', texto: 'MiMo explodiu com um Creeper', selo: 'EXPLODIU'},
  ]},
  {id: 'c4', t0: 3795, t1: 3815, quem: 'Claude', ev: [
    {t: 3795.5, tipo: 'chat', texto: 'GLM, valeu pelo aviso. Estou cercado de esqueletos aqui, depois vou atrás de comida.'},
    {t: 3803, tipo: 'pensa', texto: 'Há um esqueleto colado em mim e outro a 3 blocos, com a vida em 9. Tenho espada de ferro e armadura completa, então continuo atacando o mais perto antes que ele me acerte mais.'},
    {t: 3814.21, tipo: 'morte', texto: 'Claude levou uma flecha de Esqueleto', selo: 'FLECHADO'},
  ]},
  {id: 'c5', t0: 9149, t1: 9162, quem: 'GLM', titulo: 'O PIOR MINUTO DO GLM', ev: [
    {t: 9153, tipo: 'chat', texto: 'Noite com creepers, vou me abrigar. Arena em ~28min, quem quiser aliança fala agora.'},
    {t: 9158.6, tipo: 'chat', texto: 'Abrigo falhou, vou refazer na terra firme. MiMo, cuidado com os creepers.'},
    {t: 9159.64, tipo: 'morte', texto: 'GLM se afogou', selo: 'MORTE 1'},
  ]},
  {id: 'c6', t0: 9164, t1: 9179, quem: 'GLM', ev: [
    {t: 9166, tipo: 'chat', texto: 'Creeper me atacou, estou com 1 de vida, me trancando!'},
    {t: 9170, tipo: 'chat', texto: 'Mori afogado, perdi tudo. Recomeçando do zero.'},
    {t: 9177.63, tipo: 'morte', texto: 'GLM foi morto por um Zumbi', selo: 'MORTE 2'},
  ]},
  {id: 'c7', t0: 9187, t1: 9200, quem: 'GLM', ev: [
    {t: 9187.3, tipo: 'chat', texto: 'Perdi tudo pros zombies. Se alguém puder me emprestar uma espada ou picareta de pedra, eu devolvo depois. Vou re-começar do zero.'},
    {t: 9191, tipo: 'chat', texto: 'zumbis em cima de mim aqui, socorro?'},
    {t: 9198.47, tipo: 'morte', texto: 'GLM foi morto por um Zumbi', selo: 'MORTE 3'},
  ]},
];
// placar de mortes até o minuto 166 (eventos "morte" dos logs)
const PLACAR: [string, number][] = [['Qwen', 5], ['GPT', 5], ['GLM', 4], ['DeepSeek', 1], ['MiMo', 1], ['Claude', 1]];
const FIM = 6 * FPS;
const dur = (c: Cena) => Math.round((c.t1 - c.t0) * FPS);
export const DURACAO_PREVIA = CENAS.reduce((a, c) => a + dur(c), 0) + FIM;

// cabeça da skin (8x8 em 8,8 do PNG 64x64), pixelada
const Cabeca: React.FC<{nome: string; tam: number}> = ({nome, tam}) => (
  <div style={{width: tam, height: tam, overflow: 'hidden', position: 'relative', imageRendering: 'pixelated', border: `${Math.round(tam / 16)}px solid #000`, boxSizing: 'content-box'}}>
    <Img src={staticFile(`mc_previa/skins/${nome}.png`)} style={{position: 'absolute', width: tam * 8, height: tam * 8, left: -tam, top: -tam, imageRendering: 'pixelated'}} />
    <Img src={staticFile(`mc_previa/skins/${nome}.png`)} style={{position: 'absolute', width: tam * 8, height: tam * 8, left: -tam * 5, top: -tam, imageRendering: 'pixelated'}} />
  </div>
);

const Etiqueta: React.FC<{quem: string}> = ({quem}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f, fps: FPS, config: {damping: 14}});
  const ia = IAS[quem];
  return (
    <div style={{position: 'absolute', left: 40, top: 36, display: 'flex', alignItems: 'center', gap: 18, transform: `translateX(${(1 - e) * -420}px)`}}>
      <Cabeca nome={quem} tam={84} />
      <div style={{background: 'rgba(0,0,0,0.72)', padding: '10px 22px', borderLeft: `8px solid ${ia.cor}`}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 46, color: '#fff', lineHeight: 1}}>{quem}</div>
        <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 26, color: ia.cor, marginTop: 4}}>{ia.modelo}</div>
      </div>
    </div>
  );
};

// pensamento: cartão com borda tracejada (nuvem), cabeça e o texto do log escrevendo
const Pensa: React.FC<{quem: string; texto: string; ate: number}> = ({quem, texto, ate}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f, fps: FPS, config: {damping: 13}});
  const sai = interpolate(f, [ate - 8, ate], [1, 0], cl);
  const n = Math.round(interpolate(f, [4, 4 + texto.length * 0.9], [0, texto.length], cl));
  return (
    <div style={{position: 'absolute', left: 300, right: 300, bottom: 60, opacity: sai, transform: `scale(${0.85 + e * 0.15}) translateY(${(1 - e) * 60}px)`}}>
      <div style={{background: 'rgba(255,255,255,0.96)', border: '6px dashed #5b5b8f', borderRadius: 40, padding: '22px 34px', display: 'flex', gap: 22, alignItems: 'flex-start', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
        <Cabeca nome={quem} tam={64} />
        <div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 26, color: '#5b5b8f', letterSpacing: 1}}>{quem.toUpperCase()} PENSOU</div>
          <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 34, color: '#1c1c2a', lineHeight: 1.25, marginTop: 4}}>{texto.slice(0, n)}</div>
        </div>
      </div>
      {/* bolinhas da nuvem de pensamento */}
      <div style={{position: 'absolute', left: 60, top: -34, width: 26, height: 26, borderRadius: 13, background: '#fff', border: '4px dashed #5b5b8f'}} />
      <div style={{position: 'absolute', left: 36, top: -66, width: 16, height: 16, borderRadius: 8, background: '#fff', border: '3px dashed #5b5b8f'}} />
    </div>
  );
};

// chat do jogo: fundo escuro translúcido, "<Nome> mensagem", fonte de jogo
const Chat: React.FC<{quem: string; texto: string; ate: number}> = ({quem, texto, ate}) => {
  const f = useCurrentFrame();
  const sai = interpolate(f, [ate - 8, ate], [1, 0], cl);
  const e = interpolate(f, [0, 6], [0, 1], cl);
  return (
    <div style={{position: 'absolute', left: 40, bottom: 150, maxWidth: 1250, opacity: sai * e, transform: `translateY(${(1 - e) * 30}px)`}}>
      <div style={{background: 'rgba(0,0,0,0.6)', padding: '12px 20px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 36, color: '#fff', lineHeight: 1.3, textShadow: '3px 3px 0 #3f3f3f'}}>
        <span style={{color: IAS[quem].cor}}>{'<'}{quem}{'>'}</span> {texto}
      </div>
    </div>
  );
};

// caveira em SVG (selo de morte)
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

const Morte: React.FC<{selo: string; texto: string}> = ({selo, texto}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f, fps: FPS, config: {damping: 9, stiffness: 160}});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: '#ff1a1a', opacity: interpolate(f, [0, 3, 14], [0, 0.55, 0], cl)}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(120,0,0,0.55) 100%)', opacity: interpolate(f, [0, 6], [0, 1], cl)}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${e}) rotate(${(1 - e) * -14 - 4}deg)`, display: 'flex', alignItems: 'center', gap: 26, background: '#b3121b', border: '8px solid #fff', padding: '16px 40px', boxShadow: '0 12px 0 rgba(0,0,0,0.4)'}}>
          <Caveira tam={110} />
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 104, color: '#fff', letterSpacing: 2}}>{selo}</div>
        </div>
      </div>
      {/* mensagem de morte no canto, como o aviso do servidor */}
      <div style={{position: 'absolute', right: 40, top: 44, background: 'rgba(0,0,0,0.65)', padding: '10px 18px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 32, color: '#ff6b6b', opacity: interpolate(f, [0, 5], [0, 1], cl)}}>{texto}</div>
      <Audio src={staticFile('sfx/boom.mp3')} volume={0.5} />
    </AbsoluteFill>
  );
};

const Titulo: React.FC<{texto: string}> = ({texto}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f, fps: FPS, config: {damping: 12}});
  const sai = interpolate(f, [62, 72], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 160, display: 'flex', justifyContent: 'center', opacity: sai}}>
      <div style={{transform: `scale(${e})`, fontFamily: FONT, fontWeight: 800, fontSize: 70, color: '#ffe14d', background: 'rgba(0,0,0,0.7)', padding: '10px 36px', border: '5px solid #ffe14d', letterSpacing: 3}}>{texto}</div>
    </div>
  );
};

// abertura: o servidor, as 6 IAs entrando
const Abertura: React.FC = () => {
  const f = useCurrentFrame();
  const nomes = Object.keys(IAS);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55), transparent 40%, transparent 60%, rgba(0,0,0,0.6))'}} />
      <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 96, color: '#fff', textShadow: '6px 6px 0 #000', transform: `scale(${spring({frame: f, fps: FPS, config: {damping: 12}})})`}}>
        6 IAs NO MINECRAFT
      </div>
      <div style={{position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 44, color: '#ffe14d', textShadow: '4px 4px 0 #000', opacity: interpolate(f, [20, 32], [0, 1], cl)}}>
        3 horas pra sobreviver. Depois, a arena.
      </div>
      <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 34}}>
        {nomes.map((n, i) => {
          const e = spring({frame: f - 40 - i * 8, fps: FPS, config: {damping: 11}});
          return (
            <div key={n} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transform: `translateY(${(1 - e) * 260}px)`}}>
              <Cabeca nome={n} tam={110} />
              <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, color: '#fff', background: IAS[n].cor, padding: '2px 14px'}}>{n}</div>
              {e > 0.5 && f - 40 - i * 8 < 4 ? <Audio src={staticFile('sfx/pop.mp3')} volume={0.4} /> : null}
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
      <div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 70, color: '#fff'}}>MORTES ATÉ AGORA</div>
      <div style={{position: 'absolute', top: 200, left: 360, right: 360}}>
        {PLACAR.map(([n, k], i) => {
          const e = spring({frame: f - 8 - i * 6, fps: FPS, config: {damping: 14}});
          return (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 22, opacity: e, transform: `translateX(${(1 - e) * -80}px)`}}>
              <Cabeca nome={n} tam={70} />
              <div style={{width: 170, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: '#fff'}}>{n}</div>
              <div style={{height: 52, width: (k / max) * 760 * e, background: IAS[n].cor, border: '4px solid #000'}} />
              <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 48, color: '#fff'}}>{k}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 64, color: '#ffe14d', opacity: interpolate(f, [70, 82], [0, 1], cl), transform: `scale(${interpolate(f, [70, 82], [1.4, 1], cl)})`}}>
        E A ARENA AINDA NEM COMEÇOU
      </div>
    </AbsoluteFill>
  );
};

const CenaMC: React.FC<{c: Cena}> = ({c}) => {
  const f = useCurrentFrame();
  const D = dur(c);
  const q = (t: number) => Math.round((t - c.t0) * FPS);
  const mortes = c.ev.filter((e) => e.tipo === 'morte');
  // tremida e zoom no impacto da morte
  let dx = 0, dy = 0, z = 1;
  for (const m of mortes) {
    const k = f - q(m.t);
    if (k >= 0 && k < 14) { const a = (14 - k) * 1.6; dx += Math.sin(k * 2.7) * a; dy += Math.cos(k * 3.1) * a; z += (14 - k) / 14 * 0.08 }
    if (k >= 14) z += 0.08 * Math.max(0, 1 - (k - 14) / 20);
  }
  const falas = c.ev.filter((e) => e.tipo !== 'morte');
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${z})`}}>
        <OffthreadVideo src={staticFile(`mc_previa/${c.id}.mp4`)} style={{width: '100%', height: '100%'}} muted />
      </AbsoluteFill>
      {c.id === 'c1' ? <Abertura /> : <Sequence layout="none"><Etiqueta quem={c.quem} /></Sequence>}
      {c.titulo ? <Sequence layout="none" from={4}><Titulo texto={c.titulo} /></Sequence> : null}
      {falas.map((e, i) => {
        const de = Math.max(0, q(e.t));
        const prox = falas[i + 1] ? q(falas[i + 1].t) : mortes.length ? q(mortes[0].t) : D;
        const ate = Math.min(D, Math.max(prox, de + 30)) - de;
        return (
          <Sequence key={i} from={de} durationInFrames={ate} layout="none">
            {e.tipo === 'pensa' ? <Pensa quem={c.quem} texto={e.texto} ate={ate} /> : <Chat quem={c.quem} texto={e.texto} ate={ate} />}
          </Sequence>
        );
      })}
      {mortes.map((m, i) => (
        <Sequence key={`m${i}`} from={q(m.t)} layout="none"><Morte selo={m.selo!} texto={m.texto} /></Sequence>
      ))}
      {/* corte com flash branco rápido e whoosh (no lugar de transição de lobby) */}
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 5], [0.7, 0], cl), pointerEvents: 'none'}} />
      <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.35} />
    </AbsoluteFill>
  );
};

export const PreviaMC: React.FC = () => {
  const {durationInFrames} = useVideoConfig();
  let at = 0;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {CENAS.map((c) => {
        const de = at;
        at += dur(c);
        return <Sequence key={c.id} from={de} durationInFrames={dur(c)}><CenaMC c={c} /></Sequence>;
      })}
      <Sequence from={at} durationInFrames={FIM}><Fim /></Sequence>
      <Audio src={staticFile('music/voxel-revolution.mp3')} volume={(f) => interpolate(f, [0, 20, durationInFrames - 40, durationInFrames], [0, 0.22, 0.22, 0], cl)} />
    </AbsoluteFill>
  );
};
