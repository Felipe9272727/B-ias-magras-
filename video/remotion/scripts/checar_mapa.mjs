// Confere o mapa da nave (src/amongus/nave/mapa.ts) contra o contrato (src/amongus/nave/spec.ts).
// Uso, a partir de video/remotion:  node scripts/checar_mapa.mjs
// Gera bundles com esbuild em /tmp, verifica grade, salas, pontos, portas, rotas e tempo do caminho,
// e imprime uma pré-visualização em ASCII.
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '..');
const ESBUILD = path.join(RAIZ, 'node_modules/.bin/esbuild');
const BUNDLE_MAPA = '/tmp/mapa_check.mjs';
const BUNDLE_SPEC = '/tmp/spec_check.mjs';

execFileSync(ESBUILD, ['src/amongus/nave/mapa.ts', '--bundle', '--platform=node', '--format=esm', `--outfile=${BUNDLE_MAPA}`], {cwd: RAIZ, stdio: 'inherit'});
execFileSync(ESBUILD, ['src/amongus/nave/spec.ts', '--bundle', '--platform=node', '--format=esm', `--outfile=${BUNDLE_SPEC}`], {cwd: RAIZ, stdio: 'inherit'});

const M = await import(pathToFileURL(BUNDLE_MAPA).href);
const S = await import(pathToFileURL(BUNDLE_SPEC).href);
const {NAVE, andavel, salaEm, caminho, centroSala} = M;
const {SALAS_ORDEM, VIZINHAS, COM_DUTO, TILE} = S;

const falhas = [];
const avisos = [];
let checagens = 0;
const checa = (cond, msg) => { checagens++; if (!cond) falhas.push(msg); };

const TIPOS = new Set(['mesa', 'banco', 'motor', 'reator', 'painel', 'caixa', 'cama', 'scanner', 'monitor', 'planta', 'mapa', 'antena', 'escudo', 'leme', 'canhao', 'botao', 'cano', 'armario']);
const ch = (c, r) => (r < 0 || c < 0 || r >= NAVE.rows || c >= NAVE.cols) ? ' ' : NAVE.grid[r][c];
const parede = (c, r) => ch(c, r) === '#' || ch(c, r) === ' ';
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
// distância de um ponto (px) a uma caixa (px) [x0,y0,x1,y1]
const distCaixa = (p, [x0, y0, x1, y1]) => Math.hypot(Math.max(x0 - p.x, 0, p.x - x1), Math.max(y0 - p.y, 0, p.y - y1));
const caixaCelula = (c, r) => [c * TILE, r * TILE, (c + 1) * TILE, (r + 1) * TILE];
const distParede = p => {
  const c0 = Math.floor(p.x / TILE), r0 = Math.floor(p.y / TILE);
  let m = Infinity;
  for (let r = r0 - 3; r <= r0 + 3; r++) for (let c = c0 - 3; c <= c0 + 3; c++)
    if (parede(c, r)) m = Math.min(m, distCaixa(p, caixaCelula(c, r)));
  return m;
};
const caixaProp = p => [p.x - p.w / 2, p.y - p.h / 2, p.x + p.w / 2, p.y + p.h / 2];
const noPiso = (p, s) => andavel(p) && salaEm(p) === s;

// 1) grade
checa(NAVE.grid.length === NAVE.rows, `grid tem ${NAVE.grid.length} linhas, esperado ${NAVE.rows}`);
NAVE.grid.forEach((l, i) => {
  checa(l.length === NAVE.cols, `linha ${i} tem ${l.length} colunas, esperado ${NAVE.cols}`);
  checa(!/[^ #.,D]/.test(l), `linha ${i} tem caractere inválido`);
});
if (NAVE.cols < 110 || NAVE.cols > 130 || NAVE.rows < 70 || NAVE.rows > 80) avisos.push(`tamanho ${NAVE.cols}x${NAVE.rows} fora de 110-130 x 70-80`);

// 2) salas: retângulo = piso exato; cada '.' pertence a uma única sala
const porSala = Object.fromEntries(SALAS_ORDEM.map(s => [s, 0]));
let pisoTotal = 0;
for (let r = 0; r < NAVE.rows; r++) for (let c = 0; c < NAVE.cols; c++) {
  if (ch(c, r) !== '.') continue;
  pisoTotal++;
  const donos = SALAS_ORDEM.filter(s => {
    const {c: x, r: y, w, h} = NAVE.salas[s].rect;
    return c >= x && c < x + w && r >= y && r < y + h;
  });
  checa(donos.length === 1, `piso em ${c},${r} não pertence a uma única sala (${donos.join(',') || 'nenhuma'})`);
  if (donos.length === 1) porSala[donos[0]]++;
}
let areaRetangulos = 0;
for (const s of SALAS_ORDEM) {
  const {w, h} = NAVE.salas[s].rect;
  areaRetangulos += w * h;
  checa(porSala[s] === w * h, `${s}: rect ${w}x${h} não é todo piso (piso dentro do rect = ${porSala[s]})`);
}
checa(areaRetangulos === pisoTotal, `total de piso ${pisoTotal} != soma dos rects ${areaRetangulos}`);
checa(Object.keys(NAVE.salas).length === SALAS_ORDEM.length, 'salas faltando ou sobrando');

// 3) pontos, consoles, duto, props
const TIPOS_OK = new Set(TIPOS);
const esperaTemaCores = /^#[0-9a-f]{6}$/i;
for (const s of SALAS_ORDEM) {
  const d = NAVE.salas[s];
  checa(typeof d.nome === 'string' && d.nome.length > 0, `${s}: nome vazio`);
  for (const k of ['piso', 'piso2', 'parede', 'paredeTopo', 'destaque']) checa(esperaTemaCores.test(d.tema[k]), `${s}: tema.${k} inválido`);

  checa(d.spots.length === 8, `${s}: ${d.spots.length} spots, esperado 8`);
  d.spots.forEach((p, i) => {
    checa(noPiso(p, s), `${s}: spot ${i} fora do piso da sala`);
    const dp = distParede(p);
    checa(dp >= 1.5 * TILE - 1e-6, `${s}: spot ${i} a ${(dp / TILE).toFixed(2)} células da parede (min 1.5)`);
    for (const pr of d.props) {
      const dd = distCaixa(p, caixaProp(pr));
      checa(dd >= 1.5 * TILE - 1e-6, `${s}: spot ${i} a ${(dd / TILE).toFixed(2)} células do prop ${pr.tipo} (min 1.5)`);
    }
    if (d.duto) checa(dist(p, d.duto) >= TILE - 1e-6, `${s}: spot ${i} sobre o duto`);
    for (const q of d.consoles) checa(dist(p, q) >= TILE - 1e-6, `${s}: spot ${i} sobre um console`);
  });
  let minSpot = Infinity;
  for (let i = 0; i < d.spots.length; i++) for (let j = i + 1; j < d.spots.length; j++) minSpot = Math.min(minSpot, dist(d.spots[i], d.spots[j]));
  if (minSpot < 2 * TILE) avisos.push(`${s}: spots bem próximos (mín ${(minSpot / TILE).toFixed(2)} células)`);

  checa(d.consoles.length >= 2, `${s}: ${d.consoles.length} consoles, mínimo 2`);
  for (const q of d.consoles) {
    checa(noPiso(q, s), `${s}: console fora do piso`);
    const c = Math.floor(q.x / TILE), r = Math.floor(q.y / TILE);
    checa(parede(c + 1, r) || parede(c - 1, r) || parede(c, r + 1) || parede(c, r - 1), `${s}: console não está encostado em parede`);
  }

  if (COM_DUTO.includes(s)) {
    checa(!!d.duto, `${s}: falta duto (sala está em COM_DUTO)`);
    if (d.duto) {
      checa(noPiso(d.duto, s), `${s}: duto fora do piso`);
      // canto: duas paredes encostadas na célula do duto
      const c = Math.floor(d.duto.x / TILE), r = Math.floor(d.duto.y / TILE);
      const paredesVizinhas = [parede(c + 1, r), parede(c - 1, r), parede(c, r + 1), parede(c, r - 1)].filter(Boolean).length;
      checa(paredesVizinhas >= 2, `${s}: duto não está num canto`);
    }
  } else {
    checa(!d.duto, `${s}: tem duto mas não está em COM_DUTO`);
  }

  checa(d.props.length >= 3 && d.props.length <= 8, `${s}: ${d.props.length} props, esperado 3 a 8`);
  for (const pr of d.props) {
    checa(TIPOS_OK.has(pr.tipo), `${s}: tipo de prop desconhecido '${pr.tipo}'`);
    checa(noPiso({x: pr.x, y: pr.y}, s), `${s}: centro do prop ${pr.tipo} fora do piso`);
    const [x0, y0, x1, y1] = caixaProp(pr);
    const {c, r, w, h} = d.rect;
    checa(x0 >= c * TILE && y0 >= r * TILE && x1 <= (c + w) * TILE && y1 <= (r + h) * TILE, `${s}: prop ${pr.tipo} sai do piso`);
    // não bloqueia porta: nenhuma célula 'D' a menos de meia célula da caixa
    for (let rr = Math.floor(y0 / TILE) - 1; rr <= Math.floor(y1 / TILE) + 1; rr++)
      for (let cc = Math.floor(x0 / TILE) - 1; cc <= Math.floor(x1 / TILE) + 1; cc++)
        if (ch(cc, rr) === 'D') checa(distCaixa({x: (cc + 0.5) * TILE, y: (rr + 0.5) * TILE}, [x0, y0, x1, y1]) > TILE / 2, `${s}: prop ${pr.tipo} bloqueia porta em ${cc},${rr}`);
  }
}

// 4) rotas entre salas vizinhas (spot 0 -> spot 0) e de todo spot/console até o centro da sala
function percorre(rota, a, b, nomeRota) {
  checa(rota.length >= 2, `${nomeRota}: rota vazia`);
  checa(dist(rota[0], a) < 0.5 && dist(rota[rota.length - 1], b) < 0.5, `${nomeRota}: rota não começa/termina nos pontos pedidos`);
  for (let i = 0; i + 1 < rota.length; i++) {
    const p = rota[i], q = rota[i + 1];
    const n = Math.max(1, Math.ceil(dist(p, q) / 6));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const amostra = {x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t};
      if (!andavel(amostra)) { checa(false, `${nomeRota}: segmento sai do caminho andável em ${amostra.x.toFixed(0)},${amostra.y.toFixed(0)}`); return; }
    }
  }
}

let tempoMax = 0, tempoTotal = 0, pares = 0;
for (const [A, B] of VIZINHAS) {
  const a = NAVE.salas[A].spots[0], b = NAVE.salas[B].spots[0];
  const t0 = performance.now();
  const rota = caminho(a, b);
  const dt = performance.now() - t0;
  tempoMax = Math.max(tempoMax, dt); tempoTotal += dt; pares++;
  const nome = `${A}->${B}`;
  percorre(rota, a, b, nome);
  // nenhum segmento pode entrar no piso de uma terceira sala
  for (let i = 0; i + 1 < rota.length; i++) {
    const p = rota[i], q = rota[i + 1];
    const n = Math.max(1, Math.ceil(dist(p, q) / 6));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const s = salaEm({x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t});
      if (s && s !== A && s !== B) { checa(false, `${nome}: rota entra na sala ${s}`); i = rota.length; break; }
    }
  }
}

// todo spot e console alcança o centro da própria sala sem sair dela
let rotasInternas = 0;
for (const s of SALAS_ORDEM) {
  const centro = centroSala(s);
  const d = NAVE.salas[s];
  for (const p of [...d.spots, ...d.consoles]) {
    const rota = caminho(p, centro);
    rotasInternas++;
    percorre(rota, p, centro, `${s} (ponto -> centro)`);
    for (const q of rota) if (salaEm(q) !== s && !(q === rota[0] || q === rota[rota.length - 1])) {
      const dentro = salaEm(q);
      if (dentro && dentro !== s) { checa(false, `${s}: rota interna entra em ${dentro}`); break; }
    }
  }
}

// 5) pré-visualização ASCII
const letra = {Refeitorio: 'R', Armas: 'W', O2: 'O', Navegacao: 'N', Escudos: 'S', Comunicacoes: 'C', Deposito: 'T', Admin: 'A',
  Eletrica: 'E', MotorInferior: 'M', Seguranca: 'G', Reator: 'X', MotorSuperior: 'U', Enfermaria: 'F'};
const linhasAscii = [];
for (let r = 0; r < NAVE.rows; r++) {
  let l = '';
  for (let c = 0; c < NAVE.cols; c++) {
    const k = ch(c, r);
    if (k === '.') l += letra[salaEm({x: (c + 0.5) * TILE, y: (r + 0.5) * TILE})] ?? '?';
    else if (k === ',') l += '.';
    else if (k === 'D') l += '+';
    else l += k === '#' ? '#' : ' ';
  }
  linhasAscii.push(l.replace(/\s+$/, ''));
}

console.log('\nPré-visualização (letras = salas, "." = corredor, "+" = porta, "#" = parede):');
console.log(linhasAscii.map((l, i) => String(i).padStart(2) + ' ' + l).join('\n'));
console.log('\nLegenda: ' + Object.entries(letra).map(([k, v]) => `${v}=${k}`).join('  '));

console.log(`\nRotas entre salas vizinhas: ${pares} pares; tempo do caminho (1ª chamada): máx ${tempoMax.toFixed(2)} ms, média ${(tempoTotal / pares).toFixed(2)} ms`);
const t1 = performance.now();
for (const [A, B] of VIZINHAS) caminho(NAVE.salas[A].spots[0], NAVE.salas[B].spots[0]);
console.log(`Mesmas rotas com cache: ${((performance.now() - t1) / pares).toFixed(3)} ms por chamada`);
console.log(`Rotas internas (spot/console -> centro): ${rotasInternas}`);
console.log(`Checagens: ${checagens}, falhas: ${falhas.length}`);
if (avisos.length) { console.log('Avisos:'); for (const a of avisos) console.log(' - ' + a); }
if (falhas.length) {
  console.log('FALHAS:');
  for (const f of falhas) console.log(' - ' + f);
  process.exitCode = 1;
} else {
  console.log('OK: todas as checagens passaram.');
}
