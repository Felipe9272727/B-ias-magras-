// TRIBUNAL DAS IAs (Assassinato no Museu do Farol): peças-base do "Tribunal de Pedra Alta".
// Vila de pescadores: madeira de navio, latão, pergaminho. Personagens = pedras lapidadas com rosto e roupa de recorte de papel.
// Tudo SVG (sem emoji). Pergaminho + luz âmbar + lacre = o que só o público vê; madeira e latão = o que está no jogo.
import React from 'react';
import {interpolate} from 'remotion';

export const NOITE = '#0F1B2D', MAD_E = '#5B3A24', MAD_C = '#8A5A36', LATAO = '#C9A227', PERG = '#F1E6CF', LUZ = '#FFE29A', CHUMBO = '#3A3F47';
export const TINTA = '#1E150D', AMBAR = '#D98A1E', VINHO = '#6E1F2A', MARINHO = '#1B2A4E', LACRE = '#8E2A1C', CHUVA = '#5E6B7A';
export const COR: Record<string, string> = {Vermelho: '#D7263D', Azul: '#2F6BD8', Amarelo: '#F2B705', Rosa: '#F49AC2', Roxo: '#8E44AD', Laranja: '#E8871E', Verde: '#1E9E6A', Ciano: '#1FB5C9', Lima: '#A7C93A'};
export const NOME: Record<string, string> = {Vermelho: 'Rubi', Azul: 'Safira', Amarelo: 'Topázio', Rosa: 'Quartzo', Roxo: 'Ametista', Laranja: 'Âmbar', Verde: 'Jade', Ciano: 'Turquesa', Lima: 'Peridoto'};
export const FAROL_COR: Record<string, string> = {S: '#5AA8FF', J: '#3FE0A0'};
export const ROD_NOME: Record<string, string> = {S: 'RODADA DA SAFIRA', J: 'RODADA DA JADE'};
export const POP = "'Poppins', sans-serif", MONO = "'JetBrains Mono', monospace", BANG = "'Bangers', 'Poppins', sans-serif";
export const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const C = (px: number, cor = '#000'): React.CSSProperties => ({WebkitTextStroke: `${px}px ${cor}`, paintOrder: 'stroke fill'});
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const hash = (s: string) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h; };
export const claro = (cor: string) => ['Amarelo', 'Lima', 'Ciano', 'Rosa'].includes(cor);
export const ease = (f: number, a: number, b: number) => { if (b <= a) return f >= a ? 1 : 0; const t = interpolate(f, [a, b], [0, 1], cl); return t * t * (3 - 2 * t); };
export const janela = (f: number, a: number, b: number, e = 10) => ease(f, a, a + e) * (1 - ease(f, b - e, b));
export const quique = (f: number, a: number, d = 12) => { const t = interpolate(f, [a, a + d], [0, 1], cl); return 1 - Math.cos(t * Math.PI * 2.5) * Math.exp(-t * 4.5); };
export const norm = (s: string | null | undefined) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
export const sombra = '10px 10px 0 #0008';
export const mistura = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, k))).toString(16).padStart(2, '0')).join('')}`;
};

// ---------- papéis por rodada (o mesmo modelo muda de cadeira entre as rodadas) ----------
export type Papel = 'terno' | 'advogada' | 'delegada' | 'assistente' | 'delegado' | 're' | 'juiz' | 'promotor' | 'vigia' | 'pescador';
export const papelDe = (cor: string, rod?: string | null): Papel => {
  if (cor === 'Vermelho') return 'terno';
  if (cor === 'Azul') return rod === 'J' ? 'delegada' : 'advogada';
  if (cor === 'Verde') return rod === 'J' ? 'advogada' : 'assistente';
  if (cor === 'Ciano') return rod === 'J' ? 'assistente' : 'delegado';
  return ({Rosa: 're', Roxo: 'juiz', Laranja: 'promotor', Amarelo: 'vigia', Lima: 'pescador'} as Record<string, Papel>)[cor] ?? 're';
};
export const ROTULO: Record<Papel, string> = {terno: 'TESTEMUNHA', advogada: 'ADVOGADA', delegada: 'DELEGADA (NÃO FALA)', assistente: 'ASSISTENTE', delegado: 'DELEGADO (NÃO FALA)', re: 'A RÉ', juiz: 'JUIZ', promotor: 'PROMOTOR', vigia: 'VIGIA', pescador: 'PESCADOR'};
export const rotuloDe = (cor: string, rod?: string | null) => ROTULO[papelDe(cor, rod)] + (rod ? ` · ${ROD_NOME[rod]}` : '');

// ---------- a pedra lapidada (cabeça) ----------
const poli = (n: number, rx: number, ry: number, rot = 0, cx = 100, cy = 92): [number, number][] => Array.from({length: n}).map((_, i) => { const a = rot + (i / n) * Math.PI * 2; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
const FORMA: Record<string, () => [number, number][]> = {
  Vermelho: () => poli(8, 70, 64, Math.PI / 8),
  Azul: () => poli(12, 60, 72, 0),
  Amarelo: () => [[100, 14], [146, 44], [150, 128], [100, 166], [50, 128], [54, 44]],
  Rosa: () => poli(6, 70, 68, Math.PI / 6),
  Lima: () => [[100, 18], [162, 70], [138, 150], [62, 150], [38, 70]],
  Verde: () => poli(18, 66, 64, 0),
  Ciano: () => poli(16, 68, 62, 0.2).map(([x, y], i) => [x + Math.sin(i * 2.1) * 5, y + Math.cos(i * 1.7) * 4]),
  Laranja: () => Array.from({length: 20}).map((_, i) => { const t = (i / 20) * Math.PI * 2; const r = 62 * (1 - 0.55 * Math.max(0, -Math.sin(t)) ** 3); return [100 + r * Math.cos(t) * (1 - 0.35 * Math.max(0, -Math.sin(t))), 104 + r * Math.sin(t) * 1.12] as [number, number]; }),
};
const LISA = ['Verde', 'Ciano', 'Laranja'];
const pts = (p: [number, number][]) => p.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' ');

export type Humor = 'normal' | 'feliz' | 'triste' | 'susto' | 'cinico' | 'bravo';
type PedraP = {cor: string; s: number; f?: number; rod?: string | null; humor?: Humor; fala?: boolean; olhar?: [number, number]; silh?: boolean; gesto?: number; busto?: boolean; maoBolso?: boolean; semAnel?: boolean; cadeados?: number; cabecaBaixa?: number; brilho?: number; style?: React.CSSProperties; papel?: Papel};
export const Pedra: React.FC<PedraP> = ({cor, s, f = 0, rod, humor = 'normal', fala, olhar = [0, 0], silh, gesto = 0, busto, maoBolso, semAnel, cadeados = 0, cabecaBaixa = 0, brilho = 0, style, papel}) => {
  const pp = papel ?? papelDe(cor, rod);
  const c = COR[cor] ?? '#999', h = hash(cor);
  const F = (x: string) => (silh ? '#080c14' : x);
  const L = silh ? cor === 'Azul' ? '#5AA8FF' : cor === 'Verde' ? '#3FE0A0' : COR[cor] : '#111';
  const sw = silh ? 6 : 5;
  const pisca = (f + h * 7) % 113 < 4;
  const resp = Math.sin(f * 0.09 + h) * 1.6;
  const forma = (FORMA[cor] ?? FORMA.Rosa)();
  const cx = forma.reduce((a, p) => a + p[0], 0) / forma.length, cy = forma.reduce((a, p) => a + p[1], 0) / forma.length;
  const mesa = forma.map(([x, y]) => [cx + (x - cx) * 0.52, cy - 8 + (y - cy) * 0.5] as [number, number]);
  // roupa (recorte de papel)
  const ROUPA: Record<Papel, string> = {terno: '#23262E', advogada: cor === 'Verde' ? '#13603F' : '#1C3D86', delegada: '#1E2B45', assistente: cor === 'Verde' ? '#7FC9A2' : '#2C7F8C', delegado: '#1E2B45', re: '#A98292', juiz: '#2A1636', promotor: '#8A4410', vigia: '#22345E', pescador: '#4E5B2C'};
  const roupa = ROUPA[pp];
  const mao = mistura(c, '#ffffff', 0.35);
  const g = Math.max(0, Math.min(1, gesto));
  const ombE: [number, number] = [56, 182], ombD: [number, number] = [144, 182];
  const maoE: [number, number] = maoBolso ? [74, 238] : [40 - g * 16 + Math.sin(f * 0.11 + h) * 2, 246 - g * 96], maoD: [number, number] = [162 + Math.sin(f * 0.1 + h + 1) * 2, 246];
  const ey = 88 + (cor === 'Amarelo' ? -4 : cor === 'Lima' ? 6 : cor === 'Laranja' ? 16 : 0), ex = 100;
  const sob = humor === 'bravo' ? 6 : humor === 'triste' ? -6 : humor === 'cinico' ? 0 : 0;
  const boca = humor === 'feliz' ? `M${ex - 14} ${ey + 22} q14 14 28 0` : humor === 'triste' ? `M${ex - 12} ${ey + 30} q12 -10 24 0` : humor === 'cinico' ? `M${ex - 12} ${ey + 25} q14 6 26 -5` : humor === 'bravo' ? `M${ex - 12} ${ey + 27} h24` : `M${ex - 11} ${ey + 24} q11 ${fala ? 6 + 8 * Math.abs(Math.sin(f * 0.55)) : 5} 22 0`;
  const corpo = (
    <g stroke={L} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
      {pp === 'promotor' ? <path d="M30 278 Q40 186 100 168 Q160 186 170 278Z" fill={F('#5C2A08')} /> : null}
      <path d={`M46 280 L54 ${186 + resp} Q100 ${160 + resp} 146 ${186 + resp} L154 280Z`} fill={F(roupa)} />
      {pp === 'terno' ? <><path d="M86 168 L100 214 L114 168Z" fill={F('#EDE8DC')} /><path d="M96 180 L100 214 L104 180 L100 174Z" fill={F('#6E1F2A')} /><path d="M80 170 L100 228 L72 200Z M120 170 L100 228 L128 200Z" fill={F('#181a20')} /></> : null}
      {pp === 'advogada' || pp === 'juiz' || pp === 'promotor' ? <><path d="M90 170 h20 v26 l-10 6 l-10 -6Z" fill={F('#F4F1EA')} /><path d="M100 172 V200" fill="none" strokeWidth={2.5} /></> : null}
      {pp === 'promotor' ? <>{[56, 144].map((x) => <g key={x}><rect x={x - 22} y={176} width={44} height={14} rx={5} fill={F(LATAO)} />{[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M${x - 18 + k * 9} 190 v12`} stroke={F(LATAO)} strokeWidth={4} />)}</g>)}</> : null}
      {pp === 'vigia' ? <><path d="M64 178 Q100 202 136 178 L132 196 Q100 214 68 196Z" fill={F('#F2B705')} /><path d="M78 186 l6 16 M96 192 l4 16 M114 190 l-2 16" stroke={F('#111')} strokeWidth={7} /><path d="M118 194 l10 40 l14 -4 l-8 -38Z" fill={F('#F2B705')} /><circle cx={70} cy={222} r={8} fill={F(LATAO)} /></> : null}
      {pp === 'delegado' || pp === 'delegada' ? <path d="M72 214 l6 -12 l6 12 l-12 -7 h12Z" fill={F(LATAO)} strokeWidth={2.5} /> : null}
      {pp === 'pescador' ? <><path d="M60 196 Q100 214 140 196" fill="none" stroke={F('#C9B27A')} strokeWidth={7} strokeDasharray="8 5" /><path d="M100 196 V280" fill="none" strokeWidth={3} /></> : null}
      {pp === 'assistente' && cor === 'Verde' ? <>{[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={70 + rnd(k) * 60} cy={214 + rnd(k + 9) * 50} r={3.5} fill={F('#D9A95B')} stroke="none" />)}</> : null}
      {pp === 're' ? <><path d="M78 170 Q100 196 122 170" fill="none" stroke={F(LATAO)} strokeWidth={3.5} /><g transform="translate(100 206)"><path d="M0 -12 V14 M-9 -4 H9 M-14 6 Q-12 16 0 16 Q12 16 14 6" fill="none" stroke={F(LATAO)} strokeWidth={4} /><circle cx={0} cy={-15} r={4} fill="none" stroke={F(LATAO)} strokeWidth={3} /></g></> : null}
    </g>
  );
  const braco = (o: [number, number], m: [number, number], esq: boolean) => {
    const enf = cor === 'Vermelho' && esq, anel = cor === 'Vermelho' && !esq && !semAnel;
    return (
      <g stroke={L} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${o[0]} ${o[1]} Q${(o[0] + m[0]) / 2 + (esq ? -14 : 14)} ${(o[1] + m[1]) / 2 + 6} ${m[0]} ${m[1]}`} fill="none" stroke={F(roupa)} strokeWidth={22} />
        <path d={`M${o[0]} ${o[1]} Q${(o[0] + m[0]) / 2 + (esq ? -14 : 14)} ${(o[1] + m[1]) / 2 + 6} ${m[0]} ${m[1]}`} fill="none" strokeWidth={3} opacity={0.5} />
        {maoBolso && esq ? <path d="M60 232 h30" strokeWidth={6} /> : <>
          <circle cx={m[0]} cy={m[1]} r={13} fill={F(enf ? '#F4F1EA' : mao)} />
          {enf && !silh ? <path d={`M${m[0] - 12} ${m[1] - 4} l24 -5 M${m[0] - 12} ${m[1] + 5} l24 -5`} stroke="#9a9288" strokeWidth={3} /> : null}
          {anel && !silh ? <g transform={`translate(${m[0] + 9} ${m[1] - 2})`}><circle r={6.5} fill="none" stroke={LATAO} strokeWidth={4} /><circle r={6.5} fill="none" stroke="#111" strokeWidth={1.2} /></g> : null}
        </>}
      </g>
    );
  };
  const cabeca = (
    <g transform={`rotate(${cabecaBaixa * 8} 100 150) translate(0 ${cabecaBaixa * 14 + resp * 0.6})`}>
      {/* peruca de corda (juiz) atrás da pedra */}
      {pp === 'juiz' ? <g stroke={L} strokeWidth={4} fill={F('#E9E1CC')}>{[0, 1, 2, 3].map((k) => <React.Fragment key={k}><ellipse cx={42} cy={70 + k * 26} rx={18} ry={14} /><ellipse cx={158} cy={70 + k * 26} rx={18} ry={14} /></React.Fragment>)}<path d="M50 40 Q100 4 150 40 L150 56 Q100 30 50 56Z" /></g> : null}
      {cor === 'Roxo' ? <g stroke={L} strokeWidth={sw} strokeLinejoin="round">
        <path d="M48 150 Q100 170 152 150 L146 126 L54 126Z" fill={F('#5a3a6a')} />
        {[[62, 70, 30], [138, 66, 28], [80, 40, 26], [120, 42, 24]].map(([x, top, w], k) => <path key={k} d={`M${x - w / 2} 132 L${x - w / 2 + 4} ${top + 20} L${x} ${top} L${x + w / 2 - 4} ${top + 20} L${x + w / 2} 132Z`} fill={F(mistura(c, '#000000', 0.15 + k * 0.06))} />)}
        <path d="M66 140 L70 44 L100 16 L130 44 L134 140Z" fill={F(c)} />
        {!silh ? <path d="M100 16 L100 140 M70 44 L130 44" stroke="#ffffff55" strokeWidth={3} fill="none" /> : null}
      </g> : <g stroke={L} strokeWidth={sw} strokeLinejoin="round">
        <polygon points={pts(forma)} fill={F(c)} />
        {!silh && !LISA.includes(cor) ? <g strokeWidth={2.2} stroke="#00000055">
          {forma.map((p, i) => { const q = forma[(i + 1) % forma.length], m = mesa[i], n = mesa[(i + 1) % mesa.length]; return <polygon key={i} points={pts([p, q, n, m])} fill={i % 2 ? '#ffffff2e' : '#0000001f'} />; })}
          <polygon points={pts(mesa)} fill="#ffffff22" />
        </g> : null}
        {!silh && cor === 'Rosa' ? <polygon points={pts(forma)} fill="url(#leite)" stroke="none" opacity={0.6} /> : null}
        {!silh && LISA.includes(cor) ? <ellipse cx={cx - 22} cy={cy - 28} rx={20} ry={11} fill="#ffffff66" stroke="none" transform={`rotate(-25 ${cx - 22} ${cy - 28})`} /> : null}
        {!silh && cor === 'Ciano' ? <path d="M50 80 q20 10 30 -6 t34 8 t30 -4 M60 120 q24 -8 40 6 t40 -6" fill="none" stroke="#3b2a1a" strokeWidth={3} opacity={0.55} /> : null}
        {!silh && cor === 'Laranja' ? <g transform={`translate(${122 + Math.sin(f * 0.07) * 3} 128) rotate(${Math.sin(f * 0.2) * 10})`} stroke="#3a1d05" strokeWidth={2} fill="#3a1d05"><ellipse rx={6} ry={3.5} /><ellipse cx={-3} cy={-5} rx={5} ry={3} fill="#ffffff88" /><ellipse cx={3} cy={-5} rx={5} ry={3} fill="#ffffff88" /></g> : null}
      </g>}
      {/* chapéus */}
      {pp === 'vigia' || pp === 'delegado' || pp === 'delegada' ? <g stroke={L} strokeWidth={sw} strokeLinejoin="round"><path d={`M52 ${cor === 'Amarelo' ? 40 : 44} Q100 ${cor === 'Amarelo' ? -6 : 0} 148 ${cor === 'Amarelo' ? 40 : 44} L144 ${cor === 'Amarelo' ? 56 : 58} H56Z`} fill={F(pp === 'vigia' ? '#22345E' : '#141C30')} /><path d={`M50 ${cor === 'Amarelo' ? 56 : 58} H150 Q160 66 132 68 H66 Q40 66 50 ${cor === 'Amarelo' ? 56 : 58}Z`} fill={F('#111722')} /><circle cx={100} cy={cor === 'Amarelo' ? 36 : 38} r={7} fill={F(LATAO)} /></g> : null}
      {pp === 'pescador' ? <g stroke={L} strokeWidth={sw} strokeLinejoin="round"><path d="M56 52 Q100 4 144 52Z" fill={F('#2F5A6E')} /><path d="M118 50 Q170 46 176 60 Q150 64 120 60Z" fill={F('#244656')} /><circle cx={100} cy={22} r={6} fill={F('#E8E2D0')} /></g> : null}
      {/* rosto */}
      {silh ? null : <g>
        {pisca ? <path d={`M${ex - 26} ${ey} h14 M${ex + 12} ${ey} h14`} stroke="#111" strokeWidth={5} strokeLinecap="round" /> : <g>
          {[-1, 1].map((k) => <circle key={k} cx={ex + k * 19} cy={ey} r={10.5} fill="#fff" stroke="#111" strokeWidth={4} />)}
          {[-1, 1].map((k) => <circle key={k} cx={ex + k * 19 + olhar[0] * 4.5} cy={ey + olhar[1] * 4.5} r={4.8} fill="#111" />)}
        </g>}
        <path d={`M${ex - 30} ${ey - 18 + (humor === 'cinico' ? -6 : 0) - sob * 0.5} l18 ${sob * 0.6 + 2} M${ex + 30} ${ey - 18 + sob * -0.5} l-18 ${sob * 0.6 + 2}`} stroke="#111" strokeWidth={4.5} strokeLinecap="round" />
        {humor === 'susto' ? <ellipse cx={ex} cy={ey + 28} rx={7} ry={9} fill="#111" /> : <path d={boca} fill="none" stroke="#111" strokeWidth={5} strokeLinecap="round" />}
        {pp === 'advogada' && cor === 'Azul' ? <g fill="none" stroke="#111" strokeWidth={3}><rect x={ex - 31} y={ey - 10} width={24} height={18} rx={4} /><rect x={ex + 7} y={ey - 10} width={24} height={18} rx={4} /><path d={`M${ex - 7} ${ey - 2} h14`} /></g> : null}
        {pp === 'pescador' ? <path d={`M${ex - 34} ${ey + 34} Q${ex} ${ey + 78} ${ex + 34} ${ey + 34} M${ex - 24} ${ey + 40} L${ex + 10} ${ey + 66} M${ex - 8} ${ey + 42} L${ex + 22} ${ey + 60} M${ex + 24} ${ey + 40} L${ex - 10} ${ey + 66} M${ex + 8} ${ey + 42} L${ex - 22} ${ey + 60}`} fill="none" stroke="#E8E2D0" strokeWidth={3} /> : null}
        {brilho > 0 ? <path d={`M${cx + 30} ${cy - 40} l5 -14 l5 14 l14 5 l-14 5 l-5 14 l-5 -14 l-14 -5Z`} fill="#fff" stroke="none" opacity={brilho} transform={`rotate(${f * 3} ${cx + 35} ${cy - 35})`} /> : null}
      </g>}
    </g>
  );
  const cad = Array.from({length: cadeados}).map((_, k) => <g key={k} transform={`translate(${82 + k * 36 - (cadeados - 1) * 0} ${226 + Math.sin(f * 0.12 + k) * 2}) rotate(${Math.sin(f * 0.09 + k * 2) * 6})`}><Cadeado0 /></g>);
  return (
    <svg viewBox={busto ? '0 -10 200 230' : '0 -10 200 300'} width={s} height={s * (busto ? 1.15 : 1.5)} style={{overflow: 'visible', flexShrink: 0, ...style}}>
      <defs><radialGradient id="leite" cx="40%" cy="30%" r="70%"><stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} /><stop offset="100%" stopColor="#ffffff" stopOpacity={0} /></radialGradient></defs>
      {busto ? null : <ellipse cx={100} cy={284} rx={58} ry={8} fill="#0004" />}
      {corpo}
      {braco(ombE, maoE, true)}
      {braco(ombD, maoD, false)}
      {pp === 'juiz' && !busto ? <g transform={`translate(${maoD[0]} ${maoD[1] - 6}) rotate(${-30 + g * 50})`} stroke={L} strokeWidth={4}><rect x={-4} y={-46} width={8} height={44} fill={F(MAD_C)} /><rect x={-20} y={-62} width={40} height={20} rx={5} fill={F(MAD_E)} /></g> : null}
      {pp === 'assistente' && cor === 'Verde' ? <g transform={`translate(${maoD[0] - 18} ${maoD[1] - 50}) rotate(8)`} stroke={L} strokeWidth={4}><rect width={42} height={56} rx={4} fill={F('#C8A06A')} /><rect x={6} y={8} width={30} height={42} fill={F('#fff')} strokeWidth={2} /><path d="M10 18 h22 M10 26 h22 M10 34 h16" strokeWidth={2} /></g> : null}
      {pp === 'assistente' && cor === 'Ciano' ? <g transform={`translate(${maoD[0]} ${maoD[1] - 30}) rotate(-20)`} stroke={L} strokeWidth={4}><circle r={20} fill={F('#cfe9ff88')} /><path d="M14 14 L34 34" strokeWidth={9} /></g> : null}
      {cad}
      {cabeca}
    </svg>
  );
};

// cadeado de latão (desenho base, 30x34 em torno de 0,0)
export const Cadeado0: React.FC<{abre?: number}> = ({abre = 0}) => (
  <g stroke="#111" strokeWidth={3} strokeLinejoin="round">
    <path d={`M-9 ${-4 - abre * 12} V${-12 - abre * 12} a9 9 0 0 1 18 0 V-4`} fill="none" strokeWidth={5} />
    <path d={`M-9 ${-4 - abre * 12} V${-12 - abre * 12} a9 9 0 0 1 18 0 V-4`} fill="none" stroke={LATAO} strokeWidth={2} />
    <rect x={-13} y={-5} width={26} height={22} rx={4} fill={LATAO} />
    <circle cx={-8} cy={0} r={1.6} fill="#6d5410" stroke="none" /><circle cx={8} cy={0} r={1.6} fill="#6d5410" stroke="none" />
    <path d="M0 3 v8" strokeWidth={3.5} /><circle cx={0} cy={4} r={2.6} fill="#111" />
  </g>
);

// ---------- ícones (martelo, olho-farol, lupa, relógio...) ----------
export const Icone: React.FC<{n: string; s: number; cor?: string; style?: React.CSSProperties}> = ({n, s, cor = '#111', style}) => (
  <svg viewBox="0 0 40 40" width={s} height={s} style={{flexShrink: 0, ...style}} fill="none" stroke={cor} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
    {n === 'martelo' ? <><rect x={6} y={6} width={18} height={10} rx={2} transform="rotate(-35 15 11)" fill={cor} /><path d="M18 17 L32 33" strokeWidth={5} /><path d="M4 36 h18" /></> : null}
    {n === 'olho' ? <><path d="M3 22 Q20 6 37 22 Q20 38 3 22Z" /><circle cx={20} cy={22} r={5} fill={cor} /><path d="M20 2 v5 M9 6 l3 4 M31 6 l-3 4" /></> : null}
    {n === 'farol' ? <><path d="M14 36 L17 14 H23 L26 36Z" /><rect x={15} y={7} width={10} height={7} /><path d="M20 3 v4 M4 10 L15 11 M36 10 L25 11" /></> : null}
    {n === 'lupa' ? <><circle cx={16} cy={16} r={10} /><path d="M24 24 L35 35" strokeWidth={5} /></> : null}
    {n === 'relogio' ? <><circle cx={20} cy={21} r={14} /><path d="M20 12 V21 L27 25" /></> : null}
    {n === 'chave' ? <><circle cx={11} cy={20} r={7} /><path d="M18 20 H36 M30 20 v6 M35 20 v5" /></> : null}
    {n === 'balao' ? <path d="M5 8 H35 V27 H18 L10 35 V27 H5Z" /> : null}
    {n === 'cadeado' ? <><rect x={8} y={18} width={24} height={17} rx={3} fill={cor} /><path d="M13 18 V12 a7 7 0 0 1 14 0 V18" /></> : null}
    {n === 'x' ? <path d="M9 9 L31 31 M31 9 L9 31" strokeWidth={6} /> : null}
    {n === 'ok' ? <path d="M7 21 L16 30 L33 10" strokeWidth={6} /> : null}
  </svg>
);
