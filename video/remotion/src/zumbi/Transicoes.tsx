// Transições e peças de Halloween do AU6 (modo zumbi). Tudo em SVG inline (sem emoji), determinístico pelo quadro.
// Transicao: 44 quadros, corte entre cenas no quadro 22 (tela 100% coberta entre ~18 e ~26).
import React from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {Crewmate4} from '../amongus/Crewmate4';
import {Personagem} from './Personagem';
import {Abobora, Teia, L, rnd} from './salas/comum';

export const DUR_TRANS = 44;

const W = 1920, H = 1080;
const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const fonte = 'Inter, Arial, sans-serif';
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const easeIn = Easing.bezier(0.55, 0, 0.9, 0.4);
const easeOut = Easing.bezier(0.1, 0.6, 0.3, 1);
const lerp = (f: number, a: number, b: number, v0: number, v1: number, e: (t: number) => number = ease) =>
  interpolate(f, [a, b], [v0, v1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const sp = (f: number, d = 0, damping = 12, stiffness = 130) => spring({frame: Math.max(0, f - d), fps: 30, config: {damping, stiffness}});

const Camada: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...style}}>{children}</div>
);

// ------------------------------------------------------------------ ARANHA
const PERNAS = [
  {h: [14, -14], k: [52, -64], p: [92, -22]},
  {h: [18, -6], k: [70, -36], p: [114, 14]},
  {h: [18, 4], k: [70, 8], p: [106, 58]},
  {h: [14, 12], k: [54, 44], p: [80, 94]},
];

export const AranhaSvg: React.FC<{f: number; s?: number; olhos?: string}> = ({f, s = 1, olhos = '#c6ff3a'}) => {
  const perna = (lado: number, i: number) => {
    const q = PERNAS[i];
    const w = Math.sin(f / 2.2 + i * 1.3 + (lado > 0 ? 0 : 1.7)) * 7;
    const d = `M${lado * q.h[0]} ${q.h[1]} L${lado * q.k[0]} ${q.k[1] - w} L${lado * q.p[0]} ${q.p[1] + w}`;
    return (
      <g key={`${lado}${i}`}>
        <path d={d} stroke="#000" strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} stroke="#4a2a7a" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };
  return (
    <g transform={`scale(${s})`}>
      {[0, 1, 2, 3].map((i) => perna(1, i))}{[0, 1, 2, 3].map((i) => perna(-1, i))}
      <ellipse cx={0} cy={22} rx={40} ry={48} fill="#3a1f66" stroke="#000" strokeWidth={6} />
      <ellipse cx={-14} cy={10} rx={10} ry={18} fill="#4a2a7a" opacity={0.55} />
      <path d="M-11 6 L11 6 L0 24 L11 42 L-11 42 L0 24 Z" fill="#ff8a1a" stroke="#000" strokeWidth={3} />
      <circle cx={0} cy={-22} r={27} fill="#47277f" stroke="#000" strokeWidth={6} />
      <circle cx={-10} cy={-27} r={9} fill={olhos} stroke="#000" strokeWidth={3} /><circle cx={10} cy={-27} r={9} fill={olhos} stroke="#000" strokeWidth={3} />
      <circle cx={-9} cy={-27} r={3.6} fill="#000" /><circle cx={11} cy={-27} r={3.6} fill="#000" />
      <circle cx={-21} cy={-15} r={4.2} fill={olhos} stroke="#000" strokeWidth={2} /><circle cx={21} cy={-15} r={4.2} fill={olhos} stroke="#000" strokeWidth={2} />
      <path d="M-8 -6 L-5 5 L-2 -6 M2 -6 L5 5 L8 -6" fill="#fff" stroke="#000" strokeWidth={2.5} strokeLinejoin="round" />
    </g>
  );
};

const TeiaGrande: React.FC<{cx: number; cy: number; R: number; op: number}> = ({cx, cy, R, op}) => {
  const raios = Array.from({length: 13}, (_, i) => (i / 12) * Math.PI);
  const aneis = [0.12, 0.22, 0.34, 0.48, 0.64, 0.82, 1];
  return (
    <g stroke="#d9cff5" fill="none" strokeLinecap="round" opacity={op}>
      {raios.map((a, i) => <line key={i} x1={cx} y1={cy} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)} strokeWidth={3} />)}
      {aneis.map((k) => (
        <path key={k} strokeWidth={2.6} d={raios.map((a, i) => {
          const x = cx + R * k * Math.cos(a), y = cy + R * k * Math.sin(a);
          if (i === 0) return `M${x} ${y}`;
          const b = raios[i - 1] + (a - raios[i - 1]) / 2;
          return `Q${cx + R * k * 0.86 * Math.cos(b)} ${cy + R * k * 0.86 * Math.sin(b)} ${x} ${y}`;
        }).join(' ')} />
      ))}
    </g>
  );
};

const Aranha: React.FC<{f: number}> = ({f}) => {
  const CX = 960, CY = 470;
  const R1 = lerp(f, 8, 19, 0, 1750, ease);
  const R2 = lerp(f, 26, 42, 0, 1900, easeIn);
  const furo = f >= 27;
  const cor = '#120720';
  // aranha: desce com mola, balança, sobe de volta
  const desce = -330 + 800 * sp(f, 0, 9, 80);
  const sobe = lerp(f, 24, 39, 0, 1000, easeIn);
  const ys = desce - sobe;
  const xs = 960 + Math.sin(f / 5) * 16 * (1 - lerp(f, 20, 30, 0, 1));
  const esc = 3.1;
  const webOp = lerp(f, 0, 6, 0, 0.95);
  const webR = lerp(f, 0, 19, 380, 2100, easeOut);
  const minis = Array.from({length: 9}, (_, i) => {
    const a = (0.12 + (i / 8) * 0.76) * Math.PI;
    const t = lerp(f, 4 + i * 0.7, 18, 0, 1, easeOut) * (1 - lerp(f, 28, 38, 0, 1, easeIn));
    return {x: 960 + Math.cos(a) * webR * 0.8 * t, y: -30 + Math.sin(a) * webR * 0.8 * t, a, t};
  });
  return (
    <Camada>
      {R1 > 2 ? (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at ${CX}px ${CY}px, ${cor} 0px, ${cor} ${Math.max(0, R1 - 90)}px, #4b1f73 ${Math.max(1, R1 - 30)}px, rgba(75,31,115,0) ${R1}px)`,
          WebkitMaskImage: furo ? `radial-gradient(circle at ${CX}px ${CY}px, transparent ${R2}px, #000 ${R2 + 40}px)` : undefined,
          maskImage: furo ? `radial-gradient(circle at ${CX}px ${CY}px, transparent ${R2}px, #000 ${R2 + 40}px)` : undefined,
        }}>
          <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
            <TeiaGrande cx={960} cy={-40} R={webR} op={webOp} />
            <Teia x={0} y={0} r={420} rot={0} /><Teia x={W} y={0} r={420} rot={90} />
            <Teia x={0} y={H} r={360} rot={-90} /><Teia x={W} y={H} r={360} rot={180} />
          </svg>
        </div>
      ) : (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}><TeiaGrande cx={960} cy={-40} R={webR} op={webOp} /></svg>
      )}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {minis.map((m, i) => m.t > 0.02 && (
          <g key={i} transform={`translate(${m.x},${m.y}) rotate(${(m.a * 180) / Math.PI - 90})`}><AranhaSvg f={f * 1.6 + i * 3} s={0.3} /></g>
        ))}
        <line x1={960} y1={-40} x2={xs} y2={ys - 90 * esc * 0.4} stroke="#e6e0ff" strokeWidth={5} />
        <g style={{filter: 'drop-shadow(0 0 22px #ff8a1a) drop-shadow(0 0 6px #b06aff)'}} transform={`translate(${xs},${ys}) rotate(${Math.sin(f / 5) * 5})`}><AranhaSvg f={f} s={esc} /></g>
      </svg>
    </Camada>
  );
};

// ------------------------------------------------------------------ FANTASMA
const FantasmaSvg: React.FC<{f: number; boca: number}> = ({f, boca}) => {
  const a = 28 + 8 * Math.sin(f / 2.5);
  const hem = [0, 1, 2, 3, 4, 5].map((i) => {
    const x = 400 - i * 66.6;
    return `Q${x - 33.3} ${440 + (i % 2 ? -a * 1.4 : a * 1.8)} ${x - 66.6} 440`;
  }).join(' ');
  return (
    <svg width={400} height={540} viewBox="0 0 400 540" style={{overflow: 'visible', display: 'block'}}>
      <defs>
        <linearGradient id="gfan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.6" stopColor="#f0ecff" /><stop offset="1" stopColor="#c9c0f0" /></linearGradient>
      </defs>
      <path d={`M0 200 A200 200 0 0 1 400 200 L400 440 ${hem} Z`} fill="url(#gfan)" stroke={L} strokeWidth={8} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <ellipse cx={138} cy={190} rx={30} ry={48 + boca * 6} fill="#17102a" /><ellipse cx={262} cy={190} rx={30} ry={48 + boca * 6} fill="#17102a" />
      <circle cx={128} cy={172} r={11} fill="#fff" /><circle cx={252} cy={172} r={11} fill="#fff" />
      <ellipse cx={200} cy={310} rx={34 + boca * 12} ry={30 + boca * 40} fill="#17102a" />
      <ellipse cx={90} cy={262} rx={26} ry={14} fill="#ff9ac4" opacity={0.55} /><ellipse cx={310} cy={262} rx={26} ry={14} fill="#ff9ac4" opacity={0.55} />
    </svg>
  );
};

const Fantasma: React.FC<{f: number}> = ({f}) => {
  // posição do pivô (centro do rosto) e escala
  const voo = lerp(f, 0, 10, 0, 1, (t) => t);
  let px = -320 + voo * 1250, py = 330 + Math.sin(f / 2.2) * 26, S = 1.8, rot = -8 + voo * 10;
  if (f > 10) {
    const k = lerp(f, 10, 18, 0, 1, easeIn);
    px = 930 + (960 - 930) * k;
    py = 330 + (960 - 330) * k;
    S = 1.8 + (6 - 1.8) * k;
    rot = 2 * (1 - k);
  }
  if (f > 26) { py -= lerp(f, 26, 40, 0, 2650, easeIn); rot = Math.sin((f - 26) / 2) * 3; }
  const boca = f < 18 ? lerp(f, 6, 12, 0, 1, easeOut) : 1;
  // tripulante assustado
  const t0 = 5;
  const pulo = f >= t0 ? Math.abs(Math.sin(cl((f - t0) / 12, 0, 1) * Math.PI)) * 120 * (1 - lerp(f, t0, t0 + 24, 0, 0.5)) : 0;
  const cx = 1230, cy = 830;
  const treme = f >= t0 ? Math.sin(f * 2.4) * 4 : 0;
  const bal = lerp(f, 4, 8, 0, 1, easeOut);
  const burst = lerp(f, 5, 8, 0, 1, easeOut) * (1 - lerp(f, 15, 18, 0, 1));
  return (
    <Camada>
      {f < 19 && (
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <ellipse cx={cx} cy={cy + 8} rx={95 - pulo * 0.25} ry={16} fill="#000" opacity={0.35} />
        </svg>
      )}
      {f < 19 && (
        <div style={{position: 'absolute', left: cx + treme - 100, top: cy - 120 - pulo, width: 200, height: 240}}>
          <Crewmate4 cor="Laranja" size={200} anim={f < t0 ? 'andando' : 'susto'} passo={f < t0 ? f / 12 : 0} t={f} virado />
          {f >= t0 && (
            <svg width={200} height={240} viewBox="0 0 200 240" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              <g fill="#7fd8ff" stroke={L} strokeWidth={2}>
                <path d={`M10 40 Q4 ${54 + (f % 6)} 12 60 Q20 54 10 40 Z`} /><path d={`M190 36 Q184 ${50 + (f % 5)} 192 56 Q200 50 190 36 Z`} />
              </g>
            </svg>
          )}
        </div>
      )}
      {burst > 0 && (
        <div style={{position: 'absolute', left: 520, top: 470, transform: `rotate(-8deg) scale(${burst})`, fontFamily: fonte, fontWeight: 900, fontSize: 110, color: '#fff', WebkitTextStroke: '12px #3b177c', paintOrder: 'stroke fill', letterSpacing: 2}}>BUUU!</div>
      )}
      <div style={{position: 'absolute', left: px - 200, top: py - 260, width: 400, height: 540, transform: `scale(${S}) rotate(${rot}deg)`, transformOrigin: '200px 260px', filter: 'drop-shadow(0 0 30px #b9a8ff)'}}>
        <FantasmaSvg f={f} boca={boca} />
      </div>
    </Camada>
  );
};

// ------------------------------------------------------------------ MORCEGOS
export const MorcegoSvg: React.FC<{f: number; s?: number; ph?: number}> = ({f, s = 1, ph = 0}) => {
  const ang = Math.sin(f / 1.5 + ph) * 32;
  const asa = (lado: number) => (
    <g transform={`scale(${lado},1) rotate(${-ang + 8})`}>
      <path d="M6 0 C30 -48 86 -60 130 -22 Q112 -14 106 6 Q92 -6 76 10 Q62 -2 44 14 Q28 4 6 18 Z" fill="#2a1a45" stroke="#000" strokeWidth={4} strokeLinejoin="round" />
      <path d="M12 2 C40 -30 80 -38 112 -18" stroke="#3a2360" strokeWidth={3} fill="none" />
    </g>
  );
  return (
    <g transform={`scale(${s})`}>
      {asa(1)}{asa(-1)}
      <path d="M-14 -16 L-12 -36 L-3 -20 L3 -20 L12 -36 L14 -16 Q16 4 0 22 Q-16 4 -14 -16 Z" fill="#33205a" stroke="#000" strokeWidth={4} strokeLinejoin="round" />
      <circle cx={-6} cy={-6} r={3.6} fill="#ffe14a" /><circle cx={6} cy={-6} r={3.6} fill="#ffe14a" />
      <path d="M-4 6 L-3 12 L0 7 L3 12 L4 6" fill="#fff" />
    </g>
  );
};

const Lua: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r * 1.5} fill="#ffe9a0" opacity={0.12} /><circle r={r * 1.25} fill="#ffe9a0" opacity={0.16} />
    <circle r={r} fill="#fff3c4" stroke="#e8c96a" strokeWidth={6} />
    <circle cx={-r * 0.3} cy={-r * 0.25} r={r * 0.18} fill="#ecd488" /><circle cx={r * 0.35} cy={r * 0.1} r={r * 0.24} fill="#ecd488" /><circle cx={-r * 0.1} cy={r * 0.5} r={r * 0.12} fill="#ecd488" />
  </g>
);

const Morcegos: React.FC<{f: number}> = ({f}) => {
  const frente = lerp(f, 0, 18, -450, 2450, (t) => t);
  const tras = lerp(f, 26, 42, -450, 2450, (t) => t);
  const vf = -450 + f * (2900 / 18), vt = -450 + (f - 26) * (2900 / 16);
  const ondas = (xe: number) => {
    const pts: string[] = [];
    for (let y = -40; y <= H + 40; y += 40) pts.push(`${xe + Math.sin(y / 70 + f / 3) * 55 + Math.sin(y / 23) * 20}px ${y}px`);
    return pts;
  };
  const fr = ondas(frente), tr = ondas(tras);
  const clip = `polygon(${[...tr, ...fr.slice().reverse()].join(',')})`;
  const bando = (xe: number, n: number, off: number) => Array.from({length: n}, (_, i) => {
    const o = -1250 + rnd(i + off) * 1400;
    const y = rnd(i * 3 + off + 7) * 1160 - 40;
    const s = 0.55 + rnd(i + off + 31) * 1.15;
    return {x: xe + o, y: y + Math.sin(f / 4 + i) * 30, s, ph: rnd(i) * 6, i: i + off};
  });
  const bs = [...bando(vf, 120, 0), ...(f >= 22 ? bando(vt, 110, 200) : [])];
  return (
    <Camada>
      <div style={{position: 'absolute', inset: 0, clipPath: clip, background: 'linear-gradient(180deg,#0a0420 0%,#1c0a3a 55%,#2b0f4a 100%)'}}>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 40}, (_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i + 50) * H * 0.8} r={1.5 + rnd(i + 9) * 2.5} fill="#fff" opacity={0.4 + 0.5 * Math.abs(Math.sin(f / 6 + i))} />)}
          <Lua x={1480} y={290} r={190} />
          <Teia x={0} y={0} r={360} rot={0} /><Teia x={W} y={H} r={300} rot={180} />
        </svg>
      </div>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {bs.map((b) => b.x > -200 && b.x < W + 220 && (
          <g key={b.i} transform={`translate(${b.x},${b.y}) rotate(${Math.sin(f / 5 + b.ph) * 8})`}><MorcegoSvg f={f} s={b.s} ph={b.ph} /></g>
        ))}
      </svg>
    </Camada>
  );
};

export const Transicao: React.FC<{tipo: 'aranha' | 'fantasma' | 'morcegos'; f: number}> = ({tipo, f}) => {
  if (f < 0 || f >= DUR_TRANS) return null;
  if (tipo === 'aranha') return <Aranha f={f} />;
  if (tipo === 'fantasma') return <Fantasma f={f} />;
  return <Morcegos f={f} />;
};

// ------------------------------------------------------------------ VINHETA DE ABERTURA
const Raio: React.FC<{op: number}> = ({op}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: op}}>
    <path d="M1180 0 L1090 260 L1190 250 L1050 560 L1130 545 L990 820" stroke="#fff" strokeWidth={14} fill="none" strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 18px #bcd0ff)'}} />
    <path d="M1090 260 L960 380" stroke="#fff" strokeWidth={7} fill="none" />
  </svg>
);

export const VinhetaHalloween: React.FC<{f: number; dur: number}> = ({f, dur}) => {
  const fim = dur - 12; // tudo some antes do fim
  const saida = lerp(f, dur - 26, fim, 1, 0, (t) => t);
  if (f >= fim) return null;
  const fundo = Math.min(0.82, lerp(f, 0, 14, 0, 0.82, easeOut)) * saida;
  const flash = Math.max(f >= 5 && f < 7 ? 1 : 0, f >= 7 && f < 16 ? lerp(f, 7, 16, 0.85, 0, (t) => t) : 0, f >= 11 && f < 13 ? 0.9 : 0);
  const raio = f >= 5 && f < 15 ? (f % 4 < 3 ? 1 : 0.4) : 0;
  const tit1 = sp(f, 16, 11, 150), tit2 = sp(f, 24, 9, 140), sub = sp(f, 40, 14, 120);
  const zumbi = lerp(f, 48, 72, 0, 1, easeOut);
  const abo = [0, 1, 2, 3, 4, 5].map((i) => ({x: 160 + i * 320 + (i % 2) * 20, s: 1.9 + (i % 3) * 0.6, d: 10 + i * 4}));
  const morc = Array.from({length: 14}, (_, i) => {
    const sp0 = 5 + rnd(i) * 7, y0 = rnd(i + 5) * 650 + 30;
    const x = ((f * sp0 + rnd(i + 20) * 2400) % 2700) - 360;
    return {x: i % 2 ? W - x : x, y: y0 + Math.sin(f / 5 + i) * 40, s: 0.5 + rnd(i + 40) * 0.8, ph: rnd(i) * 6, flip: i % 2 ? -1 : 1};
  });
  return (
    <Camada>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 45%, rgba(40,14,70,${fundo * 0.9}) 0%, rgba(8,2,22,${fundo}) 100%)`}} />
      <div style={{opacity: saida, position: 'absolute', inset: 0}}>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <g opacity={lerp(f, 8, 24, 0, 1)}><Lua x={1560} y={230} r={150} /></g>
          <Teia x={0} y={0} r={400} /><Teia x={W} y={0} r={400} rot={90} />
        </svg>
        <Raio op={raio} />
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {morc.map((m, i) => f > 14 && <g key={i} transform={`translate(${m.x},${m.y}) scale(${m.flip},1)`}><MorcegoSvg f={f} s={m.s} ph={m.ph} /></g>)}
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: fonte, fontWeight: 900}}>
          <div style={{fontSize: 96, color: '#fff', WebkitTextStroke: '14px #1a0838', paintOrder: 'stroke fill', transform: `scale(${tit1}) rotate(${-3 * (1 - tit1)}deg)`, letterSpacing: 8}}>ESPECIAL DE</div>
          <div style={{fontSize: 232, lineHeight: 1, color: '#ff8a1a', WebkitTextStroke: '22px #1a0838', paintOrder: 'stroke fill', transform: `scale(${tit2}) rotate(${2 * (1 - tit2)}deg)`, marginTop: -8, textShadow: '0 12px 0 #7a2f00', filter: `drop-shadow(0 0 ${28 + 12 * Math.sin(f / 4)}px #ff7a00)`}}>HALLOWEEN</div>
          <div style={{fontSize: 70, color: '#b6ff4a', WebkitTextStroke: '10px #1a0838', paintOrder: 'stroke fill', marginTop: 18, transform: `scale(${sub}) translateY(${(1 - sub) * 40}px)`, opacity: cl(sub * 1.4), letterSpacing: 4}}>AMONG IA 6 · MODO ZUMBI</div>
        </div>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {abo.map((a, i) => {
            const k = sp(f, a.d, 8, 120);
            return <g key={i} opacity={cl(k * 3)}><Abobora x={a.x} y={1010 + (1 - k) * 260 + Math.sin(f / 6 + i) * 3} s={a.s * k} /></g>;
          })}
        </svg>
        <div style={{position: 'absolute', left: 960, top: 980 + (1 - zumbi) * 420}}>
          <Personagem cor="Verde" estado="zumbi" f={f} s={260} etiqueta={false} andando={zumbi < 1} />
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: flash}} />
    </Camada>
  );
};

// ------------------------------------------------------------------ CARTÃO DE FIM DE PARTIDA
const IconeZumbi: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    <circle cx={50} cy={52} r={40} fill="#7fc24a" stroke={L} strokeWidth={6} />
    <path d="M22 30 L34 40 M78 24 L68 36" stroke="#3b6a1e" strokeWidth={5} strokeLinecap="round" />
    <circle cx={34} cy={46} r={11} fill="#fff" stroke={L} strokeWidth={4} /><circle cx={67} cy={46} r={9} fill="#fff" stroke={L} strokeWidth={4} />
    <circle cx={36} cy={48} r={4.5} fill="#d9182d" /><circle cx={66} cy={48} r={4} fill="#d9182d" />
    <path d="M30 70 Q50 82 72 68" stroke={L} strokeWidth={5} fill="none" strokeLinecap="round" />
    <path d="M38 71 L38 78 M48 74 L48 82 M58 74 L58 80 M66 71 L66 76" stroke={L} strokeWidth={4} />
    <path d="M44 14 L50 28 L58 12" stroke={L} strokeWidth={5} fill="none" strokeLinejoin="round" />
  </svg>
);

export const CartaoFim: React.FC<{f: number; dur: number; titulo: string; sub?: string; partida: number; vivos: {cor: string; modelo: string}[]; zumbis: number}> = ({f, dur, titulo, sub, partida, vivos, zumbis}) => {
  const SAI = 16;
  const ent = sp(f, 0, 15, 90);
  const sai = lerp(f, dur - SAI, dur - 2, 0, 1, easeIn);
  if (f >= dur - 1) return null;
  const y = (1 - ent) * -1100 - sai * 1100;
  const n = Math.max(1, vivos.length);
  const sz = n <= 4 ? 190 : n <= 6 ? 160 : 130;
  const contZ = Math.round(zumbis * lerp(f, 40, 70, 0, 1, easeOut));
  const tp = sp(f, 12, 9, 130), ts = sp(f, 22, 9, 130);
  return (
    <Camada style={{transform: `translateY(${y}px)`}}>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#fff6e4 0%,#ffe9c8 60%,#f6d6a8 100%)'}} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 18}, (_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i + 3) * H} r={30 + rnd(i + 9) * 70} fill={i % 2 ? '#ffb85a' : '#c9a8f5'} opacity={0.18} />)}
        <rect x={0} y={0} width={W} height={22} fill="#ff8a1a" /><rect x={0} y={H - 22} width={W} height={22} fill="#6b2fbb" />
        <Teia x={0} y={22} r={330} rot={0} /><Teia x={W} y={22} r={330} rot={90} />
        <Abobora x={140} y={930} s={2.3} /><Abobora x={W - 150} y={930} s={2.3} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: fonte, fontWeight: 900}}>
        <div style={{display: 'inline-block', transform: `scale(${tp})`, background: '#6b2fbb', color: '#fff', fontSize: 50, padding: '6px 38px', borderRadius: 40, border: '6px solid #1a0838', letterSpacing: 4}}>FIM DA PARTIDA {partida}</div>
        <div style={{fontSize: 190, lineHeight: 1.05, color: '#ff7a00', WebkitTextStroke: '16px #1a0838', paintOrder: 'stroke fill', transform: `scale(${ts})`, marginTop: 14, textShadow: '0 10px 0 #7a2f00'}}>{titulo}</div>
        {sub ? <div style={{fontSize: 60, color: '#3b177c', marginTop: 4, opacity: cl(ts)}}>{sub}</div> : null}
      </div>
      <div style={{position: 'absolute', left: 120, right: 120, top: 540, height: 320, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 34}}>
        {vivos.length === 0 ? (
          <div style={{fontFamily: fonte, fontWeight: 900, fontSize: 70, color: '#5b8a2a', alignSelf: 'center'}}>NINGUÉM SOBREVIVEU</div>
        ) : vivos.map((v, i) => {
          const k = sp(f, 26 + i * 4, 9, 140);
          return (
            <div key={i} style={{position: 'relative', width: sz + 20, height: 320, transform: `scale(${k})`, transformOrigin: '50% 100%'}}>
              <div style={{position: 'absolute', left: (sz + 20) / 2, top: 214}}>
                <Personagem cor={v.cor} estado="humano" f={f + i * 5} s={sz} etiqueta={false} />
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, textAlign: 'center', fontFamily: fonte, fontWeight: 900, fontSize: n <= 4 ? 34 : 28, color: '#1a0838', lineHeight: 1.05}}>
                <span style={{background: '#fff', border: '4px solid #1a0838', borderRadius: 14, padding: '2px 12px', display: 'inline-block'}}>{v.modelo}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 52, display: 'flex', justifyContent: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, background: '#1f3a14', borderRadius: 60, border: '7px solid #1a0838', padding: '6px 46px 6px 24px', transform: `scale(${sp(f, 40, 10, 140)})`}}>
          <div style={{transform: `rotate(${Math.sin(f / 5) * 6}deg)`}}><IconeZumbi s={84} /></div>
          <div style={{fontFamily: fonte, fontWeight: 900, fontSize: 70, color: '#b6ff4a', letterSpacing: 2}}>{contZ} {zumbis === 1 ? 'ZUMBI' : 'ZUMBIS'}</div>
        </div>
      </div>
    </Camada>
  );
};

// ------------------------------------------------------------------ POP-UPS DE COMENTÁRIOS
const CORES_AV = ['#e8701a', '#6b2fbb', '#117f2d', '#c51111', '#132ed1', '#d4337f', '#1fb5a8', '#b88a00'];
const Curtida: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 24 24"><path d="M2 10 H6 V21 H2 Z M8 10 L12 2 Q15 2 14.5 6 L14 9 H20 Q22.5 9 22 12 L20.5 19 Q20 21 18 21 H8 Z" fill="#6b2fbb" stroke="#1a0838" strokeWidth={1.4} strokeLinejoin="round" /></svg>
);

export const PopupsComentarios: React.FC<{f: number; dur: number; comentarios: {autor: string; texto: string}[]}> = ({f, dur, comentarios}) => {
  const fim = dur - 10;
  if (f >= fim) return null;
  const saida = lerp(f, dur - 26, fim, 1, 0, (t) => t);
  const lista = comentarios.slice(0, 8);
  const selo = sp(f, 0, 10, 150);
  const LW = 700;
  const slots = [[24, 130], [1196, 235], [24, 340], [1196, 445], [24, 550], [1196, 655], [24, 760], [1196, 865]];
  return (
    <Camada>
      <div style={{position: 'absolute', inset: 0, opacity: saida * 0.5, background: 'radial-gradient(ellipse at 50% 50%, rgba(20,6,40,0.15), rgba(20,6,40,0.85))'}} />
      <div style={{position: 'absolute', inset: 0, opacity: saida}}>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}><Teia x={0} y={0} r={380} /><Teia x={W} y={0} r={380} rot={90} /><Teia x={0} y={H} r={300} rot={-90} /><Teia x={W} y={H} r={300} rot={180} /></svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 18, display: 'flex', justifyContent: 'center'}}>
          <div style={{transform: `scale(${selo}) rotate(${-2 * (1 - selo)}deg)`, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(90deg,#ff7a00,#ffa63a)', border: '7px solid #1a0838', borderRadius: 24, padding: '4px 36px 4px 18px', fontFamily: fonte, fontWeight: 900, fontSize: 64, color: '#fff', WebkitTextStroke: '8px #1a0838', paintOrder: 'stroke fill', boxShadow: '0 8px 0 #4b1f73'}}>
            <svg width={72} height={72} viewBox="-48 -48 96 96"><Abobora x={0} y={6} s={1.1} /></svg>VOCÊS PEDIRAM
          </div>
        </div>
        {lista.map((c, i) => {
          const d = 12 + i * 18;
          if (f < d) return null;
          const k = sp(f, d, 10, 150);
          const [x, y] = slots[i];
          const da = i % 2 ? 90 : -90;
          const tam = c.texto.length > 95 ? 24 : 28;
          const cor = CORES_AV[(c.autor.charCodeAt(0) + i) % CORES_AV.length];
          const flutua = Math.sin((f + i * 9) / 14) * 4;
          return (
            <div key={i} style={{position: 'absolute', left: x, top: y + flutua, width: LW, transform: `translateX(${(1 - k) * da * 8}px) scale(${0.6 + 0.4 * k}) rotate(${(i % 2 ? 1.4 : -1.4) * k}deg)`, opacity: cl(k * 2.5), transformOrigin: i % 2 ? '100% 50%' : '0% 50%'}}>
              <div style={{background: '#fff', border: '6px solid #1a0838', borderRadius: 26, boxShadow: `0 8px 0 ${i % 2 ? '#ff7a00' : '#6b2fbb'}`, padding: '16px 24px 16px 20px', display: 'flex', gap: 18, alignItems: 'flex-start', position: 'relative', overflow: 'hidden'}}>
                <svg width={90} height={90} viewBox="0 0 90 90" style={{position: 'absolute', right: -4, bottom: -4, opacity: 0.8}}><Teia x={90} y={90} r={80} rot={180} /></svg>
                <div style={{flex: '0 0 74px', width: 74, height: 74, borderRadius: 37, background: cor, border: '5px solid #1a0838', color: '#fff', fontFamily: fonte, fontWeight: 900, fontSize: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{c.autor.replace('@', '').charAt(0).toUpperCase()}</div>
                <div style={{flex: 1, minWidth: 0, fontFamily: fonte}}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12}}>
                    <div style={{fontWeight: 900, fontSize: 28, color: '#3b177c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>@{c.autor.replace('@', '')}</div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto', transform: `scale(${1 + 0.3 * Math.max(0, Math.sin(cl((f - d - 8) / 10, 0, 1) * Math.PI))})`}}><Curtida s={28} /><span style={{fontWeight: 900, fontSize: 24, color: '#6b2fbb'}}>{12 + ((c.autor.length * 37 + i * 91) % 480)}</span></div>
                  </div>
                  <div style={{fontWeight: 700, fontSize: tam, lineHeight: 1.18, color: '#17102a', maxHeight: tam * 1.18 * 4, overflow: 'hidden', wordBreak: 'break-word'}}>{c.texto}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Camada>
  );
};
