// chaves-ias: guarda as chaves de API no armazenamento do mod ($.store), nunca no repositório.
// Uso: /chave openrouter <chave> · /chave deepseek <chave> · /chave elevenlabs <chave> · /chave (lista o que está guardado)
// Toda linha do histórico que contiver algo com cara de chave é guardada mascarada (só o começo e o fim aparecem).
// Os scripts dos vídeos (amongus/ia.mjs) leem o arquivo do armazenamento deste mod, como liam o do mod antigo.
import type { Register } from 'claude-code'

const SERVICOS = ['openrouter', 'deepseek', 'elevenlabs'] as const
// sk-or-v1- (OpenRouter), sk- (DeepSeek), sk_ (ElevenLabs), sk-ant-, xi-, ek_: com traço OU sublinhado
const PADRAO = /(sk-or-v1-|sk-ant-|sk[-_]|xi[-_]|ek_)[A-Za-z0-9_-]{16,}/gi
const mascarar = (s: string) => s.replace(PADRAO, k => `${k.slice(0, 8)}***${k.slice(-3)}`)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'chave', description: 'Guarda uma chave de API (openrouter, deepseek, elevenlabs) sem expor no chat', argumentHint: '[servico] [chave]' })
    return next(e)
  })

  on('command.run', { command: 'chave' }, async ($, e) => {
    const [servico, valor] = e.args.trim().split(/\s+/)
    if (!servico) {
      const linhas = await Promise.all(SERVICOS.map(async s => {
        const v = (await $.store.get(s)) as string | undefined
        return `- ${s}: ${v ? mascarar(v) : 'não guardada'}`
      }))
      return { text: `Chaves guardadas no mod:\n${linhas.join('\n')}` }
    }
    const s = servico.toLowerCase() as (typeof SERVICOS)[number]
    if (!SERVICOS.includes(s)) return { text: `Serviço desconhecido: use ${SERVICOS.join(', ')}.` }
    if (!valor) {
      await $.store.delete(s)
      return { text: `Chave do ${s} apagada do mod.` }
    }
    await $.store.set(s, valor)
    return { text: `Chave do ${s} guardada no mod (${mascarar(valor)}).` }
  })

  // nada com cara de chave fica legível no histórico (a mensagem do /chave inclusive)
  on('session.append', async ($, e, next) => {
    const txt = JSON.stringify(e)
    if (!PADRAO.test(txt)) return next(e)
    PADRAO.lastIndex = 0
    return next(JSON.parse(mascarar(txt)))
  })
}
