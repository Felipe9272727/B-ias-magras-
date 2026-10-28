// Among Us 5 (Polus): cópia de amongus3/Jogo.tsx com o mapa Polus (ArtePolus + simulador sim5), 18 cores, sem emoji
// (ícones de Icones5) e os efeitos novos: poça da Víbora, corpo derretendo, Doutor carregando/revivendo, Chato,
// camuflagem. Original:
// Among Us 3 (cópia adaptada do AU2): a gameplay como numa gravação de tela do jogo. A câmera segue um jogador de perto, com o círculo de
// visão, a barra de tarefas e a lista no canto, e os botões do canto de baixo (USAR/REPORTAR ou MATAR/SABOTAR/DUTO).
// Posições vêm da simulação em tempo real (sim.ts): cada quadro da cena é um quadro da partida, ninguém teleporta.
// Desenho todo próprio (nada do jogo original).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Som} from '../amongus3/Telas';
import {Crewmate, COR} from '../amongus/Crewmate';
import {Crewmate4} from '../amongus/Crewmate4';
import {EfeitoBase5} from './EfeitosBase5';
import {Corpo5, DUR_EFEITO5, DutosFixos, DutosTapados, Efeito5, MarcasJogador, TampasDuto, animDuto} from './Efeitos5';
import {ArtePolus} from './polus/ArtePolus';
import {POLUS, type SalaPolus} from './polus/mapaPolus';
import {salaEm} from './polus/caminhoPolus';
import {FONT} from '../theme';
import {CORES, Partida2, Sim, simular} from './sim5';
import {quandoNaCena, velocidade, type Corte, type Mapa} from '../amongus3/tempo';
import {Cadeado, Cruz, Desativado, Envelope, Gosma, Sino} from './Icones5';

const MUNDO = {w: POLUS.cols * 48, h: POLUS.rows * 48};
const ESCALA = 1.75; // tripulante com ~130 px de altura na tela, como no jogo
export const EMPRESA: Record<string, {nome: string; cor: string}> = {
  'DeepSeek Flash': {nome: 'DeepSeek', cor: '#2f6bff'},
  'Claude Haiku': {nome: 'Claude', cor: '#d97a47'},
  'Claude Sonnet': {nome: 'Sonnet', cor: '#c4612f'},
  'Claude Opus': {nome: 'Opus', cor: '#b5532a'},
  'GPT-5.6 Luna': {nome: 'GPT', cor: '#10a37f'},
  'Gemini 3.8 Flash': {nome: 'Gemini', cor: '#8e5cf7'},
  'Grok 4.3': {nome: 'Grok', cor: '#111111'},
  'Mistral Large 4': {nome: 'Mistral', cor: '#e8a000'},
  'GLM 5.3 Flash': {nome: 'GLM', cor: '#0f9d8a'},
  'MiniMax M3': {nome: 'MiniMax', cor: '#e2325a'},
  'MiniMax M3.1 Flash': {nome: 'MiniMax', cor: '#e2325a'},
  'Qwen 3.8 27B': {nome: 'Qwen', cor: '#615ced'},
  'Ministral 14B': {nome: 'Mistral', cor: '#e8a000'},
  'GPT-6.1 Terra': {nome: 'GPT', cor: '#10a37f'},
  'MiMo V2.6 Flash': {nome: 'MiMo', cor: '#ff6900'},
};
export const PAPEL_NOME: Record<string, string> = {Medico: 'Médico', Palhaco: 'Palhaço', Seguranca: 'Segurança', Glutao: 'Glutão', Mecanico: 'Mecânico', Vibora: 'Víbora', Influencer: 'Fotógrafo'}; // AU5: o Influencer vivo aparece como Fotógrafo (o Influencer é só o fantasma)

// AU4: skin que cada IA escolheu (logs4/skins.json)
export type Skins = Record<string, {cabeca?: string | null; roupa?: string | null; pet?: string | null}>;

// portas de cada sala: células 'D' encostadas no piso dela (para desenhar as portas trancadas)
const PORTAS: Record<string, {x: number; y: number; vertical: boolean}[]> = {};
for (const s of Object.keys(POLUS.salas) as SalaPolus[]) {
  const {c, r, w, h} = POLUS.salas[s].rect;
  const ch = (cc: number, rr: number) => POLUS.grid[rr]?.charAt(cc) ?? ' ';
  PORTAS[s] = [];
  for (let rr = r - 1; rr <= r + h; rr++) for (let cc = c - 1; cc <= c + w; cc++) {
    if (ch(cc, rr) !== 'D') continue;
    PORTAS[s].push({x: cc * 48, y: rr * 48, vertical: cc < c || cc >= c + w});
  }
}

type Props = {p: Partida2; de: number; mapa?: Mapa; foco: string; papeis?: boolean; hud?: boolean; morte?: boolean; monitor?: boolean; sons?: boolean; chat?: boolean; skins?: Skins; tiqueHud?: boolean; parado?: boolean; semSala?: boolean};

// ícones dos botões, desenhados (sem emoji): branco com contorno preto grosso, como os do jogo
const tr = {stroke: '#000', strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const ICONES: Record<string, React.ReactNode> = {
  usar: (<g {...tr} fill="#fff"><path d="M30 78V40c0-5 8-5 8 0v-14c0-5 8-5 8 0v-4c0-5 8-5 8 0v6c0-5 8-5 8 0v26l4-8c3-5 10-2 8 3l-10 22c-3 6-8 9-14 9H40c-6 0-10-4-10-10z" /></g>),
  reportar: (<g {...tr}><path d="M18 42h14l34-18v52L32 58H18z" fill="#fff" /><path d="M24 58l6 20h10l-4-20" fill="#fff" /><path d="M76 38c6 4 6 20 0 24M84 30c10 8 10 32 0 40" fill="none" stroke="#fff" strokeWidth={5} /></g>),
  matar: (<g {...tr}><path d="M22 78l36-36 10 10-36 36c-4 4-14 0-10-10z" fill="#d8dde6" /><path d="M58 42l20-20 6 6-20 20" fill="#7a4a22" /><path d="M54 38l14 14" stroke="#000" strokeWidth={7} /></g>),
  sabotar: (<g {...tr}><path d="M50 12L88 80H12z" fill="#ffd21f" /><path d="M54 30L40 56h12l-6 18 16-28H50l6-16z" fill="#000" stroke="none" /></g>),
  duto: (<g {...tr}><rect x={16} y={24} width={68} height={52} rx={6} fill="#9aa3b0" />{[34, 46, 58].map((y) => <path key={y} d={`M24 ${y}h52`} stroke="#3a3f49" strokeWidth={6} />)}</g>),
};

// botão redondo do canto (desenho próprio no espírito do jogo)
const Botao: React.FC<{rotulo: string; icone: string; ativo: boolean; numero?: number; cor?: string}> = ({rotulo, icone, ativo, numero, cor = '#fff'}) => (
  <div style={{width: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: ativo ? 1 : 0.38}}>
    <div style={{position: 'relative', width: 128, height: 128, borderRadius: 26, background: 'radial-gradient(circle at 35% 30%, #5b6170, #262a33)', border: '6px solid #0b0c10', display: 'grid', placeItems: 'center', boxShadow: '0 6px 0 #000a'}}>
      <svg width={96} height={96} viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 3px 0 #000)'}}>{ICONES[icone]}</svg>
      {numero !== undefined && numero > 0 && (
        <span style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 70, color: '#fff', WebkitTextStroke: '3px #000'}}>{numero}</span>
      )}
    </div>
    <div style={{marginTop: 4, fontFamily: FONT.display, fontWeight: 900, fontSize: 30, letterSpacing: 2, color: cor, WebkitTextStroke: '2px #000', textShadow: '0 3px 0 #000'}}>{rotulo}</div>
  </div>
);

// objetivo de cada neutro no lugar da lista de tarefas
const OBJETIVO_NEUTRO: Record<string, string> = {
  Palhaco: 'Faça todo mundo votar em você.', Camuflador: 'Camufle-se, mate e seja o último vivo.', Paciente: 'Espere a recarga, mate e seja o último vivo.',
  Traidor: 'Finja ser impostor e elimine os impostores.', Glutao: 'Devore todos e seja o último assassino.', Sobrevivente: 'Chegue vivo ao fim.', Piromante: 'Encharque todos e incendeie.',
};

// tarefas falsas do impostor (como no jogo, ele recebe uma lista de mentira): 4 tarefas dos tripulantes, escolhidas pela cor
function falsas(p: Partida2, cor: string): string[] {
  const todas = [...new Set(p.jogadores.flatMap((j: any) => (j.tarefas ?? []).map((t: any) => t.nome as string)))].sort();
  let h = 0;
  for (const ch of cor + p.partida) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const out: string[] = [];
  for (let i = 0; out.length < Math.min(4, todas.length); i++) {
    const t = todas[(h + i * 7919) % todas.length];
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

const Hud: React.FC<{p: Partida2; s: Sim; f: number; foco: string; frame: number}> = ({p, s, f, foco, frame}) => {
  const info = p.jogadores.find((j) => j.cor === foco)!;
  const imp = info.time === 'impostor';
  const palhaco = info.papel === 'Palhaco';
  const sab = s.sabotagem(f);
  const tk = s.inicioTique.findIndex((q, i) => q <= f && (s.inicioTique[i + 1] ?? Infinity) > f);
  const tarefas = p.tiques[Math.max(0, tk - 1)]?.estado?.jogadores ? null : null;
  void tarefas;
  // lista de tarefas do foco (pelo log: as que ele fez até aqui)
  const minhas = (p as any).jogadores.find((j: any) => j.cor === foco)?.tarefas ?? [];
  const feitas = new Set(p.eventos.filter((e) => e.tipo === 'tarefa' && e.cor === foco && s.eventos.find((x) => x.tipo === 'tarefa' && x.cor === foco && x.nome === e.nome && x.quadro <= f)).map((e) => e.nome));
  const q = s.q(foco, f);
  const pertoCorpo = q && s.corpos(f).some((c) => Math.hypot(c.x - q.x, c.y - q.y) < 260);
  const alvoPerto = q && imp && CORES.some((c) => c !== foco && s.q(c, f) && Math.hypot(s.q(c, f)!.x - q.x, s.q(c, f)!.y - q.y) < 200 && p.jogadores.find((j) => j.cor === c)?.time === 'tripulante');
  return (
    <>
      {/* barra de tarefas e lista (canto de cima, à esquerda) */}
      <div style={{position: 'absolute', left: 26, top: 22, width: 640}}>
        <div style={{position: 'relative', height: 46, background: '#2a2e38', border: '6px solid #0b0c10', borderRadius: 6, overflow: 'hidden'}}>
          <div style={{width: `${s.tarefas(f) * 100}%`, height: '100%', background: 'linear-gradient(#57e04f, #2f9e2a)'}} />
          <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 21, letterSpacing: 2, color: '#fff', WebkitTextStroke: '1.5px #000'}}>TOTAL DE TAREFAS CONCLUÍDAS</div>
        </div>
        <div style={{marginTop: 8, padding: '12px 18px', width: 470, background: 'rgba(40,44,54,.72)', borderRadius: 8, fontFamily: FONT.display, fontWeight: 700, fontSize: 22, lineHeight: 1.35, color: '#fff', textShadow: '0 2px 0 #000'}}>
          {info.time === 'neutro' ? (
            <div style={{color: '#c08bff', fontWeight: 900}}>{OBJETIVO_NEUTRO[info.papel] ?? 'Jogue sozinho e vença do seu jeito.'}</div>
          ) : imp ? (
            <>
              <div style={{color: '#ff3b3b', fontWeight: 900}}>Sabote e mate todo mundo.</div>
              <div style={{color: '#ff8a8a'}}>Tarefas falsas:</div>
              {falsas(p, foco).map((t, i) => <div key={i}>{t}</div>)}
            </>
          ) : (
            <>
              <div style={{fontWeight: 900}}>Tarefas:</div>
              {minhas.map((t: any, i: number) => (
                <div key={i} style={{color: feitas.has(t.nome) ? '#57e04f' : '#fff'}}>{t.nome}</div>
              ))}
            </>
          )}
          {sab && <div style={{color: frame % 30 < 15 ? '#ff3b3b' : '#fff', fontWeight: 900}}>{sab === 'Sismografo' ? 'Estabilizar o sismógrafo!' : sab === 'Luzes' ? 'Consertar as luzes' : 'Comunicações sabotadas'}</div>}
        </div>
      </div>
      {/* papel do jogador seguido (o jogo mostra no começo; aqui fica fixo, pequeno) */}
      <div style={{position: 'absolute', right: 30, top: 26, padding: '8px 18px', borderRadius: 12, background: '#000b', border: `4px solid ${imp ? '#ff3b3b' : palhaco ? '#c08bff' : '#8fd3ff'}`, fontFamily: FONT.display, fontWeight: 900, fontSize: 26, color: imp ? '#ff3b3b' : palhaco ? '#c08bff' : '#8fd3ff'}}>
        {(PAPEL_NOME[info.papel] ?? info.papel).toUpperCase()}
      </div>
      {/* botões (canto de baixo, à direita) */}
      <div style={{position: 'absolute', right: 26, bottom: 22, display: 'flex', gap: 12, alignItems: 'flex-end'}}>
        {imp ? (
          <>
            <Botao rotulo="SABOTAR" icone="sabotar" ativo={!sab} cor="#ff5a5a" />
            <Botao rotulo="DUTO" icone="duto" ativo={false} />
            <Botao rotulo="REPORTAR" icone="reportar" ativo={!!pertoCorpo} />
            <Botao rotulo="MATAR" icone="matar" ativo={!!alvoPerto} cor="#ff5a5a" />
          </>
        ) : (
          <>
            <Botao rotulo="REPORTAR" icone="reportar" ativo={!!pertoCorpo} />
            <Botao rotulo="USAR" icone="usar" ativo={!!q?.tarefa} />
          </>
        )}
      </div>
    </>
  );
};

// o mundo (mapa, corpos, tripulantes, efeitos) visto de um ponto (cx, cy); usado pela câmera do jogador e pelas câmeras de segurança
const PONTOS_DUTO = Object.values(POLUS.salas as Record<string, any>).map((d) => d.duto).filter(Boolean) as {x: number; y: number}[];

export const Mundo5: React.FC<{p: Partida2; s: Sim; f: number; frame: number; cx: number; cy: number; escala: number; w: number; h: number; papeis?: boolean; sabReator?: boolean; nomes?: boolean; skins?: Skins}> = ({p, s, f, frame, cx, cy, escala, w, h, papeis = false, sabReator = false, nomes = true, skins}) => {
  // AU4 (com skins): mapa v5 (salas em polígono), tripulante novo com a skin de cada IA, e quem caiu num canto cortado vai para dentro da sala
  const v5 = true;
  const ajusta = <T extends {x: number; y: number}>(q: T): T => q;
  const pontoDuto = (sala: string) => (POLUS.salas as Record<string, any>)[sala]?.duto ?? null;
  const carregando = s.carregando(f);
  const vivos = CORES.map((c) => ({c, q: s.q(c, f)})).filter((x) => x.q).map((x) => ({c: x.c, q: ajusta(x.q!)})).sort((a, b) => a.q!.y - b.q!.y);
  // fantasmas (AU4): quem morreu continua andando pela nave, translúcido; a posição vem do estado do tique (eles atravessam paredes)
  const tk = s.inicioTique.findIndex((q0, i) => q0 <= f && (s.inicioTique[i + 1] ?? Infinity) > f);
  const est = (p.tiques as any[])[Math.max(0, tk)]?.estado?.jogadores ?? [];
  const fantasmas = v5 ? est.filter((j: any) => !j.vivo && !s.corpos(f).some((c) => c.cor === j.cor)).map((j: any) => ({...j, ponto: ajusta(j.ponto)})) : [];
  return (
      <div style={{position: 'absolute', left: 0, top: 0, width: MUNDO.w, height: MUNDO.h, transformOrigin: '0 0', transform: `translate(${w / 2 - cx * escala}px, ${h / 2 - cy * escala}px) scale(${escala})`}}>
        <ArtePolus />
        {/* poças da Víbora: gosma verde no chão onde um corpo derreteu */}
        {s.pocas(f).map((x) => (
          <div key={'poca' + x.cor} style={{position: 'absolute', left: x.x - 70, top: x.y - 26, width: 140, height: 56, borderRadius: '50%', background: 'radial-gradient(ellipse at 40% 40%, #b8ff8a, #4fd13a 55%, #2a8a1c)', border: '4px solid #10300a', opacity: Math.min(1, (f - x.desde) / 20)}} />
        ))}
        {/* portas trancadas (sabotagem de portas): grade vermelha e cinza na passagem */}
        {s.portas(f).flatMap((sala) => PORTAS[sala] ?? []).map((d, i) => (
          <div key={'p' + i} style={{position: 'absolute', left: d.x, top: d.y - 10, width: 48, height: 58, background: 'repeating-linear-gradient(90deg, #8a94a3 0 10px, #5b6370 10px 14px)', border: '4px solid #10141b', boxShadow: '0 0 18px #ff3b3b'}} />
        ))}
        <DutosFixos pontos={PONTOS_DUTO} />
        <TampasDuto s={s} f={f} ponto={pontoDuto} />
        <DutosTapados s={s} f={f} ponto={pontoDuto} />
        {s.corpos(f).map((c) => (
          <div key={'c' + c.cor} style={{position: 'absolute', left: ajusta(c).x - 40 - (c.arrasto ?? 0) * 140, top: ajusta(c).y - 78, opacity: 1 - (c.arrasto ?? 0) - (c.derrete ?? 0) * 0.9, transform: c.derrete ? `scale(${1 + 0.4 * c.derrete}, ${1 - 0.85 * c.derrete})` : undefined, transformOrigin: '50% 100%', filter: c.derrete ? `hue-rotate(${80 * c.derrete}deg) saturate(${1 + c.derrete})` : undefined}}>
            {v5 ? (
              <Corpo5 c={c} f={f} s={s}
                desenho={() => <Crewmate4 cor={c.cor} size={80} morto roupa={skins?.[c.cor]?.roupa ?? undefined} />}
                vivo={() => <Crewmate4 cor={c.cor} size={76} t={frame} cosmetico={skins?.[c.cor]?.cabeca ?? undefined} roupa={skins?.[c.cor]?.roupa ?? undefined} />} />
            ) : <Crewmate cor={c.cor} size={80} morto />}
          </div>
        ))}
        {fantasmas.map((g: any) => (
          <div key={'g' + g.cor} style={{position: 'absolute', left: g.ponto.x - 38, top: g.ponto.y - 98 - 6 * Math.sin((frame + CORES.indexOf(g.cor) * 9) / 14)}}>
            <Crewmate4 cor={g.cor} size={76} fantasma t={frame} cosmetico={skins?.[g.cor]?.cabeca ?? undefined} />
            {(() => {
              // recado do além (Influencer Fantasma): um envelope sobe do fantasma
              const rec = s.eventos.find((e) => e.tipo === 'recado' && e.cor === g.cor && f >= e.quadro && f < e.quadro + 60);
              if (!rec) return null;
              const k = (f - rec.quadro) / 60;
              return <div style={{position: 'absolute', left: 14, top: -60 - 90 * k, opacity: interpolate(k, [0, 0.1, 0.8, 1], [0, 1, 1, 0]), transform: `rotate(${Math.sin(k * 12) * 10}deg)`}}><Envelope tam={50} /></div>;
            })()}
            {g.fantasma && <div style={{position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: FONT.display, fontWeight: 800, fontSize: 16, color: '#cfe3ff', WebkitTextStroke: '0.6px #000', opacity: 0.85}}>{g.fantasma === 'Anjo' ? 'Anjo' : 'Influencer'}</div>}
          </div>
        ))}
        {vivos.map(({c, q}) => {
          const info = p.jogadores.find((j) => j.cor === c)!;
          const emp = EMPRESA[info.modelo] ?? {nome: info.modelo, cor: '#555'};
          const nome = q!.aparente;
          // o time de agora (o recrutado do Gangster e o morto possuído pelo Possuidor viram impostores no meio da partida)
          const timeAgora = est.find((x: any) => x.cor === c)?.time ?? info.time;
          const vermelho = papeis && timeAgora === 'impostor';
          const roxo = papeis && timeAgora === 'neutro';
          const veneno = s.envenenados(f).includes(c);
          // AU4: entrando/saindo do duto (afunda/pula da tampa) e o Glutão de barriga cheia depois de engolir
          const dt = v5 ? animDuto(s, c, f) : {};
          const comeu = v5 ? s.eventos.find((e) => e.tipo === 'morte' && e.devorado && e.assassino === c && f >= e.quadro + 12 && f < e.quadro + 75) : undefined;
          const barriga = comeu ? 1 + 0.16 * Math.sin(Math.min(1, (f - comeu.quadro - 12) / 12) * Math.PI / 2) * (1 - Math.max(0, (f - comeu.quadro - 50) / 25)) : 1;
          return (
            <div key={c} style={{position: 'absolute', left: q!.x - 38, top: q!.y - 88, opacity: q!.alpha}}>
              <div style={{position: 'absolute', left: 8, top: 82, width: 60, height: 14, borderRadius: '50%', background: '#00000055'}} />
              {veneno && <div style={{position: 'absolute', left: 50, top: -4, width: 22, height: 22, borderRadius: '50% 50% 50% 0', transform: `rotate(-45deg) translateY(${(frame % 30) / 3}px)`, background: '#7dff5a', border: '3px solid #0b3d10', opacity: 0.9}} />}
              {v5 && <MarcasJogador s={s} cor={c} f={f} papeis={papeis} />}
              {carregando[c] && (
                <div style={{position: 'absolute', left: -6, top: -54, transform: 'rotate(-80deg)', transformOrigin: '50% 50%'}}>
                  <Crewmate4 cor={carregando[c]} size={60} morto />
                  <div style={{position: 'absolute', left: 40, top: -18, transform: 'rotate(80deg)'}}><Cruz tam={30} /></div>
                </div>
              )}
              {v5 ? (
                <div style={dt.clip ? {position: 'relative', marginTop: -70, paddingTop: 70, height: 160, overflow: 'hidden'} : undefined}>
                <div style={{transform: `${dt.transform ?? ''} scale(${barriga}, ${1 + (barriga - 1) * 0.4})`, transformOrigin: '50% 100%'}}>
                <Crewmate4 cor={q!.aparente} size={76} passo={q!.andando ? (f + CORES.indexOf(c) * 5) / 8.5 : 0} anim={q!.andando ? 'andando' : q!.tarefa ? 'tarefa' : 'parado'} t={frame + CORES.indexOf(c) * 11} virado={q!.dir < 0}
                  cosmetico={skins?.[q!.aparente]?.cabeca ?? undefined} roupa={skins?.[q!.aparente]?.roupa ?? undefined} pet={skins?.[q!.aparente]?.pet ?? undefined} />
                </div>
                </div>
              ) : (
                <Crewmate cor={q!.aparente} size={76} passo={q!.andando ? (f + CORES.indexOf(c) * 5) / 8.5 : 0} anim={q!.andando ? 'andando' : q!.tarefa ? 'tarefa' : 'parado'} t={frame + CORES.indexOf(c) * 11} virado={q!.dir < 0} />
              )}
              <div style={{position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: FONT.display, fontWeight: 800, fontSize: 19, color: vermelho ? '#ff4040' : roxo ? '#c08bff' : '#fff', WebkitTextStroke: '0.8px #000', textShadow: '0 2px 0 #000, 0 0 3px #000'}}>
                {nomes && nome}
                {nomes && nome === c && <span style={{marginLeft: 5, fontSize: 11, padding: '1px 5px', borderRadius: 5, verticalAlign: 'middle', background: emp.cor, color: '#fff', WebkitTextStroke: '0', textShadow: 'none', border: '1px solid #fff6'}}>{emp.nome}</span>}
              </div>
            </div>
          );
        })}
        {/* efeitos de poder no mundo */}
        {s.eventos.filter((e) => f >= e.quadro && f < e.quadro + 75).map((e, i) => <EfeitoBase5 key={'e' + i} e={e} s={s} f={f} />)}
        {s.eventos.filter((e) => f >= e.quadro && f < e.quadro + 75).map((e, i) => <EfeitoPolus key={'ep' + i} e={e} s={s} f={f} />)}
        {s.eventos.filter((e) => f >= e.quadro && f < e.quadro + DUR_EFEITO5).map((e, i) => <Efeito5 key={'e5' + i} e={e} s={s} f={f} />)}
        {s.eventos.filter((e) => f >= e.quadro && f < e.quadro + 40).map((e, i) => {
          const k = (f - e.quadro) / 40;
          const qq = e.cor ? s.q(e.cor, f) : null;
          if ((e.tipo === 'transformacao' || e.tipo === 'camuflagem') && qq) return <div key={i} style={{position: 'absolute', left: qq.x - 80, top: qq.y - 130, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,${0.9 * (1 - k)}) 0%, rgba(180,120,255,${0.6 * (1 - k)}) 45%, transparent 70%)`}} />;
          if (e.tipo === 'invisivel' && qq) return <div key={i} style={{position: 'absolute', left: qq.x - 70, top: qq.y - 120, width: 140, height: 140, borderRadius: '50%', border: `${6 * (1 - k)}px solid rgba(200,220,255,${1 - k})`, transform: `scale(${0.6 + k})`}} />;
          if (e.tipo === 'escudo') { const v = s.q(e.vitima, f); return v ? <div key={i} style={{position: 'absolute', left: v.x - 70, top: v.y - 120, width: 140, height: 140, borderRadius: '50%', border: '8px solid #6dff8a', boxShadow: '0 0 30px #6dff8a', opacity: 1 - k}} /> : null }
          return null;
        })}
      </div>
  );
};

// efeitos sonoros dos eventos da partida dentro do trecho [de, de+dur): o que acontece perto da câmera (ou com o foco)
const SOM_EVENTO: Record<string, string> = {morte: 'faca', xerife: 'tiro', duto: 'duto', escudo: 'escudo', invisivel: 'sumir', transformacao: 'transformar', limpeza: 'passos', morte_veneno: 'faca', veneno: 'sumir', recrutamento: 'transformar', foto: 'sfx/camera-shutter.mp3', alerta_barulhento: 'emergencia', conserto: 'tarefa',
  // AU4
  bomba: 'sfx/explosion.mp3', incendio: 'sfx_au4/fogo.mp3', casal_morre: 'sfx_au4/coracao.mp3', canibal_come: 'sfx_au4/crunch.mp3', gasolina: 'sfx_au4/splash.mp3', bomba_plantada: 'sfx_au4/bip.mp3', possessao_corpo: 'transformar',
  // AU5
  camuflagem: 'transformar', possessao_vivo: 'transformar', derreteu: 'sfx_au4/splash.mp3', revive: 'escudo', chato: 'sfx_au4/bip.mp3', doutor_carrega: 'passos'};
export const SonsJogo5: React.FC<{s: Sim; de: number; dur: number; foco: string; mapa?: Mapa}> = React.memo(({s, de, dur, foco, mapa}) => {
  const lista: {em: number; nome: string; vol: number}[] = [];
  for (const e of s.eventos) {
    const em = mapa ? quandoNaCena(mapa, e.quadro) : e.quadro - de;
    if (em < 0 || em >= dur) continue;
    const cam = s.q(foco, e.quadro) ?? s.corpos(e.quadro).find((c) => c.cor === foco);
    const perto = !cam || e.x === undefined || Math.hypot(e.x - cam.x, e.y - cam.y) < 900;
    const meu = e.cor === foco || e.vitima === foco || e.assassino === foco || e.portador === foco || (e.mortos ?? []).includes(foco);
    let nome = SOM_EVENTO[e.tipo];
    if (e.tipo === 'morte' && e.devorado) nome = 'sfx_au4/nhac.mp3';
    if (e.tipo === 'tarefa') nome = e.cor === foco ? 'tarefa' : '';
    if (e.tipo === 'sabotagem') nome = e.subtipo === 'Sismografo' ? 'reator' : 'luzes';
    if (!nome || (!perto && !meu && !['sabotagem', 'alerta_barulhento'].includes(e.tipo))) continue;
    lista.push({em, nome, vol: e.tipo === 'limpeza' ? 0.4 : 0.8});
  }
  return <>{lista.map((x, i) => <Som key={i} nome={x.nome} em={x.em} vol={x.vol} />)}</>;
});

export const Jogo5: React.FC<Props> = ({p, de, mapa, foco, papeis = false, hud = true, sons = true, chat = false, skins, tiqueHud = true, parado = false, semSala = false}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const s = simular(p);
  // quadro da partida mostrado agora (com âncoras: estica, encolhe ou corta para bater com a narração)
  const f = parado ? de : mapa ? Math.floor(mapa.quadros[Math.min(frame, mapa.quadros.length - 1)]) : de + frame;
  // câmera: segue o foco com um leve atraso (média dos últimos quadros), como a câmera do jogo
  let cx = 0, cy = 0, n = 0;
  for (let d = 0; d < 8; d++) {
    const q = s.q(foco, f - d);
    // duto (salto de posição): a câmera vai junto, sem passar pelo meio do caminho
    if (q && n && Math.hypot(q.x - cx / n, q.y - cy / n) > 300) break;
    if (q) { cx += q.x; cy += q.y; n++ }
  }
  if (!n) {
    const c = s.corpos(f).find((c) => c.cor === foco);
    cx = c?.x ?? MUNDO.w / 2; cy = c?.y ?? MUNDO.h / 2; n = 1;
  }
  cx /= n; cy /= n;
  const sab = s.sabotagem(f);
  const infoFoco = p.jogadores.find((j) => j.cor === foco);
  const luzes = sab === 'Luzes' && infoFoco?.time === 'tripulante';
  const raio = luzes ? 260 : 620;
  const salaAtual = salaEm({x: cx, y: cy});
  const sabReator = sab === 'Sismografo';
  // flash vermelho de morte perto da câmera
  const morteRecente = s.eventos.find((e) => (e.tipo === 'morte' || e.tipo === 'xerife' || e.tipo === 'morte_veneno' || e.tipo === 'casal_morre') && f >= e.quadro && f < e.quadro + 12 && Math.hypot(e.x - cx, e.y - cy) < 700);
  // explosão perto: a tela treme e fica branca por um instante
  const bum = s.eventos.find((e) => (e.tipo === 'bomba' || e.tipo === 'incendio') && f >= e.quadro && f < e.quadro + 24 && Math.hypot(e.x - cx, e.y - cy) < 1100);
  if (bum) { const a = (1 - (f - bum.quadro) / 24) * 22; cx += a * Math.sin(f * 2.1); cy += a * Math.cos(f * 2.7) }
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Mundo5 p={p} s={s} f={f} frame={frame} cx={cx} cy={cy} escala={ESCALA} w={1920} h={1080} papeis={papeis} sabReator={sabReator} skins={skins} />
      {/* visão: escuro fora do círculo (bem menor com as luzes sabotadas) */}
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, transparent ${raio * 0.72}px, rgba(0,0,0,${luzes ? 0.97 : 0.62}) ${raio}px)`}} />
      {sabReator && <AbsoluteFill style={{background: '#ff0000', opacity: 0.12 + 0.1 * Math.sin(frame / 4)}} />}
      {bum && <AbsoluteFill style={{background: bum.tipo === 'bomba' ? '#fff3c4' : '#ff8a1f', opacity: interpolate(f - bum.quadro, [0, 2, 14], [0, 0.75, 0], {extrapolateRight: 'clamp'})}} />}
      {morteRecente && <AbsoluteFill style={{background: '#ff1e1e', opacity: interpolate(f - morteRecente.quadro, [0, 3, 12], [0, 0.45, 0])}} />}
      {/* nome da sala (o jogo mostra ao entrar) */}
      {/* contador de tique (o espectador sempre sabe em que momento da partida está) */}
      {tiqueHud && <div style={{position: 'absolute', left: 0, right: 0, top: 22, display: 'flex', justifyContent: 'center'}}><div style={{padding: '6px 26px', borderRadius: 12, background: '#000c', border: '4px solid #fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 38, letterSpacing: 3, color: '#fff'}}>TIQUE {s.tique(f)}</div></div>}
      {salaAtual && !semSala && <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 30, letterSpacing: 4, color: '#ffffffcc', WebkitTextStroke: '1.5px #000'}}>{POLUS.salas[salaAtual].nome.toUpperCase()}</div>}
      {hud && infoFoco && <Hud p={p} s={s} f={f} foco={foco} frame={frame} />}
      {sab === 'Sismografo' && <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 44, color: frame % 30 < 15 ? '#ff3b3b' : '#fff', WebkitTextStroke: '2px #000'}}>SISMÓGRAFO INSTÁVEL: O CHÃO VAI RACHAR</div>}
      <AlertaBarulhento s={s} f={f} />
      {chat && <ChatImpostores5 p={p} s={s} f={f} />}
      {/* o foco está num console de vigilância: a tela dele abre por cima, como no jogo */}
      {sons && <SonsJogo5 s={s} de={de} dur={durationInFrames} foco={foco} mapa={mapa} />}
      {mapa && <Cortes s={s} cortes={mapa.cortes} quadros={mapa.quadros} frame={frame} />}
      {mapa && <SeloVelocidade v={velocidade(mapa, frame)} />}
      {/* paleta de cores para checagem em teste */}
      <div style={{display: 'none'}}>{Object.keys(COR).join()}</div>
    </AbsoluteFill>
  );
};

// corte de tempo na cena (salto de tiques ou reunião no meio): escurece rápido e mostra para onde pulou
const Cortes: React.FC<{s: Sim; cortes: Corte[]; quadros: number[]; frame: number}> = ({s, cortes, quadros, frame}) => {
  const c = cortes.find((c) => frame >= c.k - 6 && frame < c.k + 22);
  if (!c) return null;
  const d = frame - c.k;
  const tq = s.tique(quadros[Math.min(quadros.length - 1, c.k)]);
  const txt = c.tipo === 'reuniao' ? 'DEPOIS DA REUNIÃO' : `TIQUE ${tq}`;
  return (
    <>
      <AbsoluteFill style={{background: '#000', opacity: interpolate(d, [-6, 0, 3, 10], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', opacity: interpolate(d, [-3, 1, 16, 22], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        <span style={{padding: '8px 26px', borderRadius: 14, background: '#000c', border: '4px solid #fff', fontFamily: FONT.display, fontWeight: 900, fontSize: 40, letterSpacing: 3, color: '#fff'}}>{txt}</span>
      </div>
    </>
  );
};

// selo de velocidade: a partida acelerada ou em câmera lenta (para bater com a narração) fica avisada na tela
const SeloVelocidade: React.FC<{v: number}> = ({v}) => {
  const txt = v > 1.3 ? `${v >= 1.75 ? Math.round(v) : v.toFixed(1).replace('.', ',')}x MAIS RÁPIDO` : v < 0.7 && v > 0.05 ? 'CÂMERA LENTA' : '';
  if (!txt) return null;
  return <div style={{position: 'absolute', right: 30, top: 86, padding: '6px 16px', borderRadius: 10, background: '#000a', fontFamily: FONT.display, fontWeight: 900, fontSize: 26, letterSpacing: 2, color: '#fff'}}>{txt}</div>;
};

// alerta do Barulhento: quando ele morre, a nave inteira fica sabendo (faixa piscando no topo)
const AlertaBarulhento: React.FC<{s: Sim; f: number}> = ({s, f}) => {
  const e = s.eventos.find((x) => x.tipo === 'alerta_barulhento' && f >= x.quadro && f < x.quadro + 150);
  if (!e) return null;
  const k = f - e.quadro;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 210, display: 'flex', justifyContent: 'center', opacity: interpolate(k, [0, 6, 135, 150], [0, 1, 1, 0])}}>
      <div style={{padding: '10px 30px', borderRadius: 14, background: k % 12 < 6 ? '#ffd21f' : '#ff3b3b', border: '5px solid #000', fontFamily: FONT.display, fontWeight: 900, fontSize: 38, color: '#000'}}><span style={{display: "inline-flex", alignItems: "center", gap: 12}}><Sino tam={40} />O BARULHENTO ({e.vitima.toUpperCase()}) MORREU</span></div>
    </div>
  );
};

// chat secreto dos impostores: as últimas mensagens num celular vermelho no canto (só o espectador vê)
export const ChatImpostores5: React.FC<{p: Partida2; s: Sim; f: number}> = ({p, s, f}) => {
  const msgs = s.eventos.filter((e) => e.tipo === 'chat' && e.quadro <= f && f - e.quadro < 30 * 14).slice(-3);
  if (!msgs.length) return null;
  return (
    <div style={{position: 'absolute', left: 26, bottom: 26, width: 560, padding: 14, borderRadius: 18, background: 'rgba(40,0,0,.86)', border: '4px solid #ff3b3b', boxShadow: '0 0 24px #ff3b3b66'}}>
      <div style={{fontFamily: FONT.display, fontWeight: 900, fontSize: 22, color: '#ff6b6b', letterSpacing: 2, marginBottom: 6}}><span style={{display: "inline-flex", alignItems: "center", gap: 8}}>CHAT DOS IMPOSTORES <Cadeado tam={30} /></span></div>
      {msgs.map((m, i) => {
        const k = f - m.quadro;
        const info = p.jogadores.find((j) => j.cor === m.cor);
        return (
          <div key={i} style={{display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 6, opacity: interpolate(k, [0, 8], [0, 1], {extrapolateRight: 'clamp'}), transform: `translateY(${interpolate(k, [0, 8], [12, 0], {extrapolateRight: 'clamp'})}px)`}}>
            <div style={{flex: 'none', width: 40, height: 44}}><Crewmate cor={m.cor} size={40} /></div>
            <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: 22, lineHeight: 1.25, color: '#fff'}}>
              <span style={{color: COR[m.cor]?.body ?? '#fff', fontWeight: 900, WebkitTextStroke: '0.6px #000'}}>{m.cor}</span>
              <span style={{fontSize: 15, color: '#ffb3b3'}}> ({EMPRESA[info?.modelo ?? '']?.nome ?? info?.modelo})</span>: {m.texto}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// efeitos novos do AU5 (no mundo): Chato desativando, Doutor revivendo, corpo derretendo e o Possuidor tomando um vivo
const EfeitoPolus: React.FC<{e: any; s: Sim; f: number}> = ({e, s, f}) => {
  const k = (f - e.quadro) / 75;
  const op = interpolate(k, [0, 0.08, 0.8, 1], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rot = (txt: React.ReactNode, cor: string) => <div style={{position: 'absolute', left: '50%', top: -190 - 30 * Math.min(1, k * 3), transform: `translateX(-50%) rotate(-5deg) scale(${interpolate(k, [0, 0.08, 0.16], [0.3, 1.2, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`, whiteSpace: 'nowrap', fontFamily: FONT.display, fontWeight: 900, fontSize: 36, color: cor, WebkitTextStroke: '2px #000', textShadow: '0 4px 0 #000'}}>{txt}</div>;
  if (e.tipo === 'chato') {
    const v = s.q(e.alvo, f);
    if (!v) return null;
    return <div style={{position: 'absolute', left: v.x, top: v.y, opacity: op}}>
      <div style={{position: 'absolute', left: -45, top: -175, transform: `scale(${interpolate(k, [0, 0.1], [0.2, 1], {extrapolateRight: 'clamp'})}) rotate(${Math.sin(f / 3) * 6}deg)`}}><Desativado tam={90} /></div>
      {rot('FUNÇÃO DESATIVADA', '#ff5a5a')}
    </div>;
  }
  if (e.tipo === 'revive' && e.x !== undefined) {
    return <div style={{position: 'absolute', left: e.x, top: e.y - 40, opacity: op}}>
      <div style={{position: 'absolute', left: -160, top: -160, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(140,255,170,.85), transparent 65%)', transform: `scale(${0.4 + k})`}} />
      <div style={{position: 'absolute', left: -40, top: -150}}><Cruz tam={80} /></div>
      {rot('REVIVIDO!', '#7dff9a')}
    </div>;
  }
  if (e.tipo === 'derreteu' && e.x !== undefined) {
    return <div style={{position: 'absolute', left: e.x, top: e.y, opacity: op}}>
      <div style={{position: 'absolute', left: -30, top: -120}}><Gosma tam={60} /></div>
      {rot('DERRETEU!', '#7dff5a')}
    </div>;
  }
  if (e.tipo === 'possessao_vivo' && e.x !== undefined) {
    return <div style={{position: 'absolute', left: e.x, top: e.y - 40, opacity: op}}>
      <div style={{position: 'absolute', left: -150, top: -150, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(178,107,255,.8), transparent 65%)', transform: `scale(${0.3 + k})`}} />
    </div>;
  }
  if (e.tipo === 'doutor_carrega' && e.x !== undefined) {
    return <div style={{position: 'absolute', left: e.x, top: e.y, opacity: op}}>{rot('CARREGANDO O CORPO', '#ffffff')}</div>;
  }
  return null;
};
