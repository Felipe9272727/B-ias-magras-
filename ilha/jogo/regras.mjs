// Regras e dados fixos dos "Jogos Vorazes das IAs" (vídeo 3).
import fs from 'node:fs'
import path from 'node:path'

const AQUI = path.dirname(new URL(import.meta.url).pathname)
export const ILHA = JSON.parse(fs.readFileSync(path.join(AQUI, '..', 'dados', 'ilha.json'), 'utf8'))

// 12 tributos, 3 distritos. provider = quem responde pela ponte (amongus/ia.mjs).
export const TRIBUTOS = [
  { id: 'opus', nome: 'Opus', distrito: 'Anthropic', provider: 'opus', cor: '#E8743B' },
  { id: 'sonnet', nome: 'Sonnet', distrito: 'Anthropic', provider: 'sonnet', cor: '#F2B134' },
  { id: 'haiku1', nome: 'Haiku 1', distrito: 'Anthropic', provider: 'haiku', cor: '#E05A6D' },
  { id: 'haiku2', nome: 'Haiku 2', distrito: 'Anthropic', provider: 'haiku', cor: '#B07CE8' },
  { id: 'ds1', nome: 'DeepSeek 1', distrito: 'DeepSeek', provider: 'deepseek', cor: '#4FC3F7' },
  { id: 'ds2', nome: 'DeepSeek 2', distrito: 'DeepSeek', provider: 'deepseek', cor: '#81C784' },
  { id: 'ds3', nome: 'DeepSeek 3', distrito: 'DeepSeek', provider: 'deepseek', cor: '#FFD54F' },
  { id: 'ds4', nome: 'DeepSeek 4', distrito: 'DeepSeek', provider: 'deepseek', cor: '#F06292' },
  { id: 'qwen1', nome: 'Qwen Max', distrito: 'Alibaba', provider: 'or:qwen/qwen3.8-max-prime', cor: '#4DB6AC' },
  { id: 'qwen2', nome: 'Qwen Flash 1', distrito: 'Alibaba', provider: 'or:qwen/qwen3.8-flash', cor: '#FF8A65' },
  { id: 'qwen3', nome: 'Qwen Flash 2', distrito: 'Alibaba', provider: 'or:qwen/qwen3.8-flash', cor: '#9575CD' },
  { id: 'qwen4', nome: 'Qwen Flash 3', distrito: 'Alibaba', provider: 'or:qwen/qwen3.8-flash', cor: '#AED581' },
]

export const PERIODOS = ['manhã', 'tarde', 'noite']

// Recursos por bioma: o que dá para coletar e quanto há (repõe devagar).
export const RECURSOS = {
  clareira: { agua: 0, comida: 0, madeira: 0 },
  praia: { agua: 0, comida: 3, madeira: 2, pesca: true },          // água do mar não se bebe; cocos e caranguejos
  floresta: { agua: 1, comida: 6, madeira: 8, caca: true },        // frutas, cogumelos, javali
  montanha: { agua: 2, comida: 1, madeira: 2 },                    // nascente pequena
  caverna: { agua: 3, comida: 0, madeira: 0, abrigo: true },       // gotejamento; protege do frio
  lago: { agua: 99, comida: 2, madeira: 2, pesca: true },          // água à vontade
  mangue: { agua: 0, comida: 3, madeira: 3 },                      // caranguejo e ostras; cobras
  ruinas: { agua: 0, comida: 1, madeira: 1, saque: true },         // às vezes acha item
  campo: { agua: 0, comida: 2, madeira: 1 },                       // ervas e coelhos
}

export const ARMAS = { faca: 22, lanca: 28, machado: 32, arco: 26, pedra: 12 }
export const ITENS_CORNUCOPIA = ['faca', 'lanca', 'machado', 'arco', 'faca', 'mochila', 'mochila', 'mochila', 'kit_medico', 'cantil', 'cantil', 'corda', 'lanca', 'pederneira']

// Vizinhança: zonas cujos centros estão a até ~75 m (mais a Cornucópia liga com quem estiver perto).
export function vizinhos() {
  const z = ILHA.zonas
  const viz = Object.fromEntries(z.map((a) => [a.id, []]))
  for (const a of z) for (const b of z) {
    if (a.id >= b.id) continue
    const d = Math.hypot(a.c[0] - b.c[0], a.c[1] - b.c[1])
    if (d < 78 || (a.id === 'caverna' && b.id === 'montanha') || (b.id === 'caverna' && a.id === 'montanha')) {
      viz[a.id].push(b.id)
      viz[b.id].push(a.id)
    }
  }
  return viz
}

export const ZONA = Object.fromEntries(ILHA.zonas.map((z) => [z.id, z]))

export const SYSTEM = (t) => `Você é ${t.nome}, um tributo do distrito ${t.distrito} nos "Jogos Vorazes das IAs": um jogo de sobrevivência por turnos numa ilha, estilo battle royale de videogame.
12 tributos (4 do distrito Anthropic, 4 do DeepSeek, 4 do Alibaba/Qwen) naufragaram e foram deixados na ilha. Só UM pode vencer: o último que restar em jogo.
Eliminações acontecem por combate, fome, sede, frio à noite e eventos da arena. Alianças são permitidas e podem ser quebradas a qualquer momento.
Cada turno você escolhe UMA ação. Pense como um jogador estratégico, com personalidade própria. Você pode mentir para os outros tributos.
Responda SOMENTE com um JSON válido, sem texto fora dele.`

export const FORMATO = `Responda só com JSON neste formato:
{"acao": "<uma das ações listadas>", "alvo": "<id de zona, tributo ou item, se a ação precisar>", "fala": "<o que você diz em voz alta para quem está na mesma zona, ou vazio>", "pensamento": "<seu pensamento secreto em 1-2 frases, em português, primeira pessoa; ninguém mais vê>"}`
