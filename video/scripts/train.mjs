// Experimento sem captura: treina um algoritmo por um orçamento de passos de
// física e registra estatísticas para os gráficos e números do roteiro.
// Uso: node train.mjs --alg adaptive --steps 1200000 --seed 7 --out ../data/runs/adaptive
import { launch, step, state } from './lab.mjs';
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, v, i, all) => (v.startsWith('--') ? [...acc, [v.slice(2), all[i + 1]]] : acc), []),
);
const alg = args.alg || 'evolution';
const budget = Number(args.steps || 600000);
const seed = Number(args.seed || 7);
const chunk = Number(args.chunk || 3000);
const out = path.resolve(args.out || `../data/runs/${alg}`);
fs.mkdirSync(out, { recursive: true });
const logFile = path.join(out, 'log.jsonl');
fs.writeFileSync(logFile, '');

const lab = await launch({ layout: 'game', width: 960, height: 540, seed });
const { page } = lab;
await page.evaluate(
  ({ alg, seed }) => {
    MarioRLLab.setSeed(seed);
    MarioRLLab.configure({ algorithm: alg, level: 'classic', population: 64 });
  },
  { alg, seed },
);

const t0 = Date.now();
let total = 0;
const histories = new Map();
const milestones = [];
let maxStage = 0;
while (total < budget) {
  const done = await step(page, Math.min(chunk, budget - total));
  total += done;
  const info = await page.evaluate(() => {
    const s = MarioRLLab.getState();
    const agents = __lab.agents();
    let frontier = 0;
    for (const a of agents) frontier = Math.max(frontier, a.stageIndex, a.bestStageReached ?? 0);
    return {
      generation: s.generation,
      totalStageClears: s.totalStageClears,
      totalWins: s.totalWins,
      bestProgress: s.bestProgress,
      bestReward: s.bestReward,
      alive: s.alive,
      leader: s.leader,
      frontier,
      learning: s.learning,
      history: s.history,
    };
  });
  for (const h of info.history) histories.set(h.generation, h);
  const wall = (Date.now() - t0) / 1000;
  if (info.frontier > maxStage) {
    for (let s = maxStage + 1; s <= info.frontier; s++) milestones.push({ stageIndex: s, generation: info.generation, steps: total, wall });
    maxStage = info.frontier;
  }
  const { history, learning, ...rest } = info;
  const entry = {
    steps: total,
    wall,
    ...rest,
    learning: { updates: learning.updates, replay: learning.replay, loss: learning.loss, examples: learning.examples, plans: learning.plans },
    maxStage,
  };
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
  if (done === 0) {
    console.error('Simulação travada; encerrando.');
    break;
  }
  if (info.totalWins > 0 && args.stopOnWin) break;
}

const final = await state(page);
const summary = {
  alg,
  seed,
  steps: total,
  wall: (Date.now() - t0) / 1000,
  generation: final.generation,
  bestProgress: final.bestProgress,
  bestReward: final.bestReward,
  totalStageClears: final.totalStageClears,
  totalWins: final.totalWins,
  maxStage,
  milestones,
  learning: final.learning,
};
fs.writeFileSync(path.join(out, 'history.json'), JSON.stringify([...histories.values()].sort((a, b) => a.generation - b.generation)));
fs.writeFileSync(path.join(out, 'summary.json'), JSON.stringify(summary, null, 2));
if (alg === 'rainbow') {
  const model = await page.evaluate(() => MarioRLLab.exportRL());
  fs.writeFileSync(path.join(out, 'rainbow_iqn_v11.json'), JSON.stringify(model));
}
console.log(JSON.stringify(summary));
await lab.close();
