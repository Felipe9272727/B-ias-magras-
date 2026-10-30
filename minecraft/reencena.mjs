// Reencenação no Minecraft de verdade: o servidor vanilla 1.21.4 com o mundo do fim da partida volta cada cena ao
// estado daquele instante (blocos do log), seis bonecos (Mineflayer, um por IA) refazem os movimentos com a física do
// jogo (trajetoria.mjs), os mobs são recriados sem IA e movidos pelo log, e o cliente oficial ("Camera", espectador,
// com /spectate) filma a tela do Xvfb. O mundo roda LENTO vezes mais devagar (/tick rate) pra caber no FPS da máquina
// sem GPU; o ffmpeg grava a 30/LENTO quadros/s e depois acelera LENTO vezes -> 30 fps em tempo real.
// Uso: node reencena.mjs <gravação> <cenas.txt (id t0 t1 camera)> <pasta de saída>
// Precisa: servidor em localhost:25565 (RCON 25575, senha ias_local) e o cliente "Camera" já conectado no DISPLAY.
import fs from 'node:fs'
import path from 'node:path'
import { spawn, execSync, execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { rcon } from './rcon.mjs'
import { trajetoriasGravadas, mundoEm } from './trajetoria.mjs'
import * as anim from './extras/10_anim.mjs'
import { arquivosDoLog, cameraDaCena, diametroDaZona, mortesDaCena, jogadorVisivelEm } from './reencena_dados.mjs'

const require = createRequire(import.meta.url)
const mineflayer = require('mineflayer')
const registro = require('prismarine-registry')('1.21.4')
const Block = require('prismarine-block')(registro)
const { Vec3 } = require('vec3')

const [DIR, LISTA, SAIDA] = process.argv.slice(2)
const LENTO = Number(process.env.LENTO ?? 3)
const DISPLAY = process.env.DISPLAY ?? ':99'
const LARG = Number(process.env.LARG ?? 960), ALT = Number(process.env.ALT ?? 540)
const querPos = {}  // onde cada boneco deveria estar agora
const NOMES = ['DeepSeek', 'Qwen', 'Claude', 'GPT', 'GLM', 'MiMo']
const SEM_MOB = new Set(['item', 'experience_orb', 'arrow', 'falling_block', 'potion', 'lightning_bolt', 'tnt', 'egg', 'snowball', 'fishing_bobber'])
const RAIO_MOBS = 48, RAIO_BLOCOS = 96
const espera = ms => new Promise(ok => setTimeout(ok, ms))
const log = (...a) => console.log(`[${new Date().toTimeString().slice(0, 8)}]`, ...a)
const lerJsonl = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean) : []
const arquivos = pre => arquivosDoLog(DIR, pre)

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
    if (b[n].health <= 0) try { b[n].respawn() } catch {}
    let ultimaCorrecao = 0
    b[n].on('forcedMove', () => {
      const q = querPos[n]
      if (q && Date.now() - ultimaCorrecao > 1500 && b[n].entity.position.distanceTo(q) > 2) {
        ultimaCorrecao = Date.now()
        um(`tp ${n} ${q.x.toFixed(2)} ${q.y.toFixed(2)} ${q.z.toFixed(2)}`).catch(e => log('correção', n, e.message))
      }
    })
    b[n].on('death', () => setTimeout(() => { try { b[n].respawn() } catch {} }, 200))
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
  prep.push('weather clear', `time set ${horaDoDia(t0)}`, 'kill @e[type=!player]', 'effect give Camera night_vision infinite 0 true')
  // O backup contém a borda do fim da partida. Cada cena restaura a sua própria borda.
  prep.push('worldborder center 0 0', `worldborder set ${diametroDaZona(eventos, t0)}`, 'worldborder damage amount 0')
  // arena: caixa de vidro feita por comando (não está no log de blocos)
  if (ARENA) {
    const { x, y, z, r } = ARENA.arena
    if (t0 < ARENA.t) prep.push(`fill ${x - r} ${y - 1} ${z - r} ${x + r} ${y + 9} ${z + r} minecraft:air`)
    else prep.push(`fill ${x - r} ${y} ${z - r} ${x + r} ${y + 9} ${z + r} minecraft:glass hollow`, `fill ${x - r + 1} ${y} ${z - r + 1} ${x + r - 1} ${y} ${z + r - 1} minecraft:air`, `fill ${x - r} ${y - 1} ${z - r} ${x + r} ${y - 1} ${z + r} minecraft:smooth_stone`)
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
// Em túneis a câmera de terceira pessoa encosta na cabeça e ocupa toda a imagem.
// Escolhe a visão dos olhos quando isso ocorre em parte relevante da janela.
function obstrucaoDaCamera (trajeto, mundo) {
  let total = 0, presos = 0
  for (let k = 0; k < trajeto.length; k += 10) {
    const p = trajeto[k]; total++
    for (let d = 0.25; d <= 1.5; d += 0.25) {
      const b = mundo.getBlock(new Vec3(p.x + Math.sin(p.yaw) * Math.cos(p.pitch) * d,
        p.y + 1.62 - Math.sin(p.pitch) * d, p.z + Math.cos(p.yaw) * Math.cos(p.pitch) * d))
      if (b.boundingBox === 'block' && b.shapes?.length) { presos++; break }
    }
  }
  return presos / Math.max(1, total)
}

async function filmar (bots, id, t0, t1, cam) {
  let { modo, alvo, posicao: fixa } = cameraDaCena(cam)
  const ini = t0 - 1
  log(id, 'trajetórias...')
  const tr = trajetoriasGravadas(DIR, NOMES, ini, t1)
  let obstrucao = 0
  if (!fixa && modo !== 'olhos') {
    obstrucao = obstrucaoDaCamera(tr[alvo] ?? [], mundoEm(DIR, blocos, t0))
    if (obstrucao >= 0.25) { modo = 'olhos'; log(id, 'câmera nos olhos; obstrução:', Math.round(obstrucao * 100) + '%') }
  }
  if (fixa && ARENA && t1 >= ARENA.t) {
    const { x, y, z, r } = ARENA.arena
    fixa = { ...fixa, x: Math.max(x - r + 1, Math.min(x + r - 1, fixa.x)),
      y: Math.max(y + 2, Math.min(y + 8, fixa.y)), z: Math.max(z - r + 1, Math.min(z + r - 1, fixa.z)) }
  }
  const nativeState = process.env.NATIVE_SCENE
  const publishNative = startMillis => {
    if (!nativeState) return
    fs.mkdirSync(path.dirname(nativeState), {recursive:true})
    const temp = nativeState + '.tmp'
    fs.writeFileSync(temp, JSON.stringify({id, mode:modo, slow:LENTO, startMillis, tracks:tr}))
    fs.renameSync(temp,nativeState)
  }
  publishNative(0)
  log(id, 'mundo...')
  const psAlvo = posicoes[alvo] ?? []
  const pAlvo = fixa ?? tr[alvo]?.[0] ?? psAlvo[Math.max(0, ultimoAte(psAlvo, t0))]
  if (!pAlvo) throw new Error(`Sem posição gravada para a câmera ${cam} na cena ${id}`)
  const prep = [], nT = Math.round((t1 - ini) / 0.05) + 1, ticks = Array.from({ length: nT }, () => [])
  const nb = prepararMundo(ini, pAlvo, prep)
  log(id, 'blocos voltados:', nb)
  // bonecos: lugar, mão, armadura; quem não aparece na cena fica invisível
  const vestido = {}, visivel = {}
  for (const n of NOMES) {
    visivel[n] = jogadorVisivelEm(posicoes, eventos, n, ini)
    prep.push(`gamemode ${visivel[n] ? 'adventure' : 'spectator'} ${n}`, `effect give ${n} regeneration infinite 255 true`, `effect give ${n} saturation infinite 255 true`, `effect give ${n} night_vision infinite 0 true`)
    const p = tr[n]?.[0]
    // quem morrer ou renascer volta pro lugar da cena (o ponto de nascimento do mundo é dentro do chão)
    if (p) prep.push(`spawnpoint ${n} ${Math.floor(p.x)} ${Math.floor(p.y)} ${Math.floor(p.z)}`, `effect clear ${n} invisibility`, `tp ${n} ${p.x} ${p.y} ${p.z} ${yawMC(p.yaw)} ${pitchMC(p.pitch)}`)
    else prep.push(`spawnpoint ${n} ${Math.floor(pAlvo.x)} ${Math.floor(pAlvo.y) + 60} ${Math.floor(pAlvo.z)}`, `effect give ${n} invisibility infinite 0 true`, `tp ${n} ${pAlvo.x} ${pAlvo.y + 60} ${pAlvo.z}`)
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
  const antes = {}, golpes = [], mortes = mortesDaCena(eventos, NOMES, ini, t1)
  for (let k = 0; k < nT; k++) {
    const t = ini + k * 0.05, l = ticks[k]
    // A borda usa relógio de parede no vanilla; aplicar por tick mantém a sincronia com LENTO.
    if (k % 4 === 0) l.push(`worldborder set ${diametroDaZona(eventos, t)}`)
    while (iB < blocos.length && blocos[iB].t <= t) {
      const b = blocos[iB++]
      if (Math.abs(b.x - pAlvo.x) < RAIO_BLOCOS && Math.abs(b.z - pAlvo.z) < RAIO_BLOCOS) { l.push(`setblock ${b.x} ${b.y} ${b.z} ${estadoTexto(b.s)}`); mudadosPorNos.set(`${b.x},${b.y},${b.z}`, b.s) }
    }
    for (const m of mortes) if (m.t <= t && !m.feito) { m.feito = true; l.push(`kill ${m.quem}`) }
    const q = anim.noQuadro(t).anim
    for (const n of NOMES) {
      const agoraVisivel = jogadorVisivelEm(posicoes, eventos, n, t)
      if (agoraVisivel !== visivel[n]) { visivel[n] = agoraVisivel; l.push(`gamemode ${agoraVisivel ? 'adventure' : 'spectator'} ${n}`) }
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
  for (const n of NOMES) {
    const p = tr[n]?.[0]; if (!p) continue
    querPos[n] = new Vec3(p.x, p.y, p.z)
    for (let i = 0; i < 4; i++) {
      await um(`tp ${n} ${p.x} ${p.y} ${p.z} ${yawMC(p.yaw)} ${pitchMC(p.pitch)}`); await espera(400)
      const r = await um(`data get entity ${n} Pos`); const m = /\[([-\d.]+)d, ([-\d.]+)d, ([-\d.]+)d\]/.exec(r)
      if (m && Math.hypot(+m[1] - p.x, +m[2] - p.y, +m[3] - p.z) < 2) break
      log(id, 'boneco fora do lugar:', n, r.slice(0, 80))
      try { bots[n].respawn() } catch {}
      await espera(800)
    }
    if (bots[n].entity) { bots[n].entity.position = new Vec3(p.x, p.y, p.z); bots[n].entity.yaw = p.yaw; bots[n].entity.pitch = p.pitch }
  }
  // câmera
  await um('gamemode spectator Camera')
  await um(`tp Camera ${pAlvo.x} ${pAlvo.y + 1.6} ${pAlvo.z}`)
  await espera(1500)
  if (fixa) {
    await um('execute as Camera run spectate')
    await um(`tp Camera ${fixa.x} ${fixa.y} ${fixa.z} ${yawMC(fixa.yaw)} ${pitchMC(fixa.pitch)}`)
  } else await um(`spectate ${alvo} Camera`)
  const quer = modo === 'olhos' || fixa ? 0 : 1
  for (let i = 0; i < ((quer - perspectiva) % 3 + 3) % 3; i++) { tecla('F5'); await espera(150) }
  perspectiva = quer
  await espera(7000)  // pedaços carregando
  if (fixa) log(id, 'câmera fixa:', (await um('data get entity Camera Pos')).slice(-80))
  else log(id, 'spectate:', await um(`spectate ${alvo} Camera`), '| câmera:', (await um('data get entity Camera Pos')).slice(-40), '| alvo:', (await um(`data get entity ${alvo} Pos`)).slice(-40))
  // grava
  log(id, 'gravando')
  await um(`tick rate ${20 / LENTO}`)
  const bruto = path.join(SAIDA, id + '.bruto.mp4')
  const ff = process.env.FRAMEBUFFER
    ? spawn('python', [new URL('./captura_xvfb.py', import.meta.url).pathname, process.env.FRAMEBUFFER, String(30 / LENTO), String((t1 - ini) * LENTO + 4), bruto], { stdio: ['pipe', 'inherit', 'inherit'] })
    : spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'x11grab', '-draw_mouse', '0', '-video_size', `${LARG}x${ALT}`, '-framerate', String(30 / LENTO), '-i', DISPLAY, '-t', String((t1 - ini) * LENTO + 4), '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '14', '-pix_fmt', 'yuv420p', bruto], { stdio: ['pipe', 'inherit', 'inherit'] })
  const fimFF = new Promise((ok, erro) => { ff.once('error', erro); ff.once('close', code => ok(code)) })
  ff.stdin.on('error', e => log('entrada ffmpeg:', e.message))
  const w0 = Date.now()
  await espera(1200)
  const passo = 50 * LENTO, w1 = Date.now()
  publishNative(w1)
  um('function reenc:t0')
  let ig = 0
  for (let k = 0; k < nT; k++) {
    const t = ini + k * 0.05
    for (const n of NOMES) {
      const bot = bots[n], p = tr[n]?.[k]
      if (p) querPos[n] = new Vec3(p.x, p.y, p.z)
      if (p && bot.entity) { bot.entity.position = new Vec3(p.x, p.y, p.z); bot.entity.yaw = p.yaw; bot.entity.pitch = p.pitch; bot.entity.onGround = p.chao }
    }
    while (ig < golpes.length && golpes[ig][0] <= k) bots[golpes[ig++][1]].swingArm?.('right')
    for (const m of mortes) if (m.quem === alvo && m.t <= t && !m.camera) {
      m.camera = true
      if (m.fase !== 'arena') setTimeout(() => um(`spectate ${alvo} Camera`).catch(e => log('câmera após morte:', e.message)), 1500 * LENTO)
    }
    const espere = w1 + (k + 1) * passo - Date.now()
    if (espere > 0) await espera(espere)
  }
  if (ff.exitCode === null) ff.stdin.write('q')
  const limiteFF = setTimeout(() => ff.kill('SIGTERM'), 8000)
  const limiteFinalFF = setTimeout(() => ff.kill('SIGKILL'), 12000)
  const codeFF = await fimFF
  clearTimeout(limiteFF); clearTimeout(limiteFinalFF)
  if (codeFF !== 0) throw new Error(`Captura ffmpeg encerrou com ${codeFF}`)
  await um('tick rate 20')
  // corta o começo (antes do t0) e acelera
  const corte = (w1 - w0) / 1000 + 1 * LENTO
  const saida = path.join(SAIDA, id + '.mp4')
  execSync(`ffmpeg -y -loglevel error -ss ${corte.toFixed(3)} -i "${bruto}" -t ${(t1 - t0).toFixed(3)} -vf "setpts=(PTS-STARTPTS)/${LENTO},fps=30" -an -c:v libx264 -preset faster -crf 16 -pix_fmt yuv420p -movflags +faststart "${saida}"`)
  const fd = fs.openSync(saida, 'r+'); fs.fsyncSync(fd); fs.closeSync(fd)
  const verificado = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-show_entries', 'format=duration:stream=nb_read_frames', '-of', 'json', saida], {encoding: 'utf8'}))
  if (Math.abs(+verificado.format.duration - (t1 - t0)) > 0.08 || +verificado.streams[0].nb_read_frames !== Math.round(+verificado.format.duration * 30)) throw new Error(`Arquivo incompleto: ${saida}`)
  if (!process.env.GUARDAR_BRUTO) fs.rmSync(bruto, { force: true })
  fs.writeFileSync(path.join(SAIDA, id + '.captura.json'), JSON.stringify({ id, t0, t1, cameraPedida: cam, modo, fixa, obstrucao, lento: LENTO, corte, bytes: fs.statSync(saida).size, resolucao: [LARG, ALT] }, null, 2))
  log(id, 'ok', saida)
}

let perspectiva = 0
fs.mkdirSync(SAIDA, { recursive: true })
const cenas = fs.readFileSync(LISTA, 'utf8').split('\n').filter(Boolean).map(l => { const [id, a, b, c] = l.trim().split(/\s+/); return { id, t0: +a, t1: +b, cam: c } })
await um('gamerule sendCommandFeedback false'); await um('gamemode spectator Camera')
const bots = await bonecos()
tecla('F1')
let falhas = 0
for (const c of cenas) {
  if (fs.existsSync(path.join(SAIDA, c.id + '.mp4'))) continue
  try { await filmar(bots, c.id, c.t0, c.t1, c.cam) } catch (e) { falhas++; log(c.id, 'ERRO', e.stack) }
}
// deixa o cliente em primeira pessoa pra próxima execução
for (let i = 0; i < (3 - perspectiva) % 3; i++) { tecla('F5'); await espera(150) }
tecla('F1')
log('FIM')
process.exit(falhas ? 1 : 0)
