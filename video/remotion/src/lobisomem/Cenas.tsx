// As cenas do "Lobisomem das IAs" no estilo do Wolvesville (roteiro/roteiro_lobo.py → timeline_lobo.json). A tela é a
// do jogo: grade dos jogadores + chat. Tudo vem do log de cada partida (timeline.data.partidas[n], de
// lobisomem/logs/partidaN.json): quem está vivo, quem fala, a expressão que a IA escolheu, ações da noite, tiros, votos
// e o selo do juiz de mentiras. Regra do canal: nenhum emoji — todos os ícones são SVG (Papeis.tsx).
import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Scene, Timeline} from '../types';
import {Avatar, AvatarId, Expressao} from './Avatar';
import {IconePapel, Papel, PAPEIS} from './Papeis';
import {AZUL, Barra, Chat, EstadoQuadro, Faixa, FONTE, Fundo, Grade, Jogador, MARCA, Msg, posQuadro, Quadro, ROSA, TAM, tamQuadro} from './Tela';

type Mentira = {tipo: string; motivo: string};
type Fala = {nome: string; id: AvatarId; rodada: number; fala: string; pensamento?: string; expressao?: string; mentira?: Mentira};
type Morte = {nome: string; papel: Papel; causa: string; quando: string; atirador?: string; depoisDaFala?: number};
type Cela = {carcereiro: string; preso: string; conversa: {quem: string; texto: string; pensamento?: string; executar?: boolean; rodada: number}[]; executou: boolean};
type AcaoDia = {tipo:'agua_benta'; ator:string; alvo:string; acertou:boolean; morte:Morte; depoisDaFala:number};
type Noite = {n: number; cela: Cela | null; chat: {nome: string; texto: string; alvo: string; pensamento?: string}[]; vidente: {alvo: string; papel: Papel} | null; loboVidente: {alvo: string; papel: Papel} | null; medico: {alvo: string} | null; detetive?:{alvos:string[];mesmoTime:boolean} | null; xerife?: {alvos:string[]; recebeu:boolean; pistas?:{alvo:string;suspeitos:string[]}[]} | null; videnteEspiritual?: {alvos:string[];recebeu:boolean;matou?:boolean} | null; mortes: Morte[]; alvoLobos?: string | null; salvo?: boolean};
type Dia = {n: number; falas: Fala[]; tiros: Morte[]; acoes?:AcaoDia[]; votos: Record<string, string>; linchado: Morte | null; preso: {nome: string} | null; pesosVoto?:Record<string,number>; revelacoes?:{nome:string;papel:Papel;depoisDaFala:number}[]; recados?:{nome:string;texto:string;depoisDaFala:number}[]};
export type Partida = {partida: number; jogadores: Jogador[]; noites: Noite[]; dias: Dia[]; resultado: {vencedor: string; dias: number; vivos: string[]}};
type Item = {cor: AvatarId; texto: string; at: number; ate: number; pensa?: boolean};
type Aviso = {texto: string; cor?: string; em?: string};

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const EXPR: Expressao[] = ['neutro', 'desconfiado', 'assustado', 'bravo', 'rindo', 'culpado', 'chocado', 'pensando', 'chorando', 'dormindo'];
const ex = (e?: string): Expressao => (EXPR.includes(e as Expressao) ? (e as Expressao) : 'neutro');
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9à-ú]/g, '');
const LOBO = (p: Papel) => ['lobisomem','lobo_vidente','lobo_alfa'].includes(p);

// mortos até um ponto da partida: começo da noite n, amanhecer do dia n, durante o dia n (com k tiros) ou depois da votação
type Ponto = {fase: 'noite' | 'amanhecer' | 'dia' | 'votado'; n: number; tiros?: number; acoes?:number};
const mortosAte = (P: Partida, p: Ponto) => {
  const m = new Set<string>();
  for (const x of P.noites) if (x.n < p.n || (p.fase !== 'noite' && x.n === p.n)) for (const d of x.mortes) m.add(d.nome);
  for (const d of P.dias) {
    if (d.n < p.n || (p.fase === 'votado' && d.n === p.n)) { d.tiros.forEach((t) => m.add(t.nome)); d.acoes?.forEach(a=>m.add(a.morte.nome)); if (d.linchado) m.add(d.linchado.nome) }
    else if (d.n === p.n && p.fase === 'dia') { d.tiros.slice(0, p.tiros ?? 0).forEach((t) => m.add(t.nome)); d.acoes?.slice(0,p.acoes??0).forEach(a=>m.add(a.morte.nome)); }
  }
  return m;
};

// quadro (relativo à cena) em que cada termo é dito pelo narrador; -1 se não aparece
const gatilhos = (scene: Scene, termos: string[]): number[] => {
  const sem = (w: string) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const ws = (scene.words ?? []) as {w: string; s: number}[];
  let k = 0;
  return termos.map((t) => {
    for (let i = k; i < ws.length; i++) if (sem(ws[i].w).startsWith(sem(t))) { k = i + 1; return ws[i].s }
    return -1;
  });
};
const avisosMsgs = (scene: Scene, avisos: Aviso[] = []): Msg[] => {
  const g = gatilhos(scene, avisos.map((a) => a.em ?? ''));
  return avisos.map((a, i) => ({tipo: 'sistema', texto: a.texto, cor: a.cor, at: a.em ? Math.max(0, g[i]) : 0}));
};
const jog = (P: Partida, nome: string) => P.jogadores.find((j) => j.nome === nome)!;
const jid = (P: Partida, id: string) => P.jogadores.find((j) => j.id === id)!;

// selo do juiz de mentiras, preso embaixo do quadro de quem mentiu
const CORES_MENTIRA: Record<string, string> = {'FABRICAÇÃO': '#d50000', 'DISTORÇÃO': '#ff6d00', 'OMISSÃO': '#ffab00', VERDADE: '#00c853', PRESO: '#455a64'};
const SeloMentira: React.FC<{tipo: string; at: number; x: number; y: number}> = ({tipo, at, x, y}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < at) return null;
  const e = spring({frame: f - at, fps, config: {damping: 9, stiffness: 160}});
  const cor = CORES_MENTIRA[tipo] ?? '#d50000';
  return (
    <div style={{position: 'absolute', left: x, top: y, zIndex: 20, transform: `translate(-50%,-50%) rotate(-12deg) scale(${0.4 + 0.6 * e * (1 + 0.25 * Math.max(0, 1 - (f - at) / 8))})`, opacity: Math.min(1, e * 1.5)}}>
      <div style={{border: `7px solid ${cor}`, color: cor, background: 'rgba(255,255,255,0.93)', borderRadius: 14, padding: '4px 18px', fontFamily: FONTE, fontWeight: 900, fontSize: 40, letterSpacing: 2, boxShadow: '0 6px 18px rgba(0,0,0,0.45)'}}>{tipo}</div>
    </div>
  );
};

// tremida e flash quando algo forte acontece
const useTremor = (at: number, forca = 14) => {
  const f = useCurrentFrame();
  const k = Math.max(0, 1 - (f - at) / 12);
  return f >= at ? {x: Math.sin(f * 2.3) * forca * k, y: Math.cos(f * 1.9) * forca * k} : {x: 0, y: 0};
};
const Flash: React.FC<{at: number; cor?: string}> = ({at, cor = '#fff'}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at, at + 2, at + 10], [0, 0.85, 0], cl);
  return o > 0 ? <AbsoluteFill style={{background: cor, opacity: o, zIndex: 50}} /> : null;
};


// câmera: aproxima o quadro de quem está falando (entra em 8 quadros, sai em 10), com leve deriva o tempo todo
const useFocoFala = (P: Partida, chat: Item[]) => {
  const f = useCurrentFrame();
  let k = 0, cx = 640, cy = 460;
  for (const c of chat) {
    const kin = interpolate(f, [c.at, c.at + 8], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
    const kout = interpolate(f, [c.ate + 4, c.ate + 14], [1, 0], cl);
    const v = Math.min(kin, kout);
    if (v > k) {
      k = v;
      const p = posQuadro(P.jogadores.findIndex((j) => j.id === c.cor),P.jogadores.length);
      cx = p.x + tamQuadro(P.jogadores.length) / 2; cy = p.y + tamQuadro(P.jogadores.length) / 2;
    }
  }
  const z = 1 + 0.09 * k + 0.012 * Math.sin(f / 35);
  return {transform: `scale(${z})`, transformOrigin: `${cx}px ${cy}px`};
};

// balão grande embaixo da grade com a fala (ou o pensamento) que está tocando, letra por letra no ritmo da voz
const FalaGrande: React.FC<{P: Partida; chat: Item[]; noite?: boolean; anonimo?: string}> = ({P, chat, noite, anonimo}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = [...chat].reverse().find((x) => f >= x.at && f <= x.ate + 10);
  if (!c) return null;
  const j = jid(P, c.cor);
  const e = spring({frame: f - c.at, fps, config: {damping: 13, stiffness: 200}});
  const n = Math.ceil(c.texto.length * interpolate(f, [c.at, Math.max(c.at + 1, c.ate - 4)], [0.08, 1], cl));
  const tam = c.texto.length > 190 ? 31 : c.texto.length > 130 ? 35 : 40;
  const nome = anonimo && j.id === anonimo ? 'CARCEREIRO' : `${j.numero} ${j.nome.toUpperCase()} · ${MARCA[j.modelo]?.nome ?? ''}`;
  return (
    <div style={{position: 'absolute', left: P.jogadores.length>8 ? 924 : 46, width: P.jogadores.length>8 ? 356 : 1236, top: P.jogadores.length>8 ? 705 : 782, zIndex: 15, transform: `translateY(${(1 - e) * 60}px) scale(${0.92 + 0.08 * e})`, opacity: Math.min(1, e * 1.4)}}>
      <div style={{background: c.pensa ? '#ede7f6' : noite ? '#1c2b47' : '#fff', border: c.pensa ? '6px dashed #7e57c2' : `6px solid ${noite ? '#e53935' : ROSA}`, borderRadius: 26, padding: '14px 26px', boxShadow: '0 12px 30px rgba(0,0,0,0.5)', fontFamily: FONTE}}>
        <div style={{fontWeight: 900, fontSize: P.jogadores.length>8?18:24, letterSpacing: 2, color: c.pensa ? '#5e35b1' : noite ? '#ff8a80' : ROSA}}>{c.pensa ? `${j.nome.toUpperCase()} PENSA (SÓ VOCÊ OUVE)` : nome}</div>
        <div style={{fontWeight: 800, fontSize: P.jogadores.length>8?24:tam, lineHeight: 1.18, color: c.pensa ? '#311b92' : noite ? '#fff' : '#1d2a33', fontStyle: c.pensa ? 'italic' : undefined}}>{c.texto.slice(0, n)}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- DISCUSSÃO DO DIA
const LOBChat: React.FC<{P: Partida; dia: number; chat: Item[]; scene: Scene; tiros?: number; acoes?:number; avisos?: Aviso[]}> = ({P, dia, chat, scene, tiros = 0, acoes=0, avisos}) => {
  const f = useCurrentFrame();
  const D = P.dias.find((d) => d.n === dia);
  const mortos = mortosAte(P, {fase: 'dia', n: dia, tiros, acoes});
  const achar = (it: Item) => D?.falas.find((x) => x.id === it.cor && norm((it.pensa ? x.pensamento : x.fala) ?? '').includes(norm(it.texto).slice(0, 40)));
  const atual = [...chat].reverse().find((c) => f >= c.at);
  const msgs: Msg[] = [...avisosMsgs(scene, avisos), ...chat.map((c) => ({tipo: c.pensa ? 'pensa' : 'jogador', j: jid(P, c.cor), texto: c.texto, at: c.at} as Msg))];
  const selos = chat.map((c) => ({c, fala: achar(c)})).filter(({c, fala}) => !c.pensa && fala?.mentira && fala.mentira.tipo !== 'VERDADE');
  const foco = useFocoFala(P, chat);
  return (
    <AbsoluteFill>
      <Fundo noite={false} />
      <Barra texto={`Dia ${dia} · Discussão`} noite={false} icone="balao" />
      <AbsoluteFill style={foco}>
      <Grade js={P.jogadores} noite={false} estado={(j) => {
        const fala = atual && atual.cor === j.id ? achar(atual) : undefined;
        const fl = atual?.cor === j.id && f <= atual.ate && !atual.pensa;
        return {morto: mortos.has(j.nome), destaque: atual?.cor === j.id && f <= atual.ate + 6, falando: fl, expressao: atual?.cor === j.id ? ex(fala?.expressao) : 'neutro'};
      }} />
      {selos.map(({c, fala}, i) => {
        const k = P.jogadores.findIndex((j) => j.id === c.cor);
        const p = posQuadro(k,P.jogadores.length);
        const proximo = chat.find((x) => x.at > c.at && !x.pensa && x.cor !== c.cor);
        return proximo && f > proximo.at ? null : <SeloMentira key={i} tipo={fala!.mentira!.tipo} at={c.ate - 8} x={p.x + tamQuadro(P.jogadores.length) / 2} y={p.y + tamQuadro(P.jogadores.length) * 0.78} />;
      })}
      </AbsoluteFill>
      {selos.map(({c}, i) => <Sequence key={`s${i}`} from={Math.max(0, c.ate - 8)} durationInFrames={45}><Audio src={staticFile('sfx/censor-beep.mp3')} volume={0.22} /></Sequence>)}
      <FalaGrande P={P} chat={chat} />
      <Chat msgs={msgs} titulo="Chat da vila" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- NOITE (lobos, cela ou ações)
const LOBNoite: React.FC<{P: Partida; noite: number; modo: 'lobos' | 'cela' | 'acoes'; chat: Item[]; scene: Scene; avisos?: Aviso[]}> = ({P, noite, modo, chat, scene, avisos}) => {
  const f = useCurrentFrame();
  const N = P.noites.find((x) => x.n === noite)!;
  const mortos = mortosAte(P, {fase: 'noite', n: noite});
  const atual = [...chat].reverse().find((c) => f >= c.at);
  const car = N.cela ? jog(P, N.cela.carcereiro) : null;
  // ações da noite: cada uma entra quando o narrador diz o nome do papel
  const acoes = [
    N.vidente && {quem: 'vidente' as Papel, alvo: N.vidente.alvo, texto: `A Vidente viu: ${N.vidente.alvo} é ${PAPEIS[N.vidente.papel].nome}`},
    N.loboVidente && {quem: 'lobo_vidente' as Papel, alvo: N.loboVidente.alvo, texto: `O Lobo Vidente viu: ${N.loboVidente.alvo} é ${PAPEIS[N.loboVidente.papel].nome}`},
    N.detetive && {quem:'detetive' as Papel,alvo:N.detetive.alvos[0],texto:`O Detetive comparou ${N.detetive.alvos.join(' e ')}: ${N.detetive.mesmoTime?'mesmo time':'times diferentes'}`},
    N.medico && {quem: 'medico' as Papel, alvo: N.medico.alvo, texto: `O Médico protegeu ${N.medico.alvo}`},
    ...(N.xerife?.recebeu ? (N.xerife.pistas??[]).map(p=>({quem:'xerife' as Papel,alvo:p.alvo,texto:`O Xerife recebeu dois suspeitos pela morte de ${p.alvo}: ${p.suspeitos.join(' ou ')}`})) : []),
    N.videnteEspiritual?.recebeu && {quem:'vidente_espiritual' as Papel,alvo:N.videnteEspiritual.alvos[0],texto:`Vidente Espiritual verificou ${N.videnteEspiritual.alvos.join(' e ')}: ${N.videnteEspiritual.matou?'pelo menos um matou':'ninguém matou'}`},
  ].filter(Boolean) as {quem: Papel; alvo: string; texto: string}[];
  const gAc = gatilhos(scene, acoes.map((a) => (a.quem === 'lobo_vidente' ? 'lobo' : a.quem === 'medico' ? 'médico' : a.quem==='xerife'?'xerife':a.quem==='detetive'?'detetive':'vidente')));
  const atAc = acoes.map((_, i) => (gAc[i] >= 0 ? gAc[i] : 20 + i * 90));
  const acaoAtual = modo === 'acoes' ? acoes.map((a, i) => ({...a, at: atAc[i]})).filter((a) => f >= a.at).pop() : undefined;
  const msgs: Msg[] = [
    ...avisosMsgs(scene, avisos),
    ...chat.map((c) => {
      const j = jid(P, c.cor);
      if (c.pensa) return {tipo: 'pensa', j, texto: c.texto, at: c.at} as Msg;
      if (modo === 'cela' && car && j.id === car.id) return {tipo: 'anonimo', rotulo: 'Carcereiro', texto: c.texto, at: c.at} as Msg;
      return {tipo: 'jogador', j, texto: c.texto, at: c.at} as Msg;
    }),
    ...(modo === 'acoes' ? acoes.map((a, i) => ({tipo: 'sistema', texto: a.texto, cor: PAPEIS[a.quem].cor, at: atAc[i]} as Msg)) : []),
  ];
  const foco = useFocoFala(P, chat);
  const closeLobo = modo === 'lobos' ? chat.find((c) => c.pensa && LOBO(jid(P, c.cor).papel)) : undefined;
  return (
    <AbsoluteFill>
      <Fundo noite />
      <Barra texto={`Noite ${noite}`} noite icone={modo === 'cela' ? 'cadeado' : 'lua'} />
      <AbsoluteFill style={foco}>
      <Grade js={P.jogadores} noite estado={(j) => {
        const fala = atual?.cor === j.id && f <= atual.ate && !atual.pensa;
        const preso = N.cela?.preso === j.nome && !(N.cela.executou && f > (chat[chat.length - 1]?.ate ?? 1e9));
        return {
          morto: mortos.has(j.nome) || (N.cela?.executou && N.cela.preso === j.nome && f > (chat[chat.length - 1]?.ate ?? 1e9)),
          falando: fala, destaque: (atual?.cor === j.id && f <= atual.ate + 6) || (acaoAtual && (acaoAtual.alvo === j.nome || j.papel === acaoAtual.quem)),
          expressao: modo === 'lobos' && LOBO(j.papel) ? 'bravo' : preso ? 'assustado' : fala ? 'desconfiado' : 'dormindo',
          lobo: modo === 'lobos' && LOBO(j.papel), preso, apagado: modo === 'cela' && !preso && j !== car,
          protegido: modo === 'acoes' && acaoAtual?.quem === 'medico' && acaoAtual.alvo === j.nome,
          revelado: modo === 'acoes' && acaoAtual && ['vidente','lobo_vidente'].includes(acaoAtual.quem) && acaoAtual.alvo === j.nome,
          mira: modo === 'lobos' && N.alvoLobos === j.nome && f > (chat[chat.length - 1]?.ate ?? 1e9),
        } as EstadoQuadro;
      }} />
      </AbsoluteFill>
      <FalaGrande P={P} chat={chat} noite anonimo={modo === 'cela' && car ? car.id : undefined} />
      {acaoAtual ? <Faixa total={P.jogadores.length} key={acaoAtual.texto} texto={acaoAtual.texto} at={acaoAtual.at} cor={PAPEIS[acaoAtual.quem].cor} /> : null}
      {modo === 'cela' && N.cela ? (() => {
        const k = P.jogadores.findIndex((j) => j.nome === N.cela!.preso);
        const pq = posQuadro(k,P.jogadores.length);
        return <SeloMentira tipo="PRESO" at={6} x={pq.x + tamQuadro(P.jogadores.length) / 2} y={pq.y + tamQuadro(P.jogadores.length) * 0.5} />;
      })() : null}
      {modo === 'cela' ? <Sequence from={4} durationInFrames={45}><Audio src={staticFile('sfx/batida-porta.mp3')} volume={0.45} /></Sequence> : null}
      {closeLobo && f >= closeLobo.at - 6 && f <= closeLobo.ate + 10 ? <CloseLobo P={P} c={closeLobo} variante={(P.partida + noite) % 3} /> : null}
      {closeLobo ? <Sequence from={Math.max(0, closeLobo.at - 4)} durationInFrames={40}><Audio src={staticFile('sfx/bass-pulse.mp3')} volume={0.35} /></Sequence> : null}
      <Chat msgs={msgs} titulo={modo === 'lobos' ? 'Chat dos lobos' : modo === 'cela' ? 'Cela da prisão' : 'Ações da noite'} tema={modo === 'lobos' ? 'lobos' : modo === 'cela' ? 'cela' : 'noite'} />
    </AbsoluteFill>
  );
};


// close-up do lobo pensando: a câmera mergulha no rosto, as orelhas de lobo sobem, os olhos acendem em vermelho e o
// pensamento secreto (do log) aparece escrito embaixo. Entra antes de cada ação dos lobos.
const CloseLobo: React.FC<{P: Partida; c: Item; variante: number}> = ({P, c, variante}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const j = jid(P, c.cor);
  const t = f - c.at;
  const entra = spring({frame: t + 6, fps, config: {damping: 14, stiffness: 120}});
  const sai = interpolate(f, [c.ate + 2, c.ate + 10], [1, 0], cl);
  const zoom = 0.55 + 0.45 * entra + 0.05 * interpolate(t, [0, 120], [0, 1], cl);
  const orelha = interpolate(t, [4, 16], [70, 0], {...cl, easing: Easing.out(Easing.back(2))});
  const brilho = 0.6 + 0.4 * Math.abs(Math.sin(f / 5));
  const treme = t < 10 ? Math.sin(f * 2.7) * (10 - t) : 0;
  const n = Math.ceil(c.texto.length * interpolate(f, [c.at, Math.max(c.at + 1, c.ate - 6)], [0.05, 1], cl));
  const garra = interpolate(t, [-4, 6], [0, 1], cl);
  return (
    <AbsoluteFill style={{opacity: Math.min(1, (t + 6) / 6) * sai, zIndex: 40}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 38%, #5a0a14, #12030a 70%)'}} />
      {Array.from({length: 6}).map((_, i) => <div key={i} style={{position: 'absolute', left: ((i * 410 + f * (1 + i * 0.3)) % 2400) - 300, top: 620 + (i % 3) * 120, width: 700, height: 160, borderRadius: 99, background: 'rgba(255,80,80,0.06)', filter: 'blur(20px)'}} />)}
      {variante === 2 ? (
        <>
          <div style={{position: 'absolute', left: 960 - 300, top: 420 - interpolate(t, [0, 24], [0, 300], {...cl, easing: Easing.out(Easing.cubic)}), width: 600, height: 600, borderRadius: 999, background: '#fff3c4', boxShadow: '0 0 140px 40px rgba(255,243,196,0.35)'}} />
          <svg width={1920} height={1080} style={{position: 'absolute'}}>
            {[0, 1, 2].map((i) => { const k = ((t + i * 12) % 36) / 36; return <circle key={i} cx={960} cy={330} r={200 + k * 600} fill="none" stroke="#ff8a80" strokeWidth={10 * (1 - k)} opacity={1 - k} /> })}
          </svg>
        </>
      ) : null}
      <div style={{position: 'absolute', left: 960 - 380 + treme, top: 20, width: 760, height: 760, transform: `scale(${zoom})`, transformOrigin: '50% 45%', filter: variante === 1 ? `brightness(${interpolate(t, [0, 26], [0.08, 1], cl)})` : undefined}}>
        <svg width={760} height={760} viewBox="0 0 200 200">
          <g transform={`translate(0 ${orelha})`}>
            <path d="M38 70 L52 6 L86 52Z" fill="#4e4a5c" /><path d="M48 58 L54 22 L74 50Z" fill="#c48b9f" />
            <path d="M162 70 L148 6 L114 52Z" fill="#4e4a5c" /><path d="M152 58 L146 22 L126 50Z" fill="#c48b9f" />
          </g>
          <Avatar id={j.id} expressao="bravo" t={f} />
          <g opacity={brilho}>
            <circle cx={80} cy={98} r={13} fill="#ff1744" opacity={0.35} /><circle cx={120} cy={98} r={13} fill="#ff1744" opacity={0.35} />
            <circle cx={80} cy={99} r={5} fill="#ff5252" /><circle cx={120} cy={99} r={5} fill="#ff5252" />
          </g>
          <path d="M90 131 L94 142 L98 131Z M102 131 L106 142 L110 131Z" fill="#fff" stroke="#c62828" strokeWidth={0.8} />
        </svg>
      </div>
      {variante === 1 && t < 26 ? (
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {[[960 - 380 + 760 * 0.4, 20 + 760 * 0.49], [960 - 380 + 760 * 0.6, 20 + 760 * 0.49]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={22} fill="#ff1744" opacity={interpolate(t, [0, 6, 26], [0, 1, 0], cl)} style={{filter: 'blur(4px)'}} />)}
        </svg>
      ) : null}
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: variante === 0 ? 1 - garra : 0}}>
        {[0, 1, 2].map((i) => <path key={i} d={`M${640 + i * 200} 60 L${560 + i * 200} 760`} stroke="#ff1744" strokeWidth={26} strokeLinecap="round" strokeDasharray="800" strokeDashoffset={800 * (1 - Math.min(1, garra * 2))} />)}
      </svg>
      <div style={{position: 'absolute', left: 160, right: 160, top: 770, transform: `translateY(${(1 - entra) * 80}px)`}}>
        <div style={{background: 'rgba(20,4,8,0.88)', border: '6px solid #e53935', borderRadius: 28, padding: '18px 34px', boxShadow: '0 0 40px rgba(229,57,53,0.45)', fontFamily: FONTE}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, fontWeight: 900, fontSize: 26, letterSpacing: 2, color: '#ff8a80'}}>
            <IconePapel papel={j.papel} tamanho={46} />PENSAMENTO SECRETO · {j.nome.toUpperCase()} ({MARCA[j.modelo]?.nome}) · {PAPEIS[j.papel].nome.toUpperCase()}
          </div>
          <div style={{fontWeight: 800, fontSize: c.texto.length > 140 ? 36 : 42, lineHeight: 1.2, color: '#fff', fontStyle: 'italic', marginTop: 6}}>{c.texto.slice(0, n)}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- AMANHECER: quem morreu à noite
const LOBAmanhecer: React.FC<{P: Partida; noite: number; scene: Scene}> = ({P, noite, scene}) => {
  const f = useCurrentFrame();
  const N = P.noites.find((x) => x.n === noite)!;
  const antes = mortosAte(P, {fase: 'noite', n: noite});
  const g = gatilhos(scene, N.mortes.map((m) => m.nome));
  const at = N.mortes.map((_, i) => (g[i] >= 0 ? g[i] : 30 + i * 40));
  const tremor = useTremor(at[0] ?? 1e9);
  const msgs: Msg[] = [
    {tipo: 'sistema', texto: `Dia ${noite} começou. Preparem-se para discutir!`, at: 0},
    ...(N.mortes.length
      ? N.mortes.map((m, i) => ({tipo: 'sistema', cor: '#c62828', at: at[i], texto: m.causa === 'executado' ? `${m.nome} foi executado pelo Carcereiro. Era ${PAPEIS[m.papel].nome}.` : `${m.nome} foi morto pelos lobos. Era ${PAPEIS[m.papel].nome}.`} as Msg))
      : [{tipo: 'sistema', cor: '#2e7d32', at: 30, texto: 'Ninguém morreu esta noite!'} as Msg]),
  ];
  return (
    <AbsoluteFill style={{transform: `translate(${tremor.x}px,${tremor.y}px)`}}>
      <Fundo noite={false} />
      <Barra texto={`Dia ${noite}`} noite={false} icone="sol" />
      <Grade js={P.jogadores} noite={false} estado={(j) => {
        const i = N.mortes.findIndex((m) => m.nome === j.nome);
        const morreu = i >= 0 && f >= at[i];
        return {morto: antes.has(j.nome) || morreu, destaque: morreu && f < at[i] + 60, expressao: N.mortes.length ? 'chocado' : 'rindo'};
      }} />
      {N.mortes.map((m, i) => <Flash key={i} at={at[i]} cor="#b71c1c" />)}
      <Faixa total={P.jogadores.length} texto={N.mortes.length ? N.mortes.map((m) => `${m.nome} ${m.causa === 'executado' ? 'foi executado' : 'morreu'}`).join(' · ') : 'Ninguém morreu!'} at={at[0] ?? 30} cor={N.mortes.length ? '#c62828' : '#2e7d32'} />
      <Chat msgs={msgs} titulo="Chat da vila" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- TIRO DO PISTOLEIRO (dispara na palavra "pá")
const LOBTiro: React.FC<{P: Partida; dia: number; tiro?: number; scene: Scene}> = ({P, dia, tiro = 0, scene}) => {
  const f = useCurrentFrame();
  const D = P.dias.find((d) => d.n === dia)!;
  const T = D.tiros[tiro];
  const [gBang] = gatilhos(scene, ['pá']);
  const bang = gBang >= 0 ? gBang : 45;
  const mortos = mortosAte(P, {fase: 'dia', n: dia, tiros: tiro, acoes:D.acoes?.filter(a=>a.depoisDaFala<T.depoisDaFala!).length});
  const tremor = useTremor(bang, 26);
  const msgs: Msg[] = [
    {tipo: 'sistema', texto: `O Pistoleiro ${T.atirador} atirou em ${T.nome}!`, cor: '#a0522d', at: bang},
    {tipo: 'sistema', texto: `${T.nome} era ${PAPEIS[T.papel].nome}.`, cor: LOBO(T.papel) ? '#c62828' : '#455a64', at: bang + 30},
  ];
  return (
    <AbsoluteFill style={{transform: `translate(${tremor.x}px,${tremor.y}px)`}}>
      <Fundo noite={false} />
      <Barra texto={`Dia ${dia} · Tiro!`} noite={false} icone="sol" />
      <Grade js={P.jogadores} noite={false} estado={(j) => ({
        morto: mortos.has(j.nome) || (j.nome === T.nome && f >= bang), mira: j.nome === T.nome && f < bang,
        revelado: j.nome === T.atirador && f >= bang, destaque: j.nome === T.atirador || j.nome === T.nome,
        expressao: j.nome === T.atirador ? 'bravo' : f >= bang ? 'chocado' : 'assustado',
      })} />
      <Flash at={bang} />
      <Faixa total={P.jogadores.length} texto={`${T.atirador} atirou em ${T.nome}: era ${PAPEIS[T.papel].nome}!`} at={bang + 4} cor="#a0522d" />
      <Chat msgs={msgs} titulo="Chat da vila" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- ÁGUA BENTA (resultado lido do log, inclusive quando o Padre erra)
const LOBAguaBenta:React.FC<{P:Partida;dia:number;acao?:number;scene:Scene}>=({P,dia,acao=0,scene})=>{
  const f=useCurrentFrame();
  const D=P.dias.find(d=>d.n===dia)!;
  const A=D.acoes![acao];
  const [g]=gatilhos(scene,['água']);const at=g>=0?g:45;
  const mortos=mortosAte(P,{fase:'dia',n:dia,acoes:acao,tiros:D.tiros.filter(t=>(t.depoisDaFala??-1)<A.depoisDaFala).length});
  const resultado=`${A.morte.nome} morreu: era ${PAPEIS[A.morte.papel].nome}.`;
  return <AbsoluteFill>
    <Fundo noite={false}/><Barra texto={`Dia ${dia} · Água benta`} noite={false} icone="sol"/>
    <Grade js={P.jogadores} noite={false} estado={j=>({morto:mortos.has(j.nome)||(f>=at&&j.nome===A.morte.nome),destaque:j.nome===A.ator||j.nome===A.alvo,mira:f<at&&j.nome===A.alvo,revelado:f>=at&&j.nome===A.ator,expressao:f>=at?'chocado':'desconfiado'})}/>
    <Flash at={at} cor="#fff3c4"/><Faixa total={P.jogadores.length} texto={resultado} at={at+4} cor={PAPEIS.padre.cor}/>
    <Chat titulo="Chat da vila" msgs={[{tipo:'sistema',texto:`${A.ator} usou água benta em ${A.alvo}.`,at},{tipo:'sistema',texto:resultado,at:at+20}]}/>
  </AbsoluteFill>;
};

// ---------------------------------------------------------------- VOTAÇÃO (os votos entram um a um)
const LOBVotos: React.FC<{P: Partida; dia: number; scene: Scene}> = ({P, dia, scene}) => {
  const f = useCurrentFrame();
  const D = P.dias.find((d) => d.n === dia)!;
  const mortos = mortosAte(P, {fase: 'dia', n: dia, tiros: D.tiros.length, acoes:D.acoes?.length});
  const votos = Object.entries(D.votos);
  const passo = Math.max(10, Math.min(36, (scene.duration - 60) / Math.max(1, votos.length)));
  const quando = votos.map((_, i) => 15 + i * passo);
  const cont: Record<string, number> = {};
  votos.forEach(([, alvo], i) => { if (f >= quando[i] && alvo !== 'ninguém') cont[alvo] = (cont[alvo] ?? 0) + (D.pesosVoto?.[votos[i][0]]??1) });
  const ultimo = votos.map((v, i) => ({v, at: quando[i]})).filter((x) => f >= x.at).pop();
  const msgs: Msg[] = [
    {tipo: 'sistema', texto: 'Hora de votar!', at: 0},
    ...votos.map(([quem, alvo], i) => ({tipo: 'sistema', cor: '#37474f', at: quando[i], texto: alvo === 'ninguém' ? `${quem} não votou` : `${quem} votou em ${alvo}${D.pesosVoto?.[quem]===2?' (peso 2)':''}`} as Msg)),
  ];
  return (
    <AbsoluteFill>
      <Fundo noite={false} />
      <Barra texto={`Dia ${dia} · Votação`} noite={false} icone="urna" />
      <Grade js={P.jogadores} noite={false} estado={(j) => ({
        morto: mortos.has(j.nome), votos: cont[j.nome] ?? 0,
        destaque: ultimo ? ultimo.v[0] === j.nome && f < ultimo.at + passo : false,
        expressao: (cont[j.nome] ?? 0) >= 3 ? 'assustado' : ultimo?.v[0] === j.nome ? 'desconfiado' : 'neutro',
      })} />
      <Chat msgs={msgs} titulo="Votação" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- LINCHADO (a carta vira na palavra "era")
const LOBLinchado: React.FC<{P: Partida; dia: number; scene: Scene}> = ({P, dia, scene}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const D = P.dias.find((d) => d.n === dia)!;
  const L = D.linchado;
  const [gEra] = gatilhos(scene, ['era']);
  const revela = gEra >= 0 ? gEra : 50;
  const e = spring({frame: f, fps, config: {damping: 14}});
  const vira = interpolate(f, [revela, revela + 10], [0, 180], cl);
  const tremor = useTremor(L ? revela : 1e9, 18);
  if (!L) {
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <Fundo noite={false} />
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 130, color: '#fff', transform: `scale(${e})`, textShadow: '0 8px 0 rgba(0,0,0,0.3)'}}>EMPATE</div>
        <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 50, color: '#ffd54f', opacity: e}}>Ninguém foi linchado</div>
      </AbsoluteFill>
    );
  }
  const j = jog(P, L.nome);
  return (
    <AbsoluteFill style={{transform: `translate(${tremor.x}px,${tremor.y}px)`}}>
      <Fundo noite={false} />
      <Barra texto={`Dia ${dia} · Linchamento`} noite={false} icone="urna" />
      <div style={{position: 'absolute', left: 230, top: 210, transform: `scale(${e}) rotate(${(1 - e) * -10}deg)`}}>
        <Quadro j={j} s={{morto: f >= revela + 5, expressao: L.papel === 'bobo' ? 'rindo' : 'chorando'}} noite={false} t={f} tam={620} />
      </div>
      <div style={{position: 'absolute', left: 980, top: 200, width: 760, fontFamily: FONTE, color: '#fff'}}>
        <div style={{fontWeight: 900, fontSize: 68, lineHeight: 1.05, opacity: e}}>{L.nome} foi linchado pela vila</div>
        <div style={{marginTop: 40, marginLeft: 150, width: 380, height: 470, perspective: 1200}}>
          <div style={{position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: `rotateY(${vira}deg)`}}>
            <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 26, background: `repeating-linear-gradient(45deg, ${ROSA}, ${ROSA} 18px, #e91e63 18px, #e91e63 36px)`, border: '8px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontWeight: 900, fontSize: 170, color: '#fff'}}>?</div>
            </div>
            <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 26, background: '#fff', border: `8px solid ${PAPEIS[L.papel].cor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
              <IconePapel papel={L.papel} tamanho={230} />
              <div style={{fontWeight: 900, fontSize: 50, color: PAPEIS[L.papel].cor}}>{PAPEIS[L.papel].nome}</div>
              <div style={{fontWeight: 700, fontSize: 25, color: '#455a64', textAlign: 'center', padding: '0 22px'}}>{PAPEIS[L.papel].desc}</div>
            </div>
          </div>
        </div>
      </div>
      <Flash at={revela + 5} cor={LOBO(L.papel) ? '#ff1744' : L.papel === 'bobo' ? ROSA : '#ffffff'} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- SORTEIO DOS PAPÉIS (o público vê tudo)
const LOBSorteio: React.FC<{P: Partida; scene: Scene}> = ({P, scene}) => {
  const f = useCurrentFrame();
  const g = gatilhos(scene, P.jogadores.map((j) => j.nome));
  const passo = scene.duration / (P.jogadores.length + 1);
  const at = P.jogadores.map((j, i) => (g[i] >= 0 ? g[i] : 20 + i * passo));
  const msgs: Msg[] = [
    {tipo: 'sistema', texto: `Partida ${P.partida}: papéis sorteados`, at: 0},
    ...P.jogadores.map((j, i) => ({tipo: 'sistema', cor: PAPEIS[j.papel].cor, at: at[i], texto: `${j.nome} é ${PAPEIS[j.papel].nome}`} as Msg)),
  ];
  return (
    <AbsoluteFill>
      <Fundo noite={false} />
      <Barra texto="Papéis secretos" noite={false} icone="cadeado" />
      <Grade js={P.jogadores} noite={false} estado={(j) => {
        const i = P.jogadores.indexOf(j);
        return {revelado: f >= at[i], lobo: f >= at[i] && LOBO(j.papel), destaque: f >= at[i] && f < at[i] + 25, expressao: LOBO(j.papel) && f >= at[i] ? 'rindo' : 'neutro'};
      }} />
      <Chat msgs={msgs} titulo="Só você vê" tema="noite" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- ELENCO (jogadores entrando na sala, na hora em que a marca é dita)
const LOBElenco: React.FC<{P: Partida; scene: Scene}> = ({P, scene}) => {
  const f = useCurrentFrame();
  const marcas = [...new Set(P.jogadores.map((j) => MARCA[j.modelo]?.nome ?? j.modelo))];
  const g = gatilhos(scene, marcas);
  const passo=P.jogadores.length>8 ? Math.min(25,Math.max(4,(scene.duration-45)/(P.jogadores.length-1))) : 25;
  const at = (j: Jogador) => {
    const i = marcas.indexOf(MARCA[j.modelo]?.nome ?? j.modelo);
    return g[i] >= 0 ? g[i] : 10 + P.jogadores.indexOf(j) * passo;
  };
  const msgs: Msg[] = P.jogadores.map((j) => ({tipo: 'sistema', cor: '#37474f', at: at(j), texto: `${j.numero} ${j.nome} entrou (${j.modelo})`}));
  return (
    <AbsoluteFill>
      <Fundo noite={false} />
      <Barra texto={`Sala · ${P.jogadores.length} jogadores`} noite={false} icone="balao" />
      <Grade js={P.jogadores} noite={false} estado={(j) => ({apagado: f < at(j), destaque: f >= at(j) && f < at(j) + 20, expressao: f >= at(j) ? 'rindo' : 'dormindo'})} />
      <Chat msgs={msgs} titulo="Sala" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- PAPÉIS (explicação, cada carta entra quando o narrador fala o nome)
const ORDEM: Papel[] = ['lobisomem', 'lobo_vidente', 'vidente', 'medico', 'carcereiro', 'pistoleiro', 'bobo', 'aldeao'];
const LOBPapeis: React.FC<{P:Partida; scene: Scene; pagina?:number}> = ({P,scene,pagina}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ordem = [...ORDEM,...(['lobo_alfa','padre','xerife','vidente_espiritual','detetive','prefeito'] as Papel[])].filter(p=>P.jogadores.some(j=>j.papel===p));
  const paginas=Math.ceil(ordem.length/8);
  const page=pagina??Math.min(paginas-1,Math.floor(f/(scene.duration/paginas)));
  const visiveis=ordem.slice(page*8,page*8+8);
  const compacto=false;
  const g = gatilhos(scene, ordem.map(p=>p==='lobo_vidente'?'lobo':p==='vidente_espiritual'?'espiritual':PAPEIS[p].nome.split(' ')[0]));
  return (
    <AbsoluteFill>
      <Fundo noite={false} />
      <Barra texto={`Os papéis${paginas>1?` · ${page+1}/${paginas}`:''}`} noite={false} icone="cadeado" />
      <div style={{position: 'absolute', left: 70, top: 140, width: 1780, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: compacto?18:30}}>
        {visiveis.map((p, i) => {
          const at = g[page*8+i] >= 0 ? g[page*8+i] : (pagina===undefined?page*scene.duration/paginas:0)+i*25;
          const e = spring({frame: f - at, fps, config: {damping: 12}});
          const time = PAPEIS[p].time;
          return (
            <div key={p} style={{height: compacto?270:410, boxSizing:'border-box', borderRadius: 26, background: '#fff', border: `7px solid ${PAPEIS[p].cor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: compacto?12:20, gap: compacto?6:10, transform: `scale(${f >= at ? e : 0}) rotate(${(1 - e) * 8}deg)`, boxShadow: '0 10px 24px rgba(0,0,0,0.4)'}}>
              <div style={{alignSelf: 'stretch', textAlign: 'center', fontFamily: FONTE, fontWeight: 900, fontSize: 22, color: '#fff', background: time === 'lobos' ? '#c62828' : time === 'solo' ? ROSA : '#2e7d32', borderRadius: 10}}>{time === 'lobos' ? 'TIME DOS LOBOS' : time === 'solo' ? 'SOLO' : 'TIME DA VILA'}</div>
              <IconePapel papel={p} tamanho={compacto?100:170} />
              <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: compacto?28:p==='vidente_espiritual'?30:40, color: PAPEIS[p].cor}}>{PAPEIS[p].nome}</div>
              <div style={{fontFamily: FONTE, fontWeight: 700, fontSize: compacto?20:25, color: '#455a64', textAlign: 'center'}}>{PAPEIS[p].desc}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- CHEGADA DA NOITE / DO DIA (tela cheia)
const LOBFase: React.FC<{tipo: 'noite' | 'dia'; n: number; sub?: string}> = ({tipo, n, sub}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const noite = tipo === 'noite';
  const sobe = interpolate(f, [0, 30], [300, 0], {...cl, easing: Easing.out(Easing.cubic)});
  const e = spring({frame: f - 10, fps, config: {damping: 11}});
  return (
    <AbsoluteFill style={{background: noite ? 'linear-gradient(#0b1630, #1d3a6b)' : 'linear-gradient(#4fc3f7, #b3e5fc)', overflow: 'hidden'}}>
      {noite ? Array.from({length: 40}).map((_, i) => <div key={i} style={{position: 'absolute', left: (i * 211) % 1920, top: (i * 97) % 600, width: 4 + (i % 3) * 2, height: 4 + (i % 3) * 2, borderRadius: 9, background: '#fff', opacity: 0.4 + 0.6 * Math.abs(Math.sin((f + i * 9) / 12))}} />) : null}
      <div style={{position: 'absolute', left: 960 - 160, top: 200 + sobe, width: 320, height: 320, borderRadius: 999, overflow: 'hidden', background: noite ? '#fff3c4' : '#ffd54f', boxShadow: noite ? '0 0 120px 30px rgba(255,243,196,0.45)' : '0 0 140px 50px rgba(255,213,79,0.6)'}}>
        {noite ? <div style={{position: 'absolute', left: 90, top: -20, width: 300, height: 300, borderRadius: 999, background: '#13244a'}} /> : null}
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d="M0 700 L260 480 L460 640 L700 420 L980 660 L1220 460 L1480 640 L1700 500 L1920 620 L1920 1080 L0 1080Z" fill={noite ? '#0e1f3d' : '#5c9e4a'} />
        <path d="M0 820 Q480 740 960 800 Q1440 860 1920 780 L1920 1080 L0 1080Z" fill={noite ? '#132c24' : '#7bc950'} />
        {[180, 420, 1520, 1760].map((x, i) => (
          <g key={x} transform={`translate(${x} ${830 + (i % 2) * 30})`}>
            <rect x={-46} y={-60} width={92} height={70} fill={noite ? '#2a2f45' : '#e0c097'} />
            <path d="M-60 -60 L0 -110 L60 -60Z" fill={noite ? '#3b1f2b' : '#c0392b'} />
            <rect x={-14} y={-36} width={28} height={28} fill={noite ? (i % 2 ? '#ffd54f' : '#1b2238') : '#81d4fa'} />
          </g>
        ))}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', transform: `scale(${e})`}}>
        <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 160, color: '#fff', textShadow: '0 10px 0 rgba(0,0,0,0.25)'}}>{noite ? `NOITE ${n}` : `DIA ${n}`}</div>
        {sub ? <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 50, color: noite ? '#ffd54f' : AZUL}}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- FIM DA PARTIDA
const LOBFim: React.FC<{P: Partida}> = ({P}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const v = P.resultado.vencedor;
  const ganhou = P.jogadores.filter((j) => (v === 'lobos' ? LOBO(j.papel) : v === 'bobo' ? j.papel === 'bobo' : !LOBO(j.papel) && j.papel !== 'bobo'));
  const cor = v === 'lobos' ? '#c62828' : v === 'bobo' ? ROSA : '#2e7d32';
  const winTam = ganhou.length > 8 ? 220 : 300;
  const e = spring({frame: f, fps, config: {damping: 10}});
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${cor}, #120a14 80%)`, overflow: 'hidden'}}>
      {Array.from({length: 16}).map((_, i) => <div key={i} style={{position: 'absolute', left: 960, top: 420, width: 2200, height: 70, background: 'rgba(255,255,255,0.05)', transformOrigin: '0 50%', transform: `rotate(${i * 22.5 + f * 0.4}deg)`}} />)}
      <div style={{position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center', fontFamily: FONTE, fontWeight: 900, fontSize: 120, color: '#fff', transform: `scale(${e})`, textShadow: '0 10px 0 rgba(0,0,0,0.3)'}}>
        {v === 'lobos' ? 'OS LOBOS VENCERAM' : v === 'bobo' ? 'O BOBO VENCEU' : v === 'aldeia' ? 'A VILA VENCEU' : 'EMPATE'}
      </div>
      <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22, flexWrap: 'wrap', padding: '0 80px'}}>
        {ganhou.map((j, i) => {
          const k = spring({frame: f - 12 - i * 5, fps, config: {damping: 11}});
          return (
            <div key={j.id} style={{transform: `scale(${k}) translateY(${Math.sin((f + i * 8) / 7) * 6}px)`}}>
              <Quadro j={j} s={{revelado: true, expressao: 'rindo', morto: !P.resultado.vivos.includes(j.nome)}} noite={false} t={f + i * 9} tam={winTam} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- TÍTULO (tela rosa, com lobo próprio)
export const LogoLobo: React.FC<{tam?: number}> = ({tam = 360}) => (
  <svg width={tam} height={tam} viewBox="0 0 200 200">
    <path d="M40 30 L70 90 L56 120 L100 170 L150 128 L136 90 L164 26 L120 62 L84 62Z" fill="#3d3a4b" stroke="#fff" strokeWidth={8} strokeLinejoin="round" />
    <path d="M48 40 L72 76 L80 66Z M156 36 L132 74 L124 64Z" fill="#262331" />
    <path d="M78 120 L100 162 L124 122 Q100 112 78 120Z" fill="#e8e6ef" />
    <path d="M92 136 L100 148 L108 136Z" fill="#1d1b26" />
    <path d="M70 102 L94 106 L80 112Z M132 102 L108 106 L122 112Z" fill="#ffe14d" />
  </svg>
);
const LOBTitulo: React.FC<{titulo: string; sub?: string; selos?: string[]; scene: Scene}> = ({titulo, sub, selos = [], scene}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const gs = gatilhos(scene, selos);
  const e = spring({frame: f, fps, config: {damping: 10}});
  const e2 = spring({frame: f - 8, fps, config: {damping: 12}});
  return (
    <AbsoluteFill style={{background: ROSA, alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
      {Array.from({length: 7}).map((_, i) => <div key={i} style={{position: 'absolute', left: (i * 330 + f * 2) % 2200 - 200, top: 80 + (i % 3) * 330, width: 240, height: 90, borderRadius: 99, background: 'rgba(255,255,255,0.18)'}} />)}
      <div style={{transform: `scale(${e}) rotate(${Math.sin(f / 18) * 3}deg)`}}><LogoLobo tam={380} /></div>
      <div style={{fontFamily: FONTE, fontWeight: 900, fontSize: 120, color: '#fff', marginTop: 10, transform: `scale(${e2})`, textShadow: '0 8px 0 rgba(0,0,0,0.18)', textAlign: 'center', lineHeight: 1}}>{titulo}</div>
      {sub && !selos.length ? <div style={{fontFamily: FONTE, fontWeight: 800, fontSize: 48, color: AZUL, marginTop: 18, opacity: e2}}>{sub}</div> : null}
      {selos.length ? (
        <div style={{display: 'flex', gap: 34, marginTop: 30, height: 120}}>
          {selos.map((t, i) => {
            const at = gs[i] >= 0 ? gs[i] : 30 + i * 20;
            const k = spring({frame: f - at, fps, config: {damping: 9, stiffness: 170}});
            const cor = CORES_MENTIRA[t.toUpperCase()] ?? '#d50000';
            return f < at ? <div key={t} style={{width: 330}} /> : (
              <div key={t} style={{width: 330, display: 'flex', justifyContent: 'center', transform: `rotate(${-8 + i * 7}deg) scale(${0.3 + 0.7 * k + 0.4 * Math.max(0, 1 - (f - at) / 6)})`}}>
                <div style={{border: `9px solid ${cor}`, color: cor, background: '#fff', borderRadius: 16, padding: '6px 20px', fontFamily: FONTE, fontWeight: 900, fontSize: 46, letterSpacing: 2}}>{t.toUpperCase()}</div>
              </div>
            );
          })}
        </div>
      ) : null}
      {selos.map((t, i) => (gs[i] >= 0 ? <Sequence key={t} from={gs[i]} durationInFrames={45}><Audio src={staticFile('sfx/censor-beep.mp3')} volume={0.3} /></Sequence> : null))}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- PLACAR FINAL (vencedores + ranking de mentiras por IA)
const LOBPlacar: React.FC<{partidas: Record<string, Partida>; ordem: number[]}> = ({partidas, ordem}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ment: Record<string, number> = {};
  for (const n of ordem) for (const d of partidas[String(n)]?.dias ?? []) for (const x of d.falas) {
    if (x.mentira && x.mentira.tipo !== 'VERDADE') {
      const m = MARCA[partidas[String(n)].jogadores.find((j) => j.id === x.id)!.modelo]?.nome ?? '?';
      ment[m] = (ment[m] ?? 0) + 1;
    }
  }
  const rank = Object.entries(ment).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rank.map((r) => r[1]));
  return (
    <AbsoluteFill>
      <Fundo noite={false} />
      <Barra texto="Placar final" noite={false} icone="urna" />
      <div style={{position: 'absolute', left: 70, top: 150, width: 820, display: 'flex', flexDirection: 'column', gap: 20}}>
        {ordem.map((n, i) => {
          const P = partidas[String(n)];
          if (!P) return null;
          const e = spring({frame: f - i * 10, fps, config: {damping: 13}});
          const v = P.resultado.vencedor;
          const cor = v === 'lobos' ? '#c62828' : v === 'bobo' ? ROSA : '#2e7d32';
          return (
            <div key={n} style={{background: '#fff', borderRadius: 22, padding: '18px 26px', borderLeft: `16px solid ${cor}`, transform: `translateX(${(1 - e) * -500}px)`, fontFamily: FONTE}}>
              <div style={{fontWeight: 900, fontSize: 36, color: cor}}>Partida {i + 1}: {v === 'lobos' ? 'os lobos venceram' : v === 'bobo' ? 'o Bobo venceu' : 'a vila venceu'}</div>
              <div style={{fontWeight: 700, fontSize: 24, color: '#455a64'}}>Lobos: {P.jogadores.filter((j) => LOBO(j.papel)).map((j) => `${j.nome} (${MARCA[j.modelo]?.nome})`).join(' e ')} · {P.resultado.dias} dias</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 960, top: 150, width: 890, background: '#fff', borderRadius: 26, padding: 30, fontFamily: FONTE}}>
        <div style={{fontWeight: 900, fontSize: 42, color: '#d50000', marginBottom: 18}}>Quem mais mentiu</div>
        {rank.map(([m, c], i) => {
          const k = interpolate(f, [30 + i * 12, 60 + i * 12], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
          const cor = Object.values(MARCA).find((x) => x.nome === m)?.cor ?? '#999';
          return (
            <div key={m} style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16}}>
              <div style={{width: 170, fontWeight: 900, fontSize: 32, color: cor}}>{m}</div>
              <div style={{height: 48, width: 560 * (c / max) * k, background: cor, borderRadius: 12}} />
              <div style={{fontWeight: 900, fontSize: 40, color: '#263238', transform: `scale(${1 + 0.3 * Math.max(0, 1 - Math.abs(k - 1) * 8)})`}}>{Math.round(c * k)}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- liga os nomes do roteiro aos componentes
export const LOBVisual: React.FC<{name: string; props: Record<string, any>; scene: Scene; timeline: Timeline}> = ({name, props: p, scene, timeline}) => {
  const ps = (timeline.data as any).partidas as Record<string, Partida>;
  const P = ps[String(p.partida ?? 1)];
  switch (name) {
    case 'LOBChat': return <LOBChat P={P} dia={p.dia} chat={(p.chat ?? []) as Item[]} scene={scene} tiros={p.tiros} acoes={p.acoes} avisos={p.avisos} />;
    case 'LOBNoite': return <LOBNoite P={P} noite={p.noite} modo={p.modo ?? 'lobos'} chat={(p.chat ?? []) as Item[]} scene={scene} avisos={p.avisos} />;
    case 'LOBAmanhecer': return <LOBAmanhecer P={P} noite={p.noite} scene={scene} />;
    case 'LOBTiro': return <LOBTiro P={P} dia={p.dia} tiro={p.tiro} scene={scene} />;
    case 'LOBAguaBenta': return <LOBAguaBenta P={P} dia={p.dia} acao={p.acao} scene={scene} />;
    case 'LOBVotos': return <LOBVotos P={P} dia={p.dia} scene={scene} />;
    case 'LOBLinchado': return <LOBLinchado P={P} dia={p.dia} scene={scene} />;
    case 'LOBSorteio': return <LOBSorteio P={P} scene={scene} />;
    case 'LOBElenco': return <LOBElenco P={P} scene={scene} />;
    case 'LOBPapeis': return <LOBPapeis P={P} scene={scene} pagina={p.pagina} />;
    case 'LOBFase': return <LOBFase tipo={p.tipo} n={p.n} sub={p.sub} />;
    case 'LOBFim': return <LOBFim P={P} />;
    case 'LOBTitulo': return <LOBTitulo titulo={p.titulo} sub={p.sub} selos={p.selos} scene={scene} />;
    case 'LOBPlacar': return <LOBPlacar partidas={ps} ordem={p.ordem ?? [1, 2, 3, 4]} />;
    default: return <AbsoluteFill style={{background: '#300'}} />;
  }
};

