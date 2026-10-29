// Itens do replay: o item na mão (braço direito) e os itens caídos no chão. Os dados vêm de extras/20_itens.mjs.
// Roda em todo quadro; o three.js só é pego na primeira chamada (window.THREE carrega depois deste script).
window.__extras.push(extra => {
  const T = window.THREE, v = window.__v
  if (!T || !v || !extra) return
  if (!window.__itens) {
    const carregador = new T.TextureLoader()
    window.__itens = {
      carregador,
      texturas: new Map(),   // caminhos -> {tex, falhou, espera}
      materiais: new Map(),  // nome -> material(is)
      mao: new Map(),        // IA -> {sk, peca, chave}
      chao: new Map(),       // id -> mesh
      geo: new Map()         // tamanho -> geometria
    }
  }
  const S = window.__itens

  // carrega uma textura (tenta as URLs em ordem) e aplica quando chegar; sem textura, não aplica
  function texPara (urls, aplicar) {
    const chave = urls.join('|')
    let e = S.texturas.get(chave)
    if (!e) {
      e = { tex: null, falhou: false, espera: [] }
      S.texturas.set(chave, e)
      const tentar = i => {
        if (i >= urls.length) { e.falhou = true; e.espera = []; return }
        S.carregador.load(urls[i], tex => {
          tex.magFilter = T.NearestFilter
          tex.minFilter = T.NearestFilter
          tex.generateMipmaps = false
          e.tex = tex
          for (const f of e.espera) f(tex)
          e.espera = []
        }, undefined, () => tentar(i + 1))
      }
      tentar(0)
    }
    if (e.tex) aplicar(e.tex)
    else if (!e.falhou) e.espera.push(aplicar)
  }

  // material de item (plano com a textura, recorta o fundo); fica invisível até a textura chegar
  function matItem (nome) {
    const chave = 'item:' + nome
    if (!S.materiais.has(chave)) {
      const m = new T.MeshLambertMaterial({ alphaTest: 0.5, side: T.DoubleSide })
      m.visible = false
      S.materiais.set(chave, m)
    }
    return S.materiais.get(chave)
  }

  // materiais de bloco: lados, topo e base (cada um com a textura _top/_bottom se houver, senão a do lado)
  function matBloco (nome) {
    const chave = 'bloco:' + nome
    if (!S.materiais.has(chave)) {
      const face = sufixo => {
        const m = new T.MeshLambertMaterial({ alphaTest: 0.5, color: 0x888888 })
        const urls = sufixo ? ['/tex/block/' + nome + sufixo + '.png', '/tex/block/' + nome + '.png'] : ['/tex/block/' + nome + '.png']
        texPara(urls, tex => { m.map = tex; m.color.set(0xffffff); m.needsUpdate = true })
        return m
      }
      const lado = face('')
      S.materiais.set(chave, [lado, lado, face('_top'), face('_bottom'), lado, lado])
    }
    return S.materiais.get(chave)
  }

  // geometria (quadrado ou cubo) de um tamanho, compartilhada entre os itens
  function geometria (tipo, tam) {
    const chave = tipo + tam
    if (!S.geo.has(chave)) S.geo.set(chave, tipo === 'plano' ? new T.PlaneGeometry(tam, tam) : new T.BoxGeometry(tam, tam, tam))
    return S.geo.get(chave)
  }

  // ---- item na mão: preso ao osso do braço direito. Os ossos foram montados com o pivô absoluto, então o
  // item vai na pose do osso no bind (boneInverses), como a pele: item.matrix = boneInverse × bindMatrix × ponto.
  // Pontos em pixels do modelo (1 bloco = 16 px); o osso já leva a escala 1/16.
  const MAO = { x: -6, y: 14, z: -2.5 }  // centro da peça na mão (o pivô do item é em -6, 15, 1)
  const ROT = { x: -0.5, y: 0, z: 0 }     // inclinada pra frente, como em 3ª pessoa

  for (const [chaveIA, nomeItem] of Object.entries(extra.maos ?? {})) {
    const n = chaveIA.slice(2)  // tira o "p_"
    const obj = v.entities.entities[chaveIA]
    const ossos = window.__ossos?.['ia_' + n]
    const sk = obj && ossos ? obj.children.find(c => c.isSkinnedMesh && c.skeleton.bones.length === Object.keys(ossos).length) : null
    let st = S.mao.get(n)
    if (st && st.sk !== sk) { st.peca?.parent?.remove(st.peca); S.mao.delete(n); st = null }
    const mao = nomeItem
    if (!sk || !mao) { if (st?.peca) { st.peca.parent?.remove(st.peca); st.peca = null; st.chave = null } continue }
    const bloco = !!extra.maoBloco?.[chaveIA]
    const chave = mao + (bloco ? ':b' : ':i')
    if (!st) { st = { sk, peca: null, chave: null }; S.mao.set(n, st) }
    if (st.chave !== chave) {
      if (st.peca) st.peca.parent?.remove(st.peca)
      const peca = bloco ? new T.Mesh(geometria('cubo', 4), matBloco(mao)) : new T.Mesh(geometria('plano', 9.6), matItem(mao))
      peca.matrixAutoUpdate = false
      // pose na mão: matriz do modelo (px) -> espaço local do osso
      const osso = sk.skeleton.bones[ossos.rightArm]
      const P = new T.Matrix4().compose(
        new T.Vector3(MAO.x, MAO.y, MAO.z),
        new T.Quaternion().setFromEuler(new T.Euler(ROT.x, ROT.y, ROT.z)),
        new T.Vector3(1, 1, 1))
      peca.matrix.multiplyMatrices(sk.skeleton.boneInverses[ossos.rightArm], sk.bindMatrix).multiply(P)
      osso.add(peca)
      st.peca = peca
      st.chave = chave
    }
  }

  if (!S.dbgN) S.dbgN = 0
  if (S.mao.size && ++S.dbgN === 12) { for (const [n2, st2] of S.mao) if (st2.peca) { const p2 = new T.Vector3(); st2.peca.getWorldPosition(p2); console.log('[itemDBG]', n2, st2.chave, 'mundo', p2.x.toFixed(2), p2.y.toFixed(2), p2.z.toFixed(2), 'vis', st2.peca.visible, 'matvis', st2.peca.material.visible, 'map', !!st2.peca.material.map, 'escala', st2.peca.matrixWorld.elements[0].toFixed(3), 'ent', v.entities.entities['p_'+n2] && v.entities.entities['p_'+n2].position.x.toFixed(2)) } }
  // ---- itens do chão: girando devagar e subindo/descendo de leve, tudo calculado pelo id e pela idade
  const vivos = new Set()
  for (const it of extra.chao ?? []) {
    vivos.add(it.id)
    const fase = ((it.id * 97) % 628) / 100
    let mesh = S.chao.get(it.id)
    if (!mesh) {
      mesh = it.bloco ? new T.Mesh(geometria('cubo', 0.25), matBloco(it.nome)) : new T.Mesh(geometria('plano', 0.25), matItem(it.nome))
      S.chao.set(it.id, mesh)
      v.scene.add(mesh)
    }
    const pop = Math.min(1, 0.4 + it.idade * 2)  // cresce ao aparecer
    mesh.position.set(it.x, it.y + 0.125 + 0.05 * Math.sin(it.idade * 2.5 + fase), it.z)
    mesh.rotation.y = it.idade * 1.6 + fase
    mesh.scale.setScalar(pop)
  }
  for (const [id, mesh] of S.chao) {
    if (vivos.has(id)) continue
    v.scene.remove(mesh)
    S.chao.delete(id)
  }
})
