// Episódio 2: sala de 16, papéis sorteados e memórias privadas por personagem.
// Logs reais somente após respostas do modelo; testes são marcados synthetic.
// Uso: node motor_ep2.mjs <partida 5–8> [semente]
import fs from 'node:fs'
import path from 'node:path'
import { perguntar } from './ia_ep2.mjs'
import {CONFIG, LOBO, parceirosLobos, escolherAlvoLobos, vencedor, resolverAguaBenta, espiritoMatou, suspeitosXerife} from './regras_ep2.mjs'
import {pathToFileURL} from 'node:url'

const DIR = path.resolve(process.env.LOBO_EP2_LOG_DIR ?? path.join(path.dirname(new URL(import.meta.url).pathname), 'logs_ep2'))
fs.mkdirSync(DIR, { recursive: true })

export const JOGADORES = CONFIG.players.map(j => ({...j, provider:'or:'+j.modelId}))
const PAPEIS = CONFIG.roles
export const NOME_PAPEL = { lobisomem: 'Lobisomem', lobo_vidente: 'Lobo Vidente', vidente: 'Vidente', medico: 'Médico', carcereiro: 'Carcereiro', pistoleiro: 'Pistoleiro', bobo: 'Bobo', aldeao: 'Aldeão', padre:'Padre', xerife:'Xerife', vidente_espiritual:'Vidente Espiritual' }
const EXPR = ['neutro', 'desconfiado', 'assustado', 'bravo', 'rindo', 'culpado', 'chocado', 'pensando', 'chorando']
const MAX_DIAS = CONFIG.maxDays

const REGRAS = `REGRAS (Lobisomem no estilo Wolvesville): 16 jogadores. TIME DOS LOBOS: 3 Lobisomens e 1 Lobo Vidente (se conhecem e matam juntos uma pessoa por noite; o Lobo Vidente descobre o papel antes do chat secreto, e os lobos livres recebem o resultado ainda nessa noite). TIME DA VILA: Vidente (descobre o papel exato de alguém por noite), Médico (protege um jogador por noite dos lobos; não pode se proteger), Carcereiro (de dia escolhe alguém para prender à noite; o preso não pode agir nem ser atacado, os dois conversam em segredo sem o preso saber quem é o carcereiro, e UMA vez no jogo o Carcereiro pode executar o preso), Pistoleiro (tem 2 balas e atira de DIA em quem quiser; no primeiro tiro todos descobrem que ele é o Pistoleiro) Padre (UMA água benta usada de DIA: mata o alvo se for lobo, mas se errar o próprio Padre morre; não converte ninguém), Xerife (vigia até dois jogadores por noite; se um morrer recebe dois suspeitos, só um executou aquela morte), Vidente Espiritual (verifica até dois jogadores à noite; ao amanhecer sabe apenas se pelo menos um deles matou, sem saber qual; um ataque dos lobos que matou conta para todos os lobos livres participantes) e Aldeão (sem poder). SOLO: Bobo (vence sozinho se for LINCHADO pela vila; aí o jogo acaba). Ninguém sabe o papel dos outros. Quando alguém morre, o papel aparece para todos. De DIA todos discutem e votam; o mais votado é linchado (empate: ninguém). A VILA vence quando todos os 4 lobos morrerem; os LOBOS vencem quando forem tantos quanto os outros vivos.`

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
    const r = await perguntar(j.provider, system, prompt, { maxTokens: 600, timeoutMs: 180000, attempt:t })
    const d = r.ok ? json(r.text) : null
    if (d && valida(d)) return d
    console.error(`  [${j.nome}] resposta inválida (${t + 1}): ${String(r.text).slice(0, 100)}`)
  }
  throw new Error(`Resposta inválida de ${j.nome}; partida pausada sem fabricar voto ou fala.`)
}

export async function partida(n, semente) {
  if (fs.existsSync(path.join(DIR, `partida${n}.json`))) throw new Error('Partida já concluída; não será refeita: '+n)
  semear(semente)
  const papeis = embaralhar(PAPEIS)
  const js = JOGADORES.map((j, i) => ({ ...j, papel: papeis[i], vivo: true, numero: i + 1 }))
  const porNome = (nome) => js.find((j) => j.nome.toLowerCase() === String(nome ?? '').toLowerCase().replace(/^\d+\s*/, '').trim())
  const papel = (p) => js.find((j) => j.papel === p)
  const lobos = js.filter((j) => LOBO(j.papel))
  const memoriaArq = path.join(DIR, 'memoria.json')
  const anterior = path.join(path.dirname(new URL(import.meta.url).pathname), 'logs/memoria.json')
  if (!fs.existsSync(memoriaArq) && fs.existsSync(anterior) && process.env.LOBO_EP2_TEST !== '1') fs.copyFileSync(anterior, memoriaArq)
  const memoria = fs.existsSync(memoriaArq) ? JSON.parse(fs.readFileSync(memoriaArq, 'utf8')) : { partidas: [] }
  const log = { episodio:2, synthetic:process.env.LOBO_EP2_TEST === '1', partida: n, semente, jogadores: js.map(({ id, nome, modelo, modelId, provider, papel, numero }) => ({ id, nome, modelo, modelId, provider, papel, numero })), noites: [], dias: [], resultado: null }
  const historico = [] // resumo público, para todos
  const segredos = Object.fromEntries(js.map((j) => [j.nome, []])) // o que cada um descobriu sozinho
  const vivos = () => js.filter((j) => j.vivo)
  const nomesVivos = (exceto) => vivos().filter((x) => x !== exceto).map((j) => j.nome).join(', ')
  let balas = 2, revelado = false, execucao = true, aguaBenta = true, preso = null

  const sistema = (j) => {
    const anteriores = memoria.partidas.filter(m => m.reflexoes?.[j.id])
    const mem = anteriores.length
      ? `\n\nVOCÊ LEMBRA DAS PARTIDAS ANTERIORES (papéis sorteados de novo; agora há novos jogadores na vila):\n${anteriores.map((m) => `- Partida ${m.n}: ${m.resumo} Sua reflexão: ${m.reflexoes[j.id] ?? '-'}`).join('\n')}`
      : ''
    const extra = LOBO(j.papel) ? ` Seus parceiros lobos são ${parceirosLobos(lobos, j, NOME_PAPEL)}. Enganem a vila sem se entregar.`
      : j.papel === 'bobo' ? ' Você está SOZINHO: seu único objetivo é ser linchado pela vila, mas sem deixar óbvio que é o Bobo (ninguém vota em quem parece querer ser votado).'
      : ''
    return `Você é ${j.modelo} e está jogando Lobisomem (Wolvesville) como "${j.nome}". Seu papel secreto: ${NOME_PAPEL[j.papel]}.${extra}\n${REGRAS}\nJogadores: ${js.map((x) => x.nome).join(', ')}. Fale em português do Brasil, como num chat de jogo: curto, com personalidade (no máximo 30 palavras por fala).${mem}`
  }
  const contexto = (j) => `O QUE JÁ ACONTECEU (público):\n${historico.length ? historico.join('\n') : '(nada ainda)'}${segredos[j.nome].length ? `\nSÓ VOCÊ SABE: ${segredos[j.nome].join(' ')}` : ''}`
  const vitoria = () => vencedor(js)
  const matar = (j, causa, quando, autor = null) => { j.vivo = false; return { nome: j.nome, papel: j.papel, causa, quando, autor } }

  const salvarParcial = () => fs.writeFileSync(path.join(DIR, `partida${n}.partial.json`), JSON.stringify(log, null, 1))
  let fim = null
  for (let dia = 1; dia <= MAX_DIAS && !fim; dia++) {
    // ---------------- NOITE
    const noite = { n: dia, cela: null, chat: [], vidente: null, loboVidente: null, medico: null, xerife: null, videnteEspiritual: null, mortes: [] }
    const car = papel('carcereiro')
    if (preso?.vivo && car?.vivo) {
      // conversa na cela: 2 rodadas, o preso não sabe quem é o carcereiro
      const conversa = []
      for (let rodada = 1; rodada <= 2; rodada++) {
        for (const [quem, eu] of [[car, 'o CARCEREIRO'], [preso, 'o PRESO']]) {
          const tarefa = quem === car
            ? `Você prendeu ${preso.nome} esta noite. Interrogue o preso (ele não sabe quem você é).${rodada === 2 ? ` Decida também se EXECUTA ${preso.nome} agora (você tem ${execucao ? '1 execução' : '0 execuções'}). Responda SÓ com JSON: {"mensagem": "o que você diz", "executar": true ou false, "pensamento": "o que você pensa de verdade"}` : ' Responda SÓ com JSON: {"mensagem": "o que você diz", "pensamento": "o que você pensa de verdade"}'}`
            : `Você foi PRESO pelo Carcereiro esta noite (não sabe quem ele é). Você não pode agir nem ser atacado. Convença o Carcereiro a não te executar. Responda SÓ com JSON: {"mensagem": "o que você diz", "pensamento": "o que você pensa de verdade"}`
          const d = await pedir(quem, sistema(quem), `${contexto(quem)}\n\nNOITE ${dia}, cela da prisão. Conversa até agora:\n${conversa.map((m) => `${m.quem === car.nome ? 'Carcereiro' : preso.nome}: ${m.texto}`).join('\n') || '(vazia)'}\n${tarefa}`, (x) => x.mensagem, null)
          if (d) conversa.push({ quem: quem.nome, papelNaCela: eu, texto: d.mensagem, pensamento: d.pensamento, executar: d.executar === true, rodada })
        }
      }
      const exec = execucao && conversa.some((m) => m.quem === car.nome && m.rodada === 2 && m.executar)
      noite.cela = { carcereiro: car.nome, preso: preso.nome, conversa, executou: exec }
      if (exec) { execucao = false; noite.mortes.push(matar(preso, 'executado', `noite ${dia}`, car.nome)) }
    }
    const intocavel = noite.cela && !noite.cela.executou ? preso : null
    const lv = lobos.filter((l) => l.vivo && l !== intocavel)
    const investigar = async (quem, chave) => {
      if (!quem?.vivo || quem === intocavel) return
      const d = await pedir(quem, sistema(quem), `${contexto(quem)}\n\nNOITE ${dia}. De quem você quer descobrir o PAPEL esta noite? (vivos: ${vivos().filter(x=>x!==quem && x!==intocavel).map(x=>x.nome).join(', ')})\nResponda SÓ com JSON: {"alvo": "nome", "pensamento": "por quê"}`, (x) => porNome(x.alvo)?.vivo && porNome(x.alvo) !== quem && porNome(x.alvo) !== intocavel, null)
      if (!d) return
      const a = porNome(d.alvo)
      noite[chave] = { alvo: a.nome, papel: a.papel, pensamento: d.pensamento }
      segredos[quem.nome].push(`Na noite ${dia} você viu que ${a.nome} é ${NOME_PAPEL[a.papel]}.`)
    }
    // A consulta acontece antes do acordo de ataque e chega aos parceiros livres.
    await investigar(papel('lobo_vidente'), 'loboVidente')
    if (noite.loboVidente) {
      const info = noite.loboVidente
      info.momento = 'antes_chat'
      info.compartilhadoCom = lv.map(l=>l.nome)
      for (const l of lv) if (l.papel !== 'lobo_vidente') segredos[l.nome].push(`Na noite ${dia}, o Lobo Vidente revelou: ${info.alvo} é ${NOME_PAPEL[info.papel]}.`)
    }
    for (let rodada = 1; rodada <= 2; rodada++) {
      for (const l of lv) {
        const d = await pedir(l, sistema(l), `${contexto(l)}\n\nNOITE ${dia}. Chat secreto dos lobos (rodada ${rodada} de 2):\n${noite.chat.map((m) => `${m.nome}: ${m.texto} (vota em: ${m.alvo})`).join('\n') || '(vazio)'}\n${intocavel && LOBO(intocavel.papel) ? `Seu parceiro ${intocavel.nome} foi PRESO pelo Carcereiro esta noite.\n` : ''}Quem pode ser atacado: ${vivos().filter((x) => !LOBO(x.papel)).map((x) => x.nome).join(', ')}.\nResponda SÓ com JSON: {"mensagem": "o que você diz no chat dos lobos", "alvo": "nome de quem atacar", "pensamento": "o que você pensa de verdade"}`,
          (x) => x.mensagem && porNome(x.alvo)?.vivo && !LOBO(porNome(x.alvo).papel), null)
        if (d) noite.chat.push({ nome: l.nome, texto: d.mensagem, alvo: porNome(d.alvo).nome, pensamento: d.pensamento, rodada })
      }
    }
    const finais = lv.map((l) => [...noite.chat].reverse().find((m) => m.nome === l.nome)?.alvo).filter(Boolean)
    const alvoLobo = porNome(escolherAlvoLobos(finais, rnd))
    noite.alvoLobos = alvoLobo?.nome ?? null
    await investigar(papel('vidente'), 'vidente')
    const med = papel('medico')
    if (med?.vivo && med !== intocavel) {
      const d = await pedir(med, sistema(med), `${contexto(med)}\n\nNOITE ${dia}. Quem você protege dos lobos esta noite? (não pode ser você; vivos: ${nomesVivos(med)})\nResponda SÓ com JSON: {"alvo": "nome", "pensamento": "por quê"}`, (x) => porNome(x.alvo)?.vivo && porNome(x.alvo) !== med, null)
      if (d) noite.medico = { alvo: porNome(d.alvo).nome, pensamento: d.pensamento }
    }
    const observar = async (tipo, chave) => {
      const quem = papel(tipo)
      if (!quem?.vivo || quem === intocavel) return
      const candidatos = vivos().filter(x=>x!==quem && x!==intocavel)
      if (!candidatos.length) return
      const tarefa = tipo === 'xerife' ? 'vigiar; se morrer, você recebe dois suspeitos' : 'verificar; você só saberá se pelo menos um matou, sem saber qual'
      const r = await pedir(quem, sistema(quem), `${contexto(quem)}\nNOITE ${dia}. Escolha um ou dois jogadores para ${tarefa}. Vivos: ${candidatos.map(x=>x.nome).join(', ')}.\nResponda SÓ com JSON: {"alvos":["nome", "outro nome opcional"], "pensamento":"por quê"}`,
        x=>Array.isArray(x.alvos) && x.alvos.length>=1 && x.alvos.length<=2 && new Set(x.alvos.map(a=>porNome(a)?.nome)).size===x.alvos.length && x.alvos.every(a=>candidatos.includes(porNome(a))), null)
      noite[chave] = {alvos:r.alvos.map(a=>porNome(a).nome), pensamento:r.pensamento, recebeu:false}
    }
    await observar('xerife','xerife')
    await observar('vidente_espiritual','videnteEspiritual')
    noite.salvo = alvoLobo && (noite.medico?.alvo === alvoLobo.nome || alvoLobo === intocavel)
    if (alvoLobo && alvoLobo.vivo && !noite.salvo) noite.mortes.push(matar(alvoLobo, 'lobos', `noite ${dia}`, (lv.find(l=>l.papel==='lobisomem') ?? lv[0]).nome))
    if (noite.salvo && noite.medico?.alvo === alvoLobo.nome) segredos[med.nome].push(`Na noite ${dia} você salvou ${alvoLobo.nome} dos lobos.`)
    const autores = new Set(noite.mortes.map(m=>m.autor).filter(Boolean))
    if (noite.mortes.some(m=>m.causa==='lobos')) for (const l of lv) autores.add(l.nome)
    // A lista de autores é auditoria, nunca enviada aos investigadores.
    noite.autores = [...autores]
    const xer = papel('xerife')
    if (noite.xerife && xer.vivo) {
      noite.xerife.recebeu = true
      noite.xerife.pistas = noite.xerife.alvos.flatMap(alvo=>{
        const suspeitos = suspeitosXerife(alvo, xer.nome, noite.mortes, js, rnd)
        return suspeitos ? [{alvo,suspeitos}] : []
      })
      for (const p of noite.xerife.pistas) segredos[xer.nome].push(`Na noite ${dia}, ${p.alvo} morreu: quem matou foi ${p.suspeitos.join(' OU ')}. Você não sabe qual dos dois.`)
      if (!noite.xerife.pistas.length) segredos[xer.nome].push(`Na noite ${dia} seus vigiados não geraram pistas de assassinato.`)
    }
    const ve = papel('vidente_espiritual')
    if (noite.videnteEspiritual && ve.vivo) {
      const info = noite.videnteEspiritual
      info.recebeu = true
      info.matou = espiritoMatou(info.alvos,autores)
      segredos[ve.nome].push(`Na noite ${dia}, resultado conjunto de ${info.alvos.join(' e ')}: ${info.matou?'pelo menos um matou (não diz qual)':'nenhum matou'}.`)
    }
    log.noites.push(noite)
    salvarParcial()
    historico.push(noite.mortes.length ? `Amanhecer do dia ${dia}: ${noite.mortes.map((m) => m.causa === 'executado' ? `${m.nome} foi EXECUTADO pelo Carcereiro (era ${NOME_PAPEL[m.papel]})` : `${m.nome} foi morto pelos lobos (era ${NOME_PAPEL[m.papel]})`).join('; ')}.` : `Amanhecer do dia ${dia}: ninguém morreu.`)
    if (noite.cela) segredos[preso.nome].push(`Na noite ${dia} você foi preso pelo Carcereiro.`)
    console.log(`[p${n}] noite ${dia}: cela ${noite.cela?.preso ?? '-'}${noite.cela?.executou ? ' EXECUTADO' : ''} lobos→${noite.alvoLobos} vid→${noite.vidente?.alvo} lv→${noite.loboVidente?.alvo} med→${noite.medico?.alvo} | mortes: ${noite.mortes.map((m) => m.nome).join(', ')}`)
    if ((fim = vitoria())) break

    // ---------------- DIA
    const d = { n: dia, falas: [], tiros: [], acoes: [], votos: {}, pensamentosVoto: {}, linchado: null, preso: null }
    for (let rodada = 1; rodada <= 2; rodada++) {
      for (const j of embaralhar(vivos())) {
        if (!j.vivo) continue
        const arma = j.papel === 'pistoleiro' && balas > 0
        const santo = j.papel === 'padre' && aguaBenta
        const pedeAgua = santo ? '\nVocê tem UMA água benta. Pode usar AGORA: se o alvo for lobo ele morre, caso contrário VOCÊ morre. Ponha o nome em \"aguaBenta\" ou null para guardar.' : ''
        const eventos = () => d.acoes.map(a=>`[ÁGUA BENTA] ${a.ator} usou em ${a.alvo}; ${a.morte.nome} morreu e era ${NOME_PAPEL[a.morte.papel]}.`).join('\n')
        const pedeTiro = arma ? `\nVocê tem ${balas} bala(s). Se quiser atirar AGORA em alguém, ponha o nome em "atirar" (senão null)${revelado ? '' : '; ao atirar, todos descobrem que você é o Pistoleiro'}.` : ''
        const loboChat = LOBO(j.papel) ? `\nChat dos lobos desta noite: ${noite.chat.map((m) => `${m.nome}: ${m.texto}`).join(' | ') || '-'}` : ''
        const r = await pedir(j, sistema(j), `${contexto(j)}${loboChat}\n\nDIA ${dia}, discussão (rodada ${rodada} de 2). Vivos: ${nomesVivos()}.\nChat de hoje:\n${d.falas.map((f) => `${f.nome}: ${f.fala}`).join('\n') || '(ninguém falou ainda)'}${d.tiros.map((t) => `\n[TIRO] O Pistoleiro ${t.atirador} atirou em ${t.nome}, que era ${NOME_PAPEL[t.papel]}.`).join('')}${pedeTiro}${pedeAgua}\n${eventos()}\nResponda SÓ com JSON: {"fala": "o que você escreve no chat", "pensamento": "o que você pensa de verdade (secreto)", "expressao": "${EXPR.join('|')}"${arma ? ', "atirar": "nome ou null"' : ''}${santo ? ', "aguaBenta": "nome ou null"' : ''}}`,
          (x) => x.fala && (!santo || x.aguaBenta===null || (porNome(x.aguaBenta)?.vivo && porNome(x.aguaBenta)!==j)), null)
        if (!r) continue
        d.falas.push({ nome: j.nome, id: j.id, rodada, fala: r.fala, pensamento: r.pensamento, expressao: r.expressao })
        console.log(`[p${n}] dia ${dia} ${j.nome}: ${r.fala}`)
        if (santo && r.aguaBenta) {
          const alvo = porNome(r.aguaBenta)
          const resultado = resolverAguaBenta(j,alvo)
          aguaBenta = false
          const morte = matar(resultado.morto,'agua_benta',`dia ${dia}`,j.nome)
          d.acoes.push({tipo:'agua_benta',ator:j.nome,alvo:alvo.nome,acertou:resultado.acertou,morte,depoisDaFala:d.falas.length-1})
          if ((fim = vitoria())) break
        }
        const alvo = arma && r.atirar && porNome(r.atirar)
        if (alvo && alvo.vivo && alvo !== j) {
          balas--; revelado = true
          const t = { ...matar(alvo, 'tiro', `dia ${dia}`,j.nome), atirador: j.nome, depoisDaFala: d.falas.length - 1 }
          d.tiros.push(t)
          console.log(`[p${n}]   TIRO: ${j.nome} → ${alvo.nome} (${alvo.papel})`)
          if ((fim = vitoria())) break
        }
      }
      if (fim) break
    }
    const resumoAcoes = d.acoes.map(a=>`O Padre ${a.ator} usou água benta em ${a.alvo}; ${a.morte.nome} morreu e era ${NOME_PAPEL[a.morte.papel]}.`).join(' ')
    if (resumoAcoes) historico.push(`Dia ${dia}: ${resumoAcoes}`)
    if (!fim) {
      await Promise.all(vivos().map(async (j) => {
        const r = await pedir(j, sistema(j), `${contexto(j)}\n\nDIA ${dia}, VOTAÇÃO. Chat de hoje:\n${d.falas.map((f) => `${f.nome}: ${f.fala}`).join('\n')}${d.tiros.map((t) => `\n[TIRO] ${t.atirador} (Pistoleiro) matou ${t.nome}, que era ${NOME_PAPEL[t.papel]}.`).join('')}\nVote em quem linchar (vivos: ${nomesVivos(j)}) ou "ninguém".\nResponda SÓ com JSON: {"voto": "nome ou ninguém", "pensamento": "por quê"}`,
          (x) => x.voto && (porNome(x.voto)?.vivo || /ningu/i.test(x.voto)), { voto: 'ninguém' })
        d.votos[j.nome] = porNome(r.voto)?.nome ?? 'ninguém'
        d.pensamentosVoto[j.nome] = r.pensamento
      }))
      const cont = {}
      for (const v of Object.values(d.votos)) if (v !== 'ninguém') cont[v] = (cont[v] ?? 0) + 1
      const ord = Object.entries(cont).sort((a, b) => b[1] - a[1])
      if (ord.length && (ord.length === 1 || ord[0][1] > ord[1][1])) {
        d.linchado = matar(porNome(ord[0][0]), 'linchado', `dia ${dia}`)
        if (d.linchado.papel === 'bobo') fim = 'bobo'
      }
    }
    // o Carcereiro escolhe quem prender na próxima noite
    preso = null
    if (!fim && !vitoria() && car?.vivo) {
      const r = await pedir(car, sistema(car), `${contexto(car)}\n\nFim do DIA ${dia}. Chat de hoje:\n${d.falas.map((f) => `${f.nome}: ${f.fala}`).join('\n')}\n${d.linchado ? `${d.linchado.nome} foi linchado e era ${NOME_PAPEL[d.linchado.papel]}.` : 'Ninguém foi linchado.'}\nQuem você prende esta noite? (vivos: ${nomesVivos(car)}; execuções restantes: ${execucao ? 1 : 0})\nResponda SÓ com JSON: {"alvo": "nome", "pensamento": "por quê"}`, (x) => porNome(x.alvo)?.vivo && porNome(x.alvo) !== car, null)
      if (r) { preso = porNome(r.alvo); d.preso = { nome: preso.nome, pensamento: r.pensamento } }
    }
    log.dias.push(d)
    salvarParcial()
    historico.push(`Dia ${dia}: ${d.tiros.map((t) => `o Pistoleiro ${t.atirador} atirou em ${t.nome} (era ${NOME_PAPEL[t.papel]}). `).join('')}${Object.keys(d.votos).length ? `votos ${Object.entries(d.votos).map(([a, b]) => `${a}→${b}`).join(', ')}. ` : ''}${d.linchado ? `${d.linchado.nome} foi linchado(a) e era ${NOME_PAPEL[d.linchado.papel]}.` : Object.keys(d.votos).length ? 'Empate: ninguém foi linchado.' : ''}`)
    console.log(`[p${n}] dia ${dia}: linchado ${d.linchado?.nome ?? '-'} (${d.linchado?.papel ?? ''}) tiros ${d.tiros.map((t) => t.nome).join(',') || '-'} preso→${d.preso?.nome ?? '-'}`)
    fim = fim ?? vitoria()
  }
  log.resultado = { vencedor: fim ?? 'empate', dias: log.dias.length, vivos: vivos().map((j) => j.nome) }
  const resumo = `Lobos: ${lobos.map((l) => `${l.nome} (${l.modelo}, ${NOME_PAPEL[l.papel]})`).join(' e ')}. ${js.filter((j) => !LOBO(j.papel)).map((j) => `${j.nome}=${NOME_PAPEL[j.papel]}`).join(', ')}. ${historico.join(' ')} Vencedor: ${fim === 'lobos' ? 'os lobos' : fim === 'aldeia' ? 'a vila' : fim === 'bobo' ? 'o Bobo' : 'ninguém'}.`
  const reflexoes = {}
  await Promise.all(js.map(async (j) => {
    const r = await perguntar(j.provider, sistema(j), `A partida acabou. ${resumo}\nEm 1 ou 2 frases: o que você aprendeu e em quem vai confiar ou desconfiar na próxima? Responda só o texto.`, { maxTokens: 300, timeoutMs: 120000 })
    reflexoes[j.id] = r.ok ? String(r.text).replace(/<think>[\s\S]*?<\/think>/g, '').trim().slice(0, 400) : ''
  }))
  log.reflexoes = reflexoes
  memoria.partidas.push({ n, resumo, reflexoes })
  fs.writeFileSync(memoriaArq, JSON.stringify(memoria, null, 1))
  fs.writeFileSync(path.join(DIR, `partida${n}.json`), JSON.stringify(log, null, 1))
  console.log(`[p${n}] FIM: ${log.resultado.vencedor} em ${log.resultado.dias} dias`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const n = Number(process.argv[2] ?? 5)
  await partida(n, Number(process.argv[3] ?? 2000 + n * 7919))
}

