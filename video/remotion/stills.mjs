// Renderiza quadros avulsos (um por cena) para conferir o layout sem renderizar o vídeo todo.
// Uso: node stills.mjs s07,s08 [fração=0.6]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const ids = (process.argv[2] || '').split(',').filter(Boolean);
const frac = Number(process.argv[3] || 0.6);
const timeline = JSON.parse(fs.readFileSync('public/timeline.json', 'utf8'));
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const composition = await selectComposition({serveUrl, id: 'MarioRL', browserExecutable});
fs.mkdirSync('out/stills', {recursive: true});
for (const sc of timeline.scenes) {
  if (ids.length && !ids.includes(sc.id)) continue;
  const frame = sc.start + Math.floor(sc.duration * frac);
  const output = `out/stills/${sc.id}.jpg`;
  await renderStill({composition, serveUrl, output, frame, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable});
  console.log(sc.id, frame, output);
}
