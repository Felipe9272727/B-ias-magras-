// Among Us 2: a gameplay como numa gravação de tela do jogo. A câmera segue um jogador de perto, com o círculo de
// visão, a barra de tarefas e a lista no canto, e os botões do canto de baixo (USAR/REPORTAR ou MATAR/SABOTAR/DUTO).
// Posições vêm da simulação em tempo real (sim.ts): cada quadro da cena é um quadro da partida, ninguém teleporta.
// Desenho todo próprio (nada do jogo original).
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Crewmate, COR} from '../amongus/Crewmate';
import {Arte} from '../amongus/nave/Arte';
import {NAVE, salaEm} from '../amongus/nave/mapa';
import type {Sala} from '../amongus/nave/spec';
import {FONT} from '../theme';
import {CORES, Partida2, Sim, simular} from './sim';

const MUNDO = {w: NAVE.cols * 48, h: NAVE.rows * 48};
const ESCALA = 1.75; // tripulante com ~130 px de altura na tela, como no jogo
export const EMPRESA: Record<string, {nome: string; cor: string}> = {
  'DeepSeek Flash': {nome: 'DeepSeek', cor: '#2f6bff'},
  'Claude Haiku': {nome: 'Claude', cor: '#d97a47'},
  'GPT-5.6 Luna': {nome: 'GPT', cor: '#10a37f'},
  'Gemini 3.8 Flash': {nome: 'Gemini', cor: '#8e5cf7'},
  'Grok 4.3': {nome: 'Grok', cor: '#111111'},
};
const PAPEL_NOME: Record<string, string> = {Medico: 'Médico'};

type Props = {p: Partida2; de: number; foco: string; papeis?: boolean; hud?: boolean; morte?: boolean};

// botão redondo do canto (desenho próprio no espírito do jogo)
const Botao: React.FC<{rotulo: string; icone: string; ativo: boolean; numero?: number; cor?: string}> = ({rotulo, icone, ativo, numero, cor = '#fff'}) => (
  <div style={{width: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: ativo ? 1 : 0.38}}>
    <div style={{position: 'relative', width: 128, height: 128, borderRadius: 26, background: 'radial-gradient(circle at 35% 30%, #5b6170, #262a33)', border: '6px solid #0b0c10', display: 'grid', placeItems: 'center', boxShadow: '0 6px 0 #000a'}}>
      <span style={{fontSize: 74, filter: 'drop-shadow(0 3px 0 #000)'}}>{icone}</span>
      {numero !== undefined && numero > 0 && (
        <span style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 70, color: '#fff', WebkitTextStroke: '3px #000'}}>{numero}</span>
      )}
    </div>
    <div style={{marginTop: 4, fontFamily: FONT.display, fontWeight: 900, fontSize: 30, letterSpacing: 2, color: cor, WebkitTextStroke: '2px #000', textShadow: '0 3px 0 #000'}}>{rotulo}</div>
  </div>
);

const Hud: React.FC<{p: Partida2; s: Sim; f: number; foco: string; frame: number}> = ({p, s, f, foco, frame}) => {
  const info = p.jogadores.find((j) => j.cor === foco)!;
  const imp = info.time === 'impostor';
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
          {imp ? (
            <>
              <div style={{color: '#ff3b3b', fontWeight: 900}}>Sabote e mate todo mundo.</div>
              <div style={{color: '#ff8a8a'}}>Tarefas falsas:</div>
              {minhas.length ? minhas.map((t: any, i: number) => <div key={i}>{t.nome}</div>) : <div style={{opacity: 0.8}}>Elétrica: Consertar a fiação</div>}
            </>
          ) : (
            <>
              <div style={{fontWeight: 900}}>Tarefas:</div>
              {minhas.map((t: any, i: number) => (
                <div key={i} style={{color: feitas.has(t.nome) ? '#57e04f' : '#fff'}}>{t.nome}</div>
              ))}
            </>
          )}
          {sab && <div style={{color: frame % 30 < 15 ? '#ff3b3b' : '#fff', fontWeight: 900}}>⚠ {sab === 'Reator' ? 'Colapso do reator!' : sab === 'Luzes' ? 'Consertar as luzes' : 'Comunicações sabotadas'}</div>}
        </div>
      </div>
      {/* papel do jogador seguido (o jogo mostra no começo; aqui fica fixo, pequeno) */}
      <div style={{position: 'absolute', right: 30, top: 26, padding: '8px 18px', borderRadius: 12, background: '#000b', border: `4px solid ${imp ? '#ff3b3b' : '#8fd3ff'}`, fontFamily: FONT.display, fontWeight: 900, fontSize: 26, color: imp ? '#ff3b3b' : '#8fd3ff'}}>
        {(PAPEL_NOME[info.papel] ?? info.papel).toUpperCase()}
      </div>
      {/* botões (canto de baixo, à direita) */}
      <div style={{position: 'absolute', right: 26, bottom: 22, display: 'flex', gap: 12, alignItems: 'flex-end'}}>
        {imp ? (
          <>
            <Botao rotulo="SABOTAR" icone="⚡" ativo={!sab} cor="#ff5a5a" />
            <Botao rotulo="DUTO" icone="🕳️" ativo={false} />
            <Botao rotulo="REPORTAR" icone="📣" ativo={!!pertoCorpo} />
            <Botao rotulo="MATAR" icone="🔪" ativo={!!alvoPerto} cor="#ff5a5a" />
          </>
        ) : (
          <>
            <Botao rotulo="REPORTAR" icone="📣" ativo={!!pertoCorpo} />
            <Botao rotulo="USAR" icone="✋" ativo={!!q?.tarefa} />
          </>
        )}
      </div>
    </>
  );
};

export const Jogo: React.FC<Props> = ({p, de, foco, papeis = false, hud = true}) => {
  const frame = useCurrentFrame();
  const s = simular(p);
  const f = de + frame;
  // câmera: segue o foco com um leve atraso (média dos últimos quadros), como a câmera do jogo
  let cx = 0, cy = 0, n = 0;
  for (let d = 0; d < 8; d++) {
    const q = s.q(foco, f - d);
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
  const vivos = CORES.map((c) => ({c, q: s.q(c, f)})).filter((x) => x.q).sort((a, b) => a.q!.y - b.q!.y);
  const salaAtual = salaEm({x: cx, y: cy});
  const sabReator = sab === 'Reator';
  // flash vermelho de morte perto da câmera
  const morteRecente = s.eventos.find((e) => (e.tipo === 'morte' || e.tipo === 'xerife') && f >= e.quadro && f < e.quadro + 12 && Math.hypot(e.x - cx, e.y - cy) < 700);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: MUNDO.w, height: MUNDO.h, transformOrigin: '0 0', transform: `translate(${960 - cx * ESCALA}px, ${540 - cy * ESCALA}px) scale(${ESCALA})`}}>
        <Arte alertaReator={sabReator ? 0.12 + 0.1 * Math.sin(frame / 4) : 0} />
        {s.corpos(f).map((c) => (
          <div key={'c' + c.cor} style={{position: 'absolute', left: c.x - 40 - (c.arrasto ?? 0) * 140, top: c.y - 78, opacity: 1 - (c.arrasto ?? 0)}}>
            <Crewmate cor={c.cor} size={80} morto />
          </div>
        ))}
        {vivos.map(({c, q}) => {
          const info = p.jogadores.find((j) => j.cor === c)!;
          const emp = EMPRESA[info.modelo] ?? {nome: info.modelo, cor: '#555'};
          const nome = q!.aparente;
          const vermelho = papeis && info.time === 'impostor';
          return (
            <div key={c} style={{position: 'absolute', left: q!.x - 38, top: q!.y - 88, opacity: q!.alpha}}>
              <div style={{position: 'absolute', left: 8, top: 82, width: 60, height: 14, borderRadius: '50%', background: '#00000055'}} />
              <Crewmate cor={q!.aparente} size={76} passo={q!.andando ? (frame + CORES.indexOf(c) * 5) / 8.5 : 0} anim={q!.andando ? 'andando' : q!.tarefa ? 'tarefa' : 'parado'} t={frame + CORES.indexOf(c) * 11} virado={q!.dir < 0} />
              <div style={{position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: FONT.display, fontWeight: 800, fontSize: 19, color: vermelho ? '#ff4040' : '#fff', WebkitTextStroke: '0.8px #000', textShadow: '0 2px 0 #000, 0 0 3px #000'}}>
                {nome}
                {nome === c && <span style={{marginLeft: 5, fontSize: 11, padding: '1px 5px', borderRadius: 5, verticalAlign: 'middle', background: emp.cor, color: '#fff', WebkitTextStroke: '0', textShadow: 'none', border: '1px solid #fff6'}}>{emp.nome}</span>}
              </div>
            </div>
          );
        })}
        {/* efeitos de poder no mundo */}
        {s.eventos.filter((e) => f >= e.quadro && f < e.quadro + 40).map((e, i) => {
          const k = (f - e.quadro) / 40;
          const qq = e.cor ? s.q(e.cor, f) : null;
          if (e.tipo === 'transformacao' && qq) return <div key={i} style={{position: 'absolute', left: qq.x - 80, top: qq.y - 130, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,255,255,${0.9 * (1 - k)}) 0%, rgba(180,120,255,${0.6 * (1 - k)}) 45%, transparent 70%)`}} />;
          if (e.tipo === 'invisivel' && qq) return <div key={i} style={{position: 'absolute', left: qq.x - 70, top: qq.y - 120, width: 140, height: 140, borderRadius: '50%', border: `${6 * (1 - k)}px solid rgba(200,220,255,${1 - k})`, transform: `scale(${0.6 + k})`}} />;
          if (e.tipo === 'escudo') { const v = s.q(e.vitima, f); return v ? <div key={i} style={{position: 'absolute', left: v.x - 70, top: v.y - 120, width: 140, height: 140, borderRadius: '50%', border: '8px solid #6dff8a', boxShadow: '0 0 30px #6dff8a', opacity: 1 - k}} /> : null }
          return null;
        })}
      </div>
      {/* visão: escuro fora do círculo (bem menor com as luzes sabotadas) */}
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, transparent ${raio * 0.72}px, rgba(0,0,0,${luzes ? 0.97 : 0.62}) ${raio}px)`}} />
      {sabReator && <AbsoluteFill style={{background: '#ff0000', opacity: 0.12 + 0.1 * Math.sin(frame / 4)}} />}
      {morteRecente && <AbsoluteFill style={{background: '#ff1e1e', opacity: interpolate(f - morteRecente.quadro, [0, 3, 12], [0, 0.45, 0])}} />}
      {/* nome da sala (o jogo mostra ao entrar) */}
      {salaAtual && <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', fontFamily: FONT.display, fontWeight: 900, fontSize: 30, letterSpacing: 4, color: '#ffffffcc', WebkitTextStroke: '1.5px #000'}}>{NAVE.salas[salaAtual as Sala].nome.toUpperCase()}</div>}
      {hud && infoFoco && <Hud p={p} s={s} f={f} foco={foco} frame={frame} />}
      {/* paleta de cores para checagem em teste */}
      <div style={{display: 'none'}}>{Object.keys(COR).join()}</div>
    </AbsoluteFill>
  );
};
