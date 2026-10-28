// Habilidades de alto nível que as IAs escolhem (uma por decisão). Cada uma devolve um texto curto com o resultado,
// que entra na próxima observação da IA. Tudo em cima do Mineflayer e dos plugins (pathfinder, collectblock, pvp).
import pf from 'mineflayer-pathfinder'
import { Vec3 } from 'vec3'

const { goals, Movements } = pf

// nomes "humanos" que as IAs podem usar para grupos de blocos
const GRUPOS = {
  madeira: b => b.endsWith('_log') && !b.startsWith('stripped'),
  tronco: b => b.endsWith('_log') && !b.startsWith('stripped'),
  pedra: b => b === 'stone' || b === 'cobblestone' || b === 'deepslate' || b === 'cobbled_deepslate',
  carvao: b => b === 'coal_ore' || b === 'deepslate_coal_ore',
  ferro: b => b === 'iron_ore' || b === 'deepslate_iron_ore',
  ouro: b => b === 'gold_ore' || b === 'deepslate_gold_ore',
  diamante: b => b === 'diamond_ore' || b === 'deepslate_diamond_ore',
  redstone: b => b === 'redstone_ore' || b === 'deepslate_redstone_ore',
  areia: b => b === 'sand',
  terra: b => b === 'dirt' || b === 'grass_block',
  folhas: b => b.endsWith('_leaves'),
  la: b => b.endsWith('_wool'),
}
const HOSTIS = new Set(['zombie', 'skeleton', 'creeper', 'spider', 'cave_spider', 'enderman', 'witch', 'drowned', 'husk', 'stray', 'slime', 'phantom', 'pillager', 'zombie_villager'])
const BLOCOS_CONSTRUCAO = ['cobblestone', 'cobbled_deepslate', 'dirt', 'oak_planks', 'spruce_planks', 'birch_planks', 'jungle_planks', 'acacia_planks', 'dark_oak_planks', 'mangrove_planks', 'cherry_planks', 'stone', 'sand', 'andesite', 'diorite', 'granite', 'deepslate', 'netherrack']

export const comTempo = (p, ms, nome) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`${nome} demorou demais`)), ms))])
const nomeBloco = (bot, id) => bot.registry.blocks[id]?.name
export const contar = (bot, nome) => bot.inventory.items().filter(i => i.name === nome).reduce((s, i) => s + i.count, 0)
const contarGrupo = (bot, f) => bot.inventory.items().filter(i => f(i.name)).reduce((s, i) => s + i.count, 0)

function idsDe(bot, alvo) {
  alvo = String(alvo || '').toLowerCase().trim()
  const f = GRUPOS[alvo.normalize('NFD').replace(/[̀-ͯ]/g, '')]
  const todos = Object.values(bot.registry.blocksByName)
  if (f) return todos.filter(b => f(b.name)).map(b => b.id)
  const b = bot.registry.blocksByName[alvo]
  return b ? [b.id] : []
}

function irPerto(bot, pos, raio = 2, ms = 60000) {
  return comTempo(bot.pathfinder.goto(new goals.GoalNear(pos.x, pos.y, pos.z, raio)), ms, 'o caminho')
}

async function mesaPerto(bot, tipo = 'crafting_table') {
  const id = bot.registry.blocksByName[tipo].id
  let mesa = bot.findBlock({ matching: id, maxDistance: 24 })
  if (mesa) return mesa
  if (contar(bot, tipo) === 0) return null
  // coloca a mesa/fornalha do lado, em cima de um bloco sólido
  const base = bot.entity.position.floored()
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [0, 2]]) {
    const embaixo = bot.blockAt(base.offset(dx, -1, dz))
    const lugar = bot.blockAt(base.offset(dx, 0, dz))
    if (embaixo && embaixo.boundingBox === 'block' && lugar && lugar.name === 'air') {
      await bot.equip(bot.inventory.items().find(i => i.name === tipo), 'hand')
      await bot.placeBlock(embaixo, new Vec3(0, 1, 0))
      return bot.findBlock({ matching: id, maxDistance: 6 })
    }
  }
  return null
}

const H = {}

H.coletar = async (bot, { alvo, qtd = 4 }) => {
  qtd = Math.max(1, Math.min(16, Number(qtd) || 4))
  const ids = idsDe(bot, alvo)
  if (!ids.length) return `não conheço o bloco "${alvo}". Use um nome do Minecraft (ex.: oak_log, stone, coal_ore) ou: ${Object.keys(GRUPOS).join(', ')}.`
  const achados = bot.findBlocks({ matching: ids, maxDistance: 48, count: qtd })
  if (!achados.length) return `não achei ${alvo} num raio de 48 blocos. Explore outra direção.`
  const antes = bot.inventory.items().reduce((s, i) => s + i.count, 0)
  const blocos = achados.map(p => bot.blockAt(p)).filter(Boolean)
  try {
    await comTempo(bot.collectBlock.collect(blocos, { ignoreNoPath: true }), 90000, 'a coleta')
  } catch (e) {
    const ganhou = bot.inventory.items().reduce((s, i) => s + i.count, 0) - antes
    return `coleta de ${alvo} parou (${e.message.slice(0, 90)}). Itens ganhos: ${ganhou}.`
  }
  const ganhou = bot.inventory.items().reduce((s, i) => s + i.count, 0) - antes
  return `coletou ${alvo}: +${ganhou} itens.`
}

function faltando(bot, itemId, mesa) {
  const r = bot.recipesAll(itemId, null, mesa ?? true)[0]
  if (!r) return 'não existe receita conhecida pra isso.'
  const precisa = {}
  for (const d of r.delta) if (d.count < 0) precisa[d.id] = (precisa[d.id] ?? 0) - d.count
  const lista = Object.entries(precisa).map(([id, n]) => {
    const nome = bot.registry.items[id]?.name
    return `${n}x ${nome} (você tem ${contar(bot, nome)})`
  })
  return `faltam ingredientes. A receita pede: ${lista.join(', ')}${r.requiresTable ? ' + uma mesa de trabalho (crafting_table)' : ''}.`
}

H.craftar = async (bot, { item, qtd = 1 }) => {
  const it = bot.registry.itemsByName[String(item || '').toLowerCase().trim()]
  if (!it) return `não conheço o item "${item}". Use o nome do Minecraft em inglês (ex.: wooden_pickaxe, crafting_table, stick).`
  qtd = Math.max(1, Math.min(64, Number(qtd) || 1))
  let receita = bot.recipesFor(it.id, null, 1, null)[0]
  let mesa = null
  if (!receita) {
    mesa = await mesaPerto(bot)
    if (mesa) receita = bot.recipesFor(it.id, null, 1, mesa)[0]
    if (!receita) return mesa ? faltando(bot, it.id, mesa) : (bot.recipesAll(it.id, null, true)[0]?.requiresTable ? 'precisa de uma mesa de trabalho: craft uma crafting_table (4 planks) ou chegue perto de uma. ' + faltando(bot, it.id, null) : faltando(bot, it.id, null))
  }
  if (mesa) await irPerto(bot, mesa.position, 3)
  const vezes = Math.max(1, Math.ceil(qtd / (receita.result?.count || 1)))
  const antes = contar(bot, it.name)
  try {
    await comTempo(bot.craft(receita, vezes, mesa), 30000, 'o craft')
  } catch (e) {
    if (contar(bot, it.name) === antes) return `não conseguiu craftar ${it.name}: ${e.message.slice(0, 100)}`
  }
  return `craftou ${contar(bot, it.name) - antes}x ${it.name} (agora tem ${contar(bot, it.name)}).`
}

const COMBUSTIVEL = ['coal', 'charcoal', 'oak_planks', 'spruce_planks', 'birch_planks', 'oak_log', 'spruce_log', 'birch_log', 'stick']
H.fundir = async (bot, { item, qtd = 1 }) => {
  const entrada = bot.inventory.items().find(i => i.name === String(item || '').toLowerCase().trim())
  if (!entrada) return `você não tem "${item}" pra fundir (ex.: raw_iron, raw_beef, sand).`
  const fornalha = await mesaPerto(bot, 'furnace')
  if (!fornalha) return 'precisa de uma fornalha: craft uma furnace (8 cobblestone, na mesa de trabalho) ou chegue perto de uma.'
  const comb = bot.inventory.items().find(i => COMBUSTIVEL.includes(i.name) && i.name !== entrada.name)
  if (!comb) return 'precisa de combustível (coal, charcoal, planks ou logs).'
  await irPerto(bot, fornalha.position, 3)
  qtd = Math.min(entrada.count, Math.max(1, Number(qtd) || 1), 16)
  const f = await bot.openFurnace(fornalha)
  try {
    await f.putFuel(comb.type, null, Math.min(comb.count, Math.ceil(qtd / 1.5)))
    await f.putInput(entrada.type, null, qtd)
    const fim = Date.now() + qtd * 10500 + 3000
    while (Date.now() < fim && (f.inputItem()?.count ?? 0) > 0) await new Promise(r => setTimeout(r, 1000))
    const saida = f.outputItem()
    if (saida) await f.takeOutput()
    return saida ? `fundiu: +${saida.count}x ${saida.name}.` : 'a fornalha ainda não terminou.'
  } finally { f.close() }
}

H.comer = async bot => {
  try { await bot.autoEat.eat({ priority: 'foodPoints' }); return `comeu. Fome agora: ${bot.food}/20.` } catch (e) { return `não conseguiu comer: ${e.message.slice(0, 80)} (precisa ter comida no inventário).` }
}

H.ir_para = async (bot, { x, y, z }) => {
  if (x == null || z == null) return 'diga x e z.'
  try {
    await comTempo(bot.pathfinder.goto(y != null ? new goals.GoalNear(+x, +y, +z, 2) : new goals.GoalXZ(+x, +z)), 120000, 'o caminho')
    return `chegou em ${bot.entity.position.floored()}.`
  } catch (e) { return `parou em ${bot.entity.position.floored()} (${e.message.slice(0, 60)}).` }
}

const DIRS = { norte: [0, -1], sul: [0, 1], leste: [1, 0], oeste: [-1, 0] }
H.explorar = async (bot, { direcao = 'norte', distancia = 40 }) => {
  const d = DIRS[String(direcao).toLowerCase()] ?? DIRS.norte
  const n = Math.max(10, Math.min(120, Number(distancia) || 40))
  const p = bot.entity.position
  return H.ir_para(bot, { x: Math.round(p.x + d[0] * n), z: Math.round(p.z + d[1] * n) })
}

function acharEntidade(bot, alvo) {
  alvo = String(alvo || '').toLowerCase().trim()
  const cands = Object.values(bot.entities).filter(e => e !== bot.entity && e.position.distanceTo(bot.entity.position) < 48 &&
    ((e.type === 'player' && e.username?.toLowerCase() === alvo) || e.name === alvo || (alvo === 'hostil' && HOSTIS.has(e.name))))
  return cands.sort((a, b) => a.position.distanceTo(bot.entity.position) - b.position.distanceTo(bot.entity.position))[0]
}

H.atacar = async (bot, { alvo }) => {
  const e = acharEntidade(bot, alvo)
  if (!e) return `não vi "${alvo}" perto (até 48 blocos).`
  const arma = bot.inventory.items().filter(i => /_sword$|_axe$/.test(i.name)).sort((a, b) => b.maxDurability - a.maxDurability)[0]
  if (arma) await bot.equip(arma, 'hand').catch(() => {})
  bot.pvp.attack(e)
  const fim = Date.now() + 25000
  while (Date.now() < fim && e.isValid && bot.health > 0) await new Promise(r => setTimeout(r, 500))
  bot.pvp.stop()
  return e.isValid ? `lutou com ${alvo} mas ele ainda está vivo.` : `derrotou ${alvo}.`
}

H.seguir = async (bot, { jogador, segundos = 20 }) => {
  const e = bot.players[jogador]?.entity
  if (!e) return `não vejo ${jogador} por perto.`
  bot.pathfinder.setGoal(new goals.GoalFollow(e, 2), true)
  await new Promise(r => setTimeout(r, Math.min(60, Number(segundos) || 20) * 1000))
  bot.pathfinder.setGoal(null)
  return `seguiu ${jogador}.`
}

H.dar = async (bot, { jogador, item, qtd = 1 }) => {
  const e = bot.players[jogador]?.entity
  if (!e) return `não vejo ${jogador} por perto.`
  const it = bot.inventory.items().find(i => i.name === String(item || '').toLowerCase().trim())
  if (!it) return `você não tem ${item}.`
  await irPerto(bot, e.position, 2, 40000).catch(() => {})
  await bot.lookAt(e.position.offset(0, 1.6, 0))
  await bot.toss(it.type, null, Math.min(it.count, Math.max(1, Number(qtd) || 1)))
  return `jogou ${qtd}x ${it.name} pro ${jogador}.`
}

H.equipar = async (bot, { item }) => {
  const it = bot.inventory.items().find(i => i.name === String(item || '').toLowerCase().trim())
  if (!it) return `você não tem ${item}.`
  const lugar = /helmet$/.test(it.name) ? 'head' : /chestplate$/.test(it.name) ? 'torso' : /leggings$/.test(it.name) ? 'legs' : /boots$/.test(it.name) ? 'feet' : /shield$/.test(it.name) ? 'off-hand' : 'hand'
  await bot.equip(it, lugar)
  return `equipou ${it.name}.`
}

// abrigo simples: anel de blocos em volta (2 de altura) e um teto 3x3; a IA fica fechada lá dentro
H.construir_abrigo = async bot => {
  const temBlocos = () => bot.inventory.items().filter(i => BLOCOS_CONSTRUCAO.includes(i.name)).reduce((s, i) => s + i.count, 0)
  if (temBlocos() < 17) return `precisa de pelo menos 17 blocos de construção (cobblestone, dirt, planks...). Tem ${temBlocos()}.`
  bot.pathfinder.setGoal(null)
  const c = bot.entity.position.floored()
  const anel = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
  const alvos = [...anel.map(([x, z]) => c.offset(x, 0, z)), ...anel.map(([x, z]) => c.offset(x, 1, z)), c.offset(0, 2, 0), ...anel.map(([x, z]) => c.offset(x, 2, z))]
  let postos = 0
  for (const p of alvos) {
    const b = bot.blockAt(p)
    if (!b || b.name !== 'air') continue
    const it = bot.inventory.items().find(i => BLOCOS_CONSTRUCAO.includes(i.name))
    if (!it) break
    await bot.equip(it, 'hand')
    for (const f of [new Vec3(0, -1, 0), new Vec3(1, 0, 0), new Vec3(-1, 0, 0), new Vec3(0, 0, 1), new Vec3(0, 0, -1), new Vec3(0, 1, 0)]) {
      const ref = bot.blockAt(p.plus(f))
      if (ref && ref.boundingBox === 'block') {
        try { await bot.placeBlock(ref, f.scaled(-1)); postos++; break } catch { /* tenta outra face */ }
      }
    }
  }
  return `construiu um abrigo em volta de si (${postos} blocos colocados).`
}

H.dormir = async bot => {
  if (bot.time.isDay) return 'ainda é dia, não dá pra dormir.'
  let cama = bot.findBlock({ matching: b => b.name.endsWith('_bed'), maxDistance: 24 })
  if (!cama) {
    const it = bot.inventory.items().find(i => i.name.endsWith('_bed'))
    if (!it) return 'não tem cama perto nem no inventário (cama: 3 lã + 3 planks).'
    const base = bot.entity.position.floored()
    const chao = bot.blockAt(base.offset(1, -1, 0))
    await bot.equip(it, 'hand')
    await bot.placeBlock(chao, new Vec3(0, 1, 0)).catch(() => {})
    cama = bot.findBlock({ matching: b => b.name.endsWith('_bed'), maxDistance: 6 })
    if (!cama) return 'não conseguiu colocar a cama aqui.'
  }
  await irPerto(bot, cama.position, 2).catch(() => {})
  try { await bot.sleep(cama); return 'deitou na cama.' } catch (e) { return `não conseguiu dormir: ${e.message.slice(0, 80)}` }
}

H.esperar = async (bot, { segundos = 10 }) => { await new Promise(r => setTimeout(r, Math.min(60, Number(segundos) || 10) * 1000)); return 'esperou.' }

export const HABILIDADES = H
export const DESCRICAO = `- coletar {alvo, qtd}: minera/corta blocos perto (alvo = nome do bloco ou: madeira, pedra, carvao, ferro, ouro, diamante, redstone, areia, terra, folhas, la). Pedra/minérios precisam de picareta.
- craftar {item, qtd}: crafta um item (nome em inglês do Minecraft: oak_planks, stick, crafting_table, wooden_pickaxe, stone_sword, furnace, iron_chestplate, bread, white_bed...). Usa/coloca a mesa de trabalho sozinho.
- fundir {item, qtd}: põe na fornalha (raw_iron, raw_gold, raw_beef, raw_porkchop, raw_chicken, sand...). Usa/coloca a fornalha sozinho.
- comer {}: come a melhor comida do inventário.
- ir_para {x, z} (y opcional)
- explorar {direcao: norte|sul|leste|oeste, distancia}
- atacar {alvo}: um mob (cow, pig, sheep, chicken, zombie, skeleton, spider, creeper...), "hostil" (o mais perto) ou o nome de um jogador.
- seguir {jogador, segundos}
- dar {jogador, item, qtd}: joga itens pro jogador.
- equipar {item}: espada, picareta, armadura, escudo.
- construir_abrigo {}: fecha você num abrigo de blocos (precisa de 17 blocos). Bom pra passar a noite.
- dormir {}: dorme numa cama perto ou do inventário (só de noite).
- esperar {segundos}`

// resumo do que a IA vê, em texto
export function observar(bot, extras) {
  const p = bot.entity.position
  const inv = {}
  for (const i of bot.inventory.items()) inv[i.name] = (inv[i.name] ?? 0) + i.count
  const eq = ['head', 'torso', 'legs', 'feet'].map((s, k) => bot.inventory.slots[5 + k]?.name).filter(Boolean)
  const recursos = []
  for (const [nome, f] of Object.entries({ madeira: GRUPOS.madeira, pedra: b => b === 'stone', carvao: GRUPOS.carvao, ferro: GRUPOS.ferro, diamante: GRUPOS.diamante, agua: b => b === 'water', mesa: b => b === 'crafting_table', fornalha: b => b === 'furnace', cama: b => b.endsWith('_bed') })) {
    const ids = Object.values(bot.registry.blocksByName).filter(b => f(b.name)).map(b => b.id)
    const b = bot.findBlock({ matching: ids, maxDistance: nome === 'diamante' || nome === 'ferro' ? 24 : 40 })
    if (b) recursos.push(`${nome} a ${Math.round(b.position.distanceTo(p))} blocos (${b.position.x}, ${b.position.y}, ${b.position.z})`)
  }
  const seres = Object.values(bot.entities).filter(e => e !== bot.entity && e.position.distanceTo(p) < 32 && (e.type === 'player' || e.type === 'mob' || e.type === 'hostile' || e.type === 'animal' || e.type === 'passive'))
    .sort((a, b) => a.position.distanceTo(p) - b.position.distanceTo(p)).slice(0, 10)
    .map(e => `${e.type === 'player' ? 'jogador ' + e.username : e.name}${HOSTIS.has(e.name) ? ' (HOSTIL)' : ''} a ${Math.round(e.position.distanceTo(p))}`)
  const hora = bot.time.timeOfDay
  const periodo = hora < 12000 ? `dia (faltam ~${Math.round((12000 - hora) / 20 / 60 * 10) / 10} min pra anoitecer)` : hora < 13800 ? 'entardecer' : hora < 22500 ? 'NOITE (monstros aparecem)' : 'amanhecer'
  return [
    `Dia ${Math.floor(bot.time.age / 24000) + 1} no mundo, ${periodo}. ${extras.fase}`,
    `Você: vida ${Math.round(bot.health)}/20, fome ${bot.food}/20, posição (${Math.round(p.x)}, ${Math.round(p.y)}, ${Math.round(p.z)})${bot.entity.isInWater ? ', dentro da água' : ''}.`,
    `Inventário: ${Object.entries(inv).map(([k, v]) => `${v} ${k}`).join(', ') || 'vazio'}.`,
    `Na mão: ${bot.heldItem?.name ?? 'nada'}. Armadura: ${eq.join(', ') || 'nenhuma'}.`,
    `Perto: ${recursos.join('; ') || 'nada útil num raio de 40 blocos'}.`,
    `Seres perto: ${seres.join(', ') || 'ninguém'}.`,
  ].join('\n')
}

export function preparar(bot) {
  const mov = new Movements(bot)
  mov.allowSprinting = true
  mov.canDig = true
  mov.allowParkour = true
  bot.pathfinder.setMovements(mov)
}
