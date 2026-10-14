// Overcooked das IAs: motor do jogo (recriação própria, sem nada do jogo original).
// A cozinha é uma grade; cada tique vale 2 s de jogo. A cada tique, cada chef (uma IA) recebe a cozinha por escrito,
// escolhe uma ação da lista, uma fala curta para o parceiro (pode gritar em CAIXA ALTA) e um pensamento secreto.
// O motor anda com o chef até a estação (desviando dos outros chefs, que bloqueiam o caminho), faz a interação,
// cozinha, queima, espalha o fogo, entrega pedidos e grava tudo por tique em logs/<nome>.json para o vídeo.
//
// Uso: node cozinha.mjs <fase> <modo> [nome]      modo: versus | coop | mock-versus | mock-coop
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {perguntar, lerJSON, uso} from '../amongus/ia.mjs'
import {FASES} from './fases.mjs'

const DIR = path.dirname(new URL(import.meta.url).pathname)
const TICK_S = 2
const VEL = 7 // casas por tique (3,5 casas/s)
const PICAR = 2 // tiques de tábua por ingrediente
const LAVAR = 1 // tiques de pia por prato
const COZ = 4 // tiques para a sopa ficar pronta (com 3 ingredientes)
const GRELHA = 3 // tiques para a carne ficar grelhada
const AVISO = 4 // tiques depois de pronto até começar a queimar
const QUEIMANDO = 2 // tiques de alarme antes de pegar fogo
const ESPALHA = 3 // a cada quantos tiques o fogo pula para uma bancada vizinha

export const EMPRESAS = {
  deepseek: {nome: 'DeepSeek', modelo: 'DeepSeek Flash', cor: '#4d6bfe'},
  haiku: {nome: 'Claude', modelo: 'Claude Haiku', cor: '#d97a47'},
  'or:openai/gpt-5.6-luna': {nome: 'GPT', modelo: 'GPT-5.6 Luna', cor: '#10a37f'},
  'or:google/gemini-3.8-flash': {nome: 'Gemini', modelo: 'Gemini 3.8 Flash', cor: '#8b5cf6'},
}
const PROVS = Object.keys(EMPRESAS)

const CAIXAS = {T: 'tomate', O: 'cebola', M: 'cogumelo', A: 'alface', P: 'pão', K: 'carne'}
const PICAVEL = new Set(['tomate', 'cebola', 'cogumelo', 'alface', 'carne'])
const SOPA = new Set(['tomate', 'cebola', 'cogumelo'])
export const RECEITAS = {
  'Sopa de tomate': {prato: ['sopa de tomate'], base: 20, tempo: 45, como: '3 tomates picados na panela, cozinhar, servir no prato'},
  'Sopa de cebola': {prato: ['sopa de cebola'], base: 20, tempo: 45, como: '3 cebolas picadas na panela, cozinhar, servir no prato'},
  'Sopa de cogumelo': {prato: ['sopa de cogumelo'], base: 20, tempo: 45, como: '3 cogumelos picados na panela, cozinhar, servir no prato'},
  Salada: {prato: ['alface picada', 'tomate picado'], base: 15, tempo: 40, como: 'alface picada + tomate picado no mesmo prato (não cozinha)'},
  'Hambúrguer': {prato: ['carne grelhada', 'pão'], base: 25, tempo: 50, como: 'pão no prato + carne picada grelhada na frigideira'},
  'Hambúrguer com alface': {prato: ['alface picada', 'carne grelhada', 'pão'], base: 30, tempo: 55, como: 'pão + carne grelhada + alface picada no mesmo prato'},
}

// ---------------------------------------------------------------- aleatoriedade com semente (mesma ordem de pedidos em todas as cozinhas)
function rng(seed) {
  let s = seed >>> 0
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

// ---------------------------------------------------------------- cozinha
function criarCozinha(fase) {
  const linhas = fase.mapa.trim().split('\n').map((l) => l.trim())
  const tiles = [], inicio = {}
  let nb = 0, nt = 0, nf = 0, ng = 0
  linhas.forEach((l, y) => [...l].forEach((ch, x) => {
    if (ch === '.' || /[1-4]/.test(ch)) { if (/[1-4]/.test(ch)) inicio[ch] = {x, y}; return }
    if (ch === ' ') return
    const t = {x, y, ch, item: null, fogo: false, fogoDesde: 0}
    if (ch === '#') t.nome = `bancada ${++nb}`
    else if (CAIXAS[ch]) t.nome = `caixa de ${CAIXAS[ch]}`
    else if (ch === 'B') { t.nome = `tábua ${++nt}`; t.picando = 0 }
    else if (ch === 'F') { t.nome = `fogão ${++nf}`; t.item = {tipo: 'panela', conteudo: [], prog: 0, estado: 'vazia'} }
    else if (ch === 'G') { t.nome = `grelha ${++ng}`; t.item = {tipo: 'frigideira', conteudo: [], prog: 0, estado: 'vazia'} }
    else if (ch === 'D') { t.nome = 'pilha de pratos limpos'; t.pratos = fase.pratos ?? 4 }
    else if (ch === 'R') { t.nome = 'retorno de pratos sujos'; t.sujos = 0 }
    else if (ch === 'S') { t.nome = 'pia'; t.sujos = 0; t.lavando = 0 }
    else if (ch === 'E') t.nome = 'passa-prato (entrega)'
    else if (ch === 'L') t.nome = 'lixo'
    else if (ch === 'X') { t.nome = `bancada ${++nb}`; t.item = {tipo: 'extintor'}; t.ch = '#' }
    tiles.push(t)
  }))
  const w = Math.max(...linhas.map((l) => l.length)), h = linhas.length
  const piso = new Set()
  linhas.forEach((l, y) => [...l].forEach((ch, x) => { if (ch === '.' || /[1-4]/.test(ch)) piso.add(`${x},${y}`) }))
  return {w, h, tiles, piso, inicio, mapa: linhas}
}

const viz = (p) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => ({x: p.x + dx, y: p.y + dy}))
const k = (p) => `${p.x},${p.y}`
const MASC = /^(fogão|lixo|retorno|passa-prato)/
const da = (t) => (MASC.test(t.nome) ? 'do ' : 'da ') + t.nome
const na = (t) => (MASC.test(t.nome) ? 'no ' : 'na ') + t.nome
const tileEm = (c, p) => c.tiles.find((t) => t.x === p.x && t.y === p.y)

// caminho mais curto no piso até ficar ao lado do alvo; `ocupado` = casas com outros chefs
function caminho(c, de, alvo, ocupado) {
  const fim = new Set(viz(alvo).filter((p) => c.piso.has(k(p))).map(k))
  if (fim.has(k(de))) return [de]
  const prev = new Map([[k(de), null]]), fila = [de]
  while (fila.length) {
    const p = fila.shift()
    for (const q of viz(p)) {
      const kq = k(q)
      if (!c.piso.has(kq) || prev.has(kq) || ocupado.has(kq)) continue
      prev.set(kq, p)
      if (fim.has(kq)) { const r = [q]; let a = p; while (a) { r.unshift(a); a = prev.get(k(a)) } return r }
      fila.push(q)
    }
  }
  return null
}
const distancia = (c, de, alvo) => { const r = caminho(c, de, alvo, new Set()); return r ? r.length - 1 : 99 }

// ---------------------------------------------------------------- descrição de itens
function descItem(it) {
  if (!it) return 'nada'
  if (it.tipo === 'ing') return it.nome + (it.queimado ? ' queimada' : it.grelhado ? ' grelhada' : it.picado ? (it.nome === 'alface' || it.nome === 'cebola' || it.nome === 'carne' ? ' picada' : ' picado') : it.nome === 'pão' ? '' : (it.nome === 'alface' || it.nome === 'cebola' || it.nome === 'carne' ? ' crua' : ' cru'))
  if (it.tipo === 'prato') return it.sujo ? 'prato sujo' : it.conteudo.length ? `prato com ${it.conteudo.join(' + ')}` : 'prato limpo vazio'
  if (it.tipo === 'panela' || it.tipo === 'frigideira') {
    const nome = it.tipo
    if (it.estado === 'queimada') return `${nome} com comida QUEIMADA`
    if (!it.conteudo.length) return `${nome} vazia`
    const cont = it.conteudo.map(descItem).join(', ')
    if (it.estado === 'pronta') return `${nome} PRONTA (${it.tipo === 'panela' ? sopaDe(it) : 'carne grelhada'})`
    if (it.estado === 'queimando') return `${nome} QUEIMANDO (${cont})`
    return `${nome} com ${cont}${it.estado === 'cozinhando' ? ' (cozinhando)' : ''}`
  }
  if (it.tipo === 'extintor') return 'extintor'
  return it.tipo
}
function sopaDe(p) {
  const n = new Set(p.conteudo.map((i) => i.nome))
  return n.size === 1 ? `sopa de ${[...n][0]}` : 'sopa misturada'
}
const conteudoPrato = (it) => [...it.conteudo].sort()
const igual = (a, b) => a.length === b.length && a.every((x, i) => x === b[i])

// ---------------------------------------------------------------- uma cozinha em jogo
export class Partida {
  constructor({fase, chefs, nome, seed, rival = false}) {
    this.fase = fase
    this.c = criarCozinha(fase)
    this.nome = nome
    this.rand = rng(seed)
    this.tique = 0
    this.pontos = 0
    this.entregues = 0
    this.expirados = 0
    this.fogos = 0
    this.pedidos = []
    this.proxPedido = 0
    this.idPedido = 0
    this.retornos = [] // [tique, n] pratos que voltam sujos
    this.eventos = []
    this.chefs = chefs.map((ch, i) => ({...ch, pos: {...this.c.inicio[String(i + 1)]}, mao: null, mem: [], falou: '', tiquesParado: 0}))
    this.rival = rival
  }

  evento(tipo, dados) { this.eventos.push({tique: this.tique, tipo, ...dados}) }
  lembrar(ch, txt) { ch.mem.push(`t${this.tique}: ${txt}`); if (ch.mem.length > 6) ch.mem.shift() }
  lembrarTodos(txt) { for (const ch of this.chefs) this.lembrar(ch, txt) }

  // ---- pedidos
  novoPedido() {
    const nomes = this.fase.receitas
    const r = nomes[Math.floor(this.rand() * nomes.length)]
    const tempo = Math.round((RECEITAS[r].tempo * (this.fase.tempoPedido ?? 1)) / TICK_S)
    this.pedidos.push({id: ++this.idPedido, receita: r, ate: this.tique + tempo, tempo})
    this.evento('pedido', {receita: r, id: this.idPedido})
  }
  atualizarPedidos() {
    if (this.tique === 0) { this.novoPedido(); this.novoPedido(); this.proxPedido = this.fase.intervalo }
    if (this.tique >= this.proxPedido && this.pedidos.length < 5) { this.novoPedido(); this.proxPedido = this.tique + this.fase.intervalo }
    for (const p of [...this.pedidos]) {
      if (this.tique >= p.ate) {
        this.pedidos = this.pedidos.filter((x) => x !== p)
        this.pontos -= 10
        this.expirados++
        this.evento('expirou', {receita: p.receita, id: p.id})
        this.lembrarTodos(`O pedido de ${p.receita} EXPIROU: -10 pontos.`)
      }
    }
  }

  // ---- fogo, panelas, pratos
  passarTempo() {
    for (const t of this.c.tiles) {
      const it = t.item
      if (it && (it.tipo === 'panela' || it.tipo === 'frigideira') && (t.ch === 'F' || t.ch === 'G') && !t.fogo) {
        const cheia = it.tipo === 'panela' ? it.conteudo.length >= 3 : it.conteudo.length >= 1
        if (!cheia || it.estado === 'queimada') continue
        it.prog++
        const pronto = it.tipo === 'panela' ? COZ : GRELHA
        if (it.prog < pronto) it.estado = 'cozinhando'
        else if (it.prog === pronto) { it.estado = 'pronta'; this.evento('pronto', {onde: t.nome, o: descItem(it)}); this.lembrarTodos(`${t.nome}: ficou pronta! Sirva logo ou vai queimar.`) }
        else if (it.prog < pronto + AVISO) it.estado = 'pronta'
        else if (it.prog < pronto + AVISO + QUEIMANDO) { if (it.estado !== 'queimando') { this.evento('queimando', {onde: t.nome}); this.lembrarTodos(`ALARME: ${t.nome} está QUEIMANDO!`) } it.estado = 'queimando' }
        else { it.estado = 'queimada'; t.fogo = true; t.fogoDesde = this.tique; this.fogos++; this.evento('fogo', {onde: t.nome}); this.lembrarTodos(`FOGO no ${t.nome}! Pegue o extintor!`) }
      }
    }
    // o fogo se espalha para bancadas vizinhas
    for (const t of this.c.tiles.filter((t) => t.fogo)) {
      if ((this.tique - t.fogoDesde) > 0 && (this.tique - t.fogoDesde) % ESPALHA === 0) {
        const cand = viz(t).map((p) => tileEm(this.c, p)).filter((v) => v && !v.fogo && v.ch !== 'E' && v.ch !== 'L')
        if (cand.length) { const v = cand[Math.floor(this.rand() * cand.length)]; v.fogo = true; v.fogoDesde = this.tique; this.evento('fogo_espalhou', {onde: v.nome}); this.lembrarTodos(`O fogo se espalhou para ${v.nome}!`) }
      }
    }
    // pratos voltam depois da entrega (sujos, se a fase tiver pia)
    for (const r of [...this.retornos]) {
      if (this.tique >= r.em) {
        this.retornos = this.retornos.filter((x) => x !== r)
        const ret = this.c.tiles.find((t) => t.ch === 'R')
        if (ret) ret.sujos += 1
        else { const d = this.c.tiles.find((t) => t.ch === 'D'); if (d) d.pratos += 1 }
      }
    }
  }

  // ---- ações possíveis de um chef: [{txt, alvo, faz}]
  acoes(ch) {
    const c = this.c, ops = []
    const mao = ch.mao
    const add = (txt, t, faz) => { if (!t.fogo || faz === 'apagar') ops.push({txt, alvo: t, faz}) }
    for (const t of c.tiles) {
      if (distancia(c, ch.pos, t) >= 99) continue
      const it = t.item
      if (!mao) {
        if (CAIXAS[t.ch]) add(`pegar ${CAIXAS[t.ch]} ${na(t)}`, t, 'pegar_caixa')
        if (t.ch === 'D' && t.pratos > 0) add(`pegar prato limpo ${na(t)}`, t, 'pegar_prato')
        if (t.ch === 'R' && t.sujos > 0) add(`pegar pratos sujos ${na(t)} (${t.sujos})`, t, 'pegar_sujos')
        if (t.ch === 'B' && it && it.tipo === 'ing' && !it.picado && PICAVEL.has(it.nome)) add(`picar ${it.nome} ${na(t)}`, t, 'picar')
        if (t.ch === 'S' && t.sujos > 0) add(`lavar pratos na pia (${t.sujos} sujos)`, t, 'lavar')
        // panela/frigideira só sai do fogo pronta (para servir) ou queimada (para jogar fora)
        const podePegar = it && !((it.tipo === 'panela' || it.tipo === 'frigideira') && !['pronta', 'queimada', 'queimando'].includes(it.estado)) && !(t.ch === 'B' && it.tipo === 'ing' && !it.picado && PICAVEL.has(it.nome))
        if (podePegar) add(`pegar ${descItem(it)} ${da(t)}`, t, 'pegar')
      } else {
        // com algo na mão
        if (mao.tipo === 'ing') {
          if (t.ch === 'B' && !it && PICAVEL.has(mao.nome) && !mao.picado) add(`pôr ${descItem(mao)} ${na(t)} para picar`, t, 'largar')
          if (t.ch === 'F' && it && SOPA.has(mao.nome) && mao.picado && it.conteudo.length < 3 && it.estado !== 'queimada') add(`pôr ${descItem(mao)} na panela ${da(t)} (${it.conteudo.length}/3)`, t, 'na_panela')
          if (t.ch === 'G' && it && mao.nome === 'carne' && mao.picado && !mao.grelhado && it.conteudo.length === 0) add(`pôr carne picada na frigideira ${da(t)}`, t, 'na_panela')
          if (it && it.tipo === 'prato' && !it.sujo && !it.conteudo.some((x) => x.startsWith('sopa'))) add(`pôr ${descItem(mao)} no prato ${da(t)}`, t, 'no_prato')
        }
        if (mao.tipo === 'prato' && !mao.sujo) {
          if ((t.ch === 'F' || t.ch === 'G') && it && it.estado === 'pronta' && !mao.conteudo.length) add(`servir ${it.tipo === 'panela' ? sopaDe(it) : 'carne grelhada'} ${da(t)} no prato`, t, 'servir')
          if (t.ch === 'G' && it && it.estado === 'pronta' && mao.conteudo.length && !mao.conteudo.includes('carne grelhada')) add(`pôr a carne grelhada ${da(t)} no prato`, t, 'servir')
          if (t.ch === 'E' && mao.conteudo.length) add(`ENTREGAR ${descItem(mao)} no passa-prato`, t, 'entregar')
          if (it && it.tipo === 'ing' && (it.picado || it.grelhado || it.nome === 'pão') && t.ch !== 'B') add(`pôr ${descItem(it)} ${da(t)} no prato`, t, 'pegar_no_prato')
          if (t.ch === 'B' && it && it.tipo === 'ing' && (it.picado || it.nome === 'pão')) add(`pôr ${descItem(it)} ${da(t)} no prato`, t, 'pegar_no_prato')
        }
        if (mao.tipo === 'prato' && mao.sujo && t.ch === 'S') add(`pôr pratos sujos na pia`, t, 'na_pia')
        if ((mao.tipo === 'panela' || mao.tipo === 'frigideira')) {
          if (t.ch === (mao.tipo === 'panela' ? 'F' : 'G') && !it) add(`devolver a ${mao.tipo} ${MASC.test(t.nome) ? 'ao' : 'à'} ${t.nome}`, t, 'largar')
          if (it && it.tipo === 'prato' && !it.sujo && mao.estado === 'pronta' && !it.conteudo.length) add(`servir no prato ${da(t)}`, t, 'servir_no_prato')
        }
        if (mao.tipo === 'extintor' && t.fogo) add(`APAGAR O FOGO ${na(t)}`, t, 'apagar')
        if (t.ch === 'L' && mao.tipo !== 'extintor') add(`jogar ${descItem(mao)} no lixo`, t, 'lixo')
        if (t.ch === '#' && !it && !t.fogo) ops.push({txt: null, alvo: t, faz: 'largar'})
      }
    }
    // largar: só a bancada livre mais perto e as da divisória (para passar ao parceiro)
    const livres = ops.filter((o) => o.txt === null)
    const out = ops.filter((o) => o.txt !== null)
    if (livres.length) {
      livres.sort((a, b) => distancia(c, ch.pos, a.alvo) - distancia(c, ch.pos, b.alvo))
      out.push({...livres[0], txt: `largar ${descItem(mao)} na bancada livre mais perto (${livres[0].alvo.nome})`})
      for (const l of livres.filter((l) => (this.fase.divisoria ?? []).includes(l.alvo.nome)).slice(0, 2))
        if (l !== livres[0]) out.push({...l, txt: `largar ${descItem(mao)} ${na(l.alvo)} (divisória, o parceiro alcança)`})
    }
    out.push({txt: 'esperar', alvo: null, faz: 'esperar'})
    // ordena por distância para a lista ficar natural
    return out.map((o) => ({...o, dist: o.alvo ? distancia(c, ch.pos, o.alvo) : 0})).sort((a, b) => a.dist - b.dist)
  }

  // ---- texto que a IA recebe
  prompt(ch, ops, placar) {
    const c = this.c
    const resta = (this.fase.duracao - this.tique) * TICK_S
    const L = []
    L.push(`TEMPO RESTANTE: ${Math.floor(resta / 60)}:${String(resta % 60).padStart(2, '0')}  |  Pontos da sua cozinha: ${this.pontos}`)
    if (placar) L.push(`PLACAR DAS COZINHAS: ${placar}`)
    L.push(`Você está segurando: ${descItem(ch.mao)}.`)
    for (const o of this.chefs.filter((x) => x !== ch)) {
      const perto = c.tiles.filter((t) => Math.abs(t.x - o.pos.x) + Math.abs(t.y - o.pos.y) === 1).map((t) => t.nome).slice(0, 2).join(' / ')
      L.push(`${o.nome} (${EMPRESAS[o.provider].nome}) está perto de ${perto || 'meio da cozinha'}, segurando ${descItem(o.mao)}.${o.falou ? ` Ele acabou de dizer: "${o.falou}"` : ''}`)
    }
    L.push('')
    L.push('PEDIDOS (entregue antes do tempo acabar; pedido que expira tira 10 pontos):')
    if (!this.pedidos.length) L.push('- nenhum no momento')
    for (const p of this.pedidos) {
      const s = (p.ate - this.tique) * TICK_S
      L.push(`- ${p.receita} (${RECEITAS[p.receita].como}): ${s}s restantes${s <= 12 ? ' ⚠️ QUASE EXPIRANDO!!!' : ''}`)
    }
    L.push('')
    L.push('ESTAÇÕES (com a distância em segundos até você):')
    for (const t of c.tiles) {
      if (t.ch === '#' && !t.item && !t.fogo) continue
      const d = distancia(c, ch.pos, t)
      if (d >= 99 && t.ch === '#') continue
      let st = t.nome
      if (t.ch === 'B') st += `: ${t.item ? descItem(t.item) + (t.item.picado ? '' : t.picando ? ` (${Math.round((100 * t.picando) / PICAR)}% picado)` : '') : 'vazia'}`
      else if (t.ch === 'F' || t.ch === 'G') st += `: ${t.item ? descItem(t.item) : 'sem panela'}`
      else if (t.ch === 'D') st += `: ${t.pratos} pratos limpos`
      else if (t.ch === 'R' || t.ch === 'S') st += `: ${t.sujos} pratos sujos`
      else if (t.item) st += `: ${descItem(t.item)}`
      if (t.fogo) st += ' 🔥 PEGANDO FOGO'
      L.push(`- ${st} | ${d >= 99 ? 'fora do seu alcance (lado do parceiro)' : `${((d / VEL) * TICK_S).toFixed(1)}s`}`)
    }
    L.push('')
    L.push('O que aconteceu há pouco:')
    for (const m of ch.mem.slice(-5)) L.push(`- ${m}`)
    L.push('')
    L.push('AÇÕES POSSÍVEIS AGORA (escolha UMA, copie o texto exato):')
    for (const o of ops) L.push(`- ${o.txt}`)
    L.push('')
    L.push('Responda só com JSON: {"acao": "<texto exato de uma ação>", "fala": "<frase curta pro seu parceiro, como numa partida de verdade; CAIXA ALTA se for gritar; ou vazio>", "pensa": "<seu pensamento secreto, curto>"}')
    return L.join('\n')
  }

  sistema(ch) {
    const parceiros = this.chefs.filter((x) => x !== ch).map((x) => `${x.nome} (${EMPRESAS[x.provider].nome})`).join(', ')
    return [
      `Você é ${ch.nome}, um chef numa cozinha caótica, jogando um jogo de cozinha cooperativo em tempo real (estilo Overcooked). Você é uma IA da ${EMPRESAS[ch.provider].nome} (${EMPRESAS[ch.provider].modelo}).`,
      `Você divide a cozinha com: ${parceiros}.${this.rival ? ' Outras cozinhas, de outras empresas de IA, estão competindo com a sua ao mesmo tempo: o placar está na tela.' : ''}`,
      'Regras: ingredientes saem das caixas; tomate, cebola, cogumelo, alface e carne precisam ser PICADOS na tábua; sopa = 3 ingredientes picados iguais na panela, cozinha sozinha e depois é servida num prato; a panela pronta QUEIMA se ficar no fogo e pega FOGO, que se espalha: use o extintor. Pratos prontos vão para o passa-prato. Você só carrega uma coisa por vez.',
      'O relógio NÃO para. Cada turno são 2 segundos. Os clientes estão com pressa e pedido expirado tira pontos. Você está sob pressão: fale curto e direto com o parceiro como um jogador de verdade (combine quem faz o quê, cobre, reclame, comemore). Quando algo der muito errado ou certo, GRITE em CAIXA ALTA.',
      'Responda sempre só com o JSON pedido, em português do Brasil.',
    ].join('\n')
  }

  // ---- executa as ações de um tique
  executar(escolhas) {
    const c = this.c
    const ordem = [...this.chefs].sort(() => this.rand() - 0.5)
    const quadro = {}
    for (const ch of ordem) {
      const e = escolhas.get(ch)
      const reg = {nome: ch.nome, de: {...ch.pos}, caminho: [{...ch.pos}], acao: e?.op?.txt ?? 'esperar', fala: e?.fala ?? '', pensa: e?.pensa ?? '', fez: null, bloqueado: null}
      quadro[ch.nome] = reg
      ch.falou = e?.fala ?? ''
      const op = e?.op
      if (!op || op.faz === 'esperar' || !op.alvo) continue
      const ocupado = new Set(this.chefs.filter((o) => o !== ch).map((o) => k(o.pos)))
      let rota = caminho(c, ch.pos, op.alvo, ocupado)
      if (!rota) {
        // bloqueado: anda o quanto der pelo caminho livre e fica preso atrás do outro chef
        const livre = caminho(c, ch.pos, op.alvo, new Set())
        if (livre) {
          const quem = this.chefs.find((o) => o !== ch && livre.some((p) => k(p) === k(o.pos)))
          const ate = livre.findIndex((p) => ocupado.has(k(p)))
          rota = livre.slice(0, Math.max(1, ate))
          reg.bloqueado = quem?.nome ?? null
          if (quem) { this.lembrar(ch, `${quem.nome} ficou NO MEU CAMINHO e eu não consegui passar.`); this.evento('esbarrao', {quem: ch.nome, por: quem.nome}) }
        } else rota = [ch.pos]
      }
      const passos = rota.slice(1, VEL + 1)
      for (const p of passos) reg.caminho.push({...p})
      if (passos.length) ch.pos = {...passos[passos.length - 1]}
      const chegou = !reg.bloqueado && rota.length - 1 <= VEL
      if (!chegou) { reg.fez = 'andando'; continue }
      reg.fez = this.interagir(ch, op)
    }
    return quadro
  }

  interagir(ch, op) {
    const t = op.alvo, it = t.item
    const msg = (s) => { this.lembrar(ch, s); return s }
    if (t.fogo && op.faz !== 'apagar') return msg(`Não deu: ${t.nome} está pegando fogo.`)
    switch (op.faz) {
      case 'pegar_caixa': ch.mao = {tipo: 'ing', nome: CAIXAS[t.ch], picado: false}; this.evento('pegou', {quem: ch.nome, o: CAIXAS[t.ch]}); return `pegou ${CAIXAS[t.ch]}`
      case 'pegar_prato': if (t.pratos <= 0) return msg('Acabaram os pratos limpos!'); t.pratos--; ch.mao = {tipo: 'prato', sujo: false, conteudo: []}; return 'pegou prato'
      case 'pegar_sujos': if (t.sujos <= 0) return 'nada'; ch.mao = {tipo: 'prato', sujo: true, conteudo: [], n: t.sujos}; t.sujos = 0; return 'pegou pratos sujos'
      case 'pegar': if (!it) return msg(`${t.nome} já estava vazia.`); ch.mao = it; t.item = null; if (t.ch === 'B') t.picando = 0; return `pegou ${descItem(it)}`
      case 'largar':
        if (it) return msg(`${t.nome} já estava ocupada.`)
        t.item = ch.mao; ch.mao = null; if (t.ch === 'B') t.picando = 0
        this.evento('largou', {quem: ch.nome, o: descItem(t.item), onde: t.nome}); return `largou em ${t.nome}`
      case 'picar':
        if (!it || it.tipo !== 'ing' || it.picado) return 'nada pra picar'
        t.picando++; this.evento('picando', {quem: ch.nome, onde: t.nome})
        if (t.picando >= PICAR) { it.picado = true; t.picando = 0; this.evento('picou', {quem: ch.nome, o: it.nome}); return `picou ${it.nome}` }
        return 'picando'
      case 'na_panela':
        if (!it || (it.tipo === 'panela' && it.conteudo.length >= 3)) return msg('A panela já estava cheia.')
        it.conteudo.push(ch.mao); ch.mao = null; if (it.estado === 'vazia') it.estado = 'enchendo'
        this.evento('na_panela', {quem: ch.nome, onde: t.nome, n: it.conteudo.length}); return `pôs na panela (${it.conteudo.length})`
      case 'no_prato': {
        if (!it || it.tipo !== 'prato') return 'sem prato'
        it.conteudo.push(descItem(ch.mao)); ch.mao = null; return 'montou no prato'
      }
      case 'pegar_no_prato': {
        if (!it) return msg(`${t.nome} já estava vazia.`)
        ch.mao.conteudo.push(descItem(it)); t.item = null; return 'pôs no prato'
      }
      case 'servir': {
        if (!it || it.estado !== 'pronta') return msg('Não estava pronta.')
        ch.mao.conteudo.push(it.tipo === 'panela' ? sopaDe(it) : 'carne grelhada')
        it.conteudo = []; it.prog = 0; it.estado = 'vazia'
        this.evento('serviu', {quem: ch.nome, onde: t.nome}); return 'serviu no prato'
      }
      case 'servir_no_prato': {
        if (!it || it.tipo !== 'prato') return 'sem prato'
        it.conteudo.push(ch.mao.tipo === 'panela' ? sopaDe(ch.mao) : 'carne grelhada')
        ch.mao.conteudo = []; ch.mao.prog = 0; ch.mao.estado = 'vazia'; return 'serviu no prato'
      }
      case 'entregar': {
        const prato = conteudoPrato(ch.mao)
        const p = this.pedidos.find((x) => igual([...RECEITAS[x.receita].prato].sort(), prato))
        ch.mao = null
        this.retornos.push({em: this.tique + 4})
        if (!p) { this.evento('recusado', {quem: ch.nome, prato: prato.join(' + ')}); this.lembrarTodos(`${ch.nome} entregou um prato que ninguém pediu (${prato.join(' + ')}): recusado, zero pontos.`); return 'prato recusado' }
        const frac = (p.ate - this.tique) / p.tempo
        const gorjeta = frac > 0.66 ? 8 : frac > 0.33 ? 5 : 2
        this.pedidos = this.pedidos.filter((x) => x !== p)
        this.pontos += RECEITAS[p.receita].base + gorjeta
        this.entregues++
        this.evento('entregou', {quem: ch.nome, receita: p.receita, pontos: RECEITAS[p.receita].base + gorjeta, gorjeta})
        this.lembrarTodos(`${ch.nome} ENTREGOU ${p.receita}: +${RECEITAS[p.receita].base} e gorjeta de ${gorjeta}.`)
        return `entregou ${p.receita}`
      }
      case 'na_pia': t.sujos += ch.mao.n ?? 1; ch.mao = null; return 'pôs pratos na pia'
      case 'lavar': {
        t.lavando++
        if (t.lavando >= LAVAR) { t.lavando = 0; t.sujos--; const d = this.c.tiles.find((x) => x.ch === 'D'); if (d) d.pratos++; this.evento('lavou', {quem: ch.nome}); return 'lavou um prato' }
        return 'lavando'
      }
      case 'apagar': {
        const alvos = this.c.tiles.filter((x) => x.fogo && Math.abs(x.x - t.x) + Math.abs(x.y - t.y) <= 1)
        for (const a of alvos) { a.fogo = false; if (a.item?.estado === 'queimada') {/* continua queimada */} }
        this.evento('apagou', {quem: ch.nome, onde: t.nome, n: alvos.length}); this.lembrarTodos(`${ch.nome} apagou o fogo em ${t.nome}.`)
        return 'apagou o fogo'
      }
      case 'lixo': {
        const m = ch.mao
        if (m.tipo === 'panela' || m.tipo === 'frigideira') { m.conteudo = []; m.prog = 0; m.estado = 'vazia' }
        else if (m.tipo === 'prato') { m.conteudo = [] }
        else ch.mao = null
        this.evento('lixo', {quem: ch.nome, o: descItem(m)}); return 'jogou no lixo'
      }
    }
    return 'nada'
  }

  estado() {
    return {
      tique: this.tique, pontos: this.pontos,
      pedidos: this.pedidos.map((p) => ({id: p.id, receita: p.receita, resta: p.ate - this.tique, tempo: p.tempo})),
      chefs: this.chefs.map((ch) => ({nome: ch.nome, pos: {...ch.pos}, mao: ch.mao ? descItem(ch.mao) : null, obj: ch.mao ? JSON.parse(JSON.stringify(ch.mao)) : null})),
      tiles: this.c.tiles.filter((t) => t.item || t.fogo || t.ch === 'D' || t.ch === 'R' || t.ch === 'S' || t.ch === 'B').map((t) => ({x: t.x, y: t.y, item: t.item ? descItem(t.item) : null, obj: t.item ? JSON.parse(JSON.stringify(t.item)) : null, fogo: t.fogo, pratos: t.pratos, sujos: t.sujos, picando: t.picando})),
    }
  }
}

// ---------------------------------------------------------------- a rodada: várias cozinhas (versus) ou uma (coop)
function escolherOp(ops, txt) {
  if (!txt) return null
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
  const a = norm(txt)
  return ops.find((o) => norm(o.txt) === a) ?? ops.find((o) => norm(o.txt).startsWith(a) || a.startsWith(norm(o.txt))) ?? null
}

async function rodar() {
  const [faseId, modo, nomeArq] = process.argv.slice(2)
  const fase = FASES[faseId] && {...FASES[faseId], ...(process.env.DURACAO ? {duracao: Number(process.env.DURACAO)} : {})}
  if (!fase) throw new Error(`fase ${faseId} não existe: ${Object.keys(FASES).join(', ')}`)
  const mock = modo.startsWith('mock')
  const versus = modo.endsWith('versus')
  const seed = Number(process.env.SEED ?? crypto.randomInt(1e9))
  const NOMES = {deepseek: ['Deep', 'Seek'], haiku: ['Claudinho', 'Claudete'], 'or:openai/gpt-5.6-luna': ['Gepeto', 'Gepeta'], 'or:google/gemini-3.8-flash': ['Gêmeo', 'Gêmea']}
  let partidas
  if (versus) partidas = PROVS.map((p) => new Partida({fase, nome: EMPRESAS[p].nome, seed, rival: true, chefs: [0, 1].map((i) => ({nome: NOMES[p][i], provider: p}))}))
  else {
    const ordem = [...PROVS].sort(() => Math.random() - 0.5)
    partidas = [new Partida({fase, nome: 'Todas', seed, chefs: ordem.map((p) => ({nome: NOMES[p][0], provider: p}))})]
  }
  const log = {fase: faseId, modo, seed, tickS: TICK_S, mapa: partidas[0].c.mapa, receitas: fase.receitas, duracao: fase.duracao,
    cozinhas: partidas.map((pt) => ({nome: pt.nome, chefs: pt.chefs.map((c) => ({nome: c.nome, provider: c.provider, empresa: EMPRESAS[c.provider].nome, modelo: EMPRESAS[c.provider].modelo, inicio: {...c.pos}}))})),
    tiques: []}
  console.log(`🍳 ${fase.titulo} · ${modo} · semente ${seed}`)
  for (let tq = 0; tq < fase.duracao; tq++) {
    for (const pt of partidas) { pt.tique = tq; pt.atualizarPedidos() }
    const placar = versus ? partidas.map((p) => `${p.nome} ${p.pontos}`).join(' | ') : null
    const reqs = []
    for (const pt of partidas) for (const ch of pt.chefs) {
      const ops = pt.acoes(ch)
      reqs.push((async () => {
        let op = null, fala = '', pensa = ''
        if (mock) op = ops[Math.floor(Math.random() * ops.length)]
        else {
          const r = await perguntar(ch.provider, pt.sistema(ch), pt.prompt(ch, ops, placar), {maxTokens: 220})
          const j = lerJSON(r.text)
          op = escolherOp(ops, j?.acao)
          fala = String(j?.fala ?? '').slice(0, 160)
          pensa = String(j?.pensa ?? '').slice(0, 300)
          if (!op && j?.acao) pt.lembrar(ch, `Sua última resposta ("${String(j.acao).slice(0, 60)}") não era uma das ações da lista, então você ficou parado.`)
        }
        return [pt, ch, {op, fala, pensa}]
      })())
    }
    const res = await Promise.all(reqs)
    const linha = {tique: tq, cozinhas: []}
    for (const pt of partidas) {
      const esc = new Map(res.filter((r) => r[0] === pt).map((r) => [r[1], r[2]]))
      const ev0 = pt.eventos.length
      const quadro = pt.executar(esc)
      pt.passarTempo()
      linha.cozinhas.push({nome: pt.nome, chefs: quadro, eventos: pt.eventos.slice(ev0), estado: pt.estado()})
    }
    log.tiques.push(linha)
    const resumo = partidas.map((p) => `${p.nome}:${p.pontos}`).join(' ')
    const falas = linha.cozinhas.flatMap((cz) => Object.values(cz.chefs).filter((c) => c.fala).map((c) => `${c.nome}: ${c.fala}`))
    console.log(`t${tq} ${resumo}${falas.length ? '  | ' + falas.slice(0, 4).join(' | ') : ''}`)
    if (!mock) fs.writeFileSync(path.join(DIR, 'logs', `${nomeArq ?? faseId + '_' + modo}.json`), JSON.stringify(log))
  }
  log.resultado = partidas.map((p) => ({nome: p.nome, pontos: p.pontos, entregues: p.entregues, expirados: p.expirados, fogos: p.fogos}))
  log.uso = uso
  fs.mkdirSync(path.join(DIR, 'logs'), {recursive: true})
  fs.writeFileSync(path.join(DIR, 'logs', `${nomeArq ?? faseId + '_' + modo}.json`), JSON.stringify(log))
  console.log('RESULTADO', JSON.stringify(log.resultado))
}

if (process.argv[1] && process.argv[1].endsWith('cozinha.mjs')) rodar().catch((e) => { console.error(e); process.exit(1) })
