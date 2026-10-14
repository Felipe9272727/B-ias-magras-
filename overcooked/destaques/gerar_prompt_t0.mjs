import {Partida} from '/home/user/B-ias-magras-/overcooked/cozinha.mjs'
import {FASES} from '/home/user/B-ias-magras-/overcooked/fases.mjs'
const pt = new Partida({fase: FASES.v1, nome: 'DeepSeek', seed: 2026, rival: true, chefs: [{nome: 'Deep', provider: 'deepseek'}, {nome: 'Seek', provider: 'deepseek'}]})
pt.tique = 0; pt.atualizarPedidos()
const ch = pt.chefs[0]
console.log('=== SISTEMA ===\n' + pt.sistema(ch))
console.log('=== PROMPT ===\n' + pt.prompt(ch, pt.acoes(ch), 'DeepSeek 0 | Claude 0 | GPT 0 | Gemini 0'))
