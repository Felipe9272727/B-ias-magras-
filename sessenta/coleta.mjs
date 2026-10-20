// Fase de COLETA (60 s): o jogador controla o pai numa casa de grade e tem 30 tiques de 2 s para levar o que puder
// para o abrigo (alçapão do corredor). A cada passo a IA recebe a lista de ações possíveis AGORA (textos exatos) e
// escolhe uma. Regras: docs/mecanica_coleta_itens.md (seção 1) e o enunciado do módulo.
// O tempo é contado em milissegundos inteiros (1 tique = 2000 ms) para não haver erro de ponto flutuante no fim.
import {ITENS, MAOS} from './itens.mjs'
import {FAMILIA} from './familia.mjs'
import {montarCasa, COMODOS, ABRIGO, andavel, comodoEm} from './casa.mjs'

export {MAOS}

export const TOTAL_TIQUES = 30      // 60 s no total
export const TIQUE_MS = 2000        // 1 tique = 2 s de jogo
// Velocidade de corrida: casas por tique. A wiki e as pesquisas NÃO dão número (pesquisa_coleta.md, "não está claro").
// Usamos 3 casas por tique, o modelo pedido (3 casas e pegar algo adjacente no mesmo tique). O enunciado também cita
// 5 como máximo de corrida: se quiser um pouco mais rápido, troque aqui e o resto se ajusta sozinho.
export const CASAS_POR_TIQUE = 3
export const CUSTO_PEGAR_MS = 1000  // pegar algo ao alcance (mesma casa ou vizinha de 4 direções): 0,5 tique (decisão)
export const CUSTO_LARGAR_MS = 1000 // largar no chão ou no abrigo: 0,5 tique (decisão)

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

// artigo de cada item e de cada cômodo, para os textos ("a lata de sopa", "o rádio", "na Cozinha", "no Corredor")
const ART_ITEM = {
  sopa: 'a', agua: 'a', radio: 'o', mapa: 'o', mascara: 'a', kit: 'o', rifle: 'o', machado: 'o', lanterna: 'a',
  cadeado: 'o', inseticida: 'o', mala: 'a', baralho: 'o', damas: 'o', gaita: 'a', manual: 'o', municao: 'a',
}
const ART_COMODO = {garagem: 'a', cozinha: 'a', sala: 'a', corredor: 'o', quarto: 'o', banheiro: 'o', criancas: 'o', despensa: 'a'}

const dist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
const custoPassos = (n) => Math.ceil((n * TIQUE_MS) / CASAS_POR_TIQUE)
const custoRota = (rota) => custoPassos(rota.length - 1)
const comodoDe = (p) => comodoEm(p.x, p.y) // id do cômodo, 'porta' para as portas
const noAbrigo = (c) => c.pai.x === ABRIGO.x && c.pai.y === ABRIGO.y
const ocupado = (c) => c.maos.reduce((s, o) => s + o.espaco, 0)
const livre = (c) => MAOS - ocupado(c)
const restanteMs = (c) => c.totalMs - c.gasto
const terminada = (c) => c.gasto >= c.totalMs

function lugarTxt(p) {
  const id = comodoDe(p)
  if (!id || id === 'porta') return 'na porta'
  return `${ART_COMODO[id] === 'a' ? 'na' : 'no'} ${COMODOS[id].nome}`
}
const comodoTxt = (id) => `${ART_COMODO[id]} ${COMODOS[id].nome}`
const seg = (ms) => (ms / 1000).toFixed(1).replace('.', ',')

// uma coisa da casa: 'item' (uid = id, ou id + número quando há várias iguais) ou 'pessoa' (uid = id da pessoa)
function criarCoisa(tipo, id, uid, x, y) {
  if (tipo === 'pessoa') {
    const f = FAMILIA.find((f) => f.id === id)
    return {tipo, id, uid, rotulo: `${f.nome} (${f.papel})`, espaco: f.espaco, x, y}
  }
  const n = uid !== id ? ` (${uid.slice(id.length)})` : '' // sopa1..sopa8 → "(1)".."(8)"
  return {tipo, id, uid, rotulo: `${ART_ITEM[id]} ${ITENS[id].nome}${n}`, espaco: ITENS[id].espaco, x, y}
}
const semPosicao = ({x, y, ...resto}) => resto

// ---------------------------------------------------------------- criação
// Estado da coleta. Campos: casa (planta + sorteio), pai {x,y}, maos [coisas], chao [coisas que ainda estão na casa],
// abrigo [coisas que já foram levadas], vistos [uids que o pai já viu], visitados [cômodos onde ele já esteve],
// gasto (ms), tique (tiques já gastos, 0..30), log [um registro por ação].
export function criarColeta(semente, opcoes = {}) {
  const casa = montarCasa(semente)
  const chao = [
    ...casa.itens.map((it) => criarCoisa('item', it.id, it.uid, it.x, it.y)),
    ...casa.pessoas.filter((p) => p.x !== undefined).map((p) => criarCoisa('pessoa', p.id, p.id, p.x, p.y)),
  ]
  const c = {
    semente,
    casa,
    totalTiques: opcoes.totalTiques ?? TOTAL_TIQUES,
    totalMs: (opcoes.totalTiques ?? TOTAL_TIQUES) * TIQUE_MS,
    pai: {x: casa.inicio.x, y: casa.inicio.y}, // o pai começa na sala (INICIO)
    maos: [],
    chao,
    abrigo: [],
    vistos: [],
    visitados: [],
    gasto: 0,
    tique: 0,
    log: [],
  }
  observar(c)
  return c
}

// o pai vê tudo no cômodo onde está e o que está ao lado (4 direções); guarda na memória (vistos)
function observar(c) {
  const sala = comodoDe(c.pai)
  if (sala !== 'porta' && !c.visitados.includes(sala)) c.visitados.push(sala)
  for (const o of c.chao) {
    if (c.vistos.includes(o.uid)) continue
    const mesmoComodo = sala !== 'porta' && comodoDe(o) === sala
    if (mesmoComodo || dist(o, c.pai) <= 1) c.vistos.push(o.uid)
  }
}

function avancar(c, ms) {
  c.gasto += ms
  c.tique = Math.floor(c.gasto / TIQUE_MS)
}

// caminho mais curto (BFS, 4 direções) do pai até a PRIMEIRA casa que satisfaz `alvo`; a lista inclui a casa atual
// e o destino. null se não houver caminho.
function rotaAte(c, alvo) {
  const chave = (p) => `${p.x},${p.y}`
  const vindo = new Map([[chave(c.pai), null]])
  const fila = [{x: c.pai.x, y: c.pai.y}]
  let achou = null
  for (let i = 0; i < fila.length && !achou; i++) {
    const p = fila[i]
    if (alvo(p)) { achou = p; break }
    for (const [dx, dy] of DIRS) {
      const q = {x: p.x + dx, y: p.y + dy}
      if (andavel(q.x, q.y) && !vindo.has(chave(q))) { vindo.set(chave(q), p); fila.push(q) }
    }
  }
  if (!achou) return null
  const rota = []
  for (let p = achou; p; p = vindo.get(chave(p))) rota.unshift({x: p.x, y: p.y})
  return rota
}

// ---------------------------------------------------------------- ações
// Lista completa de ações válidas AGORA, com tipo, texto, custo (ms) e dados para aplicar. Só entra ação que termina
// dentro do tempo que resta. Ordem: pegar, correr até coisa (da mais perto), explorar cômodo, abrigo, largar, parado.
export function acoesDetalhadas(c) {
  const restante = restanteMs(c)
  if (restante <= 0) return []
  const acoes = []
  const espaco = livre(c)
  const vistas = c.chao.filter((o) => c.vistos.includes(o.uid))

  // pegar o que está ao alcance (mesma casa ou vizinha) e que cabe nas mãos
  for (const o of vistas) {
    if (dist(o, c.pai) <= 1 && o.espaco <= espaco && CUSTO_PEGAR_MS <= restante)
      acoes.push({tipo: 'pegar', texto: `pegar ${o.rotulo}`, custo: CUSTO_PEGAR_MS, uid: o.uid})
  }

  // correr até uma coisa vista (para na casa vizinha dela, de onde dá para pegar), se cabe nas mãos e dá tempo de pegar
  const correr = []
  for (const o of vistas) {
    if (dist(o, c.pai) <= 1 || o.espaco > espaco) continue
    const rota = rotaAte(c, (p) => dist(p, o) <= 1)
    if (!rota) continue
    const custo = custoRota(rota)
    if (custo + CUSTO_PEGAR_MS > restante) continue
    correr.push({tipo: 'correr', texto: `correr até ${o.rotulo} ${lugarTxt(o)}`, rota, custo, uid: o.uid})
  }

  // explorar: correr até um cômodo onde o pai ainda não esteve (o que tiver lá aparece ao chegar)
  for (const id of Object.keys(COMODOS)) {
    if (c.visitados.includes(id)) continue
    const rota = rotaAte(c, (p) => comodoDe(p) === id)
    if (rota && custoRota(rota) <= restante)
      correr.push({tipo: 'explorar', texto: `correr até ${comodoTxt(id)}`, rota, custo: custoRota(rota)})
  }
  correr.sort((a, b) => a.custo - b.custo)
  acoes.push(...correr)

  // abrigo: ir até o alçapão, ou largar no abrigo (tudo ou uma coisa por vez)
  if (!noAbrigo(c)) {
    const rota = rotaAte(c, (p) => p.x === ABRIGO.x && p.y === ABRIGO.y)
    if (rota && custoRota(rota) <= restante)
      acoes.push({tipo: 'abrigo', texto: 'correr até o abrigo', rota, custo: custoRota(rota)})
  } else if (c.maos.length && CUSTO_LARGAR_MS <= restante) {
    acoes.push({tipo: 'depositar_tudo', texto: 'largar tudo no abrigo', custo: CUSTO_LARGAR_MS})
    for (const o of c.maos)
      acoes.push({tipo: 'depositar', texto: `largar ${o.rotulo} no abrigo`, custo: CUSTO_LARGAR_MS, uid: o.uid})
  }

  // largar no chão (libera espaço; a coisa fica na casa e pode ser pega de novo). Não se larga em cima do alçapão.
  if (!noAbrigo(c) && CUSTO_LARGAR_MS <= restante) {
    for (const o of c.maos)
      acoes.push({tipo: 'largar', texto: `largar ${o.rotulo}`, custo: CUSTO_LARGAR_MS, uid: o.uid})
  }

  // esperar o relógio acabar (é a única forma de encerrar a coleta antes da bomba)
  acoes.push({tipo: 'parado', texto: 'ficar parado até o fim', custo: restante})
  return acoes
}

export function acoesPossiveis(c) {
  return acoesDetalhadas(c).map((a) => a.texto)
}

// tempo (ms) para voltar ao alçapão a partir de onde o pai está agora; 0 se já está nele
export function tempoAteAbrigo(c) {
  if (noAbrigo(c)) return 0
  const rota = rotaAte(c, (p) => p.x === ABRIGO.x && p.y === ABRIGO.y)
  return rota ? custoRota(rota) : null
}

// executa uma ação (o texto tem que ser EXATAMENTE um dos textos de acoesPossiveis, senão lança erro).
// Registra no log do tique e devolve o registro: {tique, acao, de, para, rota, pegou, largou, maos, tempoMs}.
export function aplicar(c, texto) {
  const pedido = String(texto ?? '').trim()
  const a = acoesDetalhadas(c).find((x) => x.texto === pedido)
  if (!a) throw new Error(`ação não é válida agora: "${pedido}"`)
  const de = {x: c.pai.x, y: c.pai.y, comodo: comodoDe(c.pai)}
  const tique = c.tique
  const pegou = []
  const largou = []
  const uids = [] // ids exatos do que foi pego/largado (para a animação do vídeo)

  switch (a.tipo) {
    case 'pegar': {
      const i = c.chao.findIndex((o) => o.uid === a.uid)
      const [o] = c.chao.splice(i, 1)
      c.maos.push(semPosicao(o))
      pegou.push(o.rotulo)
      uids.push(o.uid)
      break
    }
    case 'correr':
    case 'explorar':
    case 'abrigo': {
      const fim = a.rota[a.rota.length - 1]
      c.pai = {x: fim.x, y: fim.y}
      break
    }
    case 'largar': {
      const i = c.maos.findIndex((o) => o.uid === a.uid)
      const [o] = c.maos.splice(i, 1)
      c.chao.push({...o, x: c.pai.x, y: c.pai.y})
      largou.push(o.rotulo)
      uids.push(o.uid)
      break
    }
    case 'depositar': {
      const i = c.maos.findIndex((o) => o.uid === a.uid)
      const [o] = c.maos.splice(i, 1)
      c.abrigo.push(o)
      largou.push(`${o.rotulo} (no abrigo)`)
      uids.push(o.uid)
      break
    }
    case 'depositar_tudo':
      for (const o of c.maos.splice(0)) { c.abrigo.push(o); largou.push(`${o.rotulo} (no abrigo)`); uids.push(o.uid) }
      break
    case 'parado':
      break
  }
  avancar(c, a.custo)
  observar(c)
  const registro = {
    tique,
    acao: a.texto,
    de,
    para: {x: c.pai.x, y: c.pai.y, comodo: comodoDe(c.pai)},
    rota: a.rota ? a.rota.map((p) => ({x: p.x, y: p.y})) : null,
    pegou,
    largou,
    maos: c.maos.map((o) => o.rotulo),
    maosUids: c.maos.map((o) => o.uid),
    uids,
    tipo: a.tipo,
    tempoMs: c.gasto,
  }
  c.log.push(registro)
  return registro
}

// ---------------------------------------------------------------- texto para a IA
// resume uma lista de coisas: pessoas pelo nome e itens agrupados por tipo ("3 × lata de sopa")
function resumo(lista) {
  const pessoas = lista.filter((o) => o.tipo === 'pessoa').map((o) => o.rotulo)
  const cont = {}
  for (const o of lista) if (o.tipo === 'item') cont[o.id] = (cont[o.id] ?? 0) + 1
  const itens = Object.entries(cont).map(([id, n]) => (n > 1 ? `${n} × ${ITENS[id].nome}` : ITENS[id].nome))
  return [...pessoas, ...itens]
}

// texto curto em português: tempo, onde está, mãos, abrigo, o que foi visto (com distância em segundos) e a volta
export function descrever(c) {
  const linhas = []
  linhas.push(`Tempo restante: ${Math.ceil(restanteMs(c) / 1000)} s (tique ${c.tique} de ${c.totalTiques}).`)
  linhas.push(noAbrigo(c) ? 'Você está no alçapão do abrigo.' : `Você está ${lugarTxt(c.pai)}.`)
  linhas.push(c.maos.length
    ? `Nas mãos: ${c.maos.map((o) => o.rotulo).join(', ')}. Espaço livre: ${livre(c)} de ${MAOS}.`
    : `Mãos vazias: ${MAOS} espaços livres.`)
  const abrigo = resumo(c.abrigo)
  linhas.push(`No abrigo: ${abrigo.length ? abrigo.join(', ') : 'ainda nada'}.`)

  const vistas = c.chao.filter((o) => c.vistos.includes(o.uid))
  if (!vistas.length) linhas.push('Vistos na casa: nada ainda.')
  else {
    linhas.push('Vistos na casa (distância a partir de onde você está):')
    for (const o of vistas) {
      let dica
      if (dist(o, c.pai) <= 1) dica = 'ao alcance, pegar leva 1 s'
      else {
        const rota = rotaAte(c, (p) => dist(p, o) <= 1)
        dica = rota ? `${seg(custoRota(rota))} s para chegar perto, +1 s para pegar` : 'sem caminho'
      }
      if (o.espaco > livre(c)) dica += ` (não cabe: precisa de ${o.espaco} espaços, largue algo antes)`
      linhas.push(`- ${o.rotulo}, ${lugarTxt(o)}: ${dica}`)
    }
  }
  const naoVisitados = Object.keys(COMODOS).filter((id) => !c.visitados.includes(id))
  if (naoVisitados.length) linhas.push(`Cômodos que você ainda não viu: ${naoVisitados.map(comodoTxt).join(', ')}.`)
  const volta = tempoAteAbrigo(c)
  linhas.push(volta === 0 ? 'Você já está no abrigo.' : `Distância de volta ao abrigo: ${seg(volta)} s.`)
  return linhas.join('\n')
}

// ---------------------------------------------------------------- fim
// No fim do tempo: se o pai está no alçapão, ele e o que tem nas mãos entram. Se não, o pai fica fora (game over) e o
// que tinha nas mãos se perde. O que já estava no abrigo fica. Pessoas que não entraram ficam "perdidas" na casa.
// Devolve no formato que criarEstado (estado.mjs) espera: {pessoas, itens}, mais o resultado e o que ficou para trás.
export function fim(c) {
  if (!terminada(c)) throw new Error('a coleta ainda não acabou')
  const dentro = noAbrigo(c)
  const entraram = [...c.abrigo, ...(dentro ? c.maos : [])]
  const pessoas = entraram.filter((o) => o.tipo === 'pessoa').map((o) => o.id)
  if (dentro) pessoas.unshift('pai')
  const contar = (lista) => {
    const itens = {}
    for (const o of lista) if (o.tipo === 'item') itens[o.id] = (itens[o.id] ?? 0) + 1
    return itens
  }
  const deixados = [...c.chao, ...(dentro ? [] : c.maos)]
  const perdidas = FAMILIA.filter((f) => f.id !== 'pai' && !pessoas.includes(f.id)).map((f) => f.id)
  return {
    resultado: dentro ? 'ok' : 'pai ficou fora',
    pessoas,
    itens: contar(entraram),
    perdidas,
    itensDeixados: contar(deixados),
  }
}

export {terminada}
