// Reencenação no Minecraft de verdade: o servidor vanilla 1.21.4 com o mundo do fim da partida volta cada cena ao
// estado daquele instante (blocos do log), seis bonecos (Mineflayer, um por IA) refazem os movimentos com a física do
// jogo (trajetoria.mjs), os mobs são recriados sem IA e movidos pelo log, e o cliente oficial ("Camera", espectador,
// com /spectate) filma a tela do Xvfb. O mundo roda LENTO vezes mais devagar (/tick rate) pra caber no FPS da máquina
// sem GPU; o ffmpeg grava a 30/LENTO quadros/s e depois acelera LENTO vezes -> 30 fps em tempo real.
// Uso: node reencena.mjs <gravação> <cenas.txt (id t0 t1 camera)> <pasta de saída>
// Precisa: servidor em localhost:25565 (RCON 25575, senha ias_local) e o cliente "Camera" já conectado no DISPLAY.
import fs from 'node:fs'
import path from 'node:path'
import { spawn, execSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { rcon } from './rcon.mjs'
import { trajetorias, mundoEm } from './trajetoria.mjs'
import * as anim from './extras/10_anim.mjs'

const require = createRequire(import.meta.url)
const mineflayer = require('mineflayer')
const registro = require('prismarine-registry')('1.21.4')
const Block = require('prismarine-block')(registro)
const { Vec3 } = require('vec3')

const [DIR, LISTA, SAIDA] = process.argv.slice(2)
const LENTO = Number(process.env.LENTO ?? 3)
const DISPLAY = process.env.DISPLAY ?? ':99'
const LARG = Number(process.env.LARG ?? 960), ALT = Number(process.env.ALT ?? 540)
const NOMES = ['DeepSeek', 'Qwen', 'Claude', 'GPT', 'GLM', 'MiMo']
const SEM_MOB = new Set(['item', 'experience_orb', 'arrow', 'falling_block', 'potion', 'lightning_bolt', 'tnt', 'egg', 'snowball', 'fishing_bobber'])
const RAIO_MOBS = 48, RAIO_BLOCOS = 96
const espera = ms => new Promise(ok => setTimeout(ok, ms))
const log = (...a) => console.log(`[${new Date().toTimeString().slice(0, 8)}]`, ...a)
const lerJsonl = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean) : []
const arquivos = pre => fs.readdirSync(DIR).filter(f => f.startsWith(pre + '_') && f.endsWith('.jsonl')).map(f => path.join(DIR, f))

// ---- dados
const posicoes = {}
for (const f of arquivos('posicoes')) for (const p of lerJsonl(f)) (posicoes[p.n] ??= []).push(p)
for (const l of Object.values(posicoes)) l.sort((a, b) => a.t - b.t)
const blocos = arquivos('blocos').flatMap(lerJsonl).sort((a, b) => a.t - b.t)
const mobsPorBot = arquivos('mobs').map(lerJsonl)
const eventos = arquivos('eventos').flatMap(lerJsonl).sort((a, b) => a.t - b.t)
const ARENA = eventos.find(e => e.tipo === 'arena')
anim.preparar({ posicoes, blocos, mobsPorBot, eventos, NOMES_IA: NOMES })

const estadoTexto = s => { const b = Block.fromStateId(s, 0); const p = Object.entries(b.getProperties()); return 'minecraft:' + b.name + (p.length ? `[${p.map(([k, v]) => `${k}=${v}`).join(',')}]` : '') }
const yawMC = y => +(180 - (y * 180) / Math.PI).toFixed(1)  // ângulo do Mineflayer (rad) -> graus do jogo
const pitchMC = p => +(-(p * 180) / Math.PI).toFixed(1)
function ultimoAte (lista, t) { let lo = 0, hi = lista.length - 1, a = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (lista[m].t <= t) { a = m; lo = m + 1 } else hi = m - 1 } return a }
// hora do dia: o servidor começou em "time set 0" com o ciclo ligado; a arena pôs "time set day" (1000)
const horaDoDia = t => ARENA && t >= ARENA.t ? Math.round(1000 + (t - ARENA.t) * 20) % 24000 : Math.round(t * 20) % 24000
const uuidMob = id => { const a = [0x52450000 | (id >>> 16 & 0xffff), id & 0xffff, 0x1234, id]; const h = a.map(n => (n >>> 0).toString(16).padStart(8, '0')).join(''); return { nbt: `[I;${a.map(n => n | 0).join(',')}]`, txt: `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}` } }

// ---- conexões
const cmd = rcon()
const tecla = k => { try { execSync(`xdotool key ${k}`, { env: { ...process.env, DISPLAY }, timeout: 5000 }) } catch (e) { log('xdotool', e.message) } }
async function bonecos () {
  const b = {}
  for (const n of NOMES) {
    b[n] = mineflayer.createBot({ host: '127.0.0.1', port: 25565, username: n, auth: 'offline', version: '1.21.4', physicsEnabled: false })
    b[n].on('error', e => log('boneco', n, e.message))
    b[n].on('kicked', r => log('boneco expulso', n, JSON.stringify(r).slice(0, 200)))
    await new Promise(ok => b[n].once('spawn', ok))
    b[n].physicsEnabled = false
    await espera(400)
  }
  return b
}

// o RCON do vanilla perde comandos mandados juntos: um por vez; o grosso vai num datapack (funções do servidor)
let filaRcon = Promise.resolve()
const um = c => (filaRcon = filaRcon.then(() => cmd(c)))
const PACK = path.join(process.env.MUNDO ?? '/tmp/srv/mundo', 'datapacks', 'reenc')
function escreverFuncoes (prep, ticks) {
  const pasta = path.join(PACK, 'data', 'reenc', 'function')
  fs.rmSync(pasta, { recursive: true, force: true }); fs.mkdirSync(pasta, { recursive: true })
  fs.writeFileSync(path.join(PACK, 'pack.mcmeta'), JSON.stringify({ pack: { pack_format: 61, description: 'reencenacao' } }))
  fs.writeFileSync(path.join(pasta, 'prep.mcfunction'), prep.join('\n') + '\n')
  ticks.forEach((l, k) => fs.writeFileSync(path.join(pasta, `t${k}.mcfunction`), [...l, ...(k + 1 < ticks.length ? [`schedule function reenc:t${k + 1} 1t`] : [])].join('\n') + '\n'))
}

const mudadosPorNos = new Map()  // "x,y,z" -> estado que pusemos no servidor
function prepararMundo (t0, centro, prep) {
  for (const g of ['doDaylightCycle true', 'doMobSpawning false', 'doTileDrops false', 'doFireTick false', 'mobGriefing false', 'randomTickSpeed 0', 'keepInventory true', 'fallDamage false', 'drowningDamage false', 'fireDamage false', 'doImmediateRespawn true', 'showDeathMessages false', 'doWeatherCycle false', 'announceAdvancements false', 'sendCommandFeedback false', 'doEntityDrops false', 'doMobLoot false', 'commandModificationBlockLimit 99999999', 'maxCommandChainLength 99999999']) prep.push('gamerule ' + g)
  prep.push('weather clear', `time set ${horaDoDia(t0)}`, 'kill @e[type=!player]')
  // arena: caixa de vidro feita por comando (não está no log de blocos)
  if (ARENA) {
    const { x, y, z, r } = ARENA.arena
    if (t0 < ARENA.t) prep.push(`fill ${x - r} ${y - 1} ${z - r} ${x + r} ${y + 9} ${z + r} minecraft:air`)
    else prep.push(`fill ${x - r} ${y} ${z - r} ${x + r} ${y + 9} ${z + r} minecraft:glass hollow`, `fill ${x - r} ${y - 1} ${z - r} ${x + r} ${y - 1} ${z + r} minecraft:smooth_stone`)
  }
  // blocos: tudo o que mudou depois de t0 (no log) ou que nós mudamos antes volta pro estado de t0
  const perto = (x, z) => Math.abs(x - centro.x) < RAIO_BLOCOS && Math.abs(z - centro.z) < RAIO_BLOCOS
  const alvo = new Set()
  for (const b of blocos) if (b.t > t0 && perto(b.x, b.z)) alvo.add(`${b.x},${b.y},${b.z}`)
  for (const k of mudadosPorNos.keys()) { const [x, , z] = k.split(',').map(Number); if (perto(x, z)) alvo.add(k) }
  const mundo = mundoEm(DIR, blocos, t0)
  let n = 0
  for (const k of alvo) {
    const [x, y, z] = k.split(',').map(Number)
    const s = mundo.getBlock(new Vec3(x, y, z)).stateId
    if (mudadosPorNos.get(k) === s) continue
    prep.push(`setblock ${x} ${y} ${z} ${estadoTexto(s)}`); mudadosPorNos.set(k, s); n++
  }
  return n
}

// mobs do log: o registro mais recente de cada bot até 1 s antes, juntos sem repetir
function mobsEm (t) {
  const m = new Map()
  for (const lista of mobsPorBot) { const i = ultimoAte(lista, t); if (i >= 0 && t - lista[i].t < 1) for (const x of lista[i].l) if (!SEM_MOB.has(x.m) && registro.entitiesByName[x.m]) m.set(x.id, x) }
  return m
}
function mobPos (id, t) {  // posição interpolada entre registros (2 por segundo)
  let a = null, b = null
  for (const lista of mobsPorBot) {
    const i = ultimoAte(lista, t)
    if (i >= 0) { const r = lista[i].l.find(x => x.id === id); if (r && (!a || lista[i].t > a.t)) a = { ...r, t: lista[i].t } }
    if (i + 1 < lista.length) { const r = lista[i + 1].l.find(x => x.id === id); if (r && (!b || lista[i + 1].t < b.t)) b = { ...r, t: lista[i + 1].t } }
  }
  if (!a) return b; if (!b || b.t - a.t > 2) return a
  const k = Math.min(1, Math.max(0, (t - a.t) / Math.max(1e-6, b.t - a.t)))
  return { ...a, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k }
}

const SLOT = ['armor.head', 'armor.chest', 'armor.legs', 'armor.feet']
async function filmar (bots, id, t0, t1, cam) {
  const [modo, alvo] = cam.split(':')
  const ini = t0 - 1
  log(id, 'trajetórias...')
  const tr = trajetorias(DIR, NOMES, ini, t1)
  log(id, 'mundo...')
  const pAlvo = tr[alvo]?.[0] ?? posicoes[alvo][Math.max(0, ultimoAte(posicoes[alvo], t0))]
  const prep = [], nT = Math.round((t1 - ini) / 0.05) + 1, ticks = Array.from({ length: nT }, () => [])
  const nb = prepararMundo(t0, pAlvo, prep)
  log(id, 'blocos voltados:', nb)
  // bonecos: lugar, mão, armadura; quem não aparece na cena fica invisível
  const vestido = {}
  for (const n of NOMES) {
    prep.push(`gamemode adventure ${n}`, `effect give ${n} regeneration infinite 255 true`, `effect give ${n} saturation infinite 255 true`)
    const p = tr[n]?.[0]
    if (p) prep.push(`effect clear ${n} invisibility`, `tp ${n} ${p.x} ${p.y} ${p.z} ${yawMC(p.yaw)} ${pitchMC(p.pitch)}`)
    else prep.push(`effect give ${n} invisibility infinite 0 true`, `tp ${n} ${pAlvo.x} ${pAlvo.y + 60} ${pAlvo.z}`)
    vestido[n] = {}
  }
  const vestir = (n, t, l) => {
    const ps = posicoes[n]; const i = ultimoAte(ps, t); if (i < 0) return
    const r = ps[i], quer = { 'weapon.mainhand': r.mao ?? null, ...Object.fromEntries(SLOT.map((s, k) => [s, r.arm?.[k] ?? null])) }
    for (const [s, item] of Object.entries(quer)) if (vestido[n][s] !== item) { vestido[n][s] = item; l.push(`item replace entity ${n} ${s} with ${item ? 'minecraft:' + item : 'minecraft:air'}`) }
  }
  for (const n of NOMES) vestir(n, t0, prep)
  // mobs: invocados sem IA e movidos a cada tick pelo log
  const vivos = new Map()
  const atualizarMobs = (t, l) => {
    const agora = mobsEm(t)
    for (const [mid, m] of agora) {
      if (Math.hypot(m.x - pAlvo.x, m.z - pAlvo.z) > RAIO_MOBS) continue
      const p = mobPos(mid, t) ?? m, u = uuidMob(mid)
      if (!vivos.has(mid)) { vivos.set(mid, u.txt); l.push(`summon minecraft:${m.m} ${p.x.toFixed(2)} ${p.y.toFixed(2)} ${p.z.toFixed(2)} {UUID:${u.nbt},NoAI:1b,Silent:1b,PersistenceRequired:1b,Invulnerable:1b,Rotation:[${yawMC(p.yaw)}f,0f]}`) }
      else l.push(`tp ${u.txt} ${p.x.toFixed(2)} ${p.y.toFixed(2)} ${p.z.toFixed(2)} ${yawMC(p.yaw)} 0`)
    }
    for (const [mid, u] of vivos) if (!agora.has(mid)) { l.push(`kill ${u}`); vivos.delete(mid) }
  }
  atualizarMobs(ini, prep)
  // linha do tempo, tick a tick (vira uma função por tick, encadeadas com schedule)
  let iB = blocos.findIndex(b => b.t > ini); if (iB < 0) iB = blocos.length
  const antes = {}, golpes = [], mortes = eventos.filter(e => e.tipo === 'morte' && e.t >= ini && e.t <= t1 && NOMES.includes(e.quem))
  for (let k = 0; k < nT; k++) {
    const t = ini + k * 0.05, l = ticks[k]
    while (iB < blocos.length && blocos[iB].t <= t) {
      const b = blocos[iB++]
      if (Math.abs(b.x - pAlvo.x) < RAIO_BLOCOS && Math.abs(b.z - pAlvo.z) < RAIO_BLOCOS) { l.push(`setblock ${b.x} ${b.y} ${b.z} ${estadoTexto(b.s)}`); mudadosPorNos.set(`${b.x},${b.y},${b.z}`, b.s) }
    }
    for (const m of mortes) if (m.t <= t && !m.feito) { m.feito = true; l.push(`kill ${m.quem}`) }
    const q = anim.noQuadro(t).anim
    for (const n of NOMES) {
      const a = q['p_' + n]; if (!a) continue
      const ant = antes[n] ?? {}
      if (a.braco >= 0 && (ant.braco ?? -1) < 0) golpes.push([k, n])
      if (a.dano > 0.9 && (ant.dano ?? 0) <= 0.9) l.push(`damage ${n} 1 minecraft:generic`)
      antes[n] = a
      if (k % 4 === 0) vestir(n, t, l)
    }
    atualizarMobs(t, l)
  }
  escreverFuncoes(prep, ticks)
  await um('reload'); await um('tick rate 20'); await um('function reenc:prep')
  log(id, 'funções prontas:', prep.length, 'de preparo,', ticks.reduce((s, l) => s + l.length, 0), 'na cena')
  // câmera
  await um('gamemode spectator Camera')
  await um(`tp Camera ${pAlvo.x} ${pAlvo.y + 1.6} ${pAlvo.z}`)
  await espera(1500)
  await um(`spectate ${alvo} Camera`)
  const quer = modo === 'olhos' ? 0 : 1
  for (let i = 0; i < ((quer - perspectiva) % 3 + 3) % 3; i++) { tecla('F5'); await espera(150) }
  perspectiva = quer
  for (const n of NOMES) { const p = tr[n]?.[0]; if (p && bots[n].entity) { bots[n].entity.position = new Vec3(p.x, p.y, p.z); bots[n].entity.yaw = p.yaw; bots[n].entity.pitch = p.pitch } }
  await espera(7000)  // pedaços carregando
  // grava
  log(id, 'gravando')
  await um(`tick rate ${20 / LENTO}`)
  const bruto = path.join(SAIDA, id + '.bruto.mp4')
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'x11grab', '-video_size', `${LARG}x${ALT}`, '-framerate', String(30 / LENTO), '-i', DISPLAY, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '14', '-pix_fmt', 'yuv420p', bruto], { stdio: ['pipe', 'inherit', 'inherit'] })
  const w0 = Date.now()
  await espera(1200)
  const passo = 50 * LENTO, w1 = Date.now()
  um('function reenc:t0')
  let ig = 0
  for (let k = 0; k < nT; k++) {
    const t = ini + k * 0.05
    for (const n of NOMES) {
      const bot = bots[n], p = tr[n]?.[k]
      if (p && bot.entity) { bot.entity.position = new Vec3(p.x, p.y, p.z); bot.entity.yaw = p.yaw; bot.entity.pitch = p.pitch; bot.entity.onGround = p.chao }
    }
    while (ig < golpes.length && golpes[ig][0] <= k) bots[golpes[ig++][1]].swingArm?.('right')
    for (const m of mortes) if (m.quem === alvo && m.t <= t && !m.camera) { m.camera = true; setTimeout(() => um(`spectate ${alvo} Camera`), 1500 * LENTO) }
    const espere = w1 + (k + 1) * passo - Date.now()
    if (espere > 0) await espera(espere)
  }
  ff.stdin.write('q'); await new Promise(ok => ff.on('close', ok))
  await um('tick rate 20')
  // corta o começo (antes do t0) e acelera
  const corte = (w1 - w0) / 1000 + 1 * LENTO
  const saida = path.join(SAIDA, id + '.mp4')
  execSync(`ffmpeg -y -loglevel error -ss ${corte.toFixed(3)} -i "${bruto}" -t ${((t1 - t0) * LENTO).toFixed(3)} -vf "setpts=(PTS-STARTPTS)/${LENTO},fps=30" -an -c:v libx264 -preset faster -crf 16 -pix_fmt yuv420p "${saida}"`)
  fs.rmSync(bruto, { force: true })
  log(id, 'ok', saida)
}

let perspectiva = 0
fs.mkdirSync(SAIDA, { recursive: true })
const cenas = fs.readFileSync(LISTA, 'utf8').split('\n').filter(Boolean).map(l => { const [id, a, b, c] = l.trim().split(/\s+/); return { id, t0: +a, t1: +b, cam: c } })
await um('gamerule sendCommandFeedback false'); await um('gamemode spectator Camera')
const bots = await bonecos()
tecla('F1')
for (const c of cenas) {
  if (fs.existsSync(path.join(SAIDA, c.id + '.mp4'))) continue
  try { await filmar(bots, c.id, c.t0, c.t1, c.cam) } catch (e) { log(c.id, 'ERRO', e.stack) }
}
log('FIM')
process.exit(0)
