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

// ---- extras (animações, itens, blocos quebrando...): cada recurso tem um módulo no Node (extras/*.mjs: prepara os
// dados da gravação e diz o que muda em cada quadro) e um script na página (pagina/*.js: aplica no 3D). Ver extras/README.md
const PASTA = path.dirname(new URL(import.meta.url).pathname)
const NOMES_IA = ['DeepSeek', 'Qwen', 'Claude', 'GPT', 'GLM', 'MiMo']
const ZUMBIS = { zombie: 'zombie', drowned: 'drowned', husk: 'husk' }  // mob -> textura (entity/zombie/<x>.png)
const eventosTodos = arquivos('eventos').flatMap(lerJsonl).sort((a, b) => a.t - b.t)
// a caixa da arena foi montada por comando do servidor (partida.mjs > arena(): piso de smooth_stone em y-1, paredes
// e teto de vidro de y a y+9, raio r) e não aparece nos blocos gravados: recria aqui no instante do evento 'arena'
for (const ev of eventosTodos.filter(e => e.tipo === 'arena' && e.arena)) {
  const { x, y, z, r } = ev.arena, tt = ev.t + 0.1
  const pedra = registro.blocksByName.smooth_stone.defaultState, vidro = registro.blocksByName.glass.defaultState
  const novos = []
  for (let a = x - r; a <= x + r; a++) for (let b = z - r; b <= z + r; b++) {
    novos.push({ t: tt, x: a, y: y - 1, z: b, s: pedra, b: 'smooth_stone' }, { t: tt, x: a, y: y + 9, z: b, s: vidro, b: 'glass' })
    if (a === x - r || a === x + r || b === z - r || b === z + r) for (let h = y; h <= y + 8; h++) novos.push({ t: tt, x: a, y: h, z: b, s: vidro, b: 'glass' })
  }
  blocos.push(...novos)
  blocos.sort((p, q) => p.t - q.t)
}
const EXTRAS = []
for (const f of fs.readdirSync(path.join(PASTA, 'extras')).filter(f => f.endsWith('.mjs')).sort()) EXTRAS.push({ nome: f, m: await import(path.join(PASTA, 'extras', f)) })

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

for (const e of EXTRAS) await e.m.preparar?.({ DIR, posicoes, blocos, mobsPorBot, eventos: eventosTodos, interp, registro, NOMES_IA, t0, t1 })

// ---- câmera
let [modo, arg] = CAM.split(':')
// cópia do mundo aqui no Node (os mesmos pedaços que vão pro viewer), pra câmera não entrar no chão:
// de dentro do bloco o viewer mostra o mundo vazado (as faces escondidas não são desenhadas)
const mundo = new Map()  // "x_z" -> coluna
function solido(x, y, z, folha = false) {
  const col = mundo.get(`${Math.floor(x / 16)}_${Math.floor(z / 16)}`)
  if (!col) return false
  const id = col.getBlockStateId(new Vec3(((Math.floor(x) % 16) + 16) % 16, Math.floor(y), ((Math.floor(z) % 16) + 16) % 16))
  const b = registro.blocksByStateId[id]
  return !!b && b.boundingBox === 'block' && (folha || !b.name.endsWith('leaves'))
}
let distAnt = null, ultimaCam = null
// como o F5 do Minecraft: da cabeça até onde a câmera queria ficar; para antes do primeiro bloco sólido
function colidir(c, p) {
  if (!p || modo === 'olhos' || modo === 'fixa') return c
  const hx = p.x, hy = p.y + 1.5, hz = p.z
  const ex = c.pos.x, ey = c.pos.y + 1.62, ez = c.pos.z
  const L = Math.hypot(ex - hx, ey - hy, ez - hz)
  let livre = L
  for (let d = 0.3; d <= L; d += 0.1) {
    const k = d / L, x = hx + (ex - hx) * k, y = hy + (ey - hy) * k, z = hz + (ez - hz) * k
    if ([[0, 0, 0], [0.25, 0, 0], [-0.25, 0, 0], [0, 0.25, 0], [0, -0.25, 0], [0, 0, 0.25], [0, 0, -0.25]].some(([a, b, e]) => solido(x + a, y + b, z + e))) { livre = Math.max(1.0, d - 0.35); break }
  }
  // aproxima na hora (não entra no bloco nem 1 quadro), afasta devagar
  const alvo = livre
  const dd = distAnt === null || alvo < distAnt ? alvo : distAnt + (alvo - distAnt) * 0.12
  distAnt = dd
  // sem espaço atrás (túnel, mina): a câmera só chega mais perto, como o F5 do jogo (nunca pula pra primeira pessoa)
  const k = dd / L
  return { ...c, pos: { x: hx + (ex - hx) * k, y: hy + (ey - hy) * k - 1.62, z: hz + (ez - hz) * k } }
}
// posição de um jogador no instante t, com os ajustes dos extras (ajustarJogador pode trocar a posição ou esconder: null)
function posJogador(n, t) {
  let p = interp(posicoes[n], t)
  for (const e of EXTRAS) if (p && e.m.ajustarJogador) p = e.m.ajustarJogador(n, t, p)
  return p
}
let camAnterior = null, angCam = null
// distância livre da cabeça até a câmera no ângulo ang (mesmo teste do colidir; com folha=true as folhas também tampam)
const VIZ = [[0, 0, 0], [0.25, 0, 0], [-0.25, 0, 0], [0, 0.25, 0], [0, -0.25, 0], [0, 0, 0.25], [0, 0, -0.25]]
function livreEm(p, ang, dist, alt, folha) {
  const hx = p.x, hy = p.y + 1.5, hz = p.z
  const ex = p.x + Math.sin(ang) * dist, ey = p.y + alt, ez = p.z + Math.cos(ang) * dist
  const L = Math.hypot(ex - hx, ey - hy, ez - hz)
  for (let d = 0.3; d <= L; d += 0.2) {
    const k = d / L, x = hx + (ex - hx) * k, y = hy + (ey - hy) * k, z = hz + (ez - hz) * k
    if (VIZ.some(([a, b, e]) => solido(x + a, y + b, z + e, folha))) return d
  }
  return L
}
function camera(t) {
  if (modo === 'fixa') { const [x, y, z, yaw, pitch] = arg.split(',').map(Number); return { pos: { x, y, z }, yaw, pitch } }
  const p = posJogador(arg, t)
  // a IA seguida está escondida (morreu e ainda não renasceu): a câmera fica onde estava
  if (!p) return camAnterior ?? { pos: { x: 0, y: 100, z: 0 }, yaw: 0, pitch: -0.5 }
  if (modo === 'olhos') return { pos: { x: p.x, y: p.y, z: p.z }, yaw: p.yaw, pitch: p.pitch }
  // yaw do Minecraft: olhar pra -z quando yaw=0; a câmera fica atrás (oposto do olhar), um pouco acima
  // na altura dos olhos (no meio da floresta a vista limpa é entre os troncos, debaixo das copas)
  const dist = 4.8, alt = 2.0
  // ângulo que a câmera queria (órbita girando ou atrás do olhar); se ele está tampado, a câmera vai pro ângulo livre
  // mais perto de onde já está (primeiro sem folha na frente, depois só sem bloco) e gira suave, em vez de colar no tronco
  const quer = modo === 'orbita' ? (t - t0) * 0.35 : p.yaw
  if (angCam === null) angCam = quer
  const dif = a => Math.atan2(Math.sin(a), Math.cos(a))
  const ok = (a, folha) => livreEm(p, a, dist, alt, folha) >= dist - 0.4
  let alvo = null
  for (const folha of [true, false]) {
    if (ok(quer, folha)) { alvo = quer; break }
    if (ok(angCam, folha)) { alvo = angCam; break }
    for (let k = 1; k <= 16 && alvo === null; k++) alvo = [angCam + k * 0.2, angCam - k * 0.2].find(x => ok(x, folha)) ?? null
    if (alvo !== null) break
  }
  if (alvo === null) alvo = quer
  angCam += Math.max(-0.1, Math.min(0.1, dif(alvo - angCam)))
  const ang = angCam
  const cx = p.x + Math.sin(ang) * dist, cz = p.z + Math.cos(ang) * dist
  const dx = p.x - cx, dz = p.z - cz, dyv = (p.y + 1.2) - (p.y + alt)
  return { pos: { x: cx, y: p.y + alt - 1.62, z: cz }, yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dyv, Math.hypot(dx, dz)) }
}

// ---- servidor no mesmo protocolo do prismarine-viewer
// cada IA com a própria skin: copia o modelo do "player" no pacote do viewer pra 6 entidades novas (ia_<nome>)
function pacoteComSkins() {
  const js = fs.readFileSync(require.resolve('prismarine-viewer/public/index.js'), 'utf8')
  const ini = js.indexOf('"player":{"identifier":"minecraft:player"')
  if (ini < 0) return js
  let i = js.indexOf('{', ini), prof = 0
  for (; i < js.length; i++) { if (js[i] === '{') prof++; else if (js[i] === '}' && --prof === 0) break }
  const corpo = js.slice(js.indexOf('{', ini), i + 1)
  const extras = NOMES_IA.map(n => `"ia_${n}":` + corpo.replace('"textures":{"default":"textures/entity/steve"}', `"textures":{"default":"textures/entity/ia_${n}"}`))
    // zumbis: o modelo do viewer sai torto; no jogo eles usam o mesmo corpo do jogador, então: corpo de jogador + textura deles
    .concat(Object.entries(ZUMBIS).map(([m, tex]) => `"mc_${m}":` + corpo.replace('"textures":{"default":"textures/entity/steve"}', `"textures":{"default":"textures/entity/zombie/${tex}"}`)))
    .join(',')
  // céu e neblina do Minecraft: esconde a borda do mundo gravado (os pedaços que nenhuma IA carregou)
  const NEB = (process.env.NEBLINA ?? '40,88').split(',')
  return (js.slice(0, i + 1) + ',' + extras + js.slice(i + 1))
    // o viewer só monta as seções de y 0 a 255 (mundo de antes da 1.18); na 1.21 o mundo vai de -64 a 319
    .replace('const u=new r(l);', 'const u=new r(l);window.__v=u;')
    // alguns blocos das cavernas novas (1.18+) saem com vértice NaN: a esfera de recorte da seção vira NaN e o three.js
    // deixa de desenhar a seção inteira (o "mundo vazado" debaixo da terra). Cada seção ganha uma esfera fixa e certa.
    .replace('r.setIndex(t.geometry.indices),e=new n.Mesh(r,this.material)', 'r.setIndex(t.geometry.indices),r.boundingSphere=new n.Sphere(new n.Vector3(0,0,0),16),e=new n.Mesh(r,this.material)')
    .replace('WorldRenderer:class{constructor(t,e=4){', `WorldRenderer:class{constructor(t,e=${Number(process.env.TRABALHADORES ?? 4)}){`)
    // desenha só quando a gente pede (o laço normal desenhava a cena várias vezes por quadro) e sem a animação de 50 ms
    // nas posições: cada quadro mostra exatamente a posição gravada
    .replace('!function t(){window.requestAnimationFrame(t),h&&h.update(),u.update(),l.render(u.scene,u.camera)}()', 'window.__r=function(){h&&h.update(),u.update(),l.render(u.scene,u.camera),window.__depois&&window.__depois(l)};!function t(){window.requestAnimationFrame(t),window.__manual||window.__r()}()')
    .replaceAll('},50).start()', '},0).start()')
    .replaceAll('for(let i=0;i<256;i+=16)', 'for(let i=-64;i<320;i+=16)')
    .replace('this.scene.background=new n.Color("lightblue")', `this.scene.background=new n.Color("#a5c8ff"),this.scene.fog=new n.Fog("#a5c8ff",${NEB[0]},${NEB[1]})`)
}
const PACOTE = pacoteComSkins()
const app = express()
app.get('/index.js', (req, res) => res.type('application/javascript').send(PACOTE))
// no worker, as seções do pedaço começam em y=-64 (o índice é (y+64)/16, não y/16)
const WORKER = fs.readFileSync(require.resolve('prismarine-viewer/public/worker.js'), 'utf8')
  .replace('i.sections[Math.floor(a/16)]', 'i.sections[Math.floor((a+64)/16)]').replace('l.sections[Math.floor(n/16)]', 'l.sections[Math.floor((n+64)/16)]')
  .replace('else"reset"===e.type&&(world=null,blocksStates=null)}', 'else if("contar"===e.type)postMessage({type:"contagem",n:world?Object.keys(world.columns).length:-1,bs:!!blocksStates,dirty:Object.keys(dirtySections).length});else"reset"===e.type&&(world=null,blocksStates=null)}')
  // o fundo do mundo era y=0 antes da 1.18: o viewer pulava toda face com vizinho abaixo de 0 (some a ardósia inteira)
  .replace('if(g.position.y<0)continue;', 'if(g.position.y<-64)continue;').replace('if(n.position.y<0)continue}', 'if(n.position.y<-64)continue}')
  // erro ao montar uma seção (bloco sem modelo etc.): antes matava o resto da fila; agora avisa e segue
  .replace('const l=getSectionGeometry(e,n,a,world,blocksStates),i=[l.positions.buffer,l.normals.buffer,l.colors.buffer,l.uvs.buffer];postMessage({type:"geometry",key:t,geometry:l},i)', 'let l;try{l=getSectionGeometry(e,n,a,world,blocksStates)}catch(x){postMessage({type:"erroSecao",key:t,msg:String(x&&x.stack||x).slice(0,300)})}if(l){const i=[l.positions.buffer,l.normals.buffer,l.colors.buffer,l.uvs.buffer];postMessage({type:"geometry",key:t,geometry:l},i)}')
app.get('/worker.js', (req, res) => res.type('application/javascript').send(WORKER))
for (const n of NOMES_IA) app.get(`/textures/1.16.4/entity/ia_${n}.png`, (req, res) => res.sendFile(path.resolve('skins', n + '.png')))
app.use('/tex', express.static(path.join(PASTA, 'texturas_oficiais', 'assets', 'minecraft', 'textures')))
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
  const pj = modo === 'fixa' ? null : posJogador(arg, t)
  const c = pj || modo === 'fixa' ? colidir(c0, pj) : c0
  camAnterior = { ...c, primeira: false }
  ultimaCam = { ...c, pos: { x: +c.pos.x.toFixed(2), y: +c.pos.y.toFixed(2), z: +c.pos.z.toFixed(2) }, dist: distAnt && +distAnt.toFixed(2) }
  while (iBloco < blocos.length && blocos[iBloco].t <= t) {
    const b = blocos[iBloco++]
    if (enviados.has(`${Math.floor(b.x / 16)}_${Math.floor(b.z / 16)}`)) { sock.emit('blockUpdate', { pos: b, stateId: b.s }); muda(b) }
  }
  for (const [n, lista] of Object.entries(posicoes)) {
    if ((modo === 'olhos' || c.primeira) && n === arg) { if (c.primeira) sock.emit('entity', { id: 'p_' + n, delete: true }); continue }
    const p = posJogador(n, t)
    if (p) sock.emit('entity', { id: 'p_' + n, name: NOMES_IA.includes(n) ? 'ia_' + n : 'player', username: n, pos: { x: p.x, y: p.y, z: p.z }, yaw: p.yaw })
    else if (lista.length) sock.emit('entity', { id: 'p_' + n, delete: true })
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
    sock.emit('entity', { id: 'm_' + m.id, name: ZUMBIS[m.m] ? 'mc_' + m.m : m.m, pos: { x: m.x, y: m.y, z: m.z }, yaw: m.yaw })
    vistosMob.set(m.id, t)
  }
  for (const [id] of vistosMob) if (!agoraIds.has(id)) { sock.emit('entity', { id: 'm_' + id, delete: true }); vistosMob.delete(id) }
  sock.emit('position', { pos: c.pos, yaw: c.yaw, pitch: c.pitch })
}

let conexoes = 0
const pronto = new Promise(ok => io.on('connection', s => { conexoes++; if (process.env.DEBUG_REPLAY) console.log('[conexão]', conexoes); sock = s; s.emit('version', '1.21.4'); ok() }))
await new Promise(ok => srv.listen(0, '127.0.0.1', ok))
const porta = srv.address().port

// GL=llvmpipe usa o Mesa do sistema (desenha em vários núcleos); o padrão é o SwiftShader do Chromium
const GL = process.env.GLARGS ? process.env.GLARGS.split(' ') : process.env.GL === 'llvmpipe' ? ['--use-gl=angle', '--use-angle=gl-egl', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--disable-gpu-watchdog'] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
// "auto:<Nome>": escolhe a câmera do trecho inteiro antes de filmar (nunca troca no meio): se na maior parte do tempo a
// câmera não cabe atrás do personagem (túnel, mina, buraco), filma em primeira pessoa; senão, atrás (F5)
if (modo === 'auto') {
  const cols = new Map()
  const solidoEm = (x, y, z, t) => {
    const k = `${Math.floor(x / 16)}_${Math.floor(z / 16)}`
    if (!cols.has(k)) {
      let d = null
      for (const v of porChunk.get(k) ?? []) { const dv = JSON.parse(zlib.gunzipSync(fs.readFileSync(v.arq))); if (!d || dv.t <= t) d = dv }
      const col = d ? Chunk.fromJson(d.col) : null
      // as mudanças de bloco gravadas depois do pedaço (árvore cortada, túnel cavado) até agora
      if (col) for (const b of blocos) if (b.t >= d.t && b.t <= t && `${Math.floor(b.x / 16)}_${Math.floor(b.z / 16)}` === k) col.setBlockStateId(new Vec3(((b.x % 16) + 16) % 16, b.y, ((b.z % 16) + 16) % 16), b.s)
      cols.set(k, col)
    }
    const col = cols.get(k)
    if (!col) return false
    const b = registro.blocksByStateId[col.getBlockStateId(new Vec3(((Math.floor(x) % 16) + 16) % 16, Math.floor(y), ((Math.floor(z) % 16) + 16) % 16))]
    return !!b && b.boundingBox === 'block' && !b.name.endsWith('leaves')
  }
  let apertado = 0, total = 0
  let iB = 0
  for (let t = t0; t <= t1; t += 1) {
    while (iB < blocos.length && blocos[iB].t <= t) {
      const b = blocos[iB++], col = cols.get(`${Math.floor(b.x / 16)}_${Math.floor(b.z / 16)}`)
      if (col) col.setBlockStateId(new Vec3(((b.x % 16) + 16) % 16, b.y, ((b.z % 16) + 16) % 16), b.s)
    }
    const p = posJogador(arg, t)
    if (!p) continue
    total++
    let melhor = 0
    for (let a = 0; a < 16; a++) {
      const ang = a * Math.PI / 8, hx = p.x, hy = p.y + 1.5, hz = p.z
      const ex = p.x + Math.sin(ang) * 4.8, ey = p.y + 2.0, ez = p.z + Math.cos(ang) * 4.8
      const L = Math.hypot(ex - hx, ey - hy, ez - hz)
      let livre = L
      for (let d = 0.3; d <= L; d += 0.25) {
        const q = d / L
        if (solidoEm(hx + (ex - hx) * q, hy + (ey - hy) * q, hz + (ez - hz) * q, t)) { livre = d; break }
      }
      melhor = Math.max(melhor, livre)
    }
    if (melhor < 3.2) apertado++
  }
  modo = total && apertado / total > 0.4 ? 'olhos' : 'segue'
  console.log('CAMERA', modo, apertado, total)
  if (process.env.SO_DECIDIR) process.exit(0)
}
const nav = await chromium.launch({ args: GL, ...(process.env.GL === 'llvmpipe' ? { env: { ...process.env, LIBGL_ALWAYS_SOFTWARE: '1', GALLIUM_DRIVER: 'llvmpipe', LP_NUM_THREADS: process.env.LP_NUM_THREADS ?? '4' } } : {}) })
const pag = await nav.newPage({ viewport: { width: Number(W), height: Number(H) } })
pag.on('console', m => { if (process.env.DEBUG_REPLAY) console.log('[pagina]', m.type(), m.text().slice(0, 200)) })
pag.on('pageerror', e => console.log('[pagina erro]', e.message.slice(0, 300)))
// o canvas guarda o último quadro desenhado: dá pra ler a imagem direto dele (a foto do navegador leva 2 s com WebGL no processador)
// guarda os "trabalhadores" do viewer (montam a malha 3D em paralelo) e cria a barreira: cada um responde quando já
// processou tudo o que recebeu e não tem seção suja na fila. A fila de seções do viewer (sectionsOutstanding) não
// serve pra isso: uma seção marcada duas vezes sai da fila na primeira resposta, com a segunda ainda pendente.
// os ossos de cada modelo (na ordem do skeleton.bones), pros scripts de animação; e os scripts dos extras
const OSSOS = {}
for (const [tipo, ent] of Object.entries(require('prismarine-viewer/viewer/lib/entity/entities.json'))) {
  const g = ent.geometry?.default ?? Object.values(ent.geometry ?? {})[0]
  if (g?.bones) OSSOS[tipo] = Object.fromEntries(g.bones.map((b, i) => [b.name, i]))
}
for (const n of NOMES_IA) OSSOS['ia_' + n] = OSSOS.player
for (const m of Object.keys(ZUMBIS)) OSSOS['mc_' + m] = OSSOS.player
await pag.addInitScript(o => { window.__ossos = o; window.__extras = [] }, OSSOS)
for (const f of fs.readdirSync(path.join(PASTA, 'pagina')).filter(f => f.endsWith('.js')).sort()) await pag.addInitScript({ path: path.join(PASTA, 'pagina', f) })
await pag.addInitScript(() => {
  // desenha só quando a gente pede, desde o começo: no aquecimento o laço de desenho roubava o processador da malha
  window.__manual = true
  const W = window.Worker
  window.__wk = []; window.__wo = []
  window.Worker = function (url) {
    const w = new W(url), st = { geo: 0, fin: 0, err: null }
    window.__wk.push(st); window.__wo.push(w)
    w.addEventListener('message', e => { if (e.data.type === 'geometry') st.geo++; else if (e.data.type === 'sectionFinished') st.fin++; else if (e.data.type === 'erroSecao') { st.erros = (st.erros || 0) + 1; st.ultimo = e.data.msg } })
    w.addEventListener('error', e => { st.err = String(e.message || e) })
    return w
  }
  window.__barreira = () => new Promise(ok => {
    let n = 0, sujas = 0
    for (const w of window.__wo) {
      const f = e => { if (e.data.type !== 'contagem') return; w.removeEventListener('message', f); n++; sujas += e.data.dirty + (e.data.bs ? 0 : 1000); if (n === window.__wo.length) ok(sujas) }
      w.addEventListener('message', f)
      w.postMessage({ type: 'contar' })
    }
  })
})
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
await pag.waitForTimeout(Number(process.env.AQUECE ?? 3000))
// espera o viewer montar a malha de todos os pedaços (com 3 renders juntos isso passa de 20 s)
// (primeiro os pedaços têm que chegar no navegador: antes disso a fila de seções está vazia e parece pronta)
const pendentes = () => pag.evaluate(() => [Object.keys(window.__v.world.loadedChunks).length, window.__v.world.sectionsOutstanding.size])
async function esperarMalha(max) {
  const ini = Date.now()
  while (Date.now() - ini < max) {
    const [n] = await pendentes()
    if (n >= enviados.size && await pag.evaluate(() => window.__barreira()) === 0) return true
    await pag.waitForTimeout(60)
  }
  console.log('malha não terminou em', max / 1000, 's')
  return false
}
await esperarMalha(180000)

if (process.env.DEBUG_REPLAY) console.log('[workers]', await pag.evaluate(() => JSON.stringify(window.__wk || null)))
if (process.env.DEBUG_REPLAY) console.log('[malhas]', await pag.evaluate(() => { const w = window.__v.world; const ys = {}; for (const k of Object.keys(w.sectionMeshs)) { const y = k.split(',')[1]; ys[y] = (ys[y] ?? 0) + 1 } return JSON.stringify({chunks: Object.keys(w.loadedChunks).length, pend: w.sectionsOutstanding.size, ys}) }))
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', SAIDA], { stdio: ['pipe', 'inherit', 'inherit'] })
const n = Math.round((t1 - t0) * fps)
const inicio = Date.now()
for (let i = 0; i < n; i++) {
  const t = t0 + i / fps
  const a = Date.now()
  const antes = enviados.size
  quadro(t)
  // pedaço novo neste quadro: espera a malha dele antes da foto (senão o chão aparece faltando)
  await esperarMalha(enviados.size > antes ? 60000 : 3000)
  const b = Date.now()
  await pag.waitForTimeout(Number(process.env.ESPERA ?? 12))
  const c = Date.now()
  // duas passadas: a primeira termina as animações de 0 ms, a segunda desenha tudo no lugar
  // se o navegador travar (já aconteceu com 3 renders juntos), fecha o vídeo até aqui e sai com código 3:
  // o render_seguro.sh continua do quadro seguinte num pedaço novo
  const extra = {}
  for (const e of EXTRAS) if (e.m.noQuadro) Object.assign(extra, e.m.noQuadro(t, { fps, camera: ultimaCam, modo, seguido: arg, primeira: !!ultimaCam?.primeira, posJogador }))
  const foto = pag.evaluate(extra => {
    window.__manual = true
    window.__r()
    for (const f of window.__extras) { try { f(extra) } catch (e) { console.error('[extra]', e && e.stack || e) } }
    window.__r()
    return document.querySelector('canvas').toDataURL('image/jpeg', 0.92).split(',')[1]
  }, extra)
  const b64 = await Promise.race([foto, new Promise(ok => setTimeout(() => ok(null), 45000))])
  if (!b64) {
    ff.stdin.end()
    await new Promise(ok => ff.on('close', ok))
    console.log(`PAROU ${i}`)
    process.exit(3)
  }
  ff.stdin.write(Buffer.from(b64, 'base64'))
  if (process.env.DEBUG_REPLAY) console.log('emitir', b - a, 'esperar', c - b, 'foto', Date.now() - c, 'câmera', JSON.stringify(ultimaCam), JSON.stringify(await pendentes()), enviados.size)
  if (i % 10 === 0) console.log(i + '/' + n, ((Date.now() - inicio) / (i + 1) / 1000).toFixed(2) + ' s/quadro')
}
ff.stdin.end()
await new Promise(ok => ff.on('close', ok))
await nav.close()
srv.close()
console.log(`\n${SAIDA}: ${n} quadros`)
process.exit(0)
