import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Crewmate, COR} from './Crewmate';
import {corposNoTique, ORDEM, papelDe, Partida, salasNoTique, siglaModelo} from './dados';
import {FONT} from '../theme';

// "Gameplay" do Among Us de IAs: nave vista de cima com salas, corredores, móveis e dutos;
// a câmera segue um jogador de perto, como no jogo. Tudo é reconstruído a partir do log da partida
// (sala de cada jogador a cada tique, mortes, dutos, sabotagens) — o caminho entre as salas é interpolado.

// ---------------------------------------------------------------- mundo
type Sala = {x: number; y: number; w: number; h: number; nome: string};
const S = (x: number, y: number, nome: string, w = 640, h = 420): Sala => ({x: x * 3, y: y * 3, w, h, nome});
export const SALAS: Record<string, Sala> = {
  Refeitorio: S(960, 200, 'Refeitório', 860, 520),
  Armas: S(1340, 200, 'Armas'),
  O2: S(1320, 440, 'O2', 560, 380),
  Navegacao: S(1700, 470, 'Navegação'),
  Escudos: S(1440, 780, 'Escudos'),
  Comunicacoes: S(1140, 930, 'Comunicações', 600, 380),
  Deposito: S(900, 730, 'Depósito', 700, 460),
  Admin: S(1040, 480, 'Admin', 600, 380),
  Eletrica: S(600, 790, 'Elétrica', 600, 400),
  MotorInferior: S(300, 820, 'Motor Inferior'),
  Seguranca: S(430, 520, 'Segurança', 560, 380),
  Reator: S(140, 520, 'Reator', 600, 460),
  MotorSuperior: S(300, 210, 'Motor Superior'),
  Enfermaria: S(650, 360, 'Enfermaria', 600, 400),
};
const CORREDORES: [string, string][] = [
  ['Refeitorio', 'Armas'], ['Refeitorio', 'MotorSuperior'], ['Refeitorio', 'Enfermaria'], ['Refeitorio', 'Admin'], ['Refeitorio', 'Deposito'],
  ['Armas', 'O2'], ['Armas', 'Navegacao'], ['O2', 'Navegacao'], ['O2', 'Escudos'], ['Navegacao', 'Escudos'], ['Escudos', 'Comunicacoes'],
  ['Escudos', 'Deposito'], ['Comunicacoes', 'Deposito'], ['Deposito', 'Admin'], ['Deposito', 'Eletrica'], ['Deposito', 'MotorInferior'],
  ['MotorInferior', 'Seguranca'], ['MotorInferior', 'Reator'], ['MotorInferior', 'MotorSuperior'], ['Seguranca', 'Reator'],
  ['Seguranca', 'MotorSuperior'], ['Reator', 'MotorSuperior'], ['MotorSuperior', 'Enfermaria'],
];
const DUTOS = ['Reator', 'MotorSuperior', 'MotorInferior', 'Enfermaria', 'Seguranca', 'Eletrica', 'Refeitorio', 'Admin', 'Navegacao', 'Armas', 'Escudos'];
const MUNDO = {w: 5600, h: 3200};

type P = {x: number; y: number};
const centro = (k: string): P => ({x: SALAS[k].x, y: SALAS[k].y});
const ventPos = (k: string): P => ({x: SALAS[k].x + SALAS[k].w / 2 - 70, y: SALAS[k].y + SALAS[k].h / 2 - 60});
const consolePos = (k: string): P => ({x: SALAS[k].x - SALAS[k].w / 2 + 90, y: SALAS[k].y - SALAS[k].h / 2 + 120});

// lugar de cada jogador dentro da sala (grade, para não amontoar)
const lugar = (k: string, cor: string): P => {
  const i = ORDEM.indexOf(cor);
  const s = SALAS[k];
  return {x: s.x + ((i % 4) - 1.5) * Math.min(130, s.w / 5), y: s.y + 20 + (Math.floor(i / 4) - 0.5) * Math.min(120, s.h / 3.6)};
};

// corredor em L entre duas salas (sempre o mesmo desenho nos dois sentidos)
function cotovelo(a: string, b: string): P[] {
  const [p, q] = a < b ? [a, b] : [b, a];
  const pts = [centro(p), {x: centro(q).x, y: centro(p).y}, centro(q)];
  return a < b ? pts : [...pts].reverse();
}
const vizinhas = (a: string, b: string) => CORREDORES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

function aoLongo(pts: P[], t: number): {p: P; dir: number} {
  const segs = pts.slice(1).map((q, i) => Math.hypot(q.x - pts[i].x, q.y - pts[i].y));
  const total = segs.reduce((a, b) => a + b, 0) || 1;
  let d = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const f = segs[i] ? d / segs[i] : 0;
      const a = pts[i];
      const b = pts[i + 1];
      return {p: {x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f}, dir: Math.sign(b.x - a.x)};
    }
    d -= segs[i];
  }
  return {p: pts[pts.length - 1], dir: 0};
}

// ---------------------------------------------------------------- estado de um jogador num instante contínuo
type Pose = {p: P; dir: number; andando: boolean; alpha: number; escala: number; tarefa: boolean; aparente: string} | null;

function pose(pt: Partida, cor: string, tf: number, deTique: number): Pose {
  const t0 = Math.floor(tf);
  const t1 = t0 + 1;
  const frac = tf - t0;
  const reuniao = pt.reunioes.some((r) => r.tique === t0);
  const ini = salasNoTique(pt, t0)[cor];
  const fim = salasNoTique(pt, t1)[cor];
  if (!ini) return null;
  const a = reuniao && t0 >= deTique ? 'Refeitorio' : ini.sala;
  const b = fim?.sala ?? a;
  const dec = pt.tiques[t1]?.decisoes.find((d) => d.cor === cor);
  const tarefa = !!dec && /^(fazer tarefa|fingir que faz tarefa)/.test(dec.acao) && a === b;
  const morreu = !fim;
  if (morreu && frac > 0.55) return null;
  const aparente = fim?.aparente ?? ini.aparente ?? cor;
  const duto = pt.eventos.find((e) => e.tipo === 'duto' && e.tique === t1 && e.cor === cor);
  if (duto) {
    const dentro = frac < 0.5;
    const k = dentro ? frac / 0.5 : (frac - 0.5) / 0.5;
    const v = ventPos(dentro ? a : b);
    return {p: v, dir: 0, andando: false, alpha: dentro ? 1 - k : k, escala: dentro ? 1 - 0.5 * k : 0.5 + 0.5 * k, tarefa: false, aparente};
  }
  const pa = tarefa ? consolePos(a) : lugar(a, cor);
  if (a === b) {
    const alvo = tarefa ? consolePos(a) : lugar(a, cor);
    // se estava em outro ponto da sala (ex.: vai pro console), anda até lá
    const de = lugar(a, cor);
    const m = Math.min(1, frac / 0.35);
    return {p: {x: de.x + (alvo.x - de.x) * m, y: de.y + (alvo.y - de.y) * m}, dir: Math.sign(alvo.x - de.x), andando: m > 0 && m < 1 && (alvo.x !== de.x || alvo.y !== de.y), alpha: 1, escala: 1, tarefa, aparente};
  }
  const rota = vizinhas(a, b) ? [pa, ...cotovelo(a, b), lugar(b, cor)] : [pa, lugar(b, cor)];
  const m = Math.min(1, frac / 0.8);
  const r = aoLongo(rota, m);
  return {p: r.p, dir: r.dir, andando: m < 1, alpha: 1, escala: 1, tarefa: false, aparente};
}

// ---------------------------------------------------------------- desenho da nave
const Moveis: React.FC<{k: string; s: Sala}> = ({k, s}) => {
  const l = s.x - s.w / 2;
  const t = s.y - s.h / 2;
  const el: React.ReactNode[] = [];
  const mesa = (x: number, y: number, r = 70) => (
    <g key={`m${x}${y}`}>
      <ellipse cx={x} cy={y + 10} rx={r} ry={r * 0.55} fill="#00000033" />
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.55} fill="#a9b3c9" stroke="#222" strokeWidth={6} />
    </g>
  );
  if (k === 'Refeitorio') {
    el.push(mesa(s.x - 230, s.y - 60), mesa(s.x + 230, s.y - 60), mesa(s.x - 230, s.y + 150), mesa(s.x + 230, s.y + 150), mesa(s.x, s.y + 40, 90));
    el.push(<circle key="btn" cx={s.x} cy={s.y + 30} r={26} fill="#e0261d" stroke="#300" strokeWidth={6} />);
  } else if (k === 'Reator') {
    el.push(<circle key="r1" cx={s.x - 60} cy={s.y + 20} r={120} fill="#3a7ca8" stroke="#0d2130" strokeWidth={10} />);
    el.push(<circle key="r2" cx={s.x - 60} cy={s.y + 20} r={60} fill="#8ff0ff" opacity={0.85} />);
  } else if (k === 'MotorSuperior' || k === 'MotorInferior') {
    el.push(<rect key="e1" x={l + 120} y={s.y - 70} width={300} height={160} rx={70} fill="#7d8597" stroke="#222" strokeWidth={8} />);
    el.push(<rect key="e2" x={l + 380} y={s.y - 40} width={90} height={100} rx={20} fill="#ff9b3d" opacity={0.85} />);
  } else if (k === 'Eletrica') {
    for (let i = 0; i < 4; i++) el.push(<rect key={`p${i}`} x={l + 80 + i * 120} y={t + 70} width={90} height={110} fill="#4b5263" stroke="#111" strokeWidth={5} />);
    ['#e33', '#3c3', '#36f', '#fd2'].forEach((c, i) => el.push(<path key={`w${i}`} d={`M${l + 100 + i * 120} ${t + 130} q30 30 60 0`} stroke={c} strokeWidth={8} fill="none" />));
  } else if (k === 'Navegacao') {
    el.push(<path key="n" d={`M${s.x - 160} ${s.y + 120} Q${s.x} ${s.y - 120} ${s.x + 160} ${s.y + 120}`} stroke="#2a3348" strokeWidth={60} fill="none" />);
    el.push(<path key="n2" d={`M${s.x - 140} ${s.y + 110} Q${s.x} ${s.y - 100} ${s.x + 140} ${s.y + 110}`} stroke="#66d9ff" strokeWidth={10} fill="none" opacity={0.7} />);
  } else if (k === 'Escudos') {
    for (let i = 0; i < 5; i++) el.push(<polygon key={`h${i}`} points={hex(s.x - 160 + i * 80, s.y + (i % 2) * 60, 40)} fill="#e9eef8" stroke="#3b6fd1" strokeWidth={6} />);
  } else if (k === 'Comunicacoes') {
    el.push(<rect key="d" x={l + 80} y={s.y - 20} width={260} height={90} fill="#8b6e4e" stroke="#222" strokeWidth={6} />);
    el.push(<circle key="a" cx={s.x + 160} cy={s.y} r={70} fill="#c9d0de" stroke="#222" strokeWidth={6} />);
  } else if (k === 'Deposito') {
    for (let i = 0; i < 5; i++) el.push(<rect key={`c${i}`} x={l + 70 + (i % 3) * 140} y={s.y - 40 + Math.floor(i / 3) * 130} width={110} height={100} fill="#a8783f" stroke="#3a240c" strokeWidth={7} />);
  } else if (k === 'Admin') {
    el.push(<rect key="t" x={s.x - 140} y={s.y - 30} width={280} height={140} rx={20} fill="#3b4256" stroke="#111" strokeWidth={7} />);
    el.push(<rect key="t2" x={s.x - 115} y={s.y - 10} width={230} height={100} rx={10} fill="#2fe08a" opacity={0.45} />);
  } else if (k === 'Seguranca') {
    for (let i = 0; i < 3; i++) el.push(<rect key={`s${i}`} x={l + 90 + i * 130} y={t + 75} width={110} height={70} fill="#13202e" stroke="#7af" strokeWidth={5} />);
  } else if (k === 'Enfermaria') {
    for (let i = 0; i < 2; i++) el.push(<rect key={`b${i}`} x={l + 80} y={t + 90 + i * 130} width={170} height={80} rx={14} fill="#eef3fb" stroke="#222" strokeWidth={6} />);
    el.push(<circle key="sc" cx={s.x + 140} cy={s.y + 60} r={70} fill="#44f2a4" opacity={0.35} stroke="#1a8f5c" strokeWidth={6} />);
  } else if (k === 'O2') {
    for (let i = 0; i < 3; i++) el.push(<rect key={`o${i}`} x={l + 80 + i * 140} y={s.y + 40} width={110} height={70} fill="#5aa34a" stroke="#1f3d18" strokeWidth={6} />);
  } else if (k === 'Armas') {
    el.push(<circle key="g" cx={s.x + 120} cy={s.y} r={90} fill="#6b7387" stroke="#222" strokeWidth={8} />);
    el.push(<rect key="g2" x={s.x + 110} y={s.y - 150} width={20} height={150} fill="#222" />);
  }
  return <>{el}</>;
};
const hex = (cx: number, cy: number, r: number) =>
  Array.from({length: 6}, (_, i) => `${cx + r * Math.cos((Math.PI / 3) * i)},${cy + r * Math.sin((Math.PI / 3) * i)}`).join(' ');

const Nave: React.FC<{alerta: number}> = React.memo(({alerta}) => (
  <svg width={MUNDO.w} height={MUNDO.h} style={{position: 'absolute', left: 0, top: 0}}>
    <defs>
      <pattern id="piso" width="64" height="64" patternUnits="userSpaceOnUse">
        <rect width="64" height="64" fill="#9097a8" />
        <path d="M0 0H64V64" fill="none" stroke="#7d8496" strokeWidth="3" />
        <rect x="6" y="6" width="22" height="22" fill="#989fb0" />
      </pattern>
      <pattern id="corredor" width="48" height="48" patternUnits="userSpaceOnUse">
        <rect width="48" height="48" fill="#6f7688" />
        <path d="M0 24H48" stroke="#5f6577" strokeWidth="3" />
      </pattern>
    </defs>
    {/* corredores (paredes + piso) */}
    {CORREDORES.map(([a, b]) => {
      const pts = cotovelo(a, b).map((p) => `${p.x},${p.y}`).join(' ');
      return (
        <g key={a + b}>
          <polyline points={pts} fill="none" stroke="#1b1e27" strokeWidth={250} strokeLinejoin="round" />
          <polyline points={pts} fill="none" stroke="url(#corredor)" strokeWidth={210} strokeLinejoin="round" />
        </g>
      );
    })}
    {/* salas */}
    {Object.entries(SALAS).map(([k, s]) => {
      const l = s.x - s.w / 2;
      const t = s.y - s.h / 2;
      return (
        <g key={k}>
          <rect x={l - 16} y={t - 16} width={s.w + 32} height={s.h + 32} rx={26} fill="#1b1e27" />
          <rect x={l} y={t} width={s.w} height={s.h} rx={14} fill="url(#piso)" />
          <rect x={l} y={t} width={s.w} height={56} rx={14} fill="#4c5367" />
          <rect x={l} y={t + 48} width={s.w} height={8} fill="#353a49" />
          <text x={s.x} y={t + 38} textAnchor="middle" fontFamily={FONT.display} fontWeight={900} fontSize={30} fill="#e9edf7" opacity={0.8}>
            {s.nome}
          </text>
          <Moveis k={k} s={s} />
          {/* console de tarefa */}
          <g>
            <rect x={consolePos(k).x - 40} y={t + 62} width={80} height={46} rx={6} fill="#2b3142" stroke="#f5d742" strokeWidth={5} />
            <rect x={consolePos(k).x - 28} y={t + 70} width={56} height={22} fill="#5fe3ff" opacity={0.7} />
          </g>
          {DUTOS.includes(k) && (
            <g>
              <rect x={ventPos(k).x - 50} y={ventPos(k).y - 26} width={100} height={52} rx={6} fill="#3d4352" stroke="#15171e" strokeWidth={6} />
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={ventPos(k).x - 38 + i * 21} y={ventPos(k).y - 16} width={10} height={32} fill="#15171e" />
              ))}
            </g>
          )}
        </g>
      );
    })}
    {alerta > 0 && <rect width={MUNDO.w} height={MUNDO.h} fill="#ff0000" opacity={alerta} />}
  </svg>
));

// ---------------------------------------------------------------- minimapa
const Minimapa: React.FC<{poses: Record<string, Pose>; foco?: string}> = ({poses, foco}) => {
  const k = 0.055;
  return (
    <div style={{position: 'absolute', right: 28, top: 28, width: MUNDO.w * k, height: MUNDO.h * k, background: '#0b0e18cc', border: '4px solid #000', borderRadius: 14}}>
      <svg width={MUNDO.w * k} height={MUNDO.h * k}>
        {Object.values(SALAS).map((s, i) => (
          <rect key={i} x={(s.x - s.w / 2) * k} y={(s.y - s.h / 2) * k} width={s.w * k} height={s.h * k} rx={3} fill="#5f6780" />
        ))}
        {Object.entries(poses).map(([cor, p]) =>
          p ? <circle key={cor} cx={p.p.x * k} cy={p.p.y * k} r={cor === foco ? 7 : 5} fill={COR[p.aparente]?.body ?? '#fff'} stroke={cor === foco ? '#fff' : '#000'} strokeWidth={2} /> : null,
        )}
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------- componente principal
type Props = {
  p: Partida;
  deTique: number;
  ateTique: number;
  framesPorTique: number;
  pensamentos?: string[];
  mostrarPapeis?: boolean;
  zoom?: string | null; // sala para a câmera (cenas de morte)
};

export const Gameplay: React.FC<Props> = ({p, deTique, ateTique, framesPorTique, pensamentos = [], mostrarPapeis = true, zoom}) => {
  const frame = useCurrentFrame();
  const tfDe = (f: number) => Math.min(ateTique - 0.001, deTique + Math.max(0, f) / framesPorTique);
  const tf = tfDe(frame);
  const t1 = Math.floor(tf) + 1;
  const frac = tf - Math.floor(tf);

  const poses: Record<string, Pose> = {};
  for (const cor of ORDEM) poses[cor] = pose(p, cor, tf, deTique);

  // câmera: segue o primeiro jogador "pensante" (suavizada), ou a sala da cena, ou o centro da nave
  const foco = pensamentos.find((c) => poses[c]) ?? undefined;
  let cam: P;
  if (zoom) cam = centro(zoom);
  else if (foco) {
    let sx = 0;
    let sy = 0;
    let n = 0;
    for (let d = 0; d <= 12; d += 3) {
      const q = pose(p, foco, tfDe(frame - d), deTique);
      if (q) { sx += q.p.x; sy += q.p.y; n++ }
    }
    cam = n ? {x: sx / n, y: sy / n} : centro('Refeitorio');
  } else cam = {x: 2780, y: 1560};
  const escala = zoom ? 1.15 : foco ? 1 : 0.34;

  const est = p.tiques[t1]?.estado ?? p.tiques[Math.floor(tf)]?.estado;
  const sab = est?.sabotagem ?? null;
  const luzes = sab?.tipo === 'Luzes';
  const tarefas = est ? est.tarefas / est.totalTarefas : 0;
  const corpos = corposNoTique(p, frac > 0.55 ? t1 : Math.floor(tf));
  const morte = p.eventos.find((e) => e.tipo === 'morte' && e.tique === t1);
  const flash = morte ? interpolate(frac, [0.45, 0.55, 0.85], [0, 0.6, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  const tq = p.tiques[t1];

  const mundo: React.CSSProperties = {
    position: 'absolute', left: 0, top: 0, width: MUNDO.w, height: MUNDO.h, transformOrigin: '0 0',
    transform: `translate(${960 - cam.x * escala}px, ${540 - cam.y * escala}px) scale(${escala})`,
  };
  const raio = luzes ? 260 : 620;

  return (
    <AbsoluteFill style={{background: '#05060c', overflow: 'hidden'}}>
      <div style={mundo}>
        <Nave alerta={sab?.tipo === 'Reator' ? 0.1 + 0.08 * Math.sin(frame / 4) : 0} />
        {corpos.map((c) => {
          const q = lugar(c.sala, c.cor);
          return (
            <div key={'c' + c.cor} style={{position: 'absolute', left: q.x - 45, top: q.y - 40}}>
              <Crewmate cor={c.cor} size={90} morto />
            </div>
          );
        })}
        {ORDEM.map((cor) => {
          const q = poses[cor];
          if (!q) return null;
          const info = papelDe(p, cor);
          const imp = mostrarPapeis && info.time === 'impostor';
          const nome = q.aparente !== cor ? `${q.aparente}*` : cor;
          return (
            <div key={cor} style={{position: 'absolute', left: q.p.x - 42, top: q.p.y - 90, opacity: q.alpha, transform: `scale(${q.escala})`, transformOrigin: '50% 100%'}}>
              <div style={{position: 'absolute', left: 6, top: 92, width: 72, height: 18, borderRadius: '50%', background: '#00000040'}} />
              <Crewmate cor={q.aparente} size={84} passo={q.andando ? frame / 7 : 0} virado={q.dir < 0} />
              <div style={{position: 'absolute', top: -34, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', display: 'flex', gap: 6, alignItems: 'center',
                fontFamily: FONT.display, fontWeight: 900, fontSize: 22, color: imp ? '#ff4d4d' : '#fff', textShadow: '0 0 4px #000, 0 0 4px #000, 0 0 4px #000'}}>
                {nome}
                <span style={{fontSize: 13, padding: '1px 6px', borderRadius: 6, background: siglaModelo(info.modelo) === 'DeepSeek' ? '#2f6bff' : '#d97a47', color: '#fff', textShadow: 'none'}}>
                  {siglaModelo(info.modelo)}
                </span>
              </div>
              {q.tarefa && (
                <div style={{position: 'absolute', top: -58, left: 6, width: 72, height: 12, background: '#111', border: '2px solid #000', borderRadius: 4}}>
                  <div style={{width: `${Math.min(100, frac * 140)}%`, height: '100%', background: '#43d43b'}} />
                </div>
              )}
            </div>
          );
        })}
        {morte && frac > 0.45 && frac < 0.95 && (
          <div style={{position: 'absolute', left: lugar(morte.sala, morte.vitima).x - 40, top: lugar(morte.sala, morte.vitima).y - 200, fontSize: 90}}>🔪</div>
        )}
      </div>
      {/* visão: escuro fora do raio (luzes apagadas = raio pequeno) */}
      {foco && !zoom && (
        <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, transparent ${raio * 0.75}px, rgba(0,0,0,${luzes ? 0.93 : 0.6}) ${raio}px)`}} />
      )}
      {(!foco || zoom) && luzes && <AbsoluteFill style={{background: 'rgba(0,0,0,.55)'}} />}
      <AbsoluteFill style={{background: '#ff1e1e', opacity: flash}} />
      {/* HUD */}
      <div style={{position: 'absolute', left: 32, top: 26, width: 560}}>
        <div style={{height: 38, background: '#1b1f2a', border: '5px solid #000', borderRadius: 4, overflow: 'hidden'}}>
          <div style={{width: `${tarefas * 100}%`, height: '100%', background: '#43d43b'}} />
        </div>
        <div style={{fontFamily: FONT.display, fontWeight: 900, color: '#fff', fontSize: 19, marginTop: 4, textShadow: '0 0 5px #000'}}>TAREFAS CONCLUÍDAS · tique {t1}</div>
      </div>
      {sab && (
        <div style={{position: 'absolute', left: '50%', top: 30, transform: 'translateX(-50%)', padding: '10px 24px', background: '#b80000', border: '5px solid #000', borderRadius: 10,
          fontFamily: FONT.display, fontWeight: 900, fontSize: 28, color: '#fff', opacity: 0.75 + 0.25 * Math.sin(frame / 3)}}>
          🚨 SABOTAGEM: {sab.tipo.toUpperCase()}
        </div>
      )}
      <Minimapa poses={poses} foco={foco} />
      {foco && (
        <div style={{position: 'absolute', right: 34, bottom: pensamentos.length ? 190 : 36, display: 'flex', gap: 16}}>
          {(papelDe(p, foco).time === 'impostor' ? ['MATAR', 'SABOTAR', 'DUTO'] : ['USAR', 'DENUNCIAR']).map((b) => (
            <div key={b} style={{width: 112, height: 112, borderRadius: 18, background: '#ffffff22', border: '4px solid #ffffff99', display: 'grid', placeItems: 'center',
              fontFamily: FONT.display, fontWeight: 900, fontSize: 17, color: '#fff', textShadow: '0 0 4px #000'}}>
              {b}
            </div>
          ))}
        </div>
      )}
      {/* pensamentos secretos */}
      <div style={{position: 'absolute', left: 40, right: 40, bottom: 30, display: 'flex', gap: 18, justifyContent: 'center'}}>
        {pensamentos.map((cor) => {
          const pens = tq?.decisoes.find((d) => d.cor === cor)?.pensamento;
          if (!pens) return null;
          const info = papelDe(p, cor);
          return (
            <div key={cor} style={{flex: '0 1 860px', display: 'flex', gap: 14, alignItems: 'center', padding: '12px 18px', borderRadius: 20, background: '#fffdf2',
              border: `5px solid ${mostrarPapeis && info.time === 'impostor' ? '#d10000' : '#000'}`, boxShadow: '0 8px 0 rgba(0,0,0,.4)',
              opacity: interpolate(frac, [0, 0.1, 0.9, 1], [0.3, 1, 1, 0.85])}}>
              <Crewmate cor={cor} size={58} />
              <div style={{fontFamily: FONT.display, fontWeight: 600, fontSize: 24, lineHeight: 1.25, color: '#111'}}>
                <b style={{color: COR[cor].shade}}>{cor} pensa:</b> {pens}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
