// Animação dos bonecos (dados em extras/10_anim.mjs): passada, golpes, dano e morte, como o ModelBiped do Minecraft.
// O viewer monta cada osso com a origem no pivô (absoluto) somado com o do pai, então rotacionar o osso direto gira
// em torno do ponto errado. Aqui a rotação é feita em torno do pivô certo: no espaço do modelo D = T(P)·R·T(-P),
// convertida pro osso local (Wpai⁻¹ · D · Wpai · L0), onde L0 é a posição de repouso do osso.
(function () {
  const PI = Math.PI
  // sinais (testados nos quadros): FRENTE = +1 quando um x positivo leva o membro pra frente (o modelo olha pra -z)
  const FRENTE = 1
  const SINAL_CABECA = 1     // pitch positivo (olhar pra cima, como o mineflayer) levanta o rosto
  const SINAL_MORTE = 1      // tombo: gira a entidade em z
  const estados = new WeakMap()
  // mobs com o mesmo esqueleto de ossos
  const FAMILIA = {
    zumbi: ['zombie', 'husk', 'drowned', 'zombified_piglin', 'zombie_villager'],
    esqueleto: ['skeleton', 'stray', 'wither_skeleton'],
    aranha: ['spider', 'cave_spider'],
  }

  // guarda a posição de repouso de cada osso (uma vez por malha)
  function estadoDe(sm) {
    let st = estados.get(sm)
    if (st) return st
    const T = window.THREE
    const bones = sm.skeleton.bones
    const idx = new Map(bones.map((b, i) => [b, i]))
    const L0 = bones.map(b => new T.Matrix4().compose(b.position.clone(), b.quaternion.clone(), b.scale.clone()))
    const pai = bones.map(b => (idx.has(b.parent) ? idx.get(b.parent) : -1))
    const W = []
    const mundo = i => {
      if (!W[i]) W[i] = pai[i] >= 0 ? mundo(pai[i]).clone().multiply(L0[i]) : L0[i].clone()
      return W[i]
    }
    bones.forEach((_, i) => mundo(i))
    st = {
      bones, L0, W, pai,
      pivo: bones.map(b => b.position.clone()),   // o viewer guarda o pivô absoluto em position
      mat: sm.material,
      cor: sm.material.color.clone(),
    }
    estados.set(sm, st)
    return st
  }

  // gira o osso i em torno do pivô dele; rot é a rotação no espaço do modelo
  function girar(st, i, rot) {
    const T = window.THREE
    const P = st.pivo[i]
    const D = new T.Matrix4().makeTranslation(P.x, P.y, P.z).multiply(rot).multiply(new T.Matrix4().makeTranslation(-P.x, -P.y, -P.z))
    let C = D
    if (st.pai[i] >= 0) {
      const Wp = st.W[st.pai[i]]
      C = Wp.clone().invert().multiply(D).multiply(Wp)
    }
    const local = C.multiply(st.L0[i])
    local.decompose(st.bones[i].position, st.bones[i].quaternion, st.bones[i].scale)
  }

  function rotacao(x, y, z) {
    const T = window.THREE
    return new T.Matrix4().makeRotationFromEuler(new T.Euler(x || 0, y || 0, z || 0))
  }

  // jogador (ia_<Nome>): pernas e braços balançando, golpe do braço direito, cabeça com o pitch
  function poseJogador(set, a) {
    const c = Math.cos(a.ls * 0.6662)
    const golpe = a.braco >= 0 ? Math.sin(a.braco * PI) * 1.5 : 0
    set('rightLeg', c * 1.4 * a.la)
    set('leftLeg', -c * 1.4 * a.la)
    // o braço do golpe é o direito do personagem: no modelo, o osso 'leftArm' (x positivo; a frente é -z)
    set('leftArm', c * a.la + FRENTE * golpe)
    set('rightArm', -c * a.la)
    set('head', SINAL_CABECA * (a.pitch || 0))
  }

  // bípede (zumbi e esqueleto): pernas andando; zumbi com os braços esticados, esqueleto com o arco
  function poseBipede(set, a, braços) {
    const c = Math.cos(a.ls * 0.6662)
    set('rightLeg', c * 1.4 * a.la)
    set('leftLeg', -c * 1.4 * a.la)
    set('rightArm', braços)
    set('leftArm', braços)
  }

  // creeper (4 patas) e aranha (8 patas)
  function poseCreeper(set, a) {
    const c = Math.cos(a.ls * 0.6662)
    set('leg0', c * 1.4 * a.la)
    set('leg3', c * 1.4 * a.la)
    set('leg1', -c * 1.4 * a.la)
    set('leg2', -c * 1.4 * a.la)
  }
  function poseAranha(set, a) {
    for (let i = 0; i < 8; i++) {
      const lado = i % 2 === 0 ? -1 : 1   // pares de pernas de cada lado
      const fase = [0, 3, 4, 7].includes(i) ? 0 : PI
      set('leg' + i, 0, 0, lado * 0.25 * a.la * Math.cos(a.ls * 0.6662 * 2 + fase) + lado * 0.1)
    }
  }

  // cor de dano/morte: o modelo fica mais vermelho (a cor original × (1, 1-0,6k, 1-0,6k))
  function tingir(st, k) {
    st.mat.color.setRGB(st.cor.r, st.cor.g * (1 - 0.6 * k), st.cor.b * (1 - 0.6 * k))
  }

  window.__extras.push(extra => {
    const anim = extra && extra.anim
    if (!anim) return
    for (const id of Object.keys(anim)) {
      const a = anim[id]
      const ent = window.__v.entities.entities[id]
      if (!ent) continue
      try {
        let sm = null
        ent.traverse(o => { if (!sm && o.isSkinnedMesh) sm = o })
        // zumbis usam o corpo de jogador (replay.mjs > ZUMBIS): ossos do 'mc_<tipo>'
        const o = window.__ossos['mc_' + a.modelo] || window.__ossos[a.modelo]
        if (!sm || !o) continue
        const st = estadoDe(sm)
        const set = (nome, x, y, z) => { if (o[nome] !== undefined) girar(st, o[nome], rotacao(x, y, z)) }
        if (a.tipo === 'jogador') poseJogador(set, a)
        else if (FAMILIA.zumbi.includes(a.modelo)) poseBipede(set, a, FRENTE * PI / 2)   // braços esticados pra frente
        else if (FAMILIA.esqueleto.includes(a.modelo)) poseBipede(set, a, FRENTE * 1.0) // arco levemente pra frente
        else if (a.modelo === 'creeper') poseCreeper(set, a)
        else if (FAMILIA.aranha.includes(a.modelo)) poseAranha(set, a)
        if (a.tipo === 'jogador' || a.modelo === 'creeper' || FAMILIA.zumbi.includes(a.modelo) || FAMILIA.esqueleto.includes(a.modelo) || FAMILIA.aranha.includes(a.modelo)) {
          tingir(st, Math.max(a.dano || 0, a.morte || 0))
        }
        ent.rotation.z = SINAL_MORTE * PI / 2 * (a.morte || 0)
      } catch (e) {
        console.error('[extra anim]', id, e && e.stack || e)
      }
    }
  })
})()
