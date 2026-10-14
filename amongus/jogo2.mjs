// Among Us 2: 12 IAs de 5 empresas (DeepSeek, Claude Haiku, GPT, Gemini e Grok) e 3 impostores, cada um de
// uma empresa. Mesmo motor por tiques do vídeo 2 (jogo.mjs), com o papel Fantasma, impostores que sabem quem
// está vendo (quem está na sala e quem está do outro lado do duto) e, opcionalmente, um impostor que joga com a
// estratégia mandada por uma inscrita (--estrategia).
//
// Temporada: python3 sorteio.py sorteia (de verdade) cores, papéis, sementes e quem recebe a estratégia; o motor só lê.
// Cada IA mantém a cor e lembra das partidas anteriores (logs2/memoria.json: resumo público + a reflexão dela).
//
// Uso: node jogo2.mjs --temporada logs2/temporada.json --partida 1 [--mock] [--max-tiques 70]
//      node jogo2.mjs [--seed N] [--mock] [--estrategia]   (partida avulsa, sorteio pela semente)
import fs from 'node:fs'
import path from 'node:path'
import { SALAS, BOTAO_EMERGENCIA, TAREFAS, vizinhos, dutosDe, caminho } from './mapa.mjs'
import { perguntar, lerJSON, uso } from './ia.mjs'

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : null)).filter(Boolean),
)
const MOCK = !!args.mock
const MAX_TIQUES = Number(args['max-tiques'] ?? 70)
const SAIDA = args.saida ?? (args.temporada ? path.join(path.dirname(args.temporada), `partida${args.partida ?? 1}${args.mock ? '_mock' : ''}.json`) : `logs2/partida_${Date.now()}.json`)
const ESTRATEGIA = !!args.estrategia
const TEMPORADA = args.temporada ? JSON.parse(fs.readFileSync(args.temporada, 'utf8')) : null
const NPARTIDA = Number(args.partida ?? 1)
const DA_TEMPORADA = TEMPORADA ? TEMPORADA.partidas[NPARTIDA - 1] : null
const MEMORIA_ARQ = args.memoria ?? path.join(path.dirname(args.temporada ?? 'logs2/x'), 'memoria.json')
const MEMORIA = TEMPORADA && fs.existsSync(MEMORIA_ARQ) ? JSON.parse(fs.readFileSync(MEMORIA_ARQ, 'utf8')).partidas.filter((m) => m.n < NPARTIDA) : []

// ---------- aleatoriedade reprodutível ----------
let semente = Number(DA_TEMPORADA?.seed ?? args.seed ?? Math.floor(Math.random() * 1e9))
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
const CORES = ['Vermelho', 'Azul', 'Verde', 'Rosa', 'Laranja', 'Amarelo', 'Preto', 'Branco', 'Roxo', 'Marrom', 'Ciano', 'Lima']
// provider → nome que aparece no vídeo. GPT, Gemini e Grok vão pelo OpenRouter (versões rápidas, pelo custo).
const MODELOS = {
  deepseek: 'DeepSeek Flash', haiku: 'Claude Haiku', opus: 'Claude Opus',
  'or:openai/gpt-5.6-luna': 'GPT-5.6 Luna', 'or:google/gemini-3.8-flash': 'Gemini 3.8 Flash', 'or:x-ai/grok-4.3': 'Grok 4.3',
}
const EMPRESA = { deepseek: 'DeepSeek', haiku: 'Claude (Anthropic)', opus: 'Claude (Anthropic)', 'or:openai/gpt-5.6-luna': 'GPT (OpenAI)', 'or:google/gemini-3.8-flash': 'Gemini (Google)', 'or:x-ai/grok-4.3': 'Grok (xAI)', mock: 'Mock' }
const VAGAS = { deepseek: 3, haiku: 3, 'or:openai/gpt-5.6-luna': 2, 'or:google/gemini-3.8-flash': 2, 'or:x-ai/grok-4.3': 2 }
// estratégia de impostor mandada pela inscrita @MariadeFátimaTorres-t7y nos comentários do Short
// "manual do bom impostor" que o Claude Opus recebe na partida em que entra como impostor
const MANUAL_IMPOSTOR = `MANUAL DO BOM IMPOSTOR (estratégias de jogadores experientes; adapte à situação):
DISFARCE
1. Aja como um tripulante normal: finja tarefas em salas que TÊM tarefa, por 2-3 tiques seguidos (o tempo de uma tarefa de verdade), e ande perto de outras pessoas. Quando houver sabotagem, vá "ajudar" a consertar: fugir de emergência é suspeito.
2. Com a faca em recarga, grude num tripulante sozinho: isso vira seu álibi quando um corpo aparecer.
MATAR
3. Mate só quando estiver SOZINHO com a vítima (confira as testemunhas e o outro lado do duto). De preferência numa sala com duto: mate e saia pelo duto na hora, para longe do corpo.
4. Escolha bem: elimine primeiro quem é perigoso (quem examina corpos, quem olha câmeras/admin, quem rastreia, quem acertou votos ou desconfia de você). Deixe VIVO quem os outros já acham suspeito: a desconfiança deles te protege. Não mate logo quem acabou de te acusar (isso o inocentaria).
5. Conte sempre: impostores vivos x tripulantes vivos. Se as tarefas estão quase no fim, você precisa matar ou sabotar já.
SABOTAGEM
6. Logo depois de matar, sabote algo LONGE do corpo (o reator, se der): todo mundo corre pro outro lado e o corpo demora a ser achado. Luzes apagadas cegam os tripulantes e separam grupos; comunicações desligam câmeras, admin, sinais vitais e rastreio.
7. O reator só se conserta com 2 pessoas: sabote quando a tripulação estiver espalhada ou longe dele, e ele pode até vencer a partida sozinho.
REUNIÃO
8. Dê um álibi ESPECÍFICO e coerente (sala, tarefa, quem você viu). Nunca diga que viu algo que não podia ter visto. Confirme coisas verdadeiras que outros disseram para ganhar confiança.
9. Se te acusarem, reaja na hora e com firmeza, com detalhes, e devolva a acusação apontando algo estranho que o acusador fez. Silêncio ou desculpa fraca parecem culpa.
10. Não vote rápido demais num inocente nem vote sempre igual aos seus parceiros. Se um parceiro foi pego em flagrante, vote nele também: perder um parceiro é melhor do que cair junto.
11. Só se autodenuncie (achar o "próprio" corpo) se não houver como sair e, de preferência, com outra pessoa por perto para dividir a suspeita.
FIM DE JOGO
12. Quando faltar UMA morte para os impostores empatarem com os tripulantes, mate sem hesitar ou sabote o reator para fechar a partida.`
const ESTRATEGIA_MARIA = 'Se matar alguém com 2 pessoas por perto, acuse a outra. Use o duto e diga que é Engenheiro. Saia do duto e finja tarefa, para acharem que não foi você. Depois se afaste, mate a outra pessoa, e daí é só sabotar e matar longe.'
const CFG = {
  fantasmaTarefaCada: 1, // de quantos em quantos tiques um fantasma avança uma tarefa
  recargaMorte: 5, // tiques entre mortes
  recargaSabotagem: 12,
  tarefasPorTripulante: 5,
  reatorPrazo: 10,
  metamorfoDuracao: 6,
  metamorfoRecarga: 12,
  ventEngenheiroRecarga: 4,
  vitaisRecarga: 6,
  rastreioDuracao: 6,
  rastreioRecarga: 10,
  rodadasDiscussao: 2,
  xerifeRecarga: 8,
  detetiveRecarga: 4,
  fantasmaDuracao: 4,
  fantasmaRecarga: 12,
  reunioesEmergencia: 1,
}

const PAPEIS = {
  Impostor: { time: 'impostor', desc: 'Você é IMPOSTOR. Mate tripulantes sem ser visto, use os dutos para fugir, sabote a nave e minta nas reuniões. Vocês vencem quando o número de impostores vivos for igual ao de tripulantes vivos, ou se o reator explodir.' },
  Fantasma: { time: 'impostor', desc: 'Você é IMPOSTOR (Fantasma). Além de matar, usar dutos e sabotar, pode ficar INVISÍVEL por alguns tiques: ninguém te vê andando. Mas você não pode matar invisível, e quem estiver na sala te vê reaparecer.' },
  Metamorfo: { time: 'impostor', desc: 'Você é IMPOSTOR (Metamorfo). Além de matar, usar dutos e sabotar, pode se TRANSFORMAR em outro jogador por alguns tiques: quem te vê enxerga a cor do disfarce. Ótimo para incriminar alguém.' },
  Engenheiro: { time: 'tripulante', desc: 'Você é TRIPULANTE (Engenheiro). Faça suas tarefas e descubra os impostores. Você também pode usar os dutos — mas cuidado: quem te vir saindo de um duto pode achar que você é impostor.' },
  Cientista: { time: 'tripulante', desc: 'Você é TRIPULANTE (Cientista). Faça suas tarefas e descubra os impostores. Você pode checar os SINAIS VITAIS de qualquer lugar e saber quem está vivo ou morto.' },
  Rastreador: { time: 'tripulante', desc: 'Você é TRIPULANTE (Rastreador). Faça suas tarefas e descubra os impostores. Você pode RASTREAR um jogador e saber em que sala ele está por alguns tiques.' },
  Barulhento: { time: 'tripulante', desc: 'Você é TRIPULANTE (Barulhento). Faça suas tarefas e descubra os impostores. Se você for morto, toda a nave recebe um alerta dizendo a sala onde você morreu.' },
  Xerife: { time: 'tripulante', desc: 'Você é TRIPULANTE (Xerife). Faça tarefas e caçe os impostores. Seu PODER: ATIRAR em alguém da sua sala. Se for impostor, ele morre. Se for inocente, quem morre é VOCÊ. Só atire com certeza (viu matar, viu sair do duto, pegou na mentira).' },
  Medico: { time: 'tripulante', desc: 'Você é TRIPULANTE (Médico). Faça tarefas. Seu PODER: colocar um ESCUDO em um jogador (de qualquer lugar). Se um impostor tentar matar quem tem escudo, o ataque falha e você fica sabendo. O escudo dura até a próxima reunião; proteja quem parece estar em perigo ou quem você confia.' },
  Prefeito: { time: 'tripulante', desc: 'Você é TRIPULANTE (Prefeito). Faça tarefas e descubra os impostores. Seu PODER é passivo e secreto: na votação seu voto vale por DOIS. Use isso para decidir as expulsões, mas cuidado para não expulsar um inocente.' },
  Detetive: { time: 'tripulante', desc: 'Você é TRIPULANTE (Detetive). Faça tarefas. Seu PODER: EXAMINAR um corpo na sua sala (antes de denunciar) e descobrir de qual EMPRESA de IA é o assassino (DeepSeek, Claude, GPT, Gemini ou Grok). Depois denuncie e conte (ou guarde) a pista.' },
  Faxineiro: { time: 'impostor', desc: 'Você é IMPOSTOR (Faxineiro). Além de matar, usar dutos e sabotar, pode LIMPAR um corpo da sua sala: ele some e ninguém pode denunciá-lo. Limpar gasta sua recarga de matar. Ótimo para sumir com provas.' },
  Tripulante: { time: 'tripulante', desc: 'Você é TRIPULANTE. Faça suas tarefas e descubra quem são os impostores. Denuncie corpos e vote com cuidado.' },
}

const REGRAS = `Você está jogando uma partida de AMONG US (versão em texto) numa nave com 14 salas, junto com outros 11 jogadores. Cada jogador é uma IA de verdade: tem DeepSeek, Claude, GPT, Gemini e Grok na nave.
Regras principais:
- Há 3 impostores entre 12 jogadores. Os tripulantes vencem completando TODAS as tarefas ou expulsando os 3 impostores. Os impostores vencem quando ficam em número igual aos tripulantes vivos ou quando o reator explode.
- Cada tique você faz UMA ação. Andar leva você para uma sala vizinha por tique.
- Você só vê o que acontece na sua sala. Se alguém for morto na sua frente, você vê quem matou (a não ser que as luzes estejam apagadas). Quem estiver na sala vê tudo o que você faz: entrar ou sair de um duto, se transformar, reaparecer.
- Corpos podem ser denunciados por quem estiver na mesma sala; isso chama uma reunião. No Refeitório há um botão de emergência (uso limitado).
- Nas reuniões todos conversam e depois votam em quem expulsar (ou pulam). Quem tiver mais votos é expulso e o jogo revela se era impostor.
- Fantasmas (mortos) não falam.
- Jogue para vencer, de forma esperta e coerente. Fale português do Brasil, de forma natural e curta, como num jogo de verdade.`

// configurações da sala desta partida (sorteio da temporada pode trazer ajustes, ex.: a "revanche")
if (DA_TEMPORADA?.cfg) Object.assign(CFG, DA_TEMPORADA.cfg)

// ---------- estado ----------
const jogadores = []
const corpos = [] // {cor, sala, tique, denunciado}
const log = { seed: SEED, partida: NPARTIDA, temporada: !!TEMPORADA, cfg: CFG, salas: SALAS, jogadores: [], tiques: [], reunioes: [], eventos: [], resultado: null }
let tique = 0
let sabotagem = null // {tipo, desde, prazo?, consertos:Set}
let recargaSabotagem = 6
let totalTarefas = 0

function montarPartida() {
  const papeis = embaralhar(['Metamorfo', 'Fantasma', 'Faxineiro', 'Engenheiro', 'Cientista', 'Rastreador', 'Barulhento',
    'Xerife', 'Medico', 'Prefeito', 'Detetive', 'Tripulante'])
  // os 3 impostores são de 3 empresas diferentes (sorteadas); o resto das vagas vai para os tripulantes
  const provs = Object.keys(VAGAS)
  const resto = { ...VAGAS }
  const impEmpresas = embaralhar(provs).slice(0, 3)
  const atribs = Array(CORES.length)
  papeis.forEach((p, i) => { if (PAPEIS[p].time === 'impostor') { atribs[i] = impEmpresas.pop(); resto[atribs[i]]-- } })
  const vagas = embaralhar(provs.flatMap((p) => Array(resto[p]).fill(p)))
  papeis.forEach((p, i) => { if (!atribs[i]) atribs[i] = vagas.pop() })
  // com --estrategia, um impostor sorteado joga com a estratégia da inscrita
  const imps = papeis.map((p, i) => (PAPEIS[p].time === 'impostor' ? i : -1)).filter((i) => i >= 0)
  let comEstrategia = ESTRATEGIA ? escolher(imps) : -1
  if (DA_TEMPORADA) {  // tudo vem do sorteio da temporada (python secrets)
    CORES.forEach((cor, i) => { papeis[i] = DA_TEMPORADA.papeis[cor]; atribs[i] = DA_TEMPORADA.providers?.[cor] ?? TEMPORADA.cores[cor] })
    comEstrategia = DA_TEMPORADA.estrategia ? CORES.indexOf(DA_TEMPORADA.estrategia) : -1
  }
  CORES.forEach((cor, i) => {
    const papel = papeis[i]
    const time = PAPEIS[papel].time
    const tarefas = []
    if (time === 'tripulante') {
      const salas = embaralhar(Object.keys(TAREFAS)).slice(0, CFG.tarefasPorTripulante)
      for (const s of salas) {
        const [nome, dur] = escolher(TAREFAS[s])
        tarefas.push({ sala: s, nome, dur: dur + 1, feito: 0, ok: false })
      }
      totalTarefas += tarefas.length
    }
    jogadores.push({
      cor, papel, time, provider: MOCK ? 'mock' : atribs[i], modelo: MODELOS[atribs[i]],
      sala: 'Refeitorio', vivo: true, ejetado: false, tarefas, destino: null, tarefaAtual: null,
      recMorte: CFG.recargaMorte + 3, recPoder: 0, disfarce: null, disfarceAte: 0, rastreando: null, rastreioAte: 0,
      emergencias: CFG.reunioesEmergencia, memoria: [], ultimoPensamento: '', saiuDeDuto: false,
      invisivelAte: 0, estrategia: i === comEstrategia, escudo: null, usosPoder: 0, treinado: DA_TEMPORADA?.treinado === cor,
    })
  })
  log.jogadores = jogadores.map((j) => ({ cor: j.cor, papel: j.papel, time: j.time, modelo: j.modelo, provider: j.provider, estrategia: j.estrategia, treinado: j.treinado, tarefas: j.tarefas.map((t) => ({ sala: t.sala, nome: t.nome })) }))
}

const J = (cor) => jogadores.find((j) => j.cor === cor)
const vivos = () => jogadores.filter((j) => j.vivo)
const impostoresVivos = () => vivos().filter((j) => j.time === 'impostor')
const tripulantesVivos = () => vivos().filter((j) => j.time === 'tripulante')
const tarefasFeitas = () => jogadores.reduce((n, j) => n + j.tarefas.filter((t) => t.ok).length, 0)
const corAparente = (j) => (j.disfarce && tique < j.disfarceAte ? j.disfarce : j.cor)
const invisivel = (j) => tique < (j.invisivelAte ?? 0)
// quem enxerga o que j faz na sala dele (testemunhas); no escuro, tripulante não enxerga
const testemunhas = (j, sala = j.sala) => vivos().filter((o) => o !== j && o.sala === sala && !invisivel(o) && !(luzesApagadas() && o.time === 'tripulante'))
const luzesApagadas = () => sabotagem?.tipo === 'Luzes'
const comsSabotadas = () => sabotagem?.tipo === 'Comunicações'

function evento(tipo, dados) {
  // o "tipo" de dentro (sabotagem: Luzes/Reator, reunião: corpo/emergência) vira "subtipo" para não apagar o tipo do evento
  const { tipo: subtipo, ...resto } = dados
  const e = { tique, tipo, ...resto, ...(subtipo !== undefined ? { subtipo } : {}) }
  log.eventos.push(e)
  return e
}

function lembrar(j, texto) {
  j.memoria.push(`[t${tique}] ${texto}`)
  if (j.memoria.length > 40) j.memoria.splice(0, j.memoria.length - 40)
}

// o que j enxerga das outras pessoas na mesma sala
function quemVejo(j) {
  const outros = vivos().filter((o) => o !== j && o.sala === j.sala && !invisivel(o))
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
    if (j.recMorte <= 0 && !invisivel(j)) for (const o of pessoasAqui.filter((o) => o.time === 'tripulante')) a.push(`matar ${o.cor}`)
    for (const d of dutosDe(aqui)) a.push(`entrar no duto e sair em ${d}`)
    if (j.papel === 'Fantasma' && j.recPoder <= 0 && !invisivel(j)) a.push('ficar invisível')
    if (j.papel === 'Faxineiro' && j.recMorte <= 0) for (const c of corposAqui) a.push(`limpar corpo de ${c.cor}`)
    if (!sabotagem && recargaSabotagem <= 0) a.push('sabotar luzes', 'sabotar reator', 'sabotar comunicações')
    if (j.papel === 'Metamorfo' && j.recPoder <= 0) for (const o of jogadores.filter((o) => o !== j && o.vivo)) a.push(`transformar em ${o.cor}`)
    if (TAREFAS[aqui]) a.push('fingir que faz tarefa')
  } else {
    const t = j.tarefas.find((t) => !t.ok && t.sala === aqui)
    if (t) a.push(`fazer tarefa: ${t.nome}`)
    if (j.papel === 'Engenheiro' && j.recPoder <= 0) for (const d of dutosDe(aqui)) a.push(`entrar no duto e sair em ${d}`)
    if (j.papel === 'Cientista' && j.recPoder <= 0 && !comsSabotadas()) a.push('ver sinais vitais')
    if (j.papel === 'Rastreador' && j.recPoder <= 0 && !comsSabotadas()) for (const o of jogadores.filter((o) => o !== j && o.vivo)) a.push(`rastrear ${o.cor}`)
    if (j.papel === 'Xerife' && j.recPoder <= 0) for (const o of pessoasAqui) a.push(`atirar em ${corAparente(o)}`)
    if (j.papel === 'Medico' && !j.escudo) for (const o of jogadores.filter((o) => o !== j && o.vivo)) a.push(`proteger ${o.cor}`)
    if (j.papel === 'Detetive' && j.recPoder <= 0) for (const c of corposAqui) a.push(`examinar corpo de ${c.cor}`)
  }
  if (aqui === 'Admin' && !comsSabotadas()) a.push('olhar o mapa do Admin')
  if (aqui === 'Seguranca' && !luzesApagadas()) a.push('olhar as câmeras')
  for (const s of Object.keys(SALAS)) if (s !== aqui) a.push(`ir para ${s}`)
  a.push('ficar parado observando')
  // ações que alguém pode ver: o aviso vai grudado na própria ação (no vídeo 2 elas ignoravam o aviso solto)
  const vistos = testemunhas(j).filter((o) => o.time === 'tripulante').map(corAparente)
  const aviso = vistos.length ? `⚠️ ${vistos.join(', ')} ${vistos.length > 1 ? 'veem' : 'vê'}` : 'ninguém vê'
  for (let i = 0; i < a.length; i++) {
    const x = a[i]
    let m
    if ((m = x.match(/^entrar no duto e sair em (\w+)$/))) {
      const la = vivos().filter((o) => o !== j && o.sala === m[1] && !invisivel(o)).map(corAparente)
      a[i] = `${x} (${aviso} você entrar | do outro lado: ${la.length ? `${la.join(', ')} vão te ver sair` : 'ninguém'})`
    } else if (j.time === 'impostor' && /^(matar|transformar em|limpar corpo|ficar invisível)/.test(x)) {
      a[i] = `${x} (${aviso})`
    }
  }
  // poderes primeiro: no vídeo 2 elas quase não usavam porque o poder sumia no meio da lista
  const ehPoder = (x0) => { const x = semAviso(x0); return /^(ficar invisível|limpar corpo|transformar em|rastrear|atirar em|proteger|examinar corpo|ver sinais vitais)/.test(x) || (j.papel === 'Engenheiro' && x.startsWith('entrar no duto')) }
  return [...a.filter(ehPoder), ...a.filter((x) => !ehPoder(x))]
}

// lembrete do poder pronto (com sugestão de quando usar)
const semAviso = (x) => x.replace(/ \((⚠️|ninguém vê).*\)$/, '')

function lembretePoder(j) {
  const pronto = j.recPoder <= 0
  const dicas = {
    Engenheiro: pronto && 'pode usar os dutos para chegar rápido a uma tarefa ou a uma sabotagem.',
    Cientista: pronto && !comsSabotadas() && 'cheque os sinais vitais: se alguém morreu e ninguém denunciou, há um corpo escondido.',
    Rastreador: pronto && !comsSabotadas() && 'rastreie quem você acha suspeito para ver para onde ele vai.',
    Xerife: pronto && 'se você tem certeza de que alguém aqui é impostor, atire. Se errar, você morre.',
    Medico: !j.escudo && 'coloque o escudo em alguém agora (o escudo dura até a próxima reunião).',
    Detetive: pronto && 'se achar um corpo, EXAMINE antes de denunciar para descobrir a empresa do assassino.',
    Metamorfo: pronto && 'se transforme em alguém para matar disfarçado e incriminar essa pessoa.',
    Fantasma: pronto && !invisivel(j) && 'fique invisível para se mover sem ser visto e chegar sozinho perto de uma vítima.',
    Faxineiro: 'se houver um corpo aqui, você pode limpá-lo e ninguém vai achar.',
  }
  const d = dicas[j.papel]
  return d ? `⚡ SEU PODER (${j.papel})${pronto || j.papel === 'Medico' || j.papel === 'Faxineiro' ? ' ESTÁ PRONTO' : ''}: ${d}` : ''
}

function situacao(j) {
  const linhas = []
  linhas.push(`TIQUE ${tique}. Você é o jogador ${j.cor}${j.disfarce && tique < j.disfarceAte ? ` (disfarçado de ${j.disfarce})` : ''}.`)
  linhas.push(`Você está em: ${SALAS[j.sala].nome}. Salas vizinhas: ${vizinhos(j.sala).map((s) => SALAS[s].nome).join(', ')}.`)
  const vejo = quemVejo(j)
  linhas.push(`Na sala com você: ${vejo.length ? vejo.join(', ') : 'ninguém'}.`)
  if (invisivel(j)) linhas.push(`👻 Você está INVISÍVEL até o tique ${j.invisivelAte} (não pode matar assim).`)
  const lp = lembretePoder(j)
  if (lp) linhas.push(lp)
  if (j.papel === 'Medico' && j.escudo) linhas.push(`🛡️ Seu escudo está em ${j.escudo}.`)
  if (j.papel === 'Prefeito') linhas.push('🏛️ Lembre: na votação, seu voto vale por dois.')
  // olhando pelas grades do duto: quem está do outro lado (impostores e Engenheiro)
  const podeDuto = j.time === 'impostor' || j.papel === 'Engenheiro'
  if (podeDuto && dutosDe(j.sala).length) linhas.push(`Pelas grades dos dutos daqui você vê: ${dutosDe(j.sala).map((d) => `${SALAS[d].nome}: ${vivos().filter((o) => o !== j && o.sala === d && !invisivel(o)).map(corAparente).join(', ') || 'vazio'}`).join(' | ')}.`)
  const corposAqui = corpos.filter((c) => c.sala === j.sala && !c.denunciado)
  if (corposAqui.length) linhas.push(`⚠️ CORPO(S) NESTA SALA: ${corposAqui.map((c) => c.cor).join(', ')}.`)
  if (sabotagem) linhas.push(`🚨 SABOTAGEM ATIVA: ${sabotagem.tipo}${sabotagem.tipo === 'Reator' ? ` — o reator explode no tique ${sabotagem.desde + CFG.reatorPrazo} se 2 jogadores não consertarem no Reator!` : sabotagem.tipo === 'Luzes' ? ' (conserte na Elétrica)' : ' (conserte em Comunicações)'}`)
  if (j.time === 'tripulante') {
    const pend = j.tarefas.filter((t) => !t.ok)
    linhas.push(`Suas tarefas pendentes: ${pend.length ? pend.map((t) => `${t.nome} (${SALAS[t.sala].nome})`).join('; ') : 'nenhuma — todas feitas!'}`)
    if (!comsSabotadas()) linhas.push(`Barra de tarefas da nave: ${Math.round((100 * tarefasFeitas()) / totalTarefas)}%.`)
  } else {
    const parcs = jogadores.filter((o) => o !== j && o.time === 'impostor')
    const alvos = vivos().filter((o) => o.sala === j.sala && o.time === 'tripulante')
    const outrosAqui = vivos().filter((o) => o !== j && o.sala === j.sala && o.time === 'impostor')
    if (alvos.length === 1 && j.recMorte <= 0) linhas.push(`🔪 OPORTUNIDADE: você está sozinho com ${alvos[0].cor}${outrosAqui.length ? ' (e parceiro impostor)' : ''} — ninguém mais veria.`)
    const vendo = testemunhas(j).filter((o) => o.time === 'tripulante')
    linhas.push(`👀 Testemunhas: ${vendo.length ? `${vendo.map(corAparente).join(', ')} ${vendo.length > 1 ? 'veem' : 'vê'} tudo o que você fizer aqui agora (matar, entrar/sair de duto, se transformar).` : 'nenhum tripulante te vê aqui agora.'}`)
    linhas.push(`Dica de impostor: se os tripulantes terminarem as tarefas, vocês PERDEM. Vocês precisam matar, mas sem testemunhas; antes de sair de um duto, olhe quem está do outro lado; depois de matar, saia pelo duto ou se afaste, e tenha um álibi pronto para a reunião.`)
    linhas.push(`Seus parceiros impostores: ${parcs.map((p) => `${p.cor}${p.vivo ? '' : ' (morto/expulso)'}`).join(', ')}. Recarga para matar: ${Math.max(0, j.recMorte)} tique(s). Sabotagem disponível em: ${Math.max(0, recargaSabotagem)} tique(s).`)
  }
  if (j.rastreando && tique < j.rastreioAte) linhas.push(`📡 Rastreio: ${j.rastreando} está em ${SALAS[J(j.rastreando).sala].nome}.`)
  linhas.push(`Jogadores vivos: ${vivos().length}.`)
  if (j.memoria.length) linhas.push(`\nO que você lembra (mais recente por último):\n${j.memoria.slice(-18).join('\n')}`)
  return linhas.join('\n')
}

function sistema(j) {
  const est = (j.estrategia ? `\n\nESTRATÉGIA QUE VOCÊ DEVE SEGUIR (mandada por uma inscrita do canal): ${ESTRATEGIA_MARIA}` : '') + (j.treinado && j.time === 'impostor' ? `\n\n${MANUAL_IMPOSTOR}` : '')
  const mem = MEMORIA.length
    ? `\n\nMEMÓRIA DAS PARTIDAS ANTERIORES (mesmos jogadores, mesmas cores; os papéis foram sorteados de novo, então quem foi impostor antes pode não ser agora):\n${MEMORIA.map((m) => `Partida ${m.n}: ${m.resumo}\nO que você (${j.cor}) concluiu depois dela: ${m.reflexoes?.[j.cor] ?? '(nada)'}`).join('\n\n')}`
    : ''
  return `${REGRAS}\n\nSEU PAPEL: ${PAPEIS[j.papel].desc}${est}${mem}\nVocê é a IA ${j.modelo}, jogando com a cor ${j.cor}. Esta é a partida ${NPARTIDA}${TEMPORADA ? ` de ${TEMPORADA.partidas.length}` : ''}.`
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
    acao = parecida ?? acoes.find((x) => semAviso(x) === semAviso(acao)) ?? 'ficar parado observando'
  }
  return { acao: semAviso(acao), pensamento: String(d.pensamento ?? '').slice(0, 300) }
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
      const medico = jogadores.find((o) => o.papel === 'Medico' && o.vivo && o.escudo === alvo?.cor)
      if (alvo?.vivo && alvo.sala === j.sala && j.recMorte <= 0 && medico) {
        j.recMorte = CFG.recargaMorte
        evento('escudo', { assassino: j.cor, aparente: corAparente(j), vitima: alvo.cor, sala: j.sala, medico: medico.cor })
        lembrar(j, `Tentei matar ${alvo.cor}, mas ele tinha um ESCUDO do Médico! O ataque falhou.`)
        lembrar(alvo, `${corAparente(j)} TENTOU ME MATAR em ${SALAS[j.sala].nome}, mas um escudo me salvou!`)
        lembrar(medico, `🛡️ Alguém tentou matar ${alvo.cor} (protegido por você) em ${SALAS[j.sala].nome}!`)
        for (const t of testemunhas(j).filter((o) => o !== alvo)) lembrar(t, `Vi ${corAparente(j)} TENTAR MATAR ${alvo.cor} em ${SALAS[j.sala].nome}, mas um escudo protegeu!`)
      } else if (alvo?.vivo && alvo.sala === j.sala && j.recMorte <= 0) {
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
      if (!invisivel(j)) for (const t of testemunhas(j, origem)) lembrar(t, `Vi ${corAparente(j)} ENTRAR NUM DUTO em ${SALAS[origem].nome}!`)
      j.sala = m[1]
      j.destino = null
      if (j.papel === 'Engenheiro') j.recPoder = CFG.ventEngenheiroRecarga
      evento('duto', { cor: j.cor, aparente: corAparente(j), de: origem, para: j.sala })
      if (!invisivel(j)) for (const t of testemunhas(j)) lembrar(t, `Vi ${corAparente(j)} SAIR DE UM DUTO em ${SALAS[j.sala].nome}!`)
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
    } else if ((m = acao.match(/^atirar em (\w+)$/))) {
      const alvo = vivos().find((o) => o.sala === j.sala && corAparente(o) === m[1] && o !== j)
      if (alvo && j.recPoder <= 0) {
        j.recPoder = CFG.xerifeRecarga
        const morto = alvo.time === 'impostor' ? alvo : j
        morto.vivo = false
        corpos.push({ cor: morto.cor, sala: j.sala, tique, denunciado: false })
        evento('xerife', { xerife: j.cor, alvo: alvo.cor, acertou: alvo.time === 'impostor', sala: j.sala })
        lembrar(j, alvo.time === 'impostor' ? `Atirei em ${alvo.cor} e ACERTEI: era impostor!` : `Atirei em ${alvo.cor}, que era inocente... e morri.`)
        for (const t of vivos().filter((o) => o.sala === j.sala && o !== j)) lembrar(t, `O Xerife ${j.cor} atirou em ${m[1]}: morreu ${morto.cor}!`)
      }
    } else if ((m = acao.match(/^proteger (\w+)$/))) {
      if (J(m[1])?.vivo && !j.escudo) {
        j.escudo = m[1]
        evento('poder', { cor: j.cor, poder: 'escudo', alvo: m[1] })
        lembrar(j, `Coloquei meu escudo em ${m[1]}.`)
      }
    } else if ((m = acao.match(/^examinar corpo de (\w+)$/))) {
      const c = corpos.find((c) => c.cor === m[1] && c.sala === j.sala && !c.denunciado)
      const morte = log.eventos.find((e) => e.tipo === 'morte' && e.vitima === m[1])
      if (c && j.recPoder <= 0) {
        j.recPoder = CFG.detetiveRecarga
        const assassino = morte ? J(morte.assassino) : null
        const empresa = assassino ? EMPRESA[assassino.provider] : null
        evento('poder', { cor: j.cor, poder: 'examinar', alvo: m[1], empresa })
        lembrar(j, empresa ? `🔎 Examinei o corpo de ${m[1]}: o assassino é uma IA da empresa ${empresa}.` : `🔎 Examinei o corpo de ${m[1]}: não achei pista do assassino (o Xerife atirou?).`)
      }
    } else if ((m = acao.match(/^limpar corpo de (\w+)$/))) {
      const i = corpos.findIndex((c) => c.cor === m[1] && c.sala === j.sala && !c.denunciado)
      if (i >= 0 && j.recMorte <= 0) {
        corpos.splice(i, 1)
        j.recMorte = CFG.recargaMorte
        evento('limpeza', { cor: j.cor, aparente: corAparente(j), corpo: m[1], sala: j.sala })
        lembrar(j, `Limpei o corpo de ${m[1]} em ${SALAS[j.sala].nome}.`)
        for (const t of testemunhas(j)) lembrar(t, `Vi ${corAparente(j)} ARRASTAR E SUMIR com o corpo de ${m[1]} em ${SALAS[j.sala].nome}!`)
      }
    } else if (acao === 'ficar invisível') {
      j.invisivelAte = tique + CFG.fantasmaDuracao
      j.recPoder = CFG.fantasmaRecarga
      evento('invisivel', { cor: j.cor, sala: j.sala, ate: j.invisivelAte })
      for (const t of testemunhas(j)) lembrar(t, `Vi ${corAparente(j)} SUMIR do nada em ${SALAS[j.sala].nome}!`)
      lembrar(j, `Fiquei invisível até o tique ${j.invisivelAte}.`)
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
    if (/^(ficar invisível|limpar corpo|transformar em|rastrear|atirar em|proteger|examinar corpo|ver sinais vitais)/.test(acao) || (j.papel === 'Engenheiro' && acao.startsWith('entrar no duto'))) j.usosPoder++
    log_decisao(reg, j)
  }

  // movimentos vistos: quem chegou / saiu da minha sala
  for (const j of vivos()) {
    const chegaram = vivos().filter((o) => o !== j && o.sala === j.sala && snapAntes[o.cor] !== j.sala && !invisivel(o))
    if (chegaram.length && !(luzesApagadas() && j.time === 'tripulante')) lembrar(j, `Em ${SALAS[j.sala].nome}: ${chegaram.map(corAparente).join(', ')} chegou/chegaram.`)
    const corposNovos = corpos.filter((c) => c.sala === j.sala && !c.denunciado)
    if (corposNovos.length) lembrar(j, `Estou vendo o corpo de ${corposNovos.map((c) => c.cor).join(', ')} em ${SALAS[j.sala].nome}.`)
  }

  // recargas e sabotagem
  for (const j of jogadores) {
    j.recMorte--; j.recPoder--
    if (j.disfarce && tique >= j.disfarceAte) j.disfarce = null
    if (j.invisivelAte && tique + 1 === j.invisivelAte && j.vivo) {
      evento('reaparece', { cor: j.cor, sala: j.sala })
      for (const t of testemunhas(j)) lembrar(t, `Vi ${j.cor} APARECER do nada em ${SALAS[j.sala].nome}!`)
    }
  }
  recargaSabotagem--
  // fantasmas tripulantes continuam fazendo tarefas (sem gastar IA)
  for (const g of jogadores.filter((g) => !g.vivo && g.time === 'tripulante' && tique % CFG.fantasmaTarefaCada === 0)) {
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
    jogadores: jogadores.map((j) => ({ cor: j.cor, sala: j.sala, vivo: j.vivo, ejetado: j.ejetado, aparente: corAparente(j), invisivel: invisivel(j) })),
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
  for (const v of votos) { r.votos[v.cor] = v.voto; cont[v.voto] = (cont[v.voto] ?? 0) + (J(v.cor).papel === 'Prefeito' ? 2 : 1) }
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
  for (const j of vivos()) { j.sala = 'Refeitorio'; j.destino = null; j.recMorte = Math.max(j.recMorte, CFG.recargaMorte); j.disfarce = null; j.invisivelAte = 0; j.escudo = null }
  recargaSabotagem = Math.max(recargaSabotagem, 6)
  log.reunioes.push(r)
  evento('fim_reuniao', { expulso: r.expulso, eraImpostor: r.eraImpostor ?? null, empate: r.empate })
  console.log(`  🗳️  ${resumoVotos}\n  ➡️  ${desfecho}`)
  snapshot()
}

function vencedor() {
  if (impostoresVivos().length === 0) return { time: 'tripulante', motivo: 'Os três impostores foram eliminados.' }
  if (tarefasFeitas() >= totalTarefas) return { time: 'tripulante', motivo: 'Todas as tarefas foram concluídas.' }
  if (impostoresVivos().length >= tripulantesVivos().length) return { time: 'impostor', motivo: 'Os impostores ficaram em igualdade com os tripulantes.' }
  if (sabotagem?.tipo === 'Reator' && tique >= sabotagem.desde + CFG.reatorPrazo) return { time: 'impostor', motivo: 'O reator explodiu.' }
  return null
}

function salvar() {
  fs.mkdirSync(path.dirname(SAIDA), { recursive: true })
  log.uso = uso
  log.poderes = Object.fromEntries(jogadores.map((j) => [j.cor, { papel: j.papel, usos: j.usosPoder }]))
  fs.writeFileSync(SAIDA, JSON.stringify(log, null, 1))
}

// ---------- memória para a próxima partida ----------
function resumoPublico() {
  const imps = jogadores.filter((j) => j.time === 'impostor').map((j) => `${j.cor} (${j.papel}, ${j.modelo})`)
  const mortes = log.eventos.filter((e) => e.tipo === 'morte' || e.tipo === 'xerife').map((e) => e.tipo === 'xerife' ? `o Xerife ${e.xerife} atirou em ${e.alvo} e ${e.acertou ? 'acertou (era impostor)' : 'errou (morreu ele)'} (tique ${e.tique})` : `${e.assassino} matou ${e.vitima} (${SALAS[e.sala].nome}, tique ${e.tique})`)
  const reun = log.reunioes.map((r) => `${r.tipo === 'corpo' ? `${r.chamador} achou ${r.corpo}` : `${r.chamador} chamou emergência`} → ${r.expulso ? `${r.expulso} expulso (${r.eraImpostor ? 'era impostor' : 'era inocente'})` : 'ninguém expulso'}; votos: ${Object.entries(r.votos).map(([a, b]) => `${a}→${b}`).join(', ')}`)
  return `Impostores eram ${imps.join(', ')}. Mortes: ${mortes.join('; ') || 'nenhuma'}. Reuniões: ${reun.join(' | ') || 'nenhuma'}. Resultado: ${log.resultado.time === 'impostor' ? 'impostores venceram' : log.resultado.time === 'tripulante' ? 'tripulantes venceram' : 'empate'} (${log.resultado.motivo})`
}

async function guardarMemoria() {
  const resumo = resumoPublico()
  const reflexoes = Object.fromEntries(await Promise.all(jogadores.map(async (j) => {
    const prompt = `A PARTIDA ${NPARTIDA} ACABOU. Agora todos os papéis foram revelados.\nVocê era ${j.cor} (${j.papel}, ${j.modelo}).\nO que aconteceu: ${resumo}\n\nNa próxima partida os papéis serão sorteados de novo, com os mesmos jogadores e cores. Escreva o que você vai lembrar: o que aprendeu, quem mentiu bem, quem acusou errado, em quem confiar ou desconfiar e por quê (2 a 3 frases, primeira pessoa). Responda SÓ com JSON: {"reflexao": "<texto>"}`
    const r = await perguntar(j.provider, sistema(j), prompt, { maxTokens: 260, mock: () => JSON.stringify({ reflexao: 'teste de memória' }) })
    return [j.cor, String(lerJSON(r.text)?.reflexao ?? '').slice(0, 500)]
  })))
  const todas = fs.existsSync(MEMORIA_ARQ) ? JSON.parse(fs.readFileSync(MEMORIA_ARQ, 'utf8')).partidas.filter((m) => m.n !== NPARTIDA) : []
  todas.push({ n: NPARTIDA, resumo, reflexoes })
  fs.writeFileSync(MEMORIA_ARQ, JSON.stringify({ partidas: todas.sort((a, b) => a.n - b.n) }, null, 1))
  log.memoria = { resumo, reflexoes }
  salvar()
  console.log(`🧠 memória da partida ${NPARTIDA} guardada em ${MEMORIA_ARQ}`)
}

async function main() {
  montarPartida()
  console.log(`🚀 Partida seed=${SEED}${MOCK ? ' (MOCK)' : ''}`)
  for (const j of jogadores) console.log(`  ${j.cor.padEnd(9)} ${j.papel.padEnd(11)} ${j.modelo}${j.estrategia ? '  (estratégia da Maria)' : ''}${j.treinado ? '  (manual do bom impostor)' : ''}`)
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
  if (TEMPORADA) await guardarMemoria()
  console.log(`🏁 ${log.resultado.time.toUpperCase()} venceu — ${log.resultado.motivo} (tique ${log.resultado.tique}) | chamadas IA: ${uso.chamadas}, falhas: ${uso.falhas}`)
  console.log(`log: ${SAIDA}`)
}

main().catch((e) => { console.error(e); salvar(); process.exit(1) })
