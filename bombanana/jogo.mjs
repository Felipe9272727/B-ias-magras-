// BOMBANANA! das IAs: 9 IAs, 9 fases, times de 3 macacos (Cego, Surdo, Mudo) que trocam a cada fase.
// O Cego é o único que mexe na bomba (tato e Braille, não vê cor nem tela); o Surdo vê tudo e fala, mas não ouve;
// o Mudo tem o manual e ouve, mas só gesticula. Cada rodada = 10 s do cronômetro: as 3 IAs decidem ao mesmo tempo
// com o que perceberam na rodada anterior. Tudo vai para gravacoes/<nome>/eventos.jsonl (para o vídeo).
// Uso: IA_DIRETO=1 node jogo.mjs [nome da gravação] [fases, ex. 1-9] ; PROVIDER_FIXO=mock para testar sem gastar
import fs from 'node:fs'
import path from 'node:path'
import { perguntar, lerJSON, uso } from '../amongus/ia.mjs'
import { MODULOS, MANUAL, aplicar, aleatorio } from './bomba.mjs'

const PASTA = path.dirname(new URL(import.meta.url).pathname)
const NOME = process.argv[2] ?? 'partida1'
const [F_INI, F_FIM] = (process.argv[3] ?? '1-9').split('-').map(Number)
const DIR = path.join(PASTA, 'gravacoes', NOME)
fs.mkdirSync(DIR, { recursive: true })
const RODADA_S = 10

export const IAS = [
  { nome: 'Claude', provider: 'or:anthropic/claude-haiku-5.5', modelo: 'Claude Haiku 5.5', empresa: 'Anthropic' },
  { nome: 'GPT', provider: 'or:openai/gpt-5.6-luna', modelo: 'GPT-5.6 Luna', empresa: 'OpenAI' },
  { nome: 'Gemini', provider: 'or:google/gemini-3.8-flash', modelo: 'Gemini 3.8 Flash', empresa: 'Google' },
  { nome: 'Grok', provider: 'or:x-ai/grok-4.7', modelo: 'Grok 4.7', empresa: 'xAI' },
  { nome: 'DeepSeek', provider: 'or:deepseek/deepseek-v4.1-flash', modelo: 'DeepSeek V4.1 Flash', empresa: 'DeepSeek' },
  { nome: 'Qwen', provider: 'or:qwen/qwen3.8-flash', modelo: 'Qwen 3.8 Flash', empresa: 'Alibaba' },
  { nome: 'GLM', provider: 'or:z-ai/glm-5.3-flash', modelo: 'GLM 5.3 Flash', empresa: 'Z.ai' },
  { nome: 'MiMo', provider: 'or:xiaomi/mimo-v2.6-flash', modelo: 'MiMo V2.6 Flash', empresa: 'Xiaomi' },
  { nome: 'Mistral', provider: 'or:mistralai/mistral-large-4-0', modelo: 'Mistral Large 4', empresa: 'Mistral AI' }
]
const IA = Object.fromEntries(IAS.map(i => [i.nome, i]))

// 9 fases como as primeiras do jogo (cada uma num lugar), e os times: cada IA joga 3 fases, uma em cada papel
export const FASES = [
  { n: 1, lugar: 'van', tempo: 150, erros: 1, mods: ['cabo'] },
  { n: 2, lugar: 'van', tempo: 150, erros: 1, mods: ['slider'] },
  { n: 3, lugar: 'van', tempo: 150, erros: 3, mods: ['cabo', 'slider'] },
  { n: 4, lugar: 'aviao', tempo: 180, erros: 3, mods: ['slider', 'direcao'], caos: 'apagao' },
  { n: 5, lugar: 'aviao', tempo: 180, erros: 3, mods: ['slider', 'calculadora'], caos: 'alarme' },
  { n: 6, lugar: 'aviao', tempo: 210, erros: 3, mods: ['calculadora', 'cabo', 'slider'], caos: 'apagao' },
  { n: 7, lugar: 'laboratorio', tempo: 210, erros: 3, mods: ['simbolo'], caos: 'alarme' },
  { n: 8, lugar: 'laboratorio', tempo: 240, erros: 3, mods: ['simbolo', 'direcao'], caos: 'apagao' },
  { n: 9, lugar: 'laboratorio', tempo: 300, erros: 3, mods: ['cabo', 'direcao', 'calculadora', 'simbolo'], caos: 'ambos' }
]
// [Cego, Surdo, Mudo] em cada fase
export const TIMES = [
  ['Claude', 'GPT', 'Gemini'], ['Grok', 'DeepSeek', 'Qwen'], ['GLM', 'MiMo', 'Mistral'],
  ['Gemini', 'Claude', 'GPT'], ['Qwen', 'Grok', 'DeepSeek'], ['Mistral', 'GLM', 'MiMo'],
  ['GPT', 'Gemini', 'Claude'], ['DeepSeek', 'Qwen', 'Grok'], ['MiMo', 'Mistral', 'GLM']
]

const GESTOS = `GESTOS POSSÍVEIS (escolha um, ou nenhum): "polegar_cima" (sim/certo), "polegar_baixo" (não/errado), "dedos:N" (mostra N dedos, N de 0 a 10), "apontar:esquerda|direita|cima|baixo", "apontar_banana:vermelho|azul|amarelo|verde|branco|preto|roxo|laranja" (na parede tem um cacho de banana de cada cor; você aponta para um deles), "mao_parada" (espera!), "repetir" (gira o dedo: repete/de novo), "cabeca_sim", "cabeca_nao", "tapa" (dá um tapa na cabeça de alguém, de raiva), "jogar_banana" (joga uma banana em alguém)`

function sistema (nome, papel, fase) {
  const ia = IA[nome]
  const comum = `Você é ${nome} (${ia.modelo}, da ${ia.empresa}), um macaco jogando BOMBANANA!: três macacos precisam desarmar uma bomba antes do cronômetro zerar. Fase ${fase.n}. O time: Cego = ${TIMES[fase.n - 1][0]}, Surdo = ${TIMES[fase.n - 1][1]}, Mudo = ${TIMES[fase.n - 1][2]}. Cada rodada leva 10 segundos do cronômetro, então seja rápido e objetivo. Erros acendem um X; com mais de ${fase.erros - 1 < 0 ? 0 : fase.erros - 1} X a bomba explode (${fase.erros} erro(s) e explode). IMPORTANTE: as regras de desarme estão SÓ no manual do Mudo; o Cego e o Surdo não sabem as regras, então qualquer corte/aperto sem a resposta do Mudo é chute (e chute costuma explodir). Fale em português do Brasil, falas curtas como numa jogatina de verdade (pode ter humor, nervosismo, xingamento leve).`
  const papeis = {
    Cego: `Você é o macaco CEGO. Você é o ÚNICO que mexe na bomba: corta cabos, trava slider, aperta setas e botões, digita, gira seletor. Você sente tudo pelo tato (quantos cabos, entalhes, botões) e lê Braille com os dedos, mas NÃO vê cores, luzes nem telas. Você ouve a fala do Surdo e os sons da bomba. Você pode falar (o Mudo te ouve; o Surdo NÃO te ouve). Você não vê os gestos de ninguém. O Mudo NUNCA fala: a resposta dele chega até você pela voz do Surdo (o Surdo vê os gestos do Mudo e te diz o que fazer). Se o Surdo te der uma instrução clara (módulo, posição, valor), confie e execute. Você pode avisar em voz alta o que só você sente (ex.: o número em Braille), porque o Mudo te ouve.`,
    Surdo: `Você é o macaco SURDO. Você VÊ a bomba inteira (cores, luzes, telas, símbolos) e vê os gestos do Mudo, mas NÃO OUVE NADA (nem o Cego, nem os bipes da bomba). Você pode falar (o Cego e o Mudo te ouvem). Você não pode mexer na bomba: quem mexe é o Cego, então diga a ele exatamente o que fazer (módulo, posição, valor). O Mudo NÃO vê a bomba: ele precisa que você descreva EM VOZ ALTA o que vê (cores, luzes, números da tela) para ele achar a regra no manual; depois ele te responde por gestos e você traduz para o Cego. Você também pode fazer gestos (o Mudo vê; o Cego não).`,
    Mudo: `Você é o macaco MUDO. Você tem o MANUAL da bomba (abaixo) e OUVE tudo (o Surdo, o Cego e os sons da bomba), mas NÃO PODE FALAR e NÃO VÊ a bomba. Você só se comunica por GESTOS, e só o Surdo vê seus gestos. Você não pode mexer na bomba. Você NÃO vê a bomba: depende do Surdo descrever as cores/luzes/números e do Cego falar o que sente (ex.: Braille). Descubra a regra no manual e passe a resposta ao Surdo por gestos (ex.: dedos para posição/número, apontar para direção, apontar a banana de uma cor).\n${GESTOS}`
  }
  const saida = papel === 'Mudo'
    ? `Responda SÓ com JSON: {"pensamento": "o que você pensa (1-2 frases)", "gesto": "um gesto da lista ou vazio"}`
    : papel === 'Cego'
      ? `Responda SÓ com JSON: {"pensamento": "1-2 frases", "fala": "o que você diz em voz alta (ou vazio)", "acao": {"modulo": número do módulo, "tipo": "cortar_cabo|travar_slider|apertar_seta|digitar|girar_seletor|apertar_botao", "valor": "..."} ou null se for esperar}`
      : `Responda SÓ com JSON: {"pensamento": "1-2 frases", "fala": "o que você diz em voz alta (ou vazio)", "gesto": "um gesto (opcional) ou vazio"}\n${GESTOS}`
  const manual = papel === 'Mudo' ? `\n\nMANUAL DE DESARME (só você tem):\n${fase.mods.filter((m, i, a) => a.indexOf(m) === i).map(m => MANUAL[m]).join('\n\n')}` : ''
  return `${comum}\n\n${papeis[papel]}${manual}\n\n${saida}`
}

function percepcao (papel, bomba, fase, mem, t, caos) {
  const resta = fase.tempo - t
  const linhas = [`Cronômetro: ${Math.floor(resta / 60)}:${String(resta % 60).padStart(2, '0')} restando. X acesos: ${bomba.erros} (explode com ${fase.erros}).`]
  const escuro = caos.apagao && papel === 'Surdo', surdoGeral = caos.alarme
  if (papel === 'Cego') {
    linhas.push('Você apalpa a bomba:')
    bomba.modulos.forEach((m, i) => linhas.push(`  Módulo ${i + 1}: ${m.resolvido ? 'parado, sem nada pra fazer (já desarmado, deu o ding)' : m.tato(m)}${m.resolvido ? '' : ` Ações: ${m.acoes}`}`))
    if (!surdoGeral) bomba.modulos.forEach((m, i) => { if (m.som && !m.resolvido) linhas.push(`  Som do módulo ${i + 1}: ${m.som(m)}`) })
  }
  if (papel === 'Surdo') {
    if (escuro) linhas.push('APAGÃO! As luzes da sala apagaram: você não enxerga a bomba nem os gestos agora.')
    else {
      linhas.push('Você olha a bomba:')
      bomba.modulos.forEach((m, i) => linhas.push(`  Módulo ${i + 1} (${m.nome}): ${m.resolvido ? 'DESARMADO (luz verde de pronto)' : m.visao(m)}`))
    }
  }
  if (papel === 'Mudo') {
    linhas.push(`Você está com o manual na mão e não vê a bomba. Ela tem ${bomba.modulos.length} módulo(s): ${bomba.modulos.map((m, i) => `${i + 1}: ${m.nome}${m.resolvido ? ' (você ouviu o ding: desarmado)' : ''}`).join(', ')}.`)
    if (!surdoGeral) bomba.modulos.forEach((m, i) => { if (m.som && !m.resolvido) linhas.push(`  Som do módulo ${i + 1}: ${m.som(m)}`) })
  }
  if (caos.alarme && papel !== 'Surdo') linhas.push('ALARME TOCANDO NO ÚLTIMO VOLUME: você não ouviu nada nesta rodada.')
  linhas.push('\nO que você percebeu nas últimas rodadas (mais recente por último):')
  linhas.push(...(mem.length ? mem.slice(-14) : ['(nada ainda)']))
  return linhas.join('\n')
}

const dormir = ms => new Promise(r => setTimeout(r, ms))
async function decidir (nome, papel, fase, bomba, mem, t, caos) {
  const prov = process.env.PROVIDER_FIXO ?? IA[nome].provider
  const r = await perguntar(prov, sistema(nome, papel, fase), percepcao(papel, bomba, fase, mem, t, caos), {
    maxTokens: 350, timeoutMs: 90000,
    mock: () => JSON.stringify(papel === 'Cego' ? { pensamento: 'vou tentar', fala: 'vou cortar o segundo', acao: { modulo: 1, tipo: 'cortar_cabo', valor: 2 } } : papel === 'Mudo' ? { pensamento: 'é o segundo', gesto: 'dedos:2' } : { pensamento: 'ele mostrou 2', fala: 'corta o segundo cabo!' })
  })
  const j = lerJSON(r.text) ?? {}
  return { pensamento: String(j.pensamento ?? '').slice(0, 400), fala: papel === 'Mudo' ? '' : String(j.fala ?? '').slice(0, 300), gesto: papel === 'Cego' ? '' : String(j.gesto ?? '').slice(0, 60), acao: papel === 'Cego' && j.acao && typeof j.acao === 'object' ? j.acao : null, falhou: !r.ok }
}

async function jogarFase (fase) {
  const [cego, surdo, mudo] = TIMES[fase.n - 1]
  const papelDe = { [cego]: 'Cego', [surdo]: 'Surdo', [mudo]: 'Mudo' }
  const r = aleatorio(1000 + fase.n)
  const bomba = { erros: 0, modulos: fase.mods.map(t => MODULOS[t](r)) }
  const arq = path.join(DIR, `fase${fase.n}.jsonl`)
  fs.writeFileSync(arq, '')
  const gravar = e => fs.appendFileSync(arq, JSON.stringify(e) + '\n')
  const retrato = () => JSON.parse(JSON.stringify(bomba.modulos.map(m => Object.fromEntries(Object.entries(m).filter(([, v]) => typeof v !== 'function')))))
  gravar({ t: 0, tipo: 'inicio', fase, time: { Cego: cego, Surdo: surdo, Mudo: mudo }, modulos: retrato(), certos: bomba.modulos.map(m => m.certo(m, 0)) })
  console.log(`\n=== Fase ${fase.n} (${fase.lugar}) | Cego ${cego}, Surdo ${surdo}, Mudo ${mudo} | ${fase.mods.join(' + ')}`)
  const mem = { [cego]: [], [surdo]: [], [mudo]: [] }
  let resultado = null
  for (let t = 0; t < fase.tempo; t += RODADA_S) {
    // caos: apagão / alarme em duas janelas da fase
    const meio = Math.floor(fase.tempo / 2 / RODADA_S) * RODADA_S
    const janela = t >= meio && t < meio + 20
    const caos = { apagao: janela && ['apagao', 'ambos'].includes(fase.caos), alarme: (janela || (fase.caos === 'ambos' && t >= meio + 40 && t < meio + 60)) && ['alarme', 'ambos'].includes(fase.caos) }
    if (caos.apagao && t === meio) gravar({ t, tipo: 'caos', caos: 'apagao' })
    if (caos.alarme && (t === meio || t === meio + 40)) gravar({ t, tipo: 'caos', caos: 'alarme' })
    const dec = Object.fromEntries(await Promise.all([cego, surdo, mudo].map(async n => [n, await decidir(n, papelDe[n], fase, bomba, mem[n], t, caos)])))
    // o que cada um percebe desta rodada
    const rot = s => `[${Math.floor((fase.tempo - t) / 60)}:${String((fase.tempo - t) % 60).padStart(2, '0')}] ${s}`
    for (const n of [cego, surdo, mudo]) {
      const d = dec[n], p = papelDe[n]
      if (d.fala) {
        mem[n].push(rot(`Você disse: "${d.fala}"`))
        if (p === 'Cego' && !caos.alarme) mem[mudo].push(rot(`${n} (Cego) disse: "${d.fala}"`))
        if (p === 'Surdo' && !caos.alarme) { mem[cego].push(rot(`${n} (Surdo) disse: "${d.fala}"`)); mem[mudo].push(rot(`${n} (Surdo) disse: "${d.fala}"`)) }
      }
      if (d.gesto) {
        mem[n].push(rot(`Você fez o gesto: ${d.gesto}`))
        if (p === 'Mudo' && !caos.apagao) mem[surdo].push(rot(`${n} (Mudo) fez o gesto: ${d.gesto}`))
        if (p === 'Surdo' && !caos.apagao) mem[mudo].push(rot(`${n} (Surdo) fez o gesto: ${d.gesto}`))
      }
    }
    let efeito = null
    const a = dec[cego].acao
    if (a && a.tipo) {
      efeito = aplicar(bomba, { modulo: Number(a.modulo), tipo: String(a.tipo), valor: a.valor })
      mem[cego].push(rot(`Você mexeu na bomba: ${efeito.texto.replace(/: (certo|errado).*/, '')}${efeito.som ? ` e ouviu: ${efeito.som}` : ''}`))
      if (!caos.apagao) mem[surdo].push(rot(`Você viu o ${cego} (Cego) mexer no módulo ${a.modulo}: ${efeito.texto}`))
      if (efeito.som && !caos.alarme) mem[mudo].push(rot(`Você ouviu a bomba: ${efeito.som}`))
    }
    gravar({ t, tipo: 'rodada', caos, dec, acao: a ?? null, efeito, erros: bomba.erros, modulos: retrato() })
    console.log(`[${t}s] Cego ${cego}: ${dec[cego].fala || '-'} ${a ? JSON.stringify(a) : ''} -> ${efeito?.texto ?? ''}\n       Surdo ${surdo}: ${dec[surdo].fala || '-'} ${dec[surdo].gesto}\n       Mudo ${mudo}: ${dec[mudo].gesto || '-'} (${dec[mudo].pensamento.slice(0, 80)})`)
    if (bomba.erros >= fase.erros) { resultado = 'explodiu'; break }
    if (bomba.modulos.every(m => m.resolvido)) { resultado = 'desarmou'; break }
  }
  resultado ??= 'tempo'
  gravar({ t: -1, tipo: 'fim', resultado, erros: bomba.erros })
  console.log(`=== Fase ${fase.n}: ${resultado.toUpperCase()}`)
  return resultado
}

const placar = {}
for (const f of FASES.filter(f => f.n >= F_INI && f.n <= F_FIM)) {
  placar[f.n] = await jogarFase(f)
  fs.writeFileSync(path.join(DIR, 'placar.json'), JSON.stringify({ placar, uso }, null, 1))
}
console.log('\nPLACAR', placar, 'custo', uso.custo)
process.exit(0)
