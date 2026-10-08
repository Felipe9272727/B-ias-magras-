// Among Us com 8 IAs (DeepSeek Flash e Haiku). Motor por tiques: a cada tique cada jogador vivo
// escolhe uma ação; reuniões têm discussão em rodadas e votação. Tudo vai para um log JSON que o
// Remotion transforma em vídeo.
//
// Uso: node jogo.mjs [--seed N] [--mock] [--saida logs/partida1.json] [--max-tiques 70]
import fs from 'node:fs'
import path from 'node:path'
import { SALAS, BOTAO_EMERGENCIA, TAREFAS, vizinhos, dutosDe, caminho } from './mapa.mjs'
import { perguntar, lerJSON, uso } from './ia.mjs'

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : null)).filter(Boolean),
)
const MOCK = !!args.mock
const MAX_TIQUES = Number(args['max-tiques'] ?? 70)
const SAIDA = args.saida ?? `logs/partida_${Date.now()}.json`

// ---------- aleatoriedade reprodutível ----------
let semente = Number(args.seed ?? Math.floor(Math.random() * 1e9))
const SEED = semente
function rand() {
  semente = (semente * 1664525 + 1013904223) % 4294967296
  return semente / 4294967296
}
const escolher = (arr) => arr[Math.floor(rand() * arr.length)]
function embaralhar(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---------- configuração ----------
const CORES = ['Vermelho', 'Azul', 'Verde', 'Rosa', 'Laranja', 'Amarelo', 'Preto', 'Branco']
const MODELOS = { deepseek: 'DeepSeek Flash', haiku: 'Claude Haiku' }
const CFG = {
  recargaMorte: 5, // tiques entre mortes
  recargaSabotagem: 12,
  tarefasPorTripulante: 4,
  reatorPrazo: 10,
  metamorfoDuracao: 6,
  metamorfoRecarga: 12,
  ventEngenheiroRecarga: 4,
  vitaisRecarga: 6,
  rastreioDuracao: 6,
  rastreioRecarga: 10,
  rodadasDiscussao: 3,
  reunioesEmergencia: 1,
}

const PAPEIS = {
  Impostor: { time: 'impostor', desc: 'Você é IMPOSTOR. Mate tripulantes sem ser visto, use os dutos para fugir, sabote a nave e minta nas reuniões. Vocês vencem quando o número de impostores vivos for igual ao de tripulantes vivos, ou se o reator explodir.' },
  Metamorfo: { time: 'impostor', desc: 'Você é IMPOSTOR (Metamorfo). Além de matar, usar dutos e sabotar, pode se TRANSFORMAR em outro jogador por alguns tiques: quem te vê enxerga a cor do disfarce. Ótimo para incriminar alguém.' },
  Engenheiro: { time: 'tripulante', desc: 'Você é TRIPULANTE (Engenheiro). Faça suas tarefas e descubra os impostores. Você também pode usar os dutos — mas cuidado: quem te vir saindo de um duto pode achar que você é impostor.' },
  Cientista: { time: 'tripulante', desc: 'Você é TRIPULANTE (Cientista). Faça suas tarefas e descubra os impostores. Você pode checar os SINAIS VITAIS de qualquer lugar e saber quem está vivo ou morto.' },
  Rastreador: { time: 'tripulante', desc: 'Você é TRIPULANTE (Rastreador). Faça suas tarefas e descubra os impostores. Você pode RASTREAR um jogador e saber em que sala ele está por alguns tiques.' },
  Barulhento: { time: 'tripulante', desc: 'Você é TRIPULANTE (Barulhento). Faça suas tarefas e descubra os impostores. Se você for morto, toda a nave recebe um alerta dizendo a sala onde você morreu.' },
  Tripulante: { time: 'tripulante', desc: 'Você é TRIPULANTE. Faça suas tarefas e descubra quem são os impostores. Denuncie corpos e vote com cuidado.' },
}

const REGRAS = `Você está jogando uma partida de AMONG US (versão em texto) numa nave com 14 salas, junto com outros 7 jogadores. Cada jogador é uma IA diferente.
Regras principais:
- Há 2 impostores entre 8 jogadores. Os tripulantes vencem completando TODAS as tarefas ou expulsando os 2 impostores. Os impostores vencem quando ficam em número igual aos tripulantes vivos ou quando o reator explode.
- Cada tique você faz UMA ação. Andar leva você para uma sala vizinha por tique.
- Você só vê o que acontece na sua sala. Se alguém for morto na sua frente, você vê quem matou (a não ser que as luzes estejam apagadas).
- Corpos podem ser denunciados por quem estiver na mesma sala; isso chama uma reunião. No Refeitório há um botão de emergência (uso limitado).
- Nas reuniões todos conversam e depois votam em quem expulsar (ou pulam). Quem tiver mais votos é expulso e o jogo revela se era impostor.
- Fantasmas (mortos) não falam.
- Jogue para vencer, de forma esperta e coerente. Fale português do Brasil, de forma natural e curta, como num jogo de verdade.`

// ---------- estado ----------
const jogadores = []
const corpos = [] // {cor, sala, tique, denunciado}
const log = { seed: SEED, cfg: CFG, salas: SALAS, jogadores: [], tiques: [], reunioes: [], eventos: [], resultado: null }
let tique = 0
let sabotagem = null // {tipo, desde, prazo?, consertos:Set}
let recargaSabotagem = 6
let totalTarefas = 0

function montarPartida() {
  const papeis = embaralhar(['Impostor', 'Metamorfo', 'Engenheiro', 'Cientista', 'Rastreador', 'Barulhento', 'Tripulante', 'Tripulante'])
  // metade DeepSeek, metade Haiku; um impostor de cada modelo para a disputa ser justa
  const provs = ['deepseek', 'deepseek', 'deepseek', 'deepseek', 'haiku', 'haiku', 'haiku', 'haiku']
  const iImp = papeis.findIndex((p) => p === 'Impostor')
  const iMet = papeis.findIndex((p) => p === 'Metamorfo')
  const ordem = embaralhar([...Array(8).keys()].filter((i) => i !== iImp && i !== iMet))
  const atribs = Array(8)
  const ds = rand() < 0.5
  atribs[iImp] = ds ? 'deepseek' : 'haiku'
  atribs[iMet] = ds ? 'haiku' : 'deepseek'
  const resto = { deepseek: 3, haiku: 3 }
  for (const i of ordem) {
    const p = resto.deepseek > 0 && (resto.haiku === 0 || rand() < 0.5) ? 'deepseek' : 'haiku'
    resto[p]--
    atribs[i] = p
  }
  void provs
  CORES.forEach((cor, i) => {
    const papel = papeis[i]
    const time = PAPEIS[papel].time
    const tarefas = []
    if (time === 'tripulante') {
      const salas = embaralhar(Object.keys(TAREFAS)).slice(0, CFG.tarefasPorTripulante)
      for (const s of salas) {
        const [nome, dur] = escolher(TAREFAS[s])
        tarefas.push({ sala: s, nome, dur, feito: 0, ok: false })
      }
      totalTarefas += tarefas.length
    }
    jogadores.push({
      cor, papel, time, provider: MOCK ? 'mock' : atribs[i], modelo: MODELOS[atribs[i]],
      sala: 'Refeitorio', vivo: true, ejetado: false, tarefas, destino: null, tarefaAtual: null,
      recMorte: CFG.recargaMorte + 3, recPoder: 0, disfarce: null, disfarceAte: 0, rastreando: null, rastreioAte: 0,
      emergencias: CFG.reunioesEmergencia, memoria: [], ultimoPensamento: '', saiuDeDuto: false,
    })
  })
  log.jogadores = jogadores.map((j) => ({ cor: j.cor, papel: j.papel, time: j.time, modelo: j.modelo, provider: j.provider, tarefas: j.tarefas.map((t) => ({ sala: t.sala, nome: t.nome })) }))
}

const J = (cor) => jogadores.find((j) => j.cor === cor)
const vivos = () => jogadores.filter((j) => j.vivo)
const impostoresVivos = () => vivos().filter((j) => j.time === 'impostor')
const tripulantesVivos = () => vivos().filter((j) => j.time === 'tripulante')
const tarefasFeitas = () => jogadores.reduce((n, j) => n + j.tarefas.filter((t) => t.ok).length, 0)
const corAparente = (j) => (j.disfarce && tique < j.disfarceAte ? j.disfarce : j.cor)
const luzesApagadas = () => sabotagem?.tipo === 'Luzes'
const comsSabotadas = () => sabotagem?.tipo === 'Comunicações'

function evento(tipo, dados) {
  const e = { tique, tipo, ...dados }
  log.eventos.push(e)
  return e
}

function lembrar(j, texto) {
  j.memoria.push(`[t${tique}] ${texto}`)
  if (j.memoria.length > 40) j.memoria.splice(0, j.memoria.length - 40)
}

// o que j enxerga das outras pessoas na mesma sala
function quemVejo(j) {
  const outros = vivos().filter((o) => o !== j && o.sala === j.sala)
  if (luzesApagadas() && j.time === 'tripulante') return outros.length ? [`${outros.length} vulto(s) no escuro (luzes apagadas, não dá para ver as cores)`] : []
  return outros.map((o) => corAparente(o))
}

// ---------- ações disponíveis ----------
function acoesDe(j) {
  const a = []
  const aqui = j.sala
  const pessoasAqui = vivos().filter((o) => o !== j && o.sala === aqui)
  const corposAqui = corpos.filter((c) => c.sala === aqui && !c.denunciado)
  const crise = sabotagem?.tipo === 'Reator'

  if (corposAqui.length && !crise) for (const c of corposAqui) a.push(`denunciar corpo de ${c.cor}`)
  if (aqui === BOTAO_EMERGENCIA && j.emergencias > 0 && !sabotagem) a.push('apertar botão de emergência')

  if (sabotagem) {
    if (sabotagem.tipo === 'Reator' && aqui === 'Reator') a.push('consertar reator')
    if (sabotagem.tipo === 'Luzes' && aqui === 'Eletrica') a.push('consertar luzes')
    if (sabotagem.tipo === 'Comunicações' && aqui === 'Comunicacoes') a.push('consertar comunicações')
  }

  if (j.time === 'impostor') {
    if (j.recMorte <= 0) for (const o of pessoasAqui.filter((o) => o.time === 'tripulante')) a.push(`matar ${o.cor}`)
    for (const d of dutosDe(aqui)) a.push(`entrar no duto e sair em ${d}`)
    if (!sabotagem && recargaSabotagem <= 0) a.push('sabotar luzes', 'sabotar reator', 'sabotar comunicações')
    if (j.papel === 'Metamorfo' && j.recPoder <= 0) for (const o of jogadores.filter((o) => o !== j && o.vivo)) a.push(`transformar em ${o.cor}`)
    if (TAREFAS[aqui]) a.push('fingir que faz tarefa')
  } else {
    const t = j.tarefas.find((t) => !t.ok && t.sala === aqui)
    if (t) a.push(`fazer tarefa: ${t.nome}`)
    if (j.papel === 'Engenheiro' && j.recPoder <= 0) for (const d of dutosDe(aqui)) a.push(`entrar no duto e sair em ${d}`)
    if (j.papel === 'Cientista' && j.recPoder <= 0 && !comsSabotadas()) a.push('ver sinais vitais')
    if (j.papel === 'Rastreador' && j.recPoder <= 0 && !comsSabotadas()) for (const o of jogadores.filter((o) => o !== j && o.vivo)) a.push(`rastrear ${o.cor}`)
  }
  if (aqui === 'Admin' && !comsSabotadas()) a.push('olhar o mapa do Admin')
  if (aqui === 'Seguranca' && !luzesApagadas()) a.push('olhar as câmeras')
  for (const s of Object.keys(SALAS)) if (s !== aqui) a.push(`ir para ${s}`)
  a.push('ficar parado observando')
  return a
}

function situacao(j) {
  const linhas = []
  linhas.push(`TIQUE ${tique}. Você é o jogador ${j.cor}${j.disfarce && tique < j.disfarceAte ? ` (disfarçado de ${j.disfarce})` : ''}.`)
  linhas.push(`Você está em: ${SALAS[j.sala].nome}. Salas vizinhas: ${vizinhos(j.sala).map((s) => SALAS[s].nome).join(', ')}.`)
  const vejo = quemVejo(j)
  linhas.push(`Na sala com você: ${vejo.length ? vejo.join(', ') : 'ninguém'}.`)
  const corposAqui = corpos.filter((c) => c.sala === j.sala && !c.denunciado)
  if (corposAqui.length) linhas.push(`⚠️ CORPO(S) NESTA SALA: ${corposAqui.map((c) => c.cor).join(', ')}.`)
  if (sabotagem) linhas.push(`🚨 SABOTAGEM ATIVA: ${sabotagem.tipo}${sabotagem.tipo === 'Reator' ? ` — o reator explode no tique ${sabotagem.desde + CFG.reatorPrazo} se 2 jogadores não consertarem no Reator!` : sabotagem.tipo === 'Luzes' ? ' (conserte na Elétrica)' : ' (conserte em Comunicações)'}`)
  if (j.time === 'tripulante') {
    const pend = j.tarefas.filter((t) => !t.ok)
    linhas.push(`Suas tarefas pendentes: ${pend.length ? pend.map((t) => `${t.nome} (${SALAS[t.sala].nome})`).join('; ') : 'nenhuma — todas feitas!'}`)
    if (!comsSabotadas()) linhas.push(`Barra de tarefas da nave: ${Math.round((100 * tarefasFeitas()) / totalTarefas)}%.`)
  } else {
    const parc = jogadores.find((o) => o !== j && o.time === 'impostor')
    linhas.push(`Seu parceiro impostor: ${parc.cor}${parc.vivo ? '' : ' (morto/expulso)'}. Recarga para matar: ${Math.max(0, j.recMorte)} tique(s). Sabotagem disponível em: ${Math.max(0, recargaSabotagem)} tique(s).`)
  }
  if (j.rastreando && tique < j.rastreioAte) linhas.push(`📡 Rastreio: ${j.rastreando} está em ${SALAS[J(j.rastreando).sala].nome}.`)
  linhas.push(`Jogadores vivos: ${vivos().length}.`)
  if (j.memoria.length) linhas.push(`\nO que você lembra (mais recente por último):\n${j.memoria.slice(-18).join('\n')}`)
  return linhas.join('\n')
}

function sistema(j) {
  return `${REGRAS}\n\nSEU PAPEL: ${PAPEIS[j.papel].desc}\nVocê é a IA ${j.modelo}, jogando com a cor ${j.cor}.`
}

function mockAcao(acoes) {
  // no modo de teste, prioriza ações que geram drama (para exercitar mortes e reuniões)
  const forte = acoes.filter((a) => /^(matar|denunciar)/.test(a))
  const tarefa = acoes.filter((a) => a.startsWith('fazer tarefa'))
  return () => JSON.stringify({ pensamento: 'teste', acao: forte.length ? forte[0] : tarefa.length && rand() < 0.7 ? tarefa[0] : escolher(acoes) })
}

async function decidir(j) {
  const acoes = acoesDe(j)
  const prompt = `${situacao(j)}\n\nAÇÕES POSSÍVEIS AGORA (escolha exatamente uma, copiando o texto):\n${acoes.map((x) => `- ${x}`).join('\n')}\n\nResponda SÓ com JSON: {"pensamento": "<o que você está pensando, 1 frase curta, em primeira pessoa>", "acao": "<uma das ações acima>"}`
  const r = await perguntar(j.provider, sistema(j), prompt, { maxTokens: 260, mock: mockAcao(acoes) })
  const d = lerJSON(r.text) ?? {}
  let acao = typeof d.acao === 'string' ? d.acao.trim() : ''
  if (!acoes.includes(acao)) {
    const parecida = acoes.find((x) => x.toLowerCase() === acao.toLowerCase()) ?? acoes.find((x) => acao && x.toLowerCase().includes(acao.toLowerCase()))
    acao = parecida ?? 'ficar parado observando'
  }
  return { acao, pensamento: String(d.pensamento ?? '').slice(0, 300) }
}

// ---------- execução de um tique ----------
async function rodarTique() {
  const ativos = vivos()
  // decisões em paralelo; quem está andando até um destino só repensa se algo mudar
  const decisoes = await Promise.all(
    ativos.map(async (j) => {
      const algoNovo = corpos.some((c) => c.sala === j.sala && !c.denunciado) || sabotagem?.tipo === 'Reator'
      if (j.destino && j.destino !== j.sala && !algoNovo) return { j, acao: `continuar até ${j.destino}`, pensamento: '' }
      const d = await decidir(j)
      return { j, ...d }
    }),
  )
  // ordem aleatória de execução dentro do tique
  const snapAntes = Object.fromEntries(jogadores.map((j) => [j.cor, j.sala]))
  let reuniao = null
  const mortesDoTique = []
  for (const { j, acao, pensamento } of embaralhar(decisoes)) {
    if (!j.vivo) continue
    if (pensamento) j.ultimoPensamento = pensamento
    const reg = { cor: j.cor, acao, pensamento, de: j.sala }
    let m
    if ((m = acao.match(/^ir para (\w+)$/))) {
      j.destino = m[1]
      const c = caminho(j.sala, j.destino)
      j.sala = c[1] ?? j.sala
      if (j.sala === j.destino) j.destino = null
      j.tarefaAtual = null
    } else if ((m = acao.match(/^continuar até (\w+)$/))) {
      const c = caminho(j.sala, m[1])
      j.sala = c[1] ?? j.sala
      if (j.sala === j.destino) j.destino = null
    } else if ((m = acao.match(/^fazer tarefa: (.+)$/))) {
      const t = j.tarefas.find((t) => !t.ok && t.sala === j.sala && t.nome === m[1])
      if (t) {
        t.feito++
        if (t.feito >= t.dur) { t.ok = true; evento('tarefa', { cor: j.cor, sala: j.sala, nome: t.nome }); lembrar(j, `Terminei a tarefa "${t.nome}" em ${SALAS[j.sala].nome}.`) }
      }
    } else if (acao === 'fingir que faz tarefa') {
      lembrar(j, `Fingi fazer tarefa em ${SALAS[j.sala].nome}.`)
    } else if ((m = acao.match(/^matar (\w+)$/))) {
      const alvo = J(m[1])
      if (alvo?.vivo && alvo.sala === j.sala && j.recMorte <= 0) {
        alvo.vivo = false
        j.recMorte = CFG.recargaMorte
        corpos.push({ cor: alvo.cor, sala: j.sala, tique, denunciado: false })
        mortesDoTique.push({ assassino: j, alvo })
        evento('morte', { assassino: j.cor, aparente: corAparente(j), vitima: alvo.cor, sala: j.sala })
        lembrar(j, `Matei ${alvo.cor} em ${SALAS[j.sala].nome}.`)
        // testemunhas
        for (const t of vivos().filter((o) => o !== j && o.sala === j.sala)) {
          if (luzesApagadas() && t.time === 'tripulante') lembrar(t, `No escuro, alguém matou ${alvo.cor} aqui em ${SALAS[j.sala].nome}! Não deu para ver quem.`)
          else lembrar(t, `EU VI ${corAparente(j)} MATAR ${alvo.cor} em ${SALAS[j.sala].nome}!`)
        }
        if (alvo.papel === 'Barulhento') {
          evento('alerta_barulhento', { vitima: alvo.cor, sala: j.sala })
          for (const o of vivos()) lembrar(o, `🔔 ALERTA: o Barulhento (${alvo.cor}) foi morto em ${SALAS[j.sala].nome}!`)
        }
      }
    } else if ((m = acao.match(/^entrar no duto e sair em (\w+)$/))) {
      const origem = j.sala
      for (const t of vivos().filter((o) => o !== j && o.sala === origem)) if (!(luzesApagadas() && t.time === 'tripulante')) lembrar(t, `Vi ${corAparente(j)} ENTRAR NUM DUTO em ${SALAS[origem].nome}!`)
      j.sala = m[1]
      j.destino = null
      if (j.papel === 'Engenheiro') j.recPoder = CFG.ventEngenheiroRecarga
      evento('duto', { cor: j.cor, aparente: corAparente(j), de: origem, para: j.sala })
      for (const t of vivos().filter((o) => o !== j && o.sala === j.sala)) if (!(luzesApagadas() && t.time === 'tripulante')) lembrar(t, `Vi ${corAparente(j)} SAIR DE UM DUTO em ${SALAS[j.sala].nome}!`)
    } else if ((m = acao.match(/^sabotar (.+)$/))) {
      const tipo = { luzes: 'Luzes', reator: 'Reator', 'comunicações': 'Comunicações' }[m[1]]
      if (tipo && !sabotagem) {
        sabotagem = { tipo, desde: tique, consertos: new Set() }
        recargaSabotagem = CFG.recargaSabotagem
        evento('sabotagem', { cor: j.cor, tipo })
        for (const o of vivos()) lembrar(o, o.time === 'impostor' ? `Sabotagem de ${tipo} ativada${o === j ? ' por mim' : ` por ${j.cor}`}.` : `🚨 Sabotagem: ${tipo}!`)
      }
    } else if ((m = acao.match(/^transformar em (\w+)$/))) {
      j.disfarce = m[1]
      j.disfarceAte = tique + CFG.metamorfoDuracao
      j.recPoder = CFG.metamorfoRecarga
      evento('transformacao', { cor: j.cor, em: j.disfarce, sala: j.sala })
      for (const t of vivos().filter((o) => o !== j && o.sala === j.sala)) if (!(luzesApagadas() && t.time === 'tripulante')) lembrar(t, `Vi ${j.cor} se TRANSFORMAR em ${j.disfarce}!`)
      lembrar(j, `Me transformei em ${j.disfarce} até o tique ${j.disfarceAte}.`)
    } else if (acao === 'ver sinais vitais') {
      j.recPoder = CFG.vitaisRecarga
      const mortos = jogadores.filter((o) => !o.vivo).map((o) => o.cor)
      lembrar(j, `Sinais vitais: mortos/expulsos = ${mortos.length ? mortos.join(', ') : 'ninguém'}.`)
      evento('poder', { cor: j.cor, poder: 'vitais' })
    } else if ((m = acao.match(/^rastrear (\w+)$/))) {
      j.rastreando = m[1]
      j.rastreioAte = tique + CFG.rastreioDuracao
      j.recPoder = CFG.rastreioRecarga
      evento('poder', { cor: j.cor, poder: 'rastrear', alvo: m[1] })
    } else if (acao === 'olhar o mapa do Admin') {
      const cont = {}
      for (const o of vivos()) cont[o.sala] = (cont[o.sala] ?? 0) + 1
      lembrar(j, `Mapa do Admin: ${Object.entries(cont).map(([s, n]) => `${SALAS[s].nome}: ${n}`).join(', ')}.`)
    } else if (acao === 'olhar as câmeras') {
      const vis = ['Refeitorio', 'Admin', 'Navegacao', 'MotorSuperior', 'Enfermaria']
      const vistos = vis.map((s) => `${SALAS[s].nome}: ${vivos().filter((o) => o.sala === s && o !== j).map(corAparente).join(', ') || 'vazio'}`)
      lembrar(j, `Câmeras: ${vistos.join(' | ')}.`)
    } else if (acao === 'consertar reator' && sabotagem?.tipo === 'Reator') {
      sabotagem.consertos.add(j.cor)
      lembrar(j, 'Estou consertando o reator.')
      if (sabotagem.consertos.size >= 2) { evento('conserto', { tipo: 'Reator', por: [...sabotagem.consertos] }); for (const o of vivos()) lembrar(o, `Reator consertado por ${[...sabotagem.consertos].join(' e ')}.`); sabotagem = null }
    } else if ((acao === 'consertar luzes' && sabotagem?.tipo === 'Luzes') || (acao === 'consertar comunicações' && sabotagem?.tipo === 'Comunicações')) {
      evento('conserto', { tipo: sabotagem.tipo, por: [j.cor] })
      for (const o of vivos()) lembrar(o, `${sabotagem.tipo} consertado(a).`)
      sabotagem = null
    } else if ((m = acao.match(/^denunciar corpo de (\w+)$/))) {
      const c = corpos.find((c) => c.cor === m[1] && c.sala === j.sala && !c.denunciado)
      if (c && !reuniao) reuniao = { tipo: 'corpo', chamador: j.cor, corpo: c.cor, sala: j.sala }
    } else if (acao === 'apertar botão de emergência') {
      if (j.emergencias > 0 && !reuniao) { j.emergencias--; reuniao = { tipo: 'emergencia', chamador: j.cor, sala: j.sala } }
    }
    log_decisao(reg, j)
  }

  // movimentos vistos: quem chegou / saiu da minha sala
  for (const j of vivos()) {
    const chegaram = vivos().filter((o) => o !== j && o.sala === j.sala && snapAntes[o.cor] !== j.sala)
    if (chegaram.length && !(luzesApagadas() && j.time === 'tripulante')) lembrar(j, `Em ${SALAS[j.sala].nome}: ${chegaram.map(corAparente).join(', ')} chegou/chegaram.`)
    const corposNovos = corpos.filter((c) => c.sala === j.sala && !c.denunciado)
    if (corposNovos.length) lembrar(j, `Estou vendo o corpo de ${corposNovos.map((c) => c.cor).join(', ')} em ${SALAS[j.sala].nome}.`)
  }

  // recargas e sabotagem
  for (const j of jogadores) { j.recMorte--; j.recPoder--; if (j.disfarce && tique >= j.disfarceAte) j.disfarce = null }
  recargaSabotagem--
  // fantasmas tripulantes continuam fazendo tarefas (sem gastar IA)
  for (const g of jogadores.filter((g) => !g.vivo && g.time === 'tripulante')) {
    const t = g.tarefas.find((t) => !t.ok)
    if (t) { t.feito++; if (t.feito >= t.dur + 1) { t.ok = true; evento('tarefa', { cor: g.cor, fantasma: true, nome: t.nome }) } }
  }
  snapshot()
  return reuniao
}

function log_decisao(reg, j) {
  reg.para = j.sala
  ;(log.tiques[tique] ??= { tique, decisoes: [], estado: null }).decisoes.push(reg)
}

function snapshot() {
  ;(log.tiques[tique] ??= { tique, decisoes: [], estado: null }).estado = {
    jogadores: jogadores.map((j) => ({ cor: j.cor, sala: j.sala, vivo: j.vivo, ejetado: j.ejetado, aparente: corAparente(j) })),
    corpos: corpos.filter((c) => !c.denunciado).map((c) => ({ ...c })),
    sabotagem: sabotagem ? { tipo: sabotagem.tipo, desde: sabotagem.desde } : null,
    tarefas: tarefasFeitas(),
    totalTarefas,
  }
}

// ---------- reunião ----------
async function reuniaoDeEmergencia(info) {
  const r = { tique, ...info, falas: [], votos: {}, expulso: null, empate: false }
  evento('reuniao', info)
  for (const c of corpos) c.denunciado = true
  sabotagem = null
  const presentes = vivos()
  const intro = info.tipo === 'corpo'
    ? `${info.chamador} encontrou o corpo de ${info.corpo} em ${SALAS[info.sala].nome} e chamou uma reunião.`
    : `${info.chamador} apertou o botão de emergência.`
  const mortos = jogadores.filter((j) => !j.vivo).map((j) => (j.ejetado ? `${j.cor} (expulso)` : j.cor))
  const ctx = (j) => `REUNIÃO no tique ${tique}. ${intro}\nOnde cada vivo estava quando a reunião foi chamada: (você só sabe o que viu)\nMortos até agora: ${mortos.join(', ') || 'ninguém'}.\nVivos: ${presentes.map((p) => p.cor).join(', ')}.\n\n${situacao(j)}`

  for (let rodada = 1; rodada <= CFG.rodadasDiscussao; rodada++) {
    for (const j of embaralhar(presentes)) {
      const conversa = r.falas.map((f) => `${f.cor}: ${f.texto}`).join('\n') || '(ninguém falou ainda)'
      const prompt = `${ctx(j)}\n\nCONVERSA ATÉ AGORA:\n${conversa}\n\nRodada ${rodada} de ${CFG.rodadasDiscussao}. É a sua vez de falar no chat (1 a 2 frases curtas, natural, como um jogador de Among Us). Você pode acusar, se defender, contar o que viu, dar álibi ou fazer perguntas. Lembre: os outros não sabem o que você sabe. Responda SÓ com JSON: {"pensamento": "<o que você pensa de verdade, em segredo>", "fala": "<o que você diz no chat>"}`
      const resp = await perguntar(j.provider, sistema(j), prompt, { maxTokens: 300, mock: () => JSON.stringify({ pensamento: 'hmm', fala: `Eu tava em ${SALAS[j.sala].nome}.` }) })
      const d = lerJSON(resp.text) ?? {}
      const fala = String(d.fala ?? '').trim().slice(0, 400) || '...'
      r.falas.push({ cor: j.cor, rodada, texto: fala, pensamento: String(d.pensamento ?? '').slice(0, 300) })
      process.stdout.write(`  💬 ${j.cor} (${j.modelo}): ${fala}\n`)
    }
  }
  // votação em paralelo
  const opcoes = [...presentes.map((p) => p.cor), 'pular']
  const votos = await Promise.all(
    presentes.map(async (j) => {
      const conversa = r.falas.map((f) => `${f.cor}: ${f.texto}`).join('\n')
      const prompt = `${ctx(j)}\n\nCONVERSA COMPLETA:\n${conversa}\n\nHora de VOTAR. Opções: ${opcoes.filter((o) => o !== j.cor).join(', ')}. Responda SÓ com JSON: {"pensamento": "<por que, em segredo>", "voto": "<cor ou pular>"}`
      const resp = await perguntar(j.provider, sistema(j), prompt, { maxTokens: 200, mock: () => JSON.stringify({ voto: escolher(opcoes) }) })
      const d = lerJSON(resp.text) ?? {}
      let v = String(d.voto ?? 'pular').trim()
      v = opcoes.find((o) => o.toLowerCase() === v.toLowerCase()) ?? 'pular'
      if (v === j.cor) v = 'pular'
      return { cor: j.cor, voto: v, pensamento: String(d.pensamento ?? '').slice(0, 300) }
    }),
  )
  const cont = {}
  for (const v of votos) { r.votos[v.cor] = v.voto; cont[v.voto] = (cont[v.voto] ?? 0) + 1 }
  r.pensamentosVoto = Object.fromEntries(votos.map((v) => [v.cor, v.pensamento]))
  const max = Math.max(...Object.values(cont))
  const top = Object.keys(cont).filter((k) => cont[k] === max)
  if (top.length > 1 || top[0] === 'pular') { r.empate = top.length > 1; r.expulso = null }
  else {
    const ej = J(top[0])
    ej.vivo = false
    ej.ejetado = true
    r.expulso = ej.cor
    r.eraImpostor = ej.time === 'impostor'
  }
  const resumoVotos = Object.entries(r.votos).map(([a, b]) => `${a}→${b}`).join(', ')
  const desfecho = r.expulso ? `${r.expulso} foi expulso. ${r.expulso} ${r.eraImpostor ? 'ERA' : 'NÃO era'} um impostor.` : r.empate ? 'Empate: ninguém foi expulso.' : 'A maioria pulou: ninguém foi expulso.'
  for (const j of jogadores) {
    lembrar(j, `Reunião (${intro}) Votos: ${resumoVotos}. ${desfecho}`)
    for (const f of r.falas.filter((f) => f.cor !== j.cor)) j.memoria.length < 80 && void f
  }
  // depois da reunião todo mundo volta ao Refeitório, recargas reiniciam
  for (const j of vivos()) { j.sala = 'Refeitorio'; j.destino = null; j.recMorte = Math.max(j.recMorte, CFG.recargaMorte); j.disfarce = null }
  recargaSabotagem = Math.max(recargaSabotagem, 6)
  log.reunioes.push(r)
  evento('fim_reuniao', { expulso: r.expulso, eraImpostor: r.eraImpostor ?? null, empate: r.empate })
  console.log(`  🗳️  ${resumoVotos}\n  ➡️  ${desfecho}`)
  snapshot()
}

function vencedor() {
  if (impostoresVivos().length === 0) return { time: 'tripulante', motivo: 'Os dois impostores foram expulsos.' }
  if (tarefasFeitas() >= totalTarefas) return { time: 'tripulante', motivo: 'Todas as tarefas foram concluídas.' }
  if (impostoresVivos().length >= tripulantesVivos().length) return { time: 'impostor', motivo: 'Os impostores ficaram em igualdade com os tripulantes.' }
  if (sabotagem?.tipo === 'Reator' && tique >= sabotagem.desde + CFG.reatorPrazo) return { time: 'impostor', motivo: 'O reator explodiu.' }
  return null
}

function salvar() {
  fs.mkdirSync(path.dirname(SAIDA), { recursive: true })
  log.uso = uso
  fs.writeFileSync(SAIDA, JSON.stringify(log, null, 1))
}

async function main() {
  montarPartida()
  console.log(`🚀 Partida seed=${SEED}${MOCK ? ' (MOCK)' : ''}`)
  for (const j of jogadores) console.log(`  ${j.cor.padEnd(9)} ${j.papel.padEnd(11)} ${j.modelo}`)
  snapshot()
  for (tique = 1; tique <= MAX_TIQUES; tique++) {
    const reuniao = await rodarTique()
    const resumo = (log.tiques[tique]?.decisoes ?? []).filter((d) => !d.acao.startsWith('continuar') && !d.acao.startsWith('ir para') && d.acao !== 'ficar parado observando').map((d) => `${d.cor}: ${d.acao}`)
    console.log(`t${tique} tarefas ${tarefasFeitas()}/${totalTarefas}${sabotagem ? ` 🚨${sabotagem.tipo}` : ''} | ${resumo.join(' | ')}`)
    let v = vencedor()
    if (!v && reuniao) { await reuniaoDeEmergencia(reuniao); v = vencedor() }
    salvar()
    if (v) { log.resultado = { ...v, tique }; break }
  }
  if (!log.resultado) log.resultado = { time: 'empate', motivo: 'Limite de tiques atingido.', tique: MAX_TIQUES }
  evento('fim', log.resultado)
  salvar()
  console.log(`🏁 ${log.resultado.time.toUpperCase()} venceu — ${log.resultado.motivo} (tique ${log.resultado.tique}) | chamadas IA: ${uso.chamadas}, falhas: ${uso.falhas}`)
  console.log(`log: ${SAIDA}`)
}

main().catch((e) => { console.error(e); salvar(); process.exit(1) })
