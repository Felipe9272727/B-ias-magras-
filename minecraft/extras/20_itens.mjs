// Itens do replay: o item na mão de cada IA e os itens caídos no chão (ver extras/README.md).
// Os itens do chão vêm de mobs (m === 'item') sem o tipo: o tipo sai do bloco quebrado mais perto
// (o bloco de antes, pelos registros ou pelo pedaço salvo) e, se não der, do que a IA mais perto coletava.
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const PASTA = path.dirname(fileURLToPath(import.meta.url))
const TEXTURAS = path.join(PASTA, '..', 'texturas_oficiais', 'assets', 'minecraft', 'textures')
const ALCANCE = 24  // blocos da câmera
const AR = new Set(['air', 'cave_air', 'void_air'])
const SEM_DROP = new Set(['water', 'lava', 'fire', 'bubble_column', 'glass'])  // quebrar isso não solta item
// bloco quebrado -> item que cai (o que não está aqui cai como ele mesmo)
const SOLTA = {
  stone: 'cobblestone', grass_block: 'dirt', coal_ore: 'coal', deepslate_coal_ore: 'coal',
  iron_ore: 'raw_iron', deepslate_iron_ore: 'raw_iron', copper_ore: 'raw_copper', gold_ore: 'raw_gold',
  deepslate: 'cobbled_deepslate', short_grass: 'wheat_seeds', grass: 'wheat_seeds', tall_grass: 'wheat_seeds'
}
// o que a IA estava coletando (decisao.args.alvo) -> item
const ALVO = {
  madeira: 'spruce_log', pedra: 'cobblestone', carvão: 'coal', carvao: 'coal', ferro: 'raw_iron',
  iron_ore: 'raw_iron', iron: 'raw_iron', areia: 'sand', terra: 'dirt', cobbled_deepslate: 'cobbled_deepslate'
}

let itens, quebras, posicoes, decisoes, registro, interp, porChunk, Chunk, Vec3
const tipoItem = new Map()   // id do item -> {nome, bloco} (ou null)
const existe = new Map()     // nome -> tem textura de item?
const pedacos = new Map()    // arquivo do pedaço -> JSON lido (cache pequeno)
const colunas = new Map()    // arquivo do pedaço -> Chunk montado (cache pequeno)

function temItem (nome) {
  if (!existe.has(nome)) existe.set(nome, fs.existsSync(path.join(TEXTURAS, 'item', nome + '.png')))
  return existe.get(nome)
}

// último registro com t <= t (lista ordenada por t); -1 se não há
function ultimoAte (lista, t) {
  let lo = 0, hi = lista.length - 1, achou = -1
  while (lo <= hi) { const m = (lo + hi) >> 1; if (lista[m].t <= t) { achou = m; lo = m + 1 } else hi = m - 1 }
  return achou
}

export function preparar (dados) {
  ({ posicoes, registro, interp } = dados)
  // itens do chão, juntando as IAs pelo id
  itens = new Map()
  for (const lista of dados.mobsPorBot) for (const r of lista) for (const m of r.l) {
    if (m.m !== 'item') continue
    let a = itens.get(m.id)
    if (!a) itens.set(m.id, a = [])
    a.push({ t: r.t, x: m.x, y: m.y, z: m.z })
  }
  for (const a of itens.values()) a.sort((p, q) => p.t - q.t)
  // mudanças de bloco por posição (blocos já vêm ordenados por t)
  quebras = new Map()
  for (const b of dados.blocos) {
    const k = b.x + ',' + b.y + ',' + b.z
    let a = quebras.get(k)
    if (!a) quebras.set(k, a = [])
    a.push(b)
  }
  decisoes = dados.eventos.filter(e => e.tipo === 'decisao' && e.args?.alvo)
  // pedaços salvos (várias versões por pedaço, em ordem de sessão)
  porChunk = new Map()
  const pasta = path.join(dados.DIR, 'chunks')
  if (fs.existsSync(pasta)) for (const f of fs.readdirSync(pasta)) {
    const [x, z, s] = f.replace('.json.gz', '').split('_')
    const k = `${x}_${z}`
    if (!porChunk.has(k)) porChunk.set(k, [])
    porChunk.get(k).push({ sessao: s ? +s.slice(1) : 0, arq: path.join(pasta, f) })
  }
  for (const l of porChunk.values()) l.sort((a, b) => a.sessao - b.sessao)
  Chunk = require('prismarine-chunk')(registro)
  Vec3 = require('vec3').Vec3
}

function lerPedaco (arq) {
  if (!pedacos.has(arq)) {
    if (pedacos.size > 60) pedacos.delete(pedacos.keys().next().value)
    pedacos.set(arq, JSON.parse(zlib.gunzipSync(fs.readFileSync(arq))))
  }
  return pedacos.get(arq)
}

// nome do bloco na posição, no último pedaço salvo antes de t (o estado antes da quebra)
function blocoNoPedaco (x, y, z, t) {
  let d = null
  for (const v of porChunk.get(`${Math.floor(x / 16)}_${Math.floor(z / 16)}`) ?? []) {
    const dv = lerPedaco(v.arq)
    if (dv.t > t) break
    d = { arq: v.arq, t: dv.t }
  }
  if (!d) return null
  if (!colunas.has(d.arq)) {
    if (colunas.size > 40) colunas.delete(colunas.keys().next().value)
    colunas.set(d.arq, Chunk.fromJson(lerPedaco(d.arq).col))
  }
  const col = colunas.get(d.arq)
  const id = col.getBlockStateId(new Vec3(((x % 16) + 16) % 16, y, ((z % 16) + 16) % 16))
  return registro.blocksByStateId[id]?.name ?? null
}

// o bloco que estava no lugar antes da quebra: pelos registros, senão pelo pedaço salvo
function blocoAntes (x, y, z, tb) {
  let achou = null
  for (const b of quebras.get(x + ',' + y + ',' + z) ?? []) {
    if (b.t >= tb) break
    if (!AR.has(b.b)) achou = b.b
  }
  return achou ?? blocoNoPedaco(x, y, z, tb - 0.01)
}

// item que sai de um bloco quebrado (null: quebrar isso não solta nada)
function itemDoBloco (bloco) {
  if (SEM_DROP.has(bloco)) return null
  if (SOLTA[bloco] !== undefined) return SOLTA[bloco]
  if (bloco.endsWith('_leaves')) return 'stick'
  return bloco
}

// palpite: o que a IA mais perto do item estava coletando
function palpite (p, ts) {
  let melhor = null, dm = Infinity
  for (const d of decisoes) {
    if (d.t < ts - 20 || d.t > ts + 0.5) continue
    const pos = interp(posicoes[d.quem], d.t)
    if (!pos) continue
    const dist = Math.hypot(pos.x - p.x, pos.z - p.z)
    if (dist < 8 && (dist < dm || (dist === dm && d.t > melhor.t))) { melhor = d; dm = dist }
  }
  return ALVO[melhor?.args?.alvo] ?? 'cobblestone'
}

// o tipo do item: o bloco quebrado mais perto (até 2 blocos, até 3 s antes de o item aparecer)
function tipoDo (id) {
  if (tipoItem.has(id)) return tipoItem.get(id)
  const lista = itens.get(id), p = lista[0], ts = p.t
  let nome = null, melhor = null
  for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 1; dy++) for (let dz = -2; dz <= 2; dz++) {
    const bx = Math.floor(p.x) + dx, by = Math.floor(p.y) + dy, bz = Math.floor(p.z) + dz
    const dist = Math.hypot(p.x - (bx + 0.5), p.y - (by + 0.5), p.z - (bz + 0.5))
    if (dist > 2.5 || (melhor && dist >= melhor.dist)) continue
    const quebra = (quebras.get(bx + ',' + by + ',' + bz) ?? []).find(b => AR.has(b.b) && b.t >= ts - 3 && b.t <= ts + 0.5)
    if (quebra) melhor = { dist, x: bx, y: by, z: bz, tb: quebra.t }
  }
  if (melhor) {
    const antes = blocoAntes(melhor.x, melhor.y, melhor.z, melhor.tb)
    if (antes) nome = itemDoBloco(antes)  // null se quebrar isso não solta item (água, vidro)
  }
  if (!nome) nome = palpite(p, ts)
  const r = { nome, bloco: !temItem(nome) }
  tipoItem.set(id, r)
  return r
}

export function noQuadro (t, ctx) {
  // item na mão: o último registro de cada IA até t
  const maos = {}, maoBloco = {}
  for (const n of Object.keys(posicoes)) {
    const lista = posicoes[n]
    const i = ultimoAte(lista, t)
    const mao = i >= 0 ? (lista[i].mao ?? null) : null
    maos['p_' + n] = mao
    maoBloco['p_' + n] = mao ? !temItem(mao) : false
  }
  // itens do chão que existem em t (registro de até 1 s antes) e estão perto da câmera
  const cam = ctx.camera?.pos
  const chao = []
  for (const [id, lista] of itens) {
    if (t < lista[0].t || t > lista[lista.length - 1].t + 1) continue
    const i = ultimoAte(lista, t)
    if (i < 0 || t - lista[i].t > 1) continue
    const a = lista[i], b = lista[i + 1]
    let x = a.x, y = a.y, z = a.z
    if (b && b.t - a.t <= 1) {
      const k = (t - a.t) / Math.max(1e-6, b.t - a.t)
      x = a.x + (b.x - a.x) * k; y = a.y + (b.y - a.y) * k; z = a.z + (b.z - a.z) * k
    }
    if (cam && Math.hypot(x - cam.x, y - cam.y, z - cam.z) > ALCANCE) continue
    const tp = tipoDo(id)
    chao.push({ id, x: +x.toFixed(3), y: +y.toFixed(3), z: +z.toFixed(3), nome: tp.nome, bloco: tp.bloco, idade: +(t - lista[0].t).toFixed(3) })
  }
  return { maos, maoBloco, chao }
}
