// AU4: confere se cada cena de jogo do roteiro acha o evento de início e os eventos das âncoras no simulador
// (quadro -1 = a cena começaria no lugar errado ou o evento não bateria com a fala).
// Uso: npx esbuild au4/checar_ancoras.ts --bundle --platform=node --outfile=$S/ca.js && node $S/ca.js [timeline]
import {readFileSync} from 'node:fs';
import {simular, type Partida2} from '../../remotion/src/amongus3/sim';
import {quadroDoEvento} from '../../remotion/src/amongus3/tempo';

const tl = JSON.parse(readFileSync(process.argv[2] ?? '../remotion/public/timeline_au4.json', 'utf8'));
const ps = tl.data.partidas as Record<string, Partida2>;
let ruins = 0;
for (const sc of tl.scenes) {
  const v = sc.visual;
  if (v?.name !== 'AU4Jogo') continue;
  const p = ps[String(v.props.partida)];
  const s = simular(p);
  const probs: string[] = [];
  if (v.props.evento && quadroDoEvento(s, v.props.evento) < 0) probs.push('início ' + JSON.stringify(v.props.evento));
  for (const [e] of v.props.ancoras ?? []) if (quadroDoEvento(s, e) < 0) probs.push('âncora ' + JSON.stringify(e));
  if (v.props.tique && !s.inicioTique[v.props.tique]) probs.push('tique ' + v.props.tique);
  if (probs.length) { ruins++; console.log(sc.id, probs.join(' | ')) }
}
console.log(ruins ? `${ruins} cenas com problema` : 'todas as cenas acham seus eventos');
