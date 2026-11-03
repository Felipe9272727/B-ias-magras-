// Figurinhas de gesto (como a roda de emotes do jogo): adesivo redondo branco com a cara do macaco e a luva fazendo
// o gesto. Tudo desenhado em SVG (regra do canal: nada de emoji dentro do vídeo).
import React from 'react';

const Cara: React.FC<{boca?: 'sorri' | 'o' | 'brava' | 'reta'; olhos?: 'abertos' | 'fechados' | 'bravo'}> = ({boca = 'sorri', olhos = 'abertos'}) => (
  <g>
    <circle cx={-62} cy={-8} r={22} fill="#7a4a2c" /><circle cx={-62} cy={-8} r={12} fill="#e8b48a" />
    <circle cx={62} cy={-8} r={22} fill="#7a4a2c" /><circle cx={62} cy={-8} r={12} fill="#e8b48a" />
    <ellipse cx={0} cy={0} rx={60} ry={56} fill="#7a4a2c" />
    <path d="M-12,-56 Q0,-82 18,-62 Q6,-60 4,-50 Z" fill="#5e3720" />
    <path d="M-48,8 Q-46,-30 -18,-24 Q0,-34 18,-24 Q46,-30 48,8 Q46,46 0,50 Q-46,46 -48,8 Z" fill="#e8b48a" />
    {olhos === 'fechados' ? (
      <g stroke="#1a1a1a" strokeWidth={5} strokeLinecap="round" fill="none"><path d="M-30,-8 q8,6 16,0" /><path d="M14,-8 q8,6 16,0" /></g>
    ) : (
      <g>
        <ellipse cx={-21} cy={-8} rx={8} ry={11} fill="#141414" /><ellipse cx={21} cy={-8} rx={8} ry={11} fill="#141414" />
        <circle cx={-18} cy={-12} r={2.5} fill="#fff" /><circle cx={24} cy={-12} r={2.5} fill="#fff" />
        {olhos === 'bravo' ? <g stroke="#3a2010" strokeWidth={5} strokeLinecap="round"><path d="M-32,-26 L-12,-18" /><path d="M32,-26 L12,-18" /></g> : null}
      </g>
    )}
    <ellipse cx={0} cy={10} rx={8} ry={5} fill="#d8553a" />
    {boca === 'sorri' ? <path d="M-16,22 Q0,36 16,22" stroke="#3a2010" strokeWidth={4} fill="none" strokeLinecap="round" /> : null}
    {boca === 'o' ? <ellipse cx={0} cy={28} rx={9} ry={11} fill="#5a1515" /> : null}
    {boca === 'brava' ? <path d="M-16,32 Q0,20 16,32" stroke="#3a2010" strokeWidth={4} fill="none" strokeLinecap="round" /> : null}
    {boca === 'reta' ? <path d="M-14,27 L14,27" stroke="#3a2010" strokeWidth={4} strokeLinecap="round" /> : null}
  </g>
);

// luva branca de desenho: palma + dedos levantados (n), polegar opcional
const Luva: React.FC<{dedos?: number; polegar?: boolean; rot?: number; x?: number; y?: number; s?: number; punho?: boolean}> = ({dedos = 0, polegar = false, rot = 0, x = 0, y = 0, s = 1, punho = false}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} stroke="#9aa0a8" strokeWidth={3}>
    {Array.from({length: dedos}, (_, i) => (
      <rect key={i} x={-26 + i * 14} y={-62 + Math.abs(i - 1.5) * 5} width={13} height={50} rx={6.5} fill="#fff" />
    ))}
    {polegar ? <rect x={20} y={-34} width={13} height={36} rx={6.5} fill="#fff" transform="rotate(35 26 -16)" /> : null}
    <rect x={-30} y={-22} width={60} height={46} rx={18} fill="#fff" />
    {punho ? <g stroke="#9aa0a8" strokeWidth={2.5}><path d="M-22,-10 h44" /><path d="M-22,2 h44" /><path d="M-22,14 h44" /></g> : null}
    <rect x={-24} y={20} width={48} height={16} rx={6} fill="#f1f1f1" />
  </g>
);

const Seta: React.FC<{dir: string}> = ({dir}) => {
  const r = {cima: -90, baixo: 90, esquerda: 180, direita: 0}[dir] ?? 0;
  return <g transform={`rotate(${r})`}><path d="M-40,-12 L18,-12 L18,-30 L48,0 L18,30 L18,12 L-40,12 Z" fill="#ffd23a" stroke="#3a2a00" strokeWidth={5} strokeLinejoin="round" /></g>;
};

const COR_BANANA: Record<string, string> = {vermelho: '#e53935', azul: '#1e88e5', amarelo: '#fdd835', verde: '#43a047', branco: '#f5f5f5', preto: '#222', roxo: '#8e24aa', laranja: '#fb8c00'};

export const Figurinha: React.FC<{gesto: string; tam?: number}> = ({gesto, tam = 220}) => {
  const [g, v] = gesto.split(':');
  let mao: React.ReactNode = null;
  let cara: React.ComponentProps<typeof Cara> = {};
  switch (g) {
    case 'polegar_cima': mao = <Luva x={58} y={40} punho polegar rot={-30} s={1.0} />; cara = {boca: 'sorri'}; break;
    case 'polegar_baixo': mao = <Luva x={58} y={44} punho polegar rot={150} s={1.0} />; cara = {boca: 'brava', olhos: 'bravo'}; break;
    case 'dedos': {
      const n = Math.max(0, Math.min(10, Number(v) || 0));
      mao = (
        <g>
          <Luva x={n > 5 ? 30 : 46} y={58} dedos={Math.min(4, n)} polegar={n >= 5} s={1.05} />
          {n > 5 ? <Luva x={-40} y={62} dedos={Math.min(4, n - 5)} polegar={n >= 10} s={0.9} /> : null}
          <g transform="translate(-58 62)"><circle r={30} fill="#ff4d3a" stroke="#fff" strokeWidth={6} /><text y={13} textAnchor="middle" fontFamily="Luckiest Guy, Bangers, sans-serif" fontSize={40} fill="#fff">{n}</text></g>
        </g>
      );
      cara = {boca: 'o'}; break;
    }
    case 'apontar': mao = <g transform="translate(0 60)"><Seta dir={v} /></g>; cara = {boca: 'reta'}; break;
    case 'apontar_banana': mao = <g transform="translate(40 62) rotate(-20)"><path d="M-46,0 Q0,40 46,-6 Q36,22 0,26 Q-34,24 -46,0 Z" fill={COR_BANANA[v] ?? '#fdd835'} stroke="#2a1a00" strokeWidth={5} /></g>; cara = {boca: 'o'}; break;
    case 'mao_parada': mao = <Luva x={40} y={52} dedos={4} polegar s={1.05} />; cara = {boca: 'reta', olhos: 'bravo'}; break;
    case 'repetir': mao = <g transform="translate(46 56)"><path d="M-30,0 A30,30 0 1,1 0,30" fill="none" stroke="#ffd23a" strokeWidth={12} strokeLinecap="round" /><path d="M-6,18 L4,40 L-20,40 Z" fill="#ffd23a" /></g>; cara = {boca: 'reta'}; break;
    case 'cabeca_sim': mao = <g transform="translate(0 70)"><path d="M-30,0 L-8,22 L34,-22" fill="none" stroke="#2ecc40" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" /></g>; cara = {boca: 'sorri', olhos: 'fechados'}; break;
    case 'cabeca_nao': mao = <g transform="translate(0 70)" stroke="#ff3b30" strokeWidth={16} strokeLinecap="round"><path d="M-24,-22 L24,22" /><path d="M24,-22 L-24,22" /></g>; cara = {boca: 'brava', olhos: 'bravo'}; break;
    case 'tapa': mao = <g><Luva x={60} y={20} dedos={4} polegar rot={70} s={1.0} /><path d="M20,-40 l20,-14 M30,-20 l26,-4 M24,0 l24,10" stroke="#ff3b30" strokeWidth={6} strokeLinecap="round" /></g>; cara = {boca: 'brava', olhos: 'bravo'}; break;
    case 'jogar_banana': mao = <g transform="translate(50 -50) rotate(30)"><path d="M-40,0 Q0,34 40,-6 Q30,20 0,24 Q-30,22 -40,0 Z" fill="#fdd835" stroke="#2a1a00" strokeWidth={5} /></g>; cara = {boca: 'o', olhos: 'bravo'}; break;
    default: mao = null;
  }
  return (
    <svg viewBox="-110 -110 220 220" width={tam} height={tam} style={{overflow: 'visible', filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.35))'}}>
      <circle r={104} fill="#fff" stroke="#e2e2e2" strokeWidth={4} />
      <circle r={96} fill="#fffdf8" />
      <g transform="translate(0 -10) scale(0.95)"><Cara {...cara} /></g>
      {mao}
    </svg>
  );
};

// luva branca da visão do Cego (dedo apontando), igual à mão do jogo nos contornos
export const MaoCego: React.FC<{tam?: number}> = ({tam = 260}) => (
  <svg viewBox="0 0 200 260" width={tam} height={tam * 1.3}>
    <path d="M62,250 L60,128 Q60,106 76,106 Q90,106 90,124 L90,22 Q90,0 106,0 Q122,0 122,22 L122,112 L148,112 Q170,112 172,134 L176,250 Z" fill="#fff" />
  </svg>
);
