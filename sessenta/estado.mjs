// Estado da fase do abrigo e as funções que TODOS os módulos usam para mexer nele (contrato do enxame:
// leia docs/CONTRATO.md). Ninguém altera `estado` por fora destas funções, a não ser os campos `flags`.
import {criarRng} from './rng.mjs'
import {FAMILIA} from './familia.mjs'
import {ITENS} from './itens.mjs'

// cria o estado do dia 1 a partir do resultado da coleta: {pessoas: ['pai','mae',...], itens: {sopa: 3, radio: 1, ...}}
export function criarEstado(semente, coleta) {
  const rng = (canal) => criarRng(semente, canal)
  return {
    semente,
    dia: 1,
    rng: {eventos: rng('eventos'), expedicao: rng('expedicao'), estados: rng('estados'), geral: rng('geral')},
    pessoas: FAMILIA.map((f) => ({
      id: f.id, nome: f.nome, papel: f.papel,
      vivo: coleta.pessoas.includes(f.id),
      noAbrigo: coleta.pessoas.includes(f.id), // false: morreu na coleta, saiu, está em expedição ou fugiu
      perdido: !coleta.pessoas.includes(f.id), // ficou na casa (não entrou no abrigo)
      fora: null,      // expedição: {local, saiu: dia, volta: dia, itens: []}
      fugiu: false,    // saiu do abrigo por loucura/fome e não volta (até um evento trazer)
      semComer: 0,     // dias desde a última sopa
      semBeber: 0,     // dias desde a última água
      doente: null,    // {desde: dia}
      ferido: null,    // {desde: dia}
      cansado: 0,      // dias de cansaço restantes (não pode ir em expedição)
      loucura: 0,      // 0..100 (sobe com tédio/medo, desce com lazer)
      diasDentro: 0,   // dias seguidos no abrigo (fadiga)
      mutante: false,
    })),
    itens: Object.fromEntries(Object.keys(ITENS).map((id) => [id, coleta.itens[id] ?? 0])),
    quebrados: {},     // id → true (item que existe mas está quebrado)
    flags: {},         // cadeias e memória dos eventos: livre para cada módulo (prefixe com o id do módulo)
    eventosVistos: {}, // id → quantas vezes já saiu
    diario: [],        // linhas do diário de HOJE (o motor guarda e limpa a cada dia)
    historico: [],     // dias anteriores: {dia, diario, evento, escolha, ...}
    final: null,       // {id, tipo: 'vitoria'|'derrota'|'ambiguo', motivo}
  }
}

// ---------------------------------------------------------------- consultas
export const pessoa = (e, id) => e.pessoas.find((p) => p.id === id)
export const noAbrigo = (e) => e.pessoas.filter((p) => p.vivo && p.noAbrigo)
export const vivos = (e) => e.pessoas.filter((p) => p.vivo)
export const tem = (e, item, n = 1) => (e.itens[item] ?? 0) >= n && !e.quebrados[item]
export const adultosVivos = (e) => e.pessoas.filter((p) => p.vivo && (p.id === 'pai' || p.id === 'mae'))
export const nome = (e, id) => pessoa(e, id)?.nome ?? id

// ---------------------------------------------------------------- efeitos (sempre escrevem uma linha no diário)
export function anotar(e, texto) {
  if (texto) e.diario.push(texto)
}
export function darItem(e, item, n = 1, texto) {
  e.itens[item] = (e.itens[item] ?? 0) + n
  if (item in e.quebrados && n > 0) delete e.quebrados[item]
  anotar(e, texto)
}
export function tirarItem(e, item, n = 1, texto) {
  e.itens[item] = Math.max(0, (e.itens[item] ?? 0) - n)
  anotar(e, texto)
}
export function quebrarItem(e, item, texto) {
  if ((e.itens[item] ?? 0) > 0) e.quebrados[item] = true
  anotar(e, texto)
}
export function adoecer(e, id, texto) {
  const p = pessoa(e, id)
  if (p?.vivo && !p.doente) p.doente = {desde: e.dia}
  anotar(e, texto)
}
export function curar(e, id, texto) {
  const p = pessoa(e, id)
  if (p) { p.doente = null; p.ferido = null }
  anotar(e, texto)
}
export function ferir(e, id, texto) {
  const p = pessoa(e, id)
  if (p?.vivo && !p.ferido) p.ferido = {desde: e.dia}
  anotar(e, texto)
}
export function cansar(e, id, dias = 2, texto) {
  const p = pessoa(e, id)
  if (p) p.cansado = Math.max(p.cansado, dias)
  anotar(e, texto)
}
export function enlouquecer(e, id, pontos, texto) {
  const p = pessoa(e, id)
  if (p) p.loucura = Math.max(0, Math.min(100, p.loucura + pontos))
  anotar(e, texto)
}
export function matar(e, id, causa, texto) {
  const p = pessoa(e, id)
  if (p?.vivo) { p.vivo = false; p.noAbrigo = false; p.morte = {dia: e.dia, causa} }
  anotar(e, texto)
}
export function sair(e, id, motivo, texto) { // foge/vai embora e não volta sozinho
  const p = pessoa(e, id)
  if (p?.vivo) { p.noAbrigo = false; p.fugiu = motivo || true }
  anotar(e, texto)
}
export function voltar(e, id, texto) { // alguém que estava fora/perdido/fugido volta ao abrigo
  const p = pessoa(e, id)
  if (p?.vivo) { p.noAbrigo = true; p.fugiu = false; p.perdido = false; p.fora = null }
  anotar(e, texto)
}
export function terminar(e, id, tipo, motivo, texto) {
  if (!e.final) e.final = {id, tipo, motivo, dia: e.dia}
  anotar(e, texto)
}
