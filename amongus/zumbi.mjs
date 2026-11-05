// AMONG IA 6 — MODO ZUMBI (especial de Halloween). Motor SEPARADO do Among Us (jogo5.mjs fica intocado).
// Mapa Mira HQ à noite. Sem reunião: conversa por proximidade (só quem está na mesma sala ouve). Loja com armas que
// só atordoam e barricadas. Paciente Zero secreto (nem ele sabe). Mordido fica com contorno verde até virar zumbi.
// Tudo o que as IAs dizem, pensam e fazem vai para o log exatamente como elas responderam.
// Uso: IA_DIRETO=1 node zumbi.mjs [--mock] [--seed N] [--partida N] [--saida arq.json] [--max-tiques 60]
import fs from 'node:fs'
import path from 'node:path'
import { perguntar, lerJSON, uso } from './ia.mjs'

const args = Object.fromEntries(process.argv.slice(2).map((a, i, v) => (a.startsWith('--') ? [a.slice(2), v[i + 1] && !v[i + 1].startsWith('--') ? v[i + 1] : true] : null)).filter(Boolean))
const MOCK = !!args.mock
const NPARTIDA = Number(args.partida ?? 1)
// sorteio de verdade (python secrets, sorteio_zumbi.py): elenco por cor, profissões, Paciente Zero, salas, tipos de zumbi e semente
const TEMPORADA = args.temporada ? JSON.parse(fs.readFileSync(args.temporada, 'utf8')) : null
const DA_TEMP = TEMPORADA?.partidas[NPARTIDA - 1] ?? null
const SAIDA = args.saida ?? `logs_zumbi/partida${NPARTIDA}${MOCK ? '_mock' : ''}.json`
let semente = Number(DA_TEMP?.seed ?? args.seed ?? Math.floor(Math.random() * 1e9))
const SEED = semente
const rand = () => ((semente = (semente * 1664525 + 1013904223) >>> 0) / 4294967296)
const escolher = (a) => a[Math.floor(rand() * a.length)]
const embaralhar = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const k = Math.floor(rand() * (i + 1)); [b[i], b[k]] = [b[k], b[i]] } return b }

export const CFG = {
  amanhecer: Number(args['max-tiques'] ?? 60), // humanos que chegarem vivos e sem mordida até aqui sobrevivem
  pzVira: [5, 8], // o Paciente Zero vira zumbi entre esses tiques, sem saber antes
  incubacao: 5, // tiques entre a mordida e virar zumbi
  radioMeta: 380, // tarefas completas para o rádio (teste 1: 45 enchia em 3 tiques; teste 2: ~7 por tique antes do caos)
  tarefaTiques: 2, // cada tarefa leva 2 tiques de trabalho na sala
  resgatePrazo: 4, // tiques para chegar ao Lançamento depois que o resgate chega
  moedasTarefa: 2,
  precos: { taser: 4, barricada: 5, uv: 5 },
  taserCargas: 1, taserAtordoa: 2, uvAtordoa: 2, resistencia: 2, // partida 1: tasers seguidos deixavam o zumbi parado quase o jogo todo
  barricadaVida: 2, barricadaDura: 6,
  doutorRecarga: 6, engenheiroRecarga: 6, cuspidorRecarga: 3,
  memoria: 10,
}

// Mira HQ: salas, vizinhas e onde ficam no desenho (0-100), tarefas de cada sala
export const SALAS = {
  Lancamento: { nome: 'Lançamento', viz: ['Vestiario', 'Enfermaria', 'Comunicacoes'], pos: [8, 78], tarefas: ['Abastecer o motor', 'Checar a nave de fuga'] },
  Enfermaria: { nome: 'Enfermaria', viz: ['Lancamento', 'Comunicacoes'], pos: [22, 92], tarefas: ['Organizar remédios'] },
  Comunicacoes: { nome: 'Comunicações', viz: ['Lancamento', 'Enfermaria', 'Vestiario'], pos: [30, 72], tarefas: ['Consertar a antena'] },
  Vestiario: { nome: 'Vestiário', viz: ['Lancamento', 'Comunicacoes', 'Descontaminacao'], pos: [20, 58], tarefas: ['Trocar de traje'] },
  Descontaminacao: { nome: 'Descontaminação', viz: ['Vestiario', 'Corredor'], pos: [36, 50], tarefas: ['Ligar a ventilação'] },
  Corredor: { nome: 'Corredor', viz: ['Descontaminacao', 'Reator', 'Laboratorio', 'Escritorio', 'Estufa', 'Refeitorio'], pos: [55, 48], tarefas: [] },
  Reator: { nome: 'Reator', viz: ['Corredor', 'Laboratorio'], pos: [50, 12], tarefas: ['Ligar o reator', 'Medir a radiação'] },
  Laboratorio: { nome: 'Laboratório', viz: ['Corredor', 'Reator'], pos: [70, 14], tarefas: ['Analisar amostra', 'Calibrar o microscópio'] },
  Escritorio: { nome: 'Escritório', viz: ['Corredor', 'Admin'], pos: [66, 34], tarefas: ['Baixar os dados'] },
  Admin: { nome: 'Admin', viz: ['Escritorio', 'Estufa'], pos: [80, 30], tarefas: ['Passar o cartão'] },
  Estufa: { nome: 'Estufa', viz: ['Corredor', 'Admin'], pos: [82, 46], tarefas: ['Regar as plantas', 'Colher abóboras'] },
  Refeitorio: { nome: 'Refeitório', viz: ['Corredor', 'Varanda', 'Deposito'], pos: [76, 68], tarefas: ['Esvaziar o lixo'], loja: true },
  Varanda: { nome: 'Varanda', viz: ['Refeitorio'], pos: [92, 70], tarefas: ['Limpar o filtro'] },
  Deposito: { nome: 'Depósito', viz: ['Refeitorio'], pos: [74, 88], tarefas: ['Abastecer o gerador'] },
}
const nome = (s) => SALAS[s].nome
const salaPorNome = (n) => Object.keys(SALAS).find((k) => k.toLowerCase() === String(n).toLowerCase() || nome(k).toLowerCase() === String(n).toLowerCase())

export const CORES = ['Vermelho', 'Azul', 'Verde', 'Rosa', 'Laranja', 'Amarelo', 'Preto', 'Branco', 'Roxo', 'Marrom', 'Ciano', 'Lima', 'Cinza', 'Coral', 'Bordo', 'Banana', 'Caqui', 'Rose', 'Turquesa', 'Dourado']
// Haiku pela assinatura (ponte do mod) e DeepSeek pela API própria (IA_DIRETO manda deepseek/ para api.deepseek.com).
// elenco do AU5 + Tencent HY4 + Liquid LFM 2.5 24B (Haiku e Qwen 27B com 3 cores cada; o resto com 2)
const MODELOS = {
  'haiku': 'Claude Haiku 5.5', 'or:qwen/qwen3.8-27b': 'Qwen 3.8 27B', 'or:deepseek/deepseek-v4.1-flash': 'DeepSeek Flash',
  'or:xiaomi/mimo-v2.6-flash': 'MiMo V2.6 Flash', 'or:z-ai/glm-5.3-flash': 'GLM 5.3 Flash', 'or:minimax/minimax-m3.1-flash': 'MiniMax M3.1 Flash',
  'or:openai/gpt-6.1-terra': 'GPT-6.1 Terra', 'or:openai/gpt-6-luna': 'GPT-6 Luna', 'or:tencent/hy4': 'Tencent HY4', 'or:liquid/lfm-2.5-24b-a2b': 'LFM 2.5 24B',
}
const ELENCO = ['haiku', 'haiku', 'haiku', 'or:qwen/qwen3.8-27b', 'or:qwen/qwen3.8-27b', 'or:qwen/qwen3.8-27b',
  'or:deepseek/deepseek-v4.1-flash', 'or:deepseek/deepseek-v4.1-flash', 'or:xiaomi/mimo-v2.6-flash', 'or:xiaomi/mimo-v2.6-flash', 'or:z-ai/glm-5.3-flash', 'or:z-ai/glm-5.3-flash',
  'or:minimax/minimax-m3.1-flash', 'or:minimax/minimax-m3.1-flash', 'or:openai/gpt-6.1-terra', 'or:openai/gpt-6.1-terra', 'or:tencent/hy4', 'or:tencent/hy4',
  'or:liquid/lfm-2.5-24b-a2b', 'or:liquid/lfm-2.5-24b-a2b']

// profissões dos humanos (o Paciente Zero recebe "Sobrevivente" no prompt: nem ele sabe)
const PROFISSOES = {
  Sobrevivente: 'SOBREVIVENTE: faça tarefas (cada uma dá moedas e enche o rádio de resgate), compre itens na loja do Refeitório e fique vivo até o amanhecer.',
  Doutor: `DOUTOR: quando estiver na mesma sala que alguém, você percebe se essa pessoa foi MORDIDA. Você pode CURAR um mordido que esteja na sua sala (a cura só funciona antes de ele virar zumbi; recarga de ${CFG.doutorRecarga} tiques). Zumbi completo não tem cura.`,
  Engenheiro: `ENGENHEIRO: você ergue uma barricada DE GRAÇA na sua sala a cada ${CFG.engenheiroRecarga} tiques e pode CONSERTAR uma barricada danificada.`,
  Vigia: 'VIGIA: na sala de Comunicações você pode olhar as CÂMERAS e ver em que sala está cada zumbi visível.',
  Enlouquecido: `ENLOUQUECIDO (neutro, joga sozinho): você é IMUNE à primeira mordida e ninguém sabe disso, nem os zumbis. Você GANHA se os zumbis vencerem com você ainda humano, ou se no amanhecer você for o ÚLTIMO humano sem mordida. Pode mentir, guiar gente para a horda e ABRIR barricadas por dentro. Ninguém pode saber o seu objetivo.`,
}
export const ZUMBIS = {
  Normal: 'ZUMBI NORMAL: morde um humano que esteja na mesma sala.',
  Grande: 'ZUMBI GRANDE: lento mas forte: quebra uma barricada inteira num tique, e as armas te atordoam por menos tempo.',
  Rapido: 'ZUMBI RÁPIDO: anda até 2 salas por tique.',
  Cuspidor: `ZUMBI CUSPIDOR: morde à distância um humano de uma sala VIZINHA (recarga de ${CFG.cuspidorRecarga} tiques), ou de perto como os outros.`,
  Uivador: 'ZUMBI UIVADOR: ouve as conversas das salas vizinhas; uma vez por partida pode UIVAR: os humanos da sua sala fogem em pânico para uma sala vizinha.',
}

const jogadores = []
const barricadas = {} // sala -> {vida, ate, por}
const log = { versao: 'zumbi1', mapa: 'Mira HQ (Halloween)', seed: SEED, partida: NPARTIDA, cfg: CFG, salas: SALAS, jogadores: [], tiques: [], eventos: [], falas: [], resultado: null }
let tique = 0
let radio = 0
let resgateEm = null

const J = (cor) => jogadores.find((j) => j.cor === cor)
const humanos = () => jogadores.filter((j) => j.estado !== 'zumbi')
const limpos = () => jogadores.filter((j) => j.estado === 'humano')
const zumbis = () => jogadores.filter((j) => j.estado === 'zumbi')
const naSala = (s, ex) => jogadores.filter((j) => j.sala === s && j !== ex && !j.salvo)
const atordoado = (j) => tique < (j.atordoadoAte ?? 0)
const fechada = (s) => (barricadas[s]?.ate ?? -1) > tique && barricadas[s].vida > 0

function evento(tipo, d) { log.eventos.push({ tique, tipo, ...d }); return d }
function lembrar(j, t) { j.memoria.push(`[tique ${tique}] ${t}`); if (j.memoria.length > CFG.memoria) j.memoria.shift() }

function montar() {
  const cores = CORES
  const provs = embaralhar(ELENCO)
  const papeis = embaralhar(['Doutor', 'Doutor', 'Engenheiro', 'Vigia', 'Enlouquecido', ...Array(15).fill('Sobrevivente')])
  const salasIni = Object.keys(SALAS).filter((s) => s !== 'Corredor')
  cores.forEach((cor, i) => {
    const prov = TEMPORADA ? TEMPORADA.cores[cor] : provs[i] // com temporada: cada cor tem sempre a mesma IA (como no AU5)
    jogadores.push({ cor, provider: MOCK ? 'mock' : prov, modelo: MODELOS[prov], papel: DA_TEMP?.papeis[cor] ?? papeis[i], estado: 'humano', sala: DA_TEMP?.salas[cor] ?? escolher(salasIni), moedas: 0, itens: { taser: 0, uv: 0 }, memoria: [], ouviu: [], recarga: 0 })
  })
  // Paciente Zero: um Sobrevivente sorteado em segredo; vira zumbi sozinho no tique sorteado
  const pz = DA_TEMP ? J(DA_TEMP.pacienteZero) : escolher(jogadores.filter((j) => j.papel === 'Sobrevivente'))
  pz.pacienteZero = true
  pz.viraEm = DA_TEMP?.pzViraEm ?? CFG.pzVira[0] + Math.floor(rand() * (CFG.pzVira[1] - CFG.pzVira[0] + 1))
  log.jogadores = jogadores.map((j) => ({ cor: j.cor, modelo: j.modelo, provider: j.provider, papel: j.papel, pacienteZero: !!j.pacienteZero, viraEm: j.viraEm ?? null }))
  evento('inicio', { pacienteZero: pz.cor, viraEm: pz.viraEm })
}

function regras() {
  return `Você está jogando o MODO ZUMBI do Among Us no mapa Mira HQ, à noite de Halloween. ${jogadores.length} jogadores, cada um é uma IA diferente.
COMO FUNCIONA: no começo TODOS são humanos, mas um deles é o PACIENTE ZERO, infectado sem saber (nem ele mesmo sabe). Em algum momento ele vira ZUMBI. Zumbis são verdes e todos veem que são zumbis. Um zumbi MORDE humanos na mesma sala, e a mordida acontece ANTES de qualquer um conseguir sair da sala naquele tique (só um taser ou lanterna UV usado no mesmo tique impede); o mordido não muda por fora (ninguém vê a mordida), mas ele SABE que foi mordido e vira zumbi ${CFG.incubacao} tiques depois, a não ser que um Doutor o cure antes.
NÃO HÁ REUNIÃO NEM VOTAÇÃO. Conversa só por proximidade: o que você fala só é ouvido por quem está na MESMA sala neste tique.
LOJA (no Refeitório): taser (${CFG.precos.taser} moedas, ${CFG.taserCargas} cargas, atordoa um zumbi por ${CFG.taserAtordoa} tiques), barricada (${CFG.precos.barricada} moedas, fecha a sala onde você está: ninguém entra nem sai enquanto ela aguentar; zumbis do lado de fora podem quebrá-la), lanterna UV (${CFG.precos.uv} moedas, 1 uso, atordoa TODOS os zumbis da sala por ${CFG.uvAtordoa} tiques). Armas NÃO matam zumbi, só atordoam; depois de acordar, o zumbi fica ${CFG.resistencia} tiques imune a novo atordoamento. Moedas vêm das tarefas (${CFG.moedasTarefa} por tarefa completa; cada tarefa leva ${CFG.tarefaTiques} tiques).
OBJETIVO DOS HUMANOS: chegar ao AMANHECER (tique ${CFG.amanhecer}) sem virar zumbi, OU encher o RÁDIO DE RESGATE com ${CFG.radioMeta} tarefas no total e então chegar ao Lançamento em até ${CFG.resgatePrazo} tiques. OBJETIVO DOS ZUMBIS: morder todos os humanos.
Mapa (salas e vizinhas): ${Object.entries(SALAS).map(([k, s]) => `${s.nome} -> ${s.viz.map(nome).join(', ')}`).join('; ')}.
Responda SEMPRE e SÓ com JSON: {"pensamento": "<o que você pensa de verdade, 1-2 frases>", "fala": "<o que você diz em voz alta para quem está na sala, ou vazio>", "acao": "<copie exatamente uma das ações da lista>"}`
}

function sistema(j) {
  if (j.estado === 'zumbi') return `${regras()}\n\nVOCÊ AGORA É ZUMBI (${j.tipo}). ${ZUMBIS[j.tipo]} Seu objetivo é morder todos os humanos. Você ainda pensa e fala (pode enganar, chamar, ameaçar). Você é a IA ${j.modelo}, cor ${j.cor}.`
  const prof = PROFISSOES[j.papel]
  return `${regras()}\n\nSUA PROFISSÃO: ${prof}\nVocê é a IA ${j.modelo}, cor ${j.cor}. Partida ${NPARTIDA}.`
}

function acoesDe(j) {
  const a = []
  const s = SALAS[j.sala]
  const saidas = fechada(j.sala) ? [] : s.viz.filter((v) => !fechada(v) || j.estado === 'zumbi')
  if (j.estado === 'zumbi') {
    if (atordoado(j)) return ['esperar (atordoado)']
    for (const h of naSala(j.sala, j).filter((h) => h.estado !== 'zumbi')) a.push(`morder ${h.cor}`)
    if (j.tipo === 'Cuspidor' && tique >= (j.cospeEm ?? 0)) for (const v of s.viz) for (const h of naSala(v).filter((h) => h.estado !== 'zumbi')) a.push(`cuspir em ${h.cor} (${nome(v)})`)
    if (j.tipo === 'Uivador' && !j.uivou && naSala(j.sala, j).some((h) => h.estado !== 'zumbi')) a.push('uivar')
    for (const v of s.viz) if (fechada(v)) a.push(`quebrar a barricada de ${nome(v)}`)
    for (const v of s.viz.filter((v) => !fechada(v))) a.push(`ir para ${nome(v)}`)
    if (j.tipo === 'Rapido') for (const v of s.viz) for (const w of SALAS[v].viz) if (w !== j.sala && !s.viz.includes(w) && !fechada(v) && !fechada(w)) a.push(`correr para ${nome(w)} (2 salas)`)
    a.push('esperar')
    return [...new Set(a)]
  }
  const zs = naSala(j.sala, j).filter((z) => z.estado === 'zumbi' && !atordoado(z))
  if (j.itens.taser > 0) for (const z of zs) a.push(`atordoar ${z.cor} com o taser`)
  if (j.itens.uv > 0 && zs.length) a.push('acender a lanterna UV')
  for (const t of s.tarefas) a.push(`fazer a tarefa "${t}"`)
  if (s.loja) {
    if (j.moedas >= CFG.precos.taser) a.push(`comprar taser (${CFG.precos.taser} moedas)`)
    if (j.moedas >= CFG.precos.uv) a.push(`comprar lanterna UV (${CFG.precos.uv} moedas)`)
  }
  if (!fechada(j.sala) && j.moedas >= CFG.precos.barricada) a.push(`comprar e erguer barricada nesta sala (${CFG.precos.barricada} moedas)`)
  if (j.papel === 'Engenheiro' && tique >= j.recarga && !fechada(j.sala)) a.push('erguer barricada de graça nesta sala')
  if (j.papel === 'Engenheiro' && barricadas[j.sala] && fechada(j.sala) && barricadas[j.sala].vida < CFG.barricadaVida) a.push('consertar a barricada')
  if (j.papel === 'Doutor' && tique >= j.recarga) for (const h of naSala(j.sala, j).filter((h) => h.estado !== 'zumbi')) a.push(`curar ${h.cor}`)
  if (j.papel === 'Vigia' && j.sala === 'Comunicacoes') a.push('olhar as câmeras')
  if (j.papel === 'Enlouquecido' && fechada(j.sala)) a.push('abrir a barricada desta sala')
  for (const v of saidas) a.push(`ir para ${nome(v)}`)
  a.push('esperar')
  return a
}

function situacao(j) {
  const s = SALAS[j.sala]
  const aqui = naSala(j.sala, j).map((o) => (o.estado === 'zumbi' ? `${o.cor} (ZUMBI${atordoado(o) ? ', atordoado' : ''})` : o.cor + (j.papel === 'Doutor' && o.estado === 'mordido' ? ' (você percebe: MORDIDO)' : '')))
  const viz = s.viz.map((v) => `${nome(v)}${fechada(v) ? ' [BARRICADA]' : ''}: ${naSala(v).filter((o) => o.estado === 'zumbi').length ? 'tem zumbi à vista' : 'sem zumbi à vista'}`)
  const linhas = [
    `TIQUE ${tique} de ${CFG.amanhecer} (amanhecer). Rádio de resgate: ${radio}/${CFG.radioMeta}${resgateEm != null ? ` — O RESGATE CHEGOU! Vá ao Lançamento até o tique ${resgateEm + CFG.resgatePrazo}.` : ''}`,
    `Você está em: ${nome(j.sala)}${fechada(j.sala) ? ' (BARRICADA fechando esta sala)' : ''}. Aqui com você: ${aqui.join(', ') || 'ninguém'}.`,
    `Salas vizinhas: ${viz.join('; ')}.`,
    `Humanos: ${humanos().length} · Zumbis à vista no mapa: ${zumbis().length}.`,
  ]
  if (j.estado !== 'zumbi' && Object.values(j.progresso ?? {}).some((v) => v)) linhas.push(`Tarefas pela metade (cada tarefa leva ${CFG.tarefaTiques} tiques; se sair da sala, continua depois): ${Object.entries(j.progresso).filter(([, v]) => v).map(([t, v]) => `"${t}" ${v}/${CFG.tarefaTiques}`).join(', ')}.`)
  if (j.estado !== 'zumbi') linhas.push(`Suas moedas: ${j.moedas}. Itens: taser ${j.itens.taser} carga(s), lanterna UV ${j.itens.uv}.`)
  if (j.estado === 'mordido') linhas.push(`VOCÊ FOI MORDIDO no tique ${j.mordidoEm}. Vai virar ZUMBI no tique ${j.viraEm}, a não ser que um Doutor te cure antes. Ninguém viu a mordida por fora: só você sabe.`)
  if (j.ouviu.length) linhas.push(`O que você OUVIU no último tique:\n${j.ouviu.map((f) => `- ${f}`).join('\n')}`)
  if (j.memoria.length) linhas.push(`Sua memória:\n${j.memoria.map((m) => `- ${m}`).join('\n')}`)
  linhas.push(`AÇÕES POSSÍVEIS (copie uma exatamente):\n${acoesDe(j).map((x) => `- ${x}`).join('\n')}`)
  return linhas.join('\n')
}

async function decidir(j) {
  const acoes = acoesDe(j)
  const r = await perguntar(j.provider, sistema(j), situacao(j), { maxTokens: 350, mock: () => JSON.stringify({ pensamento: 'teste', fala: rand() < 0.3 ? `Oi, sou o ${j.cor}` : '', acao: escolher(acoes) }) })
  const d = lerJSON(r.text) ?? {}
  const pedida = String(d.acao ?? '').trim()
  // casa a ação pedida com a lista (a IA às vezes muda maiúsculas ou tira as aspas); sem casamento = esperar
  const norm = (x) => x.toLowerCase().replace(/["“”'‘’]/g, '').replace(/\s+/g, ' ').trim()
  const acao = acoes.find((x) => norm(x) === norm(pedida)) ?? acoes.find((x) => norm(pedida).startsWith(norm(x).split(' (')[0])) ?? 'esperar'
  return { pensamento: String(d.pensamento ?? ''), fala: String(d.fala ?? '').slice(0, 300), acao, pedida, cru: r.text ?? '' }
}

function morder(z, h, como = 'mordida') {
  if (h.estado !== 'humano') return
  if (h.papel === 'Enlouquecido' && !h.imuneUsada) { h.imuneUsada = true; evento('mordida_imune', { zumbi: z.cor, alvo: h.cor, sala: h.sala, como }); lembrar(z, `Você mordeu ${h.cor}, mas nada aconteceu?`); return }
  h.estado = 'mordido'; h.mordidoEm = tique; h.viraEm = tique + CFG.incubacao
  evento('mordida', { zumbi: z.cor, alvo: h.cor, sala: h.sala, como, viraEm: h.viraEm })
  lembrar(z, `Você mordeu ${h.cor} (${como}).`)
  lembrar(h, `${z.cor} (zumbi) te MORDEU. Você vira zumbi no tique ${h.viraEm} se ninguém te curar.`)
}
function virarZumbi(j, motivo) {
  const n = zumbis().length; j.estado = 'zumbi'; j.tipo = DA_TEMP?.tiposZumbi[n] ?? escolher(Object.keys(ZUMBIS)); j.memoria = []
  evento('virou_zumbi', { cor: j.cor, classe: j.tipo, sala: j.sala, motivo })
  for (const o of naSala(j.sala, j)) lembrar(o, `${j.cor} VIROU ZUMBI (${j.tipo}) bem na sua frente, em ${nome(j.sala)}.`)
}
function atordoar(z, t, por, como) {
  // depois de acordar, o zumbi fica imune a novo atordoamento por alguns tiques (senão vira saco de pancada)
  if (tique < (z.imuneAte ?? 0)) { evento('atordoar_falhou', { por, zumbi: z.cor, sala: z.sala, como }); return }
  const d = z.tipo === 'Grande' ? Math.ceil(t / 2) : t
  z.atordoadoAte = Math.max(z.atordoadoAte ?? 0, tique + d + 1)
  z.imuneAte = z.atordoadoAte + CFG.resistencia
  evento('atordoou', { por, zumbi: z.cor, sala: z.sala, como, ate: z.atordoadoAte })
}
function erguerBarricada(j, gratis) {
  barricadas[j.sala] = { vida: CFG.barricadaVida, ate: tique + CFG.barricadaDura, por: j.cor }
  evento('barricada', { cor: j.cor, sala: j.sala, gratis, ate: tique + CFG.barricadaDura })
}

async function rodarTique() {
  // Paciente Zero e mordidos viram zumbi no começo do tique
  for (const j of jogadores) {
    if (j.pacienteZero && j.estado === 'humano' && tique >= j.viraEm) virarZumbi(j, 'paciente_zero')
    else if (j.estado === 'mordido' && tique >= j.viraEm) virarZumbi(j, 'mordida')
  }
  const ativos = jogadores.filter((j) => !j.salvo)
  const decisoes = await Promise.all(ativos.map(async (j) => [j, await decidir(j)]))
  // conversa por proximidade: cada fala é ouvida só na mesma sala (o Uivador ouve as vizinhas)
  for (const j of jogadores) j.ouviu = []
  for (const [j, d] of decisoes) {
    log.falas.push({ tique, cor: j.cor, sala: j.sala, estado: j.estado, tipo: j.tipo ?? null, pensamento: d.pensamento, fala: d.fala, acao: d.acao, pedida: d.pedida })
    if (!d.fala.trim()) continue
    for (const o of jogadores) if (o !== j && (o.sala === j.sala || (o.tipo === 'Uivador' && o.estado === 'zumbi' && SALAS[o.sala].viz.includes(j.sala)))) o.ouviu.push(`${j.cor}${j.estado === 'zumbi' ? ' (zumbi)' : ''} disse: "${d.fala}"${o.sala !== j.sala ? ` (na sala vizinha ${nome(j.sala)})` : ''}`)
  }
  // ordem de resolução: armas e cura -> barricadas -> MORDIDAS (antes de fugir) -> movimento -> uivo -> tarefas e loja
  const ord = (re) => decisoes.filter(([, d]) => re.test(d.acao))
  for (const [j, d] of ord(/^(atordoar|acender)/)) {
    const zs = naSala(j.sala, j).filter((z) => z.estado === 'zumbi')
    if (d.acao.startsWith('acender') && j.itens.uv > 0) { j.itens.uv--; for (const z of zs) atordoar(z, CFG.uvAtordoa, j.cor, 'uv') }
    else { const z = J(d.acao.split(' ')[1]); if (z && j.itens.taser > 0 && z.sala === j.sala) { j.itens.taser--; atordoar(z, CFG.taserAtordoa, j.cor, 'taser') } }
  }
  for (const [j, d] of ord(/^curar /)) {
    const h = J(d.acao.split(' ')[1]); j.recarga = tique + CFG.doutorRecarga
    if (h?.estado === 'mordido') { h.estado = 'humano'; h.viraEm = null; evento('cura', { doutor: j.cor, alvo: h.cor, sala: j.sala }); lembrar(h, `O Doutor ${j.cor} te CUROU da mordida.`) }
    else evento('cura_vazia', { doutor: j.cor, alvo: h?.cor, sala: j.sala })
  }
  for (const [j, d] of ord(/barricada/)) {
    if (d.acao.startsWith('comprar e erguer') && j.moedas >= CFG.precos.barricada) { j.moedas -= CFG.precos.barricada; erguerBarricada(j, false) }
    else if (d.acao.startsWith('erguer barricada de graça')) { j.recarga = tique + CFG.engenheiroRecarga; erguerBarricada(j, true) }
    else if (d.acao === 'consertar a barricada' && barricadas[j.sala]) { barricadas[j.sala].vida = CFG.barricadaVida; evento('conserto', { cor: j.cor, sala: j.sala }) }
    else if (d.acao.startsWith('abrir a barricada') && barricadas[j.sala]) { delete barricadas[j.sala]; evento('abriu_barricada', { cor: j.cor, sala: j.sala }) }
    else if (d.acao.startsWith('quebrar a barricada')) {
      const alvo = salaPorNome(d.acao.replace('quebrar a barricada de ', '')); const b = barricadas[alvo]
      if (b) { b.vida -= j.tipo === 'Grande' ? CFG.barricadaVida : 1; evento('golpe_barricada', { zumbi: j.cor, sala: alvo, vida: Math.max(0, b.vida) }); if (b.vida <= 0) { delete barricadas[alvo]; evento('barricada_quebrou', { zumbi: j.cor, sala: alvo }) } }
    }
  }
  for (const [z, d] of ord(/^(morder|cuspir)/)) {
    if (atordoado(z)) continue
    const h = J(d.acao.split(' ')[d.acao.startsWith('cuspir') ? 2 : 1])
    if (!h) continue
    if (d.acao.startsWith('cuspir')) { if (SALAS[z.sala].viz.includes(h.sala)) { z.cospeEm = tique + CFG.cuspidorRecarga; morder(z, h, 'cuspe') } }
    else if (h.sala === z.sala) morder(z, h)
  }
  for (const [j, d] of ord(/^(ir para|correr para)/)) {
    const destino = salaPorNome(d.acao.replace(/^(ir|correr) para /, '').replace(/ \(2 salas\)$/, ''))
    if (destino && !fechada(destino) && !fechada(j.sala)) { evento('moveu', { cor: j.cor, de: j.sala, para: destino }); j.sala = destino }
  }
  for (const [j, d] of ord(/^uivar$/)) {
    j.uivou = true; evento('uivo', { zumbi: j.cor, sala: j.sala })
    for (const h of naSala(j.sala, j).filter((h) => h.estado !== 'zumbi')) { const v = escolher(SALAS[j.sala].viz.filter((v) => !fechada(v)).concat(j.sala)); evento('fugiu_uivo', { cor: h.cor, de: h.sala, para: v }); h.sala = v; lembrar(h, `Um uivo te fez fugir em pânico para ${nome(v)}.`) }
  }
  for (const [j, d] of ord(/^(fazer a tarefa|comprar|olhar as câmeras)/)) {
    if (d.acao.startsWith('fazer a tarefa')) {
      const t = d.acao.match(/"(.+)"/)?.[1]; j.progresso ??= {}; j.progresso[t] = (j.progresso[t] ?? 0) + 1
      if (j.progresso[t] >= CFG.tarefaTiques) { j.progresso[t] = 0; j.moedas += CFG.moedasTarefa; radio++; evento('tarefa', { cor: j.cor, sala: j.sala, nome: t }) }
      else evento('tarefa_parte', { cor: j.cor, sala: j.sala, nome: t, feito: j.progresso[t], de: CFG.tarefaTiques })
    }
    else if (d.acao.startsWith('comprar taser') && j.moedas >= CFG.precos.taser) { j.moedas -= CFG.precos.taser; j.itens.taser += CFG.taserCargas; evento('compra', { cor: j.cor, item: 'taser' }) }
    else if (d.acao.startsWith('comprar lanterna') && j.moedas >= CFG.precos.uv) { j.moedas -= CFG.precos.uv; j.itens.uv++; evento('compra', { cor: j.cor, item: 'uv' }) }
    else if (d.acao.startsWith('olhar')) { const v = zumbis().map((z) => `${z.cor} em ${nome(z.sala)}`).join(', ') || 'nenhum zumbi'; lembrar(j, `Câmeras: ${v}.`); evento('cameras', { cor: j.cor, viu: v }) }
  }
  if (radio >= CFG.radioMeta && resgateEm == null) { resgateEm = tique; evento('resgate_chegou', { prazo: tique + CFG.resgatePrazo }) }
  if (resgateEm != null) for (const j of humanos()) if (j.sala === 'Lancamento' && j.estado === 'humano' && !j.salvo) { j.salvo = true; evento('salvo', { cor: j.cor }) }
  for (const [s, b] of Object.entries(barricadas)) if (b.ate <= tique) { delete barricadas[s]; evento('barricada_acabou', { sala: s }) }
  log.tiques.push({ tique, radio, resgateEm, barricadas: JSON.parse(JSON.stringify(barricadas)), estados: jogadores.map((j) => ({ cor: j.cor, sala: j.sala, estado: j.estado, tipo: j.tipo ?? null, atordoado: atordoado(j), moedas: j.moedas, itens: { ...j.itens }, salvo: !!j.salvo, viraEm: j.viraEm ?? null })) })
}

function fim() {
  const vivosLimpos = jogadores.filter((j) => j.estado === 'humano')
  const enl = jogadores.find((j) => j.papel === 'Enlouquecido')
  if (resgateEm != null && tique > resgateEm + CFG.resgatePrazo) {
    const salvos = jogadores.filter((j) => j.salvo).map((j) => j.cor)
    if (salvos.length) return { vencedor: 'humanos', como: 'resgate', salvos }
    // ninguém chegou a tempo: a nave vai embora e a noite continua (o rádio volta a zero)
    evento('resgate_perdido', {}); resgateEm = null; radio = 0
  }
  if (!jogadores.some((j) => j.estado !== 'zumbi' && !j.salvo) ) return jogadores.some((j) => j.salvo) ? { vencedor: 'humanos', como: 'resgate', salvos: jogadores.filter((j) => j.salvo).map((j) => j.cor) } : { vencedor: 'zumbis', como: 'todos_mordidos' }
  if (!jogadores.some((j) => j.estado === 'humano')) return { vencedor: 'zumbis', como: 'todos_mordidos', enlouquecido: enl?.estado === 'humano' ? enl.cor : null }
  if (tique >= CFG.amanhecer) {
    if (enl?.estado === 'humano' && vivosLimpos.length === 1) return { vencedor: 'enlouquecido', cor: enl.cor, como: 'ultimo_humano' }
    return { vencedor: 'humanos', como: 'amanhecer', sobreviventes: vivosLimpos.map((j) => j.cor) }
  }
  return null
}

// TETO DE GASTO (5/11: as partidas gastaram o crédito todo do OpenRouter sem aviso). Lê o gasto REAL da chave no OpenRouter
// (inclui chamadas cortadas por tempo, que também são cobradas) e para a partida antes de passar de ORCAMENTO_USD.
import { execFileSync } from 'node:child_process'
const ORCAMENTO = Number(process.env.ORCAMENTO_USD ?? args.orcamento ?? 1.0) // 5/11: o Felipe liberou US$ 1 por partida
function gastoOR() {
  try {
    let k = process.env.OPENROUTER_API_KEY
    if (!k) k = fs.readFileSync('/root/.claude/plugins/store/deepseek_inline-6aaca6566e14.json', 'utf8').match(/sk-or-[A-Za-z0-9_-]+/)?.[0]
    const r = JSON.parse(execFileSync('curl', ['-s', '--max-time', '20', 'https://openrouter.ai/api/v1/key', '-H', `Authorization: Bearer ${k}`], { encoding: 'utf8' }))
    return Number(r.data.usage)
  } catch { return null }
}
let gastoInicio = null

async function main() {
  if (!MOCK) { gastoInicio = gastoOR(); if (gastoInicio == null) throw new Error('não consegui ler o gasto do OpenRouter: não começo sem o teto de gasto') }
  montar()
  console.log(`Modo zumbi, partida ${NPARTIDA}, seed ${SEED}. Paciente Zero: ${jogadores.find((j) => j.pacienteZero).cor}`)
  for (tique = 1; tique <= CFG.amanhecer; tique++) {
    const t0 = Date.now()
    await rodarTique()
    const r = fim()
    console.log(`tique ${tique}: humanos ${limpos().length} · mordidos ${jogadores.filter((j) => j.estado === 'mordido').length} · zumbis ${zumbis().length} · rádio ${radio} (${((Date.now() - t0) / 1000).toFixed(0)} s)`)
    fs.mkdirSync(path.dirname(SAIDA), { recursive: true }); fs.writeFileSync(SAIDA, JSON.stringify(log))
    if (r) { log.resultado = r; break }
    if (!MOCK) {
      const g = gastoOR()
      log.gastoOR = g == null ? log.gastoOR : g - gastoInicio
      console.log(`  gasto real no OpenRouter nesta partida: US$ ${(log.gastoOR ?? 0).toFixed(3)} de ${ORCAMENTO}`)
      if (log.gastoOR > ORCAMENTO) { log.resultado = { vencedor: null, como: 'parada_por_orcamento', gasto: log.gastoOR }; console.log('PARADA: teto de gasto atingido'); break }
    }
  }
  if (!log.resultado) log.resultado = fim() ?? { vencedor: 'humanos', como: 'amanhecer' }
  log.uso = uso
  fs.writeFileSync(SAIDA, JSON.stringify(log))
  console.log('RESULTADO', JSON.stringify(log.resultado), 'custo', JSON.stringify(uso.custo ?? {}))
}
main().catch((e) => { console.error(e); log.erro = String(e); fs.writeFileSync(SAIDA, JSON.stringify(log)); process.exit(1) })
