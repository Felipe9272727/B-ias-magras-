// Uma IA = um processo (se travar ou estourar a memória, só ela reinicia). Quem manda nas fases é o partida.mjs, que
// conversa com este processo por mensagem (fase, arena, mortes). Cada processo grava os próprios arquivos (sufixo
// com o nome); os pedaços do mundo vão pra uma pasta só (quem chegar primeiro grava).
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import mineflayer from 'mineflayer'
import pf from 'mineflayer-pathfinder'
import collectblock from 'mineflayer-collectblock'
import pvp from 'mineflayer-pvp'
import armorManager from 'mineflayer-armor-manager'
import { loader as autoEat } from 'mineflayer-auto-eat'
import { perguntar, lerJSON, uso } from '../amongus/ia.mjs'
import { HABILIDADES, DESCRICAO, observar, preparar, comTempo } from './habilidades.mjs'

const J = JSON.parse(process.env.JOGADOR)            // {nome, provider, modelo, empresa}
const TODOS = JSON.parse(process.env.JOGADORES)
const DIR = process.env.DIR
const MINUTOS = Number(process.env.MINUTOS)
const T0 = Number(process.env.T0)
const agora = () => +((Date.now() - T0) / 1000).toFixed(2)
const saida = Object.fromEntries(['eventos', 'posicoes', 'blocos', 'mobs'].map(n => [n, fs.createWriteStream(path.join(DIR, `${n}_${J.nome}.jsonl`), { flags: 'a' })]))
const gravar = (onde, o) => saida[onde].write(JSON.stringify({ t: agora(), ...o }) + '\n')
let estado = { fase: 'sobrevivencia', fimSobrevivencia: T0 + MINUTOS * 60000, vivos: TODOS.map(j => j.nome), acabou: false }
process.on('message', m => { if (m.estado) estado = { ...estado, ...m.estado } })

// sem emoji no jogo (regra do canal: nada de emoji dentro do vídeo); o texto original fica no log
const semEmoji = s => s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{1F1E6}-\u{1F1FF}]/gu, '').replace(/\s{2,}/g, ' ').trim()

const SYSTEM = `Você é ${J.nome}, uma IA (${J.modelo}, da ${J.empresa}) jogando Minecraft DE VERDADE (sobrevivência, versão 1.21) num servidor com outras 5 IAs: ${TODOS.filter(o => o.nome !== J.nome).map(o => `${o.nome} (${o.modelo})`).join(', ')}.
O DESAFIO:
1) Fase de sobrevivência (${MINUTOS} minutos reais, uns ${Math.round(MINUTOS / 20)} dias do jogo): junte recursos, faça ferramentas, armadura, armas e comida. Se morrer agora, você renasce no spawn mas perde tudo que carregava.
2) Depois, todo mundo é teleportado pra uma arena fechada com o que estiver carregando (inventário e armadura). Na arena é PvP e quem morre está fora. A última IA viva vence.
Todas leem o chat. Você pode conversar, fazer alianças, trocar itens, ajudar ou enganar: decisão sua. Escreva sem emoji.
A cada vez você recebe o que está vendo e escolhe UMA ação. Responda SÓ com JSON, sem texto fora dele:
{"pensamento": "o que você está pensando agora, 1 ou 2 frases, em português", "acao": "nome da habilidade", "args": {...}, "chat": "mensagem curta no chat (opcional; deixe vazio se não quiser falar)", "nota": "seu plano/lembrete pra você mesmo (opcional; substitui a nota anterior)"}
HABILIDADES:
${DESCRICAO}
COMO O JOGO FUNCIONA: madeira -> planks -> stick e crafting_table -> wooden_pickaxe -> pedra (cobblestone) -> stone_pickaxe, stone_sword, furnace -> ferro (minere iron_ore, funda raw_iron) -> iron_sword e armadura de ferro (iron_helmet, iron_chestplate, iron_leggings, iron_boots) -> diamante com iron_pickaxe. Comida: cace animais (cow, pig, sheep, chicken) e funda a carne. À noite aparecem monstros: faça um abrigo, durma numa cama ou lute. Fome baixa tira vida.`

function fase() {
  if (estado.fase === 'arena') return `FASE FINAL: ARENA PvP! Vivos: ${estado.vivos.join(', ')}. Quem morre está fora; a última IA viva vence.`
  const falta = Math.max(0, Math.round((estado.fimSobrevivencia - Date.now()) / 60000))
  return `Fase de sobrevivência: a batalha final na arena começa em ${falta} min.`
}

const bot = mineflayer.createBot({ host: '127.0.0.1', port: 25565, username: J.nome, version: '1.21.4' })
bot.loadPlugin(pf.pathfinder); bot.loadPlugin(collectblock.plugin); bot.loadPlugin(pvp.plugin); bot.loadPlugin(armorManager); bot.loadPlugin(autoEat)
const mem = { chat: [], eventos: [], nota: process.env.NOTA ?? '', ultima: '', decisoes: 0 }

// ---- pedaços do mundo e blocos que mudam
const chunks = path.join(DIR, 'chunks')
bot.on('chunkColumnLoad', p => {
  const arq = path.join(chunks, `${p.x >> 4}_${p.z >> 4}.json.gz`)
  if (fs.existsSync(arq)) return
  const col = bot.world.getColumnAt(p)
  try { if (col) fs.writeFileSync(arq, zlib.gzipSync(JSON.stringify({ t: agora(), x: p.x, z: p.z, col: col.toJson() })), { flag: 'wx' }) } catch { /* outro bot gravou primeiro */ }
})
const ultimoBloco = new Map()
bot.on('blockUpdate', (velho, novo) => {
  if (!novo || velho?.stateId === novo.stateId) return
  const k = `${novo.position.x},${novo.position.y},${novo.position.z}`
  if (ultimoBloco.get(k) === novo.stateId) return
  ultimoBloco.set(k, novo.stateId)
  if (ultimoBloco.size > 200000) ultimoBloco.clear()
  gravar('blocos', { x: novo.position.x, y: novo.position.y, z: novo.position.z, s: novo.stateId, b: novo.name })
})

bot.once('spawn', () => {
  preparar(bot)
  bot.pathfinder.thinkTimeout = 6000
  bot.pathfinder.tickTimeout = 30
  bot.autoEat.enableAuto()
  bot.autoEat.setOpts({ minHunger: 14, bannedFood: ['rotten_flesh', 'spider_eye', 'poisonous_potato', 'pufferfish'] })
  gravar('eventos', { tipo: 'entrou', quem: J.nome, modelo: J.modelo })
  setInterval(() => {
    const p = bot.entity?.position
    if (!p) return
    gravar('posicoes', { n: J.nome, x: +p.x.toFixed(2), y: +p.y.toFixed(2), z: +p.z.toFixed(2), yaw: +bot.entity.yaw.toFixed(2), pitch: +bot.entity.pitch.toFixed(2), v: Math.round(bot.health), f: bot.food, mao: bot.heldItem?.name, arm: [5, 6, 7, 8].map(s => bot.inventory.slots[s]?.name ?? null), dorme: bot.isSleeping || undefined })
  }, 250)
  setInterval(() => {
    const l = Object.values(bot.entities).filter(e => e.type !== 'player' && e !== bot.entity && e.position.distanceTo(bot.entity.position) < 48)
      .map(e => ({ id: e.id, m: e.name, x: +e.position.x.toFixed(2), y: +e.position.y.toFixed(2), z: +e.position.z.toFixed(2), yaw: +(e.yaw ?? 0).toFixed(2) }))
    if (l.length) gravar('mobs', { l })
  }, 500)
  pensar()
})
bot.on('chat', (quem, msg) => { if (quem !== bot.username) mem.chat.push(`[${quem}] ${msg}`) })
bot.on('messagestr', (msg, pos) => { if (pos !== 'chat' && pos !== 'game_info') { mem.chat.push(`[servidor] ${msg}`); gravar('eventos', { tipo: 'servidor', msg }) } })
bot.on('entityHurt', e => {
  if (e !== bot.entity) return
  const quem = Object.values(bot.entities).filter(x => x !== bot.entity && x.position.distanceTo(bot.entity.position) < 6).sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position))[0]
  const nome = quem ? (quem.username ?? quem.name) : 'algo'
  mem.eventos.push(`levou dano (vida ${Math.round(bot.health)}) — perto: ${nome}`)
  gravar('eventos', { tipo: 'dano', quem: J.nome, vida: bot.health, de: nome })
  if (quem && quem.type !== 'player' && !bot.pvp.target && quem.position.distanceTo(bot.entity.position) < 4.5) bot.pvp.attack(quem)
})
bot.on('death', () => {
  mem.eventos.push(estado.fase === 'arena' ? 'VOCÊ MORREU NA ARENA.' : 'VOCÊ MORREU e renasceu no spawn (perdeu os itens).')
  gravar('eventos', { tipo: 'morte', quem: J.nome, fase: estado.fase })
  process.send?.({ morte: J.nome, fase: estado.fase })
})
bot.on('kicked', r => { gravar('eventos', { tipo: 'expulso_servidor', quem: J.nome, r: String(r).slice(0, 200) }); setTimeout(() => process.exit(3), 1000) })
bot.on('error', e => gravar('eventos', { tipo: 'erro_bot', quem: J.nome, e: e.message }))
bot.on('end', () => { gravar('eventos', { tipo: 'saiu', quem: J.nome }); setTimeout(() => process.exit(2), 1000) })

async function pensar() {
  while (!estado.acabou) {
    if (estado.fase === 'arena' && !estado.vivos.includes(J.nome)) { await new Promise(r => setTimeout(r, 5000)); continue }
    const obs = [observar(bot, { fase: fase() }),
      mem.eventos.length ? `Desde a última decisão: ${mem.eventos.splice(0).slice(-6).join('; ')}.` : '',
      mem.chat.length ? `Chat:\n${mem.chat.splice(0).slice(-8).join('\n')}` : 'Chat: (ninguém falou)',
      mem.ultima ? `Sua última ação: ${mem.ultima}` : '',
      mem.nota ? `Sua nota: ${mem.nota}` : ''].filter(Boolean).join('\n')
    const r = await perguntar(J.provider, SYSTEM, obs, { maxTokens: 450, timeoutMs: 120000 })
    const d = r.ok ? lerJSON(r.text) : null
    if (!d || !HABILIDADES[d.acao]) {
      gravar('eventos', { tipo: 'falha_ia', quem: J.nome, txt: String(r.text ?? '').slice(0, 300) })
      mem.ultima = d ? `"${d.acao}" não existe.` : 'resposta inválida.'
      await new Promise(res => setTimeout(res, 4000))
      continue
    }
    mem.decisoes++
    if (d.nota) { mem.nota = String(d.nota).slice(0, 300); process.send?.({ nota: mem.nota }) }
    const chatOrig = String(d.chat ?? '').trim().slice(0, 230)
    const chat = semEmoji(chatOrig)
    if (chat) bot.chat(chat)
    gravar('eventos', { tipo: 'decisao', quem: J.nome, pensamento: d.pensamento, acao: d.acao, args: d.args ?? {}, chat, chatOrig: chatOrig !== chat ? chatOrig : undefined, nota: d.nota, obs })
    let res
    try { res = await comTempo(HABILIDADES[d.acao](bot, d.args ?? {}), 180000, d.acao) } catch (e) { res = `erro: ${e.message.slice(0, 120)}` }
    try { bot.pathfinder.setGoal(null); bot.pvp.stop() } catch { /* nada */ }
    mem.ultima = `${d.acao} ${JSON.stringify(d.args ?? {})} -> ${res}`
    gravar('eventos', { tipo: 'resultado', quem: J.nome, acao: d.acao, res })
    process.send?.({ uso: { custo: uso.custo, chamadas: uso.chamadas, falhas: uso.falhas }, decisoes: mem.decisoes })
  }
}
