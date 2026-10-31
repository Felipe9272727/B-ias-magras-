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
  'Ling 3.1 Flash': {nome:'Ling',cor:'#176d77'},
  'Solar Mini 4': {nome:'Solar',cor:'#e89923'},
  'Claude Haiku 5.5': {nome:'Claude',cor:'#d97757'},
  'GPT-6.1 Terra': {nome:'GPT Terra',cor:'#10a37f'},
  'GPT-6 Luna': {nome:'Luna',cor:'#815ad4'},
  'DeepSeek V4.1 Flash 1017': {nome:'DeepSeek',cor:'#4d6bfe'},
  'MiMo V2.6 Flash': {nome:'MiMo',cor:'#e87925'},
  'Gemini 2.5 Flash Lite': {nome:'Gemini',cor:'#4285f4'},
  'Mistral Small 2603': {nome:'Mistral',cor:'#e7603b'},
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
      <svg width={tam} height={tam} viewBox="0 0 200 200" style={{position: 'absolute', left:0, top:0, filter: s.morto ? 'grayscale(1) brightness(0.55)' : undefined}}>
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
export const tamQuadro = (total = 8) => total > 8 ? 200 : TAM;
export const posQuadro = (i: number, total = 8) => ({x: GRADE_X + (i % 4) * (tamQuadro(total) + GAP), y: GRADE_Y + Math.floor(i / 4) * (tamQuadro(total) + GAP)});

export const Grade: React.FC<{js: Jogador[]; estado: (j: Jogador) => EstadoQuadro; noite: boolean}> = ({js, estado, noite}) => {
  const f = useCurrentFrame();
  return (
    <>
      {js.length > 8 && (() => {
        const j=js.find(j=>estado(j).falando) ?? js.find(j=>estado(j).destaque);
        return j ? <div style={{position:'absolute',left:944,top:260,width:300,textAlign:'center'}}>
          <div style={{fontFamily:FONTE,fontWeight:900,color:'#fff',fontSize:25,marginBottom:16,textShadow:'0 2px 4px #111'}}>EM DESTAQUE</div>
          <Quadro j={j} s={estado(j)} noite={noite} t={f} tam={300} />
          <div style={{fontFamily:FONTE,fontWeight:800,color:'#fff',fontSize:22,marginTop:16}}>{j.modelo}</div>
        </div> : null;
      })()}
      {js.map((j, i) => {
        const s = estado(j);
        const p = posQuadro(i,js.length);
        const esc = s.destaque ? 1.07 : 1;
        return (
          <div key={j.id} style={{position: 'absolute', left: p.x, top: p.y, transform: `scale(${esc})`, zIndex: s.destaque ? 5 : 1}}>
            <Quadro j={j} s={s} noite={noite} t={f + i * 11} tam={tamQuadro(js.length)} />
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

export const Faixa: React.FC<{texto: string; at?: number; cor?: string; total?:number}> = ({texto, at = 0, cor = ROSA, total=8}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f - at, fps, config: {damping: 13}});
  if (f < at) return null;
  return (
    <div style={{position: 'absolute', left: total > 8 ? 944 : GRADE_X, width: total > 8 ? 300 : 4 * TAM + 3 * GAP, top: total > 8 ? 710 : GRADE_Y + 2 * TAM + GAP + 34, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - e) * 60}px)`, opacity: e}}>
      <div style={{background: cor, color: '#fff', fontFamily: FONTE, fontWeight: 800, fontSize: total > 8 ? 28 : 38, padding: total > 8 ? '12px 16px' : '14px 34px', borderRadius: 18, border: '5px solid #fff', boxShadow: '0 8px 20px rgba(0,0,0,0.4)', textAlign: 'center', maxWidth: 1180}}>{texto}</div>
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
// fundo: a vila ao vivo atrás da grade (dia: céu, nuvens andando, morros, casas e moinho; noite: lua, estrelas piscando,
// janelas acesas e vaga-lumes). Um véu escuro por cima deixa os quadros e o chat legíveis.
export const Fundo: React.FC<{noite: boolean}> = ({noite}) => {
  const f = useCurrentFrame();
  const casa = (x: number, y: number, e: number, i: number) => (
    <g key={i} transform={`translate(${x} ${y}) scale(${e})`}>
      <rect x={-60} y={-70} width={120} height={80} fill={noite ? '#26304d' : '#f1d9b5'} />
      <path d="M-78 -66 L0 -130 L78 -66Z" fill={noite ? '#3a2233' : ['#d84315', '#8d6e63', '#c62828'][i % 3]} />
      <rect x={-18} y={-30} width={36} height={40} fill={noite ? '#1a1f33' : '#6d4c41'} />
      <rect x={-48} y={-56} width={26} height={24} fill={noite ? (i % 2 ? '#ffd54f' : '#1d2440') : '#90caf9'} opacity={noite && i % 2 ? 0.75 + 0.25 * Math.sin((f + i * 17) / 9) : 1} />
      <rect x={22} y={-56} width={26} height={24} fill={noite ? (i % 3 ? '#1d2440' : '#ffca28') : '#90caf9'} />
    </g>
  );
  return (
    <AbsoluteFill style={{background: noite ? 'linear-gradient(#071226, #13284d 60%, #1b3a5e)' : 'linear-gradient(#3fa9f5, #8fd5ff 60%, #c8ecff)', overflow: 'hidden'}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {noite ? (
          <g>
            {Array.from({length: 70}).map((_, i) => <circle key={i} cx={(i * 263) % 1920} cy={(i * 97) % 560} r={1.5 + (i % 3)} fill="#fff" opacity={0.35 + 0.65 * Math.abs(Math.sin((f + i * 11) / 15))} />)}
            <circle cx={1500} cy={170} r={95} fill="#fff6d5" />
            <circle cx={1540} cy={150} r={90} fill="#0d1d3a" opacity={0.9} />
            <circle cx={1500} cy={170} r={150} fill="#fff6d5" opacity={0.08} />
          </g>
        ) : (
          <g>
            <circle cx={1620} cy={150} r={90} fill="#fff59d" />
            <circle cx={1620} cy={150} r={140} fill="#fff59d" opacity={0.25 + 0.08 * Math.sin(f / 20)} />
            {[0, 1, 2, 3, 4].map((i) => {
              const x = ((i * 520 + f * (0.6 + i * 0.15)) % 2400) - 300;
              return <g key={i} fill="#fff" opacity={0.9} transform={`translate(${x} ${90 + (i % 3) * 110})`}><ellipse cx={0} cy={0} rx={110} ry={40} /><ellipse cx={60} cy={-25} rx={70} ry={45} /><ellipse cx={-55} cy={-12} rx={60} ry={35} /></g>;
            })}
          </g>
        )}
        <path d="M0 640 Q300 520 620 610 Q960 700 1300 580 Q1640 470 1920 590 L1920 1080 L0 1080Z" fill={noite ? '#132a3e' : '#7cc45a'} />
        <path d="M0 760 Q420 660 860 750 Q1300 840 1920 720 L1920 1080 L0 1080Z" fill={noite ? '#0f2230' : '#5fae3f'} />
        {/* moinho com as pás girando */}
        <g transform="translate(1720 600)">
          <path d="M-40 0 L-26 -170 L26 -170 L40 0Z" fill={noite ? '#2c3550' : '#efe2c8'} />
          <g transform={`translate(0 -170) rotate(${f * 1.2})`}>
            {[0, 90, 180, 270].map((a) => <rect key={a} x={-9} y={-150} width={18} height={150} fill={noite ? '#4a3f55' : '#8d6e63'} transform={`rotate(${a})`} />)}
            <circle r={14} fill={noite ? '#2c3550' : '#5d4037'} />
          </g>
        </g>
        {[[140, 760, 1], [430, 740, 0.85], [1420, 760, 0.9], [1880, 780, 0.8], [760, 800, 0.75]].map(([x, y, e], i) => casa(x, y, e, i))}
        {noite ? Array.from({length: 18}).map((_, i) => {
          const x = (i * 211 + Math.sin((f + i * 30) / 40) * 60) % 1920;
          const y = 600 + (i * 53) % 420 + Math.cos((f + i * 13) / 30) * 25;
          return <circle key={i} cx={x} cy={y} r={4} fill="#d4ff6b" opacity={0.3 + 0.7 * Math.abs(Math.sin((f + i * 9) / 12))} />;
        }) : Array.from({length: 10}).map((_, i) => {
          const x = ((i * 233 + f * (1.2 + (i % 3) * 0.4)) % 2100) - 90;
          const y = 520 + (i * 61) % 400 + Math.sin((f + i * 20) / 14) * 30;
          return <ellipse key={i} cx={x} cy={y} rx={9} ry={5} fill={['#e65100', '#f9a825', '#8bc34a'][i % 3]} transform={`rotate(${f * 3 + i * 40} ${x} ${y})`} />;
        })}
      </svg>
      <AbsoluteFill style={{background: noite ? 'rgba(4,10,24,0.45)' : 'rgba(10,30,50,0.32)'}} />
    </AbsoluteFill>
  );
};
const IconeUiPata = () => <g fill="#fff"><ellipse cx={20} cy={27} rx={9} ry={8} /><circle cx={9} cy={16} r={4} /><circle cx={16} cy={9} r={4} /><circle cx={24} cy={9} r={4} /><circle cx={31} cy={16} r={4} /></g>;

