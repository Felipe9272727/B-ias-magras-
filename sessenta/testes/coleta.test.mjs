// Teste da fase de coleta: roda partidas com escolhas aleatórias (rng próprio) e com uma estratégia gulosa, confere a
// cada ação que tudo é válido (nada some, mãos não estouram, passos são andáveis, o tempo só anda para frente) e
// imprime o que entrou no abrigo. Rodar: node sessenta/testes/coleta.test.mjs  (deve terminar com OK).
import assert from 'node:assert/strict'
import {criarRng} from '../rng.mjs'
import {
  criarColeta, acoesDetalhadas, acoesPossiveis, aplicar, descrever, fim, tempoAteAbrigo,
  MAOS, TIQUE_MS, CASAS_POR_TIQUE, CUSTO_PEGAR_MS, TOTAL_TIQUES,
} from '../coleta.mjs'
import {andavel, caminho, ABRIGO} from '../casa.mjs'

const MARGEM_MS = 10000 // a estratégia gulosa deixa 10 s de folga para voltar ao abrigo

// confere os invariantes depois de cada ação
function verificar(c, total) {
  const todas = [...c.chao, ...c.maos, ...c.abrigo].map((o) => o.uid)
  assert.equal(todas.length, total, 'coisas sumiram ou apareceram do nada')
  assert.equal(new Set(todas).size, total, 'uma coisa aparece em dois lugares')
  const espaco = c.maos.reduce((s, o) => s + o.espaco, 0)
  assert.ok(espaco <= MAOS, `mãos estouraram: ${espaco} de ${MAOS}`)
  assert.ok(andavel(c.pai.x, c.pai.y), `pai fora de casa andável em ${c.pai.x},${c.pai.y}`)
  assert.ok(c.gasto <= c.totalMs, 'passou do tempo')
  for (const o of c.chao) assert.ok(andavel(o.x, o.y), `${o.uid} largado em parede`)
  const ultimo = c.log.at(-1)
  if (ultimo) {
    assert.deepEqual({x: ultimo.para.x, y: ultimo.para.y}, {x: c.pai.x, y: c.pai.y}, 'log não bate com a posição')
    if (ultimo.rota) {
      assert.deepEqual(ultimo.rota[0], {x: ultimo.de.x, y: ultimo.de.y}, 'rota não começa onde o pai estava')
      for (let i = 1; i < ultimo.rota.length; i++) {
        const [a, b] = [ultimo.rota[i - 1], ultimo.rota[i]]
        assert.equal(Math.abs(a.x - b.x) + Math.abs(a.y - b.y), 1, 'passo na rota não é vizinho')
        assert.ok(andavel(b.x, b.y), 'rota passa por parede ou móvel')
      }
    }
  }
}

// estratégia gulosa: pega o que está mais perto que cabe; volta ao abrigo quando as mãos encheram ou o tempo acaba
const custoPassos = (n) => Math.ceil((n * TIQUE_MS) / CASAS_POR_TIQUE)
function gulosa(c) {
  const acoes = acoesDetalhadas(c)
  const restante = c.totalMs - c.gasto
  const naBase = c.pai.x === ABRIGO.x && c.pai.y === ABRIGO.y
  const achar = (tipo) => acoes.find((a) => a.tipo === tipo)
  if (naBase && c.maos.length) return achar('depositar_tudo').texto
  const volta = tempoAteAbrigo(c)
  const apertado = restante <= volta + MARGEM_MS
  const semColeta = !acoes.some((a) => a.tipo === 'pegar' || a.tipo === 'correr')
  if (!naBase && (apertado || (c.maos.length && semColeta))) return achar('abrigo').texto
  if (achar('pegar')) return achar('pegar').texto
  // corre até a coisa mais perto, se der tempo de pegar e voltar; depois explora, com a mesma conta
  for (const tipo of ['correr', 'explorar']) {
    for (const a of acoes.filter((x) => x.tipo === tipo)) {
      const destino = a.rota[a.rota.length - 1]
      const r = caminho(destino, ABRIGO)
      const ida = a.custo + CUSTO_PEGAR_MS + (r ? custoPassos(r.length - 1) : Infinity)
      if (ida + MARGEM_MS <= restante) return a.texto
    }
  }
  if (!naBase) return achar('abrigo').texto
  return achar('parado').texto
}

function partida(semente, estrategia) {
  const c = criarColeta(semente)
  const total = c.chao.length
  const rng = criarRng(semente, `teste-${estrategia}`)
  let passos = 0
  while (c.gasto < c.totalMs) {
    const opcoes = acoesPossiveis(c)
    assert.ok(opcoes.length > 0, 'sem nenhuma ação enquanto ainda há tempo')
    assert.equal(new Set(opcoes).size, opcoes.length, 'textos de ação repetidos')
    const escolha = estrategia === 'aleatoria' ? rng.escolher(opcoes) : gulosa(c)
    assert.ok(opcoes.includes(escolha), `escolha fora da lista: ${escolha}`)
    const antes = c.gasto
    aplicar(c, escolha)
    assert.ok(c.gasto > antes, `ação não gastou tempo: ${escolha}`)
    verificar(c, total)
    passos++
    assert.ok(passos < 500, 'partida não termina')
  }
  return {c, r: fim(c), passos}
}

function imprimir(semente, estrategia, {c, r, passos}) {
  const abrigo = c.abrigo.map((o) => o.rotulo)
  console.log(`- semente "${semente}", ${estrategia}: ${passos} ações, resultado: ${r.resultado}`)
  console.log(`  no abrigo: ${abrigo.length ? abrigo.join('; ') : 'nada'}`)
  console.log(`  pessoas que entraram: ${r.pessoas.join(', ') || 'nenhuma'}; perdidas na casa: ${r.perdidas.join(', ') || 'nenhuma'}`)
  console.log(`  itens: ${JSON.stringify(r.itens)}`)
}

// ---------------------------------------------------------------- casos fixos
{
  const c = criarColeta('teste')
  const texto = descrever(c)
  assert.match(texto, /Tempo restante: 60 s/)
  assert.match(texto, /Você está na Sala/)
  console.log('O que a IA vê no início (semente "teste"):')
  console.log(texto.split('\n').map((l) => `    ${l}`).join('\n'))
  assert.throws(() => aplicar(c, 'voar até a lua'), /não é válida/)
  assert.throws(() => fim(c), /ainda não acabou/)
}
{
  // a mesma semente gera a mesma casa e as mesmas ações possíveis no início
  const a = acoesPossiveis(criarColeta('mesma'))
  const b = acoesPossiveis(criarColeta('mesma'))
  assert.deepEqual(a, b)
  assert.equal(TOTAL_TIQUES, 30)
}
{
  // munição entra na casa (17 tipos de item, munição incluída)
  const c = criarColeta('municao')
  assert.ok(c.chao.some((o) => o.id === 'municao'), 'munição não foi colocada na casa')
}

// ---------------------------------------------------------------- partidas
const SEMENTES = ['teste', 'coleta-2', 'coleta-3', 'coleta-4', 'coleta-5']
let levouAlgo = 0
console.log('\nPartidas (estratégia aleatória e gulosa):')
for (const s of SEMENTES) {
  for (const estrategia of ['aleatoria', 'gulosa']) {
    const res = partida(s, estrategia)
    imprimir(s, estrategia, res)
    if (estrategia === 'gulosa' && res.c.abrigo.length) levouAlgo++
  }
}
// a gulosa tem que conseguir levar algo, senão a estratégia ou as regras estão travadas
assert.ok(levouAlgo >= SEMENTES.length - 1, `a gulosa levou algo em poucas partidas: ${levouAlgo}`)

// o registro de tique mostra a rota para animar
{
  const {c} = partida('teste', 'gulosa')
  const primeira = c.log.find((r) => r.rota && r.rota.length > 1)
  console.log(`\nExemplo de registro (semente "teste", primeira corrida):\n  ${JSON.stringify({tique: primeira.tique, acao: primeira.acao, de: primeira.de, para: primeira.para, passos: primeira.rota.length - 1})}`)
}

console.log('\nOK')
