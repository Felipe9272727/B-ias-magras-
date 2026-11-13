// JOGO DE CONFIANÇA: desenhos próprios (nada de emoji). Telefone-personagem, ícones, feltro, alicate, cadeado.
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';

export const FELTRO = '#10261F', PAPEL = '#F4EBD0', ESCURO = '#9E1B1F', AMAR = '#FFC83D', TINTA = '#1d1a12';
export const COR: Record<string, string> = {Vermelho: '#E0262B', Azul: '#3D7BF2', Verde: '#19A974', Amarelo: '#FFC83D', Rosa: '#FF6FB5', Laranja: '#F2802E', Roxo: '#8E4DE0', Ciano: '#22C7D6'};
export const FIO: Record<string, string> = {vermelho: ESCURO, azul: '#2E6BE6', amarelo: '#F5C518', verde: '#1E9E5A', branco: '#F2F2F2', preto: '#1A1A1A'};
export const CORES = ['Vermelho', 'Azul', 'Verde', 'Amarelo', 'Rosa', 'Laranja', 'Roxo', 'Ciano'];
export const POP = "'Poppins', sans-serif", MONO = "'JetBrains Mono', monospace", BANG = "'Bangers', 'Poppins', sans-serif";
export const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const C = (px: number, cor = '#000'): React.CSSProperties => ({WebkitTextStroke: `${px}px ${cor}`, paintOrder: 'stroke fill'});
export const sombra = '10px 10px 0 #000';
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const hash = (s: string) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h; };
export const claro = (cor: string) => ['Amarelo', 'Ciano', 'Rosa'].includes(cor);
// "o/a" certo para cada cor (a Rosa é "a")
export const DO = (cor: string) => (cor === 'Rosa' ? 'DA' : 'DO');

export const Feltro: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at ${50 + 4 * Math.sin(f / 170)}% ${44 + 3 * Math.cos(f / 210)}%, #22503f 0%, #173529 38%, ${FELTRO} 68%, #050d0a 100%)`}}>
    <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(45deg, #ffffff07 0 2px, transparent 2px 7px), repeating-linear-gradient(-45deg, #00000012 0 2px, transparent 2px 7px)', backgroundPosition: `${f * 0.25}px ${f * 0.12}px`}} />
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(#ffffff0d 1.2px, transparent 1.4px)', backgroundSize: '9px 9px', backgroundPosition: `${-f * 0.15}px ${f * 0.08}px`}} />
    <AbsoluteFill style={{boxShadow: 'inset 0 0 260px 60px #000b'}} />
  </AbsoluteFill>
);

export type Humor = 'normal' | 'bravo' | 'triste' | 'feliz' | 'morto' | 'medo';
// telefone de disco com cara: olhos piscam e olham, o miolo do disco é a boca, o fone sai do gancho
export const Telefone: React.FC<{cor: string; s: number; f?: number; fora?: boolean; cinza?: boolean; falando?: boolean; humor?: Humor; olhar?: [number, number]; fantasia?: string | null; caindo?: number}> = ({cor, s, f = 0, fora, cinza, falando, humor = 'normal', olhar = [0, 0], fantasia, caindo = 0}) => {
  const c = cinza ? '#6a7078' : COR[cor] ?? '#888';
  const sd = hash(cor);
  const pisca = !cinza && (f + sd * 7) % 97 < 4;
  const boca = falando ? 5 + 6 * Math.abs(Math.sin(f * 0.55 + sd)) : 0;
  const giro = falando ? f * 3 : Math.sin(f / 40 + sd) * 8;
  const bob = fora ? Math.sin(f * 0.3 + sd) * 3 : 0;
  const [ox, oy] = olhar;
  const olho = (x: number) => humor === 'morto' ? (
    <g key={x} stroke="#111" strokeWidth={5} strokeLinecap="round"><path d={`M${x - 9} 91 L${x + 9} 109 M${x + 9} 91 L${x - 9} 109`} /></g>
  ) : (
    <g key={x}>
      <ellipse cx={x} cy={100} rx={12} ry={pisca ? 1.5 : humor === 'medo' ? 16 : cinza ? 7 : 14} fill="#fff" stroke="#111" strokeWidth={4} />
      {pisca ? null : <circle cx={x + ox * 5} cy={100 + oy * 5 + (cinza ? 2 : 0)} r={humor === 'medo' ? 4 : 6} fill="#111" />}
      {humor === 'bravo' ? <path d={x < 100 ? `M${x - 14} 80 L${x + 12} 90` : `M${x + 14} 80 L${x - 12} 90`} stroke="#111" strokeWidth={6} strokeLinecap="round" /> : null}
      {humor === 'triste' || humor === 'medo' ? <path d={x < 100 ? `M${x - 14} 88 L${x + 10} 80` : `M${x + 14} 88 L${x - 10} 80`} stroke="#111" strokeWidth={5} strokeLinecap="round" /> : null}
      {humor === 'feliz' ? <path d={`M${x - 13} 104 Q${x} 92 ${x + 13} 104 L${x + 13} 116 L${x - 13} 116 Z`} fill={c} /> : null}
    </g>
  );
  const fone = fora ? `translate(-22 ${-34 + bob}) rotate(-20 100 36)` : caindo ? `translate(${caindo * 46} ${caindo * 70}) rotate(${caindo * 115} 100 36)` : '';
  return (
    <svg width={s} height={s * 0.95} viewBox="0 0 200 190" style={{overflow: 'visible', display: 'block'}}>
      <ellipse cx={100} cy={176} rx={84} ry={10} fill="#0007" />
      <path d={fora ? 'M20 18 q-16 8 0 16 q16 8 0 16 q-16 8 0 16 q16 8 0 16 q-16 8 0 16 q16 8 4 18' : 'M34 54 q-16 7 0 14 q16 7 0 14 q-16 7 0 14 q16 7 0 14 q-10 6 -6 14'} fill="none" stroke="#111" strokeWidth={5} strokeLinecap="round" />
      <rect x={58} y={46} width={16} height={20} rx={4} fill="#222" stroke="#111" strokeWidth={4} />
      <rect x={126} y={46} width={16} height={20} rx={4} fill="#222" stroke="#111" strokeWidth={4} />
      <path d="M38 78 Q40 62 62 60 L138 60 Q160 62 162 78 L182 150 Q185 172 164 172 L36 172 Q15 172 18 150 Z" fill={c} stroke="#111" strokeWidth={6} strokeLinejoin="round" />
      <path d="M21 142 L179 142 L182 150 Q185 169 164 169 L36 169 Q15 169 18 150 Z" fill="#0000002e" />
      <path d="M48 74 Q56 67 78 67" stroke="#ffffff88" strokeWidth={6} strokeLinecap="round" fill="none" />
      <circle cx={100} cy={122} r={35} fill={PAPEL} stroke="#111" strokeWidth={5} />
      <g transform={`rotate(${giro} 100 122)`}>{Array.from({length: 10}).map((_, i) => { const a = (i / 10) * Math.PI * 2; return <circle key={i} cx={100 + 25 * Math.cos(a)} cy={122 + 25 * Math.sin(a)} r={4.6} fill="#111" />; })}</g>
      {boca ? <ellipse cx={100} cy={122} rx={11} ry={boca} fill="#3a0d0d" stroke="#111" strokeWidth={4} /> : humor === 'triste' || humor === 'morto' || humor === 'medo' ? <path d="M90 127 Q100 116 110 127" fill="none" stroke="#111" strokeWidth={5} strokeLinecap="round" /> : <path d="M89 119 Q100 131 111 119" fill="none" stroke="#111" strokeWidth={5} strokeLinecap="round" />}
      {[50, 150].map(olho)}
      {fantasia === 'Ninja' ? (
        <g><path d="M24 96 Q100 76 176 96 L178 112 Q100 96 22 112 Z" fill="#15151a" stroke="#000" strokeWidth={4} /><path d="M176 98 l26 -10 l-4 14 l14 6 l-34 2 Z" fill="#15151a" stroke="#000" strokeWidth={3} />
          {[50, 150].map((x) => <g key={x}><ellipse cx={x} cy={102} rx={11} ry={5} fill="#fff" /><circle cx={x + ox * 4} cy={102} r={3.6} fill="#111" /></g>)}</g>
      ) : null}
      {fantasia === 'Palhaço' ? (
        <g stroke="#111" strokeWidth={4}>
          {[[24, 76, '#ff6fb5'], [14, 96, '#3d7bf2'], [176, 76, '#19a974'], [186, 96, '#ffc83d']].map(([x, y, k], i) => <circle key={i} cx={x as number} cy={y as number} r={15} fill={k as string} />)}
          <circle cx={100} cy={122} r={15} fill="#e0262b" /><circle cx={95} cy={117} r={4} fill="#fff" stroke="none" />
        </g>
      ) : null}
      <g transform={fone}>
        <path d="M30 44 Q30 16 58 16 L142 16 Q170 16 170 44 L170 50 Q170 57 163 57 L141 57 Q134 57 134 50 L132 40 L68 40 L66 50 Q66 57 59 57 L37 57 Q30 57 30 50 Z" fill={c} stroke="#111" strokeWidth={6} strokeLinejoin="round" />
        <path d="M44 28 Q50 23 70 23 L120 23" stroke="#ffffff77" strokeWidth={5} strokeLinecap="round" fill="none" />
        {fantasia === 'Palhaço' ? <g stroke="#111" strokeWidth={4}><path d="M82 16 L100 -30 L118 16 Z" fill="#ffc83d" /><circle cx={100} cy={-32} r={8} fill="#e0262b" /></g> : null}
      </g>
      {falando ? [0, 1, 2].map((i) => { const k = ((f * 0.06 + i / 3) % 1); return <path key={i} d={`M${176 + k * 26} ${40 - k * 16} q${10 + k * 8} ${22} 0 ${44 + k * 20}`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.9 * (1 - k)} />; }) : null}
    </svg>
  );
};

// ícones (viewBox 48)
export const Icone: React.FC<{n: string; s: number; cor?: string; aberto?: boolean}> = ({n, s, cor = AMAR, aberto}) => {
  const st = {stroke: '#111', strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  let g: React.ReactNode = null;
  if (n === 'aperto') g = <g {...st}><rect x={1} y={17} width={9} height={17} rx={2} fill={COR.Vermelho} /><rect x={38} y={17} width={9} height={17} rx={2} fill="#fff" /><path d="M10 19 L18 15 L25 19 L32 15 L38 19 L38 32 L33 34 L27 40 Q24 43 21 40 L14 34 L10 32 Z" fill="#F6D2A8" /><path d="M18 29 l5 5 M23 26 l5 5 M28 23 l5 5" fill="none" /></g>;
  if (n === 'faca') g = <g {...st}><path d="M5 43 L27 12 Q33 6 36 13 L13 44 Z" fill="#e3ebf0" /><path d="M10 40 L30 14" stroke="#9fb0ba" strokeWidth={2} /><path d="M27 12 L37 3 L45 10 L36 18 Z" fill="#6b4226" /><path d="M24 9 L39 21" strokeWidth={5} /></g>;
  if (n === 'cadeado') g = <g {...st}><path d={aberto ? 'M13 22 V13 Q13 4 22 4 Q31 4 31 11' : 'M14 22 V14 Q14 4 24 4 Q34 4 34 14 V22'} fill="none" strokeWidth={5} stroke="#111" /><path d={aberto ? 'M13 22 V13 Q13 4 22 4 Q31 4 31 11' : 'M14 22 V14 Q14 4 24 4 Q34 4 34 14 V22'} fill="none" strokeWidth={2} stroke="#d9dfe3" /><rect x={7} y={21} width={34} height={24} rx={5} fill={cor} /><circle cx={24} cy={31} r={4} fill="#111" /><path d="M24 32 V39" strokeWidth={4} /></g>;
  if (n === 'tesoura') g = <g {...st}><path d="M14 30 L42 6 M14 18 L42 42" strokeWidth={5} stroke="#cfd8dd" /><path d="M14 30 L42 6 M14 18 L42 42" strokeWidth={1.5} /><circle cx={10} cy={34} r={7} fill="none" stroke={ESCURO} strokeWidth={5} /><circle cx={10} cy={14} r={7} fill="none" stroke={ESCURO} strokeWidth={5} /></g>;
  if (n === 'lupa') g = <g {...st}><path d="M30 30 L44 44" strokeWidth={8} /><circle cx={20} cy={20} r={15} fill="#bfeaf5" strokeWidth={5} /><path d="M12 17 Q14 10 21 10" stroke="#fff" fill="none" /></g>;
  if (n === 'escuta') g = <g {...st}><path d="M8 30 V22 Q8 6 24 6 Q40 6 40 22 V30" fill="none" strokeWidth={5} /><rect x={3} y={26} width={11} height={17} rx={4} fill={cor} /><rect x={34} y={26} width={11} height={17} rx={4} fill={cor} /></g>;
  if (n === 'mascara') g = <g {...st}><path d="M4 14 Q24 4 44 14 Q46 34 34 40 Q28 30 24 30 Q20 30 14 40 Q2 34 4 14 Z" fill="#fff" /><ellipse cx={15} cy={21} rx={5} ry={3.5} fill="#111" /><ellipse cx={33} cy={21} rx={5} ry={3.5} fill="#111" /></g>;
  if (n === 'envelope') g = <g {...st}><rect x={4} y={10} width={40} height={28} rx={3} fill={PAPEL} /><path d="M4 12 L24 28 L44 12" fill="none" /></g>;
  if (n === 'megafone') g = <g {...st}><path d="M6 19 L24 15 L38 5 V43 L24 33 L6 29 Z" fill={cor} /><path d="M12 30 L15 43 H22 L20 32" fill="#ddd" /><path d="M42 16 Q46 24 42 32" fill="none" stroke="#fff" /></g>;
  if (n === 'olho') g = <g {...st}><path d="M3 24 Q24 4 45 24 Q24 44 3 24 Z" fill="#fff" /><circle cx={24} cy={24} r={8} fill={cor} /><circle cx={24} cy={24} r={3.5} fill="#111" /></g>;
  if (n === 'fone') g = <g {...st}><path d="M4 22 Q4 8 16 8 L32 8 Q44 8 44 22 L44 28 L32 28 L31 20 L17 20 L16 28 L4 28 Z" fill={cor} /><path d="M24 30 q-6 4 0 8 q6 4 0 8" fill="none" /></g>;
  if (n === 'trofeu') g = <g {...st}><path d="M12 8 H5 Q5 22 14 23 M36 8 H43 Q43 22 34 23" fill="none" strokeWidth={4} /><path d="M11 4 H37 V16 Q37 28 24 30 Q11 28 11 16 Z" fill={cor} /><path d="M20 30 H28 V37 H20 Z" fill={cor} /><rect x={13} y={37} width={22} height={7} rx={2} fill="#6b4226" /><path d="M16 9 V16 Q16 21 20 23" stroke="#fff" fill="none" /></g>;
  if (n === 'coroa') g = <g {...st}><path d="M5 38 L3 14 L15 24 L24 6 L33 24 L45 14 L43 38 Z" fill={cor} /><rect x={5} y={36} width={38} height={7} rx={2} fill="#e8a81a" /><circle cx={24} cy={8} r={3} fill={ESCURO} /></g>;
  if (n === 'moeda') g = <g {...st}><circle cx={24} cy={24} r={19} fill={cor} /><circle cx={24} cy={24} r={13} fill="none" stroke="#b9860a" /><path d="M24 15 V33" stroke="#b9860a" /></g>;
  if (n === 'chiado') g = <g {...st}><path d="M3 24 L9 10 L15 36 L21 14 L27 38 L33 12 L39 32 L45 22" fill="none" stroke="#111" strokeWidth={7} /><path d="M3 24 L9 10 L15 36 L21 14 L27 38 L33 12 L39 32 L45 22" fill="none" stroke="#e9eef0" strokeWidth={3} /></g>;
  if (n === 'check') g = <path d="M8 26 L20 37 L41 12" fill="none" stroke={cor} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />;
  if (n === 'xis') g = <path d="M10 10 L38 38 M38 10 L10 38" fill="none" stroke={cor} strokeWidth={8} strokeLinecap="round" />;
  return <svg width={s} height={s} viewBox="0 0 48 48" style={{overflow: 'visible', display: 'block', flexShrink: 0}}>{g}</svg>;
};

// estrela de explosão (pontas)
export const estrela = (n: number, R: number, r: number, rot = 0, sd = 0) => Array.from({length: n * 2}).map((_, i) => { const a = rot + (i / (n * 2)) * Math.PI * 2; const q = (i % 2 ? r : R) * (0.86 + 0.28 * rnd(i + sd)); return `${(q * Math.cos(a)).toFixed(1)},${(q * Math.sin(a)).toFixed(1)}`; }).join(' ');

// alicate: origem na ponta das garras; ang = abertura
export const Alicate: React.FC<{ang: number}> = ({ang}) => (
  <g>
    {[-1, 1].map((k) => (
      <g key={k} transform={`rotate(${k * ang} 0 -52)`}>
        <path d={`M${k * 4} 2 L${k * 15} -40 L${k * 3} -62 L${-k * 6} -40 Z`} fill="#aeb9c0" stroke="#111" strokeWidth={5} strokeLinejoin="round" />
        <path d={`M${-k * 4} -52 Q${-k * 30} -150 ${-k * 26} -300`} fill="none" stroke="#111" strokeWidth={34} strokeLinecap="round" />
        <path d={`M${-k * 4} -52 Q${-k * 30} -150 ${-k * 26} -300`} fill="none" stroke={ESCURO} strokeWidth={24} strokeLinecap="round" />
        <path d={`M${-k * 22} -130 Q${-k * 32} -200 ${-k * 30} -280`} fill="none" stroke="#ffffff44" strokeWidth={5} strokeLinecap="round" />
      </g>
    ))}
    <circle cx={0} cy={-52} r={9} fill="#e9eef0" stroke="#111" strokeWidth={4} />
  </g>
);

// rótulo de papel torto
export const Etiqueta: React.FC<{children: React.ReactNode; fs?: number; rot?: number; bg?: string; cor?: string; style?: React.CSSProperties}> = ({children, fs = 26, rot = -3, bg = PAPEL, cor = TINTA, style}) => (
  <div style={{fontFamily: POP, fontWeight: 800, fontSize: fs, lineHeight: 1.15, color: cor, background: bg, border: '4px solid #111', borderRadius: 8, padding: '2px 14px', transform: `rotate(${rot}deg)`, boxShadow: '5px 5px 0 #000a', whiteSpace: 'nowrap', ...style}}>{children}</div>
);

export const ease = (f: number, a: number, b: number) => { const t = interpolate(f, [a, b], [0, 1], cl); return t * t * (3 - 2 * t); };
