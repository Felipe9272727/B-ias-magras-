// AMONG IA 7: quadros de conferência sem render completo. Empacota o projeto UMA vez e tira vários quadros em 540p.
// O public/ inteiro tem GB (o bundle copia tudo): usa uma pasta de hardlinks só com o que o AU7 precisa.
// Uso (de video/remotion): node au7_stills.mjs <pasta_saida> <quadro|idCena[+segundos]> ...
//   ex.: node au7_stills.mjs out/au7_stills a2+6 p1_g+9 12345
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';

const [saida, ...alvos] = process.argv.slice(2);
const PUB = path.resolve('public');
const LEVE = path.resolve('out/ds_public');
fs.rmSync(LEVE, {recursive: true, force: true});
fs.mkdirSync(LEVE, {recursive: true});
for (const d of ['desenha', 'gifs', 'fonts', 'sfx', 'sfx_au2', 'sfx_au4', 'timeline_desenha.json']) execSync(`cp -al ${path.join(PUB, d)} ${LEVE}/`);
const tl = JSON.parse(fs.readFileSync(path.join(PUB, 'timeline_desenha.json'), 'utf8'));
const inicio = {};
let ini = 0;
for (const c of tl.cenas) { inicio[c.id] = [ini, c.dur]; ini += c.dur; }
const quadro = (a) => {
  if (/^\d+$/.test(a)) return Number(a);
  const [id, seg] = a.split('+');
  if (!inicio[id]) throw new Error(`cena ${id} não existe`);
  return Math.min(inicio[id][0] + inicio[id][1] - 1, inicio[id][0] + Math.round(Number(seg ?? 1) * 30));
};
const CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = fs.existsSync(CHROME) ? CHROME : undefined;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: LEVE});
const composition = await selectComposition({serveUrl, id: 'DesenhaVideo', browserExecutable, timeoutInMilliseconds: 240000});
fs.mkdirSync(saida, {recursive: true});
for (const a of alvos) {
  const f = quadro(a);
  const out = path.join(saida, `${a.replace(/[^a-zA-Z0-9_]+/g, '_')}.png`);
  await renderStill({composition, serveUrl, output: out, frame: f, scale: 0.5, browserExecutable, timeoutInMilliseconds: 240000});
  console.log(a, '-> quadro', f, out);
}
fs.rmSync(serveUrl, {recursive: true, force: true});
process.exit(0);
