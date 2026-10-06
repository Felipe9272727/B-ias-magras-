// Paleta derivada da própria interface do Mario RL Lab.
export const C = {
  bg: '#11191b',
  bg2: '#0b1112',
  panel: '#1c2526',
  panel2: '#263233',
  line: '#354040',
  ink: '#f0f3df',
  muted: '#a7b5b0',
  lime: '#b9ed88',
  gold: '#f1cf6c',
  red: '#ff8c80',
  sky: '#83cdec',
  teal: '#a8d9d5',
  pink: '#efa1b7',
  violet: '#b9a6ff',
  orange: '#ffb26b',
};

export const FONT = {
  display: "'Poppins', system-ui, sans-serif",
  pixel: "'Press Start 2P', monospace",
  comic: "'Bangers', 'Poppins', sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

export const FPS = 30;
export const W = 1920;
export const H = 1080;

// Cores por algoritmo, usadas em títulos, gráficos e no placar.
export const ALG = {
  evolution: {name: 'Neuroevolução', short: 'NEURO', color: C.teal},
  ddqn: {name: 'Double DQN', short: 'DDQN', color: C.orange},
  rainbow: {name: 'Rainbow-IQN', short: 'RAINBOW', color: C.violet},
  adaptive: {name: 'Adaptativa', short: 'ADAPT', color: C.lime},
} as const;

export type AlgKey = keyof typeof ALG;
