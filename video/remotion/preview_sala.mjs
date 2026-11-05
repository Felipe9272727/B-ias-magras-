// Prévia de uma sala do Mira HQ: cd video/remotion && node preview_sala.mjs <SalaId|mapa> <saida.jpg>
// (empacota só o código e as fontes: leve, pode rodar várias ao mesmo tempo)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'fs';
const [sala, saida] = process.argv.slice(2);
const raiz = '/home/user/B-ias-magras-/video/remotion';
const serve = await bundle({entryPoint: `${raiz}/src/index.ts`, publicDir: `${raiz}/public_mapa`});
const props = {sala: sala === 'mapa' ? undefined : sala};
const c = await selectComposition({serveUrl: serve, id: 'TesteSala', inputProps: props});
await renderStill({serveUrl: serve, composition: c, frame: 0, output: saida, imageFormat: 'jpeg', scale: 0.5, inputProps: props});
fs.rmSync(serve, {recursive: true, force: true});
console.log('ok', saida);
