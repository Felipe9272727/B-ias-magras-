// Movimento com a física do Minecraft (prismarine-physics, a mesma do Mineflayer) entre as posições gravadas, que
// são só 4 por segundo: a cada tick (20/s) um "jogador fantasma" anda, corre, pula e cai em direção ao ponto gravado
// logo à frente, colidindo com os blocos do mundo naquele instante. Sai um caminho de 20 pontos/s com pulos de
// verdade (sobe 0,42 bloco/tick, gravidade 0,08) em vez de linhas retas entre amostras. Se o fantasma se perde (mais
// de 1,5 bloco do gravado: morte, teleporte, empurrão), volta pro ponto gravado.
// Uso como módulo: trajetorias(DIR, nomes, t0, t1) -> { nome: [{t, x, y, z, yaw, pitch, chao}] }
// Teste: node trajetoria.mjs <gravação> <t0> <t1> <Nome> [saida.json]
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const registro = require('prismarine-registry')('1.21.4')
const Chunk = require('prismarine-chunk')(registro)
const Block = require('prismarine-block')(registro)
const { Physics, PlayerState } = require('prismarine-physics')
const { Vec3 } = require('vec3')

const TICK = 0.05
const lerJsonl = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : []

// mundo no instante t (pedaço gravado mais recente antes de t + blocos que mudaram até t); mudar(b) aplica uma mudança
export function mundoEm (DIR, blocos, t) {
  const porChunk = new Map()
  for (const f of fs.readdirSync(path.join(DIR, 'chunks'))) {
    const [x, z, s] = f.replace('.json.gz', '').split('_')
    ;(porChunk.get(`${x}_${z}`) ?? porChunk.set(`${x}_${z}`, []).get(`${x}_${z}`)).push({ sessao: s ? +s.slice(1) : 0, arq: path.join(DIR, 'chunks', f) })
  }
  const cols = new Map()
  const col = k => {
    if (!cols.has(k)) {
      let d = null
      for (const v of (porChunk.get(k) ?? []).sort((a, b) => a.sessao - b.sessao)) { const dv = JSON.parse(zlib.gunzipSync(fs.readFileSync(v.arq))); if (!d || dv.t <= t) d = dv }
      const c = d ? Chunk.fromJson(d.col) : null
      if (c) for (const b of blocos) if (b.t >= d.t && b.t <= t && `${Math.floor(b.x / 16)}_${Math.floor(b.z / 16)}` === k) c.setBlockStateId(new Vec3(((b.x % 16) + 16) % 16, b.y, ((b.z % 16) + 16) % 16), b.s)
      cols.set(k, c)
    }
    return cols.get(k)
  }
  const ar = Block.fromStateId(registro.blocksByName.air.defaultState, 0)
  return {
    getBlock (p) {
      const x = Math.floor(p.x), y = Math.floor(p.y), z = Math.floor(p.z)
      const c = col(`${Math.floor(x / 16)}_${Math.floor(z / 16)}`)
      const b = c ? Block.fromStateId(c.getBlockStateId(new Vec3(((x % 16) + 16) % 16, y, ((z % 16) + 16) % 16)), 0) : ar
      b.position = new Vec3(x, y, z)
      return b
    },
    mudar (b) { const c = col(`${Math.floor(b.x / 16)}_${Math.floor(b.z / 16)}`); if (c) c.setBlockStateId(new Vec3(((b.x % 16) + 16) % 16, b.y, ((b.z % 16) + 16) % 16), b.s) }
  }
}

function amostra (lista, t) {
  let lo = 0, hi = lista.length - 1
  if (t <= lista[0].t) return lista[0]
  if (t >= lista[hi].t) return lista[hi]
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (lista[m].t <= t) lo = m; else hi = m }
  const a = lista[lo], b = lista[hi], k = (t - a.t) / Math.max(1e-6, b.t - a.t)
  let dy = b.yaw - a.yaw
  while (dy > Math.PI) dy -= 2 * Math.PI
  while (dy < -Math.PI) dy += 2 * Math.PI
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k, yaw: a.yaw + dy * k, pitch: a.pitch + (b.pitch - a.pitch) * k }
}

export function trajetorias (DIR, nomes, t0, t1) {
  const arquivos = pre => fs.readdirSync(DIR).filter(f => f.startsWith(pre + '_') && f.endsWith('.jsonl')).map(f => path.join(DIR, f))
  const blocos = arquivos('blocos').flatMap(lerJsonl).sort((a, b) => a.t - b.t)
  const mundo = mundoEm(DIR, blocos, t0 - 1)
  const fisica = Physics(registro, mundo)
  const saida = {}
  const pos = {}
  for (const f of arquivos('posicoes')) for (const p of lerJsonl(f)) if (nomes.includes(p.n) && p.t >= t0 - 3 && p.t <= t1 + 3) (pos[p.n] ??= []).push(p)
  const fantasmas = {}
  for (const n of nomes) {
    const l = (pos[n] ?? []).sort((a, b) => a.t - b.t)
    if (!l.length) continue
    pos[n] = l
    const p = amostra(l, t0 - 1)
    fantasmas[n] = {
      version: '1.21.4', jumpTicks: 0, jumpQueued: false, fireworkRocketDuration: 0, inventory: { slots: [] },
      entity: { position: new Vec3(p.x, p.y, p.z), velocity: new Vec3(0, 0, 0), onGround: true, isInWater: false, isInLava: false, isInWeb: false, isCollidedHorizontally: false, isCollidedVertically: false, elytraFlying: false, yaw: p.yaw, pitch: 0, effects: {}, attributes: {} }
    }
    saida[n] = []
  }
  let iB = blocos.findIndex(b => b.t > t0 - 1); if (iB < 0) iB = blocos.length
  // começa 1 s antes pra chegar já andando
  for (let t = t0 - 1; t <= t1 + 1e-6; t += TICK) {
    while (iB < blocos.length && blocos[iB].t <= t) mundo.mudar(blocos[iB++])
    for (const [n, bot] of Object.entries(fantasmas)) {
      const e = bot.entity, l = pos[n]
      const agora = amostra(l, t), alvo = amostra(l, t + 0.3)
      const erro = Math.hypot(agora.x - e.position.x, agora.z - e.position.z), erroY = Math.abs(agora.y - e.position.y)
      if (erro > 1.5 || erroY > 2.5) { e.position = new Vec3(agora.x, agora.y, agora.z); e.velocity = new Vec3(0, 0, 0) }
      const dx = alvo.x - e.position.x, dz = alvo.z - e.position.z, dist = Math.hypot(dx, dz)
      const vel = dist / 0.3  // blocos por segundo pra chegar no alvo
      const anda = dist > 0.12
      if (anda) e.yaw = Math.atan2(-dx, -dz)
      const sobe = alvo.y - e.position.y
      const controle = {
        forward: anda, back: false, left: false, right: false, sneak: false,
        sprint: anda && vel > 4.8,
        jump: (e.isInWater && sobe > 0.1) || (e.onGround && ((sobe > 0.45 && dist < 2) || (e.isCollidedHorizontally && anda)))
      }
      const st = new PlayerState(bot, controle)
      fisica.simulatePlayer(st, mundo).apply(bot)
      // não passa do alvo andando devagar: freia quando já está quase lá
      if (!anda && e.onGround) e.velocity = new Vec3(e.velocity.x * 0.3, e.velocity.y, e.velocity.z * 0.3)
      if (t >= t0 - 1e-6) saida[n].push({ t: +t.toFixed(3), x: +e.position.x.toFixed(3), y: +e.position.y.toFixed(3), z: +e.position.z.toFixed(3), yaw: agora.yaw, pitch: agora.pitch, chao: e.onGround })
    }
  }
  return saida
}

if (process.argv[1]?.endsWith('trajetoria.mjs')) {
  const [DIR, a, b, nome, arq] = process.argv.slice(2)
  const tr = trajetorias(DIR, [nome], +a, +b)[nome]
  const l = fs.readdirSync(DIR).filter(f => f === `posicoes_${nome}.jsonl`).flatMap(f => lerJsonl(path.join(DIR, f)))
  let soma = 0, max = 0, pulos = 0, antes = true
  for (const p of tr) { const g = amostra(l, p.t); const d = Math.hypot(g.x - p.x, g.y - p.y, g.z - p.z); soma += d; max = Math.max(max, d); if (antes && !p.chao) pulos++; antes = p.chao }
  console.log(`${tr.length} ticks, erro médio ${(soma / tr.length).toFixed(2)} máx ${max.toFixed(2)}, saídas do chão ${pulos}`)
  if (arq) fs.writeFileSync(arq, JSON.stringify(tr))
}
