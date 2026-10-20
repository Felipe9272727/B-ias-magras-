// Teste das cadeias, visitantes recorrentes, avulsos e finais. Sem framework:
//   node sessenta/testes/cadeias_finais.test.mjs     (imprime OK no fim)
// (1) cada evento, com estado rico e as flags do passo, resolve cada escolha sem exceção;
// (2) simulação de partidas de 200 dias com eventos válidos e escolhas aleatórias: confere que as cadeias
//     avançam e que algum final pode ser alcançado. Imprime quantos passos de cada cadeia apareceram.
import assert from 'node:assert/strict'
import {criarEstado, noAbrigo, pessoa} from '../estado.mjs'
import {criarRng} from '../rng.mjs'
import {EVENTOS} from '../eventos/cadeias.mjs'
import {FINAIS} from '../finais.mjs'

const FAM = ['pai', 'mae', 'filha', 'filho']
const ITENS_CHEIOS = {
  sopa: 9, agua: 9, radio: 1, mapa: 1, mascara: 1, kit: 1, rifle: 1, machado: 1, lanterna: 1, cadeado: 1,
  inseticida: 1, mala: 1, baralho: 1, damas: 1, gaita: 1, manual: 1,
}

// estado rico: todo mundo no abrigo, itens cheios, dia 60 (para as condições de dia)
function novo(p = {}) {
  const e = criarEstado('teste', {pessoas: FAM, itens: ITENS_CHEIOS})
  e.dia = 60
  Object.assign(e.flags, p.flags ?? {})
  Object.assign(e.itens, p.itens ?? {})
  for (const [id, mud] of Object.entries(p.pessoas ?? {})) Object.assign(pessoa(e, id), mud)
  return e
}

// flags e ajustes necessários para cada passo entrar em "quando" (eventos sem entrada não precisam de nada)
const PREPARO = {
  militar_1: {flags: {'cadeia.militar': 1}},
  militar_2: {flags: {'cadeia.militar': 2}},
  militar_3: {flags: {'cadeia.militar': 3}},
  militar_4: {flags: {'cadeia.militar': 4}},
  militar_5: {flags: {'cadeia.militar': 5, 'cadeia.militar.encontro': 40}},
  bandidos_0: {flags: {}},
  bandidos_1: {flags: {'cadeia.bandidos': 1}},
  bandidos_2: {flags: {'cadeia.bandidos': 1, 'cadeia.bandidos.bairro': true}},
  radio_espaco_1: {flags: {}},
  radio_espaco_2: {flags: {'cadeia.radio_espaco': 2}},
  radio_espaco_3: {flags: {'cadeia.radio_espaco': 3}},
  radio_espaco_4: {flags: {'cadeia.radio_espaco': 4}},
  gemeos_1: {flags: {}},
  gemeos_2: {flags: {'cadeia.gemeos': 2}},
  gemeos_3: {flags: {'cadeia.gemeos': 3}},
  gemeos_4: {flags: {'cadeia.gemeos': 4}},
  gemeos_5: {flags: {'cadeia.gemeos': 5}},
  lado_sombrio_1: {flags: {}},
  lado_sombrio_2: {flags: {}},
  lado_sombrio_3: {flags: {}},
  gatos_1: {flags: {}},
  gatos_2: {flags: {'cadeia.gatos': 2, 'visitante.sharikov': true}},
  gatos_3: {flags: {'cadeia.gatos': 3, 'visitante.sharikov': true}},
  gatos_4: {flags: {'cadeia.gatos': 4, 'visitante.sharikov': true}},
  gatos_5: {flags: {'cadeia.gatos': 5, 'visitante.sharikov': true}},
  gatos_6: {flags: {'cadeia.gatos': 6, 'visitante.sharikov': true}},
  cientista_1: {flags: {'cadeia.cientista': 1}},
  cientista_2: {flags: {'cadeia.cientista': 2}},
  cientista_3: {flags: {'cadeia.cientista': 3}},
  gatos_final_0: {flags: {'visitante.sharikov': true}},
  gatos_final_1: {flags: {'cadeia.gatos_final': 1, 'visitante.sharikov': true}},
  gatos_final_2: {flags: {'cadeia.gatos_final': 2, 'visitante.sharikov': true}},
  gatos_final_3: {flags: {'cadeia.gatos_final': 3, 'visitante.sharikov': true}},
  gatos_final_4: {flags: {'cadeia.gatos_final': 4, 'visitante.sharikov': true}},
  gatos_final_5: {flags: {'cadeia.gatos_final': 5, 'visitante.sharikov': true}},
  gatos_final_6: {flags: {'cadeia.gatos_final': 6, 'visitante.sharikov': true}},
  gatos_final_7: {flags: {'cadeia.gatos_final': 7, 'visitante.sharikov': true}},
  gatos_final_8: {flags: {'cadeia.gatos_final': 8, 'visitante.sharikov': true}},
  gatos_final_9: {flags: {'cadeia.gatos_final': 9, 'cadeia.gatos_final.gatos': 9}},
  gatos_final_x: {flags: {'cadeia.gatos_final': 2}, itens: {sopa: 0}},
  cao_1: {flags: {}},
  cao_2: {flags: {'cadeia.cao': 2}},
  cao_3: {flags: {'cadeia.cao': 3}},
  cao_4: {flags: {'cadeia.cao': 4}},
  mutacao_1: {flags: {}},
  mutacao_2: {flags: {}},
  mutacao_3: {flags: {}},
  mutacao_4: {flags: {'cadeia.mutacao.mutante': true}},
  ferida_1: {flags: {}},
  ferida_2: {flags: {}},
  ferida_3: {flags: {}, pessoas: {pai: {doente: {desde: 40}}}},
  saida_loucura_1: {flags: {}, pessoas: {pai: {loucura: 90}}},
  saida_loucura_2: {flags: {}, pessoas: {mae: {loucura: 90}}},
  saida_loucura_3: {flags: {}, pessoas: {filho: {loucura: 90}}},
  saida_loucura_4: {flags: {}, pessoas: {filha: {loucura: 90}}},
  carro_1: {flags: {}},
  carro_2: {flags: {'cadeia.carro': 2, 'cadeia.carro.ate': 50}, pessoas: {pai: {noAbrigo: false, fugiu: 'carro'}}},
  sinal_timmy_1: {flags: {}},
  sinal_timmy_2: {flags: {'cadeia.sinal_timmy': 2}},
  veiculo_1: {flags: {}},
  veiculo_2: {flags: {'cadeia.veiculo': 2}},
  veiculo_3: {flags: {'cadeia.veiculo': 3}},
  veiculo_4: {flags: {'cadeia.veiculo': 4}},
  veiculo_5: {flags: {'cadeia.veiculo': 5}},
  veiculo_6: {flags: {'cadeia.veiculo': 6}},
  visitante_seis_bracos: {flags: {}},
  visitante_caco: {flags: {}},
  visitante_caco_volta: {flags: {'visitante.caco': 'pedra'}, pessoas: {pai: {semBeber: 2}}},
  visitante_medicos: {flags: {}},
  visitante_medicos_volta: {flags: {'visitante.medicos': 'voltam', 'visitante.medicos.ate': 50}, pessoas: {mae: {doente: {desde: 50}}}},
  com_1: {flags: {}}, com_2: {flags: {}}, com_3: {flags: {}}, com_4: {flags: {}}, com_5: {flags: {}},
  com_6: {flags: {}, itens: {rifle: 0, machado: 0}},
  auto_1: {flags: {'visitante.sharikov': true}},
  auto_2: {flags: {'visitante.sharikov': true}},
  auto_3: {flags: {'visitante.sharikov': true}},
}

// ---------------------------------------------------------------- (1) cada evento, cada escolha
let escolhasTestadas = 0
for (const ev of EVENTOS) {
  const prep = PREPARO[ev.id]
  assert.ok(prep, `falta preparo do teste para ${ev.id}`)
  const e = novo(prep)
  assert.ok(ev.quando(e), `quando(${ev.id}) deveria ser verdadeiro com o estado preparado`)
  assert.equal(typeof ev.texto(e), 'string', `texto de ${ev.id} deve ser string`)
  const validas = ev.escolhas(e).filter((c) => !c.requer || c.requer(e))
  assert.ok(validas.length > 0, `${ev.id} não tem nenhuma escolha válida`)
  for (const c of validas) {
    const e2 = novo(prep)
    const rng = criarRng('teste', `${ev.id}/${c.id}`)
    assert.doesNotThrow(() => ev.resolver(e2, c.id, rng), `${ev.id} / ${c.id} lançou exceção`)
    escolhasTestadas++
  }
}
console.log(`(1) ${EVENTOS.length} eventos, ${escolhasTestadas} escolhas resolvidas sem exceção`)

// ---------------------------------------------------------------- (2) simulação de 200 dias
const PARTIDAS = 40
const DIAS = 200
const passosVistos = {} // id do evento → quantas vezes apareceu (somado nas partidas)
const finaisAtingidos = {}
let passoMaximo = 0

function checarFinais(e) {
  for (const f of FINAIS) {
    const motivo = f.checar(e)
    if (motivo && !e.final) e.final = {id: f.id, tipo: f.tipo, motivo, dia: e.dia}
  }
}

for (let s = 1; s <= PARTIDAS; s++) {
  const e = criarEstado(`sim${s}`, {pessoas: FAM, itens: ITENS_CHEIOS})
  const escolhaRng = criarRng(`sim${s}`, 'escolha')
  for (let dia = 1; dia <= DIAS && !e.final; dia++) {
    const cands = EVENTOS.filter((ev) => !(ev.unico && e.eventosVistos[ev.id]) && ev.quando(e)
      && ev.escolhas(e).some((c) => !c.requer || c.requer(e)))
    if (cands.length) {
      const ev = e.rng.eventos.ponderado(cands.map((x) => [x, x.peso(e)]))
      const validas = ev.escolhas(e).filter((c) => !c.requer || c.requer(e))
      const c = escolhaRng.escolher(validas)
      ev.resolver(e, c.id, e.rng.eventos)
      e.eventosVistos[ev.id] = (e.eventosVistos[ev.id] ?? 0) + 1
      passosVistos[ev.id] = (passosVistos[ev.id] ?? 0) + 1
    }
    checarFinais(e)
    for (const k of Object.keys(e.flags)) {
      const m = k.match(/^cadeia\.([a-z_]+)$/)
      if (m && typeof e.flags[k] === 'number') passoMaximo = Math.max(passoMaximo, e.flags[k])
    }
    e.historico.push({dia: e.dia, diario: e.diario})
    e.diario = []
    e.dia++
  }
  if (e.final) finaisAtingidos[e.final.id] = (finaisAtingidos[e.final.id] ?? 0) + 1
  else finaisAtingidos['(sem final em 200 dias)'] = (finaisAtingidos['(sem final em 200 dias)'] ?? 0) + 1
}

// agrupa por cadeia: ids "<cadeia>_<passo>" (passo numérico ou x)
const porCadeia = {}
const avulsos = {}
for (const [id, n] of Object.entries(passosVistos)) {
  const m = id.match(/^(.+)_(\d+|x)$/)
  if (m && !id.startsWith('com_') && !id.startsWith('auto_') && !id.startsWith('visitante_')) {
    (porCadeia[m[1]] ??= {})[m[2]] = n
  } else {
    avulsos[id] = n
  }
}
console.log(`\n(2) ${PARTIDAS} partidas de ${DIAS} dias, eventos sorteados entre os válidos:`)
for (const cadeia of Object.keys(porCadeia).sort()) {
  const passos = Object.entries(porCadeia[cadeia]).sort(([a], [b]) => a.localeCompare(b, undefined, {numeric: true}))
  console.log(`  ${cadeia.padEnd(16)} passos vistos: ${passos.map(([p, n]) => `${p}x${n}`).join(' ')}`)
}
console.log(`  visitantes e avulsos: ${Object.entries(avulsos).map(([id, n]) => `${id}x${n}`).join(' ') || '(nenhum)'}`)
console.log(`  maior passo alcançado em qualquer cadeia: ${passoMaximo}`)
console.log(`  finais atingidos: ${Object.entries(finaisAtingidos).map(([id, n]) => `${id}=${n}`).join(' ')}`)

// ---------------------------------------------------------------- (3) caminho direto até cada final
// Cada final tem que ser alcançável por pelo menos um caminho (os finais de passo de cadeia são disparados
// pelo resolver; os de condição pelo checar). Sovietico e marlon não têm caminho: ver finais.mjs.
const alcancados = new Set()
function dispara(prep, eventoId, escolha, seed = 'direto') {
  const ev = EVENTOS.find((x) => x.id === eventoId)
  const e = novo(prep)
  ev.resolver(e, escolha, criarRng(seed, eventoId))
  checarFinais(e)
  return e.final?.id
}
const CAMINHOS = [
  ['gemeos', () => dispara({flags: {'cadeia.gemeos': 5}}, 'gemeos_5', 'abrir')],
  ['veiculo', () => dispara({flags: {'cadeia.veiculo': 6}}, 'veiculo_6', 'ligar')],
  ['estrelas', () => dispara({flags: {'cadeia.cientista': 3, 'cadeia.cientista.ate': 50}}, 'cientista_3', 'decolar')],
  ['agentes', () => dispara({flags: {'cadeia.gatos': 6, 'visitante.sharikov': true}}, 'gatos_6', 'abrir')],
  ['dona_dos_gatos', () => dispara({flags: {'cadeia.gatos_final': 9, 'cadeia.gatos_final.gatos': 9}}, 'gatos_final_9', 'ok')],
  ['dominacao_felina', () => dispara({flags: {'cadeia.gatos_final': 3}, itens: {sopa: 0}}, 'gatos_final_x', 'ok')],
  ['invasao', () => { // defesas esgotadas e nenhuma perda antes: o cerco vira invasão no segundo cerco sem defesa
    const e = novo({flags: {'cadeia.bandidos': 1, 'cadeia.bandidos.defesas': 10, 'cadeia.bandidos.perdas': 1}})
    EVENTOS.find((x) => x.id === 'bandidos_1').resolver(e, 'nada', criarRng('direto', 'inv'))
    checarFinais(e)
    return e.final?.id
  }],
  ['ninguem_adulto', () => { // mãe e pai mortos, só os filhos no abrigo
    const e = novo({pessoas: {pai: {vivo: false, noAbrigo: false}, mae: {vivo: false, noAbrigo: false}}})
    checarFinais(e)
    return e.final?.id
  }],
  ['expulso', () => { // todo mundo fora do abrigo, ainda vivo
    const e = novo({pessoas: {pai: {noAbrigo: false}, mae: {noAbrigo: false}, filha: {noAbrigo: false}, filho: {noAbrigo: false}}})
    checarFinais(e)
    return e.final?.id
  }],
  ['militar', () => { // resgate: sorteio entre 3 desfechos ao abrir a porta, com seeds diferentes
    for (let s = 0; s < 40; s++) {
      const e = novo({flags: {'cadeia.militar': 5, 'cadeia.militar.encontro': 40}})
      EVENTOS.find((x) => x.id === 'militar_5').resolver(e, 'abrir', criarRng(`militar${s}`, 'porta'))
      checarFinais(e)
      if (e.final?.id === 'militar') return 'militar'
    }
    return null
  }],
]
for (const [nome, caminho] of CAMINHOS) {
  const id = caminho()
  if (id) alcancados.add(id)
  console.log(`  caminho ${nome.padEnd(16)} -> ${id ?? 'NÃO ALCANÇADO'}`)
}
assert.ok(alcancados.has('gemeos') && alcancados.has('veiculo') && alcancados.has('estrelas'), 'finais direto não funcionam')
assert.ok(alcancados.has('militar'), 'final militar não alcançado')
assert.ok(alcancados.has('invasao') && alcancados.has('ninguem_adulto') && alcancados.has('expulso'), 'finais de derrota não alcançados')

// confere que as cadeias avançam e que algum final é alcançável
assert.ok((porCadeia.militar?.['2'] ?? 0) + (porCadeia.gemeos?.['2'] ?? 0) + (porCadeia.gatos?.['2'] ?? 0) > 0,
  'nenhuma cadeia avançou do passo 1')
assert.ok(passoMaximo >= 2, 'nenhuma cadeia passou do passo 1')
assert.ok(Object.keys(finaisAtingidos).some((id) => id !== '(sem final em 200 dias)'), 'nenhum final foi alcançado')
const finaisValidos = new Set(FINAIS.map((f) => f.id))
for (const id of Object.keys(finaisAtingidos)) {
  if (id !== '(sem final em 200 dias)') assert.ok(finaisValidos.has(id), `final ${id} não está em FINAIS`)
}
assert.equal(FINAIS.length, 12, 'FINAIS deveria ter 12 entradas')
console.log('\nOK')
