import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { trajetoriasGravadas } from './trajetoria.mjs'
import { jogadorVisivelEm } from './reencena_dados.mjs'

test('regravação mantém amostras, não atravessa o mapa num teleporte e segura o último registro', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-traj-'))
  try {
    const p = (t, x) => ({t, n: 'Qwen', x, y: 48, z: 2, yaw: 0, pitch: 0})
    fs.writeFileSync(path.join(dir, 'posicoes_Qwen.jsonl'), [p(0, 0), p(0.25, 1), p(0.5, 30)].map(x => JSON.stringify(x)).join('\n'))
    const tr = trajetoriasGravadas(dir, ['Qwen'], 0, 1).Qwen
    assert.equal(tr[5].x, 1)
    assert.equal(tr[8].x, 1)
    assert.equal(tr[10].x, 30)
    assert.equal(tr.at(-1).x, 30)
    assert.ok(tr.every(p => p.y === 48))
  } finally { fs.rmSync(dir, {recursive: true, force: true}) }
})

test('personagens só aparecem após entrar e permanecem ausentes após eliminação', () => {
  const pos = {Claude: [{t: 9.7}]}, eventos = [{tipo: 'eliminado', quem: 'Claude', t: 10855.16}]
  assert.equal(jogadorVisivelEm(pos, eventos, 'Claude', 2), false)
  assert.equal(jogadorVisivelEm(pos, eventos, 'Claude', 10), true)
  assert.equal(jogadorVisivelEm(pos, eventos, 'Claude', 10856), false)
})
