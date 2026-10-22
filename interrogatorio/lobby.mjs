// Falas da sala de espera entre os casos (regra do canal: transição de lobby, até 5 s). Depois de cada caso, o detetive
// e o suspeito daquele caso trocam uma fala curta. Cada um recebe SÓ a memória daquele caso (o caso, o que foi dito,
// o veredito e a verdade revelada no fim) e responde com o próprio modelo. Saída: logs/lobby.json.
// Uso: IA_DIRETO=1 node lobby.mjs <id do caso> ...
import fs from 'node:fs'
import { perguntar } from '../amongus/ia.mjs'
import { IAS } from './casos.mjs'

const ARQ = 'logs/lobby.json'
const saida = fs.existsSync(ARQ) ? JSON.parse(fs.readFileSync(ARQ, 'utf8')) : {}
const limpar = (t) => t.replace(/<think>[\s\S]*?<\/think>/g, '').trim().split('\n').filter(Boolean).pop()?.replace(/^["“'«]|["”'»]$/g, '').replace(/^\w+:\s*/, '').trim() ?? ''

for (const id of process.argv.slice(2)) {
  if (saida[id]) continue
  const L = JSON.parse(fs.readFileSync(`logs/${id}.json`, 'utf8'))
  const c = L.caso
  const veredito = L.fim.tipo === 'confissao' ? 'o suspeito CONFESSOU' : L.fim.tipo === 'acusar' ? 'o detetive deu CULPADO' : 'o detetive LIBEROU o suspeito'
  const memoria = `Caso "${c.titulo}" (${c.resumo}). Interrogatório:\n${L.historico.map((x) => `${x.quem === 'detetive' ? L.detetive.nome : L.suspeito.nome}: ${x.fala}`).join('\n')}\nResultado: ${veredito}. A verdade revelada no fim: o suspeito era ${c.culpado ? 'CULPADO' : 'INOCENTE'}. ${c.verdade.replace(/Você/g, `${L.suspeito.nome}`).replace(/você/g, L.suspeito.nome)}`
  const falas = []
  for (const [quem, papel] of [[c.suspeito, 'suspeito'], [c.detetive, 'detetive']]) {
    const ia = IAS[quem]
    const system = `Você é ${ia.modelo}, da empresa ${ia.nome}. Você acabou de participar de um interrogatório como ${papel.toUpperCase()}. Agora vocês dois saíram da sala e estão na sala de espera, antes do próximo caso.`
    const antes = falas.length ? `\n\n${IAS[falas[0][0]].nome} acabou de te dizer: "${falas[0][1]}". Responda.` : ''
    const prompt = `O que você lembra:\n${memoria}${antes}\n\nDiga UMA fala curta para o outro, em português do Brasil, com no máximo 6 palavras, no tom de quem acabou de sair da sala (pode zoar, provocar, reclamar, se gabar ou pedir desculpa). Responda só a fala, sem aspas.`
    let fala = ''
    for (let t = 0; t < 3 && !fala; t++) {
      const r = await perguntar(ia.provider, system, prompt, { maxTokens: 60, timeoutMs: 120000 })
      fala = r.ok ? limpar(r.text) : ''
    }
    console.log(id, ia.nome, '→', fala)
    falas.push([quem, fala])
  }
  saida[id] = falas
  fs.writeFileSync(ARQ, JSON.stringify(saida, null, 1))
}
