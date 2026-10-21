// Telas "de jogo" do Among Us 2, no espírito das do original (desenho e texto próprios):
// Shhh no começo, revelação do papel, chamado de reunião / corpo encontrado, mesa de votação com chat,
// ejeção no espaço e vitória/derrota. Cada uma é um componente que roda a partir do quadro 0 da sua Sequence.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crewmate} from '../amongus/Crewmate';
import {FONT} from '../theme';
import {CORES, Partida2} from './sim';
import {EMPRESA} from './Jogo';

const AZUL = '#8fd3ff';
// efeito sonoro (public/sfx_au2, sintetizados em video/scripts/sfx_au2.py) tocando a partir do quadro `em` da cena
export const Som: React.FC<{nome: string; em?: number; vol?: number}> = ({nome, em = 0, vol = 0.8}) => (
  <Sequence from={em} layout="none"><Audio src={staticFile(nome.includes('/') ? nome : `sfx_au2/${nome}.mp3`)} volume={vol} /></Sequence>
);
const VERMELHO = '#ff1f1f';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const info = (p: Partida2, cor: string) => p.jogadores.find((j) => j.cor === cor)!;
const empresa = (p: Partida2, cor: string) => EMPRESA[info(p, cor).modelo] ?? {nome: info(p, cor).modelo, cor: '#555'};
const PAPEL: Record<string, string> = {Medico: 'Médico', Palhaco: 'Palhaço', Seguranca: 'Segurança'};
// função de cada jogador num tique (o Gangster pode recrutar alguém no meio da partida)
export const papelEm = (p: Partida2, cor: string, tique: number) => {
  const rec = p.eventos.find((e) => e.tipo === 'recrutamento' && e.alvo === cor && e.tique <= tique);
  const j = info(p, cor);
  if (rec) return {nome: 'Recrutado', time: 'impostor', antes: PAPEL[rec.papelAntes] ?? rec.papelAntes};
  return {nome: PAPEL[j.papel] ?? j.papel, time: j.time as string, antes: ''};
};
export const corTime = (t: string) => (t === 'impostor' ? '#d40000' : t === 'neutro' ? '#8a3fd1' : '#1f6fd1');
// quem morreu até o tique (faca, xerife, veneno) e quem foi expulso nas reuniões anteriores
export const mortosAte = (p: Partida2, tique: number, idxReuniao: number) => new Set([
  ...p.eventos.filter((e) => e.tique <= tique && (e.tipo === 'morte' || e.tipo === 'morte_veneno')).map((e) => e.vitima),
  ...p.eventos.filter((e) => e.tique <= tique && e.tipo === 'xerife').map((e) => (e.acertou ? e.alvo : e.xerife)),
  ...p.reunioes.slice(0, idxReuniao).map((x) => x.expulso).filter(Boolean) as string[],
]);

// campo de estrelas (fundo do espaço); vel = px por quadro
export const Estrelas: React.FC<{vel?: number; n?: number}> = ({vel = 6, n = 160}) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: n}, (_, i) => {
        const z = 1 + (i % 3);
        const x = (((i * 7919) % 2100) - f * vel * z * 0.5) % 2100;
        return <circle key={i} cx={x < 0 ? x + 2100 : x} cy={(i * 104729) % 1080} r={z * 0.9} fill="#fff" opacity={0.35 + z * 0.18} />;
      })}
    </svg>
  );
};

// ---------- 1. Shhh ----------
// o tripulante faz "shhh" com o dedo na frente do visor, num fundo vermelho escuro
export const Shhh: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const e = spring({frame: f, fps, config: {damping: 12, stiffness: 140}});
  const txt = 'Shhhhhhh!';
  const n = Math.floor(interpolate(f, [8, 30], [3, txt.length], cl));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #a1121a 0%, #4a0006 45%, #000 85%)', overflow: 'hidden'}}>
      <Som nome="shhh" em={6} />
      <div style={{position: 'absolute', left: 960 - 230, top: 170, transform: `scale(${0.6 + 0.4 * e})`, transformOrigin: '50% 80%'}}>
        <Crewmate cor="Vermelho" size={460} />
        {/* mão com o indicador levantado na frente do visor */}
        <svg width={460} height={460} viewBox="0 0 100 100" style={{position: 'absolute', left: 0, top: 0}}>
          <g stroke="#000" strokeWidth={2.6} strokeLinejoin="round">
            <rect x={63} y={30} width={7.5} height={32} rx={3.7} fill="#c51111" />
            <ellipse cx={68} cy={66} rx={11} ry={9.5} fill="#c51111" />
            <path d="M60 64.5h12M60.5 69h11" fill="none" strokeWidth={1.6} />
          </g>
        </svg>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 760, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontStyle: 'italic', fontSize: 150, color: '#fff', WebkitTextStroke: '6px #000', letterSpacing: 4, textShadow: '0 10px 0 #000'}}>
        {txt.slice(0, n)}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. Revelação do papel ----------
// "Tripulante" (azul) ou "Impostor" (vermelho) no alto, a frase do número de impostores e a fila de tripulantes sob um holofote
// `nomes`: quadro em que o narrador fala o nome de cada um (vem das palavras da cena); nessa hora ele pula e ganha a etiqueta papel · modelo
export const Revela: React.FC<{p: Partida2; foco: string; nomes?: Record<string, number>}> = ({p, foco, nomes = {}}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const eu = info(p, foco);
  const imp = eu.time === 'impostor';
  const nImp = p.jogadores.filter((j) => j.time === 'impostor').length;
  const fila = imp ? p.jogadores.filter((j) => j.time === 'impostor') : p.jogadores;
  const ordem = [foco, ...fila.map((j) => j.cor).filter((c) => c !== foco)];
  // o foco no meio, os outros alternando esquerda/direita e cada vez mais para trás
  const lugares = ordem.map((c, i) => {
    const lado = i === 0 ? 0 : i % 2 ? -1 : 1;
    const k = Math.ceil(i / 2);
    return {c, x: 960 + lado * k * (imp ? 260 : 135), s: i === 0 ? 1 : Math.max(0.55, 0.92 - k * 0.07), z: 100 - k};
  });
  const titulo = spring({frame: f - 6, fps, config: {damping: 14}});
  const papel = PAPEL[eu.papel] ?? eu.papel;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden', transform: `scale(${1 + Math.min(f, 600) * 0.00008})`}}>
      <Som nome={imp ? 'revela_impostor' : 'revela_tripulante'} em={4} />
      {/* holofote */}
      <div style={{position: 'absolute', left: 960 - 700, top: 120, width: 1400, height: 980, background: `radial-gradient(ellipse at 50% 85%, ${imp ? 'rgba(255,40,40,.32)' : 'rgba(140,200,255,.28)'} 0%, transparent 62%)`, opacity: interpolate(f, [0, 20], [0, 1], cl)}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 170, letterSpacing: 6, color: imp ? VERMELHO : AZUL, WebkitTextStroke: '3px #000', transform: `scale(${titulo})`, textShadow: `0 0 40px ${imp ? '#ff000088' : '#8fd3ff66'}`}}>
        {imp ? 'Impostor' : 'Tripulante'}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 46, color: '#fff', opacity: interpolate(f, [22, 34], [0, 1], cl)}}>
        {imp ? <>Seu papel: <span style={{color: VERMELHO}}>{papel}</span></> : <>Há <span style={{color: VERMELHO}}>{nImp} Impostores</span> entre nós{papel !== 'Tripulante' ? <> · Seu papel: <span style={{color: AZUL}}>{papel}</span></> : null}</>}
      </div>
      {[...lugares].sort((a, b) => a.z - b.z).map(({c, x, s}, i) => {
        const ent = interpolate(f, [10 + i * 2, 24 + i * 2], [0, 1], cl);
        const tam = 300 * s;
        const qn = nomes[c] ?? -1;
        const dn = qn >= 0 ? f - qn : -1;
        const pulo = dn >= 0 ? Math.sin(Math.min(1, dn / 14) * Math.PI) * 70 : 0;
        const aceso = qn >= 0 && dn >= 0;
        const jj = info(p, c);
        const tag = spring({frame: dn, fps, config: {damping: 12}});
        return (
          <div key={c} style={{position: 'absolute', left: x - tam * 0.5, top: 980 - tam * 1.15 - pulo, opacity: ent, filter: c === foco || aceso ? undefined : 'brightness(.62)'}}>
            {dn === 0 && <Som nome="transformar" vol={0.35} />}
            <Crewmate cor={c} size={tam} t={f + i * 7} />
            {imp && aceso && (
              <div style={{position: 'absolute', left: tam * 0.5 - 170, width: 340, top: tam * 1.02, textAlign: 'center', transform: `scale(${tag})`}}>
                <span style={{display: 'inline-block', padding: '6px 14px', borderRadius: 10, background: '#2a0507', border: '3px solid #ff3b3b', fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: '#fff'}}>{PAPEL[jj.papel] ?? jj.papel} · <span style={{color: empresa(p, c).cor === '#555' ? '#ffb0b0' : '#ffd84d'}}>{empresa(p, c).nome}</span></span>
              </div>
            )}
            <div style={{position: 'absolute', left: 0, right: 0, top: -34 * s, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 30 * s, color: imp ? '#ff6b6b' : '#fff', WebkitTextStroke: '1px #000'}}>{c}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 3. Chamado: reunião de emergência / corpo encontrado ----------
export const Chamado: React.FC<{p: Partida2; idx: number}> = ({p, idx}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const r = p.reunioes[idx];
  const corpo = (r.subtipo ?? r.tipo) === 'corpo';
  const e = spring({frame: f, fps, config: {damping: 10, stiffness: 160}});
  const giro = f * 0.6;
  const tremor = f < 12 ? Math.sin(f * 2.3) * 14 * (1 - f / 12) : 0;
  return (
    <AbsoluteFill style={{background: corpo ? '#1b0405' : '#140a00', overflow: 'hidden', transform: `translateX(${tremor}px)`}}>
      <Som nome={corpo ? 'corpo' : 'emergencia'} />
      {/* raios girando */}
      <div style={{position: 'absolute', left: 960 - 1400, top: 470 - 1400, width: 2800, height: 2800, transform: `rotate(${giro}deg)`, background: `repeating-conic-gradient(${corpo ? '#7c0d12' : '#a8420a'} 0deg 9deg, ${corpo ? '#3a0508' : '#5a1c02'} 9deg 18deg)`, opacity: 0.9}} />
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 44%, transparent 18%, rgba(0,0,0,.75) 70%)'}} />
      <div style={{position: 'absolute', left: 960 - 200, top: 250, transform: `scale(${e})`}}>
        {corpo ? <Crewmate cor={r.corpo ?? 'Vermelho'} size={400} morto /> : <Crewmate cor={r.chamador} size={400} anim="susto" t={f} />}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontStyle: 'italic', fontSize: 132, color: '#fff', WebkitTextStroke: '5px #000', textShadow: '0 10px 0 #000', transform: `scale(${interpolate(e, [0, 1], [1.8, 1])})`, opacity: interpolate(f, [2, 8], [0, 1], cl)}}>
        {corpo ? 'Corpo Encontrado!' : 'Reunião de Emergência!'}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 40, color: '#ffffffcc', opacity: interpolate(f, [16, 26], [0, 1], cl)}}>
        {corpo ? `${r.chamador} encontrou o corpo de ${r.corpo}` : `${r.chamador} apertou o botão`}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4. Mesa de votação ----------
// fase 'discussao': chat rolando (mostra até a fala `falas`); 'votacao': carimbos VOTOU aparecendo (fração `votos` 0..1);
// 'resultado': quem votou em quem embaixo de cada nome. `timer` = segundos que aparecem no relógio.
type Msg = {cor: string; texto: string; at: number; ate?: number; pensamento?: string};
// `viva` (AU4): a câmera vai até quem está falando, e a fala aparece grande embaixo (legível no celular)
type PropsVot = {p: Partida2; idx: number; fase: 'discussao' | 'votacao' | 'resultado'; falas?: number; votos?: number; timer?: number; chat?: boolean; mensagens?: Msg[]; papeis?: boolean; viva?: boolean};

export const Cabeca: React.FC<{cor: string; size: number; morto?: boolean}> = ({cor, size, morto}) => (
  <div style={{position: 'relative', width: size, height: size, borderRadius: size * 0.2, overflow: 'hidden', background: '#c7d3e3', border: '3px solid #000'}}>
    <div style={{position: 'absolute', left: -size * 0.12, top: size * 0.05}}><Crewmate cor={cor} size={size * 1.25} morto={morto} /></div>
  </div>
);

const Bolha: React.FC<{p: Partida2; cor: string; texto: string; aparece: number}> = ({p, cor, texto, aparece}) => {
  const emp = empresa(p, cor);
  return (
    <div style={{display: 'flex', gap: 14, alignItems: 'flex-start', padding: '10px 4px', opacity: aparece, transform: `translateY(${(1 - aparece) * 30}px)`}}>
      <Cabeca cor={cor} size={64} />
      <div style={{flex: 1, background: '#fff', borderRadius: 14, border: '3px solid #000', padding: '8px 14px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT.display, fontWeight: 800, fontSize: 22, color: '#000'}}>
          {cor}
          <span style={{fontSize: 13, padding: '1px 7px', borderRadius: 6, background: emp.cor, color: '#fff'}}>{emp.nome}</span>
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 500, fontSize: 23, lineHeight: 1.28, color: '#111'}}>{texto}</div>
      </div>
    </div>
  );
};

// balão de pensamento secreto de quem está falando na reunião: sai do card do tripulante (bolinhas) e o texto vai sendo
// escrito; impostor com borda vermelha. O pensamento vem do log (a mesma fala, campo "pensamento").
// `fixo` (reunião viva): no alto da tela, sem as bolinhas até o cartão (a câmera está em zoom no cartão)
const BalaoPensa: React.FC<{p: Partida2; m: Msg; x0: number; fixo?: boolean}> = ({p, m, x0, fixo = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d = f - m.at - 6;
  const ent = spring({frame: d, fps, config: {damping: 14, stiffness: 170}});
  const sai = interpolate(f, [(m.ate ?? m.at + 150) + 28, (m.ate ?? m.at + 150) + 40], [1, 0], cl);
  const imp = info(p, m.cor).time === 'impostor';
  const i = CORES.indexOf(m.cor);
  const col = i % 3;
  const lin = Math.floor(i / 3);
  const cw = (1120 - 80 - 36) / 3;
  const cx = x0 + 40 + col * (cw + 18) + cw / 2;
  const cy = 40 + 130 + lin * 128 + 56;
  const embaixo = fixo ? true : lin <= 1;
  const top = fixo ? 30 : embaixo ? 450 : 150;
  const txt = m.pensamento ?? '';
  const n = Math.floor(interpolate(d, [6, 6 + txt.length / 3.2], [0, txt.length], cl));
  const borda = imp ? '#d40000' : '#5b3fc4';
  // bolinhas do card até o balão
  const by = embaixo ? top : top + 270;
  const bolinhas = [0, 1, 2].map((k) => ({x: cx + (x0 + 560 - cx) * (0.25 + k * 0.22), y: cy + (by - cy) * (0.3 + k * 0.25), r: 10 + k * 6}));
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, opacity: Math.min(ent, sai), pointerEvents: 'none'}}>
      {!fixo && bolinhas.map((b, k) => (
        <div key={k} style={{position: 'absolute', left: b.x - b.r, top: b.y - b.r, width: b.r * 2, height: b.r * 2, borderRadius: '50%', background: '#fffdf2', border: `4px solid ${borda}`, transform: `scale(${interpolate(d, [k * 3, k * 3 + 6], [0, 1], cl)})`}} />
      ))}
      <div style={{position: 'absolute', left: x0 + 40, top, width: 1040, minHeight: 150, boxSizing: 'border-box', padding: '20px 30px 22px', borderRadius: 46, background: '#fffdf2', border: `7px solid ${borda}`, boxShadow: '0 12px 0 rgba(0,0,0,.45)', transform: `scale(${0.7 + 0.3 * ent})`, transformOrigin: embaixo ? '50% 0%' : '50% 100%'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6}}>
          <Cabeca cor={m.cor} size={44} />
          <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 24, letterSpacing: 3, color: borda}}>{imp ? `${m.cor.toUpperCase()} · IMPOSTOR · PENSANDO` : `PENSAMENTO SECRETO · ${m.cor.toUpperCase()}`}</span>
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 700, fontStyle: 'italic', fontSize: txt.length > 130 ? 31 : 35, lineHeight: 1.25, color: '#14121c'}}>
          “{txt.slice(0, n)}{n < txt.length ? '' : '”'}
        </div>
      </div>
    </div>
  );
};

// quadro "quem votou em quem" (no lugar do chat durante a votação): cada voto entra quando o carimbo aparece;
// impostor votando ganha a frase do pensamento do voto (pensamentosVoto do log)
export const QuadroVotos: React.FC<{p: Partida2; idx: number; k: number; tempos: number[]}> = ({p, idx, k, tempos}) => {
  const f = useCurrentFrame();
  const r = p.reunioes[idx];
  const eleitores = Object.keys(r.votos);
  const pv = (r as any).pensamentosVoto as Record<string, string> | undefined;
  const curta = (t: string, mx = 78) => (t.length <= mx ? t : t.slice(0, mx).replace(/\s+\S*$/, '') + '…');
  return (
    <div style={{position: 'absolute', left: 1190, top: 40, width: 690, height: 1000, borderRadius: 26, background: '#e9eef5', border: '8px solid #1a1f2b', overflow: 'hidden', zIndex: 20}}>
      <div style={{padding: '14px 20px', background: '#cfd8e6', borderBottom: '4px solid #1a1f2b', fontFamily: FONT.display, fontWeight: 900, fontSize: 30}}>Quem votou em quem</div>
      <div style={{padding: '8px 18px'}}>
        {eleitores.slice(0, k).map((e, i) => {
          const alvo = r.votos[e];
          const imp = info(p, e).time === 'impostor';
          const a = interpolate(f - tempos[i], [0, 7], [0, 1], cl);
          const pensa = imp && pv?.[e] ? curta(pv[e]) : '';
          return (
            <div key={e} style={{display: 'flex', flexDirection: 'column', padding: '5px 8px', marginBottom: 4, borderRadius: 12, background: imp ? '#ffe1e1' : '#fff', border: `3px solid ${imp ? '#d40000' : '#1a1f2b'}`, opacity: a, transform: `translateX(${(1 - a) * 60}px)`}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <Cabeca cor={e} size={36} />
                <span style={{width: 150, fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: imp ? '#c00' : '#000'}}>{e}</span>
                <svg width={46} height={22} viewBox="0 0 46 22"><path d="M2 11h34M28 3l10 8-10 8" stroke="#000" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {alvo && alvo !== 'pular' ? (
                  <><Cabeca cor={alvo} size={36} /><span style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 24}}>{alvo}</span></>
                ) : (
                  <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 20, padding: '2px 10px', borderRadius: 8, background: '#cfd8e6', border: '3px solid #000'}}>PULOU</span>
                )}
              </div>
              {pensa && <div style={{marginTop: 2, fontFamily: FONT.display, fontWeight: 600, fontStyle: 'italic', fontSize: 17, lineHeight: 1.2, color: '#8a0000'}}>pensou: “{pensa}”</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// a fala de quem está falando, grande embaixo da tela (como legenda de reality show), escrita rápido
const FalaGrande: React.FC<{p: Partida2; m: Msg; larg: number; x0: number}> = ({p, m, larg, x0}) => {
  const f = useCurrentFrame();
  const d = f - m.at;
  const fim = (m.ate ?? m.at + 150) + 30;
  const op = Math.min(interpolate(d, [0, 6], [0, 1], cl), interpolate(f, [fim - 10, fim], [1, 0], cl));
  const n = Math.floor(interpolate(d, [4, 4 + m.texto.length / 2.2], [0, m.texto.length], cl));
  const calado = m.texto.startsWith('🤐') || !m.texto.replace(/[.\s]/g, '');
  return (
    <div style={{position: 'absolute', left: x0 + 20, width: larg - 40, bottom: 34, opacity: op, transform: `translateY(${(1 - op) * 30}px)`, zIndex: 40}}>
      <div style={{display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 22px', borderRadius: 22, background: 'rgba(8,12,22,.93)', border: `5px solid ${calado ? '#c08bff' : '#ffd84d'}`, boxShadow: '0 10px 30px #000a'}}>
        <div style={{flexShrink: 0}}><Cabeca cor={m.cor} size={78} /></div>
        <div style={{minWidth: 0}}>
          <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, color: '#ffd84d', lineHeight: 1}}>{m.cor} <span style={{fontSize: 20, padding: '2px 8px', borderRadius: 6, background: empresa(p, m.cor).cor, color: '#fff', verticalAlign: 'middle'}}>{empresa(p, m.cor).nome}</span></div>
          <div style={{marginTop: 6, fontFamily: FONT.display, fontWeight: 800, fontSize: calado ? 44 : m.texto.length > 150 ? 32 : 38, color: '#fff', lineHeight: 1.18}}>{calado ? '🤐 ... (chantageado: não consegue falar)' : m.texto.slice(0, n)}</div>
        </div>
      </div>
    </div>
  );
};

export const Votacao: React.FC<PropsVot> = ({p, idx, fase, falas = 0, votos = 1, timer, chat = true, mensagens, papeis = true, viva = false}) => {
  const f = useCurrentFrame();
  const r = p.reunioes[idx];
  // quem está vivo na reunião: estado do tique em que ela foi chamada
  // vivo na reunião = não morreu até este tique e não foi expulso numa reunião anterior
  const mortos = mortosAte(p, r.tique, idx);
  const juiz = p.eventos.find((e) => e.tipo === 'juiz' && e.tique === r.tique);
  const vivo = (c: string) => !mortos.has(c);
  const eleitores = Object.keys(r.votos);
  const nVotou = Math.round(eleitores.length * votos);
  const votou = new Set(fase === 'discussao' ? [] : eleitores.slice(0, nVotou));
  const recebeu = (alvo: string) => eleitores.filter((e) => r.votos[e] === alvo);
  const pulos = eleitores.filter((e) => r.votos[e] === 'pular' || !r.votos[e]);
  const larg = chat ? 1120 : 1500;
  const x0 = chat ? 40 : 210;
  // falas da cena (roteiro: aparecem quando a voz começa) ou as do log, até a número `falas`
  const mostrar = mensagens ? mensagens.filter((m) => m.at <= f) : r.falas.slice(0, falas);
  const ultima = mensagens?.filter((m) => m.at <= f).pop();
  const idadeUltima = ultima ? f - ultima.at : f;
  // quem está falando agora (enquanto a voz toca) e o pensamento secreto dessa fala
  const falando = ultima && f < (ultima.ate ?? ultima.at + 150) + 40 ? ultima : undefined;
  // reunião viva: zoom no cartão de quem fala (entra em 14 quadros, sai no fim da fala); sem fala, um leve vaivém
  let zoom = viva ? 1 + 0.025 * Math.sin(f / 70) : 1, ox = 0, oy = 0;
  if (viva && falando) {
    const i = CORES.indexOf(falando.cor);
    const cw = (larg - 80 - 36) / 3;
    const cx = x0 + 40 + (i % 3) * (cw + 18) + cw / 2, cy = 40 + 130 + Math.floor(i / 3) * 128 + 54;
    const fim = (falando.ate ?? falando.at + 150) + 20;
    const k = Math.min(interpolate(f - falando.at, [0, 14], [0, 1], cl), interpolate(f, [fim - 12, fim], [1, 0], cl));
    const e = Easing.inOut(Easing.cubic)(k);
    zoom = 1 + 0.28 * e;
    // centro do cartão vai para perto do centro da área do tablet
    ox = (x0 + larg / 2 - cx) * 0.55 * e;
    oy = (400 - cy) * 0.55 * e;
  }
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 40%, #1c2a44, #070b14 80%)', overflow: 'hidden'}}>
      {mensagens?.map((m, i) => <Som key={'c' + i} nome="chat" em={m.at} vol={0.35} />)}
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${x0 + larg / 2}px 400px`, transform: viva ? `translate(${ox}px, ${oy}px) scale(${zoom})` : undefined}}>
      {/* tablet */}
      <div style={{position: 'absolute', left: x0, top: 40, width: larg, height: 1000, borderRadius: 34, background: '#8fa3bf', border: '10px solid #1a1f2b', boxShadow: '0 20px 60px #000c'}}>
        <div style={{position: 'absolute', inset: 14, borderRadius: 22, background: '#c4d0e0'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 58, color: '#000'}}>Quem é o Impostor?</div>
        <div style={{position: 'absolute', left: 40, right: 40, top: 130, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px 18px'}}>
          {CORES.map((c) => {
            const v = vivo(c);
            const chamou = r.chamador === c;
            const expulso = fase === 'resultado' && r.expulso === c;
            const fala = falando?.cor === c;
            const pulso = fala ? 0.5 + 0.5 * Math.sin((f - falando!.at) / 4) : 0;
            return (
              <div key={c} style={{position: 'relative', height: 108, borderRadius: 14, overflow: 'visible', background: !v ? '#7d8796' : expulso ? '#ffd0d0' : fala ? '#fff6c7' : '#f2f5fa', border: `4px solid ${fala ? '#e0a800' : '#000'}`, boxShadow: fala ? `0 0 ${14 + 14 * pulso}px #ffd84d` : undefined, transform: fala ? `scale(${1.03 + 0.01 * pulso})` : undefined, zIndex: fala ? 2 : 1, display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px', opacity: v ? 1 : 0.75}}>
                <Cabeca cor={c} size={70} morto={!v} />
                {!v && <svg width={70} height={70} viewBox="0 0 78 78" style={{position: 'absolute', left: 14}}><path d="M10 10L68 68M68 10L10 68" stroke="#e01b1b" strokeWidth={10} strokeLinecap="round" /></svg>}
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 27, color: '#000', lineHeight: 1}}>{c}</div>
                  <div style={{marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap'}}>
                    <span style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 14, padding: '1px 7px', borderRadius: 6, background: empresa(p, c).cor, color: '#fff'}}>{empresa(p, c).nome}</span>
                    {/* a função fica à mostra para o espectador (as IAs não sabem) */}
                    {papeis && (() => { const pp = papelEm(p, c, r.tique); return <span style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 14, padding: '1px 7px', borderRadius: 6, border: `2px solid ${corTime(pp.time)}`, color: corTime(pp.time), background: '#fff'}}>{pp.nome}</span>; })()}
                  </div>
                  {/* resultado: as cabecinhas de quem votou nele */}
                  {fase === 'resultado' && (
                    <div style={{position: 'absolute', left: 6, right: 6, bottom: -16, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-end'}}>
                      {recebeu(c).map((e, i) => <div key={e} style={{opacity: interpolate(f, [i * 6, i * 6 + 6], [0, 1], cl)}}><Cabeca cor={e} size={26} /></div>)}
                    </div>
                  )}
                </div>
                {chamou && (
                  <svg width={46} height={46} viewBox="0 0 100 100" style={{position: 'absolute', right: 10, top: 8}}>
                    <g stroke="#000" strokeWidth={6} strokeLinejoin="round"><path d="M18 42h14l34-18v52L32 58H18z" fill="#fff" /></g>
                  </svg>
                )}
                {votou.has(c) && fase === 'votacao' && (
                  <div style={{position: 'absolute', right: 12, bottom: 10, transform: 'rotate(-12deg)', padding: '2px 12px', borderRadius: 8, border: '4px solid #0d7a2a', color: '#0d7a2a', fontFamily: FONT.display, fontWeight: 900, fontSize: 24, background: '#e8ffe9'}}>VOTOU</div>
                )}
              </div>
            );
          })}
        </div>
        {/* rodapé: pular voto e relógio */}
        <div style={{position: 'absolute', left: 40, bottom: 34, display: 'flex', alignItems: 'center', gap: 16}}>
          <div style={{padding: '10px 22px', borderRadius: 12, background: '#f2f5fa', border: '4px solid #000', fontFamily: FONT.display, fontWeight: 900, fontSize: 28}}>PULAR VOTO</div>
          {fase === 'resultado' && (
            <div style={{display: 'flex', gap: 3}}>{pulos.map((e) => <Cabeca key={e} cor={e} size={30} />)}</div>
          )}
        </div>
        <div style={{position: 'absolute', right: 44, bottom: 44, fontFamily: FONT.display, fontWeight: 800, fontSize: 30, color: '#000'}}>
          {fase === 'resultado' ? 'Resultado da votação' : fase === 'votacao' ? `Votação termina em: ${timer ?? 15}s` : `Discussão: ${timer ?? 60}s`}
        </div>
      </div>
      {!viva && falando?.pensamento && <BalaoPensa p={p} m={falando} x0={x0} />}
      </div>
      {viva && falando?.pensamento && <BalaoPensa p={p} m={falando} x0={x0} fixo />}
      {viva && falando && falando.texto && <FalaGrande p={p} m={falando} larg={larg} x0={x0} />}
      {/* Juiz anulou: carimbo por cima do resultado */}
      {fase === 'resultado' && juiz && (
        <div style={{position: 'absolute', left: x0 + 100, top: 360, width: larg - 200, padding: '24px 30px', textAlign: 'center', transform: `rotate(-6deg) scale(${interpolate(f, [20, 30], [2.2, 1], cl)})`, opacity: interpolate(f, [20, 26], [0, 1], cl), border: '10px solid #b00000', borderRadius: 20, background: 'rgba(255,240,240,.94)', fontFamily: FONT.display, fontWeight: 900, color: '#b00000', zIndex: 30}}>
          <div style={{fontSize: 74}}>⚖ VOTAÇÃO ANULADA</div>
          <div style={{fontSize: 34, color: '#300'}}>o Juiz ({juiz.cor}) usou o martelo{juiz.teriaSido ? ` · ${juiz.teriaSido} ia ser expulso` : ''}</div>
        </div>
      )}
      {/* chat */}
      {chat && (
        <div style={{position: 'absolute', left: 1190, top: 40, width: 690, height: 1000, borderRadius: 26, background: '#e9eef5', border: '8px solid #1a1f2b', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
          <div style={{padding: '14px 20px', background: '#cfd8e6', borderBottom: '4px solid #1a1f2b', fontFamily: FONT.display, fontWeight: 900, fontSize: 30}}>Chat</div>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 16px 16px', overflow: 'hidden'}}>
            {mostrar.slice(-6).map((m, i, arr) => (
              <Bolha key={mostrar.length - arr.length + i} p={p} cor={m.cor} texto={m.texto} aparece={i === arr.length - 1 ? interpolate(idadeUltima, [0, 8], [0, 1], cl) : 1} />
            ))}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ---------- 5. Ejeção ----------
// o expulso gira atravessando o espaço; o texto vai sendo digitado embaixo
export const Ejecao2: React.FC<{p: Partida2; idx: number; mostrarPapel?: boolean}> = ({p, idx, mostrarPapel = true}) => {
  const f = useCurrentFrame();
  const r = p.reunioes[idx];
  // impostores restantes depois desta ejeção
  // impostores vivos depois da reunião (o estado do tique é gravado depois dela; conta o recrutado do Gangster)
  const est = p.tiques[r.tique]?.estado?.jogadores ?? [];
  const restam = est.filter((j) => j.vivo && j.time === 'impostor').length;
  const pe = r.expulso ? papelEm(p, r.expulso, r.tique) : null;
  const l1 = r.anulada ? 'Ninguém foi ejetado. (O Juiz anulou)' : r.expulso ? (!mostrarPapel ? `${r.expulso} foi ejetado.` : pe?.nome === 'Palhaço' ? `${r.expulso} era o Palhaço. E era isso que ele queria.` : `${r.expulso} ${r.eraImpostor ? 'era' : 'não era'} um Impostor. (${pe?.nome})`) : r.empate ? 'Ninguém foi ejetado. (Empate)' : 'Ninguém foi ejetado. (Pulado)';
  const l2 = `${restam} Impostor${restam === 1 ? '' : 'es'} restante${restam === 1 ? '' : 's'}.`;
  const tl = l1.length + l2.length;
  const n = Math.floor(interpolate(f, [40, 40 + tl * 2], [0, tl], cl));
  const x = interpolate(f, [0, 200], [-260, 2180], {easing: Easing.linear});
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Estrelas vel={3} />
      <Som nome="ejecao" vol={0.7} />
      {/* bipes de digitação enquanto o texto aparece (começa no quadro 40) */}
      {Array.from({length: Math.ceil((tl * 2) / 58)}, (_, i) => <Som key={'d' + i} nome="digitando" em={40 + i * 58} vol={0.35} />)}
      {r.expulso && (
        <div style={{position: 'absolute', left: x, top: 380, transform: `rotate(${f * 5}deg)`}}>
          <Crewmate cor={r.expulso} size={200} />
        </div>
      )}
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: FONT.display, fontWeight: 600, fontSize: 70, color: '#fff', lineHeight: 1.4}}>
        <div>{l1.slice(0, n)}</div>
        <div style={{fontSize: 52, opacity: 0.9}}>{n > l1.length ? l2.slice(0, n - l1.length) : ''}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 6. Vitória / Derrota ----------
// do ponto de vista de `foco`: Vitória (azul para tripulantes, vermelho para impostores) ou Derrota; o time vencedor em fila
export const Fim2: React.FC<{p: Partida2; foco?: string}> = ({p, foco}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const venceu = p.resultado.time;
  const ult = [...p.tiques].reverse().find((t) => t?.estado)?.estado?.jogadores ?? [];
  const vencedores = venceu === 'palhaco' ? p.jogadores.filter((j) => j.papel === 'Palhaco') : p.jogadores.filter((j) => (ult.find((x) => x.cor === j.cor)?.time ?? j.time) === venceu);
  const ganhei = foco ? info(p, foco).time === venceu : true;
  const corTit = !ganhei ? VERMELHO : venceu === 'impostor' ? VERMELHO : AZUL;
  const s = spring({frame: f - 4, fps, config: {damping: 13}});
  const tam = vencedores.length > 6 ? 170 : 240;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Som nome={ganhei ? 'vitoria' : 'derrota'} />
      <div style={{position: 'absolute', left: 260, top: 160, width: 1400, height: 920, background: `radial-gradient(ellipse at 50% 85%, ${venceu === 'impostor' ? 'rgba(255,40,40,.3)' : 'rgba(140,200,255,.26)'} 0%, transparent 62%)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 190, color: corTit, WebkitTextStroke: '3px #000', transform: `scale(${s})`, textShadow: `0 0 50px ${corTit}66`}}>
        {ganhei ? 'Vitória' : 'Derrota'}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 310, textAlign: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 44, color: '#fff', opacity: interpolate(f, [18, 30], [0, 1], cl)}}>
        {venceu === 'impostor' ? 'Os Impostores venceram' : venceu === 'palhaco' ? 'O Palhaço venceu sozinho' : 'Os Tripulantes venceram'} · {p.resultado.motivo}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: vencedores.length > 6 ? 6 : 30}}>
        {vencedores.map((j, i) => (
          <div key={j.cor} style={{position: 'relative', opacity: interpolate(f, [14 + i * 3, 26 + i * 3], [0, 1], cl)}}>
            <Crewmate cor={j.cor} size={tam} fantasma={!p.tiques[p.tiques.length - 1]?.estado?.jogadores.find((x) => x.cor === j.cor)?.vivo && !!p.tiques[p.tiques.length - 1]?.estado} t={f + i * 9} />
            <div style={{position: 'absolute', left: 0, right: 0, top: -30, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: 24, color: '#fff', WebkitTextStroke: '1px #000'}}>{j.cor}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 7. Cena da morte ----------
// faixa no meio da tela (como a animação de morte do jogo): o impostor avança, a faca entra, a vítima vira meio corpo
export const CenaMorte: React.FC<{assassino: string; vitima: string; aparente?: string}> = ({assassino, vitima, aparente}) => {
  const f = useCurrentFrame();
  const abre = interpolate(f, [0, 6, 52, 60], [0, 1, 1, 0], cl);
  const avanco = interpolate(f, [6, 18], [0, 1], {...cl, easing: Easing.in(Easing.cubic)});
  const golpe = f >= 18;
  const queda = interpolate(f, [20, 30], [0, 1], cl);
  const tremor = golpe && f < 26 ? Math.sin(f * 3.1) * 10 : 0;
  return (
    <AbsoluteFill style={{background: `rgba(0,0,0,${0.6 * abre})`}}>
      <Som nome="faca" em={17} vol={1} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 540 - 230 * abre, height: 460 * abre, overflow: 'hidden', background: 'linear-gradient(#3b0508, #8a0d14 50%, #3b0508)', borderTop: '8px solid #000', borderBottom: '8px solid #000', transform: `translateX(${tremor}px)`}}>
        {/* impostor (com a aparência que estava usando) */}
        <div style={{position: 'absolute', left: 560 + avanco * 230, top: 60}}>
          <Crewmate cor={aparente ?? assassino} size={340} anim={golpe ? 'parado' : 'andando'} passo={golpe ? 0 : f / 4} t={f} />
          {/* faca */}
          <svg width={240} height={120} viewBox="0 0 240 120" style={{position: 'absolute', left: 250 - (golpe ? 0 : 60), top: 150, transform: `rotate(${golpe ? -4 : -24}deg)`}}>
            <g stroke="#000" strokeWidth={6} strokeLinejoin="round">
              <rect x={8} y={46} width={70} height={28} rx={8} fill="#6b3c1c" />
              <path d="M78 42h20v36H78z" fill="#9aa3b0" />
              <path d="M98 46h110l24 14-24 14H98z" fill="#e4e9f0" />
            </g>
          </svg>
        </div>
        {/* vítima: em pé até o golpe, depois meio corpo com o osso */}
        <div style={{position: 'absolute', left: 1080, top: 50 + queda * 8}}>
          {golpe ? <Crewmate cor={vitima} size={340} morto /> : <Crewmate cor={vitima} size={340} anim="susto" t={f} virado />}
        </div>
        {golpe && <div style={{position: 'absolute', inset: 0, background: '#ff0000', opacity: interpolate(f, [18, 22, 32], [0, 0.55, 0], cl)}} />}
      </div>
    </AbsoluteFill>
  );
};

// ---------- 8. Pensamento secreto / fala ----------
// o tripulante grande à esquerda (com o selo da empresa) e o balão com o texto; impostor com borda vermelha
export const Frase: React.FC<{p: Partida2; cor: string; texto: string; modo?: 'pensa' | 'fala' | 'nota'}> = ({p, cor, texto, modo = 'pensa'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const j = info(p, cor);
  const imp = j.time === 'impostor';
  const emp = empresa(p, cor);
  const s = spring({frame: f, fps, config: {damping: 13}});
  const rotulo = modo === 'pensa' ? 'PENSAMENTO SECRETO' : modo === 'fala' ? 'NO CHAT' : 'NOTA';
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #1b2550 0%, #05060c 75%)', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 60, padding: 100}}>
      <Estrelas vel={1} n={120} />
      <div style={{transform: `scale(${s}) translateY(${Math.sin(f / 12) * 8}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <Crewmate cor={cor} size={300} t={f} />
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: imp ? '#ff4d4d' : '#fff'}}>{cor}</div>
        <span style={{fontFamily: FONT.display, fontWeight: 800, fontSize: 24, padding: '3px 12px', borderRadius: 9, background: emp.cor, color: '#fff'}}>{emp.nome}</span>
      </div>
      <div style={{position: 'relative', maxWidth: 1060, background: '#fffdf2', border: `8px solid ${imp ? '#c00' : '#000'}`, borderRadius: 40, padding: '40px 50px', boxShadow: '0 14px 0 rgba(0,0,0,.45)', transform: `scale(${s})`}}>
        {/* bolinhas de pensamento até o tripulante */}
        {modo === 'pensa' && [0, 1, 2].map((k) => <div key={k} style={{position: 'absolute', left: -40 - k * 34, top: 120 + k * 24, width: 30 - k * 8, height: 30 - k * 8, borderRadius: '50%', background: '#fffdf2', border: '5px solid #000'}} />)}
        <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 30, letterSpacing: 3, color: imp ? '#c00' : '#555', marginBottom: 12}}>{rotulo}</div>
        <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: texto.length > 140 ? 40 : 48, lineHeight: 1.25, color: '#111'}}>“{texto}”</div>
      </div>
    </AbsoluteFill>
  );
};
