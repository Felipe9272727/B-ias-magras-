// Among Us 3: os objetos da nave (Props3.tsx) viram obstáculos para quem anda. O teste é feito nos PÉS do tripulante
// (o ponto do jogador é o pé): o retângulo do objeto ganha uma folga do tamanho do corpo para os lados.
// Um objeto que contém a saída ou a chegada da rota é ignorado nessa rota (quem está encostado nele consegue sair).
import {N_CEL, COLUNAS, andavel, caminhoComBloqueio} from './mapa';
import {props3Absolutos} from './Props3';
import {TILE, type Pt} from './spec';

const FOLGA_X = 26; // meia largura do corpo
const FOLGA_Y = 10;

export type Ret = {x0: number; y0: number; x1: number; y1: number; tipo: string};
export const OBSTACULOS: Ret[] = props3Absolutos().map((p) => ({
  x0: p.cx - p.pw / 2 - FOLGA_X, x1: p.cx + p.pw / 2 + FOLGA_X, y0: p.cy - p.ph / 2 - FOLGA_Y, y1: p.cy + p.ph / 2 + FOLGA_Y, tipo: p.tipo,
}));

const dentro = (r: Ret, x: number, y: number) => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1;

// índice do objeto em que o ponto está (-1 se em nenhum)
export function obstaculoEm(p: Pt): number {
  return OBSTACULOS.findIndex((r) => dentro(r, p.x, p.y));
}
export const livre3 = (p: Pt) => andavel(p) && obstaculoEm(p) < 0;

// células bloqueadas: o centro da célula dentro do objeto (com folga)
const mascaras = new Map<string, Uint8Array>();
function mascara(ignorar: number[]): Uint8Array {
  const k = ignorar.join(',');
  let m = mascaras.get(k);
  if (m) return m;
  m = new Uint8Array(N_CEL);
  OBSTACULOS.forEach((r, i) => {
    if (ignorar.includes(i)) return;
    for (let c = Math.floor(r.x0 / TILE); c <= Math.floor(r.x1 / TILE); c++)
      for (let l = Math.floor(r.y0 / TILE); l <= Math.floor(r.y1 / TILE); l++)
        if (dentro(r, (c + 0.5) * TILE, (l + 0.5) * TILE)) m![l * COLUNAS + c] = 1;
  });
  mascaras.set(k, m);
  return m;
}

export function caminho3(de: Pt, para: Pt): Pt[] {
  const ign = [obstaculoEm(de), obstaculoEm(para)].filter((i) => i >= 0);
  const px = (x: number, y: number) => OBSTACULOS.some((r, i) => !ign.includes(i) && dentro(r, x, y));
  return caminhoComBloqueio(de, para, ign.join(','), mascara(ign), px);
}

// ponto livre mais perto (para quem precisa parar ao lado de outro e cairia em cima de um objeto)
export function soltar(p: Pt): Pt {
  if (livre3(p)) return p;
  for (let raio = 12; raio <= 200; raio += 12)
    for (let a = 0; a < 16; a++) {
      const q = {x: p.x + Math.cos((a / 16) * Math.PI * 2) * raio, y: p.y + Math.sin((a / 16) * Math.PI * 2) * raio};
      if (livre3(q)) return q;
    }
  return p;
}
