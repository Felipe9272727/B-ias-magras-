// Cliente das IAs. Os pedidos vão por arquivo para a ponte do mod "deepseek" do Claude Code,
// que chama o DeepSeek Flash (com a chave guardada no mod) ou o Haiku (pelo cliente da sessão).
// provider "mock" responde na hora com uma ação aleatória, para testar o motor sem gastar nada.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const SPOOL = path.join(path.dirname(new URL(import.meta.url).pathname), '.spool')
fs.mkdirSync(path.join(SPOOL, 'req'), { recursive: true })
fs.mkdirSync(path.join(SPOOL, 'res'), { recursive: true })

export const uso = { chamadas: 0, falhas: 0, porProvider: {} }

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))

async function viaPonte(provider, system, prompt, maxTokens, timeoutMs) {
  const id = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
  const req = path.join(SPOOL, 'req', `${id}.json`)
  const res = path.join(SPOOL, 'res', `${id}.json`)
  fs.writeFileSync(req + '.tmp', JSON.stringify({ id, provider, system, prompt, max_tokens: maxTokens }))
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

export async function perguntar(provider, system, prompt, { maxTokens = 300, timeoutMs = 180000, mock } = {}) {
  uso.chamadas++
  uso.porProvider[provider] = (uso.porProvider[provider] ?? 0) + 1
  if (provider === 'mock') return { ok: true, text: mock ? mock() : '{}' }
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const r = await viaPonte(provider, system, prompt, maxTokens, timeoutMs)
    if (r.ok) return r
    if (/sem cota|sem chave/.test(r.text)) throw new Error(r.text)
    await dormir(1500 * (tentativa + 1))
  }
  uso.falhas++
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
