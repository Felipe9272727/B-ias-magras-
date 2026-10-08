import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Crewmate, COR} from './Crewmate';
import {corposNoTique, ORDEM, papelDe, Partida, salasNoTique, siglaModelo} from './dados';
import {FONT} from '../theme';

// Corredores (mesma lista de amongus/mapa.mjs)
const CORREDORES: [string, string][] = [
  ['Refeitorio', 'Armas'], ['Refeitorio', 'MotorSuperior'], ['Refeitorio', 'Enfermaria'], ['Refeitorio', 'Admin'], ['Refeitorio', 'Deposito'],
  ['Armas', 'O2'], ['Armas', 'Navegacao'], ['O2', 'Navegacao'], ['O2', 'Escudos'], ['Navegacao', 'Escudos'], ['Escudos', 'Comunicacoes'],
  ['Escudos', 'Deposito'], ['Comunicacoes', 'Deposito'], ['Deposito', 'Admin'], ['Deposito', 'Eletrica'], ['Deposito', 'MotorInferior'],
  ['MotorInferior', 'Seguranca'], ['MotorInferior', 'Reator'], ['MotorInferior', 'MotorSuperior'], ['Seguranca', 'Reator'],
  ['Seguranca', 'MotorSuperior'], ['Reator', 'MotorSuperior'], ['MotorSuperior', 'Enfermaria'],
];

export const MAPA = {rw: 230, rh: 124};
// posições em pixels (layout próprio, espaçado para caber todo mundo na tela)
const LAYOUT: Record<string, {x: number; y: number}> = {
  Refeitorio: {x: 960, y: 200}, Armas: {x: 1340, y: 200}, O2: {x: 1320, y: 440}, Navegacao: {x: 1700, y: 470},
  Escudos: {x: 1440, y: 780}, Comunicacoes: {x: 1140, y: 930}, Deposito: {x: 900, y: 730}, Admin: {x: 1040, y: 480},
  Eletrica: {x: 600, y: 790}, MotorInferior: {x: 300, y: 820}, Seguranca: {x: 430, y: 520}, Reator: {x: 140, y: 520},
  MotorSuperior: {x: 300, y: 210}, Enfermaria: {x: 650, y: 360},
};
export const pt = (sala: string) => LAYOUT[sala];

// posição de um jogador dentro da sala (grade 4x2 para não sobrepor)
const slot = (cor: string) => {
  const i = ORDEM.indexOf(cor);
  return {dx: ((i % 4) - 1.5) * 50, dy: Math.floor(i / 4) * 44 - 4};
};

const Estrelas: React.FC = () => {
  const f = useCurrentFrame();
  const stars = React.useMemo(() => Array.from({length: 140}, (_, i) => ({x: (i * 7919) % 1920, y: (i * 104729) % 1080, r: 1 + (i % 3), v: 0.2 + (i % 5) * 0.15})), []);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      {stars.map((s, i) => (
        <circle key={i} cx={(s.x - f * s.v + 1920 * 10) % 1920} cy={s.y} r={s.r} fill="#fff" opacity={0.25 + (i % 4) * 0.15} />
      ))}
    </svg>
  );
};

export const MapaNave: React.FC<{p: Partida; destaque?: string[]; escuro?: number; alertaReator?: number}> = ({p, destaque = [], escuro = 0, alertaReator = 0}) => {
  const S = p.salas;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #12182b 0%, #05060c 75%)'}}>
      <Estrelas />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {/* casco da nave */}
        <rect x={20} y={110} width={1880} height={950} rx={120} fill="#2a3040" stroke="#0b0d14" strokeWidth={14} />
        {CORREDORES.map(([a, b], i) => {
          const A = pt(a);
          const B = pt(b);
          return (
            <g key={i}>
              <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#0b0d14" strokeWidth={46} strokeLinecap="round" />
              <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#575f74" strokeWidth={34} strokeLinecap="round" />
            </g>
          );
        })}
        {Object.entries(S).map(([k, s]) => {
          const P = pt(k);
          const on = destaque.includes(k);
          return (
            <g key={k}>
              <rect x={P.x - MAPA.rw / 2} y={P.y - MAPA.rh / 2} width={MAPA.rw} height={MAPA.rh} rx={18} fill={on ? '#8a8f6a' : '#6d7489'} stroke={on ? '#f5f557' : '#0b0d14'} strokeWidth={on ? 8 : 7} />
              <rect x={P.x - MAPA.rw / 2 + 8} y={P.y - MAPA.rh / 2 + 8} width={MAPA.rw - 16} height={MAPA.rh - 16} rx={12} fill="none" stroke="#ffffff" strokeOpacity={0.08} strokeWidth={3} />
              <text x={P.x} y={P.y - MAPA.rh / 2 + 28} textAnchor="middle" fontFamily={FONT.display} fontWeight={800} fontSize={21} fill="#e9edf7" opacity={0.85}>
                {s.nome}
              </text>
            </g>
          );
        })}
      </svg>
      {escuro > 0 && <AbsoluteFill style={{background: '#000', opacity: escuro * 0.62}} />}
      {alertaReator > 0 && <AbsoluteFill style={{background: '#ff0000', opacity: alertaReator}} />}
    </AbsoluteFill>
  );
};

type ReplayProps = {
  p: Partida;
  deTique: number;
  ateTique: number;
  framesPorTique?: number;
  pensamentos?: string[]; // cores cujos pensamentos aparecem em balões
  mostrarPapeis?: boolean; // revela impostores (nome em vermelho)
  destaque?: string[];
};

export const Replay: React.FC<ReplayProps> = ({p, deTique, ateTique, framesPorTique = 30, pensamentos = [], mostrarPapeis = true, destaque}) => {
  const frame = useCurrentFrame();
  const total = ateTique - deTique;
  const tf = Math.min(total, frame / framesPorTique);
  const t0 = deTique + Math.floor(tf);
  const t1 = Math.min(ateTique, t0 + 1);
  const frac = tf - Math.floor(tf);
  const prog = Easing.inOut(Easing.cubic)(Math.min(1, frac * 1.25));

  const reuniaoEm = (t: number) => p.reunioes.find((r) => r.tique === t);
  const ini = salasNoTique(p, t0);
  if (reuniaoEm(t0)) for (const c of ORDEM) if (ini[c]) ini[c] = {...ini[c]!, sala: 'Refeitorio'};
  const fim = salasNoTique(p, t1);
  const corpos = corposNoTique(p, prog > 0.5 ? t1 : t0);
  const tq = p.tiques[t1];
  const est = tq?.estado ?? p.tiques[t0]?.estado;
  const sab = est?.sabotagem ?? null;
  const tarefas = est ? est.tarefas / est.totalTarefas : 0;
  const mortesAgora = p.eventos.filter((e) => e.tipo === 'morte' && e.tique === t1);
  const flash = mortesAgora.length ? interpolate(frac, [0.45, 0.55, 0.9], [0, 0.55, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const dutos = p.eventos.filter((e) => e.tipo === 'duto' && e.tique === t1);

  return (
    <AbsoluteFill>
      <MapaNave
        p={p}
        destaque={destaque}
        escuro={sab?.tipo === 'Luzes' ? 1 : 0}
        alertaReator={sab?.tipo === 'Reator' ? 0.12 + 0.12 * Math.sin(frame / 4) : 0}
      />
      {/* corpos */}
      {corpos.map((c) => {
        const P = pt(c.sala);
        const s = slot(c.cor);
        return (
          <div key={'c' + c.cor} style={{position: 'absolute', left: P.x + s.dx - 30, top: P.y + s.dy - 26}}>
            <Crewmate cor={c.cor} size={60} morto />
          </div>
        );
      })}
      {/* jogadores */}
      {ORDEM.map((cor) => {
        const a = ini[cor];
        const b = fim[cor] ?? a;
        if (!a || !b) return null;
        const morreAgora = !fim[cor];
        if (morreAgora && prog > 0.5) return null;
        const A = pt(a.sala);
        const B = pt(b.sala);
        const s = slot(cor);
        const ventou = dutos.find((d) => d.cor === cor);
        const x = ventou ? (prog < 0.5 ? A.x : B.x) : A.x + (B.x - A.x) * prog;
        const y = ventou ? (prog < 0.5 ? A.y : B.y) : A.y + (B.y - A.y) * prog;
        const opac = ventou ? Math.abs(prog - 0.5) * 2 : 1;
        const andando = a.sala !== b.sala && !ventou && prog > 0 && prog < 1;
        const aparente = b.aparente ?? cor;
        const info = papelDe(p, cor);
        const imp = mostrarPapeis && info.time === 'impostor';
        const lotado = ORDEM.filter((c) => (prog < 0.5 ? ini[c]?.sala === a.sala : fim[c]?.sala === b.sala)).length > 1;
        return (
          <div key={cor} style={{position: 'absolute', left: x + s.dx - 26, top: y + s.dy - 40, opacity: opac}}>
            <Crewmate cor={aparente} size={52} passo={andando ? frame / 10 : 0} virado={B.x < A.x} />
            {!lotado && <div
              style={{
                position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap',
                fontFamily: FONT.display, fontWeight: 800, fontSize: 15, color: imp ? '#ff4d4d' : '#fff',
                textShadow: '0 0 4px #000, 0 0 4px #000',
              }}
            >
              {aparente !== cor ? `${aparente}*` : cor}
              <span style={{fontSize: 11, marginLeft: 4, padding: '1px 5px', borderRadius: 6, background: siglaModelo(info.modelo) === 'DeepSeek' ? '#2f6bff' : '#d97a47', color: '#fff'}}>
                {siglaModelo(info.modelo)}
              </span>
            </div>}
          </div>
        );
      })}
      <AbsoluteFill style={{background: '#ff1e1e', opacity: flash, pointerEvents: 'none'}} />
      {/* pensamentos secretos */}
      <div style={{position: 'absolute', left: 40, right: 40, bottom: 34, display: 'flex', gap: 18, justifyContent: 'center'}}>
        {pensamentos.map((cor) => {
          const pens = tq?.decisoes.find((d) => d.cor === cor)?.pensamento;
          if (!pens) return null;
          const info = papelDe(p, cor);
          return (
            <div
              key={cor}
              style={{
                flex: '0 1 860px', display: 'flex', gap: 14, alignItems: 'center', padding: '12px 18px', borderRadius: 20, background: '#fffdf2',
                border: `5px solid ${mostrarPapeis && info.time === 'impostor' ? '#d10000' : '#000'}`, boxShadow: '0 8px 0 rgba(0,0,0,.4)',
                opacity: interpolate(frac, [0, 0.12, 0.88, 1], [0, 1, 1, 0.85]),
              }}
            >
              <Crewmate cor={cor} size={58} />
              <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 24, lineHeight: 1.25, color: '#111'}}>
                <b style={{color: COR[cor].shade}}>{cor} pensa:</b> {pens}
              </div>
            </div>
          );
        })}
      </div>
      {/* HUD: barra de tarefas */}
      <div style={{position: 'absolute', left: 36, top: 28, width: 520}}>
        <div style={{height: 34, background: '#1b1f2a', border: '5px solid #000', borderRadius: 4, overflow: 'hidden'}}>
          <div style={{width: `${tarefas * 100}%`, height: '100%', background: '#43d43b'}} />
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 800, color: '#fff', fontSize: 18, marginTop: 4, textShadow: '0 0 4px #000'}}>
          TAREFAS CONCLUÍDAS · tique {t1}
        </div>
      </div>
      {sab && (
        <div
          style={{
            position: 'absolute', right: 40, top: 30, padding: '12px 22px', background: '#b80000', border: '5px solid #000', borderRadius: 10,
            fontFamily: FONT.display, fontWeight: 900, fontSize: 28, color: '#fff', opacity: 0.75 + 0.25 * Math.sin(frame / 3),
          }}
        >
          🚨 SABOTAGEM: {sab.tipo.toUpperCase()}
        </div>
      )}
      {mortesAgora.map((m) => {
        const P = pt(m.sala);
        return (
          <div key={'k' + m.vitima} style={{position: 'absolute', left: P.x - 40, top: P.y - 130, fontSize: 70, opacity: interpolate(frac, [0.45, 0.55, 1], [0, 1, 0.6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
            🔪
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1, background: COR.Branco.body, opacity: 0}} />
    </AbsoluteFill>
  );
};
