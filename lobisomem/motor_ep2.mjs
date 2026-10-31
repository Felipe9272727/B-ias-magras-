// Episódio 2: sala de 16, papéis sorteados e memórias privadas por personagem.
// Logs reais somente após respostas do modelo; testes são marcados synthetic.
// Uso: node motor_ep2.mjs <partida 5–8> [semente]
import fs from 'node:fs'
import path from 'node:path'
import { perguntar } from './ia_ep2.mjs'
import {CONFIG, LOBO, parceirosLobos, escolherAlvoLobos, vencedor, resolverAguaBenta, espiritoMatou, suspeitosXerife, mesmoTime, pesoVoto, votosAtaque, podeAtirar} from './regras_ep2.mjs'
import {pathToFileURL} from 'node:url'
import {atomicJson, diarioDecisoes, hash} from './durabilidade_ep2.mjs'

const DIR = path.resolve(process.env.LOBO_EP2_LOG_DIR ?? path.join(path.dirname(new URL(import.meta.url).pathname), 'logs_ep2'))
fs.mkdirSync(DIR, { recursive: true })

export const JOGADORES = CONFIG.players.map(j => ({...j, provider:(j.transport==='chatgpt-work-subagent'?'work:':'or:')+j.modelId}))
const PAPEIS = CONFIG.roles
export const NOME_PAPEL = { lobisomem: 'Lobisomem', lobo_vidente: 'Lobo Vidente', vidente: 'Vidente', medico: 'Médico', carcereiro: 'Carcereiro', pistoleiro: 'Pistoleiro', bobo: 'Bobo', aldeao: 'Aldeão', padre:'Padre', xerife:'Xerife', vidente_espiritual:'Vidente Espiritual', detetive:'Detetive', prefeito:'Prefeito', lobo_alfa:'Lobo Alfa' }
const EXPR = ['neutro', 'desconfiado', 'assustado', 'bravo', 'rindo', 'culpado', 'chocado', 'pensando', 'chorando']
const MAX_DIAS = CONFIG.maxDays

const REGRAS = `REGRAS (Lobisomem no estilo Wolvesville): 16 jogadores. TIME DOS LOBOS: 2 Lobisomens, 1 Lobo Alfa (voto noturno vale dois; pode enviar um recado privado aos lobos por dia) e 1 Lobo Vidente (se conhecem e matam juntos uma pessoa por noite; o Lobo Vidente descobre o papel antes do chat secreto, e os lobos livres recebem o resultado ainda nessa noite). TIME DA VILA: Vidente (descobre o papel exato de alguém por noite), Médico (protege um jogador por noite dos lobos; não pode se proteger), Carcereiro (de dia escolhe alguém para prender à noite; o preso não pode agir nem ser atacado, os dois conversam em segredo sem o preso saber quem é o carcereiro, e UMA vez no jogo o Carcereiro pode executar o preso), Pistoleiro (tem 2 balas, no máximo UM disparo por dia; no dia 1 só pode atirar no início da votação, depois pode atirar também na discussão; no primeiro tiro todos descobrem que ele é o Pistoleiro) Padre (UMA água benta usada de DIA: mata o alvo se for lobo, mas se errar o próprio Padre morre; não converte ninguém), Xerife (vigia até dois jogadores por noite; se um morrer recebe dois suspeitos, só um executou aquela morte), Vidente Espiritual (verifica até dois jogadores à noite; ao amanhecer sabe apenas se pelo menos um deles matou, sem saber qual; um ataque dos lobos que matou conta para todos os lobos livres participantes) Detetive (compara dois jogadores à noite e descobre APENAS se são do mesmo time, sem descobrir os papéis), Prefeito (pode se revelar de dia; depois disso seu voto vale dois pelo resto da partida) e Aldeão (sem poder). SOLO: Bobo (vence sozinho se for LINCHADO pela vila; aí o jogo acaba). Ninguém sabe o papel dos outros. Quando alguém morre, o papel aparece para todos. De DIA todos discutem e votam; o mais votado é linchado (empate: ninguém). A VILA vence quando todos os 4 lobos morrerem; os LOBOS vencem quando forem tantos quanto os outros vivos.`

let rnd = Math.random
function semear(s) { let x = s >>> 0; rnd = () => { x = (x + 0x6d2b79f5) >>> 0; let t = x; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const embaralhar = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

function json(txt) {
  const t = String(txt ?? '').replace(/<think>[\s\S]*?<\/think>/g, '')
  const a = t.indexOf('{'), z = t.lastIndexOf('}')
  if (a < 0 || z < a) return null
  try { return JSON.parse(t.slice(a, z + 1)) } catch { return null }
}

async function pedir(chamar, j, system, prompt, valida, padrao) {
  for (let t = 0; t < 4; t++) {
    const r = await chamar(j, system, prompt, { maxTokens: 600, timeoutMs: 180000, attempt:t })
    const d = r.ok ? json(r.text) : null
    if (d && valida(d)) return d
    console.error(`  [${j.nome}] resposta inválida (${t + 1}): ${String(r.text).slice(0, 100)}`)
  }
  throw new Error(`Resposta inválida de ${j.nome}; partida pausada sem fabricar voto ou fala.`)
}

export async function partida(n, semente) {
  if (fs.existsSync(path.join(DIR, `partida${n}.json`))) throw new Error('Partida já concluída; não será refeita: '+n)
  const synthetic=process.env.LOBO_EP2_TEST==='1'
  if(!Number.isSafeInteger(semente) || !Number.isSafeInteger(n)) throw new Error('Semente e partida devem ser inteiros explícitos.')
  const recovery=JSON.parse(fs.readFileSync(new URL('./recovery/status.json',import.meta.url),'utf8'))
  if(!synthetic && recovery.blockedMatches.includes(n)) throw new Error('Partida '+n+' bloqueada: o fragmento recuperado não contém estado completo. Não reinicie nem invente decisões ausentes.')
  if(!synthetic && n>5 && !fs.existsSync(path.join(DIR,`partida${n-1}.json`))) throw new Error('Falta a partida anterior concluída; memória e continuidade não podem ser fabricadas.')
  const runDir=path.join(DIR,`execucao${n}`)
  if(fs.existsSync(path.join(DIR,`partida${n}.partial.json`)) && !fs.existsSync(path.join(runDir,'decisoes.json'))) throw new Error('Log parcial sem diário de decisões: precisa de recuperação, não de novo sorteio.')
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
  if(!synthetic) for(let p=5;p<n;p++) {
    const concluida=JSON.parse(fs.readFileSync(path.join(DIR,`partida${p}.json`),'utf8'))
    if(concluida.synthetic || !concluida.resumo || !concluida.reflexoes) throw new Error('Partida anterior sem memória real auditável: '+p)
    if(!memoria.partidas.some(m=>m.n===p)) memoria.partidas.push({n:p,resumo:concluida.resumo,reflexoes:concluida.reflexoes})
  }
  const fontes=['motor_ep2.mjs','regras_ep2.mjs','ia_ep2.mjs','durabilidade_ep2.mjs']
  const diario=diarioDecisoes(runDir,{partida:n,semente,synthetic,config:CONFIG,memoria,
    codigo:Object.fromEntries(fontes.map(f=>[f,hash(fs.readFileSync(new URL(f,import.meta.url),'utf8'))]))})
  const chamar=(j,system,prompt,options)=>diario.chamar(j.id,system,prompt,options,()=>perguntar(j.provider,system,prompt,{...options,playerId:j.id}))
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

  const salvarParcial = () => atomicJson(path.join(DIR, `partida${n}.partial.json`),log)
  let fim = null
  for (let dia = 1; dia <= MAX_DIAS && !fim; dia++) {
    // ---------------- NOITE
    const noite = { n: dia, cela: null, chat: [], vidente: null, loboVidente: null, medico: null, xerife: null, videnteEspiritual: null, detetive:null, mortes: [] }
    const car = papel('carcereiro')
    if (preso?.vivo && car?.vivo) {
      // conversa na cela: 2 rodadas, o preso não sabe quem é o carcereiro
      const conversa = []
      for (let rodada = 1; rodada <= 2; rodada++) {
        for (const [quem, eu] of [[car, 'o CARCEREIRO'], [preso, 'o PRESO']]) {
          const tarefa = quem === car
            ? `Você prendeu ${preso.nome} esta noite. Interrogue o preso (ele não sabe quem você é).${rodada === 2 ? ` Decida também se EXECUTA ${preso.nome} agora (você tem ${execucao ? '1 execução' : '0 execuções'}). Responda SÓ com JSON: {"mensagem": "o que você diz", "executar": true ou false, "pensamento": "o que você pensa de verdade"}` : ' Responda SÓ com JSON: {"mensagem": "o que você diz", "pensamento": "o que você pensa de verdade"}'}`
            : `Você foi PRESO pelo Carcereiro esta noite (não sabe quem ele é). Você não pode agir nem ser atacado. Convença o Carcereiro a não te executar. Responda SÓ com JSON: {"mensagem": "o que você diz", "pensamento": "o que você pensa de verdade"}`
          const d = await pedir(chamar, quem, sistema(quem), `${contexto(quem)}\n\nNOITE ${dia}, cela da prisão. Conversa até agora:\n${conversa.map((m) => `${m.quem === car.nome ? 'Carcereiro' : preso.nome}: ${m.texto}`).join('\n') || '(vazia)'}\n${tarefa}`, (x) => x.mensagem, null)
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
      const d = await pedir(chamar, quem, sistema(quem), `${contexto(quem)}\n\nNOITE ${dia}. De quem você quer descobrir o PAPEL esta noite? (vivos: ${vivos().filter(x=>x!==quem && x!==intocavel).map(x=>x.nome).join(', ')})\nResponda SÓ com JSON: {"alvo": "nome", "pensamento": "por quê"}`, (x) => porNome(x.alvo)?.vivo && porNome(x.alvo) !== quem && porNome(x.alvo) !== intocavel, null)
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
        const d = await pedir(chamar, l, sistema(l), `${contexto(l)}\n\nNOITE ${dia}. Chat secreto dos lobos (rodada ${rodada} de 2):\n${noite.chat.map((m) => `${m.nome}: ${m.texto} (vota em: ${m.alvo})`).join('\n') || '(vazio)'}\n${intocavel && LOBO(intocavel.papel) ? `Seu parceiro ${intocavel.nome} foi PRESO pelo Carcereiro esta noite.\n` : ''}Quem pode ser atacado: ${vivos().filter((x) => !LOBO(x.papel)).map((x) => x.nome).join(', ')}.\nResponda SÓ com JSON: {"mensagem": "o que você diz no chat dos lobos", "alvo": "nome de quem atacar", "pensamento": "o que você pensa de verdade"}`,
          (x) => x.mensagem && porNome(x.alvo)?.vivo && !LOBO(porNome(x.alvo).papel), null)
        if (d) noite.chat.push({ nome: l.nome, texto: d.mensagem, alvo: porNome(d.alvo).nome, pensamento: d.pensamento, rodada })
      }
    }
    const finais = votosAtaque(lv,noite.chat)
    const alvoLobo = porNome(escolherAlvoLobos(finais, rnd))
    noite.alvoLobos = alvoLobo?.nome ?? null
    await investigar(papel('vidente'), 'vidente')
    const med = papel('medico')
    if (med?.vivo && med !== intocavel) {
      const d = await pedir(chamar, med, sistema(med), `${contexto(med)}\n\nNOITE ${dia}. Quem você protege dos lobos esta noite? (não pode ser você; vivos: ${nomesVivos(med)})\nResponda SÓ com JSON: {"alvo": "nome", "pensamento": "por quê"}`, (x) => porNome(x.alvo)?.vivo && porNome(x.alvo) !== med, null)
      if (d) noite.medico = { alvo: porNome(d.alvo).nome, pensamento: d.pensamento }
    }
    const observar = async (tipo, chave) => {
      const quem = papel(tipo)
      if (!quem?.vivo || quem === intocavel) return
      const candidatos = vivos().filter(x=>x!==quem && x!==intocavel)
      if (!candidatos.length) return
      const tarefa = tipo === 'xerife' ? 'vigiar; se morrer, você recebe dois suspeitos' : 'verificar; você só saberá se pelo menos um matou, sem saber qual'
      const r = await pedir(chamar, quem, sistema(quem), `${contexto(quem)}\nNOITE ${dia}. Escolha um ou dois jogadores para ${tarefa}. Vivos: ${candidatos.map(x=>x.nome).join(', ')}.\nResponda SÓ com JSON: {"alvos":["nome", "outro nome opcional"], "pensamento":"por quê"}`,
        x=>Array.isArray(x.alvos) && x.alvos.length>=1 && x.alvos.length<=2 && new Set(x.alvos.map(a=>porNome(a)?.nome)).size===x.alvos.length && x.alvos.every(a=>candidatos.includes(porNome(a))), null)
      noite[chave] = {alvos:r.alvos.map(a=>porNome(a).nome), pensamento:r.pensamento, recebeu:false}
    }
    await observar('xerife','xerife')
    await observar('vidente_espiritual','videnteEspiritual')

    const det = papel('detetive')
    if (det?.vivo && det !== intocavel) {
      const candidatos = vivos().filter(x=>x!==det && x!==intocavel)
      if (candidatos.length>=2) {
        const r = await pedir(chamar, det,sistema(det),`${contexto(det)}\nNOITE ${dia}. Escolha DOIS jogadores para comparar o time. Vivos: ${candidatos.map(x=>x.nome).join(', ')}.\nResponda SÓ com JSON: {"alvos":["nome","outro nome"],"pensamento":"por quê"}`,
          x=>Array.isArray(x.alvos) && x.alvos.length===2 && porNome(x.alvos[0])!==porNome(x.alvos[1]) && x.alvos.every(a=>candidatos.includes(porNome(a))),null)
        const alvos=r.alvos.map(a=>porNome(a))
        noite.detetive={alvos:alvos.map(a=>a.nome),mesmoTime:mesmoTime(alvos[0].papel,alvos[1].papel),pensamento:r.pensamento}
        segredos[det.nome].push(`Na noite ${dia}: ${alvos.map(a=>a.nome).join(' e ')} ${noite.detetive.mesmoTime?'são':'NÃO são'} do mesmo time.`)
      }
    }
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
    const d = { n: dia, falas: [], tiros: [], acoes: [], revelacoes:[], recados:[], votos: {}, pesosVoto:{}, pensamentosVoto: {}, linchado: null, preso: null }
    for (let rodada = 1; rodada <= 2; rodada++) {
      for (const j of embaralhar(vivos())) {
        if (!j.vivo) continue
        const arma = podeAtirar(j,dia,'discussao',balas,d.tiros)
        const prefeito = j.papel === 'prefeito' && !j.prefeitoRevelado
        const alfa = j.papel === 'lobo_alfa' && !d.recados.some(m=>m.nome===j.nome)
        const pedePrefeito = prefeito ? '\nVocê pode revelar seu papel para todos e dobrar seu voto até o fim do jogo: campo "revelarPrefeito": true ou false.' : ''
        const pedeRecado = alfa ? '\nVocê pode mandar UM recado privado aos lobos hoje. Campo "recadoLobos": mensagem curta ou null. Só os lobos vivos recebem.' : ''
        const santo = j.papel === 'padre' && aguaBenta
        const pedeAgua = santo ? '\nVocê tem UMA água benta. Pode usar AGORA: se o alvo for lobo ele morre, caso contrário VOCÊ morre. Ponha o nome em \"aguaBenta\" ou null para guardar.' : ''
        const eventos = () => d.acoes.map(a=>`[ÁGUA BENTA] ${a.ator} usou em ${a.alvo}; ${a.morte.nome} morreu e era ${NOME_PAPEL[a.morte.papel]}.`).join('\n')
        const pedeTiro = arma ? `\nVocê tem ${balas} bala(s). Se quiser atirar AGORA em alguém, ponha o nome em "atirar" (senão null)${revelado ? '' : '; ao atirar, todos descobrem que você é o Pistoleiro'}.` : ''
        const loboChat = LOBO(j.papel) ? `\nChat dos lobos desta noite: ${noite.chat.map((m) => `${m.nome}: ${m.texto}`).join(' | ') || '-'}` : ''
        const r = await pedir(chamar, j, sistema(j), `${contexto(j)}${loboChat}\n\nDIA ${dia}, discussão (rodada ${rodada} de 2). Vivos: ${nomesVivos()}.\nChat de hoje:\n${d.falas.map((f) => `${f.nome}: ${f.fala}`).join('\n') || '(ninguém falou ainda)'}${d.tiros.map((t) => `\n[TIRO] O Pistoleiro ${t.atirador} atirou em ${t.nome}, que era ${NOME_PAPEL[t.papel]}.`).join('')}${pedeTiro}${pedeAgua}${pedePrefeito}${pedeRecado}\n${eventos()}\nResponda SÓ com JSON: {"fala": "o que você escreve no chat", "pensamento": "o que você pensa de verdade (secreto)", "expressao": "${EXPR.join('|')}"${arma ? ', "atirar": "nome ou null"' : ''}${santo ? ', "aguaBenta": "nome ou null"' : ''}${prefeito ? ', "revelarPrefeito": true ou false' : ''}${alfa ? ', "recadoLobos": "mensagem ou null"' : ''}}`,
          (x) => x.fala && (!prefeito || typeof x.revelarPrefeito==='boolean') && (!alfa || x.recadoLobos===null || typeof x.recadoLobos==='string') && (!santo || x.aguaBenta===null || (porNome(x.aguaBenta)?.vivo && porNome(x.aguaBenta)!==j)), null)
        if (!r) continue
        d.falas.push({ nome: j.nome, id: j.id, rodada, fala: r.fala, pensamento: r.pensamento, expressao: r.expressao })
        console.log(`[p${n}] dia ${dia} ${j.nome}: ${r.fala}`)
        if (prefeito && r.revelarPrefeito) {
          j.prefeitoRevelado=true
          d.revelacoes.push({nome:j.nome,papel:j.papel,depoisDaFala:d.falas.length-1})
          historico.push(`Dia ${dia}: ${j.nome} revelou oficialmente que é o Prefeito; seu voto passa a valer dois.`)
        }
        if (alfa && r.recadoLobos?.trim()) {
          const recado={nome:j.nome,texto:r.recadoLobos,depoisDaFala:d.falas.length-1,recebidoPor:lobos.filter(l=>l.vivo&&l!==j).map(l=>l.nome)}
          d.recados.push(recado)
          for(const l of lobos.filter(l=>l.vivo&&l!==j)) segredos[l.nome].push(`Recado privado do Lobo Alfa no dia ${dia}, ${j.nome}: ${recado.texto}`)
        }
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
    // Uma janela de habilidade antes dos votos: no dia 1 não pode disparar no debate.
    const pistoleiro=papel('pistoleiro')
    if(!fim && podeAtirar(pistoleiro,dia,'votacao',balas,d.tiros)) {
      const r=await pedir(chamar,pistoleiro,sistema(pistoleiro),`${contexto(pistoleiro)}\nDIA ${dia}, início da VOTAÇÃO, antes de recolher os votos. Chat de hoje:\n${d.falas.map(f=>`${f.nome}: ${f.fala}`).join('\n')}\nVocê tem ${balas} bala(s); só pode disparar UMA por dia. Pode atirar agora ou guardar. Vivos: ${nomesVivos(pistoleiro)}.\nResponda SÓ com JSON: {"atirar":"nome ou null","pensamento":"por quê"}`,
        x=>x.atirar===null || (porNome(x.atirar)?.vivo && porNome(x.atirar)!==pistoleiro),null)
      if(r.atirar) {
        const alvo=porNome(r.atirar)
        balas--;revelado=true
        d.tiros.push({...matar(alvo,'tiro',`dia ${dia}`,pistoleiro.nome),atirador:pistoleiro.nome,depoisDaFala:d.falas.length-1,fase:'votacao',pensamento:r.pensamento})
        fim=vitoria()
      }
    }
    if (!fim) {
      await Promise.all(vivos().map(async (j) => {
        const r = await pedir(chamar, j, sistema(j), `${contexto(j)}\n\nDIA ${dia}, VOTAÇÃO. Chat de hoje:\n${d.falas.map((f) => `${f.nome}: ${f.fala}`).join('\n')}${d.tiros.map((t) => `\n[TIRO] ${t.atirador} (Pistoleiro) matou ${t.nome}, que era ${NOME_PAPEL[t.papel]}.`).join('')}\nVote em quem linchar (vivos: ${nomesVivos(j)}) ou "ninguém".\nResponda SÓ com JSON: {"voto": "nome ou ninguém", "pensamento": "por quê"}`,
          (x) => x.voto && (porNome(x.voto)?.vivo || /ningu/i.test(x.voto)), { voto: 'ninguém' })
        d.votos[j.nome] = porNome(r.voto)?.nome ?? 'ninguém'
        d.pesosVoto[j.nome] = pesoVoto(j)
        d.pensamentosVoto[j.nome] = r.pensamento
      }))
      for (const campo of ['votos','pensamentosVoto','pesosVoto']) d[campo] = Object.fromEntries(js.filter(j=>Object.hasOwn(d[campo],j.nome)).map(j=>[j.nome,d[campo][j.nome]]))
      const cont = {}
      for (const [de,v] of Object.entries(d.votos)) if (v !== 'ninguém') cont[v] = (cont[v] ?? 0) + d.pesosVoto[de]
      const ord = Object.entries(cont).sort((a, b) => b[1] - a[1])
      if (ord.length && (ord.length === 1 || ord[0][1] > ord[1][1])) {
        d.linchado = matar(porNome(ord[0][0]), 'linchado', `dia ${dia}`)
        if (d.linchado.papel === 'bobo') fim = 'bobo'
      }
    }
    // o Carcereiro escolhe quem prender na próxima noite
    preso = null
    if (!fim && !vitoria() && car?.vivo) {
      const r = await pedir(chamar, car, sistema(car), `${contexto(car)}\n\nFim do DIA ${dia}. Chat de hoje:\n${d.falas.map((f) => `${f.nome}: ${f.fala}`).join('\n')}\n${d.linchado ? `${d.linchado.nome} foi linchado e era ${NOME_PAPEL[d.linchado.papel]}.` : 'Ninguém foi linchado.'}\nQuem você prende esta noite? (vivos: ${nomesVivos(car)}; execuções restantes: ${execucao ? 1 : 0})\nResponda SÓ com JSON: {"alvo": "nome", "pensamento": "por quê"}`, (x) => porNome(x.alvo)?.vivo && porNome(x.alvo) !== car, null)
      if (r) { preso = porNome(r.alvo); d.preso = { nome: preso.nome, pensamento: r.pensamento } }
    }
    log.dias.push(d)
    salvarParcial()
    // O chat público persiste para os próximos dias; informações privadas ficam fora.
    historico.push(`Discussão do dia ${dia}: ${d.falas.map(f=>`${f.nome}: ${f.fala}`).join(' | ')}`)
    historico.push(`Dia ${dia}: ${d.tiros.map((t) => `o Pistoleiro ${t.atirador} atirou em ${t.nome} (era ${NOME_PAPEL[t.papel]}). `).join('')}${Object.keys(d.votos).length ? `votos ${Object.entries(d.votos).map(([a, b]) => `${a}→${b}`).join(', ')}. ` : ''}${d.linchado ? `${d.linchado.nome} foi linchado(a) e era ${NOME_PAPEL[d.linchado.papel]}.` : Object.keys(d.votos).length ? 'Empate: ninguém foi linchado.' : ''}`)
    console.log(`[p${n}] dia ${dia}: linchado ${d.linchado?.nome ?? '-'} (${d.linchado?.papel ?? ''}) tiros ${d.tiros.map((t) => t.nome).join(',') || '-'} preso→${d.preso?.nome ?? '-'}`)
    fim = fim ?? vitoria()
  }
  log.resultado = { vencedor: fim ?? 'empate', dias: Math.max(log.noites.at(-1)?.n??0,log.dias.at(-1)?.n??0), vivos: vivos().map((j) => j.nome) }
  const resumo = `Lobos: ${lobos.map((l) => `${l.nome} (${l.modelo}, ${NOME_PAPEL[l.papel]})`).join(' e ')}. ${js.filter((j) => !LOBO(j.papel)).map((j) => `${j.nome}=${NOME_PAPEL[j.papel]}`).join(', ')}. ${historico.join(' ')} Vencedor: ${fim === 'lobos' ? 'os lobos' : fim === 'aldeia' ? 'a vila' : fim === 'bobo' ? 'o Bobo' : 'ninguém'}.`
  const reflexoes = {}
  log.resumo=resumo
  await Promise.all(js.map(async (j) => {
    const r = await chamar(j, sistema(j), `A partida acabou. ${resumo}\nEm 1 ou 2 frases: o que você aprendeu e em quem vai confiar ou desconfiar na próxima? Responda só o texto.`, { maxTokens: 300, timeoutMs: 120000 })
    reflexoes[j.id] = r.ok ? String(r.text).replace(/<think>[\s\S]*?<\/think>/g, '').trim().slice(0, 400) : ''
  }))
  log.reflexoes = reflexoes
  diario.concluir()
  memoria.partidas=memoria.partidas.filter(m=>m.n!==n)
  memoria.partidas.push({ n, resumo, reflexoes })
  // Primeiro o resultado auditável; a memória seguinte deriva dele.
  atomicJson(path.join(DIR, `partida${n}.json`),log)
  atomicJson(memoriaArq,memoria)
  console.log(`[p${n}] FIM: ${log.resultado.vencedor} em ${log.resultado.dias} dias`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const n = Number(process.argv[2] ?? 5)
  await partida(n, Number(process.argv[3] ?? 2000 + n * 7919))
}

