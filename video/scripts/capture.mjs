// Gravações "canônicas" de cada algoritmo: treina e grava clipes nos momentos
// importantes. Os números citados no roteiro saem dos logs destas mesmas execuções.
// Uso: node capture.mjs <evolution|ddqn|rainbow|adaptive|extras> [--budget 1200000]
import { launch, step, captureClip } from './lab.mjs';
import fs from 'node:fs';
import path from 'node:path';

const which = process.argv[2];
const argv = process.argv.slice(3);
const opt = (name, def) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 ? argv[i + 1] : def;
};
const BUDGET = Number(opt('budget', 1200000));
const SEED = Number(opt('seed', 7));
const ROOT = path.resolve(import.meta.dirname, '..');
const CLIPS = path.join(ROOT, 'remotion/public/footage');
const RUNS = path.join(ROOT, 'data/runs_canon');
fs.mkdirSync(CLIPS, { recursive: true });

function makeRun(name) {
  const dir = path.join(RUNS, name);
  fs.mkdirSync(dir, { recursive: true });
  const log = path.join(dir, 'log.jsonl');
  fs.writeFileSync(log, '');
  const t0 = Date.now();
  const run = { dir, total: 0, maxStage: 0, milestones: [], histories: new Map(), clips: [] };
  run.record = async (page) => {
    const info = await page.evaluate(() => {
      const s = MarioRLLab.getState();
      let frontier = 0,
        cleared = 0;
      for (const a of __lab.agents()) {
        frontier = Math.max(frontier, a.stageIndex, a.bestStageReached ?? 0);
        cleared = Math.max(cleared, a.stagesCleared || 0);
      }
      const L = s.learning;
      return {
        generation: s.generation,
        totalStageClears: s.totalStageClears,
        totalWins: s.totalWins,
        bestProgress: s.bestProgress,
        bestReward: s.bestReward,
        alive: s.alive,
        leader: s.leader && { id: s.leader.id, stage: s.leader.stage, cleared: s.leader.stagesCleared, reward: s.leader.reward },
        frontier,
        maxCleared: cleared,
        learning: { updates: L.updates, replay: L.replay, loss: L.loss, examples: L.examples, plans: L.plans, experiences: L.experiences },
        history: s.history,
      };
    });
    for (const h of info.history) run.histories.set(h.generation, h);
    const wall = (Date.now() - t0) / 1000;
    if (info.frontier > run.maxStage) {
      for (let st = run.maxStage + 1; st <= info.frontier; st++) run.milestones.push({ stageIndex: st, generation: info.generation, steps: run.total, wall });
      run.maxStage = info.frontier;
    }
    const { history, ...rest } = info;
    fs.appendFileSync(log, JSON.stringify({ steps: run.total, wall, ...rest, maxStage: run.maxStage }) + '\n');
    return info;
  };
  run.finish = async (page, extra = {}) => {
    const info = await run.record(page);
    const summary = {
      name,
      seed: SEED,
      steps: run.total,
      wall: (Date.now() - t0) / 1000,
      generation: info.generation,
      bestProgress: info.bestProgress,
      bestReward: info.bestReward,
      totalStageClears: info.totalStageClears,
      totalWins: info.totalWins,
      maxStage: run.maxStage,
      milestones: run.milestones,
      learning: info.learning,
      clips: run.clips,
      ...extra,
    };
    fs.writeFileSync(path.join(dir, 'history.json'), JSON.stringify([...run.histories.values()].sort((a, b) => a.generation - b.generation)));
    fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary));
  };
  return run;
}

// Treina sem gravar, em blocos, registrando estatísticas.
async function train(lab, run, steps, { chunk = 3000, stop } = {}) {
  let done = 0;
  while (done < steps) {
    const k = await step(lab.page, Math.min(chunk, steps - done));
    done += k;
    run.total += k;
    const info = await run.record(lab.page);
    if (k === 0) throw new Error('Simulação travada');
    if (stop && stop(info)) break;
  }
  return done;
}

// Avança passo a passo até a condição (avaliada na página) ficar verdadeira.
async function until(lab, run, cond, max = 2e6) {
  const k = await lab.page.evaluate(({ cond, max }) => __lab.until(cond, max), { cond, max });
  if (k < 0) throw new Error('Simulação travada em until');
  run.total += k;
  return k;
}

async function clip(lab, run, name, opts) {
  await lab.page.evaluate(() => {
    __lab.hideToast();
    __lab.ui();
    __lab.snap();
  });
  const out = path.join(CLIPS, name + '.mp4');
  const t = Date.now();
  const meta = await captureClip(lab, out, opts);
  const steps = meta.reduce((s, m) => s + m.n, 0);
  run.total += steps;
  run.clips.push({ name, frames: meta.length, steps, startGen: meta[0]?.gen, endGen: meta.at(-1)?.gen, atTotalSteps: run.total });
  console.log(`clip ${name}: ${meta.length} quadros em ${((Date.now() - t) / 1000).toFixed(0)}s`);
  await run.record(lab.page);
  return meta;
}

const setup = async (lab, algorithm) => {
  await lab.page.evaluate(
    ({ algorithm, seed }) => {
      MarioRLLab.setSeed(seed);
      MarioRLLab.configure({ algorithm, population: 64 });
      __lab.setView('population');
    },
    { algorithm, seed: SEED },
  );
};

// Para quando a geração termina (todos morreram) — útil para clipes "uma geração inteira".
const untilGenChanges = (maxFrames) => {
  let start = null;
  return (i, m) => {
    if (m && start === null) start = m.gen;
    if (m && m.gen !== start) return 'stop';
    if (i >= maxFrames) return 'stop';
  };
};

const programs = {
  async evolution() {
    const lab = await launch({ seed: SEED });
    const run = makeRun('evolution');
    await setup(lab, 'evolution');
    await run.record(lab.page);
    // Geração 1: caos total, tempo real.
    await clip(lab, run, 'evo_g1', { frames: 600, stepsPerFrame: 2, onFrame: untilGenChanges(600) });
    await until(lab, run, 'L.generation>=10');
    await clip(lab, run, 'evo_g10', { frames: 540, stepsPerFrame: 2, onFrame: untilGenChanges(540) });
    // Treina até algum indivíduo concluir o 1-1.
    await train(lab, run, BUDGET, { chunk: 600, stop: (i) => i.maxCleared >= 1 || i.frontier >= 1 });
    const firstClearGen = (await lab.page.evaluate(() => __lab.generation));
    // Elitismo: o campeão é copiado intacto e repete a trajetória na próxima geração.
    await until(lab, run, `L.generation>=${firstClearGen + 1}`);
    await clip(lab, run, 'evo_first_clear', {
      frames: 1800,
      stepsPerFrame: 4,
      onFrame: (i, m) => (m && (m.cleared >= 1 && m.stageProgress > 12) ? 'stop' : undefined),
    });
    // Resto do orçamento.
    await train(lab, run, BUDGET - run.total, { chunk: 6000 });
    const g = await lab.page.evaluate(() => __lab.generation);
    await until(lab, run, `L.generation>=${g + 1}`);
    await clip(lab, run, 'evo_stuck', { frames: 2400, stepsPerFrame: 4, onFrame: untilGenChanges(2400) });
    await run.finish(lab.page, { firstClearGen });
    await lab.close();
  },

  async ddqn() {
    const lab = await launch({ seed: SEED });
    const run = makeRun('ddqn');
    await setup(lab, 'ddqn');
    await run.record(lab.page);
    await clip(lab, run, 'ddqn_g1', { frames: 450, stepsPerFrame: 2, onFrame: untilGenChanges(450) });
    await train(lab, run, 120000, { chunk: 3000 });
    await lab.page.evaluate(() => __lab.setView('sensors'));
    await clip(lab, run, 'ddqn_sensors', { frames: 420, stepsPerFrame: 2 });
    await lab.page.evaluate(() => __lab.setView('population'));
    await train(lab, run, BUDGET - run.total, { chunk: 6000 });
    const g = await lab.page.evaluate(() => __lab.generation);
    await until(lab, run, `L.generation>=${g + 1}`);
    await clip(lab, run, 'ddqn_late', { frames: 2700, stepsPerFrame: 4, onFrame: untilGenChanges(2700) });
    await run.finish(lab.page);
    await lab.close();
  },

  async rainbow() {
    const lab = await launch({ seed: SEED });
    const run = makeRun('rainbow');
    await setup(lab, 'rainbow');
    await run.record(lab.page);
    await clip(lab, run, 'rainbow_g1', { frames: 450, stepsPerFrame: 2, onFrame: untilGenChanges(450) });
    await train(lab, run, Math.floor(BUDGET / 2) - run.total, { chunk: 3000 });
    await lab.page.evaluate(() => __lab.setView('sensors'));
    await clip(lab, run, 'rainbow_sensors', { frames: 480, stepsPerFrame: 2 });
    await lab.page.evaluate(() => __lab.setView('population'));
    await train(lab, run, BUDGET - run.total, { chunk: 3000 });
    const g = await lab.page.evaluate(() => __lab.generation);
    await until(lab, run, `L.generation>=${g + 1}`);
    await clip(lab, run, 'rainbow_late', { frames: 2700, stepsPerFrame: 4, onFrame: untilGenChanges(2700) });
    const model = await lab.page.evaluate(() => MarioRLLab.exportRL());
    fs.writeFileSync(path.join(run.dir, 'rainbow_iqn_v11.json'), JSON.stringify(model));
    await run.finish(lab.page);
    await lab.close();
  },

  async adaptive() {
    const lab = await launch({ seed: SEED });
    const run = makeRun('adaptive');
    await setup(lab, 'adaptive');
    await run.record(lab.page);
    // Primeira tentativa inteira, em tempo real, até o fim do 8-4 (+5 s).
    let doneAt = null;
    await clip(lab, run, 'ada_campaign', {
      frames: 60000,
      stepsPerFrame: 2,
      onFrame: (i, m) => {
        if (m?.done && doneAt === null) doneAt = i;
        if (doneAt !== null && i - doneAt > 150) return 'stop';
        if (m && m.gen > 1) return 'stop';
      },
    });
    await run.finish(lab.page);
    await lab.close();
  },

  // Clipes curtos: sensores da adaptativa, jogador humano e visões gerais da interface.
  async extras() {
    const run = makeRun('extras');
    {
      const lab = await launch({ seed: SEED });
      await setup(lab, 'adaptive');
      await lab.page.evaluate(() => __lab.setView('sensors'));
      await step(lab.page, 120);
      await clip(lab, run, 'ada_sensors', { frames: 420, stepsPerFrame: 2 });
      // Modo "Eu jogo": entradas roteirizadas de um jogador ruim.
      await lab.page.evaluate(() => {
        __lab.setView('population');
        MarioRLLab.setMode('play');
      });
      await clip(lab, run, 'human_play', {
        frames: 330,
        stepsPerFrame: 2,
        onFrame: async (i) => {
          // Pula cedo demais, hesita e acaba trombando no primeiro Goomba.
          const right = i > 15 && !(i > 70 && i < 82);
          const left = i > 70 && i < 82;
          const jump = (i > 40 && i < 52) || (i > 88 && i < 92);
          await lab.page.evaluate(({ right, left, jump }) => {
            __lab.keys.right = right;
            __lab.keys.left = left;
            __lab.keys.jump = jump;
          }, { right, left, jump });
        },
      });
      await lab.close();
    }
    for (const alg of ['evolution', 'adaptive']) {
      const lab = await launch({ layout: 'ui', width: 1540, height: 1000, dpr: 1.25, seed: SEED });
      const h = await lab.page.evaluate(() => document.documentElement.scrollHeight);
      await lab.page.setViewportSize({ width: 1540, height: h });
      lab.height = h;
      await lab.page.evaluate(() => __lab.resize());
      await setup(lab, alg);
      if (alg === 'evolution') {
        await clip(lab, run, 'ui_evolution', { frames: 540, stepsPerFrame: 2 });
        // Os botões de velocidade: 1× → 10× → 100× → 1000× → Máx.
        const speeds = [
          [1, 2],
          [10, 20],
          [100, 200],
          [1000, 2000],
          [1000000, 6000],
        ];
        await clip(lab, run, 'ui_speed', {
          frames: 750,
          onFrame: async (i) => {
            const [v, n] = speeds[Math.min(speeds.length - 1, Math.floor(i / 150))];
            if (i % 150 === 0) await lab.page.evaluate((v) => document.getElementById('speed' + v).click(), v);
            return n;
          },
        });
      } else {
        await clip(lab, run, 'ui_adaptive', { frames: 600, stepsPerFrame: 2 });
      }
      await lab.close();
    }
    fs.writeFileSync(path.join(run.dir, 'summary.json'), JSON.stringify({ clips: run.clips }, null, 2));
  },
};

if (!programs[which]) {
  console.error('Uso: node capture.mjs <' + Object.keys(programs).join('|') + '>');
  process.exit(1);
}
await programs[which]();
