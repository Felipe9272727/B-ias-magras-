// Gerador pseudoaleatório com semente (mulberry32). As 3 IAs jogam com a MESMA semente; cada sistema do jogo pede
// a sua própria sequência (rng('casa'), rng('eventos'), ...) para que uma decisão diferente de uma IA não embaralhe
// os sorteios dos outros sistemas.
export function criarRng(semente, canal = '') {
  let h = 2166136261 >>> 0
  for (const ch of `${semente}:${canal}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0
  let a = h || 1
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  r.int = (min, max) => min + Math.floor(r() * (max - min + 1)) // inteiro em [min, max]
  r.chance = (p) => r() < p
  r.escolher = (arr) => arr[Math.floor(r() * arr.length)]
  r.embaralhar = (arr) => { const b = [...arr]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }
  r.ponderado = (pares) => { const tot = pares.reduce((s, [, p]) => s + p, 0); let x = r() * tot; for (const [v, p] of pares) { if ((x -= p) < 0) return v } return pares[pares.length - 1][0] }
  return r
}
