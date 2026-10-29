// Peças visuais comuns do vídeo do Minecraft (abertura e cenas): as IAs (cor, modelo, cabeça da skin), cartões de
// pensamento e de chat no estilo do jogo, mensagem de erro do jogo e a notificação de conquista com o sprite oficial.
// Sem emoji (regra do canal): ícones em SVG/CSS ou texturas do jogo.
import React from 'react';
import {Audio, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from '../theme';

export const FPS = 30;
export const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export const IAS: Record<string, {modelo: string; empresa: string; cor: string}> = {
  DeepSeek: {modelo: 'DeepSeek V4.1 Flash', empresa: 'DeepSeek', cor: '#4d6bfe'},
  Qwen: {modelo: 'Qwen 3.8 27B', empresa: 'Alibaba', cor: '#8b6cff'},
  Claude: {modelo: 'Claude Sonnet 5.5', empresa: 'Anthropic', cor: '#d97757'},
  GPT: {modelo: 'GPT-5.6 Luna', empresa: 'OpenAI', cor: '#10a37f'},
  GLM: {modelo: 'GLM 5.3 Flash', empresa: 'Z.ai', cor: '#3d7bff'},
  MiMo: {modelo: 'MiMo V2.6 Flash', empresa: 'Xiaomi', cor: '#ff6900'},
};

// cabeça da skin (8x8 em 8,8 do PNG 64x64, mais a camada do chapéu em 40,8), pixelada
export const Cabeca: React.FC<{nome: string; tam: number}> = ({nome, tam}) => (
  <div style={{width: tam, height: tam, overflow: 'hidden', position: 'relative', border: `${Math.max(3, Math.round(tam / 16))}px solid #000`, boxSizing: 'content-box', flexShrink: 0}}>
    <Img src={staticFile(`mc_previa/skins/${nome}.png`)} style={{position: 'absolute', width: tam * 8, height: tam * 8, left: -tam, top: -tam, imageRendering: 'pixelated'}} />
    <Img src={staticFile(`mc_previa/skins/${nome}.png`)} style={{position: 'absolute', width: tam * 8, height: tam * 8, left: -tam * 5, top: -tam, imageRendering: 'pixelated'}} />
  </div>
);

type Palavra = {w: string; s: number; e: number};
export type Fala = {texto: string; dur: number; palavras: Palavra[]};
// quanto do texto já foi falado (pelas palavras do TTS; sem elas, proporcional ao tempo)
export function falado(a: Fala, f: number) {
  const t = f / FPS;
  const ws = a.texto.split(' ');
  if (a.palavras.length === ws.length) return ws.slice(0, Math.max(1, a.palavras.filter((p) => p.s <= t).length)).join(' ');
  return a.texto.slice(0, Math.max(1, Math.round((a.texto.length * t) / Math.max(0.5, a.dur * 0.92))));
}

// pensamento (e anotação pessoal): cartão com borda tracejada (nuvem), cabeça e o texto acompanhando a voz com eco
export const Pensa: React.FC<{quem: string; a: Fala; ate: number; rotulo?: string}> = ({quem, a, ate, rotulo}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f, fps: FPS, config: {damping: 13}});
  const sai = interpolate(f, [ate - 7, ate], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 250, right: 250, bottom: 150, opacity: sai, transform: `scale(${0.85 + e * 0.15}) translateY(${(1 - e) * 60}px)`}}>
      <div style={{background: 'rgba(255,255,255,0.96)', border: '6px dashed #5b5b8f', borderRadius: 40, padding: '22px 34px', display: 'flex', gap: 22, alignItems: 'flex-start', boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
        <Cabeca nome={quem} tam={64} />
        <div>
          <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 26, color: '#5b5b8f', letterSpacing: 1}}>{rotulo ?? `${quem.toUpperCase()} PENSOU`}</div>
          <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 36, color: '#1c1c2a', lineHeight: 1.25, marginTop: 4}}>{falado(a, f)}</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 60, top: -34, width: 26, height: 26, borderRadius: 13, background: '#fff', border: '4px dashed #5b5b8f'}} />
      <div style={{position: 'absolute', left: 36, top: -66, width: 16, height: 16, borderRadius: 8, background: '#fff', border: '3px dashed #5b5b8f'}} />
    </div>
  );
};

// chat do jogo: fundo escuro translúcido, "<Nome> mensagem", letra pixelada
export const Chat: React.FC<{quem: string; a: Fala; ate: number}> = ({quem, a, ate}) => {
  const f = useCurrentFrame();
  const sai = interpolate(f, [ate - 7, ate], [1, 0], cl);
  const e = spring({frame: f, fps: FPS, config: {damping: 15}});
  return (
    <div style={{position: 'absolute', left: 40, bottom: 190, maxWidth: 1300, opacity: sai, transform: `translateY(${(1 - e) * 40}px)`}}>
      <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: '#fff', background: IAS[quem].cor, display: 'inline-block', padding: '2px 12px', marginBottom: 6}}>CHAT DO SERVIDOR</div>
      <div style={{background: 'rgba(0,0,0,0.66)', padding: '12px 20px', fontFamily: FONT.pixel, fontSize: 25, color: '#fff', lineHeight: 1.6, textShadow: '3px 3px 0 #3f3f3f'}}>
        <span style={{color: IAS[quem].cor}}>{'<'}{quem}{'>'}</span> {falado(a, f)}
      </div>
    </div>
  );
};

// resposta do jogo pra uma ação que falhou (o texto do log), em vermelho como as mensagens de erro do Minecraft
export const ErroJogo: React.FC<{texto: string; ate: number}> = ({texto, ate}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f, fps: FPS, config: {damping: 10, stiffness: 180}});
  const sai = interpolate(f, [ate - 6, ate], [1, 0], cl);
  const treme = f < 10 ? Math.sin(f * 2.4) * (10 - f) * 0.9 : 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', opacity: sai}}>
      <div style={{transform: `scale(${0.7 + e * 0.3}) translateX(${treme}px)`, background: 'rgba(20,0,0,0.85)', border: '5px solid #ff5555', padding: '18px 30px', maxWidth: 1500}}>
        <div style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: '#ffaaaa', letterSpacing: 2, marginBottom: 8}}>RESPOSTA DO JOGO</div>
        <div style={{fontFamily: FONT.pixel, fontSize: 28, color: '#ff5555', lineHeight: 1.5, textShadow: '3px 3px 0 #3f1515'}}>{texto}</div>
      </div>
      <Audio src={staticFile('sfx/error-beep.mp3')} volume={0.3} />
    </div>
  );
};

// mensagem de morte do servidor: tela avermelhada como a "Você morreu!" do jogo, com a frase do log
export const Morte: React.FC<{texto: string; ate: number}> = ({texto, ate}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 4, ate - 6, ate], [0, 1, 1, 0], cl);
  return (
    <div style={{position: 'absolute', inset: 0, background: 'rgba(120,0,0,0.45)', opacity: o, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT.pixel, fontSize: 64, color: '#fff', textShadow: '6px 6px 0 #3f3f3f'}}>Você morreu!</div>
      <div style={{fontFamily: FONT.pixel, fontSize: 30, color: '#fff', marginTop: 30, textShadow: '3px 3px 0 #3f3f3f'}}>{texto}</div>
      <Audio src={staticFile('sfx/death.mp3')} volume={0.4} />
    </div>
  );
};

// mensagem do servidor no chat (mortes, entradas, avisos do Rcon), em amarelo como as do jogo
export const MsgServidor: React.FC<{texto: string; ate: number}> = ({texto, ate}) => {
  const f = useCurrentFrame();
  const e = spring({frame: f, fps: FPS, config: {damping: 14}});
  const sai = interpolate(f, [ate - 6, ate], [1, 0], cl);
  const morte = /drowned|slain|shot|blown|suffocated|lava|ground|confines|FORA/.test(texto);
  return (
    <div style={{position: 'absolute', left: 40, top: 300, maxWidth: 1500, opacity: sai, transform: `translateX(${(1 - e) * -80}px)`}}>
      <div style={{background: 'rgba(0,0,0,0.66)', padding: '14px 22px', fontFamily: FONT.pixel, fontSize: 30, lineHeight: 1.5, color: morte ? '#ff5555' : '#ffff55', textShadow: `3px 3px 0 ${morte ? '#3f1515' : '#3f3f15'}`}}>{texto}</div>
      {f === 0 ? <Audio src={staticFile(morte ? 'sfx/death.mp3' : 'sfx/notification-pop.mp3')} volume={0.35} /> : null}
    </div>
  );
};

// título de capítulo ("PARTE 1|A PRIMEIRA NOITE"): faixa grande que entra e sai, com a letra de quadrinho
export const Titulo: React.FC<{texto: string; ate: number}> = ({texto, ate}) => {
  const f = useCurrentFrame();
  const [a, b] = texto.split('|');
  const e = spring({frame: f, fps: FPS, config: {damping: 12}});
  const sai = interpolate(f, [ate - 8, ate], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', opacity: sai}}>
      <div style={{transform: `scale(${0.6 + e * 0.4}) rotate(${(1 - e) * -6}deg)`, background: 'rgba(0,0,0,0.82)', border: '6px solid #ffe14d', padding: '18px 60px', textAlign: 'center'}}>
        <div style={{fontFamily: FONT.pixel, fontSize: 34, color: '#ffe14d', letterSpacing: 4}}>{a}</div>
        <div style={{fontFamily: FONT.comic, fontSize: 120, color: '#fff', letterSpacing: 4, lineHeight: 1.05, textShadow: '6px 6px 0 #000'}}>{b}</div>
      </div>
      {f === 0 ? <Audio src={staticFile('sfx/impact-epic.mp3')} volume={0.3} /> : null}
    </div>
  );
};

// comentário do YouTube que inspirou uma regra ("@autor|texto")
export const ComentarioYT: React.FC<{texto: string; ate: number}> = ({texto, ate}) => {
  const f = useCurrentFrame();
  const [autor, t] = texto.split('|');
  const e = spring({frame: f, fps: FPS, config: {damping: 12}});
  const sai = interpolate(f, [ate - 7, ate], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 360, right: 360, top: 330, opacity: sai, transform: `scale(${0.6 + e * 0.4}) rotate(-1.5deg)`, background: '#fff', borderRadius: 18, padding: '22px 28px', boxShadow: '0 0 0 8px #ffe14d, 0 14px 0 rgba(0,0,0,0.4)'}}>
      <div style={{display: 'flex', gap: 14, alignItems: 'center', marginBottom: 10}}>
        <div style={{width: 52, height: 52, borderRadius: 26, background: '#e53935', color: '#fff', fontFamily: FONT.display, fontWeight: 800, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{autor[1].toUpperCase()}</div>
        <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 28, color: '#0f0f0f'}}>{autor}</div>
      </div>
      <div style={{fontFamily: 'Roboto, ' + FONT.display, fontSize: 36, color: '#0f0f0f', lineHeight: 1.35}}>{t}</div>
      {f === 0 ? <Audio src={staticFile('sfx/notification-pop.mp3')} volume={0.35} /> : null}
    </div>
  );
};

// notificação de conquista (o sprite oficial do toast), entrando pela direita como no jogo
export const Conquista: React.FC<{quem: string; nome: string; icone: string}> = ({quem, nome, icone}) => {
  const f = useCurrentFrame();
  const entra = interpolate(f, [0, 8], [1, 0], cl), sai = interpolate(f, [100, 110], [0, 1], cl);
  const x = (entra + sai) * 560;
  const S = 3.4; // escala do sprite (160x32)
  return (
    <div style={{position: 'absolute', right: 30, top: 30, width: 160 * S, height: 32 * S, transform: `translateX(${x}px)`}}>
      <Img src={staticFile('mc/ui/toast_advancement.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', imageRendering: 'pixelated'}} />
      <Img src={staticFile(`mc/ui/${icone}.png`)} style={{position: 'absolute', left: 8 * S, top: 8 * S, width: 16 * S, height: 16 * S, imageRendering: 'pixelated'}} />
      <div style={{position: 'absolute', left: 30 * S, top: 7 * S, fontFamily: FONT.pixel, fontSize: 17, color: '#ffff00', textShadow: '2px 2px 0 #3f3f00'}}>{quem}: conquista!</div>
      <div style={{position: 'absolute', left: 30 * S, top: 18 * S, fontFamily: FONT.pixel, fontSize: 17, color: '#fff', textShadow: '2px 2px 0 #3f3f3f'}}>{nome}</div>
      <Audio src={staticFile('sfx/level-up.mp3')} volume={0.35} />
    </div>
  );
};

// fundo de terra escurecida dos menus do Minecraft (textura oficial, ladrilhada e pixelada)
export const FundoTerra: React.FC<{escuro?: number}> = ({escuro = 0.55}) => (
  <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('mc/ui/dirt.png')})`, backgroundSize: '96px 96px', imageRendering: 'pixelated'}}>
    <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${escuro})`}} />
  </div>
);
