// Teste da fase do abrigo: simula 40 dias com uma política simples e imprime um resumo por dia.
// Roda com: node sessenta/testes/abrigo.test.mjs  (termina com OK, ou com erro e código de saída 1)
import {criarEstado, pessoa, adoecer, sair} from '../estado.mjs'
import * as A from '../abrigo.mjs'

const DIAS = 40
const PESSOAS = ['pai', 'mae', 'filha', 'filho']
const ITENS_INICIO = {
  sopa: 3, agua: 3, mascara: 1, radio: 1, lanterna: 1, mapa: 1, baralho: 1, damas: 1,
  kit: 1, machado: 1, rifle: 1, manual: 1, inseticida: 1, cadeado: 1, mala: 1, gaita: 1,
}
// notáveis: só estas linhas do diário aparecem no resumo do dia
const NOTAVEL = /resistiu|fugiu|saiu de casa|não voltou|voltou|levaram|bandidos|radiação|quebr|doente|sozinho|estranho|chegaram|seguiu/i

function confere(cond, msg) {
  if (!cond) throw new Error(`FALHOU: ${msg}`)
}

function estadoNovo(semente) {
  return criarEstado(semente, {pessoas: PESSOAS, itens: {...ITENS_INICIO}})
}

// Política simples: água a cada 4 dias e sopa a cada 6 para quem está no abrigo;
// o pai sai com máscara a cada 8 dias (se puder).
function politica(e) {
  const ops = A.opcoesRacao(e)
  const sopa = (e.dia - 1) % 6 === 0 ? ops.sopa : []
  const agua = (e.dia - 1) % 4 === 0 ? ops.agua : []
  A.aplicarRacao(e, {sopa, agua})
  if (e.dia % 8 === 0) {
    const op = A.opcoesExpedicao(e)
    if (op.quem.includes('pai')) A.enviarExpedicao(e, 'pai', op.itens.includes('mascara') ? ['mascara'] : [])
  }
}

function resumo(e) {
  const gente = e.pessoas.map((p) => {
    if (!p.vivo) return `${p.nome}:${p.morte ? `morto(${p.morte.causa})` : 'perdido'}`
    if (p.fugiu) return `${p.nome}:fugiu(${p.fugiu})`
    if (p.fora) return `${p.nome}:fora(volta ${p.fora.volta})`
    const marcas = [p.doente && 'doente', p.ferido && 'ferido', p.loucura >= 60 && 'louco', p.cansado > 0 && 'cansado'].filter(Boolean)
    return `${p.nome}:casa(fome ${p.semComer}, sede ${p.semBeber}${marcas.length ? `, ${marcas.join('/')}` : ''})`
  })
  const q = (t) => e.flags[t === 'sopa' ? 'abrigo.quartos_sopa' : 'abrigo.quartos_agua'] ?? 0
  return `${gente.join(' | ')} || sopa ${e.itens.sopa}+${q('sopa')}q, agua ${e.itens.agua}+${q('agua')}q`
}

// Invariantes: estoques inteiros e não negativos; ninguém em casa com fome ou sede de morte.
function checarEstado(e) {
  for (const [k, n] of Object.entries(e.itens)) confere(Number.isInteger(n) && n >= 0, `item ${k} = ${n}`)
  for (const t of ['sopa', 'agua']) {
    const q = e.flags[t === 'sopa' ? 'abrigo.quartos_sopa' : 'abrigo.quartos_agua'] ?? 0
    confere(Number.isInteger(q) && q >= 0 && q < 4, `quartos de ${t} = ${q}`) // sobra sempre menos de uma lata/garrafa
  }
  for (const p of e.pessoas) {
    for (const c of ['semComer', 'semBeber', 'cansado', 'diasDentro', 'loucura']) {
      confere(Number.isFinite(p[c]) && p[c] >= 0, `${p.nome}.${c} = ${p[c]}`)
    }
    if (p.vivo && p.noAbrigo && !p.fugiu) {
      confere(p.semComer < A.FOME_MORTE, `${p.nome} com fome de morte (${p.semComer}) ainda em casa`)
      if (!p.mutante) confere(p.semBeber < A.SEDE_MORTE, `${p.nome} com sede de morte (${p.semBeber}) ainda em casa`)
    }
  }
}

// 1. Testes pequenos da ração: 1 lata + 1 garrafa dão 4 quartos cada e acabam com 4 pessoas.
{
  const e = criarEstado('racao', {pessoas: PESSOAS, itens: {sopa: 1, agua: 1}})
  const r = A.aplicarRacao(e, {sopa: PESSOAS, agua: PESSOAS})
  confere(r.ok && r.sopa.length === 4 && r.agua.length === 4, 'ração de 4 pessoas')
  confere(e.itens.sopa === 0 && e.itens.agua === 0, 'lata e garrafa abertas')
  confere(A.quartosTotais(e, 'sopa') === 0 && A.quartosTotais(e, 'agua') === 0, 'estoque zerado em quartos')
  confere(e.pessoas.every((p) => p.semBeber === 0), 'água zera a sede')
  confere(A.aplicarRacao(e, {sopa: PESSOAS}).ok === false, 'segunda ração no mesmo dia é recusada')
  confere(e.diario.some((l) => l.includes('Abrimos')), 'abrir a lata fica no diário')
}

// 2. Sem água, ninguém em casa passa do 6º dia (a última água conta como dia 0).
{
  const e = estadoNovo('sem-agua')
  let primeiraSede = null
  for (let i = 0; i < 10; i++) {
    const ops = A.opcoesRacao(e)
    A.aplicarRacao(e, {sopa: (e.dia - 1) % 6 === 0 ? ops.sopa : []})
    A.virarDia(e)
    checarEstado(e)
    const mortos = e.pessoas.filter((p) => !p.vivo || p.fugiu).length
    if (primeiraSede === null && e.pessoas.some((p) => p.fugiu === 'sede' || p.morte?.causa === 'sede')) primeiraSede = e.dia
    if (mortos === PESSOAS.length) break
  }
  confere(primeiraSede !== null && primeiraSede <= 7, `sede sem água chegou em ${primeiraSede} (esperado até o dia 7)`)
  console.log(`sem água: primeira morte/fuga por sede no dia ${primeiraSede}`)
}

// 3. Cura pela sopa: doente que come todo dia (3 sopas seguidas, sem ferimento) fica bom; sem sopa, não.
{
  const e = criarEstado('cura', {pessoas: PESSOAS, itens: {sopa: 10, agua: 10}})
  e.dia = 1
  adoecer(e, 'filho', 'teste: filho ficou doente')
  const ops = A.opcoesRacao(e)
  for (let d = 0; d < 3; d++) {
    A.aplicarRacao(e, {sopa: ops.sopa, agua: ops.agua})
    A.virarDia(e)
  }
  confere(pessoa(e, 'filho').doente === null, 'três sopas seguidas curam a doença básica')
}

// 4. Expedições: limite de itens (com a mala, a própria mala conta), cadeado do último e uma saída por vez.
{
  const e = criarEstado('expedicao', {pessoas: PESSOAS, itens: {mala: 1, mascara: 1, mapa: 1, lanterna: 1, kit: 1, cadeado: 1}})
  confere(A.enviarExpedicao(e, 'pai', ['mascara', 'mapa']).ok === false, 'sem mala só cabe 1 item')
  confere(A.enviarExpedicao(e, 'pai', ['mala', 'mascara', 'mapa', 'lanterna', 'kit']).ok === false, 'com mala cabem 4, a mala conta')
  const r = A.enviarExpedicao(e, 'pai', ['mala', 'mascara', 'mapa', 'lanterna'])
  confere(r.ok && e.itens.mala === 0 && e.itens.mapa === 0, 'itens saem do estoque')
  confere(A.opcoesExpedicao(e).quem.length === 0, 'só uma pessoa sai de cada vez')
  confere(pessoa(e, 'pai').fora.volta === e.dia + A.DIAS_EXPEDICAO, 'volta no prazo')
  for (let d = 0; d < A.DIAS_EXPEDICAO; d++) {
    A.aplicarRacao(e, {})
    A.virarDia(e)
  }
  confere(!pessoa(e, 'pai').fora && pessoa(e, 'pai').noAbrigo, 'pai voltou ao abrigo')
  // o último no abrigo só sai com o cadeado em casa
  const solo = criarEstado('solo', {pessoas: ['pai', 'mae'], itens: {cadeado: 0}})
  sair(solo, 'mae', 'teste', '')
  confere(!A.opcoesExpedicao(solo).quem.includes('pai'), 'último sem cadeado não sai')
  solo.itens.cadeado = 1
  confere(A.opcoesExpedicao(solo).quem.includes('pai') && !A.opcoesExpedicao(solo).itens.includes('cadeado'), 'último sai com cadeado em casa')
}

// 5. Loucura: adulto sozinho enlouquece no 2º dia, e sai de casa quando passa o prazo.
{
  const e = criarEstado('louco', {pessoas: PESSOAS, itens: {sopa: 10, agua: 10}})
  sair(e, 'mae', 'teste', '')
  sair(e, 'filha', 'teste', '')
  sair(e, 'filho', 'teste', '')
  A.virarDia(e) // 1º dia sozinho
  confere(pessoa(e, 'pai').loucura < A.LOUCURA_LIMITE, 'no 1º dia sozinho ainda está bem')
  A.virarDia(e) // 2º dia sozinho
  confere(pessoa(e, 'pai').loucura >= A.LOUCURA_LIMITE, 'no 2º dia sozinho enlouquece')
  let dias = 0
  while (pessoa(e, 'pai').vivo && !pessoa(e, 'pai').fugiu && dias < 60) {
    A.aplicarRacao(e, {sopa: A.opcoesRacao(e).sopa, agua: A.opcoesRacao(e).agua})
    A.virarDia(e)
    dias++
  }
  confere(pessoa(e, 'pai').fugiu === 'loucura', 'louco sai de casa')
  confere(dias >= A.LOUCURA_PRAZO[0] - 3 && dias <= A.LOUCURA_PRAZO[1] + 5, `prazo de loucura (${dias} dias)`)
  console.log(`loucura: pai saiu de casa ${dias} dias depois de enlouquecer (wiki: 20 a 35)`)
}

// 6. Números da expedição: 2000 voltas em clima neutro (sem máscara, sem nada levado) e com radiação.
{
  const sortes = {bem: 0, doente: 0, nao: 0, sopa: 0, agua: 0, itens: 0}
  const N = 2000
  for (let k = 0; k < N; k++) {
    const e = criarEstado(`loot-${k}`, {pessoas: PESSOAS, itens: {}})
    e.flags['abrigo.clima'] = 'neutro'
    A.enviarExpedicao(e, 'pai', [])
    const sopaAntes = e.itens.sopa
    const aguaAntes = e.itens.agua
    const itensAntes = Object.values(e.itens).reduce((s, n) => s + n, 0)
    A.virarDia(e)
    A.virarDia(e)
    const p = pessoa(e, 'pai')
    if (!p.vivo) sortes.nao++
    else if (p.doente || p.ferido) sortes.doente++
    else sortes.bem++
    sortes.sopa += e.itens.sopa - sopaAntes
    sortes.agua += e.itens.agua - aguaAntes
    sortes.itens += Object.values(e.itens).reduce((s, n) => s + n, 0) - itensAntes - (e.itens.sopa - sopaAntes) - (e.itens.agua - aguaAntes)
  }
  const pct = (x) => `${((100 * x) / N).toFixed(0)}%`
  console.log(`expedição neutra (${N} voltas): bem ${pct(sortes.bem)}, machucado ${pct(sortes.doente)}, não volta ${pct(sortes.nao)}; ` +
    `média de sopa ${(sortes.sopa / N).toFixed(2)}, água ${(sortes.agua / N).toFixed(2)}, itens ${(sortes.itens / N).toFixed(2)} por volta (sem contar o que voltou)`)
  confere(sortes.nao / N < 0.15 && sortes.bem / N > 0.7, 'expedição neutra volta bem na maioria das vezes')
}

// 7. Simulação de 40 dias com a política. Cada linha é um dia fechado (decisões + o que aconteceu ao amanhecer).
console.log('dia | fim do dia (estado ao amanhecer do dia seguinte)')
const e = estadoNovo('abrigo-40')
console.log(`situação do dia 1:\n${A.situacao(e)}\n`)
let fim = null
for (let i = 0; i < DIAS; i++) {
  const dia = e.dia
  politica(e)
  A.virarDia(e)
  checarEstado(e)
  const notas = e.historico[e.historico.length - 1].diario.filter((l) => NOTAVEL.test(l))
  console.log(`dia ${String(dia).padStart(2)} | ${resumo(e)}`)
  for (const n of notas.slice(0, 3)) console.log(`        - ${n}`)
  if (notas.length > 3) console.log(`        (+${notas.length - 3} linhas)`)
  const motivo = A.derrotaPadrao(e)
  if (motivo) { fim = motivo; break }
}

const vivos = e.pessoas.filter((p) => p.vivo && !p.fugiu).length
const diasComAgua = e.historico.length
console.log(`\nfim na simulação: dia ${e.dia} | pessoas em jogo: ${vivos} | ${fim ?? 'partida segue'}`)
console.log(`situação no último dia:\n${A.situacao(e)}`)
confere(diasComAgua === e.dia - 1 || fim !== null, 'diário histórico por dia')

// 4. Derrota: sem ninguém vivo, o motivo aparece.
{
  const vazio = criarEstado('vazio', {pessoas: [], itens: {}})
  confere(A.derrotaPadrao(vazio) === 'Todos morreram.', 'derrota com todos mortos')
  confere(A.derrotaPadrao(criarEstado('x', {pessoas: PESSOAS, itens: {}})) === null, 'sem derrota no começo')
}

console.log('\nOK')
