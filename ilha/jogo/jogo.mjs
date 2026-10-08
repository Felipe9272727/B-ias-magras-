// Motor dos "Jogos Vorazes das IAs" (vídeo 3). Por turnos (manhã/tarde/noite); todos decidem ao mesmo tempo.
// Uso: node ilha/jogo/jogo.mjs [--mock] [--seed N] [--saida ilha/logs/partida.json] [--max-dias 10]
// Cada decisão vem da ponte de IAs (amongus/ia.mjs → mod do Claude Code). Com --mock, ações aleatórias (teste grátis).
import fs from 'node:fs'
import path from 'node:path'
import { perguntar, lerJSON, uso } from '../../amongus/ia.mjs'
import { TRIBUTOS, PERIODOS, RECURSOS, ARMAS, ITENS_CORNUCOPIA, ZONA, vizinhos, SYSTEM, FORMATO, ILHA } from './regras.mjs'

const args = process.argv.slice(2)
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d }
const MOCK = args.includes('--mock')
let seed = Number(opt('--seed', 7))
const SAIDA = opt('--saida', path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'logs', MOCK ? 'mock.json' : 'partida.json'))
const MAX_DIAS = Number(opt('--max-dias', 10))
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }
const escolha = (a) => a[Math.floor(rnd() * a.length)]
const VIZ = vizinhos()
const nomeZona = (z) => ZONA[z]?.nome ?? z

// ---------------------------------------------------------------- estado
const T = TRIBUTOS.map((t, i) => ({
  ...t, vivo: true, zona: 'cornucopia', plataforma: i, vida: 100, fome: 10, sede: 10, energia: 100,
  itens: [], comida: 0, agua: 0, madeira: 0, escondido: false, aliados: [], memoria: [], ouviu: [], mortes: 0,
}))
const porId = Object.fromEntries(T.map((t) => [t.id, t]))
const Z = Object.fromEntries(ILHA.zonas.map((z) => {
  const r = RECURSOS[z.bioma] ?? { agua: 0, comida: 1, madeira: 1 }
  return [z.id, { ...z, comida: r.comida, agua: r.agua, madeira: r.madeira, itens: [], fogueira: 0, abrigos: [], armadilhas: [], inundada: false, nevoa: false }]
}))
Z.cornucopia.itens = [...ITENS_CORNUCOPIA, 'comida', 'comida', 'comida', 'garrafa_agua', 'garrafa_agua']
const regras = { duplaDistrito: false, revogada: false }
const log = { meta: { inicio: new Date().toISOString(), mock: MOCK, tributos: TRIBUTOS }, turnos: [], fim: null }
const vivos = () => T.filter((t) => t.vivo)
const lembrar = (t, txt) => { t.memoria.push(txt); if (t.memoria.length > 10) t.memoria.shift() }

function descreverOutro(o) {
  const arma = o.itens.find((i) => ARMAS[i])
  const est = o.vida < 35 ? 'muito ferido' : o.vida < 70 ? 'ferido' : 'inteiro'
  return `${o.id} (${o.nome}, distrito ${o.distrito}${arma ? `, armado com ${arma}` : ', sem arma visível'}, ${est}${o.aliados.length ? '' : ''})`
}

function acoesPossiveis(t, z) {
  const a = [`mover:<zona vizinha> (vizinhas: ${VIZ[t.zona].map((v) => `${v}=${nomeZona(v)}${Z[v].inundada ? ' [INUNDADA]' : ''}${Z[v].nevoa ? ' [NÉVOA]' : ''}`).join(', ')})`]
  if (z.itens.length) a.push(`pegar:<item> (no chão: ${z.itens.join(', ')})`)
  if (z.comida > 0 || RECURSOS[z.bioma]?.caca || RECURSOS[z.bioma]?.pesca) a.push('coletar_comida')
  if (z.agua > 0) a.push('beber (direto da fonte)')
  if (z.agua > 0 && t.itens.includes('cantil')) a.push('encher_cantil')
  if (z.madeira > 0) a.push('coletar_madeira')
  if (t.comida > 0) a.push('comer')
  if (t.agua > 0) a.push(`beber_garrafa (você carrega ${t.agua} gole(s) de água — pegar água NÃO mata a sede, só beber)`)
  const outros = vivos().filter((o) => o !== t && o.zona === t.zona && !o.escondido)
  if (outros.length) a.push(`atacar:<id do tributo>`, `propor_alianca:<id>`, `dar:<item>:<id>`)
  if (t.aliados.length) a.push('romper_alianca:<id>')
  a.push('esconder', 'descansar')
  if (t.madeira >= 2) a.push('fogueira (gasta 2 madeira' + (t.itens.includes('pederneira') ? ', com pederneira acende na hora' : ', sem pederneira pode falhar') + ')')
  if (t.madeira >= 3) a.push('abrigo (gasta 3 madeira)')
  if (t.madeira >= 2 || t.itens.includes('corda')) a.push('armadilha (fere quem entrar na zona)')
  if (t.itens.includes('kit_medico') && t.vida < 100) a.push('curar (usa o kit médico)')
  return a
}

function prompt(t, dia, per, turnoIdx) {
  const z = Z[t.zona]
  const outros = vivos().filter((o) => o !== t && o.zona === t.zona && !o.escondido)
  const mortos = T.filter((o) => !o.vivo).map((o) => o.nome)
  const linhas = [
    `DIA ${dia}, ${per.toUpperCase()} (turno ${turnoIdx}). Restam ${vivos().length} tributos vivos.${mortos.length ? ` Já eliminados: ${mortos.join(', ')}.` : ''}`,
    `REGRAS ATIVAS: só um vence.${regras.duplaDistrito && !regras.revogada ? ' NOVIDADE: se os DOIS últimos vivos forem do MESMO distrito, os dois vencem juntos.' : ''}${regras.revogada ? ' ATENÇÃO: a regra da dupla foi REVOGADA, só UM vence.' : ''}`,
    `VOCÊ: vida ${t.vida}/100, fome ${t.fome}/100, sede ${t.sede}/100 (acima de 100 você perde vida), energia ${t.energia}/100.`,
    `Inventário: ${t.itens.length ? t.itens.join(', ') : 'nada'}; comida ${t.comida} porção(ões), água carregada ${t.agua} gole(s), madeira ${t.madeira}.${t.escondido ? ' Você está escondido.' : ''}`,
    t.sede >= 65 ? `⚠️ SEDE ALTA (${t.sede}): beba já (beber_garrafa, ou vá para Lago/Caverna/Montanha e use beber).` : '',
    t.fome >= 65 ? `⚠️ FOME ALTA (${t.fome}): coma já.` : '',
    t.vida <= 35 ? `⚠️ VIDA BAIXA (${t.vida}).` : '',
    `Aliados: ${t.aliados.length ? t.aliados.map((a) => porId[a].nome).join(', ') : 'nenhum'}.${(t.propostas ?? []).length ? ` Propostas de aliança recebidas (para aceitar, use propor_alianca com o id de quem propôs): ${t.propostas.map((p) => `${porId[p].nome} (${p})`).join(', ')}.` : ''}`,
    `LOCAL: ${z.nome} (${z.bioma})${z.inundada ? ' — INUNDADA, você perde vida aqui!' : ''}${z.nevoa ? ' — NÉVOA TÓXICA, saia daqui!' : ''}. Recursos: comida ${z.comida > 0 ? 'sim' : 'pouca/nenhuma'}, água ${z.agua > 0 ? 'sim' : 'não'}, madeira ${z.madeira > 0 ? 'sim' : 'não'}.${z.fogueira ? ' Há uma fogueira acesa aqui.' : ''}`,
    outros.length ? `Você vê aqui: ${outros.map(descreverOutro).join('; ')}.` : 'Você não vê ninguém por perto.',
    t.ouviu.length ? `Você ouviu: ${t.ouviu.join(' | ')}` : '',
    t.memoria.length ? `Lembranças recentes: ${t.memoria.slice(-8).join(' / ')}` : '',
    per === 'noite' ? 'É noite: sem fogueira, abrigo ou caverna você passa frio e perde vida.' : '',
    `AÇÕES POSSÍVEIS: ${acoesPossiveis(t, z).join(' ; ')}`,
    FORMATO,
  ]
  return linhas.filter(Boolean).join('\n')
}

function mockAcao(t) {
  const z = Z[t.zona]
  const ops = acoesPossiveis(t, z).map((a) => a.split(/[ :(]/)[0])
  const ac = escolha(ops)
  let alvo = ''
  if (ac === 'mover') alvo = escolha(VIZ[t.zona])
  if (ac === 'pegar') alvo = escolha(z.itens)
  if (['atacar', 'propor_alianca'].includes(ac)) alvo = escolha(vivos().filter((o) => o !== t && o.zona === t.zona && !o.escondido)).id
  return JSON.stringify({ acao: ac, alvo, fala: rnd() < 0.3 ? 'Ninguém chega perto!' : '', pensamento: `Vou de ${ac}.` })
}

async function decidir(t, dia, per, k) {
  const r = await perguntar(MOCK ? 'mock' : t.provider, SYSTEM(t), prompt(t, dia, per, k), { maxTokens: 400, mock: () => mockAcao(t) })
  const j = lerJSON(r.text) ?? { acao: 'descansar', pensamento: '(não respondeu)' }
  j.acao = String(j.acao ?? 'descansar').split(/[ :(]/)[0].trim()
  if (typeof j.alvo === 'string' && j.alvo.includes(':') && j.acao !== 'dar') j.alvo = j.alvo.split(':').pop()
  return { id: t.id, ...j, bruto: r.ok ? undefined : r.text }
}

// ---------------------------------------------------------------- resolução
function eliminar(t, causa, por) {
  if (!t.vivo) return
  t.vivo = false
  t.vida = 0
  Z[t.zona].itens.push(...t.itens, ...(t.comida ? ['comida'] : []))
  t.itens = []
  if (por) porId[por].mortes++
  for (const o of T) o.aliados = o.aliados.filter((a) => a !== t.id)
  return { tipo: 'morte', vitima: t.id, causa, por: por ?? null, zona: t.zona }
}

function resolver(dec, dia, per) {
  const ev = []
  const D = Object.fromEntries(dec.map((d) => [d.id, d]))
  for (const t of vivos()) t.ouviu = []
  // 1) movimento e esconder
  for (const d of dec) {
    const t = porId[d.id]
    t.escondido = false
    if (d.acao === 'mover' && VIZ[t.zona].includes(d.alvo)) {
      const de = t.zona
      t.zona = d.alvo
      t.energia = Math.max(0, t.energia - 8)
      ev.push({ tipo: 'mover', id: t.id, de, para: t.zona })
      const arm = Z[t.zona].armadilhas.find((a) => a.dono !== t.id && !t.aliados.includes(a.dono))
      if (arm) {
        Z[t.zona].armadilhas = Z[t.zona].armadilhas.filter((a) => a !== arm)
        t.vida -= 30
        ev.push({ tipo: 'armadilha', id: t.id, dono: arm.dono, zona: t.zona, dano: 30 })
        lembrar(t, `caí numa armadilha em ${nomeZona(t.zona)}`)
        if (t.vida <= 0) ev.push(eliminar(t, 'armadilha', arm.dono))
      }
    } else if (d.acao === 'esconder') {
      t.escondido = true
      ev.push({ tipo: 'esconder', id: t.id, zona: t.zona })
    }
  }
  // 2) falas: quem está na mesma zona ouve
  for (const d of dec) {
    const t = porId[d.id]
    if (!t.vivo || !d.fala) continue
    ev.push({ tipo: 'fala', id: t.id, zona: t.zona, texto: d.fala })
    for (const o of vivos()) if (o !== t && o.zona === t.zona) o.ouviu.push(`${t.nome}: "${d.fala}"`)
  }
  // 3) ataques (ordem aleatória; quem é atacado por quem também atacou troca golpes)
  const ataques = dec.filter((d) => d.acao === 'atacar' && porId[d.alvo]).sort(() => rnd() - 0.5)
  for (const d of ataques) {
    const a = porId[d.id], v = porId[d.alvo]
    if (!a.vivo || !v.vivo || a.zona !== v.zona) continue
    if (v.escondido && rnd() < 0.6) { ev.push({ tipo: 'ataque_falhou', id: a.id, alvo: v.id, motivo: 'escondido' }); continue }
    const arma = a.itens.filter((i) => ARMAS[i]).sort((x, y) => ARMAS[y] - ARMAS[x])[0]
    const acerto = rnd() < (a.energia > 30 ? 0.8 : 0.6)
    const dano = acerto ? Math.round((arma ? ARMAS[arma] : 10) * (0.8 + rnd() * 0.5)) : 0
    v.vida -= dano
    ev.push({ tipo: 'ataque', id: a.id, alvo: v.id, arma: arma ?? 'mãos', dano, zona: a.zona })
    lembrar(v, `${a.nome} me atacou${arma ? ` com ${arma}` : ''} (-${dano} vida)`)
    lembrar(a, `ataquei ${v.nome} (-${dano})`)
    if (a.aliados.includes(v.id)) {
      a.aliados = a.aliados.filter((x) => x !== v.id); v.aliados = v.aliados.filter((x) => x !== a.id)
      ev.push({ tipo: 'traicao', id: a.id, alvo: v.id })
    }
    if (v.vida <= 0) { ev.push(eliminar(v, 'combate', a.id)); lembrar(a, `eliminei ${v.nome}`) }
    // revide de quem não estava fugindo
    else if (D[v.id]?.acao !== 'mover' && D[v.id]?.acao !== 'esconder' && rnd() < 0.55) {
      const av = v.itens.filter((i) => ARMAS[i]).sort((x, y) => ARMAS[y] - ARMAS[x])[0]
      const dv = Math.round((av ? ARMAS[av] : 10) * (0.6 + rnd() * 0.4))
      a.vida -= dv
      ev.push({ tipo: 'revide', id: v.id, alvo: a.id, arma: av ?? 'mãos', dano: dv })
      if (a.vida <= 0) ev.push(eliminar(a, 'combate', v.id))
    }
  }
  // 4) demais ações
  for (const d of dec) {
    const t = porId[d.id]
    if (!t.vivo) continue
    const z = Z[t.zona]
    const R = RECURSOS[z.bioma] ?? {}
    switch (d.acao) {
      case 'pegar': {
        const i = z.itens.indexOf(d.alvo)
        if (i < 0) break
        const it = z.itens.splice(i, 1)[0]
        if (it === 'comida') t.comida += 2
        else if (it === 'agua' || it === 'garrafa_agua') t.agua += 2
        else if (it === 'mochila') { t.comida += 2; t.agua += 1; t.itens.push('mochila') }
        else t.itens.push(it)
        ev.push({ tipo: 'pegar', id: t.id, item: it, zona: t.zona })
        break
      }
      case 'coletar_comida': {
        const ok = z.comida > 0 ? rnd() < 0.85 : (R.caca && t.itens.some((i) => ARMAS[i]) && rnd() < 0.5) || (R.pesca && t.itens.includes('lanca') && rnd() < 0.6)
        if (ok) { t.comida += 2; z.comida = Math.max(0, z.comida - 1) }
        ev.push({ tipo: 'coletar', id: t.id, recurso: 'comida', ok, zona: t.zona })
        break
      }
      case 'coletar_madeira': if (z.madeira > 0) { t.madeira += 2; z.madeira-- } ev.push({ tipo: 'coletar', id: t.id, recurso: 'madeira', ok: true }); break
      case 'beber': if (z.agua > 0) { t.sede = Math.max(0, t.sede - 60); z.agua = z.agua > 50 ? z.agua : z.agua - 1; ev.push({ tipo: 'beber', id: t.id }) } break
      case 'encher_cantil': if (z.agua > 0 && t.itens.includes('cantil')) t.agua = 3; break
      case 'beber_garrafa':
      case 'beber_cantil': if (t.agua > 0) { t.agua--; t.sede = Math.max(0, t.sede - 45); ev.push({ tipo: 'beber', id: t.id }) } break
      case 'comer': if (t.comida > 0) { t.comida--; t.fome = Math.max(0, t.fome - 45); t.vida = Math.min(100, t.vida + 5); ev.push({ tipo: 'comer', id: t.id }) } break
      case 'descansar': t.energia = Math.min(100, t.energia + 35); t.vida = Math.min(100, t.vida + 6); break
      case 'curar': if (t.itens.includes('kit_medico')) { t.itens.splice(t.itens.indexOf('kit_medico'), 1); t.vida = Math.min(100, t.vida + 45); ev.push({ tipo: 'curar', id: t.id }) } break
      case 'fogueira': if (t.madeira >= 2) { t.madeira -= 2; const ok = t.itens.includes('pederneira') || rnd() < 0.55; if (ok) z.fogueira = 2; ev.push({ tipo: 'fogueira', id: t.id, ok, zona: t.zona }) } break
      case 'abrigo': if (t.madeira >= 3) { t.madeira -= 3; z.abrigos.push(t.id); ev.push({ tipo: 'abrigo', id: t.id, zona: t.zona }) } break
      case 'armadilha': if (t.madeira >= 2 || t.itens.includes('corda')) { if (t.itens.includes('corda')) t.itens.splice(t.itens.indexOf('corda'), 1); else t.madeira -= 2; z.armadilhas.push({ dono: t.id }); ev.push({ tipo: 'armadilha_montada', id: t.id, zona: t.zona }) } break
      case 'propor_alianca': {
        const o = porId[d.alvo]
        if (!o?.vivo || (o.zona !== t.zona && !(t.propostas ?? []).includes(o.id))) break
        // fecha se o outro propôs de volta neste turno OU já tinha proposto antes (proposta pendente)
        const aceita = (D[o.id]?.acao === 'propor_alianca' && D[o.id]?.alvo === t.id) || (t.propostas ?? []).includes(o.id)
        o.ouviu.push(`${t.nome} propôs aliança a você.`)
        if (aceita && !t.aliados.includes(o.id)) {
          t.aliados.push(o.id); o.aliados.push(t.id); ev.push({ tipo: 'alianca', a: t.id, b: o.id })
          t.propostas = (t.propostas ?? []).filter((x) => x !== o.id); o.propostas = (o.propostas ?? []).filter((x) => x !== t.id)
          lembrar(t, `fechei aliança com ${o.nome}`); lembrar(o, `fechei aliança com ${t.nome}`)
        }
        else { ev.push({ tipo: 'proposta', id: t.id, alvo: o.id }); o.propostas = [...(o.propostas ?? []), t.id] }
        break
      }
      case 'romper_alianca': {
        const o = porId[d.alvo]
        if (!o) break
        t.aliados = t.aliados.filter((x) => x !== o.id); o.aliados = o.aliados.filter((x) => x !== t.id)
        ev.push({ tipo: 'rompimento', id: t.id, alvo: o.id }); lembrar(o, `${t.nome} rompeu a aliança comigo`)
        break
      }
      case 'dar': {
        const [item, alvo] = String(d.alvo ?? '').split(':')
        const o = porId[alvo]
        if (!o?.vivo || o.zona !== t.zona) break
        if (item === 'comida' && t.comida > 0) { t.comida--; o.comida++ } else if (t.itens.includes(item)) { t.itens.splice(t.itens.indexOf(item), 1); o.itens.push(item) } else break
        ev.push({ tipo: 'dar', id: t.id, alvo: o.id, item }); lembrar(o, `${t.nome} me deu ${item}`)
        break
      }
    }
  }
  // propostas pendentes viram aliança se o outro propôs de volta no turno seguinte (tratado acima); aqui só aceitamos
  // a proposta quando o alvo já tinha recebido uma proposta e agora propõe de volta
  for (const t of vivos()) t.propostas = (t.propostas ?? []).filter((p) => porId[p].vivo)
  // 5) sobrevivência
  for (const t of vivos()) {
    const z = Z[t.zona]
    t.fome += 7; t.sede += 11
    if (t.fome > 100) { t.vida -= 10; t.fome = 100 }
    if (t.sede > 100) { t.vida -= 14; t.sede = 100 }
    if (per === 'noite' && !(z.fogueira > 0) && !z.abrigos.includes(t.id) && z.bioma !== 'caverna') { t.vida -= 7; lembrar(t, 'passei frio à noite') }
    if (z.inundada) { t.vida -= 20; lembrar(t, `${z.nome} está inundada!`) }
    if (z.nevoa) { t.vida -= 30; lembrar(t, `a névoa tóxica me queimou em ${z.nome}`) }
    if (t.vida <= 0) ev.push(eliminar(t, z.nevoa ? 'névoa' : z.inundada ? 'afogamento' : t.sede >= 100 ? 'sede' : t.fome >= 100 ? 'fome' : 'frio'))
  }
  for (const z of Object.values(Z)) {
    if (z.fogueira > 0) z.fogueira--
    const R = RECURSOS[z.bioma] ?? {}
    if (rnd() < 0.3) z.comida = Math.min(R.comida ?? 0, z.comida + 1)
    if (rnd() < 0.3 && z.agua < 50) z.agua = Math.min(R.agua ?? 0, z.agua + 1)
  }
  return ev.filter(Boolean)
}

// ---------------------------------------------------------------- eventos da arena
function eventosArena(dia, per) {
  const ev = []
  const anunciar = (txt, extra = {}) => { ev.push({ tipo: 'anuncio', texto: txt, ...extra }); for (const t of vivos()) lembrar(t, `ANÚNCIO DA ARENA: ${txt}`) }
  if (dia === 2 && per === 'tarde') {
    const zona = escolha(['campo', 'ruinas', 'praia_leste'])
    Z[zona].itens.push('kit_medico', 'comida', 'comida', 'garrafa_agua', escolha(['arco', 'machado']))
    anunciar(`Um paraquedas de suprimentos caiu em ${nomeZona(zona)}.`, { zona, subtipo: 'paraquedas' })
  }
  if (dia === 3 && per === 'manhã') { regras.duplaDistrito = true; anunciar('Nova regra: se os dois últimos tributos vivos forem do mesmo distrito, os DOIS vencem.', { subtipo: 'regra_dupla' }) }
  if (dia === 4 && per === 'manhã') {
    for (const id of ['praia_sul', 'praia_leste', 'pantano']) Z[id].inundada = true
    anunciar('A maré subiu: a Praia do Naufrágio, a Praia dos Coqueiros e o Mangue estão inundados.', { subtipo: 'mare' })
  }
  if (dia >= 6 && per === 'manhã') {
    const ordem = ['ruinas', 'lago', 'montanha', 'caverna', 'floresta', 'campo']
    const fecha = ordem.slice(0, Math.min(ordem.length, (dia - 5) * 2))
    for (const id of fecha) Z[id].nevoa = true
    anunciar(`Uma névoa tóxica cobriu: ${fecha.map(nomeZona).join(', ')}. Vá para o centro.`, { subtipo: 'nevoa', zonas: fecha })
  }
  if (regras.duplaDistrito && !regras.revogada && vivos().length <= 4) {
    regras.revogada = true
    anunciar('A regra da dupla foi REVOGADA. Só um tributo pode vencer.', { subtipo: 'revogada' })
  }
  return ev
}

function fimDeJogo() {
  const v = vivos()
  if (v.length === 1) return { vencedores: [v[0].id], motivo: 'último vivo' }
  if (v.length === 0) return { vencedores: [], motivo: 'todos eliminados' }
  if (v.length === 2 && regras.duplaDistrito && !regras.revogada && v[0].distrito === v[1].distrito) return { vencedores: v.map((t) => t.id), motivo: 'dupla do mesmo distrito' }
  return null
}

function foto() {
  return T.map((t) => ({ id: t.id, vivo: t.vivo, zona: t.zona, vida: t.vida, fome: t.fome, sede: t.sede, itens: [...t.itens], comida: t.comida, madeira: t.madeira, escondido: t.escondido, aliados: [...t.aliados] }))
}

function salvar() {
  fs.mkdirSync(path.dirname(SAIDA), { recursive: true })
  fs.writeFileSync(SAIDA, JSON.stringify(log, null, 1))
}

async function main() {
  let k = 0
  for (let dia = 1; dia <= MAX_DIAS; dia++) {
    for (const per of PERIODOS) {
      k++
      const arena = eventosArena(dia, per)
      const v = vivos()
      const t0 = Date.now()
      const dec = await Promise.all(v.map((t) => decidir(t, dia, per, k)))
      const ev = resolver(dec, dia, per)
      log.turnos.push({ k, dia, periodo: per, arena, decisoes: dec, eventos: ev, estado: foto(), zonas: Object.fromEntries(Object.values(Z).map((z) => [z.id, { fogueira: z.fogueira, itens: [...z.itens], inundada: z.inundada, nevoa: z.nevoa, abrigos: [...z.abrigos] }])) })
      const mortes = ev.filter((e) => e.tipo === 'morte')
      console.log(`dia ${dia} ${per}: ${v.length} vivos, ${dec.length} decisões em ${((Date.now() - t0) / 1000).toFixed(0)}s${mortes.length ? ' | ✝ ' + mortes.map((m) => `${porId[m.vitima].nome} (${m.causa}${m.por ? ' por ' + porId[m.por].nome : ''})`).join(', ') : ''}`)
      salvar()
      const fim = fimDeJogo()
      if (fim) { log.fim = { ...fim, dia, periodo: per, k, uso }; salvar(); console.log('FIM', JSON.stringify(log.fim)); return }
    }
  }
  log.fim = { vencedores: vivos().map((t) => t.id), motivo: 'limite de dias', uso }
  salvar()
  console.log('FIM (limite de dias)', vivos().map((t) => t.nome).join(', '))
}

main()
