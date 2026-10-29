// Animação dos bonecos: passada (pernas e braços), golpes (mineração, colocar bloco, ataque), dano e morte.
// As contas seguem o Minecraft: limbSwing soma min(1, 4·v_tick) a cada tick, então por bloco andado a fase anda 4.
// A página (pagina/10_anim.js) aplica tudo nos ossos do modelo.

const FASE = 4                // fase da passada por bloco andado (ver acima)
const VEL_PLENA = 5           // la = min(1, v / 5), v em blocos/s (= 4 · v_tick)
const GOLPE = 0.3             // um golpe dura 6 ticks
const GOLPE_MINERANDO = 0.25  // enquanto mina, um golpe a cada 0,25 s
const JANELA_QUEBRA = 1.2     // balança o braço até 1,2 s antes da quebra
const ALCANCE_QUEBRA = 4.5    // folhas somem sozinhas: quebra só conta com a IA a até 4,5 blocos
const ALCANCE_COLOCAR = 5
const ALCANCE_ATAQUE = 3.5
const PASSO_ATAQUE = 0.6
const DURACAO_ATAQUE = 15
const DANO_DUR = 0.35
const MORTE_QUEDA = 0.5       // o tombo de 90° leva 0,5 s
const MORTE_SEGURA = 1.0      // o corpo fica no lugar 1 s depois da morte
const PASSO_MAX = 1.5         // dt máximo entre registros pra contar deslocamento
const VEL_TELEPORTE = 8       // mais que isso (blocos/s) é teletransporte ou renascimento

let S = null

// último índice de arr (números em ordem) com valor <= t, ou -1
function ultimo(arr, t) {
  let lo = 0, hi = arr.length - 1, ach = -1
  while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] <= t) { ach = m; lo = m + 1 } else hi = m - 1 }
  return ach
}

// valor de A (mesmo tamanho de T) em t, interpolado linearmente
function lerp(T, A, t) {
  const i = ultimo(T, t)
  if (i < 0) return A[0]
  if (i >= T.length - 1) return A[T.length - 1]
  const k = (t - T[i]) / Math.max(1e-6, T[i + 1] - T[i])
  return A[i] + (A[i + 1] - A[i]) * k
}

// distância andada e velocidade suavizada (la) de uma sequência de pontos [t, x, y, z]
function andar(T, X, Z, parado) {
  const n = T.length
  const D = new Array(n), LA = new Array(n)
  let d = 0, la = 0
  for (let i = 0; i < n; i++) {
    let v = 0
    if (i > 0) {
      const dt = T[i] - T[i - 1]
      if (!(parado && (parado[i] || parado[i - 1])) && dt > 0 && dt < PASSO_MAX) {
        const s = Math.hypot(X[i] - X[i - 1], Z[i] - Z[i - 1])
        v = s / dt
        if (v <= VEL_TELEPORTE) d += s; else v = 0
      }
    }
    // suaviza como o Minecraft (0,4 por tick; 5 ticks entre registros)
    la += (Math.min(1, v / VEL_PLENA) - la) * (1 - 0.6 ** 5)
    D[i] = d; LA[i] = la
  }
  return { D, LA }
}

// trilha de uma IA: posições, passada e os tempos de morte (o corpo fica parado do morto até o renascimento)
function trilhaIA(recs, mortes) {
  const n = recs.length
  const T = recs.map(r => r.t), X = recs.map(r => r.x), Y = recs.map(r => r.y), Z = recs.map(r => r.z)
  const YAW = recs.map(r => r.yaw ?? 0), PITCH = recs.map(r => r.pitch ?? 0)
  const parado = new Array(n).fill(false)
  for (const m of mortes) for (let i = 0; i < n; i++) if (T[i] >= m.tm && T[i] < m.respT) parado[i] = true
  const { D, LA } = andar(T, X, Z, parado)
  return { T, X, Y, Z, YAW, PITCH, D, LA, mortes, danos: [], golpes: [] }
}

// trilha de um mob: pontos [t, x, y, z] de todos os bots, sem repetir (a cada 0,2 s no mínimo)
function trilhaMob(pontos, tipo) {
  pontos.sort((a, b) => a[0] - b[0])
  const limpo = []
  for (const p of pontos) if (!limpo.length || p[0] - limpo[limpo.length - 1][0] >= 0.2) limpo.push(p)
  const T = limpo.map(p => p[0]), X = limpo.map(p => p[1]), Y = limpo.map(p => p[2]), Z = limpo.map(p => p[3])
  const { D, LA } = andar(T, X, Z, null)
  return { tipo, T, X, Y, Z, D, LA }
}

function posIA(ia, t) {
  return { x: lerp(ia.T, ia.X, t), y: lerp(ia.T, ia.Y, t), z: lerp(ia.T, ia.Z, t) }
}

function emMorte(ia, t) {
  return ia.mortes.some(m => t >= m.tm && t < m.respT)
}

export function preparar(dados) {
  const { posicoes, blocos, mobsPorBot, eventos, NOMES_IA } = dados
  const evs = [...eventos].sort((a, b) => a.t - b.t)
  S = { ias: {}, mobs: new Map() }

  // ---- mortes: o renascimento é o primeiro registro depois da morte com vida (ou a mais de 2 blocos do ponto)
  const mortesPor = {}, danosPor = {}
  for (const e of evs) {
    if (e.tipo === 'morte' && e.quem) (mortesPor[e.quem] ??= []).push(e.t)
    if (e.tipo === 'dano' && e.quem) (danosPor[e.quem] ??= []).push(e.t)
  }
  for (const nome of Object.keys(posicoes)) {
    const recs = posicoes[nome]
    const mortes = (mortesPor[nome] ?? []).sort((a, b) => a - b).map(tm => {
      let pre = null
      for (const r of recs) { if (r.t <= tm) pre = r; else break }
      let respT = Infinity
      for (const r of recs) {
        if (r.t > tm && ((r.v ?? 0) > 0 || (pre && Math.hypot(r.x - pre.x, r.z - pre.z) > 2))) { respT = r.t; break }
      }
      return { tm, pre, respT }
    })
    const ia = trilhaIA(recs, mortes)
    ia.danos = (danosPor[nome] ?? []).sort((a, b) => a - b)
    S.ias[nome] = ia
  }
  const nomesIA = Object.keys(S.ias)

  // ---- mobs: junta os registros de todos os bots pelo id
  const porId = new Map()
  for (const lista of mobsPorBot) for (const r of lista) for (const m of r.l) {
    let a = porId.get(m.id)
    if (!a) porId.set(m.id, a = { tipo: m.m, pontos: [] })
    a.pontos.push([r.t, m.x, m.y, m.z])
  }
  for (const [id, a] of porId) S.mobs.set(id, trilhaMob(a.pontos, a.tipo))
  porId.clear()

  // ---- blocos: quebras (viram ar) e colocações (viram bloco), contadas pra IA mais perto
  const quebras = {}, colocadas = {}
  const estadoAnt = new Map()  // "x,y,z" -> {ar, nome} do último registro desse bloco
  const recente = new Map()    // "x,y,z,estado" -> t da última vez que contou (repetidos em < 0,5 s)
  for (const b of blocos) {
    const chave = `${b.x},${b.y},${b.z}`
    const ar = b.b === 'air' || b.b === 'cave_air' || b.s === 0
    const antes = estadoAnt.get(chave)
    estadoAnt.set(chave, { ar, nome: b.b })
    const kk = chave + ',' + b.s
    const lt = recente.get(kk)
    if (lt !== undefined && b.t - lt < 0.5) continue
    let melhor = null, dm = Infinity
    for (const nome of nomesIA) {
      const ia = S.ias[nome]
      if (emMorte(ia, b.t)) continue
      const p = posIA(ia, b.t)
      const d = Math.hypot(p.x - (b.x + 0.5), p.y + 1.62 - (b.y + 0.5), p.z - (b.z + 0.5))
      if (d < dm) { dm = d; melhor = nome }
    }
    if (!melhor) continue
    if (ar) {
      // quebra: o bloco antes era bloco (ar->ar e água/lava que escorre não contam)
      if (antes && antes.ar) continue
      if (antes && /water|lava/.test(antes.nome ?? '')) continue
      if (dm > ALCANCE_QUEBRA) continue
      ;(quebras[melhor] ??= []).push(b.t)
      recente.set(kk, b.t)
    } else {
      // colocação: antes era ar (ou não se sabe) e não é líquido
      if (antes && !antes.ar) continue
      if (/water|lava/.test(b.b ?? '')) continue
      if (dm > ALCANCE_COLOCAR) continue
      ;(colocadas[melhor] ??= []).push(b.t)
      recente.set(kk, b.t)
    }
  }
  estadoAnt.clear(); recente.clear()

  // ---- golpes da mineração: balança sem parar desde a quebra anterior (no máximo 1,2 s antes)
  for (const nome of nomesIA) {
    const g = []
    let anterior = -Infinity
    for (const tb of quebras[nome] ?? []) {
      for (let s = Math.max(anterior, tb - JANELA_QUEBRA); s < tb - 0.01; s += GOLPE_MINERANDO) g.push(s)
      g.push(tb)
      anterior = tb
    }
    for (const t of colocadas[nome] ?? []) g.push(t)
    S.ias[nome].golpes = g
  }

  // ---- ataque: da decisão 'atacar' até o próximo resultado 'atacar' (ou 15 s), um golpe a cada 0,6 s com mob perto
  const mobPerto = (nome, s) => {
    const ia = S.ias[nome]
    if (emMorte(ia, s)) return false
    const p = posIA(ia, s)
    for (const tr of S.mobs.values()) {
      const i = ultimo(tr.T, s)
      if (i < 0 || s - tr.T[i] >= 1) continue
      if (Math.hypot(tr.X[i] - p.x, tr.Y[i] - p.y, tr.Z[i] - p.z) <= ALCANCE_ATAQUE) return true
    }
    return false
  }
  for (let i = 0; i < evs.length; i++) {
    const e = evs[i]
    if (e.tipo !== 'decisao' || e.acao !== 'atacar' || !S.ias[e.quem]) continue
    let fim = e.t + DURACAO_ATAQUE
    for (let j = i + 1; j < evs.length && evs[j].t <= fim; j++) {
      if (evs[j].tipo === 'resultado' && evs[j].acao === 'atacar' && evs[j].quem === e.quem) { fim = evs[j].t; break }
    }
    const g = S.ias[e.quem].golpes
    for (let s = e.t; s <= fim; s += PASSO_ATAQUE) if (mobPerto(e.quem, s)) g.push(s)
  }
  for (const nome of nomesIA) S.ias[nome].golpes.sort((a, b) => a - b)

  if (process.env.DEBUG_ANIM) {
    const cont = nomesIA.map(n => `${n}: ${(quebras[n] ?? []).length} quebras, ${(colocadas[n] ?? []).length} colocadas, ${S.ias[n].golpes.length} golpes`)
    console.log('[anim]', S.mobs.size, 'mobs |', cont.join(' | '))
  }
}

// progresso do golpe em andamento (0..1) ou -1
function progressoGolpe(golpes, t) {
  const i = ultimo(golpes, t)
  if (i < 0) return -1
  const dt = t - golpes[i]
  return dt < GOLPE ? dt / GOLPE : -1
}

// dano: 1 no instante da pancada, cai a 0 em 0,35 s
function intensidadeDano(danos, t) {
  const i = ultimo(danos, t)
  if (i < 0) return 0
  const dt = t - danos[i]
  return dt < DANO_DUR ? 1 - dt / DANO_DUR : 0
}

// morte: tombo de 0 a 1 nos primeiros 0,5 s depois da morte (depois o corpo some ou renasce)
function progressoMorte(mortes, t) {
  for (let i = mortes.length - 1; i >= 0; i--) {
    const m = mortes[i]
    if (t >= m.tm) return t - m.tm < MORTE_SEGURA ? Math.min(1, (t - m.tm) / MORTE_QUEDA) : 0
  }
  return 0
}

// corpo de jogador: fica onde morreu por 1 s; depois some até o renascimento (devolve null)
export function ajustarJogador(nome, t, p) {
  const ia = S?.ias[nome]
  if (!ia || !p) return p
  for (const m of ia.mortes) {
    if (t >= m.tm && t < m.tm + MORTE_SEGURA) {
      return m.pre ? { ...p, x: m.pre.x, y: m.pre.y, z: m.pre.z, yaw: m.pre.yaw, pitch: m.pre.pitch ?? p.pitch } : p
    }
    if (t >= m.tm + MORTE_SEGURA && t < m.respT) return null
  }
  return p
}

export function noQuadro(t) {
  const anim = {}
  if (!S) return { anim }
  for (const nome of Object.keys(S.ias)) {
    const ia = S.ias[nome]
    if (!ia.T.length) continue
    const base = posIA(ia, t)
    const p = ajustarJogador(nome, t, { ...base, pitch: lerp(ia.T, ia.PITCH, t) })
    if (!p) continue
    anim['p_' + nome] = {
      tipo: 'jogador', modelo: 'ia_' + nome,
      ls: FASE * lerp(ia.T, ia.D, t),
      la: lerp(ia.T, ia.LA, t),
      braco: progressoGolpe(ia.golpes, t),
      pitch: p.pitch,
      dano: intensidadeDano(ia.danos, t),
      morte: progressoMorte(ia.mortes, t),
    }
  }
  // mobs que existem agora: registro de até 1 s antes
  for (const [id, tr] of S.mobs) {
    const i = ultimo(tr.T, t)
    if (i < 0 || t - tr.T[i] >= 1) continue
    anim['m_' + id] = { tipo: 'mob', modelo: tr.tipo, ls: FASE * lerp(tr.T, tr.D, t), la: lerp(tr.T, tr.LA, t) }
  }
  return { anim }
}
