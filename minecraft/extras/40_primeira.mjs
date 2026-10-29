// Primeira pessoa igual à do Minecraft (câmera "olhos:<Nome>"): diz à página quem é o jogador da câmera e quais itens
// ele segura no trecho (pra página já deixar os modelos prontos). A página (pagina/40_primeira.js) desenha o braço ou
// o item na mão, balança a câmera ao andar (view bobbing) e inclina com dano e morte, usando os dados de 10_anim
// (passada, golpe, dano, morte) e 20_itens (item na mão).
let ITENS = []

export function preparar ({ posicoes, t0, t1 }) {
  const s = new Set()
  for (const lista of Object.values(posicoes)) for (const p of lista) if (p.t >= t0 - 1 && p.t <= t1 && p.mao) s.add(p.mao)
  ITENS = [...s]
}

export function noQuadro (t, ctx) {
  return { primeira: ctx.modo === 'olhos' ? { id: 'p_' + ctx.seguido, nome: ctx.seguido, itens: ITENS } : null }
}
