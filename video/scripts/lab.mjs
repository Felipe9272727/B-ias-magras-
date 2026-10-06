// Helper para dirigir o Mario RL Lab num Chromium headless (Playwright).
// Serve uma cópia levemente instrumentada do HTML original: o loop de
// requestAnimationFrame fica desligado em modo captura e expomos draw/updateUI
// para gerar cada quadro do vídeo de forma determinística.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

export const GAME = path.resolve(import.meta.dirname, '../../jogo/index_mario_32_fases_v11.html');

export function patchedHtml() {
  let html = fs.readFileSync(GAME, 'utf8');
  const patches = [
    [
      'function tick(time){',
      'function tick(time){if(window.__captureMode){lastTime=0;accumulator=0;requestAnimationFrame(tick);return;}',
    ],
    [
      'window.MarioRLLab={getState,',
      `window.__lab={
        draw:()=>draw(),ui:()=>updateUI(),resize:()=>resize(),snap(){campaignDrawnLevel=null;draw();},
        stepSync(n){syncStepping=true;let k=0;try{for(;k<n;k++){if(simStep()===false)break;}}finally{syncStepping=false;}return k;},
        agents:()=>agents,leader:()=>leader(),
        setView(v){view=v;document.getElementById('view').value=v;},
        hideToast(){document.getElementById('toast').classList.remove('show');toastUntil=0;},
        toastShown:()=>document.getElementById('toast').classList.contains('show'),
        get camera(){return camera},set camera(v){camera=v},
        get transition(){return transition},
        get generation(){return generation},
        get worldTick(){return worldTick},
        async until(cond,max=1e7){
          const f=new Function('L','return ('+cond+')');let k=0,stalls=0;
          while(k<max){if(f(this))return k;const r=this.stepSync(1);if(r===0){if(++stalls>20000)return -1;await new Promise(r=>setTimeout(r,2));continue;}k++;}
          return k;
        },
        get algorithm(){return algorithm},
        setMutation(v){mutation=v;},
        keys,
        get human(){return human},
      };window.MarioRLLab={getState,`,
    ],
  ];
  // Correção cosmética só na cópia de captura: o avanço seguro é pago via
  // award(a,'custom',…) e acabava exibindo o rótulo "0 custom" sobre o Mario.
  patches.push(["if(key!=='progress'&&key!=='idle'){a.event=key;", "if(key!=='progress'&&key!=='idle'&&key!=='custom'){a.event=key;"]);
  for (const [a, b] of patches) {
    if (!html.includes(a)) throw new Error('Âncora do patch não encontrada: ' + a);
    html = html.replace(a, b);
  }
  return html;
}

// CSS extra para os modos de captura.
const CAPTURE_CSS = `
body.cap-game .gamebox{position:fixed;inset:0;z-index:9999;border:0;border-radius:0}
body.cap-game .game-head,body.cap-game .game-foot,body.cap-game .touch-controls{display:none!important}
body.cap-game .game-viewport{height:100vh!important}
body.cap-game .world-hud{left:36px;right:36px;top:26px;font-size:22px;letter-spacing:2px;text-shadow:3px 3px #203a4c}
body.cap-game .world-hud b{font-size:34px;margin-top:6px}
body.cap-game .game-toast{font-size:30px;padding:18px 30px;bottom:44px;border-radius:14px}
body.cap-nohud .world-hud{display:none!important}
html,body{overflow:hidden}
`;

function serve(html) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(html);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

export async function launch({ width = 1920, height = 1080, dpr = 1, layout = 'game', hud = true, seed = 12345 } = {}) {
  const server = await serve(patchedHtml());
  const browser = await chromium.launch({
    args: [
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--force-color-profile=srgb',
    ],
  });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: dpr });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(() => window.MarioRLLab && window.__lab);
  await page.addStyleTag({ content: CAPTURE_CSS });
  await page.evaluate(
    ({ layout, hud, seed }) => {
      window.__captureMode = true;
      if (layout === 'game') document.body.classList.add('cap-game');
      if (!hud) document.body.classList.add('cap-nohud');
      MarioRLLab.setSeed(seed);
      __lab.resize();
    },
    { layout, hud, seed },
  );
  const close = async () => {
    await browser.close();
    server.close();
  };
  return { browser, page, close, width, height };
}

// Avança n passos de física. Para Rainbow-IQN o worker de treino é assíncrono:
// quando a fila de transições enche, esperamos o worker responder.
export async function step(page, n) {
  if (n <= 0) return 0;
  return page.evaluate(async (n) => {
    let done = 0,
      stalls = 0;
    while (done < n) {
      const k = __lab.stepSync(n - done);
      done += k;
      if (k === 0) {
        if (++stalls > 4000) break;
        await new Promise((r) => setTimeout(r, 2));
      }
    }
    return done;
  }, n);
}

export async function render(page) {
  await page.evaluate(() => {
    __lab.ui();
    __lab.draw();
  });
}

export function encoder(out, { fps = 30, crf = 16 } = {}) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawn(
    'ffmpeg',
    ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  );
  return {
    async write(buf) {
      if (!ff.stdin.write(buf)) await once(ff.stdin, 'drain');
    },
    async end() {
      ff.stdin.end();
      const [code] = await once(ff, 'close');
      if (code !== 0) throw new Error('ffmpeg falhou: ' + code);
    },
  };
}

// Grava um clipe: para cada quadro chama onFrame(i, meta) — que pode devolver o
// número de passos de física desse quadro ou 'stop' —, redesenha e fotografa.
// Salva ao lado do MP4 um JSON com metadados por quadro (geração, fase do líder…).
export async function captureClip(lab, out, { frames, stepsPerFrame = 2, fps = 30, onFrame, toastFrames = 75, quality = 92, extra } = {}) {
  const enc = encoder(out, { fps });
  let toastAge = 0;
  const meta = [];
  let last = null;
  for (let i = 0; i < frames; i++) {
    let n = stepsPerFrame;
    if (onFrame) {
      const r = await onFrame(i, last);
      if (r === 'stop') break;
      if (typeof r === 'number') n = r;
    }
    await step(lab.page, n);
    last = await lab.page.evaluate(() => {
      __lab.ui();
      __lab.draw();
      const s = MarioRLLab.getState();
      const l = s.leader;
      return {
        toast: __lab.toastShown(),
        gen: s.generation,
        alive: s.alive,
        pop: s.population,
        stage: l?.stage,
        stageIndex: l?.stageIndex,
        cleared: l?.stagesCleared,
        reward: l ? Math.round(l.reward * 100) / 100 : 0,
        stageProgress: l ? Math.round(l.stageProgress * 10) / 10 : 0,
        dead: l?.dead,
        done: l?.done,
        id: l?.id,
        wins: s.totalWins,
        clears: s.totalStageClears,
        bestProgress: Math.round(s.bestProgress * 100) / 100,
      };
    });
    toastAge = last.toast ? toastAge + 1 : 0;
    if (toastAge > toastFrames) await lab.page.evaluate(() => __lab.hideToast());
    const buf = await lab.page.screenshot({ type: 'jpeg', quality, clip: { x: 0, y: 0, width: lab.width, height: lab.height } });
    await enc.write(buf);
    const { toast, ...m } = last;
    meta.push({ f: meta.length, n, ...m });
  }
  await enc.end();
  fs.writeFileSync(out.replace(/\.mp4$/, '.json'), JSON.stringify({ fps, frames: meta.length, extra: extra || null, meta }));
  return meta;
}

export const state = (page) => page.evaluate(() => MarioRLLab.getState());
