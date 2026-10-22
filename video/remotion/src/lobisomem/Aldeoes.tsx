// Aldeões da vila do "Lobisomem": 8 personagens cartoon de corpo inteiro, em SVG inline (sem imagens).
// Estilo do canal: contorno grosso #14141f, cores chapadas com sombra de cel shading, expressões exageradas.
//
// Uso: <div style={{position: 'absolute', left: x, top: y}}><AldeaoSprite id="padeira" expressao="rindo" falando t={frame} /></div>
// - Ancoragem: o ponto (0,0) é a base dos pés, no centro. O pai posiciona esse ponto no chão.
// - "t" é o quadro atual (30 fps). Piscar a cada ~3 s, respiração, balanço e a boca falando usam "t".
// - "lobo" 0..1 é a transformação: pelos, orelhas, focinho, presas, garras e olhos amarelos.
// - Sistema do SVG: viewBox 480 x 1000, centro x = 240, pés em y = 1000.
// - O contorno tem 16 unidades: com altura 360 px dá uns 6 px. Em outras alturas ele escala junto.

import React, {useId} from 'react';

export type Aldeao = 'padeira' | 'ferreiro' | 'boticaria' | 'lenhador' | 'costureira' | 'pescador' | 'moleiro' | 'bardo';
export type ExpressaoA = 'neutro' | 'desconfiado' | 'assustado' | 'bravo' | 'rindo' | 'culpado' | 'chocado' | 'pensando' | 'chorando' | 'dormindo';
export type GestoA = 'nenhum' | 'apontar' | 'bracos_cruzados' | 'maos_pra_cima' | 'acenar';

export const ALDEOES: Record<Aldeao, {nome: string; cor: string}> = {
  padeira: {nome: 'Padeira', cor: '#d97a47'},
  ferreiro: {nome: 'Ferreiro', cor: '#a8552e'},
  boticaria: {nome: 'Boticária', cor: '#0f9d8a'},
  lenhador: {nome: 'Lenhador', cor: '#1d6b5f'},
  costureira: {nome: 'Costureira', cor: '#6a4cff'},
  pescador: {nome: 'Pescador', cor: '#4b33b8'},
  moleiro: {nome: 'Moleiro', cor: '#2f6bff'},
  bardo: {nome: 'Bardo', cor: '#e2325a'},
};

// ---------- Constantes de desenho ----------
type P = [number, number];
const PRETO = '#14141f';
const CONT = 16; // contorno principal
const CONT_F = 9; // contorno de detalhes
const PELO = '#5b4433';
const PELO_CLARO = '#8a6b52';
const AMARELO_OLHO = '#ffd23f';
const GARRA = '#f4efe0';

// Cabeça: elipse (rx 118, ry 132) centrada em (240, 250)
const CABECA = 'M122 250 A118 132 0 1 0 358 250 A118 132 0 1 0 122 250 Z';
// Tronco: ombros em y 425, quadril em y 694
const TRONCO = 'M150 425 Q240 402 330 425 Q356 470 352 560 L346 694 Q240 716 134 694 L128 560 Q124 470 150 425 Z';
const FRANJA = 'M124 226 Q124 128 240 124 Q356 128 356 226 Q322 188 280 180 Q240 170 200 180 Q158 188 124 226 Z';
const FRANJA_BOTICARIA = 'M124 226 Q122 120 240 118 Q358 120 356 226 Q330 176 280 170 Q226 160 170 186 Q140 200 124 226 Z';
const CAPA_CURTA = 'M126 214 Q122 120 240 118 Q358 120 354 214 Q330 170 240 160 Q150 170 126 214 Z';

// ---------- Visual de cada aldeão ----------
type Visual = {
  pele: string;
  sombra: string; // sombra de cel shading da pele
  cabelo: string;
  tronco: string; // cor principal da roupa
  sombraTronco: string;
  calca: string;
  detalhe: string;
  sapato: string;
  braco: string; // cor da manga (ou pele, se o braço for nu)
};

const VISUAL: Record<Aldeao, Visual> = {
  padeira: {pele: '#f2c09a', sombra: '#cf9371', cabelo: '#e8b65a', tronco: '#d97a47', sombraTronco: '#a9552b', calca: '#fff3e0', detalhe: '#ffffff', sapato: '#3a2418', braco: '#d97a47'},
  ferreiro: {pele: '#e6a883', sombra: '#b97a57', cabelo: '#2b2118', tronco: '#a8552e', sombraTronco: '#7a3a1c', calca: '#3b3a48', detalhe: '#5b3420', sapato: '#241912', braco: '#e6a883'},
  boticaria: {pele: '#f4cfb0', sombra: '#cc9f80', cabelo: '#6b2a4a', tronco: '#0f9d8a', sombraTronco: '#096d61', calca: '#0b6f63', detalhe: '#ffd23f', sapato: '#1b1b26', braco: '#0f9d8a'},
  lenhador: {pele: '#e0a57c', sombra: '#b57a55', cabelo: '#5a3b22', tronco: '#1d6b5f', sombraTronco: '#124a41', calca: '#3a3346', detalhe: '#e2325a', sapato: '#2a1d14', braco: '#1d6b5f'},
  costureira: {pele: '#f7d2b8', sombra: '#d0a58a', cabelo: '#3b2a4a', tronco: '#6a4cff', sombraTronco: '#4632b5', calca: '#6a4cff', detalhe: '#ffd23f', sapato: '#2a1d14', braco: '#6a4cff'},
  pescador: {pele: '#d7a076', sombra: '#a97650', cabelo: '#6b3f22', tronco: '#4b33b8', sombraTronco: '#33227f', calca: '#6f5a3a', detalhe: '#e8c77a', sapato: '#3d2818', braco: '#4b33b8'},
  moleiro: {pele: '#f1c7a2', sombra: '#c79a76', cabelo: '#d8d2c4', tronco: '#2f6bff', sombraTronco: '#1f4bb0', calca: '#3f4a6b', detalhe: '#f7f2e6', sapato: '#2a1d14', braco: '#2f6bff'},
  bardo: {pele: '#f0bf96', sombra: '#c4916c', cabelo: '#b33a1e', tronco: '#e2325a', sombraTronco: '#9b1e3e', calca: '#2b2f5c', detalhe: '#ffd23f', sapato: '#2a1d14', braco: '#e2325a'},
};

// ---------- Expressões ----------
type BocaT = 'sorriso' | 'reta' | 'grito' | 'o' | 'dentes' | 'tremula' | 'biquinho' | 'torta' | 'sono';
type Extra = 'nenhum' | 'gota' | 'gotas' | 'exclamacao' | 'interrogacao' | 'pontos' | 'veia' | 'lagrimas' | 'zzz';

type Cara = {
  olho: number; // abertura das pálpebras: 1 aberta, 0 fechada
  tam: number; // tamanho dos olhos
  pupila: number; // tamanho da pupila
  olhar: P; // para onde o olhar aponta
  arco?: boolean; // olhos fechados de tanto rir (arco para cima)
  dormir?: boolean; // olhos fechados (arco para baixo)
  sobr: number; // altura das sobrancelhas: negativo = levantadas, positivo = caídas
  incl: number; // positivo = ponta de dentro desce (raiva), negativo = sobe (preocupação)
  boca: BocaT;
  bochecha: number; // 0..1 bochecha vermelha
  extra: Extra;
  tremer?: boolean;
  giro?: number; // graus da cabeça
};

const CARAS: Record<ExpressaoA, Cara> = {
  neutro: {olho: 1, tam: 1, pupila: 1, olhar: [0, 0], sobr: 0, incl: 0, boca: 'reta', bochecha: 0, extra: 'nenhum'},
  desconfiado: {olho: 0.42, tam: 1, pupila: 0.9, olhar: [-26, -2], sobr: 8, incl: 12, boca: 'torta', bochecha: 0, extra: 'interrogacao', giro: -4},
  assustado: {olho: 1, tam: 1.3, pupila: 0.4, olhar: [0, 0], sobr: -28, incl: -10, boca: 'o', bochecha: 0.15, extra: 'gota', tremer: true},
  bravo: {olho: 0.55, tam: 1, pupila: 1, olhar: [0, 4], sobr: 4, incl: 26, boca: 'grito', bochecha: 0.6, extra: 'veia'},
  rindo: {olho: 1, tam: 1, pupila: 1, olhar: [0, 0], arco: true, sobr: -6, incl: -4, boca: 'dentes', bochecha: 0.7, extra: 'nenhum'},
  culpado: {olho: 0.85, tam: 1, pupila: 0.9, olhar: [-28, 14], sobr: 4, incl: -18, boca: 'tremula', bochecha: 0.4, extra: 'gotas', giro: -5},
  chocado: {olho: 1, tam: 1.4, pupila: 0.3, olhar: [0, 0], sobr: -40, incl: 0, boca: 'o', bochecha: 0, extra: 'exclamacao'},
  pensando: {olho: 1, tam: 1, pupila: 0.9, olhar: [24, -26], sobr: -8, incl: -6, boca: 'biquinho', bochecha: 0, extra: 'pontos', giro: 6},
  chorando: {olho: 0.6, tam: 1, pupila: 0.9, olhar: [0, 8], sobr: 0, incl: -24, boca: 'tremula', bochecha: 0.3, extra: 'lagrimas'},
  dormindo: {olho: 0, tam: 1, pupila: 1, olhar: [0, 0], dormir: true, sobr: 6, incl: 0, boca: 'sono', bochecha: 0.2, extra: 'zzz', giro: 8},
};

// Largura do corpo de cada um (1 = padrão): dá silhueta própria a cada aldeão
const LARGURA_CORPO: Record<Aldeao, number> = {
  padeira: 1.08,
  ferreiro: 1.14,
  boticaria: 0.96,
  lenhador: 1.06,
  costureira: 0.92,
  pescador: 0.92,
  moleiro: 1.04,
  bardo: 1,
};

// ---------- Utilidades ----------
const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));

// Mistura duas cores #rrggbb (k = 0 é a primeira, k = 1 é a segunda)
const mix = (a: string, b: string, k: number): string => {
  const ca = [16, 8, 0].map((s) => (parseInt(a.slice(1), 16) >> s) & 255);
  const cb = [16, 8, 0].map((s) => (parseInt(b.slice(1), 16) >> s) & 255);
  return '#' + ca.map((v, i) => Math.round(v + (cb[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

// Contorno das franjas do pelo: zigue-zague em volta de uma elipse (cresce com o lobo)
const tufos = (cx: number, cy: number, rx: number, ry: number, n: number, amp: number): string => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const f = i % 2 === 0 ? 1 + amp : 1 + amp * 0.25;
    d += `${i === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * rx * f).toFixed(1)} ${(cy + Math.sin(a) * ry * f).toFixed(1)} `;
  }
  return d + 'Z';
};

// Poses dos braços: "E" é o braço esquerdo da tela, "D" o direito. O lado da frente é o direito.
type Braco = {ombro: P; cot: P; mao: P};
const POSES = (gesto: GestoA, t: number): {E: Braco; D: Braco} => {
  const oE: P = [152, 452];
  const oD: P = [328, 452];
  const baixoE: Braco = {ombro: oE, cot: [126, 580], mao: [122, 668]};
  const baixoD: Braco = {ombro: oD, cot: [354, 580], mao: [358, 668]};
  switch (gesto) {
    case 'apontar':
      return {E: baixoE, D: {ombro: oD, cot: [392, 470], mao: [440, 452]}};
    case 'bracos_cruzados':
      return {E: {ombro: oE, cot: [176, 572], mao: [300, 540]}, D: {ombro: oD, cot: [304, 572], mao: [180, 540]}};
    case 'maos_pra_cima':
      return {E: {ombro: oE, cot: [100, 320], mao: [110, 176]}, D: {ombro: oD, cot: [380, 320], mao: [370, 176]}};
    case 'acenar': {
      // antebraço balança como quem acena
      const a = ((24 + 20 * Math.sin(t * 0.3)) * Math.PI) / 180;
      const cot: P = [392, 330];
      return {E: baixoE, D: {ombro: oD, cot, mao: [cot[0] + 140 * Math.sin(a), cot[1] - 140 * Math.cos(a)]}};
    }
    case 'nenhum':
    default:
      return {E: baixoE, D: baixoD};
  }
};

// ---------- Peças de desenho ----------
// Membro com contorno: traço grosso preto por baixo e a cor por cima
const Trait: React.FC<{d: string; cor: string; larg: number}> = ({d, cor, larg}) => (
  <g>
    <path d={d} fill="none" stroke={PRETO} strokeWidth={larg + CONT * 2} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={cor} strokeWidth={larg} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

// Forma com cel shading: a cor de luz deslocada para cima-esquerda, sobrando uma faixa de sombra embaixo-direita
const Celula: React.FC<{id: string; d: string; cor: string; sombra: string; dx?: number; dy?: number}> = ({id, d, cor, sombra, dx = -10, dy = -12}) => (
  <g>
    <clipPath id={id}>
      <path d={d} />
    </clipPath>
    <path d={d} fill={sombra} />
    <g clipPath={`url(#${id})`}>
      <path d={d} fill={cor} transform={`translate(${dx} ${dy})`} />
    </g>
    <path d={d} fill="none" stroke={PRETO} strokeWidth={CONT} strokeLinejoin="round" />
  </g>
);

// Mão com garras (aparecem com o lobo)
const Garras: React.FC<{x: number; y: number; k: number}> = ({x, y, k}) => (
  <g opacity={k}>
    {[-18, 0, 18].map((dx) => (
      <path key={dx} d={`M${x + dx - 7} ${y + 22} L${x + dx} ${y + 48} L${x + dx + 7} ${y + 22} Z`} fill={GARRA} stroke={PRETO} strokeWidth={5} strokeLinejoin="round" />
    ))}
  </g>
);

const BracoDesenho: React.FC<{b: Braco; cor: string; pele: string; k: number; larg?: number; dedo?: boolean}> = ({b, cor, pele, k, larg = 70, dedo = false}) => {
  const d = `M${b.ombro[0]} ${b.ombro[1]} L${b.cot[0]} ${b.cot[1]} L${b.mao[0]} ${b.mao[1]}`;
  const [mx, my] = b.mao;
  return (
    <g>
      <Trait d={d} cor={cor} larg={larg} />
      {dedo && (
        <g>
          <path d={`M${mx} ${my} L${mx + 46} ${my - 6}`} stroke={PRETO} strokeWidth={CONT_F + 16} strokeLinecap="round" />
          <path d={`M${mx} ${my} L${mx + 46} ${my - 6}`} stroke={pele} strokeWidth={CONT_F + 4} strokeLinecap="round" />
        </g>
      )}
      <Garras x={mx} y={my} k={k} />
      <circle cx={mx} cy={my} r={34} fill={pele} stroke={PRETO} strokeWidth={CONT} />
    </g>
  );
};

const Perna: React.FC<{d: string; cor: string}> = ({d, cor}) => <Trait d={d} cor={cor} larg={74} />;

// Gota de suor
const Gota: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 -30 C12 -14 22 -2 22 10 A22 22 0 0 1 -22 10 C-22 -2 -12 -14 0 -30 Z" fill="#8fe3ff" stroke={PRETO} strokeWidth={7} strokeLinejoin="round" />
    <path d="M-10 6 Q-10 16 -3 19" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
  </g>
);

// Olho: branco com pupila, pálpebra que desce de cima e contorno. Com lobo, fica amarelo e brilha.
const OlhoDesenho: React.FC<{
  uid: string;
  x: number;
  y: number;
  cara: Cara;
  ab: number;
  lobo: number;
  pele: string;
  morto: boolean;
  deriva: number;
}> = ({uid, x, y, cara, ab, lobo, pele, morto, deriva}) => {
  if (morto) {
    return (
      <path
        d={`M${x - 20} ${y - 18} L${x + 20} ${y + 18} M${x + 20} ${y - 18} L${x - 20} ${y + 18}`}
        stroke={PRETO}
        strokeWidth={10}
        strokeLinecap="round"
      />
    );
  }
  if (cara.arco) {
    return <path d={`M${x - 24} ${y + 8} Q${x} ${y - 26} ${x + 24} ${y + 8}`} fill="none" stroke={PRETO} strokeWidth={11} strokeLinecap="round" />;
  }
  if (cara.dormir) {
    return <path d={`M${x - 22} ${y - 6} Q${x} ${y + 22} ${x + 22} ${y - 6}`} fill="none" stroke={PRETO} strokeWidth={11} strokeLinecap="round" />;
  }
  const rx = 26 * cara.tam;
  const ry = 30 * cara.tam;
  const cobre = 2 * ry * (1 - ab); // altura da pálpebra fechada
  const px = clamp(cara.olhar[0] * 0.5 + deriva, -rx * 0.5, rx * 0.5);
  const py = clamp(cara.olhar[1] * 0.5, -ry * 0.45, ry * 0.45);
  const id = `${uid}-o${x}`;
  return (
    <g>
      {lobo > 0.02 && <circle cx={x} cy={y} r={rx * 1.7} fill={AMARELO_OLHO} opacity={0.35 * lobo} />}
      <clipPath id={id}>
        <ellipse cx={x} cy={y} rx={rx} ry={ry} />
      </clipPath>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={mix('#ffffff', AMARELO_OLHO, lobo)} />
      <g clipPath={`url(#${id})`}>
        <circle cx={x + px} cy={y + py} r={12 * cara.pupila + 2} fill={PRETO} />
        <circle cx={x + px + 5} cy={y + py - 5} r={4} fill="#ffffff" />
        {cobre > 0.5 && <rect x={x - rx - 4} y={y - ry - 4} width={2 * rx + 8} height={cobre + 4} fill={pele} />}
        {cobre > 0.5 && <line x1={x - rx - 4} x2={x + rx + 4} y1={y - ry + cobre} y2={y - ry + cobre} stroke={PRETO} strokeWidth={8} />}
      </g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="none" stroke={PRETO} strokeWidth={CONT_F} />
    </g>
  );
};

// Sobrancelhas: a altura vem de "sobr" e a inclinação de "incl" (ponta de dentro)
const Sobrancelhas: React.FC<{cara: Cara; cor: string}> = ({cara, cor}) => {
  const yb = 188 + cara.sobr;
  const d = cara.incl;
  return (
    <g fill="none" stroke={cor} strokeWidth={17} strokeLinecap="round">
      <path d={`M164 ${yb + d * 0.35} Q190 ${yb - 6} 214 ${yb + d}`} />
      <path d={`M316 ${yb + d * 0.35} Q290 ${yb - 6} 266 ${yb + d}`} />
    </g>
  );
};

// Boca: fechada (forma da expressão) ou aberta e mexendo quando fala (amp 0..1)
const desenhaBoca = (tipo: BocaT, fala: number): React.ReactNode => {
  if (fala >= 0) {
    const h = 6 + 22 * fala;
    const larg = tipo === 'o' ? 18 : tipo === 'grito' ? 34 : 28;
    return (
      <g>
        <ellipse cx={240} cy={312} rx={larg} ry={h} fill={PRETO} />
        <ellipse cx={240} cy={312 + h * 0.45} rx={larg * 0.55} ry={h * 0.4} fill="#ff6b8a" />
      </g>
    );
  }
  const linha = {fill: 'none', stroke: PRETO, strokeWidth: 11, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (tipo) {
    case 'sorriso':
      return <path d="M206 300 Q240 334 274 300" {...linha} />;
    case 'grito':
      return (
        <g>
          <rect x={212} y={296} width={56} height={40} rx={14} fill={PRETO} />
          <rect x={216} y={298} width={48} height={9} rx={3} fill="#ffffff" />
        </g>
      );
    case 'o':
      return <ellipse cx={240} cy={314} rx={15} ry={19} fill={PRETO} />;
    case 'dentes':
      return (
        <g>
          <path d="M200 300 Q240 282 280 300 Q272 344 240 346 Q208 344 200 300 Z" fill={PRETO} stroke={PRETO} strokeWidth={6} strokeLinejoin="round" />
          <rect x={210} y={296} width={60} height={11} rx={3} fill="#ffffff" />
          <ellipse cx={240} cy={328} rx={18} ry={9} fill="#ff6b8a" />
        </g>
      );
    case 'tremula':
      return <path d="M208 322 Q220 302 232 318 Q240 308 248 318 Q260 302 272 322" {...linha} strokeWidth={10} />;
    case 'biquinho':
      return <ellipse cx={252} cy={314} rx={8} ry={10} fill="none" stroke={PRETO} strokeWidth={9} />;
    case 'torta':
      return <path d="M210 318 Q242 312 274 296" {...linha} />;
    case 'sono':
      return <ellipse cx={240} cy={318} rx={9} ry={8} fill={PRETO} />;
    case 'reta':
    default:
      return <path d="M212 314 L268 314" {...linha} />;
  }
};

// Símbolos de quadrinho em volta da cabeça
const Extras: React.FC<{tipo: Extra; t: number}> = ({tipo, t}) => {
  switch (tipo) {
    case 'gota':
      return <Gota x={352} y={186} />;
    case 'gotas':
      return (
        <g>
          <Gota x={112} y={206} s={0.9} />
          <Gota x={368} y={206} s={0.9} />
        </g>
      );
    case 'exclamacao':
      return (
        <g transform="translate(402 118)">
          <path d="M-9 -40 L9 -40 L6 10 L-6 10 Z" fill={AMARELO_OLHO} stroke={PRETO} strokeWidth={7} strokeLinejoin="round" />
          <circle cx={0} cy={30} r={8} fill={AMARELO_OLHO} stroke={PRETO} strokeWidth={6} />
        </g>
      );
    case 'interrogacao':
      return (
        <g transform="translate(394 118)">
          <path d="M-16 -18 Q-16 -40 0 -40 Q18 -40 18 -22 Q18 -8 0 2 L0 14" fill="none" stroke={PRETO} strokeWidth={26} strokeLinecap="round" />
          <path d="M-16 -18 Q-16 -40 0 -40 Q18 -40 18 -22 Q18 -8 0 2 L0 14" fill="none" stroke={AMARELO_OLHO} strokeWidth={12} strokeLinecap="round" />
          <circle cx={0} cy={34} r={8} fill={AMARELO_OLHO} stroke={PRETO} strokeWidth={6} />
        </g>
      );
    case 'pontos':
      return (
        <g fill="#ffffff" stroke={PRETO} strokeWidth={5}>
          <circle cx={344} cy={170} r={7} />
          <circle cx={362} cy={146} r={10} />
          <circle cx={388} cy={116} r={14} />
        </g>
      );
    case 'veia':
      return (
        <g transform="translate(326 178)">
          <path d="M-13 -13 L13 13 M13 -13 L-13 13" stroke={PRETO} strokeWidth={16} strokeLinecap="round" />
          <path d="M-13 -13 L13 13 M13 -13 L-13 13" stroke="#e2325a" strokeWidth={7} strokeLinecap="round" />
        </g>
      );
    case 'lagrimas': {
      const cai = (t * 1.2) % 40;
      return (
        <g opacity={1 - cai / 40}>
          <Gota x={182} y={282 + cai} s={0.6} />
          <Gota x={298} y={282 + cai} s={0.6} />
        </g>
      );
    }
    case 'zzz': {
      const sobe = (t * 0.6) % 60;
      return (
        <g fontFamily="sans-serif" fontWeight={900} fill="#ffffff" stroke={PRETO} strokeWidth={5} paintOrder="stroke">
          <text x={354} y={150 - sobe} fontSize={46} opacity={1 - sobe / 60}>
            Z
          </text>
          <text x={396} y={108 - ((sobe + 30) % 60)} fontSize={32} opacity={1 - ((sobe + 30) % 60) / 60}>
            Z
          </text>
        </g>
      );
    }
    case 'nenhum':
    default:
      return null;
  }
};

// ---------- Cabelo, chapéus e pelo do rosto, por aldeão ----------
const CabeloTras: React.FC<{id: Aldeao; cor: string}> = ({id, cor}) => {
  switch (id) {
    case 'padeira':
      return <path d="M116 226 Q100 342 136 406 L344 406 Q380 342 364 226 Z" fill={cor} stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />;
    case 'bardo':
      return <path d="M116 222 Q96 300 116 360 Q122 396 104 412 L376 412 Q358 396 364 360 Q384 300 364 222 Z" fill={cor} stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />;
    case 'boticaria':
      return <circle cx={240} cy={100} r={46} fill={cor} stroke={PRETO} strokeWidth={CONT_F} />;
    case 'costureira':
      return <circle cx={240} cy={92} r={52} fill={cor} stroke={PRETO} strokeWidth={CONT_F} />;
    default:
      return null;
  }
};

const CabeloFrente: React.FC<{id: Aldeao; cor: string}> = ({id, cor}) => {
  const estilo = {fill: cor, stroke: PRETO, strokeWidth: CONT_F, strokeLinejoin: 'round' as const};
  switch (id) {
    case 'padeira':
    case 'costureira':
    case 'bardo':
      return <path d={FRANJA} {...estilo} />;
    case 'boticaria':
      return <path d={FRANJA_BOTICARIA} {...estilo} />;
    case 'ferreiro':
    case 'pescador':
    case 'moleiro':
      return <path d={CAPA_CURTA} {...estilo} />;
    default:
      return null;
  }
};

const Chapeu: React.FC<{id: Aldeao; v: Visual; k: number}> = ({id, v}) => {
  switch (id) {
    case 'padeira': // touca de padeiro, branca e alta
      return (
        <g stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round">
          <rect x={170} y={40} width={140} height={86} rx={8} fill="#ffffff" />
          <ellipse cx={240} cy={42} rx={74} ry={16} fill="#ffffff" />
          <rect x={166} y={100} width={148} height={16} rx={5} fill={v.tronco} />
        </g>
      );
    case 'pescador': // chapéu de palha, aba larga
      return (
        <g stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round">
          <ellipse cx={240} cy={126} rx={158} ry={28} fill={v.detalhe} />
          <path d="M178 126 Q176 44 240 40 Q304 44 302 126 Z" fill={v.detalhe} />
          <rect x={178} y={100} width={124} height={18} fill={v.tronco} />
        </g>
      );
    case 'moleiro': // chapéu largo, branco de farinha
      return (
        <g stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round">
          <ellipse cx={240} cy={122} rx={168} ry={30} fill={v.detalhe} />
          <path d="M184 122 Q180 40 240 36 Q300 40 296 122 Z" fill={v.detalhe} />
          <rect x={184} y={100} width={112} height={14} fill={v.tronco} />
          <g fill="#cfc9b8" stroke="none">
            <circle cx={214} cy={70} r={4} />
            <circle cx={262} cy={60} r={5} />
            <circle cx={240} cy={84} r={3} />
            <circle cx={290} cy={82} r={4} />
          </g>
        </g>
      );
    case 'lenhador': // gorro de lã com pompom
      return (
        <g stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round">
          <path d="M126 208 Q118 80 240 78 Q362 80 354 208 Q332 170 240 166 Q148 170 126 208 Z" fill={v.detalhe} />
          <path d="M126 196 Q240 176 354 196" fill="none" stroke={PRETO} strokeWidth={6} />
          <circle cx={240} cy={74} r={22} fill="#ffffff" />
        </g>
      );
    case 'bardo': // chapéu de aba mole com pena
      return (
        <g stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round">
          <path d="M276 70 Q330 36 356 60 Q326 76 312 98" fill="none" stroke={PRETO} strokeWidth={18} strokeLinecap="round" />
          <path d="M276 70 Q330 36 356 60 Q326 76 312 98" fill="none" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" />
          <path d="M178 122 Q170 56 240 52 Q310 56 302 122 Z" fill={mix(v.tronco, '#000000', 0.25)} />
          <ellipse cx={240} cy={124} rx={150} ry={24} fill={mix(v.tronco, '#000000', 0.25)} transform="rotate(-6 240 124)" />
          <rect x={178} y={100} width={124} height={14} fill={v.detalhe} />
        </g>
      );
    default:
      return null;
  }
};

// Barba e bigode: desenhados antes da boca
const PeloRosto: React.FC<{id: Aldeao; v: Visual}> = ({id, v}) => {
  switch (id) {
    case 'ferreiro':
      return <path d="M146 290 Q150 388 240 392 Q330 388 334 290 Q310 330 286 332 Q240 344 194 332 Q170 330 146 290 Z" fill={v.cabelo} stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />;
    case 'lenhador':
      return <path d="M154 292 Q156 372 240 376 Q324 372 326 292 Q306 318 286 320 Q240 332 194 320 Q174 318 154 292 Z" fill={v.cabelo} stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />;
    case 'moleiro':
      return <path d="M206 296 Q224 284 240 296 Q256 284 274 296 Q266 310 240 306 Q214 310 206 296 Z" fill={v.cabelo} stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />;
    default:
      return null;
  }
};

// Roupa do tronco: a forma principal e os detalhes de cada um
const Tronco: React.FC<{id: Aldeao; v: Visual; uid: string}> = ({id, v, uid}) => {
  const clip = `${uid}-trc`;
  const base = <Celula id={`${uid}-tr`} d={TRONCO} cor={v.tronco} sombra={v.sombraTronco} />;
  switch (id) {
    case 'padeira':
      return (
        <g>
          {base}
          {/* avental branco com bolso */}
          <path d="M180 556 Q240 540 300 556 L316 850 Q240 866 164 850 Z" fill="#fffaf0" stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />
          <rect x={206} y={740} width={68} height={46} rx={6} fill="none" stroke={PRETO} strokeWidth={6} />
        </g>
      );
    case 'ferreiro':
      return (
        <g>
          {base}
          {/* avental de couro, com alças */}
          <path d="M180 470 L300 470 L310 796 Q240 812 170 796 Z" fill={v.detalhe} stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />
          <Trait d="M186 470 L214 392 M294 470 L266 392" cor={v.detalhe} larg={14} />
          <rect x={172} y={668} width={136} height={16} rx={5} fill="#241912" stroke={PRETO} strokeWidth={5} />
        </g>
      );
    case 'boticaria': {
      // frascos de poção presos ao cinto
      const frascos = [
        {x: 176, c: '#ff6b8a'},
        {x: 214, c: AMARELO_OLHO},
        {x: 252, c: '#8fe3ff'},
      ];
      return (
        <g>
          {base}
          <rect x={156} y={668} width={168} height={22} rx={6} fill="#3a2418" stroke={PRETO} strokeWidth={CONT_F} />
          {frascos.map((f) => (
            <g key={f.x}>
              <rect x={f.x - 13} y={622} width={26} height={38} rx={9} fill={f.c} stroke={PRETO} strokeWidth={CONT_F} />
              <rect x={f.x - 8} y={610} width={16} height={14} rx={3} fill="#b8854b" stroke={PRETO} strokeWidth={6} />
            </g>
          ))}
        </g>
      );
    }
    case 'lenhador':
      return (
        <g>
          {base}
          <clipPath id={clip}>
            <path d={TRONCO} />
          </clipPath>
          {/* camisa xadrez */}
          <g clipPath={`url(#${clip})`}>
            {[120, 160, 200, 240, 280, 320, 360].map((x) => (
              <rect key={`v${x}`} x={x} y={400} width={14} height={320} fill={v.detalhe} opacity={0.45} />
            ))}
            {[440, 480, 520, 560, 600, 640, 680].map((y) => (
              <rect key={`h${y}`} x={100} y={y} width={300} height={14} fill="#f4d35e" opacity={0.4} />
            ))}
          </g>
          <path d={TRONCO} fill="none" stroke={PRETO} strokeWidth={CONT} strokeLinejoin="round" />
        </g>
      );
    case 'costureira':
      return (
        <g>
          {base}
          {/* fita métrica no pescoço, com marcas */}
          <Trait d="M204 418 Q240 448 276 418" cor={v.detalhe} larg={14} />
          <rect x={224} y={440} width={32} height={170} fill={v.detalhe} stroke={PRETO} strokeWidth={CONT_F} />
          {[460, 484, 508, 532, 556, 580].map((y) => (
            <path key={y} d={`M224 ${y} L238 ${y}`} stroke={PRETO} strokeWidth={4} />
          ))}
        </g>
      );
    case 'pescador':
      return (
        <g>
          {base}
          <rect x={150} y={664} width={180} height={18} rx={5} fill="#3a2418" stroke={PRETO} strokeWidth={CONT_F} />
          {/* suspensórios */}
          <Trait d="M186 432 L200 690 M294 432 L280 690" cor={v.detalhe} larg={12} />
        </g>
      );
    case 'moleiro':
      return (
        <g>
          {base}
          {/* camisa branca em V e botões */}
          <path d="M202 430 L240 530 L278 430 Z" fill="#ffffff" stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />
          {[582, 628].map((y) => (
            <circle key={y} cx={240} cy={y} r={6} fill="#ffffff" stroke={PRETO} strokeWidth={5} />
          ))}
        </g>
      );
    case 'bardo': {
      const cores = [AMARELO_OLHO, '#2f6bff', '#6a4cff', AMARELO_OLHO, '#2f6bff', '#6a4cff', AMARELO_OLHO];
      return (
        <g>
          {base}
          <clipPath id={clip}>
            <path d={TRONCO} />
          </clipPath>
          {/* roupa de remendos coloridos */}
          <g clipPath={`url(#${clip})`}>
            {cores.map((c, i) => (
              <rect key={i} x={128 + i * 40} y={400} width={24} height={320} fill={c} transform={`rotate(-14 ${128 + i * 40} 560)`} />
            ))}
          </g>
          <path d={TRONCO} fill="none" stroke={PRETO} strokeWidth={CONT} strokeLinejoin="round" />
        </g>
      );
    }
    default:
      return base;
  }
};

// Saia, vestido ou manto: vem depois das pernas e antes dos sapatos
const Saia: React.FC<{id: Aldeao; v: Visual; uid: string}> = ({id, v, uid}) => {
  switch (id) {
    case 'padeira':
      return <Celula id={`${uid}-saia`} d="M142 676 L338 676 Q366 800 364 934 Q240 960 116 934 Q114 800 142 676 Z" cor={v.tronco} sombra={v.sombraTronco} dx={-8} dy={-10} />;
    case 'boticaria':
      return <Celula id={`${uid}-saia`} d="M142 676 L338 676 Q370 820 368 960 L112 960 Q110 820 142 676 Z" cor={v.tronco} sombra={v.sombraTronco} dx={-8} dy={-10} />;
    case 'costureira':
      return <Celula id={`${uid}-saia`} d="M146 676 L334 676 Q358 800 350 940 L130 940 Q122 800 146 676 Z" cor={v.tronco} sombra={v.sombraTronco} dx={-8} dy={-10} />;
    default:
      return null;
  }
};

// Sapatos (ou botas, no pescador)
const Sapatos: React.FC<{id: Aldeao; v: Visual}> = ({id, v}) => {
  if (id === 'pescador') {
    return (
      <g>
        <rect x={138} y={812} width={100} height={186} rx={26} fill={v.sapato} stroke={PRETO} strokeWidth={CONT} />
        <rect x={242} y={812} width={100} height={186} rx={26} fill={v.sapato} stroke={PRETO} strokeWidth={CONT} />
        <rect x={134} y={812} width={108} height={22} rx={6} fill="#5b3b20" stroke={PRETO} strokeWidth={CONT_F} />
        <rect x={238} y={812} width={108} height={22} rx={6} fill="#5b3b20" stroke={PRETO} strokeWidth={CONT_F} />
      </g>
    );
  }
  return (
    <g>
      <rect x={140} y={922} width={96} height={72} rx={34} fill={v.sapato} stroke={PRETO} strokeWidth={CONT} />
      <rect x={244} y={922} width={96} height={72} rx={34} fill={v.sapato} stroke={PRETO} strokeWidth={CONT} />
    </g>
  );
};

// Objetos que os aldeões carregam ou usam, atrás do corpo
const Fundo: React.FC<{id: Aldeao; uid: string; k: number}> = ({id, uid, k}) => {
  switch (id) {
    case 'boticaria':
      // capa, atrás dos ombros
      return <path d="M130 436 Q240 404 350 436 Q402 620 396 980 L84 980 Q78 620 130 436 Z" fill="#0b6f63" stroke={PRETO} strokeWidth={CONT} strokeLinejoin="round" />;
    case 'lenhador':
      // machado apoiado no ombro direito
      return (
        <g>
          <path d="M330 440 L414 296" stroke={PRETO} strokeWidth={22} strokeLinecap="round" />
          <path d="M330 440 L414 296" stroke="#8a5a33" strokeWidth={12} strokeLinecap="round" />
          <path d="M396 286 Q430 262 452 282 Q440 318 404 318 Z" fill="#c8d0da" stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />
        </g>
      );
    default:
      return null;
  }
};

// Objetos na frente, depois dos braços (o que vem nas mãos e nos ombros)
const Frente: React.FC<{id: Aldeao; pose: {E: Braco; D: Braco}; t: number}> = ({id, pose, t}) => {
  const [ex, ey] = pose.E.mao;
  const [dx, dy] = pose.D.mao;
  switch (id) {
    case 'padeira': // pão na mão esquerda
      return (
        <g transform={`translate(${ex - 2} ${ey - 40})`}>
          <ellipse rx={50} ry={28} fill="#d9893b" stroke={PRETO} strokeWidth={CONT_F} />
          <path d="M-26 -4 Q-12 -20 0 -4 Q12 -20 26 -4" fill="none" stroke="#fff3d6" strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    case 'ferreiro': // martelo na mão direita
      return (
        <g transform={`translate(${dx} ${dy}) rotate(-24)`}>
          <rect x={-7} y={-80} width={14} height={92} rx={5} fill="#8a5a33" stroke={PRETO} strokeWidth={CONT_F} />
          <rect x={-30} y={-108} width={60} height={34} rx={6} fill="#9aa3b2" stroke={PRETO} strokeWidth={CONT_F} />
        </g>
      );
    case 'costureira': // tesoura na mão esquerda
      return (
        <g transform={`translate(${ex} ${ey}) rotate(30)`} stroke={PRETO} strokeLinecap="round">
          <line x1={-8} y1={-34} x2={8} y2={30} strokeWidth={18} />
          <line x1={8} y1={-34} x2={-8} y2={30} strokeWidth={18} />
          <line x1={-8} y1={-34} x2={8} y2={30} stroke="#cfd6e0" strokeWidth={8} />
          <line x1={8} y1={-34} x2={-8} y2={30} stroke="#cfd6e0" strokeWidth={8} />
          <circle cx={-16} cy={44} r={12} fill="none" strokeWidth={8} />
          <circle cx={16} cy={44} r={12} fill="none" strokeWidth={8} />
        </g>
      );
    case 'pescador': {
      // vara de pescar na mão direita, com linha caindo
      const ponta: P = [dx + 100, dy - 300];
      return (
        <g>
          <line x1={dx} y1={dy} x2={ponta[0]} y2={ponta[1]} stroke={PRETO} strokeWidth={CONT_F + 8} strokeLinecap="round" />
          <line x1={dx} y1={dy} x2={ponta[0]} y2={ponta[1]} stroke="#9a6b3a" strokeWidth={CONT_F - 2} strokeLinecap="round" />
          <line x1={ponta[0]} y1={ponta[1]} x2={ponta[0] - 4} y2={dy + 70} stroke="#dbe3ea" strokeWidth={4} />
          <circle cx={ponta[0] - 4} cy={dy + 74} r={9} fill="#ffffff" stroke={PRETO} strokeWidth={6} />
        </g>
      );
    }
    case 'moleiro': // saco de farinha no ombro esquerdo
      return (
        <g>
          <ellipse cx={142} cy={392} rx={50} ry={56} fill="#f4f1e8" stroke={PRETO} strokeWidth={CONT} />
          <rect x={120} y={336} width={44} height={16} rx={5} fill="#8a5a33" stroke={PRETO} strokeWidth={CONT_F} />
        </g>
      );
    case 'bardo': {
      // alaúde no colo
      return (
        <g>
          <line x1={262} y1={560} x2={330} y2={438} stroke={PRETO} strokeWidth={CONT_F + 16} strokeLinecap="round" />
          <line x1={262} y1={560} x2={330} y2={438} stroke="#7a4a2a" strokeWidth={14} strokeLinecap="round" />
          <rect x={318} y={404} width={28} height={40} rx={6} fill="#7a4a2a" stroke={PRETO} strokeWidth={CONT_F} transform="rotate(28 332 424)" />
          <circle cx={240} cy={592} r={60} fill="#c17a3a" stroke={PRETO} strokeWidth={CONT} />
          <circle cx={240} cy={592} r={16} fill={PRETO} />
          <line x1={226} y1={640} x2={252} y2={660} stroke="#ffffff" strokeWidth={3} />
        </g>
      );
    }
    default:
      return null;
  }
};

// ---------- Sprite principal ----------
export const AldeaoSprite: React.FC<{
  id: Aldeao;
  expressao: ExpressaoA;
  falando: boolean;
  t: number;
  altura?: number;
  virado?: 'esquerda' | 'direita';
  lobo?: number;
  gesto?: GestoA;
  morto?: boolean;
  noite?: number;
}> = ({id, expressao, falando, t, altura = 360, virado = 'direita', lobo = 0, gesto = 'nenhum', morto = false, noite = 0}) => {
  const uid = 'al' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const v = VISUAL[id];
  const k = clamp(lobo, 0, 1);

  // Morto: deitado de lado, olhos em X, sem respirar nem falar
  const cara: Cara = morto
    ? {...CARAS.dormindo, dormir: false, boca: 'o', extra: 'nenhum', tremer: false, giro: 0, bochecha: 0}
    : CARAS[expressao];

  // Pele vai ficando peluda com o lobo
  const pele = mix(v.pele, PELO_CLARO, k * 0.5);
  const sombraPele = mix(v.sombra, '#3e2c20', k * 0.5);

  const pose = POSES(gesto, t);
  const resp = morto ? 0 : Math.sin((t * 2 * Math.PI) / (cara.dormir ? 120 : 80));
  const piscando = !morto && !cara.arco && !cara.dormir && t % 96 > 88;
  const ab = piscando ? 0.05 : cara.olho;
  const fala = falando && !morto && !cara.dormir ? (Math.sin(t * 0.55) + Math.sin(t * 1.3 + 0.7) + 2) / 4 : -1;
  const tremX = cara.tremer ? Math.sin(t * 2.3) * 3 : 0;
  const balanco = morto ? 0 : Math.sin(t * 0.045) * 1.2;
  const deriva = morto ? 0 : Math.sin(t * 0.03) * 3;
  const giro = cara.giro ?? 0;

  const W = morto ? altura * 0.9 : altura * 0.48;
  const H = morto ? altura * 0.32 : altura;
  const espelho = virado === 'esquerda' && !morto ? 'translate(480 0) scale(-1 1)' : undefined;
  const deitado = morto ? 'translate(-240 -850) rotate(90 240 1000)' : undefined;

  const orelha = 'M136 238 Q112 166 92 86 Q152 120 180 176 Z';
  const orelhaDentro = 'M140 222 Q124 170 110 124 Q150 150 168 184 Z';

  return (
    <div style={{position: 'relative', width: 0, height: 0}}>
      <svg
        width={W}
        height={H}
        viewBox={morto ? '-10 -10 900 320' : '0 0 480 1000'}
        style={{position: 'absolute', left: -W / 2, top: morto ? -H / 2 : -H, overflow: 'visible'}}
      >
        {/* Noite: escurece e azula só o desenho (filtro de cor, sem caixa atrás) */}
        <defs>
          <filter id={`${uid}-noite`} x="-20%" y="-20%" width="140%" height="140%">
            <feColorMatrix
              type="matrix"
              values={`${1 - 0.22 * noite} 0 0 0 0  0 ${1 - 0.16 * noite} 0 0 0  0 0 1 0 ${0.08 * noite}  0 0 0 1 0`}
            />
          </filter>
        </defs>
        <g transform={`rotate(${balanco} 240 1000)`}>
          <g transform={`translate(${tremX} 0)`}>
            <g transform={espelho} filter={noite > 0 ? `url(#${uid}-noite)` : undefined}>
              <g transform={deitado}>
                {/* Atrás do corpo: capa, machado, pelo do tronco */}
                <Fundo id={id} uid={uid} k={k} />

                {/* Pernas e saia */}
                <Perna d="M196 690 L190 934" cor={v.calca} />
                <Perna d="M284 690 L290 934" cor={v.calca} />
                <Saia id={id} v={v} uid={uid} />
                <Sapatos id={id} v={v} />

                {/* Parte de cima: respira */}
                <g transform={`translate(240 0) scale(${LARGURA_CORPO[id]} 1) translate(-240 ${-resp * (cara.dormir ? 5 : 3)})`}>
                  {/* pelo do peito com o lobo */}
                  <path d={tufos(240, 560, 104, 140, 26, 0.12 * k)} fill={PELO} stroke={PRETO} strokeWidth={CONT_F} opacity={k} />
                  {/* pescoço */}
                  <rect x={214} y={346} width={52} height={104} fill={sombraPele} stroke={PRETO} strokeWidth={CONT_F} />

                  <Tronco id={id} v={v} uid={uid} />

                  {/* braços e mãos */}
                  <BracoDesenho b={pose.E} cor={v.braco} pele={pele} k={k} larg={id === 'ferreiro' ? 92 : 70} />
                  <BracoDesenho b={pose.D} cor={v.braco} pele={pele} k={k} larg={id === 'ferreiro' ? 92 : 70} dedo={gesto === 'apontar'} />

                  {/* cabeça: gira de leve com a expressão */}
                  <g transform={`rotate(${giro} 240 420)`}>
                    {/* orelhas de lobo, atrás da cabeça */}
                    <g>
                      <g transform={`translate(150 200) scale(${k}) translate(-150 -200)`}>
                        <path d={orelha} fill={PELO} stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />
                        <path d={orelhaDentro} fill={sombraPele} />
                      </g>
                      <g transform="translate(480 0) scale(-1 1)">
                        <g transform={`translate(150 200) scale(${k}) translate(-150 -200)`}>
                          <path d={orelha} fill={PELO} stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />
                          <path d={orelhaDentro} fill={sombraPele} />
                        </g>
                      </g>
                    </g>

                    <CabeloTras id={id} cor={v.cabelo} />
                    <path d={tufos(240, 250, 122, 136, 24, 0.14 * k)} fill={PELO} stroke={PRETO} strokeWidth={CONT_F} opacity={k} />
                    <Celula id={`${uid}-cab`} d={CABECA} cor={pele} sombra={sombraPele} />
                    <CabeloFrente id={id} cor={v.cabelo} />
                    <Chapeu id={id} v={v} k={k} />

                    {/* bochechas */}
                    <g opacity={cara.bochecha}>
                      <circle cx={170} cy={296} r={20} fill="#ff6b8a" />
                      <circle cx={310} cy={296} r={20} fill="#ff6b8a" />
                    </g>

                    {/* focinho de lobo, cresce com o lobo */}
                    <g transform={`translate(240 292) scale(${k}) translate(-240 -292)`}>
                      <ellipse cx={240} cy={292} rx={54} ry={40} fill="#e6c49c" stroke={PRETO} strokeWidth={CONT_F} />
                      <ellipse cx={240} cy={272} rx={20} ry={14} fill={PRETO} />
                    </g>
                    {k < 0.5 && <path d="M236 270 Q240 278 244 270" fill="none" stroke={PRETO} strokeWidth={7} strokeLinecap="round" />}

                    <PeloRosto id={id} v={v} />

                    {/* olhos e sobrancelhas */}
                    <OlhoDesenho uid={uid} x={196} y={240} cara={cara} ab={ab} lobo={k} pele={pele} morto={morto} deriva={deriva} />
                    <OlhoDesenho uid={uid} x={284} y={240} cara={cara} ab={ab} lobo={k} pele={pele} morto={morto} deriva={deriva} />
                    {!morto && <Sobrancelhas cara={cara} cor={v.cabelo} />}
                    {id === 'boticaria' && (
                      <g fill="rgba(200,240,255,0.25)" stroke={PRETO} strokeWidth={CONT_F}>
                        <circle cx={196} cy={240} r={38} />
                        <circle cx={284} cy={240} r={38} />
                        <path d="M234 240 Q240 230 246 240" fill="none" />
                      </g>
                    )}

                    {/* boca e presas */}
                    {!morto && desenhaBoca(cara.boca, fala)}
                    {morto && <ellipse cx={240} cy={314} rx={15} ry={19} fill={PRETO} />}
                    <g opacity={clamp((k - 0.5) * 2, 0, 1)}>
                      <path d="M222 320 L229 344 L236 320 Z" fill="#ffffff" stroke={PRETO} strokeWidth={5} strokeLinejoin="round" />
                      <path d="M244 320 L251 344 L258 320 Z" fill="#ffffff" stroke={PRETO} strokeWidth={5} strokeLinejoin="round" />
                    </g>

                    <Extras tipo={cara.extra} t={t} />
                  </g>
                </g>

                {/* Objetos na frente */}
                <Frente id={id} pose={pose} t={t} />
              </g>
            </g>
          </g>
        </g>

      </svg>
    </div>
  );
};
