// Fecha a zona (borda do mundo) em volta da arena, como num battle royale: as IAs cavaram e fugiram da caixa de vidro
// e a batalha final parou. Uso: node zona.mjs <gravação> <raio inicial> <raio final> <segundos>
import fs from 'node:fs'
import path from 'node:path'
import { rcon } from './rcon.mjs'
const [DIR, R0, R1, SEG] = process.argv.slice(2)
const cmd = rcon()
const est = JSON.parse(fs.readFileSync(path.join(DIR, 'estado.json'), 'utf8'))
const t = est.decorrido + (Date.now() - fs.statSync(path.join(DIR, 'estado.json')).mtimeMs) / 1000
for (const c of ['worldborder center 0 0', `worldborder set ${2 * R0}`, 'worldborder damage buffer 0', 'worldborder damage amount 1', 'worldborder warning distance 12', `worldborder set ${2 * R1} ${SEG}`])
  console.log(c, '->', await cmd(c))
const aviso = `A ZONA ESTÁ FECHANDO! Em ${Math.round(SEG / 60)} minutos só vai sobrar o centro da arena (x 0, z 0, raio ${R1}). Quem ficar fora da borda toma dano.`
console.log(await cmd(`say ${aviso}`))
fs.appendFileSync(path.join(DIR, 'eventos.jsonl'), JSON.stringify({ t: Math.round(t * 100) / 100, tipo: 'zona', de: Number(R0), ate: Number(R1), segundos: Number(SEG), aviso }) + '\n')
process.exit(0)
