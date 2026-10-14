// Exporta os pontos da nave (do desenho em remotion/src/amongus/nave/mapa.ts) para o motor do Among Us 3:
// lugares de ficar parado, consoles de tarefa, saída de duto e a porta por onde se entra vindo de cada sala vizinha.
// O motor usa isso para o campo de visão dentro da sala; o vídeo usa as mesmas coordenadas (uma fonte só).
// Uso: npx esbuild exportar_pontos.ts --bundle --platform=node --outfile=/tmp/x.js && node /tmp/x.js <saida.json>
import {writeFileSync} from 'node:fs';
import {NAVE, caminho, salaEm} from '../../remotion/src/amongus/nave/mapa';
import {SALAS_ORDEM, VIZINHAS, TILE} from '../../remotion/src/amongus/nave/spec';

// portas da sala: células 'D' encostadas no piso dela, com o ponto 1,5 casa para dentro
function portasDe(s: string) {
  const {c, r, w, h} = NAVE.salas[s as keyof typeof NAVE.salas].rect;
  const out: {porta: {x: number; y: number}; dentro: {x: number; y: number}}[] = [];
  const ch = (cc: number, rr: number) => NAVE.grid[rr]?.charAt(cc) ?? ' ';
  for (let rr = r - 2; rr < r + h + 2; rr++) for (let cc = c - 2; cc < c + w + 2; cc++) {
    if (ch(cc, rr) !== 'D') continue;
    const dentroX = Math.min(c + w - 1, Math.max(c, cc)), dentroY = Math.min(r + h - 1, Math.max(r, rr));
    if (Math.abs(dentroX - cc) + Math.abs(dentroY - rr) > 2) continue;
    const dx = Math.sign(dentroX - cc), dy = Math.sign(dentroY - rr);
    out.push({porta: {x: (cc + 0.5) * TILE, y: (rr + 0.5) * TILE}, dentro: {x: (dentroX + 0.5 + dx * 1) * TILE, y: (dentroY + 0.5 + dy * 1) * TILE}});
  }
  return out;
}
function distSeg(p: {x: number; y: number}, a: {x: number; y: number}, b: {x: number; y: number}) {
  const vx = b.x - a.x, vy = b.y - a.y, L = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / L));
  return Math.hypot(p.x - a.x - t * vx, p.y - a.y - t * vy);
}

const out: Record<string, any> = {};
for (const s of SALAS_ORDEM) {
  const d = NAVE.salas[s];
  const entradas: Record<string, {x: number; y: number}> = {};
  for (const [a, b] of VIZINHAS) {
    const viz = a === s ? b : b === s ? a : null;
    if (!viz) continue;
    const rota = [NAVE.salas[viz].spots[0], ...caminho(NAVE.salas[viz].spots[0], d.spots[0])];
    // a rota (só pontos de virada) cruza a borda da sala numa porta: acha o trecho que entra e a porta mais perto dele
    const i = rota.findIndex((p) => salaEm(p) === s);
    const a0 = rota[Math.max(0, i - 1)], a1 = rota[Math.max(0, i)];
    let melhor = {x: d.spots[0].x, y: d.spots[0].y}, md = Infinity;
    for (const pt of portasDe(s)) {
      const dd = distSeg(pt.porta, a0, a1);
      if (dd < md) { md = dd; melhor = pt.dentro; }
    }
    entradas[viz] = {x: Math.round(melhor.x), y: Math.round(melhor.y)};
  }
  out[s] = {nome: d.nome, rect: {x: d.rect.c * TILE, y: d.rect.r * TILE, w: d.rect.w * TILE, h: d.rect.h * TILE}, spots: d.spots, consoles: d.consoles, duto: d.duto ?? null, entradas};
}
writeFileSync(process.argv[2], JSON.stringify({tile: TILE, salas: out}, null, 1));
console.log('pontos exportados:', Object.keys(out).length, 'salas');
