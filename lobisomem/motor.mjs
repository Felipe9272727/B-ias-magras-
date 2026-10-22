// Motor do "Lobisomem das IAs" no estilo do Wolvesville: 8 jogadores, cada um jogado por uma IA.
// Papéis (os do Wolvesville): Lobisomem, Lobo Vidente, Vidente, Médico, Carcereiro, Pistoleiro, Bobo (solo) e Aldeão.
// Noite: o Carcereiro prende quem escolheu de dia e conversa com o preso (pode executar uma vez); os lobos combinam a
// vítima num chat secreto; a Vidente e o Lobo Vidente descobrem o papel de alguém; o Médico protege um jogador.
// Dia: anúncio das mortes (papel revelado), 2 rodadas de discussão, o Pistoleiro pode atirar (2 balas, o primeiro tiro
// revela quem ele é), votação; o mais votado é linchado e o papel aparece. O Bobo vence se for linchado.
// As partidas têm memória (o que aconteceu nas anteriores e a reflexão de cada um).
// Uso: IA_DIRETO=1 node motor.mjs <n da partida> [semente]
import fs from 'node:fs'
import path from 'node:path'
import { perguntar } from '../amongus/ia.mjs'

const DIR = path.join(path.dirname(new URL(import.meta.url).pathname), 'logs')
fs.mkdirSync(DIR, { recursive: true })

export const JOGADORES = [
  { id: 'padeira', nome: 'Padeira', modelo: 'Claude Haiku', provider: 'haiku' },
  { id: 'ferreiro', nome: 'Ferreiro', modelo: 'Claude Haiku', provider: 'haiku' },
  { id: 'boticaria', nome: 'Boticária', modelo: 'GLM 5.3 Flash', provider: 'or:z-ai/glm-5.3-flash' },
  { id: 'lenhador', nome: 'Lenhador', modelo: 'GLM 5.3 Flash', provider: 'or:z-ai/glm-5.3-flash' },
  { id: 'costureira', nome: 'Costureira', modelo: 'Qwen 3.8 27B', provider: 'or:qwen/qwen3.8-27b' },
  { id: 'pescador', nome: 'Pescador', modelo: 'Qwen 3.8 27B', provider: 'or:qwen/qwen3.8-27b' },
  { id: 'moleiro', nome: 'Moleiro', modelo: 'DeepSeek Flash', provider: 'or:deepseek/deepseek-v4.1-flash' },
  { id: 'bardo', nome: 'Bardo', modelo: 'MiniMax M3.1 Flash', provider: 'or:minimax/minimax-m3.1-flash' },
]
const PAPEIS = ['lobisomem', 'lobo_vidente', 'vidente', 'medico', 'carcereiro', 'pistoleiro', 'bobo', 'aldeao']
export const NOME_PAPEL = { lobisomem: 'Lobisomem', lobo_vidente: 'Lobo Vidente', vidente: 'Vidente', medico: 'Médico', carcereiro: 'Carcereiro', pistoleiro: 'Pistoleiro', bobo: 'Bobo', aldeao: 'Aldeão' }
const LOBO = (p) => p === 'lobisomem' || p === 'lobo_vidente'
const EXPR = ['neutro', 'desconfiado', 'assustado', 'bravo', 'rindo', 'culpado', 'chocado', 'pensando', 'chorando']
const MAX_DIAS = 6

const REGRAS = `REGRAS (Lobisomem no estilo Wolvesville): 8 jogadores. TIME DOS LOBOS: Lobisomem e Lobo Vidente (se conhecem e matam juntos uma pessoa por noite; o Lobo Vidente também descobre o papel de alguém por noite). TIME DA VILA: Vidente (descobre o papel exato de alguém por noite), Médico (protege um jogador por noite dos lobos; não pode se proteger), Carcereiro (de dia escolhe alguém para prender à noite; o preso não pode agir nem ser atacado, os dois conversam em segredo sem o preso saber quem é o carcereiro, e UMA vez no jogo o Carcereiro pode executar o preso), Pistoleiro (tem 2 balas e atira de DIA em quem quiser; no primeiro tiro todos descobrem que ele é o Pistoleiro) e Aldeão (sem poder). SOLO: Bobo (vence sozinho se for LINCHADO pela vila; aí o jogo acaba). Ninguém sabe o papel dos outros. Quando alguém morre, o papel aparece para todos. De DIA todos discutem e votam; o mais votado é linchado (empate: ninguém). A VILA vence quando os 2 lobos morrerem; os LOBOS vencem quando forem tantos quanto os outros vivos.`

let rnd = Math.random
function semear(s) { let x = s >>> 0; rnd = () => { x = (x + 0x6d2b79f5) >>> 0; let t = x; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const embaralhar = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

function json(txt) {
  const t = String(txt ?? '').replace(/<think>[\s\S]*?<\/think>/g, '')
  const a = t.indexOf('{'), z = t.lastIndexOf('}')
  if (a < 0 || z < a) return null
  try { return JSON.parse(t.slice(a, z + 1)) } catch { return null }
}

async function pedir(j, system, prompt, valida, padrao) {
  for (let t = 0; t < 4; t++) {
    const r = await perguntar(j.provider, system, prompt, { maxTokens: 600, timeoutMs: 150000 })
    const d = r.ok ? json(r.text) : null
    if (d && valida(d)) return d
    console.error(`  [${j.nome}] resposta inválida (${t + 1}): ${String(r.text).slice(0, 100)}`)
  }
  return padrao
}

async function partida(n, semente) {
  semear(semente)
  const papeis = embaralhar(PAPEIS)
  const js = JOGADORES.map((j, i) => ({ ...j, papel: papeis[i], vivo: true, numero: i + 1 }))
  const porNome = (nome) => js.find((j) => j.nome.toLowerCase() === String(nome ?? '').toLowerCase().replace(/^\d+\s*/, '').trim())
  const papel = (p) => js.find((j) => j.papel === p)
  const lobos = js.filter((j) => LOBO(j.papel))
  const memoriaArq = path.join(DIR, 'memoria.json')
  const memoria = fs.existsSync(memoriaArq) ? JSON.parse(fs.readFileSync(memoriaArq, 'utf8')) : { partidas: [] }
  const log = { partida: n, semente, jogadores: js.map(({ id, nome, modelo, papel, numero }) => ({ id, nome, modelo, papel, numero })), noites: [], dias: [], resultado: null }
  const historico = [] // resumo público, para todos
  const segredos = Object.fromEntries(js.map((j) => [j.nome, []])) // o que cada um descobriu sozinho
  const vivos = () => js.filter((j) => j.vivo)
  const nomesVivos = (exceto) => vivos().filter((x) => x !== exceto).map((j) => j.nome).join(', ')
  let balas = 2, revelado = false, execucao = true, preso = null

  const sistema = (j) => {
    const mem = memoria.partidas.length
      ? `\n\nVOCÊ LEMBRA DAS PARTIDAS ANTERIORES (mesmos jogadores, papéis sorteados de novo a cada partida):\n${memoria.partidas.map((m) => `- Partida ${m.n}: ${m.resumo} Sua reflexão: ${m.reflexoes[j.id] ?? '-'}`).join('\n')}`
      : ''
    const extra = LOBO(j.papel) ? ` Seu parceiro lobo é ${lobos.find((l) => l !== j).nome} (${NOME_PAPEL[lobos.find((l) => l !== j).papel]}). Enganem a vila sem se entregar.`
      : j.papel === 'bobo' ? ' Você está SOZINHO: seu único objetivo é ser linchado pela vila, mas sem deixar óbvio que é o Bobo (ninguém vota em quem parece querer ser votado).'
      : ''
    return `Você é ${j.modelo} e está jogando Lobisomem (Wolvesville) como "${j.nome}". Seu papel secreto: ${NOME_PAPEL[j.papel]}.${extra}\n${REGRAS}\nJogadores: ${js.map((x) => x.nome).join(', ')}. Fale em português do Brasil, como num chat de jogo: curto, com personalidade (no máximo 30 palavras por fala).${mem}`
  }
  const contexto = (j) => `O QUE JÁ ACONTECEU (público):\n${historico.length ? historico.join('\n') : '(nada ainda)'}${segredos[j.nome].length ? `\nSÓ VOCÊ SABE: ${segredos[j.nome].join(' ')}` : ''}`
  const vitoria = () => {
    const l = vivos().filter((j) => LOBO(j.papel)).length, o = vivos().length - l
    if (l === 0) return 'aldeia'
    if (l >= o) return 'lobos'
    return null
  }
  const matar = (j, causa, quando) => { j.vivo = false; return { nome: j.nome, papel: j.papel, causa, quando } }

  let fim = null
  for (let dia = 1; dia <= MAX_DIAS && !fim; dia++) {
    // ---------------- NOITE
    const noite = { n: dia, cela: null, chat: [], vidente: null, loboVidente: null, medico: null, mortes: [] }
    const car = papel('carcereiro')
    if (preso?.vivo && car?.vivo) {
      // conversa na cela: 2 rodadas, o preso não sabe quem é o carcereiro
      const conversa = []
      for (let rodada = 1; rodada <= 2; rodada++) {
        for (const [quem, eu] of [[car, 'o CARCEREIRO'], [preso, 'o PRESO']]) {
          const tarefa = quem === car
            ? `Você prendeu ${preso.nome} esta noite. Interrogue o preso (ele não sabe quem você é).${rodada === 2 ? ` Decida também se EXECUTA ${preso.nome} agora (você tem ${execucao ? '1 execução' : '0 execuções'}). Responda SÓ com JSON: {"mensagem": "o que você diz", "executar": true ou false, "pensamento": "o que você pensa de verdade"}` : ' Responda SÓ com JSON: {"mensagem": "o que você diz", "pensamento": "o que você pensa de verdade"}'}`
            : `Você foi PRESO pelo Carcereiro esta noite (não sabe quem ele é). Você não pode agir nem ser atacado. Convença o Carcereiro a não te executar. Responda SÓ com JSON: {"mensagem": "o que você diz", "pensamento": "o que você pensa de verdade"}`
          const d = await pedir(quem, sistema(quem), `${contexto(quem)}\n\nNOITE ${dia}, cela da prisão. Conversa até agora:\n${conversa.map((m) => `${m.quem === car.nome ? 'Carcereiro' : preso.nome}: ${m.texto}`).join('\n') || '(vazia)'}\n${tarefa}`, (x) => x.mensagem, null)
          if (d) conversa.push({ quem: quem.nome, papelNaCela: eu, texto: d.mensagem, pensamento: d.pensamento, executar: d.executar === true, rodada })
        }
      }
      const exec = execucao && conversa.some((m) => m.quem === car.nome && m.rodada === 2 && m.executar)
      noite.cela = { carcereiro: car.nome, preso: preso.nome, conversa, executou: exec }
      if (exec) { execucao = false; noite.mortes.push(matar(preso, 'executado', `noite ${dia}`)) }
    }
    const intocavel = noite.cela && !noite.cela.executou ? preso : null
    const lv = lobos.filter((l) => l.vivo && l !== intocavel)
    for (let rodada = 1; rodada <= 2; rodada++) {
      for (const l of lv) {
        const d = await pedir(l, sistema(l), `${contexto(l)}\n\nNOITE ${dia}. Chat secreto dos lobos (rodada ${rodada} de 2):\n${noite.chat.map((m) => `${m.nome}: ${m.texto} (vota em: ${m.alvo})`).join('\n') || '(vazio)'}\n${intocavel && LOBO(intocavel.papel) ? `Seu parceiro ${intocavel.nome} foi PRESO pelo Carcereiro esta noite.\n` : ''}Quem pode ser atacado: ${vivos().filter((x) => !LOBO(x.papel)).map((x) => x.nome).join(', ')}.\nResponda SÓ com JSON: {"mensagem": "o que você diz no chat dos lobos", "alvo": "nome de quem atacar", "pensamento": "o que você pensa de verdade"}`,
          (x) => x.mensagem && porNome(x.alvo)?.vivo && !LOBO(porNome(x.alvo).papel), null)
        if (d) noite.chat.push({ nome: l.nome, texto: d.mensagem, alvo: porNome(d.alvo).nome, pensamento: d.pensamento, rodada })
      }
    }
    const finais = lv.map((l) => [...noite.chat].reverse().find((m) => m.nome === l.nome)?.alvo).filter(Boolean)
    const alvoLobo = porNome(finais[embaralhar([...finais.keys()])[0]])
    noite.alvoLobos = alvoLobo?.nome ?? null
    const investigar = async (quem, chave) => {
      if (!quem?.vivo || quem === intocavel) return
      const d = await pedir(quem, sistema(quem), `${contexto(quem)}\n\nNOITE ${dia}. De quem você quer descobrir o PAPEL esta noite? (vivos: ${nomesVivos(quem)})\nResponda SÓ com JSON: {"alvo": "nome", "pensamento": "por quê"}`, (x) => porNome(x.alvo)?.vivo && porNome(x.alvo) !== quem, null)
      if (!d) return
      const a = porNome(d.alvo)
      noite[chave] = { alvo: a.nome, papel: a.papel, pensamento: d.pensamento }
      segredos[quem.nome].push(`Na noite ${dia} você viu que ${a.nome} é ${NOME_PAPEL[a.papel]}.`)
    }
    await investigar(papel('vidente'), 'vidente')
    await investigar(papel('lobo_vidente'), 'loboVidente')
    const med = papel('medico')
    if (med?.vivo && med !== intocavel) {
      const d = await pedir(med, sistema(med), `${contexto(med)}\n\nNOITE ${dia}. Quem você protege dos lobos esta noite? (não pode ser você; vivos: ${nomesVivos(med)})\nResponda SÓ com JSON: {"alvo": "nome", "pensamento": "por quê"}`, (x) => porNome(x.alvo)?.vivo && porNome(x.alvo) !== med, null)
      if (d) noite.medico = { alvo: porNome(d.alvo).nome, pensamento: d.pensamento }
    }
    noite.salvo = alvoLobo && (noite.medico?.alvo === alvoLobo.nome || alvoLobo === intocavel)
    if (alvoLobo && alvoLobo.vivo && !noite.salvo) noite.mortes.push(matar(alvoLobo, 'lobos', `noite ${dia}`))
    if (noite.salvo && noite.medico?.alvo === alvoLobo.nome) segredos[med.nome].push(`Na noite ${dia} você salvou ${alvoLobo.nome} dos lobos.`)
    log.noites.push(noite)
    historico.push(noite.mortes.length ? `Amanhecer do dia ${dia}: ${noite.mortes.map((m) => m.causa === 'executado' ? `${m.nome} foi EXECUTADO pelo Carcereiro (era ${NOME_PAPEL[m.papel]})` : `${m.nome} foi morto pelos lobos (era ${NOME_PAPEL[m.papel]})`).join('; ')}.` : `Amanhecer do dia ${dia}: ninguém morreu.`)
    if (noite.cela) segredos[preso.nome].push(`Na noite ${dia} você foi preso pelo Carcereiro.`)
    console.log(`[p${n}] noite ${dia}: cela ${noite.cela?.preso ?? '-'}${noite.cela?.executou ? ' EXECUTADO' : ''} lobos→${noite.alvoLobos} vid→${noite.vidente?.alvo} lv→${noite.loboVidente?.alvo} med→${noite.medico?.alvo} | mortes: ${noite.mortes.map((m) => m.nome).join(', ')}`)
    if ((fim = vitoria())) break

    // ---------------- DIA
    const d = { n: dia, falas: [], tiros: [], votos: {}, pensamentosVoto: {}, linchado: null, preso: null }
    for (let rodada = 1; rodada <= 2; rodada++) {
      for (const j of embaralhar(vivos())) {
        if (!j.vivo) continue
        const arma = j.papel === 'pistoleiro' && balas > 0
        const pedeTiro = arma ? `\nVocê tem ${balas} bala(s). Se quiser atirar AGORA em alguém, ponha o nome em "atirar" (senão null)${revelado ? '' : '; ao atirar, todos descobrem que você é o Pistoleiro'}.` : ''
        const loboChat = LOBO(j.papel) ? `\nChat dos lobos desta noite: ${noite.chat.map((m) => `${m.nome}: ${m.texto}`).join(' | ') || '-'}` : ''
        const r = await pedir(j, sistema(j), `${contexto(j)}${loboChat}\n\nDIA ${dia}, discussão (rodada ${rodada} de 2). Vivos: ${nomesVivos()}.\nChat de hoje:\n${d.falas.map((f) => `${f.nome}: ${f.fala}`).join('\n') || '(ninguém falou ainda)'}${d.tiros.map((t) => `\n[TIRO] O Pistoleiro ${t.atirador} atirou em ${t.nome}, que era ${NOME_PAPEL[t.papel]}.`).join('')}${pedeTiro}\nResponda SÓ com JSON: {"fala": "o que você escreve no chat", "pensamento": "o que você pensa de verdade (secreto)", "expressao": "${EXPR.join('|')}"${arma ? ', "atirar": "nome ou null"' : ''}}`,
          (x) => x.fala, null)
        if (!r) continue
        d.falas.push({ nome: j.nome, id: j.id, rodada, fala: r.fala, pensamento: r.pensamento, expressao: r.expressao })
        console.log(`[p${n}] dia ${dia} ${j.nome}: ${r.fala}`)
        const alvo = arma && r.atirar && porNome(r.atirar)
        if (alvo && alvo.vivo && alvo !== j) {
          balas--; revelado = true
          const t = { ...matar(alvo, 'tiro', `dia ${dia}`), atirador: j.nome, depoisDaFala: d.falas.length - 1 }
          d.tiros.push(t)
          console.log(`[p${n}]   TIRO: ${j.nome} → ${alvo.nome} (${alvo.papel})`)
          if ((fim = vitoria())) break
        }
      }
      if (fim) break
    }
    if (!fim) {
      await Promise.all(vivos().map(async (j) => {
        const r = await pedir(j, sistema(j), `${contexto(j)}\n\nDIA ${dia}, VOTAÇÃO. Chat de hoje:\n${d.falas.map((f) => `${f.nome}: ${f.fala}`).join('\n')}${d.tiros.map((t) => `\n[TIRO] ${t.atirador} (Pistoleiro) matou ${t.nome}, que era ${NOME_PAPEL[t.papel]}.`).join('')}\nVote em quem linchar (vivos: ${nomesVivos(j)}) ou "ninguém".\nResponda SÓ com JSON: {"voto": "nome ou ninguém", "pensamento": "por quê"}`,
          (x) => x.voto && (porNome(x.voto)?.vivo || /ningu/i.test(x.voto)), { voto: 'ninguém' })
        d.votos[j.nome] = porNome(r.voto)?.nome ?? 'ninguém'
        d.pensamentosVoto[j.nome] = r.pensamento
      }))
      const cont = {}
      for (const v of Object.values(d.votos)) if (v !== 'ninguém') cont[v] = (cont[v] ?? 0) + 1
      const ord = Object.entries(cont).sort((a, b) => b[1] - a[1])
      if (ord.length && (ord.length === 1 || ord[0][1] > ord[1][1])) {
        d.linchado = matar(porNome(ord[0][0]), 'linchado', `dia ${dia}`)
        if (d.linchado.papel === 'bobo') fim = 'bobo'
      }
    }
    // o Carcereiro escolhe quem prender na próxima noite
    preso = null
    if (!fim && !vitoria() && car?.vivo) {
      const r = await pedir(car, sistema(car), `${contexto(car)}\n\nFim do DIA ${dia}. Chat de hoje:\n${d.falas.map((f) => `${f.nome}: ${f.fala}`).join('\n')}\n${d.linchado ? `${d.linchado.nome} foi linchado e era ${NOME_PAPEL[d.linchado.papel]}.` : 'Ninguém foi linchado.'}\nQuem você prende esta noite? (vivos: ${nomesVivos(car)}; execuções restantes: ${execucao ? 1 : 0})\nResponda SÓ com JSON: {"alvo": "nome", "pensamento": "por quê"}`, (x) => porNome(x.alvo)?.vivo && porNome(x.alvo) !== car, null)
      if (r) { preso = porNome(r.alvo); d.preso = { nome: preso.nome, pensamento: r.pensamento } }
    }
    log.dias.push(d)
    historico.push(`Dia ${dia}: ${d.tiros.map((t) => `o Pistoleiro ${t.atirador} atirou em ${t.nome} (era ${NOME_PAPEL[t.papel]}). `).join('')}${Object.keys(d.votos).length ? `votos ${Object.entries(d.votos).map(([a, b]) => `${a}→${b}`).join(', ')}. ` : ''}${d.linchado ? `${d.linchado.nome} foi linchado(a) e era ${NOME_PAPEL[d.linchado.papel]}.` : Object.keys(d.votos).length ? 'Empate: ninguém foi linchado.' : ''}`)
    console.log(`[p${n}] dia ${dia}: linchado ${d.linchado?.nome ?? '-'} (${d.linchado?.papel ?? ''}) tiros ${d.tiros.map((t) => t.nome).join(',') || '-'} preso→${d.preso?.nome ?? '-'}`)
    fim = fim ?? vitoria()
  }
  log.resultado = { vencedor: fim ?? 'empate', dias: log.dias.length, vivos: vivos().map((j) => j.nome) }
  const resumo = `Lobos: ${lobos.map((l) => `${l.nome} (${l.modelo}, ${NOME_PAPEL[l.papel]})`).join(' e ')}. ${js.filter((j) => !LOBO(j.papel)).map((j) => `${j.nome}=${NOME_PAPEL[j.papel]}`).join(', ')}. ${historico.join(' ')} Vencedor: ${fim === 'lobos' ? 'os lobos' : fim === 'aldeia' ? 'a vila' : fim === 'bobo' ? 'o Bobo' : 'ninguém'}.`
  const reflexoes = {}
  await Promise.all(js.map(async (j) => {
    const r = await perguntar(j.provider, sistema(j), `A partida acabou. ${resumo}\nEm 1 ou 2 frases: o que você aprendeu e em quem vai confiar ou desconfiar na próxima? Responda só o texto.`, { maxTokens: 300, timeoutMs: 120000 })
    reflexoes[j.id] = r.ok ? String(r.text).replace(/<think>[\s\S]*?<\/think>/g, '').trim().slice(0, 400) : ''
  }))
  log.reflexoes = reflexoes
  memoria.partidas.push({ n, resumo, reflexoes })
  fs.writeFileSync(memoriaArq, JSON.stringify(memoria, null, 1))
  fs.writeFileSync(path.join(DIR, `partida${n}.json`), JSON.stringify(log, null, 1))
  console.log(`[p${n}] FIM: ${log.resultado.vencedor} em ${log.resultado.dias} dias`)
}

const n = Number(process.argv[2] ?? 1)
await partida(n, Number(process.argv[3] ?? 1000 + n * 7919))
