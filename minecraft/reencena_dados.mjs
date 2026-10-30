import fs from 'node:fs'
import path from 'node:path'

// O maestro grava eventos.jsonl; cada IA grava eventos_<nome>.jsonl.
export function arquivosDoLog (dir, prefixo) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.jsonl') && (f === `${prefixo}.jsonl` || f.startsWith(`${prefixo}_`)))
    .sort().map(f => path.join(dir, f))
}

export function cameraDaCena (texto) {
  const i = texto.indexOf(':')
  const modo = texto.slice(0, i), valor = texto.slice(i + 1)
  if (i < 1 || !valor) throw new Error(`Câmera inválida: ${texto}`)
  if (modo === 'fixa') {
    const p = valor.split(',').map(Number)
    if (p.length !== 5 || !p.every(Number.isFinite)) throw new Error(`Coordenadas inválidas: ${texto}`)
    const [x, y, z, yaw, pitch] = p
    return { modo, alvo: null, posicao: { x, y, z, yaw, pitch } }
  }
  if (!['olhos', 'segue', 'orbita'].includes(modo)) throw new Error(`Modo de câmera inválido: ${modo}`)
  return { modo, alvo: valor, posicao: null }
}

export function diametroDaZona (eventos, t) {
  const zonas = eventos.filter(e => e.tipo === 'zona' && e.t <= t)
  const zona = zonas.at(-1)
  if (!zona) return 59999968
  const k = Math.max(0, Math.min(1, (t - zona.t) / Math.max(0.001, zona.segundos)))
  return +(2 * (zona.de + (zona.ate - zona.de) * k)).toFixed(4)
}

export function mortesDaCena (eventos, nomes, ini, fim) {
  return eventos.filter(e => e.tipo === 'morte' && e.t >= ini && e.t <= fim && nomes.includes(e.quem))
    .map(e => ({ ...e, feito: false, camera: false }))
}

export function jogadorVisivelEm (posicoes, eventos, nome, t) {
  return !!posicoes[nome]?.length && posicoes[nome][0].t <= t &&
    !eventos.some(e => e.tipo === 'eliminado' && e.quem === nome && e.t + 0.6 <= t)
}
