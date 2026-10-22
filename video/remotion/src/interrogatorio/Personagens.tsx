// Personagens do "Interrogatório das IAs": busto cartoon (cabeça, ombros e braços) em SVG puro.
// Ficam atrás da bancada (que é outro componente, na frente, e cobre a parte de baixo).
// Sistema de coordenadas: viewBox 900x1000, centro x = 450, base do busto em y = 1000.
// Estilo do canal (como o Crewmate4): contorno grosso #14141f, cores chapadas,
// sombra de cel shading e um brilho. Nada de logotipo: cada IA tem cor + traço próprio.
import React, {useId} from 'react';
import {FONT} from '../theme';

export type IA = 'gpt' | 'claude' | 'deepseek' | 'glm' | 'minimax' | 'qwen';
export type Expressao =
  | 'neutro'
  | 'confiante'
  | 'nervoso'
  | 'suando'
  | 'bravo'
  | 'chocado'
  | 'rindo'
  | 'pensando'
  | 'culpado'
  | 'desconfiado';

export const IAS: Record<IA, {nome: string; cor: string}> = {
  gpt: {nome: 'GPT', cor: '#10a37f'},
  claude: {nome: 'Claude', cor: '#d97a47'},
  deepseek: {nome: 'DeepSeek', cor: '#2f6bff'},
  glm: {nome: 'GLM', cor: '#0f9d8a'},
  minimax: {nome: 'MiniMax', cor: '#e2325a'},
  qwen: {nome: 'Qwen', cor: '#6a4cff'},
};

type Acao = 'nenhuma' | 'bater_mesa' | 'apontar' | 'cruzar_bracos' | 'mao_no_queixo';
type Boca = 'reta' | 'torto' | 'torto_baixo' | 'zigzag' | 'riso' | 'gritar' | 'o' | 'rindo' | 'biquinho' | 'amarelo';
type Extra = 'nenhum' | 'veia' | 'interrogacao' | 'exclamacao' | 'pontos' | 'gota' | 'gotas';

// Cada expressão mexe em sobrancelhas, olhos, boca e em um extra (símbolo do quadrinho).
type Rosto = {
  ab: number; // pálpebra: 1 = aberta, 0 = fechada
  esc: number; // tamanho dos olhos
  pup: number; // tamanho da pupila
  olhar: [number, number]; // para onde a pupila vai
  arco?: boolean; // olhos fechados em arco (rindo)
  sobBase: number; // altura base das sobrancelhas (negativo = levantadas)
  sobDif: number; // assimetria: a esquerda sobe e a direita desce
  sobQueda: number; // ponta de dentro: positivo = franzida (bravo), negativo = preocupada
  sobArco: number; // curvatura da sobrancelha
  boca: Boca;
  rubor: number; // 0..1: bochecha vermelha
  extra: Extra;
};

const ROSTOS: Record<Expressao, Rosto> = {
  neutro: {ab: 1, esc: 1, pup: 1, olhar: [0, 0], sobBase: 0, sobDif: 0, sobQueda: 0, sobArco: 8, boca: 'reta', rubor: 0, extra: 'nenhum'},
  confiante: {ab: 0.55, esc: 1, pup: 1, olhar: [8, -4], sobBase: -6, sobDif: 20, sobQueda: -4, sobArco: 10, boca: 'torto', rubor: 0.05, extra: 'nenhum'},
  nervoso: {ab: 1, esc: 1.08, pup: 0.5, olhar: [-6, -6], sobBase: -18, sobDif: 0, sobQueda: -26, sobArco: 14, boca: 'zigzag', rubor: 0.15, extra: 'gota'},
  suando: {ab: 1, esc: 1.15, pup: 0.8, olhar: [0, 6], sobBase: -14, sobDif: 0, sobQueda: -16, sobArco: 14, boca: 'riso', rubor: 0.5, extra: 'gotas'},
  bravo: {ab: 0.5, esc: 1, pup: 1, olhar: [0, 0], sobBase: 14, sobDif: 0, sobQueda: 40, sobArco: 2, boca: 'gritar', rubor: 0.65, extra: 'veia'},
  chocado: {ab: 1, esc: 1.4, pup: 0.35, olhar: [0, 0], sobBase: -44, sobDif: 0, sobQueda: 0, sobArco: 34, boca: 'o', rubor: 0, extra: 'exclamacao'},
  rindo: {ab: 1, esc: 1, pup: 1, olhar: [0, 0], arco: true, sobBase: -8, sobDif: 0, sobQueda: -6, sobArco: 12, boca: 'rindo', rubor: 0.6, extra: 'nenhum'},
  pensando: {ab: 1, esc: 1, pup: 0.9, olhar: [16, -22], sobBase: -4, sobDif: 24, sobQueda: 0, sobArco: 10, boca: 'biquinho', rubor: 0, extra: 'pontos'},
  culpado: {ab: 0.9, esc: 1, pup: 0.9, olhar: [-24, 10], sobBase: 2, sobDif: 0, sobQueda: -14, sobArco: 6, boca: 'amarelo', rubor: 0.4, extra: 'gota'},
  desconfiado: {ab: 0.42, esc: 1, pup: 0.9, olhar: [-18, 0], sobBase: 4, sobDif: 0, sobQueda: 18, sobArco: 2, boca: 'torto_baixo', rubor: 0, extra: 'interrogacao'},
};

// Visual de cada IA: cores chapadas, tamanho da cabeça
type Visual = {
  pele: string;
  sombra: string;
  cabelo: string;
  roupa: string;
  detalhe: string;
  sobr: string;
  rx: number;
  ry: number;
};

const VISUAL: Record<IA, Visual> = {
  gpt: {pele: '#f2c7a0', sombra: '#d4a07a', cabelo: '#2a1d14', roupa: '#2b3140', detalhe: '#10a37f', sobr: '#2a1d14', rx: 160, ry: 186},
  claude: {pele: '#e9b48c', sombra: '#c98b62', cabelo: '#d9733a', roupa: '#d97a47', detalhe: '#fbe3cf', sobr: '#7a3a1c', rx: 162, ry: 184},
  deepseek: {pele: '#f7d7c2', sombra: '#d6ab94', cabelo: '#17171f', roupa: '#2f6bff', detalhe: '#f2f5ff', sobr: '#17171f', rx: 160, ry: 186},
  glm: {pele: '#c58a5e', sombra: '#97613c', cabelo: '#9aa0ad', roupa: '#f4f6f7', detalhe: '#0f9d8a', sobr: '#9aa0ad', rx: 158, ry: 190},
  minimax: {pele: '#f0bc93', sombra: '#c4886a', cabelo: '#2a0f18', roupa: '#e2325a', detalhe: '#ffffff', sobr: '#2a0f18', rx: 160, ry: 188},
  qwen: {pele: '#ffe2cf', sombra: '#e3b59b', cabelo: '#6a4cff', roupa: '#6a4cff', detalhe: '#ffffff', sobr: '#3a2296', rx: 176, ry: 182},
};

const ORDEM: IA[] = ['gpt', 'claude', 'deepseek', 'glm', 'minimax', 'qwen'];
const PRETO = '#14141f';
const CONT = 12; // contorno principal (unidades do viewBox; ~5 px na altura padrão)
const CONT_F = 8; // contorno de detalhes
const CX = 450;
const VW = 900;
const VH = 1000;
const TORSO = 'M150 1000 C150 800 170 690 300 650 Q450 620 600 650 C730 690 750 800 750 1000 Z';

// Pseudo-aleatório determinístico (para a boca "variar" sem piscar de forma aleatória de verdade)
const rnd = (n: number): number => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Escurece (k < 1) ou clareia (k > 1) uma cor #rrggbb
const tom = (hex: string, k: number): string => {
  const n = parseInt(hex.slice(1), 16);
  const canais = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const r = k < 1 ? v * k : v + (255 - v) * (k - 1);
    return Math.max(0, Math.min(255, Math.round(r)));
  });
  return '#' + canais.map((v) => v.toString(16).padStart(2, '0')).join('');
};

// Membro com contorno: um traço grosso preto por baixo e a cor por cima
const Membro: React.FC<{d: string; cor: string; w?: number}> = ({d, cor, w = 92}) => (
  <g>
    <path d={d} fill="none" stroke={PRETO} strokeWidth={w + CONT * 2} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={cor} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const Mao: React.FC<{x: number; y: number; pele: string; r?: number}> = ({x, y, pele, r = 42}) => (
  <circle cx={x} cy={y} r={r} fill={pele} stroke={PRETO} strokeWidth={CONT} />
);

// Gota de suor: cai e pisca de leve; posição no sistema do busto
const Gota: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      d="M0 -26 C10 -12 20 0 20 10 A20 20 0 0 1 -20 10 C-20 0 -10 -12 0 -26 Z"
      fill="#8fe3ff"
      stroke={PRETO}
      strokeWidth={7}
      strokeLinejoin="round"
    />
    <path d="M-9 4 Q-9 14 -2 16" stroke="#ffffff" strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);

// Olho: branco com pupila, pálpebra que cobre a parte de cima (abertura) e contorno
const Olho: React.FC<{
  cx: number;
  cy: number;
  esc: number;
  ab: number;
  pup: number;
  gx: number;
  gy: number;
  pele: string;
  id: string;
  arco?: boolean;
}> = ({cx, cy, esc, ab, pup, gx, gy, pele, id, arco}) => {
  if (arco) {
    // olho fechado de tanto rir: arco para cima
    return (
      <path
        d={`M${cx - 30} ${cy + 6} Q${cx} ${cy - 30} ${cx + 30} ${cy + 6}`}
        fill="none"
        stroke={PRETO}
        strokeWidth={12}
        strokeLinecap="round"
      />
    );
  }
  const rx = 34 * esc;
  const ry = 39 * esc;
  const cobre = (2 * ry + 8) * (1 - ab); // quanto da pálpebra está fechado
  const bordaPalpebra = cy - ry - 4 + cobre;
  const px = Math.max(-rx * 0.45, Math.min(rx * 0.45, gx));
  const py = Math.max(-ry * 0.4, Math.min(ry * 0.4, gy));
  return (
    <g>
      <clipPath id={id}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
      </clipPath>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#ffffff" />
      <g clipPath={`url(#${id})`}>
        <circle cx={cx + px} cy={cy + py} r={16 * pup + 1} fill={PRETO} />
        <circle cx={cx + px + 5} cy={cy + py - 6} r={Math.max(3, 5.5 * pup)} fill="#ffffff" />
        <rect x={cx - rx - 4} y={cy - ry - 4} width={2 * rx + 8} height={cobre} fill={pele} />
        {cobre > 1 && <line x1={cx - rx - 4} x2={cx + rx + 4} y1={bordaPalpebra} y2={bordaPalpebra} stroke={PRETO} strokeWidth={9} />}
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={PRETO} strokeWidth={8} />
    </g>
  );
};

// Sobrancelha: lado +1 é a do olho esquerdo (a ponta de dentro fica à direita dela)
const Sobrancelha: React.FC<{x: number; yb: number; queda: number; arco: number; lado: 1 | -1; cor: string}> = ({x, yb, queda, arco, lado, cor}) => {
  const xDentro = x + lado * 40;
  const xFora = x - lado * 40;
  const yDentro = yb + queda;
  const yFora = yb - queda * 0.3;
  return (
    <path
      d={`M${xFora} ${yFora} Q${x} ${yb - arco} ${xDentro} ${yDentro}`}
      fill="none"
      stroke={cor}
      strokeWidth={20}
      strokeLinecap="round"
    />
  );
};

// Boca: fechada (conforme a expressão) ou aberta quando está falando
const desenhaBoca = (b: Boca, abre: boolean, amp: number): React.ReactNode => {
  if (abre) {
    const w = b === 'gritar' ? 46 : b === 'o' ? 24 : b === 'rindo' ? 50 : b === 'riso' ? 44 : 36;
    const h = (10 + 26 * amp) * (b === 'o' ? 1.2 : 1);
    return (
      <g>
        <ellipse cx={CX} cy={512} rx={w} ry={h} fill={PRETO} />
        <ellipse cx={CX} cy={512 + h * 0.5} rx={w * 0.55} ry={h * 0.42} fill="#ff6b8a" />
      </g>
    );
  }
  const linha = {fill: 'none', stroke: PRETO, strokeWidth: 12, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (b) {
    case 'torto':
      return <path d="M410 514 Q450 524 492 494" {...linha} />;
    case 'torto_baixo':
      return <path d="M410 504 Q450 522 494 530" {...linha} />;
    case 'zigzag':
      return <path d="M404 512 L422 522 L438 504 L454 522 L470 504 L486 522 L496 512" {...linha} strokeWidth={10} />;
    case 'riso':
      return <path d="M396 500 Q424 512 450 500 Q476 512 504 500 Q496 556 450 556 Q404 556 396 500 Z" fill={PRETO} stroke={PRETO} strokeWidth={6} strokeLinejoin="round" />;
    case 'gritar':
      return (
        <g>
          <rect x={404} y={488} width={92} height={54} rx={16} fill={PRETO} />
          <rect x={412} y={492} width={76} height={12} rx={4} fill="#ffffff" />
        </g>
      );
    case 'o':
      return <ellipse cx={CX} cy={512} rx={24} ry={30} fill={PRETO} />;
    case 'rindo':
      return (
        <g>
          <path d="M392 494 Q450 480 508 494 Q500 560 450 560 Q400 560 392 494 Z" fill={PRETO} stroke={PRETO} strokeWidth={6} strokeLinejoin="round" />
          <rect x={404} y={492} width={92} height={14} rx={5} fill="#ffffff" />
          <ellipse cx={CX} cy={540} rx={26} ry={12} fill="#ff6b8a" />
        </g>
      );
    case 'biquinho':
      return <ellipse cx={468} cy={512} rx={10} ry={12} fill="none" stroke={PRETO} strokeWidth={9} />;
    case 'amarelo':
      return <path d="M398 498 Q420 520 440 504 Q460 520 502 496" {...linha} strokeWidth={11} />;
    case 'reta':
    default:
      return <path d="M415 512 L485 512" {...linha} />;
  }
};

// Detalhes do tronco de cada IA (terno, tricô, moletom, jaleco, camisa de gamer, capuz).
// Ficam dentro de um clip do próprio tronco, então não passam do contorno.
const detalhesTronco = (ia: IA, v: Visual): React.ReactNode => {
  switch (ia) {
    case 'gpt': {
      // terno escuro, camisa branca em V, gravata e broche de flor verde
      const petalas = [0, 72, 144, 216, 288].map((a) => {
        const rad = (a * Math.PI) / 180;
        return <circle key={a} cx={336 + Math.cos(rad) * 13} cy={778 + Math.sin(rad) * 13} r={10} fill={v.detalhe} stroke={PRETO} strokeWidth={5} />;
      });
      return (
        <g>
          <path d="M386 650 L450 800 L514 650 Z" fill="#f4f4f6" stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />
          <path d="M444 690 L456 690 L466 760 L450 806 L434 760 Z" fill="#0b0d12" stroke={PRETO} strokeWidth={5} strokeLinejoin="round" />
          <path d="M386 650 L330 790 L318 1010 M514 650 L570 790 L582 1010" fill="none" stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />
          {petalas}
          <circle cx={336} cy={778} r={7} fill="#ffffff" stroke={PRETO} strokeWidth={4} />
        </g>
      );
    }
    case 'claude': {
      // suéter de tricô: gola em V e pontinhos de tricô em zigue-zague
      const pontos: React.ReactNode[] = [];
      for (let j = 0; j < 5; j++) {
        for (let i = 0; i < 6; i++) {
          const x = 320 + i * 64 + (j % 2) * 32;
          const y = 780 + j * 44;
          pontos.push(
            <path key={`${i}-${j}`} d={`M${x} ${y} l16 -18 l16 18`} fill="none" stroke={tom(v.roupa, 0.72)} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />,
          );
        }
      }
      return (
        <g>
          {pontos}
          <path d="M372 652 Q450 748 528 652 L520 640 Q450 700 380 640 Z" fill={v.detalhe} stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />
        </g>
      );
    }
    case 'deepseek':
      // cordões do capuz e bolso canguru
      return (
        <g>
          <path d="M432 648 Q426 700 428 770 M468 648 Q474 700 472 770" fill="none" stroke={PRETO} strokeWidth={CONT_F + 6} strokeLinecap="round" />
          <path d="M432 648 Q426 700 428 770 M468 648 Q474 700 472 770" fill="none" stroke={v.detalhe} strokeWidth={6} strokeLinecap="round" />
          <rect x={368} y={856} width={164} height={120} rx={34} fill={tom(v.roupa, 0.8)} stroke={PRETO} strokeWidth={CONT_F} />
        </g>
      );
    case 'glm':
      // jaleco branco com lapela verde-azulada, gravata-borboleta e caneta no bolso
      return (
        <g>
          <path d="M392 650 L450 790 L508 650 Z" fill={v.detalhe} stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />
          <path d="M392 650 L326 780 L338 1010 M508 650 L574 780 L562 1010" fill="none" stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />
          <rect x={548} y={838} width={72} height={80} rx={8} fill="none" stroke={PRETO} strokeWidth={CONT_F} />
          <rect x={566} y={800} width={16} height={64} rx={6} fill="#2f6bff" stroke={PRETO} strokeWidth={5} />
          <path d="M450 668 L414 644 L414 692 Z M450 668 L486 644 L486 692 Z" fill={v.detalhe} stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />
          <circle cx={450} cy={668} r={8} fill={v.detalhe} stroke={PRETO} strokeWidth={5} />
        </g>
      );
    case 'minimax':
      // moletom com zíper e duas listras
      return (
        <g>
          <rect x={0} y={900} width={VW} height={26} fill="#ffffff" />
          <rect x={0} y={936} width={VW} height={12} fill="#ffffff" />
          <path d="M450 650 L450 1010" stroke="#ffffff" strokeWidth={6} />
          <circle cx={450} cy={706} r={13} fill="#ffffff" stroke={PRETO} strokeWidth={5} />
        </g>
      );
    case 'qwen':
      // gola de capuz com cordões e pompons
      return (
        <g>
          <path d="M326 652 Q450 606 574 652 Q530 712 450 712 Q370 712 326 652 Z" fill={tom(v.roupa, 0.82)} stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />
          <path d="M430 700 L424 772 M470 700 L476 772" fill="none" stroke={PRETO} strokeWidth={CONT_F + 6} strokeLinecap="round" />
          <path d="M430 700 L424 772 M470 700 L476 772" fill="none" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
          <circle cx={424} cy={786} r={14} fill="#ffffff" stroke={PRETO} strokeWidth={5} />
          <circle cx={476} cy={786} r={14} fill="#ffffff" stroke={PRETO} strokeWidth={5} />
        </g>
      );
  }
};

const Tronco: React.FC<{ia: IA; v: Visual; uid: string}> = ({ia, v, uid}) => {
  const id = `${uid}tronco`;
  return (
    <g>
      <clipPath id={id}>
        <path d={TORSO} />
      </clipPath>
      <path d={TORSO} fill={v.roupa} />
      <g clipPath={`url(#${id})`}>
        {/* cel shading: a sombra fica no lado direito */}
        <ellipse cx={830} cy={780} rx={250} ry={380} fill={tom(v.roupa, 0.74)} />
        {detalhesTronco(ia, v)}
      </g>
      <path d={TORSO} fill="none" stroke={PRETO} strokeWidth={CONT} strokeLinejoin="round" />
    </g>
  );
};

// Atrás da cabeça: sol/estrela (Claude), capuz de baleia (DeepSeek), espinhos (MiniMax), capuz de gato (Qwen)
const Fundo: React.FC<{ia: IA; v: Visual}> = ({ia, v}) => {
  switch (ia) {
    case 'claude': {
      const pts: string[] = [];
      for (let i = 0; i < 20; i++) {
        const rr = i % 2 === 0 ? 268 : 200;
        const a = (i * Math.PI) / 10 - Math.PI / 2;
        pts.push(`${(CX + rr * Math.cos(a)).toFixed(1)},${(400 + rr * Math.sin(a)).toFixed(1)}`);
      }
      return <polygon points={pts.join(' ')} fill={v.cabelo} stroke={PRETO} strokeWidth={CONT} strokeLinejoin="round" />;
    }
    case 'deepseek':
      return (
        <g strokeLinejoin="round">
          <path d="M262 470 C236 260 318 124 450 124 C582 124 664 260 638 470 L650 580 L250 580 Z" fill={v.roupa} stroke={PRETO} strokeWidth={CONT} />
          {/* barbatana da baleia no alto do capuz */}
          <path d="M410 150 Q426 62 530 40 Q500 104 508 150 Z" fill={v.roupa} stroke={PRETO} strokeWidth={CONT} />
        </g>
      );
    case 'minimax': {
      const espinhos: React.ReactNode[] = [];
      for (let k = 0; k < 7; k++) {
        const a = -Math.PI * (0.94 - k * 0.157);
        const p = (rr: number, ang: number) => `${(CX + rr * Math.cos(ang)).toFixed(1)},${(400 + rr * Math.sin(ang)).toFixed(1)}`;
        espinhos.push(
          <polygon key={k} points={`${p(190, a - 0.14)} ${p(304, a)} ${p(190, a + 0.14)}`} fill={v.cabelo} stroke={PRETO} strokeWidth={CONT_F} strokeLinejoin="round" />,
        );
      }
      return <g>{espinhos}</g>;
    }
    case 'qwen':
      return (
        <g strokeLinejoin="round">
          <path d="M292 318 L298 140 L392 232 Z" fill={v.roupa} stroke={PRETO} strokeWidth={CONT} />
          <path d="M608 318 L602 140 L508 232 Z" fill={v.roupa} stroke={PRETO} strokeWidth={CONT} />
          <path d="M312 290 L316 186 L370 236 Z" fill="#ffb3c7" />
          <path d="M588 290 L584 186 L530 236 Z" fill="#ffb3c7" />
          <ellipse cx={CX} cy={400} rx={206} ry={214} fill={v.roupa} stroke={PRETO} strokeWidth={CONT} />
        </g>
      );
    default:
      return null;
  }
};

// Cabelo que fica na frente da cabeça (depois do rosto)
const CabeloFrente: React.FC<{ia: IA; v: Visual; clipCabeca: string}> = ({ia, v, clipCabeca}) => {
  switch (ia) {
    case 'gpt':
      // gel: topete penteado para trás, com brilho
      return (
        <g>
          <path d="M284 386 C262 214 344 150 452 150 C562 150 640 214 616 386 C598 300 560 262 452 258 C346 262 302 300 284 386 Z" fill={v.cabelo} stroke={PRETO} strokeWidth={CONT} strokeLinejoin="round" />
          <path d="M352 212 Q410 178 470 186" stroke="#ffffff" strokeWidth={12} strokeLinecap="round" fill="none" opacity={0.35} />
        </g>
      );
    case 'claude':
      // franja cacheada por cima da estrela
      return <path d="M304 352 C300 262 368 226 452 232 C540 226 604 262 600 352 C568 302 528 290 480 300 C440 286 350 300 304 352 Z" fill={tom(v.cabelo, 0.86)} stroke={PRETO} strokeWidth={CONT} strokeLinejoin="round" />;
    case 'deepseek':
      // cabelo bagunçado de quem programa a noite inteira
      return (
        <path
          d="M286 380 L300 300 L320 330 L332 254 L362 296 L384 228 L410 280 L440 214 L460 276 L498 226 L508 284 L546 240 L556 300 L598 262 L610 336 L622 380 C590 320 320 320 286 380 Z"
          fill={v.cabelo}
          stroke={PRETO}
          strokeWidth={CONT}
          strokeLinejoin="round"
        />
      );
    case 'glm':
      // careca no topo com tufos brancos nas laterais (ficam em cima das orelhas)
      // careca no topo; cabelo grisalho só nas laterais, recortado pelo contorno da cabeça
      return (
        <g clipPath={`url(#${clipCabeca})`}>
          <path
            d={`M${CX - v.rx - 8} 250 L${CX - v.rx + 40} 250 Q${CX - v.rx + 26} 330 ${CX - v.rx + 44} 410 Q${CX - v.rx + 30} 470 ${CX - v.rx + 46} 500 L${CX - v.rx - 8} 500 Z`}
            fill={v.cabelo}
            stroke={PRETO}
            strokeWidth={CONT_F}
            strokeLinejoin="round"
          />
          <path
            d={`M${CX + v.rx + 8} 250 L${CX + v.rx - 40} 250 Q${CX + v.rx - 26} 330 ${CX + v.rx - 44} 410 Q${CX + v.rx - 30} 470 ${CX + v.rx - 46} 500 L${CX + v.rx + 8} 500 Z`}
            fill={v.cabelo}
            stroke={PRETO}
            strokeWidth={CONT_F}
            strokeLinejoin="round"
          />
        </g>
      );
    case 'minimax':
      // cabelo espetado para cima
      return (
        <g>
          <path d="M290 364 L298 256 L342 300 L366 196 L408 268 L450 176 L492 268 L534 196 L558 300 L602 256 L610 364 C560 306 340 306 290 364 Z" fill={v.cabelo} stroke={PRETO} strokeWidth={CONT} strokeLinejoin="round" />
          <path d="M450 176 L460 250" stroke="#ff6b8a" strokeWidth={7} strokeLinecap="round" />
        </g>
      );
    case 'qwen':
      // franja de capuz arredondada
      return <path d="M290 384 C282 270 344 228 450 230 C560 228 622 270 610 384 C586 336 556 302 520 318 C490 332 412 332 382 318 C346 302 316 336 290 384 Z" fill={v.cabelo} stroke={PRETO} strokeWidth={CONT} strokeLinejoin="round" />;
  }
};

// Acessórios no rosto: óculos (Claude e DeepSeek), headset gamer (MiniMax)
const AcessorioRosto: React.FC<{ia: IA; v: Visual}> = ({ia, v}) => {
  switch (ia) {
    case 'claude':
      return (
        <g stroke={PRETO} strokeWidth={9} fill="#ffffff" fillOpacity={0.14}>
          <circle cx={CX - 72} cy={430} r={50} />
          <circle cx={CX + 72} cy={430} r={50} />
          <path d={`M${CX - 22} 428 Q${CX} 416 ${CX + 22} 428`} fill="none" />
        </g>
      );
    case 'deepseek':
      return (
        <g stroke={PRETO} strokeWidth={12} strokeLinejoin="round" fill="#ffffff" fillOpacity={0.1}>
          <rect x={330} y={394} width={96} height={72} rx={14} />
          <rect x={474} y={394} width={96} height={72} rx={14} />
          <path d="M426 424 L474 424 M330 424 L292 418 M570 424 L608 418" fill="none" strokeWidth={9} />
          {/* olheiras de quem nunca dorme */}
          <ellipse cx={378} cy={482} rx={36} ry={10} fill="#5a5f9e" opacity={0.5} stroke="none" />
          <ellipse cx={522} cy={482} rx={36} ry={10} fill="#5a5f9e" opacity={0.5} stroke="none" />
        </g>
      );
    case 'minimax':
      return (
        <g strokeLinecap="round">
          {/* arco da faixa do headset */}
          <path d="M276 400 C246 150 654 150 624 400" fill="none" stroke={PRETO} strokeWidth={30} />
          <path d="M276 400 C246 150 654 150 624 400" fill="none" stroke="#3b3b44" strokeWidth={16} />
          {/* conchas vermelhas */}
          <rect x={236} y={366} width={50} height={86} rx={22} fill="#ff3b5c" stroke={PRETO} strokeWidth={CONT_F} />
          <rect x={614} y={366} width={50} height={86} rx={22} fill="#ff3b5c" stroke={PRETO} strokeWidth={CONT_F} />
          {/* microfone */}
          <path d="M262 440 Q258 520 330 520" fill="none" stroke={PRETO} strokeWidth={16} />
          <path d="M262 440 Q258 520 330 520" fill="none" stroke="#3b3b44" strokeWidth={7} />
          <circle cx={334} cy={522} r={14} fill="#3b3b44" stroke={PRETO} strokeWidth={5} />
        </g>
      );
    default:
      return null;
  }
};

// Orelhas (ficam atrás da cabeça)
const Orelhas: React.FC<{v: Visual; ia: IA}> = ({v, ia}) => {
  if (ia === 'qwen') return null;
  return (
    <g stroke={PRETO} strokeWidth={CONT} fill={v.pele}>
      <ellipse cx={CX - v.rx + 4} cy={430} rx={28} ry={42} />
      <ellipse cx={CX + v.rx - 4} cy={430} rx={28} ry={42} />
    </g>
  );
};

// Braços apoiados na bancada (ou o gesto escolhido). Ficam por cima do tronco e da cabeça.
const Bracos: React.FC<{acao: Acao; dir: number; v: Visual}> = ({acao, dir, v}) => {
  const manga = v.roupa;
  const repousoE = 'M236 690 Q178 800 210 912 Q240 966 332 956';
  const repousoD = 'M664 690 Q722 800 690 912 Q660 966 568 956';
  let esq: React.ReactNode = (
    <>
      <Membro d={repousoE} cor={manga} w={84} />
      <Mao x={334} y={956} pele={v.pele} />
    </>
  );
  let dir_: React.ReactNode = (
    <>
      <Membro d={repousoD} cor={manga} w={84} />
      <Mao x={566} y={956} pele={v.pele} />
    </>
  );
  switch (acao) {
    case 'bater_mesa': {
      // punho levantado, com linhas de impacto
      dir_ = (
        <>
          <Membro d="M664 690 Q792 730 724 632" cor={manga} />
          <Mao x={722} y={618} pele={v.pele} r={50} />
          <path d="M640 548 L606 516 M722 540 L722 490 M804 548 L838 516" stroke={PRETO} strokeWidth={16} strokeLinecap="round" />
          <path d="M640 548 L606 516 M722 540 L722 490 M804 548 L838 516" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" />
        </>
      );
      break;
    }
    case 'apontar': {
      // braço estendido para o lado de quem ele olha, indicador apontando
      const sx = dir > 0 ? 664 : 236;
      const hx = sx + dir * 236;
      dir_ = (
        <>
          <Membro d={`M${sx} 690 Q${sx + dir * 120} 706 ${hx} 716`} cor={manga} w={84} />
          <path d={`M${hx + dir * 30} 712 L${hx + dir * 104} 702`} stroke={PRETO} strokeWidth={40} strokeLinecap="round" />
          <path d={`M${hx + dir * 30} 712 L${hx + dir * 104} 702`} stroke={v.pele} strokeWidth={26} strokeLinecap="round" />
          <Mao x={hx} y={716} pele={v.pele} r={42} />
        </>
      );
      if (dir < 0) {
        // do lado esquerdo: o braço que aponta é o esquerdo, e o direito fica em repouso
        esq = dir_;
        dir_ = (
          <>
            <Membro d={repousoD} cor={manga} />
            <Mao x={566} y={956} pele={v.pele} />
          </>
        );
      }
      break;
    }
    case 'cruzar_bracos': {
      esq = (
        <>
          <Membro d="M236 690 Q262 830 560 842" cor={manga} />
          <Mao x={566} y={842} pele={v.pele} />
        </>
      );
      dir_ = (
        <>
          <Membro d="M664 690 Q638 830 340 850" cor={manga} />
          <Mao x={334} y={850} pele={v.pele} />
        </>
      );
      break;
    }
    case 'mao_no_queixo': {
      // cotovelo na mesa, mão no queixo (pose de quem pensa)
      dir_ = (
        <>
          <Membro d="M664 690 Q770 790 724 930" cor={manga} />
          <Membro d="M724 930 Q692 768 556 606" cor={manga} />
          <Mao x={550} y={600} pele={v.pele} r={44} />
        </>
      );
      break;
    }
    case 'nenhuma':
    default:
      break;
  }
  return (
    <g>
      {esq}
      {dir_}
    </g>
  );
};

// Balões e símbolos de quadrinho da expressão (ficam sobre a cabeça)
const Extras: React.FC<{extra: Extra; queda: number; rubor: number}> = ({extra, queda}) => {
  switch (extra) {
    case 'veia':
      return (
        <g transform="translate(636 280)">
          {[
            [-15, -15],
            [15, -15],
            [-15, 15],
            [15, 15],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={15} fill="#e53935" stroke={PRETO} strokeWidth={6} />
          ))}
        </g>
      );
    case 'gota':
      return <Gota x={634} y={300 + queda * 0.3} />;
    case 'gotas':
      return (
        <g>
          <Gota x={250} y={300 + queda * 0.5} s={0.9} />
          <Gota x={652} y={262 + queda * 0.6} s={0.8} />
        </g>
      );
    case 'pontos':
      return (
        <g fill="#ffffff" stroke={PRETO} strokeWidth={6}>
          <circle cx={690} cy={300} r={9} />
          <circle cx={718} cy={262} r={13} />
          <circle cx={756} cy={206} r={20} />
        </g>
      );
    case 'interrogacao':
      return (
        <text x={694} y={250} fontFamily={FONT.comic} fontSize={170} fill="#f1cf6c" stroke={PRETO} strokeWidth={12} paintOrder="stroke">
          ?
        </text>
      );
    case 'exclamacao':
      return (
        <text x={696} y={250} fontFamily={FONT.comic} fontSize={170} fill="#ff8c80" stroke={PRETO} strokeWidth={12} paintOrder="stroke">
          !
        </text>
      );
    case 'nenhum':
    default:
      return null;
  }
};

export type PersonagemProps = {
  ia: IA;
  expressao: Expressao;
  falando: boolean;
  t: number;
  virado?: 'esquerda' | 'direita';
  altura?: number;
  estresse?: number;
  acao?: Acao;
};

export const Personagem: React.FC<PersonagemProps> = ({
  ia,
  expressao,
  falando,
  t,
  virado = 'direita',
  altura = 460,
  estresse = 0,
  acao = 'nenhuma',
}) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const v = VISUAL[ia];
  const r = ROSTOS[expressao];
  const dir = virado === 'esquerda' ? -1 : 1;
  // cada IA tem um desfasamento, para os piscares e a boca não ficarem sincronizados
  const tt = t + ORDEM.indexOf(ia) * 23;
  const largura = altura * 0.9;

  // piscar a cada ~3 s (95 quadros), fechado por 5
  const piscando = tt % 95 < 5;
  const ab = piscando && !r.arco ? 0.04 : r.ab;

  // boca falando: troca a cada 3-4 quadros, às vezes fica fechada, com abertura variável
  const quadro = Math.floor(tt / 3.4);
  const abre = falando && rnd(quadro) > 0.3;
  const amp = 0.4 + 0.6 * rnd(quadro + 500);

  // respiração (sobe até 2.5), balanço da cabeça e tremor com estresse alto
  const resp = 2.5 * (0.5 + 0.5 * Math.sin((tt * Math.PI * 2) / 90));
  const bal = 1.2 * Math.sin((tt * Math.PI * 2) / 120);
  const tremor = estresse > 0.8 ? 2.5 * Math.sin(tt * 2.3) : 0;

  // olhar: a pupila vai para o lado de "virado"; o nervoso fica olhando de um lado para o outro
  const gx = r.olhar[0] + dir * 5 + (expressao === 'nervoso' ? 7 * Math.sin(tt * 0.9) : 0);
  const gy = r.olhar[1] + (expressao === 'nervoso' ? 3 * Math.cos(tt * 1.3) : 0);

  // rosto avermelhado com estresse; a Qwen sempre tem bochecha rosada
  const rubor = Math.max(r.rubor, estresse * 0.75, ia === 'qwen' ? 0.55 : 0);
  const suando = estresse > 0.5;
  const queda = (tt * 1.6) % 50;

  const ySobE = 372 + r.sobBase - r.sobDif;
  const ySobD = 372 + r.sobBase + r.sobDif;

  return (
    <svg
      width={largura}
      height={altura}
      viewBox={`0 0 ${VW} ${VH}`}
      style={{position: 'absolute', left: -largura / 2, top: -altura, overflow: 'visible'}}
    >
      <g transform={`translate(${tremor} ${-resp})`}>
        {/* pescoço */}
        <rect x={CX - 56} y={500} width={112} height={170} fill={v.sombra} stroke={PRETO} strokeWidth={CONT} />

        {/* tronco com a roupa e os detalhes de cada IA */}
        <Tronco ia={ia} v={v} uid={uid} />

        {/* cabeça: inclina de leve para o lado que olha e balança */}
        <g transform={`rotate(${bal + dir * 1.2} ${CX} 640)`}>
          <Fundo ia={ia} v={v} />
          <Orelhas v={v} ia={ia} />

          <clipPath id={`${uid}cab`}>
            <ellipse cx={CX} cy={400} rx={v.rx} ry={v.ry} />
          </clipPath>
          <ellipse cx={CX} cy={400} rx={v.rx} ry={v.ry} fill={v.sombra} />
          <g clipPath={`url(#${uid}cab)`}>
            <ellipse cx={CX - 14} cy={384} rx={v.rx - 16} ry={v.ry - 16} fill={v.pele} />
            <path d={`M${CX - 120} 300 Q${CX - 100} 262 ${CX - 56} 248`} stroke="#ffffff" strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.28} />
          </g>
          <ellipse cx={CX} cy={400} rx={v.rx} ry={v.ry} fill="none" stroke={PRETO} strokeWidth={CONT} />

          {/* bochechas */}
          <ellipse cx={CX - 112} cy={498} rx={36} ry={20} fill="#ff4f6e" opacity={rubor} />
          <ellipse cx={CX + 112} cy={498} rx={36} ry={20} fill="#ff4f6e" opacity={rubor} />

          {/* olhos e sobrancelhas */}
          <Olho cx={CX - 72} cy={430} esc={r.esc} ab={ab} pup={r.pup} gx={gx} gy={gy} pele={v.pele} id={`${uid}oe`} arco={r.arco} />
          <Olho cx={CX + 72} cy={430} esc={r.esc} ab={ab} pup={r.pup} gx={gx} gy={gy} pele={v.pele} id={`${uid}od`} arco={r.arco} />
          <Sobrancelha x={CX - 72} yb={ySobE} queda={r.sobQueda} arco={r.sobArco} lado={1} cor={v.sobr} />
          <Sobrancelha x={CX + 72} yb={ySobD} queda={r.sobQueda} arco={r.sobArco} lado={-1} cor={v.sobr} />

          {/* nariz e boca */}
          <path d={`M${CX - 6} 468 Q${CX + 4} 484 ${CX + 10} 468`} fill="none" stroke={tom(v.pele, 0.6)} strokeWidth={7} strokeLinecap="round" />
          {desenhaBoca(r.boca, abre, amp)}

          {/* cabelo da frente e acessórios de rosto (por cima do rosto) */}
          <CabeloFrente ia={ia} v={v} clipCabeca={`${uid}cab`} />
          <AcessorioRosto ia={ia} v={v} />
        </g>

        {/* braços (gestos) por cima do tronco e da cabeça */}
        <Bracos acao={acao} dir={dir} v={v} />
      </g>

      {/* efeitos fora da cabeça: símbolos da expressão e suor de estresse */}
      <g transform={`translate(${tremor} ${-resp})`}>
        <g transform={`rotate(${bal + dir * 1.2} ${CX} 640)`}>
          <Extras extra={r.extra} queda={queda} rubor={rubor} />
        </g>
        {suando && (
          <g>
            <Gota x={262} y={300 + queda * 0.6} s={0.9} />
            <Gota x={640} y={250 + queda * 0.8} s={0.8} />
          </g>
        )}
      </g>
    </svg>
  );
};
