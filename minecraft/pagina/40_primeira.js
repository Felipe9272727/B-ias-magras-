// Primeira pessoa como no Minecraft (dados em extras/40_primeira.mjs + 10_anim + 20_itens): FOV 70, olhos a 1,62,
// balanço da câmera ao andar (GameRenderer.bobView), tremida de dano, e o braço direito (com a skin da IA) ou o item
// na mão desenhados por cima do mundo com a mesma conta do ItemInHandRenderer (renderPlayerArm / renderArmWithItem).
// Os números das transformações são os do jogo (pose em blocos, modelo em pixels/16).
(function () {
  const DEG = Math.PI / 180
  let S = null

  function iniciar () {
    const T = window.THREE
    const v = window.__v
    const cena = new T.Scene()
    cena.add(new T.AmbientLight(0xffffff, 1))
    const cam = new T.PerspectiveCamera(70, v.camera.aspect, 0.05, 10)  // a mão usa sempre FOV 70 no jogo
    S = { T, cena, cam, carregador: new T.TextureLoader(), tex: new Map(), modelos: new Map(), atual: null, base: null, aplicado: null }
    // as skins já carregando desde o primeiro quadro (senão o braço só aparece depois de alguns quadros)
    for (const n of ['Claude', 'GPT', 'DeepSeek', 'Qwen', 'GLM', 'MiMo']) modelo('braco:' + n, () => modeloBraco(n))
    // depois de desenhar o mundo, desenha a mão por cima (limpa só a profundidade)
    window.__depois = r => {
      if (!S.atual) return
      const ac = r.autoClear
      r.autoClear = false
      r.clearDepth()
      r.render(S.cena, S.cam)
      r.autoClear = ac
    }
  }

  function textura (url, pronta) {
    let e = S.tex.get(url)
    if (!e) {
      e = { t: null, img: null, espera: [] }
      S.tex.set(url, e)
      S.carregador.load(url, t => {
        t.magFilter = S.T.NearestFilter; t.minFilter = S.T.NearestFilter; t.generateMipmaps = false; t.flipY = false
        t.needsUpdate = true
        e.t = t; e.img = t.image
        for (const f of e.espera) f(e)
        e.espera = []
      }, undefined, () => { e.falhou = true; console.error('[primeira] sem textura', url) })
    }
    if (e.t) pronta(e)
    else if (!e.falhou) e.espera.push(pronta)
  }

  // geometria a partir de quadriláteros: cada um com 4 cantos (x, y, z), retângulo de UV [u0, v0, u1, v1] e brilho
  function geo (quads, larg, alt) {
    const T = S.T
    const pos = [], uv = [], cor = []
    for (const q of quads) {
      const [a, b, c, d] = q.p
      const [u0, v0, u1, v1] = q.uv
      const uvs = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]
      for (const k of [0, 1, 2, 0, 2, 3]) {
        pos.push(...[a, b, c, d][k])
        uv.push(uvs[k][0] / larg, uvs[k][1] / alt)
        cor.push(q.luz, q.luz, q.luz)
      }
    }
    const g = new T.BufferGeometry()
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3))
    g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2))
    g.setAttribute('color', new T.Float32BufferAttribute(cor, 3))
    return g
  }

  // caixa do modelo (em pixels, y pra baixo como nos modelos do jogo) com o UV padrão de caixa a partir de (u, v)
  function caixa (x0, y0, z0, w, h, d, u, v) {
    const x1 = x0 + w, y1 = y0 + h, z1 = z0 + d
    const s = k => k / 16
    const P = (x, y, z) => [s(x), s(y), s(z)]
    return [
      // de cima (y menor) e de baixo
      { p: [P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1)], uv: [u + d, v, u + d + w, v + d], luz: 1.0 },
      { p: [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], uv: [u + d + w, v, u + d + w + w, v + d], luz: 0.5 },
      // lados: o topo da textura fica no ombro (y menor)
      { p: [P(x0, y0, z1), P(x0, y0, z0), P(x0, y1, z0), P(x0, y1, z1)], uv: [u, v + d, u + d, v + d + h], luz: 0.6 },
      { p: [P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0)], uv: [u + d, v + d, u + d + w, v + d + h], luz: 0.8 },
      { p: [P(x1, y0, z0), P(x1, y0, z1), P(x1, y1, z1), P(x1, y1, z0)], uv: [u + d + w, v + d, u + d + w + d, v + d + h], luz: 0.6 },
      { p: [P(x1, y0, z1), P(x0, y0, z1), P(x0, y1, z1), P(x1, y1, z1)], uv: [u + d + w + d, v + d, u + d + w + d + w, v + d + h], luz: 0.8 },
    ]
  }

  // braço direito do jogador: ModelPart com pivô (-5, 2, 0) e caixa (-3, -2, -2) 4x12x4, textura em (40, 16);
  // a manga (camada de cima, em 40, 32) um pouco maior
  function modeloBraco (nome) {
    const T = S.T
    const grupo = new T.Group()
    grupo.matrixAutoUpdate = false
    textura(`/textures/1.16.4/entity/ia_${nome}.png`, e => {
      const manga = caixa(-3, -2, -2, 4, 12, 4, 40, 32)              // UV da camada de cima (caixa 4x12x4)
      const mangaP = caixa(-3.25, -2.25, -2.25, 4.5, 12.5, 4.5, 0, 0)  // mas 0,25 px maior em volta
      for (const q of [caixa(-3, -2, -2, 4, 12, 4, 40, 16), manga.map((f, i) => ({ ...f, p: mangaP[i].p }))]) {
        const m = new T.Mesh(geo(q, 64, 64), new T.MeshBasicMaterial({ map: e.t, vertexColors: true, alphaTest: 0.5, side: T.DoubleSide }))
        m.position.set(-5 / 16, 2 / 16, 0)
        grupo.add(m)
      }
    })
    return grupo
  }

  // item "gerado" (ferramentas, gravetos...): cada pixel opaco vira um cubinho de 1 px de grossura, como o jogo extruda
  function modeloItem (nome) {
    const T = S.T
    const grupo = new T.Group()
    grupo.matrixAutoUpdate = false
    textura(`/tex/item/${nome}.png`, e => {
      const c = document.createElement('canvas')
      c.width = c.height = 16
      const g = c.getContext('2d')
      g.drawImage(e.img, 0, 0, 16, 16)
      const px = g.getImageData(0, 0, 16, 16).data
      const opaco = (x, y) => x >= 0 && y >= 0 && x < 16 && y < 16 && px[(y * 16 + x) * 4 + 3] > 127
      const quads = []
      const z0 = 7.5 / 16, z1 = 8.5 / 16
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
        if (!opaco(x, y)) continue
        const X0 = x / 16, X1 = (x + 1) / 16, Y1 = 1 - y / 16, Y0 = 1 - (y + 1) / 16
        const uv = [x + 0.25, y + 0.25, x + 0.75, y + 0.75]  // o centro do pixel: a face inteira com a cor dele
        quads.push({ p: [[X0, Y1, z1], [X1, Y1, z1], [X1, Y0, z1], [X0, Y0, z1]], uv, luz: 1.0 })
        quads.push({ p: [[X1, Y1, z0], [X0, Y1, z0], [X0, Y0, z0], [X1, Y0, z0]], uv, luz: 0.7 })
        if (!opaco(x, y - 1)) quads.push({ p: [[X0, Y1, z0], [X1, Y1, z0], [X1, Y1, z1], [X0, Y1, z1]], uv, luz: 0.9 })
        if (!opaco(x, y + 1)) quads.push({ p: [[X0, Y0, z1], [X1, Y0, z1], [X1, Y0, z0], [X0, Y0, z0]], uv, luz: 0.5 })
        if (!opaco(x - 1, y)) quads.push({ p: [[X0, Y1, z0], [X0, Y1, z1], [X0, Y0, z1], [X0, Y0, z0]], uv, luz: 0.6 })
        if (!opaco(x + 1, y)) quads.push({ p: [[X1, Y1, z1], [X1, Y1, z0], [X1, Y0, z0], [X1, Y0, z1]], uv, luz: 0.6 })
      }
      grupo.add(new T.Mesh(geo(quads, 16, 16), new T.MeshBasicMaterial({ map: e.t, vertexColors: true, side: T.DoubleSide })))
    })
    return grupo
  }

  // bloco na mão: cubo 0..1 com as texturas do lado, de cima e de baixo
  function modeloBloco (nome) {
    const T = S.T
    const grupo = new T.Group()
    grupo.matrixAutoUpdate = false
    const face = (sufixos, luz) => {
      const m = new T.MeshBasicMaterial({ color: new T.Color(luz, luz, luz), alphaTest: 0.5, visible: false })
      const tentar = i => {
        if (i >= sufixos.length) return
        S.carregador.load(`/tex/block/${nome}${sufixos[i]}.png`, t => {
          t.magFilter = T.NearestFilter; t.minFilter = T.NearestFilter; t.generateMipmaps = false
          m.map = t; m.visible = true; m.needsUpdate = true
        }, undefined, () => tentar(i + 1))
      }
      tentar(0)
      return m
    }
    const lado = face(['', '_side', '_front'], 0.8), lado2 = face(['', '_side', '_front'], 0.6)
    const mats = [lado2, lado2, face(['_top', '', '_side'], 1.0), face(['_bottom', '', '_side'], 0.5), lado, lado]
    const m = new T.Mesh(new T.BoxGeometry(1, 1, 1), mats)
    m.position.set(0.5, 0.5, 0.5)
    grupo.add(m)
    return grupo
  }

  function modelo (chave, fazer) {
    if (!S.modelos.has(chave)) { const g = fazer(); S.modelos.set(chave, g); S.cena.add(g) }
    return S.modelos.get(chave)
  }

  const M = () => new S.T.Matrix4()
  const Tr = (x, y, z) => M().makeTranslation(x, y, z)
  const Rx = a => M().makeRotationX(a * DEG), Ry = a => M().makeRotationY(a * DEG), Rz = a => M().makeRotationZ(a * DEG)
  const mul = (...ms) => ms.reduce((a, b) => a.multiply(b), M())

  window.__extras.push(extra => {
    if (!window.THREE || !window.__v || !extra) return
    if (!S) iniciar()
    const v = window.__v, cam = v.camera
    const T = S.T
    // FOV 70 como o "Normal" do jogo, em qualquer câmera
    if (cam.fov !== 70) { cam.fov = 70; cam.updateProjectionMatrix() }
    S.cam.aspect = cam.aspect; S.cam.updateProjectionMatrix()
    for (const g of S.modelos.values()) g.visible = false
    const pr = extra.primeira
    if (!pr) { S.atual = null; return }
    if (!S.preparado) {
      // itens do trecho: modelos prontos desde o começo (os dois jeitos; no quadro usa o certo)
      S.preparado = true
      for (const it of pr.itens ?? []) {
        modelo('item:' + it, () => modeloItem(it))
        modelo('bloco:' + it, () => modeloBloco(it))
      }
      for (const g of S.modelos.values()) g.visible = false
    }
    const a = extra.anim?.[pr.id] ?? { ls: 0, la: 0, braco: -1, dano: 0, morte: 0 }

    // a câmera chega aqui na posição dos olhos (1,6): volta pro que veio do replay se a gente já mexeu neste quadro
    if (S.aplicado && cam.position.equals(S.aplicado.p) && cam.quaternion.equals(S.aplicado.q)) {
      cam.position.copy(S.base.p); cam.quaternion.copy(S.base.q)
    }
    S.base = { p: cam.position.clone(), q: cam.quaternion.clone() }

    // view bobbing (GameRenderer.bobView): walkDist = 0,6 por bloco; bob até 0,1 andando
    const g = -(0.6 * a.ls / 4)
    const h = 0.1 * Math.min(1, (a.la || 0) / 0.8)
    const bob = mul(Tr(Math.sin(g * Math.PI) * h * 0.5, -Math.abs(Math.cos(g * Math.PI) * h), 0),
      Rz(Math.sin(g * Math.PI) * h * 3), Rx(Math.abs(Math.cos(g * Math.PI - 0.2) * h) * 5))
    // dano (bobHurt): inclina de lado e volta; morte: cai até perto do chão, inclinando
    const d = a.dano || 0, mo = a.morte || 0
    const hurt = mul(Rz(-Math.sin(Math.pow(d, 4) * Math.PI) * 14 + mo * 3.6))
    const vista = mul(hurt, bob)
    // a câmera: olhos a 1,62 (o viewer põe 1,6) e, morrendo, desce pros 0,2 do corpo caído
    const mw = M().compose(cam.position.clone().add(new T.Vector3(0, 0.02 - 1.42 * mo, 0)), cam.quaternion, new T.Vector3(1, 1, 1))
    mw.multiply(vista.clone().invert())
    mw.decompose(cam.position, cam.quaternion, new T.Vector3())
    cam.updateMatrixWorld(true)
    S.aplicado = { p: cam.position.clone(), q: cam.quaternion.clone() }

    if (mo >= 1) { S.atual = null; return }  // morto: sem mão
    const sw = a.braco >= 0 ? a.braco : 0
    const item = extra.maos?.[pr.id]
    let m, mat
    if (!item) {
      // renderPlayerArm (mão direita, f = 1)
      const gs = Math.sqrt(sw)
      const hh = -0.3 * Math.sin(gs * Math.PI), i = 0.4 * Math.sin(gs * Math.PI * 2), j = -0.4 * Math.sin(sw * Math.PI)
      const k = Math.sin(sw * sw * Math.PI), l = Math.sin(gs * Math.PI)
      mat = mul(vista, Tr(hh + 0.64, i - 0.6, j - 0.72), Ry(45), Ry(l * 70), Rz(k * -20),
        Tr(-1, 3.6, 3.5), Rz(120), Rx(200), Ry(-135), Tr(5.6, 0, 0))
      m = modelo('braco:' + pr.nome, () => modeloBraco(pr.nome))
    } else {
      // renderArmWithItem: balanço do golpe + applyItemArmTransform + applyItemArmAttackTransform + display firstperson_righthand
      const gs = Math.sqrt(sw)
      const k = -0.4 * Math.sin(gs * Math.PI), l = 0.2 * Math.sin(gs * Math.PI * 2), mm = -0.2 * Math.sin(sw * Math.PI)
      const g2 = Math.sin(sw * sw * Math.PI), h2 = Math.sin(gs * Math.PI)
      const braco = mul(vista, Tr(k, l, mm), Tr(0.56, -0.52, -0.72), Ry(45 + g2 * -20), Rz(h2 * -20), Rx(h2 * -80), Ry(-45))
      const bloco = !!extra.maoBloco?.[pr.id]
      const disp = bloco
        ? mul(Tr(0, 0, 0), M().makeRotationFromEuler(new T.Euler(0, 45 * DEG, 0, 'XYZ')), M().makeScale(0.4, 0.4, 0.4))
        : mul(Tr(1.13 / 16, 3.2 / 16, 1.13 / 16), M().makeRotationFromEuler(new T.Euler(0, -90 * DEG, 25 * DEG, 'XYZ')), M().makeScale(0.68, 0.68, 0.68))
      mat = mul(braco, disp, Tr(-0.5, -0.5, -0.5))
      m = bloco ? modelo('bloco:' + item, () => modeloBloco(item)) : modelo('item:' + item, () => modeloItem(item))
    }
    m.matrix.copy(mat)
    m.matrixWorldNeedsUpdate = true
    m.visible = true
    S.atual = m
  })
})()
