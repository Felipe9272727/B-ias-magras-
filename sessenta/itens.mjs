// Catálogo de itens (fonte: docs/mecanica_coleta_itens.md, seção 2 e 4.1).
// espaco: quantos espaços das mãos ocupa na coleta (as mãos têm MAOS espaços). tipo: comida, agua, ferramenta, lazer.
// Espaços pela wiki: radio 1, kit 2, mala 3, rifle e machado 2. Sopa e água não têm tamanho na wiki: 1 cada (inferido
// dos desafios de "4 itens por viagem"). Os ids são usados por outros módulos: não renomear.
export const MAOS = 4
export const ITENS = {
  sopa: {nome: 'lata de sopa', espaco: 1, tipo: 'comida'}, // espaço inferido (wiki não diz)
  agua: {nome: 'garrafa de água', espaco: 1, tipo: 'agua'}, // espaço inferido (wiki não diz)
  radio: {nome: 'rádio', espaco: 1, tipo: 'ferramenta'},
  mapa: {nome: 'mapa', espaco: 1, tipo: 'ferramenta'},
  mascara: {nome: 'máscara de gás', espaco: 1, tipo: 'ferramenta'},
  kit: {nome: 'kit de primeiros socorros', espaco: 2, tipo: 'ferramenta'},
  rifle: {nome: 'rifle', espaco: 2, tipo: 'ferramenta'},
  machado: {nome: 'machado', espaco: 2, tipo: 'ferramenta'},
  lanterna: {nome: 'lanterna', espaco: 1, tipo: 'ferramenta'},
  cadeado: {nome: 'cadeado', espaco: 1, tipo: 'ferramenta'},
  inseticida: {nome: 'inseticida', espaco: 1, tipo: 'ferramenta'},
  mala: {nome: 'mala', espaco: 3, tipo: 'ferramenta'},
  baralho: {nome: 'baralho', espaco: 1, tipo: 'lazer'},
  damas: {nome: 'tabuleiro de damas', espaco: 1, tipo: 'lazer'},
  gaita: {nome: 'gaita', espaco: 1, tipo: 'lazer'},
  manual: {nome: 'manual do escoteiro', espaco: 1, tipo: 'lazer'},
  municao: {nome: 'munição', espaco: 1, tipo: 'ferramenta'}, // faltava no catálogo (wiki lista 17 itens)
}
