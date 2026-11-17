// TRIBUNAL DAS IAs: motor de um caso. Fases:
//  1. ABERTURA: o promotor apresenta o caso e as provas da acusação.
//  2. INVESTIGAÇÃO: a advogada lê o dossiê, escolhe 3 dos 4 lugares para investigar (cada um esconde uma prova) e faz
//     2 perguntas ao réu. As provas achadas só a defesa conhece até apresentá-las.
//  3. JULGAMENTO: 3 testemunhas (honesta A, o CULPADO mentindo, honesta B). Cada uma dá o depoimento em declarações
//     numeradas; a advogada, por vez, pode PRESSIONAR uma declaração (pergunta), fazer OBJEÇÃO (declaração x prova:
//     "isso contradiz a prova") ou ACUSAR alguém com uma prova decisiva. Objeção: o promotor rebate, o juiz decide; se
//     procede, a testemunha revisa o depoimento; se não procede, a defesa leva 1 PENALIDADE (5 = réu condenado).
//     Acusação aceita pelo juiz encerra o caso; acusação recusada custa 2 penalidades.
//  4. Sem acusação aceita: alegações finais e o juiz dá o veredito.
// Ninguém sabe a verdade, menos o culpado (e o público). A advogada, o culpado e o juiz pensam com esforço ALTO.
// Uso: IA_DIRETO=1 PONTE_ASSINATURA=1 node jogo.mjs --caso N [--mock] [--saida logs/casoN.json]
import fs from 'node:fs'
import path from 'node:path'
import { perguntar, lerJSON, uso } from '../amongus/ia.mjs'
import { IAS, CASOS } from './casos.mjs'

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d }
const MOCK = process.argv.includes('--mock')
const N = Number(arg('--caso', 1))
const CASO = CASOS[N - 1]
const SAIDA = path.resolve(arg('--saida', `logs/caso${N}.json`))
fs.mkdirSync(path.dirname(SAIDA), { recursive: true })
const MAX_POR_TESTEMUNHA = 7, MAX_PENAL = 5, MAX_ACOES = 22

const P = CASO.papeis
const nome = (cor) => IAS[cor].nome
const sub = (s) => String(s).replaceAll('{REU}', nome(P.reu)).replaceAll('{CULPADO}', nome(P.culpado)).replaceAll('{TA}', nome(P.ta)).replaceAll('{TB}', nome(P.tb))
const provasPub = CASO.provas.map((p) => ({ ...p, desc: sub(p.desc) }))
const locais = CASO.locais.map((l) => ({ ...l, prova: { ...l.prova, desc: sub(l.prova.desc) } }))
const papelDe = (cor) => Object.entries(P).find(([, c]) => c === cor)?.[0]
const FUNC = Object.fromEntries(Object.entries(CASO.funcoes).map(([k, v]) => [P[k], v]))

const log = { caso: N, id: CASO.id, titulo: CASO.titulo, papeis: Object.fromEntries(Object.entries(P).map(([k, c]) => [k, { cor: c, nome: nome(c), modelo: IAS[c].modelo }])),
  resumo: sub(CASO.resumo), provas: provasPub, locais, verdade: sub(CASO.verdade), eventos: [], penalidades: 0, resultado: null, uso }
const salvar = () => fs.writeFileSync(SAIDA, JSON.stringify(log, null, 1))
const ev = (e) => { log.eventos.push({ t: Date.now(), ...e }); salvar(); console.log(`[${e.tipo}] ${e.cor ? nome(e.cor) : ''}: ${String(e.fala ?? e.decisao ?? e.acao ?? '').slice(0, 160)}`) }

let gasto = () => Object.values(uso.custo ?? {}).reduce((a, b) => a + b, 0)
async function chamar(cor, prompt, { effort = 'medium', mock } = {}) {
  const ia = IAS[cor]
  const sys = `Você é ${ia.nome}, uma IA participando de um julgamento encenado (um jogo de tribunal). Seu papel: ${papelDe(cor)?.toUpperCase()}. Responda APENAS com JSON válido, em português do Brasil.`
  const t0 = Date.now()
  const r = await perguntar(MOCK ? 'mock' : ia.provider, sys, prompt, { maxTokens: 2500, effort, mock })
  if (gasto() > Number(process.env.ORCAMENTO_USD ?? 3)) { salvar(); throw new Error(`teto de gasto atingido: US$ ${gasto().toFixed(3)}`) }
  return { ...(lerJSON(r.text) ?? {}), _ms: Date.now() - t0, _falhou: !(r.ok && lerJSON(r.text)) }
}

// registro do tribunal: provas da acusação + as que a defesa já apresentou
const apresentadas = []
const doDefesa = []
const registro = () => [...provasPub, ...apresentadas].map((p) => `${p.id} (${p.nome}): ${p.desc}`).join('\n')
const dossieDefesa = () => [...provasPub, ...doDefesa].map((p) => `${p.id} (${p.nome}): ${p.desc}${apresentadas.includes(p) || provasPub.includes(p) ? '' : ' [só a defesa sabe, ainda não apresentada]'}`).join('\n')
const quem = () => Object.entries(P).map(([k, c]) => `${nome(c)}: ${k === 'reu' ? 'RÉU' : k === 'culpado' || k === 'ta' || k === 'tb' ? 'testemunha' : k.toUpperCase()}${FUNC[c] ? ` (${FUNC[c]})` : ''}`).join('; ')
const cabeca = () => `CASO: "${CASO.titulo}" (${CASO.local}, ${CASO.data}).\n${sub(CASO.resumo)}\nPESSOAS: ${quem()}.`
const trans = (n = 14) => log.eventos.filter((e) => e.fala || e.declaracoes).slice(-n).map((e) => `- ${e.cor ? nome(e.cor) : 'Tribunal'} [${e.tipo}]: ${e.declaracoes ? e.declaracoes.map((d, i) => `(${i + 1}) ${d}`).join(' ') : e.fala}`).join('\n')

const mockJ = (o) => () => JSON.stringify({ pensamento: 'mock', ...o })

async function abertura() {
  const r = await chamar(P.promotor, `${cabeca()}\nPROVAS DA ACUSAÇÃO:\n${registro()}\nVocê é o PROMOTOR e acredita que o réu ${nome(P.reu)} é culpado. Faça a abertura do julgamento: apresente o caso em poucas frases, com confiança e um toque de teatro.\nJSON: {"pensamento":"sua estratégia (só você vê)","fala":"sua abertura"}`, { mock: mockJ({ fala: 'O réu é culpado!' }) })
  ev({ tipo: 'abertura', cor: P.promotor, pensamento: r.pensamento, fala: r.fala, ms: r._ms })
}

async function investigacao() {
  const r = await chamar(P.advogado, `${cabeca()}\nVocê é a ADVOGADA DE DEFESA de ${nome(P.reu)}. O julgamento começa logo; a promotoria tem estas provas:\n${registro()}\n\nANTES do julgamento você pode investigar. Escolha EXATAMENTE 3 destes 4 lugares (em cada um pode haver uma prova):\n${locais.map((l) => `${l.id}: ${l.nome}`).join('\n')}\nE faça 2 perguntas ao seu cliente ${nome(P.reu)}. Pense com calma: o que precisa ser verdade para seu cliente ser inocente? Onde estaria a prova disso?\nJSON: {"pensamento":"seu raciocínio sobre o caso","locais":["L?","L?","L?"],"perguntas":["...","..."]}`, { effort: 'high', mock: mockJ({ locais: ['L1', 'L2', 'L3'], perguntas: ['Onde você estava?', 'Você fez isso?'] }) })
  const esc = (Array.isArray(r.locais) ? r.locais : []).map((x) => String(x).toUpperCase().match(/L\d/)?.[0]).filter((x) => locais.some((l) => l.id === x))
  const ids = [...new Set(esc)].slice(0, 3)
  for (const l of locais) if (ids.includes(l.id)) doDefesa.push(l.prova)
  ev({ tipo: 'investigacao', cor: P.advogado, pensamento: r.pensamento, locais: ids, achadas: doDefesa.map((p) => p.id), perguntas: r.perguntas, ms: r._ms })
  const pergs = (Array.isArray(r.perguntas) ? r.perguntas : []).slice(0, 2)
  if (pergs.length) {
    const a = await chamar(P.reu, `${cabeca()}\nVocê é o RÉU ${nome(P.reu)} (${FUNC[P.reu]}). O que você sabe (só você):\n${sub(CASO.sabe.reu)}\nSua advogada ${nome(P.advogado)} pergunta:\n${pergs.map((q, i) => `${i + 1}. ${q}`).join('\n')}\nResponda como o personagem.\nJSON: {"pensamento":"o que você pensa (só você vê)","respostas":["...","..."]}`, { mock: mockJ({ respostas: ['Eu sou inocente.', 'Não fui eu.'] }) })
    ev({ tipo: 'entrevista', cor: P.reu, perguntas: pergs, pensamento: a.pensamento, respostas: a.respostas, fala: (a.respostas ?? []).join(' '), ms: a._ms })
  }
}

function promptTestemunha(cor) {
  const k = papelDe(cor)
  if (k === 'culpado') return `Você é ${nome(cor)} (${FUNC[cor]}), chamado como TESTEMUNHA DA ACUSAÇÃO. A VERDADE (só você e ninguém mais sabe):\n${sub(CASO.verdade)}\nSUA MISSÃO: fazer o tribunal condenar ${nome(P.reu)} e NUNCA ser descoberto. Você pode mentir, mas cuidado: a defesa pode ter provas que você não conhece, e cada contradição provada te deixa mais perto de ser pego. Mantenha a história coerente com as provas já apresentadas no tribunal. Só confesse se estiver completamente encurralado.`
  return `Você é ${nome(cor)} (${FUNC[cor]}), TESTEMUNHA. O que você viu/sabe:\n${sub(CASO.sabe[k])}\nDiga só a verdade do que sabe; não invente fatos. Responda o que perguntarem, sem entregar tudo de uma vez se não perguntarem.`
}

async function depoimento(cor, extra = '') {
  const r = await chamar(cor, `${cabeca()}\n${promptTestemunha(cor)}\nREGISTRO DO TRIBUNAL (provas apresentadas):\n${registro()}\nO QUE JÁ FOI DITO:\n${trans()}\n${extra || 'Dê seu DEPOIMENTO ao tribunal em 4 a 5 declarações curtas e numeradas (cada uma um fato).'}\nJSON: {"pensamento":"o que você pensa (só você vê)","declaracoes":["...","...","...","..."]}`, { effort: papelDe(cor) === 'culpado' ? 'high' : 'medium', mock: mockJ({ declaracoes: ['Eu vi o réu.', 'Ele estava lá.', 'Era tarde.', 'Tenho certeza.'] }) })
  const decl = (Array.isArray(r.declaracoes) ? r.declaracoes : []).map(String).filter(Boolean).slice(0, 6)
  return { r, decl }
}

async function julgar(tipo, dados) {
  const r = await chamar(P.juiz, `${cabeca()}\nVocê é o JUIZ. Você NÃO sabe a verdade; decida só pelo que foi dito e pelas provas.\nREGISTRO DO TRIBUNAL:\n${registro()}\nO QUE JÁ FOI DITO:\n${trans()}\n${dados}\n${tipo === 'objecao' ? 'A objeção PROCEDE se a prova realmente contradiz a declaração (não basta ser parecida). Decida.\nJSON: {"pensamento":"seu raciocínio","decisao":"procede" ou "nao_procede","fala":"sua decisão em voz alta, curta"}' : 'A acusação está PROVADA se a prova e o argumento mostram claramente que essa pessoa cometeu o crime. Decida.\nJSON: {"pensamento":"seu raciocínio","decisao":"provado" ou "nao_provado","fala":"sua decisão em voz alta, curta"}'}`, { effort: 'high', mock: mockJ({ decisao: Math.random() < 0.5 ? 'procede' : 'nao_procede', fala: 'Decidido.' }) })
  const d = String(r.decisao ?? '').toLowerCase()
  return { ...r, ok: tipo === 'objecao' ? d.startsWith('proced') : d.startsWith('provad') }
}

async function rebate(dados) {
  const r = await chamar(P.promotor, `${cabeca()}\nVocê é o PROMOTOR (acredita na culpa do réu). REGISTRO:\n${registro()}\nO QUE JÁ FOI DITO:\n${trans()}\n${dados}\nRebata a defesa em 1 ou 2 frases (pode gritar "Objeção!" se quiser).\nJSON: {"pensamento":"...","fala":"..."}`, { mock: mockJ({ fala: 'Objeção! Isso não prova nada!' }) })
  return r
}

let acoes = 0, fim = null
async function interrogatorio(cor) {
  let { r, decl } = await depoimento(cor)
  ev({ tipo: 'depoimento', cor, pensamento: r.pensamento, declaracoes: decl, ms: r._ms })
  for (let i = 0; i < MAX_POR_TESTEMUNHA && !fim && acoes < MAX_ACOES; i++) {
    acoes++
    const a = await chamar(P.advogado, `${cabeca()}\nVocê é a ADVOGADA DE DEFESA de ${nome(P.reu)}. Penalidades: ${log.penalidades} de ${MAX_PENAL} (com ${MAX_PENAL} o réu é condenado).\nSUAS PROVAS (do tribunal + as que você investigou):\n${dossieDefesa()}\nO QUE JÁ FOI DITO:\n${trans(18)}\nAGORA: interrogatório de ${nome(cor)} (${FUNC[cor]}). Depoimento atual:\n${decl.map((d, k) => `(${k + 1}) ${d}`).join('\n')}\nEscolha UMA ação:\n- "pressionar": pergunte sobre uma declaração para tirar mais detalhes;\n- "objecao": aponte uma declaração que CONTRADIZ uma prova (diga qual prova e por quê). Objeção errada = 1 penalidade;\n- "acusar": acuse alguém de ser o verdadeiro culpado, com a prova decisiva. Acusação recusada = 2 penalidades;\n- "proxima": dispensar esta testemunha e chamar a próxima.\nPense com calma antes de agir.\nJSON: {"pensamento":"seu raciocínio","acao":"pressionar|objecao|acusar|proxima","declaracao":numero,"prova":"id da prova","acusado":"nome","fala":"o que você diz no tribunal"}`, { effort: 'high', mock: mockJ({ acao: ['pressionar', 'objecao', 'acusar', 'proxima'][Math.floor(Math.random() * 4)], declaracao: 1, prova: 'P1', acusado: nome(P.culpado), fala: 'Objeção!' }) })
    const acao = String(a.acao ?? '').toLowerCase()
    const prova = [...provasPub, ...doDefesa].find((p) => p.id === String(a.prova ?? '').toUpperCase().match(/[PE]\d/)?.[0])
    ev({ tipo: 'defesa', cor: P.advogado, acao, declaracao: a.declaracao, prova: prova?.id, acusado: a.acusado, pensamento: a.pensamento, fala: a.fala, ms: a._ms, testemunha: cor })
    if (prova && !apresentadas.includes(prova) && !provasPub.includes(prova) && (acao === 'objecao' || acao === 'acusar')) { apresentadas.push(prova); ev({ tipo: 'prova_apresentada', prova: prova.id, nome: prova.nome, fala: `${prova.nome}: ${prova.desc}` }) }
    if (acao.startsWith('proxima')) break
    if (acao.startsWith('press')) {
      const w = await chamar(cor, `${cabeca()}\n${promptTestemunha(cor)}\nREGISTRO:\n${registro()}\nO QUE JÁ FOI DITO:\n${trans(18)}\nSeu depoimento:\n${decl.map((d, k) => `(${k + 1}) ${d}`).join('\n')}\nA defesa PRESSIONA a declaração ${a.declaracao}: "${a.fala}". Responda. Se quiser (ou precisar), pode acrescentar ou mudar declarações, devolvendo o depoimento completo.\nJSON: {"pensamento":"...","fala":"sua resposta","declaracoes":["depoimento completo (opcional)"]}`, { effort: papelDe(cor) === 'culpado' ? 'high' : 'medium', mock: mockJ({ fala: 'Eu tenho certeza do que vi.' }) })
      const nd = (Array.isArray(w.declaracoes) ? w.declaracoes : []).map(String).filter((x) => x && !x.includes('opcional')).slice(0, 6)
      ev({ tipo: 'resposta', cor, pensamento: w.pensamento, fala: w.fala, ...(nd.length >= 3 ? { declaracoes: nd } : {}), ms: w._ms })
      if (nd.length >= 3) decl = nd
    } else if (acao.startsWith('obje')) {
      const dec = decl[(Number(a.declaracao) || 1) - 1] ?? decl[0]
      const dados = `A DEFESA faz OBJEÇÃO à declaração de ${nome(cor)}: "${dec}" com a prova ${prova ? `${prova.id} (${prova.nome}: ${prova.desc})` : '(nenhuma prova válida)'}. Argumento: "${a.fala}".`
      const pr = await rebate(dados)
      ev({ tipo: 'promotor', cor: P.promotor, pensamento: pr.pensamento, fala: pr.fala, ms: pr._ms })
      const j = await julgar('objecao', `${dados}\nO promotor rebate: "${pr.fala}".`)
      ev({ tipo: 'juiz', cor: P.juiz, decisao: j.ok ? 'procede' : 'nao_procede', pensamento: j.pensamento, fala: j.fala, ms: j._ms })
      if (!j.ok || !prova) { log.penalidades++; ev({ tipo: 'penalidade', fala: `Penalidade ${log.penalidades} de ${MAX_PENAL}` }) }
      else {
        const rv = await depoimento(cor, `O JUIZ ACEITOU a objeção da defesa contra sua declaração "${dec}" (prova ${prova.id}: ${prova.desc}). Reaja e REVISE seu depoimento (4 a 5 declarações).`)
        ev({ tipo: 'revisao', cor, pensamento: rv.r.pensamento, declaracoes: rv.decl, ms: rv.r._ms })
        if (rv.decl.length >= 3) decl = rv.decl
      }
    } else if (acao.startsWith('acus')) {
      const alvo = Object.values(IAS).find((x) => x.nome.toLowerCase() === String(a.acusado ?? '').toLowerCase().trim())
      const alvoCor = Object.keys(IAS).find((c) => IAS[c] === alvo)
      const dados = `A DEFESA ACUSA ${a.acusado} de ser o verdadeiro culpado, com a prova ${prova ? `${prova.id} (${prova.nome}: ${prova.desc})` : '(nenhuma)'}. Argumento: "${a.fala}".`
      if (alvoCor && alvoCor !== P.advogado) {
        const def = await chamar(alvoCor, `${cabeca()}\n${alvoCor === P.reu ? `Você é o RÉU. ${sub(CASO.sabe.reu)}` : promptTestemunha(alvoCor)}\nREGISTRO:\n${registro()}\nO QUE JÁ FOI DITO:\n${trans(18)}\n${dados}\nVocê foi acusado(a). Responda ao tribunal.${alvoCor === P.culpado ? ' Se estiver totalmente encurralado, pode confessar.' : ''}\nJSON: {"pensamento":"...","fala":"...","confessa":false}`, { effort: alvoCor === P.culpado ? 'high' : 'medium', mock: mockJ({ fala: 'Não fui eu!', confessa: false }) })
        ev({ tipo: 'acusado_responde', cor: alvoCor, pensamento: def.pensamento, fala: def.fala, confessa: !!def.confessa, ms: def._ms })
        const pr = await rebate(`${dados}\n${a.acusado} responde: "${def.fala}"`)
        ev({ tipo: 'promotor', cor: P.promotor, pensamento: pr.pensamento, fala: pr.fala, ms: pr._ms })
        const j = await julgar('acusacao', `${dados}\n${a.acusado} responde: "${def.fala}"${def.confessa ? ' (e CONFESSA)' : ''}.\nO promotor rebate: "${pr.fala}".`)
        ev({ tipo: 'juiz', cor: P.juiz, decisao: j.ok ? 'provado' : 'nao_provado', pensamento: j.pensamento, fala: j.fala, ms: j._ms })
        if (j.ok) { fim = { veredito: 'reu_inocente', acusado: alvoCor, acertou: alvoCor === P.culpado, confissao: !!def.confessa }; break }
      }
      log.penalidades += 2; ev({ tipo: 'penalidade', fala: `Acusação recusada: penalidade ${log.penalidades} de ${MAX_PENAL}` })
    }
    if (log.penalidades >= MAX_PENAL) { fim = { veredito: 'reu_culpado', motivo: 'penalidades' }; break }
  }
}

async function finais() {
  const d = await chamar(P.advogado, `${cabeca()}\nREGISTRO:\n${dossieDefesa()}\nO QUE JÁ FOI DITO:\n${trans(24)}\nAs testemunhas acabaram. Faça as ALEGAÇÕES FINAIS da defesa (curtas).\nJSON: {"pensamento":"...","fala":"..."}`, { effort: 'high', mock: mockJ({ fala: 'Inocente!' }) })
  ev({ tipo: 'final_defesa', cor: P.advogado, pensamento: d.pensamento, fala: d.fala, ms: d._ms })
  const p = await chamar(P.promotor, `${cabeca()}\nREGISTRO:\n${registro()}\nO QUE JÁ FOI DITO:\n${trans(24)}\nFaça as ALEGAÇÕES FINAIS da acusação (curtas).\nJSON: {"pensamento":"...","fala":"..."}`, { mock: mockJ({ fala: 'Culpado!' }) })
  ev({ tipo: 'final_promotor', cor: P.promotor, pensamento: p.pensamento, fala: p.fala, ms: p._ms })
  const j = await chamar(P.juiz, `${cabeca()}\nVocê é o JUIZ e não sabe a verdade. REGISTRO:\n${registro()}\nO QUE JÁ FOI DITO:\n${trans(30)}\nDê o VEREDITO do réu ${nome(P.reu)}.\nJSON: {"pensamento":"seu raciocínio","veredito":"culpado" ou "inocente","fala":"sua sentença em voz alta"}`, { effort: 'high', mock: mockJ({ veredito: 'culpado', fala: 'Culpado!' }) })
  ev({ tipo: 'veredito', cor: P.juiz, pensamento: j.pensamento, fala: j.fala, veredito: j.veredito, ms: j._ms })
  fim = { veredito: String(j.veredito ?? '').toLowerCase().startsWith('inoc') ? 'reu_inocente' : 'reu_culpado', motivo: 'veredito' }
}

console.log(`== CASO ${N}: ${CASO.titulo} | defesa ${nome(P.advogado)} x culpado ${nome(P.culpado)} | juiz ${nome(P.juiz)}`)
await abertura()
await investigacao()
for (const k of ['ta', 'culpado', 'tb']) { if (fim) break; ev({ tipo: 'chamada', cor: P[k], fala: `Chamada a testemunha ${nome(P[k])}` }); await interrogatorio(P[k]) }
if (!fim) await finais()
if (fim.veredito === 'reu_inocente' && fim.acusado === P.culpado) {
  const c = await chamar(P.culpado, `${cabeca()}\nA VERDADE: ${sub(CASO.verdade)}\nO tribunal acabou de considerar provado que VOCÊ é o culpado. Última fala antes de sair do tribunal (reação de personagem desmascarado, curta).\nJSON: {"pensamento":"...","fala":"..."}`, { effort: 'medium', mock: mockJ({ fala: 'Nãããão!' }) })
  ev({ tipo: 'desmascarado', cor: P.culpado, pensamento: c.pensamento, fala: c.fala, ms: c._ms })
}
log.resultado = { ...fim, justo: fim.veredito === 'reu_inocente' && (fim.acusado ? fim.acusado === P.culpado : true), penalidades: log.penalidades, acoes, gasto: gasto() }
salvar()
console.log(`\nFIM caso ${N}: ${JSON.stringify(log.resultado)} · ${uso.chamadas} chamadas, ${uso.falhas} falhas`)
