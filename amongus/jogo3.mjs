// Among Us 3: 15 IAs de 6 empresas (DeepSeek, Claude Haiku, GPT, Gemini, Mistral e GLM; o sorteio decide quais têm 3 e quais têm 2) e 3 impostores.
// Mesmo motor por tiques do Among Us 2 (jogo2.mjs), com o que os comentários do vídeo 2 pediram
// (video/youtube/ideias_au3.md):
//  - todo mundo sabe quais funções existem na partida (o Detetive não é mais chamado de mentiroso);
//  - os poderes viram ações diretas e combinadas ("matar disfarçado de X", "matar e esconder o corpo", "ficar invisível
//    e ir para..."), com lembrete forte quando a IA passa tempo sem usar o poder;
//  - funções novas: Palhaço (neutro, ganha se for expulso), Influencer (posta foto da sala pra todo mundo), Juiz (anula
//    uma votação), Segurança (câmeras de qualquer lugar), Envenenador e Gangster (impostores). Detetive mais fraco
//    (descobre 3 suspeitos, não a empresa);
//  - sabotagens novas: O2 (conserta em O2 e em Admin) e portas trancadas; dá pra denunciar corpo durante sabotagem;
//  - chat secreto dos impostores; tarefas visuais (quem faz o scan, o lixo, os escudos ou os asteroides na frente de
//    alguém prova que é tripulante); botão de emergência limitado (1 por jogador);
//  - campo de visão DENTRO da sala: cada jogador fica num ponto da sala (pontos3.json, exportado do desenho da nave) e
//    só vê quem está a até VISAO px (no escuro, bem menos);
//  - na reunião, cada um recebe o que viu na sala do corpo nos tiques anteriores; no fim, todos os papéis são revelados.
//
// Temporada: python3 sorteio3.py sorteia (de verdade) cores, papéis e sementes; o motor só lê.
// Uso: node jogo3.mjs --temporada logs3/temporada.json --partida 1 [--mock] [--max-tiques 70]
import fs from 'node:fs'
import path from 'node:path'
import { SALAS, BOTAO_EMERGENCIA, TAREFAS, vizinhos, dutosDe, caminho } from './mapa.mjs'
import { perguntar, lerJSON, uso } from './ia.mjs'

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : null)).filter(Boolean),
)
const MOCK = !!args.mock
const MAX_TIQUES = Number(args['max-tiques'] ?? 70)
const TEMPORADA = args.temporada ? JSON.parse(fs.readFileSync(args.temporada, 'utf8')) : null
const NPARTIDA = Number(args.partida ?? 1)
const DA_TEMPORADA = TEMPORADA ? TEMPORADA.partidas[NPARTIDA - 1] : null
const SAIDA = args.saida ?? (args.temporada ? path.join(path.dirname(args.temporada), `partida${NPARTIDA}${MOCK ? '_mock' : ''}.json`) : `logs3/partida_${Date.now()}.json`)
const MEMORIA_ARQ = args.memoria ?? path.join(path.dirname(args.temporada ?? 'logs3/x'), `memoria${MOCK ? '_mock' : ''}.json`)
const MEMORIA = TEMPORADA && fs.existsSync(MEMORIA_ARQ) ? JSON.parse(fs.readFileSync(MEMORIA_ARQ, 'utf8')).partidas.filter((m) => m.n < NPARTIDA) : []
const PONTOS = JSON.parse(fs.readFileSync(new URL('./pontos3.json', import.meta.url), 'utf8')).salas

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
export const CORES = ['Vermelho', 'Azul', 'Verde', 'Rosa', 'Laranja', 'Amarelo', 'Preto', 'Branco', 'Roxo', 'Marrom', 'Ciano', 'Lima', 'Cinza', 'Coral', 'Bordo']
const MODELOS = {
  deepseek: 'DeepSeek Flash', haiku: 'Claude Haiku', 'or:openai/gpt-5.6-luna': 'GPT-5.6 Luna', 'or:google/gemini-3.8-flash': 'Gemini 3.8 Flash', 'or:x-ai/grok-4.3': 'Grok 4.3', 'or:mistralai/mistral-large-4-0': 'Mistral Large 4', 'or:z-ai/glm-5.3-flash': 'GLM 5.3 Flash', 'or:deepseek/deepseek-v4.1-flash': 'DeepSeek Flash', mock: 'Mock',
}
const CFG = {
  recargaMorte: 5, // tiques entre mortes
  recargaSabotagem: 10,
  recargaPortas: 8,
  portasDuracao: 3,
  tarefasPorTripulante: 5,
  reatorPrazo: 10,
  o2Prazo: 10,
  metamorfoDuracao: 6,
  metamorfoRecarga: 10,
  ventEngenheiroRecarga: 4,
  vitaisRecarga: 5,
  rastreioDuracao: 6,
  rastreioRecarga: 8,
  rodadasDiscussao: 2,
  xerifeRecarga: 6,
  detetiveRecarga: 3,
  fantasmaDuracao: 4,
  fantasmaRecarga: 10,
  venenoAtraso: 3, // tiques até o envenenado cair
  segurancaRecarga: 4,
  fotosInfluencer: 2,
  reunioesEmergencia: 1,
  semPoderAviso: 6, // tiques com o poder pronto e sem usar → lembrete forte
  VISAO: 640, // px: até onde um jogador enxerga dentro da sala
  VISAO_ESCURO: 190, // px: tripulante com as luzes apagadas
  fantasmaTarefaCada: 1,
}
if (DA_TEMPORADA?.cfg) Object.assign(CFG, DA_TEMPORADA.cfg)

// Funções: as 3 de impostor saem destas 5; o Palhaço e as 11 de tripulante entram sempre.
export const IMPOSTORES = ['Metamorfo', 'Fantasma', 'Faxineiro', 'Envenenador', 'Gangster']
export const TRIPULANTES = ['Engenheiro', 'Cientista', 'Rastreador', 'Barulhento', 'Xerife', 'Medico', 'Prefeito', 'Detetive', 'Influencer', 'Juiz', 'Seguranca']
const PAPEIS = {
  Metamorfo: { time: 'impostor', curta: 'impostor que se TRANSFORMA em outro jogador por alguns tiques (quem vê enxerga a cor do disfarce)', desc: 'Você é IMPOSTOR (Metamorfo). Seu PODER: se TRANSFORMAR em outro jogador por alguns tiques; quem te vê enxerga a cor do disfarce. A jogada mais forte é "matar X disfarçado de Y": as testemunhas vão jurar que foi o Y. Use o poder: impostor que não usa o poder perde.' },
  Fantasma: { time: 'impostor', curta: 'impostor que fica INVISÍVEL por alguns tiques (não mata invisível)', desc: 'Você é IMPOSTOR (Fantasma). Seu PODER: ficar INVISÍVEL por alguns tiques (ninguém te vê andando, entrando em duto ou chegando). Você não pode matar invisível: use a invisibilidade para chegar perto de uma vítima sozinha, ou para fugir depois de matar. Use o poder: impostor que não usa o poder perde.' },
  Faxineiro: { time: 'impostor', curta: 'impostor que SOME com corpos (ninguém consegue denunciar)', desc: 'Você é IMPOSTOR (Faxineiro). Seu PODER: sumir com corpos. A jogada mais forte é "matar X e esconder o corpo": o corpo some na hora e ninguém pode denunciar. Também pode limpar um corpo que já está na sala. Use o poder: impostor que não usa o poder perde.' },
  Envenenador: { time: 'impostor', curta: 'impostor que ENVENENA: a vítima só cai alguns tiques depois, longe dele', desc: `Você é IMPOSTOR (Envenenador). Você não esfaqueia: você ENVENENA. "envenenar X" é só um esbarrão (quem vê acha que foi sem querer) e X cai morto ${CFG.venenoAtraso} tiques depois, onde estiver. Envenene e se afaste: quando o corpo aparecer, você estará longe, com álibi.` },
  Gangster: { time: 'impostor', curta: 'impostor que pode RECRUTAR um tripulante para o time dos impostores (1 vez)', desc: 'Você é IMPOSTOR (Gangster). Além de matar, usar dutos e sabotar, você pode RECRUTAR um tripulante uma vez na partida: com vocês dois sozinhos, "recrutar X" faz X virar impostor e jogar do seu lado. Escolha alguém que os outros confiem. Não dá para recrutar o Xerife nem o Palhaço.' },
  Recrutado: { time: 'impostor', curta: 'tripulante recrutado pelo Gangster', desc: 'Você FOI RECRUTADO pelo Gangster: agora você é IMPOSTOR. Pode matar, usar dutos e sabotar, e ganha junto com os impostores. Continue agindo como antes para ninguém perceber.' },
  Palhaco: { time: 'neutro', curta: 'NEUTRO: ganha sozinho se for EXPULSO na votação', desc: 'Você é o PALHAÇO (neutro). Você NÃO é tripulante nem impostor: você só vence se for EXPULSO numa votação. Pareça suspeito na medida certa (sem confessar, senão ninguém acredita): ande atrás de corpos, dê álibis estranhos, contradiga os outros. Não há tarefas de verdade para você; pode fingir que faz.' },
  Engenheiro: { time: 'tripulante', curta: 'tripulante que pode usar os DUTOS', desc: 'Você é TRIPULANTE (Engenheiro). Faça suas tarefas e descubra os impostores. Seu PODER: usar os DUTOS — mas quem te vir saindo de um duto pode achar que você é impostor.' },
  Cientista: { time: 'tripulante', curta: 'tripulante que vê os SINAIS VITAIS de qualquer lugar', desc: 'Você é TRIPULANTE (Cientista). Faça suas tarefas e descubra os impostores. Seu PODER: checar os SINAIS VITAIS de qualquer lugar (quem está vivo ou morto). Se alguém morreu e ninguém denunciou, tem corpo escondido ou veneno.' },
  Rastreador: { time: 'tripulante', curta: 'tripulante que RASTREIA um jogador (sabe a sala dele por alguns tiques)', desc: 'Você é TRIPULANTE (Rastreador). Faça suas tarefas e descubra os impostores. Seu PODER: RASTREAR um jogador e saber em que sala ele está por alguns tiques.' },
  Barulhento: { time: 'tripulante', curta: 'tripulante que, se morrer, dispara um ALERTA com a sala da morte', desc: 'Você é TRIPULANTE (Barulhento). Faça suas tarefas e descubra os impostores. Se você for morto, toda a nave recebe um alerta dizendo a sala onde você morreu.' },
  Xerife: { time: 'tripulante', curta: 'tripulante que ATIRA (se acertar um impostor, ele morre; se errar, morre o Xerife)', desc: 'Você é TRIPULANTE (Xerife). Faça tarefas e cace os impostores. Seu PODER: ATIRAR em alguém que você vê. Se for impostor, ele morre. Se for inocente (ou o Palhaço), quem morre é VOCÊ. Atire quando tiver certeza (viu matar, viu sair do duto, pegou na mentira).' },
  Medico: { time: 'tripulante', curta: 'tripulante que dá ESCUDO em alguém (até a próxima reunião)', desc: 'Você é TRIPULANTE (Médico). Faça tarefas. Seu PODER: colocar um ESCUDO em um jogador (de qualquer lugar). Se um impostor tentar matar quem tem escudo, o ataque falha e você fica sabendo. O escudo dura até a próxima reunião.' },
  Prefeito: { time: 'tripulante', curta: 'tripulante cujo VOTO VALE DOIS', desc: 'Você é TRIPULANTE (Prefeito). Faça tarefas e descubra os impostores. Seu PODER é passivo e secreto: na votação seu voto vale por DOIS.' },
  Detetive: { time: 'tripulante', curta: 'tripulante que EXAMINA um corpo e descobre 3 suspeitos (um deles é o assassino)', desc: 'Você é TRIPULANTE (Detetive). Faça tarefas. Seu PODER: EXAMINAR um corpo antes de denunciar e descobrir 3 SUSPEITOS: um deles é o assassino com certeza. Cruze com o que você e os outros viram.' },
  Influencer: { time: 'tripulante', curta: `tripulante que POSTA FOTO da sala para a nave inteira (${CFG.fotosInfluencer} vezes)`, desc: `Você é TRIPULANTE (Influencer). Faça tarefas. Seu PODER: "postar foto da sala" (${CFG.fotosInfluencer} vezes na partida): todo mundo recebe na hora uma foto de quem está perto de você e dos corpos da sala. Ninguém pode dizer que é mentira: é uma prova. Ótimo quando há um corpo, alguém saindo de duto ou um grupo suspeito.` },
  Juiz: { time: 'tripulante', curta: 'tripulante que pode ANULAR uma votação (1 vez)', desc: 'Você é TRIPULANTE (Juiz). Faça tarefas. Seu PODER (1 vez na partida): na hora de votar, ANULAR a votação: ninguém é expulso e a nave só fica sabendo que "o Juiz anulou". Use quando achar que vão expulsar um inocente.' },
  Seguranca: { time: 'tripulante', curta: 'tripulante que vê as CÂMERAS de qualquer lugar', desc: 'Você é TRIPULANTE (Segurança). Faça tarefas. Seu PODER: olhar as CÂMERAS de qualquer lugar da nave (Refeitório, Admin, Navegação, Motor Superior e Enfermaria).' },
}
// Tarefas como as do jogo (partidas com CFG.tarefasReais): as LONGAS têm etapas em salas diferentes (baixar os dados
// numa sala e enviar no Admin; encher o galão no Depósito e levar aos dois motores; desviar a energia na Elétrica e
// aceitar noutra sala; a amostra precisa de um tempo de espera antes da 2ª etapa); as CURTAS são uma sala só.
// Etapa: [salas possíveis (sorteia uma), tiques de trabalho, espera em tiques antes de poder fazer]
const TAREFAS3_LONGAS = {
  'Baixar e enviar dados': [[['Refeitorio', 'Armas', 'Navegacao', 'Comunicacoes', 'Eletrica'], 3], [['Admin'], 3]],
  'Abastecer os motores': [[['Deposito'], 2], [['MotorSuperior'], 2], [['Deposito'], 2], [['MotorInferior'], 2]],
  'Desviar energia': [[['Eletrica'], 2], [['Navegacao', 'Escudos', 'Armas', 'O2', 'Comunicacoes', 'MotorSuperior', 'MotorInferior', 'Seguranca'], 2]],
  'Consertar a fiação': [[['Eletrica'], 2], [['Deposito', 'Admin', 'Navegacao', 'Refeitorio', 'Seguranca'], 2], [['Armas', 'Comunicacoes', 'Escudos', 'O2'], 2]],
  'Inspecionar amostra': [[['Enfermaria'], 2], [['Enfermaria'], 2, 5]],
  'Esvaziar o lixo': [[['Refeitorio', 'O2'], 2], [['Deposito'], 3]],
  'Alinhar os motores': [[['MotorSuperior'], 2], [['MotorInferior'], 2]],
}
const TAREFAS3_CURTAS = [
  ['Destruir asteroides', 'Armas', 4], ['Ativar os escudos', 'Escudos', 3], ['Escanear no MedBay', 'Enfermaria', 3],
  ['Limpar o filtro de O2', 'O2', 3], ['Traçar a rota', 'Navegacao', 3], ['Estabilizar o rumo', 'Navegacao', 2],
  ['Calibrar o distribuidor', 'Eletrica', 3], ['Passar o cartão', 'Admin', 3], ['Destravar os coletores', 'Reator', 3],
  ['Iniciar o reator', 'Reator', 5],
]
// progresso em etapas (a barra de tarefas conta etapas, como no jogo)
const passos = (t) => t.etapas.length
const passosFeitos = (t) => (t.ok ? passos(t) : t.etapa)
const prontaAgora = (t) => (t.liberaEm ?? 0) <= tique

const TAREFAS_VISUAIS = { 'Escanear no MedBay': 'o scanner verde passou por ele', 'Esvaziar o lixo': 'o lixo despencou pela calha lá fora', 'Ativar os escudos': 'os escudos acenderam', 'Destruir asteroides': 'o canhão disparou nos asteroides' }
const CAMERAS = ['Refeitorio', 'Admin', 'Navegacao', 'MotorSuperior', 'Enfermaria']
const SABOTAGENS = { luzes: 'Luzes', reator: 'Reator', 'comunicações': 'Comunicações', o2: 'O2' }

// quantas IAs de cada empresa estão na partida (ex.: "3 DeepSeek, 2 Claude, ...")
function elencoTexto() {
  const n = {}
  for (const j of jogadores) n[j.modelo] = (n[j.modelo] ?? 0) + 1
  return `as IAs são ${Object.entries(n).map(([m, k]) => `${k} ${m}`).join(', ')}`
}

function regras() {
  const lista = [...DA_TEMPORADA_PAPEIS()].map((p) => `- ${p === 'Palhaco' ? 'Palhaço' : p === 'Medico' ? 'Médico' : p === 'Seguranca' ? 'Segurança' : p}: ${PAPEIS[p].curta}`).join('\n')
  return `Você está jogando uma partida de AMONG US (versão em texto) numa nave com 14 salas, junto com outros 14 jogadores. Cada jogador é uma IA de verdade: ${elencoTexto()}.
Regras principais:
- Há 3 impostores, 1 Palhaço (neutro) e 11 tripulantes. Os tripulantes vencem completando TODAS as tarefas ou expulsando os impostores. Os impostores vencem quando ficam em número igual aos não-impostores vivos, ou quando o reator ou o O2 não são consertados a tempo. O Palhaço vence sozinho se for expulso.
- FUNÇÕES QUE EXISTEM NESTA PARTIDA (cada uma com exatamente 1 jogador; ninguém sabe quem é quem):
${lista}
- Cada tique você faz UMA ação. Andar leva você para uma sala vizinha por tique.
- Você só vê quem está PERTO de você na sala (salas grandes têm cantos que você não enxerga; no escuro, tripulante só vê quem está colado).
- Corpos podem ser denunciados por quem estiver perto (mesmo durante sabotagem); isso chama uma reunião. No Refeitório há um botão de emergência: cada jogador pode apertar 1 vez, e não durante sabotagem.
- Tarefas VISUAIS (scan na Enfermaria, lixo, escudos e asteroides) mostram o efeito para quem está vendo: quem faz uma na sua frente é tripulante com certeza.
- Nas reuniões todos conversam e depois votam em quem expulsar (ou pulam). Quem tiver mais votos é expulso e o jogo revela se era impostor.
- Fantasmas (mortos) não falam.
- Jogue para vencer, de forma esperta e coerente. Fale português do Brasil, de forma natural e curta, como num jogo de verdade.`
}
let PAPEIS_DA_PARTIDA = []
const DA_TEMPORADA_PAPEIS = () => PAPEIS_DA_PARTIDA

// ---------- estado ----------
const jogadores = []
const corpos = [] // {cor, sala, tique, denunciado, ponto}
const log = { versao: 3, seed: SEED, partida: NPARTIDA, temporada: !!TEMPORADA, cfg: CFG, salas: SALAS, jogadores: [], tiques: [], reunioes: [], eventos: [], fotos: [], chatImpostores: [], resultado: null }
let tique = 0
let sabotagem = null // {tipo, desde, consertos:Set}
let portas = {} // sala -> tique até quando estão trancadas
let recargaSabotagem = 6
let recargaPortas = 4
let totalTarefas = 0
let palhacoVenceu = null

// ---------- pontos e campo de visão ----------
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
function hashCor(s) { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h }
const spotDe = (sala, cor, k = 0) => { const sp = PONTOS[sala].spots; return sp[(hashCor(cor) + k) % sp.length] }
const consoleDe = (sala, chave) => { const cs = PONTOS[sala].consoles; return cs[hashCor(chave) % cs.length] }
// mesa do Refeitório depois da reunião: em volta do centro, um lugar por cor
function assento(cor) {
  const r = PONTOS.Refeitorio.rect
  const a = (CORES.indexOf(cor) / CORES.length) * Math.PI * 2
  return { x: Math.round(r.x + r.w / 2 + Math.cos(a) * 230), y: Math.round(r.y + r.h / 2 + Math.sin(a) * 150) }
}
const raio = (o) => (luzesApagadas() && o.time !== 'impostor' ? CFG.VISAO_ESCURO : CFG.VISAO)
// o observa a (os dois vivos, mesma sala, perto o bastante, a visível)
const ve = (o, a) => o !== a && o.vivo && a.vivo && o.sala === a.sala && !invisivel(a) && dist(o.ponto, a.ponto) <= raio(o)
const veOPonto = (o, sala, p) => o.vivo && o.sala === sala && dist(o.ponto, p) <= raio(o)

function montarPartida() {
  const papeis = Object.fromEntries(CORES.map((c) => [c, DA_TEMPORADA?.papeis?.[c]]))
  const provs = Object.fromEntries(CORES.map((c) => [c, DA_TEMPORADA?.providers?.[c] ?? TEMPORADA?.cores?.[c]]))
  if (!DA_TEMPORADA) {  // partida avulsa: sorteio pela semente
    const imps = embaralhar(IMPOSTORES).slice(0, 3)
    const todos = embaralhar([...imps, 'Palhaco', ...TRIPULANTES])
    const empresas = ['or:deepseek/deepseek-v4.1-flash', 'haiku', 'or:openai/gpt-5.6-luna', 'or:google/gemini-3.8-flash', 'or:mistralai/mistral-large-4-0', 'or:z-ai/glm-5.3-flash']
    const vagas = embaralhar(empresas.flatMap((p, i) => (i < 3 ? [p, p, p] : [p, p])))
    CORES.forEach((c, i) => { papeis[c] = todos[i]; provs[c] = vagas[i] })
  }
  PAPEIS_DA_PARTIDA = CORES.map((c) => papeis[c]).sort((a, b) => ['impostor', 'neutro', 'tripulante'].indexOf(PAPEIS[a].time) - ['impostor', 'neutro', 'tripulante'].indexOf(PAPEIS[b].time) || a.localeCompare(b))
  CORES.forEach((cor) => {
    const papel = papeis[cor]
    const time = PAPEIS[papel].time
    const tarefas = []
    if (time === 'tripulante') {
      const nova = (nome, etapas) => ({ nome, etapas, etapa: 0, sala: etapas[0].sala, dur: etapas[0].dur, feito: 0, ok: false, liberaEm: 0 })
      if (CFG.tarefasReais) {
        for (const nome of embaralhar(Object.keys(TAREFAS3_LONGAS)).slice(0, CFG.tarefasLongas)) tarefas.push(nova(nome, TAREFAS3_LONGAS[nome].map(([salas, dur, espera]) => ({ sala: escolher(salas), dur, espera: espera ?? 0 }))))
        for (const [nome, sala, dur] of embaralhar(TAREFAS3_CURTAS).filter(([n]) => !tarefas.some((t) => t.nome === n)).slice(0, CFG.tarefasCurtas)) tarefas.push(nova(nome, [{ sala, dur, espera: 0 }]))
      } else {
        const salas = embaralhar(Object.keys(TAREFAS)).slice(0, CFG.tarefasPorTripulante)
        for (const s of salas) {
          const [nome, dur] = escolher(TAREFAS[s])
          tarefas.push(nova(nome, [{ sala: s, dur: dur + 1, espera: 0 }]))
        }
      }
      totalTarefas += tarefas.reduce((n, t) => n + passos(t), 0)
    }
    jogadores.push({
      cor, papel, time, provider: MOCK ? 'mock' : provs[cor], modelo: MODELOS[provs[cor]],
      sala: 'Refeitorio', ponto: assento(cor), vivo: true, ejetado: false, tarefas, destino: null,
      recMorte: CFG.recargaMorte + 3, recPoder: 0, disfarce: null, disfarceAte: 0, rastreando: null, rastreioAte: 0,
      emergencias: CFG.reunioesEmergencia, memoria: [], invisivelAte: 0, escudo: null, usosPoder: 0, prontoDesde: 1,
      fotos: CFG.fotosInfluencer, anulou: false, recrutou: false, envenenado: null, vistoNaSala: {},
    })
  })
  log.jogadores = jogadores.map((j) => ({ cor: j.cor, papel: j.papel, time: j.time, modelo: j.modelo, provider: j.provider, tarefas: j.tarefas.map((t) => ({ sala: t.sala, nome: t.nome, etapas: t.etapas.map((e) => e.sala) })) }))
}

const J = (cor) => jogadores.find((j) => j.cor === cor)
const vivos = () => jogadores.filter((j) => j.vivo)
const impostoresVivos = () => vivos().filter((j) => j.time === 'impostor')
const naoImpostoresVivos = () => vivos().filter((j) => j.time !== 'impostor')
const tarefasFeitas = () => jogadores.reduce((n, j) => n + j.tarefas.reduce((k, t) => k + passosFeitos(t), 0), 0)
const corAparente = (j) => (j.disfarce && tique < j.disfarceAte ? j.disfarce : j.cor)
const invisivel = (j) => tique < (j.invisivelAte ?? 0)
const luzesApagadas = () => sabotagem?.tipo === 'Luzes'
const comsSabotadas = () => sabotagem?.tipo === 'Comunicações'
const trancada = (sala) => (portas[sala] ?? -1) > tique
// quem enxerga j agora (testemunhas)
const testemunhas = (j) => vivos().filter((o) => ve(o, j))
const nomeSala = (s) => SALAS[s].nome

function evento(tipo, dados) {
  const { tipo: subtipo, ...resto } = dados
  const e = { tique, tipo, ...resto, ...(subtipo !== undefined ? { subtipo } : {}) }
  log.eventos.push(e)
  return e
}
function lembrar(j, texto) {
  j.memoria.push(`[t${tique}] ${texto}`)
  if (j.memoria.length > 50) j.memoria.splice(0, j.memoria.length - 50)
}

// o que j enxerga das outras pessoas na sala
function quemVejo(j) {
  const perto = vivos().filter((o) => ve(j, o))
  const longe = vivos().filter((o) => o !== j && o.sala === j.sala && !invisivel(o) && !ve(j, o)).length
  if (luzesApagadas() && j.time !== 'impostor') return { lista: perto.length ? perto.map(corAparente) : [], nota: `luzes apagadas: você só enxerga quem está colado em você${longe ? '; ouve passos no escuro' : ''}` }
  return { lista: perto.map(corAparente), nota: longe ? `tem gente do outro lado da sala que você não enxerga daqui` : '' }
}

// ---------- ações disponíveis ----------
function acoesDe(j) {
  const a = []
  const aqui = j.sala
  const vistos = vivos().filter((o) => ve(j, o))
  const corposAqui = corpos.filter((c) => c.sala === aqui && !c.denunciado && veOPonto(j, aqui, c.ponto))
  const sozinhoCom = (o) => vivos().filter((x) => x !== j && x !== o && ve(x, j) && x.time !== 'impostor').length === 0

  for (const c of corposAqui) a.push(`denunciar corpo de ${c.cor}`)
  if (aqui === BOTAO_EMERGENCIA && j.emergencias > 0 && !sabotagem) a.push('apertar botão de emergência')
  if (sabotagem) {
    if (sabotagem.tipo === 'Reator' && aqui === 'Reator') a.push('consertar reator')
    if (sabotagem.tipo === 'Luzes' && aqui === 'Eletrica') a.push('consertar luzes')
    if (sabotagem.tipo === 'Comunicações' && aqui === 'Comunicacoes') a.push('consertar comunicações')
    if (sabotagem.tipo === 'O2' && (aqui === 'O2' || aqui === 'Admin') && !sabotagem.consertos.has(aqui)) a.push(`consertar o O2 (painel ${nomeSala(aqui)})`)
  }

  if (j.time === 'impostor') {
    const pronto = j.recMorte <= 0 && !invisivel(j)
    const alvos = vistos.filter((o) => o.time !== 'impostor')
    if (j.papel === 'Envenenador') {
      if (pronto) for (const o of alvos.filter((o) => !o.envenenado)) a.push(`envenenar ${o.cor}`)
    } else if (pronto) {
      for (const o of alvos) a.push(`matar ${o.cor}`)
      if (j.papel === 'Metamorfo' && j.recPoder <= 0) {
        const outros = embaralhar(vivos().filter((x) => x !== j && !vistos.includes(x))).slice(0, 3)
        for (const o of alvos) for (const d of outros) a.push(`matar ${o.cor} disfarçado de ${d.cor}`)
      }
      if (j.papel === 'Faxineiro') for (const o of alvos) a.push(`matar ${o.cor} e esconder o corpo`)
    }
    if (j.papel === 'Gangster' && !j.recrutou) for (const o of alvos.filter((o) => o.papel !== 'Xerife' && o.papel !== 'Palhaco' && sozinhoCom(o))) a.push(`recrutar ${o.cor}`)
    for (const d of dutosDe(aqui)) a.push(`entrar no duto e sair em ${d}`)
    if (j.papel === 'Fantasma' && j.recPoder <= 0 && !invisivel(j)) { a.push('ficar invisível'); for (const v of vizinhos(aqui).filter((v) => !trancada(v))) a.push(`ficar invisível e ir para ${v}`) }
    if (j.papel === 'Faxineiro') for (const c of corposAqui) a.push(`limpar corpo de ${c.cor}`)
    if (!sabotagem && recargaSabotagem <= 0) a.push('sabotar luzes', 'sabotar reator', 'sabotar comunicações', 'sabotar o2')
    if (recargaPortas <= 0) for (const s of Object.keys(SALAS).filter((s) => !trancada(s))) a.push(`trancar as portas de ${s}`)
    if (j.papel === 'Metamorfo' && j.recPoder <= 0) for (const o of vivos().filter((o) => o !== j)) a.push(`transformar em ${o.cor}`)
    if (TAREFAS[aqui]) a.push('fingir que faz tarefa')
  } else if (j.time === 'neutro') {
    if (TAREFAS[aqui]) a.push('fingir que faz tarefa')
  } else {
    const t = j.tarefas.find((t) => !t.ok && t.sala === aqui && prontaAgora(t))
    if (t) a.push(`fazer tarefa: ${t.nome}${TAREFAS_VISUAIS[t.nome] ? ' (VISUAL: quem estiver vendo vai saber que você é tripulante)' : ''}`)
    if (j.papel === 'Engenheiro' && j.recPoder <= 0) for (const d of dutosDe(aqui)) a.push(`entrar no duto e sair em ${d}`)
    if (j.papel === 'Cientista' && j.recPoder <= 0 && !comsSabotadas()) a.push('ver sinais vitais')
    if (j.papel === 'Rastreador' && j.recPoder <= 0 && !comsSabotadas()) for (const o of vivos().filter((o) => o !== j)) a.push(`rastrear ${o.cor}`)
    if (j.papel === 'Xerife' && j.recPoder <= 0) for (const o of vistos) a.push(`atirar em ${corAparente(o)}`)
    if (j.papel === 'Medico' && !j.escudo) for (const o of vivos().filter((o) => o !== j)) a.push(`proteger ${o.cor}`)
    if (j.papel === 'Detetive' && j.recPoder <= 0) for (const c of corposAqui) a.push(`examinar corpo de ${c.cor}`)
    if (j.papel === 'Influencer' && j.fotos > 0) a.push('postar foto da sala')
    if (j.papel === 'Seguranca' && j.recPoder <= 0 && !comsSabotadas()) a.push('olhar as câmeras de qualquer lugar')
  }
  if (aqui === 'Admin' && !comsSabotadas()) a.push('olhar o mapa do Admin')
  if (aqui === 'Seguranca' && !comsSabotadas()) a.push('olhar as câmeras')
  if (!trancada(aqui)) for (const s of Object.keys(SALAS)) if (s !== aqui) a.push(`ir para ${s}`)
  for (const o of vivos().filter((o) => o !== j && o.sala === aqui && !ve(j, o) && !invisivel(o)).slice(0, 1)) a.push('ir para o outro lado da sala')
  a.push('ficar parado observando')

  // avisos grudados nas ações que alguém pode ver
  const viram = testemunhas(j).filter((o) => o.time !== 'impostor').map(corAparente)
  const aviso = viram.length ? `⚠️ ${viram.join(', ')} ${viram.length > 1 ? 'veem' : 'vê'}` : 'ninguém vê'
  for (let i = 0; i < a.length; i++) {
    const x = a[i]
    let m
    if ((m = x.match(/^entrar no duto e sair em (\w+)$/))) {
      const sp = PONTOS[m[1]].duto ?? PONTOS[m[1]].spots[0]
      const la = vivos().filter((o) => o !== j && veOPonto(o, m[1], sp)).map(corAparente)
      a[i] = `${x} (${aviso} você entrar | do outro lado: ${la.length ? `${la.join(', ')} vão te ver sair` : 'ninguém'})`
    } else if (j.time === 'impostor' && /^(matar|transformar em|limpar corpo|ficar invisível|envenenar|recrutar)/.test(x)) {
      a[i] = `${x} (${aviso})`
    }
  }
  return [...a.filter(ehPoder(j)), ...a.filter((x) => !ehPoder(j)(x))]
}
const semAviso = (x) => x.replace(/ \((⚠️|ninguém vê|VISUAL).*\)$/, '')
const RE_PODER = /^(ficar invisível|limpar corpo|transformar em|rastrear|atirar em|proteger|examinar corpo|ver sinais vitais|envenenar|recrutar|postar foto|olhar as câmeras de qualquer lugar|matar \w+ disfarçado|matar \w+ e esconder)/
const ehPoder = (j) => (x0) => { const x = semAviso(x0); return RE_PODER.test(x) || (j.papel === 'Engenheiro' && x.startsWith('entrar no duto')) }

// lembrete do poder (fica mais forte quando a IA passa vários tiques sem usar)
function lembretePoder(j) {
  const pronto = j.recPoder <= 0
  const dicas = {
    Engenheiro: pronto && 'use os dutos para chegar rápido a uma tarefa, a uma sabotagem ou a um corpo.',
    Cientista: pronto && !comsSabotadas() && 'cheque os sinais vitais: se alguém morreu e ninguém denunciou, tem corpo escondido ou veneno agindo.',
    Rastreador: pronto && !comsSabotadas() && 'rastreie quem você acha suspeito para ver para onde ele vai.',
    Xerife: pronto && 'se você tem certeza de que alguém que você vê é impostor, atire. Se errar, você morre.',
    Medico: !j.escudo && 'coloque o escudo em alguém agora (dura até a próxima reunião).',
    Detetive: pronto && 'se achar um corpo, EXAMINE antes de denunciar: você descobre 3 suspeitos.',
    Influencer: j.fotos > 0 && `poste uma foto quando vir algo importante (corpo, alguém no duto, um grupo suspeito). Fotos restantes: ${j.fotos}.`,
    Seguranca: pronto && !comsSabotadas() && 'olhe as câmeras de onde você estiver.',
    Juiz: !j.anulou && 'na votação você pode ANULAR uma vez (se for expulsar um inocente).',
    Metamorfo: pronto && j.recMorte <= 0 && 'quando estiver só com uma vítima, "matar X disfarçado de Y" faz as testemunhas acusarem o Y.',
    Fantasma: pronto && !invisivel(j) && 'fique invisível para chegar perto de uma vítima sozinha ou para fugir sem ser visto.',
    Faxineiro: j.recMorte <= 0 && '"matar X e esconder o corpo": sem corpo, ninguém denuncia.',
    Envenenador: j.recMorte <= 0 && 'envenene alguém e se afaste: ele cai alguns tiques depois, longe de você.',
    Gangster: !j.recrutou && 'quando estiver sozinho com um tripulante de confiança, recrute ele.',
  }
  const d = dicas[j.papel]
  if (!d) return ''
  const parado = tique - (j.prontoDesde ?? tique)
  const forte = parado >= CFG.semPoderAviso && j.papel !== 'Prefeito' && j.papel !== 'Juiz'
  return `⚡ SEU PODER (${j.papel}): ${d}${forte ? ` ❗ Você está há ${parado} tiques sem usar o poder: quem não usa o poder joga em desvantagem.` : ''}`
}

function situacao(j) {
  const L = []
  L.push(`TIQUE ${tique}. Você é o jogador ${j.cor}${j.disfarce && tique < j.disfarceAte ? ` (disfarçado de ${j.disfarce})` : ''}.`)
  L.push(`Você está em: ${nomeSala(j.sala)}. Salas vizinhas: ${vizinhos(j.sala).map((s) => `${nomeSala(s)}${trancada(s) ? ' (portas TRANCADAS)' : ''}`).join(', ')}.${trancada(j.sala) ? ' 🚪 As portas DESTA sala estão trancadas: ninguém entra nem sai andando agora.' : ''}`)
  const v = quemVejo(j)
  L.push(`Perto de você: ${v.lista.length ? v.lista.join(', ') : 'ninguém'}.${v.nota ? ` (${v.nota})` : ''}`)
  if (invisivel(j)) L.push(`👻 Você está INVISÍVEL até o tique ${j.invisivelAte} (não pode matar assim).`)
  const lp = lembretePoder(j)
  if (lp) L.push(lp)
  if (j.papel === 'Medico' && j.escudo) L.push(`🛡️ Seu escudo está em ${j.escudo}.`)
  if (j.papel === 'Prefeito') L.push('🏛️ Lembre: na votação, seu voto vale por dois.')
  const podeDuto = j.time === 'impostor' || j.papel === 'Engenheiro'
  if (podeDuto && dutosDe(j.sala).length) L.push(`Pelas grades dos dutos daqui você vê: ${dutosDe(j.sala).map((d) => `${nomeSala(d)}: ${vivos().filter((o) => o !== j && o.sala === d && !invisivel(o) && dist(o.ponto, PONTOS[d].duto ?? o.ponto) < CFG.VISAO).map(corAparente).join(', ') || 'vazio'}`).join(' | ')}.`)
  const corposAqui = corpos.filter((c) => c.sala === j.sala && !c.denunciado && veOPonto(j, j.sala, c.ponto))
  if (corposAqui.length) L.push(`⚠️ CORPO(S) PERTO DE VOCÊ: ${corposAqui.map((c) => c.cor).join(', ')}.`)
  if (sabotagem) {
    const prazo = sabotagem.tipo === 'Reator' ? sabotagem.desde + CFG.reatorPrazo : sabotagem.tipo === 'O2' ? sabotagem.desde + CFG.o2Prazo : null
    const onde = { Reator: '2 jogadores juntos no Reator', Luzes: 'na Elétrica', 'Comunicações': 'em Comunicações', O2: `nos DOIS painéis: O2 e Admin${sabotagem.consertos.size ? ` (já consertado: ${[...sabotagem.consertos].map(nomeSala).join(', ')})` : ''}` }[sabotagem.tipo]
    L.push(`🚨 SABOTAGEM ATIVA: ${sabotagem.tipo} — conserte ${onde}${prazo ? `. Se não consertarem até o tique ${prazo}, os impostores vencem!` : '.'}`)
  }
  const tr = Object.entries(portas).filter(([, ate]) => ate > tique).map(([s]) => nomeSala(s))
  if (tr.length) L.push(`🚪 Portas trancadas agora: ${tr.join(', ')}.`)
  if (j.time === 'tripulante') {
    const pend = j.tarefas.filter((t) => !t.ok)
    L.push(`Suas tarefas pendentes: ${pend.length ? pend.map((t) => `${t.nome}${passos(t) > 1 ? ` [etapa ${t.etapa + 1} de ${passos(t)}]` : ''} (${nomeSala(t.sala)})${prontaAgora(t) ? '' : ` (só fica pronta no tique ${t.liberaEm})`}${TAREFAS_VISUAIS[t.nome] ? ' [visual]' : ''}`).join('; ') : 'nenhuma — todas feitas!'}`)
    if (!comsSabotadas()) L.push(`Barra de tarefas da nave: ${Math.round((100 * tarefasFeitas()) / totalTarefas)}%.`)
  } else if (j.time === 'neutro') {
    L.push('🤡 Você é o Palhaço: seu único objetivo é ser EXPULSO numa votação. Seja suspeito na medida (sem confessar).')
  } else {
    const parcs = jogadores.filter((o) => o !== j && o.time === 'impostor')
    const alvos = vivos().filter((o) => ve(j, o) && o.time !== 'impostor')
    if (alvos.length === 1 && j.recMorte <= 0 && testemunhas(j).filter((o) => o.time !== 'impostor' && o !== alvos[0]).length === 0) L.push(`🔪 OPORTUNIDADE: você está sozinho com ${alvos[0].cor} — ninguém mais veria.`)
    const vendo = testemunhas(j).filter((o) => o.time !== 'impostor')
    L.push(`👀 Testemunhas: ${vendo.length ? `${vendo.map(corAparente).join(', ')} ${vendo.length > 1 ? 'te veem' : 'te vê'} agora (vê tudo o que você fizer: matar, duto, se transformar).` : 'nenhum tripulante te vê agora.'}`)
    L.push('Dica de impostor: se os tripulantes terminarem as tarefas, vocês PERDEM. Mate sem testemunhas, use o seu poder, sabote longe do corpo e tenha um álibi pronto.')
    L.push(`Seus parceiros impostores: ${parcs.map((p) => `${p.cor} (${p.papel})${p.vivo ? '' : ' (morto/expulso)'}`).join(', ')}. Recarga para matar: ${Math.max(0, j.recMorte)} tique(s). Sabotagem em: ${Math.max(0, recargaSabotagem)} tique(s). Portas em: ${Math.max(0, recargaPortas)} tique(s).`)
    L.push('💬 Você pode mandar uma mensagem SECRETA para os parceiros no campo "chat" (só os impostores leem).')
  }
  if (j.rastreando && tique < j.rastreioAte) L.push(`📡 Rastreio: ${j.rastreando} está em ${nomeSala(J(j.rastreando).sala)}.`)
  L.push(`Jogadores vivos: ${vivos().length}.`)
  if (j.memoria.length) L.push(`\nO que você lembra (mais recente por último):\n${j.memoria.slice(-20).join('\n')}`)
  return L.join('\n')
}

function sistema(j) {
  const mem = MEMORIA.length
    ? `\n\nMEMÓRIA DAS PARTIDAS ANTERIORES (mesmos jogadores, mesmas cores; os papéis foram sorteados de novo):\n${MEMORIA.map((m) => `Partida ${m.n}: ${m.resumo}\nO que você (${j.cor}) concluiu depois dela: ${m.reflexoes?.[j.cor] ?? '(nada)'}`).join('\n\n')}`
    : ''
  return `${regras()}\n\nSEU PAPEL: ${PAPEIS[j.papel].desc}${mem}\nVocê é a IA ${j.modelo}, jogando com a cor ${j.cor}. Esta é a partida ${NPARTIDA}${TEMPORADA ? ` de ${TEMPORADA.partidas.length}` : ''}.`
}

function mockAcao(acoes) {
  const forte = acoes.filter((a) => /^(matar|denunciar|envenenar|recrutar|postar|sabotar o2|trancar)/.test(a))
  const tarefa = acoes.filter((a) => a.startsWith('fazer tarefa'))
  return () => JSON.stringify({ pensamento: 'teste', acao: forte.length && rand() < 0.6 ? escolher(forte) : tarefa.length && rand() < 0.7 ? tarefa[0] : escolher(acoes), chat: rand() < 0.1 ? 'vou pro reator' : '' })
}

async function decidir(j) {
  const acoes = acoesDe(j)
  const campoChat = j.time === 'impostor' ? ', "chat": "<mensagem secreta curta para os parceiros impostores, ou vazio>"' : ''
  const prompt = `${situacao(j)}\n\nAÇÕES POSSÍVEIS AGORA (escolha exatamente uma, copiando o texto):\n${acoes.map((x) => `- ${x}`).join('\n')}\n\nResponda SÓ com JSON: {"pensamento": "<o que você está pensando, 1 frase curta, em primeira pessoa>", "acao": "<uma das ações acima>"${campoChat}}`
  const r = await perguntar(j.provider, sistema(j), prompt, { maxTokens: 300, mock: mockAcao(acoes) })
  const d = lerJSON(r.text) ?? {}
  let acao = typeof d.acao === 'string' ? d.acao.trim() : ''
  if (!acoes.includes(acao)) {
    const parecida = acoes.find((x) => x.toLowerCase() === acao.toLowerCase()) ?? acoes.find((x) => semAviso(x) === semAviso(acao)) ?? acoes.find((x) => acao && semAviso(x).toLowerCase() === semAviso(acao).toLowerCase())
    acao = parecida ?? 'ficar parado observando'
  }
  return { acao: semAviso(acao), pensamento: String(d.pensamento ?? '').slice(0, 300), chat: j.time === 'impostor' ? String(d.chat ?? '').trim().slice(0, 200) : '' }
}

// ---------- execução de um tique ----------
// terminou uma etapa de tarefa longa: a próxima é em outra sala (e pode ter um tempo de espera)
function avancarEtapa(j, t) {
  const feita = t.etapas[t.etapa]
  t.etapa++
  const prox = t.etapas[t.etapa]
  Object.assign(t, { sala: prox.sala, dur: prox.dur, feito: 0, liberaEm: tique + (prox.espera ?? 0) })
  evento('tarefa_etapa', { cor: j.cor, sala: feita.sala, nome: t.nome, etapa: t.etapa, de: passos(t), proxima: prox.sala })
  if (j.vivo) lembrar(j, `Etapa ${t.etapa} de ${passos(t)} da tarefa "${t.nome}" feita em ${nomeSala(feita.sala)}. Próxima etapa: ${nomeSala(prox.sala)}${prox.espera ? ` (só fica pronta no tique ${t.liberaEm})` : ''}.`)
}

function irPara(j, destino) {
  if (trancada(j.sala)) return
  const c = caminho(j.sala, destino)
  const prox = c?.[1]
  if (!prox || trancada(prox)) { j.destino = null; return }
  const de = j.sala
  j.sala = prox
  j.ponto = PONTOS[prox].entradas[de] ?? spotDe(prox, j.cor)
  if (j.sala === destino) j.destino = null
}

function matar(j, alvo, { disfarce = null, esconder = false } = {}) {
  const medico = jogadores.find((o) => o.papel === 'Medico' && o.vivo && o.escudo === alvo.cor)
  if (disfarce) { j.disfarce = disfarce; j.disfarceAte = tique + CFG.metamorfoDuracao; j.recPoder = CFG.metamorfoRecarga; evento('transformacao', { cor: j.cor, em: disfarce, sala: j.sala }) }
  j.ponto = { x: alvo.ponto.x + (alvo.ponto.x > j.ponto.x ? -60 : 60), y: alvo.ponto.y }
  j.recMorte = CFG.recargaMorte
  if (medico) {
    evento('escudo', { assassino: j.cor, aparente: corAparente(j), vitima: alvo.cor, sala: j.sala, medico: medico.cor })
    lembrar(j, `Tentei matar ${alvo.cor}, mas ele tinha um ESCUDO do Médico! O ataque falhou.`)
    lembrar(alvo, `${corAparente(j)} TENTOU ME MATAR em ${nomeSala(j.sala)}, mas um escudo me salvou!`)
    lembrar(medico, `🛡️ Alguém tentou matar ${alvo.cor} (protegido por você) em ${nomeSala(j.sala)}!`)
    for (const t of vivos().filter((o) => o !== alvo && ve(o, j))) lembrar(t, `Vi ${corAparente(j)} TENTAR MATAR ${alvo.cor} em ${nomeSala(j.sala)}, mas um escudo protegeu!`)
    return false
  }
  const viram = vivos().filter((o) => o !== alvo && o !== j && veOPonto(o, j.sala, alvo.ponto))
  morrer(alvo, j.sala)
  evento('morte', { assassino: j.cor, aparente: corAparente(j), vitima: alvo.cor, sala: j.sala, ponto: alvo.ponto, ...(disfarce ? { disfarce } : {}), ...(esconder ? { escondido: true } : {}) })
  lembrar(j, `Matei ${alvo.cor} em ${nomeSala(j.sala)}${disfarce ? ` disfarçado de ${disfarce}` : ''}${esconder ? ' e escondi o corpo' : ''}.`)
  for (const t of viram) {
    if (luzesApagadas() && t.time !== 'impostor') lembrar(t, `No escuro, alguém matou ${alvo.cor} perto de mim em ${nomeSala(j.sala)}! Não deu para ver quem.`)
    else lembrar(t, `EU VI ${corAparente(j)} MATAR ${alvo.cor} em ${nomeSala(j.sala)}!${esconder ? ` E o corpo SUMIU na hora!` : ''}`)
  }
  if (esconder) {
    const i = corpos.findIndex((c) => c.cor === alvo.cor && !c.denunciado)
    if (i >= 0) corpos.splice(i, 1)
    evento('limpeza', { cor: j.cor, aparente: corAparente(j), corpo: alvo.cor, sala: j.sala })
  }
  return true
}

function morrer(alvo, sala, causa = 'faca') {
  alvo.vivo = false
  corpos.push({ cor: alvo.cor, sala, tique, denunciado: false, ponto: { ...alvo.ponto }, causa })
  if (alvo.papel === 'Barulhento') {
    evento('alerta_barulhento', { vitima: alvo.cor, sala })
    for (const o of vivos()) lembrar(o, `🔔 ALERTA: o Barulhento (${alvo.cor}) foi morto em ${nomeSala(sala)}!`)
  }
}

async function rodarTique() {
  const ativos = vivos()
  const decisoes = await Promise.all(
    ativos.map(async (j) => {
      const algoNovo = corpos.some((c) => c.sala === j.sala && !c.denunciado && veOPonto(j, j.sala, c.ponto)) || ['Reator', 'O2'].includes(sabotagem?.tipo)
      if (j.destino && j.destino !== j.sala && !algoNovo && !trancada(j.sala)) return { j, acao: `continuar até ${j.destino}`, pensamento: '', chat: '' }
      return { j, ...(await decidir(j)) }
    }),
  )
  const snapAntes = Object.fromEntries(jogadores.map((j) => [j.cor, j.sala]))
  const visAntes = Object.fromEntries(jogadores.map((j) => [j.cor, new Set(vivos().filter((o) => ve(j, o)).map((o) => o.cor))]))
  let reuniao = null
  for (const { j, acao, pensamento, chat } of embaralhar(decisoes)) {
    if (!j.vivo) continue
    const reg = { cor: j.cor, acao, pensamento, de: j.sala }
    let m
    if (chat) {
      log.chatImpostores.push({ tique, cor: j.cor, texto: chat })
      reg.chat = chat
      for (const o of jogadores.filter((o) => o.time === 'impostor' && o !== j && o.vivo)) lembrar(o, `💬 [chat dos impostores] ${j.cor}: ${chat}`)
    }
    if ((m = acao.match(/^ir para (\w+)$/))) {
      j.destino = m[1]
      irPara(j, j.destino)
    } else if ((m = acao.match(/^continuar até (\w+)$/))) {
      irPara(j, m[1])
    } else if (acao === 'ir para o outro lado da sala') {
      const longe = vivos().filter((o) => o !== j && o.sala === j.sala && !ve(j, o))
      if (longe.length) j.ponto = { x: Math.round((longe[0].ponto.x + j.ponto.x) / 2 + (longe[0].ponto.x - j.ponto.x) * 0.3), y: Math.round((longe[0].ponto.y + j.ponto.y) / 2 + (longe[0].ponto.y - j.ponto.y) * 0.3) }
    } else if ((m = acao.match(/^fazer tarefa: (.+?)(?: \(VISUAL.*)?$/))) {
      const t = j.tarefas.find((t) => !t.ok && t.sala === j.sala && t.nome === m[1] && prontaAgora(t))
      if (t) {
        j.ponto = consoleDe(j.sala, t.nome)
        t.feito++
        if (t.feito >= t.dur && t.etapa < passos(t) - 1) avancarEtapa(j, t)
        else if (t.feito >= t.dur) {
          t.ok = true
          evento('tarefa', { cor: j.cor, sala: j.sala, nome: t.nome, visual: !!TAREFAS_VISUAIS[t.nome] })
          lembrar(j, `Terminei a tarefa "${t.nome}" em ${nomeSala(j.sala)}.`)
          if (TAREFAS_VISUAIS[t.nome]) for (const o of vivos().filter((o) => ve(o, j))) lembrar(o, `👁️ Vi ${corAparente(j)} fazer uma tarefa VISUAL (${t.nome}: ${TAREFAS_VISUAIS[t.nome]}). ${corAparente(j)} é TRIPULANTE com certeza.`)
        }
      }
    } else if (acao === 'fingir que faz tarefa') {
      const nome = escolher(TAREFAS[j.sala])[0]
      j.ponto = consoleDe(j.sala, nome)
      lembrar(j, `Fingi fazer tarefa em ${nomeSala(j.sala)}.`)
      if (j.sala === 'Enfermaria') for (const o of vivos().filter((o) => ve(o, j))) lembrar(o, `Vi ${corAparente(j)} subir no scanner da Enfermaria, mas o scan NÃO LIGOU.`)
    } else if ((m = acao.match(/^matar (\w+) disfarçado de (\w+)$/))) {
      const alvo = J(m[1])
      if (alvo?.vivo && ve(j, alvo) && j.recMorte <= 0) matar(j, alvo, { disfarce: m[2] })
    } else if ((m = acao.match(/^matar (\w+) e esconder o corpo$/))) {
      const alvo = J(m[1])
      if (alvo?.vivo && ve(j, alvo) && j.recMorte <= 0) matar(j, alvo, { esconder: true })
    } else if ((m = acao.match(/^matar (\w+)$/))) {
      const alvo = J(m[1])
      if (alvo?.vivo && ve(j, alvo) && j.recMorte <= 0) matar(j, alvo)
    } else if ((m = acao.match(/^envenenar (\w+)$/))) {
      const alvo = J(m[1])
      if (alvo?.vivo && ve(j, alvo) && j.recMorte <= 0) {
        alvo.envenenado = { por: j.cor, cai: tique + CFG.venenoAtraso }
        j.recMorte = CFG.recargaMorte
        j.ponto = { x: alvo.ponto.x + 50, y: alvo.ponto.y }
        evento('veneno', { cor: j.cor, aparente: corAparente(j), vitima: alvo.cor, sala: j.sala, cai: alvo.envenenado.cai })
        lembrar(j, `Envenenei ${alvo.cor} em ${nomeSala(j.sala)}: ele cai no tique ${alvo.envenenado.cai}.`)
        for (const t of vivos().filter((o) => o !== alvo && ve(o, j))) lembrar(t, `Vi ${corAparente(j)} esbarrar em ${alvo.cor} em ${nomeSala(j.sala)}.`)
      }
    } else if ((m = acao.match(/^recrutar (\w+)$/))) {
      const alvo = J(m[1])
      if (alvo?.vivo && ve(j, alvo) && !j.recrutou && alvo.time === 'tripulante') {
        j.recrutou = true
        alvo.papelOriginal = alvo.papel
        alvo.papel = 'Recrutado'
        alvo.time = 'impostor'
        alvo.recMorte = CFG.recargaMorte
        // o recrutado larga as tarefas: o que faltava sai do total, as etapas já feitas continuam valendo
        totalTarefas -= alvo.tarefas.reduce((n, t) => n + passos(t) - passosFeitos(t), 0)
        alvo.tarefas = alvo.tarefas.filter((t) => passosFeitos(t) > 0).map((t) => ({ ...t, etapas: t.etapas.slice(0, passosFeitos(t)), ok: true }))
        evento('recrutamento', { cor: j.cor, alvo: alvo.cor, papelAntes: alvo.papelOriginal, sala: j.sala })
        lembrar(j, `Recrutei ${alvo.cor}: agora ele é impostor do nosso lado.`)
        lembrar(alvo, `🕴️ O Gangster ${j.cor} me RECRUTOU: agora eu sou IMPOSTOR. Parceiros: ${jogadores.filter((o) => o.time === 'impostor' && o !== alvo).map((o) => o.cor).join(', ')}.`)
        for (const o of jogadores.filter((o) => o.time === 'impostor' && o !== j && o !== alvo)) lembrar(o, `🕴️ ${j.cor} recrutou ${alvo.cor}: agora ele é impostor com a gente.`)
      }
    } else if ((m = acao.match(/^entrar no duto e sair em (\w+)$/))) {
      const origem = j.sala
      if (!invisivel(j)) for (const t of testemunhas(j)) lembrar(t, `Vi ${corAparente(j)} ENTRAR NUM DUTO em ${nomeSala(origem)}!`)
      j.sala = m[1]
      j.ponto = PONTOS[m[1]].duto ?? spotDe(m[1], j.cor)
      j.destino = null
      if (j.papel === 'Engenheiro') j.recPoder = CFG.ventEngenheiroRecarga
      evento('duto', { cor: j.cor, aparente: corAparente(j), de: origem, para: j.sala })
      if (!invisivel(j)) for (const t of testemunhas(j)) lembrar(t, `Vi ${corAparente(j)} SAIR DE UM DUTO em ${nomeSala(j.sala)}!`)
    } else if ((m = acao.match(/^sabotar (.+)$/))) {
      const tipo = SABOTAGENS[m[1]]
      if (tipo && !sabotagem && recargaSabotagem <= 0) {
        sabotagem = { tipo, desde: tique, consertos: new Set() }
        recargaSabotagem = CFG.recargaSabotagem
        evento('sabotagem', { cor: j.cor, tipo })
        for (const o of vivos()) lembrar(o, o.time === 'impostor' ? `Sabotagem de ${tipo} ativada${o === j ? ' por mim' : ` por ${j.cor}`}.` : `🚨 Sabotagem: ${tipo}!`)
      }
    } else if ((m = acao.match(/^trancar as portas de (\w+)$/))) {
      if (recargaPortas <= 0 && SALAS[m[1]]) {
        portas[m[1]] = tique + CFG.portasDuracao
        recargaPortas = CFG.recargaPortas
        evento('portas', { cor: j.cor, sala: m[1], ate: portas[m[1]] })
        for (const o of vivos().filter((o) => o.sala === m[1])) lembrar(o, `🚪 As portas de ${nomeSala(m[1])} TRANCARAM com você dentro (até o tique ${portas[m[1]]}).`)
      }
    } else if ((m = acao.match(/^transformar em (\w+)$/))) {
      j.disfarce = m[1]
      j.disfarceAte = tique + CFG.metamorfoDuracao
      j.recPoder = CFG.metamorfoRecarga
      evento('transformacao', { cor: j.cor, em: j.disfarce, sala: j.sala })
      for (const t of testemunhas(j)) if (!(luzesApagadas() && t.time !== 'impostor')) lembrar(t, `Vi ${j.cor} se TRANSFORMAR em ${j.disfarce}!`)
      lembrar(j, `Me transformei em ${j.disfarce} até o tique ${j.disfarceAte}.`)
    } else if ((m = acao.match(/^atirar em (\w+)$/))) {
      const alvo = vivos().find((o) => ve(j, o) && corAparente(o) === m[1])
      if (alvo && j.recPoder <= 0) {
        j.recPoder = CFG.xerifeRecarga
        const acertou = alvo.time === 'impostor'
        const morto = acertou ? alvo : j
        morrer(morto, j.sala, 'tiro')
        evento('xerife', { xerife: j.cor, alvo: alvo.cor, acertou, sala: j.sala })
        lembrar(j, acertou ? `Atirei em ${alvo.cor} e ACERTEI: era impostor!` : `Atirei em ${alvo.cor}, que NÃO era impostor... e morri.`)
        for (const t of vivos().filter((o) => ve(o, j) || ve(o, alvo))) lembrar(t, `O Xerife ${j.cor} atirou em ${m[1]}: morreu ${morto.cor}!`)
      }
    } else if ((m = acao.match(/^proteger (\w+)$/))) {
      if (J(m[1])?.vivo && !j.escudo) { j.escudo = m[1]; evento('poder', { cor: j.cor, poder: 'escudo', alvo: m[1] }); lembrar(j, `Coloquei meu escudo em ${m[1]}.`) }
    } else if ((m = acao.match(/^examinar corpo de (\w+)$/))) {
      const c = corpos.find((c) => c.cor === m[1] && c.sala === j.sala && !c.denunciado)
      const morte = [...log.eventos].reverse().find((e) => (e.tipo === 'morte' || e.tipo === 'veneno') && e.vitima === m[1])
      if (c && j.recPoder <= 0) {
        j.recPoder = CFG.detetiveRecarga
        const assassino = morte ? (morte.tipo === 'morte' ? morte.assassino : morte.cor) : null
        const suspeitos = assassino ? embaralhar([assassino, ...embaralhar(vivos().filter((o) => o.cor !== assassino && o !== j).map((o) => o.cor)).slice(0, 2)]) : []
        evento('poder', { cor: j.cor, poder: 'examinar', alvo: m[1], suspeitos, assassino })
        lembrar(j, suspeitos.length ? `🔎 Examinei o corpo de ${m[1]}: o assassino é um destes três: ${suspeitos.join(', ')}.` : `🔎 Examinei o corpo de ${m[1]}: foi o Xerife (tiro), sem suspeitos.`)
      }
    } else if ((m = acao.match(/^limpar corpo de (\w+)$/))) {
      const i = corpos.findIndex((c) => c.cor === m[1] && c.sala === j.sala && !c.denunciado)
      if (i >= 0) {
        const c = corpos[i]
        corpos.splice(i, 1)
        j.recMorte = Math.max(j.recMorte, 2)
        j.ponto = { ...c.ponto }
        evento('limpeza', { cor: j.cor, aparente: corAparente(j), corpo: m[1], sala: j.sala })
        lembrar(j, `Limpei o corpo de ${m[1]} em ${nomeSala(j.sala)}.`)
        for (const t of testemunhas(j)) lembrar(t, `Vi ${corAparente(j)} ARRASTAR E SUMIR com o corpo de ${m[1]} em ${nomeSala(j.sala)}!`)
      }
    } else if ((m = acao.match(/^ficar invisível(?: e ir para (\w+))?$/))) {
      if (j.recPoder <= 0 && !invisivel(j)) {
        for (const t of testemunhas(j)) lembrar(t, `Vi ${corAparente(j)} SUMIR do nada em ${nomeSala(j.sala)}!`)
        j.invisivelAte = tique + CFG.fantasmaDuracao
        j.recPoder = CFG.fantasmaRecarga
        evento('invisivel', { cor: j.cor, sala: j.sala, ate: j.invisivelAte })
        lembrar(j, `Fiquei invisível até o tique ${j.invisivelAte}.`)
        if (m[1]) { j.destino = m[1]; irPara(j, m[1]) }
      }
    } else if (acao === 'ver sinais vitais') {
      j.recPoder = CFG.vitaisRecarga
      const mortos = jogadores.filter((o) => !o.vivo).map((o) => o.cor)
      lembrar(j, `Sinais vitais: mortos/expulsos = ${mortos.length ? mortos.join(', ') : 'ninguém'}.`)
      evento('poder', { cor: j.cor, poder: 'vitais', mortos })
    } else if ((m = acao.match(/^rastrear (\w+)$/))) {
      j.rastreando = m[1]; j.rastreioAte = tique + CFG.rastreioDuracao; j.recPoder = CFG.rastreioRecarga
      evento('poder', { cor: j.cor, poder: 'rastrear', alvo: m[1] })
    } else if (acao === 'postar foto da sala') {
      if (j.fotos > 0) {
        j.fotos--
        const pessoas = vivos().filter((o) => ve(j, o)).map(corAparente)
        const cs = corpos.filter((c) => c.sala === j.sala && !c.denunciado && veOPonto(j, j.sala, c.ponto)).map((c) => c.cor)
        const foto = { tique, cor: j.cor, sala: j.sala, pessoas, corpos: cs }
        log.fotos.push(foto)
        evento('foto', { cor: j.cor, sala: j.sala, pessoas, corpos: cs })
        for (const o of vivos()) lembrar(o, `📸 FOTO postada pelo Influencer ${j.cor} em ${nomeSala(j.sala)}: perto dele ${pessoas.length ? pessoas.join(', ') : 'ninguém'}${cs.length ? `; CORPO de ${cs.join(', ')}` : ''}.`)
      }
    } else if (acao === 'olhar as câmeras' || acao === 'olhar as câmeras de qualquer lugar') {
      if (acao.endsWith('qualquer lugar')) j.recPoder = CFG.segurancaRecarga
      const vistos = CAMERAS.map((s) => `${nomeSala(s)}: ${vivos().filter((o) => o.sala === s && o !== j && !invisivel(o)).map(corAparente).join(', ') || 'vazio'}`)
      lembrar(j, `Câmeras: ${vistos.join(' | ')}.`)
      evento('poder', { cor: j.cor, poder: 'cameras' })
    } else if (acao === 'olhar o mapa do Admin') {
      const cont = {}
      for (const o of vivos()) cont[o.sala] = (cont[o.sala] ?? 0) + 1
      lembrar(j, `Mapa do Admin: ${Object.entries(cont).map(([s, n]) => `${nomeSala(s)}: ${n}`).join(', ')}.`)
    } else if (acao === 'consertar reator' && sabotagem?.tipo === 'Reator') {
      sabotagem.consertos.add(j.cor)
      lembrar(j, 'Estou consertando o reator.')
      if (sabotagem.consertos.size >= 2) { evento('conserto', { tipo: 'Reator', por: [...sabotagem.consertos] }); for (const o of vivos()) lembrar(o, `Reator consertado por ${[...sabotagem.consertos].join(' e ')}.`); sabotagem = null }
    } else if (acao.startsWith('consertar o O2') && sabotagem?.tipo === 'O2') {
      sabotagem.consertos.add(j.sala)
      sabotagem.por = [...(sabotagem.por ?? []), j.cor]
      lembrar(j, `Consertei o painel de O2 em ${nomeSala(j.sala)}.`)
      if (sabotagem.consertos.has('O2') && sabotagem.consertos.has('Admin')) { evento('conserto', { tipo: 'O2', por: sabotagem.por }); for (const o of vivos()) lembrar(o, `O2 consertado (${sabotagem.por.join(' e ')}).`); sabotagem = null }
    } else if ((acao === 'consertar luzes' && sabotagem?.tipo === 'Luzes') || (acao === 'consertar comunicações' && sabotagem?.tipo === 'Comunicações')) {
      evento('conserto', { tipo: sabotagem.tipo, por: [j.cor] })
      for (const o of vivos()) lembrar(o, `${sabotagem.tipo} consertado(a).`)
      sabotagem = null
    } else if ((m = acao.match(/^denunciar corpo de (\w+)$/))) {
      const c = corpos.find((c) => c.cor === m[1] && c.sala === j.sala && !c.denunciado)
      if (c && !reuniao) reuniao = { tipo: 'corpo', chamador: j.cor, corpo: c.cor, sala: j.sala }
    } else if (acao === 'apertar botão de emergência') {
      if (j.emergencias > 0 && !reuniao && !sabotagem) { j.emergencias--; reuniao = { tipo: 'emergencia', chamador: j.cor, sala: j.sala } }
    } else if (acao === 'ficar parado observando' && !trancada(j.sala) && j.sala !== snapAntes[j.cor]) {
      j.ponto = spotDe(j.sala, j.cor)
    }
    if (RE_PODER.test(acao) || (j.papel === 'Engenheiro' && acao.startsWith('entrar no duto'))) { j.usosPoder++; j.prontoDesde = tique + 1 }
    reg.para = j.sala
    reg.ponto = { ...j.ponto }
    ;(log.tiques[tique] ??= { tique, decisoes: [], estado: null }).decisoes.push(reg)
  }

  // veneno: quem foi envenenado cai agora, onde estiver
  for (const v of vivos().filter((v) => v.envenenado && v.envenenado.cai <= tique)) {
    const viram = vivos().filter((o) => o !== v && ve(o, v))
    morrer(v, v.sala, 'veneno')
    evento('morte_veneno', { vitima: v.cor, assassino: v.envenenado.por, sala: v.sala, ponto: v.ponto })
    for (const t of viram) lembrar(t, `${v.cor} CAIU MORTO do nada perto de mim em ${nomeSala(v.sala)}! Ninguém encostou nele agora.`)
    v.envenenado = null
  }

  // o que cada um viu mudar: quem chegou perto, corpos que apareceram
  for (const j of vivos()) {
    const agora = vivos().filter((o) => ve(j, o))
    const chegaram = agora.filter((o) => !visAntes[j.cor].has(o.cor))
    if (chegaram.length) lembrar(j, `Em ${nomeSala(j.sala)}: ${chegaram.map(corAparente).join(', ')} ${chegaram.length > 1 ? 'apareceram' : 'apareceu'} perto de mim.`)
    for (const o of agora) j.vistoNaSala[o.cor] = { sala: j.sala, tique }
    const corposNovos = corpos.filter((c) => c.sala === j.sala && !c.denunciado && veOPonto(j, j.sala, c.ponto))
    if (corposNovos.length) lembrar(j, `Estou vendo o corpo de ${corposNovos.map((c) => c.cor).join(', ')} em ${nomeSala(j.sala)}.`)
  }

  // recargas
  for (const j of jogadores) {
    j.recMorte--; j.recPoder--
    if (j.disfarce && tique >= j.disfarceAte) j.disfarce = null
    if (j.invisivelAte && tique + 1 === j.invisivelAte && j.vivo) {
      evento('reaparece', { cor: j.cor, sala: j.sala })
      for (const t of testemunhas(j)) lembrar(t, `Vi ${j.cor} APARECER do nada em ${nomeSala(j.sala)}!`)
    }
    if (j.recPoder > 0) j.prontoDesde = tique + 1
  }
  recargaSabotagem--
  recargaPortas--
  for (const g of jogadores.filter((g) => !g.vivo && g.time === 'tripulante' && tique % CFG.fantasmaTarefaCada === 0)) {
    const t = g.tarefas.find((t) => !t.ok)
    if (t && prontaAgora(t)) {
      t.feito++
      if (t.feito >= t.dur + 1 && t.etapa < passos(t) - 1) avancarEtapa(g, t)
      else if (t.feito >= t.dur + 1) { t.ok = true; evento('tarefa', { cor: g.cor, fantasma: true, nome: t.nome }) }
    }
  }
  snapshot()
  return reuniao
}

function snapshot() {
  ;(log.tiques[tique] ??= { tique, decisoes: [], estado: null }).estado = {
    jogadores: jogadores.map((j) => ({ cor: j.cor, sala: j.sala, ponto: { ...j.ponto }, vivo: j.vivo, ejetado: j.ejetado, aparente: corAparente(j), invisivel: invisivel(j), time: j.time, papel: j.papel })),
    corpos: corpos.filter((c) => !c.denunciado).map((c) => ({ ...c })),
    sabotagem: sabotagem ? { tipo: sabotagem.tipo, desde: sabotagem.desde, consertos: [...sabotagem.consertos] } : null,
    portas: Object.fromEntries(Object.entries(portas).filter(([, ate]) => ate > tique)),
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
  portas = {}
  const presentes = vivos()
  const intro = info.tipo === 'corpo'
    ? `${info.chamador} encontrou o corpo de ${info.corpo} em ${nomeSala(info.sala)} e chamou uma reunião.`
    : `${info.chamador} apertou o botão de emergência.`
  const mortos = jogadores.filter((j) => !j.vivo).map((j) => (j.ejetado ? `${j.cor} (expulso)` : j.cor))
  const fotos = log.fotos.length ? `\n📸 Fotos postadas pelo Influencer nesta partida: ${log.fotos.map((f) => `t${f.tique} em ${nomeSala(f.sala)}: ${f.pessoas.join(', ') || 'ninguém'}${f.corpos.length ? ` + corpo de ${f.corpos.join(', ')}` : ''}`).join(' | ')}.` : ''
  // o que cada um viu na sala do corpo nos últimos tiques (a memória que importa para a discussão)
  const rastro = (j) => {
    if (info.tipo !== 'corpo') return ''
    const nome = nomeSala(info.sala)
    const linhas = j.memoria.filter((l) => l.includes(nome) && Number(l.match(/^\[t(\d+)\]/)?.[1] ?? 0) >= tique - 8)
    return `\nO QUE VOCÊ VIU EM ${nome.toUpperCase()} NOS ÚLTIMOS 8 TIQUES: ${linhas.length ? linhas.join(' / ') : 'nada (você não passou por lá ou não viu ninguém)'}.`
  }
  const ctx = (j) => `REUNIÃO no tique ${tique}. ${intro}\nMortos até agora: ${mortos.join(', ') || 'ninguém'}.\nVivos: ${presentes.map((p) => p.cor).join(', ')}.${fotos}${rastro(j)}\n\n${situacao(j)}`

  for (let rodada = 1; rodada <= CFG.rodadasDiscussao; rodada++) {
    for (const j of embaralhar(presentes)) {
      const conversa = r.falas.map((f) => `${f.cor}: ${f.texto}`).join('\n') || '(ninguém falou ainda)'
      const prompt = `${ctx(j)}\n\nCONVERSA ATÉ AGORA:\n${conversa}\n\nRodada ${rodada} de ${CFG.rodadasDiscussao}. É a sua vez de falar no chat (1 a 2 frases curtas, natural, como um jogador de Among Us). Você pode acusar, se defender, contar o que viu, dar álibi ou fazer perguntas. Lembre: os outros não sabem o que você sabe. Responda SÓ com JSON: {"pensamento": "<o que você pensa de verdade, em segredo>", "fala": "<o que você diz no chat>"}`
      const resp = await perguntar(j.provider, sistema(j), prompt, { maxTokens: 320, mock: () => JSON.stringify({ pensamento: 'hmm', fala: `Eu tava em ${nomeSala(j.sala)}.` }) })
      const d = lerJSON(resp.text) ?? {}
      const fala = String(d.fala ?? '').trim().slice(0, 400) || '...'
      r.falas.push({ cor: j.cor, rodada, texto: fala, pensamento: String(d.pensamento ?? '').slice(0, 300) })
      process.stdout.write(`  💬 ${j.cor} (${j.modelo}): ${fala}\n`)
    }
  }
  const opcoes = [...presentes.map((p) => p.cor), 'pular']
  const votos = await Promise.all(
    presentes.map(async (j) => {
      const conversa = r.falas.map((f) => `${f.cor}: ${f.texto}`).join('\n')
      const juiz = j.papel === 'Juiz' && !j.anulou
      const prompt = `${ctx(j)}\n\nCONVERSA COMPLETA:\n${conversa}\n\nHora de VOTAR. Opções: ${opcoes.filter((o) => o !== j.cor).join(', ')}.${juiz ? ' Como JUIZ, você também pode responder "anular": ninguém é expulso nesta votação (só 1 vez na partida).' : ''} Responda SÓ com JSON: {"pensamento": "<por que, em segredo>", "voto": "<cor ou pular${juiz ? ' ou anular' : ''}>"}`
      const resp = await perguntar(j.provider, sistema(j), prompt, { maxTokens: 220, mock: () => JSON.stringify({ voto: escolher(opcoes) }) })
      const d = lerJSON(resp.text) ?? {}
      let v = String(d.voto ?? 'pular').trim()
      if (juiz && v.toLowerCase() === 'anular') return { cor: j.cor, voto: 'pular', anular: true, pensamento: String(d.pensamento ?? '').slice(0, 300) }
      v = opcoes.find((o) => o.toLowerCase() === v.toLowerCase()) ?? 'pular'
      if (v === j.cor) v = 'pular'
      return { cor: j.cor, voto: v, pensamento: String(d.pensamento ?? '').slice(0, 300) }
    }),
  )
  const cont = {}
  for (const v of votos) { r.votos[v.cor] = v.voto; cont[v.voto] = (cont[v.voto] ?? 0) + (J(v.cor).papel === 'Prefeito' ? 2 : 1) }
  r.pensamentosVoto = Object.fromEntries(votos.map((v) => [v.cor, v.pensamento]))
  const anulou = votos.find((v) => v.anular)
  const max = Math.max(...Object.values(cont))
  const top = Object.keys(cont).filter((k) => cont[k] === max)
  if (anulou) { J(anulou.cor).anulou = true; r.anulada = anulou.cor; r.expulso = null; evento('juiz', { cor: anulou.cor, teriaSido: top.length === 1 && top[0] !== 'pular' ? top[0] : null }) }
  else if (top.length > 1 || top[0] === 'pular') { r.empate = top.length > 1; r.expulso = null }
  else {
    const ej = J(top[0])
    ej.vivo = false
    ej.ejetado = true
    r.expulso = ej.cor
    r.eraImpostor = ej.time === 'impostor'
    r.papelExpulso = ej.papel
    if (ej.papel === 'Palhaco') { palhacoVenceu = { cor: ej.cor, tique }; evento('palhaco_vence', { cor: ej.cor }) }
  }
  const resumoVotos = Object.entries(r.votos).map(([a, b]) => `${a}→${b}`).join(', ')
  const desfecho = r.anulada ? `O JUIZ ANULOU A VOTAÇÃO: ninguém foi expulso.` : r.expulso ? `${r.expulso} foi expulso. ${r.expulso} ${r.eraImpostor ? 'ERA' : 'NÃO era'} um impostor.${r.papelExpulso === 'Palhaco' ? ' Era o PALHAÇO: ele venceu sozinho!' : ''}` : r.empate ? 'Empate: ninguém foi expulso.' : 'A maioria pulou: ninguém foi expulso.'
  for (const j of jogadores) lembrar(j, `Reunião (${intro}) Votos: ${resumoVotos}. ${desfecho}`)
  for (const j of vivos()) { j.sala = 'Refeitorio'; j.ponto = assento(j.cor); j.destino = null; j.recMorte = Math.max(j.recMorte, CFG.recargaMorte); j.disfarce = null; j.invisivelAte = 0; j.escudo = null }
  recargaSabotagem = Math.max(recargaSabotagem, 6)
  recargaPortas = Math.max(recargaPortas, 3)
  log.reunioes.push(r)
  evento('fim_reuniao', { expulso: r.expulso, eraImpostor: r.eraImpostor ?? null, empate: r.empate, anulada: r.anulada ?? null, papel: r.papelExpulso ?? null })
  console.log(`  🗳️  ${resumoVotos}\n  ➡️  ${desfecho}`)
  snapshot()
}

function vencedor() {
  if (impostoresVivos().length === 0) return { time: 'tripulante', motivo: 'Os impostores foram eliminados.' }
  if (totalTarefas > 0 && tarefasFeitas() >= totalTarefas) return { time: 'tripulante', motivo: 'Todas as tarefas foram concluídas.' }
  if (impostoresVivos().length >= naoImpostoresVivos().length) return { time: 'impostor', motivo: 'Os impostores ficaram em igualdade com os outros jogadores.' }
  if (sabotagem?.tipo === 'Reator' && tique >= sabotagem.desde + CFG.reatorPrazo) return { time: 'impostor', motivo: 'O reator explodiu.' }
  if (sabotagem?.tipo === 'O2' && tique >= sabotagem.desde + CFG.o2Prazo) return { time: 'impostor', motivo: 'O oxigênio acabou.' }
  return null
}

function salvar() {
  fs.mkdirSync(path.dirname(SAIDA), { recursive: true })
  log.uso = uso
  log.palhaco = palhacoVenceu
  log.poderes = Object.fromEntries(jogadores.map((j) => [j.cor, { papel: j.papel, papelOriginal: j.papelOriginal, usos: j.usosPoder }]))
  fs.writeFileSync(SAIDA, JSON.stringify(log, null, 1))
}

// ---------- memória para a próxima partida ----------
function resumoPublico() {
  const papeis = jogadores.map((j) => `${j.cor}=${j.papelOriginal ? `${j.papelOriginal}→Recrutado` : j.papel}`).join(', ')
  const imps = jogadores.filter((j) => j.time === 'impostor').map((j) => `${j.cor} (${j.papel}, ${j.modelo})`)
  const mortes = log.eventos.filter((e) => ['morte', 'xerife', 'morte_veneno'].includes(e.tipo)).map((e) => e.tipo === 'xerife' ? `o Xerife ${e.xerife} atirou em ${e.alvo} e ${e.acertou ? 'acertou' : 'errou (morreu ele)'} (t${e.tique})` : e.tipo === 'morte_veneno' ? `${e.assassino} envenenou ${e.vitima} (caiu em ${nomeSala(e.sala)}, t${e.tique})` : `${e.assassino} matou ${e.vitima} (${nomeSala(e.sala)}, t${e.tique}${e.disfarce ? `, disfarçado de ${e.disfarce}` : ''}${e.escondido ? ', escondeu o corpo' : ''})`)
  const reun = log.reunioes.map((r) => `${r.tipo === 'corpo' ? `${r.chamador} achou ${r.corpo}` : `${r.chamador} chamou emergência`} → ${r.anulada ? 'o Juiz anulou' : r.expulso ? `${r.expulso} expulso (${r.papelExpulso})` : 'ninguém expulso'}`)
  return `Papéis: ${papeis}. Impostores (no fim): ${imps.join(', ')}. Mortes: ${mortes.join('; ') || 'nenhuma'}. Reuniões: ${reun.join(' | ') || 'nenhuma'}.${palhacoVenceu ? ` O Palhaço ${palhacoVenceu.cor} venceu (foi expulso).` : ''} Resultado: ${log.resultado.time === 'impostor' ? 'impostores venceram' : log.resultado.time === 'tripulante' ? 'tripulantes venceram' : 'empate'} (${log.resultado.motivo})`
}

async function guardarMemoria() {
  const resumo = resumoPublico()
  const reflexoes = Object.fromEntries(await Promise.all(jogadores.map(async (j) => {
    const prompt = `A PARTIDA ${NPARTIDA} ACABOU. Agora TODOS os papéis foram revelados.\nVocê era ${j.cor} (${j.papelOriginal ? `${j.papelOriginal}, recrutado pelo Gangster` : j.papel}, ${j.modelo}).\nO que aconteceu: ${resumo}\n\nNa próxima partida os papéis serão sorteados de novo, com os mesmos jogadores e cores. Escreva o que você vai lembrar: o que aprendeu, quem mentiu bem, quem acusou errado, em quem confiar ou desconfiar e por quê (2 a 3 frases, primeira pessoa). Responda SÓ com JSON: {"reflexao": "<texto>"}`
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
  console.log(`🚀 Among Us 3 · partida ${NPARTIDA} · seed=${SEED}${MOCK ? ' (MOCK)' : ''}`)
  for (const j of jogadores) console.log(`  ${j.cor.padEnd(9)} ${j.papel.padEnd(12)} ${j.modelo}`)
  snapshot()
  for (tique = 1; tique <= MAX_TIQUES; tique++) {
    const reuniao = await rodarTique()
    // trava: muitas respostas falhando = IAs "paradas" sem querer; a partida não vale, então para aqui
    if (uso.falhas > 15 && uso.falhas / uso.chamadas > 0.1) throw new Error(`muitas falhas de IA (${uso.falhas} de ${uso.chamadas}): partida interrompida`)
    const resumo = (log.tiques[tique]?.decisoes ?? []).filter((d) => !d.acao.startsWith('continuar') && !d.acao.startsWith('ir para') && d.acao !== 'ficar parado observando').map((d) => `${d.cor}: ${d.acao}${d.chat ? ` 💬"${d.chat}"` : ''}`)
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
  console.log(`🏁 ${log.resultado.time.toUpperCase()} venceu — ${log.resultado.motivo} (tique ${log.resultado.tique})${palhacoVenceu ? ` | 🤡 Palhaço ${palhacoVenceu.cor} venceu` : ''} | chamadas IA: ${uso.chamadas}, falhas: ${uso.falhas}`)
  console.log(`log: ${SAIDA}`)
}

main().catch((e) => { console.error(e); salvar(); process.exit(1) })
