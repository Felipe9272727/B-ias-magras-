// Quadros avulsos do RobloxShort. Uso: node rbx_stills_short.mjs 30,400 [saida]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const frames = process.argv[2].split(',').map(Number);
const out = process.argv[3] || 'out/rbx_short_stills';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public_rbx')});
const composition = await selectComposition({serveUrl, id: 'RobloxShort', chromiumOptions: {gl: 'angle-egl'}});
fs.mkdirSync(out, {recursive: true});
for (const frame of frames) {
  await renderStill({composition, serveUrl, output: `${out}/f${String(frame).padStart(5, '0')}.jpg`, frame, imageFormat: 'jpeg', jpegQuality: 80, scale: 0.5, chromiumOptions: {gl: 'angle-egl'}});
  console.log(frame);
}
