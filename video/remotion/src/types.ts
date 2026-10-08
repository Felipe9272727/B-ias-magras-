// Formato do public/timeline.json gerado por video/scripts/build_timeline.py.
// Todos os tempos estão em quadros (30 fps) relativos ao início da cena.

export type Word = {w: string; s: number; e: number};

export type Segment = {
  start: number;
  end: number;
  clip: string; // nome do arquivo em public/footage (sem .mp4)
  from: number; // quadro do clipe onde o segmento começa
  rate: number;
  zoom?: number;
  ox?: number;
  oy?: number;
  label?: string;
};

export type CapGroup = {s: number; e: number; words: Word[]};

export type SceneEvent =
  | {type: 'meme'; at: number; dur: number; id: string; pos: 'left' | 'right' | 'center' | 'full' | 'top'; caption?: string}
  | {type: 'sfx'; at: number; id: string; vol?: number; file?: string}
  | {type: 'hl'; at: number; key: string}
  | {type: 'txt'; at: number; dur: number; text: string; color?: string}
  | {type: 'punch'; at: number}
  | {type: 'voz'; at: number; src: string};

export type Visual =
  | {type: 'clip'}
  | {type: 'title'; kicker?: string; title: string; subtitle?: string; color?: string; alg?: string}
  | {type: 'component'; name: string; props?: Record<string, unknown>}
  | {type: 'ui'; src: string; keys: {at: number; x: number; y: number; w: number}[]; rate?: number};

export type Scene = {
  id: string;
  chapter: string;
  start: number;
  duration: number;
  audio?: string;
  audioOffset: number;
  audioDuration: number;
  words: Word[];
  visual: Visual;
  segments: Segment[];
  events: SceneEvent[];
  capGroups: CapGroup[];
};

export type Chapter = {id: string; title: string; start: number; end: number};

export type Timeline = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  scenes: Scene[];
  chapters: Chapter[];
  clips: Record<
    string,
    {
      frames: number;
      width: number;
      height: number;
      pop?: number;
      gen?: [number, number][];
      alive?: [number, number][];
      stage?: [number, string][];
      speed?: [number, number][];
      done?: [number, number][];
    }
  >;
  memes: Record<string, {file: string; width: number; height: number; duration: number}>;
  data: Record<string, unknown>;
};
