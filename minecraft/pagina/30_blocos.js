// Blocos sendo minerados e colocados (dados em extras/30_blocos.mjs, campo "blocos" do quadro):
// rachadura (destroy_stage_0 a 9) no bloco que a IA mina, partículas quando ele quebra e um "pop" quando um bloco é colocado.
// As malhas são refeitas a cada quadro a partir dos dados do quadro: nada disso depende do quadro anterior.
window.__extras.push(extra => {
  const b = extra.blocos
  const T = window.THREE, cena = window.__v && window.__v.scene
  if (!b || !T || !cena) return
  const R = window.__blocos ??= criarRecursos(T)
  if (R.grupo.parent !== cena) cena.add(R.grupo)
  // o que o quadro anterior desenhou sai (as malhas são novas a cada quadro)
  R.grupo.clear()
  for (const m of R.descartar) m.dispose()
  R.descartar.length = 0

  // rachadura: uma caixa um tiquinho maior que o bloco, com a textura do estágio
  for (const c of b.rachaduras) {
    const mat = R.rachaduras[c.estagio]
    if (!mat.map.image) continue  // a textura ainda não chegou (só nos primeiros quadros)
    const m = new T.Mesh(R.caixa, mat)
    m.scale.setScalar(1.002)
    m.position.set(c.x + 0.5, c.y + 0.5, c.z + 0.5)
    R.grupo.add(m)
  }

  // partículas: 14 cubinhos saindo do centro do bloco, com gravidade. Tudo sai de (x, y, z, índice): mesmo resultado sempre
  for (const q of b.quebras) {
    const mat = materialDoBloco(R, q.bloco)
    for (let i = 0; i < 14; i++) {
      const r = k => ruido(q.x, q.y, q.z, i, k)
      const vida = 0.55 + 0.25 * r(7)
      const a = q.idade
      if (a >= vida) continue
      const tam = 0.08 + 0.04 * r(6)
      // velocidade (blocos/s) e posição: p = p0 + v·a + ½·g·a², com g = -14 em y
      const x = q.x + 0.5 + (r(0) - 0.5) * 0.4 + (r(3) - 0.5) * 4.5 * a
      const y = q.y + 0.5 + (r(1) - 0.5) * 0.4 + (1.5 + r(4) * 3.5) * a - 7 * a * a
      const z = q.z + 0.5 + (r(2) - 0.5) * 0.4 + (r(5) - 0.5) * 4.5 * a
      // some no fim da vida: encolhe nos últimos 40%
      const fim = 0.6 * vida
      const s = tam * (a < fim ? 1 : Math.max(0, 1 - (a - fim) / (0.4 * vida)))
      const m = new T.Mesh(R.caixa, mat)
      m.scale.setScalar(s)
      m.position.set(x, y, z)
      m.rotation.set(a * (r(4) - 0.5) * 16, a * (r(5) - 0.5) * 16, a * (r(1) - 0.5) * 16)
      R.grupo.add(m)
    }
  }

  // pop: o bloco colocado incha um pouco e some em 0,25 s (uma caixa por cima, com a textura do bloco)
  for (const c of b.colocados) {
    const k = c.idade / 0.25
    const tex = texturaDoBloco(R, c.bloco)
    const mat = new T.MeshBasicMaterial({
      map: tex, color: tex ? 0xffffff : corDoBloco(c.bloco), transparent: true, opacity: 0.75 * (1 - k),
      depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    })
    R.descartar.push(mat)
    const m = new T.Mesh(R.caixa, mat)
    m.scale.setScalar(1.02 + 0.12 * k)
    m.position.set(c.x + 0.5, c.y + 0.5, c.z + 0.5)
    R.grupo.add(m)
  }
})

// pseudo-aleatório determinístico (0 a 1) a partir do bloco, do índice da partícula e de um canal
function ruido(x, y, z, i, k) {
  let h = Math.imul(x, 0x9E3779B1) ^ Math.imul(y, 0x85EBCA77) ^ Math.imul(z, 0xC2B2AE3D) ^ Math.imul(i + 1, 0x27D4EB2F) ^ Math.imul(k + 1, 0x165667B1)
  h ^= h >>> 15; h = Math.imul(h, 0x2C1B3C6D); h ^= h >>> 12; h = Math.imul(h, 0x297A2D39); h ^= h >>> 15
  return (h >>> 0) / 4294967296
}

// textura do bloco (a face de lado); alguns nomes usam outro arquivo; sem arquivo, fica a cor de reserva
const EXCECOES = { grass_block: 'dirt', furnace: 'furnace_front', dirt_path: 'dirt_path_top' }
const CORES = [
  [/leaves/, '#4a7d3a'], [/log|wood|planks|stem|door|table|bookshelf/, '#8a6a40'], [/grass|dirt|mud|path|farmland/, '#7a5636'],
  [/sand/, '#d9cc92'], [/gravel/, '#8c8783'], [/glass/, '#bcdde8'], [/ore|amethyst|redstone/, '#8d8d8d'],
  [/./, '#7a7a7a'],
]
function corDoBloco(nome) {
  return (CORES.find(([re]) => re.test(nome))[1])
}
function texturaDoBloco(R, nome) {
  let t = R.texturas.get(nome)
  if (!t) {
    t = R.carregador.load(`/tex/block/${EXCECOES[nome] ?? nome}.png`)
    t.magFilter = t.minFilter = R.T.NearestFilter
    t.generateMipmaps = false
    R.texturas.set(nome, t)
  }
  return t.image ? t : null
}
// material do bloco (com a textura quando ela já chegou, senão a cor); compartilhado entre as partículas
function materialDoBloco(R, nome) {
  const tex = texturaDoBloco(R, nome)
  const chave = tex ? 'tex:' + nome : 'cor:' + nome
  // alphaTest: folhas e vidro têm pixels transparentes que não podem sair como quadrados
  if (!R.materiais.has(chave)) R.materiais.set(chave, new R.T.MeshBasicMaterial(tex ? { map: tex, alphaTest: 0.5 } : { color: corDoBloco(nome) }))
  return R.materiais.get(chave)
}

function criarRecursos(T) {
  const R = {
    T,
    grupo: new T.Group(),
    caixa: new T.BoxGeometry(1, 1, 1),
    carregador: new T.TextureLoader(),
    texturas: new Map(),
    materiais: new Map(),
    descartar: [],   // materiais de uso de um quadro (o pop): saem no quadro seguinte
    rachaduras: [],
  }
  // as 10 texturas de rachadura: pixelizadas, transparentes, sem brigar com a face do bloco
  for (let i = 0; i < 10; i++) {
    const tx = R.carregador.load(`/tex/block/destroy_stage_${i}.png`)
    tx.magFilter = tx.minFilter = T.NearestFilter
    tx.generateMipmaps = false
    R.rachaduras.push(new T.MeshBasicMaterial({
      map: tx, transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    }))
  }
  return R
}
