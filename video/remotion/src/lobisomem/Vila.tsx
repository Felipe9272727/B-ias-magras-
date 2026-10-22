// Praça de uma vila medieval de desenho animado (2.5D) para o episódio "Lobisomem".
// Tudo é SVG inline: sem imagem externa e sem emoji (regra do canal).
// Profundidade: cada camada tem um fator f (quanto anda com a câmera) e um zf (quanto dá zoom).
// Fundo: f pequeno (quase parado). Frente: f grande (passa rápido), como numa câmera real.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

export type CameraVila = {x: number; zoom: number}; // x em -1..1 (pan), zoom 1..1.8

const CONTORNO = '#14141f';
const ANCORA = {x: 960, y: 700}; // centro do zoom (fixo)
const FOGO = {x: 960, y: 790}; // pé da fogueira
const PAN = 300; // quanto a câmera anda (px) na camada do chão quando x = 1

// 8 lugares em oval em volta da fogueira. (x, y) é a base dos pés do aldeão.
// Fundo: escala ~0.76. Frente: escala ~1.1. A frente-centro fica livre para a fogueira.
export const LUGARES: {x: number; y: number; escala: number}[] = (() => {
  const angulos = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];
  return angulos.map((g) => {
    const a = (g * Math.PI) / 180;
    const s = Math.sin(a); // -0.92 no fundo, +0.92 na frente
    return {
      x: Math.round(960 + 600 * Math.cos(a)),
      y: Math.round(730 + 175 * s),
      escala: +(0.935 + 0.19 * s).toFixed(3),
    };
  });
})();

// ---------- utilitários ----------
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
// número pseudoaleatório fixo (para espalhar pinheiros, estrelas etc. sempre igual)
const rnd = (n: number) => {
  const s = Math.sin(n * 91.345 + 17.13) * 43758.5453;
  return s - Math.floor(s);
};
const hexRgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
// mistura duas cores hex: t=0 é a primeira (dia), t=1 é a segunda (noite)
const mix = (a: string, b: string, t: number) => {
  const A = hexRgb(a);
  const B = hexRgb(b);
  const k = clamp01(t);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};

// Paleta: [dia, noite]. A função cores(n) devolve a paleta para qualquer ponto entre dia e noite.
const TEMA = {
  ceuTopo: ['#4db2e8', '#050818'],
  ceuBase: ['#c4eaf7', '#22305f'],
  montLonge: ['#8fbcda', '#2a3669'],
  montPerto: ['#5f8aad', '#1c2550'],
  montSombra: ['#4b7399', '#131a3e'],
  florestaFundo: ['#2b6450', '#0d2822'],
  florestaFrente: ['#1d4d3d', '#081c18'],
  florestaSombra: ['#153a2e', '#04110e'],
  tronco: ['#6b4530', '#2a1e24'],
  chao: ['#88ba5a', '#2c4c40'],
  chaoClaro: ['#9ccb6c', '#34554a'],
  terra: ['#d7b07a', '#4e3d46'],
  pedra: ['#e0d4b6', '#66627c'],
  pedraSombra: ['#b5a88a', '#423f5a'],
  parede: ['#d39a5c', '#5f4143'],
  paredeSombra: ['#aa7046', '#44302f'],
  telhado: ['#e9c466', '#705d3c'],
  telhadoSombra: ['#c0933f', '#4c3c29'],
  madeira: ['#8f5d37', '#402c31'],
  torre: ['#bdb6a6', '#52506a'],
  telhadoTorre: ['#8a6a66', '#3a2b36'],
  sino: ['#f4c654', '#9d7d30'],
  janela: ['#4f7090', '#ffd66b'],
  lua: ['#f3efcc', '#f3efcc'],
  luaCratera: ['#cdc7a0', '#b3ad8a'],
  agua: ['#3f8fb3', '#16324f'],
  nuvem: ['#ffffff', '#34407a'],
  neblina: ['#ffffff', '#aebfff'],
  escuro: ['#0b1240', '#0b1240'],
};
type Chave = keyof typeof TEMA;
type Cores = Record<Chave, string>;
const cores = (n: number): Cores => {
  const o = {} as Cores;
  (Object.keys(TEMA) as Chave[]).forEach((k) => {
    o[k] = mix(TEMA[k][0], TEMA[k][1], n);
  });
  return o;
};

// ---------- dados fixos (gerados de forma determinística) ----------
const ESTRELAS = Array.from({length: 90}, (_, i) => ({
  x: rnd(i * 3 + 1) * 1920,
  y: rnd(i * 3 + 2) * 440,
  r: 1.3 + rnd(i * 3 + 3) * 2,
  fase: rnd(i + 500) * 6.28,
}));

const NUVENS = [
  {x: 260, y: 120, s: 1.0, v: 0.42},
  {x: 760, y: 236, s: 0.75, v: 0.3},
  {x: 1180, y: 96, s: 1.15, v: 0.5},
  {x: 1700, y: 214, s: 0.85, v: 0.36},
];
const BOLHAS_NUVEM: [number, number, number][] = [
  [0, 0, 40],
  [46, -20, 52],
  [98, -2, 40],
  [-46, 6, 34],
  [136, 12, 28],
];

const MONT_LONGE: [number, number][] = [
  [-120, 470], [90, 250], [290, 360], [520, 196], [770, 330], [990, 222],
  [1200, 340], [1430, 186], [1650, 320], [1860, 208], [2060, 470],
];
const MONT_PERTO: [number, number][] = [
  [-120, 480], [200, 380], [420, 440], [640, 350], [900, 430], [1120, 360],
  [1400, 450], [1640, 330], [1900, 430], [2060, 480],
];

const PINHEIROS_FUNDO = Array.from({length: 24}, (_, i) => ({
  x: -40 + i * 92 + rnd(i + 10) * 50,
  s: 0.55 + rnd(i + 20) * 0.2,
}));
const PINHEIROS_LATERAIS = [
  {x: 40, s: 1.15}, {x: 120, s: 1.0}, {x: 205, s: 1.2},
  {x: 1700, s: 1.1}, {x: 1800, s: 1.25}, {x: 1895, s: 1.05},
];

const CASAS = [
  {x: 150, base: 525, w: 258, h: 190},
  {x: 432, base: 505, w: 200, h: 157},
  {x: 1300, base: 512, w: 246, h: 185},
  {x: 1790, base: 528, w: 224, h: 168},
];

// tufos e flores do chão
const TUFOS = Array.from({length: 26}, (_, i) => ({x: rnd(i + 300) * 1920, y: 480 + rnd(i + 330) * 600}));
const FLORES = Array.from({length: 14}, (_, i) => ({
  x: rnd(i + 400) * 1920,
  y: 500 + rnd(i + 430) * 580,
  cor: ['#ffffff', '#ffd0e0', '#ffe36b'][i % 3],
}));

// pedrinhas da praça em anéis (perspectiva: anéis de dentro são menores)
const PEDRAS = [0.3, 0.5, 0.7, 0.9].flatMap((r, anel) => {
  const n = 12 + anel * 6;
  return Array.from({length: n}, (_, j) => {
    const a = (j / n) * Math.PI * 2 + anel * 0.4;
    return {x: 960 + 620 * r * Math.cos(a), y: 752 + 196 * r * Math.sin(a), r, k: 0.6 + r * 0.5};
  });
});

// vagalumes (aparecem à noite)
const VAGALUMES = Array.from({length: 16}, (_, i) => ({
  ax: 260 + rnd(i + 40) * 1400,
  ay: 540 + rnd(i + 80) * 330,
  fase: rnd(i + 120) * 6.28,
}));

// faíscas e labaredas da fogueira
const CAMADAS_FOGO = [
  {cor: '#d8432a', w: 130, h: 250, n: 5, sp: 0.19, espaco: 46, borda: true},
  {cor: '#ff8a2a', w: 96, h: 200, n: 4, sp: 0.23, espaco: 52, borda: false},
  {cor: '#ffd043', w: 62, h: 140, n: 3, sp: 0.29, espaco: 40, borda: false},
  {cor: '#fff6c9', w: 34, h: 74, n: 2, sp: 0.33, espaco: 26, borda: false},
];

// ---------- câmera (paralaxe) ----------
// Transformação de uma camada: escala em torno da ÂNCORA, deslocada pelo pan do fator f.
const transformaCamada = (cam: CameraVila, tremor: {x: number; y: number}, f: number, zf: number) => {
  const z = 1 + (cam.zoom - 1) * zf;
  const dx = -cam.x * PAN * f;
  return `translate(${ANCORA.x + tremor.x} ${ANCORA.y + tremor.y}) scale(${z}) translate(${-ANCORA.x + dx} ${-ANCORA.y})`;
};

// ---------- elementos do cenário ----------

// Pinheiro com três andares de copa; a metade direita fica mais escura (cel shading).
const Pinheiro = ({x, base, s, cor, sombra, c}: {x: number; base: number; s: number; cor: string; sombra: string; c: Cores}) => {
  const andares = [
    {ap: -300, by: -150, hw: 70},
    {ap: -222, by: -88, hw: 96},
    {ap: -146, by: -20, hw: 112},
  ];
  return (
    <g>
      <rect x={x - 14 * s} y={base - 40 * s} width={28 * s} height={44 * s} fill={c.tronco} stroke={CONTORNO} strokeWidth={4} />
      {andares.map((a, i) => {
        const ay = base + a.ap * s;
        const yb = base + a.by * s;
        const hw = a.hw * s;
        const forma = `M${x},${ay} L${x + hw},${yb} L${x - hw},${yb} Z`;
        return (
          <g key={i}>
            <path d={forma} fill={cor} />
            <path d={`M${x},${ay} L${x + hw},${yb} L${x},${yb} Z`} fill={sombra} />
            <path d={forma} fill="none" stroke={CONTORNO} strokeWidth={4} strokeLinejoin="round" />
          </g>
        );
      })}
    </g>
  );
};

// Montanha: linha de cumes + face direita sombreada em cada pico.
const Montanha = ({pts, base, cor, sombra}: {pts: [number, number][]; base: number; cor: string; sombra: string}) => {
  const contorno = 'M' + pts.map((p) => p.join(',')).join(' L') + ` L${pts[pts.length - 1][0]},${base} L${pts[0][0]},${base} Z`;
  const sombras: string[] = [];
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i];
    const prev = pts[i - 1];
    const next = pts[i + 1];
    if (py < prev[1] && py < next[1]) {
      sombras.push(`M${px},${py} L${next[0]},${next[1]} L${next[0]},${base} Z`);
    }
  }
  return (
    <g>
      <path d={contorno} fill={cor} />
      {sombras.map((d, i) => (
        <path key={i} d={d} fill={sombra} />
      ))}
      <path d={contorno} fill="none" stroke={CONTORNO} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

// Nuvem: primeiro desenha as bolas maiores (contorno), depois as bolas cheias: sai um só contorno.
const Nuvem = ({x, y, s, cor}: {x: number; y: number; s: number; cor: string}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g fill={CONTORNO}>
      {BOLHAS_NUVEM.map(([dx, dy, r], i) => (
        <circle key={i} cx={dx} cy={dy} r={r + 5} />
      ))}
    </g>
    <g fill={cor}>
      {BOLHAS_NUVEM.map(([dx, dy, r], i) => (
        <circle key={i} cx={dx} cy={dy} r={r} />
      ))}
    </g>
  </g>
);

// Casa de madeira com telhado de palha em forma de festão (escama) e janelas que acendem à noite.
const Casa = ({x, base, w, h, c, n}: {x: number; base: number; w: number; h: number; c: Cores; n: number}) => {
  const yTopo = base - h;
  const yBeira = yTopo + 8; // onde o telhado encontra a parede
  const rh = w * 0.48; // altura do telhado
  const L = x - w / 2 - 24;
  const R = x + w / 2 + 24;
  const passos = 6;
  const passo = (R - L) / passos;
  // telhado: triângulo com borda de festão (arcos para baixo)
  let teto = `M${L},${yBeira} L${x},${yBeira - rh} L${R},${yBeira}`;
  for (let i = 0; i < passos; i++) {
    teto += ` A${passo / 2},13 0 0 1 ${R - (i + 1) * passo},${yBeira}`;
  }
  teto += ' Z';
  const janela = mix(c.janela, '#ffd66b', n);
  const janelas = [-0.3, 0.16];
  return (
    <g>
      <rect x={x - w / 2} y={yTopo} width={w} height={h} fill={c.parede} />
      <rect x={x + w * 0.22} y={yTopo} width={w * 0.28} height={h} fill={c.paredeSombra} />
      {[1, 2, 3, 4, 5].map((k) => (
        <line key={k} x1={x - w / 2 + (k * w) / 6} x2={x - w / 2 + (k * w) / 6} y1={yTopo} y2={base} stroke={c.paredeSombra} strokeWidth={3} />
      ))}
      <rect x={x - w / 2} y={yTopo} width={w} height={h} fill="none" stroke={CONTORNO} strokeWidth={6} />
      {/* porta */}
      <rect x={x - w * 0.12} y={base - h * 0.55} width={w * 0.24} height={h * 0.55} fill={c.madeira} stroke={CONTORNO} strokeWidth={4} />
      {/* janelas: brilho de fundo + vidraça */}
      {janelas.map((dx, k) => (
        <g key={k}>
          <rect x={x + w * dx - 6} y={yTopo + h * 0.2 - 6} width={w * 0.14 + 12} height={h * 0.22 + 12} fill="#ffd66b" opacity={n * 0.8} filter="url(#vila-brilho)" />
          <rect x={x + w * dx} y={yTopo + h * 0.2} width={w * 0.14} height={h * 0.22} fill={janela} stroke={CONTORNO} strokeWidth={4} />
          <line x1={x + w * dx + w * 0.07} x2={x + w * dx + w * 0.07} y1={yTopo + h * 0.2} y2={yTopo + h * 0.42} stroke={CONTORNO} strokeWidth={3} />
        </g>
      ))}
      {/* telhado de palha: preenchimento, metade sombreada, fios de palha e contorno */}
      <path d={teto} fill={c.telhado} />
      <path d={`M${x},${yBeira - rh} L${R},${yBeira} L${x},${yBeira} Z`} fill={c.telhadoSombra} />
      <path d={teto} fill="none" stroke={c.telhadoSombra} strokeWidth={3} strokeDasharray="4 10" />
      <path d={teto} fill="none" stroke={CONTORNO} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

// Torre do sino: pedra com ameia de telhado escuro e sino que balança.
const Torre = ({x, base, w, h, c, f}: {x: number; base: number; w: number; h: number; c: Cores; f: number}) => {
  const topo = base - h;
  const balanco = Math.sin(f * 0.05) * 4;
  const yPivo = topo + 14;
  const yBolha = topo + 42;
  return (
    <g>
      <rect x={x - w / 2} y={topo} width={w} height={h} fill={c.torre} />
      <rect x={x + w * 0.12} y={topo} width={w * 0.38} height={h} fill={c.pedraSombra} />
      {[1, 2, 3, 4, 5, 6].map((k) => (
        <line key={k} x1={x - w / 2} x2={x + w / 2} y1={topo + (k * h) / 7} y2={topo + (k * h) / 7} stroke={c.pedraSombra} strokeWidth={3} />
      ))}
      <rect x={x - w / 2} y={topo} width={w} height={h} fill="none" stroke={CONTORNO} strokeWidth={6} />
      {/* abertura do sino */}
      <rect x={x - w * 0.22} y={topo + 12} width={w * 0.44} height={74} fill="#1b1a2c" stroke={CONTORNO} strokeWidth={4} />
      <g transform={`rotate(${balanco} ${x} ${yPivo})`}>
        <path
          d={`M${x - 22},${yBolha + 26} Q${x - 20},${yBolha - 10} ${x},${yBolha - 14} Q${x + 20},${yBolha - 10} ${x + 22},${yBolha + 26} Z`}
          fill={c.sino}
          stroke={CONTORNO}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <circle cx={x} cy={yBolha + 30} r={5} fill={CONTORNO} />
      </g>
      {/* telhado pontudo */}
      <path d={`M${x - w / 2 - 16},${topo} L${x},${topo - 170} L${x + w / 2 + 16},${topo} Z`} fill={c.telhadoTorre} />
      <path d={`M${x},${topo - 170} L${x + w / 2 + 16},${topo} L${x},${topo} Z`} fill={c.florestaSombra} opacity={0.5} />
      <path d={`M${x - w / 2 - 16},${topo} L${x},${topo - 170} L${x + w / 2 + 16},${topo} Z`} fill="none" stroke={CONTORNO} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};

// Poço de pedra com cobertura de madeira, balde e corda.
const Poco = ({x, base, c, n}: {x: number; base: number; c: Cores; n: number}) => (
  <g>
    {/* postes de madeira */}
    <rect x={x - 70} y={base - 212} width={12} height={116} fill={c.madeira} stroke={CONTORNO} strokeWidth={4} />
    <rect x={x + 58} y={base - 212} width={12} height={116} fill={c.madeira} stroke={CONTORNO} strokeWidth={4} />
    {/* corpo de pedra com fundo arredondado */}
    <path
      d={`M${x - 62},${base - 110} L${x - 62},${base} A62,22 0 0 0 ${x + 62},${base} L${x + 62},${base - 110} Z`}
      fill={c.pedra}
      stroke={CONTORNO}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <path d={`M${x + 20},${base - 110} L${x + 62},${base - 110} L${x + 62},${base} L${x + 20},${base} Z`} fill={c.pedraSombra} opacity={0.7} />
    {/* água */}
    <ellipse cx={x} cy={base - 110} rx={50} ry={16} fill={mix(c.agua, '#16324f', n * 0.2)} stroke={CONTORNO} strokeWidth={4} />
    {/* cobertura de palha */}
    <path d={`M${x - 96},${base - 214} L${x},${base - 272} L${x + 96},${base - 214} Z`} fill={c.telhado} stroke={CONTORNO} strokeWidth={5} strokeLinejoin="round" />
    <path d={`M${x},${base - 272} L${x + 96},${base - 214} L${x},${base - 214} Z`} fill={c.telhadoSombra} />
    <rect x={x - 80} y={base - 218} width={160} height={10} fill={c.madeira} stroke={CONTORNO} strokeWidth={3} />
    {/* corda e balde */}
    <line x1={x} x2={x} y1={base - 208} y2={base - 130} stroke={c.tronco} strokeWidth={3} />
    <path d={`M${x - 14},${base - 130} L${x + 14},${base - 130} L${x + 10},${base - 108} L${x - 10},${base - 108} Z`} fill={c.madeira} stroke={CONTORNO} strokeWidth={3} />
  </g>
);

// Barril de madeira com aros de metal (cel shading simples).
const Barril = ({x, base, c}: {x: number; base: number; c: Cores}) => (
  <g>
    <path
      d={`M${x - 26},${base - 70} Q${x},${base - 84} ${x + 26},${base - 70} L${x + 26},${base} Q${x},${base + 10} ${x - 26},${base} Z`}
      fill={c.madeira}
      stroke={CONTORNO}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    <path d={`M${x + 8},${base - 78} Q${x + 26},${base - 70} ${x + 26},${base - 70} L${x + 26},${base} L${x + 8},${base} Z`} fill={c.paredeSombra} opacity={0.6} />
    <line x1={x - 26} x2={x + 26} y1={base - 56} y2={base - 56} stroke={c.pedraSombra} strokeWidth={5} />
    <line x1={x - 26} x2={x + 26} y1={base - 14} y2={base - 14} stroke={c.pedraSombra} strokeWidth={5} />
  </g>
);

// Varal entre dois postes; as roupas balançam levemente.
const Varal = ({x1, x2, base, f, c}: {x1: number; x2: number; base: number; f: number; c: Cores}) => {
  const yt = base - 200;
  const meio = (x1 + x2) / 2;
  const roupas = ['#d9534f', '#3f8fd2', '#f2c04d', '#7fc46b'];
  const pontos = [0.2, 0.4, 0.6, 0.8];
  return (
    <g>
      <rect x={x1 - 6} y={yt} width={12} height={200} fill={c.madeira} stroke={CONTORNO} strokeWidth={4} />
      <rect x={x2 - 6} y={yt} width={12} height={200} fill={c.madeira} stroke={CONTORNO} strokeWidth={4} />
      <path d={`M${x1},${yt} Q${meio},${yt + 70} ${x2},${yt}`} fill="none" stroke={CONTORNO} strokeWidth={4} />
      {pontos.map((t, i) => {
        const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * meio + t * t * x2;
        const py = (1 - t) * (1 - t) * yt + 2 * (1 - t) * t * (yt + 70) + t * t * yt;
        const giro = Math.sin(f * 0.06 + i * 1.3) * 6;
        return (
          <g key={i} transform={`rotate(${giro} ${px} ${py})`}>
            <rect x={px - 13} y={py} width={26} height={44} fill={roupas[i]} stroke={CONTORNO} strokeWidth={3} />
          </g>
        );
      })}
    </g>
  );
};

// Cerca de madeira (usada no primeiro plano, desfocada).
const Cerca = ({x0, x1, y, c}: {x0: number; x1: number; y: number; c: Cores}) => {
  const postes = [];
  for (let x = x0; x <= x1; x += 110) postes.push(x);
  return (
    <g>
      <rect x={x0} y={y + 6} width={x1 - x0} height={18} fill={c.madeira} stroke={CONTORNO} strokeWidth={5} />
      <rect x={x0} y={y + 62} width={x1 - x0} height={18} fill={c.madeira} stroke={CONTORNO} strokeWidth={5} />
      {postes.map((px) => (
        <rect key={px} x={px - 16} y={y - 18} width={32} height={150} fill={c.madeira} stroke={CONTORNO} strokeWidth={5} />
      ))}
    </g>
  );
};

// Galho com folhas, para o primeiro plano desfocado.
const Galho = ({x, y, rot, len, cor}: {x: number; y: number; rot: number; len: number; cor: string}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={`M0,0 Q${len * 0.5},-50 ${len},10`} fill="none" stroke={cor} strokeWidth={34} strokeLinecap="round" />
    {[
      [0.35, -40, -25],
      [0.6, 20, 25],
      [0.85, -10, -30],
      [0.5, -60, -10],
    ].map(([t, dy, g], i) => (
      <ellipse key={i} cx={len * t} cy={dy} rx={70} ry={26} fill={cor} transform={`rotate(${g} ${len * t} ${dy})`} />
    ))}
  </g>
);

// Chama em forma de gota com ponta que se mexe (wob desloca a ponta).
const chama = (cx: number, base: number, w: number, h: number, wob: number) => {
  const tx = cx + wob;
  const ty = base - h;
  return `M${cx - w / 2},${base} C${cx - w * 0.75},${base - h * 0.3} ${tx - w * 0.3},${base - h * 0.62} ${tx},${ty} C${tx + w * 0.3},${base - h * 0.62} ${cx + w * 0.7},${base - h * 0.3} ${cx + w / 2},${base} Z`;
};

// Fogueira: 4 camadas de chamas (fora -> dentro), toras, pedras e faíscas.
const Fogueira = ({f, k, c}: {f: number; k: number; c: Cores}) => {
  const forca = Math.max(k, 0.04);
  return (
    <g>
      {/* pedras em volta do fogo (atrás das chamas) */}
      {Array.from({length: 9}, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return (
          <ellipse
            key={i}
            cx={FOGO.x + 150 * Math.cos(a)}
            cy={FOGO.y + 14 + 46 * Math.sin(a)}
            rx={26}
            ry={16}
            fill={c.pedra}
            stroke={CONTORNO}
            strokeWidth={4}
          />
        );
      })}
      {CAMADAS_FOGO.map((cam, ci) =>
        Array.from({length: cam.n}, (_, i) => {
          const off = (i - (cam.n - 1) / 2) * cam.espaco;
          const pulso = 0.84 + 0.16 * Math.sin(f * cam.sp + i * 2.1) + 0.04 * Math.sin(f * cam.sp * 2.9 + i * 0.7 + ci);
          const h = cam.h * forca * pulso;
          const w = cam.w * (0.6 + 0.4 * forca);
          const wob = Math.sin(f * 0.21 + i * 1.7 + ci) * cam.w * 0.12;
          return (
            <path
              key={`${ci}-${i}`}
              d={chama(FOGO.x + off, FOGO.y - 6, w, h, wob)}
              fill={cam.cor}
              stroke={cam.borda ? CONTORNO : undefined}
              strokeWidth={cam.borda ? 5 : 0}
              strokeLinejoin="round"
            />
          );
        }),
      )}
      {/* toras cruzadas */}
      <rect x={FOGO.x - 125} y={FOGO.y - 24} width={250} height={46} rx={23} fill={c.madeira} stroke={CONTORNO} strokeWidth={5} transform={`rotate(-14 ${FOGO.x} ${FOGO.y})`} />
      <rect x={FOGO.x - 125} y={FOGO.y - 24} width={250} height={46} rx={23} fill={c.madeira} stroke={CONTORNO} strokeWidth={5} transform={`rotate(12 ${FOGO.x} ${FOGO.y})`} />
      {/* faíscas que sobem e somem */}
      {Array.from({length: Math.round(16 * k)}, (_, i) => {
        const periodo = 70 + (i % 5) * 12;
        const t = ((f + i * 17) % periodo) / periodo;
        const x = FOGO.x + Math.sin(i * 2.7 + t * 5) * (30 + 60 * t) + (i % 2 ? 1 : -1) * 6 * t;
        const y = FOGO.y - 80 - t * 340;
        return <circle key={i} cx={x} cy={y} r={3.2 * (1 - t) + 1} fill={i % 3 ? '#ffd45a' : '#ff8a2a'} opacity={1 - t} />;
      })}
    </g>
  );
};

// ---------- cena completa ----------
export const PracaVila: React.FC<{
  camera: CameraVila;
  noite: number;
  aldeoes?: React.ReactNode[];
  fogo?: number;
  tremor?: number;
  uivo?: number;
}> = ({camera, noite, aldeoes = [], fogo = 1, tremor = 0, uivo = 0}) => {
  const f = useCurrentFrame();
  const n = clamp01(noite);
  const u = clamp01(uivo);
  const k = clamp01(fogo);
  const t = clamp01(tremor);
  const c = cores(n);
  const cam: CameraVila = {x: clamp(camera.x, -1, 1), zoom: clamp(camera.zoom, 1, 1.8)};
  // sacudida da câmera (tremor): deslocamento comum a todas as camadas
  const sacudida = {
    x: t * 24 * Math.sin(f * 1.7) * Math.cos(f * 0.9),
    y: t * 14 * Math.sin(f * 2.3 + 1),
  };
  const T = (fator: number, zf: number) => transformaCamada(cam, sacudida, fator, zf);

  // lua: cor passa a vermelha no uivo
  const corLua = mix(c.lua, '#ff4a3a', u);
  const corCratera = mix(c.luaCratera, '#b8362e', u);

  // pulso da fogueira
  const pulsoFogo = 0.93 + 0.07 * Math.sin(f * 0.3) + 0.03 * Math.sin(f * 0.77);

  // aldeões: os de trás (y menor) ficam atrás da fogueira, os da frente na frente
  const idx = aldeoes.slice(0, LUGARES.length);
  const atras = idx.map((no, i) => ({no, i})).filter(({i}) => LUGARES[i].y < FOGO.y);
  const frente = idx.map((no, i) => ({no, i})).filter(({i}) => LUGARES[i].y >= FOGO.y);
  const aldeao = ({no, i}: {no: React.ReactNode; i: number}) => (
    <g key={i} transform={`translate(${LUGARES[i].x} ${LUGARES[i].y}) scale(${LUGARES[i].escala})`}>
      {no}
    </g>
  );

  return (
    <AbsoluteFill style={{background: c.ceuBase}}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" style={{display: 'block'}}>
        <defs>
          <linearGradient id="vila-ceu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c.ceuTopo} />
            <stop offset="1" stopColor={c.ceuBase} />
          </linearGradient>
          <radialGradient id="vila-halo">
            <stop offset="0" stopColor={corLua} stopOpacity={0.6} />
            <stop offset="1" stopColor={corLua} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="vila-luz">
            <stop offset="0" stopColor="#ffe08a" stopOpacity={0.95} />
            <stop offset="0.4" stopColor="#ff8a2a" stopOpacity={0.5} />
            <stop offset="1" stopColor="#ff6a1a" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="vila-vinheta">
            <stop offset="0.55" stopColor="#000000" stopOpacity={0} />
            <stop offset="1" stopColor="#06050c" stopOpacity={0.7} />
          </radialGradient>
          <filter id="vila-desfoco" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={7} />
          </filter>
          <filter id="vila-brilho" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={8} />
          </filter>
          <filter id="vila-nevoa" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={24} />
          </filter>
        </defs>

        {/* ===== CÉU (quase parado) ===== */}
        <g transform={T(0.02, 0.1)}>
          <rect x={-300} y={-300} width={2520} height={1000} fill="url(#vila-ceu)" />
          {/* estrelas (só à noite) */}
          {ESTRELAS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff7d6" opacity={n * (0.55 + 0.45 * Math.sin(f * 0.07 + s.fase))} />
          ))}
        </g>

        {/* ===== SOL (dia) e LUA CHEIA (noite) ===== */}
        <g transform={T(0.03, 0.15)}>
          {/* sol com raios girando */}
          <g opacity={1 - n} transform="translate(400 190)">
            <g transform={`rotate(${f * 0.25})`} fill="#ffd65c">
              {Array.from({length: 12}, (_, i) => (
                <rect key={i} x={-10} y={-150} width={20} height={60} transform={`rotate(${i * 30})`} />
              ))}
            </g>
            <circle r={80} fill="#ffd65c" stroke={CONTORNO} strokeWidth={6} />
            <circle cx={-18} cy={-18} r={44} fill="#fff0a0" />
          </g>
          {/* lua grande com halo; cor vermelha no uivo */}
          <g opacity={clamp01(n * 1.2)} transform="translate(1380 160)">
            <circle r={280} fill="url(#vila-halo)" opacity={0.5 + 0.5 * u} />
            <circle r={132} fill={corLua} stroke={CONTORNO} strokeWidth={6} />
            <circle cx={-44} cy={-36} r={28} fill={corCratera} />
            <circle cx={36} cy={-58} r={16} fill={corCratera} />
            <circle cx={48} cy={30} r={32} fill={corCratera} />
            <circle cx={-18} cy={58} r={18} fill={corCratera} />
            <circle cx={-80} cy={28} r={13} fill={corCratera} />
            <circle cx={12} cy={-6} r={9} fill={corCratera} />
          </g>
        </g>

        {/* ===== NUVENS (passam devagar) ===== */}
        <g transform={T(0.1, 0.2)}>
          {NUVENS.map((nv, i) => {
            const x = ((nv.x + f * nv.v * 1.2) % 2400) - 240;
            return <Nuvem key={i} x={x} y={nv.y} s={nv.s} cor={c.nuvem} />;
          })}
        </g>

        {/* ===== MONTANHAS (paralaxe leve) ===== */}
        <g transform={T(0.14, 0.3)}>
          <Montanha pts={MONT_LONGE} base={520} cor={c.montLonge} sombra={c.montSombra} />
        </g>
        <g transform={T(0.22, 0.4)}>
          <Montanha pts={MONT_PERTO} base={530} cor={c.montPerto} sombra={c.montSombra} />
        </g>

        {/* ===== FLORESTA DE PINHEIROS (fundo) ===== */}
        <g transform={T(0.35, 0.55)}>
          {PINHEIROS_FUNDO.map((p, i) => (
            <Pinheiro key={i} x={p.x} base={500} s={p.s} cor={c.florestaFundo} sombra={c.florestaSombra} c={c} />
          ))}
          {PINHEIROS_LATERAIS.map((p, i) => (
            <Pinheiro key={`l${i}`} x={p.x} base={575} s={p.s} cor={c.florestaFrente} sombra={c.florestaSombra} c={c} />
          ))}
          {/* neblina do uivo */}
          {[300, 1000, 1600].map((x, i) => (
            <ellipse key={i} cx={x} cy={520} rx={480} ry={60} fill={c.neblina} opacity={0.5 * u} filter="url(#vila-nevoa)" />
          ))}
        </g>

        {/* ===== CASAS E TORRE DO SINO (meio) ===== */}
        <g transform={T(0.55, 0.75)}>
          {CASAS.map((cs, i) => (
            <Casa key={i} x={cs.x} base={cs.base} w={cs.w} h={cs.h} c={c} n={n} />
          ))}
          <Torre x={1580} base={520} w={130} h={300} c={c} f={f} />
        </g>

        {/* ===== CHÃO E PRAÇA (acompanha a câmera por inteiro) ===== */}
        <g transform={T(1, 1)}>
          <rect x={-300} y={470} width={2520} height={800} fill={c.chao} />
          {/* caminho de terra em perspectiva, saindo do horizonte */}
          <path d="M540,470 L700,470 L400,1100 L-20,1100 Z" fill={c.terra} />
          {TUFOS.map((tf, i) => (
            <path
              key={i}
              d={`M${tf.x - 9},${tf.y} L${tf.x - 4},${tf.y - 16} L${tf.x},${tf.y} L${tf.x + 4},${tf.y - 20} L${tf.x + 9},${tf.y} Z`}
              fill={c.chaoClaro}
            />
          ))}
          {FLORES.map((fl, i) => (
            <circle key={i} cx={fl.x} cy={fl.y} r={5} fill={fl.cor} />
          ))}

          {/* anel da praça: borda escura e tampo claro (cel shading) */}
          <ellipse cx={960} cy={765} rx={650} ry={218} fill={c.pedraSombra} stroke={CONTORNO} strokeWidth={6} />
          <ellipse cx={960} cy={752} rx={615} ry={196} fill={c.pedra} stroke={CONTORNO} strokeWidth={5} />
          {PEDRAS.map((p, i) => (
            <ellipse key={i} cx={p.x} cy={p.y} rx={16 * p.k} ry={8 * p.k} fill={c.pedraSombra} stroke={CONTORNO} strokeWidth={2.5} />
          ))}

          {/* luz da fogueira no chão */}
          <g opacity={k * (0.25 + 0.55 * n) * pulsoFogo}>
            <ellipse cx={FOGO.x} cy={FOGO.y + 20} rx={720} ry={300} fill="url(#vila-luz)" />
          </g>

          {/* poço e varal */}
          <Poco x={250} base={690} c={c} n={n} />
          <Varal x1={1620} x2={1880} base={690} f={f} c={c} />
          <Barril x={560} base={640} c={c} />
          <Barril x={592} base={652} c={c} />

          {/* aldeões de trás (antes da fogueira) */}
          {atras.map(aldeao)}

          {/* fogueira */}
          <Fogueira f={f} k={k} c={c} />

          {/* aldeões da frente (na frente da fogueira) */}
          {frente.map(aldeao)}

          {/* escurecimento da noite (fica por cima do chão e personagens) */}
          <rect x={-300} y={460} width={2520} height={900} fill={c.escuro} opacity={0.3 * n} />

          {/* brilho quente que atinge chão e personagens */}
          <g opacity={k * (0.08 + 0.25 * n) * pulsoFogo}>
            <ellipse cx={FOGO.x} cy={FOGO.y - 40} rx={560} ry={380} fill="url(#vila-luz)" />
          </g>

          {/* névoa do uivo */}
          {[
            {x: 560, y: 820, rx: 420, ry: 70},
            {x: 1360, y: 840, rx: 420, ry: 70},
            {x: 960, y: 900, rx: 520, ry: 80},
          ].map((nv, i) => (
            <ellipse key={i} cx={nv.x} cy={nv.y} rx={nv.rx} ry={nv.ry} fill={c.neblina} opacity={0.45 * u} filter="url(#vila-nevoa)" />
          ))}

          {/* vagalumes (só à noite) */}
          {VAGALUMES.map((vg, i) => {
            const x = vg.ax + Math.sin(f * 0.02 + vg.fase) * 70;
            const y = vg.ay + Math.cos(f * 0.027 + vg.fase * 1.3) * 35;
            const pisca = 0.5 + 0.5 * Math.sin(f * 0.12 + vg.fase * 3);
            return (
              <g key={i} opacity={n * (0.35 + 0.65 * pisca)}>
                <circle cx={x} cy={y} r={9} fill="#e9ff7a" opacity={0.5} filter="url(#vila-brilho)" />
                <circle cx={x} cy={y} r={3} fill="#f7ffc0" />
              </g>
            );
          })}
        </g>

        {/* ===== PRIMEIRO PLANO (desfocado): galhos e cerca ===== */}
        <g transform={T(1.45, 1.25)} filter="url(#vila-desfoco)">
          <Galho x={-40} y={-30} rot={18} len={720} cor={c.florestaSombra} />
          <Galho x={1980} y={-20} rot={160} len={640} cor={c.florestaSombra} />
          <Cerca x0={1560} x1={2060} y={952} c={c} />
        </g>
      </svg>

      {/* vinheta e tom avermelhado do uivo (fixos na tela) */}
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" style={{display: 'block'}}>
          <rect x={0} y={0} width={1920} height={1080} fill="url(#vila-vinheta)" />
          <rect x={0} y={0} width={1920} height={1080} fill="#8a0d18" opacity={0.2 * u} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
