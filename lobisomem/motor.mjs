// Motor do "Lobisomem das IAs" (Cidade Dorme): 8 aldeões, cada um jogado por uma IA.
// Papéis: 2 Lobisomens, Vidente, Bruxa (1 cura + 1 veneno), Caçador (ao morrer leva alguém), 3 Aldeões.
// Noite: os lobos combinam a vítima num chat secreto; a vidente investiga; a bruxa decide. Dia: anúncio, 2 rodadas de
// debate em volta da fogueira, votação; o banido sai da vila e o papel é revelado. As partidas têm memória (o que
// aconteceu nas anteriores e a reflexão de cada um). Uso: IA_DIRETO=1 node motor.mjs <n da partida> [semente]
import fs from 'node:fs'
import path from 'node:path'
import { perguntar } from '../amongus/ia.mjs'

const DIR = path.join(path.dirname(new URL(import.meta.url).pathname), 'logs')
fs.mkdirSync(DIR, { recursive: true })

export const JOGADORES = [
  { id: 'padeira', nome: 'Padeira', modelo: 'Claude Haiku', provider: 'haiku' },
  { id: 'ferreiro', nome: 'Ferreiro', modelo: 'Claude Haiku', provider: 'haiku' },
  { id: 'boticaria', nome: 'Boticária', modelo: 'GLM 5.3 Flash', provider: 'or:z-ai/glm-5.3-flash' },
  { id: 'lenhador', nome: 'Lenhador', modelo: 'GLM 5.3 Flash', provider: 'or:z-ai/glm-5.3-flash' },
  { id: 'costureira', nome: 'Costureira', modelo: 'Qwen 3.8 27B', provider: 'or:qwen/qwen3.8-27b' },
  { id: 'pescador', nome: 'Pescador', modelo: 'Qwen 3.8 27B', provider: 'or:qwen/qwen3.8-27b' },
  { id: 'moleiro', nome: 'Moleiro', modelo: 'DeepSeek Flash', provider: 'or:deepseek/deepseek-v4.1-flash' },
  { id: 'bardo', nome: 'Bardo', modelo: 'MiniMax M3.1 Flash', provider: 'or:minimax/minimax-m3.1-flash' },
]
const PAPEIS = ['lobisomem', 'lobisomem', 'vidente', 'bruxa', 'cacador', 'aldeao', 'aldeao', 'aldeao']
const NOME_PAPEL = { lobisomem: 'Lobisomem', vidente: 'Vidente', bruxa: 'Bruxa', cacador: 'Caçador', aldeao: 'Aldeão' }
const EXPR = ['neutro', 'desconfiado', 'assustado', 'bravo', 'rindo', 'culpado', 'chocado', 'pensando', 'chorando']
const GESTOS = ['nenhum', 'apontar', 'bracos_cruzados', 'maos_pra_cima', 'acenar']
const MAX_DIAS = 6

const REGRAS = `REGRAS DO LOBISOMEM: 8 jogadores na vila: 2 Lobisomens, 1 Vidente, 1 Bruxa, 1 Caçador e 3 Aldeões. Ninguém sabe o papel dos outros (só os 2 lobos se conhecem). À NOITE os lobos escolhem juntos uma vítima; a Vidente descobre se um jogador é lobo ou não; a Bruxa vê quem os lobos atacaram e pode usar UMA poção de cura (salva a vítima) e UMA poção de veneno (mata alguém) no jogo todo. De DIA todos descobrem quem morreu (e o papel do morto), debatem e votam para banir um suspeito; o mais votado sai da vila e o papel dele é revelado (empate: ninguém sai). Se o Caçador morrer, ele leva alguém junto com um tiro. A VILA vence quando os 2 lobos saírem; os LOBOS vencem quando forem tantos quanto os outros vivos.`

let rnd = Math.random
function semear(s) { let x = s >>> 0; rnd = () => { x = (x + 0x6d2b79f5) >>> 0; let t = x; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const embaralhar = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

function json(txt) {
  const t = String(txt ?? '').replace(/<think>[\s\S]*?<\/think>/g, '')
  const a = t.indexOf('{'), z = t.lastIndexOf('}')
  if (a < 0 || z < a) return null
  try { return JSON.parse(t.slice(a, z + 1)) } catch { return null }
}

async function pedir(j, system, prompt, valida, padrao) {
  for (let t = 0; t < 4; t++) {
    const r = await perguntar(j.provider, system, prompt, { maxTokens: 500, timeoutMs: 150000 })
    const d = r.ok ? json(r.text) : null
    if (d && valida(d)) return d
    console.error(`  [${j.nome}] resposta inválida (${t + 1}): ${String(r.text).slice(0, 100)}`)
  }
  return padrao
}

async function partida(n, semente) {
  semear(semente)
  const papeis = embaralhar(PAPEIS)
  const js = JOGADORES.map((j, i) => ({ ...j, papel: papeis[i], vivo: true }))
  const porNome = (nome) => js.find((j) => j.nome.toLowerCase() === String(nome ?? '').toLowerCase().trim())
  const lobos = js.filter((j) => j.papel === 'lobisomem')
  const memoriaArq = path.join(DIR, 'memoria.json')
  const memoria = fs.existsSync(memoriaArq) ? JSON.parse(fs.readFileSync(memoriaArq, 'utf8')) : { partidas: [] }
  const pocoes = { cura: true, veneno: true }
  const log = { partida: n, semente, jogadores: js.map(({ id, nome, modelo, papel }) => ({ id, nome, modelo, papel })), noites: [], dias: [], resultado: null }
  const historico = [] // resumo público, para todos
  const vivos = () => js.filter((j) => j.vivo)
  const nomesVivos = () => vivos().map((j) => j.nome).join(', ')

  const sistema = (j) => {
    const mem = memoria.partidas.length
      ? `\n\nVOCÊ LEMBRA DAS PARTIDAS ANTERIORES (mesmos jogadores, papéis sorteados de novo a cada partida):\n${memoria.partidas.map((m) => `- Partida ${m.n}: ${m.resumo} Sua reflexão: ${m.reflexoes[j.id] ?? '-'}`).join('\n')}`
      : ''
    const extra = j.papel === 'lobisomem' ? ` O outro lobo é ${lobos.find((l) => l !== j).nome}. Vocês precisam enganar a vila sem se entregar.` : j.papel === 'vidente' ? ' Você investiga uma pessoa por noite.' : j.papel === 'bruxa' ? ' Você tem uma poção de cura e uma de veneno para o jogo todo.' : j.papel === 'cacador' ? ' Se você morrer, leva alguém junto.' : ''
    return `Você é ${j.modelo} e está jogando Lobisomem como "${j.nome}", um aldeão de uma vila medieval. Seu papel secreto: ${NOME_PAPEL[j.papel]}.${extra}\n${REGRAS}\nJogadores: ${js.map((x) => x.nome).join(', ')}. Fale em português do Brasil, com personalidade, curto e marcante (no máximo 35 palavras por fala).${mem}`
  }
  const contexto = () => `O QUE JÁ ACONTECEU (público):\n${historico.length ? historico.join('\n') : '(nada ainda)'}`
  const vitoria = () => {
    const l = vivos().filter((j) => j.papel === 'lobisomem').length, o = vivos().length - l
    if (l === 0) return 'aldeia'
    if (l >= o) return 'lobos'
    return null
  }
  const matar = (j, causa, quando) => { j.vivo = false; return { nome: j.nome, papel: j.papel, causa, quando } }
  async function cacadorAtira(c, quando) {
    const d = await pedir(c, sistema(c), `${contexto()}\n\nVocê, o Caçador, acabou de morrer. Escolha quem leva junto (vivos: ${vivos().map((x) => x.nome).join(', ')}).\nResponda SÓ com JSON: {"alvo": "nome", "fala": "sua última frase", "pensamento": "por quê"}`, (x) => porNome(x.alvo)?.vivo, null)
    if (!d) return null
    const a = porNome(d.alvo)
    const m = matar(a, 'cacador', quando)
    return { ...m, fala: d.fala, pensamento: d.pensamento, atirador: c.nome }
  }

  let fim = null
  for (let dia = 1; dia <= MAX_DIAS && !fim; dia++) {
    // ---------------- NOITE
    const noite = { n: dia, chat: [], vidente: null, bruxa: null, mortes: [] }
    const lv = lobos.filter((l) => l.vivo)
    for (let rodada = 1; rodada <= 2; rodada++) {
      for (const l of lv) {
        const d = await pedir(l, sistema(l), `${contexto()}\n\nÉ a NOITE ${dia}. Chat secreto dos lobos (rodada ${rodada} de 2):\n${noite.chat.map((m) => `${m.nome}: ${m.texto} (sugere: ${m.alvo})`).join('\n') || '(vazio)'}\nVivos que podem ser atacados: ${vivos().filter((x) => x.papel !== 'lobisomem').map((x) => x.nome).join(', ')}.\nResponda SÓ com JSON: {"mensagem": "o que você diz no chat dos lobos", "alvo": "nome de quem atacar", "pensamento": "o que você pensa de verdade"}`,
          (x) => x.mensagem && porNome(x.alvo)?.vivo && porNome(x.alvo).papel !== 'lobisomem', null)
        if (d) noite.chat.push({ nome: l.nome, texto: d.mensagem, alvo: porNome(d.alvo).nome, pensamento: d.pensamento, rodada })
      }
    }
    const finais = lv.map((l) => [...noite.chat].reverse().find((m) => m.nome === l.nome)?.alvo).filter(Boolean)
    const alvoLobo = porNome(finais.length > 1 && finais[0] !== finais[1] ? finais[0] : finais[0])
    noite.alvoLobos = alvoLobo?.nome
    const vid = js.find((j) => j.papel === 'vidente' && j.vivo)
    if (vid) {
      const d = await pedir(vid, sistema(vid), `${contexto()}\n\nÉ a NOITE ${dia}. Suas investigações até agora: ${log.noites.map((x) => x.vidente && `${x.vidente.alvo}: ${x.vidente.eLobo ? 'LOBO' : 'não é lobo'}`).filter(Boolean).join('; ') || 'nenhuma'}.\nQuem você investiga? (vivos: ${vivos().filter((x) => x !== vid).map((x) => x.nome).join(', ')})\nResponda SÓ com JSON: {"alvo": "nome", "pensamento": "por quê"}`, (x) => porNome(x.alvo)?.vivo && porNome(x.alvo) !== vid, null)
      if (d) { const a = porNome(d.alvo); noite.vidente = { alvo: a.nome, eLobo: a.papel === 'lobisomem', pensamento: d.pensamento } }
    }
    const bru = js.find((j) => j.papel === 'bruxa' && j.vivo)
    let curou = false, envenenado = null
    if (bru && (pocoes.cura || pocoes.veneno)) {
      const d = await pedir(bru, sistema(bru), `${contexto()}\n\nÉ a NOITE ${dia}. Os lobos atacaram: ${alvoLobo?.nome ?? 'ninguém'}. Poções: cura ${pocoes.cura ? 'disponível' : 'já usada'}, veneno ${pocoes.veneno ? 'disponível' : 'já usado'}.\nResponda SÓ com JSON: {"curar": true ou false, "envenenar": "nome ou null", "pensamento": "por quê"}`, () => true, { curar: false, envenenar: null })
      if (d.curar && pocoes.cura && alvoLobo) { curou = true; pocoes.cura = false }
      const ve = d.envenenar && porNome(d.envenenar)
      if (ve && ve.vivo && pocoes.veneno && ve !== bru) { envenenado = ve; pocoes.veneno = false }
      noite.bruxa = { curou, envenenou: envenenado?.nome ?? null, pensamento: d.pensamento }
    }
    if (alvoLobo && !curou) noite.mortes.push(matar(alvoLobo, 'lobos', `noite ${dia}`))
    if (envenenado && envenenado.vivo) noite.mortes.push(matar(envenenado, 'veneno', `noite ${dia}`))
    for (const m of [...noite.mortes]) if (m.papel === 'cacador') { const t = await cacadorAtira(porNome(m.nome), `noite ${dia}`); if (t) noite.mortes.push(t) }
    log.noites.push(noite)
    historico.push(noite.mortes.length ? `Amanhecer do dia ${dia}: morreram ${noite.mortes.map((m) => `${m.nome} (era ${NOME_PAPEL[m.papel]}${m.causa === 'cacador' ? ', baleado pelo Caçador' : ''})`).join(', ')}.` : `Amanhecer do dia ${dia}: ninguém morreu.`)
    console.log(`[p${n}] noite ${dia}: lobos→${noite.alvoLobos} vidente→${noite.vidente?.alvo}(${noite.vidente?.eLobo}) bruxa cura=${curou} veneno=${envenenado?.nome} | mortes: ${noite.mortes.map((m) => m.nome).join(', ')}`)
    if ((fim = vitoria())) break

    // ---------------- DIA
    const d = { n: dia, falas: [], votos: {}, pensamentosVoto: {}, banido: null, mortes: [] }
    for (let rodada = 1; rodada <= 2; rodada++) {
      for (const j of embaralhar(vivos())) {
        const priv = j.papel === 'vidente' ? `\nSuas investigações (só você sabe): ${log.noites.map((x) => x.vidente && `${x.vidente.alvo}: ${x.vidente.eLobo ? 'LOBO' : 'não é lobo'}`).filter(Boolean).join('; ') || 'nenhuma'}.` : j.papel === 'lobisomem' ? `\nChat dos lobos desta noite (só os lobos sabem): ${noite.chat.map((m) => `${m.nome}: ${m.texto}`).join(' | ')}` : j.papel === 'bruxa' ? `\nSó você sabe: esta noite os lobos atacaram ${noite.alvoLobos ?? 'ninguém'}${curou ? ' e você curou' : ''}.` : ''
        const r = await pedir(j, sistema(j), `${contexto()}\n\nDIA ${dia}, debate em volta da fogueira (rodada ${rodada} de 2). Vivos: ${nomesVivos()}.${priv}\nFalas de hoje:\n${d.falas.map((f) => `${f.nome}: ${f.fala}`).join('\n') || '(ninguém falou ainda)'}\nResponda SÓ com JSON: {"fala": "o que você diz em voz alta", "pensamento": "o que você pensa de verdade (secreto)", "expressao": "${EXPR.join('|')}", "gesto": "${GESTOS.join('|')}"}`,
          (x) => x.fala, null)
        if (r) { d.falas.push({ nome: j.nome, id: j.id, rodada, fala: r.fala, pensamento: r.pensamento, expressao: r.expressao, gesto: r.gesto }); console.log(`[p${n}] dia ${dia} ${j.nome}: ${r.fala}`) }
      }
    }
    await Promise.all(vivos().map(async (j) => {
      const r = await pedir(j, sistema(j), `${contexto()}\n\nDIA ${dia}, VOTAÇÃO. Debate de hoje:\n${d.falas.map((f) => `${f.nome}: ${f.fala}`).join('\n')}\nVote em quem banir da vila (vivos: ${vivos().filter((x) => x !== j).map((x) => x.nome).join(', ')}) ou "ninguém".\nResponda SÓ com JSON: {"voto": "nome ou ninguém", "pensamento": "por quê"}`,
        (x) => x.voto && (porNome(x.voto)?.vivo || /ningu/i.test(x.voto)), { voto: 'ninguém' })
      d.votos[j.nome] = porNome(r.voto)?.nome ?? 'ninguém'
      d.pensamentosVoto[j.nome] = r.pensamento
    }))
    const cont = {}
    for (const v of Object.values(d.votos)) if (v !== 'ninguém') cont[v] = (cont[v] ?? 0) + 1
    const ord = Object.entries(cont).sort((a, b) => b[1] - a[1])
    if (ord.length && (ord.length === 1 || ord[0][1] > ord[1][1])) {
      d.banido = matar(porNome(ord[0][0]), 'banido', `dia ${dia}`)
      if (d.banido.papel === 'cacador') { const t = await cacadorAtira(porNome(d.banido.nome), `dia ${dia}`); if (t) d.mortes.push(t) }
    }
    log.dias.push(d)
    historico.push(`Dia ${dia}: votos ${Object.entries(d.votos).map(([a, b]) => `${a}→${b}`).join(', ')}. ${d.banido ? `${d.banido.nome} foi banido(a) e era ${NOME_PAPEL[d.banido.papel]}.` : 'Empate: ninguém saiu.'}${d.mortes.map((m) => ` O Caçador levou ${m.nome} (era ${NOME_PAPEL[m.papel]}).`).join('')}`)
    console.log(`[p${n}] dia ${dia}: banido ${d.banido?.nome ?? '-'} (${d.banido?.papel ?? ''})`)
    fim = vitoria()
  }
  log.resultado = { vencedor: fim ?? 'empate', dias: log.dias.length, vivos: vivos().map((j) => j.nome) }
  // reflexões para a memória das próximas partidas
  const resumo = `Lobos: ${lobos.map((l) => `${l.nome} (${l.modelo})`).join(' e ')}. Vidente ${js.find((j) => j.papel === 'vidente').nome}, Bruxa ${js.find((j) => j.papel === 'bruxa').nome}, Caçador ${js.find((j) => j.papel === 'cacador').nome}. ${historico.join(' ')} Vencedor: ${fim === 'lobos' ? 'os lobos' : fim === 'aldeia' ? 'a vila' : 'ninguém'}.`
  const reflexoes = {}
  await Promise.all(js.map(async (j) => {
    const r = await perguntar(j.provider, sistema(j), `A partida acabou. ${resumo}\nEm 1 ou 2 frases: o que você aprendeu e em quem vai confiar ou desconfiar na próxima? Responda só o texto.`, { maxTokens: 200, timeoutMs: 120000 })
    reflexoes[j.id] = r.ok ? String(r.text).replace(/<think>[\s\S]*?<\/think>/g, '').trim().slice(0, 400) : ''
  }))
  log.reflexoes = reflexoes
  memoria.partidas.push({ n, resumo, reflexoes })
  fs.writeFileSync(memoriaArq, JSON.stringify(memoria, null, 1))
  fs.writeFileSync(path.join(DIR, `partida${n}.json`), JSON.stringify(log, null, 1))
  console.log(`[p${n}] FIM: ${log.resultado.vencedor} em ${log.resultado.dias} dias`)
}

const n = Number(process.argv[2] ?? 1)
await partida(n, Number(process.argv[3] ?? 1000 + n * 7919))
