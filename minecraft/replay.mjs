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
const { chromium } = require('playwright')  // o Playwright do sistema (o import não acha, o require acha)
const express = require('express')
const { Server } = require('socket.io')
const { setupRoutes } = require('prismarine-viewer/lib/common')
const registro = require('prismarine-registry')('1.21.4')
const Chunk = require('prismarine-chunk')(registro)
const { Vec3 } = require('vec3')

const [DIR, SAIDA, T_INI, T_FIM, CAM = 'segue:Claude', FPS = '30', W = '960', H = '540'] = process.argv.slice(2)
const t0 = Number(T_INI), t1 = Number(T_FIM), fps = Number(FPS)
const lerJsonl = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : []

// ---- dados da gravação
// cada IA grava os próprios arquivos (posicoes_<nome>.jsonl...); a gravação antiga tinha um arquivo só
const arquivos = pre => fs.readdirSync(DIR).filter(f => f === pre + '.jsonl' || (f.startsWith(pre + '_') && f.endsWith('.jsonl'))).map(f => path.join(DIR, f))
const posicoes = {}  // nome -> [{t,x,y,z,yaw,pitch,...}]
for (const f of arquivos('posicoes')) for (const p of lerJsonl(f)) (posicoes[p.n] ??= []).push(p)
for (const l of Object.values(posicoes)) l.sort((a, b) => a.t - b.t)
const SEM_MODELO = new Set(['item', 'experience_orb', 'arrow', 'falling_block', 'tnt', 'egg', 'snowball', 'fishing_bobber'])  // o viewer não tem modelo bom pra estes
const mobsPorBot = arquivos('mobs').map(lerJsonl)  // por bot: [{t, l:[...]}]
const blocos = arquivos('blocos').flatMap(lerJsonl).sort((a, b) => a.t - b.t)
// cada pedaço pode ter várias versões (uma por sessão: x_z.json.gz, x_z_s1.json.gz...)
const porChunk = new Map()
for (const f of fs.readdirSync(path.join(DIR, 'chunks'))) {
  const [x, z, s] = f.replace('.json.gz', '').split('_')
  const k = `${x}_${z}`
  ;(porChunk.get(k) ?? porChunk.set(k, []).get(k)).push({ x: +x, z: +z, sessao: s ? +s.slice(1) : 0, arq: path.join(DIR, 'chunks', f) })
}
for (const l of porChunk.values()) l.sort((a, b) => a.sessao - b.sessao)

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
// cópia do mundo aqui no Node (os mesmos pedaços que vão pro viewer), pra câmera não entrar no chão:
// de dentro do bloco o viewer mostra o mundo vazado (as faces escondidas não são desenhadas)
const mundo = new Map()  // "x_z" -> coluna
function solido(x, y, z) {
  const col = mundo.get(`${Math.floor(x / 16)}_${Math.floor(z / 16)}`)
  if (!col) return false
  const id = col.getBlockStateId(new Vec3(((Math.floor(x) % 16) + 16) % 16, Math.floor(y), ((Math.floor(z) % 16) + 16) % 16))
  const b = registro.blocksByStateId[id]
  return !!b && b.boundingBox === 'block'
}
let distAnt = null, emPrimeira = false
// como o F5 do Minecraft: da cabeça até onde a câmera queria ficar; para antes do primeiro bloco sólido
function colidir(c, p) {
  if (!p || modo === 'olhos' || modo === 'fixa') return c
  const hx = p.x, hy = p.y + 1.5, hz = p.z
  const ex = c.pos.x, ey = c.pos.y + 1.62, ez = c.pos.z
  const L = Math.hypot(ex - hx, ey - hy, ez - hz)
  let livre = L
  for (let d = 0.3; d <= L; d += 0.1) {
    const k = d / L, x = hx + (ex - hx) * k, y = hy + (ey - hy) * k, z = hz + (ez - hz) * k
    if ([[0, 0, 0], [0.25, 0, 0], [-0.25, 0, 0], [0, 0.25, 0], [0, -0.25, 0], [0, 0, 0.25], [0, 0, -0.25]].some(([a, b, e]) => solido(x + a, y + b, z + e))) { livre = Math.max(0.6, d - 0.35); break }
  }
  // aproxima na hora (não entra no bloco nem 1 quadro), afasta devagar
  const alvo = livre
  const dd = distAnt === null || alvo < distAnt ? alvo : distAnt + (alvo - distAnt) * 0.12
  distAnt = dd
  // sem espaço atrás (túnel, mina): primeira pessoa, como nos vídeos de Minecraft
  emPrimeira = emPrimeira ? dd < 3.2 : dd < 2.2  // com folga, pra não ficar trocando
  if (emPrimeira) return { pos: { x: p.x, y: p.y, z: p.z }, yaw: p.yaw, pitch: p.pitch, primeira: true }
  const k = dd / L
  return { ...c, pos: { x: hx + (ex - hx) * k, y: hy + (ey - hy) * k - 1.62, z: hz + (ez - hz) * k } }
}
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
// cada IA com a própria skin: copia o modelo do "player" no pacote do viewer pra 6 entidades novas (ia_<nome>)
const NOMES_IA = ['DeepSeek', 'Qwen', 'Claude', 'GPT', 'GLM', 'MiMo']
function pacoteComSkins() {
  const js = fs.readFileSync(require.resolve('prismarine-viewer/public/index.js'), 'utf8')
  const ini = js.indexOf('"player":{"identifier":"minecraft:player"')
  if (ini < 0) return js
  let i = js.indexOf('{', ini), prof = 0
  for (; i < js.length; i++) { if (js[i] === '{') prof++; else if (js[i] === '}' && --prof === 0) break }
  const corpo = js.slice(js.indexOf('{', ini), i + 1)
  const extras = NOMES_IA.map(n => `"ia_${n}":` + corpo.replace('"textures":{"default":"textures/entity/steve"}', `"textures":{"default":"textures/entity/ia_${n}"}`)).join(',')
  // céu e neblina do Minecraft: esconde a borda do mundo gravado (os pedaços que nenhuma IA carregou)
  const NEB = (process.env.NEBLINA ?? '40,88').split(',')
  return (js.slice(0, i + 1) + ',' + extras + js.slice(i + 1))
    // o viewer só monta as seções de y 0 a 255 (mundo de antes da 1.18); na 1.21 o mundo vai de -64 a 319
    .replace('const u=new r(l);', 'const u=new r(l);window.__v=u;')
    .replaceAll('for(let i=0;i<256;i+=16)', 'for(let i=-64;i<320;i+=16)')
    .replace('this.scene.background=new n.Color("lightblue")', `this.scene.background=new n.Color("#a5c8ff"),this.scene.fog=new n.Fog("#a5c8ff",${NEB[0]},${NEB[1]})`)
}
const PACOTE = pacoteComSkins()
const app = express()
app.get('/index.js', (req, res) => res.type('application/javascript').send(PACOTE))
// no worker, as seções do pedaço começam em y=-64 (o índice é (y+64)/16, não y/16)
const WORKER = fs.readFileSync(require.resolve('prismarine-viewer/public/worker.js'), 'utf8')
  .replace('i.sections[Math.floor(a/16)]', 'i.sections[Math.floor((a+64)/16)]').replace('l.sections[Math.floor(n/16)]', 'l.sections[Math.floor((n+64)/16)]')
app.get('/worker.js', (req, res) => res.type('application/javascript').send(WORKER))
for (const n of NOMES_IA) app.get(`/textures/1.16.4/entity/ia_${n}.png`, (req, res) => res.sendFile(path.resolve('skins', n + '.png')))
setupRoutes(app, '')
const srv = http.createServer(app)
const io = new Server(srv)
let sock = null
const enviados = new Set()
let iBloco = 0
const vistosMob = new Map()

function mandarChunksPerto(t, c) {
  const cx = Math.floor(c.pos.x / 16), cz = Math.floor(c.pos.z / 16), R = Number(process.env.RAIO ?? 3)
  for (let x = cx - R; x <= cx + R; x++) for (let z = cz - R; z <= cz + R; z++) {
    const k = `${x}_${z}`
    const versoes = porChunk.get(k)
    if (!versoes || enviados.has(k)) continue
    let d = null
    for (const v of versoes) { const dv = JSON.parse(zlib.gunzipSync(fs.readFileSync(v.arq))); if (!d || dv.t <= t) d = dv }
    sock.emit('loadChunk', { x: x * 16, z: z * 16, chunk: d.col })
    enviados.add(k)
    const col = Chunk.fromJson(d.col)
    mundo.set(k, col)
    // blocos desse pedaço que mudaram depois que ele foi gravado e antes de agora
    for (const b of blocos) if (b.t >= d.t && b.t <= t && Math.floor(b.x / 16) === x && Math.floor(b.z / 16) === z) { sock.emit('blockUpdate', { pos: b, stateId: b.s }); muda(b) }
  }
}

function muda(b) {
  const col = mundo.get(`${Math.floor(b.x / 16)}_${Math.floor(b.z / 16)}`)
  if (col) col.setBlockStateId(new Vec3(((b.x % 16) + 16) % 16, b.y, ((b.z % 16) + 16) % 16), b.s)
}
function quadro(t) {
  const c0 = camera(t)
  mandarChunksPerto(t, c0)
  const c = colidir(c0, modo === 'fixa' ? null : interp(posicoes[arg], t))
  while (iBloco < blocos.length && blocos[iBloco].t <= t) {
    const b = blocos[iBloco++]
    if (enviados.has(`${Math.floor(b.x / 16)}_${Math.floor(b.z / 16)}`)) { sock.emit('blockUpdate', { pos: b, stateId: b.s }); muda(b) }
  }
  for (const [n, lista] of Object.entries(posicoes)) {
    if ((modo === 'olhos' || c.primeira) && n === arg) { if (c.primeira) sock.emit('entity', { id: 'p_' + n, delete: true }); continue }
    const p = interp(lista, t)
    if (p) sock.emit('entity', { id: 'p_' + n, name: NOMES_IA.includes(n) ? 'ia_' + n : 'player', username: n, pos: { x: p.x, y: p.y, z: p.z }, yaw: p.yaw })
  }
  // mobs: o registro mais recente antes de t
  // mobs: em cada bot, o registro mais recente antes de t (até 1 s atrás); junta tudo sem repetir
  const mobsAgora = new Map()
  for (const lista of mobsPorBot) {
    let lo = 0, hi = lista.length - 1, achou = -1
    while (lo <= hi) { const m = (lo + hi) >> 1; if (lista[m].t <= t) { achou = m; lo = m + 1 } else hi = m - 1 }
    if (achou >= 0 && t - lista[achou].t < 1) for (const m of lista[achou].l) if (!SEM_MODELO.has(m.m)) mobsAgora.set(m.id, m)
  }
  const agoraIds = new Set()
  for (const m of mobsAgora.values()) {
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

// GL=llvmpipe usa o Mesa do sistema (desenha em vários núcleos); o padrão é o SwiftShader do Chromium
const GL = process.env.GLARGS ? process.env.GLARGS.split(' ') : process.env.GL === 'llvmpipe' ? ['--use-gl=angle', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
const nav = await chromium.launch({ args: GL, ...(process.env.GL === 'llvmpipe' ? { env: { ...process.env, LIBGL_ALWAYS_SOFTWARE: '1', GALLIUM_DRIVER: 'llvmpipe', LP_NUM_THREADS: process.env.LP_NUM_THREADS ?? '4' } } : {}) })
const pag = await nav.newPage({ viewport: { width: Number(W), height: Number(H) } })
pag.on('console', m => { if (process.env.DEBUG_REPLAY) console.log('[pagina]', m.type(), m.text().slice(0, 200)) })
pag.on('pageerror', e => console.log('[pagina erro]', e.message.slice(0, 300)))
// o canvas guarda o último quadro desenhado: dá pra ler a imagem direto dele (a foto do navegador leva 2 s com WebGL no processador)
await pag.addInitScript(() => {
  const orig = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (tipo, op) { return orig.call(this, tipo, tipo.startsWith('webgl') ? { ...(op || {}), preserveDrawingBuffer: true } : op) }
})
await pag.goto(`http://127.0.0.1:${porta}/`)
if (process.env.DEBUG_REPLAY) console.log('[gl]', await pag.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); const e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER) }))
await pronto
// aquece: carrega os pedaços e deixa o viewer montar a malha antes de filmar
iBloco = blocos.findIndex(b => b.t > t0); if (iBloco < 0) iBloco = blocos.length
quadro(t0)
await pag.waitForTimeout(Number(process.env.AQUECE ?? 12000))

if (process.env.DEBUG_REPLAY) console.log('[malhas]', await pag.evaluate(() => { const w = window.__v.world; const ys = {}; for (const k of Object.keys(w.sectionMeshs)) { const y = k.split(',')[1]; ys[y] = (ys[y] ?? 0) + 1 } return JSON.stringify({chunks: Object.keys(w.loadedChunks).length, pend: w.sectionsOutstanding.size, ys}) }))
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', SAIDA], { stdio: ['pipe', 'inherit', 'inherit'] })
const n = Math.round((t1 - t0) * fps)
const inicio = Date.now()
for (let i = 0; i < n; i++) {
  const t = t0 + i / fps
  const a = Date.now()
  quadro(t)
  const b = Date.now()
  await pag.waitForTimeout(Number(process.env.ESPERA ?? 60))
  const c = Date.now()
  const b64 = await pag.evaluate(() => new Promise(ok => requestAnimationFrame(() => requestAnimationFrame(() => ok(document.querySelector('canvas').toDataURL('image/jpeg', 0.92).split(',')[1])))))
  ff.stdin.write(Buffer.from(b64, 'base64'))
  if (process.env.DEBUG_REPLAY) console.log('emitir', b - a, 'esperar', c - b, 'foto', Date.now() - c)
  if (i % 10 === 0) console.log(i + '/' + n, ((Date.now() - inicio) / (i + 1) / 1000).toFixed(2) + ' s/quadro')
}
ff.stdin.end()
await new Promise(ok => ff.on('close', ok))
await nav.close()
srv.close()
console.log(`\n${SAIDA}: ${n} quadros`)
process.exit(0)
