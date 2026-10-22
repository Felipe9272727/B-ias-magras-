// Falas da taverna entre as partidas (regra do canal: transição de lobby, até 5 s). Depois de cada partida, um lobo e
// o jogador que mais o acusou (ou a vidente) trocam uma fala curta. Cada um recebe SÓ a memória daquela partida (papéis
// revelados, debate, votos e resultado) e responde com o próprio modelo. Saída: logs/lobby.json.
// Uso: IA_DIRETO=1 node lobby.mjs <n da partida> ...
import fs from 'node:fs'
import { perguntar } from '../amongus/ia.mjs'

const PROVIDER = {
  padeira: 'haiku', ferreiro: 'haiku', boticaria: 'or:z-ai/glm-5.3-flash', lenhador: 'or:z-ai/glm-5.3-flash',
  costureira: 'or:qwen/qwen3.8-27b', pescador: 'or:qwen/qwen3.8-27b', moleiro: 'or:deepseek/deepseek-v4.1-flash',
  bardo: 'or:minimax/minimax-m3.1-flash',
}
const ARQ = 'logs/lobby.json'
const saida = fs.existsSync(ARQ) ? JSON.parse(fs.readFileSync(ARQ, 'utf8')) : {}
const limpar = (t) => t.replace(/<think>[\s\S]*?<\/think>/g, '').trim().split('\n').filter(Boolean).pop()?.replace(/^["“'«]|["”'»]$/g, '').replace(/^[\wÀ-ú]+:\s*/, '').trim() ?? ''

for (const n of process.argv.slice(2)) {
  if (saida[n]) continue
  const L = JSON.parse(fs.readFileSync(`logs/partida${n}.json`, 'utf8'))
  const J = Object.fromEntries(L.jogadores.map((j) => [j.nome, j]))
  const lobos = L.jogadores.filter((j) => j.papel === 'lobisomem')
  // quem mais votou nos lobos é o par do lobo mais votado; sem votos, a vidente
  const contra = {}
  for (const d of L.dias) for (const [eleitor, alvo] of Object.entries(d.votos ?? {})) {
    if (J[alvo]?.papel === 'lobisomem' && J[eleitor]?.papel !== 'lobisomem') contra[`${alvo}|${eleitor}`] = (contra[`${alvo}|${eleitor}`] ?? 0) + 1
  }
  const top = Object.entries(contra).sort((a, b) => b[1] - a[1])[0]?.[0]?.split('|')
  const lobo = top ? J[top[0]] : lobos[0]
  const outro = top ? J[top[1]] : L.jogadores.find((j) => j.papel === 'vidente')
  const memoria = [
    `Papéis revelados: ${L.jogadores.map((j) => `${j.nome}=${j.papel}`).join(', ')}.`,
    ...L.noites.map((x) => `Noite ${x.n}: morreram ${x.mortes.map((m) => `${m.nome} (${m.causa})`).join(', ') || 'ninguém'}.`),
    ...L.dias.map((d) => `Dia ${d.n}: ${d.falas.map((f) => `${f.nome}: ${f.fala}`).join(' / ')}. Banido: ${d.banido ?? 'ninguém'}.`),
    `Resultado: venceram os ${L.resultado.vencedor}.`,
  ].join('\n')
  const falas = []
  for (const j of [lobo, outro]) {
    const system = `Você é ${j.modelo}. Você acabou de jogar uma partida de Lobisomem como ${j.nome} (${j.papel.toUpperCase()}). Agora a partida acabou e todos estão na taverna, antes da próxima.`
    const antes = falas.length ? `\n\n${falas[0][2]} acabou de te dizer: "${falas[0][1]}". Responda.` : ''
    const prompt = `O que você lembra:\n${memoria}${antes}\n\nDiga UMA fala curta para ${(j === lobo ? outro : lobo).nome}, em português do Brasil, com no máximo 7 palavras, no tom de quem acabou de sair da partida (pode zoar, provocar, reclamar, se gabar ou pedir desculpa). Responda só a fala, sem aspas.`
    let fala = ''
    for (let t = 0; t < 3 && !fala; t++) {
      const r = await perguntar(PROVIDER[j.id], system, prompt, { maxTokens: 400, timeoutMs: 120000 })
      fala = r.ok ? limpar(r.text) : ''
    }
    console.log(n, j.nome, '→', fala)
    falas.push([j.id, fala, j.nome])
  }
  saida[n] = falas.map(([id, fala]) => [id, fala])
  fs.writeFileSync(ARQ, JSON.stringify(saida, null, 1))
}
