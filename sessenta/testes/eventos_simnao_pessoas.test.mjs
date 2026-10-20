// Teste dos eventos de SIM/NÃO (55), ESCOLHER ALGUÉM (8) e MANDAR ALGUÉM (13). Sem framework.
// Para cada evento: quando/peso/texto/escolhas numa família cheia, numa família louca e numa com alguém fora;
// depois resolve CADA escolha, com estado novo e com várias sementes, e confere que nada lança exceção e que o
// diário ganhou linha. Rodar: node sessenta/testes/eventos_simnao_pessoas.test.mjs
import assert from 'node:assert/strict'
import {criarEstado, pessoa} from '../estado.mjs'
import {criarRng} from '../rng.mjs'
import {ITENS} from '../itens.mjs'
import {EVENTOS as SIMNAO} from '../eventos/simnao.mjs'
import {EVENTOS as PESSOAS} from '../eventos/pessoas.mjs'

const SIMNAO_IDS = [
  'dieta_fungo', 'encontro_proibido', 'vigilancia', 'disputa_lata', 'tuba', 'passeio_filho', 'xerifes', 'canibalismo',
  'mimica', 'limpeza', 'propaganda', 'casa_vizinha', 'sinal_estranho', 'nao_sozinho', 'diario', 'carta_codigo',
  'disputa_familia', 'atividade_extra', 'conversa_mae', 'conversa_filha', 'conversa_filha_mutante', 'conversa_filho',
  'rastro_gato', 'jogo_gato_damas', 'comida_fresca', 'fio_gato', 'grandes_expectativas', 'show_harmonica',
  'batida_sobrevivencia', 'batida_final', 'linguagem', 'claustrofobia', 'aviso_final', 'escola_filha',
  'passeio_cachorro', 'fantasma_mapa', 'picnic_casal', 'fuga_gato', 'escoteiro', 'mau_humor_mae', 'cheiro_buraco',
  'pega_pega', 'carro_pai', 'codigo', 'lado_sombrio_idosos', 'lado_sombrio_vizinha', 'lado_sombrio_professora',
  'telescopio', 'radio_conserto', 'mala_misteriosa', 'gato_entra', 'pedra_vendedor', 'churrasco', 'jovens_armados',
  'plantacao',
]
const ESCOLHER_IDS = [
  'fazenda_formigas', 'briga_irmaos', 'maestro', 'debate_filmes', 'veiculo_rua', 'furto_lata', 'balde', 'aniversario',
]
const MANDAR_IDS = [
  'nova_esperanca', 'ligacao', 'encontro_militar', 'cafe_expedicao', 'perigo_selvagem', 'mapa_pichado',
  'cofre_vizinho', 'cobaia', 'reconhecimento', 'reencontro_gemeos', 'laco_familiar', 'tanque_antigo', 'ilha_tesouro',
]

// estado rico: todas as pessoas, 4 de cada item, flags que destravam as cadeias (para exercitar as ramificações)
const FLAGS_RICOS = {
  'simnao.libera.vigilancia': true,
  'simnao.libera.nao_sozinho': true,
  'simnao.libera.carta_codigo': true,
  'simnao.libera.disputa_familia': true,
  'simnao.libera.atividade_extra': true,
  'simnao.libera.fuga_gato': true,
  'simnao.libera.comida_fresca': true,
  'simnao.libera.churrasco': true,
  'simnao.gato.no_abrigo': true,
  'simnao.cachorro.no_abrigo': true,
  'simnao.desafio.mulher_cachorro': true,
  'simnao.cientista': true,
  'simnao.baratas': true,
  'simnao.final.militar': 'andamento',
  'simnao.final.gemeos': 'andamento',
  'simnao.final.bunker_vip': 'andamento',
  'simnao.final.estrelas': 'andamento',
  'pessoas.gemeos.passo': 1,
  'pessoas.militar.liberado': true,
  'expedicao.saiu.filha': 2,
  'expedicao.saiu.filho': 3,
}
const VISTOS = {provisoes: 1, por_favor_responda: 1, tanque_antigo: 1}

const VARIANTES = {
  cheia: {dia: 4},
  louca: {dia: 25, louca: true},
  fora: {dia: 4, fora: true},
}

function estadoRico(variante) {
  const cfg = VARIANTES[variante]
  const itens = Object.fromEntries(Object.keys(ITENS).map((k) => [k, 4]))
  const e = criarEstado('teste', {pessoas: ['pai', 'mae', 'filha', 'filho'], itens})
  e.dia = cfg.dia
  Object.assign(e.flags, FLAGS_RICOS)
  e.eventosVistos = {...VISTOS}
  if (cfg.louca) {
    pessoa(e, 'mae').loucura = 100
    pessoa(e, 'filha').mutante = true
  }
  if (cfg.fora) {
    // pai ficou na casa (perdido, ainda vivo) e filho está numa tarefa fora
    Object.assign(pessoa(e, 'pai'), {noAbrigo: false, perdido: true})
    Object.assign(pessoa(e, 'filho'), {noAbrigo: false, fora: {local: 'tarefa:teste', saiu: 4, volta: 5, itens: []}})
  }
  return e
}

const SEMENTES = [1, 2, 3, 4, 5, 6]
const falhas = []
let resolvidas = 0
let checagens = 0
const check = (label, fn) => {
  checagens++
  try {
    fn()
  } catch (err) {
    falhas.push(`${label}: ${err.message.split('\n')[0]}`)
  }
}

// 1) contagens e ids
check('simnao: 55 eventos com os ids do catálogo', () => {
  assert.equal(SIMNAO.length, 55)
  assert.deepEqual(SIMNAO.map((ev) => ev.id).sort(), [...SIMNAO_IDS].sort())
})
check('pessoas: 21 eventos (8 escolher + 13 mandar)', () => {
  assert.equal(PESSOAS.length, 21)
  assert.equal(ESCOLHER_IDS.length + MANDAR_IDS.length, 21)
  assert.deepEqual(PESSOAS.map((ev) => ev.id).sort(), [...ESCOLHER_IDS, ...MANDAR_IDS].sort())
})
check('ids únicos entre os dois arquivos', () => {
  const todos = [...SIMNAO, ...PESSOAS].map((ev) => ev.id)
  assert.equal(new Set(todos).size, todos.length)
})

// 2) cada evento: quando/peso/texto/escolhas, e resolver de CADA escolha
for (const ev of [...SIMNAO, ...PESSOAS]) {
  for (const variante of Object.keys(VARIANTES)) {
    const rotulo = `${ev.id} [${variante}]`
    const e0 = estadoRico(variante)
    check(`${rotulo} quando`, () => assert.equal(typeof ev.quando(e0), 'boolean'))
    check(`${rotulo} peso`, () => {
      const p = ev.peso(e0)
      assert.equal(typeof p, 'number')
      assert.ok(p >= 0)
    })
    check(`${rotulo} texto`, () => {
      const t = ev.texto(e0)
      assert.equal(typeof t, 'string')
      assert.ok(t.trim().length > 0)
    })
    let escolhas = []
    check(`${rotulo} escolhas`, () => {
      escolhas = ev.escolhas(e0)
      assert.ok(Array.isArray(escolhas) && escolhas.length >= 1, 'sem escolhas')
      assert.equal(new Set(escolhas.map((x) => x.id)).size, escolhas.length, 'ids de escolha repetidos')
      for (const x of escolhas) assert.equal(typeof x.texto, 'string')
    })
    for (const esc of escolhas) {
      for (const semente of SEMENTES) {
        const e = estadoRico(variante) // estado novo por escolha
        const rng = criarRng(`teste:${semente}`, ev.id)
        const antes = e.diario.length
        check(`${rotulo} escolha ${esc.id} (semente ${semente})`, () => {
          ev.resolver(e, esc.id, rng)
          assert.ok(e.diario.length > antes, 'diário não ganhou linha')
        })
        resolvidas++
      }
    }
  }
}

console.log(`simnao: ${SIMNAO.length} eventos`)
console.log(`pessoas: ${PESSOAS.length} eventos (${ESCOLHER_IDS.length} escolher + ${MANDAR_IDS.length} mandar)`)
console.log(`checagens: ${checagens}, escolhas resolvidas: ${resolvidas}`)
if (falhas.length) {
  console.error(`${falhas.length} falha(s):`)
  for (const f of falhas.slice(0, 40)) console.error(`  - ${f}`)
  process.exitCode = 1
} else {
  console.log('OK')
}
