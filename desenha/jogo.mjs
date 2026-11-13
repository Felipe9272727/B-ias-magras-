// DESENHA E ADIVINHA (ideia do Felipe: "coloquei IAs pra jogar Gartic"). Versão própria do canal: uma IA desenha a
// palavra secreta com traços (linhas, círculos, retângulos, polígonos numa tela 800x600) e as outras 9 veem a IMAGEM
// e chutam no chat. 2 rodadas (cada uma das 10 IAs desenha uma vez por rodada), 4 tiques por desenho:
//   tique 1: o desenhista faz o desenho; os outros veem e chutam. Tiques 2-4: o desenhista vê os chutes e pode completar
//   o desenho; dica: tracinhos com o tamanho da palavra, 1 letra no tique 3 e 2 letras no tique 4.
// Pontos: quem acerta primeiro leva 10, o segundo 9... (dentro do mesmo tique, vale quem respondeu antes);
// o desenhista leva 2 por acerto. Escrever a palavra no chat depois de já ter acertado custa 2 pontos.
// Rodada 1: normal (palavras fáceis/médias). Rodada 2: NO MÁXIMO 8 TRAÇOS no desenho inteiro (palavras difíceis).
// Uso: node jogo.mjs --saida logs/partida1.json [--semente N] [--mock] [--so N] (IA_DIRETO=1 e PONTE_ASSINATURA=1)
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { perguntar, lerJSON, uso } from '../amongus/ia.mjs'

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d }
const MOCK = process.argv.includes('--mock')
const SAIDA = path.resolve(arg('--saida', 'logs/teste.json'))
const PASTA = SAIDA.replace(/\.json$/, '')
fs.mkdirSync(PASTA, { recursive: true })
let semente = Number(arg('--semente', 7))
const rnd = () => ((semente = (semente * 1103515245 + 12345) % 2147483648) / 2147483648)
const embaralha = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

const ELENCO = [ // 10 IAs (pedido do Felipe: "pelo menos 10"), todas baratas e com visão (testadas com um desenho)
  ['Vermelho', 'haiku', 'Claude Haiku'], ['Azul', 'sonnet', 'Claude Sonnet'], ['Amarelo', 'or:openai/gpt-6-luna', 'GPT-6 Luna'],
  ['Rosa', 'or:xiaomi/mimo-v2.6-flash', 'MiMo V2.6 Flash'], ['Roxo', 'or:deepseek/deepseek-v4.1-flash-1017', 'DeepSeek V4.1 Flash'],
  ['Verde', 'or:minimax/minimax-m3.1-flash', 'MiniMax M3.1 Flash'], ['Ciano', 'or:nex-agi/nex-n2.6', 'Nex N2.6'],
  ['Laranja', 'or:qwen/qwen3.8-omni-flash', 'Qwen 3.8 Omni Flash'], ['Marrom', 'or:z-ai/glm-5.3-flashx', 'GLM 5.3 FlashX'],
  ['Lima', 'or:google/gemma-4-26b-a4b-it', 'Gemma 4 26B'], // o HY4 saiu (caro) e o Bonsai 9B também (pequeno demais): pedido do Felipe
]
// nomes de personagem (pedido do Felipe: não só cores); a cor fica para o visual e a voz
const NOMES = { Vermelho: 'Rabisco', Azul: 'Aquarela', Amarelo: 'Borrão', Rosa: 'Giz', Roxo: 'Pincel', Verde: 'Lápis', Ciano: 'Traço', Laranja: 'Tinta', Marrom: 'Carvão', Lima: 'Grafite' }
const N = (cor) => NOMES[cor] ?? cor
const jogadores = ELENCO.map(([cor, provider, modelo]) => ({ cor, nome: NOMES[cor], provider: MOCK ? 'mock' : provider, modelo }))
const RODADAS = [ // cada IA desenha uma vez por rodada
  { n: 1, regra: 'normal', palavras: ['banana', 'foguete', 'girafa', 'guarda-chuva', 'farol', 'astronauta', 'vulcão', 'sereia', 'pipoca', 'dinossauro'] },
  { n: 2, regra: 'NO MÁXIMO 8 TRAÇOS no desenho inteiro (somando todos os tiques)', palavras: ['saudade', 'engarrafamento', 'preguiça', 'eclipse', 'fofoca', 'pesadelo', 'churrasco', 'ressaca', 'carnaval', 'aniversário'] },
]
const PONTOS = [10, 9, 8, 7, 6, 5, 4, 3, 2] // 1º a acertar leva 10, o 2º 9... o desenhista leva 2 por acerto
const TIQUES = 4
const SO = Number(arg('--so', 99)) // --so N: só os N primeiros desenhos (teste)

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
function lev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length] }
const perto = (g, w) => { const a = norm(g), b = norm(w); return a && a !== b && (lev(a, b) <= (b.length >= 9 ? 2 : 1) || (a.length >= 4 && (b.includes(a) || a.includes(b)))) }
const semEmoji = (s) => String(s ?? '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{2B00}-\u{2BFF}]/gu, '').replace(/\s+/g, ' ').trim()
const REACOES = ['quase!', 'isso, continua!', 'nada a ver', 'olha o desenho de novo', 'tá esquentando', 'tá frio']
const censura = (txt, w) => { const r = new RegExp(norm(w).split('').join('[^a-z0-9]*'), 'i'); const t = String(txt ?? ''); const n = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); return r.test(n) ? { texto: n.replace(r, '*****'), vazou: true } : { texto: t, vazou: false } }
function dica(w, letras) { return [...w].map((c, i) => (c === '-' || c === ' ' ? c : letras.includes(i) ? c.toUpperCase() : '_')).join(' ') }

const log = { jogo: 'Desenha e Adivinha', jogadores, rodadas: RODADAS, desenhos: [], placar: Object.fromEntries(jogadores.map((j) => [j.cor, 0])), uso }
const salvar = () => fs.writeFileSync(SAIDA, JSON.stringify(log, null, 1))
const placarTxt = () => Object.entries(log.placar).sort((a, b) => b[1] - a[1]).map(([c, p]) => `${N(c)} ${p}`).join(' · ')

const REGRAS_DESENHO = `TELA: 800 de largura x 600 de altura, fundo branco, origem (0,0) no canto de cima à esquerda.
Traços que você pode usar (lista "tracos", na ordem em que vai desenhar):
 {"tipo":"linha","pontos":[[x,y],[x,y],...],"cor":"preto","espessura":6}   (linha livre passando pelos pontos, até 200 pontos)
 {"tipo":"circulo","centro":[x,y],"raio":50,"cor":"amarelo","preenchido":true,"espessura":5}
 {"tipo":"retangulo","de":[x,y],"ate":[x,y],"cor":"azul","preenchido":false,"espessura":5}
 {"tipo":"poligono","pontos":[[x,y],...],"cor":"verde","preenchido":true}
Cores: preto, branco, cinza, vermelho, laranja, amarelo, verde, azul, azul claro, roxo, rosa, marrom, pele.
PROIBIDO escrever letras, números ou palavras no desenho (como no jogo de verdade). Só desenho.`

async function chamar(j, prompt, imagens, mock) {
  const t0 = Date.now()
  const r = await perguntar(j.provider, 'Você está jogando um jogo de desenhar e adivinhar com outras IAs. Responda apenas com JSON válido.', prompt, { maxTokens: 4000, imagens, mock })
  return { resp: lerJSON(r.text) ?? {}, ms: Date.now() - t0, ok: r.ok && !!lerJSON(r.text) }
}

function mockDesenho() { return JSON.stringify({ pensamento: 'mock', tracos: Array.from({ length: 3 }, () => ({ tipo: 'circulo', centro: [100 + rnd() * 600, 100 + rnd() * 400], raio: 30 + rnd() * 80, cor: 'vermelho' })), chat: 'vai que vai' }) }
const mockChute = (w) => () => JSON.stringify({ pensamento: 'mock', palpite: rnd() < 0.3 ? w : ['gato', 'casa', 'sol'][Math.floor(rnd() * 3)], chat: 'hmm' })

async function turno(rodada, desenhista, palavra, idx) {
  const D = { n: idx, rodada: rodada.n, regra: rodada.regra, desenhista: desenhista.cor, palavra, tiques: [], acertos: [], vazamentos: [] }
  log.desenhos.push(D)
  const tracos = []
  const chat = [] // {tique, cor, texto}
  const letras = embaralha([...palavra].map((c, i) => (c === '-' || c === ' ' ? -1 : i)).filter((i) => i >= 0)).slice(0, 2)
  const outros = jogadores.filter((j) => j !== desenhista)
  console.log(`\n== desenho ${idx}: ${desenhista.cor} desenha "${palavra}" (rodada ${rodada.n}: ${rodada.regra})`)
  for (let t = 1; t <= TIQUES; t++) {
    const reg = { tique: t, novos: [], chatDesenhista: null, pensamentoDesenhista: null, palpites: [], dica: dica(palavra, t >= 4 ? letras : t >= 3 ? letras.slice(0, 1) : []) }
    // 1) desenhista
    const resta = rodada.regra.startsWith('NO MÁXIMO 8') ? 8 - tracos.length : t === 1 ? 30 : 12
    const imgAntes = path.join(PASTA, `d${String(idx).padStart(2, '0')}_t${t}_antes.png`)
    if (resta > 0) {
      let imgs = null
      if (tracos.length) { fs.writeFileSync(imgAntes + '.json', JSON.stringify(tracos)); execFileSync('python3', [path.join(import.meta.dirname, 'raster.py'), imgAntes + '.json', imgAntes]); imgs = [imgAntes] }
      const hist = chat.length ? `\nChat até agora (chutes e conversa):\n${chat.map((m) => `[tique ${m.tique}] ${N(m.cor)}${m.desenhista ? ' (desenhista)' : ''}: ${m.texto}`).join('\n')}` : ''
      const certos = D.acertos.map((a) => a.cor)
      const p = `Você é o jogador ${desenhista.nome}. É a SUA VEZ DE DESENHAR. Palavra secreta: "${palavra.toUpperCase()}".
Os outros (${outros.map((o) => o.nome).join(', ')}) veem só o desenho e chutam no chat. Você ganha 2 pontos por cada um que acertar.
Rodada ${rodada.n} de ${RODADAS.length} · regra da rodada: ${rodada.regra}. Tique ${t} de ${TIQUES}${t === 1 ? ' (faça o desenho agora)' : ' (você pode completar o desenho com mais traços para ajudar)'}.
Placar: ${placarTxt()}. ${certos.length ? `Já acertaram: ${certos.map(N).join(', ')}.` : 'Ninguém acertou ainda.'}${hist}
${tracos.length ? `A imagem anexada é o seu desenho como os outros estão vendo agora (${tracos.length} traços).` : ''}
${REGRAS_DESENHO}
Você pode mandar até ${resta} traço(s) novo(s) agora${rodada.regra.startsWith('NO MÁXIMO 8') ? ' (o limite é do desenho INTEIRO)' : ''}. ${t === 1 ? 'No tique 1 você só desenha.' : `Você NÃO pode escrever no chat (dica escrita é proibida), só mandar UMA reação desta lista ou nenhuma: ${REACOES.map((x) => `"${x}"`).join(', ')}.`}
Responda JSON: {"pensamento":"o que você está pensando (só você vê)","tracos":[...]${t === 1 ? '' : ',"reacao":"uma da lista ou vazio"'}}`
      const { resp, ok } = await chamar(desenhista, p, imgs, mockDesenho)
      let novos = (Array.isArray(resp.tracos) ? resp.tracos : []).filter((x) => x && typeof x === 'object').slice(0, resta)
      if (rodada.regra.startsWith('SÓ CANETA')) { reg.tentouCor = novos.some((x) => x.cor && norm(x.cor) !== 'preto'); novos = novos.map((x) => ({ ...x, cor: 'preto' })) }
      tracos.push(...novos)
      reg.novos = novos; reg.pensamentoDesenhista = resp.pensamento ?? null; reg.falhouDesenhista = !ok
      const reac = t > 1 && REACOES.find((x) => norm(x) === norm(resp.reacao))
      if (reac) { reg.chatDesenhista = reac; chat.push({ tique: t, cor: desenhista.cor, desenhista: true, texto: reac }) }
      else if (resp.reacao || resp.chat) reg.reacaoInvalida = semEmoji(resp.reacao || resp.chat)
    }
    const img = path.join(PASTA, `d${String(idx).padStart(2, '0')}_t${t}.png`)
    fs.writeFileSync(img + '.json', JSON.stringify(tracos)); execFileSync('python3', [path.join(import.meta.dirname, 'raster.py'), img + '.json', img])
    reg.imagem = path.relative(path.dirname(SAIDA), img); reg.totalTracos = tracos.length
    // 2) quem adivinha (todos ao mesmo tempo; dentro do tique, vale a ordem de quem respondeu antes)
    const hist = chat.length ? `\nChat até agora:\n${chat.map((m) => `[tique ${m.tique}] ${N(m.cor)}${m.desenhista ? ' (desenhista)' : ''}: ${m.texto}`).join('\n')}` : '\nChat vazio por enquanto.'
    const resps = await Promise.all(outros.map(async (j) => {
      const jaAcertou = D.acertos.some((a) => a.cor === j.cor)
      const p = `Você é o jogador ${j.nome}. Quem desenha agora é o ${desenhista.nome}. A imagem anexada é o desenho dele (tique ${t} de ${TIQUES}).
Rodada ${rodada.n} de ${RODADAS.length} · regra da rodada: ${rodada.regra}. Placar: ${placarTxt()}.
Dica: ${reg.dica} (${[...palavra].filter((c) => c !== '-' && c !== ' ').length} letras)${hist}
${jaAcertou ? 'Você JÁ ACERTOU esta palavra. Agora só pode conversar no chat (se escrever a palavra, ela é censurada e você perde 2 pontos).' : `Chute UMA palavra (em português). Acertar primeiro dá 10 pontos, o segundo 9, o terceiro 8 e assim por diante. Errar não tira ponto.${reg.perto?.[j.cor] ? '' : ''}`}
Responda JSON: {"pensamento":"o que você acha que é o desenho e por quê (só você vê)",${jaAcertou ? '' : '"palpite":"uma palavra",'}"chat":"mensagem curta no chat (opcional)"}`
      const r = await chamar(j, p, [img], mockChute(palavra))
      return { j, jaAcertou, ...r }
    }))
    resps.sort((a, b) => a.ms - b.ms)
    for (const { j, jaAcertou, resp, ms, ok } of resps) {
      const e = { cor: j.cor, ms, pensamento: resp.pensamento ?? null, palpite: jaAcertou ? null : resp.palpite ?? null, chat: null, acertou: false, perto: false, falhou: !ok }
      if (!jaAcertou && e.palpite) {
        if (norm(e.palpite) === norm(palavra)) {
          e.acertou = true
          const pts = PONTOS[D.acertos.length] ?? 2
          D.acertos.push({ cor: j.cor, tique: t, pontos: pts }); log.placar[j.cor] += pts; log.placar[desenhista.cor] += 2
          chat.push({ tique: t, cor: j.cor, texto: '(ACERTOU!)' })
        } else {
          e.perto = perto(e.palpite, palavra)
          chat.push({ tique: t, cor: j.cor, texto: `chutou "${e.palpite}"${e.perto ? ' (ESTÁ PERTO!)' : ''}` })
        }
      }
      if (semEmoji(resp.chat)) {
        const c = censura(semEmoji(resp.chat), palavra)
        e.chat = c.texto
        // comemorar com a palavra no mesmo chute em que acertou não é vazamento (só é censurado); já tinha acertado antes: -2
        if (c.vazou && jaAcertou) { log.placar[j.cor] -= 2; D.vazamentos.push({ tique: t, cor: j.cor, original: resp.chat }) }
        chat.push({ tique: t, cor: j.cor, texto: c.texto })
      }
      reg.palpites.push(e)
    }
    D.tiques.push(reg)
    console.log(`  t${t} [${tracos.length} traços] ${reg.chatDesenhista ? `${desenhista.cor}: "${reg.chatDesenhista}" | ` : ''}${reg.palpites.map((x) => `${x.cor}:${x.palpite ?? '-'}${x.acertou ? ' OK' : x.perto ? ' (perto)' : ''}`).join('  ')}`)
    const gasto = Object.values(uso.custo ?? {}).reduce((a, b) => a + b, 0)
    salvar()
    if (gasto > Number(process.env.ORCAMENTO_USD ?? 1.5)) throw new Error(`teto de gasto atingido: US$ ${gasto.toFixed(3)}`)
    if (D.acertos.length === outros.length) break // todo mundo acertou: o desenho acaba antes
  }
  D.tracos = tracos
  console.log(`  -> acertos: ${D.acertos.map((a) => `${a.cor}(t${a.tique},+${a.pontos})`).join(' ') || 'ninguém'} · placar: ${placarTxt()}`)
  salvar()
}

let idx = 0
for (const rodada of RODADAS) {
  const ordem = embaralha(jogadores)
  const pals = embaralha(rodada.palavras)
  for (let i = 0; i < ordem.length; i++) {
    if (++idx > SO) break
    await turno(rodada, ordem[i], pals[i], idx)
  }
}
log.fim = { placar: log.placar, gasto: Object.values(uso.custo ?? {}).reduce((a, b) => a + b, 0) }
salvar()
console.log(`\nFIM · placar: ${placarTxt()} · US$ ${log.fim.gasto.toFixed(3)} · ${uso.chamadas} chamadas, ${uso.falhas} falhas`)
