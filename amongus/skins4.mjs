// Among Us 4: cada IA escolhe a própria skin (1 item de cabeça, 1 roupa e 1 pet) antes da temporada, pela própria
// empresa (o mesmo provider que joga a cor). O catálogo é o que o Crewmate4 desenha (cosmeticos.ts e roupas4.tsx).
// Na 1ª rodada (logs4/skins_rodada1.json), escolhendo todas ao mesmo tempo, as 15 pegaram o robozinho de pet. Por isso
// agora elas escolhem uma de cada vez, em ordem sorteada, vendo o que já foi pego: cada item de cabeça e cada roupa
// pode aparecer no máximo 2 vezes, e cada pet no máximo 3.
// Grava logs4/skins.json; o vídeo só lê. Uso: node skins4.mjs [--temporada logs4/temporada.json] [--mock]
import fs from 'node:fs'
import { perguntar, lerJSON, uso } from './ia.mjs'

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : null)).filter(Boolean))
const TEMPORADA = JSON.parse(fs.readFileSync(args.temporada ?? 'logs4/temporada.json', 'utf8'))
const SAIDA = args.saida ?? 'logs4/skins.json'
const NOMES = { haiku: 'Claude Haiku', 'or:openai/gpt-5.6-luna': 'GPT-5.6 Luna', 'or:qwen/qwen3.8-flash': 'Qwen 3.8 Flash', 'or:z-ai/glm-5.3-flash': 'GLM 5.3 Flash', 'or:deepseek/deepseek-v4.1-flash': 'DeepSeek Flash', 'or:minimax/minimax-m3': 'MiniMax M3', 'or:minimax/minimax-m3.1-flash:free': 'MiniMax M3.1 Flash', 'or:mistralai/ministral-14b-2512': 'Ministral 14B', 'or:qwen/qwen3.8-27b': 'Qwen 3.8 27B' }

export const CABECA = { coroa: 'Coroa', chapeu_chef: 'Chapéu de chef', cartola: 'Cartola', bone: 'Boné', capacete: 'Capacete de obra', bandana: 'Bandana', chifrinhos: 'Chifrinhos', folhinha: 'Folhinha', oculos_escuros: 'Óculos escuros', fones: 'Fones de ouvido', bigode: 'Bigode', tapa_olho: 'Tapa-olho', antena: 'Antena', aureola: 'Auréola', laco_mochila: 'Laço na mochila' }
export const ROUPAS = { jaleco: 'Jaleco de cientista', terno: 'Terno e gravata', macacao: 'Macacão de mecânico', havaiana: 'Camisa havaiana', capa: 'Capa de herói', avental: 'Avental de cozinheiro', moletom: 'Moletom com capuz', colete: 'Colete salva-vidas', smoking: 'Smoking com gravata-borboleta', pijama: 'Pijama listrado' }
export const PETS = { mini_tripulante: 'Mini tripulante', cachorro: 'Cachorrinho', gato: 'Gatinho', robo: 'Robozinho', passarinho: 'Passarinho', slime: 'Slime' }

const LIMITE = { cabeca: 2, roupa: 2, pet: 3 }
const usados = { cabeca: {}, roupa: {}, pet: {} }
const livres = (o, k) => Object.fromEntries(Object.entries(o).filter(([id]) => (usados[k][id] ?? 0) < LIMITE[k]))
const lista = (o) => Object.entries(o).map(([id, n]) => `${id} (${n})`).join(', ')
const escolhe = (o, v) => (Object.hasOwn(o, String(v ?? '').trim()) ? String(v).trim() : null)

async function main() {
  const cores = Object.keys(TEMPORADA.cores)
  // --so Cor: refaz só a escolha dessa cor (ex.: a chamada falhou), mantendo as outras e os limites
  const skins = args.so ? JSON.parse(fs.readFileSync(SAIDA, 'utf8')).skins : {}
  if (args.so) { delete skins[args.so]; for (const x of Object.values(skins)) for (const k of ['cabeca', 'roupa', 'pet']) if (x[k]) usados[k][x[k]] = (usados[k][x[k]] ?? 0) + 1 }
  const ordem = args.so ? [args.so] : [...cores].sort(() => Math.random() - 0.5)
  for (const cor of ordem) skins[cor] = await (async () => {
    const prov = args.mock ? 'mock' : TEMPORADA.cores[cor]
    const sistema = `Você é a IA ${NOMES[TEMPORADA.cores[cor]] ?? TEMPORADA.cores[cor]} e vai jogar uma temporada de AMONG US (versão em texto, num vídeo do YouTube) com a cor ${cor}, contra outras 14 IAs. Responda em português do Brasil.`
    const [C, R, P] = [livres(CABECA, 'cabeca'), livres(ROUPAS, 'roupa'), livres(PETS, 'pet')]
    const ja = Object.entries(skins).map(([c, x]) => `${c}: ${CABECA[x.cabeca]} + ${ROUPAS[x.roupa]} + ${PETS[x.pet]}`).join('; ')
    const prompt = `Antes de começar, escolha o SEU visual. Ele aparece no vídeo o tempo todo, então escolha algo que tenha a sua cara (o público vai te reconhecer por ele).${ja ? `\nQuem já escolheu: ${ja}. Os itens que esgotaram não aparecem mais na lista.` : ''}\n\nCABEÇA (escolha 1): ${lista(C)}\nROUPA (escolha 1): ${lista(R)}\nPET (escolha 1, ele anda do seu lado): ${lista(P)}\n\nResponda SÓ com JSON: {"cabeca": "<id>", "roupa": "<id>", "pet": "<id>", "motivo": "<1 frase curta e divertida explicando o seu visual, em primeira pessoa>"}`
    const r = await perguntar(prov, sistema, prompt, { maxTokens: 200, mock: () => JSON.stringify({ cabeca: 'coroa', roupa: 'terno', pet: 'gato', motivo: 'teste' }) })
    const d = lerJSON(r.text) ?? {}
    const s = { modelo: NOMES[TEMPORADA.cores[cor]], cabeca: escolhe(C, d.cabeca), roupa: escolhe(R, d.roupa), pet: escolhe(P, d.pet), motivo: String(d.motivo ?? '').slice(0, 200), ordem: Object.keys(skins).length + 1 }
    for (const k of ['cabeca', 'roupa', 'pet']) if (s[k]) usados[k][s[k]] = (usados[k][s[k]] ?? 0) + 1
    console.log(`${cor.padEnd(9)} ${String(s.modelo).padEnd(16)} ${s.cabeca} + ${s.roupa} + ${s.pet} — ${s.motivo}`)
    return s
  })()
  fs.writeFileSync(SAIDA, JSON.stringify({ skins, uso }, null, 1))
  const ruins = Object.entries(skins).filter(([, s]) => !s.cabeca || !s.roupa || !s.pet).map(([c]) => c)
  console.log(ruins.length ? `⚠️ escolha inválida (rodar de novo para estas cores): ${ruins.join(', ')}` : '✅ todas as 15 escolheram', `| chamadas ${uso.chamadas}, falhas ${uso.falhas}`)
}
main()
