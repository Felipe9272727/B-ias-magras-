// Abertura do vídeo das IAs no Minecraft (≈4 min; também é a prévia): explica a dinâmica, mostra onde cada IA nasceu
// e o começo em ordem, até a corrida da Idade da Pedra. Montagem em public/mc/abertura/abertura.json
// (scripts/mc_abertura.py; roteiro em roteiro/mc_abertura.md). Cenas de jogo = replay 3D da gravação
// (minecraft/replay.mjs) em public/mc/abertura/<cena>.mp4, com o HUD do jogo (HudMC), cartões de pensamento/chat e
// conquistas. Fatos, falas e pensamentos vêm dos logs. Sem emoji (regra do canal).
import React, {useContext, useEffect, useState} from 'react';
import type {CalculateMetadataFunction} from 'remotion';
import {AbsoluteFill, continueRender, delayRender, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {AudioMC as Audio, ReutilizarAudioOriginal} from './AudioMC';
import {fontsReady} from '../fonts';
import {FONT} from '../theme';
import {HudMC} from './HudMC';
import {MapaMC} from './MapaMC';
import {Cabeca, Chat, cl, ComentarioYT, Conquista, ErroJogo, FPS, FundoTerra, IAS, Morte, MsgServidor, Pensa, Titulo} from './ui';
import {MemeCard} from '../components/overlays';
import catalogo from '../../public/gifs/catalog.json';

type Palavra = {w: string; s: number; e: number};
type Item =
  | {tipo: 'n' | 'chat' | 'pensa' | 'nota'; src: string; at: number; dur: number; quem: string | null; texto: string; palavras: Palavra[]; t_log?: number}
  | {tipo: 'card'; estilo: string; texto: string; at: number; dur: number}
  | {tipo: 'meme'; gif: string; at: number; dur: number; pos: string; sfx: string | null};
type Popup = {t: number; n: number; item: string; icone: string | null; tipo: string};
type Visual = {tipo: string; camera?: string; festa?: boolean; t0?: number; t1?: number; painel?: string; quem?: string; conquista?: [string, string, number]; conquistas?: [string, string, number][]; popups?: Popup[]; tIni?: number; tFim?: number; titulo?: string; sub?: string; ranking?: boolean; linhas?: [string, string][]};
type Cena = {id: string; visual: Visual; itens: Item[]; dur: number; agua?: number[]};
type Dados = {cenas: Cena[]; obsClaude: string; pasta?: string};

export const calcAberturaMC: CalculateMetadataFunction<{dados: Dados | null; pasta?: string}> = async ({props}) => {
  const d: Dados = await (await fetch(staticFile(`${props.pasta ?? 'mc/abertura'}/abertura.json`))).json();
  // cabeça dentro d'água, quadro a quadro (minecraft/replay.mjs com SO_AGUA): vira a película azul do jogo
  await Promise.all(d.cenas.filter((c) => c.visual.tipo === 'replay').map(async (c) => {
    try {
      const r = await fetch(staticFile(`${props.pasta ?? 'mc/abertura'}/${c.id}.agua.json`));
      if (r.ok) c.agua = (await r.json()).q;
    } catch {
      // sem o arquivo: sem película
    }
  }));
  return {durationInFrames: d.cenas.reduce((a, c) => a + c.dur, 0), props: {dados: d}};
};

// onde e quando cada IA entrou (primeiro registro de posição em posicoes_<Nome>.jsonl)
const NASCEU: Record<string, {t: number; x: number; y: number; z: number}> = {
  DeepSeek: {t: 1.57, x: 12, y: 64, z: 0}, Qwen: {t: 5.86, x: 23, y: 78, z: 1}, Claude: {t: 9.7, x: 19, y: 69, z: 9},
  GPT: {t: 13.75, x: 21, y: 78, z: 0}, GLM: {t: 18.43, x: 10, y: 64, z: 6}, MiMo: {t: 22.7, x: 8, y: 63, z: 5},
};
const ICONE_CONQUISTA: Record<string, string> = {'Stone Age': 'wooden_pickaxe', 'Getting an Upgrade': 'stone_pickaxe', 'Acquire Hardware': 'iron_ingot', 'Suit Up': 'iron_chestplate', "Isn't It Iron Pick": 'iron_pickaxe', 'Monster Hunter': 'iron_sword'};
const NOME_CONQUISTA: Record<string, string> = {'Stone Age': 'Idade da Pedra'};
const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const seguido = (cam?: string) => (cam && !cam.startsWith('fixa') ? cam.split(':')[1] : null);

// ---------- painéis ----------
// o relatório de verdade que a IA recebe, digitado num terminal
const Relatorio: React.FC<{texto: string; dur: number}> = ({texto, dur}) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [10, dur - 40], [0, texto.length], cl));
  const e = spring({frame: f, fps: FPS, config: {damping: 15}});
  return (
    <div style={{position: 'absolute', right: 40, top: 60, bottom: 60, width: 860, transform: `translateX(${(1 - e) * 900}px)`, background: 'rgba(8,12,10,0.94)', border: '4px solid #3c3', boxShadow: '0 0 40px rgba(60,200,60,0.25)', padding: '26px 30px', overflow: 'hidden'}}>
      <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: '#7f7', letterSpacing: 2, marginBottom: 16}}>O QUE O CLAUDE RECEBE (0:32 DA PARTIDA)</div>
      <div style={{fontFamily: FONT.mono, fontWeight: 500, fontSize: 25, color: '#c8ffc8', lineHeight: 1.45, whiteSpace: 'pre-wrap'}}>
        {texto.slice(0, n)}
        <span style={{opacity: f % 20 < 10 ? 1 : 0, color: '#7f7'}}>█</span>
      </div>
      <Audio src={staticFile('sfx/typing.mp3')} volume={0.12} />
    </div>
  );
};

// a resposta da IA: pensamento, ação e chat (o formato de cada decisão)
const Decisao: React.FC = () => {
  const f = useCurrentFrame();
  const linhas: [string, string, string][] = [
    ['PENSAMENTO', 'Há madeira a 1 bloco, então vou coletar logo para fazer mesa e picareta antes da noite.', '#9ecbff'],
    ['AÇÃO', 'coletar  {alvo: "madeira", qtd: 6}', '#ffd36b'],
    ['CHAT', 'Bom dia. Coletando madeira também.', '#d97757'],
  ];
  const e0 = spring({frame: f, fps: FPS, config: {damping: 15}});
  return (
    <div style={{position: 'absolute', right: 40, top: 70, width: 820, transform: `translateX(${(1 - e0) * 900}px)`, background: 'rgba(10,10,20,0.92)', border: '4px solid #d97757', padding: '24px 30px'}}>
      <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: '#ffb08f', letterSpacing: 2, marginBottom: 14}}>A RESPOSTA DO CLAUDE</div>
      {linhas.map(([rot, txt, cor], i) => {
        const e = spring({frame: f - 20 - i * 26, fps: FPS, config: {damping: 14}});
        return (
          <div key={rot} style={{opacity: e, transform: `translateY(${(1 - e) * 30}px)`, marginBottom: 18}}>
            <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: cor, letterSpacing: 2}}>{rot}</div>
            <div style={{fontFamily: rot === 'AÇÃO' ? FONT.mono : FONT.display, fontWeight: 600, fontSize: 30, color: '#fff', lineHeight: 1.3}}>{txt}</div>
          </div>
        );
      })}
    </div>
  );
};

// as regras, uma por fala do narrador
const REGRAS = ['3 HORAS PRA SE EQUIPAR', 'MORREU? RENASCE SEM NADA', 'DEPOIS: TODOS PRA ARENA', 'SÓ PODE SOBRAR UMA'];
const Regras: React.FC<{marcos: number[]}> = ({marcos}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22}}>
      {REGRAS.map((r, i) => {
        const e = spring({frame: f - marcos[i], fps: FPS, config: {damping: 11}});
        const ultimo = i === REGRAS.length - 1;
        return (
          <div key={r} style={{opacity: f >= marcos[i] ? 1 : 0, transform: `scale(${0.6 + e * 0.4}) rotate(${(1 - e) * -4}deg)`, background: ultimo ? '#b3121b' : 'rgba(0,0,0,0.78)', border: `5px solid ${ultimo ? '#fff' : '#ffe14d'}`, padding: '12px 40px'}}>
            <div style={{fontFamily: FONT.comic, fontSize: 72, color: ultimo ? '#fff' : '#ffe14d', letterSpacing: 3}}>{r}</div>
            {f >= marcos[i] && f < marcos[i] + 2 ? <Audio src={staticFile('sfx/pop.mp3')} volume={0.35} /> : null}
          </div>
        );
      })}
    </div>
  );
};

// cartão de quem acabou de entrar no servidor
const Nascimento: React.FC<{quem: string}> = ({quem}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f - 4, fps: FPS, config: {damping: 12}});
  const ia = IAS[quem], n = NASCEU[quem];
  return (
    <div style={{position: 'absolute', left: 50, top: 50, display: 'flex', gap: 26, alignItems: 'center', transform: `translateX(${(1 - e) * -700}px)`, background: 'rgba(0,0,0,0.8)', borderLeft: `14px solid ${ia.cor}`, padding: '22px 34px'}}>
      <Cabeca nome={quem} tam={130} />
      <div>
        <div style={{fontFamily: FONT.comic, fontSize: 92, color: '#fff', lineHeight: 0.95, letterSpacing: 2}}>{quem}</div>
        <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 30, color: ia.cor}}>{ia.modelo} · {ia.empresa}</div>
        <div style={{fontFamily: FONT.pixel, fontSize: 20, color: '#ddd', marginTop: 12}}>entrou em {mmss(n.t)} · nasceu em ({n.x}, {n.y}, {n.z})</div>
      </div>
      <Audio src={staticFile('sfx/swoosh-fly.mp3')} volume={0.3} />
    </div>
  );
};

// ---------- cenas ----------
const Comentarios: React.FC<{marco: number}> = ({marco}) => {
  const f = useCurrentFrame();
  const coms: [string, string, boolean][] = [
    ['@FAMILIAGMS', 'Faz um desafio no minecraft onde 2 ou mais i.as sobrevivem e pegam recursos, depois de um determinado tempo, elas são convocadas pra batalhar e o último a sobreviver pontua', true],
    ['@PintoNelsoOFC', 'Cara, seria maneiro se no minecraft você fizesse um pvp com barreira, tipo um battle royale', false],
    ['@fergusoff64w', 'Faz uma série de smp no Minecraft onde cada IA é um personagem do mundo tentando cumprir um objetivo aleatório e quem completar o objetivo primeiro vence.', false],
    ['@minstcave-v7-g1I', 'Minecrafttttttttt', false],
    ['@FamiliaEKER', 'Minecraft da?', false],
  ];
  const pos = [[90, 120], [1000, 90], [960, 470], [140, 640], [1150, 800]];
  return (
    <AbsoluteFill>
      <FundoTerra />
      {coms.map(([autor, texto, destaque], i) => {
        const ini = 6 + i * 16;
        const e = spring({frame: f - ini, fps: FPS, config: {damping: 12}});
        const foco = destaque && f >= marco;
        const s = foco ? interpolate(f, [marco, marco + 10], [1, 1.12], cl) : 1;
        return (
          <div key={autor} style={{position: 'absolute', left: pos[i][0], top: pos[i][1], width: i === 0 ? 820 : 760, opacity: f >= ini ? (foco || f < marco ? 1 : 0.45) : 0, transform: `scale(${(0.6 + e * 0.4) * s}) rotate(${(i % 2 ? 1.5 : -1.5)}deg)`, background: '#fff', borderRadius: 18, padding: '18px 24px', boxShadow: foco ? '0 0 0 8px #ffe14d, 0 14px 0 rgba(0,0,0,0.4)' : '0 10px 0 rgba(0,0,0,0.35)', zIndex: foco ? 5 : 1}}>
            <div style={{display: 'flex', gap: 14, alignItems: 'center', marginBottom: 8}}>
              <div style={{width: 46, height: 46, borderRadius: 23, background: ['#e53935', '#43a047', '#1e88e5', '#8e24aa', '#fb8c00'][i], color: '#fff', fontFamily: FONT.display, fontWeight: 800, fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{autor[1].toUpperCase()}</div>
              <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 24, color: '#0f0f0f'}}>{autor}</div>
            </div>
            <div style={{fontFamily: 'Roboto, ' + FONT.display, fontSize: 28, color: '#0f0f0f', lineHeight: 1.35}}>{texto}</div>
            {f >= ini && f < ini + 2 ? <Audio src={staticFile('sfx/notification-pop.mp3')} volume={0.3} /> : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Placar: React.FC<{titulo: string; sub?: string; ranking?: boolean; linhas: [string, string][]}> = ({titulo, sub, ranking = true, linhas}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <FundoTerra escuro={0.62} />
      <div style={{position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.comic, fontSize: 110, color: '#ffe14d', letterSpacing: 4, textShadow: '6px 6px 0 #000'}}>{titulo}</div>
      <div style={{position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.pixel, fontSize: 22, color: '#ddd'}}>{sub ?? 'quem minerou a primeira pedra com picareta (tempo da partida)'}</div>
      <div style={{position: 'absolute', top: 290, left: linhas.some((l) => l[1].length > 6) ? 360 : 560, right: linhas.some((l) => l[1].length > 6) ? 360 : 560}}>
        {linhas.map(([n, tempo], i) => {
          const e = spring({frame: f - 10 - i * 9, fps: FPS, config: {damping: 13}});
          return (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 22, marginBottom: 18, opacity: e, transform: `translateX(${(1 - e) * -120}px)`, background: ranking && i === 0 ? 'rgba(255,215,0,0.25)' : 'rgba(0,0,0,0.45)', border: ranking && i === 0 ? '4px solid #ffd700' : '4px solid rgba(255,255,255,0.15)', padding: '8px 18px'}}>
              {ranking ? <div style={{width: 60, fontFamily: FONT.comic, fontSize: 56, color: i === 0 ? '#ffd700' : '#fff'}}>{i + 1}</div> : null}
              <Cabeca nome={n} tam={64} />
              <div style={{flex: 1, fontFamily: FONT.display, fontWeight: 800, fontSize: 44, color: '#fff'}}>{n}</div>
              <div style={{fontFamily: FONT.pixel, fontSize: tempo.length > 12 ? 24 : 34, color: IAS[n].cor, textShadow: '3px 3px 0 #000'}}>{tempo}</div>
              {f - 10 - i * 9 === 0 ? <Audio src={staticFile('sfx/pop.mp3')} volume={0.3} /> : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// o que a IA acabou de conseguir (craft/coleta do log): ícone + quantidade subindo do meio da tela, como o "+1" dos vídeos
const PopItem: React.FC<{p: Popup}> = ({p}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f, fps: FPS, config: {damping: 10, stiffness: 160}});
  const sai = interpolate(f, [38, 50], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: '53%', top: `calc(44% - ${f * 1.6}px)`, opacity: sai, transform: `scale(${0.4 + e * 0.6})`, display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(0,0,0,0.6)', border: '4px solid #fff', padding: '8px 18px 8px 10px'}}>
      {p.icone ? <Img src={staticFile(p.icone)} style={{width: 64, height: 64, imageRendering: 'pixelated'}} /> : null}
      <div style={{fontFamily: FONT.pixel, fontSize: 34, color: p.tipo === 'craft' ? '#7dff7d' : '#ffe14d', textShadow: '3px 3px 0 #000'}}>+{p.n} {p.tipo === 'coleta' ? p.item : ''}</div>
      {f === 0 ? <Audio src={staticFile('sfx/pegar-item.mp3')} volume={0.4} /> : null}
    </div>
  );
};

const MEMES = Object.fromEntries((catalogo as {id: string; width: number; height: number; duration_sec: number}[]).map((m) => [m.id, {file: `${m.id}.gif`, width: m.width, height: m.height, duration: m.duration_sec}]));

// embaixo d'água: a película azul do Minecraft (forte em 1ª pessoa; mais leve com a câmera atrás), entrando e saindo suave
const Agua: React.FC<{q: number[]; primeira: boolean}> = ({q, primeira}) => {
  const f = useCurrentFrame();
  let soma = 0, n = 0;
  for (let i = f - 6; i <= f + 6; i++) if (i >= 0 && i < q.length) { soma += q[i]; n++; }
  const k = n ? soma / n : 0;
  if (k <= 0) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: k}}>
      <AbsoluteFill style={{background: primeira ? 'rgba(18,52,150,0.42)' : 'rgba(30,80,170,0.22)', mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: primeira ? 'rgba(40,90,200,0.22)' : 'rgba(60,110,210,0.12)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(4,16,60,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

// a zona da arena (evento "zona" do organizador em 11190,9 s: de raio 160 a 15 em 480 s): radar no canto com o círculo
// encolhendo e o tempo que falta
const ZONA_INI = 11190.9;
const Zona: React.FC<{t: number}> = ({t}) => {
  const k = Math.min(1, (t - ZONA_INI) / 480);
  const raio = 160 - (160 - 15) * k;
  const falta = Math.max(0, 480 - (t - ZONA_INI));
  const R = 110;
  return (
    <div style={{position: 'absolute', right: 30, top: 30, width: 2 * R + 20, padding: 10, background: 'rgba(0,0,0,0.6)', border: '4px solid #ff5555'}}>
      <svg width={2 * R} height={2 * R} viewBox={`${-R} ${-R} ${2 * R} ${2 * R}`}>
        <rect x={-R} y={-R} width={2 * R} height={2 * R} fill="#3a2a2a" />
        <circle r={(R * raio) / 160} fill="#2f6b3a" stroke="#ff5555" strokeWidth={4} />
        <circle r={(R * 15) / 160} fill="none" stroke="#ffe14d" strokeWidth={2} strokeDasharray="4 4" />
        <circle r={4} fill="#fff" />
      </svg>
      <div style={{fontFamily: FONT.pixel, fontSize: 20, color: '#ff5555', textAlign: 'center', marginTop: 6}}>ZONA {Math.floor(falta / 60)}:{String(Math.floor(falta % 60)).padStart(2, '0')}</div>
    </div>
  );
};

// vitória: confete de quadradinhos (SVG, nada de emoji) e troféu de pixel
const Festa: React.FC = () => {
  const f = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const cores = ['#ffe14d', '#ff6900', '#4d6bfe', '#10a37f', '#d97757', '#8b6cff', '#fff'];
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 90}, (_, i) => {
        const x = ((i * 7919) % 1000) / 1000 * W, v = 4 + (i % 5) * 1.6, y = ((f * v + i * 97) % (H + 60)) - 60;
        return <div key={i} style={{position: 'absolute', left: x + Math.sin((f + i * 13) / 9) * 30, top: y, width: 18, height: 12, background: cores[i % cores.length], transform: `rotate(${(f * 7 + i * 40) % 360}deg)`}} />;
      })}
      {f === 0 ? <Audio src={staticFile('sfx/crowd-cheer.mp3')} volume={0.4} /> : null}
    </AbsoluteFill>
  );
};

// a mira do Minecraft (1ª pessoa): cruz de 15 px do jogo na escala 3 da HUD, invertendo as cores do fundo
const Mira: React.FC = () => (
  <div style={{position: 'absolute', left: '50%', top: '50%', marginLeft: -22, marginTop: -22, width: 45, height: 45, mixBlendMode: 'difference'}}>
    <div style={{position: 'absolute', left: 0, top: 19, width: 45, height: 6, background: '#fff'}} />
    <div style={{position: 'absolute', left: 19, top: 0, width: 6, height: 45, background: '#fff'}} />
  </div>
);

// tranco de zoom quando entra um cartão de morte (servidor/morte): 1 -> 1,12 e volta em ~0,7 s
const MORTE_RE = /drowned|slain|shot|blown|suffocated|lava|ground too hard|confines/;
function zoomMorte(c: Cena, f: number) {
  let z = 1;
  for (const it of c.itens) {
    if (it.tipo !== 'card' || !(it.estilo === 'servidor' || it.estilo === 'morte') || !MORTE_RE.test(it.texto)) continue;
    const d = f - it.at;
    if (d >= 0 && d < 22) z = Math.max(z, 1 + 0.12 * Math.sin((d / 22) * Math.PI));
  }
  return z;
}

// relógio da partida (tempo de jogo da cena), como nos vídeos de série de Minecraft
const Relogio: React.FC<{t: number}> = ({t}) => {
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sg = Math.floor(t % 60);
  return (
    <div style={{position: 'absolute', left: 30, top: 30, background: 'rgba(0,0,0,0.55)', padding: '6px 14px', fontFamily: FONT.pixel, fontSize: 22, color: '#fff', textShadow: '2px 2px 0 #3f3f3f'}}>
      PARTIDA {h}:{String(m).padStart(2, '0')}:{String(sg).padStart(2, '0')}
    </div>
  );
};

// arena: quem ainda está vivo (mortes do log: Claude 10855,1; GLM 10869,2; GPT 11332,1; Qwen 11403,8; DeepSeek 11527,4)
const MORTE_ARENA: Record<string, number> = {Claude: 10855.1, GLM: 10869.2, GPT: 11332.1, Qwen: 11403.8, DeepSeek: 11527.4, MiMo: 1e9};
const Vivos: React.FC<{t: number}> = ({t}) => {
  const vivos = Object.values(MORTE_ARENA).filter((m) => m > t).length;
  return (
    <div style={{position: 'absolute', left: 30, top: 80, background: 'rgba(0,0,0,0.55)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6}}>
      <div style={{fontFamily: FONT.pixel, fontSize: 18, color: '#ffe14d'}}>RESTAM {vivos}</div>
      <div style={{display: 'flex', gap: 8}}>
        {Object.entries(MORTE_ARENA).map(([n, m]) => (
          <div key={n} style={{position: 'relative', opacity: m > t ? 1 : 0.35, filter: m > t ? undefined : 'grayscale(1)'}}>
            <Cabeca nome={n} tam={34} />
            {m <= t ? <svg width={42} height={42} style={{position: 'absolute', left: -1, top: -1}}><path d="M4 4 L38 38 M38 4 L4 38" stroke="#ff3030" strokeWidth={6} /></svg> : null}
          </div>
        ))}
      </div>
    </div>
  );
};

const CenaReplay: React.FC<{c: Cena; obs: string; pasta: string}> = ({c, obs, pasta}) => {
  const f = useCurrentFrame();
  const capturaReal = useContext(ReutilizarAudioOriginal);
  const {width: W, height: H} = useVideoConfig();  // 1920x1080 no vídeo; 1080x1920 no Short
  const v = c.visual;
  const quem = seguido(v.camera);
  const narr = c.itens.filter((i) => i.tipo === 'n');
  const primeiraFalaIA = c.itens.find((i) => i.tipo === 'pensa' || i.tipo === 'chat' || i.tipo === 'nota');
  const dividido = v.painel === 'relatorio';
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: dividido ? 1000 : W, height: H, overflow: 'hidden', borderRight: dividido ? '4px solid #3c3' : undefined, transform: `scale(${zoomMorte(c, f)})`}}>
        <OffthreadVideo src={staticFile(`${pasta}/${c.id}.mp4`)} muted style={{width: W, height: H, marginLeft: dividido ? -460 : 0, filter: !capturaReal && v.camera?.startsWith('olhos') ? 'brightness(1.3) contrast(1.05)' : undefined}} />
      </div>
      {c.agua ? <Agua q={c.agua} primeira={!!v.camera?.startsWith('olhos')} /> : null}
      {v.camera?.startsWith('olhos') ? <Mira /> : null}
      {(v.t0 ?? 0) + f / FPS >= ZONA_INI && (v.t0 ?? 0) < 11600 ? <Zona t={(v.t0 ?? 0) + f / FPS} /> : null}
      {v.festa ? <Festa /> : null}
      {v.camera && !v.camera.startsWith('fixa') && v.painel !== 'nascimento' ? <Relogio t={(v.t0 ?? 0) + f / FPS} /> : null}
      {(v.t0 ?? 0) >= 10806 ? <Vivos t={(v.t0 ?? 0) + f / FPS} /> : null}
      {quem && v.painel !== 'relatorio' ? <HudMC nome={quem} t={(v.t0 ?? 0) + f / FPS} escala={3} /> : null}
      {v.painel === 'relatorio' ? <Relatorio texto={obs} dur={c.dur} /> : null}
      {v.painel === 'decisao' ? <Sequence durationInFrames={primeiraFalaIA ? primeiraFalaIA.at : c.dur} layout="none"><Decisao /></Sequence> : null}
      {v.painel === 'regras' ? <Regras marcos={[narr[0]?.at ?? 0, (narr[1]?.at ?? 0) + 4, (narr[2]?.at ?? 0) + 4, (narr[2]?.at ?? 0) + Math.round((narr[2] as {dur: number})?.dur * FPS * 0.62)]} /> : null}
      {v.painel === 'nascimento' && v.quem ? <Nascimento quem={v.quem} /> : null}
      {(v.popups ?? []).map((p, i) => (
        <Sequence key={'p' + i} from={Math.max(0, Math.round((p.t - (v.t0 ?? 0)) * FPS))} durationInFrames={50} layout="none">
          <PopItem p={p} />
        </Sequence>
      ))}
      {(v.conquistas ?? []).map((q, i) => (
        <Sequence key={'q' + i} from={Math.max(0, Math.round((q[2] - (v.t0 ?? 0)) * FPS))} durationInFrames={112} layout="none">
          <Conquista quem={q[0]} nome={NOME_CONQUISTA[q[1]] ?? q[1]} icone={ICONE_CONQUISTA[q[1]] ?? 'wooden_pickaxe'} />
        </Sequence>
      ))}
      {v.conquista ? (
        <Sequence from={Math.max(0, Math.round((v.conquista[2] - (v.t0 ?? 0)) * FPS))} layout="none">
          <Conquista quem={v.conquista[0]} nome={NOME_CONQUISTA[v.conquista[1]] ?? v.conquista[1]} icone={ICONE_CONQUISTA[v.conquista[1]] ?? 'wooden_pickaxe'} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

// falas (voz) e cartões de cada cena, por cima de qualquer visual
const Falas: React.FC<{c: Cena}> = ({c}) => (
  <>
    {c.itens.map((it, i) => {
      if (it.tipo === 'meme') {
        const d = Math.round(it.dur * FPS);
        return (
          <Sequence key={i} from={it.at} durationInFrames={d} layout="none">
            <MemeCard info={MEMES[it.gif]} dur={d} pos={it.pos} />
            {it.sfx ? <Audio src={staticFile(`sfx/${it.sfx}.mp3`)} volume={0.45} /> : null}
          </Sequence>
        );
      }
      if (it.tipo === 'card') {
        const ate = Math.round(it.dur * FPS) + 10;
        return <Sequence key={i} from={it.at} durationInFrames={ate} layout="none">{it.estilo === 'morte' ? <Morte texto={it.texto} ate={ate} /> : it.estilo === 'servidor' ? <MsgServidor texto={it.texto} ate={ate} /> : it.estilo === 'titulo' ? <Titulo texto={it.texto} ate={ate} /> : it.estilo === 'comentario' ? <ComentarioYT texto={it.texto} ate={ate} /> : <ErroJogo texto={it.texto} ate={ate} />}</Sequence>;
      }
      // o cartão de fala sai antes do próximo cartão de fala entrar (não sobrepõe)
      const prox = c.itens.slice(i + 1).find((o) => o.tipo === 'chat' || o.tipo === 'pensa' || o.tipo === 'nota');
      const ate = Math.min(c.dur - it.at, Math.round(it.dur * FPS) + 14, prox ? prox.at - it.at - 2 : Infinity);
      return (
        <Sequence key={i} from={it.at} layout="none">
          <Audio src={staticFile(it.src)} />
          {it.tipo !== 'n' && it.quem ? (
            <Sequence durationInFrames={ate} layout="none">
              {it.tipo === 'chat' ? <Chat quem={it.quem} a={it} ate={ate} /> : <Pensa quem={it.quem} a={it} ate={ate} rotulo={it.tipo === 'nota' ? `ANOTAÇÃO PESSOAL DO ${it.quem.toUpperCase()}` : undefined} />}
              <Audio src={staticFile('sfx/notification-pop.mp3')} volume={0.22} />
            </Sequence>
          ) : null}
        </Sequence>
      );
    })}
  </>
);

const CenaMC: React.FC<{c: Cena; obs: string; pasta: string}> = ({c, obs, pasta}) => {
  const f = useCurrentFrame();
  const v = c.visual;
  const segunda = c.itens.filter((i) => i.tipo === 'n')[1];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {v.tipo === 'replay' ? <CenaReplay c={c} obs={obs} pasta={pasta} /> : null}
      {v.tipo === 'comentarios' ? <Comentarios marco={segunda ? segunda.at : 60} /> : null}
      {v.tipo === 'mapa' ? <MapaMC tIni={v.tIni ?? 0} tFim={v.tFim ?? 110} duracao={c.dur} foco={{x: 30, z: 45, zoom: 5.2}} /> : null}
      {v.tipo === 'placar' ? <Placar titulo={v.titulo ?? ''} sub={v.sub} ranking={v.ranking !== false} linhas={v.linhas ?? []} /> : null}
      <Falas c={c} />
      {/* corte: flash branco rápido e whoosh (sem transição de lobby) */}
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 5], [0.6, 0], cl), pointerEvents: 'none'}} />
      <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.25} />
    </AbsoluteFill>
  );
};

export const AberturaMC: React.FC<{dados: Dados | null; pasta?: string}> = ({dados}) => {
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
        return <Sequence key={c.id} from={de} durationInFrames={c.dur}><CenaMC c={c} obs={dados.obsClaude} pasta={dados.pasta ?? 'mc/abertura'} /></Sequence>;
      })}
      <Audio src={staticFile('music/voxel-revolution.mp3')} loop volume={(f) => interpolate(f, [0, 20, durationInFrames - 40, durationInFrames], [0, 0.1, 0.1, 0], cl)} />
    </AbsoluteFill>
  );
};
