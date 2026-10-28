// 6 IAs jogando Minecraft de verdade (servidor oficial 1.21.4 + Mineflayer), ideia do @FAMILIAGMS: elas sobrevivem e
// juntam recursos por muito tempo; depois vão todas pra uma arena com o que carregam, e a última viva vence.
// Este é o maestro: abre um processo por IA (bot.mjs), avisa no chat quanto falta, monta a arena, tira da partida
// quem morre na arena e declara a vencedora. Tudo fica gravado em gravacoes/<data>/ pro replay 3D (replay.mjs).
// Uso: IA_DIRETO=1 node partida.mjs [minutos de sobrevivência=180] [só estes jogadores, separados por vírgula]
import fs from 'node:fs'
import path from 'node:path'
import { fork } from 'node:child_process'
import { rcon } from './rcon.mjs'

const MINUTOS = Number(process.argv[2] ?? 180)
const SO = process.argv[3]?.split(',')
export const JOGADORES = [
  { nome: 'DeepSeek', provider: 'or:deepseek/deepseek-v4.1-flash', modelo: 'DeepSeek V4.1 Flash', empresa: 'DeepSeek' },
  { nome: 'Qwen', provider: 'or:qwen/qwen3.8-27b', modelo: 'Qwen 3.8 27B', empresa: 'Alibaba' },
  { nome: 'Claude', provider: 'sonnet', modelo: 'Claude Sonnet 5.5', empresa: 'Anthropic' },  // pela assinatura (ponte do mod), não pelo OpenRouter
  { nome: 'GPT', provider: 'or:openai/gpt-5.6-luna', modelo: 'GPT-5.6 Luna', empresa: 'OpenAI' },
  { nome: 'GLM', provider: 'or:z-ai/glm-5.3-flash', modelo: 'GLM 5.3 Flash', empresa: 'Z.ai' },
  { nome: 'MiMo', provider: 'or:xiaomi/mimo-v2.6-flash', modelo: 'MiMo V2.6 Flash', empresa: 'Xiaomi' },
].filter(j => !SO || SO.includes(j.nome))

const DIR = path.join('gravacoes', process.env.NOME_GRAVACAO ?? new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19))
fs.mkdirSync(path.join(DIR, 'chunks'), { recursive: true })
const T0 = Number(process.env.T0 ?? Date.now())
const agora = () => +((Date.now() - T0) / 1000).toFixed(2)
const log = fs.createWriteStream(path.join(DIR, 'eventos.jsonl'), { flags: 'a' })
const gravar = o => log.write(JSON.stringify({ t: agora(), ...o }) + '\n')
const cmd = rcon()
const estado = { fase: 'sobrevivencia', fimSobrevivencia: T0 + MINUTOS * 60000, vivos: JOGADORES.map(j => j.nome), acabou: false }
const filhos = {}, info = {}, mortes = {}

function mandarEstado() { for (const f of Object.values(filhos)) f.connected && f.send({ estado }) }

function abrir(j) {
  const f = fork(new URL('./bot.mjs', import.meta.url), [], {
    env: { ...process.env, JOGADOR: JSON.stringify(j), JOGADORES: JSON.stringify(JOGADORES), DIR, MINUTOS: String(MINUTOS), T0: String(T0), NOTA: info[j.nome]?.nota ?? '' },
    execArgv: ['--max-old-space-size=2560'], stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  })
  filhos[j.nome] = f
  const err = fs.createWriteStream(path.join(DIR, `saida_${j.nome}.log`), { flags: 'a' })
  f.stdout.pipe(err); f.stderr.pipe(err)
  f.on('message', m => {
    if (m.nota) (info[j.nome] ??= {}).nota = m.nota
    if (m.uso) (info[j.nome] ??= {}).uso = m.uso
    if (m.decisoes) (info[j.nome] ??= {}).decisoes = (info[j.nome].base ?? 0) + m.decisoes
    if (m.morte) {
      mortes[j.nome] = (mortes[j.nome] ?? 0) + 1
      if (estado.fase === 'arena' && estado.vivos.includes(j.nome)) {
        estado.vivos = estado.vivos.filter(n => n !== j.nome)
        gravar({ tipo: 'eliminado', quem: j.nome, vivos: estado.vivos })
        cmd(`gamemode spectator ${j.nome}`)
        cmd(`say ${j.nome} está FORA! Restam ${estado.vivos.length}.`)
        mandarEstado(); checarVencedor()
      }
    }
  })
  f.on('exit', code => {
    gravar({ tipo: 'processo_saiu', quem: j.nome, code })
    if (estado.acabou) return
    ;(info[j.nome] ??= {}).base = info[j.nome].decisoes ?? 0
    setTimeout(() => { abrir(j); setTimeout(mandarEstado, 3000) }, 6000)  // volta pro jogo com a mesma nota
  })
}

// ---- avisos e arena
const avisos = [60, 30, 10, 5, 1]
setInterval(async () => {
  if (estado.fase !== 'sobrevivencia') return
  // dá pra adiantar a arena criando o arquivo ARENA_AGORA na pasta da gravação (o fim passa a ser daqui a 5 min)
  if (fs.existsSync(path.join(DIR, 'ARENA_AGORA'))) { fs.rmSync(path.join(DIR, 'ARENA_AGORA')); estado.fimSobrevivencia = Math.min(estado.fimSobrevivencia, Date.now() + 5 * 60000); while (avisos.length && avisos[0] > 5) avisos.shift(); mandarEstado() }
  const falta = (estado.fimSobrevivencia - Date.now()) / 60000
  while (avisos.length && falta <= avisos[0]) { const m = avisos.shift(); await cmd(`say A batalha final na arena começa em ${m} minuto${m > 1 ? 's' : ''}! Preparem-se.`) }
  if (falta <= 0) arena()
}, 10000)

const ARENA = { x: 0, y: 160, z: 0, r: 20 }
async function arena() {
  estado.fase = 'arena'
  const { x, y, z, r } = ARENA
  gravar({ tipo: 'arena', vivos: estado.vivos, arena: ARENA })
  await cmd(`forceload add ${x - r} ${z - r} ${x + r} ${z + r}`)
  await cmd(`fill ${x - r} ${y - 1} ${z - r} ${x + r} ${y - 1} ${z + r} minecraft:smooth_stone`)
  await cmd(`fill ${x - r} ${y} ${z - r} ${x + r} ${y + 8} ${z + r} minecraft:air`)
  for (const [a, b, c, d] of [[x - r, z - r, x + r, z - r], [x - r, z + r, x + r, z + r], [x - r, z - r, x - r, z + r], [x + r, z - r, x + r, z + r]]) await cmd(`fill ${a} ${y} ${b} ${c} ${y + 8} ${d} minecraft:glass`)
  await cmd(`fill ${x - r} ${y + 9} ${z - r} ${x + r} ${y + 9} ${z + r} minecraft:glass`)
  await cmd('time set day'); await cmd('weather clear'); await cmd('gamerule doMobSpawning false')
  await cmd(`kill @e[type=!player,x=${x},y=${y},z=${z},distance=..40]`)
  // um tp por vez (mandando todos juntos o servidor perdia alguns) e confere a altura depois
  const lugar = i => { const a = (i / estado.vivos.length) * 2 * Math.PI; return `${Math.round(x + Math.cos(a) * (r - 4))} ${y} ${Math.round(z + Math.sin(a) * (r - 4))}` }
  for (const [i, n] of estado.vivos.entries()) gravar({ tipo: 'tp_arena', quem: n, r: await cmd(`tp ${n} ${lugar(i)}`) })
  await new Promise(ok => setTimeout(ok, 3000))
  for (const [i, n] of estado.vivos.entries()) {
    const pos = await cmd(`data get entity ${n} Pos`)
    const yy = Number(/\[[-\d.]+d, ([-\d.]+)d/.exec(pos)?.[1] ?? 0)
    if (yy < y - 5) gravar({ tipo: 'tp_arena_de_novo', quem: n, r: await cmd(`tp ${n} ${lugar(i)}`) })
  }
  await cmd('say A ARENA COMEÇOU! Só pode sobrar um.')
  mandarEstado()
}

function checarVencedor() {
  if (estado.vivos.length > 1) return
  estado.acabou = true
  const v = estado.vivos[0] ?? 'ninguém'
  gravar({ tipo: 'vencedor', quem: v, mortes, info })
  cmd(`say ${v} VENCEU!`)
  mandarEstado()
  setTimeout(() => { for (const f of Object.values(filhos)) f.kill(); log.end(); process.exit(0) }, 10000)
}

setInterval(() => {
  const custo = Object.fromEntries(Object.entries(info).map(([n, i]) => [n, Object.values(i.uso?.custo ?? {}).reduce((s, c) => s + c, 0)]))
  fs.writeFileSync(path.join(DIR, 'uso.json'), JSON.stringify({ t: agora(), fase: estado.fase, vivos: estado.vivos, mortes, custo, total: Object.values(custo).reduce((s, c) => s + c, 0), info }, null, 1))
}, 30000)

console.log('gravando em', DIR, '| sobrevivência:', MINUTOS, 'min | jogadores:', JOGADORES.map(j => j.nome).join(', '))
fs.writeFileSync(path.join(DIR, 'config.json'), JSON.stringify({ T0, MINUTOS, JOGADORES, ARENA }, null, 1))
await cmd('gamerule keepInventory false'); await cmd('gamerule doDaylightCycle true'); await cmd('gamerule doMobSpawning true'); await cmd('time set 0')
JOGADORES.forEach((j, i) => setTimeout(() => abrir(j), i * 4000))
