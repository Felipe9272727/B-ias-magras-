// Teste dos eventos de item (sessenta/eventos/itens.mjs). Sem framework: node sessenta/testes/eventos_itens.test.mjs
// Para cada evento: chama quando/peso/texto/escolhas e resolve CADA escolha disponível, cada uma em um estado novo
// (com rng novo). Confere que não há exceção, que o diário ganhou pelo menos uma linha e que são 53 eventos.
// Roda em dois estados: "rico" (todas as pessoas, 4 de cada item) e "pobre" (ninguém, nenhum item).
import {criarEstado} from '../estado.mjs'
import {ITENS} from '../itens.mjs'
import {EVENTOS} from '../eventos/itens.mjs'

const IDS_ESPERADOS = [
  'terremoto', 'machado_gemeos', 'exercito_galoes', 'vendedor_porta', 'mau_cheiro', 'bandidos_porta', 'monstros_roedores',
  'cartas_ponto', 'ventilacao_travada', 'tedio_abrigo', 'mae_abatida', 'ferida_mae', 'detetive_pato', 'balas_comerciante',
  'passeio_cao', 'fotos_familia', 'enchente', 'seguir_cao', 'comida_cao', 'vizinhos_protecao', 'vizinhos_escolta', 'aniv_filha',
  'aniv_filho', 'remedio_caseiro', 'pesca_mala', 'visita_ferida_mae', 'medicos_visita', 'infestacao', 'mala_misteriosa',
  'suprimentos_agentes', 'vizinha_mutante', 'carta_ajuda', 'aranhas', 'enxame', 'derrubar_ninho', 'diversao_criancas',
  'plano_mapa', 'cacadora', 'cavaleiros', 'vizinhos_porao', 'sinal_escoteiro', 'incendio', 'ferida_filho', 'duas_patas',
  'comunicacao_baratas', 'academia_escola', 'barulhos', 'defender_abrigo', 'ajuda_refugiados', 'vencedor_sopa',
  'vencedor_agua', 'monstro_coleira', 'medicos_retorno',
]

const falhas = []
const falha = (msg) => falhas.push(msg)

// estado rico: todas as pessoas, 4 de cada item de itens.mjs, munição e foto (flags), gato, baratas e algumas memórias
function estadoRico(semente) {
  const e = criarEstado(semente, {
    pessoas: ['pai', 'mae', 'filha', 'filho'],
    itens: Object.fromEntries(Object.keys(ITENS).map((k) => [k, 4])),
  })
  e.flags['itens.municao'] = 4
  e.flags['itens.foto_familia'] = 4
  e.flags['itens.gato'] = true
  e.flags['itens.baratas'] = true
  e.flags['itens.vizinha_feita'] = true
  e.flags['itens.vizinhos.contato'] = true
  e.flags['itens.expedicao.sem_kit'] = ['mae', 'filho']
  e.flags['itens.militar.galoes'] = 1
  e.historico.push({dia: 1, expedicao: {local: 'mercado'}})
  e.pessoas.find((p) => p.id === 'mae').cansado = 2
  return e
}

// estado pobre: ninguém e nenhum item
const estadoPobre = (semente) => criarEstado(semente, {pessoas: [], itens: {}})

function conferirDiario(rotulo, id, e) {
  if (!Array.isArray(e.diario) || e.diario.length < 1) falha(`${rotulo} ${id}: o diário não ganhou nenhuma linha`)
}

function testarEvento(rotulo, ev, fabrica) {
  const e = fabrica(`${ev.id}:${rotulo}`)
  const q = ev.quando(e)
  const p = ev.peso(e)
  const t = ev.texto(e)
  const escolhas = ev.escolhas(e)
  if (typeof q !== 'boolean') falha(`${rotulo} ${ev.id}: quando() deveria devolver boolean`)
  if (typeof p !== 'number' || !(p >= 0)) falha(`${rotulo} ${ev.id}: peso() deveria devolver número >= 0`)
  if (typeof t !== 'string' || !t.trim()) falha(`${rotulo} ${ev.id}: texto() vazio`)
  if (!Array.isArray(escolhas)) falha(`${rotulo} ${ev.id}: escolhas() deveria devolver array`)

  // evento automático (sem escolha): o resolver é chamado com escolha undefined
  if (escolhas.length === 0) {
    const e2 = fabrica(`${ev.id}:auto:${rotulo}`)
    ev.resolver(e2, undefined, e2.rng.eventos)
    conferirDiario(rotulo, `${ev.id} (automático)`, e2)
    return 1
  }

  const ids = new Set()
  let resolvidas = 0
  for (const c of escolhas) {
    if (!c.id || !c.texto) falha(`${rotulo} ${ev.id}: escolha sem id ou texto`)
    if (ids.has(c.id)) falha(`${rotulo} ${ev.id}: id de escolha repetido (${c.id})`)
    ids.add(c.id)
    if (c.requer && !c.requer(e)) continue // escolha indisponível neste estado
    const e2 = fabrica(`${ev.id}:${c.id}:${rotulo}`) // estado novo e rng novo para cada escolha
    ev.resolver(e2, c.id, e2.rng.eventos)
    conferirDiario(rotulo, `${ev.id}/${c.id}`, e2)
    resolvidas++
  }
  return resolvidas
}

// --- confere a lista
if (EVENTOS.length !== 53) falha(`eram esperados 53 eventos, há ${EVENTOS.length}`)
const idsReais = EVENTOS.map((ev) => ev.id)
if (new Set(idsReais).size !== idsReais.length) falha('há ids de evento repetidos')
for (const id of IDS_ESPERADOS) if (!idsReais.includes(id)) falha(`evento faltando: ${id}`)
for (const id of idsReais) if (!IDS_ESPERADOS.includes(id)) falha(`evento inesperado: ${id}`)

// --- roda cada evento nos dois estados
let total = 0
for (const ev of EVENTOS) {
  try {
    total += testarEvento('rico', ev, estadoRico)
    total += testarEvento('pobre', ev, estadoPobre)
  } catch (err) {
    falha(`${ev.id}: exceção: ${err.stack?.split('\n').slice(0, 2).join(' | ') ?? err}`)
  }
}

if (falhas.length) {
  console.log(`${falhas.length} falha(s):`)
  for (const f of falhas) console.log(' - ' + f)
  process.exit(1)
}
console.log(`${EVENTOS.length} eventos, ${total} escolhas resolvidas (estado rico e pobre)`)
console.log('OK')
