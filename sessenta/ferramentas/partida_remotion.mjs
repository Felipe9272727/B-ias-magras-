// Converte um log de partida (sessenta/logs/<semente>_<ia>.json) no formato que as cenas do Remotion leem
// (S60Coleta e S60Dia): video/remotion/public/sessenta/partidas/<semente>_<ia>.json
// Uso: node sessenta/ferramentas/partida_remotion.mjs <semente>_<ia> [...]
import fs from 'node:fs'
import path from 'node:path'
import {montarCasa} from '../casa.mjs'

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
const VISUAL = {
  claude: {nome: 'CLAUDE', cor: '#d97757'},
  deepseek: {nome: 'DEEPSEEK', cor: '#4d6bfe'},
  gpt: {nome: 'GPT', cor: '#10a37f'},
  'gpt-luna': {nome: 'GPT LUNA', cor: '#10a37f'},
  minimax: {nome: 'MINIMAX', cor: '#e8336d'},
  mock: {nome: 'TESTE', cor: '#777777'},
}
const dir = path.join(RAIZ, 'video/remotion/public/sessenta/partidas')
fs.mkdirSync(dir, {recursive: true})
for (const arg of process.argv.slice(2)) {
  // 'nome' lê sessenta/logs/nome.json; 'caminho.json=nome' lê outro arquivo e grava com esse nome
  const [origem, nome] = arg.includes('=') ? arg.split('=') : [path.join(RAIZ, 'sessenta/logs', `${arg}.json`), arg]
  const log = JSON.parse(fs.readFileSync(origem, 'utf8'))
  const saida = {
    semente: log.semente, ia: log.ia, iaVisual: log.provider?.includes('luna') ? {nome: 'GPT LUNA', cor: '#10a37f'} : log.provider?.includes('terra') ? {nome: 'GPT TERRA', cor: '#0b7a5f'} : VISUAL[log.ia] ?? {nome: log.ia.toUpperCase(), cor: '#888'},
    coleta: {semente: log.semente, casa: log.coleta.casa ?? montarCasa(log.semente), log: log.coleta.registro, fim: log.coleta.resultado, falas: log.coleta.falas},
    dias: log.dias.map((d) => ({dia: d.dia, antes: d.antes, virada: !!d.virada, evento: d.evento, resposta: d.resposta, diario: d.diario ?? [], racao: d.racao, expedicao: d.expedicao})),
    final: log.final,
  }
  fs.writeFileSync(path.join(dir, `${nome}.json`), JSON.stringify(saida))
  console.log('ok', nome, saida.dias.length, 'dias, final', log.final?.id)
}
