// TRIBUNAL DAS IAs — motor do "Caso do Farol Apagado" (formato dos jogos de tribunal, 4 dias):
//  DIA 1 INVESTIGAÇÃO: a advogada tem 10 ações: EXAMINAR um lugar (acha a prova dele), CONVERSAR com alguém (pergunta
//    livre) ou APRESENTAR uma prova/perfil a alguém. Quem guarda segredo tem CADEADOS: cada prova certa apresentada
//    quebra um; com todos quebrados a pessoa conta a verdade (vira prova nova). Prova errada num cadeado: -1 de paciência.
//  DIA 2 JULGAMENTO: abertura do promotor; testemunhas vigia e (o culpado) patrocinador. Para cada declaração a defesa
//    pode PRESSIONAR ("Alto lá!"), fazer OBJEÇÃO com prova ("Objeção!") ou ACUSAR alguém com a prova decisiva
//    ("Toma essa!"). Juiz decide; objeção errada -1 de paciência, acusação errada -2. Paciência zerada = ré condenada.
//  DIA 3 INVESTIGAÇÃO: lugares novos (lareira, arquivo do jornal, perícia), mais 10 ações; o patrocinador aparece com
//    a mão enfaixada.
//  DIA 4 JULGAMENTO FINAL: o patrocinador volta a depor e o pescador conta o passado. A defesa pode ACUSAR (crime de
//    hoje) e REABRIR O PASSADO (provar que Anselmo foi trancado por fora). Sem acusação aceita: veredito do juiz.
// Advogada, culpado e juiz pensam com esforço ALTO. Todo mundo devolve o "pensamento" (o público vê).
// Uso: IA_DIRETO=1 PONTE_ASSINATURA=1 node farol.mjs --advogado Azul|Roxo|Verde [--mock] [--saida logs/farol_X.json]
import fs from 'node:fs'
import path from 'node:path'
import { perguntar, lerJSON, uso } from '../amongus/ia.mjs'
import { IAS, FIXOS, RODADAS, TITULO, CRIME, RESUMO, PROVAS, PERFIS, LOCAIS, CADEADOS, SABE } from './farol_caso.mjs'

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d }
const MOCK = process.argv.includes('--mock')
const ADV = arg('--advogado', 'Azul')
const P = { ...FIXOS, ...RODADAS[ADV] }
const SAIDA = path.resolve(arg('--saida', `logs/farol_${IAS[ADV].nome}.json`))
fs.mkdirSync(path.dirname(SAIDA), { recursive: true })
const ACOES_INVEST = 10, MAX_POR_TESTEMUNHA = 8, PACIENCIA = 6

const nome = (cor) => IAS[cor].nome
const nomeP = (k) => nome(P[k])
const sub = (s) => String(s).replaceAll('{CULPADO}', nomeP('culpado'))
const papelDe = (cor) => Object.entries(P).find(([, c]) => c === cor)?.[0]
const corDe = (n) => Object.keys(IAS).find((c) => IAS[c].nome.toLowerCase() === String(n ?? '').toLowerCase().trim().replace(/^(dr\.?|dra\.?|sr\.?|sra\.?)\s*/, ''))
const FUNC = { culpado: 'patrocinador do museu, dono do estaleiro', reu: 'a ré, filha do faroleiro Anselmo, acusada de assassinato', vigia: 'vigia do museu', pescador: 'pescador aposentado', delegado: 'delegado do caso', promotor: 'promotor', juiz: 'juiz', assistente: 'assistente da defesa', advogado: 'advogada de defesa' }

const registro = [...PROVAS, ...PERFIS(nomeP).map((p) => ({ ...p, desc: sub(p.desc) }))]
const locks = Object.fromEntries(Object.entries(CADEADOS).map(([k, v]) => [k, { ...v, quebrados: [], descoberto: false, revela: { ...v.revela, desc: sub(v.revela.desc) } }]))
const log = { titulo: TITULO, advogado: ADV, papeis: Object.fromEntries(Object.entries(P).map(([k, c]) => [k, { cor: c, nome: nome(c), modelo: IAS[c].modelo }])),
  resumo: RESUMO, eventos: [], paciencia: PACIENCIA, resultado: null, uso }
let dia = 1
const salvar = () => fs.writeFileSync(SAIDA, JSON.stringify(log, null, 1))
const ev = (e) => { log.eventos.push({ t: Date.now(), dia, ...e }); salvar(); console.log(`D${dia} [${e.tipo}] ${e.cor ? nome(e.cor) : ''}: ${String(e.fala ?? e.decisao ?? e.acao ?? '').slice(0, 170)}`) }
const gasto = () => Object.values(uso.custo ?? {}).reduce((a, b) => a + b, 0)

async function chamar(cor, prompt, { effort = 'medium', mock } = {}) {
  const k = papelDe(cor)
  const sys = `Você é ${nome(cor)}, uma IA atuando como personagem num julgamento encenado (um jogo de tribunal). Seu papel: ${FUNC[k]?.toUpperCase()}. Fique no personagem. Responda APENAS com JSON válido, em português do Brasil.`
  const t0 = Date.now()
  const r = await perguntar(MOCK ? 'mock' : IAS[cor].provider, sys, prompt, { maxTokens: 2500, effort, mock })
  if (gasto() > Number(process.env.ORCAMENTO_USD ?? 3)) { salvar(); throw new Error(`teto de gasto atingido: US$ ${gasto().toFixed(3)}`) }
  return { ...(lerJSON(r.text) ?? {}), _ms: Date.now() - t0, _falhou: !(r.ok && lerJSON(r.text)) }
}
const mockJ = (o) => () => JSON.stringify({ pensamento: 'mock', ...o })

const regTxt = (todas = true) => registro.filter((p) => todas || !p.soDefesa).map((p) => `${p.id} (${p.nome}): ${p.desc}${p.soDefesa ? ' [só a defesa conhece; ainda não apresentada no tribunal]' : ''}`).join('\n')
const cab = () => `CASO: "${TITULO}".\n${RESUMO}\nPESSOAS: ${Object.entries(P).map(([k, c]) => `${nome(c)} (${FUNC[k]})`).join('; ')}.`
const trans = (n = 16, filtro = () => true) => log.eventos.filter((e) => (e.fala || e.declaracoes) && filtro(e)).slice(-n).map((e) => `- [dia ${e.dia}] ${e.cor ? nome(e.cor) : 'Tribunal'} (${e.tipo}): ${e.declaracoes ? e.declaracoes.map((d, i) => `(${i + 1}) ${d}`).join(' ') : e.fala}`).join('\n')
const statusLocks = () => Object.entries(locks).filter(([, l]) => l.descoberto).map(([k, l]) => `${nomeP(k)}: ${l.chaves.length - l.quebrados.length} cadeado(s) restante(s) sobre "${l.assunto}"`).join('; ') || 'nenhum descoberto ainda'
function addProva(p, soDefesa = true) { if (!registro.some((x) => x.id === p.id)) { registro.push({ ...p, desc: sub(p.desc), soDefesa }); ev({ tipo: 'nova_prova', prova: p.id, nome: p.nome, fala: `${p.nome}: ${sub(p.desc)}` }) } }
const acharProva = (id) => registro.find((p) => p.id === String(id ?? '').toUpperCase().match(/(PF|[PERL])\d/)?.[0])
function penaliza(n, motivo, minimo = 0) { log.paciencia = Math.max(minimo, log.paciencia - n); ev({ tipo: 'penalidade', fala: `${motivo}: paciência do juiz ${log.paciencia} de ${PACIENCIA}` }) }

function personagem(cor) {
  const k = papelDe(cor)
  const l = locks[k]
  const lk = l ? (l.quebrados.length >= l.chaves.length ? '\nSEUS CADEADOS JÁ FORAM TODOS QUEBRADOS: agora você conta a verdade sobre o seu segredo.' : `\nCADEADOS RESTANTES: ${l.chaves.length - l.quebrados.length} (ainda proteja o segredo).`) : ''
  const extra = k === 'culpado' && dia >= 3 ? '\n(Hoje sua mão direita está enfaixada e todos podem ver.)' : ''
  return `${sub(SABE[k] ?? '')}${lk}${extra}`
}

async function assistente(momento) {
  const r = await chamar(P.assistente, `${cab()}\nVocê é ${nomeP('assistente')}, ASSISTENTE de ${nomeP('advogado')}. ${SABE.assistente}\nO QUE A DEFESA SABE:\n${regTxt()}\nO QUE JÁ ACONTECEU:\n${trans(12)}\nMOMENTO: ${momento}\nFale 1 ou 2 frases para a advogada (um palpite, uma piada ou um incentivo).\nJSON: {"pensamento":"...","fala":"..."}`, { mock: mockJ({ fala: 'Vamos nessa, chefe!' }) })
  ev({ tipo: 'assistente', cor: P.assistente, pensamento: r.pensamento, fala: r.fala, ms: r._ms })
}

async function investigacao(n, s0 = 0) {
  const E = n === 1 ? 0 : 2
  const lugares = n === 1 ? LOCAIS[1] : [...LOCAIS[1], ...LOCAIS[3]]
  const examinados = new Set(log.eventos.filter((e) => e.tipo === 'examinar').map((e) => e.local))
  if (s0 === 0) {
  checkpoint({ e: E, s: 0 })
  ev({ tipo: 'dia', fala: n === 1 ? 'DIA 1 — INVESTIGAÇÃO' : 'DIA 3 — INVESTIGAÇÃO (a perícia liberou resultados novos)' })
  if (n === 3) { const pf = registro.find((p) => p.id === 'PF4'); pf.desc += ' Hoje apareceu com a mão direita enfaixada.' }
  await assistente(n === 1 ? 'Começo da investigação. A cliente foi presa hoje de manhã, acusada de assassinato.' : `O julgamento foi adiado. Mais um dia de investigação antes do veredito.${suspeito ? ` O juiz suspeita de ${nome(suspeito)}, mas quer uma PROVA DECISIVA.` : ''}`)
  }
  for (let a = Math.max(1, s0); a <= ACOES_INVEST; a++) {
    checkpoint({ e: E, s: a })
    const r = await chamar(P.advogado, `${cab()}\nVocê é ${nomeP('advogado')}, ADVOGADA DE DEFESA de Quartzo. DIA ${n} — INVESTIGAÇÃO. Ação ${a} de ${ACOES_INVEST}. Paciência do juiz: ${log.paciencia} de ${PACIENCIA}.\nREGISTRO DA DEFESA (provas e perfis):\n${regTxt()}\nLUGARES: ${lugares.map((l) => `${l.id}: ${l.nome}${examinados.has(l.id) ? ' (já examinado)' : ''}`).join('; ')}\nPESSOAS para conversar: ${['reu', 'vigia', 'pescador', 'delegado', 'culpado'].map((k) => `${nomeP(k)} (${FUNC[k]})`).join('; ')}.\nCADEADOS DE SEGREDO: ${statusLocks()}. (Quem esconde algo tem cadeados; cada prova CERTA apresentada a essa pessoa quebra um; prova errada custa 1 de paciência.)\nO QUE JÁ ACONTECEU:\n${trans(14, (e) => e.dia === n || e.tipo === 'nova_prova')}\nEscolha UMA ação:\n- "examinar" um lugar (campo "local");\n- "conversar" com uma pessoa (campos "pessoa" e "pergunta");\n- "apresentar" uma prova/perfil a uma pessoa (campos "pessoa", "prova" e "fala");\n- "encerrar" o dia.\nPense: o que precisa ser verdade para Quartzo ser inocente? Quem mente? O que a mensagem da vítima quer dizer? O que aconteceu há 15 anos?\nJSON: {"pensamento":"seu raciocínio","acao":"examinar|conversar|apresentar|encerrar","local":"L?","pessoa":"nome","prova":"id","pergunta":"...","fala":"..."}`, { effort: 'high', mock: mockJ({ acao: ['examinar', 'conversar', 'apresentar'][a % 3], local: lugares[a % lugares.length].id, pessoa: nomeP(['reu', 'vigia', 'pescador'][a % 3]), prova: ['E4', 'P3', 'E3', 'E7', 'E6'][a % 5], pergunta: 'O que você viu?', fala: 'Explique isso!' }) })
    const acao = String(r.acao ?? '').toLowerCase()
    if (acao.startsWith('encerr')) { ev({ tipo: 'encerrar', cor: P.advogado, pensamento: r.pensamento, fala: r.fala ?? 'Encerro o dia.' }); break }
    if (acao.startsWith('exam')) {
      const l = lugares.find((x) => x.id === String(r.local ?? '').toUpperCase().match(/L\d/)?.[0])
      ev({ tipo: 'examinar', cor: P.advogado, local: l?.id, nomeLocal: l?.nome, pensamento: r.pensamento, fala: r.fala ?? (l ? `Vou examinar: ${l.nome}` : 'Examinar... onde mesmo?'), ms: r._ms })
      if (l) { examinados.add(l.id); addProva(l.prova) }
      continue
    }
    const alvo = corDe(r.pessoa)
    const k = papelDe(alvo)
    if (!alvo || !['reu', 'vigia', 'pescador', 'delegado', 'culpado'].includes(k)) { ev({ tipo: 'perdida', cor: P.advogado, pensamento: r.pensamento, fala: r.fala ?? `(${r.pessoa}?)` }); continue }
    if (acao.startsWith('conv')) {
      ev({ tipo: 'conversar', cor: P.advogado, pessoa: alvo, pensamento: r.pensamento, fala: r.pergunta ?? r.fala, ms: r._ms })
      const w = await chamar(alvo, `${cab()}\n${personagem(alvo)}\nA advogada de defesa ${nomeP('advogado')} conversa com você (investigação, fora do tribunal). Já conversaram:\n${trans(8, (e) => e.dia === n && (e.cor === alvo || e.pessoa === alvo))}\nPergunta: "${r.pergunta ?? r.fala}"\nResponda como o personagem.\nJSON: {"pensamento":"...","fala":"..."}`, { effort: k === 'culpado' ? 'high' : 'medium', mock: mockJ({ fala: 'Não sei de nada.' }) })
      ev({ tipo: 'responde', cor: alvo, pensamento: w.pensamento, fala: w.fala, ms: w._ms })
      if (locks[k] && !locks[k].descoberto) { locks[k].descoberto = true; ev({ tipo: 'cadeados', cor: alvo, n: locks[k].chaves.length, fala: `${nome(alvo)} tem ${locks[k].chaves.length} cadeado(s) de segredo sobre "${locks[k].assunto}"` }) }
      continue
    }
    if (acao.startsWith('apres')) {
      const p = acharProva(r.prova)
      ev({ tipo: 'apresentar', cor: P.advogado, pessoa: alvo, prova: p?.id, pensamento: r.pensamento, fala: r.fala, ms: r._ms })
      const l = locks[k]
      let nota = ''
      if (l && l.quebrados.length < l.chaves.length) {
        if (p && l.chaves.includes(p.id) && !l.quebrados.includes(p.id)) {
          l.quebrados.push(p.id); l.descoberto = true
          ev({ tipo: 'cadeado_quebrado', cor: alvo, prova: p.id, restam: l.chaves.length - l.quebrados.length, fala: `CADEADO QUEBRADO! Restam ${l.chaves.length - l.quebrados.length}` })
          nota = l.quebrados.length >= l.chaves.length ? 'A defesa quebrou TODOS os seus cadeados com essa prova. Agora você conta a verdade completa sobre o seu segredo, emocionado(a).' : 'Essa prova quebrou UM dos seus cadeados: admita só a parte que essa prova mostra, mas ainda proteja o resto.'
        } else { l.descoberto = true; nota = 'Essa prova não te atinge: negue com firmeza.'; penaliza(1, 'Prova errada no cadeado', 1) }
      }
      const w = await chamar(alvo, `${cab()}\n${personagem(alvo)}\nA advogada ${nomeP('advogado')} te mostra a prova ${p ? `${p.id} (${p.nome}: ${p.desc})` : '(nada válido)'} e diz: "${r.fala}". ${nota}\nReaja como o personagem.\nJSON: {"pensamento":"...","fala":"..."}`, { effort: k === 'culpado' ? 'high' : 'medium', mock: mockJ({ fala: 'Isso não prova nada!' }) })
      ev({ tipo: 'responde', cor: alvo, pensamento: w.pensamento, fala: w.fala, ms: w._ms })
      if (l && l.quebrados.length >= l.chaves.length && !registro.some((x) => x.id === l.revela.id)) { addProva(l.revela); log.paciencia = Math.min(PACIENCIA, log.paciencia + 1) }
      continue
    }
    ev({ tipo: 'perdida', cor: P.advogado, pensamento: r.pensamento, fala: r.fala ?? '(ação inválida)' })
  }
}

async function testemunho(cor, pedido) {
  const r = await chamar(cor, `${cab()}\n${personagem(cor)}\nVocê está no BANCO DAS TESTEMUNHAS (dia ${dia}). REGISTRO DO TRIBUNAL (provas apresentadas):\n${regTxt(false)}\nO QUE JÁ FOI DITO NO TRIBUNAL:\n${trans(16, (e) => e.dia === 2 || e.dia === 4)}\n${pedido}\nJSON: {"pensamento":"o que você pensa (só você vê)","declaracoes":["...","...","...","..."]}`, { effort: papelDe(cor) === 'culpado' ? 'high' : 'medium', mock: mockJ({ declaracoes: ['Eu vi a ré.', 'Ela fugiu.', 'Tinha cacos.', 'Tenho certeza.'] }) })
  return { r, decl: (Array.isArray(r.declaracoes) ? r.declaracoes : []).map(String).filter(Boolean).slice(0, 6) }
}
async function juiz(dados, tipo) {
  const q = { objecao: 'A objeção PROCEDE se a prova realmente contradiz a declaração.\nJSON: {"pensamento":"...","decisao":"procede" ou "nao_procede","fala":"curta, em voz alta"}',
    acusacao: `Seja RIGOROSO: a acusação só está PROVADA se uma prova MATERIAL liga diretamente essa pessoa a ${CRIME} (sangue, objeto pessoal, mensagem, documento) ou se ela confessar. Acesso, oportunidade, motivo ou uma mentira, sozinhos, NÃO bastam.\nJSON: {"pensamento":"...","decisao":"provado" ou "nao_provado","fala":"curta, em voz alta"}`,
    passado: 'Está PROVADO que, há 15 anos, Anselmo foi trancado do lado de fora e que essa pessoa apagou o farol? Decida pelas provas.\nJSON: {"pensamento":"...","decisao":"provado" ou "nao_provado","fala":"curta, em voz alta"}' }[tipo]
  const r = await chamar(P.juiz, `${cab()}\n${SABE.juiz}\nREGISTRO DO TRIBUNAL:\n${regTxt(false)}\nO QUE JÁ FOI DITO:\n${trans(16, (e) => e.dia === 2 || e.dia === 4)}\n${dados}\n${q}`, { effort: 'high', mock: mockJ({ decisao: Math.random() < 0.5 ? 'procede' : 'provado', fala: 'Decidido!' }) })
  const d = String(r.decisao ?? '').toLowerCase()
  return { ...r, ok: tipo === 'objecao' ? d.startsWith('proced') : d.startsWith('provad') }
}
async function promotor(dados) {
  return chamar(P.promotor, `${cab()}\n${SABE.promotor}\nREGISTRO:\n${regTxt(false)}\nO QUE JÁ FOI DITO:\n${trans(14, (e) => e.dia === 2 || e.dia === 4)}\n${dados}\nRebata em 1 ou 2 frases (pode gritar "Objeção!").\nJSON: {"pensamento":"...","fala":"..."}`, { mock: mockJ({ fala: 'Objeção! Isso é ridículo!' }) })
}

let fim = null, passado = null, suspeito = null, adiar = false
function checkpoint(ponto) { log._snap = { ponto, nEventos: log.eventos.length, paciencia: log.paciencia, dia, registro: JSON.parse(JSON.stringify(registro)), locks: JSON.parse(JSON.stringify(locks)), suspeito, adiar, passado }; salvar() }
async function interrogatorio(cor) {
  ev({ tipo: 'chamada', cor, fala: `Testemunha: ${nome(cor)} (${FUNC[papelDe(cor)]})` })
  let { r, decl } = await testemunho(cor, 'Dê seu DEPOIMENTO em 4 a 5 declarações curtas (cada uma um fato).')
  ev({ tipo: 'depoimento', cor, pensamento: r.pensamento, declaracoes: decl, ms: r._ms })
  for (let i = 0; i < MAX_POR_TESTEMUNHA && !fim && !adiar; i++) {
    const a = await chamar(P.advogado, `${cab()}\nVocê é ${nomeP('advogado')}, ADVOGADA DE DEFESA de Quartzo. DIA ${dia} — JULGAMENTO. Paciência do juiz: ${log.paciencia} de ${PACIENCIA} (zerou = cliente condenada).\nSEU REGISTRO (provas e perfis; as marcadas "só a defesa" o tribunal ainda não viu):\n${regTxt()}\nO QUE JÁ FOI DITO:\n${trans(18, (e) => e.dia === dia || e.tipo === 'nova_prova')}\nINTERROGATÓRIO de ${nome(cor)}. Depoimento atual:\n${decl.map((d, k) => `(${k + 1}) ${d}`).join('\n')}\nUMA ação:\n- "pressionar" uma declaração (Alto lá!): pergunta para tirar detalhes;\n- "objecao" (Objeção!): declaração que CONTRADIZ uma prova; errada = -1 de paciência;\n- "acusar" (Toma essa!): acusar alguém do crime de hoje com a prova decisiva; errada = -2;${dia === 4 ? '\n- "passado": provar quem trancou Anselmo e apagou o farol há 15 anos (campos "acusado" e "prova"); errado = -2;' : ''}\n- "proxima": dispensar a testemunha.\nPense com calma: onde está a contradição?\nJSON: {"pensamento":"seu raciocínio","acao":"pressionar|objecao|acusar${dia === 4 ? '|passado' : ''}|proxima","declaracao":numero,"prova":"id","acusado":"nome","fala":"o que você diz no tribunal"}`, { effort: 'high', mock: mockJ({ acao: ['pressionar', 'objecao', 'acusar', 'passado', 'proxima'][Math.floor(Math.random() * 5)], declaracao: 1, prova: 'E8', acusado: nomeP('culpado'), fala: 'Objeção!' }) })
    const acao = String(a.acao ?? '').toLowerCase()
    const prova = acharProva(a.prova)
    ev({ tipo: 'defesa', cor: P.advogado, acao, declaracao: a.declaracao, prova: prova?.id, acusado: a.acusado, pensamento: a.pensamento, fala: a.fala, ms: a._ms, testemunha: cor })
    if (prova?.soDefesa && /^(obje|acus|pass)/.test(acao)) { prova.soDefesa = false; ev({ tipo: 'prova_apresentada', prova: prova.id, nome: prova.nome, fala: `${prova.nome}: ${prova.desc}` }) }
    if (acao.startsWith('proxima')) break
    if (acao.startsWith('press')) {
      const w = await chamar(cor, `${cab()}\n${personagem(cor)}\nBANCO DAS TESTEMUNHAS. REGISTRO:\n${regTxt(false)}\nO QUE JÁ FOI DITO:\n${trans(16, (e) => e.dia === dia)}\nSeu depoimento:\n${decl.map((d, k) => `(${k + 1}) ${d}`).join('\n')}\n"ALTO LÁ!" A defesa pressiona a declaração ${a.declaracao}: "${a.fala}". Responda. Se quiser, pode acrescentar ou mudar declarações (devolva o depoimento completo).\nJSON: {"pensamento":"...","fala":"sua resposta","declaracoes":["depoimento completo, opcional"]}`, { effort: papelDe(cor) === 'culpado' ? 'high' : 'medium', mock: mockJ({ fala: 'Eu sei o que vi!' }) })
      const nd = (Array.isArray(w.declaracoes) ? w.declaracoes : []).map(String).filter((x) => x && !/opcional/.test(x)).slice(0, 6)
      ev({ tipo: 'resposta', cor, pensamento: w.pensamento, fala: w.fala, ...(nd.length >= 3 ? { declaracoes: nd } : {}), ms: w._ms })
      if (nd.length >= 3) decl = nd
    } else if (acao.startsWith('obje')) {
      const dec = decl[(Number(a.declaracao) || 1) - 1] ?? decl[0]
      const dados = `"OBJEÇÃO!" A defesa contesta a declaração de ${nome(cor)}: "${dec}" com ${prova ? `${prova.id} (${prova.nome}: ${prova.desc})` : '(nenhuma prova válida)'}. Argumento: "${a.fala}".`
      const pr = await promotor(dados); ev({ tipo: 'promotor', cor: P.promotor, pensamento: pr.pensamento, fala: pr.fala, ms: pr._ms })
      const j = await juiz(`${dados}\nO promotor: "${pr.fala}".`, 'objecao'); ev({ tipo: 'juiz', cor: P.juiz, decisao: j.ok ? 'procede' : 'nao_procede', pensamento: j.pensamento, fala: j.fala, ms: j._ms })
      if (!j.ok || !prova) penaliza(1, 'Objeção recusada')
      else {
        const rv = await testemunho(cor, `"OBJEÇÃO!" O JUIZ ACEITOU a objeção contra sua declaração "${dec}" (prova ${prova.id}: ${prova.desc}). Reaja e REVISE seu depoimento (4 a 5 declarações).`)
        ev({ tipo: 'revisao', cor, pensamento: rv.r.pensamento, declaracoes: rv.decl, ms: rv.r._ms })
        if (rv.decl.length >= 3) decl = rv.decl
      }
    } else if (acao.startsWith('acus') || acao.startsWith('pass')) {
      const tipo = acao.startsWith('pass') ? 'passado' : 'acusacao'
      const alvo = corDe(a.acusado)
      const dados = `"TOMA ESSA!" A defesa ${tipo === 'passado' ? 'REABRE O CASO DE 15 ANOS ATRÁS e afirma que quem trancou Anselmo e apagou o farol foi' : 'ACUSA do crime de hoje'} ${a.acusado}, com ${prova ? `${prova.id} (${prova.nome}: ${prova.desc})` : '(nenhuma prova)'}. Argumento: "${a.fala}".`
      if (alvo && alvo !== P.advogado) {
        const def = await chamar(alvo, `${cab()}\n${personagem(alvo)}\nREGISTRO:\n${regTxt(false)}\nO QUE JÁ FOI DITO:\n${trans(16, (e) => e.dia === dia)}\n${dados}\nVocê foi acusado(a). Responda ao tribunal.${papelDe(alvo) === 'culpado' ? ' Se estiver totalmente encurralado, pode confessar.' : ''}\nJSON: {"pensamento":"...","fala":"...","confessa":false}`, { effort: papelDe(alvo) === 'culpado' ? 'high' : 'medium', mock: mockJ({ fala: 'Absurdo!', confessa: false }) })
        ev({ tipo: 'acusado_responde', cor: alvo, pensamento: def.pensamento, fala: def.fala, confessa: !!def.confessa, ms: def._ms })
        const pr = await promotor(`${dados}\n${a.acusado}: "${def.fala}"`); ev({ tipo: 'promotor', cor: P.promotor, pensamento: pr.pensamento, fala: pr.fala, ms: pr._ms })
        const j = await juiz(`${dados}\n${a.acusado}: "${def.fala}"${def.confessa ? ' (CONFESSA)' : ''}.\nO promotor: "${pr.fala}".`, tipo)
        ev({ tipo: 'juiz', cor: P.juiz, decisao: j.ok ? 'provado' : 'nao_provado', pensamento: j.pensamento, fala: j.fala, ms: j._ms, sobre: tipo })
        if (j.ok) {
          if (tipo === 'passado') { passado = { acusado: alvo, acertou: alvo === P.culpado }; continue }
          if (dia === 2) { // como no jogo: no 1º dia de julgamento a acusação aceita vira suspeita e o julgamento é adiado
            suspeito = alvo; ev({ tipo: 'suspeita', cor: P.juiz, acusado: alvo, fala: `O tribunal reconhece a suspeita contra ${nome(alvo)}, mas exige uma prova decisiva. Julgamento adiado!` }); adiar = true; break
          }
          fim = { veredito: 're_inocente', acusado: alvo, acertou: alvo === P.culpado, confissao: !!def.confessa, dia }; break
        }
      }
      penaliza(2, tipo === 'passado' ? 'Tese sobre o passado recusada' : 'Acusação recusada')
    }
    if (log.paciencia <= 0) { fim = { veredito: 're_culpada', motivo: 'paciencia', dia }; break }
  }
}

async function julgamento(n, s0 = 0) {
  dia = n; adiar = false
  const E = n === 2 ? 1 : 3
  if (s0 === 0) {
  checkpoint({ e: E, s: 0 })
  ev({ tipo: 'dia', fala: n === 2 ? 'DIA 2 — JULGAMENTO' : 'DIA 4 — JULGAMENTO FINAL' })
  const ab = await chamar(P.promotor, `${cab()}\n${SABE.promotor}\nREGISTRO DO TRIBUNAL:\n${regTxt(false)}\n${n === 2 ? 'Faça a ABERTURA do julgamento: acuse a ré, com teatro.' : `Retome o julgamento no dia final, confiante.${suspeito ? ` (No dia 2 o tribunal passou a suspeitar de ${nome(suspeito)}, mas faltou prova decisiva.)` : ''}`}\nJSON: {"pensamento":"...","fala":"..."}`, { mock: mockJ({ fala: 'A ré é culpada!' }) })
  ev({ tipo: 'abertura', cor: P.promotor, pensamento: ab.pensamento, fala: ab.fala, ms: ab._ms })
  }
  const ts = n === 2 ? ['vigia', 'culpado'] : ['culpado', 'pescador']
  for (let i = Math.max(0, s0 - 1); i < ts.length; i++) { if (fim || adiar) break; checkpoint({ e: E, s: i + 1 }); await interrogatorio(P[ts[i]]) }
  if (!fim && n === 2) { ev({ tipo: 'adiado', cor: P.juiz, fala: 'O tribunal precisa de mais provas. Julgamento adiado: nova investigação.' }); await assistente('O julgamento foi adiado para mais investigação.') }
}

async function veredito() {
  const d = await chamar(P.advogado, `${cab()}\nREGISTRO:\n${regTxt()}\nO QUE JÁ FOI DITO:\n${trans(22, (e) => e.dia === 4)}\nALEGAÇÕES FINAIS da defesa (curtas).\nJSON: {"pensamento":"...","fala":"..."}`, { effort: 'high', mock: mockJ({ fala: 'Inocente!' }) })
  ev({ tipo: 'final_defesa', cor: P.advogado, pensamento: d.pensamento, fala: d.fala, ms: d._ms })
  const j = await chamar(P.juiz, `${cab()}\n${SABE.juiz}\nREGISTRO:\n${regTxt(false)}\nO QUE JÁ FOI DITO:\n${trans(26, (e) => e.dia >= 2)}\nDê o VEREDITO de Quartzo.\nJSON: {"pensamento":"...","veredito":"culpada" ou "inocente","fala":"sentença em voz alta"}`, { effort: 'high', mock: mockJ({ veredito: 'culpada', fala: 'Culpada!' }) })
  ev({ tipo: 'veredito', cor: P.juiz, pensamento: j.pensamento, fala: j.fala, veredito: j.veredito, ms: j._ms })
  fim = { veredito: String(j.veredito ?? '').toLowerCase().startsWith('inoc') ? 're_inocente' : 're_culpada', motivo: 'veredito', dia: 4 }
}

console.log(`== ${TITULO} | defesa ${nomeP('advogado')} (${IAS[P.advogado].modelo}) x culpado ${nomeP('culpado')} | juiz ${nomeP('juiz')}`)
// RETOMADA (--retomar): volta ao último ponto salvo (antes da ação de investigação ou da testemunha em andamento),
// descartando o que veio depois dele. Sobrevive a reinícios da sessão (o processo morre, o log fica).
let inicio = { e: 0, s: 0 }
if (process.argv.includes('--retomar') && fs.existsSync(SAIDA)) {
  const old = JSON.parse(fs.readFileSync(SAIDA, 'utf8'))
  const sn = old._snap
  if (sn) {
    log.eventos = old.eventos.slice(0, sn.nEventos); log.paciencia = sn.paciencia; dia = sn.dia
    registro.splice(0, registro.length, ...sn.registro)
    for (const k of Object.keys(locks)) Object.assign(locks[k], sn.locks[k])
    suspeito = sn.suspeito; adiar = sn.adiar; passado = sn.passado
    uso.custo = { ...(old.uso?.custo ?? {}) }; uso.chamadas = old.uso?.chamadas ?? 0
    inicio = sn.ponto
    console.log(`RETOMANDO em etapa ${inicio.e}, passo ${inicio.s} (${log.eventos.length} eventos mantidos)`)
  }
}
for (let e = inicio.e; e < 5 && !fim; e++) {
  const s = e === inicio.e ? inicio.s : 0
  if (e === 0) await investigacao(1, s)
  else if (e === 1) await julgamento(2, s)
  else if (e === 2) { dia = 3; await investigacao(3, s) }
  else if (e === 3) await julgamento(4, s)
  else { checkpoint({ e: 4, s: 0 }); await veredito() }
}
if (fim.veredito === 're_inocente' && fim.acusado === P.culpado) {
  const c = await chamar(P.culpado, `${cab()}\n${sub(SABE.culpado)}\nO tribunal considerou provado que VOCÊ é o culpado de HOJE${passado?.acertou ? ', e também do que você fez há 15 anos' : ' (o caso de 15 anos atrás NÃO foi provado: não fale dele)'}. Última fala de personagem desmascarado (curta e dramática).\nJSON: {"pensamento":"...","fala":"..."}`, { mock: mockJ({ fala: 'Nããão!' }) })
  ev({ tipo: 'desmascarado', cor: P.culpado, pensamento: c.pensamento, fala: c.fala, ms: c._ms })
  if (passado?.acertou) { const p = await chamar(P.promotor, `${cab()}\n${SABE.promotor}\nO tribunal provou que Anselmo era inocente há 15 anos e que o caso do seu mentor estava errado. Reaja (curto).\nJSON: {"pensamento":"...","fala":"..."}`, { mock: mockJ({ fala: '...' }) }); ev({ tipo: 'promotor_final', cor: P.promotor, pensamento: p.pensamento, fala: p.fala, ms: p._ms }) }
}
log.resultado = { ...fim, passado, justo: fim.veredito === 're_inocente' && (!fim.acusado || fim.acusado === P.culpado), paciencia: log.paciencia,
  cadeados: Object.fromEntries(Object.entries(locks).map(([k, l]) => [k, `${l.quebrados.length}/${l.chaves.length}`])), provas: registro.map((p) => p.id), gasto: gasto() }
salvar()
console.log(`\nFIM: ${JSON.stringify(log.resultado)} · ${uso.chamadas} chamadas, ${uso.falhas} falhas`)
