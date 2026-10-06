// Grava o modo "Eu jogo" com entradas roteirizadas de um jogador ruim:
// tentativa 1 morre no primeiro Goomba; tentativa 2 pula os canos e cai no primeiro buraco.
// Uso: node capture_human.mjs
import { launch, captureClip } from './lab.mjs';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '../remotion/public/footage/human_play.mp4');
const lab = await launch({ seed: 7 });
const { page } = lab;
await page.evaluate(() => {
  MarioRLLab.setSeed(7);
  MarioRLLab.configure({ algorithm: 'adaptive', population: 64 });
  MarioRLLab.setMode('play');
  __lab.hideToast();
});

// Posições (em px) onde o "jogador" aperta pulo na tentativa 2: os canos do 1-1
// ficam nos blocos 28, 38, 46 e 57 (32 px cada).
const JUMPS = [28, 38, 46, 57].map((tile) => tile * 32 - 78);
let attempt = 1;
let deadFrames = 0;
let jumpHold = 0;
let lastX = 0;

await captureClip(lab, OUT, {
  frames: 960,
  stepsPerFrame: 2,
  onFrame: async (i) => {
    const h = await page.evaluate(() => {
      const a = __lab.human;
      // faixas de patrulha dos inimigos ainda vivos (para pular por cima)
      const zones = a.level.enemies.filter((e) => !a.defeated.has(e.id)).map((e) => [e.min, e.max + e.w]);
      return { x: a.x, dead: a.dead, ground: a.ground, zones };
    });
    if (h.dead) {
      deadFrames++;
      await page.evaluate(() => {
        __lab.keys.right = __lab.keys.left = __lab.keys.jump = false;
      });
      if (attempt === 1 && deadFrames === 45) {
        attempt = 2;
        deadFrames = 0;
        await page.evaluate(() => document.getElementById('reset').click());
      }
      if (attempt === 2 && deadFrames > 75) return 'stop';
      return;
    }
    let right = i > 12;
    let jump = false;
    if (attempt === 1) {
      // pula cedo demais e depois hesita bem em cima do Goomba
      jump = i > 30 && i < 40;
      if (i > 70 && i < 84) right = false;
    } else {
      // tentativa 2: pula cada cano; no buraco (bloco 69) esquece de pular
      if (jumpHold > 0) {
        jump = true;
        jumpHold--;
      } else if (h.ground && JUMPS.some((jx) => lastX < jx && h.x >= jx)) {
        jump = true;
        jumpHold = 14;
      } else if (h.ground && h.x < 2000 && h.zones.some(([a, b]) => h.x > a - 110 && h.x < b + 10)) {
        // atravessa a área de um Goomba pulando sem parar
        jump = true;
        jumpHold = 10;
      }
    }
    lastX = h.x;
    await page.evaluate(
      ({ right, jump }) => {
        __lab.keys.right = right;
        __lab.keys.left = false;
        __lab.keys.jump = jump;
      },
      { right, jump },
    );
  },
});
await lab.close();
console.log('ok', OUT);
