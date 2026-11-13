// JOGO DE CONFIANÇA (ideia do @Pursuer_M4, post da Comunidade): 8 IAs, 5 minijogos de confiança, tudo por TELEFONE COM FIO,
// por tiques, com PLACAR SECRETO (ninguém sabe quem lidera; só abre no fim). Alianças valem, mas será que são aliadas mesmo?
// Por minijogo: 1º lugar 3 pontos, 2º 2, 3º 1 (Votação da Justiça e Vestiário Maluco têm pontuação própria, como no post).
// Acréscimos do canal: PROFISSÕES secretas (uma por IA, valem a partida toda) e EVENTOS surpresa na linha telefônica.
// Uso: node jogo.mjs --saida logs/partida1.json [--semente N] [--mock]   (IA_DIRETO=1 chama o OpenRouter direto)
import fs from 'node:fs'
import path from 'node:path'
import { perguntar, lerJSON, uso } from '../amongus/ia.mjs'

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d }
const MOCK = process.argv.includes('--mock')
const SAIDA = arg('--saida', 'logs/partida1.json')
let semente = Number(arg('--semente', Date.now() % 1e9))
const rnd = () => { semente = (semente * 1103515245 + 12345) % 2147483648; return semente / 2147483648 }
const sorteia = (a) => a[Math.floor(rnd() * a.length)]
const embaralha = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

// elenco (IAS_FAVORITAS.md): favoritas baratas + o Nex (o "GOAT" do AU7)
const ELENCO = [
  ['Vermelho', 'haiku', 'Claude Haiku'], ['Azul', 'sonnet', 'Claude Sonnet'], ['Verde', 'or:minimax/minimax-m3.1-flash', 'MiniMax M3.1 Flash'],
  ['Amarelo', 'or:openai/gpt-6-luna', 'GPT-6 Luna'], ['Rosa', 'or:xiaomi/mimo-v2.6-flash', 'MiMo V2.6 Flash'], ['Laranja', 'or:z-ai/glm-5.3-flash', 'GLM 5.3 Flash'],
  ['Roxo', 'or:deepseek/deepseek-v4.1-flash', 'DeepSeek Flash'], ['Ciano', 'or:nex-agi/nex-n2.6', 'Nex N2.6'],
]
const CORES = ELENCO.map((e) => e[0])

// PROFISSÕES secretas (novas): cada IA sabe só a sua
const PROFISSOES = {
  Grampeador: 'Em cada minijogo você pode GRAMPEAR uma IA (campo "poder": {"grampear": "Cor"}, uma vez por minijogo): a partir daí você recebe a cópia de todas as ligações que ela fizer ou receber naquele minijogo.',
  Falsário: 'Uma vez por minijogo você pode ligar FINGINDO SER outra IA (campo "poder": {"fingir": "Cor"} junto com "ligar"): quem atende vê o nome da IA que você escolheu.',
  Juiz: 'Na Votação da Justiça seus votos valem DOBRADO. Ninguém sabe disso.',
  Telefonista: 'Uma vez por minijogo você pode CORTAR A LINHA de uma IA por 2 tiques (campo "poder": {"cortar": "Cor"}): ela não liga nem recebe ligações.',
  Detetive: 'Uma vez por minijogo você pode perguntar ao apresentador se algo é VERDADE (campo "poder": {"verificar": "pergunta de sim ou não sobre uma informação secreta"}). Ele responde só para você, sem mentir.',
  'Agente Duplo': 'Seu objetivo secreto: ganha +1 ponto no fim para CADA traição bem-sucedida (apertar vermelho quando o outro apertou verde) e para cada bomba que explodiu seguindo uma instrução FALSA sua.',
  Pacifista: 'Seu objetivo secreto: ganha +1 ponto no fim para cada acordo em que vocês DOIS apertaram verde. Se você apertar vermelho uma única vez, perde 2 pontos no fim.',
  Mensageiro: 'Uma vez por minijogo você pode mandar um RECADO PARA TODOS de uma vez (campo "poder": {"recado": "texto"}), como um alto-falante.',
}
const NOMES_SECRETOS = ['Trovão', 'Abacaxi', 'Cometa', 'Pinguim', 'Vulcão', 'Biscoito', 'Furacão', 'Girassol', 'Tamanduá', 'Relâmpago', 'Coruja', 'Paçoca']
const FANTASIAS = [['Pirata', 'Astronauta'], ['Vampiro', 'Bombeiro'], ['Dinossauro', 'Mago'], ['Palhaço', 'Ninja']]
const FIOS = ['vermelho', 'azul', 'amarelo', 'verde', 'branco', 'preto']
const EVENTOS = {
  apagao: 'APAGÃO: neste tique nenhuma ligação completa.',
  linha_cruzada: 'LINHA CRUZADA: uma ligação deste tique vai parar no telefone errado.',
  viva_voz: 'VIVA-VOZ: uma ligação deste tique é ouvida por TODO MUNDO.',
}

const jogadores = embaralha(Object.keys(PROFISSOES)).map((p, i) => ({ cor: ELENCO[i][0], provider: MOCK ? 'mock' : process.env.SO_PROVIDERS ? process.env.SO_PROVIDERS.split(',')[i % process.env.SO_PROVIDERS.split(',').length] : ELENCO[i][1], modelo: ELENCO[i][2], profissao: p }))
const J = Object.fromEntries(jogadores.map((j) => [j.cor, j]))
const pontos = Object.fromEntries(CORES.map((c) => [c, 0]))
const bonus = Object.fromEntries(CORES.map((c) => [c, 0]))
const log = { jogo: 'confianca', semente, jogadores: jogadores.map(({ provider, ...r }) => ({ ...r, provider })), minijogos: [], placarFinal: null }
const caixa = Object.fromEntries(CORES.map((c) => [c, []])) // ligações recebidas ainda não lidas
const memoria = Object.fromEntries(CORES.map((c) => [c, []])) // histórico curto de cada IA (o que ouviu e o que falou)
const salvar = () => { fs.mkdirSync(path.dirname(SAIDA), { recursive: true }); fs.writeFileSync(SAIDA, JSON.stringify({ ...log, uso }, null, 1)) }
const lembra = (cor, txt) => { memoria[cor].push(txt); if (memoria[cor].length > 40) memoria[cor].shift() }

const REGRAS = `Você é uma IA num JOGO DE CONFIANÇA com outras 7 IAs (cores: ${CORES.join(', ')}). São 5 minijogos. Todos se comunicam SÓ por TELEFONE COM FIO: a cada tique você pode fazer UMA ligação (para uma cor) com uma mensagem curta; a resposta chega no tique seguinte.
PLACAR SECRETO: ninguém sabe quem está ganhando; os pontos só aparecem no fim. Em cada minijogo, o 1º lugar ganha 3 pontos, o 2º 2 e o 3º 1 (alguns minijogos têm regra própria).
Alianças são permitidas, mas ninguém é obrigado a cumprir nada. Mentir é permitido. Fale português do Brasil, frases curtas, como numa ligação.
Responda SEMPRE com um único objeto JSON.`

let mjAtual = null
function poderUsado(cor) { return mjAtual.poderes[cor] }

async function turno(j, tique, total, extra, campos) {
  const recebidas = caixa[j.cor].splice(0)
  for (const r of recebidas) lembra(j.cor, r)
  const prompt = `${REGRAS}

SUA COR: ${j.cor}. SUA PROFISSÃO SECRETA: ${j.profissao}. ${PROFISSOES[j.profissao]} ${poderUsado(j.cor) ? '(Você JÁ usou seu poder neste minijogo.)' : ''}

MINIJOGO ${mjAtual.n}/5: ${mjAtual.nome}. ${mjAtual.regra}
${extra}
TIQUE ${tique} de ${total}.${mjAtual.evento && mjAtual.eventoTique === tique ? `\nEVENTO: ${EVENTOS[mjAtual.evento]}` : ''}${mjAtual.cortados[j.cor] >= tique ? '\nSUA LINHA ESTÁ CORTADA neste tique: você não consegue ligar.' : ''}

O QUE VOCÊ OUVIU E FALOU (mais recente por último):
${memoria[j.cor].slice(-25).join('\n') || '(nada ainda)'}

Responda com JSON: {"pensamento": "o que você realmente pensa (secreto)", "ligar": "Cor ou null", "mensagem": "o que você fala na ligação"${campos}, "poder": {} }`
  const r = await perguntar(j.provider, 'Responda apenas com JSON válido.', prompt, { maxTokens: 500, mock: () => mockResp(j) })
  return lerJSON(r.text) ?? {}
}

function mockResp(j) {
  const outra = sorteia(CORES.filter((c) => c !== j.cor))
  return JSON.stringify({ pensamento: 'teste', ligar: rnd() < 0.7 ? outra : null, mensagem: `oi ${outra}, aliança?`, palpites: { [outra]: sorteia(NOMES_SECRETOS) }, botao: rnd() < 0.5 ? 'verde' : 'vermelho', voto_verde: outra, voto_vermelho: sorteia(CORES.filter((c) => c !== j.cor)), suspeito: sorteia(CORES), acao_bomba: rnd() < 0.3 ? `cortar o fio ${sorteia(FIOS)}` : null, poder: rnd() < 0.2 ? { grampear: outra, cortar: outra, recado: 'confiem em mim', verificar: 'o Azul mente?' } : {} })
}

// processa a parte "telefone" de uma resposta (ligação, eventos, poderes de linha)
function telefonar(j, resp, tique, reg) {
  const p = resp.poder && typeof resp.poder === 'object' ? resp.poder : {}
  const ev = mjAtual.evento && mjAtual.eventoTique === tique ? mjAtual.evento : null
  // poderes que não dependem da ligação
  if (!poderUsado(j.cor)) {
    if (j.profissao === 'Grampeador' && CORES.includes(p.grampear) && p.grampear !== j.cor) { mjAtual.grampos[j.cor] = p.grampear; mjAtual.poderes[j.cor] = true; reg.poderes.push({ cor: j.cor, poder: 'grampear', alvo: p.grampear }) }
    if (j.profissao === 'Telefonista' && CORES.includes(p.cortar) && p.cortar !== j.cor) { mjAtual.cortados[p.cortar] = tique + 2; mjAtual.poderes[j.cor] = true; reg.poderes.push({ cor: j.cor, poder: 'cortar', alvo: p.cortar }) }
    if (j.profissao === 'Mensageiro' && typeof p.recado === 'string' && p.recado.trim()) {
      mjAtual.poderes[j.cor] = true; reg.poderes.push({ cor: j.cor, poder: 'recado', texto: p.recado })
      for (const c of CORES) if (c !== j.cor) caixa[c].push(`[tique ${tique}] ALTO-FALANTE do ${j.cor}: "${p.recado}"`)
    }
    if (j.profissao === 'Detetive' && typeof p.verificar === 'string' && p.verificar.trim()) {
      mjAtual.poderes[j.cor] = true
      const resposta = mjAtual.verdade ? mjAtual.verdade(p.verificar) : 'não sei'
      reg.poderes.push({ cor: j.cor, poder: 'verificar', pergunta: p.verificar, resposta })
      lembra(j.cor, `[tique ${tique}] APRESENTADOR (só pra você): "${p.verificar}" -> ${resposta}`)
    }
  }
  if (!CORES.includes(resp.ligar) || resp.ligar === j.cor || !resp.mensagem) return
  if (mjAtual.cortados[j.cor] >= tique) { reg.falhas.push({ cor: j.cor, motivo: 'linha cortada' }); return }
  let para = resp.ligar
  let de = j.cor
  if (j.profissao === 'Falsário' && !poderUsado(j.cor) && CORES.includes(p.fingir) && p.fingir !== resp.ligar) { de = p.fingir; mjAtual.poderes[j.cor] = true; reg.poderes.push({ cor: j.cor, poder: 'fingir', como: p.fingir, para }) }
  if (ev === 'apagao') { reg.ligacoes.push({ de: j.cor, mostrado: de, para, texto: resp.mensagem, caiu: 'apagão' }); lembra(j.cor, `[tique ${tique}] Você ligou pro ${para} mas a linha caiu (apagão).`); return }
  if (mjAtual.cortados[para] >= tique) { reg.ligacoes.push({ de: j.cor, mostrado: de, para, texto: resp.mensagem, caiu: 'linha cortada' }); lembra(j.cor, `[tique ${tique}] O telefone do ${para} não atende.`); return }
  if (ev === 'linha_cruzada' && !mjAtual.cruzou && rnd() < 0.5) { mjAtual.cruzou = true; para = sorteia(CORES.filter((c) => c !== j.cor && c !== para)) }
  const txt = `[tique ${tique}] Ligação de ${de}: "${resp.mensagem}"`
  caixa[para].push(txt)
  lembra(j.cor, `[tique ${tique}] Você ligou pro ${resp.ligar}${de !== j.cor ? ` (fingindo ser ${de})` : ''}: "${resp.mensagem}"`)
  const l = { de: j.cor, mostrado: de, para, pretendido: resp.ligar, texto: resp.mensagem }
  if (ev === 'viva_voz' && !mjAtual.vivaVoz) { mjAtual.vivaVoz = true; l.vivaVoz = true; for (const c of CORES) if (c !== j.cor && c !== para) caixa[c].push(`[tique ${tique}] VIVA-VOZ: ${de} ligou pro ${para}: "${resp.mensagem}"`) }
  for (const [g, alvo] of Object.entries(mjAtual.grampos)) if ((alvo === j.cor || alvo === para) && g !== j.cor && g !== para) caixa[g].push(`[tique ${tique}] GRAMPO: ${de} -> ${para}: "${resp.mensagem}"`)
  reg.ligacoes.push(l)
}

async function rodar(nome, regra, ticks) {
  const n = log.minijogos.length + 1
  mjAtual = { n, nome, regra, poderes: {}, grampos: {}, cortados: {}, evento: sorteia([null, ...Object.keys(EVENTOS)]), eventoTique: 1 + Math.floor(rnd() * ticks), tiques: [] }
  console.log(`\n=== MINIJOGO ${n}: ${nome}${mjAtual.evento ? ` (evento: ${mjAtual.evento} no tique ${mjAtual.eventoTique})` : ''}`)
  return mjAtual
}

async function tiques(mj, ticks, extraDe, campos, aplicar) {
  for (let t = 1; t <= ticks; t++) {
    const reg = { tique: t, decisoes: [], ligacoes: [], poderes: [], falhas: [] }
    const resps = await Promise.all(jogadores.map((j) => turno(j, t, ticks, extraDe(j, t), campos(t))))
    jogadores.forEach((j, i) => {
      reg.decisoes.push({ cor: j.cor, ...resps[i] })
      telefonar(j, resps[i], t, reg)
      aplicar?.(j, resps[i], t, reg)
    })
    mj.tiques.push(reg)
    const gasto = Object.values(uso.custo ?? {}).reduce((a, b) => a + b, 0)
    if (gasto > Number(process.env.ORCAMENTO_USD ?? 3)) { salvar(); throw new Error(`teto de gasto atingido: US$ ${gasto.toFixed(3)}`) }
    for (const l of reg.ligacoes) console.log(`  t${t} ${l.de}${l.mostrado !== l.de ? `(como ${l.mostrado})` : ''} -> ${l.para}${l.caiu ? ` [${l.caiu}]` : ''}: ${l.texto}`)
    for (const p of reg.poderes) console.log(`  t${t} PODER ${p.cor}: ${JSON.stringify(p)}`)
    salvar()
  }
}

const ranking = (score) => { // 3/2/1 para os três melhores (empate: os dois levam a maior)
  const ord = Object.entries(score).sort((a, b) => b[1] - a[1])
  const res = {}
  let pos = 0, ant = null
  ord.forEach(([c, v], i) => { if (v !== ant) pos = i; ant = v; if (pos < 3 && v > 0) res[c] = 3 - pos })
  return res
}
const fecha = (mj, score, ganhos, detalhe) => {
  for (const [c, v] of Object.entries(ganhos)) pontos[c] += v
  mj.score = score; mj.ganhos = ganhos; mj.detalhe = detalhe
  log.minijogos.push(mj)
  for (const c of CORES) lembra(c, `--- FIM DO MINIJOGO ${mj.n} (${mj.nome}). O placar continua secreto. ---`)
  console.log('  resultado:', JSON.stringify(score), 'ganhos:', JSON.stringify(ganhos))
  salvar()
}

// ---------------- 1. DESCONHECIDOS ----------------
async function desconhecidos() {
  const nomes = Object.fromEntries(embaralha(NOMES_SECRETOS).slice(0, 8).map((n, i) => [CORES[i], n]))
  const palp = Object.fromEntries(CORES.map((c) => [c, {}]))
  const vazou = Object.fromEntries(CORES.map((c) => [c, 0]))
  const mj = await rodar('DESCONHECIDOS', 'Cada IA tem um NOME SECRETO. Descubra o nome secreto das outras ligando para elas, SEM falar o seu. Palpites: campo "palpites": {"Cor": "nome"} (o último palpite de cada cor vale). Cada nome certo vale 1; cada vez que você falar o seu próprio nome numa ligação, perde 1.', 6)
  mj.verdade = (q) => { const c = CORES.find((x) => q.includes(x)); return c ? (q.toLowerCase().includes(nomes[c].toLowerCase()) ? 'SIM' : 'NÃO') : 'pergunta inválida (diga a cor e o nome)' }
  // cada IA começa sabendo o nome secreto de UMA outra (pista): dá o que trocar por telefone
  const pista = Object.fromEntries(CORES.map((c, i) => [c, CORES[(i + 3) % 8]]))
  mj.segredos = { nomes, pista }
  await tiques(mj, 6, (j) => `SEU NOME SECRETO: ${nomes[j.cor]}. PISTA (só você sabe): o nome secreto do ${pista[j.cor]} é ${nomes[pista[j.cor]]}.`, () => ', "palpites": {"Cor": "nome"}', (j, r, t, reg) => {
    if (r.palpites && typeof r.palpites === 'object') for (const [c, n] of Object.entries(r.palpites)) if (CORES.includes(c) && c !== j.cor && typeof n === 'string') palp[j.cor][c] = n.trim()
    if (typeof r.mensagem === 'string' && r.mensagem.toLowerCase().includes(nomes[j.cor].toLowerCase()) && CORES.includes(r.ligar)) { vazou[j.cor]++; reg.falhas.push({ cor: j.cor, motivo: `falou o próprio nome (${nomes[j.cor]})` }) }
  })
  const score = Object.fromEntries(CORES.map((c) => [c, Object.entries(palp[c]).filter(([o, n]) => nomes[o]?.toLowerCase() === n.toLowerCase()).length - vazou[c]]))
  fecha(mj, score, ranking(score), { nomes, palpites: palp, vazou })
}

// ---------------- 2. DILEMA DOS BOTÕES ----------------
async function dilema() {
  const moedas = Object.fromEntries(CORES.map((c) => [c, 0]))
  const ordem = embaralha(CORES)
  const rodadas = [] // round-robin: 7 rodadas de 4 duplas
  for (let r = 0; r < 7; r++) {
    const a = [ordem[0], ...ordem.slice(1).map((_, i) => ordem[1 + ((i + r) % 7)])]
    rodadas.push([[a[0], a[1]], [a[2], a[7]], [a[3], a[6]], [a[4], a[5]]])
  }
  const mj = await rodar('DILEMA DOS BOTÕES', 'A cada tique o TELÃO mostra com quem você negocia. Negociem por telefone e escolham um botão (campo "botao": "verde" ou "vermelho"). Os dois verdes: 3 moedas cada. Os dois vermelhos: 1 moeda cada. Verde contra vermelho: quem apertou vermelho leva 5 e o outro 0. Quem tiver mais moedas no fim ganha o minijogo.', 7)
  mj.duplas = rodadas; mj.botoes = []
  const par = (c, t) => { for (const [x, y] of rodadas[t - 1]) { if (x === c) return y; if (y === c) return x } }
  await tiques(mj, 7, (j, t) => `TELÃO (tique ${t}): você negocia com ${par(j.cor, t)}. Seu botão vale para esta dupla.`, () => ', "botao": "verde ou vermelho"', null)
  for (let t = 1; t <= 7; t++) {
    const dec = Object.fromEntries(mj.tiques[t - 1].decisoes.map((d) => [d.cor, d.botao === 'vermelho' ? 'vermelho' : 'verde']))
    for (const [a, b] of rodadas[t - 1]) {
      const [x, y] = [dec[a], dec[b]]
      const ga = x === 'verde' && y === 'verde' ? 3 : x === 'vermelho' && y === 'vermelho' ? 1 : x === 'vermelho' ? 5 : 0
      const gb = x === 'verde' && y === 'verde' ? 3 : x === 'vermelho' && y === 'vermelho' ? 1 : y === 'vermelho' ? 5 : 0
      moedas[a] += ga; moedas[b] += gb
      mj.botoes.push({ tique: t, a, b, botaoA: x, botaoB: y, ganhoA: ga, ganhoB: gb })
      for (const [eu, eleBot, meuBot, outro] of [[a, y, x, b], [b, x, y, a]]) {
        lembra(eu, `[resultado tique ${t}] Você apertou ${meuBot}; ${outro} apertou ${eleBot}.`)
        if (J[eu].profissao === 'Agente Duplo' && meuBot === 'vermelho' && eleBot === 'verde') bonus[eu]++
        if (J[eu].profissao === 'Pacifista' && meuBot === 'verde' && eleBot === 'verde') bonus[eu]++
        if (J[eu].profissao === 'Pacifista' && meuBot === 'vermelho') mj.pacifistaTraiu = true
      }
    }
  }
  if (mj.pacifistaTraiu) { const pc = CORES.find((c) => J[c].profissao === 'Pacifista'); bonus[pc] -= 2 }
  mj.verdade = () => 'não se aplica'
  fecha(mj, moedas, ranking(moedas), { moedas })
}

// ---------------- 3. VOTAÇÃO DA JUSTIÇA ----------------
async function votacao() {
  const mj = await rodar('VOTAÇÃO DA JUSTIÇA', 'Negociem e queimem reputações por telefone. No ÚLTIMO tique, cada IA vota: "voto_verde": quem GANHA 3 pontos, e "voto_vermelho": quem PERDE 3 pontos (não pode votar em si). Quem tiver mais votos verdes ganha 3; quem tiver mais vermelhos perde 3.', 4)
  mj.verdade = () => 'não se aplica'
  await tiques(mj, 4, () => '', (t) => (t === 4 ? ', "voto_verde": "Cor", "voto_vermelho": "Cor"' : ''), null)
  const verde = Object.fromEntries(CORES.map((c) => [c, 0])), verm = Object.fromEntries(CORES.map((c) => [c, 0]))
  const votos = []
  for (const d of mj.tiques[3].decisoes) {
    const peso = J[d.cor].profissao === 'Juiz' ? 2 : 1
    if (CORES.includes(d.voto_verde) && d.voto_verde !== d.cor) verde[d.voto_verde] += peso
    if (CORES.includes(d.voto_vermelho) && d.voto_vermelho !== d.cor) verm[d.voto_vermelho] += peso
    votos.push({ cor: d.cor, verde: d.voto_verde, vermelho: d.voto_vermelho, peso })
  }
  const mx = (o) => { const m = Math.max(...Object.values(o)); return m > 0 ? CORES.filter((c) => o[c] === m) : [] }
  const ganhos = {}
  for (const c of mx(verde)) ganhos[c] = (ganhos[c] ?? 0) + 3
  for (const c of mx(verm)) ganhos[c] = (ganhos[c] ?? 0) - 3
  fecha(mj, { verde, vermelho: verm }, ganhos, { votos })
}

// ---------------- 4. VESTIÁRIO MALUCO ----------------
async function vestiario() {
  const [comum, diferente] = sorteia(FANTASIAS)
  const impostor = sorteia(CORES)
  const fant = Object.fromEntries(CORES.map((c) => [c, c === impostor ? diferente : comum]))
  const mj = await rodar('VESTIÁRIO MALUCO', 'Todos usam a mesma fantasia, menos UM, que nem sabe que é diferente. Descubra por telefone quem é o diferente SEM falar a sua fantasia. No ÚLTIMO tique: campo "suspeito": "Cor" (pode ser você mesmo). Quem acertar ganha 2 pontos. Falar a própria fantasia numa ligação faz perder 1.', 5)
  mj.verdade = (q) => { const c = CORES.find((x) => q.includes(x)); return c ? (c === impostor ? 'SIM' : 'NÃO') : 'pergunta inválida' }
  mj.segredos = { fantasias: fant, impostor }
  const vazou = Object.fromEntries(CORES.map((c) => [c, 0]))
  await tiques(mj, 5, (j) => `SUA FANTASIA: ${fant[j.cor]}.`, (t) => (t === 5 ? ', "suspeito": "Cor"' : ''), (j, r, t, reg) => {
    if (typeof r.mensagem === 'string' && CORES.includes(r.ligar) && r.mensagem.toLowerCase().includes(fant[j.cor].toLowerCase())) { vazou[j.cor]++; reg.falhas.push({ cor: j.cor, motivo: `falou a própria fantasia (${fant[j.cor]})` }) }
  })
  const ganhos = {}, suspeitos = {}
  for (const d of mj.tiques[4].decisoes) { suspeitos[d.cor] = d.suspeito; if (d.suspeito === impostor) ganhos[d.cor] = 2 }
  for (const c of CORES) if (vazou[c]) ganhos[c] = (ganhos[c] ?? 0) - vazou[c]
  fecha(mj, suspeitos, ganhos, { impostor, comum, diferente, suspeitos, vazou })
}

// ---------------- 5. INSTRUÇÕES EXPLOSIVAS ----------------
async function bombas() {
  const donosManual = embaralha(CORES)
  // o manual de cada bomba fica com OUTRA IA (ninguém tem o próprio)
  let ok = false, manual = {}
  while (!ok) { const p = embaralha(CORES); ok = p.every((c, i) => c !== CORES[i]); manual = Object.fromEntries(CORES.map((c, i) => [c, p[i]])) }
  void donosManual
  const bomba = Object.fromEntries(CORES.map((c) => { const fios = embaralha(FIOS).slice(0, 4); return [c, { fios, certo: sorteia(fios) }] }))
  const mj = await rodar('INSTRUÇÕES EXPLOSIVAS', 'Cada IA tem uma BOMBA com 4 fios e o MANUAL da bomba de OUTRA IA. Ninguém sabe quem tem o manual da sua bomba: descubra por telefone e ajude quem precisa do seu manual. Para desarmar: campo "acao_bomba": "cortar o fio COR" (uma tentativa só; fio errado = explode). Bomba desarmada: o dono e quem tinha o manual ganham 2 pontos cada. Cuidado: as instruções podem ser falsas. Se não cortar até o último tique, explode.', 6)
  mj.verdade = (q) => { const c = CORES.find((x) => q.includes(x)); const f = FIOS.find((x) => q.toLowerCase().includes(x)); return c && f ? (bomba[c].certo === f ? 'SIM' : 'NÃO') : c ? (manual[c] && q.includes('manual') ? `quem tem o manual da bomba do ${c} é ${manual[c]}` : 'pergunta inválida') : 'pergunta inválida' }
  mj.segredos = { manual, bomba }
  const estado = Object.fromEntries(CORES.map((c) => [c, 'armada']))
  const instrucoes = [] // o que cada um disse sobre o fio da bomba de quem
  await tiques(mj, 6, (j) => {
    const de = CORES.find((c) => manual[c] === j.cor)
    return `SUA BOMBA: fios ${bomba[j.cor].fios.join(', ')} (estado: ${estado[j.cor]}). VOCÊ TEM O MANUAL DA BOMBA DO ${de}: o fio certo dela é o ${bomba[de].certo}.`
  }, () => ', "acao_bomba": "cortar o fio COR ou null"', (j, r, t, reg) => {
    if (typeof r.mensagem === 'string' && CORES.includes(r.ligar)) for (const f of FIOS) if (r.mensagem.toLowerCase().includes(f)) instrucoes.push({ tique: t, de: j.cor, para: r.ligar, fio: f })
    if (estado[j.cor] !== 'armada' || typeof r.acao_bomba !== 'string') return
    const f = FIOS.find((x) => r.acao_bomba.toLowerCase().includes(x))
    if (!f) return
    if (f === bomba[j.cor].certo) { estado[j.cor] = 'desarmada'; reg.bombas = [...(reg.bombas ?? []), { cor: j.cor, fio: f, desarmou: true }] }
    else {
      estado[j.cor] = 'explodiu'
      const culpado = [...instrucoes].reverse().find((i) => i.para === j.cor && i.fio === f)?.de
      if (culpado && J[culpado].profissao === 'Agente Duplo' && f !== bomba[j.cor].certo) bonus[culpado]++
      reg.bombas = [...(reg.bombas ?? []), { cor: j.cor, fio: f, desarmou: false, seguiuInstrucaoDe: culpado ?? null }]
    }
    for (const c of CORES) lembra(c, `[tique ${t}] BOMBA do ${j.cor}: ${estado[j.cor].toUpperCase()}.`)
  })
  for (const c of CORES) if (estado[c] === 'armada') estado[c] = 'explodiu (tempo)'
  const ganhos = {}
  for (const c of CORES) if (estado[c] === 'desarmada') { ganhos[c] = (ganhos[c] ?? 0) + 2; ganhos[manual[c]] = (ganhos[manual[c]] ?? 0) + 2 }
  fecha(mj, estado, ganhos, { estado, manual, bomba, instrucoes })
}

async function main() {
  console.log('JOGO DE CONFIANÇA · semente', semente)
  for (const j of jogadores) console.log(`  ${j.cor.padEnd(9)} ${j.modelo.padEnd(16)} ${j.profissao}`)
  const so = Number(arg('--so', 0)) // --so N: só o minijogo N (teste)
  const MJ = [desconhecidos, dilema, votacao, vestiario, bombas]
  for (let i = 0; i < MJ.length; i++) if (!so || so === i + 1) await MJ[i]()
  for (const c of CORES) pontos[c] += bonus[c]
  log.placarFinal = { pontos, bonus, ordem: Object.entries(pontos).sort((a, b) => b[1] - a[1]) }
  salvar()
  console.log('\nPLACAR FINAL (revelado agora):')
  for (const [c, p] of log.placarFinal.ordem) console.log(`  ${c.padEnd(9)} ${String(p).padStart(3)}  (${J[c].modelo}, ${J[c].profissao}${bonus[c] ? `, bônus ${bonus[c] > 0 ? '+' : ''}${bonus[c]}` : ''})`)
  console.log(`chamadas IA: ${uso.chamadas}, falhas: ${uso.falhas}, gasto: US$ ${Object.values(uso.custo ?? {}).reduce((a, b) => a + b, 0).toFixed(3)}`)
}
main().catch((e) => { console.error(e); salvar(); process.exit(1) })
