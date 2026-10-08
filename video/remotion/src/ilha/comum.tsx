import React, {useMemo} from 'react';
import {AbsoluteFill, Img, random, staticFile} from 'remotion';

// Sprite de um tributo numa pose (public/ilha/sprites/<id>_<pose>.png, 256 px).
export const Personagem: React.FC<{id: string; pose: string; size: number; flip?: boolean; cinza?: boolean}> = ({id, pose, size, flip, cinza}) => (
  <Img
    src={staticFile(`ilha/sprites/${id}_${pose}.png`)}
    style={{
      width: size,
      height: size,
      transform: flip ? 'scaleX(-1)' : undefined,
      filter: cinza ? 'grayscale(1) brightness(0.55)' : undefined,
      objectFit: 'contain',
    }}
  />
);

// Retrato quadrado (public/ilha/sprites/<id>_retrato.png, 384 px) recortado em círculo.
export const Retrato: React.FC<{id: string; size: number; cinza?: boolean; borda?: string}> = ({id, size, cinza, borda = '#0b0d14'}) => (
  <Img
    src={staticFile(`ilha/sprites/${id}_retrato.png`)}
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      border: `4px solid ${borda}`,
      background: '#1c2526',
      objectFit: 'cover',
      filter: cinza ? 'grayscale(1) brightness(0.55)' : undefined,
    }}
  />
);

// Caveira em SVG (sinal de eliminação).
export const Caveira: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 2C7 2 4 5.5 4 10c0 2.6 1.2 4.4 3 5.5V18h10v-2.5c1.8-1.1 3-2.9 3-5.5 0-4.5-3-8-8-8z" fill="#fff8e6" stroke="#000" strokeWidth="0.8" />
    <circle cx="9" cy="10.5" r="2.1" fill="#000" />
    <circle cx="15" cy="10.5" r="2.1" fill="#000" />
    <path d="M11 14.5h2l-1 1.6z" fill="#000" />
    <path d="M9.5 18v3M12 18v3M14.5 18v3" stroke="#000" strokeWidth="0.9" />
  </svg>
);

// Fundo low-poly: grade de triângulos com cores escuras e tons de destaque, determinística (remotion random).
export const FundoBaixoPoli: React.FC<{destaque?: string; passo?: number; children?: React.ReactNode}> = ({destaque = '#f1cf6c', passo = 160, children}) => {
  const tris = useMemo(() => {
    const cols = Math.ceil(1920 / passo) + 2;
    const rows = Math.ceil(1080 / passo) + 2;
    const pts = (i: number, j: number) => {
      const jx = (random(`pt-x-${i}-${j}`) - 0.5) * passo * 0.6;
      const jy = (random(`pt-y-${i}-${j}`) - 0.5) * passo * 0.6;
      return [(i - 1) * passo + jx, (j - 1) * passo + jy] as const;
    };
    const paleta = ['#0c2226', '#103338', '#152a44', '#1d2a50', '#2a1e44', '#1a2b2a', '#0e1c2a'];
    const out: React.ReactNode[] = [];
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        const a = pts(i, j), b = pts(i + 1, j), c = pts(i, j + 1), d = pts(i + 1, j + 1);
        const h1 = random(`t1-${i}-${j}`), h2 = random(`t2-${i}-${j}`);
        const cor1 = h1 > 0.93 ? destaque : paleta[Math.floor(h1 * paleta.length)];
        const cor2 = h2 > 0.96 ? destaque : paleta[Math.floor(h2 * paleta.length)];
        out.push(<polygon key={`a${i}-${j}`} points={[a, b, c].map((q) => q.join(',')).join(' ')} fill={cor1} />);
        out.push(<polygon key={`b${i}-${j}`} points={[b, d, c].map((q) => q.join(',')).join(' ')} fill={cor2} />);
      }
    return out;
  }, [destaque, passo]);
  return (
    <AbsoluteFill style={{background: '#071015', overflow: 'hidden'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', left: 0, top: 0}}>
        {tris}
      </svg>
      {children}
    </AbsoluteFill>
  );
};
