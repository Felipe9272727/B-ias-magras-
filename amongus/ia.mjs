// Cliente das IAs. Os pedidos vão por arquivo para a ponte do mod "deepseek" do Claude Code,
// que chama o DeepSeek Flash (com a chave guardada no mod) ou o Haiku (pelo cliente da sessão).
// provider "mock" responde na hora com uma ação aleatória, para testar o motor sem gastar nada.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const SPOOL = path.join(path.dirname(new URL(import.meta.url).pathname), '.spool2') // ver o mod: .spool2 é a ponte nova (curl, até 5 min)
fs.mkdirSync(path.join(SPOOL, 'req'), { recursive: true })
fs.mkdirSync(path.join(SPOOL, 'res'), { recursive: true })

export const uso = { chamadas: 0, falhas: 0, porProvider: {}, falhasPor: {} }

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

// IA_DIRETO=1 (partidas 2 a 4 do AU4, para andar mais rápido): os modelos do OpenRouter são chamados direto pelo curl,
// todos ao mesmo tempo (a ponte do mod atende no máximo 8 por vez), com o MESMO raciocínio "low" que a ponte pede.
// IA_TIMEOUT_S limita cada resposta (sem isso: 5 min). A chave é a mesma guardada pelo mod.
import { execFile } from 'node:child_process'
const ARQ_CHAVE = '/root/.claude/plugins/store/deepseek_inline-6aaca6566e14.json'
let chaveOR
function lerChaveOR() {
  if (chaveOR !== undefined) return chaveOR
  try { chaveOR = fs.readFileSync(ARQ_CHAVE, 'utf8').match(/sk-or-[A-Za-z0-9_-]+/)?.[0] ?? null } catch { chaveOR = null }
  return chaveOR
}
function viaCurlOR(provider, system, prompt, maxTokens, timeoutMs, semRaciocinio = false) {
  const chave = lerChaveOR()
  if (!chave) return Promise.resolve({ ok: false, text: 'openrouter: sem chave' })
  const seg = Math.max(10, Math.round(timeoutMs / 1000))
  const corpo = JSON.stringify({ model: provider.slice(3), messages: [...(system ? [{ role: 'system', content: system }] : []), { role: 'user', content: prompt }], max_tokens: maxTokens + 2500, reasoning: semRaciocinio ? { enabled: false } : { effort: 'low' } })
  return new Promise((ok) => {
    const p = execFile('sh', ['-c', `curl -sS --max-time ${seg} -X POST https://openrouter.ai/api/v1/chat/completions -H "Content-Type: application/json" -H "Authorization: Bearer $OR_KEY" -H "X-Title: Jogos Vorazes das IAs" --data-binary @- -w "\\n%{http_code}"`], { env: { ...process.env, OR_KEY: chave }, timeout: (seg + 10) * 1000, maxBuffer: 1 << 24 }, (err, stdout) => {
      const linhas = String(stdout ?? '').trimEnd().split('\n')
      const status = Number(linhas.pop()) || 0
      let d; try { d = JSON.parse(linhas.join('\n')) } catch {}
      if (!status) return ok({ ok: false, text: 'timeout' })
      if (status === 402) return ok({ ok: false, text: `openrouter: sem cota (HTTP 402) ${d?.error?.message ?? ''}` })
      if (status < 200 || status >= 300) return ok({ ok: false, text: `openrouter: HTTP ${status} ${d?.error?.message ?? ''}` })
      const ch = d?.choices?.[0]
      const texto = ch?.message?.content ?? ''
      // resposta vazia: guarda o porquê (finish_reason, erro do provedor, tamanho do raciocínio) para diagnosticar
      ok({ ok: true, text: texto, usage: d?.usage, ...(texto.trim() ? {} : { porque: `vazia: finish=${ch?.finish_reason} erro=${JSON.stringify(d?.error ?? ch?.error ?? null).slice(0, 80)} raciocinio=${(ch?.message?.reasoning ?? '').length}` }) })
    })
    p.stdin.end(corpo)
  })
}

// AU5 (pedido do Felipe): o DeepSeek Flash vai pela API do próprio DeepSeek (chave do mod), não pelo OpenRouter
let chaveDS
function viaCurlDS(system, prompt, maxTokens, timeoutMs, semRaciocinio = false) {
  if (chaveDS === undefined) { try { chaveDS = JSON.parse(fs.readFileSync(ARQ_CHAVE, 'utf8')).apiKey ?? null } catch { chaveDS = null } }
  if (!chaveDS) return Promise.resolve({ ok: false, text: 'deepseek: sem chave' })
  const seg = Math.max(10, Math.round(timeoutMs / 1000))
  const corpo = JSON.stringify({ model: 'deepseek-flash', messages: [...(system ? [{ role: 'system', content: system }] : []), { role: 'user', content: prompt }], max_tokens: maxTokens + 2500, ...(semRaciocinio ? { thinking: { type: 'disabled' } } : { reasoning_effort: 'low' }) })
  return new Promise((ok) => {
    const p = execFile('sh', ['-c', `curl -sS --max-time ${seg} -X POST https://api.deepseek.com/chat/completions -H "Content-Type: application/json" -H "Authorization: Bearer $DS_KEY" --data-binary @- -w "\\n%{http_code}"`], { env: { ...process.env, DS_KEY: chaveDS }, timeout: (seg + 10) * 1000, maxBuffer: 1 << 24 }, (err, stdout) => {
      const linhas = String(stdout ?? '').trimEnd().split('\n')
      const status = Number(linhas.pop()) || 0
      let d; try { d = JSON.parse(linhas.join('\n')) } catch {}
      if (!status) return ok({ ok: false, text: 'timeout' })
      if (status === 402) return ok({ ok: false, text: `deepseek: sem cota (HTTP 402) ${d?.error?.message ?? ''}` })
      if (status < 200 || status >= 300) return ok({ ok: false, text: `deepseek: HTTP ${status} ${d?.error?.message ?? ''}` })
      const ch = d?.choices?.[0]
      const texto = ch?.message?.content ?? ''
      ok({ ok: true, text: texto, usage: d?.usage, ...(texto.trim() ? {} : { porque: `vazia: finish=${ch?.finish_reason} raciocinio=${(ch?.message?.reasoning_content ?? '').length}` }) })
    })
    p.stdin.end(corpo)
  })
}

async function viaPonte(provider, system, prompt, maxTokens, timeoutMs, effort, semRaciocinio = false) {
  if (process.env.IA_DIRETO && provider.includes('deepseek/')) return viaCurlDS(system, prompt, maxTokens, timeoutMs, semRaciocinio)
  if (process.env.IA_DIRETO && provider.startsWith('or:')) return viaCurlOR(provider, system, prompt, maxTokens, timeoutMs, semRaciocinio)
  const id = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
  const req = path.join(SPOOL, 'req', `${id}.json`)
  const res = path.join(SPOOL, 'res', `${id}.json`)
  fs.writeFileSync(req + '.tmp', JSON.stringify({ id, provider, system, prompt, max_tokens: maxTokens, ...(effort ? { effort } : {}) }))
  fs.renameSync(req + '.tmp', req) // a ponte só lista .json, então nunca lê um arquivo pela metade
  const t0 = Date.now()
  while (Date.now() - t0 < timeoutMs) {
    if (fs.existsSync(res)) {
      let r
      try { r = JSON.parse(fs.readFileSync(res, 'utf8')) } catch { await dormir(200); continue }
      fs.rmSync(req, { force: true })
      fs.rmSync(res, { force: true })
      return r
    }
    await dormir(250)
  }
  fs.rmSync(req, { force: true })
  return { ok: false, text: 'timeout' }
}

export async function perguntar(provider, system, prompt, { maxTokens = 300, timeoutMs = 330000, mock, effort } = {}) {
  uso.chamadas++
  uso.porProvider[provider] = (uso.porProvider[provider] ?? 0) + 1
  if (provider === 'mock') return { ok: true, text: mock ? mock() : '{}' }
  // o DeepSeek Flash raciocina antes de responder e o raciocínio consome o limite de tokens:
  // damos folga para sobrar espaço para a resposta em si
  if (provider === 'deepseek' || provider.includes('deepseek/')) maxTokens += 3000 // o Flash pensa antes de responder
  // o Opus pensa antes de responder: esforço médio (pedido da pessoa) e folga de tokens para o pensamento
  if (provider === 'opus') { effort = effort ?? process.env.OPUS_EFFORT ?? 'medium'; maxTokens += 6000 }
  // o Sonnet também pensa: esforço alto (pedido da pessoa para o 60 Segundos) e a mesma folga de tokens
  if (provider === 'sonnet') { effort = effort ?? process.env.SONNET_EFFORT ?? 'high'; maxTokens += 6000 }
  if (process.env.IA_TIMEOUT_S) timeoutMs = Math.min(timeoutMs, Number(process.env.IA_TIMEOUT_S) * 1000)
  let transientes = 0
  let ultimo = null
  let vazias = 0
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    // 2 respostas vazias seguidas (o raciocínio comeu a resposta): a última tentativa vai sem raciocínio, para a IA não ficar muda
    const r = await viaPonte(provider, system, prompt, maxTokens, timeoutMs, effort, tentativa === 2 && vazias >= 2)
    if (r.ok && !r.text.trim()) vazias++
    ultimo = r
    if (process.env.IA_DEBUG && !(r.ok && r.text?.trim())) console.error('[ia] falhou', provider, JSON.stringify(r).slice(0, 500))
    if (r.ok && r.text.trim()) {
      const c = Number(r.usage?.cost ?? 0)  // o OpenRouter informa o custo em dólar de cada chamada
      if (c) { uso.custo = uso.custo ?? {}; uso.custo[provider] = (uso.custo[provider] ?? 0) + c }
      return r
    }
    // 429 passageiro do OpenRouter ("could not verify ... Retry shortly"): espera e tenta de novo, não é falta de crédito
    // 429 do provedor ("Provider returned error", limite por minuto) também é passageiro: espera e tenta de novo
    if (/Retry shortly|could not verify|rate.?limit|HTTP 429|Provider returned error/i.test(r.text) && transientes++ < 12) { await dormir(20000); tentativa--; continue }
    // sem crédito, sem chave ou limite da chave: para a partida na hora (senão a IA vira "parada" e a partida não vale)
    if (/sem cota \(HTTP 402\)|sem chave|Key limit exceeded|HTTP 40[123]/i.test(r.text)) throw new Error(r.text)
    if (r.text === 'timeout' && process.env.IA_TIMEOUT_S && tentativa >= 1) break // já estourou o tempo 2 vezes: segue sem resposta
    await dormir(1500 * (tentativa + 1))
  }
  uso.falhas++
  uso.falhasPor[provider] = (uso.falhasPor[provider] ?? 0) + 1
  // o motivo das últimas falhas de cada IA (para saber se foi tempo, 429, resposta vazia...)
  uso.motivos = uso.motivos ?? {}
  ;(uso.motivos[provider] ??= []).push(String(ultimo?.porque ?? ultimo?.text ?? '').slice(0, 160) || 'resposta vazia')
  if (uso.motivos[provider].length > 15) uso.motivos[provider].shift()
  return { ok: false, text: '' }
}

// Extrai o primeiro objeto JSON da resposta (os modelos às vezes cercam com ```json)
export function lerJSON(texto) {
  if (!texto) return null
  const a = texto.indexOf('{')
  const b = texto.lastIndexOf('}')
  if (a < 0 || b <= a) return null
  try { return JSON.parse(texto.slice(a, b + 1)) } catch { return null }
}
