// DESENHA E ADIVINHA: peças do ateliê (cores, personagens, folha, traços animados, ícones). Tudo SVG, sem emoji.
// Papel branco = o que as IAs veem. Post-it amarelo = o que só o público vê.
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';

export const KRAFT = '#C9A66B', FOLHA = '#FDFBF5', POST = '#FFE66D', TINTA = '#1d1a12', CARIMBO = '#C2372B', MADEIRA = '#B9793C';
export const COR: Record<string, string> = {Vermelho: '#E0262B', Azul: '#3D7BF2', Amarelo: '#FFC83D', Rosa: '#FF6FB5', Roxo: '#8E4DE0', Verde: '#19A974', Ciano: '#22C7D6', Laranja: '#F2802E', Marrom: '#8B5A2B', Lima: '#A6D608'};
// paleta dos traços (igual a desenha/raster.py)
export const PAL: Record<string, string> = {preto: '#111111', branco: '#ffffff', cinza: '#8a8a8a', vermelho: '#e53935', laranja: '#fb8c00', amarelo: '#fdd835', verde: '#43a047', azul: '#1e88e5', 'azul claro': '#81d4fa', roxo: '#8e24aa', rosa: '#f48fb1', marrom: '#795548', pele: '#f5c79c'};
export const POP = "'Poppins', sans-serif", MONO = "'JetBrains Mono', monospace", BANG = "'Bangers', 'Poppins', sans-serif";
export const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const C = (px: number, cor = '#000'): React.CSSProperties => ({WebkitTextStroke: `${px}px ${cor}`, paintOrder: 'stroke fill'});
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const hash = (s: string) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h; };
export const claro = (cor: string) => ['Amarelo', 'Lima', 'Ciano', 'Rosa'].includes(cor);
export const ease = (f: number, a: number, b: number) => { const t = interpolate(f, [a, b], [0, 1], cl); return t * t * (3 - 2 * t); };
export const quique = (f: number, a: number, d = 12) => { const t = interpolate(f, [a, a + d], [0, 1], cl); return 1 - Math.cos(t * Math.PI * 2.5) * Math.exp(-t * 4.5) ; };
export const norm = (s: string | null | undefined) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
export const tempo = (ms: number) => (ms >= 60000 ? `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}` : `${(ms / 1000).toFixed(1).replace('.', ',')} s`);
export const sombra = '10px 10px 0 #0007';

// ---------- a mesa de papel kraft ----------
export const Mesa: React.FC<{f: number; tom?: string}> = ({f, tom = KRAFT}) => (
  <AbsoluteFill style={{background: tom}}>
    <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(98deg, #0000 0 22px, #7a5a2a1c 22px 24px), repeating-linear-gradient(8deg, #0000 0 37px, #ffffff26 37px 38px)', backgroundPosition: `${f * 0.3}px ${f * 0.12}px`}} />
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: 0.22}}>
      {Array.from({length: 14}).map((_, i) => { const x = (rnd(i) * 2100 + f * (0.25 + rnd(i + 9) * 0.3)) % 2100 - 90, y = rnd(i + 40) * 1080 + Math.sin(f / 50 + i) * 14; return i % 3 ? <path key={i} d={`M${x} ${y} q14 -22 28 0 t28 0 t28 0`} fill="none" stroke="#5c3d17" strokeWidth={5} strokeLinecap="round" /> : <path key={i} d={`M${x} ${y} l10 22 l22 4 l-17 14 l5 23 l-20 -12 l-20 12 l5 -23 l-17 -14 l22 -4z`} fill="none" stroke="#5c3d17" strokeWidth={4} strokeLinejoin="round" transform={`rotate(${f * 0.3 + i * 40} ${x} ${y + 20})`} />; })}
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0000 48%, #3a240f99 100%)'}} />
  </AbsoluteFill>
);

// ---------- os dez materiais de desenho ----------
const CZ = '#d9dde0', MAD = '#e8cfa0';
const CORPO: Record<string, (c: string) => React.ReactNode> = {
  Vermelho: (c) => <><path d="M38 100 L50 124 L62 100Z" fill="#e9e2d0" /><rect x={34} y={14} width={32} height={88} rx={9} fill={c} /><path d="M34 26 q8 -9 16 0 q8 -9 16 0" fill="none" /><path d="M66 24 h9 v40" fill="none" /></>,
  Azul: (c) => <><rect x={14} y={40} width={72} height={72} rx={12} fill="#f1ece0" /><rect x={23} y={49} width={54} height={54} rx={12} fill={c} /><path d="M72 46 L90 16" fill="none" strokeWidth={7} /><path d="M86 22 l9 -16 l-15 7z" fill={c} /></>,
  Amarelo: (c) => <><path d="M50 26 C70 12 94 34 82 54 C102 70 88 104 62 98 C52 120 20 112 26 88 C2 80 6 48 28 46 C24 30 40 20 50 26Z" fill={c} /><circle cx={88} cy={112} r={7} fill={c} /><circle cx={12} cy={30} r={5} fill={c} /></>,
  Rosa: (c) => <g transform="rotate(7 50 72)"><rect x={30} y={34} width={40} height={80} rx={7} fill={c} /><ellipse cx={50} cy={34} rx={20} ry={7} fill="#ffd0e6" /><path d="M30 96 l10 -6 l8 8 l10 -8 l12 6" fill="none" strokeWidth={3} /></g>,
  Roxo: (c) => <><path d="M38 70 L42 124 H58 L62 70Z" fill={MADEIRA} /><rect x={30} y={54} width={40} height={18} fill={CZ} /><path d="M30 54 Q26 14 50 6 Q74 14 70 54Z" fill={c} /><path d="M42 16 V30 M58 16 V30" fill="none" strokeWidth={2.5} opacity={0.5} /></>,
  Verde: (c) => <><path d="M32 34 L43 12 L50 17 L55 9 L68 34Z" fill={MAD} /><rect x={32} y={34} width={36} height={76} fill={c} /><rect x={32} y={108} width={36} height={15} rx={5} fill="#f2a0a0" /><path d="M44 36V106M56 36V106" fill="none" strokeWidth={2.5} opacity={0.4} /></>,
  Ciano: (c) => <><rect x={26} y={8} width={48} height={116} rx={6} fill={c} /><path d="M26 22h13M26 36h8M26 50h13M26 64h8M26 78h13M26 92h8M26 106h13" fill="none" strokeWidth={3} /></>,
  Laranja: (c) => <><rect x={40} y={102} width={20} height={20} rx={4} fill="#fff" /><path d="M28 20 H72 L66 60 Q78 82 64 102 H36 Q22 82 34 60Z" fill={c} /><rect x={23} y={10} width={54} height={12} rx={3} fill={CZ} /><path d="M40 78 h20" fill="none" strokeWidth={3} opacity={0.45} /></>,
  Marrom: (c) => <><path d="M33 12 L61 7 L70 30 L66 118 L37 123 L29 62Z" fill={c} /><path d="M40 20 L46 36 M58 84 L62 108 M36 92 l6 14" fill="none" strokeWidth={3} opacity={0.5} /></>,
  Lima: (c) => <><path d="M50 116 V128" fill="none" strokeWidth={4} /><path d="M38 100 L46 118 H54 L62 100Z" fill={CZ} /><rect x={36} y={22} width={28} height={80} rx={6} fill={c} /><rect x={42} y={7} width={16} height={16} rx={3} fill={CZ} /><path d="M64 26 h8 v34" fill="none" /></>,
};
const OLHO: Record<string, [number, number]> = {Vermelho: [50, 54], Azul: [50, 72], Amarelo: [52, 62], Rosa: [51, 66], Roxo: [50, 36], Verde: [50, 62], Ciano: [54, 54], Laranja: [50, 44], Marrom: [50, 54], Lima: [50, 52]};
export type Humor = 'normal' | 'feliz' | 'triste' | 'susto';
export const Boneco: React.FC<{cor: string; s: number; f?: number; humor?: Humor; olhar?: [number, number]; coroa?: boolean; lanterna?: boolean; fala?: boolean; bracos?: boolean; style?: React.CSSProperties}> = ({cor, s, f = 0, humor = 'normal', olhar = [0, 0], coroa, lanterna, fala, bracos = true, style}) => {
  const c = COR[cor] ?? '#888', [ex, ey] = OLHO[cor] ?? [50, 56];
  const h = hash(cor), pisca = (f + h * 7) % 97 < 4;
  const w = Math.sin(f * 0.16 + h) * 6;
  const boca = humor === 'feliz' ? `M${ex - 8} ${ey + 13} q8 9 16 0` : humor === 'triste' ? `M${ex - 7} ${ey + 18} q7 -8 14 0` : humor === 'susto' ? '' : `M${ex - 6} ${ey + 15} q6 ${fala ? 4 + 4 * Math.abs(Math.sin(f * 0.6)) : 3} 12 0`;
  return (
    <svg viewBox="-12 -30 124 164" width={s} height={s * 1.32} style={{overflow: 'visible', flexShrink: 0, ...style}}>
      <ellipse cx={50} cy={128} rx={30} ry={5} fill="#0003" />
      {bracos ? <g fill="none" stroke="#111" strokeWidth={5} strokeLinecap="round"><path d={`M28 82 q-16 ${-4 + w} -22 ${-18 + w}`} /><path d={`M72 82 q16 ${-4 - w} 22 ${-18 - w}`} /></g> : null}
      <g stroke="#111" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round">{CORPO[cor]?.(c)}</g>
      {pisca ? <path d={`M${ex - 16} ${ey} h12 M${ex + 4} ${ey} h12`} stroke="#111" strokeWidth={4} strokeLinecap="round" /> : (
        <g><circle cx={ex - 10} cy={ey} r={8.5} fill="#fff" stroke="#111" strokeWidth={3.5} /><circle cx={ex + 10} cy={ey} r={8.5} fill="#fff" stroke="#111" strokeWidth={3.5} /><circle cx={ex - 10 + olhar[0] * 3.5} cy={ey + olhar[1] * 3.5} r={3.8} fill="#111" /><circle cx={ex + 10 + olhar[0] * 3.5} cy={ey + olhar[1] * 3.5} r={3.8} fill="#111" /></g>
      )}
      {humor === 'susto' ? <ellipse cx={ex} cy={ey + 17} rx={5} ry={6} fill="#111" /> : <path d={boca} fill="none" stroke="#111" strokeWidth={4} strokeLinecap="round" />}
      {humor === 'triste' ? <path d={`M${ex - 19} ${ey - 13} l12 4 M${ex + 19} ${ey - 13} l-12 4`} stroke="#111" strokeWidth={3.5} strokeLinecap="round" /> : null}
      {coroa ? <path d="M30 -2 L26 -26 L40 -14 L50 -30 L60 -14 L74 -26 L70 -2Z" fill="#FFD84D" stroke="#111" strokeWidth={5} strokeLinejoin="round" transform={`rotate(${Math.sin(f * 0.1) * 4} 50 0)`} /> : null}
      {lanterna ? <g transform={`rotate(${Math.sin(f * 0.12) * 10} 86 -28)`} stroke="#111" strokeWidth={4} strokeLinejoin="round"><path d="M86 -28 V-16" fill="none" /><rect x={74} y={-16} width={24} height={30} rx={8} fill="#FFF3B0" /><path d="M74 -8h24M74 6h24" fill="none" strokeWidth={2.5} /><circle cx={86} cy={-1} r={5} fill="#F2802E" stroke="none" opacity={0.6 + 0.4 * Math.sin(f * 0.4)} /></g> : null}
    </svg>
  );
};

// ---------- ícones desenhados ----------
export const Icone: React.FC<{n: string; s: number; cor?: string}> = ({n, s, cor = '#111'}) => (
  <svg viewBox="0 0 40 40" width={s} height={s} style={{flexShrink: 0}} fill="none" stroke={cor} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
    {n === 'olho' ? <><path d="M3 20 Q20 4 37 20 Q20 36 3 20Z" /><circle cx={20} cy={20} r={5} fill={cor} /></> : null}
    {n === 'relogio' ? <><circle cx={20} cy={21} r={14} /><path d="M20 12 V21 L27 25 M15 4 h10" /></> : null}
    {n === 'cadeado' ? <><rect x={8} y={18} width={24} height={18} rx={4} fill={cor} /><path d="M13 18 V12 a7 7 0 0 1 14 0 V18" /></> : null}
    {n === 'ok' ? <path d="M6 21 L16 31 L34 9" strokeWidth={6} /> : null}
    {n === 'x' ? <path d="M8 8 L32 32 M32 8 L8 32" strokeWidth={6} /> : null}
    {n === 'lapis' ? <><path d="M6 34 L10 22 L28 4 L36 12 L18 30Z" /><path d="M10 22 L18 30" /></> : null}
    {n === 'chat' ? <path d="M5 8 H35 V27 H18 L10 35 V27 H5Z" /> : null}
  </svg>
);

// ---------- fita crepe + folha ----------
export const Fita: React.FC<{x: number | string; y: number | string; rot: number; w?: number}> = ({x, y, rot, w = 120}) => <div style={{position: 'absolute', left: x, top: y, width: w, height: 38, background: '#f1e3b4d9', border: '2px solid #0002', transform: `rotate(${rot}deg)`, boxShadow: '2px 3px 0 #0002', zIndex: 3}} />;
export const Folha: React.FC<{w: number; children?: React.ReactNode; style?: React.CSSProperties; fita?: boolean}> = ({w, children, style, fita = true}) => (
  <div style={{position: 'relative', width: w, height: w * 0.75, ...style}}>
    <div style={{position: 'absolute', inset: 0, background: FOLHA, border: `${Math.max(3, w / 180)}px solid #111`, borderRadius: w / 90, boxShadow: `${w / 80}px ${w / 80}px 0 #0006`, overflow: 'hidden'}}>{children}</div>
    {fita ? <><Fita x={-w * 0.035} y={-w * 0.012} rot={-38} w={w * 0.13} /><Fita x={w * 0.9} y={-w * 0.012} rot={36} w={w * 0.13} /></> : null}
  </div>
);
export const Etiqueta: React.FC<{children: React.ReactNode; fs?: number; bg?: string; cor?: string; rot?: number; style?: React.CSSProperties}> = ({children, fs = 26, bg = POST, cor = TINTA, rot = 0, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: fs * 0.3, fontFamily: POP, fontWeight: 800, fontSize: fs, lineHeight: 1.15, color: cor, background: bg, border: '4px solid #111', borderRadius: 10, padding: `2px ${fs * 0.5}px`, boxShadow: '5px 5px 0 #0007', whiteSpace: 'nowrap', transform: `rotate(${rot}deg)`, ...style}}>{children}</div>
);

// ---------- os traços reais, desenhados um a um ----------
const P = (p: any): [number, number] => [Math.max(-50, Math.min(850, Number(p?.[0]) || 0)), Math.max(-50, Math.min(650, Number(p?.[1]) || 0))];
export const tracosDe = (d: any, tq: number): any[] => d.tiques.filter((t: any) => t.tique <= tq).flatMap((t: any) => t.novos ?? []);
export const corTraco = (t: any) => PAL[t.cor] ?? (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t.cor ?? '') ? t.cor : '#111111');
export const pontosDe = (t: any): [number, number][] => {
  if (t.tipo === 'circulo') { const [x, y] = P(t.centro), r = Math.max(1, Math.min(400, Number(t.raio) || 1)); return Array.from({length: 25}).map((_, i) => [x + r * Math.cos((i / 24) * Math.PI * 2 - Math.PI / 2), y + r * Math.sin((i / 24) * Math.PI * 2 - Math.PI / 2)]); }
  if (t.tipo === 'retangulo') { const [a, b] = P(t.de), [c, d] = P(t.ate); return [[a, b], [c, b], [c, d], [a, d], [a, b]]; }
  const ps = (t.pontos ?? []).slice(0, 200).map(P);
  if (t.tipo === 'poligono' && ps.length) ps.push(ps[0]);
  return ps.length === 1 ? [ps[0], ps[0]] : ps;
};
export const centroDe = (t: any): [number, number] => { const ps = pontosDe(t); return [ps.reduce((a, p) => a + p[0], 0) / Math.max(1, ps.length), ps.reduce((a, p) => a + p[1], 0) / Math.max(1, ps.length)]; };
const noCaminho = (ps: [number, number][], k: number): [number, number] => {
  if (ps.length < 2) return ps[0] ?? [0, 0];
  const L = ps.slice(1).map((p, i) => Math.hypot(p[0] - ps[i][0], p[1] - ps[i][1]));
  let r = L.reduce((a, b) => a + b, 0) * k;
  for (let i = 0; i < L.length; i++) { if (r <= L[i] || i === L.length - 1) { const u = L[i] ? Math.min(1, r / L[i]) : 0; return [ps[i][0] + (ps[i + 1][0] - ps[i][0]) * u, ps[i][1] + (ps[i + 1][1] - ps[i][1]) * u]; } r -= L[i]; }
  return ps[ps.length - 1];
};
export const Traco: React.FC<{t: any; k: number}> = ({t, k}) => {
  if (k <= 0) return null;
  const c = corTraco(t), e = Math.max(1, Math.min(40, Number(t.espessura ?? 6) || 6)), cheio = !!t.preenchido && t.tipo !== 'linha';
  const kl = cheio ? Math.min(1, k / 0.6) : k, kf = cheio ? interpolate(k, [0.5, 1], [0, 1], cl) : 0;
  const base = {stroke: c, strokeWidth: cheio && t.tipo === 'poligono' ? 2.5 : e, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, pathLength: 1, strokeDasharray: '1 1', strokeDashoffset: 1 - kl, fill: cheio ? c : 'none', fillOpacity: kf};
  if (t.tipo === 'circulo') { const [x, y] = P(t.centro); return <circle cx={x} cy={y} r={Math.max(1, Math.min(400, Number(t.raio) || 1))} transform={`rotate(-90 ${x} ${y})`} {...base} />; }
  if (t.tipo === 'retangulo') { const [a, b] = P(t.de), [c2, d] = P(t.ate); return <rect x={Math.min(a, c2)} y={Math.min(b, d)} width={Math.abs(c2 - a)} height={Math.abs(d - b)} {...base} strokeLinejoin="miter" />; }
  const ps = pontosDe(t);
  if (!ps.length) return null;
  return <polyline points={ps.map((p) => p.join(',')).join(' ')} {...base} />;
};
// vis = quantos traços já entraram (fracionário: o último está no meio); fant = índice a partir do qual é "novo" (o antes fica a 40%)
export const Desenho: React.FC<{tr: any[]; vis: number; fant?: number; fantK?: number; lapis?: string; children?: React.ReactNode}> = ({tr, vis, fant, fantK = 0, lapis, children}) => {
  const i = Math.min(tr.length - 1, Math.floor(vis)), k = vis - i;
  const ponta = lapis && vis > 0 && vis < tr.length ? noCaminho(pontosDe(tr[i]), Math.min(1, (tr[i].preenchido ? k / 0.6 : k))) : null;
  return (
    <svg viewBox="0 0 800 600" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
      {tr.map((t, j) => <g key={j} opacity={fant != null && j < fant ? 1 - 0.6 * fantK : 1}><Traco t={t} k={Math.max(0, Math.min(1, vis - j))} /></g>)}
      {children}
      {ponta ? <g transform={`translate(${ponta[0]} ${ponta[1]}) rotate(${-32 + Math.sin(vis * 9) * 6})`} stroke="#111" strokeWidth={4} strokeLinejoin="round"><path d="M0 0 L12 -22 L28 -14Z" fill={MAD} /><path d="M12 -22 L52 -100 L68 -92 L28 -14Z" fill={lapis} /><path d="M0 0 L5 -9 L11 -6Z" fill="#111" /></g> : null}
    </svg>
  );
};

// a dica em casas monoespaçadas; a letra nova cai do teto e pisca
export const Dica: React.FC<{dica: string; antes?: string; fq?: number; s?: number}> = ({dica, antes, fq = 999, s = 56}) => {
  const cs = dica.split(' '), an = (antes ?? dica).split(' ');
  return (
    <div style={{display: 'flex', gap: s * 0.14}}>
      {cs.map((ch, i) => { const nova = ch !== '_' && an[i] !== ch; const cai = nova ? quique(fq, 0, 16) : 1; return (
        <div key={i} style={{width: s, height: s * 1.25, background: nova && fq < 90 && Math.floor(fq / 7) % 2 ? POST : FOLHA, border: '4px solid #111', borderRadius: 8, boxShadow: '4px 4px 0 #0006', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: s * 0.92, lineHeight: 1, color: TINTA}}>
          <span style={{transform: `translateY(${nova ? (1 - cai) * -260 : 0}px)`, opacity: nova && fq < 0 ? 0 : 1}}>{ch === '_' ? '' : ch}</span>
        </div>
      ); })}
    </div>
  );
};
