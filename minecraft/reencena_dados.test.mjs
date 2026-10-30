import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { arquivosDoLog, cameraDaCena, diametroDaZona, mortesDaCena } from './reencena_dados.mjs'

test('inclui o log do maestro junto dos logs individuais', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reenc-log-'))
  try {
    for (const f of ['eventos.jsonl', 'eventos_Claude.jsonl', 'posicoes_Claude.jsonl', 'eventos.jsonl.bak']) fs.writeFileSync(path.join(dir, f), '')
    assert.deepEqual(arquivosDoLog(dir, 'eventos').map(f => path.basename(f)), ['eventos.jsonl', 'eventos_Claude.jsonl'])
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})

test('a cena de teleporte usa coordenadas, sem procurar uma IA com nome de coordenadas', () => {
  assert.deepEqual(cameraDaCena('fixa:0.5,166,26,0,-0.3'), { modo: 'fixa', alvo: null, posicao: { x: 0.5, y: 166, z: 26, yaw: 0, pitch: -0.3 } })
  assert.equal(cameraDaCena('olhos:GLM').alvo, 'GLM')
  assert.throws(() => cameraDaCena('fixa:0,erro,0,0,0'))
})

test('uma cena anterior à arena remove a borda do backup final; o fechamento acompanha o tempo do log', () => {
  const e = [{ tipo: 'zona', t: 11190.94, de: 160, ate: 15, segundos: 480 }]
  assert.equal(diametroDaZona(e, 60), 59999968)
  assert.equal(diametroDaZona(e, 11190.94), 320)
  assert.equal(diametroDaZona(e, 11430.94), 175)
  assert.equal(diametroDaZona(e, 12000), 30)
})

test('mostrar a mesma morte em cenas sobrepostas não consome o evento original', () => {
  const eventos = [{ tipo: 'morte', quem: 'Claude', t: 10 }]
  const a = mortesDaCena(eventos, ['Claude'], 9, 12)
  a[0].feito = true; a[0].camera = true
  const b = mortesDaCena(eventos, ['Claude'], 8, 11)
  assert.equal(b[0].feito, false)
  assert.equal(b[0].camera, false)
  assert.equal(eventos[0].feito, undefined)
})
