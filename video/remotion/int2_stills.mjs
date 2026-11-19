// INTERROGATÓRIO 2: quadros de conferência sem render completo. Empacota o projeto UMA vez e tira vários quadros em 540p.
// O public/ inteiro tem GB (o bundle copia tudo): usa uma pasta de hardlinks só com o que a composição usa.
// Uso (de video/remotion): node int2_stills.mjs <pasta_saida> <quadro|idCena[+segundos]> ...
//   ex.: node int2_stills.mjs out/int2_stills a01+3 c103+12 12345
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';

const [saida, ...alvos] = process.argv.slice(2);
const PUB = path.resolve('public');
const LEVE = path.resolve('out/int2_stills_public');
fs.rmSync(LEVE, {recursive: true, force: true});
fs.mkdirSync(path.join(LEVE, 'gifs'), {recursive: true});
for (const d of ['fonts', 'sfx', 'sfx_au2', 'sfx_au4', 'voice_int2', 'timeline_int2.json']) execSync(`cp -al ${path.join(PUB, d)} ${LEVE}/`);
const tl = JSON.parse(fs.readFileSync(path.join(PUB, 'timeline_int2.json'), 'utf8'));
for (const m of new Set(tl.scenes.flatMap((s) => s.events.filter((e) => e.type === 'meme').map((e) => e.id))))
  fs.linkSync(path.join(PUB, 'gifs', tl.memes[m].file), path.join(LEVE, 'gifs', tl.memes[m].file));
const inicio = {};
for (const s of tl.scenes) inicio[s.id] = [s.start, s.duration];
const quadro = (a) => {
  if (/^\d+$/.test(a)) return Number(a);
  const [id, seg] = a.split('+');
  if (!inicio[id]) throw new Error(`cena ${id} não existe`);
  return Math.min(inicio[id][0] + inicio[id][1] - 1, inicio[id][0] + Math.round(Number(seg ?? 1) * 30));
};
const CHROME = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-linux/headless_shell';
const browserExecutable = fs.existsSync(CHROME) ? CHROME : undefined;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: LEVE});
const composition = await selectComposition({serveUrl, id: 'Interrogatorio2', browserExecutable, timeoutInMilliseconds: 240000});
fs.mkdirSync(saida, {recursive: true});
for (const a of alvos) {
  const f = quadro(a);
  const out = path.join(saida, `${a.replace(/[^a-zA-Z0-9_]+/g, '_')}.png`);
  await renderStill({composition, serveUrl, output: out, frame: f, scale: 0.5, browserExecutable, timeoutInMilliseconds: 240000});
  console.log(a, '-> quadro', f, out);
}
fs.rmSync(serveUrl, {recursive: true, force: true});
fs.rmSync(LEVE, {recursive: true, force: true});
process.exit(0);
