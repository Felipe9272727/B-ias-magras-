// Replay 3D de uma gravação: monta o mundo (pedaços salvos + blocos que mudaram), põe os jogadores e mobs nas
// posições gravadas e filma com uma câmera nossa, quadro a quadro, no prismarine-viewer (texturas oficiais) dentro
// do Chromium sem tela. Uso:
//   node replay.mjs <gravação> <saida.mp4> <t_inicio> <t_fim> <câmera> [fps=30] [largura=960] [altura=540]
// câmera: "segue:Claude" (atrás e acima), "olhos:Claude" (o que ele vê), "orbita:Claude" (gira em volta),
//         "fixa:x,y,z,yaw,pitch"
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
console.error('[linha 14]')
const { chromium } = require('playwright')  // o Playwright do sistema (o import não acha, o require acha)
const express = require('express')
console.error('[linha 16]')
const { Server } = require('socket.io')
const { setupRoutes } = require('prismarine-viewer/lib/common')

const [DIR, SAIDA, T_INI, T_FIM, CAM = 'segue:Claude', FPS = '30', W = '960', H = '540'] = process.argv.slice(2)
console.error('[linha 20]')
const t0 = Number(T_INI), t1 = Number(T_FIM), fps = Number(FPS)
console.error('[linha 21]')
const lerJsonl = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : []

// ---- dados da gravação
const posicoes = {}  // nome -> [{t,x,y,z,yaw,pitch,...}]
for (const p of lerJsonl(path.join(DIR, 'posicoes.jsonl'))) (posicoes[p.n] ??= []).push(p)
console.error('[linha 26]')
const mobs = lerJsonl(path.join(DIR, 'mobs.jsonl'))
console.error('[linha 27]')
const blocos = lerJsonl(path.join(DIR, 'blocos.jsonl'))
console.error('[linha 28]')
const chunks = fs.readdirSync(path.join(DIR, 'chunks')).map(f => {
  const [x, z] = f.replace('.json.gz', '').split('_').map(Number)
  return { x, z, arq: path.join(DIR, 'chunks', f) }
})
const porChunk = new Map(chunks.map(c => [`${c.x}_${c.z}`, c]))

function interp(lista, t) {  // posição interpolada no instante t
  if (!lista?.length) return null
  let lo = 0, hi = lista.length - 1
  if (t <= lista[0].t) return lista[0]
  if (t >= lista[hi].t) return lista[hi]
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (lista[m].t <= t) lo = m; else hi = m }
  const a = lista[lo], b = lista[hi], k = (t - a.t) / Math.max(1e-6, b.t - a.t)
  let dy = b.yaw - a.yaw
  while (dy > Math.PI) dy -= 2 * Math.PI
  while (dy < -Math.PI) dy += 2 * Math.PI
  return { ...a, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k, yaw: a.yaw + dy * k, pitch: a.pitch + (b.pitch - a.pitch) * k }
}

// ---- câmera
const [modo, arg] = CAM.split(':')
console.error('[linha 49]')
function camera(t) {
  if (modo === 'fixa') { const [x, y, z, yaw, pitch] = arg.split(',').map(Number); return { pos: { x, y, z }, yaw, pitch } }
  const p = interp(posicoes[arg], t)
  if (!p) return { pos: { x: 0, y: 100, z: 0 }, yaw: 0, pitch: -0.5 }
  if (modo === 'olhos') return { pos: { x: p.x, y: p.y, z: p.z }, yaw: p.yaw, pitch: p.pitch }
  // yaw do Minecraft: olhar pra -z quando yaw=0; a câmera fica atrás (oposto do olhar), um pouco acima
  const ang = modo === 'orbita' ? (t - t0) * 0.35 : p.yaw
  const dist = 5.5, alt = 2.6
  const cx = p.x + Math.sin(ang) * dist, cz = p.z + Math.cos(ang) * dist
  const dx = p.x - cx, dz = p.z - cz, dyv = (p.y + 1.2) - (p.y + alt)
  return { pos: { x: cx, y: p.y + alt - 1.62, z: cz }, yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dyv, Math.hypot(dx, dz)) }
}

// ---- servidor no mesmo protocolo do prismarine-viewer
const app = express()
console.error('[linha 64]')
setupRoutes(app, '')
console.error('[linha 65]')
const srv = http.createServer(app)
console.error('[linha 66]')
const io = new Server(srv)
console.error('[linha 67]')
let sock = null
const enviados = new Set()
console.error('[linha 69]')
let iBloco = 0
const vistosMob = new Map()
console.error('[linha 71]')

function mandarChunksPerto(t, c) {
  const cx = Math.floor(c.pos.x / 16), cz = Math.floor(c.pos.z / 16), R = 5
  for (let x = cx - R; x <= cx + R; x++) for (let z = cz - R; z <= cz + R; z++) {
    const k = `${x}_${z}`
    const ch = porChunk.get(k)
    if (!ch || enviados.has(k)) continue
    const d = JSON.parse(zlib.gunzipSync(fs.readFileSync(ch.arq)))
    sock.emit('loadChunk', { x: x * 16, z: z * 16, chunk: d.col })
    enviados.add(k)
    // blocos desse pedaço que mudaram depois que ele foi gravado e antes de agora
    for (const b of blocos) if (b.t >= d.t && b.t <= t && Math.floor(b.x / 16) === x && Math.floor(b.z / 16) === z) sock.emit('blockUpdate', { pos: b, stateId: b.s })
  }
}

function quadro(t) {
  const c = camera(t)
  mandarChunksPerto(t, c)
  while (iBloco < blocos.length && blocos[iBloco].t <= t) {
    const b = blocos[iBloco++]
    if (enviados.has(`${Math.floor(b.x / 16)}_${Math.floor(b.z / 16)}`)) sock.emit('blockUpdate', { pos: b, stateId: b.s })
  }
  for (const [n, lista] of Object.entries(posicoes)) {
    if (modo === 'olhos' && n === arg) continue
    const p = interp(lista, t)
    if (p) sock.emit('entity', { id: 'p_' + n, name: 'player', username: n, pos: { x: p.x, y: p.y, z: p.z }, yaw: p.yaw })
  }
  // mobs: o registro mais recente antes de t
  let reg = null
  for (let i = mobs.length - 1; i >= 0; i--) if (mobs[i].t <= t) { reg = mobs[i]; break }
  const agoraIds = new Set()
  for (const m of reg?.l ?? []) {
    agoraIds.add(m.id)
    sock.emit('entity', { id: 'm_' + m.id, name: m.m, pos: { x: m.x, y: m.y, z: m.z }, yaw: m.yaw })
    vistosMob.set(m.id, t)
  }
  for (const [id] of vistosMob) if (!agoraIds.has(id)) { sock.emit('entity', { id: 'm_' + id, delete: true }); vistosMob.delete(id) }
  sock.emit('position', { pos: c.pos, yaw: c.yaw, pitch: c.pitch })
}

const pronto = new Promise(ok => io.on('connection', s => { sock = s; s.emit('version', '1.21.4'); ok() }))
await new Promise(ok => srv.listen(0, '127.0.0.1', ok))
const porta = srv.address().port

const nav = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const pag = await nav.newPage({ viewport: { width: Number(W), height: Number(H) } })
pag.on('console', m => { if (process.env.DEBUG_REPLAY) console.log('[pagina]', m.type(), m.text().slice(0, 200)) })
pag.on('pageerror', e => console.log('[pagina erro]', e.message.slice(0, 300)))
await pag.goto(`http://127.0.0.1:${porta}/`)
await pronto
// aquece: carrega os pedaços e deixa o viewer montar a malha antes de filmar
iBloco = blocos.findIndex(b => b.t > t0); if (iBloco < 0) iBloco = blocos.length
quadro(t0)
console.error('[linha 124]')
await pag.waitForTimeout(12000)

const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', SAIDA], { stdio: ['pipe', 'inherit', 'inherit'] })
console.error('[linha 127]')
const n = Math.round((t1 - t0) * fps)
console.error('[linha 128]')
for (let i = 0; i < n; i++) {
  const t = t0 + i / fps
  quadro(t)
  await pag.waitForTimeout(60)
  ff.stdin.write(await pag.screenshot({ type: 'jpeg', quality: 90 }))
  if (i % 60 === 0) process.stdout.write(`\r${i}/${n}`)
}
ff.stdin.end()
console.error('[linha 136]')
await new Promise(ok => ff.on('close', ok))
await nav.close()
srv.close()
console.error('[linha 139]')
console.log(`\n${SAIDA}: ${n} quadros`)
console.error('[linha 140]')
process.exit(0)
console.error('[linha 141]')
