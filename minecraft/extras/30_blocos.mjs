// Blocos sendo minerados e colocados: diz, em cada quadro, quais blocos têm rachadura (e em que estágio),
// quais quebraram há pouco (partículas) e quais foram colocados há pouco (pop). Só o que a IA está mexendo
// (até 5 blocos de uma IA), com o bloco que existia antes tirado do registro anterior ou do pedaço gravado.
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const RAIO_IA = 5          // blocos: distância máxima de uma IA pra contar o bloco como dela
const RAIO_VISTA = 32      // blocos: além disso o quadro nem recebe o bloco
const JANELA_ANTES = 3     // s: começa a olhar essa folga antes do trecho filmado (pra pegar a mineração em curso)
const AR = new Set(['air', 'cave_air', 'void_air'])
// líquidos e fogo também "somem" da lista de blocos: não são minerados, então não entram
const NAO_SOLIDOS = new Set(['water', 'lava', 'fire', 'soul_fire', 'bubble_column'])
const ehAr = nome => !nome || AR.has(nome)

// tempo de mineração (s) por tipo de bloco; aproximado, só pra o estágio da rachadura
function duracao(nome) {
  if (/leaves/.test(nome)) return 0.2
  if (/(_log|_wood|stem|planks|_door|crafting_table|bookshelf|chest|barrel)/.test(nome)) return 1.0
  if (/(stone|cobblestone|ore|deepslate|furnace|andesite|diorite|granite|tuff|brick)/.test(nome)) return 0.8
  if (/(dirt|grass|sand|gravel|clay|mud|snow|farmland|dirt_path)/.test(nome)) return 0.5
  return 0.7
}

// busca binária: primeiro índice com lista[i][campo] >= valor
function primeiro(lista, campo, valor) {
  let lo = 0, hi = lista.length
  while (lo < hi) { const m = (lo + hi) >> 1; if (lista[m][campo] < valor) lo = m + 1; else hi = m }
  return lo
}

export function preparar(dados) {
  const { DIR, posicoes, blocos, registro, NOMES_IA, interp, t0, t1 } = dados
  const Chunk = require('prismarine-chunk')(registro)
  const { Vec3 } = require('vec3')
  const janela = [t0 - JANELA_ANTES, t1 + 1]

  // pedaços gravados: cada versão (sessão) de um pedaço com o instante em que foi salva
  const pastaChunks = path.join(DIR, 'chunks')
  const versoesPorPedaco = new Map()
  for (const f of fs.existsSync(pastaChunks) ? fs.readdirSync(pastaChunks) : []) {
    const [x, z] = f.replace('.json.gz', '').split('_')
    const k = `${x}_${z}`
    ;(versoesPorPedaco.get(k) ?? versoesPorPedaco.set(k, []).get(k)).push(path.join(pastaChunks, f))
  }
  const pedacosLidos = new Map()  // arquivo -> {t, chunk} (carrega só quando precisa)
  function pedaco(arq) {
    if (!pedacosLidos.has(arq)) {
      const d = JSON.parse(zlib.gunzipSync(fs.readFileSync(arq)))
      pedacosLidos.set(arq, { t: d.t, chunk: Chunk.fromJson(d.col) })
    }
    return pedacosLidos.get(arq)
  }
  // o bloco que estava em (x,y,z) no instante t, pelo pedaço gravado (a versão mais nova salva antes de t)
  function antigoDoPedaco(x, y, z, t) {
    const versoes = versoesPorPedaco.get(`${Math.floor(x / 16)}_${Math.floor(z / 16)}`)
    if (!versoes) return null
    const lidas = versoes.map(pedaco)
    let escolhido = null
    for (const p of lidas) if (p.t <= t && (!escolhido || p.t > escolhido.t)) escolhido = p
    escolhido ??= lidas.reduce((a, b) => (b.t < a.t ? b : a))
    const id = escolhido.chunk.getBlockStateId(new Vec3(((x % 16) + 16) % 16, y, ((z % 16) + 16) % 16))
    return registro.blocksByStateId[id]?.name ?? null
  }

  // a IA mais perto do bloco (até RAIO_IA), no instante t
  function iaPerto(x, y, z, t) {
    let melhor = null, dmin = Infinity
    for (const n of NOMES_IA) {
      if (!posicoes[n]?.length) continue
      const p = interp(posicoes[n], t)
      if (!p) continue
      const d = Math.hypot(p.x - (x + 0.5), p.y + 0.9 - (y + 0.5), p.z - (z + 0.5))
      if (d <= RAIO_IA && d < dmin) { dmin = d; melhor = n }
    }
    return melhor
  }

  // 1) mudanças de bloco: quebra (vira ar) e colocação (ar vira bloco). Cada IA grava o que vê, então
  // um mesmo bloco aparece várias vezes: como o registro anterior já é ar, a repetição não conta de novo.
  const ultimo = new Map()  // "x,y,z" -> nome do bloco no último registro
  const candidatos = []
  for (const b of blocos) {
    const chave = `${b.x},${b.y},${b.z}`
    const novo = b.b ?? registro.blocksByStateId[b.s]?.name ?? 'air'
    if (b.t < janela[0] || b.t > janela[1]) { ultimo.set(chave, novo); continue }
    const antes = ultimo.has(chave) ? ultimo.get(chave) : antigoDoPedaco(b.x, b.y, b.z, b.t)
    ultimo.set(chave, novo)
    if (antes == null || antes === novo) continue
    if (ehAr(novo) && !ehAr(antes) && !NAO_SOLIDOS.has(antes)) candidatos.push({ tipo: 'quebra', x: b.x, y: b.y, z: b.z, t: b.t, bloco: antes })
    else if (!ehAr(novo) && ehAr(antes) && !NAO_SOLIDOS.has(novo)) candidatos.push({ tipo: 'colocado', x: b.x, y: b.y, z: b.z, t: b.t, bloco: novo })
  }

  // 2) de quem é cada mudança (a IA mais perto); a mineração começa quando a IA acaba a quebra anterior
  const quebras = [], colocados = [], mineracoes = []
  const ultimaQuebraDe = {}
  for (const c of candidatos) {
    const ia = iaPerto(c.x, c.y, c.z, c.t)
    if (!ia) continue
    c.ia = ia
    if (c.tipo === 'colocado') { colocados.push(c); continue }
    const dur = duracao(c.bloco)
    let ini = Math.max((ultimaQuebraDe[ia] ?? -Infinity) + 0.05, c.t - dur)
    if (ini >= c.t) ini = c.t - 0.05
    ultimaQuebraDe[ia] = c.t
    quebras.push(c)
    mineracoes.push({ x: c.x, y: c.y, z: c.z, ia, ini, fim: c.t, bloco: c.bloco })
  }
  mineracoes.sort((a, b) => a.ini - b.ini)
  exporta.quebras = quebras
  exporta.colocados = colocados
  exporta.mineracoes = mineracoes
  if (process.env.DEBUG_REPLAY) console.log(`[blocos] quebras ${quebras.length}, colocados ${colocados.length} entre ${janela[0].toFixed(1)} e ${janela[1].toFixed(1)} s`)
}

// o que o preparar guardou (o noQuadro lê daqui)
const exporta = { quebras: [], colocados: [], mineracoes: [] }

// quadro: rachaduras (estágio 0-9 da mineração), quebras e colocações recentes, só perto da câmera
export function noQuadro(t, ctx) {
  const cam = ctx.camera?.pos
  const perto = (x, y, z) => !cam || Math.hypot(x + 0.5 - cam.x, y + 0.5 - cam.y, z + 0.5 - cam.z) <= RAIO_VISTA

  const rachaduras = []
  // a mineração dura no máximo 1 s: só olha as que começaram até 1,05 s antes de t
  for (let i = primeiro(exporta.mineracoes, 'ini', t - 1.05); i < exporta.mineracoes.length; i++) {
    const m = exporta.mineracoes[i]
    if (m.ini > t) break
    if (t >= m.fim || !perto(m.x, m.y, m.z)) continue
    const estagio = Math.min(9, Math.floor(((t - m.ini) / (m.fim - m.ini)) * 10))
    rachaduras.push({ x: m.x, y: m.y, z: m.z, estagio })
  }

  const quebras = []
  // quebrou há menos de 0,8 s (as partículas somem depois disso)
  for (let i = primeiro(exporta.quebras, 't', t - 0.8); i < exporta.quebras.length; i++) {
    const q = exporta.quebras[i]
    if (q.t > t) break
    if (perto(q.x, q.y, q.z)) quebras.push({ x: q.x, y: q.y, z: q.z, bloco: q.bloco, idade: t - q.t })
  }

  const colocados_ = []
  // colocado há menos de 0,25 s (o pop)
  for (let i = primeiro(exporta.colocados, 't', t - 0.25); i < exporta.colocados.length; i++) {
    const c = exporta.colocados[i]
    if (c.t > t) break
    if (perto(c.x, c.y, c.z)) colocados_.push({ x: c.x, y: c.y, z: c.z, bloco: c.bloco, idade: t - c.t })
  }

  return { blocos: { rachaduras, quebras, colocados: colocados_ } }
}
