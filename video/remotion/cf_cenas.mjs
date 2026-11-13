// JOGO DE CONFIANÇA: renderiza SÓ as cenas pedidas (540p, mudo), cada uma num arquivo out/cf_cena_<ID>.mp4.
// Usado para consertar cenas sem refazer o vídeo inteiro (o resto vem do render anterior). Uso: node cf_cenas.mjs A1 D4 ...
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';

const ids = process.argv.slice(2);
const LEVE = path.resolve('out/cf_public');
const tl = JSON.parse(fs.readFileSync(path.join(LEVE, 'timeline_confianca.json'), 'utf8'));
const inicio = {};
let ini = 0;
for (const c of tl.cenas) { inicio[c.id] = [ini, c.dur]; ini += c.dur; }
const CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = fs.existsSync(CHROME) ? CHROME : undefined;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: LEVE});
const composition = await selectComposition({serveUrl, id: 'ConfiancaVideo', browserExecutable, timeoutInMilliseconds: 240000});
for (const id of ids) {
  const [a, d] = inicio[id];
  const out = path.resolve(`out/cf_cena_${id}.mp4`);
  if (fs.existsSync(out)) { console.log('já existe', id); continue; }
  const t0 = Date.now();
  await renderMedia({composition, serveUrl, codec: 'h264', crf: 16, outputLocation: out + '.tmp.mp4', frameRange: [a, a + d - 1], scale: 0.5, muted: true, concurrency: 4, browserExecutable, timeoutInMilliseconds: 240000});
  fs.renameSync(out + '.tmp.mp4', out);
  console.log(`${id} ok (${d} quadros, ${Math.round((Date.now() - t0) / 1000)} s)`);
}
console.log('CENAS_FEITAS');
