// Confere a sincronia das cenas de jogo do Among Us 3 com a narração: para cada âncora (evento ↔ palavras), em que
// segundo o narrador fala, em que segundo o evento aparece na tela, a diferença, se o evento acontece perto da
// câmera (do jogador seguido) e os cortes / velocidades da cena.
// Uso: npx esbuild checar_sincronia.ts --bundle --platform=node --jsx=automatic --outfile=$S/sc.js && node $S/sc.js
import {readFileSync} from 'node:fs';
import {simular, type Partida2} from '../../remotion/src/amongus3/sim';
import {mapaDaCena, quandoNaCena, velocidade} from '../../remotion/src/amongus3/tempo';

const tl = JSON.parse(readFileSync(process.env.TL ?? '../../remotion/public/timeline_au3.json', 'utf8'));
const ps = tl.data.partidas as Record<string, Partida2>;
let pior = 0;
for (const sc of tl.scenes) {
  if (sc.visual?.name !== 'AU3Jogo') continue;
  const p = sc.visual.props;
  const s = simular(ps[String(p.partida)]);
  const {mapa, ditas, pares} = mapaDaCena(sc, p, s);
  const vs = Array.from({length: sc.duration}, (_, k) => velocidade(mapa, k));
  const lin = [`${sc.id} (${(sc.duration / 30).toFixed(1)} s, foco ${p.foco}) vel ${Math.min(...vs).toFixed(2)}–${Math.max(...vs).toFixed(2)}`
    + (mapa.cortes.length ? ` cortes: ${mapa.cortes.map((c) => `${(c.k / 30).toFixed(1)}s ${c.tipo}`).join(', ')}` : '')];
  (p.ancoras ?? []).forEach((a: [Record<string, unknown>, string], i: number) => {
    const [c, q] = pares[i];
    if (c < 0 || q < 0) { lin.push(`   !! âncora "${a[1]}" ${c < 0 ? 'palavra não achada' : 'evento não achado'} ${JSON.stringify(a[0])}`); pior = Math.max(pior, 99); return }
    const k = quandoNaCena(mapa, q);
    const e = s.eventos.find((x) => Object.entries(a[0]).every(([kk, v]) => (kk === 'contem' ? String(x.texto ?? '').includes(v as string) : kk === 'tique' && Object.keys(a[0]).length === 1 ? true : x[kk] === v)));
    const cam = s.q(p.foco, q);
    const longe = cam && e?.x !== undefined ? Math.round(Math.hypot(e.x - cam.x, e.y - cam.y)) : null;
    const err = k < 0 ? 99 : (k - c) / 30;
    pior = Math.max(pior, Math.abs(err));
    lin.push(`   "${a[1]}" fala ${(c / 30).toFixed(1)}s → evento ${k < 0 ? 'FORA' : (k / 30).toFixed(1) + 's'} (${err >= 0 ? '+' : ''}${err.toFixed(1)}s)${longe !== null ? ` a ${longe}px da câmera` : ''}`);
  });
  console.log(lin.join('\n'));
}
console.log('pior diferença', pior.toFixed(1), 's');
