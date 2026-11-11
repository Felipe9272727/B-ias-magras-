// Quadros avulsos do RobloxVideo para conferir o layout. Uso: node rbx_stills.mjs 340,620,1100 [saida=out/rbx_stills]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const frames = process.argv[2].split(',').map(Number);
const out = process.argv[3] || 'out/rbx_stills';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public_rbx')});
const browserExecutable = null; // o Remotion usa o navegador dele (node_modules/.remotion)
const composition = await selectComposition({serveUrl, id: 'RobloxVideo', browserExecutable, chromiumOptions: {gl: 'angle-egl'}});
fs.mkdirSync(out, {recursive: true});
for (const frame of frames) {
  await renderStill({composition, serveUrl, output: `${out}/f${String(frame).padStart(5, '0')}.jpg`, frame, imageFormat: 'jpeg', jpegQuality: 82, scale: Number(process.argv[4] || 0.5), browserExecutable, chromiumOptions: {gl: 'angle-egl'}});
  console.log(frame);
}
