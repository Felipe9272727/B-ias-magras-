// A casa da fase de coleta: planta fixa (casa térrea dos anos 50, 8 cômodos) e o que muda com a semente: onde está
// cada item e cada pessoa da família. 1 casa da grade = 1 metro. O 3D (sessenta/blender/casa.py) lê a mesma planta
// (via `node sessenta/casa.mjs --json <semente>`), então o vídeo mostra exatamente a casa da partida.
import {criarRng} from './rng.mjs'
import {ITENS} from './itens.mjs'
import {FAMILIA} from './familia.mjs'

export const LARG = 19
export const ALT = 15

// cômodos: retângulo do piso (x, y, w, h) — as paredes ficam em volta
export const COMODOS = {
  garagem: {nome: 'Garagem', x: 1, y: 1, w: 5, h: 5},
  cozinha: {nome: 'Cozinha', x: 7, y: 1, w: 5, h: 5},
  sala: {nome: 'Sala', x: 13, y: 1, w: 5, h: 5},
  corredor: {nome: 'Corredor', x: 1, y: 7, w: 17, h: 2},
  quarto: {nome: 'Quarto do casal', x: 1, y: 10, w: 5, h: 4},
  banheiro: {nome: 'Banheiro', x: 7, y: 10, w: 3, h: 4},
  criancas: {nome: 'Quarto das crianças', x: 11, y: 10, w: 4, h: 4},
  despensa: {nome: 'Despensa', x: 16, y: 10, w: 2, h: 4},
}
// portas (casas de parede que viram passagem)
export const PORTAS = [
  {x: 3, y: 6}, {x: 9, y: 6}, {x: 15, y: 6}, // garagem, cozinha e sala → corredor
  {x: 12, y: 3}, // cozinha ↔ sala
  {x: 3, y: 9}, {x: 8, y: 9}, {x: 12, y: 9}, {x: 17, y: 9}, // corredor → quarto, banheiro, crianças, despensa
]
// o alçapão do abrigo (no corredor): largar coisas aqui = elas descem para o abrigo
export const ABRIGO = {x: 9, y: 8}
// onde o pai começa (a sirene toca e ele está na sala)
export const INICIO = {x: 15, y: 3}

// móveis: bloqueiam a passagem (x, y, w, h em casas). tipo é o desenho no 3D. Itens aparecem ENCOSTADOS neles.
export const MOVEIS = [
  {tipo: 'carro', comodo: 'garagem', x: 1, y: 1, w: 2, h: 4},
  {tipo: 'bancada', comodo: 'garagem', x: 5, y: 1, w: 1, h: 3},
  {tipo: 'prateleira', comodo: 'garagem', x: 3, y: 1, w: 2, h: 1},
  {tipo: 'fogao', comodo: 'cozinha', x: 7, y: 1, w: 1, h: 1},
  {tipo: 'pia', comodo: 'cozinha', x: 8, y: 1, w: 2, h: 1},
  {tipo: 'geladeira', comodo: 'cozinha', x: 11, y: 1, w: 1, h: 1},
  {tipo: 'mesa', comodo: 'cozinha', x: 8, y: 3, w: 2, h: 2},
  {tipo: 'armario', comodo: 'cozinha', x: 7, y: 4, w: 1, h: 2},
  {tipo: 'sofa', comodo: 'sala', x: 13, y: 4, w: 3, h: 1},
  {tipo: 'tv', comodo: 'sala', x: 14, y: 1, w: 2, h: 1},
  {tipo: 'estante', comodo: 'sala', x: 17, y: 1, w: 1, h: 3},
  {tipo: 'poltrona', comodo: 'sala', x: 17, y: 5, w: 1, h: 1},
  {tipo: 'aparador', comodo: 'corredor', x: 4, y: 7, w: 2, h: 1},
  {tipo: 'cama_casal', comodo: 'quarto', x: 1, y: 11, w: 3, h: 2},
  {tipo: 'guarda_roupa', comodo: 'quarto', x: 5, y: 12, w: 1, h: 2},
  {tipo: 'banheira', comodo: 'banheiro', x: 7, y: 12, w: 1, h: 2},
  {tipo: 'pia_banheiro', comodo: 'banheiro', x: 9, y: 10, w: 1, h: 1},
  {tipo: 'cama', comodo: 'criancas', x: 11, y: 12, w: 2, h: 2},
  {tipo: 'bau_brinquedos', comodo: 'criancas', x: 14, y: 13, w: 1, h: 1},
  {tipo: 'prateleira', comodo: 'despensa', x: 16, y: 10, w: 1, h: 4},
]

// quantos de cada item existem na casa (o resto dos itens, 1 de cada)
const QTD = {sopa: 8, agua: 8}

const chave = (x, y) => `${x},${y}`

// grade: '#' parede, '.' piso, 'D' porta, 'A' alçapão do abrigo, 'm' móvel
export function grade() {
  const g = Array.from({length: ALT}, () => Array(LARG).fill('#'))
  for (const c of Object.values(COMODOS)) for (let y = c.y; y < c.y + c.h; y++) for (let x = c.x; x < c.x + c.w; x++) g[y][x] = '.'
  for (const p of PORTAS) g[p.y][p.x] = 'D'
  for (const m of MOVEIS) for (let y = m.y; y < m.y + m.h; y++) for (let x = m.x; x < m.x + m.w; x++) g[y][x] = 'm'
  g[ABRIGO.y][ABRIGO.x] = 'A'
  return g.map((l) => l.join(''))
}
const GRADE = grade()
export const andavel = (x, y) => x >= 0 && y >= 0 && x < LARG && y < ALT && '.DA'.includes(GRADE[y][x])

export function comodoEm(x, y) {
  for (const [id, c] of Object.entries(COMODOS)) if (x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h) return id
  const p = PORTAS.find((p) => p.x === x && p.y === y)
  return p ? 'porta' : null
}

// caminho mais curto (BFS, 4 direções) de a até b, incluindo os dois; null se não houver
export function caminho(a, b) {
  if (!andavel(b.x, b.y)) return null
  const vindo = new Map([[chave(a.x, a.y), null]])
  const fila = [a]
  while (fila.length) {
    const p = fila.shift()
    if (p.x === b.x && p.y === b.y) break
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const q = {x: p.x + dx, y: p.y + dy}
      if (andavel(q.x, q.y) && !vindo.has(chave(q.x, q.y))) { vindo.set(chave(q.x, q.y), p); fila.push(q) }
    }
  }
  if (!vindo.has(chave(b.x, b.y))) return null
  const rota = []
  for (let p = b; p; p = vindo.get(chave(p.x, p.y))) rota.unshift(p)
  return rota
}

// casas de piso encostadas em um móvel (onde um item pode aparecer), por cômodo
function pontosDeItem() {
  const pts = {}
  for (const m of MOVEIS) {
    for (let y = m.y - 1; y <= m.y + m.h; y++) for (let x = m.x - 1; x <= m.x + m.w; x++) {
      const dentro = x >= m.x && x < m.x + m.w && y >= m.y && y < m.y + m.h
      const diag = (x < m.x || x >= m.x + m.w) && (y < m.y || y >= m.y + m.h)
      if (dentro || diag || !andavel(x, y) || GRADE[y][x] !== '.') continue
      if (comodoEm(x, y) !== m.comodo) continue
      ;(pts[m.comodo] ??= new Set()).add(chave(x, y))
    }
  }
  return Object.fromEntries(Object.entries(pts).map(([c, s]) => [c, [...s].map((k) => { const [x, y] = k.split(',').map(Number); return {x, y} })]))
}

// a casa da partida: itens e família espalhados pela semente (igual para as 3 IAs)
export function montarCasa(semente) {
  const r = criarRng(semente, 'casa')
  const pontos = pontosDeItem()
  const livres = Object.fromEntries(Object.entries(pontos).map(([c, ps]) => [c, r.embaralhar(ps)]))
  const tomar = (comodos) => {
    const opc = r.embaralhar(comodos.filter((c) => livres[c]?.length))
    return opc.length ? {...livres[opc[0]].pop(), comodo: opc[0]} : null
  }
  // onde cada tipo de item costuma estar (mais natural e mais justo do que qualquer lugar)
  const ONDE = {
    sopa: ['cozinha', 'despensa', 'garagem'], agua: ['cozinha', 'despensa', 'banheiro', 'garagem'],
    radio: ['sala', 'garagem'], mapa: ['sala', 'garagem', 'corredor'], mascara: ['garagem', 'quarto'],
    kit: ['banheiro', 'quarto'], rifle: ['quarto', 'garagem'], machado: ['garagem'], lanterna: ['garagem', 'corredor', 'quarto'],
    cadeado: ['garagem', 'despensa'], inseticida: ['despensa', 'banheiro', 'garagem'], mala: ['quarto', 'criancas'],
    baralho: ['sala', 'criancas'], damas: ['criancas', 'sala'], gaita: ['criancas', 'sala'], manual: ['criancas', 'sala'],
  }
  const itens = []
  for (const id of Object.keys(ITENS)) {
    const n = QTD[id] ?? 1
    for (let k = 0; k < n; k++) {
      const p = tomar(ONDE[id] ?? Object.keys(COMODOS))
      if (p) itens.push({uid: `${id}${n > 1 ? k + 1 : ''}`, id, ...p})
    }
  }
  // a família (menos o pai) espalhada pelos cômodos, cada um num cômodo diferente
  const lugares = r.embaralhar(['cozinha', 'sala', 'quarto', 'banheiro', 'criancas', 'garagem'])
  const pessoas = FAMILIA.filter((f) => f.id !== 'pai').map((f, i) => ({id: f.id, ...tomar([lugares[i]]) ?? tomar(Object.keys(COMODOS))}))
  return {semente, larg: LARG, alt: ALT, grade: GRADE, comodos: COMODOS, portas: PORTAS, moveis: MOVEIS, abrigo: ABRIGO, inicio: INICIO, itens, pessoas}
}

// node sessenta/casa.mjs --json <semente>  → planta + sorteio (para o Blender e para conferir)
if (process.argv[1] && process.argv[1].endsWith('casa.mjs')) {
  const i = process.argv.indexOf('--json')
  const semente = process.argv[i + 1] ?? 'teste'
  const c = montarCasa(semente)
  if (i >= 0) console.log(JSON.stringify(c, null, 1))
  else {
    const g = c.grade.map((l) => l.split(''))
    for (const it of c.itens) g[it.y][it.x] = it.id[0].toUpperCase()
    for (const p of c.pessoas) g[p.y][p.x] = '@'
    g[c.inicio.y][c.inicio.x] = 'P'
    console.log(g.map((l) => l.join('')).join('\n'))
    console.log(`${c.itens.length} itens, ${c.pessoas.length} pessoas para salvar`)
  }
}
