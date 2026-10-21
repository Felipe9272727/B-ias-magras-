// Motor do "60 Segundos das IAs": uma partida completa (coleta de 60 s + dias no abrigo) jogada por uma IA.
// As três IAs jogam com a MESMA semente: mesma casa, mesmos itens no chão e o mesmo sorteio de cada dia
// (o rng de cada dia é criado pela semente + número do dia, então só diverge quando o estado diverge).
//
//   node sessenta/jogo.mjs --semente ep1 --ia claude|deepseek|gpt|mock [--max-dias 60]
// Log: sessenta/logs/<semente>_<ia>.json (tudo que o vídeo precisa: rota da coleta, falas, dias, diários).
import fs from 'node:fs'
import path from 'node:path'
import {perguntar, lerJSON, uso} from '../amongus/ia.mjs'
import {criarRng} from './rng.mjs'
import {criarColeta, acoesPossiveis, aplicar, descrever, fim, terminada} from './coleta.mjs'
import {criarEstado, noAbrigo, pessoa} from './estado.mjs'
import {situacao, opcoesRacao, aplicarRacao, opcoesExpedicao, enviarExpedicao, virarDia, derrotaPadrao} from './abrigo.mjs'
import {ITENS} from './itens.mjs'
import {FINAIS} from './finais.mjs'
import {EVENTOS as EV_ITENS} from './eventos/itens.mjs'
import {EVENTOS as EV_SIMNAO} from './eventos/simnao.mjs'
import {EVENTOS as EV_PESSOAS} from './eventos/pessoas.mjs'
import {EVENTOS as EV_CADEIAS} from './eventos/cadeias.mjs'

export const PROVEDORES = {
  claude: 'sonnet', // Sonnet no esforço alto (o Opus devolvia resposta vazia quando o pedido tinha o campo "pensamento")
  deepseek: 'or:deepseek/deepseek-v4.1-flash',
  gpt: 'or:openai/gpt-5.6-terra', // o Luna ficou de fora do abrigo duas vezes; o Terra é mais caro e mais esperto
  minimax: 'or:minimax/minimax-m3.1-flash:free', // participante surpresa (lançado em out/2026, só a versão grátis)
  mock: 'mock',
}
export const EVENTOS = [...EV_ITENS, ...EV_SIMNAO, ...EV_PESSOAS, ...EV_CADEIAS]
const DIA_TRANQUILO = 0.25 // fração do peso total que vira "hoje nada aconteceu" (só quando nenhum evento força o dia)
const PESO_FORCADO = 50    // cadeia com passo pendente costuma usar peso alto: aí o dia sempre tem evento

const seguro = (f, padrao) => { try { return f() } catch { return padrao } }
const normal = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim()

// ---------------------------------------------------------------- prompts
const REGRAS = `Você está jogando "60 Segundos", um jogo de sobrevivência num abrigo antinuclear depois de um ataque nuclear.
Você é o pai, Osvaldo. A família: Celeste (mãe), Juju (filha) e Tico (filho).
Fase 1, a COLETA: a sirene tocou e você tem 60 segundos para correr pela casa, pegar comida (sopa), água, itens úteis
e pessoas da família, e levar tudo até o alçapão do abrigo. Suas mãos têm 4 espaços. Se o tempo acabar e você não
estiver no alçapão, você fica de fora e a partida acaba.
Fase 2, o ABRIGO: cada dia você lê a situação, decide o evento do dia (se houver), quem come e bebe, e se alguém sai
em expedição para buscar suprimentos. Uma lata de sopa ou uma garrafa de água rende 4 porções. Ninguém precisa comer
todo dia: sem sopa uma pessoa aguenta cerca de 10 dias, sem água cerca de 5. Expedições trazem itens, mas a pessoa
fica 2+ dias fora e pode voltar ferida, doente ou não voltar. O objetivo é sobreviver até ser resgatado
(ou achar outro jeito de sair). Responda SEMPRE só com um objeto JSON, em português do Brasil.`

function promptColeta(c, opcoes) {
  return `${descrever(c)}

Ações possíveis agora (copie o texto exato de UMA):
${opcoes.map((o) => `- ${o}`).join('\n')}

Responda: {"pensamento": "o que você está pensando, curto", "fala": "o que você grita em voz alta (curto, ou vazio)", "acao": "texto exato da ação"}`
}

function promptDia(e, ev, escolhas, memoria) {
  const r = opcoesRacao(e)
  const x = opcoesExpedicao(e)
  const nomeP = (id) => `${pessoa(e, id).nome} [${id}]`
  const partes = [situacao(e), '']
  if (memoria.length) partes.push('Suas anotações dos últimos dias:', ...memoria.map((m) => `- Dia ${m.dia}: ${m.texto}`), '')
  if (ev) {
    partes.push(`EVENTO DE HOJE: ${ev.texto}`)
    partes.push('Escolhas (use o id):', ...escolhas.map((o) => `- ${o.id}: ${o.texto}`), '')
  } else partes.push('Hoje não aconteceu nada de especial.', '')
  partes.push(`RAÇÃO DE HOJE. Podem comer: ${r.sopa.map(nomeP).join(', ') || 'ninguém'}. Podem beber: ${r.agua.map(nomeP).join(', ') || 'ninguém'}.`)
  partes.push(`Estoque em porções: sopa ${r.estoque.sopa}, água ${r.estoque.agua}.`)
  if (x.quem?.length) {
    partes.push(`EXPEDIÇÃO (opcional). Pode sair: ${x.quem.map(nomeP).join(', ')}. Itens que pode levar: ${x.itens.map((i) => `${ITENS[i].nome} [${i}]`).join(', ') || 'nenhum'}.`)
    partes.push(`Leva no máximo ${x.capacidade.semMala} item (ou ${x.capacidade.comMala} contando a mala, se levar a mala).`)
  } else partes.push(`EXPEDIÇÃO: não dá hoje (${x.motivo ?? 'ninguém pode sair'}).`)
  partes.push('', `Responda: {"pensamento": "seu raciocínio, curto", "diario": "uma frase para o diário da família, com humor"${ev ? ', "escolha": "id da escolha do evento"' : ''}, "racao": {"sopa": [ids], "agua": [ids]}, "expedicao": {"quem": "id", "itens": [ids]} ou null}`)
  return partes.join('\n')
}

// ---------------------------------------------------------------- mock (testa o motor sem gastar nada)
function mockColeta(c, opcoes) {
  const achar = (ini) => opcoes.find((o) => o.startsWith(ini))
  const tarde = c.totalMs - c.gasto < 20000
  const acao = achar('largar tudo no abrigo') ?? (tarde && achar('correr até o abrigo')) ?? achar('pegar ')
    ?? (c.maos.length >= 3 && achar('correr até o abrigo')) ?? opcoes.find((o) => o.startsWith('correr até ') && o !== 'correr até o abrigo') ?? opcoes[0]
  return () => JSON.stringify({pensamento: 'corre!', fala: '', acao})
}
function mockDia(e, escolhas, rng) {
  const r = opcoesRacao(e)
  const x = opcoesExpedicao(e)
  return () => JSON.stringify({
    pensamento: 'vamos ver', diario: 'Mais um dia.',
    escolha: escolhas.length ? rng.escolher(escolhas).id : undefined,
    racao: {sopa: e.dia % 3 === 0 ? r.sopa : [], agua: e.dia % 2 === 0 ? r.agua : []},
    expedicao: x.quem?.length && rng.chance(0.15) ? {quem: rng.escolher(x.quem), itens: []} : null,
  })
}

// ---------------------------------------------------------------- partes do dia
function sortearEvento(e, rng) {
  if (e.dia < 2) return null // o primeiro dia é só para se acomodar
  const cand = EVENTOS.filter((ev) => !(ev.unico && e.eventosVistos[ev.id]) && seguro(() => ev.quando(e), false))
    .map((ev) => ({ev, peso: Math.max(0, Number(seguro(() => ev.peso(e), 0)) || 0)}))
    .filter((c) => c.peso > 0)
  if (!cand.length) return null
  const forcados = cand.filter((c) => c.peso >= PESO_FORCADO)
  const lista = forcados.length ? forcados : cand
  const total = lista.reduce((s, c) => s + c.peso, 0)
  let r = rng() * (total * (forcados.length ? 1 : 1 + DIA_TRANQUILO))
  for (const c of lista) { if ((r -= c.peso) < 0) return c.ev }
  return null
}

// as flags de mutação dos módulos de evento viram o campo `mutante` (o abrigo usa ele: mutante não bebe água)
function sincronizar(e) {
  for (const p of e.pessoas) {
    if (e.flags[`itens.mutante.${p.id}`] || (p.id === 'filha' && e.flags['cadeia.mutacao.mutante'])) p.mutante = true
  }
}

function checarFinais(e) {
  if (e.final) return
  for (const f of FINAIS) {
    const motivo = seguro(() => f.checar?.(e), null)
    if (motivo) { e.final = {id: f.id, tipo: f.tipo, motivo, dia: e.dia}; return }
  }
  const m = derrotaPadrao(e)
  if (m) e.final = {id: 'todos', tipo: 'derrota', motivo: m, dia: e.dia}
}

const resumo = (e) => ({
  pessoas: e.pessoas.map((p) => ({id: p.id, vivo: p.vivo, noAbrigo: p.noAbrigo, fora: !!p.fora, fugiu: p.fugiu, perdido: p.perdido,
    semComer: p.semComer, semBeber: p.semBeber, doente: !!p.doente, ferido: !!p.ferido, cansado: p.cansado, loucura: p.loucura, mutante: p.mutante})),
  itens: Object.fromEntries(Object.entries(e.itens).filter(([, n]) => n > 0)),
  quebrados: Object.keys(e.quebrados),
})

// ---------------------------------------------------------------- partida
export async function jogar({semente, ia, maxDias = 60, logar = console.log, aviso = '', coletaDe = null}) {
  const provider = PROVEDORES[ia] ?? ia
  const REG = aviso ? `${REGRAS}\n${aviso}` : REGRAS // revanche: a IA sabe como perdeu da outra vez
  const rngMock = criarRng(semente, `mock-${ia}`)
  const log = {semente, ia, provider, aviso, inicio: new Date().toISOString(), coleta: {falas: []}, dias: [], final: null}

  // fase 1: coleta (ou a coleta de uma partida anterior da mesma IA, para refazer só o abrigo)
  if (coletaDe) {
    log.coleta = JSON.parse(JSON.stringify(coletaDe))
    log.coletaReaproveitada = true
    logar(`Coleta reaproveitada: ${log.coleta.resultado.resultado}. Pessoas: ${log.coleta.resultado.pessoas.join(', ')}`)
  }
  const c = criarColeta(semente)
  while (!coletaDe && !terminada(c)) {
    const opcoes = acoesPossiveis(c)
    const r = await perguntar(provider, REG, promptColeta(c, opcoes), {maxTokens: 220, mock: mockColeta(c, opcoes)})
    const j = lerJSON(r.text) ?? {}
    const alvo = normal(j.acao)
    const acao = opcoes.find((o) => normal(o) === alvo) ?? opcoes.find((o) => alvo && (normal(o).includes(alvo) || alvo.includes(normal(o)))) ?? opcoes[0]
    const valida = normal(acao) === alvo
    const antes = c.log.length
    aplicar(c, acao)
    log.coleta.falas.push({registro: antes, gasto: c.gasto, acao, valida, pensamento: j.pensamento ?? '', fala: j.fala ?? ''})
    logar(`[coleta ${Math.round(c.gasto / 1000)}s] ${acao}${valida ? '' : ' (resposta inválida → 1ª opção)'}${j.fala ? ` — "${j.fala}"` : ''}`)
  }
  const res = coletaDe ? log.coleta.resultado : fim(c)
  if (!coletaDe) {
    log.coleta.casa = c.casa
    log.coleta.registro = c.log
    log.coleta.resultado = res
  }
  logar(`Coleta: ${res.resultado}. Pessoas: ${res.pessoas.join(', ')}. Itens: ${JSON.stringify(res.itens)}`)
  if (res.resultado !== 'ok') {
    log.final = {id: 'pai_fora', tipo: 'derrota', motivo: 'o tempo acabou e o pai não chegou ao abrigo', dia: 0}
    return log
  }

  // fase 2: abrigo
  const e = criarEstado(semente, res)
  const memoria = []
  while (!e.final && e.dia <= maxDias) {
    const rng = criarRng(semente, `dia-${e.dia}`)
    const ev = sortearEvento(e, rng)
    const escolhas = ev ? seguro(() => ev.escolhas(e).filter((o) => !o.requer || seguro(() => o.requer(e), false)), []) : []
    const dia = {dia: e.dia, antes: resumo(e), situacao: situacao(e), evento: null}
    let j = {}
    const automatico = ev && (ev.automatico || escolhas.length <= 1)
    if (ev) dia.evento = {id: ev.id, grupo: ev.grupo, texto: seguro(() => ev.texto(e), ''), escolhas: escolhas.map((o) => ({id: o.id, texto: o.texto})), automatico: !!automatico}
    const r = await perguntar(provider, REG, promptDia(e, automatico ? null : ev && {texto: dia.evento.texto}, automatico ? [] : escolhas, memoria.slice(-4)),
      {maxTokens: 500, mock: mockDia(e, automatico ? [] : escolhas, rngMock)})
    j = lerJSON(r.text) ?? {}
    dia.resposta = {pensamento: j.pensamento ?? '', diario: j.diario ?? '', escolha: j.escolha ?? null, racao: j.racao ?? null, expedicao: j.expedicao ?? null, ok: !!r.ok}

    // 1) evento
    if (ev) {
      const escolhida = escolhas.find((o) => o.id === j.escolha) ?? escolhas.find((o) => normal(o.texto) === normal(j.escolha)) ?? escolhas[escolhas.length - 1]
      dia.evento.escolhida = escolhida?.id ?? null
      dia.evento.valida = automatico || escolhida?.id === j.escolha
      e.eventosVistos[ev.id] = (e.eventosVistos[ev.id] ?? 0) + 1
      if (escolhida) {
        try { ev.resolver(e, escolhida.id, rng) } catch (err) { dia.evento.erro = String(err?.message ?? err) }
      } else if (!seguro(() => ev.escolhas(e), [null]).length) {
        // evento automático (escolhas: () => []): o resolver roda sem escolha, senão o efeito nunca acontece
        try { ev.resolver(e, null, rng) } catch (err) { dia.evento.erro = String(err?.message ?? err) }
      }
      sincronizar(e)
    }
    // 2) ração e 3) expedição (a IA pode mandar ids inválidos: o abrigo ignora)
    if (!e.final) {
      // as IAs às vezes mandam o nome ("Osvaldo [pai]") em vez do id: aceita id, nome ou "[id]" (pessoas e itens)
      const quemE = (v) => {
        const t = normal(v)
        const p = e.pessoas.find((x) => t === x.id || t.includes(`[${x.id}]`) || t === normal(x.nome) || t.startsWith(normal(x.nome)))
        return p?.id ?? String(v)
      }
      const itemE = (v) => {
        const t = normal(v)
        const k = Object.keys(ITENS).find((id) => t === id || t.includes(`[${id}]`) || t === normal(ITENS[id].nome))
        return k ?? String(v)
      }
      const lista = (v, f) => (Array.isArray(v) ? v.map(f) : [])
      dia.racao = aplicarRacao(e, {sopa: lista(j.racao?.sopa, quemE), agua: lista(j.racao?.agua, quemE)})
      if (j.expedicao?.quem) dia.expedicao = enviarExpedicao(e, quemE(j.expedicao.quem), lista(j.expedicao.itens, itemE))
    }
    checarFinais(e)
    dia.diario = [...e.diario]
    memoria.push({dia: e.dia, texto: dia.resposta.diario || dia.resposta.pensamento})
    logar(`[dia ${e.dia}] ${ev ? `${ev.id} → ${dia.evento.escolhida}` : 'sem evento'} | ${noAbrigo(e).map((p) => p.id).join(',')} | ${dia.resposta.diario}`)
    log.dias.push(dia)
    if (e.final) break
    virarDia(e)
    sincronizar(e)
    checarFinais(e)
    if (e.final) {
      // o que aconteceu na virada (morte, fuga, ataque) fica registrado no dia em que o final aconteceu
      log.dias.push({dia: e.dia, antes: resumo(e), virada: true, diario: [...e.diario]})
    }
  }
  if (!e.final) e.final = {id: 'limite', tipo: 'ambiguo', motivo: `chegou ao dia ${maxDias} (limite da partida)`, dia: e.dia}
  log.final = e.final
  log.fim = resumo(e)
  log.uso = uso
  return log
}

// ---------------------------------------------------------------- linha de comando
if (process.argv[1] && process.argv[1].endsWith('jogo.mjs')) {
  const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i >= 0 ? process.argv[i + 1] : d }
  const semente = arg('semente', 'teste')
  const ia = arg('ia', 'mock')
  const maxDias = Number(arg('max-dias', 60))
  const silencioso = process.argv.includes('--quieto')
  const aviso = arg('aviso', '')
  const cDe = arg('coleta-de', '')
  const coletaDe = cDe ? JSON.parse(fs.readFileSync(cDe, 'utf8')).coleta : null
  const log = await jogar({semente, ia, maxDias, aviso, coletaDe, logar: silencioso ? () => {} : console.log})
  const dir = path.join(path.dirname(new URL(import.meta.url).pathname), 'logs')
  fs.mkdirSync(dir, {recursive: true})
  const arq = path.join(dir, `${arg('nome', `${semente}_${ia}`)}.json`)
  fs.writeFileSync(arq, JSON.stringify(log, null, 1))
  console.log(`FIM: ${log.final.tipo} (${log.final.id}) no dia ${log.final.dia}: ${log.final.motivo}\nlog: ${arq}`)
}
