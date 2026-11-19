// Interface do AMONG IA 8 (The Skeld; cópia do Hud7): painel azul-marinho de borda branca, no jeito do Among Us, sem emoji (tudo SVG).
// Barra de tarefas + tique, contagem de vivos (o espectador vê quantos impostores sobram), painel de eventos do log,
// balão de fala / pensamento secreto / chat dos impostores, selo, cartão de capítulo, crédito "ideia de @fulano" e as
// transições próprias do vídeo (grade de duto fechando e abrindo; faixa de alarme).
import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COR} from '../amongus/Crewmate';
import {Crewmate4} from '../amongus/Crewmate4';
import {corTime, papelNome, type Evento, type Tique} from './Jogo8';

export const FONTE = "'Poppins', 'Inter', sans-serif";
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const PAINEL: React.CSSProperties = {background: 'linear-gradient(180deg, #16233fee, #0b1428ee)', border: '4px solid #fff', borderRadius: 18, boxShadow: '0 10px 0 #00000088'};
export const corDe = (c: string) => (COR[c] ?? COR.Branco).body;
const CONTORNO = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill'});

export const Cabeca: React.FC<{cor: string; s: number; morto?: boolean; borda?: string}> = ({cor, s, morto, borda = '#000'}) => (
  <div style={{position: 'relative', width: s, height: s, flex: 'none', borderRadius: s * 0.22, overflow: 'hidden', background: morto ? '#5a6272' : '#c7d6ea', border: `3px solid ${borda}`}}>
    <div style={{position: 'absolute', left: -s * 0.14, top: s * 0.04, filter: morto ? 'grayscale(1) brightness(0.7)' : undefined}}><Crewmate4 cor={cor} size={s * 1.25} /></div>
    {morto ? <svg viewBox="0 0 10 10" style={{position: 'absolute', inset: 0}}><path d="M2 2 L8 8 M8 2 L2 8" stroke="#ff2a2a" strokeWidth={1.3} strokeLinecap="round" /></svg> : null}
  </div>
);
export const Chip: React.FC<{papel: string; time: string; fs?: number}> = ({papel, time, fs = 18}) => (
  <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: fs, color: '#fff', background: corTime(time), border: '3px solid #000', borderRadius: 8, padding: '0 8px', whiteSpace: 'nowrap'}}>{papelNome(papel)}{time === 'impostor' ? ' · IMPOSTOR' : ''}</span>
);

// ---------- alto da tela: partida, tique e barra de tarefas ----------
export const Barra: React.FC<{partida: number; T: number; t: Tique; limite: number}> = ({partida, T, t, limite}) => (
  <div style={{position: 'absolute', left: 24, top: 22, ...PAINEL, padding: '8px 18px 12px', width: 470}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
      <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 26, color: '#fff'}}>PARTIDA {partida}</span>
      <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 26, color: '#ffd84d'}}>TIQUE {Math.max(1, Math.min(limite, Math.ceil(T)))}<span style={{color: '#9fb0cc', fontSize: 18}}> / {limite}</span></span>
    </div>
    <div style={{marginTop: 4, display: 'flex', alignItems: 'center', gap: 10}}>
      <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 15, color: '#cfe0ff', letterSpacing: 1}}>TAREFAS</span>
      <div style={{flex: 1, height: 20, borderRadius: 6, background: '#0009', border: '3px solid #000', overflow: 'hidden'}}>
        <div style={{width: `${(100 * t.tarefas) / Math.max(1, t.total)}%`, height: '100%', background: 'linear-gradient(180deg, #5cf06a, #28b83c)'}} />
      </div>
      <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 20, color: '#8dff9a'}}>{t.tarefas}/{t.total}</span>
    </div>
  </div>
);

export const Vivos: React.FC<{t: Tique}> = ({t}) => {
  const v = t.estados.filter((e) => e.vivo);
  const imp = v.filter((e) => e.time === 'impostor').length;
  const item = (n: number, rot: string, cor: string) => (
    <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
      <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 40, color: cor, ...CONTORNO(5), minWidth: 44, textAlign: 'right'}}>{n}</span>
      <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 15, color: '#cfe0ff', letterSpacing: 1}}>{rot}</span>
    </div>
  );
  return (
    <div style={{position: 'absolute', right: 24, top: 22, ...PAINEL, padding: '4px 18px', display: 'flex', gap: 20}}>
      {item(v.length - imp, 'INOCENTES', '#fff')}
      {item(imp, imp === 1 ? 'IMPOSTOR' : 'IMPOSTORES', '#ff5a4a')}
    </div>
  );
};

// ---------- painel de eventos (o que o log registrou nos últimos tiques) ----------
const SALA_N: Record<string, string> = {Refeitorio: 'Refeitório', Navegacao: 'Navegação', Comunicacoes: 'Comunicações', Deposito: 'Depósito', Eletrica: 'Elétrica', MotorInferior: 'Motor Inferior', Seguranca: 'Segurança', MotorSuperior: 'Motor Superior'};
const sn = (s: unknown) => SALA_N[String(s)] ?? String(s);
const SAB: Record<string, string> = {Luzes: 'luzes', O2: 'oxigênio', Sismografo: 'sismógrafo'};
// segredo (abertura): nada que entregue quem está disfarçado de quem
function texto(e: Evento, segredo = false): [string, string] | null {
  const p = e.tipo === 'poder' ? String(e.poder) : '';
  switch (e.tipo === 'poder' ? p : e.tipo) {
    case 'morte': return ['#ff3a3a', segredo ? `${e.aparente} matou ${e.vitima}` : `${e.assassino}${e.aparente !== e.assassino ? ` (como ${e.aparente})` : ''} matou ${e.vitima}`];
    case 'escudo': return ['#5ad0ff', segredo ? `escudo do Anjo salvou ${e.vitima}` : `escudo salvou ${e.vitima} de ${e.assassino}${e.aparente !== e.assassino ? ` (como ${e.aparente})` : ''}`];
    case 'transformacao': return segredo ? null : ['#ff9a2a', `${e.cor} virou ${e.em}`];
    case 'duto': return ['#6dff8a', segredo ? `${e.aparente ?? e.cor} usou duto` : `${e.cor}${e.aparente && e.aparente !== e.cor ? ` (como ${e.aparente})` : ''} usou duto`];
    case 'invisivel': return ['#c9d6ff', `${e.cor} ficou invisível`];
    case 'reaparece': return ['#c9d6ff', `${e.cor} apareceu`];
    case 'derreteu': return ['#7dff5a', `o corpo de ${e.cor} derreteu`];
    case 'portas': return ['#ffd23a', `${e.cor} trancou ${sn(e.sala)}`];
    case 'sabotagem': return ['#ff5a4a', `sabotagem: ${SAB[String(e.subtipo)] ?? e.subtipo}`];
    case 'conserto': return ['#8dff9a', `${SAB[String(e.subtipo)] ?? e.subtipo} consertado`];
    case 'interrogar': return ['#22c4d4', `Detetive ${e.cor}: ${e.alvo} estava em ${sn(e.onde)}`];
    case 'caso_aberto': return ['#22c4d4', `Detetive: o assassino é ${papelNome(String(e.tipoImpostor))}`];
    case 'escudo_anjo': return ['#ffffff', `Anjo ${e.cor} protegeu ${e.alvo}`];
    case 'rastrear': return ['#7bd400', `${e.cor} rastreou ${e.alvo}`];
    default: return null;
  }
}
// a linha entra deslizando em ~8 quadros desde o começo do tique (fDe: quadro da cena em que o relógio passa por T)
export const Feed: React.FC<{eventos: Evento[]; T: number; segredo?: boolean; f?: number; fDe?: (t: number) => number; esconder?: boolean}> = ({eventos, T, segredo, esconder}) => {
  if (esconder) return null;
  const n = Math.ceil(T);
  const itens = eventos.filter((e) => e.tique <= n && e.tique > n - 5 && texto(e, segredo)).slice(-5);
  return (
    <div style={{position: 'absolute', right: 28, top: 108, width: 376, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 7, pointerEvents: 'none'}}>
      {itens.map((e, i) => {
        const [cor, tx] = texto(e, segredo)!;
        const idade = T - (e.tique - 0.85);
        if (idade < 0) return null;
        const entra = Math.max(0.25, Math.min(1, idade * 6));
        return (
          <div key={`${e.tique}_${i}_${tx}`} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '5px 12px', boxSizing: 'border-box', width: '100%', background: '#0b1428ee', border: `3px solid ${cor}`, borderRadius: 12, opacity: entra * Math.max(0.72, 1 - Math.max(0, n - e.tique) * 0.12)}}>
            <span style={{width: 13, height: 13, borderRadius: 7, background: cor, flex: 'none', border: '2px solid #000'}} />
            <span style={{fontFamily: FONTE, fontWeight: 800, fontSize: 18, color: '#fff', lineHeight: 1.15, overflowWrap: 'anywhere'}}>{tx}</span>
          </div>
        );
      })}
    </div>
  );
};

// ---------- balão: fala (reunião), pensamento secreto (eco na voz) ou chat dos impostores ----------
export const Balao: React.FC<{k: 'fala' | 'pensa' | 'chat'; cor: string; modelo: string; papel?: string; time?: string; texto: string; f: number; dur: number}> = ({k, cor, modelo, papel, time, texto, f, dur}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 14, stiffness: 160}});
  const sai = interpolate(f, [dur - 6, dur], [1, 0], cl);
  const n = Math.floor(interpolate(f, [3, Math.max(8, Math.min(dur * 0.4, texto.length * 0.8))], [0, texto.length], cl));
  const imp = time === 'impostor';
  const borda = k === 'pensa' ? '#b88cff' : k === 'chat' || imp ? '#ff4a3a' : '#fff';
  const rot = k === 'pensa' ? 'PENSAMENTO SECRETO' : k === 'chat' ? 'CHAT SECRETO DOS IMPOSTORES' : 'FALOU';
  const fs = texto.length <= 3 ? 64 : texto.length > 210 ? 28 : texto.length > 150 ? 31 : 35; // "..." literal do log: grande, é a piada
  return (
    <div style={{position: 'absolute', left: 230, right: 230, bottom: 34, transform: `translateY(${(1 - e) * 300}px)`, opacity: Math.min(e, sai)}}>
      <div style={{...PAINEL, border: `5px ${k === 'pensa' ? 'dashed' : 'solid'} ${borda}`, background: k === 'pensa' ? 'linear-gradient(180deg, #24163fee, #120a26ee)' : k === 'chat' ? 'linear-gradient(180deg, #3a1016ee, #1c080cee)' : PAINEL.background, padding: '14px 22px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6}}>
          <Cabeca cor={cor} s={54} />
          <span style={{fontFamily: FONTE, fontWeight: 900, fontSize: 30, color: imp ? '#ff7a6a' : '#fff'}}>{cor}</span>
          <span style={{fontFamily: FONTE, fontWeight: 600, fontSize: 20, color: '#b9c6de'}}>{modelo}</span>
          {papel && time ? <Chip papel={papel} time={time} /> : null}
          <span style={{marginLeft: 'auto', fontFamily: FONTE, fontWeight: 900, fontSize: 18, letterSpacing: 2, color: borda}}>{rot}</span>
        </div>
        <div style={{fontFamily: FONTE, fontWeight: k === 'pensa' ? 600 : 700, fontStyle: k === 'pensa' ? 'italic' : undefined, fontSize: fs, color: k === 'pensa' ? '#e9defF' : '#fff', lineHeight: 1.22}}>{k === 'fala' ? texto.slice(0, n) : `“${texto.slice(0, n)}${n < texto.length ? '' : '”'}`}</div>
      </div>
    </div>
  );
};

// selo centralizado (carimbo torto), fonte menor quando o texto é longo
// comMeme: o meme ocupa a direita da tela; o selo vai para a esquerda para um não tapar o outro
// baixo: um número grande está na tela ao mesmo tempo (ele ocupa a faixa de cima); o selo desce para não cobrir
export const Selo: React.FC<{texto: string; cor?: string; f: number; comMeme?: boolean; baixo?: boolean; sobreVotos?: boolean; temBalao?: boolean}> = ({texto, cor = '#e8701a', f, comMeme, baixo, sobreVotos, temBalao}) => {
  const e = interpolate(f, [0, 6], [2.2, 1], cl);
  const sheen = interpolate(f, [5, 22], [-35, 135], cl);
  const fs = texto.length > 34 ? 40 : texto.length > 22 ? 50 : 62;
  if (sobreVotos) {
    return (
      <div style={{position: 'absolute', left: 40, right: comMeme ? 470 : 40, bottom: 52, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
        <div style={{position: 'relative', overflow: 'hidden', fontFamily: FONTE, fontWeight: 900, fontSize: Math.min(fs, comMeme ? 46 : 54), color: '#fff', background: `linear-gradient(180deg, ${cor}, ${cor}dd)`, border: '6px solid #fff', maxWidth: comMeme ? 1360 : 1620, textAlign: 'center', borderRadius: 18, padding: '8px 34px', transform: `rotate(-2.2deg) scale(${e})`, opacity: interpolate(f, [0, 3], [0, 1], cl), boxShadow: `0 12px 0 #0009, 0 0 34px ${cor}66`, ...CONTORNO(3)}}>
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(112deg, transparent ${sheen - 18}%, rgba(255,255,255,0.42) ${sheen}%, transparent ${sheen + 18}%)`, pointerEvents: 'none'}} />
          <span style={{position: 'relative'}}>{texto}</span>
        </div>
      </div>
    );
  }
  const topPos = baixo ? 560 : temBalao ? 146 : 228;
  return (
    <div style={{position: 'absolute', left: comMeme ? 30 : 0, right: comMeme ? 700 : 0, top: topPos, display: 'flex', justifyContent: 'center', pointerEvents: 'none'}}>
      <div style={{position: 'relative', overflow: 'hidden', fontFamily: FONTE, fontWeight: 900, fontSize: comMeme ? Math.min(fs, 52) : fs, color: '#fff', background: `linear-gradient(180deg, ${cor}, ${cor}dd)`, border: '7px solid #fff', maxWidth: comMeme ? 1150 : 1500, textAlign: 'center', borderRadius: 18, padding: '6px 38px', transform: `rotate(-4deg) scale(${e})`, opacity: interpolate(f, [0, 3], [0, 1], cl), boxShadow: `0 14px 0 #0009, 0 0 38px ${cor}66`, ...CONTORNO(3)}}>
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(112deg, transparent ${sheen - 18}%, rgba(255,255,255,0.42) ${sheen}%, transparent ${sheen + 18}%)`, pointerEvents: 'none'}} />
        <span style={{position: 'relative'}}>{texto}</span>
      </div>
    </div>
  );
};

export const Numero8: React.FC<{texto: string; sub?: string; dur: number; sobreVotos?: boolean}> = ({texto, sub, dur, sobreVotos}) => {
  const f = useCurrentFrame();
  const e = interpolate(f, [0, 7], [2.2, 1], cl);
  const o = interpolate(f, [0, 4, dur - 8, dur], [0, 1, 1, 0], cl);
  if (sobreVotos) {
    return (
      <div style={{position: 'absolute', left: 40, right: 40, bottom: 26, display: 'flex', justifyContent: 'center', opacity: o, pointerEvents: 'none'}}>
        <div style={{...PAINEL, border: '5px solid #ffd84d', background: 'linear-gradient(180deg, rgba(16,24,48,0.96), rgba(8,12,26,0.98))', padding: '12px 54px 14px', textAlign: 'center', transform: `scale(${e})`, boxShadow: '0 16px 40px rgba(0,0,0,0.75), 0 0 36px rgba(255,216,77,0.28)'}}>
          <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 102, lineHeight: 0.98, color: '#ffd84d', WebkitTextStroke: '11px #000', paintOrder: 'stroke fill'}}>{texto}</div>
          {sub ? <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 34, color: '#f8fafc', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill', marginTop: 4}}>{sub}</div> : null}
        </div>
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', top: 196, left: 40, right: 40, textAlign: 'center', opacity: o, pointerEvents: 'none'}}>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 158, lineHeight: 1, color: '#ffd400', transform: `scale(${e})`, WebkitTextStroke: '16px #000', paintOrder: 'stroke fill'}}>{texto}</div>
      {sub ? <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 44, color: '#fff', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', marginTop: 6}}>{sub}</div> : null}
    </div>
  );
};

// cartão de capítulo: número da partida em cima, título-história embaixo
export const Capitulo: React.FC<{titulo: string; sub?: string; f: number; dur: number}> = ({titulo, sub, f, dur}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 13, stiffness: 150}});
  const out = interpolate(f, [dur - 18, dur], [1, 0], cl);
  const lineW = interpolate(f, [4, 24], [0, 100], cl);
  const sheen = interpolate(f, [8, 32], [-30, 130], cl);
  return (
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 45%, rgba(7,12,28,${0.48 * e * out}), rgba(3,6,16,${0.72 * e * out}))`, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', opacity: out}}>
      <div style={{position: 'relative', overflow: 'hidden', ...PAINEL, border: '6px solid #ffd84d', padding: '24px 72px 26px', textAlign: 'center', transform: `scale(${0.72 + 0.28 * e}) translateY(${(1 - e) * 24}px)`, boxShadow: '0 22px 60px rgba(0,0,0,0.75), 0 0 44px rgba(255,216,77,0.22)'}}>
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, transparent ${sheen - 15}%, rgba(255,255,255,0.22) ${sheen}%, transparent ${sheen + 15}%)`, pointerEvents: 'none'}} />
        {sub ? <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 28, color: '#cfe0ff', letterSpacing: 4 + 4 * e, position: 'relative'}}>{sub.toUpperCase()}</div> : null}
        <div style={{width: `${lineW}%`, maxWidth: 420, height: 4, borderRadius: 4, margin: '10px auto 12px', background: 'linear-gradient(90deg, transparent, #ffd84d, transparent)'}} />
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: titulo.length > 26 ? 58 : 74, color: '#ffd84d', ...CONTORNO(8), letterSpacing: 1, position: 'relative'}}>{titulo.toUpperCase()}</div>
      </div>
    </div>
  );
};

// crédito de quem pediu a função: "ideia de @fulano" (canto de baixo, à esquerda, com lâmpada em SVG)
export const Ideia: React.FC<{autor: string; oque?: string; f: number; dur: number}> = ({autor, oque, f, dur}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 13, stiffness: 170}});
  return (
    <div style={{position: 'absolute', left: 24, bottom: 36, transform: `translateX(${(1 - e) * -520}px)`, opacity: interpolate(f, [dur - 8, dur], [1, 0], cl)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '5px solid #000', borderRadius: 16, padding: '6px 18px 6px 10px', boxShadow: '0 8px 0 #0008', transform: 'rotate(-2deg)'}}>
        <svg width={46} height={46} viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" fill="#ffd84d" stroke="#000" strokeWidth={1.6} /><path d="M9 19.5h6M10 22h4" stroke="#000" strokeWidth={1.8} strokeLinecap="round" /></svg>
        <div>
          <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 17, color: '#555', letterSpacing: 1, lineHeight: 1}}>{oque ? `${oque.toUpperCase()} · ` : ''}IDEIA DE</div>
          <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 28, color: '#111', lineHeight: 1.1}}>{autor}</div>
        </div>
      </div>
    </div>
  );
};

// cartão de fim de partida
export const FimPartida: React.FC<{titulo: string; sub?: string; cor?: string; f: number; dur: number}> = ({titulo, sub, cor = '#ffd84d', f, dur}) => {
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 11, stiffness: 135}});
  const fadeIn = Math.min(1, f / 8);
  const fadeOut = interpolate(f, [dur - 10, dur], [1, 0], cl);
  const barH = Math.round(78 * e);
  const ruleW = interpolate(f, [5, 22], [0, 760], cl);
  const glow = 0.25 + 0.1 * Math.sin(f / 7);
  return (
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 50%, rgba(6,10,24,${0.97 * fadeIn}), rgba(2,4,12,${0.995 * fadeIn}))`, backdropFilter: `blur(${Math.round(18 * fadeIn)}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: fadeOut}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: barH, background: '#02040a', borderBottom: `3px solid ${cor}66`}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: barH, background: '#02040a', borderTop: `3px solid ${cor}66`}} />
      <div style={{position: 'absolute', width: 1100, height: 340, borderRadius: '50%', background: `radial-gradient(circle, ${cor}${Math.round(glow * 255).toString(16).padStart(2, '0')}, transparent 70%)`, filter: 'blur(24px)', pointerEvents: 'none'}} />
      <div style={{position: 'relative', textAlign: 'center', padding: '0 80px', transform: `scale(${0.62 + 0.38 * e})`}}>
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 132, color: cor, ...CONTORNO(16), lineHeight: 1.02, letterSpacing: 2, textShadow: `0 0 42px ${cor}66`}}>{titulo.toUpperCase()}</div>
        <div style={{width: ruleW, height: 6, borderRadius: 6, margin: '18px auto 16px', background: `linear-gradient(90deg, transparent, ${cor}, transparent)`}} />
        {sub ? <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 42, color: '#f1f5f9', ...CONTORNO(8), letterSpacing: 0.5}}>{sub}</div> : null}
      </div>
    </div>
  );
};

// ---------- transições próprias do AU8 (o corte cai no quadro 22) ----------
export const DUR_TRANS8 = 44;
export const Transicao8: React.FC<{tipo: 'duto' | 'alarme' | 'o2'; f: number}> = ({tipo, f}) => {
  const k = f <= 22 ? interpolate(f, [0, 16], [0, 1], cl) : interpolate(f, [26, 44], [1, 0], cl);
  const e = k * k * (3 - 2 * k);
  if (tipo === 'o2') {
    return (
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{position: 'absolute', left: -200, width: 2400, top: i * 180, height: 181, background: i % 2 ? '#c4142c' : '#082032', transform: `translateX(${(i % 2 ? 1 : -1) * (1 - e) * 2400}px) skewX(-12deg)`, borderTop: '8px solid #22d3ee', borderBottom: '8px solid #000'}} />
        ))}
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: e}}>
          <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 118, color: '#22d3ee', ...CONTORNO(16), letterSpacing: 3}}>SABOTAGEM O2!</div>
          <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 40, color: '#fff', ...CONTORNO(8), marginTop: 6}}>OXIGÊNIO ACABANDO · DOIS PAINÉIS</div>
        </div>
      </div>
    );
  }
  if (tipo === 'alarme') {
    return (
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{position: 'absolute', left: -200, width: 2400, top: i * 180, height: 181, background: i % 2 ? '#d81818' : '#ffd23a', transform: `translateX(${(i % 2 ? 1 : -1) * (1 - e) * 2400}px) skewX(-12deg)`, borderTop: '8px solid #000', borderBottom: '8px solid #000'}} />
        ))}
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: e, fontFamily: FONTE, fontWeight: 900, fontSize: 130, color: '#fff', ...CONTORNO(18)}}>REUNIÃO!</div>
      </div>
    );
  }
  // grade de duto: duas tampas de ripas se fecham no meio da tela e abrem de novo
  const ripas = (
    <svg width={1920} height={560} viewBox="0 0 1920 560">
      <rect width={1920} height={560} fill="#3d4a44" stroke="#000" strokeWidth={14} />
      {Array.from({length: 7}).map((_, i) => <rect key={i} x={60} y={36 + i * 72} width={1800} height={40} rx={12} fill="#1c2420" stroke="#000" strokeWidth={8} />)}
      {[30, 1890].map((x) => [30, 530].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={13} fill="#9aa8a0" stroke="#000" strokeWidth={5} />))}
    </svg>
  );
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, top: -560 + e * 550}}>{ripas}</div>
      <div style={{position: 'absolute', left: 0, top: 1080 - e * 550}}>{ripas}</div>
    </div>
  );
};
