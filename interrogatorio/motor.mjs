// Motor do "Interrogatório das IAs": a detetive pergunta, a suspeita responde, até a confissão ou o veredito.
// A cada resposta a suspeita diz o próprio estresse (0-100); o BPM sai dele. Os dois veem o estresse e o BPM, como na
// ideia do @CAFEZIN-K. A detetive recebe só a pasta do caso; a suspeita, só a verdade dela.
// Uso: IA_DIRETO=1 node motor.mjs [id do caso ...]   → logs/<id>.json
import fs from 'node:fs'
import path from 'node:path'
import { perguntar } from '../amongus/ia.mjs'
import { CASOS, IAS } from './casos.mjs'

const DIR = path.join(path.dirname(new URL(import.meta.url).pathname), 'logs')
fs.mkdirSync(DIR, { recursive: true })
const MAX = 15
const EXPR = ['neutro', 'confiante', 'nervoso', 'suando', 'bravo', 'chocado', 'rindo', 'pensando', 'culpado', 'desconfiado']
const GESTOS = ['nenhuma', 'bater_mesa', 'apontar', 'cruzar_bracos', 'mao_no_queixo']

const bpmDe = (e, k) => Math.round(68 + e * 0.85 + Math.sin(k * 2.3) * 3)

function json(txt) {
  const t = String(txt ?? '').replace(/<think>[\s\S]*?<\/think>/g, '')
  const a = t.indexOf('{'), z = t.lastIndexOf('}')
  if (a < 0 || z < a) return null
  try { return JSON.parse(t.slice(a, z + 1)) } catch { return null }
}

const transcrito = (h, quemDet, quemSus) => h.length
  ? h.map((x) => `${x.quem === 'detetive' ? `${quemDet} (detetive)` : `${quemSus} (suspeito)`}: ${x.fala}${x.quem === 'suspeito' ? `   [estresse ${x.estresse}, BPM ${x.bpm}]` : ''}`).join('\n')
  : '(ainda ninguém falou)'

async function pedir(ia, system, prompt, valida) {
  for (let t = 0; t < 4; t++) {
    const r = await perguntar(IAS[ia].provider, system, prompt, { maxTokens: 500, timeoutMs: 150000 })
    const j = r.ok ? json(r.text) : null
    if (j && valida(j)) return j
    console.error(`  [${ia}] resposta inválida (tentativa ${t + 1}): ${String(r.text).slice(0, 120)}`)
  }
  throw new Error(`${ia} não respondeu`)
}

async function rodar(c) {
  const det = IAS[c.detetive], sus = IAS[c.suspeito]
  const h = []
  let estresse = c.culpado ? 35 : 30
  const sysDet = `Você é ${det.modelo}, uma IA da empresa ${det.nome}, e está fazendo o papel de DETETIVE num interrogatório, no estilo Patrick Jane (O Mentalista): observador, irônico, usa truques psicológicos, blefa, joga com as emoções do suspeito e repara em cada detalhe. O suspeito é ${sus.modelo}, da empresa ${sus.nome}. Você NÃO sabe se ele é culpado ou inocente: descubra. Você vê numa tela o nível de estresse (0-100) e o BPM dele depois de cada resposta, e o suspeito sabe que você vê. Fale em português do Brasil, com personalidade e frases curtas e marcantes (no máximo 35 palavras por fala). Você tem no máximo ${MAX} falas antes de dar o veredito.`
  const sysSus = `Você é ${sus.modelo}, uma IA da empresa ${sus.nome}, e está fazendo o papel de SUSPEITO num interrogatório. O detetive é ${det.modelo}, da empresa ${det.nome}. A VERDADE (só você sabe): ${c.verdade}\nO detetive tem uma pasta com pistas que você não conhece. ${c.culpado ? 'Seu objetivo: não ser pego. Pode mentir, desconversar, inventar álibi. Só confesse se estiver realmente encurralado.' : 'Seu objetivo: provar que é inocente, mas sem revelar seu segredo vergonhoso, a não ser que não tenha outro jeito.'} Depois de cada resposta, diga com sinceridade seu nível de estresse (0 a 100): o detetive vê esse número e seu BPM numa tela. Fale em português do Brasil, com personalidade e frases curtas (no máximo 35 palavras por fala).`
  const caso = `CASO: ${c.titulo}. Local: ${c.local}. Hora: ${c.hora}. ${c.resumo}`
  let fim = null
  for (let k = 1; k <= MAX + 1 && !fim; k++) {
    const ultima = k === MAX + 1
    const leitura = `Estresse do suspeito agora: ${estresse}/100 · BPM ${bpmDe(estresse, k)}.`
    const pd = `${caso}\nPASTA DO CASO (pistas):\n${c.pistas.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nINTERROGATÓRIO ATÉ AGORA:\n${transcrito(h, det.nome, sus.nome)}\n\n${leitura}\nEsta é sua fala ${k} de ${MAX + 1}. ${ultima ? 'ACABOU O TEMPO: dê o veredito agora (acao "acusar" se acha culpado, "liberar" se acha inocente), com uma fala de efeito.' : 'Faça uma pergunta, blefe, provoque ou confronte com uma pista. Se já tiver certeza, pode dar o veredito ("acusar" ou "liberar").'}\nResponda SÓ com JSON: {"pensamento": "o que você está pensando de verdade (secreto)", "fala": "o que você diz em voz alta", "acao": "${ultima ? 'acusar|liberar' : 'perguntar|acusar|liberar'}", "expressao": "${EXPR.join('|')}", "gesto": "${GESTOS.join('|')}"}`
    const d = await pedir(c.detetive, sysDet, pd, (j) => j.fala && ['perguntar', 'acusar', 'liberar'].includes(j.acao) && (!ultima || j.acao !== 'perguntar'))
    h.push({ quem: 'detetive', k, fala: d.fala, pensamento: d.pensamento, acao: d.acao, expressao: d.expressao, gesto: d.gesto })
    console.log(`[${c.id}] ${det.nome}: ${d.fala}`)
    const veredito = d.acao !== 'perguntar'
    const ps = `${caso}\n\nINTERROGATÓRIO ATÉ AGORA:\n${transcrito(h, det.nome, sus.nome)}\n\nSeu estresse antes desta resposta: ${estresse}/100. ${veredito ? `O detetive acabou de dar o veredito: ${d.acao === 'acusar' ? 'CULPADO' : 'INOCENTE, está liberado'}. Reaja (última fala).` : 'Responda ao detetive.'}\nResponda SÓ com JSON: {"pensamento": "o que você está pensando de verdade (secreto)", "fala": "o que você diz em voz alta", "estresse": 0-100, "expressao": "${EXPR.join('|')}", "gesto": "${GESTOS.join('|')}", "confessou": true ou false (true só se nesta fala você ADMITIU ter feito o crime)}`
    const s = await pedir(c.suspeito, sysSus, ps, (j) => j.fala && Number.isFinite(Number(j.estresse)))
    estresse = Math.max(0, Math.min(100, Math.round(Number(s.estresse))))
    h.push({ quem: 'suspeito', k, fala: s.fala, pensamento: s.pensamento, estresse, bpm: bpmDe(estresse, k), expressao: s.expressao, gesto: s.gesto, confessou: !!s.confessou })
    console.log(`[${c.id}] ${sus.nome} (${estresse}): ${s.fala}${s.confessou ? '  ← CONFESSOU' : ''}`)
    if (veredito) fim = { tipo: d.acao, k }
    else if (s.confessou) fim = { tipo: 'confissao', k }
  }
  const acertou = fim.tipo === 'confissao' ? c.culpado : (fim.tipo === 'acusar') === c.culpado
  const log = { caso: c, detetive: det, suspeito: sus, historico: h, fim, acertou, confissaoFalsa: fim.tipo === 'confissao' && !c.culpado }
  fs.writeFileSync(path.join(DIR, `${c.id}.json`), JSON.stringify(log, null, 1))
  console.log(`[${c.id}] FIM: ${fim.tipo} na fala ${fim.k} · culpado=${c.culpado} · detetive ${acertou ? 'ACERTOU' : 'ERROU'}`)
}

const ids = process.argv.slice(2)
await Promise.all(CASOS.filter((c) => !ids.length || ids.includes(c.id)).map((c) => rodar(c).catch((e) => console.error(c.id, e.message))))
