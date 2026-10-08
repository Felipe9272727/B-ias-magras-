import React from 'react';

// Cores dos jogadores (tons próximos aos do jogo, desenho próprio em SVG)
export const COR: Record<string, {body: string; shade: string}> = {
  Vermelho: {body: '#c51111', shade: '#7a0838'},
  Azul: {body: '#132ed1', shade: '#09158e'},
  Verde: {body: '#117f2d', shade: '#0a4d2e'},
  Rosa: {body: '#ed54ba', shade: '#ab2bad'},
  Laranja: {body: '#ef7d0d', shade: '#b33e15'},
  Amarelo: {body: '#f5f557', shade: '#c38823'},
  Preto: {body: '#3f474e', shade: '#1e1f26'},
  Branco: {body: '#d6e0f0', shade: '#8394bf'},
};

type Props = {
  cor: string;
  size?: number;
  morto?: boolean; // corpo partido ao meio
  fantasma?: boolean;
  passo?: number; // fase da animação de andar (0..1)
  virado?: boolean; // olhando para a esquerda
  style?: React.CSSProperties;
};

// Tripulante em forma de "feijão": corpo, mochila, visor e pernas. viewBox 100x120.
export const Crewmate: React.FC<Props> = ({cor, size = 80, morto, fantasma, passo = 0, virado, style}) => {
  const c = COR[cor] ?? COR.Branco;
  const sw = 5;
  const perna = Math.sin(passo * Math.PI * 2) * 6;
  if (morto) {
    // metade de baixo do corpo + osso
    return (
      <svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={{overflow: 'visible', transform: virado ? 'scaleX(-1)' : undefined, ...style}}>
        <rect x="14" y="60" width="18" height="34" rx="6" fill={c.shade} stroke="#000" strokeWidth={sw} />
        <path d="M22 62 Q22 54 34 54 L76 54 Q88 54 88 66 L88 100 Q88 112 76 112 L62 112 L62 96 L44 96 L44 112 L34 112 Q22 112 22 100 Z" fill={c.body} stroke="#000" strokeWidth={sw} />
        <path d="M30 54 L40 60 L50 52 L60 61 L70 52 L80 60 L86 56" fill="none" stroke="#000" strokeWidth={sw} strokeLinejoin="round" />
        <g transform="translate(55 40)">
          <rect x="-4" y="-2" width="8" height="18" fill="#f3efe0" stroke="#000" strokeWidth={3} />
          <circle cx="-5" cy="-4" r="6" fill="#f3efe0" stroke="#000" strokeWidth={3} />
          <circle cx="5" cy="-4" r="6" fill="#f3efe0" stroke="#000" strokeWidth={3} />
        </g>
      </svg>
    );
  }
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 100 120"
      style={{overflow: 'visible', transform: virado ? 'scaleX(-1)' : undefined, opacity: fantasma ? 0.45 : 1, ...style}}
    >
      {/* mochila */}
      <rect x="8" y="44" width="20" height="44" rx="8" fill={c.shade} stroke="#000" strokeWidth={sw} />
      {/* pernas */}
      {!fantasma && (
        <>
          <path d={`M30 90 L30 ${110 + perna} Q30 114 36 114 L46 114 Q50 114 50 ${108 + perna} L50 90 Z`} fill={c.shade} stroke="#000" strokeWidth={sw} />
          <path d={`M58 90 L58 ${110 - perna} Q58 114 64 114 L74 114 Q78 114 78 ${108 - perna} L78 90 Z`} fill={c.shade} stroke="#000" strokeWidth={sw} />
        </>
      )}
      {/* corpo */}
      <path
        d={fantasma ? 'M22 50 Q22 8 54 8 Q86 8 86 50 L86 104 L76 96 L66 106 L56 96 L46 106 L36 96 L22 104 Z' : 'M22 50 Q22 8 54 8 Q86 8 86 50 L86 96 Q86 104 78 104 L30 104 Q22 104 22 96 Z'}
        fill={c.body}
        stroke="#000"
        strokeWidth={sw}
        strokeLinejoin="round"
      />
      {/* sombra lateral */}
      <path d="M26 60 Q26 98 36 100 L30 100 Q24 98 24 90 Z" fill={c.shade} opacity={0.6} />
      {/* visor */}
      <rect x="46" y="24" width="48" height="28" rx="14" fill="#9ccbd9" stroke="#000" strokeWidth={sw} />
      <rect x="52" y="40" width="36" height="9" rx="4.5" fill="#4d7d8f" opacity={0.7} />
      <rect x="60" y="29" width="18" height="6" rx="3" fill="#e9f7fb" />
    </svg>
  );
};
