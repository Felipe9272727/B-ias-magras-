// Tela de jogo no estilo do Wolvesville (arte própria): grade de quadrados dos jogadores (céu + grama, número e nome),
// barra da fase em cima, faixa rosa de aviso embaixo e o chat à direita. De noite tudo fica azul-escuro.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Avatar, AvatarId, AVATARES, Expressao} from './Avatar';
import {IconePapel, IconeUi, Papel, PAPEIS} from './Papeis';

export const ROSA = '#ff3d7f';
export const AZUL = '#0f2433';
export const FONTE = "'Poppins', system-ui, sans-serif";
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export const MARCA: Record<string, {nome: string; cor: string}> = {
  'Claude Haiku': {nome: 'Claude', cor: '#d97757'},
  'GLM 5.3 Flash': {nome: 'GLM', cor: '#3b82f6'},
  'Qwen 3.8 27B': {nome: 'Qwen', cor: '#7c3aed'},
  'DeepSeek Flash': {nome: 'DeepSeek', cor: '#4d6bfe'},
  'MiniMax M3.1 Flash': {nome: 'MiniMax', cor: '#e73562'},
};

export type Jogador = {id: AvatarId; nome: string; modelo: string; papel: Papel; numero: number};

// ---------------------------------------------------------------- quadrado do jogador
export type EstadoQuadro = {
  expressao?: Expressao; falando?: boolean; morto?: boolean; revelado?: boolean; votos?: number; destaque?: boolean;
  lobo?: boolean; preso?: boolean; protegido?: boolean; mira?: boolean; apagado?: boolean; marca?: boolean;
};

export const Quadro: React.FC<{j: Jogador; s: EstadoQuadro; noite: boolean; t: number; tam?: number}> = ({j, s, noite, t, tam = 300}) => {
  const ceu = noite ? ['#16264a', '#243a66'] : ['#5cc8f2', '#9fe3fb'];
  const grama = noite ? ['#1f4a33', '#173a28'] : ['#7bc950', '#5daf37'];
  const gid = `g-${j.id}-${noite ? 'n' : 'd'}`;
  const m = MARCA[j.modelo];
  return (
    <div style={{position: 'relative', width: tam, height: tam, borderRadius: 14, overflow: 'hidden', boxShadow: s.destaque ? `0 0 0 6px #ffd54f, 0 12px 30px rgba(0,0,0,0.5)` : '0 4px 10px rgba(0,0,0,0.35)', opacity: s.apagado ? 0.55 : 1}}>
      <svg width={tam} height={tam} viewBox="0 0 200 200" style={{position: 'absolute', filter: s.morto ? 'grayscale(1) brightness(0.55)' : undefined}}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ceu[0]} /><stop offset="1" stopColor={ceu[1]} /></linearGradient>
        </defs>
        <rect width={200} height={200} fill={`url(#${gid})`} />
        {noite ? [[24, 30], [60, 18], [150, 26], [176, 50], [110, 14], [30, 70]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.6 + (i % 2)} fill="#fff" opacity={0.5 + 0.5 * Math.abs(Math.sin((t + i * 13) / 14))} />) : <g fill="#fff" opacity={0.85}><ellipse cx={40} cy={36} rx={20} ry={8} /><ellipse cx={54} cy={30} rx={14} ry={9} /><ellipse cx={162} cy={52} rx={16} ry={6} /></g>}
        <path d="M0 150 Q60 128 110 142 Q160 154 200 136 L200 200 L0 200Z" fill={grama[0]} />
        <path d="M0 172 Q80 160 200 176 L200 200 L0 200Z" fill={grama[1]} />
        <g transform="translate(18 22) scale(0.82)"><Avatar id={j.id} expressao={s.expressao} falando={s.falando} t={t} morto={s.morto} /></g>
        {s.preso ? <g>{[26, 58, 90, 122, 154, 186].map((x) => <rect key={x} x={x - 5} y={0} width={10} height={200} fill="#78909c" stroke="#455a64" strokeWidth={2} />)}<rect x={0} y={36} width={200} height={10} fill="#607d8b" /></g> : null}
      </svg>
      {s.lobo ? <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 6px #e53935', background: 'rgba(229,57,53,0.18)', borderRadius: 14}} /> : null}
      <div style={{position: 'absolute', left: 10, top: 6, fontFamily: FONTE, fontWeight: 800, fontSize: tam * 0.085, color: '#fff', textShadow: '0 2px 3px rgba(0,0,0,0.7)', whiteSpace: 'nowrap'}}>
        {j.numero} {j.nome}
      </div>
      {s.marca !== false && m ? <div style={{position: 'absolute', left: 10, top: tam * 0.125, fontFamily: FONTE, fontWeight: 800, fontSize: tam * 0.055, color: '#fff', background: m.cor, borderRadius: 99, padding: '1px 10px'}}>{m.nome}</div> : null}
      {s.lobo ? <div style={{position: 'absolute', right: 8, top: 8}}><IconeUi nome="pata" tamanho={tam * 0.13} cor="#ff5252" /></div> : null}
      {s.protegido ? <div style={{position: 'absolute', right: 8, top: 8}}><IconePapel papel="medico" tamanho={tam * 0.17} /></div> : null}
      {s.morto || s.revelado ? (
        <div style={{position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <IconePapel papel={j.papel} tamanho={tam * 0.36} />
          <div style={{marginTop: 4, fontFamily: FONTE, fontWeight: 900, fontSize: tam * 0.075, color: '#fff', background: PAPEIS[j.papel].cor, borderRadius: 8, padding: '0 10px', border: '3px solid #fff', whiteSpace: 'nowrap'}}>{PAPEIS[j.papel].nome}</div>
        </div>
      ) : null}
      {s.morto ? <div style={{position: 'absolute', right: 8, bottom: 8}}><IconeUi nome="caveira" tamanho={tam * 0.13} /></div> : null}
      {s.votos ? (
        <div style={{position: 'absolute', right: 10, bottom: 10, width: tam * 0.2, height: tam * 0.2, borderRadius: 99, background: ROSA, border: '4px solid #fff', color: '#fff', fontFamily: FONTE, fontWeight: 900, fontSize: tam * 0.11, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.4)'}}>{s.votos}</div>
      ) : null}
      {s.mira ? (
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1.1 + Math.sin(t / 3) * 0.06})`}}>
          <IconeUi nome="alvo" tamanho={tam * 0.7} cor="#ff1744" />
        </div>
      ) : null}
    </div>
  );
};

// ---------------------------------------------------------------- grade 4x2
export const TAM = 296;
export const GAP = 14;
export const GRADE_X = 46;
export const GRADE_Y = 150;
export const posQuadro = (i: number) => ({x: GRADE_X + (i % 4) * (TAM + GAP), y: GRADE_Y + Math.floor(i / 4) * (TAM + GAP)});

export const Grade: React.FC<{js: Jogador[]; estado: (j: Jogador) => EstadoQuadro; noite: boolean}> = ({js, estado, noite}) => {
  const f = useCurrentFrame();
  return (
    <>
      {js.map((j, i) => {
        const s = estado(j);
        const p = posQuadro(i);
        const esc = s.destaque ? 1.07 : 1;
        return (
          <div key={j.id} style={{position: 'absolute', left: p.x, top: p.y, transform: `scale(${esc})`, zIndex: s.destaque ? 5 : 1}}>
            <Quadro j={j} s={s} noite={noite} t={f + i * 11} tam={TAM} />
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- barra da fase e faixa de aviso
export const Barra: React.FC<{texto: string; noite: boolean; icone?: 'lua' | 'sol' | 'urna' | 'cadeado' | 'balao'}> = ({texto, noite, icone}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 96, background: noite ? '#0b1a2a' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, boxShadow: '0 4px 14px rgba(0,0,0,0.35)', zIndex: 10}}>
    {icone ? <IconeUi nome={icone} tamanho={46} cor={noite ? '#ffd54f' : ROSA} /> : null}
    <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 46, color: noite ? '#fff' : AZUL, letterSpacing: 1}}>{texto}</div>
  </div>
);

export const Faixa: React.FC<{texto: string; at?: number; cor?: string}> = ({texto, at = 0, cor = ROSA}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f - at, fps, config: {damping: 13}});
  if (f < at) return null;
  return (
    <div style={{position: 'absolute', left: GRADE_X, width: 4 * TAM + 3 * GAP, top: GRADE_Y + 2 * TAM + GAP + 34, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - e) * 60}px)`, opacity: e}}>
      <div style={{background: cor, color: '#fff', fontFamily: FONTE, fontWeight: 800, fontSize: 38, padding: '14px 34px', borderRadius: 18, border: '5px solid #fff', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', textAlign: 'center', maxWidth: 1180}}>{texto}</div>
    </div>
  );
};

// ---------------------------------------------------------------- chat
export type Msg = {tipo: 'jogador' | 'sistema' | 'pensa' | 'anonimo'; texto: string; at: number; j?: Jogador; rotulo?: string; cor?: string};

const CHAT_X = 1318;
const CHAT_W = 566;
const CHAT_TOPO = 120;
const CHAT_ALT = 930;
const altura = (m: Msg) => Math.ceil((m.texto.length + (m.j ? m.j.nome.length + 3 : 0) + (m.tipo === 'pensa' ? 30 : 0)) / (m.tipo === 'sistema' ? 30 : 34)) * 36 + 24;

export const Chat: React.FC<{msgs: Msg[]; titulo: string; tema?: 'dia' | 'lobos' | 'cela' | 'noite'}> = ({msgs, titulo, tema = 'dia'}) => {
  const f = useCurrentFrame();
  const fundo = tema === 'lobos' ? '#4a0d12' : tema === 'cela' ? '#263238' : tema === 'noite' ? '#14223a' : '#ffffff';
  const texto = tema === 'dia' ? '#1d2a33' : '#f5f5f5';
  const visiveis = msgs.filter((m) => f >= m.at);
  // mantém só as últimas que cabem (a mais nova embaixo), com rolagem suave quando entra uma nova
  let soma = 0;
  const cabem: Msg[] = [];
  for (let i = visiveis.length - 1; i >= 0; i--) {
    soma += altura(visiveis[i]) + 12;
    if (soma > CHAT_ALT - 90) break;
    cabem.unshift(visiveis[i]);
  }
  const corTit = tema === 'lobos' ? '#ff5252' : tema === 'cela' ? '#b0bec5' : tema === 'noite' ? '#ffd54f' : ROSA;
  return (
    <div style={{position: 'absolute', left: CHAT_X, top: CHAT_TOPO, width: CHAT_W, height: CHAT_ALT, background: fundo, borderRadius: 22, boxShadow: '0 10px 30px rgba(0,0,0,0.45)', overflow: 'hidden', border: tema === 'lobos' ? '5px solid #e53935' : '5px solid rgba(255,255,255,0.9)'}}>
      <div style={{height: 70, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px', borderBottom: `3px solid ${tema === 'dia' ? '#eceff1' : 'rgba(255,255,255,0.12)'}`}}>
        <IconeUi nome={tema === 'lobos' ? 'pata' : tema === 'cela' ? 'cadeado' : 'balao'} tamanho={36} cor={corTit} />
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 32, color: corTit}}>{titulo}</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 76, bottom: 14, padding: '0 20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12, overflow: 'hidden'}}>
        {cabem.map((m, i) => {
          const flexShrink = 0;
          const k = interpolate(f, [m.at, m.at + 7], [0, 1], {...cl, easing: Easing.out(Easing.back(1.6))});
          const base: React.CSSProperties = {flexShrink,transform: `translateY(${(1 - k) * 40}px) scale(${0.9 + 0.1 * k})`, opacity: k, transformOrigin: 'left bottom', fontFamily: FONTE, fontSize: 27, lineHeight: '36px', borderRadius: 14, padding: '8px 14px'};
          if (m.tipo === 'sistema') {
            return <div key={i} style={{...base, fontWeight: 800, color: '#fff', background: m.cor ?? ROSA, textAlign: 'center'}}>{m.texto}</div>;
          }
          if (m.tipo === 'pensa') {
            return (
              <div key={i} style={{...base, fontStyle: 'italic', color: tema === 'dia' ? '#5e35b1' : '#d1c4e9', background: tema === 'dia' ? '#ede7f6' : 'rgba(179,157,219,0.15)', border: '3px dashed #9575cd'}}>
                <span style={{fontWeight: 900, fontStyle: 'normal', fontSize: 21, letterSpacing: 1}}>{m.j ? `${m.j.nome.toUpperCase()} PENSA` : 'PENSA'}</span><br />{m.texto}
              </div>
            );
          }
          const nomeCor = m.j ? AVATARES[m.j.id].cor : '#90a4ae';
          const novo = i === cabem.length - 1 && f - m.at < 90;
          return (
            <div key={i} style={{...base, color: texto, background: novo ? (tema === 'dia' ? '#fff8e1' : 'rgba(255,255,255,0.08)') : 'transparent'}}>
              <span style={{fontWeight: 900, color: m.tipo === 'anonimo' ? '#ffca28' : nomeCor}}>{m.tipo === 'anonimo' ? m.rotulo : `${m.j!.numero} ${m.j!.nome}`}: </span>
              <span style={{fontWeight: 600}}>{m.texto}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- fundo
export const Fundo: React.FC<{noite: boolean}> = ({noite}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: noite ? 'radial-gradient(ellipse at 40% 30%, #1a3354, #08131f 75%)' : `radial-gradient(ellipse at 40% 30%, #1b3d52, ${AZUL} 75%)`}}>
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: 0.12}}>
        {Array.from({length: 24}).map((_, i) => (
          <g key={i} transform={`translate(${(i * 263 + f * 0.4) % 2000 - 40} ${(i * 157) % 1080}) rotate(${i * 30})`}>
            <IconeUiPata />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
const IconeUiPata = () => <g fill="#fff"><ellipse cx={20} cy={27} rx={9} ry={8} /><circle cx={9} cy={16} r={4} /><circle cx={16} cy={9} r={4} /><circle cx={24} cy={9} r={4} /><circle cx={31} cy={16} r={4} /></g>;
