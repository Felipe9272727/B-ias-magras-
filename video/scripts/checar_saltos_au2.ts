// Checagem do Among Us 2: nenhum salto fora dos do jogo (duto, morte, reunião). Uso: npx tsx video/scripts/checar_saltos_au2.ts
import {simular, CORES, VEL} from '/home/user/B-ias-magras-/video/remotion/src/amongus2/sim';
import fs from 'fs';
for (const n of [1, 2, 3, 4]) {
  const p = JSON.parse(fs.readFileSync(`/home/user/B-ias-magras-/video/remotion/public/amongus2/partida${n}.json`, 'utf8'));
  const s = simular(p);
  const legit = (cor: string, f: number) => s.reunioes.some((r) => Math.abs(r.quadro - f) <= 1) || s.eventos.some((e) => Math.abs(e.quadro - f) <= 1 && (e.cor === cor || e.assassino === cor || e.xerife === cor) && ['duto', 'morte', 'xerife'].includes(e.tipo));
  let ruins = 0;
  for (const cor of CORES) for (let f = 1; f < s.total; f++) {
    const a = s.q(cor, f - 1), b = s.q(cor, f);
    if (a && b && Math.hypot(b.x - a.x, b.y - a.y) > VEL * 1.3 && !legit(cor, f)) ruins++;
  }
  console.log('partida', n, 'quadros', s.total, 'saltos fora do jogo:', ruins);
}
