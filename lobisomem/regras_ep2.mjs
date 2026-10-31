import fs from 'node:fs'
export const CONFIG = JSON.parse(fs.readFileSync(new URL('./elenco_ep2.json', import.meta.url), 'utf8'))
export const LOBO = p => ['lobisomem','lobo_vidente','lobo_alfa'].includes(p)
export const PAPEIS_VALIDOS = new Set(['lobisomem','lobo_vidente','vidente','medico','carcereiro','pistoleiro','bobo','aldeao','padre','xerife','vidente_espiritual','detetive','prefeito','lobo_alfa'])
export function validarElenco(config = CONFIG) {
  if (config.players.length !== 16 || config.roles.length !== 16) throw new Error('EP2 requer 16 jogadores e 16 papéis')
  if (new Set(config.players.map(p => p.id)).size !== 16 || new Set(config.players.map(p => p.nome)).size !== 16) throw new Error('IDs e nomes devem ser únicos')
  if (config.roles.filter(LOBO).length !== 4 || config.roles.filter(p => p === 'bobo').length !== 1) throw new Error('Distribuição exige 4 lobos e 1 Bobo')
  if (config.roles.some(p => !PAPEIS_VALIDOS.has(p))) throw new Error('Papel sem implementação')
  for (const p of PAPEIS_VALIDOS) if (!['lobisomem','aldeao'].includes(p) && config.roles.filter(x=>x===p).length>1) throw new Error('Poder único repetido: '+p)
  for (const p of config.players) if (!config.pricesPerMillion[p.modelId]) throw new Error('Modelo sem preço conferido: '+p.modelId)
}
// Resultado da água benta: quem morre, nunca uma conversão de equipe.
export function resolverAguaBenta(padre, alvo) {
  if (padre?.papel !== 'padre' || !padre.vivo || !alvo?.vivo || padre === alvo) throw new Error('Água benta inválida')
  return {morto: LOBO(alvo.papel) ? alvo : padre, acertou: LOBO(alvo.papel)}
}
export function espiritoMatou(alvos, autores) {
  return alvos.some(nome=>autores.has(nome))
}
// Cada registro de morte tem um executor. A outra opção não executou aquela morte;
// pode ser lobo: esta pista não confirma que seja um aldeão.
export function suspeitosXerife(vitima, observador, mortes, jogadores, rnd) {
  const morte = mortes.find(m=>m.nome===vitima && m.autor)
  if (!morte) return null
  const outros = jogadores.filter(j=>j.vivo && j.nome!==observador && j.nome!==morte.autor && j.nome!==vitima)
  if (!outros.length) return null
  const par = [morte.autor, outros[Math.floor(rnd()*outros.length)].nome]
  return rnd()<.5 ? par : par.reverse()
}
export function parceirosLobos(lobos, eu, nomes) {
  return lobos.filter(j => j !== eu).map(j => `${j.nome} (${nomes[j.papel]})`).join(', ')
}
export function escolherAlvoLobos(votos, rnd) {
  if (!votos.length) return null
  const contagem = new Map()
  for (const nome of votos) contagem.set(nome, (contagem.get(nome) ?? 0) + 1)
  const maximo = Math.max(...contagem.values())
  const empatados = [...contagem].filter(([, n]) => n === maximo).map(([nome]) => nome).sort()
  return empatados[Math.floor(rnd() * empatados.length)]
}
export function vencedor(js) {
  const vivos = js.filter(j => j.vivo)
  const lobos = vivos.filter(j => LOBO(j.papel)).length
  if (lobos === 0) return 'aldeia'
  if (lobos >= vivos.length - lobos) return 'lobos'
  return null
}
validarElenco()

export const timePapel = p => LOBO(p) ? 'lobos' : p === 'bobo' ? 'bobo' : 'aldeia'
export const mesmoTime = (a,b) => timePapel(a) === timePapel(b)
export const pesoVoto = j => j.papel === 'prefeito' && j.prefeitoRevelado ? 2 : 1
export function votosAtaque(lobos,chat) {
 return lobos.flatMap(l=>{const alvo=[...chat].reverse().find(m=>m.nome===l.nome)?.alvo;return alvo?Array(l.papel==='lobo_alfa'?2:1).fill(alvo):[]})
}
