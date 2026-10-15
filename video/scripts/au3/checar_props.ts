// Confere se os objetos do Among Us 3 (Props3.tsx) não ficam em cima de onde os jogadores param, dos consoles de
// tarefa, da saída de duto, das entradas das portas, e se cabem dentro da sala.
// Uso: esbuild checar_props.ts --bundle --platform=node --jsx=automatic --outfile=$S/chk.js && node $S/chk.js
import {NAVE} from '../../remotion/src/amongus/nave/mapa';
import {props3Absolutos} from '../../remotion/src/amongus/nave/Props3';
import {SALAS_ORDEM, TILE} from '../../remotion/src/amongus/nave/spec';
import pontos from '../../../amongus/pontos3.json';

type Pt = {x: number; y: number};
// distância de um ponto ao retângulo (0 se estiver dentro)
function dist(p: Pt, cx: number, cy: number, w: number, h: number) {
  const dx = Math.max(Math.abs(p.x - cx) - w / 2, 0), dy = Math.max(Math.abs(p.y - cy) - h / 2, 0);
  return Math.hypot(dx, dy);
}

const MARGEM = {spot: 48, console: 40, duto: 46, entrada: 56};
let problemas = 0;
for (const p of props3Absolutos()) {
  const s = p.sala;
  const d = NAVE.salas[s];
  const r = d.rect;
  const rx0 = r.c * TILE, ry0 = r.r * TILE, rx1 = (r.c + r.w) * TILE, ry1 = (r.r + r.h) * TILE;
  // girado 90°: troca largura e altura
  const rot = Math.abs(((p.rot ?? 0) % 180)) === 90;
  const w = rot ? p.ph : p.pw, h = rot ? p.pw : p.ph;
  const erros: string[] = [];
  if (p.cx - w / 2 < rx0 - 4 || p.cx + w / 2 > rx1 + 4 || p.cy - h / 2 < ry0 - 30 || p.cy + h / 2 > ry1 + 4) erros.push('sai da sala');
  d.spots.forEach((q: Pt, i: number) => { const k = dist(q, p.cx, p.cy, w, h); if (k < MARGEM.spot) erros.push(`spot${i} (${k.toFixed(0)}px)`); });
  d.consoles.forEach((q: Pt, i: number) => { const k = dist(q, p.cx, p.cy, w, h); if (k < MARGEM.console) erros.push(`console${i} (${k.toFixed(0)}px)`); });
  if (d.duto) { const k = dist(d.duto, p.cx, p.cy, w, h); if (k < MARGEM.duto) erros.push(`duto (${k.toFixed(0)}px)`); }
  const ent = (pontos as any).salas[s].entradas as Record<string, Pt>;
  for (const [viz, q] of Object.entries(ent)) { const k = dist(q, p.cx, p.cy, w, h); if (k < MARGEM.entrada) erros.push(`entrada de ${viz} (${k.toFixed(0)}px)`); }
  if (erros.length) {
    problemas++;
    console.log(`${s.padEnd(13)} ${p.tipo.padEnd(13)} @(${p.x},${p.y}) → ${erros.join(', ')}`);
  }
}
// dica: casas livres de cada sala que tiveram problema
console.log(problemas ? `\n${problemas} objeto(s) com problema` : 'tudo livre');
if (process.argv[2] === '--pontos') {
  for (const s of SALAS_ORDEM) {
    const d = NAVE.salas[s], r = d.rect;
    const rel = (q: Pt) => `(${(q.x / TILE - r.c).toFixed(1)},${(q.y / TILE - r.r).toFixed(1)})`;
    const ent = (pontos as any).salas[s].entradas as Record<string, Pt>;
    console.log(`${s} ${r.w}x${r.h}: spots ${d.spots.map(rel).join(' ')} | consoles ${d.consoles.map(rel).join(' ')} | duto ${d.duto ? rel(d.duto) : '-'} | entradas ${Object.entries(ent).map(([k, q]) => k + rel(q)).join(' ')}`);
  }
}
