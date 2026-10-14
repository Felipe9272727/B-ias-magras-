// Desenhos (SVG próprios) dos ingredientes, pratos, panelas e extintor do Overcooked das IAs.
// Tudo é desenhado num quadrado de 100×100 e escalado por `s` (px).
import React from 'react';

export type Obj = {tipo: string; nome?: string; picado?: boolean; grelhado?: boolean; queimado?: boolean; sujo?: boolean; conteudo?: any[]; estado?: string; prog?: number; n?: number};

const COR: Record<string, [string, string]> = {
  tomate: ['#e8402f', '#a61f12'],
  cebola: ['#f2d49a', '#b98a3e'],
  cogumelo: ['#c9a27e', '#7d5a3c'],
  alface: ['#7ccf4b', '#3d8a22'],
  'pão': ['#e6a95a', '#a8692a'],
  carne: ['#d9534f', '#8e2421'],
};
const ST = {stroke: '#1d1206', strokeWidth: 5, strokeLinejoin: 'round' as const};

export const Ingrediente: React.FC<{nome: string; picado?: boolean; grelhado?: boolean; s: number}> = ({nome, picado, grelhado, s}) => {
  const [c, e] = COR[nome] ?? ['#ccc', '#888'];
  const cor = grelhado ? '#7a4321' : c;
  const esc = grelhado ? '#3e1f0c' : e;
  if (picado || grelhado) {
    // pedacinhos
    const pts = nome === 'carne' ? [[50, 52, 30]] : [[34, 40, 17], [62, 36, 15], [44, 64, 16], [68, 62, 14]];
    return (
      <svg width={s} height={s} viewBox="0 0 100 100">
        {nome === 'carne' ? <ellipse cx={50} cy={55} rx={34} ry={22} fill={cor} {...ST} /> : pts.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={cor} {...ST} />)}
        {nome === 'carne' && grelhado && <path d="M30 50h40M30 60h40" stroke="#2a1306" strokeWidth={5} />}
        {nome !== 'carne' && pts.map(([x, y, r], i) => <circle key={'b' + i} cx={x - r / 3} cy={y - r / 3} r={r / 3} fill="#fff6" />)}
      </svg>
    );
  }
  return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      {nome === 'tomate' && <><circle cx={50} cy={56} r={32} fill={cor} {...ST} /><path d="M50 26l-10 -8M50 26l12 -6M50 26l-2 -12" stroke="#2e7d1f" strokeWidth={7} strokeLinecap="round" /><circle cx={38} cy={46} r={8} fill="#fff7" /></>}
      {nome === 'cebola' && <><path d="M50 18c18 14 32 26 32 44a32 30 0 0 1-64 0c0-18 14-30 32-44z" fill={cor} {...ST} /><path d="M50 30v52M38 40c-4 16-4 30 4 40M62 40c4 16 4 30-4 40" stroke={esc} strokeWidth={3} fill="none" /></>}
      {nome === 'cogumelo' && <><path d="M18 50a32 26 0 0 1 64 0z" fill={cor} {...ST} /><rect x={40} y={50} width={20} height={30} rx={6} fill="#f1e3cc" {...ST} /><circle cx={38} cy={38} r={5} fill="#fff8" /></>}
      {nome === 'alface' && <><circle cx={50} cy={54} r={32} fill={cor} {...ST} /><path d="M50 26c-8 14-8 40 0 58M30 40c10 6 16 16 20 30M70 40c-10 6-16 16-20 30" stroke={esc} strokeWidth={4} fill="none" /></>}
      {nome === 'pão' && <><path d="M16 60c0-20 16-32 34-32s34 12 34 32v8H16z" fill={cor} {...ST} /><path d="M30 44l4 4M48 38l4 4M64 44l4 4" stroke="#fff3c9" strokeWidth={5} strokeLinecap="round" /></>}
      {nome === 'carne' && <><path d="M20 56c0-18 18-28 34-26 18 2 28 14 26 30-2 14-20 20-36 18-16-2-24-10-24-22z" fill={cor} {...ST} /><ellipse cx={46} cy={52} rx={8} ry={6} fill="#f6d5d0" /></>}
    </svg>
  );
};

export const Prato: React.FC<{o: Obj; s: number}> = ({o, s}) => {
  const itens: string[] = (o.conteudo ?? []).map(String);
  return (
    <div style={{position: 'relative', width: s, height: s}}>
      <svg width={s} height={s} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0}}>
        <ellipse cx={50} cy={58} rx={44} ry={30} fill={o.sujo ? '#c9c2a8' : '#f7f7f2'} {...ST} />
        <ellipse cx={50} cy={56} rx={28} ry={18} fill="none" stroke={o.sujo ? '#9c9478' : '#d8d8cf'} strokeWidth={4} />
        {o.sujo && <><circle cx={36} cy={52} r={5} fill="#8a7a4a" /><circle cx={62} cy={62} r={4} fill="#8a7a4a" /></>}
      </svg>
      {itens.map((it, i) => {
        const sopa = it.startsWith('sopa');
        if (sopa) {
          const cor = it.includes('tomate') ? '#d9381e' : it.includes('cebola') ? '#e8c46a' : it.includes('cogumelo') ? '#a07a52' : '#8a6a4a';
          return <svg key={i} width={s} height={s} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0}}><ellipse cx={50} cy={54} rx={30} ry={18} fill={cor} {...ST} /><ellipse cx={42} cy={50} rx={8} ry={4} fill="#fff6" /></svg>;
        }
        const nome = it.split(' ')[0];
        const off = (i - (itens.length - 1) / 2) * s * 0.22;
        return <div key={i} style={{position: 'absolute', left: s * 0.18 + off, top: s * 0.12}}><Ingrediente nome={nome} picado={it.includes('picad')} grelhado={it.includes('grelhad')} s={s * 0.64} /></div>;
      })}
    </div>
  );
};

export const Panela: React.FC<{o: Obj; s: number; frame: number}> = ({o, s, frame}) => {
  const n = o.conteudo?.length ?? 0;
  const ing = o.conteudo?.[0]?.nome as string | undefined;
  const frig = o.tipo === 'frigideira';
  const cor = o.estado === 'queimada' ? '#1a1a1a' : ing === 'tomate' ? '#d9381e' : ing === 'cebola' ? '#e8c46a' : ing === 'cogumelo' ? '#a07a52' : ing === 'carne' ? (o.estado === 'pronta' ? '#7a4321' : '#d9534f') : '#7a5a3a';
  const borbulha = o.estado === 'cozinhando' || o.estado === 'pronta' || o.estado === 'queimando';
  return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      {frig ? (
        <><path d="M86 52l14-4" stroke="#222" strokeWidth={8} strokeLinecap="round" /><ellipse cx={46} cy={54} rx={38} ry={26} fill="#3b3f46" {...ST} /><ellipse cx={46} cy={52} rx={30} ry={18} fill="#2a2d33" /></>
      ) : (
        <><rect x={8} y={44} width={12} height={8} rx={3} fill="#555" {...ST} /><rect x={80} y={44} width={12} height={8} rx={3} fill="#555" {...ST} /><ellipse cx={50} cy={56} rx={38} ry={28} fill="#6b7480" {...ST} /><ellipse cx={50} cy={50} rx={32} ry={20} fill="#3d434c" /></>
      )}
      {n > 0 && <ellipse cx={frig ? 46 : 50} cy={frig ? 52 : 50} rx={frig ? 24 : 28} ry={frig ? 14 : 16} fill={cor} />}
      {borbulha && n > 0 && [0, 1, 2].map((i) => <circle key={i} cx={36 + i * 14} cy={48 - ((frame * 0.8 + i * 9) % 14)} r={3 + (i % 2)} fill="#fff8" />)}
      {!frig && n > 0 && n < 3 && Array.from({length: 3}, (_, i) => <circle key={'d' + i} cx={38 + i * 12} cy={86} r={5} fill={i < n ? '#ffd84d' : '#0006'} stroke="#000" strokeWidth={2} />)}
    </svg>
  );
};

export const Extintor: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="0 0 100 100">
    <rect x={34} y={26} width={32} height={62} rx={12} fill="#e02a2a" {...ST} />
    <path d="M44 26v-10h16M60 16l14 8" stroke="#222" strokeWidth={6} fill="none" strokeLinecap="round" />
    <rect x={38} y={48} width={24} height={14} rx={3} fill="#fff" />
  </svg>
);

export const Item: React.FC<{o: Obj | null | undefined; s: number; frame: number}> = ({o, s, frame}) => {
  if (!o) return null;
  if (o.tipo === 'ing') return <Ingrediente nome={o.nome!} picado={o.picado} grelhado={o.grelhado} s={s} />;
  if (o.tipo === 'prato') return <Prato o={o} s={s} />;
  if (o.tipo === 'panela' || o.tipo === 'frigideira') return <Panela o={o} s={s} frame={frame} />;
  if (o.tipo === 'extintor') return <Extintor s={s} />;
  return null;
};

// chama (fogo) animada
export const Fogo: React.FC<{s: number; frame: number; seed?: number}> = ({s, frame, seed = 0}) => {
  const a = Math.sin((frame + seed * 7) / 3) * 4;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
      <path d={`M50 ${8 + a}c14 18 30 30 30 52a30 30 0 0 1-60 0c0-14 8-22 14-30 2 10 6 14 10 16-2-16 0-26 6-38z`} fill="#ff7a1a" stroke="#b33a00" strokeWidth={4} />
      <path d={`M50 ${40 - a}c8 10 16 18 16 30a16 16 0 0 1-32 0c0-10 6-16 16-30z`} fill="#ffd84d" />
    </svg>
  );
};
