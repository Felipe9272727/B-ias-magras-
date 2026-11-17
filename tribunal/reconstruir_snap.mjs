// Monta o ponto de retomada (_snap) de um log antigo do farol.mjs (antes de existir checkpoint): volta para o começo
// da última testemunha chamada (ou do último dia), recalculando provas, cadeados e paciência pelos eventos.
// Uso: node reconstruir_snap.mjs logs/farol_X.json
import fs from 'node:fs'
import { IAS, FIXOS, RODADAS, PROVAS, PERFIS, LOCAIS, CADEADOS } from './farol_caso.mjs'
const f = process.argv[2]
const log = JSON.parse(fs.readFileSync(f, 'utf8'))
const P = { ...FIXOS, ...RODADAS[log.advogado] }
const nomeP = (k) => IAS[P[k]].nome
const sub = (s) => String(s).replaceAll('{CULPADO}', nomeP('culpado'))
const ev = log.eventos
// ponto: última 'chamada' (testemunha) ou último 'dia'
let corte = -1, ponto = null
for (let i = ev.length - 1; i >= 0; i--) {
  if (ev[i].tipo === 'chamada') { const d = ev[i].dia, ts = d === 2 ? ['vigia', 'culpado'] : ['culpado', 'pescador']; const k = Object.keys(P).find((x) => P[x] === ev[i].cor); corte = i; ponto = { e: d === 2 ? 1 : 3, s: ts.indexOf(k) + 1 }; break }
  if (ev[i].tipo === 'dia') { corte = i; const d = ev[i].dia; ponto = { e: { 1: 0, 2: 1, 3: 2, 4: 3 }[d], s: 0 }; break }
}
const antes = ev.slice(0, corte)
const todas = [...LOCAIS[1], ...LOCAIS[3]].map((l) => l.prova).concat(Object.values(CADEADOS).map((c) => c.revela))
const registro = [...PROVAS, ...PERFIS(nomeP).map((p) => ({ ...p, desc: sub(p.desc) }))]
for (const e of antes) {
  if (e.tipo === 'nova_prova') { const p = todas.find((x) => x.id === e.prova); if (p) registro.push({ ...p, desc: sub(p.desc), soDefesa: true }) }
  if (e.tipo === 'prova_apresentada') { const p = registro.find((x) => x.id === e.prova); if (p) p.soDefesa = false }
}
if (antes.some((e) => e.tipo === 'dia' && e.dia === 3)) { const pf = registro.find((p) => p.id === 'PF4'); pf.desc += ' Hoje apareceu com a mão direita enfaixada.' }
const locks = Object.fromEntries(Object.entries(CADEADOS).map(([k, v]) => [k, { ...v, quebrados: [], descoberto: false, revela: { ...v.revela, desc: sub(v.revela.desc) } }]))
let pac = 6
for (const e of antes) {
  const k = Object.keys(P).find((x) => P[x] === e.cor)
  if (e.tipo === 'cadeados' && locks[k]) locks[k].descoberto = true
  if (e.tipo === 'cadeado_quebrado' && locks[k]) { locks[k].quebrados.push(e.prova); locks[k].descoberto = true }
  if (e.tipo === 'penalidade') { const m = String(e.fala).match(/paciência do juiz (\d+)/); if (m) pac = Number(m[1]) }
  if (e.tipo === 'nova_prova' && /^R\d/.test(e.prova)) pac = Math.min(6, pac + 1)
}
const susp = [...antes].reverse().find((e) => e.tipo === 'suspeita')
log._snap = { ponto, nEventos: corte, paciencia: pac, dia: ev[corte]?.dia ?? 1, registro, locks, suspeito: susp?.acusado ?? null, adiar: false, passado: null }
fs.writeFileSync(f, JSON.stringify(log, null, 1))
console.log(f, 'ponto', JSON.stringify(ponto), 'eventos mantidos', corte, 'paciência', pac, 'provas', registro.map((p) => p.id).join(','))
