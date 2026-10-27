// Ícones do Among Us 5 desenhados em SVG (regra do canal: nada de emoji dentro do vídeo).
// Traço preto grosso e cores chapadas, no estilo do jogo. Todos num quadrado 100x100.
import React from 'react';

const T = {stroke: '#000', strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const Svg: React.FC<{tam: number; children: React.ReactNode; style?: React.CSSProperties}> = ({tam, children, style}) => (
  <svg width={tam} height={tam} viewBox="0 0 100 100" style={{display: 'inline-block', verticalAlign: 'middle', overflow: 'visible', ...style}}>{children}</svg>
);

export const Coracao: React.FC<{tam?: number; partido?: number}> = ({tam = 60, partido = 0}) => {
  const d = 'M50 88C20 66 8 50 8 33 8 20 18 10 31 10c9 0 15 5 19 12 4-7 10-12 19-12 13 0 23 10 23 23 0 17-12 33-42 55z';
  if (!partido) return <Svg tam={tam}><path d={d} fill="#ff3b5c" {...T} /><path d="M24 24c-4 3-5 8-4 12" stroke="#ffb3c0" strokeWidth={6} fill="none" strokeLinecap="round" /></Svg>;
  // partido: as duas metades se afastam e giram
  const k = partido;
  return (
    <Svg tam={tam}>
      <g transform={`translate(${-10 * k} ${4 * k}) rotate(${-14 * k} 50 88)`}><path d="M50 88C20 66 8 50 8 33 8 20 18 10 31 10c9 0 15 5 19 12l-8 16 10 10-8 14 6 26z" fill="#ff3b5c" {...T} /></g>
      <g transform={`translate(${10 * k} ${4 * k}) rotate(${14 * k} 50 88)`}><path d="M50 88l6-26-8-14 10-10-8-16c4-7 10-12 19-12 13 0 23 10 23 23 0 17-12 33-42 55z" fill="#ff3b5c" {...T} /></g>
    </Svg>
  );
};

export const Fantasma: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}>
    <path d="M20 90V44C20 24 33 10 50 10s30 14 30 34v46l-10-8-10 8-10-8-10 8-10-8z" fill="#e8f0ff" {...T} />
    <ellipse cx={39} cy={42} rx={6} ry={9} fill="#000" /><ellipse cx={61} cy={42} rx={6} ry={9} fill="#000" />
  </Svg>
);

export const Osso: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}>
    <path d="M28 40l32 32" stroke="#000" strokeWidth={22} strokeLinecap="round" /><path d="M28 40l32 32" stroke="#f3ecd8" strokeWidth={12} strokeLinecap="round" />
    {[[22, 30], [30, 22], [66, 70], [70, 62]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={10} fill="#f3ecd8" {...T} />)}
  </Svg>
);

export const BocaCalada: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}>
    <circle cx={50} cy={50} r={40} fill="#ffd21f" {...T} />
    <circle cx={36} cy={40} r={5} fill="#000" /><circle cx={64} cy={40} r={5} fill="#000" />
    <path d="M28 64h44" {...T} /><path d="M34 58v12M44 58v12M54 58v12M64 58v12" stroke="#000" strokeWidth={4} />
  </Svg>
);

export const Envelope: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}><rect x={10} y={24} width={80} height={54} rx={6} fill="#fff" {...T} /><path d="M12 28l38 28 38-28" fill="none" {...T} /></Svg>
);

export const Balanca: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}>
    <path d="M50 14v70M30 86h40M20 28h60" {...T} fill="none" />
    <path d="M20 28L8 56h24zM80 28L68 56h24z" fill="#ffd21f" {...T} /><circle cx={50} cy={14} r={6} fill="#ffd21f" {...T} />
  </Svg>
);

export const Cadeado: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}><path d="M30 44V32a20 20 0 0140 0v12" fill="none" {...T} /><rect x={20} y={44} width={60} height={44} rx={8} fill="#ffd21f" {...T} /><circle cx={50} cy={64} r={6} fill="#000" /></Svg>
);

export const Sino: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}><path d="M50 12c-16 0-26 12-26 28v18l-10 14h72L76 58V40c0-16-10-28-26-28z" fill="#ffd21f" {...T} /><circle cx={50} cy={80} r={8} fill="#ffd21f" {...T} /></Svg>
);

// função desativada (Chato): raio cortado por uma barra vermelha
export const Desativado: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}>
    <circle cx={50} cy={50} r={40} fill="#fff" {...T} />
    <path d="M56 18L32 54h16l-6 28 26-38H52z" fill="#ffd21f" {...T} />
    <path d="M22 22l56 56" stroke="#e01b1b" strokeWidth={12} strokeLinecap="round" />
  </Svg>
);

// Doutor: cruz de socorro
export const Cruz: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}><path d="M38 12h24v26h26v24H62v26H38V62H12V38h26z" fill="#fff" {...T} /><path d="M42 18h16v24h24v16H58v24H42V58H18V42h24z" fill="#e01b1b" /></Svg>
);

// Víbora: gota de gosma verde
export const Gosma: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}><path d="M50 8C38 32 22 48 22 64a28 28 0 0056 0c0-16-16-32-28-56z" fill="#7dff5a" {...T} /><path d="M36 64c0 8 5 13 12 15" stroke="#d8ffc9" strokeWidth={6} fill="none" strokeLinecap="round" /></Svg>
);

export const Lupa: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}><circle cx={42} cy={42} r={26} fill="#bfe8ff" {...T} /><path d="M62 62l24 24" stroke="#000" strokeWidth={14} strokeLinecap="round" /><path d="M62 62l24 24" stroke="#8a5a2b" strokeWidth={6} strokeLinecap="round" /></Svg>
);

export const Escudo: React.FC<{tam?: number; cor?: string}> = ({tam = 60, cor = '#6dff8a'}) => (
  <Svg tam={tam}><path d="M50 8l34 12v26c0 22-14 38-34 46C30 84 16 68 16 46V20z" fill={cor} {...T} /><path d="M36 48l10 10 20-22" fill="none" {...T} /></Svg>
);

export const Alfinete: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}><path d="M50 92S20 56 20 36a30 30 0 0160 0c0 20-30 56-30 56z" fill="#3ee0ff" {...T} /><circle cx={50} cy={36} r={10} fill="#fff" {...T} /></Svg>
);

export const Camera: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}><rect x={10} y={30} width={80} height={54} rx={8} fill="#cfd8dc" {...T} /><path d="M34 30l6-12h20l6 12" fill="#cfd8dc" {...T} /><circle cx={50} cy={57} r={16} fill="#455a64" {...T} /></Svg>
);

export const Comida: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}><path d="M30 70c-14-4-18-22-6-34 10-10 30-12 42 0s10 32-4 36" fill="#c46a2b" {...T} /><path d="M64 70l14 14" stroke="#000" strokeWidth={14} strokeLinecap="round" /><path d="M64 70l14 14" stroke="#f3ecd8" strokeWidth={6} strokeLinecap="round" /></Svg>
);

export const Colete: React.FC<{tam?: number}> = ({tam = 60}) => (
  <Svg tam={tam}><path d="M30 14l20 10 20-10 16 16-8 60H22l-8-60z" fill="#ff8a1f" {...T} /><path d="M24 50h52M24 64h52" stroke="#ffd21f" strokeWidth={6} /></Svg>
);

// texto + ícone numa linha (substitui "emoji + texto" dos rótulos antigos)
export const ComIcone: React.FC<{icone: React.ReactNode; children: React.ReactNode}> = ({icone, children}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>{icone}<span>{children}</span></span>
);
