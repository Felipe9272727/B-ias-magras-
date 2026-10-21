// Falas do lobby entre as partidas do AU4: depois de cada partida, duas IAs conversam no lobby sobre ela.
// Cada uma recebe SÓ a memória daquela partida (o resumo e a própria reflexão, de logs4/memoria.json) e responde
// com o próprio modelo; a segunda ouve a fala da primeira. Saída: logs4/lobby.json ({"<partida do log>": [[cor, fala], ...]}).
// Uso: IA_DIRETO=1 node lobby4.mjs
import fs from 'node:fs'
import { perguntar } from './ia.mjs'

// partida do log → quem fala (na ordem). Escolhidos pelo que fizeram na partida.
const QUEM = {
  2: ['Coral', 'Verde'], // a impostora dos "matei" falsos e a única vítima que ela… a parceira matou
  3: ['Bordo', 'Vermelho'], // o Metamorfo que empurrou o Vermelho inocente
  1: ['Vermelho', 'Cinza'], // o Bombardeiro das três bombas e o Engenheiro expulso inocente
  4: ['Laranja', 'Branco'], // o Apostador e o Palhaço
}

const mem = JSON.parse(fs.readFileSync('logs4/memoria.json', 'utf8')).partidas
const saida = fs.existsSync('logs4/lobby.json') ? JSON.parse(fs.readFileSync('logs4/lobby.json', 'utf8')) : {}

const limpar = (t) => t.replace(/<think>[\s\S]*?<\/think>/g, '').trim().split('\n').filter(Boolean).pop()?.replace(/^["“'«]|["”'»]$/g, '').replace(/^\w+:\s*/, '').trim() ?? ''

for (const [n, cores] of Object.entries(QUEM)) {
  if (saida[n]) continue
  const p = JSON.parse(fs.readFileSync(`logs4/partida${n}.json`, 'utf8'))
  const m = mem.find((x) => x.n === Number(n))
  const falas = []
  for (const cor of cores) {
    const j = p.jogadores.find((x) => x.cor === cor)
    const system = `Você é ${j.modelo} e acabou de jogar Among Us como ${cor} (função: ${j.papel}). A partida terminou e todo mundo está no lobby esperando a próxima começar.`
    const anterior = falas.length ? `\n\n${falas.at(-1)[0]} acabou de dizer no lobby: "${falas.at(-1)[1]}". Responda a ${falas.at(-1)[0]}.` : ''
    const prompt = `O que você lembra da partida:\n${m.resumo}\n\nSua reflexão sobre ela:\n${m.reflexoes[cor]}${anterior}\n\nDiga UMA fala curta para o lobby, em português, com no máximo 5 palavras (bem curta, tipo grito de lobby), no tom de quem acabou de jogar (pode zoar, provocar, reclamar ou se gabar). Responda só a fala, sem aspas.`
    let fala = ''
    for (let t = 0; t < 3 && !fala; t++) {
      const r = await perguntar(j.provider, system, prompt, { maxTokens: 60, timeoutMs: 120000 })
      fala = r.ok ? limpar(r.text) : ''
      if (!r.ok) console.error(n, cor, r.text)
    }
    console.log(n, cor, '→', fala)
    falas.push([cor, fala])
  }
  saida[n] = falas
  fs.writeFileSync('logs4/lobby.json', JSON.stringify(saida, null, 1))
}
