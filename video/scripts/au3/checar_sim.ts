// Confere a simulação do Among Us 3 (remotion/src/amongus3/sim.ts) nas partidas do vídeo:
//  - teleporte: alguém anda mais que um passo de corrida num quadro, fora do duto e da volta da reunião
//  - objeto: os pés de alguém dentro de um objeto da sala (Props3) enquanto anda ou parado
// Uso: npx esbuild checar_sim.ts --bundle --platform=node --jsx=automatic --outfile=$S/cs.js && node $S/cs.js [sim.ts alternativo já embutido]
import {readFileSync} from 'node:fs';
import {CORES, VEL, simular, type Partida2} from '../../remotion/src/amongus3/sim';
import {OBSTACULOS, obstaculoEm} from '../../remotion/src/amongus/nave/obstaculos3';

const tl = JSON.parse(readFileSync(process.env.TL ?? '../../remotion/public/timeline_au3.json', 'utf8'));
const ps = tl.data.partidas as Record<string, Partida2>;
let totalTp = 0, totalObj = 0;
for (const n of Object.keys(ps)) {
  const p = ps[n];
  const s = simular(p);
  const reun = new Set(s.reunioes.map((r) => r.quadro));
  const tps: string[] = [];
  const obj: Record<string, number> = {};
  for (const cor of CORES) {
    let ant = s.q(cor, 0);
    for (let f = 1; f < s.total; f++) {
      const q = s.q(cor, f);
      if (q && ant) {
        const d = Math.hypot(q.x - ant.x, q.y - ant.y);
        const duto = s.eventos.some((e) => e.tipo === 'duto' && e.cor === cor && Math.abs(e.quadro - f) <= 1);
        if (d > VEL * 1.75 + 0.5 && !duto && !reun.has(f)) tps.push(`${cor}@${f}(t${s.tique(f)}) ${Math.round(d)}px`);
        const o = obstaculoEm(q);
        if (o >= 0) obj[`${cor} em ${OBSTACULOS[o].tipo}${q.andando ? ' andando' : ' parado'}`] = (obj[`${cor} em ${OBSTACULOS[o].tipo}${q.andando ? ' andando' : ' parado'}`] ?? 0) + 1;
      }
      ant = q;
    }
  }
  const nObj = Object.values(obj).reduce((a, b) => a + b, 0);
  totalTp += tps.length; totalObj += nObj;
  console.log(`partida ${n}: ${s.total} quadros, ${tps.length} teleportes, ${nObj} quadros com pé em objeto`);
  for (const t of tps.slice(0, 12)) console.log('   tp', t);
  for (const [k, v] of Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log('   obj', k, v);
}
console.log('TOTAL teleportes', totalTp, 'quadros em objeto', totalObj);
