import {useCurrentFrame} from 'remotion';

export type HL = {at: number; key: string}[];

// Utilitário para destacar partes de um diagrama no momento em que a narração fala delas.
export const useHL = (hl: HL) => {
  const frame = useCurrentFrame();
  const sorted = [...hl].sort((a, b) => a.at - b.at);
  const at = (key: string) => sorted.find((h) => h.key === key)?.at;
  return {
    frame,
    on: (key: string) => {
      const t = at(key);
      return t !== undefined && frame >= t;
    },
    since: (key: string) => {
      const t = at(key);
      return t === undefined ? -1 : frame - t;
    },
    current: () => {
      let cur: string | null = null;
      for (const h of sorted) if (frame >= h.at) cur = h.key;
      return cur;
    },
    at,
  };
};
