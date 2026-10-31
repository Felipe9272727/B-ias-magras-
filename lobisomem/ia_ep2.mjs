// Transporte de decisões por arquivo para o MCP OpenRouter conectado.
// Não lê arquivos de credenciais nem coloca chaves no código, nos pedidos ou nos logs.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {CONFIG} from './regras_ep2.mjs'

export const SPOOL = path.resolve(process.env.LOBO_EP2_SPOOL ?? new URL('./.spool_ep2', import.meta.url).pathname)
for (const dir of ['req', 'res', 'cache']) fs.mkdirSync(path.join(SPOOL, dir), {recursive:true})
export const uso = {chamadas:0, cache:0, falhas:0, porProvider:{}}
let teste = null
export function decisorDeTeste(fn) {
  if (process.env.LOBO_EP2_TEST !== '1') throw new Error('Decisor sintético só é permitido em teste identificado')
  teste = fn
}
const dormir = ms => new Promise(resolve => setTimeout(resolve, ms))
const atomic = (file, value) => {fs.writeFileSync(file+'.tmp', JSON.stringify(value));fs.renameSync(file+'.tmp', file)}

export async function perguntar(provider, system, prompt, {maxTokens=600, timeoutMs=180000, attempt=0,playerId=null}={}) {
  timeoutMs = Math.max(timeoutMs,7200000)
  uso.chamadas++
  uso.porProvider[provider] = (uso.porProvider[provider] ?? 0)+1
  if (teste) return {ok:true, text:JSON.stringify(await teste({provider,system,prompt})), synthetic:true}
  const model = provider.replace(/^(or|work):/, '')
  const player = CONFIG.players.find(p => p.modelId === model)
  if (!player && model !== CONFIG.judgeModel) throw new Error('Modelo fora do elenco: '+model)
  const max_tokens = Math.max(maxTokens, player?.maxTokens ?? CONFIG.maxTokens)
  const source=provider.startsWith('work:')?'chatgpt-work-subagent':'openrouter'
  if(model.startsWith('openai/') && source!=='chatgpt-work-subagent') throw new Error('OpenAI deve usar a assinatura Work, não OpenRouter.')
  const value = {model,source,playerId,system, message:prompt, max_tokens, ...(player?.effort?{reasoning_effort:player.effort}:{}), attempt}
  const id = crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex')
  const cache = path.join(SPOOL,'cache',id+'.json')
  if (fs.existsSync(cache)) {uso.cache++;return JSON.parse(fs.readFileSync(cache,'utf8'))}
  const requestDir=source==='chatgpt-work-subagent'?path.join(SPOOL,'req_work',playerId):path.join(SPOOL,'req')
  fs.mkdirSync(requestDir,{recursive:true})
  const request = path.join(requestDir,id+'.json'), response = path.join(SPOOL,'res',id+'.json')
  atomic(request, {id,...value,createdAt:new Date().toISOString()})
  const began = Date.now()
  while (Date.now()-began < timeoutMs) {
    if (!fs.existsSync(response)) {await dormir(200);continue}
    const answer = JSON.parse(fs.readFileSync(response,'utf8'))
    if (!answer.ok || !answer.text?.trim() || !(answer.generationId || (answer.source==='chatgpt-work-subagent' && answer.agentId && answer.requestId===id))) {
      uso.falhas++
      throw new Error('Decisão não concluída pelo modelo; partida pausada sem ação inventada: '+(answer.error??id))
    }
    atomic(cache,answer)
    fs.unlinkSync(request);fs.unlinkSync(response)
    return answer
  }
  uso.falhas++
  throw new Error('Tempo de espera pela conexão esgotado. Retome a mesma partida; respostas válidas ficam em cache: '+id)
}
