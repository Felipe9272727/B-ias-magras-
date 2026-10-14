// Telas "de jogo" do Among Us 2, no espírito das do original (desenho e texto próprios):
// Shhh no começo, revelação do papel, chamado de reunião / corpo encontrado, mesa de votação com chat,
// ejeção no espaço e vitória/derrota. Cada uma é um componente que roda a partir do quadro 0 da sua Sequence.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Crewmate} from '../amongus/Crewmate';
import {FONT} from '../theme';
import {CORES, Partida2} from './sim';
import {EMPRESA} from './Jogo';

const AZUL = '#8fd3ff';
const VERMELHO = '#ff1f1f';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const info = (p: Partida2, cor: string) => p.jogadores.find((j) => j.cor === cor)!;
const empresa = (p: Partida2, cor: string) => EMPRESA[info(p, cor).modelo] ?? {nome: info(p, cor).modelo, cor: '#555'};
const PAPEL: Record<string, string> = {Medico: 'Médico'};

// campo de estrelas (fundo do espaço); vel = px por quadro
const Estrelas: React.FC<{vel?: number; n?: number}> = ({vel = 6, n = 160}) => {
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
export const Revela: React.FC<{p: Partida2; foco: string}> = ({p, foco}) => {
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
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
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
        return (
          <div key={c} style={{position: 'absolute', left: x - tam * 0.5, top: 980 - tam * 1.15, opacity: ent, filter: c === foco ? undefined : 'brightness(.62)'}}>
            <Crewmate cor={c} size={tam} t={f + i * 7} />
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
type PropsVot = {p: Partida2; idx: number; fase: 'discussao' | 'votacao' | 'resultado'; falas?: number; votos?: number; timer?: number; chat?: boolean};

const Cabeca: React.FC<{cor: string; size: number; morto?: boolean}> = ({cor, size, morto}) => (
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

export const Votacao: React.FC<PropsVot> = ({p, idx, fase, falas = 0, votos = 1, timer, chat = true}) => {
  const f = useCurrentFrame();
  const r = p.reunioes[idx];
  // quem está vivo na reunião: estado do tique em que ela foi chamada
  // vivo na reunião = não morreu até este tique e não foi expulso numa reunião anterior
  const mortos = new Set([
    ...p.eventos.filter((e) => e.tique <= r.tique && e.tipo === 'morte').map((e) => e.vitima),
    ...p.eventos.filter((e) => e.tique <= r.tique && e.tipo === 'xerife').map((e) => (e.acertou ? e.alvo : e.xerife)),
    ...p.reunioes.slice(0, idx).map((x) => x.expulso).filter(Boolean),
  ]);
  const vivo = (c: string) => !mortos.has(c);
  const eleitores = Object.keys(r.votos);
  const nVotou = Math.round(eleitores.length * votos);
  const votou = new Set(fase === 'discussao' ? [] : eleitores.slice(0, nVotou));
  const recebeu = (alvo: string) => eleitores.filter((e) => r.votos[e] === alvo);
  const pulos = eleitores.filter((e) => r.votos[e] === 'pular' || !r.votos[e]);
  const larg = chat ? 1120 : 1500;
  const x0 = chat ? 40 : 210;
  const mostrar = r.falas.slice(0, falas);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 40%, #1c2a44, #070b14 80%)'}}>
      {/* tablet */}
      <div style={{position: 'absolute', left: x0, top: 40, width: larg, height: 1000, borderRadius: 34, background: '#8fa3bf', border: '10px solid #1a1f2b', boxShadow: '0 20px 60px #000c'}}>
        <div style={{position: 'absolute', inset: 14, borderRadius: 22, background: '#c4d0e0'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 58, color: '#000'}}>Quem é o Impostor?</div>
        <div style={{position: 'absolute', left: 40, right: 40, top: 130, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px'}}>
          {CORES.map((c) => {
            const v = vivo(c);
            const chamou = r.chamador === c;
            const expulso = fase === 'resultado' && r.expulso === c;
            return (
              <div key={c} style={{position: 'relative', height: 108, borderRadius: 14, background: !v ? '#7d8796' : expulso ? '#ffd0d0' : '#f2f5fa', border: '4px solid #000', display: 'flex', alignItems: 'center', gap: 16, padding: '0 14px', opacity: v ? 1 : 0.75}}>
                <Cabeca cor={c} size={78} morto={!v} />
                {!v && <svg width={78} height={78} style={{position: 'absolute', left: 18}}><path d="M10 10L68 68M68 10L10 68" stroke="#e01b1b" strokeWidth={10} strokeLinecap="round" /></svg>}
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 32, color: '#000', lineHeight: 1}}>{c}</div>
                  <div style={{marginTop: 4, display: 'inline-block', fontFamily: FONT.display, fontWeight: 700, fontSize: 15, padding: '1px 8px', borderRadius: 6, background: empresa(p, c).cor, color: '#fff'}}>{empresa(p, c).nome}</div>
                  {/* resultado: as cabecinhas de quem votou nele */}
                  {fase === 'resultado' && (
                    <div style={{position: 'absolute', left: 214, right: 10, bottom: 8, display: 'flex', flexWrap: 'wrap', gap: 3}}>
                      {recebeu(c).map((e, i) => <div key={e} style={{opacity: interpolate(f, [i * 6, i * 6 + 6], [0, 1], cl)}}><Cabeca cor={e} size={30} /></div>)}
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
      {/* chat */}
      {chat && (
        <div style={{position: 'absolute', left: 1190, top: 40, width: 690, height: 1000, borderRadius: 26, background: '#e9eef5', border: '8px solid #1a1f2b', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
          <div style={{padding: '14px 20px', background: '#cfd8e6', borderBottom: '4px solid #1a1f2b', fontFamily: FONT.display, fontWeight: 900, fontSize: 30}}>Chat</div>
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 16px 16px', overflow: 'hidden'}}>
            {mostrar.slice(-6).map((m, i, arr) => (
              <Bolha key={falas - arr.length + i} p={p} cor={m.cor} texto={m.texto} aparece={i === arr.length - 1 ? interpolate(f % 1e9, [0, 8], [0, 1], cl) : 1} />
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
  const ateAqui = p.reunioes.slice(0, idx + 1).filter((x) => x.expulso && x.eraImpostor).length;
  const mortosImp = p.eventos.filter((e) => e.tipo === 'xerife' && e.acertou && e.tique <= r.tique).length;
  const restam = p.jogadores.filter((j) => j.time === 'impostor').length - ateAqui - mortosImp;
  const l1 = r.expulso ? (mostrarPapel ? `${r.expulso} ${r.eraImpostor ? 'era' : 'não era'} o Impostor.` : `${r.expulso} foi ejetado.`) : r.empate ? 'Ninguém foi ejetado. (Empate)' : 'Ninguém foi ejetado. (Pulado)';
  const l2 = `${restam} Impostor${restam === 1 ? '' : 'es'} restante${restam === 1 ? '' : 's'}.`;
  const tl = l1.length + l2.length;
  const n = Math.floor(interpolate(f, [40, 40 + tl * 2], [0, tl], cl));
  const x = interpolate(f, [0, 200], [-260, 2180], {easing: Easing.linear});
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Estrelas vel={3} />
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
  const vencedores = p.jogadores.filter((j) => j.time === venceu);
  const ganhei = foco ? info(p, foco).time === venceu : true;
  const corTit = !ganhei ? VERMELHO : venceu === 'impostor' ? VERMELHO : AZUL;
  const s = spring({frame: f - 4, fps, config: {damping: 13}});
  const tam = vencedores.length > 6 ? 170 : 240;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 260, top: 160, width: 1400, height: 920, background: `radial-gradient(ellipse at 50% 85%, ${venceu === 'impostor' ? 'rgba(255,40,40,.3)' : 'rgba(140,200,255,.26)'} 0%, transparent 62%)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 190, color: corTit, WebkitTextStroke: '3px #000', transform: `scale(${s})`, textShadow: `0 0 50px ${corTit}66`}}>
        {ganhei ? 'Vitória' : 'Derrota'}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 310, textAlign: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 44, color: '#fff', opacity: interpolate(f, [18, 30], [0, 1], cl)}}>
        {venceu === 'impostor' ? 'Os Impostores venceram' : 'Os Tripulantes venceram'} · {p.resultado.motivo}
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
