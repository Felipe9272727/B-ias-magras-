// Gera um registro de coleta de TESTE (estratégia gulosa, sem IA) para montar o visual no Remotion antes das partidas
// de verdade. Uso: node sessenta/ferramentas/coleta_teste_json.mjs <semente> <saida.json>
import fs from 'node:fs'
import {criarColeta, acoesDetalhadas, aplicar, fim, terminada, tempoAteAbrigo, TIQUE_MS, CASAS_POR_TIQUE, CUSTO_PEGAR_MS} from '../coleta.mjs'
import {ABRIGO, caminho} from '../casa.mjs'

const [semente = 'teste', saida = 'coleta_teste.json'] = process.argv.slice(2)
const MARGEM_MS = 8000
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
  for (const tipo of ['correr', 'explorar']) {
    for (const a of acoes.filter((x) => x.tipo === tipo)) {
      const destino = a.rota[a.rota.length - 1]
      const r = caminho(destino, ABRIGO)
      if (a.custo + CUSTO_PEGAR_MS + (r ? custoPassos(r.length - 1) : Infinity) + MARGEM_MS <= restante) return a.texto
    }
  }
  return naBase ? achar('parado').texto : achar('abrigo').texto
}
const c = criarColeta(semente)
while (!terminada(c)) aplicar(c, gulosa(c))
fs.writeFileSync(saida, JSON.stringify({semente, casa: c.casa, log: c.log, fim: fim(c)}, null, 1))
console.log('ok', c.log.length, 'ações', JSON.stringify(fim(c).itens), fim(c).pessoas)
