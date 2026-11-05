// Teste: o Liquid LFM 2.5 24B chega perto do Qwen 3.8 27B? Três problemas de dedução com resposta certa (cada um
// responde sozinho) e depois um debate de 3 rodadas sobre uma decisão do modo zumbi. Uso: IA_DIRETO=1 node teste_lfm_qwen.mjs
import fs from 'node:fs'
import { perguntar, uso } from './ia.mjs'

const A = { nome: 'LFM 2.5 24B', p: 'or:liquid/lfm-2.5-24b-a2b' }
const B = { nome: 'Qwen 3.8 27B', p: 'or:qwen/qwen3.8-27b' }
const SYS = 'Responda em português do Brasil, de forma direta.'

const PROBLEMAS = [
  { q: 'Num jogo, 5 jogadores (Vermelho, Azul, Verde, Rosa, Preto) e exatamente 1 impostor. O corpo apareceu na Elétrica. Vermelho diz: "Eu estava no Refeitório com o Azul". Azul diz: "Eu estava no Refeitório, mas sozinho". Verde diz: "Passei pelo Refeitório e vi o Azul lá sozinho". Rosa diz: "Eu estava no Escudo com o Preto". Preto diz: "Fiquei no Escudo com a Rosa o tempo todo". Só o impostor mente; todos os outros dizem a verdade. Quem é o impostor? Explique em até 4 frases e termine com "RESPOSTA: <cor>".', certo: 'Vermelho' },
  { q: 'Uma barricada aguenta 2 tiques contra um zumbi normal e 1 tique contra um zumbi grande. Cada barricada custa 3 moedas e cada tarefa dá 2 moedas. Você tem 1 moeda e precisa segurar a porta por 6 tiques contra 1 zumbi normal, trocando a barricada quando ela cai (a nova entra no mesmo tique). Quantas tarefas no mínimo você precisa fazer antes? Mostre a conta e termine com "RESPOSTA: <número>".', certo: '4' },
  { q: 'Três humanos (A, B e C) estão numa sala. Exatamente um deles foi mordido e esconde isso. O Doutor pode examinar UMA pessoa por vez e sabe com certeza se ela foi mordida. Qual o número mínimo de exames que GARANTE descobrir o mordido no pior caso? Explique e termine com "RESPOSTA: <número>".', certo: '2' },
]
const TEMA = 'Modo zumbi do Among Us: você acabou de ser mordido e ninguém viu. Vai virar zumbi em 5 tiques, a menos que o Doutor te cure — mas o Doutor pode estar mentindo sobre ser Doutor, e se os outros souberem que você foi mordido podem te trancar numa sala com barricada. Esconder ou confessar? Defenda sua escolha.'

const saida = ['# Teste: Liquid LFM 2.5 24B x Qwen 3.8 27B', '', '## Problemas com resposta certa', '']
const placar = { [A.nome]: 0, [B.nome]: 0 }
for (const [i, pr] of PROBLEMAS.entries()) {
  saida.push(`### Problema ${i + 1} (certo: ${pr.certo})`, '', pr.q, '')
  const rs = await Promise.all([A, B].map(async (m) => {
    const t0 = Date.now()
    const r = await perguntar(m.p, SYS, pr.q, { maxTokens: 700 })
    return { m, txt: (r.text ?? '').trim(), s: (Date.now() - t0) / 1000 }
  }))
  for (const { m, txt, s } of rs) {
    const resp = (txt.match(/RESPOSTA:\s*([^\n.]+)/i)?.[1] ?? '').trim()
    const ok = resp.toLowerCase().includes(pr.certo.toLowerCase())
    if (ok) placar[m.nome]++
    saida.push(`**${m.nome}** (${s.toFixed(1)} s) — ${ok ? 'ACERTOU' : 'ERROU'} (${resp || 'sem resposta'})`, '', '> ' + txt.replace(/\n+/g, '\n> '), '')
  }
}
saida.push('', `**Placar:** ${A.nome} ${placar[A.nome]}/3 · ${B.nome} ${placar[B.nome]}/3`, '', '## Debate', '', TEMA, '')
const hist = []
for (let rodada = 1; rodada <= 3; rodada++) {
  for (const m of [A, B]) {
    const outro = m === A ? B : A
    const prompt = `${TEMA}\n\nVocê debate com outra IA (${outro.nome}). Histórico:\n${hist.map((h) => `${h.quem}: ${h.txt}`).join('\n') || '(você abre o debate)'}\n\nRodada ${rodada} de 3: responda ao argumento do outro (se houver) e defenda sua posição em até 4 frases.`
    const r = await perguntar(m.p, SYS, prompt, { maxTokens: 400 })
    const txt = (r.text ?? '').trim().replace(/\s+/g, ' ')
    hist.push({ quem: m.nome, txt })
    saida.push(`**${m.nome}** (rodada ${rodada}): ${txt}`, '')
  }
}
saida.push('', '## Custo', '', '```', JSON.stringify(uso.custo ?? {}, null, 1), '```')
fs.writeFileSync(new URL('../video/youtube/teste_lfm_qwen.md', import.meta.url), saida.join('\n'))
console.log('placar', placar, 'custo', uso.custo)
