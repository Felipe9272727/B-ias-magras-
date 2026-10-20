// Auditor de logs do "60 Segundos das IAs". Lê os logs de partida (sessenta/logs/*.json) e procura
// inconsistências entre o estado ANTES de cada dia (`antes`) e o que o texto do evento e o diário dizem.
//
//   node sessenta/ferramentas/auditar_logs.mjs [arquivo.json ...] [--exemplos 10] [--quieto]
//   (sem arquivos: audita todos os logs de sessenta/logs/)
//
// Tipos de problema (cada um é uma regra simples; falsos positivos são possíveis, leia os exemplos):
//   erro_excecao          evento.erro presente (o módulo do evento lançou exceção)
//   unico_repetido        evento marcado `unico` saiu mais de uma vez na mesma partida
//   linha_duplicada       a mesma linha aparece duas vezes no diário do mesmo dia
//   evento_sem_escolha    evento com escolhas disponíveis, mas nenhuma foi resolvida (escolhida null, não automático)
//   nome_repetido         a mesma pessoa aparece duas vezes na mesma frase (ex.: "Osvaldo, Osvaldo")
//   texto_vazio           evento sem texto (o motor cai no texto vazio se o módulo falhar)
//   item_perdido_diario   o diário diz que um item se perdeu/quebrou/foi usado, mas a família não tinha
//   item_no_texto         o texto do evento assume um item (perda/uso) que a família não tem
//   item_na_escolha       uma escolha cita um item (perda/uso) que a família não tem
//   pessoa_fora_texto     o texto do evento cita uma pessoa que não está no abrigo
//   pessoa_fora_diario    o diário cita uma pessoa VIVA que está fora do abrigo (expedição, fuga, perdida em casa)
//   todos_sem_grupo       "todos/todas/os dois/ambos" com menos de 2 pessoas no abrigo
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {EVENTOS} from '../jogo.mjs'

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url))) // .../sessenta
const PASTA_LOGS = path.join(RAIZ, 'logs')

// nomes que o texto pode usar para cada item (qualquer um conta como menção)
const ITEM_TERMOS = {
  sopa: ['sopa'], agua: ['água', 'agua'], radio: ['rádio', 'radio'], mapa: ['mapa'],
  mascara: ['máscara', 'mascara'], kit: ['kit médico', 'kit medico', 'kit de primeiros socorros', 'kit'],
  rifle: ['rifle'], machado: ['machado'], lanterna: ['lanterna'], cadeado: ['cadeado'],
  inseticida: ['repelente', 'inseticida'], mala: ['mala'], baralho: ['baralho'],
  damas: ['tabuleiro de damas', 'damas'], gaita: ['gaita'],
  manual: ['guia de escoteiro', 'manual do escoteiro', 'guia', 'manual'], municao: ['munição', 'municao'],
}
// pessoas: o nome próprio (o motor usa nomes da família em familia.mjs)
const PESSOA_NOMES = {pai: 'Osvaldo', mae: 'Celeste', filha: 'Juju', filho: 'Tico'}

// frases que indicam perda, quebra ou uso de algo
const PERDA = /\bperd(e|em|eu|eram)\b|\bse perd|quebr|danific|gast|queim|rouba|sumi|consum|usad|usou|usam|\busa\b|acab/iu
// frases que indicam que algo foi obtido (libera o item para o resto do mesmo diário)
const GANHO = /ganh|encontr|acha|achad|recebe|trouxe|traz|pega|pegou|entreg|sobra|comprad|comprou|\bdá\b|\bdão\b/iu
// negações que anulam a perda ("nada se perde")
const NEGA_PERDA = /nada se perde|não (se )?perd|ninguém|nenhum|sem perd/iu
const TODOS = /(?<![\p{L}])(todos|todas|ambos|os dois|as duas)(?![\p{L}])/iu
// texto que fala da família (não de refugiados, escola etc.): só aí "todos" conta como a família toda
const FAMILIA_AGE = /família|nós|todos (adoec|ficam|perd|sofr|ferid|bebem|comem|sobem|caem|sent|ach)/iu
// linhas de virada do dia (fome, sede, morte, loucura) são escritas depois que o `antes` foi capturado: não cobramos presença
const VIRADA = /morr|resist|sede|fome|faminto|desidrat|fugi|sumi|expedi|volt|saiu|\bsai\b|lá fora|levad|partiu|desapar|enlouq|loucur|ferid|doent|adoec|sozinh|fatig|cans|tédio|cabeça/iu

const achaTermo = (texto, termo) => new RegExp(`(?<![\\p{L}])${termo.replace(/ /g, '\\s+')}(?![\\p{L}])`, 'iu').test(texto)
const itensCitados = (frase) => Object.keys(ITEM_TERMOS).filter((id) => ITEM_TERMOS[id].some((t) => achaTermo(frase, t)))
const pessoasCitadas = (frase) => Object.keys(PESSOA_NOMES).filter((id) => achaTermo(frase, PESSOA_NOMES[id]))
const contaNome = (frase, nome) => (frase.match(new RegExp(`(?<![\\p{L}])${nome}(?![\\p{L}])`, 'giu')) ?? []).length
const frases = (texto) => String(texto ?? '').split(/(?<=[.!?])\s+|\n+/).map((f) => f.trim()).filter(Boolean)

// ---------------------------------------------------------------- checagens
function auditar(log, arquivo) {
  const achados = []
  const add = (tipo, dia, evento, detalhe, origem = '') => achados.push({tipo, arquivo, dia, evento, origem, detalhe})
  const unicos = new Set(EVENTOS.filter((e) => e.unico).map((e) => e.id))
  const contUnico = {}

  for (const d of log.dias ?? []) {
    if (!d.antes) continue // a linha da virada (morte, fuga) só tem o diário
    const itens = d.antes.itens ?? {}
    const tem = (id) => (itens[id] ?? 0) > 0
    const pessoas = d.antes.pessoas ?? []
    const noAbrigo = pessoas.filter((p) => p.vivo && p.noAbrigo).map((p) => p.id)
    const vivos = pessoas.filter((p) => p.vivo).length
    const dentro = (id) => noAbrigo.includes(id)
    const ev = d.evento

    if (ev) {
      if (ev.erro) add('erro_excecao', d.dia, ev.id, ev.erro)
      if (!ev.texto) add('texto_vazio', d.dia, ev.id, 'evento sem texto')
      // automático (sem escolhas no catálogo) não tem escolha por definição; o resolver roda sem ela
      if ((ev.escolhida === null || ev.escolhida === undefined) && (ev.escolhas ?? []).length) add('evento_sem_escolha', d.dia, ev.id, 'nenhuma escolha resolvida')
      if (ev.unico || unicos.has(ev.id)) contUnico[ev.id] = (contUnico[ev.id] ?? 0) + 1

      // premissa do texto: perda/uso de item que a família não tem
      for (const f of frases(ev.texto)) {
        if (!PERDA.test(f) || NEGA_PERDA.test(f)) continue
        for (const id of itensCitados(f)) if (!tem(id)) add('item_no_texto', d.dia, ev.id, `"${f}" (sem ${id})`, 'texto')
      }
      // escolhas: item citado (com verbo de uso/perda) que não existe
      for (const esc of ev.escolhas ?? []) {
        for (const f of frases(esc.texto)) {
          if (!PERDA.test(f) || NEGA_PERDA.test(f)) continue
          for (const id of itensCitados(f)) if (!tem(id)) add('item_na_escolha', d.dia, ev.id, `escolha "${esc.id}": "${f}" (sem ${id})`)
        }
      }
      // pessoas citadas no texto que não estão no abrigo (antes do dia)
      for (const f of frases(ev.texto)) {
        for (const id of pessoasCitadas(f)) if (!dentro(id)) add('pessoa_fora_texto', d.dia, ev.id, `"${f}" (${id} não está no abrigo)`)
        if (TODOS.test(f) && FAMILIA_AGE.test(f) && vivos < 2) add('todos_sem_grupo', d.dia, ev.id, `"${f}" (${vivos} vivo(s))`, 'texto')
      }
    }

    // diário: linhas duplicadas e a narração das perdas
    const diario = d.diario ?? []
    const vistas = new Set()
    const ganhou = new Set()
    for (const linha of diario) {
      if (vistas.has(linha)) add('linha_duplicada', d.dia, ev?.id ?? null, `"${linha}"`)
      vistas.add(linha)
      for (const f of frases(linha)) {
        if (PERDA.test(f) && !NEGA_PERDA.test(f)) {
          for (const id of itensCitados(f)) {
            if (!tem(id) && !ganhou.has(id)) add('item_perdido_diario', d.dia, ev?.id ?? null, `"${f}" (sem ${id})`, 'diario')
          }
        }
        if (GANHO.test(f)) for (const id of itensCitados(f)) ganhou.add(id)
        // quem morreu nesta virada aparece nas linhas de fome/sede: isso não é inconsistência, só quem está vivo e fora
        if (!VIRADA.test(f)) for (const id of pessoasCitadas(f)) if (!dentro(id) && pessoas.find((p) => p.id === id)?.vivo) add('pessoa_fora_diario', d.dia, ev?.id ?? null, `"${f}" (${id} vivo, mas fora do abrigo)`)
        for (const id of pessoasCitadas(f)) if (contaNome(f, PESSOA_NOMES[id]) > 1) add('nome_repetido', d.dia, ev?.id ?? null, `"${f}"`)
        if (TODOS.test(f) && vivos < 2) add('todos_sem_grupo', d.dia, ev?.id ?? null, `"${f}" (${vivos} vivo(s))`, 'diario')
      }
    }
  }
  for (const [id, n] of Object.entries(contUnico)) if (n > 1) add('unico_repetido', null, id, `saiu ${n} vezes`)
  return achados
}

// ---------------------------------------------------------------- linha de comando
const args = process.argv.slice(2)
const quieto = args.includes('--quieto')
const iEx = args.indexOf('--exemplos')
const exemplos = iEx >= 0 ? Number(args[iEx + 1]) : 6
const arquivos = args.filter((a, i) => !a.startsWith('--') && (i === 0 || args[i - 1] !== '--exemplos'))
const lista = arquivos.length ? arquivos : fs.existsSync(PASTA_LOGS) ? fs.readdirSync(PASTA_LOGS).filter((f) => f.endsWith('.json')).map((f) => path.join(PASTA_LOGS, f)) : []

const todos = []
let partidas = 0
for (const arq of lista) {
  let log
  try { log = JSON.parse(fs.readFileSync(arq, 'utf8')) } catch (err) { todos.push({tipo: 'log_ilegivel', arquivo: arq, dia: null, evento: null, detalhe: String(err.message)}); continue }
  partidas++
  todos.push(...auditar(log, path.basename(arq)))
}

const porTipo = {}
for (const a of todos) (porTipo[a.tipo] ??= []).push(a)
const tipos = Object.keys(porTipo).sort()
if (!quieto) {
  console.log(`Auditoria de ${partidas} partida(s): ${todos.length} problema(s).`)
  for (const t of tipos) {
    console.log(`\n== ${t}: ${porTipo[t].length}`)
    for (const a of porTipo[t].slice(0, exemplos)) {
      console.log(`  ${a.arquivo} dia ${a.dia ?? '-'} [${a.evento ?? '-'}] ${a.detalhe}${a.origem ? ` (${a.origem})` : ''}`)
    }
  }
  if (!tipos.length) console.log('Nenhuma inconsistência encontrada.')
}
process.exitCode = todos.length ? 1 : 0
