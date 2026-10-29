// Mapa visto de cima (1 px = 1 bloco) e rastros das IAs, a partir dos pedaços gravados da partida1.
// Uso: node mapa.mjs   (gera video/remotion/public/mc/mapa/mapa.png, mapa.json e rastros.json)
import {createRequire} from 'module';
import {mkdirSync, readFileSync, readdirSync, writeFileSync} from 'fs';
import {gunzipSync} from 'zlib';

const require = createRequire(import.meta.url);
const BASE = '/home/user/B-ias-magras-/minecraft';
const PARTIDA = `${BASE}/gravacoes/partida1`;
const SAIDA = '/home/user/B-ias-magras-/video/remotion/public/mc/mapa';
const IAS = ['DeepSeek', 'Qwen', 'Claude', 'GPT', 'GLM', 'MiMo'];
const CORES_IA = {DeepSeek: '#4d6bfe', Qwen: '#8b6cff', Claude: '#d97757', GPT: '#10a37f', GLM: '#3d7bff', MiMo: '#ff6900'};

const registro = require(`${BASE}/node_modules/prismarine-registry`)('1.21.4');
const Chunk = require(`${BASE}/node_modules/prismarine-chunk`)(registro);
const {Vec3} = require(`${BASE}/node_modules/vec3`);
const {createCanvas} = require(`${BASE}/node_modules/canvas`);

// ---------- cores do mapa do Minecraft (MapColor, em hex) ----------
const TINTAS = {white: 'ffffff', orange: 'd87f33', magenta: 'b24cd8', light_blue: '6699d8', yellow: 'e5e533', lime: '7fcc19', pink: 'f27fa5', gray: '4c4c4c', light_gray: '999999', cyan: '4c7f99', purple: '7f3fb2', blue: '334cb2', brown: '664c33', green: '667f33', red: '993333', black: '191919'};
const TERRACOTA = {white: 'd1b1a1', orange: '9f5224', magenta: '95576c', light_blue: '706c8a', yellow: 'ba8524', lime: '677535', pink: 'a04d4e', gray: '392923', light_gray: '876b62', cyan: '575c5c', purple: '7a4958', blue: '4c3e5c', brown: '4c3223', green: '4c522a', red: '8e3c2e', black: '251610'};

const TABELA = {
  grass_block: '7fb238', dirt: '976d4d', coarse_dirt: '976d4d', rooted_dirt: '976d4d', dirt_path: '976d4d', farmland: '976d4d',
  podzol: '815631', mycelium: '6f5a5a', mud: '3f3a35', clay: 'a4a8b8', sand: 'f7e9a3', sandstone: 'f7e9a3',
  smooth_sandstone: 'f7e9a3', cut_sandstone: 'f7e9a3', chiseled_sandstone: 'f7e9a3', red_sand: 'd87f33',
  red_sandstone: 'd87f33', gravel: '707070', stone: '707070', cobblestone: '707070', stone_bricks: '707070',
  andesite: '707070', diorite: 'fffcf5', granite: '815631', tuff: '707070', calcite: 'fffcf5', bedrock: '707070',
  deepslate: '646464', cobbled_deepslate: '646464', netherrack: '700200', nether_bricks: '700200', basalt: '191919',
  blackstone: '191919', obsidian: '191919', crying_obsidian: '191919', water: '4040ff', lava: 'ff0000', ice: 'a0a0ff',
  packed_ice: 'a0a0ff', blue_ice: 'a0a0ff', frosted_ice: 'a0a0ff', snow: 'ffffff', snow_block: 'ffffff', powder_snow: 'ffffff',
  oak_planks: '8f7748', oak_log: '8f7748', oak_wood: '8f7748', stripped_oak_log: '8f7748', spruce_planks: '815631',
  spruce_log: '815631', birch_planks: 'f7e9a3', birch_log: 'fffcf5', jungle_planks: '8f7748', jungle_log: '8f7748',
  acacia_planks: '8f7748', acacia_log: '8f7748', dark_oak_planks: '8f7748', dark_oak_log: '8f7748',
  cherry_planks: 'd1b1a1', cherry_log: 'd1b1a1', mangrove_planks: '8f7748', mangrove_log: '8f7748',
  crafting_table: '8f7748', chest: '8f7748', bookshelf: '8f7748', oak_leaves: '007c00', spruce_leaves: '007c00',
  birch_leaves: '007c00', jungle_leaves: '007c00', acacia_leaves: '007c00', dark_oak_leaves: '007c00',
  mangrove_leaves: '007c00', cherry_leaves: 'f27fa5', azalea_leaves: '007c00', flowering_azalea_leaves: '007c00',
  vine: '007c00', lily_pad: '007c00', kelp: '007c00', kelp_plant: '007c00', seagrass: '007c00', tall_seagrass: '007c00',
  sugar_cane: '007c00', bamboo: '007c00', cactus: '667f33', short_grass: '7fb238', tall_grass: '7fb238', fern: '7fb238',
  large_fern: '7fb238', dead_bush: '7fb238', moss_block: '007c00', moss_carpet: '007c00', iron_block: 'a7a7a7',
  iron_bars: 'a7a7a7', anvil: 'a7a7a7', copper_block: 'd87f33', gold_block: 'faee4d', diamond_block: '5cdbd5',
  emerald_block: '00d93a', lapis_block: '4a80ff', redstone_block: 'ff0000', coal_block: '191919', bricks: '993333',
  glass: 'c3e6f0', glass_pane: 'c3e6f0', torch: '8f7748', ladder: '8f7748', oak_fence: '8f7748', oak_door: '8f7748',
  sea_lantern: 'a0a0a0', prismarine: '5cdbd5', dark_prismarine: '4c7f99', purpur_block: '7f3fb2', end_stone: 'f7e9a3',
  mushroom_stem: 'fffcf5', brown_mushroom_block: '815631', red_mushroom_block: '993333', sponge: 'e5e533',
  wet_sponge: 'e5e533', hay_block: 'e5e533', honey_block: 'faee4d', slime_block: '7fcc19', terracotta: '9f5224',
  dandelion: '7fb238', poppy: '7fb238', oxeye_daisy: '7fb238', lilac: '7fb238', peony: '7fb238', azure_bluet: '7fb238',
  pumpkin: 'd87f33', campfire: '8f7748', bell: 'faee4d', composter: '8f7748', spruce_stairs: '815631', wall_torch: '8f7748',
};
for (const [c, hex] of Object.entries(TINTAS)) {
  TABELA[`${c}_wool`] = hex;
  TABELA[`${c}_carpet`] = hex;
  TABELA[`${c}_concrete`] = hex;
  TABELA[`${c}_concrete_powder`] = hex;
  TABELA[`${c}_terracotta`] = TERRACOTA[c];
}

// cor pelo nome quando o bloco não está na tabela; null = reserva
function corHeuristica(n) {
  if (/leaves/.test(n)) return '007c00';
  if (/log|planks|wood|stem|hyphae|stripped|chest|barrel|fence|door|sign|crafting|bookshelf/.test(n)) return '8f7748';
  if (/deepslate/.test(n)) return '646464';
  if (/stone|cobble|brick|ore|andesite|diorite|granite|tuff|basalt|gravel|furnace|smooth|prismarine|calcite|dripstone|blackstone/.test(n)) return '707070';
  if (/sand/.test(n)) return 'f7e9a3';
  if (/dirt|mud|soil|farmland|path|podzol/.test(n)) return '976d4d';
  if (/snow/.test(n)) return 'ffffff';
  if (/ice/.test(n)) return 'a0a0ff';
  if (/flower|grass|fern|sapling|bush|petals|crop|wheat|carrot|potato|beetroot|plant/.test(n)) return '7fb238';
  return null;
}

const RESERVA = '6b6b6b';
const NAO_MAPEADOS = new Map();
function corDoBloco(n) {
  const hex = TABELA[n] ?? corHeuristica(n);
  if (hex) return hex;
  NAO_MAPEADOS.set(n, (NAO_MAPEADOS.get(n) ?? 0) + 1);
  return RESERVA;
}

const hexRgb = (h) => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
const AR = new Set(['air', 'cave_air', 'void_air']);
const AGUA_NOMES = new Set(['water', 'bubble_column']);

// ---------- 1. pedaço com o menor t por posição (mundo do começo) ----------
const dirChunks = `${PARTIDA}/chunks`;
const RE_ARQ = /^(-?\d+)_(-?\d+)(?:_s\d+)?\.json\.gz$/;
const arquivos = readdirSync(dirChunks).filter((f) => RE_ARQ.test(f));
const escolhido = new Map(); // "x,z" -> {t, path}
for (const f of arquivos) {
  const d = JSON.parse(gunzipSync(readFileSync(`${dirChunks}/${f}`)).toString());
  const k = `${d.x},${d.z}`;
  if (!escolhido.has(k) || d.t < escolhido.get(k).t) escolhido.set(k, {t: d.t, path: `${dirChunks}/${f}`, x: d.x, z: d.z});
}
console.log(`arquivos: ${arquivos.length}, pedacos unicos: ${escolhido.size}`);

// limites em blocos (cada pedaço tem 16x16 colunas)
let xMin = Infinity, zMin = Infinity, xMax = -Infinity, zMax = -Infinity;
for (const p of escolhido.values()) {
  xMin = Math.min(xMin, p.x); zMin = Math.min(zMin, p.z);
  xMax = Math.max(xMax, p.x + 15); zMax = Math.max(zMax, p.z + 15);
}
const LARG = xMax - xMin + 1, ALT = zMax - zMin + 1;
const N = LARG * ALT;
const altura = new Int16Array(N).fill(-32768); // topo (y do bloco mais alto que não é ar), -32768 = sem dado
const cor = new Uint8Array(N * 3);
const fatorAgua = new Float32Array(N).fill(1); // profundidade da água
const ehAgua = new Uint8Array(N);

// ---------- 2. topo de cada coluna ----------
const t0 = Date.now();
let feitos = 0;
for (const p of escolhido.values()) {
  const pacote = JSON.parse(gunzipSync(readFileSync(p.path)).toString());
  const c = Chunk.fromJson(pacote.col);
  const topoY = c.minY + c.worldHeight - 1;
  for (let lz = 0; lz < 16; lz++) {
    for (let lx = 0; lx < 16; lx++) {
      let y = topoY, nome = null;
      for (; y >= c.minY; y--) {
        const b = registro.blocksByStateId[c.getBlockStateId(new Vec3(lx, y, lz))];
        if (!b || AR.has(b.name)) continue;
        nome = b.name;
        break;
      }
      if (nome === null) continue;
      const i = (p.z + lz - zMin) * LARG + (p.x + lx - xMin);
      altura[i] = y;
      if (AGUA_NOMES.has(nome)) {
        // profundidade: quantos blocos de água até o chão
        let fy = y - 1;
        for (; fy >= c.minY; fy--) {
          const b = registro.blocksByStateId[c.getBlockStateId(new Vec3(lx, fy, lz))];
          if (!b || (!AGUA_NOMES.has(b.name) && !AR.has(b.name))) break;
        }
        const prof = y - fy;
        ehAgua[i] = 1;
        fatorAgua[i] = Math.max(0.5, 1 - Math.max(0, prof - 1) * 0.06);
        const [r, g, bl] = hexRgb(corDoBloco('water'));
        cor[i * 3] = r; cor[i * 3 + 1] = g; cor[i * 3 + 2] = bl;
      } else {
        const [r, g, bl] = hexRgb(corDoBloco(nome));
        cor[i * 3] = r; cor[i * 3 + 1] = g; cor[i * 3 + 2] = bl;
      }
    }
  }
  feitos++;
  if (feitos % 200 === 0) console.log(`  pedacos: ${feitos}/${escolhido.size} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
console.log(`topo calculado em ${((Date.now() - t0) / 1000).toFixed(0)} s`);

// ---------- 3. sombreado como o mapa do jogo: norte mais baixo = claro, norte mais alto = escuro ----------
const K_NORMAL = 220, K_CLARO = 255, K_ESCURO = 180;
const img = createCanvas(LARG, ALT);
const ctx = img.getContext('2d');
const dados = ctx.createImageData(LARG, ALT);
let comDado = 0;
for (let i = 0; i < N; i++) {
  const o = i * 4;
  if (altura[i] === -32768) {
    dados.data[o] = 0x1b; dados.data[o + 1] = 0x1b; dados.data[o + 2] = 0x1b; dados.data[o + 3] = 255;
    continue;
  }
  comDado++;
  let k = K_NORMAL;
  if (ehAgua[i]) {
    k = K_NORMAL * fatorAgua[i];
  } else {
    const iz = Math.floor(i / LARG);
    if (iz > 0 && altura[i - LARG] !== -32768) {
      const dn = altura[i] - altura[i - LARG];
      if (dn > 0) k = K_CLARO;
      else if (dn < 0) k = K_ESCURO;
    }
  }
  const f = k / K_NORMAL;
  dados.data[o] = Math.min(255, cor[i * 3] * f);
  dados.data[o + 1] = Math.min(255, cor[i * 3 + 1] * f);
  dados.data[o + 2] = Math.min(255, cor[i * 3 + 2] * f);
  dados.data[o + 3] = 255;
}
ctx.putImageData(dados, 0, 0);
mkdirSync(SAIDA, {recursive: true});
writeFileSync(`${SAIDA}/mapa.png`, img.toBuffer('image/png'));
writeFileSync(`${SAIDA}/mapa.json`, JSON.stringify({
  xMin, zMin, largura: LARG, altura: ALT,
  nota: '1 pixel = 1 bloco. Coluna = x - xMin, linha = z - zMin. Norte (z menor) fica em cima. Fundo #1b1b1b = sem pedaço gravado.',
  colunasComDado: comDado,
}, null, 2));
console.log(`mapa: ${LARG}x${ALT}, colunas com dado: ${comDado}, origem xMin=${xMin} zMin=${zMin}`);
if (NAO_MAPEADOS.size) console.log('blocos sem cor propria (reserva):', [...NAO_MAPEADOS.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40));

// ---------- 4. rastros: posições a cada 2 s, nascimento, mortes ----------
const rastros = {partida: 'partida1', ias: {}};
for (const ia of IAS) {
  const pos = readFileSync(`${PARTIDA}/posicoes_${ia}.jsonl`, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const porBloco = new Map();
  for (const r of pos) {
    const k = Math.floor(r.t / 2);
    if (!porBloco.has(k)) porBloco.set(k, [round(r.t), round(r.x), round(r.z)]);
  }
  const pontos = [...porBloco.values()].sort((a, b) => a[0] - b[0]);
  const primeiro = pos[0];
  const eventos = readFileSync(`${PARTIDA}/eventos_${ia}.jsonl`, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const mortes = eventos.filter((e) => e.tipo === 'morte' && e.quem === ia).map((m) => {
    // última posição gravada antes (ou no instante) da morte
    let ult = null;
    for (const r of pos) { if (r.t <= m.t) ult = r; else break; }
    return {t: round(m.t), x: round(ult.x), z: round(ult.z), fase: m.fase};
  });
  rastros.ias[ia] = {
    cor: CORES_IA[ia],
    nascimento: {t: round(primeiro.t), x: round(primeiro.x), z: round(primeiro.z)},
    pontos,
    mortes,
  };
  console.log(`${ia}: nasceu (${primeiro.x}, ${primeiro.z}), ${pontos.length} pontos, mortes ${mortes.length}`);
}
rastros.duracao = Math.max(...IAS.map((ia) => rastros.ias[ia].pontos.at(-1)[0]));
writeFileSync(`${SAIDA}/rastros.json`, JSON.stringify(rastros));
console.log('rastros.json gravado');

function round(v) { return Math.round(v * 100) / 100; }
